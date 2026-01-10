import { useEffect, useState } from "react";
import { getToken, logout } from "../services/authService";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);


  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    level: "junior",
  });



// ---------------- FETCH EMPLOYEES ----------------
const fetchEmployees = async () => {
  const token = getToken();
  if (!token) {
    setError("Authentication required");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const params = new URLSearchParams({
      page,
      limit,
      search,
      level,
    });

    const res = await fetch(`${API}/employees?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch employees");
    }

    setEmployees(data.data || []);
    setTotal(data.total || 0);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchEmployees();
}, [page, search, level]);

// ---------------- ADD EMPLOYEE ----------------
const addEmployee = async (e) => {
  e.preventDefault();
  const token = getToken();

  try {
    const res = await fetch(`${API}/employees`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    setForm({ name: "", email: "", company: "", level: "junior" });
    setPage(1); // ✅ reset pagination
    fetchEmployees();
  } catch (err) {
    alert(err.message);
  }
};

// ---------------- DELETE EMPLOYEE ----------------
const deleteEmployee = async (id) => {
  if (!window.confirm("Delete this employee?")) return;

  try {
    const res = await fetch(`${API}/employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    fetchEmployees();
  } catch (err) {
    alert(err.message);
  }
};

  // ---------------- PAGINATION ----------------
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "40px 20px",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto"
      }}>
        {/* Header */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <h1 style={{
            margin: 0,
            fontSize: "32px",
            fontWeight: "700",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Employee Dashboard
          </h1>
          <button
            onClick={logout}
            style={{
              padding: "12px 28px",
              background: "#f43f5e",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(244, 63, 94, 0.3)"
            }}
            onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
            onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
          >
            Logout
          </button>
        </div>

        {/* Add Employee Form */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
        }}>
          <h2 style={{
            margin: "0 0 24px 0",
            fontSize: "20px",
            fontWeight: "600",
            color: "#1f2937"
          }}>
            Add New Employee
          </h2>
          <form onSubmit={addEmployee} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}>
            <input
              placeholder="Name"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{
                padding: "14px 18px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            <input
              placeholder="Email"
              value={form.email}
              required
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                padding: "14px 18px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            <input
              placeholder="Company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              style={{
                padding: "14px 18px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            />
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              style={{
                padding: "14px 18px",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "15px",
                transition: "all 0.3s ease",
                outline: "none",
                cursor: "pointer",
                background: "white"
              }}
              onFocus={(e) => e.target.style.borderColor = "#667eea"}
              onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
            >
              <option value="junior">Junior</option>
              <option value="senior">Senior</option>
            </select>
            <button
              type="submit"
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
              }}
              onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
              onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
            >
              Add Employee
            </button>
          </form>
        </div>

        {/* Search & Filter */}
        <div style={{
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "20px",
          padding: "24px 32px",
          marginBottom: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap"
        }}>
          <input
            placeholder="Search by name, email, company..."
            value={debouncedSearch}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: "1",
              minWidth: "250px",
              padding: "14px 18px",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "15px",
              transition: "all 0.3s ease",
              outline: "none"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            style={{
              padding: "14px 18px",
              border: "2px solid #e5e7eb",
              borderRadius: "12px",
              fontSize: "15px",
              transition: "all 0.3s ease",
              outline: "none",
              cursor: "pointer",
              background: "white",
              minWidth: "150px"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          >
            <option value="">All Levels</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
          </select>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: "#fee2e2",
            border: "2px solid #f87171",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "24px",
            color: "#dc2626",
            fontSize: "15px",
            fontWeight: "500"
          }}>
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "60px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e5e7eb",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{
              marginTop: "20px",
              color: "#6b7280",
              fontSize: "16px"
            }}>
              Loading employees...
            </p>
          </div>
        )}

        {/* Employee List */}
        {!loading && employees.length > 0 && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "32px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
          }}>
            <h2 style={{
              margin: "0 0 24px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937"
            }}>
              Employees ({total})
            </h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 12px"
              }}>
                <thead>
                  <tr>
                    <th style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Name</th>
                    <th style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Email</th>
                    <th style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Company</th>
                    <th style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Level</th>
                    <th style={{
                      textAlign: "center",
                      padding: "12px 16px",
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} style={{
                      background: "white",
                      transition: "all 0.3s ease"
                    }}>
                      <td style={{
                        padding: "18px 16px",
                        borderTop: "1px solid #f3f4f6",
                        borderBottom: "1px solid #f3f4f6",
                        borderLeft: "1px solid #f3f4f6",
                        borderTopLeftRadius: "12px",
                        borderBottomLeftRadius: "12px",
                        fontSize: "15px",
                        fontWeight: "500",
                        color: "#1f2937"
                      }}>{emp.name}</td>
                      <td style={{
                        padding: "18px 16px",
                        borderTop: "1px solid #f3f4f6",
                        borderBottom: "1px solid #f3f4f6",
                        fontSize: "15px",
                        color: "#6b7280"
                      }}>{emp.email}</td>
                      <td style={{
                        padding: "18px 16px",
                        borderTop: "1px solid #f3f4f6",
                        borderBottom: "1px solid #f3f4f6",
                        fontSize: "15px",
                        color: "#6b7280"
                      }}>{emp.company || "—"}</td>
                      <td style={{
                        padding: "18px 16px",
                        borderTop: "1px solid #f3f4f6",
                        borderBottom: "1px solid #f3f4f6",
                        fontSize: "15px"
                      }}>
                        <span style={{
                          display: "inline-block",
                          padding: "6px 14px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                          background: emp.level === "senior" ? "#dbeafe" : "#f3e8ff",
                          color: emp.level === "senior" ? "#1e40af" : "#6b21a8"
                        }}>
                          {emp.level}
                        </span>
                      </td>
                      <td style={{
                        padding: "18px 16px",
                        borderTop: "1px solid #f3f4f6",
                        borderBottom: "1px solid #f3f4f6",
                        borderRight: "1px solid #f3f4f6",
                        borderTopRightRadius: "12px",
                        borderBottomRightRadius: "12px",
                        textAlign: "center"
                      }}>
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          style={{
                            padding: "8px 20px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#dc2626";
                            e.target.style.color = "white";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "#fee2e2";
                            e.target.style.color = "#dc2626";
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb"
            }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                style={{
                  padding: "10px 20px",
                  background: page === 1 ? "#f3f4f6" : "white",
                  color: page === 1 ? "#9ca3af" : "#374151",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: page === 1 ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  if (page !== 1) e.target.style.borderColor = "#667eea";
                }}
                onMouseOut={(e) => {
                  if (page !== 1) e.target.style.borderColor = "#e5e7eb";
                }}
              >
                Previous
              </button>
              <span style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: "600"
              }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                style={{
                  padding: "10px 20px",
                  background: page === totalPages ? "#f3f4f6" : "white",
                  color: page === totalPages ? "#9ca3af" : "#374151",
                  border: "2px solid #e5e7eb",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: page === totalPages ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease"
                }}
                onMouseOver={(e) => {
                  if (page !== totalPages) e.target.style.borderColor = "#667eea";
                }}
                onMouseOut={(e) => {
                  if (page !== totalPages) e.target.style.borderColor = "#e5e7eb";
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && employees.length === 0 && (
          <div style={{
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "20px",
            padding: "60px 32px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)"
          }}>
            <div style={{
              fontSize: "64px",
              marginBottom: "16px"
            }}>👥</div>
            <h3 style={{
              margin: "0 0 12px 0",
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937"
            }}>
              No employees found
            </h3>
            <p style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "15px"
            }}>
              Add your first employee using the form above
            </p>
          </div>
        )}
      </div>
    </div>
  );
}