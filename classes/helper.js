export default class Helper {
  static getFormattedTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    return `${days ? days + "d" : ""} ${hours ? (hours % 24) + "h" : ""} ${
      minutes ? (minutes % 60) + "m" : ""
    } ${seconds ? (seconds % 60) + "s" : ""}`;
  }
}
