/**
 * Smart Task Manager - Backend Logic & Storage Layer
 * Manages localStorage persistence and task data structures.
 */

const STORAGE_KEY = 'taskflow_tasks';
const THEME_KEY = 'taskflow_theme';

/**
 * Task Object Schema:
 * @typedef {Object} Task
 * @property {string} id - Unique identifier
 * @property {string} title - Task description
 * @property {'low'|'medium'|'high'} priority - Priority level
 * @property {string|null} dueDate - ISO Date String or null
 * @property {boolean} completed - Task completion status
 * @property {string} createdAt - Creation timestamp
 */

/**
 * Load tasks array from localStorage.
 * @returns {Task[]} List of tasks
 */
export function loadTasks() {
    try {
        const tasksJSON = localStorage.getItem(STORAGE_KEY);
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    } catch (error) {
        console.error('[Storage Agent] Error reading tasks from localStorage:', error);
        return [];
    }
}

/**
 * Save tasks array to localStorage.
 * @param {Task[]} tasks - List of tasks to persist
 */
export function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('[Storage Agent] Error saving tasks to localStorage:', error);
    }
}

/**
 * Create a new task object.
 * @param {string} title - Task description
 * @param {'low'|'medium'|'high'} priority - Priority level
 * @param {string|null} dueDate - Date string or null
 * @returns {Task} New task instance
 */
export function createTaskInstance(title, priority = 'medium', dueDate = null) {
    return {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        priority: priority,
        dueDate: dueDate || null,
        completed: false,
        createdAt: new Date().toISOString()
    };
}

/**
 * Load theme preference from localStorage.
 * @returns {string} 'dark' or 'light'
 */
export function loadThemePreference() {
    try {
        return localStorage.getItem(THEME_KEY) || 'dark';
    } catch (error) {
        console.error('[Storage Agent] Error reading theme from localStorage:', error);
        return 'dark';
    }
}

/**
 * Save theme preference to localStorage.
 * @param {string} theme - 'dark' or 'light'
 */
export function saveThemePreference(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.error('[Storage Agent] Error saving theme to localStorage:', error);
    }
}
