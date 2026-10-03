// 預渲染精靈：光暈、敵彈、我方子彈。全部以離屏 Canvas 快取，drawImage 繪製以維持 60FPS
import { TAU } from "../constants";

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

const glowCache = new Map<string, HTMLCanvasElement>();
/** 徑向漸層光暈精靈（中心亮、邊緣透明） */
export function glow(color: string, size = 64): HTMLCanvasElement {
  const key = color + size;
  let c = glowCache.get(key);
  if (c) return c;
  c = makeCanvas(size, size);
  const g = c.getContext("2d")!;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, color);
  grad.addColorStop(0.25, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.globalAlpha = 1;
  g.fillRect(0, 0, size, size);
  // 讓漸層真正過渡到透明（依顏色）
  g.globalCompositeOperation = "destination-in";
  const mask = g.createRadialGradient(r, r, 0, r, r, r);
  mask.addColorStop(0, "rgba(0,0,0,1)");
  mask.addColorStop(0.3, "rgba(0,0,0,0.75)");
  mask.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = mask;
  g.fillRect(0, 0, size, size);
  glowCache.set(key, c);
  return c;
}

// ---------------- 敵彈精靈 ----------------
export const EB_COLORS = ["#ff3b6b", "#ff9a3d", "#ffe45c", "#5fe0ff", "#b26bff", "#8dff7a", "#ffffff"];
// 半徑（碰撞用）
export const EB_R = [5, 3.4, 10, 3.2, 5.5, 16, 4];
const ebCache: HTMLCanvasElement[][] = [];

function buildEB(type: number, col: string): HTMLCanvasElement {
  const rad = EB_R[type];
  const S = (type === 3 ? 22 : type === 6 ? 14 : rad + 8) * 2;
  const c = makeCanvas(S, S);
  const g = c.getContext("2d")!;
  g.translate(S / 2, S / 2);
  // 外光暈
  g.fillStyle = col;
  g.globalAlpha = 0.28;
  g.beginPath();
  g.arc(0, 0, S / 2 - 1, 0, TAU);
  g.fill();
  g.globalAlpha = 1;
  const outline = "rgba(20,0,10,0.9)";
  if (type === 0 || type === 1 || type === 2 || type === 5) {
    const R = rad + 2.2;
    g.fillStyle = outline;
    g.beginPath();
    g.arc(0, 0, R + 1.6, 0, TAU);
    g.fill();
    g.fillStyle = col;
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.fill();
    const grd = g.createRadialGradient(-R * 0.25, -R * 0.25, 0, 0, 0, R);
    grd.addColorStop(0, "#fff");
    grd.addColorStop(0.5, "rgba(255,255,255,0.85)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.beginPath();
    g.arc(0, 0, R * 0.85, 0, TAU);
    g.fill();
    if (type === 2 || type === 5) {
      g.strokeStyle = "rgba(255,255,255,0.7)";
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(0, 0, R * 0.62, 0, TAU);
      g.stroke();
    }
  } else if (type === 3) {
    // 針彈（朝 +x）
    const L = 15;
    g.fillStyle = outline;
    g.beginPath();
    g.moveTo(L + 2, 0);
    g.lineTo(-L * 0.6, -4.2);
    g.lineTo(-L, 0);
    g.lineTo(-L * 0.6, 4.2);
    g.closePath();
    g.fill();
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(L, 0);
    g.lineTo(-L * 0.6, -2.8);
    g.lineTo(-L * 0.85, 0);
    g.lineTo(-L * 0.6, 2.8);
    g.closePath();
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(L * 0.8, 0);
    g.lineTo(-L * 0.4, -1.1);
    g.lineTo(-L * 0.4, 1.1);
    g.closePath();
    g.fill();
  } else if (type === 4) {
    // 菱形苦無
    const R = 7.5;
    g.fillStyle = outline;
    g.beginPath();
    g.moveTo(R + 2, 0);
    g.lineTo(0, -R * 0.62 - 1.5);
    g.lineTo(-R * 0.9, 0);
    g.lineTo(0, R * 0.62 + 1.5);
    g.closePath();
    g.fill();
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(R, 0);
    g.lineTo(0, -R * 0.6);
    g.lineTo(-R * 0.8, 0);
    g.lineTo(0, R * 0.6);
    g.closePath();
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(R * 0.6, 0);
    g.lineTo(0, -R * 0.24);
    g.lineTo(-R * 0.4, 0);
    g.lineTo(0, R * 0.24);
    g.closePath();
    g.fill();
  } else {
    // 米粒彈
    g.fillStyle = outline;
    g.beginPath();
    g.ellipse(0, 0, 6.8, 4.4, 0, 0, TAU);
    g.fill();
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(0, 0, 5.4, 3.2, 0, 0, TAU);
    g.fill();
    g.fillStyle = "#fff";
    g.beginPath();
    g.ellipse(0.6, 0, 3, 1.5, 0, 0, TAU);
    g.fill();
  }
  return c;
}

export function ebSprite(type: number, color: number): HTMLCanvasElement {
  if (!ebCache[type]) ebCache[type] = [];
  let c = ebCache[type][color];
  if (!c) {
    c = buildEB(type, EB_COLORS[color % EB_COLORS.length]);
    ebCache[type][color] = c;
  }
  return c;
}

// ---------------- 我方子彈精靈（朝上；additive 疊加） ----------------
export interface PBStyle {
  spr: HTMLCanvasElement;
  dir: boolean; // 是否依速度方向旋轉
  spin: boolean;
}
const pbStyles: PBStyle[] = [];

function mk(w: number, h: number, fn: (g: CanvasRenderingContext2D, w: number, h: number) => void, dir = true, spin = false): PBStyle {
  const c = makeCanvas(w, h);
  const g = c.getContext("2d")!;
  g.translate(w / 2, h / 2);
  fn(g, w, h);
  return { spr: c, dir, spin };
}

function teardrop(g: CanvasRenderingContext2D, len: number, wd: number, c0: string, c1: string, c2: string) {
  const grad = g.createLinearGradient(0, len / 2, 0, -len / 2);
  grad.addColorStop(0, c2);
  grad.addColorStop(0.5, c1);
  grad.addColorStop(1, c0);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.bezierCurveTo(wd, -len * 0.15, wd * 0.9, len * 0.3, 0, len / 2);
  g.bezierCurveTo(-wd * 0.9, len * 0.3, -wd, -len * 0.15, 0, -len / 2);
  g.fill();
}

function needle(g: CanvasRenderingContext2D, len: number, wd: number, core: string, edge: string) {
  const grad = g.createLinearGradient(0, len / 2, 0, -len / 2);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.35, edge);
  grad.addColorStop(1, core);
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.lineTo(wd, len * 0.1);
  g.lineTo(0, len / 2);
  g.lineTo(-wd, len * 0.1);
  g.closePath();
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.moveTo(0, -len / 2);
  g.lineTo(wd * 0.35, len * 0.05);
  g.lineTo(-wd * 0.35, len * 0.05);
  g.closePath();
  g.fill();
}

function crescent(g: CanvasRenderingContext2D, R: number, thick: number, c1: string, c2: string) {
  const grad = g.createRadialGradient(0, 0, R - thick, 0, 0, R + 2);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, R, Math.PI * 1.08, Math.PI * 1.92);
  g.arc(0, R * 0.42, R - thick * 0.2, Math.PI * 1.9, Math.PI * 1.1, true);
  g.closePath();
  g.fill();
}

function orb(g: CanvasRenderingContext2D, r: number, c0: string, c1: string) {
  const grad = g.createRadialGradient(0, 0, 0, 0, 0, r);
  grad.addColorStop(0, c0);
  grad.addColorStop(0.45, c1);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.fill();
}

function buildPB() {
  // 0 緋鴉：焰羽
  pbStyles[0] = mk(26, 46, (g) => {
    orb(g, 13, "rgba(255,120,40,0.5)", "rgba(255,60,20,0.15)");
    teardrop(g, 40, 6.5, "#ffffff", "#ffb347", "#ff3a1a");
  });
  // 1 鳳凰火球（大）
  pbStyles[1] = mk(56, 80, (g) => {
    orb(g, 28, "rgba(255,200,80,0.7)", "rgba(255,80,20,0.25)");
    teardrop(g, 72, 15, "#ffffff", "#ffd66b", "#ff3a1a");
  });
  // 2 餘燼火星
  pbStyles[2] = mk(18, 18, (g) => orb(g, 9, "#fff2b0", "#ff7a2a"), false);
  // 3 蒼槍：光矛
  pbStyles[3] = mk(20, 80, (g) => {
    orb(g, 10, "rgba(120,220,255,0.35)", "rgba(60,160,255,0.1)");
    needle(g, 76, 4.8, "#ffffff", "#47c2ff");
  });
  // 4 側翼細矛
  pbStyles[4] = mk(14, 52, (g) => needle(g, 50, 3.4, "#e6fbff", "#47c2ff"));
  // 5 翠嵐：風刃
  pbStyles[5] = mk(56, 40, (g) => {
    g.rotate(0);
    crescent(g, 24, 9, "#eafff6", "#20e098");
  });
  // 6 氣旋
  pbStyles[6] = mk(26, 26, (g) => {
    orb(g, 13, "#ffffff", "#3dffb0");
    g.strokeStyle = "rgba(255,255,255,0.9)";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, 6, 0.2, 4.4);
    g.stroke();
  }, false, true);
  // 7 紫電：電弧彈
  pbStyles[7] = mk(18, 34, (g) => {
    orb(g, 9, "rgba(190,120,255,0.55)", "rgba(120,60,255,0.15)");
    needle(g, 30, 3.6, "#fff7b0", "#b26bff");
  });
  // 8 極性雷彈
  pbStyles[8] = mk(30, 30, (g) => {
    orb(g, 15, "#ffffff", "#8a5cff");
    g.strokeStyle = "#ffe45c";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-6, -8);
    g.lineTo(2, -1);
    g.lineTo(-3, 1);
    g.lineTo(6, 9);
    g.stroke();
  }, false, true);
  // 9 玄影：暗物質彈
  pbStyles[9] = mk(60, 60, (g) => {
    orb(g, 30, "rgba(200,140,255,0.6)", "rgba(120,60,200,0.25)");
    g.fillStyle = "#0a0414";
    g.beginPath();
    g.arc(0, 0, 13, 0, TAU);
    g.fill();
    g.strokeStyle = "#ffd36b";
    g.lineWidth = 2.2;
    g.beginPath();
    g.arc(0, 0, 13, 0.3, 2.6);
    g.stroke();
    g.strokeStyle = "#e0b6ff";
    g.beginPath();
    g.arc(0, 0, 13, 3.4, 5.6);
    g.stroke();
  }, false, true);
  // 10 暗影針
  pbStyles[10] = mk(14, 40, (g) => needle(g, 38, 3.6, "#f0d8ff", "#9a5cff"));
  // 11 星輝：稜鏡脈衝
  pbStyles[11] = mk(18, 36, (g) => {
    orb(g, 9, "rgba(124,243,255,0.4)", "rgba(60,180,255,0.1)");
    g.fillStyle = "#eaffff";
    g.beginPath();
    g.moveTo(0, -16);
    g.lineTo(5, 0);
    g.lineTo(0, 16);
    g.lineTo(-5, 0);
    g.closePath();
    g.fill();
    g.fillStyle = "#7cf3ff";
    g.beginPath();
    g.moveTo(0, -16);
    g.lineTo(5, 0);
    g.lineTo(0, 4);
    g.closePath();
    g.fill();
  });
  // 12 追蹤微型飛彈
  pbStyles[12] = mk(18, 40, (g) => {
    orb(g, 9, "rgba(255,255,255,0.2)", "rgba(124,243,255,0.08)");
    g.fillStyle = "#ffffff";
    g.fillRect(-2.6, -12, 5.2, 18);
    g.fillStyle = "#7cf3ff";
    g.beginPath();
    g.moveTo(0, -17);
    g.lineTo(3, -11);
    g.lineTo(-3, -11);
    g.closePath();
    g.fill();
    const fl = g.createLinearGradient(0, 6, 0, 19);
    fl.addColorStop(0, "#ffd66b");
    fl.addColorStop(1, "rgba(255,80,20,0)");
    g.fillStyle = fl;
    g.fillRect(-2, 6, 4, 13);
  });
  // 13 機神加特林
  pbStyles[13] = mk(16, 46, (g) => {
    orb(g, 8, "rgba(255,240,180,0.4)", "rgba(255,160,60,0.1)");
    needle(g, 44, 4.2, "#ffffff", "#ffd66b");
  });
  // 14 肩砲火箭
  pbStyles[14] = mk(30, 60, (g) => {
    orb(g, 15, "rgba(255,200,120,0.4)", "rgba(255,90,40,0.12)");
    g.fillStyle = "#fff";
    g.beginPath();
    g.roundRect(-5, -20, 10, 30, 4);
    g.fill();
    g.fillStyle = "#ff6a3d";
    g.beginPath();
    g.moveTo(0, -27);
    g.lineTo(6, -18);
    g.lineTo(-6, -18);
    g.closePath();
    g.fill();
    const fl = g.createLinearGradient(0, 10, 0, 29);
    fl.addColorStop(0, "#ffe9a0");
    fl.addColorStop(1, "rgba(255,60,20,0)");
    g.fillStyle = fl;
    g.fillRect(-4, 10, 8, 19);
  });
  // 15 折射稜鏡彈
  pbStyles[15] = mk(18, 18, (g) => {
    orb(g, 9, "#ffffff", "#7cf3ff");
  }, false, true);
  // 16 僚機彈
  pbStyles[16] = mk(12, 26, (g) => needle(g, 24, 3, "#ffffff", "#9fd8ff"));
  // 17 方舟曳光彈
  pbStyles[17] = mk(14, 40, (g) => {
    orb(g, 7, "rgba(255,230,150,0.4)", "rgba(255,180,60,0.1)");
    needle(g, 38, 3.4, "#fffbe0", "#ffd36b");
  });
  // 18 鳳翼弧焰
  pbStyles[18] = mk(70, 46, (g) => {
    crescent(g, 30, 12, "#fff2b0", "#ff4a1a");
  });
  // 19 大型火球
  pbStyles[19] = mk(70, 70, (g) => {
    orb(g, 35, "#fff6c0", "#ff7a2a");
  }, false, true);
  // 20 藍色雷球（Volt 落雷小彈）
  pbStyles[20] = mk(22, 22, (g) => orb(g, 11, "#ffffff", "#ffe45c"), false, true);
  // 21 翠龍風刃
  pbStyles[21] = mk(40, 28, (g) => crescent(g, 17, 7, "#ffffff", "#30ffb0"));
  // 22 逆轉紫雷彈
  pbStyles[22] = mk(20, 32, (g) => {
    orb(g, 10, "rgba(200,140,255,0.6)", "rgba(120,60,255,0.2)");
    needle(g, 28, 4, "#ffffff", "#c58bff");
  });
}

export function pbStyle(i: number): PBStyle {
  if (!pbStyles.length) buildPB();
  return pbStyles[i] || pbStyles[0];
}
