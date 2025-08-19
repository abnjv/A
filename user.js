function showUserInfo(name, id) {
  document.getElementById("user-name").innerText = "👤 الاسم: " + name;
  document.getElementById("user-id").innerText = "🆔 ID: " + id;
  document.getElementById("user-info-popup").style.display = "block";
}
function closePopup() {
  document.getElementById("user-info-popup").style.display = "none";
}

// عدّ المستخدمين في المايك
window.onload = function() {
  const count = document.querySelectorAll('.mic').length;
  document.getElementById('user-count').innerText = "👥 عدد المستخدمين: " + count;
}

// عرض نجمة VIP للمستخدم الأول كمثال
window.onload = function() {
  const mics = document.querySelectorAll('.mic');
  if (mics.length > 0) {
    const vipTag = document.createElement('div');
    vipTag.innerText = "⭐ VIP";
    vipTag.style.position = "absolute";
    vipTag.style.top = "-10px";
    vipTag.style.right = "10px";
    vipTag.style.color = "gold";
    vipTag.style.fontWeight = "bold";
    mics[0].appendChild(vipTag);
  }
}

// عند الضغط على المستخدم، تظهر نافذة تحتوي على الاسم وID وزر طرد
document.querySelectorAll('.mic').forEach((mic, index) => {
  mic.addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="position:fixed;top:30%;left:50%;transform:translateX(-50%);
                  background:white;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);z-index:9999;text-align:center;">
        <p><strong>👤 المستخدم ${index + 1}</strong></p>
        <p>ID: user${index + 1}</p>
        <button onclick="this.closest('div').remove(); document.querySelectorAll('.mic')[${index}].remove();" 
          style="margin-top:10px;background:#dc3545;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">
          📌 تثبيت</button><button onclick="this.closest('div').remove(); document.querySelectorAll('.mic')[index].remove();" style="margin:5px;background:#dc3545;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">🚫 طرد المستخدم
        </button>
      </div>
    `;
    document.body.appendChild(popup);
  });
});

// إضافة زر لايك عند الضغط على المستخدم
document.querySelectorAll('.mic').forEach((mic, index) => {
  mic.addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="position:fixed;top:30%;left:50%;transform:translateX(-50%);
                  background:white;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);z-index:9999;text-align:center;">
        <p><strong>👤 المستخدم ${index + 1}</strong></p>
        <p>ID: user${index + 1}</p>
        <button onclick="pinUser(${index})" 
          style="margin-top:10px;background:#28a745;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">
          👍 إعجاب
        </button>
        <button onclick="this.closest('div').remove(); document.querySelectorAll('.mic')[${index}].remove();" 
          style="margin-top:10px;background:#dc3545;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;display:block;margin-top:15px;">
          📌 تثبيت</button><button onclick="this.closest('div').remove(); document.querySelectorAll('.mic')[index].remove();" style="margin:5px;background:#dc3545;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">🚫 طرد المستخدم
        </button>
      </div>
    `;
    document.body.appendChild(popup);
  });

  // إضافة عداد لايك على المايك
  const likeCount = document.createElement('div');
  likeCount.className = "like-count";
  likeCount.style.position = "absolute";
  likeCount.style.bottom = "0";
  likeCount.style.right = "5px";
  likeCount.style.background = "#ffc107";
  likeCount.style.color = "#000";
  likeCount.style.padding = "2px 6px";
  likeCount.style.borderRadius = "10px";
  likeCount.style.fontSize = "12px";
  likeCount.innerText = "0 👍";
  mic.appendChild(likeCount);
});

// وظيفة الإعجاب
function likeUser(index) {
  const mic = document.querySelectorAll('.mic')[index];
  const likeDiv = mic.querySelector('.like-count');
  let count = parseInt(likeDiv.innerText);
  count++;
  likeDiv.innerText = count + " 👍";
  document.querySelectorAll('.popup')?.forEach(p => p.remove());
}

function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
}

// تشغيل صوت عند إرسال هدية
function playGiftSound() {
  const giftAudio = new Audio("gift-sound.mp3");
  giftAudio.play();
}

// تعديل زر إرسال الهدية لتشغيل الصوت
document.querySelectorAll('.send-gift-btn')?.forEach(btn => {
  btn.onclick = () => {
    playGiftSound();
    alert("🎁 تم إرسال الهدية!");
  };
});

// وظيفة كتم المستخدم
function muteUser(index) {
  const mic = document.querySelectorAll('.mic')[index];
  mic.style.opacity = "0.5"; // تقليل الشفافية لتمييزه كمكتوم
  const mutedLabel = document.createElement("div");
  mutedLabel.innerText = "🔇 مكتوم";
  mutedLabel.style.position = "absolute";
  mutedLabel.style.top = "5px";
  mutedLabel.style.left = "5px";
  mutedLabel.style.background = "#dc3545";
  mutedLabel.style.color = "white";
  mutedLabel.style.padding = "2px 6px";
  mutedLabel.style.fontSize = "12px";
  mutedLabel.style.borderRadius = "6px";
  mic.appendChild(mutedLabel);
}

// تعديل النافذة عند الضغط على المستخدم لإضافة زر الكتم
document.querySelectorAll('.mic').forEach((mic, index) => {
  mic.addEventListener('click', () => {
    const popup = document.createElement('div');
    popup.innerHTML = `
      <div style="position:fixed;top:30%;left:50%;transform:translateX(-50%);
                  background:white;padding:20px;border-radius:10px;box-shadow:0 0 10px rgba(0,0,0,0.2);
                  z-index:9999;text-align:center;" class="popup">
        <p><strong>👤 المستخدم ${index + 1}</strong></p>
        <p>ID: user${index + 1}</p>
        <button onclick="likeUser(${index})" 
          style="margin:5px;background:#28a745;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">
          👍 إعجاب
        </button>
        <button onclick="muteUser(${index}); this.closest('div').remove();" 
          style="margin:5px;background:#ffc107;color:black;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">
          🔇 كتم
        </button>
        <button onclick="this.closest('div').remove(); document.querySelectorAll('.mic')[${index}].remove();" 
          style="margin:5px;background:#dc3545;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">
          📌 تثبيت</button><button onclick="this.closest('div').remove(); document.querySelectorAll('.mic')[index].remove();" style="margin:5px;background:#dc3545;color:white;border:none;padding:10px 15px;border-radius:8px;font-weight:bold;cursor:pointer;">🚫 طرد
        </button>
      </div>
    `;
    document.body.appendChild(popup);
  });
});

let micLocked = false;

// زر لقفل وفتح المايك
function toggleMicLock() {
  micLocked = !micLocked;
  const button = document.getElementById("mic-lock-btn");
  button.innerText = micLocked ? "🔒 المايكات مقفولة" : "🔓 المايكات مفتوحة";
  button.style.background = micLocked ? "#dc3545" : "#28a745";

  // تفعيل / تعطيل المايكات
  document.querySelectorAll('.mic').forEach(mic => {
    mic.style.pointerEvents = micLocked ? "none" : "auto";
    mic.style.opacity = micLocked ? "0.5" : "1";
  });
}

// تحديث عدد المشاهدين (محاكاة)
function updateViewerCount() {
  const viewers = Math.floor(Math.random() * 50) + 10;
  document.getElementById("viewerNumber").innerText = viewers;
}
setInterval(updateViewerCount, 5000);
updateViewerCount();

// سجل الرسائل داخل الغرفة
function sendMessage() {
  const input = document.getElementById("msg-input");
  const text = input.value.trim();
  if (!text) return;
  const msgList = document.getElementById("message-list");
  const msgDiv = document.createElement("div");
  
    msgDiv.innerHTML = "📨 " + text + 
      " <button onclick='translateMessage(this.parentElement)' style='font-size:10px;padding:2px 5px;margin-right:5px;'>🌍 ترجمة</button>";
    
  msgList.appendChild(msgDiv);
  input.value = "";
  msgList.scrollTop = msgList.scrollHeight;
}

// صوت عند وصول رسالة جديدة
function playNewMessageSound() {
  const msgAudio = new Audio("new-message.mp3");
  msgAudio.play();
}

// تعديل إرسال الرسالة لتشغيل الصوت
function sendMessage() {
  const input = document.getElementById("msg-input");
  const text = input.value.trim();
  if (!text) return;
  const msgList = document.getElementById("message-list");
  const msgDiv = document.createElement("div");
  
    msgDiv.innerHTML = "📨 " + text + 
      " <button onclick='translateMessage(this.parentElement)' style='font-size:10px;padding:2px 5px;margin-right:5px;'>🌍 ترجمة</button>";
    
  msgList.appendChild(msgDiv);
  input.value = "";
  msgList.scrollTop = msgList.scrollHeight;
  playNewMessageSound();
}

let pinnedMicIndex = null;

// تثبيت المستخدم على المايك
function pinUser(index) {
  if (pinnedMicIndex !== null) {
    const prev = document.querySelectorAll('.mic')[pinnedMicIndex];
    prev.classList.remove("pinned");
  }
  pinnedMicIndex = index;
  const mic = document.querySelectorAll('.mic')[index];
  mic.classList.add("pinned");
}

// بيانات المستخدمين مع الرتب (محاكاة)
const users = [
  { name: "مالك", rank: "admin" },
  { name: "نجم", rank: "vip" },
  { name: "زائر", rank: "user" }
];

// عرض الرتبة فوق المايك
function renderMicsWithRanks() {
  const micElements = document.querySelectorAll('.mic');
  micElements.forEach((mic, index) => {
    const rank = users[index % users.length].rank;
    const badge = document.createElement("div");
    badge.style.position = "absolute";
    badge.style.top = "0px";
    badge.style.right = "0px";
    badge.style.padding = "3px 6px";
    badge.style.borderRadius = "6px";
    badge.style.color = "white";
    badge.style.fontSize = "10px";
    badge.style.background = rank === "admin" ? "#dc3545" : rank === "vip" ? "#ffc107" : "#6c757d";
    badge.innerText = rank === "admin" ? "مدير" : rank === "vip" ? "VIP" : "زائر";
    mic.style.position = "relative";
    mic.appendChild(badge);
  });
}

window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  renderMicsWithRanks();
};

// الترجمة التلقائية (محاكاة)
function translateMessage(div) {
  const original = div.textContent;
  div.innerHTML = original + " 🌐 <i style='color:#888'>(ترجمة: This is a translated message)</i>";
}

let messageCount = 0;
let micUpCount = 0;

function updateStats() {
  const stats = document.getElementById("statsBox");
  stats.innerHTML = `📊 إحصائيات:<br>🗨️ الرسائل: ${messageCount}<br>🎤 صعود المايك: ${micUpCount}`;
}

// تحديث عند إرسال رسالة
const originalSendMessage = sendMessage;
sendMessage = function() {
  originalSendMessage();
  messageCount++;
  updateStats();
}

// عند صعود المايك (محاكاة)
function simulateMicUp() {
  micUpCount++;
  updateStats();
}

// تشغيل التحديث تلقائيًا
window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  renderMicsWithRanks();
  updateStats();
};

let reactionScores = Array.from({length: 10}, () => 0);

function increaseReaction(index) {
  reactionScores[index]++;
  updateReactionScore(index);
}

function updateReactionScore(index) {
  const mic = document.querySelectorAll(".mic")[index];
  let scoreBox = mic.querySelector(".react-score");
  if (!scoreBox) {
    scoreBox = document.createElement("div");
    scoreBox.className = "react-score";
    mic.appendChild(scoreBox);
  }
  scoreBox.textContent = "🔥 " + reactionScores[index];
}

// إضافة زر لاختبار التفاعل
function setupReactions() {
  document.querySelectorAll(".mic").forEach((mic, i) => {
    mic.onclick = () => {
      increaseReaction(i);
    };
  });
}

window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  renderMicsWithRanks();
  updateStats();
  setupReactions();
};

// تشغيل صوت ترحيبي عند دخول المستخدم
function playWelcomeSound() {
  const audio = new Audio("welcome.mp3");
  audio.play();
}

window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  renderMicsWithRanks();
  updateStats();
  setupReactions();
  playWelcomeSound();
};

const badWords = ["كلمة1", "كلمة2", "badword"]; // يمكن تعديل هذه القائمة
function filterBadWords(text) {
  for (const word of badWords) {
    const regex = new RegExp(word, 'gi');
    text = text.replace(regex, "****");
  }
  return text;
}

// تعديل إرسال الرسائل لتشمل الفلترة
const originalSendMessage_v2 = sendMessage;
sendMessage = function() {
  const input = document.getElementById("msgInput");
  if (input) {
    input.value = filterBadWords(input.value);
  }
  originalSendMessage_v2();
};

// عرض رسالة ترحيب في سجل الرسائل عند دخول المستخدم
function showWelcomeMessage() {
  const chatBox = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.textContent = "👋 مرحبًا بك في غرفة AirChat!";
  msg.style.color = "#28a745";
  msg.style.fontWeight = "bold";
  chatBox.appendChild(msg);
}

// تشغيلها عند تحميل الصفحة
window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  renderMicsWithRanks();
  updateStats();
  setupReactions();
  playWelcomeSound();
  showWelcomeMessage();
};

let mutedUsers = {};

function toggleMute(userId) {
  if (mutedUsers[userId]) {
    delete mutedUsers[userId];
  } else {
    mutedUsers[userId] = true;
  }
  updateMicView();
}

function isMuted(userId) {
  return mutedUsers[userId];
}

// تعديل عرض المستخدم ليظهر أنه مكتوم
function updateMicView() {
  document.querySelectorAll(".mic").forEach((mic, index) => {
    const userId = mic.getAttribute("data-id");
    if (isMuted(userId)) {
      mic.style.opacity = "0.5";
      mic.querySelector(".mic-name")?.classList.add("muted");
    } else {
      mic.style.opacity = "1";
      mic.querySelector(".mic-name")?.classList.remove("muted");
    }
  });
}

// إضافة زر كتم عند الضغط على المستخدم
function renderMicsWithMute() {
  renderMicsWithRanks();
  updateMicView();
  document.querySelectorAll(".mic").forEach((mic, i) => {
    const userId = mic.getAttribute("data-id") || ("user" + i);
    mic.setAttribute("data-id", userId);

    mic.onclick = () => {
      const confirmMute = confirm("هل تريد كتم هذا المستخدم؟");
      if (confirmMute) toggleMute(userId);
    };
  });
}

// استبدال onload السابق
window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  renderMicsWithMute();
  updateStats();
  setupReactions();
  playWelcomeSound();
  showWelcomeMessage();
};

// تحديث عدد المستخدمين المتصلين الآن (محاكاة فقط)
function updateOnlineCount() {
  const totalUsers = document.querySelectorAll(".mic").length;
  document.getElementById("onlineCount").textContent = totalUsers;
}

// تشغيل عداد المستخدمين
setInterval(updateOnlineCount, 3000);

function makeAnnouncement() {
  const text = prompt("📣 اكتب نص الإعلان:");
  if (text) {
    const chatBox = document.getElementById("chatBox");
    const msg = document.createElement("div");
    msg.textContent = "📣 إعلان: " + text;
    msg.style.background = "#fff3cd";
    msg.style.border = "1px solid #ffeeba";
    msg.style.padding = "10px";
    msg.style.margin = "10px 0";
    msg.style.borderRadius = "10px";
    msg.style.color = "#856404";
    msg.style.fontWeight = "bold";
    chatBox.appendChild(msg);
  }
}

let kickedUsers = {};

function kickUser(userId) {
  kickedUsers[userId] = true;
  renderMicsWithKick(); // إعادة رسم المايكات بدون هذا المستخدم
}

// تعديل عرض المايكات لمنع عرض المطرودين
function renderMicsWithKick() {
  const micElements = document.querySelectorAll(".mic");
  micElements.forEach((mic, i) => {
    const userId = mic.getAttribute("data-id") || ("user" + i);
    if (kickedUsers[userId]) {
      mic.style.display = "none";
    } else {
      mic.style.display = "block";
    }
  });
}

// تعديل المايك ليظهر زر طرد عند الضغط
function renderMicsWithMuteKick() {
  renderMicsWithRanks();
  updateMicView();
  document.querySelectorAll(".mic").forEach((mic, i) => {
    const userId = mic.getAttribute("data-id") || ("user" + i);
    mic.setAttribute("data-id", userId);
    mic.onclick = () => {
      const choice = prompt("🎤 المستخدم: " + userId + "\nاكتب: mute أو kick");
      if (choice === "kick") {
        kickUser(userId);
      } else if (choice === "mute") {
        toggleMute(userId);
      }
    };
  });
}

// استبدال window.onload
window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  renderMicsWithMuteKick();
  updateStats();
  setupReactions();
  playWelcomeSound();
  showWelcomeMessage();
  updateOnlineCount();
};

function muteAllUsers() {
  document.querySelectorAll(".mic").forEach((mic, i) => {
    const userId = mic.getAttribute("data-id") || ("user" + i);
    mutedUsers[userId] = true;
  });
  updateMicView();
  alert("🔇 تم كتم جميع المستخدمين.");
}

function pinMessage() {
  const text = prompt("📌 اكتب نص الرسالة لتثبيتها:");
  if (text) {
    const pinBox = document.getElementById("pinnedMessage");
    pinBox.textContent = "📌 " + text;
    pinBox.style.display = "block";
  }
}

// زر التثبيت في أسفل الشاشة
const pinBtn = document.createElement("button");
pinBtn.innerText = "📌 تثبيت رسالة";
pinBtn.style.position = "fixed";
pinBtn.style.bottom = "120px";
pinBtn.style.right = "20px";
pinBtn.style.zIndex = 999;
pinBtn.style.padding = "10px 20px";
pinBtn.style.border = "none";
pinBtn.style.borderRadius = "8px";
pinBtn.style.background = "#17a2b8";
pinBtn.style.color = "white";
pinBtn.style.fontWeight = "bold";
pinBtn.onclick = pinMessage;
window.addEventListener("load", () => {
  document.body.appendChild(pinBtn);
});

// محاولة تشغيل الموسيقى تلقائيًا عند تفاعل المستخدم
window.addEventListener("click", () => {
  const music = document.getElementById("bgMusic");
  if (music && music.paused) {
    music.play();
  }
});

function handleBotReplies(messageText) {
  const lowerText = messageText.toLowerCase();
  let reply = "";

  if (lowerText.includes("مرحبا") || lowerText.includes("اهلا")) {
    reply = "👋 أهلاً وسهلاً بك!";
  } else if (lowerText.includes("كيف الحال") || lowerText.includes("كيفك")) {
    reply = "😊 أنا بخير، ماذا عنك؟";
  } else if (lowerText.includes("شكرا")) {
    reply = "✨ على الرحب والسعة!";
  }

  if (reply) {
    const chatBox = document.getElementById("chatBox");
    const botMsg = document.createElement("div");
    botMsg.textContent = "🤖 البوت: " + reply;
    botMsg.style.background = "#e6f7ff";
    botMsg.style.border = "1px solid #b3e5fc";
    botMsg.style.padding = "10px";
    botMsg.style.margin = "10px 0";
    botMsg.style.borderRadius = "10px";
    botMsg.style.color = "#0275d8";
    chatBox.appendChild(botMsg);
  }
}

// تعديل زر الإرسال الحالي ليتحقق من ردود البوت
const originalSend = window.sendMessage;
window.sendMessage = function() {
  const input = document.getElementById("messageInput");
  const msg = input.value.trim();
  if (msg) {
    handleBotReplies(msg);
  }
  originalSend();
};

function logUserEntry(userName) {
  const logList = document.getElementById("logList");
  const li = document.createElement("li");
  const now = new Date().toLocaleTimeString();
  li.textContent = `👤 ${userName} دخل الساعة ${now}`;
  logList.appendChild(li);
}

// تسجيل دخول المستخدم نفسه عند تحميل الصفحة
window.addEventListener("load", () => {
  const myName = localStorage.getItem("username") || "مستخدم غير معروف";
  logUserEntry(myName);
});

function logUserExit(userName) {
  const logList = document.getElementById("exitList");
  if (!logList) return;
  const li = document.createElement("li");
  const now = new Date().toLocaleTimeString();
  li.textContent = `🚪 ${userName} خرج الساعة ${now}`;
  logList.appendChild(li);
}

window.addEventListener("beforeunload", () => {
  const myName = localStorage.getItem("username") || "مستخدم غير معروف";
  navigator.sendBeacon("/log-exit", myName + " خرج");
});

let seconds = 0;
function updateTimer() {
  seconds++;
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  document.getElementById("timer").textContent = `${mins}:${secs}`;
}
window.addEventListener("load", () => {
  setInterval(updateTimer, 1000);
});

function playEntrySound() {
  const audio = new Audio("welcome.mp3");
  audio.play();
}

// تشغيل صوت الدخول مع تسجيل الدخول
window.addEventListener("load", () => {
  const myName = localStorage.getItem("username") || "مستخدم غير معروف";
  logUserEntry(myName);
  playEntrySound();
});

function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return '<a href="' + url + '" target="_blank" style="color:#007bff;">' + url + '</a>';
  });
}

// تعديل إرسال الرسائل لعرض الروابط كنص قابل للنقر
const originalSendMessage = window.sendMessage;
window.sendMessage = function () {
  const input = document.getElementById("messageInput");
  const msg = input.value.trim();
  if (msg) {
    const chatBox = document.getElementById("chatBox");
    const userMsg = document.createElement("div");
    const name = localStorage.getItem("username") || "أنا";
    userMsg.innerHTML = `<strong>${name}:</strong> ` + linkify(msg);
    userMsg.style.background = "#e1f5fe";
    userMsg.style.border = "1px solid #81d4fa";
    userMsg.style.padding = "10px";
    userMsg.style.margin = "10px 0";
    userMsg.style.borderRadius = "10px";
    chatBox.appendChild(userMsg);
    input.value = "";
    handleBotReplies(msg);
  }
};

let micLocked = false;

function toggleMicLock() {
  micLocked = !micLocked;
  alert(micLocked ? "🚫 تم قفل المايك!" : "✅ تم فتح المايك!");
}

function tryJoinMic(userId) {
  if (micLocked) {
    alert("❌ لا يمكنك الصعود، المايك مقفل!");
    return;
  }
  alert("🎤 صعدت على المايك بنجاح (تجريبي)");
}

let moderators = [];

function assignModerator() {
  const user = prompt("🛡️ أدخل اسم المستخدم لجعله مشرف:");
  if (user) {
    moderators.push(user.trim());
    alert(`✅ تم تعيين ${user} كمشرف.`);
    showModerators();
  }
}

function showModerators() {
  const box = document.getElementById("moderatorList");
  if (!box) return;
  box.innerHTML = "<strong>🛡️ المشرفين:</strong><ul style='margin:0;padding:0;'>";
  moderators.forEach(m => {
    box.innerHTML += `<li style="margin:5px 0;">👤 ${m}</li>`;
  });
  box.innerHTML += "</ul>";
}

let bannedUsers = [];

function banUser() {
  const user = prompt("🚫 أدخل اسم المستخدم لحظره:");
  if (user) {
    bannedUsers.push(user.trim());
    alert(`🚫 تم حظر ${user} من استخدام المايك.`);
  }
}

function tryJoinMic(userId) {
  const currentUser = localStorage.getItem("username") || "";
  if (micLocked) {
    alert("❌ لا يمكنك الصعود، المايك مقفل!");
    return;
  }
  if (bannedUsers.includes(currentUser)) {
    alert("🚫 تم حظرك من استخدام المايك.");
    return;
  }
  alert("🎤 صعدت على المايك بنجاح (تجريبي)");
}

function reportUser() {
  const reportedUser = prompt("⚠️ أدخل اسم المستخدم الذي تريد التبليغ عنه:");
  if (reportedUser) {
    alert(`📩 تم إرسال تبليغ ضد ${reportedUser}. سيتم مراجعته من قبل الإدارة.`);
    // في النظام الحقيقي، يتم إرسال هذا التبليغ للسيرفر
  }
}

function toggleDarkMode() {
  const body = document.body;
  const isDark = body.classList.toggle("dark-mode");
  alert(isDark ? "🌙 تم تفعيل الوضع الليلي" : "🌞 تم إيقاف الوضع الليلي");
}

const userBadges = {
  "admin": "👑",
  "moderator": "🛡️",
  "vip": "💎"
};

function getBadge(username) {
  return userBadges[username] || "";
}

function displayUserWithBadge(username) {
  return getBadge(username) + " " + username;
}

const topUsers = [
  { name: "Ali", xp: 150 },
  { name: "Sara", xp: 120 },
  { name: "Omar", xp: 100 },
  { name: "Lama", xp: 90 },
  { name: "Ziad", xp: 80 }
];

function showTopUsers() {
  const container = document.getElementById("topUsersList");
  container.innerHTML = "<strong>💫 لوحة الشرف:</strong><ul style='margin:0;padding:0;'>";
  topUsers.forEach(user => {
    container.innerHTML += `<li style='margin:5px 0;'>🌟 ${user.name} - ${user.xp} نقطة</li>`;
  });
  container.innerHTML += "</ul>";
}

let userXP = parseInt(localStorage.getItem("userXP") || "0");

function addXP(amount = 10) {
  userXP += amount;
  localStorage.setItem("userXP", userXP);
  updateXPDisplay();
}

function updateXPDisplay() {
  const xpElement = document.getElementById("xpCounter");
  if (xpElement) {
    xpElement.innerText = `نقاطك: ${userXP}`;
  }
}

function simulateAction() {
  addXP(5); // كل تفاعل يعطي 5 نقاط
  alert("✅ حصلت على 5 نقاط خبرة!");
}

window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateXPDisplay();
};

function calculateLevel(xp) {
  if (xp >= 500) return 5;
  if (xp >= 300) return 4;
  if (xp >= 200) return 3;
  if (xp >= 100) return 2;
  return 1;
}

function updateLevelDisplay() {
  const level = calculateLevel(userXP);
  const levelElement = document.getElementById("levelDisplay");
  if (levelElement) {
    levelElement.innerText = `المستوى: ${level}`;
  }
}

window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateXPDisplay();
  updateLevelDisplay();
};

function getLevelBadge(level) {
  switch (level) {
    case 1: return "🥉";
    case 2: return "🥈";
    case 3: return "🥇";
    case 4: return "🏅";
    case 5: return "🎖️";
    default: return "";
  }
}

function displayUserWithBadgeAndLevel(username) {
  const level = calculateLevel(userXP);
  return getLevelBadge(level) + " " + username;
}

function updateMicBadge() {
  const level = calculateLevel(userXP);
  document.getElementById("micBadge").innerText = getLevelBadge(level);
}

window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateXPDisplay();
  updateLevelDisplay();
  updateMicBadge();
  document.getElementById("userBadgeName").innerText = displayUserWithBadgeAndLevel("مستخدم");
};

function updateBackgroundByLevel() {
  const level = calculateLevel(userXP);
  const body = document.body;
  switch(level) {
    case 1:
      body.style.backgroundImage = "linear-gradient(to right, #f0f0f0, #fafafa)";
      break;
    case 2:
      body.style.backgroundImage = "linear-gradient(to right, #d0f0ff, #e0ffff)";
      break;
    case 3:
      body.style.backgroundImage = "linear-gradient(to right, #ffe0cc, #fff0e6)";
      break;
    case 4:
      body.style.backgroundImage = "linear-gradient(to right, #fffacd, #f0e68c)";
      break;
    case 5:
      body.style.backgroundImage = "linear-gradient(to right, #d4af37, #ffd700)";
      break;
  }
}

window.onload = () => {
  updateMicBackgroundByGift();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  updateXPDisplay();
  updateLevelDisplay();
  updateMicBadge();
  document.getElementById("userBadgeName").innerText = displayUserWithBadgeAndLevel("مستخدم");
  updateBackgroundByLevel();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
};

function showGiftEffect() {
  const box = document.getElementById("giftBox");
  if (box) {
    box.classList.add("gift-animation");
    setTimeout(() => {
      box.classList.remove("gift-animation");
    }, 700);
  }
}


let userGifts = parseInt(localStorage.getItem("userGifts")) || 0;



function sendGift() {
  userGifts++;
  localStorage.setItem("userGifts", userGifts);

  userGifts++;
  updateGiftCounter();
  checkGiftMilestone();
  updateMicBadgeWithGift();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
  updateHonorBoard();
  updateMicBackgroundByGift();
  setKingBadge();
  showGiftEffect();
  showGiftToast();
  awardGiftXP();
}

function updateGiftCounter() {
  const counter = document.getElementById("giftCounter");
  if (counter) {
    counter.innerText = `🎁 عدد الهدايا: ${userGifts}`;
  }
}

function checkGiftMilestone() {
  if (userGifts === 5) {
    alert("🎉 مبروك! وصلت إلى 5 هدايا 🎁");
  } else if (userGifts === 10) {
    alert("🏆 تهانينا! أرسلت 10 هدايا 🎁");
  } else if (userGifts === 20) {
    alert("👑 أسطورة الهدايا! 20 هدية 🎁");
  }
}

function getUserBadgeByGifts() {
  if (userGifts >= 20) return "👑";
  if (userGifts >= 10) return "🏆";
  if (userGifts >= 5) return "🎉";
  return "";
}

function updateMicBadgeWithGift() {
  const badge = document.getElementById("userBadgeName");
  if (badge) {
    badge.innerText = displayUserWithBadgeAndLevel("مستخدم") + " " + getUserBadgeByGifts();
  }
}

let honorUsers = JSON.parse(localStorage.getItem("honorUsers")) || [];

function updateHonorBoard() {
  // إضافة المستخدم الحالي
  honorUsers.push({ name: "مستخدم", gifts: userGifts });
  // حذف المكررات حسب الاسم
  honorUsers = honorUsers.filter((v,i,a)=>a.findIndex(t=>(t.name === v.name))===i);
  // ترتيبهم حسب الهدايا
  honorUsers.sort((a, b) => b.gifts - a.gifts);
  // حفظ
  localStorage.setItem("honorUsers", JSON.stringify(honorUsers));
  const honorList = document.getElementById("honorList");
  if (honorList) {
    honorList.innerHTML = "";
    for (let i = 0; i < Math.min(3, honorUsers.length); i++) {
      honorList.innerHTML += `<li>${i + 1}. ${honorUsers[i].name} (${honorUsers[i].gifts})</li>`;
    }
  }
}

function setKingBadge() {
  const honorUsers = JSON.parse(localStorage.getItem("honorUsers")) || [];
  const topUser = honorUsers.length > 0 ? honorUsers[0] : null;
  const badge = document.getElementById("userBadgeName");
  if (badge && topUser && topUser.name === "مستخدم") {
    badge.innerText += " 👑";
    badge.classList.add("king-glow");
  }
}

function updateMicBackgroundByGift() {
  const micBox = document.querySelector(".mic-box");
  if (!micBox) return;

  micBox.classList.remove("bg-gift-5", "bg-gift-10", "bg-gift-20", "bg-gift-king");

  if (userGifts >= 20) {
    micBox.classList.add("bg-gift-king");
  } else if (userGifts >= 10) {
    micBox.classList.add("bg-gift-20");
  } else if (userGifts >= 5) {
    micBox.classList.add("bg-gift-10");
  }
}

function showGiftEffect() {
  const effect = document.getElementById("giftEffect");
  if (!effect) return;
  effect.style.display = "block";
  effect.classList.add("gift-flash");
  setTimeout(() => {
    effect.style.display = "none";
    effect.classList.remove("gift-flash");
  }, 800);
}

function showGiftToast() {
  const toast = document.getElementById("giftToast");
  if (!toast) return;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

let userXP = 0;

function updateXP(points) {
  userXP += points;
  const xpEl = document.getElementById("xpValue");
  updateLevel();
  if (xpEl) xpEl.textContent = userXP;
}

// استدعاء XP عند إرسال هدية
function awardGiftXP() {
  updateXP(10); // 10 نقاط لكل هدية ترسل
}

let userLevel = 1;

function updateLevel() {
  let newLevel = 1;
  if (userXP >= 300) newLevel = 4;
  else if (userXP >= 200) newLevel = 3;
  else if (userXP >= 100) newLevel = 2;

  if (newLevel !== userLevel) {
    userLevel = newLevel;
    const levelEl = document.getElementById("levelValue");
    
  if (levelEl) levelEl.textContent = userLevel;
  const badge = document.getElementById("levelBadge");
  if (badge) {
    if (userLevel === 1) {
      badge.textContent = "🥉";
      levelEl.style.color = "#8d6e63";
    } else if (userLevel === 2) {
      badge.textContent = "🥈";
      levelEl.style.color = "#607d8b";
    } else if (userLevel === 3) {
      badge.textContent = "🥇";
      levelEl.style.color = "#ffc107";
    } else if (userLevel === 4) {
      badge.textContent = "🏆";
      levelEl.style.color = "#ff5722";
    }
  }

  }
}

// ملاحظة: هذه بيانات تجريبية فقط. يمكن تطويرها لاحقًا لتكون واقعية من السيرفر.
const topUsers = [
  { name: "مستخدم 1", xp: 300 },
  { name: "مستخدم 2", xp: 240 },
  { name: "مستخدم 3", xp: 180 },
  { name: "مستخدم 4", xp: 120 },
  { name: "مستخدم 5", xp: 100 },
];

function renderTopUsers() {
  const list = document.getElementById("topUsersList");
  if (!list) return;
  list.innerHTML = topUsers.map(u => 
    `<li>${u.name} - ${u.xp} XP</li>`).join("");
}

renderTopUsers();

function markTopUser(usernameElement) {
  if (!usernameElement) return;
  const topNames = topUsers.map(u => u.name);
  if (topNames.includes(usernameElement.textContent.trim())) {
    usernameElement.innerHTML += ' <span style="color:#fbc02d">👑</span>';
  }
}

// محاكاة استخدام الدالة عند إنشاء المستخدم
document.querySelectorAll('.username').forEach(markTopUser);

function notifyIfTopUser(username) {
  const topNames = topUsers.map(u => u.name);
  if (topNames.includes(username)) {
    const audio = new Audio("top-user-join.mp3");
    audio.play();
  }
}

// مثال: عند دخول المستخدم
const currentUser = "مستخدم 1"; // يجب استبداله لاحقًا باسم المستخدم الحقيقي
notifyIfTopUser(currentUser);

function getUserRank(username) {
  const sorted = [...topUsers].sort((a, b) => b.xp - a.xp);
  const index = sorted.findIndex(u => u.name === username);
  return index >= 0 ? index + 1 : null;
}

function showUserRank() {
  const username = "مستخدم 1"; // عدل هذا ليأخذ الاسم من تسجيل الدخول
  const rank = getUserRank(username);
  if (rank) {
    alert("📊 ترتيبك ضمن أفضل المستخدمين هو: #" + rank);
  } else {
    alert("❌ أنت لست ضمن أفضل 5 مستخدمين حتى الآن.");
  }
}

// دالة لزيادة نقاط XP عند استلام هدية
function addGiftXP(username, amount) {
  const user = topUsers.find(u => u.name === username);
  if (user) {
    user.xp += amount;
    alert("🎁 " + username + " حصل على " + amount + " XP من هدية!");
    renderTopUsers(); // تحديث قائمة أفضل المستخدمين
  }
}

// مثال: محاكاة استلام هدية من مستخدم
setTimeout(() => {
  addGiftXP("مستخدم 1", 50);
}, 3000);

function setBackgroundByRank(username) {
  const sorted = [...topUsers].sort((a, b) => b.xp - a.xp);
  const rank = sorted.findIndex(u => u.name === username) + 1;

  let bg = "";
  if (rank === 1) bg = "bg-rank1.jpg";
  else if (rank === 2) bg = "bg-rank2.jpg";
  else if (rank === 3) bg = "bg-rank3.jpg";
  else bg = "bg-default.jpg";

  document.body.style.backgroundImage = "url('" + bg + "')";
  document.body.style.backgroundSize = "cover";
}

// مثال لتطبيق الخلفية بناء على اسم المستخدم
setBackgroundByRank("مستخدم 1");

function activateMicVisual(micId) {
  const micElement = document.getElementById(micId);
  if (micElement) {
    micElement.classList.add("mic-active");
  }
}

// مثال: تفعيل التأثير على المايك رقم 1
activateMicVisual("mic-1");

// تشغيل مؤقت تنازلي مرئي لمدة 10 ثوانٍ على المايك رقم 1
setTimeout(() => {
  startMicCountdown("mic-1", 10);
}, 2000);

function muteMic(micId) {
  const mic = document.getElementById(micId);
  if (mic) {
    mic.classList.remove("mic-active");
    mic.classList.add("muted");
    mic.style.opacity = "0.5";
  }
}

// مثال لتشغيل التأثير عند إرسال هدية:
setTimeout(() => {
  showGiftEffect();
}, 5000); // تشغيله بعد 5 ثوانٍ كتجربة

function blockMic(id) {
  const mic = document.getElementById(id);
  mic.classList.add("blocked");
}

// محاكاة دخول زوار
setTimeout(() => logUserJoin("ضيف رقم 1"), 1000);
setTimeout(() => logUserJoin("ضيف رقم 2"), 3000);
setTimeout(() => logUserJoin("ضيف رقم 3"), 6000);

let userCount = 0;
function logUserJoin(name) {
  const logBox = document.getElementById('user-join-log');
  const entry = document.createElement('div');
  entry.textContent = '📥 دخل: ' + name;
  logBox.appendChild(entry);
  if (logBox.children.length > 5) {
    logBox.removeChild(logBox.children[0]);
  }
  userCount++;
  updateUserCounter();
}
function updateUserCounter() {
  document.getElementById("live-counter").textContent = "👥 عدد الزوار: " + userCount;
}

// التحديث 89-98: VIP + منع دخول + تصويت

const speakerPoints = {
  "mic-1": 8,
  "mic-2": 5,
  "mic-4": 10,
  "mic-5": 2
};

function updateTopSpeakers() {
  const sorted = Object.entries(speakerPoints).sort((a,b) => b[1] - a[1]);
  const list = document.getElementById("speaker-list");
  list.innerHTML = "";
  sorted.forEach(([micId, points]) => {
    const li = document.createElement("li");
    li.textContent = micId + ": " + points + " نقطة";
    list.appendChild(li);
  });
}

// تحديث القائمة عند الدخول
setTimeout(updateTopSpeakers, 1500);

// تحديث 100: نظام الإنجازات
// الإنجاز الأول يظهر تلقائيًا عند الدخول، ويمكن تطويره لإنجازات حسب النشاط

// تحديث 101: روبوت ردود تلقائي داخل الغرفة
function autoReplyTo(message) {
  const responses = {
    "مرحبا": "أهلاً بك! كيف أقدر أساعدك؟ 😊",
    "من معي؟": "أنا روبوت AirChat، موجود دائماً 🧠",
    "احبك": "❤️ وأنا كمان أحبكم يا أهل الغرفة!",
    "باي": "مع السلامة! نشوفك قريب 👋"
  };
  return responses[message.toLowerCase()] || null;
}
document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("chat-input");
  const btn = document.getElementById("send-btn");
  btn.addEventListener("click", () => {
    const userMsg = input.value.trim();
    const reply = autoReplyTo(userMsg);
    if (reply) {
      setTimeout(() => {
        const botMsg = document.createElement("div");
        botMsg.className = "chat-message bot";
        botMsg.innerHTML = "<strong>🤖 روبوت:</strong> " + reply;
        chatBox.appendChild(botMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
      }, 1000);
    }
  });
});

// تحديث 105: علامة التوثيق
function addVerifiedIcon(usernameElement) {
  const icon = document.createElement("span");
  icon.textContent = "✔️";
  icon.style.color = "blue";
  icon.style.marginRight = "5px";
  usernameElement.prepend(icon);
}
setTimeout(() => {
  document.querySelectorAll(".mic-username").forEach(name => {
    if (name.textContent.includes("VIP")) addVerifiedIcon(name);
  });
}, 1500);

// تحديث 115: عداد رسائل المستخدم
let messageCount = 0;
document.getElementById("send-btn").addEventListener("click", () => {
  messageCount++;
  document.getElementById("msg-count").textContent = "📨 " + messageCount;
});

// تحديث 201: زر إرسال رسالة صوتية (وهمي للتصميم)
document.getElementById("voice-btn").addEventListener("click", () => {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = "chat-message";
  msg.innerHTML = "<strong>🎤 صوت:</strong> [تم إرسال تسجيل صوتي]";
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// تحديث 205: زر إرسال صورة في الدردشة
document.getElementById("img-btn").addEventListener("click", () => {
  const chatBox = document.getElementById("chat-box");
  const img = document.createElement("img");
  img.src = "https://via.placeholder.com/100";
  img.style.borderRadius = "10px";
  img.style.margin = "5px 0";
  chatBox.appendChild(img);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// تحديث 210: تثبيت رسالة
document.getElementById("send-btn").addEventListener("dblclick", () => {
  const lastMsg = document.querySelector(".chat-message:last-child");
  if (lastMsg) {
    document.getElementById("pinned-message").innerText = "📌 " + lastMsg.textContent;
  }
});

// تحديث 301: إشعار دخول مستخدم جديد
function showJoinNotification(username) {
  const notif = document.createElement("div");
  notif.textContent = "🔔 انضم " + username + " إلى الغرفة";
  notif.style = "position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#fffa;border:1px solid #ccc;padding:10px;border-radius:10px;z-index:10000;font-size:18px";
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 4000);
}

// مثال تجريبي عند تحميل الصفحة
window.onload = () => {
  setTimeout(() => showJoinNotification("نجم"), 2000);
};

// تحديث 302: زر تغيير اللغة (وهمي)
let lang = "ar";
document.getElementById("lang-toggle").addEventListener("click", () => {
  lang = (lang === "ar") ? "en" : "ar";
  document.getElementById("lang-toggle").textContent = "🌐 اللغة: " + (lang === "ar" ? "عربي" : "English");
});

// تحديث 303: تقييم الغرفة
document.querySelectorAll("#stars span").forEach((star, index) => {
  star.addEventListener("click", () => {
    document.querySelectorAll("#stars span").forEach((s, i) => {
      s.textContent = i <= index ? "⭐" : "☆";
    });
    alert("✅ شكراً على تقييمك: " + (index + 1) + " نجوم");
  });
});

// تحديث 305: نافذة الإبلاغ عن مستخدم
function reportUser() {
  const div = document.createElement("div");
  div.style = "position:fixed;top:30%;left:50%;transform:translateX(-50%);background:#fff;border:2px solid #f00;padding:20px;border-radius:12px;z-index:10001;text-align:center";
  div.innerHTML = `
    <h3>🚨 تم الإبلاغ عن المستخدم</h3>
    <p>شكراً لتعاونك. سيتم مراجعة البلاغ.</p>
    <button onclick="this.parentElement.remove()" style="padding:6px 12px;border:none;background:#28a745;color:white;border-radius:8px;margin-top:10px">تم</button>
  `;
  document.body.appendChild(div);
}

// تحديث 307: تغيير اسم المستخدم
let currentUsername = "مستخدم";
function changeUsername() {
  const input = document.getElementById("username-input");
  if (input.value.trim() !== "") {
    currentUsername = input.value.trim();
    alert("✅ تم تحديث اسمك إلى: " + currentUsername);
  }
}

// تحديث 308: تفعيل الوضع الليلي
let darkMode = false;
function toggleDarkMode() {
  darkMode = !darkMode;
  document.body.style.backgroundColor = darkMode ? "#121212" : "#f0f8ff";
  document.body.style.color = darkMode ? "#eee" : "#333";
  document.querySelectorAll("button").forEach(btn => {
    btn.style.background = darkMode ? "#555" : "#007bff";
    btn.style.color = "#fff";
  });
}
