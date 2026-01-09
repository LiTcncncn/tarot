// 主逻辑入口

// 初始化应用
function initApp() {
    // 初始化 UI
    initEmotionSlider();
    
    // 检查今日是否已完成占卜
    if (hasTodayReading()) {
        // 已完成，显示主界面
        showMainPage();
        loadTodayData();
    } else {
        // 未完成，显示每日占卜页面
        showDailyReadingPage();
    }
    
    // 绑定事件
    bindEvents();
}

// 绑定事件
function bindEvents() {
    // 开始今日占卜按钮
    document.getElementById('start-daily-btn').addEventListener('click', () => {
        showDailyReadingPage();
    });
    
    // 重置按钮（清除今日数据并重新开始）
    document.getElementById('reset-btn').addEventListener('click', () => {
        // 清除今日占卜数据
        const todayKey = getTodayKey();
        const readings = getAllReadings();
        delete readings[todayKey];
        localStorage.setItem('tarot_mirror_daily_readings', JSON.stringify(readings));
        
        // 清除所有相关状态
        window.drawnCard = null;
        window.selectedEmotion = null;
        if (window.cardDrawState) {
            window.cardDrawState.isDrawing = false;
        }
        
        // 重置到每日占卜页面
        showDailyReadingPage();
        
        // 重新初始化抽牌功能（确保可以重新抽牌）
        initCardDraw(getCardDrawCallback());
    });
    
    // 底部导航栏点击事件
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const navType = item.dataset.nav;
            
            switch (navType) {
                case 'calendar':
                    showCalendarPage();
                    break;
                case 'today':
                    showMainPage();
                    updateNavActive('today');
                    document.body.classList.add('show-nav');
                    break;
                case 'tarot':
                    showTarotPage();
                    updateNavActive('tarot');
                    document.body.classList.add('show-nav');
                    break;
                case 'healing':
                    // TODO: 实现疗愈页面
                    console.log('疗愈页面待实现');
                    break;
                case 'profile':
                    // TODO: 实现个人页面
                    console.log('个人页面待实现');
                    break;
            }
        });
    });
    
    // 初始化日历页面
    initCalendarPage();
    
    // 抽牌回调函数
    function getCardDrawCallback() {
        return async (card) => {
        // 获取当前选择的情绪
        const emotionValue = parseInt(document.getElementById('emotion-input').value);
        const selectedEmotion = EMOTION_MAP[emotionValue].value;
        window.selectedEmotion = selectedEmotion;
        
            // 保存抽到的牌，用于Loading界面显示
            window.drawnCard = card;
            
            // 延迟一下，让用户看到抽到的牌0.8秒
        setTimeout(() => {
            // 切换到页面2: Loading 界面
            showLoadingPage();
            
            // 在Loading界面显示抽到的牌
            if (window.drawnCard) {
                const loadingCardImg = document.getElementById('loading-card-img');
                const loadingCardName = document.getElementById('loading-card-name');
                
                if (loadingCardImg && loadingCardName) {
                    // 设置图片源
                    loadingCardImg.src = `Cards-png/${window.drawnCard.file}`;
                    
                    // 统一显示为正位，不旋转图片
                    loadingCardImg.style.transform = 'rotate(0deg)';
                    
                    // 图片加载完成后再次确认不旋转（防止图片加载时重置样式）
                    loadingCardImg.onload = () => {
                        loadingCardImg.style.transform = 'rotate(0deg)';
                    };
                    
                    // 设置卡片名称（不显示"正位"文字）
                    loadingCardName.textContent = `${window.drawnCard.nameCn}`;
                    
                    // 显示卡片容器
                    const loadingCardContainer = document.getElementById('loading-card-container');
                    if (loadingCardContainer) {
                        loadingCardContainer.style.display = 'flex';
                    }
                }
            }
        }, 800); // 让用户看到抽到的牌0.8秒
        
        try {
            // 获取月相
            const moonPhase = getTodayMoonPhase();
            
            // 调用 API 生成占卜内容
            const readingData = await generateTarotReading(
                selectedEmotion,
                card,
                moonPhase
            );
            
            // 保存数据（包含实际正逆位和强度等级）
            const fullData = {
                emotion: selectedEmotion,
                card: {
                    id: card.id,
                    name: card.name,
                    nameCn: card.nameCn,
                    file: card.file,
                    actualReversed: card.actualReversed !== undefined ? card.actualReversed : false,  // 实际正逆位（用于解读）
                    intensity: card.intensity || getCardIntensity(card.name)  // 强度等级
                },
                moonPhase: moonPhase,
                reading: readingData,
                taskCompleted: false
            };
            
            saveTodayReading(fullData);
            
            // 延迟一下，让用户看到加载动画，然后切换到主界面
            setTimeout(() => {
                showMainPage();
                renderMainPage(readingData, card, moonPhase);
                initCategoryButtons(readingData);
            }, 1000);
            
        } catch (error) {
            console.error('Error generating reading:', error);
            // 出错时回到每日占卜页面
            showDailyReadingPage();
            alert('生成占卜内容时出错，请稍后重试。\n错误: ' + error.message);
        }
        };
    }
    
    // 初始化抽牌
    initCardDraw(getCardDrawCallback());
    
    // 完成任务按钮
    document.getElementById('complete-task-btn').addEventListener('click', () => {
        completeTask();
    });
}

// 加载今日数据
function loadTodayData() {
    const todayReading = getTodayReading();
    
    if (todayReading) {
        const moonPhase = todayReading.moonPhase;
        const card = todayReading.card;
        const reading = todayReading.reading;
        const emotion = todayReading.emotion;
        
        // 根据保存的情绪状态更新背景色
        if (emotion && typeof updateBackgroundColor === 'function') {
            updateBackgroundColor(emotion);
        }
        
        renderMainPage(reading, card, moonPhase);
        initCategoryButtons(reading);
    } else {
        // 没有今日数据，显示开始占卜按钮
        document.getElementById('start-daily-btn').style.display = 'flex';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

