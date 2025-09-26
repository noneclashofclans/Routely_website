import React, { useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState({
    name: "Rishit Mohanty",
    phone: "+91 98765 43210",
    email: "rishit@example.com",
    location: "Bhubaneswar, Odisha",
    avatar: "https://avatars.githubusercontent.com/u/000000?v=4",
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Navigate to landing page
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={user.avatar} alt="profile" className="profile-avatar" />
        <div>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <h2 className="profile-name">{user.name}</h2>
          )}
          {isEditing ? (
            <input
              type="text"
              name="phone"
              value={user.phone}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <p className="profile-phone">📞 {user.phone}</p>
          )}
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <p className="profile-email">✉️ {user.email}</p>
          )}
          {isEditing ? (
            <input
              type="text"
              name="location"
              value={user.location}
              onChange={handleInputChange}
              className="profile-input"
            />
          ) : (
            <p className="profile-location">📍 {user.location}</p>
          )}
        </div>
      </div>

      <div className="profile-actions">
        {isEditing ? (
          <button
            className="profile-save-btn"
            onClick={() => setIsEditing(false)}
          >
            Save
          </button>
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
  );
};

export default Profile;
