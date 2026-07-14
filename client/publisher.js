import { MQTTClient } from './mqttClient.js';

const client = new MQTTClient();
const targetChannel = 'development/updates';
const payload = '¡Hola! El sistema está en línea.';

try {
  await client.connect();
  console.log('[+] Conectado exitosamente.');
  
  console.log(`[🚀] Publicando en "${targetChannel}"...`);
  client.publish(targetChannel, payload);

  // Retardo asíncrono simple para asegurar que el socket hace "flush" antes de cerrarlo
  setTimeout(() => {
    client.disconnect();
    console.log('[✓] Mensaje enviado y cliente desconectado.');
  }, 100);

} catch (error) {
  console.error('[!] Fallo al iniciar el publicador:', error.message);
}