import net from 'node:net';
import { Broker } from './broker.js';

const PORT = 1883;
const broker = new Broker();

const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[+] Cliente conectado: ${clientAddress}`);

  socket.on('data', (data) => {
    console.log(`[~] Datos recibidos de ${clientAddress} (${data.length} bytes)`);
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
