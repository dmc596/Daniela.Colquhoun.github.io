// All game variables scoped to this file
let pokeNames = [], gamePool = [], activePkmn = null;
let currentStreak = 0, gameLives = 3, modeChoice = 'unlimited';

async function initGame() {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1028');
    const data = await res.json();
    pokeNames = data.results.map(p => p.name);
}

function setMode(m) {
    modeChoice = m;
    document.getElementById('filter-settings').classList.remove('hidden');
}

async function startGame() {
    const region = document.getElementById('region-filter').value;
    gamePool = Array.from({length: 1028}, (_, i) => i + 1); // Default pool
    
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    nextRound();
}

async function nextRound() {
    const id = gamePool[Math.floor(Math.random() * gamePool.length)];
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    activePkmn = await res.json();

    const sprite = document.getElementById('poke-sprite');
    sprite.src = activePkmn.sprites.other['official-artwork'].front_default;
    sprite.classList.remove('revealed');
    
    fillButtons();
}

function fillButtons() {
    const grid = document.getElementById('button-grid');
    grid.innerHTML = '';
    const choices = [activePkmn.name];
    while(choices.length < 4) {
        let rand = pokeNames[Math.floor(Math.random() * 1028)];
        if(!choices.includes(rand)) choices.push(rand);
    }
    choices.sort(() => Math.random() - 0.5).forEach(name => {
        const btn = document.createElement('button');
        btn.innerText = name.toUpperCase();
        btn.onclick = () => {
            if(name === activePkmn.name) {
                currentStreak++;
                document.getElementById('current-score').innerText = currentStreak;
                document.getElementById('poke-sprite').classList.add('revealed');
                setTimeout(nextRound, 1200);
            } else {
                showGameOver();
            }
        };
        grid.appendChild(btn);
    });
}

function showGameOver() {
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = currentStreak;
}

initGame();