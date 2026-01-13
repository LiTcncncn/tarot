// Miri 聊天模块核心逻辑

// 常量定义
const MIRI_STORAGE_KEY = 'miri_chat_history';
const MIRI_MIRROR_SHOWN_KEY = 'miri_mirror_shown';
const MIRI_DAILY_MIRROR_KEY_PREFIX = 'miri_daily_mirror_';
const MAX_CHAT_GROUPS = 20; // 最多保存20组对答
const STREAM_CHAR_DELAY = 40; // 流式输出每字延迟（毫秒）

// 当前对话历史
let currentChatHistory = [];
// 当前话语提示
let currentSuggestions = [];
// 是否正在发送消息
let isSending = false;
// 流式输出控制
let streamingMessageId = null;
// 是否已初始化/是否已绑定事件（防止重复绑定与重复渲染）
let isMiriPageInitialized = false;
let isMiriEventsBound = false;

// ===== 初始化 Miri 页面 =====
function initMiriPage() {
    // 允许多次进入页面，但避免重复绑定事件；渲染逻辑做成幂等
    if (!isMiriEventsBound) {
        bindMiriEvents();
        isMiriEventsBound = true;
    }

    // 清理：今天以前且未选择的镜像句不保留（用户未回应就不展示/不留存）
    purgeStaleUnselectedDailyMirrors();

    // 每次进入都尝试加载并渲染最新历史（刷新/返回时保持一致）
    loadChatHistory();
    renderMiriChatView();

    // 仅在“本次会话”未初始化时，执行一次首屏逻辑（镜像句/提示）
    if (!isMiriPageInitialized) {
        isMiriPageInitialized = true;
        checkAndShowMirrorQuestion();
    } else {
        // 已有历史则无需重复生成；没有历史则补一次镜像句/提示
        if (currentChatHistory.length === 0) {
            checkAndShowMirrorQuestion();
        } else {
            generateSuggestions().catch(() => {});
        }
    }
}

function purgeStaleUnselectedDailyMirrors() {
    try {
        const todayKey = getTodayDateString();
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (!k || !k.startsWith(MIRI_DAILY_MIRROR_KEY_PREFIX)) continue;
            const dateKey = k.slice(MIRI_DAILY_MIRROR_KEY_PREFIX.length);
            if (dateKey === todayKey) continue;
            const raw = localStorage.getItem(k);
            if (!raw) continue;
            let state = null;
            try { state = JSON.parse(raw); } catch (_) { state = null; }
            const selected = state?.selectedOption;
            if (!selected) {
                localStorage.removeItem(k);
            }
        }
    } catch (e) {
        // ignore
    }
}

// ===== 绑定事件 =====
function bindMiriEvents() {
    const input = document.getElementById('miri-input');
    const sendBtn = document.getElementById('miri-send-btn');
    const suggestionsContainer = document.getElementById('miri-suggestions');
    
    if (!input || !sendBtn) return;
    
    // 输入框输入事件
    input.addEventListener('input', () => {
        const hasContent = input.value.trim().length > 0;
        sendBtn.disabled = !hasContent || isSending;
    });
    
    // 输入框回车事件
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isSending && input.value.trim()) {
                sendUserMessage();
            }
        }
    });
    
    // 发送按钮点击事件
    sendBtn.addEventListener('click', () => {
        if (!isSending && input.value.trim()) {
            sendUserMessage();
        }
    });
    
    // 话语提示点击事件
    if (suggestionsContainer) {
        suggestionsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.suggestion-btn');
            if (btn && !btn.disabled && !isSending) {
                const index = parseInt(btn.dataset.index);
                if (currentSuggestions[index]) {
                    input.value = currentSuggestions[index];
                    sendUserMessage();
                }
            }
        });
    }
}

// ===== 显示 Miri 页面 =====
function showMiriPage() {
    // 重要：style.css 中 .page 默认 display:none !important，必须加 .active 才会显示
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });

    const miriPage = document.getElementById('miri-page');
    if (!miriPage) return;

    miriPage.style.display = 'block';
    miriPage.classList.add('active');

    // 显示导航栏（Miri 属于底部导航体系）
    document.body.classList.add('show-nav');
    updateNavActive('miri');

    // 进入时初始化/渲染
    initMiriPage();

    // 输入框聚焦（镜像句生成/渲染后仍可点击输入继续）
    setTimeout(() => {
        const input = document.getElementById('miri-input');
        if (input) input.focus();
    }, 300);
}

// ===== 加载对话历史 =====
function loadChatHistory() {
    try {
        const stored = localStorage.getItem(MIRI_STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            // 检查是否是今日的对话
            if (data.date === getTodayDateString()) {
                currentChatHistory = data.messages || [];
            } else {
                // 不是今日的对话，清空
                currentChatHistory = [];
            }
        }
    } catch (error) {
        console.error('加载对话历史失败:', error);
        currentChatHistory = [];
    }
}

// ===== 保存对话历史 =====
function saveChatHistory() {
    try {
        // 限制最多20组对答
        // 计算组数（用户消息+Miri回复=1组）
        let groups = 0;
        let tempHistory = [...currentChatHistory];
        
        // 从后往前遍历，计算组数
        for (let i = tempHistory.length - 1; i >= 0; i--) {
            const msg = tempHistory[i];
            if (msg.role === 'miri' && i > 0 && tempHistory[i - 1].role === 'user') {
                groups++;
            }
        }
        
        // 如果超过20组，删除最旧的
        while (groups > MAX_CHAT_GROUPS && tempHistory.length > 0) {
            tempHistory.shift();
            // 重新计算组数
            groups = 0;
            for (let i = tempHistory.length - 1; i >= 0; i--) {
                const msg = tempHistory[i];
                if (msg.role === 'miri' && i > 0 && tempHistory[i - 1].role === 'user') {
                    groups++;
                }
            }
        }
        
        currentChatHistory = tempHistory;
        
        const data = {
            date: getTodayDateString(),
            messages: currentChatHistory
        };
        
        localStorage.setItem(MIRI_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('保存对话历史失败:', error);
    }
}

// ===== 渲染：每日镜像块 + 聊天历史 =====
function renderMiriChatView() {
    const chatArea = document.getElementById('miri-chat-area');
    if (!chatArea) return;
    
    // 清空聊天区
    chatArea.innerHTML = '';

    // 1) 先渲染“每日镜像句”（不计入聊天历史/不计入20组对答）
    renderDailyMirrorBlock(false);

    // 2) 再渲染聊天历史（仅用户<->Miri对答）
    currentChatHistory.forEach(message => {
        if (message.role === 'user') {
            appendUserMessage(message.content, false);
        } else if (message.role === 'miri') {
            appendMiriMessage(message.content, false);
        }
    });
    
    // 滚动到底部
    scrollToBottom();
}

// ===== 添加消息到历史 =====
function addMessageToHistory(role, content, mirrorOptions = null, selectedOption = null) {
    const message = {
        id: Date.now(),
        role: role,
        content: content,
        timestamp: new Date().toISOString()
    };
    
    currentChatHistory.push(message);
    saveChatHistory();
}

// ===== 镜像句相关 =====

// 检查今日是否已显示镜像句
function isMirrorQuestionShownToday() {
    const key = `${MIRI_MIRROR_SHOWN_KEY}_${getTodayDateString()}`;
    return localStorage.getItem(key) === 'true';
}

// 标记今日镜像句已显示
function markMirrorQuestionShown() {
    const key = `${MIRI_MIRROR_SHOWN_KEY}_${getTodayDateString()}`;
    localStorage.setItem(key, 'true');
}

function getDailyMirrorStorageKey() {
    return `${MIRI_DAILY_MIRROR_KEY_PREFIX}${getTodayDateString()}`;
}

function loadDailyMirrorState() {
    try {
        const raw = localStorage.getItem(getDailyMirrorStorageKey());
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveDailyMirrorState(state) {
    try {
        localStorage.setItem(getDailyMirrorStorageKey(), JSON.stringify(state));
    } catch (e) {
        // ignore
    }
}

function renderDailyMirrorBlock(shouldScroll = true) {
    const chatArea = document.getElementById('miri-chat-area');
    if (!chatArea) return;

    const state = loadDailyMirrorState();
    if (!state || !state.question || !Array.isArray(state.options)) return;

    // “一问”：Miri 问题（未选择时带选项按钮；已选择时用普通气泡展示）
    if (!state.selectedOption) {
        appendMirrorQuestionMessage(state.question, state.options, shouldScroll);
        return;
    }

    appendMiriMessage(state.question, false);
    // “一答”：用户选择
    appendUserMessage(state.selectedOption, false);
    // “一解析”：Miri 解读（如果已有）
    if (state.interpretation) {
        appendMiriMessage(state.interpretation, shouldScroll);
    }
}

// 检查并显示镜像句
async function checkAndShowMirrorQuestion() {
    // 目标：镜像句作为“聊天样式的一问、一答、一解析”展示，但不计入聊天历史

    // 1) 若本地已有今日镜像状态，直接渲染即可
    const existing = loadDailyMirrorState();
    if (existing && existing.question && Array.isArray(existing.options)) {
        renderMiriChatView();
        generateSuggestions().catch(() => {});
        return;
    }

    // 2) 读取“今日占卜”里预生成的镜像句
    const todayReading = getTodayReading();
    const preGenerated = todayReading?.reading?.mirrorQuestion;
    if (preGenerated?.question && Array.isArray(preGenerated.options)) {
        saveDailyMirrorState({
            question: preGenerated.question,
            options: preGenerated.options,
            selectedOption: null,
            interpretation: null
        });
        markMirrorQuestionShown();
        renderMiriChatView();
        generateSuggestions().catch(() => {});
        return;
    }

    // 3) 兼容旧数据：如果没有预生成，则进入时临时生成（仍不计入聊天历史）
    showMiriLoading();
    try {
        const mirrorData = await generateMirrorQuestion();
        hideMiriLoading();
        if (mirrorData?.question && Array.isArray(mirrorData.options)) {
            saveDailyMirrorState({
                question: mirrorData.question,
                options: mirrorData.options,
                selectedOption: null,
                interpretation: null
            });
            markMirrorQuestionShown();
            renderMiriChatView();
        }
    } catch (e) {
        hideMiriLoading();
    } finally {
        generateSuggestions().catch(() => {});
    }
}

// 添加镜像句消息
function appendMirrorQuestionMessage(question, options, shouldScroll = true) {
    const chatArea = document.getElementById('miri-chat-area');
    if (!chatArea) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'miri-message miri mirror-question';
    
    messageDiv.innerHTML = `
        <div class="miri-avatar">☁️</div>
        <div class="miri-message-content">
            <div class="mirror-question-text">${escapeHtml(question)}</div>
            <div class="mirror-options">
                ${options.map((option, index) => `
                    <button class="mirror-option-btn" data-option-index="${index}">
                        ${escapeHtml(option)}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    chatArea.appendChild(messageDiv);
    
    if (shouldScroll) {
        scrollToBottom();
    }
    
    // 绑定选项点击事件
    const optionBtns = messageDiv.querySelectorAll('.mirror-option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const optionIndex = parseInt(btn.dataset.optionIndex);
            const selectedOption = options[optionIndex];
            
            // 禁用所有选项按钮
            optionBtns.forEach(b => b.disabled = true);
            
            // 标记镜像句已显示（但不写入聊天历史）
            markMirrorQuestionShown();

            // “一答”：显示用户选择（不写入聊天历史）
            appendUserMessage(selectedOption);

            // 更新镜像状态（独立存储，不计入20组）
            const state = loadDailyMirrorState() || { question, options };
            state.question = question;
            state.options = options;
            state.selectedOption = selectedOption;
            saveDailyMirrorState(state);

            // “一解析”：生成并展示解读（不写入聊天历史）
            try {
                const interpretation = await generateMirrorInterpretation(question, options, selectedOption);
                const next = loadDailyMirrorState() || state;
                next.selectedOption = selectedOption;
                next.interpretation = interpretation;
                saveDailyMirrorState(next);
            } catch (e) {
                // ignore
            } finally {
                generateSuggestions().catch(() => {});
                const input = document.getElementById('miri-input');
                if (input) input.focus();
            }
        });
    });
}

// ===== 消息渲染 =====

// 添加用户消息
function appendUserMessage(content, shouldScroll = true) {
    const chatArea = document.getElementById('miri-chat-area');
    if (!chatArea) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'miri-message user';
    
    messageDiv.innerHTML = `
        <div class="miri-message-content">
            ${escapeHtml(content)}
        </div>
    `;
    
    chatArea.appendChild(messageDiv);
    
    if (shouldScroll) {
        scrollToBottom();
    }
}

// 添加 Miri 消息
function appendMiriMessage(content, shouldScroll = true) {
    const chatArea = document.getElementById('miri-chat-area');
    if (!chatArea) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'miri-message miri';
    
    messageDiv.innerHTML = `
        <div class="miri-avatar">☁️</div>
        <div class="miri-message-content">
            ${escapeHtml(content)}
        </div>
    `;
    
    chatArea.appendChild(messageDiv);
    
    if (shouldScroll) {
        scrollToBottom();
    }
    
    return messageDiv;
}

// 显示 Miri 加载状态
function showMiriLoading() {
    const chatArea = document.getElementById('miri-chat-area');
    if (!chatArea) return;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'miri-message miri';
    loadingDiv.id = 'miri-loading-indicator';
    
    loadingDiv.innerHTML = `
        <div class="miri-avatar">☁️</div>
        <div class="miri-message-content">
            <div class="miri-loading">
                <div class="miri-loading-dot"></div>
                <div class="miri-loading-dot"></div>
                <div class="miri-loading-dot"></div>
            </div>
        </div>
    `;
    
    chatArea.appendChild(loadingDiv);
    scrollToBottom();
}

// 隐藏 Miri 加载状态
function hideMiriLoading() {
    const loading = document.getElementById('miri-loading-indicator');
    if (loading) {
        loading.remove();
    }
}

// ===== 发送用户消息 =====
async function sendUserMessage() {
    const input = document.getElementById('miri-input');
    const sendBtn = document.getElementById('miri-send-btn');
    
    if (!input || isSending) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    // 设置发送状态
    isSending = true;
    sendBtn.disabled = true;
    input.value = '';
    
    // 显示用户消息
    appendUserMessage(message);
    addMessageToHistory('user', message);
    
    // 显示加载状态
    showMiriLoading();
    
    try {
        // 生成 Miri 回复
        await generateMiriResponseStreaming(message);
        
        // 生成话语提示（异步，不等待）
        generateSuggestions().catch(err => console.error('生成话语提示失败:', err));
        
    } catch (error) {
        console.error('生成回复失败:', error);
        hideMiriLoading();
        
        // 显示错误消息并重试
        await handleMiriError(message);
    } finally {
        // 重置发送状态
        isSending = false;
        sendBtn.disabled = false;
        
        // 聚焦输入框
        input.focus();
    }
}

// 处理错误
async function handleMiriError(originalMessage) {
    // 检查是否是网络错误
    if (!navigator.onLine) {
        appendMiriMessage('网络断开，请检查网络连接');
        return;
    }
    
    // 显示错误消息
    const errorMsg = '你的话让我有些混乱，让我想一想……';
    appendMiriMessage(errorMsg);
    
    // 等待2秒后自动重试
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 显示加载状态
    showMiriLoading();
    
    try {
        // 重试生成回复
        await generateMiriResponseStreaming(originalMessage);
    } catch (retryError) {
        console.error('重试失败:', retryError);
        hideMiriLoading();
        appendMiriMessage('抱歉，我现在有些困惑，稍后再试试吧');
    }
}

// ===== 滚动到底部 =====
function scrollToBottom() {
    const chatArea = document.getElementById('miri-chat-area');
    if (chatArea) {
        setTimeout(() => {
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 100);
    }
}

// ===== 更新话语提示 =====
function updateSuggestions(suggestions) {
    if (!suggestions || suggestions.length !== 3) return;
    
    currentSuggestions = suggestions;
    
    const buttons = document.querySelectorAll('#miri-suggestions .suggestion-btn');
    buttons.forEach((btn, index) => {
        if (suggestions[index]) {
            btn.textContent = suggestions[index];
            btn.disabled = false;
        }
    });
}

// ===== 工具函数 =====

// 获取今日日期字符串
function getTodayDateString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// HTML 转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 更新导航栏激活状态
function updateNavActive(navType) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.nav === navType);
    });
}

console.log('miri-chat.js 已加载');
