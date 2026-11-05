import './styles/main.css';
import './styles/course.css';
import { tutorials } from './tutorial-data.js';
import { makeElement } from './course/dom.js';
import { renderLessonContent } from './course/render-lesson.js';
import { initializeProjects } from './course/projects.js';
import { createDemoController } from './course/demos.js';

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

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navToggle?.getAttribute('aria-expanded') === 'true') {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menü öffnen');
    navigation?.classList.remove('site-nav--open');
    navToggle.focus();
  }
});

document.addEventListener('click', (event) => {
  const header = document.querySelector('.site-header');
  if (
    navToggle?.getAttribute('aria-expanded') === 'true' &&
    event.target instanceof Node &&
    header && !header.contains(event.target)
  ) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Menü öffnen');
    navigation?.classList.remove('site-nav--open');
  }
});

const progressKey = 'js-atelier-course-progress-v1';
const grid = document.querySelector('#module-grid');
const lessonContent = document.querySelector('#lesson-content');
const searchInput = document.querySelector('#module-search');
const completedButton = document.querySelector('#complete-lesson');
const previousButton = document.querySelector('#previous-lesson');
const nextButton = document.querySelector('#next-lesson');
const progress = document.querySelector('#course-progress');
const progressLabel = document.querySelector('#progress-label');
const moduleCount = document.querySelector('#module-count');
const emptyMessage = document.querySelector('#course-empty');
let activeIndex = -1;
let quizPassed = false;
const demos = createDemoController(makeElement);

function loadProgress() {
  try {
    const stored = JSON.parse(localStorage.getItem(progressKey) || '[]');
    return new Set(Array.isArray(stored) ? stored.filter((id) => tutorials.some((tutorial) => tutorial.id === id)) : []);
  } catch {
    return new Set();
  }
}

const completedModules = loadProgress();

function saveProgress() {
  try {
    localStorage.setItem(progressKey, JSON.stringify([...completedModules]));
  } catch {
    // The course remains usable when browser storage is unavailable.
  }
}

function updateProgress() {
  const amount = completedModules.size;
  progress.value = amount;
  progressLabel.textContent = `${amount} von ${tutorials.length} Modulen`;
  progress.setAttribute('aria-valuetext', `${amount} von ${tutorials.length} Modulen abgeschlossen`);
  tutorials.forEach((tutorial) => {
    const card = grid.querySelector(`[data-module-id="${tutorial.id}"]`);
    const status = card?.querySelector('.module-card__status');
    if (status) status.textContent = completedModules.has(tutorial.id) ? '✓ Erledigt' : 'Offen';
    card?.classList.toggle('is-complete', completedModules.has(tutorial.id));
  });
  if (activeIndex >= 0) updateCompleteButton();
}

function createModuleCard(tutorial, index) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'module-card';
  card.dataset.moduleId = tutorial.id;
  card.setAttribute('aria-controls', 'lesson-content');
  card.setAttribute('aria-current', 'false');

  const top = document.createElement('span');
  top.className = 'module-card__top';
  const number = document.createElement('span');
  number.textContent = `${tutorial.number} / 10`;
  const icon = document.createElement('span');
  icon.className = 'module-card__icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = tutorial.icon;
  top.append(number, icon);

  const title = document.createElement('strong');
  title.className = 'module-card__title';
  title.textContent = tutorial.title;
  const summary = document.createElement('span');
  summary.className = 'module-card__summary';
  summary.textContent = tutorial.summary;
  const footer = document.createElement('span');
  footer.className = 'module-card__footer';
  const time = document.createElement('span');
  time.textContent = tutorial.time;
  const status = document.createElement('span');
  status.className = 'module-card__status';
  status.textContent = completedModules.has(tutorial.id) ? '✓ Erledigt' : 'Offen';
  footer.append(time, status);
  card.append(top, title, summary, footer);
  card.addEventListener('click', () => selectLesson(index, true));
  return card;
}

function renderCatalog(query = '') {
  const normalized = query.trim().toLocaleLowerCase('de');
  const matches = tutorials.filter((tutorial) =>
    `${tutorial.number} ${tutorial.title} ${tutorial.summary} ${tutorial.topics.join(' ')}`
      .toLocaleLowerCase('de')
      .includes(normalized),
  );
  grid.replaceChildren(...matches.map((tutorial) => createModuleCard(tutorial, tutorials.indexOf(tutorial))));
  moduleCount.textContent = `${matches.length} ${matches.length === 1 ? 'Modul' : 'Module'}`;
  emptyMessage.hidden = matches.length > 0;
  if (activeIndex >= 0) {
    grid.querySelector(`[data-module-id="${tutorials[activeIndex].id}"]`)?.setAttribute('aria-current', 'true');
  }
}

function renderLesson(tutorial, index) {
  quizPassed = false;
  const content = renderLessonContent(tutorial, index, {
    createDemoControls: demos.createDemoControls,
    onQuizAnswer(correct) {
      quizPassed = correct;
      updateCompleteButton();
    },
  });
  lessonContent.replaceChildren(...content);
  document.querySelector('#lesson-step').textContent = `Modul ${index + 1} von ${tutorials.length} · ${tutorial.time}`;
  grid.querySelectorAll('.module-card').forEach((card) => {
    card.setAttribute('aria-current', String(card.dataset.moduleId === tutorial.id));
  });
  previousButton.disabled = index === 0;
  nextButton.disabled = index === tutorials.length - 1;
  updateCompleteButton();
}

function updateCompleteButton() {
  if (activeIndex < 0) return;
  const tutorial = tutorials[activeIndex];
  const isComplete = completedModules.has(tutorial.id);
  completedButton.disabled = !quizPassed && !isComplete;
  completedButton.replaceChildren(document.createTextNode(isComplete ? 'Modul abgeschlossen ' : 'Modul abschließen '));
  const checkmark = document.createElement('span');
  checkmark.setAttribute('aria-hidden', 'true');
  checkmark.textContent = '✓';
  completedButton.append(checkmark);
  completedButton.classList.toggle('is-complete', isComplete);
}

function selectLesson(index, shouldScroll = false) {
  activeIndex = index;
  demos.reset();
  renderLesson(tutorials[index], index);
  if (shouldScroll) {
    document.querySelector('#lektion').scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.querySelector('#lesson-title')?.focus({ preventScroll: true });
  }
}

completedButton.addEventListener('click', () => {
  if (activeIndex < 0 || (!quizPassed && !completedModules.has(tutorials[activeIndex].id))) return;
  completedModules.add(tutorials[activeIndex].id);
  saveProgress();
  updateProgress();
});

document.querySelector('#reset-progress').addEventListener('click', () => {
  completedModules.clear();
  saveProgress();
  updateProgress();
});

previousButton.addEventListener('click', () => {
  if (activeIndex > 0) selectLesson(activeIndex - 1);
});

nextButton.addEventListener('click', () => {
  if (activeIndex >= 0 && activeIndex < tutorials.length - 1) selectLesson(activeIndex + 1);
});

searchInput.addEventListener('input', () => renderCatalog(searchInput.value));
renderCatalog();
updateProgress();
initializeProjects();
