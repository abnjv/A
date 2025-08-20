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
    this.giftBtn = document.querySelector('#controls-toolbar button:nth-child(3)');
    this.exitBtn = document.getElementById('exit-btn');
    this.muteBtn = document.querySelector('#controls-toolbar button:nth-child(1)');
    this.changeBgBtn = document.querySelector('#controls-toolbar button:nth-child(5)');

    // Gift Modal Elements
    this.giftModal = document.getElementById('gift-modal');
    this.giftModalOptions = document.getElementById('gift-modal-options');
    this.closeGiftModalBtn = document.getElementById('gift-modal-close-btn');

    // Cosmetic Elements
    this.clockTime = document.getElementById('clock-time');

    if (this.muteBtn) {
        this.muteBtn.innerHTML = '🎤';
        this.muteBtn.title = 'Mute/Unmute';
    }
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
    if (this.closeGiftModalBtn) this.closeGiftModalBtn.addEventListener('click', () => this.closeGiftModal());
    if (this.changeBgBtn) this.changeBgBtn.addEventListener('click', () => this.changeBackground());

    // Use event delegation for dynamically created gift items
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
    const micDiv = this.createMicElement(this.myId, true);
    micDiv.innerText = `🎤 You`;
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
