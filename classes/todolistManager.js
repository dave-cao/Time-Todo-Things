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
   * Delete a list
   * @param {*} listName to delete
   */
  deleteList(listName) {
    // if the list exists, delete it
    if (this.lists[listName]) {
      delete this.lists[listName];
    } else {
      // if the list does not exist, log an error
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
}
