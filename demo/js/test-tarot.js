// 塔罗测试页面逻辑

const EMOTIONS = ['愉悦', '平静', '疲惫', '迷茫', '焦虑'];

// 初始化测试页面
function initTestPage() {
    // 初始化牌选择下拉框
    const cardSelect = document.getElementById('test-card-select');
    const allCards = getAllTarotCards();
    
    allCards.forEach(card => {
        const option = document.createElement('option');
        option.value = card.id;
        option.textContent = `${card.nameCn} (${card.name})`;
        cardSelect.appendChild(option);
    });
}

// 测试功能1：抽牌几率测试
function testCardDrawing() {
    const resultsDiv = document.getElementById('test1-results');
    resultsDiv.innerHTML = '<div class="loading">正在抽取20张牌...</div>';
    
    setTimeout(() => {
        const results = [];
        const stats = {
            intensity: { I0: 0, I1: 0, I2: 0, I3: 0 },
            reversed: { true: 0, false: 0 },
            emotion: { '愉悦': 0, '平静': 0, '疲惫': 0, '迷茫': 0, '焦虑': 0 }
        };
        
        // 随机选择20个用户状态并抽牌
        for (let i = 0; i < 20; i++) {
            // 随机选择用户状态
            const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
            
            // 抽取牌（使用优化后的抽牌逻辑）
            const card = drawTarotCard(randomEmotion);
            
            // 记录统计
            stats.intensity[card.intensity] = (stats.intensity[card.intensity] || 0) + 1;
            stats.reversed[card.actualReversed ? 'true' : 'false'] = (stats.reversed[card.actualReversed ? 'true' : 'false'] || 0) + 1;
            stats.emotion[randomEmotion] = (stats.emotion[randomEmotion] || 0) + 1;
            
            results.push({
                index: i + 1,
                emotion: randomEmotion,
                card: card,
                intensity: card.intensity,
                actualReversed: card.actualReversed
            });
        }
        
        // 显示结果
        displayTest1Results(results, stats);
    }, 100);
}

// 显示测试1结果
function displayTest1Results(results, stats) {
    const resultsDiv = document.getElementById('test1-results');
    
    let html = '<div class="results-grid">';
    
    results.forEach(result => {
        html += `
            <div class="card-item">
                <h3>#${result.index}</h3>
                <div class="card-info">
                    <div>
                        <span class="emotion-badge">${result.emotion}</span>
                        <span class="intensity-badge intensity-${result.intensity}">${result.intensity}</span>
                    </div>
                    <div style="margin-top: 8px; font-weight: 600;">
                        ${result.card.nameCn}
                    </div>
                    <div style="margin-top: 5px; font-size: 12px; color: #6c757d;">
                        实际: <span class="reversed-badge reversed-${result.actualReversed}">${result.actualReversed ? '逆位' : '正位'}</span>
                    </div>
                    <div style="margin-top: 5px; font-size: 12px; color: #6c757d;">
                        显示: 正位
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // 添加统计信息
    html += `
        <div class="stats">
            <h3>📊 统计信息</h3>
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">强度分布</div>
                    <div class="stat-value">
                        I0: ${stats.intensity.I0 || 0} | I1: ${stats.intensity.I1 || 0}<br>
                        I2: ${stats.intensity.I2 || 0} | I3: ${stats.intensity.I3 || 0}
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">正逆位分布</div>
                    <div class="stat-value">
                        正位: ${stats.reversed.false || 0}<br>
                        逆位: ${stats.reversed.true || 0}
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">用户状态分布</div>
                    <div class="stat-value" style="font-size: 14px;">
                        ${Object.entries(stats.emotion).map(([emotion, count]) => `${emotion}: ${count}`).join('<br>')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    resultsDiv.innerHTML = html;
}

// 清空测试1结果
function clearTest1() {
    document.getElementById('test1-results').innerHTML = '';
}

// 测试功能2：生成重复度测试
async function testGeneration() {
    const resultsDiv = document.getElementById('test2-results');
    const cardSelect = document.getElementById('test-card-select');
    const reversedSelect = document.getElementById('test-reversed-select');
    
    const cardId = parseInt(cardSelect.value);
    const isReversed = reversedSelect.value === 'true';
    
    // 获取选中的牌
    const allCards = getAllTarotCards();
    const selectedCard = allCards.find(card => card.id === cardId);
    
    if (!selectedCard) {
        alert('请选择一张牌');
        return;
    }
    
    resultsDiv.innerHTML = '<div class="loading">正在生成5次内容，请稍候...</div>';
    
    // 准备5个不同的测试场景（确保覆盖所有状态和月相）
    const testScenarios = [];
    const moonPhases = ['新月', '上弦月', '满月', '下弦月'];
    
    // 确保5个场景有不同的组合
    for (let i = 0; i < 5; i++) {
        // 循环使用不同的情绪状态
        const emotion = EMOTIONS[i % EMOTIONS.length];
        // 循环使用不同的月相
        const moonPhase = moonPhases[i % moonPhases.length];
        
        testScenarios.push({
            index: i + 1,
            emotion: emotion,
            moonPhase: getMoonPhaseByName(moonPhase),
            card: {
                ...selectedCard,
                actualReversed: isReversed,
                reversed: false,  // 显示为正位
                orientation: '正位',
                intensity: getCardIntensity(selectedCard.name)
            }
        });
    }
    
    // 生成内容
    const generationResults = [];
    
    for (const scenario of testScenarios) {
        try {
            const readingData = await generateTarotReading(
                scenario.emotion,
                scenario.card,
                scenario.moonPhase
            );
            
            generationResults.push({
                ...scenario,
                reading: readingData
            });
        } catch (error) {
            console.error('生成失败:', error);
            generationResults.push({
                ...scenario,
                reading: null,
                error: error.message
            });
        }
    }
    
    // 显示结果
    displayTest2Results(generationResults, selectedCard, isReversed);
}

// 显示测试2结果
function displayTest2Results(results, card, isReversed) {
    const resultsDiv = document.getElementById('test2-results');
    
    let html = `
        <div style="margin-bottom: 20px; padding: 15px; background: #e7f3ff; border-radius: 10px;">
            <strong>测试配置：</strong> ${card.nameCn} (${card.name}) - 实际${isReversed ? '逆位' : '正位'}，显示正位
        </div>
    `;
    
    results.forEach(result => {
        html += `
            <div class="generation-item">
                <div class="generation-header">
                    <div>
                        <strong>#${result.index}</strong>
                        <span class="emotion-badge" style="margin-left: 10px;">${result.emotion}</span>
                        <span style="margin-left: 10px; color: #6c757d; font-size: 14px;">
                            ${result.moonPhase.nameCn} (${result.moonPhase.name})
                        </span>
                    </div>
                </div>
                <div class="generation-content">
                    ${result.error ? 
                        `<div style="color: #dc3545;">生成失败: ${result.error}</div>` :
                        `
                        <div style="margin-bottom: 10px;">
                            <strong>综合指引：</strong>${result.reading.guidance_one_line || '无'}
                        </div>
                        <div style="margin-bottom: 10px;">
                            <strong>今日分析：</strong>${result.reading.today_analysis || '无'}
                        </div>
                        <div>
                            <strong>疗愈任务：</strong>${result.reading.healing_task || '无'}
                        </div>
                        `
                    }
                </div>
            </div>
        `;
    });
    
    // 添加重复度分析
    html += generateSimilarityAnalysis(results);
    
    resultsDiv.innerHTML = html;
}

// 生成相似度分析
function generateSimilarityAnalysis(results) {
    const validResults = results.filter(r => r.reading && !r.error);
    
    if (validResults.length < 2) {
        return '<div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 10px; color: #856404;">数据不足，无法进行相似度分析</div>';
    }
    
    // 简单的文本相似度分析（比较综合指引）
    const guidanceTexts = validResults.map(r => r.reading.guidance_one_line || '');
    const analysisTexts = validResults.map(r => r.reading.today_analysis || '');
    
    let html = '<div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 10px;">';
    html += '<h3 style="margin-bottom: 15px;">📊 重复度分析</h3>';
    
    // 检查综合指引的重复度
    const uniqueGuidances = new Set(guidanceTexts);
    html += `<div style="margin-bottom: 10px;"><strong>综合指引唯一性：</strong>${uniqueGuidances.size}/${validResults.length} 条唯一</div>`;
    
    // 检查今日分析的重复度
    const uniqueAnalyses = new Set(analysisTexts);
    html += `<div style="margin-bottom: 10px;"><strong>今日分析唯一性：</strong>${uniqueAnalyses.size}/${validResults.length} 条唯一</div>`;
    
    // 找出完全相同的条目
    const duplicateGuidances = [];
    const duplicateAnalyses = [];
    
    for (let i = 0; i < guidanceTexts.length; i++) {
        for (let j = i + 1; j < guidanceTexts.length; j++) {
            if (guidanceTexts[i] === guidanceTexts[j] && guidanceTexts[i]) {
                duplicateGuidances.push(`#${i+1} 和 #${j+1}`);
            }
            if (analysisTexts[i] === analysisTexts[j] && analysisTexts[i]) {
                duplicateAnalyses.push(`#${i+1} 和 #${j+1}`);
            }
        }
    }
    
    if (duplicateGuidances.length > 0) {
        html += `<div style="margin-top: 10px; color: #dc3545;"><strong>⚠️ 完全重复的综合指引：</strong>${duplicateGuidances.join(', ')}</div>`;
    } else {
        html += `<div style="margin-top: 10px; color: #28a745;"><strong>✅ 综合指引无完全重复</strong></div>`;
    }
    
    if (duplicateAnalyses.length > 0) {
        html += `<div style="margin-top: 10px; color: #dc3545;"><strong>⚠️ 完全重复的今日分析：</strong>${duplicateAnalyses.join(', ')}</div>`;
    } else {
        html += `<div style="margin-top: 10px; color: #28a745;"><strong>✅ 今日分析无完全重复</strong></div>`;
    }
    
    html += '</div>';
    
    return html;
}

// 清空测试2结果
function clearTest2() {
    document.getElementById('test2-results').innerHTML = '';
}

// 根据名称获取月相
function getMoonPhaseByName(name) {
    const today = new Date();
    // 简化处理，返回一个包含名称和能量的对象
    const moonPhaseData = {
        '新月': { name: 'New Moon', nameCn: '新月', energy: '新的开始，设定意图的能量' },
        '上弦月': { name: 'First Quarter', nameCn: '上弦月', energy: '行动和推进的能量' },
        '满月': { name: 'Full Moon', nameCn: '满月', energy: '圆满和释放的能量' },
        '下弦月': { name: 'Last Quarter', nameCn: '下弦月', energy: '反思和整合的能量' }
    };
    
    return moonPhaseData[name] || moonPhaseData['新月'];
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initTestPage();
});

