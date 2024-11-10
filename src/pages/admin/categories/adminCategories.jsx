import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  TextField,
  FormControlLabel,
  Switch,
  Fab,
} from "@mui/material";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import {
  confirmDelete,
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";
import useAuth from "../../../hooks/useAuth";
import axios from "axios";
import TruncateText from "../../../components/TruncateText/TruncateText";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function AdminCategoryTable() {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [categoryIsLoaded, setCategoryIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    name: "",
    price: "",
    feature: "",
  });
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuth();

  // Styles for the filter text fields
  const filterTextFieldStyle = {
    marginRight: "20px", // Margin for spacing
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#1e293b", // Border color
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1e293b", // Focused border color
      },
    },
    "& .MuiInputBase-input": {
      color: "#1e293b", // Input text color
    },
    "& .MuiInputLabel-root": {
      color: "#1e293b", // Label text color
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#1e293b", // Focused label text color
    },
  };

  // Fetch categories data on component mount
  useEffect(() => {
    if (isLoading || !isAuthenticated) return; // Don't fetch if not authenticated or loading

    // Show loading spinner
    Swal.fire({
      title: "Loading...",
      text: "Fetching categories...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // Async function to fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token"); // Get authentication token
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/categories`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Include token in request header
          }
        );

        setCategories(response.data.categories); // Set categories state
        setCategoryIsLoaded(true); // Set loading flag to false
        Swal.close(); // Close loading modal

        // Show message if no categories are found
        if (response.data.categories.length === 0) {
          Swal.fire(
            "No Categories",
            "There are no categories available.",
            "info"
          );
        }
      } catch (error) {
        setError("Failed to fetch categories. Please try again."); // Handle errors
        setCategoryIsLoaded(true);
        Swal.close();
        showErrorMessage(
          "Error!",
          "Failed to fetch categories. Please try again.",
          "error"
        ); // Show error message
      }
    };

    fetchCategories();
  }, [isAuthenticated, isLoading]);

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

        setCategories((prevCategories) =>
          prevCategories.filter((category) => category.name !== name)
        );
        showSuccessMessage("Deleted!", "The category has been deleted.");
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
      showErrorMessage("Error!", "Failed to delete item. Please try again.");
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleCategoryStatus = async (category) => {
    const updatedCategory = { ...category, enabled: !category.enabled };
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/categories/${
      category.name
    }`;

    try {
      await axios.put(url, updatedCategory, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories((prevCategories) =>
        prevCategories.map((item) =>
          item.name === category.name ? updatedCategory : item
        )
      );
      showSuccessMessage(
        "Status Updated",
        "Category status updated successfully."
      );
    } catch (error) {
      console.error("Failed to update status:", error);
      showErrorMessage("Error!", "Failed to update status.");
    }
  };

  // Filter categories based on filter state
  const filteredCategories = categories.filter((category) => {
    const nameMatch = category.name
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    const priceMatch = filters.price
      ? category.price.toString().includes(filters.price)
      : true;
    const featureMatch = category.features.some((feature) =>
      feature.toLowerCase().includes(filters.feature.toLowerCase())
    );
    return nameMatch && priceMatch && featureMatch;
  });

  if (isLoading) return <div>Loading...</div>;
  if (categoryIsLoaded && !error) {
    return (
      <div className="container mx-auto p-5">
        <Fab
          color="primary"
          size="large"
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={() => navigate("/admin/add-category")}
          aria-label="Add category"
        >
          <IoMdAdd size={30} />
        </Fab>

        <h1 className="text-3xl font-bold mb-6 text-center">Category Table</h1>

        {/* Filter inputs */}
        <div style={{ marginBottom: "20px" }}>
          <TextField
            label="Filter by Name"
            variant="outlined"
            value={filters.name}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, name: e.target.value }))
            }
            sx={filterTextFieldStyle}
          />
          <TextField
            label="Filter by Price"
            variant="outlined"
            value={filters.price}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, price: e.target.value }))
            }
            type="number"
            sx={filterTextFieldStyle}
          />
          <TextField
            label="Filter by Feature"
            variant="outlined"
            value={filters.feature}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, feature: e.target.value }))
            }
            sx={filterTextFieldStyle}
          />
        </div>

        <TableContainer component={Paper}>
          <Table aria-label="category table">
            <TableHead>
              <TableRow style={{ backgroundColor: "#1e293b" }}>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>#</strong>
                </TableCell>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>Name</strong>
                </TableCell>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>Price</strong>
                </TableCell>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>Features</strong>
                </TableCell>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>Description</strong>
                </TableCell>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>Image</strong>
                </TableCell>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>Status</strong>
                </TableCell>
                <TableCell align="center" style={{ color: "#e0f7fa" }}>
                  <strong>Actions</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((category, index) => (
                  <TableRow key={category.name}>
                    <TableCell align="center" style={{ fontWeight: "bold" }}>
                      {page * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ color: "#212121", maxWidth: 200 }}
                    >
                      <TruncateText text={category.name} limit={20} />
                    </TableCell>
                    <TableCell align="center">${category.price}</TableCell>
                    <TableCell
                      align="center"
                      style={{ color: "#212121", maxWidth: 200 }}
                    >
                      <TruncateText
                        text={category.features.join(", ")}
                        limit={30}
                      />
                    </TableCell>
                    <TableCell
                      align="center"
                      style={{ color: "#212121", maxWidth: 200 }}
                    >
                      <TruncateText text={category.description} limit={50} />
                    </TableCell>
                    <TableCell align="center">
                      <img
                        src={category.image}
                        alt={category.name}
                        style={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <FormControlLabel
                        control={
                          <Switch
                            checked={category.enabled}
                            onChange={() => toggleCategoryStatus(category)}
                            color="primary"
                          />
                        }
                        label={category.enabled ? "Enabled" : "Disabled"}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/admin/update-category/${category.name}`, {
                            state: category,
                          })
                        }
                      >
                        <FaEdit style={{ color: "#1e293b" }} />
                      </IconButton>
                      <IconButton
                        color="secondary"
                        onClick={() => deleteItem(category.name)}
                      >
                        <MdDelete style={{ color: "#f44336" }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCategories.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    );
  }

  return (
    <div>
      <h1>Loading or Error occurred while fetching categories!</h1>
    </div>
  );
}
