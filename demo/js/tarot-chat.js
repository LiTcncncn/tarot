// 塔罗聊天交互逻辑

let currentReadingId = null;

// 为指定占卜初始化聊天
function initChatForReading(readingId) {
    currentReadingId = readingId;
    const reading = getTarotReadingById(readingId);
    if (!reading) return;
    
    // 检查是否可以继续聊天
    if (!canContinueChat(readingId)) {
        disableChatInput();
        showChatLimitNotice();
        return;
    }
    
    // 清空聊天区
    const chatMessages = document.getElementById('tarot-chat-messages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
    }
    
    // 显示历史聊天（如果有）
    if (reading.chat_history && reading.chat_history.length > 0) {
        renderChatHistory(reading.chat_history);
    }
    
    // 启用输入
    enableChatInput();
    hideChatLimitNotice();
    
    // 更新聊天轮数显示
    updateChatRoundDisplay();
}

// 渲染聊天历史
function renderChatHistory(chatHistory) {
    const chatMessages = document.getElementById('tarot-chat-messages');
    if (!chatMessages) return;
    
    chatHistory.forEach(msg => {
        appendChatMessage(msg.role, msg.content);
    });
}

// 发送聊天消息
async function sendChatMessage() {
    if (!currentReadingId) return;
    
    const input = document.getElementById('tarot-chat-input');
    const message = input?.value.trim();
    
    if (!message) return;
    
    // 检查是否可以继续聊天
    if (!canContinueChat(currentReadingId)) {
        alert('今日聊天次数已用完');
        return;
    }
    
    // 显示用户消息
    appendChatMessage('user', message);
    input.value = '';
    
    // 禁用输入，显示加载
    disableChatInput();
    showChatLoading();
    
    try {
        // 获取占卜记录
        const reading = getTarotReadingById(currentReadingId);
        if (!reading) throw new Error('Reading not found');
        
        // 准备聊天上下文
        const chatContext = {
            question: reading.question,
            overall_reading: reading.reading.overall_reading || reading.reading.reading_paragraphs?.[0] || '',
            cards: reading.cards,
            chat_history: reading.chat_history || []
        };
        
        // 获取所有历史数据
        const allDailyReadings = getAllDailyReadingsForTarot();
        
        // 调用AI生成回复
        const aiResponse = await generateTarotChatResponse(message, chatContext, allDailyReadings);
        
        // 显示AI回复
        appendChatMessage('assistant', aiResponse);
        
        // 保存聊天记录
        if (!reading.chat_history) reading.chat_history = [];
        reading.chat_history.push({
            role: 'user',
            content: message,
            timestamp: new Date().toISOString()
        });
        reading.chat_history.push({
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString()
        });
        
        // 增加聊天轮数
        incrementChatCount(currentReadingId);
        reading.chat_count = (reading.chat_count || 0) + 1;
        saveTarotReading(reading);
        
        // 检查是否达到限制
        if (!canContinueChat(currentReadingId)) {
            disableChatInput();
            showChatLimitNotice();
        } else {
            enableChatInput();
        }
        
        updateChatRoundDisplay();
        
        // 刷新历史列表
        if (typeof renderHistoryList === 'function') {
            renderHistoryList();
        }
        
    } catch (error) {
        console.error('Error sending chat message:', error);
        appendChatMessage('system', '发送消息时出错，请稍后重试。');
        enableChatInput();
    } finally {
        hideChatLoading();
    }
}

// 添加聊天消息到界面
function appendChatMessage(role, content) {
    const chatMessages = document.getElementById('tarot-chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    
    if (role === 'user') {
        messageDiv.innerHTML = `
            <div class="message-bubble user-bubble">
                <div class="message-content">${content}</div>
            </div>
        `;
    } else if (role === 'assistant') {
        messageDiv.innerHTML = `
            <div class="message-bubble assistant-bubble">
                <div class="assistant-avatar">Luna</div>
                <div class="message-content">${content}</div>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-bubble system-bubble">
                <div class="message-content">${content}</div>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 显示聊天加载状态
function showChatLoading() {
    const chatMessages = document.getElementById('tarot-chat-messages');
    if (!chatMessages) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'chat-loading-indicator';
    loadingDiv.className = 'chat-message assistant';
    loadingDiv.innerHTML = `
        <div class="message-bubble assistant-bubble">
            <div class="assistant-avatar">Luna</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 隐藏聊天加载状态
function hideChatLoading() {
    const loading = document.getElementById('chat-loading-indicator');
    if (loading) loading.remove();
}

// 启用聊天输入
function enableChatInput() {
    const input = document.getElementById('tarot-chat-input');
    const sendBtn = document.getElementById('tarot-chat-send');
    if (input) input.disabled = false;
    if (sendBtn) sendBtn.disabled = false;
}

// 禁用聊天输入
function disableChatInput() {
    const input = document.getElementById('tarot-chat-input');
    const sendBtn = document.getElementById('tarot-chat-send');
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
}

// 显示聊天限制提示
function showChatLimitNotice() {
    const notice = document.getElementById('tarot-chat-limit-notice');
    if (notice) {
        notice.style.display = 'block';
        notice.textContent = '今日聊天次数已用完，如需继续深度交流，请等待明天或查看订阅方案';
    }
}

// 隐藏聊天限制提示
function hideChatLimitNotice() {
    const notice = document.getElementById('tarot-chat-limit-notice');
    if (notice) notice.style.display = 'none';
}

// 更新聊天轮数显示
function updateChatRoundDisplay() {
    if (!currentReadingId) return;
    
    const reading = getTarotReadingById(currentReadingId);
    if (!reading) return;
    
    const display = document.getElementById('tarot-chat-rounds-display');
    if (display) {
        const used = reading.chat_count || 0;
        const max = reading.max_chat_rounds || 2;
        display.textContent = `已使用 ${used}/${max} 轮`;
    }
}

// 绑定聊天事件
function bindChatEvents() {
    const sendBtn = document.getElementById('tarot-chat-send');
    const input = document.getElementById('tarot-chat-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendChatMessage);
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
}

// 初始化聊天（在页面加载时调用）
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        bindChatEvents();
    });
}



