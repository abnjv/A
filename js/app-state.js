/**
 * app-state.js
 *
 * Manages the global state of the application.
 */

const appState = {
  currentUser: {
    username: "ياسر",
    avatar: "https://avatar.iran.liara.run/public/boy",
    isMuted: false,
  },
  currentRoom: {
    name: "الغرفة العامة",
    users: [],
  },
  availableRooms: [],
};

// --- GETTERS ---

function getCurrentUser() {
  return appState.currentUser;
}

function getCurrentRoom() {
  return appState.currentRoom;
}

function getAvailableRooms() {
  return appState.availableRooms;
}

// --- SETTERS ---

function setCurrentUser(username, avatar) {
  appState.currentUser.username = username;
  appState.currentUser.avatar = avatar;
}

function setCurrentRoom(roomName, users = []) {
  appState.currentRoom.name = roomName;
  appState.currentRoom.users = users;
}

function setAvailableRooms(rooms) {
  appState.availableRooms = rooms;
}

function addUserToCurrentRoom(user) {
  if (!appState.currentRoom.users.some(u => u.username === user.username)) {
    appState.currentRoom.users.push(user);
  }
}

// --- MUTATORS ---

function toggleMuteState() {
  appState.currentUser.isMuted = !appState.currentUser.isMuted;
  console.log(`User ${appState.currentUser.username} mute state is now: ${appState.currentUser.isMuted}`);
  // UI update logic will be handled separately
  return appState.currentUser.isMuted;
}
