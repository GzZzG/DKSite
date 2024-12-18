// 全局变量
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
let currentDate = new Date().getDate();

// DOM 元素
const tasksContainer = document.querySelector('.tasks-container');
const addTaskBtn = document.querySelector('.add-task-btn');
const taskModal = document.getElementById('taskModal');
const taskForm = document.getElementById('taskForm');
const dateDisplay = document.querySelector('.date');

// 获取优先级图标
function getPriorityIcon(priority) {
    const icons = {
        high: '<i class="ri-error-warning-line"></i>',
        medium: '<i class="ri-checkbox-blank-circle-line"></i>',
        low: '<i class="ri-minus-line"></i>'
    };
    return icons[priority] || icons.medium;
}

// 格式化截止日期
function formatDueDate(date) {
    const dueDate = new Date(date);
    const now = new Date();
    const diff = dueDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return '已过期';
    if (days === 0) return '今天截止';
    if (days === 1) return '明天��止';
    return `${days}天后截止`;
}

// 更新日期显示
function updateDateDisplay() {
    const now = new Date(currentYear, currentMonth, currentDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    dateDisplay.textContent = now.toLocaleDateString('zh-CN', options);
}

// 保存任务并更新UI
function saveTasksAndUpdate() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    renderTasks();
    updateStatistics();
}

// 切换任务完成状态
function toggleTaskComplete(taskId) {
    tasks = tasks.map(task => {
        if (task.id === taskId) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasksAndUpdate();
}

// 删除任务
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksAndUpdate();
}

// 编辑任务
function editTask(task) {
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDescription').value = task.description || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskDueDate').value = task.dueDate || '';

    taskModal.classList.add('active');

    taskForm.onsubmit = (e) => {
        e.preventDefault();
        const updatedTask = {
            ...task,
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
        };
        tasks = tasks.map(t => t.id === task.id ? updatedTask : t);
        saveTasksAndUpdate();
        closeModal();
    };
}

// 渲染任务列表
function renderTasks() {
    tasksContainer.innerHTML = '';
    const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toDateString();
        const today = new Date().toDateString();
        return taskDate === today;
    });

    if (todayTasks.length === 0) {
        tasksContainer.innerHTML = '<div class="no-tasks">今天还没有任务</div>';
    } else {
        todayTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            tasksContainer.appendChild(taskElement);
        });
    }
}

// 创建任务元素
function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
    taskDiv.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-content">
            <div class="task-title">${task.title}</div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span class="task-priority priority-${task.priority}">
                    ${getPriorityIcon(task.priority)} ${task.priority}
                </span>
                ${task.dueDate ? `<span class="task-due-date"><i class="ri-time-line"></i> ${formatDueDate(task.dueDate)}</span>` : ''}
            </div>
        </div>
        <div class="task-actions">
            <button class="edit-btn"><i class="ri-edit-line"></i></button>
            <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
        </div>
    `;

    const checkbox = taskDiv.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));

    const editBtn = taskDiv.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => editTask(task));

    const deleteBtn = taskDiv.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    return taskDiv;
}

// 更新统计信息
function updateStatistics() {
    const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toDateString();
        const today = new Date().toDateString();
        return taskDate === today;
    });

    const completedTasks = todayTasks.filter(task => task.completed);
    const completionRate = todayTasks.length ? (completedTasks.length / todayTasks.length) * 100 : 0;

    const progressCircle = document.querySelector('.progress-circle');
    progressCircle.style.background = `conic-gradient(var(--primary-color) ${completionRate}%, #E9ECEF ${completionRate}%)`;
    document.querySelector('.percentage').textContent = `${Math.round(completionRate)}%`;
}

// 初始化总览
function initializeOverview() {
    updateDateSelectors();
    renderYearView();
    setupDateNavigation();
}

// 更新日期选择器
function updateDateSelectors() {
    document.getElementById('yearSelector').textContent = `${currentYear}年`;
    document.getElementById('monthSelector').textContent = `${currentMonth + 1}月`;
    document.getElementById('daySelector').textContent = `${currentDate}日`;
}

// 设置事件监听器
function setupEventListeners() {
    // 添加新任务按钮
    addTaskBtn.addEventListener('click', () => {
        taskForm.reset();
        taskModal.classList.add('active');
        
        taskForm.onsubmit = (e) => {
            e.preventDefault();
            const newTask = {
                id: Date.now(),
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                priority: document.getElementById('taskPriority').value,
                dueDate: document.getElementById('taskDueDate').value,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.push(newTask);
            saveTasksAndUpdate();
            closeModal();
        };
    });

    // 取消按钮
    document.querySelector('.cancel').addEventListener('click', closeModal);

    // 点击模态框外部关闭
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            closeModal();
        }
    });

    // 导航栏切换
    document.querySelectorAll('.nav-links li').forEach(navItem => {
        navItem.addEventListener('click', () => {
            document.querySelector('.nav-links li.active').classList.remove('active');
            navItem.classList.add('active');
            
            const text = navItem.textContent.trim();
            const isSettings = text === '设置';
            const isOverview = text === '总览';
            
            document.getElementById('settingsPanel').style.display = isSettings ? 'block' : 'none';
            document.getElementById('overviewPanel').style.display = isOverview ? 'block' : 'none';
            document.querySelector('.tasks-container').style.display = (!isSettings && !isOverview) ? 'block' : 'none';
            
            if (isOverview) {
                initializeOverview();
            } else if (!isSettings) {
                currentYear = new Date().getFullYear();
                currentMonth = new Date().getMonth();
                currentDate = new Date().getDate();
                updateDateDisplay();
            }
        });
    });

    // 设置日期导航事件
    document.getElementById('yearSelector').addEventListener('click', () => {
        document.getElementById('yearView').style.display = 'block';
        document.getElementById('monthView').style.display = 'none';
        document.getElementById('dayView').style.display = 'none';
    });
    
    document.getElementById('monthSelector').addEventListener('click', () => {
        showMonthView();
    });
    
    document.getElementById('daySelector').addEventListener('click', () => {
        showDayView(currentDate);
    });
}

// 关闭模态框
function closeModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
}

// 初始化应用
function init() {
    updateDateDisplay();
    renderTasks();
    updateStatistics();
    initColorSettings();
    setupEventListeners();
    
    const savedColor = localStorage.getItem('backgroundColor');
    if (savedColor === '#2D3436') {
        document.body.setAttribute('data-theme', 'dark');
    }
}

// 启动应用
init(); 

// 渲染年度视图
function renderYearView() {
    const monthsGrid = document.querySelector('.months-grid');
    monthsGrid.innerHTML = '';
    
    for (let month = 0; month < 12; month++) {
        const monthStats = calculateMonthStats(currentYear, month);
        const monthCard = createMonthCard(month, monthStats);
        monthsGrid.appendChild(monthCard);
    }
}

// 创建月份卡片
function createMonthCard(month, stats) {
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', 
                       '七月', '八月', '九月', '十月', '十一月', '十二月'];
    
    const div = document.createElement('div');
    div.className = 'month-card';
    div.innerHTML = `
        <h4>${monthNames[month]}</h4>
        <div class="month-stats">
            <div class="completion-bar">
                <div class="completion-progress" style="width: ${stats.completionRate}%"></div>
            </div>
            <span>${stats.completedTasks}/${stats.totalTasks} 已完成</span>
        </div>
    `;
    
    div.addEventListener('click', () => {
        currentMonth = month;
        showMonthView();
    });
    
    return div;
}

// 计算月度统计
function calculateMonthStats(year, month) {
    const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });
    
    const completedTasks = monthTasks.filter(task => task.completed).length;
    const totalTasks = monthTasks.length;
    const completionRate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
    
    return {
        completedTasks,
        totalTasks,
        completionRate
    };
}

// 显示月度视图
function showMonthView() {
    document.getElementById('yearView').style.display = 'none';
    document.getElementById('monthView').style.display = 'block';
    document.getElementById('dayView').style.display = 'none';
    
    renderMonthView();
}

// 渲染月度视图
function renderMonthView() {
    const daysGrid = document.querySelector('.days-grid');
    daysGrid.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    
    // 添加空白填充
    for (let i = 0; i < startPadding; i++) {
        daysGrid.appendChild(createEmptyDayCell());
    }
    
    // 添加日期
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayCell = createDayCell(day);
        daysGrid.appendChild(dayCell);
    }
}

// 创建空白日期单元格
function createEmptyDayCell() {
    const div = document.createElement('div');
    div.className = 'day-cell empty';
    return div;
}

// 创建日期单元格
function createDayCell(day) {
    const div = document.createElement('div');
    div.className = 'day-cell';
    
    const isToday = isCurrentDay(day);
    if (isToday) div.classList.add('today');
    
    const dayTasks = getDayTasks(day);
    
    // 创建日期和任务容器
    const dateContainer = document.createElement('div');
    dateContainer.className = 'day-date';
    dateContainer.textContent = day;
    div.appendChild(dateContainer);
    
    if (dayTasks.length > 0) {
        div.classList.add('has-tasks');
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'day-tasks-list';
        
        // 显示前5个任务的标题
        dayTasks.slice(0, 5).forEach(task => {
            const taskTitle = document.createElement('div');
            taskTitle.className = `day-task-title ${task.completed ? 'completed' : ''}`;
            taskTitle.innerHTML = `
                <span class="task-dot priority-${task.priority}"></span>
                ${task.title}
            `;
            tasksContainer.appendChild(taskTitle);
        });
        
        if (dayTasks.length > 5) {
            const more = document.createElement('div');
            more.className = 'more-tasks';
            more.textContent = `+${dayTasks.length - 5}`;
            tasksContainer.appendChild(more);
        }
        
        div.appendChild(tasksContainer);
    }
    
    div.addEventListener('click', () => {
        currentDate = day;
        showDayView(day);
    });
    
    return div;
}

// 判断是否是当前日期
function isCurrentDay(day) {
    const now = new Date();
    return currentYear === now.getFullYear() && 
           currentMonth === now.getMonth() && 
           day === now.getDate();
}

// 获取某天的任务
function getDayTasks(day) {
    return tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.getFullYear() === currentYear && 
               taskDate.getMonth() === currentMonth && 
               taskDate.getDate() === day;
    });
}

// 显示日视图
function showDayView(day) {
    document.getElementById('yearView').style.display = 'none';
    document.getElementById('monthView').style.display = 'none';
    document.getElementById('dayView').style.display = 'block';
    
    // 更新日期选择器
    document.getElementById('yearSelector').textContent = `${currentYear}年`;
    document.getElementById('monthSelector').textContent = `${currentMonth + 1}月`;
    document.getElementById('daySelector').textContent = `${day}日`;
    
    renderDayView(day);
}

// 渲染日视图
function renderDayView(day) {
    const dayView = document.getElementById('dayView');
    const dayTasks = getDayTasks(day);
    
    dayView.innerHTML = `
        <div class="day-header">
            <h3>${currentYear}年${currentMonth + 1}月${day}日</h3>
            <div class="day-stats">
                完成率: ${calculateDayCompletionRate(dayTasks)}%
            </div>
        </div>
        <div class="day-tasks">
            ${dayTasks.map(task => createDayTaskHTML(task)).join('')}
        </div>
    `;
}

// 计算日完成率
function calculateDayCompletionRate(dayTasks) {
    if (dayTasks.length === 0) return 0;
    const completed = dayTasks.filter(task => task.completed).length;
    return Math.round((completed / dayTasks.length) * 100);
}

// 创建日视图任务HTML
function createDayTaskHTML(task) {
    return `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">
                        ${getPriorityIcon(task.priority)} ${task.priority}
                    </span>
                    ${task.dueDate ? `<span class="task-due-date">
                        <i class="ri-time-line"></i> ${formatDueDate(task.dueDate)}
                    </span>` : ''}
                </div>
            </div>
        </div>
    `;
}

// 设置日期导航
function setupDateNavigation() {
    document.getElementById('yearSelector').addEventListener('click', () => {
        document.getElementById('yearView').style.display = 'block';
        document.getElementById('monthView').style.display = 'none';
        document.getElementById('dayView').style.display = 'none';
    });
    
    document.getElementById('monthSelector').addEventListener('click', () => {
        showMonthView();
    });
    
    document.getElementById('daySelector').addEventListener('click', () => {
        showDayView(currentDate);
    });
}

// 背景色设置
function initColorSettings() {
    const savedColor = localStorage.getItem('backgroundColor') || '#F8F9FA';
    setBackgroundColor(savedColor);
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            const color = option.dataset.color;
            setBackgroundColor(color);
            localStorage.setItem('backgroundColor', color);
            
            // 更新选中状态
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // 根据颜色设置主题
            document.body.removeAttribute('data-theme');
            switch (color) {
                case '#FFE5B4':
                    document.body.setAttribute('data-theme', 'light-orange');
                    break;
                case '#FFF68F':
                    document.body.setAttribute('data-theme', 'light-yellow');
                    break;
                case '#E3F2FD':
                    document.body.setAttribute('data-theme', 'light-blue');
                    break;
                case '#E8F5E9':
                    document.body.setAttribute('data-theme', 'light-green');
                    break;
                case '#2D3436':
                    document.body.setAttribute('data-theme', 'dark');
                    break;
                default:
                    // 默认浅色主题
                    break;
            }
        });
        
        // 设置初始选中状态和主题
        if (option.dataset.color === savedColor) {
            option.classList.add('active');
            // 设置初始主题
            const color = option.dataset.color;
            switch (color) {
                case '#FFE5B4':
                    document.body.setAttribute('data-theme', 'light-orange');
                    break;
                case '#FFF68F':
                    document.body.setAttribute('data-theme', 'light-yellow');
                    break;
                case '#E3F2FD':
                    document.body.setAttribute('data-theme', 'light-blue');
                    break;
                case '#E8F5E9':
                    document.body.setAttribute('data-theme', 'light-green');
                    break;
                case '#2D3436':
                    document.body.setAttribute('data-theme', 'dark');
                    break;
            }
        }
    });
}

// 设置背景色
function setBackgroundColor(color) {
    document.documentElement.style.setProperty('--background-color', color);
} 