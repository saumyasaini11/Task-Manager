/**
 * Smart Task Manager - Main Application Controller
 * Connects Stitch UI DOM event handlers with data layer mutations and triggers rendering.
 */

import {
    loadTasks,
    saveTasks,
    createTaskInstance,
    loadThemePreference,
    saveThemePreference
} from './storage.js';

import { renderApp } from './ui.js';

// ==========================================================================
// Application State
// ==========================================================================
const state = {
    tasks: [],
    searchQuery: '',
    sortByPriority: false,
    currentSelectedPriority: 'medium', // Default creation priority
    currentView: 'dashboard',
    calendarCurrentMonth: new Date()
};

// ==========================================================================
// Interaction Callbacks
// ==========================================================================

/**
 * Toggles a task between completed and pending.
 * If completed, attaches a completedAt timestamp.
 * @param {string} taskId - Target task ID
 */
function handleToggleComplete(taskId) {
    state.tasks = state.tasks.map(task => {
        if (task.id === taskId) {
            const completed = !task.completed;
            return {
                ...task,
                completed,
                completedAt: completed ? new Date().toISOString() : null
            };
        }
        return task;
    });
    saveTasks(state.tasks);
    triggerRender();
}

/**
 * Deletes a task from the list and persists the update.
 * @param {string} taskId - Target task ID
 */
function handleDeleteTask(taskId) {
    state.tasks = state.tasks.filter(task => task.id !== taskId);
    saveTasks(state.tasks);
    triggerRender();
}

/**
 * Triggers modal form popup for editing task title, priority, and date.
 * @param {import('./storage.js').Task} task - Target task object
 */
function handleEditTask(task) {
    openEditModal(task);
}

/**
 * Triggers a full UI render refresh.
 */
function triggerRender() {
    renderApp(state, {
        onToggleComplete: handleToggleComplete,
        onDelete: handleDeleteTask,
        onEdit: handleEditTask
    });
}

// ==========================================================================
// Form & Input Element Selectors
// ==========================================================================
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskDateInput = document.getElementById('task-date');
const calendarBtn = document.getElementById('calendar-btn');
const dateBadge = document.getElementById('date-badge');
const dateBadgeText = document.getElementById('date-badge-text');
const clearDateBtn = document.getElementById('clear-date-btn');
const headerAddTaskBtn = document.getElementById('header-add-task-btn');

// ==========================================================================
// Date Picker Interactions
// ==========================================================================

/**
 * Restricts date selectors to today or future dates.
 */
function setMinDateLimits() {
    const today = new Date().toISOString().split('T')[0];
    taskDateInput.min = today;
    document.getElementById('edit-task-date').min = today;
}

/**
 * Binds custom calendar badge triggers and date picker inputs.
 */
function initDatePickerActions() {
    calendarBtn.addEventListener('click', () => {
        try {
            taskDateInput.showPicker();
        } catch (err) {
            taskDateInput.click();
        }
    });

    taskDateInput.addEventListener('change', () => {
        const selectedVal = taskDateInput.value;
        if (selectedVal) {
            const dateObj = new Date(selectedVal);
            const formatted = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            dateBadgeText.textContent = formatted;
            dateBadge.classList.remove('hidden');
        } else {
            dateBadge.classList.add('hidden');
        }
    });

    clearDateBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        taskDateInput.value = '';
        dateBadge.classList.add('hidden');
    });
}

// ==========================================================================
// Priority Selection Dots
// ==========================================================================

/**
 * Binds click listeners to priority selection buttons inside the input bar.
 */
function initPrioritySelector() {
    const priorityDots = document.querySelectorAll('.priority-dot');
    priorityDots.forEach(dot => {
        dot.addEventListener('click', () => {
            priorityDots.forEach(d => {
                d.classList.remove('selected');
                d.setAttribute('aria-checked', 'false');
            });
            dot.classList.add('selected');
            dot.setAttribute('aria-checked', 'true');
            state.currentSelectedPriority = dot.dataset.priority;
        });
    });
}

/**
 * Resets selected creation priority to medium.
 */
function resetPrioritySelector() {
    const priorityDots = document.querySelectorAll('.priority-dot');
    priorityDots.forEach(d => {
        d.classList.remove('selected');
        d.setAttribute('aria-checked', 'false');
    });
    const defaultDot = document.getElementById('dot-medium');
    defaultDot.classList.add('selected');
    defaultDot.setAttribute('aria-checked', 'true');
    state.currentSelectedPriority = 'medium';
}

// ==========================================================================
// Edit Modal Interactions
// ==========================================================================
const editModal = document.getElementById('edit-modal');
const modalPanel = editModal.querySelector('.glass-card-popover');
const editForm = document.getElementById('edit-form');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

function openEditModal(task) {
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-input').value = task.title;
    document.getElementById('edit-task-priority').value = task.priority;
    document.getElementById('edit-task-date').value = task.dueDate || '';

    // Trigger animations
    editModal.classList.remove('hidden');
    setTimeout(() => {
        editModal.classList.remove('opacity-0');
        modalPanel.classList.remove('scale-95');
    }, 10);
}

function closeEditModal() {
    editModal.classList.add('opacity-0');
    modalPanel.classList.add('scale-95');
    setTimeout(() => {
        editModal.classList.add('hidden');
    }, 200);
}

function initEditModalActions() {
    // 1. Submit form updates
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('edit-task-id').value;
        const newTitle = document.getElementById('edit-task-input').value.trim();
        const newPriority = document.getElementById('edit-task-priority').value;
        const newDate = document.getElementById('edit-task-date').value;

        if (!newTitle) return;

        state.tasks = state.tasks.map(task => {
            if (task.id === taskId) {
                return {
                    ...task,
                    title: newTitle,
                    priority: newPriority,
                    dueDate: newDate || null
                };
            }
            return task;
        });

        saveTasks(state.tasks);
        triggerRender();
        closeEditModal();
    });

    // 2. Dismiss handlers
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
}

// ==========================================================================
// Theme (Light/Dark Mode Toggle)
// ==========================================================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

/**
 * Switches global HTML theme class and updates icon tags.
 * @param {'dark'|'light'} theme - Target theme preference
 */
function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.classList.remove('dark');
        themeIcon.textContent = 'light_mode';
    } else {
        document.documentElement.classList.add('dark');
        themeIcon.textContent = 'dark_mode';
    }
}

function initThemeActions() {
    const preference = loadThemePreference();
    applyTheme(preference);

    themeToggleBtn.addEventListener('click', () => {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const nextTheme = isCurrentlyDark ? 'light' : 'dark';
        applyTheme(nextTheme);
        saveThemePreference(nextTheme);
    });
}

// ==========================================================================
// General Event Listeners
// ==========================================================================
function initGeneralActions() {
    // 1. Creation Form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskInput.value.trim();
        const priority = state.currentSelectedPriority;
        const date = taskDateInput.value;

        if (!title) return;

        // Create and append task
        const newTask = createTaskInstance(title, priority, date);
        state.tasks.unshift(newTask);
        saveTasks(state.tasks);

        // Reset inputs
        taskInput.value = '';
        taskDateInput.value = '';
        dateBadge.classList.add('hidden');
        resetPrioritySelector();

        triggerRender();
    });

    // 2. Live Search Input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        triggerRender();
    });

    // 3. Focus input from header Add button
    headerAddTaskBtn.addEventListener('click', () => {
        taskInput.focus();
        taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // 4. Sort Priority Trigger
    const sortBtn = document.getElementById('sort-priority-btn');
    sortBtn.addEventListener('click', () => {
        state.sortByPriority = !state.sortByPriority;
        triggerRender();
    });

    // 5. Sidebar Navigation link indicator switches
    const navLinks = document.querySelectorAll('aside nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => {
                l.className = "text-on-surface-variant flex items-center gap-3 px-6 py-3 hover:bg-surface-container-high hover:text-on-surface transition-all duration-150 active:scale-[0.98]";
            });
            link.className = "nav-link-active flex items-center gap-3 px-6 py-3 transition-all duration-150 active:scale-[0.98]";
            
            const viewId = link.id.replace('nav-', '');
            state.currentView = viewId; // 'dashboard', 'tasks', 'calendar', 'settings'
            triggerRender();
        });
    });

    // 6. Calendar Navigation Buttons
    const calPrevBtn = document.getElementById('cal-prev-btn');
    const calNextBtn = document.getElementById('cal-next-btn');
    const calTodayBtn = document.getElementById('cal-today-btn');
    
    if (calPrevBtn) {
        calPrevBtn.addEventListener('click', () => {
            state.calendarCurrentMonth.setMonth(state.calendarCurrentMonth.getMonth() - 1);
            triggerRender();
        });
    }
    if (calNextBtn) {
        calNextBtn.addEventListener('click', () => {
            state.calendarCurrentMonth.setMonth(state.calendarCurrentMonth.getMonth() + 1);
            triggerRender();
        });
    }
    if (calTodayBtn) {
        calTodayBtn.addEventListener('click', () => {
            state.calendarCurrentMonth = new Date();
            triggerRender();
        });
    }

    // 7. Tasks View — "New Task" button scrolls/focuses to top input
    const tasksViewAddBtn = document.getElementById('tasks-view-add-btn');
    if (tasksViewAddBtn) {
        tasksViewAddBtn.addEventListener('click', () => {
            // Switch to dashboard and focus the input
            state.currentView = 'dashboard';
            // Reflect active nav link
            const navLinks = document.querySelectorAll('aside nav a');
            navLinks.forEach(l => {
                l.className = "text-on-surface-variant flex items-center gap-3 px-6 py-3 hover:bg-surface-container-high hover:text-on-surface transition-all duration-150 active:scale-[0.98]";
            });
            const dashLink = document.getElementById('nav-dashboard');
            if (dashLink) dashLink.className = "nav-link-active flex items-center gap-3 px-6 py-3 transition-all duration-150 active:scale-[0.98]";
            triggerRender();
            setTimeout(() => {
                taskInput.focus();
                taskInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 50);
        });
    }

    // 8. Tasks View — Sort by Priority button
    const tasksSortBtn = document.getElementById('tasks-sort-priority-btn');
    if (tasksSortBtn) {
        tasksSortBtn.addEventListener('click', () => {
            state.sortByPriority = !state.sortByPriority;
            triggerRender();
        });
    }
}

// ==========================================================================
// Application Bootstrap
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // Load state
    state.tasks = loadTasks();

    // Initialize triggers
    initThemeActions();
    setMinDateLimits();
    initDatePickerActions();
    initPrioritySelector();
    initEditModalActions();
    initGeneralActions();

    // Initial render call
    triggerRender();
});
