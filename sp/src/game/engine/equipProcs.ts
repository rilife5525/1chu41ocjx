// 裝備固有技：SSR／UR 裝備在戰鬥中定時自動觸發的被動技能
import { H, TAU, W, clamp, rand } from "../constants";
import { PROCS } from "../data/equipment";
import { PAL } from "../render/fx";
import { glow } from "../render/sprites";
import { mkFx } from "../skills/common";
import { audio } from "../audio";
import type { Game } from "./Game";

export function updateProcs(g: Game, dt: number) {
  const p = g.p;
  for (const pr of p.procs) {
    pr.t -= dt;
    if (pr.t > 0) continue;
    const def = PROCS[pr.id];
    if (!def) continue;
    // 無目標時延後觸發（攻擊型）
    const needTarget = ["orbital", "meteor", "quake", "reaper"].includes(pr.id);
    if (needTarget && !g.enemies.some((e) => !e.dead && e.y > 0)) {
      pr.t = 0.6;
      continue;
    }
    pr.t = def.interval * (0.6 + 0.4 * p.s.cdMul);
    g.fx.text(p.x, p.y - 46, def.name, def.color, 16, 0.9);
    run(g, pr.id);
  }
}

function targets(g: Game, n: number) {
  const list = g.enemies.filter((e) => !e.dead && e.y > 0 && e.alpha >= 0).sort((a, b) => Number(b.boss) * 99999 + b.hp - (Number(a.boss) * 99999 + a.hp));
  const out = list.slice(0, n);
  return out;
}

function run(g: Game, id: string) {
  const p = g.p;
  const L = g.level;
  switch (id) {
    case "orbital": {
      for (const e of targets(g, 3)) {
        const x = e.x;
        const y = e.y;
        let t = 0;
        mkFx(
          g,
          1,
          (dt) => {
            t += dt;
            if (t > 0.4 && t - dt <= 0.4) {
              g.damageEnemy(e, 70 + L * 9, { noText: false });
              g.aoe(x, y, 60, 40 + L * 5, { pal: "cyan", noText: true, skip: e.uid });
              audio.sfx("laser", 0.1);
            }
            return t < 0.75;
          },
          (ctx) => {
            ctx.globalCompositeOperation = "lighter";
            if (t < 0.4) {
              ctx.strokeStyle = `rgba(124,243,255,${0.5 + 0.4 * Math.sin(t * 40)})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(e.alive ? e.x : x, e.alive ? e.y : y, 30 * (1 - t / 0.4) + 10, 0, TAU);
              ctx.stroke();
            } else {
              const a = 1 - (t - 0.4) / 0.35;
              const gr = ctx.createLinearGradient(x - 22, 0, x + 22, 0);
              gr.addColorStop(0, "rgba(124,243,255,0)");
              gr.addColorStop(0.5, `rgba(255,255,255,${a})`);
              gr.addColorStop(1, "rgba(124,243,255,0)");
              ctx.fillStyle = gr;
              ctx.fillRect(x - 22, 0, 44, y + 10);
            }
            ctx.globalCompositeOperation = "source-over";
          }
        );
      }
      break;
    }
    case "mend": {
      g.heal(p.maxHp * 0.07);
      g.clearBullets(p.x, p.y, 190, "none");
      g.fx.ring(p.x, p.y, 10, 190, 0.5, "#7dffb2", 5);
      audio.sfx("pickup");
      break;
    }
    case "quake": {
      g.aoe(p.x, p.y, 240, 140 + L * 12, { pal: "gold", noText: true });
      for (const e of g.enemies) if (!e.boss && Math.hypot(e.x - p.x, e.y - p.y) < 240) e.y -= 40;
      g.fx.ring(p.x, p.y, 10, 240, 0.5, "#ffb347", 8);
      g.fx.ring(p.x, p.y, 10, 190, 0.4, "#ffffff", 4);
      g.shake(5, 0.2);
      audio.sfx("boom_m");
      break;
    }
    case "meteor": {
      const tg = targets(g, 7);
      for (let i = 0; i < 7; i++) {
        const e = tg[i % Math.max(1, tg.length)];
        const tx = e ? e.x + rand(-30, 30) : rand(60, W - 60);
        const ty = e ? e.y : rand(120, 500);
        const delay = i * 0.1;
        let t = -delay;
        const sx = tx + 260;
        mkFx(
          g,
          1,
          (dt) => {
            t += dt;
            if (t >= 0.45) {
              g.aoe(tx, ty, 72, 110 + L * 10, { pal: "fire", noText: true });
              g.shake(3, 0.1);
              return false;
            }
            return true;
          },
          (ctx) => {
            if (t < 0) return;
            const k = t / 0.45;
            const x = sx + (tx - sx) * k;
            const y = -60 + (ty + 60) * k;
            ctx.globalCompositeOperation = "lighter";
            ctx.strokeStyle = "rgba(255,170,70,0.8)";
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + (sx - tx) * 0.12, y - (ty + 60) * 0.12);
            ctx.stroke();
            ctx.drawImage(glow("#ff8a2a", 64), x - 20, y - 20, 40, 40);
            ctx.globalCompositeOperation = "source-over";
          }
        );
      }
      audio.sfx("whoosh");
      break;
    }
    case "aegis": {
      p.shield = Math.min(3, p.shield + 1);
      p.maxShield = Math.max(p.maxShield, p.shield);
      g.fx.ring(p.x, p.y, 10, 60, 0.4, "#c8e8ff", 4);
      audio.sfx("pickup");
      break;
    }
    case "nova": {
      const n = 18;
      for (let i = 0; i < n; i++) g.spawnPB(p.x, p.y, (i * TAU) / n, 760, 22, 34 + L * 4, { r: 8, pierce: 99, life: 1.2, src: 2 });
      g.fx.ring(p.x, p.y, 8, 120, 0.4, "#ff5ad0", 6);
      g.fx.explosion(p.x, p.y, 22, { ...PAL.red, mid: "#ff5ad0" });
      audio.sfx("boom_s");
      break;
    }
    case "chrono": {
      g.bulletSlow = 0.45;
      g.bulletSlowT = 3;
      g.tint("#7c9bff", 0.2, 3);
      g.fx.ring(p.x, p.y, 10, 500, 0.7, "#9fb4ff", 6);
      audio.sfx("whoosh");
      break;
    }
    case "halo": {
      let t = 0;
      audio.sfx("active");
      mkFx(
        g,
        1,
        (dt) => {
          t += dt;
          if (Math.floor(t * 10) !== Math.floor((t - dt) * 10)) {
            g.aoe(p.x, p.y, 92, 30 + L * 3, { noFx: true, noText: true });
            g.clearBullets(p.x, p.y, 80, "none");
          }
          return t < 4;
        },
        (ctx) => {
          const a = clamp(Math.min(t / 0.3, (4 - t) / 0.4), 0, 1);
          ctx.globalCompositeOperation = "lighter";
          for (let i = 0; i < 6; i++) {
            const an = t * 6 + (i * TAU) / 6;
            const x = p.x + Math.cos(an) * 74;
            const y = p.y + Math.sin(an) * 74;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(an + Math.PI / 2);
            ctx.globalAlpha = a;
            ctx.fillStyle = "#ffe45c";
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.lineTo(6, 4);
            ctx.lineTo(0, 12);
            ctx.lineTo(-6, 4);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
          ctx.globalAlpha = a * 0.5;
          ctx.strokeStyle = "#fff0b0";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 74, 0, TAU);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      );
      break;
    }
    case "reaper": {
      let n = 0;
      for (const e of g.enemies) {
        if (e.dead || e.y < 0 || e.alpha < 0) continue;
        if (e.boss) {
          g.damageEnemy(e, e.maxHp * 0.03 + 200);
          n++;
        } else if (e.hp / e.maxHp < 0.25 && !e.def.mid) {
          g.damageEnemy(e, e.hp + e.shield + 1, { noText: true });
          n++;
        }
      }
      let t = 0;
      audio.sfx("lightning");
      g.flash("#ff3b52", 0.3);
      mkFx(
        g,
        2,
        (dt) => {
          t += dt;
          return t < 0.5;
        },
        (ctx) => {
          const a = 1 - t / 0.5;
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = `rgba(255,59,82,${a})`;
          ctx.lineWidth = 10 * a + 2;
          for (let i = 0; i < 3; i++) {
            const k = clamp(t / 0.15 - i * 0.2, 0, 1);
            ctx.beginPath();
            ctx.moveTo(-40, 160 + i * 300);
            ctx.lineTo(-40 + (W + 80) * k, 160 + i * 300 + 260 * k * (i % 2 ? -1 : 1));
            ctx.stroke();
          }
          ctx.globalCompositeOperation = "source-over";
        }
      );
      void n;
      void H;
      break;
    }
  }
}
