import TodoListManager from "../classes/todolistManager.js";

let todoList;

document.addEventListener("DOMContentLoaded", async function () {
  const manager = new TodoListManager();

  // get the current selected list and load it
  const currentListName = await manager.getListName();
  loadList(currentListName);

  // toggle the list activation
  toggleListActivation(currentListName);

  // get needed elements on load
  const addButton = document.getElementById("add-task");
  const taskInput = document.getElementById("new-task");
  const todayList = document.getElementById("today-list");
  const allList = document.getElementById("all-list");

  // logic to add task when add button is clicked
  addButton.addEventListener("click", function () {
    addTaskFromInput();
  });

  // logic to add task when enter key is pressed
  taskInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      addTaskFromInput();
      event.preventDefault();
    }
  });

  // logic to switch between today and all tasks
  todayList.addEventListener("click", function () {
    toggleListActivation("today");
    loadList("today");
  });

  allList.addEventListener("click", function () {
    toggleListActivation("all");
    loadList("all");
  });
});

// function to load list
function loadList(listName) {
  const manager = new TodoListManager();
  manager.saveListSelection(listName);
  todoList = manager.createList(listName);
  todoList.loadTasks();
}

// function to add task from input
function addTaskFromInput() {
  const taskInput = document.getElementById("new-task");
  const taskName = taskInput.value.trim();
  if (taskName) {
    todoList.addTask(taskName);
    taskInput.value = "";
  }
}

// function to toggle list activation
function toggleListActivation(currentListName) {
  const todayList = document.getElementById("today-list");
  const allList = document.getElementById("all-list");

  if (currentListName === "today") {
    todayList.setAttribute("disabled", true);
    allList.removeAttribute("disabled");
  } else if (currentListName === "all") {
    allList.setAttribute("disabled", true);
    todayList.removeAttribute("disabled");
  }
}
