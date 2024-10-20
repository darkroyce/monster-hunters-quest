// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

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
        tg.ready();
        tg.setHeaderColor('#4CAF50');

        const user = tg.initDataUnsafe.user;
        if (user) {
            gameState.player.name = user.first_name;
        }

        this.generateMap();
        this.startEnergyRestoration();
        this.updateUI();

        tg.MainButton.setText('Start Game');
        tg.MainButton.onClick(this.start.bind(this));
        tg.MainButton.show();
    },

    generateMap: function() {
        const terrainTypes = ['forest', 'mountains', 'lake'];
        for (let y = 0; y < MAP_SIZE; y++) {
            gameState.map[y] = [];
            for (let x = 0; x < MAP_SIZE; x++) {
                if (x === 2 && y === 2) {
                    gameState.map[y][x] = 'town';
                } else {
                    const distanceFromCenter = Math.max(Math.abs(x - 2), Math.abs(y - 2));
                    const terrainIndex = Math.min(distanceFromCenter - 1, terrainTypes.length - 1);
                    gameState.map[y][x] = terrainTypes[terrainIndex];
                }
            }
        }
    },

    start: function() {
        tg.MainButton.hide();
        this.updateUI();
    },

    startEnergyRestoration: function() {
        setInterval(this.restoreEnergy.bind(this), 1000);
    },

    restoreEnergy: function() {
        const currentTime = Date.now();
        const elapsedMinutes = (currentTime - gameState.lastEnergyUpdateTime) / 60000;
        const energyToRestore = Math.floor(elapsedMinutes / 30);

        if (energyToRestore > 0 && gameState.player.energy < gameState.player.maxEnergy) {
            gameState.player.energy = Math.min(gameState.player.energy + energyToRestore, gameState.player.maxEnergy);
            gameState.lastEnergyUpdateTime = currentTime;
            this.updateUI();
        }
    },

    updateUI: function() {
        const currentLocation = gameMap[gameState.map[gameState.player.position.y][gameState.player.position.x]];
        const gameContainer = document.getElementById('game-container');

        let energyRestoreInfo = '';
        if (gameState.player.energy < gameState.player.maxEnergy) {
            const currentTime = Date.now();
            const minutesSinceLastRestore = (currentTime - gameState.lastEnergyUpdateTime) / 60000;
            const minutesUntilNextRestore = 30 - (minutesSinceLastRestore % 30);
            const secondsUntilNextRestore = Math.floor(minutesUntilNextRestore * 60);
            energyRestoreInfo = `<p>Next energy in: ${Math.floor(minutesUntilNextRestore)}m ${secondsUntilNextRestore % 60}s</p>`;
        }

        let mapHTML = '<div class="game-map">';
        for (let y = 0; y < MAP_SIZE; y++) {
            for (let x = 0; x < MAP_SIZE; x++) {
                const tileType = gameState.map[y][x];
                const isPlayerHere = (x === gameState.player.position.x && y === gameState.player.position.y);
                mapHTML += `<div class="map-tile ${tileType} ${isPlayerHere ? 'player' : ''}"></div>`;
            }
        }
        mapHTML += '</div>';

        gameContainer.innerHTML = `
            <h2>${currentLocation.name} (Level ${currentLocation.level})</h2>
            <p>${currentLocation.description}</p>
            ${mapHTML}
            <div class="movement-controls">
                <button onclick="game.movePlayer('up')">↑</button>
                <button onclick="game.movePlayer('left')">←</button>
                <button onclick="game.movePlayer('right')">→</button>
                <button onclick="game.movePlayer('down')">↓</button>
            </div>
            <div class="stats">
                <div class="stat">
                    <p>HP: ${gameState.player.hp}/${gameState.player.maxHp}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(gameState.player.hp / gameState.player.maxHp) * 100}%"></div>
                    </div>
                </div>
                <div class="stat">
                    <p>Energy: ${gameState.player.energy}/${gameState.player.maxEnergy}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(gameState.player.energy / gameState.player.maxEnergy) * 100}%"></div>
                    </div>
                    ${energyRestoreInfo}
                </div>
                <div class="stat">
                    <p>Level: ${gameState.player.level}</p>
                    <p>XP: ${gameState.player.xp}/${gameState.player.level * 10}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(gameState.player.xp / (gameState.player.level * 10)) * 100}%"></div>
                    </div>
                </div>
                <div class="stat">
                    <p>Attack Power: ${gameState.player.attack}</p>
                    <p>Gold: ${gameState.player.gold}</p>
                </div>
            </div>
            <div class="inventory">
                <h3>Inventory</h3>
                <p>Health Potions: ${gameState.player.inventory.healthPotion}</p>
                <p>Damage Boosters: ${gameState.player.inventory.damageBooster}</p>
                <p>Energy Potions: ${gameState.player.inventory.energyPotion}</p>
            </div>
            <div class="actions">
                <button onclick="game.exploreArea()">Explore</button>
                ${currentLocation.hasShop ? '<button onclick="game.openShop()">Open Shop</button>' : ''}
                <button onclick="game.useEnergyPotion()">Use Energy Potion</button>
                <button onclick="game.saveGame()">Save Game</button>
                <button onclick="game.loadGame()">Load Game</button>
            </div>
        `;
    },

    movePlayer: function(direction) {
        let newX = gameState.player.position.x;
        let newY = gameState.player.position.y;

        switch(direction) {
            case 'up': newY = Math.max(0, newY - 1); break;
            case 'down': newY = Math.min(MAP_SIZE - 1, newY + 1); break;
            case 'left': newX = Math.max(0, newX - 1); break;
            case 'right': newX = Math.min(MAP_SIZE - 1, newX + 1); break;
        }

        const energyCost = 1;

        if (gameState.player.energy >= energyCost) {
            if (newX !== gameState.player.position.x || newY !== gameState.player.position.y) {
                gameState.player.energy -= energyCost;
                gameState.player.position.x = newX;
                gameState.player.position.y = newY;
                this.updateUI();
            }
        } else {
            tg.showPopup({
                title: 'Not Enough Energy',
                message: "You don't have enough energy to move!",
                buttons: [{ type: 'ok' }]
            });
        }
    },

    exploreArea: function() {
        if (gameState.player.energy > 0) {
            gameState.player.energy--;
            const currentLocation = gameMap[gameState.map[gameState.player.position.y][gameState.player.position.x]];
            if (Math.random() < 0.7) {
                // 70% chance of encountering a monster
                const randomMonster = currentLocation.monsters[Math.floor(Math.random() * currentLocation.monsters.length)];
                this.startCombat(randomMonster);
            } else {
                // 30% chance of finding gold
                const goldFound = Math.floor(Math.random() * 5) + currentLocation.level * 5;
                gameState.player.gold += goldFound;
                tg.showPopup({
                    title: 'Found Gold!',
                    message: `You found ${goldFound} gold!`,
                    buttons: [{ type: 'ok' }]
                });
                this.updateUI();
            }
        } else {
            tg.showPopup({
                title: 'Not Enough Energy',
                message: "You're too tired to explore. Wait for your energy to restore or use an Energy Potion.",
                buttons: [{ type: 'ok' }]
            });
        }
    },

startCombat: function(monsterName) {
    const currentLocation = gameMap[gameState.map[gameState.player.position.y][gameState.player.position.x]];
    const areaLevel = currentLocation.level;
    let monsterHp = 30 + (areaLevel * 20);
    const monsterMaxHp = monsterHp;
    const monsterAttack = 3 + (areaLevel * 2);
    let playerAttack = gameState.player.attack;

    const updateCombatUI = () => {
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = `
            <h2>Combat with ${monsterName} (Level ${areaLevel})</h2>
            <div class="stats">
                <div class="stat">
                    <p>Your HP: ${gameState.player.hp}/${gameState.player.maxHp}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(gameState.player.hp / gameState.player.maxHp) * 100}%"></div>
                    </div>
                </div>
                <div class="stat">
                    <p>${monsterName}'s HP: ${monsterHp}/${monsterMaxHp}</p>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${(monsterHp / monsterMaxHp) * 100}%"></div>
                    </div>
                </div>
            </div>
            <p>Your Attack Power: ${playerAttack}</p>
            <p>Monster's Attack Power: ${monsterAttack}</p>
            <div class="actions">
                <button onclick="game.playerAttack()">Attack</button>
                <button onclick="game.useHealthPotion()">Use Health Potion (${gameState.player.inventory.healthPotion})</button>
                <button onclick="game.useDamageBooster()">Use Damage Booster (${gameState.player.inventory.damageBooster})</button>
                <button onclick="game.flee()">Flee</button>
            </div>
        `;
    };

        this.playerAttack = () => {
            const isCritical = Math.random() < CRIT_CHANCE;
            const damageMultiplier = isCritical ? CRIT_MULTIPLIER : 1;
            const playerDamage = playerAttack * damageMultiplier;
            monsterHp -= playerDamage;

            let attackMessage = `You hit the ${monsterName} for ${playerDamage} damage!`;
            if (isCritical) {
                attackMessage += " Critical hit!";
            }
            tg.showPopup({
                title: 'Attack',
                message: attackMessage,
                buttons: [{ type: 'ok' }]
            });

            if (monsterHp <= 0) {
                const xpGained = 10 + (areaLevel * 5);
                const goldGained = Math.floor(Math.random() * 10) + (areaLevel * 5);
                gameState.player.xp += xpGained;
                gameState.player.gold += goldGained;
                tg.showPopup({
                    title: 'Victory!',
                    message: `You defeated the ${monsterName}! You gained ${xpGained} XP and ${goldGained} gold.`,
                    buttons: [{ type: 'ok' }]
                });
                this.checkLevelUp();
                this.updateUI();
                return;
            }

            // Monster's turn
            const monsterIsCritical = Math.random() < CRIT_CHANCE;
            const monsterDamageMultiplier = monsterIsCritical ? CRIT_MULTIPLIER : 1;
            const monsterDamage = monsterAttack * monsterDamageMultiplier;
            gameState.player.hp -= monsterDamage;

            let monsterAttackMessage = `The ${monsterName} hit you for ${monsterDamage} damage!`;
            if (monsterIsCritical) {
                monsterAttackMessage += " Critical hit!";
            }
            tg.showPopup({
                title: 'Monster Attack',
                message: monsterAttackMessage,
                buttons: [{ type: 'ok' }]
            });

            if (gameState.player.hp <= 0) {
                tg.showPopup({
                    title: 'Game Over',
                    message: "You have been defeated!",
                    buttons: [{ type: 'ok' }]
                });
                this.init();
                return;
            }

            updateCombatUI();
        };

        this.useHealthPotion = () => {
            if (gameState.player.inventory.healthPotion > 0) {
                gameState.player.inventory.healthPotion--;
                gameState.player.hp = Math.min(gameState.player.hp + 50, gameState.player.maxHp);
                tg.showPopup({
                    title: 'Health Potion Used',
                    message: "You used a Health Potion and restored 50 HP!",
                    buttons: [{ type: 'ok' }]
                });
                updateCombatUI();
            } else {
                tg.showPopup({
                    title: 'No Health Potions',
                    message: "You don't have any Health Potions!",
                    buttons: [{ type: 'ok' }]
                });
            }
        };

        this.useDamageBooster = () => {
            if (gameState.player.inventory.damageBooster > 0) {
                gameState.player.inventory.damageBooster--;
                playerAttack += 5;
                tg.showPopup({
                    title: 'Damage Booster Used',
                    message: "You used a Damage Booster! Your attack increased by 5 for this battle.",
                    buttons: [{ type: 'ok' }]
                });
                updateCombatUI();
            } else {
                tg.showPopup({
                    title: 'No Damage Boosters',
                    message: "You don't have any Damage Boosters!",
                    buttons: [{ type: 'ok' }]
                });
            }
        };

        this.flee = () => {
            if (Math.random() < 0.5) {
                tg.showPopup({
                    title: 'Fled Successfully',
                    message: "You successfully fled from the battle!",
                    buttons: [{ type: 'ok' }]
                });
                this.updateUI();
            } else {
                tg.showPopup({
                    title: 'Failed to Flee',
                    message: "You failed to flee!",
                    buttons: [{ type: 'ok' }]
                });
                const monsterDamage = Math.floor(Math.random() * monsterAttack) + 1;
                gameState.player.hp -= monsterDamage;
                tg.showPopup({
                    title: 'Monster Attack',
                    message: `The ${monsterName} hit you for ${monsterDamage} damage as you tried to flee!`,
                    buttons: [{ type: 'ok' }]
                });
                if (gameState.player.hp <= 0) {
                    tg.showPopup({
                        title: 'Game Over',
                        message: "You have been defeated!",
                        buttons: [{ type: 'ok' }]
                    });
                    this.init();
                    return;
                }
                updateCombatUI();
            }
        };

        updateCombatUI();
    },

    checkLevelUp: function() {
        const xpNeeded = gameState.player.level * 10;
        if (gameState.player.xp >= xpNeeded) {
            gameState.player.level++;
            gameState.player.xp -= xpNeeded;
            gameState.player.maxHp += 10;
            gameState.player.hp = gameState.player.maxHp;
            gameState.player.attack += 2;
            tg.showPopup({
                title: 'Level Up!',
                message: `Congratulations! You've reached level ${gameState.player.level}! Your max HP increased by 10 and your attack power increased by 2.`,
                buttons: [{ type: 'ok' }]
            });
        }
    },

    useEnergyPotion: function() {
        if (gameState.player.inventory.energyPotion > 0) {
            gameState.player.inventory.energyPotion--;
            gameState.player.energy = Math.min(gameState.player.energy + 5, gameState.player.maxEnergy);
            tg.showPopup({
                title: 'Energy Potion Used',
                message: "You used an Energy Potion and restored 5 Energy!",
                buttons: [{ type: 'ok' }]
            });
            this.updateUI();
        } else {
            tg.showPopup({
                title: 'No Energy Potions',
                message: "You don't have any Energy Potions!",
                buttons: [{ type: 'ok' }]
            });
        }
    },

    openShop: function() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.innerHTML = `
            <h2>Shop</h2>
            <p>Your Gold: ${gameState.player.gold}</p>
            <div class="inventory">
                <h3>Your Inventory</h3>
                <p>Health Potions: ${gameState.player.inventory.healthPotion}</p>
                <p>Damage Boosters: ${gameState.player.inventory.damageBooster}</p>
                <p>Energy Potions: ${gameState.player.inventory.energyPotion}</p>
            </div>
            ${Object.entries(shopItems).map(([itemId, item]) =>
                `<div class="shop-item">
                    <div>
                        <p>${item.name} - ${item.price} gold</p>
                        <p>${item.effect}</p>
                    </div>
                    <button onclick="game.buyItem('${itemId}')">Buy</button>
                </div>`
            ).join('')}
            <button onclick="game.updateUI()">Leave Shop</button>
        `;
    },

    buyItem: function(itemId) {
        const item = shopItems[itemId];
        if (gameState.player.gold >= item.price) {
            gameState.player.gold -= item.price;
            gameState.player.inventory[itemId]++;
            tg.showPopup({
                title: 'Item Purchased',
                message: `You bought a ${item.name}!`,
                buttons: [{ type: 'ok' }]
            });
            this.openShop(); // Refresh the shop display
        } else {
            tg.showPopup({
                title: 'Not Enough Gold',
                message: "You don't have enough gold!",
                buttons: [{ type: 'ok' }]
            });
        }
    },

    saveGame: function() {
        const gameStateString = JSON.stringify(gameState);
        tg.CloudStorage.setItem('gameState', gameStateString)
            .then(() => {
                tg.showPopup({
                    title: 'Game Saved',
                    message: 'Game saved successfully!',
                    buttons: [{ type: 'ok' }]
                });
            })
            .catch((error) => {
                console.error('Error saving game:', error);
                tg.showPopup({
                    title: 'Save Failed',
                    message: 'Failed to save game. Please try again.',
                    buttons: [{ type: 'ok' }]
                });
            });
    },

    loadGame: function() {
        tg.CloudStorage.getItem('gameState')
            .then((savedState) => {
                if (savedState) {
                    gameState = JSON.parse(savedState);
                    this.updateUI();
                    tg.showPopup({
                        title: 'Game Loaded',
                        message: 'Game loaded successfully!',
                        buttons: [{ type: 'ok' }]
                    });
                } else {
                    tg.showPopup({
                        title: 'No Saved Game',
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
    game.init();
});
