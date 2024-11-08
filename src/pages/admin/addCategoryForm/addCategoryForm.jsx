import { useState, useEffect } from "react";
import uploadMedia from "../../../utils/meadiaUpload";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

// AddCategoryForm component - manages form state and submission for adding a new category
export default function AddCategoryForm() {
  // State variables to hold form input values
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState([]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();

  // Cleanup function to revoke image preview URL on component unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Adds a new, empty feature to the list
  function handleAddFeature() {
    setFeatures([...features, ""]);
  }

  // Removes a feature from the list based on its index
  function handleRemoveFeature(index) {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  }

  // Updates the value of a specific feature based on its index
  function handleFeatureChange(index, value) {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  }

  // Handles image file selection and creates a preview URL
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      // Validate image type and size
      if (!selectedImage.type.startsWith("image/") || selectedImage.size > 5 * 1024 * 1024) {
        toast.error("Please upload a valid image file under 5MB.");
        return;
      }
      setImage(selectedImage);
      const previewUrl = URL.createObjectURL(selectedImage);
      setImagePreview(previewUrl);
    }
  };

  // Resets form fields to their initial states
  const resetForm = () => {
    setName("");
    setPrice(0);
    setFeatures([]);
    setDescription("");
    setImage(null);
    setImagePreview(null);
  };

  // Handles form submission, including validation, image upload, and category creation
  async function handleSubmit(e) {
    e.preventDefault();

    // Validation to ensure all required fields are filled
    if (!name || !price || !description || !image || features.some((feature) => feature === "")) {
      return toast.error("Please complete all fields before submitting.");
    }

    setLoading(true);
    try {
      setImageUploading(true);
      const imageUrl = await uploadMedia(image);

      // Check if image upload was successful
      if (!imageUrl) {
        setLoading(false);
        setImageUploading(false);
        return toast.error("Image upload failed. Please try again.");
      }

      const newCategory = { name, price, features, description, image: imageUrl };
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories`;
      const token = localStorage.getItem("token");

      // Redirect to login if token is not found
      if (!token) {
        setLoading(false);
        setImageUploading(false);
        toast.error("Authentication required. Please log in.");
        navigate("/login");
        return;
      }

      // Submit new category to backend
      const response = await axios.post(url, newCategory, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(response.data.message);
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting category, please try again.");
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  }

  // Show loading indicator if authentication is in progress
  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    // Main container for the form
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Add New Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name input field */}
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

          {/* Price input field */}
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

          {/* Features input fields with Add and Remove functionality */}
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

          {/* Description input field */}
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

          {/* Image input field with preview display */}
          <div>
            <label className="block text-gray-700">Image</label>
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  className="w-full max-h-60 rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Submit button with loading indicator */}
          <div>
            <button
              type="submit"
              disabled={loading || imageUploading}
              className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200 ${
                (loading || imageUploading) && "opacity-50 cursor-not-allowed"
              }`}
            >
              {loading || imageUploading ? "Uploading..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
