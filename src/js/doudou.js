// 小助手豆豆：黑色团子形象（左上角入口）· 本地引擎
// 能力：① 聊天/问答（13 册词库 + 语法库检索）② 画画（关键词简笔画）
//       ③ 描述生成自定义衣服（存入档案，可直接穿上 OC）
import { api } from './api.js';
import { wardrobeThumb } from './wardrobe.js';

let hooks = null; // { getProfile, onChange(profile), equip(slot, itemId) }
let greeted = false;

const $ = s => document.querySelector(s);

export function initDoudou(h) {
  hooks = h;
  $('#doudou-btn').addEventListener('click', () => {
    const p = $('#doudou-panel');
    p.hidden = !p.hidden;
    if (!p.hidden && !greeted) {
      greeted = true;
      addMsg('dd', `你好呀，我是豆豆 ⚫️<br>可以陪我聊天、问我英语单词和语法，还能给你：<br>🎨 画一张简笔画（试试「画一只猫」）<br>👗 设计衣服（试试「设计一件粉色条纹卫衣」）`);
    }
  });
  $('#doudou-close').addEventListener('click', () => { $('#doudou-panel').hidden = true; });
  $('#dd-send').addEventListener('click', send);
  $('#dd-input').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  document.querySelectorAll('.dd-quick button').forEach(b =>
    b.addEventListener('click', () => { $('#dd-input').value = b.dataset.q; send(); }));
}

function addMsg(role, html) {
  const box = $('#dd-msgs');
  const div = document.createElement('div');
  div.className = 'dd-msg ' + role;
  div.innerHTML = html;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}

async function send() {
  const input = $('#dd-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  addMsg('user', escapeHtml(text));
  const thinking = addMsg('dd', '豆豆想了想…');
  try {
    const html = await respond(text);
    thinking.innerHTML = html;
    bindEquipButtons(thinking);
  } catch (e) {
    thinking.innerHTML = '呜…豆豆卡住了：' + escapeHtml(String(e));
  }
  $('#dd-msgs').scrollTop = $('#dd-msgs').scrollHeight;
}

function bindEquipButtons(scope) {
  scope.querySelectorAll('.dd-equip').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        await hooks.equip(btn.dataset.slot, btn.dataset.id);
        btn.outerHTML = '<span class="dd-done">✅ 已穿上，去镜子前看看吧！</span>';
      } catch (e) { addMsg('dd', '❌ ' + escapeHtml(String(e))); }
    });
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---------- 意图路由 ----------
async function respond(text) {
  const t = text.toLowerCase();
  if (/(设计|做|生成|画).{0,6}(衣服|上衣|卫衣|裙子|裤子|帽子|鞋)|衣服[:：]|一件/.test(text) && /(衣服|上衣|卫衣|裙子|裤子|帽子|鞋|外套|斗篷|翅膀)/.test(text)) {
    return genOutfit(text);
  }
  if (/(画|绘|涂).{0,4}(一只|一个|朵|张|幅)?[^，。！？]{0,6}(猫|狗|花|太阳|星星|心|房子|鱼|树|云|蝴蝶|雪人)|画一画|draw/.test(text)) {
    return doodle(text);
  }
  const enWord = t.match(/\b([a-z]{2,20})\b/);
  const zhWord = text.match(/[一-龥]{2,}/);
  const askWord = /什么意思|怎么读|翻译|英语怎么说|what\s+is|meaning/i.test(t) || (enWord && !zhWord);
  if (askWord) {
    const q = enWord
      ? enWord[1]
      : (zhWord ? zhWord[0].replace(/用英语怎么说|英语怎么说|什么意思|怎么读|翻译|是什么/g, '').trim() : '');
    if (q) {
      const hits = await api.searchWords(q);
      if (hits.length) {
        return '📖 豆豆查到了：<br>' + hits.map(w =>
          `<b>${escapeHtml(w.en)}</b> ${escapeHtml(w.zh)} <span class="dd-mini">· ${escapeHtml(w.book)}</span>`).join('<br>');
      }
      return `豆豆翻遍了 13 册书也没找到「${escapeHtml(q)}」😢 换个词试试？`;
    }
  }
  const GK = ['比较级', '最高级', '复数', '过去式', '第三人称', 'there be', 'be动词', '情态动词', '现在进行时', 'some和any', '代词'];
  const gk = GK.find(k => text.includes(k)) ?? (/语法/.test(text) ? '比较级' : null);
  if (gk || /语法/.test(text)) {
    const cards = await api.searchGrammar(gk ?? 'be动词');
    if (cards.length) {
      return '📚 语法小课堂：<br>' + cards.map(c => `<b>${escapeHtml(c.title)}</b><br>${escapeHtml(c.explain)}`).join('<br><br>');
    }
  }
  if (/(积分|商店|考试|跟练|家具|房间|怎么赚)/.test(text)) {
    return '💡 豆豆小贴士：跟练每个词答对 +2 积分；单元考 15 题答对 12 题及格，首通 +100 积分！积分能在商店买装扮和家具布置小家～';
  }
  if (/(你好|hi|hello|在吗|你是谁)/.test(t)) {
    return '嘿！我是豆豆，一团会英语的黑色小团子 ⚫️ 问我单词、语法，或者让我给你设计衣服吧！';
  }
  const CHAT = [
    '嗯嗯，豆豆在听！顺便说：每天跟练 10 个单词，OC 就能穿新衣服啦～',
    '豆豆觉得你今天元气满满！要不要来一局跟练？答对 +2 积分哦～',
    '嘿嘿，被你找到我了！想聊天、问英语、还是设计新衣服？豆豆都可以！',
  ];
  return CHAT[text.length % CHAT.length];
}

// ---------- 自定义衣服生成 ----------
const COLORS = [
  [/红|赤/, ['#e5484d', '#b32f34', '#8f262a']],
  [/橙|橘/, ['#f2884b', '#cf6a32', '#a85526']],
  [/黄|金/, ['#f2cc5b', '#d1a830', '#a88626']],
  [/绿|草/, ['#6fbf73', '#4d9451', '#3f7a43']],
  [/蓝|青/, ['#4a90d9', '#2f6bb0', '#24548c']],
  [/紫/, ['#8f6cc9', '#6d4ba6', '#563a85']],
  [/粉|桃|樱/, ['#f4a7c3', '#d17a9c', '#b05f81']],
  [/黑|暗/, ['#3a3340', '#262130', '#191521']],
  [/白|雪/, ['#f7f3ea', '#c9bfae', '#a89d88']],
  [/棕|咖|褐/, ['#8a5a3b', '#64402a', '#4e3221']],
];
const pickColor = t => (COLORS.find(([re]) => re.test(t)) ?? COLORS[6])[1];

const SLEEVE_L = (f, s) => `<path d="M89 148 Q82 150 76 156 L52 179 Q46 185 50 190 Q54 194 59 190 L86 164 Q92 158 91 151 Z" fill="${f}" stroke="${s}" stroke-width="2.2" stroke-linejoin="round"/>`;
const SLEEVE_R = (f, s) => `<path d="M111 148 Q118 150 124 156 L148 179 Q154 185 150 190 Q146 194 141 190 L114 164 Q108 158 109 151 Z" fill="${f}" stroke="${s}" stroke-width="2.2" stroke-linejoin="round"/>`;
const TOP_BODY = (f, s, d) => `
${SLEEVE_L(f, s)}${SLEEVE_R(f, s)}
<path d="M91 145 Q83 149 83 160 L83 190 Q83 207 92 213 Q100 218 108 213 Q117 207 117 190 L117 160 Q117 149 109 145 Q100 151 91 145 Z" fill="${f}" stroke="${s}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M86 204 Q100 212 114 204" fill="none" stroke="${d}" stroke-width="2" opacity="0.5"/>`;
const PANTS = (f, s) => `
<path d="M86 206 Q81 240 82.5 284 Q82.5 291 90 291 Q97.5 291 97.5 284 Q97.5 240 99 210 Z" fill="${f}" stroke="${s}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M114 206 Q119 240 117.5 284 Q117.5 291 110 291 Q102.5 291 102.5 284 Q102.5 240 101 210 Z" fill="${f}" stroke="${s}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M84 202 Q100 214 116 202 Q119 210 116 216 Q100 227 84 216 Q81 210 84 202 Z" fill="${f}" stroke="${s}" stroke-width="2.4" stroke-linejoin="round"/>`;
const SKIRT = (f, s) => `
<path d="M84 196 L116 196 L128 232 Q100 244 72 232 Z" fill="${f}" stroke="${s}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M90 198 L84 232 M100 198 L100 238 M110 198 L116 232" stroke="${s}" stroke-width="2"/>`;
const SHOES = (f, s) => `
<path d="M82.5 275 Q81 284 82.5 288 Q83 293 90 293 Q97 293 97.5 288 Q99 284 97.5 275 Z" fill="${f}" stroke="${s}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M102.5 275 Q101 284 102.5 288 Q103 293 110 293 Q117 293 117.5 288 Q119 284 117.5 275 Z" fill="${f}" stroke="${s}" stroke-width="2.4" stroke-linejoin="round"/>`;

function patternOverlay(kind, dark) {
  if (kind === '条纹') return `<path d="M84 162 L116 162 M84 176 L116 176 M84 190 L116 190" stroke="${dark}" stroke-width="3" opacity="0.55"/>`;
  if (kind === '圆点') return `<circle cx="92" cy="162" r="2.6" fill="${dark}" opacity="0.6"/><circle cx="108" cy="172" r="2.6" fill="${dark}" opacity="0.6"/><circle cx="94" cy="186" r="2.6" fill="${dark}" opacity="0.6"/><circle cx="108" cy="198" r="2.6" fill="${dark}" opacity="0.6"/>`;
  if (kind === '星星') return `<path d="M96 164 l2.4 4.8 5.3.8 -3.8 3.7.9 5.3 -4.8-2.5 -4.8 2.5.9-5.3 -3.8-3.7 5.3-.8 Z" fill="${dark}" opacity="0.7"/><path d="M104 188 l1.8 3.6 4 .6 -2.9 2.8.7 4 -3.6-1.9 -3.6 1.9.7-4 -2.9-2.8 4-.6 Z" fill="${dark}" opacity="0.7"/>`;
  if (kind === '爱心') return `<path d="M100 176 Q92 168 94 163 Q96 159 100 163 Q104 159 106 163 Q108 168 100 176 Z" fill="${dark}" opacity="0.7"/>`;
  return '';
}

async function genOutfit(desc) {
  const [fill, stroke, shade] = pickColor(desc);
  const pat = /条纹/.test(desc) ? '条纹' : /圆点|波点/.test(desc) ? '圆点' : /星星|星/.test(desc) ? '星星' : /爱心|心/.test(desc) ? '爱心' : '';
  let slot = 'top', art = '';
  if (/帽|冠/.test(desc)) {
    slot = 'hat';
    art = `<g><path d="M54 80 Q50 32 100 30 Q150 32 146 80 Q100 90 54 80 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
<path d="M54 76 Q100 88 146 76 L146 86 Q100 98 54 86 Z" fill="${shade}" stroke="${stroke}" stroke-width="2"/>
<circle cx="100" cy="28" r="8" fill="#fff3e6" stroke="${stroke}" stroke-width="2"/></g>`;
  } else if (/眼镜|墨镜/.test(desc)) {
    slot = 'glasses';
    art = `<g fill="none" stroke="${stroke}" stroke-width="3"><circle cx="80" cy="97" r="14"/><circle cx="120" cy="97" r="14"/><path d="M94 97 L106 97"/><path d="M66 97 L54 93 M134 97 L146 93" stroke-width="2.5"/></g>`;
  } else if (/鞋|靴/.test(desc)) {
    slot = 'shoes';
    art = SHOES(fill, stroke);
  } else if (/裙/.test(desc)) {
    slot = 'bottom';
    art = SKIRT(fill, stroke) + (pat ? `<g transform="translate(0 0)">${patternOverlay(pat, shade).replace(/1[6-9][0-9]/g, m => String(Number(m) + 40))}</g>` : '');
  } else if (/裤|牛仔/.test(desc)) {
    slot = 'bottom';
    art = PANTS(fill, stroke);
  } else if (/翅膀|斗篷|披风|蝴蝶/.test(desc)) {
    slot = 'back';
    art = `<path d="M84 142 Q66 184 72 224 Q100 234 128 224 Q134 184 116 142 Q100 152 84 142 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
<path d="M84 146 Q100 156 116 146" fill="none" stroke="${shade}" stroke-width="2.5"/>`;
  } else if (/包|剑|气球|熊|花/.test(desc)) {
    slot = 'held';
    art = `<g><path d="M154 190 Q159 170 153 148" fill="none" stroke="${stroke}" stroke-width="2"/>
<ellipse cx="151" cy="130" rx="17" ry="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
<ellipse cx="145" cy="124" rx="4" ry="6" fill="#ffffff" opacity="0.5"/></g>`;
  } else {
    slot = 'top';
    art = TOP_BODY(fill, stroke, shade) + patternOverlay(pat, shade);
    if (/卫衣|帽衫/.test(desc)) {
      art += `<path d="M82 142 Q78 130 88 128 Q100 124 112 128 Q122 130 118 142 Q100 151 82 142 Z" fill="${shade}" stroke="${stroke}" stroke-width="2"/>
<path d="M93 150 L93 157 M107 150 L107 157" stroke="${stroke}" stroke-width="2.5" stroke-linecap="round"/>`;
    }
  }
  const name = desc.replace(/^(帮我|给我|请|我想要|我想|我要)?(设计|做|生成|画)?(一下)?/, '').replace(/^一(件|个|条|顶|双|款)/, '').slice(0, 12) || '豆豆新作';
  const p = await api.addCustomItem(name, slot, art);
  hooks.onChange(p);
  const SLOT_CN = { hat: '帽子', glasses: '眼镜', top: '上衣', bottom: '下装', shoes: '鞋子', held: '手持', back: '背饰', earring: '耳饰' };
  const itemId = p.custom_items[p.custom_items.length - 1].id;
  return `👗 豆豆设计好了「${escapeHtml(name)}」（${SLOT_CN[slot]}）！<br>${wardrobeThumb(itemId, art)}<br><button class="dd-equip action-btn" data-id="${itemId}" data-slot="${slot}">✨ 立刻穿上</button> <span class="dd-mini">也已放进你的衣橱</span>`;
}

// ---------- 简笔画 ----------
const DOODLES = {
  猫: `<circle cx="80" cy="86" r="34" fill="#f7f3ea" stroke="#5a4636" stroke-width="3"/><path d="M54 62 L48 40 L68 52 Z M106 62 L112 40 L92 52 Z" fill="#f7f3ea" stroke="#5a4636" stroke-width="3"/><circle cx="68" cy="82" r="4" fill="#3a3340"/><circle cx="92" cy="82" r="4" fill="#3a3340"/><path d="M76 94 Q80 98 84 94" fill="none" stroke="#5a4636" stroke-width="2.5"/><path d="M46 88 L28 84 M46 94 L30 96 M114 88 L132 84 M114 94 L130 96" stroke="#5a4636" stroke-width="2"/>`,
  狗: `<circle cx="80" cy="86" r="34" fill="#e8c9a8" stroke="#5a4636" stroke-width="3"/><path d="M50 66 Q40 84 52 96 M110 66 Q120 84 108 96" fill="#c68d5f" stroke="#5a4636" stroke-width="3"/><circle cx="68" cy="80" r="4" fill="#3a3340"/><circle cx="92" cy="80" r="4" fill="#3a3340"/><ellipse cx="80" cy="96" rx="7" ry="5" fill="#5a4636"/><path d="M80 101 Q80 108 74 110 M80 101 Q80 108 86 110" fill="none" stroke="#5a4636" stroke-width="2.5"/>`,
  花: `<circle cx="80" cy="66" r="12" fill="#ffd166" stroke="#e0aa3e" stroke-width="3"/><circle cx="80" cy="40" r="14" fill="#f4a7c3" stroke="#d17a9c" stroke-width="3"/><circle cx="56" cy="58" r="14" fill="#f4a7c3" stroke="#d17a9c" stroke-width="3"/><circle cx="104" cy="58" r="14" fill="#f4a7c3" stroke="#d17a9c" stroke-width="3"/><circle cx="64" cy="84" r="14" fill="#f4a7c3" stroke="#d17a9c" stroke-width="3"/><circle cx="96" cy="84" r="14" fill="#f4a7c3" stroke="#d17a9c" stroke-width="3"/><path d="M80 96 L80 140 M80 116 Q64 110 60 98 M80 126 Q96 120 100 108" fill="none" stroke="#4d9451" stroke-width="4"/>`,
  太阳: `<circle cx="80" cy="80" r="30" fill="#f7c948" stroke="#d9a520" stroke-width="3"/><path d="M80 34 L80 20 M80 126 L80 140 M34 80 L20 80 M126 80 L140 80 M48 48 L38 38 M112 48 L122 38 M48 112 L38 122 M112 112 L122 122" stroke="#d9a520" stroke-width="4" stroke-linecap="round"/><circle cx="70" cy="76" r="3.5" fill="#8a5f1a"/><circle cx="90" cy="76" r="3.5" fill="#8a5f1a"/><path d="M70 90 Q80 98 90 90" fill="none" stroke="#8a5f1a" stroke-width="3"/>`,
  星: `<path d="M80 24 L94 62 L134 64 L102 88 L114 128 L80 104 L46 128 L58 88 L26 64 L66 62 Z" fill="#ffe27a" stroke="#d9a520" stroke-width="3" stroke-linejoin="round"/>`,
  心: `<path d="M80 128 Q34 96 38 66 Q42 42 66 48 Q76 52 80 64 Q84 52 94 48 Q118 42 122 66 Q126 96 80 128 Z" fill="#ff6b8d" stroke="#d94b70" stroke-width="3"/>`,
  房子: `<path d="M40 78 L80 40 L120 78 Z" fill="#e56b6f" stroke="#c14b50" stroke-width="3"/><rect x="50" y="78" width="60" height="50" fill="#f7e8c9" stroke="#c4a04e" stroke-width="3"/><rect x="72" y="98" width="16" height="30" fill="#8a5a3b" stroke="#64402a" stroke-width="2.5"/><rect x="56" y="88" width="12" height="12" fill="#8be9fd" stroke="#6fb3d9" stroke-width="2"/>`,
  鱼: `<ellipse cx="74" cy="80" rx="36" ry="22" fill="#8be9fd" stroke="#2f6bb0" stroke-width="3"/><path d="M108 80 L132 62 L132 98 Z" fill="#4a90d9" stroke="#2f6bb0" stroke-width="3"/><circle cx="56" cy="74" r="4" fill="#1d1b22"/><path d="M70 62 Q76 80 70 98" fill="none" stroke="#2f6bb0" stroke-width="2.5"/><circle cx="96" cy="52" r="5" fill="none" stroke="#6fb3d9" stroke-width="2"/>`,
  树: `<rect x="72" y="92" width="16" height="46" fill="#8a5a3b" stroke="#64402a" stroke-width="3"/><circle cx="80" cy="62" r="34" fill="#6fbf73" stroke="#4d9451" stroke-width="3"/><circle cx="66" cy="56" r="5" fill="#e5484d"/><circle cx="92" cy="70" r="5" fill="#e5484d"/>`,
  云: `<path d="M46 92 Q30 92 30 78 Q30 64 46 64 Q50 48 68 48 Q84 48 90 60 Q108 56 114 70 Q128 72 128 84 Q128 92 114 92 Z" fill="#ffffff" stroke="#8fb0e0" stroke-width="3"/><path d="M52 108 L48 120 M76 108 L72 120 M100 108 L96 120" stroke="#8fb0e0" stroke-width="3" stroke-linecap="round"/>`,
  蝴蝶: `<path d="M78 80 Q50 50 40 70 Q32 88 56 92 Q40 108 56 114 Q72 118 78 96 Z" fill="#f4a7c3" stroke="#d17a9c" stroke-width="3"/><path d="M82 80 Q110 50 120 70 Q128 88 104 92 Q120 108 104 114 Q88 118 82 96 Z" fill="#c8b6e2" stroke="#a48cc9" stroke-width="3"/><path d="M80 66 L80 112" stroke="#3b2f28" stroke-width="4" stroke-linecap="round"/><path d="M78 64 Q72 54 66 52 M82 64 Q88 54 94 52" fill="none" stroke="#3b2f28" stroke-width="2.5"/>`,
  雪人: `<circle cx="80" cy="108" r="30" fill="#ffffff" stroke="#8fb0e0" stroke-width="3"/><circle cx="80" cy="62" r="20" fill="#ffffff" stroke="#8fb0e0" stroke-width="3"/><circle cx="73" cy="58" r="3" fill="#1d1b22"/><circle cx="87" cy="58" r="3" fill="#1d1b22"/><path d="M80 64 L92 68 L80 70 Z" fill="#f2884b"/><path d="M64 100 L40 88 M96 100 L120 88" stroke="#8a5a3b" stroke-width="4"/><path d="M66 78 Q80 86 94 78" fill="none" stroke="#e5484d" stroke-width="6"/>`,
};

function doodle(text) {
  const key = Object.keys(DOODLES).find(k => text.includes(k)) ?? '星';
  const bg = /蓝|天/.test(text) ? '#dff1ff' : /粉/.test(text) ? '#ffe9f1' : /绿|草/.test(text) ? '#e4f5e2' : /黄|暖/.test(text) ? '#fff6dd' : '#fdf6ec';
  return `🎨 豆豆画好了「${key}」：<br><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="150" height="150" style="border-radius:12px"><rect width="160" height="160" fill="${bg}"/>${DOODLES[key]}</svg>`;
}
