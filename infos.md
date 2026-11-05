
Web-Engineering & Design Guide: Deep Dive

Dieses Dokument bietet eine detaillierte, architektonische und praxisnahe Aufschlüsselung moderner Konzepte der Webentwicklung und des UI/UX-Designs.

🧱 CSS-Architektur auf Enterprise-Level


1. ITCSS (Inverted Triangle CSS)

ITCSS ist kein Framework, sondern eine Denkweise zur Strukturierung von Stylesheets. Es löst das Problem unkontrollierter CSS-Spezifität in großen Projekten, indem es Code von grob/allgemein nach spezifisch/lokal sortiert.

Die Schichten des umgedrehten Dreiecks

text
Dreiecks-Basis (Oben): Weit reichend, geringe Spezifität, generisch
       /\      1. Settings   (Globale Variablen, keine CSS-Generierung)
      /  \     2. Tools      (Mixins & Funktionen, keine CSS-Generierung)
     /    \    3. Generic    (Resets, Box-Sizing)
    /      \   4. Elements   (Reine HTML-Tags wie h1, p, input)
   /        \  5. Objects    (Klassenbasierte, designlose Layout-Muster)
  /          \ 6. Components (Spezifische UI-Komponenten mit Design)
 /____________\7. Trumps     (Hilfsklassen, Overrides mit !important)
Dreiecks-Spitze (Unten): Lokal, hohe Spezifität, explizit
Verwende Code mit Vorsicht.
• Settings: Enthält reines Konfigurations-Code (Sass-Variablen, CSS Custom Properties) für Farbpaletten, Schriften oder Breakpoints. Erzeugt keinen CSS-Output.
• Tools: Beheimatet Mixins und Funktionen (z. B. für responsive Schriften oder mathematische Berechnungen). Erzeugt ebenfalls keinen CSS-Output.
• Generic: Die erste Schicht mit echtem CSS-Output. Hier liegen CSS-Resets (z. B. Normalize.css) oder globale Regeln wie box-sizing: border-box;.
• Elements: Stylt Standard-HTML-Tags direkt ohne Klassen (z. B. h1, blockquote, table). Setzt den globalen Marken-Standard für Rohtext.
• Objects: Klassenbasierte Selektoren für abstrakte Layout-Muster (z. B. .o-grid, .o-container). Sie regeln Struktur, besitzen aber keine Farben, Rahmen oder dekorative Styles.
• Components: Hier verbringen Entwickler die meiste Zeit. Abgeschlossene, visuelle UI-Elemente wie .c-card, .c-nav-bar oder .c-button.
• Trumps: Die spezifischste Schicht. Sie bricht die Kaskade bewusst auf und nutzt oft !important. Reine Hilfsklassen (Utilities) wie .u-text-center oder .u-hidden.

2. BEM (Block, Element, Modifier)

BEM ist eine Benennungskonvention, die CSS von der HTML-Struktur entkoppelt. Sie verhindert tiefe CSS-Schachtelungen (.card .body .title .button ❌) und hält die Spezifität flach auf einer einzigen Klassenebene (.card__button  ).

Die drei Säulen

• Block: Eine eigenständige, semantisch sinnvolle Komponente (z. B. .c-card).
• Element: Ein Teil des Blocks, der isoliert keinen Sinn ergibt. Wird mit zwei Unterstrichen (__) angehängt (z. B. .c-card__title).
• Modifier: Ein Zustand oder eine Variante des Blocks oder Elements. Wird mit zwei Bindestrichen (--) angehängt (z. B. .c-card--premium).

Praxis-Beispiel (SCSS-Syntax)


HTML-Struktur

html
<div class="c-card c-card--premium">
  <img src="thumb.jpg" alt="Produktbild" class="c-card__image">
  <div class="c-card__content">
    <h3 class="c-card__title">Premium Produkt</h3>
    <button class="c-card__button c-card__button--disabled">Ausverkauft</button>
  </div>
</div>
Verwende Code mit Vorsicht.

CSS / SCSS-Implementierung

scss
// Liegt in der ITCSS-Schicht: 6. Components
.c-card {
  background: #ffffff;
  border: 1px solid #cccccc;
  
  // Modifier für den Block
  &--premium {
    border-color: #d4af37;
    box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
  }

  // Elemente des Blocks
  &__image {
    width: 100%;
    display: block;
  }

  &__content {
    padding: 20px;
  }

  &__title {
    font-size: 1.5rem;
    margin-top: 0;
  }

  &__button {
    background: #0055ff;
    color: #ffffff;

    // Modifier für ein Element
    &--disabled {
      background: #888888;
      cursor: not-allowed;
    }
  }
}
Verwende Code mit Vorsicht.

⚡ Moderne Tooling-Infrastruktur


3. Vite

Vite bricht mit den Prinzipien älterer Bundler wie Webpack, die vor dem Serverstart die gesamte Anwendung im Speicher bündeln mussten.

Funktionsweise im Entwicklungsmodus (Dev Server)

• No-Bundling-Prinzip: Vite überlässt das Bündeln während der Entwicklung dem Browser. Moderne Browser unterstützen native ES-Module (import / export). Vite reicht JavaScript-Dateien auf Anfrage (on-demand) direkt unverändert durch.
• Dependency Pre-Bundling: Externe Bibliotheken (node_modules), die sich selten ändern, werden vorab einmalig mit esbuild optimiert. Esbuild ist in Go geschrieben und arbeitet bis zu 100-mal schneller als JavaScript-basierte Bundler.
• Hot Module Replacement (HMR): Wenn eine Datei geändert wird, tauscht Vite über WebSockets exakt diese Datei im Browser aus. Der App-Status (z. B. Eingaben in Formularen) bleibt erhalten. Der Vorgang dauert Millisekunden – unabhängig von der Projektgröße.

Funktionsweise im Produktionsmodus (Build)

Für die Live-Schaltung im Web nutzt Vite Rollup, um hochoptimierten Code zu erzeugen:
• Tree Shaking: Code-Fragmente, die importiert, aber im Projekt nie aktiv aufgerufen werden, fliegen aus dem finalen Paket.
• Code Splitting: Teilt Skripte automatisch so auf, dass der Browser nur den Code lädt, der für die aktuell aufgerufen Seite benötigt wird.

📱 Konzeptionelle Strategien


4. Mobile First

Mobile First steuert sowohl den Designprozess als auch die technische Umsetzung. Statt eine Desktop-Website zu bauen und Elemente für Smartphones mühsam per CSS wegzuschrumpfen (max-width), startet die Entwicklung beim kleinsten Display.

Der technische Ansatz im CSS

Das CSS startet komplett ohne Media Queries. Dies definiert den globalen Standard für Mobilgeräte. Größere Bildschirme werden via min-width schrittweise ergänzt.
css
/* 1. Mobile Basis-Struktur (Gilt von 0px bis unendlich) */
.o-grid-layout {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 2. Erweiterung für Tablets (Ab 768px Bildschirmbreite) */
@media (min-width: 768px) {
  .o-grid-layout {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

/* 3. Feinschliff für Desktops (Ab 1200px Bildschirmbreite) */
@media (min-width: 1200px) {
  .o-grid-layout {
    gap: 30px;
  }
}
Verwende Code mit Vorsicht.

Die Vorteile

• Performance: Mobile Browser überspringen @media (min-width: ...) Blöcke, die mathematisch nicht zutreffen. Das spart Rechenleistung.
• Fokus: Der begrenzte Platz zwingt Designer und Entwickler, unwichtige Inhalte direkt auszusortieren.

🎨 Human-Centered Design


5. UX (User Experience)

UX-Design analysiert die psychologische und logische Struktur eines Produkts. Das primäre Ziel ist eine frustfreie, effiziente Bedienung.

Phasen des UX-Prozesses

1. User Research: Interviews, Umfragen und das Erstellen von Personas (fiktiven Nutzerprofilen), um die Zielgruppe zu verstehen.
2. Informationsarchitektur (IA): Strukturierung aller Inhalte. Wie werden Menüs aufgebaut? Wo werden Daten logisch gruppiert?
3. User Flows: Visuelle Workflows, die den Weg des Nutzers durch die App skizzieren (z. B. der exakte Klickpfad von der Produktsuche bis zum Kaufabschluss).
4. Wireframing: Das Erstellen von rein funktionalen, grauen Layout-Skizzen ohne Farben, Logos oder finale Typografie.
5. Usability Testing: Prototypen werden von Testnutzern bedient, um Logikfehler oder Hürden in der Navigation aufzuspüren.

6. UI (User Interface)

UI-Design ist die visuelle und interaktive Ausgestaltung der UX-Drahtgittermodelle (Wireframes). Es bildet die direkte Schnittstelle zum Nutzer.

Kernbereiche des UI-Designs

• Design-Systeme: Definition wiederverwendbarer UI-Komponenten (Buttons, Formularfelder, Typografie-Skalen), um visuelle Konsistenz zu garantieren.
• Visuelle Hierarchie: Steuerung der Aufmerksamkeit des Nutzers durch Kontraste, gezielten Einsatz von Weißraum (Abständen) und Schriftstärken.
• Microinteractions: Gestaltung des dynamischen Verhaltens von Elementen (z. B. Hover-Effekte auf Buttons, Lade-Animationen oder Fehlermeldungs-Popups).
• Accessibility (Barrierefreiheit): Einhaltung von Standards (wie der WCAG), um durch ausreichende Farbkontraste und lesbare Schriftgrößen das Produkt für Menschen mit Einschränkungen zugänglich zu machen.

🔄 Das Zusammenspiel im Projektzyklus

In professionellen Produktteams greifen alle sechs Disziplinen lückenlos ineinander:
text
[UX-Design] ---------> [UI-Design] ---------> [Vite Dev-Server]
Analysiert Flows       Gestaltet das          Startet das Projekt
& Mobile-First-Logik   visuelle Design-System  in Millisekunden
                                                      |
                                                      v
                                              [ITCSS & BEM Code]
                                              Strukturiert CSS global
                                              & programmiert Module
Verwende Code mit Vorsicht.
1. Der UX-Designer konzipiert die Struktur der App nach dem Mobile First-Prinzip, um sicherzustellen, dass mobile Nutzer den Kernprozess fehlerfrei durchlaufen können.
2. Der UI-Designer transformiert die UX-Entwürfe in ein barrierefreies, visuelles Interface und übergibt die Layouts, Abstände und Farbvariablen an die Entwicklung.
3. Der Frontend-Entwickler setzt das Projekt mit Vite auf, um eine performante Entwicklungsumgebung mit sofortigem HMR-Feedback zu nutzen.
4. Im Code nutzt der Entwickler die ITCSS-Architektur, um die Design-Variablen (Settings) sauber zu trennen, und entwickelt die UI-Elemente als modulare, wiederverwendbare Komponenten nach der BEM-Namenslogik.
Wir können diese theoretischen Konzepte direkt in die Praxis umsetzen. Möchtest du für ein konkretes Praxisbeispiel (z. B. ein modales Dialogfenster oder eine responsive Navigation) den fertigen BEM/ITCSS-Code sehen, den du direkt in einem Vite-Projekt testen kannst? Sg mir einfach, welches UI-Element dich interessiert, damit ich den passenden Code-Block für dich generieren kann.
