// 家具素材：18 件，viewBox = 网格占位 × 48px（与房间编辑器一致）
// 质感规范：贴地投影 + 顶亮侧暗分层 + 高光/缝线细节（不用 defs 渐变，避免内联缩略图 id 冲突）
export const CELL = 48;

export const FURNITURE_ART = {
  bed_basic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 96">
<ellipse cx="76" cy="91" rx="62" ry="4" fill="#5a4636" opacity="0.1"/>
<path d="M8 22 Q8 8 20 8 Q32 8 32 22 L32 82 L8 82 Z" fill="#b58a5f" stroke="#8a6544" stroke-width="3"/>
<path d="M13 22 Q13 13 20 13 Q27 13 27 22" fill="none" stroke="#c9a87a" stroke-width="2.5"/>
<rect x="26" y="60" width="112" height="22" rx="6" fill="#c49a6c" stroke="#8a6544" stroke-width="3"/>
<rect x="30" y="74" width="104" height="7" rx="3.5" fill="#a67848"/>
<rect x="30" y="44" width="106" height="20" rx="8" fill="#fffdf7" stroke="#e4d8c2" stroke-width="2.5"/>
<path d="M36 54 L130 54" stroke="#efe6d4" stroke-width="2"/>
<rect x="34" y="32" width="30" height="15" rx="7" fill="#ffffff" stroke="#d8cfbc" stroke-width="2"/>
<path d="M40 39 Q49 42.5 58 39" fill="none" stroke="#e8e0cf" stroke-width="2"/>
<path d="M70 40 L136 40 Q140 40 140 46 L140 60 Q118 67 96 63 Q80 60 70 61 Z" fill="#f3ddd0" stroke="#e0bfae" stroke-width="2.5"/>
<path d="M84 42 Q82 52 84 60 M104 42 Q102 53 104 62 M122 42 Q120 51 122 60" fill="none" stroke="#e0bfae" stroke-width="2"/>
<rect x="30" y="82" width="8" height="9" rx="2" fill="#8a6544"/><rect x="126" y="82" width="8" height="9" rx="2" fill="#8a6544"/>
</svg>`,
  bed_soft: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 96">
<ellipse cx="76" cy="91" rx="62" ry="4" fill="#5a4636" opacity="0.1"/>
<rect x="6" y="12" width="26" height="70" rx="12" fill="#f2a2bd" stroke="#d17a9c" stroke-width="3"/>
<circle cx="15" cy="30" r="2" fill="#d17a9c"/><circle cx="23" cy="42" r="2" fill="#d17a9c"/><circle cx="15" cy="54" r="2" fill="#d17a9c"/>
<rect x="28" y="60" width="110" height="22" rx="8" fill="#f7c1d4" stroke="#d17a9c" stroke-width="3"/>
<rect x="32" y="74" width="102" height="7" rx="3.5" fill="#e39ab6"/>
<rect x="32" y="44" width="102" height="20" rx="8" fill="#fdeef4" stroke="#eebcd0" stroke-width="2.5"/>
<path d="M38 54 L128 54" stroke="#f5d8e4" stroke-width="2"/>
<rect x="36" y="32" width="28" height="15" rx="7" fill="#ffffff" stroke="#eebcd0" stroke-width="2"/>
<path d="M42 39 Q50 42.5 58 39" fill="none" stroke="#f0e0e8" stroke-width="2"/>
<path d="M68 40 L134 40 Q138 40 138 46 L138 60 Q116 67 96 63 Q79 60 68 61 Z" fill="#c8b6e2" stroke="#a48cc9" stroke-width="2.5"/>
<path d="M82 42 Q80 52 82 60 M100 42 Q98 53 100 62 M118 42 Q116 51 118 60" fill="none" stroke="#a48cc9" stroke-width="2"/>
<circle cx="90" cy="50" r="1.8" fill="#ffffff" opacity="0.8"/><circle cx="110" cy="54" r="1.8" fill="#ffffff" opacity="0.8"/>
<rect x="32" y="82" width="8" height="9" rx="2" fill="#d17a9c"/><rect x="126" y="82" width="8" height="9" rx="2" fill="#d17a9c"/>
</svg>`,
  bed_lux: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 96">
<ellipse cx="98" cy="91" rx="86" ry="4" fill="#5a4636" opacity="0.1"/>
<rect x="6" y="10" width="28" height="72" rx="8" fill="#8d5a9e" stroke="#6b3f7a" stroke-width="3"/>
<path d="M6 12 L34 12" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>
<circle cx="14" cy="32" r="2" fill="#e8c97a"/><circle cx="24" cy="44" r="2" fill="#e8c97a"/><circle cx="14" cy="56" r="2" fill="#e8c97a"/><circle cx="24" cy="66" r="2" fill="#e8c97a"/>
<rect x="30" y="60" width="156" height="22" rx="6" fill="#9d6aae" stroke="#6b3f7a" stroke-width="3"/>
<rect x="34" y="74" width="148" height="7" rx="3.5" fill="#7c4d8c"/>
<rect x="34" y="44" width="148" height="20" rx="8" fill="#f5e6f5" stroke="#d9b8dd" stroke-width="2.5"/>
<rect x="38" y="32" width="26" height="15" rx="7" fill="#ffffff" stroke="#d9b8dd" stroke-width="2"/>
<rect x="66" y="32" width="26" height="15" rx="7" fill="#ffffff" stroke="#d9b8dd" stroke-width="2"/>
<path d="M44 39 Q51 42 58 39 M72 39 Q79 42 86 39" fill="none" stroke="#e8d5ea" stroke-width="2"/>
<path d="M98 40 L180 40 Q184 40 184 46 L184 60 Q156 67 128 63 Q108 60 98 61 Z" fill="#e8c97a" stroke="#c4a04e" stroke-width="2.5"/>
<path d="M114 42 Q112 52 114 60 M138 42 Q136 53 138 62 M162 42 Q160 51 162 60" fill="none" stroke="#c4a04e" stroke-width="2"/>
<path d="M98 52 L184 52" stroke="#d9b45c" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="36" y="82" width="8" height="9" rx="2" fill="#6b3f7a"/><rect x="176" y="82" width="8" height="9" rx="2" fill="#6b3f7a"/>
</svg>`,
  desk: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48">
<ellipse cx="48" cy="46" rx="42" ry="2.5" fill="#5a4636" opacity="0.1"/>
<rect x="4" y="14" width="88" height="7" rx="3" fill="#d9a066" stroke="#b07d45" stroke-width="2.5"/>
<path d="M7 16 L89 16" stroke="#e8bc8c" stroke-width="2"/>
<rect x="8" y="21" width="6" height="23" rx="2" fill="#b07d45"/><rect x="82" y="21" width="6" height="23" rx="2" fill="#b07d45"/>
<rect x="12" y="33" width="72" height="4" rx="2" fill="#c48a52"/>
<path d="M18 4 L38 4 L38 14 L18 14 Z" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2"/>
<rect x="20" y="6" width="16" height="7" rx="1" fill="#bfe0ff"/>
<rect x="16" y="13" width="24" height="2.5" rx="1.2" fill="#3f6ba3"/>
<rect x="46" y="8" width="14" height="6" rx="1.5" fill="#f2cc5b" stroke="#d1a830" stroke-width="1.5"/>
<rect x="48" y="4.5" width="10" height="4" rx="1.2" fill="#e56b6f" stroke="#c14b50" stroke-width="1.2"/>
<rect x="66" y="7" width="9" height="8" rx="2" fill="#e56b6f" stroke="#c14b50" stroke-width="1.5"/>
<path d="M75 8.5 Q79 10 75 13" fill="none" stroke="#c14b50" stroke-width="1.5"/>
</svg>`,
  shelf: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<ellipse cx="48" cy="93" rx="42" ry="2.5" fill="#5a4636" opacity="0.1"/>
<rect x="6" y="4" width="84" height="88" rx="8" fill="#b58a5f" stroke="#8a6544" stroke-width="3"/>
<rect x="8" y="6" width="5" height="84" rx="2.5" fill="#c49a6c"/>
<rect x="13" y="10" width="70" height="76" rx="4" fill="#9c744c"/>
<rect x="13" y="34" width="70" height="4" fill="#8a6544"/><rect x="13" y="60" width="70" height="4" fill="#8a6544"/>
<rect x="17" y="15" width="7" height="19" rx="1.5" fill="#5c8dca" stroke="#3f6ba3" stroke-width="1.5"/>
<rect x="26" y="17" width="7" height="17" rx="1.5" fill="#e07a5f" stroke="#bd5940" stroke-width="1.5"/>
<rect x="35" y="16" width="7" height="18" rx="1.5" fill="#6fbf73" stroke="#4d9451" stroke-width="1.5"/>
<path d="M46 34 L53 34 L58 17 L51 17 Z" fill="#8d5a9e" stroke="#6b3f7a" stroke-width="1.5"/>
<rect x="17" y="42" width="8" height="18" rx="1.5" fill="#f2cc5b" stroke="#d1a830" stroke-width="1.5"/>
<rect x="27" y="44" width="8" height="16" rx="1.5" fill="#8d5a9e" stroke="#6b3f7a" stroke-width="1.5"/>
<circle cx="66" cy="54" r="7" fill="#6fbf73" stroke="#4d9451" stroke-width="1.5"/>
<path d="M66 60 L66 64" stroke="#b07d45" stroke-width="3"/>
<rect x="18" y="68" width="26" height="16" rx="3" fill="#8fb0e0" stroke="#6989bd" stroke-width="2"/>
<rect x="26" y="71" width="10" height="3" rx="1.5" fill="#6989bd"/>
<rect x="50" y="68" width="26" height="16" rx="3" fill="#f2a2bd" stroke="#d17a9c" stroke-width="2"/>
<rect x="58" y="71" width="10" height="3" rx="1.5" fill="#d17a9c"/>
</svg>`,
  lamp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#5a4636" opacity="0.1"/>
<ellipse cx="24" cy="27" rx="15" ry="11" fill="#ffe9a8" opacity="0.3"/>
<path d="M12 21 Q24 5 36 21 L30 28 Q24 18 18 28 Z" fill="#f2cc5b" stroke="#d1a830" stroke-width="2"/>
<path d="M15 19 Q24 9 30 16" fill="none" stroke="#f8e09a" stroke-width="2.5" stroke-linecap="round"/>
<rect x="22" y="27" width="4" height="14" rx="2" fill="#6f7a87"/>
<ellipse cx="24" cy="42" rx="12" ry="4.5" fill="#6f7a87" stroke="#5b6672" stroke-width="2"/>
<ellipse cx="24" cy="40.5" rx="8" ry="2.5" fill="#8a95a2"/>
</svg>`,
  sofa: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 48">
<ellipse cx="72" cy="46" rx="64" ry="2.5" fill="#5a4636" opacity="0.1"/>
<rect x="14" y="5" width="116" height="24" rx="11" fill="#6fbf73" stroke="#4d9451" stroke-width="3"/>
<path d="M24 9 Q72 3 120 9" fill="none" stroke="#8fd194" stroke-width="3" stroke-linecap="round"/>
<rect x="2" y="14" width="21" height="29" rx="9" fill="#5da762" stroke="#4d9451" stroke-width="2.5"/>
<rect x="121" y="14" width="21" height="29" rx="9" fill="#5da762" stroke="#4d9451" stroke-width="2.5"/>
<path d="M7 20 Q6 30 8 38 M137 20 Q138 30 136 38" fill="none" stroke="#7cc482" stroke-width="2"/>
<rect x="26" y="21" width="45" height="19" rx="8" fill="#8fd194" stroke="#4d9451" stroke-width="2"/>
<rect x="73" y="21" width="45" height="19" rx="8" fill="#8fd194" stroke="#4d9451" stroke-width="2"/>
<path d="M32 25 Q48 22 65 25 M79 25 Q95 22 112 25" fill="none" stroke="#aae0ae" stroke-width="2.5" stroke-linecap="round"/>
<rect x="16" y="43" width="7" height="4" rx="2" fill="#b58a5f"/><rect x="121" y="43" width="7" height="4" rx="2" fill="#b58a5f"/>
</svg>`,
  tv: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<ellipse cx="48" cy="92" rx="34" ry="3" fill="#5a4636" opacity="0.1"/>
<rect x="26" y="62" width="44" height="26" rx="5" fill="#b58a5f" stroke="#8a6544" stroke-width="3"/>
<path d="M48 64 L48 86" stroke="#8a6544" stroke-width="2.5"/>
<circle cx="42" cy="75" r="2.5" fill="#8a6544"/><circle cx="54" cy="75" r="2.5" fill="#8a6544"/>
<rect x="28" y="64" width="40" height="3" rx="1.5" fill="#c49a6c"/>
<rect x="42" y="56" width="12" height="6" fill="#262130"/>
<rect x="8" y="6" width="80" height="52" rx="8" fill="#3a3340" stroke="#262130" stroke-width="3"/>
<rect x="14" y="12" width="68" height="40" rx="4" fill="#8be9fd"/>
<path d="M22 12 L42 12 L28 52 L18 52 Z" fill="#ffffff" opacity="0.25"/>
<path d="M50 12 L58 12 L44 52 L36 52 Z" fill="#ffffff" opacity="0.15"/>
<path d="M40 24 L58 33 L40 42 Z" fill="#ffffff"/>
<circle cx="47" cy="33" r="14" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.8"/>
</svg>`,
  rug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 96">
<ellipse cx="72" cy="48" rx="68" ry="42" fill="#f2cc5b" stroke="#d1a830" stroke-width="3"/>
<ellipse cx="72" cy="48" rx="61" ry="36.5" fill="none" stroke="#d1a830" stroke-width="2" stroke-dasharray="6 5"/>
<ellipse cx="72" cy="48" rx="50" ry="29" fill="#f7dd8f"/>
<ellipse cx="72" cy="48" rx="30" ry="17" fill="#fdf0c4"/>
<path d="M72 38 L82 48 L72 58 L62 48 Z" fill="#e8bd42" stroke="#d1a830" stroke-width="2"/>
<path d="M40 48 Q48 40 56 48 M88 48 Q96 56 104 48" fill="none" stroke="#e8bd42" stroke-width="2.5"/>
</svg>`,
  toybox: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<ellipse cx="24" cy="46" rx="20" ry="2" fill="#5a4636" opacity="0.1"/>
<circle cx="14" cy="15" r="6.5" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2"/>
<path d="M9 13 Q14 17 19 13" fill="none" stroke="#8fb8e8" stroke-width="2"/>
<rect x="26" y="8" width="12" height="12" rx="2" fill="#f2cc5b" stroke="#d1a830" stroke-width="2"/>
<circle cx="32" cy="14" r="2.5" fill="#e56b6f"/>
<rect x="5" y="19" width="38" height="25" rx="6" fill="#e07a5f" stroke="#bd5940" stroke-width="3"/>
<path d="M5 24 Q24 15 43 24" fill="none" stroke="#bd5940" stroke-width="3"/>
<rect x="7" y="36" width="34" height="6" rx="3" fill="#bd5940" opacity="0.5"/>
<path d="M24 33 Q21 30 22.5 28 Q24 26.5 24 28.5 Q24 26.5 25.5 28 Q27 30 24 33 Z" fill="#fde9f2"/>
</svg>`,
  plant: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<ellipse cx="24" cy="45" rx="13" ry="2" fill="#5a4636" opacity="0.1"/>
<path d="M24 27 Q13 19 15 5 Q26 11 24 27 Z" fill="#6fbf73" stroke="#4d9451" stroke-width="2"/>
<path d="M24 27 Q35 19 33 5 Q22 11 24 27 Z" fill="#8fd194" stroke="#4d9451" stroke-width="2"/>
<path d="M24 28 Q20 16 24 4" fill="none" stroke="#4d9451" stroke-width="2"/>
<path d="M24 28 Q24 14 24 8" stroke="#4d9451" stroke-width="2.5" fill="none"/>
<path d="M19 14 Q21 18 22 22 M29 14 Q27 18 26 22" fill="none" stroke="#4d9451" stroke-width="1.5"/>
<path d="M14 28 L34 28 L30 45 L18 45 Z" fill="#d9a066" stroke="#b07d45" stroke-width="2.5"/>
<rect x="12.5" y="26" width="23" height="5" rx="2.5" fill="#b07d45"/>
<path d="M18 34 L17 41 M30 34 L31 41" stroke="#c48a52" stroke-width="2"/>
</svg>`,
  painting: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<rect x="5" y="7" width="38" height="34" rx="4" fill="#c9a227" stroke="#a17f1a" stroke-width="2.5"/>
<rect x="9" y="11" width="30" height="26" rx="2" fill="#a17f1a"/>
<rect x="10.5" y="12.5" width="27" height="23" fill="#dff0ff"/>
<path d="M10.5 30 Q18 20 24 28 Q30 18 37.5 26 L37.5 35.5 L10.5 35.5 Z" fill="#8fd194"/>
<path d="M10.5 32 Q20 26 28 31 Q33 34 37.5 32 L37.5 35.5 L10.5 35.5 Z" fill="#6fbf73" opacity="0.8"/>
<circle cx="30" cy="18" r="4" fill="#ffd166"/>
<circle cx="28.8" cy="16.8" r="1.2" fill="#ffe59a"/>
<path d="M13 15 Q16 13.5 19 15" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.8"/>
</svg>`,
  curtain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 48">
<rect x="2" y="2" width="92" height="5" rx="2.5" fill="#8a6544"/>
<circle cx="3" cy="4.5" r="3" fill="#6f4f30"/><circle cx="93" cy="4.5" r="3" fill="#6f4f30"/>
<rect x="34" y="10" width="28" height="33" fill="#e8f4ff" stroke="#b8d4ee" stroke-width="2"/>
<path d="M48 10 L48 43 M34 26 L62 26" stroke="#b8d4ee" stroke-width="2"/>
<path d="M10 7 Q15 28 8 46 L36 46 Q29 26 33 7 Z" fill="#8fb0e0" stroke="#6989bd" stroke-width="2"/>
<path d="M16 9 Q19 27 14 44 M24 8 Q26 26 22 45" fill="none" stroke="#6989bd" stroke-width="1.8"/>
<path d="M86 7 Q81 28 88 46 L60 46 Q67 26 63 7 Z" fill="#8fb0e0" stroke="#6989bd" stroke-width="2"/>
<path d="M80 9 Q77 27 82 44 M72 8 Q70 26 74 45" fill="none" stroke="#6989bd" stroke-width="1.8"/>
<path d="M12 30 Q20 34 30 31 M84 30 Q76 34 66 31" fill="none" stroke="#a9c4e8" stroke-width="2.5"/>
</svg>`,
  floorlamp: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<ellipse cx="24" cy="45" rx="12" ry="2" fill="#5a4636" opacity="0.1"/>
<ellipse cx="24" cy="13" rx="14" ry="10" fill="#ffd7e6" opacity="0.4"/>
<path d="M12 16 L36 16 L30 3 L18 3 Z" fill="#f2a2bd" stroke="#d17a9c" stroke-width="2"/>
<path d="M16 13 L20 5" stroke="#fad0e0" stroke-width="2.5" stroke-linecap="round"/>
<rect x="22.5" y="16" width="3" height="26" rx="1.5" fill="#6f7a87"/>
<ellipse cx="24" cy="43" rx="10" ry="3.5" fill="#6f7a87" stroke="#5b6672" stroke-width="2"/>
<ellipse cx="24" cy="41.8" rx="6" ry="2" fill="#8a95a2"/>
</svg>`,
  catbed: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<ellipse cx="24" cy="44" rx="20" ry="2.5" fill="#5a4636" opacity="0.1"/>
<ellipse cx="24" cy="28" rx="20" ry="15" fill="#d9a066" stroke="#b07d45" stroke-width="3"/>
<path d="M6 24 Q24 12 42 24" fill="none" stroke="#e8bc8c" stroke-width="2.5"/>
<ellipse cx="24" cy="29" rx="13" ry="9" fill="#f7efe2"/>
<circle cx="23" cy="29" r="6.5" fill="#aab6c4" stroke="#8a97ad" stroke-width="1.5"/>
<path d="M18.5 24.5 L20 20.5 L23 23.5 Z" fill="#aab6c4" stroke="#8a97ad" stroke-width="1.5"/>
<path d="M26 23 L28.5 20 L30 24 Z" fill="#aab6c4" stroke="#8a97ad" stroke-width="1.5"/>
<path d="M29 31 Q34 33 33.5 27.5" fill="none" stroke="#8a97ad" stroke-width="2.5" stroke-linecap="round"/>
<path d="M20.5 28.5 Q21.5 29.5 22.5 28.5 M24.5 28.5 Q25.5 29.5 26.5 28.5" fill="none" stroke="#6f7a87" stroke-width="1.3"/>
<path d="M31 16 Q33 12 31.5 9 M35 17 Q38 14 37.5 10.5" fill="none" stroke="#c9b18c" stroke-width="1.8" stroke-linecap="round"/>
</svg>`,
  piano: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 96">
<ellipse cx="72" cy="93" rx="64" ry="2.5" fill="#5a4636" opacity="0.1"/>
<rect x="6" y="6" width="132" height="58" rx="8" fill="#3a3340" stroke="#262130" stroke-width="3"/>
<rect x="9" y="9" width="126" height="7" rx="3.5" fill="#4a4453"/>
<path d="M30 26 Q50 18 70 26 Q90 34 114 22" fill="none" stroke="#c8b6e2" stroke-width="3"/>
<circle cx="72" cy="26" r="1.8" fill="#c8b6e2"/>
<rect x="14" y="44" width="116" height="15" rx="2" fill="#ffffff" stroke="#262130" stroke-width="2"/>
<path d="M26 44 L26 54 M38 44 L38 54 M50 44 L50 54 M62 44 L62 54 M74 44 L74 54 M86 44 L86 54 M98 44 L98 54 M110 44 L110 54" stroke="#262130" stroke-width="4"/>
<path d="M21 44 L21 52 M33 44 L33 52 M45 44 L45 52 M57 44 L57 52 M69 44 L69 52 M81 44 L81 52 M93 44 L93 52 M105 44 L105 52 M117 44 L117 52" stroke="#262130" stroke-width="3"/>
<rect x="14" y="64" width="24" height="24" rx="2" fill="#3a3340" stroke="#262130" stroke-width="2"/>
<rect x="106" y="64" width="24" height="24" rx="2" fill="#3a3340" stroke="#262130" stroke-width="2"/>
<rect x="17" y="67" width="18" height="4" rx="2" fill="#4a4453"/><rect x="109" y="67" width="18" height="4" rx="2" fill="#4a4453"/>
<rect x="62" y="82" width="20" height="7" rx="2.5" fill="#c9a227" stroke="#a17f1a" stroke-width="1.5"/>
</svg>`,
  wardrobe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
<ellipse cx="48" cy="93" rx="42" ry="2.5" fill="#5a4636" opacity="0.1"/>
<rect x="5" y="2" width="86" height="9" rx="3" fill="#c48a52" stroke="#b07d45" stroke-width="2.5"/>
<rect x="8" y="10" width="80" height="78" rx="6" fill="#d9a066" stroke="#b07d45" stroke-width="3"/>
<path d="M48 12 L48 86" stroke="#b07d45" stroke-width="3"/>
<rect x="14" y="16" width="28" height="32" rx="4" fill="#e0b57f" stroke="#b07d45" stroke-width="2"/>
<rect x="54" y="16" width="28" height="32" rx="4" fill="#e0b57f" stroke="#b07d45" stroke-width="2"/>
<rect x="14" y="54" width="28" height="28" rx="4" fill="#e0b57f" stroke="#b07d45" stroke-width="2"/>
<rect x="54" y="54" width="28" height="28" rx="4" fill="#e0b57f" stroke="#b07d45" stroke-width="2"/>
<circle cx="44" cy="48" r="3" fill="#8a6544"/><circle cx="52" cy="48" r="3" fill="#8a6544"/>
<path d="M20 22 Q22 30 20 40 M70 58 Q68 68 70 78" fill="none" stroke="#c48a52" stroke-width="1.8" opacity="0.7"/>
<rect x="10" y="88" width="9" height="7" rx="2" fill="#b07d45"/><rect x="77" y="88" width="9" height="7" rx="2" fill="#b07d45"/>
</svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
<circle cx="24" cy="24" r="19" fill="#fffdf7" stroke="#d1a830" stroke-width="3"/>
<circle cx="24" cy="24" r="15.5" fill="none" stroke="#efe3c2" stroke-width="1.5"/>
<path d="M24 7.5 L24 11 M40.5 24 L37 24 M24 40.5 L24 37 M7.5 24 L11 24" stroke="#b09648" stroke-width="2.5" stroke-linecap="round"/>
<path d="M35.5 12.5 L33.8 14.2 M35.5 35.5 L33.8 33.8 M12.5 35.5 L14.2 33.8 M12.5 12.5 L14.2 14.2" stroke="#cdb87a" stroke-width="1.8" stroke-linecap="round"/>
<path d="M24 24 L24 13.5 M24 24 L31.5 28" stroke="#5a4636" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="24" cy="24" r="2.2" fill="#e56b6f"/>
<path d="M13 14 Q16 9 22 7.5" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
</svg>`,
};

// 家具缩略图（商店里统一 64px 宽）
export function furnitureThumb(itemId, w = 64) {
  const art = FURNITURE_ART[itemId];
  if (!art) return '';
  const vb = art.match(/viewBox="0 0 (\d+) (\d+)"/);
  const h = vb ? Math.round((+vb[2] / +vb[1]) * w) : w;
  return art.replace('<svg ', `<svg width="${w}" height="${h}" `);
}
