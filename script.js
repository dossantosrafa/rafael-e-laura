/*
 * Site Rafael & Laura — GitHub Pages
 * Para mudar a data oficial, edite START_DATE.
 * Para adicionar fotos, veja o README.md.
 */
'use strict';

const START_DATE = new Date(2026, 10, 22, 0, 0, 0); // ano, mês (janeiro = 0), dia
const MONTHS = [
  { name: 'Bodas de Beijinho', icon: '💋', idea: 'Docinhos e beijinhos' },
  { name: 'Bodas de Sorvete', icon: '🍦', idea: 'Um sorvete juntos' },
  { name: 'Bodas de Algodão-doce', icon: '🍬', idea: 'Um passeio docinho' },
  { name: 'Bodas de Pipoca', icon: '🍿', idea: 'Cinema a dois' },
  { name: 'Bodas de Chocolate', icon: '🍫', idea: 'Nosso doce favorito' },
  { name: 'Bodas de Pluminha', icon: '🪶', idea: 'Um gesto delicado' },
  { name: 'Bodas de Purpurina', icon: '✨', idea: 'Um toque de brilho' },
  { name: 'Bodas de Pompom', icon: '🎀', idea: 'Uma surpresa fofa' },
  { name: 'Bodas de Pirulito', icon: '🍭', idea: 'Um encontro divertido' },
  { name: 'Bodas de Pintinhos', icon: '🐣', idea: 'Uma lembrança especial' },
  { name: 'Bodas de Chicletes', icon: '🩷', idea: 'Mais um mês juntinhos' },
  { name: 'Nosso primeiro ano', icon: '🎂', idea: '365 dias de amor (ou mais!)' }
];

const $ = (selector) => document.querySelector(selector);
const formatFull = (date) => new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
const formatShort = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date).replace('.', '');
const pad2 = (n) => String(n).padStart(2, '0');
const addMonths = (months) => new Date(START_DATE.getFullYear(), START_DATE.getMonth() + months, START_DATE.getDate());
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function updateRelationshipClock() {
  const elapsedMs = Math.max(0, Date.now() - START_DATE.getTime());
  const seconds = Math.floor(elapsedMs / 1000);
  $('#days').textContent = String(Math.floor(seconds / 86400));
  $('#hours').textContent = pad2(Math.floor((seconds % 86400) / 3600));
  $('#minutes').textContent = pad2(Math.floor((seconds % 3600) / 60));
  $('#seconds').textContent = pad2(seconds % 60);
}

function getNextMonthIndex(now = new Date()) {
  // Mostra a próxima comemoração no próprio dia 22, até o fim do dia.
  for (let i = 0; i < 12; i += 1) {
    const celebration = addMonths(i + 1);
    const endOfDay = new Date(celebration.getFullYear(), celebration.getMonth(), celebration.getDate() + 1);
    if (now < endOfDay) return i;
  }
  return null;
}

function renderMonths() {
  const now = new Date();
  const nextIndex = getNextMonthIndex(now);
  const grid = $('#monthsGrid');
  grid.replaceChildren();

  MONTHS.forEach((month, index) => {
    const date = addMonths(index + 1);
    const celebrationPassed = now >= new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const current = index === nextIndex;
    const card = document.createElement('article');
    card.className = `month-card${current ? ' is-next' : ''}`;
    if (current) card.setAttribute('aria-current', 'date');
    card.innerHTML = `<div class="month-top"><span class="month-icon" aria-hidden="true">${month.icon}</span><span class="month-num">${pad2(index + 1)} / 12</span></div>
      <h3>${month.name}</h3><p class="month-date">${formatShort(date)}</p>
      <div class="month-status">${celebrationPassed ? '♥ Já comemoramos' : current ? '✦ Nossa próxima boda' : month.idea}</div>`;
    grid.appendChild(card);
  });

  if (nextIndex !== null) {
    const next = MONTHS[nextIndex];
    const nextDate = addMonths(nextIndex + 1);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysUntil = Math.max(0, Math.round((Date.UTC(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate()) - Date.UTC(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate())) / MS_PER_DAY));
    $('#nextIcon').textContent = next.icon;
    $('#nextTitle').textContent = next.name;
    $('#nextDate').textContent = formatFull(nextDate);
    $('#nextDays').textContent = String(daysUntil);
    $('#nextDaysLabel').textContent = daysUntil === 0 ? 'é hoje! ♡' : daysUntil === 1 ? 'dia para comemorar' : 'dias para comemorar';
  } else {
    $('#nextIcon').textContent = '💗';
    $('#nextTitle').textContent = 'Nosso próximo capítulo';
    $('#nextDate').textContent = 'E tantos dias 22 ainda pela frente!';
    $('#nextDays').textContent = '∞';
    $('#nextDaysLabel').textContent = 'momentos por viver';
  }
}

function loadPhotos() {
  document.querySelectorAll('[data-photo]').forEach((frame) => {
    const url = frame.dataset.photo;
    const image = new Image();
    image.alt = frame.closest('figure')?.querySelector('figcaption span')?.textContent || 'Nossa memória';
    image.loading = 'lazy';
    image.decoding = 'async';
    image.onload = () => frame.replaceChildren(image);
    image.onerror = () => {}; // A ilustração de espaço reservado permanece visível.
    image.src = url;
  });
}

const modal = $('#letterModal');
let previousFocus = null;
function openLetter() {
  previousFocus = document.activeElement;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  $('.modal-dialog').focus();
}
function closeLetter() {
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
}

document.querySelectorAll('[data-open-letter]').forEach((button) => button.addEventListener('click', () => { closeMenu(); openLetter(); }));
document.querySelectorAll('[data-close-letter]').forEach((element) => element.addEventListener('click', closeLetter));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { closeLetter(); closeMenu(); }
  if (event.key === 'Tab' && !modal.hidden) {
    const focusable = Array.from(modal.querySelectorAll('button, a[href]')).filter((el) => !el.disabled);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    else if (!focusable.includes(document.activeElement)) { event.preventDefault(); first.focus(); }
  }
});

const menuToggle = $('#menuToggle');
const mobileNav = $('#mobileNav');
function closeMenu() { mobileNav.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menu'); }
menuToggle.addEventListener('click', () => {
  const nowOpen = mobileNav.hidden;
  mobileNav.hidden = !nowOpen;
  menuToggle.setAttribute('aria-expanded', String(nowOpen));
  menuToggle.setAttribute('aria-label', nowOpen ? 'Fechar menu' : 'Abrir menu');
});
mobileNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

$('#shareButton').addEventListener('click', async () => {
  const status = $('#shareStatus');
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Rafael & Laura ♡', text: 'Nosso cantinho 💗', url: location.href });
      status.textContent = '';
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(location.href);
      status.textContent = 'Link copiado! Agora é só mandar para quem quiser. ♡';
    } else {
      status.textContent = `Copie o link da barra de endereço para compartilhar.`;
    }
  } catch (err) {
    if (err?.name !== 'AbortError') status.textContent = 'Compartilhe usando o link na barra de endereço.';
  }
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: .09 });
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
} else document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));

loadPhotos();
updateRelationshipClock();
renderMonths();
setInterval(updateRelationshipClock, 1000);
setInterval(renderMonths, 10 * 60 * 1000);
