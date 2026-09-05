// 角色渲染器 v3.0：日式动画风（魔卡少女樱/魔神英雄坛式）：捏脸（免费）+ 9 部位装扮分层组装
// 脸型尖下巴、樱花大眼、满头发包裹；装扮锚点与 v2 完全兼容
import { WARDROBE_ART, WARDROBE_PARTS } from './wardrobe.js';

// 自定义装扮注册表（小助手豆豆按描述生成，运行时注入）
const CUSTOM_ART = new Map();
export function registerCustomArt(items = []) {
  CUSTOM_ART.clear();
  for (const it of items) CUSTOM_ART.set(it.id, it.art);
}
export function getArt(id) {
  return WARDROBE_ART[id] ?? CUSTOM_ART.get(id) ?? '';
}

export const VB_W = 200;
export const VB_H = 300;

// ---------- 调色板（捏脸免费项） ----------
export const SKIN_TONES = [
  { name: '奶白', S: '#fdeee2', LINE: '#c49a7d', BLUSH: '#f7a8b8' },
  { name: '蜜桃', S: '#fbdcc4', LINE: '#b98763', BLUSH: '#f2909f' },
  { name: '小麦', S: '#eabb8c', LINE: '#96683f', BLUSH: '#e88a96' },
  { name: '蜜糖', S: '#c98d5f', LINE: '#7c5230', BLUSH: '#d97e86' },
];

export const HAIR_COLORS = [
  { name: '乌黑', H: '#3a3340', HAIR_D: '#262130' },
  { name: '栗子', H: '#6b4a35', HAIR_D: '#4e3325' },
  { name: '奶茶', H: '#b98e60', HAIR_D: '#946c44' },
  { name: '亚麻', H: '#dcc394', HAIR_D: '#b89a68' },
  { name: '樱花粉', H: '#f2a9c4', HAIR_D: '#d67f9f' },
  { name: '雾霾蓝', H: '#8fb0e0', HAIR_D: '#6989bd' },
  { name: '薄荷绿', H: '#9fd8b4', HAIR_D: '#74b28b' },
  { name: '银灰', H: '#d9d7e0', HAIR_D: '#aeabc0' },
];

export const EYE_COLORS = [
  { name: '玫瑰粉', E: '#a34b6f' },
  { name: '深棕', E: '#4a3527' },
  { name: '海蓝', E: '#3f6fc4' },
  { name: '琥珀', E: '#b07a33' },
  { name: '抹茶', E: '#55884f' },
  { name: '紫水晶', E: '#8458b8' },
];

// ---------- 素体（日式动画风：圆颅尖下巴脸、细颈、收腰躯干、小手、锥形腿） ----------
// 装扮锚点（与 50 件装扮兼容，不可改）：头顶 y40、下巴 y139、眼 (80,97)/(120,97)、
//   耳 (53,94)/(147,94)、颈 y126-150、躯干 y146-214（肩 x84-116）、
//   肩枢轴 (87,150)/(113,150)、手 (47,191)/(153,191)、腿 x90/x110、腿尾 y292
// 按骨骼拆件：ARM_L/ARM_R/LEG_L/LEG_R/CORE
const ARM_L = `
<path d="M87 149 Q81 151 76 156 L53 177 Q46 183 44.5 189 Q43.5 194.5 48.5 195.5 Q53 196 56.5 191.5 L84 164 Q90 158 89 151 Z" fill="SKIN" stroke="LINE" stroke-width="2.4" stroke-linejoin="round"/>`;
const ARM_R = `
<path d="M113 149 Q119 151 124 156 L147 177 Q154 183 155.5 189 Q156.5 194.5 151.5 195.5 Q147 196 143.5 191.5 L116 164 Q110 158 111 151 Z" fill="SKIN" stroke="LINE" stroke-width="2.4" stroke-linejoin="round"/>`;
const LEG_L = `
<path d="M86 208 Q82 238 83 266 Q83.5 284 84.5 289 Q86 292 90 292 Q94 292 95.5 289 Q96.8 283 97 266 Q97.5 238 98 212 Z" fill="SKIN" stroke="LINE" stroke-width="2.4" stroke-linejoin="round"/>`;
const LEG_R = `
<path d="M114 208 Q118 238 117 266 Q116.5 284 115.5 289 Q114 292 110 292 Q106 292 104.5 289 Q103.2 283 103 266 Q102.5 238 102 212 Z" fill="SKIN" stroke="LINE" stroke-width="2.4" stroke-linejoin="round"/>`;
const CORE = `
<path d="M94 126 L94 150 L106 150 L106 126 Z" fill="SKIN" stroke="LINE" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M94 129 Q100 136 106 129 L106 126 L94 126 Z" fill="LINE" opacity="0.18"/>
<path d="M91 146 Q84 150 84 161 L85 184 Q86 202 92 211 Q100 216 108 211 Q114 202 115 184 L116 161 Q116 150 109 146 Q100 152 91 146 Z" fill="SKIN" stroke="LINE" stroke-width="2.6" stroke-linejoin="round"/>
<path d="M93 151 Q97 154.5 100 154 Q103 154.5 107 151" fill="none" stroke="LINE" stroke-width="1.4" opacity="0.3"/>
<path d="M52 92 Q50 42 100 40 Q150 42 148 92 Q147 110 136 121 Q122 135 100 139 Q78 135 64 121 Q53 110 52 92 Z" fill="SKIN" stroke="LINE" stroke-width="2.8" stroke-linejoin="round"/>
<path d="M67 85 Q77 78.5 88 82.5 M112 82.5 Q123 78.5 133 85" fill="none" stroke="HAIR_D" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>
<path d="M99.5 110.5 Q98.5 112.5 100 114" fill="none" stroke="LINE" stroke-width="1.6" opacity="0.5" stroke-linecap="round"/>`;

// 骨骼锚点（viewBox 坐标，房间视图旋转枢轴用）
export const PIVOTS = { armL: [87, 150], armR: [113, 150], legL: [90, 210], legR: [110, 210], feet: [100, 292] };

// 日式动画眼：白目 + 大虹膜 + 瞳孔 + 双高光 + 粗上睫毛线（左眼，右眼镜像）
const EYES = [
  {
    name: '樱花大眼',
    left: `
<path d="M68.5 95 Q70 85.5 80 84.5 Q90 85.5 91.5 95 Q92.5 105 86 109.5 Q80 113 74 109.5 Q67.5 105 68.5 95 Z" fill="#ffffff"/>
<ellipse cx="80" cy="97.5" rx="7.6" ry="9.2" fill="EYE"/>
<path d="M72.6 99 Q80 107.5 87.4 99 Q85.5 106 80 106.8 Q74.5 106 72.6 99 Z" fill="#ffffff" opacity="0.4"/>
<ellipse cx="80" cy="98" rx="3.4" ry="4.6" fill="#241a26"/>
<circle cx="76.6" cy="92.5" r="3" fill="#ffffff"/>
<circle cx="84.2" cy="103" r="1.6" fill="#ffffff" opacity="0.85"/>
<path d="M67 94 Q69.5 83.5 80 82.5 Q90.5 83.5 93 94" fill="none" stroke="#332430" stroke-width="3.6" stroke-linecap="round"/>
<path d="M67 94 L63.8 91.5 M93 94 L96.2 92" fill="none" stroke="#332430" stroke-width="2.4" stroke-linecap="round"/>
<path d="M72.5 111 Q80 114.2 87.5 111" fill="none" stroke="#332430" stroke-width="1.5" opacity="0.45" stroke-linecap="round"/>`,
  },
  {
    name: '温柔垂眼',
    left: `
<path d="M69 94 Q71.5 86.5 80.5 86 Q89.5 86.5 91 95 Q92 104.5 85.5 109 Q78.5 112.5 73 108 Q68 103.5 69 94 Z" fill="#ffffff"/>
<ellipse cx="80" cy="97.5" rx="7" ry="8.6" fill="EYE"/>
<ellipse cx="80" cy="98" rx="3.1" ry="4.2" fill="#241a26"/>
<circle cx="77" cy="93" r="2.6" fill="#ffffff"/>
<circle cx="83.6" cy="102.5" r="1.4" fill="#ffffff" opacity="0.8"/>
<path d="M68 93 Q71 84.5 80.5 84.5 Q89 85 91.8 92.5" fill="none" stroke="#332430" stroke-width="3" stroke-linecap="round"/>
<path d="M68 93 L65.5 92 M91.8 92.5 L94 93.5" fill="none" stroke="#332430" stroke-width="2" stroke-linecap="round"/>
<path d="M73 110 Q80 113 87 110" fill="none" stroke="#332430" stroke-width="1.5" opacity="0.4" stroke-linecap="round"/>`,
  },
  {
    name: '傲娇上挑',
    left: `
<path d="M69 96 Q71 87 80 86 Q90 86.5 92 94 Q93 103 86 108 Q79 111.5 73 107.5 Q68 103.5 69 96 Z" fill="#ffffff"/>
<ellipse cx="80.5" cy="97" rx="7" ry="8.4" fill="EYE"/>
<ellipse cx="80.5" cy="97.5" rx="3.1" ry="4.2" fill="#241a26"/>
<circle cx="77.5" cy="92" r="2.6" fill="#ffffff"/>
<path d="M67.5 95.5 Q70.5 85.5 80.5 85 Q89.5 85.5 93.5 91 L96.5 88.5" fill="none" stroke="#332430" stroke-width="3.4" stroke-linecap="round"/>
<path d="M73 109.5 Q80 112.5 87.5 109" fill="none" stroke="#332430" stroke-width="1.5" opacity="0.45" stroke-linecap="round"/>`,
  },
  {
    name: '弯弯笑眼',
    left: `
<path d="M69 100 Q80 87.5 91 100" fill="none" stroke="#332430" stroke-width="4" stroke-linecap="round"/>
<path d="M69 100 L65.5 98 M91 100 L94.5 98" fill="none" stroke="#332430" stroke-width="2.4" stroke-linecap="round"/>
<path d="M73 106 Q80 109 87 106" fill="none" stroke="#332430" stroke-width="1.4" opacity="0.35" stroke-linecap="round"/>`,
  },
  {
    name: '酷帅半眸',
    left: `
<path d="M70 96 Q73.5 90 81 90 Q88.5 90.5 91 96 Q90 103.5 80.5 104.5 Q72.5 103.5 70 96 Z" fill="#ffffff"/>
<ellipse cx="80.5" cy="97" rx="6.2" ry="6.4" fill="EYE"/>
<ellipse cx="80.5" cy="97.5" rx="2.8" ry="3.4" fill="#241a26"/>
<circle cx="78" cy="93.5" r="2.2" fill="#ffffff"/>
<path d="M68 94.5 Q73.5 88.5 81.5 88.8 Q88.5 89.2 92.5 93.5" fill="none" stroke="#332430" stroke-width="3.2" stroke-linecap="round"/>
<path d="M70.5 94 Q80 91.8 90.5 94" fill="none" stroke="#332430" stroke-width="1.8" stroke-linecap="round"/>
<path d="M74 106.5 Q80.5 109 87 106.5" fill="none" stroke="#332430" stroke-width="1.4" opacity="0.4" stroke-linecap="round"/>`,
  },
  {
    name: '星瞳闪闪',
    left: `
<path d="M68.5 95 Q70 85 80 84 Q90 85 91.5 95 Q92.5 105.5 86 110 Q80 113.5 74 110 Q67.5 105.5 68.5 95 Z" fill="#ffffff"/>
<ellipse cx="80" cy="97.5" rx="7.8" ry="9.4" fill="EYE"/>
<path d="M72.4 99 Q80 108 87.6 99 Q85.5 106.5 80 107.2 Q74.5 106.5 72.4 99 Z" fill="#ffffff" opacity="0.45"/>
<ellipse cx="80" cy="98" rx="3.4" ry="4.6" fill="#241a26"/>
<path d="M76.5 89.5 L77.6 92.2 L80.4 92.6 L78.3 94.5 L78.9 97.3 L76.5 95.8 L74.1 97.3 L74.7 94.5 L72.6 92.6 L75.4 92.2 Z" fill="#ffffff"/>
<circle cx="84.5" cy="103.5" r="1.7" fill="#ffffff" opacity="0.9"/>
<path d="M67 94 Q69.5 83 80 82 Q90.5 83 93 94" fill="none" stroke="#332430" stroke-width="3.6" stroke-linecap="round"/>
<path d="M67 94 L63.8 91.5 M93 94 L96.2 92" fill="none" stroke="#332430" stroke-width="2.4" stroke-linecap="round"/>`,
  },
  { name: '豆豆眼', left: `<circle cx="80" cy="97" r="4.2" fill="EYE"/><circle cx="78.6" cy="95.4" r="1.3" fill="#ffffff"/>` },
];

const MOUTHS = [
  { name: '甜甜一笑', path: `<path d="M92 119 Q100 126.5 108 119" fill="none" stroke="#d4686e" stroke-width="3.2" stroke-linecap="round"/>` },
  { name: '啊呜张嘴', path: `<path d="M91.5 118 Q100 131 108.5 118 Q100 122.5 91.5 118 Z" fill="#c4525c"/><path d="M95.5 123.5 Q100 127.5 104.5 123.5 Q100 129 95.5 123.5 Z" fill="#f28b8e"/>` },
  { name: '猫嘴 ω', path: `<path d="M92 119 Q96 125 100 120 Q104 125 108 119" fill="none" stroke="#d4686e" stroke-width="2.8" stroke-linecap="round"/>` },
  { name: '抿嘴', path: `<path d="M95 121 L105 121" fill="none" stroke="#d4686e" stroke-width="3.2" stroke-linecap="round"/>` },
  { name: '小圆嘴', path: `<ellipse cx="100" cy="121" rx="3.4" ry="4.4" fill="#c4525c"/>` },
  { name: '点点嘴', path: `<circle cx="100" cy="119" r="1.7" fill="#7a4a58"/>` },
];

// 动画式腮红：软椭圆 + 斜线
const BLUSH = `
<ellipse cx="66" cy="114" rx="9" ry="5" fill="BLUSH" opacity="0.38"/>
<path d="M61 116 L66 111 M66 117 L71 112" stroke="BLUSH" stroke-width="1.6" opacity="0.5" stroke-linecap="round"/>
<ellipse cx="134" cy="114" rx="9" ry="5" fill="BLUSH" opacity="0.38"/>
<path d="M129 116 L134 111 M134 117 L139 112" stroke="BLUSH" stroke-width="1.6" opacity="0.5" stroke-linecap="round"/>
`;
// 通用头顶发丝高光（叠在后发之上，白色半透明适配任意发色）
const HAIR_SHINE = `<path d="M64 54 Q100 40 136 54" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.22"/>`;

// 日式动画发型：back=脑后发廓（大于头廓露出边缘），front=填充刘海+侧发绺（盖住额头）
// 刘海下缘为尖锐发绺（尖角朝下），发梢贴近眉睫
const BANGS_SOFT = `<path d="M56 96 Q52 40 100 36 Q148 40 144 96 L138 82 L133 90 L126 74 L119 84 L112 70 L105 80 L100 68 L95 80 L88 70 L81 84 L74 74 L67 90 L62 82 Z" fill="HAIR"/><path d="M88 70 L86 56 M112 70 L114 56" fill="none" stroke="HAIR_D" stroke-width="1.6" opacity="0.5"/>`;
const LOCKS_SHORT = `<path d="M55 90 Q50 110 55 126 Q58 132 61 126 Q57 110 61 92 Z" fill="HAIR"/><path d="M145 90 Q150 110 145 126 Q142 132 139 126 Q143 110 139 92 Z" fill="HAIR"/>`;
const CAP_BACK = `<path d="M46 100 Q40 32 100 30 Q160 32 154 100 Q154 116 147 128 Q143 114 143.5 98 Q143 64 100 60 Q57 64 56.5 98 Q57 114 53 128 Q46 116 46 100 Z" fill="HAIR"/>`;
const HAIRS = [
  {
    name: '软软短发',
    back: CAP_BACK,
    front: `
${BANGS_SOFT}
${LOCKS_SHORT}
<path d="M84 74 L82 58 M110 74 L112 58" fill="none" stroke="HAIR_D" stroke-width="1.6" opacity="0.5"/>`,
  },
  {
    name: '齐刘海',
    back: `<path d="M46 102 Q40 32 100 30 Q160 32 154 102 Q154 118 148 128 L142 98 Q140 64 100 60 Q60 64 58 98 L52 128 Q46 118 46 102 Z" fill="HAIR"/>`,
    front: `
<path d="M56 96 Q52 40 100 36 Q148 40 144 96 L140 78 L134 86 L128 78 L122 86 L116 78 L110 86 L104 78 L100 86 L96 78 L90 86 L84 78 L78 86 L72 78 L66 86 L60 78 Z" fill="HAIR"/>
${LOCKS_SHORT}`,
  },
  {
    name: '波波头',
    back: `<path d="M44 108 Q38 30 100 28 Q162 30 156 108 Q157 126 146 134 Q140 138 139 130 Q146 112 144.5 96 Q143 62 100 58 Q57 62 55.5 96 Q54 112 61 130 Q60 138 54 134 Q43 126 44 108 Z" fill="HAIR"/>`,
    front: `
<path d="M56 98 Q50 38 100 35 Q150 38 144 98 L137 84 L131 92 L124 76 L117 88 L109 72 L100 84 L91 72 L83 88 L76 76 L69 92 L63 84 Z" fill="HAIR"/>
<path d="M54 88 Q48 112 54 132 Q58 140 62 133 Q57 112 62 90 Z" fill="HAIR"/>
<path d="M146 88 Q152 112 146 132 Q142 140 138 133 Q143 112 138 90 Z" fill="HAIR"/>`,
  },
  {
    name: '长直发',
    back: `<path d="M46 190 Q38 32 100 30 Q162 32 154 190 Q154 201 145 199 L139 186 Q146 120 143 96 Q141 62 100 58 Q59 62 57 96 Q54 120 61 186 L55 199 Q46 201 46 190 Z" fill="HAIR"/>`,
    front: `
${BANGS_SOFT}
<path d="M57 88 Q49 122 53 158 Q55 168 62 166 Q67 162 65 150 Q61 118 66 92 Z" fill="HAIR"/>
<path d="M143 88 Q151 122 147 158 Q145 168 138 166 Q133 162 135 150 Q139 118 134 92 Z" fill="HAIR"/>`,
  },
  {
    name: '呆毛短发',
    back: CAP_BACK,
    front: `
${BANGS_SOFT}
${LOCKS_SHORT}
<path d="M98 40 Q92 17 113 11 Q102 27 106 38 Z" fill="HAIR" stroke="HAIR_D" stroke-width="1.5"/>`,
  },
  {
    name: '双马尾',
    back: `
${CAP_BACK}
<path d="M58 76 Q26 90 30 138 Q32 163 49 169 Q59 172 58 161 Q48 142 52 116 Q54 92 68 84 Z" fill="HAIR"/>
<path d="M142 76 Q174 90 170 138 Q168 163 151 169 Q141 172 142 161 Q152 142 148 116 Q146 92 132 84 Z" fill="HAIR"/>`,
    front: `
${BANGS_SOFT}
<circle cx="58" cy="82" r="6" fill="HAIR_D"/>
<circle cx="142" cy="82" r="6" fill="HAIR_D"/>`,
  },
  {
    name: '侧马尾',
    back: `
${CAP_BACK}
<path d="M140 72 Q174 86 171 132 Q169 158 152 164 Q142 167 143 156 Q152 138 148 114 Q146 90 130 80 Z" fill="HAIR"/>`,
    front: `
${BANGS_SOFT}
<circle cx="140" cy="78" r="6" fill="HAIR_D"/>`,
  },
  {
    name: '姬式长直发',
    back: `
<path d="M48 100 Q42 32 100 30 Q158 32 152 100 L156 198 Q156 216 138 218 L62 218 Q44 216 44 198 Z" fill="HAIR"/>
<path d="M64 100 L60 210 M136 100 L140 210" stroke="HAIR_D" stroke-width="2" opacity="0.5"/>`,
    front: `
<path d="M56 96 Q52 40 100 36 Q148 40 144 96 L140 78 L134 86 L128 78 L122 86 L116 78 L110 86 L104 78 L100 86 L96 78 L90 86 L84 78 L78 86 L72 78 L66 86 L60 78 Z" fill="HAIR"/>
<path d="M56 86 Q47 122 51 156 Q53 166 60 164 Q66 161 64 149 Q60 116 65 90 Z" fill="HAIR"/>
<path d="M144 86 Q153 122 149 156 Q147 166 140 164 Q134 161 136 149 Q140 116 135 90 Z" fill="HAIR"/>`,
  },
  {
    name: '刺猬头',
    back: `
<path d="M100 32 L118 48 L138 40 L136 64 L156 72 L143 89 L154 108 L131 101 L100 116 L69 101 L46 108 L57 89 L44 72 L64 64 L62 40 L82 48 Z" fill="HAIR"/>
<path d="M48 96 Q42 34 100 32 Q158 34 152 96 Q140 68 100 64 Q60 68 48 96 Z" fill="HAIR"/>`,
    front: `
<path d="M56 92 Q52 40 100 36 Q148 40 144 92 L136 78 L128 92 L118 72 L108 90 L100 70 L92 90 L82 72 L72 92 L64 78 Z" fill="HAIR"/>
<path d="M54 88 Q50 100 54 112 Q57 117 60 112 Q56 100 60 90 Z" fill="HAIR"/>
<path d="M146 88 Q150 100 146 112 Q143 117 140 112 Q144 100 140 90 Z" fill="HAIR"/>`,
  },
];

function fillTokens(svg, map) {
  return svg.replace(/\b(SKIN|LINE|BLUSH|HAIR_D|HAIR|EYE)\b/g, token => map[token] ?? token);
}

function mirror(leftSvg) {
  return `<g transform="translate(200 0) scale(-1 1)">${leftSvg}</g>`;
}

export function getPartOptions() {
  return {
    skin: SKIN_TONES.map((p, i) => ({ i, name: p.name })),
    eyes: EYES.map((p, i) => ({ i, name: p.name })),
    eyeColor: EYE_COLORS.map((p, i) => ({ i, name: p.name })),
    mouth: [{ i: -1, name: '不画嘴' }, ...MOUTHS.map((p, i) => ({ i, name: p.name }))],
    hair: HAIRS.map((p, i) => ({ i, name: p.name })),
    hairColor: HAIR_COLORS.map((p, i) => ({ i, name: p.name })),
  };
}

// cfg = { skin, eyes, eyeColor, mouth, hair, hairColor, showBlush, outfit: {hat,glasses,top,bottom,shoes,held,back} }
// 捏脸部位传 -1 表示空白小人；装扮传 "" / 缺省表示未穿戴
// 分层输出（房间视图骨骼用）：back / armL / armR / legL / legR / core，拼接顺序即绘制顺序
export function buildCharacterLayers(cfg = {}) {
  const skin = SKIN_TONES[cfg.skin ?? 0];
  const hairColor = HAIR_COLORS[cfg.hairColor ?? 0];
  const eyeColor = EYE_COLORS[cfg.eyeColor ?? 0];
  const colors = {
    SKIN: skin.S, LINE: skin.LINE, BLUSH: skin.BLUSH,
    HAIR: hairColor.H, HAIR_D: hairColor.HAIR_D, EYE: eyeColor.E,
  };

  const o = cfg.outfit ?? {};
  const hair = cfg.hair >= 0 ? HAIRS[cfg.hair] : null;
  const eye = cfg.eyes >= 0 ? EYES[cfg.eyes] : null;
  const mouth = cfg.mouth >= 0 ? MOUTHS[cfg.mouth] : null;

  const top = o.top ? WARDROBE_PARTS[o.top] : null;   // 自定义装扮无拆件 → 整体静态
  const topCustom = o.top && !top ? getArt(o.top) : '';
  const bot = o.bottom ? WARDROBE_PARTS[o.bottom] : null;
  const botCustom = o.bottom && !bot ? getArt(o.bottom) : '';
  const sho = o.shoes ? WARDROBE_PARTS[o.shoes] : null;
  const shoCustom = o.shoes && !sho ? getArt(o.shoes) : '';

  const layers = {
    back: [o.back && getArt(o.back), hair && hair.back, hair && HAIR_SHINE].filter(Boolean).join('\n'),
    armL: [ARM_L, top?.armL].filter(Boolean).join('\n'),
    armR: [ARM_R, top?.armR, o.held && getArt(o.held)].filter(Boolean).join('\n'),
    legL: [LEG_L, sho?.shoeL, bot?.legL].filter(Boolean).join('\n'),
    legR: [LEG_R, sho?.shoeR, bot?.legR].filter(Boolean).join('\n'),
    core: [
      CORE, shoCustom,
      bot?.hip ?? bot?.torso ?? botCustom,
      top?.torso ?? topCustom,
      eye && fillTokens(eye.left, colors), eye && mirror(fillTokens(eye.left, colors)),
      mouth && mouth.path, cfg.showBlush && BLUSH, hair && hair.front,
      o.earring && getArt(o.earring), o.glasses && getArt(o.glasses), o.hat && getArt(o.hat),
    ].filter(Boolean).join('\n'),
  };
  for (const k of Object.keys(layers)) layers[k] = fillTokens(layers[k], colors);
  return layers;
}

export function buildCharacter(cfg = {}) {
  const l = buildCharacterLayers(cfg);
  return [l.back, l.armL, l.armR, l.legL, l.legR, l.core].join('\n');
}

export function renderCharacterSVG(cfg = {}, scale = 1.4) {
  const w = Math.round(VB_W * scale);
  const h = Math.round(VB_H * scale);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${w}" height="${h}">${buildCharacter(cfg)}</svg>`;
}

// 转 data URL（供 Pixi 生成纹理；必须带显式宽高，否则部分 WebView 会把无固有尺寸的 SVG 纹理渲染成黑块）
export function characterDataURL(cfg = {}) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="${VB_W * 2}" height="${VB_H * 2}">${buildCharacter(cfg)}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// 后端 Face+Outfit → 渲染 cfg
export function profileCharToCfg(ch) {
  return {
    skin: ch.face.skin_tone,
    hair: ch.face.hair_style,
    hairColor: ch.face.hair_color,
    eyes: ch.face.eye_style,
    eyeColor: ch.face.eye_color,
    mouth: ch.face.mouth,
    showBlush: ch.face.show_blush,
    outfit: {
      hat: ch.outfit.hat, glasses: ch.outfit.glasses, top: ch.outfit.top,
      bottom: ch.outfit.bottom, shoes: ch.outfit.shoes, held: ch.outfit.held,
      back: ch.outfit.back, earring: ch.outfit.earring ?? '',
    },
  };
}

export const HAIR_LIST = HAIRS;
export const EYE_LIST = EYES;
export const MOUTH_LIST = MOUTHS;
