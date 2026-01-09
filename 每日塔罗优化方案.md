# 每日塔罗+月相占卜优化方案

## 📋 优化目标

1. **消除负面暗示**：不让用户每日占卜时有负面暗示，抽牌结果不再出现逆位显示
2. **统一显示为正位**：所有牌都显示为正位，即使是抽到的逆位牌
3. **增加解读多样性**：尽量避免同样的牌生成同样的释义
4. **强化疗愈属性**：突出疗愈和正面指引，温柔以待

---

## 🎯 核心方案

### 1. 抽牌逻辑调整

#### 1.1 正逆位处理
- **抽牌阶段**：依然分正位和逆位进行抽取（保持塔罗占卜的完整性）
- **显示阶段**：**所有牌统一显示为正位**，完全不显示任何逆位信息
- **内部记录**：实际抽到的正逆位（`actualReversed`）会记录在数据中，仅用于解读生成
- **解读阶段**：即使抽到逆位牌，生成解读时也要突出疗愈和正面指引

#### 1.2 逆位牌出现几率（根据用户状态）

| 用户状态 | 逆位牌出现几率 |
|---------|--------------|
| 愉悦     | 20%          |
| 平静     | 20%          |
| 疲惫     | 20%          |
| 迷茫     | 10%          |
| 焦虑     | 0%           |

**说明**：
- 焦虑状态：完全禁止逆位牌，确保强保护
- 其他状态：根据状态调整逆位出现几率，但显示时统一为正位
- **重要**：所有逆位信息完全不向用户展示，仅内部记录用于解读生成

#### 1.3 历史记录限制（5日内不重复）

**规则**：每张牌在5日内不得重复抽取

**目的**：
- 增加抽牌多样性
- 避免用户连续多天抽到同一张牌
- 结合用户状态+正逆位+牌池，综合体现多样性

**实现逻辑**：
- 查询最近5天的抽牌记录
- 排除已抽取的牌（按牌ID匹配）
- 从剩余牌池中抽取
- 如果5日内已抽取所有78张牌，则重置限制（理论上不会发生）

---

### 2. 牌强度分级系统

#### 2.1 强度等级定义

| 等级 | 含义 | 特点 |
|-----|------|------|
| **I0** | 安抚/稳定/修复 | 温和、治愈、稳定能量 |
| **I1** | 中性推进/资源可用 | 中性、推进、资源导向 |
| **I2** | 轻挑战/提醒/需要调整 | 提醒、需要调整、轻微挑战 |
| **I3** | 强转折/冲击 | 强烈变化、冲击、转折 |

#### 2.2 不同状态下的强度分布

**愉悦状态**（保持愉悦，不打断，但别过甜）
- I0: 30%
- I1: 55%
- I2: 14%
- I3: 1%

**平静状态**（稳定为主，允许轻微洞察）
- I0: 40%
- I1: 45%
- I2: 14%
- I3: 1%

**疲惫状态**（强保护、强恢复）
- I0: 55%
- I1: 38%
- I2: 7%
- I3: **0%**（**完全禁止，硬性规则**）

**迷茫状态**（允许"提示感"，但避免恐吓）
- I0: 30%
- I1: 45%
- I2: 23%
- I3: 2%

**焦虑状态**（强保护、降低刺激）
- I0: 50%
- I1: 42%
- I2: 7%
- I3: 1%

---

### 3. 牌强度分级表

#### 3.1 大阿卡纳（Major Arcana）

| 牌名 | 英文名 | 强度等级 |
|-----|--------|---------|
| 愚者 | The Fool | I1 |
| 魔术师 | The Magician | I1 |
| 女祭司 | The High Priestess | I0 |
| 女皇 | The Empress | I0 |
| 皇帝 | The Emperor | I1 |
| 教皇 | The Hierophant | I1 |
| 恋人 | The Lovers | I1 |
| 战车 | The Chariot | I1 |
| 力量 | Strength | I0 |
| 隐者 | The Hermit | I2 |
| 命运之轮 | Wheel of Fortune | I2 |
| 正义 | Justice | I1 |
| 倒吊人 | The Hanged Man | I2 |
| 死神 | Death | I3 |
| 节制 | Temperance | I0 |
| 恶魔 | The Devil | I3 |
| 高塔 | The Tower | I3 |
| 星星 | The Star | I0 |
| 月亮 | The Moon | I2 |
| 太阳 | The Sun | I0 |
| 审判 | Judgement | I2 |
| 世界 | The World | I1 |

#### 3.2 圣杯牌组（Cups）

| 牌名 | 英文名 | 强度等级 |
|-----|--------|---------|
| 圣杯王牌 | Ace of Cups | I0 |
| 圣杯2 | 2 of Cups | I0 |
| 圣杯3 | 3 of Cups | I0 |
| 圣杯4 | 4 of Cups | I2 |
| 圣杯5 | 5 of Cups | I2 |
| 圣杯6 | 6 of Cups | I0 |
| 圣杯7 | 7 of Cups | I2 |
| 圣杯8 | 8 of Cups | I2 |
| 圣杯9 | 9 of Cups | I0 |
| 圣杯10 | 10 of Cups | I0 |
| 圣杯侍从 | Page of Cups | I1 |
| 圣杯骑士 | Knight of Cups | I1 |
| 圣杯皇后 | Queen of Cups | I0 |
| 圣杯国王 | King of Cups | I1 |

#### 3.3 星币牌组（Pentacles）

| 牌名 | 英文名 | 强度等级 |
|-----|--------|---------|
| 星币王牌 | Ace of Pentacles | I1 |
| 星币2 | 2 of Pentacles | I1 |
| 星币3 | 3 of Pentacles | I1 |
| 星币4 | 4 of Pentacles | I2 |
| 星币5 | 5 of Pentacles | I3 |
| 星币6 | 6 of Pentacles | I1 |
| 星币7 | 7 of Pentacles | I1 |
| 星币8 | 8 of Pentacles | I1 |
| 星币9 | 9 of Pentacles | I0 |
| 星币10 | 10 of Pentacles | I0 |
| 星币侍从 | Page of Pentacles | I1 |
| 星币骑士 | Knight of Pentacles | I1 |
| 星币皇后 | Queen of Pentacles | I0 |
| 星币国王 | King of Pentacles | I1 |

#### 3.4 权杖牌组（Wands）

| 牌名 | 英文名 | 强度等级 |
|-----|--------|---------|
| 权杖王牌 | Ace of Wands | I1 |
| 权杖2 | 2 of Wands | I1 |
| 权杖3 | 3 of Wands | I1 |
| 权杖4 | 4 of Wands | I0 |
| 权杖5 | 5 of Wands | I2 |
| 权杖6 | 6 of Wands | I1 |
| 权杖7 | 7 of Wands | I2 |
| 权杖8 | 8 of Wands | I1 |
| 权杖9 | 9 of Wands | I2 |
| 权杖10 | 10 of Wands | I2 |
| 权杖侍从 | Page of Wands | I1 |
| 权杖骑士 | Knight of Wands | I2 |
| 权杖皇后 | Queen of Wands | I1 |
| 权杖国王 | King of Wands | I1 |

#### 3.5 宝剑牌组（Swords）

| 牌名 | 英文名 | 强度等级 |
|-----|--------|---------|
| 宝剑王牌 | Ace of Swords | I1 |
| 宝剑2 | 2 of Swords | I2 |
| 宝剑3 | 3 of Swords | I3 |
| 宝剑4 | 4 of Swords | I0 |
| 宝剑5 | 5 of Swords | I2 |
| 宝剑6 | 6 of Swords | I1 |
| 宝剑7 | 7 of Swords | I2 |
| 宝剑8 | 8 of Swords | I2 |
| 宝剑9 | 9 of Swords | I3 |
| 宝剑10 | 10 of Swords | I3 |
| 宝剑侍从 | Page of Swords | I1 |
| 宝剑骑士 | Knight of Swords | I2 |
| 宝剑皇后 | Queen of Swords | I1 |
| 宝剑国王 | King of Swords | I1 |

---

## 🔧 技术实现方案

### 1. 抽牌算法调整

#### 1.1 完整抽牌流程（三阶段）

```javascript
// 伪代码示例
function drawCardWithOptimization(userEmotion) {
  // 第一阶段：根据用户状态确定逆位出现几率
  const reversedProbability = getReversedProbability(userEmotion);
  const isReversed = Math.random() < reversedProbability;
  
  // 第二阶段：根据用户状态和强度分布筛选候选牌
  const intensityDistribution = getIntensityDistribution(userEmotion);
  
  // 第三阶段：排除5日内已抽取的牌
  const recentCards = getRecentCards(5); // 获取最近5天抽取的牌ID列表
  const candidateCards = filterCardsByIntensityAndHistory(
    intensityDistribution, 
    recentCards
  );
  
  // 从候选牌中随机抽取
  const selectedCard = randomSelect(candidateCards);
  
  // 返回结果（显示时统一为正位）
  return {
    card: selectedCard,
    actualReversed: isReversed,  // 实际抽到的正逆位（用于解读，不显示）
    displayReversed: false,       // 显示时统一为正位（固定为false）
    intensity: selectedCard.intensity  // 强度等级
  };
}
```

#### 1.2 强度筛选逻辑（动态计算）

```javascript
function filterCardsByIntensityAndHistory(distribution, recentCardIds) {
  // distribution: { I0: 0.3, I1: 0.55, I2: 0.14, I3: 0.01 }
  // 根据分布随机选择强度等级（动态计算）
  const selectedIntensity = selectIntensityByDistribution(distribution);
  
  // 从对应强度的牌中筛选，排除5日内已抽取的牌
  return allCards.filter(card => 
    card.intensity === selectedIntensity && 
    !recentCardIds.includes(card.id)
  );
}

function selectIntensityByDistribution(distribution) {
  // 根据概率分布随机选择强度等级
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
```

#### 1.3 5日内不重复逻辑

```javascript
function getRecentCards(days) {
  // 获取最近N天的抽牌记录
  const today = new Date();
  const recentReadings = getAllDailyReadings().filter(reading => {
    const readingDate = new Date(reading.timestamp);
    const diffDays = Math.floor((today - readingDate) / (1000 * 60 * 60 * 24));
    return diffDays < days && diffDays >= 0;
  });
  
  // 提取所有已抽取的牌ID
  return recentReadings.map(reading => reading.card.id);
}
```

### 2. 解读生成优化

#### 2.1 Prompt 模板设计

**统一Prompt，但明确要求根据强度等级和用户状态调整语气**

**核心原则**：
- 即使抽到逆位牌，也要以正面的角度进行解读
- 根据强度等级（I0/I1/I2/I3）调整语气和重点
- **用户状态不佳时（疲惫/焦虑），要更加温柔以待，指引更具有疗愈性**
- 结合用户状态+牌义生成，不额外限制多样性（由5日内不重复规则保证）

**Prompt 模板结构**：
```
你是 Luna，一位智慧而温柔的塔罗占卜师。

【用户信息】
- 今日内在状态：[愉悦/平静/疲惫/迷茫/焦虑]
- 今日塔罗牌：[牌名]（实际为正位/逆位：[正位/逆位]，仅用于解读参考）
- 牌强度等级：[I0/I1/I2/I3]
- 今日月相：[月相名称，能量描述]

【解读要求】
1. 正逆位处理：
   - 即使抽到逆位牌，也要以正面的角度进行解读
   - 强调疗愈和修复的能量，提供温柔的指引和建议
   - 避免恐吓或负面暗示
   - 即使是挑战牌（I2/I3），也要以"提醒"和"成长机会"的角度解读

2. 强度等级调整：
   - I0（安抚/稳定/修复）：强调稳定、治愈、修复的能量，提供安抚性的指引
   - I1（中性推进/资源可用）：中性、推进性的解读，强调资源可用和行动方向
   - I2（轻挑战/提醒/需要调整）：以"提醒"和"成长机会"的角度，温和地指出需要调整的地方
   - I3（强转折/冲击）：以"转变"和"新开始"的角度，强调这是成长和转变的契机

3. 用户状态特别关照：
   - **疲惫状态**：要更加温柔、保护性强，强调休息、恢复、自我关怀
   - **焦虑状态**：要特别安抚，降低刺激，强调稳定、安全、支持
   - **迷茫状态**：提供清晰的指引，但避免恐吓，以"提示"和"方向"为主
   - **愉悦/平静状态**：保持愉悦，不打断，但别过甜，提供中肯的洞察

4. 解读多样性：
   - 结合用户的历史情绪记录
   - 结合当天的月相能量
   - 使用不同的表达方式和角度
   - 避免模板化回复
   - 根据用户状态和牌义自然生成，不刻意追求不同

【输出格式】
生成每日占卜内容（综合指引、具体占卜、分类占卜、幸运元素、疗愈任务）
```

#### 2.2 解读多样性策略

**主要依赖**：
1. **5日内不重复规则**：确保牌池多样性
2. **用户状态变化**：不同状态生成不同角度的解读
3. **正逆位变化**：即使同一张牌，正逆位解读角度不同
4. **月相能量结合**：结合当天月相，增加变化性
5. **历史情绪记录**：结合用户历史，提供个性化解读

**不额外限制**：暂时不加限制，仅通过用户状态+牌义自然生成

---

## ✅ 已确认决策

### Q1: 逆位牌显示处理 ✅
**决策**：逆位牌完全不显示任何逆位信息，表现都为正位，但内部记录实际正逆位用于解读生成
**实现**：
- UI上完全不显示逆位标识
- 数据中记录 `actualReversed`（实际正逆位）
- 显示时统一使用正位图片和标识

---

### Q2: 强度分布的实现方式 ✅
**决策**：选项A - 每次抽牌时根据分布随机选择强度等级，然后从该强度等级的牌中抽取（动态计算）
**实现**：使用 `selectIntensityByDistribution()` 函数动态计算强度等级

---

### Q3: 疲惫状态I3禁止规则 ✅
**决策**：完全禁止（硬性规则）
**实现**：
- 疲惫状态下，I3牌的出现几率为0%
- 在筛选候选牌时，直接排除所有I3牌
- 即使5日内未抽取过I3牌，疲惫状态下也不会抽取

---

### Q4: 解读多样性的具体实现 ✅
**决策**：暂时不加限制，仅通过用户状态+牌义生成。但补充规则：每张牌在5日内不得重复抽取
**实现**：
- 不额外限制解读生成
- 通过5日内不重复规则保证牌池多样性
- 结合用户状态+正逆位+牌义自然生成解读

---

### Q5: 历史记录对抽牌的影响 ✅
**决策**：每张牌在5日内不得重复抽取
**实现**：
- 查询最近5天的抽牌记录
- 排除已抽取的牌（按牌ID匹配）
- 从剩余牌池中抽取

---

### Q6: 月相能量对抽牌的影响 ✅
**决策**：仅影响解读生成，不影响抽牌
**实现**：月相信息仅作为Prompt的一部分，用于生成解读，不参与抽牌算法

---

### Q7: 强度分级表的确认 ✅
**决策**：强度分级表暂时不改，按提供的分级表实现
**实现**：使用提供的完整78张牌强度分级表

---

### Q8: 解读生成的Prompt模板 ✅
**决策**：统一Prompt，但在Prompt中明确要求根据强度等级调整语气，尤其是用户状态不佳时，要更加温柔以待，指引更具有疗愈性
**实现**：
- 使用统一的Prompt模板
- 在Prompt中明确强度等级的处理方式
- 特别强调疲惫/焦虑状态的温柔疗愈性

---

### Q9: 数据存储结构 ✅
**决策**：存储实际正逆位和强度等级，用于后续分析和优化
**实现**：
- 必须存储：`card`（牌信息）、`actualReversed`（实际正逆位）、`userEmotion`（用户状态）、`intensity`（强度等级）
- 可选存储：`displayReversed`（固定为false，用于调试）

---

### Q10: 测试和验证 ✅
**决策**：设计测试用例，模拟不同状态下的抽牌，验证分布是否符合预期
**实现**：创建测试脚本，验证不同状态下的抽牌分布和5日内不重复规则

---

## 📝 实施计划

### Phase 1: 数据准备
1. ✅ 创建牌强度分级表（JSON格式）
2. ✅ 创建不同状态的强度分布配置
3. ✅ 创建逆位出现几率配置
4. ⏳ 创建5日内不重复查询逻辑

### Phase 2: 抽牌逻辑调整
1. ⏳ 实现三阶段抽牌算法（逆位几率 + 强度筛选 + 历史排除）
2. ⏳ 实现强度筛选逻辑（动态计算）
3. ⏳ 实现逆位几率控制
4. ⏳ 实现5日内不重复逻辑
5. ⏳ 统一显示为正位（UI层面）

### Phase 3: 解读生成优化
1. ⏳ 调整Prompt模板（统一模板，明确强度等级和用户状态处理）
2. ⏳ 强化疗愈和正面指引（特别是疲惫/焦虑状态）
3. ⏳ 确保逆位牌正面解读

### Phase 4: 数据存储
1. ⏳ 更新数据存储结构（添加 `actualReversed`、`intensity` 字段）
2. ⏳ 实现5日内抽牌记录查询功能

### Phase 5: 测试和优化
1. ⏳ 测试不同状态下的抽牌分布（验证强度分布和逆位几率）
2. ⏳ 测试5日内不重复规则
3. ⏳ 测试疲惫状态I3禁止规则
4. ⏳ 验证解读多样性和疗愈性
5. ⏳ 收集用户反馈并优化

---

## 💾 数据存储结构

### 每日占卜记录结构

```javascript
{
  "daily_readings": {
    "2026-01-07": {
      "date": "2026-01-07",
      "timestamp": "2026-01-07T12:34:56.000Z",
      "userEmotion": "疲惫",  // 用户选择的情绪状态
      "card": {
        "id": "swords_queen",
        "name": "Queen of Swords",
        "nameCn": "宝剑皇后",
        "file": "swords_queen.png",
        "intensity": "I1"  // 强度等级
      },
      "actualReversed": false,  // 实际抽到的正逆位（用于解读，不显示）
      "displayReversed": false,  // 显示正逆位（固定为false）
      "moonPhase": {
        "name": "新月",
        "energy": "..."
      },
      "reading": {
        // 生成的占卜内容
      }
    }
  }
}
```

### 5日内不重复查询

```javascript
function getRecentCardIds(days = 5) {
  const today = new Date();
  const recentReadings = Object.values(dailyReadings).filter(reading => {
    const readingDate = new Date(reading.timestamp);
    const diffDays = Math.floor((today - readingDate) / (1000 * 60 * 60 * 24));
    return diffDays < days && diffDays >= 0;
  });
  
  return recentReadings.map(reading => reading.card.id);
}
```

---

## 🧪 测试用例

### 测试1: 疲惫状态I3禁止
- **输入**：用户状态 = 疲惫
- **预期**：I3牌出现几率为0%，即使5日内未抽取过I3牌
- **验证**：运行100次抽牌，统计I3牌出现次数应为0

### 测试2: 5日内不重复
- **输入**：连续5天抽牌
- **预期**：每天抽到的牌都不重复
- **验证**：检查5天的抽牌记录，确保没有重复的牌ID

### 测试3: 逆位几率分布
- **输入**：不同用户状态，各运行100次抽牌
- **预期**：
  - 愉悦/平静/疲惫：逆位出现约20%
  - 迷茫：逆位出现约10%
  - 焦虑：逆位出现0%
- **验证**：统计各状态下的逆位出现次数

### 测试4: 强度分布
- **输入**：不同用户状态，各运行1000次抽牌
- **预期**：各强度等级的分布符合配置
- **验证**：统计各强度等级的出现次数，计算比例

### 测试5: 显示统一为正位
- **输入**：抽到逆位牌
- **预期**：UI显示为正位，无逆位标识
- **验证**：检查UI显示和数据结构

---

**文档版本**: v2.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07  
**状态**: ✅ 所有关键问题已确认，可开始实施

