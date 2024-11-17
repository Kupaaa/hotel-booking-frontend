import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Fab, Switch, FormControlLabel, IconButton } from "@mui/material";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
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
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        accessorKey: "tableNumber", // This column will show the row number
        header: "#",
        size: 50,
        Cell: ({ row }) => row.index + 1, // Display the index (row number)
        enableSorting: false, // Disable sorting for the row number column
        enableColumnFilter: false, // Disable filtering for the row number column
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
        // Use the TruncateText component for description column
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
        accessorKey: "enabled",
        header: "Status",
        size: 100,
        Cell: ({ cell, row }) => (
          <FormControlLabel
            control={
              <Switch
                checked={cell.getValue()}
                onChange={() => toggleEnabledStatus(row.original)}
              />
            }
            label={cell.getValue() ? "Enabled" : "Disabled"}
          />
        ),
      },
      {
        id: "actions",
        header: "Actions",
        size: 150,
        Cell: ({ row }) => (
          <>
            <IconButton
              color="primary"
              onClick={() =>
                navigate(`/admin/update-gallery-item/${row.original.name}`, {
                  state: row.original, // Passing the whole gallery item data to state
                })
              }
            >
              <FaEdit />
            </IconButton>
            <IconButton
              color="secondary"
              onClick={() => deleteItem(row.original.name)}
            >
              <MdDelete />
            </IconButton>
          </>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    Swal.fire({
      title: "Loading...",
      text: "Fetching gallery items...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const fetchGalleryItems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/gallery`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setGalleryItems(response.data.items || []);
        setGalleryItemsIsLoaded(true);
        Swal.close();

        if (response.data.items.length === 0) {
          Swal.fire(
            "No Items",
            "There are no gallery items available.",
            "info"
          );
        }
      } catch (error) {
        setGalleryItemsIsLoaded(true);
        Swal.close();
        showErrorMessage("Error!", "Failed to fetch gallery items.");
      }
    };

    fetchGalleryItems();
  }, [isAuthenticated, isLoading]);

  const toggleEnabledStatus = async (item) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${item.name}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // After successful response, update the item in the state
      setGalleryItems((prevItems) =>
        prevItems.map((galleryItem) =>
          galleryItem._id === item._id
            ? { ...galleryItem, enabled: response.data.galleryItem.enabled }
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

  const deleteItem = async (name) => {
    try {
      const result = await confirmDelete(name);
      if (result.isConfirmed) {
        const token = localStorage.getItem("token");
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/gallery/${name}`;
        await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setGalleryItems((prevItems) =>
          prevItems.filter((item) => item.name !== name)
        );
        showSuccessMessage("Deleted!", "The gallery item has been deleted.");
      }
    } catch (error) {
      showErrorMessage("Error!", "Failed to delete gallery item.");
    }
  };

  return (
    <div className="container mx-auto p-5">
      <Fab
        color="primary"
        size="large"
        style={{ position: "fixed", bottom: "20px", right: "20px" }}
        onClick={() => navigate("/admin/add-gallery-item")}
        aria-label="Add gallery item"
      >
        <IoMdAdd size={30} />
      </Fab>

      <h1 className="text-3xl font-bold mb-6 text-center">
        Gallery Items Table
      </h1>

      <MaterialReactTable
        columns={columns}
        data={galleryItems}
        enablePagination
        initialState={{ pagination: { pageIndex: 0, pageSize: 5 } }}
      />
    </div>
  );
}
