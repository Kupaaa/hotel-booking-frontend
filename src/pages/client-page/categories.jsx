import axios from "axios";
import React, { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]); // State to hold fetched categories

  // Fetch categories when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories`;
        const response = await axios.get(url); // Fetch categories from the backend
        setCategories(response.data.categories); // Store fetched data in state
      } catch (error) {
        console.error("Error fetching categories:", error); // Log error to console
      }
    };

    fetchCategories(); // Call the function to fetch categories
  }, []); // Empty dependency array ensures this runs once

  // Function to delete a category by name
  const deleteItem = async (name) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories/${name}`;
      const response = await axios.delete(url); // Delete the category
      console.log("Item deleted:", response.data); // Log the server response
      setCategories(
        (prevCategories) =>
          prevCategories.filter((category) => category.name !== name) // Update state to remove deleted category
      );
    } catch (error) {
      console.error("Error deleting item:", error); // Log error to console
      // Optionally, handle errors such as showing an error message
    }
  };

  return (
    <div className="container mx-auto p-5">
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
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
