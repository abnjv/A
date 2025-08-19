class SignalingClient {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        this.ws = null;
        this.clientId = null;

        this.onOpen = null;
        this.onMessage = null;
        this.onClose = null;
        this.onError = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.serverUrl);

            this.ws.onopen = () => {
                console.log('Connected to signaling server.');
                // The actual 'onOpen' callback will be called when the client ID is received.
            };

            this.ws.onmessage = (event) => {
                const message = JSON.parse(event.data);

                // The first message from the server should be the client's ID
                if (message.type === 'your-id') {
                    this.clientId = message.id;
                    console.log(`Received client ID: ${this.clientId}`);
                    if (this.onOpen) {
                        this.onOpen(this.clientId);
                    }
                    resolve(this.clientId); // Resolve the promise on successful connection and ID assignment
                } else {
                    if (this.onMessage) {
                        this.onMessage(message);
                    }
                }
            };

            this.ws.onclose = () => {
                console.log('Disconnected from signaling server.');
                if (this.onClose) {
                    this.onClose();
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                if (this.onError) {
                    this.onError(error);
                }
                reject(error); // Reject the promise on error
            };
        });
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.error('WebSocket is not connected.');
        }
    }

    close() {
        if (this.ws) {
            this.ws.close();
        }
    }
}
