// 指令契约测试：前端 api.js 调用的指令名必须与 lib.rs 注册的指令一一对应
// （Tauri 2 指令名 = Rust 函数 snake_case 原名，不做 camelCase 转换）
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const libRs = readFileSync(root + 'src-tauri/src/lib.rs', 'utf8');
const apiJs = readFileSync(root + 'src/js/api.js', 'utf8');

// lib.rs：generate_handler![...] 中的 commands::xxx 列表
const handlerBlock = libRs.match(/generate_handler!\[([\s\S]*?)\]/)?.[1] ?? '';
const registered = [...handlerBlock.matchAll(/commands::(\w+)/g)].map(m => m[1]);

// api.js：所有 call('xxx') 的指令名
const called = [...apiJs.matchAll(/call\('([\w_]+)'/g)].map(m => m[1]);

let failed = 0;
const check = (cond, msg) => { if (!cond) { failed++; console.error('❌ ' + msg); } else console.log('✅ ' + msg); };

check(registered.length === 19, `lib.rs 注册了 19 个指令（实际 ${registered.length}）`);
check(called.length === 19, `api.js 调用了 19 个指令（实际 ${called.length}）`);

const regSet = new Set(registered);
const missing = called.filter(c => !regSet.has(c));
check(missing.length === 0, `api.js 的指令名全部已注册（未注册：${missing.join(',') || '无'}）`);

const calledSet = new Set(called);
const unused = registered.filter(r => !calledSet.has(r));
check(unused.length === 0, `注册的指令全部被前端使用（未使用：${unused.join(',') || '无'}）`);

// 参数名契约：api.js 传的参数键（camelCase）转 snake_case 后应与 Rust 指令参数一致
const cmdsRs = readFileSync(root + 'src-tauri/src/commands.rs', 'utf8');
const toSnake = s => s.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
const argCalls = [...apiJs.matchAll(/call\('[\w_]+',\s*\{\s*([^}]*)\}\)/g)];
let argBad = [];
for (const m of argCalls) {
  const keys = [...m[1].matchAll(/(\w+)\s*[,:}]/g)].map(x => x[1]).filter(k => k !== 'call');
  // 粗校验：每个键的 snake 形式应在 commands.rs 中出现过（作为参数名）
  for (const k of keys) {
    if (!new RegExp(`\\b${toSnake(k)}\\b`).test(cmdsRs)) argBad.push(k);
  }
}
check(argBad.length === 0, `参数键均能映射到 Rust 参数（异常：${argBad.join(',') || '无'}）`);

console.log(failed === 0 ? '\n🎉 指令契约测试全部通过' : `\n💥 ${failed} 项失败`);
process.exit(failed === 0 ? 0 : 1);
