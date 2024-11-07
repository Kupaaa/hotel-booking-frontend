import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]); // State to hold fetched categories
  const [categoryIsLoaded, setCategoryIsLoaded] = useState(false); // State to track loading status
  const [error, setError] = useState(null); // State to track errors
  const navigate = useNavigate();

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request header
          },
        });
        setCategories(response.data.categories); // Store fetched data in state
        setCategoryIsLoaded(true); // Set loading to true after data is loaded
      } catch (error) {
        setError("Failed to fetch categories. Please try again.");
        setCategoryIsLoaded(true); // Set loading to true to prevent infinite loading if an error occurs
        console.error("Error fetching categories:", error); // Log error to console
      }
    };

    fetchCategories(); // Call the function to fetch categories
  }, []); // Empty dependency array ensures this runs once

  // Function to delete a category by name
  const deleteItem = async (name) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories/${name}`;
      await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the request header
        },
      });

      setCategories(
        (prevCategories) =>
          prevCategories.filter((category) => category.name !== name) // Update state to remove deleted category
      );

      toast.success("Item deleted successfully"); // Show success toast
    } catch {
      toast.error("Failed to delete item. Please try again."); // Show error toast
    }
  };

  if (!categoryIsLoaded) {
    return <div>Loading...</div>; // Show loading message while categories are being fetched
  }

  if (error) {
    return <div>{error}</div>; // Show error message if there's an error fetching categories
  }

  if (categories.length === 0) {
    return <div>No categories available.</div>; // Handle case where no categories are returned
  }

  function handlePlusClick() {
    // window.location.href = "/admin/add-category"
    navigate("/admin/add-category");
  }

  return (
    <div className="container mx-auto p-5">
      <button
        className="bg-red-600 w-[60px] h-[60px] rounded-full text-5xl flex justify-center items-center fixed bottom-5 right-5"
        onClick={() => {
          handlePlusClick();
        }}
      >
        <IoMdAdd />
      </button>
      <h1 className="text-3xl font-bold mb-6 text-center">Category Table</h1>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Name
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Price
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Features
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Description
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Image
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              <td className="py-3 px-6">{category.name}</td>
              <td className="py-3 px-6">${category.price}</td>
              <td className="py-3 px-6">{category.features.join(", ")}</td>
              <td className="py-3 px-6">{category.description}</td>
              <td className="py-3 px-6">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-16 h-16 rounded"
                />
              </td>
              <td className="py-3 px-6">
                <button
                  onClick={() => {
                    deleteItem(category.name);
                  }} // Handle delete action
                  className="ml-4 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  aria-label={`Delete category: ${category.name}`}
                >
                  <MdDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
