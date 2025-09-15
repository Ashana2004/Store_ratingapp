import React, { useEffect, useMemo, useState } from "react";
import { IoLocation } from "react-icons/io5";
import TopBar from "../components/TopBar";
import { showCenteredAlert } from "../utils/alert";
import "../styles/normaldashboard.css"
import "../styles/changingText.css";  
import TypingText from "../components/Typingtext";
export default function NormalDashboard() {
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [ratingInputs, setRatingInputs] = useState({});
  const [searchName, setSearchName] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  const [feedbackInputs, setFeedbackInputs] = useState({});
  const words = ["Hire", "Upskill", "Empower", "Train"];
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

 

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const token = localStorage.getItem("token");

        const resStores = await fetch("http://localhost:5000/api/stores", {
          headers: { "Authorization": "Bearer " + token },
        });
        const storesData = await resStores.json();

        const resRatings = await fetch("http://localhost:5000/api/users/myratings", {
          headers: { "Authorization": "Bearer " + token },
        });
        const ratingsData = await resRatings.json();

        const ratingsMap = {};
        const ratingInputMap = {};
        ratingsData.forEach(r => {
          ratingsMap[r.store_id] = { rating: r.rating, feedback: r.feedback, ratingId: r.id };
          ratingInputMap[r.store_id] = r.rating;
        });

        setUserRatings(ratingsMap);
        setRatingInputs(ratingInputMap);
        setStores(storesData);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStores();
  }, []);

  const handleSubmitRating = async (storeId) => {
    try {
      const token = localStorage.getItem("token");
      const ratingValue = ratingInputs[storeId];
      const feedbackValue = feedbackInputs[storeId] || "";

      if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
  showCenteredAlert("Please select a rating between 1 and 5");
        return;
      }

      const res = await fetch(`http://localhost:5000/api/stores/${storeId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token,
        },
        body: JSON.stringify({ rating: ratingValue, feedback: feedbackValue }),
      });

      const data = await res.json();
  showCenteredAlert(data.msg);

      setUserRatings(prev => ({
        ...prev,
        [storeId]: { rating: ratingValue, feedback: feedbackValue, ratingId: prev[storeId]?.ratingId || null }
      }));
    } catch (err) {
      console.error(err);
  showCenteredAlert("Error submitting rating");
    }
  };

  const handleRatingChange = (storeId, value) => {
    setRatingInputs(prev => ({ ...prev, [storeId]: Number(value) }));
  };

  const handleFeedbackChange = (storeId, value) => {
    setFeedbackInputs(prev => ({ ...prev, [storeId]: value }));
  };

  const filteredStores = useMemo(() => {
    return stores.filter(s =>
      (searchName.trim() === "" || (s.name || "").toLowerCase().includes(searchName.trim().toLowerCase())) &&
      (searchAddress.trim() === "" || (s.address || "").toLowerCase().includes(searchAddress.trim().toLowerCase()))
    );
  }, [stores, searchName, searchAddress]);

  // Pagination logic
  const totalPages = Math.ceil(filteredStores.length / itemsPerPage);
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

   useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        setFade(false);
      }, 500); // match this to the fade duration
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="normal-dashboard-container">
      <TopBar />

      <div className="normal-dashboard-content">
        <div className="normal-dashboard-title">
          <TypingText />
        </div>

        {/* Search Section */}
        <div className="normal-search-section">
          <div className="normal-search-grid">
            <div className="normal-search-group">
              <label className="normal-search-label">Search by Name</label>
              <input
                type="text"
                className="normal-search-input"
                placeholder="Enter store name..."
                value={searchName}
                onChange={e => setSearchName(e.target.value)}
              />
            </div>
            <div className="normal-search-group">
              <label className="normal-search-label">Search by Address</label>
              <input
                type="text"
                className="normal-search-input"
                placeholder="Enter store address..."
                value={searchAddress}
                onChange={e => setSearchAddress(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="normal-stores-grid">
          {paginatedStores.map(s => {
            const userRating = userRatings[s.id];
            const selectedRating = ratingInputs[s.id] || 0;

            return (
              <div key={s.id} className="normal-store-card">
                <div className="normal-store-header">
                  <h3 className="normal-store-name">{s.name}</h3>
                </div>
                <p className="normal-store-address"><IoLocation style={{ marginRight: "4px", verticalAlign: "middle" }} />{s.address}</p>

                <div className="normal-rating-section">
                  <div className="normal-rating-info">
                    <span className="normal-rating-label">Average Rating</span>
                    <div className="normal-rating-value">
                      {parseFloat(s.avg_rating).toFixed(1)}
                      <span className="normal-rating-stars">⭐</span>
                    </div>
                  </div>

                  <div className="normal-rating-info">
                    <span className="normal-rating-label">Your Rating</span>
                    <div className="normal-rating-value">
                      {userRating ? userRating.rating : "Not rated"}
                    </div>
                  </div>
                </div>

                <div className="normal-rating-input-section">
                  <label className="normal-search-label">Rate this store (1-5):</label>
                  <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <select
                      className="normal-rating-input"
                      value={selectedRating}
                      onChange={e => handleRatingChange(s.id, e.target.value)}
                      style={{ width: "80px", textAlign: "center" }}
                    >
                      <option value={0}>Select</option>
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    <div className="normal-rating-buttons">
                      <button
                        className="normal-rating-btn normal-rating-btn-primary"
                        onClick={() => handleSubmitRating(s.id)}
                      >
                        {userRating ? "Modify" : "Submit"}
                      </button>
                    </div>
                  </div>
                  {/* Feedback input */}
                  <div style={{ marginTop: "0.75rem" }}>
                    <label className="normal-search-label">Feedback (optional):</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                      <textarea
                        className="normal-feedback-input"
                        placeholder="Write your feedback..."
                        value={feedbackInputs[s.id] || ""}
                        onChange={e => handleFeedbackChange(s.id, e.target.value)}
                        rows={2}
                        style={{ width: "220px", resize: "vertical" }}
                      />
                      <button
                        className="normal-rating-btn normal-rating-btn-primary"
                        style={{ height: "40px" }}
                        onClick={() => handleSubmitRating(s.id)}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="normal-pagination">
          <button
            className="normal-pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            ← Previous
          </button>

          <span className="normal-pagination-info">
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="normal-pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
