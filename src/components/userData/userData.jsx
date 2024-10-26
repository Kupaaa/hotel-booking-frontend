import axios from "axios";
import { useEffect, useState } from "react";

// displays user information and handles logout functionality
function UserTag(props) {
  const [name, setName] = useState(""); // User's full name
  const [userFound, setUserFound] = useState(false); // User data existence flag
  const [error, setError] = useState(""); // Error message state

  useEffect(() => {
    const token = localStorage.getItem("token"); // Get token from local storage

    if (token) {
      // Fetch user data if token exists
      axios
        .get(import.meta.env.VITE_BACKEND_URL + "/api/users", {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        })
        .then((res) => {
          setName(`${res.data.user.firstName} ${res.data.user.lastName}`); // Set user name
          setUserFound(true); // Update user found status
          setError(""); // Clear any previous error
        })
        .catch((err) => {
          console.error("Error fetching user:", err);
          setError("Failed to fetch user data."); // Set error message
        });
    } else {
      setName(""); // Reset name if no token
      setUserFound(false); // Reset user found status
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Remove token on logout
    setUserFound(false); // Reset user state
    setName(""); // Clear name
  };

  return (
    <div className="absolute right-0 flex items-center cursor-pointer p-[10px]">
      <img
        className="rounded-full w-[50px] h-[50px]"
        src={""}
        alt="User Profile"
      />
      <span className="text-white ml-[10px] text-xl">{name}</span>
      {error && <span className="text-red-500">{error}</span>}{" "}
      {/* Display error message */}
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
