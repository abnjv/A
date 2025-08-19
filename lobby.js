document.addEventListener('DOMContentLoaded', () => {

  // --- Dashboard Popup ---
  const userAvatar = document.getElementById('user-avatar');
  const dashboardPopup = document.getElementById('dashboard-popup');

  if (userAvatar) {
    userAvatar.addEventListener('click', (event) => {
      event.stopPropagation();
      dashboardPopup.classList.toggle('show');
    });
  }

  // Hide dashboard if clicking outside
  window.addEventListener('click', () => {
    if (dashboardPopup && dashboardPopup.classList.contains('show')) {
      dashboardPopup.classList.remove('show');
    }
  });

  // --- Join Room Logic ---
  const joinButtons = document.querySelectorAll('.join-btn');
  joinButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      // For this example, we'll use a simple, hardcoded room ID.
      // In a real app, this would come from the room card's data attribute.
      const roomId = `room${index + 1}`;

      // Store the room ID so the room page knows which one to join.
      localStorage.setItem('selectedRoomId', roomId);

      // Redirect to the room page.
      window.location.href = 'room.html';
    });
  });

  // --- Mute Button (Placeholder Interaction) ---
  // This button doesn't control a real call in the lobby,
  // so it's just for UI demonstration.
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      muteBtn.classList.toggle('muted');
      const icon = muteBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-microphone');
        icon.classList.toggle('fa-microphone-slash');
      }
    });
  }

  // --- Volume Slider (Placeholder Interaction) ---
  const volumeSlider = document.getElementById('volume-slider');
  const volumePercentage = document.getElementById('volume-percentage');
  if (volumeSlider && volumePercentage) {
    let timeoutId;
    volumeSlider.addEventListener('input', () => {
      volumePercentage.textContent = `${volumeSlider.value}%`;
      volumePercentage.classList.add('show');
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        volumePercentage.classList.remove('show');
      }, 1500);
    });
  }
});
