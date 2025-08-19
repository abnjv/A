class RTCConnectionManager {
    constructor(signalingClient) {
        this.signalingClient = signalingClient;
        this.peerConnections = new Map(); // Map<userId, RTCPeerConnection>
        this.localStream = null;
        this.onTrackCallback = null; // Callback for when a remote track is received
    }

    setOnTrack(callback) {
        this.onTrackCallback = callback;
    }

    async getUserMedia() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            console.log('Successfully acquired user media.');
        } catch (error) {
            console.error('Error accessing user media:', error);
            throw error;
        }
    }

    createPeerConnection(targetUserId) {
        if (this.peerConnections.has(targetUserId)) {
            console.warn(`Peer connection for ${targetUserId} already exists.`);
            return this.peerConnections.get(targetUserId);
        }

        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Using a public STUN server
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignalingMessage(targetUserId, {
                    type: 'ice-candidate',
                    candidate: event.candidate,
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`Received remote track from ${targetUserId}`);
            if (this.onTrackCallback) {
                this.onTrackCallback(event.stream, targetUserId);
            }
        };

        // Add local stream tracks to the peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                pc.addTrack(track, this.localStream);
            });
        }

        this.peerConnections.set(targetUserId, pc);
        console.log(`Created peer connection for ${targetUserId}`);
        return pc;
    }

    async createOffer(targetUserId) {
        const pc = this.createPeerConnection(targetUserId);
        try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            this.sendSignalingMessage(targetUserId, {
                type: 'offer',
                sdp: pc.localDescription,
            });
            console.log(`Sent offer to ${targetUserId}`);
        } catch (error) {
            console.error('Error creating offer:', error);
        }
    }

    async handleOffer(senderId, sdp) {
        const pc = this.createPeerConnection(senderId);
        try {
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.sendSignalingMessage(senderId, {
                type: 'answer',
                sdp: pc.localDescription,
            });
            console.log(`Sent answer to ${senderId}`);
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    async handleAnswer(senderId, sdp) {
        const pc = this.peerConnections.get(senderId);
        if (pc) {
            try {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                console.log(`Connection established with ${senderId}`);
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        }
    }

    handleIceCandidate(senderId, candidate) {
        const pc = this.peerConnections.get(senderId);
        if (pc) {
            try {
                pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error('Error adding received ICE candidate:', error);
            }
        }
    }

    toggleAudio(enabled) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = enabled;
            });
        }
    }

    closeConnection(userId) {
        const pc = this.peerConnections.get(userId);
        if (pc) {
            pc.close();
            this.peerConnections.delete(userId);
            console.log(`Closed connection with ${userId}`);
        }
    }

    // Helper method to send signaling messages
    sendSignalingMessage(target, message) {
        this.signalingClient.send({ ...message, target });
    }
}
