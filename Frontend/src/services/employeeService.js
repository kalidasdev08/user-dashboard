import { getToken } from "./authService";
const API = import.meta.env.VITE_API_URL;

export const addEmployee = async (data) => {
  const token = getToken();

  const res = await fetch(`${API}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json(); // ✅ parse once
  if (!res.ok) {
    throw new Error(result.error || "Failed to add employee");
  }

  return result;
};

export const getEmployees = async (params) => {
  const token = getToken();
  const query = new URLSearchParams(params);

  const res = await fetch(`${API}/employees?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (!res.ok) {
    throw new Error(result.error || "Failed to fetch employees");
  }

  return result;
};
