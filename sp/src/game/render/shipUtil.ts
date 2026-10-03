// 戰機繪製共用工具與型別
import { TAU } from "../constants";

export type Pt = [number, number];

export interface ShipDrawOpts {
  t: number; // 動畫時間
  tier: number; // 外觀階級 0~3
  thrust: number; // 引擎強度
  form: number; // 特殊形態（0 一般／1 鳳凰或機神）
  morph: number; // 形態轉換進度 0~1
  gear: number[]; // 各欄位裝備稀有度階 0~4
  bank: number; // 橫移傾斜 -1~1
  color: string;
  color2: string;
}

export function path(ctx: CanvasRenderingContext2D, pts: Pt[], close = true) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  if (close) ctx.closePath();
}

export function fillPoly(ctx: CanvasRenderingContext2D, pts: Pt[], fill: string | CanvasGradient, stroke = "rgba(8,4,10,0.85)", lw = 1.2) {
  path(ctx, pts);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

/** 左右鏡像：fn 只需繪製 +x 半邊 */
export function mirror(ctx: CanvasRenderingContext2D, fn: (s: number) => void) {
  fn(1);
  ctx.save();
  ctx.scale(-1, 1);
  fn(-1);
  ctx.restore();
}

export function lin(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function rad(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, stops: [number, string][]) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

/** 引擎尾焰（加亮混合） */
export function flame(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, wid: number, t: number, c1: string, c2: string, c3 = "rgba(255,80,20,0)") {
  const fl = len * (0.82 + 0.18 * Math.sin(t * 48 + x * 3) + 0.06 * Math.sin(t * 31));
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createLinearGradient(0, y, 0, y + fl);
  g.addColorStop(0, c1);
  g.addColorStop(0.35, c2);
  g.addColorStop(1, c3);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - wid, y);
  ctx.quadraticCurveTo(x - wid * 0.7, y + fl * 0.55, x, y + fl);
  ctx.quadraticCurveTo(x + wid * 0.7, y + fl * 0.55, x + wid, y);
  ctx.closePath();
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

function hash(n: number) {
  const s = Math.sin(n * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/** 鋸齒閃電線 */
export function bolt(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, seed: number, segs: number, amp: number, color: string, w: number, core = "#fff") {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const pts: Pt[] = [[x1, y1]];
  for (let i = 1; i < segs; i++) {
    const k = i / segs;
    const o = (hash(seed + i * 7.13) - 0.5) * 2 * amp;
    pts.push([x1 + dx * k + nx * o, y1 + dy * k + ny * o]);
  }
  pts.push([x2, y2]);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (let pass = 0; pass < 2; pass++) {
    ctx.strokeStyle = pass === 0 ? color : core;
    ctx.lineWidth = pass === 0 ? w : Math.max(0.8, w * 0.38);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  }
}

export function ring(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, color: string, w: number, a0 = 0, a1 = TAU, rot = 0) {
  ctx.strokeStyle = color;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rot, a0, a1);
  ctx.stroke();
}

/** 裝備附加外觀：SSR（階 3）與 UR（階 4）會為機體增添可見部件 */
export function drawGear(ctx: CanvasRenderingContext2D, o: ShipDrawOpts, front: boolean) {
  const g = o.gear;
  if (!g) return;
  const t = o.t;
  const c1 = o.color;
  const c2 = o.color2;
  if (!front) {
    // 位於機體後方的部件
    if (g[3] >= 4) {
      // 核心 UR：背後旋轉天環
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.85;
      ring(ctx, 0, -2, 40, 15, c1, 2.2, 0, TAU, t * 0.8);
      ring(ctx, 0, -2, 46, 18, c2, 1.2, 0.3, TAU - 0.5, -t * 0.6);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    if (g[5] >= 4) {
      // 徽章 UR：金色冠翼
      const a = Math.sin(t * 2) * 0.05;
      mirror(ctx, () => {
        fillPoly(ctx, [[4, -6], [18 + a * 40, -30], [22, -22], [11, 6]], lin(ctx, 4, -6, 22, -30, [[0, "#7a4a08"], [1, "#ffe08a"]]), "rgba(40,20,0,0.9)", 1);
        fillPoly(ctx, [[8, 0], [30, -16 + a * 30], [28, -6], [12, 12]], lin(ctx, 8, 0, 30, -16, [[0, "#7a4a08"], [1, "#ffd15a"]]), "rgba(40,20,0,0.9)", 1);
      });
    }
    return;
  }
  // 位於機體前方的部件
  if (g[0] >= 3) {
    // 主砲：側掛砲艙
    const big = g[0] >= 4;
    mirror(ctx, () => {
      const x = big ? 20 : 17;
      fillPoly(ctx, [[x - 3, -16], [x + 3, -16], [x + 3.6, 8], [x - 3.6, 8]], lin(ctx, x - 4, 0, x + 4, 0, [[0, "#2a2f3a"], [0.5, "#8b95a8"], [1, "#2a2f3a"]]), "rgba(8,4,10,0.9)", 1);
      fillPoly(ctx, [[x - 1.6, -24], [x + 1.6, -24], [x + 3, -16], [x - 3, -16]], "#c9d2e3", "rgba(8,4,10,0.9)", 1);
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = c1;
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 8);
      ctx.beginPath();
      ctx.arc(x, -25, big ? 4 : 2.6, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    });
  }
  if (g[1] >= 3) {
    // 裝甲：肩部裝甲板
    const ur = g[1] >= 4;
    mirror(ctx, () => {
      fillPoly(ctx, [[10, -4], [ur ? 25 : 21, 2], [ur ? 24 : 20, 14], [9, 12]], lin(ctx, 10, -4, 24, 14, [[0, "#3b4254"], [1, "#9aa4bb"]]), "rgba(8,4,10,0.9)", 1);
      ctx.strokeStyle = ur ? "#ffd15a" : c2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(11, 0);
      ctx.lineTo(ur ? 23 : 19.5, 5);
      ctx.stroke();
    });
  }
  if (g[2] >= 3) {
    // 引擎：側噴口尾焰
    mirror(ctx, () => {
      flame(ctx, 13, 28, (g[2] >= 4 ? 30 : 20) * o.thrust, g[2] >= 4 ? 3.6 : 2.6, t + 1, "#ffffff", c1, "rgba(0,0,0,0)");
    });
  }
  if (g[3] >= 3) {
    // 核心：機體中央發光核心
    ctx.globalCompositeOperation = "lighter";
    const p = 0.6 + 0.4 * Math.sin(t * 5);
    ctx.fillStyle = rad(ctx, 0, 4, 12, [[0, "rgba(255,255,255,0.95)"], [0.35, c1], [1, "rgba(0,0,0,0)"]]);
    ctx.globalAlpha = 0.7 * p + 0.2;
    ctx.beginPath();
    ctx.arc(0, 4, 12, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  if (g[4] >= 3) {
    // 晶片：環繞星光
    const n = g[4] >= 4 ? 3 : 1;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++) {
      const a = t * 2.4 + (i * TAU) / n;
      const x = Math.cos(a) * 30;
      const y = Math.sin(a) * 12 - 4;
      ctx.fillStyle = rad(ctx, x, y, 7, [[0, "#fff"], [0.4, c2], [1, "rgba(0,0,0,0)"]]);
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  if (g[5] >= 3) {
    // 徽章：機尾金色尾鰭
    mirror(ctx, () => {
      fillPoly(ctx, [[3, 24], [9, 36], [6, 38], [1.5, 30]], lin(ctx, 3, 24, 9, 38, [[0, "#8a5a10"], [1, "#ffe08a"]]), "rgba(40,20,0,0.9)", 1);
    });
  }
}
