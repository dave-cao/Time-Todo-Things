import TodoListManager from "../classes/todolistManager.js";
import Helper from "../classes/helper.js";

let todoList;
const manager = new TodoListManager();

document.addEventListener("DOMContentLoaded", async function () {
  // get the current selected list and load it
  const currentListName = await manager.getListName();
  loadList(currentListName);

  // populate the dropdown
  toggleDropdown(currentListName);

  // get needed elements on load
  const addButton = document.getElementById("add-task");
  const taskInput = document.getElementById("new-task");
  const todayList = document.getElementById("today-list");
  const deleteListButton = document.getElementById("delete-list");

  // change delete list button content to "Done for the day" if today list is selected
  deleteListButton.textContent =
    currentListName === "today" ? "Done for the day" : "Delete List";

  // logic to delete list when delete button is clicked
  deleteListButton.addEventListener("click", async function () {
    const dropdown = document.getElementById("list-dropdown");
    const selectedListName = dropdown.value;
    if (selectedListName && selectedListName !== "add_new_list") {
      const confirmDelete = confirm(
        `Are you sure you want to delete the list: ${selectedListName}?`
      );
      if (confirmDelete) {
        await manager.deleteList(selectedListName);
        // Refresh the dropdown to reflect the deletion
        populateDropdown(); // Assuming this will reset to a default state or another existing list
        loadList("today"); // Load the "today" list or another default list
      }
    } else if ((await manager.getListName()) === "today") {
      const currentList = manager.getList("today");
      const confirmClear = confirm(
        "Are you done for the day? (This will clear all tasks)"
      );
      if (confirmClear) {
        alert(
          `Congrats! You've completed all your tasks for today! 🎉🎉\n\nYour total time is: ${
            currentList.getTotalTimeTracked()
              ? Helper.getFormattedTime(currentList.getTotalTimeTracked())
              : 0
          }\nI recommend inputting your tasks for tomorrow...`
        );
        currentList.clearTasks();
      }
    } else {
      alert("Please select a valid list to delete.");
    }
  });

  // go to today list when today button is clicked
  todayList.addEventListener("click", function () {
    loadList("today");
    populateDropdown("today");
  });

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

// function to load list
function loadList(listName) {
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

// Function to toggle the dropdown of lists
function toggleDropdown(currentListName) {
  const dropdown = document.getElementById("list-dropdown");
  if (!dropdown.classList.contains("show")) {
    populateDropdown(currentListName); // Populate dropdown if not already shown
    dropdown.classList.add("show");
  } else {
    dropdown.classList.remove("show");
  }
}

// Function to populate the dropdown with lists
async function populateDropdown(currentListName) {
  const lists = await manager.getAllListNames(); // Fetch all list names
  const dropdown = document.getElementById("list-dropdown");
  const deleteListButton = document.getElementById("delete-list");
  deleteListButton.textContent =
    currentListName === "today" ? "Done for the day" : "Delete List";
  dropdown.innerHTML = ""; // Clear existing items

  // Populate dropdown with lists
  const defaultOption = document.createElement("option");
  defaultOption.textContent = "Select a list...";
  defaultOption.value = "";
  defaultOption.selected = true;
  defaultOption.disabled = true;
  dropdown.appendChild(defaultOption);

  lists
    // Filter out the "today" list
    .filter((listName) => listName !== "today")
    .forEach((listName) => {
      const listItem = document.createElement("option");
      listItem.textContent = listName;
      listItem.value = listName;
      listItem.selected = listName === currentListName;
      dropdown.appendChild(listItem);
    });

  // Add "Add New List" option
  const addNewListOption = document.createElement("option");
  addNewListOption.textContent = "Add New List...";
  addNewListOption.value = "add_new_list";
  dropdown.appendChild(addNewListOption);

  // Event listener for dropdown changes
  dropdown.onchange = async function () {
    const selectedValue = this.value;
    // TODO this is not MODULAR at all
    deleteListButton.textContent = selectedValue
      ? "Delete List"
      : "Done for the day";

    if (selectedValue === "add_new_list") {
      // Prompt user to enter the name of the new list
      const newListName = prompt("Enter new list name:");
      if (newListName && newListName.trim() !== "") {
        await manager.createList(newListName); // Create new list
        // Add the new list as an option and select it
        const newOption = document.createElement("option");
        newOption.textContent = newListName;
        newOption.value = newListName;
        dropdown.add(newOption, dropdown.options[dropdown.options.length - 2]); // Insert before "Add New List"
        dropdown.value = newListName; // Select the newly added list option
        loadList(newListName); // Load the newly created list
      } else {
        dropdown.value = ""; // Reset selection or set it to a default/previous value
      }
    } else {
      // Handle selection of existing lists
      loadList(selectedValue);
    }
  };
}
