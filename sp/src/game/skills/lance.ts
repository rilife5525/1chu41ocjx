// 蒼槍（星紋「貫穿」）：貫穿光矛／共振穿刺／次元斷層／天啟・鎖定審判
import { H, TAU, W, clamp, easeOut, rand } from "../constants";
import { audio } from "../audio";
import { evoTier } from "../data/ships";
import { PAL } from "../render/fx";
import { glow } from "../render/sprites";
import { drawBars, mkFx } from "./common";
import type { ShipKit } from "./common";
import type { Enemy } from "../entities";

export const lanceKit: ShipKit = {
  init(g) {
    g.p.k = { vol: 0, still: 0, lx: g.p.x, ly: g.p.y };
  },

  // ---------- 武裝：貫穿光矛 ----------
  fire(g) {
    const p = g.p;
    const wl = g.lvl("weapon");
    const tier = evoTier(wl);
    const pl = g.lvl("passive");
    p.fireT += 0.085 / p.s.rate;
    p.k.vol++;
    audio.sfx("shoot1", 0.05);
    const lanes = Math.min(5, 2 + Math.floor(p.power / 3)) + p.s.extra;
    const cap = 4 + pl + (evoTier(pl) >= 1 ? 2 : 0);
    const dmg = 13 + wl * 1.7;
    const ramp = 0.1 + pl * 0.015;
    for (let i = 0; i < lanes; i++) {
      const x = p.x + (i - (lanes - 1) / 2) * 11;
      g.spawnPB(x, p.y - 34, -Math.PI / 2, 1500, 3, dmg, { r: 5, pierce: 40 + (evoTier(pl) >= 1 ? 0 : 0), ramp, b: cap, life: 1.0, kind: 0 });
    }
    if (tier >= 1 || p.power >= 4) {
      for (const s of [-1, 1]) {
        g.spawnPB(p.x + s * 16, p.y - 20, -Math.PI / 2 + s * 0.13, 1350, 4, dmg * 0.55, { r: 4, pierce: 40, ramp: ramp * 0.6, b: cap, life: 0.9 });
        if (p.power >= 6 || tier >= 3) g.spawnPB(p.x + s * 22, p.y - 14, -Math.PI / 2 + s * 0.26, 1300, 4, dmg * 0.5, { r: 4, pierce: 40, ramp: ramp * 0.6, b: cap, life: 0.85 });
      }
    }
    if (tier >= 2 && p.k.vol % 3 === 0) g.spawnPB(p.x, p.y - 40, -Math.PI / 2, 1400, 3, dmg * 2, { r: 9, pierce: 60, ramp, b: cap + 2, life: 1.0, scale: 1.7 });
    if (tier >= 3) for (const s of [-1, 1]) g.spawnPB(p.x + s * 5, p.y - 30, -Math.PI / 2 + s * 0.05, 1450, 3, dmg * 0.8, { r: 5, pierce: 40, ramp, b: cap, life: 1.0 });
  },

  // ---------- 被動：共振穿刺 / 凝神 ----------
  update(g, dt) {
    const p = g.p;
    const pl = g.lvl("passive");
    const moved = Math.hypot(p.x - p.k.lx, p.y - p.k.ly) > 0.6;
    p.k.lx = p.x;
    p.k.ly = p.y;
    p.k.still = moved ? 0 : p.k.still + dt;
    const focus = evoTier(pl) >= 2 && p.k.still > 0.6;
    p.k.bonus = focus ? 0.25 : 0;
    p.k.focus = focus;
    if (focus && Math.random() < 0.5) g.fx.glowP(p.x + rand(-22, 22), p.y + rand(-30, 30), 0, -60, 0.5, rand(4, 8), "#9be6ff", 1, 0, 0.8);
  },

  onHit(g, b, e) {
    const pl = g.lvl("passive");
    const tier = evoTier(g.lvl("weapon"));
    if (tier >= 2 && b.src === 0 && Math.random() < 0.3) {
      g.aoe(e.x, e.y, 42, b.dmg * 0.4, { noFx: true, noText: true, skip: e.uid });
      g.fx.ring(e.x, e.y, 6, 44, 0.25, "#9be6ff", 2.4);
    }
    if (evoTier(pl) >= 3 && g.p.k.focus && Math.random() < 0.35) {
      g.aoe(e.x, e.y, 70, b.dmg * 0.6, { pal: "cyan", noText: true, small: true, skip: e.uid });
    }
  },

  // ---------- 主動：次元斷層 ----------
  castActive(g) {
    const p = g.p;
    const al = g.lvl("active");
    const tier = evoTier(al);
    const K = 3 + (tier >= 1 ? 1 : 0) + (al >= 6 ? 1 : 0);
    const xs: number[] = [];
    const sorted = g.enemies.filter((e) => e.y > -10 && !e.dead && e.alpha >= 0).sort((a, b) => Number(b.boss) * 9999 + b.hp - (Number(a.boss) * 9999 + a.hp));
    for (const e of sorted) {
      if (xs.length >= K) break;
      if (xs.every((x) => Math.abs(x - e.x) > 78)) xs.push(e.x);
    }
    let fill = 0;
    while (xs.length < K) {
      const x = clamp(p.x + (fill % 2 ? 1 : -1) * (Math.ceil((fill + 1) / 2) * 120), 40, W - 40);
      fill++;
      if (xs.every((v) => Math.abs(v - x) > 60) || fill > 8) xs.push(x);
    }
    xs.sort((a, b) => a - b);
    audio.sfx("active");
    const width = 58 + (tier >= 1 ? 20 : 0);
    const D = 62 + al * 30;
    xs.forEach((x, i) => {
      let t = -i * 0.2;
      let closed = false;
      const seed = Math.random() * 50;
      mkFx(
        g,
        1,
        (dt) => {
          t += dt;
          if (t > 0.5 && t < 1.4) {
            // 開啟中：傷害與清彈
            if (Math.floor(t * 10) !== Math.floor((t - dt) * 10)) {
              for (const e of g.enemies) if (!e.dead && Math.abs(e.x - x) < width / 2 + e.r) g.damageEnemy(e, D * (e.boss ? 0.55 : 1), { noText: true });
              g.fx.burst(x + rand(-width / 2, width / 2), rand(80, H - 80), 4, "#bfefff", 80, 220, 0.4, 2);
            }
            g.clearBullets(x, H / 2, 9999, "none", x, width / 2 + 6);
            if (tier >= 3) for (const e of g.enemies) if (!e.dead && !e.boss && Math.abs(e.x - x) < 190) e.x += (x - e.x) * 2.2 * dt;
            if (t > 0.52 && t - dt <= 0.52) {
              audio.sfx("boom_m", 0.05);
              g.shake(5, 0.2);
              g.fx.ring(x, 40, 10, 120, 0.4, "#9be6ff", 5);
            }
          }
          if (t >= 1.4 && !closed) {
            closed = true;
            if (tier >= 2) {
              for (let k = 0; k < 4; k++) g.aoe(x, 140 + k * 200, 120, D * 0.9, { pal: "cyan", noText: true, small: true });
              g.fx.ring(x, H / 2, 30, 260, 0.5, "#ffffff", 6);
            }
          }
          return t < 1.75;
        },
        (ctx) => {
          if (t < 0) return;
          if (t < 0.5) {
            // 預警線與準星
            const a = 0.4 + 0.5 * Math.abs(Math.sin(t * 24));
            ctx.strokeStyle = `rgba(150,230,255,${a})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([12, 8]);
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
            ctx.setLineDash([]);
            const r = 30 * (1 - t / 0.5) + 10;
            ctx.beginPath();
            ctx.arc(x, 90, r, 0, TAU);
            ctx.stroke();
            return;
          }
          const open = t < 0.65 ? (t - 0.5) / 0.15 : t < 1.4 ? 1 : 1 - (t - 1.4) / 0.35;
          const w = width * clamp(open, 0, 1);
          if (w <= 1) return;
          // 裂縫內部：深空
          ctx.beginPath();
          const step = 24;
          const L: number[] = [];
          const R: number[] = [];
          for (let y = 0; y <= H + step; y += step) {
            L.push(x - w / 2 + Math.sin(seed + y * 0.13 + t * 6) * 6 * open + Math.sin(y * 0.9 + seed) * 3);
            R.push(x + w / 2 + Math.sin(seed + y * 0.11 - t * 6) * 6 * open + Math.sin(y * 0.7 + seed) * 3);
          }
          ctx.moveTo(L[0], 0);
          for (let i = 1; i < L.length; i++) ctx.lineTo(L[i], i * step);
          for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i], i * step);
          ctx.closePath();
          const gr = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
          gr.addColorStop(0, "#0a1230");
          gr.addColorStop(0.5, "#010208");
          gr.addColorStop(1, "#0a1230");
          ctx.fillStyle = gr;
          ctx.fill();
          ctx.save();
          ctx.clip();
          ctx.globalCompositeOperation = "lighter";
          ctx.fillStyle = "#fff";
          for (let i = 0; i < 28; i++) {
            const sy = (i * 97 + t * 260) % H;
            ctx.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(i * 3.1 + t * 5));
            ctx.fillRect(x - w / 2 + ((i * 53) % Math.max(4, w)), sy, 1.6, 8);
          }
          ctx.restore();
          ctx.globalAlpha = 1;
          // 發光裂邊
          ctx.globalCompositeOperation = "lighter";
          for (const edge of [L, R]) {
            ctx.strokeStyle = "rgba(190,240,255,0.95)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(edge[0], 0);
            for (let i = 1; i < edge.length; i++) ctx.lineTo(edge[i], i * step);
            ctx.stroke();
            ctx.strokeStyle = "rgba(60,150,255,0.5)";
            ctx.lineWidth = 9;
            ctx.stroke();
          }
          ctx.globalCompositeOperation = "source-over";
        }
      );
    });
  },

  // ---------- 奧義：天啟・鎖定審判 ----------
  castUlt(g) {
    const p = g.p;
    const ul = g.lvl("ult");
    const tier = evoTier(ul);
    p.inv = Math.max(p.inv, 6);
    p.ultBusy = 5;
    audio.sfx("charge");
    g.slowmo(0.22, 2.3);
    const cap = 18 + (tier >= 1 ? 12 : 0) + ul;
    const list = g.enemies.filter((e) => e.y > -30 && !e.dead && e.alpha >= 0).sort((a, b) => Number(a.boss) - Number(b.boss) || a.y - b.y);
    const targets = list.slice(0, cap);
    const lockGap = 0.075;
    let rt = 0; // 真實時間
    let phase = 0;
    let fired = 0;
    const width = 44 + (tier >= 1 ? 20 : 0);
    const D = 380 + ul * 190;
    const pillars: { x: number; y: number; t: number; w: number }[] = [];
    let rainT = 0;
    mkFx(
      g,
      2,
      () => {
        rt += g.rdt;
        p.inv = Math.max(p.inv, 1);
        if (phase === 0) {
          const nLocked = Math.floor(rt / lockGap);
          if (nLocked > fired && fired < targets.length) {
            fired = Math.min(targets.length, nLocked);
            audio.sfx("lock", 0.02);
          }
          if (rt > 0.45 + targets.length * lockGap + 0.9) {
            phase = 1;
            audio.sfx("ultgo");
            g.flash("#ffffff", 1);
            g.shake(16, 0.6);
            g.clearBullets(W / 2, H / 2, 9999, "score");
            for (const e of targets) {
              if (e.dead) continue;
              const bossExtra = tier >= 3 && e.boss ? e.maxHp * 0.08 : 0;
              g.damageEnemy(e, D * (e.boss ? 0.6 : 1) + bossExtra, { noText: false });
              pillars.push({ x: e.x, y: e.y, t: 0, w: width });
              g.fx.explosion(e.x, e.y, 34, PAL.cyan);
            }
            if (!targets.length) pillars.push({ x: p.x, y: p.y - 200, t: 0, w: width });
            // 我機正前方也降下一道
            pillars.push({ x: p.x, y: 0, t: 0, w: width * 0.7 });
            rt = 0;
            g.slowmo(1, 0.01);
          }
        } else {
          for (const q of pillars) q.t += g.rdt;
          if (tier >= 2 && rt < 2.2) {
            rainT -= g.rdt;
            if (rainT <= 0) {
              rainT = 0.07;
              const x = rand(30, W - 30);
              pillars.push({ x, y: rand(120, 640), t: 0, w: 14 });
              g.aoe(x, 0, 0, 0, { noFx: true });
              for (const e of g.enemies) if (!e.dead && Math.abs(e.x - x) < 34 + e.r) g.damageEnemy(e, 80 + ul * 30, { noText: true });
            }
          }
          if (rt > (tier >= 2 ? 2.5 : 1.0)) {
            p.ultBusy = 0;
            return false;
          }
        }
        return true;
      },
      (ctx) => {
        // 開場：去色、黑邊、暗角
        const inA = phase === 0 ? clamp(rt / 0.4, 0, 1) : clamp(1 - rt / 0.6, 0, 1);
        ctx.fillStyle = `rgba(4,10,30,${0.55 * inA})`;
        ctx.fillRect(0, 0, W, H);
        drawBars(ctx, inA, W, H);
        if (phase === 0) {
          // 機體聚能：光矛光環
          ctx.globalCompositeOperation = "lighter";
          const k = clamp(rt / 1.2, 0, 1);
          for (let i = 0; i < 12; i++) {
            const a = -Math.PI / 2 + (i - 5.5) * 0.16;
            const L = 90 + 60 * k;
            const x0 = p.x + Math.cos(a) * 30;
            const y0 = p.y + Math.sin(a) * 30;
            const gr = ctx.createLinearGradient(x0, y0, x0 + Math.cos(a) * L, y0 + Math.sin(a) * L);
            gr.addColorStop(0, "rgba(71,194,255,0)");
            gr.addColorStop(1, "rgba(220,250,255,0.95)");
            ctx.strokeStyle = gr;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x0 + Math.cos(a) * L, y0 + Math.sin(a) * L);
            ctx.stroke();
          }
          ctx.drawImage(glow("#9be6ff", 128), p.x - 60 * k - 20, p.y - 60 * k - 20, 120 * k + 40, 120 * k + 40);
          // 鎖定準星
          for (let i = 0; i < fired; i++) {
            const e = targets[i];
            if (!e || e.dead) continue;
            const age = rt - i * lockGap;
            const s = e.r * 1.5 + 14 + Math.max(0, 1 - age * 4) * 46;
            ctx.save();
            ctx.translate(e.x, e.y);
            ctx.rotate(age * 1.5);
            ctx.strokeStyle = e.boss ? "#ff5a6e" : "#9be6ff";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.arc(0, 0, s, 0, TAU);
            ctx.stroke();
            for (let q = 0; q < 4; q++) {
              ctx.rotate(Math.PI / 2);
              ctx.beginPath();
              ctx.moveTo(s + 4, -8);
              ctx.lineTo(s + 4, 0);
              ctx.lineTo(s - 6, 0);
              ctx.moveTo(s * 0.55, 0);
              ctx.lineTo(s * 0.2, 0);
              ctx.stroke();
            }
            ctx.restore();
            ctx.strokeStyle = "rgba(160,235,255,0.25)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(e.x, e.y);
            ctx.stroke();
          }
          ctx.globalCompositeOperation = "source-over";
          ctx.fillStyle = "#e6faff";
          ctx.font = '900 30px "Bebas Neue", Impact, sans-serif';
          ctx.textAlign = "center";
          ctx.fillText(`LOCK ON  ${fired} / ${targets.length}`, W / 2, 118);
        } else {
          // 光柱審判
          ctx.globalCompositeOperation = "lighter";
          for (const q of pillars) {
            const life = q.t;
            if (life > 0.9) continue;
            const a = life < 0.08 ? life / 0.08 : Math.max(0, 1 - (life - 0.08) / 0.82);
            const w = q.w * (life < 0.1 ? 0.6 + life * 4 : 1 - (life - 0.1) * 0.5);
            const gr = ctx.createLinearGradient(q.x - w, 0, q.x + w, 0);
            gr.addColorStop(0, "rgba(71,194,255,0)");
            gr.addColorStop(0.3, `rgba(120,215,255,${0.7 * a})`);
            gr.addColorStop(0.5, `rgba(255,255,255,${a})`);
            gr.addColorStop(0.7, `rgba(120,215,255,${0.7 * a})`);
            gr.addColorStop(1, "rgba(71,194,255,0)");
            ctx.fillStyle = gr;
            ctx.fillRect(q.x - w, 0, w * 2, q.y > 0 ? q.y + 20 : H);
            ctx.globalAlpha = a;
            ctx.drawImage(glow("#ffffff", 128), q.x - 60, q.y - 60, 120, 120);
            ctx.strokeStyle = "#dff8ff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(q.x, q.y, 10 + life * 160, 0, TAU);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
          ctx.globalCompositeOperation = "source-over";
        }
      }
    );
    void H;
    void easeOut;
    void ({} as Enemy);
  },
};
