// const dayjs = require('dayjs');

// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++; // Increment nextId for unique task IDs
}

// Function to create a task card
function createTaskCard(task) {
  const card = `
    <div class="task-card" id="task-${task.id}">
      <div class="task-content">
        <span class="task-title">${task.title}</span>
        <span class="task-description">${task.description}</span>
        <span class="task-due-date">${dayjs(task.dueDate).format('YYYY-MM-DD')}</span>
      </div>
      <div class="task-actions">
        <button class="delete-button" onclick="handleDeleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `;
  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  const todoCards = document.getElementById('todo-cards');
  const inProgressCards = document.getElementById('in-progress-cards');
  const doneCards = document.getElementById('done-cards');

  // Clear existing cards
  todoCards.innerHTML = '';
  inProgressCards.innerHTML = '';
  doneCards.innerHTML = '';

  // Render cards in respective lanes
  taskList.forEach(task => {
    const card = createTaskCard(task);
    if (task.folder === 'todo') {
      todoCards.insertAdjacentHTML('beforeend', card);
    } else if (task.folder === 'in-progress') {
      inProgressCards.insertAdjacentHTML('beforeend', card);
    } else if (task.folder === 'done') {
      doneCards.insertAdjacentHTML('beforeend', card);
    }
  });

  // Make task cards draggable
  $('.task-card').draggable({
    revert: 'invalid', // Snap back to original position if not dropped in a valid droppable
    cursor: 'move',
    containment: 'document',
    helper: 'clone' // Show a clone of the card while dragging
  });

  // Make task lanes droppable
  $('.lane').droppable({
    accept: '.task-card',
    drop: function(event, ui) {
      const taskId = ui.draggable.attr('id').split('-')[1];
      const task = taskList.find(t => t.id === parseInt(taskId));

      // Update task folder based on the lane dropped into
      if ($(this).attr('id') === 'to-do') {
        task.folder = 'todo';
      } else if ($(this).attr('id') === 'in-progress') {
        task.folder = 'in-progress';
      } else if ($(this).attr('id') === 'done') {
        task.folder = 'done';
      }

      // Update localStorage
      localStorage.setItem('tasks', JSON.stringify(taskList));

      // Re-render the task list to reflect changes
      renderTaskList();
    }
  });

  // Update 'Add Task' button state based on input fields
  updateAddTaskButtonState();
}

// Function to update 'Add Task' button state based on input fields
function updateAddTaskButtonState() {
  const title = document.getElementById('task-title').value.trim();
  const dueDate = document.getElementById('due-date').value.trim();

  const addTaskButton = document.getElementById('add-task-button');
  // if (title && dueDate) {
  //   addTaskButton.disabled = false;
  // } else {
  //   addTaskButton.disabled = true;
  // }
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault(); // Prevent form submission

  // Fetch input values
  const title = document.getElementById('task-title').value;
  const description = document.getElementById('task-description').value;
  const dueDate = document.getElementById('due-date').value;

  // Validate input (you can add more validation as per your requirements)
  if (!title || !dueDate) {
    alert('Please fill out the title and due date fields.');
    return;
  }

  // Create new task object
  const newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    dueDate: dueDate,
    folder: 'todo' // Initially set to 'todo' folder
  };

  // Add new task to taskList
  taskList.push(newTask);

  // Update localStorage
  localStorage.setItem('tasks', JSON.stringify(taskList));
  localStorage.setItem('nextId', nextId);

  // Clear form fields (optional)
  document.getElementById('task-title').value = '';
  document.getElementById('task-description').value = '';
  document.getElementById('due-date').value = '';

  // Render updated task list
  renderTaskList();
}

// Function to handle deleting a task
function handleDeleteTask(id) {
  taskList = taskList.filter(task => task.id !== id);
  localStorage.setItem('tasks', JSON.stringify(taskList));

  renderTaskList(); // Update UI
}

// When the page loads, render the task list and set up event listeners
$(document).ready(function () {
  renderTaskList();

  // Initialize datepicker for due date field
  $('#due-date').datepicker({
    dateFormat: 'yy-mm-dd',
    onSelect: function(dateText, inst) {
      // Automatically close the datepicker after selecting a date
      $(this).datepicker('hide');
    }
  });

  // Add event listener for adding a new task
  $('#add-task-form').on('submit', handleAddTask);

  // Show datepicker on focus of due date field
  $('#due-date').on('focus', function() {
    $(this).datepicker('show');
  });

  // Update 'Add Task' button state on input change
  $('#task-title, #due-date').on('input change', updateAddTaskButtonState);
});
