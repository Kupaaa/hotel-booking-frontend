import { useState } from "react";
import uploadMedia from "../../utils/meadiaUpload";

export default function Test1() {
    const [file, setFile] = useState(null);

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
