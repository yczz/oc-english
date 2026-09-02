// Tauri invoke 封装
// ⚠️ 指令名必须用 Rust 函数的 snake_case 原名；参数名才是 camelCase→snake_case 自动转换
const invoke = window.__TAURI__?.core?.invoke;

async function call(cmd, args = {}) {
  if (!invoke) throw new Error('Tauri 未加载（请在桌面应用内打开）');
  return invoke(cmd, args);
}

export const api = {
  listProfiles: () => call('list_profiles'),
  registerProfile: name => call('register_profile', { name }),
  loginProfile: name => call('login_profile', { name }),
  logoutProfile: () => call('logout_profile'),
  getProfile: () => call('get_profile'),

  createCharacter: name => call('create_character', { name }),
  switchCharacter: charId => call('switch_character', { charId }),
  updateFace: (charId, face) => call('update_face', { charId, face }),
  equipItem: (charId, slot, itemId) => call('equip_item', { charId, slot, itemId }),

  getCatalog: () => call('get_catalog'),
  buyItem: itemId => call('buy_item', { itemId }),
  placeFurniture: (charId, itemId, x, y) => call('place_furniture', { charId, itemId, x, y }),
  removeFurniture: (charId, itemId) => call('remove_furniture', { charId, itemId }),

  getBooks: () => call('get_books'),
  getPracticeCards: (bookId, unitId) => call('get_practice_cards', { bookId, unitId }),
  answerPractice: (bookId, unitId, cardId, correct) =>
    call('answer_practice', { bookId, unitId, cardId, correct }),
  startExam: (bookId, unitId) => call('start_exam', { bookId, unitId }),
  submitExam: (bookId, unitId, answers) => call('submit_exam', { bookId, unitId, answers }),
  getGrammarCards: bookId => call('get_grammar_cards', { bookId }),
};

// 轻量 toast
export function toast(msg, ms = 2200) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = 'none'; }, ms);
}
