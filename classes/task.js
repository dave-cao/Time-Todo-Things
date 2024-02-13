export default class Task {
  constructor(name, completed = false) {
    // task properties
    this.name = name;
    this.completed = completed;
    this.dateCreated = new Date();

    // time tracking
    this.trackingTime = false;
    this.startTime = 0;
    this.endTime = 0;
    this.totalTime = 0;
  }
}
