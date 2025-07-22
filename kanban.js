// Load tasks from browser localStorage, or start with an empty list
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Show all tasks in their columns
function renderTasks() {
  // For each column (To Do, In Progress, Done)
  ['todo', 'inprogress', 'done'].forEach(status => {
    // Find the column's task container
    const column = document.querySelector(`.column[data-status="${status}"] .tasks`);
    column.innerHTML = ''; // Clear old tasks

    // Add each task that matches the column's status
    tasks.filter(t => t.status === status).forEach((task, idx) => {
      const div = document.createElement('div');
      div.className = 'task';
      // Show task text and buttons to move or delete
      div.innerHTML = `
        <span>${task.text}</span>
        <div>
          ${status !== 'todo' ? `<button onclick="moveTask(${task.id}, 'back')">←</button>` : ''}
          ${status !== 'done' ? `<button onclick="moveTask(${task.id}, 'forward')">→</button>` : ''}
          <button onclick="deleteTask(${task.id})">✕</button>
        </div>
      `;
      column.appendChild(div); // Add task to column
    });
  });
  // Save tasks to localStorage so they stay after reload
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a new task to a column
function addTask(status) {
  const text = prompt('Task description:'); // Ask user for task text
  if (text) {
    const id = Date.now(); // Unique ID based on time
    tasks.push({ id, text, status }); // Add task to list
    renderTasks(); // Update board
  }
}

// Move a task forward or back between columns
function moveTask(id, direction) {
  const idx = tasks.findIndex(t => t.id === id); // Find the task
  if (idx > -1) {
    if (direction === 'forward') {
      // Move from To Do → In Progress → Done
      if (tasks[idx].status === 'todo') tasks[idx].status = 'inprogress';
      else if (tasks[idx].status === 'inprogress') tasks[idx].status = 'done';
    } else if (direction === 'back') {
      // Move from Done → In Progress → To Do
      if (tasks[idx].status === 'done') tasks[idx].status = 'inprogress';
      else if (tasks[idx].status === 'inprogress') tasks[idx].status = 'todo';
    }
    renderTasks(); // Update board
  }
}

// Remove a task from the board
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id); // Remove task from list
  renderTasks(); // Update board
}

// Show tasks when the page loads
window.onload = renderTasks;