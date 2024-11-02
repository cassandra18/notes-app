// src/components/TaskManager.tsx
import React, { useState, useEffect } from 'react';
import { Task } from '../types';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/todos';

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks from the backend
  useEffect(() => {
    axios.get(API_URL)
      .then(response => setTasks(response.data))
      .catch(error => console.error('Error fetching tasks:', error));
  }, []);

  // Add a new task
  const addTask = () => {
    if (title.trim() && description.trim()) {
      const newTask = { title, description, completed: false };
      axios.post(API_URL, newTask)
        .then(response => setTasks([...tasks, response.data]))
        .catch(error => console.error('Error adding task:', error));
      setTitle('');
      setDescription('');
    }
  };

  // Update an existing task
  const updateTask = () => {
    if (editingTask) {
      const updatedTask = { ...editingTask, title, description };
      axios.put(`${API_URL}/${editingTask.id}`, updatedTask)
        .then(response => {
          setTasks(tasks.map(task => (task.id === editingTask.id ? response.data : task)));
          setEditingTask(null);
          setTitle('');
          setDescription('');
        })
        .catch(error => console.error('Error updating task:', error));
    }
  };

  // Delete a task
  const deleteTask = (id: string) => {
    axios.delete(`${API_URL}/${id}`)
      .then(() => setTasks(tasks.filter(task => task.id !== id)))
      .catch(error => console.error('Error deleting task:', error));
  };

  // Toggle task completion
  const toggleComplete = (id: string) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
      const updatedTask = { ...task, completed: !task.completed };
      axios.put(`${API_URL}/${id}`, updatedTask)
        .then(response => {
          setTasks(tasks.map(task => (task.id === id ? response.data : task)));
        })
        .catch(error => console.error('Error toggling task completion:', error));
    }
  };

  return (
    <div>
      <h1>Task Manager</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task Description"
      />
      <button onClick={editingTask ? updateTask : addTask}>
        {editingTask ? 'Update Task' : 'Add Task'}
      </button>

      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
            <div onClick={() => toggleComplete(task.id)}>
              <strong>{task.title}</strong>: {task.description}
            </div>
            <button onClick={() => deleteTask(task.id)}>Delete</button>
            <button onClick={() => {
              setEditingTask(task);
              setTitle(task.title);
              setDescription(task.description);
            }}>
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;
