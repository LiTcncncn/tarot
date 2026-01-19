// 能量 Boost 任务与能量值逻辑
const ENERGY_BOOST_CONFIG = {
    TASKS_PER_DAY: 1, // 每次显示 1 个任务
    COUNTDOWN_SECONDS: 15,
    ENERGY_PER_TASK: 5,
    ENERGY_DAILY_LIMIT: 5, // 每日最多完成 5 个任务获得能量值
    MAX_TASKS_PER_DAY: 5, // 每日最多完成 5 个任务
    HISTORY_DAYS: 3
};

const ENERGY_BOOST_STORAGE_KEYS = {
    TASKS: 'energy_boost_tasks',
    ENERGY: 'energy_boost_energy_points',
    STATS: 'energy_boost_stats',
    CHECKIN_TOAST: 'checkin_toast_shown'
};

function getEnergyBoostTasksKey(dateKey) {
    return `${ENERGY_BOOST_STORAGE_KEYS.TASKS}_${dateKey}`;
}

function getEnergyBoostStatsKey(dateKey) {
    return `${ENERGY_BOOST_STORAGE_KEYS.STATS}_${dateKey}`;
}

function getCheckinToastKey(dateKey) {
    return `${ENERGY_BOOST_STORAGE_KEYS.CHECKIN_TOAST}_${dateKey}`;
}

function getEnergyBoostState(dateKey = getTodayKey()) {
    const raw = localStorage.getItem(getEnergyBoostTasksKey(dateKey));
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error('能量Boost状态解析失败:', e);
        return null;
    }
}

function saveEnergyBoostState(state, dateKey = getTodayKey()) {
    localStorage.setItem(getEnergyBoostTasksKey(dateKey), JSON.stringify(state));
}

function buildEnergyTaskId(categoryKey, taskIndex) {
    return `${categoryKey}__${taskIndex}`;
}

function pickRandomItem(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

function getAvailableCategories(excludeTaskIds) {
    const categoryKeys = Object.keys(ENERGY_BOOST_TASKS);
    return categoryKeys.filter(key => {
        const tasks = ENERGY_BOOST_TASKS[key].tasks || [];
        return tasks.some((_, idx) => !excludeTaskIds.includes(buildEnergyTaskId(key, idx)));
    });
}

function findTaskContentById(taskId) {
    if (!taskId) return null;
    const [categoryKey, indexStr] = taskId.split('__');
    if (!categoryKey || typeof ENERGY_BOOST_TASKS[categoryKey] === 'undefined') return null;
    const idx = Number(indexStr);
    if (!Number.isInteger(idx)) return null;
    const tasks = ENERGY_BOOST_TASKS[categoryKey].tasks || [];
    return tasks[idx] || null;
}

function hydrateTaskContent(state) {
    let updated = false;
    state.tasks = (state.tasks || []).map(task => {
        const latestContent = findTaskContentById(task.id);
        if (latestContent && latestContent !== task.content) {
            updated = true;
            return {
                ...task,
                content: latestContent
            };
        }
        return task;
    });
    return updated;
}

function generateEnergyBoostTasks(excludeTaskIds = [], count = 1) {
    const availableCategories = getAvailableCategories(excludeTaskIds);
    if (availableCategories.length < count) {
        return null;
    }

    const shuffled = availableCategories.sort(() => Math.random() - 0.5);
    const selectedCategories = shuffled.slice(0, count);

    const tasks = [];
    selectedCategories.forEach(categoryKey => {
        const category = ENERGY_BOOST_TASKS[categoryKey];
        const taskPool = (category.tasks || [])
            .map((content, idx) => ({
                id: buildEnergyTaskId(categoryKey, idx),
                categoryKey,
                categoryCn: category.nameCn,
                content
            }))
            .filter(task => !excludeTaskIds.includes(task.id));

        const picked = pickRandomItem(taskPool);
        if (picked) {
            tasks.push({
                ...picked,
                status: 'pending',
                startTime: null,
                completedTime: null
            });
        }
    });

    if (tasks.length !== count) {
        return null;
    }

    return tasks;
}

function normalizeStartedTasks(state) {
    let updated = false;
    state.tasks = (state.tasks || []).map(task => {
        if (task.status === 'started') {
            updated = true;
            return {
                ...task,
                status: 'pending',
                startTime: null
            };
        }
        return task;
    });
    return updated;
}

function ensureEnergyBoostState() {
    const dateKey = getTodayKey();
    let state = getEnergyBoostState(dateKey);
    if (!state) {
        // 初始状态：生成第一个任务
        const tasks = generateEnergyBoostTasks([], 1);
        if (!tasks) return null;
        state = {
            date: dateKey,
            tasks,
            refreshCount: 0,
            generatedAt: new Date().toISOString(),
            todayAppearedTaskIds: tasks.map(task => task.id),
            totalCompletedToday: 0 // 今日已完成任务数
        };
        saveEnergyBoostState(state, dateKey);
        return state;
    }

    if (hydrateTaskContent(state)) {
        saveEnergyBoostState(state, dateKey);
    }

    // 如果当前没有任务，且今日完成数 < 5，自动生成下一个
    const stats = getTodayTaskStats();
    const completedCount = stats.totalCompleted || 0;
    if ((!state.tasks || state.tasks.length === 0) && completedCount < ENERGY_BOOST_CONFIG.MAX_TASKS_PER_DAY) {
        const newTasks = generateEnergyBoostTasks(state.todayAppearedTaskIds || [], 1);
        if (newTasks && newTasks.length > 0) {
            state.tasks = newTasks;
            state.todayAppearedTaskIds = [...(state.todayAppearedTaskIds || []), ...newTasks.map(task => task.id)];
            saveEnergyBoostState(state, dateKey);
        }
    }

    if (normalizeStartedTasks(state)) {
        saveEnergyBoostState(state, dateKey);
    }
    return state;
}

function refreshEnergyBoostTasks() {
    const dateKey = getTodayKey();
    const state = ensureEnergyBoostState();
    if (!state) return null;

    // 把当前任务也加入排除列表（如果还没有的话）
    const currentTaskIds = (state.tasks || []).map(t => t.id);
    const exclude = [...new Set([...(state.todayAppearedTaskIds || []), ...currentTaskIds])];

    const newTasks = generateEnergyBoostTasks(exclude, 1);
    if (!newTasks || newTasks.length === 0) {
        return null; // 没有可用的新任务
    }

    state.tasks = newTasks;
    state.refreshCount = (state.refreshCount || 0) + 1;
    state.todayAppearedTaskIds = [...exclude, ...newTasks.map(task => task.id)];
    saveEnergyBoostState(state, dateKey);
    return state;
}

function updateEnergyBoostTaskStatus(taskId, status) {
    const state = ensureEnergyBoostState();
    if (!state) return null;
    const task = state.tasks.find(item => item.id === taskId);
    if (!task) return null;

    if (status === 'started') {
        task.status = 'started';
        task.startTime = new Date().toISOString();
    } else if (status === 'completed') {
        task.status = 'completed';
        task.completedTime = new Date().toISOString();
    }
    saveEnergyBoostState(state);
    return task;
}

function getTodayTaskStats() {
    const dateKey = getTodayKey();
    const raw = localStorage.getItem(getEnergyBoostStatsKey(dateKey));
    if (raw) {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('能量Boost统计解析失败:', e);
        }
    }

    return {
        date: dateKey,
        categoryStats: {},
        totalCompleted: 0
    };
}

function saveTodayTaskStats(stats) {
    localStorage.setItem(getEnergyBoostStatsKey(stats.date), JSON.stringify(stats));
}

function updateTaskCompletionStats(categoryKey) {
    const stats = getTodayTaskStats();
    stats.categoryStats[categoryKey] = (stats.categoryStats[categoryKey] || 0) + 1;
    stats.totalCompleted = (stats.totalCompleted || 0) + 1;
    saveTodayTaskStats(stats);
    return stats;
}

function getEnergyPointsData() {
    const raw = localStorage.getItem(ENERGY_BOOST_STORAGE_KEYS.ENERGY);
    let data = {
        total: 0,
        history: [],
        lastUpdated: null
    };
    if (raw) {
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error('能量值解析失败:', e);
        }
    }

    const originalLength = (data.history || []).length;
    data.history = pruneEnergyHistory(data.history || []);
    if (data.history.length !== originalLength) {
        saveEnergyPointsData(data);
    }
    return data;
}

function saveEnergyPointsData(data) {
    localStorage.setItem(ENERGY_BOOST_STORAGE_KEYS.ENERGY, JSON.stringify(data));
}

function pruneEnergyHistory(history) {
    const today = new Date(getTodayKey());
    return history.filter(entry => {
        if (!entry.date) return false;
        const entryDate = new Date(entry.date);
        const diffDays = Math.floor((today - entryDate) / (24 * 60 * 60 * 1000));
        return diffDays >= 0 && diffDays < ENERGY_BOOST_CONFIG.HISTORY_DAYS;
    });
}

function addEnergyPoints(points, tasksCompleted) {
    const data = getEnergyPointsData();
    const todayKey = getTodayKey();
    let entry = data.history.find(item => item.date === todayKey);
    if (!entry) {
        entry = {
            date: todayKey,
            earned: 0,
            source: 'tasks',
            tasksCompleted: 0
        };
        data.history.push(entry);
    }
    data.total = (data.total || 0) + points;
    entry.earned += points;
    entry.tasksCompleted = tasksCompleted;
    data.lastUpdated = new Date().toISOString();
    data.history = pruneEnergyHistory(data.history);
    saveEnergyPointsData(data);
    return data;
}

function getEnergyPointsTotal() {
    const data = getEnergyPointsData();
    return data.total || 0;
}

function completeEnergyBoostTask(taskId) {
    const state = ensureEnergyBoostState();
    if (!state) return null;
    const task = state.tasks.find(item => item.id === taskId);
    if (!task || task.status === 'completed') {
        return { success: false, awarded: false, total: getEnergyPointsTotal() };
    }

    updateEnergyBoostTaskStatus(taskId, 'completed');
    const stats = updateTaskCompletionStats(task.categoryKey);
    let awarded = false;
    let energyData = null;

    if (stats.totalCompleted <= ENERGY_BOOST_CONFIG.ENERGY_DAILY_LIMIT) {
        energyData = addEnergyPoints(ENERGY_BOOST_CONFIG.ENERGY_PER_TASK, stats.totalCompleted);
        awarded = true;
    }

    // 更新状态中的完成数
    state.totalCompletedToday = stats.totalCompleted;
    
    // 如果已完成数 < 5，自动生成下一个任务
    if (stats.totalCompleted < ENERGY_BOOST_CONFIG.MAX_TASKS_PER_DAY) {
        const newTasks = generateEnergyBoostTasks(state.todayAppearedTaskIds || [], 1);
        if (newTasks && newTasks.length > 0) {
            state.tasks = newTasks;
            state.todayAppearedTaskIds = [...(state.todayAppearedTaskIds || []), ...newTasks.map(task => task.id)];
        } else {
            // 如果没有可用任务，清空任务列表
            state.tasks = [];
        }
    } else {
        // 已完成 5 个任务，清空任务列表
        state.tasks = [];
    }
    
    saveEnergyBoostState(state);

    return {
        success: true,
        awarded,
        total: (energyData ? energyData.total : getEnergyPointsTotal()),
        completedCount: stats.totalCompleted,
        hasMore: stats.totalCompleted < ENERGY_BOOST_CONFIG.MAX_TASKS_PER_DAY
    };
}
