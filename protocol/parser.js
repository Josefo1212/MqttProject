export function serialize(type, channel, message = '') {
    const packet = { type, channel, message };
    return Buffer.from(JSON.stringify(packet) + '\n');
}

export function deserialize(data) {
    try {
        const cleanData = data.toString().trim();
        if (!cleanData) return null;

        const packet = JSON.parse(cleanData);

        if (!packet.type || !packet.channel) {
            console.warn('[Parser] Paquete inválido: Faltan campos obligatorios.');
            return null;
        }

        return packet;
    } catch (error) {
        console.error('[Parser] Error al deserializar JSON:', error.message);
        return null;
    }
}