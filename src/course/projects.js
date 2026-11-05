import { makeElement } from './dom.js';

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

export function initializeProjects() {
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
  initializeFinalQuiz();
}

function initializeFinalQuiz() {
  const questions = [
    { question: 'Welche Variable kann neu zugewiesen werden?', answers: ['const', 'let', 'typeof'], correct: 1 },
    { question: 'Welcher Index bezeichnet das erste Array-Element?', answers: ['0', '1', '-1'], correct: 0 },
    { question: 'Was liefert eine Funktion mit return zurück?', answers: ['Einen Rückgabewert', 'Ein HTML-Element', 'Immer true'], correct: 0 },
    { question: 'Welche Methode fügt einen Eintrag am Array-Ende ein?', answers: ['pop()', 'push()', 'shift()'], correct: 1 },
  ];
  let questionIndex = 0;
  let score = 0;
  let answered = false;
  const nextButton = document.querySelector('#next-question');

  function renderQuestion() {
    const questionElement = document.querySelector('#quiz-question');
    const answerContainer = document.querySelector('#quiz-answers');
    const feedback = document.querySelector('#final-quiz-feedback');
    const progress = document.querySelector('#quiz-progress');
    answered = false;
    nextButton.disabled = true;
    if (questionIndex >= questions.length) {
      progress.textContent = 'Quiz abgeschlossen';
      questionElement.textContent = `Dein Ergebnis: ${score} von ${questions.length}`;
      answerContainer.replaceChildren();
      feedback.textContent = score === questions.length ? 'Stark! Alle Antworten richtig.' : 'Gut gemacht. Wiederhole die Module und probiere es erneut.';
      nextButton.textContent = 'Noch einmal spielen';
      nextButton.disabled = false;
      return;
    }
    const question = questions[questionIndex];
    progress.textContent = `Frage ${questionIndex + 1} von ${questions.length} · Punktestand ${score}`;
    questionElement.textContent = question.question;
    feedback.textContent = 'Wähle die beste Antwort.';
    nextButton.textContent = 'Weiter →';
    answerContainer.replaceChildren(...question.answers.map((answer, answerIndex) => {
      const button = makeElement('button', 'lesson-quiz__answer', answer);
      button.type = 'button';
      button.setAttribute('aria-pressed', 'false');
      button.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const correct = answerIndex === question.correct;
        if (correct) score += 1;
        button.classList.add(correct ? 'is-correct' : 'is-wrong');
        if (!correct) answerContainer.children[question.correct]?.classList.add('is-correct');
        answerContainer.querySelectorAll('button').forEach((choice) => {
          choice.setAttribute('aria-pressed', String(choice === button));
        });
        feedback.textContent = correct ? 'Richtig!' : `Nicht ganz. Richtig ist „${question.answers[question.correct]}“.`;
        nextButton.disabled = false;
      });
      return button;
    }));
  }

  nextButton.addEventListener('click', () => {
    if (questionIndex >= questions.length) {
      questionIndex = 0;
      score = 0;
    } else if (answered) {
      questionIndex += 1;
    } else {
      return;
    }
    renderQuestion();
  });

  renderQuestion();
}
