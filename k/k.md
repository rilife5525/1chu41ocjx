// ===== src\game\skills\common.ts =====
// 機體技能共用介面與小工具
import type { Game } from "../engine/Game";
import type { Enemy, Fx, PBullet } from "../entities";
import { bolt } from "../render/shipUtil";
import { W, H } from "../constants";

export interface ShipKit {
  init(g: Game): void;
  fire(g: Game, dt: number): void;
  update(g: Game, dt: number): void;
  castActive(g: Game): void;
  castUlt(g: Game): void;
  onKill?(g: Game, e: Enemy): void;
  onHit?(g: Game, b: PBullet, e: Enemy, dmg: number): void;
  onGraze?(g: Game): void;
  onPlayerHit?(g: Game): void;
  /** 致命傷害結算時呼叫；回傳 true 代表這次死亡被吃掉（機體專屬免死，如翠蓮的「蓮華護體」）。
   *  由 `Game.hurt()` 在 `p.hp <= 0` 分支最先呼叫；回傳 true 時引擎保留 1 HP。 */
  onLethal?(g: Game): boolean;
  updateBullet?(g: Game, b: PBullet, dt: number): void;
  drawUnder?(g: Game, ctx: CanvasRenderingContext2D): void;
  drawOver?(g: Game, ctx: CanvasRenderingContext2D): void;
  /** 展示用：給定時間回傳外觀範例值（供機庫／選機畫面預覽，移植自 arena 的 preview） */
  preview?(t: number): { mode: number; aux: number };
}

/** 建立並註冊技能特效：update 回傳 false 代表結束 */
export function mkFx(g: Game, layer: 0 | 1 | 2, update: (dt: number) => boolean | void, draw: (ctx: CanvasRenderingContext2D) => void): Fx {
  const fx: Fx = {
    alive: true,
    layer,
    update: (dt) => {
      if (update(dt) === false) fx.alive = false;
    },
    draw,
  };
  g.addFx(fx);
  return fx;
}

/** 短暫閃電線 */
export function boltFx(g: Game, x1: number, y1: number, x2: number, y2: number, color: string, life = 0.16, w = 2.6) {
  let t = 0;
  const seed = Math.random() * 100;
  mkFx(
    g,
    1,
    (dt) => {
      t += dt;
      return t < life;
    },
    (ctx) => {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0, 1 - t / life);
      bolt(ctx, x1, y1, x2, y2, seed + Math.floor(t * 40), 7, 9, color, w, "#ffffff");
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  );
}

/** 螢幕黑邊（電影感） */
export function drawBars(ctx: CanvasRenderingContext2D, a: number, W: number, H: number) {
  const h = 70 * a;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, h);
  ctx.fillRect(0, H - h, W, h);
}

/** 點到線段距離（點 (px,py) 到線段 (x0,y0)-(x1,y1)） */
export function segDist(px: number, py: number, x0: number, y0: number, x1: number, y1: number): number {
  const dx = x1 - x0, dy = y1 - y0;
  const l2 = dx * dx + dy * dy;
  let t = l2 > 0 ? ((px - x0) * dx + (py - y0) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x0 + dx * t), py - (y0 + dy * t));
}

/** 小額回血的累計結算器（全機體共用）。
 *  ⚠ 為什麼需要：`Game.heal(n)` 一律弹 `"+" + Math.round(h)`（綠色飘字）。來源（A／TT 等）引擎的
 *    小額吸血／回復每次只有 0.1～0.5 HP（滿月吸血 ≈ dmg×0.012×0.5、翠蓮靈蓮領域 ≈ (3+La)×dt、
 *    蒼牙派生 ≈ maxHp×0.0015），`Math.round` 後全是 0 → **每次結算都跳一顆綠色「+0」**，
 *    未滿血也不會消失，只是洗版。
 *  ⚠ 處方：在此累計，滿 1 才結算 —— **總回復量與來源完全一致**，只把「+0 洗版」變成
 *    偶發的「+1／+2」。滿血時 heal 會被引擎提前 return，累計值一併歸零（與來源「滿血無法回復」同）。
 *  用法：kit 的 `p.k` 需有 `healAcc: 0`（init 一併初始化），小額回血一律改呼叫本函式。
 *  （原本放在 `port/sxCommon.ts`；TT 六台也需要 → 搬到本共用檔，由 sxCommon 轉出以保相容。） */
export function healAcc(g: Game, n: number, k: { healAcc?: number }): void {
  if (!(n > 0)) return;                      // NaN／負值／0 一律不累計
  const a = (k.healAcc ?? 0) + n;
  if (a >= 1) { k.healAcc = 0; g.heal(a); }  // 滿 1 才結算（結算後歸零，不殘留）
  else k.healAcc = a;
}

/**
 * 奧義全螢幕背景（來源 3×1 圖集 API 的保留殼）。
 * dst 端奧義背景改由 renderer.ts drawUltBg 依 ship id 單張 loadUltBg 統一 cover 全填，
 * 故來源逐行照搬的 ultArt 呼叫在此為 no-op（簽名保留、不報錯、不重複畫背景）。
 */
export function ultArt(_ctx: CanvasRenderingContext2D, _sheet: string, _idx: number, _alpha: number, _o: { zoom?: number; rot?: number; dx?: number; dy?: number; fx?: number; fy?: number; mode?: GlobalCompositeOperation; w?: number; h?: number } = {}) {
  // 奧義背景由 renderer 統一繪製，此處不重複
}

/** 特效貼圖（來源 fx 圖集 API 的保留殼，dst 無 fx 圖集）
 *  idx===3：來源 yozora 奧義魔法陣貼圖（霓虹紫魔法陣）→ dst 用 canvas 程式重繪
 *  其他 idx：no-op（dst 無對應貼圖）
 *  繪製參數跟來源 drawCell 語意一致：以 (cx,cy) 中心、size 邊長、rot 旋轉、alpha 透明度、mode 混合模式。
 *  yozora 兩層反向旋轉：外層 size×1、內層 size×0.62，rot 相反號，重疊出旋渦感。 */
export function fxTex(ctx: CanvasRenderingContext2D, idx: number, cx: number, cy: number, size: number, rot = 0, alpha = 1, mode: GlobalCompositeOperation = "screen") {
  if (idx !== 3) return; // 來源 fx 圖集只有第 3 格（魔法陣）被 yozora 用到，其他格不搬
  if (alpha <= 0.01) return;
  const r = size / 2;
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.globalCompositeOperation = mode;
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(r / 100, r / 100); // 把 size 歸一化到 100 單位，內部幾何用 0~100 座標
  // ── 外環符號帶（主紫 #c76bff）──
  ctx.strokeStyle = "rgba(199,107,255,0.6)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,95,168,0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(0, 0, 80, 0, Math.PI * 2);
  ctx.stroke();
  // 外環符號（16 個，每 22.5° 一個，主紫 rune）
  ctx.strokeStyle = "rgba(199,107,255,0.85)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const x = Math.cos(a) * 86, y = Math.sin(a) * 86;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 4);
    ctx.moveTo(0, -4);
    ctx.lineTo(3, -1);
    ctx.stroke();
    ctx.restore();
  }
  // ── 六角星（兩個反向三角，粉紅 #ff5fa8）──
  ctx.strokeStyle = "rgba(255,95,168,0.8)";
  ctx.lineWidth = 1.6;
  for (const flip of [0, 1]) {
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + flip * Math.PI + (i / 3) * Math.PI * 2;
      const x = Math.cos(a) * 58, y = Math.sin(a) * 58;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  // ── 八角星（兩個反向正方形，主紫 #c76bff）──
  ctx.strokeStyle = "rgba(199,107,255,0.9)";
  ctx.lineWidth = 1.2;
  for (const rot2 of [Math.PI / 8, 0]) {
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = -Math.PI / 2 + rot2 + (i / 4) * Math.PI * 2;
      const x = Math.cos(a) * 34, y = Math.sin(a) * 34;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  // ── 放射線（12 條，主紫，時鐘刻度感）──
  ctx.strokeStyle = "rgba(199,107,255,0.55)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 42, Math.sin(a) * 42);
    ctx.lineTo(Math.cos(a) * 78, Math.sin(a) * 78);
    ctx.stroke();
  }
  // ── 中心光點（粉紅 #ff5fa8，符機體主色、不純白）──
  ctx.strokeStyle = "rgba(255,95,168,0.85)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,95,168,0.6)";
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 奧義暗場（全螢幕，來源有、dst 無自動版 → 保留實作） */
export function ultDark(ctx: CanvasRenderingContext2D, a: number, color = "#04020a") {
  if (a <= 0.005) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, a);
  ctx.fillStyle = color;
  ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.restore();
}

/** 生成某區間內的非死亡敵機清單（含 Boss） */
export function liveEnemies(g: Game): Enemy[] {
  const out: Enemy[] = [];
  for (const e of g.enemies) if (!e.dead && e.y > -30) out.push(e);
  return out;
}

// ===== src\game\shipPortPL\kaleido.ts =====
// 萬象・極光 一句話機制：「彩虹圓盤彈跳連鎖後飛回（去回皆傷）；受傷覺醒；主動技循環切換三種個性；奧義三相演出」
// 維度：迴旋／彈跳／定頻／受擊／轉換（個性）／多段奧義
// ⚠ SP/port/005 逐行搬移版，只改 import 路徑（其餘一字不動）：
//    ../render/pbStylesExt 的 EXT_BASE → EXT_BASE_PL as EXT_BASE（SP 樣式槽 +90 起）
//    ../types → ../entities；../engine/Game → ../port/plCommon（Game 為 PlGame 別名）
//    ./common → ../port/plCommon；pbStyle 改由 plCommon 取（dst PBStyle 用 spr，來源用 canvas）
import { H, TAU, W, clamp, easeOut, lerp, rand } from "../constants";
import { audio } from "../audio";
import { EXT_BASE_PL as EXT_BASE } from "../render/pbStylesExt";
import { drawShip, makeOpts } from "../render/shipDraw";
import { glow } from "../render/sprites";
import type { Enemy } from "../entities";
import type { Game } from "../port/plCommon";
import { darkOverlay, liveEnemies, mkFx, pbStyle, takeBullets, ultBg } from "../port/plCommon";
import type { ShipKit } from "../port/plCommon";

const UP = -Math.PI / 2;
const DISC = EXT_BASE + 11;
const DISC_BIG = EXT_BASE + 15;
const KIND = 23;
const RAINBOW = ["#ff4f9a", "#ffd23f", "#3dffb0", "#38e8ff", "#9b5cff"];

function K(g: Game) {
  return g.p.k as {
    mode: number; qIdx: number; qT: number; all: boolean; clones: { x: number; y: number }[]; awakenT: number; awakeTick: number;
    aux: number; fireGlow: number; ult: boolean;
  };
}

/** 擲出圓盤（bounces：可彈跳次數） */
function throwDisc(g: Game, x: number, y: number, ang: number, bounces: number, o?: { big?: boolean; dmgMul?: number; scale?: number; phase?: number }) {
  const dm = g.dmgMult();
  const k = K(g);
  const od = k.mode === 3 || k.mode === 4;
  const big = o?.big ?? od;
  const b = g.spawnPB(x, y, ang, 1000, big ? DISC_BIG : DISC, 22 * dm * (od ? 1.5 : 1) * (o?.dmgMul ?? 1), {
    kind: KIND, r: big ? 22 : 15, pierce: 9999, life: 4, a: o?.phase ?? 0, b: bounces, c: 0, scale: o?.scale ?? 1, src: 0,
  });
  b.spin = 14;
  return b;
}

function nextTarget(g: Game, x: number, y: number, ex: number): Enemy | null {
  return g.nearest(x, y, 520, (e) => e.uid !== ex);
}

export const kaleidoKit: ShipKit = {
  init(g) {
    g.p.k = { mode: 0, qIdx: 0, qT: 0, all: false, clones: [], awakenT: 0, awakeTick: 0, aux: 0, fireGlow: 0, ult: false };
  },

  fire(g) {
    const p = g.p;
    const k = K(g);
    const lv = g.lvl("weapon");
    const rb = k.mode === 1 || k.mode === 4;
    const echo = k.mode === 2 || k.mode === 4;
    const bounces = 3 + (lv >= 3 ? 2 : 0) + (rb ? 2 : 0);
    if (lv >= 5) {
      throwDisc(g, p.x - 10, p.y - 24, UP - 0.16, bounces);
      throwDisc(g, p.x + 10, p.y - 24, UP + 0.16, bounces);
    } else throwDisc(g, p.x, p.y - 26, UP, bounces);
    if (echo) {
      for (const c of k.clones) throwDisc(g, c.x, c.y - 22, UP + (c.x < p.x ? -0.08 : 0.08), bounces, { dmgMul: 0.7 });
    }
    k.fireGlow = 1;
    audio.sfx("shoot0", 0.07);
    p.fireT += 0.28;
  },

  updateBullet(g, b, dt) {
    if (b.kind !== KIND) return;
    const p = g.p;
    b.spin = 14;
    const lv = g.lvl("weapon");
    if (b.a === 0) {
      // 去程
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.t > 0.62 || b.y < 70 || b.x < 20 || b.x > W - 20) turnBack(g, b, lv);
    } else if (b.a === 1) {
      // 追向下一目標
      const e = g.nearest(b.x, b.y, 800, (x) => x.uid !== b.c);
      if (e) {
        const sp = Math.hypot(b.vx, b.vy) || 900;
        const cur = Math.atan2(b.vy, b.vx);
        let d = Math.atan2(e.y - b.y, e.x - b.x) - cur;
        while (d > Math.PI) d -= TAU;
        while (d < -Math.PI) d += TAU;
        const na = cur + clamp(d, -9 * dt, 9 * dt);
        b.vx = Math.cos(na) * sp;
        b.vy = Math.sin(na) * sp;
      }
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.ramp = 0;
      if (b.x < -20 || b.x > W + 20 || b.y < 0 || b.y > H) turnBack(g, b, lv);
      else if (b.t - (b.rot * 0) > 99) turnBack(g, b, lv);
    } else {
      // 回程：加速飛回機體
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = Math.min(1500, (Math.hypot(b.vx, b.vy) || 800) + 1800 * dt);
      b.vx = (dx / d) * sp;
      b.vy = (dy / d) * sp;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (d < 28) b.alive = false;
      b.life = Math.max(b.life, 0.5);
    }
    if (Math.random() < 0.35) g.fx.glowP(b.x, b.y, 0, 0, 0.18, 14 * b.scale, RAINBOW[Math.floor(Math.random() * 5)], 2);
  },

  onHit(g, b, e) {
    if (b.kind !== KIND || b.a === 2) return;
    // 彈跳到下一個敵人
    b.hits.length = 0;
    b.hits.push(e.uid);
    b.c = e.uid;
    b.b -= 1;
    g.fx.ring(e.x, e.y, 4, 36, 0.2, RAINBOW[Math.floor(Math.random() * 5)], 3);
    audio.sfx("hit", 0.04);
    if (b.b < 0) {
      turnBack(g, b, g.lvl("weapon"));
      return;
    }
    const n = nextTarget(g, b.x, b.y, e.uid);
    if (!n) {
      turnBack(g, b, g.lvl("weapon"));
      return;
    }
    const a = Math.atan2(n.y - b.y, n.x - b.x);
    b.a = 1;
    b.vx = Math.cos(a) * 1000;
    b.vy = Math.sin(a) * 1000;
  },

  update(g, dt) {
    const p = g.p;
    const k = K(g);
    const plv = g.lvl("passive");
    const alv = g.lvl("active");
    k.fireGlow = Math.max(0, k.fireGlow - dt * 6);
    // 個性計時
    if (!k.ult && k.qT > 0) {
      k.qT -= dt;
      if (k.qT <= 0) {
        k.mode = 0;
        k.all = false;
        k.clones = [];
      }
    }
    if (p.formT > 0) {
      k.mode = 4;
      k.ult = true;
    } else if (k.ult) {
      k.ult = false;
      k.mode = 0;
      k.clones = [];
    }
    // 分身跟隨
    if (k.mode === 2 || k.mode === 4) {
      if (!k.clones.length && !k.ult) k.clones = [{ x: p.x - 72, y: p.y + 14 }, { x: p.x + 72, y: p.y + 14 }];
      if (k.ult) k.clones = [];
      k.clones.forEach((c, i) => {
        const tx = p.x + (i ? 72 : -72);
        c.x = lerp(c.x, tx, Math.min(1, dt * 10));
        c.y = lerp(c.y, p.y + 14, Math.min(1, dt * 10));
      });
    } else k.clones = [];
    k.aux = 0;
    // 覺醒
    if (k.awakenT > 0) {
      k.awakenT -= dt;
      p.dmgMul = 1.25;
      p.speedMul = p.speedMul === 0 ? 0 : 1.2;
      if (Math.random() < 0.5) g.fx.glowP(p.x + rand(-18, 18), p.y + rand(-10, 30), 0, 40, 0.3, 14, RAINBOW[Math.floor(Math.random() * 5)], 2);
      if (plv >= 7) {
        k.awakeTick -= dt;
        if (k.awakeTick <= 0) {
          k.awakeTick = 1;
          const bounces = 1;
          for (let i = 0; i < 8; i++) throwDisc(g, p.x, p.y, (i * TAU) / 8, bounces, { scale: 0.8, dmgMul: 0.6 });
        }
      }
      if (k.awakenT <= 0) {
        p.dmgMul = 1;
        p.speedMul = 1;
      }
    }
    void alv;
  },

  onPlayerHit(g) {
    const p = g.p;
    const k = K(g);
    const plv = g.lvl("passive");
    const dm = g.dmgMult();
    const R = plv >= 5 ? 240 : 175;
    k.awakenT = plv >= 3 ? 6 : 4;
    k.awakeTick = 0.3;
    g.clearBullets(p.x, p.y, R, "score");
    g.aoe(p.x, p.y, R, 60 * dm, { pal: "white", noText: true });
    g.addUlt(15);
    if (plv >= 5) g.heal(p.maxHp * 0.1);
    RAINBOW.forEach((c, i) => g.fx.ring(p.x, p.y, 10, R * (0.7 + i * 0.1), 0.5, c, 4));
    g.flash("#ffffff", 0.25);
    g.toast("覺醒！", "#ffd23f");
    audio.sfx("morph", 0.2);
  },

  castActive(g) {
    const p = g.p;
    const k = K(g);
    const lv = g.lvl("active");
    const dm = g.dmgMult();
    const dur = lv >= 5 ? 14 : 9;
    const idx = k.qIdx % 3;
    k.qIdx++;
    let q = idx + 1;
    k.all = false;
    if (idx === 2 && lv >= 7) {
      q = 4;
      k.all = true;
    }
    k.mode = q;
    k.qT = q === 4 ? 6 : dur;
    audio.sfx("morph", 0.1);
    const names = ["彈力", "複製", "增幅", "全相覺醒"];
    g.toast(`個性切換：${names[q - 1]}`, RAINBOW[q % 5]);
    g.fx.ring(p.x, p.y, 10, 160, 0.4, RAINBOW[q % 5], 5);
    // 即時效果
    if (q === 1 || q === 4) {
      const taken = takeBullets(g, p.x, p.y, 190, 40);
      for (const b of taken) {
        const e = g.nearest(b.x, b.y, 1400);
        const a = e ? Math.atan2(e.y - b.y, e.x - b.x) : UP;
        const d = g.spawnPB(b.x, b.y, a, 800, DISC, 18 * dm, { kind: KIND, r: 14, pierce: 9999, life: 3, a: 0, b: 1, c: 0, src: 2 });
        d.spin = 14;
      }
      g.aoe(p.x, p.y, 120, 40 * dm, { pal: "white", noText: true, small: true });
    }
    if (q === 2 || q === 4) {
      k.clones = [{ x: p.x - 30, y: p.y + 14 }, { x: p.x + 30, y: p.y + 14 }];
      g.flash("#38e8ff", 0.25);
    }
    if (q === 3 || q === 4) {
      g.aoe(p.x, p.y, 260, 60 * dm, { pal: "gold", noText: true });
      for (const e of g.en.items) {
        if (e.dead || e.boss || e.def.mid) continue;
        if ((e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 280 * 280) e.freeze = Math.max(e.freeze, 1.2);
      }
      g.clearBullets(p.x, p.y, 120, "none");
      g.shake(8, 0.25);
    }
    if (lv >= 3) for (let i = 0; i < 8; i++) throwDisc(g, p.x, p.y, (i * TAU) / 8, 2, { dmgMul: 0.8 });
    if (lv >= 5) p.inv = Math.max(p.inv, 1);
  },

  castUlt(g) {
    const p = g.p;
    const k = K(g);
    const lv = g.lvl("ult");
    const dm = g.dmgMult();
    const DUR = 8.8;
    p.form = 1;
    p.formT = DUR;
    p.inv = Math.max(p.inv, DUR + 1.5);
    k.ult = true;
    k.mode = 4;
    g.tint("#6a1a6a", 0.2, DUR);
    g.flash("#ffffff", 0.8);
    g.shake(10, 0.5);
    audio.sfx("morph", 0.1);
    let t = 0;
    const nBall = 7 + (lv >= 3 ? 3 : 0);
    const balls: { x: number; y: number; vx: number; vy: number; r: number; hue: number; hit: Map<number, number> }[] = [];
    for (let i = 0; i < nBall; i++) {
      balls.push({ x: rand(60, W - 60), y: -rand(20, 300), vx: rand(-420, 420), vy: rand(300, 560), r: rand(30, 42), hue: i % 5, hit: new Map() });
    }
    const nC = lv >= 5 ? 12 : 8;
    const clones: { x: number; y: number; hue: number }[] = [];
    const ccx = W / 2;
    const ccy = 400;
    for (let i = 0; i < nC; i++) {
      const a = (i * TAU) / nC;
      clones.push({ x: ccx + Math.cos(a) * 250, y: ccy + Math.sin(a) * 250 * 0.9, hue: i % 5 });
    }
    let s2 = false;
    let s3 = false;
    let s3b = false;
    let pulse = 0;
    mkFx(
      g,
      2,
      (dt) => {
        t += dt;
        // 階段 1：彈力暴走
        if (t < 2.9) {
          const alive = liveEnemies(g);
          for (const b of balls) {
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            if (b.x < b.r || b.x > W - b.r) {
              b.vx = -b.vx;
              b.x = clamp(b.x, b.r, W - b.r);
              g.fx.ring(b.x, b.y, 6, 50, 0.2, RAINBOW[b.hue], 3);
            }
            if (b.y > H - 130 - b.r) {
              b.vy = -Math.abs(b.vy);
              g.fx.ring(b.x, b.y, 6, 50, 0.2, RAINBOW[b.hue], 3);
            }
            if (b.y < b.r && b.vy < 0) b.vy = Math.abs(b.vy);
            g.clearBullets(b.x, b.y, b.r + 8, "score");
            for (const e of alive) {
              const rr = b.r + e.r;
              if ((e.x - b.x) ** 2 + (e.y - b.y) ** 2 > rr * rr) continue;
              const last = b.hit.get(e.uid);
              if (last !== undefined && t - last < 0.28) continue;
              b.hit.set(e.uid, t);
              g.damageEnemy(e, 62 * dm, { noText: false });
              g.fx.ring(e.x, e.y, 4, 46, 0.2, RAINBOW[b.hue], 3);
              g.shake(3, 0.08);
              audio.sfx("boom_s", 0.04);
              if (!e.boss && !e.def.mid) {
                const d = Math.hypot(e.x - b.x, e.y - b.y) || 1;
                e.x += ((e.x - b.x) / d) * 16;
                e.y += ((e.y - b.y) / d) * 16;
              }
            }
          }
        }
        // 階段 2：鏡像百影雷射
        if (t >= 2.8 && !s2) {
          s2 = true;
          g.flash("#38e8ff", 0.5);
          audio.sfx("laser", 0.1);
          clones.forEach((c, i) => {
            const a = Math.atan2(ccy - c.y, ccx - c.x);
            g.addBeam({
              x: c.x, y: c.y, ang: a + (i % 2 ? 0.5 : -0.5), rot: (i % 2 ? -1 : 1) * 0.9, len: 900, w: 22, warn: 0.2, life: 2.6,
              dmg: (lv >= 5 ? 14 : 11) * dm, color: RAINBOW[c.hue],
            });
          });
        }
        // 階段 3：極光炮
        if (t >= 5.6) {
          for (const c of clones) {
            c.x = lerp(c.x, p.x, Math.min(1, dt * 5));
            c.y = lerp(c.y, p.y, Math.min(1, dt * 5));
          }
        }
        if (t >= 6.1 && !s3) {
          s3 = true;
          g.flash("#ffffff", 1);
          g.shake(24, 1);
          audio.sfx("ultgo", 0.1);
          audio.sfx("laser", 0.1);
          const w = lv >= 7 ? 320 : 240;
          g.addBeam({ x: p.x, y: p.y, followP: true, ox: 0, oy: -20, ang: UP, len: 1300, w, warn: 0.2, life: 1.8, dmg: 70 * dm, color: "#ffffff" });
          [["#ff4f9a", 1.0], ["#38e8ff", 0.78], ["#ffd23f", 0.58]].forEach(([c, m]) => {
            g.addBeam({ x: p.x, y: p.y, followP: true, ox: 0, oy: -20, ang: UP, len: 1300, w: w * (m as number), warn: 0.2, life: 1.8, dmg: 0, color: c as string });
          });
          g.clearBullets(0, 0, 9999, "coin");
        }
        if (lv >= 7 && t >= 7.5 && !s3b) {
          s3b = true;
          g.flash("#ffffff", 0.8);
          g.shake(20, 0.6);
          audio.sfx("laser", 0.1);
          g.addBeam({ x: p.x, y: p.y, followP: true, ox: 0, oy: -20, ang: UP, len: 1300, w: 360, warn: 0.1, life: 1.0, dmg: 80 * dm, color: "#ffffff" });
        }
        if (s3 && t < 8) g.shake(8, 0.1);
        pulse += dt;
        return t < DUR + 0.2;
      },
      (ctx) => {
        const fade = clamp(Math.min(t / 0.5, (DUR - t) / 0.8), 0, 1);
        darkOverlay(ctx, 0.5 * fade, "26,4,24");
        ultBg(ctx, 5, 0.85 * fade, t, 1.12);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        // 波普風同心環
        const cx = t < 2.9 ? W / 2 : p.x;
        const cy = t < 2.9 ? H / 2 : p.y;
        for (let i = 0; i < 6; i++) {
          const r = ((pulse * 260 + i * 140) % 840) + 10;
          ctx.strokeStyle = RAINBOW[i % 5];
          ctx.globalAlpha = (1 - r / 860) * 0.5 * fade;
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, TAU);
          ctx.stroke();
        }
        // 彈球
        if (t < 3.2) {
          const a = clamp((3.2 - t) / 0.3, 0, 1);
          for (const b of balls) {
            ctx.save();
            ctx.globalAlpha = a;
            ctx.drawImage(glow(RAINBOW[b.hue], 64), b.x - b.r * 2.2, b.y - b.r * 2.2, b.r * 4.4, b.r * 4.4);
            ctx.globalCompositeOperation = "source-over";
            const gr = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, 2, b.x, b.y, b.r);
            gr.addColorStop(0, "#ffffff");
            gr.addColorStop(0.35, RAINBOW[b.hue]);
            gr.addColorStop(1, RAINBOW[(b.hue + 3) % 5]);
            ctx.fillStyle = gr;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, TAU);
            ctx.fill();
            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();
          }
        }
        // 分身
        if (t >= 2.5) {
          const a = clamp((t - 2.5) / 0.3, 0, 1) * (t > 7.9 ? clamp((8.4 - t) / 0.5, 0, 1) : 1);
          for (const c of clones) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.globalAlpha = 0.75 * a;
            ctx.globalCompositeOperation = "lighter";
            ctx.scale(0.85, 0.85);
            drawShip(ctx, "kaleido", makeOpts("kaleido", t, 1, [0, 0, 0, 0, 0, 0]));
            ctx.restore();
          }
        }
        ctx.restore();
        void pbStyle;
        void easeOut;
        void H;
      },
    );
  },

  drawUnder(g, ctx) {
    const k = K(g);
    const p = g.p;
    if (k.awakenT > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      RAINBOW.forEach((c, i) => {
        ctx.strokeStyle = c;
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 46 + i * 2.4 + Math.sin(g.time * 8 + i) * 1.5, 0, TAU);
        ctx.stroke();
      });
      ctx.restore();
    }
    for (const c of k.clones) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.globalAlpha = 0.5;
      ctx.globalCompositeOperation = "lighter";
      drawShip(ctx, "kaleido", makeOpts("kaleido", g.time, g.tier(), [0, 0, 0, 0, 0, 0]));
      ctx.restore();
    }
  },

  preview(t) {
    return { mode: Math.floor(t / 2.5) % 4, aux: 0 };
  },
};

function turnBack(g: Game, b: import("../entities").PBullet, lv: number) {
  if (b.a === 2) return;
  b.a = 2;
  b.hits.length = 0;
  // Lv7：回程分裂三枚小盤
  if (lv >= 7 && b.scale >= 0.99) {
    for (let i = 0; i < 3; i++) {
      const e = g.nearest(b.x, b.y, 900);
      const base = e ? Math.atan2(e.y - b.y, e.x - b.x) : UP;
      throwDisc(g, b.x, b.y, base + (i - 1) * 0.5, 1, { scale: 0.6, dmgMul: 0.4, big: false, phase: 0 });
    }
  }
}

void (null as unknown as Enemy);

// ===== src\game\render\sprites.ts =====
// 預渲染精靈：光暈、敵彈、我方子彈。全部以離屏 Canvas 快取，drawImage 繪製以維持 60FPS
import { TAU } from "../constants";
import { EXT_BASE, EXT_STYLES } from "./pbStylesExt";

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

// ── 顏色工具（011 / port/011 移植家族用：把色票轉成帶透明度的 rgba 字串）──
const rgbCache = new Map<string, [number, number, number]>();
let rgbProbe: CanvasRenderingContext2D | null = null;
/** 任意 CSS 顏色 → [r,g,b]（用 1×1 canvas 正規化，可吃 #rgb／#rrggbb／rgb()／顏色名）
 *  ⚠ 無頭環境（Node 測試的 mock ctx）不會把 `fillStyle` 正規化回字串 → 直接解析傳入值。
 *   瀏覽器路徑不受影響（真 canvas 一定回字串）。 */
export function toRGB(color: string): [number, number, number] {
  const hit = rgbCache.get(color);
  if (hit) return hit;
  if (!rgbProbe) rgbProbe = makeCanvas(1, 1).getContext("2d")!;
  rgbProbe.fillStyle = "#000";
  rgbProbe.fillStyle = color;
  const raw = rgbProbe.fillStyle as unknown;
  const s = typeof raw === "string" ? raw : color;
  let out: [number, number, number] = [255, 255, 255];
  if (s[0] === "#") {
    out = s.length >= 7
      ? [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]
      : [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16)];
  } else {
    const m = s.match(/[\d.]+/g);
    if (m) out = [+m[0], +m[1], +m[2]];
  }
  rgbCache.set(color, out);
  return out;
}
export function rgba(color: string, a: number) {
  const [r, g, b] = toRGB(color);
  return `rgba(${r},${g},${b},${a})`;
}

const glowCache = new Map<string, HTMLCanvasElement>();
/** 徑向漸層光暈精靈（中心亮、邊緣透明） */
export function glow(color: string, size = 64): HTMLCanvasElement {
  const key = color + size;
  let c = glowCache.get(key);
  if (c) return c;
  c = makeCanvas(size, size);
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, color);
  grad.addColorStop(0.25, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.globalAlpha = 1;
  g.fillRect(0, 0, size, size);
  // 讓漸層真正過渡到透明（依顏色）
  g.globalCompositeOperation = "destination-in";
  const mask = g.createRadialGradient(r, r, 0, r, r, r);
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(0.3, "rgba(0,0,0,0.75)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = mask;
  g.fillRect(0, 0, size, size);
  glowCache.set(key, c);
  return c;
}

// ---------------- 敵彈精靈 ----------------
export const EB_COLORS = ["#ff3b6b", "#ff9a3d", "#ffe45c", "#5fe0ff", "#b26bff", "#8dff7a", "#ffffff"];
// 半徑（碰撞用）
export const EB_R = [5, 3.4, 10, 3.2, 5.5, 16, 4];
const ebCache: HTMLCanvasElement[][] = [];

/** 敵彈外圈柔光留白（px，單邊）。
 *
 *  來源：2026-10-20 大爺指定「第 1~6 關（原生）的子彈特效要比照 port/013《絕響天穹》，
 *  像會發出淡淡柔光」。013 的敵彈精靈是 64×64 畫布、`glow()` 鋪滿整張、本體只佔中間一小塊
 *  → 光暈有足夠空間散開；SP 原本只留 8px，光暈被畫布邊界切掉，看起來是「硬邊亮點」。
 *
 *  ⚠ 只改**外觀**：碰撞半徑仍是 `EB_R`（未動），所以手感與難度不變，只有視覺變柔。
 *  ⚠ 精靈變大＝每顆子彈的 `drawImage` 面積變大，效能成本與 013 同級；不需要更柔就調小這裡。 */
const EB_GLOW = 12;

function buildEB(type: number, col: string): HTMLCanvasElement {
  const rad = EB_R[type];
  const body = type === 3 ? 22 : type === 6 ? 14 : rad + 8;
  const S = (body + EB_GLOW) * 2;
  const c = makeCanvas(S, S);
  const g = c.getContext("2d")!;
  g.translate(S / 2, S / 2);
  // 外光暈：柔邊徑向漸層（drawImage 同檔 glow() 精靈，對齊 port/010 A 的作法）。
  // 2026-10-14 前這裡是 `globalAlpha=0.28` 的硬邊實心圓，在針彈／米粒後面會形成
  // 一個與本體無關的「奇怪的圓」；不可改回。
  // 2026-10-20：畫布加了 EB_GLOW 留白 → 同一張 glow 鋪滿整張，光暈自然往外散開（013 式柔光）。
  g.drawImage(glow(col, 64), -S / 2, -S / 2, S, S);
  // 內層補一圈較集中的柔光：讓本體邊緣有一層「發光體」的過渡，不會只有外圈一層薄霧。
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.35;
  const inner = rad + 8 + EB_GLOW * 0.45;
  g.drawImage(glow(col, 64), -inner, -inner, inner * 2, inner * 2);
  g.restore();
  // 本體輪廓：一律用子彈本色細線（1.4px）描邊，取代舊的深色硬描邊 rgba(20,0,10,0.9)
  const outline = () => { g.strokeStyle = col; g.lineWidth = 1.4; g.stroke(); };
  if (type === 0 || type === 1 || type === 2 || type === 5) {
    const R = rad + 2.2;
    g.fillStyle = col;
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.fill();
    outline();
    const grd = g.createRadialGradient(-R * 0.25, -R * 0.25, 0, 0, 0, R);
    grd.addColorStop(0, "#fff");
    grd.addColorStop(0.5, "rgba(255,255,255,0.85)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(0, 0, R * 0.85, 0, TAU);
    g.fill();
    if (type === 2 || type === 5) {
      g.strokeStyle = "rgba(255,255,255,0.7)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(0, 0, R * 0.62, 0, TAU);
      g.stroke();
    }
  } else if (type === 3) {
    // 針彈（朝 +x）
    const L = 15;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(L, 0);
    g.lineTo(-L * 0.6, -2.8);
    g.lineTo(-L * 0.85, 0);
    g.lineTo(-L * 0.6, 2.8);
    g.closePath();
    g.fill();
    outline();
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(L * 0.8, 0);
    g.lineTo(-L * 0.4, -1.1);
    g.lineTo(-L * 0.4, 1.1);
    g.closePath();
    g.fill();
  } else if (type === 4) {
    // 菱形苦無
    const R = 7.5;
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(R, 0);
    g.lineTo(0, -R * 0.6);
    g.lineTo(-R * 0.8, 0);
    g.lineTo(0, R * 0.6);
    g.closePath();
    g.fill();
    outline();
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(R * 0.6, 0);
    g.lineTo(0, -R * 0.24);
    g.lineTo(-R * 0.4, 0);
    g.lineTo(0, R * 0.24);
    g.closePath();
    g.fill();
  } else {
    // 米粒彈
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(0, 0, 5.4, 3.2, 0, 0, TAU);
    g.fill();
    outline();
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(0.6, 0, 3, 1.5, 0, 0, TAU);
    g.fill();
  }
  return c;
}

export function ebSprite(type: number, color: number): HTMLCanvasElement {
  if (!ebCache[type]) ebCache[type] = [];
  let c = ebCache[type][color];
  if (!c) {
    c = buildEB(type, EB_COLORS[color % EB_COLORS.length]);
    ebCache[type][color] = c;
  }
  return c;
}

// ══════════════ port/008 血統的敵彈精靈（czEbSprite） ══════════════
// 008 的敵彈外觀與母專案**同名、不同實作**（來源：`port/008/src/game/render/sprites.ts` 的
// `ebSprite()` 與 `port/008/src/game/render/shapes.ts`）。三處硬差異，不可共用：
//   ① **type 語意相反**：008 的 `type 3` 是「球體（orb）」、母專案的 `type 3` 是「針彈」
//      → 這就是隕石雨（`cz_meteor` 發 type 3）在 SP 被畫成「一條線加一點」的根因
//      （2026-10-11 大爺回報「敵方子彈沒搬過來，子彈長得不一樣」）。
//   ② 七色表／七半徑表都不同（見下方常數；半徑同時是**碰撞半徑**）。
//   ③ 定向彈種不同：008 是 `{1,2,4,6}`、精靈設計為「彈頭朝上」→ 繪製時轉 `ang + π/2`；
//      母專案是 `{3,4,6}`、精靈設計為「朝 +x」→ 轉 `ang`。
// 精靈固定 48×48，繪製一律 `drawImage(spr, x-24, y-24)`。
// 由 `EBullet.cz` 旗標在生成與渲染時分流（見 `renderer.drawEnemyBullets`）。
export const CZ_EB_COLORS = ["#ff3355", "#ffb02e", "#ffe66b", "#4dff9d", "#3de0ff", "#8a7bff", "#ff6bd6"];
/** 008 的敵彈半徑（**碰撞用**；與母專案差很多，例如 type 5 是 7 vs 16、type 2 是 3 vs 10）。 */
export const CZ_EB_R = [5, 4, 3, 9, 5, 7, 5];
export const CZ_EB_SIZE = 48;
/** 008 的定向彈種（旋轉量為 `ang + π/2`）。 */
export const CZ_DIR_EB = new Set([1, 2, 4, 6]);

/** 008 `shapes.ts` 的 `rgba()`：接受 `#rgb`／`#rrggbb`／`rgb()`／`rgba()`。 */
function czRgba(color: string, a: number): string {
  if (color[0] === "#") {
    let h = color.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const m = color.match(/[\d.]+/g);
  if (m && m.length >= 3) return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
  return color;
}

type CzStops = [number, string][];

/** 008 `shapes.ts` 的 `halo()`：橢圓光暈（以中心為原點）。 */
function czHalo(g: CanvasRenderingContext2D, color: string, rx: number, ry: number, a = 1) {
  g.save();
  g.scale(1, ry / rx);
  const grd = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  grd.addColorStop(0, czRgba(color, 0.85 * a));
  grd.addColorStop(0.45, czRgba(color, 0.3 * a));
  grd.addColorStop(1, czRgba(color, 0));
  g.fillStyle = grd;
  g.beginPath();
  g.arc(0, 0, rx, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** 008 `shapes.ts` 的 `needle()`：針形（彈頭朝上）。 */
function czNeedle(g: CanvasRenderingContext2D, w: number, h: number, stops: CzStops) {
  const grd = g.createLinearGradient(0, -h / 2, 0, h / 2);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(0, -h / 2);
  g.bezierCurveTo(w * 0.55, -h * 0.25, w * 0.5, h * 0.2, 0, h / 2);
  g.bezierCurveTo(-w * 0.5, h * 0.2, -w * 0.55, -h * 0.25, 0, -h / 2);
  g.fill();
}

/** 008 `shapes.ts` 的 `drop()`：火滴（圓頭朝上、尾朝下）。 */
function czDrop(g: CanvasRenderingContext2D, w: number, h: number, stops: CzStops) {
  const grd = g.createLinearGradient(0, -h / 2, 0, h / 2);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(0, h / 2);
  g.bezierCurveTo(-w * 0.62, h * 0.1, -w * 0.5, -h * 0.5, 0, -h / 2);
  g.bezierCurveTo(w * 0.5, -h * 0.5, w * 0.62, h * 0.1, 0, h / 2);
  g.fill();
}

/** 008 `shapes.ts` 的 `orb()`：徑向漸層球體。 */
function czOrb(g: CanvasRenderingContext2D, r: number, stops: CzStops) {
  const grd = g.createRadialGradient(-r * 0.25, -r * 0.25, 0, 0, 0, r);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.fill();
}

const czEbCache = new Map<number, HTMLCanvasElement>();

/** port/008 血統的敵彈精靈（逐字對齊來源 `ebSprite()`；7 型 × 7 色）。 */
export function czEbSprite(type: number, color: number): HTMLCanvasElement {
  const key = type * 10 + color;
  let c = czEbCache.get(key);
  if (c) return c;
  c = makeCanvas(CZ_EB_SIZE, CZ_EB_SIZE);
  const g = c.getContext("2d")!;
  const col = CZ_EB_COLORS[color % 7];
  g.translate(CZ_EB_SIZE / 2, CZ_EB_SIZE / 2);
  czHalo(g, col, 17, 17, 0.75);
  const r = CZ_EB_R[type % 7];
  // 註：下面兩行在 008 來源即存在（case 0/3 會覆寫成白線）；雖不影響畫面，
  // 但 _cz_eb_test 以「繪圖指令序列逐字對帳」，不可刪。
  g.lineWidth = 2;
  g.strokeStyle = "#1a0a14";
  switch (type % 7) {
    case 0:
    case 3:
      czOrb(g, r + 1, [[0, "#ffffff"], [0.45, col], [1, czRgba(col, 0.95)]]);
      g.beginPath();
      g.arc(0, 0, r + 1, 0, 6.3);
      g.strokeStyle = czRgba("#ffffff", 0.9);
      g.lineWidth = 1.4;
      g.stroke();
      break;
    case 1:
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(0, 0, r - 0.5, r * 1.9, 0, 0, 6.3);
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.ellipse(0, -1, r * 0.4, r * 1.2, 0, 0, 6.3);
      g.fill();
      break;
    case 2:
      czNeedle(g, r * 2.2, r * 7, [[0, "#fff"], [0.5, col], [1, czRgba(col, 0.5)]]);
      break;
    case 4:
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, -r * 1.5);
      g.lineTo(r, 0);
      g.lineTo(0, r * 1.5);
      g.lineTo(-r, 0);
      g.closePath();
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(0, -r * 0.8);
      g.lineTo(r * 0.4, 0);
      g.lineTo(0, r * 0.8);
      g.lineTo(-r * 0.4, 0);
      g.closePath();
      g.fill();
      break;
    case 5:
      g.fillStyle = col;
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 - Math.PI / 2;
        const rr = i % 2 ? r * 0.45 : r * 1.25;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(0, 0, r * 0.38, 0, 6.3);
      g.fill();
      break;
    default:
      czDrop(g, r * 1.6, r * 3.2, [[0, "#fff"], [0.45, col], [1, czRgba(col, 0.6)]]);
  }
  czEbCache.set(key, c);
  return c;
}

// ---------------- 我方子彈精靈（朝上；additive 疊加） ----------------
export interface PBStyle {
  spr: HTMLCanvasElement;
  dir: boolean; // 是否依速度方向旋轉
  spin: boolean;
  // 顯示邏輯寬高：精靈本體 + 光暈留白（pad=12），物理 canvas 為 2× 此值。
  // 來源 cf5 pbStyle 的 cw/ch 即此值；dst 既有 mk() 精靈無留白，dispW=canvas 物理寬。
  dispW?: number;
  dispH?: number;
}
const pbStyles: PBStyle[] = [];
const extCache = new Map<number, PBStyle>();

function mk(w: number, h: number, fn: (g: CanvasRenderingContext2D, w: number, h: number) => void, dir = true, spin = false): PBStyle {
  const c = makeCanvas(w, h);
  const g = c.getContext("2d")!;
  g.translate(w / 2, h / 2);
  fn(g, w, h);
  return { spr: c, dir, spin };
}

function teardrop(g: CanvasRenderingContext2D, len: number, wd: number, c0: string, c1: string, c2: string) {
  const grad = g.createLinearGradient(0, len / 2, 0, -len / 2);
  grad.addColorStop(0, c2);
  grad.addColorStop(0.5, c1);
  grad.addColorStop(1, c0);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.bezierCurveTo(wd, -len * 0.15, wd * 0.9, len * 0.3, 0, len / 2);
  g.bezierCurveTo(-wd * 0.9, len * 0.3, -wd, -len * 0.15, 0, -len / 2);
  g.fill();
}

function needle(g: CanvasRenderingContext2D, len: number, wd: number, core: string, edge: string) {
  const grad = g.createLinearGradient(0, len / 2, 0, -len / 2);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.35, edge);
  grad.addColorStop(1, core);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.lineTo(wd, len * 0.1);
  g.lineTo(0, len / 2);
  g.lineTo(-wd, len * 0.1);
  g.closePath();
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.lineTo(wd * 0.35, len * 0.05);
  g.lineTo(-wd * 0.35, len * 0.05);
  g.closePath();
  g.fill();
}

function crescent(g: CanvasRenderingContext2D, R: number, thick: number, c1: string, c2: string) {
  const grad = g.createRadialGradient(0, 0, R - thick, 0, 0, R + 2);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, R, Math.PI * 1.08, Math.PI * 1.92);
  g.arc(0, R * 0.42, R - thick * 0.2, Math.PI * 1.9, Math.PI * 1.1, true);
  g.closePath();
  g.fill();
}

function orb(g: CanvasRenderingContext2D, r: number, c0: string, c1: string) {
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
  grad.addColorStop(0, c0);
  grad.addColorStop(0.45, c1);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.fill();
}

// ── port/015《星詠序曲》的子彈繪圖工具（逐行搬自 `port/015/src/game/render/sprites.ts`）──
//  與上面 SP 舊版的差別見 `buildPB()` 的註解。名稱加 015 後綴避免與舊 helper 撞名
//  （舊的 teardrop／needle／crescent／orb 仍保留：其它批次或日後微調還會用到）。
const lgv015 = (c: CanvasRenderingContext2D, y0: number, y1: number, stops: [number, string][]) => {
  const g = c.createLinearGradient(0, y0, 0, y1);
  for (const [o, s] of stops) g.addColorStop(o, s);
  return g;
};
/** 橢圓光暈：以子彈長寬比拉伸的徑向漸層（細長彈才有包覆感，不會變成一顆圓球）。 */
const halo015 = (c: CanvasRenderingContext2D, w: number, h: number, col: string, a = 0.5) => {
  c.save();
  c.scale(1, h / w);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.fillRect(-w / 2, -w / 2, w, w);
  c.restore();
};
/** 水滴彈體：三段漸層（白頭 → 主色 → 深尾），肩部比 SP 舊版更飽滿。 */
const drop015 = (c: CanvasRenderingContext2D, w: number, h: number, st: [number, string][]) => {
  c.beginPath();
  c.moveTo(0, -h / 2);
  c.bezierCurveTo(w * 0.75, -h * 0.1, w * 0.55, h * 0.5, 0, h / 2);
  c.bezierCurveTo(-w * 0.55, h * 0.5, -w * 0.75, -h * 0.1, 0, -h / 2);
  c.fillStyle = lgv015(c, -h / 2, h / 2, st);
  c.fill();
};
/** 光矛：尖端在 -h/2，尾端收在 h/2。 */
const needle015 = (c: CanvasRenderingContext2D, w: number, h: number, c0: string, c1: string) => {
  c.beginPath();
  c.moveTo(0, -h / 2);
  c.quadraticCurveTo(w * 0.62, -h * 0.05, w * 0.3, h / 2);
  c.lineTo(-w * 0.3, h / 2);
  c.quadraticCurveTo(-w * 0.62, -h * 0.05, 0, -h / 2);
  c.fillStyle = lgv015(c, -h / 2, h / 2, [[0, c0], [1, c1]]);
  c.fill();
};
/** 新月刃：上緣是弧、下緣是內凹弧。 */
const moon015 = (c: CanvasRenderingContext2D, w: number, h: number, c0: string, c1: string) => {
  c.beginPath();
  c.moveTo(-w / 2, h / 2);
  c.quadraticCurveTo(0, -h * 0.9, w / 2, h / 2);
  c.quadraticCurveTo(0, -h * 0.1, -w / 2, h / 2);
  c.fillStyle = lgv015(c, -h / 2, h / 2, [[0, c0], [1, c1]]);
  c.fill();
};
/** 實心球核心：`#fff → 主色`，**到半徑處仍是實色**（邊緣明確，才有「芯」）。 */
const orb015 = (c: CanvasRenderingContext2D, r: number, c0: string, c1: string) => {
  const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fill();
};

function buildPB() {
  // ══════════════════════════════════════════════════════════════════════════
  // 我方子彈樣式 0~22 —— 2026-10-20 改為 **port/015《星詠序曲》的繪法**
  //
  // 大爺：「015 的子彈比較有質感，參考一下 015 的子彈修改 SP 的子彈輪廓」。
  // 對帳後確認 015 的 `BASE`（23 種）與 SP 的 `pbStyles`（0~22）**是同一套家族的
  // 後期修訂版**：寬高逐一相同、角色一一對應，只差在畫法。差別只有三點：
  //   ① 015 每一顆都先鋪一層 **橢圓光暈**（`halo`，隨子彈長寬比拉伸）——
  //      SP 原本用圓形 `orb`，細長彈（光矛／針）的光暈會變成一顆圓球掛在腰上。
  //   ② 015 的核心 `orb` **邊緣是實色**（`#fff → 色`，到半徑處才收），
  //      SP 的是 `色 → 透明`，整顆糊成一團、沒有「芯」。
  //   ③ 015 的彈體漸層是三段（白頭 → 主色 → 深尾），SP 是兩段。
  // 尺寸完全不變 → 顯示大小、命中感、效能都不受影響（純換皮）。
  // ══════════════════════════════════════════════════════════════════════════
  // 0 赤鴉：焰羽
  pbStyles[0] = mk(26, 46, (g) => {
    halo015(g, 26, 46, "#ff9a3a");
    drop015(g, 14, 40, [[0, "#ffffff"], [0.5, "#ffa53a"], [1, "#ff3a2a"]]);
  });
  // 1 鳳凰火球（大）
  pbStyles[1] = mk(56, 80, (g) => {
    halo015(g, 56, 80, "#ffd25a", 0.55);
    drop015(g, 34, 70, [[0, "#fff6c8"], [0.5, "#ffb13b"], [1, "#ff4a2a"]]);
  });
  // 2 餘燼火星
  pbStyles[2] = mk(18, 18, (g) => {
    halo015(g, 18, 18, "#ffb13b");
    orb015(g, 5, "#fff3b0", "#ff8a2a");
  }, false);
  // 3 蒼槍：光矛
  pbStyles[3] = mk(20, 80, (g) => {
    halo015(g, 20, 80, "#46b8ff", 0.45);
    needle015(g, 8, 76, "#ffffff", "#4aa8ff");
  });
  // 4 側翼細矛
  pbStyles[4] = mk(14, 52, (g) => needle015(g, 5, 50, "#ffffff", "#8fd0ff"));
  // 5 翠嵐：風刃
  pbStyles[5] = mk(56, 40, (g) => {
    halo015(g, 56, 40, "#3dff9a", 0.3);
    moon015(g, 52, 32, "#ffffff", "#2fd884");
  });
  // 6 氣旋
  pbStyles[6] = mk(26, 26, (g) => {
    orb015(g, 11, "#ffffff", "#8fffc8");
    g.strokeStyle = "#ffffff";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, 7, 0.3, 3);
    g.stroke();
  }, false, true);
  // 7 紫電：電弧彈
  pbStyles[7] = mk(18, 34, (g) => {
    halo015(g, 18, 34, "#a35cff");
    needle015(g, 8, 30, "#fff3a0", "#a35cff");
  });
  // 8 極性雷彈
  pbStyles[8] = mk(30, 30, (g) => {
    orb015(g, 13, "#ffffff", "#c9a8ff");
    g.strokeStyle = "#ffe14a";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-6, -8);
    g.lineTo(1, -1);
    g.lineTo(-2, 1);
    g.lineTo(6, 9);
    g.stroke();
  }, false, true);
  // 9 玄影：暗物質彈
  pbStyles[9] = mk(60, 60, (g) => {
    halo015(g, 60, 60, "#9a4aff", 0.6);
    orb015(g, 14, "#000000", "#1a0030");
    g.strokeStyle = "#c58bff";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(0, 0, 20, 0.3, 2.3);
    g.stroke();
    g.beginPath();
    g.arc(0, 0, 20, 3.5, 5.5);
    g.stroke();
  }, false, true);
  // 10 暗影針
  pbStyles[10] = mk(14, 40, (g) => needle015(g, 6, 38, "#e0c8ff", "#8a3dff"));
  // 11 星輝：稜鏡脈衝
  pbStyles[11] = mk(18, 36, (g) => {
    g.fillStyle = "#4aa8ff";
    g.beginPath();
    g.moveTo(0, -17);
    g.lineTo(8, 0);
    g.lineTo(0, 17);
    g.lineTo(-8, 0);
    g.closePath();
    g.fill();
    g.fillStyle = "#cfeaff";
    g.beginPath();
    g.moveTo(0, -10);
    g.lineTo(4, 0);
    g.lineTo(0, 10);
    g.lineTo(-4, 0);
    g.closePath();
    g.fill();
  });
  // 12 追蹤微型飛彈（白彈身＋青彈頭＋橙色尾焰）
  pbStyles[12] = mk(18, 40, (g) => {
    halo015(g, 18, 40, "#ffb13b", 0.3);
    g.save();
    g.translate(0, 11);
    drop015(g, 9, 16, [[0, "#fff3b0"], [0.5, "#ffb13b"], [1, "#ff3a2a"]]);
    g.restore();
    g.fillStyle = "#ffffff";
    g.fillRect(-3, -14, 6, 22);
    g.fillStyle = "#46e6ff";
    g.beginPath();
    g.moveTo(0, -20);
    g.lineTo(4, -12);
    g.lineTo(-4, -12);
    g.closePath();
    g.fill();
  });
  // 13 機神加特林
  pbStyles[13] = mk(16, 46, (g) => {
    halo015(g, 16, 46, "#ffb13b", 0.4);
    needle015(g, 6, 44, "#fff3b0", "#ff9a2a");
  });
  // 14 肩砲火箭（白彈身＋橙彈頭＋尾焰）
  pbStyles[14] = mk(30, 60, (g) => {
    halo015(g, 30, 60, "#ffb13b", 0.35);
    g.save();
    g.translate(0, 17);
    drop015(g, 14, 24, [[0, "#fff3b0"], [0.5, "#ffb13b"], [1, "#ff3a2a"]]);
    g.restore();
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.roundRect(-5, -20, 10, 30, 4);
    g.fill();
    g.fillStyle = "#ff8a2a";
    g.beginPath();
    g.moveTo(0, -28);
    g.lineTo(6, -18);
    g.lineTo(-6, -18);
    g.closePath();
    g.fill();
  });
  // 15 折射稜鏡彈
  pbStyles[15] = mk(18, 18, (g) => {
    halo015(g, 18, 18, "#7ae8ff", 0.45);
    orb015(g, 7, "#ffffff", "#7ae8ff");
  }, false, true);
  // 16 僚機彈
  pbStyles[16] = mk(12, 26, (g) => needle015(g, 5, 24, "#ffffff", "#a8d8ff"));
  // 17 方舟曳光彈
  pbStyles[17] = mk(14, 40, (g) => {
    halo015(g, 14, 40, "#ffd25a", 0.4);
    needle015(g, 5, 38, "#ffffff", "#ffc23a");
  });
  // 18 鳳翼弧焰
  pbStyles[18] = mk(70, 46, (g) => {
    halo015(g, 70, 46, "#ffb13b", 0.35);
    moon015(g, 66, 40, "#fff3b0", "#ff8a2a");
  });
  // 19 大型火球
  pbStyles[19] = mk(70, 70, (g) => {
    halo015(g, 70, 70, "#ffb13b", 0.5);
    orb015(g, 24, "#fff3b0", "#ff8a2a");
  }, false, true);
  // 20 藍色雷球（Volt 落雷小彈）
  pbStyles[20] = mk(22, 22, (g) => {
    halo015(g, 22, 22, "#fff3b0");
    orb015(g, 8, "#ffffff", "#ffe27a");
  }, false, true);
  // 21 翠龍風刃
  pbStyles[21] = mk(40, 28, (g) => moon015(g, 38, 24, "#ffffff", "#aaf5d0"));
  // 22 逆轉紫雷彈
  pbStyles[22] = mk(20, 32, (g) => {
    halo015(g, 20, 32, "#9a5cff");
    needle015(g, 9, 28, "#e8d6ff", "#8a3dff");
  });
}

// 擴充精靈預繪倍率：對齊來源 cf5 SPR_RES=2（2× canvas + shadowBlur 不裁切→柔邊）
// dst 原本 1×，glowOn(glowSet) 的 shadowBlur 只有幾 px、被 canvas 邊裁掉→方角硬邊。
const SPR_RES_EXT = 2;
const SPR_PAD = 12; // 光暈留白（對齊來源 cf5 pad=12）
export function pbStyle(i: number): PBStyle {
  if (!pbStyles.length) buildPB();
  if (i >= EXT_BASE) {
    const ext = extCache.get(i);
    if (ext) return ext;
    const e = EXT_STYLES.find((q) => q.id === i);
    if (!e) return pbStyle(0);
    // 照來源 cf5：cw = w + 2*pad，物理 canvas = cw*SPR_RES，scale(SPR_RES)、translate(cw/2, ch/2)
    const cw = e.w + SPR_PAD * 2;
    const ch = e.h + SPR_PAD * 2;
    const c = makeCanvas(cw * SPR_RES_EXT, ch * SPR_RES_EXT);
    const g = c.getContext("2d")!;
    g.scale(SPR_RES_EXT, SPR_RES_EXT);
    g.translate(cw / 2, ch / 2);
    e.draw(g);
    // dir/spin 由樣式自行宣告（未宣告＝dir:true/spin:false，與既有 23~26 一致）
    const s: PBStyle = { spr: c, dir: e.dir ?? true, spin: e.spin ?? false, dispW: cw, dispH: ch };
    extCache.set(i, s);
    return s;
  }
  return pbStyles[i] || pbStyles[0];
}

/** 在目前合成模式下畫一顆發光球（來源 port/011 sprites.ts 逐行搬運）。 */
export function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a = 1) {
  const pa = ctx.globalAlpha;
  ctx.globalAlpha = pa * Math.max(0, Math.min(1, a));
  ctx.drawImage(glow(color, 64), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = pa;
}

/**
 * 星紋天域（port/011，TT 六台）自訂我方子彈樣式索引。
 * 實際樣式掛在 `pbStylesExt.ts` 的 `EXT_BASE_TT`（=231）+ n，見該檔尾端。
 * 來源自身的 base 為 170（`EXT_BASE_SZ`）；dst 另開 231 槽避開既有 +0~+41 與各批次。
 */
export const SX = { FEATHER: 0, LANCE: 1, WAVE: 2, EMBER: 3, SHELL: 4, MISSILE: 5, PALE: 6, CRESCENT: 7, SHARD: 8, MOONNEEDLE: 9, STROKE: 10, BLOB: 11, NEEDLE: 12, PETAL: 13, PINK: 14, GOLD: 15 };

// ===== src\game\render\shipDrawPLKaleido.ts =====
// 萬象・極光：長耳式跳躍機。mode 0 常態 / 1 彈力 / 2 複製 / 3 增幅 / 4 全相覺醒
// 幾何依 ctxkal.txt（spshooter 兔耳機體）轉為 SP 固定座標：hw=hh=36，乘 grow 保留進化放大
// 動畫時基 = 來源 Date.now()*0.0024 → tt = o.t*2.4（同節奏）
import { TAU } from "../constants";
import type { ShipDrawOpts } from "../port/plShipUtil";
import { drawGear, fillPoly, flame, lin, mirror, rad } from "../port/plShipUtil";

const HW = 36;
const HH = 36;

// 翼面輪廓線：SP 機體的統一慣例是「每個填色面都補一圈深色描邊」（母專案 shipDrawA/B 的 OUT、
// vesper 的 #0c0620、shipUtil.fillPoly 預設 rgba(8,4,10,.85) 皆是深色）。
// 本機的長耳翼／可動耳／跳躍翼／尾翼原本只 fill() 沒有描邊 → 和其他機體擺在一起輪廓感明顯不足。
// 色調取冷藍黑（專案既有色 #071225），與本機 cyan／白配色一致。
const OUT = "#c7d2e5";
const OUT2 = "#374255";

// 機體：中央流線機身＋上耳翼＋下跳躍翼＋可動耳翼＋核心與雙引擎
function shipBody(ctx: CanvasRenderingContext2D, o: ShipDrawOpts, grow: number) {
  const t = o.t;
  const m = o.mode ?? 0;
  const tt = t * 2.4;
  const hw = HW * grow;
  const hh = HH * grow;
  const pulse = Math.sin(tt * 3.6) * 0.5 + 0.5;
  const pulseFast = Math.sin(tt * 7.5) * 0.5 + 0.5;
  const earMove = Math.sin(tt * 2.1) * 0.045;
  const hover = Math.sin(tt * 2.8) * 0.012;
  const corePulse = 0.9 + Math.sin(tt * 4.6) * 0.12;

  // 1. 流線中央機體
  fillPoly(
    ctx,
    [
      [0, -hh * 1.08],
      [-hw * 0.18, -hh * 0.78],
      [-hw * 0.3, -hh * 0.25],
      [-hw * 0.22, hh * 0.22],
      [-hw * 0.14, hh * 0.72],
      [0, hh * 0.94],
      [hw * 0.14, hh * 0.72],
      [hw * 0.22, hh * 0.22],
      [hw * 0.3, -hh * 0.25],
      [hw * 0.18, -hh * 0.78],
    ],
    lin(ctx, 0, -hh * 1.1, 0, hh * 0.9, [
      [0, "#f9ffff"],
      [0.2, "#d8f2f4"],
      [0.43, "#789ca6"],
      [0.68, "#273d4c"],
      [0.88, "#101d2a"],
      [1, "#07111b"],
    ]),
  );
  // 機身發光輪廓（來源 shadowBlur=9）
  ctx.save();
  ctx.shadowColor = "#69d9ed";
  ctx.shadowBlur = 9;
  ctx.strokeStyle = "rgba(223,252,255,0.72)";
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(0, -hh * 1.08);
  ctx.lineTo(-hw * 0.18, -hh * 0.78);
  ctx.lineTo(-hw * 0.3, -hh * 0.25);
  ctx.lineTo(-hw * 0.22, hh * 0.22);
  ctx.lineTo(-hw * 0.14, hh * 0.72);
  ctx.lineTo(0, hh * 0.94);
  ctx.lineTo(hw * 0.14, hh * 0.72);
  ctx.lineTo(hw * 0.22, hh * 0.22);
  ctx.lineTo(hw * 0.3, -hh * 0.25);
  ctx.lineTo(hw * 0.18, -hh * 0.78);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // 2. 上耳翼（長耳式主翼）
  const earGrad = lin(ctx, 0, -hh * 0.7, 0, hh * 0.3, [
    [0, "#f7ffff"],
    [0.35, "#b5e3e8"],
    [0.7, "#507b89"],
    [1, "#172a38"],
  ]);
  mirror(ctx, () => {
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.moveTo(hw * 0.18, -hh * 0.42);
    ctx.quadraticCurveTo(hw * 0.34, -hh * 0.85, hw * 0.27, -hh * 1.38);
    ctx.lineTo(hw * 1.32, -hh * 0.8);
    ctx.lineTo(hw * 0.53, -hh * 0.94);
    ctx.lineTo(hw * 0.42, -hh * 0.35);
    ctx.lineTo(hw * 0.27, hh * 0.02);
    ctx.closePath();
    ctx.fill();
    // 翼面輪廓線（兩側長耳翼；原本缺，補上後輪廓才和其他機體一致）
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.15;
    ctx.lineJoin = "round";
    ctx.stroke();
    // 耳翼內側光帶
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hw * 0.31, -hh * 1.38);
    ctx.lineTo(hw * 0.4, -hh * 0.5);
    ctx.lineTo(hw * 0.31, -hh * 0.12);
    ctx.stroke();
  });

  // 3. 可動長耳翼（隨 earMove 擺動）
  mirror(ctx, () => {
    ctx.save();
    ctx.translate(hw * 0.34, -hh * 0.32);
    ctx.rotate(earMove);
    ctx.fillStyle = "#172b39";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(hw * 0.34, -hh * 0.46);
    ctx.lineTo(hw * 0.43, -hh * 0.67);
    ctx.lineTo(hw * 0.27, -hh * 0.6);
    ctx.lineTo(hw * 0.08, -hh * 0.22);
    ctx.closePath();
    ctx.fill();
    // 可動長耳輪廓線（前方那兩根白兔耳；原本缺）
    ctx.strokeStyle = OUT2;
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.strokeStyle = "rgba(91,225,239,0.82)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hw * 0.03, -hh * 0.06);
    ctx.lineTo(hw * 0.36, -hh * 0.56);
    ctx.stroke();
    ctx.restore();
  });

  // 4. 中央透明駕駛艙
  ctx.save();
  ctx.fillStyle = lin(ctx, 0, -hh * 0.82, 0, -hh * 0.18, [
    [0, "#ffffff"],
    [0.3, "#d8ffff"],
    [0.62, "#6bd5e1"],
    [1, "#173c4c"],
  ]);
  ctx.shadowColor = "#68ddec";
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, -hh * 0.88);
  ctx.lineTo(hw * 0.13, -hh * 0.61);
  ctx.lineTo(hw * 0.15, -hh * 0.28);
  ctx.lineTo(0, -hh * 0.13);
  ctx.lineTo(-hw * 0.15, -hh * 0.28);
  ctx.lineTo(-hw * 0.13, -hh * 0.61);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-hw * 0.07, -hh * 0.67);
  ctx.lineTo(hw * 0.07, -hh * 0.67);
  ctx.stroke();
  ctx.restore();

  // 5. 兔躍核心（hover 浮動＋脈動）
  const coreY = hh * 0.04 + hover * hh;
  const coreSize = hw * (0.085 + pulse * 0.044);
  ctx.save();
  ctx.fillStyle = "#f4ffff";
  ctx.shadowColor = "#ff8d83";
  ctx.shadowBlur = 24;
  ctx.beginPath();
  ctx.arc(0, coreY, coreSize * corePulse, 0, TAU);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,143,132,0.8)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, coreY, coreSize * 1.8, 0, TAU);
  ctx.stroke();
  ctx.restore();

  // 6. 下跳躍翼＋珊瑚色細線
  const leapGrad = lin(ctx, 0, 0, 0, hh * 0.45, [
    [0, "#476b7a"],
    [0.55, "#243b4b"],
    [1, "#0c1723"],
  ]);
  mirror(ctx, () => {
    ctx.fillStyle = leapGrad;
    ctx.beginPath();
    ctx.moveTo(hw * 0.2, hh * 0.02);
    ctx.lineTo(hw * 1.3, hh * 0.19);
    ctx.lineTo(hw * 1.03, hh * 0.43);
    ctx.lineTo(hw * 0.62, hh * 0.38);
    ctx.lineTo(hw * 0.3, hh * 0.22);
    ctx.closePath();
    ctx.fill();
    // 跳躍翼輪廓線（兩側下翼；原本缺）
    ctx.strokeStyle = OUT2;
    ctx.lineWidth = 1.3;
    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,133,120,0.72)";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(hw * 0.28, hh * 0.17);
    ctx.lineTo(hw * 0.96, hh * 0.32);
    ctx.stroke();
    // m1/m4 彈簧圈：上耳翼尖端震動線（取代舊翼面彈簧）
    if (m === 1 || m === 4) {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const sx = hw * 1.0;
      for (let i = 0; i < 6; i++)
        ctx.lineTo(sx + (i % 2 ? 3 : -3), -hh * 0.85 - i * 2.6 + Math.sin(t * 12) * 0.8);
      ctx.stroke();
    }
    // m3/m4 增幅尖刺：跳躍翼外緣白色三角（取代舊翼面尖刺）
    if (m === 3 || m === 4) {
      ctx.fillStyle = "#ffffff";
      for (let i = 0; i < 3; i++) {
        const bx = hw * (1.0 + i * 0.14);
        const by = hh * (0.16 + i * 0.06);
        ctx.beginPath();
        ctx.moveTo(bx - 2, by - 3);
        ctx.lineTo(bx + 5, by);
        ctx.lineTo(bx - 2, by + 3);
        ctx.closePath();
        ctx.fill();
      }
    }
  });

  // 7. 下方高速尾翼
  mirror(ctx, () => {
    ctx.fillStyle = "#142431";
    ctx.beginPath();
    ctx.moveTo(hw * 0.12, hh * 0.38);
    ctx.lineTo(hw * 0.32, hh * 0.72);
    ctx.lineTo(hw * 0.16, hh * 0.62);
    ctx.lineTo(hw * 0.05, hh * 0.42);
    ctx.closePath();
    ctx.fill();
    // 尾翼輪廓線（原本缺）
    ctx.strokeStyle = OUT2;
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    ctx.stroke();
  });

  // 8. 能量軌跡（脈動透明度）
  ctx.save();
  ctx.strokeStyle = `rgba(109,232,245,${(0.45 + pulseFast * 0.4).toFixed(3)})`;
  ctx.lineWidth = 1.4;
  ctx.shadowColor = "#65e3f1";
  ctx.shadowBlur = 6;
  mirror(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(hw * 0.53, hh * 0.37);
    ctx.lineTo(hw * 0.9, hh * 0.44);
    ctx.stroke();
  });
  ctx.restore();

  // 9. 雙引擎（機尾主引擎＋跳躍翼端副引擎）
  const enginePulse = 0.78 + Math.sin(tt * 5.4) * 0.15;
  ctx.save();
  ctx.fillStyle = "#efffff";
  ctx.shadowColor = "#ff8d83";
  ctx.shadowBlur = 9;
  mirror(ctx, () => {
    ctx.beginPath();
    ctx.arc(hw * 0.13, hh * 0.8, hw * 0.06 * enginePulse, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hw * 0.36, hh * 0.38, hw * 0.06 * enginePulse, 0, TAU);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(105,220,235,0.7)";
  ctx.lineWidth = 0.9;
  mirror(ctx, () => {
    ctx.beginPath();
    ctx.arc(hw * 0.13, hh * 0.8, hw * 0.1, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(hw * 0.36, hh * 0.38, hw * 0.1, 0, TAU);
    ctx.stroke();
  });
  ctx.restore();

  // 10. 極細外輪廓
  ctx.strokeStyle = "rgba(230,252,255,0.42)";
  ctx.lineWidth = 0.7;
  mirror(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(hw * 0.18, -hh * 0.78);
    ctx.lineTo(hw * 0.3, -hh * 0.25);
    ctx.stroke();
  });
}

export function drawKaleido(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const t = o.t;
  const m = Math.max(0, Math.min(4, (o.mode ?? 0) | 0));
  const grow = 1 + o.tier * 0.06 + (m === 3 || m === 4 ? 0.08 : 0);
  drawGear(ctx, o, false);
  // 稜鏡光環
  if (o.tier >= 3 || m === 4) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const cols = ["#ff4f9a", "#ffd23f", "#3dffb0", "#38e8ff", "#9b5cff"];
    cols.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, 50 + i * 2.2 + Math.sin(t * 3 + i) * 1.2, 0, TAU);
      ctx.stroke();
    });
    ctx.restore();
  }
  // 尾焰：雙噴（對應雙引擎位置）
  flame(ctx, -6, 32, 26, 4, o.thrust, t, "#ffffff", "#69d9ed");
  flame(ctx, 6, 32, 26, 4, o.thrust, t + 0.5, "#ffffff", "#ff8d83");
  // 複製：殘影（m2/m4，舊 if{} 保留，換新座標）
  if (m === 2 || m === 4) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.globalCompositeOperation = "lighter";
    for (const dx of [-24, 24]) {
      ctx.save();
      ctx.translate(dx + Math.sin(t * 6) * 1.5, 3);
      shipBody(ctx, { ...o, mode: 2 }, grow * 0.92);
      ctx.restore();
    }
    ctx.restore();
  }
  shipBody(ctx, o, grow);
  // 增幅光暈（m3/m4，舊 if{} 保留）
  if (m === 3 || m === 4) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = rad(ctx, 0, 0, 0, 58, [
      [0, "rgba(105,217,237,0.22)"],
      [1, "rgba(105,217,237,0)"],
    ]);
    ctx.beginPath();
    ctx.arc(0, 0, 58, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  drawGear(ctx, o, true);
}

// ===== src\game\render\pbStylesExt.ts =====
// 我方子彈擴充樣式（23 起）。draw(ctx) 以畫布中心為原點、彈頭朝上（-y）。
// 本檔自給自足、不 import 任何模組，方便整檔搬移。
type C = CanvasRenderingContext2D;
// 012 批次（B《破穹18翼》）的形狀庫：只給檔尾 EXT_BASE_012B 那 13 個樣式用。
import { drawShape as drawShape012, type ShapeKind as ShapeKind012 } from "./shapes012";
// 天門（gate）四神兵的光核要用「有白色熱核」的那版 glow（＝Claude 交付版）。
// 母專案 `./sprites` 的 glow 沒有熱核，用它畫出來的光核會暗一階。
import { glow as gateGlow } from "../shipPort012/gateKit";
// 016 批次（kr）18 個子彈樣式：整批定義在 pbStyles016.ts，檔尾 push 進 EXT_STYLES。
import { KR_STYLES } from "./pbStyles016";
export { EXT_BASE_KR } from "./pbStyles016";
/** 本檔自給自足（不 import constants）→ 本地定義圓周常數供各批次繪圖工具使用。 */
const TAU = Math.PI * 2;
export const EXT_BASE = 23;
/** 緋月異能戰線（zx / port/006）批次樣式槽：+107 起，避開既有 +0~+41。 */
export const EXT_BASE_ZX = 107;
/** 萬象・極光／晚星・天網／冴刃・凜（pl / port/005）批次樣式槽：+90 起，避開既有 +0~+41 與 zx +107~+114。 */
export const EXT_BASE_PL = 90;
/** 刻蝕時計（ar / port/004）批次樣式槽：+75 起，避開既有 +0~+41、sg +115~+125 與 pl +90~+106。 */
export const EXT_BASE_AR = 75;
/** 絲弦（sg / port/007）批次樣式槽：+115 起，避開既有 +0~+41、pl +90~+106 與 ar +75~+89。 */
/** 斬界戰姬（nx / port/001）批次樣式槽：+126 起。
 *  ⚠ 偏離 1007.md §3.2 的建議值（42）：該值絕對 id 會撞既有 EXT_BASE+19（=42）；
 *  42~64 已被既有 +0~+41 佔用（絕對 23~64），75~125 被 ar/pl/zx/sg 佔用 → 新血統一律配 126+。 */
export const EXT_BASE_NX = 126;
/** 星魄夜航（a / port/002）批次樣式槽：+133 起（nx +126~+132 之後）。 */
export const EXT_BASE_A = 133;
/** 刻印戰線（sv / port/003）批次樣式槽：+149 起（a +133~+148 之後）。 */
export const EXT_BASE_SV = 149;
/** 星燼曙約（sx / port/010）批次樣式槽：+157 起（sv +149~+156 之後）。
 *  來源 A 的自訂樣式是絕對 170~189 → 逐一對映到 +0~+18（offset = 來源 - 170）。 */
export const EXT_BASE_SX = 157;
export const EXT_BASE_SG = 115;

function glowOn(ctx: C, color: string, blur: number) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}
function glowOff(ctx: C) {
  ctx.shadowBlur = 0;
}
function lg(ctx: C, y0: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
function rg(ctx: C, r: number, stops: [number, string][]) {
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
function kite(ctx: C, w: number, h: number, c1: string, c2: string, glowC = c1) {
  glowOn(ctx, glowC, Math.min(w, h) * 0.9);
  ctx.fillStyle = lg(ctx, -h / 2, h / 2, [[0, "#fff"], [0.3, c1], [1, c2]]);
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h * 0.1);
  ctx.lineTo(0, h / 2);
  ctx.lineTo(-w / 2, h * 0.1);
  ctx.closePath();
  ctx.fill();
  glowOff(ctx);
  ctx.fillStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.32);
  ctx.lineTo(w * 0.14, h * 0.06);
  ctx.lineTo(0, h * 0.3);
  ctx.lineTo(-w * 0.14, h * 0.06);
  ctx.closePath();
  ctx.fill();
}
function orb(ctx: C, r: number, c1: string, c2: string) {
  glowOn(ctx, c1, r * 1.2);
  ctx.fillStyle = rg(ctx, r, [[0, "#fff"], [0.35, c1], [1, c2]]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  glowOff(ctx);
}
/** a 批次（port/002 星魂夜曲）子彈樣式的放射漸層球＝來源 pbStylesExt 的 orb(c,x,y,r,stops)（帶中心偏移）。 */
function aOrb(c: C, x: number, y: number, r: number, stops: [number, string][]) {
  c.fillStyle = cf5rg(c, 0, r, stops, x, y);
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}
// cf5 批次專用的漸層輔助（任意方向線性／雙半徑徑向，自包含不牽動上方 helper）
const cflg = (c: C, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) => {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
const cf5rg = (c: C, r0: number, r1: number, stops: [number, string][], x = 0, y = 0) => {
  const g = c.createRadialGradient(x, y, r0, x, y, r1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
/** zx（port/006）批次用：以原點為心的柔光暈（來源 pbStylesExt 的 halo） */
const halo = (x: C, r: number, col: string) => {
  const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, col);
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, r, 0, Math.PI * 2);
  x.fill();
};

/** 刃形幾何（新月迴旋刃）：色票參數化，供緋刃（kagari）與焰刃（homura）共用。 */
function drawBladeC(c: C, c1: string, c2: string, c3: string, glow: string, hi: string) {
  glowOn(c, glow, 12);
  const g = c.createLinearGradient(-16, -10, 16, 10);
  g.addColorStop(0, c1);
  g.addColorStop(0.55, c2);
  g.addColorStop(1, c3);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, 16, Math.PI * 0.95, Math.PI * 2.05, false);
  c.quadraticCurveTo(0, -3, -16, 1);
  c.closePath();
  c.fill();
  c.beginPath();
  c.arc(0, 0, 16, Math.PI * 0.05, Math.PI * 0.95, false);
  c.quadraticCurveTo(0, 5, 16, 1);
  c.closePath();
  c.fill();
  glowOff(c);
  c.strokeStyle = hi;
  c.lineWidth = 1.4;
  c.beginPath();
  c.arc(0, 0, 14, Math.PI * 1.1, Math.PI * 1.9);
  c.stroke();
}
/** 緋刃「新月迴旋刃」（+27 對齊／+37 自轉／+38 對齊＋自轉共用）。 */
function drawBlade(c: C) {
  drawBladeC(c, "#ff2a4d", "#ffffff", "#ff8aa0", "#ff2a4d", "rgba(255,255,255,0.85)");
}
/** 焰刃（homura 版三絕斬）：色系跟隨烈焰（橙紅／暖金），幾何同緋刃。
 *  ⚠ 2026-10-23 起 +39/+40 不再使用它（改成不畫本體），保留是為了別動到共用幾何；勿刪 drawBladeC。 */
function drawBladeFire(c: C) {
  drawBladeC(c, "#ff5a2e", "#fff0c0", "#ffc24a", "#ff5a2e", "rgba(255,240,200,0.9)");
}

// dir/spin：渲染旋轉模式（sprites.ts pbStyle 讀取，預設 dir ?? true / spin ?? false）。
//   dir=true,  spin=false → 對齊飛行方向（既有 +0~+26 全屬此類）
//   dir=false, spin=true  → 原地自轉 b.rot（迴旋刃／重力彈）
//   dir=true,  spin=true  → 對齊方向 ＋ 自轉疊加（來源 kind<20 且 spin!=0 的刃雨）
//   dir=false, spin=false → 完全不旋轉
// ⚠ 自轉樣式必須「明確寫 dir:false」，否則會吃到 dir 預設 true 而變成「對齊＋自轉」。
// ── pl（port/005）批次樣式繪製工具 ──
function haloGrad(ctx: C, r: number, c0: string, c1: string, c2: string) {
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, c0);
  g.addColorStop(0.45, c1);
  g.addColorStop(1, c2);
  return g;
}

/** 拳風：圓潤拳頭＋後方衝擊弧線 */
function drawFist(ctx: C, s: number) {
  const g = haloGrad(ctx, s * 0.62, "rgba(255,240,180,0.95)", "rgba(255,120,40,0.55)", "rgba(255,60,20,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.62, 0, Math.PI * 2);
  ctx.fill();
  // 後方衝擊弧
  ctx.lineCap = "round";
  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = `rgba(255,${190 - i * 40},${70 - i * 15},${0.85 - i * 0.22})`;
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.arc(0, s * (0.08 + i * 0.12), s * (0.32 + i * 0.08), Math.PI * 1.12, Math.PI * 1.88);
    ctx.stroke();
  }
  // 拳面：四指節 + 掌
  ctx.fillStyle = "#ffd23f";
  ctx.strokeStyle = "#7a2400";
  ctx.lineWidth = s * 0.04;
  const kr = s * 0.1;
  for (let i = -1.5; i <= 1.5; i++) {
    ctx.beginPath();
    ctx.arc(i * kr * 1.9, -s * 0.16, kr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.roundRect(-s * 0.2, -s * 0.12, s * 0.4, s * 0.3, s * 0.07);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff6d0";
  ctx.beginPath();
  ctx.arc(0, -s * 0.12, s * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

/** 新月斬波 */
function drawCrescent(ctx: C, w: number, h: number, c0: string, c1: string) {
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.shadowColor = c1;
  ctx.shadowBlur = h * 0.5;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-w / 2, h * 0.3);
  ctx.quadraticCurveTo(0, -h * 0.75, w / 2, h * 0.3);
  ctx.quadraticCurveTo(0, -h * 0.12, -w / 2, h * 0.3);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = Math.max(1, h * 0.04);
  ctx.beginPath();
  ctx.moveTo(-w * 0.46, h * 0.26);
  ctx.quadraticCurveTo(0, -h * 0.6, w * 0.46, h * 0.26);
  ctx.stroke();
}

function drawGravOrb(ctx: C, s: number) {
  const r = s * 0.46;
  ctx.fillStyle = haloGrad(ctx, s * 0.5, "rgba(46,230,200,0.5)", "rgba(46,230,200,0.18)", "rgba(46,230,200,0)");
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, "#02161c");
  g.addColorStop(0.55, "#06323a");
  g.addColorStop(1, "#2ee6c8");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#e6fffb";
  ctx.lineWidth = Math.max(1.2, s * 0.05);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(160,255,240,0.7)";
  ctx.lineWidth = Math.max(1, s * 0.03);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.15, r * 0.4, 0.5, 0, Math.PI * 2);
  ctx.stroke();
}

function drawCapsule(ctx: C, w: number, h: number, edge: string, core: string) {
  ctx.shadowColor = edge;
  ctx.shadowBlur = w * 0.9;
  ctx.fillStyle = edge;
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, w / 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.roundRect(-w * 0.2, -h * 0.42, w * 0.4, h * 0.84, w * 0.2);
  ctx.fill();
}

function drawBat(ctx: C, s: number) {
  ctx.fillStyle = haloGrad(ctx, s * 0.55, "rgba(255,60,90,0.5)", "rgba(200,20,60,0.2)", "rgba(200,20,60,0)");
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b3123a";
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = s * 0.04;
  for (const sg of [1, -1]) {
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.05);
    ctx.quadraticCurveTo(sg * s * 0.3, -s * 0.5, sg * s * 0.48, -s * 0.18);
    ctx.quadraticCurveTo(sg * s * 0.36, -s * 0.12, sg * s * 0.34, s * 0.08);
    ctx.quadraticCurveTo(sg * s * 0.22, -s * 0.02, sg * s * 0.14, s * 0.18);
    ctx.quadraticCurveTo(sg * s * 0.06, s * 0.08, 0, s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = "#2a0010";
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.1, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe36b";
  ctx.fillRect(-s * 0.06, -s * 0.05, s * 0.04, s * 0.04);
  ctx.fillRect(s * 0.02, -s * 0.05, s * 0.04, s * 0.04);
}

function drawMagic(ctx: C, w: number, h: number) {
  ctx.shadowColor = "#ff3a62";
  ctx.shadowBlur = w;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#fff2b8");
  g.addColorStop(0.35, "#ffb23a");
  g.addColorStop(1, "rgba(200,20,60,0.1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.quadraticCurveTo(w * 0.7, -h * 0.05, 0, h / 2);
  ctx.quadraticCurveTo(-w * 0.7, -h * 0.05, 0, -h / 2);
  ctx.fill();
}

function drawNeedle(ctx: C, w: number, h: number, edge: string) {
  ctx.shadowColor = edge;
  ctx.shadowBlur = w * 1.2;
  ctx.fillStyle = edge;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w / 2, h * 0.1);
  ctx.lineTo(0, h / 2);
  ctx.lineTo(-w / 2, h * 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.46);
  ctx.lineTo(w * 0.17, h * 0.06);
  ctx.lineTo(0, h * 0.4);
  ctx.lineTo(-w * 0.17, h * 0.06);
  ctx.closePath();
  ctx.fill();
}

function drawStar(ctx: C, s: number, edge: string, core: string, spikes = 4) {
  ctx.shadowColor = edge;
  ctx.shadowBlur = s * 0.4;
  const R = s * 0.5;
  const r = s * 0.17;
  ctx.fillStyle = edge;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const rr = i % 2 === 0 ? R : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.13, 0, Math.PI * 2);
  ctx.fill();
}

function drawDisc(ctx: C, s: number, spikes: boolean) {
  const r = s * 0.42;
  ctx.fillStyle = haloGrad(ctx, s * 0.5, "rgba(255,255,255,0.4)", "rgba(255,79,154,0.22)", "rgba(56,232,255,0)");
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
  ctx.fill();
  const cols = ["#ff4f9a", "#ffd23f", "#38e8ff", "#9b5cff"];
  const n = spikes ? 8 : 4;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = cols[i % 4];
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, (i * Math.PI * 2) / n, ((i + 1) * Math.PI * 2) / n);
    ctx.closePath();
    ctx.fill();
  }
  if (spikes) {
    ctx.fillStyle = "#fff";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a - 0.2) * r, Math.sin(a - 0.2) * r);
      ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 1.25);
      ctx.lineTo(Math.cos(a + 0.2) * r, Math.sin(a + 0.2) * r);
      ctx.fill();
    }
  }
  ctx.fillStyle = "#10101a";
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = s * 0.05;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2);
  ctx.stroke();
}

function drawGhostBlade(ctx: C, w: number, h: number) {
  ctx.shadowColor = "#9fd2ff";
  ctx.shadowBlur = w * 1.1;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.7, "#bfe3ff");
  g.addColorStop(1, "rgba(120,170,255,0.1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w * 0.42, -h * 0.2);
  ctx.lineTo(w * 0.3, h * 0.28);
  ctx.lineTo(0, h * 0.34);
  ctx.lineTo(-w * 0.3, h * 0.28);
  ctx.lineTo(-w * 0.42, -h * 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#4f7dff";
  ctx.fillRect(-w * 0.5, h * 0.3, w, h * 0.04);
  ctx.fillStyle = "#1c2a5e";
  ctx.fillRect(-w * 0.1, h * 0.34, w * 0.2, h * 0.16);
}

function drawStake(ctx: C, w: number, h: number) {
  ctx.shadowColor = "#ff3a62";
  ctx.shadowBlur = w * 0.9;
  const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#fff0b0");
  g.addColorStop(0.3, "#e0162f");
  g.addColorStop(1, "#4a0412");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.lineTo(w * 0.36, h * 0.12);
  ctx.lineTo(w * 0.5, h * 0.2);
  ctx.lineTo(w * 0.2, h * 0.5);
  ctx.lineTo(-w * 0.2, h * 0.5);
  ctx.lineTo(-w * 0.5, h * 0.2);
  ctx.lineTo(-w * 0.36, h * 0.12);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = w * 0.1;
  ctx.beginPath();
  ctx.moveTo(-w * 0.34, h * 0.18);
  ctx.lineTo(w * 0.34, h * 0.18);
  ctx.stroke();
}

function drawPetal(ctx: C, s: number) {
  ctx.shadowColor = "#ff8fc4";
  ctx.shadowBlur = s * 0.35;
  const g = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
  g.addColorStop(0, "#fff0f8");
  g.addColorStop(1, "#ff8fc4");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.5);
  ctx.bezierCurveTo(s * 0.55, -s * 0.25, s * 0.35, s * 0.35, 0, s * 0.5);
  ctx.bezierCurveTo(-s * 0.35, s * 0.35, -s * 0.55, -s * 0.25, 0, -s * 0.5);
  ctx.fill();
}

// ── ar（port/004 刻蝕時計）批次樣式繪製工具（逐行搬移來源 pbStylesExt，函式名加 ar 前綴避撞）──
function arFist(x: C, s: number, c1: string, c2: string) {
  x.save();
  x.scale(s, s);
  x.shadowColor = c1;
  x.shadowBlur = 14;
  // 護腕
  let g = x.createLinearGradient(0, 4, 0, 20);
  g.addColorStop(0, c2);
  g.addColorStop(1, "rgba(60,10,0,0.2)");
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(-9, 6); x.lineTo(9, 6); x.lineTo(6, 20); x.lineTo(-6, 20);
  x.closePath();
  x.fill();
  // 拳體
  g = x.createRadialGradient(-3, -8, 2, 0, -2, 18);
  g.addColorStop(0, "#fff7e0");
  g.addColorStop(0.35, c1);
  g.addColorStop(1, c2);
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(-12, 4);
  x.quadraticCurveTo(-15, -10, -6, -17);
  x.quadraticCurveTo(0, -20, 6, -17);
  x.quadraticCurveTo(15, -10, 12, 4);
  x.quadraticCurveTo(0, 9, -12, 4);
  x.fill();
  x.shadowBlur = 0;
  // 指節線
  x.strokeStyle = "rgba(90,20,0,0.65)";
  x.lineWidth = 1.4;
  for (let i = -1; i <= 1; i++) {
    x.beginPath();
    x.moveTo(i * 4.6, -16);
    x.lineTo(i * 4.2, -4);
    x.stroke();
  }
  x.fillStyle = "rgba(255,255,255,0.85)";
  for (let i = -1.5; i <= 1.5; i++) {
    x.beginPath();
    x.ellipse(i * 4.4, -15, 1.7, 2.4, 0, 0, TAU);
    x.fill();
  }
  x.restore();
}

/** 新月斬：兩端尖、內緣凹陷 */
function arSlash(x: C, w: number, h: number, c1: string, c2: string, thick = 0.5) {
  x.shadowColor = c1;
  x.shadowBlur = 14;
  const g = x.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.45, c1);
  g.addColorStop(1, c2);
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(-w / 2, h / 2);
  x.bezierCurveTo(-w * 0.42, -h * 0.55, w * 0.42, -h * 0.55, w / 2, h / 2);
  x.bezierCurveTo(w * 0.3, -h * (0.5 - thick * 0.4), -w * 0.3, -h * (0.5 - thick * 0.4), -w / 2, h / 2);
  x.fill();
  x.shadowBlur = 0;
  x.strokeStyle = "rgba(255,255,255,0.9)";
  x.lineWidth = 1.2;
  x.beginPath();
  x.moveTo(-w * 0.42, h * 0.4);
  x.bezierCurveTo(-w * 0.3, -h * 0.4, w * 0.3, -h * 0.4, w * 0.42, h * 0.4);
  x.stroke();
}

function arRune(x: C, r: number, c1: string, c2: string) {
  x.shadowColor = c1;
  x.shadowBlur = 12;
  const g = x.createRadialGradient(0, 0, 1, 0, 0, r);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.4, c1);
  g.addColorStop(1, c2);
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(0, -r * 1.35);
  x.quadraticCurveTo(r, -r * 0.3, r * 0.6, r * 0.5);
  x.quadraticCurveTo(0, r * 1.1, -r * 0.6, r * 0.5);
  x.quadraticCurveTo(-r, -r * 0.3, 0, -r * 1.35);
  x.fill();
  x.shadowBlur = 0;
  x.strokeStyle = "rgba(40,0,30,0.7)";
  x.lineWidth = 1.2;
  x.beginPath();
  x.moveTo(0, -r * 0.7); x.lineTo(r * 0.4, r * 0.2); x.lineTo(-r * 0.4, r * 0.2); x.closePath();
  x.stroke();
}

function arFlameBolt(x: C, w: number, h: number, c1: string, c2: string) {
  x.shadowColor = c1;
  x.shadowBlur = 12;
  const g = x.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.35, c1);
  g.addColorStop(1, c2);
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(0, -h / 2);
  x.quadraticCurveTo(w * 0.7, -h * 0.05, w * 0.35, h * 0.3);
  x.quadraticCurveTo(w * 0.1, h * 0.55, 0, h / 2);
  x.quadraticCurveTo(-w * 0.1, h * 0.55, -w * 0.35, h * 0.3);
  x.quadraticCurveTo(-w * 0.7, -h * 0.05, 0, -h / 2);
  x.fill();
}

function arNeedle(x: C, w: number, h: number, c1: string, c2: string) {
  x.shadowColor = c1;
  x.shadowBlur = 10;
  const g = x.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.4, c1);
  g.addColorStop(1, c2 + "00");
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(0, -h / 2); x.lineTo(w / 2, h * 0.2); x.lineTo(0, h / 2); x.lineTo(-w / 2, h * 0.2);
  x.closePath();
  x.fill();
}

function arGravOrb(x: C, r: number) {
  let g = x.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.2);
  g.addColorStop(0, "rgba(10,0,30,1)");
  g.addColorStop(0.55, "rgba(60,10,140,0.85)");
  g.addColorStop(0.8, "rgba(160,100,255,0.55)");
  g.addColorStop(1, "rgba(160,100,255,0)");
  x.fillStyle = g;
  x.beginPath(); x.arc(0, 0, r * 1.2, 0, TAU); x.fill();
  x.strokeStyle = "#d9b8ff";
  x.shadowColor = "#b06bff";
  x.shadowBlur = 10;
  x.lineWidth = 2;
  x.beginPath(); x.ellipse(0, 0, r * 0.95, r * 0.34, -0.5, 0, TAU); x.stroke();
  x.strokeStyle = "#7fb0ff";
  x.lineWidth = 1.4;
  x.beginPath(); x.ellipse(0, 0, r * 0.8, r * 0.26, 0.9, 0, TAU); x.stroke();
  g = x.createRadialGradient(0, 0, 0, 0, 0, r * 0.4);
  g.addColorStop(0, "#000");
  g.addColorStop(1, "rgba(0,0,0,0.9)");
  x.fillStyle = g;
  x.beginPath(); x.arc(0, 0, r * 0.4, 0, TAU); x.fill();
}

/** 音符（八分音符造型） */
function arNote(x: C, c1: string, c2: string, flip: boolean) {
  x.shadowColor = c1;
  x.shadowBlur = 12;
  x.fillStyle = c1;
  x.strokeStyle = c1;
  x.lineWidth = 2.6;
  x.save();
  if (flip) x.scale(-1, 1);
  x.beginPath();
  x.ellipse(-3, 6, 5.5, 4, -0.4, 0, TAU);
  x.fill();
  x.beginPath();
  x.moveTo(1.8, 5);
  x.lineTo(1.8, -9);
  x.quadraticCurveTo(7, -7, 8, -1);
  x.stroke();
  x.shadowBlur = 0;
  x.fillStyle = "#fff";
  x.beginPath();
  x.ellipse(-4, 5, 2, 1.4, -0.4, 0, TAU);
  x.fill();
  x.restore();
  x.strokeStyle = c2;
  x.lineWidth = 1;
}

function arBassArc(x: C, w: number, h: number, c1: string) {
  x.shadowColor = c1;
  x.shadowBlur = 14;
  x.strokeStyle = c1;
  x.lineWidth = 6;
  x.lineCap = "round";
  x.beginPath();
  x.arc(0, h * 0.9, w * 0.5, Math.PI * 1.15, Math.PI * 1.85);
  x.stroke();
  x.strokeStyle = "#fff";
  x.lineWidth = 2;
  x.beginPath();
  x.arc(0, h * 0.9, w * 0.5, Math.PI * 1.17, Math.PI * 1.83);
  x.stroke();
}

function arClockDart(x: C, w: number, h: number) {
  x.shadowColor = "#ffd04a";
  x.shadowBlur = 12;
  const g = x.createLinearGradient(0, -h / 2, 0, h / 2);
  g.addColorStop(0, "#fff");
  g.addColorStop(0.35, "#ffd04a");
  g.addColorStop(1, "rgba(217,138,0,0.3)");
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(0, -h / 2); x.lineTo(w / 2, -h * 0.1); x.lineTo(w * 0.18, h * 0.1); x.lineTo(0, h / 2); x.lineTo(-w * 0.18, h * 0.1); x.lineTo(-w / 2, -h * 0.1);
  x.closePath();
  x.fill();
  x.shadowBlur = 0;
  x.strokeStyle = "rgba(60,30,0,0.6)";
  x.lineWidth = 1;
  x.beginPath(); x.arc(0, -h * 0.05, w * 0.22, 0, TAU); x.stroke();
}

function arPin(x: C, r: number) {
  x.shadowColor = "#ffd04a";
  x.shadowBlur = 8;
  x.strokeStyle = "#ffd04a";
  x.lineWidth = 2;
  x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke();
  x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -r * 0.8); x.moveTo(0, 0); x.lineTo(r * 0.5, 0); x.stroke();
  x.fillStyle = "#fff";
  x.beginPath(); x.arc(0, 0, 1.8, 0, TAU); x.fill();
}

function arBlade(x: C, w: number, h: number, c1: string) {
  x.shadowColor = c1;
  x.shadowBlur = 14;
  const g = x.createLinearGradient(-w / 2, 0, w / 2, 0);
  g.addColorStop(0, c1);
  g.addColorStop(0.5, "#ffffff");
  g.addColorStop(1, c1);
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(0, -h / 2); x.lineTo(w / 2, -h * 0.35); x.lineTo(w * 0.35, h * 0.38); x.lineTo(0, h / 2); x.lineTo(-w * 0.35, h * 0.38); x.lineTo(-w / 2, -h * 0.35);
  x.closePath();
  x.fill();
}

// ── sg（port/007 絲弦）批次樣式繪製工具（搬移來源 sprites 的 shape helper）──
const sgShape = (c: C, pts: number[][], fill: string, blur = 0, glowC?: string) => {
  c.save();
  if (blur) { c.shadowBlur = blur; c.shadowColor = glowC || fill; }
  c.fillStyle = fill; c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.closePath(); c.fill(); c.restore();
};

// ── sx（port/010 星燼曙約）批次繪圖工具（來源 A/render/pbStylesExt.ts 的私有 helper，
//    一律加 sx 前綴避免與其他批次同名；本檔自給自足，不 import 任何模組）──
type Stops = [number, string][];
const sxLgY = (c: C, y0: number, y1: number, st: Stops) => {
  const g = c.createLinearGradient(0, y0, 0, y1);
  st.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
const sxLgH = (c: C, x0: number, x1: number, st: Stops) => {
  const g = c.createLinearGradient(x0, 0, x1, 0);
  st.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
const sxRgC = (c: C, r: number, st: Stops) => {
  const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
  st.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
};
const sxSoft = (c: C, r: number, col: string) => {
  c.fillStyle = sxRgC(c, r, [[0, col], [1, "rgba(0,0,0,0)"]]);
  c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
};
/** 砲彈本體的橫向金屬漸層（暗→橙→暗） */
const sxShellGrad = (c: C) => sxLgH(c, -10, 10, [[0, "#4a2210"], [0.5, "#ffa04a"], [1, "#4a2210"]]);
/** 火箭本體的橫向灰白漸層 */
const sxRocketGrad = (c: C) => sxLgH(c, -4, 4, [[0, "#8a8a98"], [0.5, "#f4f4fa"], [1, "#8a8a98"]]);
const sxFeather = (c: C, w: number, h: number, st: Stops, edge: string) => {
  c.beginPath();
  c.moveTo(0, -h / 2);
  c.quadraticCurveTo(w * 0.62, -h * 0.12, w * 0.16, h / 2);
  c.lineTo(0, h * 0.42);
  c.lineTo(-w * 0.16, h / 2);
  c.quadraticCurveTo(-w * 0.62, -h * 0.12, 0, -h / 2);
  c.fillStyle = sxLgY(c, -h / 2, h / 2, st); c.fill();
  c.strokeStyle = edge; c.lineWidth = 1; c.stroke();
  c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, -h * 0.42); c.lineTo(0, h * 0.36); c.stroke();
};
const sxCrescent = (c: C, R: number, thick: number, st: Stops, edge: string) => {
  c.beginPath();
  c.arc(0, 0, R, Math.PI * 1.05, Math.PI * 1.95, false);
  c.arc(0, thick * 0.55, R * 0.92, Math.PI * 1.9, Math.PI * 1.1, true);
  c.closePath();
  c.fillStyle = sxLgY(c, -R, R * 0.3, st); c.fill();
  c.strokeStyle = edge; c.lineWidth = 1.2; c.stroke();
};
const sxNeedle = (c: C, w: number, h: number, st: Stops) => {
  c.beginPath(); c.moveTo(0, -h / 2); c.lineTo(w / 2, h * 0.12); c.lineTo(0, h / 2); c.lineTo(-w / 2, h * 0.12); c.closePath();
  c.fillStyle = sxLgY(c, -h / 2, h / 2, st); c.fill();
};

export const EXT_STYLES: { id: number; w: number; h: number; draw: (ctx: C) => void; dir?: boolean; spin?: boolean }[] = [
  // 0 緋燼：迴焰輪刃（新月形火刃）
  {
    id: EXT_BASE + 0, w: 84, h: 62,
    draw: (ctx) => {
      glowOn(ctx, "#ff5a1f", 18);
      ctx.fillStyle = lg(ctx, -26, 22, [[0, "#fff6d0"], [0.35, "#ffb02e"], [0.7, "#ff4a1a"], [1, "#a8081f"]]);
      ctx.beginPath();
      ctx.moveTo(-36, 18);
      ctx.quadraticCurveTo(-30, -22, 0, -28);
      ctx.quadraticCurveTo(30, -22, 36, 18);
      ctx.quadraticCurveTo(14, -6, 0, -6);
      ctx.quadraticCurveTo(-14, -6, -36, 18);
      ctx.fill();
      glowOff(ctx);
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-28, 10);
      ctx.quadraticCurveTo(0, -20, 28, 10);
      ctx.stroke();
    },
  },
  // 1 緋燼：火針
  { id: EXT_BASE + 1, w: 26, h: 44, draw: (ctx) => kite(ctx, 10, 30, "#ffb02e", "#e8112d", "#ff5a1f") },
  // 2 霜魄：霜晶彈
  {
    id: EXT_BASE + 2, w: 34, h: 52,
    draw: (ctx) => {
      glowOn(ctx, "#8fe9ff", 14);
      ctx.fillStyle = lg(ctx, -20, 20, [[0, "#ffffff"], [0.4, "#9fe8ff"], [1, "#3f8bff"]]);
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(9, -6);
      ctx.lineTo(7, 14);
      ctx.lineTo(0, 22);
      ctx.lineTo(-7, 14);
      ctx.lineTo(-9, -6);
      ctx.closePath();
      ctx.fill();
      glowOff(ctx);
      ctx.strokeStyle = "rgba(255,255,255,.9)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(0, 22);
      ctx.moveTo(-9, -6);
      ctx.lineTo(7, 14);
      ctx.stroke();
    },
  },
  // 3 霜魄：懸浮晶體（雪花六芒）
  {
    id: EXT_BASE + 3, w: 64, h: 64,
    draw: (ctx) => {
      glowOn(ctx, "#6fd8ff", 16);
      ctx.strokeStyle = "#e8fbff";
      ctx.fillStyle = "rgba(120,210,255,.38)";
      ctx.lineWidth = 2.2;
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI) / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -24);
        ctx.moveTo(0, -14);
        ctx.lineTo(7, -20);
        ctx.moveTo(0, -14);
        ctx.lineTo(-7, -20);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3 + Math.PI / 6;
        ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      glowOff(ctx);
    },
  },
  // 4 霜魄：冰針
  { id: EXT_BASE + 4, w: 20, h: 40, draw: (ctx) => kite(ctx, 7, 26, "#bff3ff", "#4aa3ff", "#7fe0ff") },
  // 5 迅雷：雷矢
  { id: EXT_BASE + 5, w: 24, h: 44, draw: (ctx) => kite(ctx, 9, 28, "#fff27a", "#ffb400", "#ffe14a") },
  // 6 迅雷：雷索球
  {
    id: EXT_BASE + 6, w: 44, h: 44,
    draw: (ctx) => {
      orb(ctx, 11, "#c9a0ff", "#6a2cff");
      ctx.strokeStyle = "#fff6a0";
      ctx.lineWidth = 2;
      glowOn(ctx, "#ffe14a", 8);
      for (let i = 0; i < 4; i++) {
        const a = i * 1.57 + 0.4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 9, Math.sin(a) * 9);
        ctx.lineTo(Math.cos(a + 0.2) * 15, Math.sin(a + 0.2) * 15);
        ctx.lineTo(Math.cos(a - 0.1) * 19, Math.sin(a - 0.1) * 19);
        ctx.stroke();
      }
      glowOff(ctx);
    },
  },
  // 7 迅雷：衛星雷彈
  { id: EXT_BASE + 7, w: 22, h: 36, draw: (ctx) => kite(ctx, 8, 22, "#8ff3ff", "#3a7bff", "#4fe0ff") },
  // 8 翠嵐：螺旋羽矢
  {
    id: EXT_BASE + 8, w: 30, h: 52,
    draw: (ctx) => {
      glowOn(ctx, "#5dffb0", 12);
      ctx.fillStyle = lg(ctx, -22, 22, [[0, "#f4fff8"], [0.4, "#7dffc0"], [1, "#12a86a"]]);
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.quadraticCurveTo(12, -6, 6, 20);
      ctx.lineTo(0, 12);
      ctx.lineTo(-6, 20);
      ctx.quadraticCurveTo(-12, -6, 0, -24);
      ctx.fill();
      glowOff(ctx);
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(0, 12);
      ctx.stroke();
    },
  },
  // 9 翠嵐：穿風矢
  {
    id: EXT_BASE + 9, w: 28, h: 72,
    draw: (ctx) => {
      kite(ctx, 12, 60, "#d6fff0", "#1fd68a", "#5dffb0");
      ctx.strokeStyle = "rgba(180,255,220,.6)";
      ctx.lineWidth = 1.5;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 5, 6);
        ctx.lineTo(s * 12, 26);
        ctx.stroke();
      }
    },
  },
  // 10 翠嵐：嵐牙龍捲
  {
    id: EXT_BASE + 10, w: 120, h: 120,
    draw: (ctx) => {
      glowOn(ctx, "#5dffb0", 18);
      for (let k = 0; k < 4; k++) {
        ctx.strokeStyle = `rgba(${200 - k * 30},255,${220 - k * 20},${0.9 - k * 0.15})`;
        ctx.lineWidth = 5 - k;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) {
          const a = i * 0.45 + k * 1.6;
          const r = 8 + i * 1.25;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r * 0.9;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      glowOff(ctx);
      orb(ctx, 9, "#ffffff", "#5dffb0");
    },
  },
  // 11 金剛：榴彈
  {
    id: EXT_BASE + 11, w: 46, h: 64,
    draw: (ctx) => {
      glowOn(ctx, "#ffb92e", 14);
      ctx.fillStyle = lg(ctx, -26, 26, [[0, "#fff1b0"], [0.2, "#ffcc4a"], [0.55, "#d98a12"], [1, "#6b3d06"]]);
      ctx.beginPath();
      ctx.moveTo(0, -28);
      ctx.quadraticCurveTo(13, -14, 12, 8);
      ctx.lineTo(12, 22);
      ctx.lineTo(-12, 22);
      ctx.lineTo(-12, 8);
      ctx.quadraticCurveTo(-13, -14, 0, -28);
      ctx.fill();
      glowOff(ctx);
      ctx.fillStyle = "#2a1a08";
      ctx.fillRect(-12, 6, 24, 5);
      ctx.fillStyle = "#e8112d";
      ctx.fillRect(-12, 13, 24, 3);
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.fillRect(-6, -12, 3, 16);
    },
  },
  // 12 金剛：子彈藥
  { id: EXT_BASE + 12, w: 28, h: 38, draw: (ctx) => kite(ctx, 14, 24, "#ffd86a", "#c97a10", "#ffb92e") },
  // 13 金剛：機槍鉚彈
  { id: EXT_BASE + 13, w: 20, h: 34, draw: (ctx) => kite(ctx, 8, 22, "#fff3b0", "#e0a020", "#ffd24a") },
  // 14 虛無：虛矢
  { id: EXT_BASE + 14, w: 30, h: 44, draw: (ctx) => kite(ctx, 12, 28, "#d9a8ff", "#5a1fd0", "#a35cff") },
  // 15 虛無：轉化彈（追蹤球）
  {
    id: EXT_BASE + 15, w: 40, h: 40,
    draw: (ctx) => {
      orb(ctx, 10, "#e9b8ff", "#6a1fe0");
      ctx.strokeStyle = "rgba(255,255,255,.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0.3, 2.6);
      ctx.stroke();
    },
  },
  // 16 僚機彈
  { id: EXT_BASE + 16, w: 20, h: 34, draw: (ctx) => kite(ctx, 7, 20, "#9fe8ff", "#2a7bff", "#4fd0ff") },
  // 17 緋燼：炎輪殘火（小）
  { id: EXT_BASE + 17, w: 30, h: 30, draw: (ctx) => orb(ctx, 8, "#ffcf6a", "#e8300f") },

  // ── cf5 批次（黑曜/焰/白雪/百鬼；原 cf5 +2..+10，重編號 +18..+26 避開 cft 批次）──
  // 18 黑曜：重力奇點
  {
    id: EXT_BASE + 18, w: 40, h: 40,
    draw(c: C) {
      c.fillStyle = cf5rg(c, 2, 20, [[0, "#000"], [0.45, "#1a0833"], [0.7, "#8a4dff"], [1, "rgba(160,100,255,0)"]]);
      c.beginPath(); c.arc(0, 0, 20, 0, Math.PI * 2); c.fill();
      c.strokeStyle = "rgba(230,200,255,.9)"; c.lineWidth = 1.5;
      c.beginPath(); c.arc(0, 0, 11, 0.3, 4.4); c.stroke();
      c.beginPath(); c.arc(0, 0, 15, 3.4, 6.1); c.stroke();
    },
  },
  // 19 黑曜：虛空微粒
  {
    id: EXT_BASE + 19, w: 10, h: 18,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -9, 0, 9, [[0, "#fff"], [0.4, "#c79bff"], [1, "#5a22c8"]]);
      c.beginPath(); c.ellipse(0, 0, 3.2, 8, 0, 0, Math.PI * 2); c.fill();
    },
  },
  // 20 焰：炎螺旋彈
  {
    id: EXT_BASE + 20, w: 16, h: 26,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -13, 0, 13, [[0, "#fff6c8"], [0.35, "#ffb02e"], [1, "rgba(255,60,20,0)"]]);
      c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(7, -2, 4, 8); c.quadraticCurveTo(0, 14, -4, 8); c.quadraticCurveTo(-7, -2, 0, -12); c.fill();
      c.fillStyle = "#fff"; c.beginPath(); c.ellipse(0, -2, 1.8, 4.5, 0, 0, Math.PI * 2); c.fill();
    },
  },
  // 21 白雪：凍牙冰槍
  {
    id: EXT_BASE + 21, w: 16, h: 56,
    draw(c: C) {
      c.fillStyle = cflg(c, -6, 0, 6, 0, [[0, "#6ad0ff"], [0.5, "#ffffff"], [1, "#6ad0ff"]]);
      c.beginPath(); c.moveTo(0, -27); c.lineTo(5, -6); c.lineTo(7, 14); c.lineTo(0, 27); c.lineTo(-7, 14); c.lineTo(-5, -6); c.closePath(); c.fill();
      c.strokeStyle = "rgba(190,240,255,.95)"; c.lineWidth = 1; c.stroke();
      c.strokeStyle = "rgba(255,255,255,.8)"; c.beginPath(); c.moveTo(0, -24); c.lineTo(0, 22); c.stroke();
    },
  },
  // 22 白雪：冰碎片
  {
    id: EXT_BASE + 22, w: 12, h: 20,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -10, 0, 10, [[0, "#ffffff"], [1, "#58b8ff"]]);
      c.beginPath(); c.moveTo(0, -10); c.lineTo(4, 0); c.lineTo(1, 10); c.lineTo(-4, 2); c.closePath(); c.fill();
    },
  },
  // 23 百鬼：燈靈鬼火
  {
    id: EXT_BASE + 23, w: 22, h: 32,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -14, 0, 16, [[0, "#fff"], [0.3, "#ff8fe0"], [1, "rgba(150,40,255,0)"]]);
      c.beginPath(); c.moveTo(0, 14); c.quadraticCurveTo(-9, 2, -5, -6); c.quadraticCurveTo(0, -16, 5, -6); c.quadraticCurveTo(9, 2, 0, 14); c.fill();
    },
  },
  // 24 百鬼：魂火（大型）
  {
    id: EXT_BASE + 24, w: 28, h: 34,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -16, 0, 17, [[0, "#fff"], [0.28, "#c9a0ff"], [0.6, "#ff5fd0"], [1, "rgba(120,30,200,0)"]]);
      c.beginPath(); c.moveTo(0, 16); c.quadraticCurveTo(-13, 4, -8, -6); c.quadraticCurveTo(0, -18, 8, -6); c.quadraticCurveTo(13, 4, 0, 16); c.fill();
      c.fillStyle = "#2a0a3a"; c.beginPath(); c.arc(-3, -3, 1.6, 0, 7); c.arc(3, -3, 1.6, 0, 7); c.fill();
    },
  },
  // 25 百鬼：洋紅細針
  {
    id: EXT_BASE + 25, w: 8, h: 26,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -13, 0, 13, [[0, "#fff"], [0.5, "#ff7fe0"], [1, "#a03cff"]]);
      c.beginPath(); c.moveTo(0, -13); c.lineTo(2.5, 6); c.lineTo(0, 13); c.lineTo(-2.5, 6); c.closePath(); c.fill();
    },
  },
  // 26 焰：追焰火球
  {
    id: EXT_BASE + 26, w: 26, h: 34,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -14, 0, 17, [[0, "#fffbe0"], [0.3, "#ffb02e"], [0.7, "#ff3d1f"], [1, "rgba(255,40,10,0)"]]);
      c.beginPath(); c.moveTo(0, 17); c.quadraticCurveTo(-12, 4, -8, -4); c.quadraticCurveTo(0, -17, 8, -4); c.quadraticCurveTo(12, 4, 0, 17); c.fill();
    },
  },

  // ============ ak5 批次（arena_20261005 緋刻天穹 cf5）來源子彈精靈 ============
  // 來源 4 台（kagari/seiran/yozora/onyx）skill 檔逐行照搬，spawnPB 傳 EXT_BASE+n。
  // 來源 +0~+9 跟 dst 既有 +0~+26 內容不同（dst 被紅月/群星等佔用），
  // 故來源 8 個精靈掛到未佔用的 +27~+34，skill 檔常數再指到新偏移（幾何逐行照搬、色票不變）。
  // +27 = 來源 +0 緋刃：新月迴旋刃（對齊飛行方向）
  { id: EXT_BASE + 27, w: 34, h: 34, draw: drawBlade },
  // +28 = 來源 +1 緋刃：殘月花瓣
  {
    id: EXT_BASE + 28, w: 14, h: 18,
    draw(c: C) {
      glowOn(c, "#ff5f86", 8);
      const g = c.createLinearGradient(0, -9, 0, 9);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(1, "#ff3d6a");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -9);
      c.quadraticCurveTo(8, -2, 0, 9);
      c.quadraticCurveTo(-8, -2, 0, -9);
      c.fill();
    },
  },
  // +29 = 來源 +4 蒼狙：軌道砲彈（細長金芒）
  {
    id: EXT_BASE + 29, w: 8, h: 46,
    draw(c: C) {
      glowOn(c, "#ffd23f", 12);
      const g = c.createLinearGradient(0, -23, 0, 23);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.3, "#ffe680");
      g.addColorStop(1, "rgba(80,160,255,0.0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -23);
      c.lineTo(3.5, -4);
      c.lineTo(1.5, 23);
      c.lineTo(-1.5, 23);
      c.lineTo(-3.5, -4);
      c.closePath();
      c.fill();
      glowOff(c);
      c.fillStyle = "#ffffff";
      c.fillRect(-0.8, -20, 1.6, 22);
    },
  },
  // +30 = 來源 +5 蒼狙：追蹤印記彈
  {
    id: EXT_BASE + 30, w: 16, h: 16,
    draw(c: C) {
      glowOn(c, "#35e6ff", 10);
      c.fillStyle = "#ffffff";
      c.beginPath();
      c.moveTo(0, -7);
      c.lineTo(5, 0);
      c.lineTo(0, 7);
      c.lineTo(-5, 0);
      c.closePath();
      c.fill();
      glowOff(c);
      c.strokeStyle = "#35e6ff";
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(0, 0, 7.5, 0, Math.PI * 2);
      c.stroke();
    },
  },
  // +31 = 來源 +6 夜宴：使魔蝙蝠
  {
    id: EXT_BASE + 31, w: 26, h: 20,
    draw(c: C) {
      glowOn(c, "#ff5fa8", 9);
      const g = c.createLinearGradient(0, -8, 0, 8);
      g.addColorStop(0, "#d78bff");
      g.addColorStop(1, "#6a2cc0");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -6);
      c.quadraticCurveTo(6, -10, 12, -4);
      c.lineTo(9, -1);
      c.lineTo(11, 3);
      c.lineTo(6, 2);
      c.lineTo(4, 8);
      c.lineTo(0, 4);
      c.lineTo(-4, 8);
      c.lineTo(-6, 2);
      c.lineTo(-11, 3);
      c.lineTo(-9, -1);
      c.lineTo(-12, -4);
      c.quadraticCurveTo(-6, -10, 0, -6);
      c.fill();
      glowOff(c);
      c.fillStyle = "#ffffff";
      c.fillRect(-3, -3, 2, 2);
      c.fillRect(1, -3, 2, 2);
    },
  },
  // +32 = 來源 +7 夜宴：幽火
  {
    id: EXT_BASE + 32, w: 14, h: 22,
    draw(c: C) {
      glowOn(c, "#ff5fa8", 12);
      const g = c.createLinearGradient(0, -11, 0, 11);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.4, "#ff8ad0");
      g.addColorStop(1, "#7a2cd0");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -11);
      c.quadraticCurveTo(8, -1, 5, 6);
      c.quadraticCurveTo(0, 12, -5, 6);
      c.quadraticCurveTo(-8, -1, 0, -11);
      c.fill();
    },
  },
  // +33 = 來源 +8 黯星：重力彈（原地自轉；來源 kind>=20 → ang=b.rot）
  {
    id: EXT_BASE + 33, w: 30, h: 30, dir: false, spin: true,
    draw(c: C) {
      glowOn(c, "#ff8a1f", 14);
      c.strokeStyle = "#ffb04a";
      c.lineWidth = 2.5;
      c.beginPath();
      c.ellipse(0, 0, 14, 5.5, -0.5, 0, Math.PI * 2);
      c.stroke();
      glowOff(c);
      c.fillStyle = "#0a0612";
      c.beginPath();
      c.arc(0, 0, 8, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#ff8a1f";
      c.lineWidth = 1.5;
      c.stroke();
      c.strokeStyle = "rgba(255,200,120,0.8)";
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(0, 0, 14, 5.5, 1.1, 0, Math.PI * 2);
      c.stroke();
    },
  },
  // +34 = 來源 +9 黯星：碎岩
  {
    id: EXT_BASE + 34, w: 14, h: 14,
    draw(c: C) {
      glowOn(c, "#ff8a1f", 6);
      c.fillStyle = "#1a1220";
      c.strokeStyle = "#ff9a3a";
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(0, -6);
      c.lineTo(5, -2);
      c.lineTo(4, 5);
      c.lineTo(-2, 6);
      c.lineTo(-6, 1);
      c.closePath();
      c.fill();
      c.stroke();
    },
  },
  // +35 = 來源 BASE_STYLES 19：crescent 26×26 淺藍白（kagari 主彈 19 用）
  {
    id: EXT_BASE + 35, w: 26, h: 26,
    draw(c: C) {
      c.shadowColor = "#e8eeff";
      c.shadowBlur = 9;
      c.fillStyle = cflg(c, 0, -13, 0, 13, [[0, "#e8eeff"], [0.5, "#ffffff"], [1, "#e8eeff"]]);
      c.beginPath();
      c.arc(0, 0, 13, Math.PI * 1.05, Math.PI * 1.95, false);
      c.quadraticCurveTo(0, -26 * 0.05, -13, -26 * 0.02);
      c.fill();
      c.shadowBlur = 0;
    },
  },
  // +36 = 來源 BASE_STYLES 22：orb 16×16 紫（yozora 主彈 22 用，圓形）
  {
    id: EXT_BASE + 36, w: 16, h: 16,
    draw(c: C) {
      c.shadowColor = "#a66bff";
      c.shadowBlur = 9;
      const g = c.createRadialGradient(0, 0, 0, 0, 0, 8);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.5, "#ffffff");
      g.addColorStop(1, "#a66bff");
      c.fillStyle = g;
      c.beginPath();
      c.arc(0, 0, 8, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 0;
    },
  },
  // +37 = 同 +27 幾何，渲染改「原地自轉 b.rot」。來源 kagari 迴旋刃/殘影刃是 kind>=20 → ang=b.rot；
  // dst 不能靠 kind 分流（dst spawnPB 預設 rot=rand(TAU)、spin=8，會誤傷既有 kind>=20 子彈），
  // 改以帶 spin 旗標的樣式表達同一件事。
  { id: EXT_BASE + 37, w: 34, h: 34, dir: false, spin: true, draw: drawBlade },
  // +38 = 同 +27 幾何，渲染「對齊飛行方向 ＋ 自轉」疊加。來源 kagari 歸位刃雨是 kind<20 且 spin!=0
  // → ang = atan2(vy,vx)+π/2 + rot；dst 以 dir 與 spin 同時開啟表達。
  { id: EXT_BASE + 38, w: 34, h: 34, dir: true, spin: true, draw: drawBlade },

  // ============ 主動技交換（homura ↔ kagari）：子彈精靈色系跟隨新機體 ============
  // +39 = 同 +27 幾何，焰刃（homura 版三絕斬「斬擊刃」，對齊飛行方向）
  // +40 = 同 +38 幾何，焰刃（homura 版三絕斬「歸位刃雨」，對齊＋自轉）
  // ⚠ 2026-10-23：這兩格**本體改成不畫**。大爺要求「完全照 03 的外觀」，
  //   而 03 的 pbStyle() 是空殼（`draw: () => {}`）→ 03 只有 homura.ts 的貼圖覆層，
  //   沒有本體圓弧刃。留著本體就會在每顆刃雨上多一顆圓球（被退三次）。
  //   覆層＝homura.ts drawOver §1 的 homura_rain 26×64（照 03 drawBladeTex）。
  //   dir/spin 旗標必須保留：+40 的 b.rot 靠 spin 累加，覆層雖用 atan2 但別破壞語意。
  { id: EXT_BASE + 39, w: 34, h: 34, draw: () => {} },
  { id: EXT_BASE + 40, w: 34, h: 34, dir: true, spin: true, draw: () => {} },
  // +41 = 同 +26 幾何，紅焰火球（kagari 版熱能逆轉；色系跟隨緋紅）
  {
    id: EXT_BASE + 41, w: 26, h: 34,
    draw(c: C) {
      c.fillStyle = cflg(c, 0, -14, 0, 17, [[0, "#ffffff"], [0.3, "#ff5f86"], [0.7, "#ff2a4d"], [1, "rgba(160,10,40,0)"]]);
      c.beginPath(); c.moveTo(0, 17); c.quadraticCurveTo(-12, 4, -8, -4); c.quadraticCurveTo(0, -17, 8, -4); c.quadraticCurveTo(12, 4, 0, 17); c.fill();
    },
  },

  // ============ zx 批次（port/006 緋月異能戰線）來源子彈精靈 ============
  // 來源 EXT_STYLES +0~+7 逐行照搬，掛到 +107~+114（EXT_BASE_ZX）。
  // 旋轉旗標：來源 renderer 直接 ctx.rotate(b.rot)，而來源 spawnPB 設 b.rot = ang+π/2
  //   （＝對齊飛行方向），非 kind>=20 者再累加 spin → 一般彈＝dir:true；
  //   賭神撲克牌來源帶 spin=14 → dir:true, spin:true（對齊＋自轉）。
  // +107 = 來源 +0 番長：拳風衝擊（弧形拳壓）
  {
    id: EXT_BASE_ZX + 0, w: 44, h: 30,
    draw: (x) => {
      x.globalCompositeOperation = "lighter"; halo(x, 26, "rgba(255,110,40,0.55)");
      x.globalCompositeOperation = "source-over";
      x.lineCap = "round";
      for (let i = 0; i < 3; i++) {
        x.strokeStyle = ["#ff5a1f", "#ffb347", "#fff4d6"][i]; x.lineWidth = 8 - i * 2.5;
        x.beginPath(); x.arc(0, 12 + i * 2, 20 - i * 3, Math.PI * 1.15, Math.PI * 1.85); x.stroke();
      }
    },
  },
  // +108 = 來源 +1 縫姬：金針
  {
    id: EXT_BASE_ZX + 1, w: 8, h: 34,
    draw: (x) => {
      x.globalCompositeOperation = "lighter"; halo(x, 16, "rgba(255,200,80,0.5)"); x.globalCompositeOperation = "source-over";
      const g = x.createLinearGradient(0, -17, 0, 17); g.addColorStop(0, "#fff"); g.addColorStop(0.4, "#ffd166"); g.addColorStop(1, "#b8860b");
      x.fillStyle = g; x.beginPath(); x.moveTo(0, -17); x.lineTo(2.5, 10); x.lineTo(0, 17); x.lineTo(-2.5, 10); x.closePath(); x.fill();
      x.strokeStyle = "#ff3d7f"; x.lineWidth = 1.2; x.beginPath(); x.ellipse(0, 11, 1.2, 3, 0, 0, 7); x.stroke();
    },
  },
  // +109 = 來源 +2 鈴音：音波弧
  {
    id: EXT_BASE_ZX + 2, w: 40, h: 18,
    draw: (x) => {
      x.globalCompositeOperation = "lighter"; halo(x, 22, "rgba(56,243,255,0.4)");
      x.lineCap = "round";
      x.strokeStyle = "#38f3ff"; x.lineWidth = 5; x.beginPath(); x.arc(0, 14, 20, Math.PI * 1.2, Math.PI * 1.8); x.stroke();
      x.strokeStyle = "#e6ffff"; x.lineWidth = 2; x.beginPath(); x.arc(0, 14, 20, Math.PI * 1.25, Math.PI * 1.75); x.stroke();
    },
  },
  // +110 = 來源 +3 鏡衛：鏡片
  {
    id: EXT_BASE_ZX + 3, w: 14, h: 30,
    draw: (x) => {
      x.globalCompositeOperation = "lighter"; halo(x, 18, "rgba(190,150,255,0.45)"); x.globalCompositeOperation = "source-over";
      const g = x.createLinearGradient(-7, -15, 7, 15); g.addColorStop(0, "#ffffff"); g.addColorStop(0.5, "#c9b6ff"); g.addColorStop(1, "#6a4cff");
      x.fillStyle = g; x.beginPath(); x.moveTo(0, -15); x.lineTo(6, -2); x.lineTo(3, 15); x.lineTo(-4, 9); x.lineTo(-6, -5); x.closePath(); x.fill();
      x.strokeStyle = "rgba(255,255,255,0.9)"; x.lineWidth = 1; x.stroke();
    },
  },
  // +111 = 來源 +4 墨筆：墨滴
  {
    id: EXT_BASE_ZX + 4, w: 22, h: 26,
    draw: (x) => {
      x.fillStyle = "rgba(255,40,60,0.35)"; x.beginPath(); x.arc(0, 2, 12, 0, 7); x.fill();
      x.fillStyle = "#111"; x.beginPath(); x.moveTo(0, -13); x.bezierCurveTo(9, -2, 10, 12, 0, 12); x.bezierCurveTo(-10, 12, -9, -2, 0, -13); x.fill();
      x.fillStyle = "rgba(255,255,255,0.7)"; x.beginPath(); x.ellipse(-3, 2, 2, 4, -0.4, 0, 7); x.fill();
    },
  },
  // +112 = 來源 +5 賭神：撲克牌（來源帶 spin=14 → 對齊＋自轉）
  {
    id: EXT_BASE_ZX + 5, w: 18, h: 26, dir: true, spin: true,
    draw: (x) => {
      x.globalCompositeOperation = "lighter"; halo(x, 18, "rgba(255,209,102,0.45)"); x.globalCompositeOperation = "source-over";
      x.fillStyle = "#fff"; x.strokeStyle = "#ffd166"; x.lineWidth = 1.5;
      x.beginPath(); x.roundRect(-9, -13, 18, 26, 3); x.fill(); x.stroke();
      x.fillStyle = "#d10f2f"; x.beginPath(); x.moveTo(0, 6); x.bezierCurveTo(-8, -1, -4, -8, 0, -3); x.bezierCurveTo(4, -8, 8, -1, 0, 6); x.fill();
    },
  },
  // +113 = 來源 +6 賭神：黑桃牌（來源帶 spin=14 → 對齊＋自轉）
  {
    id: EXT_BASE_ZX + 6, w: 18, h: 26, dir: true, spin: true,
    draw: (x) => {
      x.globalCompositeOperation = "lighter"; halo(x, 18, "rgba(160,120,255,0.45)"); x.globalCompositeOperation = "source-over";
      x.fillStyle = "#15121c"; x.strokeStyle = "#ffd166"; x.lineWidth = 1.5;
      x.beginPath(); x.roundRect(-9, -13, 18, 26, 3); x.fill(); x.stroke();
      x.fillStyle = "#ffd166"; x.beginPath(); x.moveTo(0, -7); x.bezierCurveTo(8, 0, 4, 6, 0, 2); x.bezierCurveTo(-4, 6, -8, 0, 0, -7); x.fill(); x.fillRect(-1, 2, 2, 5);
    },
  },
  // +114 = 來源 +7 番長：重拳（大型）
  {
    id: EXT_BASE_ZX + 7, w: 64, h: 44,
    draw: (x) => {
      x.globalCompositeOperation = "lighter"; halo(x, 36, "rgba(255,80,30,0.6)"); x.globalCompositeOperation = "source-over";
      x.lineCap = "round";
      for (let i = 0; i < 4; i++) { x.strokeStyle = ["#c8102e", "#ff5a1f", "#ffb347", "#fff"][i]; x.lineWidth = 11 - i * 2.5; x.beginPath(); x.arc(0, 18, 30 - i * 3, Math.PI * 1.12, Math.PI * 1.88); x.stroke(); }
    },
  },
  // ── pl（port/005：萬象・極光／晚星・天網／冴刃・凜）批次，+90~+106 ──
  { id: EXT_BASE_PL + 0, w: 40, h: 40, draw: (c) => drawFist(c, 40) },
  { id: EXT_BASE_PL + 1, w: 64, h: 64, draw: (c) => drawFist(c, 64) },
  { id: EXT_BASE_PL + 2, w: 44, h: 20, draw: (c) => drawCrescent(c, 40, 16, "#ffffff", "#7fb4ff") },
  { id: EXT_BASE_PL + 3, w: 160, h: 56, draw: (c) => drawCrescent(c, 150, 46, "#ffffff", "#5f8dff") },
  { id: EXT_BASE_PL + 4, w: 32, h: 32, draw: (c) => drawGravOrb(c, 32) },
  { id: EXT_BASE_PL + 5, w: 64, h: 64, draw: (c) => drawGravOrb(c, 64) },
  { id: EXT_BASE_PL + 6, w: 10, h: 18, draw: (c) => drawCapsule(c, 6, 14, "#2ee6c8", "#ffffff") },
  { id: EXT_BASE_PL + 7, w: 26, h: 26, draw: (c) => drawBat(c, 26) },
  { id: EXT_BASE_PL + 8, w: 16, h: 36, draw: (c) => drawMagic(c, 10, 32) },
  // 來源 005 無樣式旋轉旗標：由來源 renderer 逐子彈判定 `b.spin !== 0 → 用 b.rot`。
  // dst 為逐樣式旗標 → 依各樣式實際用法標記：
  //   dir:false/spin:true  = 子彈由 kit 明確設定 b.rot（星針螺旋切線／圓盤自轉／幽影刃）
  //   dir:true /spin:false = 對齊飛行方向（飛燕斬／居合新月／追蹤星屑）
  { id: EXT_BASE_PL + 9, w: 12, h: 40, dir: false, spin: true, draw: (c) => drawNeedle(c, 7, 36, "#9b5cff") },
  { id: EXT_BASE_PL + 10, w: 22, h: 22, draw: (c) => drawStar(c, 20, "#b98cff", "#ffffff") },
  { id: EXT_BASE_PL + 11, w: 36, h: 36, dir: false, spin: true, draw: (c) => drawDisc(c, 36, false) },
  { id: EXT_BASE_PL + 12, w: 22, h: 64, dir: false, spin: true, draw: (c) => drawGhostBlade(c, 14, 58) },
  { id: EXT_BASE_PL + 13, w: 22, h: 50, draw: (c) => drawStake(c, 14, 44) },
  { id: EXT_BASE_PL + 14, w: 16, h: 26, draw: (c) => drawNeedle(c, 10, 22, "#2ee6c8") },
  { id: EXT_BASE_PL + 15, w: 54, h: 54, dir: false, spin: true, draw: (c) => drawDisc(c, 54, true) },
  { id: EXT_BASE_PL + 16, w: 20, h: 20, draw: (c) => drawPetal(c, 18) },

  // ── ar（port/004 刻蝕時計）批次，+75~+89（來源 EXT_STYLES +0~+14 逐行照搬）──
  // ⚠ 旋轉旗標一律 dir:false / spin:true（＝renderer 純用 b.rot，與來源等價）：
  //   來源 004 renderer 對**所有**我方子彈都是 `setTransform(cos(b.rot), sin(b.rot), …)` ——
  //   完全不做速度對齊；而 spawnPB 已把 b.rot 設為 `ang + π/2`。
  //   若誤用預設 dir:true，凍結中的子彈（tempus 的 kind 24、a===1：vx=vy=0）會被算成
  //   `atan2(0,0)+π/2 = π/2`，全部指向同一方向 → 刻蝕「凝結於半空」的視覺整組歪掉。
  { id: EXT_BASE_AR + 0, w: 38, h: 44, dir: false, spin: true, draw: (x) => arFist(x, 1.0, "#ffb347", "#d94a00") },
  { id: EXT_BASE_AR + 1, w: 76, h: 88, dir: false, spin: true, draw: (x) => arFist(x, 2.0, "#ff6a3d", "#a10014") },
  { id: EXT_BASE_AR + 2, w: 62, h: 34, dir: false, spin: true, draw: (x) => arSlash(x, 62, 34, "#bfe9ff", "#4ea8ff", 0.55) },
  { id: EXT_BASE_AR + 3, w: 34, h: 20, dir: false, spin: true, draw: (x) => arSlash(x, 34, 20, "#ffffff", "#8fd0ff", 0.5) },
  { id: EXT_BASE_AR + 4, w: 20, h: 30, dir: false, spin: true, draw: (x) => arRune(x, 8, "#ff5db8", "#6a0a5a") },
  { id: EXT_BASE_AR + 5, w: 14, h: 26, dir: false, spin: true, draw: (x) => arFlameBolt(x, 14, 26, "#c98bff", "#5a1bd1") },
  { id: EXT_BASE_AR + 6, w: 8, h: 30, dir: false, spin: true, draw: (x) => arNeedle(x, 8, 30, "#9aa8ff", "#3b2fd1") },
  { id: EXT_BASE_AR + 7, w: 44, h: 44, dir: false, spin: true, draw: (x) => arGravOrb(x, 19) },
  { id: EXT_BASE_AR + 8, w: 16, h: 16, dir: false, spin: true, draw: (x) => arNeedle(x, 12, 18, "#e6d4ff", "#8a5cff") },
  { id: EXT_BASE_AR + 9, w: 20, h: 26, dir: false, spin: true, draw: (x) => arNote(x, "#ff4fd0", "#8f1bff", false) },
  { id: EXT_BASE_AR + 10, w: 20, h: 26, dir: false, spin: true, draw: (x) => arNote(x, "#37e8ff", "#0a6fff", true) },
  { id: EXT_BASE_AR + 11, w: 64, h: 22, dir: false, spin: true, draw: (x) => arBassArc(x, 64, 22, "#ff6ad5") },
  { id: EXT_BASE_AR + 12, w: 12, h: 34, dir: false, spin: true, draw: (x) => arClockDart(x, 12, 34) },
  { id: EXT_BASE_AR + 13, w: 14, h: 14, dir: false, spin: true, draw: (x) => arPin(x, 6) },
  { id: EXT_BASE_AR + 14, w: 14, h: 66, dir: false, spin: true, draw: (x) => arBlade(x, 14, 66, "#a9d8ff") },

  // ── sg（port/007 絲弦）批次，+115~+125（來源 EXT_STYLES +0~+9 逐行照搬，另補來源 base style 15）──
  // ⚠ 旋轉旗標一律 dir:false / spin:true（＝renderer 純用 b.rot，與來源等價）：
  //   來源 007 renderer 對**所有**我方子彈都是 `ctx.rotate(b.rot)` —— 完全不做速度對齊；
  //   而 spawnPB 已把 b.rot 設為 `ang + π/2`，絲弦錨點彈（kind AK）再於 updateBullet 內
  //   `b.rot += dt * 4` 自轉。若誤用預設 dir:true，自轉會被覆蓋成速度對齊 → 錨點不再旋轉。
  // +115 節拍方塊（神樂）
  {
    id: EXT_BASE_SG + 0, w: 20, h: 20, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 12; c.shadowColor = "#38f5ff";
      c.fillStyle = "#9ff6ff"; c.beginPath();
      c.moveTo(0, -9); c.lineTo(9, 0); c.lineTo(0, 9); c.lineTo(-9, 0); c.closePath(); c.fill();
      c.fillStyle = "#ffffff"; c.fillRect(-2, -5, 4, 10);
    },
  },
  // +116 和聲重音（神樂強拍）
  {
    id: EXT_BASE_SG + 1, w: 34, h: 24, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 16; c.shadowColor = "#ff3ff0";
      c.strokeStyle = "#ffa8f4"; c.lineWidth = 3;
      c.beginPath(); c.ellipse(0, 0, 15, 9, 0, 0, TAU); c.stroke();
      c.strokeStyle = "#fff"; c.lineWidth = 1.2;
      c.beginPath(); c.ellipse(0, 0, 10, 5.5, 0, 0, TAU); c.stroke();
      c.fillStyle = "#fff"; c.beginPath(); c.arc(0, 0, 3.2, 0, TAU); c.fill();
    },
  },
  // +117 落暉墜星（拋物彈）
  {
    id: EXT_BASE_SG + 2, w: 26, h: 30, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 16; c.shadowColor = "#ff9b2e";
      const g = c.createRadialGradient(0, -2, 1, 0, 0, 12);
      g.addColorStop(0, "#fffbe8"); g.addColorStop(0.45, "#ffc24a"); g.addColorStop(1, "#ff5a1e00");
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, 12, 0, TAU); c.fill();
      c.strokeStyle = "#fff0c2"; c.lineWidth = 1.4; c.beginPath(); c.arc(0, 0, 6.5, 0, TAU); c.stroke();
    },
  },
  // +118 墨筆一劃（硯墨）
  {
    id: EXT_BASE_SG + 3, w: 24, h: 40, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 10; c.shadowColor = "#7a5bff";
      c.fillStyle = "#17131f";
      c.beginPath(); c.moveTo(0, -20); c.quadraticCurveTo(8, -4, 3, 18);
      c.quadraticCurveTo(0, 20, -3, 18); c.quadraticCurveTo(-8, -4, 0, -20); c.fill();
      c.fillStyle = "#b9a7ff"; c.beginPath(); c.ellipse(-1.5, -8, 1.8, 6, 0.2, 0, TAU); c.fill();
    },
  },
  // +119 弦錨（絲弦）
  {
    id: EXT_BASE_SG + 4, w: 24, h: 24, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 14; c.shadowColor = "#5bffb0";
      c.strokeStyle = "#c8ffe8"; c.lineWidth = 2.4;
      c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.stroke();
      c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.moveTo(0, -10); c.lineTo(0, 10); c.stroke();
      c.fillStyle = "#fff"; c.beginPath(); c.arc(0, 0, 3, 0, TAU); c.fill();
    },
  },
  // +120 迴旋刃（天蓋）
  {
    id: EXT_BASE_SG + 5, w: 44, h: 18, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 14; c.shadowColor = "#ff2d4b";
      c.fillStyle = "#ffd9e0";
      c.beginPath(); c.moveTo(-20, 0); c.quadraticCurveTo(0, -8, 20, 0); c.quadraticCurveTo(0, 8, -20, 0); c.fill();
      c.fillStyle = "#ff466b"; c.beginPath(); c.moveTo(-14, 0); c.quadraticCurveTo(0, -3.4, 14, 0); c.quadraticCurveTo(0, 3.4, -14, 0); c.fill();
    },
  },
  // +121 宵燈子彈（宵燈）
  {
    id: EXT_BASE_SG + 6, w: 24, h: 30, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 16; c.shadowColor = "#ffb84a";
      const g = c.createLinearGradient(0, -12, 0, 12);
      g.addColorStop(0, "#fff3cf"); g.addColorStop(0.5, "#ffc46a"); g.addColorStop(1, "#ff7a2e");
      c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 8, 12, 0, 0, TAU); c.fill();
      c.strokeStyle = "#ffeec2"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -13); c.lineTo(0, 13); c.stroke();
    },
  },
  // +122 燈鏈雷射節點
  {
    id: EXT_BASE_SG + 7, w: 18, h: 18, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 14; c.shadowColor = "#ffd24a";
      c.fillStyle = "#fff6d8"; c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.fill();
      c.strokeStyle = "#ffd24a99"; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 8, 0, TAU); c.stroke();
    },
  },
  // +123 共振擴散波（神樂舞律）
  {
    id: EXT_BASE_SG + 8, w: 40, h: 40, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 18; c.shadowColor = "#a06bff";
      for (let i = 0; i < 3; i++) {
        c.globalAlpha = 1 - i * 0.3; c.strokeStyle = i % 2 ? "#e0c8ff" : "#8ef2ff";
        c.lineWidth = 3 - i * 0.8; c.beginPath(); c.arc(0, 0, 6 + i * 6, 0, TAU); c.stroke();
      }
    },
  },
  // +124 鏡像殘影刃（天蓋奧義）
  {
    id: EXT_BASE_SG + 9, w: 30, h: 34, dir: false, spin: true, draw: (c) => {
      c.shadowBlur = 16; c.shadowColor = "#ff5a7a";
      c.fillStyle = "#ffffff";
      c.beginPath(); c.moveTo(0, -17); c.lineTo(7, -2); c.lineTo(0, 17); c.lineTo(-7, -2); c.closePath(); c.fill();
      c.fillStyle = "#ff2d4b99";
      c.beginPath(); c.moveTo(0, -13); c.lineTo(4, -2); c.lineTo(0, 13); c.lineTo(-4, -2); c.closePath(); c.fill();
    },
  },
  // +125 菱晶（來源 007 base style 15；絲弦次武裝「導引細針」用。來源 base 15 與 dst base 15
  //      「折射稜鏡彈」內容不同 → 依 §5 慣例複製成新 EXT 槽，kit 端常數改指 EXT_BASE + 10。）
  {
    id: EXT_BASE_SG + 10, w: 18, h: 26, dir: false, spin: true, draw: (c) => {
      sgShape(c, [[0, -13], [6, 0], [0, 13], [-6, 0]], "#b9ecff", 10, "#48d7ff");
      sgShape(c, [[0, -8], [2.4, 0], [0, 8], [-2.4, 0]], "#ffffff");
    },
  },

  // ── nx（port/001 斬界戰姬）批次，+126~+132（來源 EXT_STYLES +0~+4 逐行照搬，另補來源 base 17/18）──
  // ⚠ 旋轉旗標一律 dir:false / spin:true（＝renderer 純用 b.rot，與來源等價）：
  //   來源 001 renderer 對我方子彈是 `ctx.rotate(b.rot + π/2)` —— 完全不做速度對齊；
  //   而 spawnPB 已把 b.rot 設為 `ang`。若誤用預設 dir:true，速度歸零／自轉的子彈會歪掉。
  // +126 白鷺迴旋羽刃（來源 +0）
  {
    id: EXT_BASE_NX + 0, w: 34, h: 34, dir: false, spin: true, draw: (x) => {
      x.fillStyle = "#eaffff";
      for (let i = 0; i < 3; i++) { x.rotate((Math.PI * 2) / 3); x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(10, -6, 16, -2); x.quadraticCurveTo(8, 2, 0, 3); x.fill(); }
      x.fillStyle = "#58e8ff"; x.beginPath(); x.arc(0, 0, 4, 0, Math.PI * 2); x.fill();
    },
  },
  // +127 言靈墨字（來源 +1）
  {
    id: EXT_BASE_NX + 1, w: 26, h: 26, dir: false, spin: true, draw: (x) => {
      x.fillStyle = "#f7e7c0"; x.fillRect(-11, -11, 22, 22); x.strokeStyle = "#c9962c"; x.lineWidth = 2; x.strokeRect(-11, -11, 22, 22);
      x.fillStyle = "#140a0a"; x.font = "bold 16px serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("斬", 0, 1);
    },
  },
  // +128 時針（來源 +2）
  {
    id: EXT_BASE_NX + 2, w: 10, h: 36, dir: false, spin: true, draw: (x) => {
      x.fillStyle = "#ffd36a"; x.beginPath(); x.moveTo(0, -18); x.lineTo(4, -6); x.lineTo(1.5, 18); x.lineTo(-1.5, 18); x.lineTo(-4, -6); x.fill();
      x.fillStyle = "#fff"; x.beginPath(); x.arc(0, 8, 2.5, 0, Math.PI * 2); x.fill();
    },
  },
  // +129 撲克牌黑桃（來源 +3；tenbin 普彈用）
  {
    id: EXT_BASE_NX + 3, w: 18, h: 26, dir: false, spin: true, draw: (x) => {
      x.fillStyle = "#fff"; x.beginPath(); x.roundRect(-9, -13, 18, 26, 3); x.fill(); x.strokeStyle = "#ff3db8"; x.lineWidth = 2; x.stroke();
      x.fillStyle = "#ff3db8"; x.beginPath(); x.moveTo(0, -7); x.bezierCurveTo(8, 0, 4, 6, 0, 2); x.bezierCurveTo(-4, 6, -8, 0, 0, -7); x.fill(); x.fillRect(-1, 2, 2, 5);
    },
  },
  // +130 火焰滴（來源 +4）
  {
    id: EXT_BASE_NX + 4, w: 18, h: 26, dir: false, spin: true, draw: (x) => {
      const g = x.createLinearGradient(0, -13, 0, 13); g.addColorStop(0, "#fff6c0"); g.addColorStop(0.5, "#ff8a1e"); g.addColorStop(1, "#ff2a00");
      x.fillStyle = g; x.beginPath(); x.moveTo(0, -13); x.quadraticCurveTo(9, 4, 0, 13); x.quadraticCurveTo(-9, 4, 0, -13); x.fill();
    },
  },
  // +131 絲線紅線（來源 base style 18；marionette 主武器「細針」用。來源 base 18 與 dst base 18
  //      「鳳翼弧焰」內容不同 → 依 §3.1 慣例複製成新 EXT 槽，kit 端常數改指 EXT_BASE + 5。）
  {
    id: EXT_BASE_NX + 5, w: 4, h: 34, dir: false, spin: true, draw: (x) => {
      x.fillStyle = "#ff3355"; x.fillRect(-2, -17, 4, 34); x.fillStyle = "#fff"; x.fillRect(-0.5, -17, 1, 34);
    },
  },
  // +132 撲克牌白卡（來源 base style 17；tenbin A 牌用。來源 base 17 與 dst base 17
  //      「餘燼火星」內容不同 → 依 §3.1 慣例複製成新 EXT 槽，kit 端常數改指 EXT_BASE + 6。）
  {
    id: EXT_BASE_NX + 6, w: 14, h: 20, dir: false, spin: true, draw: (x) => {
      x.fillStyle = "#fff"; x.fillRect(-7, -10, 14, 20); x.fillStyle = "#ff3db8"; x.fillRect(-5, -8, 10, 16); x.fillStyle = "#fff"; x.beginPath(); x.moveTo(0, -4); x.lineTo(3, 0); x.lineTo(0, 4); x.lineTo(-3, 0); x.fill();
    },
  },

  // ── sv（port/003 刻印戰線）批次，+149 起（pugna 用來源 EXT_STYLES +4 衝擊拳波 / +7 破甲釘逐行照搬）──
  // ⚠ 旋轉旗標一律 dir:false / spin:true（＝renderer 純用 b.rot，與來源等價）：
  //   來源 003 renderer 對我方子彈是 `if (b.rot) ctx.rotate(b.rot)` —— 不做速度對齊；
  //   而 svApi 的 spawnPB 已把 b.rot 設為 `ang + π/2`、spin=0。若誤用預設 dir:true，
  //   拳波（kind 23 自移、速度≈0）會被算成 atan2(0,0)+π/2 → 全指向同方向，衝擊波紋歪掉。
  // +153 衝擊拳波（來源 +4；pugna 主武裝／二連擊用）
  {
    id: EXT_BASE_SV + 4, w: 34, h: 26, dir: false, spin: true, draw: (x) => {
      x.globalCompositeOperation = "lighter";
      glowOn(x, "#ffe08a", 24);
      x.strokeStyle = "rgba(255,255,255,.95)"; x.lineWidth = 3.4;
      x.beginPath(); x.arc(0, 4, 13, Math.PI * 1.12, Math.PI * 1.88); x.stroke();
      x.strokeStyle = "rgba(255,120,110,.8)"; x.lineWidth = 2;
      x.beginPath(); x.arc(0, 7, 19, Math.PI * 1.17, Math.PI * 1.83); x.stroke();
      x.beginPath(); x.arc(0, 10, 25, Math.PI * 1.22, Math.PI * 1.78); x.stroke();
      glowOff(x);
      x.globalCompositeOperation = "source-over";
    },
  },
  // +156 破甲釘（來源 +7；pugna 反彈敵彈用）
  {
    id: EXT_BASE_SV + 7, w: 10, h: 30, dir: false, spin: true, draw: (x) => {
      x.globalCompositeOperation = "lighter";
      glowOn(x, "#ff5a6e", 20);
      x.globalCompositeOperation = "source-over";
      x.fillStyle = "#fff";
      x.beginPath(); x.moveTo(0, -15); x.lineTo(3, 6); x.lineTo(0, 15); x.lineTo(-3, 6); x.closePath(); x.fill();
      glowOff(x);
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // a 批次（星魂夜曲 / port/002）：+133 起（EXT_BASE_A），共 16 槽（+0~+15）。
  // ⚠ 旋轉旗標一律 dir:false / spin:true：來源 002 renderer 對我方子彈是
  //   `setT(..., b.rot, ...)`（純用 b.rot，不做速度對齊）；而 aApi 的 spawnPB
  //   已把 b.rot 設為 `ang`（對齊飛行方向）、spin=0。若用預設 dir:true 會多轉 90°。
  //   樣式繪製沿用來源慣例「長軸朝 +x」。
  // +133 赤焰團（來源 +0；kiln 噴焰槍主體）
  { id: EXT_BASE_A + 0, w: 28, h: 28, dir: false, spin: true, draw: (c) => aOrb(c, 0, 0, 14, [[0, "rgba(255,250,210,1)"], [0.3, "rgba(255,170,50,0.85)"], [0.7, "rgba(230,60,20,0.35)"], [1, "rgba(160,20,10,0)"]]) },
  // +134 蒼白焰團（來源 +1；kiln 過熱狀態）
  { id: EXT_BASE_A + 1, w: 30, h: 30, dir: false, spin: true, draw: (c) => aOrb(c, 0, 0, 15, [[0, "rgba(255,255,255,1)"], [0.3, "rgba(170,230,255,0.9)"], [0.7, "rgba(70,130,255,0.4)"], [1, "rgba(30,60,200,0)"]]) },
  // +135 餘燼追蹤彈（來源 +2）
  { id: EXT_BASE_A + 2, w: 18, h: 10, dir: false, spin: true, draw: (c) => {
    aOrb(c, -3, 0, 8, [[0, "rgba(255,200,90,0.9)"], [1, "rgba(255,60,20,0)"]]);
    c.fillStyle = "#fff6d0"; c.beginPath(); c.moveTo(7, 0); c.quadraticCurveTo(0, -3.4, -6, 0); c.quadraticCurveTo(0, 3.4, 7, 0); c.fill();
  } },
  // +136 月輪刃（來源 +3；lunate 弦月）
  { id: EXT_BASE_A + 3, w: 44, h: 44, dir: false, spin: true, draw: (c) => {
    aOrb(c, 0, 0, 22, [[0.55, "rgba(150,170,255,0.0)"], [0.85, "rgba(150,170,255,0.35)"], [1, "rgba(150,170,255,0)"]]);
    c.fillStyle = "#f4f8ff"; c.shadowColor = "#9fb8ff"; c.shadowBlur = 8;
    c.beginPath(); c.arc(0, 0, 17, -2.2, 2.2); c.arc(7, 0, 14, 2.0, -2.0, true); c.closePath(); c.fill();
  } },
  // +137 滿月輪（來源 +4；lunate 強化）
  { id: EXT_BASE_A + 4, w: 64, h: 64, dir: false, spin: true, draw: (c) => {
    aOrb(c, 0, 0, 32, [[0.4, "rgba(255,240,190,0)"], [0.8, "rgba(255,230,160,0.4)"], [1, "rgba(255,200,100,0)"]]);
    c.fillStyle = "#fffbe8"; c.shadowColor = "#ffd978"; c.shadowBlur = 12;
    c.beginPath(); c.arc(0, 0, 25, -2.3, 2.3); c.arc(10, 0, 20, 2.1, -2.1, true); c.closePath(); c.fill();
  } },
  // +138 光之針（來源 +5；oracle 連射）
  { id: EXT_BASE_A + 5, w: 34, h: 6, dir: false, spin: true, draw: (c) => {
    const g = c.createLinearGradient(-17, 0, 17, 0);
    g.addColorStop(0, "rgba(255,230,140,0)"); g.addColorStop(0.7, "rgba(255,240,180,0.9)"); g.addColorStop(1, "#fff");
    c.fillStyle = g; c.beginPath(); c.moveTo(17, 0); c.lineTo(-17, -2.6); c.lineTo(-17, 2.6); c.closePath(); c.fill();
  } },
  // +139 天槍（來源 +6；oracle 審判貫穿）
  { id: EXT_BASE_A + 6, w: 96, h: 18, dir: false, spin: true, draw: (c) => {
    const g = c.createLinearGradient(-48, 0, 48, 0);
    g.addColorStop(0, "rgba(255,200,80,0)"); g.addColorStop(0.6, "rgba(255,225,130,0.85)"); g.addColorStop(1, "#fff");
    c.fillStyle = g; c.beginPath(); c.moveTo(48, 0); c.lineTo(8, -8); c.lineTo(-48, -3); c.lineTo(-48, 3); c.lineTo(8, 8); c.closePath(); c.fill();
    aOrb(c, 40, 0, 12, [[0, "rgba(255,255,255,1)"], [1, "rgba(255,210,100,0)"]]);
  } },
  // +140 鱗粉彈（來源 +7；papilio 靈蝶）
  { id: EXT_BASE_A + 7, w: 20, h: 12, dir: false, spin: true, draw: (c) => {
    aOrb(c, 0, 0, 10, [[0, "rgba(255,230,255,1)"], [0.4, "rgba(255,130,220,0.8)"], [1, "rgba(180,60,255,0)"]]);
    c.fillStyle = "#fff"; c.beginPath(); c.ellipse(1, 0, 5, 2.4, 0, 0, Math.PI * 2); c.fill();
  } },
  // +141 蝶形彈（來源 +8；papilio 奧義）
  { id: EXT_BASE_A + 8, w: 26, h: 22, dir: false, spin: true, draw: (c) => {
    aOrb(c, 0, 0, 13, [[0, "rgba(255,200,255,0.5)"], [1, "rgba(160,60,255,0)"]]);
    c.fillStyle = "#ffb6f0"; c.strokeStyle = "#fff"; c.lineWidth = 1;
    for (const s of [-1, 1]) {
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(3, s * 11, 10, s * 10, 8, s * 3); c.bezierCurveTo(6, s * 1, 3, 0, 0, 0); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-2, s * 7, -8, s * 8, -7, s * 2); c.closePath(); c.fillStyle = "#c78bff"; c.fill(); c.fillStyle = "#ffb6f0";
    }
  } },
  // +142 鉤鎖彈（來源 +9；tether 連鎖）
  { id: EXT_BASE_A + 9, w: 28, h: 12, dir: false, spin: true, draw: (c) => {
    aOrb(c, 0, 0, 12, [[0, "rgba(190,150,255,0.5)"], [1, "rgba(100,60,255,0)"]]);
    c.fillStyle = "#e8ecf6"; c.strokeStyle = "#7d6fb0"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(13, 0); c.lineTo(3, -4.5); c.lineTo(5, -1.4); c.lineTo(-6, -1.4); c.lineTo(-6, 1.4); c.lineTo(5, 1.4); c.lineTo(3, 4.5); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(-9, 0, 3.4, 2.2, 0, 0, Math.PI * 2); c.stroke();
  } },
  // +143 鎖環（來源 +10）
  { id: EXT_BASE_A + 10, w: 14, h: 10, dir: false, spin: true, draw: (c) => {
    c.strokeStyle = "#d8def0"; c.lineWidth = 2.2; c.shadowColor = "#a98bff"; c.shadowBlur = 6;
    c.beginPath(); c.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2); c.stroke();
  } },
  // +144 彗星砲彈（來源 +11）
  { id: EXT_BASE_A + 11, w: 34, h: 20, dir: false, spin: true, draw: (c) => {
    const g = c.createLinearGradient(-17, 0, 6, 0);
    g.addColorStop(0, "rgba(255,120,30,0)"); g.addColorStop(1, "rgba(255,190,80,0.9)");
    c.fillStyle = g; c.beginPath(); c.moveTo(6, -6); c.lineTo(-17, 0); c.lineTo(6, 6); c.closePath(); c.fill();
    aOrb(c, 6, 0, 8, [[0, "#ffffff"], [0.5, "rgba(255,220,130,0.95)"], [1, "rgba(255,100,30,0)"]]);
  } },
  // +145 星屑碎片（來源 +12）
  { id: EXT_BASE_A + 12, w: 16, h: 8, dir: false, spin: true, draw: (c) => {
    aOrb(c, 0, 0, 8, [[0, "rgba(180,230,255,0.7)"], [1, "rgba(60,120,255,0)"]]);
    c.fillStyle = "#f2fbff"; c.beginPath(); c.moveTo(7, 0); c.lineTo(-1, -3); c.lineTo(-6, 0); c.lineTo(-1, 3); c.closePath(); c.fill();
  } },
  // +146 流星機槍（來源 +13）
  { id: EXT_BASE_A + 13, w: 22, h: 6, dir: false, spin: true, draw: (c) => {
    const g = c.createLinearGradient(-11, 0, 11, 0);
    g.addColorStop(0, "rgba(120,200,255,0)"); g.addColorStop(1, "#ffffff");
    c.fillStyle = g; c.beginPath(); c.moveTo(11, 0); c.lineTo(-11, -2.4); c.lineTo(-11, 2.4); c.closePath(); c.fill();
  } },
  // +147 星爆彈（來源 +14）
  { id: EXT_BASE_A + 14, w: 26, h: 26, dir: false, spin: true, draw: (c) => {
    aOrb(c, 0, 0, 13, [[0, "#ffffff"], [0.35, "rgba(255,210,120,0.95)"], [1, "rgba(255,90,30,0)"]]);
  } },
  // +148 朔月主砲光針（來源 base 樣式 1 的複本；lunate 雙軌交替擲出）
  { id: EXT_BASE_A + 15, w: 24, h: 6, dir: false, spin: true, draw: (c) => {
    const g = c.createLinearGradient(-12, 0, 0, 0);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(170,220,255,0.8)");
    c.fillStyle = g; c.beginPath(); c.moveTo(0, -2.4); c.lineTo(-12, 0); c.lineTo(0, 2.4); c.closePath(); c.fill();
    c.fillStyle = "#fff"; c.beginPath(); c.moveTo(11, 0); c.lineTo(-3, -1.8); c.lineTo(-3, 1.8); c.fill();
  } },

  // ── sx（port/010 星燼曙約）批次，+0~+18（來源 A 自訂樣式絕對 170~189 逐行照搬）──
  // 曉星
  { id: EXT_BASE_SX + 0, w: 22, h: 50, draw: (c) => { sxSoft(c, 20, "rgba(255,214,120,0.5)"); sxFeather(c, 16, 44, [[0, "#ffffff"], [0.5, "#ffe9a8"], [1, "#f2b03a"]], "#c98a14"); } },
  { id: EXT_BASE_SX + 1, w: 28, h: 28, spin: true, dir: false, draw: (c) => {
    sxSoft(c, 14, "rgba(255,240,180,0.7)");
    c.fillStyle = "#fffbe8"; c.beginPath();
    for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r = i % 2 ? 4 : 11; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    c.closePath(); c.fill();
  } },
  { id: EXT_BASE_SX + 2, w: 36, h: 96, draw: (c) => { sxSoft(c, 36, "rgba(255,200,90,0.45)"); sxFeather(c, 28, 90, [[0, "#ffffff"], [0.35, "#fff0b8"], [1, "#ff9d1c"]], "#ffdf8a"); } },
  { id: EXT_BASE_SX + 3, w: 26, h: 58, draw: (c) => { sxSoft(c, 24, "rgba(255,255,255,0.55)"); sxFeather(c, 18, 52, [[0, "#ffffff"], [0.6, "#fff6d6"], [1, "#ffd36a"]], "#ffffff"); } },
  // 鐵幕
  { id: EXT_BASE_SX + 4, w: 28, h: 42, draw: (c) => {
    sxSoft(c, 22, "rgba(255,140,50,0.45)");
    c.beginPath(); c.moveTo(0, -18); c.quadraticCurveTo(10, -8, 9, 14); c.lineTo(-9, 14); c.quadraticCurveTo(-10, -8, 0, -18);
    c.fillStyle = sxShellGrad(c); c.fill(); c.strokeStyle = "#2a1408"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = "#ffcf7a"; c.fillRect(-9, 2, 18, 3);
    c.fillStyle = "#ff6a1c"; c.beginPath(); c.arc(0, -13, 3, 0, 7); c.fill();
  } },
  { id: EXT_BASE_SX + 5, w: 18, h: 46, draw: (c) => {
    c.fillStyle = sxLgY(c, 10, 22, [[0, "#fff3b0"], [1, "rgba(255,90,20,0)"]]); c.beginPath(); c.moveTo(-3, 12); c.lineTo(0, 22); c.lineTo(3, 12); c.fill();
    c.fillStyle = sxRocketGrad(c); c.fillRect(-4, -10, 8, 22);
    c.fillStyle = "#ff7a2a"; c.beginPath(); c.moveTo(-4, -10); c.lineTo(0, -20); c.lineTo(4, -10); c.fill();
    c.fillStyle = "#4a4a56"; c.fillRect(-7, 6, 3, 6); c.fillRect(4, 6, 3, 6);
  } },
  { id: EXT_BASE_SX + 6, w: 14, h: 22, draw: (c) => { c.fillStyle = sxLgY(c, -10, 10, [[0, "#fff0c0"], [1, "#ff6a1c"]]); c.beginPath(); c.moveTo(0, -10); c.lineTo(5, 0); c.lineTo(0, 10); c.lineTo(-5, 0); c.fill(); } },
  { id: EXT_BASE_SX + 7, w: 46, h: 74, draw: (c) => {
    sxSoft(c, 38, "rgba(255,90,30,0.55)");
    c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(17, -14, 15, 26); c.lineTo(-15, 26); c.quadraticCurveTo(-17, -14, 0, -32);
    c.fillStyle = sxLgH(c, -15, 15, [[0, "#4a2210"], [0.5, "#ffa04a"], [1, "#4a2210"]]); c.fill(); c.strokeStyle = "#1a0a04"; c.lineWidth = 2; c.stroke();
    c.fillStyle = "#ffd83a"; c.fillRect(-15, -2, 30, 5); c.fillRect(-15, 12, 30, 5);
    c.fillStyle = "#ff3a1c"; c.beginPath(); c.arc(0, -22, 5, 0, 7); c.fill();
  } },
  // 蒼穹
  { id: EXT_BASE_SX + 8, w: 14, h: 38, draw: (c) => { sxSoft(c, 14, "rgba(90,220,255,0.5)"); sxNeedle(c, 8, 34, [[0, "#ffffff"], [0.5, "#8fefff"], [1, "#1a9cff"]]); } },
  { id: EXT_BASE_SX + 9, w: 20, h: 20, spin: true, dir: false, draw: (c) => {
    sxSoft(c, 10, "rgba(140,240,255,0.6)");
    c.beginPath(); c.moveTo(0, -8); c.lineTo(7, 0); c.lineTo(0, 8); c.lineTo(-7, 0); c.closePath();
    c.fillStyle = sxLgY(c, -8, 8, [[0, "#ffffff"], [1, "#3ec8ff"]]); c.fill(); c.strokeStyle = "#d8fbff"; c.lineWidth = 1; c.stroke();
  } },
  // 夜叉
  { id: EXT_BASE_SX + 10, w: 44, h: 32, draw: (c) => { sxSoft(c, 20, "rgba(255,40,90,0.35)"); c.translate(0, 8); sxCrescent(c, 20, 14, [[0, "#ffe6ee"], [0.4, "#ff4d8a"], [1, "#7a0f3a"]], "#ffd0e0"); } },
  { id: EXT_BASE_SX + 11, w: 34, h: 28, draw: (c) => {
    sxSoft(c, 17, "rgba(190,90,255,0.4)");
    c.fillStyle = "#4a1a78"; c.strokeStyle = "#e6a8ff"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, -4); c.lineTo(-6, -11); c.lineTo(-15, -6); c.lineTo(-10, 0); c.lineTo(-13, 7); c.lineTo(-5, 3); c.lineTo(0, 10); c.lineTo(5, 3); c.lineTo(13, 7); c.lineTo(10, 0); c.lineTo(15, -6); c.lineTo(6, -11); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = "#ff3a7a"; c.fillRect(-4, -3, 3, 2); c.fillRect(1, -3, 3, 2);
  } },
  { id: EXT_BASE_SX + 12, w: 72, h: 50, draw: (c) => { sxSoft(c, 36, "rgba(255,40,90,0.4)"); c.translate(0, 14); sxCrescent(c, 34, 24, [[0, "#ffffff"], [0.35, "#ff5a9a"], [1, "#8a0a3a"]], "#ffe0ee"); } },
  // 青蘿
  { id: EXT_BASE_SX + 13, w: 20, h: 26, draw: (c) => {
    sxSoft(c, 12, "rgba(255,150,210,0.45)");
    c.beginPath(); c.moveTo(0, -11); c.quadraticCurveTo(9, -3, 0, 11); c.quadraticCurveTo(-9, -3, 0, -11);
    c.fillStyle = sxLgY(c, -11, 11, [[0, "#fff0f8"], [1, "#ff7ac0"]]); c.fill(); c.strokeStyle = "#ffd0ea"; c.lineWidth = 0.8; c.stroke();
  } },
  { id: EXT_BASE_SX + 14, w: 20, h: 30, draw: (c) => {
    sxSoft(c, 13, "rgba(110,255,170,0.4)");
    c.beginPath(); c.moveTo(0, -13); c.quadraticCurveTo(10, -2, 0, 13); c.quadraticCurveTo(-10, -2, 0, -13);
    c.fillStyle = sxLgY(c, -13, 13, [[0, "#eafff2"], [1, "#2fd47a"]]); c.fill();
    c.strokeStyle = "rgba(255,255,255,0.8)"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -10); c.lineTo(0, 10); c.stroke();
  } },
  { id: EXT_BASE_SX + 15, w: 16, h: 16, spin: true, dir: false, draw: (c) => { sxSoft(c, 8, "rgba(255,240,150,0.8)"); c.fillStyle = "#fffbd0"; c.beginPath(); c.arc(0, 0, 3, 0, 7); c.fill(); } },
  // 望舒
  { id: EXT_BASE_SX + 16, w: 58, h: 58, spin: true, dir: false, draw: (c) => {
    sxSoft(c, 29, "rgba(170,190,255,0.4)");
    c.beginPath(); c.arc(0, 0, 25, 0.35, Math.PI * 2 - 0.35); c.arc(7, 0, 20, Math.PI * 2 - 0.5, 0.5, true); c.closePath();
    c.fillStyle = sxRgC(c, 25, [[0.2, "#ffffff"], [0.8, "#c8d4ff"], [1, "#7f94ee"]]); c.fill(); c.strokeStyle = "#ffffff"; c.lineWidth = 1.2; c.stroke();
  } },
  { id: EXT_BASE_SX + 17, w: 16, h: 46, draw: (c) => {
    sxSoft(c, 17, "rgba(190,210,255,0.45)");
    c.beginPath(); c.moveTo(0, -22); c.lineTo(6, -8); c.lineTo(2, -8); c.lineTo(2, 22); c.lineTo(-2, 22); c.lineTo(-2, -8); c.lineTo(-6, -8); c.closePath();
    c.fillStyle = sxLgY(c, -22, 22, [[0, "#ffffff"], [1, "#8aa0ff"]]); c.fill();
  } },
  { id: EXT_BASE_SX + 18, w: 30, h: 30, spin: true, dir: false, draw: (c) => {
    sxSoft(c, 15, "rgba(170,190,255,0.45)");
    c.beginPath(); c.arc(0, 0, 12, 0.4, Math.PI * 2 - 0.4); c.arc(4, 0, 9.5, Math.PI * 2 - 0.55, 0.55, true); c.closePath();
    c.fillStyle = "#eef2ff"; c.fill();
  } },
];

// ══════════════════════════════════════════════════════════════════════════
// 011（port/011 星紋戰翼）批次樣式槽：+180 起。
// 來源 EXT_STYLES +0~+17 逐行照搬（來源自身 base 為 170），改掛到 EXT_BASE_011。
// 來源檔自帶 haloG／diamond 兩個繪圖小工具，在此加 011 後綴避免與本檔既有同名函式衝突。
// ══════════════════════════════════════════════════════════════════════════
/** 星紋戰翼（011 / port/011）批次樣式槽：+180 起（sx +157~+175 之後）。 */
export const EXT_BASE_011 = 180;

{
  const add011 = (n: number, w: number, h: number, draw: (x: C) => void, dir?: boolean, spin?: boolean) => {
    EXT_STYLES.push({ id: EXT_BASE_011 + n, w, h, draw, dir, spin });
  };
  const haloG011 = (x: C, col: string, rw: number, rh: number) => {
    const g = x.createRadialGradient(0, 0, 0, 0, 0, Math.max(rw, rh));
    g.addColorStop(0, col);
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.save();
    x.globalCompositeOperation = "lighter";
    x.scale(rw / Math.max(rw, rh), rh / Math.max(rw, rh));
    x.fillStyle = g;
    x.beginPath();
    x.arc(0, 0, Math.max(rw, rh), 0, TAU);
    x.fill();
    x.restore();
  };
  const diamond011 = (x: C, w: number, h: number, c0: string, c1: string) => {
    const g = x.createLinearGradient(0, -h / 2, 0, h / 2);
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(0, -h / 2);
    x.lineTo(w / 2, 0);
    x.lineTo(0, h / 2);
    x.lineTo(-w / 2, 0);
    x.closePath();
    x.fill();
  };

  // +0 金色飛牌
  add011(0, 22, 30, (x) => {
    haloG011(x, "rgba(255,210,63,0.7)", 11, 15);
    x.fillStyle = "#fff6d6";
    x.strokeStyle = "#ffd23f";
    x.lineWidth = 1.4;
    x.beginPath();
    x.roundRect(-6, -9, 12, 18, 2);
    x.fill();
    x.stroke();
    x.fillStyle = "#e5162e";
    x.beginPath();
    x.moveTo(0, -5);
    x.lineTo(3, 0);
    x.lineTo(0, 5);
    x.lineTo(-3, 0);
    x.closePath();
    x.fill();
  });
  // +1 黑羽
  add011(1, 14, 32, (x) => {
    haloG011(x, "rgba(255,59,92,0.6)", 7, 16);
    x.fillStyle = "#1a1220";
    x.strokeStyle = "#ff3b5c";
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(0, -15);
    x.quadraticCurveTo(6, -2, 0, 15);
    x.quadraticCurveTo(-6, -2, 0, -15);
    x.fill();
    x.stroke();
  });
  // +2 赤刃
  add011(2, 12, 34, (x) => {
    haloG011(x, "rgba(255,42,74,0.75)", 6, 17);
    diamond011(x, 5, 30, "#ffffff", "#ff2a4a");
  });
  // +3 巨型月牙（實際尺寸以 b.scale 放大）
  add011(3, 84, 56, (x) => {
    haloG011(x, "rgba(255,42,74,0.6)", 42, 28);
    const g = x.createLinearGradient(0, -24, 0, 18);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.5, "#ff9aa8");
    g.addColorStop(1, "#ff2a4a");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(-38, 14);
    x.quadraticCurveTo(0, -48, 38, 14);
    x.quadraticCurveTo(0, -16, -38, 14);
    x.fill();
  });
  // +4 霜晶針
  add011(4, 12, 34, (x) => {
    haloG011(x, "rgba(143,227,255,0.7)", 6, 17);
    diamond011(x, 6, 30, "#ffffff", "#8fe3ff");
  });
  // +5 粉霜矢
  add011(5, 14, 30, (x) => {
    haloG011(x, "rgba(255,154,213,0.7)", 7, 15);
    diamond011(x, 6, 26, "#ffffff", "#ff9ad5");
  });
  // +6 冰片
  add011(6, 16, 22, (x) => {
    haloG011(x, "rgba(160,235,255,0.65)", 8, 11);
    x.fillStyle = "#ffffff";
    x.beginPath();
    x.moveTo(0, -10);
    x.lineTo(4, 2);
    x.lineTo(0, 9);
    x.lineTo(-4, 2);
    x.closePath();
    x.fill();
  });
  // +7 星屑
  add011(7, 22, 22, (x) => {
    haloG011(x, "rgba(57,224,255,0.75)", 11, 11);
    x.fillStyle = "#ffffff";
    x.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? 2.4 : 6.5;
      const a = (i / 8) * TAU;
      x.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    x.closePath();
    x.fill();
  }, false, true);
  // +8 星槍
  add011(8, 10, 46, (x) => {
    haloG011(x, "rgba(57,224,255,0.75)", 5, 23);
    diamond011(x, 4, 44, "#ffffff", "#39e0ff");
  });
  // +9 重砲彈
  add011(9, 18, 34, (x) => {
    haloG011(x, "rgba(255,138,31,0.75)", 9, 17);
    x.fillStyle = "#ffe2b0";
    x.beginPath();
    x.roundRect(-4, -12, 8, 22, 4);
    x.fill();
    x.fillStyle = "#ff8a1f";
    x.fillRect(-4, 4, 8, 6);
  });
  // +10 幽火
  add011(10, 22, 32, (x) => {
    haloG011(x, "rgba(180,140,255,0.8)", 11, 16);
    const g = x.createLinearGradient(0, -14, 0, 14);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.5, "#d9c2ff");
    g.addColorStop(1, "rgba(130,80,255,0)");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(0, -12);
    x.bezierCurveTo(7, -2, 6, 8, 0, 14);
    x.bezierCurveTo(-6, 8, -7, -2, 0, -12);
    x.fill();
  });
  // +11 靈羽（金）
  add011(11, 14, 30, (x) => {
    haloG011(x, "rgba(255,214,107,0.75)", 7, 15);
    x.fillStyle = "#fff4cf";
    x.beginPath();
    x.moveTo(0, -14);
    x.quadraticCurveTo(6, 0, 0, 14);
    x.quadraticCurveTo(-3, 0, 0, -14);
    x.fill();
  });
  // +12 機槍曳光（橙）
  add011(12, 10, 26, (x) => {
    haloG011(x, "rgba(255,170,60,0.7)", 5, 13);
    diamond011(x, 4, 22, "#ffffff", "#ff9a2a");
  });
  // +13 白光針（通用）
  add011(13, 10, 30, (x) => {
    haloG011(x, "rgba(220,240,255,0.7)", 5, 15);
    diamond011(x, 4, 28, "#ffffff", "#bfe0ff");
  });
  // +14 塔羅幽牌（紫金）
  add011(14, 24, 32, (x) => {
    haloG011(x, "rgba(180,140,255,0.7)", 12, 16);
    x.fillStyle = "#1a0d33";
    x.strokeStyle = "#ffd66b";
    x.lineWidth = 1.4;
    x.beginPath();
    x.roundRect(-7, -10, 14, 20, 2);
    x.fill();
    x.stroke();
    x.fillStyle = "#ff6bd6";
    x.beginPath();
    x.arc(0, 0, 3, 0, TAU);
    x.fill();
  }, false, true);
  // +15 翠風羽刃
  add011(15, 30, 22, (x) => {
    haloG011(x, "rgba(61,255,176,0.65)", 15, 11);
    const g = x.createLinearGradient(0, -10, 0, 8);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#2ed398");
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(-13, 6);
    x.quadraticCurveTo(0, -18, 13, 6);
    x.quadraticCurveTo(0, -4, -13, 6);
    x.fill();
  });
  // +16 暗金重力針（玄影）
  add011(16, 12, 36, (x) => {
    haloG011(x, "rgba(197,139,255,0.7)", 6, 18);
    diamond011(x, 5, 32, "#ffe9b0", "#8a3dff");
  });
  // +17 紫雷球（紫電反轉雷彈）
  add011(17, 24, 24, (x) => {
    haloG011(x, "rgba(178,107,255,0.85)", 12, 12);
    x.fillStyle = "#fffbe0";
    x.beginPath();
    x.arc(0, 0, 4, 0, TAU);
    x.fill();
    x.strokeStyle = "#ffe45c";
    x.lineWidth = 1.4;
    x.beginPath();
    x.moveTo(-8, -2);
    x.lineTo(-2, 2);
    x.lineTo(2, -3);
    x.lineTo(8, 2);
    x.stroke();
  }, false, true);
}


// ============================================================================
// 011 覆寫來源（天頂星紋彈幕協奏）批次樣式槽：+198 起（011 星紋戰翼 +180~+197 之後）。
//
// 來源 EXT_STYLES +0~+32 逐行照搬（來源自身 base 為 170），改掛到 EXT_BASE_ZS011。
// 這 33 式是**夜鴉技能**（來源 skills/yagarasu.ts）唯一會用到的：X+18 飛牌、X+19 黑羽。
// 來源檔的 `glow` 與 `SP` primitive 在此就地內嵌（本檔維持「不 import 任何模組」）。
// ============================================================================
/** 天頂星紋彈幕協奏（011 覆寫來源）批次樣式槽：+198 起。 */
export const EXT_BASE_ZS011 = 198;

{
  const glowZs011 = (color: string, size = 64) => {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d")!;
    g.fillStyle = color;
    g.fillRect(0, 0, size, size);
    g.globalCompositeOperation = "destination-in";
    const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gr.addColorStop(0, "rgba(0,0,0,1)");
    gr.addColorStop(0.28, "rgba(0,0,0,0.55)");
    gr.addColorStop(0.62, "rgba(0,0,0,0.14)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, size, size);
    return c;
  };
  const SP011 = {
    halo(g: C, w: number, h: number, c: string, a = 0.8) {
      g.globalAlpha = a;
      g.drawImage(glowZs011(c, 64), -w * 0.85, -h * 0.62, w * 1.7, h * 1.24);
      g.globalAlpha = 1;
    },
    drop(g: C, w: number, h: number, c0: string, c1: string, c2: string) {
      const gr = g.createLinearGradient(0, -h / 2, 0, h / 2);
      gr.addColorStop(0, c0);
      gr.addColorStop(0.45, c1);
      gr.addColorStop(1, c2);
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(0, -h / 2);
      g.bezierCurveTo(w * 0.55, -h * 0.12, w * 0.5, h * 0.38, 0, h / 2);
      g.bezierCurveTo(-w * 0.5, h * 0.38, -w * 0.55, -h * 0.12, 0, -h / 2);
      g.fill();
    },
    needle(g: C, w: number, h: number, c0: string, c1: string) {
      const gr = g.createLinearGradient(0, -h / 2, 0, h / 2);
      gr.addColorStop(0, c0);
      gr.addColorStop(1, c1);
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(0, -h / 2);
      g.lineTo(w / 2, h / 3);
      g.lineTo(0, h / 2);
      g.lineTo(-w / 2, h / 3);
      g.closePath();
      g.fill();
    },
    cres(g: C, w: number, h: number, c0: string, c1: string) {
      const gr = g.createLinearGradient(0, -h / 2, 0, h / 2);
      gr.addColorStop(0, c0);
      gr.addColorStop(1, c1);
      g.fillStyle = gr;
      g.beginPath();
      g.moveTo(-w / 2, h / 2);
      g.quadraticCurveTo(0, -h * 0.95, w / 2, h / 2);
      g.quadraticCurveTo(0, -h * 0.02, -w / 2, h / 2);
      g.fill();
    },
    orb(g: C, r: number, c0: string, c1: string) {
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
      gr.addColorStop(0, c0);
      gr.addColorStop(1, c1);
      g.fillStyle = gr;
      g.beginPath();
      g.arc(0, 0, r, 0, TAU);
      g.fill();
    },
    missile(g: C, w: number, h: number, body: string, nose: string, fl: string) {
      g.fillStyle = body;
      g.fillRect(-w * 0.28, -h * 0.2, w * 0.56, h * 0.5);
      g.fillStyle = nose;
      g.beginPath();
      g.moveTo(-w * 0.28, -h * 0.2);
      g.lineTo(0, -h / 2);
      g.lineTo(w * 0.28, -h * 0.2);
      g.fill();
      g.fillStyle = fl;
      g.beginPath();
      g.moveTo(-w * 0.2, h * 0.3);
      g.lineTo(0, h / 2);
      g.lineTo(w * 0.2, h * 0.3);
      g.fill();
    },
  };

  const addZs011 = (n: number, w: number, h: number, draw: (g: C) => void, dir?: boolean, spin?: boolean) => {
    EXT_STYLES.push({ id: EXT_BASE_ZS011 + n, w, h, draw, dir, spin });
  };
  const starZs011 = (g: C, r: number, n: number, k: number, fill: string) => {
    g.fillStyle = fill;
    g.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const a = (i * Math.PI) / n - Math.PI / 2, rr = i % 2 ? r * k : r;
      g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.closePath();
    g.fill();
  };

  // ── 赤鴉：焰羽、凰羽火球、餘燼星火
  addZs011(0, 22, 44, (g) => { SP011.halo(g, 22, 44, "#ff7a2a"); SP011.drop(g, 12, 38, "#fff0c0", "#ff8a24", "#c81818"); g.strokeStyle = "rgba(255,230,160,.8)"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -14); g.lineTo(0, 12); g.stroke(); });
  addZs011(1, 64, 90, (g) => { SP011.halo(g, 64, 90, "#ffb83a"); SP011.drop(g, 44, 80, "#ffffff", "#ffc23a", "#e83a14"); g.fillStyle = "rgba(255,255,255,.7)"; g.beginPath(); g.ellipse(0, -8, 5, 16, 0, 0, 6.3); g.fill(); });
  addZs011(2, 16, 16, (g) => { SP011.halo(g, 16, 16, "#ff9a3a"); SP011.orb(g, 4, "#ffffff", "#ff8a1a"); }, false);
  // ── 蒼槍：光矛、天降巨槍
  addZs011(3, 18, 84, (g) => { SP011.halo(g, 18, 84, "#47c2ff"); SP011.needle(g, 7, 80, "#ffffff", "#2f8bff"); g.fillStyle = "#eaffff"; g.fillRect(-0.8, -34, 1.6, 52); });
  addZs011(4, 44, 220, (g) => { SP011.halo(g, 44, 220, "#7ad6ff", 0.7); SP011.needle(g, 26, 210, "#ffffff", "#47c2ff"); g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(-2, -90, 4, 150); });
  // ── 翠嵐：風刃、氣旋
  addZs011(5, 52, 38, (g) => { SP011.halo(g, 52, 38, "#3dffb0", 0.5); SP011.cres(g, 48, 34, "#ffffff", "#17c488"); });
  addZs011(6, 30, 30, (g) => { SP011.halo(g, 30, 30, "#3dffb0", 0.6); g.strokeStyle = "#eafff6"; g.lineWidth = 2.2; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(0, 0, 4 + i * 3.6, i * 2, i * 2 + 3.6); g.stroke(); } }, false, true);
  // ── 紫電：電弧、雷球
  addZs011(7, 16, 34, (g) => { SP011.halo(g, 16, 34, "#b26bff"); SP011.needle(g, 8, 30, "#fff6b0", "#a35cff"); });
  addZs011(8, 26, 26, (g) => { SP011.halo(g, 26, 26, "#ffe45c"); SP011.orb(g, 9, "#ffffff", "#c79bff"); g.strokeStyle = "#ffe45c"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-6, -2); g.lineTo(-1, 1); g.lineTo(-2, 3); g.lineTo(6, 4); g.stroke(); }, false, true);
  // ── 玄影：重力榴彈、暗影針
  addZs011(9, 52, 52, (g) => { SP011.halo(g, 52, 52, "#b07cff", 0.9); SP011.orb(g, 12, "#1a0830", "#000"); g.strokeStyle = "#ffd36b"; g.lineWidth = 1.8; g.beginPath(); g.arc(0, 0, 17, 0.4, 3.0); g.stroke(); g.strokeStyle = "#c58bff"; g.beginPath(); g.arc(0, 0, 21, 3.6, 6.1); g.stroke(); }, false, true);
  addZs011(10, 12, 40, (g) => { SP011.needle(g, 6, 38, "#f0e0ff", "#7a40e8"); g.fillStyle = "rgba(255,211,107,.8)"; g.fillRect(-0.7, -10, 1.4, 22); });
  // ── 星輝：脈衝、微型飛彈、加特林、機神砲、折射彈
  addZs011(11, 18, 36, (g) => { g.fillStyle = "#4ac8ff"; g.beginPath(); g.moveTo(0, -17); g.lineTo(8, 0); g.lineTo(0, 17); g.lineTo(-8, 0); g.fill(); g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0, -11); g.lineTo(3.6, 0); g.lineTo(0, 11); g.lineTo(-3.6, 0); g.fill(); });
  addZs011(12, 16, 38, (g) => { SP011.missile(g, 12, 34, "#ffffff", "#4adfff", "#ffb23a"); });
  addZs011(13, 12, 34, (g) => { SP011.halo(g, 12, 34, "#bfe9ff", 0.6); SP011.needle(g, 5, 32, "#ffffff", "#7cc8ff"); });
  addZs011(14, 36, 70, (g) => { SP011.halo(g, 36, 70, "#7cf3ff"); SP011.needle(g, 18, 64, "#ffffff", "#2ac8ff"); });
  addZs011(15, 18, 18, (g) => { SP011.orb(g, 7, "#ffffff", "#7ae8ff"); g.strokeStyle = "#fff"; g.lineWidth = 1; g.strokeRect(-4, -4, 8, 8); }, false, true);
  // ── 紅月：赤刃、月牙斬
  addZs011(16, 14, 30, (g) => { SP011.halo(g, 14, 30, "#ff2a4a"); SP011.needle(g, 7, 28, "#ffffff", "#ff2a4a"); });
  addZs011(17, 64, 44, (g) => { SP011.halo(g, 64, 44, "#ff1a3c", 0.8); SP011.cres(g, 58, 40, "#ffffff", "#e5162e"); g.strokeStyle = "rgba(255,255,255,.85)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(-26, 16); g.quadraticCurveTo(0, -30, 26, 16); g.stroke(); });
  // ── 夜鴉：飛牌、黑羽
  addZs011(18, 20, 28, (g) => { g.fillStyle = "#fff8e0"; g.strokeStyle = "#ffd23f"; g.lineWidth = 1.4; g.beginPath(); g.roundRect(-8, -12, 16, 24, 3); g.fill(); g.stroke(); g.fillStyle = "#e8112d"; g.beginPath(); g.moveTo(0, -6); g.lineTo(4, 0); g.lineTo(0, 6); g.lineTo(-4, 0); g.fill(); SP011.halo(g, 22, 30, "#ffd23f", 0.35); }, false, true);
  addZs011(19, 14, 34, (g) => { SP011.halo(g, 14, 34, "#ffd23f", 0.4); g.fillStyle = "#0e0e16"; g.strokeStyle = "#ffd23f"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -16); g.quadraticCurveTo(7, -2, 2, 15); g.lineTo(0, 10); g.lineTo(-2, 15); g.quadraticCurveTo(-7, -2, 0, -16); g.fill(); g.stroke(); });
  // ── 鐵壘：重砲彈、飛彈、榴彈
  addZs011(20, 26, 32, (g) => { SP011.halo(g, 26, 32, "#ff8a1f"); g.fillStyle = "#ffffff"; g.beginPath(); g.moveTo(0, -15); g.lineTo(9, -6); g.lineTo(9, 14); g.lineTo(-9, 14); g.lineTo(-9, -6); g.fill(); g.fillStyle = "#ff8a1f"; g.beginPath(); g.moveTo(0, -12); g.lineTo(6, -5); g.lineTo(-6, -5); g.fill(); });
  addZs011(21, 18, 40, (g) => { SP011.missile(g, 14, 36, "#e9edf5", "#ff8a1f", "#ffd56a"); });
  addZs011(22, 24, 24, (g) => { SP011.halo(g, 26, 26, "#ffb347"); SP011.orb(g, 7, "#ffffff", "#ffb347"); }, false);
  // ── 辰星：星屑、縱列光槍
  addZs011(23, 26, 26, (g) => { SP011.halo(g, 26, 26, "#39e0ff"); starZs011(g, 10, 4, 0.4, "#ffffff"); starZs011(g, 6, 4, 0.4, "#39e0ff"); }, false, true);
  addZs011(24, 14, 52, (g) => { SP011.halo(g, 14, 52, "#39e0ff"); SP011.needle(g, 6, 50, "#ffffff", "#39e0ff"); });
  // ── 霜華：冰針、霜矢、碎片
  addZs011(25, 14, 34, (g) => { SP011.halo(g, 14, 34, "#8fe3ff"); SP011.needle(g, 8, 30, "#ffffff", "#7fd0f6"); });
  addZs011(26, 18, 40, (g) => { SP011.halo(g, 18, 40, "#ff9ad5", 0.6); SP011.needle(g, 8, 36, "#ffffff", "#ff9ad5"); });
  addZs011(27, 14, 14, (g) => { g.fillStyle = "#ffffff"; g.strokeStyle = "#8fe3ff"; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -6); g.lineTo(3.4, 0); g.lineTo(0, 6); g.lineTo(-3.4, 0); g.closePath(); g.fill(); g.stroke(); SP011.halo(g, 14, 14, "#8fe3ff", 0.4); });
  // ── 幽冥：幽火、金珠、牌
  addZs011(28, 20, 36, (g) => { SP011.halo(g, 20, 36, "#b48cff"); SP011.drop(g, 12, 30, "#ffffff", "#b48cff", "#5a2ac8"); });
  addZs011(29, 22, 22, (g) => { SP011.halo(g, 24, 24, "#ffd36b"); SP011.orb(g, 7, "#ffffff", "#ffc83a"); }, false, true);
  addZs011(30, 16, 24, (g) => { g.fillStyle = "#1a0d33"; g.strokeStyle = "#efe4ff"; g.lineWidth = 1.2; g.beginPath(); g.roundRect(-6, -10, 12, 20, 2); g.fill(); g.stroke(); starZs011(g, 4, 4, 0.4, "#ffd36b"); SP011.halo(g, 18, 26, "#b48cff", 0.4); });
  // ── 通用：雷彈（反轉用）、追蹤赤刃
  addZs011(31, 18, 30, (g) => { SP011.halo(g, 20, 34, "#ffe45c"); SP011.needle(g, 8, 28, "#ffffff", "#c79bff"); });
  addZs011(32, 14, 28, (g) => { SP011.halo(g, 14, 28, "#ff4a64"); SP011.needle(g, 7, 26, "#ffd9df", "#ff2a4a"); });
}

// ══════════════════════════════════════════════════════════════════════════
// TT（port/011/星紋天域）批次樣式槽：+231 起（zs011 +198~+230 之後）。
// 來源 EXT_STYLES +0~+15 逐行照搬（來源自身 base 為 170），改掛到 EXT_BASE_TT。
// 來源以「朝右」繪製 → 本檔統一是「彈頭朝上」：w/h 互換 ＋ 旋轉 -90°（upTt）。
// 來源的 orb（w===h 且 spin）不轉座標系，只把原點從左上移到畫布中心（ctrTt）。
// ══════════════════════════════════════════════════════════════════════════
/** 星紋天域（TT / port/011 星紋天域）批次樣式槽：+231 起。 */
export const EXT_BASE_TT = 231;

{
  const addTt = (n: number, w: number, h: number, draw: (x: C) => void, dir?: boolean, spin?: boolean) => {
    EXT_STYLES.push({ id: EXT_BASE_TT + n, w, h, draw, dir, spin });
  };
  /** 來源「朝右」繪製 → 彈頭朝上：原點由畫布中心轉回來源座標系左上，再旋轉 -90°。 */
  const upTt = (sw: number, sh: number, draw: (x: C, w: number, h: number) => void) => (x: C) => {
    x.save();
    x.rotate(-Math.PI / 2);
    x.translate(-sw / 2, -sh / 2);
    draw(x, sw, sh);
    x.restore();
  };
  /** 來源 orb（自旋球）：只把原點由左上移到畫布中心，不旋轉。 */
  const ctrTt = (sw: number, sh: number, draw: (x: C, w: number, h: number) => void) => (x: C) => {
    x.save();
    x.translate(-sw / 2, -sh / 2);
    draw(x, sw, sh);
    x.restore();
  };
  const rgbaTt = (hex: string, a: number) => {
    const s = hex.replace("#", "");
    const n = parseInt(s.length === 3 ? s[0] + s[0] + s[1] + s[1] + s[2] + s[2] : s.slice(0, 6), 16) || 0;
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
  };
  /** 來源 orbDraw：外圈光暈 ＋ 中心徑向球 */
  const orbTt = (color: string, r: number) => (x: C, w: number, h: number) => {
    const cx = w / 2, cy = h / 2;
    x.globalCompositeOperation = "lighter";
    const g0 = x.createRadialGradient(cx, cy, 0, cx, cy, r * 2.4);
    g0.addColorStop(0, rgbaTt(color, 1)); g0.addColorStop(0.28, rgbaTt(color, 0.55)); g0.addColorStop(0.65, rgbaTt(color, 0.13)); g0.addColorStop(1, rgbaTt(color, 0));
    x.fillStyle = g0; x.beginPath(); x.arc(cx, cy, r * 2.4, 0, TAU); x.fill();
    x.globalCompositeOperation = "source-over";
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, "#fff"); g.addColorStop(0.5, color); g.addColorStop(1, rgbaTt(color, 0.2));
    x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
  };
  /** 來源 beamDraw：錐形光束（朝右） */
  const beamTt = (color: string, wd: number) => (x: C, w: number, h: number) => {
    const g = x.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, rgbaTt(color, 0)); g.addColorStop(0.7, color); g.addColorStop(1, "#ffffff");
    x.fillStyle = g;
    x.beginPath(); x.moveTo(0, h / 2); x.lineTo(w - 3, h / 2 - wd / 2); x.lineTo(w, h / 2); x.lineTo(w - 3, h / 2 + wd / 2); x.closePath(); x.fill();
  };

  // 0 緋燕：赤羽刃
  addTt(0, 14, 36, upTt(36, 14, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,40,60,0)"); g.addColorStop(0.35, "#ff3b4d"); g.addColorStop(0.8, "#ffc94a"); g.addColorStop(1, "#fff"); x.fillStyle = g; x.beginPath(); x.moveTo(1, h / 2); x.quadraticCurveTo(14, 0.5, w - 1, h / 2); x.quadraticCurveTo(14, h - 0.5, 1, h / 2); x.fill(); x.strokeStyle = "rgba(255,255,255,.9)"; x.lineWidth = 1; x.beginPath(); x.moveTo(6, h / 2); x.lineTo(w - 3, h / 2); x.stroke(); }));
  // 1 緋燕：烈焰長槍
  addTt(1, 22, 64, upTt(64, 22, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,90,20,0)"); g.addColorStop(0.5, "#ff8a2e"); g.addColorStop(1, "#fff6c8"); x.fillStyle = g; x.beginPath(); x.moveTo(0, h / 2); x.quadraticCurveTo(w * 0.55, 0, w, h / 2); x.quadraticCurveTo(w * 0.55, h, 0, h / 2); x.fill(); }));
  // 2 緋燕：火浪
  addTt(2, 34, 70, upTt(70, 34, (x, w, h) => { const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, "rgba(255,60,20,0)"); g.addColorStop(0.5, "rgba(255,140,40,.9)"); g.addColorStop(1, "#fff2b0"); x.fillStyle = g; x.beginPath(); x.moveTo(2, h); x.quadraticCurveTo(w / 2, -h * 0.4, w - 2, h); x.quadraticCurveTo(w / 2, h * 0.45, 2, h); x.fill(); }));
  // 3 緋燕：燼羽球（自旋）
  addTt(3, 20, 20, ctrTt(20, 20, orbTt("#ff8a2e", 7)), false, true);
  // 4 蒼牙：磁軌砲彈
  addTt(4, 20, 40, upTt(40, 20, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(60,140,255,0)"); g.addColorStop(0.5, "#4da3ff"); g.addColorStop(1, "#eaf6ff"); x.fillStyle = g; x.beginPath(); x.moveTo(0, h / 2); x.quadraticCurveTo(w * 0.4, 1, w, h / 2); x.quadraticCurveTo(w * 0.4, h - 1, 0, h / 2); x.fill(); x.fillStyle = "#fff"; x.beginPath(); x.ellipse(w * 0.72, h / 2, 6, 3.2, 0, 0, TAU); x.fill(); }));
  // 5 蒼牙：肩砲彈
  addTt(5, 12, 30, upTt(30, 12, (x, w, h) => { x.fillStyle = "#d6e8ff"; x.beginPath(); x.moveTo(w, h / 2); x.lineTo(w * 0.6, 1); x.lineTo(2, 3); x.lineTo(2, h - 3); x.lineTo(w * 0.6, h - 1); x.closePath(); x.fill(); x.fillStyle = "#ff5a4d"; x.fillRect(w * 0.55, 1, 3, h - 2); const g = x.createRadialGradient(0, h / 2, 0, 0, h / 2, 10); g.addColorStop(0, "#ffe28a"); g.addColorStop(1, "rgba(255,100,30,0)"); x.fillStyle = g; x.fillRect(0, 0, 12, h); }));
  // 6 蒼牙：蒼白光點（自旋）
  addTt(6, 14, 14, ctrTt(14, 14, orbTt("#dff0ff", 4)), false, true);
  // 7 月影：迴旋月牙
  addTt(7, 62, 54, upTt(54, 62, (x, w, h) => { const cx = 26, cy = h / 2, g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(120,60,255,.85)"); g.addColorStop(0.6, "#c9a8ff"); g.addColorStop(1, "#fff"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 26, 0, TAU); x.fill(); x.strokeStyle = "rgba(255,255,255,.95)"; x.lineWidth = 2; x.beginPath(); x.arc(cx, cy, 25, -1.3, 1.3); x.stroke(); x.globalCompositeOperation = "destination-out"; x.beginPath(); x.arc(cx - 13, cy, 23, 0, TAU); x.fill(); }));
  // 8 月影：月屑
  addTt(8, 16, 20, upTt(20, 16, (x, w, h) => { x.fillStyle = "#e6d4ff"; x.beginPath(); x.moveTo(w, h / 2); x.quadraticCurveTo(w * 0.5, 0, 0, h / 2); x.quadraticCurveTo(w * 0.5, h * 0.4, w, h / 2); x.fill(); x.fillStyle = "#7a3cff"; x.beginPath(); x.moveTo(w * 0.9, h / 2); x.quadraticCurveTo(w * 0.5, h, 0, h / 2); x.quadraticCurveTo(w * 0.5, h * 0.6, w * 0.9, h / 2); x.fill(); }));
  // 9 月影：月針
  addTt(9, 5, 24, upTt(24, 5, beamTt("#d6b8ff", 3)));
  // 10 墨染：墨筆
  addTt(10, 16, 44, upTt(44, 16, (x, w, h) => { x.fillStyle = "#f7f3ee"; x.beginPath(); x.moveTo(w - 1, h / 2); x.quadraticCurveTo(w * 0.45, 0, 1, h / 2 - 1); x.lineTo(1, h / 2 + 1); x.quadraticCurveTo(w * 0.45, h, w - 1, h / 2); x.fill(); x.fillStyle = "#0a0a12"; x.beginPath(); x.moveTo(w - 4, h / 2); x.quadraticCurveTo(w * 0.45, 2.5, 3, h / 2 - 0.5); x.lineTo(3, h / 2 + 0.5); x.quadraticCurveTo(w * 0.45, h - 2.5, w - 4, h / 2); x.fill(); const g = x.createRadialGradient(w - 6, h / 2, 0, w - 6, h / 2, 8); g.addColorStop(0, "#ff3b5c"); g.addColorStop(1, "rgba(255,59,92,0)"); x.fillStyle = g; x.fillRect(w - 16, 0, 16, h); }));
  // 11 墨染：墨滴
  addTt(11, 36, 36, upTt(36, 36, (x) => { const g = x.createRadialGradient(15, 15, 2, 18, 18, 14); g.addColorStop(0, "#3a3a52"); g.addColorStop(1, "#05050a"); x.fillStyle = g; x.beginPath(); x.arc(18, 18, 12, 0, TAU); x.fill(); x.strokeStyle = "#ff3b5c"; x.lineWidth = 2; x.beginPath(); x.arc(18, 18, 12.5, 0, TAU); x.stroke(); x.fillStyle = "rgba(255,255,255,.8)"; x.beginPath(); x.arc(13, 13, 2.6, 0, TAU); x.fill(); }));
  // 12 凜針：穿星針
  addTt(12, 5, 34, upTt(34, 5, beamTt("#bfefff", 3.4)));
  // 13 凜針：冰晶彈
  addTt(13, 14, 26, upTt(26, 14, (x, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,122,217,.2)"); g.addColorStop(0.55, "#ff9ad9"); g.addColorStop(1, "#fff"); x.fillStyle = g; x.beginPath(); x.moveTo(1, h / 2); x.quadraticCurveTo(w * 0.45, -1, w - 1, h / 2); x.quadraticCurveTo(w * 0.45, h + 1, 1, h / 2); x.fill(); x.strokeStyle = "rgba(125,255,138,.9)"; x.lineWidth = 1; x.beginPath(); x.moveTo(4, h / 2); x.lineTo(w - 5, h / 2); x.stroke(); }));
  // 14 凜針：冰光點（自旋）
  addTt(14, 18, 18, ctrTt(18, 18, orbTt("#ff9ad9", 5)), false, true);
  // 15 通用：金星（自旋）
  addTt(15, 20, 20, ctrTt(20, 20, orbTt("#fff2b0", 6)), false, true);
}

// ══════════════════════════════════════════════════════════════════════════
// 012（port/012）批次樣式槽
//   EXT_BASE_012  = +300：A《穹裂奇想》12 台的主武器樣式（來源 EXT_BASE_SK +0~+27 逐行照搬）
//   EXT_BASE_012B = +330：B《破穹18翼》律音／天門的樣式（來源 EXT_BASE_CZ，只搬實際用到的 13 個）
// 旋轉旗標換算（見 PORTING.md §2.5.1）：
//   · 來源 A 的 renderer 一律 `rotate(spin ? b.rot : b.rot + π/2)`（`dir` 旗標不參與）
//     → 只有 `spin` 的樣式標 `{dir:false, spin:true}`，其餘維持預設 `dir:true`（等價）。
//   · 來源 B 是 `spin → b.rot`／`dir → atan2+π/2`／都沒有 → 不旋轉
//     → 逐一照抄 dir/spin；音符類（無 dir 無 spin）標 `{dir:false, spin:false}`。
// ══════════════════════════════════════════════════════════════════════════
export const EXT_BASE_012 = 300;
export const EXT_BASE_012B = 330;

{
  const B = EXT_BASE_012;
  const BB = EXT_BASE_012B;
  const gl012 = (x: C, col: string, r: number) => {
    const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, col);
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.beginPath();
    x.arc(0, 0, r, 0, TAU);
    x.fill();
  };
  const star012 = (x: C, r: number, c: string) => {
    x.fillStyle = c;
    x.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU - Math.PI / 2;
      const rr = i % 2 ? r * 0.38 : r;
      x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  const note012 = (x: C, s: number, c: string) => {
    x.fillStyle = c;
    x.beginPath();
    x.ellipse(-s * 0.1, s * 0.5, s * 0.36, s * 0.26, -0.4, 0, TAU);
    x.fill();
    x.fillRect(s * 0.17, -s * 0.75, s * 0.1, s * 1.28);
    x.beginPath();
    x.moveTo(s * 0.27, -s * 0.75);
    x.quadraticCurveTo(s * 0.9, -s * 0.55, s * 0.55, -s * 0.05);
    x.quadraticCurveTo(s * 0.7, -s * 0.5, s * 0.27, -s * 0.45);
    x.fill();
  };
  const piece012 = (x: C, s: number, ch: string, col: string, fill: string) => {
    x.fillStyle = fill;
    x.strokeStyle = col;
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(0, -s * 0.62);
    x.lineTo(s * 0.42, -s * 0.28);
    x.lineTo(s * 0.52, s * 0.55);
    x.lineTo(-s * 0.52, s * 0.55);
    x.lineTo(-s * 0.42, -s * 0.28);
    x.closePath();
    x.fill();
    x.stroke();
    x.fillStyle = col;
    x.font = `900 ${Math.round(s * 0.6)}px "Noto Serif TC",serif`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.fillText(ch, 0, s * 0.14);
  };
  const blade012 = (x: C, len: number, w: number, c0: string, c1: string) => {
    const g = x.createLinearGradient(0, -len / 2, 0, len / 2);
    g.addColorStop(0, c0);
    g.addColorStop(1, c1);
    x.fillStyle = g;
    x.beginPath();
    x.moveTo(0, -len / 2);
    x.lineTo(w / 2, -len / 2 + w);
    x.lineTo(w / 2, len / 2);
    x.lineTo(-w / 2, len / 2);
    x.lineTo(-w / 2, -len / 2 + w);
    x.closePath();
    x.fill();
  };
  const glyph012 = (x: C, ch: string, s: number, fill: string, edge: string) => {
    x.font = `900 ${s}px "Noto Sans TC",sans-serif`;
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.lineJoin = "round";
    x.lineWidth = s * 0.22;
    x.strokeStyle = "#08060f";
    x.strokeText(ch, 0, 0);
    x.lineWidth = s * 0.08;
    x.strokeStyle = edge;
    x.strokeText(ch, 0, 0);
    x.fillStyle = fill;
    x.fillText(ch, 0, 0);
  };
  const add012 = (n: number, w: number, h: number, draw: (x: C) => void, dir?: boolean, spin?: boolean) => {
    EXT_STYLES.push({ id: B + n, w, h, draw, dir, spin });
  };
  // ── 雙子：粉星／藍星
  add012(0, 26, 26, (x) => { gl012(x, "rgba(255,122,217,.8)", 13); star012(x, 9, "#ffd0f0"); star012(x, 4, "#fff"); }, false, true);
  add012(1, 26, 26, (x) => { gl012(x, "rgba(90,216,255,.8)", 13); star012(x, 9, "#d0f4ff"); star012(x, 4, "#fff"); }, false, true);
  // ── 零位：封包／位元
  add012(2, 16, 16, (x) => { x.fillStyle = "rgba(57,255,136,.35)"; x.fillRect(-8, -8, 16, 16); x.fillStyle = "#39ff88"; x.fillRect(-5, -5, 10, 10); x.fillStyle = "#eafff2"; x.fillRect(-2, -2, 4, 4); });
  add012(3, 18, 18, (x) => { gl012(x, "rgba(255,61,240,.7)", 9); x.fillStyle = "#ffd6fb"; x.font = "900 13px monospace"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(Math.random() < 0.5 ? "0" : "1", 0, 1); });
  // ── 星錘：鉚釘
  add012(4, 12, 26, (x) => { gl012(x, "rgba(182,255,74,.6)", 10); x.fillStyle = "#e8eef8"; x.fillRect(-2.5, -9, 5, 18); x.fillStyle = "#b6ff4a"; x.beginPath(); x.moveTo(-2.5, -9); x.lineTo(0, -13); x.lineTo(2.5, -9); x.fill(); });
  // ── 日鏡：金色光羽
  add012(5, 16, 34, (x) => { gl012(x, "rgba(255,227,107,.7)", 14); x.fillStyle = "#fff4c8"; x.beginPath(); x.moveTo(0, -16); x.quadraticCurveTo(7, 0, 0, 16); x.quadraticCurveTo(-7, 0, 0, -16); x.fill(); x.strokeStyle = "#ff9d3b"; x.lineWidth = 1; x.beginPath(); x.moveTo(0, -12); x.lineTo(0, 14); x.stroke(); });
  // ── 霓彈：霓虹針／鋼球
  add012(6, 12, 30, (x) => { gl012(x, "rgba(255,61,127,.7)", 12); x.fillStyle = "#ffe0ee"; x.beginPath(); x.moveTo(0, -14); x.lineTo(3, 0); x.lineTo(0, 14); x.lineTo(-3, 0); x.fill(); });
  add012(7, 44, 44, (x) => { gl012(x, "rgba(255,61,127,.5)", 22); const g = x.createRadialGradient(-5, -6, 1, 0, 0, 16); g.addColorStop(0, "#fff"); g.addColorStop(0.4, "#bfe9ff"); g.addColorStop(1, "#1a2050"); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 15, 0, TAU); x.fill(); x.strokeStyle = "#35f0ff"; x.lineWidth = 1.5; x.stroke(); });
  // ── 分鏡：描線墨彈／「斬」／「撃」
  add012(8, 12, 30, (x) => { x.fillStyle = "#08060f"; x.fillRect(-3, -14, 6, 28); x.fillStyle = "#f7f2ff"; x.fillRect(-1.6, -13, 3.2, 26); x.fillStyle = "#ff2f4f"; x.fillRect(-1.6, -14, 3.2, 5); });
  add012(9, 52, 52, (x) => glyph012(x, "斬", 36, "#ffffff", "#ff2f4f"));
  add012(10, 40, 40, (x) => glyph012(x, "撃", 28, "#f7f2ff", "#ff2f4f"));
  // ── 映界：稜光針／碎光
  add012(11, 12, 34, (x) => { gl012(x, "rgba(53,240,255,.6)", 12); x.fillStyle = "#eafcff"; x.beginPath(); x.moveTo(0, -16); x.lineTo(3.5, 0); x.lineTo(0, 16); x.lineTo(-3.5, 0); x.fill(); });
  add012(12, 18, 26, (x) => { gl012(x, "rgba(190,250,255,.7)", 12); const g = x.createLinearGradient(-5, -10, 5, 10); g.addColorStop(0, "#fff"); g.addColorStop(1, "#35b8ff"); x.fillStyle = g; x.beginPath(); x.moveTo(0, -11); x.lineTo(5, 3); x.lineTo(0, 11); x.lineTo(-5, 1); x.fill(); });
  // ── 回聲：殘響針／相位環／長針
  add012(13, 10, 28, (x) => { gl012(x, "rgba(61,245,208,.6)", 11); x.fillStyle = "#e0fff8"; x.beginPath(); x.moveTo(0, -13); x.lineTo(2.6, 0); x.lineTo(0, 13); x.lineTo(-2.6, 0); x.fill(); });
  add012(14, 24, 24, (x) => { gl012(x, "rgba(138,92,255,.6)", 12); x.strokeStyle = "#c8b4ff"; x.lineWidth = 2.5; x.beginPath(); x.arc(0, 0, 7, 0, 5); x.stroke(); x.strokeStyle = "#3df5d0"; x.lineWidth = 1.5; x.beginPath(); x.arc(0, 0, 10, 2, 6); x.stroke(); }, false, true);
  add012(15, 14, 56, (x) => { gl012(x, "rgba(61,245,208,.6)", 18); x.fillStyle = "#fff"; x.beginPath(); x.moveTo(0, -27); x.lineTo(3.5, 0); x.lineTo(0, 27); x.lineTo(-3.5, 0); x.fill(); x.fillStyle = "rgba(138,92,255,.8)"; x.fillRect(-1, -20, 2, 40); });
  // ── 律音：粉音符／金八分音符／重音和弦（A 版；律音實際用 B 版）
  add012(16, 26, 30, (x) => { gl012(x, "rgba(255,122,184,.6)", 14); note012(x, 16, "#ffe0f0"); });
  add012(17, 22, 26, (x) => { gl012(x, "rgba(255,201,74,.6)", 12); note012(x, 13, "#fff0c0"); });
  add012(18, 34, 34, (x) => { gl012(x, "rgba(255,201,74,.7)", 17); x.strokeStyle = "#fff0c0"; x.lineWidth = 2.5; x.beginPath(); for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; x.moveTo(0, 0); x.lineTo(Math.cos(a) * 12, Math.sin(a) * 12); } x.stroke(); x.fillStyle = "#ff7ab8"; x.beginPath(); x.arc(0, 0, 4, 0, TAU); x.fill(); }, false, true);
  // ── 詰將：步駒／成駒
  add012(19, 30, 32, (x) => { gl012(x, "rgba(255,201,74,.45)", 15); piece012(x, 22, "歩", "#ffc94a", "#2a2347"); });
  add012(20, 40, 42, (x) => { gl012(x, "rgba(255,45,90,.55)", 20); piece012(x, 30, "と", "#ff6a86", "#2a1430"); });
  // ── 天門：長矛／劍／斧／戟／神劍／寶庫光矢（A 版；天門實際用 B 版）
  add012(21, 12, 46, (x) => { gl012(x, "rgba(255,210,74,.5)", 14); x.fillStyle = "#c8902a"; x.fillRect(-1.3, -6, 2.6, 28); blade012(x, 22, 6, "#ffffff", "#ffd24a"); });
  add012(22, 20, 58, (x) => { gl012(x, "rgba(255,210,74,.5)", 20); blade012(x, 40, 8, "#ffffff", "#fff4c8"); x.fillStyle = "#ffd24a"; x.fillRect(-9, 18, 18, 4); x.fillRect(-2, 20, 4, 9); });
  add012(23, 30, 54, (x) => { gl012(x, "rgba(255,210,74,.5)", 20); x.fillStyle = "#c8902a"; x.fillRect(-1.5, -20, 3, 46); x.fillStyle = "#fff4c8"; x.beginPath(); x.moveTo(0, -24); x.quadraticCurveTo(-18, -24, -14, -4); x.quadraticCurveTo(-6, -10, 0, -10); x.fill(); });
  add012(24, 24, 58, (x) => { gl012(x, "rgba(255,210,74,.5)", 20); x.fillStyle = "#c8902a"; x.fillRect(-1.3, -12, 2.6, 40); blade012(x, 26, 6, "#ffffff", "#ffd24a"); x.fillStyle = "#ffd24a"; x.beginPath(); x.moveTo(2, -6); x.quadraticCurveTo(12, -8, 10, 4); x.lineTo(2, 0); x.fill(); x.beginPath(); x.moveTo(-2, -6); x.quadraticCurveTo(-12, -8, -10, 4); x.lineTo(-2, 0); x.fill(); });
  add012(25, 34, 86, (x) => { gl012(x, "rgba(255,244,200,.7)", 34); blade012(x, 62, 12, "#ffffff", "#ffe9a8"); x.fillStyle = "#2ff2d2"; x.beginPath(); x.arc(0, 26, 4, 0, TAU); x.fill(); x.fillStyle = "#ffd24a"; x.fillRect(-15, 30, 30, 5); x.fillRect(-3, 33, 6, 10); });
  add012(26, 10, 30, (x) => { gl012(x, "rgba(255,210,74,.7)", 12); x.fillStyle = "#fff8dc"; x.beginPath(); x.moveTo(0, -14); x.lineTo(2.5, 0); x.lineTo(0, 14); x.lineTo(-2.5, 0); x.fill(); });
  // ── 共用僚機彈
  add012(27, 10, 22, (x) => { gl012(x, "rgba(243,211,138,.6)", 9); x.fillStyle = "#fff4d6"; x.fillRect(-1.5, -9, 3, 18); });

  // ── B《破穹18翼》：律音／天門實際使用的樣式 ──
  const add012B = (
    n: number, kind: ShapeKind012, w: number, h: number, c0: string, c1: string, c2: string,
    o: { dir?: boolean; spin?: boolean; txt?: string; raw?: (c: CanvasRenderingContext2D) => void } = {}
  ) => {
    EXT_STYLES.push({
      id: BB + n, w, h, dir: o.dir, spin: o.spin,
      // raw：逐字搬運來源手寫的 draw（天門神兵用，含他自己的漸層與光核）
      // 否則走 012 幾何 drawShape012（律音等其他 012 機體用）
      draw: o.raw ?? ((x) => drawShape012(x, kind, w, h, c0, c1, c2, o.txt)),
    });
  };
  add012B(0, "note", 24, 34, "#ffffff", "#ff7ab8", "#ff7ab8", { dir: false });
  add012B(1, "note8", 20, 30, "#ffffff", "#ffc94a", "#ffc94a", { dir: false });
  add012B(2, "chord", 38, 42, "#ffffff", "#ffe08a", "#ff7ab8", { dir: false });
  add012B(3, "note", 22, 32, "#fff", "#8fd8ff", "#8fd8ff", { dir: false });
  add012B(4, "piece", 30, 38, "#ffe9a8", "#8a1a2e", "#ffc94a", { dir: true });
  add012B(5, "piece", 26, 32, "#ffe9a8", "#3a2c6a", "#ffc94a", { dir: true, txt: "香" });
  add012B(6, "piece", 26, 32, "#ffe9a8", "#6a2c3a", "#ff2d5a", { dir: true, txt: "角" });
  add012B(7, "piece", 26, 32, "#ffe9a8", "#2c4a6a", "#8fd8ff", { dir: true, txt: "飛" });
  // ── 天門四大神兵（gate）＋寶庫追擊聖槍（24）────────────────────────────
  //    ⚠ 這 5 顆**逐字取自 Claude 交付版** `port/gate/src/game/render/pbStylesExt.ts`：
  //      w/h 是他的原尺寸（22×58 / 34×72 / 26×56 / 28×56 / 24×52），
  //      draw 是他手寫的漸層＋光核（不是母專案的 drawShape012 幾何）。
  //      本體另外由 gate.ts 的 `weapon()` 用 gate_treasury_weapons.png 貼圖疊上去，
  //      兩層加起來才是他預覽的亮度 → **不可以改成 empty 留白**（少了這層光核會變暗）。
  //      他的 glow 有白色熱核，母專案 `./sprites` 那支沒有 → 用 gateKit 的。
  add012B(19, "spear", 22, 58, "#ffffff", "#ffd24a", "#ffd24a", {
    dir: true,
    raw: (c) => {
      c.globalAlpha = 0.65;
      c.drawImage(gateGlow("#ffd24a", 48), -11, -24, 22, 48);
      c.globalAlpha = 1;
      const g = c.createLinearGradient(0, -26, 0, 26);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, "#fff2c2");
      g.addColorStop(0.75, "#ffd24a");
      g.addColorStop(1, "rgba(255,190,50,0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -27);
      c.lineTo(4.2, -10);
      c.lineTo(2.2, 24);
      c.lineTo(-2.2, 24);
      c.lineTo(-4.2, -10);
      c.closePath();
      c.fill();
    },
  });
  add012B(20, "blade", 34, 72, "#ffffff", "#fff0b0", "#ffd24a", {
    dir: true,
    raw: (c) => {
      c.globalAlpha = 0.6;
      c.drawImage(gateGlow("#2ff2d2", 64), -17, -30, 34, 60);
      c.globalAlpha = 1;
      const g = c.createLinearGradient(0, -32, 0, 28);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.45, "#ffe89e");
      g.addColorStop(1, "rgba(47,242,210,0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -32);
      c.lineTo(6, -8);
      c.lineTo(3, 24);
      c.lineTo(-3, 24);
      c.lineTo(-6, -8);
      c.closePath();
      c.fill();
    },
  });
  add012B(21, "blade", 26, 56, "#ffffff", "#ffe08a", "#ffd24a", {
    dir: true,
    raw: (c) => {
      c.drawImage(gateGlow("#ffd24a", 48), -13, -24, 26, 48);
      c.fillStyle = "#fff5d2";
      c.beginPath();
      c.moveTo(0, -24);
      c.lineTo(5, -6);
      c.lineTo(0, 20);
      c.lineTo(-5, -6);
      c.closePath();
      c.fill();
    },
  });
  add012B(22, "axe", 28, 56, "#ffffff", "#ffd24a", "#ff9d3b", {
    dir: true,
    raw: (c) => {
      c.drawImage(gateGlow("#ffbe3b", 48), -14, -24, 28, 48);
      c.fillStyle = "#fff4c8";
      c.beginPath();
      c.ellipse(0, -4, 5.5, 18, 0, 0, Math.PI * 2);
      c.fill();
    },
  });
  add012B(24, "blade", 24, 52, "#ffffff", "#fff4c8", "#2ff2d2", {
    dir: true,
    raw: (c) => {
      c.globalAlpha = 0.7;
      c.drawImage(gateGlow("#2ff2d2", 44), -12, -22, 24, 44);
      c.globalAlpha = 1;
      const g = c.createLinearGradient(0, -24, 0, 22);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.5, "#ffe596");
      g.addColorStop(1, "rgba(47,242,210,0)");
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, -24);
      c.lineTo(4.5, -8);
      c.lineTo(1.8, 20);
      c.lineTo(-1.8, 20);
      c.lineTo(-4.5, -8);
      c.closePath();
      c.fill();
    },
  });
}

// ══════════════════════════════════════════════════════════════════════════
// 016《緋冕裂空錄》（kr）批次：EXT_BASE_KR = 360（+0~+17，18 個樣式）
//   整批在 pbStyles016.ts 內以陣列字面值定義（逐行搬自來源），這裡只負責掛進 EXT_STYLES。
//   旋轉旗標：來源 18 個樣式全部 dir:true／spin 未設 → 與 dst 預設相同，不必逐個標。
// ══════════════════════════════════════════════════════════════════════════
EXT_STYLES.push(...KR_STYLES);

// ===== src\game\render\fx.ts =====
// 粒子與特效系統：爆炸、火花、環形衝擊波、漂浮數字。全部走物件池
import { Pool, makeParticle, makeText } from "../entities";
import type { Particle, FloatText } from "../entities";
import { TAU, rand } from "../constants";
import { glow } from "./sprites";
import { atlasPart as getP3Part } from "../enemyPacks/p3/render/sprites";

export interface Palette {
  core: string;
  mid: string;
  edge: string;
  smoke: string;
}
export const PAL: Record<string, Palette> = {
  fire: { core: "#fff6c8", mid: "#ffb347", edge: "#ff3a1a", smoke: "#2b1a18" },
  ice: { core: "#f0fdff", mid: "#7fe4ff", edge: "#2f8dff", smoke: "#16283a" },
  elec: { core: "#fffbd0", mid: "#c58bff", edge: "#6a3dff", smoke: "#1a1230" },
  void: { core: "#f2d8ff", mid: "#a45cff", edge: "#3a1a80", smoke: "#0d0618" },
  jade: { core: "#f0fff8", mid: "#3dffb0", edge: "#11a06a", smoke: "#0a2a20" },
  gold: { core: "#ffffff", mid: "#ffd36b", edge: "#ff8a1a", smoke: "#2a2010" },
  cyan: { core: "#ffffff", mid: "#7cf3ff", edge: "#2a9cff", smoke: "#0c2430" },
  red: { core: "#ffffff", mid: "#ff5a6e", edge: "#b0081f", smoke: "#2a0a10" },
  white: { core: "#ffffff", mid: "#e8f0ff", edge: "#9cb4ff", smoke: "#202838" },
};

export class FxSys {
  ps = new Pool<Particle>(makeParticle);
  texts = new Pool<FloatText>(makeText);
  max = 900;
  pMul = 1;
  showText = true;

  private get(): Particle | null {
    if (this.ps.items.length >= this.max) return null;
    const p = this.ps.spawn();
    p.spr = null;
    p.a0 = 1;
    p.drag = 0;
    p.grav = 0;
    p.rot = 0;
    p.vr = 0;
    p.size2 = 0;
    p.kind = 0;
    p.w = 2;
    return p;
  }

  /** 光暈粒子 */
  glowP(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, size2 = 0, drag = 0, a0 = 1) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.size = size; p.size2 = size2; p.spr = glow(color); p.color = color; p.drag = drag; p.a0 = a0; p.kind = 0;
    return p;
  }

  /** 空間裂隙：貼圖精靈（source-over，自轉＋淡入淡出）。
   *  2026-10-24 大爺指正「空間裂隙新外觀沒實裝」——`voidTear` 原本只有環＋爆炸粒子。
   *  貼圖來源是 p3 的 `env_rift`（次元空間裂隙漩渦）；還沒載好時回傳 null，呼叫端照舊只畫環。
   *  ⚠ 這顆走 `kind = 6`，**只由 `drawRift()` 繪製**（2026-10-24 二修）。
   *    原本放在 `draw()` 裡，但 `fx.draw()` 是 `drawEnemyBullets()` 之後才呼叫
   *    → 裂隙會蓋在子彈上（大爺：「射過去應在他上方」）。現在改由 renderer 在
   *    **敵我子彈之前**呼叫 `drawRift()`，裂隙沉到最底層。 */
  rift(x: number, y: number, size = 140, life = 1.2) {
    const tex = getP3Part("env_rift");
    if (!tex) return null;
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = 0; p.vy = 0;
    p.life = p.max = life;
    p.size = size; p.spr = tex; p.color = "#b36bff"; p.a0 = 1;
    p.kind = 6; p.rot = rand(TAU); p.vr = 0.9; p.w = 2;
    return p;
  }

  /** 火花線粒子 */
  spark(x: number, y: number, vx: number, vy: number, life: number, w: number, color: string, drag = 0.5) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.w = w; p.color = color; p.drag = drag; p.kind = 1; p.size = 1;
    return p;
  }

  /** 擴散環 */
  ring(x: number, y: number, r0: number, r1: number, life: number, color: string, width = 4) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.life = p.max = life; p.size = r0; p.size2 = r1; p.color = color; p.w = width; p.kind = 2;
    return p;
  }

  shard(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, grav = 0) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.size = size; p.color = color; p.kind = 3; p.rot = rand(TAU); p.vr = rand(-10, 10); p.grav = grav; p.drag = 0.4;
    return p;
  }

  smoke(x: number, y: number, vx: number, vy: number, life: number, size: number, size2: number, color = "#2b1a18", a0 = 0.5) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.size = size; p.size2 = size2; p.spr = glow(color); p.color = color; p.kind = 4; p.a0 = a0; p.drag = 1.2;
    return p;
  }

  /** 放射狀火花爆發 */
  burst(x: number, y: number, n: number, color: string, s0: number, s1: number, life: number, w = 2.4) {
    n = Math.round(n * this.pMul);
    for (let i = 0; i < n; i++) {
      const a = rand(TAU);
      const s = rand(s0, s1);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(life * 0.6, life), w, color);
    }
  }

  /** 定向錐形火花 */
  cone(x: number, y: number, ang: number, spread: number, n: number, color: string, s0: number, s1: number, life: number, w = 2.2) {
    n = Math.round(n * this.pMul);
    for (let i = 0; i < n; i++) {
      const a = ang + rand(-spread, spread);
      const s = rand(s0, s1);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(life * 0.6, life), w, color);
    }
  }

  /** 綜合爆炸：核心閃光 + 火花 + 碎片 + 衝擊環 + 煙 */
  explosion(x: number, y: number, size: number, pal: Palette = PAL.fire) {
    const m = this.pMul;
    this.glowP(x, y, 0, 0, 0.18 + size * 0.006, size * 1.7, pal.core, size * 2.4, 0, 1);
    this.glowP(x, y, 0, 0, 0.32 + size * 0.008, size * 2.1, pal.mid, size * 3, 0, 0.75);
    this.ring(x, y, size * 0.3, size * 2.2, 0.3 + size * 0.005, pal.mid, Math.max(2, size * 0.12));
    const n = Math.round((6 + size * 0.5) * m);
    for (let i = 0; i < n; i++) {
      const a = rand(TAU);
      const s = rand(60, 120 + size * 6);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.25, 0.6), rand(1.6, 3.2), Math.random() < 0.5 ? pal.mid : pal.core);
    }
    const ns = Math.round((2 + size * 0.15) * m);
    for (let i = 0; i < ns; i++) {
      const a = rand(TAU);
      const s = rand(40, 100 + size * 3);
      this.shard(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.4, 0.9), rand(2, 4 + size * 0.1), Math.random() < 0.5 ? pal.edge : pal.mid, 120);
    }
    if (size > 14) {
      const nsm = Math.round((2 + size * 0.06) * m);
      for (let i = 0; i < nsm; i++) this.smoke(x + rand(-size, size) * 0.5, y + rand(-size, size) * 0.5, rand(-20, 20), rand(-20, 20), rand(0.6, 1.1), size * 0.7, size * 1.8, pal.smoke, 0.5);
    }
  }

  hit(x: number, y: number, color: string) {
    this.glowP(x, y, 0, 0, 0.09, 12, color, 22, 0, 0.9);
    const n = Math.round(3 * this.pMul);
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, 0) + rand(-0.4, 0.4);
      const s = rand(80, 200);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.1, 0.25), 1.6, color);
    }
  }

  text(x: number, y: number, str: string, color = "#fff", size = 14, life = 0.7) {
    if (!this.showText || this.texts.items.length > 40) return;
    const t = this.texts.spawn();
    t.x = x; t.y = y; t.text = str; t.color = color; t.size = size; t.life = t.max = life; t.vy = -60;
  }

  update(dt: number) {
    const a = this.ps.items;
    for (let i = a.length - 1; i >= 0; i--) {
      const p = a[i];
      p.life -= dt;
      if (p.life <= 0 || !p.alive) {
        this.ps.kill(i);
        continue;
      }
      if (p.drag) {
        const d = Math.max(0, 1 - p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    const t = this.texts.items;
    for (let i = t.length - 1; i >= 0; i--) {
      const f = t[i];
      f.life -= dt;
      if (f.life <= 0) {
        this.texts.kill(i);
        continue;
      }
      f.y += f.vy * dt;
      f.vy *= 1 - 3 * dt;
    }
  }

  drawSmoke(ctx: CanvasRenderingContext2D) {
    const a = this.ps.items;
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < a.length; i++) {
      const p = a[i];
      if (p.kind !== 4) continue;
      const r = p.life / p.max;
      const s = p.size + (p.size2 - p.size) * (1 - r);
      ctx.globalAlpha = p.a0 * r;
      ctx.drawImage(p.spr!, p.x - s, p.y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
  }

  /** 空間裂隙（kind 6）專用繪製：**必須在敵我子彈之前呼叫**（renderer.renderGame）。
   *  裂隙有暗部 → 這裡全程 source-over；畫完務必把 alpha / composite 還原。 */
  drawRift(ctx: CanvasRenderingContext2D) {
    const a = this.ps.items;
    let any = false;
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < a.length; i++) {
      const p = a[i];
      if (p.kind !== 6 || !p.spr) continue;
      any = true;
      const r = p.life / p.max;
      // 前 15% 撐開、後 30% 收掉，中間維持滿版
      const grow = Math.min(1, (1 - r) * 6.7);
      const fade = Math.min(1, r * 3.3);
      const s = p.size * (0.72 + grow * 0.28);
      ctx.globalAlpha = p.a0 * fade;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.drawImage(p.spr, -s / 2, -s / 2, s, s);
      ctx.restore();
    }
    if (any) ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  draw(ctx: CanvasRenderingContext2D) {
    const a = this.ps.items;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < a.length; i++) {
      const p = a[i];
      const r = p.life / p.max;
      switch (p.kind) {
        case 0: {
          const s = p.size2 ? p.size + (p.size2 - p.size) * (1 - r) : p.size * (0.4 + r * 0.6);
          ctx.globalAlpha = Math.min(1, p.a0 * r * 1.4);
          ctx.drawImage(p.spr!, p.x - s, p.y - s, s * 2, s * 2);
          break;
        }
        case 1: {
          ctx.globalAlpha = Math.min(1, r * 1.6);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.w * (0.4 + r * 0.6);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045);
          ctx.stroke();
          break;
        }
        case 2: {
          const rad = p.size + (p.size2 - p.size) * (1 - r * r);
          ctx.globalAlpha = Math.min(1, r * 1.5);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.5, p.w * r);
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, TAU);
          ctx.stroke();
          break;
        }
        case 3: {
          ctx.globalAlpha = Math.min(1, r * 1.8);
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          const s = p.size * (0.5 + r * 0.5);
          ctx.beginPath();
          ctx.moveTo(s, 0);
          ctx.lineTo(-s * 0.6, s * 0.7);
          ctx.lineTo(-s * 0.4, -s * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }
        // 6：貼圖精靈（空間裂隙）已搬到 `drawRift()`，這裡跳過。
        //    理由：`fx.draw()` 在 `drawEnemyBullets()` 之後，裂隙會蓋住子彈。
        case 6: break;
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  drawTexts(ctx: CanvasRenderingContext2D) {
    const t = this.texts.items;
    if (!t.length) return;
    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    for (let i = 0; i < t.length; i++) {
      const f = t[i];
      const r = f.life / f.max;
      ctx.globalAlpha = Math.min(1, r * 2);
      ctx.font = `900 ${f.size * (r > 0.85 ? 1 + (r - 0.85) * 3 : 1)}px "Bebas Neue", Impact, "Noto Sans TC", sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.ps.clear();
    this.texts.clear();
  }
}

// ===== src\game\engine\renderer.ts =====
// 遊戲渲染：依圖層順序繪製，所有子彈皆以預渲染精靈 drawImage 提升效能
import { H, RARITY_COLOR, TAU, W, clamp } from "../constants";
import { PK } from "../entities";
import type { Beam, Enemy, Pickup } from "../entities";
import { loadUltBg } from "../../assets";
import { drawBossBody, drawMidBossBody } from "../render/bossDraw";
import { drawHazardBullet } from "../render/hazardBullets";
import { drawEnemySprite, enemySprite } from "../render/enemyDraw";
import { drawShip } from "../render/shipDraw";
import type { ShipDrawOpts } from "../render/shipDraw";
import { CZ_DIR_EB, CZ_EB_SIZE, czEbSprite, ebSprite, glow, makeCanvas, pbStyle } from "../render/sprites";
import { drawThunderBeam } from "../render/thunder";
import { drawCutin, CUTIN_DUR, CUTIN_DUR_FAST, FAST_CUTIN_SHIPS } from "../cutin";
import { FORM_TIER3 } from "../data/ships";
import type { Game } from "./Game";

let vig: HTMLCanvasElement | null = null;
function getVig() {
  if (vig) return vig;
  vig = makeCanvas(270, 480);
  const g = vig.getContext("2d")!;
  const gr = g.createRadialGradient(135, 240, 120, 135, 240, 330);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 270, 480);
  return vig;
}

function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n = 5) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    else ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/** 繪製指定圖層的技能特效；單一特效出錯時直接丟棄，避免影響整體畫面 */
function drawFxLayer(g: Game, ctx: CanvasRenderingContext2D, layer: number) {
  const list = g.fxs;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (f.layer !== layer) continue;
    try {
      f.draw(ctx);
    } catch (err) {
      console.error(err);
      f.alive = false;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  }
}

/** 奧義全螢幕背景（12 台 sp+cf 共有）：p.ultBusy>0 期間，cover 填 540×960 畫布。
 *  來源 1080×1920 與畫布同為 9:16，cover 正好全填無裁切，取代來源「方形旋轉貼片」。
 *  來源船體自帶的 drawUnder/drawOver 奧義特效仍會疊在這張背景上。 */
function drawUltBg(g: Game, ctx: CanvasRenderingContext2D) {
  if (g.p.ultBusy <= 0) return;
  const img = loadUltBg(g.ship.id);
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.drawImage(img, 0, 0, W, H);
  ctx.restore();
}

export function renderGame(g: Game) {
  const ctx = g.ctx;
  const S = g.pxScale;
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.translate(g.shakeX, g.shakeY);
  g.bg.draw(ctx);
  ctx.restore();
  // 奧義全螢幕背景：畫在鏡頭搖晃「之外」。跟著 shake 動的話，邊緣會露出底下的
  // 關卡背景（新移植 12 台與其它批次共有，使用者回報的「背景會跟著動」）。
  drawUltBg(g, ctx);
  ctx.save();
  // 空間裂隙（fx kind 6）：**必須畫在敵機／敵我子彈之前**。
  // 2026-10-24 大爺：「裂隙在很上層，子彈打過去都在他底下，射過去應在他上方」。
  // 原本掛在 `fx.draw()` 裡 → 那是 `drawEnemyBullets()` 之後才呼叫，整個蓋住子彈。
  g.fx.drawRift(ctx);
  drawFxLayer(g, ctx, 0);
  // 真身收起中（奧義演出）→ 跳過 kit.drawUnder：那裡畫的是「機體錨定」的底層特效
  // （緋燕的火軌與鳳凰形態 90px 橙紅光暈都掛在 p.x/p.y），不關掉就會在隱形位置看到一團紅光。
  if (!g.shipHidden) g.kit.drawUnder?.(g, ctx);
  const en = g.en.items;
  // 地面敵機
  for (let i = 0; i < en.length; i++) if (en[i].def.ground && !en[i].dead) drawEnemy(g, ctx, en[i]);
  // 拾取物
  const pk = g.pk.items;
  for (let i = 0; i < pk.length; i++) drawPickup(g, ctx, pk[i]);
  for (let i = 0; i < en.length; i++) {
    const e = en[i];
    if (e.dead || e.def.ground) continue;
    if (e.def.ai === "boss") drawBoss(g, ctx, e);
    else drawEnemy(g, ctx, e);
  }
  drawPlayerBullets(g, ctx);
  drawPlayer(g, ctx);
  g.kit.drawOver?.(g, ctx);
  drawFxLayer(g, ctx, 1);
  drawBeams(g, ctx);
  drawEnemyBullets(g, ctx);
  g.fx.drawSmoke(ctx);
  g.fx.draw(ctx);
  g.fx.drawTexts(ctx);
  // 螢幕層特效
  drawFxLayer(g, ctx, 2);
  ctx.restore();
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // 暗角
  ctx.globalAlpha = 0.85;
  ctx.drawImage(getVig(), 0, 0, W, H);
  ctx.globalAlpha = 1;
  const p = g.p;
  if (p.hp / p.maxHp < 0.3 && g.stateName === "playing") {
    const a = 0.16 + 0.12 * Math.sin(g.lowHpPulse);
    const gr = ctx.createRadialGradient(W / 2, H / 2, 240, W / 2, H / 2, 620);
    gr.addColorStop(0, "rgba(255,0,40,0)");
    gr.addColorStop(1, `rgba(255,0,40,${a * 2})`);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
  }
  if (g.tintA > 0.005) {
    ctx.globalAlpha = g.tintA;
    ctx.fillStyle = g.tintColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  if (g.flashA > 0.01) {
    ctx.globalAlpha = clamp(g.flashA, 0, 1);
    ctx.fillStyle = g.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  // 奧義 Cut-in（canvas 層，不受震動影響；機體疾馳沿用玩家外觀）
  if (g.stateName === "ultcut") {
    const fast = FAST_CUTIN_SHIPS.includes(g.ship.id);
    const dur = fast ? CUTIN_DUR_FAST : CUTIN_DUR;
    const k = clamp(1 - g.cutT / dur, 0, 1);
    drawCutin(ctx, g.ship.id, k, g.p.tier, g.p.gear, fast ? dur : undefined);
  }
}

function drawEnemy(g: Game, ctx: CanvasRenderingContext2D, e: Enemy) {
  if (e.y < -80 || e.y > H + 80 || e.alpha < 0) return;
  // 中型 Boss：優先走圖集多關節繪製（enemyPacks 各包自帶綠幕去背＋離屏快取）。
  // 圖集尚未解碼完成時回傳 false → 退回原本的靜態小怪精靈，不會空白。
  const midDrawn = e.def.mid ? drawMidBossBody(ctx, e, g.t, g.p.x, g.p.y) : false;
  if (!midDrawn) {
    const sp = enemySprite(e.def.id, e.theme);
    let rot = 0;
    // 用 def.ai（共用行為詞彙）判斷，不用 id——新專案的 id 會加前綴，用 id 判斷會靜默失效
    if (sp.spin) rot = e.t * (e.def.ai === "orbit" ? 4 : 2.4);
    else if (sp.aim) rot = Math.atan2(g.p.y - e.y, g.p.x - e.x) - Math.PI / 2;
    else if (e.def.ai === "swoop" && e.dir !== 0) rot = e.dir * -0.9;
    if (e.elite) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.55 + 0.25 * Math.sin(g.t * 6);
      ctx.drawImage(glow("#ffd36b", 96), e.x - e.r * 2, e.y - e.r * 2, e.r * 4, e.r * 4);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    if (e.def.ai === "dive" && e.a === 0 && e.t > 0.5) {
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(g.t * 30);
      ctx.drawImage(glow("#ff3b52", 64), e.x - 24, e.y - 24, 48, 48);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    // 受擊閃白：與 Boss 同一條閘門（p6 公式）——只在剛命中的幾幀、20Hz 間歇閃。
    // 2026-10-24 大爺：「小怪受擊閃白乾脆也都和 boss 一致」。
    // ⚠ 原本是 `e.flash > 0`：`flash` 每次命中都重置成 1、`dt*6` 衰減 → 連續射擊時
    //    `flash` 幾乎永遠 > 0 → 小怪全程白剪影。
    const fl = e.flash > 0.75 && Math.floor(g.t * 20) % 2 === 0;
    drawEnemySprite(ctx, sp, e.x, e.y, e.scale, rot, fl, e.alpha);
  }
  if (e.shield > 0) {
    ctx.strokeStyle = `rgba(155,230,255,${0.45 + 0.25 * Math.sin(g.t * 8)})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 6, 0, TAU);
    ctx.stroke();
  }
  if (e.brand > 0 && g.p.k.brandDraw !== 0) {
    // 烙印標記由技能特效繪製
  }
  if (e.freeze > 0) {
    ctx.fillStyle = "rgba(255,240,140,0.3)";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 4, 0, TAU);
    ctx.fill();
  }
  if ((e.elite || e.def.mid || e.hpBar > 0) && e.hp < e.maxHp) {
    const w = Math.max(26, e.r * 1.8);
    const x = e.x - w / 2;
    const y = e.y - e.r - 12;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 1, y - 1, w + 2, 5);
    ctx.fillStyle = e.def.mid ? "#ff5a6e" : e.elite ? "#ffd36b" : "#ffffff";
    ctx.fillRect(x, y, w * clamp(e.hp / e.maxHp, 0, 1), 3);
  }
}

function drawBoss(g: Game, ctx: CanvasRenderingContext2D, e: Enemy) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.scale(e.scale, e.scale);
  if (e.invuln && e.t > 2.6) ctx.globalAlpha = 0.65 + 0.35 * Math.sin(g.t * 40);
  drawBossBody(ctx, e, g.t, g.p.x, g.p.y);
  ctx.globalAlpha = 1;
  if (e.flash > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = e.flash * 0.4;
    ctx.drawImage(glow("#ffffff", 128), -e.r * 1.6, -e.r * 1.6, e.r * 3.2, e.r * 3.2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
  if (e.burn > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(glow("#ff6a1a", 96), e.x - e.r, e.y - e.r * 0.6, e.r * 2, e.r * 1.2);
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawPlayerBullets(g: Game, ctx: CanvasRenderingContext2D) {
  const arr = g.pb.items;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < arr.length; i++) {
    const b = arr[i];
    const st = pbStyle(b.style);
    // dispW/dispH：含光暈留白的邏輯顯示寬高；無 dispW（dst 既有 mk() 精靈）用 canvas 物理寬
    const w = (st.dispW ?? st.spr.width) * b.scale;
    const h = (st.dispH ?? st.spr.height) * b.scale;
    // 旋轉＝「對齊速度方向(dir)」＋「自轉(spin)」可疊加，對應來源引擎 cf5 的
    //   ang = kind>=20 ? rot : atan2(vy,vx)+π/2 + rot
    // dst 不用 kind 分流（dst spawnPB 預設 b.rot=rand(TAU)、b.spin=8，既有 kind>=20 子彈
    // 靠 st.dir 對齊方向），改用樣式旗標表達：dir=對齊、spin=自轉，兩者皆真＝對齊+自轉。
    const rot = (st.dir ? Math.atan2(b.vy, b.vx) + Math.PI / 2 : 0) + (st.spin ? b.rot : 0);
    if (rot !== 0) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(rot);
      ctx.drawImage(st.spr, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(st.spr, b.x - w / 2, b.y - h / 2, w, h);
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawEnemyBullets(g: Game, ctx: CanvasRenderingContext2D) {
  const arr = g.eb.items;
  for (let i = 0; i < arr.length; i++) {
    const b = arr[i];
    // ── 環境災害彈體（隕石／魚雷）優先走實體貼圖，見 render/hazardBullets.ts ──
    // 判定靠彈體特徵而非事件名（每日挑戰會把母專案與 008 的事件混在同一場）。
    if (drawHazardBullet(g, ctx, b)) continue;
    // ── port/008 血統（`EBullet.cz`）走另一套精靈與定向規則 ──
    // 008 的精靈是「彈頭朝上」設計 → 定向彈轉 `ang + π/2`（母專案的精靈是「朝 +x」→ 轉 `ang`）；
    // 精靈固定 48×48、一律畫在 (x-24, y-24)。另外 008 的延遲起動彈（mode 4）在起動前是半透明。
    if (b.cz) {
      const spr = czEbSprite(b.type, b.color);
      const half = CZ_EB_SIZE / 2;
      if (b.mode === 4 && b.t < b.a) ctx.globalAlpha = 0.45;
      if (CZ_DIR_EB.has(b.type)) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.ang + Math.PI / 2);
        ctx.drawImage(spr, -half, -half);
        ctx.restore();
      } else {
        ctx.drawImage(spr, b.x - half, b.y - half);
      }
      if (b.mode === 4 && b.t < b.a) ctx.globalAlpha = 1;
      continue;
    }
    const spr = ebSprite(b.type, b.color);
    const w = spr.width;
    const h = spr.height;
    if (b.type === 3 || b.type === 4 || b.type === 6) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.ang);
      ctx.drawImage(spr, -w / 2, -h / 2);
      ctx.restore();
    } else {
      let s = 1;
      if (b.mode === 3) s = 1 + 0.12 * Math.sin(b.t * 18);
      ctx.drawImage(spr, b.x - (w * s) / 2, b.y - (h * s) / 2, w * s, h * s);
    }
  }
}

function drawBeams(g: Game, ctx: CanvasRenderingContext2D) {
  const arr = g.beams.items;
  for (let i = 0; i < arr.length; i++) drawBeam(g, ctx, arr[i]);
}

function drawBeam(g: Game, ctx: CanvasRenderingContext2D, b: Beam) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.ang);
  // 環境落雷（`addBeam({ thunder:true })`）走 014 式雷電視覺，其餘光束維持原樣
  if ((b as Beam & { thunder?: boolean }).thunder) {
    drawThunderBeam(ctx, { len: b.len, w: b.w, color: b.color }, b.t, b.warn, b.life, b.dmg > 0);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    return;
  }
  if (b.t < b.warn) {
    const k = b.t / b.warn;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (0.25 + 0.5 * Math.abs(Math.sin(b.t * 18))) * (b.dmg > 0 ? 1 : 0.9);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.dmg > 0 ? 2 : 1.5;
    if (b.dmg > 0) ctx.setLineDash([16, 10]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(b.len, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    if (b.dmg > 0) {
      ctx.globalAlpha = 0.1 + 0.18 * k;
      ctx.fillStyle = b.color;
      ctx.fillRect(0, -b.w * 0.45, b.len, b.w * 0.9);
    }
  } else {
    const rem = b.warn + b.life - b.t;
    const a = clamp(rem / 0.18, 0, 1) * clamp((b.t - b.warn) / 0.06 + 0.3, 0, 1);
    const w = b.w * (0.88 + 0.12 * Math.sin(g.t * 50));
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a;
    const gr = ctx.createLinearGradient(0, -w * 0.9, 0, w * 0.9);
    gr.addColorStop(0, "rgba(0,0,0,0)");
    gr.addColorStop(0.3, b.color);
    gr.addColorStop(0.5, "#ffffff");
    gr.addColorStop(0.7, b.color);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, -w * 0.9, b.len, w * 1.8);
    ctx.drawImage(glow(b.color, 128), -w * 1.2, -w * 1.2, w * 2.4, w * 2.4);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function drawPickup(g: Game, ctx: CanvasRenderingContext2D, k: Pickup) {
  const x = k.x;
  const y = k.y;
  const t = g.t + k.x * 0.01;
  switch (k.kind) {
    case PK.EXP: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#5fe0ff", 32), x - 9, y - 9, 18, 18);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#e6fbff";
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x + 3, y);
      ctx.lineTo(x, y + 4);
      ctx.lineTo(x - 3, y);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case PK.COIN: {
      const sx = Math.abs(Math.cos(t * 5));
      ctx.fillStyle = "#ffd36b";
      ctx.strokeStyle = "#7a4a08";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(x, y, 6 * Math.max(0.25, sx), 6.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(x - 1, y - 3, 1.6, 4);
      break;
    }
    case PK.POWER: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#ff7a2a", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#ff5a2a";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 10, y - 10, 20, 20, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = '900 15px "Bebas Neue", Impact, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("P", x, y + 5.5);
      break;
    }
    case PK.HEAL: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#4dff9a", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#1fb864";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 10, y - 10, 20, 20, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x - 6, y - 2, 12, 4);
      ctx.fillRect(x - 2, y - 6, 4, 12);
      break;
    }
    case PK.ULT: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#c58bff", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#c58bff";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.6;
      starPath(ctx, x, y, 11);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case PK.SHIELD: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#9be6ff", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#3aa8e8";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 11);
      ctx.lineTo(x + 9, y - 6);
      ctx.lineTo(x + 7, y + 6);
      ctx.lineTo(x, y + 11);
      ctx.lineTo(x - 7, y + 6);
      ctx.lineTo(x - 9, y - 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case PK.MAGNET: {
      ctx.strokeStyle = "#ff8ad4";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x - 10.5, y - 8, 5, 6);
      ctx.fillRect(x + 5.5, y - 8, 5, 6);
      break;
    }
    case PK.CORE: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#ff5ad0", 64), x - 22, y - 22, 44, 44);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#ff8ad4";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6 + t;
        const px = x + Math.cos(a) * 9;
        const py = y + Math.sin(a) * 9;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case PK.GEAR: {
      const c = RARITY_COLOR[k.item?.rarity || "R"];
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.5;
      const gr = ctx.createLinearGradient(x, y - 160, x, y);
      gr.addColorStop(0, "rgba(0,0,0,0)");
      gr.addColorStop(1, c);
      ctx.fillStyle = gr;
      ctx.fillRect(x - 5, y - 160, 10, 160);
      ctx.globalAlpha = 1;
      ctx.drawImage(glow(c, 96), x - 34, y - 34, 68, 68);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#12121a";
      ctx.strokeStyle = c;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x - 13, y - 13, 26, 26, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.font = '900 12px "Bebas Neue", Impact, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(k.item?.rarity || "R", x, y + 4.5);
      break;
    }
  }
}

function drawPlayer(g: Game, ctx: CanvasRenderingContext2D) {
  const p = g.p;
  if (p.hp <= 0) return;
  // 奧義「真身收起」：少數機體（緋燕・燕返）的奧義會自行演出替身，若真身照畫就會同時看到
  // 兩架機體。判定與引擎尾焰共用 Game.shipHidden（單一真實來源）。
  if (g.shipHidden) return;
  const ship = g.ship;
  // mode/aux：來源移植機體（cf5/cft/zx）自訂外觀動態；dst 原生機體不讀，餵入無副作用
  // 奧義變身中強制最高階外觀：機體 id 由 data/ships.ts 的 FORM_TIER3 決定（不寫死遊戲名）
  // sx 批次（星燼曙約）的「曉星」以 p.k.formV 作為化身的平滑值（0→1）驅動外觀；
  // 其餘機體不設 formV → 回落 p.form（行為不變）。
  const formV = (p.k.formV as number) ?? p.form;
  const o: ShipDrawOpts = { t: g.t, tier: p.form === 1 && FORM_TIER3.includes(ship.id) ? 3 : p.tier, thrust: p.thrust, form: formV, morph: p.morph, gear: p.gear, bank: p.bank, color: ship.color, color2: ship.color2, mode: (p.k.mode as number) || 0, aux: (p.k.aux as number) || 0, pulse: (p.k.pulse as number) || 0, side: (p.k.side as number) || 1, focus: !!p.k.focus, pods: (p.k.podsView as { x: number; y: number }[]) || [], k: p.k };
  // 光環
  if (p.auraColor) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.28 + 0.12 * Math.sin(g.t * 4);
    ctx.drawImage(glow(p.auraColor, 128), p.x - 70, p.y - 70, 140, 140);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.bank * 0.16);
  if (p.inv > 0 && p.ultBusy <= 0 && g.stateName === "playing") ctx.globalAlpha = 0.5 + 0.4 * Math.abs(Math.sin(g.t * 34));
  drawShip(ctx, ship.id, o);
  ctx.restore();
  ctx.globalAlpha = 1;
  // 施放光暈
  if (p.castT > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = p.castT / 0.5;
    ctx.drawImage(glow(ship.color, 128), p.x - 60, p.y - 60, 120, 120);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  // 護盾
  if (p.shield > 0) {
    ctx.strokeStyle = `rgba(155,230,255,${0.55 + 0.25 * Math.sin(g.t * 8)})`;
    ctx.lineWidth = 2.4;
    for (let i = 0; i < p.shield; i++) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 34 + i * 5, g.t * 2 + i, g.t * 2 + i + TAU * 0.78);
      ctx.stroke();
    }
  }
  // 僚機
  const n = p.s.options;
  for (let i = 0; i < n; i++) {
    const a = g.optAng + (i * TAU) / n;
    const ox = p.x + Math.cos(a) * 44;
    const oy = p.y + Math.sin(a) * 18 - 4;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(glow(ship.color2, 48), ox - 14, oy - 14, 28, 28);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#f4f8ff";
    ctx.strokeStyle = "#0a0a12";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ox, oy - 8);
    ctx.lineTo(ox + 5, oy + 5);
    ctx.lineTo(ox, oy + 2);
    ctx.lineTo(ox - 5, oy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // 判定點
  if (g.save.settings.hitbox || g.input.focus) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ff2a4a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.4, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}

// ===== src\game\engine\Game.ts =====
// 遊戲核心：主迴圈、玩家、碰撞、掉落、升級卡片、關卡時間軸與結算
import { H, QUALITY, TAU, W, clamp, dist2, lerp, makeRng, rand, smooth } from "../constants";
import type { QualityKey } from "../constants";
import { DIFFS } from "../constants";
import { CUTIN_DUR, CUTIN_DUR_FAST, FAST_CUTIN_SHIPS } from "../cutin";
import type { EquipItem, RunResult, SaveData, ShipId, SkillKey } from "../types";
import { SHIPS, EVO_LEVELS, SKILL_KEYS, SKILL_LABEL, SKILL_MAX_RUN } from "../data/ships";
import type { ShipDef } from "../data/ships";
import { ENEMIES, BOSSES, ENEMY_ALIAS, SP_BOSS_COUNT } from "../data/enemies";
import type { BossDef } from "../data/enemies";
import { STAGES, buildTimeline, genEndlessChunk, ENDLESS_BGS, ENDLESS_KINDS } from "../data/stages";
import type { StageDef, TEvent, SpawnOpt } from "../data/stages";
import type { DailyMod } from "../data/daily";
import { CARDS, RARITY_CARD } from "../data/cards";
import { genItem, RARITY_INFO, type ItemFamily } from "../data/equipment";
import { krDropChance } from "../data/krDrops";
import { Pool, makeBeam, makeEB, makeEnemy, makePB, makePickup, PK } from "../entities";
import type { Beam, EBullet, Enemy, EnemyDef, Fx, PBullet, Pickup } from "../entities";
import { FxSys, PAL } from "../render/fx";
import { Background } from "../render/background";
import { CZ_EB_R, EB_R } from "../render/sprites";
import { InputSys } from "../input";
import { audio, CZ_BOSS_MUSIC, M013, SP_BOSS_MUSIC } from "../audio";
import { cardExtra, duplicateExtra, rotateVel } from "../port/cardFx";
import { addItems, mutate } from "../save";
import { buildPlayer } from "./player";
import type { Player } from "./player";
import { updateEnemy } from "./enemyAI";
import { BOSS_PHASE_MARKS, MID_PHASE_MARKS, bossPhaseCount, updateBoss } from "./bossAI";
import { ring } from "./patterns";
import { HAZARD_INFO, startHazard, updateHazards } from "./hazards";
import type { Hazard } from "./hazards";
import { updateProcs } from "./equipProcs";
import { renderGame } from "./renderer";
import { makeAutoQ, stepAutoQ } from "./qualityAuto";
import type { ShipKit } from "../skills/common";
import { boltFx } from "../skills/common";
// ── 011 批次（port/011）：12 台主線機體改用移植 kit ─────────────────────────
//   技能來源：夜鴉＝天頂星紋彈幕協奏，其餘 11 台＝星紋戰翼（見 shipPort011/ 各檔檔頭）。
//   ⚠ 兩套框架不可互換 → 夜鴉必須走 p011zsKit，其餘走 p011Kit。
import { p011Kit } from "../port/p011Api";
import { p011zsKit } from "../port/p011zsApi";
import { crowKit as crowKit011 } from "../shipPort011/crow";
import { lanceKit as lanceKit011 } from "../shipPort011/lance";
import { jadeKit as jadeKit011 } from "../shipPort011/jade";
import { voltKit as voltKit011 } from "../shipPort011/volt";
import { noirKit as noirKit011 } from "../shipPort011/noir";
import { prismKit as prismKit011 } from "../shipPort011/prism";
import { hizukiKit as hizukiKit011 } from "../shipPort011/hizuki";
import { yagarasuKit as yagarasuKit011 } from "../shipPort011/yagarasu";
import { tetsugakiKit as tetsugakiKit011 } from "../shipPort011/tetsugaki";
import { gunseiKit as gunseiKit011 } from "../shipPort011/gunsei";
import { soukaKit as soukaKit011 } from "../shipPort011/souka";
import { yumeiKit as yumeiKit011 } from "../shipPort011/yumei";
import { hienKit } from "../skills/hien";
import { sogaKit } from "../skills/soga";
import { tsukikageKit } from "../skills/tsukikage";
import { sumizomeKit } from "../skills/sumizome";
import { rinshinKit } from "../skills/rinshin";
import { suirenKit } from "../skills/suiren";
import { auroraKit } from "../skills/aurora";
import { emberKit } from "../skills/ember";
import { glacierKit } from "../skills/glacier";
import { sakuraKit } from "../skills/sakura";
import { umbraKit } from "../skills/umbra";
import { thunderboltKit } from "../skills/thunderbolt";
import { frostlunaKit } from "../skills/frostluna";
import { petalKit } from "../skills/petal";
import { voidKit } from "../skills/void";
import { frostLKit } from "../skills/frost";
import { shadeKit } from "../skills/shade";
import { haloKit } from "../skills/halo";
import { cinderKit } from "../shipPortCFT/cinder";
import { rimeKit } from "../shipPortCFT/rime";
import { surgeKit } from "../shipPortCFT/surge";
import { galeKit } from "../shipPortCFT/gale";
import { aurumKit } from "../shipPortCFT/aurum";
import { hollowKit } from "../shipPortCFT/hollow";
import { kokuyouKit } from "../shipPortCF5/kokuyou";
import { homuraKit } from "../shipPortCF5/homura";
import { shirayukiKit } from "../shipPortCF5/shirayuki";
import { hyakkiKit } from "../shipPortCF5/hyakki";
import { kagariKit } from "../skills/kagari";
import { seiranKit } from "../skills/seiran";
import { yozoraKit } from "../skills/yozora";
import { onyxKit } from "../skills/onyx";
// zx 批次（來源 port/006 緋月異能戰線）：kit 逐行搬移，由 zxKit 轉接引擎呼叫
import { dealerKit } from "../shipPortZX/dealer";
import { hariKit } from "../shipPortZX/hari";
import { fudeKit } from "../shipPortZX/fude";
import { zxKit } from "../port/zxApi";
// pl 批次（來源 port/005 萬象・極光／晚星・天網／冴刃・凜）：kit 逐行搬移，由 plKit 轉接引擎呼叫
import { kaleidoKit } from "../shipPortPL/kaleido";
import { vesperKit } from "../shipPortPL/vesper";
import { zanshinKit } from "../shipPortPL/zanshin";
import { plKit } from "../port/plApi";
// ar 批次（來源 port/004 刻蝕時計）：kit 逐行搬移，由 arKit 轉接引擎呼叫
import { tempusKit } from "../shipPortAR/tempus";
import { arKit } from "../port/arApi";
// sg 批次（來源 port/007 絲弦）：kit 逐行搬移，由 sgKit 轉接引擎呼叫
import { shirabeKit } from "../shipPortSG/shirabe";
import { sgKit } from "../port/sgApi";
// nx 批次（來源 port/001 斬界戰姬）：kit 逐行搬移，由 nxKit 轉接引擎呼叫
import { marionetteKit } from "../shipPortNX/marionette";
import { tenbinKit } from "../shipPortNX/tenbin";
import { nxKit } from "../port/nxApi";
// sv 批次（來源 port/003 刻印戰線）：kit 逐行搬移，由 svKit 轉接引擎呼叫
import { pugnaKit } from "../shipPortSV/pugna";
import { svKit } from "../port/svApi";
// a 批次（來源 port/002 星魂夜曲）：kit 逐行搬移，由 aKit 轉接引擎呼叫
import { kilnKit } from "../shipPortA/kiln";
import { lunateKit } from "../shipPortA/lunate";
import { oracleKit } from "../shipPortA/oracle";
import { papilioKit } from "../shipPortA/papilio";
import { tetherKit } from "../shipPortA/tether";
import { aKit } from "../port/aApi";
// sx 批次（來源 port/010 星燼曙約）：kit 逐行搬移，由 sxKit 轉接引擎呼叫
import { dawnKit } from "../shipPortSX/dawn";
import { ironKit } from "../shipPortSX/iron";
import { azureKit } from "../shipPortSX/azure";
import { nightKit } from "../shipPortSX/night";
import { verdantKit } from "../shipPortSX/verdant";
import { moonKit } from "../shipPortSX/moon";
import { sxKit } from "../port/sxApi";

// ── 012 批次（port/012）：12 台新機的 kit ─────────────────────────────────────
//   10 台（雙子/零位/星錘/日鏡/漫格/霓彈/分鏡/映界/回聲/詰將）＝ A《穹裂奇想》，family "A"
//    2 台（律音/天門）                                      ＝ B《破穹18翼》，family "B"
//   family 只影響 p012Api 轉接層的「池預設」與「詞條疊加方式」，kit 本體保持來源一字不改。
import { p012Kit } from "../port/p012Api";
// ── 016 批次（port/016《緋冕裂空錄》）：第一波 2 台（福喵／斬刃）─────────────────
//   轉接層 krApi 負責 spawnPB 池預設／傷害預除／詞條規則／selfMove；
//   `auxOf` 把 kit 的私有狀態寫回扁平的 `p.k.aux` 供外觀使用（斬刃＝納刀蓄力）。
import { krKit } from "../port/krApi";
import { nekoKit } from "../shipPort016/neko";
import { muramasaKit } from "../shipPort016/muramasa";
import { geminiKit012 } from "../shipPort012/gemini";
import { glitchKit012 } from "../shipPort012/glitch";
import { morningstarKit012 } from "../shipPort012/morningstar";
import { heliostatKit012 } from "../shipPort012/heliostat";
import { comicKit012 } from "../shipPort012/comic";
import { bumperKit012 } from "../shipPort012/bumper";
import { panelKit012 } from "../shipPort012/panel";
import { kagamiKit012 } from "../shipPort012/kagami";
import { echoKit012 } from "../shipPort012/echo";
import { cadenceKit012 } from "../shipPort012/cadence";
import { gambitKit012 } from "../shipPort012/gambit";
import { gateKit012 } from "../shipPort012/gate";

/**
 * 對特定機體無效／會破壞手感的升級卡片排除表（2026-10-18 大爺回報後新增）。
 *   homing：① 主武是自走彈（kind>=20 selfMove／棋步／光束）→ `updatePBullets` 的
 *              homing 轉向只在 `!b.selfMove` 時執行，卡片完全無效果；
 *            ② 主武本身已自帶 homing → 再疊只會更黏，不該出現。
 *   multi ：主武不是可數彈道（日鏡是鏡面反射光束）→ 額外彈道無意義。
 *           另：a 血統（002）的 aApi 沒接 duplicateExtra → 引擎層已統一注入
 *           （見 SELF_MULTI_SHIPS），但赤燼主武是「火焰錐噴」kind>=20 自走膨脹火團，
 *           角度展開會被 selfMove 行為蓋掉 → 這台單獨留在此表不出現卡片。
 */
const CARD_SKIP_SHIPS: Partial<Record<ShipId, string[]>> = {
  glitch: ["homing"], // 零位：封包 Z 字自走
  comic: ["homing"], // 漫格：擬聲字彈自走
  cadence: ["homing"], // 律音：音符自走
  gambit: ["homing"], // 詰將：棋步自走（追蹤會破壞棋路視覺）
  kagami: ["homing"], // 映界：稜針碎片天生微追蹤
  gate: ["homing"], // 天門：寶庫光矢天生追蹤
  echo: ["homing"], // 回聲：殘響針 Lv5 起天生微追蹤
  hien: ["homing"], // 緋燕：鳳羽天生追蹤
  seiran: ["homing"], // 青嵐：尋的彈天生追蹤
  tsukikage: ["homing"], // 月影：月刃 Lv5 起天生追蹤
  suiren: ["homing"], // 睡蓮：花蕾 Lv5 起天生追蹤
  noir: ["homing"], // 夜鴉：主羽天生追蹤
  jade: ["homing"], // 翡翠：全開模式天生追蹤
  muramasa: ["homing"],
  //       斬刃（2026-10-21 大爺指定）：主武 Lv7 才自帶追蹤（高難關主力），
  //       Lv1~6 若抽到全彈追蹤會直接過強 → 這台不給 homing 卡。
  //       ⚠ 與上面幾台的「天生追蹤所以不給」不同，這台是「刻意保留 Lv7 的成長價值」。
  kiln: ["multi"], // 赤燼：火焰錐噴（kind>=20 自走膨脹火團），角度展開會被 selfMove 蓋掉 → 無效果
  aurora: ["multi", "homing", "pierce", "explode", "burn", "frost", "arc"],
  //       曙光：主武是**光束**（`currentBeams` 的垂直光柱，逐幀線段判定），整台沒有主武子彈
  //       → 所有「子彈詞條」卡片都是死值（2026-10-20 `_attach_test.cjs` 四張卡全滅證實）。
  heliostat: ["homing", "multi", "pierce", "explode", "burn", "frost", "arc"],
  //       日鏡：鏡面反射光束，同樣沒有主武子彈（只有奧義的 src:2 碎片）。
  //       ⚠ 兩台的「僚機砲塔」子彈（src:1）本來吃得到這些卡，但佔比極低；
  //         寧可不要讓玩家抽到看起來有用、實際幾乎無感的卡。
};

/**
 * 由自己的轉接層／kit 自己消費 `p.s.extra`（多重射擊卡）的機體白名單。
 *
 * 背景：`multi` 卡的效果是 `g.p.s.extra += 1`，而 `extra` 只有兩種消費路徑——
 *   ① 轉接層把 `fire` 包一層（`fire` 拿 before／after 比對新彈，呼叫 `duplicateExtra`）；
 *   ② kit 內部直接讀 `p.s.extra` 手搓多重彈。
 * 兩者都沒接的機體，卡片就是死值（選了完全沒效果）。
 *
 * 2026-10-19 全專案稽核：78 台裡 38 台本來就有效（下列白名單）、40 台無效。
 * 大爺回報「crow 這種吃不到彈道+1 就有問題了」→ 不在本白名單的機體，
 * 一律改由**引擎層統一注入** `duplicateExtra`（見 `updatePlayer`），
 * 不再逐台補轉接層。白名單內的機體若重複注入會變成 double extra（彈幕爆量）。
 */
const SELF_MULTI_SHIPS = new Set<ShipId>([
  "aurora", "aurum", "bumper", "cadence", "cinder", "comic", "dawn",
  "echo", "ember", "frost", "frostluna", "gale", "gambit", "gate",
  "gemini", "glacier", "glitch", "halo", "hollow", "homura", "hyakki",
  "iron", "kagami", "kokuyou", "morningstar", "night", "panel", "petal",
  "rime", "sakura", "shade", "shirayuki", "surge", "thunderbolt", "umbra",
  "verdant", "void", "yagarasu",
  // 016 批次（port/016）：兩台主武都自己讀 `p.s.extra` 手搓多重彈
  //   福喵 `count = (wLv>=3 ? 2 : 1) + g.p.s.extra`／斬刃 `total = 3 + g.p.s.extra`
  "neko", "muramasa",
]);

const KITS: Record<ShipId, ShipKit> = { crow: p011Kit({ kit: crowKit011 }), lance: p011Kit({ kit: lanceKit011 }), jade: p011Kit({ kit: jadeKit011 }), volt: p011Kit({ kit: voltKit011 }), noir: p011Kit({ kit: noirKit011 }), prism: p011Kit({ kit: prismKit011 }), hizuki: p011Kit({ kit: hizukiKit011 }), yagarasu: p011zsKit({ kit: yagarasuKit011 }), tetsugaki: p011Kit({ kit: tetsugakiKit011 }), gunsei: p011Kit({ kit: gunseiKit011 }), souka: p011Kit({ kit: soukaKit011 }), yumei: p011Kit({ kit: yumeiKit011 }), hien: hienKit, soga: sogaKit, tsukikage: tsukikageKit, sumizome: sumizomeKit, rinshin: rinshinKit, suiren: suirenKit, aurora: auroraKit, ember: emberKit, glacier: glacierKit, sakura: sakuraKit, umbra: umbraKit, thunderbolt: thunderboltKit, frostluna: frostlunaKit, petal: petalKit, void: voidKit, frost: frostLKit, shade: shadeKit, halo: haloKit, cinder: cinderKit, rime: rimeKit, surge: surgeKit, gale: galeKit, aurum: aurumKit, hollow: hollowKit, kokuyou: kokuyouKit, homura: homuraKit, shirayuki: shirayukiKit, hyakki: hyakkiKit, kagari: kagariKit, seiran: seiranKit, yozora: yozoraKit, onyx: onyxKit, dealer: zxKit({ kit: dealerKit }), hari: zxKit({ kit: hariKit }), fude: zxKit({ kit: fudeKit }), kaleido: plKit({ kit: kaleidoKit }), vesper: plKit({ kit: vesperKit }), zanshin: plKit({ kit: zanshinKit }), tempus: arKit({ kit: tempusKit }), shirabe: sgKit({ kit: shirabeKit }), marionette: nxKit({ kit: marionetteKit }), tenbin: nxKit({ kit: tenbinKit }), pugna: svKit({ kit: pugnaKit }), kiln: aKit({ kit: kilnKit }), lunate: aKit({ kit: lunateKit }), oracle: aKit({ kit: oracleKit }), papilio: aKit({ kit: papilioKit }), tether: aKit({ kit: tetherKit }), dawn: sxKit({ kit: dawnKit }), iron: sxKit({ kit: ironKit }), azure: sxKit({ kit: azureKit }), night: sxKit({ kit: nightKit }), verdant: sxKit({ kit: verdantKit }), moon: sxKit({ kit: moonKit }), gemini: p012Kit({ kit: geminiKit012 }), glitch: p012Kit({ kit: glitchKit012 }), morningstar: p012Kit({ kit: morningstarKit012 }), heliostat: p012Kit({ kit: heliostatKit012 }), comic: p012Kit({ kit: comicKit012 }), bumper: p012Kit({ kit: bumperKit012 }), panel: p012Kit({ kit: panelKit012 }), kagami: p012Kit({ kit: kagamiKit012 }), echo: p012Kit({ kit: echoKit012 }), cadence: p012Kit({ kit: cadenceKit012, family: "B" }), gambit: p012Kit({ kit: gambitKit012 }), gate: p012Kit({ kit: gateKit012, family: "B" }), neko: krKit({ kit: nekoKit, selfCards: ["homing"] }), muramasa: krKit({ kit: muramasaKit, selfCards: ["pierce"], auxOf: (g) => (g.p.k.charge as number) || 0 }) };

/**
 * 機庫／選機畫面用的外觀範例值（對應來源 Hangar.tsx 的 `kit.preview?.(t)`）。
 *
 * 背景：來源各專案的 Hangar 都會呼叫 `preview(t)` 取 `{mode, aux}`，
 * 讓靜態展示也有動態（鐵壘變形、白雪凝神、拳鋼出拳…）。
 * dst 過去**全專案沒有任何地方呼叫 preview()** → 機庫一律 aux=mode=0（展示全靜止）。
 * 本函式把 kit 表開放給 UI 層，讓 ShipCanvas 能補上這兩個值。
 * 未實作 preview 的 kit（含全部 SP 原生機體）回傳 undefined，UI 端維持原值 → 無行為改變。
 */
export function shipPreview(id: ShipId, t: number): { mode: number; aux: number } | undefined {
  return KITS[id]?.preview?.(t);
}

export type GameState = "playing" | "paused" | "card" | "ultcut" | "over" | "clear";
export interface CardChoice {
  id: string;
  name: string;
  desc: string;
  rarity: number;
  icon: string;
  lvText?: string;
  evo?: string;
  skill?: SkillKey;
}

export interface GameCallbacks {
  onCards?: (choices: CardChoice[]) => void;
  onOver?: (r: RunResult) => void;
  onClear?: (r: RunResult) => void;
  onBossIntro?: (b: BossDef, stage: number) => void;
  onBanner?: (title: string, sub: string, color?: string) => void;
  onEvolve?: (info: { name: string; tier: number; skill: string }) => void;
  onState?: (s: GameState) => void;
  onGear?: (item: EquipItem) => void;
}

export interface GameOpts {
  ship: ShipId;
  stageId: number; // 0 = 無限模式
  diff: number;
  save: SaveData;
  canvas: HTMLCanvasElement;
  cb: GameCallbacks;
  /** 每日挑戰：以日期種子生成的關卡 ＋ 當日詞綴（提供時 `stageId` 只作為識別用）。 */
  daily?: { stage: StageDef; mods: DailyMod[]; seed: number };
}

export interface HudData {
  hp: number;
  maxHp: number;
  shield: number;
  exp: number;
  expNeed: number;
  level: number;
  score: number;
  combo: number;
  comboT: number;
  activeCd: number;
  ult: number;
  power: number;
  // `phMax`＝階段總數（血條格數）、`marks`＝階段血量門檻（血條分隔線位置）。
  // 兩者都來自 bossAI 的 BOSS_PHASE_MARKS，母專案 3 階段、port/008 的 Boss 4 階段。
  boss: { name: string; hp: number; ph: number; phMax: number; marks: readonly number[] } | null;
  progress: number;
  time: number;
  form: number;
  ultReady: boolean;
  callout: string;
  calloutColor: string;
  hi: number;
  fps: number;
  lootT: number; // >0 時顯示回收倒數
  lootMax: number;
}

// ============================================================================
// 無限模式加壓曲線（2026-10-10）
// ----------------------------------------------------------------------------
// 背景：舊版只有 hpScale() 的線性 +13%/chunk；敵彈傷害在 chunk 27 就封頂、敵方射速完全不成長
//       → 後期「威脅」早就停止成長，而玩家 DPS 是乘算成長 → 越打越輕鬆
//       （大爺實測：連續半小時滿血、0 受擊）。
// 設計：前期（約 5~10 分鐘）維持好打＝爽快感；之後轉為**指數加壓**。
// 難度：無限模式有三種難度（之後會變四種）→ 這裡不寫死三組，改用
//       `diff / (DIFFS.length - 1)` 正規化後在最易↔最難兩端點間內插 ⇒ **新增難度不用改這裡**。
//       （血量另外還會乘上該難度的 dm.hp＝1 / 1.8 / 3。）
// ============================================================================
const ENDLESS_EXP_FROM_EASY = 24; // 最易難度：chunk 24（約 7 分鐘）後才開始指數加壓
const ENDLESS_EXP_FROM_HARD = 16; // 最難難度：chunk 16（約 5 分鐘）就開始
const ENDLESS_EXP_BASE_EASY = 1.06; // 最易難度：指數底數（每 chunk ×1.06）
const ENDLESS_EXP_BASE_HARD = 1.07; // 最難難度
const ENDLESS_DMG_PER_CHUNK = 0.3; // 敵彈傷害：si = 3 + chunk×0.3（原為 min(4, chunk×0.15)，chunk 27 封頂）
const ENDLESS_FIRE_PER_CHUNK = 0.018; // 敵方射速：射擊間隔 ÷(1 + chunk×0.018)（原完全不隨時間成長）

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cb: GameCallbacks;
  W = W;
  H = H;
  ship: ShipDef;
  kit: ShipKit;
  save: SaveData;
  stage: StageDef | null;
  endless: boolean;
  /** 每日挑戰（非每日時為 null）：當日關卡與詞綴。 */
  daily: { stage: StageDef; mods: DailyMod[]; seed: number } | null = null;
  /** **目前正在執行的 AI 是否屬於 port/008 血統**（`cz_` 前綴）。
   *  由 `updateEnemy`／`updateBoss`／`updateMid`／`updateHazards` 的進入點依 id 蓋章，
   *  `spawnEB` 讀它寫進 `EBullet.cz` → 之後渲染與碰撞半徑都依**那一顆彈**自己的旗標分流
   *  （每日挑戰的敵人池是 SP＋008 混合，所以必須逐彈記錄、不能用關卡整體判斷）。 */
  czEB = false;
  /** 每日挑戰詞綴 id 集合（`fast`／`tough`／`rich`／`elite`／`frail`／`gift`）。 */
  mods = new Set<string>();
  /** 詞綴：敵彈速度倍率（`fast`）。 */
  bulMul = 1;
  /** 詞綴：敵機耐久倍率（`tough`）。 */
  hpExtra = 1;
  diff: number;
  dm = DIFFS[0];
  endlessTheme = 0;
  stateName: GameState = "playing";
  t = 0;
  rdt = 0.016;
  timeScale = 1;
  slowT = 0;
  slowScale = 1;
  hitstopT = 0;
  stageT = 0;
  p: Player;
  /** 開局基準（機體戰況顯示「戰鬥中取得的 +N」用）：於建構子尾端、kit.init 之後快照。
   *  放在 init 後才不會把 kit 的開局被動加成（如 gale 的 dmgMul=1.2）誤算成戰鬥中取得。 */
  dmgBase = 1;
  rateBase = 1;
  pb = new Pool<PBullet>(makePB);
  eb = new Pool<EBullet>(makeEB);
  en = new Pool<Enemy>(makeEnemy);
  pk = new Pool<Pickup>(makePickup);
  beams = new Pool<Beam>(makeBeam);
  fx = new FxSys();
  fxs: Fx[] = [];
  hazards: Hazard[] = [];
  bg = new Background();
  input = new InputSys();
  timeline: TEvent[] = [];
  tlIdx = 0;
  blocked: "mid" | "boss" | null = null;
  boss: Enemy | null = null;
  mid: Enemy | null = null;
  bossIdx = 0;
  chunk = 0;
  chunkStart = 0;
  bossCycle = 0;
  score = 0;
  combo = 0;
  comboT = 0;
  maxCombo = 0;
  kills = 0;
  // 評價用計數（cf5 式）：被擊中次數、時間軸敵機生成數／擊墜數 → 擊墜率
  hits = 0;
  spawnedTL = 0;
  killsTL = 0;
  coins = 0;
  cores = 0;
  items: EquipItem[] = [];
  level = 1;
  exp = 0;
  expNeed = 32;
  runLv: Record<SkillKey, number> = { weapon: 0, passive: 0, active: 0, ult: 0 };
  cards: Record<string, number> = {};
  pendingLevels = 0;
  wind = 0;
  /** 強風的平滑值：絕對跟隨會把 `wind` 的位移抵銷掉（見 updatePlayer），
   *  實際的「被吹偏」是把它換算成跟隨目標的位移，這裡存平滑後的量。 */
  windOff = 0;
  bgSpeed = 1;
  bulletSlow = 1;
  bulletSlowT = 0;
  shakeAmt = 0;
  shakeT = 0;
  shakeX = 0;
  shakeY = 0;
  flashA = 0;
  flashColor = "#fff";
  tintA = 0;
  tintColor = "#000";
  tintT = 0;
  tintMax = 0;
  timers: { t: number; fn: () => void }[] = [];
  uidC = 1;
  quality: QualityKey = "high";
  qualitySetting = "auto";
  pxScale = 1;
  lensOK = true;
  cutT = 0;
  bossDieT = 0;
  // 戰利品回收階段（boss 擊破後）：looting 開、lootT 倒數、collectAll 強收
  looting = false;
  lootT = 0;
  lootMax = 12;
  collectAll = false;
  lootFinishT = 0;
  endT = 0;
  finished = false;
  beamHitCd = 0;
  grazeCount = 0;
  ultWasReady = false;
  calloutT = 0;
  callout = "";
  calloutColor = "#fff";
  time = 0;
  hud: HudData;
  raf = 0;
  lastNow = 0;
  running = false;
  fpsAcc = 0;
  fpsN = 0;
  fps = 60;
  /** 畫質自動分級的狀態（邏輯在 `qualityAuto.ts`）。
   *  舊版只有 `slowFrames`、`fps` 一掉就降級、**永遠不會升回來** →
   *  開場或某個爆量瞬間卡一下，整場就停在模糊的 dpr 1。 */
  autoQ = makeAutoQ();
  lowHpPulse = 0;
  hazardDone = false;
  reviveFx = 0;
  optAng = 0;
  optFireT = 0;

  constructor(o: GameOpts) {
    this.canvas = o.canvas;
    this.ctx = o.canvas.getContext("2d", { alpha: false })!;
    this.cb = o.cb;
    this.save = o.save;
    this.ship = SHIPS[o.ship];
    this.kit = KITS[o.ship];
    this.daily = o.daily || null;
    this.endless = o.stageId === 0 && !this.daily;
    this.stage = this.daily ? this.daily.stage : this.endless ? null : STAGES[o.stageId - 1];
    this.diff = o.diff;
    this.dm = DIFFS[o.diff];
    this.p = buildPlayer(o.ship, o.save);
    this.p.power = 2; // 開局即有一定火力，前 10 秒就有爽快感
    this.qualitySetting = o.save.settings.quality;
    this.setQuality(this.qualitySetting === "auto" ? (matchMedia("(pointer:coarse)").matches ? "mid" : "high") : (this.qualitySetting as QualityKey));
    this.fx.showText = o.save.settings.showDmg;
    this.input.sens = o.save.settings.sens;
    this.kit.init(this);
    // 每日挑戰詞綴：必須在 kit.init（算完機體基礎值）之後套用。
    if (this.daily) for (const m of this.daily.mods) this.mods.add(m.id);
    if (this.mods.has("frail")) {
      this.p.s.atk += 0.3;
      this.p.maxHp = Math.round(this.p.maxHp * 0.7);
      this.p.hp = this.p.maxHp;
    }
    if (this.mods.has("tough")) this.hpExtra = 1.4;
    if (this.mods.has("fast")) this.bulMul *= 1.2;
    if (this.mods.has("rich")) {
      this.p.s.coinMul += 0.5;
      this.p.s.expMul += 0.5;
    }
    if (this.mods.has("gift")) this.p.s.luck += 0.7;
    // ── 2026-10-12 詞綴擴池（6 → 12）新增的 6 種；定義見 `data/daily.ts` ──
    if (this.mods.has("swift")) this.p.s.spd *= 1.25;
    if (this.mods.has("sniper")) {
      this.p.s.crit += 0.12;
      this.p.s.critDmg += 0.25;
    }
    if (this.mods.has("haste")) this.p.s.ultMul += 0.5;
    if (this.mods.has("greed")) {
      this.p.s.coinMul += 1.2;
      this.p.s.expMul += 1.2;
      this.p.maxHp = Math.round(this.p.maxHp * 0.75);
      this.p.hp = this.p.maxHp;
    }
    if (this.mods.has("overload")) {
      this.p.s.rate *= 1.4;
      this.bulMul *= 1.15;
    }
    if (this.mods.has("berserk")) this.p.s.vigor += 0.6;
    this.timeline = this.endless
      ? genEndlessChunk(0, 1, this.diff)
      : buildTimeline(this.stage!, this.diff, this.daily ? makeRng(this.daily.seed * 2654435761 + 0x9e3779b9) : undefined);
    this.chunk = 0;
    this.chunkStart = 0;
    this.hud = { hp: 0, maxHp: 0, shield: 0, exp: 0, expNeed: 1, level: 1, score: 0, combo: 0, comboT: 0, activeCd: 0, ult: 0, power: 0, boss: null, progress: 0, time: 0, form: 0, ultReady: false, callout: "", calloutColor: "#fff", hi: 0, fps: 60, lootT: 0, lootMax: 12 };
    const rec = this.endless ? o.save.endless.hi?.[o.diff] || 0 : this.daily ? o.save.daily.best?.[o.diff] || 0 : o.save.stages[String(o.stageId)]?.hi?.[o.diff] || 0;
    this.hud.hi = rec;
    this.input.attach(o.canvas);
    audio.setTheme(this.stage ? this.stage.music : (this.daily ? M013.daily : M013.endless));
    // 開局基準：必須在 kit.init 之後 → 開局被動算基準，不算「戰鬥中取得」
    this.dmgBase = this.dmgMult();
    this.rateBase = this.p.s.rate;
  }

  // ------------------------------------------------------------------
  setQuality(q: QualityKey) {
    this.quality = q;
    const Q = QUALITY[q];
    this.fx.max = Q.particles;
    this.fx.pMul = Q.pMul;
    this.bg.layers = Q.bgLayers;
    this.lensOK = Q.lens;
    // ⚠ dpr 是在 `resize()` 裡才算的 → 只改 quality 不動 canvas 尺寸的話，
    //   `QUALITY[q].dpr` 根本不會生效（畫面模糊度不變）。這裡順手重算一次。
    if (this.canvas) this.resize(this.canvas.clientWidth || 540, this.canvas.clientHeight || 960);
  }

  resize(cssW: number, cssH: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, QUALITY[this.quality].dpr);
    const w = Math.max(2, Math.round(cssW * dpr));
    const h = Math.max(2, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.pxScale = w / W;
  }

  start() {
    this.running = true;
    this.lastNow = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastNow) / 1000));
      this.lastNow = now;
      try {
        this.frame(dt);
      } catch (err) {
        // 單幀錯誤不應使整個遊戲凍結
        console.error(err);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
  }

  // ------------------------------------------------------------------
  setState(s: GameState) {
    const prev = this.stateName;
    this.stateName = s;
    // 從「會吃掉游標的 UI 覆蓋層」回到戰鬥時重新對位。
    // 升級卡片（手動選擇）與暫停選單都必須把游標移到按鈕上才點得到，而 `pointermove`
    // 掛在 window → 游標一離開機體，絕對跟隨的目標 `tx/ty` 就被寫成按鈕座標。
    // 不重新對位的話，恢復戰鬥的下一幀機體會直接衝向那顆按鈕（通常在上方＝敵火正中央）。
    if (s === "playing" && (prev === "card" || prev === "paused") && this.p) {
      this.input.reanchor(this.p.x, this.p.y);
    }
    this.cb.onState?.(s);
  }

  pause() {
    if (this.stateName === "playing") this.setState("paused");
  }
  resume() {
    if (this.stateName === "paused") this.setState("playing");
  }

  frame(rdt: number) {
    this.rdt = rdt;
    // 效能自動分級
    this.fpsAcc += rdt;
    this.fpsN++;
    if (this.fpsAcc >= 1) {
      this.fps = this.fpsN / this.fpsAcc;
      this.fpsAcc = 0;
      this.fpsN = 0;
      if (this.qualitySetting === "auto" && this.stateName === "playing") {
        // 決策邏輯在 `qualityAuto.ts`（純函式，守門測試 `_quality_test.mjs` 直接跑真的那份）。
        const next = stepAutoQ(this.autoQ, this.fps, this.quality);
        if (next) this.setQuality(next);
      }
    }
    const inp = this.input;
    if (inp.pressPause) {
      inp.pressPause = false;
      if (this.stateName === "playing") this.pause();
      else if (this.stateName === "paused") this.resume();
    }
    if (this.stateName === "playing") {
      if (inp.pressActive) {
        inp.pressActive = false;
        this.tryActive();
      }
      if (inp.pressUlt) {
        inp.pressUlt = false;
        this.tryUlt();
      }
    } else {
      inp.pressActive = false;
      inp.pressUlt = false;
    }
    if (this.stateName === "ultcut") {
      this.cutT -= rdt;
      if (this.cutT <= 0) {
        this.setState("playing");
        this.kit.castUlt(this);
      }
    } else if (this.stateName === "playing" || this.stateName === "over" || this.stateName === "clear") {
      // 時間縮放（慢動作／頓幀）
      let ts = 1;
      if (this.slowT > 0) {
        this.slowT -= rdt;
        ts = this.slowScale;
      }
      if (this.hitstopT > 0) {
        this.hitstopT -= rdt;
        ts = Math.min(ts, 0.08);
      }
      this.timeScale = ts;
      this.step(rdt * ts);
    }
    this.updateHud();
    renderGame(this);
  }

  // ------------------------------------------------------------------
  tryActive() {
    const p = this.p;
    if (p.activeCd > 0 || this.stateName !== "playing") return;
    p.activeCd = p.activeMax = this.ship.activeCd * p.s.cdMul;
    p.castT = 0.5;
    audio.sfx("active");
    this.kit.castActive(this);
  }

  tryUlt() {
    const p = this.p;
    if (p.ult < 100 || this.stateName !== "playing" || p.ultBusy > 0) return;
    p.ult = 0;
    p.inv = Math.max(p.inv, 3);
    // 六台移植機體自帶特殊奧義演出：cutin 快播（0.9s）不續暗
    this.cutT = FAST_CUTIN_SHIPS.includes(this.ship.id) ? CUTIN_DUR_FAST : CUTIN_DUR;
    this.setState("ultcut");
    audio.sfx("ultcut");
  }

  triggerActive() {
    this.input.pressActive = true;
  }
  triggerUlt() {
    this.input.pressUlt = true;
  }

  // ------------------------------------------------------------------
  lvl(key: SkillKey): number {
    return Math.min(SKILL_MAX_RUN, this.save.ships[this.ship.id].lv[key] + this.runLv[key]);
  }

  dmgMult(): number {
    const p = this.p;
    const vig = p.s.vigor > 0 && p.hp / p.maxHp < 0.4 ? 1 + p.s.vigor : 1;
    return p.s.atk * p.dmgMul * (1 + (p.k.bonus || 0)) * vig;
  }

  ebDmg(): number {
    // 無限模式：敵彈傷害隨 chunk 持續成長（舊版 min(4, chunk×0.15) → chunk 27 就封頂，後期毫無威脅）
    const si = this.stage ? this.rankId : 3 + this.chunk * ENDLESS_DMG_PER_CHUNK;
    return (9 + si * 1.6) * (1 + this.diff * 0.16);
  }

  bn(n: number) {
    return Math.max(1, Math.round(n * this.dm.bul));
  }

  get enemies(): Enemy[] {
    return this.en.items;
  }

  /**
   * 奧義「真身收起」中：技能以 `p.k.hideShip` 宣告（目前只有緋燕・燕返）。
   * **單一真實來源** —— 真身的所有輸出都由此閘門停手：
   *   updatePlayer：kit.update（技能停擺）／kit.fire（不射擊）／updateOptions（僚機不射擊）／引擎尾焰粒子
   *   renderer：drawPlayer（不畫機體／光環／護盾／僚機／判定點）／kit.drawUnder（不畫機體錨定特效）
   *   equipProcs：不噴 proc 名稱文字
   * 綁 `ultBusy > 0` 當保險：奧義若被中斷（死亡／過關）也不會讓真身永久失能。
   * 註：鍵名刻意不用 `p.k.hide` —— shipPort011/剛星已佔用它表示「收納僚機砲艙」，語意不同。
   */
  get shipHidden(): boolean {
    return this.p.ultBusy > 0 && !!this.p.k.hideShip;
  }

  addFx(fx: Fx) {
    this.fxs.push(fx);
  }

  later(sec: number, fn: () => void) {
    this.timers.push({ t: sec, fn });
  }

  shake(a: number, t: number) {
    if (!this.save.settings.shake) return;
    if (a >= this.shakeAmt || this.shakeT <= 0) {
      this.shakeAmt = a;
      this.shakeT = t;
    }
  }
  flash(color: string, a: number) {
    this.flashColor = color;
    this.flashA = Math.max(this.flashA, a);
  }
  tint(color: string, a: number, dur: number) {
    this.tintColor = color;
    this.tintA = a;
    this.tintMax = a;
    this.tintT = dur;
  }
  slowmo(scale: number, dur: number) {
    this.slowScale = scale;
    this.slowT = dur;
  }
  say(text: string, color = "#fff") {
    this.callout = text;
    this.calloutColor = color;
    this.calloutT = 1.3;
  }
  toast(text: string, color = "#fff") {
    this.fx.text(W / 2, 320, text, color, 22, 1.4);
  }

  heal(n: number) {
    const p = this.p;
    const h = Math.min(p.maxHp - p.hp, n);
    if (h <= 0) return;
    p.hp += h;
    this.fx.text(p.x, p.y - 40, "+" + Math.round(h), "#7dffb2", 16);
    this.fx.ring(p.x, p.y, 8, 40, 0.35, "#7dffb2", 3);
  }
  addUlt(n: number) {
    const p = this.p;
    if (p.ultBusy > 0) return;
    p.ult = Math.min(100, p.ult + n * p.s.ultMul);
  }
  addPower(n: number) {
    const p = this.p;
    const old = p.power;
    p.power = Math.min(8, p.power + n);
    if (p.power > old) {
      this.fx.text(p.x, p.y - 50, "POWER UP", "#ffb347", 18, 0.9);
      audio.sfx("power");
    }
  }

  // ------------------------------------------------------------------
  // 生成
  spawnPB(x: number, y: number, ang: number, spd: number, style: number, dmg: number, o?: Partial<PBullet>): PBullet {
    const b = this.pb.spawn();
    const s = this.p.s;
    b.x = x; b.y = y; b.vx = Math.cos(ang) * spd; b.vy = Math.sin(ang) * spd;
    b.style = style; b.dmg = dmg * this.dmgMult(); b.r = 5; b.pierce = 0; b.life = 1.2; b.t = 0; b.kind = 0; b.homing = 0; b.explode = 0; b.chain = 0; b.burn = 0; b.slow = 0; b.ramp = 0;
    b.rot = rand(TAU); b.spin = 8; b.a = 0; b.b = 0; b.c = 0; b.scale = 1; b.src = 0; b.hits.length = 0; b.selfMove = 0;
    if (o) Object.assign(b, o);
    if (o && o.dmg !== undefined) b.dmg = o.dmg;
    if (b.src < 2) {
      b.pierce += s.pierce;
      b.homing += s.homing;
      b.chain += s.chainHit;
      b.burn += s.burn;
      b.slow += s.slowHit;
    }
    return b;
  }

  spawnEB(x: number, y: number, ang: number, spd: number, type = 0, color = 0, o?: Partial<EBullet>): EBullet | null {
    if (this.eb.items.length > 1100) return null;
    const b = this.eb.spawn();
    // 血統分流：008 的敵彈**半徑表**與母專案同名不同值（type 5 是 7 vs 16、type 2 是 3 vs 10），
    // 且**不可用關卡整體判斷**（每日挑戰的敵人池是 SP＋008 混合）→ 讀「當前 AI 血統」逐彈蓋章。
    const cz = this.czEB;
    b.x = x; b.y = y; b.type = type; b.color = color; b.r = cz ? (CZ_EB_R[type % 7] ?? 5) : (EB_R[type] ?? 5); b.spd = spd * this.dm.spd * this.bulMul; b.ang = ang; b.acc = 0; b.turn = 0; b.life = 10; b.t = 0; b.mode = 0; b.a = 0; b.b = 0; b.grazed = false; b.dmg = this.ebDmg(); b.slow = 1; b.cz = cz;
    if (o) Object.assign(b, o);
    return b;
  }

  addBeam(o: Partial<Beam> & { thunder?: boolean; followP?: boolean }): Beam {
    const b = this.beams.spawn();
    b.x = o.x ?? 0; b.y = o.y ?? 0; b.ang = o.ang ?? Math.PI / 2; b.rot = o.rot ?? 0; b.len = o.len ?? 1400; b.w = o.w ?? 30; b.warn = o.warn ?? 0.8; b.life = o.life ?? 1; b.t = 0;
    b.dmg = (o.dmg ?? 20) > 0 ? this.ebDmg() * ((o.dmg ?? 20) / 22) * 1.6 : 0;
    b.color = o.color ?? "#ff3b6b"; b.follow = o.follow ?? null;
    // followP：光束跟隨玩家（對應來源 cf5 的 `follow & 1`）。dst 的 follow 是「實體物件」語意，
    // 玩家（Player）沒有 alive/dead 欄位，塞進 follow 會被判定死亡 → 另立旗標。
    // ox/oy：來源是 spawn 時指定的固定偏移；dst 既有是「與 follow 實體的位置差」。有傳入值時以傳入值優先。
    (b as any).followP = !!o.followP;
    b.ox = o.ox ?? (b.follow ? b.x - b.follow.x : 0);
    b.oy = o.oy ?? (b.follow ? b.y - b.follow.y : 0);
    (b as any).thunder = !!o.thunder;
    (b as any).fired = false;
    return b;
  }

  spawnEnemy(id: string, x: number, y: number, o: SpawnOpt & { dir?: number } = {}): Enemy | null {
    // 宿主檔（enemyAI／bossAI／hazards）用「基礎詞彙」呼叫（scout/dart/kami）。
    // 新專案若把基礎敵人加了前綴，靠 data/enemies.ts 的 ENEMY_ALIAS 對回來（見該檔說明）。
    const def = ENEMIES[id] || (ENEMY_ALIAS[id] ? ENEMIES[ENEMY_ALIAS[id]] : undefined);
    if (!def) return null;
    if (this.en.items.length > 90) return null;
    const e = this.en.spawn();
    // 每日挑戰的「精英遊行」詞綴：一般敵機有額外機率直接以精英出場（中王/Boss 除外）。
    const elite = !!o.elite || (this.mods.has("elite") && !def.mid && Math.random() < 0.18);
    const hs = this.hpScale() * (o.hpMul || 1) * (elite ? 4 : 1);
    // 以下三種「特殊出場」一律用 def.ai（共用行為詞彙）判斷，不用 id——
    // 新專案的 id 會加前綴，用 id 判斷會靜默失效（護盾／半透明／潛行全都不見）。
    const isAegis = def.ai === "aegis";
    const isGhost = def.ai === "ghost";
    e.uid = this.uidC++;
    e.def = def; e.dead = false; e.x = x; e.y = y; e.vx = 0; e.vy = 0;
    e.maxHp = e.hp = Math.max(1, def.hp * hs);
    e.shield = e.maxShield = isAegis || elite ? e.maxHp * (isAegis ? 0.9 : 0.4) : 0;
    e.scale = elite ? 1.3 : 1;
    e.r = def.r * e.scale;
    e.t = 0; e.flash = 0; e.a = o.a || 0; e.b = o.b || 0; e.c = x; e.d = rand(TAU);
    e.tm[0] = e.tm[1] = e.tm[2] = e.tm[3] = e.tm[4] = e.tm[5] = e.tm[6] = e.tm[7] = 0;
    e.ph = 0; e.elite = elite; e.burn = 0; e.slow = 0; e.brand = 0; e.dir = o.dir ?? 0; e.alpha = isGhost ? 0.2 : 1; e.invuln = false;
    e.boss = false; e.bossId = 0; e.theme = this.stage ? this.stage.theme : this.endlessTheme; e.freeze = 0; e.fzN = 0; e.fzCd = 0; e.fzWin = false; e.allyT = 0; e.hpBar = 0; e.fireMul = 1 / ((1 + this.diff * 0.12) * (this.endless ? 1 + this.chunk * ENDLESS_FIRE_PER_CHUNK : 1)); e.mark = 0;
    if (isGhost) e.a = 1;
    if (def.ai === "dive") e.a = 0;
    return e;
  }

  /** 無限模式的「指數加壓量」（0＝還沒進入加壓期）。
   *  依難度自動內插：最易從 chunk 24 起 ×1.06/chunk，最難從 chunk 16 起 ×1.07/chunk。
   *  之後新增第 4 種難度會自動落在中間，不需改動。 */
  endlessRamp(): number {
    const t = DIFFS.length > 1 ? Math.min(1, Math.max(0, this.diff / (DIFFS.length - 1))) : 0;
    const from = ENDLESS_EXP_FROM_EASY + (ENDLESS_EXP_FROM_HARD - ENDLESS_EXP_FROM_EASY) * t;
    const base = ENDLESS_EXP_BASE_EASY + (ENDLESS_EXP_BASE_HARD - ENDLESS_EXP_BASE_EASY) * t;
    const c = this.chunk - from;
    return c > 0 ? Math.pow(base, c) - 1 : 0;
  }

  /** 難度縮放用的「關卡序」。每日挑戰的 `StageDef.id` 是 100（與一般關卡區隔），
   *  直接拿去當縮放係數會讓敵彈傷害／掉落／經驗暴走 → 一律夾在 12 以內。 */
  get rankId(): number {
    return this.stage ? Math.min(this.stage.id, 12) : 0;
  }

  hpScale(): number {
    if (this.stage) return this.stage.hpMul * this.dm.hp * this.hpExtra;
    // 無限模式：線性 13%/chunk（前期打爽）＋ 門檻後指數加壓（endlessRamp），最後再乘難度 hp
    return (1 + this.chunk * 0.13 + this.endlessRamp() + this.bossCycle * 0.5) * this.dm.hp * 1.2;
  }

  spawnMid() {
    const id = this.stage ? this.stage.mid : ["mid_gunship", "mid_walker", "mid_cruiser"][this.chunk % 3];
    const e = this.spawnEnemy(id, W / 2, -140, {});
    if (!e) return;
    e.c = W / 2;
    e.a = W / 2;
    e.b = 1;
    this.mid = e;
    this.blocked = "mid";
    audio.sfx("warning", 1);
  }

  spawnBoss() {
    // 關卡：吃 StageDef.boss（含 port/008 的 6~10）；無限模式：只輪母專案 6 隻。
    const idx = this.stage ? this.stage.boss : this.bossIdx % SP_BOSS_COUNT;
    const bd = BOSSES[idx];
    const def: EnemyDef = { id: "boss" + idx, name: bd.name, hp: bd.hp, r: bd.r, spd: 0, score: 50000, exp: 400, ai: "boss", size: 220 };
    const e = this.en.spawn();
    e.uid = this.uidC++;
    e.def = def; e.dead = false; e.x = W / 2; e.y = -160; e.vx = e.vy = 0;
    const hs = this.stage ? Math.pow(this.stage.hpMul, 0.85) * this.dm.hp * 0.78 : (1 + this.bossCycle * 0.7 + this.endlessRamp()) * this.dm.hp * 1.1;
    e.maxHp = e.hp = bd.hp * hs;
    e.shield = e.maxShield = 0; e.scale = 1; e.r = bd.r * 1.25; e.t = 0; e.flash = 0; e.a = W / 2; e.b = 2; e.c = 0; e.d = 0;
    e.tm.fill(0);
    // port/008 的 Boss（id ≥ 6）用來源的開火初值，錯開各武器的第一發（母專案 Boss 維持 0）。
    if (idx >= 6) { e.tm[0] = 1; e.tm[1] = 1.5; e.tm[2] = 2; e.tm[3] = 2.5; e.tm[4] = 3; }
    e.ph = 0; e.elite = false; e.burn = 0; e.slow = 0; e.brand = 0; e.dir = 0; e.alpha = 1; e.invuln = true; e.boss = true; e.bossId = idx;
    e.theme = this.stage ? this.stage.theme : this.endlessTheme; e.freeze = 0; e.fzN = 0; e.fzCd = 0; e.fzWin = false; e.allyT = 0; e.hpBar = 0; e.fireMul = this.endless ? 1 / (1 + this.chunk * ENDLESS_FIRE_PER_CHUNK * 0.5) : 1; e.mark = 0;
    this.boss = e;
    this.blocked = "boss";
    this.bossIdx++;
    audio.sfx("warning", 1);
    // Boss 曲（2026-10-19 起全數改用 port/013 絕響天穹的曲目）：
    //   每日挑戰   → M013.dailyBoss（013 管風琴）
    //   無限模式   → M013.endlessBoss（013 星環守衛；每隻 Boss 登場都播這首）
    //   一般關卡   → SP_BOSS_MUSIC[idx]（SP 母專案 6 隻各自的專屬曲）
    //               → 落空再用 CZ_BOSS_MUSIC（port/008 的 5 隻）
    //               → 再落空才是 3（舊的母專案共用曲）。
    const bossTheme = this.daily
      ? M013.dailyBoss
      : this.endless
        ? M013.endlessBoss
        : (SP_BOSS_MUSIC[idx] ?? CZ_BOSS_MUSIC[idx] ?? 3);
    audio.setTheme(bossTheme);
    this.cb.onBossIntro?.(bd, this.stage ? this.stage.id : 0);
  }

  // ------------------------------------------------------------------
  // 傷害與擊殺
  damageEnemy(e: Enemy, dmg: number, o: { noText?: boolean; noHitFx?: boolean; crit?: boolean; x?: number; y?: number } = {}): boolean {
    if (e.dead || dmg <= 0) return false;
    // 友軍化（glitch 駭入）：任何來源都打不到 —— 見 entities.ts `Enemy.allyT`。
    // ⚠ 友軍自己引爆前必須先把 allyT 歸零，否則 `e.hp + 1` 這招會失效。
    if (e.allyT > 0) return false;
    if (e.invuln) {
      if (!o.noHitFx) this.fx.hit(o.x ?? e.x, o.y ?? e.y, "#9aa6b6");
      return false;
    }
    if (e.mark > 0) dmg *= 1.25;
    let real = dmg;
    if (e.shield > 0) {
      e.shield -= dmg;
      if (e.shield < 0) {
        e.hp += e.shield;
        e.shield = 0;
        this.fx.ring(e.x, e.y, 10, e.r * 2, 0.3, "#9be6ff", 3);
      }
    } else e.hp -= dmg;
    if (!o.noHitFx) e.flash = 1;
    e.hpBar = 2;
    if (!o.noText && this.fx.showText) this.fx.text(o.x ?? e.x + rand(-8, 8), (o.y ?? e.y) - e.r * 0.6, String(Math.round(real)), o.crit ? "#ffd36b" : "#ffffff", o.crit ? 19 : 13, 0.6);
    if (e.hp <= 0) {
      this.killEnemy(e);
      return true;
    }
    return false;
  }

  aoe(x: number, y: number, r: number, dmg: number, o: { pal?: string; burn?: boolean; noFx?: boolean; noText?: boolean; small?: boolean; skip?: number; slow?: number } = {}): number {
    let n = 0;
    const list = this.en.items;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.dead || e.uid === o.skip || e.alpha < 0) continue;
      const d = Math.hypot(e.x - x, e.y - y) - e.r;
      if (d < r) {
        n++;
        if (o.burn) e.burn = Math.max(e.burn, 3);
        if (o.slow) e.slow = Math.max(e.slow, o.slow);
        this.damageEnemy(e, dmg, { noText: o.noText ?? true, noHitFx: o.small });
      }
    }
    if (!o.noFx && r < 2000) {
      const pal = PAL[o.pal || "fire"] || PAL.fire;
      if (o.small) this.fx.explosion(x, y, Math.max(8, r * 0.28), pal);
      else this.fx.explosion(x, y, Math.max(12, r * 0.4), pal);
      if (r > 50) audio.sfx("boom_s", 0.08);
    }
    return n;
  }

  chain(x: number, y: number, n: number, dmg: number, skip: number, range = 170) {
    let cx = x;
    let cy = y;
    const used = new Set<number>([skip]);
    for (let i = 0; i < n; i++) {
      let best: Enemy | null = null;
      let bd = range * range;
      for (const e of this.en.items) {
        if (e.dead || used.has(e.uid) || e.alpha < 0 || e.y < -10) continue;
        const d = dist2(e.x, e.y, cx, cy);
        if (d < bd) {
          bd = d;
          best = e;
        }
      }
      if (!best) break;
      used.add(best.uid);
      boltFx(this, cx, cy, best.x, best.y, "#c58bff", 0.14, 2.2);
      this.damageEnemy(best, dmg, { noText: true });
      this.fx.hit(best.x, best.y, "#ffe45c");
      cx = best.x;
      cy = best.y;
    }
  }

  nearest(x: number, y: number, maxD = 9999, filter?: (e: Enemy) => boolean): Enemy | null {
    let best: Enemy | null = null;
    let bd = maxD * maxD;
    const list = this.en.items;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.dead || e.alpha < 0 || e.y < -20 || (e.def.ai === "ghost" && e.invuln)) continue;
      if (filter && !filter(e)) continue;
      const d = dist2(e.x, e.y, x, y);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  }

  clearBullets(x: number, y: number, r: number, mode: "none" | "score" | "coin" = "none", colX?: number, colW?: number, bandY?: number, bandH?: number): number {
    let n = 0;
    const list = this.eb.items;
    const r2 = r * r;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (!b.alive) continue;
      let ok: boolean;
      if (colX !== undefined) ok = Math.abs(b.x - colX) < (colW ?? 40);
      else if (bandY !== undefined) ok = Math.abs(b.y - bandY) < (bandH ?? 60);
      else ok = r >= 9000 || dist2(b.x, b.y, x, y) < r2;
      if (!ok) continue;
      b.alive = false;
      n++;
      if (mode !== "none") {
        this.score += 12;
        if (n < 12) this.fx.glowP(b.x, b.y, 0, -40, 0.3, 8, "#ffe45c", 2, 0, 0.8);
        if (mode === "coin" && Math.random() < 0.1 && this.pk.items.length < 200) this.dropPickup(b.x, b.y, PK.COIN, 2);
      }
    }
    if (mode !== "none" && n) this.addUlt(Math.min(6, n * 0.08));
    return n;
  }

  killEnemy(e: Enemy) {
    if (e.dead) return;
    e.dead = true;
    const def = e.def;
    if (e.alpha < 0) return;
    const p = this.p;
    if (e.boss) {
      this.bossDefeated(e);
      return;
    }
    this.kills++;
    if (e.tl) this.killsTL++;
    this.combo++;
    this.comboT = 2.4 + p.s.comboWin;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    const mult = 1 + Math.min(this.combo, 200) / 40;
    const sc = Math.round(def.score * mult * (e.elite ? 2 : 1));
    this.score += sc;
    // if ([10, 25, 50, 100, 150, 200, 300, 500].includes(this.combo)) {
    //  this.say(`${this.combo} COMBO!`, this.combo >= 100 ? "#ffd36b" : this.combo >= 50 ? "#ff5a6e" : "#7cf3ff");
    // }
    const size = Math.min(70, 8 + e.r * 1.1);
    const pal = e.theme === 2 ? PAL.ice : e.theme === 3 ? PAL.fire : e.theme === 0 ? PAL.elec : e.theme === 5 ? PAL.gold : PAL.fire;
    this.fx.explosion(e.x, e.y, size, pal);
    audio.sfx(e.r > 30 ? "boom_m" : "boom_s", 0.04);
    if (e.r > 24) {
      this.shake(e.r > 40 ? 6 : 3, 0.15);
      this.hitstopT = Math.max(this.hitstopT, e.r > 40 ? 0.06 : 0.03);
    }
    // 掉落
    const s = p.s;
    const orbs = def.mid ? 10 : e.r > 28 ? 4 : e.r > 18 ? 2 : 1;
    const expEach = (def.exp * this.hpExpMul()) / orbs;
    for (let i = 0; i < orbs; i++) this.dropPickup(e.x + rand(-12, 12), e.y + rand(-12, 12), PK.EXP, expEach);
    const luck = 1 + s.luck * 0.25;
    if (Math.random() < 0.35 * s.dropMul) this.dropPickup(e.x, e.y, PK.COIN, Math.round((def.mid ? 30 : e.elite ? 12 : 3) * (1 + (this.stage ? this.rankId * 0.2 : 1))));
    if (Math.random() < (e.elite ? 0.7 : 0.045) * luck * s.dropMul) this.dropPickup(e.x, e.y, PK.POWER, 1);
    if (Math.random() < (p.hp / p.maxHp < 0.5 ? 0.03 : 0.012) * luck) this.dropPickup(e.x, e.y, PK.HEAL, 1);
    if (Math.random() < 0.03 * luck) this.dropPickup(e.x, e.y, PK.ULT, 1);
    if (Math.random() < 0.008 * luck) this.dropPickup(e.x, e.y, PK.SHIELD, 1);
    if (Math.random() < 0.006) this.dropPickup(e.x, e.y, PK.MAGNET, 1);
    if (e.elite && Math.random() < 0.06) this.dropPickup(e.x, e.y, PK.CORE, 1);
    if (e.elite && Math.random() < 0.55 * s.dropMul) this.dropItem(e.x, e.y, 0);
    else if (!def.mid && Math.random() < 0.006 * luck * s.dropMul) this.dropItem(e.x, e.y, 0);
    if (s.killHeal > 0) {
      p.hp = Math.min(p.maxHp, p.hp + s.killHeal);
    }
    this.addUlt(0.7 + e.r * 0.03);
    if (e.burn > 0 && e.def.ai !== "boss") this.fx.burst(e.x, e.y, 6, "#ffb347", 60, 180, 0.5, 2);
    this.kit.onKill?.(this, e);
    if (e === this.mid) this.midDefeated(e);
  }

  hpExpMul() {
    return (this.stage ? 1 + this.rankId * 0.12 : 1 + this.chunk * 0.05) * 1.35;
  }

  midDefeated(e: Enemy) {
    this.mid = null;
    this.blocked = null;
    this.clearBullets(0, 0, 9999, "coin");
    this.fx.ring(e.x, e.y, 20, 400, 0.6, "#ffffff", 8);
    this.flash("#ffffff", 0.5);
    this.shake(10, 0.4);
    audio.sfx("boom_l");
    this.slowmo(0.4, 0.8);
    for (let i = 0; i < 3; i++) this.later(i * 0.14, () => this.fx.explosion(e.x + rand(-40, 40), e.y + rand(-30, 30), 40, PAL.fire));
    const n = this.stage && this.rankId >= 3 ? 2 : 1;
    for (let i = 0; i < n; i++) this.dropItem(e.x + (i - 0.5) * 30, e.y, 0.3);
    this.dropPickup(e.x, e.y, PK.CORE, 1);
    this.dropPickup(e.x, e.y, PK.POWER, 1);
    for (let i = 0; i < 8; i++) this.dropPickup(e.x + rand(-40, 40), e.y + rand(-30, 30), PK.COIN, 15);
    this.say("MID-BOSS DOWN!", "#ffd36b");
  }

  bossPhaseChange(e: Enemy) {
    audio.sfx("boom_l");
    this.clearBullets(0, 0, 9999, "coin");
    this.fx.ring(e.x, e.y, 20, 600, 0.7, "#ffffff", 10);
    this.fx.explosion(e.x, e.y, 60, PAL.white);
    this.flash("#ffffff", 0.6);
    this.shake(12, 0.5);
    this.say(e.ph === bossPhaseCount(e.bossId) - 1 ? "FINAL PHASE!" : "PHASE " + (e.ph + 1), "#ff5a6e");
    for (let i = 0; i < 6; i++) this.dropPickup(e.x + rand(-60, 60), e.y + rand(-40, 40), PK.COIN, 20);
    this.dropPickup(e.x, e.y, PK.POWER, 1);
  }

  bossDefeated(e: Enemy) {
    this.boss = null;
    this.bossDieT = 3.4;
    this.score += 30000 * (1 + this.diff * 0.5);
    this.kills++;
    this.clearBullets(0, 0, 9999, "coin");
    this.beams.clear();
    this.hazards.length = 0;
    this.wind = 0;
    audio.sfx("bossdie");
    this.slowmo(0.3, 1.8);
    this.flash("#ffffff", 0.9);
    this.shake(18, 1.2);
    // 連鎖爆炸
    for (let i = 0; i < 14; i++) {
      this.later(i * 0.12, () => {
        this.fx.explosion(e.x + rand(-80, 80), e.y + rand(-60, 60), rand(30, 70), i % 2 ? PAL.fire : PAL.gold);
        audio.sfx("boom_m", 0.03);
        this.shake(8, 0.15);
      });
    }
    this.later(1.5, () => {
      this.fx.explosion(e.x, e.y, 120, PAL.white);
      this.fx.ring(e.x, e.y, 30, 900, 1, "#ffffff", 14);
      this.flash("#ffffff", 1);
      audio.sfx("boom_l");
    });
    // 全場敵機殲滅
    for (const o of this.en.items) if (o !== e && !o.dead) this.damageEnemy(o, 1e9, { noText: true });
    // 大量獎勵
    for (let i = 0; i < 30; i++) this.dropPickup(e.x + rand(-100, 100), e.y + rand(-70, 70), PK.COIN, 25);
    for (let i = 0; i < 16; i++) this.dropPickup(e.x + rand(-90, 90), e.y + rand(-60, 60), PK.EXP, 30);
    const nItems = 2 + (this.stage && this.rankId >= 4 ? 1 : 0) + (this.diff >= 1 ? 1 : 0);
    for (let i = 0; i < nItems; i++) this.later(0.3 + i * 0.25, () => this.dropItem(e.x + (i - 1) * 40, e.y, 1));
    for (let i = 0; i < 2 + this.diff; i++) this.dropPickup(e.x + rand(-40, 40), e.y, PK.CORE, 1);
    if (this.endless) {
      this.bossCycle++;
      this.later(3.5, () => {
        this.blocked = null;
        audio.setTheme(M013.endless);
      });
    }
  }

  // ------------------------------------------------------------------
  // 戰利品回收階段（boss 擊破後，僅 stage 模式）
  startLoot() {
    this.looting = true;
    // boss 已倒 → 這趟等同結束，回收階段撿到的 EXP 直接吃掉、不再累積待選等級，
    // 避免結算前還彈一次升級選卡（大爺 2026-10-19 回饋；無限模式不走此函式，不受影響）。
    this.pendingLevels = 0;
    this.lootT = this.lootMax;
    this.collectAll = false;
    this.lootFinishT = 0;
    this.cb.onBanner?.("BOSS DOWN", "回收戰利品！", "#ffd36b");
    this.say("請回收裝備與星核", "#ffd36b");
  }

  /** 手動快速結算：全數強收後立即結束回收 */
  evacuate() {
    if (this.looting) {
      this.collectAll = true;
      this.lootT = Math.min(this.lootT, 0.01);
    }
  }

  endLoot() {
    if (!this.looting || this.finished) return;
    this.looting = false;
    this.lootT = 0;
    this.collectAll = false;
    this.setState("clear");
    this.finish(true);
  }

  dropPickup(x: number, y: number, kind: number, v: number, item?: EquipItem) {
    if (this.pk.items.length > 260 && kind === PK.EXP) {
      this.addExp(v);
      return;
    }
    const k = this.pk.spawn();
    k.x = x; k.y = y; k.kind = kind; k.v = v; k.t = 0; k.mag = false; k.item = item;
    const a = rand(TAU);
    const s = rand(40, 150);
    k.vx = Math.cos(a) * s;
    k.vy = Math.sin(a) * s - 40;
  }

  dropItem(x: number, y: number, boss: number) {
    // 每件掉落各擲一次 016 血統判定（見 `data/krDrops.ts`）。
    // 非目標關卡 `krDropChance` 回 0 → 連 `Math.random()` 都不消耗，掉落序列與改動前完全一致。
    const kr = krDropChance(this);
    const fam: ItemFamily = kr > 0 && Math.random() < kr ? "kr" : "sp";
    const item = genItem(undefined, undefined, this.p.s.luck, boss + (this.stage ? this.rankId * 0.05 : 0.1), fam);
    this.dropPickup(x, y, PK.GEAR, 1, item);
  }

  collect(k: Pickup) {
    const p = this.p;
    switch (k.kind) {
      case PK.EXP:
        this.addExp(k.v);
        audio.sfx("pickup", 0.05);
        break;
      case PK.COIN: {
        const v = Math.max(1, Math.round(k.v * p.s.coinMul));
        this.coins += v;
        this.score += v * 5;
        audio.sfx("coin", 0.05);
        break;
      }
      case PK.POWER:
        this.addPower(1);
        break;
      case PK.HEAL:
        this.heal(p.maxHp * 0.2);
        audio.sfx("pickup");
        break;
      case PK.ULT:
        this.addUlt(14);
        this.fx.text(p.x, p.y - 40, "ULT +", "#c58bff", 15);
        audio.sfx("pickup");
        break;
      case PK.SHIELD:
        p.shield = Math.min(3, p.shield + 1);
        p.maxShield = Math.max(p.maxShield, p.shield);
        this.fx.text(p.x, p.y - 40, "SHIELD", "#9be6ff", 15);
        audio.sfx("power");
        break;
      case PK.MAGNET:
        for (const o of this.pk.items) o.mag = true;
        this.fx.text(p.x, p.y - 40, "MAGNET", "#ff8ad4", 15);
        audio.sfx("power");
        break;
      case PK.CORE:
        this.cores++;
        this.fx.text(p.x, p.y - 40, "星核 +1", "#ff8ad4", 16);
        audio.sfx("gear");
        break;
      case PK.GEAR:
        if (k.item) {
          this.items.push(k.item);
          const ri = RARITY_INFO[k.item.rarity];
          this.fx.text(p.x, p.y - 44, `${k.item.rarity}｜${k.item.name}`, k.item.rarity === "UR" ? "#ff3b6b" : k.item.rarity === "SSR" ? "#ffc23d" : k.item.rarity === "SR" ? "#47c2ff" : "#dfe6ee", 15, 1.2);
          audio.sfx("gear");
          if (ri.index >= 3) {
            this.flash(k.item.rarity === "UR" ? "#ff3b6b" : "#ffc23d", 0.35);
            this.say(k.item.rarity === "UR" ? "UR 神話裝備!" : "SSR 傳說裝備!", k.item.rarity === "UR" ? "#ff3b6b" : "#ffc23d");
          }
          this.cb.onGear?.(k.item);
        }
        break;
    }
  }

  // ------------------------------------------------------------------
  // 經驗與升級
  addExp(v: number) {
    this.exp += v * this.p.s.expMul;
    while (this.exp >= this.expNeed) {
      this.exp -= this.expNeed;
      this.level++;
      this.expNeed = Math.round(32 + this.level * 15 + Math.pow(this.level, 1.35) * 3);
      this.pendingLevels++;
    }
  }

  checkLevelUp() {
    // bossDieT／looting 期間不彈選卡：非無限模式 boss 倒下後已進入戰利品回收，
    // 「再升一等」對這趟已經沒有意義（大爺 2026-10-19 回饋：選了也沒用）。
    // 無限模式不走 startLoot，保留原本的選卡節奏。
    if (this.pendingLevels <= 0 || this.stateName !== "playing") return;
    if (this.bossDieT > 0) return;
    if (this.looting) return;
    this.pendingLevels--;
    const p = this.p;
    audio.sfx("levelup");
    this.fx.ring(p.x, p.y, 10, 120, 0.5, "#7cf3ff", 5);
    this.fx.text(p.x, p.y - 60, "LEVEL UP!", "#7cf3ff", 20, 1);
    if (p.s.overload > 0) {
      this.clearBullets(p.x, p.y, 240 + p.s.overload * 90, "score");
      this.aoe(p.x, p.y, 240 + p.s.overload * 90, 80 + this.level * 8, { pal: "cyan", noText: true });
    }
    const choices = this.rollCards();
    if (!choices.length) return;
    if (this.save.settings.autoCard) {
      const pickC = choices.slice().sort((a, b) => (b.skill ? 3 : 0) + b.rarity - ((a.skill ? 3 : 0) + a.rarity))[0];
      this.applyCard(pickC.id);
      this.fx.text(W / 2, 380, "自動強化：" + pickC.name, "#dfe6ee", 17, 1.3);
      return;
    }
    this.setState("card");
    this.cb.onCards?.(choices);
  }

  rollCards(): CardChoice[] {
    const pool: { c: CardChoice; w: number }[] = [];
    const ship = this.ship;
    // 對特定機體無效／會破壞手感的卡片：直接不出現（2026-10-18 大爺回報）。
    //   homing：① 主武是自走彈（kind>=20 selfMove／棋步／光束）→ 引擎的 homing 轉向
    //              只在 `!b.selfMove` 時執行，卡片完全無效果；
    //           ② 主武本身已自帶 homing → 再疊只會更黏，不該出現。
    //   multi ：主武不是可數彈道（日鏡是鏡面反射光束）→ 額外彈道無意義。
    const skip = CARD_SKIP_SHIPS[ship.id];
    for (const key of SKILL_KEYS) {
      const cur = this.lvl(key);
      if (cur >= SKILL_MAX_RUN) continue;
      const nl = cur + 1;
      const evoIdx = EVO_LEVELS.indexOf(nl);
      const sk = ship.skills[key];
      pool.push({
        w: evoIdx >= 0 ? 16 : 9,
        c: { id: "sk_" + key, name: `${sk.name}`, desc: evoIdx >= 0 ? `進化：${sk.evo[evoIdx]}` : `${SKILL_LABEL[key]}強化：效果與傷害提升`, rarity: evoIdx >= 0 ? 2 : 1, icon: "sk_" + key, lvText: `${SKILL_LABEL[key]} Lv${cur} → Lv${nl}`, evo: evoIdx >= 0 ? "進化！" : undefined, skill: key },
      });
    }
    for (const c of CARDS) {
      const n = this.cards[c.id] || 0;
      if (n >= c.max) continue;
      if (c.id === "power" && this.p.power >= 8) continue; // 火力階已滿，power 卡無效不該出
      if (c.id === "repair" && this.p.hp > this.p.maxHp * 0.85) continue;
      if (c.id === "option" && this.p.s.options >= 3) continue;
      if (skip?.includes(c.id)) continue;
      pool.push({ w: c.weight * (c.rarity === 2 ? 1 + this.p.s.luck * 0.3 : 1), c: { id: c.id, name: c.name, desc: c.desc(n + 1), rarity: c.rarity, icon: c.icon, lvText: n > 0 ? `Lv${n} → Lv${n + 1}` : "NEW" } });
    }
    const count = 3 + (this.p.s.luck >= 2 && Math.random() < 0.4 ? 1 : 0);
    const out: CardChoice[] = [];
    for (let i = 0; i < count && pool.length; i++) {
      const tot = pool.reduce((s, x) => s + x.w, 0);
      let r = Math.random() * tot;
      let idx = 0;
      for (let k = 0; k < pool.length; k++) {
        r -= pool[k].w;
        if (r <= 0) {
          idx = k;
          break;
        }
      }
      out.push(pool[idx].c);
      pool.splice(idx, 1);
    }
    return out;
  }

  applyCard(id: string) {
    if (id.startsWith("sk_")) {
      const key = id.slice(3) as SkillKey;
      this.runLv[key]++;
      const nl = this.lvl(key);
      const evoIdx = EVO_LEVELS.indexOf(nl);
      const sk = this.ship.skills[key];
      if (evoIdx >= 0) {
        audio.sfx("evolve");
        this.flash("#ffffff", 0.5);
        // this.say(`${sk.name} 進化！`, "#ffd36b");
        this.fx.ring(this.p.x, this.p.y, 10, 200, 0.7, "#ffd36b", 8);
        this.cb.onEvolve?.({ name: sk.name, tier: evoIdx + 1, skill: SKILL_LABEL[key] });
        if (key === "weapon" || key === "ult") this.p.tier = Math.min(3, this.p.tier + (evoIdx >= 1 ? 1 : 0));
      }
    } else {
      const c = CARDS.find((x) => x.id === id);
      if (c) {
        this.cards[id] = (this.cards[id] || 0) + 1;
        c.apply(this, this.cards[id]);
      }
    }
    if (this.stateName === "card") this.setState("playing");
  }

  pickCard(id: string) {
    this.applyCard(id);
    audio.sfx("ui_ok");
  }

  // ------------------------------------------------------------------
  // 玩家受傷
  hurt(dmg: number) {
    const p = this.p;
    if (p.inv > 0 || this.stateName !== "playing") return;
    if (p.shield > 0) {
      p.shield--;
      p.inv = 1.2;
      this.fx.ring(p.x, p.y, 10, 70, 0.4, "#9be6ff", 5);
      this.fx.burst(p.x, p.y, 16, "#9be6ff", 100, 300, 0.5, 2.5);
      audio.sfx("hurt");
      this.clearBullets(p.x, p.y, 110, "none");
      return;
    }
    dmg *= p.drMul;
    p.hp -= dmg;
    this.hits++;
    p.inv = 1.15;
    p.hitFlash = 1;
    this.combo = 0;
    this.comboT = 0;
    this.shake(8, 0.3);
    this.flash("#ff1a3a", 0.35);
    this.hitstopT = 0.09;
    audio.sfx("hurt");
    this.fx.explosion(p.x, p.y, 16, PAL.red);
    this.clearBullets(p.x, p.y, 90, "none");
    this.kit.onPlayerHit?.(this);
    if (p.hp <= 0) {
      // 機體專屬免死（來源 port/011 的 onLethal）：回傳 true 代表這次致命傷被吃掉，保留 1 HP。
      // 放在不滅意志之前 —— 機體自身的免死優先於通用的復活次數。
      if (this.kit.onLethal?.(this)) {
        p.hp = 1;
        p.inv = Math.max(p.inv, 1.5);
        return;
      }
      if (p.s.revive > 0) {
        p.s.revive--;
        p.hp = p.maxHp * 0.5;
        p.inv = 3;
        this.clearBullets(0, 0, 9999, "none");
        this.aoe(p.x, p.y, 9999, 200, { pal: "gold" });
        this.fx.ring(p.x, p.y, 20, 800, 0.8, "#ffd36b", 12);
        this.say("不滅意志!", "#ffd36b");
        audio.sfx("evolve");
        this.flash("#ffd36b", 0.8);
        return;
      }
      p.hp = 0;
      this.playerDied();
    }
  }

  playerDied() {
    const p = this.p;
    this.fx.explosion(p.x, p.y, 60, PAL.fire);
    this.fx.ring(p.x, p.y, 20, 500, 0.8, "#ffffff", 10);
    this.slowmo(0.3, 1.4);
    this.shake(14, 0.6);
    audio.sfx("boom_l");
    this.endT = 1.8;
    this.setState("over");
  }

  // ------------------------------------------------------------------
  // 主更新
  step(dt: number) {
    const p = this.p;
    this.t += dt;
    this.time += dt;
    // 計時器
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const tm = this.timers[i];
      tm.t -= dt;
      if (tm.t <= 0) {
        this.timers.splice(i, 1);
        tm.fn();
      }
    }
    // 震動與濾鏡
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeAmt * Math.max(0, this.shakeT * 3);
      this.shakeX = rand(-a, a);
      this.shakeY = rand(-a, a);
    } else {
      this.shakeX = this.shakeY = 0;
    }
    this.flashA = Math.max(0, this.flashA - dt * 2.2);
    if (this.tintT > 0) {
      this.tintT -= dt;
      this.tintA = this.tintMax * clamp(this.tintT / 0.6, 0, 1);
    } else this.tintA = 0;
    if (this.calloutT > 0) this.calloutT -= dt;
    if (this.bulletSlowT > 0) {
      this.bulletSlowT -= dt;
      if (this.bulletSlowT <= 0) this.bulletSlow = 1;
    }

    const alive = this.stateName === "playing";
    // 關卡時間軸（boss 擊破演出與戰利品回收期間暫停產敵）
    if (alive && this.bossDieT <= 0 && !this.looting) this.runTimeline(dt);
    this.updateBackground(dt);
    if (alive) this.updatePlayer(dt);
    else if (this.stateName === "over") {
      this.endT -= dt / Math.max(0.3, this.timeScale);
      if (this.endT <= 0 && !this.finished) this.finish(false);
    }
    // Boss 擊破演出後：stage 進入戰利品回收，endless 維持繼續戰鬥
    if (this.bossDieT > 0) {
      this.bossDieT -= dt / Math.max(0.3, this.timeScale);
      if (this.bossDieT <= 0 && !this.endless && !this.finished && !this.looting) {
        this.startLoot();
      }
    }
    // 戰利品回收倒數（boss 擊破後 12s，可手動 evacuate 全收快速結算）
    if (this.looting) {
      this.lootT -= dt / Math.max(0.3, this.timeScale);
      if (this.lootT <= 0) {
        this.collectAll = true;
        this.lootFinishT += dt;
        const remain = this.pk.items.some((k) => k.alive && (k.kind === PK.GEAR || k.kind === PK.CORE));
        if (!remain || this.lootFinishT > 1.4) this.endLoot();
      }
    }
    updateHazards(this, dt);
    // 敵機
    const en = this.en.items;
    for (let i = en.length - 1; i >= 0; i--) {
      const e = en[i];
      if (e.dead) {
        this.en.kill(i);
        continue;
      }
      if (e.def.ai === "boss") updateBoss(this, e, dt);
      else updateEnemy(this, e, dt);
      if (e.burn > 0) {
        e.burn -= dt;
        this.damageEnemy(e, (10 + this.level * 1.2) * this.p.s.atk * dt * 4, { noText: true, noHitFx: true });
        if (Math.random() < 0.2) this.fx.glowP(e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r), 0, -40, 0.4, 6, "#ff8a2a", 2, 0, 0.8);
      }
      if (e.mark > 0) e.mark -= dt;
      if (e.hpBar > 0) e.hpBar -= dt;
    }
    this.updatePBullets(dt);
    this.updateEBullets(dt);
    this.updateBeams(dt);
    this.updatePickups(dt);
    // 特效
    for (let i = this.fxs.length - 1; i >= 0; i--) {
      const f = this.fxs[i];
      try {
        f.update(dt);
      } catch (err) {
        console.error(err);
        f.alive = false;
      }
      if (!f.alive) this.fxs.splice(i, 1);
    }
    this.fx.update(dt);
    if (this.stateName === "playing") {
      if (this.comboT > 0) {
        this.comboT -= dt;
        if (this.comboT <= 0) this.combo = 0;
      }
      this.checkLevelUp();
    }
  }

  runTimeline(dt: number) {
    if (this.blocked === "mid") {
      if (!this.mid || this.mid.dead) this.blocked = null;
    }
    if (this.blocked) return;
    this.stageT += dt;
    if (this.endless && this.tlIdx >= this.timeline.length) {
      this.chunk++;
      this.chunkStart = this.stageT;
      this.endlessTheme = Math.floor(this.chunk / 3) % 6;
      this.timeline = genEndlessChunk(this.chunk, this.stageT + 0.5, this.diff);
      this.tlIdx = 0;
    }
    while (this.tlIdx < this.timeline.length && this.timeline[this.tlIdx].t <= this.stageT) {
      const ev = this.timeline[this.tlIdx++];
      switch (ev.k) {
        case "spawn": {
          const e = this.spawnEnemy(ev.e, ev.x * W, ev.y, ev.o || {});
          if (e) { e.tl = true; this.spawnedTL++; }
          break;
        }
        case "event":
          startHazard(this, ev.name, ev.dur);
          break;
        case "banner":
          this.cb.onBanner?.(ev.text, ev.sub || "", ev.text === "WARNING" ? "#ff3b52" : "#ffffff");
          if (ev.text === "WARNING") audio.sfx("warning", 1);
          break;
        case "flyby":
          this.bg.flyby(ev.kind);
          break;
        case "mid":
          this.spawnMid();
          break;
        case "boss":
          this.spawnBoss();
          break;
        case "waitMid":
          break;
      }
      if (this.blocked) break;
    }
  }

  updateBackground(dt: number) {
    let a: string;
    let b: string;
    let mix: number;
    let tint: string;
    let cloud: number;
    let col: string;
    let kind = this.stage ? this.stage.kind : ENDLESS_KINDS[this.endlessTheme];
    if (this.stage) {
      const s = this.stage;
      const pr = clamp(this.stageT / s.len, 0, 1);
      a = s.bgs[0];
      b = s.bgs[1];
      mix = smooth(s.mix[0], s.mix[1], pr);
      if (mix > 0.5) kind = s.kindB;
      tint = gradeAt(s.grade, pr);
      const tr = clamp((pr - s.mix[0]) / (s.mix[1] - s.mix[0]), 0, 1);
      cloud = 0.14 + Math.sin(tr * Math.PI) * 0.95;
      col = s.cloudCol;
      this.bgSpeed = 1 + Math.sin(tr * Math.PI) * 0.7;
    } else {
      const th = this.endlessTheme;
      a = ENDLESS_BGS[th];
      b = ENDLESS_BGS[(th + 1) % 6];
      const cp = (this.chunk % 3) + clamp((this.stageT - this.chunkStart) / 18, 0, 1);
      mix = smooth(2.1, 2.95, cp);
      if (mix > 0.5) kind = ENDLESS_KINDS[(th + 1) % 6];
      const g3: [string, string, string] = ["rgba(255,80,160,0.14)", "rgba(80,140,255,0.14)", "rgba(255,190,80,0.14)"];
      tint = gradeAt(g3, (this.chunk % 6) / 6);
      cloud = 0.14 + Math.sin(clamp((cp - 1.9) / 1.1, 0, 1) * Math.PI) * 0.9;
      col = "#e8eeff";
      this.bgSpeed = 1 + Math.sin(clamp((cp - 1.9) / 1.1, 0, 1) * Math.PI) * 0.6;
    }
    this.bg.set(a, b, mix, kind, tint, cloud, col);
    this.bg.update(dt, this.bgSpeed * (this.stateName === "over" ? 0.3 : 1));
  }

  updatePlayer(dt: number) {
    const p = this.p;
    const inp = this.input;
    inp.mouseFollow = this.save.settings.mouseFollow;
    const prevX = p.x;
    const prevY = p.y;
    const baseSpd = this.ship.base.spd * 1.15 * p.s.spd * p.speedMul * (inp.focus ? 0.45 : 1);

    // ── 強風（環境事件 gale／cz_gale）────────────────────────────────────────
    // 舊寫法只有下面那行 `p.x += this.wind * dt`：鍵盤／相對拖曳是「速度疊加」→ 吃得到，
    // 但**滑鼠絕對跟隨**每幀都把位置 lerp 回游標（增益 34~42/s）→ 130px/s 的風只剩
    // 130/34 ≈ 3.8px 的殘餘位移，肉眼幾乎看不出來（大爺回報「強風注意但機體無感」）。
    // 這裡把風換算成「跟隨目標」的位移：先平滑（0.42 秒時間常數，看得出被推的過程），
    // 再乘 0.32 → 130px/s 的風＝游標下風側約 42px 的穩定偏移；風停後平滑歸零、機體自動飄回。
    // 鍵盤／相對拖曳模式不需要（它們本來就吃上面的位移），故只作用在跟隨分支。
    this.windOff += (this.wind - this.windOff) * Math.min(1, dt * 2.4);
    const windShift = Math.abs(this.windOff) < 0.5 ? 0 : this.windOff * 0.32;

    if (inp.isTouch || inp.touchId !== -1) {
      const d = inp.consumeDrag();
      p.x += d.x;
      p.y += d.y;
    } else if (!inp.mouseFollow && inp.mouseDown) {
      // 滑鼠跟隨關閉：按住左鍵時採用相對拖曳，不追絕對座標
      p.x += inp.mouseDeltaX;
      p.y += inp.mouseDeltaY;
      inp.mouseDeltaX = 0;
      inp.mouseDeltaY = 0;
    } else if (inp.mouseActive && inp.mouseFollow) {
      // 滑鼠跟隨開啟：絕對座標平滑跟隨
      //   ① `followOffX/Y`＝UI 覆蓋層關閉後的重新對位偏移（見 input.reanchor）
      //   ② `windShift`＝強風位移（見下方 updatePlayer 的 windOff 說明）
      inp.tickFollowOff(dt);
      const minX = 22;
      const maxX = W - 22;
      const minY = 60;
      const maxY = H - 16;
      const txg = clamp(inp.tx + inp.followOffX + windShift, minX, maxX);
      const tyg = clamp(inp.ty + inp.followOffY, minY, maxY);
      const dx = txg - p.x;
      const dy = tyg - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 8) {
        p.x = txg;
        p.y = tyg;
      } else {
        const k = Math.min(1, dt * (dist > 100 ? 42 : 34));
        p.x += dx * k;
        p.y += dy * k;
      }
    } else {
      let ax = inp.axisX;
      let ay = inp.axisY;
      const l = Math.hypot(ax, ay);
      if (l > 1) {
        ax /= l;
        ay /= l;
      }
      p.x += ax * baseSpd * dt;
      p.y += ay * baseSpd * dt;
    }

    p.x += this.wind * dt;
    p.x = clamp(p.x, 22, W - 22);
    p.y = clamp(p.y, 60, H - 16);

    const vx = (p.x - prevX) / Math.max(dt, 0.001);
    const vy = (p.y - prevY) / Math.max(dt, 0.001);
    p.bank += (clamp(vx / 420, -1, 1) - p.bank) * Math.min(1, dt * 10);
    p.thrust = 1 + Math.abs(p.bank) * 0.2 + (p.y < prevX ? 0 : 0);
    // port/011（星紋天域）六台共用的玩家狀態：來源引擎把這三個欄位放在 Player 上，
    // 但 dst 原生機體不讀它們 → 由引擎統一維護，技能端不必各自重算（餵入無副作用）。
    //   focus：是否按著低速鍵（緋燕／蒼牙／月影／墨染／凜針／翠蓮的彈型分流）
    //   still：近乎靜止的累積秒數（凜針「零度凝視」）
    //   od   ：過載增益倒數（緋燕／翠蓮的射擊增傷；由技能自行 Math.max 續期）
    p.focus = inp.focus;
    p.still = Math.hypot(vx, vy) < 8 ? p.still + dt : 0;
    if (p.od > 0) p.od = Math.max(0, p.od - dt);
    if (p.inv > 0) p.inv -= dt;
    if (p.hitFlash > 0) p.hitFlash -= dt * 4;
    if (p.castT > 0) p.castT -= dt;
    if (p.ultBusy > 0) p.ultBusy -= dt;
    if (p.activeCd > 0) p.activeCd -= dt;
    // 奧義自然充能
    if (p.ultBusy <= 0) p.ult = Math.min(100, p.ult + (100 / this.ship.ultTime) * p.s.ultMul * dt);
    if (p.ult >= 100 && !this.ultWasReady) {
      this.ultWasReady = true;
      this.say("ULT READY", "#c58bff");
      audio.sfx("power");
    } else if (p.ult < 100) this.ultWasReady = false;
    // 護盾再生
    if (p.s.shieldRegen > 0 && p.shield < p.maxShield) {
      p.shieldT += dt;
      if (p.shieldT >= p.s.shieldRegen) {
        p.shieldT = 0;
        p.shield++;
        this.fx.ring(p.x, p.y, 10, 60, 0.4, "#9be6ff", 4);
      }
    }
    // 形態預設值（技能模組會覆寫）
    if (p.form === 0) {
      p.dmgMul = 1;
      p.speedMul = 1;
      p.drMul = 1;
    }
    // 真身收起中（奧義演出，見 shipHidden）→ 真身所有輸出停手：技能不跑、不射擊、僚機不射擊。
    // 否則會在隱形的真身位置看到憑空生出的子彈（引擎尾焰／proc 文字見下；機體層繪製見 renderer）。
    const hidden = this.shipHidden;
    if (!hidden) this.kit.update(this, dt);
    // 射擊
    p.fireT -= dt;
    if (p.fireT < -0.1) p.fireT = 0;
    if (p.fireT <= 0 && !hidden) {
      const before = this.pb.items.length;
      this.kit.fire(this, dt);
      // 「多重射擊」卡（p.s.extra）：把本輪新彈複製 extra 份，向左右展開 ±0.09 rad／彈。
      // 由引擎層統一注入——見 SELF_MULTI_SHIPS 註解（2026-10-19 大爺回報 crow 等 40 台選了沒效果）。
      if (!SELF_MULTI_SHIPS.has(this.ship.id)) {
        duplicateExtra(this.pb.items as never[], before, cardExtra(this), (src, off) => {
          const nb = this.pb.spawn();
          Object.assign(nb, src);
          nb.hits = []; // 不可沿用舊彈的命中紀錄，否則複製彈一生成就「已命中」全部敵人
          const sp = Math.hypot(nb.vx, nb.vy);
          if (sp > 0) {
            const na = Math.atan2(nb.vy, nb.vx) + off;
            nb.vx = Math.cos(na) * sp;
            nb.vy = Math.sin(na) * sp;
          }
          rotateVel(nb, 0); // 順手清掉 homing 的鎖定殘留
        });
      }
    }
    if (!hidden) this.updateOptions(dt);
    updateProcs(this, dt);
    // 引擎尾焰粒子（真身收起中不噴，否則奧義期間會看到尾燄留在原地）
    if (!hidden && Math.random() < 0.6) this.fx.glowP(p.x + rand(-4, 4), p.y + 26, rand(-15, 15), rand(120, 220), 0.25, rand(5, 9), this.ship.color2, 1, 0, 0.7);
    if (p.hp / p.maxHp < 0.3) this.lowHpPulse += dt * 6;
    // 進化外觀 UR 光環
    void lerp;
  }

  updateOptions(dt: number) {
    const p = this.p;
    const n = p.s.options;
    if (n <= 0) return;
    this.optAng += dt * 2.2;
    this.optFireT -= dt;
    if (this.optFireT <= 0) {
      this.optFireT = 0.28 / p.s.rate;
      for (let i = 0; i < n; i++) {
        const a = this.optAng + (i * TAU) / n;
        const ox = p.x + Math.cos(a) * 44;
        const oy = p.y + Math.sin(a) * 18 - 4;
        this.spawnPB(ox, oy, -Math.PI / 2, 1000, 16, 3.5 + this.level * 0.35, { r: 4, life: 0.9, src: 1, homing: 1 });
      }
    }
  }

  updatePBullets(dt: number) {
    const arr = this.pb.items;
    const en = this.en.items;
    const p = this.p;
    for (let i = arr.length - 1; i >= 0; i--) {
      const b = arr[i];
      if (!b.alive) {
        this.pb.kill(i);
        continue;
      }
      b.t += dt;
      b.life -= dt;
      if (b.life <= 0) {
        this.pb.kill(i);
        continue;
      }
      if (b.kind >= 20) this.kit.updateBullet?.(this, b, dt);
      if (!b.alive) continue;
      if (!b.selfMove) { // selfMove：cf5/cft 來源引擎 port 內自移，homing 轉向與整合位移都由 port 負責，引擎跳過
        if (b.homing > 0) {
          // 目標選擇必須排除「這顆子彈已經命中過」的敵人（穿透彈）。
          // 否則穿透 A 之後 `nearest` 仍指向 A → 子彈轉頭繞回 A，但命中判定又被
          // `b.hits` 擋掉（造成不了傷害）→ 子彈只能貼著 A 繞圈：畫面上就是 8 字／∞
          //（2026-10-12 大爺回報「像磁鐵吸鐵沙、8 字形繞回來」）。
          const e = this.nearest(b.x, b.y, 460, b.hits.length ? (t) => b.hits.indexOf(t.uid) < 0 : undefined);
          if (e) {
            const desired = Math.atan2(e.y - b.y, e.x - b.x);
            let cur = Math.atan2(b.vy, b.vx);
            const diff = ((desired - cur + Math.PI * 3) % TAU) - Math.PI;
            const turn = (2.4 + b.homing * 1.7) * dt;
            cur += clamp(diff, -turn, turn);
            const sp = Math.hypot(b.vx, b.vy);
            b.vx = Math.cos(cur) * sp;
            b.vy = Math.sin(cur) * sp;
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
      }
      if (b.kind === 1) b.x += Math.cos(b.t * b.c) * b.b * b.a * dt;
      b.rot += b.spin * dt;
      if (b.x < -60 || b.x > W + 60 || b.y < -80 || b.y > H + 80) {
        this.pb.kill(i);
        continue;
      }
      // 命中敵機
      for (let j = 0; j < en.length; j++) {
        const e = en[j];
        if (e.dead || e.alpha < 0 || e.y < -30) continue;
        if (e.def.ai === "ghost" && e.invuln) continue;
        // 友軍化（glitch 駭入）：子彈直接穿過，不消耗、不傷害 —— 否則被凍住的友軍
        // 正好停在彈幕中央，0.2 秒就被自家火力打死，「敵軍變友軍」根本看不到。
        if (e.allyT > 0) continue;
        const rr = e.r + b.r * b.scale * 0.8;
        const dx = e.x - b.x;
        const dy = e.y - b.y;
        if (dx * dx + dy * dy > rr * rr) continue;
        if (b.hits.length && b.hits.indexOf(e.uid) >= 0) continue;
        this.hitEnemy(b, e);
        if (!b.alive) break;
        if (b.pierce > 0) {
          b.pierce--;
          b.hits.push(e.uid);
          if (b.ramp > 0 && b.a < b.b) {
            b.a++;
            b.dmg *= 1 + b.ramp;
          }
        } else {
          b.alive = false;
          break;
        }
      }
      if (!b.alive) {
        this.pb.kill(i);
      }
    }
    void p;
  }

  hitEnemy(b: PBullet, e: Enemy) {
    const p = this.p;
    if (e.invuln) {
      this.fx.hit(b.x, b.y, "#9aa6b6");
      if (b.pierce <= 0) b.alive = false;
      return;
    }
    let d = b.dmg;
    const crit = Math.random() < p.s.crit;
    if (crit) d *= p.s.critDmg;
    this.fx.hit(b.x, b.y, crit ? "#ffd36b" : this.ship.color2);
    audio.sfx("hit", 0.05);
    this.damageEnemy(e, d, { crit, x: b.x, y: b.y });
    if (b.src < 2) {
      this.addUlt(0.05);
    }
    this.kit.onHit?.(this, b, e, d);
    if (!b.alive && b.pierce <= 0) return;
    if (b.burn > 0) e.burn = Math.max(e.burn, 2 + b.burn);
    if (b.slow > 0) e.slow = Math.max(e.slow, 0.8 + b.slow * 0.5);
    if (b.chain > 0) this.chain(e.x, e.y, b.chain, d * 0.5, e.uid);
    // 榴彈彈頭：任何「真的有傷害」的玩家子彈命中都該爆。
    // ⚠ 2026-10-20 前閘門是 `b.kind === 0 || b.kind === 1` —— 但移植機體的主武多半是
    //   kind 20+（自移彈：螺旋火、冰槍、魂彈、棋步…），於是 homura／jade／sumizome／
    //   dealer／kaleido／tempus 六台的「榴彈彈頭」選了完全沒反應（`_attach_test.cjs` 抓到）。
    //   改用「傷害 > 0」當閘門：dmg 0 的純視覺彈（拳鋼的拳頭、標記彈）不會冒出一堆假爆炸。
    if (p.s.explode > 0 && b.src < 2 && d > 0) this.aoe(b.x, b.y, 44, d * p.s.explode, { noText: true, small: true, skip: e.uid, pal: "gold" });
  }

  updateEBullets(dt: number) {
    const arr = this.eb.items;
    const p = this.p;
    const hitR = 4.6;
    const grazeR = 20;
    const gs = this.bulletSlow;
    for (let i = arr.length - 1; i >= 0; i--) {
      const b = arr[i];
      if (!b.alive) {
        this.eb.kill(i);
        continue;
      }
      b.t += dt;
      let spd = b.spd;
      switch (b.mode) {
        case 1:
          b.spd += b.acc * dt;
          if (b.b > 0 && b.spd > b.b) b.spd = b.b;
          spd = b.spd;
          break;
        case 2:
          b.ang += b.turn * dt;
          break;
        case 3:
          b.spd *= Math.max(0, 1 - 1.9 * dt);
          spd = b.spd;
          if (b.t >= b.b) {
            ring(this, b.x, b.y, b.a, 135, 0, b.color);
            audio.sfx("hit", 0.08);
            b.alive = false;
            continue;
          }
          break;
        case 4:
          if (b.t < b.a) spd = 0;
          else {
            b.mode = 1;
            b.spd = 20;
          }
          break;
      }
      const s = spd * b.slow * gs;
      b.slow = 1;
      b.x += Math.cos(b.ang) * s * dt + (b.mode === 5 ? Math.cos(b.t * b.a) * b.b * dt : 0);
      b.y += Math.sin(b.ang) * s * dt;
      if (b.x < -50 || b.x > W + 50 || b.y < -70 || b.y > H + 70) {
        b.alive = false;
        continue;
      }
      if (this.stateName !== "playing") continue;
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const d2 = dx * dx + dy * dy;
      const hr = b.r + hitR;
      if (d2 < hr * hr) {
        b.alive = false;
        this.hurt(b.dmg);
      } else if (!b.grazed) {
        const gr = b.r + grazeR;
        if (d2 < gr * gr) {
          b.grazed = true;
          this.grazeCount++;
          this.score += Math.round(20 * p.s.grazeMul);
          this.addUlt(0.35 * p.s.grazeMul);
          this.fx.glowP(b.x, b.y, 0, 0, 0.15, 6, "#ffffff", 12, 0, 0.9);
          audio.sfx("graze", 0.06);
          this.kit.onGraze?.(this);
        }
      }
    }
    // 敵機碰撞
    if (this.stateName === "playing") {
      for (const e of this.en.items) {
        if (e.dead || e.alpha < 0.3 || e.invuln) continue;
        const rr = e.r * 0.8 + 5;
        if (dist2(e.x, e.y, p.x, p.y) < rr * rr) {
          if (e.def.ai === "dive") {
            this.fx.explosion(e.x, e.y, 20, PAL.fire);
            e.dead = true;
            e.alpha = -1;
            this.hurt(this.ebDmg() * 1.4);
          } else if (!e.boss) {
            this.hurt(this.ebDmg() * 1.2);
          } else this.hurt(this.ebDmg() * 1.5);
        }
      }
    }
  }

  updateBeams(dt: number) {
    const arr = this.beams.items;
    const p = this.p;
    this.beamHitCd -= dt;
    for (let i = arr.length - 1; i >= 0; i--) {
      const b = arr[i];
      if (!b.alive) {
        this.beams.kill(i);
        continue;
      }
      b.t += dt;
      if ((b as any).followP) {
        // 跟隨玩家（來源 cf5 的 `follow & 1`）；既有敵方光束走下方 follow 物件路徑，不受影響
        b.x = this.p.x + b.ox;
        b.y = this.p.y + b.oy;
      } else if (b.follow) {
        if (b.follow.dead || !b.follow.alive) {
          b.alive = false;
          continue;
        }
        b.x = b.follow.x + b.ox;
        b.y = b.follow.y + b.oy;
      }
      b.ang += b.rot * dt;
      if (b.t >= b.warn + b.life) {
        b.alive = false;
        continue;
      }
      const active = b.t >= b.warn;
      if (active && !(b as any).fired) {
        (b as any).fired = true;
        if (b.dmg > 0) {
          audio.sfx((b as any).thunder ? "lightning" : "laser", 0.1);
          if ((b as any).thunder) {
            this.bg.strike();
            this.shake(5, 0.2);
            // 014 式落雷的「打下來了」回饋（外觀層，不動傷害判定）：
            // 全螢幕淡紫閃光 ＋ 雲端（光束起點）爆散。014 的 `flash("#e6c8ff",0.25)`＋
            // `burst(px,120,…)` 同位置，這裡壓低強度避免蓋掉彈幕。
            this.flash("#e6c8ff", 0.16);
            this.fx.burst(b.x + Math.cos(b.ang) * 120, b.y + Math.sin(b.ang) * 120, 16, "#e6c8ff", 120, 420, 0.45, 2);
          }
        }
      }
      if (active && b.dmg > 0 && this.stateName === "playing" && this.beamHitCd <= 0) {
        const ex = b.x + Math.cos(b.ang) * b.len;
        const ey = b.y + Math.sin(b.ang) * b.len;
        const d = distSeg(p.x, p.y, b.x, b.y, ex, ey);
        if (d < b.w / 2 + 3) {
          this.beamHitCd = 0.3;
          this.hurt(b.dmg);
        }
      }
    }
  }

  updatePickups(dt: number) {
    const arr = this.pk.items;
    const p = this.p;
    const looting = this.looting;
    for (let i = arr.length - 1; i >= 0; i--) {
      const k = arr[i];
      k.t += dt;
      const dx = p.x - k.x;
      const dy = p.y - k.y;
      const d = Math.hypot(dx, dy) || 1;
      const soft = k.kind === PK.EXP || k.kind === PK.COIN;
      const heavy = k.kind === PK.GEAR || k.kind === PK.CORE;
      const magR = (k.kind === PK.EXP ? 150 : k.kind === PK.COIN ? 120 : 100) * p.s.magnet;
      if (this.collectAll && heavy) {
        // 強收：全數高速吸入（手動撤離／倒數結束）
        const sp = 900 + k.t * 160;
        k.vx += ((dx / d) * sp - k.vx) * Math.min(1, dt * 10);
        k.vy += ((dy / d) * sp - k.vy) * Math.min(1, dt * 10);
      } else if (k.mag || d < magR || (!looting && k.t > 6)) {
        k.mag = true;
        const sp = 520 + k.t * 60;
        k.vx += ((dx / d) * sp - k.vx) * Math.min(1, dt * 8);
        k.vy += ((dy / d) * sp - k.vy) * Math.min(1, dt * 8);
      } else {
        k.vx *= 1 - Math.min(1, dt * 2.2);
        // 下落收速：looting 時重型物體緩降停留，維持原 60 收速
        const vyT = looting && heavy ? 18 : 60;
        k.vy += (vyT - k.vy) * Math.min(1, dt * 1.2);
      }
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      // 掉落邊界：GEAR/CORE 水平撞邊反彈；looting 時落地彈跳停留
      if (!soft && heavy) {
        if (k.x < 18 || k.x > W - 18) {
          k.vx = -k.vx;
          k.x = clamp(k.x, 18, W - 18);
        }
        if (looting) {
          if (k.y > H - 30) { k.vy = -Math.abs(k.vy) * 0.6 - 30; k.y = H - 30; }
          if (k.y < 90) { k.vy = Math.abs(k.vy) + 20; k.y = 90; }
        }
      }
      if (this.stateName === "playing" && d < 24) {
        this.collect(k);
        this.pk.kill(i);
        continue;
      }
      if (k.y > H + 40 || k.x < -40 || k.x > W + 40) {
        if (heavy && k.item) {
          // 稀有裝備不會掉出畫面：直接拾取
          this.collect(k);
        }
        this.pk.kill(i);
      }
    }
  }

  updateHud() {
    const h = this.hud;
    const p = this.p;
    h.hp = Math.max(0, p.hp);
    h.maxHp = p.maxHp;
    h.shield = p.shield;
    h.exp = this.exp;
    h.expNeed = this.expNeed;
    h.level = this.level;
    h.score = Math.round(this.score);
    h.combo = this.combo;
    h.comboT = this.comboT > 0 ? clamp(this.comboT / (2.4 + p.s.comboWin), 0, 1) : 0;
    h.activeCd = p.activeCd > 0 ? 1 - p.activeCd / Math.max(0.1, p.activeMax) : 1;
    h.ult = p.ult / 100;
    h.ultReady = p.ult >= 100;
    h.power = p.power;
    h.form = p.form;
    h.time = this.time;
    h.fps = this.fps;
    h.progress = this.stage ? clamp(this.stageT / this.stage.len, 0, 1) : (this.chunk % 9) / 9;
    const b = this.boss && !this.boss.dead ? this.boss : this.mid && !this.mid.dead ? this.mid : null;
    // 階段門檻的唯一來源：中王（`def.mid`）只有 2 階段（滿血／半血），**不可餵 bossId**
    // ——中王的 `bossId` 是 0（`spawnMid` 不設）→ `BOSS_PHASE_MARKS(0)` 會回母專案 Boss 的 3 階段，
    // 血條就多畫一格（先前「中 boss 沒有 phase 卻顯示三段」的根因）。
    const marks = b ? (b.def.mid ? MID_PHASE_MARKS : BOSS_PHASE_MARKS(b.bossId)) : null;
    h.boss = b && marks ? { name: b.def.name, hp: clamp(b.hp / b.maxHp, 0, 1), ph: b.ph, phMax: marks.length + 1, marks } : null;
    h.callout = this.calloutT > 0 ? this.callout : "";
    h.calloutColor = this.calloutColor;
    h.lootT = this.looting ? this.lootT : 0;
    h.lootMax = this.lootMax;
  }

  // ------------------------------------------------------------------
  // 結算
  finish(win: boolean) {
    if (this.finished) return;
    this.finished = true;
    const stage = this.stage;
    const diffM = this.dm.reward;
    const st = this.save.stages;
    // 評價用的「關卡序」：每日挑戰的 id 是 100，直接拿去算會讓核心與連擊門檻暴走 → 夾在 12。
    const sid = this.rankId;
    let coins = Math.round(this.coins * (win ? 1 : 0.7));
    let cores = this.cores;
    if (win && stage) {
      coins += Math.round(900 * stage.reward * diffM);
      cores += 2 + Math.floor(sid / 2) + this.diff;
    }
    if (!win && this.endless) coins += Math.round(this.time * 2 * (1 + this.chunk * 0.1));
    if (this.endless) cores += Math.floor(this.chunk / 3);
    const base = this.stage ? 30000 * Math.pow(this.stage.hpMul, 0.9) * (1 + this.diff * 0.6) : 40000;
    let rank: RunResult["rank"] = "C";
    if (this.endless) {
      rank = this.time > 900 ? "S" : this.time > 600 ? "A" : this.time > 300 ? "B" : "C";
    } else if (this.stage) {
      // 評價（cf5 式，滿分 100）：通關 30＋無傷 25＋擊墜率 20＋連擊 10＋時間 10＋分數 5
      // 舊算法只看分數 → 幾乎必 S；改成多面向加權後，要近乎無傷＋高擊墜率才拿得到 S。
      const par = this.stage.len + 5; // 目標通關時間（秒）
      const clearPts = win ? 30 : 0;
      const survPts = Math.max(0, 25 - this.hits * 6);
      const kr = this.spawnedTL > 0 ? clamp(this.killsTL / this.spawnedTL, 0, 1) : 1;
      const killPts = kr * 20;
      const comboT = 50 + sid * 12 + this.diff * 10;
      const comboPts = clamp(this.maxCombo / comboT, 0, 1) * 10;
      const over = Math.max(0, this.stageT / par - 1);
      const timePts = clamp(10 - over * 20, 0, 10);
      const scorePts = clamp(this.score / base, 0, 1) * 5;
      const pts = clearPts + survPts + killPts + comboPts + timePts + scorePts;
      rank = pts >= 94 ? "S" : pts >= 80 ? "A" : pts >= 60 ? "B" : "C";
    }
    const key = String(this.stage ? this.stage.id : 0);
    const prev = this.endless ? this.save.endless.hi?.[this.diff] || 0 : this.daily ? this.save.daily.best?.[this.diff] || 0 : st[key]?.hi?.[this.diff] || 0;
    const newHi = this.score > prev;
    // 先入庫才知道實際件數與分解數（倉庫 MAX_INV 滿時會自動分解 → 結算要顯示明細）
    const add = addItems(this.items);
    const res: RunResult = {
      mode: this.endless ? "endless" : this.daily ? "daily" : "stage", stageId: this.stage ? this.stage.id : 0, diff: this.diff, ship: this.ship.id, win, score: Math.round(this.score), kills: this.kills, hits: this.hits, maxCombo: this.maxCombo,
      time: this.time, coins, cores, items: this.items, itemsKept: add.added, itemsLost: add.dismantled, itemRefund: add.refund, level: this.level, wave: this.chunk + 1, rank, newHi,
    };
    mutate((d) => {
      d.coins += coins;
      d.cores += cores;
      d.stats.kills += this.kills;
      d.stats.runs += 1;
      d.stats.playSec += Math.round(this.time);
      d.stats.maxCombo = Math.max(d.stats.maxCombo, this.maxCombo);
      const order = ["", "C", "B", "A", "S"];
      if (this.endless) {
        // 無限模式紀錄：各難度分開記（與關卡模式一致）
        d.endless.hi[this.diff] = Math.max(d.endless.hi[this.diff] || 0, Math.round(this.score));
        d.endless.time[this.diff] = Math.max(d.endless.time[this.diff] || 0, Math.round(this.time));
        d.endless.wave[this.diff] = Math.max(d.endless.wave[this.diff] || 0, this.chunk + 1);
      } else if (this.daily) {
        // 每日挑戰：當日紀錄（各難度分開）＋ 歷史最高分
        const dd = d.daily;
        dd.plays += 1;
        if (win) dd.clears += 1;
        dd.best[this.diff] = Math.max(dd.best[this.diff] || 0, Math.round(this.score));
        if (win && order.indexOf(rank) > order.indexOf(dd.rank[this.diff] || "")) dd.rank[this.diff] = rank;
        dd.bestAll = Math.max(dd.bestAll || 0, Math.round(this.score));
      } else {
        const r = d.stages[key] || { clear: DIFFS.map(() => false), hi: DIFFS.map(() => 0), rank: DIFFS.map(() => "") };
        if (win) r.clear[this.diff] = true;
        r.hi[this.diff] = Math.max(r.hi[this.diff] || 0, Math.round(this.score));
        if (win) {
          const best = r.rank[this.diff] || "";
          if (order.indexOf(rank) > order.indexOf(best)) r.rank[this.diff] = rank;
        }
        d.stages[key] = r;
      }
      d.ships[this.ship.id].best = Math.max(d.ships[this.ship.id].best, Math.round(this.score));
    });
    // 結算：先把關卡曲淡掉再播 jingle。
    //   舊行為是「BGM 照播、jingle 疊在上面」，而 jingle 又比 BGM 小聲 → 大爺聽感
    //   「通關／失敗的音效很小聲，而且音樂還在播，要完全退出才換首」。
    //   `setTheme(0)` 只換曲目不會停音樂，所以一定要走 `fadeOutBgm`。
    audio.fadeOutBgm(0.45);
    audio.sfx(win ? "clear" : "fail");
    if (win) this.cb.onClear?.(res);
    else this.cb.onOver?.(res);
  }

  /** 玩家主動放棄／離開 */
  abort() {
    if (!this.finished) {
      this.finished = true;
    }
    this.stop();
  }
}

function distSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

function parseRgba(s: string): [number, number, number, number] {
  const m = s.match(/[\d.]+/g) || ["0", "0", "0", "0"];
  return [+m[0], +m[1], +m[2], +m[3]];
}

function gradeAt(g: [string, string, string], pr: number): string {
  const a = parseRgba(g[0]);
  const b = parseRgba(g[1]);
  const c = parseRgba(g[2]);
  const [from, to, k] = pr < 0.5 ? [a, b, pr * 2] : [b, c, (pr - 0.5) * 2];
  const r = from.map((v, i) => v + (to[i] - v) * k);
  return `rgba(${Math.round(r[0])},${Math.round(r[1])},${Math.round(r[2])},${r[3].toFixed(3)})`;
}

void HAZARD_INFO;

// ===== src\game\data\ships.ts =====
// 戰機的完整設定：外觀色系、基礎數值、四大技能（武裝／被動／主動／奧義）與進化描述
import type { ShipId, SkillKey } from "../types";

export interface SkillInfo {
  name: string;
  en: string;
  icon: string;
  desc: string;
  /** 進化描述：對應技能等級 Lv3／Lv5／Lv7 */
  evo: [string, string, string];
}

/** 奧義 Cut-in 樣式資料（canvas 繪製用）；c1 主色／c2 暗色／c3 亮色，angle 色帶傾斜角 */
export interface CutinStyle {
  c1: string;
  c2: string;
  c3: string;
  angle: number;
}

export interface ShipDef {
  id: ShipId;
  name: string;
  en: string;
  sigil: string; // 星紋（超能力）名稱
  sigilEn: string;
  pilot: string;
  pilotEn: string;
  role: string;
  color: string;
  color2: string;
  dark: string;
  quote: string;
  lore: string;
  portrait: { focus: number; focusX?: number; focusXList?: number; zoomList?: number; cutinZoom?: number; cutinFocus?: number }; // 單張立繪（src/assets/portraits/<shipId>.jpg，1080×1920）裁切焦點：focus＝臉部垂直位置 0~1（0=頂、1=底）；focusX＝臉部水平位置（預設 0.5 水平中心，管 menu／battle／p012 精靈）；focusXList＝機庫列表窄條（variant "list"）專用水平錨點，未設回落 focusX，**奧義 cutin 也吃這個**；zoomList＝列表窄條專用縮放倍率（未設＝1 現況，<1 縮小、>1 放大，下限約 0.65＝cover 不露底）；cutinZoom＝**奧義 cutin 專用縮放**（未設＝1，>1 臉更大、<1 臉更小）；cutinFocus＝**奧義 cutin 專用垂直錨點**（未設回落 focus）；⚠ 這兩支是**備用**（2026-10-24 大爺指定留著），80 台目前全部沒填＝統一走 `bustRect.ts` 的 `CROP_ZOOM`（＝跟機庫小頭像同視角），只有少數構圖真的怪的機體才填
  base: { hp: number; spd: number; atk: number; rate: number };
  radar: { atk: number; spd: number; def: number; rng: number; ease: number };
  activeCd: number;
  ultTime: number; // 奧義自然充能所需秒數
  skills: Record<SkillKey, SkillInfo>;
  cut: { line1: string; line2: string };
  cutin: CutinStyle;
}

export const SKILL_KEYS: SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = { weapon: "武裝", passive: "被動", active: "主動", ult: "奧義" };
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS = [3, 5, 7];

export const SHIPS: Record<ShipId, ShipDef> = {
  kaleido: {
    id: "kaleido", name: "萬象", en: "KALEIDO", sigil: "變", sigilEn: "SHIFT", pilot: "葵 光", pilotEn: "Hikari Aoi", role: "變換｜彈跳連擊",
    color: "#ff4f9a", color2: "#38e8ff", dark: "#2a0a24", quote: "「每一種我，都是最強的我！」",
    lore: "葵光是天真爛漫的少年，注意力很難固定在一件事上。靈機「萬象」的機體本身會隨切換的個性重組形狀，外表永遠跟著心情變。星紋「變」讓他能在彈力、複製、增幅等多種能力之間自由切換，誰也猜不到下一秒他是哪一個。",
    portrait: { focus: 0.270, focusX: 0.500, focusXList: 0.750, zoomList: 0.80, cutinZoom: 0.86 },
    base: { hp: 105, spd: 345, atk: 1.0, rate: 1.0 },
    radar: { atk: 3, spd: 4, def: 3, rng: 3, ease: 5 },
    activeCd: 9, ultTime: 42,
    skills: {
      weapon: { name: "彈力圓盤", en: "REBOUND DISC", icon: "disc", desc: "擲出彩虹圓盤，命中後彈向下一個敵人，彈跳完畢飛回機體；回程同樣造成傷害。", evo: ["彈跳次數 +2", "一次擲出兩枚圓盤", "回程時分裂為三枚小圓盤"] },
      passive: { name: "受擊覺醒", en: "PAIN AWAKENING", icon: "awaken", desc: "受傷時釋放反擊波（震散近距離彈幕）並進入 4 秒「覺醒」：傷害 +25%、移速 +20%，並獲得奧義能量。", evo: ["覺醒時間延長為 6 秒", "反擊波擴大，並回復 10% 生命", "覺醒期間每秒向 8 方射出圓盤"] },
      active: { name: "個性切換", en: "QUIRK SWAP", icon: "swapPl", desc: "依序切換三種個性：「彈力」反彈近身彈幕、「複製」召喚鏡像分身、「增幅」震暈敵機並強化圓盤。持續 9 秒。", evo: ["切換時附帶 8 向圓盤齊射", "個性持續延長為 14 秒，切換後 1 秒無敵", "第三次切換觸發「全相覺醒」：三種個性同時生效 6 秒"] },
      ult: { name: "三相覺醒・極限解放", en: "TRI-PHASE LIMIT BREAK", icon: "kaleido_u", desc: "三階段連續演出：彈力暴走（巨型彈球橫衝直撞）→鏡像百影（分身雷射陣）→增幅極光炮。", evo: ["彈球數量增加", "分身增為 12 隻，雷射更密集", "極光炮二連發，寬度加倍"] },
    },
    cut: { line1: "三相覺醒", line2: "極限解放・萬象歸一" },
    cutin: { c1: "#ff4f9a", c2: "#38e8ff", c3: "#ffffff", angle: 0.18 },
  },
};

/** 由技能等級推算進化階段：0（Lv1-2）、1（Lv3-4）、2（Lv5-6）、3（Lv7） */
export function evoTier(lv: number): number {
  return lv >= 7 ? 3 : lv >= 5 ? 2 : lv >= 3 ? 1 : 0;
}

/** 技能升級消耗（永久升級 Lv1→5） */
export function skillUpCost(lv: number): { coins: number; cores: number } {
  const t = [
    { coins: 400, cores: 0 },
    { coins: 1100, cores: 2 },
    { coins: 2600, cores: 4 },
    { coins: 5200, cores: 8 },
  ];
  return t[Math.min(3, Math.max(0, lv - 1))];
}

/** 機體改造消耗（HP／攻擊／機動 0→10） */
export function modUpCost(n: number): number {
  return Math.round(180 * Math.pow(n + 1, 1.55));
}

/** 機體外觀階級：依四項技能永久等級總和決定 0~3 */
export function shipTier(lv: { weapon: number; passive: number; active: number; ult: number }): number {
  const s = lv.weapon + lv.passive + lv.active + lv.ult;
  return s >= 19 ? 3 : s >= 13 ? 2 : s >= 7 ? 1 : 0;
}
export const TIER_NAME = ["初始型態", "改修型態", "進化型態", "覺醒型態"];

/**
 * 奧義（`p.form === 1`）期間**強制顯示第 4 階（tier 3）外觀**的機體 id（跨專案擴充點）。
 *
 * 母專案是 `crow`——它的奧義是變身，變身中直接跳最高階外觀。
 * 你的機體若有同樣需求就把 id 填進來；沒有就留空陣列，**留空不會有任何副作用**。
 * （引擎在 `engine/renderer.ts` 的 `drawPlayer` 讀這張表。）
 */
export const FORM_TIER3: ShipId[] = ["crow"];
