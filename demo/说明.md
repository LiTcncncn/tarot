# Tarot Mirror Web Demo

这是一个用于验证逻辑和可行性的 Web Demo 版本。

## 📁 项目结构

```
demo/
├── index.html              # 主页面
├── css/
│   └── style.css          # 样式文件
├── js/
│   ├── tarot-cards.js     # 塔罗牌数据和抽取逻辑
│   ├── moon-phase.js      # 月相计算
│   ├── storage.js         # 数据存储（localStorage）
│   ├── api.js             # DeepSeek API 调用
│   ├── ui.js              # UI 交互逻辑
│   └── main.js            # 主逻辑入口
├── Cards-png/             # 塔罗牌图片资源
└── README.md              # 说明文档
```

## 🚀 快速开始

### 方法一：直接打开（推荐用于本地测试）

1. 确保 `Cards-png` 文件夹和 `index.html` 在同一目录
2. 直接用浏览器打开 `index.html` 文件

**注意**：由于浏览器的 CORS 策略，直接从文件系统打开可能无法正常调用 API。建议使用方法二。

### 方法二：使用本地服务器（推荐）

#### 使用 Python（Python 3）

```bash
cd demo
python3 -m http.server 8000
```

然后在浏览器访问：`http://localhost:8000`

#### 使用 Node.js (http-server)

```bash
# 安装 http-server（如果还没有）
npm install -g http-server

# 启动服务器
cd demo
http-server -p 8000
```

然后在浏览器访问：`http://localhost:8000`

#### 使用 VS Code Live Server

1. 安装 VS Code 的 "Live Server" 插件
2. 右键点击 `index.html`
3. 选择 "Open with Live Server"

## 🎯 功能验证

### 已实现功能

1. ✅ **每日占卜流程**
   - 选择情绪状态（5档滑动条）
   - 抽取塔罗牌（支持长按和点击）
   - 跳过功能

2. ✅ **主界面展示**
   - 今日月相显示
   - 今日塔罗牌展示
   - 综合指引（LLM 生成）
   - 疗愈任务（可完成）
   - 具体占卜结果（2项）
   - 分类按钮（5个领域，展开/折叠）
   - 幸运元素（颜色、饰品、数字、摆件）

3. ✅ **数据存储**
   - 使用 localStorage 保存每日占卜数据
   - 支持周/月总结数据查询（API 已实现）

4. ✅ **响应式设计**
   - PC 端适配
   - 16:9 移动设备适配
   - 小屏幕优化

## 🔧 核心逻辑

### 月相计算
- 基于 Julian Day 算法
- 本地计算，无需 API
- 每日自动更新

### 塔罗牌抽取
- 基于日期生成固定种子
- 确保每日结果一致
- 支持78张标准塔罗牌

### LLM API 调用
- 使用 DeepSeek API
- 一次性生成所有内容
- JSON 格式输出

### 数据存储
- localStorage 存储每日数据
- 数据结构包含：
  - 情绪状态
  - 塔罗牌信息
  - 月相信息
  - LLM 生成的所有内容
  - 任务完成状态

## 📊 数据格式

存储的数据格式如下：

```javascript
{
  date: "2024-01-15",
  timestamp: "2024-01-15T10:30:00.000Z",
  emotion: "平静",
  card: {
    id: 0,
    name: "The Fool",
    nameCn: "愚者",
    file: "00-TheFool.png"
  },
  moonPhase: {
    phase: 0.5,
    name: "Full Moon",
    nameCn: "满月",
    emoji: "🌕",
    energy: "Clarity, release, completion",
    illumination: 1.0
  },
  reading: {
    guidance_one_line: "...",
    healing_task: "* ...",
    two_guidances: [...],
    category_guidances: {...},
    lucky_elements: {...}
  },
  taskCompleted: false
}
```

## ⚠️ 注意事项

1. **API Key**：当前使用的是 Demo API Key，位于 `js/api.js` 文件中
   - 生产环境请使用后端代理，不要在客户端暴露 API Key

2. **CORS 问题**：直接打开 HTML 文件可能遇到 CORS 错误
   - 必须通过 HTTP 服务器访问

3. **数据持久化**：目前使用 localStorage
   - 浏览器清除数据会丢失
   - 生产环境需要使用后端数据库

4. **图片路径**：确保 `Cards-png` 文件夹与 `index.html` 在同一目录

## 🧪 测试建议

1. **情绪状态测试**
   - 测试所有5个档位的选择
   - 验证滑动条交互

2. **抽牌测试**
   - 测试长按抽牌
   - 测试点击抽牌
   - 验证每日抽牌结果是否一致

3. **API 调用测试**
   - 验证 LLM 生成的内容质量
   - 检查 JSON 解析是否正确
   - 测试不同情绪状态下的内容差异

4. **数据存储测试**
   - 完成占卜后刷新页面，验证数据是否保留
   - 检查任务完成状态是否保存

5. **响应式测试**
   - PC 端：窗口大小调整
   - 移动端：16:9 设备测试
   - 小屏幕：窄屏设备测试

## 📝 后续开发建议

1. **错误处理**
   - API 调用失败时的重试机制
   - 网络错误提示
   - 友好的错误页面

2. **性能优化**
   - 图片懒加载
   - 缓存 LLM 结果
   - 减少重复计算

3. **用户体验**
   - 添加过渡动画
   - 优化加载状态
   - 添加音效（可选）

4. **数据功能**
   - 实现周总结页面
   - 实现月总结页面
   - 数据导出/导入功能

## 🔗 相关文档

- 产品设计文档：`../PRODUCT_DESIGN.md`
- UI 设计文档：`../UI_DESIGN_DAILY_TAROT.md`
- LLM Prompt 模板：`../LLM_PROMPT_TEMPLATE.md`

## 💡 问题反馈

如遇到问题，请检查：
1. 浏览器控制台是否有错误信息
2. API Key 是否有效
3. 网络连接是否正常
4. 图片路径是否正确

---

**Demo 版本用于逻辑和可行性验证，生产环境需要进一步优化。**



