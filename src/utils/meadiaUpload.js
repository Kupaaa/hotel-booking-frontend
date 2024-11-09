import app from "../config/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize storage with default Firebase bucket
const storage = getStorage(app);

export default async function uploadMedia(file) {
  if (!file || !file.name) {
    console.error("No valid file provided");
    return null;
  }

  // Validate file type (example: image types only)
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    console.error('Unsupported file type');
    return null;
  }

  // Validate file size (e.g., max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    console.error('File size exceeds the 5MB limit');
    return null;
  }

  // Set path within storage using a timestamp to ensure a unique filename
  const timestamp = new Date().getTime();
  const fileRef = ref(storage, `uploads/${timestamp}-${file.name}`);

  try {
    // Upload the file
    await uploadBytes(fileRef, file);

    // Get the download URL after upload completes
    const downloadURL = await getDownloadURL(fileRef);

    // Return the download URL
    return downloadURL;
  } catch (error) {
    // Log the error to the console if the upload fails
    console.error("Upload failed:", error);

    // Optionally, rethrow the error to be handled by the calling function
    throw new Error("File upload failed");
  }
}
