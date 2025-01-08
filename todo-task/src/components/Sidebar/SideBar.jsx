import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Bell, Calendar, Layout, Hash, Plus, Menu } from "lucide-react";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Sidebar = ({
  showAddTask,
  setShowAddTask,
  searchQuery,
  setSearchQuery,
}) => {
  const location = useLocation();
  const isUpcomingPage = location.pathname === "/upcoming";
  const isTodayPage = location.pathname === "/home";
  const isFilterPage = location.pathname === "/filter";
  const isCompletedPage = location.pathname === '/completed'
  const navigate = useNavigate();

  // State to toggle sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((err) => alert(err.message));
  };

  return (
    <div>
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white text-red-600 "
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <div
        className={`lg:w-64 w-full bg-white border-r border-gray-200 p-4 fixed lg:relative top-0 left-0 h-full transition-all duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 z-40`}
      >
        {/* User Profile */}
        <div className="flex items-center mb-6">
          <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
          <span className="text-gray-700 mt-1">Guest</span>
        </div>

        {/* Add Task Button */}
        {!isUpcomingPage && !isFilterPage && ( // Hide the button on /filter page
          <button
            onClick={() => setShowAddTask(!showAddTask)} // Toggle showAddTask
            className="flex items-center text-red-500 font-medium mb-6 hover:bg-red-50 rounded-lg px-3 py-2 w-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add task
          </button>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-gray-300"
          />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 ">
          <Link
            to="/"
            className={`flex items-center text-gray-700 px-3 py-2 rounded-lg ${
              isTodayPage ? "bg-red-50" : "hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Inbox
          </Link>

          <Link
            to="/upcoming"
            className={`flex items-center text-gray-700 px-3 py-2 rounded-lg ${
              isUpcomingPage ? "bg-red-50" : "hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Upcoming
          </Link>

          <Link
            to="/completed"
            className={`flex items-center text-gray-700 px-3 py-2 rounded-lg ${
              isCompletedPage ? "bg-red-50" : "hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Completed
          </Link>

          <Link
            to="/filter"
            className={`flex items-center text-gray-700 px-3 py-2 rounded-lg ${
              isFilterPage ? "bg-red-50" : "hover:bg-gray-100"
            }`}
          >
            <Calendar className="w-5 h-5 mr-3" />
            Filters 
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4">
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
