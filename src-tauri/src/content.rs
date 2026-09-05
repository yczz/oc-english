// 内容层：13 册人教版词库（内嵌编译）+ 语法知识库 + 单词形态变换规则
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::OnceLock;

#[derive(Deserialize, Clone)]
pub struct Word {
    pub en: String,
    pub zh: String,
    #[serde(default)]
    #[allow(dead_code)] // 音标字段预留，后续可展示在词卡上
    pub phonetic: String,
}

#[derive(Deserialize, Clone)]
pub struct Unit {
    pub id: String,
    pub title: String,
    pub words: Vec<Word>,
}

#[derive(Deserialize, Clone)]
pub struct Book {
    pub id: String,
    pub title: String,
    pub stage: String,
    pub units: Vec<Unit>,
}

#[derive(Deserialize)]
struct GrammarFile {
    points: Vec<GrammarPoint>,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct GrammarPoint {
    pub id: String,
    pub title: String,
    pub explain: String,
}

const BOOK_FILES: [(&str, &str); 13] = [
    ("pep-primary-g3-s1", include_str!("../data/books/pep-primary-g3-s1.json")),
    ("pep-primary-g3-s2", include_str!("../data/books/pep-primary-g3-s2.json")),
    ("pep-primary-g4-s1", include_str!("../data/books/pep-primary-g4-s1.json")),
    ("pep-primary-g4-s2", include_str!("../data/books/pep-primary-g4-s2.json")),
    ("pep-primary-g5-s1", include_str!("../data/books/pep-primary-g5-s1.json")),
    ("pep-primary-g5-s2", include_str!("../data/books/pep-primary-g5-s2.json")),
    ("pep-primary-g6-s1", include_str!("../data/books/pep-primary-g6-s1.json")),
    ("pep-primary-g6-s2", include_str!("../data/books/pep-primary-g6-s2.json")),
    ("pep-junior-g7-s1", include_str!("../data/books/pep-junior-g7-s1.json")),
    ("pep-junior-g7-s2", include_str!("../data/books/pep-junior-g7-s2.json")),
    ("pep-junior-g8-s1", include_str!("../data/books/pep-junior-g8-s1.json")),
    ("pep-junior-g8-s2", include_str!("../data/books/pep-junior-g8-s2.json")),
    ("pep-junior-g9", include_str!("../data/books/pep-junior-g9.json")),
];

const GRAMMAR_JSON: &str = include_str!("../data/grammar.json");

static BOOKS: OnceLock<Vec<Book>> = OnceLock::new();
static GRAMMAR: OnceLock<Vec<GrammarPoint>> = OnceLock::new();

pub fn books() -> &'static Vec<Book> {
    BOOKS.get_or_init(|| {
        BOOK_FILES
            .iter()
            .filter_map(|(_, raw)| serde_json::from_str::<Book>(raw).ok())
            .collect()
    })
}

pub fn grammar_points() -> &'static Vec<GrammarPoint> {
    GRAMMAR.get_or_init(|| {
        serde_json::from_str::<GrammarFile>(GRAMMAR_JSON)
            .map(|f| f.points)
            .unwrap_or_default()
    })
}

pub fn find_book(book_id: &str) -> Option<&'static Book> {
    books().iter().find(|b| b.id == book_id)
}

pub fn find_unit(book_id: &str, unit_id: &str) -> Option<(&'static Book, &'static Unit)> {
    find_book(book_id).and_then(|b| b.units.iter().find(|u| u.id == unit_id).map(|u| (b, u)))
}

pub fn grammar_point(id: &str) -> Option<&'static GrammarPoint> {
    grammar_points().iter().find(|p| p.id == id)
}

// ---------- 小助手豆豆：全库词/语法检索 ----------
#[derive(Serialize, Clone)]
pub struct WordHit {
    pub en: String,
    pub zh: String,
    pub book: String,
}

/// 按英文子串（或中文释义）全库检索单词
pub fn search_words(q: &str, limit: usize) -> Vec<WordHit> {
    let q = q.trim().to_lowercase();
    if q.is_empty() {
        return vec![];
    }
    let en_query = q.chars().next().map_or(false, |c| c.is_ascii_alphabetic());
    let mut out = Vec::new();
    for b in books() {
        for u in &b.units {
            for w in &u.words {
                let hit = if en_query {
                    w.en.to_lowercase().contains(&q)
                } else {
                    w.zh.contains(&q)
                };
                if hit {
                    out.push(WordHit {
                        en: w.en.clone(),
                        zh: w.zh.clone(),
                        book: b.title.clone(),
                    });
                    if out.len() >= limit {
                        return out;
                    }
                }
            }
        }
    }
    out
}

/// 按关键词检索语法点
pub fn search_grammar(q: &str, limit: usize) -> Vec<&'static GrammarPoint> {
    let q = q.trim();
    if q.is_empty() {
        return vec![];
    }
    grammar_points()
        .iter()
        .filter(|p| p.title.contains(q) || p.explain.contains(q))
        .take(limit)
        .collect()
}

/// 每册配套的语法点（手工映射，贴合人教社各册教学重点）
pub fn book_grammar(book_id: &str) -> Vec<&'static str> {
    match book_id {
        "pep-primary-g3-s1" => vec!["a_an", "plural", "be_verb"],
        "pep-primary-g3-s2" => vec!["plural", "be_verb", "pronoun"],
        "pep-primary-g4-s1" => vec!["a_an", "plural", "there_be"],
        "pep-primary-g4-s2" => vec!["be_verb", "pronoun", "can"],
        "pep-primary-g5-s1" => vec!["there_be", "can", "plural"],
        "pep-primary-g5-s2" => vec!["present_continuous", "be_verb", "third_s"],
        "pep-primary-g6-s1" => vec!["past_ed", "third_s", "there_be"],
        "pep-primary-g6-s2" => vec!["comparative", "past_ed", "some_any"],
        "pep-junior-g7-s1" => vec!["third_s", "be_verb", "pronoun", "there_be"],
        "pep-junior-g7-s2" => vec!["present_continuous", "can", "some_any"],
        "pep-junior-g8-s1" => vec!["comparative", "superlative", "past_ed"],
        "pep-junior-g8-s2" => vec!["superlative", "some_any", "modal_must"],
        "pep-junior-g9" => vec!["modal_must", "comparative", "past_ed", "present_continuous"],
        _ => vec!["plural", "be_verb"],
    }
}

// ---------- 词性判断（释义首字母标记：n. / v. / vt. / vi. / adj. …） ----------
pub fn is_noun(w: &Word) -> bool {
    w.zh.starts_with("n.") || w.zh.starts_with("n ")
}

pub fn is_verb(w: &Word) -> bool {
    w.zh.starts_with('v') // v. / vt. / vi.
}

pub fn is_adjective(w: &Word) -> bool {
    w.zh.starts_with("adj.") || w.zh.starts_with("a.")
}

// ---------- 单词形态变换（语法题引擎用） ----------
fn ends_any(s: &str, sufs: &[&str]) -> bool {
    sufs.iter().any(|x| s.ends_with(x))
}

fn is_vowel(c: char) -> bool {
    matches!(c, 'a' | 'e' | 'i' | 'o' | 'u')
}

/// 复数
pub fn pluralize(s: &str) -> String {
    let lower = s.to_lowercase();
    let irregular: HashMap<&str, &str> = [
        ("man", "men"), ("woman", "women"), ("child", "children"),
        ("foot", "feet"), ("tooth", "teeth"), ("mouse", "mice"),
        ("fish", "fish"), ("sheep", "sheep"), ("people", "people"),
    ].into_iter().collect();
    if let Some(p) = irregular.get(lower.as_str()) {
        return p.to_string();
    }
    if ends_any(&lower, &["s", "x", "ch", "sh"]) {
        return format!("{}es", s);
    }
    if lower.ends_with('y') && lower.len() >= 2 {
        let pre = lower.chars().rev().nth(1).unwrap();
        if !is_vowel(pre) {
            return format!("{}ies", &s[..s.len() - 1]);
        }
    }
    format!("{}s", s)
}

/// 第三人称单数
pub fn third_person(s: &str) -> String {
    let lower = s.to_lowercase();
    if lower == "have" { return "has".into(); }
    if lower == "do" { return "does".into(); }
    if lower == "go" { return "goes".into(); }
    if ends_any(&lower, &["s", "x", "ch", "sh", "o"]) {
        return format!("{}es", s);
    }
    if lower.ends_with('y') && lower.len() >= 2 {
        let pre = lower.chars().rev().nth(1).unwrap();
        if !is_vowel(pre) {
            return format!("{}ies", &s[..s.len() - 1]);
        }
    }
    format!("{}s", s)
}

/// 现在分词 -ing
pub fn gerund(s: &str) -> String {
    let lower = s.to_lowercase();
    if lower == "have" { return "having".into(); }
    if lower == "see" { return "seeing".into(); }
    // 以不发音 e 结尾（简化：以 ie→ying，元音+辅音+e 去 e）
    if lower.ends_with("ie") {
        return format!("{}ying", &s[..s.len() - 2]);
    }
    if lower.ends_with('e') && !lower.ends_with("ee") && lower.len() >= 3 {
        return format!("{}ing", &s[..s.len() - 1]);
    }
    // 重读闭音节双写（常见小词表）
    let double: [&str; 10] = ["run", "swim", "sit", "get", "put", "cut", "stop", "shop", "plan", "swim"];
    if double.contains(&lower.as_str()) {
        let last = lower.chars().last().unwrap();
        return format!("{}{}ing", s, last);
    }
    format!("{}ing", s)
}

/// 过去式
pub fn past_tense(s: &str) -> String {
    let lower = s.to_lowercase();
    let irregular: HashMap<&str, &str> = [
        ("go", "went"), ("see", "saw"), ("eat", "ate"), ("have", "had"),
        ("do", "did"), ("is", "was"), ("are", "were"), ("am", "was"),
        ("come", "came"), ("make", "made"), ("take", "took"), ("get", "got"),
        ("read", "read"), ("write", "wrote"), ("run", "ran"), ("swim", "swam"),
        ("buy", "bought"), ("teach", "taught"), ("say", "said"), ("give", "gave"),
    ].into_iter().collect();
    if let Some(p) = irregular.get(lower.as_str()) {
        return p.to_string();
    }
    if lower.ends_with('e') {
        return format!("{}d", s);
    }
    if lower.ends_with('y') && lower.len() >= 2 {
        let pre = lower.chars().rev().nth(1).unwrap();
        if !is_vowel(pre) {
            return format!("{}ied", &s[..s.len() - 1]);
        }
    }
    format!("{}ed", s)
}

/// 比较级
pub fn comparative(s: &str) -> String {
    let lower = s.to_lowercase();
    let irregular: HashMap<&str, &str> = [
        ("good", "better"), ("bad", "worse"), ("many", "more"),
        ("much", "more"), ("little", "less"), ("old", "older"),
    ].into_iter().collect();
    if let Some(p) = irregular.get(lower.as_str()) {
        return p.to_string();
    }
    if lower.len() >= 6 && !lower.ends_with('y') {
        return format!("more {}", s); // 长词用 more
    }
    if lower.ends_with('e') {
        return format!("{}r", s);
    }
    if lower.ends_with('y') {
        return format!("{}ier", &s[..s.len() - 1]);
    }
    // 短词双写尾辅音（big→bigger）：CVC 结构且长度≤4
    let chars: Vec<char> = lower.chars().collect();
    if chars.len() == 3 && !is_vowel(chars[0]) && is_vowel(chars[1]) && !is_vowel(chars[2]) {
        return format!("{}{}er", s, chars[2]);
    }
    format!("{}er", s)
}

/// 最高级
pub fn superlative(s: &str) -> String {
    let comp = comparative(s);
    if comp.starts_with("more ") {
        return format!("most {}", s);
    }
    let irregular: HashMap<&str, &str> = [("better", "best"), ("worse", "worst"), ("older", "oldest")]
        .into_iter().collect();
    if let Some(p) = irregular.get(comp.as_str()) {
        return p.to_string();
    }
    if comp.ends_with("ier") {
        return format!("{}iest", &comp[..comp.len() - 3]);
    }
    if comp.ends_with('r') && !comp.ends_with("er") {
        return format!("{}st", comp);
    }
    if comp.ends_with("er") {
        return format!("{}est", &comp[..comp.len() - 2]);
    }
    format!("{}est", s)
}

/// 不定冠词 a / an
pub fn article_for(s: &str) -> &'static str {
    match s.to_lowercase().chars().next() {
        Some('a') | Some('e') | Some('i') | Some('o') | Some('u') => "an",
        _ => "a",
    }
}
