import { FaBookmark, FaUserCog } from "react-icons/fa";
import { FaTicketSimple } from "react-icons/fa6";
import { MdCategory, MdFeedback, MdRoomPreferences } from "react-icons/md";
import { RiGalleryFill } from "react-icons/ri";
import { Link, Route, Routes } from "react-router-dom";
import AdminBookings from "../admin/bookings/adminBookings";
import AdminRooms from "../admin/rooms/adminRooms";
import AdminUsers from "../admin/users/adminUsers";
import AdminFeedback from "../admin/feedback/adminFeedback";
import AdminTickets from "../admin/adminTickets/adminTickets";
import AdminGalleryItems from "../admin/galleryItems/adminGalleryItems";
import AdminCategories from "../admin/categories/adminCategories";
import AddCategoryForm from "../admin/addCategoryForm/addCategoryForm";
import useAuth from "../../hooks/useAuth";


export default function AdminPage() {
  // Use the custom authentication hook
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    // Optionally display a loading spinner or message while checking the token
    return <div>Loading...</div>;
  }

  // If not authenticated, prevent rendering of the admin page
  if (!isAuthenticated) {
    return null; // Alternatively, you could render a "Not Authorized" message
  }

  return (
    <div className="h-[100vh] max-h-[100vh] overflow-hidden flex">
      {/* Sidebar for navigation */}
      <div className="w-[20%] h-[100vh] bg-slate-800 flex flex-col">
        {/* Link for Bookings */}
        <div>
          <Link
            to="/admin/bookings"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <FaBookmark className="mr-2" /> Bookings
          </Link>
        </div>
        {/* Link for Rooms */}
        <div>
          <Link
            to="/admin/rooms"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <MdRoomPreferences className="mr-2" /> Rooms
          </Link>
        </div>
        {/* Link for Users */}
        <div>
          <Link
            to="/admin/users"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <FaUserCog className="mr-2" /> Users
          </Link>
        </div>
        {/* Link for Categories */}
        <div>
          <Link
            to="/admin/categories"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <MdCategory className="mr-2" /> Categories
          </Link>
        </div>
        {/* Link for Feedback */}
        <div>
          <Link
            to="/admin/feedback"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <MdFeedback className="mr-2" /> Feedback
          </Link>
        </div>
        {/* Link for Tickets */}
        <div>
          <Link
            to="/admin/tickets"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <FaTicketSimple className="mr-2" /> Tickets
          </Link>
        </div>
        {/* Link for Gallery Items */}
        <div>
          <Link
            to="/admin/gallery-items"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <RiGalleryFill className="mr-2" /> Gallery Items
          </Link>
        </div>
      </div>

      {/* Main content area for displaying selected admin pages */}
      <div className="w-[80%] max-h-[100vh] overflow-y-scroll bg-slate-500 flex">
        <Routes>
          {/* Route for Admin Bookings */}
          <Route path="/bookings" element={<AdminBookings />} />
          {/* Route for Admin Rooms */}
          <Route path="/rooms" element={<AdminRooms />} />
          {/* Route for Admin Users */}
          <Route path="/users" element={<AdminUsers />} />
          {/* Route for Admin Categories */}
          <Route path="/categories" element={<AdminCategories />} />
          {/* Route for adding a new category */}
          <Route path="/add-category" element={<AddCategoryForm />} />
          {/* Route for Admin Feedback */}
          <Route path="/feedback" element={<AdminFeedback />} />
          {/* Route for Admin Tickets */}
          <Route path="/tickets" element={<AdminTickets />} />
          {/* Route for Admin Gallery Items */}
          <Route path="/gallery-items" element={<AdminGalleryItems />} />
        </Routes>
      </div>
    </div>
  );
}
