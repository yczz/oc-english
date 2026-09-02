// 房间渲染器：等距 2.5D 视角（左墙 + 后墙 + 菱形地砖地板）
// 依赖全局 PIXI（lib/pixi.min.js UMD）
import { FURNITURE_ART } from './furniture.js';

export const ROOM_W = 12;
export const ROOM_H = 8;

// ---- 等距投影参数 ----
const TILE_W = 48, TILE_H = 24;          // 地砖菱形：宽 48 高 24（2:1 等距）
const TW2 = TILE_W / 2, TH2 = TILE_H / 2;
const WALL_H = 100;                       // 墙面高度
const OX = ROOM_H * TW2 + 48;             // 房间后角(0,0)的屏幕 x
const OY = WALL_H + 8;                    // 后角的屏幕 y
const CANVAS_W = (ROOM_W + ROOM_H) * TW2 + 96;
const CANVAS_H = OY + (ROOM_W + ROOM_H) * TH2 + 16;

// 网格角点 → 屏幕坐标
const px = (x, y) => OX + (x - y) * TW2;
const py = (x, y) => OY + (x + y) * TH2;
// 屏幕坐标 → 网格角点（拖拽反算用）
function toGrid(sx, sy) {
  const d = (sy - OY) / TH2, a = (sx - OX) / TW2;
  return { gx: (a + d) / 2, gy: (d - a) / 2 };
}

// 家具的立体高度系数（贴地家具按等距深度压扁，立柜类保持挺立）
const HEIGHT_K = { rug: 0.55, bed_basic: 0.72, bed_soft: 0.72, bed_lux: 0.62, sofa: 0.85, piano: 0.9 };
const heightK = id => HEIGHT_K[id] ?? 0.95;

function svgTexture(svgStr, w, h) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(PIXI.Texture.from(img));
    img.onerror = () => resolve(null);
    // 2x 超采样保证 Retina 清晰
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      svgStr.replace('<svg ', `<svg width="${w * 2}" height="${h * 2}" `)
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
  }

  async init() {
    this.app = new PIXI.Application({
      view: this.canvas,
      width: CANVAS_W,
      height: CANVAS_H,
      background: '#e9e0cf',
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    this.bgLayer = new PIXI.Graphics();
    this.app.stage.addChild(this.bgLayer);
    this.furnitureLayer = new PIXI.Container();
    this.furnitureLayer.sortableChildren = true;
    this.app.stage.addChild(this.furnitureLayer);

    // 舞台级指针事件（拖拽用）
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;
    this.app.stage.on('pointermove', e => this.onMove(e));
    this.app.stage.on('pointerup', () => this.onUp());
    this.app.stage.on('pointerupoutside', () => this.onUp());
    this.redrawBg();
  }

  // ---------- 背景：墙面 + 地板 ----------
  redrawBg() {
    const g = this.bgLayer;
    g.clear();

    // 左墙（面向右侧）：后角 → 左下角，向下延伸墙高
    g.beginFill('#e9d7ba');
    g.moveTo(px(0, 0), py(0, 0));
    g.lineTo(px(0, ROOM_H), py(0, ROOM_H));
    g.lineTo(px(0, ROOM_H), py(0, ROOM_H) + WALL_H);
    g.lineTo(px(0, 0), py(0, 0) + WALL_H);
    g.closePath(); g.endFill();

    // 后墙（面向下侧）：后角 → 右上角，更亮一点
    g.beginFill('#f6e9d1');
    g.moveTo(px(0, 0), py(0, 0));
    g.lineTo(px(ROOM_W, 0), py(ROOM_W, 0));
    g.lineTo(px(ROOM_W, 0), py(ROOM_W, 0) + WALL_H);
    g.lineTo(px(0, 0), py(0, 0) + WALL_H);
    g.closePath(); g.endFill();

    // 墙顶描边
    g.lineStyle(2, '#c8b18c', 1);
    g.moveTo(px(0, ROOM_H), py(0, ROOM_H) + WALL_H);
    g.lineTo(px(0, 0), py(0, 0) + WALL_H);
    g.lineTo(px(ROOM_W, 0), py(ROOM_W, 0) + WALL_H);

    // 后墙上的窗户（阳光感）
    {
      const cx = px(8, 0), top = py(8, 0) + 22, w = 82, h = 48;
      g.lineStyle(4, '#b58a5f', 1); g.beginFill('#cfe8f7');
      g.drawRect(cx - w / 2, top, w, h); g.endFill();
      g.lineStyle(3, '#b58a5f', 1);
      g.moveTo(cx, top); g.lineTo(cx, top + h);
      g.moveTo(cx - w / 2, top + h / 2); g.lineTo(cx + w / 2, top + h / 2);
      // 窗外云朵
      g.lineStyle(0); g.beginFill('#ffffff', 0.9);
      g.drawCircle(cx - 18, top + 15, 6); g.drawCircle(cx - 10, top + 13, 5);
      g.drawCircle(cx + 16, top + 30, 5);
      g.endFill();
    }
    // 左墙上的挂画
    {
      const mx = px(0, 4.5), my = py(0, 4.5) + 34;
      g.lineStyle(0); g.beginFill('#f2cc5b');
      g.drawRect(mx - 14, my, 28, 22); g.endFill();
      g.lineStyle(2.5, '#b07d45', 1);
      g.drawRect(mx - 14, my, 28, 22);
      g.lineStyle(0); g.beginFill('#8fd194');
      g.moveTo(mx - 10, my + 18); g.lineTo(mx - 2, my + 7); g.lineTo(mx + 4, my + 13); g.lineTo(mx + 10, my + 5); g.lineTo(mx + 10, my + 18);
      g.closePath(); g.endFill();
    }

    // 菱形地砖地板（棋盘格 + 网格线）
    for (let gy = 0; gy < ROOM_H; gy++) {
      for (let gx = 0; gx < ROOM_W; gx++) {
        const p0 = [px(gx, gy), py(gx, gy)], p1 = [px(gx + 1, gy), py(gx + 1, gy)];
        const p2 = [px(gx + 1, gy + 1), py(gx + 1, gy + 1)], p3 = [px(gx, gy + 1), py(gx, gy + 1)];
        const hl = this.hover && gx >= this.hover.gx && gx < this.hover.gx + this.hover.w
          && gy >= this.hover.gy && gy < this.hover.gy + this.hover.h;
        g.lineStyle(1, '#d8c9ad', 0.8);
        g.beginFill(hl ? '#bcd7f0' : ((gx + gy) % 2 === 0 ? '#f3e9d4' : '#ede0c6'), 1);
        g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.lineTo(p3[0], p3[1]);
        g.closePath(); g.endFill();
      }
    }

    // 踢脚线（墙与地板交界）
    g.lineStyle(3, '#c8a87a', 0.9);
    g.moveTo(px(0, ROOM_H), py(0, ROOM_H));
    g.lineTo(px(0, 0), py(0, 0));
    g.lineTo(px(ROOM_W, 0), py(ROOM_W, 0));
  }

  setEditable(on) {
    this.editable = on;
    this.redrawBg();
    for (const sp of this.sprites.values()) {
      sp.alpha = 1;
      sp.eventMode = on ? 'static' : 'none';
      sp.cursor = on ? 'grab' : 'default';
    }
  }

  // ---------- 家具摆放 ----------
  // 家具底面中心 = 其占地格的前角（最靠屏幕下方的角）
  frontOf(gx, gy, w, h) {
    return { x: px(gx + w, gy + h), y: py(gx + w, gy + h) };
  }
  posSprite(sp) {
    const p = this.placed.find(q => q.item_id === sp.itemId);
    if (!p) return;
    const def = this.catalog.find(f => f.id === sp.itemId);
    if (!def) return;
    const f = this.frontOf(p.x, p.y, def.w, def.h);
    sp.x = f.x;
    sp.y = f.y;
    sp.zIndex = (p.x + def.w + p.y + def.h) * 10;
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
    if (this.charSprite) this.placeCharSprite();
  }

  async makeSprite(itemId) {
    if (!this.catalog) return null;
    const def = this.catalog.find(f => f.id === itemId);
    const art = FURNITURE_ART[itemId];
    if (!def || !art) return null;
    // 占地宽 = 网格对角线投影宽；高按素材比例 × 立体系数
    const w = (def.w + def.h) * TW2;
    const vb = art.match(/viewBox="0 0 (\d+) (\d+)"/);
    const aspect = vb ? +vb[2] / +vb[1] : 1;
    const h = Math.min(w * aspect * heightK(itemId), WALL_H + 40);
    const tex = await svgTexture(art, w, h);
    if (!tex) return null;
    const sp = new PIXI.Sprite(tex);
    sp.anchor.set(0.5, 1); // 底边中心对齐地面接触点
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
    const g = toGrid(sp.x, sp.y);
    const t = this.targetOf(g.gx, g.gy, def.w, def.h);
    const changed = JSON.stringify(t) !== JSON.stringify(this.hover);
    this.hover = t;
    if (changed) this.redrawBg();
  }

  // 底面前角对齐的落点（钳在房间范围内）
  targetOf(gx, gy, w, h) {
    return {
      gx: Math.min(Math.max(Math.round(gx) - w, 0), ROOM_W - w),
      gy: Math.min(Math.max(Math.round(gy) - h, 0), ROOM_H - h),
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
    const g = toGrid(sp.x, sp.y);
    const t = this.targetOf(g.gx, g.gy, def.w, def.h);
    const ok = !this.overlaps(sp.itemId, t.gx, t.gy, def.w, def.h);
    if (ok) {
      sp.x = px(t.gx + def.w, t.gy + def.h);
      sp.y = py(t.gx + def.w, t.gy + def.h);
      sp.zIndex = (t.gx + def.w + t.gy + def.h) * 10;
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

  // ---------- 人物 ----------
  async setCharacter(dataURL) {
    if (this.charSprite) {
      this.charSprite.destroy();
      this.charSprite = null;
    }
    const tex = await new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(PIXI.Texture.from(img));
      img.onerror = () => resolve(null);
      img.src = dataURL;
    });
    if (!tex) return;
    const sp = new PIXI.Sprite(tex);
    sp.anchor.set(0.5, 1);
    const scale = 108 / tex.height;
    sp.width = tex.width * scale;
    sp.height = tex.height * scale;
    this.charSprite = sp;
    this.furnitureLayer.addChild(sp);
    this.placeCharSprite();
  }

  placeCharSprite() {
    if (!this.charSprite) return;
    // 站在房间中央偏前
    this.charSprite.x = px(ROOM_W / 2 + 0.5, ROOM_H / 2 + 0.5);
    this.charSprite.y = py(ROOM_W / 2 + 0.5, ROOM_H / 2 + 0.5) + 6;
    this.charSprite.zIndex = (ROOM_W / 2 + 0.5 + ROOM_H / 2 + 0.5) * 10;
    this.furnitureLayer.sortChildren();
  }

  destroy() {
    this.app?.destroy(true, { children: true });
    this.app = null;
  }
}
