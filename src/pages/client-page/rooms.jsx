import axios from "axios";
import { useEffect, useState } from "react";

export default function RoomsPage() {
  // State to store room data
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    // Function to fetch room data from the backend
    const fetchRooms = async () => {
      try {
        // Constructing the API URL using an environment variable
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/rooms`;
        // Making a GET request to the API
        const response = await axios.get(url);
        // Updating the state with the fetched rooms data
        setRooms(response.data.rooms);
      } catch (error) {
        // Logging any errors that occur during the fetch
        console.error("Error fetching rooms:", error);
      }
    };

    // Calling the fetchRooms function when the component mounts
    fetchRooms();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold mb-6 text-center">Room Table</h1>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Room ID
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Category
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Available
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Max Guests
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Special Description
            </th>
            <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Photos
            </th>
            {/* <th className="py-3 px-6 bg-blue-600 text-white text-left text-sm font-semibold">
              Notes
            </th> */}
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              <td className="py-3 px-6">{room.roomId}</td>
              <td className="py-3 px-6">{room.category}</td>
              <td className="py-3 px-6">{room.available ? "Yes" : "No"}</td>
              <td className="py-3 px-6">{room.maxGuests}</td>
              <td className="py-3 px-6">{room.specialDescription}</td>
              <td className="py-3 px-6">
                {room.photos.map((photo, idx) => (
                  <img
                    key={idx}
                    src={photo}
                    alt={`Room ${room.roomId}`}
                    className="w-16 h-16 rounded"
                  />
                ))}
              </td>
              {/* <td className="py-3 px-6">{room.notes}</td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
