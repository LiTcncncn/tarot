// 月相计算

const MOON_PHASES = {
    NEW_MOON: { name: 'New Moon', nameCn: '新月', emoji: '🌑', energy: 'New beginnings, setting intentions' },
    WAXING_CRESCENT: { name: 'Waxing Crescent', nameCn: '上弦月渐盈', emoji: '🌒', energy: 'Growth, taking action' },
    FIRST_QUARTER: { name: 'First Quarter', nameCn: '上弦月', emoji: '🌓', energy: 'Challenges, decision making' },
    WAXING_GIBBOUS: { name: 'Waxing Gibbous', nameCn: '渐盈凸月', emoji: '🌔', energy: 'Refinement, adjustment' },
    FULL_MOON: { name: 'Full Moon', nameCn: '满月', emoji: '🌕', energy: 'Clarity, release, completion' },
    WANING_GIBBOUS: { name: 'Waning Gibbous', nameCn: '渐亏凸月', emoji: '🌖', energy: 'Gratitude, sharing' },
    LAST_QUARTER: { name: 'Last Quarter', nameCn: '下弦月', emoji: '🌗', energy: 'Forgiveness, letting go' },
    WANING_CRESCENT: { name: 'Waning Crescent', nameCn: '下弦月渐亏', emoji: '🌘', energy: 'Rest, reflection, surrender' }
};

// 计算 Julian Day
function toJulianDay(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    let a, y, m, jdn;
    
    if (month <= 2) {
        a = Math.floor((14 - month) / 12);
        y = year + 4800 - a;
        m = month + 12 * a - 3;
    } else {
        y = year;
        m = month;
    }

    jdn = day + Math.floor((153 * m + 2) / 5) + 
          365 * y + Math.floor(y / 4) - 
          Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const jd = jdn + (hour - 12) / 24.0 + minute / 1440.0 + second / 86400.0;
    return jd;
}

// 计算月相（返回0-1之间的值）
function calculateMoonPhase(date) {
    const jd = toJulianDay(date);
    
    // 计算自2000年1月1日12:00 UTC以来的天数
    const daysSinceEpoch = jd - 2451545.0;
    
    // 月相周期（29.53058867天）
    const moonCycle = 29.53058867;
    
    // 计算月相（0-1之间）
    const phase = (daysSinceEpoch / moonCycle) % 1.0;
    
    // 处理负数
    return phase < 0 ? phase + 1.0 : phase;
}

// 获取月相名称
function getMoonPhaseName(phase) {
    if (phase < 0.03 || phase > 0.97) {
        return MOON_PHASES.NEW_MOON;
    } else if (phase < 0.22) {
        return MOON_PHASES.WAXING_CRESCENT;
    } else if (phase < 0.28) {
        return MOON_PHASES.FIRST_QUARTER;
    } else if (phase < 0.47) {
        return MOON_PHASES.WAXING_GIBBOUS;
    } else if (phase < 0.53) {
        return MOON_PHASES.FULL_MOON;
    } else if (phase < 0.72) {
        return MOON_PHASES.WANING_GIBBOUS;
    } else if (phase < 0.78) {
        return MOON_PHASES.LAST_QUARTER;
    } else {
        return MOON_PHASES.WANING_CRESCENT;
    }
}

// 获取月相照明度（0-1）
function getMoonIllumination(phase) {
    if (phase < 0.5) {
        // 渐盈：0 -> 1
        return phase * 2;
    } else {
        // 渐亏：1 -> 0
        return (1 - phase) * 2;
    }
}

// 获取今日月相信息
function getTodayMoonPhase(date = new Date()) {
    const phase = calculateMoonPhase(date);
    const phaseInfo = getMoonPhaseName(phase);
    const illumination = getMoonIllumination(phase);
    
    return {
        phase: phase,
        name: phaseInfo.name,
        nameCn: phaseInfo.nameCn,
        emoji: phaseInfo.emoji,
        energy: phaseInfo.energy,
        illumination: illumination
    };
}

// 获取指定日期的月相信息（用于日历）
function getMoonPhaseForDate(date) {
    return getTodayMoonPhase(date);
}

