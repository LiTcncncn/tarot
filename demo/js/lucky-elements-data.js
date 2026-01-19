// 幸运元素数据表

const LUCKY_ELEMENTS_DATA = {
  // 星座表
  zodiac: {
    '白羊座': { 
      element: 'fire', 
      number: 9, 
      colors: ['红色', '橙红色'], 
      plants: ['薄荷', '百里香'], 
      stones: ['红宝石', '石榴石'] 
    },
    '金牛座': { 
      element: 'earth', 
      number: 6, 
      colors: ['绿色', '粉色'], 
      plants: ['玫瑰', '紫罗兰'], 
      stones: ['祖母绿', '粉水晶'] 
    },
    '双子座': { 
      element: 'air', 
      number: 5, 
      colors: ['黄色', '亮橙色'], 
      plants: ['薰衣草', '雏菊'], 
      stones: ['黄水晶', '玛瑙'] 
    },
    '巨蟹座': { 
      element: 'water', 
      number: 7, 
      colors: ['银色', '白色'], 
      plants: ['睡莲', '茉莉'], 
      stones: ['珍珠', '月光石'] 
    },
    '狮子座': { 
      element: 'fire', 
      number: 19, 
      colors: ['金色', '橙色'], 
      plants: ['向日葵', '金盏花'], 
      stones: ['琥珀', '黄玉'] 
    },
    '处女座': { 
      element: 'earth', 
      number: 9, 
      colors: ['米色', '深蓝色'], 
      plants: ['薰衣草', '鼠尾草'], 
      stones: ['蓝宝石', '玛瑙'] 
    },
    '天秤座': { 
      element: 'air', 
      number: 6, 
      colors: ['淡蓝色', '粉色'], 
      plants: ['玫瑰', '天竺葵'], 
      stones: ['蓝宝石', '粉水晶'] 
    },
    '天蝎座': { 
      element: 'water', 
      number: 13, 
      colors: ['深红色', '黑色'], 
      plants: ['仙人掌', '菊花'], 
      stones: ['黑曜石', '红宝石'] 
    },
    '射手座': { 
      element: 'fire', 
      number: 3, 
      colors: ['紫色', '深蓝色'], 
      plants: ['鼠尾草', '蒲公英'], 
      stones: ['绿松石', '紫水晶'] 
    },
    '摩羯座': { 
      element: 'earth', 
      number: 10, 
      colors: ['棕色', '深绿色'], 
      plants: ['常春藤', '松树'], 
      stones: ['黑玛瑙', '蓝宝石'] 
    },
    '水瓶座': { 
      element: 'air', 
      number: 11, 
      colors: ['天蓝色', '银色'], 
      plants: ['紫罗兰', '兰花'], 
      stones: ['紫水晶', '海蓝宝'] 
    },
    '双鱼座': { 
      element: 'water', 
      number: 12, 
      colors: ['海绿色', '紫色'], 
      plants: ['莲花', '水仙'], 
      stones: ['海蓝宝', '紫水晶'] 
    }
  },
  
  // 月相表
  moonPhase: {
    '新月': { 
      number: 1, 
      colors: ['黑色', '深蓝色'], 
      plants: ['茉莉', '栀子花'], 
      stones: ['黑曜石', '月光石'] 
    },
    '上弦月渐盈': { 
      number: 3, 
      colors: ['银色', '浅蓝色'], 
      plants: ['薰衣草', '薄荷'], 
      stones: ['月光石', '白水晶'] 
    },
    '上弦月': { 
      number: 7, 
      colors: ['蓝色', '紫色'], 
      plants: ['迷迭香', '鼠尾草'], 
      stones: ['蓝宝石', '紫水晶'] 
    },
    '渐盈凸月': { 
      number: 9, 
      colors: ['金色', '黄色'], 
      plants: ['向日葵', '金盏花'], 
      stones: ['黄水晶', '琥珀'] 
    },
    '满月': { 
      number: 15, 
      colors: ['白色', '银色'], 
      plants: ['茉莉', '栀子花'], 
      stones: ['白水晶', '珍珠'] 
    },
    '渐亏凸月': { 
      number: 12, 
      colors: ['粉色', '玫瑰色'], 
      plants: ['玫瑰', '天竺葵'], 
      stones: ['粉水晶', '玫瑰石英'] 
    },
    '下弦月': { 
      number: 8, 
      colors: ['深蓝色', '紫色'], 
      plants: ['鼠尾草', '薰衣草'], 
      stones: ['紫水晶', '蓝宝石'] 
    },
    '下弦月渐亏': { 
      number: 4, 
      colors: ['灰色', '深绿色'], 
      plants: ['常春藤', '松树'], 
      stones: ['黑曜石', '玛瑙'] 
    }
  },
  
  // 塔罗大阿卡纳表（牌ID对应星座/元素）
  tarotMajor: {
    0: { element: 'air', zodiac: '风', number: 22 }, // 愚者
    1: { element: 'air', zodiac: '水星', number: 1 }, // 魔术师
    2: { element: 'water', zodiac: '月亮', number: 2 }, // 女祭司
    3: { element: 'earth', zodiac: '金星', number: 3 }, // 皇后
    4: { element: 'fire', zodiac: '白羊座', number: 4 }, // 皇帝
    5: { element: 'earth', zodiac: '金牛座', number: 5 }, // 教皇
    6: { element: 'air', zodiac: '双子座', number: 6 }, // 恋人
    7: { element: 'water', zodiac: '巨蟹座', number: 7 }, // 战车
    8: { element: 'fire', zodiac: '狮子座', number: 8 }, // 力量
    9: { element: 'earth', zodiac: '处女座', number: 9 }, // 隐者
    10: { element: null, zodiac: '木星', number: 10 }, // 命运之轮（使用月相补充）
    11: { element: 'air', zodiac: '天秤座', number: 11 }, // 正义
    12: { element: 'water', zodiac: '海王星', number: 12 }, // 倒吊人
    13: { element: 'water', zodiac: '天蝎座', number: 13 }, // 死神
    14: { element: 'fire', zodiac: '射手座', number: 14 }, // 节制
    15: { element: 'earth', zodiac: '摩羯座', number: 15 }, // 恶魔
    16: { element: 'fire', zodiac: '火星', number: 16 }, // 高塔
    17: { element: 'air', zodiac: '水瓶座', number: 17 }, // 星星
    18: { element: 'water', zodiac: '双鱼座', number: 18 }, // 月亮
    19: { element: 'fire', zodiac: '太阳', number: 19 }, // 太阳
    20: { element: 'fire', zodiac: '冥王星', number: 20 }, // 审判
    21: { element: 'earth', zodiac: '土星', number: 21 } // 世界
  },
  
  // 塔罗小阿卡纳花色与元素对应
  tarotElement: {
    'cups': { element: 'water' },
    'swords': { element: 'air' },
    'wands': { element: 'fire' },
    'pentacles': { element: 'earth' }
  },
  
  // 元素默认表（降级匹配用）
  elementDefault: {
    'fire': { 
      number: 9, 
      colors: ['红色', '橙色', '金色'], 
      plants: ['薄荷', '向日葵', '金盏花'], 
      stones: ['红宝石', '琥珀', '黄玉'] 
    },
    'earth': { 
      number: 6, 
      colors: ['绿色', '棕色', '米色'], 
      plants: ['玫瑰', '常春藤', '鼠尾草'], 
      stones: ['祖母绿', '玛瑙', '蓝宝石'] 
    },
    'air': { 
      number: 5, 
      colors: ['黄色', '天蓝色', '银色'], 
      plants: ['薰衣草', '紫罗兰', '雏菊'], 
      stones: ['黄水晶', '紫水晶', '海蓝宝'] 
    },
    'water': { 
      number: 7, 
      colors: ['蓝色', '银色', '海绿色'], 
      plants: ['茉莉', '莲花', '睡莲'], 
      stones: ['珍珠', '月光石', '海蓝宝'] 
    }
  }
};
