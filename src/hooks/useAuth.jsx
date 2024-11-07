import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import jwtDecode from "jwt-decode";

const useAuth = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const checkTokenValidity = (token) => {
    try {
      const decoded = jwtDecode(token);

      // Check if the token has expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
        return false;
      }

      // Check if the user is an admin
      if (decoded.type !== "admin") {
        toast.error("You must be an admin to access this page.");
        navigate("/");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Token decoding error:", error);
      toast.error("Invalid token. Please log in again.");
      navigate("/login");
      return false;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Authentication required. Please log in.");
      navigate("/login");
    } else {
      const isValid = checkTokenValidity(token);

      if (isValid) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [navigate]);

  return { isLoading, isAuthenticated };
};

export default useAuth;
