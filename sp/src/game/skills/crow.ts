// 緋鴉（星紋「爆燃」）：焰羽扇擊／餘燼連鎖／烙羽連爆／涅槃・不死鳥
import { H, TAU, W, clamp, easeOut, rand } from "../constants";
import { audio } from "../audio";
import { evoTier } from "../data/ships";
import { PAL } from "../render/fx";
import { makeOpts, drawShip } from "../render/shipDraw";
import { glow } from "../render/sprites";
import { boltFx, mkFx } from "./common";
import type { ShipKit } from "./common";
import type { Enemy } from "../entities";

export const crowKit: ShipKit = {
  init(g) {
    g.p.k = { vol: 0, depth: 0, phxAura: 0, pillarT: 0 };
  },

  // ---------- 武裝：焰羽扇擊 ----------
  fire(g) {
    const p = g.p;
    const wl = g.lvl("weapon");
    const tier = evoTier(wl);
    const phx = p.form === 1;
    p.fireT += (phx ? 0.075 : 0.15) / p.s.rate;
    p.k.vol++;
    audio.sfx("shoot0", 0.05);
    if (!phx) {
      const n = 3 + Math.min(4, Math.floor(p.power / 2)) + p.s.extra;
      const spread = Math.min(1.15, 0.15 * (n - 1));
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (n === 1 ? 0 : (i / (n - 1) - 0.5) * spread);
        g.spawnPB(p.x + (i - (n - 1) / 2) * 4, p.y - 24, a, 840, 0, 10.5 + wl * 1.3, { r: 6, kind: 6, explode: tier >= 1 ? 52 : 38, life: 1.2 });
      }
      if (tier >= 2 && p.k.vol % 4 === 0) g.spawnPB(p.x, p.y - 30, -Math.PI / 2, 720, 1, 40 + wl * 4, { r: 13, pierce: 4, src: 0, kind: 8, life: 1.4 });
    } else {
      // 不死鳥形態：五道焰流 + 弧焰翼刃
      const ul = g.lvl("ult");
      const n = 5 + Math.min(2, Math.floor(p.power / 3)) + p.s.extra;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * 0.5;
        g.spawnPB(p.x + (i - (n - 1) / 2) * 7, p.y - 30, a, 980, 0, 12 + ul * 1.5, { r: 7, pierce: 3, kind: 0, life: 1.1, scale: 1.3 });
      }
      if (p.k.vol % 3 === 0) for (const s of [-1, 1]) g.spawnPB(p.x + s * 28, p.y - 10, -Math.PI / 2 + s * 0.85, 640, 18, 20 + ul * 3, { r: 15, pierce: 6, life: 1 });
    }
  },

  update(g, dt) {
    const p = g.p;
    if (p.form === 1) {
      const ul = g.lvl("ult");
      const tier = evoTier(ul);
      p.formT -= dt;
      p.dmgMul = 1.9;
      p.speedMul = 1.15;
      const R = 78 + tier * 14;
      // 翼焰灼燒並焚毀近身彈幕
      g.clearBullets(p.x, p.y, R, "none");
      p.k.phxAura -= dt;
      if (p.k.phxAura <= 0) {
        p.k.phxAura = 0.1;
        g.aoe(p.x, p.y - 10, R, 34 + ul * 9, { noFx: true, burn: true });
      }
      // 尾焰
      g.fx.glowP(p.x + rand(-14, 14), p.y + 22, rand(-30, 30), rand(60, 160), 0.5, rand(10, 20), Math.random() < 0.5 ? "#ffb347" : "#ff5a1a", 3, 0.5, 0.9);
      if (Math.random() < 0.5) g.fx.glowP(p.x + rand(-50, 50), p.y + rand(-20, 10), rand(-20, 20), rand(-20, 40), 0.5, rand(6, 12), "#ffe9a0", 2, 0, 0.8);
      // 進化 Lv5：每 2 秒噴發火柱
      if (tier >= 2) {
        p.k.pillarT -= dt;
        if (p.k.pillarT <= 0) {
          p.k.pillarT = 2;
          const tg = g.nearest(p.x, p.y - 200, 9999) || null;
          const px = tg ? tg.x : p.x;
          let t = 0;
          mkFx(
            g,
            1,
            (d) => {
              t += d;
              if (Math.floor(t * 10) !== Math.floor((t - d) * 10)) {
                for (const e of g.enemies) if (Math.abs(e.x - px) < 46 + e.r) g.damageEnemy(e, 60 + ul * 20, { noText: true });
                g.clearBullets(px, H / 2, 9999, "none", px, 46);
              }
              return t < 0.9;
            },
            (ctx) => {
              const a = Math.sin(clamp(t / 0.9, 0, 1) * Math.PI);
              ctx.globalCompositeOperation = "lighter";
              const gr = ctx.createLinearGradient(px - 46, 0, px + 46, 0);
              gr.addColorStop(0, "rgba(255,60,20,0)");
              gr.addColorStop(0.35, `rgba(255,170,60,${0.7 * a})`);
              gr.addColorStop(0.5, `rgba(255,250,210,${0.95 * a})`);
              gr.addColorStop(0.65, `rgba(255,170,60,${0.7 * a})`);
              gr.addColorStop(1, "rgba(255,60,20,0)");
              ctx.fillStyle = gr;
              ctx.fillRect(px - 46, 0, 92, H);
              ctx.globalCompositeOperation = "source-over";
            }
          );
          audio.sfx("boom_m", 0.2);
          g.shake(5, 0.2);
        }
      }
      if (p.formT <= 0) endPhoenix(g);
    }
  },

  // ---------- 被動：餘燼連鎖 ----------
  onKill(g, e) {
    const p = g.p;
    const pl = g.lvl("passive");
    const tier = evoTier(pl);
    const maxDepth = tier >= 3 ? 3 : 1;
    if (p.k.depth >= maxDepth) return;
    p.k.depth++;
    const r = 52 + pl * 7 + (tier >= 1 ? 22 : 0);
    g.aoe(e.x, e.y, r, 22 + pl * 9 + e.maxHp * 0.05, { pal: "fire", burn: tier >= 1, noText: true });
    g.addUlt(0.9);
    if (tier >= 2 && Math.random() < 0.3) {
      let t = 0;
      const x = e.x;
      const y = e.y;
      mkFx(
        g,
        0,
        (d) => {
          t += d;
          if (Math.floor(t * 5) !== Math.floor((t - d) * 5)) g.aoe(x, y, 44, 14 + pl * 5, { noFx: true, noText: true, burn: true });
          if (Math.random() < 0.6) g.fx.glowP(x + rand(-30, 30), y + rand(-12, 12), 0, rand(-70, -30), 0.5, rand(6, 12), "#ff8a2a", 2, 0, 0.8);
          return t < 3;
        },
        (ctx) => {
          ctx.globalCompositeOperation = "lighter";
          ctx.globalAlpha = 0.5 * (1 - t / 3);
          ctx.drawImage(glow("#ff6a1a", 96), x - 44, y - 30, 88, 60);
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
        }
      );
    }
    p.k.depth--;
  },

  onHit(g, b, e) {
    if (b.kind === 6 || b.kind === 8) {
      const tier = evoTier(g.lvl("weapon"));
      g.aoe(b.x, b.y, b.explode || 40, b.dmg * (b.kind === 8 ? 0.8 : 0.5), { pal: "fire", noText: true, small: true, skip: e.uid });
      if (tier >= 3 && b.kind === 6 && Math.random() < 0.4) {
        for (let i = 0; i < 2; i++) g.spawnPB(b.x, b.y, -Math.PI / 2 + rand(-1.2, 1.2), 520, 2, 7, { r: 4, homing: 2, life: 1.2, src: 2 });
      }
    }
  },

  // ---------- 主動：烙羽連爆 ----------
  castActive(g) {
    const p = g.p;
    const al = g.lvl("active");
    const tier = evoTier(al);
    const N = 8 + al + (tier >= 1 ? 4 : 0);
    const list = g.enemies.filter((e) => e.y > -10 && e.alpha >= 0 && !e.dead).sort((a, b) => Number(b.boss) - Number(a.boss) || b.hp - a.hp);
    type Tg = { e: Enemy; stacks: number };
    const tg: Tg[] = [];
    const feathers: { sx: number; sy: number; e: Enemy | null; fx: number; fy: number; t: number; d: number; dead: boolean }[] = [];
    for (let i = 0; i < N; i++) {
      const e = list.length ? list[i % list.length] : null;
      feathers.push({ sx: p.x + rand(-16, 16), sy: p.y - 10, e, fx: e ? e.x : rand(60, W - 60), fy: e ? e.y : rand(100, 400), t: -i * 0.04, d: 0.5 + rand(0, 0.15), dead: false });
    }
    audio.sfx("active");
    let t = 0;
    let phase = 0;
    let hold = 0;
    let queue: Tg[] = [];
    let cd = 0;
    const D = 100 + al * 48;
    const spreadR = tier >= 1 ? 170 : 130;
    mkFx(
      g,
      1,
      (dt) => {
        t += dt;
        if (phase === 0) {
          let all = true;
          for (const f of feathers) {
            f.t += dt;
            if (f.dead) continue;
            if (f.t < f.d) {
              all = false;
              continue;
            }
            f.dead = true;
            if (f.e && f.e.alive && !f.e.dead) {
              f.e.brand = 1;
              let s = tg.find((x) => x.e === f.e);
              if (!s) {
                s = { e: f.e, stacks: 0 };
                tg.push(s);
              }
              s.stacks += f.e.boss || tier >= 3 ? 1 : 0;
              if (s.stacks === 0) s.stacks = 1;
              g.fx.hit(f.e.x, f.e.y, "#ff5a2a");
              g.fx.ring(f.e.x, f.e.y, 6, 30, 0.25, "#ffb347", 3);
              audio.sfx("lock", 0.03);
            }
          }
          if (all) {
            phase = 1;
            hold = 0.95;
          }
        } else if (phase === 1) {
          hold -= dt;
          if (hold <= 0) {
            phase = 2;
            queue = tg.filter((x) => x.e.alive && !x.e.dead).sort((a, b) => Math.hypot(a.e.x - p.x, a.e.y - p.y) - Math.hypot(b.e.x - p.x, b.e.y - p.y));
            cd = 0;
          }
        } else if (phase === 2) {
          cd -= dt;
          while (cd <= 0 && queue.length) {
            cd += 0.085;
            const s = queue.shift()!;
            const e = s.e;
            if (!e.alive || e.dead) continue;
            // 每個烙印獨立引爆（Boss 可疊多枚）
            const hits = e.boss && tier >= 3 ? Math.min(5, s.stacks + 2) : 1;
            for (let h = 0; h < hits; h++) {
              g.damageEnemy(e, D * (e.boss ? 0.5 : 1), { noText: h > 0 });
              if (tier >= 3 && e.boss) e.mark = 4;
            }
            g.aoe(e.x, e.y, 110, D * 0.7, { pal: "fire", skip: e.uid, noText: true });
            g.fx.explosion(e.x, e.y, 30, PAL.fire);
            g.fx.ring(e.x, e.y, 20, 120, 0.35, "#ffb347", 5);
            audio.sfx("boom_s", 0.04);
            g.shake(3, 0.1);
            e.brand = 0;
            if (tier >= 2) {
              for (let i = 0; i < 3; i++) g.spawnPB(e.x, e.y, rand(TAU), 480, 2, 9 + al * 2, { r: 4, homing: 3, life: 1.4, src: 2 });
            }
            // 烙印傳染
            if (tg.length < 26) {
              for (const o of g.enemies) {
                if (o.alive && !o.dead && o.brand === 0 && o.y > -10 && Math.hypot(o.x - e.x, o.y - e.y) < spreadR && !o.boss) {
                  o.brand = 1;
                  const ns = { e: o, stacks: 1 };
                  tg.push(ns);
                  queue.push(ns);
                }
              }
            }
          }
          if (!queue.length) return false;
        }
        return true;
      },
      (ctx) => {
        ctx.globalCompositeOperation = "lighter";
        // 飛行中的焰羽
        for (const f of feathers) {
          if (f.dead || f.t < 0) continue;
          const k = easeOut(f.t / f.d);
          const tx = f.e && f.e.alive ? f.e.x : f.fx;
          const ty = f.e && f.e.alive ? f.e.y : f.fy;
          const mx = (f.sx + tx) / 2 + (f.sx < tx ? -80 : 80);
          const my = (f.sy + ty) / 2;
          const x = (1 - k) * (1 - k) * f.sx + 2 * (1 - k) * k * mx + k * k * tx;
          const y = (1 - k) * (1 - k) * f.sy + 2 * (1 - k) * k * my + k * k * ty;
          ctx.drawImage(glow("#ff8a2a", 64), x - 16, y - 16, 32, 32);
          ctx.drawImage(glow("#fff2b0", 32), x - 7, y - 7, 14, 14);
        }
        // 烙印符文與連線
        const alive = tg.filter((x) => x.e.alive && !x.e.dead && x.e.brand > 0);
        for (let i = 0; i < alive.length; i++) {
          const e = alive[i].e;
          const s = e.r * 1.4 + 12;
          ctx.save();
          ctx.translate(e.x, e.y);
          ctx.rotate(t * 2.5);
          const pulse = 0.6 + 0.4 * Math.sin(t * 12 + i);
          ctx.strokeStyle = `rgba(255,110,40,${0.5 + pulse * 0.5})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, s, 0, TAU);
          ctx.stroke();
          for (let k = 0; k < 6; k++) {
            ctx.rotate(TAU / 6);
            ctx.beginPath();
            ctx.moveTo(s * 0.55, 0);
            ctx.lineTo(s * 1.15, 0);
            ctx.moveTo(s, -4);
            ctx.lineTo(s * 0.8, 0);
            ctx.lineTo(s, 4);
            ctx.stroke();
          }
          ctx.rotate(-t * 5);
          ctx.strokeStyle = "rgba(255,230,160,0.9)";
          ctx.beginPath();
          ctx.moveTo(-s * 0.4, s * 0.35);
          ctx.lineTo(0, -s * 0.5);
          ctx.lineTo(s * 0.4, s * 0.35);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
          if (i > 0) {
            const o = alive[i - 1].e;
            ctx.strokeStyle = `rgba(255,150,60,${0.25 + 0.25 * pulse})`;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(e.x, e.y);
            ctx.stroke();
          }
        }
        ctx.globalCompositeOperation = "source-over";
      }
    );
  },

  // ---------- 奧義：涅槃・不死鳥 ----------
  castUlt(g) {
    const p = g.p;
    const ul = g.lvl("ult");
    const tier = evoTier(ul);
    p.form = 1;
    p.formT = 10 + (tier >= 1 ? 2 : 0) + (tier >= 3 ? 2 : 0);
    p.inv = Math.max(p.inv, 3.5);
    p.k.pillarT = 1;
    audio.sfx("ultgo");
    g.flash("#fff2c0", 0.9);
    g.tint("#ff7a2a", 0.32, 2.4);
    g.shake(12, 0.6);
    // 巨型鳳凰衝天：沿路灼燒、清除彈幕
    let t = 0;
    const sx = p.x;
    const D = 140 + ul * 55;
    const dur = 1.25;
    mkFx(
      g,
      1,
      (dt) => {
        t += dt;
        const k = easeOut(t / dur);
        const y = p.y - k * (p.y + 260);
        if (Math.floor(t * 20) !== Math.floor((t - dt) * 20)) {
          for (const e of g.enemies) if (Math.abs(e.y - y) < 130 && !e.dead) g.damageEnemy(e, D * 0.4, { noText: true });
          g.clearBullets(W / 2, y, 9999, "none", undefined, undefined, y, 140);
          g.fx.burst(sx + rand(-160, 160), y + rand(-30, 60), 5, "#ffb347", 100, 360, 0.6, 3);
        }
        return t < dur;
      },
      (ctx) => {
        const k = easeOut(t / dur);
        const y = p.y - k * (p.y + 260);
        ctx.save();
        ctx.translate(sx, y);
        ctx.scale(4.2, 4.2);
        ctx.globalAlpha = 0.85 * (1 - Math.max(0, (t / dur - 0.7) / 0.3));
        ctx.globalCompositeOperation = "lighter";
        const o = makeOpts("crow", g.t * 1.4, 3);
        o.form = 1;
        drawShip(ctx, "crow", o);
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        // 焰浪橫掃
        ctx.globalCompositeOperation = "lighter";
        const gr = ctx.createLinearGradient(0, y - 130, 0, y + 200);
        gr.addColorStop(0, "rgba(255,120,30,0)");
        gr.addColorStop(0.55, "rgba(255,190,70,0.5)");
        gr.addColorStop(1, "rgba(255,80,20,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(0, y - 130, W, 330);
        ctx.globalCompositeOperation = "source-over";
      }
    );
  },

  drawUnder(g, ctx) {
    const p = g.p;
    if (p.form !== 1) return;
    const ul = g.lvl("ult");
    const R = 78 + evoTier(ul) * 14;
    ctx.globalCompositeOperation = "lighter";
    const pl = 0.6 + 0.4 * Math.sin(g.t * 8);
    ctx.globalAlpha = 0.45 + 0.2 * pl;
    ctx.drawImage(glow("#ff8a2a", 128), p.x - R * 1.3, p.y - R * 1.3, R * 2.6, R * 2.6);
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = "#ffd66b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, g.t * 2, g.t * 2 + TAU * 0.7);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  },
};

function endPhoenix(g: import("../engine/Game").Game) {
  const p = g.p;
  const ul = g.lvl("ult");
  const tier = evoTier(ul);
  p.form = 0;
  p.dmgMul = 1;
  p.speedMul = 1;
  g.clearBullets(p.x, p.y, 9999, "score");
  const R = tier >= 2 ? 9999 : 280;
  g.aoe(p.x, p.y, R, 260 + ul * 90, { pal: "fire", noText: true });
  g.fx.explosion(p.x, p.y, 70, PAL.fire);
  g.fx.ring(p.x, p.y, 30, tier >= 2 ? 900 : 300, 0.8, "#ffd66b", 10);
  g.flash("#ffe9a0", 0.6);
  g.shake(10, 0.4);
  audio.sfx("boom_l");
  if (tier >= 2) g.heal(p.maxHp * 0.25);
  boltFx; // 保留匯入
}
