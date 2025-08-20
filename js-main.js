/**
 * main.js
 *
 * Orchestrates the entire application.
 * - Initializes the app state.
 * - Renders UI components.
 * - Sets up event listeners.
 */

// --- DOMContentLoaded Listener ---
document.addEventListener('DOMContentLoaded', () => {
  init();
});

// --- UI Element Selectors ---
const selectors = {
  avatarField: '.avatar-field',
  onlineUsersList: '.online-users-list',
  muteButton: '.control-button[title="Mute"]',
  effectsButtons: '.effect-button',
  roomsListContainer: '.grid-area-achievements', // Repurposing achievements list for rooms
  voiceFilterButton: '.control-button[title="Voice Filters"]',
  voiceFilterMenu: '#voice-filter-menu',
  mainArea: '.grid-area-main',
};

// --- INITIALIZATION ---
function init() {
  console.log('Application Initializing...');

  // 1. Load mock data into state
  setAvailableRooms(mockRooms);

  // 2. Set an initial room (e.g., the first mock room)
  const initialRoom = getAvailableRooms()[0];
  if (initialRoom) {
    joinRoom(initialRoom.name);
  } else {
    // If no mock rooms, set a default state
    const user = getCurrentUser();
    setCurrentRoom("General Room", [user]);
    updateRoomUI();
    updateOnlineUsersUI();
  }

  // 3. Render the list of available rooms
  renderAvailableRooms();

  // 4. Set up event listeners
  setupEventListeners();

  // 5. Start UI animations from old concept.js
  setInterval(simulateActiveSpeaker, 2000);

  console.log('Application Initialized!');
}

// --- UI RENDERING FUNCTIONS ---

/**
 * Renders the list of available rooms in the sidebar.
 */
function renderAvailableRooms() {
  const roomsContainer = document.querySelector(selectors.roomsListContainer);
  const rooms = getAvailableRooms();

  roomsContainer.innerHTML = `
    <h4>الغرف المتاحة</h4>
    <ul class="achievements-list room-list">
      ${rooms.map(room => `<li data-room-name="${room.name}">${room.name} (${room.users.length})</li>`).join('')}
    </ul>
  `;
}

/**
 * Updates the main avatar display based on the current room's users.
 */
function updateRoomUI() {
  const avatarField = document.querySelector(selectors.avatarField);
  const room = getCurrentRoom();

  avatarField.innerHTML = room.users.map(user => `
    <div class="user-avatar-container">
      <img src="${user.avatar}" alt="User Avatar" class="user-avatar">
      <div class="username">${user.username}</div>
      <div class="reaction-bar">
        <button onclick="showLargeReaction('👍')">👍</button>
        <button onclick="showLargeReaction('❤️')">❤️</button>
        <button onclick="showLargeReaction('👎')">👎</button>
      </div>
    </div>
  `).join('');
}

/**
 * Updates the list of online users in the sidebar.
 */
function updateOnlineUsersUI() {
  const onlineUsersList = document.querySelector(selectors.onlineUsersList);
  const room = getCurrentRoom();

  onlineUsersList.innerHTML = room.users.map(user => `
    <li>
      <img src="${user.avatar}" alt="Avatar">
      <span>${user.username}</span>
    </li>
  `).join('');
}

/**
 * Updates the mute button's appearance.
 * @param {boolean} isMuted - The current mute state.
 */
function updateMuteButton(isMuted) {
  const muteButton = document.querySelector(selectors.muteButton);
  muteButton.textContent = isMuted ? '🔇' : '🎤';
  muteButton.title = isMuted ? 'Unmute' : 'Mute';
}


// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  const muteButton = document.querySelector(selectors.muteButton);
  const effectsButtons = document.querySelectorAll(selectors.effectsButtons);
  const roomsContainer = document.querySelector(selectors.roomsListContainer);
  const voiceFilterButton = document.querySelector(selectors.voiceFilterButton);

  // Mute button
  if (muteButton) {
    muteButton.addEventListener('click', () => {
      toggleMute();
    });
  }

  // Sound effect buttons
  effectsButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Assumes onclick="playEffect('confetti')" is replaced with data-effect="confetti"
      const effect = button.getAttribute('data-effect');
      if(effect) playSound(effect);
    });
  });

  // Room list (using event delegation)
  if (roomsContainer) {
    roomsContainer.addEventListener('click', (event) => {
      if (event.target.tagName === 'LI') {
        const roomName = event.target.getAttribute('data-room-name');
        if (roomName) {
          joinRoom(roomName);
        }
      }
    });
  }

  // Voice filter menu
  if (voiceFilterButton) {
    voiceFilterButton.addEventListener('click', toggleVoiceFilterMenu);
  }
}

// --- MIGRATED FUNCTIONS from concept.js ---

function simulateActiveSpeaker() {
  const avatars = document.querySelectorAll('.user-avatar-container');
  if (avatars.length === 0) return;
  document.querySelectorAll('.active-speaker').forEach(el => el.classList.remove('active-speaker'));
  const randomIndex = Math.floor(Math.random() * avatars.length);
  avatars[randomIndex].classList.add('active-speaker');
}

function toggleVoiceFilterMenu() {
  const menu = document.querySelector(selectors.voiceFilterMenu);
  if (menu) {
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }
}

function showLargeReaction(emoji) {
  const reaction = document.createElement('div');
  reaction.className = 'large-reaction';
  reaction.innerText = emoji;
  const mainArea = document.querySelector(selectors.mainArea);
  if (mainArea) {
    mainArea.appendChild(reaction);
    setTimeout(() => reaction.remove(), 1500);
  }
}
