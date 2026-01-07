const API = import.meta.env.VITE_API_URL;

// -------- DASHBOARD --------
export async function getDashboard() {
  const token = getToken();
  const res = await fetch(`${API}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard");
  return res.json();
}

// -------- LOGIN --------
export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Login failed");
  }


  localStorage.setItem("token", data.token);
}

// -------- REGISTER --------
export async function register(email, password) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Registration failed");
  }

  const data = await res.json();
  return data;
}

// -------- LOGOUT --------
export function logout() {
  localStorage.removeItem("token");
  window.location.reload(); // optional: redirect to login page
}

// -------- GET TOKEN --------
export function getToken() {
  return localStorage.getItem("token");
}
