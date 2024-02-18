import TodoList from "../classes/todolist.js";

export default class TodoListManager {
  constructor() {
    this.lists = {};
    this.currentList = null;
    this.currentListName = null;

    this.loadListName();
  }

  /**
   * Create a new list
   * @param {*} listName to create
   */
  createList(listName) {
    // if the list does not exist, create it
    if (!this.lists[listName]) {
      const newList = new TodoList(listName);
      this.lists[listName] = newList;

      // set the current list to the newly created list
      this.currentList = newList;
    } else {
      // set the current list to the existing list
      this.currentList = this.getList(listName);
    }
    return this.currentList;
  }

  /**
   * Get a list
   * @param {*} listName to get
   */
  getList(listName) {
    // if the list exists, return it
    if (this.lists[listName]) {
      return this.lists[listName];
    } else {
      // if the list does not exist, log an error
      console.log(`List ${listName} does not exist`);
      return null;
    }
  }

  /**
   * Delete a specified list and its tasks from storage
   * @param {*} listName Name of the list to delete
   */
  deleteList(listName) {
    const storageKey = `${listName}-tasks`; // Construct the storage key

    chrome.storage.local.remove(storageKey, () => {
      console.log(
        `List ${listName} and its tasks have been deleted from storage.`
      );
      // Optionally, you can also handle any UI updates here or callback functions.
    });

    // If you are maintaining a list of all list names separately, make sure to update that as well.
    // For example, if you have an array or object tracking all lists, remove the list from there too.
    if (this.lists && this.lists[listName]) {
      delete this.lists[listName]; // Remove from the in-memory object if it exists
    }

    // Further, if you're tracking the current list, you might want to set it to null or switch to another list
    if (this.currentListName === listName) {
      this.currentListName = null; // Or set to another default list
      this.currentList = null;
    }
  }

  /**
   * Save the current list to storage
   */
  saveListSelection(listName) {
    chrome.storage.local.set({
      currentList: listName,
    });
  }

  /**
   * Load the current list name from storage
   */
  loadListName() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["currentList"], (result) => {
        if (result.currentList) {
          this.currentListName = result.currentList;
        } else {
          this.currentListName = "today";
        }
        resolve(this.currentListName); // Resolve the promise with the current list name
      });
    });
  }

  /**
   * Get the current list name
   * @returns the current list name
   */
  async getListName() {
    await this.loadListName();
    return this.currentListName;
  }

  async getAllListNames() {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(null, (items) => {
        // Fetch all items from storage
        const allKeys = Object.keys(items);
        const listNames = allKeys
          .filter((key) => key.endsWith("-tasks")) // Filter keys that end with '-tasks'
          .map((key) => key.replace("-tasks", "")); // Remove '-tasks' to get the list name
        resolve(listNames);
      });
    });
  }
}
