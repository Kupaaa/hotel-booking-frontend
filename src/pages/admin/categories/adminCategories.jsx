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

export default function AdminCategoryTable() {
  const [categories, setCategories] = useState([]);
  const [categoryIsLoaded, setCategoryIsLoaded] = useState(false);
  const [totalCount, setTotalCount] = useState(0); // Total count for pagination
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0); // Current page index
  const [pageSize, setPageSize] = useState(5); // Items per page

  // Function to toggle the enabled status of a category
  const toggleCategoryStatus = async (category) => {
    try {
      const token = localStorage.getItem("token");

      // Make a PATCH request to toggle the category status
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/categories/${
          category.name
        }/toggle`,
        {}, // No body required, just toggle
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update the local state with the updated category status
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === category._id
            ? { ...cat, disabled: response.data.category.disabled }
            : cat
        )
      );

      // Show a success message after the category status is updated
      showSuccessMessage("Status Updated", "Category status has been updated.");
    } catch (error) {
      console.error("Error toggling category status:", error);

      // Revert the optimistic UI change in case of error
      setCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat._id === category._id
            ? { ...cat, disabled: !category.disabled }
            : cat
        )
      );

      // Show an error message
      showErrorMessage(
        "Error!",
        error.response?.data?.message || "Failed to update category status."
      );
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "tableNumber",
        header: "#",
        size: 50,
        // Calculate the table number considering pageIndex and pageSize
        Cell: ({ row }) => pageIndex * pageSize + row.index + 1,
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
          <TruncateText text={cell.getValue().join(", ")} limit={50} />
        ),
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
            alt="Category"
            style={{ width: 50, height: 50, objectFit: "cover" }}
          />
        ),
      },
      {
        accessorKey: "disabled", // This is the field we use for the status
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
                  checked={cell.getValue()}
                  onChange={() => toggleCategoryStatus(row.original)}
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
                onClick={() => deleteItem(row.original.name)}
              >
                <MdDelete />
              </IconButton>
            </Tooltip>
          </>
        ),
      },
    ],
    [pageIndex, pageSize] // Add these dependencies so it recalculates when pagination changes
  );

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/categories`,
        {
          params: { pageIndex, pageSize }, // Pass pagination params
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Set the categories and total count
      setCategories(response.data.categories);
      setTotalCount(response.data.totalCount); // Update total count for pagination

      // If the current page exceeds the total count, go to the previous page
      if ((pageIndex + 1) * pageSize > response.data.totalCount) {
        setPageIndex(pageIndex - 1); // Go to the previous page
      }

      setCategoryIsLoaded(true);
      Swal.close();
    } catch (error) {
      setCategoryIsLoaded(true);
      Swal.close();
      showErrorMessage(
        "Error!",
        error.response?.data?.message || "Failed to fetch categories."
      );
    }
  };

  // Fetch categories when component is mounted or page size/page index changes
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    Swal.fire({
      title: "Loading...",
      text: "Fetching categories...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    fetchCategories();
  }, [isAuthenticated, isLoading, pageIndex, pageSize]);

  // Delete a category
  const deleteItem = async (name) => {
    try {
      const result = await confirmDelete(name);
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const url = `${
          import.meta.env.VITE_BACKEND_URL
        }/api/categories/${name}`;
        await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Re-fetch categories after deletion to ensure everything is up to date
        fetchCategories();

        showSuccessMessage("Deleted!", "The category has been deleted.");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      showErrorMessage(
        "Error!",
        error.response?.data?.message ||
          "Failed to delete item. Please try again."
      );
    }
  };

  // Fast navigation to first and last pages
  const handleFirstPage = () => {
    setPageIndex(0);
  };

  const handleLastPage = () => {
    const lastPage = Math.floor(totalCount / pageSize);
    setPageIndex(lastPage);
  };

  const handleChangePage = (event, newPage) => {
    setPageIndex(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value));
    setPageIndex(0); // Reset page index when rows per page changes
  };

  return (
    <div className="container mx-auto p-5">
      {/* Tooltip added for the Add Category button */}
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

      <h1 className="text-3xl font-bold mb-6 text-center">Category Table</h1>

      {categoryIsLoaded ? (
        <>
          <MaterialReactTable
            columns={columns}
            data={categories} // Directly use the data from the backend
            enablePagination={false}
          />
          <TablePagination
            component="div"
            count={totalCount} // Use the totalCount from the backend
            page={pageIndex}
            rowsPerPage={pageSize}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 100]} // Customize rows per page options
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
                  disabled={pageIndex >= Math.floor(totalCount / pageSize)}
                >
                  <ArrowForward />
                </IconButton>
                <IconButton
                  onClick={handleLastPage}
                  disabled={pageIndex >= Math.floor(totalCount / pageSize)}
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
