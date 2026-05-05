let allPokemon = [], pool = [], current = null;
let streak = 0, lives = 3, mode = 'unlimited', timerInterval, timeLeft = 10;

async function initGame() {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1100');
    const data = await res.json();
    allPokemon = data.results;
}

function setMode(m) {
    mode = m;
    document.getElementById('filter-settings').classList.remove('hidden');
    document.querySelector('.mode-select').classList.add('hidden');
}

async function startGame() {
    const reg = document.getElementById('region-filter').value;
    const type = document.getElementById('type-filter').value;
    const genRanges = {
        "1": [1, 151], "2": [152, 251], "3": [252, 386], "4": [387, 493], "5": [494, 649],
        "6": [650, 721], "7": [722, 809], "8": [810, 905], "9": [906, 1025], "10": [1026, 1100]
    };

    let baseIds = (reg === "all") ? Array.from({length: 1100}, (_, i) => i + 1) : 
        Array.from({length: genRanges[reg][1] - genRanges[reg][0] + 1}, (_, i) => i + genRanges[reg][0]);

    if (type !== "all") {
        const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const typeData = await typeRes.json();
        const typeIds = typeData.pokemon.map(p => {
            const parts = p.pokemon.url.split('/');
            return parseInt(parts[parts.length - 2]);
        });
        pool = baseIds.filter(id => typeIds.includes(id));
    } else { pool = baseIds; }

    if (pool.length < 4) { alert("Not enough Pokémon found! Try a broader filter."); return; }
    if (mode === 'timed') { document.getElementById('timer-wrapper').classList.remove('hidden'); updateLives(); }
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    nextRound();
}

async function nextRound() {
    clearInterval(timerInterval);
    const randomId = pool[Math.floor(Math.random() * pool.length)];
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    current = await res.json();
    document.getElementById('poke-sprite').src = current.sprites.other['official-artwork'].front_default;
    document.getElementById('poke-sprite').classList.remove('revealed');
    if (mode === 'timed') startTimer();
    setupChoices();
}

function startTimer() {
    timeLeft = 10;
    const display = document.getElementById('timer-display');
    display.innerText = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        display.innerText = timeLeft;
        if (timeLeft <= 0) { clearInterval(timerInterval); handleWrong(); }
    }, 1000);
}

function setupChoices() {
    const grid = document.getElementById('button-grid');
    grid.innerHTML = '';
    let choices = [current.name];
    while(choices.length < 4) {
        let r = allPokemon[Math.floor(Math.random() * allPokemon.length)].name;
        if(!choices.includes(r)) choices.push(r);
    }
    choices.sort(() => Math.random() - 0.5).forEach(name => {
        const btn = document.createElement('button');
        btn.className = "mode-btn"; // Using existing button styles
        btn.innerText = name.replace(/-/g, ' ').toUpperCase();
        btn.onclick = () => (name === current.name) ? handleRight() : handleWrong();
        grid.appendChild(btn);
    });
}

function handleRight() {
    streak++;
    document.getElementById('current-score').innerText = streak;
    document.getElementById('poke-sprite').classList.add('revealed');
    setTimeout(nextRound, 1200);
}

function handleWrong() {
    if (mode === 'timed') {
        lives--; updateLives();
        if (lives <= 0) gameOver(); else nextRound();
    } else { gameOver(); }
}

function updateLives() { document.getElementById('lives-display').innerText = "❤️".repeat(Math.max(0, lives)); }

function gameOver() {
    clearInterval(timerInterval);
    document.getElementById('game-container').classList.add('hidden');
    document.getElementById('game-over-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = streak;
}

initGame();