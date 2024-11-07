import { useState } from "react";
import uploadMedia from "../../../utils/meadiaUpload";
import axios from "axios";
import toast from "react-hot-toast";

export default function AddCategoryForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState([""]); // Start with one empty feature
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle adding a new feature
  function handleAddFeature() {
    // Check if the last feature input is empty before adding a new feature
    if (features[features.length - 1] !== "") {
      setFeatures([...features, ""]); // Adds an empty feature input
    } else {
      toast.error("Please fill the current feature before adding a new one.");
    }
  }

  // Handle removing a feature
  function handleRemoveFeature(index) {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  }

  // Handle feature change
  function handleFeatureChange(index, value) {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  }

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !price || !description || !image) {
      return toast.error("Please complete all fields before submitting.");
    }

    setLoading(true); // Start loading during image upload and form submission

    try {
      // Upload image and get the URL before proceeding
      const imageUrl = await uploadMedia(image);
      if (!imageUrl) {
        setLoading(false);
        return toast.error("Image upload failed. Please try again.");
      }

      // Prepare the new category data
      const newCategory = {
        name,
        price,
        features,
        description,
        image: imageUrl, // Use the uploaded image URL
      };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories`; // Backend API URL

      // Fetch the token from local storage (or another source if applicable)
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return toast.error("Authentication required. Please log in.");
      }

      // Send data to the backend using a POST request with Axios
      const response = await axios.post(url, newCategory, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the request header
        },
      });

      // Show success toast
      toast.success(response.data.message);

      // Optionally clear the form after successful submission
      setName("");
      setPrice(0);
      setFeatures([""]); // Reset to one empty feature
      setDescription("");
      setImage("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting category, please try again.");
    } finally {
      setLoading(false); // Reset loading state after form submission
    }
  }

  return (
    <div className="flex justify-center items-center w-full min-h-screen p-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Add New Category
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-gray-700">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
              required
            />
          </div>

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

          <div>
            <label className="block text-gray-700">Image</label>
            <input
              type="file"
              onChange={(e) => setImage(e.target.files[0])}
              accept="image/*"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading} // Disable submit button during image upload and form submission
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
            >
              {loading ? "Uploading..." : "Add Category"}{" "}
              {/* Display loading text */}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
