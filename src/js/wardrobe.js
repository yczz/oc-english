// 商店装扮素材：50 件，9 部位（hat/glasses/top/bottom/shoes/held/back/earring）
// 画布坐标系与角色一致：viewBox 200×230
// 素体锚点（严格按参考图，不可改动素体本身）：
//   头圆 cx100 cy90 r48（头顶 y42、下巴 y138）；眼 x80/x120 y96；耳 (53,92)/(147,92)
//   躯干椭圆 cx100 cy168 rx30 ry38（y130~206）+ 肚脐 (100,192)
//   水平手臂：左袖 x34~78、右袖 x122~166（y145~159）；左手 (27,150)、右手 (173,150)
//   腿：左中心 x≈89、右 x≈111，腿根 y≈196，腿尾 y≈229，无脚

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

// ---------- 眼镜（眼睛在 x80 / x120，y96） ----------
const GLASSES = {
  gl_round: `
<g fill="none" stroke="#6b5b4a" stroke-width="3">
<circle cx="80" cy="96" r="14"/><circle cx="120" cy="96" r="14"/><path d="M94 96 L106 96"/>
<path d="M66 96 L54 92 M134 96 L146 92" stroke-width="2.5"/></g>`,
  gl_star: `
<g><path d="M80 83 L84 93 L95 93 L86 100 L89 111 L80 104 L71 111 L74 100 L65 93 L76 93 Z" fill="#ffb703" stroke="#e09a00" stroke-width="2"/>
<path d="M120 83 L124 93 L135 93 L126 100 L129 111 L120 104 L111 111 L114 100 L105 93 L116 93 Z" fill="#ffb703" stroke="#e09a00" stroke-width="2"/>
<path d="M95 96 L105 96" stroke="#e09a00" stroke-width="3"/></g>`,
  gl_heart: `
<g><path d="M80 106 Q66 96 68 88 Q70 81 78 84 Q80 86 80 89 Q80 86 82 84 Q90 81 92 88 Q94 96 80 106 Z" fill="#ff6b8d" stroke="#d94b70" stroke-width="2" transform="scale(1.15) translate(-10.4 -12.4)"/>
<path d="M120 106 Q106 96 108 88 Q110 81 118 84 Q120 86 120 89 Q120 86 122 84 Q130 81 132 88 Q134 96 120 106 Z" fill="#ff6b8d" stroke="#d94b70" stroke-width="2" transform="scale(1.15) translate(-15.6 -12.4)"/>
<path d="M94 95 L106 95" stroke="#d94b70" stroke-width="3"/></g>`,
  gl_mono: `
<g><circle cx="120" cy="96" r="14" fill="rgba(255,255,255,0.35)" stroke="#c9a227" stroke-width="3"/>
<path d="M131 107 Q140 126 136 146" fill="none" stroke="#c9a227" stroke-width="2"/></g>`,
  gl_vr: `
<g><rect x="58" y="83" width="84" height="28" rx="13" fill="#4a4e69" stroke="#2f3247" stroke-width="2.5"/>
<rect x="66" y="89" width="30" height="16" rx="7" fill="#8be9fd"/><rect x="104" y="89" width="30" height="16" rx="7" fill="#8be9fd"/>
<path d="M70 93 L88 93 M108 93 L126 93" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/></g>`,
  gl_patch: `
<g><path d="M54 83 Q100 75 146 83" fill="none" stroke="#3a3340" stroke-width="3.5"/>
<ellipse cx="80" cy="96" rx="13" ry="12" fill="#3a3340"/>
<path d="M74 92 Q80 88 86 92" fill="none" stroke="#555" stroke-width="1.5" opacity="0.6"/></g>`,
};

// ---------- 上衣（水平长袖 + 躯干椭圆衣身，贴合新素体） ----------
const TOP_BODY = (fill, stroke, shade) => `
<path d="M78 144 L34 145.5 Q27.5 150 34 155.5 L78 159 Q85 151 78 144 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M122 144 L166 145.5 Q172.5 150 166 155.5 L122 159 Q115 151 122 144 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>
<ellipse cx="100" cy="172" rx="31" ry="34" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
<path d="M73 190 Q100 200 127 190" fill="none" stroke="${shade}" stroke-width="2" opacity="0.5"/>
<path d="M89 146 Q87 153 89 160 M111 146 Q113 153 111 160" fill="none" stroke="${shade}" stroke-width="1.5" opacity="0.4"/>
<path d="M37 147.5 L46 148 M163 147.5 L154 148" stroke="${shade}" stroke-width="1.6" opacity="0.5"/>`;

const TOPS = {
  top_starter: `${TOP_BODY('#ffffff', '#c9bfae', '#a89d88')}
<path d="M92 142 Q100 150 108 142" fill="none" stroke="#c9bfae" stroke-width="2.5"/>
<circle cx="100" cy="162" r="2.5" fill="#c9bfae"/><circle cx="100" cy="176" r="2.5" fill="#c9bfae"/>`,
  top_sailor: `${TOP_BODY('#4a6fa5', '#33517e', '#2a4266')}
<path d="M86 143 Q79 150 76 156 L92 161 Q96 154 100 150 Q93 148 86 143 Z" fill="#ffffff" stroke="#33517e" stroke-width="2"/>
<path d="M114 143 Q121 150 124 156 L108 161 Q104 154 100 150 Q107 148 114 143 Z" fill="#ffffff" stroke="#33517e" stroke-width="2"/>
<path d="M78 152 Q84 155 88 157 M122 152 Q116 155 112 157" fill="none" stroke="#33517e" stroke-width="1.5"/>
<circle cx="100" cy="160" r="3" fill="#e56b6f"/>`,
  top_hoodie: `${TOP_BODY('#f2b04c', '#cf8f2a', '#c08020')}
<path d="M82 141 Q78 130 88 128 Q100 124 112 128 Q122 130 118 141 Q100 150 82 141 Z" fill="#f7c26e" stroke="#cf8f2a" stroke-width="2"/>
<path d="M93 148 L93 154 M107 148 L107 154" stroke="#8a5f1a" stroke-width="2.5" stroke-linecap="round"/>
<path d="M87 176 L113 176 L113 196 L87 196 Z" fill="#e8a53d" stroke="#cf8f2a" stroke-width="2" rx="4"/>
<path d="M87 176 L113 176" stroke="#cf8f2a" stroke-width="2"/>`,
  top_sweater: `${TOP_BODY('#b56576', '#8d4557', '#8d4557')}
<path d="M72 196 Q100 206 128 196" fill="none" stroke="#8d4557" stroke-width="3"/>
<path d="M76 198 L76 204 M86 200 L86 206 M96 202 L96 207 M106 202 L106 207 M116 200 L116 206 M124 198 L124 204" stroke="#8d4557" stroke-width="2"/>
<path d="M92 142 Q100 149 108 142" fill="none" stroke="#8d4557" stroke-width="3"/>
<path d="M34 149 L40 149.5 M160 149 L166 149.5" stroke="#8d4557" stroke-width="2"/>`,
  top_dress: `
<path d="M82 142 Q64 172 54 202 Q77 212 100 212 Q123 212 146 202 Q136 172 118 142 Q100 152 82 142 Z" fill="#f4a7c3" stroke="#d17a9c" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M54 202 Q77 212 100 212 Q123 212 146 202" fill="none" stroke="#fde9f2" stroke-width="4" stroke-linecap="round"/>
<path d="M86 144 Q93 150 100 150 Q107 150 114 144" fill="none" stroke="#fde9f2" stroke-width="4" stroke-linecap="round"/>
<path d="M78 144 L34 145.5 Q27.5 150 34 155.5 L78 159 Q85 151 78 144 Z" fill="#f4a7c3" stroke="#d17a9c" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M122 144 L166 145.5 Q172.5 150 166 155.5 L122 159 Q115 151 122 144 Z" fill="#f4a7c3" stroke="#d17a9c" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M72 176 Q100 186 128 176" fill="none" stroke="#d17a9c" stroke-width="2" opacity="0.55"/>
<circle cx="100" cy="160" r="3" fill="#fde9f2"/>`,
  top_suit: `${TOP_BODY('#3d405b', '#26283d', '#1d1f30')}
<path d="M88 143 L100 161 L96 143 Z" fill="#ffffff" stroke="#26283d" stroke-width="1.5"/>
<path d="M112 143 L100 161 L104 143 Z" fill="#ffffff" stroke="#26283d" stroke-width="1.5"/>
<path d="M100 161 L100 204" stroke="#26283d" stroke-width="2"/>
<path d="M96 152 L100 158 L104 152 L100 172 Z" fill="#e56b6f"/>`,
  top_sport: `${TOP_BODY('#6fbf73', '#4d9451', '#3f7a43')}
<path d="M90 144 L90 152 M110 144 L110 152" stroke="#4d9451" stroke-width="3"/>
<path d="M100 152 L100 204" stroke="#ffffff" stroke-width="5"/>
<path d="M72 164 Q100 174 128 164" fill="none" stroke="#ffffff" stroke-width="3"/>
<path d="M36 150 L46 150.5 M164 150 L154 150.5" stroke="#ffffff" stroke-width="2.5"/>`,
  top_overalls: `${TOP_BODY('#fff7e8', '#d9c8a5', '#c4b28a')}
<path d="M85 150 L91 148 L93 168 L87 170 Z" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2"/>
<path d="M115 150 L109 148 L107 168 L113 170 Z" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2"/>
<path d="M80 168 L120 168 L122 205 L78 205 Z" fill="#5c8dca" stroke="#3f6ba3" stroke-width="2.5"/>
<circle cx="88" cy="172" r="2.5" fill="#ffd166"/><circle cx="112" cy="172" r="2.5" fill="#ffd166"/>`,
  top_uniform: `${TOP_BODY('#2e2b33', '#1d1b22', '#141217')}
<path d="M90 143 Q100 150 110 143" fill="none" stroke="#f2f2f2" stroke-width="3"/>
<circle cx="100" cy="162" r="2.4" fill="#f7c948"/><circle cx="100" cy="176" r="2.4" fill="#f7c948"/><circle cx="100" cy="190" r="2.4" fill="#f7c948"/>`,
  top_slayer: `${TOP_BODY('#2e2b33', '#1d1b22', '#141217')}
<path d="M90 143 Q100 150 110 143" fill="none" stroke="#f2f2f2" stroke-width="3"/>
<circle cx="100" cy="162" r="2.4" fill="#f7c948"/><circle cx="100" cy="176" r="2.4" fill="#f7c948"/>
<path d="M80 140 Q66 148 62 164 Q58 182 61 200 Q62 207 72 206 L84 204 Q80 178 83 156 Z" fill="#8fc99a" stroke="#5f9a6d" stroke-width="2"/>
<path d="M120 140 Q134 148 138 164 Q142 182 139 200 Q138 207 128 206 L116 204 Q120 178 117 156 Z" fill="#8fc99a" stroke="#5f9a6d" stroke-width="2"/>
<path d="M78 144 L36 145.5 Q29 150 36 155 L78 158.5 Q84 151 78 144 Z" fill="#8fc99a" stroke="#5f9a6d" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M122 144 L164 145.5 Q171 150 164 155 L122 158.5 Q116 151 122 144 Z" fill="#8fc99a" stroke="#5f9a6d" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M61 198 Q70 204 80 203 M139 198 Q130 204 120 203" fill="none" stroke="#5f9a6d" stroke-width="2.5"/>
<circle cx="68" cy="196" r="1.6" fill="#f5ead6"/><circle cx="132" cy="196" r="1.6" fill="#f5ead6"/>`,
};

// ---------- 下装（腿管 + 髋围带，贴合新素体腿锚点） ----------
const LEGS_PANTS = (fill, stroke) => `
<path d="M84 194 Q79 211 81 226 Q81 230 88.5 230 Q96 230 96 226 Q96 211 99.5 196 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M116 194 Q121 211 119 226 Q119 230 111.5 230 Q104 230 104 226 Q104 211 100.5 196 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M73 190 Q100 203 127 190 Q130 198 127 203 Q100 214 73 203 Q70 198 73 190 Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;

const BOTTOMS = {
  bottom_starter: `${LEGS_PANTS('#8d99ae', '#6b7689')}
<path d="M76 196 Q100 207 124 196" fill="none" stroke="#6b7689" stroke-width="2" opacity="0.6"/>`,
  bottom_jeans: `${LEGS_PANTS('#5c8dca', '#3f6ba3')}
<path d="M76 195 Q100 206 124 195" fill="none" stroke="#3f6ba3" stroke-width="2" stroke-dasharray="3 3"/>
<path d="M86 208 Q87 216 86 224 M114 208 Q113 216 114 224" fill="none" stroke="#3f6ba3" stroke-width="1.6" opacity="0.7"/>`,
  bottom_skirt: `
<path d="M72 172 L128 172 L142 202 Q100 214 58 202 Z" fill="#f2cc5b" stroke="#d1a830" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M82 174 L74 202 M100 174 L100 208 M118 174 L126 202" stroke="#d1a830" stroke-width="2"/>
<path d="M72 172 L128 172 L127 180 L73 180 Z" fill="#e8bd42"/>`,
  bottom_shorts: `
<path d="M74 188 Q100 201 126 188 Q129 196 126 206 L104 206 L100 196 L96 206 L74 206 Q71 196 74 188 Z" fill="#e07a5f" stroke="#bd5940" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M74 205 L96 205 M104 205 L126 205" stroke="#ffffff" stroke-width="3"/>`,
  bottom_pink: `${LEGS_PANTS('#f2a2bd', '#d17a9c')}
<circle cx="88" cy="200" r="2" fill="#ffffff"/><circle cx="112" cy="200" r="2" fill="#ffffff"/>`,
  bottom_overalls: `${LEGS_PANTS('#5c8dca', '#3f6ba3')}
<path d="M73 190 Q100 203 127 190 Q128 195 127 199 L73 199 Q72 195 73 190 Z" fill="#4a7ab5"/>`,
  bottom_tutu: `
<g opacity="0.94"><path d="M70 170 L130 170 L148 200 Q100 216 52 200 Z" fill="#c8b6e2" stroke="#a48cc9" stroke-width="2"/>
<path d="M66 177 L134 177 L150 206 Q100 220 50 206 Z" fill="#dccff0" stroke="#a48cc9" stroke-width="1.5" opacity="0.8"/>
<path d="M76 172 L70 202 M92 172 L88 208 M108 172 L112 208 M124 172 L130 202" stroke="#a48cc9" stroke-width="1.5" opacity="0.7"/></g>`,
  bottom_suit: `
<path d="M74 188 Q100 201 126 188 Q129 197 126 208 L104 208 L100 197 L96 208 L74 208 Q71 197 74 188 Z" fill="#3d405b" stroke="#26283d" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M100 190 L100 198" stroke="#26283d" stroke-width="2"/>`,
  bottom_uniform: `${LEGS_PANTS('#2e2b33', '#1d1b22')}
<path d="M73 189 Q100 202 127 189 Q128 194 127 198 L73 198 Q72 194 73 189 Z" fill="#f2f2f2" stroke="#c9c9c9" stroke-width="1.5"/>
<rect x="94" y="190" width="12" height="6" rx="1.5" fill="#b8c4d9" stroke="#8a97ad" stroke-width="1.5"/>
<path d="M87 210 Q88 216 87 222 M113 210 Q112 216 113 222" fill="none" stroke="#141217" stroke-width="1.8"/>`,
};

// ---------- 鞋子（包住腿尾，腿中心 x89 / x111，腿尾 y≈229） ----------
const SHOE_BODY = (fill, stroke, top) => `
<path d="M80.5 ${top} Q78.5 222 80 226.5 Q80.5 231 89 231 Q97.5 231 98 226.5 Q99.5 222 97.5 ${top} Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M102.5 ${top} Q100.5 222 102 226.5 Q102.5 231 111 231 Q119.5 231 120 226.5 Q121.5 222 119.5 ${top} Z" fill="${fill}" stroke="${stroke}" stroke-width="2.4" stroke-linejoin="round"/>`;

const SHOES = {
  shoes_starter: `${SHOE_BODY('#ffffff', '#b8ab94', 213)}
<path d="M80 226 Q89 229 98 226 M102 226 Q111 229 120 226" fill="none" stroke="#d9cfbc" stroke-width="2"/>`,
  shoes_red: `${SHOE_BODY('#e5484d', '#b32f34', 213)}
<path d="M82 217 L96 217 M104 217 L118 217" stroke="#ffffff" stroke-width="2"/>`,
  shoes_boot: `${SHOE_BODY('#8a5a3b', '#64402a', 203)}
<path d="M81 207 L97 207 M103 207 L119 207" stroke="#64402a" stroke-width="2.5"/>
<path d="M80 226 Q89 230 98 226 M102 226 Q111 230 120 226" fill="none" stroke="#543622" stroke-width="3"/>`,
  shoes_sport: `${SHOE_BODY('#4a90d9', '#2f6bb0', 212)}
<path d="M79 224 Q89 230 99 226 M101 226 Q111 230 121 224" fill="none" stroke="#ffffff" stroke-width="3.5"/>
<path d="M84 216 L92 218 M108 218 L116 216" stroke="#ffffff" stroke-width="2"/>`,
  shoes_glass: `
<g opacity="0.85">${SHOE_BODY('#a8d8f0', '#6fb3d9', 213)}
<path d="M84 218 L89 223 M106 218 L111 223" stroke="#ffffff" stroke-width="2.5"/></g>`,
  shoes_sandal: `
<g><path d="M80.5 223 Q79.5 228 81 229 Q89 231.5 97 229 Q98.5 228 97.5 223 Q89 226 80.5 223 Z" fill="#d9a066" stroke="#b07d45" stroke-width="2.2"/>
<path d="M102.5 223 Q101.5 228 103 229 Q111 231.5 119 229 Q120.5 228 119.5 223 Q111 226 102.5 223 Z" fill="#d9a066" stroke="#b07d45" stroke-width="2.2"/>
<path d="M82 219 L96 224 M94 218 L82 224 M104 219 L118 224 M116 218 L104 224" stroke="#e56b6f" stroke-width="2.2"/></g>`,
};

// ---------- 手持物（右手 (173,150) 附近） ----------
const HELD = {
  held_balloon: `
<g><path d="M173 150 Q178 130 172 108" fill="none" stroke="#b8ab94" stroke-width="2"/>
<ellipse cx="170" cy="90" rx="17" ry="20" fill="#ff6b8d" stroke="#d94b70" stroke-width="2.5"/>
<ellipse cx="164" cy="84" rx="4" ry="6" fill="#ffb3c6"/>
<path d="M167 109 L173 109 L170 115 Z" fill="#d94b70"/></g>`,
  held_bear: `
<g><circle cx="174" cy="140" r="11" fill="#c68d5f" stroke="#9a6a42" stroke-width="2.5"/>
<circle cx="166" cy="131" r="4.5" fill="#c68d5f" stroke="#9a6a42" stroke-width="2"/>
<circle cx="182" cy="131" r="4.5" fill="#c68d5f" stroke="#9a6a42" stroke-width="2"/>
<circle cx="170" cy="138" r="1.8" fill="#3a2f28"/><circle cx="178" cy="138" r="1.8" fill="#3a2f28"/>
<ellipse cx="174" cy="144" rx="4" ry="3" fill="#e8c9a8"/><circle cx="174" cy="143" r="1.4" fill="#3a2f28"/>
<path d="M168 150 Q174 153 180 150" fill="none" stroke="#9a6a42" stroke-width="2"/></g>`,
  held_book: `
<g><path d="M160 132 L188 128 L190 152 L162 156 Z" fill="#7d5bb5" stroke="#5e3f96" stroke-width="2.5"/>
<path d="M162 134 L187 130 L188 150 L163 154 Z" fill="#f5efe0"/>
<path d="M166 138 L182 135 M166 144 L182 141" stroke="#b8a888" stroke-width="2"/>
<path d="M174 130 L176 124 L180 128 Z" fill="#ffd166"/></g>`,
  held_flower: `
<g><path d="M173 150 L169 128 M173 150 L177 126 M173 150 L173 122" stroke="#6da34d" stroke-width="2.5"/>
<circle cx="169" cy="124" r="6" fill="#ff8fab" stroke="#e56b8f" stroke-width="2"/>
<circle cx="177" cy="122" r="6" fill="#ffd166" stroke="#e0aa3e" stroke-width="2"/>
<circle cx="173" cy="116" r="6" fill="#c8b6e2" stroke="#a48cc9" stroke-width="2"/>
<circle cx="169" cy="124" r="2" fill="#fff"/><circle cx="177" cy="122" r="2" fill="#fff"/><circle cx="173" cy="116" r="2" fill="#fff"/></g>`,
  held_sword: `
<g><path d="M174 144 L166 106" stroke="#b8c4d9" stroke-width="6" stroke-linecap="round"/>
<path d="M174 144 L166 106" stroke="#e8eef7" stroke-width="2.5" stroke-linecap="round"/>
<path d="M161 144 L187 138" stroke="#c9a227" stroke-width="5" stroke-linecap="round"/>
<path d="M176 150 L179 162" stroke="#8a5a3b" stroke-width="5" stroke-linecap="round"/>
<circle cx="179" cy="164" r="3.5" fill="#c9a227"/></g>`,
  held_bag: `
<g><rect x="160" y="132" width="26" height="30" rx="8" fill="#e07a5f" stroke="#bd5940" stroke-width="2.5"/>
<path d="M166 132 Q173 122 180 132" fill="none" stroke="#bd5940" stroke-width="3"/>
<rect x="166" y="144" width="14" height="10" rx="4" fill="#f2cc5b" stroke="#bd5940" stroke-width="2"/></g>`,
  held_katana: `
<g><path d="M172 116 L175 141" stroke="#f2f0e8" stroke-width="7" stroke-linecap="round"/>
<path d="M172 119 L175 138" stroke="#2e2b33" stroke-width="2" stroke-dasharray="4 4"/>
<path d="M171 113 L173 117" stroke="#c9a227" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="174" cy="144" rx="7" ry="3.2" fill="#f7c948" stroke="#d9a520" stroke-width="1.5"/>
<path d="M174 147 L177 176" stroke="#1d1b22" stroke-width="7" stroke-linecap="round"/>
<path d="M176 170 L177 176" stroke="#c9a227" stroke-width="7" stroke-linecap="round"/></g>`,
};

// ---------- 背饰（画在身体后面） ----------
const BACK = {
  back_wings: `
<g><path d="M68 148 Q32 130 28 158 Q26 176 46 176 Q38 188 54 188 Q66 186 70 170 Z" fill="#f0f4ff" stroke="#b9c8e8" stroke-width="2.5"/>
<path d="M132 148 Q168 130 172 158 Q174 176 154 176 Q162 188 146 188 Q134 186 130 170 Z" fill="#f0f4ff" stroke="#b9c8e8" stroke-width="2.5"/>
<path d="M44 148 Q40 158 48 166 M156 148 Q160 158 152 166" fill="none" stroke="#b9c8e8" stroke-width="1.5"/></g>`,
  back_cape: `
<path d="M78 140 Q60 178 66 212 Q100 222 134 212 Q140 178 122 140 Q100 150 78 140 Z" fill="#c0392b" stroke="#96281b" stroke-width="2.5"/>
<path d="M78 144 Q100 154 122 144" fill="none" stroke="#e74c3c" stroke-width="2.5"/>`,
  back_bow: `
<g><path d="M100 138 Q74 120 68 138 Q66 154 96 146 Z" fill="#f26d9c" stroke="#d14b7c" stroke-width="2.5"/>
<path d="M100 138 Q126 120 132 138 Q134 154 104 146 Z" fill="#f26d9c" stroke="#d14b7c" stroke-width="2.5"/>
<circle cx="100" cy="141" r="6" fill="#ffd1e0" stroke="#d14b7c" stroke-width="2"/></g>`,
  back_jet: `
<g><rect x="62" y="144" width="18" height="42" rx="8" fill="#9aa5b1" stroke="#6f7a87" stroke-width="2.5"/>
<rect x="120" y="144" width="18" height="42" rx="8" fill="#9aa5b1" stroke="#6f7a87" stroke-width="2.5"/>
<path d="M66 186 Q71 200 76 186 Z" fill="#ff9f43"/><path d="M124 186 Q129 200 134 186 Z" fill="#ff9f43"/>
<path d="M80 150 L120 150 M80 174 L120 174" stroke="#6f7a87" stroke-width="3"/></g>`,
  back_butterfly: `
<g><path d="M70 148 Q34 116 23 146 Q17 166 40 172 Q30 192 50 193 Q66 193 70 174 Z" fill="#f5ead6" stroke="#3b2f28" stroke-width="3" stroke-linejoin="round"/>
<path d="M130 148 Q166 116 177 146 Q183 166 160 172 Q170 192 150 193 Q134 193 130 174 Z" fill="#f5ead6" stroke="#3b2f28" stroke-width="3" stroke-linejoin="round"/>
<path d="M52 144 Q45 156 51 168 M38 150 Q34 160 41 168" fill="none" stroke="#3b2f28" stroke-width="2"/>
<path d="M148 144 Q155 156 149 168 M162 150 Q166 160 159 168" fill="none" stroke="#3b2f28" stroke-width="2"/>
<circle cx="46" cy="140" r="4" fill="#3b2f28"/><circle cx="154" cy="140" r="4" fill="#3b2f28"/></g>`,
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

// 商店缩略图：把部件放进完整 200×230 画布便于预览
export function wardrobeThumb(itemId) {
  const art = WARDROBE_ART[itemId];
  if (!art) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 230" width="72" height="83">${art}</svg>`;
}
