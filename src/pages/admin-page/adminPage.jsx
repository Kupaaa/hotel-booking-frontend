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
import UpdateCategoryForm from "../admin/updateCategoryForm/updateCategoryForm";
import UserTag1 from "../../components/userData/userTag1";
import "./AdminPage.css";
import AddGalleryItemForm from "../admin/addGalleryItemsForm/addGalleryItems";
import UpdateGalleryItemForm from "../admin/updateGalleryItemForm/updateGalleryItemForm";

export default function AdminPage() {
  // Destructure isLoading and isAuthenticated from custom authentication hook
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span>Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-full text-xl text-red-600">
        You are not authorized to view this page.
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar for Navigation */}
      <div className="w-1/5 bg-gray-800 text-white flex flex-col p-4">
        {/* Sidebar Title */}
        <div className="mb-4 text-2xl font-bold text-center">Admin Panel</div>

        {/* User Information */}
        <div className="mb-6">
          <UserTag1 />{" "}
          {/* Displays the logged-in user's name and profile image */}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          {" "}
          {/* Adds spacing between links */}
          <Link
            to="/admin/bookings"
            className="nav-link flex items-center text-lg"
          >
            <FaBookmark className="mr-2 text-[40px]" /> {/* Icon size */}
            <span>Bookings</span>
          </Link>
          <Link
            to="/admin/rooms"
            className="nav-link flex items-center text-lg"
          >
            <MdRoomPreferences className="mr-2 text-[40px]" />
            <span>Rooms</span>
          </Link>
          <Link
            to="/admin/users"
            className="nav-link flex items-center text-lg"
          >
            <FaUserCog className="mr-2 text-xl" />
            <span>Users</span>
          </Link>
          <Link
            to="/admin/categories"
            className="nav-link flex items-center text-lg"
          >
            <MdCategory className="mr-2 text-[40px]" />
            <span>Categories</span>
          </Link>
          <Link
            to="/admin/feedback"
            className="nav-link flex items-center text-lg"
          >
            <MdFeedback className="mr-2 text-[40px]" />
            <span>Feedback</span>
          </Link>
          <Link
            to="/admin/tickets"
            className="nav-link flex items-center text-lg"
          >
            <FaTicketSimple className="mr-2 text-[40px]" />
            <span>Tickets</span>
          </Link>
          <Link
            to="/admin/gallery-items"
            className="nav-link flex items-center text-lg"
          >
            <RiGalleryFill className="mr-2 text-[40px]" />
            <span>Gallery Items</span>
          </Link>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="w-4/5 bg-gray-100 p-6 overflow-y-auto">
        <Routes>
          <Route path="/bookings" element={<AdminBookings />} />
          <Route path="/rooms" element={<AdminRooms />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/categories" element={<AdminCategories />} />
          <Route path="/add-category" element={<AddCategoryForm />} />
          <Route
            path="/update-category/:categoryName"
            element={<UpdateCategoryForm />}
          />
          <Route path="/add-gallery-Item" element={<AddGalleryItemForm />} />
          <Route
            path="/update-gallery-item/:name"
            element={<UpdateGalleryItemForm />}
          />
          <Route path="/feedback" element={<AdminFeedback />} />
          <Route path="/tickets" element={<AdminTickets />} />
          <Route path="/gallery-items" element={<AdminGalleryItems />} />
        </Routes>
      </div>
    </div>
  );
}
