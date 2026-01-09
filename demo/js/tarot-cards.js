// 塔罗牌数据
const TAROT_CARDS = {
    // 大阿卡纳 (Major Arcana) - 22张
    major: [
        { id: 0, name: 'The Fool', nameCn: '愚者', file: '00-TheFool.png' },
        { id: 1, name: 'The Magician', nameCn: '魔术师', file: '01-TheMagician.png' },
        { id: 2, name: 'The High Priestess', nameCn: '女祭司', file: '02-TheHighPriestess.png' },
        { id: 3, name: 'The Empress', nameCn: '皇后', file: '03-TheEmpress.png' },
        { id: 4, name: 'The Emperor', nameCn: '皇帝', file: '04-TheEmperor.png' },
        { id: 5, name: 'The Hierophant', nameCn: '教皇', file: '05-TheHierophant.png' },
        { id: 6, name: 'The Lovers', nameCn: '恋人', file: '06-TheLovers.png' },
        { id: 7, name: 'The Chariot', nameCn: '战车', file: '07-TheChariot.png' },
        { id: 8, name: 'Strength', nameCn: '力量', file: '08-Strength.png' },
        { id: 9, name: 'The Hermit', nameCn: '隐者', file: '09-TheHermit.png' },
        { id: 10, name: 'Wheel of Fortune', nameCn: '命运之轮', file: '10-WheelOfFortune.png' },
        { id: 11, name: 'Justice', nameCn: '正义', file: '11-Justice.png' },
        { id: 12, name: 'The Hanged Man', nameCn: '倒吊人', file: '12-TheHangedMan.png' },
        { id: 13, name: 'Death', nameCn: '死神', file: '13-Death.png' },
        { id: 14, name: 'Temperance', nameCn: '节制', file: '14-Temperance.png' },
        { id: 15, name: 'The Devil', nameCn: '恶魔', file: '15-TheDevil.png' },
        { id: 16, name: 'The Tower', nameCn: '高塔', file: '16-TheTower.png' },
        { id: 17, name: 'The Star', nameCn: '星星', file: '17-TheStar.png' },
        { id: 18, name: 'The Moon', nameCn: '月亮', file: '18-TheMoon.png' },
        { id: 19, name: 'The Sun', nameCn: '太阳', file: '19-TheSun.png' },
        { id: 20, name: 'Judgement', nameCn: '审判', file: '20-Judgement.png' },
        { id: 21, name: 'The World', nameCn: '世界', file: '21-TheWorld.png' }
    ],
    // 小阿卡纳 (Minor Arcana)
    minor: {
        cups: [
            { id: 22, name: 'Ace of Cups', nameCn: '圣杯A', file: 'Cups01.png' },
            { id: 23, name: 'Two of Cups', nameCn: '圣杯二', file: 'Cups02.png' },
            { id: 24, name: 'Three of Cups', nameCn: '圣杯三', file: 'Cups03.png' },
            { id: 25, name: 'Four of Cups', nameCn: '圣杯四', file: 'Cups04.png' },
            { id: 26, name: 'Five of Cups', nameCn: '圣杯五', file: 'Cups05.png' },
            { id: 27, name: 'Six of Cups', nameCn: '圣杯六', file: 'Cups06.png' },
            { id: 28, name: 'Seven of Cups', nameCn: '圣杯七', file: 'Cups07.png' },
            { id: 29, name: 'Eight of Cups', nameCn: '圣杯八', file: 'Cups08.png' },
            { id: 30, name: 'Nine of Cups', nameCn: '圣杯九', file: 'Cups09.png' },
            { id: 31, name: 'Ten of Cups', nameCn: '圣杯十', file: 'Cups10.png' },
            { id: 32, name: 'Page of Cups', nameCn: '圣杯侍从', file: 'Cups11.png' },
            { id: 33, name: 'Knight of Cups', nameCn: '圣杯骑士', file: 'Cups12.png' },
            { id: 34, name: 'Queen of Cups', nameCn: '圣杯皇后', file: 'Cups13.png' },
            { id: 35, name: 'King of Cups', nameCn: '圣杯国王', file: 'Cups14.png' }
        ],
        swords: [
            { id: 36, name: 'Ace of Swords', nameCn: '宝剑A', file: 'Swords01.png' },
            { id: 37, name: 'Two of Swords', nameCn: '宝剑二', file: 'Swords02.png' },
            { id: 38, name: 'Three of Swords', nameCn: '宝剑三', file: 'Swords03.png' },
            { id: 39, name: 'Four of Swords', nameCn: '宝剑四', file: 'Swords04.png' },
            { id: 40, name: 'Five of Swords', nameCn: '宝剑五', file: 'Swords05.png' },
            { id: 41, name: 'Six of Swords', nameCn: '宝剑六', file: 'Swords06.png' },
            { id: 42, name: 'Seven of Swords', nameCn: '宝剑七', file: 'Swords07.png' },
            { id: 43, name: 'Eight of Swords', nameCn: '宝剑八', file: 'Swords08.png' },
            { id: 44, name: 'Nine of Swords', nameCn: '宝剑九', file: 'Swords09.png' },
            { id: 45, name: 'Ten of Swords', nameCn: '宝剑十', file: 'Swords10.png' },
            { id: 46, name: 'Page of Swords', nameCn: '宝剑侍从', file: 'Swords11.png' },
            { id: 47, name: 'Knight of Swords', nameCn: '宝剑骑士', file: 'Swords12.png' },
            { id: 48, name: 'Queen of Swords', nameCn: '宝剑皇后', file: 'Swords13.png' },
            { id: 49, name: 'King of Swords', nameCn: '宝剑国王', file: 'Swords14.png' }
        ],
        wands: [
            { id: 50, name: 'Ace of Wands', nameCn: '权杖A', file: 'Wands01.png' },
            { id: 51, name: 'Two of Wands', nameCn: '权杖二', file: 'Wands02.png' },
            { id: 52, name: 'Three of Wands', nameCn: '权杖三', file: 'Wands03.png' },
            { id: 53, name: 'Four of Wands', nameCn: '权杖四', file: 'Wands04.png' },
            { id: 54, name: 'Five of Wands', nameCn: '权杖五', file: 'Wands05.png' },
            { id: 55, name: 'Six of Wands', nameCn: '权杖六', file: 'Wands06.png' },
            { id: 56, name: 'Seven of Wands', nameCn: '权杖七', file: 'Wands07.png' },
            { id: 57, name: 'Eight of Wands', nameCn: '权杖八', file: 'Wands08.png' },
            { id: 58, name: 'Nine of Wands', nameCn: '权杖九', file: 'Wands09.png' },
            { id: 59, name: 'Ten of Wands', nameCn: '权杖十', file: 'Wands10.png' },
            { id: 60, name: 'Page of Wands', nameCn: '权杖侍从', file: 'Wands11.png' },
            { id: 61, name: 'Knight of Wands', nameCn: '权杖骑士', file: 'Wands12.png' },
            { id: 62, name: 'Queen of Wands', nameCn: '权杖皇后', file: 'Wands13.png' },
            { id: 63, name: 'King of Wands', nameCn: '权杖国王', file: 'Wands14.png' }
        ],
        pentacles: [
            { id: 64, name: 'Ace of Pentacles', nameCn: '星币A', file: 'Pentacles01.png' },
            { id: 65, name: 'Two of Pentacles', nameCn: '星币二', file: 'Pentacles02.png' },
            { id: 66, name: 'Three of Pentacles', nameCn: '星币三', file: 'Pentacles03.png' },
            { id: 67, name: 'Four of Pentacles', nameCn: '星币四', file: 'Pentacles04.png' },
            { id: 68, name: 'Five of Pentacles', nameCn: '星币五', file: 'Pentacles05.png' },
            { id: 69, name: 'Six of Pentacles', nameCn: '星币六', file: 'Pentacles06.png' },
            { id: 70, name: 'Seven of Pentacles', nameCn: '星币七', file: 'Pentacles07.png' },
            { id: 71, name: 'Eight of Pentacles', nameCn: '星币八', file: 'Pentacles08.png' },
            { id: 72, name: 'Nine of Pentacles', nameCn: '星币九', file: 'Pentacles09.png' },
            { id: 73, name: 'Ten of Pentacles', nameCn: '星币十', file: 'Pentacles10.png' },
            { id: 74, name: 'Page of Pentacles', nameCn: '星币侍从', file: 'Pentacles11.png' },
            { id: 75, name: 'Knight of Pentacles', nameCn: '星币骑士', file: 'Pentacles12.png' },
            { id: 76, name: 'Queen of Pentacles', nameCn: '星币皇后', file: 'Pentacles13.png' },
            { id: 77, name: 'King of Pentacles', nameCn: '星币国王', file: 'Pentacles14.png' }
        ]
    }
};

// 获取所有塔罗牌（扁平化）
function getAllTarotCards() {
    const allCards = [...TAROT_CARDS.major];
    Object.values(TAROT_CARDS.minor).forEach(suit => {
        allCards.push(...suit);
    });
    return allCards;
}

// 获取最近5天内抽取的牌ID列表
function getRecentCardIds(days = 5) {
    const today = new Date();
    const recentCardIds = [];
    const allReadings = getAllReadings();
    
    Object.values(allReadings).forEach(reading => {
        if (reading.card && reading.date) {
            const readingDate = new Date(reading.date);
            const diffDays = Math.floor((today - readingDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays < days && diffDays >= 0) {
                recentCardIds.push(reading.card.id);
            }
        }
    });
    
    return recentCardIds;
}

// 抽取一张塔罗牌（优化后的三阶段抽牌算法）
function drawTarotCard(userEmotion = '平静') {
    const allCards = getAllTarotCards();
    
    // 第一阶段：根据用户状态确定逆位出现几率
    const reversedProbability = getReversedProbability(userEmotion);
    const isReversed = Math.random() < reversedProbability;
    
    // 第二阶段：根据用户状态和强度分布筛选候选牌
    const intensityDistribution = getIntensityDistribution(userEmotion);
    const selectedIntensity = selectIntensityByDistribution(intensityDistribution);
    
    // 第三阶段：排除5日内已抽取的牌
    const recentCardIds = getRecentCardIds(5);
    
    // 筛选候选牌：符合强度等级且不在5日内已抽取的牌
    let candidateCards = allCards.filter(card => {
        const cardIntensity = getCardIntensity(card.name);
        return cardIntensity === selectedIntensity && !recentCardIds.includes(card.id);
    });
    
    // 如果候选牌池为空（理论上不会发生，除非5日内已抽取所有该强度的牌）
    // 则放宽限制，只排除5日内已抽取的牌
    if (candidateCards.length === 0) {
        candidateCards = allCards.filter(card => !recentCardIds.includes(card.id));
    }
    
    // 如果还是为空（理论上不会发生，除非5日内已抽取所有78张牌）
    // 则从所有牌中选择
    if (candidateCards.length === 0) {
        candidateCards = allCards;
    }
    
    // 从候选牌中随机抽取
    const random = Math.random();
    const index = Math.floor(random * candidateCards.length);
    const card = { ...candidateCards[index] };
    
    // 设置实际正逆位（用于解读生成）
    card.actualReversed = isReversed;
    // 显示时统一为正位（不显示逆位）
    card.reversed = false;  // 统一显示为正位
    card.orientation = '正位';  // 统一显示为正位
    // 获取强度等级
    card.intensity = getCardIntensity(card.name);
    
    return card;
}

// 获取牌的基本含义（简化版，后续可以从 API 获取详细解读）
function getCardMeaning(card) {
    // 这里返回基本含义，实际应该从数据库或 API 获取
    return `${card.nameCn} (${card.name})`;
}

