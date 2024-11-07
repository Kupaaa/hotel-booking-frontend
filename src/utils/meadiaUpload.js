import app from "../config/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

// Initialize storage with default Firebase bucket
const storage = getStorage(app);

export default async function uploadMedia(file) {
  if (!file || !file.name) {
    console.error("No valid file provided");
    toast.error("No valid file provided!"); // Show error toast
    return null;
  }

  // Set path within storage using a timestamp to ensure a unique filename
  const timestamp = new Date().getTime();
  const fileRef = ref(storage, `uploads/${timestamp}-${file.name}`);

  try {
    // Upload the file
    const snapshot = await uploadBytes(fileRef, file);

    // Get the download URL after upload completes
    const downloadURL = await getDownloadURL(fileRef);

    // Show success message with toast
    toast.success("File uploaded successfully!");

    // Return the download URL
    return downloadURL;
  } catch (error) {
    console.error("Upload failed:", error);

    // Show error message with toast
    toast.error("File upload failed. Please try again.");

    // Optionally, rethrow the error to be handled by the calling function
    throw new Error("File upload failed");
  }
}

