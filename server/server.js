import net from 'node:net';
import { Broker } from './broker.js';
import { routeMessage } from '../protocol/router.js';

const PORT = 1883;
const broker = new Broker();

const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[+] Cliente conectado: ${clientAddress}`);

  let buffer = '';

  socket.on('data', (data) => {
    buffer += data.toString();

    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const packet = buffer.slice(0, newlineIndex + 1);
      buffer = buffer.slice(newlineIndex + 1);
      routeMessage(packet, socket, broker);
    }
  });

  socket.on('close', () => {
    console.log(`[-] Cliente desconectado: ${clientAddress}`);
    broker.removeClient(socket);
  });

  socket.on('error', (err) => {
    console.error(`[!] Error en socket ${clientAddress}: ${err.message}`);
  });
});

server.on('error', (err) => {
  console.error(`[!] Error en el servidor: ${err.message}`);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`[✓] Servidor MQTT escuchando en puerto ${PORT}`);
});
