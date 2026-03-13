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
    playerList.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const fontSize = Math.max(3, 7 - (cols - 1) * 2);
    const height = Math.max(14, 20 - (cols - 1) * 3);
    inputs.forEach(el => {
        el.style.fontSize = `${fontSize}vw`;
        el.style.height = `${height}vw`;
    });
}

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

const nightWatchmenToggle = document.getElementById('nightWatchmenToggle');
const doctorToggle = document.getElementById('doctorToggle');

nightWatchmenToggle && nightWatchmenToggle.addEventListener('change', () => {
    nightWatchmen = nightWatchmenToggle.checked;
});

doctorToggle && doctorToggle.addEventListener('change', () => {
    doctor = doctorToggle.checked;
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
    killTarget: null,
    saveTarget: null,
    checkTarget: null,
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
        (!doctor || gameState.doctorPlayer !== null)) {
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

    const mafiaCount = getMafiaCount(players.length);
    const minNeeded = mafiaCount + (nightWatchmen ? 1 : 0) + (doctor ? 1 : 0) + 1;
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
    gameState.killTarget = null;
    gameState.saveTarget = null;
    gameState.checkTarget = null;
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
    listEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    const fontSize = Math.max(3, 5 - (cols - 1));
    const height = Math.max(14, 20 - (cols - 1) * 3);
    listEl.querySelectorAll('.player-select-item').forEach(el => {
        el.style.fontSize = `${fontSize}vw`;
        el.style.height = `${height}vw`;
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
            if (doctor) { gameState.doctorPlayer = shuffled[idx++]; }
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
            if (gameState.mafiaPlayers.includes(player)) role = '🔴 Mafia';
            else if (player === gameState.nwPlayer) role = '🔵 Night Watchmen';
            else if (player === gameState.doctorPlayer) role = '🟢 Doctor';

            showMessage(`Your role is:<br><br><strong>${role}</strong><br><br>Remember your role, then pass the phone back.`, () => {
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
                if (nightWatchmen) {
                    gameState.phase = 'lpc_manual_nw';
                } else if (doctor) {
                    gameState.phase = 'lpc_manual_doctor';
                } else {
                    gameState.phase = 'lpc_manual_done';
                }
                renderPhase();
            });
            break;
        }

        case 'lpc_manual_nw': {
            const candidates = gameState.alivePlayers.filter(p => !gameState.mafiaPlayers.includes(p));
            showPlayerSelect("Select the Night Watchmen.", candidates, (selected) => {
                gameState.nwPlayer = selected;
                gameState.phase = doctor ? 'lpc_manual_doctor' : 'lpc_manual_done';
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
            if (doctor) msg += ', Queen is Doctor';
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
                const nwActive = nightWatchmen && (isRoleAlive(gameState.nwPlayer) || !gameState.rolesRegistered);
                const docActive = doctor && (isRoleAlive(gameState.doctorPlayer) || !gameState.rolesRegistered);
                if (nwActive) {
                    gameState.phase = 'night_nw_wake';
                } else if (docActive) {
                    gameState.phase = 'night_doctor_wake';
                } else {
                    gameState.phase = 'day_announce';
                }
                renderPhase();
            });
            break;
        }

        // ---- NIGHT: NIGHT WATCHMEN ----
        case 'night_nw_wake':
            showMessage("Tell the Mafia to go to sleep and tell the Night Watchmen to wake up.", () => {
                gameState.phase = gameState.rolesRegistered ? 'night_nw_check' : 'night_register_nw';
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
                const docActive = doctor && (isRoleAlive(gameState.doctorPlayer) || !gameState.rolesRegistered);
                gameState.phase = docActive ? 'night_doctor_wake' : 'day_announce';
                renderPhase();
            });
            break;
        }

        // ---- NIGHT: DOCTOR ----
        case 'night_doctor_wake': {
            const msg = (nightWatchmen && isRoleAlive(gameState.nwPlayer))
                ? "Tell the Night Watchmen to go to sleep and wake up the Doctor."
                : "Wake up the Doctor.";
            showMessage(msg, () => {
                gameState.phase = gameState.rolesRegistered ? 'night_doctor_save' : 'night_register_doctor';
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
            const targets = gameState.alivePlayers;
            showPlayerSelect("Who does the Doctor want to save?", targets, (selected) => {
                gameState.saveTarget = selected;
                gameState.phase = 'night_doctor_sleep';
                renderPhase();
            });
            break;
        }

        case 'night_doctor_sleep':
            showMessage("Tell the Doctor to go to sleep.", 'day_announce');
            break;

        // ---- DAY ----
        case 'day_announce': {
            const dead = gameState.killTarget;
            const saved = gameState.saveTarget;
            let announcement;
            if (saved && dead === saved) {
                announcement = `There was an attempted murder on ${dead}, but they were saved by the Doctor.`;
            } else {
                announcement = `${dead} was murdered.`;
                gameState.alivePlayers = gameState.alivePlayers.filter(p => p !== dead);
            }

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
                        gameState.phase = 'night_wake_mafia';
                        renderPhase();
                    });
                }
            });
            break;
    }
}