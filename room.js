class Room {
  constructor() {
    // --- Data ---
    this.backgrounds = [
        { name: 'Default', gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
        { name: 'Sunset', gradient: 'linear-gradient(135deg, #FF6B6B, #F8CD47)' },
        { name: 'Ocean', gradient: 'linear-gradient(135deg, #00C6FF, #0072FF)' },
        { name: 'Forest', gradient: 'linear-gradient(135deg, #134E5E, #71B280)' },
        { name: 'Galaxy', gradient: 'linear-gradient(135deg, #141E30, #243B55)' },
        { name: 'Pinkish', gradient: 'linear-gradient(135deg, #de6262, #ffb88c)' },
        { name: 'Night Sky', gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)' },
        { name: 'Warm', gradient: 'linear-gradient(135deg, #F08272, #e75c61)' },
    ];
    this.isMuted = false;
    this.isMusicPlaying = false; // Add state for music

    // --- WebRTC Logic ---
    this.roomLogic = new RoomLogic('ws://localhost:8080');
    this.myId = null;
    this.remoteUsers = new Map(); // To keep track of remote users and their cards

    // --- UI Element References ---
    this.mainBackground = document.getElementById('mainBackground');
    this.micToggleButton = document.getElementById('micToggleButton');
    this.micIcon = document.getElementById('micIcon');
    this.giftButton = document.getElementById('giftButton');
    this.settingsButton = document.getElementById('settingsButton');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');
    this.chatMessagesContainer = document.getElementById('chat-messages');

    // Modals
    this.settingsModal = document.getElementById('settingsModal');
    this.closeSettingsButton = document.getElementById('closeSettingsButton');
    this.giftModal = document.getElementById('giftModal');
    this.closeGiftButton = document.getElementById('closeGiftButton');

    // Modal Content
    this.copyLinkButton = document.getElementById('copyLinkButton');
    this.musicButton = document.getElementById('musicButton');
    this.backgroundOptionsContainer = document.getElementById('backgroundOptions');
    this.giftOptions = document.querySelectorAll('.gift-option');

    // Participant Containers
    this.activeSpeakerContainer = document.querySelector('.relative.flex.flex-col.items-center.mb-4');
    this.otherParticipantsContainer = document.querySelector('.grid.grid-cols-3');
  }

  async init() {
    this.setupEventListeners();
    this.populateBackgroundOptions();
    this.changeBackground(this.backgrounds[0].gradient); // Set default background

    this.otherParticipantsContainer.innerHTML = ''; // Clear placeholder participants
    this.activeSpeakerContainer.innerHTML = ''; // Clear placeholder active speaker

    // Initialize WebRTC
    this.roomLogic.rtcConnectionManager.setOnTrack((stream, userId) => this.addRemoteUser(stream, userId));
    try {
      this.myId = await this.roomLogic.init();
      console.log('Room initialized. My ID:', this.myId);
      this.addLocalUser();
    } catch (error) {
      console.error('Initialization failed:', error);
      this.addMessageToChat("فشل الاتصال بالخادم.");
    }
  }

  setupEventListeners() {
    this.micToggleButton.addEventListener('click', () => this.toggleMute());
    this.giftButton.addEventListener('click', () => this.openGiftModal());
    this.settingsButton.addEventListener('click', () => this.openSettingsModal());
    this.closeSettingsButton.addEventListener('click', () => this.closeSettingsModal());
    this.closeGiftButton.addEventListener('click', () => this.closeGiftModal());
    this.copyLinkButton.addEventListener('click', () => this.copyInviteLink());
    this.musicButton.addEventListener('click', () => this.toggleMusic());
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
    });
    this.backgroundOptionsContainer.addEventListener('click', (e) => {
        const bgOption = e.target.closest('.bg-option');
        if (bgOption) {
            this.changeBackground(bgOption.style.background);
            this.closeSettingsModal();
        }
    });
    this.giftOptions.forEach(option => {
        option.addEventListener('click', () => {
            const giftName = option.getAttribute('data-gift');
            this.handleGiftSelection(giftName);
        });
    });
  }

  // --- Feature Methods ---

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.roomLogic.rtcConnectionManager.toggleAudio(!this.isMuted);
    this.micToggleButton.classList.toggle('bg-green-500', !this.isMuted);
    this.micToggleButton.classList.toggle('bg-red-500', this.isMuted);
    this.micIcon.classList.toggle('fa-microphone', !this.isMuted);
    this.micIcon.classList.toggle('fa-microphone-slash', this.isMuted);
    this.addMessageToChat(this.isMuted ? "تم كتم الميكروفون." : "تم فتح الميكروفون.");
  }

  openGiftModal() { this.giftModal.style.display = 'block'; }
  closeGiftModal() { this.giftModal.style.display = 'none'; }
  openSettingsModal() { this.settingsModal.style.display = 'block'; }
  closeSettingsModal() { this.settingsModal.style.display = 'none'; }

  handleGiftSelection(giftName) {
    const giftMap = { heart: 'قلب ❤️', star: 'نجمة ⭐️', crown: 'تاج 👑', fire: 'نار 🔥', diamond: 'ماسة 💎', rose: 'وردة 🌹' };
    this.addMessageToChat(`تم إرسال هدية: ${giftMap[giftName] || giftName}`);
    if (giftName === 'heart') {
        this.triggerGiftAnimation('heart');
    }
    this.closeGiftModal();
  }

  triggerGiftAnimation() {
      const heart = document.createElement('i');
      heart.className = 'fas fa-heart gift-effect';
      const mainContainer = document.querySelector('.relative.w-full.max-w-sm');
      mainContainer.appendChild(heart);
      heart.addEventListener('animationend', () => heart.remove());
  }

  sendMessage() {
      const message = this.chatInput.value.trim();
      if (message !== "") {
          this.addMessageToChat(`You: ${message}`);
          this.chatInput.value = "";
          // In a real app, send this message over the WebRTC data channel
          // this.roomLogic.sendDataChannelMessage({ type: 'chat', content: message });
      }
  }

  addMessageToChat(text) {
      const messageElement = document.createElement('div');
      messageElement.textContent = text;
      messageElement.className = "bg-gray-700 text-sm p-2 rounded-lg text-white text-right break-words";
      this.chatMessagesContainer.prepend(messageElement);
  }

  copyInviteLink() {
      const inviteLinkInput = document.getElementById('inviteLinkInput');
      navigator.clipboard.writeText(inviteLinkInput.value);
      const copyMessage = document.getElementById('copyMessage');
      copyMessage.classList.remove('hidden');
      setTimeout(() => copyMessage.classList.add('hidden'), 2000);
  }

  toggleMusic() {
      this.isMusicPlaying = !this.isMusicPlaying;
      if (this.isMusicPlaying) {
          this.musicButton.innerHTML = '<i class="fas fa-pause mr-2"></i> إيقاف الأغاني';
          this.musicButton.classList.replace('bg-blue-500', 'bg-red-500');
          this.addMessageToChat("تم تشغيل الأغاني.");
      } else {
          this.musicButton.innerHTML = '<i class="fas fa-music mr-2"></i> تشغيل الأغاني';
          this.musicButton.classList.replace('bg-red-500', 'bg-blue-500');
          this.addMessageToChat("تم إيقاف الأغاني.");
      }
  }

  populateBackgroundOptions() {
      this.backgrounds.forEach(bg => {
          const option = document.createElement('div');
          option.className = 'bg-option';
          option.style.background = bg.gradient;
          option.title = bg.name;
          this.backgroundOptionsContainer.appendChild(option);
      });
  }

  changeBackground(gradient) {
      this.mainBackground.style.background = gradient;
  }

  // --- WebRTC UI Methods ---

  addLocalUser() {
    const name = `You (${this.myId.substring(0, 4)})`;
    const card = this.createParticipantCard(this.myId, name, true);
    this.activeSpeakerContainer.innerHTML = '';
    this.activeSpeakerContainer.appendChild(card);
  }

  addRemoteUser(stream, userId) {
    if (document.getElementById(`participant-${userId}`)) return;
    const name = `User (${userId.substring(0, 4)})`;
    const card = this.createParticipantCard(userId, name, false);
    this.otherParticipantsContainer.appendChild(card);
    this.remoteUsers.set(userId, card);

    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    card.appendChild(audio);
  }

  createParticipantCard(userId, name, isLocal) {
    const cardContainer = document.createElement('div');
    cardContainer.id = `participant-${userId}`;

    if (isLocal) {
        cardContainer.className = 'flex flex-col items-center'; // It's one element, not a grid item
        cardContainer.innerHTML = `
            <div class="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-green-500 avatar-ring-pulse">
                <img src="https://placehold.co/128x128/34d399/ffffff?text=${name[0]}" alt="${name}" class="w-full h-full object-cover">
            </div>
            <div class="mt-1 text-sm font-semibold">${name}</div>`;
    } else {
        cardContainer.className = 'flex flex-col items-center';
        cardContainer.innerHTML = `
            <div class="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-400">
                <img src="https://placehold.co/80x80/20b2aa/ffffff?text=${name[0]}" alt="${name}" class="w-full h-full object-cover">
            </div>
            <div class="mt-1 text-xs">${name}</div>`;
    }
    return cardContainer;
  }
}

// --- App Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  const room = new Room();
  room.init();
});
