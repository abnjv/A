/**
 * room-logic.js
 *
 * Handles the core logic for room interactions.
 */

/**
 * Adds the current user to a new room and updates the UI.
 * @param {string} roomName - The name of the room to join.
 */
function joinRoom(roomName) {
  const room = getAvailableRooms().find(r => r.name === roomName);
  if (room) {
    console.log(`Joining room: ${roomName}`);
    // Set the new room as the current room
    setCurrentRoom(room.name, room.users);

    // Add the current user to the room
    const user = getCurrentUser();
    addUserToCurrentRoom(user);

    // Update the UI (these functions will be in main.js)
    updateRoomUI();
    updateOnlineUsersUI();
  } else {
    console.error(`Room "${roomName}" not found.`);
  }
}

/**
 * Toggles the mute state of the current user and updates the UI.
 */
function toggleMute() {
  const isMuted = toggleMuteState();

  // Update the UI (this function will be in main.js)
  updateMuteButton(isMuted);
}

/**
 * Plays a sound effect.
 * @param {string} soundName - The name of the sound to play (e.g., 'confetti', 'laugh').
 */
function playSound(soundName) {
  console.log(`Playing sound: ${soundName}`);
  const audio = new Audio(`assets/sounds/${soundName}.mp3`);
  audio.play().catch(error => {
    console.error(`Could not play sound "${soundName}":`, error);
  });
}
