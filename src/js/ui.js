/**
 * Smart Task Manager - UI Rendering Layer
 * Translates the application state into the Stitch-designed DOM structure.
 */

/**
 * Escapes HTML strings to prevent XSS.
 * @param {string} str - Unescaped string
 * @returns {string} Escaped HTML string
 */
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Formats a date string into a friendly relative format (e.g. 'Today', 'Tomorrow', 'Oct 24, 2026').
 * @param {string|null} dateStr - YYYY-MM-DD date string
 * @returns {string} Formatted label
 */
function formatDueDate(dateStr) {
    if (!dateStr) return '';
    
    // Parse target date and reset time details
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);
    
    // Parse today and reset time details
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate time difference in ms
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Tomorrow';
    } else if (diffDays === -1) {
        return 'Yesterday';
    } else {
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return targetDate.toLocaleDateString(undefined, options);
    }
}

/**
 * Main application rendering coordinator.
 * @param {Object} state - Current application state
 * @param {import('./storage.js').Task[]} state.tasks - Complete task array
 * @param {string} state.searchQuery - Live filtering query
 * @param {boolean} state.sortByPriority - Is priority sorting enabled?
 * @param {Object} callbacks - Interaction callback delegates
 * @param {function(string): void} callbacks.onToggleComplete - Checkbox toggle
 * @param {function(string): void} callbacks.onDelete - Deletion trigger
 * @param {function(import('./storage.js').Task): void} callbacks.onEdit - Modal opening trigger
 */
export function renderApp(state, callbacks) {
    const { tasks, searchQuery, sortByPriority, currentView, calendarCurrentMonth } = state;

    // 1. Calculate General Statistics
    const totalCountVal = tasks.length;
    const completedCountVal = tasks.filter(t => t.completed).length;
    const pendingCountVal = totalCountVal - completedCountVal;

    // 2. Update Stats DOM (safe: these elements always exist in index.html)
    document.getElementById('total-count').textContent = totalCountVal;
    document.getElementById('pending-count').textContent = pendingCountVal;
    document.getElementById('completed-count').textContent = completedCountVal;
    document.getElementById('completed-count-badge').textContent = completedCountVal;

    // 3. Update Greeting Subtitle dynamically based on pending tasks
    const greetingSubtitle = document.getElementById('greeting-subtitle');
    if (greetingSubtitle) {
        if (pendingCountVal === 0) {
            greetingSubtitle.textContent = "You have 0 tasks pending for today. Let's make it productive.";
        } else {
            greetingSubtitle.textContent = `You have ${pendingCountVal} task${pendingCountVal > 1 ? 's' : ''} pending for today. Let's make it productive.`;
        }
    }

    // 4. Update Header Greeting based on current local time
    const greetingTitle = document.getElementById('greeting-title');
    if (greetingTitle) {
        const curHour = new Date().getHours();
        let welcomePrefix = 'Good morning';
        if (curHour >= 12 && curHour < 17) {
            welcomePrefix = 'Good afternoon';
        } else if (curHour >= 17) {
            welcomePrefix = 'Good evening';
        }
        greetingTitle.innerHTML = `${welcomePrefix}, <span class="bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] bg-clip-text text-transparent">Saumya</span>`;
    }

    // 5. Update Current Date Display in header
    const currentDateDisplay = document.getElementById('current-date-display');
    if (currentDateDisplay) {
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        currentDateDisplay.textContent = new Date().toLocaleDateString(undefined, dateOptions);
    }

    // 6. Resolve View Containers
    const dashboardView = document.getElementById('dashboard-view');
    const tasksView     = document.getElementById('tasks-view');
    const calendarView  = document.getElementById('calendar-view');
    const settingsView  = document.getElementById('settings-view');

    // Hide all views first, then show the active one
    [dashboardView, tasksView, calendarView, settingsView].forEach(v => v && v.classList.add('hidden'));

    if (currentView === 'calendar') {
        calendarView.classList.remove('hidden');
        const calendarGridContainer = document.getElementById('calendar-grid-container');
        renderCalendarSection(calendarGridContainer, tasks, calendarCurrentMonth, callbacks);

    } else if (currentView === 'settings') {
        settingsView.classList.remove('hidden');

    } else if (currentView === 'tasks') {
        tasksView.classList.remove('hidden');

        // Filter & split
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );
        const pendingTasks   = filteredTasks.filter(t => !t.completed);
        const completedTasks = filteredTasks.filter(t => t.completed);

        // Sort if active
        const tasksSortBtn = document.getElementById('tasks-sort-priority-btn');
        if (sortByPriority) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            pendingTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            if (tasksSortBtn) tasksSortBtn.classList.add('text-primary', 'font-bold');
        } else {
            if (tasksSortBtn) tasksSortBtn.classList.remove('font-bold');
        }

        // Update tasks-view subtitle
        const tasksSubtitle = document.getElementById('tasks-view-subtitle');
        if (tasksSubtitle) {
            tasksSubtitle.textContent = pendingTasks.length === 0
                ? 'All caught up! No pending tasks.'
                : `${pendingTasks.length} pending · ${completedTasks.length} completed`;
        }

        // Update completed badge
        const tasksCompletedBadge = document.getElementById('tasks-completed-count-badge');
        if (tasksCompletedBadge) tasksCompletedBadge.textContent = completedTasks.length;

        renderPendingSection(document.getElementById('tasks-pending-list'), pendingTasks, callbacks);
        renderCompletedSection(document.getElementById('tasks-completed-list'), completedTasks, callbacks);

    } else {
        // Default: dashboard view
        dashboardView.classList.remove('hidden');

        // 7. Filter tasks by Live Search Query
        const filteredTasks = tasks.filter(task =>
            task.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );

        // 8. Split tasks into lists
        const pendingTasks = filteredTasks.filter(t => !t.completed);
        const completedTasks = filteredTasks.filter(t => t.completed);

        // 9. Sort pending tasks by priority if enabled (High -> Medium -> Low)
        const sortBtn = document.getElementById('sort-priority-btn');
        if (sortByPriority) {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            pendingTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            if (sortBtn) sortBtn.classList.add('text-primary', 'font-bold');
        } else {
            if (sortBtn) sortBtn.classList.remove('font-bold');
        }

        // 10. Render pending & completed lists
        const pendingListContainer = document.getElementById('pending-list');
        const completedListContainer = document.getElementById('completed-list');
        renderPendingSection(pendingListContainer, pendingTasks, callbacks);
        renderCompletedSection(completedListContainer, completedTasks, callbacks);
    }
}

/**
 * Renders the monthly calendar grid view mapping tasks to specific dates.
 */
function renderCalendarSection(container, tasks, currentMonthDate, callbacks) {
    container.innerHTML = '';
    
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    
    // Update Month Display
    const monthDisplay = document.getElementById('calendar-month-display');
    if (monthDisplay) {
        monthDisplay.textContent = currentMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }
    
    // Days in month & start day
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    // Create Grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-7 gap-2 md:gap-4';
    
    // Day Headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const header = document.createElement('div');
        header.className = 'text-center font-label-caps text-xs text-on-surface-variant font-bold uppercase pb-2';
        header.textContent = day;
        grid.appendChild(header);
    });
    
    // Empty cells
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'min-h-[80px] md:min-h-[120px] rounded-xl border border-transparent bg-transparent';
        grid.appendChild(emptyCell);
    }
    
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const cell = document.createElement('div');
        const isToday = isCurrentMonth && today.getDate() === d;
        
        let cellClasses = 'min-h-[80px] md:min-h-[120px] p-2 md:p-3 rounded-xl border flex flex-col transition-all cursor-pointer hover:bg-surface-container overflow-hidden ';
        if (isToday) {
            cellClasses += 'border-primary bg-primary/5';
        } else {
            cellClasses += 'border-outline-variant/30 bg-surface-container-lowest';
        }
        cell.className = cellClasses;
        
        const dayLabel = document.createElement('span');
        dayLabel.className = 'text-sm font-mono-ui mb-2 ' + (isToday ? 'text-primary font-bold' : 'text-on-surface-variant');
        dayLabel.textContent = d;
        cell.appendChild(dayLabel);
        
        // Filter tasks for this date
        const cellDateStr = `${year}-${String(month+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        
        const dayTasks = tasks.filter(t => t.dueDate && t.dueDate.startsWith(cellDateStr) && !t.completed);
        
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'flex flex-col gap-1 overflow-y-auto flex-1 custom-scrollbar';
        
        dayTasks.forEach(task => {
            const taskEl = document.createElement('div');
            
            let dotColor = 'bg-blue-500';
            if (task.priority === 'high') dotColor = 'bg-red-500';
            else if (task.priority === 'medium') dotColor = 'bg-yellow-500';
            
            taskEl.className = 'text-[10px] md:text-xs px-2 py-1 rounded bg-surface-container border border-outline-variant/20 text-on-surface truncate flex items-center gap-1.5 shadow-sm hover:border-primary/50 transition-colors';
            taskEl.innerHTML = `<span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span><span class="truncate">${escapeHtml(task.title)}</span>`;
            
            taskEl.addEventListener('click', (e) => {
                e.stopPropagation();
                callbacks.onEdit(task);
            });
            
            tasksContainer.appendChild(taskEl);
        });
        
        cell.appendChild(tasksContainer);
        grid.appendChild(cell);
    }
    
    container.appendChild(grid);
}

/**
 * Renders the pending tasks list with glass cards and priority styles.
 */
function renderPendingSection(container, tasks, callbacks) {
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="glass-card p-8 rounded-xl flex flex-col items-center justify-center text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl mb-2 opacity-50">checklist</span>
                <p class="text-sm">No pending tasks found. Type above to add a new task!</p>
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement('div');
        
        // Dynamic border color based on priority
        let borderClass = 'border-l-blue-500';
        let priorityLabelClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
        if (task.priority === 'high') {
            borderClass = 'border-l-red-500';
            priorityLabelClass = 'bg-red-500/10 text-red-400 border border-red-500/20';
        } else if (task.priority === 'medium') {
            borderClass = 'border-l-yellow-500';
            priorityLabelClass = 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
        }

        item.className = `glass-card group p-4 rounded-xl border-l-4 ${borderClass} flex items-center justify-between hover:bg-surface-container/50 transition-all cursor-pointer`;
        item.dataset.id = task.id;

        // Due date sub-badge
        let dateMarkup = '';
        if (task.dueDate) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const dueObj = new Date(task.dueDate);
            dueObj.setHours(0,0,0,0);
            
            const isOverdue = dueObj < today;
            const textClass = isOverdue ? 'text-red-400 font-semibold' : 'text-on-surface-variant';
            const iconName = isOverdue ? 'error' : 'event';
            const dateLabel = formatDueDate(task.dueDate);

            dateMarkup = `
                <span class="flex items-center gap-1 ${textClass} text-xs">
                    <span class="material-symbols-outlined text-[14px]">${iconName}</span>
                    ${dateLabel}${isOverdue ? ' (Overdue)' : ''}
                </span>
            `;
        }

        item.innerHTML = `
            <div class="flex items-center gap-4 flex-1">
                <!-- Checkbox -->
                <button type="button" class="check-box-btn w-6 h-6 border-2 border-outline-variant rounded flex items-center justify-center hover:border-primary transition-colors bg-surface-container-lowest shrink-0" aria-label="Mark completed">
                    <span class="material-symbols-outlined text-primary opacity-0 group-hover:opacity-60 text-sm transition-opacity">check</span>
                </button>
                <div class="flex-1">
                    <p class="font-body-md text-on-surface font-semibold break-words max-w-[280px] sm:max-w-md md:max-w-xl">${escapeHtml(task.title)}</p>
                    <div class="flex items-center flex-wrap gap-3 mt-1">
                        <span class="${priorityLabelClass} text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">${task.priority} Priority</span>
                        ${dateMarkup}
                    </div>
                </div>
            </div>
            <!-- Actions -->
            <div class="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2 shrink-0">
                <button type="button" class="edit-btn p-2 text-on-surface-variant hover:text-primary transition-colors" aria-label="Edit task" title="Edit Task">
                    <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button type="button" class="delete-btn p-2 text-on-surface-variant hover:text-error transition-colors" aria-label="Delete task" title="Delete Task">
                    <span class="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>
        `;

        // Event listener: Toggle completion on checkbox click
        const checkBoxBtn = item.querySelector('.check-box-btn');
        checkBoxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // Show check symbol immediately
            checkBoxBtn.querySelector('span').className = 'material-symbols-outlined text-primary text-sm check-icon-active';
            checkBoxBtn.querySelector('span').style.opacity = '1';
            
            item.classList.add('removing');
            setTimeout(() => {
                callbacks.onToggleComplete(task.id);
            }, 250);
        });

        // Event listener: Toggle completion on row click (excluding buttons)
        item.addEventListener('click', (e) => {
            if (e.target.closest('button')) return;
            checkBoxBtn.click();
        });

        // Event listener: Edit task click
        item.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            callbacks.onEdit(task);
        });

        // Event listener: Delete task click
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            item.classList.add('removing');
            setTimeout(() => {
                callbacks.onDelete(task.id);
            }, 250);
        });

        container.appendChild(item);
    });
}

/**
 * Renders the completed tasks list inside the collapsible container.
 */
function renderCompletedSection(container, tasks, callbacks) {
    container.innerHTML = '';

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 text-center text-on-surface-variant text-sm">
                No completed tasks found. Mark a task completed to populate!
            </div>
        `;
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 group hover:bg-surface-container transition-all`;
        
        let dateLabel = '';
        if (task.completedAt) {
            const dateObj = new Date(task.completedAt);
            const options = { month: 'short', day: 'numeric' };
            dateLabel = `Completed ${dateObj.toLocaleDateString(undefined, options)}`;
        } else {
            dateLabel = 'Completed';
        }

        item.innerHTML = `
            <div class="flex items-center gap-4 flex-grow min-w-0">
                <button type="button" class="check-box-btn w-6 h-6 bg-tertiary-container/20 rounded flex items-center justify-center shrink-0" aria-label="Mark pending">
                    <span class="material-symbols-outlined text-tertiary text-sm" style="font-variation-settings: 'FILL' 1;">check</span>
                </button>
                <p class="font-body-md text-on-surface line-through truncate flex-grow min-w-0 max-w-[200px] sm:max-w-xs md:max-w-lg">${escapeHtml(task.title)}</p>
            </div>
            <div class="flex items-center gap-3 shrink-0 ml-2">
                <span class="text-xs text-on-surface-variant font-mono-ui group-hover:hidden transition-all">${dateLabel}</span>
                <!-- Delete Completed button on hover -->
                <button type="button" class="delete-btn p-2 text-on-surface-variant hover:text-error transition-colors hidden group-hover:flex items-center" aria-label="Delete task" title="Delete Task">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        `;

        // Event listener: Toggle completion back to pending
        const checkBoxBtn = item.querySelector('.check-box-btn');
        checkBoxBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            item.style.opacity = '0.4';
            setTimeout(() => {
                callbacks.onToggleComplete(task.id);
            }, 150);
        });

        // Event listener: Delete task click
        item.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            item.style.opacity = '0.2';
            setTimeout(() => {
                callbacks.onDelete(task.id);
            }, 150);
        });

        container.appendChild(item);
    });
}
