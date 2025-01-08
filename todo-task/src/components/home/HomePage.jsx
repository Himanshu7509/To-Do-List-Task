import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, X } from "lucide-react";
import { db, auth } from "../../firebase";
import { ref, push, set, onValue, update, remove } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

import Sidebar from "../Sidebar/SideBar";

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState("");
  const [editedTaskDescription, setEditedTaskDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState(null);

  const tasksPerPage = 4;
  const navigate = useNavigate();

  // Listen for authentication state
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

  // Fetch tasks when userId is available
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

  // Add a new task
  const addTask = async (text, description, date) => {
    if (!userId || !text.trim()) return;

    try {
      const newTaskRef = push(ref(db, `tasks/${userId}`));
      await set(newTaskRef, {
        text,
        description,
        completed: false,
        dueDate: date || null,
        createdAt: new Date().toISOString(),
      });
      setNewTaskText("");
      setNewTaskDescription("");
      setDueDate("");
      setShowAddTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  // Toggle task completion
  const toggleCompletion = async (taskId, completed) => {
    if (!userId) return;

    try {
      const taskRef = ref(db, `tasks/${userId}/${taskId}`);
      await update(taskRef, { completed: !completed });
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  // Edit an existing task
  const editTask = async (taskId, newText, newDescription, newDate) => {
    if (!userId || !newText.trim()) return;

    try {
      const taskRef = ref(db, `tasks/${userId}/${taskId}`);
      await update(taskRef, {
        text: newText,
        description: newDescription,
        dueDate: newDate,
        updatedAt: new Date().toISOString(),
      });

      setEditingTask(null);
      setEditedTaskText("");
      setEditedTaskDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Error editing task:", error);
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    if (!userId) return;

    try {
      const taskRef = ref(db, `tasks/${userId}/${taskId}`);
      await remove(taskRef);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Pagination and search
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        showAddTask={showAddTask}
        setShowAddTask={setShowAddTask}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="flex-1 p-8 relative">
        <h1 className="text-2xl font-semibold">Today</h1>
        <div className="text-gray-500 mb-6">{filteredTasks.length} tasks</div>

        {/* Render tasks */}
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div key={task.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleCompletion(task.id, task.completed)}
              />
              {editingTask === task.id ? (
                <div className="flex flex-col space-y-2 ml-3">
                  <input
                    type="text"
                    value={editedTaskText}
                    onChange={(e) => setEditedTaskText(e.target.value)}
                    placeholder="Task Title"
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <textarea
                    value={editedTaskDescription}
                    onChange={(e) => setEditedTaskDescription(e.target.value)}
                    placeholder="Description"
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        editTask(task.id, editedTaskText, editedTaskDescription, dueDate)
                      }
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTask(null)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ml-4 flex-1">
                  <div className={task.completed ? "line-through text-gray-400" : ""}>
                    {task.text}
                  </div>
                  <div className="text-sm text-gray-500">{task.description}</div>
                  <div className="text-sm text-gray-500">Due: {task.dueDate}</div>
                </div>
              )}
              <div className="flex space-x-2 ml-auto">
                <button
                  onClick={() => {
                    setEditingTask(task.id);
                    setEditedTaskText(task.text);
                    setEditedTaskDescription(task.description);
                    setDueDate(task.dueDate);
                  }}
                  className="text-blue-500"
                >
                  Edit
                </button>
                <button onClick={() => deleteTask(task.id)} className="text-red-500">
                  Delete
                </button>
              </div>
            </div>
          ))}
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
          {currentPage * tasksPerPage < filteredTasks.length && (
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
            >
              Next
            </button>
          )}
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Task Title"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={() => addTask(newTaskText, newTaskDescription, dueDate)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowAddTask(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
