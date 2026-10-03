// 星輝（星紋「變形」）：稜鏡脈衝／折射／機神變形／天穹方舟
import { H, TAU, W, clamp, easeOut, rand } from "../constants";
import { audio } from "../audio";
import { evoTier } from "../data/ships";
import { PAL } from "../render/fx";
import { glow } from "../render/sprites";
import { flame } from "../render/shipUtil";
import { mkFx } from "./common";
import type { ShipKit } from "./common";
import type { Game } from "../engine/Game";

function endMecha(g: Game) {
  const p = g.p;
  const al = g.lvl("active");
  const tier = evoTier(al);
  p.form = 0;
  p.dmgMul = 1;
  p.speedMul = 1;
  p.drMul = 1;
  audio.sfx("morph");
  g.flash("#9ff6ff", 0.6);
  g.shake(8, 0.3);
  g.clearBullets(p.x, p.y, 9999, "score");
  g.aoe(p.x, p.y, 320, 200 + al * 70, { pal: "cyan", noText: true });
  g.fx.ring(p.x, p.y, 20, 360, 0.5, "#7cf3ff", 8);
  g.fx.explosion(p.x, p.y, 44, PAL.cyan);
  if (tier >= 3) {
    g.aoe(p.x, p.y, 9999, 150 + al * 40, { pal: "white", noText: true });
    g.fx.ring(p.x, p.y, 20, 1000, 0.7, "#ffffff", 12);
  }
  for (let i = 0; i < 18; i++) g.fx.shard(p.x, p.y, rand(-300, 300), rand(-300, 300), 0.8, rand(3, 6), i % 2 ? "#7cf3ff" : "#ffffff", 200);
}

function refract(g: Game, x: number, y: number, n: number, lvl: number, left: number) {
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i ? 1 : -1) * rand(0.5, 1.1);
    g.spawnPB(x, y, a, 620, 15, 5 + lvl * 1.4, { r: 5, homing: 5, life: 1.2, src: 2, kind: 15, a: left });
  }
  g.fx.glowP(x, y, 0, 0, 0.2, 14, "#9ff6ff", 26, 0, 0.9);
}

export const prismKit: ShipKit = {
  init(g) {
    g.p.k = { vol: 0, missT: 0, chestT: 0 };
  },

  // ---------- 武裝：稜鏡脈衝／機神武裝 ----------
  fire(g, dt) {
    const p = g.p;
    const wl = g.lvl("weapon");
    const tier = evoTier(wl);
    p.k.missT -= 0.1;
    void dt;
    if (p.form === 0) {
      p.fireT += 0.105 / p.s.rate;
      p.k.vol++;
      audio.sfx("shoot5", 0.05);
      const n = 3 + Math.floor(p.power / 3) + p.s.extra;
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.07;
        g.spawnPB(p.x + (i - (n - 1) / 2) * 9, p.y - 26, a, 1150, 11, 6.2 + wl * 0.9, { r: 5, life: 1 });
      }
      if (p.k.vol % 5 === 0) {
        const m = 2 + (tier >= 1 ? 1 : 0);
        for (let i = 0; i < m; i++) {
          const s = i % 2 ? 1 : -1;
          g.spawnPB(p.x + s * 22, p.y - 6, -Math.PI / 2 + s * (0.5 + i * 0.12), 480, 12, 13 + wl * 2, { r: 6, homing: 5, life: 1.8, kind: 9, explode: 44 });
        }
      }
    } else {
      p.fireT += 0.055 / p.s.rate;
      p.k.vol++;
      audio.sfx("shoot5", 0.04);
      for (const s of [-1, 1]) {
        g.spawnPB(p.x + s * 20, p.y - 34, -Math.PI / 2 + rand(-0.035, 0.035), 1150, 13, 6.5 + wl * 1, { r: 5, life: 0.9, pierce: 1 });
      }
      if (p.k.vol % 7 === 0) {
        for (const s of [-1, 1]) g.spawnPB(p.x + s * 26, p.y - 40, -Math.PI / 2 + s * 0.18, 560, 14, 26 + wl * 4, { r: 8, homing: 4, life: 1.6, kind: 9, explode: 60 });
      }
      if (tier >= 2) {
        p.k.chestT -= 0.055;
        if (p.k.chestT <= 0) {
          p.k.chestT = 1.8;
          g.spawnPB(p.x, p.y - 40, -Math.PI / 2, 1200, 13, 52 + wl * 8, { r: 16, pierce: 30, life: 1, scale: 3.2 });
          audio.sfx("laser", 0.3);
        }
      }
    }
  },

  // ---------- 形態動畫、減傷與力場 ----------
  update(g, dt) {
    const p = g.p;
    const target = p.form === 1 ? 1 : 0;
    p.morph += clamp(target - p.morph, -1, 1) * Math.min(1, dt * 4);
    if (Math.abs(target - p.morph) < 0.02) p.morph = target;
    if (p.k.ark && p.form === 0) p.drMul = 0.5; // 方舟護航：受傷減半
    if (p.form === 1 && g.stateName === "playing") {
      const al = g.lvl("active");
      const tier = evoTier(al);
      p.formT -= dt;
      p.dmgMul = 1.6;
      p.speedMul = 0.9;
      p.drMul = 1 - (0.35 + (tier >= 1 ? 0.1 : 0));
      if (tier >= 2) {
        // 前方彈幕偏折力場
        for (const b of g.eb.items) {
          if (b.alive && Math.abs(b.x - p.x) < 52 && b.y < p.y + 12 && b.y > p.y - 130) {
            b.alive = false;
            g.fx.hit(b.x, b.y, "#7cf3ff");
            g.addUlt(0.15);
          }
        }
      }
      if (Math.random() < 0.4) g.fx.glowP(p.x + rand(-20, 20), p.y + 30, rand(-20, 20), rand(80, 180), 0.4, rand(6, 10), "#ffd66b", 2, 0, 0.8);
      if (p.formT <= 0) endMecha(g);
    }
  },

  // ---------- 被動：折射 ----------
  onHit(g, b, e) {
    const pl = g.lvl("passive");
    const tier = evoTier(pl);
    if (b.kind === 9) {
      g.aoe(b.x, b.y, b.explode || 50, b.dmg * 0.7, { pal: "cyan", noText: true, small: true, skip: e.uid });
      b.alive = false;
    }
    if (b.kind === 15) {
      if (tier >= 3) g.aoe(b.x, b.y, 44, b.dmg, { noFx: true, noText: true, skip: e.uid });
      if (b.a > 0 && Math.random() < 0.6) refract(g, b.x, b.y, 2, pl, b.a - 1);
      return;
    }
    if (b.src === 0 && Math.random() < 0.18 + pl * 0.03 + (tier >= 1 ? 0.12 : 0)) refract(g, b.x, b.y, 2, pl, tier >= 2 ? 1 : 0);
    const tw = evoTier(g.lvl("weapon"));
    if (tw >= 2 && b.src === 0 && b.kind === 0 && Math.random() < 0.12) {
      for (let i = -1; i <= 1; i += 2) g.spawnPB(b.x, b.y, -Math.PI / 2 + i * 0.7, 700, 16, b.dmg * 0.5, { r: 4, life: 0.5, src: 2 });
    }
  },

  // ---------- 主動：機神變形 ----------
  castActive(g) {
    const p = g.p;
    const al = g.lvl("active");
    const tier = evoTier(al);
    p.form = 1;
    p.formT = 10 + al + (tier >= 1 ? 2 : 0);
    p.inv = Math.max(p.inv, 1);
    audio.sfx("morph");
    g.flash("#9ff6ff", 0.5);
    g.shake(6, 0.3);
    g.tint("#3ad0ff", 0.14, 0.8);
    g.fx.ring(p.x, p.y, 10, 160, 0.5, "#7cf3ff", 6);
    for (let i = 0; i < 24; i++) g.fx.shard(p.x, p.y, rand(-260, 260), rand(-260, 260), 0.7, rand(3, 6), i % 2 ? "#7cf3ff" : "#ffffff", 100);
    g.fx.explosion(p.x, p.y, 30, PAL.cyan);
  },

  // ---------- 奧義：天穹方舟 ----------
  castUlt(g) {
    const p = g.p;
    const ul = g.lvl("ult");
    const tier = evoTier(ul);
    const T = 8 + (tier >= 1 ? 2 : 0);
    const RISE = 1.4;
    const LEAVE = 1.0;
    const turrets = 8 + (tier >= 1 ? 2 : 0);
    p.inv = Math.max(p.inv, 2.4);
    audio.sfx("ultgo");
    g.flash("#dff8ff", 0.8);
    g.shake(10, 1);
    let t = 0;
    let ax = W / 2;
    let mainFired = false;
    let tur = 0;
    let mis = 0;
    let healT = 0;
    const y0 = H - 250;
    const arkY = () => {
      if (t < RISE) return H + 330 - (H + 330 - y0) * easeOut(t / RISE);
      if (t > T + RISE) return y0 + (H + 340 - y0) * easeOut((t - T - RISE) / LEAVE);
      return y0 + Math.sin(t * 1.2) * 6;
    };
    mkFx(
      g,
      0,
      (dt) => {
        t += dt;
        ax += (W / 2 + (p.x - W / 2) * 0.35 - ax) * Math.min(1, dt * 2);
        const ay = arkY();
        const active = t > RISE * 0.6 && t < T + RISE;
        p.k.ark = active;
        if (active) {
          tur -= dt;
          if (tur <= 0) {
            tur = 0.09;
            for (let i = 0; i < turrets; i++) {
              const side = i % 2 ? 1 : -1;
              const row = Math.floor(i / 2);
              const tx = ax + side * (52 + (row % 2) * 40);
              const ty = ay - 140 + row * 46;
              const e = g.nearest(tx, ty, 9999);
              const a = e ? Math.atan2(e.y - ty, e.x - tx) : -Math.PI / 2 + side * 0.04 * (row + 1);
              g.spawnPB(tx, ty, a, 1250, 17, 7 + ul * 1.8, { r: 5, homing: 1, life: 1, src: 2, pierce: 1 });
            }
            if (Math.random() < 0.3) audio.sfx("shoot5", 0.06);
          }
          mis -= dt;
          if (mis <= 0) {
            mis = 0.55;
            for (let i = 0; i < 4; i++) {
              const side = i % 2 ? 1 : -1;
              g.spawnPB(ax + side * (86 + (i > 1 ? 24 : 0)), ay - 90, -Math.PI / 2 + side * 0.9, 380, 12, 20 + ul * 4, { r: 6, homing: 6, life: 2, kind: 9, explode: 56, src: 2 });
            }
          }
          healT -= dt;
          if (healT <= 0) {
            healT = 0.5;
            g.heal(p.maxHp * 0.012);
            if (tier >= 3) g.addUlt(3);
          }
          if (tier >= 2 && !mainFired && t > RISE + T * 0.55) {
            mainFired = true;
            audio.sfx("boom_l");
            g.flash("#ffffff", 0.7);
            g.shake(14, 0.5);
            for (let i = -1; i <= 1; i++) g.spawnPB(ax + i * 46, ay - 260, -Math.PI / 2, 1400, 3, 260 + ul * 80, { r: 22, pierce: 99, life: 1, scale: 3.4, src: 2 });
            g.fx.ring(ax, ay - 260, 10, 240, 0.5, "#ffffff", 10);
          }
        }
        if (t > T + RISE + LEAVE) {
          p.k.ark = false;
          return false;
        }
        return true;
      },
      (ctx) => {
        const ay = arkY();
        drawArk(ctx, ax, ay, g.t, turrets, g);
      }
    );
    void TAU;
  },

  drawUnder(g, ctx) {
    const p = g.p;
    if (p.form === 1 && evoTier(g.lvl("active")) >= 2) {
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(124,243,255,0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y - 20, 56, -Math.PI * 0.85, -Math.PI * 0.15);
      ctx.stroke();
      ctx.globalAlpha = 0.25;
      ctx.drawImage(glow("#7cf3ff", 128), p.x - 60, p.y - 90, 120, 100);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  },
};

/** 繪製同盟旗艦「方舟」：俯視巨艦，艦首朝上 */
function drawArk(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, turrets: number, g: Game) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = 0.96;
  // 引擎尾焰
  for (const ex of [-90, -45, 0, 45, 90]) flame(ctx, ex, 250, 90 + Math.sin(t * 30 + ex) * 12, 15, t, "#ffffff", "#7cf3ff", "rgba(40,120,255,0)");
  // 側翼甲板
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 60, -120);
    ctx.lineTo(s * 190, -20);
    ctx.lineTo(s * 214, 130);
    ctx.lineTo(s * 190, 200);
    ctx.lineTo(s * 80, 230);
    ctx.closePath();
    const gr = ctx.createLinearGradient(s * 60, 0, s * 214, 0);
    gr.addColorStop(0, "#c9d8ee");
    gr.addColorStop(1, "#5c6f92");
    ctx.fillStyle = gr;
    ctx.fill();
    ctx.strokeStyle = "rgba(10,14,28,0.9)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,211,107,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s * 80, -80);
    ctx.lineTo(s * 190, 10);
    ctx.lineTo(s * 200, 130);
    ctx.stroke();
    // 機庫艙口
    ctx.fillStyle = "#0a1226";
    ctx.fillRect(s * 120 - 20, 60, 40, 60);
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(124,243,255,${0.5 + 0.4 * Math.sin(t * 6 + s)})`;
    ctx.fillRect(s * 120 - 16, 64, 32, 6);
    ctx.globalCompositeOperation = "source-over";
  }
  // 主艦體
  ctx.beginPath();
  ctx.moveTo(0, -300);
  ctx.lineTo(44, -200);
  ctx.lineTo(70, -60);
  ctx.lineTo(80, 120);
  ctx.lineTo(64, 250);
  ctx.lineTo(-64, 250);
  ctx.lineTo(-80, 120);
  ctx.lineTo(-70, -60);
  ctx.lineTo(-44, -200);
  ctx.closePath();
  const hg = ctx.createLinearGradient(-80, 0, 80, 0);
  hg.addColorStop(0, "#5c6f92");
  hg.addColorStop(0.5, "#f2f8ff");
  hg.addColorStop(1, "#5c6f92");
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.strokeStyle = "rgba(10,14,28,0.95)";
  ctx.lineWidth = 4;
  ctx.stroke();
  // 甲板分割線
  ctx.strokeStyle = "rgba(30,44,80,0.6)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.moveTo(-70, -230 + i * 56);
    ctx.lineTo(70, -230 + i * 56);
    ctx.stroke();
  }
  // 金色龍骨
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -290);
  ctx.lineTo(0, 240);
  ctx.stroke();
  // 艦橋
  ctx.fillStyle = "#dfe9fa";
  ctx.beginPath();
  ctx.moveTo(-30, 20);
  ctx.lineTo(30, 20);
  ctx.lineTo(22, 110);
  ctx.lineTo(-22, 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(124,243,255,0.9)";
  ctx.fillRect(-18, 34, 36, 8);
  const pl = 0.6 + 0.4 * Math.sin(t * 4);
  ctx.drawImage(glow("#7cf3ff", 128), -60, 20, 120, 120);
  ctx.globalAlpha = pl;
  ctx.drawImage(glow("#ffffff", 64), -18, 50, 36, 36);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // 炮塔
  for (let i = 0; i < turrets; i++) {
    const side = i % 2 ? 1 : -1;
    const row = Math.floor(i / 2);
    const tx = side * (52 + (row % 2) * 40);
    const ty = -140 + row * 46;
    const e = g.nearest(x + tx, y + ty, 9999);
    const a = e ? Math.atan2(e.y - (y + ty), e.x - (x + tx)) + Math.PI / 2 : 0;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.fillStyle = "#8c9cc0";
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "#0a1226";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.rotate(a);
    ctx.fillStyle = "#2a3654";
    ctx.fillRect(-3, -30, 6, 30);
    ctx.restore();
  }
  // 艦艏主砲
  ctx.fillStyle = "#2a3654";
  ctx.fillRect(-20, -290, 40, 60);
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(glow("#ffd36b", 64), -26, -300, 52, 52);
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
  ctx.globalAlpha = 1;
}
