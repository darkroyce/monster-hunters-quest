
// Initialize Telegram WebApp
let tg;
try {
    tg = window.Telegram.WebApp;
} catch (error) {
    console.error('Failed to initialize Telegram WebApp:', error);
    document.getElementById('error-display').textContent = 'Failed to initialize Telegram WebApp. Please make sure you are opening this in Telegram.';
}

// Constants
const CRIT_CHANCE = 0.2;
const CRIT_MULTIPLIER = 2;
const MAP_SIZE = 5;

// Game state
let gameState = {
    player: {
        name: '',
        hp: 100,
        maxHp: 100,
        attack: 10,
        energy: 10,
        maxEnergy: 10,
        level: 1,
        xp: 0,
        gold: 50,
        inventory: {
            healthPotion: 0,
            damageBooster: 0,
            energyPotion: 0
        },
        position: { x: 2, y: 2 }
    },
    lastEnergyUpdateTime: Date.now(),
    map: []
};

// Game map
const gameMap = {
    town: {
        name: "Town Center",
        description: "A safe starting point with a shop.",
        monsters: ["Stray Dog", "Angry Cat"],
        level: 1,
        hasShop: true
    },
    forest: {
        name: "Dark Forest",
        description: "A spooky forest with dense trees.",
        monsters: ["Wolf", "Bear"],
        level: 2
    },
    mountains: {
        name: "Rocky Mountains",
        description: "Treacherous peaks with hidden caves.",
        monsters: ["Mountain Lion", "Eagle"],
        level: 3
    },
    lake: {
        name: "Misty Lake",
        description: "A serene lake shrouded in mist.",
        monsters: ["Giant Fish", "Water Serpent"],
        level: 4
    }
};

// Shop items
const shopItems = {
    healthPotion: { name: "Health Potion", price: 20, effect: "Restores 50 HP" },
    damageBooster: { name: "Damage Booster", price: 30, effect: "Increases attack by 5 for one battle" },
    energyPotion: { name: "Energy Potion", price: 25, effect: "Restores 5 Energy" }
};

// Game functions
const game = {
    init: function() {
        console.log("Initializing game...");
        document.getElementById('game-container').innerHTML = '<p>Initializing game...</p>';
        
        try {
            if (!window.Telegram || !window.Telegram.WebApp) {
                throw new Error('Telegram WebApp not available');
            }
            console.log("Telegram WebApp available");
            tg = window.Telegram.WebApp;
            
            console.log("Calling tg.ready()");
            tg.ready();
            console.log("Telegram WebApp ready");
            
            console.log("Setting header color");
            tg.setHeaderColor('#4CAF50');
    
            console.log("Checking user connection...");
            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                console.log("User connected, loading game");
                document.getElementById('game-container').innerHTML = '<p>Loading saved game...</p>';
                
                this.loadGame().then(() => {
                    console.log("Game loaded, starting game");
                    this.startGame();
                }).catch(error => {
                    console.error("Error loading game:", error);
                    document.getElementById('game-container').innerHTML = '<p>Error loading game. Please try again.</p>';
                });
            } else {
                console.log("User not connected, showing connection prompt");
                document.getElementById('game-container').innerHTML = '<p>Please connect your Telegram account.</p>';
                
                tg.showPopup({
                    title: 'Connect Telegram Account',
                    message: 'Please connect your Telegram account to play the game.',
                    buttons: [
                        {text: 'Connect', type: 'ok'},
                        {text: 'Cancel', type: 'close'}
                    ]
                }, (buttonId) => {
                    if (buttonId === 'ok') {
                        console.log("User clicked Connect, requesting write access");
                        tg.requestWriteAccess((result) => {
                            if (result) {
                                console.log("Write access granted, loading game");
                                this.loadGame().then(() => {
                                    this.startGame();
                                }).catch(error => {
                                    console.error("Error loading game after granting access:", error);
                                    document.getElementById('game-container').innerHTML = '<p>Error loading game. Please try again.</p>';
                                });
                            } else {
                                console.log("Write access denied");
                                tg.showAlert('Failed to connect Telegram account. Please try again.');
                            }
                        });
                    } else {
                        console.log("User cancelled connection");
                        tg.showAlert('You need to connect your Telegram account to play the game.');
                        tg.close();
                    }
                });
            }
        } catch (error) {
            console.error('Error in game initialization:', error);
            document.getElementById('game-container').innerHTML = 'Error initializing game: ' + error.message;
        }
    },
    
    // Other game functions...
    
    autoSave: function() {
        const gameStateString = JSON.stringify(gameState);
        tg.CloudStorage.setItem('gameState', gameStateString)
            .catch((error) => {
                console.error('Error auto-saving game:', error);
            });
    },

    loadGame: function() {
        return tg.CloudStorage.getItem('gameState')
            .then((savedState) => {
                if (savedState) {
                    gameState = JSON.parse(savedState);
                    tg.showPopup({
                        title: 'Game Loaded',
                        message: 'Your previous game has been loaded.',
                        buttons: [{ type: 'ok' }]
                    });
                } else {
                    tg.showPopup({
                        title: 'New Game',
                        message: 'No saved game found. Starting a new game.',
                        buttons: [{ type: 'ok' }]
                    });
                }
            })
            .catch((error) => {
                console.error('Error loading game:', error);
                tg.showPopup({
                    title: 'Load Failed',
                    message: 'Failed to load game. Starting a new game.',
                    buttons: [{ type: 'ok' }]
                });
            });
    }
};

// Initialize the game when the script loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        game.init();
    } catch (error) {
        console.error('Error during game initialization:', error);
        document.getElementById('error-display').textContent = 'Error during game initialization: ' + error.message;
    }
});
