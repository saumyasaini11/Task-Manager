# TaskPro - Smart Task Manager

A premium, glassmorphism-styled Smart Task Manager built using a multi-agent developer workflow. Adapted from the Stitch UX design, TaskPro offers a clean, developer-centric interface (inspired by Notion and Linear) featuring live search, custom priority selectors, calendar due dates, interactive stats cards, and full light/dark theme toggles.

---

## 🚀 Live Demo & Deployment
This website is ready to be deployed to **Vercel** as a static project. 
To run locally, you can serve it using any HTTP server:
```bash
# Example using Python:
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

---

## 🛠️ Project Architecture & Modules

The application is built using a clean separation of concerns and a modular structure:

1. **`index.html`** (Entrypoint): Contains the semantic markup, layout grids, side navigation drawers, top search bars, stats widgets, modal edit forms, and the Tailwind CSS configuration.
2. **`src/css/style.css`** (Design System): Defines CSS theme variables (in both dark and light modes) mapped directly to Tailwind's config color keys, background textures, custom checked status animations, scrollbars, and slide transitions.
3. **`src/js/storage.js`** (Data Persistence): Handles CRUD actions and local storage read/write states for tasks list and user theme preferences.
4. **`src/js/ui.js`** (DOM Renderer): Renders task items dynamically to the DOM, formats due dates relative to today, styles priority borders, structures collapsible completed sections, and manages fade-out deletion animations.
5. **`src/js/app.js`** (Controller Coordinator): Sets up the application state, attaches form handlers, wires the calendar buttons, manages priority select buttons, updates search queries, toggles themes, and controls edit modal triggers.

---

## 🎨 Design Theme & Core Features

*   **Premium Glassmorphic UI**: Translucent layers using `backdrop-filter: blur(12px)` and subtle 1px outlines that elevate cards over a canvas stargaze texture.
*   **Theme Toggle (Light/Dark Mode)**: Fully dynamic switching that shifts CSS variable colors, providing a sleek Midnight dark canvas or a bright, airy light layout.
*   **Priority Dots Selector**: Clicking the colored dots (Red = High, Yellow = Medium, Blue = Low) inside the input panel selects the priority with a white active ring indicator.
*   **Calendar Due Date & Badges**: Set target dates using a hidden date input triggered by the calendar icon. It renders a clean badge inside the input bar to indicate selection.
*   **Dashboard Stats**: Real-time card counters for Total, Pending, and Completed tasks, coupled with completion rate indicators.
*   **Task Editing Modal**: Interactive edit modal allowing users to rename tasks, adjust priorities, or set new dates on the fly.
*   **Search & Sorting**: Live title search filtering and toggles for sorting pending tasks by priority (High -> Medium -> Low).

---

## 🤖 Multi-Agent Contributions

This project was built through a simulated collaboration of four specialized developer agents:

*   **Agent 1: Planning Agent**: Analyzed user requirements, drafted the project file architecture, mapped data schemas, and produced the development roadmap.
*   **Agent 2: Frontend Agent**: Designed the semantic HTML5 structure, integrated the glassmorphic card grids, and adapted the premium Tailwind-CSS design system.
*   **Agent 3: Backend Agent**: Programmed the JavaScript storage operations, constructed the schemas, and enabled browser local storage persistence.
*   **Agent 4: Integration & Testing Agent**: Linked UI event handlers, implemented modal edit transitions, created date badges, added dark mode state flips, and verified all user flows.
