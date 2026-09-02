// 角色渲染器 v2.1：捏脸（免费）+ 9 部位装扮分层组装
// 层级：背饰 → 后发 → 素体 → 鞋 → 下装 → 上衣 → 手持 → 眼 → 嘴 → 腮红 → 前发 → 耳饰 → 眼镜 → 帽子
import { WARDROBE_ART } from './wardrobe.js';

export const VB_W = 200;
export const VB_H = 230;

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

// ---------- 素体（严格按参考图：椭圆躯干+肚脐、水平手臂三指手、无脚细长腿） ----------
// 锚点：头顶 y≈42，眼 y≈96，躯干椭圆 cx100 cy168 rx30 ry38，
//       左手 (30,150)，右手 (170,150)，腿根 y≈200，腿尾 y≈229
const BASE_BODY = `
<path d="M78 146 L34 147 Q29 150 34 154 L78 157 Q83 151 78 146 Z" fill="SKIN" stroke="LINE" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M122 146 L166 147 Q171 150 166 154 L122 157 Q117 151 122 146 Z" fill="SKIN" stroke="LINE" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M31 145 L24 142 M30 150 L22 150 M31 155 L24 158" stroke="LINE" stroke-width="2" stroke-linecap="round"/>
<path d="M169 145 L176 142 M170 150 L178 150 M169 155 L176 158" stroke="LINE" stroke-width="2" stroke-linecap="round"/>
<path d="M88 196 Q83 212 85 226 Q85 229.5 89 229.5 Q93 229.5 93 226 Q93.5 212 97 199 Z" fill="SKIN" stroke="LINE" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M112 196 Q117 212 115 226 Q115 229.5 111 229.5 Q107 229.5 107 226 Q106.5 212 103 199 Z" fill="SKIN" stroke="LINE" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="100" cy="168" rx="30" ry="38" fill="SKIN" stroke="LINE" stroke-width="3"/>
<ellipse cx="100" cy="176" rx="21" ry="25" fill="LINE" opacity="0.04"/>
<circle cx="100" cy="192" r="1.6" fill="LINE" opacity="0.8"/>
<ellipse cx="53" cy="92" rx="6.5" ry="8.5" fill="SKIN" stroke="LINE" stroke-width="2.5"/>
<ellipse cx="147" cy="92" rx="6.5" ry="8.5" fill="SKIN" stroke="LINE" stroke-width="2.5"/>
<circle cx="100" cy="90" r="48" fill="SKIN" stroke="LINE" stroke-width="3"/>
<path d="M70 83 Q78 78 86 81 M114 81 Q122 78 130 83" fill="none" stroke="#6b4a5f" stroke-width="2.6" stroke-linecap="round"/>
<circle cx="100" cy="106" r="1.3" fill="LINE" opacity="0.7"/>
`;

const EYES = [
  {
    name: '圆溜溜',
    left: `
<circle cx="80" cy="96" r="10.5" fill="#fffdfa" stroke="#3a2a33" stroke-width="1.8"/>
<circle cx="80" cy="98" r="7.2" fill="EYE"/>
<circle cx="80" cy="101.5" r="4.2" fill="EYE" opacity="0.55"/>
<circle cx="77.5" cy="93.5" r="2.9" fill="#ffffff"/>
<circle cx="83.5" cy="101" r="1.5" fill="#ffffff" opacity="0.9"/>`,
  },
  {
    name: '害羞粉桃眼',
    left: `
<ellipse cx="80" cy="99" rx="11" ry="8.5" fill="#ffdde6"/>
<path d="M68 100 Q80 90 92 100" fill="none" stroke="LINE" stroke-width="2.4" stroke-linecap="round"/>
<ellipse cx="80" cy="101.5" rx="6.5" ry="4.8" fill="#a34b6f"/>
<path d="M70 103 Q80 108.5 90 103" fill="none" stroke="#a34b6f" stroke-width="2.8" stroke-linecap="round"/>
<circle cx="77" cy="99" r="1.5" fill="#ffffff" opacity="0.85"/>`,
  },
  { name: '弯弯笑眼', left: `<path d="M70 99 Q80 89 90 99" fill="none" stroke="#3b2e28" stroke-width="4" stroke-linecap="round"/>` },
  { name: '豆豆眼', left: `<circle cx="80" cy="97" r="4.2" fill="EYE"/>` },
  {
    name: '下垂软萌',
    left: `
<path d="M71 97 Q80 90 89 97 Q86 107 80 107.5 Q74 107 71 97 Z" fill="EYE"/>
<circle cx="77.5" cy="95.5" r="2.4" fill="#ffffff"/>`,
  },
  {
    name: '认真挑眉',
    left: `
<path d="M72 98 Q80 104 88 98 Q84 105.5 80 105.5 Q76 105.5 72 98 Z" fill="EYE"/>
<path d="M71 87 Q80 84 89 87" fill="none" stroke="LINE" stroke-width="2.5" stroke-linecap="round"/>`,
  },
];

const MOUTHS = [
  { name: '甜甜一笑', path: `<path d="M92 119 Q100 127 108 119" fill="none" stroke="#d4686e" stroke-width="3.5" stroke-linecap="round"/>` },
  { name: '啊呜张嘴', path: `<path d="M91 118 Q100 132 109 118 Q100 122 91 118 Z" fill="#c4525c"/>` },
  { name: '猫嘴 ω', path: `<path d="M92 119 Q96 125 100 120 Q104 125 108 119" fill="none" stroke="#d4686e" stroke-width="3" stroke-linecap="round"/>` },
  { name: '抿嘴', path: `<path d="M95 121 L105 121" fill="none" stroke="#d4686e" stroke-width="3.5" stroke-linecap="round"/>` },
  { name: '小圆嘴', path: `<ellipse cx="100" cy="121" rx="3.6" ry="4.6" fill="#c4525c"/>` },
];

const BLUSH = `
<ellipse cx="64" cy="112" rx="10" ry="6" fill="BLUSH" opacity="0.4"/>
<ellipse cx="64" cy="112" rx="6" ry="3.6" fill="BLUSH" opacity="0.35"/>
<ellipse cx="136" cy="112" rx="10" ry="6" fill="BLUSH" opacity="0.4"/>
<ellipse cx="136" cy="112" rx="6" ry="3.6" fill="BLUSH" opacity="0.35"/>
`;
// 通用头顶发丝高光（叠在后发之上，白色半透明适配任意发色）
const HAIR_SHINE = `<path d="M68 56 Q100 43 132 56" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.2"/>`;

const HAIRS = [
  {
    name: '软软短发',
    back: `<path d="M51 96 Q45 38 100 36 Q155 38 149 96 Q149 76 132 68 Q112 59 100 61 Q88 59 68 68 Q51 76 51 96 Z" fill="HAIR"/>`,
    front: `<path d="M64 68 Q80 77 95 64 Q110 79 134 66" fill="none" stroke="HAIR_D" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    name: '齐刘海',
    back: `<path d="M51 96 Q45 38 100 36 Q155 38 149 96 L149 84 Q124 91 100 91 Q76 91 51 84 Z" fill="HAIR"/>`,
    front: `<path d="M63 88 L72 82 L81 89 L90 82 L99 89 L108 82 L117 89 L126 82 L137 87" fill="none" stroke="HAIR" stroke-width="5" stroke-linejoin="round"/>`,
  },
  {
    name: '波波头',
    back: `<path d="M49 118 Q38 34 100 32 Q162 34 151 118 Q152 126 141 123 Q148 86 130 71 Q112 60 100 61 Q88 60 70 71 Q52 86 59 123 Q48 126 49 118 Z" fill="HAIR"/>`,
    front: `<path d="M64 68 Q80 77 95 64 Q110 79 134 66" fill="none" stroke="HAIR_D" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    name: '长直发',
    back: `<path d="M49 188 Q40 34 100 32 Q160 34 151 188 Q151 197 141 194 L135 182 Q143 98 129 72 Q112 59 100 61 Q88 59 71 72 Q57 98 65 182 L59 194 Q49 197 49 188 Z" fill="HAIR"/>`,
    front: `<path d="M64 68 Q80 77 95 64 Q110 79 134 66" fill="none" stroke="HAIR_D" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    name: '呆毛短发',
    back: `<path d="M51 96 Q45 38 100 36 Q155 38 149 96 Q149 76 132 68 Q112 59 100 61 Q88 59 68 68 Q51 76 51 96 Z" fill="HAIR"/>`,
    front: `
<path d="M64 68 Q80 77 95 64 Q110 79 134 66" fill="none" stroke="HAIR_D" stroke-width="4" stroke-linecap="round"/>
<path d="M98 42 Q94 22 113 15 Q103 29 106 40 Z" fill="HAIR"/>`,
  },
  {
    name: '双马尾',
    back: `
<path d="M51 96 Q45 38 100 36 Q155 38 149 96 Q149 76 132 68 Q112 59 100 61 Q88 59 68 68 Q51 76 51 96 Z" fill="HAIR"/>
<path d="M57 80 Q28 92 31 134 Q32 156 46 163 Q56 167 57 157 Q48 141 51 116 Q53 95 64 87 Z" fill="HAIR"/>
<path d="M143 80 Q172 92 169 134 Q168 156 154 163 Q144 167 143 157 Q152 141 149 116 Q147 95 136 87 Z" fill="HAIR"/>`,
    front: `
<path d="M64 68 Q80 77 95 64 Q110 79 134 66" fill="none" stroke="HAIR_D" stroke-width="4" stroke-linecap="round"/>
<circle cx="57" cy="84" r="5.5" fill="HAIR_D"/>
<circle cx="143" cy="84" r="5.5" fill="HAIR_D"/>`,
  },
  {
    name: '侧马尾',
    back: `
<path d="M51 96 Q45 38 100 36 Q155 38 149 96 Q149 76 132 68 Q112 59 100 61 Q88 59 68 68 Q51 76 51 96 Z" fill="HAIR"/>
<path d="M141 76 Q170 88 168 128 Q167 152 152 158 Q143 161 143 151 Q151 136 148 114 Q146 93 132 84 Z" fill="HAIR"/>`,
    front: `
<path d="M64 68 Q80 77 95 64 Q110 79 134 66" fill="none" stroke="HAIR_D" stroke-width="4" stroke-linecap="round"/>
<circle cx="140" cy="80" r="5.5" fill="HAIR_D"/>`,
  },
  {
    name: '姬式长直发',
    back: `
<path d="M50 100 Q44 34 100 32 Q156 34 150 100 L154 196 Q154 214 138 216 L62 216 Q46 214 46 196 Z" fill="HAIR"/>
<path d="M70 70 L70 210 M130 70 L130 210" stroke="HAIR_D" stroke-width="2" opacity="0.5"/>`,
    front: `
<path d="M62 90 Q62 52 100 48 Q138 52 138 90 Q131 81 123 88 Q112 79 100 88 Q88 79 77 88 Q69 81 62 90 Z" fill="HAIR"/>
<path d="M100 48 L100 60" stroke="HAIR_D" stroke-width="2.5"/>
<path d="M58 86 Q52 118 54 150 Q55 161 62 161 Q66 159 65 148 Q64 116 68 92 Z" fill="HAIR"/>
<path d="M142 86 Q148 118 146 150 Q145 161 138 161 Q134 159 135 148 Q136 116 132 92 Z" fill="HAIR"/>`,
  },
  {
    name: '刺猬头',
    back: `
<path d="M100 38 L117 55 L137 49 L134 72 L151 78 L139 93 L147 110 L126 106 L100 120 L74 106 L53 110 L61 93 L49 78 L66 72 L63 49 L83 55 Z" fill="HAIR"/>
<path d="M51 96 Q45 38 100 36 Q155 38 149 96 Q149 76 132 68 Q112 59 100 61 Q88 59 68 68 Q51 76 51 96 Z" fill="HAIR"/>`,
    front: `<path d="M76 62 L84 50 M100 58 L102 44 M122 62 L128 50" fill="none" stroke="HAIR_D" stroke-width="4" stroke-linecap="round"/>`,
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
export function buildCharacter(cfg = {}) {
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

  const parts = [];
  if (o.back && WARDROBE_ART[o.back]) parts.push(WARDROBE_ART[o.back]);
  if (hair) parts.push(hair.back, HAIR_SHINE);
  parts.push(BASE_BODY);
  if (o.shoes && WARDROBE_ART[o.shoes]) parts.push(WARDROBE_ART[o.shoes]);
  if (o.bottom && WARDROBE_ART[o.bottom]) parts.push(WARDROBE_ART[o.bottom]);
  if (o.top && WARDROBE_ART[o.top]) parts.push(WARDROBE_ART[o.top]);
  if (o.held && WARDROBE_ART[o.held]) parts.push(WARDROBE_ART[o.held]);
  if (eye) parts.push(fillTokens(eye.left, colors), mirror(fillTokens(eye.left, colors)));
  if (mouth) parts.push(mouth.path);
  if (cfg.showBlush) parts.push(BLUSH);
  if (hair) parts.push(hair.front);
  if (o.earring && WARDROBE_ART[o.earring]) parts.push(WARDROBE_ART[o.earring]);
  if (o.glasses && WARDROBE_ART[o.glasses]) parts.push(WARDROBE_ART[o.glasses]);
  if (o.hat && WARDROBE_ART[o.hat]) parts.push(WARDROBE_ART[o.hat]);

  return fillTokens(parts.join('\n'), colors);
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
