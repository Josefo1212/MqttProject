import { MQTTClient } from './mqttClient.js';

const client = new MQTTClient();
const targetChannel = 'development/updates';

try {
  await client.connect();
  console.log(`[+] Conectado exitosamente. Suscribiéndose a "${targetChannel}"...`);
  
  client.subscribe(targetChannel, (message) => {
    console.log(`[📩] Nuevo mensaje en ${targetChannel}:`, message);
  });

  console.log('[~] Esperando mensajes (Presiona Ctrl+C para salir)...');

} catch (error) {
  console.error('[!] Fallo al iniciar el suscriptor:', error.message);
}