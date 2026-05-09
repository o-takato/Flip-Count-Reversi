const GRID = 8;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

let board = [];
let turn = 'black';
let mode = 'pvp';
let isGameOver = false;

const ui = {
    board: document.getElementById('board'),
    status: document.getElementById('status-msg'),
    blackScore: document.getElementById('black-score'),
    whiteScore: document.getElementById('white-score'),
    modeLabel: document.getElementById('game-mode-label'),
    menu: document.getElementById('start-menu'),
    blackCard: document.getElementById('black-card'),
    whiteCard: document.getElementById('white-card')
};

// 初期設定
window.onload = () => {
    document.getElementById('btn-cpu').onclick = () => { mode = 'cpu'; start(); };
    document.getElementById('btn-pvp').onclick = () => { mode = 'pvp'; start(); };
};

function start() {
    ui.menu.style.display = 'none';
    ui.modeLabel.innerText = mode === 'cpu' ? 'CPU MODE' : 'PVP MODE';
    resetGame();
}

function resetGame() {
    board = Array(GRID).fill().map(() => Array(GRID).fill(null));
    // 初期配置
    board[3][3] = { color: 'white', count: 0 };
    board[3][4] = { color: 'black', count: 0 };
    board[4][3] = { color: 'black', count: 0 };
    board[4][4] = { color: 'white', count: 0 };
    
    turn = 'black';
    isGameOver = false;
    render();
}

function getFlips(r, c, color) {
    if (board[r][c]) return [];
    let totalFlips = [];
    for (const [dr, dc] of DIRS) {
        let temp = [], cr = r + dr, cc = c + dc;
        while (cr >= 0 && cr < GRID && cc >= 0 && cc < GRID && board[cr][cc] && board[cr][cc].color !== color) {
            temp.push([cr, cc]);
            cr += dr; cc += dc;
        }
        if (temp.length > 0 && cr >= 0 && cr < GRID && cc >= 0 && cc < GRID && board[cr][cc] && board[cr][cc].color === color) {
            totalFlips = totalFlips.concat(temp);
        }
    }
    return totalFlips;
}

function placePiece(r, c) {
    const flips = getFlips(r, c, turn);
    if (flips.length === 0) return;

    board[r][c] = { color: turn, count: 0 };
    flips.forEach(([fr, fc]) => {
        board[fr][fc].color = turn;
        board[fr][fc].count += 1; // ここがFlip Count独自のルール
    });

    turn = turn === 'black' ? 'white' : 'black';
    
    // パス判定
    if (!canMove(turn)) {
        turn = turn === 'black' ? 'white' : 'black';
        if (!canMove(turn)) isGameOver = true;
    }

    render();

    if (!isGameOver && mode === 'cpu' && turn === 'white') {
        setTimeout(cpuMove, 600);
    }
}

function canMove(color) {
    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            if (getFlips(r, c, color).length > 0) return true;
        }
    }
    return false;
}

function cpuMove() {
    let best = null, maxVal = -1;
    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            const flips = getFlips(r, c, 'white');
            if (flips.length > 0) {
                // Flip Countルールに基づき、反転履歴の合計が高い手を選ぶ
                const val = flips.reduce((s, [fr, fc]) => s + board[fr][fc].count, 0);
                if (val > maxVal) { maxVal = val; best = {r, c}; }
            }
        }
    }
    if (best) placePiece(best.r, best.c);
}

function render() {
    ui.board.innerHTML = '';
    let bs = 0, ws = 0;

    for (let r = 0; r < GRID; r++) {
        for (let c = 0; c < GRID; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const p = board[r][c];

            if (p) {
                const div = document.createElement('div');
                div.className = `piece ${p.color}`;
                div.innerText = p.count;
                cell.appendChild(div);
                if (p.color === 'black') bs += p.count; else ws += p.count;
            } else if (!isGameOver) {
                const flips = getFlips(r, c, turn);
                if (flips.length > 0 && (mode === 'pvp' || turn === 'black')) {
                    const hint = document.createElement('div');
                    hint.className = 'hint-dot';
                    hint.onclick = () => placePiece(r, c);
                    cell.appendChild(hint);
                }
            }
            ui.board.appendChild(cell);
        }
    }

    ui.blackScore.innerText = bs;
    ui.whiteScore.innerText = ws;
    ui.blackCard.classList.toggle('active-turn', turn === 'black');
    ui.whiteCard.classList.toggle('active-turn', turn === 'white');
    ui.status.innerText = isGameOver ? "ゲーム終了！" : `${turn === 'black' ? '黒' : '白'}の番です`;
}