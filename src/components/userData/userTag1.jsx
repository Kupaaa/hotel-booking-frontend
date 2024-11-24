import React, { useState, useEffect } from "react";
import axios from "axios";

function UserTag1({
  imageLink = "default-profile.png",
  defaultName = "Guest User",
}) {
  // State for user's name, profile image, and error messages
  const [name, setName] = useState(defaultName);
  const [profileImage, setProfileImage] = useState(imageLink);
  const [error, setError] = useState(""); // Error message for user feedback

  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage

      if (!token) {
        console.log("No token found.");
        setError("You are not logged in."); // Show an error for unauthenticated users
        return;
      }

      try {
        // API call to fetch user details
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/users/me`;
        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Update state with user data if available
        if (res.data && res.data.user) {
          const user = res.data.user;
          setName(`${user.firstName} ${user.lastName}`); // Full name
          setProfileImage(user.profileImage || imageLink); // Profile image with fallback
        } else {
          setError("Failed to load user details.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err.message || err.response);
        setError("Failed to fetch user data. Please try again.");
      }
    };

    fetchUserData(); // Fetch user data on mount
  }, [imageLink, defaultName]); // Only run when props change

  return (
    <div className="user-tag flex items-center space-x-3">
      {/* Profile Image */}
      {profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => (e.target.src = "default-profile.png")} // Fallback to default image if the image fails to load
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white">
          {/* Default avatar with user's initials */}
          <span>{name ? name.charAt(0) : "U"}</span>
        </div>
      )}

      {/* User Name */}
      <div>
        <span className="text-white text-sm">{name}</span>
      </div>

      {/* Error Message */}
      {error && <span className="text-red-500 ml-3 text-xs">{error}</span>}
    </div>
  );
}

export default UserTag1;
