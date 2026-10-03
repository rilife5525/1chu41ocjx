// Boss 繪製：六隻 Boss 各自獨立的外觀與動畫（每幀繪製，含階段變化）
import { TAU } from "../constants";
import { THEME_PAL } from "../data/enemies";
import { fillPoly, flame, lin, mirror, rad, ring } from "./shipUtil";
import type { Enemy } from "../entities";

const OUT = "rgba(8,4,12,0.92)";

function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 1) {
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = a;
  ctx.fillStyle = rad(ctx, x, y, r, [[0, "#fff"], [0.35, c], [1, "rgba(0,0,0,0)"]]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

// ---------- 0 晶冠機神：水晶要塞步行機 ----------
function bossCrystal(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const P = THEME_PAL[0];
  // 步行腿
  mirror(ctx, (s) => {
    const sw = Math.sin(t * 2 + (s > 0 ? 0 : Math.PI)) * 6;
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 16;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(30, -10);
    ctx.lineTo(70, 20 + sw);
    ctx.lineTo(74, 66 + sw);
    ctx.stroke();
    ctx.strokeStyle = "#5a5a86";
    ctx.lineWidth = 11;
    ctx.stroke();
    fillPoly(ctx, [[64, 60 + sw], [86, 62 + sw], [90, 82 + sw], [66, 84 + sw]], lin(ctx, 64, 60, 90, 84, [[0, "#8a8ab8"], [1, "#2a2a4a"]]), OUT, 1.5);
    // 水晶肩甲
    for (let i = 0; i < 3; i++) {
      fillPoly(ctx, [[42 + i * 12, -20], [48 + i * 12, -52 - i * 10 - (ph > 0 ? 8 : 0)], [54 + i * 12, -20]], lin(ctx, 48, -20, 48, -60, [[0, "#5b2aa8"], [1, "#e0c8ff"]]), OUT, 1.4);
    }
  });
  // 主體平台
  fillPoly(ctx, [[0, 58], [46, 34], [66, -8], [52, -40], [0, -50], [-52, -40], [-66, -8], [-46, 34]], lin(ctx, -66, 0, 66, 0, [[0, "#26264a"], [0.5, "#8a8ab8"], [1, "#26264a"]]), OUT, 2);
  // 塔尖水晶
  for (let i = -3; i <= 3; i++) {
    const h = 44 + (3 - Math.abs(i)) * 14 + Math.sin(t * 1.5 + i) * 3;
    fillPoly(ctx, [[i * 14 - 8, -40], [i * 14, -40 - h], [i * 14 + 8, -40]], lin(ctx, i * 14, -40, i * 14, -40 - h, [[0, "#4a1f9a"], [0.6, "#b26bff"], [1, "#f4e4ff"]]), OUT, 1.4);
  }
  // 核心水晶
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  fillPoly(ctx, [[0, -22], [20, 4], [0, 36], [-20, 4]], lin(ctx, 0, -22, 0, 36, [[0, "#f4e4ff"], [0.5, "#b26bff"], [1, "#3a1a7a"]]), OUT, 2);
  glowDot(ctx, 0, 6, 46 + ph * 8, "#c58bff", 0.55 * pulse);
  // 霓虹燈帶
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = P.ac;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-58, -10);
  ctx.lineTo(-30, 30);
  ctx.moveTo(58, -10);
  ctx.lineTo(30, 30);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  // 漂浮碎晶
  for (let i = 0; i < 6 + ph * 3; i++) {
    const a = t * (0.8 + (i % 3) * 0.2) + (i * TAU) / (6 + ph * 3);
    const x = Math.cos(a) * (96 + (i % 2) * 14);
    const y = Math.sin(a) * 30 + 6;
    fillPoly(ctx, [[x, y - 9], [x + 4.5, y], [x, y + 9], [x - 4.5, y]], lin(ctx, x, y - 9, x, y + 9, [[0, "#f4e4ff"], [1, "#6a35c8"]]), OUT, 1);
  }
}

// ---------- 1 深藍旗艦：戰艦航母，砲塔追蹤玩家 ----------
function bossFlagship(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number, px: number, py: number) {
  const P = THEME_PAL[1];
  // 甲板側翼
  mirror(ctx, () => {
    fillPoly(ctx, [[28, -70], [82, -50], [92, 30], [30, 60]], lin(ctx, 28, -70, 92, 30, [[0, "#20364e"], [1, "#4e7090"]]), OUT, 2);
    ctx.strokeStyle = "rgba(255,179,71,0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(60, -50);
    ctx.lineTo(66, 30);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  // 艦體（艦首朝下）
  fillPoly(ctx, [[0, 118], [22, 84], [34, 20], [36, -70], [22, -104], [-22, -104], [-36, -70], [-34, 20], [-22, 84]], lin(ctx, -36, 0, 36, 0, [[0, "#182a40"], [0.5, "#7fa0c0"], [1, "#182a40"]]), OUT, 2.4);
  ctx.strokeStyle = "rgba(10,20,30,0.8)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(-30, -80 + i * 22);
    ctx.lineTo(30, -80 + i * 22);
    ctx.stroke();
  }
  // 艦橋
  fillPoly(ctx, [[-16, -70], [16, -70], [12, -34], [-12, -34]], lin(ctx, 0, -70, 0, -34, [[0, "#c8dcf0"], [1, "#4e7090"]]), OUT, 1.6);
  glowDot(ctx, 0, -50, 14, P.ac, 0.5);
  // 追蹤砲塔
  const tur: [number, number][] = [[-52, -10], [52, -10], [-46, 44], [46, 44], [0, 70]];
  const nTur = ph >= 1 ? 5 : 3;
  for (let i = 0; i < nTur; i++) {
    const [tx, ty] = tur[i];
    const wx = e.x + tx * e.scale;
    const wy = e.y + ty * e.scale;
    const a = Math.atan2(py - wy, px - wx) - Math.PI / 2;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.fillStyle = lin(ctx, -10, 0, 10, 0, [[0, "#20364e"], [0.5, "#b4ccdf"], [1, "#20364e"]]);
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(a);
    fillPoly(ctx, [[-4, 0], [4, 0], [3, 26], [-3, 26]], "#3a5878", OUT, 1.4);
    ctx.restore();
    glowDot(ctx, tx, ty, 8, P.ac, 0.5);
  }
  // 尾部推進
  for (const x of [-16, 0, 16]) flame(ctx, x, -104, 34 + Math.sin(t * 20 + x) * 5, 7, t, "#ffffff", "#7fbfff", "rgba(40,90,255,0)");
}

// ---------- 2 霜牙冰龍：蜷曲的機械冰蛇 ----------
function bossWyrm(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const segs = 22;
  const pts: [number, number, number][] = [];
  for (let i = 0; i < segs; i++) {
    const k = i / (segs - 1);
    const y = 60 - k * 200;
    const x = Math.sin(t * 1.6 + k * 5.2) * (30 + k * 60) + (k > 0.5 ? Math.sin(k * 6) * 20 : 0);
    pts.push([x, y, 34 - k * 22]);
  }
  // 冰晶背刺 + 身體（由尾到頭）
  for (let i = segs - 1; i >= 0; i--) {
    const [x, y, r] = pts[i];
    const nx = i > 0 ? pts[i - 1] : pts[0];
    const ang = Math.atan2(nx[1] - y, nx[0] - x);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    // 背部冰刺
    fillPoly(ctx, [[-6, -r * 0.7], [0, -r * 1.7 - (i % 2) * 8], [8, -r * 0.7]], lin(ctx, 0, -r * 0.7, 0, -r * 1.8, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.2);
    fillPoly(ctx, [[-6, r * 0.7], [0, r * 1.5 + (i % 3) * 5], [8, r * 0.7]], lin(ctx, 0, r * 0.7, 0, r * 1.6, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r, 0, 0, TAU);
    ctx.fillStyle = lin(ctx, 0, -r, 0, r, [[0, "#f6feff"], [0.5, "#9bb6c8"], [1, "#3a5670"]]);
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(71,224,255,0.55)";
    ctx.fillRect(-r * 0.5, -1.5, r, 3);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }
  // 龍首（朝下）
  const jaw = 8 + Math.sin(t * 4) * 5 + ph * 4;
  ctx.save();
  ctx.translate(pts[0][0], pts[0][1] + 6);
  fillPoly(ctx, [[0, 56], [20, 34], [34, 4], [26, -18], [0, -26], [-26, -18], [-34, 4], [-20, 34]], lin(ctx, -34, 0, 34, 0, [[0, "#4a6a88"], [0.5, "#f2fcff"], [1, "#4a6a88"]]), OUT, 2.2);
  // 下顎
  fillPoly(ctx, [[-16, 30], [-6, 56 + jaw], [0, 64 + jaw], [6, 56 + jaw], [16, 30]], "#2a4560", OUT, 1.6);
  for (let i = -2; i <= 2; i++) fillPoly(ctx, [[i * 6 - 2, 40], [i * 6, 52 + jaw * 0.6], [i * 6 + 2, 40]], "#ffffff", OUT, 0.8);
  // 犄角
  mirror(ctx, () => {
    fillPoly(ctx, [[18, -14], [44, -46], [30, -8]], lin(ctx, 18, -14, 44, -46, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.5);
    fillPoly(ctx, [[26, 0], [56, -10], [34, 14]], lin(ctx, 26, 0, 56, -10, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.5);
    glowDot(ctx, 15, 8, 9, "#47e0ff", 1);
  });
  ctx.restore();
  glowDot(ctx, pts[0][0], pts[0][1] + 44, 20 + jaw, "#7fe4ff", 0.5);
}

// ---------- 3 熔核巨像：熔岩傀儡 ----------
function bossGolem(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const slam = Math.max(0, Math.sin(t * 1.3));
  // 拳頭
  mirror(ctx, (s) => {
    const fy = 62 + slam * 26 * (s > 0 ? 1 : 0.6);
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 34;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(62, -22);
    ctx.lineTo(96, fy - 26);
    ctx.stroke();
    ctx.strokeStyle = "#3a2622";
    ctx.lineWidth = 26;
    ctx.stroke();
    fillPoly(ctx, [[74, fy - 20], [116, fy - 24], [124, fy + 22], [96, fy + 44], [70, fy + 26]], lin(ctx, 70, fy - 24, 124, fy + 44, [[0, "#5a3a32"], [1, "#1a0e0c"]]), OUT, 2.2);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "#ff7a2a";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(84, fy - 8);
    ctx.lineTo(96, fy + 6);
    ctx.lineTo(90, fy + 26);
    ctx.moveTo(104, fy - 10);
    ctx.lineTo(108, fy + 12);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    glowDot(ctx, 98, fy + 10, 26, "#ff5a1a", 0.35 + slam * 0.4);
  });
  // 軀幹
  fillPoly(ctx, [[0, 80], [38, 62], [72, 14], [80, -34], [50, -66], [0, -72], [-50, -66], [-80, -34], [-72, 14], [-38, 62]], lin(ctx, -80, 0, 80, 0, [[0, "#1a0e0c"], [0.5, "#5a3a32"], [1, "#1a0e0c"]]), OUT, 2.6);
  // 肩部火山口
  mirror(ctx, () => {
    fillPoly(ctx, [[34, -62], [58, -100], [76, -60]], lin(ctx, 34, -62, 76, -100, [[0, "#3a2622"], [1, "#7a5246"]]), OUT, 2);
    glowDot(ctx, 58, -96, 20, "#ff7a2a", 0.8);
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.9 + i / 3) % 1;
      glowDot(ctx, 58 + Math.sin(t * 3 + i) * 8, -96 - p * 50, 9 * (1 - p), "#ffb347", 0.9);
    }
  });
  // 熔岩裂紋
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,120,30,0.9)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-50, -40);
  ctx.lineTo(-28, -14);
  ctx.lineTo(-40, 14);
  ctx.lineTo(-22, 44);
  ctx.moveTo(50, -40);
  ctx.lineTo(26, -10);
  ctx.lineTo(40, 20);
  ctx.lineTo(18, 50);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  // 胸口熔核
  const pl = 0.7 + 0.3 * Math.sin(t * 5);
  ctx.fillStyle = "#1a0806";
  ctx.beginPath();
  ctx.arc(0, 4, 26, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = 3;
  ctx.stroke();
  glowDot(ctx, 0, 4, 40 + ph * 6, "#ff5a1a", pl);
  // 頭
  fillPoly(ctx, [[0, -54], [16, -66], [14, -84], [0, -90], [-14, -84], [-16, -66]], lin(ctx, 0, -54, 0, -90, [[0, "#2a1614"], [1, "#6a463c"]]), OUT, 2);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#ff9a3a";
  ctx.fillRect(-10, -76, 20, 4);
  ctx.globalCompositeOperation = "source-over";
}

// ---------- 4 緋紅絕翼：赤色炮艇（焰翼） ----------
function bossScarlet(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  // 焰羽翼
  mirror(ctx, (s) => {
    const n = 8;
    for (let i = n - 1; i >= 0; i--) {
      const k = i / (n - 1);
      const a = -0.5 + k * 1.6 + Math.sin(t * 2.4 + i * 0.7) * 0.05 + ph * 0.04;
      const L = 150 - k * 34;
      const rx = 18;
      const ry = -30 + k * 24;
      const tx = rx + Math.cos(a) * L;
      const ty = ry + Math.sin(a) * L * 0.9;
      const mx = (rx + tx) / 2;
      const my = (ry + ty) / 2;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      ctx.beginPath();
      ctx.moveTo(rx, ry - 8);
      ctx.quadraticCurveTo(mx - nx * 22, my - ny * 22, tx, ty);
      ctx.quadraticCurveTo(mx + nx * 10, my + ny * 10, rx, ry + 8);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, rx, ry, tx, ty, [[0, "#3a0510"], [0.5, "#c8142a"], [1, "#ff8a3a"]]);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      glowDot(ctx, tx, ty, 14, "#ff6a3a", 0.6);
    }
    // 側砲
    fillPoly(ctx, [[62, 20], [74, 20], [76, 84], [60, 84]], lin(ctx, 60, 0, 76, 0, [[0, "#2a0a10"], [0.5, "#9a4048"], [1, "#2a0a10"]]), OUT, 1.8);
    glowDot(ctx, 68, 86, 10, "#ff3b52", 0.7);
    void s;
  });
  // 船身
  fillPoly(ctx, [[0, 96], [22, 60], [34, 0], [30, -50], [0, -64], [-30, -50], [-34, 0], [-22, 60]], lin(ctx, -34, 0, 34, 0, [[0, "#3a0510"], [0.5, "#d81e34"], [1, "#3a0510"]]), OUT, 2.4);
  ctx.strokeStyle = "rgba(255,200,160,0.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -56);
  ctx.lineTo(0, 88);
  ctx.stroke();
  // 核心之眼
  ctx.fillStyle = "#12030a";
  ctx.beginPath();
  ctx.ellipse(0, 10, 15, 24, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#ffd0a0";
  ctx.lineWidth = 2;
  ctx.stroke();
  glowDot(ctx, 0, 10, 32 + Math.sin(t * 5) * 4, "#ff3b52", 0.9);
  for (const x of [-16, 0, 16]) flame(ctx, x, -60, 40, 8, t + x, "#ffffff", "#ff8a3a", "rgba(255,30,10,0)");
}

// ---------- 5 天頂王座：黃金無畏艦與天環 ----------
function bossThrone(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const G = ["#5a3608", "#ffe6a0", "#c8902a"];
  // 天環
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 2 + ph; i++) {
    ctx.globalAlpha = 0.9 - i * 0.15;
    ring(ctx, 0, -6, 130 + i * 26, 44 + i * 10, i % 2 ? "#fff0b0" : "#ffd36b", 3 - i * 0.5, 0, TAU, t * (0.4 + i * 0.15) * (i % 2 ? -1 : 1));
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // 尖刺翼
  mirror(ctx, () => {
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.5 + Math.sin(t * 1.5 + i) * 0.03;
      const L = 132 - i * 10;
      const tx = 24 + Math.cos(a) * L;
      const ty = -10 + Math.sin(a) * L;
      fillPoly(ctx, [[20, -24 + i * 14], [tx, ty], [24, -12 + i * 14]], lin(ctx, 20, -10, tx, ty, [[0, G[0]], [0.6, G[2]], [1, G[1]]]), "rgba(40,20,0,0.92)", 1.8);
    }
    fillPoly(ctx, [[26, 30], [70, 68], [64, 96], [24, 60]], lin(ctx, 26, 30, 70, 96, [[0, "#1a1030"], [1, "#7a5a20"]]), "rgba(40,20,0,0.92)", 1.8);
  });
  // 主艦體
  fillPoly(ctx, [[0, 104], [26, 70], [40, 6], [30, -54], [0, -70], [-30, -54], [-40, 6], [-26, 70]], lin(ctx, -40, 0, 40, 0, [[0, "#15102a"], [0.5, "#3a2c5c"], [1, "#15102a"]]), "rgba(40,20,0,0.95)", 2.4);
  // 金色鑲邊
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 98);
  ctx.lineTo(22, 68);
  ctx.lineTo(35, 6);
  ctx.lineTo(26, -50);
  ctx.moveTo(0, 98);
  ctx.lineTo(-22, 68);
  ctx.lineTo(-35, 6);
  ctx.lineTo(-26, -50);
  ctx.stroke();
  // 王冠
  fillPoly(ctx, [[-22, -56], [-14, -90], [-6, -62], [0, -100], [6, -62], [14, -90], [22, -56]], lin(ctx, 0, -56, 0, -100, [[0, "#8a5a10"], [1, "#fff2b0"]]), "rgba(40,20,0,0.95)", 1.8);
  // 核心寶石
  const pl = 0.7 + 0.3 * Math.sin(t * 3);
  fillPoly(ctx, [[0, -16], [16, 10], [0, 40], [-16, 10]], lin(ctx, 0, -16, 0, 40, [[0, "#ffffff"], [0.5, "#ffd36b"], [1, "#a05a10"]]), "rgba(40,20,0,0.95)", 2);
  glowDot(ctx, 0, 12, 46 + ph * 10, "#ffd36b", 0.6 * pl);
  glowDot(ctx, 0, 12, 22, "#ffffff", 0.6 * pl);
  for (const x of [-18, 0, 18]) flame(ctx, x, -68, 38, 7, t + x, "#ffffff", "#ffd36b", "rgba(255,120,20,0)");
}

/** 繪製 Boss（原點為 Boss 中心；呼叫端負責 translate/scale） */
export function drawBossBody(ctx: CanvasRenderingContext2D, e: Enemy, t: number, px: number, py: number) {
  const ph = e.ph;
  switch (e.bossId % 6) {
    case 0: return bossCrystal(ctx, e, t, ph);
    case 1: return bossFlagship(ctx, e, t, ph, px, py);
    case 2: return bossWyrm(ctx, e, t, ph);
    case 3: return bossGolem(ctx, e, t, ph);
    case 4: return bossScarlet(ctx, e, t, ph);
    case 5: return bossThrone(ctx, e, t, ph);
  }
}
