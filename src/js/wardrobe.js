// 商店装扮素材：50 件，9 部位（hat/glasses/top/bottom/shoes/held/back/earring）
// 画布坐标系与角色一致：viewBox 200×300
// 素体锚点（严格按参考图 1:1，不可改动素体本身）：
//   头圆 cx100 cy90 r48（头顶 y42、下巴 y138）；眼 x80/x120 y97；耳 (53,92)/(147,92)
//   颈 y132-150；躯干 y146-214（肩 x84-116）；肚脐 (100,194)
//   斜下垂手臂：左肩 (87,150)→左手 (46,193)；右肩 (113,150)→右手 (154,193)
//   腿：左中心 x≈90、右 x≈110，腿根 y≈210，腿尾 y≈292，无脚

const LINE = '#5a4636'; // 统一轮廓色

// ---------- 帽子（盖在头顶 y42 附近） ----------
const HATS = {
  hat_crown: `
<g><path d="M76 60 L80 38 L92 52 L100 32 L108 52 L120 38 L124 60 Q100 68 76 60 Z" fill="#f7c948" stroke="#d9a520" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="80" cy="38" r="3" fill="#ff8fab"/><circle cx="100" cy="32" r="3" fill="#7ec8ff"/><circle cx="120" cy="38" r="3" fill="#ff8fab"/>
<path d="M78 58 Q100 66 122 58" fill="none" stroke="#ffe27a" stroke-width="2"/></g>`,
  hat_beanie: `
<g><path d="M54 80 Q50 32 100 30 Q150 32 146 80 Q100 90 54 80 Z" fill="#e56b6f" stroke="#c14b50" stroke-width="2.5"/>
<path d="M54 76 Q100 88 146 76 L146 86 Q100 98 54 86 Z" fill="#f28b8e" stroke="#c14b50" stroke-width="2"/>
<path d="M66 46 Q72 60 68 76 M100 36 Q102 56 100 84 M134 46 Q128 60 132 76" fill="none" stroke="#c14b50" stroke-width="1.6" opacity="0.5"/>
<circle cx="100" cy="28" r="8" fill="#fff3e6" stroke="#d9c3a8" stroke-width="2"/></g>`,
  hat_cap: `
<g><path d="M56 74 Q54 34 100 32 Q146 34 144 74 Q100 84 56 74 Z" fill="#4a90d9" stroke="#2f6bb0" stroke-width="2.5"/>
<path d="M96 74 Q130 80 158 72 Q162 78 156 82 Q124 92 94 84 Z" fill="#2f6bb0" stroke="#24548c" stroke-width="2"/>
<path d="M100 32 L100 76" stroke="#2f6bb0" stroke-width="2"/>
<circle cx="100" cy="32" r="3" fill="#24548c"/></g>`,
  hat_straw: `
<g><ellipse cx="100" cy="70" rx="62" ry="16" fill="#e8c97a" stroke="#c4a04e" stroke-width="2.5"/>
<path d="M66 68 Q64 36 100 34 Q136 36 134 68 Q100 78 66 68 Z" fill="#f0d68f" stroke="#c4a04e" stroke-width="2.5"/>
<path d="M66 60 Q100 70 134 60" fill="none" stroke="#e56b6f" stroke-width="6"/>
<path d="M46 70 Q60 78 76 80 M154 70 Q140 78 124 80" fill="none" stroke="#c4a04e" stroke-width="1.5" opacity="0.6"/></g>`,
  hat_wizard: `
<g><ellipse cx="100" cy="68" rx="52" ry="13" fill="#7d5bb5" stroke="#5e3f96" stroke-width="2.5"/>
<path d="M70 66 Q88 18 104 6 Q112 28 130 66 Q100 76 70 66 Z" fill="#8f6cc9" stroke="#5e3f96" stroke-width="2.5"/>
<circle cx="102" cy="34" r="4" fill="#ffe27a"/><circle cx="92" cy="50" r="3" fill="#ffe27a"/><circle cx="110" cy="52" r="2.5" fill="#ffe27a"/></g>`,
  hat_ribbon: `
<g><path d="M56 64 Q100 48 144 64" fill="none" stroke="#f26d9c" stroke-width="7" stroke-linecap="round"/>
<path d="M126 56 Q146 42 150 60 Q152 74 132 68 Q140 82 124 78 Q118 64 126 56 Z" fill="#f26d9c" stroke="#d14b7c" stroke-width="2"/>
<circle cx="128" cy="64" r="5" fill="#ffd1e0"/></g>`,
};

// ---------- 眼镜（眼睛在 x80 / x120，y97） ----------
const GLASSES = {
  gl_round: `
<g fill="none" stroke="#6b5b4a" stroke-width="3">
<circle cx="80" cy="97" r="14"/><circle cx="120" cy="97" r="14"/><path d="M94 97 L106 97"/>
<path d="M66 97 L54 93 M134 97 L146 93" stroke-width="2.5"/></g>`,
  gl_star: `
<g><path d="M80 84 L84 94 L95 94 L86 101 L89 112 L80 105 L71 112 L74 101 L65 94 L76 94 Z" fill="#ffb703" stroke="#e09a00" stroke-width="2"/>
<path d="M120 84 L124 94 L135 94 L126 101 L129 112 L120 105 L111 112 L114 101 L105 94 L116 94 Z" fill="#ffb703" stroke="#e09a00" stroke-width="2"/>
<path d="M95 97 L105 97" stroke="#e09a00" stroke-width="3"/></g>`,
  gl_heart: `
<g><path d="M80 107 Q66 97 68 89 Q70 82 78 85 Q80 87 80 90 Q80 87 82 85 Q90 82 92 89 Q94 97 80 107 Z" fill="#ff6b8d" stroke="#d94b70" stroke-width="2" transform="scale(1.15) translate(-10.4 -13.7)"/>
<path d="M120 107 Q106 97 108 89 Q110 82 118 85 Q120 87 120 90 Q120 87 122 85 Q130 82 132 89 Q134 97 120 107 Z" fill="#ff6b8d" stroke="#d94b70" stroke-width="2" transform="scale(1.15) translate(-15.6 -13.7)"/>
<path d="M94 96 L106 96" stroke="#d94b70" stroke-width="3"/></g>`,
  gl_mono: `
<g><circle cx="120" cy="97" r="14" fill="rgba(255,255,255,0.35)" stroke="#c9a227" stroke-width="3"/>
<path d="M131 108 Q140 127 136 147" fill="none" stroke="#c9a227" stroke-width="2"/></g>`,
  gl_vr: `
<g><rect x="58" y="84" width="84" height="28" rx="13" fill="#4a4e69" stroke="#2f3247" stroke-width="2.5"/>
<rect x="66" y="90" width="30" height="16" rx="7" fill="#8be9fd"/><rect x="104" y="90" width="30" height="16" rx="7" fill="#8be9fd"/>
<path d="M70 94 L88 94 M108 94 L126 94" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/></g>`,
  gl_patch: `
<g><path d="M54 84 Q100 76 146 84" fill="none" stroke="#3a3340" stroke-width="3.5"/>
<ellipse cx="80" cy="97" rx="13" ry="12" fill="#3a3340"/>
<path d="M74 93 Q80 89 86 93" fill="none" stroke="#555" stroke-width="1.5" opacity="0.6"/></g>`,
};

// ---------- 上衣（斜下垂长袖 + 收窄躯干衣身，贴合新素体） ----------
const SLEEVE_L = (fill, stroke) => `<path d="M89 148 Q82 150 76 156 L52 179 Q46 185 50 190 Q54 194 59 190 L86 164 Q92 158 91 151 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>`;
const SLEEVE_R = (fill, stroke) => `<path d="M111 148 Q118 150 124 156 L148 179 Q154 185 150 190 Q146 194 141 190 L114 164 Q108 158 109 151 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>`;
const TOP_BODY = (fill, stroke, shade) => `
${SLEEVE_L(fill, stroke)}
${SLEEVE_R(fill, stroke)}
<path d="M91 145 Q83 149 83 160 L83 190 Q83 207 92 213 Q100 218 108 213 Q117 207 117 190 L117 160 Q117 149 109 145 Q100 151 91 145 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M86 204 Q100 212 114 204" fill="none" stroke="${shade}" stroke-width="2" opacity="0.5"/>
<path d="M90 148 Q88 155 90 162 M110 148 Q112 155 110 162" fill="none" stroke="${shade}" stroke-width="1.5" opacity="0.4"/>
<path d="M53 181 L59 187 M147 181 L141 187" stroke="${shade}" stroke-width="1.6" opacity="0.5"/>`;

const TOPS = {
  top_starter: `${TOP_BODY('#ffffff', '#c9bfae', '#a89d88')}
<path d="M92 143 Q100 151 108 143" fill="none" stroke="#c9bfae" stroke-width="2.5"/>
<circle cx="100" cy="164" r="2.5" fill="#c9bfae"/><circle cx="100" cy="180" r="2.5" fill="#c9bfae"/>`,
  top_sailor: `${TOP_BODY('#4a6fa5', '#33517e', '#2a4266')}
<path d="M88 144 Q81 151 78 157 L93 163 Q97 155 100 151 Q94 149 88 144 Z" fill="#ffffff" stroke="#33517e" stroke-width="2"/>
<path d="M112 144 Q119 151 122 157 L107 163 Q103 155 100 151 Q106 149 112 144 Z" fill="#ffffff" stroke="#33517e" stroke-width="2"/>
<path d="M80 154 Q86 158 90 161 M120 154 Q114 158 110 161" fill="none" stroke="#33517e" stroke-width="1.5"/>
<circle cx="100" cy="162" r="3" fill="#e56b6f"/>`,
  top_hoodie: `${TOP_BODY('#f2b04c', '#cf8f2a', '#c08020')}
<path d="M82 142 Q78 130 88 128 Q100 124 112 128 Q122 130 118 142 Q100 151 82 142 Z" fill="#f7c26e" stroke="#cf8f2a" stroke-width="2"/>
<path d="M93 150 L93 157 M107 150 L107 157" stroke="#8a5f1a" stroke-width="2.5" stroke-linecap="round"/>
<path d="M87 180 L113 180 L113 202 L87 202 Z" fill="#e8a53d" stroke="#cf8f2a" stroke-width="2"/>
<path d="M87 180 L113 180" stroke="#cf8f2a" stroke-width="2"/>`,
  top_sweater: `${TOP_BODY('#b56576', '#8d4557', '#8d4557')}
<path d="M85 206 Q100 215 115 206" fill="none" stroke="#8d4557" stroke-width="3"/>
<path d="M88 208 L88 214 M96 210 L96 216 M104 210 L104 216 M112 208 L112 214" stroke="#8d4557" stroke-width="2"/>
<path d="M92 143 Q100 150 108 143" fill="none" stroke="#8d4557" stroke-width="3"/>
<path d="M53 181 L59 187 M147 181 L141 187" stroke="#8d4557" stroke-width="2"/>`,
  top_dress: `
${SLEEVE_L('#f4a7c3', '#d17a9c')}
${SLEEVE_R('#f4a7c3', '#d17a9c')}
<path d="M84 144 Q70 180 62 226 Q80 236 100 236 Q120 236 138 226 Q130 180 116 144 Q100 153 84 144 Z" fill="#f4a7c3" stroke="#d17a9c" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M62 226 Q80 236 100 236 Q120 236 138 226" fill="none" stroke="#fde9f2" stroke-width="4" stroke-linecap="round"/>
<path d="M88 145 Q94 151 100 151 Q106 151 112 145" fill="none" stroke="#fde9f2" stroke-width="4" stroke-linecap="round"/>
<path d="M84 178 Q100 188 116 178" fill="none" stroke="#d17a9c" stroke-width="2" opacity="0.55"/>
<circle cx="100" cy="162" r="3" fill="#fde9f2"/>`,
  top_suit: `${TOP_BODY('#3d405b', '#26283d', '#1d1f30')}
<path d="M89 144 L100 163 L96 144 Z" fill="#ffffff" stroke="#26283d" stroke-width="1.5"/>
<path d="M111 144 L100 163 L104 144 Z" fill="#ffffff" stroke="#26283d" stroke-width="1.5"/>
<path d="M100 163 L100 212" stroke="#26283d" stroke-width="2"/>
<path d="M96 153 L100 159 L104 153 L100 175 Z" fill="#e56b6f"/>`,
  top_sport: `${TOP_BODY('#6fbf73', '#4d9451', '#3f7a43')}
<path d="M90 145 L90 153 M110 145 L110 153" stroke="#4d9451" stroke-width="3"/>
<path d="M100 153 L100 212" stroke="#ffffff" stroke-width="5"/>
<path d="M84 168 Q100 178 116 168" fill="none" stroke="#ffffff" stroke-width="3"/>
<path d="M56 178 L62 184 M144 178 L138 184" stroke="#ffffff" stroke-width="2.5"/>`,
  top_overalls: `${TOP_BODY('#fff7e8', '#d9c8a5', '#c4b28a')}
<path d="M87 150 L93 148 L95 170 L89 172 Z" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2"/>
<path d="M113 150 L107 148 L105 170 L111 172 Z" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2"/>
<path d="M84 170 L116 170 L118 210 L82 210 Z" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2.5"/>
<circle cx="90" cy="174" r="2.5" fill="#ffd166"/><circle cx="110" cy="174" r="2.5" fill="#ffd166"/>`,
  top_uniform: `${TOP_BODY('#2e2b33', '#1d1b22', '#141217')}
<path d="M90 144 Q100 151 110 144" fill="none" stroke="#f2f2f2" stroke-width="3"/>
<circle cx="100" cy="164" r="2.4" fill="#f7c948"/><circle cx="100" cy="178" r="2.4" fill="#f7c948"/><circle cx="100" cy="192" r="2.4" fill="#f7c948"/>`,
  top_slayer: `${TOP_BODY('#2e2b33', '#1d1b22', '#141217')}
<path d="M90 144 Q100 151 110 144" fill="none" stroke="#f2f2f2" stroke-width="3"/>
<circle cx="100" cy="164" r="2.4" fill="#f7c948"/><circle cx="100" cy="178" r="2.4" fill="#f7c948"/>
<path d="M82 142 Q68 152 64 170 Q60 190 63 210 Q64 217 74 216 L86 214 Q82 184 85 158 Z" fill="#8fc99a" stroke="#5f9a6d" stroke-width="2"/>
<path d="M118 142 Q132 152 136 170 Q140 190 137 210 Q136 217 126 216 L114 214 Q118 184 115 158 Z" fill="#8fc99a" stroke="#5f9a6d" stroke-width="2"/>
<path d="M63 208 Q72 214 82 213 M137 208 Q128 214 118 213" fill="none" stroke="#5f9a6d" stroke-width="2.5"/>
<circle cx="70" cy="206" r="1.6" fill="#f5ead6"/><circle cx="130" cy="206" r="1.6" fill="#f5ead6"/>`,
};

// ---------- 下装（长腿管 + 髋围带，贴合新素体腿锚点） ----------
const LEGS_PANTS = (fill, stroke) => `
<path d="M86 206 Q81 240 82.5 284 Q82.5 291 90 291 Q97.5 291 97.5 284 Q97.5 240 99 210 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M114 206 Q119 240 117.5 284 Q117.5 291 110 291 Q102.5 291 102.5 284 Q102.5 240 101 210 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M84 202 Q100 214 116 202 Q119 210 116 216 Q100 227 84 216 Q81 210 84 202 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;

const BOTTOMS = {
  bottom_starter: `${LEGS_PANTS('#8d99ae', '#6b7689')}
<path d="M85 208 Q100 219 115 208" fill="none" stroke="#6b7689" stroke-width="2" opacity="0.6"/>`,
  bottom_jeans: `${LEGS_PANTS('#5c8dca', '#3f6ba3')}
<path d="M85 207 Q100 218 115 207" fill="none" stroke="#3f6ba3" stroke-width="2" stroke-dasharray="3 3"/>
<path d="M88 224 Q89 250 88 276 M112 224 Q111 250 112 276" fill="none" stroke="#3f6ba3" stroke-width="1.6" opacity="0.7"/>`,
  bottom_skirt: `
<path d="M84 196 L116 196 L128 232 Q100 244 72 232 Z" fill="#f2cc5b" stroke="#d1a830" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M90 198 L84 232 M100 198 L100 238 M110 198 L116 232" stroke="#d1a830" stroke-width="2"/>
<path d="M84 196 L116 196 L115 204 L85 204 Z" fill="#e8bd42"/>`,
  bottom_shorts: `
<path d="M84 202 Q100 214 116 202 Q119 210 116 224 L104 224 L100 212 L96 224 L84 224 Q81 210 84 202 Z" fill="#e07a5f" stroke="#bd5940" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M84 223 L96 223 M104 223 L116 223" stroke="#ffffff" stroke-width="3"/>`,
  bottom_pink: `${LEGS_PANTS('#f2a2bd', '#d17a9c')}
<circle cx="90" cy="214" r="2" fill="#ffffff"/><circle cx="110" cy="214" r="2" fill="#ffffff"/>`,
  bottom_overalls: `${LEGS_PANTS('#5c8dca', '#3f6ba3')}
<path d="M84 202 Q100 214 116 202 Q117 208 116 212 L84 212 Q83 208 84 202 Z" fill="#4a7ab5"/>`,
  bottom_tutu: `
<g opacity="0.94"><path d="M82 194 L118 194 L134 226 Q100 240 66 226 Z" fill="#c8b6e2" stroke="#a48cc9" stroke-width="2"/>
<path d="M78 200 L122 200 L138 232 Q100 246 62 232 Z" fill="#dccff0" stroke="#a48cc9" stroke-width="1.5" opacity="0.8"/>
<path d="M88 196 L82 228 M100 196 L100 234 M112 196 L118 228" stroke="#a48cc9" stroke-width="1.5" opacity="0.7"/></g>`,
  bottom_suit: `
<path d="M84 202 Q100 214 116 202 Q119 211 116 226 L104 226 L100 214 L96 226 L84 226 Q81 211 84 202 Z" fill="#3d405b" stroke="#26283d" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M100 204 L100 212" stroke="#26283d" stroke-width="2"/>`,
  bottom_uniform: `${LEGS_PANTS('#2e2b33', '#1d1b22')}
<path d="M84 201 Q100 213 116 201 Q117 206 116 210 L84 210 Q83 206 84 201 Z" fill="#f2f2f2" stroke="#c9c9c9" stroke-width="1.5"/>
<rect x="94" y="202" width="12" height="6" rx="1.5" fill="#b8c4d9" stroke="#8a97ad" stroke-width="1.5"/>
<path d="M89 226 Q90 250 89 274 M111 226 Q110 250 111 274" fill="none" stroke="#141217" stroke-width="1.8"/>`,
};

// ---------- 鞋子（包住腿尾，腿中心 x90 / x110，腿尾 y≈292） ----------
const SHOE_BODY = (fill, stroke, top) => `
<path d="M82.5 ${top} Q81 284 82.5 288 Q83 293 90 293 Q97 293 97.5 288 Q99 284 97.5 ${top} Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M102.5 ${top} Q101 284 102.5 288 Q103 293 110 293 Q117 293 117.5 288 Q119 284 117.5 ${top} Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;

const SHOES = {
  shoes_starter: `${SHOE_BODY('#ffffff', '#b8ab94', 275)}
<path d="M82 288 Q90 291 98 288 M102 288 Q110 291 118 288" fill="none" stroke="#d9cfbc" stroke-width="2"/>`,
  shoes_red: `${SHOE_BODY('#e5484d', '#b32f34', 275)}
<path d="M83 279 L97 279 M103 279 L117 279" stroke="#ffffff" stroke-width="2"/>`,
  shoes_boot: `${SHOE_BODY('#8a5a3b', '#64402a', 262)}
<path d="M82 266 L98 266 M102 266 L118 266" stroke="#64402a" stroke-width="2.5"/>
<path d="M82 288 Q90 292 98 288 M102 288 Q110 292 118 288" fill="none" stroke="#543622" stroke-width="3"/>`,
  shoes_sport: `${SHOE_BODY('#4a90d9', '#2f6bb0', 274)}
<path d="M81 286 Q90 292 99 288 M101 288 Q110 292 119 286" fill="none" stroke="#ffffff" stroke-width="3.5"/>
<path d="M86 278 L92 280 M108 280 L114 278" stroke="#ffffff" stroke-width="2"/>`,
  shoes_glass: `
<g opacity="0.85">${SHOE_BODY('#a8d8f0', '#6fb3d9', 275)}
<path d="M86 280 L90 285 M106 280 L110 285" stroke="#ffffff" stroke-width="2.5"/></g>`,
  shoes_sandal: `
<g><path d="M82.5 285 Q81.5 290 83 291 Q90 293.5 97 291 Q98.5 290 97.5 285 Q90 288 82.5 285 Z" fill="#d9a066" stroke="#b07d45" stroke-width="2.2"/>
<path d="M102.5 285 Q101.5 290 103 291 Q110 293.5 117 291 Q118.5 290 117.5 285 Q110 288 102.5 285 Z" fill="#d9a066" stroke="#b07d45" stroke-width="2.2"/>
<path d="M84 281 L96 286 M94 280 L84 286 M104 281 L116 286 M114 280 L104 286" stroke="#e56b6f" stroke-width="2.2"/></g>`,
};

// ---------- 手持物（右手 (154,190) 附近） ----------
const HELD = {
  held_balloon: `
<g><path d="M154 190 Q159 170 153 148" fill="none" stroke="#b8ab94" stroke-width="2"/>
<ellipse cx="151" cy="130" rx="17" ry="20" fill="#ff6b8d" stroke="#d94b70" stroke-width="2.5"/>
<ellipse cx="145" cy="124" rx="4" ry="6" fill="#ffb3c6"/>
<path d="M148 149 L154 149 L151 155 Z" fill="#d94b70"/></g>`,
  held_bear: `
<g><circle cx="155" cy="180" r="11" fill="#c68d5f" stroke="#9a6a42" stroke-width="2.5"/>
<circle cx="147" cy="171" r="4.5" fill="#c68d5f" stroke="#9a6a42" stroke-width="2"/>
<circle cx="163" cy="171" r="4.5" fill="#c68d5f" stroke="#9a6a42" stroke-width="2"/>
<circle cx="151" cy="178" r="1.8" fill="#3a2f28"/><circle cx="159" cy="178" r="1.8" fill="#3a2f28"/>
<ellipse cx="155" cy="184" rx="4" ry="3" fill="#e8c9a8"/><circle cx="155" cy="183" r="1.4" fill="#3a2f28"/>
<path d="M149 190 Q155 193 161 190" fill="none" stroke="#9a6a42" stroke-width="2"/></g>`,
  held_book: `
<g><path d="M141 172 L169 168 L171 192 L143 196 Z" fill="#7d5bb5" stroke="#5e3f96" stroke-width="2.5"/>
<path d="M143 174 L168 170 L169 190 L144 194 Z" fill="#f5efe0"/>
<path d="M147 178 L163 175 M147 184 L163 181" stroke="#b8a888" stroke-width="2"/>
<path d="M155 170 L157 164 L161 168 Z" fill="#ffd166"/></g>`,
  held_flower: `
<g><path d="M154 190 L150 168 M154 190 L158 166 M154 190 L154 162" stroke="#6da34d" stroke-width="2.5"/>
<circle cx="150" cy="164" r="6" fill="#ff8fab" stroke="#e56b8f" stroke-width="2"/>
<circle cx="158" cy="162" r="6" fill="#ffd166" stroke="#e0aa3e" stroke-width="2"/>
<circle cx="154" cy="156" r="6" fill="#c8b6e2" stroke="#a48cc9" stroke-width="2"/>
<circle cx="150" cy="164" r="2" fill="#fff"/><circle cx="158" cy="162" r="2" fill="#fff"/><circle cx="154" cy="156" r="2" fill="#fff"/></g>`,
  held_sword: `
<g><path d="M155 184 L147 146" stroke="#b8c4d9" stroke-width="6" stroke-linecap="round"/>
<path d="M155 184 L147 146" stroke="#e8eef7" stroke-width="2.5" stroke-linecap="round"/>
<path d="M142 184 L168 178" stroke="#c9a227" stroke-width="5" stroke-linecap="round"/>
<path d="M157 190 L160 202" stroke="#8a5a3b" stroke-width="5" stroke-linecap="round"/>
<circle cx="160" cy="204" r="3.5" fill="#c9a227"/></g>`,
  held_bag: `
<g><rect x="141" y="172" width="26" height="30" rx="8" fill="#e07a5f" stroke="#bd5940" stroke-width="2.5"/>
<path d="M147 172 Q154 162 161 172" fill="none" stroke="#bd5940" stroke-width="3"/>
<rect x="147" y="184" width="14" height="10" rx="4" fill="#f2cc5b" stroke="#bd5940" stroke-width="2"/></g>`,
  held_katana: `
<g><path d="M153 156 L156 181" stroke="#f2f0e8" stroke-width="7" stroke-linecap="round"/>
<path d="M153 159 L156 178" stroke="#2e2b33" stroke-width="2" stroke-dasharray="4 4"/>
<path d="M152 153 L154 157" stroke="#c9a227" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="155" cy="184" rx="7" ry="3.2" fill="#f7c948" stroke="#d9a520" stroke-width="1.5"/>
<path d="M155 187 L158 216" stroke="#1d1b22" stroke-width="7" stroke-linecap="round"/>
<path d="M157 210 L158 216" stroke="#c9a227" stroke-width="7" stroke-linecap="round"/></g>`,
};

// ---------- 背饰（画在身体后面） ----------
const BACK = {
  back_wings: `
<g><path d="M80 152 Q44 134 40 162 Q38 180 58 180 Q50 192 66 192 Q78 190 82 174 Z" fill="#f0f4ff" stroke="#b9c8e8" stroke-width="2.5"/>
<path d="M120 152 Q156 134 160 162 Q162 180 142 180 Q150 192 134 192 Q122 190 118 174 Z" fill="#f0f4ff" stroke="#b9c8e8" stroke-width="2.5"/>
<path d="M56 152 Q52 162 60 170 M144 152 Q148 162 140 170" fill="none" stroke="#b9c8e8" stroke-width="1.5"/></g>`,
  back_cape: `
<path d="M84 142 Q66 184 72 224 Q100 234 128 224 Q134 184 116 142 Q100 152 84 142 Z" fill="#c0392b" stroke="#96281b" stroke-width="2.5"/>
<path d="M84 146 Q100 156 116 146" fill="none" stroke="#e74c3c" stroke-width="2.5"/>`,
  back_bow: `
<g><path d="M100 140 Q74 122 68 140 Q66 156 96 148 Z" fill="#f26d9c" stroke="#d14b7c" stroke-width="2.5"/>
<path d="M100 140 Q126 122 132 140 Q134 156 104 148 Z" fill="#f26d9c" stroke="#d14b7c" stroke-width="2.5"/>
<circle cx="100" cy="143" r="6" fill="#ffd1e0" stroke="#d14b7c" stroke-width="2"/></g>`,
  back_jet: `
<g><rect x="66" y="150" width="18" height="42" rx="8" fill="#9aa5b1" stroke="#6f7a87" stroke-width="2.5"/>
<rect x="116" y="150" width="18" height="42" rx="8" fill="#9aa5b1" stroke="#6f7a87" stroke-width="2.5"/>
<path d="M70 192 Q75 206 80 192 Z" fill="#ff9f43"/><path d="M120 192 Q125 206 130 192 Z" fill="#ff9f43"/>
<path d="M84 156 L116 156 M84 180 L116 180" stroke="#6f7a87" stroke-width="3"/></g>`,
  back_butterfly: `
<g><path d="M82 152 Q46 120 35 150 Q29 170 52 176 Q42 196 62 197 Q78 197 82 178 Z" fill="#f5ead6" stroke="#3b2f28" stroke-width="3" stroke-linejoin="round"/>
<path d="M118 152 Q154 120 165 150 Q171 170 148 176 Q158 196 138 197 Q122 197 118 178 Z" fill="#f5ead6" stroke="#3b2f28" stroke-width="3" stroke-linejoin="round"/>
<path d="M64 148 Q57 160 63 172 M50 154 Q46 164 53 172" fill="none" stroke="#3b2f28" stroke-width="2"/>
<path d="M136 148 Q143 160 137 172 M150 154 Q154 164 147 172" fill="none" stroke="#3b2f28" stroke-width="2"/>
<circle cx="58" cy="144" r="4" fill="#3b2f28"/><circle cx="142" cy="144" r="4" fill="#3b2f28"/></g>`,
};

// ---------- 耳饰（耳朵在 (53,92) / (147,92)） ----------
const EARRINGS = {
  earring_jade: `
<g><path d="M53 100 L53 106 M147 100 L147 106" stroke="#c9a227" stroke-width="1.5"/>
<rect x="49.5" y="106" width="7" height="12" rx="3.5" fill="#7fc8a2" stroke="#4f9a74" stroke-width="1.5"/>
<rect x="143.5" y="106" width="7" height="12" rx="3.5" fill="#7fc8a2" stroke="#4f9a74" stroke-width="1.5"/>
<path d="M51.5 109 L51.5 115 M145.5 109 L145.5 115" stroke="#d9f5e6" stroke-width="1.5"/></g>`,
};

export const WARDROBE_ART = { ...HATS, ...GLASSES, ...TOPS, ...BOTTOMS, ...SHOES, ...HELD, ...BACK, ...EARRINGS };

// 商店缩略图：把部件放进完整 200×300 画布便于预览（支持小助手自定义装扮）
export function wardrobeThumb(itemId, customArt) {
  const art = WARDROBE_ART[itemId] ?? customArt ?? '';
  if (!art) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" width="72" height="108">${art}</svg>`;
}
