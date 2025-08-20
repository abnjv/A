// Function to show a custom message box
function showMessage(text) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    messageText.textContent = text;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, 3000); // Hide after 3 seconds
}

document.addEventListener('DOMContentLoaded', () => {
    // Get the pages
    const initialButtonsPage = document.getElementById('initial-buttons-page');
    const fullLoginPage = document.getElementById('full-login-page');
    const mainAppPage = document.getElementById('main-app-page');

    // Get the buttons and forms
    const showLoginFormBtnMain = document.getElementById('show-login-form-main');
    const showLoginFormBtnLobby = document.getElementById('show-login-form-lobby');
    const loginForm = document.getElementById('login-form');

    // Function to handle showing the login form
    function showLoginForm() {
        // Hide the initial buttons page
        initialButtonsPage.classList.add('hidden');
        // Show the full login form page
        fullLoginPage.classList.remove('hidden');
        fullLoginPage.classList.add('flex', 'flex-col', 'items-center', 'justify-center');
    }

    // Add click event listeners to both buttons
    showLoginFormBtnMain.addEventListener('click', showLoginForm);
    showLoginFormBtnLobby.addEventListener('click', showLoginForm);

    // Add a submit event listener to the full login form
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const roomName = document.getElementById('roomName').value;
        const password = document.getElementById('password').value;

        // Simple validation: check if fields are not empty
        if (username && roomName && password) {
            console.log('Login successful for:', username);

            // Save username for other pages to use
            localStorage.setItem('username', username);

            showMessage('تم تسجيل الدخول بنجاح! جاري توجيهك إلى الردهة...');

            // Redirect to the lobby page after a short delay
            setTimeout(() => {
                window.location.href = 'lobby.html';
            }, 1500);

        } else {
            showMessage('الرجاء إدخال جميع البيانات المطلوبة.');
        }
    });
});
