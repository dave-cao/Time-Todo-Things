import Task from "./task.js";
import Helper from "./helper.js";

export default class TodoList {
  constructor(listName) {
    this.listName = listName;
    this.tasks = [];
    this.storageKey = `${this.listName}-tasks`;
  }

  /**
   * Add a new task to the todolist and save the updated list to storage
   * @param {*} taskName to add
   */
  addTask(taskName) {
    // in the future, we will add time and such
    const task = new Task(taskName);
    this.tasks.push(task);

    // save the updated tasks to storage
    this.saveTasks();

    // display the updated tasks
    this.displayTasks();
  }

  /**
   * Removes the task from the list and saves the updated list to storage
   * @param {*} index to remove
   */
  removeTask(index) {
    this.tasks.splice(index, 1);
    this.saveTasks();
    this.displayTasks();
  }

  /**
   * Toggles the completed status of the task and saves the updated list to storage
   * @param {*} index to toggle
   */
  toggleTaskCompletion(index) {
    this.tasks[index].completed = !this.tasks[index].completed;
    this.saveTasks();
    this.displayTasks();
  }

  /**
   * Saves the current tasks to storage
   */
  saveTasks() {
    chrome.storage.local.set({
      [this.storageKey]: this.tasks,
      function() {
        console.log("Tasks saved");
      },
    });
  }

  /**
   * Loads the tasks from storage and displays them
   */
  loadTasks() {
    chrome.storage.local.get([this.storageKey], (result) => {
      this.tasks = result[this.storageKey] || [];
      this.displayTasks();
    });
  }

  /**
   * Starts tracking the time of the task
   * @param {*} index of task to start tracking
   */
  startTrackingTime(index) {
    this.tasks[index].trackingTime = true;
    this.tasks[index].startTime = new Date().getTime();

    this.saveTasks();
    this.displayTasks();
  }

  /**
   * Stops tracking the time of the task and updates the total time
   */
  stopTrackingTime(index) {
    this.tasks[index].trackingTime = false;
    this.tasks[index].endTime = new Date().getTime();
    this.tasks[index].totalTime +=
      this.tasks[index].endTime - this.tasks[index].startTime;

    this.saveTasks();
    this.displayTasks();
  }

  /**
   * Displays the tasks in the popup
   */
  displayTasks() {
    const todoList = document.getElementById("todo-list");
    todoList.innerHTML = ""; // clear the current list

    this.tasks.forEach((task, index) => {
      // initialize task div
      const taskDiv = document.createElement("div");
      taskDiv.classList.add("task");

      // add task name span to task div
      const taskName = document.createElement("span");
      taskName.textContent = task.name;
      taskDiv.appendChild(taskName);

      // add completed class if task is completed
      task.completed ? taskName.classList.add("task-completed") : null;

      // add tracking-time class if task is tracking time
      task.trackingTime ? taskDiv.classList.add("tracking-time") : null;

      // toggle completion button
      const toggleButton = document.createElement("input");
      toggleButton.type = "checkbox";
      toggleButton.checked = task.completed;
      toggleButton.addEventListener("change", () => {
        this.toggleTaskCompletion(index);

        // if task is completed and tracking time, stop tracking time
        if (task.completed && task.trackingTime) {
          this.stopTrackingTime(index);
        }
      });

      // Remove task button
      const removeButton = document.createElement("button");
      removeButton.textContent = "X";
      removeButton.addEventListener("click", () => {
        this.removeTask(index);
      });

      // start time tracking button
      const startTimeButton = document.createElement("button");
      startTimeButton.textContent = task.trackingTime ? "⏳" : "📝";
      startTimeButton.addEventListener("click", () => {
        task.trackingTime
          ? this.stopTrackingTime(index)
          : this.startTrackingTime(index);
      });

      // add total time to task
      const totalTime = document.createElement("span");
      totalTime.textContent = Helper.getFormattedTime(task.totalTime);

      // add buttons to todolist
      taskDiv.prepend(toggleButton);
      !task.completed ? taskDiv.appendChild(startTimeButton) : null;
      // only show remove button if not tracking time
      !task.trackingTime ? taskDiv.appendChild(removeButton) : null;

      // only show time if time was tracked
      task.totalTime ? taskDiv.appendChild(totalTime) : null;

      // add todolist to popup
      todoList.appendChild(taskDiv);
    });
  }
}
