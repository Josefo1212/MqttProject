import net from 'node:net';

export class MQTTClient {
  // Campos privados: el usuario de la librería no puede acceder al socket ni a la lista de callbacks directamente
  #socket;
  #callbacks;
  #buffer;

  constructor() {
    this.#callbacks = new Map();
    this.#buffer = '';
  }

  // Se utiliza una Promesa para poder usar await al conectarnos en los scripts
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

  // Método para suscribirse a un canal
  subscribe(channel, callback) {
    if (!this.#socket) throw new Error('You must connect before subscribing.');

    // Guardamos la función que se ejecutará cuando llegue un mensaje a este canal
    this.#callbacks.set(channel, callback);

    // Armamos el paquete según el protocolo acordado con la Parte 2
    const packet = JSON.stringify({
      type: 'subscribe',
      channel: channel
    }) + '\n';

    this.#socket.write(packet);
  }

  // Método para publicar un mensaje en un canal
  publish(channel, message) {
    if (!this.#socket) throw new Error('You must connect before publishing.');

    const packet = JSON.stringify({
      type: 'publish',
      channel: channel,
      message: message
    }) + '\n';

    this.#socket.write(packet);
  }

  // Cierre limpio de la conexión
  disconnect() {
    if (this.#socket) {
      this.#socket.end();
    }
  }
}