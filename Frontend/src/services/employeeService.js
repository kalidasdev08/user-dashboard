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

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to add employee");
  }

  return res.json();
};
