import React, { useEffect, useState } from "react";
import { db, auth } from "../../../firebase";
import { ref, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../Sidebar/SideBar";

function Label() {
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [tasksPerPage] = useState(5); // Tasks per page
  const [selectedPriority, setSelectedPriority] = useState("All"); // Filter by priority
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const tasksRef = ref(db, `tasks/${userId}`);
    const unsubscribe = onValue(
      tasksRef,
      (snapshot) => {
        const tasksData = snapshot.val();
        if (tasksData) {
          const tasksList = Object.keys(tasksData).map((key) => ({
            id: key,
            ...tasksData[key],
          }));
          setTasks(tasksList);
        } else {
          setTasks([]);
        }
      },
      (error) => {
        console.error("Error fetching tasks:", error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Filter tasks by selected priority
  const filteredTasks =
    selectedPriority === "All"
      ? tasks
      : tasks.filter((task) => task.priority === selectedPriority);

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6 mt-6">Tasks by Priority</h1>

        {/* Dropdown to select priority */}
        <div className="flex items-center">
          <label htmlFor="priorityDropdown" className="block text-gray-700 mb-2">
            Filter by Priority:
          </label>
          <select
            id="priorityDropdown"
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1); // Reset to the first page
            }}
            className="p-2 border border-gray-300 rounded-lg ml-4"
          >
            <option value="All">All</option>
            <option value="Priority 1">Priority 1</option>
            <option value="Priority 2">Priority 2</option>
            <option value="Priority 3">Priority 3</option>
            <option value="Priority 4">Priority 4</option>
          </select>
        </div>

        {/* Display tasks */}
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 bg-white rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
                <div className="font-medium">{task.text}</div>
                <div className="text-sm text-gray-500">{task.description}</div>
                <div className="text-sm text-gray-500">
                  Due: {task.dueDate || "No due date"}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {filteredTasks.length > tasksPerPage && (
          <div className="flex justify-center space-x-2 mt-6">
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded-lg"
              >
                Previous
              </button>
            )}
            {[...Array(totalPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`px-4 py-2 ${
                  page + 1 === currentPage
                    ? "bg-red-500 hover:bg-red-700 text-white"
                    : "bg-red-500 hover:bg-red-700 text-white"
                } rounded-lg`}
              >
                {page + 1}
              </button>
            ))}
            {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="px-4 py-2 bg-red-500 hover:bg-red-700 rounded-lg text-white"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Label;
