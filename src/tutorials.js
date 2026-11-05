import './styles/main.css';
import './styles/course.css';
import { tutorials } from './tutorial-data.js';

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
let arrayDemoValues = ['Salbei', 'Lavendel'];
let eventDemoCount = 0;
let clockInterval = null;

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

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function makeDemoControls(tutorial) {
  const controls = makeElement('div', 'demo-controls');
  const extras = makeElement('div', 'demo-extras');
  let input = null;

  if (tutorial.demo === 'variables' || tutorial.demo === 'objects') {
    input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 40;
    input.value = tutorial.demo === 'variables' ? 'Alex' : 'JavaScript';
    input.setAttribute('aria-label', tutorial.demo === 'variables' ? 'Name für die Demo' : 'Objekttitel für die Demo');
    input.placeholder = tutorial.demo === 'variables' ? 'Dein Name' : 'Objekttitel';
  } else if (tutorial.demo === 'conditions' || tutorial.demo === 'functions' || tutorial.demo === 'events') {
    input = document.createElement('input');
    if (tutorial.demo === 'events') {
      input.type = 'text';
      input.maxLength = 60;
      input.placeholder = 'Text eingeben und Enter drücken';
      input.setAttribute('aria-label', input.placeholder);
    } else {
      input.type = 'number';
      input.min = tutorial.demo === 'conditions' ? '0' : '-1000';
      input.max = tutorial.demo === 'conditions' ? '100' : '1000';
      input.value = tutorial.demo === 'conditions' ? '72' : '6';
      input.setAttribute('aria-label', tutorial.demo === 'conditions' ? 'Punktzahl zwischen 0 und 100' : 'Zahl für die Funktion');
    }
  } else if (tutorial.demo === 'arrays' || tutorial.demo === 'dom') {
    input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 40;
    input.placeholder = tutorial.demo === 'arrays' ? 'Neuer Listeneintrag' : 'Text für neues Element';
    input.setAttribute('aria-label', input.placeholder);
  }

  if (input) controls.append(input);
  const button = makeElement('button', 'button button--primary demo-run', tutorial.demoLabel);
  button.type = 'button';
  controls.append(button);
  const output = makeElement('div', 'demo-output');
  output.setAttribute('aria-live', 'polite');
  output.setAttribute('aria-atomic', 'true');
  button.addEventListener('click', () => runDemo(tutorial, output, input));
  if (tutorial.demo === 'arrays') {
    [
      ['Am Anfang einfügen · unshift()', 'array-unshift'],
      ['Letzten entfernen · pop()', 'array-pop'],
      ['Ersten entfernen · shift()', 'array-shift'],
    ].forEach(([label, action]) => {
      const extraButton = makeElement('button', 'demo-extra-button', label);
      extraButton.type = 'button';
      extraButton.addEventListener('click', () => {
        if (action === 'array-unshift') arrayDemoValues.unshift('Start');
        if (action === 'array-pop') arrayDemoValues.pop();
        if (action === 'array-shift') arrayDemoValues.shift();
        output.textContent = `Array: [${arrayDemoValues.map((value) => `„${value}“`).join(', ')}]\nLänge: ${arrayDemoValues.length}`;
      });
      extras.append(extraButton);
    });
  }
  if (tutorial.demo === 'dom') {
    const styleButton = makeElement('button', 'demo-extra-button', 'Stil umschalten');
    styleButton.type = 'button';
    styleButton.addEventListener('click', () => {
      output.classList.toggle('demo-output--accent');
      output.setAttribute('data-style-changed', 'true');
    });
    const attributeButton = makeElement('button', 'demo-extra-button', 'data-Attribut setzen');
    attributeButton.type = 'button';
    attributeButton.addEventListener('click', () => {
      output.dataset.changed = 'yes';
      const status = output.querySelector('.demo-output__status') || makeElement('p', 'demo-output__status');
      status.textContent = `data-changed = "${output.dataset.changed}"`;
      output.append(status);
    });
    extras.append(styleButton, attributeButton);
  }
  if (tutorial.demo === 'events' && input) {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') runDemo(tutorial, output, input);
    });
    const messageButton = makeElement('button', 'demo-extra-button', 'Temporäre Meldung · 3 s');
    messageButton.type = 'button';
    messageButton.addEventListener('click', () => {
      output.textContent = 'Gespeichert! Diese Meldung wird nach drei Sekunden entfernt.';
      window.setTimeout(() => {
        if (output.isConnected && output.textContent.startsWith('Gespeichert!')) output.textContent = 'Die Meldung ist ausgeblendet.';
      }, 3000);
    });
    const startClockButton = makeElement('button', 'demo-extra-button', 'Uhr starten');
    startClockButton.type = 'button';
    const stopClockButton = makeElement('button', 'demo-extra-button', 'Uhr stoppen');
    stopClockButton.type = 'button';
    const clockOutput = makeElement('span', 'demo-clock', 'Uhr ist angehalten.');
    startClockButton.addEventListener('click', () => {
      if (clockInterval !== null) return;
      const updateClock = () => { clockOutput.textContent = new Date().toLocaleTimeString('de-DE'); };
      updateClock();
      clockInterval = window.setInterval(updateClock, 1000);
    });
    stopClockButton.addEventListener('click', () => {
      if (clockInterval !== null) window.clearInterval(clockInterval);
      clockInterval = null;
      clockOutput.textContent = 'Uhr ist angehalten.';
    });
    extras.append(messageButton, startClockButton, stopClockButton, clockOutput);

    const delegation = makeElement('div', 'delegation-demo');
    delegation.append(makeElement('p', '', 'Event-Delegation: Füge Buttons hinzu und klicke sie anschließend.'));
    const delegatedButtons = makeElement('div', 'delegation-demo__buttons');
    const delegationOutput = makeElement('p', 'delegation-demo__output', 'Noch kein dynamischer Button geklickt.');
    const addDelegatedButton = makeElement('button', 'demo-extra-button', 'Dynamischen Button hinzufügen');
    addDelegatedButton.type = 'button';
    let delegatedCount = 0;
    addDelegatedButton.addEventListener('click', () => {
      delegatedCount += 1;
      const newButton = makeElement('button', 'demo-extra-button', `Dynamisch ${delegatedCount}`);
      newButton.type = 'button';
      newButton.dataset.delegated = 'true';
      delegatedButtons.append(newButton);
    });
    delegatedButtons.addEventListener('click', (event) => {
      if (event.target instanceof Element) {
        const target = event.target.closest('button[data-delegated]');
        if (target) delegationOutput.textContent = `Über den gemeinsamen Listener geklickt: ${target.textContent}`;
      }
    });
    delegation.append(addDelegatedButton, delegatedButtons, delegationOutput);
    extras.append(delegation);
  }
  return { controls, extras, output };
}

function runDemo(tutorial, output, input) {
  switch (tutorial.demo) {
    case 'output':
      output.textContent = 'Konsole: „JavaScript läuft.“\nSeiteninhalt: JavaScript läuft.\nTipp: document.write() kann den gesamten Inhalt ersetzen – nutze stattdessen DOM-Methoden.';
      break;
    case 'variables': {
      const name = input.value.trim() || 'Neugierige Person';
      const points = 1;
      output.textContent = `const name = „${name}“ (string)\nlet punkte = ${points} (number)\nTemplate-Literal: Hallo ${name}!`;
      break;
    }
    case 'operators':
      output.textContent = '12 + 5 = 17\n17 % 2 = 1 → ungerade\n5 === „5“ → false (unterschiedliche Typen)\ntrue && false → false';
      break;
    case 'conditions': {
      const points = Math.max(0, Math.min(100, Number(input.value) || 0));
      const grade = points >= 90 ? 'Sehr gut' : points >= 75 ? 'Gut' : points >= 50 ? 'Bestanden' : 'Weiter üben';
      output.textContent = `${points} Punkte → ${grade}\nDie erste passende Bedingung bestimmt den Zweig.`;
      break;
    }
    case 'loops':
      output.textContent = 'for: Runde 1 → Runde 2 → Runde 3\nwhile: Bedingung prüfen, dann wiederholen\ndo…while: mindestens ein Durchlauf\nEin klarer Zähler und eine Abbruchbedingung schützen vor Endlosschleifen.';
      break;
    case 'arrays': {
      const item = input.value.trim();
      if (item) arrayDemoValues.push(item);
      output.textContent = `Array: [${arrayDemoValues.map((value) => `„${value}“`).join(', ')}]\nLänge: ${arrayDemoValues.length}\nErster Index: 0 · letzter Index: ${arrayDemoValues.length - 1}`;
      input.value = '';
      break;
    }
    case 'functions': {
      const value = Number(input.value) || 0;
      output.textContent = `verdopple(${value}) gibt ${value * 2} zurück.\nDie Funktion verarbeitet eine Eingabe und liefert einen Wert zurück.`;
      break;
    }
    case 'objects': {
      const title = input.value.trim() || 'JavaScript';
      const course = { titel: title, module: 10 };
      output.textContent = `kurs.titel → „${course.titel}“\nkurs.module → ${course.module}\nEine Methode kann mit this auf diese Eigenschaften zugreifen.`;
      break;
    }
    case 'dom': {
      const item = input.value.trim();
      if (!item) {
        output.textContent = 'Gib zuerst Text in das Feld ein.';
        input.focus();
        return;
      }
      const list = output.querySelector('ul') || document.createElement('ul');
      const entry = document.createElement('li');
      entry.textContent = item;
      list.append(entry);
      if (!list.isConnected) output.append(list);
      input.value = '';
      break;
    }
    case 'events': {
      eventDemoCount += 1;
      const typed = input.value.trim();
      output.textContent = typed
        ? `Event ${eventDemoCount}: Enter/Klick verarbeitet „${typed}“ als Text.`
        : `Klick-Event ausgelöst: ${eventDemoCount}. Ein Listener kann wiederverwendbar auf Aktionen reagieren.`;
      input.value = '';
      break;
    }
    default:
      output.textContent = 'Demo für dieses Modul ist bereit.';
  }
}

function renderLesson(tutorial, index) {
  const heading = makeElement('h2', '', `${tutorial.number} — ${tutorial.title}`);
  heading.id = 'lesson-title';
  heading.tabIndex = -1;
  const summary = makeElement('p', 'lesson-content__intro', tutorial.summary);

  const conceptSection = makeElement('section', 'lesson-block');
  conceptSection.append(makeElement('h3', '', 'Das lernst du'));
  const list = document.createElement('ul');
  list.className = 'lesson-concepts';
  tutorial.topics.forEach((topic) => list.append(makeElement('li', '', topic)));
  conceptSection.append(list);

  const exampleSection = makeElement('section', 'lesson-block');
  exampleSection.append(makeElement('h3', '', 'Beispielcode'));
  const pre = document.createElement('pre');
  pre.className = 'lesson-example';
  const code = document.createElement('code');
  code.textContent = tutorial.code;
  pre.append(code);
  exampleSection.append(pre);

  const demoSection = makeElement('section', 'lesson-block lesson-demo');
  demoSection.append(makeElement('h3', '', 'Direkt ausprobieren'));
  const demoDescription = makeElement('p', '', 'Die Demo führt nur vorbereiteten Beispielcode aus. Eigene Eingaben werden als Text behandelt und niemals als Programmcode ausgeführt.');
  const { controls, extras, output } = makeDemoControls(tutorial);
  demoSection.append(demoDescription, controls, extras, output);

  const quizSection = makeElement('section', 'lesson-quiz');
  const legend = makeElement('h3', '', 'Wissens-Check');
  const question = makeElement('p', 'lesson-quiz__question', tutorial.question);
  const answers = makeElement('div', 'lesson-quiz__answers');
  const feedback = makeElement('p', 'lesson-quiz__feedback', 'Wähle eine Antwort. Du kannst es erneut versuchen.');
  feedback.setAttribute('aria-live', 'polite');
  quizPassed = false;
  tutorial.answers.forEach((answer, answerIndex) => {
    const button = makeElement('button', 'lesson-quiz__answer', answer);
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      const correct = answerIndex === tutorial.correct;
      answers.querySelectorAll('button').forEach((choice) => {
        choice.setAttribute('aria-pressed', 'false');
        choice.classList.remove('is-correct', 'is-wrong');
      });
      button.setAttribute('aria-pressed', 'true');
      button.classList.add(correct ? 'is-correct' : 'is-wrong');
      quizPassed = correct;
      feedback.textContent = correct
        ? 'Richtig! Du kannst das Modul jetzt als abgeschlossen markieren.'
        : 'Noch nicht ganz. Lies die Kernideen noch einmal und versuche es erneut.';
      feedback.dataset.state = correct ? 'success' : 'error';
      updateCompleteButton();
    });
    answers.append(button);
  });
  quizSection.append(legend, question, answers, feedback);

  const exerciseSection = makeElement('section', 'lesson-exercise');
  exerciseSection.append(makeElement('p', 'eyebrow', 'DEINE ÜBUNG'), makeElement('h3', '', 'Jetzt bist du dran'), makeElement('p', '', tutorial.task));
  const chapterFiles = ['01-einfuehrung-ausgabe', '02-variablen', '03-operatoren', '04-bedingungen', '05-schleifen', '06-arrays', '07-funktionen', '08-objekte', '09-dom', '10-ereignisse'];
  const originalLinks = makeElement('div', 'lesson-original-links');
  const chapterLink = makeElement('a', '', 'Kapitel im Originalprojekt ↗');
  chapterLink.href = `https://github.com/2BFITT/jstutorial/blob/main/kapitel/${chapterFiles[index]}.html`;
  chapterLink.target = '_blank';
  chapterLink.rel = 'noopener noreferrer';
  const exerciseLink = makeElement('a', '', 'Passende Aufgaben ansehen ↗');
  exerciseLink.href = `https://github.com/2BFITT/jstutorial/blob/main/uebungen/${String(index + 1).padStart(2, '0')}-${['einfuehrung-ausgabe', 'variablen', 'operatoren', 'bedingungen', 'schleifen', 'arrays', 'funktionen', 'objekte', 'dom', 'ereignisse'][index]}-aufgaben.html`;
  exerciseLink.target = '_blank';
  exerciseLink.rel = 'noopener noreferrer';
  originalLinks.append(chapterLink, exerciseLink);
  const reflection = document.createElement('textarea');
  reflection.rows = 3;
  reflection.maxLength = 500;
  reflection.placeholder = 'Notiere hier deinen Lösungsansatz (wird nicht übertragen).';
  reflection.setAttribute('aria-label', 'Notizen zu deiner Übung');
  exerciseSection.append(originalLinks, reflection);

  lessonContent.replaceChildren(heading, summary, conceptSection, exampleSection, demoSection, quizSection, exerciseSection);
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
  if (clockInterval !== null) window.clearInterval(clockInterval);
  clockInterval = null;
  arrayDemoValues = ['Salbei', 'Lavendel'];
  eventDemoCount = 0;
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

const todoStorageKey = 'js-atelier-course-todos-v1';
const gradeStorageKey = 'js-atelier-course-grades-v1';

function readStoredList(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function writeStoredList(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Saving is optional; current-session interactions still work.
  }
}

let todoItems = readStoredList(todoStorageKey)
  .filter((item) => item && typeof item.text === 'string')
  .map((item) => ({ id: String(item.id), text: item.text.slice(0, 120), done: Boolean(item.done) }));
const todoList = document.querySelector('#todo-list');

function renderTodos() {
  todoList.replaceChildren();
  todoItems.forEach((item) => {
    const row = makeElement('li', item.done ? 'todo-list__item is-done' : 'todo-list__item');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.done;
    checkbox.setAttribute('aria-label', `Aufgabe erledigt: ${item.text}`);
    checkbox.addEventListener('change', () => {
      item.done = checkbox.checked;
      writeStoredList(todoStorageKey, todoItems);
      renderTodos();
    });
    label.append(checkbox, makeElement('span', '', item.text));
    const remove = makeElement('button', 'todo-list__remove', 'Entfernen');
    remove.type = 'button';
    remove.addEventListener('click', () => {
      todoItems = todoItems.filter((todo) => todo.id !== item.id);
      writeStoredList(todoStorageKey, todoItems);
      renderTodos();
    });
    row.append(label, remove);
    todoList.append(row);
  });
}

document.querySelector('#todo-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = document.querySelector('#todo-input');
  const text = input.value.trim();
  if (!text) return;
  todoItems.push({ id: `${Date.now()}-${Math.random()}`, text, done: false });
  input.value = '';
  writeStoredList(todoStorageKey, todoItems);
  renderTodos();
  input.focus();
});

let grades = readStoredList(gradeStorageKey)
  .filter((record) => record && typeof record.name === 'string' && Number.isFinite(Number(record.grade)) && Number(record.grade) >= 1 && Number(record.grade) <= 5)
  .map((record) => ({ id: String(record.id), name: record.name.slice(0, 50), grade: Number(record.grade) }));
const gradeList = document.querySelector('#grade-list');
const gradeAverage = document.querySelector('#grade-average');

function renderGrades() {
  const query = document.querySelector('#grade-filter').value.trim().toLocaleLowerCase('de');
  const shown = grades.filter((record) => record.name.toLocaleLowerCase('de').includes(query));
  gradeList.replaceChildren();
  shown.forEach((record) => {
    const row = makeElement('li', 'grade-list__item', `${record.name} — Note ${record.grade}`);
    const remove = makeElement('button', 'todo-list__remove', 'Entfernen');
    remove.type = 'button';
    remove.setAttribute('aria-label', `${record.name} entfernen`);
    remove.addEventListener('click', () => {
      grades = grades.filter((grade) => grade.id !== record.id);
      writeStoredList(gradeStorageKey, grades);
      renderGrades();
    });
    row.append(remove);
    gradeList.append(row);
  });
  if (grades.length) {
    const average = grades.reduce((sum, record) => sum + record.grade, 0) / grades.length;
    gradeAverage.textContent = `Durchschnitt: ${average.toFixed(2)} · ${grades.length} ${grades.length === 1 ? 'Eintrag' : 'Einträge'}${shown.length === grades.length ? '' : ` · ${shown.length} angezeigt`}`;
  } else {
    gradeAverage.textContent = 'Noch keine Noten erfasst.';
  }
}

document.querySelector('#grade-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const nameInput = document.querySelector('#student-name');
  const gradeInput = document.querySelector('#student-grade');
  const name = nameInput.value.trim();
  const grade = Number(gradeInput.value);
  if (!name || !Number.isInteger(grade) || grade < 1 || grade > 5) return;
  grades.push({ id: `${Date.now()}-${Math.random()}`, name, grade });
  writeStoredList(gradeStorageKey, grades);
  nameInput.value = '';
  renderGrades();
  nameInput.focus();
});

document.querySelector('#grade-filter').addEventListener('input', renderGrades);
renderTodos();
renderGrades();

const finalQuestions = [
  { question: 'Welche Variable kann neu zugewiesen werden?', answers: ['const', 'let', 'typeof'], correct: 1 },
  { question: 'Welcher Index bezeichnet das erste Array-Element?', answers: ['0', '1', '-1'], correct: 0 },
  { question: 'Was liefert eine Funktion mit return zurück?', answers: ['Einen Rückgabewert', 'Ein HTML-Element', 'Immer true'], correct: 0 },
  { question: 'Welche Methode fügt einen Eintrag am Array-Ende ein?', answers: ['pop()', 'push()', 'shift()'], correct: 1 },
];
let finalQuestionIndex = 0;
let finalScore = 0;
let finalAnswered = false;
const nextQuestionButton = document.querySelector('#next-question');

function renderFinalQuestion() {
  const questionElement = document.querySelector('#quiz-question');
  const answerContainer = document.querySelector('#quiz-answers');
  const feedback = document.querySelector('#final-quiz-feedback');
  const progressText = document.querySelector('#quiz-progress');
  finalAnswered = false;
  nextQuestionButton.disabled = true;
  if (finalQuestionIndex >= finalQuestions.length) {
    progressText.textContent = 'Quiz abgeschlossen';
    questionElement.textContent = `Dein Ergebnis: ${finalScore} von ${finalQuestions.length}`;
    answerContainer.replaceChildren();
    feedback.textContent = finalScore === finalQuestions.length ? 'Stark! Alle Antworten richtig.' : 'Gut gemacht. Wiederhole die Module und probiere es erneut.';
    nextQuestionButton.textContent = 'Noch einmal spielen';
    nextQuestionButton.disabled = false;
    return;
  }
  const item = finalQuestions[finalQuestionIndex];
  progressText.textContent = `Frage ${finalQuestionIndex + 1} von ${finalQuestions.length} · Punktestand ${finalScore}`;
  questionElement.textContent = item.question;
  feedback.textContent = 'Wähle die beste Antwort.';
  nextQuestionButton.textContent = 'Weiter →';
  answerContainer.replaceChildren(...item.answers.map((answer, answerIndex) => {
    const button = makeElement('button', 'lesson-quiz__answer', answer);
    button.type = 'button';
    button.addEventListener('click', () => {
      if (finalAnswered) return;
      finalAnswered = true;
      const correct = answerIndex === item.correct;
      if (correct) finalScore += 1;
      button.classList.add(correct ? 'is-correct' : 'is-wrong');
      if (!correct) answerContainer.children[item.correct]?.classList.add('is-correct');
      feedback.textContent = correct ? 'Richtig!' : `Nicht ganz. Richtig ist „${item.answers[item.correct]}“.`;
      nextQuestionButton.disabled = false;
    });
    return button;
  }));
}

nextQuestionButton.addEventListener('click', () => {
  if (finalQuestionIndex >= finalQuestions.length) {
    finalQuestionIndex = 0;
    finalScore = 0;
  } else if (finalAnswered) {
    finalQuestionIndex += 1;
  } else {
    return;
  }
  renderFinalQuestion();
});

renderFinalQuestion();
