import { useState, useEffect, useRef } from "react";
import uploadMedia from "../../../utils/meadiaUpload";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";

export default function AddGalleryItemForm() {
  // State variables to hold form data
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
  const [hasChanges, setHasChanges] = useState(false); // Track if the form has changes

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

  const handleNameChange = (e) => {
    setName(e.target.value);
    setHasChanges(true);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setHasChanges(true);
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
      setHasChanges(true); // Mark the form as changed
    } else {
      // Reset image if no file is selected
      setImage(null);
      setImagePreview(null);
      setHasChanges(true);
    }
  };

  // Reset the form to its initial state
  const resetForm = () => {
    setName("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // Clear file input
    }
    setHasChanges(false); // Reset form change state
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start submitting

    // Form validation before submitting
    if (!name || !description || !image) {
      showErrorMessage(
        "Incomplete Form",
        "Please complete all fields before submitting."
      );
      setIsSubmitting(false);
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
      const newGalleryItem = {
        name,
        description,
        image: imageUrl,
      };
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/gallery`; // Backend URL
      const token = localStorage.getItem("token"); // Get the authentication token

      if (!token) {
        setLoading(false);
        setImageUploading(false);
        showErrorMessage(
          "Authentication Required",
          "Authentication required. Please log in."
        );
        navigate("/login"); // Redirect to login if no token
        setIsSubmitting(false);
        return;
      }

      // Send the data to the server
      const response = await axios.post(url, newGalleryItem, {
        headers: { Authorization: `Bearer ${token}` }, // Send token in the header
      });

      showSuccessMessage("Gallery Item Added", response.data.message); // Success message
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
          "Error submitting gallery item, please try again."
        );
      }
    } finally {
      setLoading(false); // Reset loading state
      setImageUploading(false); // Reset image uploading state
      setIsSubmitting(false); // End submission state
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
          Add New Gallery Item
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Gallery Item Name Input */}
          <div>
            <label className="block text-gray-700">Gallery Item Name</label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter gallery item name"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={handleDescriptionChange}
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
              accept="image/*"
              onChange={handleImageChange}
              ref={imageInputRef}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Image Preview"
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={resetForm}
              className={`text-sm text-gray-500 ${
                isSubmitting || !hasChanges
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-blue-600 hover:underline"
              }`}
              disabled={isSubmitting || !hasChanges}
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg"
            >
              {isSubmitting ? "Adding Gallery Item..." : "Add Gallery Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
