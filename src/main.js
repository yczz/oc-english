// 带着OC学英语 v2 · 主逻辑
import { api, toast } from './js/api.js';
import {
  renderCharacterSVG, profileCharToCfg, getPartOptions,
  SKIN_TONES, HAIR_COLORS, EYE_COLORS, registerCustomArt,
} from './js/character.js';
import { wardrobeThumb } from './js/wardrobe.js';
import { furnitureThumb } from './js/furniture.js';
import { Room } from './js/room.js';
import { speak } from './js/tts.js';
import { initDoudou } from './js/doudou.js';

const $ = s => document.querySelector(s);
const openModal = id => $(`#${id}`).showModal();
const closeModal = id => $(`#${id}`).close();

// ---------- 全局状态 ----------
let profile = null;
let catalog = null;          // { wardrobe: [...], furniture: [...] }
let room = null;             // Pixi 房间实例
let editing = false;
let faceDraft = null;        // 捏脸草稿（后端 Face 结构）
let shopTab = 'wardrobe';

// 小助手自定义装扮注入渲染器（每次 profile 变化后同步）
const syncArt = () => registerCustomArt(profile?.custom_items ?? []);

const activeChar = () =>
  profile?.characters.find(c => c.id === profile.active_character_id) ?? profile?.characters[0] ?? null;

// ---------- 启动 ----------
async function init() {
  document.querySelectorAll('[data-close]').forEach(b =>
    b.addEventListener('click', () => closeModal(b.dataset.close)));
  bindRegister();
  bindMain();
  bindFace();
  bindShop();
  bindStudy();
  initDoudou({
    getProfile: () => profile,
    onChange: p => {
      profile = p;
      syncArt();
      renderMain();
      if ($('#modal-wardrobe')?.open) renderWardrobe();
    },
    equip: (slot, itemId) => equip(slot, itemId),
  });
  catalog = await api.getCatalog();
  const names = await api.listProfiles();
  renderRegister(names);
  $('#screen-register').hidden = false;
}

// ---------- 注册屏 ----------
function renderRegister(names) {
  const list = $('#profile-list');
  list.innerHTML = '';
  for (const n of names) {
    const div = document.createElement('div');
    div.className = 'profile-item';
    div.innerHTML = `<span>👤 ${n}</span><span class="mini">点击进入 →</span>`;
    div.addEventListener('click', async () => {
      try {
        profile = await api.loginProfile(n);
        enterMain();
      } catch (e) { toast('❌ ' + e); }
    });
    list.appendChild(div);
  }
  if (!names.length) {
    list.innerHTML = '<p class="register-tip">还没有档案，注册第一个吧 ↓</p>';
  }
}

function bindRegister() {
  $('#reg-btn').addEventListener('click', async () => {
    const name = $('#reg-name').value.trim();
    if (!name) return toast('先输入名字');
    try {
      profile = await api.registerProfile(name);
      $('#reg-name').value = '';
      enterMain();
      toast(`🎉 欢迎 ${name}！新手礼包：200 积分 + 小床 + 基础衣`);
    } catch (e) { toast('❌ ' + e); }
  });
}

// ---------- 主界面 ----------
async function enterMain() {
  $('#screen-register').hidden = true;
  $('#screen-study').hidden = true;
  $('#screen-main').hidden = false;
  if (!room) {
    room = new Room($('#room-canvas'), catalog.furniture, {
      onPlace: onFurniturePlaced,
      onRemove: onFurnitureRemoved,
      onInvalid: () => toast('这里放不下'),
    });
    await room.init();
  }
  renderMain();
}

function renderMain() {
  if (!profile) return;
  syncArt();
  $('#profile-chip').textContent = '👤 ' + profile.name;
  updatePointsChips();
  renderCharBar();
  renderRoom();
}

function updatePointsChips() {
  const t = `⭐ ${profile.points} 积分`;
  $('#points-chip').textContent = t;
  $('#study-points-chip').textContent = t;
}

function renderCharBar() {
  const bar = $('#char-bar');
  bar.innerHTML = '';
  for (const c of profile.characters) {
    const div = document.createElement('div');
    div.className = 'char-avatar' + (c.id === profile.active_character_id ? ' active' : '');
    div.title = c.name;
    div.innerHTML = renderCharacterSVG(profileCharToCfg(c), 0.24) + `<span class="nm">${c.name}</span>`;
    div.addEventListener('click', async () => {
      profile = await api.switchCharacter(c.id);
      renderMain();
    });
    bar.appendChild(div);
  }
  const add = document.createElement('div');
  add.className = 'char-avatar add';
  add.title = '新建人物（免费）';
  add.textContent = '＋';
  add.addEventListener('click', () => { $('#char-name').value = ''; openModal('modal-create'); });
  bar.appendChild(add);
}

async function renderRoom() {
  const ch = activeChar();
  syncArt();
  $('#room-title').textContent = ch ? `🛏️ ${ch.name} 的小家` : '🛏️ 小家';
  if (!ch) return;
  await room.setRoom(ch.room);
  await room.setCharacter(profileCharToCfg(ch));
  renderTray();
}

// ---------- 房间收纳托盘 ----------
function renderTray() {
  const ch = activeChar();
  if (!editing || !ch || !catalog) { $('#tray').hidden = true; return; }
  const placedIds = new Set(ch.room.map(p => p.item_id));
  const stored = catalog.furniture.filter(f => profile.inventory.includes(f.id) && !placedIds.has(f.id));
  const box = $('#tray-items');
  box.innerHTML = '';
  if (!stored.length) {
    box.innerHTML = '<span class="tray-label">没有待摆放的家具（去商店买更多）</span>';
  }
  for (const f of stored) {
    const div = document.createElement('div');
    div.className = 'tray-item';
    div.innerHTML = furnitureThumb(f.id, 34) + `<span>${f.name}</span>`;
    div.addEventListener('click', async () => {
      const spot = room.findFreeSpot(f.id);
      if (!spot) return toast('房间摆满了');
      try {
        profile = await api.placeFurniture(ch.id, f.id, spot.x, spot.y);
        await renderRoom();
      } catch (e) { toast('❌ ' + e); }
    });
    box.appendChild(div);
  }
  $('#tray').hidden = false;
}

async function onFurniturePlaced(itemId, x, y) {
  const ch = activeChar();
  try {
    profile = await api.placeFurniture(ch.id, itemId, x, y);
    renderTray();
  } catch (e) {
    toast('❌ ' + e);
    await room.setRoom(ch.room); // 回滚
  }
}

async function onFurnitureRemoved(itemId) {
  const ch = activeChar();
  try {
    profile = await api.removeFurniture(ch.id, itemId);
    await renderRoom();
  } catch (e) { toast('❌ ' + e); }
}

// ---------- 主界面按钮 ----------
function bindMain() {
  $('#logout-btn').addEventListener('click', async () => {
    await api.logoutProfile();
    profile = null;
    editing = false;
    $('#screen-main').hidden = true;
    $('#screen-register').hidden = false;
    renderRegister(await api.listProfiles());
  });

  $('#create-char-btn').addEventListener('click', () => {
    $('#char-name').value = '';
    openModal('modal-create');
  });
  $('#char-create-ok').addEventListener('click', async () => {
    const name = $('#char-name').value.trim();
    if (!name) return toast('先起个名字');
    try {
      profile = await api.createCharacter(name);
      closeModal('modal-create');
      toast(`🎉 ${name} 来啦！`);
      renderMain();
    } catch (e) { toast('❌ ' + e); }
  });

  $('#room-edit-btn').addEventListener('click', async () => {
    editing = !editing;
    room.setEditable(editing);
    $('#room-edit-btn').textContent = editing ? '✅ 完成布置' : '✏️ 布置房间';
    if (editing) toast('拖动家具换位置 · 右键收起进收纳箱', 3000);
    renderTray();
  });

  $('#wardrobe-btn').addEventListener('click', () => {
    if (!activeChar()) return toast('先创建一个人物');
    renderWardrobe();
    openModal('modal-wardrobe');
  });
  document.querySelectorAll('[data-preset]').forEach(b =>
    b.addEventListener('click', () => applyPreset(+b.dataset.preset)));
  $('#shop-btn').addEventListener('click', () => {
    renderShop();
    openModal('modal-shop');
  });
}

// ---------- 捏脸 ----------
function bindFace() {
  $('#face-btn').addEventListener('click', () => {
    const ch = activeChar();
    if (!ch) return toast('先创建一个人物');
    faceDraft = { ...ch.face };
    renderFaceOptions();
    renderFacePreview();
    openModal('modal-face');
  });
  $('#face-save').addEventListener('click', async () => {
    const ch = activeChar();
    try {
      profile = await api.updateFace(ch.id, faceDraft);
      closeModal('modal-face');
      renderMain();
      toast('🎨 新样子保存好了');
    } catch (e) { toast('❌ ' + e); }
  });
}

function cfgFromDraft() {
  const ch = activeChar();
  return {
    skin: faceDraft.skin_tone, hair: faceDraft.hair_style, hairColor: faceDraft.hair_color,
    eyes: faceDraft.eye_style, eyeColor: faceDraft.eye_color, mouth: faceDraft.mouth,
    showBlush: faceDraft.show_blush,
    outfit: ch?.outfit ?? {},
  };
}

function renderFacePreview() {
  $('#face-preview').innerHTML = renderCharacterSVG(cfgFromDraft(), 1.0);
}

function renderFaceOptions() {
  const opts = getPartOptions();
  const box = $('#face-options');
  box.innerHTML = '';

  const group = (title, buildRow) => {
    const g = document.createElement('div');
    g.className = 'opt-group';
    g.innerHTML = `<h4>${title}</h4>`;
    const row = document.createElement('div');
    row.className = 'opt-row';
    buildRow(row);
    g.appendChild(row);
    box.appendChild(g);
  };

  group('肤色', row => SKIN_TONES.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (faceDraft.skin_tone === i ? ' sel' : '');
    b.style.background = s.S;
    b.title = s.name;
    b.addEventListener('click', () => { faceDraft.skin_tone = i; renderFaceOptions(); renderFacePreview(); });
    row.appendChild(b);
  }));

  group('眼睛', row => opts.eyes.forEach(o => {
    const b = document.createElement('button');
    b.className = 'opt-chip' + (faceDraft.eye_style === o.i ? ' sel' : '');
    b.textContent = o.name;
    b.addEventListener('click', () => { faceDraft.eye_style = o.i; renderFaceOptions(); renderFacePreview(); });
    row.appendChild(b);
  }));

  group('瞳色', row => EYE_COLORS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (faceDraft.eye_color === i ? ' sel' : '');
    b.style.background = c.E;
    b.title = c.name;
    b.addEventListener('click', () => { faceDraft.eye_color = i; renderFaceOptions(); renderFacePreview(); });
    row.appendChild(b);
  }));

  group('嘴巴', row => opts.mouth.forEach(o => {
    const b = document.createElement('button');
    b.className = 'opt-chip' + (faceDraft.mouth === o.i ? ' sel' : '');
    b.textContent = o.name;
    b.addEventListener('click', () => { faceDraft.mouth = o.i; renderFaceOptions(); renderFacePreview(); });
    row.appendChild(b);
  }));

  group('发型', row => opts.hair.forEach(o => {
    const b = document.createElement('button');
    b.className = 'opt-chip' + (faceDraft.hair_style === o.i ? ' sel' : '');
    b.textContent = o.name;
    b.addEventListener('click', () => { faceDraft.hair_style = o.i; renderFaceOptions(); renderFacePreview(); });
    row.appendChild(b);
  }));

  group('发色', row => HAIR_COLORS.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (faceDraft.hair_color === i ? ' sel' : '');
    b.style.background = c.H;
    b.title = c.name;
    b.addEventListener('click', () => { faceDraft.hair_color = i; renderFaceOptions(); renderFacePreview(); });
    row.appendChild(b);
  }));

  group('腮红', row => {
    for (const [label, v] of [['要腮红', true], ['不要', false]]) {
      const b = document.createElement('button');
      b.className = 'opt-chip' + (faceDraft.show_blush === v ? ' sel' : '');
      b.textContent = label;
      b.addEventListener('click', () => { faceDraft.show_blush = v; renderFaceOptions(); renderFacePreview(); });
      row.appendChild(b);
    }
  });
}

// ---------- 衣橱 ----------
const SLOT_NAMES = {
  hat: '🎩 帽子', glasses: '👓 眼镜', top: '👕 上衣', bottom: '👖 下装',
  shoes: '👟 鞋子', held: '🎈 手持', back: '🪽 背饰', earring: '💎 耳饰',
};

function renderWardrobe() {
  const ch = activeChar();
  syncArt();
  $('#wardrobe-preview').innerHTML = renderCharacterSVG(profileCharToCfg(ch), 1.0);
  const box = $('#wardrobe-slots');
  box.innerHTML = '';
  for (const [slot, label] of Object.entries(SLOT_NAMES)) {
    const row = document.createElement('div');
    row.className = 'slot-row';
    row.innerHTML = `<h4>${label}</h4>`;
    const items = document.createElement('div');
    items.className = 'slot-items';

    const none = document.createElement('div');
    none.className = 'wear-item none' + (!ch.outfit[slot] ? ' sel' : '');
    none.textContent = '不穿';
    none.addEventListener('click', () => equip(slot, ''));
    items.appendChild(none);

    for (const item of catalog.wardrobe.filter(w => w.slot === slot)) {
      const owned = profile.inventory.includes(item.id);
      const div = document.createElement('div');
      div.className = 'wear-item' + (ch.outfit[slot] === item.id ? ' sel' : '');
      div.style.opacity = owned ? 1 : 0.45;
      div.innerHTML = wardrobeThumb(item.id) + `<span class="nm">${item.name}${owned ? '' : ' 🔒'}</span>`;
      div.addEventListener('click', () => {
        if (!owned) return toast('还没购买，去商店看看');
        equip(slot, item.id);
      });
      items.appendChild(div);
    }

    // 小助手生成的自定义装扮
    for (const item of (profile.custom_items ?? []).filter(w => w.slot === slot)) {
      const div = document.createElement('div');
      div.className = 'wear-item' + (ch.outfit[slot] === item.id ? ' sel' : '');
      div.innerHTML = wardrobeThumb(item.id, item.art) + `<span class="nm">${item.name} ✨</span>`;
      div.addEventListener('click', () => equip(slot, item.id));
      items.appendChild(div);
    }
    row.appendChild(items);
    box.appendChild(row);
  }
}

async function equip(slot, itemId) {
  const ch = activeChar();
  try {
    profile = await api.equipItem(ch.id, slot, itemId);
    renderWardrobe();
    renderCharBar();
    renderRoom();
  } catch (e) { toast('❌ ' + e); }
}

// ---------- 一键同款预设 ----------
const PRESETS = [
  {
    name: '蝴蝶少女',
    face: { hair_style: 7, hair_color: 0, eye_style: 1, eye_color: 0, mouth: 3, skin_tone: 0, show_blush: true },
    outfit: { top: 'top_slayer', bottom: 'bottom_uniform', held: 'held_katana', back: 'back_butterfly', earring: 'earring_jade' },
  },
];

async function applyPreset(idx) {
  const ch = activeChar();
  if (!ch) return toast('先创建一个人物');
  const p = PRESETS[idx];
  try {
    profile = await api.updateFace(ch.id, { ...ch.face, ...p.face });
    const missing = [];
    for (const [slot, itemId] of Object.entries(p.outfit)) {
      if (profile.inventory.includes(itemId)) profile = await api.equipItem(ch.id, slot, itemId);
      else missing.push(catalog.wardrobe.find(w => w.id === itemId)?.name ?? itemId);
    }
    closeModal('modal-wardrobe');
    renderMain();
    toast(missing.length ? `✨ 同款已上身！还差：${missing.join('、')}（去商店购入即可）` : '✨ 一键变身蝴蝶少女！', 4000);
  } catch (e) { toast('❌ ' + e); }
}

// ---------- 商店 ----------
function bindShop() {
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.addEventListener('click', () => {
      shopTab = b.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.toggle('active', x === b));
      renderShop();
    }));
}

function renderShop() {
  $('#shop-points').textContent = `⭐ ${profile.points}`;
  const grid = $('#shop-grid');
  grid.innerHTML = '';
  const items = shopTab === 'wardrobe' ? catalog.wardrobe : catalog.furniture;
  for (const item of items) {
    const owned = profile.inventory.includes(item.id);
    const div = document.createElement('div');
    div.className = 'shop-item';
    const thumb = shopTab === 'wardrobe' ? wardrobeThumb(item.id) : furnitureThumb(item.id, 72);
    div.innerHTML = `
      <div class="thumb">${thumb}</div>
      <span class="nm">${item.name}</span>
      <span class="price">${item.price === 0 ? '免费' : '⭐ ' + item.price}</span>`;
    const btn = document.createElement('button');
    if (owned) {
      btn.textContent = '✓ 已拥有';
      btn.className = 'owned';
      btn.disabled = true;
    } else {
      btn.textContent = profile.points >= item.price ? '购买' : '积分不足';
      btn.disabled = profile.points < item.price;
      btn.addEventListener('click', async () => {
        try {
          profile = await api.buyItem(item.id);
          toast(`🛍️ 买到了「${item.name}」`);
          renderShop();
          updatePointsChips();
          renderTray();
        } catch (e) { toast('❌ ' + e); }
      });
    }
    div.appendChild(btn);
    grid.appendChild(div);
  }
}

// ---------- 学习 ----------
let curBook = null;

function bindStudy() {
  $('#study-btn').addEventListener('click', async () => {
    $('#screen-main').hidden = true;
    $('#screen-study').hidden = false;
    updatePointsChips();
    await showBooks();
  });
  $('#study-back-btn').addEventListener('click', () => {
    $('#screen-study').hidden = true;
    $('#screen-main').hidden = false;
    renderMain();
  });
}

async function showBooks() {
  const books = await api.getBooks();
  const body = $('#study-body');
  body.innerHTML = '<h2 style="margin-bottom:14px">📚 选择教材（人教版）</h2><div class="book-grid"></div>';
  const grid = body.querySelector('.book-grid');
  for (const b of books) {
    const passed = b.units.filter(u => u.exam_passed).length;
    const pct = Math.round((passed / b.units.length) * 100);
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <h3>${b.title}</h3>
      <div class="meta">${b.units.length} 个单元 · 已通过 ${passed} 考（${pct}%）</div>
      <div class="bar"><i style="width:${pct}%"></i></div>`;
    card.addEventListener('click', () => showUnits(b.id));
    grid.appendChild(card);
  }
  curBook = null;
}

async function showUnits(bookId) {
  const books = await api.getBooks();
  const book = books.find(b => b.id === bookId);
  curBook = book;
  const body = $('#study-body');
  body.innerHTML = `
    <div class="study-head-row">
      <button class="ghost-btn" id="units-back">← 全部教材</button>
      <h2>${book.title}</h2>
      <button class="action-btn" id="grammar-btn" style="margin-left:auto">📖 本册语法卡</button>
    </div>
    <p style="color:var(--muted);font-size:.85rem">先把单元跟练完成（每个词都答对一遍），才能参加单元考。跟练答对 +2 分，考试通过 +100 分。</p>
    <div class="unit-list"></div>`;
  body.querySelector('#units-back').addEventListener('click', showBooks);
  body.querySelector('#grammar-btn').addEventListener('click', async () => {
    const cards = await api.getGrammarCards(bookId);
    $('#grammar-area').innerHTML = cards.map(c =>
      `<div class="grammar-card"><h4>${c.title}</h4><p>${c.explain}</p></div>`).join('');
    openModal('modal-grammar');
  });

  const list = body.querySelector('.unit-list');
  for (const u of book.units) {
    const row = document.createElement('div');
    row.className = 'unit-row';
    row.innerHTML = `
      <div class="info">
        <b>${u.title}</b>
        <div class="sub">${u.word_count} 个单词 · 跟练 ${u.practiced}/${u.word_count}</div>
      </div>
      ${u.completed ? '<span class="badge done">跟练完成</span>' : ''}
      ${u.exam_passed ? `<span class="badge best">✅ 考试通过 · 最佳 ${u.exam_best}/15</span>` : ''}
      <div class="btns">
        <button class="action-btn act-practice">🎵 跟练</button>
        <button class="action-btn act-exam" ${u.completed ? '' : 'disabled'} title="${u.completed ? '开考' : '先完成跟练'}">📝 单元考</button>
      </div>`;
    row.querySelector('.act-practice').addEventListener('click', () => openPractice(book.id, u));
    const examBtn = row.querySelector('.act-exam');
    if (u.completed) examBtn.addEventListener('click', () => openExam(book.id, u));
    list.appendChild(row);
  }
}

// ---------- 跟练 ----------
let practice = null; // { bookId, unit, cards, idx, earned }

async function openPractice(bookId, unit) {
  const cards = await api.getPracticeCards(bookId, unit.id);
  practice = { bookId, unit, cards, idx: 0, earned: 0 };
  $('#practice-title').textContent = `🎵 跟练 · ${curBook?.title ?? ''} ${unit.title}`;
  openModal('modal-practice');
  renderPracticeCard();
}

const KIND_LABEL = { word: '📖 看词选义', listening: '🎧 听音选词', grammar: '✏️ 语法填空' };

function renderPracticeCard() {
  const { cards, idx } = practice;
  $('#practice-bar').style.width = `${(idx / cards.length) * 100}%`;
  const area = $('#practice-area');
  if (idx >= cards.length) {
    area.innerHTML = `
      <div class="exam-result">
        <div class="big-score">🎉</div>
        <div class="verdict">本单元跟练完成！</div>
        <div class="reward">共获得 ⭐ ${practice.earned} 积分</div>
        <button class="primary-btn" id="practice-done-btn">回到单元列表</button>
      </div>`;
    $('#practice-bar').style.width = '100%';
    $('#practice-done-btn').addEventListener('click', async () => {
      closeModal('modal-practice');
      updatePointsChips();
      await showUnits(practice.bookId);
    });
    return;
  }
  const q = cards[idx];
  area.innerHTML = `
    <div class="quiz-q">
      <div class="quiz-kind">${KIND_LABEL[q.kind]} · 第 ${idx + 1}/${cards.length} 张</div>
      <div class="quiz-prompt">${q.prompt}</div>
      ${q.speak ? '<button class="speak-btn" id="speak-btn">🔊 再听一遍</button>' : ''}
      <div class="opt-list">${q.options.map((o, i) => `<button class="opt-btn" data-i="${i}">${o}</button>`).join('')}</div>
    </div>
    <div class="quiz-fb" id="practice-fb"></div>
    <div id="practice-explain"></div>
    <div class="quiz-next-row"><button class="primary-btn" id="practice-next" hidden>下一张 →</button></div>`;
  if (q.speak) {
    speak(q.speak);
    $('#speak-btn').addEventListener('click', () => speak(q.speak));
  }
  area.querySelectorAll('.opt-btn').forEach(btn =>
    btn.addEventListener('click', () => onPracticeAnswer(btn, q)));
}

async function onPracticeAnswer(btn, q) {
  if (practice.locked) return;
  practice.locked = true;
  const chosen = +btn.dataset.i;
  const correct = chosen === q.answer;
  const res = await api.answerPractice(practice.bookId, practice.unit.id, q.id, correct);
  profile.points += res.points_awarded; // 本地同步（后端已记账）
  updatePointsChips();
  practice.earned += res.points_awarded;

  const area = $('#practice-area');
  area.querySelectorAll('.opt-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add('right');
    else if (i === chosen) b.classList.add('wrong');
  });
  const fb = $('#practice-fb');
  fb.className = 'quiz-fb ' + (correct ? 'ok' : 'no');
  fb.textContent = correct
    ? `✅ 答对了！+${res.points_awarded} 分${res.word_learned ? ` ·「${res.word_learned}」学会了` : ''}${res.unit_completed ? ' · 🎊 单元跟练全部完成，可以考试了！' : ''}`
    : `❌ 答错了，正确答案是「${q.options[q.answer]}」`;
  if (!correct && q.explain) {
    $('#practice-explain').innerHTML = `<div class="quiz-explain">${q.explain}</div>`;
  }
  $('#practice-next').hidden = false;
  $('#practice-next').addEventListener('click', () => {
    practice.idx++;
    practice.locked = false;
    renderPracticeCard();
  });
}

// ---------- 考试 ----------
let exam = null; // { bookId, unit, paper, answers }

async function openExam(bookId, unit) {
  try {
    const paper = await api.startExam(bookId, unit.id);
    exam = { bookId, unit, paper, answers: new Array(paper.questions.length).fill(-1) };
    $('#exam-title').textContent = `📝 单元考 · ${curBook?.title ?? ''} ${unit.title}（15 题 · ≥12 题通过）`;
    renderExam();
    openModal('modal-exam');
  } catch (e) { toast('❌ ' + e); }
}

function renderExam() {
  const area = $('#exam-area');
  area.innerHTML = `
    <div style="max-height:430px;overflow-y:auto;padding:0 22px">
      ${exam.paper.questions.map((q, qi) => `
        <div class="exam-q-block">
          <div class="quiz-kind">${KIND_LABEL[q.kind]} ${q.speak ? `<button class="speak-btn" data-speak="${qi}" style="padding:4px 10px;font-size:.8rem;margin:0 0 0 8px">🔊 播放</button>` : ''}</div>
          <div class="quiz-prompt">${qi + 1}. ${q.prompt}</div>
          <div class="opt-list">${q.options.map((o, oi) =>
            `<button class="opt-btn ${exam.answers[qi] === oi ? 'picked' : ''}" data-q="${qi}" data-o="${oi}">${o}</button>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="quiz-next-row" style="border-top:2px solid var(--line)">
      <span id="exam-count" style="margin-right:14px;color:var(--muted)"></span>
      <button class="primary-btn" id="exam-submit" disabled>交卷</button>
    </div>`;
  area.querySelectorAll('[data-speak]').forEach(b =>
    b.addEventListener('click', () => speak(exam.paper.questions[+b.dataset.speak].speak)));
  area.querySelectorAll('.opt-btn').forEach(b =>
    b.addEventListener('click', () => {
      exam.answers[+b.dataset.q] = +b.dataset.o;
      renderExam();
    }));
  const answered = exam.answers.filter(a => a >= 0).length;
  $('#exam-count').textContent = `已答 ${answered}/15`;
  $('#exam-submit').disabled = answered < 15;
  $('#exam-submit').addEventListener('click', submitExam);
  // 听力题进场自动读一遍第一题？避免吵，只给按钮
}

async function submitExam() {
  try {
    const res = await api.submitExam(exam.bookId, exam.unit.id, exam.answers);
    profile.points += res.points_awarded;
    updatePointsChips();
    const area = $('#exam-area');
    const verdict = res.passed
      ? (res.is_first_pass ? '🎉 首次通过！' : '🎉 通过！')
      : '😢 没过，再接再厉';
    area.innerHTML = `
      <div class="exam-result">
        <div class="big-score">${res.correct}/${res.total}</div>
        <div class="verdict">${verdict}</div>
        <div class="reward">${res.points_awarded > 0 ? `⭐ +${res.points_awarded} 积分` + (res.is_first_pass ? '（首次通过大奖）' : '（重考提升补差）') : '本次无积分奖励'}</div>
        <p style="color:var(--muted);margin-bottom:14px">历史最佳：${res.best}/15 · 及格线 12/15</p>
        <button class="primary-btn" id="exam-close-btn">返回</button>
      </div>`;
    $('#exam-close-btn').addEventListener('click', async () => {
      closeModal('modal-exam');
      await showUnits(exam.bookId);
    });
  } catch (e) { toast('❌ ' + e); }
}

init();
