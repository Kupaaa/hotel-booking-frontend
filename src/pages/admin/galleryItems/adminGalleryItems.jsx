// Import necessary React hooks, components, and libraries
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

// Component for managing gallery items
export default function AdminGalleryTable() {
  const [galleryItems, setGalleryItems] = useState([]); // State for gallery items
  const [galleryItemsIsLoaded, setGalleryItemsIsLoaded] = useState(false); // Loading state for gallery items
  const [totalCount, setTotalCount] = useState(0); // Total count of gallery items for pagination
  const { isLoading, isAuthenticated } = useAuth(); // Custom hook for authentication
  const navigate = useNavigate(); // Hook for navigation

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0); // Current page index
  const [pageSize, setPageSize] = useState(5); // Number of items per page

  // Function to fetch gallery items from the backend
  const fetchGalleryItems = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token for API authentication
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery`, // API endpoint
        {
          params: { pageIndex, pageSize }, // Pass pagination parameters
          headers: { Authorization: `Bearer ${token}` }, // Include token in headers
        }
      );

      // Update gallery items and total count state
      setGalleryItems(response.data.items || []);
      setTotalCount(response.data.totalCount || 0);

      // Mark data as loaded
      setGalleryItemsIsLoaded(true);
      Swal.close(); // Close loading spinner
    } catch (error) {
      // Handle errors and mark data as loaded
      setGalleryItemsIsLoaded(true);
      Swal.close();
      showErrorMessage("Error!", "Failed to fetch gallery items."); // Display error message
    }
  };

  // Fetch data when authentication or pagination state changes
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    // Show loading spinner
    Swal.fire({
      title: "Loading...",
      text: "Fetching gallery items...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    fetchGalleryItems(); // Fetch data from backend
  }, [isAuthenticated, isLoading, pageIndex, pageSize]);

  // Function to toggle the enabled/disabled status of a gallery item
  const toggleEnabledStatus = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${item.name}/toggle`, // API endpoint
        {},
        { headers: { Authorization: `Bearer ${token}` } } // Include token in headers
      );

      // Update the specific item's status in the state
      setGalleryItems((prevItems) =>
        prevItems.map((galleryItem) =>
          galleryItem._id === item._id
            ? { ...galleryItem, disabled: response.data.galleryItem.disabled }
            : galleryItem
        )
      );

      // Show success message
      showSuccessMessage(
        "Status Updated",
        "Gallery item status has been updated."
      );
    } catch (error) {
      console.error("Error toggling gallery item status:", error);
      showErrorMessage("Error!", "Failed to update gallery item status."); // Show error message
    }
  };

  // Function to delete a gallery item
  const deleteGalleryItem = async (name) => {
    try {
      const result = await confirmDelete(name); // Show confirmation dialog
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${name}`, // API endpoint
          { headers: { Authorization: `Bearer ${token}` } } // Include token in headers
        );

        fetchGalleryItems(); // Refresh gallery items after deletion
        showSuccessMessage("Deleted!", "The gallery item has been deleted."); // Show success message
      }
    } catch (error) {
      console.error("Failed to delete gallery item:", error);
      showErrorMessage("Error!", "Failed to delete gallery item."); // Show error message
    }
  };

  // Define table columns for MaterialReactTable
  const columns = useMemo(
    () => [
      {
        accessorKey: "tableNumber", // Custom numbering column
        header: "#",
        size: 50,
        Cell: ({ row }) => pageIndex * pageSize + row.index + 1, // Calculate row numbers based on pagination
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "name",
        header: "Name", // Gallery item name
        size: 150,
      },
      {
        accessorKey: "description",
        header: "Description", // Gallery item description
        size: 200,
        Cell: ({ cell }) => <TruncateText text={cell.getValue()} limit={50} />, // Truncate long descriptions
      },
      {
        accessorKey: "image",
        header: "Image", // Gallery item image
        size: 150,
        Cell: ({ cell }) => (
          <img
            src={cell.getValue()} // Display image from URL
            alt="Gallery Item"
            style={{ width: 50, height: 50, objectFit: "cover" }} // Style the image
          />
        ),
      },
      {
        accessorKey: "disabled",
        header: "Status", // Enabled/disabled status
        size: 100,
        Cell: ({ cell, row }) => (
          <FormControlLabel
            control={
              <Tooltip
                title={
                  cell.getValue() ? "Disable this item" : "Enable this item"
                }
              >
                <Switch
                  checked={cell.getValue()} // Reflect current status
                  onChange={() => toggleEnabledStatus(row.original)} // Toggle status
                />
              </Tooltip>
            }
            label={cell.getValue() ? "Disabled" : "Enabled"} // Display status label
          />
        ),
      },
      {
        id: "actions",
        header: "Actions", // Actions column
        size: 150,
        Cell: ({ row }) => (
          <>
            <Tooltip title="Edit Gallery Item">
              <IconButton
                color="primary"
                onClick={() =>
                  navigate(`/admin/update-gallery-item/${row.original.name}`, {
                    state: row.original,
                  })
                }
              >
                <FaEdit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Gallery Item">
              <IconButton
                color="secondary"
                onClick={() => deleteGalleryItem(row.original.name)} // Call delete function
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
    setPageSize(Number(event.target.value)); // Update rows per page
    setPageIndex(0); // Reset to the first page
  };

  const handleFirstPage = () => {
    setPageIndex(0); // Navigate to the first page
  };

  const handleLastPage = () => {
    const lastPage = Math.ceil(totalCount / pageSize) - 1; // Calculate last page
    setPageIndex(lastPage); // Navigate to the last page
  };

  return (
    <div className="container mx-auto p-5">
      {/* Floating button to add a new gallery item */}
      <Tooltip title="Add Gallery Item">
        <Fab
          color="primary"
          size="large"
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={() => navigate("/admin/add-gallery-item")}
          aria-label="Add gallery item"
        >
          <IoMdAdd size={30} />
        </Fab>
      </Tooltip>

      {/* Table title */}
      <h1 className="text-3xl font-bold mb-6 text-center">
        Gallery Items Table
      </h1>

      {/* Conditional rendering: display table or loading spinner */}
      {galleryItemsIsLoaded ? (
        <>
          <MaterialReactTable
            columns={columns} // Pass columns configuration
            data={galleryItems} // Pass gallery items data
            enablePagination={false} // Disable internal pagination
          />
          <TablePagination
            component="div"
            count={totalCount} // Total number of items
            page={pageIndex} // Current page index
            rowsPerPage={pageSize} // Number of rows per page
            onPageChange={handleChangePage} // Handle page change
            onRowsPerPageChange={handleChangeRowsPerPage} // Handle rows per page change
            rowsPerPageOptions={[5, 10, 25, 100]} // Pagination options
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
        <CircularProgress /> // Display loading spinner if data is not loaded
      )}
    </div>
  );
}
