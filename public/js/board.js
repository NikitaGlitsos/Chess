/* Построение шахматной доски + анимация фигур + счётчики статистики */

const PIECES = {
  K:'♔', Q:'♕', R:'♖', B:'♗', N:'♘', P:'♙',
  k:'♔', q:'♕', r:'♖', b:'♗', n:'♘', p:'♙'
};

const LAYOUT = [
  ['r','n','b','q','k','b','n','r'],
  ['p','p','p','p','p','p','p','p'],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null],
  ['P','P','P','P','P','P','P','P'],
  ['R','N','B','Q','K','B','N','R'],
];

(function buildBoard() {
  const board = document.getElementById('board');
  if (!board) return;

  const frag = document.createDocumentFragment();
  const pieces = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell ' + ((r + c) % 2 === 0 ? 'l' : 'd');

      const code = LAYOUT[r][c];
      if (code) {
        const isWhite = code === code.toUpperCase();
        const piece = document.createElement('span');
        piece.className = 'piece ' + (isWhite ? 'w' : 'b');
        piece.textContent = PIECES[code];
        cell.appendChild(piece);
        pieces.push(piece);
      }
      frag.appendChild(cell);
    }
  }

  board.appendChild(frag);

  const startTime = performance.now();
  const STAGGER = 25;
  const TOTAL = pieces.length;

  function reveal(now) {
    const elapsed = now - startTime;
    const visible = Math.min(TOTAL, Math.floor(elapsed / STAGGER));
    for (let i = 0; i < visible; i++) pieces[i].classList.add('show');
    if (visible < TOTAL) requestAnimationFrame(reveal);
  }
  requestAnimationFrame(reveal);
})();

/* Счётчики статистики */

const counters = document.querySelectorAll('.stat-num');
let countersStarted = false;

function animateCounter(el) {
  const target = +el.dataset.target;
  let current = 0;
  const step = Math.max(1, Math.round(target / 50));
  const tick = () => {
    current += step;
    if (current >= target) { el.textContent = target; return; }
    el.textContent = current;
    requestAnimationFrame(tick);
  };
  tick();
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !countersStarted) {
      countersStarted = true;
      counters.forEach(animateCounter);
      io.disconnect();
    }
  });
}, { threshold: 0.4 });

if (counters.length) io.observe(counters[0].closest('.hero-stats'));