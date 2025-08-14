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
      div.draggable = true;
      div.dataset.taskId = task.id;
      
      // Show task text and delete button only
      div.innerHTML = `
        <span class="task-text" onclick="editTask(${task.id})">${task.text}</span>
        <div>
          <button onclick="deleteTask(${task.id})">✕</button>
        </div>
      `;
      
      // Add drag event listeners
      div.addEventListener('dragstart', handleDragStart);
      div.addEventListener('dragend', handleDragEnd);
      
      column.appendChild(div); // Add task to column
    });
  });
  // Save tasks to localStorage so they stay after reload
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Add a new task to a column with inline input
function addTask(status) {
  const column = document.querySelector(`.column[data-status="${status}"] .tasks`);
  
  // Create input element for new task
  const inputDiv = document.createElement('div');
  inputDiv.className = 'task new-task-input';
  inputDiv.innerHTML = `
    <input type="text" placeholder="Enter task description..." class="task-input" />
    <div>
      <button onclick="saveNewTask('${status}', this)">✓</button>
      <button onclick="cancelNewTask(this)">✕</button>
    </div>
  `;
  
  column.appendChild(inputDiv);
  
  // Focus on the input
  const input = inputDiv.querySelector('.task-input');
  input.focus();
  
  // Handle Enter key to save
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveNewTask(status, inputDiv.querySelector('button'));
    } else if (e.key === 'Escape') {
      cancelNewTask(inputDiv.querySelector('button:last-child'));
    }
  });
}

// Save new task
function saveNewTask(status, button) {
  const inputDiv = button.closest('.new-task-input');
  const input = inputDiv.querySelector('.task-input');
  const text = input.value.trim();
  
  if (text) {
    const id = Date.now(); // Unique ID based on time
    tasks.push({ id, text, status }); // Add task to list
    renderTasks(); // Update board
  } else {
    inputDiv.remove(); // Remove empty input
  }
}

// Cancel new task creation
function cancelNewTask(button) {
  const inputDiv = button.closest('.new-task-input');
  inputDiv.remove();
}

// Edit task inline
function editTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  
  const taskElement = document.querySelector(`[data-task-id="${id}"]`);
  const textSpan = taskElement.querySelector('.task-text');
  
  // Create input element
  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.text;
  input.className = 'task-edit-input';
  
  // Replace span with input
  textSpan.replaceWith(input);
  input.focus();
  input.select();
  
  // Handle save/cancel
  function saveEdit() {
    const newText = input.value.trim();
    if (newText) {
      task.text = newText;
      renderTasks();
    } else {
      renderTasks(); // Revert if empty
    }
  }
  
  function cancelEdit() {
    renderTasks(); // Revert changes
  }
  
  input.addEventListener('blur', saveEdit);
  input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  });
}

// Drag and drop functionality
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  draggedElement = null;
}

// Remove a task from the board
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id); // Remove task from list
  renderTasks(); // Update board
}

// Initialize drag and drop for columns
function initializeDragAndDrop() {
  const columns = document.querySelectorAll('.tasks');
  
  columns.forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('drop', handleDrop);
    column.addEventListener('dragenter', handleDragEnter);
    column.addEventListener('dragleave', handleDragLeave);
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  // Only remove class if we're actually leaving the column
  if (!this.contains(e.relatedTarget)) {
    this.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  if (draggedElement) {
    const taskId = parseInt(draggedElement.dataset.taskId);
    const newStatus = this.closest('.column').dataset.status;
    
    // Update task status
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.status = newStatus;
      renderTasks();
    }
  }
}

// Show tasks when the page loads
window.onload = function() {
  renderTasks();
  initializeDragAndDrop();
};
