import { useState, useEffect } from "react";
import uploadMedia from "../../../utils/meadiaUpload"; // Importing the media upload utility
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  confirmUpdate, // Importing helper functions for dialogs
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";

export default function UpdateUserForm() {
  // useLocation hook to get user details from state passed via react-router
  const location = useLocation();
  const userState = location.state || {}; // Fallback to an empty object if no state is passed

  // State to store the original image for restoring later
  const [originalImage, setOriginalImage] = useState(userState.image);

  // Initial form state with default user details from `userState`
  const initialState = {
    firstName: userState.firstName || "",
    lastName: userState.lastName || "",
    email: userState.email || "",
    phone: userState.phone || "",
    whatsApp: userState.whatsApp || "",
    role: userState.role || "Customer",
    imagePreview: userState.image || null, // Initial image preview from userState
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
    if (!formState.firstName) newErrors.firstName = "First name is required.";
    if (!formState.lastName) newErrors.lastName = "Last name is required.";
    if (!formState.phone)
      newErrors.phone = "Phone number is required and must be in valid format.";
    if (!formState.whatsApp)
      newErrors.whatsApp =
        "WhatsApp number is required and must be in valid format.";
    if (!formState.role) newErrors.role = "Role is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Reset the form to its initial state
  const resetForm = () => setFormState(initialState);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isConfirmed = await confirmUpdate(
      `${formState.firstName} ${formState.lastName}`
    );
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

      // Prepare the updated user data
      const updatedUser = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        phone: formState.phone,
        whatsApp: formState.whatsApp,
        role: formState.role,
        image: imageUrl,
      };

      // API call to update the user
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/users/${
        formState.email
      }`;
      const token = localStorage.getItem("token");

      // Redirect to login if no token is available
      if (!token) {
        setIsSubmitting(false);
        navigate("/login");
        return;
      }

      // Send PUT request to update user
      const response = await axios.put(url, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Show success message and wait for user confirmation
      const result = await showSuccessMessage(
        "Success",
        "User updated successfully!"
      );

      // Show success message and navigate
      if (result.isConfirmed) {
        // If user clicked "OK", reset the form and navigate
        resetForm();
        navigate("/admin/users"); // Navigate to users list after confirmation
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      showErrorMessage("Error", "Failed to update user. Please try again.");
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  if (authLoading) return <div>Loading...</div>; // Show loading state if auth is loading

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Update User
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Email (Read-Only) */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={formState.email}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* User First Name */}
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              value={formState.firstName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, firstName: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter first name"
              required
            />
            {errors.firstName && (
              <p className="text-red-600 text-sm">{errors.firstName}</p>
            )}
          </div>

          {/* User Last Name */}
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              value={formState.lastName}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, lastName: e.target.value }))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter last name"
              required
            />
            {errors.lastName && (
              <p className="text-red-600 text-sm">{errors.lastName}</p>
            )}
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-gray-700">Phone</label>
            <PhoneInput
              country={"lk"}
              value={formState.phone}
              onChange={(phone) => setFormState((prev) => ({ ...prev, phone }))}
              inputClass={`w-full px-4 py-2 border rounded-lg ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              dropdownClass="bg-white rounded-lg border"
              containerClass="mb-4"
              placeholder="Enter phone number"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* WhatsApp Input */}
          <div>
            <label className="block text-gray-700">WhatsApp</label>
            <PhoneInput
              country={"lk"}
              value={formState.whatsApp}
              onChange={(phone) =>
                setFormState((prev) => ({ ...prev, whatsApp: `+${phone}` }))
              }
              inputClass={`w-full px-4 py-2 border rounded-lg ${
                errors.whatsApp ? "border-red-500" : "border-gray-300"
              }`}
              dropdownClass="bg-white rounded-lg border"
              containerClass="mb-4"
              placeholder="Enter WhatsApp number"
            />
            {errors.whatsApp && (
              <p className="text-red-500 text-sm">{errors.whatsApp}</p>
            )}
          </div>

          {/* Role Selector */}
          <div>
            <label className="block text-gray-700">Role</label>
            <select
              value={formState.role}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, role: e.target.value }))
              }
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.role ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="" label="Select role" />
              <option value="Admin" label="Admin" />
              <option value="Customer" label="Customer" />
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role}</p>
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
              {isSubmitting ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
