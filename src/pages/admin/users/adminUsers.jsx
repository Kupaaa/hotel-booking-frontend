import { useEffect, useState, useMemo } from "react";
import { MaterialReactTable } from "material-react-table";
import {
  Fab,
  IconButton,
  Tooltip,
  CircularProgress,
  TablePagination,
  Box,
  Switch,
  FormControlLabel,
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
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  showErrorMessage,
  showSuccessMessage,
} from "../../../utils/confirmDialog";

export default function AdminUsers() {
  const [users, setUsers] = useState([]); // User data
  const [isLoaded, setIsLoaded] = useState(false); // Data loading status
  const [totalCount, setTotalCount] = useState(0); // Total user count
  const [pageIndex, setPageIndex] = useState(0); // Current page index
  const [pageSize, setPageSize] = useState(5); // Users per page
  const navigate = useNavigate(); // Navigation hook

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setIsLoaded(false); // Indicate loading state
      Swal.fire({
        title: "Loading...",
        text: "Fetching user data...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      // Fetch data from API
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/users`,
        {
          params: { pageIndex, pageSize },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUsers(response.data.users || []); // Update user list
      setTotalCount(response.data.totalCount || 0); // Update total user count
      setIsLoaded(true); // Data loading complete
      Swal.close(); // Close loading modal
    } catch (error) {
      setIsLoaded(true);
      console.error("Failed to fetch users:", error);
      Swal.close();
      showErrorMessage("Error!", "Failed to load users. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users whenever pageIndex or pageSize changes
  }, [pageIndex, pageSize]);

  // Delete a user
  const deleteUser = async (email, name) => {
    try {
      // Confirm deletion with a custom confirmation dialog
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `This will permanently delete the user ${name}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem("token"); // Get auth token

        // Send DELETE request to backend
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/${encodeURIComponent(
            email
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        fetchUsers(); // Refresh the user list
        showSuccessMessage("Deleted!", "The user has been deleted.", "success");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      showErrorMessage("Error", "Failed to delete user.", "error");
    }
  };

  // Toggle disabled status
  const toggleUserStatus = async (user) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/${user.email}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) =>
        prevUsers.map((existingUser) =>
          existingUser.email === user.email
            ? { ...existingUser, disabled: response.data.user.disabled }
            : existingUser
        )
      );

      showSuccessMessage(
        "Status Updated",
        `User status has been ${
          response.data.user.disabled ? "disabled" : "enabled"
        }.`
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      showErrorMessage("Error!", "Failed to update user status.");
    }
  };

  // Toggle blocked status
  const toggleBlockedStatus = async (user) => {
    try {
      const token = localStorage.getItem("token");

      const endpoint = user.blocked
        ? `${import.meta.env.VITE_BACKEND_URL}/api/users/${user.email}/unblock`
        : `${import.meta.env.VITE_BACKEND_URL}/api/users/${user.email}/block`;

      const response = await axios.patch(
        endpoint,
        user.blocked ? {} : { reason: "Admin blocked the user" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) =>
        prevUsers.map((existingUser) =>
          existingUser.email === user.email
            ? { ...existingUser, blocked: response.data.user.blocked }
            : existingUser
        )
      );

      showSuccessMessage(
        "Blocked Status Updated",
        `User has been ${user.blocked ? "unblocked" : "blocked"} successfully.`
      );
    } catch (error) {
      console.error("Error toggling blocked status:", error);
      showErrorMessage("Error!", "Failed to update blocked status.");
    }
  };

  // Define table columns with tooltips
  const columns = useMemo(
    () => [
      {
        accessorKey: "tableNumber",
        header: "#",
        size: 50,
        Cell: ({ row }) => pageIndex * pageSize + row.index + 1,
      },
      { accessorKey: "firstName", header: "First Name", size: 150 },
      { accessorKey: "lastName", header: "Last Name", size: 150 },
      { accessorKey: "email", header: "Email", size: 200 },
      { accessorKey: "phone", header: "Phone", size: 150 },
      {
        accessorKey: "whatsApp",
        header: "WhatsApp",
        size: 150,
        Cell: ({ cell }) => (
          <Tooltip title="Open WhatsApp chat">
            <a
              href={`https://wa.me/${cell.getValue()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {cell.getValue()}
            </a>
          </Tooltip>
        ),
      },
      { accessorKey: "type", header: "Type", size: 100 },
      {
        accessorKey: "image",
        header: "Image",
        size: 150,
        Cell: ({ cell }) => (
          <Tooltip title="User profile image">
            <img
              src={cell.getValue()}
              alt="User"
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          </Tooltip>
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
                  row.original.blocked
                    ? "User is blocked and cannot be toggled"
                    : cell.getValue()
                    ? "Disable this user"
                    : "Enable this user"
                }
              >
                <Switch
                  checked={cell.getValue()} // Reflect the current "disabled" status
                  onChange={() => toggleUserStatus(row.original)} // Toggle the status
                  disabled={row.original.blocked} // Disable toggle if the user is blocked
                />
              </Tooltip>
            }
            label={cell.getValue() ? "Disabled" : "Enabled"} // Dynamically set the label
          />
        ),
      },

      {
        accessorKey: "blocked",
        header: "Blocked",
        size: 100,
        Cell: ({ cell, row }) => (
          <Tooltip
            title={
              cell.getValue()
                ? "Click to unblock this user"
                : "Click to block this user"
            }
          >
            <FormControlLabel
              control={
                <Switch
                  checked={cell.getValue()}
                  onChange={() => toggleBlockedStatus(row.original)}
                  disabled={row.original.type === "Admin"} // Disable switch for Admins
                />
              }
              label={
                <span style={{ color: cell.getValue() ? "red" : "green" }}>
                  {cell.getValue() ? "Blocked" : "Unblocked"}
                </span>
              }
            />
          </Tooltip>
        ),
      },

      {
        id: "actions",
        header: "Actions",
        size: 150,
        Cell: ({ row }) => (
          <>
            <Tooltip title="Edit User">
              <IconButton
                color="primary"
                onClick={() =>
                  navigate(`/admin/update-user/${row.original._id}`, {
                    state: row.original,
                  })
                }
              >
                <FaEdit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete User">
              <IconButton
                color="secondary"
                onClick={() =>
                  deleteUser(row.original.email, row.original.firstName)
                }
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

  const handleChangePage = (event, newPage) => setPageIndex(newPage);
  const handleChangeRowsPerPage = (event) => {
    setPageSize(Number(event.target.value));
    setPageIndex(0);
  };

  const handleFirstPage = () => setPageIndex(0);
  const handleLastPage = () =>
    setPageIndex(Math.ceil(totalCount / pageSize) - 1);

  return (
    <div className="container mx-auto p-5">
      <Tooltip title="Add New User">
        <Fab
          color="primary"
          size="large"
          style={{ position: "fixed", bottom: "20px", right: "20px" }}
          onClick={() => navigate("/admin/add-user")}
        >
          <IoMdAdd size={30} />
        </Fab>
      </Tooltip>

      <h1 className="text-3xl font-bold mb-6 text-center">Admin Users</h1>

      {isLoaded ? (
        <>
          <MaterialReactTable
            columns={columns}
            data={users}
            enablePagination={false}
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
        <div className="flex justify-center items-center">
          <CircularProgress />
        </div>
      )}
    </div>
  );
}
