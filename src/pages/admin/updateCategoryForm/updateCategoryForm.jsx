import { useState, useEffect } from "react";
import uploadMedia from "../../../utils/meadiaUpload"; // Importing the media upload utility
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  confirmUpdate, // Importing helper functions for dialogs
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";

export default function UpdateCategoryForm() {
  // useLocation hook to get category details from state passed via react-router
  const location = useLocation();
  const categoryState = location.state || {}; // Fallback to an empty object if no state is passed

  // State to store the original image for restoring later
  const [originalImage, setOriginalImage] = useState(categoryState.image);

  // Initial form state with default category details from `categoryState`
  const initialState = {
    name: categoryState.name || "",
    price: categoryState.price || 0,
    features: categoryState.features || [],
    description: categoryState.description || "",
    imagePreview: categoryState.image || null, // Initial image preview from categoryState
    image: null, // Image file to be uploaded
  };

  // useState hook to store form state, submission status, errors, and changes
  const [formState, setFormState] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();

  // Effect to check if the form has been modified
  useEffect(() => {
    const formChanged =
      JSON.stringify(formState) !== JSON.stringify(initialState);
    setHasChanges(formChanged);
  }, [formState, initialState]);

  // Clean up image preview URL when component unmounts or image preview changes
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

  // Handle image change: preview and validate the file
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      // Validate image file type and size
      if (
        !selectedImage.type.startsWith("image/") ||
        selectedImage.size > 5 * 1024 * 1024
      ) {
        return; // Return if invalid image
      }

      // Update form state with the selected image and preview
      setFormState((prev) => ({ ...prev, image: selectedImage }));
      const previewUrl = URL.createObjectURL(selectedImage);
      setFormState((prev) => ({ ...prev, imagePreview: previewUrl }));
    } else {
      // Restore the original image preview if image is cleared
      setFormState((prev) => ({ ...prev, imagePreview: originalImage }));
    }
  };

  // Validate the form inputs before submission
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

  // Reset the form to its initial state
  const resetForm = () => setFormState(initialState);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isConfirmed = await confirmUpdate(formState.name);
    if (!isConfirmed.isConfirmed) return; // Exit if the user doesn't confirm the update

    if (!validateForm()) return; // Exit if form is invalid

    setIsSubmitting(true); // Set submitting state to true
    try {
      let imageUrl = formState.imagePreview; // Set default image URL

      // If a new image is selected, upload it
      if (formState.image) {
        setIsImageLoading(true); // Set image loading state
        imageUrl = await uploadMedia(formState.image); // Upload image
        setIsImageLoading(false); // Reset image loading state
        if (!imageUrl) throw new Error("Image upload failed.");
      }

      // Prepare the updated category data
      const updatedCategory = {
        name: formState.name,
        price: formState.price,
        features: formState.features,
        description: formState.description,
        image: imageUrl,
      };

      // API call to update the category
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories/${
        formState.name
      }`;
      const token = localStorage.getItem("token");

      // Redirect to login if no token is available
      if (!token) {
        setIsSubmitting(false);
        navigate("/login");
        return;
      }

      // Send PUT request to update category
      const response = await axios.put(url, updatedCategory, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Show success message and navigate
      showSuccessMessage("Success", "Category updated successfully!");
      resetForm();
      navigate("/admin/categories");
    } catch (error) {
      console.error("Error submitting form:", error);
      showErrorMessage("Error", "Failed to update category. Please try again.");
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  if (authLoading) return <div>Loading...</div>; // Show loading state if auth is loading

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Update Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name (Read-Only) */}
          <div>
            <label className="block text-gray-700">Category Name</label>
            <input
              type="text"
              value={formState.name}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* Price Input */}
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

          {/* Features Input */}
          <div>
            <label className="block text-gray-700">Features</label>
            <textarea
              value={formState.features.join(", ")}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  features: e.target.value
                    .split(",")
                    .map((feature) => feature.trim()),
                }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter features (e.g., pool, restaurant, Wi-Fi, gym)"
              rows="4"
            ></textarea>
            <p className="text-gray-500 text-sm mt-1">
              Separate each feature with a comma (e.g., pool, restaurant,
              Wi-Fi).
            </p>
            {errors.features && (
              <p className="text-red-600 text-sm">{errors.features}</p>
            )}
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

          {/* Image Input */}
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
                  className="w-24 h-24 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={resetForm}
              className={`text-sm text-gray-500 ${
                isSubmitting || !hasChanges
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-blue-600 hover:underline"
              }`}
              disabled={isSubmitting || !hasChanges} // Disable button if submitting or no changes
            >
              Reset Form
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white bg-blue-600 rounded-lg ${
                isSubmitting || !hasChanges
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? "Updating..." : "Update Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
