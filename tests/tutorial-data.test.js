import test from 'node:test';
import assert from 'node:assert/strict';
import { tutorials } from '../src/tutorial-data.js';

const requiredTopics = [
  'ausgabe', 'variablen', 'operatoren', 'bedingungen', 'schleifen',
  'arrays', 'funktionen', 'objekte', 'dom', 'ereignisse',
];

test('the course contains all ten modules in learning order', () => {
  assert.equal(tutorials.length, 10);
  assert.deepEqual(tutorials.map(({ id }) => id), requiredTopics);
  assert.deepEqual(tutorials.map(({ number }) => number), Array.from({ length: 10 }, (_, index) => String(index + 1).padStart(2, '0')));
});

test('each module has a unique ID and complete learning content', () => {
  assert.equal(new Set(tutorials.map(({ id }) => id)).size, tutorials.length);
  for (const lesson of tutorials) {
    assert.ok(lesson.title.trim(), `${lesson.id} needs a title`);
    assert.ok(lesson.summary.trim(), `${lesson.id} needs a summary`);
    assert.ok(lesson.topics.length >= 3, `${lesson.id} needs core concepts`);
    assert.ok(lesson.code.trim(), `${lesson.id} needs example code`);
    assert.ok(lesson.task.trim(), `${lesson.id} needs a practice task`);
    assert.equal(lesson.answers.length, 3, `${lesson.id} needs three quiz choices`);
    assert.ok(Number.isInteger(lesson.correct));
    assert.ok(lesson.correct >= 0 && lesson.correct < lesson.answers.length);
    assert.ok(lesson.demo.trim(), `${lesson.id} needs an interactive demo`);
  }
});
