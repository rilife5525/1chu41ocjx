// 玄影（星紋「重力」）：暗物質榴彈／重力偏折／奇點種子／終焉視界
import { H, TAU, W, clamp, easeOut, rand } from "../constants";
import { audio } from "../audio";
import { evoTier } from "../data/ships";
import { PAL } from "../render/fx";
import { glow } from "../render/sprites";
import { drawBars, mkFx } from "./common";
import type { ShipKit } from "./common";
import type { Enemy, PBullet } from "../entities";
import type { Game } from "../engine/Game";

function explodeOrb(g: Game, b: PBullet) {
  const wl = g.lvl("weapon");
  const tier = evoTier(wl);
  const R = 92 * (b.scale > 1.2 ? 1.3 : 1);
  g.aoe(b.x, b.y, R, b.dmg * 0.9, { pal: "void", noText: true });
  g.fx.ring(b.x, b.y, 10, R, 0.35, "#c58bff", 4);
  g.fx.glowP(b.x, b.y, 0, 0, 0.3, R * 0.6, "#2a0a50", R * 0.9, 0, 0.8);
  if (tier >= 2 && b.kind === 20) {
    for (let i = 0; i < 3; i++) {
      const a = (i * TAU) / 3 + rand(1);
      g.spawnPB(b.x, b.y, a, 260, 9, b.dmg * 0.3, { r: 9, scale: 0.55, kind: 21, life: 0.9, src: 2 });
    }
  }
  b.alive = false;
}

export const noirKit: ShipKit = {
  init(g) {
    g.p.k = { vol: 0, dark: 0 };
  },

  // ---------- 武裝：暗物質榴彈 + 暗影針 ----------
  fire(g) {
    const p = g.p;
    const wl = g.lvl("weapon");
    const tier = evoTier(wl);
    p.fireT += 0.12 / p.s.rate;
    p.k.vol++;
    audio.sfx("shoot4", 0.06);
    const n = 2 + Math.floor(p.power / 3) + p.s.extra + (tier >= 3 ? 2 : 0);
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.16;
      g.spawnPB(p.x + (i - (n - 1) / 2) * 8, p.y - 22, a, 820, 10, 4.8 + wl * 0.7, { r: 5, homing: 3, life: 1, slow: tier >= 3 ? 1 : 0 });
    }
    if (p.k.vol % 3 === 0) {
      const dbl = p.k.dark >= 10;
      if (dbl) p.k.dark = 0;
      g.spawnPB(p.x, p.y - 30, -Math.PI / 2, 420, 9, (24 + wl * 3.2) * (dbl ? 2 : 1), { r: dbl ? 22 : 16, kind: 20, life: 1.4, scale: dbl ? 1.5 : 1, a: 100 * (tier >= 1 ? 1.35 : 1) });
    }
  },

  updateBullet(g, b, dt) {
    if (b.kind === 20 || b.kind === 21) {
      const G = b.kind === 20 ? b.a : 60;
      for (const e of g.enemies) {
        if (e.dead || e.alpha < 0) continue;
        const dx = b.x - e.x;
        const dy = b.y - e.y;
        const d = Math.hypot(dx, dy);
        if (d < G && d > 4) {
          const f = (e.boss ? 0.15 : 1) * (1 - d / G) * 260;
          e.x += (dx / d) * f * dt;
          e.y += (dy / d) * f * dt;
        }
      }
      b.rot += dt * 6;
      if (b.kind === 20 && b.t > 1.25) explodeOrb(g, b);
      if (b.kind === 21 && b.t > 0.8) {
        g.aoe(b.x, b.y, 56, b.dmg, { noText: true, small: true, pal: "void" });
        b.alive = false;
      }
    }
  },

  onHit(g, b) {
    if (b.kind === 20) explodeOrb(g, b);
    else if (b.kind === 21) {
      g.aoe(b.x, b.y, 56, b.dmg, { noText: true, small: true, pal: "void" });
      b.alive = false;
    }
  },

  // ---------- 被動：重力偏折 ----------
  update(g) {
    const p = g.p;
    const pl = g.lvl("passive");
    const tier = evoTier(pl);
    const R = 74 + pl * 8 + (tier >= 1 ? 20 : 0);
    const slow = 1 - clamp(0.35 + pl * 0.02 + (tier >= 1 ? 0.15 : 0), 0, 0.85);
    for (const b of g.eb.items) {
      if (!b.alive) continue;
      const dx = p.x - b.x;
      const dy = p.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d < R) {
        b.slow = Math.min(b.slow, slow);
        if (tier >= 2) {
          b.x += (dx / d) * 34 * 0.016;
          b.y += (dy / d) * 34 * 0.016;
          if (d < 24) {
            b.alive = false;
            p.k.dark = Math.min(10, p.k.dark + 1);
            g.addUlt(0.25);
            g.fx.glowP(b.x, b.y, dx * 2, dy * 2, 0.25, 8, "#c58bff", 2, 0, 0.9);
          }
        }
      }
    }
  },

  onGraze(g) {
    g.addUlt(0.8);
  },

  drawUnder(g, ctx) {
    const p = g.p;
    const pl = g.lvl("passive");
    const R = 74 + pl * 8 + (evoTier(pl) >= 1 ? 20 : 0);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "rgba(197,139,255,0.22)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 10]);
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, g.t * 0.6, g.t * 0.6 + TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    if (p.k.dark > 0) {
      for (let i = 0; i < p.k.dark; i++) {
        const a = g.t * 2 + (i * TAU) / 10;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(glow("#c58bff", 32), p.x + Math.cos(a) * 30 - 6, p.y + Math.sin(a) * 18 - 6, 12, 12);
      }
      ctx.globalAlpha = 1;
    }
    ctx.globalCompositeOperation = "source-over";
  },

  // ---------- 主動：奇點種子 ----------
  castActive(g) {
    const p = g.p;
    const al = g.lvl("active");
    const tier = evoTier(al);
    const seeds = 1 + (tier >= 3 ? 1 : 0);
    audio.sfx("active");
    // 尋找最密集處
    const cand = g.enemies.filter((e) => !e.dead && e.y > 30 && e.y < 600 && e.alpha >= 0);
    let best: { x: number; y: number } | null = null;
    let bestN = -1;
    for (const e of cand) {
      let n = e.boss ? 6 : 0;
      for (const o of cand) if (Math.hypot(o.x - e.x, o.y - e.y) < 140) n++;
      if (n > bestN) {
        bestN = n;
        best = { x: e.x, y: e.y };
      }
    }
    const tg = best || { x: p.x, y: 300 };
    for (let s = 0; s < seeds; s++) {
      const tx = clamp(tg.x + (s ? (tg.x < W / 2 ? 150 : -150) : 0), 80, W - 80);
      const ty = tg.y + (s ? 50 : 0);
      launchSeed(g, p.x, p.y, tx, ty, al, tier, s * 0.18);
    }
  },

  // ---------- 奧義：終焉視界 ----------
  castUlt(g) {
    const p = g.p;
    const ul = g.lvl("ult");
    const tier = evoTier(ul);
    const boss = g.enemies.find((e) => e.boss && !e.dead);
    const cx = boss ? clamp(boss.x, 150, W - 150) : W / 2;
    const cy = boss ? Math.max(260, boss.y + 90) : 330;
    const Rm = 140 + (tier >= 1 ? 30 : 0);
    const FORM = 0.9;
    const T = 5 + (tier >= 1 ? 1.5 : 0);
    const COL = 0.8;
    const D = 60 + ul * 30;
    p.inv = Math.max(p.inv, FORM + T + COL + 1);
    p.ultBusy = FORM + T + COL;
    audio.sfx("black");
    g.shake(8, FORM);
    let t = 0;
    let mass = 0;
    let dmgT = 0;
    let jetT = 1;
    let collapsed = false;
    const jets: { x: number; t: number }[] = [];
    const bgPan = document.createElement("canvas");
    void bgPan;
    mkFx(
      g,
      2,
      (dt) => {
        t += dt;
        const active = t > FORM * 0.5 && t < FORM + T;
        const R = t < FORM ? Rm * easeOut(t / FORM) : t < FORM + T ? Rm : Rm * (1 - clamp((t - FORM - T) / COL, 0, 1)) * 0.3;
        if (active) {
          const pullR = 9999;
          const strength = 1 + (t - FORM * 0.5) * 0.35 + (tier >= 1 ? 0.4 : 0);
          for (const e of g.enemies) {
            if (e.dead || e.alpha < 0) continue;
            const dx = cx - e.x;
            const dy = cy - e.y;
            const d = Math.hypot(dx, dy) || 1;
            const f = (e.boss ? 0.12 : 1) * Math.min(420, 90 + 5000 / (d + 40)) * strength;
            if (d < pullR) {
              e.x += (dx / d) * f * dt;
              e.y += (dy / d) * f * dt;
            }
          }
          for (const b of g.eb.items) {
            if (!b.alive) continue;
            const dx = cx - b.x;
            const dy = cy - b.y;
            const d = Math.hypot(dx, dy) || 1;
            const sp = (300 + 6000 / (d + 40)) * strength;
            // 螺旋內縮：加入切線分量
            b.x += (dx / d) * sp * dt - (dy / d) * sp * 0.5 * dt;
            b.y += (dy / d) * sp * dt + (dx / d) * sp * 0.5 * dt;
            if (d < R * 0.6) {
              b.alive = false;
              mass++;
            }
          }
          dmgT -= dt;
          if (dmgT <= 0) {
            dmgT = 0.1;
            for (const e of g.enemies) {
              if (e.dead) continue;
              const d = Math.hypot(e.x - cx, e.y - cy);
              if (d < R * 1.15 + e.r) g.damageEnemy(e, D * (e.boss ? 0.5 : 1.2), { noText: true });
              else if (d < R * 3) g.damageEnemy(e, D * 0.2, { noText: true, noHitFx: true });
            }
            g.fx.glowP(cx + rand(-R, R) * 1.4, cy + rand(-R, R) * 1.4, 0, 0, 0.35, 8, "#c58bff", 1, 0, 0.9);
          }
          // 相對論噴流
          if (tier >= 2) {
            jetT -= dt;
            if (jetT <= 0) {
              jetT = 1.4;
              jets.push({ x: cx, t: 0 });
              audio.sfx("laser", 0.2);
            }
          }
        }
        for (const j of jets) {
          j.t += dt;
          if (j.t < 0.5 && Math.floor(j.t * 20) !== Math.floor((j.t - dt) * 20)) {
            for (const e of g.enemies) if (!e.dead && Math.abs(e.x - j.x) < 46 + e.r) g.damageEnemy(e, D * 1.3 * (e.boss ? 0.6 : 1), { noText: true });
            g.clearBullets(j.x, H / 2, 9999, "none", j.x, 50);
          }
        }
        if (t > FORM + T && !collapsed) {
          collapsed = true;
          audio.sfx("ultgo");
          g.flash("#ffffff", 1);
          g.shake(20, 0.8);
          g.clearBullets(W / 2, H / 2, 9999, "score");
          g.aoe(cx, cy, 9999, 380 + ul * 150 + mass * 4, { pal: "void", noText: false });
          g.fx.ring(cx, cy, 30, 1000, 0.8, "#ffffff", 14);
          g.fx.ring(cx, cy, 20, 700, 0.6, "#c58bff", 8);
          g.fx.explosion(cx, cy, 90, PAL.void);
          if (tier >= 3) {
            let z = 0;
            mkFx(
              g,
              0,
              (d) => {
                z += d;
                if (Math.floor(z * 8) !== Math.floor((z - d) * 8)) g.aoe(cx, cy, 200, D * 0.3, { noFx: true, noText: true });
                for (const b of g.eb.items) if (b.alive && Math.hypot(b.x - cx, b.y - cy) < 200) b.slow = 0.35;
                return z < 4;
              },
              (ctx) => {
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = 0.35 * (1 - z / 4);
                ctx.drawImage(glow("#a45cff", 256), cx - 200, cy - 200, 400, 400);
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = "source-over";
              }
            );
          }
        }
        if (t > FORM + T + COL) {
          p.ultBusy = 0;
          return false;
        }
        return true;
      },
      (ctx) => {
        const inA = t < FORM ? t / FORM : t < FORM + T ? 1 : clamp(1 - (t - FORM - T) / COL, 0, 1);
        const R = t < FORM ? Rm * easeOut(t / FORM) : t < FORM + T ? Rm : Rm * (1 - clamp((t - FORM - T) / COL, 0, 1)) * 0.3;
        ctx.fillStyle = `rgba(8,2,20,${0.6 * inA})`;
        ctx.fillRect(0, 0, W, H);
        drawBars(ctx, inA * 0.8, W, H);
        // 空間透鏡：放大並旋轉黑洞周圍的畫面
        if (g.lensOK && R > 20) {
          const S = g.pxScale;
          const LR = R * 2.3;
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, LR, 0, TAU);
          ctx.clip();
          ctx.translate(cx, cy);
          ctx.rotate(t * 0.6);
          const src = LR / 1.55;
          try {
            ctx.drawImage(g.canvas, (cx - src + g.shakeX) * S, (cy - src + g.shakeY) * S, src * 2 * S, src * 2 * S, -LR, -LR, LR * 2, LR * 2);
          } catch {
            /* 畫布尚未就緒時略過 */
          }
          ctx.restore();
        }
        drawBlackHole(ctx, cx, cy, R, t, inA);
        // 相對論噴流
        ctx.globalCompositeOperation = "lighter";
        for (const j of jets) {
          if (j.t > 0.55) continue;
          const a = Math.sin(clamp(j.t / 0.55, 0, 1) * Math.PI);
          const gr = ctx.createLinearGradient(j.x - 50, 0, j.x + 50, 0);
          gr.addColorStop(0, "rgba(160,90,255,0)");
          gr.addColorStop(0.5, `rgba(255,255,255,${a})`);
          gr.addColorStop(1, "rgba(160,90,255,0)");
          ctx.fillStyle = gr;
          ctx.fillRect(j.x - 50, 0, 100, H);
        }
        ctx.globalCompositeOperation = "source-over";
      }
    );
  },
};

function drawBlackHole(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, t: number, a: number) {
  if (R < 4) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.globalCompositeOperation = "lighter";
  // 吸積盤
  ctx.save();
  ctx.scale(1, 0.34);
  ctx.rotate(t * 0.8);
  for (let i = 0; i < 5; i++) {
    const r = R * (1.15 + i * 0.28);
    ctx.strokeStyle = `hsla(${280 - i * 18},90%,${70 - i * 8}%,${0.6 * a * (1 - i * 0.15)})`;
    ctx.lineWidth = 8 - i;
    ctx.beginPath();
    ctx.arc(0, 0, r, t * (i % 2 ? 1 : -1), t * (i % 2 ? 1 : -1) + TAU * 0.8);
    ctx.stroke();
  }
  ctx.restore();
  // 光暈
  ctx.globalAlpha = 0.7 * a;
  ctx.drawImage(glow("#8a4cff", 256), -R * 2.1, -R * 2.1, R * 4.2, R * 4.2);
  ctx.globalAlpha = 1;
  // 引力透鏡環
  ctx.strokeStyle = `rgba(255,240,255,${0.85 * a})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.02, 0, TAU);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  // 事件視界
  const gr = ctx.createRadialGradient(0, 0, R * 0.2, 0, 0, R);
  gr.addColorStop(0, "#000");
  gr.addColorStop(0.85, "#010004");
  gr.addColorStop(1, "rgba(20,0,40,0.9)");
  ctx.fillStyle = gr;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fill();
  // 螺旋星流
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = `rgba(220,190,255,${0.5 * a})`;
  ctx.lineWidth = 1.5;
  for (let k = 0; k < 6; k++) {
    ctx.beginPath();
    for (let i = 0; i < 26; i++) {
      const u = i / 26;
      const ang = k * (TAU / 6) + u * 4.2 - t * 3;
      const r = R * (2.4 - u * 1.9);
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
}

function launchSeed(g: Game, sx: number, sy: number, tx: number, ty: number, al: number, tier: number, delay: number) {
  let t = -delay;
  const flight = 0.65;
  let phase = 0;
  let bt = 0;
  let mass = 0;
  let dmgT = 0;
  const Rmax = 110 + (tier >= 1 ? 25 : 0);
  const dur = 3.2 + (tier >= 1 ? 1 : 0);
  const D = 38 + al * 14;
  const swallowedCols: number[] = [];
  mkFx(
    g,
    1,
    (dt) => {
      t += dt;
      if (phase === 0) {
        if (t >= flight) {
          phase = 1;
          bt = 0;
          audio.sfx("black");
          g.shake(4, 0.2);
        }
      } else {
        bt += dt;
        const k = clamp(bt / 0.4, 0, 1);
        const R = Rmax * k * (bt > dur - 0.3 ? clamp((dur - bt) / 0.3, 0.2, 1) : 1);
        const pullR = R * 2.6;
        for (const e of g.enemies) {
          if (e.dead || e.alpha < 0) continue;
          const dx = tx - e.x;
          const dy = ty - e.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < pullR) {
            const f = (e.boss ? 0.1 : 1) * (1 - d / pullR) * 380;
            e.x += (dx / d) * f * dt;
            e.y += (dy / d) * f * dt;
          }
        }
        for (const b of g.eb.items) {
          if (!b.alive) continue;
          const dx = tx - b.x;
          const dy = ty - b.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < pullR) {
            const sp = 200 + (1 - d / pullR) * 420;
            b.x += (dx / d) * sp * dt;
            b.y += (dy / d) * sp * dt;
            if (d < R * 0.55) {
              b.alive = false;
              mass++;
              if (swallowedCols.length < 30) swallowedCols.push(b.color);
            }
          }
        }
        dmgT -= dt;
        if (dmgT <= 0) {
          dmgT = 0.1;
          for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - tx, e.y - ty) < R * 0.75 + e.r) g.damageEnemy(e, D * (e.boss ? 0.6 : 1), { noText: true });
        }
        if (bt >= dur) {
          g.aoe(tx, ty, R * 1.9, 110 + al * 55 + mass * 8, { pal: "void" });
          g.fx.ring(tx, ty, 10, R * 2.2, 0.5, "#ffffff", 8);
          g.fx.explosion(tx, ty, 50, PAL.void);
          g.shake(8, 0.3);
          audio.sfx("boom_l", 0.1);
          if (tier >= 2) {
            const n = Math.min(24, mass);
            for (let i = 0; i < n; i++) g.spawnPB(tx, ty, (i * TAU) / Math.max(1, n), 620, 10, 10 + al * 2, { r: 5, homing: 3, life: 1.3, src: 2 });
          }
          return false;
        }
      }
      return true;
    },
    (ctx) => {
      if (t < 0) return;
      if (phase === 0) {
        const k = easeOut(t / flight);
        const mx = (sx + tx) / 2 + (tx < sx ? -60 : 60);
        const x = (1 - k) * (1 - k) * sx + 2 * (1 - k) * k * mx + k * k * tx;
        const y = (1 - k) * (1 - k) * sy + 2 * (1 - k) * k * (sy + ty) / 2 + k * k * ty;
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(glow("#a45cff", 64), x - 22, y - 22, 44, 44);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#050208";
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#ffd36b";
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        const k = clamp(bt / 0.4, 0, 1);
        const R = Rmax * k * (bt > dur - 0.3 ? clamp((dur - bt) / 0.3, 0.2, 1) : 1);
        drawBlackHole(ctx, tx, ty, R, bt * 1.4, 1);
      }
    }
  );
}

export type { Enemy };
