import React, { useEffect, useMemo, useState } from "react";
import { IoLocation } from "react-icons/io5";
import TopBar from "../components/TopBar";
import "../styles/admindashboard.css";
import "../styles/modal.css";
import { showCenteredAlert } from "../utils/alert";
import { BsStars } from "react-icons/bs";



function TextInput({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label>{label}</label><br />
      <input name={name} type={type} value={value} onChange={onChange} style={{ width: "100%" }} />
    </div>
  );
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState("users"); // users | adminUsers | stores

  // filters and sorting
  const [filters, setFilters] = useState({ username: "", email: "", address: "", role: "" });
  const [storeFilters, setStoreFilters] = useState({ name: "", address: "", owner: "" });
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  // lists
  const [users, setUsers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [stores, setStores] = useState([]);

  // modal state
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showAddStore, setShowAddStore] = useState(false);
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", address: "", password: "" });
  const [storeForm, setStoreForm] = useState({ name: "", address: "", ownerId: "" });
  const [ownerForm, setOwnerForm] = useState({ username: "", email: "", address: "", password: "" });
  const [storeOwners, setStoreOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  function resetForms() {
    setForm({ username: "", email: "", address: "", password: "" });
    setStoreForm({ name: "", address: "", ownerId: "" });
    setOwnerForm({ username: "", email: "", address: "", password: "" });
  }

  function authHeaders() {
    return { "Authorization": "Bearer " + localStorage.getItem("token") };
  }

  // summary
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/dashboard-summary`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok && data.data) setSummary(data.data);
      } catch (e) { console.error(e); }
    }
    fetchSummary();
  }, []);

  // fetch store owners
  useEffect(() => {
    async function fetchStoreOwners() {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/admin-users`, { headers: authHeaders() });
        const data = await res.json();
        if (res.ok) {
          const owners = data.adminUsers.filter(u => u.role === 'owner');
          setStoreOwners(owners);
        }
      } catch (e) { console.error(e); }
    }
    fetchStoreOwners();
  }, []);

  // lists
  async function loadUsers() {
    const params = new URLSearchParams({
      username: filters.username || "",
      email: filters.email || "",
      address: filters.address || "",
      sortBy,
      order
    }).toString();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/users?${params}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setUsers(data.users || []);
  }

  async function loadAdminUsers() {
    const params = new URLSearchParams({
      username: filters.username || "",
      email: filters.email || "",
      address: filters.address || "",
      sortBy,
      order
    }).toString();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/admin-users?${params}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setAdminUsers(data.adminUsers || []);
  }

  async function loadStores() {
    const params = new URLSearchParams({
      name: storeFilters.name || "",
      address: storeFilters.address || "",
      owner: storeFilters.owner || "",
      sortBy,
      order
    }).toString();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/stores?${params}`, { headers: authHeaders() });
    const data = await res.json();
    if (res.ok) setStores(data.stores || []);
  }

  useEffect(() => {
    if (activeTab === "users") loadUsers();
    if (activeTab === "adminUsers") loadAdminUsers();
    if (activeTab === "stores") loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, sortBy, order]);

  // add handlers
  async function handleAddUser(isAdmin) {
    try {
      setLoading(true);
      const endpoint = isAdmin ? "add-admin-user" : "add-user";
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) return showCenteredAlert(data.msg || data.message || "Failed to add user");
      showCenteredAlert(data.msg || "User added");
      resetForms();
      setShowAddUser(false);
      setShowAddAdmin(false);
      if (isAdmin) loadAdminUsers(); else loadUsers();
      // refresh summary counts
      const sRes = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/dashboard-summary`, { headers: authHeaders() });
      const sData = await sRes.json();
      if (sRes.ok && sData.data) setSummary(sData.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  async function handleAddStore() {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/addStore`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(storeForm)
      });
      const data = await res.json();
      if (!res.ok) return showCenteredAlert(data.message || data.msg || "Failed to add store");
      showCenteredAlert(data.message || "Store added");
      resetForms();
      setShowAddStore(false);
      if (activeTab === "stores") loadStores();
      // refresh summary counts
      const sRes = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/dashboard-summary`, { headers: authHeaders() });
      const sData = await sRes.json();
      if (sRes.ok && sData.data) setSummary(sData.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  async function handleCreateOwner() {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/add-store-owner`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(ownerForm)
      });
      const data = await res.json();
      if (!res.ok) return showCenteredAlert(data.message || data.msg || "Failed to create store owner");
      showCenteredAlert(data.message || "Store owner created successfully");
      resetForms();
      setShowCreateOwner(false);
      // Refresh store owners list
      const ownersRes = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/admin-users`, { headers: authHeaders() });
      const ownersData = await ownersRes.json();
      if (ownersRes.ok) {
        const owners = ownersData.adminUsers.filter(u => u.role === 'owner');
        setStoreOwners(owners);
      }
      // refresh summary counts
      const sRes = await fetch(`${import.meta.env.VITE_API_URL}/api/adminroutes/dashboard-summary`, { headers: authHeaders() });
      const sData = await sRes.json();
      if (sRes.ok && sData.data) setSummary(sData.data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }

  function SortHeader({ column, children }) {
    const isActive = sortBy === column;
    const dir = isActive ? (order === "asc" ? "▲" : "▼") : "";
    return (
      <button
        onClick={() => {
          if (sortBy === column) setOrder(order === "asc" ? "desc" : "asc");
          else setSortBy(column);
        }}
        style={{ background: "none", border: "none", cursor: "pointer", fontWeight: isActive ? 700 : 400 }}
      >
        {children} {dir}
      </button>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <TopBar showSearch={false} showChangePassword={false} />
      <div className="admin-dashboard-content">
        <h2 className="admin-dashboard-title">Admin Dashboard</h2>

        <div className="admin-summary-grid">
          <div className="admin-summary-card">
            <div className="admin-summary-card-icon">👥</div>
            <div className="admin-summary-card-value">{summary.totalUsers}</div>
            <div className="admin-summary-card-label">Total Users</div>
          </div>
          <div className="admin-summary-card">
            <div className="admin-summary-card-icon">🏪</div>
            <div className="admin-summary-card-value">{summary.totalStores}</div>
            <div className="admin-summary-card-label">Total Stores</div>
          </div>
          <div className="admin-summary-card">
            <div className="admin-summary-card-icon"><BsStars /></div>
            <div className="admin-summary-card-value">{summary.totalRatings}</div>
            <div className="admin-summary-card-label">Total Ratings</div>
          </div>
        </div>

        <div className="admin-action-buttons">
          <button className="admin-action-btn" onClick={() => { setShowAddUser(true); setShowAddAdmin(false); setShowAddStore(false); }}>➕ Add User</button>
          <button className="admin-action-btn" onClick={() => { setShowAddAdmin(true); setShowAddUser(false); setShowAddStore(false); }}>➕ Add Admin User</button>
          <button className="admin-action-btn" onClick={() => { setShowAddStore(true); setShowAddUser(false); setShowAddAdmin(false); }}>➕ Add Store</button>
        </div>

        <div className="admin-tab-buttons">
          <button className="admin-tab-btn" onClick={() => setActiveTab("users")} disabled={activeTab === "users"}>👥 View Users</button>
          <button className="admin-tab-btn" onClick={() => setActiveTab("adminUsers")} disabled={activeTab === "adminUsers"}>👑 View Admin Users</button>
          <button className="admin-tab-btn" onClick={() => setActiveTab("stores")} disabled={activeTab === "stores"}>🏪 View Stores</button>
        </div>

        {activeTab === "users" && (
          <div>
            <div className="admin-filter-section">
              <div className="admin-filter-grid">
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Name</label>
                  <input className="admin-filter-input" name="username" value={filters.username} onChange={e => setFilters({ ...filters, username: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Email</label>
                  <input className="admin-filter-input" name="email" value={filters.email} onChange={e => setFilters({ ...filters, email: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Address</label>
                  <input className="admin-filter-input" name="address" value={filters.address} onChange={e => setFilters({ ...filters, address: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Sort</label>
                  <select className="admin-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="created_at">Created</option>
                    <option value="username">Name</option>
                    <option value="email">Email</option>
                    <option value="address">Address</option>
                  </select>
                </div>
              </div>
              <div className="admin-filter-actions">
                <button className="admin-filter-btn" onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>{order === "asc" ? "Asc" : "Desc"}</button>
                <button className="admin-filter-btn" onClick={loadUsers}>Apply</button>
              </div>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-table-header">
                      <SortHeader column="username">Name</SortHeader>
                    </th>
                    <th className="admin-table-header">
                      <SortHeader column="email">Email</SortHeader>
                    </th>
                    <th className="admin-table-header">
                      <SortHeader column="address">Address</SortHeader>
                    </th>
                    <th className="admin-table-header">Role</th>
                    <th className="admin-table-header">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="admin-table-row">
                      <td className="admin-table-cell font-semibold">{u.username}</td>
                      <td className="admin-table-cell text-secondary">{u.email}</td>
                      <td className="admin-table-cell text-secondary"><IoLocation style={{ marginRight: "4px", verticalAlign: "middle" }} />{u.address}</td>
                      <td className="admin-table-cell">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' :
                          u.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="admin-table-cell font-bold">{Number(u.avg_rating).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="admin-empty-state">
                <div className="admin-empty-state-icon">👥</div>
                <div className="admin-empty-state-title">No Users Found</div>
                <div className="admin-empty-state-description">Try adjusting your search criteria.</div>
              </div>}
            </div>
          </div>
        )}

        {activeTab === "adminUsers" && (
          <div>
            <div className="admin-filter-section">
              <div className="admin-filter-grid">
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Name</label>
                  <input className="admin-filter-input" name="username" value={filters.username} onChange={e => setFilters({ ...filters, username: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Email</label>
                  <input className="admin-filter-input" name="email" value={filters.email} onChange={e => setFilters({ ...filters, email: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Address</label>
                  <input className="admin-filter-input" name="address" value={filters.address} onChange={e => setFilters({ ...filters, address: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Sort</label>
                  <select className="admin-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="created_at">Created</option>
                    <option value="username">Name</option>
                    <option value="email">Email</option>
                    <option value="address">Address</option>
                  </select>
                </div>
              </div>
              <div className="admin-filter-actions">
                <button className="admin-filter-btn" onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>{order === "asc" ? "Asc" : "Desc"}</button>
                <button className="admin-filter-btn" onClick={loadAdminUsers}>Apply</button>
              </div>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-table-header">
                      <SortHeader column="username">Name</SortHeader>
                    </th>
                    <th className="admin-table-header">
                      <SortHeader column="email">Email</SortHeader>
                    </th>
                    <th className="admin-table-header">
                      <SortHeader column="address">Address</SortHeader>
                    </th>
                    <th className="admin-table-header">Role</th>
                    <th className="admin-table-header">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => (
                    <tr key={u.id} className="admin-table-row">
                      <td className="admin-table-cell font-semibold">{u.username}</td>
                      <td className="admin-table-cell text-secondary">{u.email}</td>
                      <td className="admin-table-cell text-secondary"><IoLocation style={{ marginRight: "4px", verticalAlign: "middle" }} />{u.address}</td>
                      <td className="admin-table-cell">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-800' :
                          u.role === 'owner' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="admin-table-cell font-bold">{Number(u.avg_rating).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {adminUsers.length === 0 && <div className="admin-empty-state">
                <div className="admin-empty-state-icon">👑</div>
                <div className="admin-empty-state-title">No Admin Users Found</div>
                <div className="admin-empty-state-description">Try adjusting your search criteria.</div>
              </div>}
            </div>
          </div>
        )}

        {activeTab === "stores" && (
          <div>
            <div className="admin-filter-section">
              <div className="admin-filter-grid">
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Name</label>
                  <input className="admin-filter-input" name="name" value={storeFilters.name} onChange={e => setStoreFilters({ ...storeFilters, name: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Address</label>
                  <input className="admin-filter-input" name="address" value={storeFilters.address} onChange={e => setStoreFilters({ ...storeFilters, address: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Owner</label>
                  <input className="admin-filter-input" name="owner" value={storeFilters.owner} onChange={e => setStoreFilters({ ...storeFilters, owner: e.target.value })} />
                </div>
                <div className="admin-filter-group">
                  <label className="admin-filter-label">Sort</label>
                  <select className="admin-filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="created_at">Created</option>
                    <option value="name">Name</option>
                    <option value="address">Address</option>
                  </select>
                </div>
              </div>
              <div className="admin-filter-actions">
                <button className="admin-filter-btn" onClick={() => setOrder(order === "asc" ? "desc" : "asc")}>{order === "asc" ? "Asc" : "Desc"}</button>
                <button className="admin-filter-btn" onClick={loadStores}>Apply</button>
              </div>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="admin-table-header">
                      <SortHeader column="name">Name</SortHeader>
                    </th>
                    <th className="admin-table-header">
                      <SortHeader column="address">Address</SortHeader>
                    </th>
                    <th className="admin-table-header">Owner</th>
                    <th className="admin-table-header">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id} className="admin-table-row">
                      <td className="admin-table-cell font-semibold">{s.name}</td>
                      <td className="admin-table-cell text-secondary"><IoLocation style={{ marginRight: "4px", verticalAlign: "middle" }} />{s.address}</td>
                      <td className="admin-table-cell text-secondary">{s.ownerName ? `${s.ownerName} (${s.ownerEmail})` : "Unassigned"}</td>
                      <td className="admin-table-cell">
                        <div className="flex items-center gap-1">
                          <span className="font-bold">{Number(s.avg_rating).toFixed(1)}</span>
                          <span className="text-lg">⭐</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {stores.length === 0 && <div className="admin-empty-state">
                <div className="admin-empty-state-icon">🏪</div>
                <div className="admin-empty-state-title">No Stores Found</div>
                <div className="admin-empty-state-description">Try adjusting your search criteria.</div>
              </div>}
            </div>
          </div>
        )}
      </div>

      {(showAddUser || showAddAdmin) && (
        <div className="admin-modal-overlay" onClick={() => { setShowAddUser(false); setShowAddAdmin(false); }}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">{showAddAdmin ? "Add Admin User" : "Add User"}</h3>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Name</label>
                <input className="admin-form-input" name="username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Email</label>
                <input className="admin-form-input" name="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Address</label>
                <input className="admin-form-input" name="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Password</label>
                <input className="admin-form-input" name="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => { setShowAddUser(false); setShowAddAdmin(false); }}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={() => handleAddUser(!!showAddAdmin)} disabled={loading}>
                {loading ? (
                  <>
                    <div className="admin-loading-spinner"></div>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddStore && (
        <div className="admin-modal-overlay" onClick={() => setShowAddStore(false)}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Add Store</h3>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Store Name</label>
                <input className="admin-form-input" name="name" value={storeForm.name} onChange={e => setStoreForm({ ...storeForm, name: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Address</label>
                <input className="admin-form-input" name="address" value={storeForm.address} onChange={e => setStoreForm({ ...storeForm, address: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Store Owner (Optional)</label>
                <select 
                  className="admin-form-select"
                  name="ownerId" 
                  value={storeForm.ownerId} 
                  onChange={e => {
                    if (e.target.value === "create_new") {
                      setShowCreateOwner(true);
                      setShowAddStore(false);
                    } else {
                      setStoreForm({ ...storeForm, ownerId: e.target.value });
                    }
                  }}
                >
                  <option value="">-- No Owner --</option>
                  <option value="create_new">+ Create New Owner</option>
                  {storeOwners.map(owner => (
                    <option key={owner.id} value={owner.id}>{owner.username} ({owner.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowAddStore(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleAddStore} disabled={loading}>
                {loading ? (
                  <>
                    <div className="admin-loading-spinner"></div>
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateOwner && (
        <div className="admin-modal-overlay" onClick={() => { setShowCreateOwner(false); setShowAddStore(true); }}>
          <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Create New Store Owner</h3>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Name</label>
                <input className="admin-form-input" name="username" value={ownerForm.username} onChange={e => setOwnerForm({ ...ownerForm, username: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Email</label>
                <input className="admin-form-input" name="email" type="email" value={ownerForm.email} onChange={e => setOwnerForm({ ...ownerForm, email: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Address</label>
                <input className="admin-form-input" name="address" value={ownerForm.address} onChange={e => setOwnerForm({ ...ownerForm, address: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Password</label>
                <input className="admin-form-input" name="password" type="password" value={ownerForm.password} onChange={e => setOwnerForm({ ...ownerForm, password: e.target.value })} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => { setShowCreateOwner(false); setShowAddStore(true); }}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleCreateOwner} disabled={loading}>
                {loading ? (
                  <>
                    <div className="admin-loading-spinner"></div>
                    Creating...
                  </>
                ) : (
                  "Create Owner"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


