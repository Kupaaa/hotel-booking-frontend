import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { FaEdit } from "react-icons/fa";
import {
  confirmDelete,
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";
import Swal from "sweetalert2";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]); // State to hold fetched categories
  const [categoryIsLoaded, setCategoryIsLoaded] = useState(false); // State to track loading status
  const [error, setError] = useState(null); // State to track errors
  const navigate = useNavigate();

  const { isLoading, isAuthenticated } = useAuth(); // Use the custom hook to handle authentication

  useEffect(() => {
    const fetchCategories = async () => {
      if (isLoading) return; // Wait until authentication is done

      if (!isAuthenticated) {
        // If not authenticated, navigate to login
        return;
      }

      try {
        // Show SweetAlert2 loading spinner with minimal delay (1ms)
        // setTimeout(() => {
        //   Swal.fire({
        //     title: 'Loading categories...',
        //     text: 'Please wait while we fetch the categories.',
        //     allowOutsideClick: false, // Prevent closing the modal by clicking outside
        //     didOpen: () => {
        //       Swal.showLoading(); // Show the loading spinner
        //     },
        //   });
        // }, 0.1);

        const token = localStorage.getItem("token");
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request header
          },
        });

        setCategories(response.data.categories); // Store fetched data in state
        setCategoryIsLoaded(true); // Set loading to true after data is loaded

        Swal.close(); // Close the loading spinner once data is fetched

        if (response.data.categories.length === 0) {
          // Show alert if no categories are found
          Swal.fire(
            "No Categories",
            "There are no categories available.",
            "info"
          );
        }
      } catch (error) {
        setError("Failed to fetch categories. Please try again.");
        setCategoryIsLoaded(true); // Set loading to true to prevent infinite loading if an error occurs
        console.error("Error fetching categories:", error); // Log error to console

        // Show error message with SweetAlert2
        Swal.fire(
          "Error!",
          "Failed to fetch categories. Please try again.",
          "error"
        );
      }
    };

    fetchCategories(); // Call the function to fetch categories
  }, [isAuthenticated, isLoading]); // Add dependencies for re-running the effect

  // Function to delete a category by name
  const deleteItem = async (name) => {
    try {
      // Call the confirm dialog and wait for the user's response
      const result = await confirmDelete(name);

      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const url = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/categories/${name}`;
        await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request header
          },
        });

        // Update the categories state after deletion
        setCategories(
          (prevCategories) =>
            prevCategories.filter((category) => category.name !== name) // Remove deleted category from state
        );

        // Show success message
        showSuccessMessage("Deleted!", "The category has been deleted."); // Use the showSuccessMessage function
      }
    } catch (error) {
      console.error("Failed to delete item:", error); // Log the full error for debugging
      // Show error message
      showErrorMessage("Error!", "Failed to delete item. Please try again."); // Use the showErrorMessage function
    }
  };

  // Conditional rendering for loaded categories or error states
  if (isLoading) {
    return <div>Loading...</div>; // You could also use a SweetAlert2 loading message here
  }

  if (categoryIsLoaded && !error) {
    return (
      <div className="container mx-auto p-5">
        <button
          className="bg-red-600 w-[60px] h-[60px] rounded-full text-5xl flex justify-center items-center fixed bottom-5 right-5"
          onClick={() => navigate("/admin/add-category")}
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
                <td className="py-3 px-6 flex space-x-2">
                  {/* Edit button */}
                  <Link
                    to={`/admin/update-category`} // Add the category ID to the URL
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    state={category}
                  >
                    <FaEdit />
                  </Link>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteItem(category.name)} // Handle delete action
                    className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
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

  if (error) {
    return <div>{error}</div>; // Show error message if there's an error fetching categories
  }

  return <div>No categories available.</div>; // Handle case where no categories are returned
}
