// 指令层：所有前端可调用的 Tauri 命令
// ⚠️ 本项目核心踩坑教训：save_profile 绝不内部加锁，只接收调用方已持有的引用
use crate::content;
use crate::models::{ExamPaper, ExamResult, Face, Placed, Profile, Question};
use crate::questions;
use crate::shop;
use serde::Serialize;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::State;

/// 状态访问抽象：生产代码走 Tauri State，集成测试可直接构造 AppState 驱动
pub trait StateAccess {
    fn profile(&self) -> &Mutex<Option<Profile>>;
    fn data_dir(&self) -> &Path;
}

impl StateAccess for State<'_, AppState> {
    fn profile(&self) -> &Mutex<Option<Profile>> {
        &self.profile
    }
    fn data_dir(&self) -> &Path {
        &self.data_dir
    }
}

impl StateAccess for AppState {
    fn profile(&self) -> &Mutex<Option<Profile>> {
        &self.profile
    }
    fn data_dir(&self) -> &Path {
        &self.data_dir
    }
}

pub const ROOM_W: u32 = 12;
pub const ROOM_H: u32 = 8;
pub const EXAM_TOTAL: u32 = 15;
pub const EXAM_PASS: u32 = 12;
pub const EXAM_REWARD: i64 = 100;
pub const RETAKE_PER_Q: i64 = 10;
pub const PRACTICE_PER_Q: i64 = 2;

pub struct AppState {
    pub profile: Mutex<Option<Profile>>,
    pub data_dir: PathBuf,
}

// ---------- 存档（绝不加锁） ----------
fn profile_path(data_dir: &Path, name: &str) -> PathBuf {
    data_dir.join("profiles").join(format!("{}.json", safe_name(name).unwrap_or_default()))
}

pub fn save_profile(data_dir: &Path, profile: &Profile) {
    let path = profile_path(data_dir, &profile.name);
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Ok(json) = serde_json::to_string_pretty(profile) {
        let _ = std::fs::write(path, json);
    }
}

fn load_profile(data_dir: &Path, name: &str) -> Result<Profile, String> {
    let path = profile_path(data_dir, name);
    let raw = std::fs::read_to_string(&path).map_err(|_| format!("档案「{}」不存在", name))?;
    serde_json::from_str(&raw).map_err(|e| format!("档案损坏：{}", e))
}

/// 档案名合法性：非空、≤20 字符、无路径字符
pub fn safe_name(name: &str) -> Result<String, String> {
    let t = name.trim();
    if t.is_empty() {
        return Err("名字不能为空".into());
    }
    let chars: Vec<char> = t.chars().collect();
    if chars.len() > 20 {
        return Err("名字最长 20 个字符".into());
    }
    if t.contains('/') || t.contains('\\') || t.contains("..") {
        return Err("名字里不能有特殊字符".into());
    }
    Ok(t.to_string())
}

fn with_profile<S: StateAccess, F, T>(state: &S, f: F) -> Result<T, String>
where
    F: FnOnce(&mut Profile) -> Result<T, String>,
{
    let mut guard = state.profile().lock().unwrap();
    let p = guard.as_mut().ok_or("请先注册或登录一个档案")?;
    let r = f(p)?;
    save_profile(state.data_dir(), p);
    Ok(r)
}

// ---------- 档案注册 / 登录 ----------
#[tauri::command]
pub fn list_profiles(state: State<AppState>) -> Vec<String> {
    list_profiles_core(&state)
}

pub fn list_profiles_core<S: StateAccess>(state: &S) -> Vec<String> {
    let dir = state.data_dir().join("profiles");
    let mut names = Vec::new();
    if let Ok(entries) = std::fs::read_dir(dir) {
        for e in entries.flatten() {
            if let Some(n) = e.file_name().to_str() {
                if let Some(stem) = n.strip_suffix(".json") {
                    names.push(stem.to_string());
                }
            }
        }
    }
    names.sort();
    names
}

#[tauri::command]
pub fn register_profile(state: State<AppState>, name: String) -> Result<Profile, String> {
    register_profile_core(&state, name)
}

pub fn register_profile_core<S: StateAccess>(state: &S, name: String) -> Result<Profile, String> {
    let name = safe_name(&name)?;
    if profile_path(state.data_dir(), &name).exists() {
        return Err("这个名字已被注册，换一个或直接登录".into());
    }
    let profile = Profile::new(&name);
    save_profile(state.data_dir(), &profile);
    *state.profile().lock().unwrap() = Some(profile.clone());
    Ok(profile)
}

#[tauri::command]
pub fn login_profile(state: State<AppState>, name: String) -> Result<Profile, String> {
    login_profile_core(&state, name)
}

pub fn login_profile_core<S: StateAccess>(state: &S, name: String) -> Result<Profile, String> {
    let profile = load_profile(state.data_dir(), &name)?;
    *state.profile().lock().unwrap() = Some(profile.clone());
    Ok(profile)
}

#[tauri::command]
pub fn logout_profile(state: State<AppState>) -> Result<(), String> {
    logout_profile_core(&state)
}

pub fn logout_profile_core<S: StateAccess>(state: &S) -> Result<(), String> {
    *state.profile().lock().unwrap() = None;
    Ok(())
}

#[tauri::command]
pub fn get_profile(state: State<AppState>) -> Result<Profile, String> {
    get_profile_core(&state)
}

pub fn get_profile_core<S: StateAccess>(state: &S) -> Result<Profile, String> {
    state
        .profile()
        .lock()
        .unwrap()
        .clone()
        .ok_or_else(|| "请先注册或登录一个档案".to_string())
}

// ---------- 人物 ----------
#[tauri::command]
pub fn create_character(state: State<AppState>, name: String) -> Result<Profile, String> {
    create_character_core(&state, name)
}

pub fn create_character_core<S: StateAccess>(state: &S, name: String) -> Result<Profile, String> {
    let name = safe_name(&name)?;
    with_profile(state, |p| {
        if p.characters.iter().any(|c| c.name == name) {
            return Err("已经有同名的人物了".into());
        }
        let c = crate::models::Character {
            id: crate::models::uid(),
            name: name.clone(),
            face: Face { show_blush: false, mouth: 5, ..Default::default() },
            outfit: Default::default(),
            room: vec![Placed { item_id: "bed_basic".into(), x: 1, y: 3 }], // 新手小床
            created_at: crate::models::today_str(),
        };
        p.characters.push(c.clone());
        p.active_character_id = Some(c.id);
        Ok(p.clone())
    })
}

#[tauri::command]
pub fn switch_character(state: State<AppState>, char_id: String) -> Result<Profile, String> {
    switch_character_core(&state, char_id)
}

pub fn switch_character_core<S: StateAccess>(state: &S, char_id: String) -> Result<Profile, String> {
    with_profile(state, |p| {
        if !p.characters.iter().any(|c| c.id == char_id) {
            return Err("找不到这个人物".into());
        }
        p.active_character_id = Some(char_id);
        Ok(p.clone())
    })
}

#[tauri::command]
pub fn update_face(state: State<AppState>, char_id: String, face: Face) -> Result<Profile, String> {
    update_face_core(&state, char_id, face)
}

pub fn update_face_core<S: StateAccess>(state: &S, char_id: String, face: Face) -> Result<Profile, String> {
    with_profile(state, |p| {
        let idx = p.characters.iter().position(|c| c.id == char_id).ok_or("找不到这个人物")?;
        p.characters[idx].face = face;
        Ok(p.clone())
    })
}

#[tauri::command]
pub fn equip_item(
    state: State<AppState>,
    char_id: String,
    slot: String,
    item_id: String,
) -> Result<Profile, String> {
    equip_item_core(&state, char_id, slot, item_id)
}

pub fn equip_item_core<S: StateAccess>(
    state: &S,
    char_id: String,
    slot: String,
    item_id: String,
) -> Result<Profile, String> {
    with_profile(state, |p| {
        if !item_id.is_empty() {
            if let Some(custom) = p.custom_items.iter().find(|c| c.id == item_id) {
                // 小助手生成的自定义装扮：只校验部位
                if custom.slot != slot {
                    return Err("这件装扮不能穿在这个部位".into());
                }
            } else {
                let item = shop::wardrobe_item(&item_id).ok_or("商品不存在")?;
                if item.slot != slot {
                    return Err("这件装扮不能穿在这个部位".into());
                }
                if !p.inventory.contains(&item_id) {
                    return Err("还没拥有这件装扮，先去商店购买".into());
                }
            }
        }
        let idx = p.characters.iter().position(|c| c.id == char_id).ok_or("找不到这个人物")?;
        let o = &mut p.characters[idx].outfit;
        match slot.as_str() {
            "hat" => o.hat = item_id,
            "glasses" => o.glasses = item_id,
            "top" => o.top = item_id,
            "bottom" => o.bottom = item_id,
            "shoes" => o.shoes = item_id,
            "held" => o.held = item_id,
            "back" => o.back = item_id,
            "earring" => o.earring = item_id,
            _ => return Err("未知部位".into()),
        }
        Ok(p.clone())
    })
}

// ---------- 商店 ----------
#[derive(Serialize)]
pub struct Catalog {
    pub wardrobe: &'static Vec<shop::WardrobeItem>,
    pub furniture: &'static Vec<shop::FurnitureItem>,
}

// ---------- 小助手自定义装扮 ----------
#[tauri::command]
pub fn search_words(query: String) -> Vec<content::WordHit> {
    content::search_words(&query, 5)
}

#[tauri::command]
pub fn search_grammar(query: String) -> Vec<content::GrammarPoint> {
    content::search_grammar(&query, 2).into_iter().cloned().collect()
}

#[tauri::command]
pub fn add_custom_item(
    state: State<AppState>,
    name: String,
    slot: String,
    art: String,
) -> Result<Profile, String> {
    with_profile(&state, |p| {
        if !matches!(
            slot.as_str(),
            "hat" | "glasses" | "top" | "bottom" | "shoes" | "held" | "back" | "earring"
        ) {
            return Err("未知部位".into());
        }
        if !art.contains('<') {
            return Err("衣服图案不合法".into());
        }
        let id = format!("custom_{}", crate::models::uid());
        p.custom_items.push(crate::models::CustomItem {
            id: id.clone(),
            name: name.chars().take(20).collect(),
            slot,
            art,
            created_at: crate::models::today_str(),
        });
        p.inventory.push(id);
        Ok(p.clone())
    })
}

#[tauri::command]
pub fn get_catalog() -> Catalog {
    Catalog {
        wardrobe: shop::wardrobe(),
        furniture: shop::furniture(),
    }
}

#[tauri::command]
pub fn buy_item(state: State<AppState>, item_id: String) -> Result<Profile, String> {
    buy_item_core(&state, item_id)
}

pub fn buy_item_core<S: StateAccess>(state: &S, item_id: String) -> Result<Profile, String> {
    with_profile(state, |p| {
        let price = shop::item_price(&item_id).ok_or("商品不存在")?;
        if p.inventory.contains(&item_id) {
            return Err("已经拥有这件商品了".into());
        }
        if p.points < price {
            return Err(format!("积分不够：需要 {}，当前 {}", price, p.points));
        }
        p.points -= price;
        p.inventory.push(item_id);
        Ok(p.clone())
    })
}

// ---------- 房间 ----------
#[tauri::command]
pub fn place_furniture(
    state: State<AppState>,
    char_id: String,
    item_id: String,
    x: u32,
    y: u32,
) -> Result<Profile, String> {
    place_furniture_core(&state, char_id, item_id, x, y)
}

pub fn place_furniture_core<S: StateAccess>(
    state: &S,
    char_id: String,
    item_id: String,
    x: u32,
    y: u32,
) -> Result<Profile, String> {
    with_profile(state, |p| {
        let item = shop::furniture_item(&item_id).ok_or("家具不存在")?;
        if !p.inventory.contains(&item_id) {
            return Err("还没拥有这件家具，先去商店购买".into());
        }
        if x + item.w > ROOM_W || y + item.h > ROOM_H {
            return Err("超出房间边界了".into());
        }
        let idx = p.characters.iter().position(|c| c.id == char_id).ok_or("找不到这个人物")?;
        let room = &mut p.characters[idx].room;
        // 重叠检测（同一件家具重新摆放除外）
        for pl in room.iter() {
            if pl.item_id == item_id {
                continue;
            }
            if let Some(other) = shop::furniture_item(&pl.item_id) {
                let overlap = x < pl.x + other.w && pl.x < x + item.w && y < pl.y + other.h && pl.y < y + item.h;
                if overlap {
                    return Err(format!("这里已经摆了「{}」", other.name));
                }
            }
        }
        room.retain(|pl| pl.item_id != item_id);
        room.push(Placed { item_id, x, y });
        Ok(p.clone())
    })
}

#[tauri::command]
pub fn remove_furniture(state: State<AppState>, char_id: String, item_id: String) -> Result<Profile, String> {
    remove_furniture_core(&state, char_id, item_id)
}

pub fn remove_furniture_core<S: StateAccess>(state: &S, char_id: String, item_id: String) -> Result<Profile, String> {
    with_profile(state, |p| {
        let idx = p.characters.iter().position(|c| c.id == char_id).ok_or("找不到这个人物")?;
        p.characters[idx].room.retain(|pl| pl.item_id != item_id);
        Ok(p.clone())
    })
}

// ---------- 学习：教材目录 ----------
#[derive(Serialize)]
pub struct UnitView {
    pub id: String,
    pub title: String,
    pub word_count: usize,
    pub practiced: usize,
    pub completed: bool,
    pub exam_best: u32,
    pub exam_passed: bool,
    pub exams_taken: u32,
}

#[derive(Serialize)]
pub struct BookView {
    pub id: String,
    pub title: String,
    pub stage: String,
    pub units: Vec<UnitView>,
}

#[tauri::command]
pub fn get_books(state: State<AppState>) -> Result<Vec<BookView>, String> {
    get_books_core(&state)
}

pub fn get_books_core<S: StateAccess>(state: &S) -> Result<Vec<BookView>, String> {
    let guard = state.profile().lock().unwrap();
    let p = guard.as_ref().ok_or("请先注册或登录一个档案")?;
    let views = content::books()
        .iter()
        .map(|b| BookView {
            id: b.id.clone(),
            title: b.title.clone(),
            stage: b.stage.clone(),
            units: b
                .units
                .iter()
                .map(|u| {
                    let key = Profile::progress_key(&b.id, &u.id);
                    let prog = p.progress.get(&key);
                    let practiced = prog
                        .map(|g| {
                            u.words
                                .iter()
                                .filter(|w| g.practiced_words.contains(&w.en))
                                .count()
                        })
                        .unwrap_or(0);
                    UnitView {
                        id: u.id.clone(),
                        title: u.title.clone(),
                        word_count: u.words.len(),
                        practiced,
                        completed: practiced >= u.words.len(),
                        exam_best: prog.map(|g| g.exam_best).unwrap_or(0),
                        exam_passed: prog.map(|g| g.exam_passed).unwrap_or(false),
                        exams_taken: prog.map(|g| g.exams_taken).unwrap_or(0),
                    }
                })
                .collect(),
        })
        .collect();
    Ok(views)
}

// ---------- 跟练 ----------
#[tauri::command]
pub fn get_practice_cards(state: State<AppState>, book_id: String, unit_id: String) -> Result<Vec<Question>, String> {
    get_practice_cards_core(&state, book_id, unit_id)
}

pub fn get_practice_cards_core<S: StateAccess>(state: &S, book_id: String, unit_id: String) -> Result<Vec<Question>, String> {
    let _ = state.profile().lock().unwrap().as_ref().ok_or("请先注册或登录一个档案")?;
    questions::practice_cards(&book_id, &unit_id)
}

/// 跟练答题：答对 +2 分；单词/听力卡答对会把该词记入单元进度
#[derive(Serialize)]
pub struct PracticeResult {
    pub points_awarded: i64,
    pub word_learned: Option<String>,
    pub unit_completed: bool,
}

#[tauri::command]
pub fn answer_practice(
    state: State<AppState>,
    book_id: String,
    unit_id: String,
    card_id: String,
    correct: bool,
) -> Result<PracticeResult, String> {
    answer_practice_core(&state, book_id, unit_id, card_id, correct)
}

pub fn answer_practice_core<S: StateAccess>(
    state: &S,
    book_id: String,
    unit_id: String,
    card_id: String,
    correct: bool,
) -> Result<PracticeResult, String> {
    with_profile(state, |p| {
        let (_, unit) = content::find_unit(&book_id, &unit_id).ok_or("找不到单元")?;
        let mut awarded = 0;
        let mut word_learned = None;
        if correct {
            awarded = PRACTICE_PER_Q;
            p.points += PRACTICE_PER_Q;
            // card_id 形如 "w:apple" / "l:apple" → 记入已练单词
            if let Some(w) = card_id.strip_prefix("w:").or_else(|| card_id.strip_prefix("l:")) {
                if unit.words.iter().any(|x| x.en == w) {
                    let key = Profile::progress_key(&book_id, &unit_id);
                    let prog = p.progress.entry(key).or_default();
                    if !prog.practiced_words.contains(&w.to_string()) {
                        prog.practiced_words.push(w.to_string());
                        word_learned = Some(w.to_string());
                    }
                }
            }
        }
        let key = Profile::progress_key(&book_id, &unit_id);
        let completed = p
            .progress
            .get(&key)
            .map(|g| unit.words.iter().all(|w| g.practiced_words.contains(&w.en)))
            .unwrap_or(false);
        Ok(PracticeResult {
            points_awarded: awarded,
            word_learned,
            unit_completed: completed,
        })
    })
}

// ---------- 考试 ----------
#[tauri::command]
pub fn start_exam(state: State<AppState>, book_id: String, unit_id: String) -> Result<ExamPaper, String> {
    start_exam_core(&state, book_id, unit_id)
}

pub fn start_exam_core<S: StateAccess>(state: &S, book_id: String, unit_id: String) -> Result<ExamPaper, String> {
    let guard = state.profile().lock().unwrap();
    let p = guard.as_ref().ok_or("请先注册或登录一个档案")?;
    let (_, unit) = content::find_unit(&book_id, &unit_id).ok_or("找不到单元")?;
    let key = Profile::progress_key(&book_id, &unit_id);
    let prog = p.progress.get(&key);
    let practiced = prog.map(|g| g.practiced_words.len()).unwrap_or(0);
    if practiced < unit.words.len() {
        return Err(format!(
            "先把本单元跟练完成才能考试（已练 {}/{} 词）",
            practiced,
            unit.words.len()
        ));
    }
    let attempt = prog.map(|g| g.exams_taken).unwrap_or(0);
    drop(guard);
    questions::exam_paper(&book_id, &unit_id, attempt)
}

#[tauri::command]
pub fn submit_exam(
    state: State<AppState>,
    book_id: String,
    unit_id: String,
    answers: Vec<usize>,
) -> Result<ExamResult, String> {
    submit_exam_core(&state, book_id, unit_id, answers)
}

pub fn submit_exam_core<S: StateAccess>(
    state: &S,
    book_id: String,
    unit_id: String,
    answers: Vec<usize>,
) -> Result<ExamResult, String> {
    with_profile(state, |p| {
        let key = Profile::progress_key(&book_id, &unit_id);
        let attempt = p.progress.get(&key).map(|g| g.exams_taken).unwrap_or(0);
        let paper = questions::exam_paper(&book_id, &unit_id, attempt)?;
        if answers.len() != paper.questions.len() {
            return Err("答案数量与题目不符".into());
        }
        let correct = paper
            .questions
            .iter()
            .zip(answers.iter())
            .filter(|(q, a)| **a == q.answer)
            .count() as u32;
        let passed = correct >= EXAM_PASS;

        let prog = p.progress.entry(key).or_default();
        let first_pass = passed && !prog.exam_passed;
        let mut awarded: i64 = 0;
        if first_pass {
            awarded = EXAM_REWARD; // 首次通过 100 分
        } else if passed && correct > prog.exam_best {
            awarded = (correct - prog.exam_best) as i64 * RETAKE_PER_Q; // 重考按提升补差
        }
        p.points += awarded;
        prog.exam_best = prog.exam_best.max(correct);
        prog.exam_passed |= passed;
        prog.exams_taken += 1;

        Ok(ExamResult {
            correct,
            total: EXAM_TOTAL,
            passed,
            points_awarded: awarded,
            is_first_pass: first_pass,
            best: prog.exam_best,
        })
    })
}

// ---------- 语法卡（本册配套） ----------
#[derive(Serialize)]
pub struct GrammarCard {
    pub id: String,
    pub title: String,
    pub explain: String,
}

#[tauri::command]
pub fn get_grammar_cards(book_id: String) -> Vec<GrammarCard> {
    content::book_grammar(&book_id)
        .iter()
        .filter_map(|id| {
            content::grammar_point(id).map(|pt| GrammarCard {
                id: pt.id.clone(),
                title: pt.title.clone(),
                explain: pt.explain.clone(),
            })
        })
        .collect()
}

// 让 HashMap 保持被引用（避免未使用告警，同时保证 use 不被误删）
#[allow(dead_code)]
fn _type_anchor(_: HashMap<String, String>) {}
