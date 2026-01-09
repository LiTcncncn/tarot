// 数据存储管理（使用 localStorage）

const STORAGE_KEYS = {
    DAILY_READINGS: 'tarot_mirror_daily_readings',
    SETTINGS: 'tarot_mirror_settings'
};

// 获取今日日期字符串（YYYY-MM-DD，本地时区）
function getTodayKey() {
    const today = new Date();
    return getDateKey(today);
}

// 检查今日是否已完成占卜
function hasTodayReading() {
    const todayKey = getTodayKey();
    const readings = getAllReadings();
    return readings.hasOwnProperty(todayKey);
}

// 获取今日占卜数据
function getTodayReading() {
    const todayKey = getTodayKey();
    const readings = getAllReadings();
    return readings[todayKey] || null;
}

// 保存今日占卜数据
function saveTodayReading(readingData) {
    const todayKey = getTodayKey();
    const readings = getAllReadings();
    
    readings[todayKey] = {
        ...readingData,
        date: todayKey,
        timestamp: new Date().toISOString()
    };
    
    // 确保保存实际正逆位和强度等级（如果存在）
    if (readingData.card) {
        readings[todayKey].card = {
            ...readingData.card,
            actualReversed: readingData.card.actualReversed !== undefined ? readingData.card.actualReversed : false,
            intensity: readingData.card.intensity || getCardIntensity(readingData.card.name)
        };
    }
    
    localStorage.setItem(STORAGE_KEYS.DAILY_READINGS, JSON.stringify(readings));
}

// 获取所有占卜记录
function getAllReadings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.DAILY_READINGS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Error reading storage:', e);
        return {};
    }
}

// 获取指定日期范围内的占卜记录（用于周/月总结）
function getReadingsInRange(startDate, endDate) {
    const allReadings = getAllReadings();
    const filtered = {};
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    Object.keys(allReadings).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date >= start && date <= end) {
            filtered[dateKey] = allReadings[dateKey];
        }
    });
    
    return filtered;
}

// 获取本周的占卜记录
function getWeekReadings() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - dayOfWeek); // 本周第一天（周日）
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    
    return getReadingsInRange(startDate, endDate);
}

// 获取本月的占卜记录
function getMonthReadings() {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return getReadingsInRange(startDate, endDate);
}

// 清除所有数据（用于测试）
function clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.DAILY_READINGS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

// 导出数据（用于备份）
function exportData() {
    const data = {
        readings: getAllReadings(),
        exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

// 导入数据（用于恢复）
function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (data.readings) {
            localStorage.setItem(STORAGE_KEYS.DAILY_READINGS, JSON.stringify(data.readings));
            return true;
        }
        return false;
    } catch (e) {
        console.error('Error importing data:', e);
        return false;
    }
}

// 获取指定日期的占卜数据
function getReadingByDate(dateString) {
    const readings = getAllReadings();
    return readings[dateString] || null;
}

// 检查指定日期是否完成签到（完成占卜且完成任务）
function isDateCompleted(dateString) {
    const reading = getReadingByDate(dateString);
    if (!reading) return false;
    // 完成占卜（有reading数据）且完成任务，或者补签完成
    return (reading.reading && reading.taskCompleted === true) || (reading.isMakeup && reading.taskCompleted === true);
}

// 计算连续签到天数
function getStreakDays() {
    const today = new Date();
    let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    let streak = 0;
    let dateKey = getDateKey(currentDate);
    let lastKey = '';
    
    // 从今天往前检查连续签到
    while (isDateCompleted(dateKey)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
        lastKey = dateKey;
        dateKey = getDateKey(currentDate);
        if (dateKey === lastKey) break; // 防止无限循环
    }
    
    return streak;
}

// 获取日期字符串（YYYY-MM-DD，本地时区）
function getDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

