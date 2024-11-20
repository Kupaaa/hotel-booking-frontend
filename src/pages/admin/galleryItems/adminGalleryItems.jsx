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

export default function AdminGalleryTable() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [galleryItemsIsLoaded, setGalleryItemsIsLoaded] = useState(false);
  const [totalCount, setTotalCount] = useState(0); // Total count for pagination
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0); // Current page index
  const [pageSize, setPageSize] = useState(5); // Items per page

  // Function to toggle the enabled status of a gallery item
  const toggleEnabledStatus = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${item.name}/toggle`,
        {}, // No body required, just toggle
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setGalleryItems((prevItems) =>
        prevItems.map((galleryItem) =>
          galleryItem._id === item._id
            ? { ...galleryItem, disabled: response.data.galleryItem.disabled }
            : galleryItem
        )
      );

      showSuccessMessage(
        "Status Updated",
        "Gallery item status has been updated."
      );
    } catch (error) {
      showErrorMessage("Error!", "Failed to update gallery item status.");
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "tableNumber", // Row number
        header: "#",
        size: 50,
        Cell: ({ row }) => pageIndex * pageSize + row.index + 1, // Row number based on pagination
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 150,
      },
      {
        accessorKey: "description",
        header: "Description",
        size: 200,
        Cell: ({ cell }) => <TruncateText text={cell.getValue()} limit={50} />,
      },
      {
        accessorKey: "image",
        header: "Image",
        size: 150,
        Cell: ({ cell }) => (
          <img
            src={cell.getValue()}
            alt="Gallery Item"
            style={{ width: 50, height: 50, objectFit: "cover" }}
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
                  cell.getValue() ? "Disable this item" : "Enable this item"
                }
              >
                <Switch
                  checked={cell.getValue()} // Off means enabled (disabled: false), On means disabled (disabled: true)
                  onChange={() => toggleEnabledStatus(row.original)}
                />
              </Tooltip>
            }
            label={cell.getValue() ? "Disabled" : "Enabled"}
          />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 150,
        Cell: ({ row }) => (
          <>
            <Tooltip title="Edit gallery item">
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
            <Tooltip title="Delete gallery item">
              <IconButton
                color="secondary"
                onClick={() => deleteItem(row.original.name)}
              >
                <MdDelete />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [pageIndex, pageSize] // Recalculate when pagination changes
  );

  // Fetch gallery items from backend
  const fetchGalleryItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery`,
        {
          params: { pageIndex, pageSize }, // Include pagination params
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setGalleryItems(response.data.items);
      setTotalCount(response.data.totalCount); // Set total count for pagination
      setGalleryItemsIsLoaded(true);
      Swal.close();

      if (response.data.items.length === 0) {
        Swal.fire("No Items", "There are no gallery items available.", "info");
      }
    } catch (error) {
      setGalleryItemsIsLoaded(true);
      Swal.close();
      showErrorMessage("Error!", "Failed to fetch gallery items.");
    }
  };

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    Swal.fire({
      title: "Loading...",
      text: "Fetching gallery items...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    fetchGalleryItems();
  }, [isAuthenticated, isLoading, pageIndex, pageSize]);

  // Delete gallery item
  const deleteItem = async (name) => {
    try {
      const result = await confirmDelete(name); // Show confirmation dialog
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${name}`; // URL for deleting the gallery item

        // Send the DELETE request
        await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Re-fetch the gallery items after deletion to ensure the UI is updated
        fetchGalleryItems();

        // Show a success message
        showSuccessMessage("Deleted!", "The gallery item has been deleted.");
      }
    } catch (error) {
      // Handle errors
      console.error("Failed to delete gallery item:", error);
      showErrorMessage(
        "Error!",
        error.response?.data?.message || "Failed to delete gallery item."
      );
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPageIndex(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value));
    setPageIndex(0); // Reset page index when rows per page changes
  };

  const handleFirstPage = () => {
    setPageIndex(0);
  };

  const handleLastPage = () => {
    const lastPage = Math.floor(totalCount / pageSize);
    setPageIndex(lastPage);
  };

  return (
    <div className="container mx-auto p-5">
      <Tooltip title="Add gallery item" arrow>
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

      <h1 className="text-3xl font-bold mb-6 text-center">
        Gallery Items Table
      </h1>

      {galleryItemsIsLoaded ? (
        <>
          <MaterialReactTable
            columns={columns}
            data={galleryItems}
            enablePagination={false} // We will handle pagination manually
          />
          <TablePagination
            component="div"
            count={totalCount}
            page={pageIndex}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 100]}
            ActionsComponent={() => (
              <Box display="flex" alignItems="center" justifyContent="center">
                <IconButton
                  onClick={handleFirstPage}
                  disabled={pageIndex === 0}
                >
                  <FirstPage />
                </IconButton>
                <IconButton
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={pageIndex === 0}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={pageIndex === Math.floor(totalCount / pageSize)}
                >
                  <ArrowForward />
                </IconButton>
                <IconButton
                  onClick={handleLastPage}
                  disabled={pageIndex === Math.floor(totalCount / pageSize)}
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
