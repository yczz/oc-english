// 端到端集成测试：按前端真实调用顺序驱动全部 19 个指令的核心逻辑
// 覆盖：注册 → 人物 → 捏脸 → 商店 → 换装 → 房间 → 跟练 → 考试 → 重考 → 存档持久化
use oc_english_lib::commands::{self as cmd, AppState};
use oc_english_lib::models::Face;
use std::path::PathBuf;
use std::sync::Mutex;

fn fresh_state() -> (AppState, PathBuf) {
    let dir = std::env::temp_dir().join(format!("oc-english-test-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&dir);
    std::fs::create_dir_all(&dir).unwrap();
    let state = AppState {
        profile: Mutex::new(None),
        data_dir: dir.clone(),
    };
    (state, dir)
}

#[test]
fn full_user_journey() {
    let (state, dir) = fresh_state();

    // ---------- 1. 注册 ----------
    let profile = cmd::register_profile_core(&state, "测试员".into()).unwrap();
    assert_eq!(profile.points, 200, "新手礼包应为 200 积分");
    assert_eq!(profile.inventory.len(), 4, "新手礼包 4 件物品");
    assert!(cmd::register_profile_core(&state, "测试员".into()).is_err(), "重名应拒绝");
    assert!(cmd::register_profile_core(&state, "".into()).is_err(), "空名应拒绝");
    assert!(cmd::list_profiles_core(&state).contains(&"测试员".to_string()));

    // ---------- 2. 创建人物 ----------
    let profile = cmd::create_character_core(&state, "毛毛".into()).unwrap();
    assert_eq!(profile.characters.len(), 1);
    let char_id = profile.characters[0].id.clone();
    assert_eq!(profile.active_character_id.as_deref(), Some(char_id.as_str()));
    assert!(profile.characters[0].room.iter().any(|p| p.item_id == "bed_basic"), "新手小床应自动摆上");
    assert!(cmd::create_character_core(&state, "毛毛".into()).is_err(), "人物重名应拒绝");

    // ---------- 3. 捏脸 ----------
    let face = Face {
        skin_tone: 2,
        hair_style: 3,
        hair_color: 4,
        eye_style: 1,
        eye_color: 2,
        mouth: 2,
        show_blush: false,
    };
    let profile = cmd::update_face_core(&state, char_id.clone(), face.clone()).unwrap();
    assert_eq!(profile.characters[0].face.hair_color, 4);
    assert!(cmd::update_face_core(&state, "不存在".into(), face).is_err());

    // ---------- 4. 商店 ----------
    let catalog = cmd::get_catalog();
    assert_eq!(catalog.wardrobe.len(), 50);
    assert_eq!(catalog.furniture.len(), 18);
    // 买一件便宜的装扮（留够积分给后续买家具）
    let hat = catalog.wardrobe.iter().filter(|w| w.price > 0).min_by_key(|w| w.price).unwrap();
    let points_before = cmd::get_profile_core(&state).unwrap().points;
    let profile = cmd::buy_item_core(&state, hat.id.clone()).unwrap();
    assert_eq!(profile.points, points_before - hat.price as i64, "购买应扣积分");
    assert!(profile.inventory.contains(&hat.id));
    assert!(cmd::buy_item_core(&state, hat.id.clone()).is_err(), "重复购买应拒绝");
    assert!(cmd::buy_item_core(&state, "不存在的商品".into()).is_err());
    // 积分不足：若最贵的商品买不起，则应拒绝
    let cur_points = cmd::get_profile_core(&state).unwrap().points;
    let max_price = catalog
        .wardrobe.iter().map(|w| w.price)
        .chain(catalog.furniture.iter().map(|f| f.price))
        .max()
        .unwrap() as i64;
    if max_price > cur_points {
        let too_expensive = catalog.wardrobe.iter().find(|w| w.price as i64 == max_price)
            .map(|w| w.id.clone())
            .or_else(|| catalog.furniture.iter().find(|f| f.price as i64 == max_price).map(|f| f.id.clone()))
            .unwrap();
        assert!(cmd::buy_item_core(&state, too_expensive).is_err(), "积分不足应拒绝");
    }

    // ---------- 5. 换装 ----------
    let profile = cmd::equip_item_core(&state, char_id.clone(), hat.slot.clone(), hat.id.clone()).unwrap();
    let outfit = &profile.characters[0].outfit;
    let equipped = match hat.slot.as_str() {
        "hat" => &outfit.hat,
        "top" => &outfit.top,
        "bottom" => &outfit.bottom,
        "shoes" => &outfit.shoes,
        "glasses" => &outfit.glasses,
        "held" => &outfit.held,
        _ => &outfit.back,
    };
    assert_eq!(equipped, &hat.id);
    // 没买的不能穿
    let unowned = catalog.wardrobe.iter().find(|w| {
        !cmd::get_profile_core(&state).unwrap().inventory.contains(&w.id)
    }).unwrap();
    assert!(cmd::equip_item_core(&state, char_id.clone(), unowned.slot.clone(), unowned.id.clone()).is_err());
    // 脱下
    let profile = cmd::equip_item_core(&state, char_id.clone(), hat.slot.clone(), String::new()).unwrap();
    let outfit = &profile.characters[0].outfit;
    let now = match hat.slot.as_str() {
        "hat" => &outfit.hat,
        "top" => &outfit.top,
        "bottom" => &outfit.bottom,
        "shoes" => &outfit.shoes,
        "glasses" => &outfit.glasses,
        "held" => &outfit.held,
        _ => &outfit.back,
    };
    assert!(now.is_empty());

    // ---------- 6. 房间 ----------
    // 先买最便宜的家具；若积分不够，用跟练赚分（与真实玩法一致）
    let furn = catalog.furniture.iter().filter(|f| f.id != "bed_basic").min_by_key(|f| f.price).unwrap();
    while cmd::get_profile_core(&state).unwrap().points < furn.price {
        let r = cmd::answer_practice_core(&state, "pep-primary-g3-s1".into(), "u1".into(), "w:__earn__".into(), true).unwrap();
        assert_eq!(r.points_awarded, 2);
    }
    let profile = cmd::buy_item_core(&state, furn.id.clone()).unwrap();
    assert!(profile.inventory.contains(&furn.id));
    let profile = cmd::place_furniture_core(&state, char_id.clone(), furn.id.clone(), 8, 6).unwrap();
    assert!(profile.characters[0].room.iter().any(|p| p.item_id == furn.id && p.x == 8 && p.y == 6));
    assert!(cmd::place_furniture_core(&state, char_id.clone(), "bed_basic".into(), 1, 3).is_ok(), "同件重摆允许");
    assert!(cmd::place_furniture_core(&state, char_id.clone(), furn.id.clone(), 12, 0).is_err(), "越界应拒绝");
    assert!(cmd::place_furniture_core(&state, char_id.clone(), furn.id.clone(), 1, 3).is_err(), "重叠应拒绝");
    let profile = cmd::remove_furniture_core(&state, char_id.clone(), furn.id.clone()).unwrap();
    assert!(!profile.characters[0].room.iter().any(|p| p.item_id == furn.id));

    // ---------- 7. 教材目录 ----------
    let books = cmd::get_books_core(&state).unwrap();
    assert_eq!(books.len(), 13);
    let book = &books[0];
    let unit = &book.units[0];
    assert!(!unit.completed);
    assert_eq!(unit.practiced, 0);

    // ---------- 8. 跟练（未学完不许考试） ----------
    assert!(cmd::start_exam_core(&state, book.id.clone(), unit.id.clone()).is_err(), "跟练未完成不能开考");
    let cards = cmd::get_practice_cards_core(&state, book.id.clone(), unit.id.clone()).unwrap();
    assert!(!cards.is_empty());
    let mut points = cmd::get_profile_core(&state).unwrap().points;
    let mut completed_flag = false;
    for c in &cards {
        let res = cmd::answer_practice_core(&state, book.id.clone(), unit.id.clone(), c.id.clone(), true).unwrap();
        assert_eq!(res.points_awarded, 2);
        points += 2;
        completed_flag = res.unit_completed;
    }
    assert!(completed_flag, "全部答对后单元应标记完成");
    assert_eq!(cmd::get_profile_core(&state).unwrap().points, points, "跟练积分应精确入账");
    // 答错不给分
    let res = cmd::answer_practice_core(&state, book.id.clone(), unit.id.clone(), cards[0].id.clone(), false).unwrap();
    assert_eq!(res.points_awarded, 0);

    // ---------- 9. 考试 ----------
    let paper = cmd::start_exam_core(&state, book.id.clone(), unit.id.clone()).unwrap();
    assert_eq!(paper.questions.len(), 15);
    let all_correct: Vec<usize> = paper.questions.iter().map(|q| q.answer).collect();
    let res = cmd::submit_exam_core(&state, book.id.clone(), unit.id.clone(), all_correct.clone()).unwrap();
    assert_eq!(res.correct, 15);
    assert!(res.passed);
    assert!(res.is_first_pass);
    assert_eq!(res.points_awarded, 100, "首次通过大奖 100");
    assert_eq!(res.best, 15);

    // 重考全对：无提升 → 不再发奖
    let paper2 = cmd::start_exam_core(&state, book.id.clone(), unit.id.clone()).unwrap();
    let all_correct2: Vec<usize> = paper2.questions.iter().map(|q| q.answer).collect();
    let points_before = cmd::get_profile_core(&state).unwrap().points;
    let res = cmd::submit_exam_core(&state, book.id.clone(), unit.id.clone(), all_correct2).unwrap();
    assert!(res.passed && !res.is_first_pass);
    assert_eq!(res.points_awarded, 0, "重考无提升不补差");
    assert_eq!(cmd::get_profile_core(&state).unwrap().points, points_before);
    // 答案数量不符应拒绝
    assert!(cmd::submit_exam_core(&state, book.id.clone(), unit.id.clone(), vec![0; 3]).is_err());

    // 单元视图反映进度
    let books = cmd::get_books_core(&state).unwrap();
    let u = &books[0].units[0];
    assert!(u.completed && u.exam_passed);
    assert_eq!(u.exam_best, 15);
    assert_eq!(u.exams_taken, 2);

    // ---------- 10. 语法卡 ----------
    let gc = cmd::get_grammar_cards(book.id.clone());
    assert!(!gc.is_empty(), "每册应有语法卡");

    // ---------- 11. 切换人物 ----------
    let profile = cmd::create_character_core(&state, "二号".into()).unwrap();
    let id2 = profile.characters[1].id.clone();
    assert_eq!(profile.active_character_id.as_deref(), Some(id2.as_str()));
    let profile = cmd::switch_character_core(&state, char_id.clone()).unwrap();
    assert_eq!(profile.active_character_id.as_deref(), Some(char_id.as_str()));

    // ---------- 12. 存档持久化 ----------
    let points_final = cmd::get_profile_core(&state).unwrap().points;
    cmd::logout_profile_core(&state).unwrap();
    assert!(cmd::get_profile_core(&state).is_err(), "登出后应无档案");
    let profile = cmd::login_profile_core(&state, "测试员".into()).unwrap();
    assert_eq!(profile.points, points_final, "重新登录积分应一致");
    assert_eq!(profile.characters.len(), 2);
    assert!(dir.join("profiles").join("测试员.json").exists(), "存档文件应落盘");
}
