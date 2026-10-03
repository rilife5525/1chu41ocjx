// 戰機繪製（下）：紫電、玄影、星輝（含機神變形形態）
import { TAU } from "../constants";
import { bolt, drawGear, fillPoly, flame, lin, mirror, rad, ring } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";

const OUT = "rgba(10,4,14,0.92)";

// =====================================================================
// 紫電：前掠翼緊湊機身，翼端特斯拉線圈之間持續放電
// =====================================================================
export function drawVolt(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, tier, thrust } = o;
  drawGear(ctx, o, false);
  flame(ctx, -6, 27, 28 * thrust, 4.4, t, "#ffffff", "#ffe45c", "rgba(178,107,255,0)");
  flame(ctx, 6, 27, 28 * thrust, 4.4, t + 0.4, "#ffffff", "#ffe45c", "rgba(178,107,255,0)");
  // 前掠主翼
  mirror(ctx, () => {
    fillPoly(ctx, [[6, -4], [29, -20], [35, -8], [32, 10], [9, 18]], lin(ctx, 6, -4, 34, 10, [[0, "#1a0838"], [0.55, "#5b34c8"], [1, "#b98aff"]]), OUT);
    ctx.strokeStyle = "#ffe45c";
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(9, 2);
    ctx.lineTo(29, -13);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(30, 4);
    ctx.stroke();
    // 特斯拉線圈塔
    fillPoly(ctx, [[30, -18], [35, -18], [35.6, 4], [29.4, 4]], lin(ctx, 29, 0, 36, 0, [[0, "#22163f"], [0.5, "#7d68c9"], [1, "#22163f"]]), OUT, 1);
    ctx.strokeStyle = "#ffe45c";
    ctx.lineWidth = 1;
    for (let i = 0; i < 3 + Math.min(tier, 2); i++) {
      ctx.beginPath();
      ctx.moveTo(29.8, -14 + i * 4.6);
      ctx.lineTo(35.4, -14 + i * 4.6);
      ctx.stroke();
    }
    // 後置小翼
    fillPoly(ctx, [[4, 20], [14, 32], [10, 34], [3, 28]], "#3c2085", OUT, 1);
  });
  // 機身
  fillPoly(
    ctx,
    [[0, -38], [6, -22], [9, 0], [7.4, 22], [3.4, 30], [-3.4, 30], [-7.4, 22], [-9, 0], [-6, -22]],
    lin(ctx, -9, 0, 9, 0, [[0, "#170a30"], [0.5, "#7a4ce0"], [1, "#170a30"]])
  );
  // 機身黃色鑲邊
  ctx.strokeStyle = "#ffe45c";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(-5.2, -20);
  ctx.lineTo(-7.2, 18);
  ctx.moveTo(5.2, -20);
  ctx.lineTo(7.2, 18);
  ctx.stroke();
  // 座艙
  ctx.fillStyle = lin(ctx, 0, -24, 0, -6, [[0, "#fff6a8"], [0.5, "#e8b400"], [1, "#4a3000"]]);
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(4.4, -12);
  ctx.lineTo(0, -5);
  ctx.lineTo(-4.4, -12);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1;
  ctx.stroke();
  if (tier >= 2) {
    // 側掛電容艙
    mirror(ctx, () => {
      fillPoly(ctx, [[10, 6], [15, 6], [15.6, 22], [9.6, 22]], lin(ctx, 9, 0, 16, 0, [[0, "#2a1a58"], [0.5, "#9078e0"], [1, "#2a1a58"]]), OUT, 1);
    });
  }
  // 放電
  ctx.globalCompositeOperation = "lighter";
  const seed = Math.floor(t * 16);
  for (const s of [-1, 1]) {
    ctx.globalAlpha = 0.85;
    bolt(ctx, s * 32.5, -19, s * 3, -34, seed + (s > 0 ? 3 : 9), 5, 4, "rgba(178,107,255,0.9)", 2.2, "#fff6b0");
    if (tier >= 1) bolt(ctx, s * 32.5, -19, s * 33, -34 - tier * 3, seed + 21 + s, 4, 3, "rgba(178,107,255,0.7)", 1.6, "#fff6b0");
  }
  if (tier >= 1) bolt(ctx, -32.5, -19, 32.5, -19, seed + 40, 9, 6, "rgba(255,228,92,0.8)", 1.8, "#ffffff");
  if (tier >= 3) {
    bolt(ctx, 0, -38, 0, -60 - Math.sin(t * 9) * 4, seed + 60, 5, 4, "rgba(255,228,92,0.9)", 2, "#fff");
  }
  ctx.globalAlpha = 1;
  for (const s of [-1, 1]) {
    ctx.fillStyle = rad(ctx, s * 32.5, -19, 10, [[0, "rgba(255,255,255,0.95)"], [0.4, "rgba(255,228,92,0.7)"], [1, "rgba(178,107,255,0)"]]);
    ctx.beginPath();
    ctx.arc(s * 32.5, -19, 10, 0, TAU);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  drawGear(ctx, o, true);
}

// =====================================================================
// 玄影：曼塔型飛翼，金邊黑翼、瞳孔寶石、環繞暗能球與影之觸鬚
// =====================================================================
export function drawNoir(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, tier, thrust } = o;
  drawGear(ctx, o, false);
  // 影之觸鬚
  ctx.globalCompositeOperation = "lighter";
  mirror(ctx, (s) => {
    for (let r = 0; r < 2 + tier; r++) {
      ctx.beginPath();
      const bx = 34 - r * 5;
      const by = 16 + r * 2;
      for (let k = 0; k <= 12; k++) {
        const y = by + k * 5;
        const x = bx - k * 0.9 + Math.sin(t * 4 + k * 0.5 + r * 2 + s) * (2 + k * 0.6);
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = r === 0 ? "rgba(197,139,255,0.5)" : "rgba(120,60,200,0.4)";
      ctx.lineWidth = 3 - r * 0.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  });
  ctx.globalCompositeOperation = "source-over";
  flame(ctx, -8, 20, 24 * thrust, 3.6, t, "#f0d8ff", "#a45cff", "rgba(80,20,160,0)");
  flame(ctx, 8, 20, 24 * thrust, 3.6, t + 0.5, "#f0d8ff", "#a45cff", "rgba(80,20,160,0)");
  // 覺醒：金色披風翼
  if (tier >= 3) {
    mirror(ctx, () => {
      fillPoly(ctx, [[10, -6], [44, 26], [34, 30], [12, 18]], lin(ctx, 10, -6, 44, 26, [[0, "rgba(255,211,107,0.9)"], [1, "rgba(120,60,20,0.5)"]]), "rgba(60,30,0,0.8)", 1);
    });
  }
  // 曼塔翼身
  mirror(ctx, () => {
    fillPoly(ctx, [[0, -42], [9, -24], [36, 8], [39, 20], [25, 15], [13, 24], [0, 16]], lin(ctx, 0, -40, 38, 20, [[0, "#3a1d66"], [0.5, "#150a26"], [1, "#07030f"]]), OUT, 1.4);
    // 金色前緣
    ctx.strokeStyle = "#ffd36b";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0.4, -41);
    ctx.lineTo(9.2, -24);
    ctx.lineTo(36, 8);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,211,107,0.55)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(4, -14);
    ctx.lineTo(28, 10);
    ctx.lineTo(14, 16);
    ctx.stroke();
    if (tier >= 1) fillPoly(ctx, [[36, 8], [45, 14 + tier * 2], [39, 20]], lin(ctx, 36, 8, 45, 20, [[0, "#ffd36b"], [1, "#7a4a10"]]), "rgba(40,20,0,0.9)", 1);
    if (tier >= 2) fillPoly(ctx, [[22, -4], [30, -12], [28, 2]], lin(ctx, 22, -4, 30, -12, [[0, "#ffd36b"], [1, "#7a4a10"]]), "rgba(40,20,0,0.9)", 1);
  });
  // 中脊
  fillPoly(ctx, [[0, -36], [4.6, -10], [3.6, 12], [0, 8], [-3.6, 12], [-4.6, -10]], lin(ctx, -5, 0, 5, 0, [[0, "#1d0e38"], [0.5, "#5a3496"], [1, "#1d0e38"]]));
  // 面具式座艙
  ctx.fillStyle = "#08030f";
  ctx.beginPath();
  ctx.moveTo(-6, -22);
  ctx.quadraticCurveTo(0, -30, 6, -22);
  ctx.quadraticCurveTo(4, -12, 0, -10);
  ctx.quadraticCurveTo(-4, -12, -6, -22);
  ctx.fill();
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#ffd36b";
  ctx.beginPath();
  ctx.moveTo(-4.4, -19);
  ctx.lineTo(-1.2, -17.6);
  ctx.lineTo(-4, -16.4);
  ctx.closePath();
  ctx.moveTo(4.4, -19);
  ctx.lineTo(1.2, -17.6);
  ctx.lineTo(4, -16.4);
  ctx.closePath();
  ctx.fill();
  // 瞳孔寶石
  const p = 0.6 + 0.4 * Math.sin(t * 3.4);
  ctx.fillStyle = rad(ctx, 0, 2, 10, [[0, "rgba(255,255,255,0.95)"], [0.3, "rgba(255,211,107,0.85)"], [1, "rgba(160,80,255,0)"]]);
  ctx.globalAlpha = 0.5 + 0.5 * p;
  ctx.beginPath();
  ctx.arc(0, 2, 10, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // 環繞暗能球
  const orbs = 1 + tier;
  for (let i = 0; i < orbs; i++) {
    const a = t * 1.9 + (i * TAU) / orbs;
    const x = Math.cos(a) * 38;
    const y = Math.sin(a) * 15 - 2;
    const behind = Math.sin(a) < 0;
    if (behind && false) continue;
    ctx.fillStyle = "#07030f";
    ctx.beginPath();
    ctx.arc(x, y, 4.6, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#ffd36b";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = rad(ctx, x, y, 9, [[0, "rgba(200,140,255,0.6)"], [1, "rgba(120,60,200,0)"]]);
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
  if (tier >= 3) {
    ctx.globalCompositeOperation = "lighter";
    ring(ctx, 0, -4, 24, 24, "rgba(255,211,107,0.7)", 1.6, t, t + 4.6);
    ctx.globalCompositeOperation = "source-over";
  }
  drawGear(ctx, o, true);
}

// =====================================================================
// 星輝：模組化飛行形態 <-> 人型機神形態，之間有分解重組的過渡動畫
// =====================================================================
function prismHue(t: number, l = 70) {
  return `hsl(${Math.floor((t * 70) % 360)},90%,${l}%)`;
}

function drawPrismJet(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, tier, thrust } = o;
  flame(ctx, 0, 30, 32 * thrust, 5, t, "#ffffff", "#7cf3ff", "rgba(20,120,255,0)");
  mirror(ctx, () => {
    flame(ctx, 22, 24, 24 * thrust, 3.6, t + 0.3, "#ffffff", "#7cf3ff", "rgba(20,120,255,0)");
    // 連接支架
    fillPoly(ctx, [[5, -2], [19, -4], [19, 8], [5, 10]], lin(ctx, 5, -4, 19, 10, [[0, "#f0f6ff"], [1, "#7f92b0"]]), OUT, 1);
    // 側艙
    fillPoly(ctx, [[19, -16], [26, -12], [26.6, 24], [19, 26]], lin(ctx, 19, 0, 27, 0, [[0, "#8fa0bb"], [0.5, "#ffffff"], [1, "#8fa0bb"]]), OUT, 1.2);
    fillPoly(ctx, [[20.6, -24], [24.6, -14], [20.6, -14]], "#dfe9fa", OUT, 1);
    // 青色接縫
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(124,243,255,0.95)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(22.8, -8);
    ctx.lineTo(22.8, 20);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    if (tier >= 1) fillPoly(ctx, [[26, -2], [34, 8], [26.4, 14]], lin(ctx, 26, -2, 34, 14, [[0, "#ffffff"], [1, "#5da8d8"]]), OUT, 1);
    if (tier >= 2) fillPoly(ctx, [[6, 20], [15, 34], [9, 34]], "#c8d6ec", OUT, 1);
  });
  // 機身
  fillPoly(
    ctx,
    [[0, -34], [5.4, -18], [7.2, 4], [5.6, 24], [0, 32], [-5.6, 24], [-7.2, 4], [-5.4, -18]],
    lin(ctx, -7, 0, 7, 0, [[0, "#8ea0bc"], [0.5, "#ffffff"], [1, "#8ea0bc"]])
  );
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(124,243,255,0.9)";
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(-3, -14);
  ctx.lineTo(-4.4, 20);
  ctx.moveTo(3, -14);
  ctx.lineTo(4.4, 20);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  // 座艙
  ctx.fillStyle = lin(ctx, 0, -20, 0, -2, [[0, "#b9f6ff"], [1, "#0a2c40"]]);
  ctx.beginPath();
  ctx.ellipse(0, -10, 3.2, 7.2, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // 鼻端稜鏡
  const hue = prismHue(t);
  ctx.save();
  ctx.translate(0, -40);
  ctx.rotate(Math.sin(t * 3) * 0.12);
  ctx.fillStyle = hue;
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(4.6, 0);
  ctx.lineTo(0, 9);
  ctx.lineTo(-4.6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(4.6, 0);
  ctx.lineTo(0, 1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rad(ctx, 0, -40, 14, [[0, prismHue(t, 80)], [1, "rgba(0,0,0,0)"]]);
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(0, -40, 14, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  if (tier >= 3) {
    for (let i = 0; i < 3; i++) ring(ctx, 0, -2, 38 + i * 4, 14 + i * 2, prismHue(t + i * 0.9, 70), 1.2, t + i, t + i + 3.8);
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawPrismMecha(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, tier, thrust } = o;
  // 背部推進器與雙腿
  mirror(ctx, () => {
    flame(ctx, 8, 30, 34 * thrust, 4.4, t, "#ffffff", "#ffd66b", "rgba(255,80,20,0)");
    fillPoly(ctx, [[4, 14], [12, 14], [13, 30], [3.6, 30]], lin(ctx, 3, 0, 13, 0, [[0, "#6f7f9a"], [0.5, "#dfe8f8"], [1, "#6f7f9a"]]), OUT, 1.2);
  });
  // 肩砲（朝前）
  mirror(ctx, () => {
    fillPoly(ctx, [[15, -18], [28, -14], [30, 0], [16, 2]], lin(ctx, 15, -18, 30, 2, [[0, "#f5f9ff"], [1, "#7f92b0"]]), OUT, 1.3);
    fillPoly(ctx, [[21, -40], [26, -40], [27, -16], [20, -16]], lin(ctx, 20, 0, 27, 0, [[0, "#485468"], [0.5, "#c2cee2"], [1, "#485468"]]), OUT, 1.1);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = rad(ctx, 23.5, -41, 6, [[0, "#fff"], [1, "rgba(124,243,255,0)"]]);
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 10);
    ctx.beginPath();
    ctx.arc(23.5, -41, 6, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    // 手臂與加特林
    fillPoly(ctx, [[15, 2], [21, 2], [22, 22], [14, 22]], lin(ctx, 14, 0, 22, 0, [[0, "#7f92b0"], [0.5, "#eef4ff"], [1, "#7f92b0"]]), OUT, 1.1);
    for (let i = -1; i <= 1; i++) {
      ctx.fillStyle = "#2a3242";
      ctx.fillRect(16.4 + i * 2.2, -8 + ((t * 30 + i * 3) % 3), 1.6, 12);
    }
    if (tier >= 2) fillPoly(ctx, [[27, -10], [34, -2], [28, 6]], "#dfe9fa", OUT, 1);
  });
  // 軀幹
  fillPoly(ctx, [[0, -20], [10, -14], [12, 6], [7, 18], [-7, 18], [-12, 6], [-10, -14]], lin(ctx, -12, 0, 12, 0, [[0, "#7f92b0"], [0.5, "#ffffff"], [1, "#7f92b0"]]));
  // 胸口反應爐
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rad(ctx, 0, -2, 11, [[0, "#ffffff"], [0.4, prismHue(t * 0.6, 70)], [1, "rgba(0,0,0,0)"]]);
  ctx.globalAlpha = 0.7 + 0.3 * Math.sin(t * 6);
  ctx.beginPath();
  ctx.arc(0, -2, 11, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // 頭部
  fillPoly(ctx, [[0, -32], [5, -26], [4, -20], [-4, -20], [-5, -26]], lin(ctx, 0, -32, 0, -20, [[0, "#ffffff"], [1, "#8ea0bc"]]), OUT, 1.2);
  mirror(ctx, () => {
    fillPoly(ctx, [[3.4, -30], [10, -38], [6, -28]], "#ffd66b", OUT, 0.9);
  });
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#7cf3ff";
  ctx.fillRect(-3.6, -25, 7.2, 1.8);
  ctx.globalCompositeOperation = "source-over";
}

export function drawPrism(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  drawGear(ctx, o, false);
  const m = Math.max(0, Math.min(1, o.morph));
  if (m <= 0.001) {
    drawPrismJet(ctx, o);
  } else if (m >= 0.999) {
    drawPrismMecha(ctx, o);
  } else {
    // 變形過渡：兩種形態交錯 + 旋轉六角光環
    ctx.save();
    ctx.globalAlpha = 1 - m;
    ctx.scale(1 - m * 0.25, 1 + m * 0.15);
    drawPrismJet(ctx, o);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = m;
    ctx.scale(0.75 + m * 0.25, 0.85 + m * 0.15);
    drawPrismMecha(ctx, o);
    ctx.restore();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = prismHue(o.t * 2, 75);
    ctx.lineWidth = 2;
    ctx.globalAlpha = Math.sin(m * Math.PI);
    for (let k = 0; k < 2; k++) {
      ctx.save();
      ctx.rotate(o.t * 6 * (k ? -1 : 1));
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6;
        const r = 30 + k * 12 + m * 14;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  drawGear(ctx, o, true);
}
