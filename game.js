// Game state
let player = {
    position: { x: 2, y: 2 }, // Starting at the city (middle of the map)
    energy: 10,
    health: 100,
    gold: 50,
    damage: 10
};

const mapSize = 5;
const map = Array.from({ length: mapSize }, () => Array(mapSize).fill({ visited: false }));

map[2][2] = { type: 'city', visited: true }; // Starting tile is a city

// Generate the game grid
const gameBoard = document.getElementById('game-board');
function renderMap() {
    gameBoard.innerHTML = '';
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            if (map[y][x].visited) {
                tile.classList.add(map[y][x].type || 'visited');
            }
            gameBoard.appendChild(tile);
        }
    }
}

function movePlayer(dx, dy) {
    const newX = player.position.x + dx;
    const newY = player.position.y + dy;

    // Ensure player stays within bounds
    if (newX >= 0 && newX < mapSize && newY >= 0 && newY < mapSize) {
        player.position.x = newX;
        player.position.y = newY;
        if (!map[newY][newX].visited) {
            map[newY][newX] = { visited: true, type: Math.random() < 0.1 ? 'city' : 'visited' };
        }

        player.energy -= 1; // Reduce energy by 1 per move
        updateStatus();
        renderMap();
    }
}

function updateStatus() {
    document.getElementById('energy').innerText = player.energy;
    document.getElementById('health').innerText = player.health;
    document.getElementById('gold').innerText = player.gold;
}

// Event listeners for navigation buttons
document.getElementById('up-btn').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('down-btn').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('left-btn').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('right-btn').addEventListener('click', () => movePlayer(1, 0));

// Hunt system
document.getElementById('hunt-btn').addEventListener('click', () => {
    const outcome = Math.random();
    if (outcome < 0.25) {
        player.gold += Math.floor(Math.random() * 20) + 1;
        alert('You found gold!');
    } else if (outcome < 0.5) {
        player.energy += 1;
        alert('You found some energy!');
    } else if (outcome < 0.75) {
        alert('You found nothing.');
    } else {
        // Monster encounter
        let fleeSuccess = Math.random() < 0.5;
        if (fleeSuccess) {
            alert('You fled successfully!');
        } else {
            fightMonster();
        }
    }
    updateStatus();
});

function fightMonster() {
    let monsterHealth = 50;
    while (player.health > 0 && monsterHealth > 0) {
        monsterHealth -= player.damage;
        if (monsterHealth <= 0) {
            alert('You defeated the monster!');
            break;
        }
        player.health -= Math.floor(Math.random() * 10) + 5; // Monster attacks back
        if (player.health <= 0) {
            alert('You were defeated by the monster!');
            break;
        }
    }
    updateStatus();
}

// Initial rendering
renderMap();
updateStatus();
