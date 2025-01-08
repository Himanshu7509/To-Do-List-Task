import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase"; // Firebase setup
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../Sidebar/SideBar";

const CompletedPage = () => {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [userId, setUserId] = useState(null); // Store the logged-in user's ID
  const [currentPage, setCurrentPage] = useState(1);
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

  // Fetch completed tasks from Firebase when userId is available
  useEffect(() => {
    if (!userId) return; // Wait until userId is available
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
          const completedTasksList = tasksList.filter((task) => task.completed);
          setCompletedTasks(
            completedTasksList.sort(
              (a, b) => new Date(b.completedDate) - new Date(a.completedDate)
            )
          );
        } else {
          setCompletedTasks([]);
        }
      },
      (error) => {
        console.error("Error fetching tasks:", error);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = completedTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 mt-6 text-gray-500">
        <h1 className="text-2xl font-semibold mb-6 text-black">Completed Tasks</h1>

        {/* Completed Task List */}
        <div className="space-y-4">
          {currentTasks.length === 0 ? (
            <div className="p-4 bg-gray-100 rounded-md text-center">
              No completed tasks
            </div>
          ) : (
            currentTasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-md shadow-sm"
              >
                <div>
                  <span className="font-medium">{task.text}</span>
                  <div className="text-sm text-gray-600">
                    {task.description || "No description"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Due: {task.dueDate || "No due date"}
                  </div>
                  <div className="text-sm text-gray-600">
                    Completed {task.completedDate || ""}
                  </div>
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
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Previous
            </button>
          )}
          {indexOfLastTask < completedTasks.length && (
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedPage;
