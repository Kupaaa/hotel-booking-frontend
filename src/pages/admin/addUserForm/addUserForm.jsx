import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import useAuth from "../../../hooks/useAuth";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";
import uploadMedia from "../../../utils/meadiaUpload";

export default function AddUserForm() {
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef(null);
  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();

  // Validation schema for the form fields using Yup
  const validationSchema = Yup.object().shape({
    // Validates first name to ensure it's a non-empty string
    firstName: Yup.string().trim().required("First name is required"),

    // Validates last name to ensure it's a non-empty string
    lastName: Yup.string().trim().required("Last name is required"),

    // Validates email to ensure it's a valid email address and is required
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),

    // Validates phone number to ensure it's in international format and is required
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^\+?[1-9]\d{1,14}$/, "Enter a valid phone number"),

    // Validates WhatsApp number to ensure it's in international format and is required
    whatsApp: Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, "Enter a valid international phone number")
      .required("WhatsApp number is required"),

    // Validates password to ensure it's at least 8 characters long and is required
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),

    // Validates role to ensure it's either "Admin" or "Customer" and is required
    role: Yup.string()
      .required("Role is required")
      .oneOf(["Admin", "Customer"], "Invalid role selected"),

    // Validates profile image to ensure it's a valid image file and meets size limits
    image: Yup.mixed()
      .required("Profile image is required")
      .test(
        "fileType",
        "Only image files are allowed",
        (value) =>
          value && ["image/jpeg", "image/png", "image/jpg"].includes(value.type)
      )
      .test(
        "fileSize",
        "Image size must be less than 5MB",
        (value) => value && value.size <= 5 * 1024 * 1024
      ),
  });

  // Initializes the form using Formik with default values and validation schema
  const formik = useFormik({
    initialValues: {
      firstName: "", // Default value for first name
      lastName: "", // Default value for last name
      email: "", // Default value for email
      phone: "", // Default value for phone
      whatsApp: "", // Default value for WhatsApp
      password: "", // Default value for password
      role: "Customer", // Default role is set to "Customer"
      image: null, // Default value for profile image
    },
    validationSchema, // Attach validation schema
    onSubmit: async (values, { resetForm }) => {
      setIsSubmitting(true); // Indicate that the form is submitting
      try {
        setImageUploading(true); // Indicate image upload in progress

        // Upload image to a remote storage and get the URL
        const imageUrl = await uploadMedia(values.image);
        if (!imageUrl) {
          throw new Error("Image upload failed.");
        }

        // Prepare user data to be sent to the backend
        const newUser = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          whatsApp: values.whatsApp,
          password: values.password,
          role: values.role,
          image: imageUrl,
        };

        const url = `${import.meta.env.VITE_BACKEND_URL}/api/users`; // Backend API endpoint
        const token = localStorage.getItem("token"); // Get authentication token from local storage

        // If no token is found, redirect the user to the login page
        if (!token) {
          showErrorMessage("Authentication Required", "Please log in.");
          navigate("/login");
          return;
        }

        // Send POST request to create a new user
        const response = await axios.post(url, newUser, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Show success message and reset the form
        showSuccessMessage("User Added", response.data.message);
        resetForm();
        setImagePreview(null); // Clear image preview
      } catch (error) {
        console.error("Error adding user:", error);
        showErrorMessage(
          "Submission Failed",
          error.response?.data?.message || "An error occurred."
        );
      } finally {
        setImageUploading(false); // Reset image upload status
        setIsSubmitting(false); // Reset form submission status
      }
    },
  });

  // Generates a preview of the uploaded image for display
  const handleImagePreview = (file) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file); // Create URL for the image
      setImagePreview(previewUrl); // Set the preview URL
    } else {
      setImagePreview(null); // Clear the preview if no file is provided
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Add New User
        </h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2 border rounded-lg ${
                formik.touched.firstName && formik.errors.firstName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="e.g., John"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <p className="text-red-500 text-sm">{formik.errors.firstName}</p>
            )}
            <small className="text-gray-500">
              Enter your first name as it appears on official documents.
            </small>
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2 border rounded-lg ${
                formik.touched.lastName && formik.errors.lastName
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="e.g., Doe"
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <p className="text-red-500 text-sm">{formik.errors.lastName}</p>
            )}
            <small className="text-gray-500">
              Enter your last name (surname).
            </small>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2 border rounded-lg ${
                formik.touched.email && formik.errors.email
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="e.g., john.doe@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-sm">{formik.errors.email}</p>
            )}
            <small className="text-gray-500">
              Enter a valid email address to receive important updates.
            </small>
          </div>
          {/* Phone */}
          <div>
            <label className="block text-gray-700">Phone</label>
            <PhoneInput
              country={"lk"}
              value={formik.values.phone}
              onChange={(phone) => formik.setFieldValue("phone", phone)}
              inputClass={`w-full px-4 py-2 border rounded-lg ${
                formik.touched.phone && formik.errors.phone
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              dropdownClass="bg-white rounded-lg border"
              containerClass="mb-4"
              placeholder="Enter phone number"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-red-500 text-sm">{formik.errors.phone}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-gray-700">WhatsApp</label>
            <PhoneInput
              country={"lk"} // Default country
              value={formik.values.whatsApp}
              onChange={(phone) =>
                formik.setFieldValue("whatsApp", `+${phone}`)
              } // Always include "+"
              inputClass={`w-full px-4 py-2 border rounded-lg ${
                formik.touched.whatsApp && formik.errors.whatsApp
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              dropdownClass="bg-white rounded-lg border"
              containerClass="mb-4"
              placeholder="Enter WhatsApp number"
            />
            {formik.touched.whatsApp && formik.errors.whatsApp && (
              <p className="text-red-500 text-sm">{formik.errors.whatsApp}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2 border rounded-lg ${
                formik.touched.password && formik.errors.password
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              placeholder="e.g., your password"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-sm">{formik.errors.password}</p>
            )}
            <small className="text-gray-500">
              Choose a strong password with at least 8 characters.
            </small>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-gray-700">Upload Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                formik.setFieldValue("image", event.currentTarget.files[0]);
                handleImagePreview(event.currentTarget.files[0]);
              }}
              ref={imageInputRef}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
            {formik.touched.image && formik.errors.image && (
              <p className="text-red-500 text-sm">{formik.errors.image}</p>
            )}
          </div>
          {/* Role Selector */}
          <div>
            <label className="block text-gray-700">Role</label>
            <select
              name="role"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-2 border rounded-lg ${
                formik.touched.role && formik.errors.role
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
            >
              <option value="" label="Select role" />
              <option value="Admin" label="Admin" />
              <option value="Customer" label="Customer" />
            </select>
            {formik.touched.role && formik.errors.role && (
              <p className="text-red-500 text-sm">{formik.errors.role}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={formik.handleReset}
              className={`text-sm text-gray-500 ${
                isSubmitting || !formik.dirty
                  ? "cursor-not-allowed opacity-50"
                  : "hover:text-blue-600 hover:underline"
              }`}
              disabled={isSubmitting || !formik.dirty}
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg"
            >
              {isSubmitting ? "Adding User..." : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
