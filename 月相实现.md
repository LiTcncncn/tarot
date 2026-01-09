# 月相数据实现代码示例

## 📦 Flutter 包搜索

### 步骤1: 搜索可用包

在 pub.dev 上搜索以下关键词：
- `moon phase`
- `lunar phase`
- `moon calculation`
- `astronomy`

**搜索命令**：
```bash
flutter pub search moon
```

### 步骤2: 检查可用包

如果找到合适的包，在 `pubspec.yaml` 中添加：
```yaml
dependencies:
  moon_phase: ^x.x.x  # 替换为实际包名和版本
```

---

## 🔧 方案一：使用现有 Flutter 包（如果存在）

### 示例代码结构

```dart
// lib/services/moon_phase_service.dart
import 'package:moon_phase/moon_phase.dart'; // 假设包名

class MoonPhaseService {
  static MoonPhaseInfo getTodayMoonPhase() {
    final moonPhase = MoonPhase.now();
    return _convertToMoonPhaseInfo(moonPhase);
  }
  
  static MoonPhaseInfo getMoonPhaseForDate(DateTime date) {
    final moonPhase = MoonPhase(date);
    return _convertToMoonPhaseInfo(moonPhase);
  }
  
  static MoonPhaseInfo _convertToMoonPhaseInfo(MoonPhase moonPhase) {
    return MoonPhaseInfo(
      phase: moonPhase.phaseName,
      illumination: moonPhase.illumination,
      emoji: _getMoonPhaseEmoji(moonPhase.illumination),
      energy: _getMoonPhaseEnergy(moonPhase.phaseName),
    );
  }
  
  // ... 其他方法
}
```

---

## 🔧 方案二：自己实现月相计算（推荐备选）

如果 Flutter 包不可用，可以自己实现月相计算算法。

### 月相计算算法

基于 Julian Day 和天文算法：

```dart
// lib/services/moon_phase_calculator.dart

class MoonPhaseCalculator {
  // 计算月相（返回0-1之间的值，0=新月，0.5=满月）
  static double calculateMoonPhase(DateTime date) {
    // 转换为 Julian Day
    final jd = _toJulianDay(date);
    
    // 计算自2000年1月1日12:00 UTC以来的天数
    final daysSinceEpoch = jd - 2451545.0;
    
    // 计算月相周期（29.53058867天）
    final moonCycle = 29.53058867;
    
    // 计算月相（0-1之间）
    final phase = (daysSinceEpoch / moonCycle) % 1.0;
    
    return phase;
  }
  
  // 转换为 Julian Day
  static double _toJulianDay(DateTime date) {
    final year = date.year;
    final month = date.month;
    final day = date.day;
    final hour = date.hour;
    final minute = date.minute;
    final second = date.second;
    
    if (month <= 2) {
      final year2 = year - 1;
      final month2 = month + 12;
      return _julianDay(year2, month2, day, hour, minute, second);
    }
    return _julianDay(year, month, day, hour, minute, second);
  }
  
  static double _julianDay(int year, int month, int day, int hour, int minute, int second) {
    final a = (14 - month) ~/ 12;
    final y = year + 4800 - a;
    final m = month + 12 * a - 3;
    
    final jdn = day + 
        (153 * m + 2) ~/ 5 + 
        365 * y + 
        y ~/ 4 - 
        y ~/ 100 + 
        y ~/ 400 - 
        32045;
    
    final jd = jdn + (hour - 12) / 24.0 + minute / 1440.0 + second / 86400.0;
    return jd;
  }
  
  // 获取月相名称
  static String getPhaseName(double phase) {
    if (phase < 0.03 || phase > 0.97) {
      return 'New Moon';
    } else if (phase < 0.22) {
      return 'Waxing Crescent';
    } else if (phase < 0.28) {
      return 'First Quarter';
    } else if (phase < 0.47) {
      return 'Waxing Gibbous';
    } else if (phase < 0.53) {
      return 'Full Moon';
    } else if (phase < 0.72) {
      return 'Waning Gibbous';
    } else if (phase < 0.78) {
      return 'Last Quarter';
    } else {
      return 'Waning Crescent';
    }
  }
  
  // 获取月相照明度（0-1）
  static double getIllumination(double phase) {
    // 简化计算：基于相位计算照明度
    if (phase < 0.5) {
      // 渐盈：0 -> 1
      return phase * 2;
    } else {
      // 渐亏：1 -> 0
      return (1 - phase) * 2;
    }
  }
}
```

### 完整的月相服务类

```dart
// lib/services/moon_phase_service.dart
import 'moon_phase_calculator.dart';

class MoonPhaseInfo {
  final String phase;
  final double illumination;
  final String emoji;
  final String energy;
  final String description;
  
  MoonPhaseInfo({
    required this.phase,
    required this.illumination,
    required this.emoji,
    required this.energy,
    required this.description,
  });
  
  Map<String, dynamic> toJson() {
    return {
      'phase': phase,
      'illumination': illumination,
      'emoji': emoji,
      'energy': energy,
      'description': description,
    };
  }
}

class MoonPhaseService {
  // 获取今日月相
  static MoonPhaseInfo getTodayMoonPhase() {
    return getMoonPhaseForDate(DateTime.now());
  }
  
  // 获取指定日期月相
  static MoonPhaseInfo getMoonPhaseForDate(DateTime date) {
    final phase = MoonPhaseCalculator.calculateMoonPhase(date);
    final phaseName = MoonPhaseCalculator.getPhaseName(phase);
    final illumination = MoonPhaseCalculator.getIllumination(phase);
    
    return MoonPhaseInfo(
      phase: phaseName,
      illumination: illumination,
      emoji: _getMoonPhaseEmoji(phase),
      energy: _getMoonPhaseEnergy(phaseName),
      description: _getMoonPhaseDescription(phaseName),
    );
  }
  
  // 获取月相 Emoji
  static String _getMoonPhaseEmoji(double phase) {
    if (phase < 0.03 || phase > 0.97) return '🌑'; // 新月
    if (phase < 0.22) return '🌒'; // 上弦月渐盈
    if (phase < 0.28) return '🌓'; // 上弦月
    if (phase < 0.47) return '🌔'; // 渐盈凸月
    if (phase < 0.53) return '🌕'; // 满月
    if (phase < 0.72) return '🌖'; // 渐亏凸月
    if (phase < 0.78) return '🌗'; // 下弦月
    return '🌘'; // 下弦月渐亏
  }
  
  // 获取月相能量描述（用于与塔罗牌结合）
  static String _getMoonPhaseEnergy(String phaseName) {
    switch (phaseName.toLowerCase()) {
      case 'new moon':
        return 'New Beginnings';
      case 'waxing crescent':
        return 'Growth & Action';
      case 'first quarter':
        return 'Challenges & Decisions';
      case 'waxing gibbous':
        return 'Refinement & Adjustment';
      case 'full moon':
        return 'Clarity & Release';
      case 'waning gibbous':
        return 'Gratitude & Sharing';
      case 'last quarter':
        return 'Forgiveness & Letting Go';
      case 'waning crescent':
        return 'Rest & Reflection';
      default:
        return 'Transformation';
    }
  }
  
  // 获取月相详细描述
  static String _getMoonPhaseDescription(String phaseName) {
    switch (phaseName.toLowerCase()) {
      case 'new moon':
        return 'A time for setting intentions and planting seeds for the future.';
      case 'waxing crescent':
        return 'Take action on your goals and build momentum.';
      case 'first quarter':
        return 'Face challenges with courage and make important decisions.';
      case 'waxing gibbous':
        return 'Refine your plans and make necessary adjustments.';
      case 'full moon':
        return 'A time of clarity, completion, and releasing what no longer serves you.';
      case 'waning gibbous':
        return 'Express gratitude and share your wisdom with others.';
      case 'last quarter':
        return 'Forgive, let go, and release old patterns.';
      case 'waning crescent':
        return 'Rest, reflect, and prepare for the next cycle.';
      default:
        return 'A time of transformation and change.';
    }
  }
  
  // 获取本周月相列表（用于周总结）
  static List<MoonPhaseInfo> getWeekMoonPhases(DateTime startDate) {
    final phases = <MoonPhaseInfo>[];
    for (int i = 0; i < 7; i++) {
      final date = startDate.add(Duration(days: i));
      phases.add(getMoonPhaseForDate(date));
    }
    return phases;
  }
  
  // 获取本月月相列表（用于月总结）
  static List<MoonPhaseInfo> getMonthMoonPhases(DateTime month) {
    final phases = <MoonPhaseInfo>[];
    final firstDay = DateTime(month.year, month.month, 1);
    final lastDay = DateTime(month.year, month.month + 1, 0);
    
    for (int i = 0; i <= lastDay.difference(firstDay).inDays; i++) {
      final date = firstDay.add(Duration(days: i));
      phases.add(getMoonPhaseForDate(date));
    }
    return phases;
  }
}
```

---

## 🔧 方案三：使用 JavaScript 库（通过 WebView）

如果 Dart 实现太复杂，可以考虑使用成熟的 JavaScript 库。

### 使用 SunCalc.js

1. **添加 WebView 依赖**：
```yaml
dependencies:
  webview_flutter: ^4.0.0
```

2. **创建 HTML 页面**（包含 SunCalc.js）：
```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.js"></script>
</head>
<body>
  <script>
    // 计算月相
    function getMoonPhase(date) {
      const moonIllumination = SunCalc.getMoonIllumination(date);
      return {
        phase: moonIllumination.phase,
        fraction: moonIllumination.fraction,
        angle: moonIllumination.angle
      };
    }
    
    // 接收 Flutter 消息
    window.addEventListener('flutterMessage', function(event) {
      const data = JSON.parse(event.detail);
      const moonPhase = getMoonPhase(new Date(data.date));
      // 发送回 Flutter
      window.flutter_inappwebview.callHandler('moonPhaseResult', moonPhase);
    });
  </script>
</body>
</html>
```

3. **Flutter 调用**：
```dart
// 使用 webview_flutter 加载 HTML 并通信
```

**注意**：这种方法会增加应用体积，且需要网络连接加载 JavaScript 库。

---

## 🎨 UI 集成示例

### 在每日运势中显示月相

```dart
// lib/features/daily_reading/widgets/moon_phase_card.dart
import 'package:flutter/material.dart';
import '../../services/moon_phase_service.dart';

class MoonPhaseCard extends StatelessWidget {
  final MoonPhaseInfo moonPhase;
  
  const MoonPhaseCard({Key? key, required this.moonPhase}) : super(key: key);
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  moonPhase.emoji,
                  style: TextStyle(fontSize: 32),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        moonPhase.phase,
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        moonPhase.energy,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              moonPhase.description,
              style: TextStyle(fontSize: 14),
            ),
            SizedBox(height: 8),
            LinearProgressIndicator(
              value: moonPhase.illumination,
              backgroundColor: Colors.grey[200],
            ),
            SizedBox(height: 4),
            Text(
              '${(moonPhase.illumination * 100).toStringAsFixed(0)}% illuminated',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## ✅ 测试建议

### 单元测试

```dart
// test/services/moon_phase_service_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:tarot_mirror/services/moon_phase_service.dart';

void main() {
  group('MoonPhaseService', () {
    test('should return moon phase for today', () {
      final moonPhase = MoonPhaseService.getTodayMoonPhase();
      expect(moonPhase.phase, isNotEmpty);
      expect(moonPhase.illumination, greaterThanOrEqualTo(0));
      expect(moonPhase.illumination, lessThanOrEqualTo(1));
    });
    
    test('should return moon phase for specific date', () {
      final date = DateTime(2024, 1, 15);
      final moonPhase = MoonPhaseService.getMoonPhaseForDate(date);
      expect(moonPhase.phase, isNotEmpty);
    });
  });
}
```

---

## 📝 注意事项

1. **时区处理**：确保使用 UTC 时间进行月相计算，然后转换为用户本地时区显示
2. **精度验证**：对比多个来源验证计算结果的准确性
3. **性能优化**：缓存当日月相结果，避免重复计算
4. **国际化**：月相名称和描述需要多语言支持

---

## 🔗 参考资源

- **月相计算算法**：https://en.wikipedia.org/wiki/Lunar_phase
- **Julian Day 计算**：https://en.wikipedia.org/wiki/Julian_day
- **SunCalc.js**：https://github.com/mourner/suncalc
- **Flutter WebView**：https://pub.dev/packages/webview_flutter

---

**建议优先尝试自己实现（方案二），算法相对简单，且完全可控。**



