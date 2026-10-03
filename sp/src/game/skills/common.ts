// 機體技能共用介面與小工具
import type { Game } from "../engine/Game";
import type { Enemy, Fx, PBullet } from "../entities";
import { bolt } from "../render/shipUtil";

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
  updateBullet?(g: Game, b: PBullet, dt: number): void;
  drawUnder?(g: Game, ctx: CanvasRenderingContext2D): void;
  drawOver?(g: Game, ctx: CanvasRenderingContext2D): void;
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
