import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "Rishit Mohanty",
    phone: "+91 98765 43210",
    email: "rishit@example.com",
    location: "Bhubaneswar, Odisha",
    avatar: "https://avatars.githubusercontent.com/u/000000?v=4",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const rideHistory = [
    { id: 1, from: "KIIT University", to: "Bhubaneswar Railway Station", date: "2024-01-15", amount: "₹120", vehicle: "Auto" },
    { id: 2, from: "Jaydev Vihar", to: "Infocity", date: "2024-01-14", amount: "₹85", vehicle: "Bike" },
    { id: 3, from: "Vani Vihar", to: "Kalinga Hospital", date: "2024-01-12", amount: "₹65", vehicle: "Bike" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically make an API call to update user data
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const stats = {
    totalRides: 23,
    totalSpent: "₹2,450",
    memberSince: "2023",
  };

  return (
    
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="avatar-section">
            <img src={user.avatar} alt="profile" className="profile-avatar" />
            {isEditing && (
              <button className="change-photo-btn">Change Photo</button>
            )}
          </div>
          <div className="profile-info">
            {isEditing ? (
              <div className="edit-fields">
                <input
                  type="text"
                  name="name"
                  value={user.name}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Full Name"
                />
                <input
                  type="tel"
                  name="phone"
                  value={user.phone}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Phone Number"
                />
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Email Address"
                />
                <input
                  type="text"
                  name="location"
                  value={user.location}
                  onChange={handleInputChange}
                  className="profile-input"
                  placeholder="Location"
                />
              </div>
            ) : (
              <div className="info-fields">
                <h2 className="profile-name">{user.name}</h2>
                <p className="profile-phone">📞 {user.phone}</p>
                <p className="profile-email">✉️ {user.email}</p>
                <p className="profile-location">📍 {user.location}</p>
              </div>
            )}
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === "rides" ? "active" : ""}`}
            onClick={() => setActiveTab("rides")}
          >
            Ride History
          </button>
          <button 
            className={`tab-button ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
          >
            Statistics
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "profile" && (
            <div className="profile-stats">
              <div className="stat-card">
                <h3>{stats.totalRides}</h3>
                <p>Total Rides</p>
              </div>
              <div className="stat-card">
                <h3>{stats.totalSpent}</h3>
                <p>Total Spent</p>
              </div>
              <div className="stat-card">
                <h3>{stats.memberSince}</h3>
                <p>Member Since</p>
              </div>
            </div>
          )}

          {activeTab === "rides" && (
            <div className="ride-history">
              <h3>Recent Rides</h3>
              {rideHistory.map((ride) => (
                <div key={ride.id} className="ride-card">
                  <div className="ride-info">
                    <div className="ride-route">
                      <span className="from"><b>Start Point:</b> {ride.from}</span>
                      <span className="to"><b>End Point:</b> {ride.to}</span>
                    </div>
                    <div className="ride-details">
                      <span className="vehicle">{ride.vehicle}</span>
                      <span className="date">{ride.date}</span>
                      <span className="amount">{ride.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "stats" && (
            <div className="statistics">
              <div className="stat-item">
                <label>Preferred Vehicle:</label>
                <span>Bike</span>
              </div>
              <div className="stat-item">
                <label>Average Ride Cost:</label>
                <span>₹85</span>
              </div>
              <div className="stat-item">
                <label>Favorite Time:</label>
                <span>Evening (6-9 PM)</span>
              </div>
              <div className="stat-item">
                <label>Rating:</label>
                <span>⭐ 4.8/5</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button className="profile-save-btn" onClick={handleSave}>
                Save Changes
              </button>
              <button 
                className="profile-cancel-btn" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="profile-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          )}
          
          <button className="profile-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;