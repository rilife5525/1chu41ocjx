// 敵機行為 AI：每種機型各有獨立移動與攻擊節奏
import { H, W, TAU, rand, clamp } from "../constants";
import type { Enemy } from "../entities";
import { aim, aimedFan, curtain, fan, mine, ring, stream } from "./patterns";
import type { Game } from "./Game";
import { updateMid } from "./bossAI";
import { audio } from "../audio";

const COL_BY_THEME = [0, 1, 3, 2, 0, 4];

/** 讓敵機離場（不給任何獎勵） */
function leave(e: Enemy) {
  e.dead = true;
  e.alpha = -1;
}

function tick(e: Enemy, i: number, dt: number, iv: number, first = 0): boolean {
  if (e.tm[i] === 0 && first > 0) e.tm[i] = first;
  e.tm[i] -= dt;
  if (e.tm[i] <= 0) {
    e.tm[i] += iv;
    if (e.tm[i] < -iv) e.tm[i] = 0;
    return true;
  }
  return false;
}

export function updateEnemy(g: Game, e: Enemy, dt: number) {
  e.t += dt;
  if (e.flash > 0) e.flash -= dt * 6;
  if (e.freeze > 0) {
    e.freeze -= dt;
    return;
  }
  if (e.slow > 0) e.slow -= dt;
  const sl = e.slow > 0 ? 0.5 : 1;
  const d = dt * sl;
  const col = COL_BY_THEME[e.theme % 6];
  const iv = (x: number) => x * e.fireMul;
  const def = e.def;
  const spd = def.spd * g.dm.spd;
  const py = g.p.y;

  switch (def.ai) {
    case "straight": {
      e.y += spd * d;
      if (e.y > 30 && e.y < H * 0.6 && tick(e, 0, d, iv(1.7), 0.5)) aimedFan(g, e.x, e.y + 10, 1, 0, 260, 0, col);
      break;
    }
    case "sine": {
      e.y += spd * d;
      e.x = e.c + Math.sin(e.t * 2.3 + e.d) * 74 * (e.a || 1);
      if (e.y > 30 && e.y < H * 0.6 && tick(e, 0, d, iv(1.5), 0.6)) {
        g.spawnEB(e.x - 8, e.y + 10, Math.PI / 2, 280, 1, col);
        g.spawnEB(e.x + 8, e.y + 10, Math.PI / 2, 280, 1, col);
      }
      break;
    }
    case "swoop": {
      const dir = e.dir || 0;
      if (dir !== 0) {
        e.x += dir * spd * 0.95 * d;
        e.y += Math.sin(e.t * 2.6) * 60 * d + 40 * d;
        if (e.tm[1] === 0 && e.x > 90 && e.x < W - 90) {
          e.tm[1] = 1;
          aimedFan(g, e.x, e.y + 8, 1, 0, 300, 4, col);
        }
        if ((dir > 0 && e.x > W + 60) || (dir < 0 && e.x < -60)) leave(e);
      } else {
        e.y += spd * d;
        e.x += Math.sin(e.t * 3) * 90 * d;
      }
      break;
    }
    case "hover": {
      const ty = e.b || 110;
      if (e.y < ty) e.y += (spd + 60) * d;
      else e.x = e.c + Math.sin(e.t * 0.9) * 46;
      if (e.t > 14) e.y += spd * d * 1.2;
      if (e.y >= ty * 0.8 && e.t <= 14 && tick(e, 0, d, iv(1.9), 0.6)) aimedFan(g, e.x, e.y + 14, 3 + (g.diff > 0 ? 2 : 0), 0.7, 250, 0, col);
      if (e.t > 18 && e.y > H + 40) leave(e);
      break;
    }
    case "spinner": {
      if (e.y < 150) e.y += spd * 1.4 * d;
      else e.x = e.c + Math.sin(e.t * 0.7) * 60;
      if (e.y > 100 && e.t < 16) {
        if (tick(e, 0, d, iv(0.12))) {
          e.a += 0.36;
          g.spawnEB(e.x, e.y, e.a, 200, 1, col);
          g.spawnEB(e.x, e.y, e.a + Math.PI, 200, 1, col);
        }
        if (tick(e, 1, d, iv(3.2), 1)) ring(g, e.x, e.y, 14, 150, 0, (col + 2) % 7);
      }
      if (e.t > 16) e.y += spd * d;
      if (e.y > H + 50) leave(e);
      break;
    }
    case "heavy": {
      if (e.y < 130) e.y += spd * 1.5 * d;
      else e.x = e.c + Math.sin(e.t * 0.5) * 36;
      if (e.y > 90 && e.t < 20) {
        if (tick(e, 0, d, iv(2.6), 0.4)) {
          e.tm[2] = 3;
          e.tm[3] = 0;
        }
        if (e.tm[2] > 0) {
          e.tm[3] -= d;
          if (e.tm[3] <= 0) {
            e.tm[3] = 0.17;
            e.tm[2]--;
            aimedFan(g, e.x, e.y + 16, 3, 0.35, 300, 4, col);
          }
        }
        if (tick(e, 1, d, iv(3.6), 2)) fan(g, e.x, e.y + 10, 9, 1.6, Math.PI / 2, 190, 0, (col + 1) % 7);
      }
      if (e.t > 20) e.y += spd * d;
      if (e.y > H + 60) leave(e);
      break;
    }
    case "dive": {
      if (e.a === 0) {
        // 蓄力階段
        e.y += (e.y < e.b ? spd * 0.5 : 0) * d;
        if (e.b === 0) e.b = rand(90, 220);
        if (e.y >= e.b - 4 || e.t > 1.6) {
          e.a = 1;
          const ang = aim(g, e.x, e.y);
          e.vx = Math.cos(ang) * spd * 1.4;
          e.vy = Math.sin(ang) * spd * 1.4;
        }
      } else {
        e.x += e.vx * d;
        e.y += e.vy * d;
        if (e.y > H + 60 || e.x < -80 || e.x > W + 80 || e.y < -120) leave(e);
      }
      break;
    }
    case "turret": {
      e.y += 60 * g.bgSpeed * d;
      if (e.y > 20 && e.y < H * 0.72 && tick(e, 0, d, iv(1.5), rand(0.2, 1))) {
        aimedFan(g, e.x, e.y, g.diff > 0 ? 3 : 1, 0.4, 250, 4, col);
      }
      if (e.y > H + 40) leave(e);
      break;
    }
    case "mine": {
      const dir = e.x < W / 2 ? 1 : -1;
      e.dir = dir;
      e.x += dir * spd * d;
      if (tick(e, 0, d, iv(1.05), 0.3)) mine(g, e.x, e.y + 10, Math.PI / 2, 120, 2.0, 8, col);
      if (tick(e, 1, d, iv(2.4), 1)) aimedFan(g, e.x, e.y, 3, 0.5, 260, 0, (col + 1) % 7);
      if (e.x > W + 90 || e.x < -90) leave(e);
      break;
    }
    case "sniper": {
      const ty = 120 + (e.uid % 3) * 26;
      if (e.y < ty) e.y += spd * 1.6 * d;
      else e.x = clamp(e.x + Math.sin(e.t * 0.8 + e.uid) * 22 * d, 30, W - 30);
      if (e.y >= ty - 4 && e.t < 18) {
        if (e.tm[1] > 0) {
          e.tm[1] -= d;
          if (e.tm[1] <= 0) {
            audio.sfx("laser", 0.1);
            for (let i = 0; i < 3; i++) g.spawnEB(e.x, e.y + 12, e.a, 560 + i * 60, 3, col);
          }
        } else if (tick(e, 0, d, iv(2.8), 0.6)) {
          e.a = aim(g, e.x, e.y);
          e.tm[1] = 0.85;
          g.addBeam({ x: e.x, y: e.y, ang: e.a, len: 1400, w: 3, warn: 0.85, life: 0.04, dmg: 0, color: "#ff5a6e", follow: e });
        }
      }
      if (e.t > 18) e.y += spd * d;
      if (e.y > H + 40) leave(e);
      break;
    }
    case "laser": {
      if (e.y < 140) e.y += spd * 1.4 * d;
      else e.x = e.c + Math.sin(e.t * 0.5) * 70;
      if (e.y > 100 && e.t < 24) {
        if (tick(e, 0, d, iv(5), 1.2)) {
          const a = aim(g, e.x, e.y);
          g.addBeam({ x: e.x, y: e.y + 20, ang: a - 0.5 * (e.uid % 2 ? 1 : -1), rot: 0.9 * (e.uid % 2 ? 1 : -1), len: 1400, w: 32, warn: 1.0, life: 1.0, dmg: 24, color: "#ff3b6b", follow: e });
        }
        if (tick(e, 1, d, iv(1.7), 1)) aimedFan(g, e.x, e.y + 16, 5, 0.9, 250, 4, col);
      }
      if (e.t > 24) e.y += spd * d;
      if (e.y > H + 70) leave(e);
      break;
    }
    case "ghost": {
      // 狀態：0 顯形攻擊 1 淡出 2 傳送淡入
      if (e.a === 0) {
        e.alpha = Math.min(1, e.alpha + dt * 3);
        e.invuln = false;
        e.y += 20 * d;
        if (tick(e, 0, d, iv(1.4), 0.5)) ring(g, e.x, e.y, 10, 170, 0, col, rand(TAU));
        if (e.t % 4 > 3.2 || e.t > 20) e.a = 1;
      } else if (e.a === 1) {
        e.alpha -= dt * 3;
        e.invuln = true;
        if (e.alpha <= 0.12) {
          e.alpha = 0.12;
          e.x = clamp(g.p.x + rand(-160, 160), 40, W - 40);
          e.y = clamp(py - rand(260, 420), 70, 330);
          e.a = 2;
          e.tm[3] = 0.4;
        }
      } else {
        e.tm[3] -= dt;
        if (e.tm[3] <= 0) {
          e.a = 0;
          e.t = (Math.floor(e.t / 4) + 1) * 4 - 3.9;
          aimedFan(g, e.x, e.y, 5, 0.9, 300, 4, col);
        }
      }
      if (e.t > 22) e.y += spd * 2 * d;
      if (e.y > H + 40) leave(e);
      break;
    }
    case "carrier": {
      if (e.y < 105) e.y += spd * 1.6 * d;
      else e.x = e.c + Math.sin(e.t * 0.4) * 60;
      if (e.y > 80 && e.t < 24) {
        if (tick(e, 0, d, iv(3.6), 1)) {
          g.spawnEnemy("scout", e.x - 26, e.y + 30, { dir: 0 });
          g.spawnEnemy("scout", e.x + 26, e.y + 30, { dir: 0 });
          if (g.diff > 0) g.spawnEnemy("dart", e.x, e.y + 36, { dir: 0 });
        }
        if (tick(e, 1, d, iv(2.1), 0.5)) aimedFan(g, e.x, e.y + 20, 5, 1.0, 240, 0, col);
      }
      if (e.t > 24) e.y += spd * d;
      if (e.y > H + 80) leave(e);
      break;
    }
    case "aegis": {
      const ty = e.b || 130;
      if (e.y < ty) e.y += spd * 1.5 * d;
      else e.x = clamp(e.c + Math.sin(e.t * 1.1 + e.uid) * 90, 40, W - 40);
      if (e.y > ty - 10 && e.t < 15 && tick(e, 0, d, iv(1.5), 0.6)) aimedFan(g, e.x, e.y + 12, 3, 0.5, 280, 4, col);
      if (e.t > 15) e.y += spd * d;
      if (e.y > H + 50) leave(e);
      break;
    }
    case "orbit": {
      const cx = W / 2 + Math.sin(e.t * 0.3) * 60;
      e.b += 52 * d; // 中心 y 下沉量
      const r = 78;
      const a = e.a + e.t * 1.7;
      e.x = cx + Math.cos(a) * r;
      e.y = -30 + e.b + Math.sin(a) * r * 0.5;
      if (e.y > 20 && e.y < H * 0.6 && tick(e, 0, d, iv(2.2), 0.4 + (e.a % 1))) aimedFan(g, e.x, e.y, 1, 0, 250, 0, col);
      if (e.y > H + 60) leave(e);
      break;
    }
    case "mid": {
      updateMid(g, e, d, dt);
      break;
    }
    default:
      e.y += spd * d;
  }
  void stream;
  void curtain;
}
