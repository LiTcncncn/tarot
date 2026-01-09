# API 配置管理文档

## 🔑 API Key 管理

### 重要安全提示 ⚠️

**⚠️ 不要将 API Key 提交到代码仓库！**

- 使用环境变量或配置文件
- 将 `.env` 文件添加到 `.gitignore`
- 生产环境使用安全的密钥管理服务

---

## 🤖 DeepSeek API 配置

### Demo 阶段配置

**API Key**: `sk-323a526d56bd486fa26d1f4bcd63c564`

**API 端点**: 
- 官方 API: `https://api.deepseek.com/v1/chat/completions`
- 或根据 DeepSeek 官方文档的最新端点

**模型**: 
- `deepseek-chat` (对话模型)
- 或根据 DeepSeek 提供的模型名称

---

## 📝 配置方式

### 方式一：环境变量（推荐）

#### 1. 创建 `.env` 文件（项目根目录）

```env
# DeepSeek API 配置
DEEPSEEK_API_KEY=sk-323a526d56bd486fa26d1f4bcd63c564
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat

# OpenAI API 配置（后续添加）
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API 配置（后续添加）
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2. 添加到 `.gitignore`

```gitignore
# 环境变量文件
.env
.env.local
.env.*.local

# API Keys
config/secrets.dart
```

#### 3. 创建 `.env.example`（示例文件，可提交到仓库）

```env
# DeepSeek API 配置
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_MODEL=deepseek-chat

# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key_here

# Gemini API 配置
GEMINI_API_KEY=your_gemini_api_key_here
```

---

### 方式二：Flutter 配置类

#### 创建配置类

```dart
// lib/config/api_config.dart
class ApiConfig {
  // DeepSeek API
  static const String deepseekApiKey = String.fromEnvironment(
    'DEEPSEEK_API_KEY',
    defaultValue: 'sk-323a526d56bd486fa26d1f4bcd63c564', // Demo 阶段默认值
  );
  
  static const String deepseekApiUrl = String.fromEnvironment(
    'DEEPSEEK_API_URL',
    defaultValue: 'https://api.deepseek.com/v1/chat/completions',
  );
  
  static const String deepseekModel = String.fromEnvironment(
    'DEEPSEEK_MODEL',
    defaultValue: 'deepseek-chat',
  );
  
  // OpenAI API（后续添加）
  static const String openaiApiKey = String.fromEnvironment(
    'OPENAI_API_KEY',
    defaultValue: '',
  );
  
  // Gemini API（后续添加）
  static const String geminiApiKey = String.fromEnvironment(
    'GEMINI_API_KEY',
    defaultValue: '',
  );
}
```

#### 使用方式

```bash
# 开发时传入环境变量
flutter run --dart-define=DEEPSEEK_API_KEY=sk-323a526d56bd486fa26d1f4bcd63c564

# 或使用 .env 文件（需要 flutter_dotenv 包）
```

---

### 方式三：使用 flutter_dotenv 包（推荐用于 Flutter）

#### 1. 安装包

```yaml
# pubspec.yaml
dependencies:
  flutter_dotenv: ^5.1.0
```

#### 2. 配置文件

```dart
// lib/config/env_config.dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  // DeepSeek API
  static String get deepseekApiKey => 
      dotenv.env['DEEPSEEK_API_KEY'] ?? 'sk-323a526d56bd486fa26d1f4bcd63c564';
  
  static String get deepseekApiUrl => 
      dotenv.env['DEEPSEEK_API_URL'] ?? 'https://api.deepseek.com/v1/chat/completions';
  
  static String get deepseekModel => 
      dotenv.env['DEEPSEEK_MODEL'] ?? 'deepseek-chat';
  
  // OpenAI API（后续添加）
  static String get openaiApiKey => 
      dotenv.env['OPENAI_API_KEY'] ?? '';
  
  // Gemini API（后续添加）
  static String get geminiApiKey => 
      dotenv.env['GEMINI_API_KEY'] ?? '';
}

// main.dart 中初始化
Future<void> main() async {
  await dotenv.load(fileName: ".env");
  runApp(MyApp());
}
```

---

## 🔧 DeepSeek API 使用示例

### HTTP 请求示例

```dart
// lib/services/deepseek_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/env_config.dart';

class DeepSeekService {
  final String apiKey;
  final String apiUrl;
  final String model;
  
  DeepSeekService()
      : apiKey = EnvConfig.deepseekApiKey,
        apiUrl = EnvConfig.deepseekApiUrl,
        model = EnvConfig.deepseekModel;
  
  Future<String> generateTarotReading({
    required String tarotCard,
    required String moonPhase,
    String? question,
  }) async {
    // 构建占卜师 prompt
    final systemPrompt = _buildTarotMasterPrompt();
    final userPrompt = _buildUserPrompt(
      tarotCard: tarotCard,
      moonPhase: moonPhase,
      question: question,
    );
    
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
            'content': systemPrompt,
          },
          {
            'role': 'user',
            'content': userPrompt,
          },
        ],
        'temperature': 0.7,
        'max_tokens': 1000,
      }),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['choices'][0]['message']['content'];
    } else {
      throw Exception('Failed to generate reading: ${response.body}');
    }
  }
  
  String _buildTarotMasterPrompt() {
    return '''
You are a wise and gentle tarot reader named Luna, known for your compassionate 
and insightful interpretations. Your style is warm, encouraging, and deeply 
intuitive. You help people understand their inner wisdom through tarot cards 
and lunar energy.

Guidelines:
- Provide gentle, supportive guidance
- Combine tarot symbolism with moon phase energy
- Offer actionable insights
- Use a warm, conversational tone
- Focus on self-growth and healing
''';
  }
  
  String _buildUserPrompt({
    required String tarotCard,
    required String moonPhase,
    String? question,
  }) {
    final basePrompt = '''
Please provide a tarot reading for today:

Tarot Card: $tarotCard
Moon Phase: $moonPhase
''';
    
    if (question != null) {
      return basePrompt + '\nUser Question: $question';
    }
    
    return basePrompt + '\nProvide a daily guidance reading combining the tarot card meaning with the moon phase energy.';
  }
}
```

---

## 🎭 多占卜师 Prompt 设计

### DeepSeek 占卜师 - "Luna"（温柔型）

```dart
String getLunaPrompt() {
  return '''
You are Luna, a gentle and intuitive tarot reader. Your style is:
- Warm and compassionate
- Focused on emotional healing
- Encouraging and supportive
- Deeply intuitive and empathetic

Your interpretations are gentle, helping users feel understood and supported.
You emphasize self-care and emotional well-being.
''';
}
```

### ChatGPT 占卜师 - "Sage"（理性型）（后续添加）

```dart
String getSagePrompt() {
  return '''
You are Sage, a wise and analytical tarot reader. Your style is:
- Clear and structured
- Practical and actionable
- Logical yet insightful
- Focused on growth and solutions

Your interpretations are thoughtful, helping users understand patterns 
and make informed decisions.
''';
}
```

### Gemini 占卜师 - "Mystic"（神秘型）（后续添加）

```dart
String getMysticPrompt() {
  return '''
You are Mystic, a mystical and poetic tarot reader. Your style is:
- Deep and symbolic
- Poetic and metaphorical
- Intuitive and visionary
- Connecting to universal wisdom

Your interpretations are profound, helping users connect with deeper 
spiritual insights and archetypal patterns.
''';
}
```

---

## 🔒 安全最佳实践

### 1. 代码仓库管理

```gitignore
# .gitignore
.env
.env.local
.env.*.local
**/secrets.dart
**/api_keys.dart
config/secrets/
```

### 2. 生产环境

- 使用密钥管理服务（AWS Secrets Manager、Azure Key Vault 等）
- 后端代理 API 请求（不直接在前端暴露 API key）
- 实施 API 使用限制和监控

### 3. 成本控制

- 设置 API 使用上限
- 监控 token 消耗
- 实施请求频率限制

---

## 📊 API 使用监控

### 建议添加的监控指标

- 每日 API 调用次数
- Token 消耗统计
- 错误率
- 响应时间
- 成本统计

---

## 🔄 后续扩展

### Phase 1: Demo 阶段
- ✅ DeepSeek API（已配置）

### Phase 2: 多占卜师
- [ ] ChatGPT API 配置
- [ ] Gemini API 配置
- [ ] 占卜师选择功能

### Phase 3: 生产环境
- [ ] 后端代理实现
- [ ] 密钥管理服务
- [ ] API 使用监控

---

## 📝 更新日志

- 2024-XX-XX: Demo 阶段使用 DeepSeek API key 配置
- 后续: 添加其他 LLM API 配置

---

**⚠️ 重要提醒**：此 API key 仅用于 demo 阶段，生产环境请使用安全的密钥管理方案！



