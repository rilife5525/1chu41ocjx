// 戰機繪製（上）：緋鴉、蒼槍、翠嵐 —— 每架皆有獨立輪廓與動態
import { TAU } from "../constants";
import { bolt, drawGear, fillPoly, flame, lin, mirror, rad, ring } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";

const OUT = "rgba(10,4,10,0.9)";

// =====================================================================
// 緋鴉：鴉羽層疊的展翼機，翼羽會隨氣流顫動；進化後羽數增加並燃起餘燼
// =====================================================================
export function drawCrow(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  if (o.form === 1) return drawPhoenix(ctx, o);
  const { t, tier, thrust } = o;
  drawGear(ctx, o, false);
  flame(ctx, -4.5, 30, 30 * thrust, 4.2, t, "#ffffff", "#ffb347");
  flame(ctx, 4.5, 30, 30 * thrust, 4.2, t + 0.3, "#ffffff", "#ffb347");
  const n = 4 + Math.min(tier, 2);
  // 尾鰭
  mirror(ctx, () => {
    fillPoly(ctx, [[3, 22], [10, 40], [6, 41], [2, 33]], lin(ctx, 3, 22, 10, 41, [[0, "#5a0a12"], [1, "#e0261c"]]), OUT, 1);
  });
  // 翼羽（由後往前疊，前緣羽在最上層）
  mirror(ctx, (s) => {
    for (let i = n - 1; i >= 0; i--) {
      const k = i / (n - 1);
      const a = 0.16 + k * 1.0 + Math.sin(t * 5 + i * 0.9) * 0.03 + o.bank * 0.1 * s;
      const L = 36 - k * 9 + tier * 2.5;
      const rx = 5;
      const ry = -11 + k * 9;
      const tx = rx + Math.cos(a) * L;
      const ty = ry + Math.sin(a) * L;
      const mx = (rx + tx) / 2;
      const my = (ry + ty) / 2;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      ctx.beginPath();
      ctx.moveTo(rx, ry - 2.8);
      ctx.quadraticCurveTo(mx + nx * -6.5, my + ny * -6.5, tx, ty);
      ctx.quadraticCurveTo(mx + nx * 3.5, my + ny * 3.5, rx, ry + 3);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, rx, ry, tx, ty, [[0, "#3c0710"], [0.45, "#c81d1d"], [1, tier >= 1 ? "#ffb347" : "#ff7a2a"]]);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      if (tier >= 2) {
        ctx.strokeStyle = "rgba(255,225,140,0.75)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(rx + 2, ry);
        ctx.lineTo(mx + nx * -2, my + ny * -2);
        ctx.stroke();
      }
      if (tier >= 1) {
        // 羽尖餘燼
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = rad(ctx, tx, ty, 6, [[0, "rgba(255,230,160,0.95)"], [1, "rgba(255,70,20,0)"]]);
        ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 9 + i);
        ctx.beginPath();
        ctx.arc(tx, ty, 6, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    }
    // 前置小鴨翼
    fillPoly(ctx, [[5, -24], [15, -15], [5, -12]], lin(ctx, 5, -24, 15, -12, [[0, "#ff8a3a"], [1, "#8c1018"]]), OUT, 1);
  });
  // 機身
  const body = lin(ctx, -8, 0, 8, 0, [[0, "#4a0810"], [0.5, "#e02a20"], [1, "#4a0810"]]);
  fillPoly(ctx, [[0, -42], [4.6, -26], [7, -6], [6.4, 16], [3.6, 32], [0, 35], [-3.6, 32], [-6.4, 16], [-7, -6], [-4.6, -26]], body);
  // 背脊高光
  ctx.strokeStyle = "rgba(255,190,120,0.75)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 30);
  ctx.stroke();
  // 座艙
  ctx.fillStyle = lin(ctx, 0, -22, 0, -6, [[0, "#ffcf7a"], [0.5, "#5a1418"], [1, "#150408"]]);
  ctx.beginPath();
  ctx.ellipse(0, -14, 3.6, 8.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1;
  ctx.stroke();
  if (tier >= 3) {
    // 覺醒：頭冠羽與烈焰
    mirror(ctx, (s) => {
      fillPoly(ctx, [[2, -34], [8 + Math.sin(t * 6) * 1.5, -46], [5, -30]], lin(ctx, 2, -34, 8, -46, [[0, "#ff5a1a"], [1, "#ffe9a0"]]), OUT, 0.8);
      void s;
    });
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 6; i++) {
      const p = (t * 1.6 + i / 6) % 1;
      const x = (i % 2 ? 1 : -1) * (14 + (i % 3) * 8);
      const y = -6 + p * 24;
      ctx.fillStyle = rad(ctx, x, y, 7 * (1 - p), [[0, "rgba(255,220,120,0.9)"], [1, "rgba(255,60,20,0)"]]);
      ctx.beginPath();
      ctx.arc(x, y, 7 * (1 - p), 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  drawGear(ctx, o, true);
}

/** 不死鳥形態：金焰羽翼、尾焰飄帶與光環 */
function drawPhoenix(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const t = o.t;
  ctx.save();
  ctx.scale(1.28, 1.28);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rad(ctx, 0, 0, 78, [[0, "rgba(255,210,110,0.7)"], [0.5, "rgba(255,80,20,0.28)"], [1, "rgba(255,40,10,0)"]]);
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, TAU);
  ctx.fill();
  // 光環
  ctx.strokeStyle = "rgba(255,226,140,0.85)";
  ctx.lineWidth = 2;
  ring(ctx, 0, -14, 20, 20, "rgba(255,230,150,0.8)", 2);
  ring(ctx, 0, -14, 27, 27, "rgba(255,120,40,0.6)", 1.2, t, t + 4);
  // 尾焰飄帶
  for (let j = -2; j <= 2; j++) {
    ctx.beginPath();
    for (let k = 0; k <= 14; k++) {
      const y = 22 + k * 5.5;
      const x = j * 5 + Math.sin(t * 7 + k * 0.5 + j) * (2 + k * 0.9);
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = j === 0 ? "rgba(255,240,180,0.9)" : "rgba(255,110,30,0.7)";
    ctx.lineWidth = j === 0 ? 5 : 3;
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  // 焰羽翼
  mirror(ctx, (s) => {
    for (let i = 7; i >= 0; i--) {
      const k = i / 7;
      const a = -0.35 + k * 1.5 + Math.sin(t * 6 + i) * 0.05;
      const L = 56 - k * 12;
      const rx = 4;
      const ry = -12 + k * 6;
      const tx = rx + Math.cos(a) * L;
      const ty = ry + Math.sin(a) * L;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      const mx = (rx + tx) / 2;
      const my = (ry + ty) / 2;
      ctx.beginPath();
      ctx.moveTo(rx, ry - 3);
      ctx.quadraticCurveTo(mx - nx * 8, my - ny * 8, tx, ty);
      ctx.quadraticCurveTo(mx + nx * 4, my + ny * 4, rx, ry + 3);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, rx, ry, tx, ty, [[0, "#fff6c8"], [0.35, "#ffc24a"], [0.75, "#ff4a1a"], [1, "rgba(200,20,10,0.4)"]]);
      ctx.fill();
      ctx.strokeStyle = "rgba(120,20,0,0.7)";
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
    void s;
  });
  // 金色機身
  fillPoly(ctx, [[0, -46], [5, -28], [7.5, -6], [6.5, 16], [3.5, 30], [0, 34], [-3.5, 30], [-6.5, 16], [-7.5, -6], [-5, -28]], lin(ctx, -8, 0, 8, 0, [[0, "#b8620a"], [0.5, "#fff2b0"], [1, "#b8620a"]]), "rgba(90,30,0,0.9)", 1.2);
  // 頭冠
  mirror(ctx, () => {
    fillPoly(ctx, [[1.5, -38], [7 + Math.sin(t * 8) * 2, -54], [4.5, -34]], lin(ctx, 2, -36, 7, -54, [[0, "#ff5a1a"], [1, "#fff2b0"]]), "rgba(90,30,0,0.8)", 0.8);
    fillPoly(ctx, [[4, -30], [13 + Math.sin(t * 8 + 1) * 2, -44], [8, -26]], lin(ctx, 4, -30, 13, -44, [[0, "#ff5a1a"], [1, "#ffd66b"]]), "rgba(90,30,0,0.8)", 0.8);
  });
  ctx.fillStyle = "#ff3a1a";
  ctx.beginPath();
  ctx.ellipse(0, -16, 2.8, 7, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.ellipse(0, -18, 1.2, 3.4, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// =====================================================================
// 蒼槍：極細長針形機身，前置光環、翼側長槍，進化後圍繞浮游光矛
// =====================================================================
export function drawLance(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, tier, thrust } = o;
  drawGear(ctx, o, false);
  // 後方光矛扇（覺醒）
  if (tier >= 3) {
    ctx.globalCompositeOperation = "lighter";
    for (let i = -4; i <= 4; i++) {
      const a = i * 0.2;
      ctx.save();
      ctx.rotate(a);
      ctx.fillStyle = lin(ctx, 0, 6, 0, 56, [[0, "rgba(160,235,255,0.8)"], [1, "rgba(71,194,255,0)"]]);
      ctx.beginPath();
      ctx.moveTo(0, 6);
      ctx.lineTo(3, 30);
      ctx.lineTo(0, 62 + Math.sin(t * 4 + i) * 3);
      ctx.lineTo(-3, 30);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  flame(ctx, 0, 34, 42 * thrust, 5, t, "#ffffff", "#47c2ff", "rgba(0,80,255,0)");
  // 主翼（後掠三角）
  mirror(ctx, () => {
    fillPoly(ctx, [[4, 0], [27, 30], [22, 33], [7, 27]], lin(ctx, 4, 0, 27, 33, [[0, "#e6f6ff"], [0.6, "#3d86c8"], [1, "#12365a"]]), OUT);
    // 翼側長槍
    fillPoly(ctx, [[15 + tier, 14], [17.5 + tier, -12 - tier * 3], [19 + tier, 14]], lin(ctx, 15, 14, 18, -14, [[0, "#1c4f86"], [1, "#eaffff"]]), OUT, 1);
    // 前置鴨翼
    fillPoly(ctx, [[3.5, -18], [13, -8], [4, -6]], lin(ctx, 3, -18, 13, -6, [[0, "#ffffff"], [1, "#4b98d8"]]), OUT, 1);
    // 尾翼
    fillPoly(ctx, [[3, 22], [8, 38], [4, 38], [2.4, 32]], "#2a6cae", OUT, 1);
  });
  // 機身
  fillPoly(
    ctx,
    [[0, -48], [2.8, -34], [5, -12], [5.8, 10], [3.6, 30], [0, 37], [-3.6, 30], [-5.8, 10], [-5, -12], [-2.8, -34]],
    lin(ctx, -6, 0, 6, 0, [[0, "#14416b"], [0.45, "#f2fbff"], [1, "#14416b"]])
  );
  // 光脈
  ctx.globalCompositeOperation = "lighter";
  const pulse = (t * 1.6) % 1;
  ctx.strokeStyle = "rgba(100,215,255,0.9)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -44);
  ctx.lineTo(0, 34);
  ctx.stroke();
  ctx.fillStyle = rad(ctx, 0, 34 - pulse * 76, 9, [[0, "rgba(255,255,255,0.95)"], [1, "rgba(71,194,255,0)"]]);
  ctx.beginPath();
  ctx.arc(0, 34 - pulse * 76, 9, 0, TAU);
  ctx.fill();
  // 前置光環
  const nr = 2 + Math.min(tier, 2);
  for (let i = 0; i < nr; i++) {
    const y = -26 - i * 8;
    ctx.globalAlpha = 0.85 - i * 0.18;
    ring(ctx, 0, y, 10 - i * 1.6 + Math.sin(t * 5 + i) * 0.6, 3.2 - i * 0.4, i % 2 ? "#a8ecff" : "#47c2ff", 1.6);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // 座艙
  ctx.fillStyle = lin(ctx, 0, -20, 0, -4, [[0, "#9be6ff"], [1, "#0a2438"]]);
  ctx.beginPath();
  ctx.ellipse(0, -12, 2.6, 7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // 浮游光矛
  if (tier >= 2) {
    ctx.globalCompositeOperation = "lighter";
    const cnt = tier >= 3 ? 4 : 2;
    for (let i = 0; i < cnt; i++) {
      const a = t * 1.7 + (i * TAU) / cnt;
      const x = Math.cos(a) * 34;
      const y = Math.sin(a) * 10 + 4;
      ctx.save();
      ctx.translate(x, y);
      ctx.fillStyle = lin(ctx, 0, 12, 0, -12, [[0, "rgba(71,194,255,0)"], [1, "#eaffff"]]);
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(2.6, 4);
      ctx.lineTo(0, 12);
      ctx.lineTo(-2.6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.globalCompositeOperation = "source-over";
  }
  drawGear(ctx, o, true);
}

// =====================================================================
// 翠嵐：弦月形飛翼，中央渦輪環，翼尖拖曳風帶；進化後多環與更長風帶
// =====================================================================
export function drawJade(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, tier, thrust } = o;
  drawGear(ctx, o, false);
  // 風帶
  ctx.globalCompositeOperation = "lighter";
  const rib = 2 + Math.min(tier, 2);
  mirror(ctx, (s) => {
    for (let r = 0; r < rib; r++) {
      ctx.beginPath();
      const bx = 33 - r * 4;
      const by = 8 + r * 5;
      for (let k = 0; k <= 12; k++) {
        const y = by + k * 5.6;
        const x = bx + Math.sin(t * 6 + k * 0.6 + r * 1.7 + s) * (1.5 + k * 0.55) + k * 0.6;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = r === 0 ? "rgba(220,255,240,0.75)" : "rgba(61,255,176,0.5)";
      ctx.lineWidth = 2.4 - r * 0.4;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  });
  ctx.globalCompositeOperation = "source-over";
  flame(ctx, 0, 20, 34 * thrust, 8, t, "#ffffff", "#3dffb0", "rgba(0,200,120,0)");
  // 弦月主翼
  mirror(ctx, () => {
    ctx.beginPath();
    ctx.moveTo(3, -22);
    ctx.bezierCurveTo(24, -20, 38, -2, 35, 22);
    ctx.bezierCurveTo(28, 6, 16, 4, 5, 10);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, 3, -22, 35, 22, [[0, "#eafff6"], [0.5, "#2ed398"], [1, "#0c5c40"]]);
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // 翼面紋路
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, -15);
    ctx.bezierCurveTo(22, -14, 31, -2, 30, 14);
    ctx.stroke();
    // 葉形翼尖
    fillPoly(ctx, [[33, 12], [41, 30 + tier * 2], [34, 26], [29, 19]], lin(ctx, 33, 12, 41, 30, [[0, "#3dffb0"], [1, "#0c6a48"]]), OUT, 1);
    if (tier >= 1) fillPoly(ctx, [[20, -16], [28, -30], [26, -14]], lin(ctx, 20, -16, 28, -30, [[0, "#1b9a70"], [1, "#eafff6"]]), OUT, 1);
  });
  // 中央機身
  fillPoly(ctx, [[0, -38], [5.5, -20], [7, 4], [5, 20], [0, 24], [-5, 20], [-7, 4], [-5.5, -20]], lin(ctx, -7, 0, 7, 0, [[0, "#0f6a4a"], [0.5, "#f2fff9"], [1, "#0f6a4a"]]));
  // 渦輪環
  ctx.fillStyle = "#06261c";
  ctx.beginPath();
  ctx.arc(0, 8, 9.5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#7dffcf";
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.globalCompositeOperation = "lighter";
  ctx.save();
  ctx.translate(0, 8);
  ctx.rotate(t * 9);
  for (let i = 0; i < 4 + tier; i++) {
    ctx.rotate(TAU / (4 + tier));
    ctx.fillStyle = "rgba(160,255,220,0.9)";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(4, -4, 8, -1);
    ctx.quadraticCurveTo(4, -1, 0, 1.4);
    ctx.fill();
  }
  ctx.restore();
  if (tier >= 2) {
    ring(ctx, 0, 8, 14, 14, "rgba(61,255,176,0.7)", 1.2, t * 2, t * 2 + 4);
  }
  ctx.globalCompositeOperation = "source-over";
  // 座艙
  ctx.fillStyle = lin(ctx, 0, -28, 0, -10, [[0, "#c9fff0"], [1, "#0a3a2a"]]);
  ctx.beginPath();
  ctx.ellipse(0, -18, 2.8, 7.5, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 0.9;
  ctx.stroke();
  void bolt;
  drawGear(ctx, o, true);
}
