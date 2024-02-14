export default class Task {
  constructor(name, category = "today") {
    // task properties
    this.name = name;
    this.completed = false;
    this.dateCreated = new Date();
    this.category = category;

    // time tracking
    this.trackingTime = false;
    this.startTime = 0;
    this.endTime = 0;
    this.totalTime = 0;
  }
}
