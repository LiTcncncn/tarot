# LLM Prompt 模板设计

## 🎯 核心要求

### 输入参数
1. **用户选择的情绪状态**（5档之一）：
   - 😊 愉悦
   - 😌 平静
   - 😴 疲惫
   - 🤔 迷茫
   - 😰 焦虑

2. **今日塔罗牌**：
   - 牌名（英文+中文）
   - 牌的基本含义

3. **今日月相**：
   - 月相名称
   - 月相能量描述

### 输出要求
- **一次性生成所有内容**（减少API调用）
- **情绪状态非常重要**：内容要击中用户情绪，给予安慰或建议
- **结合塔罗+月相+情绪状态**，生成个性化内容

---

## 📝 Prompt 模板

### 系统角色 Prompt

```
You are Luna, a wise and gentle tarot reader who specializes in combining tarot wisdom with lunar energy to provide emotional healing and guidance. 

Your style:
- Warm, compassionate, and deeply empathetic
- Able to understand and address users' emotional states with sensitivity
- Focused on providing comfort, encouragement, and actionable insights
- Skilled at combining tarot symbolism with moon phase energy

Guidelines:
1. Always acknowledge and validate the user's current emotional state
2. Provide gentle, supportive guidance that addresses their emotional needs
3. Combine tarot card meanings with moon phase energy naturally
4. Offer practical, actionable suggestions
5. Use a warm, conversational tone that feels like a trusted friend
6. Avoid being too prescriptive or authoritative
```

### 用户 Prompt 模板

```
Please provide a comprehensive daily tarot reading based on the following information:

【User's Emotional State】
[USER_EMOTION]

【Today's Tarot Card】
Card Name: [TAROT_CARD_NAME]
Card Meaning: [TAROT_CARD_MEANING]

【Today's Moon Phase】
Moon Phase: [MOON_PHASE_NAME]
Moon Energy: [MOON_PHASE_ENERGY]

---

Please generate ALL of the following content in ONE response, formatted as JSON:

{
  "guidance_one_line": "A single line of comprehensive guidance (within 40 Chinese characters), focusing on overall energy and direction, NOT specific to any particular life area (emotions, work, etc.). This should be a gentle, encouraging message that combines tarot and moon energy.",
  
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
  
  "category_guidances": {
    "情感": "Detailed guidance for emotions/love (within 60 Chinese characters), specifically addressing the user's emotional state and providing comfort or suggestions.",
    "工作": "Detailed guidance for work/career (within 60 Chinese characters), considering the user's emotional state and moon phase energy.",
    "学习": "Detailed guidance for study/learning (within 60 Chinese characters), tailored to the user's current state.",
    "生活": "Detailed guidance for daily life (within 60 Chinese characters), providing practical suggestions.",
    "家庭": "Detailed guidance for family (within 60 Chinese characters), considering emotional needs."
  },
  
  "lucky_elements": {
    "lucky_color": "A specific color name (e.g., '柔和的薰衣草紫', '温暖的金色')",
    "lucky_accessory": "A specific accessory suggestion (e.g., '水晶手链', '简约的银饰')",
    "lucky_number": "A number (e.g., 7, 14, 21)",
    "lucky_decoration": "A decoration/object suggestion (e.g., '小型绿植', '香薰蜡烛')"
  }
}

【Important Instructions】

1. **Emotional State Integration**: 
   - If the user feels [EMOTION_DESCRIPTION], acknowledge their feelings with empathy
   - Provide comfort and reassurance that addresses their emotional needs
   - Offer gentle suggestions to help them navigate their current state
   - Make them feel understood and supported

2. **Content Tone**:
   - Be warm, gentle, and encouraging
   - Validate their emotions while offering hope
   - Use language that feels like a caring friend, not a distant oracle

3. **Combination Logic**:
   - Naturally weave together tarot meaning + moon phase energy + emotional state
   - Don't list them separately, but integrate them organically
   - Make the guidance feel personalized and relevant

4. **Length Requirements**:
   - guidance_one_line: Exactly within 40 Chinese characters
   - healing_task: One simple, actionable task (20 sec - 2 min)
   - two_guidances: Each within 80 Chinese characters
   - category_guidances: Each within 60 Chinese characters

5. **Category Selection for two_guidances**:
   - Choose the 2 most relevant categories based on the tarot card, moon phase, and user's emotional state
   - Make the selection feel natural and meaningful

6. **Lucky Elements**:
   - Choose elements that resonate with today's energy and the user's emotional needs
   - Make them feel meaningful and personalized

Please respond ONLY with valid JSON, no additional text.
```

---

## 🔄 Prompt 填充逻辑

### 变量替换

```dart
String buildPrompt({
  required String userEmotion,
  required String tarotCardName,
  required String tarotCardMeaning,
  required String moonPhaseName,
  required String moonPhaseEnergy,
}) {
  // 情绪状态描述映射
  final emotionDescriptions = {
    '愉悦': 'happy and positive',
    '平静': 'calm and balanced',
    '疲惫': 'tired and low-energy',
    '迷茫': 'confused and uncertain',
    '焦虑': 'anxious and worried',
  };
  
  final emotionDescription = emotionDescriptions[userEmotion] ?? userEmotion;
  
  // 替换模板中的变量
  return promptTemplate
      .replaceAll('[USER_EMOTION]', userEmotion)
      .replaceAll('[TAROT_CARD_NAME]', tarotCardName)
      .replaceAll('[TAROT_CARD_MEANING]', tarotCardMeaning)
      .replaceAll('[MOON_PHASE_NAME]', moonPhaseName)
      .replaceAll('[MOON_PHASE_ENERGY]', moonPhaseEnergy)
      .replaceAll('[EMOTION_DESCRIPTION]', emotionDescription);
}
```

---

## 📋 情绪状态处理策略

### 针对不同情绪状态的提示词增强

#### 愉悦 😊
```
The user is feeling happy and positive. Build on their positive energy, 
encourage them to channel this energy productively, and suggest ways 
to maintain or share this positive state. Offer guidance that helps 
them make the most of this good energy.
```

#### 平静 😌
```
The user is feeling calm and balanced. Acknowledge their centered state, 
suggest ways to deepen this sense of peace, and provide guidance that 
helps them maintain this balance while moving forward with clarity.
```

#### 疲惫 😴
```
The user is feeling tired and low-energy. This is CRITICAL - they need 
gentle understanding, permission to rest, and compassionate guidance. 
Emphasize self-care, rest, and small, manageable steps. Avoid overwhelming 
suggestions. Make them feel it's okay to slow down.
```

#### 迷茫 🤔
```
The user is feeling confused and uncertain. They need clarity and gentle 
direction. Offer reassurance that confusion is part of growth, provide 
simple, clear guidance, and help them see a path forward. Make them feel 
understood and less alone in their uncertainty.
```

#### 焦虑 😰
```
The user is feeling anxious and worried. This is CRITICAL - they need 
immediate comfort, reassurance, and calming guidance. Focus on grounding 
techniques, remind them they are safe, and offer gentle suggestions to 
ease their anxiety. Use calming, soothing language. Make them feel supported 
and less overwhelmed.
```

---

## 🎨 输出格式示例

### JSON 结构

```json
{
  "guidance_one_line": "今日专注于发挥创造力与领导力，通过合作和聆听提升能量，轻轻放下过度自信的倾向。",
  "healing_task": "* 注视远方一座塔楼 20 秒",
  "two_guidances": [
    {
      "category": "情感",
      "guidance": "在关系中保持开放和倾听，避免过度敏感。今日适合与重要的人分享你的想法，但要注意平衡表达与倾听。"
    },
    {
      "category": "工作",
      "guidance": "在团队合作中发挥领导力，但要注意平衡。今日适合主动承担责任，同时也要学会信任和依赖他人。"
    }
  ],
  "category_guidances": {
    "情感": "今日在情感关系中保持开放心态，通过真诚沟通加深连接。如果你感到焦虑，先给自己一些空间，再与对方分享你的感受。",
    "工作": "工作上展现你的能力和领导力，但避免独断专行。如果感到疲惫，适当分担责任，相信团队的力量。",
    "学习": "学习上保持专注和耐心，不要急于求成。如果感到迷茫，可以回到基础，重新梳理知识结构。",
    "生活": "生活中保持平衡，给工作和休息都留出时间。如果感到疲惫，优先照顾好自己的身体和情绪。",
    "家庭": "家庭中保持沟通和理解，分享你的想法和感受。如果感到焦虑，先处理好自己的情绪，再与家人交流。"
  },
  "lucky_elements": {
    "lucky_color": "柔和的薰衣草紫",
    "lucky_accessory": "简约的银饰",
    "lucky_number": 7,
    "lucky_decoration": "小型绿植"
  }
}
```

---

## 🔧 实现代码示例

### Dart 服务类

```dart
// lib/services/tarot_reading_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';
import '../models/daily_reading.dart';

class TarotReadingService {
  final String apiKey = EnvConfig.deepseekApiKey;
  final String apiUrl = EnvConfig.deepseekApiUrl;
  final String model = EnvConfig.deepseekModel;
  
  Future<DailyReading> generateDailyReading({
    required String userEmotion,
    required String tarotCardName,
    required String tarotCardMeaning,
    required String moonPhaseName,
    required String moonPhaseEnergy,
  }) async {
    // 构建 prompt
    final prompt = _buildPrompt(
      userEmotion: userEmotion,
      tarotCardName: tarotCardName,
      tarotCardMeaning: tarotCardMeaning,
      moonPhaseName: moonPhaseName,
      moonPhaseEnergy: moonPhaseEnergy,
    );
    
    // 调用 API
    final response = await http.post(
      Uri.parse(apiUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: jsonEncode({
        'model': model,
        'messages': [
          {
            'role': 'system',
            'content': _systemPrompt,
          },
          {
            'role': 'user',
            'content': prompt,
          },
        ],
        'temperature': 0.7,
        'max_tokens': 2000,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final content = data['choices'][0]['message']['content'];
      
      // 解析 JSON 响应
      return _parseResponse(content);
    } else {
      throw Exception('Failed to generate reading: ${response.body}');
    }
  }
  
  String _buildPrompt({
    required String userEmotion,
    required String tarotCardName,
    required String tarotCardMeaning,
    required String moonPhaseName,
    required String moonPhaseEnergy,
  }) {
    // 情绪状态描述映射
    final emotionDescriptions = {
      '愉悦': 'happy and positive',
      '平静': 'calm and balanced',
      '疲惫': 'tired and low-energy',
      '迷茫': 'confused and uncertain',
      '焦虑': 'anxious and worried',
    };
    
    final emotionDescription = emotionDescriptions[userEmotion] ?? userEmotion;
    
    // 加载 prompt 模板并替换变量
    final template = _promptTemplate;
    return template
        .replaceAll('[USER_EMOTION]', userEmotion)
        .replaceAll('[TAROT_CARD_NAME]', tarotCardName)
        .replaceAll('[TAROT_CARD_MEANING]', tarotCardMeaning)
        .replaceAll('[MOON_PHASE_NAME]', moonPhaseName)
        .replaceAll('[MOON_PHASE_ENERGY]', moonPhaseEnergy)
        .replaceAll('[EMOTION_DESCRIPTION]', emotionDescription);
  }
  
  DailyReading _parseResponse(String content) {
    // 移除可能的 markdown 代码块标记
    String jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    jsonStr = jsonStr.trim();
    
    final json = jsonDecode(jsonStr);
    return DailyReading.fromJson(json);
  }
  
  // System prompt
  static const String _systemPrompt = '''
You are Luna, a wise and gentle tarot reader who specializes in combining tarot wisdom with lunar energy to provide emotional healing and guidance. 

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
7. Respond ONLY with valid JSON, no additional text
''';
  
  // User prompt template（完整模板见上方）
  static const String _promptTemplate = '''
Please provide a comprehensive daily tarot reading based on the following information:

【User's Emotional State】
[USER_EMOTION]

【Today's Tarot Card】
Card Name: [TAROT_CARD_NAME]
Card Meaning: [TAROT_CARD_MEANING]

【Today's Moon Phase】
Moon Phase: [MOON_PHASE_NAME]
Moon Energy: [MOON_PHASE_ENERGY]

[... 完整模板内容 ...]
''';
}
```

---

## ⚠️ 注意事项

### 1. JSON 解析错误处理
- LLM 可能返回格式不完整的 JSON
- 需要处理可能的解析错误
- 可以尝试修复常见的 JSON 格式问题

### 2. 字符数限制
- 严格控制在指定字符数内
- 可以在 prompt 中强调这一点
- 必要时在解析后进行字符数校验和截断

### 3. 情绪状态敏感度
- **疲惫**和**焦虑**状态需要特别温柔和关怀
- 避免给这些用户增加压力
- 强调自我照顾和休息的重要性

### 4. 内容质量
- 确保内容不是模板化的
- 每次生成都应该有独特性和相关性
- 测试不同情绪状态下的输出质量

---

## 🧪 测试用例

### 测试场景 1: 焦虑状态 + 高塔牌 + 满月
- 预期：内容应该特别安抚，提供接地气的建议
- 疗愈任务：应该是简单的、能立即执行的任务

### 测试场景 2: 愉悦状态 + 太阳牌 + 新月
- 预期：内容应该鼓励用户利用积极的能量
- 疗愈任务：可以稍微更有挑战性

### 测试场景 3: 疲惫状态 + 隐士牌 + 下弦月
- 预期：内容应该强调休息和自我照顾
- 疗愈任务：应该是非常轻松的，不消耗能量的任务

---

## 📝 后续优化

1. **Prompt 优化**：根据实际输出质量调整 prompt
2. **情绪状态细化**：可以为每个情绪状态添加更详细的描述
3. **错误处理**：完善 JSON 解析的错误处理逻辑
4. **缓存机制**：对于相同输入，可以考虑缓存结果（demo 阶段）

---

**此 Prompt 模板将在实际使用中根据输出质量进行迭代优化。**



