// ============ MENU NAVIGATION ============
const mainMenu = document.getElementById('mainMenu');
const startGameMenu = document.getElementById('startGameMenu');
const playersMenu = document.getElementById('playersMenu');
const rolesMenu = document.getElementById('rolesMenu');
const settingsMenu = document.getElementById('settingsMenu');

const startGameBtn = document.getElementById('startGameBtn');
const playersBtn = document.getElementById('playersBtn');
const rolesBtn = document.getElementById('rolesBtn');
const settingsBtn = document.getElementById('settingsBtn');

const startGameBackBtn = document.getElementById('startGameBackBtn');
const playersBackBtn = document.getElementById('playersBackBtn');
const rolesBackBtn = document.getElementById('rolesBackBtn');
const settingsBackBtn = document.getElementById('settingsBackBtn');

const addPlayerBtn = document.getElementById('addPlayerBtn');
const removePlayerBtn = document.getElementById('removePlayerBtn');
const playerList = document.getElementById('playerList');

const gameContent = document.getElementById('gameContent');
const startBtns = document.getElementById('startBtns');
const confirmStartBtn = document.getElementById('confirmStartBtn');

function showMenu(menu) {
    mainMenu.classList.remove('onscreen');
    mainMenu.classList.add('offscreen-left');
    menu.classList.remove('offscreen-right');
    menu.classList.add('onscreen');
}

function showStartGame() {
    mainMenu.classList.remove('onscreen');
    mainMenu.classList.add('offscreen-right');
    startGameMenu.classList.remove('offscreen-left');
    startGameMenu.classList.add('onscreen');
}

function showMain() {
    [playersMenu, rolesMenu, settingsMenu].forEach(menu => {
        menu.classList.remove('onscreen');
        menu.classList.add('offscreen-right');
    });
    startGameMenu.classList.remove('onscreen');
    startGameMenu.classList.add('offscreen-left');
    mainMenu.classList.remove('offscreen-left', 'offscreen-right');
    mainMenu.classList.add('onscreen');
    resetStartGameUI();
}

startGameBtn && startGameBtn.addEventListener('click', showStartGame);
playersBtn && playersBtn.addEventListener('click', () => showMenu(playersMenu));
rolesBtn && rolesBtn.addEventListener('click', () => showMenu(rolesMenu));
settingsBtn && settingsBtn.addEventListener('click', () => showMenu(settingsMenu));

startGameBackBtn && startGameBackBtn.addEventListener('click', showMain);
playersBackBtn && playersBackBtn.addEventListener('click', showMain);
rolesBackBtn && rolesBackBtn.addEventListener('click', showMain);
settingsBackBtn && settingsBackBtn.addEventListener('click', showMain);

// ============ PLAYERS ============
function updatePlayerListLayout() {
    const inputs = playerList.querySelectorAll('.player-input');
    const count = inputs.length;
    const cols = Math.ceil(count / 3);
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;

    playerList.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const fontSize = isLandscape
        ? Math.max(1.5, 2.5 - (cols - 1) * 0.5) + 'vh'
        : Math.max(3, 7 - (cols - 1) * 2) + 'vw';

    const height = isLandscape
        ? Math.max(7, 10 - (cols - 1) * 2) + 'vh'
        : Math.max(14, 20 - (cols - 1) * 3) + 'vw';

    inputs.forEach(el => {
        el.style.fontSize = fontSize;
        el.style.height = height;
    });
}

window.addEventListener('resize', updatePlayerListLayout);

addPlayerBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.classList.add('player-input');
    input.placeholder = 'Player Name';
    playerList.insertBefore(input, playerList.firstChild);
    updatePlayerListLayout();
    input.focus();
});

removePlayerBtn.addEventListener('click', () => {
    if (playerList.firstChild) {
        playerList.removeChild(playerList.firstChild);
        updatePlayerListLayout();
    }
});

// ============ SETTINGS TOGGLES ============
const physicalCardsSwitch = document.getElementById('physicalCardsSwitch');
const physicalCardsLabel = document.getElementById('physicalCardsLabel');
const rolesToggleWrapper = document.getElementById('rolesToggleWrapper');
const modeToggle = document.getElementById('modeToggle');

if (physicalCardsSwitch) {
    physicalCardsSwitch.addEventListener('change', () => {
        const haveCards = !physicalCardsSwitch.checked;
        physicalCardsLabel.textContent = haveCards ? 'Have Physical Cards' : 'Lack Physical Cards';
        if (haveCards) {
            modeToggle.classList.add('slide-out');
            rolesToggleWrapper.classList.add('collapsed');
        } else {
            modeToggle.classList.remove('slide-out');
            rolesToggleWrapper.classList.remove('collapsed');
        }
    });
}

let rolesAuto = false;
const switchInput = document.getElementById('manualAutoSwitch');
const modeLabel = document.getElementById('modeLabel');

if (switchInput && modeLabel) {
    switchInput.addEventListener('change', () => {
        rolesAuto = switchInput.checked;
        modeLabel.textContent = rolesAuto ? 'Roles: Auto' : 'Roles: Manual';
    });
}

// ============ ROLE TOGGLES ============
let nightWatchmen = true;
let doctor = true;
let sheriff = false;
let mafiaCountManual = false;
let manualMafiaCount = 1;

const nightWatchmenToggle = document.getElementById('nightWatchmenToggle');
const doctorToggle = document.getElementById('doctorToggle');
const sheriffToggle = document.getElementById('sheriffToggle');
const mafiaCountSwitch = document.getElementById('mafiaCountSwitch');
const mafiaCountLabel = document.getElementById('mafiaCountLabel');
const mafiaCountWrapper = document.getElementById('mafiaCountWrapper');
const mafiaCountInput = document.getElementById('mafiaCountInput');

nightWatchmenToggle && nightWatchmenToggle.addEventListener('change', () => {
    nightWatchmen = nightWatchmenToggle.checked;
});

doctorToggle && doctorToggle.addEventListener('change', () => {
    doctor = doctorToggle.checked;
});

sheriffToggle && sheriffToggle.addEventListener('change', () => {
    sheriff = sheriffToggle.checked;
});

mafiaCountSwitch && mafiaCountSwitch.addEventListener('change', () => {
    mafiaCountManual = mafiaCountSwitch.checked;
    mafiaCountLabel.textContent = mafiaCountManual ? 'Mafia Count: Manual' : 'Mafia Count: Auto';
    mafiaCountWrapper.classList.toggle('expanded', mafiaCountManual);
});

mafiaCountInput && mafiaCountInput.addEventListener('change', () => {
    manualMafiaCount = Math.max(1, parseInt(mafiaCountInput.value) || 1);
    mafiaCountInput.value = manualMafiaCount;
});

// ============ GAME STATE ============
const gameState = {
    phase: 'idle',
    players: [],
    alivePlayers: [],
    mafiaPlayers: [],
    mafiaCount: 1,
    nwPlayer: null,
    doctorPlayer: null,
    sheriffPlayer: null,
    killTarget: null,
    saveTarget: null,
    checkTarget: null,
    sheriffKillTarget: null,
    sheriffUsedShot: false,
    round: 0,
    rolesRegistered: false,
    lpc_assignIndex: 0
};

function getMafiaCount(playerCount) {
    if (playerCount <= 5) return 1;
    return Math.floor(playerCount / 6);
}

function aliveMafia() {
    return gameState.mafiaPlayers.filter(p => gameState.alivePlayers.includes(p));
}

function aliveTown() {
    return gameState.alivePlayers.filter(p => !gameState.mafiaPlayers.includes(p));
}

function isRoleAlive(playerName) {
    return playerName !== null && gameState.alivePlayers.includes(playerName);
}

function checkRolesRegistered() {
    if (gameState.mafiaPlayers.length >= gameState.mafiaCount &&
        (!nightWatchmen || gameState.nwPlayer !== null) &&
        (!doctor || gameState.doctorPlayer !== null) &&
        (!sheriff || gameState.sheriffPlayer !== null)) {
        gameState.rolesRegistered = true;
    }
}

function resetStartGameUI() {
    startBtns.classList.remove('slide-down');
    gameContent.classList.remove('active');
    gameContent.innerHTML = '';
}

function getPlayerNames() {
    const inputs = Array.from(playerList.querySelectorAll('.player-input'));
    return inputs.map((input, i) => input.value.trim() || `Player ${i + 1}`).reverse();
}

// ============ CONFIRM START ============
confirmStartBtn && confirmStartBtn.addEventListener('click', () => {
    const players = getPlayerNames();

    if (players.length < 4) {
        alert('You need at least 4 players to play!');
        return;
    }

    const mafiaCount = mafiaCountManual ? manualMafiaCount : getMafiaCount(players.length);
    const minNeeded = mafiaCount + (nightWatchmen ? 1 : 0) + (doctor ? 1 : 0) + (sheriff ? 1 : 0) + 1;
    if (players.length < minNeeded) {
        alert(`Not enough players for the selected roles! You need at least ${minNeeded} players.`);
        return;
    }

    gameState.players = players;
    gameState.alivePlayers = [...players];
    gameState.mafiaPlayers = [];
    gameState.mafiaCount = mafiaCount;
    gameState.nwPlayer = null;
    gameState.doctorPlayer = null;
    gameState.sheriffPlayer = null;
    gameState.killTarget = null;
    gameState.saveTarget = null;
    gameState.checkTarget = null;
    gameState.sheriffKillTarget = null;
    gameState.sheriffUsedShot = false;
    gameState.round = 1;
    gameState.rolesRegistered = false;
    gameState.lpc_assignIndex = 0;

    startBtns.classList.add('slide-down');
    gameContent.classList.add('active');

    const haveCards = !physicalCardsSwitch.checked;
    if (haveCards) {
        gameState.phase = 'setup1';
    } else if (rolesAuto) {
        gameState.phase = 'lpc_auto_assign';
    } else {
        gameState.phase = 'lpc_manual_mafia';
    }
    renderPhase();
});

// ============ GAME HELPERS ============
function showMessage(text, next) {
    const btnLabel = next !== null ? 'Continue' : 'Back to Menu';
    gameContent.innerHTML = `
        <p class="game-message">${text}</p>
        <button class="btn" id="continueBtn">${btnLabel}</button>
    `;
    const btn = document.getElementById('continueBtn');
    if (typeof next === 'string') {
        btn.addEventListener('click', () => {
            gameState.phase = next;
            renderPhase();
        });
    } else if (typeof next === 'function') {
        btn.addEventListener('click', next);
    } else {
        btn.addEventListener('click', showMain);
    }
}

function applyGridLayout(listEl, playerCount) {
    const cols = Math.ceil(playerCount / 3);
    const isLandscape = window.matchMedia('(orientation: landscape)').matches;

    listEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    const fontSize = isLandscape
        ? Math.max(1.5, 3 - (cols - 1) * 0.5) + 'vh'
        : Math.max(3, 5 - (cols - 1)) + 'vw';

    const height = isLandscape
        ? Math.max(8, 14 - (cols - 1) * 2) + 'vh'
        : Math.max(14, 20 - (cols - 1) * 3) + 'vw';

    listEl.querySelectorAll('.player-select-item').forEach(el => {
        el.style.fontSize = fontSize;
        el.style.height = height;
    });
}

function showPlayerSelect(prompt, players, onConfirm) {
    const items = players.map((p, i) => `
        <div class="player-select-item" data-index="${i}">
            <span>${p}</span>
            <span class="select-mark">○</span>
        </div>
    `).join('');

    gameContent.innerHTML = `
        <p class="game-message">${prompt}</p>
        <div class="player-select-list">${items}</div>
        <button class="btn" id="confirmSelectBtn" disabled>Confirm</button>
    `;

    let selectedIndex = null;
    const itemEls = gameContent.querySelectorAll('.player-select-item');
    const confirmBtn = document.getElementById('confirmSelectBtn');

    applyGridLayout(gameContent.querySelector('.player-select-list'), players.length);

    itemEls.forEach(item => {
        item.addEventListener('click', () => {
            itemEls.forEach(el => {
                el.classList.remove('selected');
                el.querySelector('.select-mark').textContent = '○';
            });
            item.classList.add('selected');
            item.querySelector('.select-mark').textContent = '✓';
            selectedIndex = parseInt(item.dataset.index);
            confirmBtn.disabled = false;
        });
    });

    confirmBtn.addEventListener('click', () => {
        if (selectedIndex !== null) onConfirm(players[selectedIndex]);
    });
}

function showMultiPlayerSelect(prompt, players, count, onConfirm) {
    const items = players.map((p, i) => `
        <div class="player-select-item" data-index="${i}">
            <span>${p}</span>
            <span class="select-mark">○</span>
        </div>
    `).join('');

    gameContent.innerHTML = `
        <p class="game-message">${prompt}<br><span style="font-size:4vw;color:#aaa;">Select ${count}</span></p>
        <div class="player-select-list">${items}</div>
        <button class="btn" id="confirmSelectBtn" disabled>Confirm</button>
    `;

    const selected = new Set();
    const itemEls = gameContent.querySelectorAll('.player-select-item');
    const confirmBtn = document.getElementById('confirmSelectBtn');

    applyGridLayout(gameContent.querySelector('.player-select-list'), players.length);

    itemEls.forEach(item => {
        item.addEventListener('click', () => {
            const idx = parseInt(item.dataset.index);
            if (selected.has(idx)) {
                selected.delete(idx);
                item.classList.remove('selected');
                item.querySelector('.select-mark').textContent = '○';
            } else if (selected.size < count) {
                selected.add(idx);
                item.classList.add('selected');
                item.querySelector('.select-mark').textContent = '✓';
            }
            confirmBtn.disabled = selected.size !== count;
        });
    });

    confirmBtn.addEventListener('click', () => {
        if (selected.size === count) onConfirm([...selected].map(i => players[i]));
    });
}

// ============ GAME RENDER ============
function renderPhase() {
    switch (gameState.phase) {

        // ---- LPC AUTO ----
        case 'lpc_auto_assign': {
            const shuffled = [...gameState.alivePlayers].sort(() => Math.random() - 0.5);
            let idx = 0;
            gameState.mafiaPlayers = shuffled.slice(idx, idx + gameState.mafiaCount);
            idx += gameState.mafiaCount;
            if (nightWatchmen) { gameState.nwPlayer = shuffled[idx++]; }
            if (doctor)        { gameState.doctorPlayer = shuffled[idx++]; }
            if (sheriff)       { gameState.sheriffPlayer = shuffled[idx++]; }
            gameState.rolesRegistered = true;
            gameState.lpc_assignIndex = 0;
            gameState.phase = 'lpc_reveal_pass';
            renderPhase();
            break;
        }

        case 'lpc_reveal_pass': {
            const player = gameState.players[gameState.lpc_assignIndex];
            showMessage(`Pass this to ${player} to receive their role.`, () => {
                gameState.phase = 'lpc_reveal_role';
                renderPhase();
            });
            break;
        }

        case 'lpc_reveal_role': {
            const player = gameState.players[gameState.lpc_assignIndex];
            let role = 'Townsperson';
            if (gameState.mafiaPlayers.includes(player))  role = '🔴 Mafia';
            else if (player === gameState.nwPlayer)        role = '🔵 Night Watchmen';
            else if (player === gameState.doctorPlayer)    role = '🟢 Doctor';
            else if (player === gameState.sheriffPlayer)   role = '⭐ Sheriff';

            showMessage(`Your role is:<br><br><strong>${role}</strong><br><br>Remember your role, then press continue.`, () => {
                gameState.lpc_assignIndex++;
                if (gameState.lpc_assignIndex < gameState.players.length) {
                    gameState.phase = 'lpc_reveal_pass';
                } else {
                    gameState.phase = 'lpc_manual_done';
                }
                renderPhase();
            });
            break;
        }

        // ---- LPC MANUAL ----
        case 'lpc_manual_mafia': {
            const label = gameState.mafiaCount === 1
                ? 'Select the Mafia player.'
                : `Select the ${gameState.mafiaCount} Mafia players.`;
            showMultiPlayerSelect(label, gameState.alivePlayers, gameState.mafiaCount, (selected) => {
                gameState.mafiaPlayers = selected;
                if (nightWatchmen)     gameState.phase = 'lpc_manual_nw';
                else if (doctor)       gameState.phase = 'lpc_manual_doctor';
                else if (sheriff)      gameState.phase = 'lpc_manual_sheriff';
                else                   gameState.phase = 'lpc_manual_done';
                renderPhase();
            });
            break;
        }

        case 'lpc_manual_nw': {
            const candidates = gameState.alivePlayers.filter(p => !gameState.mafiaPlayers.includes(p));
            showPlayerSelect("Select the Night Watchmen.", candidates, (selected) => {
                gameState.nwPlayer = selected;
                if (doctor)       gameState.phase = 'lpc_manual_doctor';
                else if (sheriff) gameState.phase = 'lpc_manual_sheriff';
                else              gameState.phase = 'lpc_manual_done';
                renderPhase();
            });
            break;
        }

        case 'lpc_manual_doctor': {
            const candidates = gameState.alivePlayers.filter(p =>
                !gameState.mafiaPlayers.includes(p) && p !== gameState.nwPlayer
            );
            showPlayerSelect("Select the Doctor.", candidates, (selected) => {
                gameState.doctorPlayer = selected;
                gameState.phase = sheriff ? 'lpc_manual_sheriff' : 'lpc_manual_done';
                renderPhase();
            });
            break;
        }

        case 'lpc_manual_sheriff': {
            const candidates = gameState.alivePlayers.filter(p =>
                !gameState.mafiaPlayers.includes(p) &&
                p !== gameState.nwPlayer &&
                p !== gameState.doctorPlayer
            );
            showPlayerSelect("Select the Sheriff.", candidates, (selected) => {
                gameState.sheriffPlayer = selected;
                gameState.phase = 'lpc_manual_done';
                renderPhase();
            });
            break;
        }

        case 'lpc_manual_done':
            gameState.rolesRegistered = true;
            showMessage("All roles assigned. Everyone else is a Townsperson. Begin the night.", 'night_wake_mafia');
            break;

        // ---- SETUP (HAVE PHYSICAL CARDS) ----
        case 'setup1':
            showMessage("Tell everyone to go to sleep, and pass out cards.", 'setup2');
            break;

        case 'setup2': {
            let msg = 'Allow everyone to wake up. Let everyone know that Ace is Mafia';
            if (nightWatchmen) msg += ', King is Night Watchmen';
            if (doctor)        msg += ', Queen is Doctor';
            if (sheriff)       msg += ', Jack is Sheriff';
            msg += '.';
            showMessage(msg, 'setup3');
            break;
        }

        case 'setup3':
            showMessage("Tell everyone to go to sleep.", 'night_wake_mafia');
            break;

        // ---- NIGHT: MAFIA ----
        case 'night_wake_mafia':
            showMessage("Tell everyone to go to sleep.", () => {
                showMessage("Wake up the Mafia.", () => {
                    gameState.phase = gameState.rolesRegistered ? 'night_mafia_kill_prompt' : 'night_register_mafia';
                    renderPhase();
                });
            });
            break;

        case 'night_register_mafia': {
            const label = gameState.mafiaCount === 1
                ? 'Press the Mafia.'
                : `Press the ${gameState.mafiaCount} Mafia players.`;
            showMultiPlayerSelect(label, gameState.alivePlayers, gameState.mafiaCount, (selected) => {
                gameState.mafiaPlayers = selected;
                checkRolesRegistered();
                gameState.phase = 'night_mafia_kill_prompt';
                renderPhase();
            });
            break;
        }

        case 'night_mafia_kill_prompt':
            showMessage("Ask the Mafia who they want to kill.", 'night_mafia_kill_select');
            break;

        case 'night_mafia_kill_select': {
            const targets = aliveTown();
            showPlayerSelect("Who does the Mafia want to kill?", targets, (selected) => {
                gameState.killTarget = selected;
                if (nightWatchmen)     gameState.phase = 'night_nw_wake';
                else if (doctor)       gameState.phase = 'night_doctor_wake';
                else if (sheriff)      gameState.phase = 'night_sheriff_wake';
                else                   gameState.phase = 'day_announce';
                renderPhase();
            });
            break;
        }

        // ---- NIGHT: NIGHT WATCHMEN ----
        case 'night_nw_wake':
            showMessage("Tell the Mafia to go to sleep and tell the Night Watchmen to wake up.", () => {
                if (!gameState.rolesRegistered) {
                    gameState.phase = 'night_register_nw';
                } else if (isRoleAlive(gameState.nwPlayer)) {
                    gameState.phase = 'night_nw_check';
                } else {
                    gameState.phase = 'night_nw_sleep';
                }
                renderPhase();
            });
            break;

        case 'night_register_nw': {
            const candidates = gameState.alivePlayers.filter(p => !gameState.mafiaPlayers.includes(p));
            showPlayerSelect("Press the Night Watchmen.", candidates, (selected) => {
                gameState.nwPlayer = selected;
                checkRolesRegistered();
                gameState.phase = 'night_nw_check';
                renderPhase();
            });
            break;
        }

        case 'night_nw_check': {
            const targets = gameState.alivePlayers.filter(p => p !== gameState.nwPlayer);
            showPlayerSelect("Who does the Night Watchmen want to check?", targets, (selected) => {
                gameState.checkTarget = selected;
                gameState.phase = 'night_nw_result';
                renderPhase();
            });
            break;
        }

        case 'night_nw_result': {
            const isMafia = gameState.mafiaPlayers.includes(gameState.checkTarget);
            const msg = isMafia
                ? "👍 Give a thumbs up to the Night Watchmen."
                : "👎 Give a thumbs down to the Night Watchmen.";
            showMessage(msg, () => {
                if (doctor)       gameState.phase = 'night_doctor_wake';
                else if (sheriff) gameState.phase = 'night_sheriff_wake';
                else              gameState.phase = 'day_announce';
                renderPhase();
            });
            break;
        }

        case 'night_nw_sleep': {
            const next = doctor ? 'night_doctor_wake' : (sheriff ? 'night_sheriff_wake' : 'day_announce');
            showMessage("Tell the Night Watchmen to go to sleep.", next);
            break;
        }

        // ---- NIGHT: DOCTOR ----
        case 'night_doctor_wake': {
            const msg = (nightWatchmen && isRoleAlive(gameState.nwPlayer))
                ? "Tell the Night Watchmen to go to sleep and wake up the Doctor."
                : "Wake up the Doctor.";
            showMessage(msg, () => {
                if (!gameState.rolesRegistered) {
                    gameState.phase = 'night_register_doctor';
                } else if (isRoleAlive(gameState.doctorPlayer)) {
                    gameState.phase = 'night_doctor_save';
                } else {
                    gameState.phase = 'night_doctor_sleep';
                }
                renderPhase();
            });
            break;
        }

        case 'night_register_doctor': {
            const candidates = gameState.alivePlayers.filter(p =>
                !gameState.mafiaPlayers.includes(p) && p !== gameState.nwPlayer
            );
            showPlayerSelect("Press the Doctor.", candidates, (selected) => {
                gameState.doctorPlayer = selected;
                checkRolesRegistered();
                gameState.phase = 'night_doctor_save';
                renderPhase();
            });
            break;
        }

        case 'night_doctor_save': {
            showPlayerSelect("Who does the Doctor want to save?", gameState.alivePlayers, (selected) => {
                gameState.saveTarget = selected;
                gameState.phase = 'night_doctor_sleep';
                renderPhase();
            });
            break;
        }

        case 'night_doctor_sleep': {
            const next = sheriff ? 'night_sheriff_wake' : 'day_announce';
            showMessage("Tell the Doctor to go to sleep.", next);
            break;
        }

        // ---- NIGHT: SHERIFF ----
        case 'night_sheriff_wake': {
            let msg;
            if (doctor && isRoleAlive(gameState.doctorPlayer)) {
                msg = "Tell the Doctor to go to sleep and wake up the Sheriff.";
            } else if (nightWatchmen && isRoleAlive(gameState.nwPlayer) && !doctor) {
                msg = "Tell the Night Watchmen to go to sleep and wake up the Sheriff.";
            } else {
                msg = "Wake up the Sheriff.";
            }
            showMessage(msg, () => {
                if (!gameState.rolesRegistered) {
                    gameState.phase = 'night_register_sheriff';
                } else if (isRoleAlive(gameState.sheriffPlayer) && !gameState.sheriffUsedShot) {
                    gameState.phase = 'night_sheriff_choice';
                } else {
                    gameState.phase = 'night_sheriff_sleep';
                }
                renderPhase();
            });
            break;
        }

        case 'night_register_sheriff': {
            const candidates = gameState.alivePlayers.filter(p =>
                !gameState.mafiaPlayers.includes(p) &&
                p !== gameState.nwPlayer &&
                p !== gameState.doctorPlayer
            );
            showPlayerSelect("Press the Sheriff.", candidates, (selected) => {
                gameState.sheriffPlayer = selected;
                checkRolesRegistered();
                gameState.phase = 'night_sheriff_choice';
                renderPhase();
            });
            break;
        }

        case 'night_sheriff_choice': {
            gameContent.innerHTML = `
                <p class="game-message">Ask the Sheriff if they want to use their shot.</p>
                <button class="btn" id="sheriffYesBtn">Yes</button>
                <button class="btn" id="sheriffNoBtn">No</button>
            `;
            document.getElementById('sheriffYesBtn').addEventListener('click', () => {
                gameState.phase = 'night_sheriff_kill_select';
                renderPhase();
            });
            document.getElementById('sheriffNoBtn').addEventListener('click', () => {
                gameState.phase = 'night_sheriff_sleep';
                renderPhase();
            });
            break;
        }

        case 'night_sheriff_kill_select': {
            const targets = gameState.alivePlayers.filter(p => p !== gameState.sheriffPlayer);
            showPlayerSelect("Who does the Sheriff want to shoot?", targets, (selected) => {
                gameState.sheriffKillTarget = selected;
                gameState.sheriffUsedShot = true;
                gameState.phase = 'night_sheriff_sleep';
                renderPhase();
            });
            break;
        }

        case 'night_sheriff_sleep':
            showMessage("Tell the Sheriff to go to sleep.", 'day_announce');
            break;

        // ---- DAY ----
        case 'day_announce': {
            const dead = gameState.killTarget;
            const saved = gameState.saveTarget;
            const sheriffTarget = gameState.sheriffKillTarget;

            const announcements = [];

            // Resolve mafia kill
            if (saved && dead === saved) {
                announcements.push(`There was an attempted murder on ${dead}, but they were saved by the Doctor.`);
            } else {
                announcements.push(`${dead} was murdered by the Mafia.`);
                gameState.alivePlayers = gameState.alivePlayers.filter(p => p !== dead);
            }

            // Resolve sheriff kill
            if (sheriffTarget) {
                const doctorSavedTarget = saved === sheriffTarget;
                const doctorSavedSheriff = saved === gameState.sheriffPlayer;

                if (gameState.mafiaPlayers.includes(sheriffTarget)) {
                    if (doctorSavedTarget) {
                        announcements.push(`${sheriffTarget} was shot by the Sheriff, but was saved by the Doctor!`);
                    } else {
                        announcements.push(`${sheriffTarget} was shot by the Sheriff and revealed to be Mafia!`);
                        gameState.alivePlayers = gameState.alivePlayers.filter(p => p !== sheriffTarget);
                    }
                } else {
                    // Sheriff shot an innocent
                    if (doctorSavedTarget && doctorSavedSheriff) {
                        announcements.push(`${sheriffTarget} was shot by the Sheriff but saved by the Doctor. The Sheriff was also saved by the Doctor from execution.`);
                    } else if (doctorSavedTarget) {
                        announcements.push(`${sheriffTarget} was shot by the Sheriff but was saved by the Doctor. The Sheriff has been executed for shooting an innocent townsperson.`);
                        gameState.alivePlayers = gameState.alivePlayers.filter(p => p !== gameState.sheriffPlayer);
                    } else if (doctorSavedSheriff) {
                        announcements.push(`${sheriffTarget} was shot by the Sheriff and was innocent. The Sheriff would have been executed, but was saved by the Doctor.`);
                        gameState.alivePlayers = gameState.alivePlayers.filter(p => p !== sheriffTarget);
                    } else {
                        announcements.push(`${sheriffTarget} was shot by the Sheriff, but was innocent. The Sheriff has been executed for killing an innocent townsperson.`);
                        gameState.alivePlayers = gameState.alivePlayers.filter(p =>
                            p !== sheriffTarget && p !== gameState.sheriffPlayer
                        );
                    }
                }
            }

            const announcement = announcements.join('<br><br>');

            if (aliveMafia().length === 0) {
                showMessage(`Tell everyone to wake up.<br><br>${announcement}<br><br>The Mafia Does Not Remain. Town wins! 🎉`, null);
                break;
            }
            if (aliveTown().length === 0) {
                showMessage(`Tell everyone to wake up.<br><br>${announcement}<br><br>The Mafia has overwhelmed the town. Mafia wins! 🔴`, null);
                break;
            }

            showMessage(`Tell everyone to wake up.<br><br>${announcement}`, 'day_discuss');
            break;
        }

        case 'day_discuss':
            showMessage("Tell everyone to discuss.", 'day_vote');
            break;

        case 'day_vote':
            showPlayerSelect("Who did the townspeople vote out?", gameState.alivePlayers, (selected) => {
                gameState.alivePlayers = gameState.alivePlayers.filter(p => p !== selected);

                if (aliveMafia().length === 0) {
                    showMessage("The Mafia Does Not Remain. Town wins! 🎉", null);
                } else if (aliveTown().length === 0) {
                    showMessage("The Mafia Remains.<br><br>The townspeople have been overwhelmed. Mafia wins! 🔴", null);
                } else {
                    showMessage("The Mafia Remains.", () => {
                        gameState.round++;
                        gameState.killTarget = null;
                        gameState.saveTarget = null;
                        gameState.checkTarget = null;
                        gameState.sheriffKillTarget = null;
                        gameState.phase = 'night_wake_mafia';
                        renderPhase();
                    });
                }
            });
            break;
    }
}