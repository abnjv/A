document.addEventListener('DOMContentLoaded', () => {
    const friends = [
        { id: 'friend1', name: 'علي', status: 'متصل', avatar: '🧑‍💻' },
        { id: 'friend2', name: 'محمد', status: 'يلعب', avatar: '🎮' },
        { id: 'friend3', name: 'فاطمة', status: 'متصلة الآن', avatar: '👩‍🎤' },
        { id: 'friend4', name: 'ليلى', status: 'غير متصلة', avatar: '😴' },
    ];

    const friendListContainer = document.getElementById('friend-list-container');

    function createFriendCards() {
        if (!friendListContainer) return;
        friendListContainer.innerHTML = ''; // Clear any existing content

        friends.forEach(friend => {
            const card = document.createElement('div');
            card.className = 'friend-card';
            // We need to escape the friend's data to safely pass it in the onclick attribute
            const escapedName = friend.name.replace(/'/g, "\\'");
            const escapedAvatar = friend.avatar.replace(/'/g, "\\'");
            const escapedStatus = friend.status.replace(/'/g, "\\'");

            card.setAttribute('onclick', `openChat('${friend.id}', '${escapedName}', '${escapedAvatar}', '${escapedStatus}')`);

            const cardContent = `
                <div class="friend-avatar">${friend.avatar}</div>
                <div class="friend-info">
                  <h2>${friend.name}</h2>
                  <p>${friend.status}</p>
                </div>
                <div class="friend-action">
                  <i class="fas fa-comment-dots"></i>
                </div>
            `;
            card.innerHTML = cardContent;
            friendListContainer.appendChild(card);
        });
    }

    window.openChat = (friendId, friendName, friendAvatar, friendStatus) => {
        // Store friend's info in localStorage to pass it to the chat page
        localStorage.setItem('chat_friend_id', friendId);
        localStorage.setItem('chat_friend_name', friendName);
        localStorage.setItem('chat_friend_avatar', friendAvatar);
        localStorage.setItem('chat_friend_status', friendStatus);

        window.location.href = 'private_chat.html';
    };

    createFriendCards();
});
