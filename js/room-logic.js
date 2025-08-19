class RoomLogic {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
        // The other JS files need to be loaded in the HTML for these to work.
        this.signalingClient = new SignalingClient(this.serverUrl);
        this.rtcConnectionManager = new RTCConnectionManager(this.signalingClient);
        this.myId = null;
        this.isMuted = false;
    }

    async init() {
        // Set up the callback for when a remote track is received
        this.rtcConnectionManager.setOnTrack((stream, userId) => {
            console.log(`Received stream from ${userId}. Attaching to an audio element.`);
            let audio = document.getElementById(`audio-${userId}`);
            if (!audio) {
                audio = document.createElement('audio');
                audio.id = `audio-${userId}`;
                audio.autoplay = true;
                document.body.appendChild(audio); // Or attach it to a specific container
            }
            audio.srcObject = stream;
        });

        // Set up the message handler for the signaling client
        this.signalingClient.onMessage = (message) => {
            this.handleSignalingMessage(message);
        };

        // Connect to the signaling server and get our client ID
        this.myId = await this.signalingClient.connect();

        // Get user's microphone access
        await this.rtcConnectionManager.getUserMedia();

        return this.myId;
    }

    handleSignalingMessage(message) {
        const { type, sender, sdp, candidate } = message;

        switch (type) {
            case 'offer':
                console.log(`Received offer from ${sender}`);
                this.rtcConnectionManager.handleOffer(sender, sdp);
                break;
            case 'answer':
                 console.log(`Received answer from ${sender}`);
                this.rtcConnectionManager.handleAnswer(sender, sdp);
                break;
            case 'ice-candidate':
                this.rtcConnectionManager.handleIceCandidate(sender, candidate);
                break;
            case 'error':
                console.error('Received error from server:', message.message);
                break;
            default:
                console.warn('Unknown message type received:', type);
        }
    }

    callUser(targetUserId) {
        if (!targetUserId || targetUserId === this.myId) {
            console.error('Invalid target user ID.');
            return;
        }
        console.log(`Calling user ${targetUserId}...`);
        this.rtcConnectionManager.createOffer(targetUserId);
    }

    toggleMute(muteButton) {
        this.isMuted = !this.isMuted;
        this.rtcConnectionManager.toggleAudio(!this.isMuted); // enabled = true means unmuted
        console.log(`Audio is now ${this.isMuted ? 'muted' : 'unmuted'}.`);
        if (muteButton) {
            muteButton.textContent = this.isMuted ? 'Unmute' : 'Mute';
        }
    }

    closeConnection(userId) {
        this.rtcConnectionManager.closeConnection(userId);
        const audioEl = document.getElementById(`audio-${userId}`);
        if (audioEl) {
            audioEl.remove();
        }
    }
}
