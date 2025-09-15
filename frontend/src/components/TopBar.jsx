import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { showCenteredAlert } from "../utils/alert";

export default function TopBar({ onSearch, showSearch = true, showChangePassword = true }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(false);

  // Using the centralized alert utility instead

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
  }

  function handleSearchChange(e) {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) onSearch(value);
  }

  function handleFieldChange(e) {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showCenteredAlert(data.msg || data.message || "Failed to change password");
        return;
      }
      showCenteredAlert(data.msg || "Password updated successfully");
      setShowChangePwd(false);
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      showCenteredAlert("Network error while changing password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="topbar-container">
      <div className="topbar-content">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">⭐</div>
          <div className="topbar-logo-text">
            <h1 className="topbar-app-name">Ratify!</h1>
            <p className="topbar-tagline">Rate & Review Stores</p>
          </div>
        </div>
        
        {/* {showSearch && (
          <div className="topbar-search">
            <div className="topbar-search-icon"></div>
            <input
              type="text"
              placeholder="Search stores..."
              value={query}
              onChange={handleSearchChange}
              className="topbar-search-input"
            />
          </div>
        )} */}
        
        <div className="topbar-actions">
          {showChangePassword && (
            <button onClick={() => setShowChangePwd(true)} className="topbar-btn">
              <span className="topbar-btn-icon"></span>
              <span className="topbar-btn-text">Change Password</span>
            </button>
          )}
          <button onClick={handleLogout} className="topbar-btn topbar-btn-danger">
            <span className="topbar-btn-icon"></span>
            <span className="topbar-btn-text">Logout</span>
          </button>
        </div>
      </div>

      {showChangePwd && (
        <div className="modal-overlay" onClick={() => setShowChangePwd(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="topbar-modal-header">
              <h3 className="topbar-modal-title">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="topbar-modal-body">
                <div className="topbar-form-group">
                  <label className="topbar-form-label">Current Password</label>
                  <input
                    type="password"
                    className="topbar-form-input"
                    name="currentPassword"
                    value={form.currentPassword}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
                <div className="topbar-form-group">
                  <label className="topbar-form-label">New Password</label>
                  <input
                    type="password"
                    className="topbar-form-input"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleFieldChange}
                    required
                  />
                </div>
              </div>
              <div className="topbar-modal-footer">
                <button 
                  type="button" 
                  className="topbar-modal-btn topbar-modal-btn-secondary"
                  onClick={() => setShowChangePwd(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="topbar-modal-btn topbar-modal-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="topbar-loading-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
