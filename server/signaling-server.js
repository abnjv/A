const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// A map to store connected clients, mapping client ID to WebSocket object
const clients = new Map();

console.log('Signaling server started on ws://localhost:8080');

wss.on('connection', (ws) => {
    // Generate a unique ID for the new client
    const clientId = Date.now().toString() + Math.random().toString().substring(2);
    clients.set(clientId, ws);

    console.log(`Client ${clientId} connected.`);

    // Send the client its ID
    ws.send(JSON.stringify({ type: 'your-id', id: clientId }));

    ws.on('message', (message) => {
        let parsedMessage;
        try {
            // Message is received as a Buffer, so we need to convert it to a string
            parsedMessage = JSON.parse(message.toString());
        } catch (e) {
            console.error('Failed to parse message:', message.toString());
            return;
        }

        const { target } = parsedMessage;
        const targetWs = clients.get(target);

        // Add sender info to the message before forwarding
        const messageToSend = {
            ...parsedMessage,
            sender: clientId
        };

        if (targetWs && targetWs.readyState === WebSocket.OPEN) {
            console.log(`Forwarding message from ${clientId} to ${target}`);
            targetWs.send(JSON.stringify(messageToSend));
        } else {
            console.warn(`Target client ${target} not found or not open.`);
            // Optionally, notify the sender that the target is not available
            ws.send(JSON.stringify({ type: 'error', message: `User ${target} not found.` }));
        }
    });

    ws.on('close', () => {
        // Find the client ID associated with this WebSocket connection and remove it
        for (let [id, clientWs] of clients.entries()) {
            if (clientWs === ws) {
                clients.delete(id);
                console.log(`Client ${id} disconnected.`);
                break;
            }
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
