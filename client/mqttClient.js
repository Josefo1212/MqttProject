import net from 'node:net';

export class MQTTClient {
  #socket;
  #callbacks;
  #buffer;

  constructor() {
    this.#callbacks = new Map();
    this.#buffer = '';
  }

  connect(port = 1883, host = '127.0.0.1') {
    return new Promise((resolve, reject) => {
      this.#socket = net.createConnection({ port, host }, () => {
        resolve();
      });

      // Escuchar los mensajes entrantes del servidor
      this.#socket.on('data', (data) => {
        this.#buffer += data.toString();

        let newlineIndex;
        while ((newlineIndex = this.#buffer.indexOf('\n')) !== -1) {
          const packet = this.#buffer.slice(0, newlineIndex);
          this.#buffer = this.#buffer.slice(newlineIndex + 1);

          try {
            const payload = JSON.parse(packet);

            if (payload.type === 'message' && this.#callbacks.has(payload.channel)) {
              const callback = this.#callbacks.get(payload.channel);
              callback(payload.message);
            }
          } catch (error) {
            console.error('[-] Error parseando el paquete del servidor:', error.message);
          }
        }
      });

      this.#socket.on('error', (err) => {
        reject(err);
      });
    });
  }

  subscribe(channel, callback) {
    if (!this.#socket) throw new Error('You must connect before subscribing.');

    this.#callbacks.set(channel, callback);

    const packet = JSON.stringify({
      type: 'subscribe',
      channel: channel
    }) + '\n';

    this.#socket.write(packet);
  }

  publish(channel, message) {
    if (!this.#socket) throw new Error('You must connect before publishing.');

    const packet = JSON.stringify({
      type: 'publish',
      channel: channel,
      message: message
    }) + '\n';

    this.#socket.write(packet);
  }

  disconnect() {
    if (this.#socket) {
      this.#socket.end();
    }
  }
}