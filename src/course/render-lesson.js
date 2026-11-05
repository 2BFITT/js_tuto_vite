import { makeElement } from './dom.js';

const sourceChapterFiles = [
  '01-einfuehrung-ausgabe', '02-variablen', '03-operatoren', '04-bedingungen',
  '05-schleifen', '06-arrays', '07-funktionen', '08-objekte', '09-dom', '10-ereignisse',
];

const sourceExerciseFiles = [
  'einfuehrung-ausgabe', 'variablen', 'operatoren', 'bedingungen', 'schleifen',
  'arrays', 'funktionen', 'objekte', 'dom', 'ereignisse',
];

export function renderLessonContent(tutorial, index, { createDemoControls, onQuizAnswer }) {
  const heading = makeElement('h2', '', `${tutorial.number} — ${tutorial.title}`);
  heading.id = 'lesson-title';
  heading.tabIndex = -1;
  const summary = makeElement('p', 'lesson-content__intro', tutorial.summary);

  const conceptSection = makeElement('section', 'lesson-block');
  conceptSection.append(makeElement('h3', '', 'Das lernst du'));
  const concepts = document.createElement('ul');
  concepts.className = 'lesson-concepts';
  tutorial.topics.forEach((topic) => concepts.append(makeElement('li', '', topic)));
  conceptSection.append(concepts);

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
  const description = makeElement('p', '', 'Die Demo führt nur vorbereiteten Beispielcode aus. Eigene Eingaben werden als Text behandelt und niemals als Programmcode ausgeführt.');
  const { controls, extras, output } = createDemoControls(tutorial);
  demoSection.append(description, controls, extras, output);

  const quizSection = makeElement('section', 'lesson-quiz');
  quizSection.append(
    makeElement('h3', '', 'Wissens-Check'),
    makeElement('p', 'lesson-quiz__question', tutorial.question),
  );
  const answers = makeElement('div', 'lesson-quiz__answers');
  const feedback = makeElement('p', 'lesson-quiz__feedback', 'Wähle eine Antwort. Du kannst es erneut versuchen.');
  feedback.setAttribute('aria-live', 'polite');
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
      feedback.textContent = correct
        ? 'Richtig! Du kannst das Modul jetzt als abgeschlossen markieren.'
        : 'Noch nicht ganz. Lies die Kernideen noch einmal und versuche es erneut.';
      feedback.dataset.state = correct ? 'success' : 'error';
      onQuizAnswer(correct);
    });
    answers.append(button);
  });
  quizSection.append(answers, feedback);

  const exerciseSection = makeElement('section', 'lesson-exercise');
  exerciseSection.append(
    makeElement('p', 'eyebrow', 'DEINE ÜBUNG'),
    makeElement('h3', '', 'Jetzt bist du dran'),
    makeElement('p', '', tutorial.task),
  );
  const originalLinks = makeElement('div', 'lesson-original-links');
  const chapterLink = makeElement('a', '', 'Kapitel im Originalprojekt ↗');
  chapterLink.href = `https://github.com/2BFITT/jstutorial/blob/main/kapitel/${sourceChapterFiles[index]}.html`;
  const exerciseLink = makeElement('a', '', 'Passende Aufgaben ansehen ↗');
  exerciseLink.href = `https://github.com/2BFITT/jstutorial/blob/main/uebungen/${String(index + 1).padStart(2, '0')}-${sourceExerciseFiles[index]}-aufgaben.html`;
  [chapterLink, exerciseLink].forEach((link) => {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
  originalLinks.append(chapterLink, exerciseLink);

  const reflection = document.createElement('textarea');
  reflection.rows = 3;
  reflection.maxLength = 500;
  reflection.placeholder = 'Notiere hier deinen Lösungsansatz. Die Notiz bleibt auf diesem Gerät.';
  reflection.setAttribute('aria-label', 'Notizen zu deiner Übung');
  const noteKey = `js-atelier-note-${tutorial.id}`;
  try {
    reflection.value = localStorage.getItem(noteKey) || '';
  } catch {
    // Notes are optional when browser storage is unavailable.
  }
  reflection.addEventListener('input', () => {
    try {
      localStorage.setItem(noteKey, reflection.value);
    } catch {
      // Editing remains available for the current page view.
    }
  });
  exerciseSection.append(originalLinks, reflection);

  return [heading, summary, conceptSection, exampleSection, demoSection, quizSection, exerciseSection];
}
