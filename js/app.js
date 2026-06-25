const STORAGE_KEY = "gestor-tareas-daw-v1";

const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const clearDoneBtn = document.querySelector("#clearDoneBtn");
const filterButtons = document.querySelectorAll(".filter-btn");
const totalTasks = document.querySelector("#totalTasks");
const pendingTasks = document.querySelector("#pendingTasks");
const doneTasks = document.querySelector("#doneTasks");

let tasks = loadTasks();
let currentFilter = "all";

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY);

  if (!savedTasks) {
    return [];
  }

  try {
    return JSON.parse(savedTasks);
  } catch (error) {
    console.error("No se pudieron cargar las tareas", error);
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text) {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
    createdAt: new Date().toISOString(),
  };
}

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter((task) => !task.done);
  }

  if (currentFilter === "done") {
    return tasks.filter((task) => task.done);
  }

  return tasks;
}

function renderTasks() {
  const filteredTasks = getFilteredTasks();
  taskList.innerHTML = "";

  filteredTasks.forEach((task) => {
    const taskItem = document.createElement("li");
    taskItem.className = task.done ? "task-item done" : "task-item";

    const checkButton = document.createElement("button");
    checkButton.className = "task-check";
    checkButton.type = "button";
    checkButton.textContent = task.done ? "✓" : "";
    checkButton.setAttribute("aria-label", task.done ? "Marcar como pendiente" : "Marcar como completada");
    checkButton.addEventListener("click", () => toggleTask(task.id));

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "task-action";
    deleteButton.type = "button";
    deleteButton.textContent = "Borrar";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    taskItem.append(checkButton, taskText, deleteButton);
    taskList.appendChild(taskItem);
  });

  emptyState.hidden = filteredTasks.length > 0;
  updateStats();
}

function updateStats() {
  const doneCount = tasks.filter((task) => task.done).length;
  const pendingCount = tasks.length - doneCount;

  totalTasks.textContent = tasks.length;
  pendingTasks.textContent = pendingCount;
  doneTasks.textContent = doneCount;
}

function addTask(text) {
  const cleanText = text.trim();

  if (!cleanText) {
    taskInput.focus();
    return;
  }

  tasks.unshift(createTask(cleanText));
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
}

function toggleTask(id) {
  tasks = tasks.map((task) => {
    if (task.id === id) {
      return { ...task, done: !task.done };
    }

    return task;
  });

  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearDoneTasks() {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  renderTasks();
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });

  renderTasks();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  addTask(taskInput.value);
});

clearDoneBtn.addEventListener("click", clearDoneTasks);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

renderTasks();
