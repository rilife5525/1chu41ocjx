// 環境災害事件：隕石雨、落雷、強風、雷射網格、魚雷、機群突襲
import { H, W, rand, TAU } from "../constants";
import { audio } from "../audio";
import type { Game } from "./Game";

export interface Hazard {
  name: string;
  t: number;
  dur: number;
  tm: number;
  aux: number;
  dir: number;
}

export const HAZARD_INFO: Record<string, { name: string; sub: string; color: string }> = {
  meteor: { name: "隕石雨", sub: "注意頭頂墜落物", color: "#ffb347" },
  lightning: { name: "雷暴警報", sub: "閃避落雷光柱", color: "#8fb8ff" },
  gale: { name: "強風亂流", sub: "機體會被風吹偏", color: "#7dffcf" },
  laserGrid: { name: "掃描雷射", sub: "兩側雷射網掃射", color: "#ff5a6e" },
  torpedo: { name: "魚雷齊射", sub: "自下方湧出的魚雷", color: "#ff9a3d" },
  rush: { name: "機群突襲", sub: "大量敵機湧入", color: "#ff3bd0" },
};

export function startHazard(g: Game, name: string, dur: number) {
  const info = HAZARD_INFO[name];
  if (!info) return;
  g.hazards.push({ name, t: 0, dur, tm: 0.5, aux: 0, dir: Math.random() < 0.5 ? 1 : -1 });
  g.cb.onBanner?.("HAZARD", `${info.name}｜${info.sub}`, info.color);
  audio.sfx("warning", 1);
}

const METEOR_COL = [1, 1, 3, 1, 0, 4];

export function updateHazards(g: Game, dt: number) {
  for (let i = g.hazards.length - 1; i >= 0; i--) {
    const h = g.hazards[i];
    h.t += dt;
    h.tm -= dt;
    const end = h.t >= h.dur;
    switch (h.name) {
      case "meteor": {
        if (!end && h.tm <= 0) {
          h.tm = 0.44;
          const col = METEOR_COL[(g.stage ? g.stage.theme : g.endlessTheme) % 6];
          g.spawnEB(rand(30, W - 30), -30, Math.PI / 2 + rand(-0.18, 0.18), rand(230, 340), 5, col, { r: 14 });
          if (Math.random() < 0.4) g.spawnEB(rand(30, W - 30), -30, Math.PI / 2 + rand(-0.1, 0.1), rand(260, 380), 2, col, { r: 9 });
        }
        break;
      }
      case "lightning": {
        if (!end && h.tm <= 0) {
          h.tm = 2.7;
          const n = 3;
          const base = rand(40, W - 40);
          for (let k = 0; k < n; k++) {
            const x = (base + (k * W) / n + rand(-30, 30) + W) % W;
            g.addBeam({ x, y: -10, ang: Math.PI / 2, len: H + 40, w: 48, warn: 1.0, life: 0.32, dmg: 28, color: "#cfe2ff", follow: null, thunder: true });
          }
        }
        break;
      }
      case "gale": {
        if (h.tm <= 0) {
          h.tm = 3.6;
          h.dir = -h.dir;
        }
        g.wind = end ? 0 : h.dir * 130 * Math.min(1, h.t / 0.8);
        g.bg.wind = g.wind;
        break;
      }
      case "laserGrid": {
        if (!end && h.tm <= 0) {
          h.tm = 6.2;
          const y1 = rand(90, 260);
          const y2 = rand(90, 260);
          g.addBeam({ x: 0, y: y1, ang: 0.15, rot: 0.32, len: 1300, w: 26, warn: 1.2, life: 3.6, dmg: 22, color: "#ff5a6e", follow: null });
          g.addBeam({ x: W, y: y2, ang: Math.PI - 0.15, rot: -0.32, len: 1300, w: 26, warn: 1.2, life: 3.6, dmg: 22, color: "#ff5a6e", follow: null });
        }
        break;
      }
      case "torpedo": {
        if (!end && h.tm <= 0) {
          h.tm = 2.3;
          for (let k = 0; k < 3; k++) {
            const x = rand(40, W - 40);
            g.addBeam({ x, y: H, ang: -Math.PI / 2, len: H, w: 14, warn: 0.9, life: 0.04, dmg: 0, color: "#ffb347", follow: null });
            g.later(0.9, () => g.spawnEB(x, H + 20, -Math.PI / 2, 500, 2, 1, { r: 11, mode: 1, acc: 120, b: 640 }));
          }
        }
        break;
      }
      case "rush": {
        if (!end && h.tm <= 0) {
          h.tm = 0.3;
          const dir = Math.random() < 0.5 ? 1 : -1;
          g.spawnEnemy("dart", dir > 0 ? -30 : W + 30, rand(70, 260), { dir });
          if (Math.random() < 0.45) g.spawnEnemy("kami", rand(30, W - 30), -30, {});
        }
        break;
      }
    }
    if (end) {
      if (h.name === "gale") {
        g.wind = 0;
        g.bg.wind = 0;
      }
      g.hazards.splice(i, 1);
    }
  }
  void TAU;
}
