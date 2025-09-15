import React, { useEffect, useMemo, useState } from "react";
import TopBar from "../components/TopBar";
import { IoLocation } from "react-icons/io5";


export default function OwnerDashboard() {
  const [myStores, setMyStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [storeRatings, setStoreRatings] = useState({
    avgRating: 0,
    ratingCount: 0,
    ratings: []
  });
  const [loading, setLoading] = useState(false);

  const [sortField, setSortField] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    async function fetchMyStores() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/owner/my-stores`, {
          headers: { Authorization: "Bearer " + token }
        });
        const data = await res.json();
        setMyStores(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedStoreId(data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchMyStores();
  }, []);

  useEffect(() => {
    if (!selectedStoreId) return;
    async function fetchRatings() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/stores/owner/${selectedStoreId}/ratings`,
          {
            headers: { Authorization: "Bearer " + token }
          }
        );
        const data = await res.json();
        if (res.ok) {
          setStoreRatings({
            avgRating: data.avgRating || 0,
            ratingCount: data.ratingCount || 0,
            ratings: Array.isArray(data.ratings) ? data.ratings : []
          });
        } else {
          setStoreRatings({ avgRating: 0, ratingCount: 0, ratings: [] });
          alert(data.msg || data.message || "Failed to load ratings");
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchRatings();
  }, [selectedStoreId]);

  const selectedStore = useMemo(
    () => myStores.find((s) => s.id === selectedStoreId) || null,
    [myStores, selectedStoreId]
  );

  const sortedRatings = useMemo(() => {
    const sorted = [...storeRatings.ratings];
    sorted.sort((a, b) => {
      let valA = a[sortField] ?? "";
      let valB = b[sortField] ?? "";
      if (sortField === "rating") {
        valA = Number(valA);
        valB = Number(valB);
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [storeRatings.ratings, sortField, sortOrder]);

  return (
    <div className="owner-dashboard">
      <TopBar showSearch={false} />

      <h2 className="dashboard-title">Store Owner Dashboard</h2>

      {myStores.length === 0 ? (
        <p className="empty">You do not have any stores assigned yet.</p>
      ) : (
        <div className="store-select-wrapper">
          <label>Select Store: </label>
          <select
            value={selectedStoreId || ""}
            onChange={(e) => setSelectedStoreId(Number(e.target.value))}
          >
            {myStores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedStore && (
        <div className="selected-store">
          <h3>{selectedStore.name}</h3>
          <p><IoLocation /> {selectedStore.address}</p>
          <p>
            ⭐ Average Rating: {Number(storeRatings.avgRating).toFixed(1)} (
            {storeRatings.ratingCount} ratings)
          </p>
        </div>
      )}

      <h3 className="ratings-title">Users who rated this store</h3>

      {storeRatings.ratings.length > 0 && (
        <div className="sort-bar">
          <label>Sort By:</label>
          <select value={sortField} onChange={(e) => setSortField(e.target.value)}>
            <option value="username">Name</option>
            <option value="email">Email</option>
            <option value="rating">Rating</option>
          </select>

          <label>Order:</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      )}

      {loading ? (
        <p className="loading">Loading ratings...</p>
      ) : sortedRatings.length === 0 ? (
        <p className="empty">No ratings yet.</p>
      ) : (
        <div className="ratings-list">
          {sortedRatings.map((r, idx) => (
            <div key={idx} className="rating-card">
              <div className="user-info">
                {r.username} <span>({r.email})</span>
              </div>
              <div className="rating-value">Rating: {r.rating}</div>
              {r.feedback && <div className="feedback">“{r.feedback}”</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
