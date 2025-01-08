import React, { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { ref, onValue, remove, update } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "../Sidebar/SideBar";

const CompletedPage = () => {
    const [completedTasks, setCompletedTasks] = useState([]);
    const [userId, setUserId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 4;
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
            const tasksList = Object.keys(tasksData || {}).map((key) => ({
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
  
    const handleUncompleteTask = (taskId) => {
      const taskRef = ref(db, `tasks/${userId}/${taskId}`);
      update(taskRef, { completed: false, completedDate: null })
        .then(() => {
          console.log("Task marked as incomplete");
        })
        .catch((error) => {
          console.error("Error updating task:", error);
        });
    };
  
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = completedTasks.slice(indexOfFirstTask, indexOfLastTask);
  
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
    const deleteTask = (taskId) => {
      const tasksRef = ref(db, `tasks/${userId}/${taskId}`);
      remove(tasksRef)
        .then(() => {
          console.log("Task deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting task:", error);
        });
    };
  
    const totalPages = Math.ceil(completedTasks.length / tasksPerPage);
  
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-8 mt-6 text-gray-500">
          <h1 className="text-2xl font-semibold mb-6 text-black">
            Completed Tasks
          </h1>
          <div className="space-y-4">
            {currentTasks.length === 0 ? (
              <div className="p-4 bg-gray-100 rounded-md text-center">
                No completed tasks
              </div>
            ) : (
              currentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col bg-white p-4 rounded-md shadow-sm md:flex-row md:justify-between md:items-center"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleUncompleteTask(task.id)}
                      className="mr-4"
                    />
                    <div className="flex-1">
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
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700 md:mt-0"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex justify-center space-x-2 mt-6">
            {currentPage > 1 && (
              <button
                onClick={() => paginate(currentPage - 1)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
              >
                Previous
              </button>
            )}
            {currentPage < totalPages && (
              <button
                onClick={() => paginate(currentPage + 1)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
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