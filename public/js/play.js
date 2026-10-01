/* Игра с ИИ через Stockfish */

const game = new Chess();

const board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDrop: onDrop,
  onSnapEnd: () => board.position(game.fen()),
  pieceTheme: 'https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/website/img/chesspieces/wikipedia/{piece}.png'
});

/* Движок Stockfish */
let engine = null;
let engineReady = false;
let waitingForEngine = false;

function initEngine() {
  // Загружаем Stockfish через CDN
  engine = new Worker('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js');

  engine.onmessage = (e) => {
    const line = typeof e.data === 'string' ? e.data : e.data.toString();

    if (line === 'uciok') {
      engineReady = true;
      engine.postMessage('setoption name UCI_LimitStrength value true');
      setLevel();
    }

    if (line.startsWith('bestmove')) {
      const move = line.split(' ')[1];
      if (!move || move === '(none)') return;

      game.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: 'q'
      });
      board.position(game.fen(), false);
      updateStatus();
      waitingForEngine = false;
    }
  };

  engine.postMessage('uci');
}

initEngine();

/* Уровень */
function setLevel() {
  const elo = document.getElementById('level').value;
  engine.postMessage(`setoption name UCI_Elo value ${elo}`);
}

document.getElementById('level').onchange = () => {
  if (engineReady) setLevel();
};

/* Ход игрока */
function onDrop(source, target) {
  if (waitingForEngine) return 'snapback';

  const move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';

  updateStatus();

  if (!game.game_over()) {
    waitingForEngine = true;
    setTimeout(engineMove, 250);
  }

  return undefined;
}

/* Ход ИИ */
function engineMove() {
  if (game.game_over() || !engine) return;
  engine.postMessage('position fen ' + game.fen());
  engine.postMessage('go movetime 800');
}

/* Статус */
function updateStatus() {
  const el = document.getElementById('status');
  let text = '';
  let color = '';

  if (game.in_checkmate()) {
    if (game.turn() === 'w') {
      text = '♛ Мат. Победил ИИ.';
      color = 'err';
    } else {
      text = '🏆 Мат! Вы победили!';
      color = 'ok';
    }
  } else if (game.in_draw()) {
    text = '🤝 Ничья.';
    color = '';
  } else if (game.in_check()) {
    text = game.turn() === 'w' ? '⚠️ Вам шах!' : '⚠️ Шах ИИ';
  } else {
    text = game.turn() === 'w' ? 'Ваш ход' : 'Ход ИИ...';
  }

  el.textContent = text;
  el.className = 'play-status' + (color ? ' ' + color : '');
}

/* Новая партия */
document.getElementById('resetBtn').onclick = () => {
  game.reset();
  board.position('start');
  waitingForEngine = false;
  document.getElementById('status').textContent = 'Ваш ход';
};

/* Пересчёт размера доски при ресайзе */
window.addEventListener('resize', () => {
  board.resize();
});