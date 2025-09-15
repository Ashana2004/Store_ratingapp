import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/signup.css';
import '../styles/card-hover.css';
import '../styles/modal.css';
import { showCenteredAlert } from '../utils/alert';
import { Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    const { username, email, password, address } = formData;
    if (username.length < 20 || username.length > 60) {
      showCenteredAlert("Name must be between 20 and 60 characters");
      return false;
    }
    if (address && address.length > 400) {
      showCenteredAlert("Address must be at most 400 characters");
      return false;
    }
    if (password.length < 8 || password.length > 16) {
      showCenteredAlert("Password must be 8-16 characters");
      return false;
    }
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    if (!hasUpperCase || !hasSpecialChar) {
      showCenteredAlert("Password must include at least one uppercase letter and one special character");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showCenteredAlert("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = data.msg || data.message || "Signup failed";
        showCenteredAlert(errMsg);
      } else {
        showCenteredAlert(data.msg || data.message || "Signup successful");
        navigate("/");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showCenteredAlert("Network or server error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join us by creating your account</p>
        </div>

        <div className="interactive-card">
          <div className="card-cover" role="button" aria-label="Reveal signup form">
            <div className="cover-inner">
              <div className="cover-title">Create Your Account</div>
              <div className="cover-sub">Hover or focus to fill</div>
              <div className="cover-arrow">➜</div>
            </div>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="username"
                placeholder="Enter your full name"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            {/* <div className="form-group">
              <label className="form-label">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">-- Select Role --</option>
                <option value="normal">Normal User</option>
                
                
              </select>
            </div> */}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              className="signup-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing up...
                </>
              ) : (
                "Signup"
              )}
            </button>
          </form>
        </div>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <Link to="/" className="signup-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
