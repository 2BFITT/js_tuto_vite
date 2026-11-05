import './styles/main.css';

const navToggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.site-nav');

navToggle?.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isExpanded));
  navToggle.setAttribute('aria-label', isExpanded ? 'Menü öffnen' : 'Menü schließen');
  navigation?.classList.toggle('site-nav--open', !isExpanded);
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Menü öffnen');
    navigation.classList.remove('site-nav--open');
  });
});

let count = 0;
const counterOutput = document.querySelector('#counter-value');

function renderCount() {
  if (counterOutput) counterOutput.textContent = String(count);
}

document.querySelectorAll('[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    switch (button.dataset.action) {
      case 'increase':
        count += 1;
        break;
      case 'decrease':
        count -= 1;
        break;
      case 'reset':
        count = 0;
        break;
      default:
        return;
    }
    renderCount();
  });
});

document.querySelector('#current-year').textContent = String(new Date().getFullYear());
