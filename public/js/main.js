/* Отправка форм */

/* Заявка на урок */
const joinForm = document.getElementById('joinForm');
if (joinForm) {
  joinForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.disabled = true;
    btn.textContent = 'Отправляем...';

    // Если тренер не выбран — '—'
    const coach = (typeof selectedCoach !== 'undefined' && selectedCoach) ? selectedCoach : '—';

    const data = {
      name:    form.name.value.trim(),
      contact: form.contact.value.trim(),
      coach:   coach
    };

    console.log('Отправляем:', data);   // ← для отладки — увидишь в консоли

    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();

      if (result.ok) {
        modalForm.style.display = 'none';
        modalSuccess.style.display = 'block';
      } else {
        alert('Ошибка: ' + (result.error || 'Попробуйте позже'));
      }
    } catch (err) {
      alert('Сеть недоступна. Попробуйте позже.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

/* Регистрация (демо) */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Аккаунт создан! Добро пожаловать в «Гамбит» ♞');
    e.target.reset();
  });
}