const listeners = {};
let nextToken = 1;

export const MyModule = {
  async start(config) { return { state: 'running', config }; },
  async stop() { return { state: 'stopped' }; },
  getStatus() { return { state: 'stopped' }; },
  subscribe(topic, callback) {
    const token = nextToken++;
    listeners[token] = { topic, callback };
    return token;
  },
  unsubscribe(token) { delete listeners[token]; },
};
