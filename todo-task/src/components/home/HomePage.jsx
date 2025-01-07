import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, X } from 'lucide-react';
import { db, auth } from '../../firebase';
import { ref, set, push, onValue, update, remove } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';

import Sidebar from '../Sidebar/SideBar';

const HomePage = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState('');
  const [editedTaskDescription, setEditedTaskDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const tasksPerPage = 4;

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const tasksRef = ref(db, 'tasks');
    onValue(tasksRef, (snapshot) => {
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
    });
  }, []);

  const addTask = (text, description, date) => {
    if (text.trim()) {
      const newTaskRef = push(ref(db, 'tasks'));
      set(newTaskRef, {
        text,
        description,
        completed: false,
        dueDate: date,
      }).then(() => {
        setNewTaskText('');
        setNewTaskDescription('');
        setDueDate('');
        setShowAddTask(false);
      });
    }
  };

  const toggleCompletion = (taskId, completed) => {
    const taskRef = ref(db, 'tasks/' + taskId);
    update(taskRef, { completed: !completed });
  };

  const editTask = (taskId, newText, newDescription, newDate) => {
    const taskRef = ref(db, 'tasks/' + taskId);
    update(taskRef, { text: newText, description: newDescription, dueDate: newDate }).then(() => {
      setEditingTask(null);
      setEditedTaskText('');
      setEditedTaskDescription('');
      setDueDate('');
    });
  };

  const deleteTask = (taskId) => {
    const taskRef = ref(db, 'tasks/' + taskId);
    remove(taskRef);
  };

  

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;

  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Component */}
      <Sidebar
        showAddTask={showAddTask}
        setShowAddTask={setShowAddTask}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 relative">
        <div className="flex justify-between items-center mb-8 mt-6">
          <h1 className="text-2xl font-semibold">Today</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tasks Count */}
        <div className="text-gray-500 mb-6">{filteredTasks.length} tasks</div>

        {/* Task List */}
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div key={task.id} className="flex items-center p-3 bg-white rounded-lg shadow-sm">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleCompletion(task.id, task.completed)}
                className="mr-3"
              />
              {editingTask === task.id ? (
                <div className="flex flex-col space-y-2 w-full">
                  <input
                    type="text"
                    value={editedTaskText}
                    onChange={(e) => setEditedTaskText(e.target.value)}
                    className="p-2 border border-gray-200 rounded-lg"
                  />
                  <textarea
                    value={editedTaskDescription}
                    onChange={(e) => setEditedTaskDescription(e.target.value)}
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
                <>
                  <div className="flex flex-col flex-1">
                    <span className={task.completed ? 'line-through text-gray-400' : ''}>
                      {task.text}
                    </span>
                    {task.description && (
                      <span className="text-sm text-gray-500">{task.description}</span>
                    )}
                    {task.dueDate && (
                      <span className="text-sm text-gray-500">Due: {task.dueDate}</span>
                    )}
                  </div>
                  <div className="ml-auto flex space-x-2">
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
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
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

        {/* Add Task Popup */}
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
              </div>
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addTask(newTaskText, newTaskDescription, dueDate)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};

export default HomePage;

