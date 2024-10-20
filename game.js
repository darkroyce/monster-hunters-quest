// Initialize Telegram WebApp
let tg;
try {
    tg = window.Telegram.WebApp;
    console.log('Telegram WebApp initialized successfully.');
} catch (error) {
    console.error('Failed to initialize Telegram WebApp:', error);
    document.getElementById('status-message').textContent = 'Failed to initialize Telegram WebApp. Please open this in Telegram.';
}

// Check Telegram connection and show user info
function checkTelegramConnection() {
    try {
        tg.ready();
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            let user = tg.initDataUnsafe.user;
            document.getElementById('status-message').style.display = 'none';
            document.getElementById('game-home').style.display = 'block';
            document.getElementById('telegram-name').textContent = user.first_name;
            document.getElementById('telegram-id').textContent = user.id;
        } else {
            document.getElementById('status-message').textContent = 'Please connect to Telegram to play the game.';
        }
    } catch (error) {
        console.error('Error during Telegram connection:', error);
        document.getElementById('status-message').textContent = 'Error during Telegram connection: ' + error.message;
    }
}

// Run the connection check when the page loads
document.addEventListener('DOMContentLoaded', checkTelegramConnection);
