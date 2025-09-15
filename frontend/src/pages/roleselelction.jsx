// frontend/src/pages/RoleSelection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * RoleSelection page:
 * - Shows three buttons (normal / owner / admin)
 * - When user clicks a button, it calls the set-role API (your fetch)
 * - On success it stores returned info and redirects to the appropriate dashboard
 */
export default function RoleSelection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSelectRole(selectedRole) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in.");
        navigate("/login");
        return;
      }

      // <-- This is where your fetch goes
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/set-role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ role: selectedRole })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = data.msg || data.message || "Could not set role";
        alert(err);
        return;
      }

      // If backend returns a new token, replace it (recommended)
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Keep a quick frontend copy of the chosen role (optional)
      // NOTE: real access control should rely on token + backend checks
      localStorage.setItem("role", data.role || selectedRole);

      // Redirect to the role-specific dashboard
      if (selectedRole === "admin") {
  navigate("/dashboard/admin");
} else if (selectedRole === "owner") {
  navigate("/dashboard/owner");
} else if (selectedRole === "normal") {
  navigate("/normaldashboard");
} else {
  alert("Please select a valid role");
}


    } catch (err) {
      console.error("Error setting role:", err);
      alert("Network error while setting role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", textAlign: "center", padding: 20 }}>
      <h2>Choose role to continue</h2>
      <p>Select how you want to enter the app for this session.</p>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
        <button onClick={() => handleSelectRole("normal")} disabled={loading} style={{ padding: "12px 18px" }}>
          {loading ? "Processing..." : "Continue as Normal User"}
        </button>

        <button onClick={() => handleSelectRole("owner")} disabled={loading} style={{ padding: "12px 18px" }}>
          {loading ? "Processing..." : "Continue as Store Owner"}
        </button>

        <button onClick={() => handleSelectRole("admin")} disabled={loading} style={{ padding: "12px 18px" }}>
          {loading ? "Processing..." : "Continue as System Admin"}
        </button>
      </div>
    </div>
  );
}
