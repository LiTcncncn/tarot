// 星座计算

const ZODIAC_SIGNS = {
    ARIES: { name: 'Aries', nameCn: '白羊座', emoji: '♈', dateRange: [[3, 21], [4, 19]] },
    TAURUS: { name: 'Taurus', nameCn: '金牛座', emoji: '♉', dateRange: [[4, 20], [5, 20]] },
    GEMINI: { name: 'Gemini', nameCn: '双子座', emoji: '♊', dateRange: [[5, 21], [6, 21]] },
    CANCER: { name: 'Cancer', nameCn: '巨蟹座', emoji: '♋', dateRange: [[6, 22], [7, 22]] },
    LEO: { name: 'Leo', nameCn: '狮子座', emoji: '♌', dateRange: [[7, 23], [8, 22]] },
    VIRGO: { name: 'Virgo', nameCn: '处女座', emoji: '♍', dateRange: [[8, 23], [9, 22]] },
    LIBRA: { name: 'Libra', nameCn: '天秤座', emoji: '♎', dateRange: [[9, 23], [10, 23]] },
    SCORPIUS: { name: 'Scorpius', nameCn: '天蝎座', emoji: '♏', dateRange: [[10, 24], [11, 22]] },
    SAGITTARIUS: { name: 'Sagittarius', nameCn: '射手座', emoji: '♐', dateRange: [[11, 23], [12, 21]] },
    CAPRICORN: { name: 'Capricorn', nameCn: '摩羯座', emoji: '♑', dateRange: [[12, 22], [1, 19]] }, // 跨年
    AQUARIUS: { name: 'Aquarius', nameCn: '水瓶座', emoji: '♒', dateRange: [[1, 20], [2, 18]] },
    PISCES: { name: 'Pisces', nameCn: '双鱼座', emoji: '♓', dateRange: [[2, 19], [3, 20]] }
};

// 根据生日计算星座
function calculateZodiac(month, day) {
    // 处理跨年的摩羯座（12月22日 - 1月19日）
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return ZODIAC_SIGNS.CAPRICORN;
    }
    
    // 遍历所有星座
    for (const [key, sign] of Object.entries(ZODIAC_SIGNS)) {
        if (key === 'CAPRICORN') continue; // 已处理
        
        const [startMonth, startDay] = sign.dateRange[0];
        const [endMonth, endDay] = sign.dateRange[1];
        
        // 检查是否在范围内
        if (month === startMonth && day >= startDay) {
            return sign;
        }
        if (month === endMonth && day <= endDay) {
            return sign;
        }
        // 处理同一个月的情况
        if (startMonth === endMonth && month === startMonth && day >= startDay && day <= endDay) {
            return sign;
        }
    }
    
    // 默认返回白羊座（不应该到达这里）
    return ZODIAC_SIGNS.ARIES;
}

// 根据日期字符串计算星座（格式：YYYY-MM-DD）
function getZodiacFromDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1; // 0-11 -> 1-12
    const day = date.getDate();
    return calculateZodiac(month, day);
}

// 根据Date对象计算星座
function getZodiacFromDateObject(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return calculateZodiac(month, day);
}

