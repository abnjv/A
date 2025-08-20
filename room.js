class Room {
  constructor() {
    // WebRTC Logic
    this.roomLogic = new RoomLogic('ws://localhost:8080');
    this.myId = null;
    this.isMuted = false;

    // UI Elements
    this.micsContainer = document.getElementById('mics');

    // --- Control Buttons ---
    // Repurpose the first button for Mute
    this.muteBtn = document.querySelector('#controls-toolbar button:nth-child(1)');
    // The gift button is the third one
    this.giftBtn = document.querySelector('#controls-toolbar button:nth-child(3)');
    // The exit button has an ID
    this.exitBtn = document.getElementById('exit-btn');

    // --- Gift Modal Elements ---
    this.giftModal = document.getElementById('gift-modal');
    this.giftOptions = document.querySelectorAll('.gift-option');
    this.closeGiftModalBtn = this.giftModal ? this.giftModal.querySelector('button') : null;

    // --- Cosmetic ---
    this.clockTime = document.getElementById('clock-time');

    // Setup button titles and icons for clarity
    if (this.muteBtn) {
        this.muteBtn.innerHTML = '🎤';
        this.muteBtn.title = 'Mute/Unmute';
    }
  }

  async init() {
    // 1. Set up WebRTC callbacks
    this.roomLogic.rtcConnectionManager.setOnTrack((stream, userId) => {
      console.log(`Received stream from ${userId}. Creating audio element.`);
      this.addRemoteUser(stream, userId);
    });

    // 2. Connect to the signaling server
    try {
      this.myId = await this.roomLogic.init();
      console.log('Room initialized. My ID:', this.myId);
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('Could not connect to the server. Please try again later.');
    }

    // 3. Set up all UI event listeners
    this.setupEventListeners();

    // 4. Clean up the UI
    this.micsContainer.innerHTML = ''; // Clear hardcoded mics
    this.addLocalUser(); // Add our own mic element

    // 5. Start cosmetic timers/updates
    setInterval(() => this.updateClock(), 1000);
  }

  setupEventListeners() {
    // Mute Button
    if (this.muteBtn) {
        this.muteBtn.addEventListener('click', () => this.toggleMute());
    }

    // Exit Button
    if (this.exitBtn) {
        this.exitBtn.addEventListener('click', () => this.exitRoom());
    }

    // Gift Feature Buttons
    if (this.giftBtn) {
        this.giftBtn.addEventListener('click', () => this.openGiftModal());
    }
    if (this.closeGiftModalBtn) {
        this.closeGiftModalBtn.addEventListener('click', () => this.closeGiftModal());
    }
    if (this.giftOptions) {
        this.giftOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectGift(option.textContent);
            });
        });
    }
  }

  // --- Feature Methods ---

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.roomLogic.rtcConnectionManager.toggleAudio(!this.isMuted);
    this.muteBtn.innerHTML = this.isMuted ? '🔇' : '🎤';
    const localMicElement = document.getElementById(`mic-${this.myId}`);
    if(localMicElement) {
        localMicElement.classList.toggle('muted', this.isMuted);
    }
  }

  exitRoom() {
    if (confirm("هل أنت متأكد أنك تريد مغادرة الغرفة؟")) {
        // In a real app, you'd gracefully close all peer connections here.
        window.location.href = 'lobby.html';
    }
  }

  openGiftModal() {
    if (this.giftModal) this.giftModal.style.display = 'flex';
  }

  closeGiftModal() {
    if (this.giftModal) this.giftModal.style.display = 'none';
  }

  selectGift(giftEmoji) {
    this.closeGiftModal();
    this.showFloatingGiftAnimation(giftEmoji);
    // In a real app, you would send this gift event over the data channel
    // to other users in the room.
  }

  showFloatingGiftAnimation(emoji) {
    for (let i = 0; i < 10; i++) {
        const gift = document.createElement('div');
        gift.innerText = emoji;
        Object.assign(gift.style, {
            position: 'fixed',
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 50 + 80}vh`,
            fontSize: `${Math.random() * 20 + 20}px`,
            opacity: 1,
            transition: 'top 3s ease-out, opacity 3s ease-out',
            zIndex: '10001',
            pointerEvents: 'none'
        });
        document.body.appendChild(gift);

        setTimeout(() => {
            gift.style.top = '-100px';
            gift.style.opacity = 0;
        }, 100);

        setTimeout(() => gift.remove(), 3100);
    }
  }

  // --- WebRTC UI Methods ---

  addLocalUser() {
    const micDiv = this.createMicElement(this.myId, true);
    micDiv.innerText = `🎤 You (${this.myId})`;
    this.micsContainer.appendChild(micDiv);
  }

  addRemoteUser(stream, userId) {
    if (document.getElementById(`mic-${userId}`)) return;

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
      if(isLocal) micDiv.classList.add('local');
      return micDiv;
  }

  // --- Cosmetic Methods ---

  updateClock() {
    if (this.clockTime) {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        this.clockTime.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }
}

// --- App Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  const room = new Room();
  room.init();
});
