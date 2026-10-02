const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const remainingCount = document.getElementById("remainingCount");
const progressPercent = document.getElementById("progressPercent");
const progressTitle = document.getElementById("progressTitle");
const progressText = document.getElementById("progressText");
const progressRing = document.querySelector(".progress-ring");
const clearCompleted = document.getElementById("clearCompleted");
const savedStatus = document.getElementById("savedStatus");
const todayDate = document.getElementById("todayDate");
const filters = document.querySelectorAll(".filter");

let tasks = JSON.parse(localStorage.getItem("taskflow-tasks")) || [];
let currentFilter = "all";

todayDate.textContent = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric"
}).format(new Date());

function saveTasks() {
  localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  savedStatus.textContent = "Saved automatically";
}

function renderTasks() {
  taskList.innerHTML = "";

  const visibleTasks = tasks.filter(task => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  visibleTasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    const check = document.createElement("button");
    check.className = "check-btn";
    check.setAttribute("aria-label", "Mark task complete");
    check.textContent = task.completed ? "✓" : "";
    check.addEventListener("click", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const remove = document.createElement("button");
    remove.className = "delete-btn";
    remove.setAttribute("aria-label", "Delete task");
    remove.textContent = "×";
    remove.addEventListener("click", () => deleteTask(task.id));

    li.append(check, text, remove);
    taskList.appendChild(li);
  });

  emptyState.style.display = visibleTasks.length ? "none" : "block";
  updateStats();
}

function addTask(text) {
  tasks.unshift({
    id: Date.now(),
    text,
    completed: false
  });
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const remaining = total - completed;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  remainingCount.textContent = remaining;
  progressPercent.textContent = `${percent}%`;
  progressText.textContent = `${completed} of ${total} completed`;
  progressRing.style.background =
    `conic-gradient(var(--primary) ${percent * 3.6}deg, #e9e8f7 ${percent * 3.6}deg)`;

  if (total === 0) progressTitle.textContent = "Getting started";
  else if (percent === 100) progressTitle.textContent = "All done! 🎉";
  else if (percent >= 50) progressTitle.textContent = "Great progress";
  else progressTitle.textContent = "Keep going";
}

todoForm.addEventListener("submit", event => {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  addTask(text);
  taskInput.value = "";
  taskInput.focus();
});

filters.forEach(filter => {
  filter.addEventListener("click", () => {
    filters.forEach(button => button.classList.remove("active"));
    filter.classList.add("active");
    currentFilter = filter.dataset.filter;
    renderTasks();
  });
});

clearCompleted.addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
