// 幸运元素匹配函数

/**
 * 根据权重选择值（如果多个来源有相同值则使用，否则选择权重最高的）
 */
function selectByWeight(sources, weights) {
  // 如果只有一个来源，直接返回
  if (sources.length === 1) {
    return sources[0];
  }
  
  // 检查是否有相同值
  const allValues = sources.filter(v => v !== null && v !== undefined);
  if (allValues.length === 0) return null;
  
  // 对于数组类型（颜色、植物、石头），按权重选择
  if (Array.isArray(allValues[0])) {
    // 检查是否有相同的数组（转换为字符串比较）
    const arrayStrings = allValues.map(arr => JSON.stringify(arr));
    const uniqueArrayStrings = [...new Set(arrayStrings)];
    if (uniqueArrayStrings.length === 1) {
      return allValues[0];
    }
    
    // 按权重选择（返回权重最高的）
    let maxWeight = -1;
    let selectedArray = null;
    for (let i = 0; i < sources.length; i++) {
      if (sources[i] && Array.isArray(sources[i]) && sources[i].length > 0 && weights[i] > maxWeight) {
        maxWeight = weights[i];
        selectedArray = sources[i];
      }
    }
    return selectedArray || allValues[0];
  }
  
  // 对于数字类型，按权重选择
  // 检查是否有相同值
  const uniqueValues = [...new Set(allValues)];
  if (uniqueValues.length === 1) {
    return uniqueValues[0];
  }
  
  // 按权重选择（返回权重最高的）
  let maxWeight = -1;
  let selectedValue = null;
  for (let i = 0; i < sources.length; i++) {
    if (sources[i] !== null && sources[i] !== undefined && weights[i] > maxWeight) {
      maxWeight = weights[i];
      selectedValue = sources[i];
    }
  }
  return selectedValue;
}

/**
 * 从数组中随机选择一个元素（用于颜色/植物/石头）
 */
function selectFirstFromArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[0];
}

/**
 * 提取塔罗牌的数字
 */
function extractTarotNumber(card) {
  // 大阿卡纳：ID 0-21
  if (card.id <= 21) {
    if (card.id === 0) {
      return 22; // 愚者使用 22
    }
    return card.id;
  }
  
  // 小阿卡纳：根据牌名提取数字
  const name = card.name || '';
  
  // 数字牌（Ace-10）
  if (name.includes('Ace') || name.includes('A')) {
    return 1;
  }
  for (let i = 2; i <= 10; i++) {
    if (name.includes(i.toString())) {
      return i;
    }
  }
  
  // 宫廷牌
  if (name.includes('Page')) return 11;
  if (name.includes('Knight')) return 12;
  if (name.includes('Queen')) return 13;
  if (name.includes('King')) return 14;
  
  // 默认返回牌的ID（如果无法识别）
  return card.id;
}

/**
 * 提取塔罗牌的元素
 */
function extractTarotElement(card) {
  // 大阿卡纳
  if (card.id <= 21) {
    const majorData = LUCKY_ELEMENTS_DATA.tarotMajor[card.id];
    if (majorData && majorData.element) {
      return majorData.element;
    }
  }
  
  // 小阿卡纳：根据花色
  const name = (card.name || '').toLowerCase();
  if (name.includes('cups')) {
    return LUCKY_ELEMENTS_DATA.tarotElement.cups.element;
  }
  if (name.includes('swords')) {
    return LUCKY_ELEMENTS_DATA.tarotElement.swords.element;
  }
  if (name.includes('wands')) {
    return LUCKY_ELEMENTS_DATA.tarotElement.wands.element;
  }
  if (name.includes('pentacles')) {
    return LUCKY_ELEMENTS_DATA.tarotElement.pentacles.element;
  }
  
  return null;
}

/**
 * 生成幸运元素
 * @param {Object} tarotCard - 塔罗牌对象 {id, name, nameCn, ...}
 * @param {Object} moonPhase - 月相对象 {name, nameCn, emoji, energy}
 * @param {Object} userProfile - 用户信息对象（可选）
 * @returns {Object} 幸运元素对象 {lucky_number, lucky_color, lucky_plant, lucky_stone}
 */
function generateLuckyElements(tarotCard, moonPhase, userProfile = null) {
  if (!tarotCard || !moonPhase) {
    throw new Error('塔罗牌和月相信息是必需的');
  }
  
  // 获取月相数据
  const moonPhaseName = moonPhase.nameCn || moonPhase.name;
  const moonData = LUCKY_ELEMENTS_DATA.moonPhase[moonPhaseName];
  
  // 获取塔罗牌元素和数字
  const tarotElement = extractTarotElement(tarotCard);
  const tarotNumber = extractTarotNumber(tarotCard);
  
  // 获取用户星座信息
  let zodiacInfo = null;
  if (userProfile) {
    if (userProfile.zodiac) {
      zodiacInfo = userProfile.zodiac;
    } else if (userProfile.birthday && typeof getZodiacFromDate === 'function') {
      zodiacInfo = getZodiacFromDate(userProfile.birthday);
    }
  }
  
  let result = {
    lucky_number: null,
    lucky_color: null,
    lucky_plant: null,
    lucky_stone: null
  };
  
  // Level 2 匹配：有星座信息
  if (zodiacInfo && zodiacInfo.nameCn) {
    const zodiacName = zodiacInfo.nameCn;
    const zodiacData = LUCKY_ELEMENTS_DATA.zodiac[zodiacName];
    
    if (zodiacData) {
      // 加权融合
      // 幸运数字：星座(60%) + 月相(25%) + 塔罗(15%)
      const numberSources = [
        zodiacData.number,      // 权重 60%
        moonData ? moonData.number : null,  // 权重 25%
        tarotNumber             // 权重 15%
      ];
      const numberWeights = [0.6, 0.25, 0.15];
      result.lucky_number = selectByWeight(numberSources, numberWeights);
      
      // 幸运颜色：星座(50%) + 月相(30%) + 塔罗(20%)
      const colorSources = [
        zodiacData.colors,      // 权重 50%
        moonData ? moonData.colors : null,  // 权重 30%
        tarotElement ? LUCKY_ELEMENTS_DATA.elementDefault[tarotElement].colors : null  // 权重 20%
      ];
      const colorWeights = [0.5, 0.3, 0.2];
      const selectedColors = selectByWeight(colorSources, colorWeights);
      result.lucky_color = selectFirstFromArray(selectedColors);
      
      // 幸运植物：星座(60%) + 月相(40%)
      const plantSources = [
        zodiacData.plants,      // 权重 60%
        moonData ? moonData.plants : null   // 权重 40%
      ];
      const plantWeights = [0.6, 0.4];
      const selectedPlants = selectByWeight(plantSources, plantWeights);
      result.lucky_plant = selectFirstFromArray(selectedPlants);
      
      // 幸运石：星座(60%) + 月相(40%)
      const stoneSources = [
        zodiacData.stones,      // 权重 60%
        moonData ? moonData.stones : null   // 权重 40%
      ];
      const stoneWeights = [0.6, 0.4];
      const selectedStones = selectByWeight(stoneSources, stoneWeights);
      result.lucky_stone = selectFirstFromArray(selectedStones);
      
      return result;
    }
  }
  
  // Level 3 匹配：无星座信息（月相 + 塔罗）
  if (moonData) {
    // 幸运数字：优先使用塔罗数字，如果没有则使用月相数字
    result.lucky_number = tarotNumber || moonData.number;
    
    // 幸运颜色：月相(60%) + 塔罗(40%)
    const colorSources = [
      moonData.colors,  // 权重 60%
      tarotElement ? LUCKY_ELEMENTS_DATA.elementDefault[tarotElement].colors : null  // 权重 40%
    ];
    const colorWeights = [0.6, 0.4];
    const selectedColors = selectByWeight(colorSources, colorWeights);
    result.lucky_color = selectFirstFromArray(selectedColors);
    
    // 幸运植物：月相(70%) + 塔罗(30%)
    const plantSources = [
      moonData.plants,  // 权重 70%
      tarotElement ? LUCKY_ELEMENTS_DATA.elementDefault[tarotElement].plants : null  // 权重 30%
    ];
    const plantWeights = [0.7, 0.3];
    const selectedPlants = selectByWeight(plantSources, plantWeights);
    result.lucky_plant = selectFirstFromArray(selectedPlants);
    
    // 幸运石：月相(70%) + 塔罗(30%)
    const stoneSources = [
      moonData.stones,  // 权重 70%
      tarotElement ? LUCKY_ELEMENTS_DATA.elementDefault[tarotElement].stones : null  // 权重 30%
    ];
    const stoneWeights = [0.7, 0.3];
    const selectedStones = selectByWeight(stoneSources, stoneWeights);
    result.lucky_stone = selectFirstFromArray(selectedStones);
    
    return result;
  }
  
  // Level 4 匹配：极端情况（仅塔罗）
  if (tarotElement) {
    const elementData = LUCKY_ELEMENTS_DATA.elementDefault[tarotElement];
    if (elementData) {
      result.lucky_number = tarotNumber || elementData.number;
      result.lucky_color = selectFirstFromArray(elementData.colors);
      result.lucky_plant = selectFirstFromArray(elementData.plants);
      result.lucky_stone = selectFirstFromArray(elementData.stones);
      return result;
    }
  }
  
  // 最终降级：使用默认值
  result.lucky_number = tarotNumber || 7;
  result.lucky_color = '蓝色';
  result.lucky_plant = '茉莉';
  result.lucky_stone = '月光石';
  
  return result;
}
