export class Broker {
  constructor() {
    this.channels = new Map();
  }

  subscribe(channel, socket) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel).add(socket);
  }

  getSubscribers(channel) {
    return this.channels.get(channel) || new Set();
  }

  removeClient(socket) {
    for (const [channel, subscribers] of this.channels) {
      subscribers.delete(socket);
      if (subscribers.size === 0) {
        this.channels.delete(channel);
      }
    }
  }
}
