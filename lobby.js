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

  // --- Room Card Generation ---
  const roomsData = [
    {
      name: 'غرفة دردشة عامة',
      topic: 'موضوع: نقاشات عامة',
      users: 15,
      isRoom: true, // Flag to indicate it's a room
      img: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'
    },
    {
      name: 'الرسائل الخاصة',
      topic: 'افتح رسائلك ومحادثاتك الخاصة',
      users: 'الوصول', // Changed users to a string
      isRoom: false, // Flag to indicate it's not a room
      img: 'https://images.unsplash.com/photo-1584441433936-b95b3b1a9d74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'جلسة ألعاب',
      topic: 'موضوع: League of Legends',
      users: 23,
      img: 'https://images.unsplash.com/photo-1507525428034-b723a996f3d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'استراحة قصيرة',
      topic: 'موضوع: موسيقى هادئة',
      users: 5,
      img: 'https://images.unsplash.com/photo-1554034483-263cf23a261d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    }
  ];

  const roomListContainer = document.getElementById('room-list-container');

  function createRoomCards() {
    if (!roomListContainer) return;
    roomListContainer.innerHTML = ''; // Clear any existing content
    roomsData.forEach(room => {
      const card = document.createElement('div');
      card.className = 'room-card';
      card.style.backgroundImage = `url('${room.img}')`;
      if (room.isRoom) {
        card.onclick = () => {
            // Store the selected room name and navigate
            localStorage.setItem('room', room.name);
            window.location.href = 'room.html';
        };
      } else {
        card.onclick = () => {
            alert('هذه الميزة قيد التطوير. سيتم تزويدي بالكود الخاص بها قريباً.');
        };
      }

      const joinButtonText = room.isRoom ? 'انضم' : 'افتح';
      const userCountHTML = room.isRoom ? `<i class="fas fa-user"></i> ${room.users}` : `<i class="fas fa-envelope"></i>`;

      const cardContent = `
        <div class="room-info">
          <h3>${room.name}</h3>
          <p class="room-topic">${room.topic}</p>
        </div>
        <div class="room-meta">
          <span class="user-count">
            ${userCountHTML}
          </span>
          <button class="join-btn">${joinButtonText}</button>
        </div>
      `;
      card.innerHTML = cardContent;
      roomListContainer.appendChild(card);
    });
  }

  createRoomCards(); // Call the function to build the room list

});
