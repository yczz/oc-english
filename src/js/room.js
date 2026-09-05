// 房间渲染器：正面平铺视角（墙面 + 地板铺满整个画布，模拟人生式自由走动）
// 依赖全局 PIXI（lib/pixi.min.js UMD）
import { FURNITURE_ART } from './furniture.js';
import { buildCharacterLayers, PIVOTS, VB_W, VB_H } from './character.js';

export const ROOM_W = 12;
export const ROOM_H = 8;

const WALL_RATIO = 0.58;   // 墙面占画布高度比例，其余为地板
const CHAR_H_GRID = 2.75;  // 人物身高（以格宽为单位，随深度缩放）
const WALK_SPEED = 2.6;    // 格/秒
// 手臂自然下垂的静止角（素体手臂原为斜张 45°，收拢到体侧）
const ARM_REST = { armL: -0.52, armR: 0.52 };
const BONE_ORDER = ['back', 'armL', 'armR', 'legL', 'legR', 'core'];
const FLAT_ITEMS = new Set(['rug']); // 贴地物件（正面视角平铺压扁）
const layerSvg = inner => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}">${inner}</svg>`;

function svgTexture(svgStr, w, h) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(PIXI.Texture.from(img));
    img.onerror = () => resolve(null);
    // 2x 超采样保证 Retina 清晰
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      svgStr.replace('<svg ', `<svg width="${Math.round(w * 2)}" height="${Math.round(h * 2)}" `)
    );
  });
}

export class Room {
  // callbacks: onPlace(itemId,x,y)→Promise<bool>, onRemove(itemId)
  constructor(canvas, catalog, callbacks = {}) {
    this.canvas = canvas;
    this.catalog = catalog; // 家具目录 [{id,price,w,h}]
    this.cb = callbacks;
    this.editable = false;
    this.sprites = new Map(); // itemId → sprite
    this.placed = [];
    this.app = null;
    this.hover = null; // 拖拽目标格 {gx,gy,w,h}
    // 人物行走状态（网格坐标：x 横向 0..ROOM_W，y 深度 0..ROOM_H）
    this.charPos = { x: ROOM_W / 2, y: ROOM_H * 0.62 };
    this.charTarget = null;
    this.walkPhase = 0;
    this.charFace = 1;      // 朝向（1 右 / -1 左）
    this.idleDelay = 1.6;   // 站多久后开始自己溜达（模拟人生式自主走动）
    this.charK = 1;         // 人物当前深度缩放
    this._lastCharZ = null;
  }

  async init() {
    this.app = new PIXI.Application({
      view: this.canvas,
      width: 1,
      height: 1,
      background: '#f6e9d1',
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    this.bgLayer = new PIXI.Graphics();
    this.app.stage.addChild(this.bgLayer);
    this.furnitureLayer = new PIXI.Container();
    this.furnitureLayer.sortableChildren = true;
    this.app.stage.addChild(this.furnitureLayer);

    // 舞台级指针事件（拖拽 / 点击走动用）
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointermove', e => this.onMove(e));
    this.app.stage.on('pointerup', () => this.onUp());
    this.app.stage.on('pointerupoutside', () => this.onUp());
    this.app.stage.on('pointerdown', e => this.onStageDown(e));
    this.app.ticker.add(() => this.tick());

    // 容器尺寸变化（窗口拉伸 / 收纳箱展开）时重新平铺
    this._ro = new ResizeObserver(() => this.layout());
    this._ro.observe(this.canvas.parentElement);
    this.layout();
  }

  // ---------- 坐标映射：网格 → 屏幕（正面平铺，无等距投影） ----------
  sx(gx) { return gx / ROOM_W * this.W; }
  depthY(gy) { return this.FT + gy / ROOM_H * (this.H - this.FT); }
  depthK(gy) { return 0.74 + 0.26 * (gy / ROOM_H); } // 越靠前越大（近大远小）
  toGrid(bx, by) { // 屏幕点 → 网格（地板范围内）
    return {
      gx: bx / this.W * ROOM_W,
      gy: (by - this.FT) / (this.H - this.FT) * ROOM_H,
    };
  }

  // 画布铺满容器，背景与所有物件按新尺寸重排
  layout() {
    if (!this.app) return;
    const wrap = this.canvas.parentElement;
    const cw = wrap.clientWidth, ch = wrap.clientHeight;
    if (cw < 10 || ch < 10) return;
    this.app.renderer.resize(cw, ch);
    this.W = cw; this.H = ch;
    this.FT = ch * WALL_RATIO;
    this.cellW = cw / ROOM_W;
    this.redrawBg();
    for (const sp of this.sprites.values()) this.posSprite(sp);
    this.furnitureLayer.sortChildren();
    this.updateCharTransform();
  }

  // ---------- 背景：整面墙 + 整片地板 ----------
  redrawBg() {
    const g = this.bgLayer;
    g.clear();
    const { W, H, FT } = this;

    // 墙面 + 竖条纹墙纸
    g.beginFill('#f6e9d1'); g.drawRect(0, 0, W, FT); g.endFill();
    g.beginFill('#efdfc2', 0.55);
    for (let x = 0; x < W; x += 64) g.drawRect(x, 0, 32, FT);
    g.endFill();

    // 窗户（右上墙面，阳光感）
    {
      const ww = Math.min(W * 0.17, 230), wh = ww * 0.66;
      const wx = W * 0.70 - ww / 2, wy = FT * 0.24;
      g.lineStyle(5, '#b58a5f', 1); g.beginFill('#cfe8f7');
      g.drawRect(wx, wy, ww, wh); g.endFill();
      g.lineStyle(3.5, '#b58a5f', 1);
      g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh);
      g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2);
      g.lineStyle(0); g.beginFill('#ffffff', 0.9);
      g.drawCircle(wx + ww * 0.26, wy + wh * 0.3, wh * 0.11);
      g.drawCircle(wx + ww * 0.36, wy + wh * 0.26, wh * 0.09);
      g.drawCircle(wx + ww * 0.74, wy + wh * 0.66, wh * 0.09);
      g.endFill();
    }
    // 挂画（左上墙面）
    {
      const mw = Math.min(W * 0.075, 96), mh = mw * 0.8;
      const mx = W * 0.24 - mw / 2, my = FT * 0.3;
      g.lineStyle(0); g.beginFill('#f2cc5b'); g.drawRect(mx, my, mw, mh); g.endFill();
      g.lineStyle(3, '#b07d45', 1); g.drawRect(mx, my, mw, mh);
      g.lineStyle(0); g.beginFill('#8fd194');
      g.moveTo(mx + mw * 0.12, my + mh * 0.82); g.lineTo(mx + mw * 0.4, my + mh * 0.3);
      g.lineTo(mx + mw * 0.6, my + mh * 0.58); g.lineTo(mx + mw * 0.85, my + mh * 0.22);
      g.lineTo(mx + mw * 0.88, my + mh * 0.82);
      g.closePath(); g.endFill();
    }

    // 踢脚线（墙地交界）
    g.lineStyle(0); g.beginFill('#c8a87a'); g.drawRect(0, FT - 8, W, 8); g.endFill();

    // 地板：横向错缝拼花，越靠后越暗（深度感）
    for (let gy = 0; gy < ROOM_H; gy++) {
      const y0 = this.depthY(gy), y1 = this.depthY(gy + 1);
      g.beginFill(gy % 2 === 0 ? '#f3e9d4' : '#ede0c6');
      g.drawRect(0, y0, W, y1 - y0 + 1); g.endFill();
      g.lineStyle(1, '#d8c9ad', 0.8);
      const off = (gy % 2) * this.cellW / 2;
      for (let x = off; x <= W + 1; x += this.cellW) { g.moveTo(x, y0); g.lineTo(x, y1); }
      g.moveTo(0, y0); g.lineTo(W, y0);
    }
    g.lineStyle(0); g.beginFill('#8a6f4d', 0.08);
    g.drawRect(0, FT, W, (H - FT) * 0.4); g.endFill();

    // 拖拽落点高亮
    if (this.hover) {
      const t = this.hover;
      g.beginFill('#bcd7f0', 0.75);
      g.drawRect(this.sx(t.gx), this.depthY(t.gy), this.sx(t.w), this.depthY(t.h) - this.depthY(t.gy));
      g.endFill();
      g.lineStyle(2, '#7fa8cc', 0.9);
      g.drawRect(this.sx(t.gx), this.depthY(t.gy), this.sx(t.w), this.depthY(t.h) - this.depthY(t.gy));
    }
  }

  setEditable(on) {
    this.editable = on;
    if (on) this.charTarget = null; // 布置房间时小人站定不乱走
    this.redrawBg();
    for (const sp of this.sprites.values()) {
      sp.alpha = 1;
      sp.eventMode = on ? 'static' : 'none';
      sp.cursor = on ? 'grab' : 'default';
    }
  }

  // ---------- 家具摆放 ----------
  posSprite(sp) {
    const p = this.placed.find(q => q.item_id === sp.itemId);
    if (!p) return;
    const def = this.catalog.find(f => f.id === sp.itemId);
    if (!def) return;
    const gyF = p.y + def.h;                 // 底面所在深度
    const k = this.depthK(gyF);
    let w = def.w * this.cellW * k;
    let h = w * sp.aspect;
    const maxH = this.H * 0.82;              // 立柜太高时整体收一点
    if (h > maxH) { const f = maxH / h; w *= f; h *= f; }
    sp.width = w; sp.height = h;
    sp.x = this.sx(p.x + def.w / 2);
    if (sp.flat) {
      // 地毯等贴地物件：正面视角下压扁平铺在地板中央
      sp.height = h * 0.42;
      sp.y = this.depthY(p.y + def.h / 2);
      sp.zIndex = Math.round(sp.y) - 1;
    } else {
      sp.y = this.depthY(gyF);
      sp.zIndex = Math.round(sp.y);
    }
  }

  // placed: [{item_id,x,y}]
  async setRoom(placed) {
    this.placed = placed;
    // 清掉已不在列表中的
    for (const [id, sp] of [...this.sprites]) {
      if (!placed.some(p => p.item_id === id)) {
        sp.destroy();
        this.sprites.delete(id);
      }
    }
    for (const p of placed) {
      let sp = this.sprites.get(p.item_id);
      if (!sp) {
        sp = await this.makeSprite(p.item_id);
        if (!sp) continue;
        this.sprites.set(p.item_id, sp);
        this.furnitureLayer.addChild(sp);
      }
      this.posSprite(sp);
    }
    this.furnitureLayer.sortChildren();
    this.setEditable(this.editable);
    if (this.charRig) this.updateCharTransform();
  }

  async makeSprite(itemId) {
    if (!this.catalog) return null;
    const def = this.catalog.find(f => f.id === itemId);
    const art = FURNITURE_ART[itemId];
    if (!def || !art) return null;
    const vb = art.match(/viewBox="0 0 (\d+) (\d+)"/);
    const aspect = vb ? +vb[2] / +vb[1] : 1;
    const tex = await svgTexture(art, def.w * 96, def.w * 96 * aspect);
    if (!tex) return null;
    const sp = new PIXI.Sprite(tex);
    sp.flat = FLAT_ITEMS.has(itemId);
    sp.anchor.set(0.5, sp.flat ? 0.5 : 1); // 底边中心对齐地面接触点（贴地物件居中）
    sp.aspect = aspect;
    sp.itemId = itemId;
    sp.eventMode = this.editable ? 'static' : 'none';
    sp.cursor = 'grab';
    sp.on('pointerdown', e => this.onDown(e, sp));
    sp.on('rightdown', e => {
      if (!this.editable) return;
      e.stopPropagation?.();
      this.cb.onRemove?.(itemId);
    });
    return sp;
  }

  // ---------- 拖拽 ----------
  onDown(e, sp) {
    if (!this.editable) return;
    e.stopPropagation();
    this.dragging = sp;
    this.grabDX = e.global.x - sp.x;
    this.grabDY = e.global.y - sp.y;
    sp.alpha = 0.85;
    sp.zIndex = 99999;
    this.furnitureLayer.sortChildren();
  }

  onMove(e) {
    if (!this.dragging) return;
    const sp = this.dragging;
    sp.x = e.global.x - this.grabDX;
    sp.y = e.global.y - this.grabDY;
    // 反算落点格并高亮
    const def = this.catalog?.find(f => f.id === sp.itemId);
    if (!def) return;
    const t = this.targetOf(sp.x, sp.y, def.w, def.h);
    const changed = JSON.stringify(t) !== JSON.stringify(this.hover);
    this.hover = t;
    if (changed) this.redrawBg();
  }

  // 底面中心对齐的落点（钳在房间范围内）
  targetOf(bx, by, w, h) {
    const g = this.toGrid(bx, by);
    return {
      gx: Math.min(Math.max(Math.round(g.gx - w / 2), 0), ROOM_W - w),
      gy: Math.min(Math.max(Math.round(g.gy - h), 0), ROOM_H - h),
      w, h,
    };
  }

  onUp() {
    const sp = this.dragging;
    if (!sp) return;
    this.dragging = null;
    sp.alpha = 1;
    this.hover = null;
    this.redrawBg();
    const def = this.catalog?.find(f => f.id === sp.itemId);
    const old = this.placed.find(p => p.item_id === sp.itemId);
    if (!def) return;
    const t = this.targetOf(sp.x, sp.y, def.w, def.h);
    const ok = !this.overlaps(sp.itemId, t.gx, t.gy, def.w, def.h);
    if (ok) {
      this.posSprite(sp);
      this.furnitureLayer.sortChildren();
      if (!old || old.x !== t.gx || old.y !== t.gy) this.cb.onPlace?.(sp.itemId, t.gx, t.gy);
    } else {
      // 回弹
      this.posSprite(sp);
      this.furnitureLayer.sortChildren();
      this.cb.onInvalid?.();
    }
  }

  overlaps(itemId, x, y, w, h) {
    if (!this.catalog) return false;
    return this.placed.some(p => {
      if (p.item_id === itemId) return false;
      const d = this.catalog.find(f => f.id === p.item_id);
      if (!d) return false;
      return x < p.x + d.w && p.x < x + w && y < p.y + d.h && p.y < y + h;
    });
  }

  // 找第一个能放下该家具的空位（托盘点击摆放用）
  findFreeSpot(itemId) {
    if (!this.catalog) return null;
    const def = this.catalog.find(f => f.id === itemId);
    if (!def) return null;
    for (let y = 0; y + def.h <= ROOM_H; y++) {
      for (let x = 0; x + def.w <= ROOM_W; x++) {
        if (!this.overlaps('__new__', x, y, def.w, def.h)) return { x, y };
      }
    }
    return null;
  }

  // ---------- 人物：骨骼分层（back/armL/armR/legL/legR/core）----------
  async setCharacter(cfg) {
    const token = this._charToken = (this._charToken ?? 0) + 1;
    if (this.charRig) {
      this.charRig.destroy({ children: true });
      this.charRig = null;
      this.bones = null;
    }
    if (this.charShadow) { this.charShadow.destroy(); this.charShadow = null; }
    const layers = buildCharacterLayers(cfg);
    const rig = new PIXI.Container(); // 原点=脚底，整体缩放/朝向/摇摆
    const body = new PIXI.Container(); // 承载骨骼层，呼吸以脚为基准缩放
    rig.addChild(body);
    this.bones = {};
    for (const key of BONE_ORDER) {
      const svg = layers[key];
      if (!svg) continue;
      const tex = await svgTexture(layerSvg(svg), VB_W, VB_H);
      if (token !== this._charToken) return; // 已有更新的 setCharacter，放弃本次
      if (!tex) continue;
      const sp = new PIXI.Sprite(tex);
      sp.width = VB_W; sp.height = VB_H; // rig 内部用 viewBox 单位，整体由 rig.scale 缩放
      const piv = PIVOTS[key] ?? PIVOTS.feet; // back 等静态层随身体整体移动
      sp.anchor.set(piv[0] / VB_W, piv[1] / VB_H); // 锚点=骨骼枢轴，旋转即绕肩/髋摆动
      sp.position.set(piv[0], piv[1]);
      body.addChild(sp);
      this.bones[key] = sp;
    }
    this.body = body;
    this.furnitureLayer.addChild(rig);
    this.charRig = rig;
    this.ensureShadow();
    this.updateCharTransform();
  }

  // 落地阴影：让人物“踩”在地板上而不是贴着的纸片（并发破坏后自愈）
  ensureShadow() {
    if (this.charShadow && !this.charShadow.destroyed) return;
    this.charShadow = new PIXI.Graphics();
    this.charShadow.beginFill('#4a3a26', 0.2);
    this.charShadow.drawEllipse(0, 0, 1, 0.32);
    this.charShadow.endFill();
    this.furnitureLayer.addChild(this.charShadow);
  }

  // 人物位置/缩放（随深度近大远小），并同步阴影与层级
  updateCharTransform() {
    if (!this.charRig) return;
    this.ensureShadow();
    const { x, y } = this.charPos;
    this.charK = CHAR_H_GRID * this.cellW * this.depthK(y) / VB_H;
    this.charFeetX = this.sx(x);
    this.charFeetY = this.depthY(y);
    const rig = this.charRig;
    rig.scale.set(this.charK * this.charFace, this.charK);
    rig.position.set(this.charFeetX, this.charFeetY - (this.charBob || 0));
    if (this.charShadow) {
      this.charShadow.position.set(this.charFeetX, this.charFeetY + 2);
      this.charShadow.scale.set(VB_H * this.charK * 0.17, VB_H * this.charK * 0.055);
    }
    const z = Math.round(this.charFeetY);
    if (z !== this._lastCharZ) {
      rig.zIndex = z;
      if (this.charShadow) this.charShadow.zIndex = z - 1;
      this._lastCharZ = z;
      this.furnitureLayer.sortChildren();
    }
  }

  // 非编辑模式点击地板 → 小人走到该处
  onStageDown(e) {
    if (this.editable || this.dragging || !this.charRig) return;
    const { x, y } = e.global;
    if (y < this.FT) return; // 只响应地板范围内
    const g = this.toGrid(x, y);
    this.charTarget = {
      x: Math.min(Math.max(g.gx, 0.5), ROOM_W - 0.5),
      y: Math.min(Math.max(g.gy, 0.8), ROOM_H - 0.4),
    };
  }

  // 每帧驱动：自主溜达/点击行走 + 四肢摆动 + 待机呼吸
  tick() {
    const rig = this.charRig;
    if (!rig || !this.bones) return;
    const ds = Math.min(this.app.ticker.deltaMS / 1000, 0.05);
    const pos = this.charPos;
    let moving = false, dirx = 0;

    // 模拟人生式自主走动：站一会儿就自己挑个地方溜达
    if (!this.editable && !this.charTarget) {
      this.idleDelay -= ds;
      if (this.idleDelay <= 0) {
        this.charTarget = {
          x: 0.8 + Math.random() * (ROOM_W - 1.6),
          y: 1.2 + Math.random() * (ROOM_H - 1.8),
        };
      }
    }
    if (this.charTarget) {
      const dx = this.charTarget.x - pos.x, dy = this.charTarget.y - pos.y;
      const dist = Math.hypot(dx, dy);
      const step = WALK_SPEED * ds;
      if (dist <= step || dist < 1e-4) {
        pos.x = this.charTarget.x; pos.y = this.charTarget.y;
        this.charTarget = null;
        this.idleDelay = 2.5 + Math.random() * 4; // 到点后站一会儿再溜达
      } else {
        dirx = dx / dist;
        pos.x += dx / dist * step; pos.y += dy / dist * step;
        moving = true;
      }
    }

    const t = performance.now() / 1000;
    const b = this.bones;
    const k = Math.min(1, ds * 14); // 起停平滑，避免姿态突变
    let bob = 0;
    if (moving) {
      this.walkPhase += ds * 10;
      const s = Math.sin(this.walkPhase);
      if (Math.abs(dirx) > 0.05) this.charFace = dirx > 0 ? 1 : -1;
      // 手脚对侧摆动：左腿配右臂
      this._pose = {
        legL: -s * 0.24, legR: s * 0.24,
        armL: ARM_REST.armL - s * 0.3, armR: ARM_REST.armR + s * 0.3,
      };
      bob = Math.abs(s) * VB_H * this.charK * 0.022;
      this._sway = s * 0.016;
    } else {
      // 待机：手臂垂落微摆 + 呼吸起伏
      this._pose = {
        legL: 0, legR: 0,
        armL: ARM_REST.armL + Math.sin(t * 1.5) * 0.045,
        armR: ARM_REST.armR - Math.sin(t * 1.5 + 0.6) * 0.045,
      };
      this._sway = 0;
      this.charBob = 0;
    }
    for (const key of ['armL', 'armR', 'legL', 'legR']) {
      if (b[key]) b[key].rotation += (this._pose[key] - b[key].rotation) * k;
    }
    this.charBob += (bob - this.charBob) * k;
    rig.rotation += ((this._sway || 0) - rig.rotation) * k;
    const breathe = moving ? 1 : 1 + Math.sin(t * 2.2) * 0.012;
    this.body.scale.set(breathe);
    this.body.position.set(-PIVOTS.feet[0] * breathe, -PIVOTS.feet[1] * breathe); // 呼吸时脚不离地
    rig.scale.set(this.charK * this.charFace, this.charK);
    rig.position.set(this.sx(pos.x), this.depthY(pos.y) - this.charBob);
    this.charFeetY = this.depthY(pos.y);
    this.ensureShadow();
    this.charShadow.position.set(this.sx(pos.x), this.depthY(pos.y) + 2);
    this.charShadow.scale.set(VB_H * this.charK * 0.17, VB_H * this.charK * 0.055);
    // 前后遮挡：越靠下（越靠前）层级越高
    const z = Math.round(this.charFeetY);
    if (z !== this._lastCharZ) {
      rig.zIndex = z;
      if (this.charShadow) this.charShadow.zIndex = z - 1;
      this._lastCharZ = z;
      this.furnitureLayer.sortChildren();
    }
  }

  destroy() {
    this._ro?.disconnect();
    this._ro = null;
    this.app?.destroy(true, { children: true });
    this.app = null;
  }
}
