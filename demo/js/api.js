// DeepSeek API 调用

// API 配置（应该从环境变量或配置文件读取，demo 阶段直接写在这里）
const API_CONFIG = {
    apiKey: 'sk-323a526d56bd486fa26d1f4bcd63c564', // Demo API Key
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat'
};

// 系统 Prompt
const SYSTEM_PROMPT = `You are Luna, a wise and gentle tarot reader who specializes in combining tarot wisdom with lunar energy to provide emotional healing and guidance. 

Your style:
- Warm, compassionate, and deeply empathetic
- Able to understand and address users' emotional states with sensitivity
- Focused on providing comfort, encouragement, and actionable insights
- Skilled at combining tarot symbolism with moon phase energy naturally

Guidelines:
1. Always acknowledge and validate the user's current emotional state
2. Provide gentle, supportive guidance that addresses their emotional needs
3. Combine tarot card meanings with moon phase energy naturally
4. Offer practical, actionable suggestions
5. Use a warm, conversational tone that feels like a trusted friend
6. Avoid being too prescriptive or authoritative
7. Respond ONLY with valid JSON, no additional text`;

// 情绪状态描述映射
const EMOTION_DESCRIPTIONS = {
    '愉悦': 'happy and positive',
    '平静': 'calm and balanced',
    '疲惫': 'tired and low-energy',
    '迷茫': 'confused and uncertain',
    '焦虑': 'anxious and worried'
};

// 构建用户 Prompt
function buildPrompt(userEmotion, tarotCard, moonPhase) {
    const emotionDescription = EMOTION_DESCRIPTIONS[userEmotion] || userEmotion;
    
    // 获取用户信息（检查是否有星座信息）
    let userProfile = null;
    let zodiacInfo = null;
    if (typeof getUserProfile === 'function') {
        userProfile = getUserProfile();
        if (userProfile && userProfile.zodiac) {
            // 如果用户信息中有星座，使用它
            zodiacInfo = userProfile.zodiac;
        } else if (userProfile && userProfile.birthday && typeof getZodiacFromDate === 'function') {
            // 如果用户有生日但没有星座，从生日计算
            zodiacInfo = getZodiacFromDate(userProfile.birthday);
        }
    }
    
    // 获取实际正逆位和强度等级
    const actualReversed = tarotCard.actualReversed !== undefined ? tarotCard.actualReversed : false;
    const intensity = tarotCard.intensity || getCardIntensity(tarotCard.name);
    
    // 强度等级描述
    const intensityDescriptions = {
        'I0': '安抚/稳定/修复 - 温和、治愈、稳定能量',
        'I1': '中性推进/资源可用 - 中性、推进、资源导向',
        'I2': '轻挑战/提醒/需要调整 - 提醒、需要调整、轻微挑战',
        'I3': '强转折/冲击 - 强烈变化、冲击、转折'
    };
    
    return `Please provide a comprehensive daily tarot reading based on the following information:

【User's Emotional State】
${userEmotion}

【Today's Tarot Card】
Card Name: ${tarotCard.name} (${tarotCard.nameCn})
Actual Orientation: ${actualReversed ? '逆位' : '正位'} (仅用于内部解读参考，用户界面统一显示为正位，生成内容中不得提及)
Card Intensity: ${intensity} - ${intensityDescriptions[intensity] || '中性推进/资源可用'}
Card Energy Expression: ${actualReversed ? '内在/缓慢/需要调整节奏的表达' : '外在/主动/推进的表达'}
Card Meaning: ${tarotCard.nameCn} represents ${tarotCard.name}${actualReversed ? ', today expressing with a more inward, slower rhythm that requires adjustment in approach' : ''}

【Today's Moon Phase】
Moon Phase: ${moonPhase.nameCn} (${moonPhase.name})
Moon Energy: ${moonPhase.energy}

${zodiacInfo ? `【User's Zodiac Sign】
Zodiac: ${zodiacInfo.nameCn} (${zodiacInfo.name}) ${zodiacInfo.emoji}
` : ''}---

【Critical Instructions for concise_guidance and guidance_one_line】
Both "concise_guidance" and "guidance_one_line" fields must provide DIRECT healing comfort and actionable advice. 

STRICT PROHIBITIONS:
- Do NOT mention the tarot card name (e.g., "宝剑皇后", "愚者", "皇后", "星星", etc.)
- Do NOT mention the moon phase name (e.g., "下弦月", "满月", "新月", "上弦月", etc.)
- Do NOT explain what the tarot card or moon phase means
- Do NOT say things like "今天的塔罗牌是..." or "月相显示..." or "这张牌意味着..."
- Do NOT reference "塔罗" or "月相" explicitly
- **CRITICAL: Do NOT mention user's emotional state** - STRICTLY FORBIDDEN to use words like "愉悦", "平静", "疲惫", "迷茫", "焦虑" or any other emotional state descriptions in the guidance text

REQUIREMENTS:
- Use ONLY the energy and meaning of the tarot card and moon phase to inform your guidance, but express it as pure healing comfort and advice
- Directly offer warm, empathetic reassurance and practical suggestions
- Make it feel like natural, intuitive guidance WITHOUT referencing the user's current emotional state
- Focus on comfort, encouragement, and actionable suggestions
- The guidance should feel timeless and universal, not tied to specific symbols, elements, or emotional states

Example of BAD guidance: "在愉悦中保持清醒的觉察，让下弦月的宁静沉淀你的智慧，以宝剑皇后的明晰照亮前路。"

Example of GOOD guidance: "保持清醒的觉察，让内心的宁静沉淀你的智慧，用清晰的视角照亮前路。"

---

Please generate ALL of the following content in ONE response, formatted as JSON:

{
  "concise_guidance": "A concise, impactful one-line guidance (WITHIN 15-18 Chinese characters). This should be a brief, powerful statement that captures the essence of today's guidance. It can be a complete sentence with punctuation. Examples: '有些话不必急着说出口', '暂时放下心中的事，让时间沉淀', '让时间沉淀答案，静待花开', '静待花开的声音，让心自然舒展'. It should be poetic, meaningful, and directly actionable. STRICTLY FORBIDDEN: Do NOT mention tarot card names or moon phase names. Do NOT mention user's emotional state (e.g., '愉悦', '平静', '疲惫', '迷茫', '焦虑'). Use ONLY the energy to inform the guidance, but express it as pure, timeless wisdom without referencing emotional states.",
  
  "guidance_one_line": "A single line of healing comfort and actionable advice (within 25-30 Chinese characters). STRICTLY FORBIDDEN: Do NOT mention tarot card names (e.g., '宝剑皇后', '愚者', etc.) or moon phase names (e.g., '下弦月', '满月', etc.). Do NOT explain what the tarot card or moon phase means. Do NOT mention user's emotional state (e.g., '愉悦', '平静', '疲惫', '迷茫', '焦虑'). Use ONLY their energy to inform your guidance, but express it as pure comfort and advice without referencing the symbols or emotional states. Directly provide warm, empathetic reassurance and practical suggestions. Make it feel like natural, intuitive guidance.",
  
  "today_analysis": "**CRITICAL LENGTH REQUIREMENT: EXACTLY 280-320 Chinese characters (counted including all Chinese characters, punctuation marks, and spaces). This is MANDATORY and STRICTLY ENFORCED. The content MUST be divided into 2 paragraphs (use \\n to separate paragraphs), each paragraph should be complete and meaningful. Before finalizing, count the characters to ensure it falls within 280-320 characters.** A detailed analysis that EXPLICITLY explains the analytical thinking behind the guidance. MUST include: (1) Explanation of the tarot card's meaning and how it relates to the user's emotional state (mention the card name like '宝剑皇后', '愚者', etc.), (2) Explanation of the moon phase energy and its influence (mention the moon phase name like '下弦月', '满月', etc.)${zodiacInfo ? `, (3) A brief zodiac analysis (小篇幅) that combines the user's zodiac sign (${zodiacInfo.nameCn}) with today's tarot card and moon phase energy, explaining how the zodiac traits interact with today's guidance` : `, (3) How these elements combine with the user's emotional state to form comprehensive daily fortune and healing guidance`}. STRICTLY PROHIBITED: Do NOT use any words related to card orientation such as '逆位/正位/倒立/reversed/upright/抽到逆位/牌面方向/牌朝向'. Do NOT describe the card drawing process (avoid phrases like '你抽到的是...' or '你抽到了一张...'). If the card energy is inward/slower/needs adjustment, express it as '节奏更慢/需要调整方法/更偏内在整理/先稳住' or '这张牌今天更偏向内在/缓慢/需要调整节奏的表达', never attribute it to '逆位'. This should be sincere, warm, and personalized, showing the analytical process and reasoning behind the advice. The content should explain WHY and HOW the analysis is derived from these sources.",
  
  "healing_task": "One specific healing task (20 seconds to 2 minutes to complete), tailored to the user's emotional state. Format: '* [specific action] [duration]'. Example: '* 注视远方一座塔楼 20 秒'. The task should help address the user's current emotional state.",
  
  "two_guidances": [
    {
      "category": "情感/工作/学习/生活/家庭",
      "guidance": "Detailed guidance for this category (within 80 Chinese characters), combining tarot + moon phase + emotional state, with comfort and actionable advice."
    },
    {
      "category": "情感/工作/学习/生活/家庭",
      "guidance": "Detailed guidance for this category (within 80 Chinese characters), combining tarot + moon phase + emotional state, with comfort and actionable advice."
    }
  ],
  
  "lucky_elements": {
    "lucky_color": "A specific color name (e.g., '柔和的薰衣草紫', '温暖的金色')",
    "lucky_accessory": "A specific accessory suggestion (e.g., '水晶手链', '简约的银饰')",
    "lucky_number": "A number (e.g., 7, 14, 21)",
    "lucky_decoration": "A decoration/object suggestion (e.g., '小型绿植', '香薰蜡烛')"
  }
}

【Important Instructions】

0. **CRITICAL PROHIBITIONS for today_analysis (最高优先级禁止项)**:
   - STRICTLY FORBIDDEN: Do NOT use any words related to card orientation: "逆位/正位/倒立/reversed/upright/抽到逆位/牌面方向/牌朝向"
   - STRICTLY FORBIDDEN: Do NOT describe the card drawing process (avoid "你抽到的是..." or "你抽到了一张..." or "你抽到了一张逆位牌" or any description of drawing cards)
   - If the card energy is inward/slower/needs adjustment (when actualReversed is true), express it as:
     * "节奏更慢/需要调整方法/更偏内在整理/先稳住"
     * "这张牌今天更偏向内在/缓慢/需要调整节奏的表达"
     * "能量更偏向内收和整理，需要放缓节奏"
     * "今天这张牌的能量呈现更偏内在的表达"
   - NEVER attribute energy differences to "逆位" - express them as natural energy expressions of the card
   - The card is always displayed as upright to the user, so the generated text should never suggest otherwise

1. **Emotional State Integration**: 
   - If the user feels ${emotionDescription}, acknowledge their feelings with empathy
   - Provide comfort and reassurance that addresses their emotional needs
   - Offer gentle suggestions to help them navigate their current state
   - Make them feel understood and supported
   - **特别关照**：
     * **疲惫状态**：要更加温柔、保护性强，强调休息、恢复、自我关怀
     * **焦虑状态**：要特别安抚，降低刺激，强调稳定、安全、支持
     * **迷茫状态**：提供清晰的指引，但避免恐吓，以"提示"和"方向"为主
     * **愉悦/平静状态**：保持愉悦，不打断，但别过甜，提供中肯的洞察

2. **Card Intensity Adjustment** (强度等级调整):
   - **I0 (安抚/稳定/修复)**：强调稳定、治愈、修复的能量，提供安抚性的指引
   - **I1 (中性推进/资源可用)**：中性、推进性的解读，强调资源可用和行动方向
   - **I2 (轻挑战/提醒/需要调整)**：以"提醒"和"成长机会"的角度，温和地指出需要调整的地方
   - **I3 (强转折/冲击)**：以"转变"和"新开始"的角度，强调这是成长和转变的契机
   - **卡牌能量表达调整**：
     * 如果卡牌能量更偏向内在/缓慢/需要调整：用"节奏更慢/需要调整方法/更偏内在整理/先稳住"这类措辞表达
     * 允许写成"这张牌今天更偏向内在/缓慢/需要调整节奏的表达"
     * **严格禁止**：不得出现"逆位/正位/倒立/reversed/upright/抽到逆位/牌面方向/牌朝向"等任何表达
     * **严格禁止**：不得描述抽牌过程（不要说"你抽到的是...""你抽到了一张..."）
     * 不归因于逆位，而是描述卡牌能量的自然表达方式

3. **Content Tone**:
   - Be warm, gentle, and encouraging
   - Validate their emotions while offering hope
   - Use language that feels like a caring friend, not a distant oracle
   - **用户状态不佳时（疲惫/焦虑），要更加温柔以待，指引更具有疗愈性**

3. **Combination Logic**:
   - Naturally weave together tarot meaning + moon phase energy + emotional state
   - Don't list them separately, but integrate them organically
   - Make the guidance feel personalized and relevant
   - **CRITICAL for concise_guidance and guidance_one_line**: 
     * STRICTLY FORBIDDEN: Do NOT mention tarot card names (宝剑皇后, 愚者, 皇后, etc.) or moon phase names (下弦月, 满月, 新月, etc.)
     * Do NOT explain what the tarot card or moon phase means
     * Do NOT reference "塔罗" or "月相" explicitly
     * **CRITICAL: Do NOT mention user's emotional state** - STRICTLY FORBIDDEN to use words like "愉悦", "平静", "疲惫", "迷茫", "焦虑" or any other emotional state descriptions
     * Use ONLY the energy and meaning of tarot and moon phase to inform your guidance, but express it as pure healing comfort and advice
     * Make it feel like natural, intuitive guidance, not tied to specific symbols or emotional states
     * The user will see the detailed analysis in "today_analysis" section, so concise_guidance and guidance_one_line should be purely comforting advice without referencing emotional states
   
   - **REQUIRED for today_analysis**:
     * **CRITICAL LENGTH REQUIREMENT: EXACTLY 280-320 Chinese characters (counted including all Chinese characters, punctuation marks, and spaces). This is MANDATORY and STRICTLY ENFORCED. You MUST count the characters before finalizing. If the content is too short, expand it. If it's too long, condense it. The final character count MUST be between 280 and 320, inclusive.**
     * **MUST be divided into exactly 2 paragraphs (use \\n to separate paragraphs). Each paragraph should be complete and meaningful.**
     * MUST explain the analytical thinking and reasoning process
     * MUST mention the tarot card name (e.g., "宝剑皇后", "愚者") and explain what it means in the context of the user's emotional state
     * MUST mention the moon phase name (e.g., "下弦月", "满月", "新月") and explain its energy and influence
     ${zodiacInfo ? `* MUST include a brief zodiac analysis (小篇幅) that combines the user's zodiac sign (${zodiacInfo.nameCn}) with today's tarot card and moon phase energy, explaining how the zodiac traits interact with today's guidance. The zodiac analysis should be naturally integrated and not dominate the content.` : ''}
     * MUST explain how these elements combine with the user's emotional state to form the guidance
     * Should show the analytical process: why these symbols were chosen, what they mean, and how they inform the advice
     * **CRITICAL PROHIBITIONS**:
       - STRICTLY FORBIDDEN: Do NOT use any words related to card orientation: "逆位/正位/倒立/reversed/upright/抽到逆位/牌面方向/牌朝向"
       - STRICTLY FORBIDDEN: Do NOT describe the card drawing process (avoid "你抽到的是..." or "你抽到了一张...")
       - If the card energy is inward/slower/needs adjustment, express it as "节奏更慢/需要调整方法/更偏内在整理/先稳住" or "这张牌今天更偏向内在/缓慢/需要调整节奏的表达"
       - Never attribute energy differences to "逆位" - express them as natural energy expressions
     * This is where the user learns the SOURCE and LOGIC behind the guidance

4. **Length Requirements (CRITICAL - STRICTLY ENFORCED)**:
   - concise_guidance: Exactly within 15-18 Chinese characters - must be a poetic, impactful statement that captures the essence of today's guidance. It can be a complete sentence with punctuation. STRICTLY FORBIDDEN: Do NOT mention user's emotional state (愉悦, 平静, 疲惫, 迷茫, 焦虑, etc.)
   - guidance_one_line: Exactly within 25-30 Chinese characters - must be direct healing comfort and advice, NO explanation of tarot or moon phase, NO mention of card/phase names, NO mention of user's emotional state (愉悦, 平静, 疲惫, 迷茫, 焦虑, etc.)
   - **today_analysis: CRITICAL - EXACTLY 280-320 Chinese characters (counted including all Chinese characters, punctuation marks, and spaces). This is MANDATORY. You MUST count the characters and ensure the final count is between 280 and 320, inclusive. If too short, expand. If too long, condense. MUST be divided into exactly 2 paragraphs (use \\n to separate paragraphs), each paragraph should be complete and meaningful.** MUST explicitly explain the tarot card meaning, moon phase energy${zodiacInfo ? `, and a brief zodiac analysis (小篇幅) combining the user's zodiac sign (${zodiacInfo.nameCn}) with today's guidance` : ''}, and how they combine with the user's emotional state. MUST mention the card name and moon phase name${zodiacInfo ? `, and naturally integrate the zodiac analysis` : ''}. **STRICTLY PROHIBITED**: Do NOT use any words related to card orientation such as "逆位/正位/倒立/reversed/upright/抽到逆位/牌面方向/牌朝向". Do NOT describe the card drawing process (avoid phrases like "你抽到的是..." or "你抽到了一张..."). If the card energy is inward/slower/needs adjustment, express it as "节奏更慢/需要调整方法/更偏内在整理/先稳住" or "这张牌今天更偏向内在/缓慢/需要调整节奏的表达", never attribute it to "逆位". This is the analytical explanation section.
   - healing_task: One simple, actionable task (20 sec - 2 min)
   - two_guidances: Each within 80 Chinese characters

5. **Category Selection for two_guidances**:
   - Choose the 2 most relevant categories based on the tarot card, moon phase, and user's emotional state
   - Make the selection feel natural and meaningful

6. **Lucky Elements**:
   - Choose elements that resonate with today's energy and the user's emotional needs
   - Make them feel meaningful and personalized

---

**⚠️ CRITICAL REMINDER FOR today_analysis FIELD ⚠️**

**MANDATORY LENGTH REQUIREMENT: The "today_analysis" field MUST contain EXACTLY 280-320 Chinese characters (counted including all Chinese characters, punctuation marks, and spaces).**

**BEFORE SUBMITTING YOUR RESPONSE:**
1. Count the characters in your "today_analysis" field
2. If the count is LESS than 280: Expand the content until it reaches at least 280 characters
3. If the count is MORE than 320: Condense the content until it is no more than 320 characters
4. The final count MUST be between 280 and 320, inclusive (280 ≤ count ≤ 320)
5. The content MUST be divided into exactly 2 paragraphs (use \\n to separate them)

**This length requirement is MANDATORY and will be strictly enforced. Failure to comply will result in rejection.**

Please respond ONLY with valid JSON, no additional text.`;
}

// 解析 JSON 响应（处理可能的 markdown 代码块）
function parseJSONResponse(content) {
    let jsonStr = content.trim();
    
    // 移除 markdown 代码块标记
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7);
    } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.substring(3);
    }
    
    if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    
    jsonStr = jsonStr.trim();
    
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('JSON parse error:', e);
        console.error('Content:', jsonStr);
        throw new Error('Failed to parse API response as JSON');
    }
}

// 调用 DeepSeek API 生成占卜内容
async function generateTarotReading(userEmotion, tarotCard, moonPhase) {
    try {
        const prompt = buildPrompt(userEmotion, tarotCard, moonPhase);
        
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
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        const readingData = parseJSONResponse(content);
        
        return readingData;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// 塔罗专项占卜系统提示词
const TAROT_SPREAD_SYSTEM_PROMPT = `你是 Luna，一位智慧而温柔的塔罗占卜师。你擅长通过塔罗牌帮助人们进行自我洞察，提供心理投射和情绪支持。你的回答总是温柔、中肯、充满疗愈感，同时给出具体可行的建议。

你的风格：
- 温柔、共情、理解
- 将塔罗牌的象征意义与用户问题深度结合
- 提供疗愈性的建议和鼓励
- 语言温暖如挚友，而非冷漠的预言者`;

// 构建塔罗专项占卜提示词
function buildTarotSpreadPrompt(question, spreadType, cards, allDailyReadings) {
    let prompt = `请为以下塔罗占卜提供解读：

【用户问题】
${question}

【牌阵类型】
${spreadType}

【抽取的牌】
`;
    
    cards.forEach((item, index) => {
        const card = item.card;
        prompt += `${index + 1}. ${item.position.name}：${card.nameCn} ${card.reversed ? '(逆位)' : '(正位)'}\n`;
    });
    
    // 添加用户背景信息（所有历史）
    if (allDailyReadings && allDailyReadings.length > 0) {
        prompt += `\n【用户背景信息】（所有历史数据）\n`;
        allDailyReadings.slice(0, 30).forEach(reading => { // 限制数量避免token过多
            if (reading.guidance_one_line || reading.today_analysis || reading.emotionRecord) {
                prompt += `日期 ${reading.date}:\n`;
                if (reading.emotion) prompt += `- 情绪状态：${reading.emotion}\n`;
                if (reading.guidance_one_line) prompt += `- 指引：${reading.guidance_one_line}\n`;
                if (reading.emotionRecord) prompt += `- 情绪记录：${reading.emotionRecord}\n`;
            }
        });
    }
    
    prompt += `\n【输出要求】

请以JSON格式输出，包含以下字段：

{
  "overall_reading": "整体解读，总体不超过200字，分为3-4段。每段50-70字左右。内容应温柔、中肯、治愈，包含占卜、疗愈、建议三个维度。",
  "reading_paragraphs": [
    "第一段（占卜维度，分析问题和牌阵的整体意义）",
    "第二段（疗愈维度，提供情感支持和理解）",
    "第三段（建议维度，给出具体可行的建议）",
    "第四段（总结或鼓励，可选）"
  ],
  "card_readings": [
    {
      "position": "过去",
      "card_name": "宝剑皇后",
      "is_reversed": false,
      "interpretation": "这张牌在这个位置的含义，简洁明了（30-50字）"
    }
  ]
}

【重要要求】
1. overall_reading 总体不超过200字，分为3-4段
2. 每段应该独立成段，表达完整的意思
3. 整体解读要结合所有牌的含义，给出综合性的分析和建议
4. 语言使用中文，温柔、治愈、鼓励
5. 逐牌解读要简洁，重点说明牌在该位置的意义
6. 只输出JSON，不要其他文字`;

    return prompt;
}

// 生成塔罗专项占卜内容
async function generateTarotSpreadReading(question, spreadType, cards, allDailyReadings) {
    try {
        const prompt = buildTarotSpreadPrompt(question, spreadType, cards, allDailyReadings);
        
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
                        content: TAROT_SPREAD_SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        const readingData = parseJSONResponse(content);
        
        return readingData;
    } catch (error) {
        console.error('Tarot spread API call error:', error);
        throw error;
    }
}

// 生成塔罗聊天回复
async function generateTarotChatResponse(message, readingContext, allDailyReadings) {
    try {
        let prompt = `用户在之前的占卜后提问，请给予温柔、治愈的回答。

【用户问题】
${readingContext.question}

【之前的占卜结果】
${readingContext.overall_reading || ''}

【抽到的牌】
`;
        readingContext.cards.forEach((item, index) => {
            const card = item.card;
            prompt += `${index + 1}. ${item.position.name}：${card.nameCn} ${card.reversed ? '(逆位)' : '(正位)'}\n`;
        });
        
        prompt += `\n【用户的当前提问】\n${message}\n\n`;
        
        // 添加用户背景（所有历史）
        if (allDailyReadings && allDailyReadings.length > 0) {
            prompt += `【用户背景信息】（所有历史数据）\n`;
            allDailyReadings.slice(0, 30).forEach(reading => {
                if (reading.guidance_one_line || reading.today_analysis || reading.emotionRecord) {
                    prompt += `日期 ${reading.date}:\n`;
                    if (reading.emotion) prompt += `- 情绪状态：${reading.emotion}\n`;
                    if (reading.guidance_one_line) prompt += `- 指引：${reading.guidance_one_line}\n`;
                    if (reading.emotionRecord) prompt += `- 情绪记录：${reading.emotionRecord}\n`;
                }
            });
        }
        
        // 添加聊天历史
        if (readingContext.chat_history && readingContext.chat_history.length > 0) {
            prompt += `\n【之前的对话】\n`;
            readingContext.chat_history.forEach(msg => {
                prompt += `${msg.role === 'user' ? '用户' : 'Luna'}：${msg.content}\n`;
            });
        }
        
        prompt += `\n请以温柔、治愈、鼓励的语气回答用户的问题。结合占卜结果和用户背景，给予深入解答和延伸思考。回答要简洁（100-200字），避免重复已说内容。直接输出回答，不要JSON格式。`;
        
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
                        content: TAROT_SPREAD_SYSTEM_PROMPT
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
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Tarot chat API call error:', error);
        throw error;
    }
}

// 生成单个领域的指引（200字）
async function generateCategoryGuidance(category, todayReading) {
    try {
        if (!todayReading || !todayReading.reading || !todayReading.card || !todayReading.moonPhase) {
            throw new Error('缺少必要的今日占卜数据');
        }

        const card = todayReading.card;
        const moonPhase = todayReading.moonPhase;
        const emotion = todayReading.emotion || '平静';
        const emotionDescription = EMOTION_DESCRIPTIONS[emotion] || emotion;
        
        // 获取用户信息（检查是否有星座信息）
        let userProfile = null;
        let zodiacInfo = null;
        if (typeof getUserProfile === 'function') {
            userProfile = getUserProfile();
            if (userProfile && userProfile.zodiac) {
                zodiacInfo = userProfile.zodiac;
            } else if (userProfile && userProfile.birthday && typeof getZodiacFromDate === 'function') {
                zodiacInfo = getZodiacFromDate(userProfile.birthday);
            }
        }
        
        // 获取实际正逆位和强度等级
        const actualReversed = card.actualReversed !== undefined ? card.actualReversed : false;
        const intensity = card.intensity || getCardIntensity(card.name);
        
        // 强度等级描述
        const intensityDescriptions = {
            'I0': '安抚/稳定/修复 - 温和、治愈、稳定能量',
            'I1': '中性推进/资源可用 - 中性、推进、资源导向',
            'I2': '轻挑战/提醒/需要调整 - 提醒、需要调整、轻微挑战',
            'I3': '强转折/冲击 - 强烈变化、冲击、转折'
        };

        // 领域描述映射
        const categoryDescriptions = {
            '爱情': 'love and romantic relationships',
            '财富': 'wealth, money, and financial matters',
            '工作': 'work and career',
            '学习': 'study and learning',
            '家庭': 'family and home life',
            '人际': 'social relationships, friends, and people around you'
        };

        const categoryDescription = categoryDescriptions[category] || category;

        const prompt = `Please provide guidance for the "${category}" (${categoryDescription}) category based on today's tarot reading.

【User's Emotional State】
${emotion}

【Today's Tarot Card】
Card Name: ${card.name} (${card.nameCn})
Card Intensity: ${intensity} - ${intensityDescriptions[intensity] || '中性推进/资源可用'}
Card Energy Expression: ${actualReversed ? '内在/缓慢/需要调整节奏的表达' : '外在/主动/推进的表达'}
Card Meaning: ${card.nameCn} represents ${card.name}${actualReversed ? ', today expressing with a more inward, slower rhythm that requires adjustment in approach' : ''}

【Today's Moon Phase】
Moon Phase: ${moonPhase.nameCn} (${moonPhase.name})
Moon Energy: ${moonPhase.energy}

${zodiacInfo ? `【User's Zodiac Sign】
Zodiac: ${zodiacInfo.nameCn} (${zodiacInfo.name}) ${zodiacInfo.emoji}
` : ''}---

Please generate guidance for the "${category}" category in Chinese. The guidance should:

1. **Length**: EXACTLY 200 Chinese characters (counted including all Chinese characters, punctuation marks, and spaces). This is MANDATORY and STRICTLY ENFORCED.

2. **Content Requirements**:
   - Combine the tarot card meaning, moon phase energy, and user's emotional state
   - Provide specific, actionable advice for the "${category}" category
   - Be warm, empathetic, and healing
   - Offer practical suggestions that the user can apply
   - Feel personalized and relevant

3. **Prohibitions**:
   - Do NOT mention the tarot card name (e.g., "宝剑皇后", "愚者", etc.) or moon phase name (e.g., "下弦月", "满月", etc.) explicitly
   - Do NOT explain what the tarot card or moon phase means
   - Do NOT mention user's emotional state (e.g., "愉悦", "平静", "疲惫", "迷茫", "焦虑") in the guidance text
   - Use ONLY the energy and meaning to inform your guidance, but express it as pure advice

4. **Style**:
   - Be warm, gentle, and encouraging
   - Use language that feels like a caring friend
   - Focus on comfort, encouragement, and actionable suggestions

Please respond with ONLY the guidance text in Chinese (exactly 200 characters), no JSON format, no additional text.`;

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
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        return content;
    } catch (error) {
        console.error('Category guidance API call error:', error);
        throw error;
    }
}

// ===== Miri 聊天 API 调用函数 =====

// Miri 系统 Prompt
const MIRI_SYSTEM_PROMPT = `你是 Miri，一朵可爱、治愈的云状精灵，是用户的 AI 陪伴伙伴。

你的性格特点：
- 温柔、友善、充满同理心
- 说话风格轻松、自然，像朋友一样
- 能够理解用户的情绪，给予温暖的支持
- 结合塔罗、月相等信息，提供有意义的对话

你的对话原则：
1. 始终以温暖、鼓励的语气与用户交流
2. 结合用户的状态和今日信息，提供个性化回应
3. 不要过于正式或说教，保持轻松友好的氛围
4. 在用户情绪低落时，给予更多安慰和支持
5. 可以主动询问用户的感受，但不要过于频繁

请用中文回复，保持简洁自然。`;

// ===== Miri 镜像句记忆（用于对话上下文，不等同于聊天历史）=====
// 注意：miri-chat.js 里也有同名常量，为避免全局 const 重名，这里使用独立命名
const MIRI_DAILY_MIRROR_STORAGE_PREFIX = 'miri_daily_mirror_';

function parseDateKey(dateKey) {
    // dateKey: YYYY-MM-DD
    const [y, m, d] = (dateKey || '').split('-').map(n => parseInt(n, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function getTodayDateKeyForMirror() {
    if (typeof getTodayKey === 'function') return getTodayKey();
    // fallback
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

function loadMiriDailyMirrorStateByDateKey(dateKey) {
    try {
        const raw = localStorage.getItem(`${MIRI_DAILY_MIRROR_STORAGE_PREFIX}${dateKey}`);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function getMiriMirrorMemoryText() {
    const todayKey = getTodayDateKeyForMirror();
    const todayDate = parseDateKey(todayKey);

    const items = [];

    // 收集所有镜像句 key
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(MIRI_DAILY_MIRROR_STORAGE_PREFIX)) keys.push(k);
    }

    // 按日期升序
    keys.sort((a, b) => {
        const da = parseDateKey(a.slice(MIRI_DAILY_MIRROR_STORAGE_PREFIX.length));
        const db = parseDateKey(b.slice(MIRI_DAILY_MIRROR_STORAGE_PREFIX.length));
        return (da?.getTime() || 0) - (db?.getTime() || 0);
    });

    for (const k of keys) {
        const dateKey = k.slice(MIRI_DAILY_MIRROR_STORAGE_PREFIX.length);
        const d = parseDateKey(dateKey);
        const state = loadMiriDailyMirrorStateByDateKey(dateKey);
        if (!state || !state.question || !Array.isArray(state.options)) continue;

        const isBeforeToday = todayDate && d ? d.getTime() < todayDate.getTime() : false;

        // 规则：如果是今天以前且未选择（只有镜像句和选项），则不计入记忆
        if (isBeforeToday && !state.selectedOption) continue;

        // 今天：允许未选择也进入记忆（让 Miri 知道今天的问题是什么）
        const parts = [];
        parts.push(`日期：${dateKey}`);
        parts.push(`一问：${state.question}`);
        if (state.selectedOption) parts.push(`一答：${state.selectedOption}`);
        if (state.interpretation) parts.push(`一解析：${state.interpretation}`);
        items.push(parts.join('\n'));
    }

    if (items.length === 0) return '';
    return `【镜像句记忆】\n${items.join('\n\n')}\n\n`;
}

// 构建 Miri 对话上下文
function buildMiriContext() {
    let context = '';
    
    console.log('buildMiriContext: 开始构建上下文');
    
    // 获取用户信息
    if (typeof getUserProfile === 'function') {
        const profile = getUserProfile();
        console.log('用户信息:', profile);
        if (profile) {
            context += '【用户信息】\n';
            if (profile.name) context += `姓名：${profile.name}\n`;
            if (profile.zodiac) context += `星座：${profile.zodiac.nameCn} (${profile.zodiac.name})\n`;
            if (profile.birthday) context += `生日：${profile.birthday}\n`;
            context += '\n';
        }
    }
    
    // 获取用户当前状态和今日塔罗信息
    if (typeof getTodayReading === 'function') {
        const todayReading = getTodayReading();
        console.log('今日塔罗信息:', todayReading);
        if (todayReading) {
            // 用户当前状态
            if (todayReading.userEmotion) {
                context += '【用户当前状态】\n';
                context += `情绪状态：${todayReading.userEmotion}\n\n`;
            }
            
            // 今日塔罗信息
            context += '【今日塔罗信息】\n';
            if (todayReading.card) {
                context += `塔罗牌：${todayReading.card.name} (${todayReading.card.nameCn})\n`;
            }
            if (todayReading.reading) {
                const reading = todayReading.reading;
                if (reading.guidance_one_line) {
                    context += `今日指引：${reading.guidance_one_line}\n`;
                }
                if (reading.today_analysis) {
                    context += `今日分析：${reading.today_analysis}\n`;
                }
                if (reading.lucky_elements) {
                    context += `幸运元素：${JSON.stringify(reading.lucky_elements)}\n`;
                }
            }
            if (todayReading.moonPhase) {
                context += `月相：${todayReading.moonPhase.nameCn} (${todayReading.moonPhase.name})\n`;
            }
            context += '\n';
            
            // 今日生成的其他信息
            if (todayReading.reading) {
                context += '【今日生成的其他信息】\n';
                const reading = todayReading.reading;
                if (reading.concise_guidance) {
                    context += `简洁指引：${reading.concise_guidance}\n`;
                }
                if (reading.healing_task) {
                    context += `疗愈任务：${reading.healing_task}\n`;
                }
                context += '\n';
            }
        }
    }
    
    console.log('buildMiriContext: 上下文构建完成，长度:', context.length);
    if (context.length === 0) {
        console.warn('buildMiriContext: 上下文为空，可能没有今日占卜数据');
        // 返回默认上下文
        context = '【用户信息】\n用户首次使用\n\n【今日塔罗信息】\n暂无今日占卜\n\n';
    }

    // 镜像句记忆：用于对话理解（不等同于聊天历史/20组对答）
    context += getMiriMirrorMemoryText();

    return context;
}

// 生成每日占卜（包含镜像句）
async function generateDailyReadingWithMirror(userEmotion, tarotCard, moonPhase) {
    try {
        console.log('===== 开始生成每日占卜（含镜像句） =====');
        
        // 1. 生成每日占卜
        console.log('1. 生成每日占卜...');
        const reading = await generateTarotReading(userEmotion, tarotCard, moonPhase);
        console.log('每日占卜生成完成');
        
        // 2. 生成镜像句
        console.log('2. 生成镜像句...');
        const mirrorQuestion = await generateMirrorQuestionForReading(userEmotion, tarotCard, moonPhase);
        console.log('镜像句生成完成:', mirrorQuestion);
        
        // 3. 合并返回
        return {
            ...reading,
            mirrorQuestion: mirrorQuestion
        };
    } catch (error) {
        console.error('生成每日占卜（含镜像句）失败:', error);
        // 如果镜像句生成失败，仍然返回占卜结果
        try {
            const reading = await generateTarotReading(userEmotion, tarotCard, moonPhase);
            return reading;
        } catch (readingError) {
            throw readingError;
        }
    }
}

// 为每日占卜生成镜像句（专门用于每日占卜的镜像句生成）
async function generateMirrorQuestionForReading(userEmotion, tarotCard, moonPhase) {
    try {
        // 构建简化的上下文
        const context = `【用户当前状态】
情绪状态：${userEmotion}

【今日塔罗信息】
塔罗牌：${tarotCard.name} (${tarotCard.nameCn})
月相：${moonPhase.nameCn} (${moonPhase.name})
`;

        const userPrompt = `${context}
【任务】
基于以上今日信息，生成一个镜像句问题，帮助用户进行自我觉察。

镜像句应该：
- 与今日塔罗和用户状态相关
- 能够引发有意义的思考
- 问题：15-25字
- 3个选项：每个选项10-15字

请直接返回 JSON 格式（不要有其他文字）：
{
  "question": "问题文本",
  "options": [
    "选项A",
    "选项B",
    "选项C"
  ]
}`;

        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    { role: 'system', content: MIRI_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // 清理可能的 markdown 代码块标记
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // 解析 JSON
        const mirrorData = JSON.parse(content);
        return mirrorData;
    } catch (error) {
        console.error('生成镜像句失败:', error);
        // 返回默认镜像句
        return {
            question: "在女祭司的守护中，你的心中，哪个更像你？",
            options: [
                "我怕白费力气",
                "我怕做错导致更糟",
                "我其实是没力气了"
            ]
        };
    }
}

// 生成镜像句问题（用于 Miri 聊天界面）
async function generateMirrorQuestion() {
    try {
        console.log('buildMiriContext 开始...');
        const context = buildMiriContext();
        console.log('上下文构建完成:', context.substring(0, 100) + '...');
        
        const userPrompt = `${context}
【任务】
基于以上今日信息，生成一个镜像句问题，帮助用户进行自我觉察。

镜像句应该：
- 与今日塔罗和用户状态相关
- 能够引发有意义的思考
- 问题：15-25字
- 3个选项：每个选项10-15字

请直接返回 JSON 格式（不要有其他文字）：
{
  "question": "问题文本",
  "options": [
    "选项A",
    "选项B",
    "选项C"
  ]
}`;

        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    { role: 'system', content: MIRI_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // 清理可能的 markdown 代码块标记
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // 解析 JSON
        const mirrorData = JSON.parse(content);
        return mirrorData;
    } catch (error) {
        console.error('生成镜像句失败:', error);
        throw error;
    }
}

// 生成镜像句解读
async function generateMirrorInterpretation(question, options, selectedOption) {
    try {
        const context = buildMiriContext();
        
        const userPrompt = `${context}
【镜像句问题】
问题：${question}
选项：${options.join(', ')}
用户选择：${selectedOption}

请以 Miri 的口吻生成针对用户选择的解读：
- **120 字以内（严格）**
- 共情、温柔、命中，不刻意多说
- 不要使用标题、不要分点、不要带引号
- 直接输出纯文本（不要 JSON / markdown）`;

        // 显示加载状态
        showMiriLoading();
        
        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    { role: 'system', content: MIRI_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        // 流式输出
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        
        // 隐藏加载状态
        hideMiriLoading();
        
        // 创建 Miri 消息容器
        const messageDiv = appendMiriMessage('', false);
        const contentDiv = messageDiv.querySelector('.miri-message-content');
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices[0].delta.content;
                        if (delta) {
                            fullResponse += delta;
                            // 逐字显示
                            for (let i = 0; i < delta.length; i++) {
                                await new Promise(resolve => setTimeout(resolve, 40));
                                contentDiv.textContent = fullResponse.substring(0, fullResponse.length);
                                scrollToBottom();
                            }
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }
        
        // 兜底：镜像句解析最多 120 字
        if (fullResponse && fullResponse.length > 120) {
            fullResponse = fullResponse.slice(0, 120);
            if (contentDiv) contentDiv.textContent = fullResponse;
        }

        return fullResponse;
    } catch (error) {
        console.error('生成镜像句解读失败:', error);
        hideMiriLoading();
        throw error;
    }
}

// 生成 Miri 回复（流式输出）
async function generateMiriResponseStreaming(userMessage) {
    try {
        const context = buildMiriContext();
        
        // 构建对话历史
        let conversationHistory = '';
        if (typeof currentChatHistory !== 'undefined' && currentChatHistory.length > 0) {
            // 只取最近的对话（避免太长）
            const recentHistory = currentChatHistory.slice(-20);
            conversationHistory = recentHistory.map(msg => {
                if (msg.role === 'user') {
                    return `用户：${msg.content}`;
                } else if (msg.role === 'miri') {
                    return `Miri：${msg.content}`;
                }
                return '';
            }).filter(s => s).join('\n');
        }
        
        const userPrompt = `${context}
【对话历史】
${conversationHistory}

【用户当前消息】
${userMessage}

请基于以上信息，以 Miri 的身份回复用户。

硬性要求：
- **20-60 字中文（严格）**
- 不追求刻意多说，而是寻求共情、温柔、命中
- 不要使用标题、不要分点、不要带引号
- 直接输出纯文本（不要 JSON / markdown）`;

        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    { role: 'system', content: MIRI_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8,
                stream: true
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        // 流式输出
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullResponse = '';
        
        // 隐藏加载状态
        hideMiriLoading();
        
        // 创建 Miri 消息容器
        const messageDiv = appendMiriMessage('', false);
        const contentDiv = messageDiv.querySelector('.miri-message-content');
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;
                    
                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed.choices[0].delta.content;
                        if (delta) {
                            fullResponse += delta;
                            // 逐字显示（30-50ms 延迟）
                            for (let i = 0; i < delta.length; i++) {
                                await new Promise(resolve => setTimeout(resolve, 40));
                                contentDiv.textContent = fullResponse.substring(0, fullResponse.length);
                                scrollToBottom();
                            }
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }
        
        // 兜底：普通聊天最多 60 字（过短不强行补字）
        if (fullResponse && fullResponse.length > 60) {
            fullResponse = fullResponse.slice(0, 60);
            if (contentDiv) contentDiv.textContent = fullResponse;
        }

        // 保存到历史
        addMessageToHistory('miri', fullResponse);
        
        return fullResponse;
    } catch (error) {
        console.error('生成 Miri 回复失败:', error);
        throw error;
    }
}

// 生成话语提示
async function generateSuggestions() {
    try {
        const context = buildMiriContext();
        
        // 构建对话历史
        let conversationHistory = '';
        if (typeof currentChatHistory !== 'undefined' && currentChatHistory.length > 0) {
            const recentHistory = currentChatHistory.slice(-10);
            conversationHistory = recentHistory.map(msg => {
                if (msg.role === 'user') {
                    return `用户：${msg.content}`;
                } else if (msg.role === 'miri') {
                    return `Miri：${msg.content}`;
                }
                return '';
            }).filter(s => s).join('\n');
        }
        
        const userPrompt = `${context}
【当前对话历史】
${conversationHistory}

请生成 3 个用于聊天框上方的引导话题。

硬性要求：
- 每个 **不超过 8 个字（严格）**
- 倾向：对用户状态的共情 + 今日占卜的温柔拓展
- 不要出现标点符号
- 三条不要重复

请直接返回 JSON 格式（不要有其他文字）：
{
  "suggestions": [
    "提示1",
    "提示2",
    "提示3"
  ]
}`;

        const response = await fetch(API_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_CONFIG.apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.model,
                messages: [
                    { role: 'system', content: MIRI_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.8
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        // 清理可能的 markdown 代码块标记
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        
        // 解析 JSON
        const suggestionsData = JSON.parse(content);

        // 兜底：确保 3 条、每条 <= 8 字、去标点
        if (suggestionsData && Array.isArray(suggestionsData.suggestions)) {
            const cleaned = suggestionsData.suggestions
                .slice(0, 3)
                .map(s => (s || '').toString().trim())
                .map(s => s.replace(/[，。！？、,.!?；;：:“”"'\-\s]/g, ''))
                .map(s => (s.length > 8 ? s.slice(0, 8) : s));

            while (cleaned.length < 3) cleaned.push('说说现在');
            suggestionsData.suggestions = cleaned;
        }
        
        // 更新话语提示
        if (typeof updateSuggestions === 'function') {
            updateSuggestions(suggestionsData.suggestions);
        }
        
        return suggestionsData.suggestions;
    } catch (error) {
        console.error('生成话语提示失败:', error);
        // 失败时不更新提示，保持原有内容
        return null;
    }
}

