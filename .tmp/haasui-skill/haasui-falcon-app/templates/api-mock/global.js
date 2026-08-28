class EventSlot {
  constructor() { this.listeners = []; }
  on(callback) { this.listeners.push(callback); }
  off(callback) { this.listeners = this.listeners.filter((item) => item !== callback); }
  emit(uuid, jsonData) { this.listeners.slice().forEach((callback) => callback(uuid, jsonData)); }
}

export class Global {
  constructor() { this.textEditFinished = new EventSlot(); }
  startTextEdit() { return 'mock-text-edit'; }
  closeTextEdit() {}
}

export default { Global };
