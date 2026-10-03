// 關卡背景：圖片多層視差 + 上下翻轉無縫拼接 + 雲霧轉場 + 環境粒子 + 閃電／巨型剪影事件
import { loadBg } from "../../assets";
import { H, W, rand, TAU } from "../constants";
import { glow, makeCanvas } from "./sprites";

interface Cloud {
  x: number;
  y: number;
  s: number;
  sp: number;
  a: number;
  k: number;
}
interface Mote {
  x: number;
  y: number;
  v: number;
  s: number;
  a: number;
  ph: number;
}
interface Flyby {
  x: number;
  y: number;
  s: number;
  kind: string;
  v: number;
}

export type BgKind = "city" | "ocean" | "ice" | "volcano" | "cyber" | "space";

export class Background {
  tiles: Record<string, HTMLCanvasElement | null> = {};
  scroll = 0;
  t = 0;
  a = "ocean";
  b = "city";
  mix = 0;
  kind: BgKind = "city";
  tint = "rgba(0,0,0,0)";
  cloudAmt = 0.15;
  cloudCol = "#ffffff";
  flash = 0;
  boltX = 0;
  boltT = 0;
  boltSeed = 0;
  wind = 0;
  clouds: Cloud[] = [];
  motes: Mote[] = [];
  puffs: Record<string, HTMLCanvasElement[]> = {};
  fly: Flyby | null = null;
  layers = 3;
  private moteKind: BgKind | "" = "";

  constructor() {
    for (let i = 0; i < 14; i++) this.clouds.push({ x: rand(-40, W + 40), y: rand(-200, H + 100), s: rand(0.8, 1.7), sp: rand(2.1, 3.3), a: rand(0.5, 1), k: i % 3 });
  }

  private tile(key: string): HTMLCanvasElement | null {
    if (this.tiles[key]) return this.tiles[key];
    const img = loadBg(key);
    if (!img.complete || !img.naturalWidth) return null;
    const TW = 600;
    const th = Math.round((img.naturalHeight * TW) / img.naturalWidth);
    const c = makeCanvas(TW, th * 2);
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0, TW, th);
    g.save();
    g.translate(0, th * 2);
    g.scale(1, -1);
    g.drawImage(img, 0, 0, TW, th);
    g.restore();
    this.tiles[key] = c;
    return c;
  }

  private getPuffs(color: string): HTMLCanvasElement[] {
    let p = this.puffs[color];
    if (p) return p;
    p = [];
    for (let k = 0; k < 3; k++) {
      const c = makeCanvas(300, 180);
      const g = c.getContext("2d")!;
      const n = 7 + k * 2;
      for (let i = 0; i < n; i++) {
        const x = 60 + (i / (n - 1)) * 180 + rand(-10, 10);
        const y = 90 + rand(-22, 22) * (1 - Math.abs(i / (n - 1) - 0.5) * 1.4);
        const r = rand(34, 62) * (1 - Math.abs(i / (n - 1) - 0.5) * 0.7);
        g.globalAlpha = 0.5;
        g.drawImage(glow(color, 128), x - r, y - r, r * 2, r * 2);
      }
      p.push(c);
    }
    this.puffs[color] = p;
    return p;
  }

  /** 每幀由 Game 設定：目前的兩張圖與混合比例、環境參數 */
  set(a: string, b: string, mix: number, kind: BgKind, tint: string, cloudAmt: number, cloudCol: string) {
    this.a = a;
    this.b = b;
    this.mix = mix;
    this.tint = tint;
    this.cloudAmt = cloudAmt;
    this.cloudCol = cloudCol;
    if (kind !== this.kind || this.moteKind !== kind) {
      this.kind = kind;
      this.initMotes(kind);
    }
  }

  private initMotes(kind: BgKind) {
    this.moteKind = kind;
    this.motes = [];
    const n = kind === "space" ? 70 : kind === "ocean" ? 46 : 60;
    for (let i = 0; i < n; i++) this.motes.push({ x: rand(W), y: rand(H), v: rand(0.5, 1), s: rand(0.6, 2.4), a: rand(0.3, 1), ph: rand(TAU) });
  }

  strike() {
    this.flash = 1;
    this.boltX = rand(60, W - 60);
    this.boltT = 0.22;
    this.boltSeed = Math.random() * 100;
  }

  flyby(kind: string) {
    this.fly = { x: rand(140, W - 140), y: -420, s: rand(1.3, 2), kind, v: 60 };
  }

  update(dt: number, speed: number) {
    this.t += dt;
    this.scroll += 60 * speed * dt;
    this.flash = Math.max(0, this.flash - dt * 3.2);
    this.boltT = Math.max(0, this.boltT - dt);
    for (const c of this.clouds) {
      c.y += 60 * speed * c.sp * dt;
      c.x += this.wind * 0.2 * dt;
      if (c.y > H + 120) {
        c.y = rand(-260, -140);
        c.x = rand(-60, W + 60);
        c.k = Math.floor(Math.random() * 3);
      }
    }
    const K = this.kind;
    for (const m of this.motes) {
      const sp = speed;
      switch (K) {
        case "city": m.y += (700 + m.v * 500) * dt * sp; m.x += (this.wind - 80) * dt; break;
        case "ice": m.y += (50 + m.v * 90) * dt * sp; m.x += Math.sin(this.t * 1.3 + m.ph) * 26 * dt + this.wind * dt; break;
        case "volcano": m.y -= (30 + m.v * 90) * dt; m.x += Math.sin(this.t * 2 + m.ph) * 22 * dt; break;
        case "cyber": m.y += (260 + m.v * 420) * dt * sp; break;
        case "space": m.y += (260 + m.v * 640) * dt * sp; break;
        default: m.y += 60 * dt * sp; break;
      }
      if (m.y > H + 20) { m.y = -20; m.x = rand(W); }
      if (m.y < -20) { m.y = H + 20; m.x = rand(W); }
      if (m.x < -20) m.x = W + 20;
      if (m.x > W + 20) m.x = -20;
    }
    if (this.fly) {
      this.fly.y += this.fly.v * speed * dt;
      if (this.fly.y > H + 500) this.fly = null;
    }
  }

  private layer(ctx: CanvasRenderingContext2D, key: string, scale: number, speed: number, alpha: number, offX = 0, comp: GlobalCompositeOperation = "source-over") {
    const c = this.tile(key);
    if (!c || alpha <= 0.01) return;
    const w = c.width * scale;
    const h = c.height * scale;
    const off = (this.scroll * speed) % h;
    const x = (W - w) / 2 + offX;
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = comp;
    // 以迴圈補滿整個畫面（上下翻轉的拼接圖可無縫循環）
    for (let y = off - h; y < H; y += h) ctx.drawImage(c, x, y, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 底色保底（圖片尚未載入時）
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, W, H);
    const m = this.mix;
    this.layer(ctx, this.a, 1, 1, 1);
    if (m > 0.001) this.layer(ctx, this.b, 1, 1, m);
    // 第二層：放大且更快，營造縱深
    if (this.layers >= 2) {
      const xo = Math.sin(this.t * 0.2) * 14;
      this.layer(ctx, this.a, 1.9, 2.3, (1 - m) * 0.55, xo, "overlay");
      if (m > 0.001) this.layer(ctx, this.b, 1.9, 2.3, m * 0.55, xo, "overlay");
    }
    // 壓暗底圖以提升子彈可讀性，再疊色彩分級
    ctx.fillStyle = "rgba(4,4,14,0.3)";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = this.tint;
    ctx.fillRect(0, 0, W, H);
    // 遠景剪影事件
    if (this.fly) this.drawFly(ctx, this.fly);
    // 環境粒子
    this.drawMotes(ctx);
    // 雲霧
    if (this.layers >= 2 && this.cloudAmt > 0.01) {
      const puffs = this.getPuffs(this.cloudCol);
      ctx.globalCompositeOperation = "source-over";
      const n = this.layers >= 3 ? this.clouds.length : 8;
      for (let i = 0; i < n; i++) {
        const c = this.clouds[i];
        ctx.globalAlpha = Math.min(1, c.a * this.cloudAmt);
        const sp = puffs[c.k];
        ctx.drawImage(sp, c.x - 150 * c.s, c.y - 90 * c.s, 300 * c.s, 180 * c.s);
      }
      ctx.globalAlpha = 1;
    }
    // 閃電
    if (this.flash > 0.01) {
      ctx.fillStyle = `rgba(230,240,255,${this.flash * 0.45})`;
      ctx.fillRect(0, 0, W, H);
      if (this.boltT > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        let x = this.boltX;
        ctx.moveTo(x, 0);
        for (let y = 0; y < 520; y += 26) {
          x += (Math.sin(this.boltSeed + y * 1.7) * 0.5 + Math.sin(y * 0.31 + this.boltSeed)) * 14;
          ctx.lineTo(x, y + 26);
        }
        ctx.stroke();
      }
    }
  }

  private drawMotes(ctx: CanvasRenderingContext2D) {
    const K = this.kind;
    const ms = this.motes;
    if (K === "city") {
      ctx.strokeStyle = "rgba(170,190,255,0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const lim = this.layers >= 3 ? ms.length : ms.length / 2;
      for (let i = 0; i < lim; i++) {
        const m = ms[i];
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x + 4, m.y - 22);
      }
      ctx.stroke();
      return;
    }
    if (K === "space" || K === "cyber") {
      ctx.strokeStyle = K === "space" ? "rgba(220,230,255,0.55)" : "rgba(255,80,110,0.4)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < ms.length; i++) {
        const m = ms[i];
        const L = 8 + m.v * (K === "space" ? 26 : 34);
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x, m.y - L);
      }
      ctx.stroke();
      return;
    }
    ctx.globalCompositeOperation = "lighter";
    const col = K === "volcano" ? "#ff8a2a" : K === "ocean" ? "#fff3c0" : "#e8f6ff";
    const spr = glow(col, 32);
    for (let i = 0; i < ms.length; i++) {
      const m = ms[i];
      let a = m.a;
      if (K === "ocean") a *= 0.5 + 0.5 * Math.sin(this.t * 3 + m.ph);
      ctx.globalAlpha = a * (K === "ice" ? 0.8 : 0.9);
      const s = m.s * (K === "volcano" ? 5 : K === "ice" ? 3.2 : 4);
      ctx.drawImage(spr, m.x - s, m.y - s, s * 2, s * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  private drawFly(ctx: CanvasRenderingContext2D, f: Flyby) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.scale(f.s, f.s);
    ctx.globalAlpha = 0.62;
    ctx.fillStyle = "#04040a";
    if (f.kind === "ship") {
      ctx.beginPath();
      ctx.moveTo(0, 210);
      ctx.lineTo(44, 130);
      ctx.lineTo(58, -60);
      ctx.lineTo(40, -180);
      ctx.lineTo(-40, -180);
      ctx.lineTo(-58, -60);
      ctx.lineTo(-44, 130);
      ctx.closePath();
      ctx.fill();
      ctx.fillRect(-90, -40, 180, 26);
      ctx.fillRect(-22, -110, 44, 60);
      ctx.fillStyle = "rgba(255,190,90,0.9)";
      for (let i = 0; i < 9; i++) ctx.fillRect(-32 + (i % 3) * 22, 20 + Math.floor(i / 3) * 30, 6, 3);
      ctx.fillStyle = "rgba(255,60,60,0.9)";
      ctx.fillRect(-92, -34, 4, 4);
      ctx.fillRect(88, -34, 4, 4);
    } else if (f.kind === "whale") {
      ctx.beginPath();
      ctx.ellipse(0, 0, 60, 220, 0, 0, TAU);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-40, -180);
      ctx.lineTo(0, -280);
      ctx.lineTo(40, -180);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-40, 60);
      ctx.lineTo(-150, 90);
      ctx.lineTo(-50, 110);
      ctx.moveTo(40, 60);
      ctx.lineTo(150, 90);
      ctx.lineTo(50, 110);
      ctx.fill();
    } else {
      // 環狀巨構
      ctx.strokeStyle = "#04040a";
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.arc(0, 0, 260, 0.2, Math.PI - 0.2);
      ctx.stroke();
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, 290, 0.3, Math.PI - 0.3);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
