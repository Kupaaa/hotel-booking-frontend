import { useState } from "react";
import uploadMedia from "../../utils/meadiaUpload";


export default function Test1() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloadURL, setDownloadURL] = useState("");

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        setLoading(true); // Set loading state
        const url = await uploadMedia(file);
        if (url) {
            setDownloadURL(url); // Save download URL
        }
        setLoading(false); // Reset loading state
    };

    return (
        <div className="w-full h-[100vh] flex justify-center items-center">
            <input
                type="file"
                onChange={(e) => {
                    setFile(e.target.files[0]);
                }}
            />
            
            <button onClick={() => uploadMedia(file)}>
                Submit
            </button>
        </div>
    );
}

