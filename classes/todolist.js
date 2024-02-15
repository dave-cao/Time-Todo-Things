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
    const task = new Task(taskName, Helper.generateUniqueId());
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
  removeTask(taskId) {
    const taskIndex = this.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex > -1) {
      this.tasks.splice(taskIndex, 1);
      this.saveTasks();
      this.displayTasks();
    }
  }

  /**
   * Toggles the completed status of the task and saves the updated list to storage
   * @param {*} index to toggle
   */
  toggleTaskCompletion(taskId) {
    const task = this.tasks.find((task) => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.displayTasks();
    }
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
  startTrackingTime(taskId) {
    const task = this.tasks.find((task) => task.id === taskId);
    if (task) {
      task.trackingTime = true;
      task.startTime = new Date().getTime();
      this.saveTasks();
      this.displayTasks();
    }
  }

  /**
   * Stops tracking the time of the task and updates the total time
   */
  stopTrackingTime(taskId) {
    const task = this.tasks.find((task) => task.id === taskId);
    if (task) {
      task.trackingTime = false;
      task.endTime = new Date().getTime();
      task.totalTime += task.endTime - task.startTime;
      this.saveTasks();
      this.displayTasks();
    }
  }

  /**
   * Get overall time tracked for all tasks
   */
  getTotalTimeTracked() {
    return this.tasks.reduce((acc, task) => acc + task.totalTime, 0);
  }

  /**
   * Displays the tasks in the popup
   */
  // Function to display tasks in the todo list
  displayTasks() {
    // Select the todo list container in the DOM
    const todoList = document.getElementById("todo-list");
    // Clear the current list to ensure we're not duplicating tasks
    todoList.innerHTML = "";

    /**
     * TOTAL TIME TRACKED HERE
     */
    // Calculate total time tracked across all tasks
    const totalTimeTracked = this.getTotalTimeTracked(); // Assuming this method returns time in milliseconds
    const formattedTotalTime = Helper.getFormattedTime(totalTimeTracked); // Format the total time for display
    // Create a div to display the total time tracked
    const totalTimeDisplay = document.createElement("div");
    totalTimeDisplay.classList.add("total-time-tracked"); // Add class for styling if needed
    totalTimeDisplay.textContent = `Total Time: ${formattedTotalTime}`;
    // Append the total time display to the todo list container or another suitable place

    // OTHER
    // Sort tasks by completion status, uncompleted tasks first
    this.tasks
      .sort((a, b) => b.completed - a.completed)
      .forEach((task, index) => {
        console.log(task);
        // Create a div element for each task
        const taskDiv = document.createElement("div");
        taskDiv.classList.add("task"); // Add 'task' class for styling

        // Create a span for the task name and append it to the task div
        const taskName = document.createElement("span");
        taskName.classList.add("task-name"); // Add 'task-name' class for styling
        taskName.textContent = task.name; // Set the task name
        taskDiv.appendChild(taskName); // Add the name span to the task div

        // If the task is completed, add 'task-completed' class for styling (e.g., strikethrough)
        if (task.completed) {
          taskName.classList.add("task-completed");
        }

        // If the task is currently being timed, add 'tracking-time' class for special styling
        if (task.trackingTime) {
          taskDiv.classList.add("tracking-time");
        }

        // Create a checkbox to toggle the task completion status
        const toggleButton = document.createElement("input");
        toggleButton.type = "checkbox";
        toggleButton.checked = task.completed; // Set the checkbox state based on the task's completion status
        // Add an event listener to handle the change event (task completion toggle)
        toggleButton.addEventListener("change", () => {
          this.toggleTaskCompletion(task.id); // Toggle the completion status in the task list
          if (task.completed && task.trackingTime) {
            // If completing a task that is being timed, stop the time tracking
            this.stopTrackingTime(task.id);
          }
        });

        // Create a button to remove the task from the list
        const removeButton = document.createElement("span");
        removeButton.classList.add("remove-task"); // Add 'remove-task' class for styling
        removeButton.textContent = "❌"; // Set button text
        removeButton.title = "Remove Task"; // Tooltip for additional information
        // Event listener for the remove task button
        removeButton.addEventListener("click", () => this.removeTask(task.id));

        // Create a button to start or stop time tracking for the task
        const startTimeButton = document.createElement("span");
        startTimeButton.classList.add("start-time"); // Add 'start-time' class for styling
        startTimeButton.textContent = task.trackingTime ? "🛑" : "⏳"; // Set the button text based on tracking status
        startTimeButton.title = task.trackingTime
          ? "Stop Tracking Time"
          : "Start Tracking Time"; // Tooltip for additional information
        // Event listener to toggle time tracking
        startTimeButton.addEventListener("click", () => {
          task.trackingTime
            ? this.stopTrackingTime(task.id)
            : this.startTrackingTime(task.id);
        });

        // If the task has tracked time, create a span to display the total time
        const totalTime = document.createElement("span");
        totalTime.classList.add("total-time"); // Add 'total-time' class for styling
        totalTime.textContent = Helper.getFormattedTime(task.totalTime); // Format and set the total tracked time

        // Add elements to the task div in the desired order
        if (!task.completed) taskDiv.prepend(startTimeButton); // Only add if the task is not completed
        taskDiv.prepend(toggleButton);
        if (!task.trackingTime) taskDiv.appendChild(removeButton); // Only add if not currently tracking time
        if (task.totalTime) taskDiv.appendChild(totalTime); // Only add if there's tracked time to display

        // Finally, append the task div to the todo list container
        todoList.appendChild(taskDiv);
        todoList.prepend(totalTimeDisplay); // You can also prepend if you want it at the top
      });
  }
}
