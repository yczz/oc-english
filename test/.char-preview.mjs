// 临时预览：把多组捏脸/装扮组合渲染成一张 PNG（test/.char-preview.png）便于目视检查
// 用法：node test/.char-preview.mjs
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const charMod = await import(root + 'src/js/character.js');

const CFG = [
  { t: '默认少女', c: { skin: 0, hair: 0, hairColor: 0, eyes: 0, eyeColor: 0, mouth: 0, showBlush: true, outfit: {} } },
  { t: '俊男·刺猬', c: { skin: 1, hair: 8, hairColor: 1, eyes: 4, eyeColor: 2, mouth: 3, showBlush: false, outfit: {} } },
  { t: '姬长发·星瞳', c: { skin: 0, hair: 7, hairColor: 4, eyes: 5, eyeColor: 5, mouth: 2, showBlush: true, outfit: {} } },
  { t: '双马尾·水手服', c: { skin: 0, hair: 5, hairColor: 2, eyes: 0, eyeColor: 3, mouth: 0, showBlush: true, outfit: { top: 'top_sailor', bottom: 'bottom_skirt', shoes: 'shoes_red' } } },
  { t: '齐刘海·眼镜', c: { skin: 2, hair: 1, hairColor: 3, eyes: 1, eyeColor: 1, mouth: 1, showBlush: true, outfit: { glasses: 'gl_round', top: 'top_hoodie', bottom: 'bottom_jeans', shoes: 'shoes_sport' } } },
  { t: '波波头·帽子', c: { skin: 0, hair: 2, hairColor: 5, eyes: 2, eyeColor: 4, mouth: 4, showBlush: true, outfit: { hat: 'hat_cap', top: 'top_dress', shoes: 'shoes_glass' } } },
  { t: '长直·和服袖', c: { skin: 1, hair: 3, hairColor: 7, eyes: 1, eyeColor: 0, mouth: 0, showBlush: true, outfit: { top: 'top_uniform', bottom: 'bottom_uniform', shoes: 'shoes_boot', held: 'held_katana' } } },
  { t: '侧马尾·翅膀', c: { skin: 0, hair: 6, hairColor: 6, eyes: 3, eyeColor: 5, mouth: 2, showBlush: true, outfit: { back: 'back_wings', top: 'top_sweater', bottom: 'bottom_pink', shoes: 'shoes_sandal' } } },
];

const cells = CFG.map(({ t, c }) =>
  `<div style="text-align:center"><div style="background:#fdf6ec;border-radius:12px;display:inline-block">${charMod.renderCharacterSVG(c, 1.5)}</div><div style="font:12px sans-serif;margin-top:4px">${t}</div></div>`).join('');
const html = `<html><body style="margin:0;background:#fff;display:flex;flex-wrap:wrap;gap:8px;padding:8px;width:1240px">${cells}</body></html>`;

const server = createServer((req, res) => { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); });
await new Promise(r => server.listen(0, '127.0.0.1', r));
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'new',
});
const page = await browser.newPage();
await page.setViewport({ width: 1260, height: 1000, deviceScaleFactor: 2 });
await page.goto(`http://127.0.0.1:${server.address().port}`);
await page.screenshot({ path: join(root, 'test', '.char-preview.png'), fullPage: true });
await browser.close();
server.close();
console.log('ok -> test/.char-preview.png');
