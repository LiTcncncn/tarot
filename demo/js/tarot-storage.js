// 塔罗占卜数据存储管理

const TAROT_STORAGE_KEYS = {
    READINGS: 'tarot_mirror_tarot_readings',
    DAILY_LIMIT: 'tarot_mirror_daily_limit'
};

// 获取今日日期字符串（YYYY-MM-DD，本地时区）
function getTodayKey() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 检查今天是否可以占卜（每天一次）
// 暂时屏蔽每日限制逻辑
function checkDailyTarotLimit() {
    // const todayKey = getTodayKey();
    // const limitData = getDailyLimitData();
    // return !limitData[todayKey];
    return true; // 暂时允许无限次占卜
}

// 设置今日已占卜标记
function setDailyTarotLimit() {
    const todayKey = getTodayKey();
    const limitData = getDailyLimitData();
    limitData[todayKey] = true;
    try {
        localStorage.setItem(TAROT_STORAGE_KEYS.DAILY_LIMIT, JSON.stringify(limitData));
    } catch (e) {
        console.error('Error saving daily limit:', e);
    }
}

// 获取每日限制数据
function getDailyLimitData() {
    try {
        const data = localStorage.getItem(TAROT_STORAGE_KEYS.DAILY_LIMIT);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Error reading daily limit:', e);
        return {};
    }
}

// 保存占卜记录
function saveTarotReading(readingData) {
    try {
        const readings = getAllTarotReadings();
        readings[readingData.id] = readingData;
        localStorage.setItem(TAROT_STORAGE_KEYS.READINGS, JSON.stringify(readings));
        return true;
    } catch (e) {
        console.error('Error saving tarot reading:', e);
        return false;
    }
}

// 获取所有占卜记录
function getAllTarotReadings() {
    try {
        const data = localStorage.getItem(TAROT_STORAGE_KEYS.READINGS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Error reading tarot readings:', e);
        return {};
    }
}

// 获取指定ID的占卜记录
function getTarotReadingById(readingId) {
    const readings = getAllTarotReadings();
    return readings[readingId] || null;
}

// 获取排序后的历史占卜列表（按时间倒序）
function getTarotReadingsList() {
    const readings = getAllTarotReadings();
    return Object.values(readings)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// 检查是否可以继续聊天（当天可，转天不可）
function canContinueChat(readingId) {
    const reading = getTarotReadingById(readingId);
    if (!reading) return false;
    
    const readingDate = reading.timestamp.split('T')[0];
    const todayKey = getTodayKey();
    
    // 必须是今天才能继续聊天
    if (readingDate !== todayKey) return false;
    
    // 检查是否已达到聊天轮数限制
    const chatCount = reading.chat_count || 0;
    const maxRounds = reading.max_chat_rounds || 2;
    
    return chatCount < maxRounds;
}

// 增加聊天轮数
function incrementChatCount(readingId) {
    const reading = getTarotReadingById(readingId);
    if (reading) {
        reading.chat_count = (reading.chat_count || 0) + 1;
        saveTarotReading(reading);
    }
}

// 获取所有历史的每日占卜数据（用于AI记忆）
function getAllDailyReadingsForTarot() {
    try {
        const data = localStorage.getItem('tarot_mirror_daily_readings');
        const dailyReadings = data ? JSON.parse(data) : {};
        
        // 转换为数组，包含日期和所有相关信息
        const result = [];
        Object.keys(dailyReadings).forEach(dateKey => {
            const reading = dailyReadings[dateKey];
            if (reading) {
                result.push({
                    date: dateKey,
                    emotion: reading.emotion,
                    emotionRecord: reading.emotionRecord,
                    guidance_one_line: reading.reading?.guidance_one_line,
                    today_analysis: reading.reading?.today_analysis,
                    moonPhase: reading.moonPhase,
                    card: reading.card
                });
            }
        });
        
        return result.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
        console.error('Error reading daily readings for tarot:', e);
        return [];
    }
}


