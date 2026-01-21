// 塔罗模块主逻辑 - 三个界面版本

// 当前状态（全局变量，供其他模块使用）
window.currentReadingId = window.currentReadingId || null;
let currentView = 'question'; // 'question' | 'draw' | 'reading'

// 初始化塔罗模块
function initTarotModule() {
    // 显示提问界面
    showTarotView('question');
    
    // 绑定事件
    bindTarotEvents();
    
    // 加载历史记录
    renderHistoryList();
}

// 显示指定界面
function showTarotView(viewName) {
    // 隐藏所有界面
    document.querySelectorAll('.tarot-view').forEach(view => {
        view.classList.remove('active');
        view.style.display = 'none';
    });
    
    // 显示指定界面
    const targetView = document.getElementById(`tarot-${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        targetView.style.display = 'block';
        currentView = viewName;
    }
}

// 绑定事件
function bindTarotEvents() {
    // 提问界面：问题输入
    const questionInput = document.getElementById('tarot-question-input');
    const startBtn = document.getElementById('tarot-start-btn');
    
    if (questionInput) {
        questionInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            // 启用/禁用开始按钮
            if (startBtn) {
                startBtn.disabled = value.length === 0 || value.length > 200;
            }
            // 限制长度
            if (value.length > 200) {
                e.target.value = value.substring(0, 200);
                alert('问题不能超过200字');
            }
        });
    }
    
    // 开始占卜按钮
    if (startBtn) {
        startBtn.addEventListener('click', handleStartTarot);
    }
    
    // 抽牌界面：牌阵切换
    const spreadBtns = document.querySelectorAll('.spread-type-btn');
    spreadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const spreadType = btn.dataset.spread;
            switchSpread(spreadType);
        });
    });
    
    // 抽牌按钮
    const cardPile = document.getElementById('tarot-card-pile');
    if (cardPile) {
        cardPile.addEventListener('click', handleCardDraw);
        cardPile.style.cursor = 'pointer';
    }
    
    // 占卜解读按钮
    const readingBtn = document.getElementById('tarot-reading-btn');
    if (readingBtn) {
        readingBtn.addEventListener('click', handleStartReading);
    }
    
    // 聊天发送按钮
    const chatSendBtn = document.getElementById('tarot-chat-send');
    const chatInput = document.getElementById('tarot-chat-input');
    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', () => handleSendChatMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendChatMessage();
            }
        });
    }
    
    // 补牌按钮
    const additionalCardBtn = document.getElementById('tarot-additional-card-btn');
    if (additionalCardBtn) {
        additionalCardBtn.addEventListener('click', handleOpenAdditionalCardModal);
    }
    
    // 补牌弹窗关闭
    const additionalCardClose = document.getElementById('tarot-additional-card-close');
    if (additionalCardClose) {
        additionalCardClose.addEventListener('click', () => {
            document.getElementById('tarot-additional-card-modal').style.display = 'none';
        });
    }
    
    // 补牌抽牌按钮
    const additionalCardPile = document.getElementById('tarot-additional-card-pile');
    if (additionalCardPile) {
        additionalCardPile.addEventListener('click', handleDrawAdditionalCard);
    }
    
    // 复盘按钮
    const reviewBtn = document.getElementById('tarot-review-btn');
    if (reviewBtn) {
        reviewBtn.addEventListener('click', handleOpenReviewModal);
    }
    
    // 复盘弹窗关闭
    const reviewClose = document.getElementById('tarot-review-close');
    if (reviewClose) {
        reviewClose.addEventListener('click', () => {
            document.getElementById('tarot-review-modal').style.display = 'none';
        });
    }
    
    // 复盘提交按钮
    const reviewSubmitBtn = document.getElementById('tarot-review-submit-btn');
    if (reviewSubmitBtn) {
        reviewSubmitBtn.addEventListener('click', handleSubmitReview);
    }
    
    // 返回按钮
    const backBtn = document.getElementById('tarot-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', handleBackToQuestion);
    }
    
    // 复盘评分星星
    document.querySelectorAll('.tarot-review-stars').forEach(starsContainer => {
        starsContainer.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', () => {
                const scoreType = starsContainer.dataset.score;
                const value = parseInt(star.dataset.value);
                updateReviewScore(scoreType, value);
            });
        });
    });
}

// 开始占卜流程
function handleStartTarot() {
    const questionInput = document.getElementById('tarot-question-input');
    if (!questionInput) return;
    
    const question = questionInput.value.trim();
    if (!question || question.length === 0) {
        alert('请输入你的问题');
        return;
    }
    
    if (question.length > 200) {
        alert('问题不能超过200字');
        return;
    }
    
    // 检查每日限制
    if (!checkDailyTarotLimit()) {
        alert('今日已占卜，明天再来');
        return;
    }
    
    // 保存问题到临时状态（稍后在生成占卜时保存）
    // 播放洗牌动画（简化版）
    playShuffleAnimation();
    
    // 切换到抽牌界面
    setTimeout(() => {
        showTarotView('draw');
        // 初始化牌阵（默认3张）
        initSpread('3张');
        renderSpread();
    }, 500);
}

// 播放洗牌动画（简化版）
function playShuffleAnimation() {
    // 简单的淡入淡出效果
    const questionView = document.getElementById('tarot-question-view');
    if (questionView) {
        questionView.style.opacity = '0';
        questionView.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            questionView.style.opacity = '1';
        }, 500);
    }
}

// 切换牌阵
function switchSpread(newType) {
    initSpread(newType);
    resetSpread();
    renderSpread();
    updateSpreadButtons(newType);
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

// 抽牌处理
function handleCardDraw() {
    if (!checkDailyTarotLimit()) return;
    
    const nextPosition = getNextEmptyPosition();
    if (!nextPosition) {
        // 所有位置已填满，显示占卜按钮
        const cardPile = document.getElementById('tarot-card-pile');
        const readingBtn = document.getElementById('tarot-reading-btn');
        if (cardPile) cardPile.style.display = 'none';
        if (readingBtn) readingBtn.style.display = 'block';
        return;
    }
    
    // 抽取一张牌
    const card = drawCardForPosition(nextPosition);
    if (card) {
        // 播放翻转动画
        animateCardFlip(nextPosition, card);
    }
}

// 开始占卜解读
async function handleStartReading() {
    const questionInput = document.getElementById('tarot-question-input');
    if (!questionInput) return;
    
    const question = questionInput.value.trim();
    if (!question) {
        alert('请先输入问题');
        showTarotView('question');
        return;
    }
    
    // 获取抽到的牌
    const cards = getDrawnCards();
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
        alert('请先抽取所有牌');
        return;
    }
    
    // 验证牌数据格式
    const validCards = cards.filter(cardData => cardData && cardData.card && cardData.position);
    if (validCards.length !== cards.length) {
        console.error('部分牌数据格式错误', cards);
        alert('牌数据格式错误，请重新抽牌');
        return;
    }
    
    // 获取牌阵类型
    const spreadType = getCurrentSpreadType();
    
    // 显示加载状态
    showTarotView('reading');
	resetTarotReadingViewUI();
    showReadingLoading();
    
    try {
        // 生成占卜解读
        const reading = await generateTarotSpreadReading(question, spreadType, cards);
        
        // 保存占卜记录
        const readingId = saveTarotReading({
            question,
            spreadType,
            cards,
            reading
        });
        
        window.currentReadingId = readingId;
        
        // 标记今日已占卜
        setDailyTarotLimit();
        
        // 显示占卜结果
        renderReadingResult(reading);
        
        // 初始化聊天
        initChatArea(readingId);
        
        // 更新补牌和复盘按钮状态
        updateActionButtons(readingId);
        
    } catch (error) {
        console.error('生成占卜失败:', error);
        alert('生成占卜失败，请重试');
    }
}

// 重置解读界面 UI（避免新占卜沿用上一次的复盘/聊天内容）
function resetTarotReadingViewUI() {
	// 复盘显示区清空
	const reviewDisplay = document.getElementById('tarot-review-display');
	if (reviewDisplay) {
		reviewDisplay.style.display = 'none';
		reviewDisplay.innerHTML = '';
	}

	// 复盘弹窗内报告清空（防止残留）
	const reviewReport = document.getElementById('tarot-review-report');
	if (reviewReport) {
		reviewReport.style.display = 'none';
		reviewReport.innerHTML = '';
	}

	// 恢复补牌/复盘按钮
	const actionButtons = document.querySelector('.tarot-action-buttons');
	if (actionButtons) {
		actionButtons.style.display = 'flex';
	}

	// 聊天区清空
	const messagesContainer = document.getElementById('tarot-chat-messages');
	if (messagesContainer) {
		messagesContainer.innerHTML = '';
		messagesContainer.scrollTop = 0;
	}

	// 聊天限制提示清空
	const limitNotice = document.getElementById('tarot-chat-limit-notice');
	if (limitNotice) {
		limitNotice.style.display = 'none';
		limitNotice.textContent = '';
	}

	const roundsDisplay = document.getElementById('tarot-chat-rounds-display');
	if (roundsDisplay) {
		roundsDisplay.textContent = '';
	}

	// 恢复聊天输入
	const chatInput = document.getElementById('tarot-chat-input');
	if (chatInput) {
		chatInput.disabled = false;
		chatInput.value = '';
	}
	const chatSendBtn = document.getElementById('tarot-chat-send');
	if (chatSendBtn) {
		chatSendBtn.disabled = false;
	}
}

// 显示加载状态
function showReadingLoading() {
    const resultArea = document.getElementById('tarot-result-area');
    if (!resultArea) return;
    
    resultArea.innerHTML = `
        <div class="reading-loading">
            <div class="loading-text">正在为你生成专属占卜...</div>
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
}

// 渲染占卜结果
function renderReadingResult(reading) {
    const resultArea = document.getElementById('tarot-result-area');
    if (!resultArea || !window.currentReadingId) return;
    
    const readingData = getTarotReading(window.currentReadingId);
    if (!readingData) return;
    
    const paragraphs = reading.reading_paragraphs || [];
    const overallReading = reading.overall_reading || paragraphs.join('\n\n');
    const userQuestion = readingData.question || '';
    const questionHTML = userQuestion
        ? `
            <div class="reading-question-section">
                <div class="reading-question-title">你的提问</div>
                <div class="reading-question-text">${escapeHtml(userQuestion)}</div>
            </div>
        `
        : '';
    
    // 渲染初始牌型
    let cardsHTML = '<div class="reading-cards-section">';
    cardsHTML += '<div class="reading-cards-title">初始牌阵</div>';
    cardsHTML += '<div class="reading-cards-grid">';
    readingData.cards.forEach(cardData => {
        const card = cardData.card;
        const position = cardData.position;
        cardsHTML += `
            <div class="reading-card-item">
                <div class="reading-card-image-wrapper">
                    <img src="Cards-png/${card.file}" alt="${card.nameCn}" class="reading-card-image ${card.reversed ? 'reversed' : ''}">
                </div>
                <div class="reading-card-info">
                    <div class="reading-card-position">${escapeHtml(position.name)}</div>
                    <div class="reading-card-name">${escapeHtml(card.nameCn)}</div>
                    <div class="reading-card-orientation">${card.reversed ? '逆位' : '正位'}</div>
                </div>
            </div>
        `;
    });
    cardsHTML += '</div></div>';
    
    // 渲染补牌信息
    let additionalCardsHTML = '';
    if (readingData.additional_cards && readingData.additional_cards.length > 0) {
        additionalCardsHTML += '<div class="reading-additional-cards-section">';
        additionalCardsHTML += '<div class="reading-cards-title">补牌记录</div>';
        readingData.additional_cards.forEach((additionalCard, index) => {
            const card = additionalCard.card;
            additionalCardsHTML += `
                <div class="reading-additional-card-item">
                    <div class="reading-additional-card-header">
                        <div class="reading-additional-card-image-wrapper">
                            <img src="Cards-png/${card.file}" alt="${card.nameCn}" class="reading-card-image ${card.reversed ? 'reversed' : ''}">
                        </div>
                        <div class="reading-additional-card-info">
                            <div class="reading-card-name">${escapeHtml(card.nameCn)}</div>
                            <div class="reading-card-orientation">${card.reversed ? '逆位' : '正位'}</div>
                        </div>
                    </div>
                    ${additionalCard.userInput ? `<div class="reading-additional-card-user-input">${escapeHtml(additionalCard.userInput)}</div>` : ''}
                    <div class="reading-additional-card-reading">${escapeHtml(additionalCard.reading || '')}</div>
                </div>
            `;
        });
        additionalCardsHTML += '</div>';
    }
    
    resultArea.innerHTML = `
        <div class="reading-result">
            <div class="result-title">🔮 占卜解读</div>
            ${questionHTML}
            ${cardsHTML}
            <div class="result-content">
                <div class="result-text">${escapeHtml(overallReading)}</div>
            </div>
            ${additionalCardsHTML}
        </div>
    `;
}

// 初始化聊天区域
function initChatArea(readingId) {
    const chatArea = document.getElementById('tarot-chat-area');
    if (!chatArea) return;
    
    chatArea.style.display = 'block';
    
    // 加载聊天历史
    const reading = getTarotReading(readingId);
	// 无论是否有历史，都先清空，避免沿用上一次的消息
	renderChatMessages((reading && Array.isArray(reading.chat_history)) ? reading.chat_history : []);
    
    // 更新聊天轮数显示
    updateChatRoundsDisplay(readingId);
}

// 更新聊天轮数显示
function updateChatRoundsDisplay(readingId) {
    const display = document.getElementById('tarot-chat-rounds-display');
    if (!display) return;
    
    const reading = getTarotReading(readingId);
    if (!reading) return;
    
    const chatCount = reading.chat_count || 0;
    const maxRounds = reading.max_chat_rounds || 2;
    const remaining = maxRounds - chatCount;
    
    display.textContent = `剩余 ${remaining} 轮`;
    
    // 检查是否达到限制
    if (remaining <= 0) {
        const limitNotice = document.getElementById('tarot-chat-limit-notice');
        const chatInput = document.getElementById('tarot-chat-input');
        const chatSendBtn = document.getElementById('tarot-chat-send');
        
        if (limitNotice) {
            limitNotice.style.display = 'block';
            limitNotice.textContent = '今日聊天次数已用完，如需继续深度交流，请等待明天或查看订阅方案';
        }
        if (chatInput) chatInput.disabled = true;
        if (chatSendBtn) chatSendBtn.disabled = true;
    }
}

// 发送聊天消息
async function handleSendChatMessage() {
    if (!window.currentReadingId) return;
    
    const chatInput = document.getElementById('tarot-chat-input');
    if (!chatInput) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // 检查聊天轮数限制
    const reading = getTarotReading(window.currentReadingId);
    if (!reading) return;
    
    const chatCount = reading.chat_count || 0;
    const maxRounds = reading.max_chat_rounds || 2;
    if (chatCount >= maxRounds) {
        alert('今日聊天次数已用完');
        return;
    }
    
    // 显示用户消息
    appendChatMessage('user', message);
    chatInput.value = '';
    
    // 显示AI思考中
    const thinkingId = appendChatMessage('assistant', '', true);
    
    try {
        // 生成AI回复
        const response = await generateTarotChatResponse(window.currentReadingId, message);
        
        // 更新消息
        updateChatMessage(thinkingId, response);
        
        // 保存聊天记录
        addChatMessageToReading(window.currentReadingId, 'user', message);
        addChatMessageToReading(window.currentReadingId, 'assistant', response);
        
        // 更新聊天轮数
        incrementChatCount(window.currentReadingId);
        updateChatRoundsDisplay(window.currentReadingId);
        
    } catch (error) {
        console.error('生成回复失败:', error);
        updateChatMessage(thinkingId, '抱歉，我现在有些困惑，稍后再试试吧');
    }
}

// 追加聊天消息
function appendChatMessage(role, content, isThinking = false) {
    const messagesContainer = document.getElementById('tarot-chat-messages');
    if (!messagesContainer) return null;
    
    const messageId = `msg-${Date.now()}`;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    messageDiv.id = messageId;
    
    if (isThinking) {
        messageDiv.innerHTML = `
            <div class="message-bubble ${role}-bubble">
                ${role === 'assistant' ? '<div class="assistant-avatar">Luna</div>' : ''}
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-bubble ${role}-bubble">
                ${role === 'assistant' ? '<div class="assistant-avatar">Luna</div>' : ''}
                <div class="message-content">${escapeHtml(content)}</div>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return messageId;
}

// 更新聊天消息
function updateChatMessage(messageId, content) {
    const messageDiv = document.getElementById(messageId);
    if (!messageDiv) return;
    
    const contentDiv = messageDiv.querySelector('.message-content');
    if (contentDiv) {
        contentDiv.innerHTML = escapeHtml(content);
    }
}

// 渲染聊天消息列表
function renderChatMessages(messages) {
    const messagesContainer = document.getElementById('tarot-chat-messages');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = '';
    messages.forEach(msg => {
        appendChatMessage(msg.role, msg.content);
    });
}

// 打开补牌弹窗
function handleOpenAdditionalCardModal() {
    if (!window.currentReadingId) return;
    
    // 检查冷却时间
    const cooldownInfo = checkAdditionalCardCooldown(window.currentReadingId);
    if (!cooldownInfo.canDraw) {
        alert(`补牌冷却中，还需等待 ${cooldownInfo.remainingText}`);
        return;
    }
    
    // 检查是否已复盘
    const reading = getTarotReading(window.currentReadingId);
    if (reading && reading.is_reviewed) {
        alert('已复盘，无法继续补牌');
        return;
    }
    
    // 重置补牌弹窗
    const modal = document.getElementById('tarot-additional-card-modal');
    const input = document.getElementById('tarot-additional-card-input');
    const result = document.getElementById('tarot-additional-card-result');
    const pile = document.getElementById('tarot-additional-card-pile');
    
    if (input) input.value = '';
    if (result) {
        result.style.display = 'none';
        result.innerHTML = '';
    }
    if (pile) pile.style.display = 'block';
    
    if (modal) modal.style.display = 'flex';
}

// 抽取补牌
async function handleDrawAdditionalCard() {
    if (!window.currentReadingId) return;
    
    const pile = document.getElementById('tarot-additional-card-pile');
    const result = document.getElementById('tarot-additional-card-result');
    const input = document.getElementById('tarot-additional-card-input');
    
    if (!pile || !result) return;
    
    // 隐藏牌堆
    pile.style.display = 'none';
    
    // 抽取一张牌
    const card = drawRandomCard();
    if (!card) {
        alert('抽牌失败，请重试');
        pile.style.display = 'block';
        return;
    }

	// 先展示抽到的牌（再进入生成）
	result.style.display = 'block';
	result.innerHTML = `
		<div class="tarot-additional-card-result-content">
			<div class="result-title">🃏 补牌</div>
			<div class="tarot-additional-card-drawn">
				<div class="tarot-additional-card-drawn-image">
					<img src="Cards-png/${card.file}" alt="${escapeHtml(card.nameCn || '')}" class="reading-card-image ${card.reversed ? 'reversed' : ''}">
				</div>
				<div class="tarot-additional-card-drawn-info">
					<div class="tarot-additional-card-drawn-name">${escapeHtml(card.nameCn || '')}</div>
					<div class="tarot-additional-card-drawn-orientation">${card.reversed ? '逆位' : '正位'}</div>
				</div>
			</div>
			<div class="tarot-additional-card-loading">
				<div class="loading-text">正在生成补牌解读...</div>
			</div>
		</div>
	`;
    
    try {
        // 获取用户输入（可选）
        const userInput = input ? input.value.trim() : '';
        
        // 生成补牌解读
        const reading = await generateAdditionalCardReading(window.currentReadingId, card, userInput);
        
        // 保存补牌记录
        saveAdditionalCard(window.currentReadingId, {
            card,
            userInput,
            reading
        });
        
		// 更新补牌结果（保留抽到的牌展示）
		const textEl = result.querySelector('.tarot-additional-card-loading');
		if (textEl) {
			textEl.innerHTML = `<div class="result-text">${escapeHtml(reading)}</div>`;
		} else {
			result.innerHTML = `
				<div class="tarot-additional-card-result-content">
					<div class="result-title">🃏 补牌解读</div>
					<div class="result-text">${escapeHtml(reading)}</div>
				</div>
			`;
		}
        
        // 更新补牌按钮冷却显示
        updateAdditionalCardButtonCooldown(window.currentReadingId);
        
        // 刷新占卜结果显示（包含补牌信息）
        const readingData = getTarotReading(window.currentReadingId);
        if (readingData && readingData.reading) {
            renderReadingResult(readingData.reading);
        }
        
    } catch (error) {
        console.error('生成补牌解读失败:', error);
        result.innerHTML = '<div class="error-text">生成补牌解读失败，请重试</div>';
    }
}

// 打开复盘弹窗
function handleOpenReviewModal() {
    if (!window.currentReadingId) return;
    
    // 检查是否已复盘
    const reading = getTarotReading(window.currentReadingId);
    if (reading && reading.is_reviewed) {
        // 显示已有复盘
        showReviewReport(reading.review);
        return;
    }
    
    // 重置评分（默认3分）
    resetReviewScores();
    
    // 重置评价输入
    const commentInput = document.getElementById('tarot-review-comment-input');
    if (commentInput) commentInput.value = '';
    
    // 隐藏报告
    const report = document.getElementById('tarot-review-report');
    if (report) report.style.display = 'none';
    
    // 显示弹窗
    const modal = document.getElementById('tarot-review-modal');
    if (modal) modal.style.display = 'flex';
}

// 重置评分（默认3分）
function resetReviewScores() {
    document.querySelectorAll('.tarot-review-stars').forEach(starsContainer => {
        starsContainer.querySelectorAll('.star').forEach((star, index) => {
            if (index < 3) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    });
}

// 更新评分
function updateReviewScore(scoreType, value) {
    const starsContainer = document.querySelector(`.tarot-review-stars[data-score="${scoreType}"]`);
    if (!starsContainer) return;
    
    starsContainer.querySelectorAll('.star').forEach((star, index) => {
        if (index < value) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// 提交复盘
async function handleSubmitReview() {
    if (!window.currentReadingId) return;
    
    // 获取评分
    const scores = {
        accuracy: getReviewScore('accuracy'),
        guidance: getReviewScore('guidance'),
        warmth: getReviewScore('warmth')
    };
    
    // 获取用户评价
    const commentInput = document.getElementById('tarot-review-comment-input');
    const userComment = commentInput ? commentInput.value.trim() : '';
    
    // 显示加载
    const submitBtn = document.getElementById('tarot-review-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '生成中...';
    }
    
    try {
        // 生成复盘报告
        const report = await generateReviewReport(window.currentReadingId, scores, userComment);
        
        // 保存复盘
        saveReview(window.currentReadingId, {
            scores,
            userComment,
            reviewReport: report
        });
        
        // 标记已复盘
        markReadingAsReviewed(window.currentReadingId);
        
        // 关闭复盘弹窗
        const reviewModal = document.getElementById('tarot-review-modal');
        if (reviewModal) {
            reviewModal.style.display = 'none';
        }
        
        // 在解读界面最下方显示复盘内容
        displayReviewInReadingView({
            scores,
            userComment,
            reviewReport: report
        });
        
        // 隐藏补牌和复盘按钮
        hideActionButtonsAfterReview();
        
        // 禁用聊天
        disableChatAfterReview();
        
    } catch (error) {
        console.error('生成复盘报告失败:', error);
        alert('生成复盘报告失败，请重试');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交复盘';
        }
    }
}

// 获取评分值
function getReviewScore(scoreType) {
    const starsContainer = document.querySelector(`.tarot-review-stars[data-score="${scoreType}"]`);
    if (!starsContainer) return 3;
    
    const activeStars = starsContainer.querySelectorAll('.star.active');
    return activeStars.length;
}

// 显示复盘报告
function showReviewReport(review) {
    const reportDiv = document.getElementById('tarot-review-report');
    if (!reportDiv || !review) return;
    
    reportDiv.style.display = 'block';
    reportDiv.innerHTML = `
        <div class="tarot-review-report-content">
            <div class="result-title">📝 复盘报告</div>
            <div class="result-text">${review.reviewReport || review.review_report || ''}</div>
        </div>
    `;
}

// 在解读界面显示复盘内容
function displayReviewInReadingView(review) {
    const reviewDisplay = document.getElementById('tarot-review-display');
    if (!reviewDisplay || !review) return;
    
    const scores = review.scores || {};
    const scoresText = `命中: ${scores.accuracy || 3}/5 | 指引: ${scores.guidance || 3}/5 | 温暖: ${scores.warmth || 3}/5`;
    
    reviewDisplay.style.display = 'block';
    reviewDisplay.innerHTML = `
        <div class="reading-review-section">
            <div class="result-title">📝 复盘报告</div>
            <div class="review-scores-display">${scoresText}</div>
            ${review.userComment ? `<div class="review-user-comment">${escapeHtml(review.userComment)}</div>` : ''}
            <div class="review-report-content">
                <div class="result-text">${escapeHtml(review.reviewReport || review.review_report || '')}</div>
            </div>
        </div>
    `;
}

// 隐藏补牌和复盘按钮
function hideActionButtonsAfterReview() {
    const actionButtons = document.querySelector('.tarot-action-buttons');
    if (actionButtons) {
        actionButtons.style.display = 'none';
    }
}

// 禁用复盘后的操作（仅禁用聊天）
function disableChatAfterReview() {
    const chatInput = document.getElementById('tarot-chat-input');
    const chatSendBtn = document.getElementById('tarot-chat-send');
    
    if (chatInput) chatInput.disabled = true;
    if (chatSendBtn) chatSendBtn.disabled = true;
}

// 禁用复盘后的操作（旧函数，保留兼容性）
function disableActionsAfterReview() {
    hideActionButtonsAfterReview();
    disableChatAfterReview();
}

// 返回提问界面
function handleBackToQuestion() {
    showTarotView('question');
    // 重新加载历史列表
    renderHistoryList();
}

// 更新操作按钮状态
function updateActionButtons(readingId) {
    // 更新补牌按钮冷却显示
    updateAdditionalCardButtonCooldown(readingId);
    
    // 检查是否已复盘
    const reading = getTarotReading(readingId);
    if (reading && reading.is_reviewed) {
        // 隐藏补牌和复盘按钮
        hideActionButtonsAfterReview();
        // 禁用聊天
        disableChatAfterReview();
        // 显示复盘内容
        if (reading.review) {
            displayReviewInReadingView(reading.review);
        }
    } else {
        // 未复盘时显示按钮
        const actionButtons = document.querySelector('.tarot-action-buttons');
        if (actionButtons) {
            actionButtons.style.display = 'flex';
        }
        // 隐藏复盘显示区
        const reviewDisplay = document.getElementById('tarot-review-display');
        if (reviewDisplay) {
            reviewDisplay.style.display = 'none';
        }
    }
}

// 更新补牌按钮冷却显示
function updateAdditionalCardButtonCooldown(readingId) {
    const btn = document.getElementById('tarot-additional-card-btn');
    const cooldownSpan = document.getElementById('tarot-additional-card-cooldown');
    if (!btn || !cooldownSpan) return;
    
    const cooldownInfo = checkAdditionalCardCooldown(readingId);
    if (!cooldownInfo.canDraw) {
        cooldownSpan.style.display = 'block';
        cooldownSpan.textContent = cooldownInfo.remainingText;
        btn.disabled = true;
    } else {
        cooldownSpan.style.display = 'none';
        btn.disabled = false;
    }
}

// 渲染历史列表
function renderHistoryList() {
    const historyList = document.getElementById('tarot-history-list');
    if (!historyList) return;
    
    // 使用 getTarotReadingsList() 获取已排序的数组，如果没有则使用 Object.values() 转换
    let readings;
    if (typeof getTarotReadingsList === 'function') {
        readings = getTarotReadingsList();
    } else {
        const readingsObj = getAllTarotReadings();
        readings = Object.values(readingsObj || {});
        readings.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    if (!readings || readings.length === 0) {
        historyList.innerHTML = '<div class="no-history">暂无历史占卜</div>';
        return;
    }
    
    historyList.innerHTML = readings.map(reading => {
        const date = new Date(reading.timestamp);
        const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
        const questionPreview = reading.question.length > 30 
            ? reading.question.substring(0, 30) + '...' 
            : reading.question;
        
        return `
            <div class="history-item" data-reading-id="${reading.id}">
                <div class="history-header">
                    <div class="history-question">${escapeHtml(questionPreview)}</div>
                    <div class="history-meta">
                        <span class="history-date">${dateStr}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 绑定点击事件
    historyList.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const readingId = item.dataset.readingId;
            viewHistoryReading(readingId);
        });
    });
}

// 查看历史占卜
function viewHistoryReading(readingId) {
    const reading = getTarotReading(readingId);
    if (!reading) return;
    
        window.currentReadingId = readingId;
    
    // 切换到解读界面
    showTarotView('reading');
    
    // 显示占卜结果
    if (reading.reading) {
        renderReadingResult(reading.reading);
    }
    
    // 初始化聊天
    initChatArea(readingId);
    
    // 更新按钮状态
    updateActionButtons(readingId);
    
    // 检查是否可以继续聊天
    const canContinue = canContinueChat(readingId);
    if (!canContinue) {
        const chatInput = document.getElementById('tarot-chat-input');
        const chatSendBtn = document.getElementById('tarot-chat-send');
        if (chatInput) chatInput.disabled = true;
        if (chatSendBtn) chatSendBtn.disabled = true;
    }
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 显示塔罗页面（从导航调用）
function showTarotPage() {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    const tarotPage = document.getElementById('tarot-page');
    if (tarotPage) {
        tarotPage.style.display = 'block';
        tarotPage.classList.add('active');
    }
    
    // 显示导航栏
    document.body.classList.add('show-nav');
    updateNavActive('tarot');
    
    // 初始化模块
    initTarotModule();
}

console.log('tarot-module.js 已加载');
