import { deserialize, serialize } from './parser.js';

export function routeMessage(data, socket, broker) {
    const packet = deserialize(data);
    if (!packet) return;

    const { type, channel, message } = packet;

    switch (type) {
        case 'subscribe':
            broker.subscribe(channel, socket);
            console.log(`[Router] Cliente suscrito al canal: "${channel}"`);
            break;

        case 'publish':
            handlePublish(channel, message, socket, broker);
            break;

        default:
            console.warn(`[Router] Tipo de paquete desconocido: "${type}"`);
    }
}

function handlePublish(channel, message, senderSocket, broker) {
    const subscribers = broker.getSubscribers(channel);

    console.log(`[Router] Difundiendo en "${channel}" a ${subscribers.size} suscriptores: "${message}"`);

    const outgoingData = serialize('message', channel, message);

    for (const clientSocket of subscribers) {
        if (clientSocket !== senderSocket && clientSocket.writable) {
            clientSocket.write(outgoingData);
        }
    }
}