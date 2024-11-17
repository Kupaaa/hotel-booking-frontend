import { useMemo, useState, useEffect } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import { Fab, Switch, FormControlLabel, IconButton, Tooltip } from '@mui/material';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { IoMdAdd } from 'react-icons/io';
import Swal from 'sweetalert2';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { confirmDelete, showErrorMessage, showSuccessMessage } from '../../../utils/confirmDialog';
import TruncateText from '../../../components/TruncateText/TruncateText'; // Assuming the path is correct

// import './adminCategory.css';

export default function AdminCategoryTable() {
  const [categories, setCategories] = useState([]);
  const [categoryIsLoaded, setCategoryIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const columns = useMemo(() => [
    {
      accessorKey: 'tableNumber', // This column will show the row number
      header: '#',
      size: 50,
      Cell: ({ row }) => row.index + 1, // Display the index (row number)
      enableSorting: false, // Enable sorting for the "Name" column
      enableColumnFilter: false, // Enable filtering for the "Name" column
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 150,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      size: 100,
    },
    {
      accessorKey: 'features',
      header: 'Features',
      size: 200,
      // Use the TruncateText component for features column
      Cell: ({ cell }) => (
        <TruncateText text={cell.getValue().join(', ')} limit={50} />
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      size: 200,
      // Use the TruncateText component for description column
      Cell: ({ cell }) => (
        <TruncateText text={cell.getValue()} limit={50} />
      ),
    },
    {
      accessorKey: 'image',
      header: 'Image',
      size: 150,
      Cell: ({ cell }) => (
        <img src={cell.getValue()} alt="Category" style={{ width: 50, height: 50, objectFit: 'cover' }} />
      ),
    },
    {
      accessorKey: 'enabled',
      header: 'Status',
      size: 100,
      Cell: ({ cell }) => (
        <FormControlLabel
          control={<Switch checked={cell.getValue()} />}
          label={cell.getValue() ? 'Enabled' : 'Disabled'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 150,
      Cell: ({ row }) => (
        <>
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
          <IconButton
            color="secondary"
            onClick={() => deleteItem(row.original.name)}
          >
            <MdDelete />
          </IconButton>
        </>
      ),
    },
  ], []);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    Swal.fire({
      title: "Loading...",
      text: "Fetching categories...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/categories`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setCategories(response.data.categories);
        setCategoryIsLoaded(true);
        Swal.close();

        if (response.data.categories.length === 0) {
          Swal.fire("No Categories", "There are no categories available.", "info");
        }
      } catch (error) {
        setError("Failed to fetch categories. Please try again.");
        setCategoryIsLoaded(true);
        Swal.close();
        showErrorMessage("Error!", "Failed to fetch categories. Please try again.");
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

  return (
    <div className="container mx-auto p-5">
      <Fab
        color="primary"
        size="large"
        style={{ position: 'fixed', bottom: '20px', right: '20px' }}
        onClick={() => navigate('/admin/add-category')}
        aria-label="Add category"
      >
        <IoMdAdd size={30} />
      </Fab>

      <h1 className="text-3xl font-bold mb-6 text-center">Category Table</h1>

      <MaterialReactTable
        columns={columns}
        data={categories}
        enablePagination
        initialState={{ pagination: { pageIndex: 0, pageSize: 5 } }}
      />
    </div>
  );
}
