// 带着OC学英语 v2 · Tauri 入口
pub mod commands;
pub mod content;
pub mod models;
pub mod questions;
pub mod shop;

use commands::AppState;
use std::sync::Mutex;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir = app.path().app_data_dir().expect("无法获取应用数据目录");
            let _ = std::fs::create_dir_all(data_dir.join("profiles"));
            // 预热内容（尽早暴露数据错误）
            let _ = content::books();
            let _ = shop::wardrobe();
            let _ = shop::furniture();
            app.manage(AppState {
                profile: Mutex::new(None),
                data_dir,
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_profiles,
            commands::register_profile,
            commands::login_profile,
            commands::logout_profile,
            commands::get_profile,
            commands::create_character,
            commands::switch_character,
            commands::update_face,
            commands::equip_item,
            commands::add_custom_item,
            commands::search_words,
            commands::search_grammar,
            commands::get_catalog,
            commands::buy_item,
            commands::place_furniture,
            commands::remove_furniture,
            commands::get_books,
            commands::get_practice_cards,
            commands::answer_practice,
            commands::start_exam,
            commands::submit_exam,
            commands::get_grammar_cards
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn books_loaded_all_13() {
        assert_eq!(content::books().len(), 13);
        for b in content::books() {
            assert!(!b.units.is_empty(), "册 {} 没有单元", b.id);
        }
    }

    #[test]
    fn catalogs_match_design() {
        assert_eq!(shop::wardrobe().len(), 50, "装扮应为 50 件");
        assert_eq!(shop::furniture().len(), 18, "家具应为 18 件");
        for f in shop::furniture() {
            assert!(f.w >= 1 && f.w <= 4 && f.h >= 1 && f.h <= 2);
        }
    }

    #[test]
    fn morphology_rules() {
        assert_eq!(content::pluralize("box"), "boxes");
        assert_eq!(content::pluralize("baby"), "babies");
        assert_eq!(content::pluralize("boy"), "boys");
        assert_eq!(content::pluralize("child"), "children");
        assert_eq!(content::third_person("study"), "studies");
        assert_eq!(content::third_person("have"), "has");
        assert_eq!(content::gerund("make"), "making");
        assert_eq!(content::gerund("run"), "running");
        assert_eq!(content::past_tense("go"), "went");
        assert_eq!(content::past_tense("study"), "studied");
        assert_eq!(content::comparative("big"), "bigger");
        assert_eq!(content::comparative("happy"), "happier");
        assert_eq!(content::superlative("tall"), "tallest");
        assert_eq!(content::article_for("apple"), "an");
        assert_eq!(content::article_for("book"), "a");
    }

    #[test]
    fn practice_cards_and_exam_paper() {
        let cards = questions::practice_cards("pep-primary-g3-s1", "u1").unwrap();
        assert!(cards.len() > 10);
        for c in &cards {
            assert_eq!(c.options.len(), 4);
            assert!(c.answer < 4);
        }
        let paper = questions::exam_paper("pep-primary-g3-s1", "u1", 0).unwrap();
        assert_eq!(paper.questions.len(), 15);
        let kinds: std::collections::HashMap<&str, usize> =
            paper.questions.iter().fold(Default::default(), |mut m, q| {
                *m.entry(q.kind.as_str()).or_insert(0) += 1;
                m
            });
        assert_eq!(kinds.get("word"), Some(&8));
        assert_eq!(kinds.get("listening"), Some(&4));
        assert_eq!(kinds.get("grammar"), Some(&3));
        // 同一考卷重复生成必须一致（重放判定依赖确定性种子）
        let paper2 = questions::exam_paper("pep-primary-g3-s1", "u1", 0).unwrap();
        assert_eq!(
            paper.questions.iter().map(|q| &q.id).collect::<Vec<_>>(),
            paper2.questions.iter().map(|q| &q.id).collect::<Vec<_>>()
        );
    }

    #[test]
    fn every_unit_can_make_exam() {
        // 全部 104 个单元都能生成合法考卷（单元词少时听力从全书补题）
        for b in content::books() {
            for u in &b.units {
                let paper = questions::exam_paper(&b.id, &u.id, 0)
                    .unwrap_or_else(|e| panic!("{} {} 出卷失败: {}", b.id, u.id, e));
                assert_eq!(paper.questions.len(), 15, "{} {} 题数不对", b.id, u.id);
                for q in &paper.questions {
                    assert_eq!(q.options.len(), 4, "{} {} 题 {} 选项数不对", b.id, u.id, q.id);
                    assert!(q.answer < 4);
                }
            }
        }
    }
}
