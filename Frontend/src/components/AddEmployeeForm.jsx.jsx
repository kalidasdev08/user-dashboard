import { useState } from "react";
import { getToken } from "../services/authService";

const API = "http://127.0.0.1:5000";

export default function AddEmployeeForm({ onAdded }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    level: "junior",
  });

  const token = getToken();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API}/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to add employee");

      setForm({ name: "", email: "", company: "", level: "junior" });
      onAdded(); // 🔥 refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ margin: "20px 0" }}>
      <input
        placeholder="Name"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder="Email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        placeholder="Company"
        value={form.company}
        onChange={(e) => setForm({ ...form, company: e.target.value })}
      />

      <select
        value={form.level}
        onChange={(e) => setForm({ ...form, level: e.target.value })}
      >
        <option value="junior">Junior</option>
        <option value="senior">Senior</option>
      </select>

      <button type="submit">Add Employee</button>
    </form>
  );
}

