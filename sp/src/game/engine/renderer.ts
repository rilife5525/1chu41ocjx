// 遊戲渲染：依圖層順序繪製，所有子彈皆以預渲染精靈 drawImage 提升效能
import { H, RARITY_COLOR, TAU, W, clamp } from "../constants";
import { PK } from "../entities";
import type { Beam, Enemy, Pickup } from "../entities";
import { drawBossBody } from "../render/bossDraw";
import { drawEnemySprite, enemySprite } from "../render/enemyDraw";
import { drawShip } from "../render/shipDraw";
import type { ShipDrawOpts } from "../render/shipDraw";
import { ebSprite, glow, makeCanvas, pbStyle } from "../render/sprites";
import type { Game } from "./Game";

let vig: HTMLCanvasElement | null = null;
function getVig() {
  if (vig) return vig;
  vig = makeCanvas(270, 480);
  const g = vig.getContext("2d")!;
  const gr = g.createRadialGradient(135, 240, 120, 135, 240, 330);
  gr.addColorStop(0, "rgba(0,0,0,0)");
  gr.addColorStop(1, "rgba(0,0,0,0.55)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 270, 480);
  return vig;
}

function starPath(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, n = 5) {
  ctx.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    if (i === 0) ctx.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    else ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
}

/** 繪製指定圖層的技能特效；單一特效出錯時直接丟棄，避免影響整體畫面 */
function drawFxLayer(g: Game, ctx: CanvasRenderingContext2D, layer: number) {
  const list = g.fxs;
  for (let i = 0; i < list.length; i++) {
    const f = list[i];
    if (f.layer !== layer) continue;
    try {
      f.draw(ctx);
    } catch (err) {
      console.error(err);
      f.alive = false;
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
  }
}

export function renderGame(g: Game) {
  const ctx = g.ctx;
  const S = g.pxScale;
  ctx.setTransform(S, 0, 0, S, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.translate(g.shakeX, g.shakeY);
  g.bg.draw(ctx);
  drawFxLayer(g, ctx, 0);
  g.kit.drawUnder?.(g, ctx);
  const en = g.en.items;
  // 地面敵機
  for (let i = 0; i < en.length; i++) if (en[i].def.ground && !en[i].dead) drawEnemy(g, ctx, en[i]);
  // 拾取物
  const pk = g.pk.items;
  for (let i = 0; i < pk.length; i++) drawPickup(g, ctx, pk[i]);
  for (let i = 0; i < en.length; i++) {
    const e = en[i];
    if (e.dead || e.def.ground) continue;
    if (e.def.ai === "boss") drawBoss(g, ctx, e);
    else drawEnemy(g, ctx, e);
  }
  drawPlayerBullets(g, ctx);
  drawPlayer(g, ctx);
  g.kit.drawOver?.(g, ctx);
  drawFxLayer(g, ctx, 1);
  drawBeams(g, ctx);
  drawEnemyBullets(g, ctx);
  g.fx.drawSmoke(ctx);
  g.fx.draw(ctx);
  g.fx.drawTexts(ctx);
  // 螢幕層特效
  drawFxLayer(g, ctx, 2);
  ctx.restore();
  ctx.setTransform(S, 0, 0, S, 0, 0);
  // 暗角
  ctx.globalAlpha = 0.85;
  ctx.drawImage(getVig(), 0, 0, W, H);
  ctx.globalAlpha = 1;
  const p = g.p;
  if (p.hp / p.maxHp < 0.3 && g.stateName === "playing") {
    const a = 0.16 + 0.12 * Math.sin(g.lowHpPulse);
    const gr = ctx.createRadialGradient(W / 2, H / 2, 240, W / 2, H / 2, 620);
    gr.addColorStop(0, "rgba(255,0,40,0)");
    gr.addColorStop(1, `rgba(255,0,40,${a * 2})`);
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);
  }
  if (g.tintA > 0.005) {
    ctx.globalAlpha = g.tintA;
    ctx.fillStyle = g.tintColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  if (g.flashA > 0.01) {
    ctx.globalAlpha = clamp(g.flashA, 0, 1);
    ctx.fillStyle = g.flashColor;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
}

function drawEnemy(g: Game, ctx: CanvasRenderingContext2D, e: Enemy) {
  if (e.y < -80 || e.y > H + 80 || e.alpha < 0) return;
  const sp = enemySprite(e.def.id, e.theme);
  let rot = 0;
  if (sp.spin) rot = e.t * (e.def.id === "orbiter" ? 4 : 2.4);
  else if (sp.aim) rot = Math.atan2(g.p.y - e.y, g.p.x - e.x) - Math.PI / 2;
  else if (e.def.ai === "swoop" && e.dir !== 0) rot = e.dir * -0.9;
  if (e.elite) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55 + 0.25 * Math.sin(g.t * 6);
    ctx.drawImage(glow("#ffd36b", 96), e.x - e.r * 2, e.y - e.r * 2, e.r * 4, e.r * 4);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  if (e.def.ai === "dive" && e.a === 0 && e.t > 0.5) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(g.t * 30);
    ctx.drawImage(glow("#ff3b52", 64), e.x - 24, e.y - 24, 48, 48);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  drawEnemySprite(ctx, sp, e.x, e.y, e.scale, rot, e.flash > 0, e.alpha);
  if (e.shield > 0) {
    ctx.strokeStyle = `rgba(155,230,255,${0.45 + 0.25 * Math.sin(g.t * 8)})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 6, 0, TAU);
    ctx.stroke();
  }
  if (e.brand > 0 && g.p.k.brandDraw !== 0) {
    // 烙印標記由技能特效繪製
  }
  if (e.freeze > 0) {
    ctx.fillStyle = "rgba(255,240,140,0.3)";
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.r + 4, 0, TAU);
    ctx.fill();
  }
  if ((e.elite || e.def.mid || e.hpBar > 0) && e.hp < e.maxHp) {
    const w = Math.max(26, e.r * 1.8);
    const x = e.x - w / 2;
    const y = e.y - e.r - 12;
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(x - 1, y - 1, w + 2, 5);
    ctx.fillStyle = e.def.mid ? "#ff5a6e" : e.elite ? "#ffd36b" : "#ffffff";
    ctx.fillRect(x, y, w * clamp(e.hp / e.maxHp, 0, 1), 3);
  }
}

function drawBoss(g: Game, ctx: CanvasRenderingContext2D, e: Enemy) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.scale(e.scale, e.scale);
  if (e.invuln && e.t > 2.6) ctx.globalAlpha = 0.65 + 0.35 * Math.sin(g.t * 40);
  drawBossBody(ctx, e, g.t, g.p.x, g.p.y);
  ctx.globalAlpha = 1;
  if (e.flash > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = e.flash * 0.4;
    ctx.drawImage(glow("#ffffff", 128), -e.r * 1.6, -e.r * 1.6, e.r * 3.2, e.r * 3.2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.restore();
  if (e.burn > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(glow("#ff6a1a", 96), e.x - e.r, e.y - e.r * 0.6, e.r * 2, e.r * 1.2);
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawPlayerBullets(g: Game, ctx: CanvasRenderingContext2D) {
  const arr = g.pb.items;
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < arr.length; i++) {
    const b = arr[i];
    const st = pbStyle(b.style);
    const w = st.spr.width * b.scale;
    const h = st.spr.height * b.scale;
    if (st.dir) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
      ctx.drawImage(st.spr, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else if (st.spin) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rot);
      ctx.drawImage(st.spr, -w / 2, -h / 2, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(st.spr, b.x - w / 2, b.y - h / 2, w, h);
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawEnemyBullets(g: Game, ctx: CanvasRenderingContext2D) {
  const arr = g.eb.items;
  for (let i = 0; i < arr.length; i++) {
    const b = arr[i];
    const spr = ebSprite(b.type, b.color);
    const w = spr.width;
    const h = spr.height;
    if (b.type === 3 || b.type === 4 || b.type === 6) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.ang);
      ctx.drawImage(spr, -w / 2, -h / 2);
      ctx.restore();
    } else {
      let s = 1;
      if (b.mode === 3) s = 1 + 0.12 * Math.sin(b.t * 18);
      ctx.drawImage(spr, b.x - (w * s) / 2, b.y - (h * s) / 2, w * s, h * s);
    }
  }
}

function drawBeams(g: Game, ctx: CanvasRenderingContext2D) {
  const arr = g.beams.items;
  for (let i = 0; i < arr.length; i++) drawBeam(g, ctx, arr[i]);
}

function drawBeam(g: Game, ctx: CanvasRenderingContext2D, b: Beam) {
  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.ang);
  if (b.t < b.warn) {
    const k = b.t / b.warn;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (0.25 + 0.5 * Math.abs(Math.sin(b.t * 18))) * (b.dmg > 0 ? 1 : 0.9);
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.dmg > 0 ? 2 : 1.5;
    if (b.dmg > 0) ctx.setLineDash([16, 10]);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(b.len, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    if (b.dmg > 0) {
      ctx.globalAlpha = 0.1 + 0.18 * k;
      ctx.fillStyle = b.color;
      ctx.fillRect(0, -b.w * 0.45, b.len, b.w * 0.9);
    }
  } else {
    const rem = b.warn + b.life - b.t;
    const a = clamp(rem / 0.18, 0, 1) * clamp((b.t - b.warn) / 0.06 + 0.3, 0, 1);
    const w = b.w * (0.88 + 0.12 * Math.sin(g.t * 50));
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = a;
    const gr = ctx.createLinearGradient(0, -w * 0.9, 0, w * 0.9);
    gr.addColorStop(0, "rgba(0,0,0,0)");
    gr.addColorStop(0.3, b.color);
    gr.addColorStop(0.5, "#ffffff");
    gr.addColorStop(0.7, b.color);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, -w * 0.9, b.len, w * 1.8);
    ctx.drawImage(glow(b.color, 128), -w * 1.2, -w * 1.2, w * 2.4, w * 2.4);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

function drawPickup(g: Game, ctx: CanvasRenderingContext2D, k: Pickup) {
  const x = k.x;
  const y = k.y;
  const t = g.t + k.x * 0.01;
  switch (k.kind) {
    case PK.EXP: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#5fe0ff", 32), x - 9, y - 9, 18, 18);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#e6fbff";
      ctx.beginPath();
      ctx.moveTo(x, y - 4);
      ctx.lineTo(x + 3, y);
      ctx.lineTo(x, y + 4);
      ctx.lineTo(x - 3, y);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case PK.COIN: {
      const sx = Math.abs(Math.cos(t * 5));
      ctx.fillStyle = "#ffd36b";
      ctx.strokeStyle = "#7a4a08";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(x, y, 6 * Math.max(0.25, sx), 6.5, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillRect(x - 1, y - 3, 1.6, 4);
      break;
    }
    case PK.POWER: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#ff7a2a", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#ff5a2a";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 10, y - 10, 20, 20, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = '900 15px "Bebas Neue", Impact, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText("P", x, y + 5.5);
      break;
    }
    case PK.HEAL: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#4dff9a", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#1fb864";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x - 10, y - 10, 20, 20, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x - 6, y - 2, 12, 4);
      ctx.fillRect(x - 2, y - 6, 4, 12);
      break;
    }
    case PK.ULT: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#c58bff", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#c58bff";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.6;
      starPath(ctx, x, y, 11);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case PK.SHIELD: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#9be6ff", 64), x - 20, y - 20, 40, 40);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#3aa8e8";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y - 11);
      ctx.lineTo(x + 9, y - 6);
      ctx.lineTo(x + 7, y + 6);
      ctx.lineTo(x, y + 11);
      ctx.lineTo(x - 7, y + 6);
      ctx.lineTo(x - 9, y - 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case PK.MAGNET: {
      ctx.strokeStyle = "#ff8ad4";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.fillRect(x - 10.5, y - 8, 5, 6);
      ctx.fillRect(x + 5.5, y - 8, 5, 6);
      break;
    }
    case PK.CORE: {
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(glow("#ff5ad0", 64), x - 22, y - 22, 44, 44);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#ff8ad4";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * TAU) / 6 + t;
        const px = x + Math.cos(a) * 9;
        const py = y + Math.sin(a) * 9;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case PK.GEAR: {
      const c = RARITY_COLOR[k.item?.rarity || "R"];
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.5;
      const gr = ctx.createLinearGradient(x, y - 160, x, y);
      gr.addColorStop(0, "rgba(0,0,0,0)");
      gr.addColorStop(1, c);
      ctx.fillStyle = gr;
      ctx.fillRect(x - 5, y - 160, 10, 160);
      ctx.globalAlpha = 1;
      ctx.drawImage(glow(c, 96), x - 34, y - 34, 68, 68);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#12121a";
      ctx.strokeStyle = c;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(x - 13, y - 13, 26, 26, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.font = '900 12px "Bebas Neue", Impact, sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(k.item?.rarity || "R", x, y + 4.5);
      break;
    }
  }
}

function drawPlayer(g: Game, ctx: CanvasRenderingContext2D) {
  const p = g.p;
  if (p.hp <= 0) return;
  const ship = g.ship;
  const o: ShipDrawOpts = { t: g.t, tier: p.form === 1 && ship.id === "crow" ? 3 : p.tier, thrust: p.thrust, form: p.form, morph: p.morph, gear: p.gear, bank: p.bank, color: ship.color, color2: ship.color2 };
  // 光環
  if (p.auraColor) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.28 + 0.12 * Math.sin(g.t * 4);
    ctx.drawImage(glow(p.auraColor, 128), p.x - 70, p.y - 70, 140, 140);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.bank * 0.16);
  if (p.inv > 0 && p.ultBusy <= 0 && g.stateName === "playing") ctx.globalAlpha = 0.5 + 0.4 * Math.abs(Math.sin(g.t * 34));
  drawShip(ctx, ship.id, o);
  ctx.restore();
  ctx.globalAlpha = 1;
  // 施放光暈
  if (p.castT > 0) {
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = p.castT / 0.5;
    ctx.drawImage(glow(ship.color, 128), p.x - 60, p.y - 60, 120, 120);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }
  // 護盾
  if (p.shield > 0) {
    ctx.strokeStyle = `rgba(155,230,255,${0.55 + 0.25 * Math.sin(g.t * 8)})`;
    ctx.lineWidth = 2.4;
    for (let i = 0; i < p.shield; i++) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 34 + i * 5, g.t * 2 + i, g.t * 2 + i + TAU * 0.78);
      ctx.stroke();
    }
  }
  // 僚機
  const n = p.s.options;
  for (let i = 0; i < n; i++) {
    const a = g.optAng + (i * TAU) / n;
    const ox = p.x + Math.cos(a) * 44;
    const oy = p.y + Math.sin(a) * 18 - 4;
    ctx.globalCompositeOperation = "lighter";
    ctx.drawImage(glow(ship.color2, 48), ox - 14, oy - 14, 28, 28);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#f4f8ff";
    ctx.strokeStyle = "#0a0a12";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ox, oy - 8);
    ctx.lineTo(ox + 5, oy + 5);
    ctx.lineTo(ox, oy + 2);
    ctx.lineTo(ox - 5, oy + 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // 判定點
  if (g.save.settings.hitbox || g.input.focus) {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#ff2a4a";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.4, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}
