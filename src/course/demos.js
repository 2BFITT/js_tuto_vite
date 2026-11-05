export function createDemoController(makeElement) {
  let arrayValues = ['Salbei', 'Lavendel'];
  let eventCount = 0;
  let clockInterval = null;

  function runDemo(tutorial, output, input) {
    switch (tutorial.demo) {
      case 'output':
        output.textContent = 'Konsole: „JavaScript läuft.“\nSeiteninhalt: JavaScript läuft.\nTipp: document.write() kann den gesamten Inhalt ersetzen – nutze stattdessen DOM-Methoden.';
        break;
      case 'variables': {
        const name = input.value.trim() || 'Neugierige Person';
        output.textContent = `const name = „${name}“ (string)\nlet punkte = 1 (number)\nTemplate-Literal: Hallo ${name}!`;
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
        if (item) arrayValues.push(item);
        output.textContent = `Array: [${arrayValues.map((value) => `„${value}“`).join(', ')}]\nLänge: ${arrayValues.length}\nErster Index: 0 · letzter Index: ${arrayValues.length - 1}`;
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
        eventCount += 1;
        const typed = input.value.trim();
        output.textContent = typed
          ? `Event ${eventCount}: Enter/Klick verarbeitet „${typed}“ als Text.`
          : `Klick-Event ausgelöst: ${eventCount}. Ein Listener kann wiederverwendbar auf Aktionen reagieren.`;
        input.value = '';
        break;
      }
      default:
        output.textContent = 'Demo für dieses Modul ist bereit.';
    }
  }

  function createDemoControls(tutorial) {
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
    const runButton = makeElement('button', 'button button--primary demo-run', tutorial.demoLabel);
    runButton.type = 'button';
    controls.append(runButton);
    const output = makeElement('div', 'demo-output');
    output.setAttribute('aria-live', 'polite');
    output.setAttribute('aria-atomic', 'true');
    runButton.addEventListener('click', () => runDemo(tutorial, output, input));

    if (tutorial.demo === 'arrays') {
      [
        ['Am Anfang einfügen · unshift()', 'unshift'],
        ['Letzten entfernen · pop()', 'pop'],
        ['Ersten entfernen · shift()', 'shift'],
      ].forEach(([label, action]) => {
        const actionButton = makeElement('button', 'demo-extra-button', label);
        actionButton.type = 'button';
        actionButton.addEventListener('click', () => {
          if (action === 'unshift') arrayValues.unshift('Start');
          if (action === 'pop') arrayValues.pop();
          if (action === 'shift') arrayValues.shift();
          output.textContent = `Array: [${arrayValues.map((value) => `„${value}“`).join(', ')}]\nLänge: ${arrayValues.length}`;
        });
        extras.append(actionButton);
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
        stopClock();
        clockOutput.textContent = 'Uhr ist angehalten.';
      });
      extras.append(messageButton, startClockButton, stopClockButton, clockOutput);

      const delegation = makeElement('div', 'delegation-demo');
      delegation.append(makeElement('p', '', 'Event-Delegation: Füge Buttons hinzu und klicke sie anschließend.'));
      const delegatedButtons = makeElement('div', 'delegation-demo__buttons');
      const delegationOutput = makeElement('p', 'delegation-demo__output', 'Noch kein dynamischer Button geklickt.');
      const addButton = makeElement('button', 'demo-extra-button', 'Dynamischen Button hinzufügen');
      addButton.type = 'button';
      let delegatedCount = 0;
      addButton.addEventListener('click', () => {
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
      delegation.append(addButton, delegatedButtons, delegationOutput);
      extras.append(delegation);
    }

    return { controls, extras, output };
  }

  function stopClock() {
    if (clockInterval !== null) window.clearInterval(clockInterval);
    clockInterval = null;
  }

  function reset() {
    stopClock();
    arrayValues = ['Salbei', 'Lavendel'];
    eventCount = 0;
  }

  return { createDemoControls, reset };
}
