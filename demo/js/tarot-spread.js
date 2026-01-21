// 牌阵逻辑：抽牌、布局、状态管理

// 牌阵配置
const SPREAD_CONFIG = {
    '3张': {
        name: '三张牌阵（时间流）',
        positions: [
            { id: 'position_1', name: '过去', description: '这个问题的起因和过往情况' },
            { id: 'position_2', name: '现状', description: '当前的状态和能量' },
            { id: 'position_3', name: '未来', description: '可能的发展趋势和结果' }
        ]
    },
    '4张': {
        name: '四张牌阵（决策流）',
        positions: [
            { id: 'position_1', name: '现状', description: '当前的情况' },
            { id: 'position_2', name: '阻碍', description: '面临的困难和挑战' },
            { id: 'position_3', name: '建议', description: '可以采取的行动方向' },
            { id: 'position_4', name: '趋势', description: '未来的发展方向' }
        ]
    },
    '6张': {
        name: '六张牌阵（关系流）',
        positions: [
            { id: 'position_1', name: '我怎么看这段关系', description: '我对这段关系的看法和感受' },
            { id: 'position_2', name: '对方怎么看', description: '对方对这段关系的态度和想法' },
            { id: 'position_3', name: '我真正需要的', description: '我在这段关系中的真实需求' },
            { id: 'position_4', name: '对方真正需要的', description: '对方在关系中的真实需求' },
            { id: 'position_5', name: '关系的课题：你们卡在哪', description: '关系中的核心问题和障碍' },
            { id: 'position_6', name: '建议走法：更舒服的相处方式', description: '改善关系的具体建议' }
        ]
    }
};

// 牌阵状态管理
let currentSpreadType = '3张';
let drawnCards = []; // [{position, card}, ...]
let drawnCardIds = []; // 已抽牌ID列表（用于不重复抽牌）

// 初始化牌阵
function initSpread(spreadType) {
    currentSpreadType = spreadType;
    drawnCards = [];
    drawnCardIds = [];
}

// 获取当前牌阵配置
function getCurrentSpreadConfig() {
    return SPREAD_CONFIG[currentSpreadType];
}

// 获取当前牌阵类型
function getCurrentSpreadType() {
    return currentSpreadType;
}

// 为指定位置抽牌（不重复）
function drawCardForPosition(position) {
    // 获取所有牌（合并大阿卡纳和小阿卡纳）
    let allCards = [];
    
    // 如果getAllTarotCards函数存在，使用它
    if (typeof getAllTarotCards === 'function') {
        allCards = getAllTarotCards();
    } else {
        // 否则手动合并
        allCards = [...TAROT_CARDS.major];
        if (TAROT_CARDS.minor) {
            Object.values(TAROT_CARDS.minor).forEach(suit => {
                if (Array.isArray(suit)) {
                    allCards.push(...suit);
                }
            });
        }
    }
    
    if (allCards.length === 0) {
        console.error('No cards available in deck');
        return null;
    }
    
    // 过滤掉已抽的牌
    const availableCards = allCards.filter(card => !drawnCardIds.includes(card.id));
    
    if (availableCards.length === 0) {
        console.warn('No available cards to draw');
        return null;
    }
    
    // 随机抽取
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];
    
    // 随机正逆位
    const reversed = Math.random() < 0.5;
    
    // 添加到已抽列表
    drawnCardIds.push(selectedCard.id);
    
    // 创建牌数据
    const cardData = {
        position: position,
        card: {
            id: selectedCard.id,
            name: selectedCard.name,
            nameCn: selectedCard.nameCn,
            file: selectedCard.file,
            reversed: reversed
        }
    };
    
    drawnCards.push(cardData);
    return cardData;
}

// 获取已抽取的牌
function getDrawnCards() {
    return drawnCards;
}

// 检查是否所有位置都已抽牌
function isAllCardsDrawn() {
    const config = getCurrentSpreadConfig();
    return drawnCards.length === config.positions.length;
}

// 获取指定位置的牌
function getCardByPosition(positionId) {
    return drawnCards.find(item => item.position.id === positionId);
}

// 重置牌阵（切换牌阵时调用）
function resetSpread() {
    drawnCards = [];
    drawnCardIds = [];
}

// 获取下一个空位置
function getNextEmptyPosition() {
    const config = getCurrentSpreadConfig();
    if (!config) return null;
    
    for (const position of config.positions) {
        const hasCard = drawnCards.some(cardData => cardData.position.id === position.id);
        if (!hasCard) {
            return position;
        }
    }
    
    return null;
}

// 渲染牌阵
function renderSpread() {
    const container = document.getElementById('tarot-spread-container');
    if (!container) return;
    
    const config = getCurrentSpreadConfig();
    if (!config) return;
    
    // 更新容器类名
    container.className = `tarot-spread-container spread-grid-${config.positions.length === 3 ? '3' : config.positions.length === 4 ? '4' : '6'}`;
    
    container.innerHTML = '';
    
    config.positions.forEach(position => {
        const slot = document.createElement('div');
        slot.className = 'tarot-card-slot';
        slot.dataset.positionId = position.id;
        
        const cardData = drawnCards.find(c => c.position.id === position.id);
        
        if (cardData) {
            slot.classList.add('has-card');
            const card = cardData.card;
            
            slot.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="Cards-png/${card.file}" alt="${card.nameCn}" class="card-image ${card.reversed ? 'reversed' : ''}">
                </div>
                <div class="card-name-orientation">
                    <div class="card-name">${card.nameCn}</div>
                    <div class="card-orientation">${card.reversed ? '逆位' : '正位'}</div>
                </div>
            `;
        } else {
            slot.innerHTML = `
                <div class="empty-card-placeholder">
                    <div class="placeholder-text">${position.name}<br>点击牌堆抽取</div>
                </div>
            `;
        }
        
        container.appendChild(slot);
    });
}

// 播放卡片翻转动画
function animateCardFlip(position, cardData) {
    const container = document.getElementById('tarot-spread-container');
    if (!container) return;
    
    const slot = container.querySelector(`[data-position-id="${position.id}"]`);
    if (!slot) return;
    
    // 简单的翻转动画
    slot.style.opacity = '0';
    slot.style.transform = 'rotateY(90deg)';
    slot.style.transition = 'all 0.3s';
    
    setTimeout(() => {
        slot.classList.add('has-card');
        const card = cardData.card;
        
        slot.innerHTML = `
            <div class="card-image-wrapper">
                <img src="Cards-png/${card.file}" alt="${card.nameCn}" class="card-image ${card.reversed ? 'reversed' : ''}">
            </div>
            <div class="card-name-orientation">
                <div class="card-name">${card.nameCn}</div>
                <div class="card-orientation">${card.reversed ? '逆位' : '正位'}</div>
            </div>
        `;
        
        slot.style.opacity = '1';
        slot.style.transform = 'rotateY(0deg)';
    }, 300);
}

