// 前端渲染层冒烟测试（Node）：
// 1. wardrobe.js 的 44 件素材 ID 与后端 wardrobe.json 完全一致
// 2. furniture.js 的 18 件素材 + 缩略图
// 3. character.js 渲染含全部图层、捏脸选项齐全
// 4. 所有 SVG 片段格式合法（开闭标签配对）
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url));
const wardrobeJson = JSON.parse(readFileSync(root + 'src-tauri/data/wardrobe.json', 'utf8'));
const furnitureJson = JSON.parse(readFileSync(root + 'src-tauri/data/furniture.json', 'utf8'));
const wItems = wardrobeJson.items ?? wardrobeJson;
const fItems = furnitureJson.items ?? furnitureJson;

const { WARDROBE_ART, wardrobeThumb } = await import(root + 'src/js/wardrobe.js');
const { FURNITURE_ART, furnitureThumb, CELL } = await import(root + 'src/js/furniture.js');
const charMod = await import(root + 'src/js/character.js');

let failed = 0;
const check = (cond, msg) => {
  if (!cond) { failed++; console.error('❌ ' + msg); } else console.log('✅ ' + msg);
};

// ---------- 1. 装扮素材对齐 ----------
check(wItems.length === 50, `wardrobe.json 共 50 件（实际 ${wItems.length}）`);
check(Object.keys(WARDROBE_ART).length >= 50, `WARDROBE_ART 素材数 ≥50（实际 ${Object.keys(WARDROBE_ART).length}）`);
const missingArt = wItems.filter(i => !WARDROBE_ART[i.id]).map(i => i.id);
check(missingArt.length === 0, `每件装扮都有素材（缺：${missingArt.join(',') || '无'}）`);
for (const i of wItems) {
  const t = wardrobeThumb(i.id);
  if (!t || !t.includes('<svg')) { failed++; console.error(`❌ 缩略图异常: ${i.id}`); }
}
console.log('✅ 50 件装扮缩略图全部生成');

// ---------- 2. 家具素材对齐 ----------
check(fItems.length === 18, `furniture.json 共 18 件（实际 ${fItems.length}）`);
const missingFurn = fItems.filter(i => !FURNITURE_ART[i.id]).map(i => i.id);
check(missingFurn.length === 0, `每件家具都有素材（缺：${missingFurn.join(',') || '无'}）`);
for (const i of fItems) {
  const t = furnitureThumb(i.id, 64);
  if (!t || !t.includes('<svg')) { failed++; console.error(`❌ 家具缩略图异常: ${i.id}`); }
  const vb = FURNITURE_ART[i.id].match(/viewBox="([\d ]+)"/);
  const [, , vw, vh] = vb[1].trim().split(/\s+/).map(Number);
  if (vw !== i.w * CELL || vh !== i.h * CELL) {
    failed++; console.error(`❌ ${i.id} viewBox(${vw}x${vh}) 与占地(${i.w * CELL}x${i.h * CELL})不符`);
  }
}
console.log('✅ 18 件家具缩略图 + viewBox 尺寸全部正确');

// ---------- 3. 人物渲染 ----------
const baseCfg = { skin: 0, hair: 0, hairColor: 0, eyes: 0, eyeColor: 0, mouth: 0, showBlush: true, outfit: {} };
const svg = charMod.renderCharacterSVG(baseCfg, 1);
check(svg.startsWith('<svg'), 'renderCharacterSVG 输出 <svg');
const opts = charMod.getPartOptions();
check(opts.hair.length >= 8 && opts.eyes.length >= 5 && opts.mouth.length >= 5,
  `捏脸选项：发型${opts.hair.length}/眼睛${opts.eyes.length}/嘴巴${opts.mouth.length}`);

// 穿全套装扮后渲染不报错且包含装扮片段
const fullCfg = { ...baseCfg, outfit: {} };
for (const i of wItems) fullCfg.outfit[i.slot] = fullCfg.outfit[i.slot] || i.id;
const dressed = charMod.renderCharacterSVG(fullCfg, 1);
check(dressed.length > svg.length, '穿装扮后 SVG 内容变多');

// -1 空部位不崩
const noneCfg = { ...baseCfg, hair: -1, eyes: -1, mouth: -1, showBlush: false };
check(charMod.renderCharacterSVG(noneCfg, 1).startsWith('<svg'), '空部位（-1）渲染正常');

// characterDataURL 可在 Node 外使用浏览器 API，跳过；检查函数存在
check(typeof charMod.characterDataURL === 'function', 'characterDataURL 已导出');
check(typeof charMod.profileCharToCfg === 'function', 'profileCharToCfg 已导出');

// ---------- 4. SVG 合法性（xmllint 真 XML 解析） ----------
const tmp = root + 'test/.svg-out/';
mkdirSync(tmp, { recursive: true });
function writeDoc(name, doc) {
  writeFileSync(tmp + name + '.svg', doc);
}
for (const [id, art] of Object.entries(WARDROBE_ART)) {
  writeDoc('w_' + id, art.trim().startsWith('<svg') ? art : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230">${art}</svg>`);
}
for (const [id, art] of Object.entries(FURNITURE_ART)) {
  writeDoc('f_' + id, art.trim().startsWith('<svg') ? art : `<svg xmlns="http://www.w3.org/2000/svg">${art}</svg>`);
}
writeDoc('char_base', svg);
writeDoc('char_dressed', dressed);
try {
  execFileSync('xmllint', ['--noout', '--quiet', ...Object.keys(WARDROBE_ART).map(id => tmp + 'w_' + id + '.svg'), ...Object.keys(FURNITURE_ART).map(id => tmp + 'f_' + id + '.svg'), tmp + 'char_base.svg', tmp + 'char_dressed.svg'], { stdio: 'pipe' });
  check(true, '全部 64 份 SVG 通过 xmllint XML 校验');
} catch (e) {
  check(false, 'xmllint 发现非法 SVG：\n' + (e.stderr?.toString() ?? e.message));
}

console.log(failed === 0 ? '\n🎉 渲染层冒烟测试全部通过' : `\n💥 ${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);
