// 粒子與特效系統：爆炸、火花、環形衝擊波、漂浮數字。全部走物件池
import { Pool, makeParticle, makeText } from "../entities";
import type { Particle, FloatText } from "../entities";
import { TAU, rand } from "../constants";
import { glow } from "./sprites";

export interface Palette {
  core: string;
  mid: string;
  edge: string;
  smoke: string;
}
export const PAL: Record<string, Palette> = {
  fire: { core: "#fff6c8", mid: "#ffb347", edge: "#ff3a1a", smoke: "#2b1a18" },
  ice: { core: "#f0fdff", mid: "#7fe4ff", edge: "#2f8dff", smoke: "#16283a" },
  elec: { core: "#fffbd0", mid: "#c58bff", edge: "#6a3dff", smoke: "#1a1230" },
  void: { core: "#f2d8ff", mid: "#a45cff", edge: "#3a1a80", smoke: "#0d0618" },
  jade: { core: "#f0fff8", mid: "#3dffb0", edge: "#11a06a", smoke: "#0a2a20" },
  gold: { core: "#ffffff", mid: "#ffd36b", edge: "#ff8a1a", smoke: "#2a2010" },
  cyan: { core: "#ffffff", mid: "#7cf3ff", edge: "#2a9cff", smoke: "#0c2430" },
  red: { core: "#ffffff", mid: "#ff5a6e", edge: "#b0081f", smoke: "#2a0a10" },
  white: { core: "#ffffff", mid: "#e8f0ff", edge: "#9cb4ff", smoke: "#202838" },
};

export class FxSys {
  ps = new Pool<Particle>(makeParticle);
  texts = new Pool<FloatText>(makeText);
  max = 900;
  pMul = 1;
  showText = true;

  private get(): Particle | null {
    if (this.ps.items.length >= this.max) return null;
    const p = this.ps.spawn();
    p.spr = null;
    p.a0 = 1;
    p.drag = 0;
    p.grav = 0;
    p.rot = 0;
    p.vr = 0;
    p.size2 = 0;
    p.kind = 0;
    p.w = 2;
    return p;
  }

  /** 光暈粒子 */
  glowP(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, size2 = 0, drag = 0, a0 = 1) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.size = size; p.size2 = size2; p.spr = glow(color); p.color = color; p.drag = drag; p.a0 = a0; p.kind = 0;
    return p;
  }

  /** 火花線粒子 */
  spark(x: number, y: number, vx: number, vy: number, life: number, w: number, color: string, drag = 0.5) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.w = w; p.color = color; p.drag = drag; p.kind = 1; p.size = 1;
    return p;
  }

  /** 擴散環 */
  ring(x: number, y: number, r0: number, r1: number, life: number, color: string, width = 4) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = 0; p.vy = 0; p.life = p.max = life; p.size = r0; p.size2 = r1; p.color = color; p.w = width; p.kind = 2;
    return p;
  }

  shard(x: number, y: number, vx: number, vy: number, life: number, size: number, color: string, grav = 0) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.size = size; p.color = color; p.kind = 3; p.rot = rand(TAU); p.vr = rand(-10, 10); p.grav = grav; p.drag = 0.4;
    return p;
  }

  smoke(x: number, y: number, vx: number, vy: number, life: number, size: number, size2: number, color = "#2b1a18", a0 = 0.5) {
    const p = this.get();
    if (!p) return null;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = p.max = life; p.size = size; p.size2 = size2; p.spr = glow(color); p.color = color; p.kind = 4; p.a0 = a0; p.drag = 1.2;
    return p;
  }

  /** 放射狀火花爆發 */
  burst(x: number, y: number, n: number, color: string, s0: number, s1: number, life: number, w = 2.4) {
    n = Math.round(n * this.pMul);
    for (let i = 0; i < n; i++) {
      const a = rand(TAU);
      const s = rand(s0, s1);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(life * 0.6, life), w, color);
    }
  }

  /** 定向錐形火花 */
  cone(x: number, y: number, ang: number, spread: number, n: number, color: string, s0: number, s1: number, life: number, w = 2.2) {
    n = Math.round(n * this.pMul);
    for (let i = 0; i < n; i++) {
      const a = ang + rand(-spread, spread);
      const s = rand(s0, s1);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(life * 0.6, life), w, color);
    }
  }

  /** 綜合爆炸：核心閃光 + 火花 + 碎片 + 衝擊環 + 煙 */
  explosion(x: number, y: number, size: number, pal: Palette = PAL.fire) {
    const m = this.pMul;
    this.glowP(x, y, 0, 0, 0.18 + size * 0.006, size * 1.7, pal.core, size * 2.4, 0, 1);
    this.glowP(x, y, 0, 0, 0.32 + size * 0.008, size * 2.1, pal.mid, size * 3, 0, 0.75);
    this.ring(x, y, size * 0.3, size * 2.2, 0.3 + size * 0.005, pal.mid, Math.max(2, size * 0.12));
    const n = Math.round((6 + size * 0.5) * m);
    for (let i = 0; i < n; i++) {
      const a = rand(TAU);
      const s = rand(60, 120 + size * 6);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.25, 0.6), rand(1.6, 3.2), Math.random() < 0.5 ? pal.mid : pal.core);
    }
    const ns = Math.round((2 + size * 0.15) * m);
    for (let i = 0; i < ns; i++) {
      const a = rand(TAU);
      const s = rand(40, 100 + size * 3);
      this.shard(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.4, 0.9), rand(2, 4 + size * 0.1), Math.random() < 0.5 ? pal.edge : pal.mid, 120);
    }
    if (size > 14) {
      const nsm = Math.round((2 + size * 0.06) * m);
      for (let i = 0; i < nsm; i++) this.smoke(x + rand(-size, size) * 0.5, y + rand(-size, size) * 0.5, rand(-20, 20), rand(-20, 20), rand(0.6, 1.1), size * 0.7, size * 1.8, pal.smoke, 0.5);
    }
  }

  hit(x: number, y: number, color: string) {
    this.glowP(x, y, 0, 0, 0.09, 12, color, 22, 0, 0.9);
    const n = Math.round(3 * this.pMul);
    for (let i = 0; i < n; i++) {
      const a = rand(-Math.PI, 0) + rand(-0.4, 0.4);
      const s = rand(80, 200);
      this.spark(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.1, 0.25), 1.6, color);
    }
  }

  text(x: number, y: number, str: string, color = "#fff", size = 14, life = 0.7) {
    if (!this.showText || this.texts.items.length > 40) return;
    const t = this.texts.spawn();
    t.x = x; t.y = y; t.text = str; t.color = color; t.size = size; t.life = t.max = life; t.vy = -60;
  }

  update(dt: number) {
    const a = this.ps.items;
    for (let i = a.length - 1; i >= 0; i--) {
      const p = a[i];
      p.life -= dt;
      if (p.life <= 0 || !p.alive) {
        this.ps.kill(i);
        continue;
      }
      if (p.drag) {
        const d = Math.max(0, 1 - p.drag * dt);
        p.vx *= d;
        p.vy *= d;
      }
      p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    const t = this.texts.items;
    for (let i = t.length - 1; i >= 0; i--) {
      const f = t[i];
      f.life -= dt;
      if (f.life <= 0) {
        this.texts.kill(i);
        continue;
      }
      f.y += f.vy * dt;
      f.vy *= 1 - 3 * dt;
    }
  }

  drawSmoke(ctx: CanvasRenderingContext2D) {
    const a = this.ps.items;
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < a.length; i++) {
      const p = a[i];
      if (p.kind !== 4) continue;
      const r = p.life / p.max;
      const s = p.size + (p.size2 - p.size) * (1 - r);
      ctx.globalAlpha = p.a0 * r;
      ctx.drawImage(p.spr!, p.x - s, p.y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const a = this.ps.items;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < a.length; i++) {
      const p = a[i];
      const r = p.life / p.max;
      switch (p.kind) {
        case 0: {
          const s = p.size2 ? p.size + (p.size2 - p.size) * (1 - r) : p.size * (0.4 + r * 0.6);
          ctx.globalAlpha = Math.min(1, p.a0 * r * 1.4);
          ctx.drawImage(p.spr!, p.x - s, p.y - s, s * 2, s * 2);
          break;
        }
        case 1: {
          ctx.globalAlpha = Math.min(1, r * 1.6);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.w * (0.4 + r * 0.6);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045);
          ctx.stroke();
          break;
        }
        case 2: {
          const rad = p.size + (p.size2 - p.size) * (1 - r * r);
          ctx.globalAlpha = Math.min(1, r * 1.5);
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(0.5, p.w * r);
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, TAU);
          ctx.stroke();
          break;
        }
        case 3: {
          ctx.globalAlpha = Math.min(1, r * 1.8);
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          const s = p.size * (0.5 + r * 0.5);
          ctx.beginPath();
          ctx.moveTo(s, 0);
          ctx.lineTo(-s * 0.6, s * 0.7);
          ctx.lineTo(-s * 0.4, -s * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  drawTexts(ctx: CanvasRenderingContext2D) {
    const t = this.texts.items;
    if (!t.length) return;
    ctx.textAlign = "center";
    ctx.lineJoin = "round";
    for (let i = 0; i < t.length; i++) {
      const f = t[i];
      const r = f.life / f.max;
      ctx.globalAlpha = Math.min(1, r * 2);
      ctx.font = `900 ${f.size * (r > 0.85 ? 1 + (r - 0.85) * 3 : 1)}px "Bebas Neue", Impact, "Noto Sans TC", sans-serif`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.ps.clear();
    this.texts.clear();
  }
}
