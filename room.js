class Room {
  constructor() {
    this.roomLogic = new RoomLogic('ws://localhost:8080');
    this.myId = null;
    this.isMuted = false;

    // UI Elements
    this.myIdDisplay = document.getElementById('my-id-display');
    this.peerIdInput = document.getElementById('peer-id-input');
    this.callBtn = document.getElementById('call-btn');
    this.micsContainer = document.getElementById('mics');

    // The original HTML does not have a clear mute button in the footer.
    // I will repurpose the first button in the toolbar for muting.
    this.muteBtn = document.querySelector('#controls-toolbar button');

    if (this.muteBtn) {
        this.muteBtn.innerHTML = '🎤';
        this.muteBtn.title = 'Mute/Unmute';
    }
  }

  async init() {
    // 1. Set up the callback for when a remote track is received
    this.roomLogic.rtcConnectionManager.setOnTrack((stream, userId) => {
      console.log(`Received stream from ${userId}. Creating audio element.`);
      this.addRemoteUser(stream, userId);
    });

    // 2. Connect to the signaling server and get our client ID
    try {
      this.myId = await this.roomLogic.init();
      if (this.myIdDisplay) {
        this.myIdDisplay.textContent = this.myId;
      }
      console.log('Room initialized. My ID:', this.myId);
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('Could not connect to the server. Please try again later.');
    }

    // 3. Set up UI event listeners
    this.setupEventListeners();

    // 4. Clear out the hardcoded mics
    this.micsContainer.innerHTML = '';

    // 5. Add our own mic to the UI
    this.addLocalUser();

    // Keep the clock running
    setInterval(this.updateClock, 1000);
  }

  setupEventListeners() {
    if (this.callBtn) {
      this.callBtn.addEventListener('click', () => {
        const targetUserId = this.peerIdInput.value.trim();
        if (targetUserId && targetUserId !== this.myId) {
          console.log(`Calling user ${targetUserId}...`);
          this.roomLogic.callUser(targetUserId);
        } else {
          alert('Please enter a valid peer ID to call.');
        }
      });
    }

    if (this.muteBtn) {
        this.muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            // The toggleAudio method in the manager expects 'enabled', which is the opposite of 'muted'
            this.roomLogic.rtcConnectionManager.toggleAudio(!this.isMuted);
            this.muteBtn.innerHTML = this.isMuted ? '🔇' : '🎤';

            const localMicElement = document.getElementById(`mic-${this.myId}`);
            if(localMicElement) {
                localMicElement.classList.toggle('muted', this.isMuted);
            }
        });
    }
  }

  addLocalUser() {
    const micDiv = this.createMicElement(this.myId, true);
    micDiv.innerText = `🎤 You (${this.myId})`;
    this.micsContainer.appendChild(micDiv);
  }

  addRemoteUser(stream, userId) {
    // Avoid adding a user who is already there
    if (document.getElementById(`mic-${userId}`)) {
      console.log(`User ${userId} already in UI.`);
      return;
    }

    const micDiv = this.createMicElement(userId);
    micDiv.innerText = `🎤 User (${userId.substring(0, 5)}...)`;
    this.micsContainer.appendChild(micDiv);

    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.id = `audio-${userId}`;
    micDiv.appendChild(audio);
  }

  createMicElement(userId, isLocal = false) {
      const micDiv = document.createElement('div');
      micDiv.id = `mic-${userId}`;
      micDiv.className = 'mic';
      if(isLocal) {
          micDiv.classList.add('local');
      }
      return micDiv;
  }

  updateClock() {
    const clockTime = document.getElementById('clock-time');
    if (clockTime) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        clockTime.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const room = new Room();
  room.init();
});
