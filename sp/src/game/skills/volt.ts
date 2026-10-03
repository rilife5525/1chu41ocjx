// 紫電（星紋「雷霆」）：電弧彈／靜電累積／逆極性／雷網天羅
import { H, TAU, W, clamp, rand } from "../constants";
import { audio } from "../audio";
import { evoTier } from "../data/ships";
import { PAL } from "../render/fx";
import { bolt } from "../render/shipUtil";
import { glow } from "../render/sprites";
import { EB_COLORS } from "../render/sprites";
import { boltFx, drawBars, mkFx } from "./common";
import type { ShipKit } from "./common";
import type { Enemy } from "../entities";

export const voltKit: ShipKit = {
  init(g) {
    g.p.k = { vol: 0, stat: 0, flipT: 0, flipR: 0 };
  },

  // ---------- 武裝：電弧彈 ----------
  fire(g) {
    const p = g.p;
    const wl = g.lvl("weapon");
    const tier = evoTier(wl);
    p.fireT += 0.065 / p.s.rate;
    p.k.vol++;
    audio.sfx("shoot3", 0.05);
    const n = Math.min(5, 2 + Math.floor(p.power / 3)) + p.s.extra;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 11;
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.03;
      g.spawnPB(p.x + off, p.y - 26, a, 1300, 7, 5.2 + wl * 0.7, { r: 5, chain: 1 + (tier >= 1 ? 1 : 0), life: 0.9 });
    }
    if (tier >= 3 && p.k.vol % 5 === 0) g.spawnPB(p.x, p.y - 30, -Math.PI / 2, 1000, 8, 24 + wl * 3, { r: 12, chain: 4, pierce: 3, life: 1 });
  },

  // ---------- 被動：靜電累積 ----------
  update(g, dt) {
    const p = g.p;
    if (p.k.flipT > 0) p.k.flipT -= dt;
  },

  onHit(g, b, e) {
    const p = g.p;
    const pl = g.lvl("passive");
    const wl = g.lvl("weapon");
    if (evoTier(wl) >= 2 && Math.random() < 0.06) e.slow = Math.max(e.slow, 1.2);
    const th = Math.max(16, 34 - pl * 2);
    p.k.stat += 1;
    if (p.k.stat >= th) {
      p.k.stat = 0;
      const tier = evoTier(pl);
      const n = 3 + (tier >= 1 ? 2 : 0) + Math.floor(pl / 2);
      const D = 60 + pl * 24;
      const list = g.enemies.filter((q) => !q.dead && q.y > -10 && q.alive).sort((a, c) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(c.x - p.x, c.y - p.y));
      audio.sfx("lightning", 0.1);
      for (let i = 0; i < n; i++) {
        const t = list[i % Math.max(1, list.length)];
        const tx = t ? t.x : rand(60, W - 60);
        const ty = t ? t.y : rand(100, 500);
        boltFx(g, tx + rand(-40, 40), 0, tx, ty, "#c58bff", 0.22, 3.4);
        g.fx.explosion(tx, ty, 16, PAL.elec);
        if (t) {
          g.damageEnemy(t, D);
          if (tier >= 2) g.aoe(tx, ty, 64, D * 0.6, { noFx: true, noText: true, skip: t.uid });
          if (tier >= 3) g.chain(tx, ty, 3, D * 0.5, t.uid);
        }
      }
      g.shake(3, 0.12);
    }
  },

  onGraze(g) {
    g.p.k.stat = Math.min(60, g.p.k.stat + 0.3);
  },

  drawOver(g, ctx) {
    const p = g.p;
    const th = Math.max(16, 34 - g.lvl("passive") * 2);
    const k = clamp(p.k.stat / th, 0, 1);
    if (k < 0.15) return;
    ctx.globalCompositeOperation = "lighter";
    const seed = Math.floor(g.t * 18);
    const n = Math.ceil(k * 5);
    for (let i = 0; i < n; i++) {
      const a = (i * TAU) / 5 + g.t * 2;
      bolt(ctx, p.x + Math.cos(a) * 14, p.y + Math.sin(a) * 14, p.x + Math.cos(a + 0.6) * 38, p.y + Math.sin(a + 0.6) * 38, seed + i * 5, 4, 5, "rgba(178,107,255,0.8)", 1.8, "#fff6b0");
    }
    ctx.globalCompositeOperation = "source-over";
  },

  // ---------- 主動：逆極性 ----------
  castActive(g) {
    const p = g.p;
    const al = g.lvl("active");
    const tier = evoTier(al);
    const dur = 3 + (tier >= 1 ? 1.5 : 0);
    const dmg = (8 + al * 3) * (tier >= 2 ? 1.6 : 1);
    const px = p.x;
    const py = p.y;
    let t = 0;
    let flipped = 0;
    audio.sfx("lightning", 0.05);
    g.flash("#c58bff", 0.4);
    g.shake(6, 0.25);
    const flip = (b: { x: number; y: number; alive: boolean; color: number }) => {
      const tgt = g.nearest(b.x, b.y, 9999);
      const ang = tgt ? Math.atan2(tgt.y - b.y, tgt.x - b.x) : -Math.PI / 2;
      g.spawnPB(b.x, b.y, ang, 560, 22, dmg, { r: 7, homing: 5, life: 2.2, src: 2, chain: tier >= 2 ? 2 : 0, pierce: 1, kind: 0 });
      g.fx.glowP(b.x, b.y, 0, 0, 0.2, 14, EB_COLORS[b.color % EB_COLORS.length], 26, 0, 0.9);
      b.alive = false;
      flipped++;
    };
    mkFx(
      g,
      1,
      (dt) => {
        t += dt;
        const cx = g.p.x;
        const cy = g.p.y;
        // 脈衝擴張階段：0.5 秒擴張至全螢幕；之後轉為隨身力場
        const R = t < 0.5 ? (t / 0.5) * 900 : 270;
        let cnt = 0;
        for (const b of g.eb.items) {
          if (!b.alive || cnt > 80) continue;
          if ((t < 0.5 ? Math.hypot(b.x - px, b.y - py) : Math.hypot(b.x - cx, b.y - cy)) < R) {
            flip(b);
            cnt++;
          }
        }
        if (t < 0.5 && tier >= 3 && Math.floor(t * 30) !== Math.floor((t - dt) * 30)) {
          for (const e of g.enemies) if (e.shield > 0 && Math.hypot(e.x - px, e.y - py) < R) e.shield = 0;
        }
        g.addUlt(cnt * 0.12);
        for (const bm of g.beams.items) if (bm.alive && t < 0.5 && bm.dmg > 0) bm.life = Math.min(bm.life, 0.05), (bm.warn = 0);
        if (flipped > 0 && Math.floor(t * 10) !== Math.floor((t - dt) * 10)) audio.sfx("pickup", 0.1);
        return t < dur;
      },
      (ctx) => {
        ctx.globalCompositeOperation = "lighter";
        const cx = g.p.x;
        const cy = g.p.y;
        if (t < 0.5) {
          const R = (t / 0.5) * 900;
          const a = 1 - t / 0.5;
          ctx.strokeStyle = `rgba(178,107,255,${0.9 * a})`;
          ctx.lineWidth = 16 * a + 2;
          ctx.beginPath();
          ctx.arc(px, py, R, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = `rgba(255,228,92,${a})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(px, py, R * 0.96, 0, TAU);
          ctx.stroke();
          const seed = Math.floor(t * 40);
          for (let i = 0; i < 14; i++) {
            const an = (i * TAU) / 14 + seed;
            bolt(ctx, px + Math.cos(an) * R * 0.9, py + Math.sin(an) * R * 0.9, px + Math.cos(an + 0.1) * R * 1.02, py + Math.sin(an + 0.1) * R * 1.02, seed + i, 3, 10, "rgba(178,107,255,0.8)", 2, "#fff");
          }
        }
        // 反轉力場
        const fa = t < 0.5 ? 0.3 : Math.min(1, (dur - t) / 0.6) * 0.9;
        const R = t < 0.5 ? 270 * (t / 0.5) : 270;
        ctx.globalAlpha = fa * (0.55 + 0.25 * Math.sin(t * 10));
        ctx.drawImage(glow("#8a5cff", 256), cx - R * 1.1, cy - R * 1.1, R * 2.2, R * 2.2);
        ctx.globalAlpha = fa;
        for (let i = 0; i < 28; i++) {
          const a0 = (i * TAU) / 28 + t * 0.8;
          ctx.strokeStyle = i % 2 ? "#ffe45c" : "#c58bff";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(cx, cy, R, a0, a0 + 0.14);
          ctx.stroke();
        }
        // 正負極符號
        ctx.font = '900 20px "Bebas Neue", Impact, sans-serif';
        ctx.textAlign = "center";
        for (let i = 0; i < 6; i++) {
          const a = (i * TAU) / 6 - t * 1.2;
          ctx.fillStyle = i % 2 ? "#ffe45c" : "#c58bff";
          ctx.fillText(i % 2 ? "+" : "−", cx + Math.cos(a) * (R - 22), cy + Math.sin(a) * (R - 22) + 7);
        }
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    );
  },

  // ---------- 奧義：雷網天羅 ----------
  castUlt(g) {
    const p = g.p;
    const ul = g.lvl("ult");
    const tier = evoTier(ul);
    const T = 5 + (tier >= 1 ? 1.5 : 0);
    const CH = 0.9;
    const FIN = 0.7;
    const D = 46 + ul * 22;
    p.inv = Math.max(p.inv, CH + T + FIN + 1);
    p.ultBusy = CH + T + FIN;
    audio.sfx("charge");
    let t = 0;
    let tick = 0;
    let strikeT = 0;
    let finished = false;
    let nodes: Enemy[] = [];
    let edges: [number, number, number, number][] = [];
    const ox = W / 2;
    const oy = 120;
    mkFx(
      g,
      2,
      (dt) => {
        t += dt;
        strikeT -= dt;
        if (t > CH && t < CH + T) {
          tick -= dt;
          if (tick <= 0) {
            tick = 0.1;
            nodes = g.enemies.filter((e) => !e.dead && e.alive && e.y > -20 && e.alpha >= 0).slice(0, 26);
            edges = [];
            const pts: { x: number; y: number; e: Enemy | null }[] = [{ x: ox, y: oy, e: null }, ...nodes.map((e) => ({ x: e.x, y: e.y, e }))];
            const deg = new Map<Enemy, number>();
            const seen = new Set<string>();
            for (let i = 0; i < pts.length; i++) {
              const near = pts
                .map((q, j) => ({ j, d: Math.hypot(q.x - pts[i].x, q.y - pts[i].y) }))
                .filter((q) => q.j !== i)
                .sort((a, b) => a.d - b.d)
                .slice(0, 2);
              for (const n of near) {
                const key = i < n.j ? i + "-" + n.j : n.j + "-" + i;
                if (seen.has(key)) continue;
                seen.add(key);
                edges.push([pts[i].x, pts[i].y, pts[n.j].x, pts[n.j].y]);
                if (pts[i].e) deg.set(pts[i].e!, (deg.get(pts[i].e!) || 0) + 1);
                if (pts[n.j].e) deg.set(pts[n.j].e!, (deg.get(pts[n.j].e!) || 0) + 1);
              }
            }
            for (const e of nodes) {
              const dg = deg.get(e) || 1;
              g.damageEnemy(e, D * (1 + dg * 0.3) * (e.boss ? 0.45 : 1), { noText: true });
              e.slow = Math.max(e.slow, 0.3);
              if (Math.random() < 0.3) g.fx.hit(e.x, e.y, "#ffe45c");
            }
            g.clearBullets(W / 2, H / 2, 9999, "none");
            audio.sfx("hit", 0.05);
          }
          if (strikeT <= 0) {
            strikeT = 0.36;
            const e = nodes.length ? nodes[Math.floor(Math.random() * nodes.length)] : null;
            const x = e ? e.x : rand(40, W - 40);
            const y = e ? e.y : rand(140, 600);
            boltFx(g, x + rand(-24, 24), 0, x, y, "#c58bff", 0.2, 3.6);
            g.fx.explosion(x, y, 20, PAL.elec);
            audio.sfx("lightning", 0.12);
            g.shake(4, 0.1);
            if (e) g.damageEnemy(e, D * 1.4, { noText: true });
          }
        }
        if (t > CH + T && !finished) {
          finished = true;
          audio.sfx("ultgo");
          g.flash("#ffffff", 1);
          g.shake(18, 0.7);
          g.clearBullets(W / 2, H / 2, 9999, "score");
          // 天雷審判：貫穿全螢幕的巨型落雷
          for (const e of g.enemies) {
            if (e.dead) continue;
            g.damageEnemy(e, D * 5 * (e.boss ? 0.35 : 1));
            if (tier >= 3) e.freeze = 2.5;
            g.fx.explosion(e.x, e.y, 26, PAL.elec);
          }
          if (tier >= 2) for (let i = 0; i < 12; i++) boltFx(g, rand(20, W - 20), 0, rand(20, W - 20), rand(300, H), "#ffe45c", 0.4, 3);
        }
        if (t > CH + T + FIN) {
          p.ultBusy = 0;
          return false;
        }
        return true;
      },
      (ctx) => {
        // 暗雲與電壓
        const inA = t < CH ? t / CH : t > CH + T ? clamp(1 - (t - CH - T) / FIN, 0, 1) : 1;
        ctx.fillStyle = `rgba(12,4,32,${0.55 * inA})`;
        ctx.fillRect(0, 0, W, H);
        drawBars(ctx, inA * 0.7, W, H);
        ctx.globalCompositeOperation = "lighter";
        // 雷球
        const k = t < CH ? t / CH : 1;
        const R = 30 + 30 * k + Math.sin(t * 20) * 3;
        ctx.drawImage(glow("#b26bff", 256), ox - R * 3, oy - R * 3, R * 6, R * 6);
        ctx.drawImage(glow("#fff6b0", 128), ox - R, oy - R, R * 2, R * 2);
        const seed = Math.floor(t * 18);
        for (let i = 0; i < 8; i++) {
          const a = (i * TAU) / 8 + t * 2;
          bolt(ctx, ox, oy, ox + Math.cos(a) * (R * 2.2 + 30), oy + Math.sin(a) * (R * 2.2 + 30), seed + i * 3, 4, 8, "rgba(178,107,255,0.9)", 2.4, "#fff");
        }
        if (t > CH && t < CH + T) {
          for (let i = 0; i < edges.length; i++) {
            const e = edges[i];
            ctx.globalAlpha = 0.9;
            bolt(ctx, e[0], e[1], e[2], e[3], seed * 7 + i, 6, 8, "rgba(178,107,255,0.85)", 3, "#fff6b0");
          }
          ctx.globalAlpha = 1;
          for (const e of nodes) {
            ctx.drawImage(glow("#ffe45c", 96), e.x - 28, e.y - 28, 56, 56);
          }
        }
        if (t > CH + T) {
          const f = clamp((t - CH - T) / 0.25, 0, 1);
          const a = 1 - clamp((t - CH - T - 0.25) / 0.45, 0, 1);
          const x = g.p.x;
          const w = 90 * (0.4 + f * 0.6);
          const gr = ctx.createLinearGradient(x - w, 0, x + w, 0);
          gr.addColorStop(0, "rgba(178,107,255,0)");
          gr.addColorStop(0.35, `rgba(200,140,255,${0.8 * a})`);
          gr.addColorStop(0.5, `rgba(255,255,255,${a})`);
          gr.addColorStop(0.65, `rgba(200,140,255,${0.8 * a})`);
          gr.addColorStop(1, "rgba(178,107,255,0)");
          ctx.fillStyle = gr;
          ctx.fillRect(x - w, 0, w * 2, H);
          ctx.globalAlpha = a;
          bolt(ctx, x, 0, x, H, seed, 16, 22, "rgba(255,228,92,0.9)", 6, "#fff");
          ctx.globalAlpha = 1;
        }
        ctx.globalCompositeOperation = "source-over";
      }
    );
  },
};
