import { FaBookmark, FaUserCog } from "react-icons/fa";
import { FaTicketSimple } from "react-icons/fa6";
import { MdCategory, MdFeedback, MdRoomPreferences } from "react-icons/md";
import { RiGalleryFill } from "react-icons/ri";
import { Link, Route, Routes } from "react-router-dom";
import AdminBookings from "../admin/adminBookings";
import AdminRooms from "../admin/adminRooms";
import AdminUsers from "../admin/adminUsers";
import AdminFeedback from "../admin/adminFeedback";
import AdminTickets from "../admin/adminTickets";
import AdminGalleryItems from "../admin/adminGalleryItems";
import AdminCategories from "../admin/adminCategories";

export default function AdminPage() {
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
          <Route path="/admin/bookings" element={<AdminBookings />} />
          {/* Route for Admin Rooms */}
          <Route path="/admin/rooms" element={<AdminRooms />} />
          {/* Route for Admin Users */}
          <Route path="/admin/users" element={<AdminUsers />} />
          {/* Route for Admin Categories */}
          <Route path="/admin/categories" element={<AdminCategories />} />
          {/* Route for Admin Feedback */}
          <Route path="/admin/feedback" element={<AdminFeedback />} />
          {/* Route for Admin Tickets */}
          <Route path="/admin/tickets" element={<AdminTickets />} />
          {/* Route for Admin Gallery Items */}
          <Route path="/admin/gallery-items" element={<AdminGalleryItems />} />
        </Routes>
      </div>
    </div>
  );
}
