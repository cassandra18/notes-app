import React, { useState, useEffect } from "react";
import axios from "axios";

// Defining the task interface
interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const API_URL = "http://localhost:5000/api/todos";

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(API_URL);
      if (response.data !== undefined) {
        const taskList = response.data.data && Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        setTasks(taskList);
      } else {
        setError("Invalid response format from server");
      }
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 404:
            setTasks([]);
            break;
          case 500:
            setError("Server error: Please try again later");
            break;
          default:
            setError(`Failed to fetch tasks: ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        setError("Cannot connect to the server. Please check your connection.");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    if (title.trim() && description.trim()) {
      const newTask = {
        title: title.trim(),
        description: description.trim(),
        completed: false
      };

      setIsLoading(true);
      
      try {
        const response = await axios.post(API_URL, newTask);
        if (response.data !== undefined) {
          await fetchTasks();
          setTitle("");
          setDescription("");
        } else {
          setError("Error adding task: Invalid response format");
        }
      } catch (error: any) {
        if (error.response) {
          setError(`Failed to add task: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          setError("Cannot connect to the server. Please check your connection.");
        } else {
          setError("Failed to add task");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const updateTask = async () => {
    if (editingTask) {
      const updatedTask = {
        ...editingTask,
        title: title.trim(),
        description: description.trim()
      };

      setIsLoading(true);
      
      try {
        const response = await axios.put(`${API_URL}/${editingTask.id}`, updatedTask);
        if (response.data !== undefined) {
          await fetchTasks();
          setEditingTask(null);
          setTitle("");
          setDescription("");
        } else {
          setError("Error updating task: Invalid response format");
        }
      } catch (error: any) {
        if (error.response) {
          setError(`Failed to update task: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          setError("Cannot connect to the server. Please check your connection.");
        } else {
          setError("Failed to update task");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const updatedTask = {
        ...task,
        completed: !task.completed
      };

      setIsLoading(true);
      
      try {
        const response = await axios.put(`${API_URL}/${id}`, updatedTask);
        if (response.data !== undefined) {
          // If we're completing a task that's currently being edited, clear the edit form
          if (editingTask && editingTask.id === id && !task.completed) {
            setEditingTask(null);
            setTitle("");
            setDescription("");
          }
          await fetchTasks();
        } else {
          setError("Error updating task status: Invalid response format");
        }
      } catch (error: any) {
        if (error.response) {
          setError(`Failed to update task status: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
          setError("Cannot connect to the server. Please check your connection.");
        } else {
          setError("Failed to update task status");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const deleteTask = async (id: string) => {
    setIsLoading(true);
    
    try {
      await axios.delete(`${API_URL}/${id}`);
      if (editingTask && editingTask.id === id) {
        setEditingTask(null);
        setTitle("");
        setDescription("");
      }
      await fetchTasks();
    } catch (error: any) {
      if (error.response) {
        setError(`Failed to delete task: ${error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        setError("Cannot connect to the server. Please check your connection.");
      } else {
        setError("Failed to delete task");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="task-manager">
      <h1>Task Manager</h1>
      
      {error && <div className="error-message">Error: {error}</div>}
      
      <div className="task-form">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task Title"
          disabled={isLoading}
          className="task-input"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task Description"
          disabled={isLoading}
          className="task-textarea"
        />
        <button 
          onClick={editingTask ? updateTask : addTask}
          disabled={isLoading || !title.trim() || !description.trim()}
          className="task-button"
        >
          {editingTask ? "Update Task" : "Add Task"}
        </button>
        {editingTask && (
          <button 
            onClick={() => {
              setEditingTask(null);
              setTitle("");
              setDescription("");
            }}
            className="cancel-button"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {isLoading && <div className="loading">Loading...</div>}

      <ul className="task-list">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? "completed" : ""}`}
            >
              <div className="task-content">
                <strong>{task.title}</strong>
                <p>{task.description}</p>
                <small className="task-date">
                  Created: {new Date(task.created_at).toLocaleDateString()}
                </small>
              </div>
              <div className="task-actions">
                <button
                  onClick={() => toggleComplete(task.id)}
                  disabled={isLoading}
                  className={`complete-button ${task.completed ? "completed" : ""}`}
                >
                  {task.completed ? "Completed" : "Complete"}
                </button>
                <button 
                  onClick={() => deleteTask(task.id)}
                  disabled={isLoading}
                  className="delete-button"
                >
                  Delete
                </button>
                {!task.completed && (
                  <button
                    onClick={() => {
                      setEditingTask(task);
                      setTitle(task.title);
                      setDescription(task.description);
                    }}
                    disabled={isLoading}
                    className="edit-button"
                  >
                    Edit
                  </button>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="no-tasks">No tasks available</li>
        )}
      </ul>
    </div>
  );
};

export default TaskManager;