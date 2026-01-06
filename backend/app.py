from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import jwt, datetime
from functools import wraps

# ---------------- APP CONFIG ----------------
app = Flask(__name__)
app.config["SECRET_KEY"] = "super-secret-key"

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

DB = "database.db"

# ---------------- DB CONNECTION ----------------
def get_db():
    conn = sqlite3.connect(DB, timeout=10, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

# ---------------- INIT DATABASE ----------------
def init_db():
    conn = get_db()

    # Auth table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS auth_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)

    # Employees table (linked to user_id)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            company TEXT,
            level TEXT CHECK(level IN ('junior', 'senior')),
            FOREIGN KEY(user_id) REFERENCES auth_users(id)
        )
    """)

    # Default admin
    conn.execute(
        "INSERT OR IGNORE INTO auth_users (email, password) VALUES (?, ?)",
        ("admin@test.com", generate_password_hash("1234"))
    )

    conn.commit()
    conn.close()

# ---------------- JWT DECORATOR ----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if not auth:
            return jsonify({"error": "Token missing"}), 401
        try:
            token = auth.split(" ")[1]
            payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
            request.user = payload
        except:
            return jsonify({"error": "Invalid or expired token"}), 401
        return f(*args, **kwargs)
    return decorated

# ---------------- REGISTER ----------------
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email & password required"}), 400

    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO auth_users (email, password) VALUES (?, ?)",
            (email, generate_password_hash(password))
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "User already exists"}), 409

    conn.close()
    return jsonify({"message": "Registered successfully"}), 201

# ---------------- LOGIN ----------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    user = conn.execute(
        "SELECT * FROM auth_users WHERE email=?",
        (email,)
    ).fetchone()
    conn.close()

    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "user_id": user["id"],
            "email": user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({"token": token}), 200

# ---------------- DASHBOARD ----------------
@app.route("/dashboard", methods=["GET"])
@token_required
def dashboard():
    return jsonify({
        "message": f"Welcome to your dashboard, {request.user['email']}",
        "user_id": request.user["user_id"],
        "email": request.user["email"]
    })

# ---------------- EMPLOYEES ----------------
@app.route("/employees", methods=["GET", "POST"])
@token_required
def employees():
    conn = get_db()
    user_id = request.user["user_id"]

    # ---------- ADD EMPLOYEE ----------
    if request.method == "POST":
        data = request.json
        name = data.get("name")
        email = data.get("email")
        company = data.get("company")
        level = data.get("level")  # junior / senior

        if not name or not email or not level:
            conn.close()
            return jsonify({"error": "Name, email, level required"}), 400

        conn.execute(
            "INSERT INTO employees (user_id, name, email, company, level) VALUES (?, ?, ?, ?, ?)",
            (user_id, name, email, company, level)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Employee added"}), 201

    # ---------- GET EMPLOYEES ----------
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 5))
    search = request.args.get("search", "")
    level_filter = request.args.get("level", "")

    offset = (page - 1) * limit

    query = "SELECT * FROM employees WHERE user_id=?"
    params = [user_id]

    if search:
        query += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)"
        params += [f"%{search}%"] * 3

    if level_filter:
        query += " AND level=?"
        params.append(level_filter)

    total = conn.execute(
        f"SELECT COUNT(*) FROM ({query})",
        params
    ).fetchone()[0]

    query += " LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    rows = conn.execute(query, params).fetchall()
    conn.close()

    return jsonify({
        "data": [dict(r) for r in rows],
        "total": total,
        "page": page,
        "limit": limit
    }), 200

# ---------------- DELETE EMPLOYEE ----------------
@app.route("/employees/<int:id>", methods=["DELETE"])
@token_required
def delete_employee(id):
    conn = get_db()
    user_id = request.user["user_id"]
    cursor = conn.execute("DELETE FROM employees WHERE id=? AND user_id=?", (id, user_id))
    conn.commit()
    conn.close()

    if cursor.rowcount == 0:
        return jsonify({"error": "Employee not found"}), 404

    return jsonify({"message": "Employee deleted"}), 200

# ---------------- RUN ----------------
init_db()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)

