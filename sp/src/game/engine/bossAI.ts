// Boss 與中型 Boss 的多階段彈幕腳本：每隻 Boss 三個階段，各有獨立的彈幕語彙
import { H, TAU, W, easeOut, lerp, rand } from "../constants";
import type { Enemy } from "../entities";
import { aim, aimedFan, curtain, delayed, fan, mine, ring, ringGap, rndX, stream } from "./patterns";
import type { Game } from "./Game";

function tk(e: Enemy, i: number, d: number, iv: number): boolean {
  e.tm[i] -= d;
  if (e.tm[i] <= 0) {
    e.tm[i] += iv;
    if (e.tm[i] < -iv) e.tm[i] = 0;
    return true;
  }
  return false;
}

export function updateBoss(g: Game, e: Enemy, dt: number) {
  e.t += dt;
  if (e.flash > 0) e.flash -= dt * 6;
  const d = dt * (e.slow > 0 ? 0.8 : 1);
  if (e.slow > 0) e.slow -= dt;
  const ty = e.bossId % 6 === 3 ? 210 : 185;
  if (e.t < 2.6) {
    e.y = lerp(-160, ty, easeOut(e.t / 2.6));
    e.invuln = true;
    return;
  }
  if (e.tm[6] > 0) {
    e.tm[6] -= dt;
    e.invuln = true;
    e.y += Math.sin(e.t * 40) * 0.6;
    if (e.tm[6] <= 0) e.invuln = false;
    return;
  }
  e.invuln = false;
  const frac = e.hp / e.maxHp;
  const ph = frac < 0.34 ? 2 : frac < 0.67 ? 1 : 0;
  if (ph > e.ph) {
    e.ph = ph;
    e.tm[6] = 1.7;
    for (let i = 0; i < 6; i++) e.tm[i] = 0.8;
    g.bossPhaseChange(e);
    return;
  }
  // 移動
  e.b -= d;
  if (e.b <= 0) {
    e.b = rand(2.4, 4.2);
    e.a = rand(130, W - 130);
  }
  e.x += (e.a - e.x) * Math.min(1, d * 1.1);
  e.y = ty + Math.sin(e.t * 0.8) * 16;
  const A = e.bossId % 6;
  const arms = 2 + (g.diff > 1 ? 1 : 0);
  const x = e.x;
  const y = e.y + 24;
  switch (A) {
    case 0: {
      // 晶冠機神：結晶針、慢速環、水晶雨、螺旋、晶格雷射
      if (tk(e, 0, d, ph === 0 ? 1.7 : 2.5)) aimedFan(g, x, y, 5 + ph * 2, 0.9, 330, 3, 4);
      if (tk(e, 1, d, 3.6)) ring(g, x, y, 16 + ph * 4, 130, 1, 3, rand(TAU));
      if (ph !== 1 && tk(e, 2, d, ph === 0 ? 0.26 : 0.3)) g.spawnEB(rndX(), -10, Math.PI / 2 + rand(-0.08, 0.08), 300, 4, 4);
      if (ph >= 1 && tk(e, 3, d, 0.075)) {
        e.c += 0.42;
        for (let k = 0; k < arms + (ph === 2 ? 1 : 0); k++) g.spawnEB(x, y, e.c + (k * TAU) / (arms + (ph === 2 ? 1 : 0)), 195 + ph * 15, 0, 4);
      }
      if (ph === 2 && tk(e, 4, d, 5.2)) {
        for (const s of [-1, 1]) g.addBeam({ x, y, ang: Math.PI / 2 + s * 0.7, rot: -s * 0.32, len: 1400, w: 30, warn: 1.1, life: 2.2, dmg: 24, color: "#c58bff", follow: e });
      }
      break;
    }
    case 1: {
      // 深藍旗艦：舷側齊射、水雷、魚雷、掃射雷射
      const tur: [number, number][] = [[-52, -10], [52, -10], [-46, 44], [46, 44], [0, 70]];
      const n = ph >= 1 ? 5 : 3;
      if (tk(e, 0, d, ph === 0 ? 1.5 : 1.25)) for (let i = 0; i < n; i++) aimedFan(g, x + tur[i][0], e.y + tur[i][1], 3, 0.5, 340, 4, 3);
      if (tk(e, 1, d, 4)) for (let i = -1; i <= 1; i++) mine(g, x + i * 70, y + 30, Math.PI / 2 + i * 0.25, 240, 1.5, 10, 3);
      if (ph >= 1 && tk(e, 2, d, 2)) g.spawnEB(x, y + 60, aim(g, x, y), 130, 2, 1, { mode: 1, acc: 320, b: 520, r: 11 });
      if (ph >= 1 && tk(e, 3, d, 0.11)) g.spawnEB(x + Math.sin(e.t * 2) * 90, y + 20, Math.PI / 2 + Math.sin(e.t * 3) * 0.4, 260, 1, 3);
      if (ph === 2 && tk(e, 4, d, 6)) {
        g.addBeam({ x, y: y + 30, ang: Math.PI / 2 - 0.8, rot: 0.55, len: 1400, w: 34, warn: 1.1, life: 2.6, dmg: 26, color: "#ff5a3a", follow: e });
        g.spawnEnemy("dart", x - 60, y, { dir: 0 });
        g.spawnEnemy("dart", x + 60, y, { dir: 0 });
      }
      break;
    }
    case 2: {
      // 霜牙冰龍：霜之螺旋、冰刺簾幕、暴雪
      const hx = x + Math.sin(e.t * 1.6) * 0;
      const hy = e.y + 66;
      if (tk(e, 0, d, 0.1 - ph * 0.01)) {
        e.c += 0.33 * (ph === 1 ? -1 : 1);
        g.spawnEB(hx, hy, e.c, 185, 6, 3);
        if (ph >= 1) g.spawnEB(hx, hy, e.c + Math.PI, 185, 6, 6);
      }
      if (tk(e, 1, d, ph === 0 ? 3 : 2.4)) aimedFan(g, hx, hy, 5 + ph * 2, 0.8, 300, 3, 3);
      if (ph >= 1 && tk(e, 2, d, 3.3)) curtain(g, 20, rand(80, W - 80), 62, 190, 3, 3);
      if (ph === 2) {
        if (tk(e, 3, d, 0.085)) g.spawnEB(rndX(), -10, Math.PI / 2, rand(200, 340), 1, 6, { mode: 5, a: rand(2, 4), b: rand(20, 45) });
        if (tk(e, 4, d, 2.4)) ring(g, hx, hy, 22, 160, 6, 3, rand(TAU));
      }
      break;
    }
    case 3: {
      // 熔核巨像：熔岩彈、拳擊震波、隕石雨、暴走螺旋
      if (tk(e, 0, d, ph === 0 ? 1.6 : 1.3)) {
        const n = ph === 0 ? 2 : 3;
        for (let i = 0; i < n; i++) mine(g, x + rand(-60, 60), y + 50, aim(g, x, y) + rand(-0.5, 0.5), rand(220, 300), 1.5, 10, 1);
      }
      if (tk(e, 1, d, 5)) ringGap(g, x, y + 30, 40, 210, 0, 2, aim(g, x, y), 0.36, rand(TAU));
      if (ph >= 1) {
        if (tk(e, 2, d, 0.24)) g.spawnEB(rndX(), -10, Math.PI / 2 + rand(-0.1, 0.1), rand(260, 340), 5, 1, { r: 13 });
        if (tk(e, 3, d, 2.2)) aimedFan(g, x, y, 5, 0.6, 340, 4, 2);
      }
      if (ph === 2) {
        if (tk(e, 4, d, 0.08)) {
          e.c += 0.31;
          for (let k = 0; k < 3; k++) g.spawnEB(x, y + 30, e.c + (k * TAU) / 3, 205, 0, k % 2 ? 1 : 2);
        }
        if (tk(e, 5, d, 6)) curtain(g, 20, rand(80, W - 80), 60, 200, 1, 1);
      }
      break;
    }
    case 4: {
      // 緋紅絕翼：翼尖密集扇形、追蹤飛彈、旋轉十字、花瓣環
      const wx = 100;
      if (tk(e, 0, d, ph === 0 ? 1.3 : 1.05)) {
        for (const s of [-1, 1]) aimedFan(g, x + s * wx, y + 10, 5 + ph * 2, 0.8, 340, 4, 0);
      }
      if (tk(e, 1, d, 3)) for (let i = 0; i < 2 + ph; i++) g.spawnEB(x + (i - 1) * 40, y, aim(g, x, y) + (i - 1) * 0.3, 210, 2, 0, { mode: 2, turn: (i - 1) * 0.5, r: 10 });
      if (ph >= 1 && tk(e, 2, d, 0.06)) {
        e.c += 0.27;
        for (let k = 0; k < 4; k++) g.spawnEB(x, y, e.c + (k * TAU) / 4, 260, 3, 0);
      }
      if (ph >= 1 && tk(e, 3, d, 2.4)) ring(g, x, y, 24, 150, 1, 2, rand(TAU));
      if (ph === 2) {
        if (tk(e, 4, d, 0.9)) {
          e.d += 0.1;
          ring(g, x, y, 30, 180, 0, 0, e.d);
        }
        if (tk(e, 5, d, 4.8)) g.addBeam({ x, y, ang: Math.PI / 2 - 1, rot: 0.6, len: 1400, w: 32, warn: 1.0, life: 2.4, dmg: 26, color: "#ff3b52", follow: e });
      }
      break;
    }
    default: {
      // 天頂王座：缺口天環、旋轉雙雷射、多臂螺旋、熾天花彈幕
      if (tk(e, 0, d, ph === 0 ? 1.25 : 1.8)) {
        ringGap(g, x, y, 30 + ph * 4, 170, 0, 2, aim(g, x, y), 0.32);
        aimedFan(g, x, y, 5, 0.6, 360, 3, 4);
      }
      if (ph >= 1) {
        if (tk(e, 1, d, 0.075)) {
          e.c += 0.36;
          for (let k = 0; k < 3; k++) g.spawnEB(x, y, e.c + (k * TAU) / 3, 200, 1, k % 2 ? 2 : 4);
        }
        if (tk(e, 2, d, 6)) {
          for (const s of [-1, 1]) g.addBeam({ x, y, ang: Math.PI / 2 + s * 0.9, rot: -s * 0.4, len: 1400, w: 32, warn: 1.1, life: 2.6, dmg: 26, color: "#ffd36b", follow: e });
        }
        if (tk(e, 3, d, 0.3)) g.spawnEB(rndX(), -10, Math.PI / 2, rand(240, 340), 4, 4);
      }
      if (ph === 2) {
        if (tk(e, 4, d, 0.07)) {
          e.d += 0.23;
          for (let k = 0; k < 5; k++) g.spawnEB(x, y, e.d + (k * TAU) / 5, 230, 3, 2);
        }
        if (tk(e, 5, d, 3.2)) {
          curtain(g, 20, rand(80, W - 80), 60, 210, 1, 2);
          stream(g, x, y, aim(g, x, y), 6, 300, 30, 3, 0);
        }
      }
    }
  }
  void H;
  void delayed;
  void fan;
}

/** 中型 Boss（每關一隻）：兩階段 */
export function updateMid(g: Game, e: Enemy, d: number, dt: number) {
  if (e.t < 2.2) {
    e.y = lerp(-140, 150, easeOut(e.t / 2.2));
    e.invuln = true;
    return;
  }
  e.invuln = false;
  const ph = e.hp / e.maxHp < 0.5 ? 1 : 0;
  if (ph > e.ph) {
    e.ph = 1;
    g.clearBullets(e.x, e.y, 9999, "none");
    g.fx.ring(e.x, e.y, 20, 200, 0.5, "#ffffff", 6);
    g.flash("#ffffff", 0.3);
    e.tm[6] = 1.0;
  }
  if (e.tm[6] > 0) {
    e.tm[6] -= dt;
    return;
  }
  e.b -= d;
  if (e.b <= 0) {
    e.b = rand(2.2, 3.6);
    e.a = rand(110, W - 110);
  }
  e.x += (e.a - e.x) * Math.min(1, d * 1.0);
  e.y = 150 + Math.sin(e.t * 0.9) * 14;
  const x = e.x;
  const y = e.y + 20;
  const id = e.def.id;
  const col = [0, 1, 3, 2, 0, 4][e.theme % 6];
  if (id === "mid_gunship") {
    if (tk(e, 0, d, ph ? 1.2 : 1.5)) aimedFan(g, x, y, 5 + ph * 2, 0.8, 310, 4, col);
    if (tk(e, 1, d, 3.2)) ring(g, x, y, 14, 140, 0, (col + 1) % 7, rand(TAU));
    if (ph && tk(e, 2, d, 0.1)) {
      e.c += 0.4;
      for (let k = 0; k < 2; k++) g.spawnEB(x, y, e.c + k * Math.PI, 200, 1, col);
    }
  } else if (id === "mid_walker") {
    if (tk(e, 0, d, ph ? 0.9 : 1.2)) mine(g, x + rand(-50, 50), y + 30, Math.PI / 2 + rand(-0.6, 0.6), rand(200, 280), 1.6, 8, col);
    if (tk(e, 1, d, 1.3)) aimedFan(g, x, y, 3 + ph * 2, 0.5, 300, 4, (col + 2) % 7);
    if (ph && tk(e, 2, d, 2.6)) stream(g, x, y, aim(g, x, y), 7, 260, 26, 3, col);
  } else {
    if (tk(e, 0, d, ph ? 4 : 5)) g.addBeam({ x, y, ang: aim(g, x, y) - 0.6, rot: 0.8, len: 1400, w: 32, warn: 1.0, life: 1.2, dmg: 24, color: "#ff3b6b", follow: e });
    if (tk(e, 1, d, 1.4)) aimedFan(g, x, y, 5, 0.9, 290, 4, col);
    if (ph && tk(e, 2, d, 1.8)) g.spawnEB(x, y + 20, aim(g, x, y), 130, 2, 1, { mode: 1, acc: 300, b: 500, r: 11 });
    if (ph && tk(e, 3, d, 3)) ring(g, x, y, 18, 150, 0, (col + 1) % 7, rand(TAU));
  }
}
