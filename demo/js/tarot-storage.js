// 塔罗占卜数据存储管理

const TAROT_STORAGE_KEYS = {
    READINGS: 'tarot_mirror_tarot_readings',
    DAILY_LIMIT: 'tarot_mirror_daily_limit',
    ADDITIONAL_CARD_COOLDOWN: 'tarot_mirror_additional_card_cooldown'
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
        // 如果没有ID，生成一个
        if (!readingData.id) {
            readingData.id = `${getTodayKey()}_${Date.now()}`;
        }
        // 如果没有时间戳，添加一个
        if (!readingData.timestamp) {
            readingData.timestamp = new Date().toISOString();
        }
        // 初始化默认值
        if (!readingData.chat_count) readingData.chat_count = 0;
        if (!readingData.max_chat_rounds) readingData.max_chat_rounds = 2;
        // 关键：新占卜必须初始化聊天与复盘字段，避免 UI/逻辑沿用上一单
        if (!readingData.chat_history) readingData.chat_history = [];
        if (!readingData.additional_cards) readingData.additional_cards = [];
        if (!readingData.is_reviewed) readingData.is_reviewed = false;
        if (!readingData.review) readingData.review = null;
        if (!readingData.can_continue) readingData.can_continue = true;
        
        readings[readingData.id] = readingData;
        localStorage.setItem(TAROT_STORAGE_KEYS.READINGS, JSON.stringify(readings));
        return readingData.id;
    } catch (e) {
        console.error('Error saving tarot reading:', e);
        return null;
    }
}

// 添加聊天消息到占卜记录
function addChatMessageToReading(readingId, role, content) {
    const reading = getTarotReadingById(readingId);
    if (!reading) return;
    
    if (!reading.chat_history) {
        reading.chat_history = [];
    }
    
    reading.chat_history.push({
        role,
        content,
        timestamp: new Date().toISOString()
    });
    
    saveTarotReading(reading);
}

// 保存补牌记录
function saveAdditionalCard(readingId, additionalCardData) {
    const reading = getTarotReadingById(readingId);
    if (!reading) return;
    
    if (!reading.additional_cards) {
        reading.additional_cards = [];
    }
    
    const cardRecord = {
        id: `additional_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...additionalCardData
    };
    
    reading.additional_cards.push(cardRecord);
    saveTarotReading(reading);
    
    // 记录补牌时间（用于冷却）
    setAdditionalCardCooldown(readingId);
    
    return cardRecord;
}

// 设置补牌冷却时间
function setAdditionalCardCooldown(readingId) {
    try {
        const cooldownData = getAdditionalCardCooldownData();
        cooldownData[readingId] = new Date().toISOString();
        localStorage.setItem(TAROT_STORAGE_KEYS.ADDITIONAL_CARD_COOLDOWN, JSON.stringify(cooldownData));
    } catch (e) {
        console.error('Error saving additional card cooldown:', e);
    }
}

// 检查补牌冷却时间
function checkAdditionalCardCooldown(readingId) {
    const cooldownData = getAdditionalCardCooldownData();
    const lastDrawTime = cooldownData[readingId];
    
    if (!lastDrawTime) {
        return { canDraw: true, remainingText: '' };
    }
    
    const lastDraw = new Date(lastDrawTime);
    const now = new Date();
    const diffMs = now - lastDraw;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours >= 24) {
        return { canDraw: true, remainingText: '' };
    }
    
    const remainingHours = 24 - diffHours;
    const hours = Math.floor(remainingHours);
    const minutes = Math.floor((remainingHours - hours) * 60);
    
    let remainingText = '';
    if (hours > 0) {
        remainingText = `还需等待 ${hours} 小时`;
    } else {
        remainingText = `还需等待 ${minutes} 分钟`;
    }
    
    return { canDraw: false, remainingText, remainingHours };
}

// 获取补牌冷却数据
function getAdditionalCardCooldownData() {
    try {
        const data = localStorage.getItem(TAROT_STORAGE_KEYS.ADDITIONAL_CARD_COOLDOWN);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Error reading additional card cooldown:', e);
        return {};
    }
}

// 保存复盘记录
function saveReview(readingId, reviewData) {
    const reading = getTarotReadingById(readingId);
    if (!reading) return;
    
    reading.review = {
        timestamp: new Date().toISOString(),
        ...reviewData
    };
    
    saveTarotReading(reading);
}

// 标记占卜为已复盘
function markReadingAsReviewed(readingId) {
    const reading = getTarotReadingById(readingId);
    if (!reading) return;
    
    reading.is_reviewed = true;
    reading.can_continue = false;
    
    saveTarotReading(reading);
}

// 获取指定ID的占卜记录
function getTarotReadingById(readingId) {
    const readings = getAllTarotReadings();
    return readings[readingId] || null;
}

// 别名函数（兼容性）
function getTarotReading(readingId) {
    return getTarotReadingById(readingId);
}

// 获取排序后的历史占卜列表（按时间倒序）
function getTarotReadingsList() {
    const readings = getAllTarotReadings();
    return Object.values(readings)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// 别名函数（兼容性）
function getAllTarotReadings() {
    try {
        const data = localStorage.getItem(TAROT_STORAGE_KEYS.READINGS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error('Error reading tarot readings:', e);
        return {};
    }
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


