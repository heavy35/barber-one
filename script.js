const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const dialog = document.querySelector('#booking');
const form = document.querySelector('#booking-form');
const result = document.querySelector('#booking-result');
const progress = document.querySelector('.scroll-progress');

document.querySelector('#year').textContent = new Date().getFullYear();
const today = new Date();
form.elements.date.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

function closeMenu() {
  nav.classList.remove('is-open');
  header.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
}
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  header.classList.toggle('menu-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 700) closeMenu(); });

document.querySelectorAll('[data-booking]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.service) form.elements.service.value = button.dataset.service;
  result.hidden = true;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}));
function closeDialog() { dialog.close(); document.body.classList.remove('dialog-open'); }
document.querySelector('.dialog-close').addEventListener('click', closeDialog);
dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const name = String(data.get('name')).trim();
  if (name.length < 2) {
    form.elements.name.setCustomValidity('Введите хотя бы 2 символа');
    form.reportValidity();
    return;
  }
  form.elements.name.setCustomValidity('');
  result.textContent = `${name}, демо запись сохранена в этом браузере: ${data.get('service')}, ${data.get('date')} в ${data.get('time')}. Это не подтверждённая запись.`;
  result.hidden = false;
  try { sessionStorage.setItem('barber-one-demo-booking', JSON.stringify(Object.fromEntries(data))); } catch (_) { /* Хранилище может быть недоступно. */ }
});
form.elements.name.addEventListener('input', () => form.elements.name.setCustomValidity(''));

let scrollFrame = 0;
function updateScroll() {
  header.classList.toggle('is-scrolled', window.scrollY > 30);
  const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, window.scrollY / maxScroll))})`;
  scrollFrame = 0;
}
function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
updateScroll();

// Блоки анимируются и при прокрутке вниз, и при возвращении вверх.
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const items = document.querySelectorAll('[data-reveal]');
  document.querySelectorAll('.service-row, .space-points span').forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`);
  });
  items.forEach(item => {
    const rect = item.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight * 0.94) item.classList.add('is-visible');
    else if (rect.bottom <= 0) item.classList.add('is-above');
  });
  document.documentElement.classList.add('motion-ready');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const item = entry.target;
      if (entry.isIntersecting) {
        item.classList.remove('is-above');
        item.classList.add('is-visible');
      } else {
        item.classList.remove('is-visible');
        item.classList.toggle('is-above', entry.boundingClientRect.bottom <= 0);
      }
    });
  }, { rootMargin: '0px 0px -7% 0px', threshold: 0 });
  items.forEach(item => observer.observe(item));
}
