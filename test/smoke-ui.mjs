// UI 全流程冒烟测试（jsdom）：加载真实 index.html + main.js，
// 用契约级 __TAURI__ mock 驱动：注册→捏脸→商店→换装→房间→教材→跟练→考试→登出
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const root = fileURLToPath(new URL('..', import.meta.url));
const html = readFileSync(root + 'src/index.html', 'utf8');

// ---------- jsdom 环境 ----------
const dom = new JSDOM(html, { url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only' });
const { window } = dom;
globalThis.window = window;
globalThis.document = window.document;
globalThis.HTMLElement = window.HTMLElement;
// Node 22 自带 navigator，不覆盖

// dialog polyfill（jsdom 未实现 showModal）
window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };

// Image stub：立即 onerror，让 svgTexture 快速返回
globalThis.Image = class {
  set src(_) { queueMicrotask(() => this.onerror?.()); }
};
window.Image = globalThis.Image;

// TTS stub
globalThis.speechSynthesis = { getVoices: () => [], cancel() {}, speak() {} };
window.speechSynthesis = globalThis.speechSynthesis;
globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
window.SpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance;

// PIXI stub（本测试只验证 DOM 逻辑，不验证 WebGL 渲染）
class FakeStage { constructor() { this.children = []; } addChild(c) { this.children.push(c); } on() {} set eventMode(_) {} set hitArea(_) {} get screen() { return { width: 576, height: 384 }; } }
globalThis.PIXI = {
  Application: class { constructor(opts) { this.stage = new FakeStage(); this.screen = this.stage.screen; } destroy() {} },
  Graphics: class { clear() {} beginFill() {} drawRect() {} drawCircle() {} endFill() {} lineStyle() {} moveTo() {} lineTo() {} closePath() {} },
  Container: class { constructor() { this.children = []; } addChild(c) { this.children.push(c); } sortChildren() {} set sortableChildren(_) {} },
  Sprite: class { constructor(t) { this.texture = t; this.anchor = { set() {} }; this.x = 0; this.y = 0; this.zIndex = 0; this.alpha = 1; } destroy() {} on() {} set eventMode(_) {} set cursor(_) {} },
  Texture: { from: () => ({ width: 10, height: 10, height: 10 }) },
};
window.PIXI = globalThis.PIXI;

// ---------- 契约级后端 mock（与 Rust 指令同形状） ----------
const load = p => JSON.parse(readFileSync(p, 'utf8'));
const wardrobeItems = load(root + 'src-tauri/data/wardrobe.json');
const furnitureItems = load(root + 'src-tauri/data/furniture.json');
const grammarPoints = load(root + 'src-tauri/data/grammar.json').points;
const books = readdirSync(root + 'src-tauri/data/books/')
  .filter(f => f.endsWith('.json'))
  .map(f => load(root + 'src-tauri/data/books/' + f))
  .sort((a, b) => (a.stage === b.stage ? a.id.localeCompare(b.id) : a.stage === 'primary' ? -1 : 1));

let profiles = new Map();
let cur = null;
let uidN = 0;
const uid = () => 'id' + (++uidN);
const key = (b, u) => `${b}:${u}`;
const prog = p => p.progress;

const shortZh = zh => zh.split('；')[0].slice(0, 18);

function fakeWords(opts, correctZh) {
  const wrong = ['红色的苹果', '快乐地奔跑', '一本旧书'].filter(x => x !== correctZh);
  return [correctZh, ...wrong.slice(0, 3)];
}

const mockInvoke = async (cmd, args = {}) => {
  const need = () => { if (!cur) throw new Error('请先注册或登录一个档案'); return cur; };
  switch (cmd) {
    case 'list_profiles': return [...profiles.keys()].sort();
    case 'register_profile': {
      if (profiles.has(args.name)) throw new Error('已被注册');
      const p = { name: args.name, points: 200, characters: [], active_character_id: null, inventory: ['bed_basic', 'top_starter', 'bottom_starter', 'shoes_starter'], progress: {}, created_at: '2026-08-23' };
      profiles.set(args.name, p); cur = p; return structuredClone(p);
    }
    case 'login_profile': { const p = profiles.get(args.name); if (!p) throw new Error('不存在'); cur = p; return structuredClone(p); }
    case 'logout_profile': cur = null; return null;
    case 'get_profile': return structuredClone(need());
    case 'create_character': {
      const p = need();
      if (p.characters.some(c => c.name === args.name)) throw new Error('同名');
      const c = { id: uid(), name: args.name, face: { skin_tone: 0, hair_style: 0, hair_color: 0, eye_style: 0, eye_color: 0, mouth: 0, show_blush: true }, outfit: { hat: '', glasses: '', top: '', bottom: '', shoes: '', held: '', back: '' }, room: [{ item_id: 'bed_basic', x: 1, y: 3 }], created_at: '2026-08-23' };
      p.characters.push(c); p.active_character_id = c.id; return structuredClone(p);
    }
    case 'switch_character': { const p = need(); if (!p.characters.some(c => c.id === args.charId)) throw new Error('找不到'); p.active_character_id = args.charId; return structuredClone(p); }
    case 'update_face': { const p = need(); const c = p.characters.find(c => c.id === args.charId); if (!c) throw new Error('找不到'); c.face = args.face; return structuredClone(p); }
    case 'equip_item': {
      const p = need(); const c = p.characters.find(c => c.id === args.charId); if (!c) throw new Error('找不到');
      if (args.itemId) {
        const item = wardrobeItems.find(w => w.id === args.itemId); if (!item) throw new Error('商品不存在');
        if (item.slot !== args.slot) throw new Error('部位不符');
        if (!p.inventory.includes(args.itemId)) throw new Error('未拥有');
      }
      c.outfit[args.slot] = args.itemId; return structuredClone(p);
    }
    case 'get_catalog': return { wardrobe: wardrobeItems, furniture: furnitureItems };
    case 'buy_item': {
      const p = need();
      const item = [...wardrobeItems, ...furnitureItems].find(i => i.id === args.itemId);
      if (!item) throw new Error('商品不存在');
      if (p.inventory.includes(args.itemId)) throw new Error('已拥有');
      if (p.points < item.price) throw new Error('积分不够');
      p.points -= item.price; p.inventory.push(args.itemId); return structuredClone(p);
    }
    case 'place_furniture': {
      const p = need(); const c = p.characters.find(c => c.id === args.charId);
      const f = furnitureItems.find(x => x.id === args.itemId); if (!f) throw new Error('家具不存在');
      if (args.x + f.w > 12 || args.y + f.h > 8) throw new Error('越界');
      c.room = c.room.filter(r => r.item_id !== args.itemId);
      c.room.push({ item_id: args.itemId, x: args.x, y: args.y }); return structuredClone(p);
    }
    case 'remove_furniture': { const p = need(); const c = p.characters.find(c => c.id === args.charId); c.room = c.room.filter(r => r.item_id !== args.itemId); return structuredClone(p); }
    case 'get_books': {
      const p = need();
      return books.map(b => ({ id: b.id, title: b.title, stage: b.stage, units: b.units.map(u => {
        const g = p.progress[key(b.id, u.id)];
        const practiced = u.words.filter(w => g?.practiced_words?.includes(w.en)).length;
        return { id: u.id, title: u.title, word_count: u.words.length, practiced, completed: practiced >= u.words.length, exam_best: g?.exam_best ?? 0, exam_passed: g?.exam_passed ?? false, exams_taken: g?.exams_taken ?? 0 };
      }) }));
    }
    case 'get_practice_cards': {
      need();
      const b = books.find(x => x.id === args.bookId); const u = b.units.find(x => x.id === args.unitId);
      const cards = [];
      for (const w of u.words) {
        cards.push({ id: 'w:' + w.en, kind: 'word', prompt: `单词 "${w.en}" 的意思是？`, speak: null, options: fakeWords(null, shortZh(w.zh)), answer: 0, explain: '' });
        cards.push({ id: 'l:' + w.en, kind: 'listening', prompt: '听读音，选出正确的单词', speak: w.en, options: [w.en, 'zzz1', 'zzz2', 'zzz3'], answer: 0, explain: '' });
      }
      return cards;
    }
    case 'answer_practice': {
      const p = need();
      const b = books.find(x => x.id === args.bookId); const u = b.units.find(x => x.id === args.unitId);
      let awarded = 0, wordLearned = null;
      if (args.correct) {
        awarded = 2; p.points += 2;
        const w = args.cardId.replace(/^[wl]:/, '');
        if (u.words.some(x => x.en === w)) {
          const g = (p.progress[key(args.bookId, args.unitId)] ??= { practiced_words: [], exam_best: 0, exam_passed: false, exams_taken: 0 });
          if (!g.practiced_words.includes(w)) { g.practiced_words.push(w); wordLearned = w; }
        }
      }
      const g = p.progress[key(args.bookId, args.unitId)];
      const completed = !!g && u.words.every(w => g.practiced_words.includes(w.en));
      return { points_awarded: awarded, word_learned: wordLearned, unit_completed: completed };
    }
    case 'start_exam': {
      const p = need();
      const b = books.find(x => x.id === args.bookId); const u = b.units.find(x => x.id === args.unitId);
      const g = p.progress[key(args.bookId, args.unitId)];
      if ((g?.practiced_words?.length ?? 0) < u.words.length) throw new Error('先完成跟练');
      const qs = Array.from({ length: 15 }, (_, i) => ({ id: 'q' + i, kind: i < 8 ? 'word' : i < 12 ? 'listening' : 'grammar', prompt: `题${i + 1}`, speak: i < 12 ? 'word' : null, options: ['对', '错1', '错2', '错3'], answer: 0, explain: '' }));
      return { questions: qs };
    }
    case 'submit_exam': {
      const p = need();
      if (args.answers.length !== 15) throw new Error('答案数量不符');
      const correct = args.answers.filter(a => a === 0).length;
      const passed = correct >= 12;
      const g = (p.progress[key(args.bookId, args.unitId)] ??= { practiced_words: [], exam_best: 0, exam_passed: false, exams_taken: 0 });
      const firstPass = passed && !g.exam_passed;
      let awarded = 0;
      if (firstPass) awarded = 100;
      else if (passed && correct > g.exam_best) awarded = (correct - g.exam_best) * 10;
      p.points += awarded;
      g.exam_best = Math.max(g.exam_best, correct); g.exam_passed ||= passed; g.exams_taken += 1;
      return { correct, total: 15, passed, points_awarded: awarded, is_first_pass: firstPass, best: g.exam_best };
    }
    case 'get_grammar_cards': return grammarPoints.slice(0, 3).map(g => ({ id: g.id, title: g.title, explain: g.explain }));
    default: throw new Error('未知指令 ' + cmd);
  }
};
window.__TAURI__ = { core: { invoke: mockInvoke } };

// ---------- 断言工具 ----------
let failed = 0;
const check = (cond, msg) => { if (!cond) { failed++; console.error('❌ ' + msg); } else console.log('✅ ' + msg); };
const $ = s => window.document.querySelector(s);
const $$ = s => [...window.document.querySelectorAll(s)];
const tick = (ms = 30) => new Promise(r => setTimeout(r, ms));
const click = async (el, ms = 30) => { el.click(); await tick(ms); };

// ---------- 载入被测代码 ----------
await import(root + 'src/main.js');
await tick(80);

// 1. 注册屏
check(!$('#screen-register').hidden && $('#screen-main').hidden, '启动显示注册屏');
$('#reg-name').value = '测试员';
await click($('#reg-btn'));
check(!$('#screen-main').hidden && $('#screen-register').hidden, '注册后进入主界面');
check($('#points-chip').textContent.includes('200'), '新手礼包 200 积分显示');

// 2. 创建人物
await click($('#create-char-btn'));
check($('#modal-create').hasAttribute('open'), '新建人物弹窗打开');
$('#char-name').value = '毛毛';
await click($('#char-create-ok'));
check($$('#char-bar .char-avatar').length === 2, '人物栏：1 头像 + 新建按钮');
check($('#room-title').textContent.includes('毛毛'), '房间标题含人物名');

// 3. 捏脸
await click($('#face-btn'));
check($('#modal-face').hasAttribute('open'), '捏脸弹窗打开');
check($$('#face-options .opt-group').length >= 6, '捏脸选项组 ≥6');
await click($$('#face-options .opt-group')[4].querySelector('.opt-chip')); // 换一个发型
await click($('#face-save'));
check(!$('#modal-face').hasAttribute('open'), '捏脸保存后弹窗关闭');

// 4. 商店购买
await click($('#shop-btn'));
check($('#modal-shop').hasAttribute('open'), '商店弹窗打开');
check($$('#shop-grid .shop-item').length === 50, '装扮 tab 50 件商品');
const pointsBefore = cur.points;
// 选最便宜的未拥有商品（留够积分给后续家具测试）
const buyBtn = $$('#shop-grid .shop-item')
  .map(el => ({ el, btn: el.querySelector('button'), price: wardrobeItems.find(w => w.name === el.querySelector('.nm').textContent.replace(' 🔒', ''))?.price ?? Infinity }))
  .filter(x => x.btn && !x.btn.disabled && x.btn.textContent === '购买')
  .sort((a, b) => a.price - b.price)[0].btn;
await click(buyBtn);
check(cur.points < pointsBefore, '购买扣积分（' + pointsBefore + '→' + cur.points + '）');
check($('#shop-points').textContent.includes(String(cur.points)), '商店积分同步刷新');
await click($$('.tab-btn')[1]); // 家具 tab
check($$('#shop-grid .shop-item').length === 18, '家具 tab 18 件商品');
const furnBtn = $$('#shop-grid .shop-item')
  .map(el => ({ btn: el.querySelector('button'), price: furnitureItems.find(w => w.name === el.querySelector('.nm').textContent)?.price ?? Infinity }))
  .filter(x => x.btn && !x.btn.disabled && x.btn.textContent === '购买')
  .sort((a, b) => a.price - b.price)[0].btn;
await click(furnBtn);
await click($('#modal-shop .close-btn'));

// 5. 衣橱换装
await click($('#wardrobe-btn'));
check($('#modal-wardrobe').hasAttribute('open'), '衣橱弹窗打开');
check($$('#wardrobe-slots .slot-row').length === 8, '8 个部位行（含耳饰）');
const owned = $$('#wardrobe-slots .wear-item').find(el => !el.classList.contains('none') && el.textContent.includes('🔒') === false);
await click(owned);
const ch = cur.characters[0];
check(Object.values(ch.outfit).some(v => v !== ''), '成功穿上一件装扮');
await click($('#modal-wardrobe .close-btn'));

// 6. 房间布置
await click($('#room-edit-btn'));
check(!$('#tray').hidden, '进入布置模式出现收纳托盘');
const trayItem = $('#tray-items .tray-item');
check(!!trayItem, '托盘里有待摆放家具');
await click(trayItem);
check(ch.room.length >= 2, '家具从托盘放入房间');
await click($('#room-edit-btn'));
check($('#tray').hidden, '退出布置模式托盘收起');

// 7. 学习中心 + 语法卡
await click($('#study-btn'));
check($$('#study-body .book-card').length === 13, '13 本教材卡片');
await click($$('#study-body .book-card')[0]);
check($$('#study-body .unit-row').length > 0, '单元列表渲染');
await click($('#grammar-btn'));
check($('#modal-grammar').hasAttribute('open') && $$('#grammar-area .grammar-card').length > 0, '语法卡弹窗有内容');
await click($('#modal-grammar .close-btn'));

// 8. 跟练（选词最少的单元，全答对走完）
const booksView = await mockInvoke('get_books');
const bookView = booksView[0];
const minUnit = [...bookView.units].sort((a, b) => a.word_count - b.word_count)[0];
const unitRow = $$('#study-body .unit-row')[bookView.units.indexOf(minUnit)];
check(unitRow.querySelector('.act-exam').disabled, '跟练未完成时考试按钮禁用');
await click(unitRow.querySelector('.act-practice'));
check($('#modal-practice').hasAttribute('open'), '跟练弹窗打开');
let guard = 0;
while (!$('#practice-done-btn') && guard++ < 200) {
  await click($('#practice-area .opt-btn'));          // 正确项恒在第 1 个
  await click($('#practice-next'));
}
check(!!$('#practice-done-btn'), '跟练全部卡片走完');
await click($('#practice-done-btn'));
await tick(60);

// 9. 考试
const unitRow2 = $$('#study-body .unit-row')[bookView.units.indexOf(minUnit)];
check(!unitRow2.querySelector('.act-exam').disabled, '跟练完成后考试按钮启用');
await click(unitRow2.querySelector('.act-exam'));
check($('#modal-exam').hasAttribute('open'), '考试弹窗打开');
check($$('#exam-area .exam-q-block').length === 15, '考卷 15 题');
for (const block of $$('#exam-area .exam-q-block')) await click(block.querySelector('.opt-btn'), 5);
check(!$('#exam-submit').disabled, '全部作答后交卷按钮启用');
const ptsBeforeExam = cur.points;
await click($('#exam-submit'));
check($('#exam-area .big-score').textContent === '15/15', '全对得分 15/15');
check(cur.points === ptsBeforeExam + 100, '首次通过 +100 积分入账');
await click($('#exam-close-btn'));
await tick(60);
const unitRow3 = $$('#study-body .unit-row')[bookView.units.indexOf(minUnit)];
check(unitRow3.textContent.includes('考试通过'), '单元行显示已通过');

// 10. 回家 + 切换档案
await click($('#study-back-btn'));
check(!$('#screen-main').hidden, '回到主界面');
check($('#points-chip').textContent.includes(String(cur.points)), '主界面积分同步');
await click($('#logout-btn'));
check(!$('#screen-register').hidden, '登出回注册屏');
check($$('#profile-list .profile-item').some(el => el.textContent.includes('测试员')), '档案列表含「测试员」');
await click($$('#profile-list .profile-item')[0]);
check(!$('#screen-main').hidden && $('#points-chip').textContent.includes(String(cur.points)), '重新登录状态恢复');

console.log(failed === 0 ? '\n🎉 UI 全流程冒烟测试全部通过' : `\n💥 ${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);
