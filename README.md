# js_tuto_vite

Its the js tutorial rewritten with itcss, Bem, Vite, Mobile first, Ux und UI

nextpropmt : und nun füge alle tutorials und funktinoen von dem : https://github.com/2BFITT/jstutorial hinzu





Eine mobile-first Lernseite rund um JavaScript. Die Oberfläche verbindet kurze Lernpfade mit einer kleinen, direkt bedienbaren JavaScript-Spielwiese.

## Lokal auf dem eigenen Rechner starten

Du brauchst [Node.js](https://nodejs.org/) (am besten die aktuelle LTS-Version). Öffne den Projektordner in VS Code und dann **Terminal → Neues Terminal**.

1. Abhängigkeiten installieren (nur beim ersten Mal):

    ```sh

    npm install

    ```

2. Den lokalen Entwicklungsserver starten:

    ```sh

    npm run dev

    ```

3. Öffne die im Terminal angezeigte Adresse – normalerweise [http://localhost:5173](http://localhost:5173) – in deinem Browser. Lass das Terminal während der Vorschau geöffnet. Änderungen an den Dateien werden automatisch im Browser aktualisiert. Zum Beenden drücke `Ctrl+C` im Terminal.

Falls du in Windows PowerShell die Meldung bekommst, dass `npm.ps1` nicht ausgeführt werden darf, verwende stattdessen `npm.cmd install` und `npm.cmd run dev`.

### Auf einem anderen Gerät im gleichen WLAN testen

Starte Vite mit Netzwerkzugriff:

```sh
npm run dev -- --host 0.0.0.0
```

Öffne anschließend auf dem Handy die Netzwerkadresse, die Vite im Terminal anzeigt. Beide Geräte müssen im gleichen Netzwerk sein; gegebenenfalls muss die Firewall den Zugriff erlauben.

### Produktionsversion lokal ansehen

Damit prüfst du den optimierten Build, der auch veröffentlicht wird:

```sh
npm run build

npm run preview
```

Öffne danach die vom Preview-Server angezeigte Adresse – normalerweise [http://localhost:4173](http://localhost:4173). Der Build liegt im Ordner `dist/`.

## Auf GitHub Pages veröffentlichen

Ja: Sobald das Projekt auf GitHub liegt, kann GitHub Pages die Seite für dich bauen und veröffentlichen. Dafür:

1. Erstelle auf GitHub ein Repository und lade **alle Projektdateien** dorthin hoch – einschließlich `package.json`, `package-lock.json` und des Ordners `.github/workflows/`.

2. Stelle sicher, dass der veröffentlichte Branch `main` heißt. Der Workflow ist auf Pushes zu `main` eingestellt.

3. Öffne im Repository **Settings → Pages → Build and deployment** und wähle bei **Source** die Option **GitHub Actions**.

4. Push deine Änderungen nach `main`. Unter **Actions** kannst du den Workflow verfolgen. Nach erfolgreichem Lauf findest du die veröffentlichte Adresse dort oder unter **Settings → Pages**. Bei einem normalen Projekt-Repository lautet sie üblicherweise `https://<dein-benutzername>.github.io/<repository-name>/`.

Bei jedem weiteren Push auf `main` wird die Seite automatisch aktualisiert. Vite verwendet relative Asset-Pfade, damit der Build sowohl unter einer Projekt-URL als auch auf einer eigenen Domain funktioniert. Falls dein Standard-Branch anders heißt, passe den Branch `main` in `.github/workflows/deploy.yml` entsprechend an.

## Struktur

Die Stylesheets folgen ITCSS – von allgemeinen Einstellungen bis zu Komponenten und Utilities. Komponenten-Klassen sind nach BEM benannt.

```text
src/

    main.js

    styles/

        settings.css   # Design-Tokens

        tools.css      # wiederverwendbare Designwerte

        generic.css    # Reset und globale Defaults

        elements.css   # HTML-Elemente

        objects.css    # Layout-Primitives

        components.css # BEM-Komponenten, mobile-first

        utilities.css  # Hilfsklassen
```
