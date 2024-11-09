import { useState, useEffect, useRef } from "react";
import uploadMedia from "../../../utils/meadiaUpload";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";

export default function AddCategoryForm() {
  // State variables to hold form data
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState([]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const imageInputRef = useRef(null); // Reference for the file input
  const navigate = useNavigate(); // For redirecting the user
  const { isLoading: authLoading } = useAuth(); // To check if authentication is loading

  // Clean up the image preview URL when the component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview); // Free up memory
      }
    };
  }, [imagePreview]);

  // Function to handle adding new features to the features list
  const handleAddFeature = () => {
    if (features[features.length - 1] !== "") {
      // Only add a new feature if the last feature input is not empty
      setFeatures([...features, ""]);
    } else {
      // Warn the user if they try to add a feature before completing the previous one
      showErrorMessage(
        "Incomplete Feature",
        "Please fill out the current feature before adding a new one."
      );
    }
  };

  // Function to handle removing a feature
  const handleRemoveFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index)); // Remove feature by index
  };

  // Function to update a feature when the user changes the input
  const handleFeatureChange = (index, value) => {
    setFeatures(features.map((feature, i) => (i === index ? value : feature)));
  };

  // Function to handle image upload and set preview
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      // Validate the selected image type and size
      if (
        !selectedImage.type.startsWith("image/") ||
        selectedImage.size > 5 * 1024 * 1024 // Maximum 5MB
      ) {
        showErrorMessage(
          "Invalid Image",
          "Please upload a valid image file under 5MB."
        );
        return;
      }
      setImage(selectedImage);
      const previewUrl = URL.createObjectURL(selectedImage); // Create preview URL
      setImagePreview(previewUrl);
    } else {
      // Reset image if no file is selected
      setImage(null);
      setImagePreview(null);
    }
  };

  // Reset the form to its initial state
  const resetForm = () => {
    setName("");
    setPrice(0);
    setFeatures([]);
    setDescription("");
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // Clear file input
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation before submitting
    if (
      !name ||
      !price ||
      !description ||
      !image ||
      features.some((feature) => feature === "")
    ) {
      showErrorMessage(
        "Incomplete Form",
        "Please complete all fields before submitting."
      );
      return;
    }

    setLoading(true); // Set loading state while submitting the form
    try {
      setImageUploading(true); // Set image uploading state
      const imageUrl = await uploadMedia(image); // Upload the image

      if (!imageUrl) {
        setLoading(false);
        setImageUploading(false);
        showErrorMessage(
          "Image Upload Failed",
          "Image upload failed. Please try again."
        );
        return;
      }

      // Prepare the data to send to the backend
      const newCategory = {
        name,
        price,
        features,
        description,
        image: imageUrl,
      };
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories`; // Backend URL
      const token = localStorage.getItem("token"); // Get the authentication token

      if (!token) {
        setLoading(false);
        setImageUploading(false);
        showErrorMessage(
          "Authentication Required",
          "Authentication required. Please log in."
        );
        navigate("/login"); // Redirect to login if no token
        return;
      }

      // Send the data to the server
      const response = await axios.post(url, newCategory, {
        headers: { Authorization: `Bearer ${token}` }, // Send token in the header
      });

      showSuccessMessage("Category Added", response.data.message); // Success message
      resetForm(); // Reset the form after submission
    } catch (error) {
      console.error("Error submitting form:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        showErrorMessage("Submission Failed", error.response.data.message);
      } else {
        showErrorMessage(
          "Submission Failed",
          "Error submitting category, please try again."
        );
      }
    } finally {
      setLoading(false); // Reset loading state
      setImageUploading(false); // Reset image uploading state
    }
  };

  // If authentication is still loading, show a loading message
  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Add New Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name Input */}
          <div>
            <label className="block text-gray-700">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
              required
            />
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-gray-700">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              min="0"
              required
            />
          </div>

          {/* Features List */}
          <div>
            <label className="block text-gray-700">Features</label>
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter feature"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddFeature}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Feature
            </button>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700">Upload Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              ref={imageInputRef}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Image Preview"
                className="mt-4 w-full max-h-64 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading || imageUploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 w-full"
            >
              {loading || imageUploading ? "Uploading..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
