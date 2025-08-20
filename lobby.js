document.addEventListener('DOMContentLoaded', () => {

  // --- Dashboard Popup ---
  const userAvatar = document.getElementById('user-avatar');
  const dashboardPopup = document.getElementById('dashboard-popup');

  userAvatar.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevents the window click listener from firing immediately
    dashboardPopup.classList.toggle('show');
  });

  // Hide dashboard if clicking outside
  window.addEventListener('click', () => {
    if (dashboardPopup.classList.contains('show')) {
      dashboardPopup.classList.remove('show');
    }
  });

  // --- Mute Button Micro-interaction ---
  const muteBtn = document.getElementById('mute-btn');
  const clickSound = new Audio('......mp3'); // Using the existing sound file

  muteBtn.addEventListener('click', (e) => {
    // 1. Toggle class for color change
    muteBtn.classList.toggle('muted');

    // 2. Change icon
    const icon = muteBtn.querySelector('i');
    if (muteBtn.classList.contains('muted')) {
      icon.classList.remove('fa-microphone');
      icon.classList.add('fa-microphone-slash');
    } else {
      icon.classList.remove('fa-microphone-slash');
      icon.classList.add('fa-microphone');
    }

    // 3. Play click sound
    clickSound.currentTime = 0; // Rewind to start
    clickSound.play();

    // 4. Create ripple effect
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = muteBtn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    muteBtn.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });

  // --- Volume Slider Micro-interaction ---
  const volumeSlider = document.getElementById('volume-slider');
  const volumePercentage = document.getElementById('volume-percentage');
  let timeoutId;

  volumeSlider.addEventListener('input', () => {
    // Update percentage text
    volumePercentage.textContent = `${volumeSlider.value}%`;

    // Show percentage
    volumePercentage.classList.add('show');

    // Clear previous timeout
    clearTimeout(timeoutId);

    // Set a timeout to hide the percentage after a delay
    timeoutId = setTimeout(() => {
      volumePercentage.classList.remove('show');
    }, 1500); // Hide after 1.5 seconds of no activity
  });

});
