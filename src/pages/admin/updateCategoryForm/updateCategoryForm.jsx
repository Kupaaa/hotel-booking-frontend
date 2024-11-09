import { useState, useEffect } from "react";
import uploadMedia from "../../../utils/meadiaUpload";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  confirmUpdate,
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";

export default function UpdateCategoryForm() {
  const location = useLocation();
  const categoryState = location.state || {}; // Fallback to an empty object if state is undefined

  const initialState = {
    name: categoryState.name || "", // Set the initial state for the name from categoryState
    price: categoryState.price || 0, // Set the initial state for the price
    features: categoryState.features || [], // Initialize the features array
    description: categoryState.description || "", // Initialize the description
    imagePreview: categoryState.image || null, // Image preview state, using the image from categoryState
    image: null, // Image file to be uploaded
  };

  const [formState, setFormState] = useState(initialState); // Form state initialized with initialState
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage the submission process
  const [errors, setErrors] = useState({}); // Object to store validation errors
  const [isImageLoading, setIsImageLoading] = useState(false); // State to handle image loading
  const [hasChanges, setHasChanges] = useState(false); // Track if form has changes

  const navigate = useNavigate(); // React Router hook for navigation
  const { isLoading: authLoading } = useAuth(); // Custom hook to manage authentication state

  // Check if form state differs from the initial state
  useEffect(() => {
    const formChanged =
      JSON.stringify(formState) !== JSON.stringify(initialState);
    setHasChanges(formChanged);
  }, [formState, initialState]);

  // Cleanup function to revoke image preview URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (
        formState.imagePreview &&
        typeof formState.imagePreview === "string"
      ) {
        URL.revokeObjectURL(formState.imagePreview);
      }
    };
  }, [formState.imagePreview]);

  // Add a new feature to the form
  const handleAddFeature = () => {
    setFormState((prev) => ({
      ...prev,
      features: [...prev.features, ""], // Add an empty string to features array
    }));
  };

  // Remove a feature from the form
  const handleRemoveFeature = (index) => {
    setFormState((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index), // Remove feature by index
    }));
  };

  // Handle the change of a feature input
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formState.features];
    updatedFeatures[index] = value.trim(); // Update the feature value at specific index
    setFormState((prev) => ({ ...prev, features: updatedFeatures }));
  };

  // Handle the change of the image input (for preview and file upload)
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      if (
        !selectedImage.type.startsWith("image/") ||
        selectedImage.size > 5 * 1024 * 1024
      ) {
        // Remove toast error
        return;
      }
      setFormState((prev) => ({ ...prev, image: selectedImage }));
      const previewUrl = URL.createObjectURL(selectedImage); // Create a URL for image preview
      setFormState((prev) => ({ ...prev, imagePreview: previewUrl }));
    }
  };

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formState.price || formState.price < 0)
      newErrors.price = "Price must be a positive value.";
    if (!formState.description)
      newErrors.description = "Description is required.";
    if (formState.features.some((feature) => feature === ""))
      newErrors.features = "All features must be filled.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const resetForm = () => setFormState(initialState); // Reset the form to initial state

  // Inside handleSubmit after successful submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Show the confirmation dialog before proceeding with the update
    const isConfirmed = await confirmUpdate(formState.name); // Use the category name in the confirmation message

    // If the user cancels the confirmation, exit the function without updating
    if (!isConfirmed.isConfirmed) {
      return; // Do not proceed with the update
    }

    if (!validateForm()) return; // Validation check if user confirmed

    setIsSubmitting(true); // Set submitting state to true
    try {
      let imageUrl = formState.imagePreview;
      if (formState.image) {
        setIsImageLoading(true); // Show loading state while image is being uploaded
        imageUrl = await uploadMedia(formState.image); // Upload image and get the URL
        setIsImageLoading(false); // Hide loading state
        if (!imageUrl) throw new Error("Image upload failed.");
      }

      const updatedCategory = {
        name: formState.name,
        price: formState.price,
        features: formState.features,
        description: formState.description,
        image: imageUrl,
      };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories/${
        formState.name
      }`; // API endpoint
      const token = localStorage.getItem("token"); // Get authentication token from localStorage

      if (!token) {
        setIsSubmitting(false);
        navigate("/login"); // Navigate to login page
        return;
      }

      const response = await axios.put(url, updatedCategory, {
        headers: { Authorization: `Bearer ${token}` }, // Include token in headers
      });

      showSuccessMessage("Success", "Category updated successfully!"); // Show success message
      resetForm(); // Reset form after successful submission
      navigate("/admin/categories"); // Navigate to categories page
    } catch (error) {
      console.error("Error submitting form:", error);
      showErrorMessage("Error", "Failed to update category. Please try again."); // Show error message
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  if (authLoading) return <div>Loading...</div>; // Show loading state while authentication is loading

  return (
    // Main container with flex for centering
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      {/* Form container with max width and shadow */}
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Update Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name (read-only) */}
          <div>
            <label className="block text-gray-700">Category Name</label>
            <input
              type="text"
              value={formState.name}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Price Input with validation */}
          <div>
            <label className="block text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              value={formState.price}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  price: Number(e.target.value),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              min="0"
              required
            />
            {errors.price && (
              <p className="text-red-600 text-sm">{errors.price}</p>
            )}
          </div>

          {/* Features Section with Add/Remove functionality */}
          <div>
            <label className="block text-gray-700">Features</label>
            {formState.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter feature"
                  required
                />
                {/* Remove feature button */}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
            {errors.features && (
              <p className="text-red-600 text-sm">{errors.features}</p>
            )}
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
              value={formState.description}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              rows="4"
              required
            ></textarea>
            {errors.description && (
              <p className="text-red-600 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Image Upload with preview */}
          <div>
            <label className="block text-gray-700">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formState.imagePreview && (
              <div className="mt-2">
                <img
                  src={formState.imagePreview}
                  alt="Preview"
                  className="max-w-full max-h-[200px] rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
