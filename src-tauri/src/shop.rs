// 商店目录：50 件 装扮（9 部位）+ 18 件家具（含网格占位）
use serde::{Deserialize, Serialize};
use std::sync::OnceLock;

#[derive(Serialize, Deserialize, Clone)]
pub struct WardrobeItem {
    pub id: String,
    pub name: String,
    pub slot: String, // hat / glasses / top / bottom / shoes / held / back / earring
    pub price: i64,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct FurnitureItem {
    pub id: String,
    pub name: String,
    pub price: i64,
    pub w: u32, // 网格宽
    pub h: u32, // 网格高
}

const WARDROBE_JSON: &str = include_str!("../data/wardrobe.json");
const FURNITURE_JSON: &str = include_str!("../data/furniture.json");

static WARDROBE: OnceLock<Vec<WardrobeItem>> = OnceLock::new();
static FURNITURE: OnceLock<Vec<FurnitureItem>> = OnceLock::new();

pub fn wardrobe() -> &'static Vec<WardrobeItem> {
    WARDROBE.get_or_init(|| serde_json::from_str(WARDROBE_JSON).unwrap_or_default())
}

pub fn furniture() -> &'static Vec<FurnitureItem> {
    FURNITURE.get_or_init(|| serde_json::from_str(FURNITURE_JSON).unwrap_or_default())
}

pub fn wardrobe_item(id: &str) -> Option<&'static WardrobeItem> {
    wardrobe().iter().find(|i| i.id == id)
}

pub fn furniture_item(id: &str) -> Option<&'static FurnitureItem> {
    furniture().iter().find(|i| i.id == id)
}

/// 按 id 查价（装扮或家具）
pub fn item_price(id: &str) -> Option<i64> {
    wardrobe_item(id).map(|i| i.price).or_else(|| furniture_item(id).map(|i| i.price))
}
