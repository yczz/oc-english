// 出题引擎：跟练卡片与单元考卷
// 题型：word（看词选义）/ listening（听音选词，前端 TTS 朗读）/ grammar（模板语法填空）
use crate::content::{self, Book, Unit, Word};
use crate::models::Question;
use rand::seq::SliceRandom;
use rand::{Rng, SeedableRng};
use rand::rngs::StdRng;

fn seed_rng(book_id: &str, unit_id: &str, salt: u64) -> StdRng {
    let mut h: u64 = 1469598103934665603;
    for b in format!("{}:{}:{}", book_id, unit_id, salt).bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(1099511628211);
    }
    StdRng::seed_from_u64(h)
}

/// 生成 4 选项（含正确答案），返回 (选项, 正确答案下标)
fn four_options(rng: &mut StdRng, correct: String, mut others: Vec<String>) -> (Vec<String>, usize) {
    others.retain(|o| o != &correct);
    others.shuffle(rng);
    let mut opts: Vec<String> = others.into_iter().take(3).collect();
    opts.push(correct.clone());
    opts.shuffle(rng);
    let ans = opts.iter().position(|o| o == &correct).unwrap();
    (opts, ans)
}

fn zh_of(w: &Word) -> String {
    // 释义裁短：取第一个分号前
    w.zh.split(['；', ';']).next().unwrap_or(&w.zh).trim().to_string()
}

/// 看词选义
fn word_question(book: &Book, target: &Word, rng: &mut StdRng) -> Question {
    let pool: Vec<String> = book
        .units
        .iter()
        .flat_map(|u| u.words.iter())
        .filter(|w| w.en != target.en)
        .map(|w| zh_of(w))
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    let (options, answer) = four_options(rng, zh_of(target), pool);
    Question {
        id: format!("w:{}", target.en),
        kind: "word".into(),
        prompt: format!("「{}」 是什么意思？", target.en),
        speak: None,
        options,
        answer,
        explain: None,
    }
}

/// 听音选词
fn listening_question(book: &Book, target: &Word, rng: &mut StdRng) -> Question {
    let pool: Vec<String> = book
        .units
        .iter()
        .flat_map(|u| u.words.iter())
        .filter(|w| w.en != target.en && (w.en.len() as i32 - target.en.len() as i32).abs() <= 4)
        .map(|w| w.en.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();
    let (options, answer) = four_options(rng, target.en.clone(), pool);
    Question {
        id: format!("l:{}", target.en),
        kind: "listening".into(),
        prompt: "听发音，选出你听到的单词".into(),
        speak: Some(target.en.clone()),
        options,
        answer,
        explain: None,
    }
}

fn nouns(unit: &Unit) -> Vec<&Word> {
    unit.words.iter().filter(|w| content::is_noun(w)).collect()
}
fn verbs(unit: &Unit) -> Vec<&Word> {
    unit.words.iter().filter(|w| content::is_verb(w)).collect()
}
fn adjectives(unit: &Unit) -> Vec<&Word> {
    unit.words.iter().filter(|w| content::is_adjective(w)).collect()
}

fn grammar_explain(point_id: &str) -> Option<String> {
    content::grammar_point(point_id).map(|p| format!("📖 {}：{}", p.title, p.explain))
}

/// 语法填空：按本册语法点 + 本单元单词生成
fn grammar_question(book_id: &str, unit: &Unit, rng: &mut StdRng) -> Option<Question> {
    let points = content::book_grammar(book_id);
    let mut tries = points.to_vec();
    tries.shuffle(rng);
    let ns = nouns(unit);
    let vs = verbs(unit);
    let adjs = adjectives(unit);

    for point in tries {
        match point {
            "plural" | "a_an" | "there_be" if ns.is_empty() => continue,
            "third_s" | "present_continuous" | "past_ed" | "can" if vs.is_empty() => continue,
            "comparative" | "superlative" if adjs.is_empty() => continue,
            _ => {}
        }
        match point {
            "plural" => {
                let w = ns.choose(rng).unwrap();
                let correct = content::pluralize(&w.en);
                let wrongs = vec![
                    w.en.clone(),
                    format!("{}es", w.en),
                    format!("{}s{}", w.en, "s"),
                ];
                let (options, answer) = four_options(rng, correct, wrongs);
                return Some(Question {
                    id: format!("g:plural:{}", w.en),
                    kind: "grammar".into(),
                    prompt: format!("one {}, two ___", w.en),
                    speak: None, options, answer,
                    explain: grammar_explain("plural"),
                });
            }
            "a_an" => {
                let w = ns.choose(rng).unwrap();
                let correct = content::article_for(&w.en);
                let (options, answer) = four_options(
                    rng, correct.to_string(),
                    vec!["a".into(), "an".into(), "the".into(), "some".into()],
                );
                return Some(Question {
                    id: format!("g:a_an:{}", w.en),
                    kind: "grammar".into(),
                    prompt: format!("I have ___ {}.", w.en),
                    speak: None, options, answer,
                    explain: grammar_explain("a_an"),
                });
            }
            "be_verb" => {
                let (subject, correct): (&str, &str) =
                    *[(("She"), "is"), (("I"), "am"), (("They"), "are"), (("My cat"), "is")]
                        .choose(rng).unwrap();
                let (options, answer) = four_options(
                    rng, correct.to_string(),
                    vec!["am".into(), "is".into(), "are".into(), "be".into()],
                );
                return Some(Question {
                    id: format!("g:be:{}", subject),
                    kind: "grammar".into(),
                    prompt: format!("{} ___ my good friend.", subject),
                    speak: None, options, answer,
                    explain: grammar_explain("be_verb"),
                });
            }
            "pronoun" => {
                let (ctx, correct): (&str, &str) = *[
                    ("This is my brother.", "He"),
                    ("This is my sister.", "She"),
                    ("I have a cat.", "It"),
                    ("These are my friends.", "They"),
                ].choose(rng).unwrap();
                let (options, answer) = four_options(
                    rng, correct.to_string(),
                    vec!["He".into(), "She".into(), "It".into(), "They".into()],
                );
                return Some(Question {
                    id: format!("g:pronoun:{}", correct),
                    kind: "grammar".into(),
                    prompt: format!("{} ___ is very nice.", ctx),
                    speak: None, options, answer,
                    explain: grammar_explain("pronoun"),
                });
            }
            "there_be" => {
                let w = ns.choose(rng).unwrap();
                let plural_now = rng.gen_bool(0.5);
                let (prompt, correct) = if plural_now {
                    (format!("There ___ two {}s in the room.", w.en), "are")
                } else {
                    (format!("There ___ a {} in the room.", w.en), "is")
                };
                let (options, answer) = four_options(
                    rng, correct.to_string(),
                    vec!["is".into(), "are".into(), "am".into(), "be".into()],
                );
                return Some(Question {
                    id: format!("g:therebe:{}", w.en),
                    kind: "grammar".into(),
                    prompt, speak: None, options, answer,
                    explain: grammar_explain("there_be"),
                });
            }
            "can" => {
                let w = vs.choose(rng).unwrap();
                let base = w.en.split_whitespace().next().unwrap_or(&w.en).to_string();
                let (options, answer) = four_options(
                    rng, base.clone(),
                    vec![content::third_person(&base), content::gerund(&base), content::past_tense(&base)],
                );
                return Some(Question {
                    id: format!("g:can:{}", base),
                    kind: "grammar".into(),
                    prompt: format!("I can ___ very well."),
                    speak: None, options, answer,
                    explain: grammar_explain("can"),
                });
            }
            "third_s" => {
                let w = vs.choose(rng).unwrap();
                let base = w.en.split_whitespace().next().unwrap_or(&w.en).to_string();
                let (options, answer) = four_options(
                    rng, content::third_person(&base),
                    vec![base.clone(), content::gerund(&base), content::past_tense(&base)],
                );
                return Some(Question {
                    id: format!("g:third:{}", base),
                    kind: "grammar".into(),
                    prompt: format!("She ___ it every day."),
                    speak: None, options, answer,
                    explain: grammar_explain("third_s"),
                });
            }
            "present_continuous" => {
                let w = vs.choose(rng).unwrap();
                let base = w.en.split_whitespace().next().unwrap_or(&w.en).to_string();
                let (options, answer) = four_options(
                    rng, content::gerund(&base),
                    vec![base.clone(), content::third_person(&base), content::past_tense(&base)],
                );
                return Some(Question {
                    id: format!("g:ing:{}", base),
                    kind: "grammar".into(),
                    prompt: format!("Listen! He is ___ now."),
                    speak: None, options, answer,
                    explain: grammar_explain("present_continuous"),
                });
            }
            "past_ed" => {
                let w = vs.choose(rng).unwrap();
                let base = w.en.split_whitespace().next().unwrap_or(&w.en).to_string();
                let (options, answer) = four_options(
                    rng, content::past_tense(&base),
                    vec![base.clone(), content::gerund(&base), content::third_person(&base)],
                );
                return Some(Question {
                    id: format!("g:past:{}", base),
                    kind: "grammar".into(),
                    prompt: format!("Yesterday we ___ together."),
                    speak: None, options, answer,
                    explain: grammar_explain("past_ed"),
                });
            }
            "comparative" => {
                let w = adjs.choose(rng).unwrap();
                let base = w.en.clone();
                let comp = content::comparative(&base);
                let wrongs = vec![base.clone(), content::superlative(&base), format!("very {}", base)];
                let (options, answer) = four_options(rng, comp, wrongs);
                return Some(Question {
                    id: format!("g:comp:{}", base),
                    kind: "grammar".into(),
                    prompt: format!("My bag is ___ than yours."),
                    speak: None, options, answer,
                    explain: grammar_explain("comparative"),
                });
            }
            "superlative" => {
                let w = adjs.choose(rng).unwrap();
                let base = w.en.clone();
                let sup = content::superlative(&base);
                let wrongs = vec![base.clone(), content::comparative(&base), format!("more {}", base)];
                let (options, answer) = four_options(rng, sup, wrongs);
                return Some(Question {
                    id: format!("g:sup:{}", base),
                    kind: "grammar".into(),
                    prompt: format!("It is the ___ of the three."),
                    speak: None, options, answer,
                    explain: grammar_explain("superlative"),
                });
            }
            "some_any" => {
                // 交替出肯定句（some）与否定句（any）
                let affirmative = rng.gen_bool(0.5);
                let (prompt, correct) = if affirmative {
                    ("I have ___ books in my bag.".to_string(), "some")
                } else {
                    ("I don't have ___ books.".to_string(), "any")
                };
                let (options, answer) = four_options(
                    rng, correct.to_string(),
                    vec!["some".into(), "any".into(), "a".into(), "an".into()],
                );
                return Some(Question {
                    id: format!("g:someany:{}", correct),
                    kind: "grammar".into(),
                    prompt,
                    speak: None, options, answer,
                    explain: grammar_explain("some_any"),
                });
            }
            "modal_must" => {
                let (prompt, correct): (&str, &str) = *[
                    ("It's raining. You ___ take an umbrella.", "should"),
                    ("We ___ listen to the teacher in class.", "must"),
                    ("You ___ play with fire. It's dangerous!", "mustn't"),
                ].choose(rng).unwrap();
                let (options, answer) = four_options(
                    rng, correct.to_string(),
                    vec!["should".into(), "must".into(), "mustn't".into(), "can't".into()],
                );
                return Some(Question {
                    id: format!("g:modal:{}", correct),
                    kind: "grammar".into(),
                    prompt: prompt.to_string(),
                    speak: None, options, answer,
                    explain: grammar_explain("modal_must"),
                });
            }
            _ => continue,
        }
    }
    None
}

/// 跟练卡片：每个单词 1 张看词卡 + 1 张听力卡，另加 3 张语法卡
pub fn practice_cards(book_id: &str, unit_id: &str) -> Result<Vec<Question>, String> {
    let (book, unit) = content::find_unit(book_id, unit_id)
        .ok_or_else(|| format!("找不到 {} {}", book_id, unit_id))?;
    let mut rng = seed_rng(book_id, unit_id, 1);
    let mut cards = Vec::new();
    let mut ws: Vec<&Word> = unit.words.iter().collect();
    ws.shuffle(&mut rng);
    for w in &ws {
        cards.push(word_question(book, w, &mut rng));
        cards.push(listening_question(book, w, &mut rng));
    }
    for _ in 0..3 {
        if let Some(g) = grammar_question(book_id, unit, &mut rng) {
            cards.push(g);
        }
    }
    cards.shuffle(&mut rng);
    Ok(cards)
}

/// 单元考卷：15 题 = 单词 8 + 听力 4 + 语法 3（每次考试随机不同）
pub fn exam_paper(book_id: &str, unit_id: &str, attempt: u32) -> Result<crate::models::ExamPaper, String> {
    let (book, unit) = content::find_unit(book_id, unit_id)
        .ok_or_else(|| format!("找不到 {} {}", book_id, unit_id))?;
    let mut rng = seed_rng(book_id, unit_id, 100 + attempt as u64);
    let mut questions = Vec::new();

    let mut ws: Vec<&Word> = unit.words.iter().collect();
    ws.shuffle(&mut rng);

    for w in ws.iter().take(8) {
        questions.push(word_question(book, w, &mut rng));
    }
    // 听力词不足 4 个时用全书补
    let mut listen_pool: Vec<&Word> = ws.iter().take(4).copied().collect();
    if listen_pool.len() < 4 {
        let extra: Vec<&Word> = book.units.iter().flat_map(|u| u.words.iter())
            .filter(|w| !listen_pool.iter().any(|p| p.en == w.en))
            .take(4 - listen_pool.len()).collect();
        listen_pool.extend(extra);
    }
    for w in &listen_pool {
        questions.push(listening_question(book, w, &mut rng));
    }
    let mut g = 0;
    let mut salt = 0u64;
    while g < 3 {
        salt += 1;
        let mut r2 = seed_rng(book_id, unit_id, 500 + attempt as u64 * 17 + salt);
        match grammar_question(book_id, unit, &mut r2) {
            Some(q) if !questions.iter().any(|x| x.id == q.id) => { questions.push(q); g += 1; }
            _ => { if salt > 20 { break; } }
        }
    }
    // 保底补齐到 15 题：单元题源不够时从全书抽词补（不重复）
    let mut all_words: Vec<&Word> = book.units.iter().flat_map(|u| u.words.iter()).collect();
    all_words.shuffle(&mut rng);
    for w in &all_words {
        if questions.len() >= 15 {
            break;
        }
        let cand = if rng.gen_bool(0.5) {
            word_question(book, w, &mut rng)
        } else {
            listening_question(book, w, &mut rng)
        };
        if !questions.iter().any(|q| q.id == cand.id) {
            questions.push(cand);
        }
    }
    questions.truncate(15);
    questions.shuffle(&mut rng);
    Ok(crate::models::ExamPaper {
        book_id: book_id.into(),
        unit_id: unit_id.into(),
        questions,
    })
}
