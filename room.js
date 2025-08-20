class Room {
  constructor() {
    // --- Data ---
    this.giftsData = [
        { id: 'g1', name: 'قلب', type: 'gift', icon: '❤️' },
        { id: 'g2', name: 'نجم', type: 'gift', icon: '⭐' },
        { id: 'g3', name: 'سيارة', type: 'gift', icon: '🚗' },
        { id: 'w1', name: 'خلفية سماء', type: 'background', image: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809' },
        { id: 'w2', name: 'خلفية طبيعة', type: 'background', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe' },
        { id: 'w3', name: 'خلفية المدينة', type: 'background', image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3' },
    ];
    this.backgrounds = this.giftsData.filter(item => item.type === 'background').map(item => item.image);
    this.currentBgIndex = 0;

    // --- WebRTC Logic ---
    this.roomLogic = new RoomLogic('ws://localhost:8080');
    this.myId = null;
    this.isMuted = false;

    // --- UI Elements ---
    this.micsContainer = document.getElementById('mics');

    // --- Control Buttons (from new BottomBar) ---
    this.giftBtn = document.getElementById('gift-btn');
    this.musicBtn = document.getElementById('music-btn');
    this.muteBtn = document.getElementById('mute-btn');
    this.shareBtn = document.getElementById('share-btn');
    this.exitBtn = document.getElementById('exit-btn');

    // --- Modal Elements ---
    this.giftModal = document.getElementById('gift-modal');
    this.giftModalOptions = document.getElementById('gift-modal-options');
    this.closeGiftModalBtn = document.getElementById('gift-modal-close-btn');
    this.musicModal = document.getElementById('music-modal');
    this.closeMusicModalBtn = document.getElementById('music-modal-close-btn');

    // --- Cosmetic Elements ---
    this.clockTime = document.getElementById('clock-time');
  }

  async init() {
    this.roomLogic.rtcConnectionManager.setOnTrack((stream, userId) => this.addRemoteUser(stream, userId));

    try {
      this.myId = await this.roomLogic.init();
      console.log('Room initialized. My ID:', this.myId);
    } catch (error) {
      console.error('Initialization failed:', error);
      alert('Could not connect to the server. Please try again later.');
    }

    this.setupEventListeners();
    this.micsContainer.innerHTML = '';
    this.addLocalUser();
    setInterval(() => this.updateClock(), 1000);
    this.changeBackground(); // Set initial background
  }

  setupEventListeners() {
    if (this.muteBtn) this.muteBtn.addEventListener('click', () => this.toggleMute());
    if (this.exitBtn) this.exitBtn.addEventListener('click', () => this.exitRoom());
    if (this.giftBtn) this.giftBtn.addEventListener('click', () => this.openGiftModal());
    if (this.musicBtn) this.musicBtn.addEventListener('click', () => this.openMusicModal());

    // Modal Close Buttons
    if (this.closeGiftModalBtn) this.closeGiftModalBtn.addEventListener('click', () => this.closeGiftModal());
    if (this.closeMusicModalBtn) this.closeMusicModalBtn.addEventListener('click', () => this.closeMusicModal());

    // Gift Modal Item Selection
    if (this.giftModalOptions) {
        this.giftModalOptions.addEventListener('click', (event) => {
            const giftItemElement = event.target.closest('.gift-item');
            if (giftItemElement) {
                const itemId = giftItemElement.dataset.itemId;
                const selectedItem = this.giftsData.find(item => item.id === itemId);
                if (selectedItem) {
                    this.handleGiftSelection(selectedItem);
                }
            }
        });
    }
  }

  // --- Feature Methods ---

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.roomLogic.rtcConnectionManager.toggleAudio(!this.isMuted);
    this.muteBtn.innerHTML = this.isMuted ? '🔇' : '🎤';

    // Toggle the visibility of the mute icon on our own card
    const localMicElement = document.getElementById(`mic-${this.myId}`);
    if(localMicElement) {
        const muteIcon = localMicElement.querySelector('.user-mute-icon');
        if(muteIcon) muteIcon.classList.toggle('visible', this.isMuted);
    }
  }

  exitRoom() {
    if (confirm("هل أنت متأكد أنك تريد مغادرة الغرفة؟")) {
        window.location.href = 'lobby.html';
    }
  }

  populateGiftModal() {
      if (!this.giftModalOptions) return;
      this.giftModalOptions.innerHTML = ''; // Clear previous items

      this.giftsData.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'gift-item';
          itemDiv.dataset.itemId = item.id;

          if (item.type === 'gift') {
              itemDiv.innerHTML = `<span class="gift-icon">${item.icon}</span>`;
          } else {
              itemDiv.innerHTML = `<div class="gift-image" style="background-image: url('${item.image}')"></div>`;
          }
          itemDiv.innerHTML += `<p class="gift-name">${item.name}</p>`;

          this.giftModalOptions.appendChild(itemDiv);
      });
  }

  openGiftModal() {
    this.populateGiftModal();
    if (this.giftModal) this.giftModal.style.display = 'flex';
  }

  closeGiftModal() {
    if (this.giftModal) this.giftModal.style.display = 'none';
  }

  openMusicModal() {
    if (this.musicModal) this.musicModal.style.display = 'flex';
  }

  closeMusicModal() {
    if (this.musicModal) this.musicModal.style.display = 'none';
  }

  handleGiftSelection(item) {
    this.closeGiftModal();
    if (item.type === 'gift') {
        this.showFloatingGiftAnimation(item.icon);
    } else if (item.type === 'background') {
        document.body.style.backgroundImage = `url(${item.image})`;
    }
  }

  showFloatingGiftAnimation(emoji) {
    for (let i = 0; i < 10; i++) {
        const gift = document.createElement('div');
        gift.innerText = emoji;
        Object.assign(gift.style, {
            position: 'fixed', left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 50 + 80}vh`, fontSize: `${Math.random() * 20 + 20}px`,
            opacity: 1, transition: 'top 3s ease-out, opacity 3s ease-out',
            zIndex: '10001', pointerEvents: 'none'
        });
        document.body.appendChild(gift);
        setTimeout(() => { gift.style.top = '-100px'; gift.style.opacity = 0; }, 100);
        setTimeout(() => gift.remove(), 3100);
    }
  }

  changeBackground() {
      document.body.style.backgroundImage = `url(${this.backgrounds[this.currentBgIndex]})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      this.currentBgIndex = (this.currentBgIndex + 1) % this.backgrounds.length;
  }

  // --- WebRTC UI Methods ---

  addLocalUser() {
    // For now, the name is hardcoded. In a real app, this would come from the user object.
    const name = `You (${this.myId.substring(0, 5)}...)`;
    const micDiv = this.createMicElement(this.myId, name, this.isMuted);
    this.micsContainer.appendChild(micDiv);
  }

  addRemoteUser(stream, userId) {
    if (document.getElementById(`mic-${userId}`)) return;
    // In a real app, you'd get the user's name via the signaling server.
    const name = `User (${userId.substring(0, 5)}...)`;
    // Remote users are assumed to be unmuted initially from our perspective.
    const micDiv = this.createMicElement(userId, name, false);
    this.micsContainer.appendChild(micDiv);

    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    // The audio element is not visible, it just plays. It can be appended to the card
    // or to a hidden container. Appending to the card is fine for now.
    micDiv.appendChild(audio);
  }

  createMicElement(userId, name, isMuted = false) {
      const micDiv = document.createElement('div');
      micDiv.id = `mic-${userId}`;
      micDiv.className = 'mic';

      const initial = name ? name.charAt(0).toUpperCase() : 'U';

      micDiv.innerHTML = `
        <div class="user-avatar-container">
          <div class="user-avatar-circle">
            <span>${initial}</span>
          </div>
          <div class="user-mute-icon ${isMuted ? 'visible' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM18.5 12a1.5 1.5 0 0 1-1.5 1.5h-.5a5.5 5.5 0 0 1-11 0h-.5a1.5 1.5 0 0 1 0-3h.5a5.5 5.5 0 0 1 11 0h.5a1.5 1.5 0 0 1 1.5 1.5z"/>
            </svg>
          </div>
        </div>
        <p class="user-name">${name}</p>
      `;
      // Note: The SVG is a generic mic icon, not a slash.
      // The visibility of the whole element indicates mute status.

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
