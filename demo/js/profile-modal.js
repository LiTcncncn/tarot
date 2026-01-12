// 个人信息补充模态框逻辑

let currentStep = 1;
const totalSteps = 6;
let profileData = {
    nickname: null,
    gender: null,
    birthday: null,
    birthTime: null,
    birthPlace: null,
    defaultWeather: null
};

// 将变量暴露到全局，供其他模块访问
window.currentStep = currentStep;

// 天气图标映射（用于第6步）
const WEATHER_OPTIONS = [
    { value: 'sunny', icon: 'weather/1.png', label: '阳光', emotion: '愉悦' },
    { value: 'cloudy', icon: 'weather/2.png', label: '多云', emotion: '平静' },
    { value: 'overcast', icon: 'weather/3.png', label: '阴天', emotion: '疲惫' },
    { value: 'rainy', icon: 'weather/4.png', label: '小雨', emotion: '迷茫' },
    { value: 'stormy', icon: 'weather/5.png', label: '大雨', emotion: '焦虑' }
];

// 初始化模态框
function initProfileModal() {
    const modal = document.getElementById('profile-modal');
    const backdrop = document.getElementById('profile-modal-backdrop');
    const closeBtn = document.getElementById('profile-modal-close');
    const addBtn = document.getElementById('add-profile-btn');
    const addBtnEmpty = document.getElementById('profile-add-btn-empty');
    
    // 打开模态框
    function openModal() {
        // 加载已保存的数据
        const saved = getUserProfile();
        if (saved) {
            profileData = {
                nickname: saved.nickname || null,
                gender: saved.gender || null,
                birthday: saved.birthday || null,
                birthTime: saved.birthTime || null,
                birthPlace: saved.birthPlace || null,
                defaultWeather: saved.defaultWeather || null
            };
            // 找到最后一个已填写的步骤
            if (profileData.nickname && profileData.gender && profileData.birthday) {
                currentStep = 4; // 从第4步开始
                if (profileData.birthTime) currentStep = 5;
                if (profileData.birthPlace) currentStep = 6;
                if (profileData.defaultWeather) currentStep = 6;
            } else if (profileData.nickname && profileData.gender) {
                currentStep = 3;
            } else if (profileData.nickname) {
                currentStep = 2;
            } else {
                currentStep = 1;
            }
        } else {
            currentStep = 1;
            profileData = {
                nickname: null,
                gender: null,
                birthday: null,
                birthTime: null,
                birthPlace: null,
                defaultWeather: null
            };
        }
        
        modal.style.display = 'block';
        renderCurrentStep();
    }
    
    // 关闭模态框
    function closeModal() {
        modal.style.display = 'none';
    }
    
    // 绑定事件
    if (addBtn) {
        addBtn.addEventListener('click', openModal);
    }
    if (addBtnEmpty) {
        addBtnEmpty.addEventListener('click', openModal);
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    if (backdrop) {
        backdrop.addEventListener('click', (e) => {
            // 检查必填项是否完成
            if (currentStep <= 3) {
                if (confirm('个人信息尚未完成，确定要关闭吗？')) {
                    closeModal();
                }
            } else {
                closeModal();
            }
        });
    }
    
    // 检查并显示/隐藏入口按钮
    updateProfileButtonVisibility();
    
    // 将 openModal 暴露为全局函数，供其他模块调用（如果还没有定义）
    if (!window.showProfileModal) {
        window.showProfileModal = openModal;
    }
    
    // 标记已初始化
    window.profileModalInitialized = true;
}

// 全局函数：显示个人信息模态框（供其他模块调用）
// 确保在全局作用域中定义（在 initProfileModal 之前就定义好）
window.showProfileModal = function showProfileModal() {
    const modal = document.getElementById('profile-modal');
    if (!modal) {
        console.error('Profile modal not found');
        return;
    }
    
    // 加载已保存的数据
    const saved = getUserProfile();
    if (saved) {
        profileData = {
            nickname: saved.nickname || null,
            gender: saved.gender || null,
            birthday: saved.birthday || null,
            birthTime: saved.birthTime || null,
            birthPlace: saved.birthPlace || null,
            defaultWeather: saved.defaultWeather || null
        };
        // 找到最后一个已填写的步骤
        if (profileData.nickname && profileData.gender && profileData.birthday) {
            currentStep = 4; // 从第4步开始
            if (profileData.birthTime) currentStep = 5;
            if (profileData.birthPlace) currentStep = 6;
            if (profileData.defaultWeather) currentStep = 6;
        } else if (profileData.nickname && profileData.gender) {
            currentStep = 3;
        } else if (profileData.nickname) {
            currentStep = 2;
        } else {
            currentStep = 1;
        }
    } else {
        currentStep = 1;
        profileData = {
            nickname: null,
            gender: null,
            birthday: null,
            birthTime: null,
            birthPlace: null,
            defaultWeather: null
        };
    }
    
    modal.style.display = 'block';
    renderCurrentStep();
};

// 同时保留函数声明形式（兼容性）
function showProfileModal() {
    if (window.showProfileModal) {
        window.showProfileModal();
    }
}

// 更新入口按钮显示状态
function updateProfileButtonVisibility() {
    const addBtn = document.getElementById('add-profile-btn');
    if (addBtn) {
        if (hasUserProfile()) {
            addBtn.style.display = 'none';
        } else {
            addBtn.style.display = 'block';
        }
    }
}

// 渲染当前步骤
function renderCurrentStep() {
    const container = document.getElementById('profile-form-container');
    const actions = document.getElementById('profile-form-actions');
    const progressFill = document.getElementById('profile-progress-fill');
    const progressText = document.getElementById('profile-progress-text');
    
    if (!container || !actions) return;
    
    // 更新进度
    const progress = (currentStep / totalSteps) * 100;
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    if (progressText) {
        progressText.textContent = `${currentStep}/${totalSteps}`;
    }
    
    // 清空容器
    container.innerHTML = '';
    actions.innerHTML = '';
    
    // 根据步骤渲染内容
    switch (currentStep) {
        case 1:
            renderStep1(container);
            break;
        case 2:
            renderStep2(container);
            break;
        case 3:
            renderStep3(container);
            break;
        case 4:
            renderStep4(container);
            break;
        case 5:
            renderStep5(container);
            break;
        case 6:
            renderStep6(container);
            break;
    }
    
    // 渲染按钮
    renderStepButtons(actions);
}

// 第1步：称呼
function renderStep1(container) {
    container.innerHTML = `
        <div class="profile-step-content">
            <h3 class="profile-step-title">希望怎么称呼你？</h3>
            <p class="profile-step-desc">用于个性化称呼，如"小A"、"小明"等</p>
            <input 
                type="text" 
                id="profile-nickname-input" 
                class="profile-input" 
                placeholder="请输入称呼（2-10个字符）"
                maxlength="10"
                value="${profileData.nickname || ''}"
            >
            <div class="profile-error" id="profile-nickname-error"></div>
        </div>
    `;
    
    // 实时验证
    const input = document.getElementById('profile-nickname-input');
    if (input) {
        input.addEventListener('input', () => {
            const validation = validateNickname(input.value);
            const errorDiv = document.getElementById('profile-nickname-error');
            if (errorDiv) {
                if (!validation.valid) {
                    errorDiv.textContent = validation.message;
                    errorDiv.style.display = 'block';
                } else {
                    errorDiv.style.display = 'none';
                }
            }
        });
    }
}

// 第2步：性别
function renderStep2(container) {
    container.innerHTML = `
        <div class="profile-step-content">
            <h3 class="profile-step-title">你的性别</h3>
            <div class="profile-radio-group">
                <label class="profile-radio-label">
                    <input type="radio" name="gender" value="男" ${profileData.gender === '男' ? 'checked' : ''}>
                    <span class="radio-text">男</span>
                </label>
                <label class="profile-radio-label">
                    <input type="radio" name="gender" value="女" ${profileData.gender === '女' ? 'checked' : ''}>
                    <span class="radio-text">女</span>
                </label>
                <label class="profile-radio-label">
                    <input type="radio" name="gender" value="非二元" ${profileData.gender === '非二元' ? 'checked' : ''}>
                    <span class="radio-text">非二元（Non-binary）</span>
                </label>
            </div>
        </div>
    `;
}

// 第3步：生日
function renderStep3(container) {
    container.innerHTML = `
        <div class="profile-step-content">
            <h3 class="profile-step-title">你的生日</h3>
            <p class="profile-step-desc">选择你的出生日期</p>
            <input 
                type="date" 
                id="profile-birthday-input" 
                class="profile-input" 
                value="${profileData.birthday || ''}"
                max="${new Date().toISOString().split('T')[0]}"
            >
            <div class="profile-error" id="profile-birthday-error"></div>
            <div class="profile-zodiac-display" id="profile-zodiac-display" style="display: none;">
                <span class="zodiac-emoji" id="zodiac-emoji"></span>
                <span class="zodiac-name" id="zodiac-name"></span>
            </div>
        </div>
    `;
    
    // 日期变化时计算星座
    const input = document.getElementById('profile-birthday-input');
    if (input) {
        input.addEventListener('change', () => {
            const validation = validateBirthday(input.value);
            const errorDiv = document.getElementById('profile-birthday-error');
            if (errorDiv) {
                if (!validation.valid) {
                    errorDiv.textContent = validation.message;
                    errorDiv.style.display = 'block';
                } else {
                    errorDiv.style.display = 'none';
                    // 计算并显示星座
                    const zodiac = getZodiacFromDate(input.value);
                    const zodiacDisplay = document.getElementById('profile-zodiac-display');
                    const zodiacEmoji = document.getElementById('zodiac-emoji');
                    const zodiacName = document.getElementById('zodiac-name');
                    if (zodiacDisplay && zodiacEmoji && zodiacName) {
                        zodiacEmoji.textContent = zodiac.emoji;
                        zodiacName.textContent = zodiac.nameCn;
                        zodiacDisplay.style.display = 'flex';
                    }
                }
            }
        });
        
        // 如果已有生日，显示星座
        if (profileData.birthday) {
            const zodiac = getZodiacFromDate(profileData.birthday);
            const zodiacDisplay = document.getElementById('profile-zodiac-display');
            const zodiacEmoji = document.getElementById('zodiac-emoji');
            const zodiacName = document.getElementById('zodiac-name');
            if (zodiacDisplay && zodiacEmoji && zodiacName) {
                zodiacEmoji.textContent = zodiac.emoji;
                zodiacName.textContent = zodiac.nameCn;
                zodiacDisplay.style.display = 'flex';
            }
        }
    }
}

// 第4步：出生时间
function renderStep4(container) {
    // 判断是否选择了"我不知道"：如果 birthTime 是 null 或空字符串，且不是有效的 HH:mm 格式
    const isUnknown = !profileData.birthTime || profileData.birthTime === null || profileData.birthTime === '';
    
    container.innerHTML = `
        <div class="profile-step-content">
            <h3 class="profile-step-title">你的出生时间</h3>
            <p class="profile-step-desc">按小时选择，或选择"我不知道"</p>
            <div class="profile-time-container">
                <input 
                    type="time" 
                    id="profile-birthtime-input" 
                    class="profile-input" 
                    value="${profileData.birthTime && profileData.birthTime !== null ? profileData.birthTime : ''}"
                    step="3600"
                >
                <button 
                    type="button" 
                    id="profile-unknown-time-btn" 
                    class="profile-unknown-btn"
                    ${isUnknown ? 'data-selected="true"' : ''}
                >
                    ${isUnknown ? '✓ 我不知道' : '我不知道'}
                </button>
            </div>
        </div>
    `;
    
    // 处理"我不知道"按钮
    const unknownBtn = document.getElementById('profile-unknown-time-btn');
    const timeInput = document.getElementById('profile-birthtime-input');
    if (unknownBtn && timeInput) {
        unknownBtn.addEventListener('click', () => {
            profileData.birthTime = null;
            timeInput.value = '';
            unknownBtn.textContent = '✓ 我不知道';
            unknownBtn.dataset.selected = 'true';
            // 确保输入框可以再次使用
            timeInput.disabled = false;
        });
        
        // 监听时间输入框的变化
        timeInput.addEventListener('change', () => {
            if (timeInput.value && timeInput.value.trim() !== '') {
                profileData.birthTime = timeInput.value;
                unknownBtn.textContent = '我不知道';
                unknownBtn.dataset.selected = 'false';
            }
        });
        
        // 也监听 input 事件（实时更新）
        timeInput.addEventListener('input', () => {
            if (timeInput.value && timeInput.value.trim() !== '') {
                profileData.birthTime = timeInput.value;
                unknownBtn.textContent = '我不知道';
                unknownBtn.dataset.selected = 'false';
            }
        });
        
        // 确保输入框始终可用（即使"我不知道"被选中）
        timeInput.disabled = false;
    }
}

// 第5步：出生地
function renderStep5(container) {
    container.innerHTML = `
        <div class="profile-step-content">
            <h3 class="profile-step-title">你的出生地</h3>
            <p class="profile-step-desc">具体到城市</p>
            <input 
                type="text" 
                id="profile-birthplace-input" 
                class="profile-input" 
                placeholder="例如：北京、上海、广州"
                value="${profileData.birthPlace || ''}"
            >
        </div>
    `;
}

// 第6步：默认天气
function renderStep6(container) {
    container.innerHTML = `
        <div class="profile-step-content">
            <h3 class="profile-step-title">你大多数日子更像哪种天气？</h3>
            <p class="profile-step-desc">选择最能代表你日常情绪状态的天气</p>
            <div class="profile-weather-grid">
                ${WEATHER_OPTIONS.map(weather => `
                    <div 
                        class="profile-weather-item ${profileData.defaultWeather === weather.value ? 'selected' : ''}"
                        data-weather="${weather.value}"
                    >
                        <img src="${weather.icon}" alt="${weather.label}" class="weather-icon">
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 绑定选择事件
    const items = container.querySelectorAll('.profile-weather-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            profileData.defaultWeather = item.dataset.weather;
        });
    });
}

// 渲染步骤按钮
function renderStepButtons(actions) {
    const isRequired = currentStep <= 3;
    const isLastStep = currentStep === totalSteps;
    
    if (isRequired) {
        // 必填项：只显示"下一步"
        actions.innerHTML = `
            <button class="profile-btn profile-btn-primary" id="profile-next-btn">下一步</button>
        `;
    } else {
        // 非必填项：显示"跳过"和"下一步"
        actions.innerHTML = `
            <button class="profile-btn profile-btn-secondary" id="profile-skip-btn">跳过</button>
            <button class="profile-btn profile-btn-primary" id="profile-next-btn">下一步</button>
        `;
    }
    
    // 最后一步显示"完成"
    if (isLastStep) {
        const nextBtn = document.getElementById('profile-next-btn');
        if (nextBtn) {
            nextBtn.textContent = '完成';
        }
    }
    
    // 绑定事件
    const nextBtn = document.getElementById('profile-next-btn');
    const skipBtn = document.getElementById('profile-skip-btn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNext);
    }
    if (skipBtn) {
        skipBtn.addEventListener('click', handleSkip);
    }
}

// 处理下一步
function handleNext() {
    // 验证当前步骤
    if (!validateCurrentStep()) {
        return;
    }
    
    // 保存当前步骤数据
    saveCurrentStepData();
    
    // 如果是最后一步，完成并保存
    if (currentStep === totalSteps) {
        completeProfile();
        return;
    }
    
    // 进入下一步
    currentStep++;
    renderCurrentStep();
}

// 处理跳过
function handleSkip() {
    // 保存当前步骤数据（可能为空）
    saveCurrentStepData();
    
    // 如果是最后一步，完成并保存
    if (currentStep === totalSteps) {
        completeProfile();
        return;
    }
    
    // 进入下一步
    currentStep++;
    renderCurrentStep();
}

// 验证当前步骤
function validateCurrentStep() {
    switch (currentStep) {
        case 1: {
            const input = document.getElementById('profile-nickname-input');
            if (!input) return false;
            const validation = validateNickname(input.value);
            if (!validation.valid) {
                const errorDiv = document.getElementById('profile-nickname-error');
                if (errorDiv) {
                    errorDiv.textContent = validation.message;
                    errorDiv.style.display = 'block';
                }
                return false;
            }
            return true;
        }
        case 2: {
            const selected = document.querySelector('input[name="gender"]:checked');
            if (!selected) {
                alert('请选择性别');
                return false;
            }
            return true;
        }
        case 3: {
            const input = document.getElementById('profile-birthday-input');
            if (!input) return false;
            const validation = validateBirthday(input.value);
            if (!validation.valid) {
                const errorDiv = document.getElementById('profile-birthday-error');
                if (errorDiv) {
                    errorDiv.textContent = validation.message;
                    errorDiv.style.display = 'block';
                }
                return false;
            }
            return true;
        }
        default:
            return true; // 非必填项不需要验证
    }
}

// 保存当前步骤数据
function saveCurrentStepData() {
    switch (currentStep) {
        case 1: {
            const input = document.getElementById('profile-nickname-input');
            if (input) {
                profileData.nickname = input.value.trim();
            }
            break;
        }
        case 2: {
            const selected = document.querySelector('input[name="gender"]:checked');
            if (selected) {
                profileData.gender = selected.value;
            }
            break;
        }
        case 3: {
            const input = document.getElementById('profile-birthday-input');
            if (input && input.value) {
                profileData.birthday = input.value;
            }
            break;
        }
        case 4: {
            const input = document.getElementById('profile-birthtime-input');
            if (input) {
                profileData.birthTime = input.value || null;
            }
            break;
        }
        case 5: {
            const input = document.getElementById('profile-birthplace-input');
            if (input) {
                profileData.birthPlace = input.value.trim() || null;
            }
            break;
        }
        case 6: {
            // defaultWeather 已在点击时保存
            break;
        }
    }
}

// 完成个人信息填写
function completeProfile() {
    // 保存所有数据
    if (saveUserProfile(profileData)) {
        // 关闭模态框
        document.getElementById('profile-modal').style.display = 'none';
        
        // 更新按钮显示状态
        updateProfileButtonVisibility();
        
        // 更新主界面头部（如果当前在主界面）
        if (typeof updateMainPageHeader === 'function') {
            updateMainPageHeader();
        }
        
        // 更新个人页面显示
        renderProfilePage();
        
        // 显示欢迎信息
        const nickname = profileData.nickname;
        alert(`欢迎，${nickname}！个人信息已保存。`);
        
        // 跳转到今日主界面
        if (hasTodayReading()) {
            showMainPage();
        } else {
            showDailyReadingPage();
        }
    } else {
        alert('保存失败，请重试');
    }
}

// 渲染个人页面
function renderProfilePage() {
    const infoContainer = document.getElementById('profile-info-container');
    const emptyContainer = document.getElementById('profile-empty-container');
    const profile = getUserProfile();
    
    if (!infoContainer || !emptyContainer) return;
    
    if (profile && hasUserProfile()) {
        // 显示已填信息
        infoContainer.style.display = 'block';
        emptyContainer.style.display = 'none';
        
        // 获取星座信息
        let zodiacInfo = null;
        if (profile.birthday) {
            zodiacInfo = getZodiacFromDate(profile.birthday);
        }
        
        // 获取天气信息
        let weatherInfo = null;
        if (profile.defaultWeather) {
            weatherInfo = WEATHER_OPTIONS.find(w => w.value === profile.defaultWeather);
        }
        
        infoContainer.innerHTML = `
            <div class="profile-info-card">
                <div class="profile-info-item">
                    <span class="profile-info-label">称呼</span>
                    <span class="profile-info-value">${profile.nickname || '-'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">性别</span>
                    <span class="profile-info-value">${profile.gender || '-'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">生日</span>
                    <span class="profile-info-value">${profile.birthday || '-'}</span>
                </div>
                ${zodiacInfo ? `
                <div class="profile-info-item">
                    <span class="profile-info-label">星座</span>
                    <span class="profile-info-value">
                        <span class="zodiac-emoji">${zodiacInfo.emoji}</span>
                        ${zodiacInfo.nameCn}
                    </span>
                </div>
                ` : ''}
                <div class="profile-info-item">
                    <span class="profile-info-label">出生时间</span>
                    <span class="profile-info-value">${profile.birthTime || '未填写'}</span>
                </div>
                <div class="profile-info-item">
                    <span class="profile-info-label">出生地</span>
                    <span class="profile-info-value">${profile.birthPlace || '未填写'}</span>
                </div>
                ${weatherInfo ? `
                <div class="profile-info-item">
                    <span class="profile-info-label">默认天气</span>
                    <span class="profile-info-value">
                        <img src="${weatherInfo.icon}" alt="${weatherInfo.label}" class="weather-icon-small">
                        ${weatherInfo.label}
                    </span>
                </div>
                ` : ''}
                <button id="profile-edit-btn" class="profile-edit-btn">补充</button>
            </div>
        `;
        
        // 绑定编辑按钮
        const editBtn = document.getElementById('profile-edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                document.getElementById('profile-modal').style.display = 'block';
                // 重置到第1步
                currentStep = 1;
                renderCurrentStep();
            });
        }
    } else {
        // 显示未填写提示
        infoContainer.style.display = 'none';
        emptyContainer.style.display = 'block';
    }
}

