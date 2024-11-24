import axios from "axios";
import { useEffect, useState } from "react";

function UserTag({ imageLink = "default-profile.png", name: defaultName = "Guest User", onLogout }) {
  // State to store the user's full name (default is "Guest User")
  const [name, setName] = useState(defaultName);

  // State to store the user's profile image (default is "default-profile.png")
  const [profileImage, setProfileImage] = useState(imageLink);

  // State to handle error messages
  const [error, setError] = useState("");

  // useEffect hook to fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token"); // Retrieve the token from localStorage

      if (!token) {
        // If no token is found, set default values and show an error message
        console.log("No token found.");
        setError("Please log in."); // Display error prompting user to log in
        setName(defaultName); // Reset to default name
        setProfileImage(imageLink); // Reset to default image
        return;
      }

      try {
        // Construct API URL from environment variables
        const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/users/me`;

        // Fetch user data with the token included in the Authorization header
        const res = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // If the response contains user data, update the state
        if (res.data && res.data.user) {
          const user = res.data.user;
          setName(`${user.firstName} ${user.lastName}`); // Set the user's full name
          setProfileImage(user.profileImage || "default-profile.png"); // Set the user's profile image or fallback to default
        } else {
          // Handle cases where the response does not contain user data
          setError("Failed to load user data.");
        }
      } catch (err) {
        // Log and handle errors that occur during the API call
        console.error("Error fetching user data:", err.response || err.message);
        setError("Failed to fetch user data.");
      }
    };

    fetchUserData(); // Call the fetch function
  }, [imageLink, defaultName]); // Dependency array ensures fetchUserData runs when these props change

  // Logout handler to clear the token and reset state
  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove the token from localStorage
    setName(defaultName); // Reset name to default
    setProfileImage(imageLink); // Reset profile image to default
    if (onLogout) onLogout(); // Invoke the onLogout callback if provided
  };

  return (
    <div className="absolute right-0 flex items-center cursor-pointer p-[10px]">
      {/* Display the user's profile image */}
      <img
        className="rounded-full w-[50px] h-[50px]"
        src={profileImage} // Use the profile image from state
        alt="User Profile" // Alt text for accessibility
        onError={(e) => (e.target.src = "default-profile.png")} // Fallback to default image if loading fails
      />
      {/* Display the user's name */}
      <span className="text-white ml-[10px] text-xl">{name}</span>
      {/* Display error messages if any */}
      {error && <span className="text-red-500 ml-4">{error}</span>}
      {/* Logout button */}
      <button
        className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}

export default UserTag;
