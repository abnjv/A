document.addEventListener('DOMContentLoaded', () => {
    // --- State and Variables ---
    let db;
    let auth;
    let userId;
    let friendId;
    let chatRoomId;
    let unsubscribeMessages;

    const chatHeaderName = document.getElementById('chat-friend-name');
    const chatHeaderStatus = document.getElementById('chat-friend-status');
    const chatHeaderAvatar = document.getElementById('chat-avatar');
    const messagesContainer = document.getElementById('chat-messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // --- Initialization ---

    function initializeChatPage() {
        // 1. Get friend's info from localStorage
        friendId = localStorage.getItem('chat_friend_id');
        const friendName = localStorage.getItem('chat_friend_name');
        const friendAvatar = localStorage.getItem('chat_friend_avatar');
        const friendStatus = localStorage.getItem('chat_friend_status');

        if (!friendId || !friendName) {
            messagesContainer.innerHTML = '<p>لم يتم تحديد صديق. يرجى العودة واختيار محادثة.</p>';
            return;
        }

        // 2. Update UI with friend's info
        chatHeaderName.innerText = friendName;
        chatHeaderStatus.innerText = friendStatus;
        chatHeaderAvatar.innerText = friendAvatar;

        // 3. Initialize Firebase
        initializeFirebase();
    }

    function initializeFirebase() {
        if (typeof firebase === 'undefined') {
            console.error('Firebase SDK not loaded.');
            return;
        }

        // Use the global config from the user's instructions
        if (typeof __firebase_config !== 'undefined') {
            try {
                const firebaseConfig = JSON.parse(__firebase_config);
                const app = firebase.initializeApp(firebaseConfig);
                auth = firebase.auth();
                db = firebase.firestore();

                // 4. Authenticate user
                setupAuthListener();

            } catch (e) {
                console.error("Failed to initialize Firebase:", e);
            }
        } else {
            console.error("Firebase config (__firebase_config) is not available.");
        }
    }

    function setupAuthListener() {
        auth.onAuthStateChanged(user => {
            if (user) {
                userId = user.uid;
                // 5. Determine Chat Room ID and Fetch Messages
                determineChatRoomAndFetchMessages();
            } else {
                // Sign in anonymously if no user
                auth.signInAnonymously().catch(error => {
                    console.error("Anonymous sign-in failed:", error);
                });
            }
        });
    }

    function determineChatRoomAndFetchMessages() {
        if (!userId || !friendId) return;

        // Create a consistent, unique chat room ID by sorting the user IDs
        const ids = [userId, friendId].sort();
        chatRoomId = ids.join('_');

        // Unsubscribe from any previous listener
        if (unsubscribeMessages) {
            unsubscribeMessages();
        }

        // Get the app ID from the global variable
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const messagesPath = `artifacts/${appId}/private_chats/${chatRoomId}/messages`;

        const messagesRef = db.collection(messagesPath);
        const q = messagesRef.orderBy("timestamp", "asc");

        // 6. Set up the real-time listener
        unsubscribeMessages = q.onSnapshot(querySnapshot => {
            messagesContainer.innerHTML = ''; // Clear previous messages
            querySnapshot.forEach(doc => {
                renderMessage(doc.data());
            });
            // Scroll to the bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    }

    // --- UI and Rendering ---

    function renderMessage(data) {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message');

        if (data.senderId === userId) {
            msgDiv.classList.add('my-message');
        } else {
            msgDiv.classList.add('other-message');
        }

        const textP = document.createElement('p');
        textP.innerText = data.text;
        msgDiv.appendChild(textP);

        messagesContainer.appendChild(msgDiv);
    }

    // --- Event Handling ---

    async function handleSendMessage() {
        const text = messageInput.value.trim();
        if (!text || !db || !userId || !chatRoomId) return;

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const messagesPath = `artifacts/${appId}/private_chats/${chatRoomId}/messages`;

        try {
            await db.collection(messagesPath).add({
                text: text,
                senderId: userId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            messageInput.value = ''; // Clear input
        } catch (e) {
            console.error("Error sending message: ", e);
        }
    }

    sendButton.addEventListener('click', handleSendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // --- Start the application ---
    initializeChatPage();
});
