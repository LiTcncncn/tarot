// 用户信息管理

const USER_PROFILE_KEY = 'userProfile';

// 默认用户信息结构
const DEFAULT_PROFILE = {
    nickname: null,           // 称呼（必填）
    gender: null,            // 性别：男/女/非二元（必填）
    birthday: null,          // 生日：YYYY-MM-DD（必填）
    birthTime: null,         // 出生时间：HH:00 或 null（非必填）
    birthPlace: null,        // 出生地：城市名称 或 null（非必填）
    defaultWeather: null,    // 默认天气：sunny/cloudy/overcast/rainy/stormy 或 null（非必填）
    zodiac: null,           // 自动计算的星座
    completedAt: null       // 完成时间
};

// 获取用户信息
function getUserProfile() {
    try {
        const stored = localStorage.getItem(USER_PROFILE_KEY);
        if (stored) {
            const profile = JSON.parse(stored);
            // 合并默认值，确保所有字段都存在
            return { ...DEFAULT_PROFILE, ...profile };
        }
    } catch (e) {
        console.error('读取用户信息失败:', e);
    }
    return null;
}

// 保存用户信息
function saveUserProfile(profile) {
    try {
        // 验证必填字段
        if (!profile.nickname || !profile.gender || !profile.birthday) {
            console.error('用户信息缺少必填字段');
            return false;
        }
        
        // 如果生日已设置，自动计算星座
        if (profile.birthday && !profile.zodiac) {
            profile.zodiac = getZodiacFromDate(profile.birthday);
        }
        
        // 设置完成时间
        if (!profile.completedAt) {
            profile.completedAt = new Date().toISOString();
        }
        
        // 合并默认值
        const fullProfile = { ...DEFAULT_PROFILE, ...profile };
        
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(fullProfile));
        return true;
    } catch (e) {
        console.error('保存用户信息失败:', e);
        return false;
    }
}

// 更新用户信息（部分更新）
function updateUserProfile(updates) {
    const current = getUserProfile() || DEFAULT_PROFILE;
    const updated = { ...current, ...updates };
    return saveUserProfile(updated);
}

// 检查是否已填写用户信息
function hasUserProfile() {
    const profile = getUserProfile();
    return profile && profile.nickname && profile.gender && profile.birthday;
}

// 验证称呼
function validateNickname(nickname) {
    if (!nickname || nickname.trim().length === 0) {
        return { valid: false, message: '请输入称呼' };
    }
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 10) {
        return { valid: false, message: '称呼长度应在2-10个字符之间' };
    }
    // 允许中文、英文、数字
    const pattern = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
    if (!pattern.test(trimmed)) {
        return { valid: false, message: '称呼只能包含中文、英文和数字' };
    }
    return { valid: true, message: '' };
}

// 验证生日
function validateBirthday(birthday) {
    if (!birthday) {
        return { valid: false, message: '请选择生日' };
    }
    const date = new Date(birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(date.getTime())) {
        return { valid: false, message: '日期格式不正确' };
    }
    
    if (date > today) {
        return { valid: false, message: '生日不能是未来日期' };
    }
    
    // 检查是否超过合理范围（1900年之前）
    const minDate = new Date('1900-01-01');
    if (date < minDate) {
        return { valid: false, message: '生日不能早于1900年' };
    }
    
    return { valid: true, message: '' };
}

// 验证出生时间
function validateBirthTime(birthTime) {
    if (!birthTime) {
        return { valid: true, message: '' }; // 非必填
    }
    // 格式：HH:00
    const pattern = /^([0-1]?[0-9]|2[0-3]):00$/;
    if (!pattern.test(birthTime)) {
        return { valid: false, message: '时间格式不正确，应为HH:00' };
    }
    return { valid: true, message: '' };
}

// 清除用户信息（用于测试或重置）
function clearUserProfile() {
    localStorage.removeItem(USER_PROFILE_KEY);
}

