// 星座星盘分析功能

console.log('zodiac-horoscope.js: 脚本已加载');

// 更新星座图标显示
function updateZodiacIcon() {
    const zodiacIcon = document.getElementById('zodiac-icon');
    if (!zodiacIcon) return;
    
    const userProfile = getUserProfile();
    if (userProfile && userProfile.birthday) {
        // 有生日，计算星座并显示对应图标
        const zodiac = getZodiacFromDate(userProfile.birthday);
        if (zodiac && zodiac.emoji) {
            zodiacIcon.textContent = zodiac.emoji;
        } else {
            zodiacIcon.textContent = '✨';
        }
    } else {
        // 没有生日，显示默认图标
        zodiacIcon.textContent = '✨';
    }
}

// 检查每日星座所需信息
function checkZodiacInfo() {
    const userProfile = getUserProfile();
    return userProfile && userProfile.birthday;
}

// 检查星盘分析所需信息（必须三项齐全）
function checkHoroscopeInfo() {
    const userProfile = getUserProfile();
    console.log('检查星盘信息 - 完整用户信息:', JSON.stringify(userProfile, null, 2));
    
    if (!userProfile) {
        console.log('没有用户信息');
        return false;
    }
    
    // 检查所有字段（包括可能的字段名变体）
    const birthday = userProfile.birthday;
    const birthTime = userProfile.birthTime || userProfile.birthtime; // 兼容不同字段名
    const birthPlace = userProfile.birthPlace || userProfile.birthplace; // 兼容不同字段名
    
    console.log('检查星盘信息 - 字段值:', {
        birthday,
        birthTime,
        birthPlace,
        birthTimeType: typeof birthTime,
        birthPlaceType: typeof birthPlace
    });
    
    const hasBirthday = birthday && String(birthday).trim() !== '';
    const hasBirthTime = birthTime !== undefined && 
                         birthTime !== null && 
                         String(birthTime).trim() !== '';
    const hasBirthplace = birthPlace !== undefined &&
                         birthPlace !== null &&
                         String(birthPlace).trim() !== '';
    
    console.log('信息检查结果:', {
        hasBirthday,
        hasBirthTime,
        hasBirthplace,
        allComplete: hasBirthday && hasBirthTime && hasBirthplace
    });
    
    return hasBirthday && hasBirthTime && hasBirthplace;
}

// 获取今日日期键（用于缓存）
function getTodayDateKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// 获取缓存
function getCachedAnalysis(type) {
    const dateKey = getTodayDateKey();
    const cacheKey = `${type}_analysis_${dateKey}`;
    try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
    } catch (e) {
        console.error('Error reading cache:', e);
    }
    return null;
}

// 保存缓存
function saveCachedAnalysis(type, content) {
    const dateKey = getTodayDateKey();
    const cacheKey = `${type}_analysis_${dateKey}`;
    try {
        localStorage.setItem(cacheKey, JSON.stringify({
            date: dateKey,
            content: content,
            timestamp: new Date().toISOString()
        }));
    } catch (e) {
        console.error('Error saving cache:', e);
    }
}

// 显示加载状态
function showAnalysisLoading(container) {
    container.innerHTML = '<div class="zodiac-horoscope-loading">正在为你生成专属指引...</div>';
    container.style.display = 'block';
}

// 显示分析结果
function showAnalysisResult(container, content) {
    console.log('showAnalysisResult 被调用，内容长度:', content.length);
    container.innerHTML = `<div class="zodiac-horoscope-result">${content}</div>`;
    container.style.display = 'block';
    console.log('结果已显示，容器 display:', container.style.display);
    
    // 确保父容器也是可见的
    const parentContainer = document.getElementById('zodiac-horoscope-content');
    if (parentContainer) {
        parentContainer.style.display = 'block';
        console.log('父容器已设置为可见');
    }
}

// 隐藏分析结果
function hideAnalysisResult(container) {
    container.style.display = 'none';
}

// 生成每日星座分析
async function generateZodiacAnalysis() {
    const userProfile = getUserProfile();
    if (!userProfile || !userProfile.birthday) {
        throw new Error('缺少生日信息');
    }
    
    // 获取今日占卜数据
    const todayReading = getTodayReading();
    if (!todayReading) {
        throw new Error('请先完成今日占卜');
    }
    
    const tarotCard = todayReading.card;
    const moonPhase = todayReading.moonPhase;
    const userEmotion = todayReading.emotion || '平静';
    const nickname = userProfile.nickname || '朋友';
    
    // 计算星座
    const zodiac = getZodiacFromDate(userProfile.birthday);
    
    // 构建Prompt
    const prompt = `请基于以下信息，生成今日星座指引：

【用户信息】
- 昵称：${nickname}
- 星座：${zodiac.nameCn} ${zodiac.emoji}

【今日能量】
- 塔罗牌：${tarotCard.nameCn} - ${tarotCard.name}
- 月相：${moonPhase.nameCn} ${moonPhase.emoji} - ${moonPhase.energy || '月相能量'}
- 情绪状态：${userEmotion}

【要求】
1. 解读${zodiac.nameCn}今日的能量和特质
2. 结合今日塔罗牌和月相能量，给出个性化指引
3. 以疗愈为目的，生成温暖、治愈、正向情绪指引
4. 文字中自然融入用户昵称，如"亲爱的${nickname}"或"${nickname}，今天..."
5. **字数严格控制在200-250字之间**（必须在此范围内）
6. 语调温柔、亲切、充满关怀
7. 避免负面暗示，强调成长和可能性
8. 不要提及"逆位/正位"等牌面方向相关词汇
9. 不要描述抽牌过程

请生成今日星座指引（200-250字）：`;

    try {
        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API请求失败: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // 移除可能的markdown代码块标记
        if (content.startsWith('```')) {
            content = content.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
        }
        
        // 尝试解析 JSON 格式（如果返回的是 JSON）
        try {
            const jsonContent = JSON.parse(content);
            // 如果解析成功，提取各种可能的文本字段
            if (jsonContent.analysis) {
                content = jsonContent.analysis;
            } else if (jsonContent.guidance) {
                content = jsonContent.guidance;
            } else if (jsonContent.content) {
                content = jsonContent.content;
            } else if (jsonContent.text) {
                content = jsonContent.text;
            }
        } catch (e) {
            // 不是 JSON 格式，直接使用原始内容
        }
        
        return content;
    } catch (error) {
        console.error('生成星座分析失败:', error);
        throw error;
    }
}

// 生成星盘分析
async function generateHoroscopeAnalysis() {
    const userProfile = getUserProfile();
    console.log('generateHoroscopeAnalysis - 用户信息:', JSON.stringify(userProfile, null, 2));
    
    // 兼容不同的字段名（birthPlace 和 birthplace）
    const birthTime = userProfile?.birthTime || userProfile?.birthtime;
    const birthPlace = userProfile?.birthPlace || userProfile?.birthplace;
    
    console.log('generateHoroscopeAnalysis - 字段检查:', {
        hasProfile: !!userProfile,
        birthday: userProfile?.birthday,
        birthTime: birthTime,
        birthPlace: birthPlace,
        birthdayValid: !!(userProfile?.birthday && String(userProfile.birthday).trim() !== ''),
        birthTimeValid: !!(birthTime !== undefined && birthTime !== null && String(birthTime).trim() !== ''),
        birthPlaceValid: !!(birthPlace !== undefined && birthPlace !== null && String(birthPlace).trim() !== '')
    });
    
    if (!userProfile || !userProfile.birthday || !birthTime || !birthPlace) {
        throw new Error('缺少星盘信息（需要生日、出生时间、出生地点）');
    }
    
    // 获取今日占卜数据
    const todayReading = getTodayReading();
    if (!todayReading) {
        throw new Error('请先完成今日占卜');
    }
    
    const tarotCard = todayReading.card;
    const moonPhase = todayReading.moonPhase;
    const userEmotion = todayReading.emotion || '平静';
    const nickname = userProfile.nickname || '朋友';
    
    // 计算星座
    const zodiac = getZodiacFromDate(userProfile.birthday);
    
    // 构建Prompt（birthTime 和 birthPlace 已在函数开头声明）
    const prompt = `请基于以下信息，生成今日星盘分析：

【用户信息】
- 昵称：${nickname}
- 出生日期：${userProfile.birthday}
- 出生时间：${birthTime}时
- 出生地点：${birthPlace}
- 星座：${zodiac.nameCn} ${zodiac.emoji}

【今日能量】
- 塔罗牌：${tarotCard.nameCn} - ${tarotCard.name}
- 月相：${moonPhase.nameCn} ${moonPhase.emoji} - ${moonPhase.energy || '月相能量'}
- 情绪状态：${userEmotion}

【要求】
1. 基于用户星盘信息（出生日期、时间、地点），解读今日的星象能量
2. 结合今日塔罗牌和月相能量，给出深度个性化指引
3. 以疗愈为目的，生成温暖、治愈、正向情绪指引
4. 文字中自然融入用户昵称，如"亲爱的${nickname}"或"${nickname}，今天..."
5. **字数严格控制在300-400字之间**（必须在此范围内）
6. 语调温柔、亲切、充满关怀
7. 避免负面暗示，强调成长和可能性
8. 不要提及"逆位/正位"等牌面方向相关词汇
9. 不要描述抽牌过程
10. 可以提及星盘中的关键相位或行星位置，但要保持温暖治愈的语调

请生成今日星盘分析（300-400字）：`;

    try {
        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    {
                        role: 'system',
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1500
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API请求失败: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // 移除可能的markdown代码块标记
        if (content.startsWith('```')) {
            content = content.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
        }
        
        // 尝试解析 JSON 格式（如果返回的是 JSON）
        try {
            const jsonContent = JSON.parse(content);
            // 如果解析成功，提取各种可能的文本字段
            if (jsonContent.analysis) {
                content = jsonContent.analysis;
            } else if (jsonContent.guidance) {
                content = jsonContent.guidance;
            } else if (jsonContent.content) {
                content = jsonContent.content;
            } else if (jsonContent.text) {
                content = jsonContent.text;
            }
        } catch (e) {
            // 不是 JSON 格式，直接使用原始内容
        }
        
        return content;
    } catch (error) {
        console.error('生成星盘分析失败:', error);
        throw error;
    }
}

// 处理每日星座按钮点击
async function handleZodiacAnalysisClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log('每日星座按钮被点击');
    
    // 检查信息完整性
    if (!checkZodiacInfo()) {
        console.log('信息不完整，跳转到个人界面');
        // 信息不完整，跳转到个人界面
        if (typeof showProfilePage === 'function') {
            showProfilePage();
        } else {
            console.error('showProfilePage 函数不存在');
            alert('请先补充个人信息（需要填写生日）');
        }
        return;
    }
    
    // 获取结果容器
    const resultContainer = document.getElementById('zodiac-horoscope-content');
    const resultDiv = document.getElementById('zodiac-horoscope-result');
    
    console.log('结果容器检查:', { 
        resultContainer: !!resultContainer, 
        resultDiv: !!resultDiv 
    });
    
    if (!resultContainer || !resultDiv) {
        console.error('结果容器不存在');
        alert('无法显示分析结果，请刷新页面重试');
        return;
    }
    
    // 检查缓存
    const cached = getCachedAnalysis('zodiac');
    if (cached && cached.content) {
        console.log('使用缓存内容，内容长度:', cached.content.length);
        let cachedContent = cached.content;
        
        // 如果缓存的内容是 JSON 格式，尝试解析
        try {
            const jsonContent = JSON.parse(cachedContent);
            if (jsonContent.analysis) {
                cachedContent = jsonContent.analysis;
            } else if (jsonContent.guidance) {
                cachedContent = jsonContent.guidance;
            } else if (jsonContent.content) {
                cachedContent = jsonContent.content;
            } else if (jsonContent.text) {
                cachedContent = jsonContent.text;
            }
        } catch (e) {
            // 不是 JSON 格式，直接使用
        }
        
        console.log('显示结果容器');
        resultContainer.style.display = 'block'; // 确保容器可见
        showAnalysisResult(resultDiv, cachedContent);
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }
    
    // 检查是否已完成今日占卜
    const todayReading = getTodayReading();
    if (!todayReading) {
        console.error('未完成今日占卜');
        resultDiv.innerHTML = `<div class="zodiac-horoscope-result" style="color: var(--text-secondary);">请先完成今日占卜</div>`;
        resultContainer.style.display = 'block';
        return;
    }
    
    // 显示加载状态
    showAnalysisLoading(resultDiv);
    
    try {
        console.log('开始生成星座分析...');
        // 生成分析
        const content = await generateZodiacAnalysis();
        console.log('星座分析生成成功，长度:', content.length);
        
        // 保存缓存
        saveCachedAnalysis('zodiac', content);
        
        // 显示结果
        showAnalysisResult(resultDiv, content);
    } catch (error) {
        console.error('生成星座分析失败:', error);
        const errorMsg = error.message || '生成失败，请稍后重试';
        resultDiv.innerHTML = `<div class="zodiac-horoscope-result" style="color: var(--text-secondary);">${errorMsg}</div>`;
        resultContainer.style.display = 'block';
    }
}

// 处理星盘分析按钮点击
async function handleHoroscopeAnalysisClick(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    console.log('星盘分析按钮被点击');
    
    // 检查信息完整性
    if (!checkHoroscopeInfo()) {
        console.log('信息不完整，跳转到个人界面');
        // 信息不完整，跳转到个人界面
        if (typeof showProfilePage === 'function') {
            showProfilePage();
        } else {
            console.error('showProfilePage 函数不存在');
            alert('请先补充个人信息（需要填写生日、出生时间、出生地点）');
        }
        return;
    }
    
    // 获取结果容器
    const resultContainer = document.getElementById('zodiac-horoscope-content');
    const resultDiv = document.getElementById('zodiac-horoscope-result');
    
    console.log('结果容器检查:', { 
        resultContainer: !!resultContainer, 
        resultDiv: !!resultDiv 
    });
    
    if (!resultContainer || !resultDiv) {
        console.error('结果容器不存在');
        alert('无法显示分析结果，请刷新页面重试');
        return;
    }
    
    // 检查缓存
    const cached = getCachedAnalysis('horoscope');
    if (cached && cached.content) {
        console.log('使用缓存内容，内容长度:', cached.content.length);
        let cachedContent = cached.content;
        
        // 如果缓存的内容是 JSON 格式，尝试解析
        try {
            const jsonContent = JSON.parse(cachedContent);
            if (jsonContent.analysis) {
                cachedContent = jsonContent.analysis;
            } else if (jsonContent.guidance) {
                cachedContent = jsonContent.guidance;
            } else if (jsonContent.content) {
                cachedContent = jsonContent.content;
            } else if (jsonContent.text) {
                cachedContent = jsonContent.text;
            }
        } catch (e) {
            // 不是 JSON 格式，直接使用
        }
        
        console.log('显示结果容器');
        resultContainer.style.display = 'block'; // 确保容器可见
        showAnalysisResult(resultDiv, cachedContent);
        // 滚动到结果区域
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
    }
    
    // 检查是否已完成今日占卜
    const todayReading = getTodayReading();
    if (!todayReading) {
        console.error('未完成今日占卜');
        resultDiv.innerHTML = `<div class="zodiac-horoscope-result" style="color: var(--text-secondary);">请先完成今日占卜</div>`;
        resultContainer.style.display = 'block';
        return;
    }
    
    // 显示加载状态
    showAnalysisLoading(resultDiv);
    
    try {
        console.log('开始生成星盘分析...');
        // 生成分析
        const content = await generateHoroscopeAnalysis();
        console.log('星盘分析生成成功，长度:', content.length);
        
        // 保存缓存
        saveCachedAnalysis('horoscope', content);
        
        // 显示结果
        showAnalysisResult(resultDiv, content);
    } catch (error) {
        console.error('生成星盘分析失败:', error);
        const errorMsg = error.message || '生成失败，请稍后重试';
        resultDiv.innerHTML = `<div class="zodiac-horoscope-result" style="color: var(--text-secondary);">${errorMsg}</div>`;
        resultContainer.style.display = 'block';
    }
}

// 绑定按钮事件（使用事件委托，更可靠）
let zodiacHoroscopeButtonsBound = false;

// 全局事件委托处理器（只绑定一次）
let zodiacHoroscopeHandlerBound = false;

function bindZodiacHoroscopeButtons() {
    console.log('zodiac-horoscope.js: bindZodiacHoroscopeButtons 函数被调用');
    
    // 使用事件委托，绑定到文档上，更可靠（只绑定一次）
    if (!zodiacHoroscopeHandlerBound) {
        document.addEventListener('click', function zodiacHoroscopeClickHandler(e) {
            // 检查是否点击了按钮或其子元素
            const zodiacBtn = e.target.closest('#zodiac-analysis-btn');
            const horoscopeBtn = e.target.closest('#horoscope-analysis-btn');
            
            if (zodiacBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('每日星座按钮点击事件触发（事件委托）');
                handleZodiacAnalysisClick();
                return;
            }
            
            if (horoscopeBtn) {
                e.preventDefault();
                e.stopPropagation();
                console.log('星盘分析按钮点击事件触发（事件委托）');
                handleHoroscopeAnalysisClick();
                return;
            }
        }, true); // 使用捕获阶段，确保能捕获到事件
        
        zodiacHoroscopeHandlerBound = true;
        console.log('事件委托已绑定');
    }
    
    // 也尝试直接绑定（双重保险）
    const buttonsContainer = document.querySelector('.zodiac-horoscope-buttons');
    const zodiacBtn = document.getElementById('zodiac-analysis-btn');
    const horoscopeBtn = document.getElementById('horoscope-analysis-btn');
    
    console.log('按钮元素检查:', { 
        container: !!buttonsContainer, 
        zodiacBtn: !!zodiacBtn, 
        horoscopeBtn: !!horoscopeBtn,
        zodiacBtnId: zodiacBtn?.id,
        horoscopeBtnId: horoscopeBtn?.id
    });
    
    if (zodiacBtn) {
        // 移除旧的事件监听器（如果存在）
        const newZodiacBtn = zodiacBtn.cloneNode(true);
        zodiacBtn.parentNode.replaceChild(newZodiacBtn, zodiacBtn);
        const finalZodiacBtn = document.getElementById('zodiac-analysis-btn');
        
        if (finalZodiacBtn) {
            finalZodiacBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('每日星座按钮点击事件触发（直接绑定）');
                handleZodiacAnalysisClick();
            }, true);
            console.log('每日星座按钮直接绑定成功');
        }
    }
    
    if (horoscopeBtn) {
        // 移除旧的事件监听器（如果存在）
        const newHoroscopeBtn = horoscopeBtn.cloneNode(true);
        horoscopeBtn.parentNode.replaceChild(newHoroscopeBtn, horoscopeBtn);
        const finalHoroscopeBtn = document.getElementById('horoscope-analysis-btn');
        
        if (finalHoroscopeBtn) {
            finalHoroscopeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('星盘分析按钮点击事件触发（直接绑定）');
                handleHoroscopeAnalysisClick();
            }, true);
            console.log('星盘分析按钮直接绑定成功');
        }
    }
    
    // 更新星座图标
    updateZodiacIcon();
    
    console.log('星座星盘按钮绑定完成');
}

