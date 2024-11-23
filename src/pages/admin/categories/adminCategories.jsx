// Importing required libraries, components, and icons
import { useMemo, useState, useEffect } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Fab,
  Switch,
  FormControlLabel,
  IconButton,
  CircularProgress,
  Tooltip,
  TablePagination,
  Box,
} from "@mui/material";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import {
  ArrowBack,
  ArrowForward,
  FirstPage,
  LastPage,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  confirmDelete,
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";
import TruncateText from "../../../components/TruncateText/TruncateText";

// Main AdminCategoryTable Component
export default function AdminCategoryTable() {
  // State variables for managing categories, loading state, and total count
  const [categories, setCategories] = useState([]);
  const [categoryIsLoaded, setCategoryIsLoaded] = useState(false);
  const [totalCount, setTotalCount] = useState(0); // Total count for pagination
  const { isLoading, isAuthenticated } = useAuth(); // Custom hook for auth
  const navigate = useNavigate();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0); // Current page index
  const [pageSize, setPageSize] = useState(5); // Items per page

  // Function to fetch categories from the backend
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve the token for authentication
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/categories`, // API endpoint for categories
        {
          params: { pageIndex, pageSize }, // Pass pagination params to the API
          headers: { Authorization: `Bearer ${token}` }, // Include token in headers
        }
      );

      // Update the state with fetched categories and total count
      setCategories(response.data.categories || []);
      setTotalCount(response.data.totalCount || 0);

      // Mark the loading state as complete
      setCategoryIsLoaded(true);
      Swal.close();
    } catch (error) {
      setCategoryIsLoaded(true); // Ensure the loading spinner stops
      Swal.close();
      showErrorMessage("Error!", "Failed to fetch categories."); // Show error message
    }
  };

  // Effect to fetch categories whenever pagination or authentication state changes
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    Swal.fire({
      title: "Loading...",
      text: "Fetching categories...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    fetchCategories(); // Fetch the data
  }, [isAuthenticated, isLoading, pageIndex, pageSize]);

  // Function to toggle the enabled/disabled status of a category
  const toggleCategoryStatus = async (category) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/categories/${
          category.name
        }/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the category status in the state
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === category._id
            ? { ...cat, disabled: response.data.category.disabled }
            : cat
        )
      );

      // Show success message
      showSuccessMessage("Status Updated", "Category status has been updated.");
    } catch (error) {
      console.error("Error toggling category status:", error); // Log error details
      showErrorMessage("Error!", "Failed to update category status."); // Show error message
    }
  };

  // Function to delete a category
  const deleteCategory = async (name) => {
    try {
      const result = await confirmDelete(name); // Show confirmation dialog
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/categories/${name}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        fetchCategories(); // Refresh the category list after deletion
        showSuccessMessage("Deleted!", "The category has been deleted.");
      }
    } catch (error) {
      console.error("Failed to delete category:", error); // Log error details
      showErrorMessage("Error!", "Failed to delete category."); // Show error message
    }
  };

  // Define the table columns
  const columns = useMemo(
    () => [
      {
        accessorKey: "tableNumber",
        header: "#",
        size: 50,
        Cell: ({ row }) => pageIndex * pageSize + row.index + 1, // Dynamically calculate row numbers
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "price",
        header: "Price",
        size: 100,
      },
      {
        accessorKey: "features",
        header: "Features",
        size: 200,
        Cell: ({ cell }) => (
          <TruncateText text={cell.getValue().join(", ")} limit={50} /> // Truncate long features list
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 200,
        Cell: ({ cell }) => <TruncateText text={cell.getValue()} limit={50} />, // Truncate long descriptions
      },
      {
        accessorKey: "image",
        header: "Image",
        size: 150,
        Cell: ({ cell }) => (
          <img
            src={cell.getValue()} // Display the image from the URL
            alt="Category"
            style={{ width: 50, height: 50, objectFit: "cover" }} // Style the image
          />
        ),
      },
      {
        accessorKey: "disabled",
        header: "Status",
        size: 100,
        Cell: ({ cell, row }) => (
          <FormControlLabel
            control={
              <Tooltip
                title={
                  cell.getValue()
                    ? "Disable this category"
                    : "Enable this category"
                }
              >
                <Switch
                  checked={cell.getValue()} // Reflect the current status
                  onChange={() => toggleCategoryStatus(row.original)} // Toggle the status
                />
              </Tooltip>
            }
            label={cell.getValue() ? "Disabled" : "Enabled"} // Display the status label
          />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 150,
        Cell: ({ row }) => (
          <>
            <Tooltip title="Edit Category">
              <IconButton
                color="primary"
                onClick={() =>
                  navigate(`/admin/update-category/${row.original.name}`, {
                    state: row.original,
                  })
                }
              >
                <FaEdit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Category">
              <IconButton
                color="secondary"
                onClick={() => deleteCategory(row.original.name)}
              >
                <MdDelete />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [pageIndex, pageSize]
  );

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPageIndex(newPage); // Update the page index
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value)); // Update the page size
    setPageIndex(0); // Reset to the first page
  };

  const handleFirstPage = () => {
    setPageIndex(0); // Navigate to the first page
  };

  const handleLastPage = () => {
    const lastPage = Math.floor(totalCount / pageSize); // Calculate the last page index
    setPageIndex(lastPage); // Navigate to the last page
  };

  return (
    <div className="container mx-auto p-5">
      {/* Floating action button to add a new category */}
      <Tooltip title="Add New Category">
        <Fab
          color="primary"
          size="large"
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={() => navigate("/admin/add-category")}
          aria-label="Add category"
        >
          <IoMdAdd size={30} />
        </Fab>
      </Tooltip>

      {/* Table heading */}
      <h1 className="text-3xl font-bold mb-6 text-center">Category Table</h1>

      {/* Conditional rendering of the table or loader */}
      {categoryIsLoaded ? (
        <>
          <MaterialReactTable
            columns={columns} // Pass the table columns
            data={categories} // Pass the category data
            enablePagination={false} // Disable internal pagination
          />
          <TablePagination
            component="div"
            count={totalCount} // Total number of items
            page={pageIndex} // Current page index
            rowsPerPage={pageSize} // Rows per page
            onPageChange={handleChangePage} // Handle page change
            onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change
            rowsPerPageOptions={[5, 10, 25, 100]} // Options for rows per page
            ActionsComponent={() => (
              <Box display="flex" alignItems="center" justifyContent="center">
                <IconButton
                  onClick={handleFirstPage}
                  disabled={pageIndex === 0}
                >
                  <FirstPage />
                </IconButton>
                <IconButton
                  onClick={(event) => handleChangePage(event, pageIndex - 1)}
                  disabled={pageIndex === 0}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton
                  onClick={(event) => handleChangePage(event, pageIndex + 1)}
                  disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
                >
                  <ArrowForward />
                </IconButton>
                <IconButton
                  onClick={handleLastPage}
                  disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
                >
                  <LastPage />
                </IconButton>
              </Box>
            )}
          />
        </>
      ) : (
        <div
        // style={{
        //   display: "flex",
        //   justifyContent: "center",
        //   alignItems: "center",
        //   height: "300px",
        // }}
        >
          <CircularProgress />
        </div>
      )}
    </div>
  );
}
