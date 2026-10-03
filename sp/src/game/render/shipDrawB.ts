// 戰機繪製（下）：佔位骨架 —— 外觀血肉已清空，三個機體統一畫中性機身輪廓。
// 新增／改寫外觀時照此結構：開 drawGear(ctx,o,false)、於中心原點（機首朝上）繪製、結 drawGear(ctx,o,true)；進化用 o.tier，形態用 o.form／o.morph。
import { TAU } from "../constants";
import { fillPoly, flame, lin, mirror, drawGear } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";

const OUT = "rgba(10,4,10,0.9)";

/** 中性佔位機身：只證明接線可用，不含任何機體特定造型 */
function placeholderShip(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, thrust, tier } = o;
  drawGear(ctx, o, false);
  // 尾焰
  flame(ctx, 0, 28, 30 * thrust, 4.5, t, "#ffffff", o.color2);
  // 主翼（左右對稱，隨進化微張）
  const wy = 16 + Math.min(tier, 3) * 2;
  mirror(ctx, () => {
    fillPoly(ctx, [[4, 0], [14 + wy, 26], [14 + wy, 30], [6, 24]], lin(ctx, 4, 0, 14 + wy, 30, [[0, o.color2], [1, o.color]]), OUT, 1);
  });
  // 機身
  fillPoly(ctx, [[0, -34], [5, -14], [6.5, 8], [4, 28], [0, 34], [-4, 28], [-6.5, 8], [-5, -14]], lin(ctx, -7, 0, 7, 0, [[0, o.color], [0.5, o.color2], [1, o.color]]), OUT, 1.2);
  // 座艙
  ctx.fillStyle = o.color2;
  ctx.beginPath();
  ctx.ellipse(0, -12, 2.6, 7, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = OUT;
  ctx.lineWidth = 1;
  ctx.stroke();
  drawGear(ctx, o, true);
}

export function drawVolt(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  placeholderShip(ctx, o);
}

export function drawNoir(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  placeholderShip(ctx, o);
}

export function drawPrism(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  placeholderShip(ctx, o);
}
