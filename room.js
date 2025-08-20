class Room {
  constructor() {
    // --- Data ---
    this.backgrounds = [
        { name: 'Default', gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
        { name: 'Sunset', gradient: 'linear-gradient(135deg, #FF6B6B, #F8CD47)' },
        { name: 'Ocean', gradient: 'linear-gradient(135deg, #00C6FF, #0072FF)' },
        { name: 'Forest', gradient: 'linear-gradient(135deg, #134E5E, #71B280)' },
    ];

    // --- WebRTC Logic ---
    this.roomLogic = new RoomLogic('ws://localhost:8080');
    this.myId = null;
    this.isMuted = false;

    // --- UI Elements ---
    this.mainBackground = document.getElementById('mainBackground');

    // Modals
    this.settingsModal = document.getElementById('settingsModal');

    // Buttons
    this.micToggleButton = document.getElementById('micToggleButton');
    this.micIcon = document.getElementById('micIcon');
    this.giftButton = document.getElementById('giftButton');
    this.settingsButton = document.getElementById('settingsButton');
    this.closeSettingsButton = document.getElementById('closeSettingsButton');
    this.copyLinkButton = document.getElementById('copyLinkButton');
    this.musicButton = document.getElementById('musicButton');

    // Containers
    this.otherParticipantsContainer = document.querySelector('.grid.grid-cols-3');
    this.activeSpeakerContainer = document.querySelector('.relative.flex.flex-col.items-center.mb-8');
    this.backgroundOptionsContainer = document.getElementById('backgroundOptions');

    // Chat
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');
    this.chatMessagesContainer = document.getElementById('chat-messages');
  }

  async init() {
    // Connect WebRTC logic
    this.roomLogic.rtcConnectionManager.setOnTrack((stream, userId) => this.addRemoteUser(stream, userId));
    try {
      this.myId = await this.roomLogic.init();
      console.log('Room initialized. My ID:', this.myId);
    } catch (error) {
      console.error('Initialization failed:', error);
      this.addMessageToChat("فشل الاتصال بالخادم.");
    }

    // Setup initial state and listeners
    this.setupEventListeners();
    this.otherParticipantsContainer.innerHTML = ''; // Clear placeholder participants
    this.addLocalUser();
    this.populateBackgroundOptions();
    this.changeBackground(this.backgrounds[0].gradient); // Set default background
  }

  setupEventListeners() {
    // Main controls
    this.micToggleButton.addEventListener('click', () => this.toggleMute());
    this.giftButton.addEventListener('click', () => this.sendGift());
    this.settingsButton.addEventListener('click', () => this.openSettingsModal());

    // Settings Modal
    this.closeSettingsButton.addEventListener('click', () => this.closeSettingsModal());
    this.copyLinkButton.addEventListener('click', () => this.copyInviteLink());
    this.musicButton.addEventListener('click', () => this.toggleMusic());

    // Chat
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
    });

    // Background Options (Event Delegation)
    this.backgroundOptionsContainer.addEventListener('click', (e) => {
        const bgOption = e.target.closest('.bg-option');
        if (bgOption) {
            this.changeBackground(bgOption.style.background);
            this.closeSettingsModal();
        }
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

  sendGift() {
    // This is a placeholder for the more complex gift modal logic from before.
    // For now, it just shows a chat message as per the new file's script.
    this.addMessageToChat("تم إرسال هدية!");
    // We can re-integrate the gift modal and animation here later if needed.
  }

  sendMessage() {
      const message = this.chatInput.value.trim();
      if (message !== "") {
          this.addMessageToChat(message);
          this.chatInput.value = "";
          // Here you would send the message over a WebRTC data channel.
      }
  }

  addMessageToChat(text) {
      const messageElement = document.createElement('div');
      messageElement.textContent = text;
      messageElement.className = "bg-gray-700 text-sm p-2 rounded-lg text-white text-right break-words";
      this.chatMessagesContainer.prepend(messageElement); // Prepend for new messages on top
  }

  openSettingsModal() {
    this.settingsModal.style.display = 'block';
  }

  closeSettingsModal() {
    this.settingsModal.style.display = 'none';
  }

  copyInviteLink() {
      const inviteLinkInput = document.getElementById('inviteLinkInput');
      navigator.clipboard.writeText(inviteLinkInput.value).then(() => {
          const copyMessage = document.getElementById('copyMessage');
          copyMessage.classList.remove('hidden');
          setTimeout(() => copyMessage.classList.add('hidden'), 2000);
      });
  }

  toggleMusic() {
      // Placeholder for actual music logic
      this.addMessageToChat("تم تبديل حالة الموسيقى.");
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
    // For now, the local user is always the "active speaker"
    const name = `You (${this.myId.substring(0, 4)})`;
    const card = this.createParticipantCard(this.myId, name, true);
    this.activeSpeakerContainer.innerHTML = ''; // Clear placeholder
    this.activeSpeakerContainer.appendChild(card);
  }

  addRemoteUser(stream, userId) {
    if (document.getElementById(`participant-${userId}`)) return;
    const name = `User (${userId.substring(0, 4)})`;
    const card = this.createParticipantCard(userId, name, false);
    this.otherParticipantsContainer.appendChild(card);

    const audio = document.createElement('audio');
    audio.srcObject = stream;
    audio.autoplay = true;
    card.appendChild(audio);
  }

  createParticipantCard(userId, name, isLocal) {
    const card = document.createElement('div');
    card.id = `participant-${userId}`;

    // This logic determines if the card is the large "active speaker" one
    // or a smaller one in the grid.
    if (isLocal) { // Simplified: local user is always active speaker for now
        card.className = 'relative flex flex-col items-center';
        card.innerHTML = `
            <div class="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-green-500 avatar-ring-pulse">
                <img src="https://placehold.co/128x128/34d399/ffffff?text=${name[0]}" alt="${name}" class="w-full h-full object-cover">
            </div>
            <div class="mt-2 text-lg font-semibold">${name}</div>
        `;
    } else {
        card.className = 'flex flex-col items-center';
        card.innerHTML = `
            <div class="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-400">
                <img src="https://placehold.co/80x80/20b2aa/ffffff?text=${name[0]}" alt="${name}" class="w-full h-full object-cover">
            </div>
            <div class="mt-1 text-xs md:text-sm">${name}</div>
        `;
    }
    return card;
  }
}

// --- App Initialization ---
window.addEventListener('DOMContentLoaded', () => {
  // We need to load the core logic scripts before this can run
  // This is handled by the script tags in room.html
  const room = new Room();
  room.init();
});
