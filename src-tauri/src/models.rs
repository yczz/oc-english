// 带着OC学英语 v2 · 数据模型
// 设计依据：24 项决策清单（本地多档案注册 / 多角色 / 全量拆件换装 / 12×8 网格房间 /
// 单货币积分 / 跟练+单元考 / 重考补差）
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

fn default_true() -> bool {
    true
}

// ---------- 捏脸（免费部位） ----------
#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Face {
    #[serde(default)]
    pub skin_tone: u8,
    #[serde(default)]
    pub hair_style: i8,
    #[serde(default)]
    pub hair_color: u8,
    #[serde(default)]
    pub eye_style: i8,
    #[serde(default)]
    pub eye_color: u8,
    #[serde(default)]
    pub mouth: i8,
    #[serde(default = "default_true")]
    pub show_blush: bool,
}

// ---------- 装扮（商店部位，"" 表示未穿戴） ----------
#[derive(Serialize, Deserialize, Clone, Default)]
pub struct Outfit {
    #[serde(default)]
    pub hat: String,
    #[serde(default)]
    pub glasses: String,
    #[serde(default)]
    pub top: String,
    #[serde(default)]
    pub bottom: String,
    #[serde(default)]
    pub shoes: String,
    #[serde(default)]
    pub held: String,
    #[serde(default)]
    pub earring: String,
    #[serde(default)]
    pub back: String,
}

// ---------- 房间家具摆放 ----------
#[derive(Serialize, Deserialize, Clone)]
pub struct Placed {
    pub item_id: String,
    pub x: u32,
    pub y: u32,
}

// ---------- 自定义装扮（小助手按描述生成） ----------
#[derive(Serialize, Deserialize, Clone)]
pub struct CustomItem {
    pub id: String,
    pub name: String,
    /// 部位：hat/glasses/top/bottom/shoes/held/back/earring
    pub slot: String,
    /// SVG 片段（200×300 画布坐标系）
    pub art: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Character {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub face: Face,
    #[serde(default)]
    pub outfit: Outfit,
    #[serde(default)]
    pub room: Vec<Placed>,
    pub created_at: String,
}

// ---------- 学习进度（键："书id:单元id"） ----------
#[derive(Serialize, Deserialize, Clone, Default)]
pub struct UnitProgress {
    #[serde(default)]
    pub practiced_words: Vec<String>, // 跟练答对过的单词
    #[serde(default)]
    pub exam_best: u32,               // 历史最好成绩（答对题数）
    #[serde(default)]
    pub exam_passed: bool,            // 是否曾通过（≥12/15）
    #[serde(default)]
    pub exams_taken: u32,
}

// ---------- 玩家档案（一个档案一个存档文件） ----------
#[derive(Serialize, Deserialize, Clone)]
pub struct Profile {
    pub name: String,
    pub points: i64,
    #[serde(default)]
    pub characters: Vec<Character>,
    #[serde(default)]
    pub active_character_id: Option<String>,
    /// 已购买（或新手礼包赠送）的物品：装扮 + 家具
    #[serde(default)]
    pub inventory: Vec<String>,
    /// 小助手生成的自定义装扮
    #[serde(default)]
    pub custom_items: Vec<CustomItem>,
    #[serde(default)]
    pub progress: HashMap<String, UnitProgress>,
    pub created_at: String,
}

impl Profile {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            points: 200, // 新手礼包：200 积分
            characters: Vec::new(),
            active_character_id: None,
            // 新手礼包：小床 + 一套基础衣（上衣/下装/鞋）
            inventory: vec![
                "bed_basic".into(),
                "top_starter".into(),
                "bottom_starter".into(),
                "shoes_starter".into(),
            ],
            progress: HashMap::new(),
            custom_items: Vec::new(),
            created_at: today_str(),
        }
    }

    pub fn progress_key(book_id: &str, unit_id: &str) -> String {
        format!("{}:{}", book_id, unit_id)
    }
}

pub fn today_str() -> String {
    chrono::Local::now().format("%Y-%m-%d").to_string()
}

pub fn uid() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    format!(
        "{}_{:06x}",
        chrono::Local::now().format("%Y%m%d%H%M%S"),
        rng.gen::<u32>() % 0xffffff
    )
}

// ---------- 题目 ----------
#[derive(Serialize, Deserialize, Clone)]
pub struct Question {
    pub id: String,
    /// word（看词选义）/ listening（听音选词）/ grammar（语法填空）
    pub kind: String,
    pub prompt: String,
    /// 听力题需要朗读的文本（前端 TTS）
    #[serde(default)]
    pub speak: Option<String>,
    pub options: Vec<String>,
    pub answer: usize,
    /// 语法题附带的讲解卡（首次答错时展示）
    #[serde(default)]
    pub explain: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExamPaper {
    pub book_id: String,
    pub unit_id: String,
    pub questions: Vec<Question>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ExamResult {
    pub correct: u32,
    pub total: u32,
    pub passed: bool,
    pub points_awarded: i64,
    pub is_first_pass: bool,
    pub best: u32,
}
