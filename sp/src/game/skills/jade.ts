// 翠嵐（星紋「風馭」）：螺旋風刃／順風擦彈／旋風輪舞／翠龍降臨
import { H, TAU, W, clamp, easeOut, rand } from "../constants";
import { audio } from "../audio";
import { evoTier } from "../data/ships";
import { PAL } from "../render/fx";
import { glow } from "../render/sprites";
import { boltFx, mkFx } from "./common";
import type { ShipKit } from "./common";

const windMax = (pl: number) => 6 + pl + (evoTier(pl) >= 1 ? 4 : 0);

export const jadeKit: ShipKit = {
  init(g) {
    g.p.k = { vol: 0, wind: 0, windT: 0, decay: 0 };
  },

  // ---------- 武裝：螺旋風刃 ----------
  fire(g) {
    const p = g.p;
    const wl = g.lvl("weapon");
    const tier = evoTier(wl);
    const pl = g.lvl("passive");
    const w = p.k.wind as number;
    p.fireT += 0.115 / (p.s.rate * (1 + w * 0.02));
    p.k.vol++;
    audio.sfx("shoot2", 0.06);
    const n = Math.min(8, 2 + Math.floor(p.power / 2) + p.s.extra + (tier >= 1 ? 2 : 0));
    const full = w >= windMax(pl) && evoTier(pl) >= 3;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const k = Math.floor(i / 2);
      const a = -Math.PI / 2 + side * (0.04 + k * 0.08);
      g.spawnPB(p.x + side * (8 + k * 6), p.y - 20, a, 920, 5, 9.5 + wl * 1.2, {
        r: 11, kind: 1, a: side, b: 200, c: 7.5, pierce: 2 + (full ? 3 : 0), homing: full ? 2 : 0, life: 1.05, scale: 1,
      });
    }
  },

  // ---------- 被動：順風擦彈 ----------
  update(g, dt) {
    const p = g.p;
    const pl = g.lvl("passive");
    const tier = evoTier(pl);
    const max = windMax(pl);
    p.k.windT -= dt;
    if (p.k.windT <= 0 && p.k.wind > 0) {
      p.k.decay -= dt;
      if (p.k.decay <= 0) {
        p.k.decay = 0.6;
        p.k.wind--;
      }
    }
    p.k.bonus = p.k.wind * 0.022;
    p.speedMul = 1 + p.k.wind * 0.012 + (tier >= 2 && p.k.wind >= max ? 0.25 : 0);
  },

  onGraze(g) {
    const p = g.p;
    const pl = g.lvl("passive");
    p.k.wind = Math.min(windMax(pl), p.k.wind + 1);
    p.k.windT = evoTier(pl) >= 1 ? 4.5 : 3;
    p.k.decay = 0.6;
  },

  onHit(g, b, e) {
    const tier = evoTier(g.lvl("weapon"));
    if (!e.boss) e.y -= 5;
    if (tier >= 2 && b.src === 0 && Math.random() < 0.18) g.spawnPB(b.x, b.y, rand(TAU), 460, 6, 6 + g.lvl("weapon"), { r: 8, homing: 4, life: 1.3, src: 2, pierce: 1 });
  },

  drawUnder(g, ctx) {
    const p = g.p;
    const w = p.k.wind as number;
    if (w < 1) return;
    ctx.globalCompositeOperation = "lighter";
    const n = Math.min(6, 1 + Math.floor(w / 2));
    for (let i = 0; i < n; i++) {
      const a = g.t * (3 + i * 0.4) + (i * TAU) / n;
      ctx.strokeStyle = `rgba(150,255,210,${0.35 + w / windMax(g.lvl("passive")) * 0.4})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 34 + i * 4, a, a + 1.4);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
  },

  // ---------- 主動：旋風輪舞 ----------
  castActive(g) {
    const p = g.p;
    const al = g.lvl("active");
    const tier = evoTier(al);
    const N = 3 + (tier >= 1 ? 1 : 0) + (al >= 6 ? 1 : 0);
    const dur = 6 + (tier >= 1 ? 1 : 0);
    const D = 30 + al * 12;
    audio.sfx("active");
    type Disc = { x: number; y: number; vx: number; vy: number; rot: number; hit: number; trail: [number, number][] };
    const discs: Disc[] = [];
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + (i - (N - 1) / 2) * 0.55;
      discs.push({ x: p.x, y: p.y - 20, vx: Math.cos(a) * 540, vy: Math.sin(a) * 540, rot: rand(TAU), hit: 0, trail: [] });
    }
    let t = 0;
    let ret = 0;
    const R = 46;
    mkFx(
      g,
      1,
      (dt) => {
        t += dt;
        const returning = t > dur;
        if (returning) ret += dt;
        for (const d of discs) {
          d.rot += dt * 16;
          d.hit -= dt;
          d.trail.push([d.x, d.y]);
          if (d.trail.length > 10) d.trail.shift();
          if (!returning) {
            if (tier >= 2) {
              const e = g.nearest(d.x, d.y, 9999);
              if (e) {
                const ax = e.x - d.x;
                const ay = e.y - d.y;
                const l = Math.hypot(ax, ay) || 1;
                d.vx += (ax / l) * 320 * dt;
                d.vy += (ay / l) * 320 * dt;
                const s = Math.hypot(d.vx, d.vy);
                if (s > 600) {
                  d.vx *= 600 / s;
                  d.vy *= 600 / s;
                }
              }
            }
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            if (d.x < R) { d.x = R; d.vx = Math.abs(d.vx); }
            if (d.x > W - R) { d.x = W - R; d.vx = -Math.abs(d.vx); }
            if (d.y < R + 10) { d.y = R + 10; d.vy = Math.abs(d.vy); }
            if (d.y > H - R - 20) { d.y = H - R - 20; d.vy = -Math.abs(d.vy); }
          } else {
            const k = clamp(ret / 0.6, 0, 1);
            const ax = p.x - d.x;
            const ay = p.y - d.y;
            d.x += ax * (2 + k * 8) * dt;
            d.y += ay * (2 + k * 8) * dt;
          }
          if (d.hit <= 0) {
            d.hit = 0.1;
            for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - d.x, e.y - d.y) < R + e.r) g.damageEnemy(e, D * (e.boss ? 0.6 : 1), { noText: true });
            const c = g.clearBullets(d.x, d.y, R + 8, "score");
            if (c) g.fx.burst(d.x, d.y, 3, "#9dffd6", 80, 200, 0.3, 2);
          }
        }
        if (ret > 0.6) {
          for (const d of discs) {
            g.aoe(d.x, d.y, 130, D * 2.2, { pal: "jade", noText: true });
            g.fx.explosion(d.x, d.y, 28, PAL.jade);
          }
          if (tier >= 3) for (let i = 0; i < 14; i++) g.spawnPB(p.x, p.y, (i * TAU) / 14, 700, 21, 14 + al * 3, { r: 10, pierce: 4, life: 0.9, src: 2 });
          audio.sfx("boom_m");
          g.shake(5, 0.2);
          return false;
        }
        return true;
      },
      (ctx) => {
        ctx.globalCompositeOperation = "lighter";
        for (const d of discs) {
          // 風之軌跡
          for (let i = 0; i < d.trail.length; i++) {
            const [x, y] = d.trail[i];
            const k = i / d.trail.length;
            ctx.globalAlpha = k * 0.4;
            ctx.drawImage(glow("#3dffb0", 64), x - R * k, y - R * k, R * 2 * k, R * 2 * k);
          }
          ctx.globalAlpha = 1;
          ctx.drawImage(glow("#3dffb0", 128), d.x - R * 1.4, d.y - R * 1.4, R * 2.8, R * 2.8);
          ctx.save();
          ctx.translate(d.x, d.y);
          ctx.rotate(d.rot);
          for (let k = 0; k < 3; k++) {
            ctx.rotate(TAU / 3);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(R * 0.4, -R * 0.5, R * 0.95, -R * 0.55, R, -R * 0.1);
            ctx.bezierCurveTo(R * 0.7, -R * 0.2, R * 0.35, -R * 0.15, 0, 0);
            const gr = ctx.createLinearGradient(0, 0, R, 0);
            gr.addColorStop(0, "rgba(255,255,255,0.95)");
            gr.addColorStop(1, "rgba(61,255,176,0.75)");
            ctx.fillStyle = gr;
            ctx.fill();
          }
          ctx.strokeStyle = "rgba(230,255,245,0.8)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.98, 0, TAU * 0.85);
          ctx.stroke();
          ctx.restore();
        }
        ctx.globalCompositeOperation = "source-over";
      }
    );
  },

  // ---------- 奧義：翠龍降臨 ----------
  castUlt(g) {
    const p = g.p;
    const ul = g.lvl("ult");
    const tier = evoTier(ul);
    const passes = tier >= 1 ? 4 : 3;
    const PT = 1.4;
    const T = passes * PT + 0.5;
    const D = 70 + ul * 34;
    p.inv = Math.max(p.inv, T + 1.5);
    audio.sfx("ultgo");
    g.flash("#dfffee", 0.7);
    g.tint("#20e090", 0.3, T);
    g.shake(10, 0.5);
    const baseYs = [300, 640, 420, 760];
    const head = (tt: number): [number, number, number] => {
      const k = Math.floor(clamp(tt / PT, 0, passes - 0.0001));
      const u = clamp(tt / PT - k, 0, 1);
      const dirX = k % 2 === 0 ? 1 : -1;
      const uu = tt < 0 ? -0.3 : u;
      const x = W / 2 + dirX * (-1 + 2 * uu) * (W * 0.66);
      const y = baseYs[k] + Math.sin(uu * TAU * 1.5 + k * 1.3) * 150;
      return [x, y, dirX];
    };
    const N = 46;
    let t = 0;
    let dmgT = 0;
    let boltT = 0;
    const storms: { x: number; y: number; t: number }[] = [];
    const streaks: { x: number; y: number; v: number; l: number }[] = [];
    for (let i = 0; i < 46; i++) streaks.push({ x: rand(W), y: rand(H), v: rand(700, 1400), l: rand(40, 120) });
    const segAt = (i: number): [number, number] => {
      const [x, y] = head(t - i * 0.03);
      return [x, y];
    };
    mkFx(
      g,
      1,
      (dt) => {
        t += dt;
        dmgT -= dt;
        boltT -= dt;
        if (dmgT <= 0) {
          dmgT = 0.06;
          for (let i = 0; i < N; i += 3) {
            const [x, y] = segAt(i);
            const r = 44 * (1 - (i / N) * 0.6) + 10;
            for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - x, e.y - y) < r + e.r) g.damageEnemy(e, D * 0.35 * (e.boss ? 0.5 : 1), { noText: true });
            g.clearBullets(x, y, r + 12, "score");
          }
          const [hx, hy] = segAt(0);
          g.fx.burst(hx, hy, 4, "#b8ffe0", 100, 340, 0.5, 2.4);
          if (tier >= 3) storms.push({ x: hx, y: hy, t: 0 });
        }
        if (tier >= 2 && boltT <= 0) {
          boltT = 0.38;
          const e = g.enemies.filter((q) => !q.dead && q.y > 0)[Math.floor(Math.random() * 30) % Math.max(1, g.enemies.length)];
          const tx = e ? e.x : rand(60, W - 60);
          const ty = e ? e.y : rand(100, 500);
          boltFx(g, tx + rand(-30, 30), 0, tx, ty, "#7dffcf", 0.2, 3);
          if (e) g.damageEnemy(e, D * 0.8, { noText: true });
          g.fx.explosion(tx, ty, 18, PAL.jade);
          audio.sfx("lightning", 0.15);
        }
        for (let i = storms.length - 1; i >= 0; i--) {
          const s = storms[i];
          s.t += dt;
          if (Math.floor(s.t * 8) !== Math.floor((s.t - dt) * 8)) {
            for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - s.x, e.y - s.y) < 54 + e.r) g.damageEnemy(e, D * 0.12, { noText: true });
            g.clearBullets(s.x, s.y, 54, "none");
          }
          if (s.t > 3) storms.splice(i, 1);
        }
        for (const s of streaks) {
          s.y += s.v * dt;
          if (s.y > H + 100) {
            s.y = -100;
            s.x = rand(W);
          }
        }
        if (t > T) {
          g.aoe(W / 2, H / 2, 9999, D * 1.5, { pal: "jade", noText: true });
          g.fx.ring(W / 2, H / 2, 40, 700, 0.6, "#b8ffe0", 8);
          g.flash("#dfffee", 0.5);
          return false;
        }
        return true;
      },
      (ctx) => {
        ctx.globalCompositeOperation = "lighter";
        // 風暴殘影
        for (const s of storms) {
          const a = Math.max(0, 1 - s.t / 3) * 0.55;
          ctx.globalAlpha = a;
          ctx.drawImage(glow("#3dffb0", 128), s.x - 60, s.y - 60, 120, 120);
          ctx.strokeStyle = "#b8ffe0";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 30 + Math.sin(s.t * 10) * 4, s.t * 8, s.t * 8 + 4);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // 龍身
        const pts: [number, number][] = [];
        for (let i = 0; i < N; i++) pts.push(segAt(i));
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let pass = 0; pass < 2; pass++) {
          for (let i = N - 2; i >= 0; i--) {
            const k = i / N;
            const r = (i === 0 ? 40 : 34) * (1 - k * 0.72);
            ctx.strokeStyle = pass === 0 ? `rgba(30,220,150,${0.5 * (1 - k * 0.6)})` : `hsl(${150 + k * 40},90%,${82 - k * 34}%)`;
            ctx.lineWidth = pass === 0 ? r * 2.7 : r * 1.4;
            ctx.beginPath();
            ctx.moveTo(pts[i + 1][0], pts[i + 1][1]);
            ctx.lineTo(pts[i][0], pts[i][1]);
            ctx.stroke();
          }
        }
        // 背鰭／鱗紋
        for (let i = 2; i < N - 1; i += 2) {
          const [x, y] = pts[i];
          const [nx, ny] = pts[i - 1];
          const a = Math.atan2(ny - y, nx - x) - Math.PI / 2;
          const r = 34 * (1 - (i / N) * 0.72);
          ctx.strokeStyle = "rgba(230,255,245,0.9)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
          ctx.lineTo(x + Math.cos(a) * (r * 1.7 + (i % 4) * 6), y + Math.sin(a) * (r * 1.7 + (i % 4) * 6));
          ctx.stroke();
        }
        // 龍首
        const [hx, hy] = pts[0];
        const [bx, by] = pts[2];
        const ha = Math.atan2(hy - by, hx - bx);
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(ha);
        const jaw = 8 + Math.sin(t * 9) * 5;
        ctx.fillStyle = "rgba(230,255,245,0.96)";
        ctx.beginPath();
        ctx.moveTo(56, 0);
        ctx.lineTo(20, -22 - jaw * 0.3);
        ctx.lineTo(-18, -26);
        ctx.lineTo(-30, 0);
        ctx.lineTo(-18, 26);
        ctx.lineTo(20, 22 + jaw * 0.3);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "rgba(30,220,150,0.95)";
        ctx.beginPath();
        ctx.moveTo(52, jaw * 0.5);
        ctx.lineTo(16, 10 + jaw);
        ctx.lineTo(-6, 6);
        ctx.closePath();
        ctx.fill();
        // 犄角與龍鬚
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(-6, s * 22);
          ctx.quadraticCurveTo(-40, s * 46, -70, s * 30 + Math.sin(t * 6 + s) * 10);
          ctx.stroke();
          ctx.strokeStyle = "rgba(61,255,176,0.9)";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.moveTo(40, s * 10);
          ctx.quadraticCurveTo(70, s * 40, 30, s * 70 + Math.sin(t * 8 + s) * 12);
          ctx.stroke();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
        }
        ctx.fillStyle = "#fff8a0";
        ctx.beginPath();
        ctx.arc(14, -12, 5, 0, TAU);
        ctx.arc(14, 12, 5, 0, TAU);
        ctx.fill();
        ctx.restore();
        ctx.drawImage(glow("#3dffb0", 128), hx - 90, hy - 90, 180, 180);
        // 風線
        ctx.strokeStyle = "rgba(200,255,230,0.55)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (const s of streaks) {
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x + 6, s.y - s.l);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = "source-over";
      }
    );
    void easeOut;
  },
};
