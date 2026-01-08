const API = import.meta.env.VITE_API_URL;

// -------- GET TOKEN --------
export function getToken() {
  return localStorage.getItem("token");
}

// -------- LOGOUT --------
export function logout() {
  localStorage.removeItem("token");
  window.location.reload();
}

// -------- LOGIN --------
export async function login(email, password) {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json(); // ✅ parse once
  if (!res.ok) {
    throw new Error(data.error || "Login failed");
  }

  localStorage.setItem("token", data.token);
  return data;
}

// -------- REGISTER --------
export async function register(email, password) {
  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json(); // ✅ parse once
  if (!res.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

// -------- DASHBOARD --------
export async function getDashboard() {
  const token = getToken();
  const res = await fetch(`${API}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch dashboard");
  }

  return data;
}
