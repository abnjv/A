// Basic setup for the futuristic concept
document.addEventListener('DOMContentLoaded', () => {
  console.log('Futuristic Chat Room Concept Initialized!');

  // Simulate active speaker
  setInterval(simulateActiveSpeaker, 2000);
});

function simulateActiveSpeaker() {
  const avatars = document.querySelectorAll('.user-avatar-container');
  if (avatars.length === 0) return;

  // Remove active class from all avatars
  avatars.forEach(avatar => avatar.classList.remove('active-speaker'));

  // Add active class to a random avatar
  const randomIndex = Math.floor(Math.random() * avatars.length);
  avatars[randomIndex].classList.add('active-speaker');
}

function playEffect(effect) {
  console.log(`Playing effect: ${effect}`);
  // In a real implementation, this would trigger a visual/audio effect.
  // For this concept, we can add a simple visual confirmation.
  const effectButton = document.querySelector(`.effect-button[onclick="playEffect('${effect}')"]`);
  if (effectButton) {
    effectButton.style.transform = 'scale(1.2)';
    setTimeout(() => {
      effectButton.style.transform = 'scale(1)';
    }, 200);
  }
}

function toggleVoiceFilterMenu() {
  const menu = document.getElementById('voice-filter-menu');
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

function showLargeReaction(emoji) {
  const reaction = document.createElement('div');
  reaction.className = 'large-reaction';
  reaction.innerText = emoji;

  const mainArea = document.querySelector('.grid-area-main');
  mainArea.appendChild(reaction);

  setTimeout(() => {
    reaction.remove();
  }, 1500); // Match animation duration
}
