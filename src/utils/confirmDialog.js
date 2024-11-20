import Swal from "sweetalert2";

// Function to display confirmation dialog
export const confirmDelete = (itemName) => {
  return Swal.fire({
    title: "Are you sure?",
    text: `Do you really want to delete the item "${itemName}"? This action cannot be undone.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });
};

// Function to display success messages
// export const showSuccessMessage = (title, text) => {
//   Swal.fire({
//     icon: "success",
//     title: title,
//     text: text,
//   });
// };

export const showSuccessMessage = (title, text) => {
  return Swal.fire({
    icon: "success",
    title: title,
    text: text,
    showConfirmButton: true, // Ensures the "OK" button is displayed
  });
};

// Function to display error messages
export const showErrorMessage = (title, text) => {
  Swal.fire({
    icon: "error",
    title: title,
    text: text,
  });
};

// Function to display confirmation dialog for update
export const confirmUpdate = (itemName) => {
  return Swal.fire({
    title: "Are you sure?",
    text: `Do you really want to update the item "${itemName}"? This action will overwrite the current data.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, update it!",
  });
};
