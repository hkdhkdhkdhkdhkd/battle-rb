/* ==========================================================
   38 名角色数据
   字段：hp 体力 / atk 攻击 / def 防御 / spd 速度
   技能：n 名称 / c 驱动消耗 / cd 冷却 / p 威力系数 / e 效果 / d 说明
   效果：pierce 穿透防御 · unguard 无视防御姿态 · stun 眩晕
        bleed 流血 · burn 灼烧 · lifesteal 吸血 · multi 两段
        atkUp / defUp 增益 · heal 回复 · shield 护盾
        driveDrain 削驱动 · driveGain 补驱动 · superGain 补能量
        execute 处决 · counter 反击姿态 · cleanse 净化
        regen 持续回复 · armor 霸体减伤 · drainSuper 削能量
   ========================================================== */
window.ROSTER = [
  {
    id: 'ryu', name: '隆', en: 'RYU', style: '波动流空手道', tag: '均衡', kanji: '波动', hue: 22,
    hp: 100, atk: 11, def: 10, spd: 9,
    skills: [
      { n: '波动拳', c: 1, cd: 0, p: 1.25, e: ['pierce'], d: '远程气功波，防御只能挡下一半伤害' },
      { n: '升龙拳', c: 1, cd: 1, p: 1.5, e: ['counter'], d: '对空一击，命中后进入反击姿态' },
      { n: '旋风腿', c: 0, cd: 2, p: 0.95, e: ['multi'], d: '两段连踢，合计 1.6 倍伤害' },
      { n: '气功掌', c: 1, cd: 2, p: 1.2, e: ['driveDrain'], d: '贴身推掌，削减对手 1 格驱动' }
    ],
    super: { n: '真空波动拳', p: 3.1, e: ['pierce', 'unguard'], d: '超必杀 · 巨型气功，无视防御姿态' }
  },
  {
    id: 'ken', name: '肯', en: 'KEN', style: '升龙流空手道', tag: '速攻', kanji: '炎', hue: 8,
    hp: 96, atk: 12, def: 9, spd: 10,
    skills: [
      { n: '火焰波动拳', c: 1, cd: 0, p: 1.3, e: ['burn'], d: '燃烧的波动，附加灼烧' },
      { n: '升龙裂破', c: 1, cd: 1, p: 1.55, e: [], d: '升龙拳强化版，高伤害突进' },
      { n: '疾风脚', c: 0, cd: 1, p: 0.95, e: ['multi'], d: '两段风神腿，压制对手' },
      { n: '神龙拳', c: 2, cd: 3, p: 1.9, e: ['stun'], d: '重拳命中后使对手眩晕一回合' }
    ],
    super: { n: '神龙炎舞', p: 3.0, e: ['burn', 'multi'], d: '超必杀 · 烈焰升龙连段' }
  },
  {
    id: 'chunli', name: '春丽', en: 'CHUN-LI', style: '百裂脚', tag: '技巧', kanji: '百裂', hue: 46,
    hp: 96, atk: 11, def: 9, spd: 12,
    skills: [
      { n: '百裂脚', c: 0, cd: 1, p: 0.9, e: ['multi'], d: '超高速连踢，两段伤害' },
      { n: '气功掌', c: 1, cd: 0, p: 1.2, e: ['pierce'], d: '气功波掌，穿透防御' },
      { n: '鹰爪脚', c: 1, cd: 2, p: 1.4, e: ['driveDrain'], d: '垂直落踢，削减驱动' },
      { n: '天升脚', c: 2, cd: 3, p: 1.9, e: ['stun'], d: '倒立旋转踢，击中使对手眩晕' }
    ],
    super: { n: '千裂脚', p: 2.9, e: ['multi'], d: '超必杀 · 的百裂脚终极形态' }
  },
  {
    id: 'guile', name: '古烈', en: 'GUILE', style: '军用格斗术', tag: '均衡', kanji: '音速', hue: 200,
    hp: 102, atk: 10, def: 12, spd: 8,
    skills: [
      { n: '音速刀', c: 1, cd: 0, p: 1.3, e: ['pierce'], d: '音速手刀，穿透防御' },
      { n: '脚刀', c: 1, cd: 1, p: 1.45, e: ['counter'], d: '倒踢并进入反击姿态' },
      { n: '固守', c: 0, cd: 2, p: 0, e: ['shield', 'defUp'], d: '进入防御姿态并附加护盾' },
      { n: '音速风暴', c: 2, cd: 3, p: 0.9, e: ['multi', 'driveDrain'], d: '连续手刀，削驱动' }
    ],
    super: { n: '音速破坏', p: 2.8, e: ['multi', 'pierce'], d: '超必杀 · 无间断音速连射' }
  },
  {
    id: 'zangief', name: '桑吉尔夫', en: 'ZANGIEF', style: '红色旋风摔角', tag: '重装', kanji: '螺旋', hue: 0,
    hp: 112, atk: 12, def: 11, spd: 5,
    skills: [
      { n: '螺旋打桩', c: 1, cd: 1, p: 1.9, e: ['unguard'], d: '无法防御的摔投技' },
      { n: '双截踢', c: 0, cd: 1, p: 0.9, e: ['multi'], d: '重腿两段' },
      { n: '钢铁之躯', c: 0, cd: 2, p: 0, e: ['armor', 'defUp'], d: '硬化肌肉，下次伤害减半' },
      { n: '巨熊抱', c: 2, cd: 3, p: 2.2, e: ['unguard', 'stun'], d: '熊抱重摔，无视防御并眩晕' }
    ],
    super: { n: '终极原子弹', p: 3.3, e: ['unguard', 'lifesteal'], d: '超必杀 · 螺旋打桩机终极版' }
  },
  {
    id: 'dhalsim', name: '达尔锡', en: 'DHALSIM', style: '瑜伽术', tag: '远程', kanji: '瑜伽', hue: 30,
    hp: 90, atk: 11, def: 8, spd: 9,
    skills: [
      { n: '瑜伽火焰', c: 1, cd: 0, p: 1.3, e: ['burn'], d: '喷射瑜伽火焰，附加灼烧' },
      { n: '长臂拳', c: 1, cd: 0, p: 1.3, e: ['pierce'], d: '伸缩长臂，穿透防御' },
      { n: '瑜伽冥想', c: 0, cd: 2, p: 0, e: ['heal', 'defUp'], d: '漂浮冥想，回复并强化防御' },
      { n: '瑜伽灾难', c: 2, cd: 3, p: 0.85, e: ['multi', 'drainSuper'], d: '连环长臂，削减对手能量' }
    ],
    super: { n: '瑜伽地狱', p: 2.9, e: ['burn', 'unguard'], d: '超必杀 · 瑜伽之火吞没对手' }
  },
  {
    id: 'blanka', name: '布兰卡', en: 'BLANKA', style: '野兽之力', tag: '速攻', kanji: '兽电', hue: 110,
    hp: 104, atk: 11, def: 9, spd: 9,
    skills: [
      { n: '雷霆放电', c: 1, cd: 1, p: 1.25, e: ['multi'], d: '电流缠身，两段电击' },
      { n: '野兽滚', c: 1, cd: 0, p: 1.4, e: [], d: '卷成球体高速突进' },
      { n: '丛林突袭', c: 0, cd: 2, p: 1.1, e: ['pierce'], d: '野性抓击，穿透防御' },
      { n: '闪电风暴', c: 2, cd: 3, p: 1.85, e: ['stun'], d: '全身放电，使对手麻痹眩晕' }
    ],
    super: { n: '野生之力', p: 2.9, e: ['multi', 'lifesteal'], d: '超必杀 · 野兽本能全面爆发' }
  },
  {
    id: 'honda', name: 'E.本田', en: 'E.HONDA', style: '相扑', tag: '重装', kanji: '百手', hue: 16,
    hp: 108, atk: 11, def: 12, spd: 5,
    skills: [
      { n: '百手击', c: 0, cd: 1, p: 0.9, e: ['multi'], d: '相扑连掌，两段伤害' },
      { n: '头槌', c: 1, cd: 0, p: 1.55, e: ['pierce'], d: '助跑头槌，穿透防御' },
      { n: '相扑推掌', c: 1, cd: 2, p: 1.4, e: ['driveDrain'], d: '推掌将对手推出场外' },
      { n: '大相扑', c: 2, cd: 3, p: 2.0, e: ['armor'], d: '全身压击并进入霸体' }
    ],
    super: { n: '富士山崩', p: 3.1, e: ['unguard', 'stun'], d: '超必杀 · 相扑终极压杀' }
  },
  {
    id: 'cammy', name: '嘉米', en: 'CAMMY', style: '暗杀术', tag: '速攻', kanji: '刺杀', hue: 56,
    hp: 86, atk: 11, def: 8, spd: 13,
    skills: [
      { n: '螺旋箭', c: 1, cd: 0, p: 1.35, e: [], d: '空中螺旋踢，速度极快' },
      { n: '加农踢', c: 1, cd: 1, p: 1.5, e: ['execute'], d: '对残血对手追加处决伤害' },
      { n: '疾速突袭', c: 0, cd: 1, p: 0.9, e: ['multi'], d: '快速二连踢' },
      { n: '陷阱伏击', c: 2, cd: 3, p: 1.85, e: ['counter'], d: '伏击并进入反击姿态' }
    ],
    super: { n: '加农打击', p: 3.0, e: ['execute', 'lifesteal'], d: '超必杀 · 暗杀术最终式' }
  },
  {
    id: 'bison', name: '维加', en: 'M.BISON', style: '精神力', tag: '均衡', kanji: '精神', hue: 282,
    hp: 106, atk: 12, def: 10, spd: 8,
    skills: [
      { n: '精神力冲击', c: 1, cd: 0, p: 1.3, e: ['pierce'], d: '精神能量弹，穿透防御' },
      { n: '双膝落', c: 1, cd: 1, p: 1.5, e: [], d: '凌空双膝重压' },
      { n: '精神力护罩', c: 0, cd: 2, p: 0, e: ['shield', 'armor'], d: '精神护罩吸收伤害' },
      { n: '精神爆破', c: 2, cd: 3, p: 1.9, e: ['drainSuper'], d: '引爆精神力，削减对手能量' }
    ],
    super: { n: '精神噩梦', p: 3.1, e: ['unguard', 'drainSuper'], d: '超必杀 · 精神力全面爆发' }
  },
  {
    id: 'vega', name: '巴洛克', en: 'VEGA', style: '爪术', tag: '技巧', kanji: '爪牙', hue: 320,
    hp: 92, atk: 11, def: 8, spd: 12,
    skills: [
      { n: '爪击', c: 0, cd: 0, p: 1.1, e: ['bleed'], d: '钢爪撕裂，造成流血' },
      { n: '空中爪', c: 1, cd: 1, p: 1.5, e: ['pierce'], d: '空中扑击，穿透防御' },
      { n: '蛇形闪避', c: 0, cd: 2, p: 0, e: ['counter', 'defUp'], d: '蛇形身法，进入反击姿态' },
      { n: '血色十字', c: 2, cd: 3, p: 1.9, e: ['bleed'], d: '十字斩，重创并流血' }
    ],
    super: { n: '血之华尔兹', p: 2.8, e: ['multi', 'bleed'], d: '超必杀 · 华丽而致命的爪舞' }
  },
  {
    id: 'balrog', name: '拜森', en: 'BALROG', style: '拳击', tag: '速攻', kanji: '铁拳', hue: 210,
    hp: 108, atk: 12, def: 9, spd: 8,
    skills: [
      { n: '冲刺直拳', c: 1, cd: 0, p: 1.4, e: [], d: '冲刺重拳，正面压制' },
      { n: '勾拳', c: 1, cd: 1, p: 1.55, e: ['execute'], d: '致命勾拳，处决残血对手' },
      { n: '铁壁防守', c: 0, cd: 2, p: 0, e: ['armor', 'defUp'], d: '拳击护架，减伤并强化防御' },
      { n: '疯狂连拳', c: 2, cd: 3, p: 0.95, e: ['multi'], d: '暴风连拳，两段重击' }
    ],
    super: { n: '疯狂拳击', p: 3.0, e: ['multi', 'execute'], d: '超必杀 · 无尽重拳' }
  },
  {
    id: 'sagat', name: '沙加特', en: 'SAGAT', style: '帝王泰拳', tag: '远程', kanji: '帝王', hue: 36,
    hp: 104, atk: 12, def: 9, spd: 8,
    skills: [
      { n: '虎爪', c: 1, cd: 0, p: 1.3, e: ['bleed'], d: '虎爪撕裂，造成流血' },
      { n: '猛虎踢', c: 1, cd: 1, p: 1.5, e: [], d: '长腿重踢' },
      { n: '虎之高踢', c: 0, cd: 2, p: 1.1, e: ['pierce'], d: '高位膝撞，穿透防御' },
      { n: '猛虎炮', c: 2, cd: 3, p: 1.9, e: ['pierce'], d: '双手猛虎波，穿透防御' }
    ],
    super: { n: '猛虎破坏', p: 3.1, e: ['pierce', 'bleed'], d: '超必杀 · 帝王之怒' }
  },
  {
    id: 'akuma', name: '豪鬼', en: 'AKUMA', style: '修罗道', tag: '均衡', kanji: '修罗', hue: 350,
    hp: 94, atk: 13, def: 8, spd: 10,
    skills: [
      { n: '豪波动拳', c: 1, cd: 0, p: 1.4, e: ['pierce'], d: '暗黑波动，穿透防御' },
      { n: '修罗闪空', c: 1, cd: 1, p: 1.55, e: ['counter'], d: '瞬移反击' },
      { n: '百鬼袭', c: 0, cd: 2, p: 0.95, e: ['multi', 'drainSuper'], d: '空中连袭，削减能量' },
      { n: '恶鬼拳', c: 2, cd: 3, p: 2.0, e: ['lifesteal'], d: '吸取生命的重拳' }
    ],
    super: { n: '瞬狱杀', p: 3.4, e: ['unguard'], d: '超必杀 · 一瞬千击' }
  },
  {
    id: 'sakura', name: '樱', en: 'SAKURA', style: '春日野流', tag: '速攻', kanji: '春日', hue: 332,
    hp: 92, atk: 10, def: 9, spd: 11,
    skills: [
      { n: '春日野波动', c: 1, cd: 0, p: 1.25, e: ['pierce'], d: '小型波动拳，穿透防御' },
      { n: '樱花升龙', c: 1, cd: 1, p: 1.5, e: [], d: '升龙拳，对空强势' },
      { n: '春光脚', c: 0, cd: 1, p: 0.9, e: ['multi'], d: '两段踢击' },
      { n: '花之岚', c: 2, cd: 3, p: 1.85, e: ['multi'], d: '连续技终结，高段伤害' }
    ],
    super: { n: '春一番', p: 2.9, e: ['multi'], d: '超必杀 · 樱花满开连段' }
  },
  {
    id: 'dan', name: '丹', en: 'DAN', style: '最强流', tag: '技巧', kanji: '最强', hue: 300,
    hp: 94, atk: 10, def: 9, spd: 10,
    skills: [
      { n: '最强波动', c: 1, cd: 0, p: 0.9, e: ['pierce', 'superGain'], d: '传说中的弱势波动，但额外补充能量' },
      { n: '最强升龙', c: 1, cd: 1, p: 1.25, e: [], d: '自称最强的升龙拳' },
      { n: '自创拳法', c: 0, cd: 2, p: 0, e: ['heal', 'atkUp'], d: '摆姿势回复体力并提升攻击' },
      { n: '最强连击', c: 2, cd: 3, p: 1.5, e: ['multi'], d: '最强连击，两段伤害' }
    ],
    super: { n: '最强流奥义', p: 2.6, e: ['stun'], d: '超必杀 · 真·最强流奥义（使人眩晕）' }
  },
  {
    id: 'rose', name: '萝丝', en: 'ROSE', style: '灵魂力', tag: '远程', kanji: '灵魂', hue: 270,
    hp: 92, atk: 10, def: 9, spd: 9,
    skills: [
      { n: '灵魂火花', c: 1, cd: 0, p: 1.25, e: ['drainSuper'], d: '灵魂弹，削减对手能量' },
      { n: '灵魂滑步', c: 0, cd: 2, p: 0, e: ['counter', 'defUp'], d: '占卜闪避，进入反击姿态' },
      { n: '灵魂反射', c: 1, cd: 2, p: 0, e: ['shield', 'counter'], d: '灵魂屏障 + 反击准备' },
      { n: '灵魂幻影', c: 2, cd: 3, p: 1.8, e: ['multi', 'drainSuper'], d: '幻影连击，削减能量' }
    ],
    super: { n: '灵魂幻象', p: 2.8, e: ['pierce', 'drainSuper'], d: '超必杀 · 灵魂之门' }
  },
  {
    id: 'karin', name: '卡琳', en: 'KARIN', style: '贵公子流', tag: '技巧', kanji: '千金', hue: 42,
    hp: 94, atk: 11, def: 9, spd: 11,
    skills: [
      { n: '烈风拳', c: 1, cd: 0, p: 1.3, e: [], d: '掌底冲击' },
      { n: '红莲脚', c: 1, cd: 1, p: 1.45, e: ['multi'], d: '两段玫瑰踢' },
      { n: '贵公子之步', c: 0, cd: 2, p: 0, e: ['atkUp', 'defUp'], d: '华丽步法，攻防同时提升' },
      { n: '紫电拳', c: 2, cd: 3, p: 1.9, e: ['stun'], d: '高压电击拳，眩晕对手' }
    ],
    super: { n: '华丽终结', p: 3.0, e: ['execute'], d: '超必杀 · 千金大小姐的处刑' }
  },
  {
    id: 'mika', name: '彩虹美华', en: 'R.MIKA', style: '摔角', tag: '重装', kanji: '彩虹', hue: 340,
    hp: 110, atk: 11, def: 10, spd: 7,
    skills: [
      { n: '麦克风摔', c: 1, cd: 1, p: 1.85, e: ['unguard'], d: '抓住对手猛摔，无法防御' },
      { n: '彩虹飞踢', c: 1, cd: 0, p: 1.35, e: [], d: '飞跃踢击' },
      { n: '应援', c: 0, cd: 2, p: 0, e: ['heal', 'atkUp'], d: '观众应援，回复并提升攻击' },
      { n: '大回旋摔', c: 2, cd: 3, p: 2.1, e: ['unguard'], d: '大回旋摔投' }
    ],
    super: { n: '彩虹台风', p: 3.1, e: ['unguard', 'multi'], d: '超必杀 · 彩虹台风连摔' }
  },
  {
    id: 'juri', name: '朱莉', en: 'JURI', style: '风水拳', tag: '速攻', kanji: '风水', hue: 292,
    hp: 92, atk: 11, def: 8, spd: 12,
    skills: [
      { n: '风水踢', c: 1, cd: 0, p: 1.3, e: ['bleed'], d: '风车踢，造成流血' },
      { n: '旋风掌', c: 1, cd: 1, p: 1.5, e: [], d: '旋风掌击' },
      { n: '风水眼', c: 0, cd: 2, p: 0, e: ['counter', 'superGain'], d: '观察破绽，反击并补充能量' },
      { n: '千手观音', c: 2, cd: 3, p: 0.85, e: ['multi', 'drainSuper'], d: '高速连踢，削减能量' }
    ],
    super: { n: '风水最终奥义', p: 2.9, e: ['multi', 'bleed'], d: '超必杀 · 风水引擎全开' }
  },
  {
    id: 'seth', name: '赛斯', en: 'SETH', style: '数据复制', tag: '均衡', kanji: '复制', hue: 190,
    hp: 100, atk: 11, def: 10, spd: 9,
    skills: [
      { n: '吸收掌', c: 1, cd: 0, p: 1.25, e: ['lifesteal'], d: '吸取对手体力' },
      { n: '音速冲击', c: 1, cd: 1, p: 1.45, e: ['pierce'], d: '复制音速拳，穿透防御' },
      { n: '数据护盾', c: 0, cd: 2, p: 0, e: ['shield', 'armor'], d: '数据屏障吸收伤害' },
      { n: '螺旋驱动', c: 2, cd: 3, p: 1.85, e: ['driveDrain'], d: '螺旋肘击，削减驱动' }
    ],
    super: { n: '完全吸收', p: 2.9, e: ['lifesteal', 'unguard'], d: '超必杀 · 吸收一切' }
  },
  {
    id: 'abel', name: '阿贝尔', en: 'ABEL', style: '混合格斗', tag: '重装', kanji: '无我', hue: 206,
    hp: 106, atk: 11, def: 11, spd: 7,
    skills: [
      { n: '混合连击', c: 1, cd: 0, p: 1.4, e: [], d: '拳肘膝组合连击' },
      { n: '巨人摔', c: 1, cd: 1, p: 1.9, e: ['unguard'], d: '强力摔投，无法防御' },
      { n: '铁壁', c: 0, cd: 2, p: 0, e: ['armor', 'defUp'], d: '硬抗，减伤并强化防御' },
      { n: '猛牛冲撞', c: 2, cd: 3, p: 2.0, e: ['stun'], d: '冲撞使对手眩晕' }
    ],
    super: { n: '无我之拳', p: 3.0, e: ['unguard'], d: '超必杀 · 舍弃一切的拳' }
  },
  {
    id: 'viper', name: 'C.毒蛇', en: 'C.VIPER', style: '战术格斗', tag: '技巧', kanji: '毒蛇', hue: 160,
    hp: 94, atk: 11, def: 9, spd: 11,
    skills: [
      { n: '雷霆之拳', c: 1, cd: 0, p: 1.3, e: ['burn'], d: '电热拳，附加灼烧' },
      { n: '烈焰踢', c: 1, cd: 1, p: 1.5, e: ['burn'], d: '火焰踢击' },
      { n: '战术回避', c: 0, cd: 2, p: 0, e: ['counter', 'armor'], d: '战术闪避，反击并减伤' },
      { n: '光学迷彩', c: 2, cd: 3, p: 0, e: ['atkUp', 'shield'], d: '隐身蓄势，强化攻击并加护盾' }
    ],
    super: { n: '燃烧雷霆', p: 2.9, e: ['burn', 'multi'], d: '超必杀 · 雷霆烈焰' }
  },
  {
    id: 'rufus', name: '鲁弗斯', en: 'RUFUS', style: '重量级', tag: '重装', kanji: '重量', hue: 50,
    hp: 114, atk: 10, def: 11, spd: 6,
    skills: [
      { n: '猛击突进', c: 1, cd: 0, p: 1.4, e: [], d: '体重压制突进' },
      { n: '空中重击', c: 1, cd: 1, p: 1.55, e: [], d: '空中膝撞' },
      { n: '重量防守', c: 0, cd: 2, p: 0, e: ['armor', 'defUp'], d: '厚实脂肪减伤' },
      { n: '汉堡之力', c: 2, cd: 3, p: 0, e: ['heal', 'regen'], d: '吃汉堡回复体力，持续回血' }
    ],
    super: { n: '重量级轰炸', p: 3.1, e: ['stun'], d: '超必杀 · 体重量级轰炸' }
  },
  {
    id: 'fuerte', name: '埃尔·福尔特', en: 'EL FUERTE', style: '疾跑', tag: '速攻', kanji: '疾风', hue: 26,
    hp: 100, atk: 11, def: 8, spd: 12,
    skills: [
      { n: '疾跑突袭', c: 1, cd: 0, p: 1.3, e: [], d: '高速冲刺攻击' },
      { n: '虎式飞踢', c: 1, cd: 1, p: 1.5, e: ['execute'], d: '飞踢处决残血对手' },
      { n: '烹饪灵感', c: 0, cd: 2, p: 0, e: ['heal', 'atkUp'], d: '灵感料理回复并提升攻击' },
      { n: '龙卷风摔', c: 2, cd: 3, p: 1.95, e: ['unguard'], d: '高速摔投' }
    ],
    super: { n: '超级墨西哥摔', p: 3.0, e: ['unguard'], d: '超必杀 · 摔角大绝' }
  },
  {
    id: 'cody', name: '科迪', en: 'CODY', style: '街头格斗', tag: '均衡', kanji: '街头', hue: 220,
    hp: 100, atk: 11, def: 9, spd: 9,
    skills: [
      { n: '犯罪连击', c: 1, cd: 0, p: 1.35, e: ['bleed'], d: '街头连击，造成流血' },
      { n: '碎石拳', c: 1, cd: 1, p: 1.6, e: [], d: '碎石重拳' },
      { n: '铁链防御', c: 0, cd: 2, p: 0, e: ['shield', 'counter'], d: '甩链防御并准备反击' },
      { n: '监狱暴动', c: 2, cd: 3, p: 2.0, e: ['stun'], d: '暴动冲拳，眩晕对手' }
    ],
    super: { n: '最终罪犯', p: 3.0, e: ['unguard', 'execute'], d: '超必杀 · 罪犯之王' }
  },
  {
    id: 'guy', name: '盖伊', en: 'GUY', style: '忍术', tag: '速攻', kanji: '疾影', hue: 150,
    hp: 94, atk: 10, def: 9, spd: 12,
    skills: [
      { n: '疾影拳', c: 1, cd: 0, p: 1.3, e: [], d: '影一般的高速拳' },
      { n: '隼踢', c: 1, cd: 1, p: 1.45, e: ['multi'], d: '两段隼踢' },
      { n: '忍者步伐', c: 0, cd: 2, p: 0, e: ['counter', 'atkUp'], d: '忍者步法，反击并提升攻击' },
      { n: '疾风连斩', c: 2, cd: 3, p: 0.85, e: ['multi', 'bleed'], d: '高速斩击，附加流血' }
    ],
    super: { n: '影分身术', p: 2.9, e: ['multi'], d: '超必杀 · 分身连击' }
  },
  {
    id: 'ibuki', name: '伊吹', en: 'IBUKI', style: '忍术', tag: '技巧', kanji: '忍法', hue: 250,
    hp: 94, atk: 11, def: 8, spd: 13,
    skills: [
      { n: '苦无投掷', c: 0, cd: 0, p: 1.05, e: ['bleed'], d: '远程苦无，造成流血' },
      { n: '疾风踢', c: 1, cd: 1, p: 1.45, e: [], d: '高速踢击' },
      { n: '忍法替身', c: 0, cd: 2, p: 0, e: ['counter', 'cleanse'], d: '替身术，反击并净化负面状态' },
      { n: '风魔手里剑', c: 2, cd: 3, p: 1.8, e: ['multi'], d: '巨大手里剑连投' }
    ],
    super: { n: '忍法·千鸟', p: 2.8, e: ['multi', 'bleed'], d: '超必杀 · 千鸟乱舞' }
  },
  {
    id: 'makoto', name: '真琴', en: 'MAKOTO', style: '空手道', tag: '重装', kanji: '灭杀', hue: 100,
    hp: 102, atk: 12, def: 9, spd: 8,
    skills: [
      { n: '灭杀正拳', c: 1, cd: 1, p: 1.55, e: [], d: '全力正拳' },
      { n: '疾风冲拳', c: 1, cd: 0, p: 1.45, e: [], d: '冲身正拳' },
      { n: '空手之魂', c: 0, cd: 2, p: 0, e: ['atkUp', 'armor'], d: '气势提升攻击并获得霸体' },
      { n: '究极正拳', c: 2, cd: 3, p: 2.2, e: ['stun'], d: '究极一击，眩晕对手' }
    ],
    super: { n: '灭杀奥义', p: 3.2, e: [], d: '超必杀 · 灭杀奥义' }
  },
  {
    id: 'deejay', name: '迪杰', en: 'DEE JAY', style: '节奏踢拳', tag: '远程', kanji: '节奏', hue: 180,
    hp: 100, atk: 10, def: 9, spd: 10,
    skills: [
      { n: '节奏拳', c: 0, cd: 1, p: 0.9, e: ['multi'], d: '节奏二连拳' },
      { n: '双旋踢', c: 1, cd: 0, p: 1.4, e: [], d: '旋转双踢' },
      { n: '舞台魅力', c: 0, cd: 2, p: 0, e: ['heal', 'atkUp'], d: '舞台演出，回复并提升攻击' },
      { n: '音波轰炸', c: 2, cd: 3, p: 0.9, e: ['multi', 'drainSuper'], d: '音波连击，削减能量' }
    ],
    super: { n: '狂欢节', p: 2.9, e: ['multi', 'heal'], d: '超必杀 · 狂欢节连段' }
  },
  {
    id: 'hawk', name: 'T.霍克', en: 'T.HAWK', style: '战斧', tag: '重装', kanji: '战斧', hue: 18,
    hp: 112, atk: 12, def: 10, spd: 6,
    skills: [
      { n: '战斧冲撞', c: 1, cd: 0, p: 1.5, e: [], d: '战斧式冲撞' },
      { n: '空投摔', c: 1, cd: 1, p: 1.95, e: ['unguard'], d: '高空摔投，无法防御' },
      { n: '大地守护', c: 0, cd: 2, p: 0, e: ['armor', 'defUp'], d: '大地之力减伤' },
      { n: '鹰之俯冲', c: 2, cd: 3, p: 2.0, e: ['stun'], d: '俯冲重击，眩晕对手' }
    ],
    super: { n: '大地之怒', p: 3.1, e: ['unguard'], d: '超必杀 · 大地之怒' }
  },
  {
    id: 'feilong', name: '飞龙', en: 'FEI LONG', style: '截拳道', tag: '速攻', kanji: '炎龙', hue: 10,
    hp: 98, atk: 11, def: 9, spd: 10,
    skills: [
      { n: '烈火拳', c: 1, cd: 0, p: 1.3, e: ['burn'], d: '烈焰连拳，附加灼烧' },
      { n: '龙踢', c: 1, cd: 1, p: 1.5, e: [], d: '腾空龙踢' },
      { n: '截拳之道', c: 0, cd: 2, p: 0, e: ['counter', 'atkUp'], d: '截击反击并提升攻击' },
      { n: '烈焰连舞', c: 2, cd: 3, p: 0.85, e: ['multi', 'burn'], d: '烈焰连舞，附加灼烧' }
    ],
    super: { n: '炎龙乱舞', p: 2.9, e: ['multi', 'burn'], d: '超必杀 · 炎龙乱舞' }
  },
  {
    id: 'adon', name: '阿顿', en: 'ADON', style: '泰拳', tag: '速攻', kanji: '碎骨', hue: 64,
    hp: 94, atk: 12, def: 7, spd: 12,
    skills: [
      { n: '碎骨踢', c: 1, cd: 0, p: 1.45, e: [], d: '低扫碎骨踢' },
      { n: '虎牙拳', c: 1, cd: 1, p: 1.55, e: ['execute'], d: '虎牙重拳，处决残血' },
      { n: '泰拳架势', c: 0, cd: 2, p: 0, e: ['atkUp', 'counter'], d: '泰拳架势，攻击提升并反击' },
      { n: '灭杀连踢', c: 2, cd: 3, p: 0.9, e: ['multi'], d: '连环膝踢' }
    ],
    super: { n: '阿顿之牙', p: 3.0, e: ['execute'], d: '超必杀 · 撕咬之牙' }
  },
  {
    id: 'nash', name: '纳什', en: 'NASH', style: '特工格斗', tag: '均衡', kanji: '音速', hue: 186,
    hp: 96, atk: 11, def: 10, spd: 10,
    skills: [
      { n: '音速爆击', c: 1, cd: 0, p: 1.35, e: [], d: '音速拳击' },
      { n: '音速突袭', c: 1, cd: 1, p: 1.5, e: [], d: '音速突进' },
      { n: '特工防卫', c: 0, cd: 2, p: 0, e: ['shield', 'counter'], d: '特工防御并准备反击' },
      { n: '正义之拳', c: 2, cd: 3, p: 1.9, e: ['driveDrain'], d: '正义重拳，削减驱动' }
    ],
    super: { n: '音速终结', p: 2.9, e: ['pierce', 'stun'], d: '超必杀 · 音速终结' }
  },
  {
    id: 'urien', name: '尤里安', en: 'URIEN', style: '雷光', tag: '远程', kanji: '雷光', hue: 260,
    hp: 104, atk: 12, def: 10, spd: 8,
    skills: [
      { n: '雷光拳', c: 1, cd: 0, p: 1.35, e: ['pierce'], d: '雷光拳，穿透防御' },
      { n: '雷霆踢', c: 1, cd: 1, p: 1.5, e: [], d: '雷霆踢击' },
      { n: '雷光护甲', c: 0, cd: 2, p: 0, e: ['armor', 'defUp'], d: '雷光护甲减伤' },
      { n: '雷神之怒', c: 2, cd: 3, p: 2.0, e: ['stun'], d: '雷神之怒，眩晕对手' }
    ],
    super: { n: '雷霆审判', p: 3.1, e: ['unguard'], d: '超必杀 · 雷霆审判' }
  },
  {
    id: 'elena', name: '伊莲娜', en: 'ELENA', style: '治愈之风', tag: '技巧', kanji: '治愈', hue: 120,
    hp: 96, atk: 9, def: 10, spd: 11,
    skills: [
      { n: '治愈之风', c: 0, cd: 2, p: 0, e: ['heal', 'regen'], d: '回复体力并持续回血' },
      { n: '长腿踢', c: 1, cd: 0, p: 1.35, e: [], d: '长腿踢击' },
      { n: '治愈之舞', c: 1, cd: 2, p: 0, e: ['heal', 'cleanse'], d: '治愈之舞，净化负面状态' },
      { n: '自然之怒', c: 2, cd: 3, p: 1.85, e: ['multi'], d: '自然之力两段连击' }
    ],
    super: { n: '大地祝福', p: 2.4, e: ['heal', 'regen', 'armor'], d: '超必杀 · 大地祝福，回血并获得霸体' }
  },
  {
    id: 'luke', name: '卢克', en: 'LUKE', style: '现代格斗', tag: '均衡', kanji: '冲击', hue: 214,
    hp: 100, atk: 11, def: 10, spd: 9,
    skills: [
      { n: '冲击拳', c: 1, cd: 0, p: 1.35, e: [], d: '现代冲击拳' },
      { n: '沙袋连击', c: 1, cd: 1, p: 0.95, e: ['multi'], d: '沙袋二连击' },
      { n: '现代防守', c: 0, cd: 2, p: 0, e: ['armor', 'counter'], d: '现代防守，减伤并反击' },
      { n: '冲击弹', c: 2, cd: 3, p: 1.9, e: ['pierce', 'driveDrain'], d: '冲击弹，穿透并削驱动' }
    ],
    super: { n: '终极冲击', p: 3.0, e: ['execute'], d: '超必杀 · 终极冲击' }
  },
  {
    id: 'jamie', name: '杰米', en: 'JAMIE', style: '醉拳', tag: '技巧', kanji: '醉拳', hue: 168,
    hp: 97, atk: 10, def: 9, spd: 11,
    skills: [
      { n: '醉拳连击', c: 0, cd: 1, p: 0.9, e: ['multi'], d: '醉步二连击' },
      { n: '烈酒之拳', c: 1, cd: 0, p: 1.4, e: [], d: '烈酒强化拳' },
      { n: '饮酒', c: 0, cd: 2, p: 0, e: ['atkUp', 'heal'], d: '饮酒提升攻击并回复体力' },
      { n: '醉龙拳', c: 2, cd: 3, p: 2.0, e: ['stun'], d: '醉龙拳，眩晕对手' }
    ],
    super: { n: '醉龙奥义', p: 3.0, e: ['unguard', 'lifesteal'], d: '超必杀 · 醉龙奥义' }
  }
];
