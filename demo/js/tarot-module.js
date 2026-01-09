// 塔罗模块主逻辑

// 初始化塔罗模块
function initTarotModule() {
    // 检查今日限制
    checkAndDisplayDailyLimit();
    
    // 初始化牌阵（默认3张）
    initSpread('3张');
    renderSpread();
    
    // 绑定事件
    bindTarotEvents();
    
    // 加载历史记录
    renderHistoryList();
}

// 检查并显示每日限制
function checkAndDisplayDailyLimit() {
    const canRead = checkDailyTarotLimit();
    const questionInput = document.getElementById('tarot-question-input');
    const drawCardPile = document.getElementById('tarot-card-pile');
    const limitNotice = document.getElementById('tarot-daily-limit-notice');
    
    if (!canRead) {
        if (questionInput) questionInput.disabled = true;
        if (drawCardPile) drawCardPile.style.display = 'none';
        if (limitNotice) {
            limitNotice.style.display = 'block';
            limitNotice.textContent = '今日已占卜，明天再来';
        }
    } else {
        if (questionInput) questionInput.disabled = false;
        if (drawCardPile) drawCardPile.style.display = 'block';
        if (limitNotice) limitNotice.style.display = 'none';
    }
}

// 绑定事件
function bindTarotEvents() {
    // 问题输入长度限制
    const questionInput = document.getElementById('tarot-question-input');
    if (questionInput) {
        questionInput.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value.length > 200) {
                e.target.value = value.substring(0, 200);
                alert('问题不能超过200字');
            }
        });
    }
    
    // 牌阵切换按钮
    const spreadBtns = document.querySelectorAll('.spread-type-btn');
    spreadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spreadType = btn.dataset.spread;
            switchSpread(spreadType);
        });
    });
    
    // 抽牌按钮（使用事件委托，确保每次初始化都能绑定）
    const cardPile = document.getElementById('tarot-card-pile');
    if (cardPile) {
        // 移除旧的监听器（如果有）
        cardPile.removeEventListener('click', handleCardDraw);
        // 添加新的监听器
        cardPile.addEventListener('click', handleCardDraw);
        cardPile.style.cursor = 'pointer';
    }
    
    // 占卜按钮
    const readingBtn = document.getElementById('tarot-reading-btn');
    if (readingBtn) {
        readingBtn.addEventListener('click', handleStartReading);
    }
}

// 切换牌阵
function switchSpread(newType) {
    if (!checkDailyTarotLimit()) return;
    
    initSpread(newType);
    resetSpread();
    renderSpread();
    updateSpreadButtons(newType);
    hideReadingResult();
}

// 更新牌阵切换按钮状态
function updateSpreadButtons(activeType) {
    const spreadBtns = document.querySelectorAll('.spread-type-btn');
    spreadBtns.forEach(btn => {
        if (btn.dataset.spread === activeType) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 渲染牌阵
function renderSpread() {
    const spreadContainer = document.getElementById('tarot-spread-container');
    if (!spreadContainer) return;
    
    const config = getCurrentSpreadConfig();
    const spreadType = getCurrentSpreadType();
    const drawnCards = getDrawnCards();
    
    // 确定布局类
    let gridClass = '';
    if (spreadType === '3张') {
        gridClass = 'spread-grid-3';
    } else if (spreadType === '4张') {
        gridClass = 'spread-grid-4';
    } else {
        gridClass = 'spread-grid-6';
    }
    
    spreadContainer.className = `tarot-spread-container ${gridClass}`;
    spreadContainer.innerHTML = '';
    
    config.positions.forEach((position, index) => {
        const drawnCard = drawnCards.find(c => c.position.id === position.id);
        const cardElement = createCardElement(position, drawnCard);
        spreadContainer.appendChild(cardElement);
    });
    
    // 更新抽牌区和占卜按钮
    updateDrawArea();
}

// 创建牌位元素
function createCardElement(position, drawnCard) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'tarot-card-slot';
    cardDiv.dataset.positionId = position.id;
    
    if (drawnCard && drawnCard.card) {
        // 已抽牌
        const card = drawnCard.card;
        cardDiv.innerHTML = `
            <div class="card-image-wrapper">
                <img src="Cards-png/${card.file}" alt="${card.nameCn}" class="card-image ${card.reversed ? 'reversed' : ''}" 
                     onerror="this.src='Cards-png/CardBacks.png';">
            </div>
            <div class="card-name-orientation">
                <span class="card-name">${card.nameCn}</span>
                <span class="card-orientation">${card.reversed ? '逆位' : '正位'}</span>
            </div>
        `;
        cardDiv.classList.add('has-card');
    } else {
        // 空牌位
        cardDiv.innerHTML = `
            <div class="empty-card-placeholder">
                <div class="placeholder-text">点击牌堆抽取</div>
            </div>
        `;
    }
    
    return cardDiv;
}

// 处理抽牌
function handleCardDraw(e) {
    e.preventDefault();
    e.stopPropagation();
    
    if (!checkDailyTarotLimit()) {
        alert('今日已占卜，明天再来');
        return;
    }
    
    const config = getCurrentSpreadConfig();
    const drawnCards = getDrawnCards();
    
    // 检查是否所有位置都已抽牌
    if (drawnCards.length >= config.positions.length) {
        return; // 所有位置都已抽牌
    }
    
    // 找到第一个未抽牌的位置
    const emptyPosition = config.positions.find(pos => {
        return !drawnCards.find(c => c.position.id === pos.id);
    });
    
    if (!emptyPosition) {
        console.warn('No empty position found');
        return;
    }
    
    // 抽牌
    const cardData = drawCardForPosition(emptyPosition);
    if (cardData) {
        // 重新渲染牌阵
        renderSpread();
        
        // 播放抽牌动画效果
        const slotElement = document.querySelector(`[data-position-id="${emptyPosition.id}"]`);
        if (slotElement) {
            slotElement.style.opacity = '0';
            slotElement.style.transform = 'scale(0.8)';
            setTimeout(() => {
                slotElement.style.transition = 'all 0.3s ease';
                slotElement.style.opacity = '1';
                slotElement.style.transform = 'scale(1)';
            }, 50);
        }
    } else {
        console.error('Failed to draw card');
        alert('抽牌失败，请重试');
    }
}

// 更新抽牌区
function updateDrawArea() {
    const cardPile = document.getElementById('tarot-card-pile');
    const readingBtn = document.getElementById('tarot-reading-btn');
    const isAllDrawn = isAllCardsDrawn();
    
    if (isAllDrawn) {
        if (cardPile) cardPile.style.display = 'none';
        if (readingBtn) readingBtn.style.display = 'block';
    } else {
        if (cardPile) cardPile.style.display = 'block';
        if (readingBtn) readingBtn.style.display = 'none';
    }
}

// 处理开始占卜
async function handleStartReading() {
    const questionInput = document.getElementById('tarot-question-input');
    const question = questionInput?.value.trim();
    
    if (!question) {
        alert('请输入你的问题');
        return;
    }
    
    if (question.length > 200) {
        alert('问题不能超过200字');
        return;
    }
    
    if (!checkDailyTarotLimit()) {
        alert('今日已占卜，明天再来');
        return;
    }
    
    const spreadType = getCurrentSpreadType();
    const drawnCards = getDrawnCards();
    
    if (!isAllCardsDrawn()) {
        alert('请先抽取所有牌');
        return;
    }
    
    // 隐藏开始占卜按钮和牌堆按钮
    const cardPile = document.getElementById('tarot-card-pile');
    const readingBtn = document.getElementById('tarot-reading-btn');
    if (cardPile) cardPile.style.display = 'none';
    if (readingBtn) readingBtn.style.display = 'none';
    
    // 显示加载状态
    showReadingLoading();
    
    try {
        // 获取所有历史数据
        const allDailyReadings = getAllDailyReadingsForTarot();
        
        // 准备卡片数据
        const cardsData = drawnCards.map(item => ({
            position: item.position,
            card: item.card
        }));
        
        // 调用AI生成占卜内容
        const readingData = await generateTarotSpreadReading(
            question,
            spreadType,
            cardsData,
            allDailyReadings
        );
        
        // 保存占卜记录
        const readingId = `${getTodayKey()}_${Date.now()}`;
        const fullReadingData = {
            id: readingId,
            timestamp: new Date().toISOString(),
            question: question,
            spread_type: spreadType,
            cards: cardsData,
            reading: readingData,
            chat_count: 0,
            max_chat_rounds: 2,
            can_continue_chat: true,
            chat_history: []
        };
        
        saveTarotReading(fullReadingData);
        // setDailyTarotLimit(); // 暂时屏蔽每日限制，不标记已占卜
        
        // 显示占卜结果
        renderReadingResult(fullReadingData);
        
        // 初始化聊天
        initChatForReading(readingId);
        
        // 更新限制提示
        checkAndDisplayDailyLimit();
        
    } catch (error) {
        console.error('Error generating reading:', error);
        alert('生成占卜内容时出错，请稍后重试。\n错误: ' + error.message);
        hideReadingLoading();
    }
}

// 显示加载状态
function showReadingLoading() {
    const resultArea = document.getElementById('tarot-result-area');
    if (resultArea) {
        resultArea.style.display = 'block';
        resultArea.innerHTML = `
            <div class="reading-loading">
                <div class="loading-text">正在为你生成专属占卜...</div>
                <div class="loading-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
    }
}

// 隐藏加载状态
function hideReadingLoading() {
    // 在renderReadingResult中会替换内容
}

// 渲染占卜结果
function renderReadingResult(readingData) {
    const resultArea = document.getElementById('tarot-result-area');
    if (!resultArea) return;
    
    const reading = readingData.reading;
    
    // 合并所有内容一起显示
    let contentText = '';
    if (reading.reading_paragraphs && reading.reading_paragraphs.length > 0) {
        contentText = reading.reading_paragraphs.join('\n\n');
    } else if (reading.overall_reading) {
        contentText = reading.overall_reading;
    }
    
    let html = `
        <div class="reading-result">
            <h3 class="result-title">🔮 占卜结果</h3>
            <div class="result-content">
                <p class="result-text">${contentText}</p>
            </div>
        </div>
    `;
    
    resultArea.innerHTML = html;
    resultArea.style.display = 'block';
    
    // 显示聊天区
    const chatArea = document.getElementById('tarot-chat-area');
    if (chatArea) {
        chatArea.style.display = 'block';
    }
}

// 隐藏占卜结果
function hideReadingResult() {
    const resultArea = document.getElementById('tarot-result-area');
    const chatArea = document.getElementById('tarot-chat-area');
    if (resultArea) resultArea.style.display = 'none';
    if (chatArea) chatArea.style.display = 'none';
}

// 渲染历史列表
function renderHistoryList() {
    const historyContainer = document.getElementById('tarot-history-container');
    if (!historyContainer) return;
    
    const readings = getTarotReadingsList();
    
    if (readings.length === 0) {
        historyContainer.innerHTML = '<div class="no-history">暂无历史占卜记录</div>';
        return;
    }
    
    let html = '<div class="history-title">📜 历史占卜</div>';
    
    readings.forEach(reading => {
        const date = new Date(reading.timestamp);
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        const questionPreview = reading.question.length > 30 
            ? reading.question.substring(0, 30) + '...' 
            : reading.question;
        
        html += `
            <div class="history-item" data-reading-id="${reading.id}">
                <div class="history-header">
                    <div class="history-question">${questionPreview}</div>
                    <div class="history-meta">
                        <span class="history-spread">${reading.spread_type}</span>
                        <span class="history-date">${dateStr}</span>
                    </div>
                </div>
                <div class="history-content" style="display: none;">
                    <div class="history-reading">${reading.reading.overall_reading || reading.reading.reading_paragraphs?.[0] || ''}</div>
                    ${reading.chat_history && reading.chat_history.length > 0 ? `
                        <div class="history-chat-toggle">
                            <span class="chat-count">共${reading.chat_history.length / 2}轮对话</span>
                            <button class="toggle-chat-btn">展开对话</button>
                        </div>
                        <div class="history-chat" style="display: none;">
                            ${reading.chat_history.map(msg => `
                                <div class="chat-msg ${msg.role}">
                                    <div class="msg-content">${msg.content}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    ${canContinueChat(reading.id) ? `
                        <button class="continue-chat-btn" data-reading-id="${reading.id}">继续提问</button>
                    ` : ''}
                </div>
            </div>
        `;
    });
    
    historyContainer.innerHTML = html;
    
    // 绑定历史记录展开/收起事件
    bindHistoryEvents();
}

// 绑定历史记录事件
function bindHistoryEvents() {
    // 展开/收起详情
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        const header = item.querySelector('.history-header');
        const content = item.querySelector('.history-content');
        if (header && content) {
            header.addEventListener('click', () => {
                const isVisible = content.style.display !== 'none';
                content.style.display = isVisible ? 'none' : 'block';
            });
        }
        
        // 展开/收起聊天
        const toggleChatBtn = item.querySelector('.toggle-chat-btn');
        const historyChat = item.querySelector('.history-chat');
        if (toggleChatBtn && historyChat) {
            toggleChatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = historyChat.style.display !== 'none';
                historyChat.style.display = isVisible ? 'none' : 'block';
                toggleChatBtn.textContent = isVisible ? '展开对话' : '收起对话';
            });
        }
        
        // 继续聊天按钮
        const continueChatBtn = item.querySelector('.continue-chat-btn');
        if (continueChatBtn) {
            continueChatBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const readingId = continueChatBtn.dataset.readingId;
                loadReadingForChat(readingId);
            });
        }
    });
}

// 加载占卜记录用于聊天
function loadReadingForChat(readingId) {
    const reading = getTarotReadingById(readingId);
    if (!reading) return;
    
    // 滚动到聊天区
    const chatArea = document.getElementById('tarot-chat-area');
    if (chatArea) {
        chatArea.scrollIntoView({ behavior: 'smooth' });
        initChatForReading(readingId);
    }
}

