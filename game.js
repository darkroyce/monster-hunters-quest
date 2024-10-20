
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
        tg.ready().then(() => {
            console.log("Telegram WebApp is ready.");
            
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                let user = tg.initDataUnsafe.user;
                console.log("User info retrieved:", user);
                
                document.getElementById('status-message').style.display = 'none';
                document.getElementById('game-home').style.display = 'block';
                document.getElementById('telegram-name').textContent = user.first_name;
                document.getElementById('telegram-id').textContent = user.id;
                
                // Future: TON interactions and cloud storage
                prepareForTON(user.id, user.first_name);
            } else {
                console.log("No user info found.");
                document.getElementById('status-message').textContent = 'Please connect to Telegram to play the game.';
            }
        }).catch((error) => {
            console.error("Error during Telegram readiness:", error);
            document.getElementById('status-message').textContent = 'Error during Telegram readiness: ' + error.message;
        });
    } catch (error) {
        console.error('Error during Telegram connection:', error);
        document.getElementById('status-message').textContent = 'Error during Telegram connection: ' + error.message;
    }
}

// Simulated future function for handling TON and user data
function prepareForTON(telegramId, name) {
    try {
        // Placeholder for future TON interactions
        console.log('User data to be handled via TON:', telegramId, name);
        // Future implementation: Handling token transactions, DApp interactions, and storage
    } catch (error) {
        console.error('Failed to prepare for TON interactions:', error);
    }
}

// Run the connection check when the page loads
document.addEventListener('DOMContentLoaded', checkTelegramConnection);
