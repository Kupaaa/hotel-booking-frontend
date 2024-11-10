import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, TablePagination } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import Swal from "sweetalert2";
import TruncateText from "../../../components/TruncateText/TruncateText";

// Custom hook for debouncing input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer); // Clean up timeout on value change
  }, [value, delay]);

  return debouncedValue;
}

export default function AdminGalleryItems() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([
    {
      name: "Category 1",
      price: 20,
      features: ["Feature 1", "Feature 2"],
      description: "A very long descriptionA very long descriptionA very long descriptionA very long descriptionA very long descriptionA very long descriptionA very long descriptionA very long descriptionA very long description...",
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Category 2",
      price: 30,
      features: ["Feature 3", "Feature 4"],
      description: "Description for Category 2",
      image: "https://via.placeholder.com/150",
    },
    // Add other categories as needed
  ]);

  const [nameFilter, setNameFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [featureFilter, setFeatureFilter] = useState("");
  const [page, setPage] = useState(0); // current page
  const [rowsPerPage, setRowsPerPage] = useState(5); // items per page

  // Using the debounce hook for better performance
  const debouncedNameFilter = useDebounce(nameFilter, 500);
  const debouncedFeatureFilter = useDebounce(featureFilter, 500);

  // Filter categories based on the filters
  const filteredCategories = categories.filter((category) => {
    return (
      category.name.toLowerCase().includes(debouncedNameFilter.toLowerCase()) &&
      (priceFilter ? category.price === Number(priceFilter) : true) &&
      (debouncedFeatureFilter ? category.features.some((feature) => feature.toLowerCase().includes(debouncedFeatureFilter.toLowerCase())) : true)
    );
  });

  const deleteItem = (categoryName) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you really want to delete the item "${categoryName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Deleted!", `Category "${categoryName}" has been deleted.`, "success");
        setCategories(categories.filter((category) => category.name !== categoryName));
      }
    });
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page
  };

  return (
    <div className="container mx-auto p-5">
      <IconButton
        color="primary"
        size="large"
        style={{ position: "fixed", bottom: "20px", right: "20px" }}
        onClick={() => navigate("/admin/add-category")}
        aria-label="Add category"
      >
        <IoMdAdd size={30} />
      </IconButton>

      <h1 className="text-3xl font-bold mb-6 text-center">Category Table</h1>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <TextField
          label="Filter by Name"
          variant="outlined"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          sx={{
            marginRight: "20px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#1e293b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1e293b",
              },
            },
            "& .MuiInputBase-input": {
              color: "#1e293b",
            },
            "& .MuiInputLabel-root": {
              color: "#1e293b",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#1e293b",
            },
          }}
          aria-label="Filter by name"
        />
        <TextField
          label="Filter by Price"
          variant="outlined"
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
          type="number"
          sx={{
            marginRight: "20px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#1e293b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1e293b",
              },
            },
            "& .MuiInputBase-input": {
              color: "#1e293b",
            },
            "& .MuiInputLabel-root": {
              color: "#1e293b",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#1e293b",
            },
          }}
          aria-label="Filter by price"
        />
        <TextField
          label="Filter by Feature"
          variant="outlined"
          value={featureFilter}
          onChange={(e) => setFeatureFilter(e.target.value)}
          sx={{
            marginRight: "20px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#1e293b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#1e293b",
              },
            },
            "& .MuiInputBase-input": {
              color: "#1e293b",
            },
            "& .MuiInputLabel-root": {
              color: "#1e293b",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "#1e293b",
            },
          }}
          aria-label="Filter by feature"
        />
      </div>

      <TableContainer component={Paper}>
        <Table aria-label="category table">
          <TableHead>
            <TableRow style={{ backgroundColor: "#1e293b" }}>
              <TableCell align="center" style={{ color: "#e0f7fa" }}><strong>Name</strong></TableCell>
              <TableCell align="center" style={{ color: "#e0f7fa" }}><strong>Price</strong></TableCell>
              <TableCell align="center" style={{ color: "#e0f7fa" }}><strong>Features</strong></TableCell>
              <TableCell align="center" style={{ color: "#e0f7fa" }}><strong>Description</strong></TableCell>
              <TableCell align="center" style={{ color: "#e0f7fa" }}><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category) => (
              <TableRow key={category.name}>
                <TableCell align="center" style={{ color: "#212121" }}>{category.name}</TableCell>
                <TableCell align="center" style={{ color: "#212121" }}>${category.price}</TableCell>
                <TableCell align="center" style={{ color: "#212121" }}>{category.features.join(", ")}</TableCell>
                <TableCell align="center" style={{ color: "#212121", maxWidth: 200 }}>
                  <TruncateText text={category.description} limit={100} />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => navigate(`/admin/edit-category/${category.name}`)}>
                    <FaEdit color="#01579b" />
                  </IconButton>
                  <IconButton onClick={() => deleteItem(category.name)}>
                    <MdDelete color="#d32f2f" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={filteredCategories.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Rows per page"
      />
    </div>
  );
}
