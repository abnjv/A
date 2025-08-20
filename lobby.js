document.addEventListener('DOMContentLoaded', () => {

    // Get all chat cards
    const chatCards = document.querySelectorAll('.chat-card');

    // Add a click event listener to each chat card
    chatCards.forEach((card, index) => {
        card.addEventListener('click', () => {
            // In a real application, you would get the room ID from a data attribute on the card.
            // For now, we'll use a hardcoded ID based on the card's position.
            const roomId = `room${index + 1}`;
            console.log(`Entering room: ${roomId}`);

            // Store the selected room ID so the room page can use it.
            // (Note: the current room page is not yet configured to use this)
            localStorage.setItem('selectedRoomId', roomId);

            // Redirect to the room page
            window.location.href = 'room.html';
        });
    });

    // Optional: You could add functionality for the search bar or sidebar icons here
    // For now, they are not functional as per the plan.

});
