import './styles/main.css';

const navToggle = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.site-nav');

navToggle?.addEventListener('click', () => {
  const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!isExpanded));
  navToggle.setAttribute('aria-label', isExpanded ? 'Menü öffnen' : 'Menü schließen');
  navigation?.classList.toggle('site-nav--open', !isExpanded);
});

function closeNavigation(returnFocus = false) {
  navToggle?.setAttribute('aria-expanded', 'false');
  navToggle?.setAttribute('aria-label', 'Menü öffnen');
  navigation?.classList.remove('site-nav--open');
  if (returnFocus) navToggle?.focus();
}

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => closeNavigation());
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navToggle?.getAttribute('aria-expanded') === 'true') {
    closeNavigation(true);
  }
});

document.addEventListener('click', (event) => {
  const header = document.querySelector('.site-header');
  if (
    navToggle?.getAttribute('aria-expanded') === 'true' &&
    event.target instanceof Node &&
    header && !header.contains(event.target)
  ) {
    closeNavigation();
  }
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

const quizFeedback = document.querySelector('#quiz-feedback');
document.querySelectorAll('[data-answer]').forEach((answerButton) => {
  answerButton.addEventListener('click', () => {
    const isCorrect = answerButton.dataset.answer === 'let';

    document.querySelectorAll('[data-answer]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button === answerButton));
      delete button.dataset.correct;
    });

    answerButton.dataset.correct = String(isCorrect);
    if (quizFeedback) {
      quizFeedback.dataset.state = isCorrect ? 'success' : 'error';
      quizFeedback.textContent = isCorrect
        ? 'Richtig! let darf einen neuen Wert erhalten.'
        : 'Noch nicht ganz: Bei welcher Deklaration darf sich der Wert ändern?';
    }
  });
});

const currentYear = document.querySelector('#current-year');
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
