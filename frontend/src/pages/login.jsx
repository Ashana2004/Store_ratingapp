import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../styles/login.css';
import '../styles/card-hover.css';
import '../styles/modal.css';
import { showCenteredAlert } from '../utils/alert';
import sideImage from '../assets/loginimg.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Using the centralized alert utility

  function handleChange(e) {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: "normal" }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = data.msg || data.message || "Login failed";
        showCenteredAlert(err);
        setLoading(false);
        return;
      }

      const token = data.token;
      const user = data.user;

      if (!token || !user) {
        showCenteredAlert("Login succeeded but token/user missing from response.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") navigate("/dashboard/admin");
      else if (user.role === "owner") navigate("/dashboard/owner");
      else navigate("/normaldashboard");

    } catch (err) {
      console.error("Login error:", err);
      showCenteredAlert("Network or server error. See console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
    
    <div className="login-container">
       
      <div class="login-image">
    <img src={sideImage} alt="Login Side" />
    <div class="image-text">WELCOME TO RATIFY!</div>
    </div>
      
      <div className="login-card">
        <div className="login-quadrant"></div>
        <div className="login-header">
          <h2>Login</h2>
          <p>Welcome back! Please login to your account.</p>
        </div>

        {/* 🔹 Interactive hover card */}
        <div className="interactive-card">
          <div className="card-inner">
            {/* --- Front side (cover) --- */}
            <div
              className="card-cover"
              role="button"
              aria-label="Reveal login form"
            >
              <div className="cover-inner">
                <div className="cover-title">Welcome Back</div>
                <div className="cover-sub">Hover or focus to unlock</div>
                <div className="cover-arrow">➜</div>
              </div>
            </div>
   
            {/* --- Back side (actual form) --- */}
            <div className="card-content">
              <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="login-button">
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <p className="signup-link">
          Don’t have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
       
    </div>
     
     
    </>
  );
}
