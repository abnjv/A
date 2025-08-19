// ===================================================================================
//
//                        Application Configuration
//
// ===================================================================================

const AppConfig = {
  defaultRoomName: 'General',
  soundEffects: {
    applause: 'assets/sounds/applause.mp3',
    laugh: 'assets/sounds/laugh.mp3',
    drum: 'assets/sounds/drum.mp3',
    gift: 'assets/sounds/gift.mp3',
    join: 'assets/sounds/join.mp3',
    leave: 'assets/sounds/leave.mp3'
  },
  apiEndpoints: {
    login: '/api/auth/login',
    rooms: '/api/rooms'
  },
  // Add other configuration settings here
};

// To make it usable in a browser environment without modules
window.AppConfig = AppConfig;
