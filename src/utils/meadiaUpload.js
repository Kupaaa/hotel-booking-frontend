import app from "../config/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Initialize storage with default Firebase bucket
const storage = getStorage(app);

export default async function uploadMedia(file) {
    if (!file || !file.name) {
        console.error("No valid file provided");
        return;
    }

    // Set path within storage (e.g., 'uploads' folder)
    const fileRef = ref(storage, `uploads/${file.name}`);

    try {
        // Upload the file
        const snapshot = await uploadBytes(fileRef, file);
        console.log("Uploaded a blob or file!");

        // Get the download URL
        const downloadURL = await getDownloadURL(fileRef);
        console.log("File available at", downloadURL);
        
        // Return the download URL
        return downloadURL;

    } catch (error) {
        console.error("Upload failed:", error);
        return null; // Return null on error
    }
}
