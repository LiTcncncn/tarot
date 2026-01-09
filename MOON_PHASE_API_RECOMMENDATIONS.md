# 月相数据 API 建议方案

## 📋 需求分析

### 功能需求
- 获取每日月相信息（新月、上弦月、满月、下弦月等）
- 支持全球任意位置（面向全球市场）
- 月相能量解读（结合塔罗牌）
- 历史月相数据（用于周/月总结）

### 技术要求
- **前端框架**：Flutter（跨平台）
- **数据更新频率**：每日一次即可
- **数据准确性**：高精度
- **成本考虑**：优先考虑免费或低成本方案

---

## 🎯 推荐方案对比

### 方案一：本地计算（推荐 ⭐⭐⭐⭐⭐）

#### 优势
- ✅ **完全免费**：无API调用成本
- ✅ **无网络依赖**：离线可用
- ✅ **数据准确**：基于天文算法
- ✅ **隐私友好**：无需用户位置数据
- ✅ **响应快速**：本地计算，无延迟

#### 实现方式

**Flutter 插件推荐**：

1. **`suncalc`** (Dart/Flutter)
   - GitHub: https://github.com/tylerjlawson/suncalc
   - 功能：计算太阳和月亮位置、月相
   - 使用简单，轻量级

2. **`moon_phase`** (Dart Package)
   - pub.dev: https://pub.dev/packages/moon_phase
   - 专门用于月相计算
   - 支持多种月相表示方式

3. **`flutter_moon_phase`**
   - 可能存在的Flutter专用包
   - 需要搜索 pub.dev

**JavaScript/Web 方案（如果使用WebView）**：
- **SunCalc.js**: https://github.com/mourner/suncalc
- **MoonCalc.js**: 基于SunCalc扩展

#### 代码示例（Dart/Flutter）

```dart
// 使用 moon_phase 包
import 'package:moon_phase/moon_phase.dart';

// 获取今日月相
MoonPhase moonPhase = MoonPhase.now();
String phaseName = moonPhase.phaseName; // "New Moon", "First Quarter", etc.
double illumination = moonPhase.illumination; // 0.0 - 1.0

// 获取指定日期月相
DateTime date = DateTime(2024, 1, 15);
MoonPhase moonPhase = MoonPhase(date);
```

#### 月相阶段定义
- **New Moon（新月）**: 0% 照明
- **Waxing Crescent（上弦月渐盈）**: 0-50% 照明
- **First Quarter（上弦月）**: 50% 照明
- **Waxing Gibbous（渐盈凸月）**: 50-100% 照明
- **Full Moon（满月）**: 100% 照明
- **Waning Gibbous（渐亏凸月）**: 100-50% 照明
- **Last Quarter（下弦月）**: 50% 照明
- **Waning Crescent（下弦月渐亏）**: 50-0% 照明

#### 成本
- **完全免费**
- 无API调用限制

#### 推荐指数
⭐⭐⭐⭐⭐ **强烈推荐**

---

### 方案二：第三方 API（备选）

#### 选项 A: 彩云天气 API（中文区）

**API 信息**：
- 文档：https://open.caiyunapp.com/月升月落月相接口
- 需要注册并获取开发者 token
- 需要联系商务开通权限

**特点**：
- ✅ 提供月升、月落时间
- ✅ 提供月相信息
- ❌ 主要面向中文市场
- ❌ 需要商务开通，可能收费

**适用场景**：
- 如果主要服务中文区用户
- 需要月升月落时间（不仅仅是月相）

---

#### 选项 B: 心知天气 API

**API 信息**：
- 文档：https://docs.seniverse.com/api/geo/moon.html
- 支持全球各地
- 最多查询15天的数据

**特点**：
- ✅ 支持全球位置
- ✅ 提供月出、月落时间
- ✅ 提供月相信息
- ❌ 需要注册和API密钥
- ❌ 可能有使用限制

**适用场景**：
- 需要月升月落时间
- 需要历史数据查询

---

#### 选项 C: 自建后端服务

**实现方式**：
- 后端使用 Python + PyEphem 或 AstroPy 计算月相
- 提供 REST API 给 Flutter 前端调用
- 可以缓存计算结果，减少计算负载

**优势**：
- ✅ 完全控制
- ✅ 可以添加自定义逻辑
- ✅ 可以缓存数据

**劣势**：
- ❌ 需要维护后端服务
- ❌ 增加服务器成本

---

## 🚀 推荐实现方案

### 最终推荐：本地计算 + 后端缓存（混合方案）

#### 架构设计

```
Flutter App
    ↓
本地计算月相（moon_phase包）
    ↓
显示月相信息
    ↓
（可选）同步到后端
    ↓
后端存储用户月相记录（用于周/月总结）
```

#### 实现步骤

1. **Flutter 端（主要）**
   ```dart
   // 使用 moon_phase 包进行本地计算
   // 每日自动计算，无需网络请求
   ```

2. **后端（可选，用于数据聚合）**
   ```python
   # 使用 PyEphem 或 AstroPy 验证数据
   # 存储用户月相记录，用于生成周/月总结
   ```

#### 为什么推荐这个方案？

1. **成本最优**：本地计算完全免费
2. **用户体验好**：离线可用，响应快速
3. **隐私友好**：不需要用户位置（月相全球相同）
4. **技术简单**：Flutter 包集成简单
5. **可扩展**：后续可以添加后端缓存和数据分析

---

## 📦 具体实现建议

### Step 1: 安装 Flutter 包

在 `pubspec.yaml` 中添加：

```yaml
dependencies:
  moon_phase: ^0.1.0  # 或最新版本
  # 或者
  # suncalc: ^1.0.0
```

### Step 2: 创建月相服务类

```dart
// lib/services/moon_phase_service.dart
import 'package:moon_phase/moon_phase.dart';

class MoonPhaseService {
  // 获取今日月相
  static MoonPhaseInfo getTodayMoonPhase() {
    final moonPhase = MoonPhase.now();
    return MoonPhaseInfo(
      phase: moonPhase.phaseName,
      illumination: moonPhase.illumination,
      emoji: _getMoonPhaseEmoji(moonPhase),
      energy: _getMoonPhaseEnergy(moonPhase),
    );
  }
  
  // 获取指定日期月相
  static MoonPhaseInfo getMoonPhaseForDate(DateTime date) {
    final moonPhase = MoonPhase(date);
    return MoonPhaseInfo(
      phase: moonPhase.phaseName,
      illumination: moonPhase.illumination,
      emoji: _getMoonPhaseEmoji(moonPhase),
      energy: _getMoonPhaseEnergy(moonPhase),
    );
  }
  
  // 获取月相 Emoji
  static String _getMoonPhaseEmoji(MoonPhase moonPhase) {
    final illumination = moonPhase.illumination;
    if (illumination < 0.05) return '🌑'; // 新月
    if (illumination < 0.25) return '🌒'; // 上弦月渐盈
    if (illumination < 0.45) return '🌓'; // 上弦月
    if (illumination < 0.55) return '🌔'; // 渐盈凸月
    if (illumination < 0.75) return '🌕'; // 满月
    if (illumination < 0.95) return '🌖'; // 渐亏凸月
    if (illumination < 0.99) return '🌗'; // 下弦月
    return '🌘'; // 下弦月渐亏
  }
  
  // 获取月相能量描述
  static String _getMoonPhaseEnergy(MoonPhase moonPhase) {
    final phase = moonPhase.phaseName.toLowerCase();
    // 可以根据不同月相返回不同的能量描述
    // 用于与塔罗牌结合分析
    switch (phase) {
      case 'new moon':
        return 'New beginnings, setting intentions';
      case 'waxing crescent':
        return 'Growth, taking action';
      case 'first quarter':
        return 'Challenges, decision making';
      case 'waxing gibbous':
        return 'Refinement, adjustment';
      case 'full moon':
        return 'Clarity, release, completion';
      case 'waning gibbous':
        return 'Gratitude, sharing';
      case 'last quarter':
        return 'Forgiveness, letting go';
      case 'waning crescent':
        return 'Rest, reflection, surrender';
      default:
        return 'Transformation';
    }
  }
}

// 月相信息数据类
class MoonPhaseInfo {
  final String phase;
  final double illumination;
  final String emoji;
  final String energy;
  
  MoonPhaseInfo({
    required this.phase,
    required this.illumination,
    required this.emoji,
    required this.energy,
  });
}
```

### Step 3: 集成到每日运势功能

```dart
// lib/features/daily_reading/daily_reading_service.dart
import '../services/moon_phase_service.dart';

class DailyReadingService {
  Future<DailyReading> getDailyReading() async {
    // 1. 获取今日月相
    final moonPhase = MoonPhaseService.getTodayMoonPhase();
    
    // 2. 抽取塔罗牌
    final tarotCard = await drawTarotCard();
    
    // 3. 结合月相和塔罗牌生成综合解读
    final interpretation = await generateInterpretation(
      tarotCard: tarotCard,
      moonPhase: moonPhase,
    );
    
    return DailyReading(
      tarotCard: tarotCard,
      moonPhase: moonPhase,
      interpretation: interpretation,
    );
  }
}
```

---

## 🔍 备选方案：如果本地计算包不可用

### 使用 JavaScript 库（通过 WebView 或 Dart FFI）

如果 Flutter 的月相包不够完善，可以考虑：

1. **使用 `suncalc` JavaScript 库**
   - 通过 Flutter WebView 调用
   - 或使用 Dart FFI 调用 JavaScript 引擎

2. **自己实现月相算法**
   - 基于天文算法（Julian Day 计算）
   - 参考：https://en.wikipedia.org/wiki/Lunar_phase

---

## 📊 成本对比

| 方案 | 月成本 | API调用限制 | 离线支持 | 推荐度 |
|------|--------|------------|---------|--------|
| 本地计算 | $0 | 无限制 | ✅ | ⭐⭐⭐⭐⭐ |
| 彩云天气 | 未知 | 需商务开通 | ❌ | ⭐⭐ |
| 心知天气 | 未知 | 可能有限制 | ❌ | ⭐⭐⭐ |
| 自建后端 | $5-20/月 | 无限制 | ❌ | ⭐⭐⭐⭐ |

---

## ✅ 最终建议

### 推荐方案：本地计算（moon_phase 包）

**理由**：
1. ✅ **完全免费**，无API成本
2. ✅ **离线可用**，用户体验好
3. ✅ **隐私友好**，不需要用户位置
4. ✅ **技术简单**，Flutter包集成容易
5. ✅ **数据准确**，基于标准天文算法

**实施步骤**：
1. 搜索并测试 `moon_phase` 或类似的 Flutter 包
2. 如果包不存在或不够完善，考虑使用 JavaScript 库（suncalc）
3. 创建月相服务类，封装月相计算逻辑
4. 集成到每日运势功能中
5. （可选）后端存储月相记录，用于周/月总结

---

## 📝 注意事项

1. **时区处理**：确保月相计算使用正确的时区（UTC或用户本地时区）
2. **数据验证**：可以对比多个来源验证月相数据准确性
3. **缓存策略**：可以缓存当日月相，避免重复计算
4. **国际化**：月相名称需要多语言支持（英文、中文等）

---

## 🔗 参考资源

- **Moon Phase Calculation**: https://en.wikipedia.org/wiki/Lunar_phase
- **SunCalc.js**: https://github.com/mourner/suncalc
- **PyEphem**: https://rhodesmill.org/pyephem/
- **AstroPy**: https://www.astropy.org/
- **Flutter Packages**: https://pub.dev/

---

**建议优先尝试本地计算方案，如果遇到问题再考虑API方案。**



