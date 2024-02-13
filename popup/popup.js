import TodoList from "../classes/todolist.js";

let todoList;

document.addEventListener("DOMContentLoaded", function () {
  console.log("hello");
  todoList = new TodoList();
  todoList.loadTasks(); // load tasks when the popup is opened

  // get needed elements on load
  const addButton = document.getElementById("add-task");
  const taskInput = document.getElementById("new-task");

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
});

// function to add task from input
function addTaskFromInput() {
  const taskInput = document.getElementById("new-task");
  const taskName = taskInput.value.trim();
  if (taskName) {
    todoList.addTask(taskName);
    taskInput.value = "";
  }
}
