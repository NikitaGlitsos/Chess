/* Шапка при скролле */
const header = document.getElementById('header');
let lastScrolled = false;
let ticking = false;

window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const isScrolled = window.scrollY > 30;
    if (isScrolled !== lastScrolled) {
      header.classList.toggle('scrolled', isScrolled);
      lastScrolled = isScrolled;
    }
    ticking = false;
  });
}, { passive: true });

/* Бургер */
const burger = document.getElementById('burger');
const navList = document.getElementById('navList');

if (burger && navList) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    navList.classList.toggle('open');
  });

  navList.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navList.classList.remove('open');
    })
  );
}

/* Модальное окно */
const modal = document.getElementById('modal');
const modalForm = document.getElementById('modalForm');
const modalSuccess = document.getElementById('modalSuccess');

let selectedCoach = '';   // глобальная переменная — хранит имя выбранного тренера

function openModal(coachName) {
  if (!modal) return;

  // Если имя передали — запоминаем, иначе сбрасываем
  selectedCoach = coachName || '';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (modalForm) modalForm.style.display = 'block';
  if (modalSuccess) modalSuccess.style.display = 'none';

  const form = document.getElementById('joinForm');
  if (form) form.reset();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  selectedCoach = '';   // сбрасываем при закрытии
}

if (modal) {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
}

/* Карточки тренеров — клик для открытия */
/* ===== Карточки тренеров — открытие только по тапу на телефоне ===== */

// Проверяем, тач-устройство ли это
const isTouchDevice = window.matchMedia('(hover: none)').matches;

if (isTouchDevice) {
  const coachCards = document.querySelectorAll('.coach');

  coachCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Не мешаем кликам по ссылкам и кнопкам внутри
      if (e.target.closest('a, button')) return;

      const isOpen = card.classList.contains('active');

      // Закрываем все остальные
      coachCards.forEach(c => c.classList.remove('active'));

      // Если была закрыта — открываем
      if (!isOpen) card.classList.add('active');
    });
  });

  // Тап вне карточки — закрываем всё
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.coach')) {
      coachCards.forEach(c => c.classList.remove('active'));
    }
  });
}

/* ===== Кнопки "Записаться" под тренерами ===== */

document.querySelectorAll('.coach-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Берём имя тренера из <h3> внутри той же карточки
    const card = btn.closest('.coach');
    const coachName = card ? card.querySelector('h3').textContent.trim() : '';

    openModal(coachName);
  });
});