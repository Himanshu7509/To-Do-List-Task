import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Firebase setup
import { ref, onValue } from "firebase/database";
import Sidebar from "../components/Sidebar/SideBar";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import dayjs from "dayjs";
const FilterAndLabel = () => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]); 
  const [selectedTask, setSelectedTask] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [userId, setUserId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(""); // State for date filter
  const tasksPerPage = 5; // Number of tasks per page
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Save the user ID for Firebase queries
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Fetch upcoming tasks from Firebase when userId is available
  useEffect(() => {
    if (!userId) return; // Wait until userId is available
    const tasksRef = ref(db, `tasks/${userId}`);
    onValue(tasksRef, (snapshot) => {
      const tasksData = snapshot.val();
      if (tasksData) {
        const tasksList = Object.keys(tasksData).map((key) => ({
          id: key,
          ...tasksData[key],
        }));
        // Filter tasks with a due date and sort by due date
        const sortedTasks = tasksList
          .filter((task) => task.dueDate)
          .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // Sort in ascending order
        setUpcomingTasks(sortedTasks);
        setFilteredTasks(sortedTasks); // Set filtered tasks initially
      } else {
        setUpcomingTasks([]);
        setFilteredTasks([]);
      }
    });
  }, [userId]);

  // Filter tasks by selected date
  const handleDateFilter = (date) => {
    setSelectedDate(date);
    if (date) {
      const filtered = upcomingTasks.filter(
        (task) => dayjs(task.dueDate).format("YYYY-MM-DD") === date
      );
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(upcomingTasks); // Reset to all tasks if no date is selected
    }
  };

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 mt-6">
        <h1 className="text-2xl font-semibold mb-6">Search By Date</h1>

        {/* Date Filter */}
        <div className="mb-6">
          <label className="font-medium mr-2">Filter by Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          />
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {currentTasks.length === 0 ? (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              No tasks available
            </div>
          ) : (
            currentTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-100 rounded-md shadow-sm"
              >
                <div className="mb-2 md:mb-0 flex-col">
                  <span className="font-medium flex w-full">{task.text}</span> {" "}
                  <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                </div>
                <div className="w-full md:w-auto">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="w-full md:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-2 mt-6">
          {currentPage > 1 && (
            <button
              onClick={() => paginate(currentPage - 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
            >
              Previous
            </button>
          )}
          {indexOfLastTask < filteredTasks.length && (
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Modal for task details */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Task Details</h2>
            <p className="mb-2">
              <span className="font-medium">Task:</span> {selectedTask.text}
            </p>
            <p className="mb-2">
              <span className="font-medium">Description:</span>{" "}
              {selectedTask.description || "No description provided"}
            </p>
            <p className="mb-4">
              <span className="font-medium">Due Date:</span> {selectedTask.dueDate}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterAndLabel;
