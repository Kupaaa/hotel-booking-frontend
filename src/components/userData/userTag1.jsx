import React, { useState, useEffect } from "react";
import axios from "axios";

function UserTag1() {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get(import.meta.env.VITE_BACKEND_URL + "/api/users", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          // Assuming the backend response contains user data
          const { firstName, lastName, profileImage } = res.data.user;
          setName(`${firstName} ${lastName}`);
          setProfileImage(profileImage || "/default-profile.jpg");  // Fallback to a default image if not available
          setError("");
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setError("Failed to fetch user data.");
        });
    } else {
      setName("");
      setProfileImage("");
    }
  }, []);

  return (
    <div className="user-tag flex items-center space-x-3">
      {profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
          {/* Default Avatar */}
          <span>{name ? name.charAt(0) : "U"}</span>
        </div>
      )}
      <div>
        {name ? (
          <span className="text-white">{name}</span>
        ) : (
          <span className="text-white">Guest</span>
        )}
      </div>
    </div>
  );
}

export default UserTag1;
