// ===================================================================================
//
//                        AirChat Room Logic
//
// ===================================================================================

/**
 * Initializes the room functionality when the DOM is fully loaded.
 */
function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  if (menu.style.display === 'none') {
    menu.style.display = 'block';
  } else {
    menu.style.display = 'none';
  }
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('#user-profile, #user-profile *')) {
    const dropdowns = document.getElementsByClassName("dropdown-menu");
    for (let i = 0; i < dropdowns.length; i++) {
      let openDropdown = dropdowns[i];
      if (openDropdown.style.display !== 'none') {
        openDropdown.style.display = 'none';
      }
    }
  }
}


function initRoom() {
  // Set username from localStorage
  const username = localStorage.getItem('username') || 'ضيف';
  document.getElementById('username-display').innerText = username;
  document.getElementById('current-username-display').innerText = username;

  // Initialize various features
  updateClock();
  setInterval(updateClock, 1000);

  updateDateTime();
  setInterval(updateDateTime, 1000);

  updateStatus();
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  // Set up the welcome message/popup
  showWelcomePopup();
  playWelcomeSound();

  // Set up user-related displays
  const userBadge = document.getElementById('user-badge');
  if (userBadge) {
      userBadge.innerText = displayUserWithBadge('vip');
  }

  // Add admin crown to first mic user
  const mics = document.querySelectorAll('.mic');
  if (mics.length > 0) {
      mics[0].classList.add('admin');
  }

  // Add online/offline status indicators to mics
  mics.forEach((mic, i) => {
    const status = document.createElement('span');
    status.className = 'user-status ' + (i % 2 === 0 ? 'online' : 'offline');
    mic.appendChild(status);
  });

  // Setup background switcher
  initBackgroundSwitcher();

  // Populate online users and start simulation
  populateOnlineUsers();
  setInterval(simulateActiveSpeaker, 2000);
}

function populateOnlineUsers() {
  const users = [
    { name: 'أحمد', avatar: 'https://i.pravatar.cc/32?u=1' },
    { name: 'ليلى', avatar: 'https://i.pravatar.cc/32?u=2' },
    { name: 'سارة', avatar: 'https://i.pravatar.cc/32?u=3' },
    { name: 'خالد', avatar: 'https://i.pravatar.cc/32?u=4' },
    { name: 'نورة', avatar: 'https://i.pravatar.cc/32?u=5' }
  ];

  const list = document.getElementById('online-users-list');
  list.innerHTML = ''; // Clear existing users

  users.forEach(user => {
    const userElement = document.createElement('li');
    userElement.className = 'online-user';
    userElement.innerHTML = `
      <img src="${user.avatar}" alt="Avatar">
      <span>${user.name}</span>
    `;
    list.appendChild(userElement);
  });
}

function simulateActiveSpeaker() {
  const users = document.querySelectorAll('.online-user');
  if (users.length === 0) return;

  // Remove active class from all users
  users.forEach(u => u.classList.remove('active-speaker'));

  // Add active class to a random user
  const randomIndex = Math.floor(Math.random() * users.length);
  users[randomIndex].classList.add('active-speaker');
}

// ===================================================================================
//                                  Core Functions
// ===================================================================================

/**
 * Sends a chat message.
 */
function sendMessage() {
  var msgInput = document.getElementById("msg") || document.getElementById("msg-input");
  if (msgInput && msgInput.value) {
    var messages = document.getElementById("messages");
    var newMsg = document.createElement("div");
    newMsg.innerText = "🧑‍💻 أنت: " + msgInput.value;
    messages.appendChild(newMsg);
    msgInput.value = "";
    playMessageSound();
    showToast("📩 وصلت رسالة جديدة!");
  }
}

let currentUserIdInPopup = null;

/**
 * Shows information about a user in a popup.
 * @param {string} name - The name of the user.
 * @param {string} id - The ID of the user.
 */
function showUserInfo(name, id) {
  currentUserIdInPopup = id;
  document.getElementById('user-name').innerText = '👤 الاسم: ' + name;
  document.getElementById('user-id').innerText = '🆔 ID: ' + id;
  document.getElementById('user-info-popup').style.display = 'flex';
}

/**
 * Closes the user info popup.
 */
function closePopup() {
  document.getElementById('user-info-popup').style.display = 'none';
  currentUserIdInPopup = null;
}

/**
 * Copies the currently selected user's ID to the clipboard.
 */
function copyUserId() {
  if (currentUserIdInPopup) {
    navigator.clipboard.writeText(currentUserIdInPopup).then(() => {
      alert("✅ تم نسخ الـ ID: " + currentUserIdInPopup);
    });
  }
}

/**
 * Copies the room link to the clipboard.
 */
function copyRoomLink() {
  const roomName = localStorage.getItem("room") || "room1";
  const link = window.location.origin + "/?room=" + encodeURIComponent(roomName);
  navigator.clipboard.writeText(link).then(() => {
    alert("✅ تم نسخ رابط الغرفة بنجاح:\n" + link);
  });
}

/**
 * Exits the room and returns to the index page.
 */
function exitRoom() {
  if (confirm("هل تريد الخروج من الغرفة؟")) {
    window.location.href = "index.html";
  }
}

/**
 * Toggles the dark mode on and off.
 */
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}

/**
 * Toggles the chat box visibility.
 */
function toggleChat() {
  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    chatBox.style.display = chatBox.style.display === "none" ? "block" : "none";
  }
}

// ===================================================================================
//                                  UI/UX Functions
// ===================================================================================

/**
 * Shows a toast notification.
 * @param {string} message - The message to display in the toast.
 */
function showToast(message) {
  var x = document.getElementById("toast");
  if(x) {
    x.textContent = message;
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
  }
}

/**
 * Shows a welcome popup.
 */
function showWelcomePopup() {
    if (!sessionStorage.getItem("welcomed")) {
      const popup = document.createElement("div");
      popup.innerHTML = "<div style='background:#fff;border-radius:12px;padding:20px;text-align:center;box-shadow:0 0 12px rgba(0,0,0,0.2);max-width:300px;margin:auto;'><h3>🎉 مرحبًا بك في AirChat!</h3><p>نتمنى لك وقتًا ممتعًا.</p><button onclick='this.parentElement.parentElement.remove()' style='padding:8px 14px;background:#007acc;color:white;border:none;border-radius:8px;'>حسنًا</button></div>";
      popup.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; justify-content:center; align-items:center; z-index:9999;";
      document.body.appendChild(popup);
      sessionStorage.setItem("welcomed", "true");
    }
}

/**
 * Displays a user with a badge.
 * @param {string} badgeType - The type of badge to display.
 * @returns {string} The user display string.
 */
function displayUserWithBadge(badgeType) {
    // This function seems incomplete in the original code.
    // I'll return a placeholder.
    return `مستخدم (${badgeType})`;
}

/**
 * Updates the clock display.
 */
function updateClock() {
  const clockTime = document.getElementById('clock-time');
  if (clockTime) {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      clockTime.textContent = `${hours}:${minutes}:${seconds}`;
  }
}

/**
 * Updates the date and time display.
 */
function updateDateTime() {
    const datetime = document.getElementById('datetime');
    if (datetime) {
        const now = new Date();
        datetime.innerText = now.toLocaleString('ar-EG', { hour12: true });
    }
}

/**
 * Updates the network status indicator.
 */
function updateStatus() {
  const netStatus = document.getElementById('net-status');
  if (netStatus) {
    if (navigator.onLine) {
      netStatus.textContent = '✅ متصل بالإنترنت';
      netStatus.style.background = '#28a745';
    } else {
      netStatus.textContent = '❌ غير متصل';
      netStatus.style.background = '#dc3545';
    }
  }
}

// ===================================================================================
//                                  Background Functions
// ===================================================================================
const backgrounds = [
  'bg-rank1.jpg',
  'bg-rank2.jpg',
  'bg-rank3.jpg',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe',
  'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3'
];
let currentBgIndex = 0;

function switchBackground() {
  document.body.style.backgroundImage = `url(${backgrounds[currentBgIndex]})`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundPosition = 'center';
  currentBgIndex = (currentBgIndex + 1) % backgrounds.length;
}

function initBackgroundSwitcher() {
    // Set the initial background
    switchBackground();
}

function changeBackground() {
    switchBackground();
}

// ===================================================================================
//                                  Sound Functions
// ===================================================================================

function playMicSound() {
  const audio = document.getElementById("mic-audio");
  if (audio) audio.play().catch(() => {});
}

function toggleMusic() {
  const audio = document.getElementById("bg-music");
  if (audio) {
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
  }
}

function playMessageSound() {
  const msgSound = new Audio("new-message.mp3");
  msgSound.play().catch(() => {});
}

function playWelcomeSound() {
  const audio = document.getElementById("welcomeAudio") || new Audio("welcome.mp3");
  audio.play().catch(() => {});
}

// ===================================================================================
//                                  Gift Functions
// ===================================================================================

function sendGift() {
  const giftModal = document.getElementById('gift-modal');
  if (giftModal) {
    giftModal.style.display = 'flex';
  }
}

function closeGiftModal() {
  const giftModal = document.getElementById('gift-modal');
  if (giftModal) {
    giftModal.style.display = 'none';
  }
}

function selectGift(giftEmoji) {
  closeGiftModal();
  showFloatingGiftAnimation(giftEmoji);
}

function showFloatingGiftAnimation(emoji) {
  for (let i = 0; i < 10; i++) {
    const gift = document.createElement('div');
    gift.innerText = emoji;
    gift.style.position = 'fixed';
    gift.style.left = Math.random() * 100 + 'vw';
    gift.style.top = Math.random() * 50 + 80 + 'vh'; // Start near the bottom
    gift.style.fontSize = Math.random() * 20 + 20 + 'px';
    gift.style.opacity = 1;
    gift.style.transition = 'top 3s ease-out, opacity 3s ease-out';
    gift.style.zIndex = '10001';

    document.body.appendChild(gift);

    setTimeout(() => {
      gift.style.top = '-100px';
      gift.style.opacity = 0;
    }, 100);

    setTimeout(() => {
      gift.remove();
    }, 3100);
  }
}

// ===================================================================================
//                                  Moderation Functions
// ===================================================================================

function muteAllUsers() {
    alert("تم كتم جميع المستخدمين.");
}

function makeAnnouncement() {
    const announcement = prompt("اكتب رسالة الإعلان:");
    if(announcement) {
        alert("تم إرسال الإعلان: " + announcement);
    }
}

function toggleMicLock() {
    alert("تم تبديل قفل المايك.");
}

function assignModerator() {
    alert("تم تعيين مشرف.");
}

function banUser() {
    alert("تم حظر المستخدم.");
}

function reportUser() {
    alert("تم الإبلاغ عن المستخدم.");
}

function showTopUsers() {
    const list = document.getElementById('topUsersList');
    if(list) list.style.display = 'block';
}

function showUserRank() {
    alert("ترتيبك هو #1");
}

function castVote(choice) {
    alert("✅ تم تسجيل صوتك: " + choice);
    document.getElementById('vote-bar').style.display = 'none';
}

// ===================================================================================
//                                  Event Listeners
// ===================================================================================

window.addEventListener('DOMContentLoaded', initRoom);
