# TaskPro - Smart Task Manager

A premium, glassmorphism-styled Smart Task Manager built using a multi-agent developer workflow. Adapted from a Stitch UX design, TaskPro offers a clean interface inspired by Notion and Linear, featuring live search, priority selectors, calendar due dates, interactive stats cards, and full light/dark theme support.

---

## Live Demo & Deployment

The project is a static site ready for deployment on Vercel.

---

## Project Architecture

The application follows a clean separation of concerns across five modules:

- **`index.html`** — Entrypoint containing semantic markup, layout grids, side navigation, top search bar, stats widgets, and the modal edit form. Includes the Tailwind CSS configuration.
- **`src/css/style.css`** — Design system defining CSS theme variables for dark and light modes, background textures, checkbox animations, custom scrollbars, and slide transitions.
- **`src/js/storage.js`** — Handles all CRUD operations and localStorage read/write for tasks and user theme preferences.
- **`src/js/ui.js`** — Dynamically renders task items to the DOM, formats relative due dates, applies priority border styles, manages collapsible completed sections, and handles fade-out deletion animations.
- **`src/js/app.js`** — Application controller that sets up state, attaches form handlers, wires calendar inputs, manages priority selection, handles search queries, toggles themes, and controls modal triggers.

---

## Features

- **Glassmorphic UI** — Translucent cards using `backdrop-filter: blur(12px)` with subtle 1px outlines over a starfield canvas texture.
- **Light/Dark Mode** — Fully dynamic theme switching via CSS variables, toggling between a dark midnight canvas and a bright airy layout.
- **Priority Selector** — Colored dot buttons (Red = High, Yellow = Medium, Blue = Low) with a white active ring indicator inside the input panel.
- **Calendar Due Dates** — Date input triggered by a calendar icon, rendering a clean badge inside the input bar on selection.
- **Dashboard Stats** — Real-time counters for Total, Pending, and Completed tasks with a live completion rate indicator.
- **Edit Modal** — In-place task editing allowing users to rename tasks, change priority, or update due dates.
- **Live Search and Sort** — Real-time title filtering and priority-based sorting (High to Low) for pending tasks.

---

## Multi-Agent Workflow

This project was built through a structured collaboration of four specialized AI agents:

**Agent 1 — Planning Agent**
Analyzed requirements, drafted the file architecture, mapped data schemas, and produced the development roadmap.

**Agent 2 — Frontend Agent**
Built the semantic HTML5 structure, integrated the glassmorphic card grid, and developed the Tailwind CSS design system.

**Agent 3 — Backend Agent**
Programmed JavaScript storage operations, defined task schemas, and implemented localStorage persistence.

**Agent 4 — Integration and Testing Agent**
Linked UI event handlers, implemented modal transitions, created date badge rendering, added dark mode state management, and verified all user flows end to end.

---

## Tech Stack

- HTML5
- Tailwind CSS
- Vanilla JavaScript
- localStorage API
