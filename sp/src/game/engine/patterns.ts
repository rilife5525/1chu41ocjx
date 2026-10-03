// 敵方彈幕樣式庫：環形、扇形、瞄準、簾幕、地雷等基本單元，供敵機與 Boss 組合
import { TAU, rand, W } from "../constants";
import type { EBullet } from "../entities";
import type { Game } from "./Game";

export const aim = (g: Game, x: number, y: number) => Math.atan2(g.p.y - y, g.p.x - x);

export function ring(g: Game, x: number, y: number, n: number, spd: number, type = 0, color = 0, off = 0, o?: Partial<EBullet>) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) g.spawnEB(x, y, off + (i * TAU) / n, spd, type, color, o);
}

/** 帶缺口的環形彈幕（缺口朝向 gapAng） */
export function ringGap(g: Game, x: number, y: number, n: number, spd: number, type: number, color: number, gapAng: number, gapW: number, off = 0) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) {
    const a = off + (i * TAU) / n;
    let d = Math.abs(((a - gapAng + Math.PI * 3) % TAU) - Math.PI);
    d = Math.PI - d;
    if (Math.abs(d) < gapW) continue;
    g.spawnEB(x, y, a, spd, type, color);
  }
}

export function fan(g: Game, x: number, y: number, n: number, spread: number, ang: number, spd: number, type = 0, color = 0, o?: Partial<EBullet>) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) {
    const a = n === 1 ? ang : ang + (i / (n - 1) - 0.5) * spread;
    g.spawnEB(x, y, a, spd, type, color, o);
  }
}

export function aimedFan(g: Game, x: number, y: number, n: number, spread: number, spd: number, type = 0, color = 0, o?: Partial<EBullet>) {
  fan(g, x, y, n, spread, aim(g, x, y), spd, type, color, o);
}

/** 連續數發同方向、速度遞增的彈流 */
export function stream(g: Game, x: number, y: number, ang: number, n: number, spd0: number, dSpd: number, type = 0, color = 0) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) g.spawnEB(x, y, ang, spd0 + dSpd * i, type, color);
}

/** 橫向簾幕：整排彈幕向下，留出一個缺口 */
export function curtain(g: Game, y: number, gapX: number, gapW: number, spd: number, type = 1, color = 0) {
  const step = 30;
  for (let x = 14; x < W; x += step) {
    if (Math.abs(x - gapX) < gapW) continue;
    g.spawnEB(x, y, Math.PI / 2, spd, type, color);
  }
}

/** 地雷彈：減速停下後引爆成環形彈幕 */
export function mine(g: Game, x: number, y: number, ang: number, spd: number, fuse: number, n: number, color = 1) {
  g.spawnEB(x, y, ang, spd, 5, color, { mode: 3, b: fuse, a: n, r: 13 });
}

/** 延遲起動彈：先懸停再朝指定方向加速 */
export function delayed(g: Game, x: number, y: number, ang: number, delay: number, acc: number, type = 0, color = 0) {
  g.spawnEB(x, y, ang, 0, type, color, { mode: 4, a: delay, acc, b: 460 });
}

export function rndX() {
  return rand(24, W - 24);
}
