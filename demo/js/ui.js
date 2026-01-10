// UI 交互逻辑

// 设备类型判断工具函数
// 宽度 >= 1330px: 大屏版
// 宽度 < 1330px: 移动端
function getDeviceType() {
    const width = window.innerWidth;
    
    // 大屏版：宽度 >= 1330px
    if (width >= 1330) {
        return 'desktop';
    }
    
    // 移动端：宽度 < 1330px
    return 'mobile';
}

// 判断是否为大屏版
function isDesktop() {
    return window.innerWidth >= 1330;
}

// 判断是否为移动版
function isMobile() {
    return window.innerWidth < 1330;
}

// 情绪状态映射（从左到右：鲜亮 → 灰暗，采用莫兰迪色系）
const EMOTION_MAP = {
    0: { emoji: '😊', label: '愉悦', value: '愉悦', color: ['#f5e6d3', '#e8d5b7'] }, // 莫兰迪暖米色
    1: { emoji: '😌', label: '平静', value: '平静', color: ['#d4e5e9', '#c4d8dc'] }, // 莫兰迪灰蓝色
    2: { emoji: '😴', label: '疲惫', value: '疲惫', color: ['#d5d0c9', '#c4bdb5'] }, // 莫兰迪灰绿色
    3: { emoji: '🤔', label: '迷茫', value: '迷茫', color: ['#c9c5c0', '#b8b3ad'] }, // 莫兰迪灰紫色调
    4: { emoji: '😰', label: '焦虑', value: '焦虑', color: ['#a8a5a0', '#8e8a85'] }  // 莫兰迪深灰色
};

// 更新背景色
function updateBackgroundColor(emotionValue) {
    const emotion = Object.values(EMOTION_MAP).find(e => e.value === emotionValue);
    if (emotion && emotion.color) {
        // 强制浏览器重新计算样式，确保transition生效
        const gradient = `linear-gradient(135deg, ${emotion.color[0]} 0%, ${emotion.color[1]} 100%)`;
        
        // 先读取一次样式，强制浏览器重新计算
        void document.body.offsetHeight;
        
        // 设置新背景
        document.body.style.background = gradient;
        document.body.style.backgroundAttachment = 'fixed';
    }
}

// 初始化情绪滑动条
function initEmotionSlider() {
    const slider = document.getElementById('emotion-input');
    if (!slider) {
        console.warn('emotion-input element not found, skipping emotion slider initialization');
        return;
    }
    
    const thumb = document.getElementById('slider-thumb');
    const markers = document.querySelectorAll('.emotion-marker');
    
    function updateSlider(value) {
        const emotion = EMOTION_MAP[value];
        if (thumb) {
            const weatherIconEl = thumb.querySelector('.current-weather-icon');
            if (weatherIconEl) {
                // 根据value更新天气图标：0->1.png, 1->2.png, 2->3.png, 3->4.png, 4->5.png
                const weatherFile = `${parseInt(value) + 1}.png`;
                weatherIconEl.src = `weather/${weatherFile}`;
            }
        }
        
        // 更新标记选中状态
        markers.forEach((marker, index) => {
            marker.classList.toggle('active', index === parseInt(value));
        });
        
        // 更新背景色
        updateBackgroundColor(emotion.value);
    }
    
    slider.addEventListener('input', (e) => {
        updateSlider(e.target.value);
    });
    
    // 点击标记也可以选择
    markers.forEach((marker, index) => {
        marker.addEventListener('click', () => {
            slider.value = index;
            updateSlider(index);
            // 更新背景色（updateSlider中已包含，但确保触发）
            const emotion = EMOTION_MAP[index];
            updateBackgroundColor(emotion.value);
            slider.dispatchEvent(new Event('input'));
        });
    });
    
    // 初始化
    updateSlider(slider.value);
}

// 显示页面1: 每日占卜页面（情绪选择 + 抽牌）
function showDailyReadingPage() {
    // 先隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    // 隐藏导航栏
    document.body.classList.remove('show-nav');
    
    // 显示页面1
    const dailyPage = document.getElementById('daily-reading-page');
    if (dailyPage) {
        dailyPage.style.display = 'block';
        dailyPage.classList.add('active');
    }
    
    // 重置抽牌状态
    const cardPile = document.getElementById('card-pile');
    const drawnCardContainer = document.getElementById('drawn-card-container');
    
    if (cardPile) {
        cardPile.style.display = 'block';
        // 重置牌堆显示
        const cardBack = cardPile.querySelector('.card-back');
        const drawHint = cardPile.querySelector('.draw-hint');
        if (cardBack) cardBack.style.display = 'block';
        if (drawHint) drawHint.style.display = 'block';
    }
    if (drawnCardContainer) {
        drawnCardContainer.style.display = 'none';
    }
    
    // 清除之前抽到的牌（确保重新抽牌）
    window.drawnCard = null;
    window.selectedEmotion = null;
    
    // 清除抽到的牌图片和名称
    const drawnCardImg = document.getElementById('drawn-card-img');
    const cardName = document.getElementById('card-name');
    if (drawnCardImg) drawnCardImg.src = '';
    if (cardName) cardName.textContent = '';
    
    // 重置背景色为默认值
    document.body.style.background = 'linear-gradient(135deg, #F5F3F3 0%, #E5E0E0 100%)';
    
    // 重置后，根据当前选中的情绪更新背景色
    const slider = document.getElementById('emotion-input');
    if (slider) {
        const currentValue = parseInt(slider.value);
        const emotion = EMOTION_MAP[currentValue];
        if (emotion) {
            updateBackgroundColor(emotion.value);
        }
    }
    
    // 渲染周历
    renderWeeklyCalendar();
}

// 显示页面2: Loading 界面
function showLoadingPage() {
    // 先隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    // 隐藏导航栏
    document.body.classList.remove('show-nav');
    
    // 显示页面2
    const loadingPage = document.getElementById('loading-page');
    if (loadingPage) {
        loadingPage.style.display = 'block';
        loadingPage.classList.add('active');
    }
}

// 显示页面3: 主界面（结果展示）
function showMainPage() {
    // 先隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    // 显示页面3
    const mainPage = document.getElementById('main-page');
    if (mainPage) {
        mainPage.style.display = 'block';
        mainPage.classList.add('active');
    }
    
    // 显示导航栏
    document.body.classList.add('show-nav');
    
    // 更新导航栏激活状态
    updateNavActive('today');
    
    // 更新周历（如果存在）
    renderWeeklyCalendar();
}

// 初始化抽牌交互
function initCardDraw(onCardDrawn) {
    // 获取元素（每次都重新获取，避免引用旧元素）
    let cardPile = document.getElementById('card-pile');
    if (!cardPile) return; // 如果元素不存在，直接返回
    
    const drawnCardContainer = document.getElementById('drawn-card-container');
    const drawnCardImg = document.getElementById('drawn-card-img');
    const cardName = document.getElementById('card-name');
    
    // 重置状态
    let isDrawing = false;
    
    function drawCard() {
        // 防止重复抽牌
        if (isDrawing) {
            console.log('Already drawing, skip');
            return;
        }
        isDrawing = true;
        
        console.log('Drawing card...'); // 调试日志
        
        // 每次抽牌都重新获取元素引用，确保是最新的
        const currentCardPile = document.getElementById('card-pile');
        const currentDrawnCardContainer = document.getElementById('drawn-card-container');
        const currentDrawnCardImg = document.getElementById('drawn-card-img');
        const currentCardName = document.getElementById('card-name');
        
        // 获取当前选择的情绪状态
        const emotionValue = parseInt(document.getElementById('emotion-input')?.value || 3);
        const selectedEmotion = EMOTION_MAP[emotionValue]?.value || '平静';
        
        // 抽取塔罗牌（优化后的三阶段抽牌算法）
        const card = drawTarotCard(selectedEmotion);
        console.log('Drawn card:', card.nameCn, '实际:', card.actualReversed ? '逆位' : '正位', '显示: 正位', '强度:', card.intensity); // 调试日志
        
        // 显示抽到的牌（在牌堆位置）
        // 统一显示为正位，不显示逆位信息，也不显示"正位"文字
        currentDrawnCardImg.src = `Cards-png/${card.file}`;
        currentCardName.textContent = `${card.nameCn} (${card.name})`;
        
        // 统一显示为正位，不旋转图片
        currentDrawnCardImg.style.transform = 'rotate(0deg)';
        
        // 隐藏牌堆提示，在牌堆位置显示抽到的牌
        const drawHint = currentCardPile?.querySelector('.draw-hint');
        if (drawHint) drawHint.style.display = 'none';
        const cardBack = currentCardPile?.querySelector('.card-back');
        if (cardBack) cardBack.style.display = 'none';
        currentDrawnCardContainer.style.display = 'block';
        
        // 延迟一下再触发回调，让用户看到抽到的牌
        setTimeout(() => {
            isDrawing = false; // 重置状态，允许下次抽牌
            if (onCardDrawn) {
                onCardDrawn(card);
            }
        }, 500);
    }
    
    // 移除之前的事件监听器（如果存在）- 通过克隆节点移除所有事件
    const oldCardPile = cardPile;
    const newCardPile = oldCardPile.cloneNode(true);
    oldCardPile.parentNode.replaceChild(newCardPile, oldCardPile);
    
    // 更新引用
    cardPile = newCardPile;
    
    // 长按抽牌
    let longPressTimer;
    cardPile.addEventListener('mousedown', () => {
        longPressTimer = setTimeout(drawCard, 500);
    });
    
    cardPile.addEventListener('mouseup', () => {
        clearTimeout(longPressTimer);
    });
    
    cardPile.addEventListener('mouseleave', () => {
        clearTimeout(longPressTimer);
    });
    
    // 触摸事件（移动端）
    let touchStartTime = 0;
    let hasLongPress = false;
    
    cardPile.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        hasLongPress = false;
        longPressTimer = setTimeout(() => {
            hasLongPress = true;
            drawCard();
        }, 500);
    });
    
    cardPile.addEventListener('touchend', (e) => {
        clearTimeout(longPressTimer);
        // 如果触摸时间少于500ms，说明是点击，而不是长按
        const touchDuration = Date.now() - touchStartTime;
        if (touchDuration < 500 && !hasLongPress) {
            // 这是一个点击操作，直接抽牌
            e.preventDefault(); // 阻止默认行为，防止触发click事件两次
            drawCard();
        }
        touchStartTime = 0;
        hasLongPress = false;
    });
    
    // 点击抽牌（PC端）
    cardPile.addEventListener('click', (e) => {
        // 如果是触摸设备，click事件可能是由touch事件触发的，避免重复执行
        if (touchStartTime === 0) {
            drawCard();
        }
    });
}

// 显示加载指示器
function showLoading(show = true) {
    const loading = document.getElementById('loading-indicator');
    loading.style.display = show ? 'flex' : 'none';
}

// 获取格式化的日期（英文月份 + 日期）
function getFormattedDate() {
    const today = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const month = monthNames[today.getMonth()];
    const day = today.getDate();
    return `${month} ${day}`;
}

// 获取年份
function getFormattedYear() {
    const today = new Date();
    return today.getFullYear().toString();
}

// 渲染主界面内容
function renderMainPage(readingData, card, moonPhase) {
    // 显示日期和年份
    document.getElementById('today-date').textContent = getFormattedDate();
    document.getElementById('today-year').textContent = getFormattedYear();
    
    // 月相和塔罗牌（一行显示）
    const moonEmoji = document.getElementById('moon-emoji');
    moonEmoji.textContent = moonPhase.emoji;
    document.getElementById('moon-phase-name').textContent = moonPhase.nameCn;
    document.getElementById('moon-phase-energy').textContent = moonPhase.energy;
    
    const todayCardContainer = document.getElementById('today-card-container');
    const todayCardImg = document.getElementById('today-card-img');
    const todayCardName = document.getElementById('today-card-name');
    
    todayCardImg.src = `Cards-png/${card.file}`;
    // 统一显示为正位，不显示逆位信息，也不显示"正位"文字
    todayCardName.textContent = `${card.nameCn}`;
    todayCardContainer.style.display = 'block';
    
    // 统一显示为正位，不旋转图片
    todayCardImg.style.transform = 'rotate(0deg)';
    
    // 综合指引
    document.getElementById('guidance-one-line').textContent = readingData.guidance_one_line;
    
    // 今日分析
    const todayAnalysisContent = document.getElementById('today-analysis-content');
    if (readingData.today_analysis) {
        todayAnalysisContent.innerHTML = `<p class="analysis-text">${readingData.today_analysis}</p>`;
    }
    
    // 疗愈任务
    const taskText = document.getElementById('healing-task-text');
    const completeBtn = document.getElementById('complete-task-btn');
    const taskCompleted = document.getElementById('task-completed');
    
    taskText.textContent = readingData.healing_task;
    
    // 检查任务是否已完成
    const todayReading = getTodayReading();
    if (todayReading && todayReading.taskCompleted) {
        completeBtn.style.display = 'none';
        taskCompleted.style.display = 'flex';
    } else {
        completeBtn.style.display = 'block';
        taskCompleted.style.display = 'none';
    }
    
    // 幸运元素
    document.getElementById('lucky-color').textContent = readingData.lucky_elements.lucky_color;
    document.getElementById('lucky-accessory').textContent = readingData.lucky_elements.lucky_accessory;
    document.getElementById('lucky-number').textContent = readingData.lucky_elements.lucky_number;
    document.getElementById('lucky-decoration').textContent = readingData.lucky_elements.lucky_decoration;
    
    // 分类内容（默认显示情感）
    const categoryContent = document.getElementById('category-content');
    categoryContent.innerHTML = '';
    
    // 默认显示情感指引
    if (readingData.category_guidances && readingData.category_guidances['情感']) {
        showCategoryContent('情感', readingData);
    }
    
    // 加载情绪记录（复用上面的 todayReading）
    const emotionRecordInput = document.getElementById('emotion-record-input');
    const saveRecordBtn = document.getElementById('save-emotion-record-btn');
    const recordSaved = document.getElementById('record-saved');
    
    if (todayReading && todayReading.emotionRecord) {
        emotionRecordInput.value = todayReading.emotionRecord;
        saveRecordBtn.style.display = 'none';
        recordSaved.style.display = 'flex';
    } else {
        emotionRecordInput.value = '';
        saveRecordBtn.style.display = 'none';
        recordSaved.style.display = 'none';
    }
    
    // 监听输入变化
    emotionRecordInput.addEventListener('input', () => {
        const currentValue = emotionRecordInput.value.trim();
        const savedValue = todayReading?.emotionRecord || '';
        if (currentValue !== savedValue && currentValue !== '') {
            saveRecordBtn.style.display = 'block';
            recordSaved.style.display = 'none';
        } else {
            saveRecordBtn.style.display = 'none';
            if (currentValue === savedValue && savedValue !== '') {
                recordSaved.style.display = 'flex';
            } else {
                recordSaved.style.display = 'none';
            }
        }
    });
    
    // 保存按钮点击事件
    saveRecordBtn.onclick = () => {
        saveEmotionRecord(emotionRecordInput.value.trim());
    };
}

// 显示分类内容（辅助函数）
function showCategoryContent(category, readingData) {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const categoryContent = document.getElementById('category-content');
    
    // 切换按钮状态
    categoryButtons.forEach(b => b.classList.remove('active'));
    const targetBtn = Array.from(categoryButtons).find(btn => btn.dataset.category === category);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
    
    // 显示/隐藏内容
    const existingContent = categoryContent.querySelector(`[data-category="${category}"]`);
    
    if (existingContent) {
        // 如果已存在，显示它
        categoryContent.querySelectorAll('.category-detail').forEach(item => {
            item.style.display = 'none';
        });
        existingContent.style.display = 'block';
    } else {
        // 创建新内容
        const content = document.createElement('div');
        content.className = 'category-detail';
        content.dataset.category = category;
        content.innerHTML = `
            <div class="category-detail-content">
                <h4>${category}</h4>
                <p>${readingData.category_guidances[category]}</p>
            </div>
        `;
        categoryContent.appendChild(content);
        content.style.display = 'block';
        
        // 隐藏其他所有内容
        categoryContent.querySelectorAll('.category-detail').forEach(item => {
            if (item !== content) {
                item.style.display = 'none';
            }
        });
    }
}

// 初始化分类按钮
function initCategoryButtons(readingData) {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const categoryContent = document.getElementById('category-content');
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            
            // 如果点击的是当前激活的按钮，不做任何操作
            if (btn.classList.contains('active')) {
                return;
            }
            
            // 切换显示对应分类的内容
            showCategoryContent(category, readingData);
        });
    });
    
    // 默认显示"情感"分类
    if (readingData.category_guidances && readingData.category_guidances['情感']) {
        showCategoryContent('情感', readingData);
    }
}

// 完成任务
function completeTask() {
    const todayReading = getTodayReading();
    if (todayReading) {
        todayReading.taskCompleted = true;
        saveTodayReading(todayReading);
        
        // 更新 UI
        document.getElementById('complete-task-btn').style.display = 'none';
        document.getElementById('task-completed').style.display = 'flex';
        
        // 显示签到完成弹板
        showCheckInCompleteModal();
    }
}

// 保存情绪记录（今日）
function saveEmotionRecord(recordText) {
    const todayReading = getTodayReading();
    if (todayReading) {
        todayReading.emotionRecord = recordText;
        saveTodayReading(todayReading);
        
        // 更新 UI
        const saveBtn = document.getElementById('save-emotion-record-btn');
        const saved = document.getElementById('record-saved');
        if (recordText) {
            saveBtn.style.display = 'none';
            saved.style.display = 'flex';
        } else {
            saveBtn.style.display = 'none';
            saved.style.display = 'none';
        }
    }
}

// 保存指定日期的情绪记录
function saveDateEmotionRecord(dateKey, recordText) {
    const readings = getAllReadings();
    if (readings[dateKey]) {
        readings[dateKey].emotionRecord = recordText || undefined;
        localStorage.setItem(STORAGE_KEYS.DAILY_READINGS, JSON.stringify(readings));
    } else {
        // 如果该日期没有记录，创建一个基本记录
        readings[dateKey] = {
            date: dateKey,
            timestamp: new Date().toISOString(),
            emotionRecord: recordText || undefined
        };
        localStorage.setItem(STORAGE_KEYS.DAILY_READINGS, JSON.stringify(readings));
    }
}

// ========== 日历界面相关函数 ==========

// 显示日历页面
function showCalendarPage() {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    // 显示日历页面
    const calendarPage = document.getElementById('calendar-page');
    if (calendarPage) {
        calendarPage.style.display = 'block';
        calendarPage.classList.add('active');
    }
    
    // 显示导航栏
    document.body.classList.add('show-nav');
    
    // 更新导航栏激活状态
    updateNavActive('calendar');
    
    // 初始化日历模式（如果是第一次打开，默认为月相日历）
    // 如果之前已经选择过模式，保持之前的选择
    if (calendarMode !== 'moon' && calendarMode !== 'mood') {
        calendarMode = 'moon'; // 默认显示月相日历
    }
    
    // 绑定日历模式切换按钮事件
    setTimeout(() => {
        bindCalendarModeButtons();
    }, 50);
    
    // 渲染日历（显示当前月）
    const today = new Date();
    renderCalendar(today.getFullYear(), today.getMonth());
}

// 显示塔罗页面
function showTarotPage() {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    // 显示塔罗页面
    const tarotPage = document.getElementById('tarot-page');
    if (tarotPage) {
        tarotPage.style.display = 'block';
        tarotPage.classList.add('active');
    }
    
    // 显示导航栏
    document.body.classList.add('show-nav');
    
    // 更新导航栏激活状态
    updateNavActive('tarot');
    
    // 初始化塔罗模块
    if (typeof initTarotModule === 'function') {
        initTarotModule();
    }
}

// 更新导航栏激活状态
function updateNavActive(activeNav) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.nav === activeNav) {
            item.classList.add('active');
        }
    });
}

// 渲染日历
let currentCalendarYear = new Date().getFullYear();
let currentCalendarMonth = new Date().getMonth();
let calendarMode = 'moon'; // 'moon' 或 'mood' - 日历显示模式，默认为月相日历
let calendarPageClickHandler = null; // 事件委托处理器（保存事件处理器引用，用于移除）

// 情绪状态对应的天气图标映射
const EMOTION_WEATHER_MAP = {
    '愉悦': { icon: 'weather/1.png', name: '阳光' },
    '平静': { icon: 'weather/2.png', name: '多云' },
    '疲惫': { icon: 'weather/3.png', name: '阴天' },
    '迷茫': { icon: 'weather/4.png', name: '小雨' },
    '焦虑': { icon: 'weather/5.png', name: '大雨' }
};

function renderCalendar(year, month) {
    currentCalendarYear = year;
    currentCalendarMonth = month;
    
    // 更新月份标题
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthTitle = document.getElementById('cal-month-title');
    if (monthTitle) {
        monthTitle.textContent = `${monthNames[month]} ${year}`;
    }
    
    // 获取日历网格容器
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;
    
    // 清空网格
    calendarGrid.innerHTML = '';
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = 周日, 6 = 周六
    
    // 计算连续签到天数
    const streak = getStreakDays();
    const streakText = document.getElementById('cal-streak');
    if (streakText) {
        streakText.textContent = streak > 0 ? `连续 ${streak} 天` : '';
    }
    
    // 从sessionStorage获取缓存的月相数据（仅月相模式需要）
    const cacheKey = `calendar_${year}_${month}`;
    let moonPhaseCache = {};
    if (calendarMode === 'moon') {
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                moonPhaseCache = JSON.parse(cached);
            }
        } catch (e) {
            console.error('Error reading cache:', e);
        }
    }
    
    // 创建日期单元格
    // 先填充上个月的日期（留空）
    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // 填充当月的日期
    const today = new Date();
    const todayKey = getDateKey(today);
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateKey = getDateKey(date);
        const isToday = dateKey === todayKey;
        const isCompleted = isDateCompleted(dateKey);
        
        // 根据模式显示不同的图标
        let iconHtml = '';
        
        if (calendarMode === 'mood') {
            // 状态日历模式：显示情绪对应的天气图标
            const reading = getReadingByDate(dateKey);
            if (reading && reading.emotion && EMOTION_WEATHER_MAP[reading.emotion]) {
                // 已签到：显示情绪对应的天气图标
                const weatherInfo = EMOTION_WEATHER_MAP[reading.emotion];
                iconHtml = `<img src="${weatherInfo.icon}" alt="${weatherInfo.name}" class="calendar-mood-icon calendar-mood-icon-active" title="${reading.emotion}">`;
            } else {
                // 未签到：显示默认天气图标（weather/2.png）的半透效果
                iconHtml = `<img src="weather/2.png" alt="未签到" class="calendar-mood-icon calendar-mood-icon-inactive" title="未记录">`;
            }
        } else {
            // 月相日历模式：显示月相
            let moonPhase;
            if (moonPhaseCache[dateKey]) {
                moonPhase = moonPhaseCache[dateKey];
            } else {
                moonPhase = getMoonPhaseForDate(date);
                moonPhaseCache[dateKey] = moonPhase;
            }
            iconHtml = `<div class="calendar-moon">${moonPhase.emoji}</div>`;
        }
        
        // 调试日志
        if (day === 1) {
            console.log('渲染日历，模式:', calendarMode, '日期:', dateKey, '图标HTML:', iconHtml.substring(0, 50));
        }
        
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-cell';
        if (isToday) dayCell.classList.add('today');
        if (isCompleted) dayCell.classList.add('completed');
        dayCell.dataset.date = dateKey;
        
        dayCell.innerHTML = `
            <div class="calendar-day-num">${day}</div>
            ${iconHtml}
        `;
        
        // 点击事件：显示日期详情
        dayCell.addEventListener('click', () => {
            showDateDetailModal(dateKey);
        });
        
        calendarGrid.appendChild(dayCell);
    }
    
    // 填充下个月的日期（留空）
    const totalCells = startDayOfWeek + daysInMonth;
    const remainingCells = 42 - totalCells; // 6行 x 7列 = 42
    for (let i = 0; i < remainingCells; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar-cell empty';
        calendarGrid.appendChild(emptyCell);
    }
    
    // 保存月相缓存到sessionStorage（仅月相模式需要）
    if (calendarMode === 'moon') {
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify(moonPhaseCache));
        } catch (e) {
            console.error('Error saving cache:', e);
        }
    }
}

// 翻到上个月
function goToPreviousMonth() {
    if (currentCalendarMonth === 0) {
        currentCalendarYear--;
        currentCalendarMonth = 11;
    } else {
        currentCalendarMonth--;
    }
    renderCalendar(currentCalendarYear, currentCalendarMonth);
}

// 翻到下个月
function goToNextMonth() {
    if (currentCalendarMonth === 11) {
        currentCalendarYear++;
        currentCalendarMonth = 0;
    } else {
        currentCalendarMonth++;
    }
    renderCalendar(currentCalendarYear, currentCalendarMonth);
}

// 显示日期详情弹层
function showDateDetailModal(dateKey) {
    const reading = getReadingByDate(dateKey);
    // 解析本地日期（避免时区问题）
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const dateStr = `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    
    const modal = document.getElementById('calendar-day-modal');
    const modalDate = document.getElementById('calendar-modal-title');
    const modalContent = document.getElementById('calendar-modal-content');
    
    if (!modal || !modalDate || !modalContent) return;
    
    modalDate.textContent = dateStr;
    
    if (reading && reading.reading) {
        // 有完整数据，显示详情
        const moonPhase = reading.moonPhase || getMoonPhaseForDate(date);
        modalContent.innerHTML = `
            <div class="detail-section">
                <div class="detail-label">情绪状态</div>
                <div class="detail-value">${reading.emotion || '未记录'}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">月相</div>
                <div class="detail-value">${moonPhase.emoji} ${moonPhase.nameCn}</div>
            </div>
            ${reading.card ? `
            <div class="detail-section">
                <div class="detail-label">塔罗牌</div>
                <div class="detail-value">${reading.card.nameCn}</div>
            </div>
            ` : ''}
            ${reading.reading.guidance_one_line ? `
            <div class="detail-section">
                <div class="detail-label">今日指引</div>
                <div class="detail-value">${reading.reading.guidance_one_line}</div>
            </div>
            ` : ''}
            <div class="detail-section emotion-record-edit-section">
                <div class="detail-label">情绪记录（可随时补充）</div>
                <textarea 
                    class="detail-emotion-record-input" 
                    id="detail-emotion-record-input-${dateKey}"
                    placeholder="记录当日的心境、事件或想法..."
                    rows="4"
                >${reading.emotionRecord || ''}</textarea>
                <button class="btn-save-detail-record" id="save-detail-record-btn-${dateKey}">
                    <span>💾 保存</span>
                </button>
                <div class="detail-record-saved" id="detail-record-saved-${dateKey}" style="display: none;">
                    <span class="checkmark">✓</span>
                    <span>已保存</span>
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">签到状态</div>
                <div class="detail-value">${reading.taskCompleted ? '✓ 已完成' : '未完成'}</div>
            </div>
        `;
        
        // 绑定保存情绪记录按钮
        setTimeout(() => {
            const saveBtn = document.getElementById(`save-detail-record-btn-${dateKey}`);
            const saved = document.getElementById(`detail-record-saved-${dateKey}`);
            const input = document.getElementById(`detail-emotion-record-input-${dateKey}`);
            
            if (saveBtn && saved && input) {
                // 初始化：如果有记录且未修改，显示已保存
                if (reading.emotionRecord) {
                    saveBtn.style.display = 'none';
                    saved.style.display = 'flex';
                } else {
                    saveBtn.style.display = 'none';
                    saved.style.display = 'none';
                }
                
                // 监听输入变化
                input.addEventListener('input', () => {
                    const currentValue = input.value.trim();
                    const savedValue = reading.emotionRecord || '';
                    if (currentValue !== savedValue) {
                        saveBtn.style.display = 'block';
                        saved.style.display = 'none';
                    } else {
                        saveBtn.style.display = 'none';
                        if (currentValue !== '') {
                            saved.style.display = 'flex';
                        } else {
                            saved.style.display = 'none';
                        }
                    }
                });
                
                // 保存按钮点击事件
                saveBtn.addEventListener('click', () => {
                    saveDateEmotionRecord(dateKey, input.value.trim());
                    saveBtn.style.display = 'none';
                    saved.style.display = 'flex';
                    // 刷新日历以更新显示
                    renderCalendar(currentCalendarYear, currentCalendarMonth);
                });
            }
        }, 0);
        
        // 显示补签按钮（如果不是今天且未完成）
        const todayKey = getTodayKey();
        const makeUpBtn = document.getElementById('date-detail-makeup-btn');
        if (makeUpBtn) {
            if (dateKey !== todayKey && !reading.taskCompleted) {
                makeUpBtn.style.display = 'block';
                makeUpBtn.onclick = () => {
                    makeUpCheckIn(dateKey);
                    modal.style.display = 'none';
                };
            } else {
                makeUpBtn.style.display = 'none';
            }
        }
    } else if (reading && reading.emotion && reading.isMakeup) {
        // 补签记录（仅情绪）
        const moonPhase = getMoonPhaseForDate(date);
        modalContent.innerHTML = `
            <div class="detail-section">
                <div class="detail-label">情绪状态</div>
                <div class="detail-value">${reading.emotion}</div>
            </div>
            <div class="detail-section">
                <div class="detail-label">月相</div>
                <div class="detail-value">${moonPhase.emoji} ${moonPhase.nameCn}</div>
            </div>
            <div class="detail-section emotion-record-edit-section">
                <div class="detail-label">情绪记录（可随时补充）</div>
                <textarea 
                    class="detail-emotion-record-input" 
                    id="detail-emotion-record-input-${dateKey}"
                    placeholder="记录当日的心境、事件或想法..."
                    rows="4"
                >${reading.emotionRecord || ''}</textarea>
                <button class="btn-save-detail-record" id="save-detail-record-btn-${dateKey}">
                    <span>💾 保存</span>
                </button>
                <div class="detail-record-saved" id="detail-record-saved-${dateKey}" style="display: none;">
                    <span class="checkmark">✓</span>
                    <span>已保存</span>
                </div>
            </div>
            <div class="detail-section">
                <div class="detail-label">签到状态</div>
                <div class="detail-value">✓ 补签完成</div>
            </div>
        `;
        
        // 绑定保存情绪记录按钮
        setTimeout(() => {
            const saveBtn = document.getElementById(`save-detail-record-btn-${dateKey}`);
            const saved = document.getElementById(`detail-record-saved-${dateKey}`);
            const input = document.getElementById(`detail-emotion-record-input-${dateKey}`);
            
            if (saveBtn && saved && input) {
                // 初始化：如果有记录且未修改，显示已保存
                if (reading.emotionRecord) {
                    saveBtn.style.display = 'none';
                    saved.style.display = 'flex';
                } else {
                    saveBtn.style.display = 'none';
                    saved.style.display = 'none';
                }
                
                // 监听输入变化
                input.addEventListener('input', () => {
                    const currentValue = input.value.trim();
                    const savedValue = reading.emotionRecord || '';
                    if (currentValue !== savedValue) {
                        saveBtn.style.display = 'block';
                        saved.style.display = 'none';
                    } else {
                        saveBtn.style.display = 'none';
                        if (currentValue !== '') {
                            saved.style.display = 'flex';
                        } else {
                            saved.style.display = 'none';
                        }
                    }
                });
                
                // 保存按钮点击事件
                saveBtn.addEventListener('click', () => {
                    saveDateEmotionRecord(dateKey, input.value.trim());
                    saveBtn.style.display = 'none';
                    saved.style.display = 'flex';
                    // 刷新日历以更新显示
                    renderCalendar(currentCalendarYear, currentCalendarMonth);
                });
            }
        }, 0);
    } else {
        // 无数据 - 显示补签选项（仅过去日期）
        const todayKey = getTodayKey();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // 解析本地日期（避免时区问题）
        const [y, m, d] = dateKey.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        const isPastDate = targetDate < today;
        
        if (isPastDate) {
            // 过去日期可以补签
            const moonPhase = getMoonPhaseForDate(date);
            modalContent.innerHTML = `
                <div class="detail-section">
                    <div class="detail-label">月相</div>
                    <div class="detail-value">${moonPhase.emoji} ${moonPhase.nameCn}</div>
                </div>
                <div class="detail-section">
                    <div class="detail-label">签到状态</div>
                    <div class="detail-value">未签到</div>
                </div>
                <div class="detail-section makeup-section">
                    <div class="detail-label">补签 - 选择当日情绪</div>
                    <div class="makeup-emotion-btns">
                        <button class="makeup-btn" data-emotion="愉悦">愉悦</button>
                        <button class="makeup-btn" data-emotion="平静">平静</button>
                        <button class="makeup-btn" data-emotion="疲惫">疲惫</button>
                        <button class="makeup-btn" data-emotion="迷茫">迷茫</button>
                        <button class="makeup-btn" data-emotion="焦虑">焦虑</button>
                    </div>
                </div>
                <div class="detail-section makeup-record-section">
                    <div class="detail-label">情绪记录（选填）</div>
                    <textarea 
                        class="makeup-emotion-record-input" 
                        id="makeup-emotion-record-input-${dateKey}"
                        placeholder="记录当日的心境、事件或想法..."
                        rows="3"
                    ></textarea>
                </div>
            `;
            
            // 绑定补签按钮事件
            setTimeout(() => {
                const makeupBtns = modalContent.querySelectorAll('.makeup-btn');
                makeupBtns.forEach(btn => {
                    btn.addEventListener('click', () => {
                        const emotion = btn.dataset.emotion;
                        const recordInput = document.getElementById(`makeup-emotion-record-input-${dateKey}`);
                        const emotionRecord = recordInput ? recordInput.value.trim() : '';
                        makeUpCheckIn(dateKey, emotion, emotionRecord);
                        modal.style.display = 'none';
                    });
                });
            }, 0);
        } else {
            // 今天或未来日期，或者完全无数据的日期 - 也允许补充情绪记录
            const moonPhase = getMoonPhaseForDate(date);
            modalContent.innerHTML = `
                <div class="detail-section">
                    <div class="detail-label">月相</div>
                    <div class="detail-value">${moonPhase.emoji} ${moonPhase.nameCn}</div>
                </div>
                <div class="detail-section">
                    <div class="detail-label">签到状态</div>
                    <div class="detail-value">未签到</div>
                </div>
                <div class="detail-section emotion-record-edit-section">
                    <div class="detail-label">情绪记录（可随时补充）</div>
                    <textarea 
                        class="detail-emotion-record-input" 
                        id="detail-emotion-record-input-${dateKey}"
                        placeholder="记录当日的心境、事件或想法..."
                        rows="4"
                    ></textarea>
                    <button class="btn-save-detail-record" id="save-detail-record-btn-${dateKey}">
                        <span>💾 保存</span>
                    </button>
                    <div class="detail-record-saved" id="detail-record-saved-${dateKey}" style="display: none;">
                        <span class="checkmark">✓</span>
                        <span>已保存</span>
                    </div>
                </div>
            `;
            
            // 绑定保存情绪记录按钮（无数据情况）
            setTimeout(() => {
                const saveBtn = document.getElementById(`save-detail-record-btn-${dateKey}`);
                const saved = document.getElementById(`detail-record-saved-${dateKey}`);
                const input = document.getElementById(`detail-emotion-record-input-${dateKey}`);
                
                if (saveBtn && saved && input) {
                    // 监听输入变化
                    input.addEventListener('input', () => {
                        const currentValue = input.value.trim();
                        if (currentValue !== '') {
                            saveBtn.style.display = 'block';
                            saved.style.display = 'none';
                        } else {
                            saveBtn.style.display = 'none';
                            saved.style.display = 'none';
                        }
                    });
                    
                    // 保存按钮点击事件
                    saveBtn.addEventListener('click', () => {
                        saveDateEmotionRecord(dateKey, input.value.trim());
                        saveBtn.style.display = 'none';
                        if (input.value.trim()) {
                            saved.style.display = 'flex';
                        }
                    });
                }
            }, 0);
        }
    }
    
    modal.style.display = 'flex';
}

// 补签功能（仅选择情绪）
function makeUpCheckIn(dateKey, emotion, emotionRecord = '') {
    if (!emotion) return;
    
    const readingData = {
        emotion: emotion,
        date: dateKey,
        timestamp: new Date().toISOString(),
        isMakeup: true,
        taskCompleted: true,  // 补签视为完成
        emotionRecord: emotionRecord || undefined  // 如果有记录才保存
    };
    
    const readings = getAllReadings();
    readings[dateKey] = readingData;
    localStorage.setItem(STORAGE_KEYS.DAILY_READINGS, JSON.stringify(readings));
    
    // 刷新日历
    renderCalendar(currentCalendarYear, currentCalendarMonth);
    
    // 刷新周历（补签后立即更新显示状态）
    renderWeeklyCalendar();
    
    // 显示补签成功提示
    showMakeupSuccessToast(emotion);
}

// 显示补签成功提示
function showMakeupSuccessToast(emotion) {
    const toast = document.getElementById('checkin-toast');
    const titleEl = toast?.querySelector('.checkin-toast-title');
    const subtitleEl = toast?.querySelector('.checkin-toast-subtitle');
    
    if (toast && titleEl && subtitleEl) {
        titleEl.textContent = '补签成功';
        subtitleEl.textContent = `已记录情绪：${emotion}`;
        toast.style.display = 'flex';
        
        setTimeout(() => {
            toast.style.display = 'none';
            // 恢复默认文案
            titleEl.textContent = '今日签到完成';
            subtitleEl.textContent = '你完成了今日占卜与疗愈任务';
        }, 2000);
    }
}


// 显示签到完成弹板
function showCheckInCompleteModal() {
    const streak = getStreakDays();
    const modal = document.getElementById('checkin-toast');
    const titleEl = modal?.querySelector('.checkin-toast-title');
    const subtitleEl = modal?.querySelector('.checkin-toast-subtitle');
    const streakEl = document.getElementById('checkin-toast-streak');
    const iconEl = modal?.querySelector('.checkin-toast-icon');
    
    if (modal) {
        // 设置标题和副标题
        if (titleEl) titleEl.textContent = '🎊 今日签到完成';
        if (subtitleEl) subtitleEl.textContent = '你完成了今日占卜与疗愈任务';
        if (iconEl) iconEl.textContent = '🎉';
        
        // 显示连续签到天数
        if (streakEl) {
            if (streak > 0) {
                streakEl.textContent = `🔥 连续签到 ${streak} 天`;
                streakEl.style.display = 'block';
            } else {
                streakEl.style.display = 'none';
            }
        }
        
        modal.style.display = 'flex';
        
        // 3秒后自动关闭
        setTimeout(() => {
            modal.style.display = 'none';
        }, 3000);
    }
}

// 切换日历模式（月相/状态）
function switchCalendarMode(mode) {
    // 验证模式有效性
    if (mode !== 'moon' && mode !== 'mood') {
        return;
    }
    
    // 如果当前已经是目标模式，不需要切换
    if (calendarMode === mode) {
        return;
    }
    
    // 更新模式
    calendarMode = mode;
    
    // 更新按钮状态
    updateCalendarModeButtons();
    
    // 重新渲染日历
    renderCalendar(currentCalendarYear, currentCalendarMonth);
}

// 更新日历模式按钮状态
// 根据当前 calendarMode 设置按钮的 active 状态
// active 状态 = 深色，非 active 状态 = 浅色
function updateCalendarModeButtons() {
    const moonBtn = document.getElementById('moon-calendar-btn');
    const moodBtn = document.getElementById('mood-calendar-btn');
    
    if (moonBtn) {
        if (calendarMode === 'moon') {
            moonBtn.classList.add('active');  // 月相日历按钮：深色
        } else {
            moonBtn.classList.remove('active');  // 月相日历按钮：浅色
        }
    }
    
    if (moodBtn) {
        if (calendarMode === 'mood') {
            moodBtn.classList.add('active');  // 状态日历按钮：深色
        } else {
            moodBtn.classList.remove('active');  // 状态日历按钮：浅色
        }
    }
}

// 绑定日历模式按钮事件
function bindCalendarModeButtons() {
    const moonBtn = document.getElementById('moon-calendar-btn');
    const moodBtn = document.getElementById('mood-calendar-btn');
    
    if (!moonBtn || !moodBtn) {
        console.warn('日历模式按钮未找到');
        return;
    }
    
    // 移除旧的事件监听器（通过克隆节点）
    const newMoonBtn = moonBtn.cloneNode(true);
    const newMoodBtn = moodBtn.cloneNode(true);
    moonBtn.parentNode.replaceChild(newMoonBtn, moonBtn);
    moodBtn.parentNode.replaceChild(newMoodBtn, moodBtn);
    
    // 绑定月相日历按钮：点击后切换到月相日历模式
    newMoonBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        switchCalendarMode('moon');
    });
    
    newMoonBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        switchCalendarMode('moon');
    });
    newMoonBtn.style.touchAction = 'manipulation';
    
    // 绑定状态日历按钮：点击后切换到状态日历模式
    newMoodBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        switchCalendarMode('mood');
    });
    
    newMoodBtn.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        switchCalendarMode('mood');
    });
    newMoodBtn.style.touchAction = 'manipulation';
    
    // 根据当前 calendarMode 更新按钮状态
    updateCalendarModeButtons();
}

// 初始化日历页面
function initCalendarPage() {
    // 绑定翻月按钮
    const prevBtn = document.getElementById('cal-prev-btn');
    const nextBtn = document.getElementById('cal-next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPreviousMonth);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextMonth);
    }
    
    // 绑定关闭弹层按钮
    const closeModal = document.getElementById('calendar-modal-close');
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            const modal = document.getElementById('calendar-day-modal');
            if (modal) modal.style.display = 'none';
        });
    }
    
    const closeCheckInModal = document.getElementById('checkin-toast-btn');
    if (closeCheckInModal) {
        closeCheckInModal.addEventListener('click', () => {
            const modal = document.getElementById('checkin-toast');
            if (modal) modal.style.display = 'none';
        });
    }
    
    // 点击弹层背景关闭
    const dateModal = document.getElementById('calendar-day-modal');
    if (dateModal) {
        dateModal.addEventListener('click', (e) => {
            if (e.target === dateModal || e.target.id === 'calendar-modal-backdrop') {
                dateModal.style.display = 'none';
            }
        });
    }
    
    // 日历模式按钮事件在showCalendarPage中绑定
    // 这里不绑定，避免重复绑定问题
}

// 渲染周历（显示本周7天）
function renderWeeklyCalendar() {
    // 查找所有周历容器（可能有多个页面包含周历）
    const containers = document.querySelectorAll('.weekly-calendar-container');
    
    console.log('渲染周历，找到容器数量:', containers.length);
    
    if (containers.length === 0) {
        console.warn('未找到周历容器！');
        return;
    }
    
    containers.forEach((container, index) => {
        const grid = container.querySelector('.weekly-calendar-grid');
        
        console.log(`容器 ${index}:`, container, '网格:', grid);
        
        if (grid) {
            renderWeeklyCalendarForContainer(grid);
            console.log(`容器 ${index} 渲染完成，子元素数量:`, grid.children.length);
        } else {
            console.warn(`容器 ${index} 未找到网格元素！`);
        }
    });
}

// 为单个容器渲染周历
function renderWeeklyCalendarForContainer(grid) {
    if (!grid) {
        console.error('renderWeeklyCalendarForContainer: grid 为空！');
        return;
    }
    
    console.log('开始渲染周历容器，grid:', grid);
    
    // 获取本周的开始日期（周日）
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = 周日, 1 = 周一, ...
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // 星期标题
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // 清空网格
    grid.innerHTML = '';
    
    const todayKey = getTodayKey();
    console.log('本周开始日期:', startOfWeek, '今天:', todayKey);
    
    // 生成7天的内容
    for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        const dateKey = getDateKey(date);
        const day = date.getDate();
        const isToday = dateKey === todayKey;
        const isCompleted = isDateCompleted(dateKey);
        const reading = getReadingByDate(dateKey);
        
        // 创建日期按钮容器
        const dayButton = document.createElement('div');
        dayButton.className = 'weekly-day-button';
        if (isToday) dayButton.classList.add('today');
        if (isCompleted) dayButton.classList.add('completed');
        dayButton.dataset.date = dateKey;
        
        // 第一行：星期
        const weekdayCell = document.createElement('div');
        weekdayCell.className = 'weekly-weekday-cell';
        weekdayCell.textContent = weekdays[i];
        dayButton.appendChild(weekdayCell);
        
        // 第二行：天气图标
        const iconCell = document.createElement('div');
        iconCell.className = 'weekly-icon-cell';
        
        let iconHtml = '';
        if (reading && reading.emotion && EMOTION_WEATHER_MAP[reading.emotion]) {
            // 已签到：显示情绪对应的天气图标
            const weatherInfo = EMOTION_WEATHER_MAP[reading.emotion];
            iconHtml = `<img src="${weatherInfo.icon}" alt="${weatherInfo.name}" class="weekly-mood-icon weekly-mood-icon-active" title="${reading.emotion}">`;
        } else {
            // 未签到：显示默认天气图标（weather/2.png）的半透效果
            iconHtml = `<img src="weather/2.png" alt="未签到" class="weekly-mood-icon weekly-mood-icon-inactive" title="未记录">`;
        }
        
        iconCell.innerHTML = iconHtml;
        dayButton.appendChild(iconCell);
        
        // 第三行：日期数字
        const dateCell = document.createElement('div');
        dateCell.className = 'weekly-date-cell';
        dateCell.textContent = day;
        dayButton.appendChild(dateCell);
        
        // 点击事件：显示日期详情（复用日历模块的逻辑）
        dayButton.addEventListener('click', () => {
            showDateDetailModal(dateKey);
        });
        
        grid.appendChild(dayButton);
    }
}

