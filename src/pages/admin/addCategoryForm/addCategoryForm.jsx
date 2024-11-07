import { useState, useEffect } from "react";
import uploadMedia from "../../../utils/meadiaUpload";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function AddCategoryForm() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [features, setFeatures] = useState([""]);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isLoading = useAuth();

  function handleAddFeature() {
    if (features[features.length - 1] !== "") {
      setFeatures([...features, ""]);
    } else {
      toast.error("Please fill the current feature before adding a new one.");
    }
  }

  function handleRemoveFeature(index) {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
  }

  function handleFeatureChange(index, value) {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name || !price || !description || !image) {
      return toast.error("Please complete all fields before submitting.");
    }

    // Validate price
    if (isNaN(price) || price <= 0) {
      return toast.error("Please enter a valid price.");
    }

    if (features.some((feature) => feature === "")) {
      return toast.error("Please fill all features.");
    }

    // Check if the selected file is an image
    if (image && !image.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = await uploadMedia(image);
      if (!imageUrl) {
        setLoading(false);
        return toast.error("Image upload failed. Please try again.");
      }

      const newCategory = {
        name,
        price,
        features,
        description,
        image: imageUrl,
      };

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories`;

      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        toast.error("Authentication required. Please log in.");
        navigate("/login");
        return;
      }

      const response = await axios.post(url, newCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(response.data.message);

      setName("");
      setPrice(0);
      setFeatures([""]);
      setDescription("");
      setImage("");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error submitting category, please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
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
