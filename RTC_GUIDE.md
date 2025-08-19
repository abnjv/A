# WebRTC Implementation Guide

This document provides an overview of the WebRTC implementation for the AirChat application. It details the architecture, the roles of the key modules, and how they interact to establish a peer-to-peer audio connection.

## Architecture Overview

The WebRTC communication is managed by three main components:

1.  **Signaling Server (`server/signaling-server.js`)**: A WebSocket server that acts as a matchmaker. It doesn't handle any audio traffic but is crucial for clients to exchange the metadata needed to establish a direct connection. This metadata includes offers, answers, and ICE candidates.

2.  **Client-Side Modules**: A set of JavaScript modules that run in the browser and manage the entire WebRTC lifecycle.
    *   `signaling-client.js`: Connects to the signaling server.
    *   `rtc-connection-manager.js`: Handles all the WebRTC API complexities.
    *   `room-logic.js`: Acts as the orchestrator between the UI and the other modules.

3.  **Test Page (`test-voice.html`)**: A simple HTML page to test and verify the end-to-end connection.

### Connection Flow

1.  Two clients (peers) connect to the Signaling Server. The server assigns each a unique ID.
2.  **Peer A** decides to call **Peer B**.
3.  Peer A's `RTCConnectionManager` creates a WebRTC **Offer**. This offer (containing session description protocol - SDP) describes Peer A's proposed connection settings.
4.  The offer is sent to the Signaling Server, which relays it to Peer B.
5.  Peer B's `RTCConnectionManager` receives the offer and creates an **Answer**.
6.  The answer is sent back to Peer A via the Signaling Server.
7.  While this is happening, both peers are gathering **ICE Candidates** (potential network paths, like IP addresses and ports). These candidates are also exchanged via the Signaling Server.
8.  Once both peers have the necessary information (offer, answer, and candidates), they attempt to establish a direct `RTCPeerConnection`.
9.  If successful, audio data begins to flow directly between the peers, without going through the server.

---

## Core Client-Side Modules

### `signaling-client.js`

-   **Purpose**: Manages the WebSocket connection.
-   **Key Methods**:
    -   `connect()`: Establishes a connection to the `ws://localhost:8080` server.
    -   `send(message)`: Sends a JavaScript object to the server.
    -   `onMessage(message)`: A callback that is invoked when a message is received from the server.
    -   `onOpen(clientId)`: A callback that is invoked when the connection is established and the server has assigned a client ID.

### `rtc-connection-manager.js`

-   **Purpose**: To abstract away the complexity of the `RTCPeerConnection` API.
-   **Key Methods**:
    -   `async getUserMedia()`: Prompts the user for microphone access and stores the local audio stream.
    -   `createOffer(targetUserId)`: Initiates a call by creating and sending an offer.
    -   `handleOffer(senderId, sdp)`: Responds to an incoming offer by creating and sending an answer.
    -   `handleAnswer(senderId, sdp)`: Finalizes the connection setup after receiving an answer.
    -   `handleIceCandidate(senderId, candidate)`: Processes incoming ICE candidates.
    -   `toggleAudio()`: Mutes or unmutes the local audio stream by enabling/disabling the audio track.
-   **Key Properties**:
    -   `onTrack(stream, userId)`: A callback that is invoked when a remote audio stream is received.

### `room-logic.js`

-   **Purpose**: The central controller that connects the UI to the underlying WebRTC and signaling logic.
-   **Key Methods**:
    -   `async init()`: The main entry point. It initializes the signaling client, gets user media, and sets up message handlers.
    -   `handleSignalingMessage(message)`: A central handler that receives all messages from the `signaling-client` and delegates them to the appropriate method in the `rtc-connection-manager`.
    -   `toggleMute(muteButton)`: A function called by the UI to mute/unmute the user.
    -   `callUser(targetUserId)`: A helper function to start a call to another user.

---

## Basic Usage (`test-voice.html`)

The test page demonstrates how to use these modules together:

1.  **Instantiate `RoomLogic`**:
    ```javascript
    const roomLogic = new RoomLogic('ws://localhost:8080');
    ```

2.  **Initialize**: A "Join" button triggers the `init()` method.
    ```javascript
    joinBtn.addEventListener('click', async () => {
      await roomLogic.init();
      // Update UI to show connected status and client ID
    });
    ```

3.  **Make a Call**: A "Call" button takes a target user's ID and uses `roomLogic` to start the call.
    ```javascript
    callBtn.addEventListener('click', () => {
      const targetUserId = peerIdInput.value;
      roomLogic.callUser(targetUserId);
    });
    ```

4.  **Handle Mute**: The "Mute" button calls the `toggleMute` method.
    ```javascript
    muteBtn.addEventListener('click', () => {
      roomLogic.toggleMute(muteBtn);
    });
    ```

This setup provides a robust foundation for building a full-featured voice chat application. The separation of concerns between the modules makes the system easier to maintain and extend.
