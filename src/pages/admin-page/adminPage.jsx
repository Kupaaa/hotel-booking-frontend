import { FaBookmark, FaUserCog } from "react-icons/fa";
import { FaTicketSimple } from "react-icons/fa6";
import { MdCategory, MdFeedback, MdRoomPreferences } from "react-icons/md";
import { RiGalleryFill } from "react-icons/ri";
import { Link, Route, Routes } from "react-router-dom";

export default function AdminPage() {
  return (
    <div className="h-[100vh] max-h-[100vh] overflow-hidden flex flex-col">
      <div className="w-[20%] h-[100vh] bg-slate-800">
        <div>
          <Link
            to="/admin/bookings"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <FaBookmark className="mr-2" /> Bookings
          </Link>
        </div>
        <div>
          <Link
            to="/admin/rooms"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <MdRoomPreferences className="mr-2" /> Rooms
          </Link>
        </div>
        <div>
          <Link
            to="/admin/users"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <FaUserCog className="mr-2" /> Users
          </Link>
        </div>
        <div>
          <Link
            to="/admin/category"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <MdCategory className="mr-2" /> Category
          </Link>
        </div>
        <div>
          <Link
            to="/admin/feedback"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <MdFeedback className="mr-2" /> Feedback
          </Link>
        </div>
        <div>
          <Link
            to="/admin/ticket"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <FaTicketSimple className="mr-2" /> Ticket
          </Link>
        </div>
        <div>
          <Link
            to="/admin/gallery-items"
            className="text-white text-[30px] hover:font-bold flex justify-center items-center"
          >
            <RiGalleryFill className="mr-2" /> Gallery Items
          </Link>
        </div>
      </div>

      <div className="w-[80%] bg-slate-500 flex"></div>
    </div>
  );
}
