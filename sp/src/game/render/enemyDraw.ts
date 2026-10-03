// 敵機精靈：依「機種 x 關卡配色」預渲染成離屏 Canvas，含受擊閃白版本
import { TAU } from "../constants";
import { ENEMIES, THEME_PAL } from "../data/enemies";
import { makeCanvas } from "./sprites";

export interface ESprite {
  n: HTMLCanvasElement;
  f: HTMLCanvasElement;
  s: number;
  spin: boolean;
  aim: boolean;
}

type Pal = (typeof THEME_PAL)[number];
type Pt = [number, number];
const cache = new Map<string, ESprite>();
const SS = 2; // 精靈解析度倍率

function hull(g: CanvasRenderingContext2D, pts: Pt[], p: Pal, x0 = -20, x1 = 20) {
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]);
  g.closePath();
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, p.h2);
  gr.addColorStop(0.5, p.h1);
  gr.addColorStop(1, p.h2);
  g.fillStyle = gr;
  g.fill();
  g.strokeStyle = "rgba(6,4,10,0.92)";
  g.lineWidth = 1.3;
  g.lineJoin = "round";
  g.stroke();
}

function glowDot(g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, "#fff");
  gr.addColorStop(0.35, c);
  gr.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = gr;
  g.beginPath();
  g.arc(x, y, r, 0, TAU);
  g.fill();
}

function sym(g: CanvasRenderingContext2D, fn: () => void) {
  fn();
  g.save();
  g.scale(-1, 1);
  fn();
  g.restore();
}

const DRAW: Record<string, (g: CanvasRenderingContext2D, p: Pal) => void> = {
  scout(g, p) {
    hull(g, [[0, 17], [5, 4], [16, -6], [17, -13], [6, -9], [0, -13], [-6, -9], [-17, -13], [-16, -6], [-5, 4]], p);
    glowDot(g, 0, 4, 5, p.ac);
    glowDot(g, 0, -11, 4, p.gl);
  },
  dart(g, p) {
    hull(g, [[0, 18], [4, 2], [12, -10], [13, -16], [3, -9], [0, -12], [-3, -9], [-13, -16], [-12, -10], [-4, 2]], p);
    glowDot(g, 0, 2, 4, p.ac);
  },
  wing(g, p) {
    hull(g, [[0, 14], [6, 5], [19, -4], [18, -12], [7, -8], [0, -11], [-7, -8], [-18, -12], [-19, -4], [-6, 5]], p);
    sym(g, () => glowDot(g, 12, -6, 3.4, p.ac));
    glowDot(g, 0, 3, 4, p.gl);
  },
  sentry(g, p) {
    sym(g, () => {
      hull(g, [[10, -4], [17, 2], [17, 14], [12, 14], [10, 4]], p);
      g.fillStyle = "#111";
      g.fillRect(13.6, 12, 2.4, 6);
    });
    hull(g, [[0, 16], [9, 7], [12, -6], [6, -15], [-6, -15], [-12, -6], [-9, 7]], p);
    glowDot(g, 0, 2, 6.5, p.ac);
    g.fillStyle = "#0a0410";
    g.beginPath();
    g.ellipse(0, 2, 2, 4.4, 0, 0, TAU);
    g.fill();
  },
  spinner(g, p) {
    for (let i = 0; i < 4; i++) {
      g.save();
      g.rotate((i * TAU) / 4);
      hull(g, [[0, -6], [4, -12], [3, -19], [-3, -19], [-5, -12]], p);
      g.restore();
    }
    g.beginPath();
    g.arc(0, 0, 9, 0, TAU);
    g.fillStyle = p.h2;
    g.fill();
    g.strokeStyle = "#060410";
    g.lineWidth = 1.3;
    g.stroke();
    glowDot(g, 0, 0, 7.5, p.ac);
  },
  heavy(g, p) {
    sym(g, () => {
      hull(g, [[12, -8], [19, -2], [19, 10], [14, 18], [11, 10]], p);
      g.fillStyle = "#0c0810";
      g.fillRect(14.6, 10, 3, 9);
      glowDot(g, 16, 19, 3.4, p.ac);
    });
    hull(g, [[0, 15], [10, 10], [13, -4], [9, -15], [-9, -15], [-13, -4], [-10, 10]], p);
    hull(g, [[0, 8], [6, 3], [6, -8], [-6, -8], [-6, 3]], { ...p, h1: p.h2, h2: p.h1 });
    glowDot(g, 0, -1, 5, p.ac);
    sym(g, () => {
      g.strokeStyle = p.ac;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(3, -12);
      g.lineTo(9, -4);
      g.stroke();
    });
  },
  kami(g, p) {
    sym(g, () => {
      hull(g, [[6, 6], [16, 10], [12, 0], [15, -8], [5, -4]], p);
    });
    hull(g, [[0, 16], [7, 4], [7, -8], [0, -14], [-7, -8], [-7, 4]], p);
    glowDot(g, 0, 2, 6, "#ff3b52");
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(0, 2, 1.8, 0, TAU);
    g.fill();
  },
  turret(g, p) {
    g.fillStyle = p.h2;
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * TAU) / 8 + 0.4;
      const r = 15;
      if (i === 0) g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    g.closePath();
    g.fill();
    g.strokeStyle = "#060410";
    g.lineWidth = 1.4;
    g.stroke();
    hull(g, [[-5, 0], [5, 0], [4, 19], [-4, 19]], p);
    g.beginPath();
    g.arc(0, 0, 8.5, 0, TAU);
    g.fillStyle = p.h1;
    g.fill();
    g.stroke();
    glowDot(g, 0, 0, 5, p.ac);
    glowDot(g, 0, 19, 3, p.gl);
  },
  minelayer(g, p) {
    hull(g, [[0, 12], [12, 8], [19, -4], [17, -14], [8, -16], [0, -12], [-8, -16], [-17, -14], [-19, -4], [-12, 8]], p);
    sym(g, () => {
      g.fillStyle = "#0a0810";
      g.beginPath();
      g.arc(10, -2, 4, 0, TAU);
      g.fill();
      glowDot(g, 10, -2, 3.2, p.ac);
    });
    glowDot(g, 0, 2, 5, p.ac);
    hull(g, [[0, 15], [4, 8], [-4, 8]], p);
  },
  sniper(g, p) {
    hull(g, [[-4, -14], [4, -14], [5, 8], [0, 12], [-5, 8]], p);
    sym(g, () => hull(g, [[4, -4], [14, -12], [14, -6], [5, 5]], p));
    hull(g, [[-1.6, 8], [1.6, 8], [1.6, 22], [-1.6, 22]], { ...p, h1: "#aab", h2: "#223" });
    glowDot(g, 0, -3, 4.5, p.ac);
    glowDot(g, 0, 22, 2.6, p.gl);
  },
  cruiser(g, p) {
    hull(g, [[0, 20], [8, 12], [10, -8], [7, -19], [-7, -19], [-10, -8], [-8, 12]], p);
    sym(g, () => {
      hull(g, [[10, -12], [19, -6], [19, 6], [10, 2]], p);
      hull(g, [[9, 6], [16, 12], [16, 18], [9, 14]], p);
    });
    g.fillStyle = "#0a0810";
    g.beginPath();
    g.moveTo(0, 20);
    g.lineTo(4, 8);
    g.lineTo(-4, 8);
    g.closePath();
    g.fill();
    glowDot(g, 0, 10, 7, p.ac);
    glowDot(g, 0, -6, 4.5, p.gl);
  },
  ghost(g, p) {
    hull(g, [[0, 16], [8, 6], [18, 4], [12, -4], [16, -14], [6, -8], [0, -16], [-6, -8], [-16, -14], [-12, -4], [-18, 4], [-8, 6]], { ...p, h1: p.gl, h2: p.h2 });
    glowDot(g, -4, 2, 3.4, "#fff");
    glowDot(g, 4, 2, 3.4, "#fff");
    g.fillStyle = "#07030f";
    g.fillRect(-5, 1, 3, 2);
    g.fillRect(2, 1, 3, 2);
  },
  carrier(g, p) {
    hull(g, [[0, 19], [10, 12], [12, -10], [8, -19], [-8, -19], [-12, -10], [-10, 12]], p);
    sym(g, () => {
      hull(g, [[12, -14], [20, -12], [20, 8], [12, 10]], p);
      g.fillStyle = "#0a0810";
      g.fillRect(14, -8, 4, 10);
      glowDot(g, 16, -3, 2.6, p.ac);
    });
    g.fillStyle = "#0a0810";
    g.fillRect(-4, 0, 8, 12);
    glowDot(g, 0, 6, 4.4, p.ac);
    glowDot(g, 0, -10, 3.6, p.gl);
  },
  aegis(g, p) {
    hull(g, [[0, 16], [10, 8], [14, -6], [8, -15], [-8, -15], [-14, -6], [-10, 8]], p);
    sym(g, () => hull(g, [[13, -2], [19, 4], [16, 12], [12, 8]], p));
    glowDot(g, 0, 0, 6, p.ac);
    g.strokeStyle = p.gl;
    g.lineWidth = 1.2;
    g.beginPath();
    g.arc(0, 0, 9.5, 0, TAU);
    g.stroke();
  },
  orbiter(g, p) {
    hull(g, [[0, 12], [10, 0], [0, -12], [-10, 0]], p);
    glowDot(g, 0, 0, 5, p.ac);
    g.strokeStyle = p.gl;
    g.lineWidth = 1.1;
    g.beginPath();
    g.ellipse(0, 0, 15, 5, 0.5, 0, TAU);
    g.stroke();
  },
  mid_gunship(g, p) {
    sym(g, () => {
      hull(g, [[6, -6], [20, -14], [20, 0], [12, 10], [6, 6]], p);
      hull(g, [[10, 8], [17, 8], [16, 19], [11, 19]], p);
      glowDot(g, 13.5, 19, 3.2, p.ac);
    });
    hull(g, [[0, 18], [8, 10], [10, -6], [6, -17], [-6, -17], [-10, -6], [-8, 10]], p);
    glowDot(g, 0, 2, 7, p.ac);
    hull(g, [[0, 10], [3, 3], [-3, 3]], { ...p, h1: p.gl });
    glowDot(g, 0, -12, 4, p.gl);
  },
  mid_walker(g, p) {
    for (let i = 0; i < 3; i++) {
      sym(g, () => {
        g.strokeStyle = "#060410";
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(8, -6 + i * 8);
        g.lineTo(17, -2 + i * 9);
        g.lineTo(19, 3 + i * 8);
        g.stroke();
        g.strokeStyle = p.h1;
        g.lineWidth = 3;
        g.stroke();
      });
    }
    hull(g, [[0, 14], [11, 8], [13, -6], [7, -16], [-7, -16], [-13, -6], [-11, 8]], p);
    hull(g, [[0, 9], [6, 4], [6, -8], [-6, -8], [-6, 4]], { ...p, h1: p.h2, h2: p.h1 });
    glowDot(g, 0, -2, 6.5, p.ac);
    sym(g, () => {
      g.fillStyle = "#0a0810";
      g.fillRect(9, 8, 3, 9);
      glowDot(g, 10.5, 17, 2.4, p.ac);
    });
  },
  mid_cruiser(g, p) {
    hull(g, [[0, 20], [9, 14], [11, -8], [7, -19], [-7, -19], [-11, -8], [-9, 14]], p);
    sym(g, () => {
      hull(g, [[10, -14], [20, -8], [19, 6], [10, 4]], p);
      hull(g, [[10, 8], [17, 8], [17, 18], [10, 16]], p);
      glowDot(g, 14, 12, 3, p.ac);
      glowDot(g, 15, -3, 3.2, p.gl);
    });
    hull(g, [[0, 14], [5, 6], [-5, 6]], { ...p, h1: p.ac });
    glowDot(g, 0, -6, 6, p.ac);
  },
};

export function enemySprite(id: string, theme: number): ESprite {
  const key = id + "|" + theme;
  let s = cache.get(key);
  if (s) return s;
  const def = ENEMIES[id];
  const size = def.size;
  const px = Math.ceil(size * SS);
  const pal = THEME_PAL[theme % THEME_PAL.length];
  const c = makeCanvas(px, px);
  const g = c.getContext("2d")!;
  g.translate(px / 2, px / 2);
  g.scale(px / 44, px / 44); // 設計空間 ±20（留 2 單位邊界）
  (DRAW[id] || DRAW.scout)(g, pal);
  // 受擊閃白版本
  const f = makeCanvas(px, px);
  const fg = f.getContext("2d")!;
  fg.drawImage(c, 0, 0);
  fg.globalCompositeOperation = "source-atop";
  fg.fillStyle = "rgba(255,255,255,0.78)";
  fg.fillRect(0, 0, px, px);
  s = { n: c, f, s: size, spin: id === "spinner" || id === "orbiter", aim: id === "turret" || id === "sniper" };
  cache.set(key, s);
  return s;
}

export function drawEnemySprite(ctx: CanvasRenderingContext2D, sp: ESprite, x: number, y: number, scale: number, rot: number, flash: boolean, alpha = 1) {
  const S = sp.s * scale;
  if (alpha < 1) ctx.globalAlpha = alpha;
  if (rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.drawImage(flash ? sp.f : sp.n, -S / 2, -S / 2, S, S);
    ctx.restore();
  } else {
    ctx.drawImage(flash ? sp.f : sp.n, x - S / 2, y - S / 2, S, S);
  }
  if (alpha < 1) ctx.globalAlpha = 1;
}
