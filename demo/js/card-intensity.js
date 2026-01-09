// 牌强度分级配置

// 强度等级定义
const INTENSITY_LEVELS = {
    I0: '安抚/稳定/修复',
    I1: '中性推进/资源可用',
    I2: '轻挑战/提醒/需要调整',
    I3: '强转折/冲击'
};

// 牌强度分级表（根据优化方案文档）
const CARD_INTENSITY_MAP = {
    // 大阿卡纳
    'The Fool': 'I1',
    'The Magician': 'I1',
    'The High Priestess': 'I0',
    'The Empress': 'I0',
    'The Emperor': 'I1',
    'The Hierophant': 'I1',
    'The Lovers': 'I1',
    'The Chariot': 'I1',
    'Strength': 'I0',
    'The Hermit': 'I2',
    'Wheel of Fortune': 'I2',
    'Justice': 'I1',
    'The Hanged Man': 'I2',
    'Death': 'I3',
    'Temperance': 'I0',
    'The Devil': 'I3',
    'The Tower': 'I3',
    'The Star': 'I0',
    'The Moon': 'I2',
    'The Sun': 'I0',
    'Judgement': 'I2',
    'The World': 'I1',
    
    // 圣杯牌组
    'Ace of Cups': 'I0',
    'Two of Cups': 'I0',
    'Three of Cups': 'I0',
    'Four of Cups': 'I2',
    'Five of Cups': 'I2',
    'Six of Cups': 'I0',
    'Seven of Cups': 'I2',
    'Eight of Cups': 'I2',
    'Nine of Cups': 'I0',
    'Ten of Cups': 'I0',
    'Page of Cups': 'I1',
    'Knight of Cups': 'I1',
    'Queen of Cups': 'I0',
    'King of Cups': 'I1',
    
    // 星币牌组
    'Ace of Pentacles': 'I1',
    'Two of Pentacles': 'I1',
    'Three of Pentacles': 'I1',
    'Four of Pentacles': 'I2',
    'Five of Pentacles': 'I3',
    'Six of Pentacles': 'I1',
    'Seven of Pentacles': 'I1',
    'Eight of Pentacles': 'I1',
    'Nine of Pentacles': 'I0',
    'Ten of Pentacles': 'I0',
    'Page of Pentacles': 'I1',
    'Knight of Pentacles': 'I1',
    'Queen of Pentacles': 'I0',
    'King of Pentacles': 'I1',
    
    // 权杖牌组
    'Ace of Wands': 'I1',
    'Two of Wands': 'I1',
    'Three of Wands': 'I1',
    'Four of Wands': 'I0',
    'Five of Wands': 'I2',
    'Six of Wands': 'I1',
    'Seven of Wands': 'I2',
    'Eight of Wands': 'I1',
    'Nine of Wands': 'I2',
    'Ten of Wands': 'I2',
    'Page of Wands': 'I1',
    'Knight of Wands': 'I2',
    'Queen of Wands': 'I1',
    'King of Wands': 'I1',
    
    // 宝剑牌组
    'Ace of Swords': 'I1',
    'Two of Swords': 'I2',
    'Three of Swords': 'I3',
    'Four of Swords': 'I0',
    'Five of Swords': 'I2',
    'Six of Swords': 'I1',
    'Seven of Swords': 'I2',
    'Eight of Swords': 'I2',
    'Nine of Swords': 'I3',
    'Ten of Swords': 'I3',
    'Page of Swords': 'I1',
    'Knight of Swords': 'I2',
    'Queen of Swords': 'I1',
    'King of Swords': 'I1'
};

// 不同状态下的强度分布
const INTENSITY_DISTRIBUTIONS = {
    '愉悦': {
        I0: 0.30,
        I1: 0.55,
        I2: 0.14,
        I3: 0.01
    },
    '平静': {
        I0: 0.40,
        I1: 0.45,
        I2: 0.14,
        I3: 0.01
    },
    '疲惫': {
        I0: 0.55,
        I1: 0.38,
        I2: 0.07,
        I3: 0.00  // 完全禁止
    },
    '迷茫': {
        I0: 0.30,
        I1: 0.45,
        I2: 0.23,
        I3: 0.02
    },
    '焦虑': {
        I0: 0.50,
        I1: 0.42,
        I2: 0.07,
        I3: 0.01
    }
};

// 逆位牌出现几率（根据用户状态）
const REVERSED_PROBABILITIES = {
    '愉悦': 0.20,
    '平静': 0.20,
    '疲惫': 0.20,
    '迷茫': 0.10,
    '焦虑': 0.00  // 完全禁止
};

// 获取牌的强度等级
function getCardIntensity(cardName) {
    return CARD_INTENSITY_MAP[cardName] || 'I1'; // 默认I1
}

// 根据分布随机选择强度等级
function selectIntensityByDistribution(distribution) {
    const random = Math.random();
    let cumulative = 0;
    
    for (const [intensity, probability] of Object.entries(distribution)) {
        cumulative += probability;
        if (random <= cumulative) {
            return intensity;
        }
    }
    
    // 默认返回I1（理论上不会执行到这里）
    return 'I1';
}

// 获取用户状态的强度分布
function getIntensityDistribution(userEmotion) {
    return INTENSITY_DISTRIBUTIONS[userEmotion] || INTENSITY_DISTRIBUTIONS['平静'];
}

// 获取用户状态的逆位出现几率
function getReversedProbability(userEmotion) {
    return REVERSED_PROBABILITIES[userEmotion] || 0.20;
}

