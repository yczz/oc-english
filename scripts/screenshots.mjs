// 生成 README 用的真实程序截图：
// 本机 Chrome 无头运行前端 + 契约级后端 mock（与 smoke-ui 同形状），逐屏截图到 docs/screenshots/
// 用法：node scripts/screenshots.mjs
import { readFileSync, readdirSync, mkdirSync, createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(root, 'docs', 'screenshots');
mkdirSync(OUT, { recursive: true });

// ---------- 静态服务器 ----------
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer((req, res) => {
  const p = normalize(decodeURIComponent(req.url.split('?')[0]));
  const f = join(root, p);
  if (!existsSync(f)) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': MIME[extname(f)] ?? 'application/octet-stream' });
  createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

// ---------- 契约级后端 mock（同 test/smoke-ui.mjs，初始库存更丰富便于出图） ----------
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
const shortZh = zh => zh.split('；')[0].slice(0, 18);
const fakeWords = (opts, correctZh) => [correctZh, ...['红色的苹果', '快乐地奔跑', '一本旧书'].filter(x => x !== correctZh).slice(0, 3)];

// 演示档案：蝴蝶少女全套 + 一屋子家具（截图更好看）
const DEMO_INVENTORY = [
  'bed_basic', 'top_starter', 'bottom_starter', 'shoes_starter',
  'top_slayer', 'bottom_uniform', 'held_katana', 'back_butterfly', 'earring_jade',
  'sofa', 'desk', 'rug', 'plant', 'lamp', 'shelf',
];

const mockInvoke = async (cmd, args = {}) => {
  const need = () => { if (!cur) throw new Error('请先注册或登录一个档案'); return cur; };
  switch (cmd) {
    case 'list_profiles': return [...profiles.keys()].sort();
    case 'register_profile': {
      if (profiles.has(args.name)) throw new Error('已被注册');
      const p = { name: args.name, points: 200, characters: [], active_character_id: null, inventory: [...DEMO_INVENTORY], custom_items: [], progress: {}, created_at: '2026-09-02' };
      profiles.set(args.name, p); cur = p; return structuredClone(p);
    }
    case 'login_profile': { const p = profiles.get(args.name); if (!p) throw new Error('不存在'); cur = p; return structuredClone(p); }
    case 'logout_profile': cur = null; return null;
    case 'get_profile': return structuredClone(need());
    case 'create_character': {
      const p = need();
      if (p.characters.some(c => c.name === args.name)) throw new Error('同名');
      const c = { id: uid(), name: args.name, face: { skin_tone: 0, hair_style: 0, hair_color: 0, eye_style: 0, eye_color: 0, mouth: -1, show_blush: true }, outfit: { hat: '', glasses: '', top: '', bottom: '', shoes: '', held: '', back: '', earring: '' }, room: [], created_at: '2026-09-02' };
      p.characters.push(c); p.active_character_id = c.id; return structuredClone(p);
    }
    case 'switch_character': { const p = need(); if (!p.characters.some(c => c.id === args.charId)) throw new Error('找不到'); p.active_character_id = args.charId; return structuredClone(p); }
    case 'update_face': { const p = need(); const c = p.characters.find(c => c.id === args.charId); if (!c) throw new Error('找不到'); c.face = args.face; return structuredClone(p); }
    case 'equip_item': {
      const p = need(); const c = p.characters.find(c => c.id === args.charId); if (!c) throw new Error('找不到');
      if (args.itemId) {
        const custom = p.custom_items.find(x => x.id === args.itemId);
        if (custom) { if (custom.slot !== args.slot) throw new Error('部位不符'); }
        else {
          const item = wardrobeItems.find(w => w.id === args.itemId); if (!item) throw new Error('商品不存在');
          if (item.slot !== args.slot) throw new Error('部位不符');
          if (!p.inventory.includes(args.itemId)) throw new Error('未拥有');
        }
      }
      c.outfit[args.slot] = args.itemId; return structuredClone(p);
    }
    case 'add_custom_item': {
      const p = need();
      const id = 'custom_demo_' + (p.custom_items.length + 1);
      p.custom_items.push({ id, name: args.name, slot: args.slot, art: args.art, created_at: '2026-09-05' });
      p.inventory.push(id); return structuredClone(p);
    }
    case 'search_words': return [];
    case 'search_grammar': return [];
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

// ---------- 浏览器 ----------
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
  args: ['--enable-unsafe-swiftshader', '--mute-audio'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 2 });
await page.exposeFunction('mockInvokeNode', mockInvoke);
await page.evaluateOnNewDocument(() => {
  window.__TAURI__ = { core: { invoke: (cmd, args) => window.mockInvokeNode(cmd, args) } };
});
page.on('pageerror', e => console.error('  [pageerror]', e.message));

const shot = async name => { await page.screenshot({ path: join(OUT, name) }); console.log('📸', name); };
const tick = (ms = 120) => new Promise(r => setTimeout(r, ms));
const click = async (sel, ms = 150) => { await page.click(sel); await tick(ms); };
const type = async (sel, text) => { await page.click(sel); await page.type(sel, text); };

await page.goto(`${BASE}/src/index.html`, { waitUntil: 'networkidle0' });
await tick(400);

// 1. 注册屏
await shot('01-register.png');

// 2. 注册 → 主界面
await type('#reg-name', '小樱');
await click('#reg-btn', 500);

// 3. 创建人物
await click('#create-char-btn');
await page.waitForSelector('#modal-create[open]');
await type('#char-name', '毛毛');
await click('#char-create-ok', 600);

// 4. 捏脸弹窗截图
await click('#face-btn');
await page.waitForSelector('#modal-face[open]');
await tick(300);
await shot('02-face.png');
await click('#face-save', 400);

// 5. 衣橱：应用「蝴蝶少女」预设（applyPreset 会自动关窗），再重开衣橱截图
await click('#wardrobe-btn');
await page.waitForSelector('#modal-wardrobe[open]');
await click('[data-preset="0"]', 1200);
await click('#wardrobe-btn');
await page.waitForSelector('#modal-wardrobe[open]');
await tick(300);
await shot('03-wardrobe.png');
await click('#modal-wardrobe .close-btn', 400);

// 6. 布置房间（把收纳箱家具全摆进去）→ 主界面截图
await click('#room-edit-btn', 500);
let guard = 0;
while (await page.$('#tray-items .tray-item') && guard++ < 20) {
  await click('#tray-items .tray-item', 500);
}
await click('#room-edit-btn', 800);
await shot('04-room.png');

// 7. 商店
await click('#shop-btn');
await page.waitForSelector('#modal-shop[open]');
await tick(300);
await shot('05-shop.png');
await click('#modal-shop .close-btn', 400);

// 8. 学习中心
await click('#study-btn', 600);
await page.waitForSelector('#study-body .book-card');
await shot('06-study.png');

// 9. 跟练（词最少的单元）
await page.click(`#study-body .book-card`);
await page.waitForSelector('#study-body .unit-row');
const unitIdx = await page.evaluate(async () => {
  const books = await window.__TAURI__.core.invoke('get_books');
  const units = books[0].units;
  let min = 0;
  units.forEach((u, i) => { if (u.word_count < units[min].word_count) min = i; });
  return min;
});
{
  const rows = await page.$$('#study-body .unit-row');
  const btn = await rows[unitIdx].$('.act-practice');
  await btn.click();
}
await page.waitForSelector('#modal-practice[open]');
await tick(400);
await shot('07-practice.png');
// 走完全部跟练卡（正确项恒在第 1 个）
guard = 0;
while (!(await page.$('#practice-done-btn')) && guard++ < 300) {
  await click('#practice-area .opt-btn', 60);
  if (await page.$('#practice-next')) await click('#practice-next', 60);
}
await click('#practice-done-btn', 500);

// 10. 考试
const rows = await page.$$('#study-body .unit-row');
await rows[unitIdx].$('.act-exam').then(b => b.click());
await page.waitForSelector('#modal-exam[open]');
await tick(400);
await shot('08-exam.png');
// 逐题作答（每次点击都会重渲染，必须用选择器重新定位）
for (let i = 0; i < 15; i++) {
  await page.click(`#exam-area .opt-btn[data-q="${i}"][data-o="0"]`);
  await tick(30);
}
await click('#exam-submit', 600);
await shot('09-exam-score.png');

// 11. 小助手豆豆：描述生成衣服
await page.click('#modal-exam .close-btn');
await tick(300);
await page.click('#study-back-btn');
await tick(400);
await page.click('#doudou-btn');
await tick(200);
await page.type('#dd-input', '设计一件粉色爱心卫衣');
await page.click('#dd-send');
await page.waitForSelector('.dd-equip', { timeout: 5000 });
await tick(300);
await shot('10-doudou.png');

await browser.close();
server.close();
console.log(`\n✅ 截图已输出到 docs/screenshots/`);
