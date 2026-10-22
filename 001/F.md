========== 來源：001/src/game/data/ships.ts ==========
// 六台機體資料
import type { ShipId, SkillKey } from "../types";

export interface SkillInfo { name: string; en: string; icon: string; desc: string; evo: [string, string, string] }
export interface ShipDef {
  id: ShipId; name: string; en: string; sigil: string; sigilEn: string; pilot: string; pilotEn: string; role: string;
  color: string; color2: string; dark: string; quote: string; lore: string;
  portrait: { sheet: "pilots_rka" | "pilots_rkb"; col: number; focus: number; cropR?: number; focusX?: number; zoom?: number };
  base: { hp: number; spd: number; atk: number; rate: number };
  radar: { atk: number; spd: number; def: number; rng: number; ease: number };
  activeCd: number; ultTime: number;
  skills: Record<SkillKey, SkillInfo>;
  cut: { line1: string; line2: string };
  cutin: { c1: string; c2: string; c3: string; angle: number };
  ultCell: number;
  mech: string;
}

export const SKILL_KEYS: SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = { weapon: "主武裝", passive: "被動", active: "主動技", ult: "奧義" };
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS = [3, 5, 7];
export const FORM_TIER3: ShipId[] = ["tag"];

export const SHIPS: Record<ShipId, ShipDef> = {
  senba: {
    id: "senba", name: "千羽", en: "THOUSAND CRANES", sigil: "折", sigilEn: "FOLD", pilot: "白鷺 紙乃", pilotEn: "SHINO SHIRASAGI", role: "封貼控制",
    color: "#ffb3d1", color2: "#ffffff", dark: "#3a1d2c",
    quote: "一千隻紙鶴，就能實現一個願望。", lore: "摺紙師之女。射出的紙片會在空中摺成紙鶴；層層貼覆的紙符能將敵機完全封印。",
    portrait: { sheet: "pilots_rka", col: 2, focus: 0.3 },
    base: { hp: 95, spd: 345, atk: 0.95, rate: 1.1 }, radar: { atk: 3, spd: 4, def: 3, rng: 4, ease: 5 },
    activeCd: 12, ultTime: 44,
    skills: {
      weapon: { name: "紙片摺鶴", en: "Fold Flight", icon: "crane", desc: "並列射出紙片，飛行 0.35 秒後摺成紙鶴轉向最近敵機。命中貼上紙符，4 層將敵機包裹封印並爆裂。", evo: ["紙片 +2 列", "封印爆裂波及周圍", "封印時間延長、爆裂掉落紙鶴"] },
      passive: { name: "護身鶴", en: "Guardian Crane", icon: "shieldcrane", desc: "每擦彈 6 次摺出一隻護身鶴繞機飛行，可抵擋一發敵彈（最多 4 隻）。", evo: ["所需擦彈 -2", "護身鶴會射擊", "最多 6 隻"] },
      active: { name: "紙城・展開", en: "Paper Fortress", icon: "box", desc: "投出紙箱於前方展開成摺紙城牆 4 秒，吸收所有敵彈；結束時重新摺成巨型手裏劍飛出。", evo: ["城牆更寬", "吸收的彈數轉為手裏劍傷害", "手裏劍分裂為四枚"] },
      ult: { name: "千羽鶴・昇龍折", en: "Origami Ascension", icon: "dragon", desc: "千隻紙鶴自下方湧出列陣俯衝，最後聚合成巨大摺紙龍盤旋全場並吐出紙吹雪。", evo: ["紙鶴數量增加", "摺紙龍持續時間延長", "紙吹雪附帶封印"] },
    },
    cut: { line1: "千羽鶴・昇龍折", line2: "ORIGAMI ASCENSION" }, cutin: { c1: "#ffb3d1", c2: "#ffffff", c3: "#3a1d2c", angle: -0.12 },
    ultCell: 2, mech: "飛行中摺成紙鶴的並列彈，四層紙符封印敵機",
  },
};

========== 來源：001/src/game/render/pbStylesExt.ts ==========
// 擴充子彈樣式（本專案批次槽從 170 起）
export const EXT_BASE = 23;
export const EXT_BASE_RK = 170;

const halo = (x: CanvasRenderingContext2D, r: number, col: string) => { const g = x.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.beginPath(); x.arc(0, 0, r, 0, 7); x.fill(); };

export const EXT_STYLES: { id: number; w: number; h: number; draw: (ctx: CanvasRenderingContext2D) => void; dir?: boolean; spin?: boolean }[] = [
  // +2 千羽・紙片
  { id: EXT_BASE_RK + 2, w: 20, h: 26, draw: (x) => { halo(x, 14, "rgba(255,179,209,.4)"); x.fillStyle = "#fff"; x.strokeStyle = "#ffb3d1"; x.lineWidth = 1.2; x.beginPath(); x.rect(-6, -9, 12, 18); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-6, -9); x.lineTo(6, 9); x.stroke(); } },
];

========== 來源：001/src/game/render/shipDrawSenba.ts ==========
// 千羽 THOUSAND CRANES：摺紙鶴造型，面與面明暗交錯的摺痕質感
import { type ShipDrawOpts, fillPoly, flame, drawGear, both, path } from "./shipUtil";
import { glow } from "./sprites";
import { TAU } from "../constants";

/** 摺紙面：亮面／暗面交錯 */
const facet = (ctx: CanvasRenderingContext2D, pts: [number, number][], light: boolean, edge = "#d88aa8") => fillPoly(ctx, pts, light ? "#fffafc" : "#f2d4e0", edge, 0.8);

export function drawCraneShape(ctx: CanvasRenderingContext2D, flap: number, pink = "#ffb3d1") {
  // 翅膀（隨拍動上下）
  both(ctx, () => {
    facet(ctx, [[2, -2], [34, -14 - flap * 10], [22, 4]], true);
    facet(ctx, [[2, -2], [22, 4], [6, 8]], false);
    facet(ctx, [[22, 4], [34, -14 - flap * 10], [40, -4 - flap * 6]], false, pink);
  });
  // 身體菱形＋頸＋頭＋尾
  facet(ctx, [[0, -10], [6, 0], [0, 12], [-6, 0]], true);
  facet(ctx, [[0, -10], [3, -24], [1, -26], [-1, -10]], false);
  facet(ctx, [[1, -26], [6, -30], [2, -24]], true, pink);
  facet(ctx, [[0, 12], [3, 26], [-3, 26]], false);
}

export function drawSenba(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const t = o.t, tier = o.tier; const flap = Math.sin(t * 5) * 0.5 + 0.5;
  ctx.save(); ctx.rotate(o.bank * 0.12);
  drawGear(ctx, o, false);
  both(ctx, () => flame(ctx, 7, 32, 4.5, 24 + o.thrust * 22, t, "#ffffff", "#ff7ab0"));
  // tier1：紙垂流蘇
  if (tier >= 1) both(ctx, () => { ctx.save(); ctx.translate(18, 18); for (let i = 0; i < 3; i++) { const s = Math.sin(t * 6 + i) * 3; path(ctx, [[0 + i * 4, i * 7], [5 + i * 4 + s, i * 7 + 3], [0 + i * 4, i * 7 + 7]]); ctx.fillStyle = i % 2 ? "#fff" : "#ffb3d1"; ctx.fill(); } ctx.restore(); });
  ctx.save(); ctx.scale(1.25, 1.25);
  // 主翼（大型摺紙鶴，翼展寬）
  both(ctx, () => {
    facet(ctx, [[3, -6], [36, -20 - flap * 8], [28, 4]], true);
    facet(ctx, [[3, -6], [28, 4], [8, 10]], false);
    facet(ctx, [[28, 4], [36, -20 - flap * 8], [42, -8 - flap * 4]], false, "#ff7ab0");
    if (tier >= 2) { ctx.globalAlpha = 0.85; facet(ctx, [[8, 4], [30, 14], [16, 18]], true); ctx.globalAlpha = 1; }
  });
  // 機身與頸頭（機首）
  facet(ctx, [[0, -14], [7, 0], [0, 18], [-7, 0]], true);
  facet(ctx, [[0, -14], [7, 0], [0, 2]], false);
  facet(ctx, [[0, -14], [3, -28], [0, -34], [-2, -14]], false);
  facet(ctx, [[0, -34], [5, -37], [2, -30]], true, "#ff7ab0");
  facet(ctx, [[0, 18], [4, 30], [0, 34], [-4, 30]], false);
  // 摺痕中線
  ctx.strokeStyle = "rgba(200,110,150,.6)"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(0, -14); ctx.lineTo(0, 18); ctx.stroke();
  ctx.restore();
  // 紅點（丹頂）＋魂光
  ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.6 + Math.sin(t * 3) * 0.3; ctx.drawImage(glow("#ff7ab0", 32), -8, -50, 16, 16); ctx.restore();
  ctx.fillStyle = "#ff3d6e"; ctx.beginPath(); ctx.arc(1, -43, 2, 0, TAU); ctx.fill();
  // tier3：護衛小鶴
  if (tier >= 3) for (let i = 0; i < 2; i++) { const s = i ? 1 : -1; ctx.save(); ctx.translate(s * 46, 12 + Math.sin(t * 3 + i) * 4); ctx.scale(0.45, 0.45); drawCraneShape(ctx, Math.sin(t * 8 + i)); ctx.restore(); }
  drawGear(ctx, o, true);
  ctx.restore();
}

========== 來源：001/src/game/skills/senba.ts ==========
// 千羽：飛行中摺成紙鶴的並列彈，四層紙符封印敵機
import type { ShipKit } from "./common";
import { mkFx, ultBackdrop, segDamage } from "./common";
import type { Game } from "../engine/Game";
import type { Enemy } from "../entities";
import { audio } from "../audio";
import { W, H, TAU, rand } from "../constants";
import { EXT_BASE_RK } from "../render/pbStylesExt";
import { drawCraneShape } from "../render/shipDrawSenba";
import { glow } from "../render/sprites";

const PAPER = 20, SHURIKEN = 21;
const TAL = new WeakMap<Enemy, number>();
const SEALED = new WeakMap<Enemy, number>();

function seal(g: Game, e: Enemy) {
  const lv = g.lvl("weapon");
  TAL.set(e, 0);
  const dur = lv >= 7 ? 2 : 1.2;
  e.freeze = Math.max(e.freeze, e.boss ? 0.25 : dur);
  SEALED.set(e, dur);
  g.fx.text(e.x, e.y - e.r - 10, "封", "#ff3d6e", 30, 0.7); audio.sfx("lock", 0.05);
  const uid = e.uid;
  g.later(dur, () => {
    if (!e.alive || e.dead || e.uid !== uid) { return; }
    const d = 40 * g.dmgMult() * (1 + lv * 0.1);
    if (lv >= 5) g.aoe(e.x, e.y, 90, d * 0.6, { pal: "white", noText: true });
    g.damageEnemy(e, d);
    for (let i = 0; i < 10; i++) g.fx.shard(e.x, e.y, rand(-260, 260), rand(-260, 260), 0.7, 6, i % 2 ? "#fff" : "#ffb3d1", 120);
    if (lv >= 7) for (let i = 0; i < 2; i++) g.spawnPB(e.x, e.y, rand(TAU), 400, EXT_BASE_RK + 2, 10 * g.dmgMult(), { kind: PAPER, a: 1, homing: 0, life: 2, src: 2 });
  });
}

export const senbaKit: ShipKit = {
  init(g) { g.p.k = { guards: 0, grazeN: 0, guardFire: 0 }; },
  update(g, dt) {
    const p = g.p, k = p.k, pl = g.lvl("passive");
    if (pl >= 5 && k.guards > 0) { k.guardFire -= dt; if (k.guardFire <= 0) { k.guardFire = 0.6; for (let i = 0; i < k.guards; i++) { const a = g.t * 2 + (i / k.guards) * TAU; g.spawnPB(p.x + Math.cos(a) * 48, p.y + Math.sin(a) * 48, -Math.PI / 2, 700, EXT_BASE_RK + 2, 7 * g.dmgMult(), { src: 1 }); } } }
  },
  fire(g) {
    const p = g.p, lv = g.lvl("weapon");
    p.fireT += 0.15 / p.s.rate;
    const n = lv >= 3 ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 16;
      g.spawnPB(p.x + off, p.y - 26, -Math.PI / 2 + off * 0.004, 820, EXT_BASE_RK + 2, 9 * g.dmgMult() * (1 + (lv - 1) * 0.07), { kind: PAPER, a: 0, life: 2.2, r: 9 });
    }
    audio.sfx("shoot4", 0.08);
  },
  updateBullet(g, b, dt) {
    if (b.kind === PAPER) {
      // 0.35 秒後摺成紙鶴並追蹤
      if (b.a === 0 && b.t > 0.35) { b.a = 1; g.fx.burst(b.x, b.y, 3, "#ffffff", 40, 120, 0.25, 1.5); }
      if (b.a === 1) {
        const tg = g.nearest(b.x, b.y, 700);
        if (tg) { const want = Math.atan2(tg.y - b.y, tg.x - b.x); const cur = Math.atan2(b.vy, b.vx); let d = want - cur; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; const na = cur + Math.max(-8 * dt, Math.min(8 * dt, d)); const s = Math.min(900, Math.hypot(b.vx, b.vy) + 400 * dt); b.vx = Math.cos(na) * s; b.vy = Math.sin(na) * s; }
      }
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < -60 || b.y > H + 60 || b.x < -60 || b.x > W + 60) b.alive = false;
    } else if (b.kind === SHURIKEN) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.rot += 18 * dt;
      if (g.lvl("active") >= 7 && b.c === 0 && b.y < 360) {
        b.c = 1; b.alive = false;
        for (let i = 0; i < 4; i++) g.spawnPB(b.x, b.y, -Math.PI / 2 + (i - 1.5) * 0.5, 800, 0, b.dmg * 0.6, { kind: SHURIKEN, r: 30, pierce: 99, life: 1.5, c: 1, scale: 0.6, src: 2 });
      }
      if (b.y < -100) b.alive = false;
    }
  },
  onHit(g, b, e) {
    if (b.kind !== PAPER) return;
    if (SEALED.has(e) && e.freeze > 0) return;
    const n = (TAL.get(e) ?? 0) + 1;
    if (n >= 4) seal(g, e); else TAL.set(e, n);
  },
  onGraze(g) {
    const k = g.p.k, pl = g.lvl("passive");
    k.grazeN++;
    const need = pl >= 3 ? 4 : 6, max = pl >= 7 ? 6 : 4;
    if (k.grazeN >= need && k.guards < max) { k.grazeN = 0; k.guards++; audio.sfx("pickup"); g.fx.text(g.p.x, g.p.y - 50, "護身鶴", "#ffb3d1", 16); }
  },
  onPlayerHit(g) {
    const k = g.p.k;
    if (k.guards > 0) { k.guards--; g.fx.burst(g.p.x, g.p.y, 20, "#ffffff", 80, 300, 0.5, 2); g.clearBullets(g.p.x, g.p.y, 90); audio.sfx("whoosh"); return true; }
    return false;
  },
  drawBullet(g, ctx, b) {
    if (b.kind === PAPER) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
      if (b.a === 0) { ctx.fillStyle = "#fff"; ctx.strokeStyle = "#ffb3d1"; ctx.lineWidth = 1; ctx.fillRect(-6, -8, 12, 16); ctx.strokeRect(-6, -8, 12, 16); ctx.fillStyle = "#ff3d6e"; ctx.fillRect(-1, -5, 2, 10); }
      else { ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.5; ctx.drawImage(glow("#ffb3d1", 32), -14, -14, 28, 28); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1; ctx.scale(0.42, 0.42); drawCraneShape(ctx, Math.sin(b.t * 20)); }
      ctx.restore();
    } else if (b.kind === SHURIKEN) {
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.rot); const s = 40 * b.scale;
      for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = i % 2 ? "#fffafc" : "#ffb3d1"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(s * 0.3, -s * 0.3); ctx.lineTo(0, -s); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#d88aa8"; ctx.lineWidth = 1; ctx.stroke(); }
      ctx.restore();
    }
    void g;
  },
  drawOver(g, ctx) {
    const p = g.p, k = p.k;
    // 護身鶴
    for (let i = 0; i < k.guards; i++) { const a = g.t * 2 + (i / Math.max(1, k.guards)) * TAU; ctx.save(); ctx.translate(p.x + Math.cos(a) * 48, p.y + Math.sin(a) * 48); ctx.rotate(a + Math.PI); ctx.scale(0.4, 0.4); drawCraneShape(ctx, Math.sin(g.t * 10 + i)); ctx.restore(); }
    // 紙符層數 & 封印包裹
    for (const e of g.en.items) {
      if (!e.alive || e.dead) continue;
      const n = TAL.get(e) ?? 0;
      if (e.freeze > 0 && SEALED.has(e)) {
        ctx.save(); ctx.translate(e.x, e.y); ctx.fillStyle = "rgba(255,250,252,.85)"; ctx.strokeStyle = "#ff3d6e"; ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) { ctx.save(); ctx.rotate(i * 0.8 + 0.2); ctx.fillRect(-e.r, -6, e.r * 2, 12); ctx.strokeRect(-e.r, -6, e.r * 2, 12); ctx.restore(); }
        ctx.fillStyle = "#ff3d6e"; ctx.font = "900 18px serif"; ctx.textAlign = "center"; ctx.fillText("封", 0, 6); ctx.restore();
      } else if (n > 0) {
        for (let i = 0; i < n; i++) { const a = (i / 4) * TAU + g.t; ctx.save(); ctx.translate(e.x + Math.cos(a) * (e.r + 6), e.y + Math.sin(a) * (e.r + 6)); ctx.rotate(a); ctx.fillStyle = "#fff"; ctx.fillRect(-3, -5, 6, 10); ctx.fillStyle = "#ff3d6e"; ctx.fillRect(-0.8, -3, 1.6, 6); ctx.restore(); }
      }
    }
  },
  castActive(g) {
    const al = g.lvl("active"); const p = g.p;
    const cx = p.x, cy = Math.max(160, p.y - 200); const half = al >= 3 ? 180 : 130;
    let t = 0, absorbed = 0; const dur = 4;
    audio.sfx("whoosh");
    mkFx(g, 1, (dt) => {
      t += dt;
      if (t > 0.35 && t < dur) for (const b of g.eb.items) if (b.alive && Math.abs(b.x - cx) < half && Math.abs(b.y - cy) < 22) { b.alive = false; absorbed++; if (absorbed % 4 === 0) g.fx.glowP(b.x, b.y, 0, 0, 0.3, 14, "#ffb3d1"); }
      if (t >= dur) {
        const dmg = (50 + (al >= 5 ? absorbed * 2.5 : absorbed * 0.5)) * g.dmgMult();
        g.spawnPB(cx, cy, -Math.PI / 2, 700, 0, dmg, { kind: SHURIKEN, r: 34, pierce: 99, life: 2, c: 0, scale: 1.3, src: 2 });
        audio.sfx("shoot5"); g.fx.text(cx, cy - 30, `吸收 ${absorbed}`, "#ffb3d1", 22);
        return false;
      }
      return true;
    }, (ctx) => {
      const unf = Math.min(1, t / 0.35); const w = half * unf;
      ctx.save(); ctx.translate(cx, cy);
      // 摺紙城牆：鋸齒城垛＋摺痕
      ctx.fillStyle = "rgba(255,250,252,.92)"; ctx.strokeStyle = "#d88aa8"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-w, 20); ctx.lineTo(-w, -12);
      for (let x = -w; x < w; x += 24) { ctx.lineTo(x + 6, -12); ctx.lineTo(x + 6, -22); ctx.lineTo(x + 18, -22); ctx.lineTo(x + 18, -12); }
      ctx.lineTo(w, -12); ctx.lineTo(w, 20); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(216,138,168,.6)"; for (let x = -w; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, -12); ctx.lineTo(x + 12, 20); ctx.stroke(); }
      ctx.fillStyle = "#ff3d6e"; ctx.font = "900 16px serif"; ctx.textAlign = "center"; ctx.fillText("紙城", 0, 10);
      ctx.restore();
    });
  },
  castUlt(g) {
    const p = g.p, ul = g.lvl("ult"); const dur = 8;
    p.form = 1; p.formT = dur; p.inv = Math.max(p.inv, dur + 1);
    ultBackdrop(g, 2, dur, "#3a1d2c");
    let t = 0;
    // 第一段：千鶴升空俯衝
    const N = ul >= 3 ? 160 : 110;
    const cranes = Array.from({ length: N }, (_, i) => ({ x: rand(W), y: H + 40 + (i % 20) * 30, vx: 0, vy: -rand(500, 800), tg: null as Enemy | null, done: false, delay: (i / N) * 1.6 }));
    // 第二段：摺紙龍（龍首＋16 節龍身＋四爪）
    const SEG = 18; const body: { x: number; y: number }[] = Array.from({ length: SEG }, () => ({ x: -200, y: 600 }));
    const hit = new Set<number>(); let hitT = 0;
    const dragonDur = ul >= 5 ? 4.6 : 3.8;
    mkFx(g, 1, (dt) => {
      t += dt;
      for (const c of cranes) {
        if (c.done || t < c.delay) continue;
        if (!c.tg || c.tg.dead || !c.tg.alive) c.tg = g.nearest(c.x, c.y, 2000);
        if (c.tg && c.y < H - 100) { const a = Math.atan2(c.tg.y - c.y, c.tg.x - c.x); c.vx += Math.cos(a) * 3000 * dt; c.vy += Math.sin(a) * 3000 * dt; const s = Math.hypot(c.vx, c.vy); if (s > 900) { c.vx *= 900 / s; c.vy *= 900 / s; } }
        c.x += c.vx * dt; c.y += c.vy * dt;
        if (c.tg && (c.x - c.tg.x) ** 2 + (c.y - c.tg.y) ** 2 < (c.tg.r + 10) ** 2) { c.done = true; g.damageEnemy(c.tg, (16 + ul * 3) * g.dmgMult(), { noText: true }); g.fx.burst(c.x, c.y, 3, "#fff", 60, 160, 0.3, 1.5); }
        if (c.y < -60 || t > 2.8) c.done = true;
      }
      // 龍
      const dt2 = t - 2.6;
      if (dt2 > 0 && dt2 < dragonDur) {
        const u = dt2 / dragonDur;
        const hx = W / 2 + Math.sin(u * TAU * 1.5) * 280, hy = 1150 - u * 1300 + Math.sin(u * TAU * 3) * 120;
        body[0].x += (hx - body[0].x) * 0.5; body[0].y += (hy - body[0].y) * 0.5;
        for (let i = 1; i < SEG; i++) { const a = body[i - 1], b = body[i]; const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1; if (d > 36) { b.x = a.x + (dx / d) * 36; b.y = a.y + (dy / d) * 36; } }
        hitT -= dt; if (hitT <= 0) { hitT = 0.15; hit.clear(); }
        for (let i = 0; i < SEG - 1; i += 2) segDamage(g, body[i].x, body[i].y, body[i + 1].x, body[i + 1].y, 40 - i, (30 + ul * 6) * g.dmgMult(), hit);
        g.clearBullets(body[0].x, body[0].y, 90, "score");
        if (Math.random() < 0.6) g.fx.glowP(body[SEG - 1].x, body[SEG - 1].y, rand(-40, 40), rand(-40, 40), 0.6, 12, "#ffb3d1");
      }
      // 第三段：紙吹雪
      if (t > 2.6 + dragonDur && t - dt <= 2.6 + dragonDur) {
        for (const e of g.en.items) if (e.alive && !e.dead) { g.damageEnemy(e, (120 + ul * 30) * g.dmgMult()); if (ul >= 7) seal(g, e); }
        g.clearBullets(W / 2, H / 2, 3000, "score"); g.flash("#ffffff", 0.6); g.shake(16, 0.6); audio.sfx("boom_l");
        for (let i = 0; i < 120; i++) g.fx.shard(rand(W), rand(-100, H * 0.6), rand(-120, 120), rand(0, 200), rand(1, 2), rand(4, 8), i % 3 ? "#ffffff" : "#ffb3d1", 120);
      }
      return t < dur;
    }, (ctx) => {
      for (const c of cranes) { if (c.done || t < c.delay) continue; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(Math.atan2(c.vy, c.vx) + Math.PI / 2); ctx.scale(0.5, 0.5); drawCraneShape(ctx, Math.sin(t * 20 + c.x)); ctx.restore(); }
      const dt2 = t - 2.6;
      if (dt2 > 0 && dt2 < dragonDur + 0.2) drawOrigamiDragon(ctx, body, t);
      if (t > 2.6 + dragonDur && t < 2.6 + dragonDur + 1.2) {
        const k = (t - 2.6 - dragonDur) / 1.2; ctx.save(); ctx.globalAlpha = 1 - k; ctx.font = "900 120px 'Noto Serif TC', serif"; ctx.textAlign = "center"; ctx.lineWidth = 8; ctx.strokeStyle = "#3a1d2c"; ctx.strokeText("千羽", W / 2, 640); ctx.fillStyle = "#fff"; ctx.fillText("千羽", W / 2, 640); ctx.restore();
      }
    });
  },
  gauge(g) { const pl = g.lvl("passive"); return { label: `護身鶴 ${g.p.k.guards}`, v: g.p.k.grazeN / (pl >= 3 ? 4 : 6), color: "#ffb3d1" }; },
};

/** 摺紙龍：多面摺紙龍身、背鰭、四爪、龍首（角、顎、鬚） */
function drawOrigamiDragon(ctx: CanvasRenderingContext2D, body: { x: number; y: number }[], t: number) {
  const SEG = body.length;
  ctx.save();
  ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = 0.35; for (let i = 0; i < SEG; i += 3) ctx.drawImage(glow("#ffb3d1", 64), body[i].x - 50, body[i].y - 50, 100, 100); ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
  for (let i = SEG - 1; i >= 1; i--) {
    const a = body[i - 1], b = body[i]; const ang = Math.atan2(a.y - b.y, a.x - b.x); const r = 26 - i * 0.9;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(ang);
    // 爪：第 3 節與第 10 節
    if (i === 3 || i === 10) for (const s of [-1, 1]) { ctx.fillStyle = "#f2d4e0"; ctx.beginPath(); ctx.moveTo(0, s * r * 0.6); ctx.lineTo(-10, s * (r + 18)); ctx.lineTo(4, s * (r + 26)); ctx.lineTo(10, s * (r + 14)); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#d88aa8"; ctx.lineWidth = 1; ctx.stroke(); ctx.strokeStyle = "#ff3d6e"; ctx.beginPath(); for (let c = -1; c <= 1; c++) { ctx.moveTo(4, s * (r + 26)); ctx.lineTo(10 + c * 4, s * (r + 32)); } ctx.stroke(); }
    // 龍身菱形摺面
    ctx.fillStyle = i % 2 ? "#fffafc" : "#f2d4e0"; ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(0, -r); ctx.lineTo(-18, 0); ctx.lineTo(0, r); ctx.closePath(); ctx.fill(); ctx.strokeStyle = "#d88aa8"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "rgba(216,138,168,.35)"; ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(0, -r); ctx.lineTo(0, 0); ctx.fill();
    // 背鰭
    ctx.fillStyle = "#ff7ab0"; ctx.beginPath(); ctx.moveTo(6, -r * 0.4); ctx.lineTo(-4, -r * 0.4 - 14 - Math.sin(t * 8 + i) * 3); ctx.lineTo(-10, -r * 0.3); ctx.fill();
    ctx.restore();
  }
  // 龍首
  const h = body[0], n = body[1]; const ang = Math.atan2(h.y - n.y, h.x - n.x);
  ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(ang);
  const jaw = Math.max(0, Math.sin(t * 6)) * 10;
  // 角
  for (const s of [-1, 1]) { ctx.strokeStyle = "#ffe0ec"; ctx.lineWidth = 4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(-6, s * 12); ctx.lineTo(-34, s * 28); ctx.lineTo(-44, s * 22); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, s * 23); ctx.lineTo(-30, s * 38); ctx.stroke(); }
  // 頭部摺面
  ctx.fillStyle = "#fffafc"; ctx.strokeStyle = "#d88aa8"; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(44, -4); ctx.lineTo(16, -18); ctx.lineTo(-10, -16); ctx.lineTo(-14, 0); ctx.lineTo(-10, 16); ctx.lineTo(16, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#f2d4e0"; ctx.beginPath(); ctx.moveTo(44, -4); ctx.lineTo(16, -18); ctx.lineTo(16, 0); ctx.fill();
  // 下顎
  ctx.fillStyle = "#f2d4e0"; ctx.beginPath(); ctx.moveTo(40, 4 + jaw); ctx.lineTo(16, 8); ctx.lineTo(-6, 18); ctx.lineTo(14, 18 + jaw * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  // 口中光
  ctx.globalCompositeOperation = "lighter"; ctx.drawImage(glow("#ff7ab0", 32), 20, -6, 30, 20 + jaw); ctx.globalCompositeOperation = "source-over";
  // 眼
  ctx.fillStyle = "#ff3d6e"; ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(20, -12); ctx.lineTo(14, -6); ctx.fill();
  // 鬚
  for (const s of [-1, 1]) { ctx.strokeStyle = "#ff7ab0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(36, s * 6); ctx.bezierCurveTo(50, s * 24, 30 + Math.sin(t * 5) * 10, s * 46, 10, s * 54); ctx.stroke(); }
  ctx.restore(); ctx.restore();
}

========== 來源：002/src/game/data/ships.ts ==========
// 12 架全新原創戰機完整設定與進化能力表（100% 遵守契約 §3.5、§4.2、§4.5 與 s05 補充規範）

import type { ShipId, SkillKey } from "../types";

export interface SkillInfo {
  name: string;
  en: string;
  icon: string;
  desc: string;
  evo: [string, string, string];
}

export interface ShipDef {
  id: ShipId;
  name: string;
  en: string;
  sigil: string;
  sigilEn: string;
  pilot: string;
  pilotEn: string;
  role: string;
  color: string;
  color2: string;
  dark: string;
  quote: string;
  lore: string;
  portrait: {
    sheet: string;
    col: number;
    focus: number;
    cropR?: number;
    focusX?: number;
    zoom?: number;
  };
  base: { hp: number; spd: number; atk: number; rate: number };
  radar: { atk: number; spd: number; def: number; rng: number; ease: number };
  activeCd: number;
  ultTime: number;
  skills: {
    weapon: SkillInfo;
    passive: SkillInfo;
    active: SkillInfo;
    ult: SkillInfo;
  };
  cut: { line1: string; line2: string };
  cutin: { c1: string; c2: string; c3: string; angle: number };
}

export const SKILL_KEYS: readonly SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = {
  weapon: "主武裝",
  passive: "被動特質",
  active: "戰術主動",
  ult: "覺醒奧義",
};
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS: readonly [number, number, number] = [3, 5, 7];

// 奧義施放期間展開第 4 階完全體外觀的機體
export const FORM_TIER3: ShipId[] = [
  "cleaver",
  "shears",
  "crossbow",
  "drake",
  "kensei",
  "phantom",
];

export const SHIPS: Record<ShipId, ShipDef> = {
  // 06. 聖弓「煌十字」—— 帥氣神聖十字光弓蓄力射擊＋十字聖柱爆裂
  crossbow: {
    id: "crossbow",
    name: "煌十字",
    en: "RADIANT CROSSBOW",
    sigil: "聖弓",
    sigilEn: "SERAPH BOW",
    pilot: "聖堂 煌雅",
    pilotEn: "KOGA SEIDOU",
    role: "聖弓貫穿・十字光爆",
    color: "#ffd24a",
    color2: "#62e8ff",
    dark: "#1c1808",
    quote: "光弦滿月，聖痕鎖定——化為星塵歸於天穹吧！",
    lore: "聖堂騎士團至高聖遺物武裝化的光翼弓機，每一次拉滿光弦射出的聖矢皆會在敵陣綻放莊嚴十字聖光。",
    portrait: { sheet: "krv2", col: 1, focus: 0.25, zoom: 1.04 },
    base: { hp: 115, spd: 335, atk: 1.1, rate: 0.96 },
    radar: { atk: 5, spd: 3, def: 3, rng: 5, ease: 4 },
    activeCd: 11.0,
    ultTime: 45,
    skills: {
      weapon: {
        name: "聖堂光矢＆煌十字破魔箭",
        en: "GRAND CROSS BOLT",
        icon: "crossbow_w",
        desc: "三連速射蒼藍光矢後自動拉滿弓弦射出一發巨型「煌十字聖矢」，命中瞬間炸開縱橫貫穿的十字神聖光束！",
        evo: [
          "Lv3：十字神聖光束寬度與長度大幅增加，可消滅十字線上的敵彈",
          "Lv5：升級為「八芒大聖堂光爆」（十字＋X 字八向貫穿光束）",
          "Lv7：速射光矢增為五連齊射，煌十字聖矢可連續貫穿觸發兩次十字爆裂",
        ],
      },
      passive: {
        name: "聖痕審判共鳴",
        en: "SANCTUM BRAND",
        icon: "crossbow_p",
        desc: "被十字光束掃過的敵機刻上「聖痕」，對此目標射擊時會從天降下額外追擊光箭。",
        evo: [
          "Lv3：追擊光箭暴擊率提高 25%",
          "Lv5：帶有聖痕的敵機被擊墜時原地綻放小型十字淨化光環",
          "Lv7：每累積觸發 12 次聖痕自動為自機補充一層神聖護盾",
        ],
      },
      active: {
        name: "天穹七聖十字星雨",
        en: "CATHEDRAL ARROW RAIN",
        icon: "crossbow_a",
        desc: "仰天射出聖光響箭，隨即於戰場降下 7 座巨型黃金十字聖柱釘死敵群並淨化周圍彈幕！",
        evo: [
          "Lv3：十字聖柱增至 10 座並優先鎖定菁英與首領",
          "Lv5：所有十字聖柱之間連線張開神聖結界電網持續灼燒",
          "Lv7：結界收束時引發全場神聖白光大審判",
        ],
      },
      ult: {
        name: "聖骸解放・滅卻萬丈十字星",
        en: "STARLIGHT CROSS PIERCE",
        icon: "crossbow_u",
        desc: "展開橫跨全畫面的巨型熾天使黃金光弓，黃金準星鎖定全場後射出毀天滅地的超巨型螺旋十字貫星聖砲！",
        evo: [
          "Lv3：鎖定準星齊射萬箭齊發先行洗禮全場",
          "Lv5：超巨型十字貫星聖砲持續時間延長並伴隨雙翼副光砲",
          "Lv7：聖砲終結時綻放覆蓋全螢幕的大聖堂十字星芒極光",
        ],
      },
    },
    cut: { line1: "熾天光弓，滿月開弦——", line2: "聖骸解放・滅卻萬丈十字星！！" },
    cutin: { c1: "#ffd24a", c2: "#62e8ff", c3: "#191506", angle: 0.2 },
  },
};

========== 來源：002/src/game/render/pbStylesExt.ts ==========
// 擴充我方子彈精靈樣式（嚴格遵守契約 §5：保留 EXT_BASE = 23，本批次自 EXT_BASE_KRV = 180 起算）

import { TAU } from "../constants";

export const EXT_BASE = 23;
export const EXT_BASE_KRV = 180;

export interface ExtStyleDef {
  id: number;
  w: number;
  h: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  dir?: boolean;
  spin?: boolean;
}

export const EXT_STYLES: ExtStyleDef[] = [
  // 180 + 6: 聖弓・煌金十字聖矢
  {
    id: EXT_BASE_KRV + 6,
    w: 44,
    h: 82,
    dir: true,
    spin: false,
    draw: (ctx) => {
      // 縱軸光矢
      const g = ctx.createLinearGradient(0, -39, 0, 38);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.45, "#ffd95e");
      g.addColorStop(1, "rgba(56,226,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -40);
      ctx.lineTo(5, -24);
      ctx.lineTo(2.4, 38);
      ctx.lineTo(-2.4, 38);
      ctx.lineTo(-5, -24);
      ctx.closePath();
      ctx.fill();

      // 橫翼十字護手光刃
      ctx.fillStyle = "#fff8dc";
      ctx.beginPath();
      ctx.moveTo(-19, -16);
      ctx.lineTo(0, -21);
      ctx.lineTo(19, -16);
      ctx.lineTo(0, -11);
      ctx.closePath();
      ctx.fill();
    },
  },
];

========== 來源：002/src/game/render/shipDrawCrossbow.ts ==========
// 戰機 06：聖弓「煌十字」(crossbow) —— 機體展開神聖黃金十字大弓臂，動態拉弦蓄光發射聖矢！

import { glow } from "./sprites";
import { drawGear, fillPoly, flame, lin, mirror, ring, type ShipDrawOpts } from "./shipUtil";

export function drawCrossbow(ctx: CanvasRenderingContext2D, o: ShipDrawOpts): void {
  const { t, tier, thrust, aux } = o;
  drawGear(ctx, o, false);

  // 聖堂白金推進尾焰
  flame(ctx, -8, 28, 4.6, 22 + thrust * 10, "#fff8d6", "#ffd24a", t);
  flame(ctx, 8, 28, 4.6, 22 + thrust * 10, "#fff8d6", "#ffd24a", t);

  // 拉弓張力週期（弓臂微彎＋光弦往後拉滿再瞬放！）
  const drawPhase = (t * 2.4 + aux) % 1;
  const pull = drawPhase < 0.78 ? drawPhase / 0.78 : Math.max(0, 1 - (drawPhase - 0.78) / 0.22);
  const limbFlex = pull * 5.5;
  const stringY = -8 + pull * 19;

  // Tier >= 3：大聖堂雙重熾天使背光環
  if (tier >= 3) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.52;
    ring(ctx, 0, 2, 42, 42, "#ffd24a", 1.9, t * 0.6);
    ring(ctx, 0, 2, 34, 34, "#62e8ff", 1.3, -t * 0.9);
    ctx.restore();
  }

  // ── 發光神聖弓弦（連接左右弓臂尖端至蓄力矢尾） ──
  const tipX = 37 + tier * 2.2;
  const tipY = -12 + limbFlex;
  ctx.save();
  ctx.strokeStyle = "#62f4ff";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-tipX, tipY);
  ctx.lineTo(0, stringY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-tipX, tipY);
  ctx.lineTo(0, stringY);
  ctx.lineTo(tipX, tipY);
  ctx.stroke();
  ctx.restore();

  // 左右黃金聖十字弓臂與聖羽副翼
  mirror(ctx, () => {
    if (tier >= 1) {
      fillPoly(
        ctx,
        [[9, 6], [28, 16], [23, 28], [8, 21]],
        lin(ctx, 9, 6, 28, 28, [[0, "#fff8dc"], [0.55, "#d99b26"], [1, "#1e293b"]]),
        "#ffd24a",
        1.1
      );
    }

    if (tier >= 2) {
      // 第二層副弓翼光刃
      fillPoly(
        ctx,
        [[14, -22], [32, -26 + limbFlex * 0.6], [28, -16 + limbFlex * 0.6], [12, -14]],
        lin(ctx, 14, -26, 32, -14, [[0, "#ffffff"], [0.6, "#62e8ff"], [1, "#0284c7"]]),
        "#ffffff",
        1
      );
    }

    // 主黃金反曲十字大弓臂
    fillPoly(
      ctx,
      [
        [6, -24],
        [23, -24 + limbFlex * 0.45],
        [tipX, tipY],
        [tipX - 5, tipY + 6],
        [20, -13 + limbFlex * 0.35],
        [7, -11],
      ],
      lin(ctx, 6, -24, tipX, tipY + 6, [
        [0, "#ffffff"],
        [0.42, "#ffd95e"],
        [0.82, "#b4690e"],
        [1, "#62e8ff"],
      ]),
      "#fffbeb",
      1.3
    );
  });

  // 縱軸白金聖堂箭軌機身（構成完美十字輪廓！）
  fillPoly(
    ctx,
    [[0, -45], [7.5, -26], [9, 20], [5, 31], [-5, 31], [-9, 20], [-7.5, -26]],
    lin(ctx, -8, -45, 8, 31, [[0, "#ffffff"], [0.35, "#f8fafc"], [0.78, "#334155"], [1, "#0f172a"]]),
    "#ffd24a",
    1.35
  );

  // 正在弦上蓄力的煌金十字光矢！
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.55 + pull * 0.45;
  fillPoly(
    ctx,
    [[0, -47 + pull * 6], [4, -33 + pull * 6], [1.8, stringY], [-1.8, stringY], [-4, -33 + pull * 6]],
    "#fff6b3"
  );
  ctx.drawImage(glow("#ffd24a", 44), -16, -48 + pull * 6, 32, 32);
  ctx.restore();

  // 蒼藍聖石核心座艙
  fillPoly(
    ctx,
    [[0, -14], [4.6, -2], [0, 12], [-4.6, -2]],
    lin(ctx, 0, -14, 0, 12, [[0, "#ffffff"], [0.5, "#38e8ff"], [1, "#1d4ed8"]]),
    "#ffd24a",
    1.1
  );

  drawGear(ctx, o, true);
}

========== 來源：002/src/game/skills/crossbow.ts ==========
// 戰機 06 技能組：聖弓「煌十字」(crossbow) —— 蓄弦煌十字破魔箭＋七聖十字星雨＋萬丈十字星聖砲奧義

import { drawVfxElement } from "../../assets";
import { H, TAU, W, clamp } from "../constants";
import { audio } from "../audio";
import type { Enemy } from "../entities";
import type { Game } from "../engine/Game";
import { PAL } from "../render/fx";
import { EXT_BASE_KRV } from "../render/pbStylesExt";
import { glow } from "../render/sprites";
import { drawBars, mkFx, ptSegDist, spawnUltBackdrop, type ShipKit } from "./common";

const SANCTUM_BRAND = new WeakMap<Enemy, boolean>();

function triggerCrossBurst(g: Game, x: number, y: number, arms8: boolean, clearEb: boolean): void {
  const wLv = g.lvl("weapon");
  const armLen = wLv >= 3 ? 235 : 165;
  const dmg = (36 + wLv * 8) * g.dmgMult();
  const dirs = arms8 ? 8 : 4;

  audio.sfx("shoot1", 0.05);
  if (clearEb) {
    g.clearBullets(x, y, armLen * 0.55, "score");
  }

  for (let d = 0; d < dirs; d++) {
    const a = (d * TAU) / dirs;
    const ex = x + Math.cos(a) * armLen;
    const ey = y + Math.sin(a) * armLen;
    for (const e of g.en.items) {
      if (!e.dead && ptSegDist(e.x, e.y, x, y, ex, ey) < e.r + 16) {
        SANCTUM_BRAND.set(e, true);
        g.damageEnemy(e, dmg, { crit: d < 4 });
      }
    }
  }

  let t = 0;
  mkFx(
    g,
    1,
    (dt) => {
      t += dt;
      return t < 0.28;
    },
    (ctx) => {
      const k = 1 - clamp(t / 0.28, 0, 1);
      ctx.save();
      ctx.translate(x, y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = k;
      ctx.drawImage(glow("#ffd24a", 96), -52, -52, 104, 104);
      for (let d = 0; d < dirs; d++) {
        ctx.save();
        ctx.rotate((d * TAU) / dirs);
        ctx.fillStyle = d < 4 ? "#ffd24a" : "#62e8ff";
        ctx.fillRect(0, -7 * k, armLen, 14 * k);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, -2.5 * k, armLen, 5 * k);
        ctx.restore();
      }
      ctx.restore();
    }
  );
}

export const crossbowKit: ShipKit = {
  init(g) {
    g.p.k = {
      volleyIdx: 0,
      brandHits: 0,
    };
  },

  preview(t) {
    return { mode: 0, aux: t * 0.35 };
  },

  update(g, dt) {
    if (g.p.formT > 0) {
      g.p.formT -= dt;
      if (g.p.formT <= 0) {
        g.p.form = 0;
        g.p.formT = 0;
        g.p.dmgMul = 1;
        g.p.speedMul = 1;
      }
    }
  },

  fire(g) {
    const k = g.p.k;
    const wLv = g.lvl("weapon");
    k.volleyIdx++;

    const isGrandCross = k.volleyIdx % 4 === 0;
    g.p.fireT += (isGrandCross ? 0.26 : 0.14) / (g.p.s.rate * g.ship.base.rate);

    const baseDmg = 19 * g.dmgMult() * (1 + (wLv - 1) * 0.13);

    if (isGrandCross) {
      // 滿弦發射巨型「煌十字破魔箭」（kind = 26）！
      const b = g.spawnPB(g.p.x, g.p.y - 40, -Math.PI * 0.5, 880, EXT_BASE_KRV + 6, baseDmg * 2.1, {
        r: 20,
        pierce: wLv >= 7 ? 1 : 0,
        scale: 1.25,
        kind: 26,
      });
      b.a = 0;
      g.fx.ring(g.p.x, g.p.y - 36, 10, 48, 0.22, "#ffd24a", 2.5);
      audio.sfx("shoot5", 0.04);
    } else {
      const arrows = wLv >= 7 ? 5 : 3;
      for (let i = 0; i < arrows; i++) {
        const off = (i - (arrows - 1) * 0.5) * 0.07;
        g.spawnPB(g.p.x + off * 110, g.p.y - 32, -Math.PI * 0.5 + off, 900, 3, baseDmg, {
          r: 12,
          pierce: g.p.s.pierce,
          kind: 27,
        });
      }
      audio.sfx("shoot0", 0.05);
    }
  },

  onHit(g, b, e) {
    const wLv = g.lvl("weapon");
    const pLv = g.lvl("passive");

    if (b.kind === 26) {
      triggerCrossBurst(g, e.x, e.y, wLv >= 5, wLv >= 3);
      return;
    }

    // 命中帶有「聖痕」的敵機，從天降下追擊聖光箭！
    if (b.kind === 27 && SANCTUM_BRAND.get(e)) {
      g.p.k.brandHits++;
      g.spawnPB(e.x + (Math.random() - 0.5) * 50, Math.max(10, e.y - 190), Math.PI * 0.5, 920, 17, 17 * g.dmgMult(), {
        r: 13,
        src: 2,
      });
      if (pLv >= 7 && g.p.k.brandHits % 12 === 0) {
        g.p.shield = Math.min(g.p.maxShield, g.p.shield + 16);
      }
    }
  },

  onKill(g, e) {
    if (g.lvl("passive") >= 5 && SANCTUM_BRAND.get(e)) {
      triggerCrossBurst(g, e.x, e.y, false, false);
    }
  },

  castActive(g) {
    const aLv = g.lvl("active");
    const pillars = aLv >= 3 ? 10 : 7;
    audio.sfx("active");
    audio.sfx("charge", 0.02);
    g.flash("#ffd24a", 0.3);

    const coords: { x: number; y: number }[] = [];
    const alive = g.en.items.filter((e) => !e.dead);
    for (let i = 0; i < pillars; i++) {
      const target = alive.length > 0 ? alive[i % alive.length] : null;
      const px = target ? clamp(target.x + (i >= alive.length ? (i % 3 - 1) * 60 : 0), 45, W - 45) : 65 + ((i * 173) % (W - 130));
      const py = target ? clamp(target.y, 90, H - 220) : 140 + ((i * 127) % 380);
      coords.push({ x: px, y: py });

      g.later(0.08 * i, () => {
        audio.sfx("shoot5", 0.02);
        g.shake(5, 0.12);
        g.clearBullets(px, py, 95, "score");
        g.aoe(px, py, 105, (64 + aLv * 14) * g.dmgMult(), { pal: "gold" });
      });
    }

    const dur = 1.6;
    let t = 0;
    let judged = false;
    mkFx(
      g,
      1,
      (dt) => {
        t += dt;
        if (aLv >= 7 && !judged && t >= 1.45) {
          judged = true;
          g.flash("#ffffff", 0.5);
          for (const e of g.en.items) {
            if (!e.dead) g.damageEnemy(e, 75 * g.dmgMult(), { crit: true });
          }
        }
        return t < dur;
      },
      (ctx) => {
        const fade = t > 1.2 ? clamp((dur - t) / 0.4, 0, 1) : 1;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = fade;

        // Lv5 聖柱之間張開神聖結界光網
        if (aLv >= 5 && coords.length >= 2) {
          ctx.strokeStyle = "rgba(98, 232, 255, 0.55)";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(coords[0].x, coords[0].y);
          for (let i = 1; i < coords.length; i++) ctx.lineTo(coords[i].x, coords[i].y);
          ctx.stroke();
        }

        for (let i = 0; i < coords.length; i++) {
          if (t < i * 0.08) continue;
          const c = coords[i];
          ctx.fillStyle = "#ffd24a";
          ctx.fillRect(c.x - 4, c.y - 68, 8, 120);
          ctx.fillRect(c.x - 36, c.y - 34, 72, 8);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(c.x - 2, c.y - 64, 4, 112);
          ctx.fillRect(c.x - 32, c.y - 32, 64, 4);
        }
        ctx.restore();
      }
    );
  },

  castUlt(g) {
    const uLv = g.lvl("ult");
    const dur = 4.5;
    g.p.form = 1;
    g.p.formT = dur;
    g.p.inv = Math.max(g.p.inv, dur + 1.0);
    g.p.dmgMul = 1.35;

    audio.sfx("ultgo");
    audio.sfx("charge", 0.01);
    g.shake(13, 0.6);
    g.flash("#ffd24a", 0.55);
    spawnUltBackdrop(g, 5, dur, "#ffd24a", 0.15);

    let t = 0;
    let tickAcc = 0;
    let firedMain = false;

    mkFx(
      g,
      2,
      (dt) => {
        t += dt;
        // 蓄弦階段：黃金準星萬箭齊發先行洗禮
        if (t < 1.1 && uLv >= 3 && Math.random() < 25 * dt) {
          g.spawnPB(g.p.x + (Math.random() - 0.5) * 320, H - 40, -Math.PI * 0.5, 980, EXT_BASE_KRV + 6, 30 * g.dmgMult(), {
            r: 18,
            pierce: 4,
            src: 2,
          });
        }

        if (!firedMain && t >= 1.05) {
          firedMain = true;
          audio.sfx("boom_l", 0.01);
          audio.sfx("laser", 0.01);
          g.shake(20, 0.9);
          g.flash("#ffffff", 0.85);
        }

        if (t >= 1.05 && t < 3.9) {
          tickAcc += dt;
          if (tickAcc >= 0.12) {
            tickAcc = 0;
            g.clearBullets(W * 0.5, H * 0.5, 700, "coin");
            for (const e of g.en.items) {
              if (!e.dead) {
                SANCTUM_BRAND.set(e, true);
                g.damageEnemy(e, (29 + uLv * 6.5) * g.dmgMult(), { crit: true });
              }
            }
          }
        }

        if (uLv >= 7 && Math.abs(t - 3.95) < dt * 1.1) {
          g.flash("#ffd24a", 0.7);
          for (const e of g.en.items) {
            if (!e.dead) {
              g.damageEnemy(e, 140 * g.dmgMult(), { crit: true });
              g.fx.explosion(e.x, e.y, 68, PAL.gold);
            }
          }
        }
        return t < dur;
      },
      (ctx) => {
        const fade = t > 3.9 ? clamp((dur - t) / 0.6, 0, 1) : 1;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = fade;

        // 自機背後展開橫跨全畫面的巨型熾天使十字聖弓紋章！
        const bowScale = clamp(t / 0.6, 0, 1);
        const bw = 480 * bowScale;
        ctx.drawImage(glow("#ffd24a", 128), g.p.x - 160, g.p.y - 160, 320, 320);
        drawVfxElement(ctx, 1, g.p.x - bw * 0.5, g.p.y - bw * 0.42, bw, bw * 0.75);

        // 全場黃金十字鎖定準星
        for (const e of g.en.items) {
          if (e.dead) continue;
          ctx.strokeStyle = "#ffd24a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r + 16, 0, TAU);
          ctx.stroke();
        }

        // 1.05s 起轟出貫穿天地與橫向十字的超巨型「萬丈十字星聖砲」！
        if (t >= 1.05) {
          const w = (115 + Math.sin(t * 24) * 14) * fade;
          const bx = g.p.x;
          ctx.fillStyle = "rgba(255, 210, 74, 0.72)";
          ctx.fillRect(bx - w, 0, w * 2, g.p.y - 10);
          ctx.fillStyle = "rgba(98, 232, 255, 0.6)";
          ctx.fillRect(0, H * 0.36 - w * 0.45, W, w * 0.9);

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(bx - w * 0.42, 0, w * 0.84, g.p.y - 10);
          ctx.fillRect(0, H * 0.36 - w * 0.18, W, w * 0.36);

          if (uLv >= 5) {
            ctx.fillStyle = "rgba(255, 224, 102, 0.6)";
            ctx.fillRect(bx - 165, 0, 26, g.p.y);
            ctx.fillRect(bx + 139, 0, 26, g.p.y);
          }
        }
        ctx.restore();
      }
    );
  },

  drawOver(g, ctx) {
    drawBars(ctx, g.p.x, g.p.y + 42, (g.p.k.volleyIdx % 4) / 4, "#ffd24a", 44);
  },
};

========== 來源：003/src/game/data/ships.ts ==========
// 機體資料：十二架玩法互不相同的戰機（原創命名）。SHIPS／SKILL_KEYS／SKILL_LABEL／SKILL_MAX_PERM／SKILL_MAX_RUN／EVO_LEVELS 為契約匯出
import type { ShipId } from "../types";
export type SkillKey = "weapon" | "passive" | "active" | "ult";
export const SKILL_KEYS: SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = { weapon: "主武裝", passive: "被動技", active: "主動技", ult: "奧義" };
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS = [3, 5, 7];
/** 新專案專用：奧義（p.form===1）期間強制顯示第 4 階外觀的機體 */
export const FORM_TIER3: ShipId[] = ["drill"];
export interface SkillInfo { name: string; en: string; icon: string; desc: string; evo: [string, string, string] }
export interface ShipDef {
  id: ShipId; name: string; en: string; sigil: string; sigilEn: string; pilot: string; pilotEn: string; role: string;
  color: string; color2: string; dark: string; quote: string; lore: string;
  portrait: { sheet: string; col: number; focus: number; cropR?: number; focusX?: number; zoom?: number };
  base: { hp: number; spd: number; atk: number; rate: number };
  radar: { atk: number; spd: number; def: number; rng: number; ease: number };
  activeCd: number; ultTime: number;
  skills: { weapon: SkillInfo; passive: SkillInfo; active: SkillInfo; ult: SkillInfo };
  cut: { line1: string; line2: string };
  cutin: { c1: string; c2: string; c3: string; angle: number };
}
const K = (name: string, en: string, icon: string, desc: string, e1: string, e2: string, e3: string): SkillInfo => ({ name, en, icon, desc, evo: [e1, e2, e3] });
export const SHIPS: Record<ShipId, ShipDef> = {
  snipper: {
    id: "snipper", name: "裁影", en: "SNIPPER", sigil: "裁", sigilEn: "SHEARS", pilot: "裁堂 紗綾", pilotEn: "SAYA", role: "交叉斬擊・斷彈",
    color: "#ff3d9a", color2: "#f4e9ff", dark: "#2a0a1c", quote: "剪不斷的，就剪到它斷。", lore: "機首是一把會開合的巨型剪刀，兩片刃交錯時能把空間與彈幕一併剪開。尾部兩個指環是推進器。",
    portrait: { sheet: "a", col: 1, focus: 0.24 }, base: { hp: 100, spd: 350, atk: 1.0, rate: 1.2 }, radar: { atk: 4, spd: 4, def: 2, rng: 3, ease: 3 }, activeCd: 11, ultTime: 44,
    skills: {
      weapon: K("交刃剪", "Cross Shears", "snipper_w", "機首剪刀開合，每次閉合射出兩道交叉刃波，於前方交點造成加倍傷害。", "交點爆裂，附帶範圍傷害", "加射第二組寬角交叉刃", "交點開出貫穿的大剪斷並標記敵人"),
      passive: K("量身裁剪", "Tailored", "snipper_p", "擦彈累積裁剪層數，滿 8 層後下一次閉合為強化裁剪。", "強化裁剪範圍變大", "擦彈所需降為 6 次", "強化裁剪同時剪斷附近敵彈"),
      active: K("斷線裁切", "Seam Cut", "snipper_a", "兩側剪刃橫掃至目標高度閉合，斬斷整條線上的敵人與敵彈，並留下裂縫。", "裂縫持續時間延長", "裂縫寬度擴大", "閉合時追加一道縱向斬，形成十字裂縫"),
      ult: K("天裁・千針萬線", "Heaven Shears", "snipper_u", "巨剪自天而降，先縱裂畫面，再以多角度連續剪斷，最後收線全場崩裂。", "剪擊次數 +2", "裂縫內拖入敵人持續傷害", "收線後裂縫引爆，傷害翻倍"),
    },
    cut: { line1: "天裁", line2: "把這片天空，裁成兩半" }, cutin: { c1: "#ff3d9a", c2: "#2a0a1c", c3: "#ffd0ea", angle: 0.18 },
  },
  splash: {
    id: "splash", name: "潑潮", en: "SPLASH", sigil: "潑", sigilEn: "JET", pilot: "潑野 雨", pilotEn: "AME", role: "高速連射・擊退濕潤",
    color: "#36c8ff", color2: "#ffffff", dark: "#06202e", quote: "水槍戰，我從沒輸過！", lore: "機背扛著大型蓄壓水槍。連射的水柱能把敵機推著跑，浸濕的敵人會變得更脆弱。",
    portrait: { sheet: "a", col: 3, focus: 0.24 }, base: { hp: 110, spd: 340, atk: 0.9, rate: 1.6 }, radar: { atk: 3, spd: 3, def: 3, rng: 3, ease: 5 }, activeCd: 10, ultTime: 43,
    skills: {
      weapon: K("高壓水槍", "Pressure Jet", "splash_w", "連射水柱，命中擊退敵機並使其濕潤（受傷 +12%）。", "雙噴嘴，水柱數量增加", "水柱略微導引並濺射", "壓力滿時噴出貫穿水炮"),
      passive: K("蓄壓", "Pressure Build", "splash_p", "靜止不動時水壓上升，水壓滿時下一輪連射改為三向強化噴射。", "蓄壓速度提升", "移動時水壓不再歸零，只會緩降", "水壓滿時額外附帶濺射"),
      active: K("水球炸彈", "Water Balloon", "splash_a", "投出巨大水球落地爆開，化為向上推進的浪牆，推開敵機與敵彈。", "浪牆更寬", "浪牆推力加大並使敵人濕潤", "浪牆通過後留下水窪持續減速"),
      ult: K("怒濤天降", "Torrent", "splash_u", "天降水柱連連，巨浪席捲全場把敵人高高捲起，並留下積水。", "水柱數量 +50%", "巨浪傷害提升", "積水持續更久並持續傷害"),
    },
    cut: { line1: "怒濤天降", line2: "全員，淋個透心涼！" }, cutin: { c1: "#36c8ff", c2: "#06202e", c3: "#dff6ff", angle: 0.2 },
  },
  arbalest: {
    id: "arbalest", name: "十字弩光", en: "ARBALEST", sigil: "弩", sigilEn: "CROSSBOW", pilot: "十弓 聖司", pilotEn: "SEIJI", role: "精準狙擊・十字分裂",
    color: "#ffd86b", color2: "#27408b", dark: "#0b1230", quote: "一矢為十，十矢歸一。", lore: "機體本身就是一把十字弩，弓臂張開時蓄積光能。光矢命中後朝四方分裂，像在敵陣中開出一朵十字花。",
    portrait: { sheet: "b", col: 1, focus: 0.24 }, base: { hp: 100, spd: 330, atk: 1.05, rate: 0.9 }, radar: { atk: 4, spd: 3, def: 2, rng: 5, ease: 3 }, activeCd: 12, ultTime: 47,
    skills: {
      weapon: K("十字光矢", "Cross Bolt", "arbalest_w", "射出十字形光矢，命中後朝上下左右分裂出 4 枚小光矢。", "光矢貫穿 +1", "交替射出斜十字（X 形）", "分裂光矢再次分裂一次"),
      passive: K("準星", "Crosshair", "arbalest_p", "光矢命中同一敵機會疊加十字紋章，三層後引爆為十字光柱。", "引爆光柱加寬", "疊層所需降為 2 次", "引爆時對周圍敵機也疊一層"),
      active: K("落星連弩", "Sky Volley", "arbalest_a", "向天空射出光矢，隨後鎖定不同敵人垂直落下並於落點十字爆炸。", "落星數量 +2", "十字爆炸範圍擴大", "落點留下持續傷害的星痕"),
      ult: K("星十字裁決", "Star Cross", "arbalest_u", "巨大星十字降臨戰場，四臂依序貫穿，最後裁決光柱橫掃全場。", "十字臂傷害提升", "追加對角線 X 臂", "裁決光柱二連發"),
    },
    cut: { line1: "星十字裁決", line2: "此矢，貫穿天幕" }, cutin: { c1: "#ffd86b", c2: "#0b1230", c3: "#fff4c8", angle: 0.16 },
  },
  lash: {
    id: "lash", name: "鞭影", en: "LASH", sigil: "鞭", sigilEn: "WHIP", pilot: "鞭獄 蓮", pilotEn: "REN", role: "物理長鞭・拉攏重擊",
    color: "#8f5bff", color2: "#38e6ff", dark: "#150a30", quote: "聽，那是天空被抽響的聲音。", lore: "機首延伸出一條有重量的長鞭，隨機體移動而擺盪。鞭梢超過音速的那一瞬間，空氣會被撕開。",
    portrait: { sheet: "b", col: 2, focus: 0.24 }, base: { hp: 105, spd: 345, atk: 1.0, rate: 1.0 }, radar: { atk: 4, spd: 4, def: 2, rng: 3, ease: 2 }, activeCd: 11, ultTime: 44,
    skills: {
      weapon: K("蛇腹長鞭", "Long Lash", "lash_w", "長鞭以物理擺盪，每隔一陣自動朝最近敵人抽擊，鞭梢越快傷害越高，鞭響時釋放裂波。", "鞭身加長", "鞭響裂波貫穿", "抽擊時追加殘影鞭"),
      passive: K("馴服", "Tame", "lash_p", "被鞭擊的敵機陷入暈眩，射擊頻率降低。", "暈眩時間延長", "暈眩敵機受到的鞭擊傷害 +20%", "暈眩敵機死亡時反彈衝擊波"),
      active: K("縛陣", "Binding Round", "lash_a", "長鞭同時捲住最多 3 名敵人，將其拉攏後互相撞擊炸裂。", "可綁縛 4 名敵人", "拉攏後爆炸範圍擴大", "爆炸後鞭影四散追擊"),
      ult: K("千鞭風暴", "Thousand Lashes", "lash_u", "鞭影自四面八方抽向敵陣，天頂巨鞭橫掃，最後以一記全屏鞭響收尾。", "鞭影數量 +40%", "天頂巨鞭加寬", "全屏鞭響傷害翻倍"),
    },
    cut: { line1: "千鞭風暴", line2: "聽見了嗎，這是你的終曲" }, cutin: { c1: "#8f5bff", c2: "#150a30", c3: "#d8c8ff", angle: -0.22 },
  },
  parasol: {
    id: "parasol", name: "紙傘", en: "PARASOL", sigil: "傘", sigilEn: "UMBRELLA", pilot: "傘凪 花梨", pilotEn: "KARIN", role: "反射防禦・以守為攻",
    color: "#ff9ec1", color2: "#fff1d6", dark: "#2e0f1a", quote: "雨再大，也淋不到我。", lore: "機體上方撐著一把和紙傘，傘面能反射彈幕。她一向從容，因為她知道每一顆子彈都會變成自己的武器。",
    portrait: { sheet: "b", col: 3, focus: 0.24 }, base: { hp: 120, spd: 330, atk: 0.9, rate: 1.2 }, radar: { atk: 3, spd: 3, def: 4, rng: 3, ease: 4 }, activeCd: 12, ultTime: 46,
    skills: {
      weapon: K("骨扇齊射", "Rib Fan", "parasol_w", "傘骨針扇形射出，飛行中向中心收束，遠距離形成集中火力。", "針數 +2", "收束後穿透敵機", "針尖命中時綻開小花瓣追擊"),
      passive: K("撐傘", "Open Umbrella", "parasol_p", "受擊時自動撐開大傘，反射周圍敵彈為我方彈（有冷卻）。", "冷卻縮短", "反射範圍擴大", "反射彈幕改為追蹤雨滴"),
      active: K("開傘", "Parasol Guard", "parasol_a", "撐開傘面 4 秒，正面彈幕被反射為追蹤雨滴。", "持續時間延長", "傘面變寬", "傘面旋轉反射全方位"),
      ult: K("百傘繚亂", "Hundred Umbrellas", "parasol_u", "百把紙傘綻放在戰場，邊旋轉邊射出針雨並反射彈幕，最後巨傘罩下花瓣落盡。", "傘數量 +30%", "傘面反射改為追蹤", "巨傘落下時引爆全場"),
    },
    cut: { line1: "百傘繚亂", line2: "請，賞花" }, cutin: { c1: "#ff9ec1", c2: "#2e0f1a", c3: "#ffe6ef", angle: 0.2 },
  },
};

========== 來源：003/src/game/render/shipDrawArbalest.ts ==========
// 十字弩光：機體本身是一把十字弩，弓臂與弓弦會隨蓄力 aux 拉開
import { drawGear, sp, lin, flame, mirror } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";
import { shade, rgba } from "./colorUtil";
import { glow } from "./sprites";
export function drawArbalest(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, thrust, tier } = o, c1 = o.color, c2 = o.color2, ink = "#080c1e", dr = Math.min(1, o.aux ?? 0.2), gold = lin(ctx, 0, -40, 0, 40, [[0, "#fff3c0"], [0.5, c1], [1, shade(c1, -0.3)]]);
  drawGear(ctx, o, false);
  if (tier >= 3) { ctx.save(); ctx.globalCompositeOperation = "lighter"; for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { ctx.save(); ctx.scale(s, 1); ctx.translate(8, 20 - i * 7); ctx.rotate(0.9 + i * 0.12); ctx.fillStyle = rgba(c1, 0.5 - i * 0.08); ctx.beginPath(); ctx.ellipse(18, 0, 22 - i * 3, 3.2, 0, 0, 6.3); ctx.fill(); ctx.restore(); } ctx.restore(); }
  flame(ctx, 0, 40, 5, 34, thrust, t, "#ffffff", c1);
  mirror(ctx, () => {
    if (tier >= 2) sp(ctx, "M7 24L22 40L16 42L6 32Z", lin(ctx, 6, 0, 22, 0, [[0, c2], [1, ink]]), c1, 1);
    // 弓臂
    sp(ctx, "M6 -17C22 -30 42 -21 46 -1L41 -1C37 -14 22 -20 6 -10Z", lin(ctx, 6, 0, 46, 0, [[0, shade(c2, 0.1)], [1, "#0e1840"]]), c1, 1.4);
    ctx.strokeStyle = c1; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(8, -15); ctx.bezierCurveTo(22, -26, 38, -19, 43, -3); ctx.stroke();
    if (tier >= 1) sp(ctx, "M43 -2L50 -8L47 4Z", "#ffffff", c1, 1);
  });
  // 弓弦
  const ny = -12 + dr * 20; ctx.strokeStyle = rgba("#ffffff", 0.9); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-45, -1); ctx.lineTo(0, ny); ctx.lineTo(45, -1); ctx.stroke();
  // 弩身
  sp(ctx, "M-5 -40L5 -40L8 -10L7 34L0 40L-7 34L-8 -10Z", lin(ctx, -8, 0, 8, 0, [[0, "#1a2a6a"], [0.5, c2], [1, "#0e1840"]]), ink, 1.5);
  ctx.strokeStyle = gold; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, 30); ctx.stroke(); ctx.strokeStyle = c1; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-7, -8); ctx.lineTo(7, -8); ctx.moveTo(-7, 18); ctx.lineTo(7, 18); ctx.stroke();
  sp(ctx, "M-4 0Q0 -6 4 0L3 12Q0 15 -3 12Z", lin(ctx, 0, -4, 0, 14, [[0, "#fff6d0"], [1, c1]]), ink, 1);
  if (tier >= 2) { sp(ctx, "M-2 -22H2V-4H-2Z", "#1a2a6a", c1, 1); ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(0, -22, 2, 0, 6.3); ctx.fill(); }
  // 上膛光矢
  const by = -30 + dr * 14; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(glow(c1, 64), -12, by - 14, 24, 24); ctx.restore();
  sp(ctx, "M0 -9L2 -2L8 -1L2 1L0 9L-2 1L-8 -1L-2 -2Z", "#ffffff", c1, 0.8); ctx.save(); ctx.translate(0, by); ctx.scale(0.7, 0.7); ctx.restore();
  if (tier >= 3) { ctx.save(); ctx.translate(0, -44); ctx.strokeStyle = rgba(c1, 0.9); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, 0, 9, 0, 6.3); ctx.moveTo(-14, 0); ctx.lineTo(14, 0); ctx.moveTo(0, -14); ctx.lineTo(0, 14); ctx.stroke(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(glow(c1, 64), -14, -14, 28, 28); ctx.restore(); }
  drawGear(ctx, o, true);
}

========== 來源：003/src/game/render/shipDrawLash.ts ==========
// 鞭影：銳利楔形戰機＋機首捲鞭盤。長鞭本體由機體技能以物理擺盪繪製
import { drawGear, sp, lin, flame, mirror } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";
import { shade, rgba } from "./colorUtil";
import { glow } from "./sprites";
export function drawLash(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, thrust, tier } = o, c1 = o.color, c2 = o.color2, ink = "#0b0618", dk = shade(c1, -0.4), fl = o.mode ? 1 : 0;
  drawGear(ctx, o, false);
  flame(ctx, 0, 38, 6, 36, thrust, t, "#f0e6ff", c1); mirror(ctx, () => flame(ctx, 24, 38, 3.4, 26, thrust, t + 1, "#e6fbff", c2));
  mirror(ctx, (s) => {
    sp(ctx, "M12 10L40 32L35 40L10 33Z", lin(ctx, 10, 0, 40, 0, [[0, c1], [1, dk]]), ink, 1.3);
    sp(ctx, "M13 -6L31 -15L25 7Z", lin(ctx, 13, 0, 31, 0, [[0, shade(c1, 0.1)], [1, dk]]), ink, 1.2);
    ctx.strokeStyle = rgba(c2, 0.9); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(14, 12); ctx.lineTo(36, 33); ctx.stroke();
    if (tier >= 1) { ctx.strokeStyle = rgba("#ffffff", 0.9); ctx.beginPath(); ctx.moveTo(16, -5); ctx.lineTo(29, -12); ctx.stroke(); for (let i = 0; i < 3; i++) { ctx.fillStyle = ink; ctx.beginPath(); ctx.moveTo(18 + i * 7, 17 + i * 6); ctx.lineTo(21 + i * 7, 14 + i * 6); ctx.lineTo(22 + i * 7, 19 + i * 6); ctx.fill(); } }
    if (tier >= 2) { ctx.save(); ctx.translate(36, 34); ctx.fillStyle = "#1a0f30"; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 6.3); ctx.fill(); ctx.strokeStyle = c2; ctx.lineWidth = 1.2; ctx.stroke(); ctx.rotate(t * 3 * s); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(0, 0, 1.4 + i * 1.1, 0, 4.7); ctx.stroke(); } ctx.restore(); sp(ctx, "M30 -15L38 -26L34 -10Z", c2, ink, 0.9); }
  });
  sp(ctx, "M0 -42L9 -16L14 6L12 30L0 38L-12 30L-14 6L-9 -16Z", lin(ctx, -14, 0, 14, 0, [[0, dk], [0.5, shade(c1, 0.05)], [1, dk]]), ink, 1.6);
  ctx.strokeStyle = rgba(c2, 0.95); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(0, 30); ctx.moveTo(-9, -14); ctx.lineTo(-12, 28); ctx.moveTo(9, -14); ctx.lineTo(12, 28); ctx.stroke();
  sp(ctx, "M-6 -2Q0 -12 6 -2L5 12Q0 17 -5 12Z", lin(ctx, 0, -10, 0, 14, [[0, "#d8f8ff"], [1, "#3a1a6a"]]), ink, 1);
  // 捲鞭盤
  ctx.save(); ctx.translate(0, -30); ctx.fillStyle = "#150c28"; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 6.3); ctx.fill(); ctx.strokeStyle = c2; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = rgba("#e6d8ff", 0.95); ctx.lineWidth = 1.4; ctx.rotate(-t * (fl ? 6 : 1.2)); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 0, 2 + i * 1.5, 0.4, 5.6); ctx.stroke(); } ctx.restore();
  if (tier >= 3) { sp(ctx, "M0 -46L5 -58L0 -52L-5 -58Z", c2, ink, 1); ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(glow(c1, 64), -32, -48, 64, 90); ctx.restore(); }
  drawGear(ctx, o, true);
}

========== 來源：003/src/game/render/shipDrawParasol.ts ==========
// 紙傘：細長機身＋機首的和紙傘（俯視為圓形傘面，aux＝張開程度，傘骨與紙面分瓣）
import { drawGear, sp, lin, flame, mirror } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";
import { shade, rgba } from "./colorUtil";
import { glow } from "./sprites";
export function drawParasol(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, thrust, tier } = o, c1 = o.color, c2 = o.color2, ink = "#2a0e18", dk = shade(c1, -0.3), op = Math.min(1, Math.max(0, o.aux ?? 0.35)), R = 13 + op * 20, CY = -10;
  drawGear(ctx, o, false);
  flame(ctx, 0, 44, 5, 34, thrust, t, "#ffffff", c1);
  mirror(ctx, (s) => {
    sp(ctx, "M7 14L27 27L23 36L6 29Z", lin(ctx, 6, 0, 27, 0, [[0, c2], [1, dk]]), ink, 1.2);
    if (tier >= 1) { ctx.save(); ctx.translate(26, 8); for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? c1 : c2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 7, i * 0.785, (i + 1) * 0.785); ctx.fill(); } ctx.strokeStyle = ink; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 6.3); ctx.stroke(); ctx.restore(); }
    void s;
  });
  sp(ctx, "M0 -30C6 -24 8 -4 7 16C6 30 3 38 0 42C-3 38 -6 30 -7 16C-8 -4 -6 -24 0 -30Z", lin(ctx, -8, 0, 8, 0, [[0, dk], [0.5, c2], [1, dk]]), ink, 1.5);
  ctx.strokeStyle = c1; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 40); ctx.stroke();
  ctx.strokeStyle = ink; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(0, 38); ctx.lineTo(0, 48); ctx.quadraticCurveTo(0, 55, 7, 54); ctx.stroke(); ctx.lineCap = "butt";
  sp(ctx, "M-4 8Q0 2 4 8L3 20Q0 23 -3 20Z", lin(ctx, 0, 4, 0, 22, [[0, "#ffe8f0"], [1, c1]]), ink, 1);
  // 傘面
  const N = 12; ctx.save(); ctx.translate(0, CY); ctx.rotate(Math.sin(t * 1.2) * 0.04);
  if (tier >= 3) { ctx.strokeStyle = rgba(c1, 0.6); ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.arc(0, 0, R + 8, 0, 6.3); ctx.stroke(); ctx.setLineDash([]); }
  for (let i = 0; i < N; i++) { const a0 = (i / N) * 6.2832, a1 = ((i + 1) / N) * 6.2832; ctx.fillStyle = i % 2 ? c1 : c2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.fill(); }
  ctx.strokeStyle = ink; ctx.lineWidth = 1; for (let i = 0; i < N; i++) { const a = (i / N) * 6.2832; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R); ctx.stroke(); }
  ctx.strokeStyle = "#c8102e"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.arc(0, 0, R, 0, 6.3); ctx.stroke(); ctx.strokeStyle = rgba("#ffffff", 0.7); ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, 6.3); ctx.stroke();
  if (tier >= 1) { ctx.fillStyle = "#fff6b8"; for (let i = 0; i < N; i++) { const a = (i / N) * 6.2832; ctx.beginPath(); ctx.arc(Math.cos(a) * (R + 1), Math.sin(a) * (R + 1), 1.8, 0, 6.3); ctx.fill(); } }
  if (tier >= 2) for (let i = 0; i < 6; i++) { const a = i * 1.047 + 0.3; ctx.save(); ctx.translate(Math.cos(a) * R * 0.72, Math.sin(a) * R * 0.72); ctx.rotate(a); for (let k = 0; k < 5; k++) { ctx.rotate(1.2566); ctx.fillStyle = rgba("#ffffff", 0.85); ctx.beginPath(); ctx.ellipse(0, -1.8, 0.9, 1.7, 0, 0, 6.3); ctx.fill(); } ctx.restore(); }
  ctx.fillStyle = "#c8102e"; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, 6.3); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
  if (tier >= 2) mirror(ctx, () => { ctx.strokeStyle = "#c8102e"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(R * 0.8, CY + R * 0.6); ctx.quadraticCurveTo(R * 0.9, CY + R * 0.6 + 8, R * 0.85 + Math.sin(t * 3) * 1.5, CY + R * 0.6 + 14); ctx.stroke(); });
  if (tier >= 3) for (let i = 0; i < 5; i++) { const f = (t * 0.3 + i * 0.2) % 1; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = Math.sin(f * 3.14); ctx.drawImage(glow(c1, 32), Math.sin(f * 7 + i * 2) * 36 - 5, -50 + f * 110 - 5, 10, 10); ctx.restore(); }
  drawGear(ctx, o, true);
}

========== 來源：003/src/game/render/shipDrawSnipper.ts ==========
// 裁影：機首是一把會開合的剪刀，指環是推進器。aux＝開合量 0（閉）~1（全開）
import { drawGear, sp, lin, flame, mirror } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";
import { shade, rgba } from "./colorUtil";
export function drawSnipper(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, thrust, tier } = o, c1 = o.color, ink = "#16111c", a = 0.05 + (o.aux ?? 0.4) * 0.3, steel = (x0: number, x1: number) => lin(ctx, x0, 0, x1, 0, [[0, "#ffffff"], [0.4, "#e6dcf0"], [1, "#9a8fae"]]);
  drawGear(ctx, o, false);
  mirror(ctx, (s) => {
    // 指環（推進器）
    ctx.save(); ctx.translate(13, 33); ctx.strokeStyle = ink; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, 0, 7, 10, 0.18, 0, 6.3); ctx.stroke(); ctx.strokeStyle = c1; ctx.lineWidth = 5; ctx.stroke(); ctx.strokeStyle = "#ffe1f2"; ctx.lineWidth = 1.2; ctx.stroke(); ctx.restore();
    flame(ctx, 13, 40, 5, 34, thrust, t + s, "#ffffff", c1);
    // 握柄
    sp(ctx, "M-1 -6L5 2L17 24L11 29L3 8Z", lin(ctx, 0, 0, 18, 0, [[0, "#3a2a48"], [1, "#1b1424"]]), ink, 1.2);
    if (tier >= 1) { ctx.strokeStyle = rgba("#ffffff", 0.55); ctx.setLineDash([2, 3]); ctx.beginPath(); ctx.moveTo(4, 2); ctx.lineTo(14, 24); ctx.stroke(); ctx.setLineDash([]); }
  });
  // 兩片刃（繞樞軸旋轉）
  mirror(ctx, (s) => {
    ctx.save(); ctx.translate(0, -8); ctx.rotate(a);
    sp(ctx, "M-1 4L6 0L3 -36L-1 -52Z", steel(-1, 6), ink, 1.3); sp(ctx, "M-1 4L2 2L0 -50L-1 -52Z", "#ffffff", null);
    ctx.strokeStyle = c1; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(5.4, -2); ctx.lineTo(2.8, -34); ctx.stroke();
    if (tier >= 1) { ctx.strokeStyle = rgba(ink, 0.8); ctx.lineWidth = 0.8; for (let i = 1; i < 8; i++) { ctx.beginPath(); ctx.moveTo(5 - i * 0.3, -i * 5.2); ctx.lineTo(3.2 - i * 0.3, -i * 5.2 + (i % 2 ? 0 : -1)); ctx.stroke(); } }
    ctx.restore();
  });
  // 樞軸螺絲
  ctx.fillStyle = lin(ctx, -9, -17, 9, 1, [[0, "#6a5a7c"], [1, "#241a30"]]); ctx.beginPath(); ctx.ellipse(0, -8, 10, 9, 0, 0, 6.3); ctx.fill(); ctx.strokeStyle = c1; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = tier >= 3 ? "#ffd36b" : "#e6dcf0"; ctx.beginPath(); ctx.arc(0, -8, 4.2, 0, 6.3); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, -8); ctx.lineTo(3, -8); ctx.stroke();
  // 座艙（兩握柄之間）
  sp(ctx, "M-5 6Q0 -2 5 6L4 20Q0 24 -4 20Z", lin(ctx, 0, 0, 0, 24, [[0, "#ffd0ea"], [1, c1]]), ink, 1);
  if (tier >= 2) mirror(ctx, (s) => {
    ctx.save(); ctx.translate(27, 6); const b = 0.1 + (1 - (o.aux ?? 0.4)) * 0.3;
    for (const k of [-1, 1]) { ctx.save(); ctx.rotate(k * b); sp(ctx, "M0 3L2.4 0L1.4 -15L0 -20Z", steel(0, 2.4), ink, 0.9); ctx.restore(); }
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(0, 3, 2.2, 0, 6.3); ctx.fill(); ctx.restore(); void s;
  });
  if (tier >= 3) for (const k of [-1, 1]) {
    ctx.strokeStyle = rgba("#ffe1f2", 0.85); ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 14; i++) { const f = i / 14; const x = k * (13 + Math.sin(f * 6 - t * 5) * 5 * f + f * 4), y = 44 + f * 30; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = rgba(shade(c1, 0.1), 0.9); ctx.lineWidth = 0.8; ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
  }
  drawGear(ctx, o, true);
}

========== 來源：003/src/game/render/shipDrawSplash.ts ==========
// 潑潮：流線機身＋背負水箱（水位隨水壓 aux 變化）＋長噴嘴
import { drawGear, sp, lin, flame, mirror } from "./shipUtil";
import type { ShipDrawOpts } from "./shipUtil";
import { shade, rgba } from "./colorUtil";
import { glow } from "./sprites";
export function drawSplash(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const { t, thrust, tier } = o, c1 = o.color, ink = "#06141e", dk = shade(c1, -0.32), pr = Math.min(1, o.aux ?? 0.3);
  drawGear(ctx, o, false);
  flame(ctx, 0, 40, 6, 36, thrust, t, "#ffffff", c1);
  mirror(ctx, (s) => {
    sp(ctx, "M11 6L31 22L29 31L11 25Z", lin(ctx, 11, 0, 31, 0, [[0, c1], [1, dk]]), ink, 1.2);
    if (tier >= 2) { sp(ctx, "M22 14H29V30H22Z", rgba("#bfeaff", 0.55), "#e6f8ff", 1); ctx.fillStyle = rgba("#ffffff", 0.9); for (let i = 0; i < 3; i++) { const f = (t * 0.7 + i / 3 + (s > 0 ? 0.2 : 0)) % 1; ctx.beginPath(); ctx.arc(25.5 + Math.sin(f * 9 + i) * 1.4, 29 - f * 14, 0.9 + (1 - f), 0, 6.3); ctx.fill(); } }
    if (tier >= 1) { sp(ctx, "M12 -28H16V-10H12Z", "#dff6ff", ink, 1); ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(14, -29, 2.6, 0, 6.3); ctx.fill(); }
  });
  sp(ctx, "M0 -34C10 -28 13 -8 12 14C11 30 6 38 0 40C-6 38 -11 30 -12 14C-13 -8 -10 -28 0 -34Z", lin(ctx, -12, 0, 12, 0, [[0, dk], [0.45, c1], [1, dk]]), ink, 1.6);
  ctx.strokeStyle = rgba("#ffffff", 0.7); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-8, -14); ctx.quadraticCurveTo(-11, 6, -8, 24); ctx.stroke();
  // 噴嘴
  sp(ctx, "M-3 -30H3V-46H-3Z", lin(ctx, -3, 0, 3, 0, [[0, "#7f8ea0"], [0.5, "#f1f6ff"], [1, "#6a7888"]]), ink, 1.1); sp(ctx, "M-5 -44H5L4 -49H-4Z", "#2a3a4a", ink, 1); ctx.strokeStyle = c1; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-5, -40); ctx.lineTo(5, -40); ctx.stroke();
  if (pr > 0.7) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = (pr - 0.7) / 0.3; ctx.drawImage(glow("#bfeaff", 64), -14, -62, 28, 28); ctx.restore(); }
  // 水箱
  sp(ctx, "M-10 -4H10Q12 -4 12 -2V24Q12 28 8 28H-8Q-12 28 -12 24V-2Q-12 -4 -10 -4Z", rgba("#0a2a40", 0.85), "#dff6ff", 1.4);
  const lvl = 22 - (6 + pr * 16); ctx.save(); ctx.beginPath(); ctx.rect(-11, -2, 22, 29); ctx.clip();
  ctx.fillStyle = lin(ctx, 0, lvl, 0, 28, [[0, "#9fe8ff"], [1, c1]]); ctx.beginPath(); ctx.moveTo(-12, 28); for (let x = -12; x <= 12; x += 3) ctx.lineTo(x, 4 + lvl * 0.0 + (22 - lvl) * 0 + (24 - (6 + pr * 18)) + Math.sin(t * 3 + x * 0.5) * 1.2); ctx.lineTo(12, 28); ctx.fill(); ctx.restore();
  ctx.fillStyle = "#e6f8ff"; ctx.beginPath(); ctx.arc(0, -8, 5, 0, 6.3); ctx.fill(); ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.stroke(); ctx.strokeStyle = pr > 0.85 ? "#ff4d6d" : ink; ctx.beginPath(); ctx.moveTo(0, -8); const na = -2.4 + pr * 2.8; ctx.lineTo(Math.cos(na) * 4.2, -8 + Math.sin(na) * 4.2); ctx.stroke();
  if (tier >= 3) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.drawImage(glow(c1, 64), -22, -16, 44, 44); ctx.strokeStyle = rgba("#dff6ff", 0.8); ctx.lineWidth = 1.4; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(0, -36 - i * 6, 6 + i * 2 + Math.sin(t * 6 + i) * 1.2, 2.2, 0, 0, 6.3); ctx.stroke(); } ctx.restore(); }
  drawGear(ctx, o, true);
}

========== 來源：003/src/game/skills/arbalest.ts ==========
// 十字弩光：十字光矢命中後四向分裂／準星紋章疊層引爆十字光柱／落星連弩／星十字裁決
import { W, H, TAU, rand } from "../constants";
import type { Game } from "../engine/Game";
import type { Enemy } from "../entities";
import type { ShipKit } from "./common";
import { ultScript, beamLine, hitAll, alive, strongest, mkFx, glowAt } from "./common";
import { EXT_BASE_RW } from "../render/pbStylesExt";
import { audio } from "../audio";
const S_CROSS = EXT_BASE_RW + 10, S_MINI = EXT_BASE_RW + 11;
interface K { alt: number; since: number; interval: number; marks: Map<number, { n: number; t: number }>; aux: number; mode: number }
const K = (g: Game) => g.p.k as K;
/** 以 (x,y) 為中心的十字爆擊：垂直＋水平兩道光柱 */
function crossBlast(g: Game, x: number, y: number, len: number, w: number, dmg: number, col = "#ffd86b") {
  for (const e of alive(g)) { const dx = Math.abs(e.x - x), dy = Math.abs(e.y - y); if ((dx < w / 2 + e.r && dy < len) || (dy < w / 2 + e.r && dx < len)) g.damageEnemy(e, dmg * (e.boss ? 0.8 : 1), { noText: true, x: e.x, y: e.y }); }
  let t = 0; mkFx(g, 1, (dt) => (t += dt) < 0.28, (c) => { const u = t / 0.28; beamLine(c, x, y - len, x, y + len, w * (1 - u) * 0.6, col, 1 - u); beamLine(c, x - len, y, x + len, y, w * (1 - u) * 0.6, col, 1 - u); glowAt(c, x, y, 40 * (1 - u) + 14, "#ffffff", 1 - u); });
}
export const arbalest: ShipKit = {
  init(g) { g.p.k = { alt: 0, since: 0.5, interval: 0.55, marks: new Map(), aux: 0.2, mode: 0 } as K; },
  update(g, dt) { const k = K(g); k.since += dt; k.aux = Math.min(1, k.since / k.interval); for (const [id, m] of k.marks) { m.t -= dt; if (m.t <= 0) k.marks.delete(id); } },
  fire(g) {
    const p = g.p, k = K(g), L = g.lvl("weapon"), dm = g.dmgMult(); k.interval = 0.55 / p.s.rate; p.fireT += k.interval; k.since = 0; k.alt ^= 1;
    const diag = L >= 5 && k.alt === 1; g.spawnPB(p.x, p.y - 36, -Math.PI / 2, 920, S_CROSS, 30 * dm, { pierce: p.s.pierce + (L >= 3 ? 1 : 0), life: 1.3, src: 0, a: 0, b: diag ? 1 : 0, c: 0, r: 14, scale: diag ? 1 : 1 }); audio.sfx("shoot1", 0.08);
  },
  onHit(g, b, e) {
    const k = K(g), L = g.lvl("weapon"), dm = g.dmgMult(), pl = g.lvl("passive");
    if (b.style === S_CROSS && b.a === 0) {
      b.a = 1; const off = b.b === 1 ? Math.PI / 4 : 0; for (let i = 0; i < 4; i++) g.spawnPB(b.x, b.y, off + (i * TAU) / 4, 600, S_MINI, 9 * dm, { life: 0.5, src: 2, c: 1, hits: [e.uid] }); g.fx.burst(b.x, b.y, 6, "#ffe9a0", 100, 320, 0.25, 2);
      const m = k.marks.get(e.uid) ?? { n: 0, t: 4 }; m.n++; m.t = 4; k.marks.set(e.uid, m);
      if (m.n >= (pl >= 5 ? 2 : 3)) {
        k.marks.delete(e.uid); crossBlast(g, e.x, e.y, 360, pl >= 3 ? 40 : 28, 70 * dm * (pl >= 3 ? 1.3 : 1)); g.fx.text(e.x, e.y - 20, "十字裂", "#ffd86b", 14); audio.sfx("lightning", 0.1);
        if (pl >= 7) for (const z of alive(g)) if (z !== e && (z.x - e.x) ** 2 + (z.y - e.y) ** 2 < 140 * 140) { const mm = k.marks.get(z.uid) ?? { n: 0, t: 4 }; mm.n++; k.marks.set(z.uid, mm); }
      }
    } else if (b.style === S_MINI && b.c === 1 && L >= 7) { b.c = 2; for (let i = 0; i < 4; i++) g.spawnPB(b.x, b.y, (i * TAU) / 4 + Math.PI / 4, 520, S_MINI, 4 * dm, { life: 0.35, src: 2, c: 2, hits: [e.uid] }); }
  },
  castActive(g) {
    const L = g.lvl("active"), dm = g.dmgMult(), p = g.p, n = 5 + (L >= 3 ? 2 : 0); let ts: Enemy[] = strongest(g, n); const pts: [number, number][] = ts.map((e) => [e.x, e.y]); while (pts.length < n) pts.push([rand(60, W - 60), rand(160, 520)]);
    audio.sfx("charge"); const R = L >= 3 ? 130 : 95;
    pts.forEach(([tx, ty], i) => {
      const d0 = i * 0.09; let t = 0; g.later(d0, () => { mkFx(g, 1, (dt) => (t += dt) < 0.2, (c) => { const u = t / 0.2; beamLine(c, p.x, p.y, p.x + (tx - p.x) * 0.2, p.y - (p.y + 30) * u, 3, "#ffd86b", 1 - u); }); });
      g.later(d0 + 0.3, () => {
        let u = 0; mkFx(g, 1, (dt) => (u += dt) < 0.16, (c) => { const f = u / 0.16; beamLine(c, tx, -40 + (ty + 40) * f - 160, tx, -40 + (ty + 40) * f, 6, "#ffffff", 1); });
        g.later(0.16, () => { crossBlast(g, tx, ty, R, 34, 90 * dm); g.aoe(tx, ty, 46, 40 * dm, { small: true, noText: true, pal: "gold" }); g.shake(4, 0.12); audio.sfx("boom_s", 0.05);
          if (L >= 7) for (let k2 = 1; k2 <= 6; k2++) g.later(k2 * 0.4, () => g.aoe(tx, ty, 44, 22 * dm, { small: true, noText: true, noFx: true })); });
      });
    });
  },
  castUlt(g) {
    const L = g.lvl("ult"), kn = 1 + (L - 1) * 0.1, dm = g.dmgMult(), p = g.p; p.formT = 5.6; const cx = W / 2, cy = H * 0.42, arm = 520; const ext = [0, 0, 0, 0, 0, 0, 0, 0]; const hitArm = [false, false, false, false, false, false, false, false]; let j1 = false, j2 = false, spin = 0;
    ultScript(g, {
      dur: 5.6, color: "#ffd86b", shipIdx: 5, bgSpin: 0.06,
      update: (dt, t) => {
        spin += dt * 0.35; const arms = L >= 5 ? 8 : 4;
        for (let i = 0; i < arms; i++) { const t0 = 0.5 + (i < 4 ? i * 0.28 : 1.9 + (i - 4) * 0.28); if (t >= t0) ext[i] = Math.min(1, ext[i] + dt * 3.5); if (t >= t0 + 0.1 && !hitArm[i]) { hitArm[i] = true; const ang = (i < 4 ? i * Math.PI / 2 : Math.PI / 4 + (i - 4) * Math.PI / 2) + spin; audio.sfx("lightning", 0.05); g.shake(8, 0.25); for (const e of alive(g)) { const dx = e.x - cx, dy = e.y - cy, al = dx * Math.cos(ang) + dy * Math.sin(ang), pe = Math.abs(-dx * Math.sin(ang) + dy * Math.cos(ang)); if (al > -40 && al < arm && pe < 46 + e.r) g.damageEnemy(e, 125 * dm * kn * (e.boss ? 0.8 : 1), { noText: true }); } g.clearBullets(cx, cy, 0, "coin", cx - 0, 0.0001); } }
        if (t >= 4.2 && !j1) { j1 = true; g.flash("#ffffff", 1); g.shake(20, 0.8); audio.sfx("boom_l"); for (const e of alive(g)) if (Math.abs(e.x - cx) < 130 + e.r) g.damageEnemy(e, 440 * dm * kn * (e.boss ? 0.8 : 1), { noText: true }); hitAll(g, 120 * dm * kn); g.clearBullets(0, 0, 9999, "coin"); }
        if (L >= 7 && t >= 4.85 && !j2) { j2 = true; g.flash("#ffd86b", 0.9); g.shake(16, 0.6); for (const e of alive(g)) if (Math.abs(e.y - cy) < 110 + e.r) g.damageEnemy(e, 380 * dm * kn * (e.boss ? 0.8 : 1), { noText: true }); }
      },
      scene: (ctx, t) => {
        const arms = L >= 5 ? 8 : 4;
        for (let i = 0; i < arms; i++) { const u = ext[i]; if (u <= 0) continue; const ang = (i < 4 ? i * Math.PI / 2 : Math.PI / 4 + (i - 4) * Math.PI / 2) + spin, fade = t > 4.3 ? Math.max(0, 1 - (t - 4.3) / 0.8) : 1; beamLine(ctx, cx, cy, cx + Math.cos(ang) * arm * u, cy + Math.sin(ang) * arm * u, 30 * (i < 4 ? 1 : 0.7), "#ffd86b", fade * 0.9); }
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(spin); glowAt(ctx, 0, 0, 120 + Math.sin(t * 8) * 10, "#ffd86b", 1); ctx.fillStyle = "#fff"; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, r = i % 2 ? 22 : 62; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.restore();
        if (t >= 3.4 && t < 4.3) { const u = (t - 3.4) / 0.8; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "#fff6c8"; ctx.lineWidth = 3; for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU, r = 380 * (1 - u); ctx.globalAlpha = u; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.lineTo(cx + Math.cos(a) * (r + 40), cy + Math.sin(a) * (r + 40)); ctx.stroke(); } ctx.restore(); }
        if (t >= 4.2 && t < 5.2) { const u = (t - 4.2) / 1; ctx.save(); ctx.globalCompositeOperation = "lighter"; const w = 240 * (1 - u * 0.7); const g1 = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g1.addColorStop(0, "#ffd86b00"); g1.addColorStop(0.5, `rgba(255,255,255,${1 - u})`); g1.addColorStop(1, "#ffd86b00"); ctx.fillStyle = g1; ctx.fillRect(cx - w / 2, 0, w, H); ctx.restore(); }
        if (L >= 7 && t >= 4.85 && t < 5.5) { const u = (t - 4.85) / 0.65; ctx.save(); ctx.globalCompositeOperation = "lighter"; const h = 220 * (1 - u * 0.7), g1 = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); g1.addColorStop(0, "#ffd86b00"); g1.addColorStop(0.5, `rgba(255,246,200,${1 - u})`); g1.addColorStop(1, "#ffd86b00"); ctx.fillStyle = g1; ctx.fillRect(0, cy - h / 2, W, h); ctx.restore(); }
      },
    });
  },
  drawOver(g, ctx) { const k = K(g); ctx.save(); for (const e of g.en.items) { if (e.dead) continue; const m = k.marks.get(e.uid); if (!m) continue; ctx.strokeStyle = "#ffd86b"; ctx.lineWidth = 1.6; const r = e.r + 6; for (let i = 0; i < m.n; i++) { const a = i * 2.1 + g.t * 2; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * (r - 4), e.y + Math.sin(a) * (r - 4)); ctx.lineTo(e.x + Math.cos(a) * (r + 5), e.y + Math.sin(a) * (r + 5)); ctx.stroke(); } } ctx.restore(); },
  preview(t) { return { mode: 0, aux: 0.5 + 0.5 * Math.sin(t * 2.4) }; },
};
void H;

========== 來源：003/src/game/skills/lash.ts ==========
// 鞭影：物理擺盪長鞭（Verlet 繩索，鞭梢速度決定傷害）／暈眩馴服／縛陣拉攏互撞／千鞭風暴
import { W, H, TAU, rand, clamp } from "../constants";
import type { Game } from "../engine/Game";
import type { Enemy } from "../entities";
import type { ShipKit } from "./common";
import { ultScript, beamLine, hitAll, alive, strongest, segDist, glowAt } from "./common";
import { EXT_BASE_RW } from "../render/pbStylesExt";
import { audio } from "../audio";
const S_CRACK = EXT_BASE_RW + 12, S_SPARK = EXT_BASE_RW + 13;
interface P { x: number; y: number; px: number; py: number }
interface Bind { list: Enemy[]; t: number; mx: number; my: number }
interface K { pts: P[]; crackT: number; tx: number; ty: number; hitCd: Map<number, number>; bind: Bind | null; aux: number; mode: number; flash: number; tipV: number }
const K = (g: Game) => g.p.k as K;
const segN = (g: Game) => 14 + (g.lvl("weapon") >= 3 ? 4 : 0), segL = (g: Game) => 10 + (g.lvl("weapon") >= 3 ? 1.5 : 0);
const anchor = (g: Game) => ({ x: g.p.x, y: g.p.y - 34 });
function mkPts(g: Game) { const a = anchor(g), n = segN(g), L = segL(g), pts: P[] = []; for (let i = 0; i < n; i++) pts.push({ x: a.x, y: a.y - i * L, px: a.x, py: a.y - i * L }); return pts; }
function crackFx(g: Game, x: number, y: number, power: number) {
  const L = g.lvl("weapon"), dm = g.dmgMult(); g.fx.ring(x, y, 4, 44, 0.25, "#d8c8ff", 3); g.fx.burst(x, y, 12, "#ffffff", 120, 480, 0.3, 2.2); g.shake(3 + power * 3, 0.12); audio.sfx("lightning", 0.1);
  g.aoe(x, y, 46, 55 * dm * (0.6 + power * 0.8), { small: true, noText: true, noFx: true }); K(g).flash = 0.14;
  if (L >= 5) { const p = anchor(g); g.spawnPB(x, y, Math.atan2(y - p.y, x - p.x), 620, S_CRACK, 22 * dm, { pierce: 3, life: 0.9, src: 2 }); }
}
export const lash: ShipKit = {
  init(g) { g.p.k = { pts: mkPts(g), crackT: 0, tx: 0, ty: 0, hitCd: new Map(), bind: null, aux: 0, mode: 0, flash: 0, tipV: 0 } as K; },
  update(g, dt) {
    const k = K(g), n = segN(g), SL = segL(g); if (k.pts.length !== n) k.pts = mkPts(g); const a = anchor(g), pts = k.pts, p0 = pts[0]; p0.px = p0.x; p0.py = p0.y; p0.x = a.x; p0.y = a.y; k.flash = Math.max(0, k.flash - dt); k.mode = k.flash > 0 ? 1 : 0;
    const tip = pts[n - 1], ox = tip.x, oy = tip.y;
    for (let i = 1; i < n; i++) { const q = pts[i], vx = (q.x - q.px) * 0.965, vy = (q.y - q.py) * 0.965; q.px = q.x; q.py = q.y; q.x += vx; q.y += vy; const f = (i / n) * 3.2 * dt; q.x += (a.x - q.x) * f; q.y += (a.y - i * SL * 0.9 - q.y) * f; }
    if (k.crackT > 0) { k.crackT -= dt; tip.x += (k.tx - tip.x) * Math.min(1, dt * 16); tip.y += (k.ty - tip.y) * Math.min(1, dt * 16); if (k.crackT <= 0) { crackFx(g, tip.x, tip.y, 1); const L = g.lvl("weapon"); if (L >= 7) { for (const i of [Math.floor(n * 0.5), Math.floor(n * 0.75)]) g.aoe(pts[i].x, pts[i].y, 36, 30 * g.dmgMult(), { small: true, noText: true, noFx: true }); } } }
    for (let it = 0; it < 5; it++) { pts[0].x = a.x; pts[0].y = a.y; for (let i = 1; i < n; i++) { const A = pts[i - 1], B = pts[i], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, df = (d - SL) / d; if (i === 1) { B.x -= dx * df; B.y -= dy * df; } else { A.x += dx * df * 0.5; A.y += dy * df * 0.5; B.x -= dx * df * 0.5; B.y -= dy * df * 0.5; } } }
    k.tipV = Math.hypot(tip.x - ox, tip.y - oy) / Math.max(dt, 1e-3);
    for (const [id, t] of k.hitCd) { if (t - dt <= 0) k.hitCd.delete(id); else k.hitCd.set(id, t - dt); }
    const dm = g.dmgMult(), pl = g.lvl("passive"), L = g.lvl("weapon");
    if (k.tipV > 700) for (let i = n - 4; i < n; i++) for (const e of g.en.items) { if (e.dead || e.y < -10 || k.hitCd.has(e.uid)) continue; const rr = 20 + e.r; if ((e.x - pts[i].x) ** 2 + (e.y - pts[i].y) ** 2 > rr * rr) continue; k.hitCd.set(e.uid, 0.12); const dz = e.brand > 0 && pl >= 5 ? 1.2 : 1; g.damageEnemy(e, clamp(k.tipV / 2200, 0.3, 1.6) * 24 * dm * dz * (L >= 3 ? 1.1 : 1), { noText: false, x: pts[i].x, y: pts[i].y }); e.brand = pl >= 3 ? 3.2 : 2.4; e.fireMul = 0.45; e.slow = Math.max(e.slow, 0.25); }
    for (const e of g.en.items) if (!e.dead && e.brand > 0) { e.brand -= dt; if (e.brand <= 0) e.fireMul = g.fireMul; }
    const b = k.bind; if (b) {
      b.t += dt; for (const e of b.list) if (!e.dead && !e.boss) { e.x += (b.mx - e.x) * Math.min(1, dt * 4); e.y += (b.my - e.y) * Math.min(1, dt * 4); }
      if (b.t >= 0.9) { const L2 = g.lvl("active"); g.aoe(b.mx, b.my, L2 >= 5 ? 110 : 80, 150 * dm, { pal: "void" }); for (const e of b.list) if (!e.dead) g.damageEnemy(e, 80 * dm, { noText: true }); g.shake(9, 0.3); audio.sfx("boom_m"); if (L2 >= 7) for (let i = 0; i < 6; i++) g.spawnPB(b.mx, b.my, (i * TAU) / 6, 480, S_SPARK, 12 * dm, { homing: 2.4, life: 1.4, src: 2 }); k.bind = null; }
    }
  },
  fire(g) {
    const k = K(g), p = g.p; p.fireT += 0.6 / p.s.rate; const a = anchor(g), e = g.nearest(a.x, a.y - 80, 460); if (!e) { p.fireT = 0.15; return; }
    k.tx = e.x; k.ty = e.y; k.crackT = 0.2; const pts = k.pts, n = pts.length; const dx = e.x - a.x, dy = e.y - a.y, d = Math.hypot(dx, dy) || 1; for (let i = Math.floor(n * 0.5); i < n; i++) { const f = i / n; pts[i].px = pts[i].x - (dx / d) * 40 * f; pts[i].py = pts[i].y - (dy / d) * 40 * f; }
    audio.sfx("whoosh", 0.1);
    if (g.lvl("weapon") >= 7) g.later(0.1, () => { if (!e.dead) { g.aoe(e.x, e.y, 40, 30 * g.dmgMult(), { small: true, noText: true, pal: "void" }); } });
  },
  castActive(g) {
    const k = K(g), L = g.lvl("active"), n = L >= 3 ? 4 : 3, list = strongest(g, n); if (!list.length) { g.p.activeCd = 0.5; return; } let mx = 0, my = 0; for (const e of list) { mx += e.x; my += e.y; } mx /= list.length; my /= list.length;
    k.bind = { list, t: 0, mx, my }; audio.sfx("lock");
  },
  castUlt(g) {
    const L = g.lvl("ult"), kn = 1 + (L - 1) * 0.1, dm = g.dmgMult(), p = g.p; p.formT = 5.4; const N = Math.round(14 * (L >= 3 ? 1.4 : 1));
    const whips: { x0: number; y0: number; x1: number; y1: number; t0: number; hit: boolean; c: number }[] = []; for (let i = 0; i < N; i++) { const side = i % 4, x0 = side === 0 ? -20 : side === 1 ? W + 20 : rand(0, W), y0 = side < 2 ? rand(100, 500) : side === 2 ? -20 : H + 20; whips.push({ x0, y0, x1: rand(50, W - 50), y1: rand(120, 620), t0: 0.45 + i * (1.8 / N), hit: false, c: rand(-1, 1) }); }
    const swept = new Set<number>(); let fin = false;
    ultScript(g, {
      dur: 5.4, color: "#8f5bff", shipIdx: 6, bgSpin: -0.05,
      update: (dt, t) => {
        for (const w of whips) if (!w.hit && t >= w.t0 + 0.22) { w.hit = true; const e = g.nearest(w.x1, w.y1, 140); const x = e ? e.x : w.x1, y = e ? e.y : w.y1; w.x1 = x; w.y1 = y; g.aoe(x, y, 62, 75 * dm * kn, { small: true, noText: true, pal: "void" }); g.fx.burst(x, y, 8, "#e6d8ff", 100, 400, 0.3, 2); g.shake(4, 0.1); audio.sfx("lightning", 0.06); g.clearBullets(x, y, 70, "coin"); }
        if (t >= 2.7 && t < 3.9) { const u = (t - 2.7) / 1.2, ang = -1.35 + u * 2.7, px = W / 2, py = -90, ex = px + Math.sin(ang) * 1200, ey = py + Math.cos(ang) * 1200; for (const e of alive(g)) if (!swept.has(e.uid) && segDist(e.x, e.y, px, py, ex, ey) < 60 + e.r) { swept.add(e.uid); g.damageEnemy(e, 170 * dm * kn * (e.boss ? 0.7 : 1), { noText: true }); } g.clearBullets(0, 0, 0, "coin", undefined, undefined); for (const b of g.eb.items) if (b.alive && segDist(b.x, b.y, px, py, ex, ey) < 60) b.alive = false; if (Math.random() < 0.5) g.shake(5, 0.1); }
        if (t >= 4.4 && !fin) { fin = true; g.flash("#ffffff", 1); g.shake(22, 0.9); audio.sfx("boom_l"); hitAll(g, 380 * dm * kn * (L >= 7 ? 2 : 1)); g.clearBullets(0, 0, 9999, "coin"); }
      },
      scene: (ctx, t) => {
        ctx.save(); ctx.lineCap = "round"; for (const w of whips) { const u = (t - w.t0) / 0.28; if (u < 0 || u > 2.2) continue; const e = Math.min(1, u), cx = (w.x0 + w.x1) / 2 + w.c * 120, cy = (w.y0 + w.y1) / 2 - 60, ex = w.x0 + (w.x1 - w.x0) * e, ey = w.y0 + (w.y1 - w.y0) * e, a = u > 1 ? Math.max(0, 1 - (u - 1) / 1.2) : 1; ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = a; ctx.strokeStyle = "#8f5bff"; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(w.x0, w.y0); ctx.quadraticCurveTo(cx, cy, ex, ey); ctx.stroke(); ctx.strokeStyle = "#f4ecff"; ctx.lineWidth = 2; ctx.stroke(); if (u > 0.9 && u < 1.4) glowAt(ctx, w.x1, w.y1, 60 * (1.4 - u) + 10, "#ffffff", 1); } ctx.restore();
        if (t >= 2.6 && t < 4) { const u = clamp((t - 2.7) / 1.2, 0, 1), ang = -1.35 + u * 2.7, px = W / 2, py = -90; beamLine(ctx, px, py, px + Math.sin(ang) * 1200, py + Math.cos(ang) * 1200, 40, "#8f5bff", Math.min(1, (t - 2.6) * 4) * (t > 3.8 ? Math.max(0, (4 - t) / 0.2) : 1)); }
        if (t >= 4.4 && t < 5.2) { const u = (t - 4.4) / 0.8; ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4 * (1 - u); ctx.globalAlpha = 1 - u; for (let i = 0; i < 22; i++) { const a = (i / 22) * TAU + 0.2; ctx.beginPath(); ctx.moveTo(W / 2, H * 0.45); let x = W / 2, y = H * 0.45; for (let s = 0; s < 9; s++) { x += Math.cos(a + Math.sin(i * 3 + s) * 0.3) * 80 * (0.4 + u); y += Math.sin(a + Math.sin(i * 3 + s) * 0.3) * 80 * (0.4 + u); ctx.lineTo(x, y); } ctx.stroke(); } ctx.restore(); }
      },
    });
  },
  drawOver(g, ctx) {
    const k = K(g), pts = k.pts, n = pts.length; ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
    for (let pass = 0; pass < 2; pass++) { for (let i = 1; i < n; i++) { const f = i / n, w = (pass ? 1.4 : 5.6) * (1 - f * 0.65) + (pass ? 0 : 1); ctx.strokeStyle = pass ? "#e8dcff" : "#8f5bff"; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(pts[i - 1].x, pts[i - 1].y); ctx.lineTo(pts[i].x, pts[i].y); ctx.stroke(); } }
    const tp = pts[n - 1]; if (k.tipV > 900 || k.flash > 0) { ctx.globalCompositeOperation = "lighter"; glowAt(ctx, tp.x, tp.y, 26 + k.flash * 120, "#d8c8ff", 0.9); }
    const b = k.bind; if (b) { ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "rgba(190,150,255,.85)"; ctx.lineWidth = 2; for (const e of b.list) { if (e.dead) continue; ctx.beginPath(); ctx.moveTo(g.p.x, g.p.y - 34); ctx.quadraticCurveTo((g.p.x + e.x) / 2 + 20, (g.p.y + e.y) / 2, e.x, e.y); ctx.stroke(); ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.arc(e.x, e.y, e.r + 6, 0, TAU); ctx.stroke(); ctx.strokeStyle = "rgba(190,150,255,.85)"; } }
    ctx.restore();
  },
  preview(t) { return { mode: 0, aux: 0 * t }; },
};

========== 來源：003/src/game/skills/parasol.ts ==========
// 紙傘：骨扇收束齊射／受擊自動撐傘擋彈反射／開傘反射正面彈幕／百傘繚亂
import { W, H, TAU, rand, clamp } from "../constants";
import type { Game } from "../engine/Game";
import type { ShipKit } from "./common";
import { ultScript, hitAll, alive, glowAt } from "./common";
import { EXT_BASE_RW } from "../render/pbStylesExt";
import { audio } from "../audio";
const S_RIB = EXT_BASE_RW + 14, S_DROP = EXT_BASE_RW + 15, S_PETAL = EXT_BASE_RW + 16;
interface K { guard: { t: number; dur: number } | null; pcd: number; flash: number; aux: number; mode: number; dodge: (g: Game) => boolean }
/** 把圓內敵彈轉為我方追蹤雨滴 */
function reflect(g: Game, x: number, y: number, R: number, arcFront: boolean, homing: number): number {
  const dm = g.dmgMult(); let n = 0;
  for (const b of g.eb.items) {
    if (!b.alive) continue; const dx = b.x - x, dy = b.y - y; if (dx * dx + dy * dy > R * R) continue; if (arcFront && dy > 14) continue;
    b.alive = false; n++; if (n % 2 === 0 || n < 14) g.spawnPB(b.x, b.y, -Math.PI / 2 + rand(-0.9, 0.9), 520, S_DROP, 7 * dm, { homing, life: 1.6, src: 2, pierce: 1 });
    if (n < 30) g.fx.glowP(b.x, b.y, 0, 0, 0.2, 9, "#ffc0d8", 2);
  }
  return n;
}
export const parasol: ShipKit = {
  init(g) {
    const k = { guard: null, pcd: 0, flash: 0, aux: 0.35, mode: 0 } as unknown as K;
    k.dodge = (gm: Game) => {
      if (k.pcd > 0) return false; const pl = gm.lvl("passive"); k.pcd = pl >= 5 ? 7 : pl >= 3 ? 10 : 14; const R = pl >= 3 ? 190 : 150; k.flash = 0.6; reflect(gm, gm.p.x, gm.p.y, R, false, pl >= 7 ? 3 : 1.2);
      gm.fx.ring(gm.p.x, gm.p.y, 20, R, 0.5, "#ffb8d0", 4); gm.shake(5, 0.2); audio.sfx("gear"); gm.p.inv = Math.max(gm.p.inv, 0.8); gm.toast("撐傘！", "#ffc0d8"); return true;
    };
    g.p.k = k as unknown as Record<string, unknown>;
  },
  update(g, dt) {
    const k = g.p.k as unknown as K, L = g.lvl("active"), p = g.p; k.pcd = Math.max(0, k.pcd - dt); k.flash = Math.max(0, k.flash - dt); const gd = k.guard; k.aux = clamp(0.3 + (gd ? 0.7 : 0) + k.flash * 0.5, 0, 1);
    if (!gd) return; gd.t += dt; const R = 46 + (L >= 3 ? 20 : 0) + 12; reflect(g, p.x, p.y - 14, R, L < 7, L >= 5 ? 2.2 : 1.2); if (gd.t >= gd.dur) k.guard = null;
  },
  fire(g) {
    const p = g.p, L = g.lvl("weapon"), dm = g.dmgMult(), n = 5 + (L >= 3 ? 2 : 0); p.fireT += 0.3 / p.s.rate; const fx = p.x, fy = p.y - 400;
    for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 + (i - (n - 1) / 2) * 0.17, b = g.spawnPB(p.x, p.y - 34, a0, 800, S_RIB, 9 * dm, { kind: 20, pierce: p.s.pierce + (L >= 5 ? 2 : 0), life: 1.2, src: 0 }); b.a = fx; b.b = fy; }
    audio.sfx("shoot0", 0.07);
  },
  updateBullet(g, b, dt) {
    if (b.style !== S_RIB) { b.x += b.vx * dt; b.y += b.vy * dt; return; } if (b.t > 0.16 && b.c === 0) { b.c = 1; const sp = Math.hypot(b.vx, b.vy), a = Math.atan2(b.b - b.y, b.a - b.x); b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.rot = a + Math.PI / 2; }
    b.x += b.vx * dt; b.y += b.vy * dt;
  },
  onHit(g, b, e) { if (b.style === S_RIB && g.lvl("weapon") >= 7 && Math.random() < 0.5) for (let i = 0; i < 2; i++) g.spawnPB(b.x, b.y, rand(TAU), 420, S_PETAL, 6 * g.dmgMult(), { homing: 2.4, life: 1, src: 2, hits: [e.uid] }); },
  castActive(g) { const k = g.p.k as unknown as K; k.guard = { t: 0, dur: 4 + (g.lvl("active") >= 3 ? 1 : 0) }; audio.sfx("gear"); g.fx.ring(g.p.x, g.p.y, 10, 90, 0.4, "#ffb8d0", 3); },
  castUlt(g) {
    const L = g.lvl("ult"), kn = 1 + (L - 1) * 0.1, dm = g.dmgMult(), p = g.p; p.formT = 5.6; const N = Math.round(12 * (L >= 3 ? 1.3 : 1)); const us: { x: number; y: number; t0: number; ph: number; cd: number }[] = []; for (let i = 0; i < N; i++) us.push({ x: 50 + ((i % 6) + 0.5) * ((W - 100) / 6) + rand(-20, 20), y: 150 + Math.floor(i / 6) * 220 + rand(-40, 40) + (i % 2) * 60, t0: 0.4 + i * 0.1, ph: rand(TAU), cd: 0 }); let fin = false;
    ultScript(g, {
      dur: 5.6, color: "#ff9ec1", shipIdx: 7, bgSpin: 0.08,
      update: (dt, t) => {
        for (const u of us) { if (t < u.t0 + 0.3) continue; u.cd -= dt; u.ph += dt * 1.6; if (u.cd <= 0 && t < 4.2) { u.cd = 0.16; for (let i = 0; i < 6; i++) g.spawnPB(u.x, u.y, u.ph + (i * TAU) / 6, 540, S_RIB, 10 * dm * kn, { life: 1.4, src: 2, pierce: 1 }); } reflect(g, u.x, u.y, 74, false, L >= 5 ? 2.4 : 0.8); }
        if (t >= 4.4 && !fin) { fin = true; g.flash("#ffe0ea", 1); g.shake(20, 0.8); audio.sfx("boom_l"); hitAll(g, 360 * dm * kn); g.clearBullets(0, 0, 9999, "coin"); if (L >= 7) for (const e of alive(g)) g.aoe(e.x, e.y, 60, 120 * dm, { small: true, noText: true, pal: "red" }); for (let i = 0; i < 40; i++) g.fx.glowP(rand(0, W), rand(0, H), rand(-60, 60), rand(40, 160), 1.1, 9, "#ffb8d0", 3); }
      },
      scene: (ctx, t) => {
        for (const u of us) { const b = clamp((t - u.t0) / 0.35, 0, 1), R = 70 * (b * b * (3 - 2 * b)) * (t > 4.4 ? Math.max(0, 1 - (t - 4.4) / 0.4) : 1); if (R < 2) continue; ctx.save(); ctx.translate(u.x, u.y); ctx.rotate(u.ph * 0.5); for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "#ff9ec1" : "#fff1d6"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, (i / 12) * TAU, ((i + 1) / 12) * TAU); ctx.fill(); } ctx.strokeStyle = "#8a1030"; ctx.lineWidth = 1; for (let i = 0; i < 12; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos((i / 12) * TAU) * R, Math.sin((i / 12) * TAU) * R); ctx.stroke(); } ctx.strokeStyle = "#c8102e"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke(); ctx.restore(); glowAt(ctx, u.x, u.y, R * 1.4, "#ff9ec1", 0.4); }
        if (t >= 4.0 && t < 5.2) { const u = clamp((t - 4.0) / 0.4, 0, 1), R = 760 * u * (t > 4.6 ? Math.max(0, 1 - (t - 4.6) / 0.6) : 1); ctx.save(); ctx.translate(W / 2, H * 0.1); for (let i = 0; i < 16; i++) { ctx.fillStyle = i % 2 ? "rgba(255,158,193,.78)" : "rgba(255,241,214,.78)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, (i / 16) * TAU, ((i + 1) / 16) * TAU); ctx.fill(); } ctx.restore(); }
        ctx.save(); ctx.globalCompositeOperation = "lighter"; for (let i = 0; i < 26; i++) { const f = (t * 0.25 + i / 26) % 1; ctx.globalAlpha = Math.sin(f * 3.14) * 0.8; ctx.fillStyle = "#ffc0d8"; ctx.beginPath(); ctx.ellipse(Math.sin(i * 7.1 + f * 5) * 260 + W / 2, f * (H + 60) - 30, 4, 2.4, f * 8 + i, 0, TAU); ctx.fill(); } ctx.restore();
      },
    });
  },
  drawUnder(g, ctx) {
    const k = g.p.k as unknown as K, p = g.p; if (!k.guard && k.flash <= 0) return; const gd = k.guard, L = g.lvl("active"), R = (46 + (L >= 3 ? 20 : 0)) * (gd ? Math.min(1, gd.t * 6) : 1) + (k.flash > 0 ? 80 * (1 - k.flash / 0.6) : 0);
    ctx.save(); ctx.translate(p.x, p.y - 14); ctx.globalAlpha = gd ? 0.75 : k.flash * 1.2; const full = L >= 7 || !gd; if (full) { for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? "rgba(255,158,193,.6)" : "rgba(255,241,214,.6)"; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, (i / 12) * TAU + g.t * 3, ((i + 1) / 12) * TAU + g.t * 3); ctx.fill(); } } else { ctx.fillStyle = "rgba(255,158,193,.45)"; ctx.beginPath(); ctx.arc(0, 0, R + 12, Math.PI, 0); ctx.fill(); ctx.strokeStyle = "#fff1d6"; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.restore();
  },
  preview(t) { return { mode: 0, aux: 0.5 + 0.5 * Math.sin(t * 1.4) }; },
};
void H;

========== 來源：003/src/game/skills/snipper.ts ==========
// 裁影：機首剪刀開合射出交叉刃（交點加倍傷害）／擦彈裁剪／斷線裁切（裂縫斷彈）／天裁・千針萬線
import { W, H, TAU, rand } from "../constants";
import type { Game } from "../engine/Game";
import type { ShipKit } from "./common";
import { ultScript, beamLine, hitAll, alive, strongest, segDist, drawBars } from "./common";
import { EXT_BASE_RW } from "../render/pbStylesExt";
import { audio } from "../audio";
const S_BLADE = EXT_BASE_RW + 2, S_NEEDLE = EXT_BASE_RW + 3;
interface Seam { y: number; t: number; dur: number; w: number; vx: number }
interface K { since: number; interval: number; graze: number; tailored: boolean; seam: Seam | null; aux: number; mode: number }
const K = (g: Game) => g.p.k as K;
function snip(g: Game, spread: number, D: number, mul: number, big: boolean) {
  const p = g.p, k = K(g), L = g.lvl("weapon"), dm = g.dmgMult(), fx = p.x, fy = p.y - 32 - D, spd = 900;
  for (const s of [-1, 1]) { const x0 = p.x + s * spread, a = Math.atan2(fy - (p.y - 30), fx - x0); g.spawnPB(x0, p.y - 30, a, spd, S_BLADE, 11 * dm * mul, { pierce: 1 + p.s.pierce + (big ? 3 : 0), life: 1.1, scale: big ? 1.5 : 1, r: big ? 18 : 12 }); }
  g.later(D / spd, () => {
    const R = (34 + L * 3) * (big ? 1.5 : 1); const n = g.aoe(fx, fy, R, 22 * dm * mul, { small: true, noText: true, pal: "white" }); g.fx.spark(fx, fy, 0, 0, 0.15, 2, "#ffffff"); g.fx.burst(fx, fy, 8, "#ff7ac0", 120, 420, 0.3, 2.2);
    if (L >= 7 || big) { for (const e of alive(g)) if ((e.x - fx) ** 2 + (e.y - fy) ** 2 < (R + e.r) ** 2) e.mark = 3; if (big && L >= 7) g.clearBullets(fx, fy, 80, "score"); }
    void n;
  });
  k.since = 0;
}
export const snipper: ShipKit = {
  init(g) { g.p.k = { since: 0.4, interval: 0.4, graze: 0, tailored: false, seam: null, aux: 0.5, mode: 0 } as K; },
  update(g, dt) {
    const k = K(g), s = k.seam; k.since += dt; k.aux = Math.min(1, k.since / (k.interval * 0.85)); if (!s) return;
    s.t += dt; if (s.t < 0.3) return; g.clearBullets(W / 2, s.y, 0, "none", undefined, undefined, s.y, 20);
    if (Math.random() < 0.6) g.fx.spark(rand(W * 0.5 - s.w / 2, W * 0.5 + s.w / 2), s.y, rand(-60, 60), rand(-90, 90), 0.3, 1.6, "#ff7ac0");
    if (s.t >= s.dur) k.seam = null;
  },
  fire(g) {
    const p = g.p, k = K(g), L = g.lvl("weapon"); k.interval = 0.4 / p.s.rate; p.fireT += k.interval; const big = k.tailored; if (big) k.tailored = false;
    snip(g, 20, 240, big ? 1.5 : 1, big); if (L >= 5) snip(g, 38, 330, 0.7, false); audio.sfx("shoot3", 0.07);
    if (L >= 7) for (const a of [-0.5, 0.5]) g.spawnPB(p.x, p.y - 30, -Math.PI / 2 + a, 780, S_NEEDLE, 6 * g.dmgMult(), { pierce: 1, homing: 1.6, life: 1.2, src: 2 });
  },
  onGraze(g) { const k = K(g), need = g.lvl("passive") >= 5 ? 6 : 8; k.graze++; if (k.graze >= need && !k.tailored) { k.graze = 0; k.tailored = true; g.fx.ring(g.p.x, g.p.y, 8, 50, 0.3, "#ff7ac0", 2); g.fx.text(g.p.x, g.p.y - 36, "裁剪強化", "#ff9ad0", 13); } },
  castActive(g) {
    const k = K(g), L = g.lvl("active"), dm = g.dmgMult(), t = strongest(g, 1)[0], y = Math.max(120, Math.min(H - 220, t ? t.y : g.p.y - 260));
    k.seam = { y, t: 0, dur: 4 + (L >= 3 ? 2 : 0), w: W * (L >= 5 ? 1 : 0.8), vx: t ? t.x : W / 2 }; audio.sfx("whoosh");
    g.later(0.3, () => {
      g.shake(8, 0.3); g.flash("#ffd0ea", 0.35); for (const e of alive(g)) if (Math.abs(e.y - y) < 46 + e.r) g.damageEnemy(e, 95 * dm * (e.boss ? 0.7 : 1), { noText: true });
      g.clearBullets(W / 2, y, 0, "score", undefined, undefined, y, 70);
      if (L >= 7) { const x = k.seam ? k.seam.vx : W / 2; for (const e of alive(g)) if (Math.abs(e.x - x) < 40 + e.r) g.damageEnemy(e, 95 * dm * (e.boss ? 0.7 : 1), { noText: true }); g.clearBullets(x, 0, 0, "score", x, 80); }
    });
  },
  castUlt(g) {
    const L = g.lvl("ult"), kn = 1 + (L - 1) * 0.1, dm = g.dmgMult(), p = g.p; p.formT = 5.6; const cuts: { x: number; y: number; a: number; t: number }[] = []; let opened = false, nextCut = 1.3, nCuts = 0, pulled = false, fin = false;
    const maxC = 4 + (L >= 3 ? 2 : 0) + (L >= 5 ? 1 : 0);
    ultScript(g, {
      dur: 5.6, color: "#ff3d9a", shipIdx: 1, bgSpin: 0.03,
      update: (dt, t) => {
        if (t >= 0.5 && !opened) { opened = true; g.flash("#ffffff", 0.8); g.shake(14, 0.5); audio.sfx("boom_l"); for (const e of alive(g)) if (Math.abs(e.x - W / 2) < 80 + e.r) g.damageEnemy(e, 190 * dm * kn * (e.boss ? 0.7 : 1), { noText: true }); g.clearBullets(W / 2, 0, 0, "coin", W / 2, 160); }
        if (t >= nextCut && nCuts < maxC) { nextCut += 0.38; nCuts++; const c = { x: rand(80, W - 80), y: rand(120, H - 160), a: rand(0, Math.PI), t }; cuts.push(c); audio.sfx("lightning", 0.1); g.shake(6, 0.2);
          for (const e of alive(g)) if (segDist(e.x, e.y, c.x - Math.cos(c.a) * 900, c.y - Math.sin(c.a) * 900, c.x + Math.cos(c.a) * 900, c.y + Math.sin(c.a) * 900) < 34 + e.r) g.damageEnemy(e, 150 * dm * kn * (e.boss ? 0.7 : 1), { noText: true, x: e.x, y: e.y });
          g.clearBullets(c.x, c.y, 140, "coin"); }
        if (t >= 4 && t < 4.9) { pulled = true; for (const e of alive(g)) { e.x += (W / 2 - e.x) * dt * 2.6; e.y += (H * 0.4 - e.y) * dt * 2.6; } }
        if (t >= 4.95 && !fin) { fin = true; g.flash("#ffffff", 1); g.shake(18, 0.7); audio.sfx("boom_l"); hitAll(g, 420 * dm * kn * (L >= 7 ? 1.8 : 1)); g.clearBullets(0, 0, 9999, "coin"); g.fx.ring(W / 2, H * 0.4, 10, 520, 0.6, "#ff7ac0", 6); }
        void pulled;
      },
      scene: (ctx, t) => {
        const o = Math.min(1, Math.max(0, (t - 0.1) / 0.4)) * (t < 1.4 ? 1 : Math.max(0, 1 - (t - 1.4) / 1.6));
        ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = o; const gap = 30 + Math.max(0, t - 0.5) * 90; const g1 = ctx.createLinearGradient(W / 2 - gap, 0, W / 2 + gap, 0); g1.addColorStop(0, "#ff3d9a00"); g1.addColorStop(0.5, "#ffffff"); g1.addColorStop(1, "#ff3d9a00"); ctx.fillStyle = g1; ctx.fillRect(W / 2 - gap, 0, gap * 2, H); ctx.restore();
        for (const c of cuts) { const u = (t - c.t) / 0.5; if (u > 1) continue; beamLine(ctx, c.x - Math.cos(c.a) * 900, c.y - Math.sin(c.a) * 900, c.x + Math.cos(c.a) * 900, c.y + Math.sin(c.a) * 900, 26 * (1 - u), "#ff3d9a", 1 - u); }
        if (t >= 4 && t < 5) { ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "#ffd0ea"; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.8; for (const e of alive(g)) { ctx.beginPath(); ctx.moveTo(W / 2, H * 0.4); ctx.lineTo(e.x, e.y); ctx.stroke(); } ctx.restore(); }
        if (t >= 0.2 && t < 0.9) { const u = (t - 0.2) / 0.7, d = (1 - u) * 500; ctx.save(); ctx.fillStyle = "#f4e9ff"; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(W / 2 + s * 6, -60 - d * s * 0 - (1 - u) * 400); ctx.lineTo(W / 2 + s * 90, 120 + (1 - u) * 60); ctx.lineTo(W / 2 + s * 6, 300); ctx.fill(); } ctx.restore(); }
      },
    });
  },
  drawUnder(g, ctx) {
    const s = K(g).seam; if (!s) return; const u = Math.min(1, s.t / 0.3), a = Math.min(1, (s.dur - s.t) * 2);
    ctx.save(); ctx.globalAlpha = a; const x0 = W / 2 - s.w / 2, x1 = W / 2 + s.w / 2;
    ctx.fillStyle = "#16061a"; ctx.fillRect(x0 + (1 - u) * s.w / 2, s.y - 4, s.w * u, 8); ctx.globalCompositeOperation = "lighter"; ctx.strokeStyle = "#ff7ac0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + (1 - u) * s.w / 2, s.y); ctx.lineTo(x1 - (1 - u) * s.w / 2, s.y); ctx.stroke(); ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 0.8; ctx.stroke();
    if (u < 1) for (const sd of [-1, 1]) { const bx = W / 2 + sd * (s.w / 2) * (1 - u); ctx.fillStyle = "#f4e9ff"; ctx.beginPath(); ctx.moveTo(bx, s.y - 10); ctx.lineTo(bx - sd * 60, s.y - 3); ctx.lineTo(bx, s.y + 2); ctx.fill(); } ctx.restore();
  },
  drawOver(g, ctx) { const k = K(g); drawBars(ctx, g.p.x, g.p.y + 34, 34, [{ v: k.graze / (g.lvl("passive") >= 5 ? 6 : 8), c: k.tailored ? "#ffffff" : "#ff7ac0" }]); },
  preview(t) { return { mode: 0, aux: 0.5 + 0.5 * Math.cos(t * 4) }; },
};
void TAU;

========== 來源：003/src/game/skills/splash.ts ==========
// 潑潮：高壓水槍（擊退＋濕潤）／靜止蓄壓／水球炸彈→推進浪牆／怒濤天降
import { W, H, TAU, rand, clamp } from "../constants";
import type { Game } from "../engine/Game";
import type { PBullet } from "../entities";
import type { ShipKit } from "./common";
import { ultScript, hitAll, alive, strongest, drawBars } from "./common";
import { EXT_BASE_RW } from "../render/pbStylesExt";
import { audio } from "../audio";
const S_JET = EXT_BASE_RW + 5, S_BALLOON = EXT_BASE_RW + 6, S_DROP = EXT_BASE_RW + 7;
interface Wave { x: number; y: number; w: number; tick: number; trail: boolean }
interface K { press: number; burstT: number; beamT: number; wave: Wave | null; flood: number; aux: number; mode: number; moveT: number }
const K = (g: Game) => g.p.k as K;
export const splash: ShipKit = {
  init(g) { g.p.k = { press: 0.3, burstT: 0, beamT: 0, wave: null, flood: 0, aux: 0.3, mode: 0, moveT: 0 } as K; },
  update(g, dt) {
    const k = K(g), p = g.p, pl = g.lvl("passive"), dm = g.dmgMult(), still = Math.abs(p.vx) + Math.abs(p.vy) < 45;
    if (still) k.press += dt * (0.2 + (pl >= 3 ? 0.12 : 0)); else k.press -= dt * (pl >= 5 ? 0.05 : 0.3); k.press = clamp(k.press, 0, 1); k.aux = k.press; k.burstT -= dt; k.beamT -= dt;
    const w = k.wave;
    if (w) {
      w.y -= 360 * dt; w.tick -= dt; const hw = w.w / 2;
      for (const e of g.en.items) { if (e.dead || Math.abs(e.x - w.x) > hw + e.r || Math.abs(e.y - w.y) > 46 + e.r) continue; if (!e.boss) e.y -= 300 * dt; e.mark = Math.max(e.mark, 2); e.slow = Math.max(e.slow, 0.3); if (w.tick <= 0) g.damageEnemy(e, 24 * dm, { noText: true, noHitFx: true }); }
      for (const b of g.eb.items) if (b.alive && Math.abs(b.x - w.x) < hw && Math.abs(b.y - w.y) < 44) { b.y -= 520 * dt; b.slow = Math.min(b.slow, 0.5); }
      if (w.tick <= 0) w.tick = 0.1; if (Math.random() < 0.7) g.fx.spark(w.x + rand(-hw, hw), w.y, rand(-80, 80), rand(60, 200), 0.35, 2, "#bfeaff");
      if (w.y < -60) { if (g.lvl("active") >= 7) k.flood = 3; k.wave = null; }
    }
    if (k.flood > 0) { k.flood -= dt; for (const e of g.en.items) if (!e.dead) e.slow = Math.max(e.slow, 0.35); }
  },
  fire(g) {
    const p = g.p, k = K(g), L = g.lvl("weapon"), pl = g.lvl("passive"), dm = g.dmgMult(); p.fireT += 0.075 / p.s.rate;
    const noz = L >= 3 ? [-12, 12] : [0], burst = k.press >= 0.5 && k.burstT <= 0, big = L >= 7 && k.press >= 1 && k.beamT <= 0;
    for (const nx of noz) { const o: Partial<PBullet> = { src: 0, life: 1.1, homing: L >= 5 ? 1.2 : 0, explode: L >= 5 ? Math.max(p.s.explode, 18) : p.s.explode }; g.spawnPB(p.x + nx, p.y - 40, -Math.PI / 2 + rand(-0.035, 0.035), 840, S_JET, 7 * dm, o); }
    if (burst) { k.burstT = 1.2; k.press -= 0.45; for (const a of [-0.13, 0, 0.13]) g.spawnPB(p.x, p.y - 40, -Math.PI / 2 + a, 900, S_JET, 16 * dm, { pierce: 2, scale: 1.5, life: 1.2, explode: pl >= 7 ? 40 : p.s.explode, src: 0 }); audio.sfx("shoot4", 0.1); }
    if (big) { k.beamT = 0.35; g.spawnPB(p.x, p.y - 40, -Math.PI / 2, 1100, S_JET, 26 * dm, { pierce: 6, scale: 2.6, r: 16, life: 1, src: 0 }); }
    audio.sfx("shoot5", 0.07);
  },
  onHit(g, b, e) {
    if (b.style !== S_JET && b.style !== S_DROP) return; if (!e.boss) e.y -= 5; e.mark = Math.max(e.mark, 2.4);
    if (Math.random() < 0.3) g.fx.glowP(b.x, b.y, rand(-80, 80), rand(-120, -20), 0.3, 6, "#bfeaff", 1);
  },
  castActive(g) {
    const t = strongest(g, 1)[0], tx = t ? t.x : g.p.x, ty = t ? t.y : g.p.y - 280, L = g.lvl("active"), dm = g.dmgMult();
    const b = g.spawnPB(g.p.x, g.p.y - 30, Math.atan2(ty - g.p.y, tx - g.p.x), 640, S_BALLOON, 0, { kind: 20, life: 2, src: 2, pierce: 99, r: 8 }); b.a = tx; b.b = ty; b.c = 0; audio.sfx("whoosh");
    void dm; void L;
  },
  updateBullet(g, b, dt) {
    if (b.style !== S_BALLOON) { b.x += b.vx * dt; b.y += b.vy * dt; return; }
    const dx = b.a - b.x, dy = b.b - b.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, 640 * dt); b.x += (dx / d) * st; b.y += (dy / d) * st; b.rot += dt * 6;
    if (d < 16) {
      b.alive = false; const L = g.lvl("active"), dm = g.dmgMult(); g.aoe(b.x, b.y, 62, 70 * dm, { pal: "ice" }); g.shake(5, 0.2); audio.sfx("boom_m"); g.fx.burst(b.x, b.y, 18, "#bfeaff", 100, 420, 0.5, 2.4);
      K(g).wave = { x: b.x, y: b.y, w: L >= 5 ? W : L >= 3 ? W * 0.8 : W * 0.55, tick: 0, trail: L >= 7 };
    }
  },
  castUlt(g) {
    const L = g.lvl("ult"), kn = 1 + (L - 1) * 0.1, dm = g.dmgMult(), p = g.p; p.formT = 5.6;
    const spouts: { x: number; t0: number; hit: boolean }[] = []; const ns = Math.round(6 * (L >= 3 ? 1.5 : 1)); for (let i = 0; i < ns; i++) spouts.push({ x: 40 + ((i + 0.5) / ns) * (W - 80) + rand(-20, 20), t0: 0.5 + i * 0.16, hit: false });
    let tsu = false, tsuY = H + 80, tick = 0, rainT = 0;
    ultScript(g, {
      dur: 5.6, color: "#36c8ff", shipIdx: 3, bgSpin: -0.04,
      update: (dt, t) => {
        for (const s of spouts) if (!s.hit && t >= s.t0 + 0.35) { s.hit = true; audio.sfx("boom_s", 0.05); g.shake(4, 0.15); for (const e of alive(g)) if (Math.abs(e.x - s.x) < 48 + e.r) { g.damageEnemy(e, 100 * dm * kn * (e.boss ? 0.7 : 1), { noText: true }); if (!e.boss) e.y -= 90; e.mark = 3; } g.clearBullets(s.x, 0, 0, "coin", s.x, 90); }
        if (t >= 2.1 && !tsu) { tsu = true; g.flash("#bfeaff", 0.7); g.shake(16, 1.4); audio.sfx("boom_l"); }
        if (tsu && tsuY > -120) { const oy = tsuY; tsuY -= dt * 780; for (const e of alive(g)) if (e.y <= oy + 20 && e.y > tsuY - 20) { g.damageEnemy(e, (270 * dm * kn) * (e.boss ? 0.6 : 1), { noText: true }); if (!e.boss) e.y -= 200; e.mark = 4; } g.clearBullets(W / 2, tsuY, 0, "coin", undefined, undefined, tsuY, 70); if (Math.random() < 0.8) g.fx.burst(rand(0, W), tsuY, 3, "#dff6ff", 80, 300, 0.4, 2); }
        if (t >= 3.5) { tick -= dt; rainT -= dt; if (tick <= 0) { tick = 0.3; hitAll(g, 20 * dm * kn * (L >= 7 ? 1.6 : 1)); } if (rainT <= 0) { rainT = 0.12; g.fx.ring(rand(40, W - 40), rand(100, H - 100), 3, 32, 0.4, "#bfeaff", 2); } for (const e of alive(g)) e.slow = Math.max(e.slow, 0.4); if (t > 3.6 && t < 3.62) g.tint("#36c8ff", 0.25, 2); }
      },
      scene: (ctx, t) => {
        ctx.save(); ctx.globalCompositeOperation = "lighter"; for (const s of spouts) { const u = t - s.t0; if (u < 0 || u > 1.6) continue; const ww = u < 0.35 ? 4 : 70 * Math.min(1, (u - 0.35) / 0.15) * Math.max(0, 1 - (u - 0.6) / 1); const gr = ctx.createLinearGradient(s.x - ww, 0, s.x + ww, 0); gr.addColorStop(0, "#36c8ff00"); gr.addColorStop(0.5, u < 0.35 ? "#ffffff88" : "#dff6ff"); gr.addColorStop(1, "#36c8ff00"); ctx.fillStyle = gr; ctx.fillRect(s.x - ww, 0, ww * 2, H); }
        if (tsu && tsuY > -160) { const y = tsuY; ctx.fillStyle = "#1a8fd0"; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.moveTo(0, H + 40); ctx.lineTo(0, y + 40); for (let x = 0; x <= W; x += 12) ctx.lineTo(x, y + Math.sin(x * 0.04 + t * 8) * 18 + Math.sin(x * 0.11 - t * 5) * 8); ctx.lineTo(W, H + 40); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 5; ctx.beginPath(); for (let x = 0; x <= W; x += 12) { const yy = y + Math.sin(x * 0.04 + t * 8) * 18 + Math.sin(x * 0.11 - t * 5) * 8; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
        if (t >= 3.5) { ctx.strokeStyle = "rgba(220,245,255,.5)"; ctx.lineWidth = 1.4; for (let i = 0; i < 60; i++) { const x = (i * 97 + t * 40) % W, y = ((i * 53 + t * 900) % (H + 100)) - 50; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 34); ctx.stroke(); } }
        ctx.restore();
      },
    });
    void TAU;
  },
  drawUnder(g, ctx) {
    const w = K(g).wave; if (!w) return; ctx.save(); ctx.globalAlpha = 0.85; const y = w.y, hw = w.w / 2;
    const gr = ctx.createLinearGradient(0, y - 20, 0, y + 90); gr.addColorStop(0, "#dff6ff"); gr.addColorStop(0.2, "#36c8ff99"); gr.addColorStop(1, "#36c8ff00"); ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(w.x - hw, y + 90); ctx.lineTo(w.x - hw, y);
    for (let x = -hw; x <= hw; x += 10) ctx.lineTo(w.x + x, y + Math.sin(x * 0.07 + g.t * 14) * 9); ctx.lineTo(w.x + hw, y + 90); ctx.fill();
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.beginPath(); for (let x = -hw; x <= hw; x += 10) { const yy = y + Math.sin(x * 0.07 + g.t * 14) * 9; x === -hw ? ctx.moveTo(w.x + x, yy) : ctx.lineTo(w.x + x, yy); } ctx.stroke(); ctx.restore();
  },
  drawOver(g, ctx) { const k = K(g); drawBars(ctx, g.p.x, g.p.y + 34, 34, [{ v: k.press, c: k.press >= 0.5 ? "#dff6ff" : "#36c8ff" }]); },
  preview(t) { return { mode: 0, aux: 0.5 + 0.5 * Math.sin(t * 1.5) }; },
};

========== 來源：004/src/game/data/ships.ts ==========
// 機體資料：12 架原創戰機。每項技能皆有 Lv3/5/7 三段進化。
import type { ShipId, SkillKey } from "../types";
export interface SkillInfo { name: string; en: string; icon: string; desc: string; evo: [string, string, string] }
export interface ShipDef {
  id: ShipId; name: string; en: string; sigil: string; sigilEn: string; pilot: string; pilotEn: string; role: string; color: string; color2: string; dark: string; quote: string; lore: string;
  portrait: { sheet: string; col: number; focus: number; cropR?: number; focusX?: number; zoom?: number };
  base: { hp: number; spd: number; atk: number; rate: number }; radar: { atk: number; spd: number; def: number; rng: number; ease: number }; activeCd: number; ultTime: number;
  skills: Record<SkillKey, SkillInfo>; cut: { line1: string; line2: string }; cutin: { c1: string; c2: string; c3: string; angle: number };
}
export const SKILL_KEYS: SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = { weapon: "主武裝", passive: "被動技", active: "主動技", ult: "奧義" };
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS = [3, 5, 7];
const sk = (name: string, en: string, icon: string, desc: string, e1: string, e2: string, e3: string): SkillInfo => ({ name, en, icon, desc, evo: [e1, e2, e3] });
type Raw = Omit<ShipDef, "skills" | "cut" | "cutin"> & { w: SkillInfo; p: SkillInfo; a: SkillInfo; u: SkillInfo; l1: string; l2: string; ci: [string, string, string, number] };
const mk = (r: Raw): ShipDef => { const { w, p, a, u, l1, l2, ci, ...rest } = r; return { ...rest, skills: { weapon: w, passive: p, active: a, ult: u }, cut: { line1: l1, line2: l2 }, cutin: { c1: ci[0], c2: ci[1], c3: ci[2], angle: ci[3] } }; };
const LIST: ShipDef[] = [
  mk({ id: "yoyo", name: "繞星", en: "YOYO", sigil: "輪", sigilEn: "ORBIT", pilot: "輪島 小春", pilotEn: "KOHARU WAJIMA", role: "牽絲迴旋・慣性加成", color: "#35e8ff", color2: "#ffd43a", dark: "#071a2a",
    quote: "轉起來，全場都是我的舞台！", lore: "街頭表演出身的少年飛行員。他的溜溜球以細絲與機體相連，絲線所經之處，一切都在傷害範圍內。",
    portrait: { sheet: "a", col: 2, focus: 0.22 }, base: { hp: 100, spd: 350, atk: 1.0, rate: 1.0 }, radar: { atk: 3, spd: 4, def: 2, rng: 4, ease: 3 }, activeCd: 12, ultTime: 45,
    w: sk("雙球牽絲", "Twin Yo-yos", "yoyo_w", "交替擲出溜溜球，到定點旋轉後收回；球與絲線都會造成傷害。", "旋轉時迸出四顆星彈", "收回時再次造成強化打擊", "雙球同時擲出且射程更遠"),
    p: sk("慣性加速", "Momentum", "yoyo_p", "橫向移動越快，溜溜球傷害越高。", "加成上限提高", "旋轉半徑擴大", "高速時沿途留下星彈軌跡"),
    a: sk("環球旋舞", "Around the World", "yoyo_a", "巨大溜溜球繞機體高速旋轉，沿途打擊並切斷敵彈。", "第二顆溜溜球反向環繞", "環繞半徑脈動擴張", "三球環繞，每次掃過釋出星彈"),
    u: sk("彗星繞線", "Comet Thread", "yoyo_u", "巨型溜溜球以擴張螺旋橫貫全場，絲線切割一切，最後重擊落點。", "追加反向旋轉的第二顆", "絲線可切斷敵彈", "終擊範圍擴大並降下彗星雨"), l1: "轉起來吧", l2: "彗星・繞線！", ci: ["#35e8ff", "#ffd43a", "#0e4a66", -0.1] }),
  mk({ id: "kuro", name: "黑龍", en: "KURO", sigil: "龍", sigilEn: "WYRM", pilot: "玄龍寺 影", pilotEn: "KAGE GENRYUJI", role: "龍影追獵・吞咬吸取", color: "#9a5cff", color2: "#e9d8ff", dark: "#07040f",
    quote: "龍，已經嗅到血的氣味。", lore: "舊寺院的守護者之後。一條漆黑的龍與機體共生，會自行追獵敵人，張口吞下獵物的生命。",
    portrait: { sheet: "b", col: 1, focus: 0.22 }, base: { hp: 100, spd: 340, atk: 1.0, rate: 1.0 }, radar: { atk: 4, spd: 3, def: 2, rng: 4, ease: 2 }, activeCd: 11, ultTime: 45,
    w: sk("龍牙二連", "Fang Pair", "kuro_w", "射出追蹤龍牙；漆黑之龍會自行追獵附近敵人，以身軀撕咬。", "龍身加長，咬殺回復少量生命", "龍吼震波推開敵彈", "第二顆龍首同時追獵"),
    p: sk("吞咬", "Devour", "kuro_p", "擊墜敵機回復生命並充能奧義。", "回復量提高", "回復量再提高", "回復與充能大幅提高"),
    a: sk("墨龍盤旋", "Coiling Wyrm", "kuro_a", "黑龍繞機體盤旋，撕咬傷害三倍，並吞噬身軀碰到的敵彈。", "盤旋範圍與時間提高", "結束時擴張為全場螺旋橫掃", "雙首盤旋"),
    u: sk("黑龍天墜", "Wyrm Descent", "kuro_u", "巨大黑龍自天而降，三度橫貫全場，終以一口吞下強敵。", "追加一次俯衝", "俯衝傷害提高", "終咬範圍擴大並再追咬"), l1: "龍，醒來吧", l2: "黑龍・天墜！", ci: ["#9a5cff", "#e9d8ff", "#2c1a58", -0.25] }),
  mk({ id: "tessen", name: "鐵扇", en: "TESSEN", sigil: "扇", sigilEn: "FAN", pilot: "扇谷 彼岸", pilotEn: "HIGAN OUGIYA", role: "開闔雙軌・扇骨反擊", color: "#ff9ac8", color2: "#6a74ff", dark: "#0b0e30",
    quote: "收扇為槍，展扇為翼。", lore: "舊都名門的老練劍客。鐵扇開闔之間，展開時是一片風刃，收起時便是貫穿一切的長槍。",
    portrait: { sheet: "b", col: 3, focus: 0.22 }, base: { hp: 105, spd: 340, atk: 1.0, rate: 1.0 }, radar: { atk: 3, spd: 4, def: 3, rng: 3, ease: 3 }, activeCd: 10, ultTime: 44,
    w: sk("開闔扇擊", "Fan Strike", "tessen_w", "交替展扇與收扇：展扇射出寬幅風刃，收扇射出貫穿長槍。", "展扇風刃增加", "長槍飛行途中分裂為三", "長槍可貫穿全場"),
    p: sk("扇骨", "Fan Ribs", "tessen_p", "擦彈累積扇骨，滿層時下一支長槍為鐵扇碎。", "層數上限提高", "每層加成提高", "滿層時回充奧義"),
    a: sk("舞扇繚亂", "Fan Dance", "tessen_a", "鐵扇旋轉成環護體，擊碎進入的敵彈並傷害敵人。", "半徑與時間提高", "定時將扇片如迴力鏢擲出", "雙環旋舞"),
    u: sk("百扇夜舞", "Hundred Fans", "tessen_u", "百扇自機體螺旋湧出橫掃全場，最後匯聚落下。", "追加一波扇舞", "每扇傷害提高", "匯聚終擊範圍擴大"), l1: "收扇，展扇", l2: "百扇・夜舞！", ci: ["#ff9ac8", "#6a74ff", "#2a2f80", -0.15] }),
];
export const SHIPS = Object.fromEntries(LIST.map((s) => [s.id, s])) as Record<ShipId, ShipDef>;
export const SHIP_LIST = LIST;

========== 來源：004/src/game/render/pbStylesExt.ts ==========
// 新子彈樣式（我方）。EXT_BASE=23 為母專案槽；本專案批次槽從 170 起。
export const EXT_BASE = 23;
export const EXT_BASE_RW = 170;
const TAU = Math.PI * 2;
type C = CanvasRenderingContext2D;
const lg = (c: C, x0: number, y0: number, x1: number, y1: number, st: [number, string][]) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, s]) => g.addColorStop(o, s)); return g; };
const halo = (c: C, r: number, col: string) => { const g = c.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); };
const nd = (c: C, w: number, h: number, st: [number, string][]) => { c.beginPath(); c.moveTo(0, -h / 2); c.lineTo(w / 2, h * 0.28); c.lineTo(0, h / 2); c.lineTo(-w / 2, h * 0.28); c.closePath(); c.fillStyle = lg(c, 0, -h / 2, 0, h / 2, st); c.fill(); };
const moon = (c: C, w: number, h: number, st: [number, string][]) => { c.beginPath(); c.moveTo(-w / 2, h / 2); c.quadraticCurveTo(0, -h * 0.95, w / 2, h / 2); c.quadraticCurveTo(0, -h * 0.15, -w / 2, h / 2); c.fillStyle = lg(c, 0, -h / 2, 0, h / 2, st); c.fill(); };
const orb = (c: C, r: number, st: [number, string][]) => { const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r); st.forEach(([o, s]) => g.addColorStop(o, s)); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); };
export interface ExtStyle { id: number; w: number; h: number; draw: (ctx: C) => void; dir?: boolean; spin?: boolean }
const B = EXT_BASE_RW;
export const EXT_STYLES: ExtStyle[] = [
  // 繞星：溜溜球
  { id: B + 4, w: 38, h: 38, spin: true, dir: false, draw: (c) => { halo(c, 19, "rgba(70,240,255,.4)"); orb(c, 14, [[0, "#fffbe0"], [0.5, "#ffd43a"], [1, "#e08a00"]]); c.strokeStyle = "#0a2a3a"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.stroke(); c.strokeStyle = "#35e8ff"; c.lineWidth = 3; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.stroke(); } },
  { id: B + 5, w: 20, h: 20, spin: true, dir: false, draw: (c) => { halo(c, 10, "rgba(255,255,120,.5)"); c.fillStyle = "#fff"; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 8, a = (i * Math.PI) / 5; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.fill(); } },
  // 黑龍使：龍牙與墨珠
  { id: B + 10, w: 18, h: 38, draw: (c) => { halo(c, 17, "rgba(150,80,255,.35)"); nd(c, 12, 38, [[0, "#e9d8ff"], [0.4, "#9a5cff"], [1, "#1a0a38"]]); } },
  { id: B + 11, w: 26, h: 26, spin: true, dir: false, draw: (c) => { halo(c, 13, "rgba(160,90,255,.4)"); orb(c, 9, [[0, "#6a4aa8"], [1, "#07040f"]]); c.strokeStyle = "#c9a4ff"; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 9, 0.3, 2.4); c.stroke(); } },
];

========== 來源：004/src/game/render/shipDrawKuro.ts ==========
// 黑龍使 KURO：龍首機鼻、鱗紋後掠翼——墨黑與紫電
import { P, lin, rad, glw, circ, line, flame, GEAR, drawGear, sym, at, poly, orbitPt } from "./shipUtil";
import type { Ctx, ShipDrawOpts as O } from "./shipUtil";
export function drawKuro(c: Ctx, o: O) {
  const t = o.t, k = o.tier;
  drawGear(c, o, false);
  flame(c, 0, 36, 5, 32, t, "#e8d6ff", "#9a5cff", o.thrust);
  // 後掠鱗翼
  P(c, "M8 -8 L38 26 L31 31 L25 26 L19 36 L8 22Z", lin(c, 8, -8, 38, 34, 0, "#2a1650", 0.6, "#120a24", 1, "#07040f"), "#9a5cff", 1.3, true);
  c.save(); c.strokeStyle = "rgba(154,92,255,.55)"; c.lineWidth = 0.8; for (const s of [-1, 1]) for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) { c.beginPath(); c.arc(s * (14 + i * 6 + r * 3), 6 + r * 7 + i * 4, 3.4, 0.2, 2.9); c.stroke(); } c.restore();
  P(c, "M9 18 L20 38 L6 34Z", "#1a0f38", "#9a5cff", 1, true);
  // 機身與龍首
  P(c, "M0 -45 L5 -36 L9 -11 L8 20 L4.4 39 L-4.4 39 L-8 20 L-9 -11 L-5 -36Z", lin(c, -9, 0, 9, 0, 0, "#07040f", 0.5, "#2c1a58", 1, "#07040f"), "#9a5cff", 1.3);
  for (let i = 0; i < 5; i++) P(c, `M-2.4 ${-8 + i * 8} L0 ${-13 + i * 8} L2.4 ${-8 + i * 8}Z`, "#3a2270", "#9a5cff", 0.6);
  sym(c, () => { P(c, "M3 -35 Q12 -46 22 -43 Q13 -39 6.5 -29Z", lin(c, 3, -35, 22, -43, 0, "#e9d8ff", 1, "#3a2270"), "#9a5cff", 1); circ(c, 3.4, -30, 1.7, "#ff3a5a"); glw(c, 3.4, -30, 6, "#ff3a5a", 0.6); });
  line(c, [-4, -41, 0, -38, 4, -41], "#e9d8ff", 1.2); // 吻部
  if (k >= 1) sym(c, () => { const w = Math.sin(t * 2) * 3; P(c, `M5 -39 Q18 -38 ${26 + w} -26 Q34 -20 ${38 + w} -23`, null, "rgba(201,164,255,.85)", 1.1); line(c, [16, 4, 24, 14, 30, 20], "#c9a4ff", 1.2); glw(c, 16, 4, 5, "#9a5cff", 0.5); });
  if (k >= 2) { sym(c, () => { P(c, "M7 -30 Q18 -52 31 -50 Q21 -44 11 -26Z", "#e9d8ff", "#9a5cff", 0.9); }); for (let i = 0; i < 4; i++) P(c, `M-1.6 ${14 + i * 5} L0 ${9 + i * 5} L1.6 ${14 + i * 5}Z`, "#9a5cff"); }
  if (k >= 3) { for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1; circ(c, Math.sin(i * 3 + t) * 10, 40 - u * 80, 5 + u * 8, `rgba(110,60,200,${0.28 * (1 - u)})`); } sym(c, () => { P(c, "M38 26 L46 30 L40 33Z", "#e9d8ff", "#9a5cff", 0.8); }); glw(c, 0, -30, 12, "#ff3a5a", 0.5); }
  drawGear(c, o, true);
}
GEAR.kuro = (c, o, f) => {
  const g = o.gear, t = o.t, ur = (i: number) => g[i] >= 4;
  if (!f) {
    if (g[1] >= 3) sym(c, () => { for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - (r > 1 ? 1 : 0); i++) { const x = 11 + i * 6 + r * 2, y = -2 + r * 8; P(c, `M${x} ${y} Q${x + 7} ${y - 2} ${x + 8} ${y + 6} Q${x + 3} ${y + 9} ${x} ${y}Z`, lin(c, x, y, x + 8, y + 8, 0, "#3a2270", 1, "#0a0618"), ur(1) ? "#ffd36a" : "#9a5cff", 0.9); } if (ur(1)) glw(c, 18, 8, 14, "#9a5cff", 0.35); });
    if (g[2] >= 3) { c.save(); c.globalCompositeOperation = "lighter"; for (let i = 0; i < 5; i++) { const w: number[] = [], ph = i * 1.3; for (let j = 0; j <= 12; j++) { w.push((i - 2) * 4 + Math.sin(j * 0.7 - t * 7 + ph) * (1 + j * 0.5), 38 + j * 3.6); } line(c, w, i % 2 ? "rgba(233,216,255,.7)" : (ur(2) ? "rgba(255,70,100,.8)" : "rgba(154,92,255,.8)"), 2.2); } c.restore(); }
    if (g[5] >= 3) { c.save(); c.translate(0, 0); circ(c, 0, 0, 52, null, "rgba(154,92,255,.55)", 1.6); circ(c, 0, 0, 44, null, "rgba(233,216,255,.25)", 1); for (let i = 0; i < 12; i++) { const a = i * 0.5236 + t * 0.35; c.save(); c.rotate(a); P(c, "M-3 -52 Q0 -58 3 -52 Q0 -48 -3 -52Z", "#2c1a58", "#9a5cff", 0.8); c.restore(); } if (ur(5)) { const a = t * 0.9; const hx = Math.cos(a) * 52, hy = Math.sin(a) * 52; for (let j = 1; j < 22; j++) { const b = a - j * 0.07; circ(c, Math.cos(b) * 52, Math.sin(b) * 52, 4.6 - j * 0.18, `rgba(40,20,80,${0.9 - j * 0.03})`, "rgba(154,92,255,.6)", 0.6); } at(c, hx, hy, a + 1.57, () => { P(c, "M0 -7 L4 0 L2 7 L-2 7 L-4 0Z", "#2c1a58", "#c9a4ff", 1); circ(c, -1.6, -1, 0.9, "#ff3a5a"); circ(c, 1.6, -1, 0.9, "#ff3a5a"); }); } c.restore(); }
  } else {
    if (g[0] >= 3) sym(c, () => { P(c, "M4 -34 Q12 -34 13 -50 Q8 -42 2 -38Z", ur(0) ? "#fff" : "#e9d8ff", "#9a5cff", 0.9); glw(c, 13, -49, ur(0) ? 8 : 5, "#c9a4ff", 0.6); });
    if (g[3] >= 3) { const bl = 0.6 + 0.4 * Math.abs(Math.cos(t * 0.8)); glw(c, 0, 6, 15, "#ffb02a", 0.6); P(c, `M-8 6 Q0 ${6 - 8 * bl} 8 6 Q0 ${6 + 8 * bl} -8 6Z`, rad(c, 0, 6, 8, 0, "#fff6c0", 0.5, "#ffb02a", 1, "#ff3a5a"), ur(3) ? "#fff" : "#07040f", 1); P(c, `M0 ${6 - 6 * bl} L1.2 6 L0 ${6 + 6 * bl} L-1.2 6Z`, "#07040f"); }
    if (g[4] >= 3) for (let i = 0; i < (ur(4) ? 4 : 3); i++) { const [x, y] = orbitPt(t, i, ur(4) ? 4 : 3, 30, 22, 0, 0, 1.4); for (let j = 1; j < 6; j++) { const a = t * 1.4 + (i * Math.PI * 2) / (ur(4) ? 4 : 3) - j * 0.14; circ(c, Math.cos(a) * 30, Math.sin(a) * 22, 4 - j * 0.6, `rgba(120,70,220,${0.55 - j * 0.08})`); } circ(c, x, y, 4.4, rad(c, x, y, 5, 0, "#c9a4ff", 1, "#07040f"), "#9a5cff", 1); glw(c, x, y, 8, "#9a5cff", 0.4); }
  }
};

========== 來源：004/src/game/render/shipDrawTessen.ts ==========
// 鐵扇 TESSEN：以扇骨為翼，扇面可開合——靛藍與櫻粉
import { P, lin, rad, glw, circ, line, flame, GEAR, drawGear, sym, at, poly, star, orbitPt } from "./shipUtil";
import type { Ctx, ShipDrawOpts as O } from "./shipUtil";
/** 畫右側扇面：以 (px,py) 為軸，openness 0..1 */
function fan(c: Ctx, px: number, py: number, R: number, a0: number, a1: number, ribs: number, c1: string, c2: string, edge: string, lw = 1.2) {
  c.beginPath(); c.moveTo(px, py); c.arc(px, py, R, a0, a1); c.closePath();
  c.fillStyle = lin(c, px, py, px + R, py - R * 0.4, 0, c1, 1, c2); c.fill(); c.strokeStyle = edge; c.lineWidth = lw; c.lineJoin = "round"; c.stroke();
  for (let i = 0; i <= ribs; i++) { const a = a0 + ((a1 - a0) * i) / ribs; line(c, [px, py, px + Math.cos(a) * R, py + Math.sin(a) * R], i % 2 ? "rgba(255,255,255,.25)" : "rgba(10,14,50,.7)", i % 2 ? 0.6 : 1); }
  c.beginPath(); c.arc(px, py, R * 0.62, a0, a1); c.strokeStyle = "rgba(255,200,230,.5)"; c.lineWidth = 0.8; c.stroke();
}
export function drawTessen(c: Ctx, o: O) {
  const t = o.t, k = o.tier, op = 0.25 + 0.75 * Math.max(0, Math.min(1, o.aux));
  drawGear(c, o, false);
  flame(c, 0, 34, 4, 28, t, "#ffe0f0", "#ff7ac0", o.thrust);
  const a0 = -1.55 + (1 - op) * 0.9, a1 = 0.5 - (1 - op) * 0.2;
  sym(c, () => { fan(c, 6, 6, 38, a0, a1, k >= 1 ? 9 : 6, "#3a3fa8", "#ff9ac8", "#ffd0e6"); if (k >= 2) { line(c, [6, 6, 6 + Math.cos(a0) * 40, 6 + Math.sin(a0) * 40], "#ffd36a", 2.6); line(c, [6, 6, 6 + Math.cos(a1) * 40, 6 + Math.sin(a1) * 40], "#ffd36a", 2.6); circ(c, 6 + Math.cos(a0) * 40, 6 + Math.sin(a0) * 40, 1.8, "#fff6c0"); } });
  P(c, "M5 24 L13 38 L5 34Z", "#2a2f80", "#0b0e30", 1, true);
  P(c, "M0 -43 C4 -35 6.5 -14 6.5 8 L4.4 35 L-4.4 35 L-6.5 8 C-6.5 -14 -4 -35 0 -43Z", lin(c, -7, 0, 7, 0, 0, "#10143a", 0.5, "#4a52c8", 1, "#10143a"), "#0b0e30", 1.4);
  line(c, [0, -38, 0, 30], "#ff9ac8", 1.4); P(c, "M-2.6 -22 L2.6 -22 L3 -10 L-3 -10Z", "#bff0ff", "#0b0e30", 0.8);
  circ(c, 0, 6, 3.6, "#0b0e30", "#ffd36a", 1.2); // 扇軸
  if (k >= 1) sym(c, () => { const sw = Math.sin(t * 2.4) * 2; line(c, [6, 7, 6 + sw, 18, 7 + sw * 1.5, 26], "#ff9ac8", 1.2); circ(c, 7 + sw * 1.5, 27.5, 1.8, "#ffd36a"); circ(c, 6 + sw, 18, 1.2, "#fff"); });
  if (k >= 3) { for (let i = 0; i < 6; i++) { const u = (t * 0.35 + i / 6) % 1, a = u * 6.28 * 1.5 + i; glw(c, Math.cos(a) * (14 + u * 36), 4 + Math.sin(a) * (10 + u * 24), 5, "#ffb3d6", 0.5 * Math.sin(u * 3.14)); at(c, Math.cos(a) * (14 + u * 36), 4 + Math.sin(a) * (10 + u * 24), a, () => { P(c, "M0 0 C3 -2 4 -6 1 -8 C0 -6 -1 -6 -2 -8 C-4 -6 -3 -2 0 0Z", "#ffd0e6"); }); } sym(c, () => { c.beginPath(); c.arc(6, 6, 38, a0, a1); c.strokeStyle = `rgba(255,170,215,${0.6 + 0.3 * Math.sin(t * 4)})`; c.lineWidth = 2.2; c.stroke(); }); }
  drawGear(c, o, true);
}
GEAR.tessen = (c, o, f) => {
  const g = o.gear, t = o.t, ur = (i: number) => g[i] >= 4;
  if (!f) {
    if (g[1] >= 3) sym(c, () => { P(c, "M7 -6 L20 -4 L18 12 L8 10Z", lin(c, 7, -6, 20, 12, 0, "#cfd6ee", 1, "#5a6490"), ur(1) ? "#ffd36a" : "#0b0e30", 1.2); for (let i = 0; i < 4; i++) line(c, [8 + i * 3, -5 + i * 0.6, 8 + i * 3, 11], "rgba(10,14,50,.6)", 0.8); P(c, "M7 10 Q14 20 20 12 Q16 24 8 24Z", "#ff9ac8", "#0b0e30", 0.8); if (ur(1)) glw(c, 13, 4, 12, "#ffd36a", 0.35); });
    if (g[2] >= 3) { c.save(); c.translate(0, 38); c.rotate(t * 14); for (let i = 0; i < 4; i++) { c.rotate(1.5708); P(c, "M0 0 C5 -3 9 -8 5 -12 C2 -8 0 -4 0 0Z", "#ff9ac8", "#0b0e30", 0.8); } c.restore(); glw(c, 0, 38, 12, "#ff7ac0", 0.5); if (ur(2)) circ(c, 0, 38, 11, null, "rgba(255,208,230,.7)", 1.4); }
    if (g[5] >= 3) { const n = ur(5) ? 10 : 7; for (let i = 0; i < n; i++) { const a = i * 6.2832 / n + t * 0.4, R = 54; at(c, Math.cos(a) * R, 2 + Math.sin(a) * R, a + 1.57, () => { fan(c, 0, 6, 11, -2.2, -0.94, 4, "#3a3fa8", "#ff9ac8", "#ffd0e6", 0.8); }); } circ(c, 0, 2, 54, null, "rgba(255,170,215,.25)", 1); if (ur(5)) circ(c, 0, 2, 42, null, "rgba(255,230,160,.35)", 1, 42); }
  } else {
    if (g[0] >= 3) { P(c, "M-5 -34 L5 -34 L3 -62 L-3 -62Z", lin(c, -5, 0, 5, 0, 0, "#3a3fa8", 0.5, "#cfd6ff", 1, "#3a3fa8"), "#0b0e30", 1); for (let i = 0; i < 5; i++) line(c, [-4 + i * 2, -35, -2.4 + i * 1.2, -61], "rgba(10,14,50,.6)", 0.7); glw(c, 0, -63, ur(0) ? 13 : 8, "#ff9ac8", 0.7); if (ur(0)) star(c, 0, -63, 6, 4, 0.3, t, "#fff"); }
    if (g[3] >= 3) { const r = ur(3) ? 11 : 8.5; glw(c, 0, 4, r * 2, "#ff9ac8", 0.55); circ(c, 0, 4, r, rad(c, 0, 4, r, 0, "#fff", 0.5, "#ffb0d6", 1, "#3a3fa8"), "#fff", 1.2); c.save(); c.beginPath(); c.arc(0, 4, r, 0, 6.3); c.clip(); for (let j = 0; j < 3; j++) for (let i = -2; i <= 2; i++) { c.beginPath(); c.arc(i * 6 + (j % 2) * 3, 4 + j * 5 - 4, 4.5, 3.14, 6.28); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 0.8; c.stroke(); } c.restore(); }
    if (g[4] >= 3) for (let i = 0; i < (ur(4) ? 8 : 5); i++) { const u = (t * 0.3 + i * 0.125) % 1, x = Math.sin(i * 2.4 + t) * 30, y = -50 + u * 100; at(c, x, y, t * 2 + i, () => { c.globalAlpha = Math.sin(u * 3.14); P(c, "M0 0 C3 -2 4 -6 1 -8 C0 -6 -1 -6 -2 -8 C-4 -6 -3 -2 0 0Z", "#ffd0e6", "#ff7ac0", 0.5); }); }
  }
};

========== 來源：004/src/game/render/shipDrawYoyo.ts ==========
// 繞星 YOYO：圓盤機身與纏線軸——青藍與琥珀黃
import { P, lin, rad, glw, circ, line, flame, GEAR, drawGear, sym, at, poly, star, orbitPt } from "./shipUtil";
import type { Ctx, ShipDrawOpts as O } from "./shipUtil";
export function drawYoyo(c: Ctx, o: O) {
  const t = o.t, k = o.tier;
  drawGear(c, o, false);
  flame(c, 0, 30, 5.5, 28, t, "#fffbe0", "#35e8ff", o.thrust);
  // 彎月鰭與纏線軸
  P(c, "M15 -5 Q33 -3 35 18 L24 13 L16 12Z", lin(c, 15, -5, 35, 18, 0, "#ffe27a", 1, "#e08a00"), "#08202e", 1.2, true);
  P(c, "M-6 16 L6 16 L8.5 31 L-8.5 31Z", lin(c, -8, 0, 8, 0, 0, "#0e4a66", 0.5, "#35e8ff", 1, "#0e4a66"), "#08202e", 1.1);
  for (let i = 0; i < 4; i++) line(c, [-7 + i * 0.3, 19 + i * 3.2, 7 - i * 0.3, 19 + i * 3.2], "rgba(255,226,122,.85)", 1.2);
  // 錐形機首
  P(c, "M-9 -13 L0 -42 L9 -13Z", lin(c, 0, -42, 0, -13, 0, "#eaffff", 1, "#1aa6d8"), "#08202e", 1.2);
  // 圓盤機身：外環琥珀、內轂旋轉
  circ(c, 0, 2, 19, rad(c, 0, 2, 19, 0, "#35e8ff", 0.65, "#127a9e", 1, "#08202e"), "#ffd43a", 2.4);
  circ(c, 0, 2, 13, null, "rgba(255,255,255,.35)", 1);
  c.save(); c.translate(0, 2); c.rotate(t * 2.2 + o.aux * 6); for (let i = 0; i < 6; i++) { c.rotate(Math.PI / 3); P(c, "M-1.6 -3 L1.6 -3 L2.4 -12 L-2.4 -12Z", i % 2 ? "#ffe27a" : "#eaffff"); } c.restore();
  circ(c, 0, 2, 3.6, "#08202e", "#ffd43a", 1.2);
  if (k >= 1) sym(c, () => { c.save(); c.translate(24, 4); c.rotate(t * 5); circ(c, 0, 0, 5, "#ffd43a", "#08202e", 1); line(c, [-5, 0, 5, 0], "#35e8ff", 2); c.restore(); });
  if (k >= 2) { c.save(); c.translate(0, 2); c.rotate(-0.4); circ(c, 0, 0, 30, null, "rgba(255,226,122,.8)", 1.6, 9); const a = t * 1.6; glw(c, Math.cos(a) * 30 * Math.cos(-0.4) + Math.sin(a) * 9 * Math.sin(0.4), 0, 5, "#ffe27a", 0.8); c.restore(); }
  if (k >= 3) { glw(c, 0, 2, 36, "#35e8ff", 0.2 + 0.06 * Math.sin(t * 4)); for (let i = 0; i < 4; i++) star(c, ...orbitPt(t, i, 4, 33, 33, 0, 2, 0.9), 3.4, 4, 0.4, t * 2, "#fffbe0"); }
  drawGear(c, o, true);
}
GEAR.yoyo = (c, o, f) => {
  const g = o.gear, t = o.t, ur = (i: number) => g[i] >= 4;
  if (!f) {
    if (g[1] >= 3) for (const s of [-1, 1]) { c.save(); c.translate(0, 2); c.rotate(s * 0.5); c.beginPath(); c.ellipse(0, 0, 26, 15, 0, s > 0 ? -1.2 : 1.9, s > 0 ? 1.2 : 4.4); c.strokeStyle = ur(1) ? "#fff" : "#ffd43a"; c.lineWidth = 3; c.stroke(); c.strokeStyle = "rgba(53,232,255,.9)"; c.lineWidth = 1.2; c.stroke(); c.restore(); }
    if (g[2] >= 3) for (let i = 0; i < (ur(2) ? 3 : 2); i++) { const u = (t * 1.6 + i / 3) % 1; circ(c, 0, 34 + u * 22, 5 + u * 9, null, `rgba(255,226,122,${0.9 * (1 - u)})`, 2, 2 + u * 3); }
    if (g[5] >= 3) { c.save(); c.translate(0, 2); c.rotate(-0.3 + Math.sin(t * 0.5) * 0.1); circ(c, 0, 0, 58, null, "rgba(53,232,255,.55)", 2, 20); const a = t * 1.8, x = Math.cos(a) * 58, y = Math.sin(a) * 20; for (let j = 1; j < 9; j++) { const b = a - j * 0.09; glw(c, Math.cos(b) * 58, Math.sin(b) * 20, 5 - j * 0.45, "#ffe27a", 0.6 - j * 0.06); } glw(c, x, y, 9, "#fff", 0.85); star(c, x, y, 5, 5, 0.45, t * 3, "#fffbe0"); if (ur(5)) { circ(c, 0, 0, 46, null, "rgba(255,226,122,.35)", 1.2, 16); } c.restore(); }
  } else {
    if (g[0] >= 3) sym(c, () => { line(c, [26, 4, 36, -6, 34, -22], "rgba(255,255,255,.55)", 1); c.save(); c.translate(34, -24); c.rotate(t * 6); circ(c, 0, 0, 8, rad(c, -2, -2, 9, 0, "#fffbe0", 0.6, "#ffd43a", 1, "#c98a00"), "#08202e", 1.2); line(c, [-8, 0, 8, 0], "#35e8ff", 2.4); c.restore(); if (ur(0)) glw(c, 34, -24, 14, "#ffd43a", 0.55); });
    if (g[3] >= 3) { glw(c, 0, 2, 15, "#35e8ff", 0.65); c.save(); c.translate(0, 2); c.rotate(t * 3.5); for (let i = 0; i < (ur(3) ? 8 : 5); i++) { c.rotate(Math.PI * 2 / (ur(3) ? 8 : 5)); P(c, "M0 0 L2.4 -8 L0 -11 L-2.4 -8Z", i % 2 ? "#fffbe0" : "#35e8ff"); } c.restore(); circ(c, 0, 2, 2.6, "#fff"); }
    if (g[4] >= 3) for (let i = 0; i < (ur(4) ? 5 : 3); i++) { const [x, y] = orbitPt(t, i, ur(4) ? 5 : 3, 38, 38, 0, 2, -1.2); star(c, x, y, 4.6, 5, 0.45, t * 2 + i, "#fffbe0", "#ffd43a", 0.8); glw(c, x, y, 8, "#ffe27a", 0.4); }
  }
};

========== 來源：004/src/game/skills/dragonDraw.ts ==========
// 龍的繪製模組：沿路徑畫出有鱗紋、背鰭、四肢、龍首（角、鬃毛、龍鬚、利齒、開合下顎）的東方龍
export interface DragonPal { body: string; belly: string; scale: string; mane: string; eye: string; glow: string; horn: string; out: string }
export const BLACK_DRAGON: DragonPal = { body: "#16102a", belly: "#5a4690", scale: "#a77cff", mane: "#8a4cff", eye: "#ff3a5a", glow: "#9a5cff", horn: "#e9d8ff", out: "#05030a" };
export const GOLD_DRAGON: DragonPal = { body: "#c98a14", belly: "#fff0b0", scale: "#fff6c8", mane: "#e8334a", eye: "#9affc8", glow: "#ffcf4a", horn: "#fff6d0", out: "#5a2a00" };
export interface P2 { x: number; y: number }
type C = CanvasRenderingContext2D;
export function drawDragon(c: C, pts: P2[], t: number, pal: DragonPal, W0: number, jaw = 0.5) {
  const n = pts.length; if (n < 5) return; const dx: number[] = [], dy: number[] = [];
  for (let i = 0; i < n; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; let x = a.x - b.x, y = a.y - b.y; const l = Math.hypot(x, y) || 1; dx.push(x / l); dy.push(y / l); }
  const wd = (i: number) => { const u = i / (n - 1); return (i < 3 ? W0 * (0.6 + 0.13 * i) : W0 * (1 - 0.9 * Math.pow(u, 0.82))) + 1; };
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.25; c.strokeStyle = pal.glow; for (let i = n - 2; i >= 0; i -= 2) { c.lineWidth = wd(i) * 2.2; c.beginPath(); c.moveTo(pts[i + 1].x, pts[i + 1].y); c.lineTo(pts[i].x, pts[i].y); c.stroke(); } c.restore();
  // 背鰭（身體之後）
  for (let i = n - 3; i >= 3; i -= 2) { const w = wd(i), nx = -dy[i], ny = dx[i], bx = pts[i].x - nx * w * 0.46, by = pts[i].y - ny * w * 0.46, s = w * 0.62 + Math.sin(t * 6 + i) * w * 0.07; c.fillStyle = pal.mane; c.strokeStyle = pal.out; c.lineWidth = 1; c.beginPath(); c.moveTo(bx + dx[i] * s * 0.55, by + dy[i] * s * 0.55); c.lineTo(bx - nx * s * 1.05 - dx[i] * s * 0.7, by - ny * s * 1.05 - dy[i] * s * 0.7); c.lineTo(bx - dx[i] * s * 0.55, by - dy[i] * s * 0.55); c.closePath(); c.fill(); c.stroke(); }
  // 四肢
  for (const fi of [Math.floor(n * 0.2), Math.floor(n * 0.5)]) for (const sd of [-1, 1]) {
    const w = wd(fi), nx = -dy[fi] * sd, ny = dx[fi] * sd, bx = pts[fi].x + nx * w * 0.4, by = pts[fi].y + ny * w * 0.4, kx = bx + nx * W0 * 0.55 - dx[fi] * W0 * 0.2, ky = by + ny * W0 * 0.55 - dy[fi] * W0 * 0.2, fx = kx + nx * W0 * 0.2 - dx[fi] * W0 * 0.38, fy = ky + ny * W0 * 0.2 - dy[fi] * W0 * 0.38;
    c.strokeStyle = pal.out; c.lineWidth = w * 0.34 + 2.5; c.beginPath(); c.moveTo(bx, by); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke(); c.strokeStyle = pal.body; c.lineWidth = w * 0.34; c.stroke();
    c.strokeStyle = pal.horn; c.lineWidth = Math.max(1.2, w * 0.07); for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(fx, fy); c.quadraticCurveTo(fx + nx * W0 * 0.18 + k * dx[fi] * W0 * 0.15, fy + ny * W0 * 0.18 + k * dy[fi] * W0 * 0.15, fx + nx * W0 * 0.3 - dx[fi] * W0 * (0.22 - k * 0.12), fy + ny * W0 * 0.3 - dy[fi] * W0 * (0.22 - k * 0.12)); c.stroke(); }
  }
  // 身體：輪廓→底色→腹部→背脊高光
  for (let pass = 0; pass < 4; pass++) for (let i = n - 2; i >= 0; i--) {
    const w = wd(i), nx = -dy[i], ny = dx[i]; let off = 0, lw = w, col = pal.body;
    if (pass === 0) { lw = w + 3.4; col = pal.out; } else if (pass === 2) { off = w * 0.22; lw = w * 0.4; col = pal.belly; } else if (pass === 3) { off = -w * 0.26; lw = w * 0.16; col = "rgba(255,255,255,.2)"; }
    c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(pts[i + 1].x + nx * off, pts[i + 1].y + ny * off); c.lineTo(pts[i].x + nx * off, pts[i].y + ny * off); c.stroke();
  }
  // 鱗紋
  c.strokeStyle = pal.scale; c.globalAlpha = 0.55; for (let i = 2; i < n - 1; i += 2) { const w = wd(i), nx = -dy[i], ny = dx[i], x = pts[i].x, y = pts[i].y; c.lineWidth = Math.max(0.8, w * 0.05); c.beginPath(); c.moveTo(x - nx * w * 0.42, y - ny * w * 0.42); c.quadraticCurveTo(x - dx[i] * w * 0.38, y - dy[i] * w * 0.38, x + nx * w * 0.42, y + ny * w * 0.42); c.stroke(); } c.globalAlpha = 1;
  // 龍首
  const hx = pts[0].x, hy = pts[0].y, ang = Math.atan2(dy[0], dx[0]), S = W0 * 0.82; c.save(); c.translate(hx, hy); c.rotate(ang);
  c.fillStyle = pal.mane; c.strokeStyle = pal.out; c.lineWidth = 1; for (let i = 0; i < 7; i++) { const x = -S * (0.05 + i * 0.16), y = -S * 0.36 - i * 0.015 * S, sw = Math.sin(t * 6 + i * 0.8) * S * 0.12; c.beginPath(); c.moveTo(x + S * 0.12, y); c.quadraticCurveTo(x - S * 0.1, y - S * 0.5 + sw, x - S * 0.5, y - S * 0.62 + sw * 1.5); c.quadraticCurveTo(x - S * 0.2, y - S * 0.15, x - S * 0.12, y + S * 0.08); c.closePath(); c.fill(); c.stroke(); }
  for (const [x1, y1, x2, y2, w] of [[0, -S * 0.34, -S * 1.05, -S * 0.98, 1], [S * 0.12, -S * 0.3, -S * 0.78, -S * 0.7, 0.75]]) { c.fillStyle = pal.horn; c.strokeStyle = pal.out; c.lineWidth = 1; c.beginPath(); c.moveTo(x1 - S * 0.08, y1); c.quadraticCurveTo((x1 + x2) / 2 + S * 0.1, y1 - S * 0.6 * w, x2, y2); c.quadraticCurveTo((x1 + x2) / 2 - S * 0.12, y1 - S * 0.12, x1 + S * 0.1, y1 + S * 0.04); c.closePath(); c.fill(); c.stroke(); }
  const sk = new Path2D(`M${-S * 0.55} ${-S * 0.38} C${-S * 0.2} ${-S * 0.62} ${S * 0.4} ${-S * 0.5} ${S * 0.95} ${-S * 0.24} L${S * 1.28} ${-S * 0.16} Q${S * 1.38} ${-S * 0.02} ${S * 1.24} ${S * 0.06} L${S * 0.9} ${S * 0.12} C${S * 0.5} ${S * 0.34} ${-S * 0.2} ${S * 0.4} ${-S * 0.55} ${S * 0.3}Z`);
  const lj = jaw * 0.38; c.save(); c.translate(S * 0.05, S * 0.18); c.rotate(lj); c.fillStyle = pal.belly; c.strokeStyle = pal.out; c.lineWidth = 1.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(S * 1.0, -S * 0.02); c.quadraticCurveTo(S * 1.1, S * 0.12, S * 0.92, S * 0.17); c.lineTo(S * 0.05, S * 0.26); c.closePath(); c.fill(); c.stroke(); c.fillStyle = "#fff"; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(S * (0.55 + k * 0.12), -S * 0.02); c.lineTo(S * (0.6 + k * 0.12), -S * 0.12); c.lineTo(S * (0.65 + k * 0.12), -S * 0.02); c.fill(); } c.restore();
  const gr = c.createLinearGradient(0, -S * 0.6, 0, S * 0.4); gr.addColorStop(0, pal.belly); gr.addColorStop(0.35, pal.body); gr.addColorStop(1, pal.body); c.fillStyle = gr; c.fill(sk); c.strokeStyle = pal.out; c.lineWidth = 1.6; c.stroke(sk);
  c.fillStyle = "#fff"; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(S * (0.55 + k * 0.14), S * 0.1); c.lineTo(S * (0.6 + k * 0.14), S * 0.26); c.lineTo(S * (0.65 + k * 0.14), S * 0.1); c.fill(); }
  c.strokeStyle = pal.scale; c.lineWidth = 1; c.globalAlpha = 0.7; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(-S * (0.05 + k * 0.12), -S * 0.3); c.quadraticCurveTo(-S * (0.05 + k * 0.12) + S * 0.1, -S * 0.05, -S * (0.05 + k * 0.12), S * 0.2); c.stroke(); } c.globalAlpha = 1;
  c.fillStyle = pal.out; c.beginPath(); c.arc(S * 1.17, -S * 0.07, S * 0.045, 0, 6.3); c.fill();
  c.strokeStyle = pal.horn; c.lineWidth = 2.2; c.beginPath(); c.moveTo(S * 0.25, -S * 0.34); c.lineTo(S * 0.62, -S * 0.3); c.stroke();
  c.save(); c.globalCompositeOperation = "lighter"; const eg = c.createRadialGradient(S * 0.4, -S * 0.17, 0, S * 0.4, -S * 0.17, S * 0.34); eg.addColorStop(0, pal.eye); eg.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = eg; c.beginPath(); c.arc(S * 0.4, -S * 0.17, S * 0.34, 0, 6.3); c.fill(); c.restore();
  c.fillStyle = pal.eye; c.beginPath(); c.ellipse(S * 0.4, -S * 0.17, S * 0.1, S * 0.07, -0.3, 0, 6.3); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.ellipse(S * 0.4, -S * 0.17, S * 0.022, S * 0.062, -0.3, 0, 6.3); c.fill();
  c.strokeStyle = pal.mane; c.lineWidth = Math.max(1.4, S * 0.05); for (const sd of [-1, 1]) { const w = Math.sin(t * 5 + sd) * S * 0.2; c.beginPath(); c.moveTo(S * 1.15, S * 0.0 + sd * S * 0.02); c.bezierCurveTo(S * 1.7, sd * S * 0.5 + w, S * 0.7, sd * S * 1.0 - w, -S * 0.3, sd * S * 0.85 + w); c.stroke(); }
  c.restore(); c.restore();
}

========== 來源：004/src/game/skills/kuro.ts ==========
// 黑龍使 KURO：自行追獵的漆黑之龍（撕咬＋龍吼震波）＋吞咬吸取＋墨龍盤旋＋黑龍天墜
import type { ShipKit } from "./common";
import { foes, ultBackdrop, banner, mkFx, densest } from "./common";
import { EXT_BASE_RW as B } from "../render/pbStylesExt";
import { W, H, TAU, dist2 } from "../constants";
import { drawDragon, BLACK_DRAGON } from "./dragonDraw";
import type { P2 } from "./dragonDraw";
import type { Game } from "../engine/Game";
const GAP = 3;
const mkHead = (g: Game, ox = 0) => ({ x: g.p.x + ox, y: g.p.y - 60, vx: 0, vy: 0, hist: [] as P2[] });
const segs = (h: { hist: P2[] }, N: number): P2[] => { const o: P2[] = []; for (let i = 0; i < N; i++) { const q = h.hist[Math.min(h.hist.length - 1, i * GAP)]; if (q) o.push(q); } return o; };
export const kuroKit: ShipKit = {
  init(g) { g.p.k = { heads: [mkHead(g)], coil: 0, coilMax: 0, roarT: 4, tick: 0, aux: 0, jaw: 0.3 }; },
  update(g, dt) {
    const p = g.p, k = p.k, lw = g.lvl("weapon"), la = g.lvl("active"), N = lw >= 3 ? 24 : 18, m = g.dmgMult(); if ((lw >= 7 || (la >= 7 && k.coil > 0)) && k.heads.length < 2) k.heads.push(mkHead(g, 20));
    k.tick -= dt; const bite = k.tick <= 0; if (bite) k.tick = 0.1; if (k.coil > 0) k.coil -= dt; const mulC = k.coil > 0 ? 3 : 1; const T = foes(g).filter((e) => e.y > -10 && dist2(e.x, e.y, p.x, p.y) < 400 * 400);
    k.heads.forEach((h: { x: number; y: number; vx: number; vy: number; hist: P2[] }, hi: number) => {
      const ox = h.x, oy = h.y;
      if (k.coil > 0) {
        const tt = k.coilMax - k.coil, a = tt * 5.5 + hi * Math.PI, ex = la >= 5 && k.coil < 1.2 ? 1 - k.coil / 1.2 : 0, base = (la >= 3 ? 150 : 120) + 18 * Math.sin(tt * 2);
        if (ex > 0) { const R = base + ex * 300; h.x = W / 2 + Math.cos(a * 1.2) * R * 0.8; h.y = H * 0.5 + Math.sin(a * 1.2) * R * 0.9; } else { h.x = p.x + Math.cos(a) * base; h.y = p.y + Math.sin(a) * base * 0.9; }
      } else {
        const tg = T.length ? T[Math.min(hi, T.length - 1)] : null; let tx = p.x + Math.cos(g.t * 1.5 + hi * Math.PI) * 60, ty = p.y - 70 + Math.sin(g.t * 2 + hi) * 24; if (tg) { tx = tg.x; ty = tg.y; }
        const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy) || 1, sp = tg ? 470 : 360; h.vx += ((dx / d) * Math.min(sp, d * 6) - h.vx) * Math.min(1, dt * 6); h.vy += ((dy / d) * Math.min(sp, d * 6) - h.vy) * Math.min(1, dt * 6); h.x += h.vx * dt; h.y += h.vy * dt;
      }
      h.vx = (h.x - ox) / Math.max(dt, 0.001); h.vy = (h.y - oy) / Math.max(dt, 0.001); h.hist.unshift({ x: h.x, y: h.y }); if (h.hist.length > N * GAP + 8) h.hist.length = N * GAP + 8;
      if (bite) { for (const e of foes(g)) if (dist2(h.x, h.y, e.x, e.y) < (30 + e.r * e.scale) ** 2) g.damageEnemy(e, 24 * m * mulC, { noText: true });
        const sg = segs(h, N); for (let i = 3; i < sg.length; i += 3) { for (const e of foes(g)) if (dist2(sg[i].x, sg[i].y, e.x, e.y) < (16 + e.r * e.scale) ** 2) g.damageEnemy(e, 7 * m * mulC, { noText: true, noHitFx: true }); if (k.coil > 0) for (const b of g.eb.items) if (b.alive && dist2(sg[i].x, sg[i].y, b.x, b.y) < 30 * 30) { g.removeEB(b, "score"); g.addUlt(0.1); } } }
    });
    k.jaw = 0.3 + 0.3 * Math.sin(g.t * 6) + (k.coil > 0 ? 0.4 : 0);
    if (lw >= 5) { k.roarT -= dt; if (k.roarT <= 0) { k.roarT = 6; const h = k.heads[0]; for (const b of g.eb.items) if (b.alive && dist2(b.x, b.y, h.x, h.y) < 170 * 170) b.ang = Math.atan2(b.y - h.y, b.x - h.x); g.fx.ring(h.x, h.y, 10, 170, 0.5, "#c9a4ff", 5); g.audio("boom_s"); g.shake(3, 0.2); } }
  },
  fire(g) { const p = g.p; for (const s of [-1, 1]) g.spawnPB(p.x + s * 12, p.y - 22, -Math.PI / 2 + s * 0.06, 880, B + 10, 9 * g.dmgMult(), { homing: 0.7 + p.s.homing, src: 0 }); g.audio("shoot1", 0.07); p.fireT += 0.22 / (p.s.rate * g.ship.base.rate); },
  onKill(g) { const lp = g.lvl("passive"), lw = g.lvl("weapon"); g.heal([0.6, 0.6, 1.0, 1.0, 1.6, 1.6, 2.4][lp - 1] + (lw >= 3 ? 0.6 : 0)); g.addUlt([0.8, 0.8, 1.2, 1.2, 1.8, 1.8, 2.8][lp - 1]); },
  castActive(g) { const la = g.lvl("active"), k = g.p.k; k.coil = k.coilMax = la >= 3 ? 4.5 : 3.5; banner(g, "墨龍盤旋", "龍，已經嗅到血的氣味", "#c9a4ff", 1.0); g.audio("whoosh"); },
  castUlt(g) {
    const lu = g.lvl("ult"), m = g.dmgMult(), passes = lu >= 3 ? 4 : 3, per = 1.15, total = passes * per; g.p.formT = total + 1.8; g.p.inv = Math.max(g.p.inv, total + 3); ultBackdrop(g, 5, total + 1.6, "#06020e", 0.68); banner(g, "黑龍天墜", "龍，醒來吧", "#c9a4ff", 1.5);
    const hist: P2[] = []; let t = 0, tk = 0, fin = false, tx = 0, ty = 0, lx = W / 2, ly = -140, ft = 0, roared = -1;
    const pathAt = (tt: number): P2 => { const ps = Math.min(passes - 1, Math.floor(tt / per)), u = Math.min(1, (tt - ps * per) / per), dir = ps % 2 ? -1 : 1; return { x: W / 2 + Math.sin(u * Math.PI * 2.2 + ps * 1.3) * 230 * dir * (0.6 + 0.4 * Math.sin(u * Math.PI)), y: ps % 2 ? H + 140 - u * (H + 280) : -140 + u * (H + 280) }; };
    mkFx(g, 1, (dt) => {
      t += dt; tk -= dt; let q: P2; if (!fin && t < total) q = pathAt(t); else { if (!fin) { fin = true; const d = densest(g, 160); tx = d.x; ty = d.y; ft = 0; } ft += dt; const k = Math.min(1, ft / 0.45); q = { x: lx + (tx - lx) * k, y: ly + (ty - ly) * k }; if (ft - dt < 0.5 && ft >= 0.5) { const r = lu >= 7 ? 280 : 220; g.aoe(tx, ty, r, 1500 * m, { pal: "void" }); g.clearBullets(tx, ty, r, "coin"); g.flash("#c9a4ff", 0.7); g.shake(13, 0.6); g.audio("boom_l"); g.fx.burst(tx, ty, 50, "#c9a4ff", 150, 560, 0.9, 2.6); if (lu >= 7) g.later(0.4, () => { g.aoe(tx, ty, 170, 700 * m, { pal: "void" }); g.shake(8, 0.3); }); } }
      lx = q.x; ly = q.y; hist.unshift(q); if (hist.length > 80) hist.length = 80; const ps = Math.floor(t / per); if (t < total && ps !== roared && t % per < 0.05) { roared = ps; g.flash("#c9a4ff", 0.25); g.shake(5, 0.2); g.audio("boom_m", 0.2); }
      if (tk <= 0 && !fin) { tk = 0.08; for (let i = 0; i < 60; i += 2) { const s = hist[i]; if (!s) continue; for (const e of foes(g)) if (dist2(s.x, s.y, e.x, e.y) < (58 + e.r * e.scale) ** 2) g.damageEnemy(e, 230 * m * (lu >= 3 ? 1.2 : 1), { noText: true }); for (const b of g.eb.items) if (b.alive && dist2(s.x, s.y, b.x, b.y) < 52 * 52) g.removeEB(b, "coin"); } }
      return t < total + 1.5;
    }, (c) => { const pts: P2[] = []; for (let i = 0; i < 30; i++) { const s = hist[i * 2]; if (s) pts.push(s); } c.save(); c.globalAlpha = Math.min(1, t * 4, (total + 1.5 - t) * 3); drawDragon(c, pts, t, BLACK_DRAGON, 48, 0.5 + 0.5 * Math.sin(t * 8)); c.restore(); });
    void TAU;
  },
  drawUnder(g, c) { const k = g.p.k; k.heads.forEach((h: { hist: P2[] }, i: number) => { if (h.hist.length > 10) drawDragon(c, segs(h, i ? 14 : g.lvl("weapon") >= 3 ? 24 : 18), g.t + i, BLACK_DRAGON, i ? 11 : 15, k.jaw); }); },
  preview: (t) => ({ mode: 0, aux: (Math.sin(t) + 1) / 2 }),
};

========== 來源：004/src/game/skills/tessen.ts ==========
// 鐵扇 TESSEN：展扇風刃／收扇長槍雙軌交替＋扇骨反擊＋舞扇繚亂＋百扇夜舞
import type { ShipKit } from "./common";
import { mkFx, foes, densest, ultBackdrop, banner } from "./common";
import { EXT_BASE_RW as B } from "../render/pbStylesExt";
import { W, H, TAU, dist2, easeOut } from "../constants";
import type { PBullet } from "../entities";
function fanShape(c: CanvasRenderingContext2D, x: number, y: number, rot: number, R: number, a = 1) {
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R, -2.1, -0.85); c.closePath(); const gr = c.createLinearGradient(0, 0, R, -R); gr.addColorStop(0, "#3a3fa8"); gr.addColorStop(1, "#ff9ac8"); c.fillStyle = gr; c.fill(); c.strokeStyle = "#ffe0f0"; c.lineWidth = 1.6; c.stroke();
  for (let i = 0; i <= 6; i++) { const an = -2.1 + (1.25 * i) / 6; c.strokeStyle = i % 2 ? "rgba(255,255,255,.35)" : "rgba(10,14,50,.7)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(an) * R, Math.sin(an) * R); c.stroke(); } c.restore();
}
export const tessenKit: ShipKit = {
  init(g) { g.p.k = { vol: 0, ribs: 0, aux: 0.2 }; },
  update(g, dt) { const k = g.p.k, goal = k.vol % 2 ? 1 : 0.15; k.aux += (goal - k.aux) * Math.min(1, dt * 10); },
  fire(g) {
    const p = g.p, k = p.k, lw = g.lvl("weapon"), lp = g.lvl("passive"), m = g.dmgMult(), mx = lp >= 3 ? 14 : 10; k.vol++;
    if (k.vol % 2) { const n = lw >= 3 ? 9 : 7; for (let i = 0; i < n; i++) g.spawnPB(p.x, p.y - 22, -Math.PI / 2 + (i - (n - 1) / 2) * 0.13, 640, B + 14, 12 * m, { src: 0, pierce: p.s.pierce, life: 0.55 }); g.audio("shoot3", 0.06); }
    else { const shat = k.ribs >= mx, mul = 1 + k.ribs * (0.04 + (lp >= 5 ? 0.02 : 0)); const b = g.spawnPB(p.x, p.y - 28, -Math.PI / 2, 1300, B + 15, 46 * m * (shat ? 3 : mul), { src: 0, pierce: (shat || lw >= 7 ? 99 : 4) + p.s.pierce, kind: lw >= 5 && !shat ? 20 : 0, life: 1.4 }); b.a = 0; if (shat) { k.ribs = 0; if (lp >= 7) g.addUlt(4); g.fx.ring(p.x, p.y - 30, 8, 80, 0.4, "#ff9ac8", 4); g.toast("鐵扇碎！", "#ff9ac8"); } g.audio("shoot4", 0.06); }
    p.fireT += 0.3 / (p.s.rate * g.ship.base.rate);
  },
  updateBullet(g, b: PBullet, dt) {
    if (b.style !== B + 15) return; b.x += b.vx * dt; b.y += b.vy * dt;
    if (!b.a && b.t > 0.28) { b.a = 1; for (const s of [-1, 0, 1]) g.spawnPB(b.x, b.y, -Math.PI / 2 + s * 0.2, 1100, B + 15, b.dmg * 0.6, { src: 2, pierce: 3, life: 1 }); g.pb.kill(b); }
  },
  onGraze(g) { const k = g.p.k; k.ribs = Math.min(g.lvl("passive") >= 3 ? 14 : 10, k.ribs + 1); },
  castActive(g) {
    const la = g.lvl("active"), dur = la >= 3 ? 6 : 4.5, R = la >= 3 ? 120 : 95, two = la >= 7; banner(g, "舞扇繚亂", "收扇為槍，展扇為翼", "#ff9ac8", 1.0); let t = 0, tk = 0, tt = 0, removed = 0;
    mkFx(g, 1, (dt) => {
      t += dt; tk -= dt; tt -= dt; const p = g.p, m = g.dmgMult();
      if (tk <= 0) { tk = 0.1; for (const r of two ? [R, R * 0.55] : [R]) { for (const e of foes(g)) if (dist2(p.x, p.y, e.x, e.y) < (r + e.r * e.scale) ** 2) g.damageEnemy(e, 40 * m * (r < R ? 0.7 : 1), { noText: true }); if (removed < 40) for (const b of g.eb.items) if (b.alive && dist2(p.x, p.y, b.x, b.y) < (r + 6) ** 2) { g.removeEB(b, "score"); removed++; if (removed % 3 === 0) g.spawnPB(b.x, b.y, Math.atan2(b.y - p.y, b.x - p.x), 700, B + 14, 8 * m, { src: 2, life: 0.5 }); } }
        removed = Math.max(0, removed - 3); }
      if (la >= 5 && tt <= 0) { tt = 1.2; const tg = g.nearest(p.x, p.y, 600); if (tg) g.spawnPB(p.x, p.y, Math.atan2(tg.y - p.y, tg.x - p.x), 800, B + 14, 60 * m, { src: 2, pierce: 5, life: 1 }); }
      return t < dur;
    }, (c) => { const p = g.p, a = Math.min(1, t * 5, (dur - t) * 4); c.save(); c.globalAlpha = a; for (const [r, n, sp] of two ? [[R, 5, 6.5], [R * 0.55, 4, -8]] : [[R, 5, 6.5]]) { c.strokeStyle = "rgba(255,170,215,.25)"; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.stroke(); for (let i = 0; i < n; i++) { const an = t * sp + (i * TAU) / n; fanShape(c, p.x + Math.cos(an) * r, p.y + Math.sin(an) * r, an + 1.57 + Math.PI * 0.35, r * 0.42, 1); } } c.restore(); });
  },
  castUlt(g) {
    const lu = g.lvl("ult"), m = g.dmgMult(), nW = lu >= 3 ? 4 : 3, per = 0.8, spin = 1.8; g.p.formT = nW * per + 3.2; g.p.inv = Math.max(g.p.inv, nW * per + 4.2); ultBackdrop(g, 7, nW * per + 3, "#0a0828", 0.6); banner(g, "百扇夜舞", "收扇，展扇", "#ff9ac8", 1.5);
    const cx = g.p.x, cy = g.p.y - 80, conv = nW * per + 0.6, tg = { x: W / 2, y: H * 0.4 }; let t = 0, tk = 0, boom = false;
    const fans: Array<{ a0: number; t0: number; px: number; py: number }> = []; for (let w = 0; w < nW; w++) g.later(w * per, () => { for (let i = 0; i < 12; i++) fans.push({ a0: (i * TAU) / 12 + w * 0.4, t0: t, px: cx, py: cy }); g.audio("whoosh", 0.05); });
    mkFx(g, 1, (dt) => {
      t += dt; tk -= dt; if (t >= conv && !boom) { const d = densest(g, 160); tg.x = d.x; tg.y = d.y; boom = true; g.later(0.9, () => { const r = lu >= 7 ? 330 : 240; g.aoe(tg.x, tg.y, r, 1100 * m, { pal: "void" }); g.clearBullets(tg.x, tg.y, r, "coin"); g.flash("#ffd0e6", 0.7); g.shake(11, 0.5); g.audio("boom_l"); g.fx.burst(tg.x, tg.y, 50, "#ff9ac8", 150, 520, 0.8, 2.4); }); }
      if (tk <= 0) { tk = 0.06; for (const f of fans) { const [x, y] = posOf(f); for (const e of foes(g)) if (dist2(x, y, e.x, e.y) < (52 + e.r * e.scale) ** 2) g.damageEnemy(e, 120 * m * (lu >= 5 ? 1.3 : 1), { noText: true }); } }
      return t < conv + 1.2;
    }, (c) => { c.save(); for (const f of fans) { const [x, y] = posOf(f); c.globalAlpha = Math.min(1, (conv + 1.2 - t) * 2, (t - f.t0) * 6 + 0.2); fanShape(c, x, y, (t - f.t0) * 9 + f.a0, 46); c.save(); c.globalCompositeOperation = "lighter"; c.globalAlpha = 0.3; c.fillStyle = "#ff9ac8"; c.beginPath(); c.arc(x, y, 30, 0, TAU); c.fill(); c.restore(); } c.restore(); });
    function posOf(f: { a0: number; t0: number }): [number, number] {
      const lt = t - f.t0; if (t < conv) { const u = Math.min(1, lt / spin), r = 30 + 400 * easeOut(u), a = f.a0 + lt * 3; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.9]; }
      const u = Math.min(1, (t - conv) / 0.9), a = f.a0 + lt * 3, r = 30 + 400; const sx = cx + Math.cos(a) * r, sy = cy + Math.sin(a) * r * 0.9; return [sx + (tg.x - sx) * u, sy + (tg.y - sy) * u];
    }
  },
  drawOver(g, c) { const p = g.p, k = p.k, mx = g.lvl("passive") >= 3 ? 14 : 10; c.save(); c.fillStyle = k.ribs >= mx ? "#ffffff" : "#ff9ac8"; c.font = "900 11px system-ui"; c.textAlign = "center"; c.fillText(`扇骨 ${k.ribs}/${mx}`, p.x, p.y + 52); c.restore(); },
  preview: (t) => ({ mode: 0, aux: (Math.sin(t * 2) + 1) / 2 }),
};
void H;

========== 來源：004/src/game/skills/yoyo.ts ==========
// 繞星 YOYO：與機體相連的牽絲溜溜球（球與絲線皆有傷害）＋慣性加成＋環球旋舞＋彗星繞線
import type { ShipKit } from "./common";
import { mkFx, foes, lineDmg, cutLine, densest, ultBackdrop, banner, timeline } from "./common";
import { EXT_BASE_RW as B, } from "../render/pbStylesExt";
import { pbStyle } from "../render/sprites";
import { W, H, TAU, easeOut, dist2, clamp } from "../constants";
import type { Game } from "../engine/Game";
import type { PBullet } from "../entities";
const bonus = (g: Game) => [0.4, 0.4, 0.55, 0.55, 0.7, 0.7, 0.9][g.lvl("passive") - 1];
function sprite(c: CanvasRenderingContext2D, x: number, y: number, rot: number, s: number) { const st = pbStyle(B + 4); c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.drawImage(st.cv, -st.w / 2, -st.h / 2); c.restore(); }
function thread(c: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, a = 1) { c.save(); c.globalAlpha = a; c.lineCap = "round"; c.strokeStyle = "rgba(53,232,255,.4)"; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 1.4; c.stroke(); c.restore(); }
export const yoyoKit: ShipKit = {
  init(g) { g.p.k = { side: 1, mom: 0, aux: 0 }; },
  update(g, dt) { const p = g.p, k = p.k; k.mom += (Math.min(1, Math.abs(p.vx) / 380) - k.mom) * Math.min(1, dt * 6); k.aux = k.mom; },
  fire(g) {
    const p = g.p, k = p.k, lw = g.lvl("weapon"); const sides = lw >= 7 ? [-1, 1] : [(k.side *= -1)];
    for (const s of sides) { const b = g.spawnPB(p.x, p.y - 10, -Math.PI / 2, 0, B + 4, 20 * g.dmgMult(), { kind: 20, src: 2, r: 0, pierce: 999, life: 1.8 }); b.a = s; b.b = 0; b.c = 0; b.spin = 18; b.hits.length = 0; }
    g.audio("shoot5", 0.05); p.fireT += (lw >= 7 ? 1.25 : 0.7) / (p.s.rate * g.ship.base.rate);
  },
  updateBullet(g, b: PBullet, dt) {
    if (b.style !== B + 4 || b.src !== 2 || b.r !== 0 || b.life > 2) return; const p = g.p, lw = g.lvl("weapon"), lp = g.lvl("passive"), T = b.t, spinT = lw >= 3 ? 0.78 : 0.5, out = 0.42, back = 0.38, dur = out + spinT + back;
    const reach = 250 * (lp >= 5 ? 1.2 : 1) * (lw >= 7 ? 1.15 : 1); let ox: number, oy: number, spinning = false;
    if (T < out) { const u = easeOut(T / out); ox = b.a * 60 * u; oy = -reach * u; } else if (T < out + spinT) { spinning = true; if (b.b === 0) { b.b = 1; if (lw >= 3) for (let i = 0; i < 4; i++) { const q = g.spawnPB(p.x + b.a * 60, p.y - reach, (i * TAU) / 4 + 0.4, 520, B + 5, 10 * g.dmgMult(), { src: 2, pierce: 1 }); q.life = 0.7; q.spin = 10; } } ox = b.a * 60 + Math.sin(T * 12) * 8; oy = -reach + Math.cos(T * 9) * 6; }
    else { const u = (T - out - spinT) / back, e2 = u * u; if (b.b === 1) { b.b = 2; if (lw >= 5) g.aoe(p.x + b.a * 60, p.y - reach, 64, 30 * 1.5 * g.dmgMult(), { noFx: true, noText: true }); } ox = b.a * 60 * (1 - e2); oy = -reach * (1 - e2); }
    b.x = p.x + ox; b.y = p.y + oy; b.rot += 18 * dt; b.c -= dt;
    if (b.c <= 0) { b.c = 0.1; const m = 1 + bonus(g) * p.k.mom, rr = spinning ? 54 : 36, dmg = b.dmg * m * (spinning ? 1 : 0.6); for (const e of foes(g)) if (dist2(b.x, b.y, e.x, e.y) < (rr + e.r * e.scale) ** 2) g.damageEnemy(e, dmg, { noText: !spinning });
      lineDmg(g, p.x, p.y, b.x, b.y, 7, dmg * 0.28, { noText: true }); if (lp >= 7 && p.k.mom > 0.8) { const q = g.spawnPB(b.x, b.y, Math.PI / 2 + (Math.random() - 0.5), 200, B + 5, 8 * g.dmgMult(), { src: 2 }); q.life = 0.5; } }
    if (T >= dur) g.pb.kill(b);
  },
  castActive(g) {
    const la = g.lvl("active"), n = la >= 7 ? 3 : la >= 3 ? 2 : 1, dur = 4.6; banner(g, "環球旋舞", "轉起來，全場都是我的舞台", "#35e8ff", 1.0); let t = 0, tk = 0, st = 0;
    mkFx(g, 1, (dt) => { t += dt; tk -= dt; st -= dt; const p = g.p, R = 150 + (la >= 5 ? Math.sin(t * 2.2) * 70 : 0);
      if (tk <= 0) { tk = 0.06; for (let i = 0; i < n; i++) { const a = t * 7 * (i % 2 ? -1 : 1) + (i * TAU) / n, x = p.x + Math.cos(a) * R, y = p.y + Math.sin(a) * R; for (const e of foes(g)) if (dist2(x, y, e.x, e.y) < (42 + e.r) ** 2) g.damageEnemy(e, 24 * g.dmgMult(), { noText: true }); g.clearBullets(x, y, 38, "coin"); if (la >= 7 && st <= 0) { const q = g.spawnPB(x, y, a, 420, B + 5, 12 * g.dmgMult(), { src: 2, pierce: 1 }); q.life = 0.8; } } if (st <= 0) st = 0.25; }
      return t < dur; }, (c) => { const p = g.p, R = 150 + (la >= 5 ? Math.sin(t * 2.2) * 70 : 0), al = Math.min(1, (dur - t) * 3, t * 6); c.save(); c.globalAlpha = al; for (let i = 0; i < n; i++) { const a = t * 7 * (i % 2 ? -1 : 1) + (i * TAU) / n, x = p.x + Math.cos(a) * R, y = p.y + Math.sin(a) * R; thread(c, p.x, p.y, x, y, 0.8); sprite(c, x, y, t * 16, 1.9); } c.globalCompositeOperation = "lighter"; c.strokeStyle = "rgba(53,232,255,.25)"; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, R, 0, TAU); c.stroke(); c.restore(); });
  },
  castUlt(g) {
    const lu = g.lvl("ult"), m = g.dmgMult(); g.p.formT = 5.2; g.p.inv = Math.max(g.p.inv, 6.2); ultBackdrop(g, 2, 5.2, "#031422", 0.6); banner(g, "彗星繞線", "轉起來吧", "#ffd43a", 1.4);
    const dur = 4.2, cx = W / 2, cy = H * 0.46, ys = lu >= 3 ? 2 : 1; const hist: number[][][] = [[], []]; let t = 0, tk = 0, slam = false, tx = 0, ty = 0, st = 0;
    const pos = (i: number, tt: number): [number, number] => { const u = Math.min(1, tt / dur), r = 40 + 215 * Math.sin(u * Math.PI * 0.5 + 0.0) * (1 - 0.15 * u), a = tt * 5 * (i ? -1 : 1) + i * Math.PI; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.4]; };
    mkFx(g, 1, (dt) => {
      t += dt; tk -= dt; for (let i = 0; i < ys; i++) { const q = slam ? [tx, ty] : pos(i, t); if (slam) { const h = hist[i][hist[i].length - 1] ?? [cx, cy]; const k = Math.min(1, (t - dur) / 0.3); q[0] = h[0] + (tx - h[0]) * 0.35; q[1] = h[1] + (ty - h[1]) * 0.35; void k; } hist[i].push([q[0], q[1]]); if (hist[i].length > 34) hist[i].shift(); }
      if (tk <= 0 && !slam) { tk = 0.05; for (let i = 0; i < ys; i++) { const h = hist[i], q = h[h.length - 1]; if (!q) continue; for (const e of foes(g)) if (dist2(q[0], q[1], e.x, e.y) < (64 + e.r) ** 2) g.damageEnemy(e, 170 * m, { noText: true }); if (st-- <= 0) { st = 2; for (let j = 1; j < h.length; j += 3) { lineDmg(g, h[j - 1][0], h[j - 1][1], h[j][0], h[j][1], 9, 55 * m, { noText: true }); if (lu >= 5) cutLine(g, h[j - 1][0], h[j - 1][1], h[j][0], h[j][1], 12, "coin"); } } } }
      if (!slam && t >= dur) { slam = true; const d = densest(g, 160); tx = d.x; ty = d.y; g.later(0.3, () => { const r = lu >= 7 ? 270 : 200; g.aoe(tx, ty, r, 1200 * m, { pal: "cyan" }); g.clearBullets(tx, ty, r, "coin"); g.fx.burst(tx, ty, 40, "#ffd43a", 150, 520, 0.8, 2.6); g.flash("#bff6ff", 0.6); g.shake(11, 0.5); g.audio("boom_l"); for (let i = 0; i < 16; i++) { const q = g.spawnPB(tx, ty, (i * TAU) / 16, 520, B + 5, 40 * m, { src: 2, pierce: 2 }); q.life = 0.9; q.spin = 12; } if (lu >= 7) for (let i = 0; i < 12; i++) g.later(i * 0.08, () => { const x = Math.random() * W, y = 100 + Math.random() * 500; g.fx.shard(x, y - 200, 0, 700, 0.3, 5, "#ffd43a", 0); g.later(0.3, () => g.aoe(x, y, 60, 140 * m, { pal: "gold", small: true })); }); }); }
      return t < dur + 0.8;
    }, (c) => {
      c.save(); for (let i = 0; i < ys; i++) { const h = hist[i]; if (h.length < 2) continue; c.lineCap = "round"; for (let j = 1; j < h.length; j++) { c.globalAlpha = (j / h.length) * 0.9; c.strokeStyle = "rgba(53,232,255,.5)"; c.lineWidth = 8 * (j / h.length); c.beginPath(); c.moveTo(h[j - 1][0], h[j - 1][1]); c.lineTo(h[j][0], h[j][1]); c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 1.6; c.stroke(); } const q = h[h.length - 1]; c.globalAlpha = 1; sprite(c, q[0], q[1], t * 18, 3.2); } c.restore();
    });
    timeline(g, []); void clamp; void H;
  },
  drawUnder(g, c) { for (const b of g.pb.items) if (b.alive && b.style === B + 4 && b.src === 2 && b.r === 0 && b.life < 2) { thread(c, g.p.x, g.p.y, b.x, b.y); sprite(c, b.x, b.y, b.rot, 1.4); } },
  preview: (t) => ({ mode: 0, aux: (Math.sin(t) + 1) / 2 }),
};

========== 來源：005/src/game/data/ships.ts ==========
// 六架界守戰機資料表（欄位依跨專案契約凍結）
import type { AtlasKey } from "../../assets";
import type { ShipId, SkillKey } from "../types";

export interface SkillInfo {
  name: string;
  en: string;
  icon: string;
  desc: string;
  evo: [string, string, string]; // Lv3 / Lv5 / Lv7
}
export interface ShipDef {
  id: ShipId;
  name: string;
  en: string;
  sigil: string;
  sigilEn: string;
  pilot: string;
  pilotEn: string;
  role: string;
  color: string;
  color2: string;
  dark: string;
  quote: string;
  lore: string;
  portrait: { sheet: AtlasKey; col: number; focus: number; cropR?: number; focusX?: number; zoom?: number };
  base: { hp: number; spd: number; atk: number; rate: number };
  radar: { atk: number; spd: number; def: number; rng: number; ease: number };
  activeCd: number;
  ultTime: number;
  skills: Record<SkillKey, SkillInfo>;
  cut: { line1: string; line2: string };
  cutin: { c1: string; c2: string; c3: string; angle: number };
}

export const SKILL_KEYS: SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = { weapon: "主武裝", passive: "被動", active: "主動技", ult: "奧義" };
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS = [3, 5, 7];
/** 新專案專用：奧義變身期間強制顯示第 4 階外觀（搬回母專案時保持空值） */
export const FORM_TIER3: ShipId[] = ["zangyou", "magatsu", "meien"];

export const SHIPS: Record<ShipId, ShipDef> = {
  // ───────────────────────── 禍津 ─────────────────────────
  magatsu: {
    id: "magatsu", name: "禍津", en: "MAGATSU", sigil: "魔爆", sigilEn: "CALAMITY",
    pilot: "禍織 瑠", pilotEn: "RU MAGAORI", role: "魔化爆破",
    color: "#ff3d6e", color2: "#b06bff", dark: "#1a0612",
    quote: "怕什麼？毀滅，本來就該很華麗。",
    lore: "出身魔域的少女界守。她的機體以「禍津魔核」為動力，彈幕越密、魔氣越盛——奧義發動時，機體與她本人一同魔化。",
    portrait: { sheet: "pilots_tka", col: 1, focus: 0.22, zoom: 1.0 },
    base: { hp: 90, spd: 320, atk: 1.1, rate: 0.9 },
    radar: { atk: 5, spd: 3, def: 2, rng: 3, ease: 3 },
    activeCd: 12, ultTime: 46,
    skills: {
      weapon: { name: "裂魂魔彈", en: "Soul Rend", icon: "orb", desc: "三連發後長歇。緩速魔彈飛行或命中後炸裂成扇形碎片，兼具單點與範圍壓制。", evo: ["Lv3　碎片數量增加，炸裂附帶小範圍爆風", "Lv5　每輪第三發為「大禍彈」，碎片再裂一次", "Lv7　碎片帶追蹤，裂片命中時產生連鎖小爆"] },
      passive: { name: "魔氣共鳴", en: "Dark Resonance", icon: "eye", desc: "身周 140 範圍內的敵彈會累積魔氣；集滿後進入「魔氣爆發」，魔彈放大並額外回充奧義。", evo: ["Lv3　魔氣吸收範圍擴大", "Lv5　爆發期間每秒回復少量耐久", "Lv7　爆發時額外在身周展開魔氣斬環"] },
      active: { name: "禍津陣", en: "Calamity Seal", icon: "ring", desc: "在腳下展開魔法陣 6 秒：吸收範圍內敵彈、持續灼蝕敵機，期滿時引爆。陣可以在原地等待敵人踏入。", evo: ["Lv3　魔陣半徑 +30，吸彈轉為奧義能量", "Lv5　期間每吸收 10 發敵彈追加魔陣斬擊", "Lv7　期滿爆炸擴大並留下殘燃魔陣 4 秒"] },
      ult: { name: "魔化解放・禍津終焉", en: "Calamity Ascension", icon: "demon", desc: "魔化為黑翼惡魔。多重魔陣連鎖崩落，最終「禍津終焉」以橫貫全場的巨大黑紅斬擊收尾。", evo: ["Lv3　魔陣數量 +6，連鎖更密", "Lv5　魔化期間彈幕強度與移速提升", "Lv7　終焉斬追加反斬，爆發範圍全螢幕"] },
    },
    cut: { line1: "魔化解放", line2: "禍津・終焉" },
    cutin: { c1: "#ff2a5e", c2: "#9a3dff", c3: "#12040c", angle: 0.2 },
  },
  // ───────────────────────── 冥焰 ─────────────────────────
  meien: {
    id: "meien", name: "冥焰", en: "MEIEN", sigil: "黑炎", sigilEn: "NETHER FLAME",
    pilot: "冥城 燼", pilotEn: "JIN MEIJOU", role: "追蹤灼燒",
    color: "#36e7ff", color2: "#8a7bff", dark: "#04101c",
    quote: "封印，本來就是為了這一刻解開。",
    lore: "封印右臂的寡言少年。冥焰機以黑炎光束追獵獵物，灼燒會在敵群間蔓延；封印完全解放時，冥府之龍將吞沒天空。",
    portrait: { sheet: "pilots_tka", col: 2, focus: 0.22, zoom: 1.0 },
    base: { hp: 100, spd: 340, atk: 1.0, rate: 1.0 },
    radar: { atk: 4, spd: 3, def: 3, rng: 4, ease: 3 },
    activeCd: 10, ultTime: 48,
    skills: {
      weapon: { name: "冥焰射線", en: "Nether Ray", icon: "beam", desc: "光束會緩緩轉向前方扇形內最近的敵人，持續照射傷害逐漸攀升（最高 +100%）。換目標後重新累積。", evo: ["Lv3　追蹤角度擴大，轉向更快", "Lv5　追加第二條副束鎖定次近目標", "Lv7　光束命中點引發黑炎爆，濺射周圍"] },
      passive: { name: "炎殺蔓延", en: "Creeping Ember", icon: "flame", desc: "被灼燒的敵機被擊墜時會爆成黑炎，點燃周圍敵人，形成連鎖。", evo: ["Lv3　爆炎半徑 +25%", "Lv5　蔓延時額外飛出追蹤炎彈", "Lv7　連鎖引爆回復耐久並回充奧義"] },
      active: { name: "墮日炎彈", en: "Fallen Sun", icon: "meteor", desc: "擲出黑炎彈追向最強的敵人，抵達後爆成一列依序噴發的炎柱，貫穿並灼燒。", evo: ["Lv3　炎柱 5→7 道", "Lv5　炎彈命中時先行震爆", "Lv7　炎柱二次噴發，帶範圍灼燒"] },
      ult: { name: "冥府降臨・黑龍葬炎", en: "Black Dragon Funeral", icon: "dragon", desc: "解開右臂封印，三段演出：黑炎聚集 → 冥府之龍橫掃全場吞噬敵彈與敵機 → 俯衝爆裂，天地盡黑。", evo: ["Lv3　龍的衝擊半徑與持續時間提升", "Lv5　龍額外迴旋一次，沿途留下炎柱", "Lv7　終焉爆裂分兩次爆發，全螢幕黑炎"] },
    },
    cut: { line1: "冥府降臨", line2: "黑龍・葬炎" },
    cutin: { c1: "#1ad8ff", c2: "#7a6bff", c3: "#02060c", angle: -0.12 },
  },
  // ───────────────────────── 貫日 ─────────────────────────
  kanjitsu: {
    id: "kanjitsu", name: "貫日", en: "KANJITSU", sigil: "日輪", sigilEn: "SOLAR LANCE",
    pilot: "日輪 煌", pilotEn: "KOU HINOWA", role: "穿透狙擊",
    color: "#ffd45e", color2: "#fff3c4", dark: "#2e2008",
    quote: "兩指之間，容得下一輪太陽。",
    lore: "界守中最年輕的騎士，以雙指為砲口。連射穿日針、蓄滿即發貫日槍；奧義「螺旋貫日」是可以掃動的巨大螺旋光束。",
    portrait: { sheet: "pilots_tkb", col: 2, focus: 0.22, zoom: 1.0 },
    base: { hp: 90, spd: 400, atk: 1.0, rate: 1.2 },
    radar: { atk: 4, spd: 5, def: 2, rng: 5, ease: 3 },
    activeCd: 12, ultTime: 45,
    skills: {
      weapon: { name: "穿日針", en: "Sun Needle", icon: "needle", desc: "高速並列穿透針連射；持續射擊每 2.4 秒蓄滿一發「貫日槍」，貫穿全線、威力 ×6。靜止或慢速移動時蓄力更快。", evo: ["Lv3　並列針 2→4 條", "Lv5　貫日槍蓄力縮短至 1.8 秒", "Lv7　貫日槍命中時分裂為三道追蹤光針"] },
      passive: { name: "日輪共鳴", en: "Solar Resonance", icon: "sun", desc: "擦彈會累積共鳴；每 12 次共鳴縮短主動技冷卻 1.5 秒，並讓下一發貫日槍立即蓄滿。", evo: ["Lv3　共鳴門檻降為 10 次", "Lv5　共鳴觸發時回充奧義 6%", "Lv7　共鳴觸發時全身發出日輪衝擊波"] },
      active: { name: "星軌稜鏡", en: "Orbit Prisms", icon: "prism", desc: "放出兩顆稜鏡衛星 8 秒：自動對最近敵人發射光針，並與機體連成光網，穿過光網的敵彈會被淨化成奧義能量。", evo: ["Lv3　稜鏡 +1 顆，持續 +2 秒", "Lv5　光網傷害敵機，並提升淨化量", "Lv7　稜鏡發射貫日光槍"] },
      ult: { name: "螺旋貫日・天照一閃", en: "Helix Solar Pierce", icon: "sun", desc: "雙指蓄勢，螺旋貫穿砲轟出——光束可隨機體左右掃動。結尾以「天照」光環放射八道光芒，席捲全場。", evo: ["Lv3　光束更粗，持續 +1 秒", "Lv5　光束傾斜幅度更大、掃蕩範圍更廣", "Lv7　天照光環二連，並清除全部敵彈"] },
    },
    cut: { line1: "螺旋貫日", line2: "天照・一閃" },
    cutin: { c1: "#ffe27a", c2: "#ff9a2e", c3: "#241804", angle: 0.1 },
  },
};

========== 來源：005/src/game/render/pbStylesExt.ts ==========
// 我方子彈擴充樣式（23+）：母專案既有槽 EXT_BASE=23，本專案批次槽自 170 起
// 繪製原點在畫布中心、彈頭朝上（-y）
export const EXT_BASE = 23; // 母專案既有槽，禁止修改
export const EXT_BASE_TK = 170; // 本專案批次槽

export interface ExtStyle {
  id: number;
  w: number;
  h: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  dir?: boolean;
  spin?: boolean;
}
type C = CanvasRenderingContext2D;

// ---- 小工具 ----
function vgrad(ctx: C, y0: number, y1: number, stops: [number, string][]) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
function rgrad(ctx: C, r: number, stops: [number, string][]) {
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}
function halo(ctx: C, r: number, color: string, a = 0.55) {
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, color);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.globalAlpha = a;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
function needle(ctx: C, w: number, h: number, top: string, bot: string, glowC?: string) {
  if (glowC) halo(ctx, Math.max(w, h) * 0.5, glowC, 0.45);
  ctx.fillStyle = vgrad(ctx, -h / 2, h / 2, [[0, top], [0.45, bot], [1, "rgba(0,0,0,0)"]]);
  ctx.beginPath();
  ctx.moveTo(0, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h * 0.1, w * 0.3, h / 2);
  ctx.lineTo(-w * 0.3, h / 2);
  ctx.quadraticCurveTo(-w / 2, -h * 0.1, 0, -h / 2);
  ctx.fill();
}
function crescent(ctx: C, w: number, h: number, top: string, mid: string, tip: string, rim = "#ffffff") {
  halo(ctx, w * 0.55, mid, 0.28);
  ctx.beginPath();
  ctx.moveTo(-w / 2, h / 2);
  ctx.quadraticCurveTo(-w * 0.32, -h * 0.55, 0, -h / 2);
  ctx.quadraticCurveTo(w * 0.32, -h * 0.55, w / 2, h / 2);
  ctx.quadraticCurveTo(w * 0.22, -h * 0.02, 0, -h * 0.08);
  ctx.quadraticCurveTo(-w * 0.22, -h * 0.02, -w / 2, h / 2);
  ctx.closePath();
  ctx.fillStyle = vgrad(ctx, -h / 2, h / 2, [[0, top], [0.35, mid], [1, tip]]);
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.85;
  ctx.lineWidth = Math.max(1.2, w * 0.018);
  ctx.beginPath();
  ctx.moveTo(-w * 0.44, h * 0.32);
  ctx.quadraticCurveTo(-w * 0.28, -h * 0.5, 0, -h * 0.47);
  ctx.quadraticCurveTo(w * 0.28, -h * 0.5, w * 0.44, h * 0.32);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
function orb(ctx: C, r: number, core: string, mid: string, edge: string, glowC?: string) {
  halo(ctx, r * 1.6, glowC || mid, 0.5);
  ctx.fillStyle = rgrad(ctx, r, [[0, core], [0.5, mid], [1, edge]]);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
}
function star4(ctx: C, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.3 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

const B = EXT_BASE_TK;
export const EXT_STYLES: ExtStyle[] = [
  // ───── 禍津 magatsu：魔彈系 ─────
  { id: B + 5, w: 40, h: 40, spin: true, dir: false, draw: (c) => { orb(c, 11, "#1a0710", "#7a0f2e", "#ff4d6d", "#ff2a55"); c.strokeStyle = "rgba(255,120,150,.9)"; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 15, 0.3, 2.2); c.stroke(); c.beginPath(); c.arc(0, 0, 15, 3.5, 5.3); c.stroke(); } },
  { id: B + 6, w: 68, h: 68, spin: true, dir: false, draw: (c) => { orb(c, 19, "#12040a", "#8a1233", "#ff3d66", "#ff2a55"); c.strokeStyle = "rgba(255,170,190,.95)"; c.lineWidth = 2.4; c.beginPath(); c.arc(0, 0, 26, 0.2, 2.3); c.stroke(); c.beginPath(); c.arc(0, 0, 26, 3.35, 5.45); c.stroke(); star4(c, 8, "rgba(255,210,220,.9)"); } },
  { id: B + 7, w: 16, h: 34, draw: (c) => needle(c, 14, 32, "#ffd0da", "#ff3d66", "#ff2a55") },
  { id: B + 8, w: 52, h: 52, spin: true, dir: false, draw: (c) => { halo(c, 26, "#b02a6a", 0.6); c.strokeStyle = "#ff6a94"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 18, 0, 7); c.stroke(); c.beginPath(); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 - Math.PI / 2; c.lineTo(Math.cos(a) * 18, Math.sin(a) * 18); } c.closePath(); c.stroke(); c.beginPath(); for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2 + Math.PI / 2; c.lineTo(Math.cos(a) * 18, Math.sin(a) * 18); } c.closePath(); c.stroke(); orb(c, 5, "#fff", "#ff7aa0", "#a01040"); } },
  // ───── 冥焰 meien：黑炎系 ─────
  { id: B + 9, w: 60, h: 60, spin: true, dir: false, draw: (c) => { halo(c, 30, "#27e6ff", 0.55); c.fillStyle = rgrad(c, 18, [[0, "#000"], [0.7, "#07101c"], [1, "#2de0ff"]]); c.beginPath(); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; const r = i % 2 ? 14 : 22; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); c.strokeStyle = "rgba(150,250,255,.9)"; c.lineWidth = 1.6; c.stroke(); } },
  { id: B + 10, w: 16, h: 46, draw: (c) => needle(c, 14, 44, "#c8fbff", "#1ad0ff", "#27e6ff") },
  { id: B + 11, w: 36, h: 64, draw: (c) => { halo(c, 34, "#27e6ff", 0.4); c.fillStyle = vgrad(c, -32, 32, [[0, "#d8ffff"], [0.2, "#12182c"], [1, "rgba(10,10,30,0)"]]); c.beginPath(); c.moveTo(0, -32); c.quadraticCurveTo(15, -8, 10, 30); c.lineTo(-10, 30); c.quadraticCurveTo(-15, -8, 0, -32); c.fill(); c.strokeStyle = "rgba(120,240,255,.8)"; c.lineWidth = 1.4; c.stroke(); } },
  // ───── 貫日 kanjitsu：光系 ─────
  { id: B + 22, w: 14, h: 56, draw: (c) => needle(c, 12, 54, "#ffffff", "#ffd45e", "#ffe9a0") },
  { id: B + 23, w: 50, h: 150, draw: (c) => { halo(c, 70, "#ffd45e", 0.4); c.fillStyle = vgrad(c, -72, 72, [[0, "#ffffff"], [0.3, "#fff0b8"], [0.7, "#ffc13a"], [1, "rgba(255,150,30,0)"]]); c.beginPath(); c.moveTo(0, -72); c.quadraticCurveTo(22, -20, 12, 72); c.lineTo(-12, 72); c.quadraticCurveTo(-22, -20, 0, -72); c.fill(); c.fillStyle = "rgba(255,255,255,.9)"; c.fillRect(-2.5, -60, 5, 120); } },
  { id: B + 24, w: 12, h: 44, draw: (c) => needle(c, 10, 42, "#ffffff", "#7fe9ff", "#5ee7ff") },
  { id: B + 25, w: 28, h: 28, spin: true, dir: false, draw: (c) => { halo(c, 14, "#ffd45e", 0.6); star4(c, 12, "#fff6cf"); c.rotate(Math.PI / 4); star4(c, 8, "#ffcf4d"); } },
];

========== 來源：005/src/game/render/shipDrawKanjitsu.ts ==========
// 貫日：雙指叉狀機首、日輪光環、鎏金劍翼；進化後日輪放射、雙環、光之翼
import { drawGear, fillPoly, flame, lin, mirror, rad } from "./shipUtil";
import type { Pt, ShipDrawOpts } from "./shipUtil";

export function drawKanjitsu(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const t = o.t;
  const T = o.tier;
  drawGear(ctx, o, false);
  // 日輪（機後）
  ctx.save();
  ctx.translate(0, 4);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rad(ctx, 0, 0, 4, 46, [[0, "rgba(255,243,196,.85)"], [0.5, "rgba(255,200,80,.35)"], [1, "rgba(255,150,30,0)"]]);
  ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
  if (T >= 1) {
    ctx.save();
    ctx.rotate(t * 0.9);
    const n = T >= 2 ? 16 : 12;
    for (let i = 0; i < n; i++) {
      ctx.rotate((Math.PI * 2) / n);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#ffe9a0";
      ctx.beginPath(); ctx.moveTo(-2.6, -34); ctx.lineTo(0, -(52 + (i % 2) * 10)); ctx.lineTo(2.6, -34); ctx.fill();
    }
    ctx.restore();
  }
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = "#ffd45e";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
  if (T >= 2) {
    ctx.save();
    ctx.rotate(-t * 1.3);
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "#fff3c4";
    ctx.beginPath(); ctx.arc(0, 0, 41, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
  // 光之翼（第 4 階）
  if (T >= 3) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const s of [-1, 1]) {
      for (let k = 0; k < 4; k++) {
        ctx.globalAlpha = 0.5 - k * 0.09;
        ctx.fillStyle = lin(ctx, s * 12, 0, s * 82, -30 + k * 14, [[0, "#fff3c4"], [1, "rgba(255,200,80,0)"]]);
        ctx.beginPath();
        ctx.moveTo(s * 12, -4 + k * 5);
        ctx.quadraticCurveTo(s * 50, -30 + k * 10 + Math.sin(t * 4 + k) * 2, s * (86 - k * 6), -34 + k * 14);
        ctx.quadraticCurveTo(s * 50, -10 + k * 10, s * 14, 4 + k * 6);
        ctx.fill();
      }
    }
    ctx.restore();
  }
  // 尾焰
  for (const s of [-1, 1]) flame(ctx, s * 8, 30, 22 + o.thrust * 14, 8, t + s, "#ffffff", "#ffb43a");
  // 尾翼
  for (const s of [-1, 1]) fillPoly(ctx, [[s * 6, 14], [s * 14, 30], [s * 16, 40], [s * 8, 34]], lin(ctx, 0, 14, 0, 40, [[0, "#fff6d0"], [1, "#d9892b"]]), "#fff3c4", 0.8);
  // 劍翼
  const wing: Pt[] = [[6, -8], [22, -2], [42, 16], [48, 30], [30, 25], [16, 23], [8, 28]];
  fillPoly(ctx, [...wing, ...mirror(wing)], lin(ctx, 0, -8, 0, 30, [[0, "#ffffff"], [0.5, "#ffe9a0"], [1, "#d9892b"]]), "#ffd45e", 1.4);
  ctx.strokeStyle = "rgba(180,110,20,.7)";
  ctx.lineWidth = 1;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(s * 12, 0); ctx.lineTo(s * 40, 20);
    ctx.moveTo(s * 12, 8); ctx.lineTo(s * 34, 22);
    ctx.stroke();
  }
  // 機身
  const body: Pt[] = [[0, -26], [4, -18], [8, 0], [7, 20], [3, 34]];
  fillPoly(ctx, [...body, ...mirror(body)], lin(ctx, -8, 0, 8, 0, [[0, "#d9a03a"], [0.5, "#ffffff"], [1, "#d9a03a"]]), "#ffd45e", 1.2);
  // 雙指叉（機首兩柄光槍）
  const charge = o.aux;
  for (const s of [-1, 1]) {
    fillPoly(ctx, [[s * 3, -6], [s * 6.4, -6], [s * 5.2, -42], [s * 4, -52], [s * 2.8, -42]], lin(ctx, 0, -52, 0, -6, [[0, "#ffffff"], [1, "#ffc13a"]]), "#fff3c4", 0.8);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55 + charge * 0.4 + Math.sin(t * 10 + s) * 0.1;
    ctx.fillStyle = rad(ctx, s * 4, -52, 0, 9 + charge * 6, [[0, "#fff"], [0.4, "#ffd45e"], [1, "rgba(255,160,40,0)"]]);
    ctx.beginPath(); ctx.arc(s * 4, -52, 9 + charge * 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  if (charge > 0.2) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "#fff6c4";
    ctx.lineWidth = 1.4;
    ctx.globalAlpha = charge;
    ctx.beginPath();
    ctx.moveTo(-4, -52);
    for (let i = 1; i < 6; i++) ctx.lineTo(-4 + i * 1.6, -52 + (i % 2 ? -3 : 3));
    ctx.lineTo(4, -52);
    ctx.stroke();
    ctx.restore();
  }
  // 座艙寶石
  ctx.fillStyle = rad(ctx, 0, 0, 0, 8, [[0, "#ffffff"], [0.45, "#7fe9ff"], [1, "#1a6aa8"]]);
  ctx.beginPath(); ctx.ellipse(0, 0, 4, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#ffd45e";
  ctx.lineWidth = 1;
  ctx.stroke();
  drawGear(ctx, o, true);
}

========== 來源：005/src/game/render/shipDrawMagatsu.ts ==========
// 禍津：蝙蝠翼惡魔機；進化後增生犄角、破碎光環、黑炎魔化
import { drawGear, fillPoly, flame, lin, mirror, rad } from "./shipUtil";
import type { Pt, ShipDrawOpts } from "./shipUtil";

export function drawMagatsu(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const t = o.t;
  const T = o.tier;
  const ex = T >= 3 ? 1.22 : 1;
  drawGear(ctx, o, false);
  // 黑炎氣場（第 4 階）
  if (T >= 3) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const ph = (t * 1.3 + i / 9) % 1;
      const x = Math.sin(i * 2.4 + t) * 34;
      ctx.globalAlpha = (1 - ph) * 0.55;
      ctx.fillStyle = i % 2 ? "#ff2a5e" : "#8a2aff";
      ctx.beginPath();
      ctx.moveTo(x, 20 - ph * 70);
      ctx.quadraticCurveTo(x + 7, 4 - ph * 70, x, -22 - ph * 70);
      ctx.quadraticCurveTo(x - 7, 4 - ph * 70, x, 20 - ph * 70);
      ctx.fill();
    }
    ctx.restore();
  }
  // 破碎光環（第 3 階起）
  if (T >= 2) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "#ff6a94";
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.75;
    ctx.translate(0, -4);
    ctx.rotate(t * 0.6);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, 40, i * 1.25, i * 1.25 + 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }
  // 蝙蝠翼：骨架＋膜
  const flap = Math.sin(t * 3.2) * 0.06;
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.scale(s * ex, ex);
    ctx.rotate(flap * s * s);
    const memb = new Path2D();
    memb.moveTo(7, -8);
    memb.quadraticCurveTo(26, -22, 52, -44); // 翼前緣
    memb.quadraticCurveTo(50, -26, 54, -10); // 翼尖→第一弧
    memb.quadraticCurveTo(44, -16, 42, 4);
    memb.quadraticCurveTo(36, -4, 30, 16);
    memb.quadraticCurveTo(22, 8, 12, 24);
    memb.lineTo(7, 18);
    memb.closePath();
    ctx.fillStyle = lin(ctx, 8, -20, 52, 10, [[0, "#c1123f"], [0.55, "#4a0a24"], [1, "#12040c"]]);
    ctx.fill(memb);
    ctx.strokeStyle = "#ff5a8a";
    ctx.lineWidth = 1.2;
    ctx.stroke(memb);
    // 翼骨
    ctx.strokeStyle = "#1a0610";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(8, -8); ctx.quadraticCurveTo(28, -24, 52, -44);
    ctx.moveTo(10, -4); ctx.lineTo(54, -10);
    ctx.moveTo(10, 2); ctx.lineTo(42, 4);
    ctx.moveTo(10, 8); ctx.lineTo(30, 16);
    ctx.stroke();
    // 魔紋發光縫
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55 + Math.sin(t * 4) * 0.2;
    ctx.strokeStyle = "#b06bff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(14, -6); ctx.lineTo(44, -26);
    ctx.moveTo(14, 0); ctx.lineTo(40, -6);
    ctx.stroke();
    ctx.restore();
    // 翼端魔球
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const oy = -44 + Math.sin(t * 3 + s) * 3;
    ctx.fillStyle = rad(ctx, 52, oy, 0, 12, [[0, "#fff"], [0.35, "#ff4d7a"], [1, "rgba(160,30,255,0)"]]);
    ctx.beginPath(); ctx.arc(52, oy, 12, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  // 尾刺與尾焰
  fillPoly(ctx, [[-3, 24], [3, 24], [0, 44]], "#1a0610", "#ff5a8a", 1);
  for (const s of [-1, 1]) flame(ctx, s * 7, 28, 18 + o.thrust * 12, 7, t + s, "#ff9acb", "#9a2aff");
  // 機身
  const body: Pt[] = [[0, -34], [5, -24], [9, -6], [8, 12], [5, 28], [0, 32]];
  fillPoly(ctx, [...body, ...mirror(body)], lin(ctx, -9, 0, 9, 0, [[0, "#12040c"], [0.5, "#6a1030"], [1, "#12040c"]]), "#ff5a8a", 1.2);
  ctx.strokeStyle = "rgba(255,90,140,.7)";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 24); ctx.stroke();
  // 犄角
  const horns = T >= 1 ? 2 : 1;
  for (let h = 0; h < horns; h++) {
    for (const s of [-1, 1]) {
      const k = 1 + h * 0.5;
      ctx.fillStyle = lin(ctx, 0, -48, 0, -20, [[0, "#ffd0dc"], [1, "#6a1030"]]);
      ctx.beginPath();
      ctx.moveTo(s * (5 + h * 4), -24);
      ctx.quadraticCurveTo(s * (14 + h * 6) * k, -34, s * (10 + h * 7) * k, -50 - h * 4);
      ctx.quadraticCurveTo(s * (8 + h * 3), -36, s * (2 + h * 3), -22);
      ctx.closePath();
      ctx.fill();
    }
  }
  // 魔眼座艙
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rad(ctx, 0, -8, 0, 9, [[0, "#fff"], [0.35, "#ff2a5e"], [1, "rgba(120,0,40,0)"]]);
  ctx.beginPath(); ctx.ellipse(0, -8, 5, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#12040c";
  ctx.beginPath(); ctx.ellipse(0, -8, 1.4, 6, 0, 0, Math.PI * 2); ctx.fill();
  drawGear(ctx, o, true);
}

========== 來源：005/src/game/render/shipDrawMeien.ts ==========
// 冥焰：龍首艦首的黑炎戰機（有鬃焰、四足爪翼與封印繃帶）；進化後封印鬆脫、冥火外溢
import { drawGear, fillPoly, flame, lin, mirror, rad } from "./shipUtil";
import type { Pt, ShipDrawOpts } from "./shipUtil";

export function drawMeien(ctx: CanvasRenderingContext2D, o: ShipDrawOpts) {
  const t = o.t;
  const T = o.tier;
  drawGear(ctx, o, false);
  // 冥火鬃焰（艦首兩側）
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const manes = 3 + T;
  for (const s of [-1, 1]) {
    for (let i = 0; i < manes; i++) {
      const ph = (t * 1.8 + i / manes + (s > 0 ? 0.3 : 0)) % 1;
      const bx = s * (6 + i * 2.4);
      const by = -24 + i * 6;
      ctx.globalAlpha = 0.85 - ph * 0.8;
      ctx.fillStyle = lin(ctx, bx, by, bx + s * 14, by + 30 + ph * 24, [[0, "#d8ffff"], [0.5, "#27e6ff"], [1, "rgba(60,80,255,0)"]]);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.quadraticCurveTo(bx + s * (10 + Math.sin(t * 8 + i) * 3), by + 8, bx + s * (5 + ph * 8), by + 26 + ph * 22);
      ctx.quadraticCurveTo(bx + s * 2, by + 10, bx, by);
      ctx.fill();
    }
  }
  ctx.restore();
  // 新月翼（刃羽）
  for (const s of [-1, 1]) {
    ctx.save();
    ctx.scale(s, 1);
    const feathers = 3 + (T >= 2 ? 1 : 0);
    for (let i = feathers - 1; i >= 0; i--) {
      const L = 30 + i * 8;
      const a = -0.5 - i * 0.2 + Math.sin(t * 2.2 + i) * 0.03;
      ctx.save();
      ctx.translate(8, -2 + i * 5);
      ctx.rotate(a + Math.PI * 0.5 * 0);
      fillPoly(ctx, [[0, 0], [L * 0.5, -5], [L, -2], [L * 0.62, 5], [4, 6]], lin(ctx, 0, 0, L, 0, [[0, "#0c1424"], [0.7, "#101c34"], [1, "#27e6ff"]]), "#27e6ff", 0.9);
      ctx.restore();
    }
    // 翼緣主刃
    fillPoly(ctx, [[8, -10], [24, -24], [44, -40], [38, -22], [30, -4], [18, 12], [8, 12]], lin(ctx, 8, -30, 44, 10, [[0, "#162038"], [1, "#05080f"]]), "#27e6ff", 1.2);
    ctx.restore();
  }
  // 尾焰
  for (const s of [-1, 1]) flame(ctx, s * 7, 30, 20 + o.thrust * 14, 8, t + s, "#d8ffff", "#27a8ff");
  // 脊刺與尾刃
  fillPoly(ctx, [[-2, 28], [2, 28], [0, 46]], "#0c1424", "#27e6ff", 0.8);
  // 機身（龍軀）
  const body: Pt[] = [[0, -20], [4, -14], [7, -4], [8, 12], [5, 30], [0, 34]];
  fillPoly(ctx, [...body, ...mirror(body)], lin(ctx, -8, 0, 8, 0, [[0, "#04070d"], [0.5, "#16223c"], [1, "#04070d"]]), "#27e6ff", 1);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.6 + Math.sin(t * 4) * 0.2;
  ctx.strokeStyle = "#27e6ff";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let y = -10; y < 28; y += 7) { ctx.moveTo(-5, y); ctx.lineTo(0, y + 4); ctx.lineTo(5, y); }
  ctx.stroke();
  ctx.restore();
  // 封印繃帶（第 2 階起，第 4 階鬆脫飄動）
  if (T >= 1) {
    ctx.strokeStyle = "#e8f0ff";
    ctx.lineWidth = 2.2;
    for (let i = 0; i < 4; i++) {
      const y = -4 + i * 8;
      ctx.beginPath();
      ctx.moveTo(-8, y + 3);
      ctx.lineTo(8, y - 3);
      ctx.stroke();
    }
    if (T >= 3) {
      ctx.strokeStyle = "rgba(232,240,255,.85)";
      ctx.lineWidth = 2.4;
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 8, 8);
        ctx.bezierCurveTo(s * 20, 16 + Math.sin(t * 6) * 3, s * 26, 26, s * (34 + Math.sin(t * 5) * 4), 40);
        ctx.stroke();
      }
    }
  }
  // 龍首艦首：上下顎、牙、角、眼
  const upper: Pt[] = [[0, -50], [3, -44], [7, -34], [9, -22], [6, -18], [0, -24]];
  fillPoly(ctx, [...upper, ...mirror(upper)], lin(ctx, 0, -50, 0, -18, [[0, "#1c2a4a"], [1, "#070b14"]]), "#27e6ff", 1);
  // 下顎（張開，隨時間輕微開闔）
  const jaw = 3 + Math.sin(t * 3) * 1.2;
  fillPoly(ctx, [[-5, -20 + jaw], [5, -20 + jaw], [3, -12 + jaw], [0, -9 + jaw], [-3, -12 + jaw]], "#0a1020", "#27e6ff", 0.9);
  // 牙
  ctx.fillStyle = "#e8fbff";
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.moveTo(s * 3, -22); ctx.lineTo(s * 4.4, -16 + jaw * 0.3); ctx.lineTo(s * 1.8, -21); ctx.fill();
  }
  // 犄角
  for (const s of [-1, 1]) {
    ctx.fillStyle = lin(ctx, 0, -34, s * 18, -50, [[0, "#1c2a4a"], [1, "#8ff6ff"]]);
    ctx.beginPath();
    ctx.moveTo(s * 5, -34);
    ctx.quadraticCurveTo(s * 14, -40, s * 20, -56);
    ctx.quadraticCurveTo(s * 11, -44, s * 3, -30);
    ctx.fill();
  }
  // 眼（青白發光）
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (const s of [-1, 1]) {
    ctx.fillStyle = rad(ctx, s * 5, -30, 0, 6, [[0, "#fff"], [0.4, "#27e6ff"], [1, "rgba(0,100,255,0)"]]);
    ctx.beginPath(); ctx.ellipse(s * 5, -30, 3.4, 1.8, s * 0.4, 0, Math.PI * 2); ctx.fill();
  }
  // 口中黑炎
  ctx.globalAlpha = 0.5 + Math.sin(t * 9) * 0.3;
  ctx.fillStyle = rad(ctx, 0, -14, 0, 9, [[0, "#d8ffff"], [1, "rgba(39,230,255,0)"]]);
  ctx.beginPath(); ctx.arc(0, -14 + jaw * 0.4, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  drawGear(ctx, o, true);
}

========== 來源：005/src/game/skills/kanjitsu.ts ==========
// 貫日（穿透狙擊）
// 一句話機制：雙指連射的穿透針，持續射擊自動蓄滿一發貫穿全線的「貫日槍」；擦彈累積日輪共鳴縮短冷卻；
//             稜鏡衛星與機體織成光網淨化敵彈；奧義「螺旋貫穿砲」是可左右掃動的巨大雙螺旋光束，收束於天照光環。
import { H, W, TAU, clamp, easeOut, rand } from "../constants";
import { audio } from "../audio";
import type { Enemy, PBullet } from "../entities";
import type { Game } from "../engine/Game";
import { EXT_BASE_TK } from "../render/pbStylesExt";
import { PAL } from "../render/fx";
import type { ShipKit } from "./common";
import { mkFx } from "./common";
import { envelope, letterbox, segDist, timedFx, ultBg, veil, vignette } from "./tkUtil";

const S = { needle: EXT_BASE_TK + 22, lance: EXT_BASE_TK + 23, prism: EXT_BASE_TK + 24, star: EXT_BASE_TK + 25 };
interface Prism { x: number; y: number; fire: number; lance: number }
interface Ult { t: number; dur: number; bStart: number; bEnd: number; tilt: number; tick: number; fin1: boolean; fin2: boolean; slow: boolean }
interface K { charge: number; reso: number; prismT: number; prisms: Prism[]; ult: Ult | null; netT: number; lanceHits: number }
const kk = (g: Game) => g.p.k as K;

/** 天照光環：向外擴散的光環與八道光芒 */
function tenshou(g: Game, x: number, y: number, n: number) {
  audio.sfx("ultgo");
  audio.sfx("boom_l", 0.1);
  g.flash("#fff8e0", 1);
  g.shake(18, 0.9);
  g.slowmo(0.4, 0.35);
  g.later(0.1, () => {
    const dm = (n === 2 ? 170 : 240) * g.dmgMult();
    for (const e of g.en.items) if (!e.dead) g.damageEnemy(e, dm, { crit: false });
    g.clearBullets(W / 2, H / 2, 3000, "coin");
    g.fx.explosion(x, y, 70, PAL.gold);
    for (let i = 0; i < 10; i++) g.fx.ring(x, y, 20, 260 + i * 70, 0.6 + i * 0.06, i % 2 ? "#ffd45e" : "#ffffff", 9);
    g.fx.burst(x, y, 80, "#fff3c4", 200, 900, 1, 3);
  });
  timedFx(g, 1.2, (ctx, u, t) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(x, y);
    const r = 80 + easeOut(u) * 800;
    const gr = ctx.createRadialGradient(0, 0, r * 0.5, 0, 0, r);
    gr.addColorStop(0, `rgba(255,255,255,${(1 - u) * 0.35})`);
    gr.addColorStop(0.9, `rgba(255,220,120,${(1 - u) * 0.9})`);
    gr.addColorStop(1, "rgba(255,160,40,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.rotate(t * 0.7);
    for (let i = 0; i < 8; i++) {
      ctx.rotate(TAU / 8);
      const gg = ctx.createLinearGradient(0, 0, 0, -r * 1.3);
      gg.addColorStop(0, `rgba(255,255,255,${1 - u})`);
      gg.addColorStop(1, "rgba(255,200,80,0)");
      ctx.fillStyle = gg;
      ctx.beginPath(); ctx.moveTo(-18 * (1 - u * 0.6), 0); ctx.lineTo(0, -r * 1.3); ctx.lineTo(18 * (1 - u * 0.6), 0); ctx.fill();
    }
    ctx.restore();
  }, 2);
}

function lance(g: Game, x: number, y: number, dmg: number, scale = 1) {
  const lv = g.lvl("weapon");
  const b = g.spawnPB(x, y, -Math.PI / 2, 1400, S.lance, dmg, { kind: 26, pierce: 99, life: 0.9, r: 20 * scale, src: 0 });
  b.scale = scale;
  b.a = lv;
  g.fx.ring(x, y, 6, 64, 0.25, "#fff3c4", 4);
  return b;
}

export const kanjitsuKit: ShipKit = {
  init(g) {
    g.p.k = { charge: 0, reso: 0, prismT: 0, prisms: [], ult: null, netT: 0, lanceHits: 0 } as K;
  },

  update(g, dt) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("weapon");
    const spdv = Math.hypot(p.vx, p.vy);
    const still = spdv < 70;
    const ct = lv >= 5 ? 1.8 : 2.4;
    if (!k.ult && g.state === "play") {
      k.charge = Math.min(1, k.charge + (dt / ct) * (still ? 1.5 : 1));
      if (k.charge >= 1) {
        k.charge = 0;
        k.lanceHits = 0;
        audio.sfx("laser", 0.1);
        lance(g, p.x, p.y - 50, 190);
        g.shake(3, 0.1);
      }
    }
    p.morph = k.ult ? 1 : k.charge;
    // 稜鏡衛星與光網
    if (k.prismT > 0) {
      k.prismT -= dt;
      const lvA = g.lvl("active");
      const n = lvA >= 3 ? 3 : 2;
      while (k.prisms.length < n) k.prisms.push({ x: p.x, y: p.y, fire: 0, lance: 2 });
      k.prisms.forEach((pr, i) => {
        const a = -Math.PI / 2 + (i - (n - 1) / 2) * 0.95 + Math.sin(g.time * 1.4 + i) * 0.08;
        const tx = p.x + Math.cos(a) * 125, ty = p.y + Math.sin(a) * 125;
        pr.x += (tx - pr.x) * Math.min(1, dt * 7);
        pr.y += (ty - pr.y) * Math.min(1, dt * 7);
        pr.fire -= dt;
        if (pr.fire <= 0) {
          const tgt = g.nearest(pr.x, pr.y, 700);
          if (tgt) {
            pr.fire = 0.16;
            g.spawnPB(pr.x, pr.y, Math.atan2(tgt.y - pr.y, tgt.x - pr.x), 950, S.prism, 14, { pierce: 2, life: 0.8, r: 5, src: 1 });
          }
        }
        if (lvA >= 7) {
          pr.lance -= dt;
          if (pr.lance <= 0) { pr.lance = 1.4; lance(g, pr.x, pr.y - 10, 90, 0.6); }
        }
      });
      // 光網：機體—稜鏡—稜鏡環狀連線
      const nodes = [{ x: p.x, y: p.y - 8 }, ...k.prisms.map((q) => ({ x: q.x, y: q.y }))];
      k.netT -= dt;
      const tickE = k.netT <= 0;
      if (tickE) k.netT = 0.1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i], b = nodes[(i + 1) % nodes.length];
        if (nodes.length === 3 && i === 2 && false) continue;
        for (let j = g.eb.items.length - 1; j >= 0; j--) {
          const eb = g.eb.items[j];
          if (segDist(eb.x, eb.y, a.x, a.y, b.x, b.y) < 12) {
            g.addUlt(lvA >= 5 ? 0.7 : 0.4);
            g.fx.glowP(eb.x, eb.y, 0, -40, 0.3, 7, "#fff3c4", 14, 0, 0.9);
            g.eb.kill(j);
          }
        }
        if (lvA >= 5 && tickE) {
          for (const e of g.en.items) if (!e.dead && segDist(e.x, e.y, a.x, a.y, b.x, b.y) < 16 + e.r) g.damageEnemy(e, 25 * g.dmgMult(), { crit: false, noText: true });
        }
      }
      if (k.prismT <= 0) k.prisms.length = 0;
    }
    if (k.ult) ultUpdate(g, k.ult, dt);
  },

  fire(g) {
    const p = g.p;
    const lv = g.lvl("weapon");
    p.fireT += 0.07 / g.rateMul();
    const n = (lv >= 3 ? 4 : 2) + (p.s.extra > 0 ? 2 : 0);
    audio.sfx("shoot1", 0.04);
    for (let i = 0; i < n; i++) {
      const x = p.x + (i - (n - 1) / 2) * 9;
      g.spawnPB(x, p.y - 40, -Math.PI / 2 + (i - (n - 1) / 2) * 0.012, 1100, S.needle, 15, { pierce: 3, life: 0.9, r: 5 });
    }
  },

  onGraze(g) {
    const p = g.p;
    const k = kk(g);
    const lvP = g.lvl("passive");
    k.reso++;
    if (k.reso >= (lvP >= 3 ? 10 : 12)) {
      k.reso = 0;
      p.activeCd = Math.max(0, p.activeCd - 1.5);
      k.charge = 1;
      g.fx.ring(p.x, p.y, 10, 90, 0.4, "#ffd45e", 5);
      audio.sfx("power", 0.1);
      if (lvP >= 5) g.addUlt(6);
      if (lvP >= 7) { g.aoe(p.x, p.y, 200, 120 * g.dmgMult(), { pal: "gold" }); g.clearBullets(p.x, p.y, 130, "coin"); }
    }
  },

  castActive(g) {
    const k = kk(g);
    const lv = g.lvl("active");
    k.prismT = 8 + (lv >= 3 ? 2 : 0);
    k.prisms = [];
    audio.sfx("lock", 0.1);
    g.fx.ring(g.p.x, g.p.y, 10, 140, 0.4, "#fff3c4", 5);
  },

  castUlt(g) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("ult");
    const bLen = 4.8 + (lv >= 3 ? 1 : 0);
    const dur = 1.7 + bLen + 1.5;
    p.formT = dur;
    p.inv = Math.max(p.inv, dur + 1);
    p.dmgMul = 1.15;
    const u: Ult = { t: 0, dur, bStart: 1.7, bEnd: 1.7 + bLen, tilt: 0, tick: 0, fin1: false, fin2: false, slow: false };
    k.ult = u;
    k.prismT = 0;
    k.prisms = [];
    audio.sfx("charge");
    g.slowmo(0.55, 1.2);
    g.clearBullets(p.x, p.y, 200, "coin");
    g.tint("#ffcf4d", 0.2, dur);
    mkFx(g, 0, () => u.t < u.dur + 0.3, (ctx) => {
      const a = envelope(u.t, u.dur, 0.9, 0.9);
      veil(ctx, 0.5 * a, "#1a1000");
      ultBg(ctx, g, 0.66 * a, 1.05 + Math.sin(u.t * 0.7) * 0.03);
      vignette(ctx, "rgba(120,70,0,.85)", 0.7 * a);
      letterbox(ctx, a * 0.5);
    });
    mkFx(g, 1, () => u.t < u.dur + 0.3, (ctx) => {
      const t = u.t;
      const ox = p.x, oy = p.y - 52;
      // 蓄勢：光環向槍口收束
      if (t < u.bStart + 0.2) {
        const cp = clamp(t / u.bStart, 0, 1);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 5; i++) {
          const ph = (t * 1.6 + i / 5) % 1;
          const r = 260 * (1 - ph) + 8;
          ctx.globalAlpha = (0.2 + cp * 0.6) * (1 - ph * 0.3);
          ctx.strokeStyle = i % 2 ? "#fff3c4" : "#ffd45e";
          ctx.lineWidth = 2 + (1 - ph) * 5;
          ctx.beginPath(); ctx.arc(ox, oy, r, 0, TAU); ctx.stroke();
        }
        const g1 = ctx.createRadialGradient(ox, oy, 0, ox, oy, 40 + cp * 60);
        g1.addColorStop(0, "rgba(255,255,255,.95)");
        g1.addColorStop(0.4, "rgba(255,210,80,.6)");
        g1.addColorStop(1, "rgba(255,160,30,0)");
        ctx.fillStyle = g1;
        ctx.globalAlpha = 0.5 + cp * 0.5;
        ctx.beginPath(); ctx.arc(ox, oy, 40 + cp * 60, 0, TAU); ctx.fill();
        ctx.restore();
      }
      // 螺旋貫穿砲
      if (t >= u.bStart && t < u.bEnd + 0.3) {
        const ang = -Math.PI / 2 + u.tilt;
        const lv2 = g.lvl("ult");
        const grow = clamp((t - u.bStart) / 0.25, 0, 1);
        const shrink = clamp((u.bEnd + 0.3 - t) / 0.3, 0, 1);
        const W0 = (lv2 >= 3 ? 120 : 100) * grow * shrink;
        const L = 1500;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(ang + Math.PI / 2);
        ctx.globalCompositeOperation = "lighter";
        // 外暈
        let gr = ctx.createLinearGradient(-W0 * 1.1, 0, W0 * 1.1, 0);
        gr.addColorStop(0, "rgba(255,140,30,0)");
        gr.addColorStop(0.3, "rgba(255,190,70,.35)");
        gr.addColorStop(0.5, "rgba(255,240,180,.55)");
        gr.addColorStop(0.7, "rgba(255,190,70,.35)");
        gr.addColorStop(1, "rgba(255,140,30,0)");
        ctx.fillStyle = gr;
        ctx.fillRect(-W0 * 1.1, -L, W0 * 2.2, L);
        // 雙螺旋
        for (let j = 0; j < 2; j++) {
          ctx.strokeStyle = j ? "#bff6ff" : "#ffe9a0";
          ctx.lineWidth = 12;
          ctx.globalAlpha = 0.9;
          ctx.lineCap = "round";
          ctx.beginPath();
          for (let s = 0; s <= L; s += 14) {
            const x = Math.sin(s * 0.045 - t * 18 + j * Math.PI) * W0 * 0.42;
            s === 0 ? ctx.moveTo(x, -s) : ctx.lineTo(x, -s);
          }
          ctx.stroke();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 4;
          ctx.stroke();
        }
        // 核心
        gr = ctx.createLinearGradient(-W0 * 0.3, 0, W0 * 0.3, 0);
        gr.addColorStop(0, "rgba(255,255,255,0)");
        gr.addColorStop(0.5, "rgba(255,255,255,.95)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gr;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(-W0 * 0.3, -L, W0 * 0.6, L);
        // 沿光束移動的光環
        ctx.strokeStyle = "#fff3c4";
        ctx.lineWidth = 3;
        for (let i = 0; i < 12; i++) {
          const s = ((t * 900 + i * 130) % 1500);
          ctx.globalAlpha = 0.7 * (1 - s / 1500);
          ctx.beginPath(); ctx.ellipse(0, -s, W0 * 0.55, 9, 0, 0, TAU); ctx.stroke();
        }
        // 槍口閃光
        const fl = ctx.createRadialGradient(0, 0, 0, 0, 0, W0 * 1.5);
        fl.addColorStop(0, "rgba(255,255,255,1)");
        fl.addColorStop(0.4, "rgba(255,210,90,.6)");
        fl.addColorStop(1, "rgba(255,150,30,0)");
        ctx.fillStyle = fl;
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(0, 0, W0 * 1.5, 0, TAU); ctx.fill();
        ctx.restore();
        // 頂端光暈
        const hit = beamEnd(g, u);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const tg = ctx.createRadialGradient(hit.x, hit.y, 0, hit.x, hit.y, W0 * 1.2);
        tg.addColorStop(0, "rgba(255,255,255,.9)");
        tg.addColorStop(1, "rgba(255,200,80,0)");
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.arc(hit.x, hit.y, W0 * 1.2, 0, TAU); ctx.fill();
        ctx.restore();
      }
    });
  },

  updateBullet(g, b: PBullet) {
    if (b.kind === 26 && Math.random() < 0.8) g.fx.glowP(b.x + rand(-8, 8), b.y + 40, 0, 120, 0.3, 6, "#ffd45e", 1, 0, 0.8);
  },

  onHit(g, b: PBullet, e: Enemy) {
    const k = kk(g);
    if (b.kind === 26 && b.a >= 7 && k.lanceHits < 12) {
      k.lanceHits += 3;
      for (let i = 0; i < 3; i++) g.spawnPB(e.x, e.y, rand(0, TAU), 700, S.prism, 20, { homing: 3, life: 1.1, pierce: 1, r: 5, src: 2 });
    }
  },

  drawOver(g, ctx) {
    const p = g.p;
    const k = kk(g);
    const t = g.time;
    // 蓄力環
    if (!k.ult) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "#ffd45e";
      ctx.lineWidth = 2.4;
      ctx.globalAlpha = 0.35 + k.charge * 0.6;
      ctx.beginPath(); ctx.arc(p.x, p.y - 52, 14 + (1 - k.charge) * 10, -Math.PI / 2, -Math.PI / 2 + TAU * k.charge); ctx.stroke();
      ctx.restore();
    }
    // 稜鏡衛星與光網
    if (k.prismT > 0 && k.prisms.length) {
      const nodes = [{ x: p.x, y: p.y - 8 }, ...k.prisms.map((q) => ({ x: q.x, y: q.y }))];
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const a = Math.min(1, k.prismT / 0.6);
      for (let i = 0; i < nodes.length; i++) {
        const A = nodes[i], B = nodes[(i + 1) % nodes.length];
        ctx.strokeStyle = "#fff3c4";
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7 * a;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        ctx.strokeStyle = "#ffd45e";
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.18 * a;
        ctx.stroke();
        const u = (t * 1.5 + i * 0.33) % 1;
        ctx.fillStyle = "#fff";
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u, 3, 0, TAU); ctx.fill();
      }
      for (const pr of k.prisms) {
        ctx.save();
        ctx.translate(pr.x, pr.y);
        ctx.rotate(t * 1.2);
        ctx.globalAlpha = a;
        const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
        g1.addColorStop(0, "rgba(255,255,255,.9)");
        g1.addColorStop(1, "rgba(255,200,80,0)");
        ctx.fillStyle = g1;
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#fff7d6";
        ctx.strokeStyle = "#ffd45e";
        ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(7, 0); ctx.lineTo(0, 11); ctx.lineTo(-7, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    }
  },
};

/** 光束終點：遇到第一個敵人或畫面頂端 */
function beamEnd(g: Game, u: Ult) {
  const p = g.p;
  const ang = -Math.PI / 2 + u.tilt;
  const ox = p.x, oy = p.y - 52;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  let best = 1500;
  for (const e of g.en.items) {
    if (e.dead) continue;
    const t = (e.x - ox) * dx + (e.y - oy) * dy;
    if (t > 0 && t < best && Math.abs((e.x - ox) * dy - (e.y - oy) * dx) < 60 + e.r) best = t;
  }
  const ty = oy + dy * best;
  const tyc = Math.max(ty, 0);
  const tt = dy < -0.01 ? (tyc - oy) / dy : best;
  return { x: ox + dx * Math.min(best, tt), y: oy + dy * Math.min(best, tt) };
}

function ultUpdate(g: Game, u: Ult, dt: number) {
  const p = g.p;
  const k = kk(g);
  const lv = g.lvl("ult");
  u.t += dt;
  // 蓄勢期：敵彈緩速、光粒聚集
  if (u.t < u.bStart) {
    for (const b of g.eb.items) b.slow = 0.2;
    if (Math.random() < 0.9) {
      const a = rand(0, TAU);
      g.fx.glowP(p.x + Math.cos(a) * 220, p.y - 52 + Math.sin(a) * 220, -Math.cos(a) * 260, -Math.sin(a) * 260, 0.8, rand(3, 7), "#ffd45e", 1, 0, 0.9);
    }
  }
  // 光束期
  if (u.t >= u.bStart && u.t < u.bEnd) {
    if (!u.slow) { u.slow = true; audio.sfx("ultgo"); audio.sfx("laser", 0.1); g.flash("#fff3c4", 0.6); g.shake(10, 0.5); }
    const maxTilt = lv >= 5 ? 0.55 : 0.36;
    const want = clamp(p.vx / 900, -1, 1) * maxTilt;
    u.tilt += (want - u.tilt) * Math.min(1, dt * 7);
    g.shake(3, 0.1);
    u.tick -= dt;
    if (u.tick <= 0) {
      u.tick = 0.06;
      const W0 = (lv >= 3 ? 120 : 100) * 0.6;
      const ox = p.x, oy = p.y - 52;
      const ang = -Math.PI / 2 + u.tilt;
      const x1 = ox + Math.cos(ang) * 1500, y1 = oy + Math.sin(ang) * 1500;
      const dm = 15 * g.dmgMult();
      for (const e of g.en.items) if (!e.dead && segDist(e.x, e.y, ox, oy, x1, y1) < W0 + e.r) g.damageEnemy(e, dm, { crit: false, noText: Math.random() < 0.65, noHitFx: Math.random() < 0.5 });
      for (let i = g.eb.items.length - 1; i >= 0; i--) {
        const b = g.eb.items[i];
        if (segDist(b.x, b.y, ox, oy, x1, y1) < W0 * 1.15) { g.score += 12; g.fx.glowP(b.x, b.y, 0, 0, 0.2, 8, "#fff3c4", 14, 0, 0.8); g.eb.kill(i); }
      }
      const e2 = beamEnd(g, u);
      g.fx.glowP(e2.x, e2.y, rand(-120, 120), rand(-60, 160), 0.4, rand(4, 9), "#fff3c4", 1, 1, 0.9);
      g.fx.spark(e2.x, e2.y, rand(-400, 400), rand(-100, 400), 0.35, 2, "#ffd45e");
    }
  }
  // 終幕：天照
  if (!u.fin1 && u.t >= u.bEnd + 0.4) {
    u.fin1 = true;
    tenshou(g, p.x, p.y - 40, 1);
  }
  if (lv >= 7 && !u.fin2 && u.t >= u.bEnd + 1.0) {
    u.fin2 = true;
    tenshou(g, W / 2, H * 0.45, 2);
  }
  if (u.t >= u.dur) {
    k.ult = null;
    p.formT = 0;
    p.dmgMul = 1;
    p.morph = 0;
    u.t = u.dur + 1;
  }
}
void S;

========== 來源：005/src/game/skills/magatsu.ts ==========
// 禍津（魔化爆破）
// 一句話機制：三連發後長歇的「分段魔彈」——飛行或命中後炸裂成碎片；身周敵彈越密魔氣越盛；
//             腳下魔陣吸彈灼蝕、期滿引爆；奧義魔化為黑翼惡魔，連鎖魔陣崩落，終以橫貫全場的「禍津終焉」收尾。
import { H, W, TAU, clamp, rand } from "../constants";
import { audio } from "../audio";
import type { PBullet } from "../entities";
import type { Game } from "../engine/Game";
import { EXT_BASE_TK } from "../render/pbStylesExt";
import { PAL } from "../render/fx";
import { drawBars, mkFx } from "./common";
import type { ShipKit } from "./common";
import { envelope, letterbox, segDist, timedFx, ultBg, veil, vignette } from "./tkUtil";

const S = { orb: EXT_BASE_TK + 5, big: EXT_BASE_TK + 6, shard: EXT_BASE_TK + 7, sigil: EXT_BASE_TK + 8 };

interface Sigil { x: number; y: number; t: number; wind: number; R: number; fired: boolean; chain: boolean }
interface Ult { t: number; dur: number; sigils: Sigil[]; next: number; fireT: number; ang: number; slashed: number; slashT: number; slashDir: number }
interface Seal { x: number; y: number; t: number; dur: number; R: number; n: number; tick: number; dps: boolean }
interface K { n: number; qi: number; qiOn: number; qiT: number; seal: Seal | null; remnant: Seal | null; ult: Ult | null; ringT: number }
const kk = (g: Game) => g.p.k as K;

/** 魔法陣：同心圓＋六芒星＋符文刻度 */
export function drawSigil(ctx: CanvasRenderingContext2D, x: number, y: number, R: number, rot: number, a: number, c1 = "#ff3d6e", c2 = "#b06bff") {
  if (a <= 0.01 || R < 2) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = a;
  const g1 = ctx.createRadialGradient(0, 0, R * 0.1, 0, 0, R);
  g1.addColorStop(0, "rgba(120,10,40,.35)");
  g1.addColorStop(0.8, "rgba(90,10,60,.25)");
  g1.addColorStop(1, "rgba(255,60,110,.35)");
  ctx.fillStyle = g1;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.lineCap = "round";
  ctx.strokeStyle = c1;
  ctx.lineWidth = Math.max(1.5, R * 0.025);
  ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.stroke();
  ctx.lineWidth = Math.max(1, R * 0.012);
  ctx.beginPath(); ctx.arc(0, 0, R * 0.86, 0, TAU); ctx.stroke();
  ctx.strokeStyle = c2;
  ctx.beginPath(); ctx.arc(0, 0, R * 0.52, 0, TAU); ctx.stroke();
  ctx.save();
  ctx.rotate(rot);
  // 符文刻度
  ctx.strokeStyle = c1;
  ctx.lineWidth = Math.max(1, R * 0.014);
  for (let i = 0; i < 48; i++) {
    const aa = (i / 48) * TAU;
    const l = i % 4 === 0 ? 0.1 : 0.05;
    ctx.beginPath();
    ctx.moveTo(Math.cos(aa) * R * 0.86, Math.sin(aa) * R * 0.86);
    ctx.lineTo(Math.cos(aa) * R * (0.86 + l), Math.sin(aa) * R * (0.86 + l));
    ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.rotate(-rot * 0.7);
  ctx.strokeStyle = c2;
  ctx.lineWidth = Math.max(1.4, R * 0.02);
  for (let k = 0; k < 2; k++) {
    ctx.beginPath();
    for (let i = 0; i <= 3; i++) {
      const aa = (i / 3) * TAU + (k ? Math.PI / 3 : 0) - Math.PI / 2;
      const px = Math.cos(aa) * R * 0.8, py = Math.sin(aa) * R * 0.8;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
  }
  ctx.restore();
  // 中心眼
  ctx.fillStyle = c1;
  ctx.beginPath(); ctx.ellipse(0, 0, R * 0.14, R * 0.06, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = "#12040c";
  ctx.beginPath(); ctx.ellipse(0, 0, R * 0.03, R * 0.06, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

function burst(g: Game, b: PBullet) {
  if (b.kind !== 21) return;
  b.kind = 0;
  const lv = g.lvl("weapon");
  const big = b.c === 2;
  const n = b.b + g.p.s.extra;
  const spread = big ? 2.6 : 2.2;
  const sub = big && lv >= 5;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 - spread / 2 + (spread * i) / Math.max(1, n - 1);
    if (sub) {
      const f = g.spawnPB(b.x, b.y, a, 330, S.orb, 18, { kind: 21, r: 7, life: 0.9, a: 0.32, b: 4, c: 1, spin: 6, src: 0 });
      f.dmg = b.dmg * 0.3;
    } else {
      const f = g.spawnPB(b.x, b.y, a, 480, S.shard, 1, { pierce: 1, life: 0.6, r: 6, homing: lv >= 7 ? 1.4 : 0, src: 0 });
      f.dmg = b.dmg * (big ? 0.5 : 0.42);
    }
  }
  g.fx.explosion(b.x, b.y, big ? 18 : 10, PAL.red);
  g.fx.ring(b.x, b.y, 4, big ? 70 : 44, 0.25, "#ff6a94", 3);
  if (lv >= 3) g.aoe(b.x, b.y, big ? 64 : 42, b.dmg * 0.45, { noFx: true, noText: true });
  audio.sfx("boom_s", 0.06);
  b.life = 0;
}

function sigilBlast(g: Game, x: number, y: number, R: number, dmg: number) {
  g.aoe(x, y, R, dmg, { pal: "red" });
  g.shake(4, 0.18);
  audio.sfx("boom_m", 0.05);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * TAU + rand(0, 1);
    g.spawnPB(x, y, a, 380, S.shard, 16, { pierce: 1, life: 0.55, r: 6, src: 2 });
  }
  timedFx(g, 0.45, (ctx, u) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const w = R * 0.62 * (1 - u * 0.5);
    const gr = ctx.createLinearGradient(x - w, 0, x + w, 0);
    gr.addColorStop(0, "rgba(255,40,90,0)");
    gr.addColorStop(0.5, "rgba(255,230,240,.95)");
    gr.addColorStop(1, "rgba(255,40,90,0)");
    ctx.globalAlpha = 1 - u;
    ctx.fillStyle = gr;
    ctx.fillRect(x - w, y - 400 * Math.min(1, u * 4 + 0.2), w * 2, 400 * Math.min(1, u * 4 + 0.2) + 20);
    ctx.restore();
  }, 1);
}

export const magatsuKit: ShipKit = {
  init(g) {
    g.p.k = { n: 0, qi: 0, qiOn: 0, qiT: 0, seal: null, remnant: null, ult: null, ringT: 0 } as K;
  },

  update(g, dt) {
    const p = g.p;
    const k = kk(g);
    const lvP = g.lvl("passive");
    // 魔氣：身周敵彈累積
    if (k.qiOn > 0) {
      k.qiOn -= dt;
      if (lvP >= 5) g.heal(3 * dt);
      if (lvP >= 7) {
        k.ringT -= dt;
        if (k.ringT <= 0) {
          k.ringT = 1.2;
          for (let i = 0; i < 12; i++) g.spawnPB(p.x, p.y, (i / 12) * TAU, 360, S.shard, 30, { pierce: 3, life: 0.7, r: 7, src: 2 });
          g.fx.ring(p.x, p.y, 10, 90, 0.3, "#ff6a94", 4);
        }
      }
      if (Math.random() < 0.6) g.fx.glowP(p.x + rand(-16, 16), p.y + rand(-10, 20), rand(-20, 20), -rand(40, 120), 0.6, rand(4, 8), Math.random() < 0.5 ? "#ff3d6e" : "#b06bff", 1, 0, 0.8);
    } else {
      const R = 140 + (lvP >= 3 ? 40 : 0);
      let n = 0;
      for (const b of g.eb.items) {
        const dx = b.x - p.x, dy = b.y - p.y;
        if (dx * dx + dy * dy < R * R) n++;
      }
      k.qi = clamp(k.qi + (n > 0 ? Math.min(40, n * 4.2) * dt : -3 * dt), 0, 100);
      if (k.qi >= 100) {
        k.qi = 0;
        k.qiOn = 6;
        g.addUlt(10);
        audio.sfx("evolve");
        g.toast("魔氣爆發！", "#ff6a94");
        g.flash("#ff3d6e", 0.3);
        g.fx.ring(p.x, p.y, 10, 160, 0.5, "#ff3d6e", 7);
      }
    }
    // 禍津陣
    for (const key of ["seal", "remnant"] as const) {
      const s = k[key];
      if (!s) continue;
      s.t += dt;
      s.tick -= dt;
      const doTick = s.tick <= 0;
      if (doTick) s.tick = 0.25;
      const lvA = g.lvl("active");
      if (!s.dps) {
        for (let i = g.eb.items.length - 1; i >= 0; i--) {
          const b = g.eb.items[i];
          const dx = b.x - s.x, dy = b.y - s.y;
          if (dx * dx + dy * dy < s.R * s.R) {
            s.n++;
            g.addUlt(lvA >= 3 ? 0.7 : 0.3);
            if (this.onGraze) { /* 魔陣吸彈不算擦彈 */ }
            g.fx.glowP(b.x, b.y, (s.x - b.x) * 2, (s.y - b.y) * 2, 0.3, 6, "#ff6a94", 1, 0, 0.8);
            g.eb.kill(i);
            if (lvA >= 5 && s.n % 10 === 0) {
              for (let j = 0; j < 6; j++) g.spawnPB(s.x, s.y, -Math.PI / 2 - 0.8 + j * 0.32, 520, S.shard, 40, { pierce: 2, life: 0.8, r: 7, src: 2, homing: 1 });
            }
          }
        }
      }
      if (doTick) {
        for (const e of g.en.items) {
          if (e.dead) continue;
          const dx = e.x - s.x, dy = e.y - s.y;
          const rr = s.R + e.r;
          if (dx * dx + dy * dy < rr * rr) {
            g.damageEnemy(e, 13 * g.dmgMult(), { crit: false, noText: true });
            e.burn = Math.max(e.burn, 1.5);
          }
        }
      }
      if (s.t >= s.dur) {
        if (!s.dps) {
          sigilBlast(g, s.x, s.y, s.R * 1.35, (110 + Math.min(s.n, 60) * 3) * g.dmgMult());
          if (lvA >= 7) k.remnant = { x: s.x, y: s.y, t: 0, dur: 4, R: s.R, n: 0, tick: 0, dps: true };
        }
        k[key] = null;
      }
    }
    if (k.ult) ultUpdate(g, k.ult, dt);
  },

  fire(g) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("weapon");
    const rate = g.rateMul();
    k.n++;
    const third = k.n % 3 === 0;
    p.fireT += (third ? 0.2 + 0.52 : 0.2) / rate;
    const bigMode = k.qiOn > 0 || (lv >= 5 && third);
    const form = p.form === 1;
    audio.sfx("shoot2", 0.05);
    for (const s of [-1, 1]) {
      const style = bigMode ? S.big : S.orb;
      const b = g.spawnPB(p.x + s * 11, p.y - 30, -Math.PI / 2 + s * 0.04, 380, style, bigMode ? 54 : 36, {
        kind: 21, r: bigMode ? 14 : 9, life: 1.3, spin: 5, a: bigMode ? 0.55 : 0.46, b: 5 + (lv >= 3 ? 2 : 0), c: bigMode ? 2 : 0,
      });
      void b;
    }
    if (form) {
      g.spawnPB(p.x, p.y - 34, -Math.PI / 2, 420, S.orb, 30, { kind: 21, r: 9, life: 1, spin: 5, a: 0.4, b: 7, c: 0 });
    }
    g.fx.glowP(p.x, p.y - 34, 0, -40, 0.15, 8, "#ff3d6e", 14, 0, 0.7);
  },

  castActive(g) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("active");
    k.seal = { x: p.x, y: p.y, t: 0, dur: 6, R: 150 + (lv >= 3 ? 30 : 0), n: 0, tick: 0, dps: false };
    audio.sfx("black", 0.2);
    g.fx.ring(p.x, p.y, 10, 170, 0.5, "#ff3d6e", 6);
  },

  castUlt(g) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("ult");
    const dur = 9.4;
    p.form = 1;
    p.formT = dur;
    p.inv = Math.max(p.inv, dur + 1);
    p.dmgMul = 1.3;
    p.speedMul = lv >= 5 ? 1.25 : 1.1;
    const u: Ult = { t: 0, dur, sigils: [], next: 1.6, fireT: 0, ang: 0, slashed: 0, slashT: 0, slashDir: 1 };
    k.ult = u;
    k.seal = null;
    audio.sfx("black");
    g.clearBullets(p.x, p.y, 3000, "coin");
    g.shake(10, 1.2);
    g.tint("#ff1a4a", 0.2, dur);
    // 背景層
    mkFx(g, 0, () => u.t < u.dur + 0.3, (ctx) => {
      const a = envelope(u.t, u.dur, 0.9, 0.9);
      veil(ctx, 0.62 * a, "#12020a");
      ultBg(ctx, g, 0.62 * a, 1.06 + Math.sin(u.t * 0.8) * 0.03);
      vignette(ctx, "rgba(160,10,50,.85)", 0.75 * a);
      // 紅色雷光
      if (Math.sin(u.t * 13) > 0.7) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255,70,120,.8)";
        ctx.lineWidth = 2;
        let x = rand(60, W - 60), y = 0;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let i = 0; i < 9; i++) { x += rand(-34, 34); y += H / 9; ctx.lineTo(x, y); }
        ctx.stroke();
        ctx.restore();
      }
      letterbox(ctx, a * 0.5);
    });
    // 前景：魔陣、巨大天陣、終焉斬
    mkFx(g, 1, () => u.t < u.dur + 0.3, (ctx) => {
      for (const s of u.sigils) {
        const w = clamp(s.t / s.wind, 0, 1);
        const a = s.fired ? Math.max(0, 1 - (s.t - s.wind) / 0.3) : 0.35 + w * 0.65;
        drawSigil(ctx, s.x, s.y, s.R * (0.4 + 0.6 * w), s.t * 3, a);
      }
      // 巨大天陣（終焉前）
      if (u.t > 6.3) {
        const e = clamp((u.t - 6.3) / 0.9, 0, 1);
        drawSigil(ctx, W / 2, H * 0.34, 330 * e, u.t * 0.9, e * 0.9);
      }
      if (u.slashT > 0) {
        const s = u.slashT / 0.4;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const d = u.slashDir;
        const x0 = d > 0 ? -60 : W + 60, y0 = -40;
        const x1 = d > 0 ? W + 60 : -60, y1 = H + 40;
        const pr = clamp(1 - s, 0, 1);
        const cx = x0 + (x1 - x0) * pr, cy = y0 + (y1 - y0) * pr;
        for (let k2 = 0; k2 < 3; k2++) {
          ctx.strokeStyle = k2 === 0 ? "#ff1a4a" : k2 === 1 ? "#ffd0dc" : "#ffffff";
          ctx.lineWidth = (72 - k2 * 24) * Math.max(0.1, s + 0.3);
          ctx.lineCap = "round";
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
        ctx.restore();
      }
    });
  },

  onPlayerHit() {},

  updateBullet(g, b) {
    if (b.kind === 21 && b.t >= b.a) burst(g, b);
  },
  onHit(g, b) {
    if (b.kind === 21) burst(g, b);
  },

  drawUnder(g, ctx) {
    const k = kk(g);
    for (const s of [k.seal, k.remnant]) {
      if (!s) continue;
      const a = Math.min(1, s.t / 0.4) * Math.min(1, (s.dur - s.t) / 0.5 + 0.3);
      const grow = Math.min(1, s.t / 0.35);
      drawSigil(ctx, s.x, s.y, s.R * (0.5 + 0.5 * grow), g.time * 1.4, a * (s.dps ? 0.55 : 0.95));
      if (!s.dps) {
        ctx.save();
        ctx.font = "900 13px Orbitron, sans-serif";
        ctx.textAlign = "center";
        ctx.fillStyle = "#ff9acb";
        ctx.fillText(String(s.n), s.x, s.y + 5);
        ctx.restore();
      }
    }
  },

  drawOver(g, ctx) {
    const p = g.p;
    const k = kk(g);
    if (k.qiOn <= 0) drawBars(ctx, p.x, p.y + 46, 44, k.qi / 100, "#ff3d6e", 3);
    else drawBars(ctx, p.x, p.y + 46, 44, k.qiOn / 6, "#ffd0dc", 3);
    if (p.form === 1 && k.ult) {
      // 魔化：黑炎與紅眼
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const t = g.time;
      for (let i = 0; i < 14; i++) {
        const ph = (t * 1.5 + i / 14) % 1;
        ctx.globalAlpha = (1 - ph) * 0.7;
        ctx.fillStyle = i % 2 ? "#ff1a4a" : "#6a1aff";
        const x = p.x + Math.sin(i * 2.7 + t * 2) * 26;
        ctx.beginPath();
        ctx.moveTo(x, p.y + 20 - ph * 90);
        ctx.quadraticCurveTo(x + 9, p.y - ph * 90, x, p.y - 28 - ph * 90);
        ctx.quadraticCurveTo(x - 9, p.y - ph * 90, x, p.y + 20 - ph * 90);
        ctx.fill();
      }
      ctx.restore();
    }
  },
};

function ultUpdate(g: Game, u: Ult, dt: number) {
  const p = g.p;
  const k = kk(g);
  const lv = g.lvl("ult");
  u.t += dt;
  const phaseB = u.t >= 1.5 && u.t < 6.3;
  // 魔化期間全向魔彈
  if (u.t > 0.8 && u.t < 6.6) {
    u.fireT -= dt;
    if (u.fireT <= 0) {
      u.fireT = 0.12;
      u.ang += 0.5;
      for (let i = 0; i < 4; i++) g.spawnPB(p.x, p.y - 20, u.ang + (i / 4) * TAU, 360, S.orb, 20, { kind: 21, r: 8, life: 1, spin: 5, a: 0.45, b: 5, c: 0 });
    }
  }
  // 連鎖魔陣崩落
  if (phaseB) {
    u.next -= dt;
    if (u.next <= 0 && u.sigils.length < 26) {
      u.next = lv >= 3 ? 0.13 : 0.19;
      const alive = g.en.items.filter((e) => !e.dead && e.y > 20 && e.y < H - 120);
      let x: number, y: number;
      if (alive.length && Math.random() < 0.65) {
        const e = alive[Math.floor(Math.random() * alive.length)];
        x = e.x + rand(-30, 30); y = e.y + rand(-30, 30);
      } else { x = rand(50, W - 50); y = rand(80, H * 0.7); }
      u.sigils.push({ x, y, t: 0, wind: 0.55, R: rand(70, 100), fired: false, chain: false });
    }
  }
  for (let i = u.sigils.length - 1; i >= 0; i--) {
    const s = u.sigils[i];
    s.t += dt;
    if (!s.fired && s.t >= s.wind) {
      s.fired = true;
      sigilBlast(g, s.x, s.y, s.R, 85 * g.dmgMult());
      if (!s.chain && Math.random() < 0.3 && u.t < 6) {
        for (let j = 0; j < 2; j++) u.sigils.push({ x: s.x + rand(-90, 90), y: s.y + rand(-90, 90), t: 0, wind: 0.3, R: 56, fired: false, chain: true });
      }
    }
    if (s.t > s.wind + 0.35) u.sigils.splice(i, 1);
  }
  // 終焉禍斬
  if (u.t >= 7.2 && u.slashed === 0) {
    u.slashed = 1;
    u.slashT = 0.4;
    u.slashDir = 1;
    finalSlash(g, 1);
  }
  if (lv >= 7 && u.t >= 7.55 && u.slashed === 1) {
    u.slashed = 2;
    u.slashT = 0.4;
    u.slashDir = -1;
    finalSlash(g, -1);
  }
  if (u.slashT > 0) u.slashT -= dt;
  if (u.t >= u.dur) {
    k.ult = null;
    p.form = 0;
    p.formT = 0;
    p.dmgMul = 1;
    p.speedMul = 1;
    u.t = u.dur + 1;
  }
}

function finalSlash(g: Game, dir: number) {
  audio.sfx("ultgo");
  g.flash(dir > 0 ? "#ffffff" : "#ff8aa8", 0.9);
  g.shake(18, 0.8);
  g.slowmo(0.4, 0.35);
  const x0 = dir > 0 ? -60 : W + 60, y0 = -40, x1 = dir > 0 ? W + 60 : -60, y1 = H + 40;
  const dmg = 420 * g.dmgMult() * (g.lvl("ult") >= 7 ? 0.8 : 1);
  g.later(0.1, () => {
    for (const e of g.en.items) {
      if (e.dead) continue;
      if (segDist(e.x, e.y, x0, y0, x1, y1) < 260 + e.r || e.boss) g.damageEnemy(e, dmg, { crit: false });
    }
    g.clearBullets(W / 2, H / 2, 3000, "coin");
    g.fx.explosion(W / 2, H / 2, 70, PAL.red);
    g.fx.burst(W / 2, H / 2, 60, "#ff6a94", 200, 800, 0.9, 3);
    for (let i = 0; i < 8; i++) g.fx.ring(W / 2, H / 2, 20, 300 + i * 70, 0.7 + i * 0.05, i % 2 ? "#ff1a4a" : "#b06bff", 8);
  });
}

========== 來源：005/src/game/skills/meien.ts ==========
// 冥焰（追蹤灼燒）
// 一句話機制：持續照射的黑炎光束會自動轉向前方最近的敵人，同一目標照越久越痛；被灼燒的敵人死亡時會把黑炎傳給鄰居；
//             奧義解開右臂封印，冥府黑龍橫掃全場吞噬彈幕，最後俯衝爆裂。
import { H, W, TAU, clamp, rand } from "../constants";
import { audio } from "../audio";
import type { Enemy } from "../entities";
import type { Game } from "../engine/Game";
import { EXT_BASE_TK } from "../render/pbStylesExt";
import { PAL } from "../render/fx";
import { drawBars, mkFx } from "./common";
import type { ShipKit } from "./common";
import { envelope, letterbox, pillar, segDist, timedFx, ultBg, veil, vignette } from "./tkUtil";

const S = { ball: EXT_BASE_TK + 9, needle: EXT_BASE_TK + 10, bolt: EXT_BASE_TK + 11 };
type Pt = { x: number; y: number };

interface Dragon { x: number; y: number; ang: number; trail: Pt[]; tgt: Enemy | null; retarget: number; speed: number; tick: number; fire: number }
interface Ult { t: number; dur: number; dragon: Dragon | null; boom: number; gather: number }
interface K { ang: number; ang2: number; ramp: number; lastId: number; hit: boolean; hit2: boolean; depth: number; ult: Ult | null; tickN: number; fb: boolean }
const kk = (g: Game) => g.p.k as K;

function ndiff(a: number, b: number) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

/** 冥府之龍頭部（朝 +x，長度約 130）：頭骨、上下顎、獠牙、眉脊、犄角、鬃焰、鬚 */
function drawDragonHead(ctx: CanvasRenderingContext2D, t: number, open: number) {
  ctx.save();
  // 鬃焰
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 9; i++) {
    const a = Math.PI + (i - 4) * 0.22;
    const L = 70 + (i % 3) * 18 + Math.sin(t * 9 + i) * 8;
    const g1 = ctx.createLinearGradient(-6, 0, Math.cos(a) * L, Math.sin(a) * L);
    g1.addColorStop(0, "rgba(220,255,255,.9)");
    g1.addColorStop(0.5, "rgba(39,230,255,.6)");
    g1.addColorStop(1, "rgba(80,60,255,0)");
    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.moveTo(-6, -8 + (i - 4) * 4);
    ctx.quadraticCurveTo(Math.cos(a) * L * 0.55, Math.sin(a) * L * 0.55 - 10, Math.cos(a) * L, Math.sin(a) * L);
    ctx.quadraticCurveTo(Math.cos(a) * L * 0.5, Math.sin(a) * L * 0.5 + 10, -6, 8 + (i - 4) * 4);
    ctx.fill();
  }
  ctx.restore();
  // 長鬚
  ctx.strokeStyle = "rgba(160,250,255,.9)";
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(52, s * 8);
    ctx.bezierCurveTo(30, s * (30 + Math.sin(t * 6) * 6), -20, s * (34 + Math.sin(t * 5 + 1) * 8), -70, s * (18 + Math.sin(t * 4) * 12));
    ctx.stroke();
  }
  // 犄角（後掠，雙層）
  for (const s of [-1, 1]) {
    for (let h = 0; h < 2; h++) {
      const k = h ? 0.62 : 1;
      const g2 = ctx.createLinearGradient(8, s * 14, -70 * k, s * 56 * k);
      g2.addColorStop(0, "#1a2540");
      g2.addColorStop(0.6, "#bff6ff");
      g2.addColorStop(1, "#ffffff");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.moveTo(12 - h * 4, s * (16 - h * 2));
      ctx.quadraticCurveTo(-18 * k, s * (40 * k + 6), -74 * k, s * (62 * k + 4));
      ctx.quadraticCurveTo(-30 * k, s * (36 * k), -6 - h * 4, s * (8 + h * 2));
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(10,20,40,.7)";
      ctx.lineWidth = 1;
      for (let r = 1; r < 5; r++) {
        const u = r / 5;
        ctx.beginPath();
        ctx.moveTo(10 - 80 * k * u, s * (16 + 46 * k * u * u + 6 * u));
        ctx.lineTo(10 - 80 * k * u - 3, s * (16 + 46 * k * u * u + 6 * u + 5));
        ctx.stroke();
      }
    }
  }
  // 耳鰭
  ctx.fillStyle = "#0a1428";
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-4 - i * 7, s * (14 + i * 3));
      ctx.lineTo(-24 - i * 12, s * (24 + i * 8));
      ctx.lineTo(-12 - i * 7, s * (10 + i * 2));
      ctx.fill();
      ctx.strokeStyle = "#27e6ff";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
  // 下顎（可張合）
  ctx.save();
  ctx.translate(2, 8);
  ctx.rotate(open);
  ctx.beginPath();
  ctx.moveTo(-2, 0);
  ctx.lineTo(54, 4);
  ctx.quadraticCurveTo(62, 8, 54, 12);
  ctx.lineTo(20, 22);
  ctx.quadraticCurveTo(0, 28, -8, 14);
  ctx.closePath();
  ctx.fillStyle = "#0c1830";
  ctx.fill();
  ctx.strokeStyle = "#27e6ff";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = "#f2fdff";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(14 + i * 9, 6);
    ctx.lineTo(18 + i * 9, -6 - (i % 2) * 3);
    ctx.lineTo(22 + i * 9, 6);
    ctx.fill();
  }
  ctx.restore();
  // 口中冥火
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const mg = ctx.createRadialGradient(34, 4, 0, 34, 4, 34);
  mg.addColorStop(0, "rgba(255,255,255,.95)");
  mg.addColorStop(0.4, "rgba(39,230,255,.7)");
  mg.addColorStop(1, "rgba(39,230,255,0)");
  ctx.fillStyle = mg;
  ctx.globalAlpha = 0.6 + Math.sin(t * 14) * 0.25;
  ctx.beginPath();
  ctx.arc(34, 4, 30, 0, TAU);
  ctx.fill();
  ctx.restore();
  // 頭骨（上顎）
  ctx.beginPath();
  ctx.moveTo(64, 2);
  ctx.quadraticCurveTo(66, -8, 54, -12);
  ctx.lineTo(30, -18);
  ctx.quadraticCurveTo(14, -30, -6, -22);
  ctx.quadraticCurveTo(-18, -4, -10, 14);
  ctx.lineTo(10, 14);
  ctx.lineTo(48, 8);
  ctx.closePath();
  const hg = ctx.createLinearGradient(0, -26, 0, 14);
  hg.addColorStop(0, "#26365c");
  hg.addColorStop(0.5, "#0e1830");
  hg.addColorStop(1, "#060b16");
  ctx.fillStyle = hg;
  ctx.fill();
  ctx.strokeStyle = "#27e6ff";
  ctx.lineWidth = 2;
  ctx.stroke();
  // 上獠牙
  ctx.fillStyle = "#f2fdff";
  for (const [x, l] of [[52, 12], [42, 15], [32, 11]] as [number, number][]) {
    ctx.beginPath();
    ctx.moveTo(x - 3, 8);
    ctx.lineTo(x, 8 + l);
    ctx.lineTo(x + 3, 8);
    ctx.fill();
  }
  // 眉脊與眼
  ctx.fillStyle = "#050a14";
  ctx.beginPath();
  ctx.moveTo(34, -14);
  ctx.quadraticCurveTo(18, -26, 0, -16);
  ctx.lineTo(4, -8);
  ctx.quadraticCurveTo(18, -14, 34, -6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "#27e6ff";
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#6fffff";
  ctx.beginPath();
  ctx.moveTo(30, -9);
  ctx.quadraticCurveTo(18, -16, 6, -8);
  ctx.quadraticCurveTo(18, -6, 30, -9);
  ctx.fill();
  const eg = ctx.createRadialGradient(18, -9, 0, 18, -9, 14);
  eg.addColorStop(0, "rgba(255,255,255,.9)");
  eg.addColorStop(1, "rgba(39,230,255,0)");
  ctx.fillStyle = eg;
  ctx.beginPath();
  ctx.arc(18, -9, 14, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#04080f";
  ctx.beginPath();
  ctx.ellipse(18, -10, 1.6, 4, 0.3, 0, TAU);
  ctx.fill();
  // 鼻孔
  ctx.fillStyle = "#9ff";
  ctx.beginPath();
  ctx.ellipse(56, -5, 2.2, 1.2, 0.4, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/** 龍身：沿軌跡的錐形帶，含鱗紋、背棘、前爪與冥火 */
function drawDragonBody(ctx: CanvasRenderingContext2D, trail: Pt[], t: number) {
  const n = trail.length;
  if (n < 3) return;
  const left: Pt[] = [], right: Pt[] = [];
  const widths: number[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = trail[Math.max(0, i - 1)], p1 = trail[Math.min(n - 1, i + 1)];
    let tx = p1.x - p0.x, ty = p1.y - p0.y;
    const l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    const u = i / (n - 1); // 0=頭 1=尾
    const w = (46 * (1 - u * 0.85) + 4) * (u < 0.08 ? 0.7 + u * 3.7 : 1);
    widths.push(w);
    left.push({ x: trail[i].x - ty * w * 0.5, y: trail[i].y + tx * w * 0.5 });
    right.push({ x: trail[i].x + ty * w * 0.5, y: trail[i].y - tx * w * 0.5 });
  }
  // 外圍冥火
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 2; i < n; i += 3) {
    const u = i / (n - 1);
    const ph = (t * 3 + i * 0.37) % 1;
    const p = trail[i];
    ctx.globalAlpha = (1 - u) * 0.65 * (1 - ph * 0.5);
    const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, widths[i] * 1.5);
    fg.addColorStop(0, "rgba(120,255,255,.8)");
    fg.addColorStop(1, "rgba(40,80,255,0)");
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(p.x + Math.sin(t * 7 + i) * 6, p.y + Math.cos(t * 6 + i) * 6, widths[i] * 1.5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
  // 身體
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  const hd = trail[0], tl = trail[n - 1];
  const bg = ctx.createLinearGradient(hd.x, hd.y, tl.x, tl.y);
  bg.addColorStop(0, "#1c2a50");
  bg.addColorStop(0.5, "#0a1226");
  bg.addColorStop(1, "#04060e");
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = "#27e6ff";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#27e6ff";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i].x, left[i].y);
  ctx.moveTo(right[0].x, right[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(right[i].x, right[i].y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  // 鱗紋（V 形）與腹板
  ctx.strokeStyle = "rgba(90,200,255,.55)";
  ctx.lineWidth = 1.2;
  for (let i = 3; i < n - 2; i += 2) {
    const a = left[i], b = right[i], c = trail[i], p1 = trail[i + 1];
    const dx = p1.x - c.x, dy = p1.y - c.y;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(c.x + dx * 0.9, c.y + dy * 0.9);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // 背棘
  ctx.fillStyle = "#cffaff";
  for (let i = 4; i < n - 3; i += 3) {
    const p0 = trail[i - 1], p1 = trail[i + 1];
    let tx = p1.x - p0.x, ty = p1.y - p0.y;
    const l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    const w = widths[i];
    const s = Math.max(5, w * 0.5);
    const c = trail[i];
    for (const side of [1, -1]) {
      const bx = c.x - ty * side * w * 0.5, by = c.y + tx * side * w * 0.5;
      ctx.beginPath();
      ctx.moveTo(bx + tx * s * 0.5, by + ty * s * 0.5);
      ctx.lineTo(bx - ty * side * s * 1.1 - tx * s, by + tx * side * s * 1.1 - ty * s);
      ctx.lineTo(bx - tx * s * 0.5, by - ty * s * 0.5);
      ctx.fill();
    }
  }
  // 前爪（兩對）
  for (const idx of [Math.floor(n * 0.16), Math.floor(n * 0.4)]) {
    const c = trail[idx], p0 = trail[Math.max(0, idx - 1)], p1 = trail[Math.min(n - 1, idx + 1)];
    let tx = p1.x - p0.x, ty = p1.y - p0.y;
    const l = Math.hypot(tx, ty) || 1;
    tx /= l; ty /= l;
    for (const side of [1, -1]) {
      const nx = -ty * side, ny = tx * side;
      const sw = Math.sin(t * 7 + idx + side) * 5;
      const kx = c.x + nx * widths[idx] * 0.5, ky = c.y + ny * widths[idx] * 0.5;
      const mx = kx + nx * 22 - tx * 10, my = ky + ny * 22 - ty * 10;
      const ex = mx + nx * 12 - tx * 18 + sw, ey = my + ny * 12 - ty * 18;
      ctx.strokeStyle = "#0c1830";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(kx, ky);
      ctx.quadraticCurveTo(mx, my, ex, ey);
      ctx.stroke();
      ctx.strokeStyle = "#27e6ff";
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.strokeStyle = "#f2fdff";
      ctx.lineWidth = 2.4;
      for (let f = -1; f <= 1; f++) {
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex + nx * 9 - tx * 4 + (-ty * f) * 6, ey + ny * 9 - ty * 4 + tx * f * 6);
        ctx.stroke();
      }
    }
  }
  // 尾端冥火
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const tp = trail[n - 1];
  const tg = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, 40);
  tg.addColorStop(0, "rgba(39,230,255,.8)");
  tg.addColorStop(1, "rgba(39,230,255,0)");
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.arc(tp.x, tp.y, 40, 0, TAU); ctx.fill();
  ctx.restore();
}

function flameColumn(g: Game, x: number, dmg: number, delay: number, w = 34) {
  g.later(delay, () => {
    audio.sfx("boom_s", 0.05);
    for (const e of g.en.items) if (!e.dead && Math.abs(e.x - x) < w + e.r) { g.damageEnemy(e, dmg, { crit: false }); e.burn = Math.max(e.burn, 3); }
    g.clearBullets(x, H / 2, 0, "coin", x, w * 2);
    for (let i = 0; i < 10; i++) g.fx.glowP(x + rand(-w, w), rand(100, H - 40), rand(-20, 20), -rand(100, 260), 0.8, rand(6, 14), i % 2 ? "#6fffff" : "#7a6bff", 0, 0.5, 0.8);
    timedFx(g, 0.6, (ctx, u) => {
      const a = u < 0.15 ? u / 0.15 : 1 - (u - 0.15) / 0.85;
      pillar(ctx, x, -20, H + 20, w * (0.6 + 0.4 * Math.min(1, u * 6)), a, "#ffffff", "#27e6ff", "#4a3aff");
      ctx.save();
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = "#04060e";
      ctx.fillRect(x - w * 0.25, -20, w * 0.5, H + 40);
      ctx.restore();
    }, 1);
  });
}

export const meienKit: ShipKit = {
  init(g) {
    g.p.k = { ang: -Math.PI / 2, ang2: -Math.PI / 2, ramp: 0, lastId: 0, hit: false, hit2: false, depth: 0, ult: null, tickN: 0, fb: false } as K;
  },

  update(g, dt) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("weapon");
    const cone = 0.55 + (lv >= 3 ? 0.3 : 0);
    const turn = (2.6 + (lv >= 3 ? 1.8 : 0)) * dt;
    const ox = p.x, oy = p.y - 38;
    // 目標：扇形內最近兩隻
    const list: { e: Enemy; d: number; a: number }[] = [];
    for (const e of g.en.items) {
      if (e.dead || e.y < -20 || e.y > p.y) continue;
      const a = Math.atan2(e.y - oy, e.x - ox);
      if (Math.abs(ndiff(a, -Math.PI / 2)) > cone) continue;
      list.push({ e, d: (e.x - ox) ** 2 + (e.y - oy) ** 2, a });
    }
    list.sort((a, b) => a.d - b.d);
    const want = list[0] ? list[0].a : -Math.PI / 2 + Math.sin(g.time * 1.3) * 0.08;
    k.ang += clamp(ndiff(want, k.ang), -turn, turn);
    const id = list[0] ? list[0].e.uid : 0;
    if (id !== k.lastId) { k.ramp *= 0.3; k.lastId = id; }
    const want2 = list[1] ? list[1].a : k.ang;
    k.ang2 += clamp(ndiff(want2, k.ang2), -turn, turn);
    k.fb = lv >= 5 && !!list[1];
    if (k.ult) ultUpdate(g, k.ult, dt);
  },

  fire(g) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("weapon");
    p.fireT += 0.1 / g.rateMul();
    k.tickN++;
    const ox = p.x, oy = p.y - 38;
    const ramp = 1 + k.ramp / 2;
    const dm = g.dmgMult();
    const shoot = (ang: number, mul: number, main: boolean) => {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      let hit = 0;
      let first: Enemy | null = null;
      let fd = 1e9;
      for (const e of g.en.items) {
        if (e.dead) continue;
        const t = (e.x - ox) * dx + (e.y - oy) * dy;
        if (t < 0 || t > 900) continue;
        const px = ox + dx * t, py = oy + dy * t;
        const rr = 13 + e.r;
        if ((e.x - px) ** 2 + (e.y - py) ** 2 > rr * rr) continue;
        hit++;
        if (t < fd) { fd = t; first = e; }
        g.damageEnemy(e, 30 * dm * mul * ramp, { noText: k.tickN % 3 !== 0, noHitFx: k.tickN % 2 === 0 });
        if (Math.random() < 0.3) e.burn = Math.max(e.burn, 2.6);
      }
      if (main) { k.hit = hit > 0; if (hit > 0) k.ramp = Math.min(2, k.ramp + 0.1); else k.ramp = Math.max(0, k.ramp - 0.2); }
      else k.hit2 = hit > 0;
      if (first && lv >= 7 && k.tickN % 4 === 0) {
        g.aoe(first.x, first.y, 48, 28 * dm * mul, { noFx: true, noText: true, burn: true });
        g.fx.explosion(first.x, first.y, 8, PAL.cyan);
      }
    };
    shoot(k.ang, 1, true);
    if (k.fb) shoot(k.ang2, 0.5, false);
    if (k.tickN % 5 === 0) audio.sfx("shoot4", 0.1);
    // 源頭火花
    g.fx.glowP(ox, oy, rand(-20, 20), -rand(30, 90), 0.2, 6, "#6fffff", 1, 0, 0.8);
  },

  castActive(g) {
    const p = g.p;
    let tgt: Enemy | null = null;
    for (const e of g.en.items) if (!e.dead && e.y > 10 && e.y < p.y - 40 && (!tgt || e.hp > tgt.hp)) tgt = e;
    const lv = g.lvl("active");
    let x = p.x, y = p.y - 40;
    let tx = tgt ? tgt.x : p.x, ty = tgt ? tgt.y : 120;
    let t = 0;
    const trail: Pt[] = [];
    let done = false;
    audio.sfx("charge", 0.2);
    mkFx(g, 1, (dt) => {
      t += dt;
      if (tgt && !tgt.dead) { tx = tgt.x; ty = tgt.y; }
      const dx = tx - x, dy = ty - y;
      const d = Math.hypot(dx, dy) || 1;
      const sp = Math.min(760, 260 + t * 1400);
      x += (dx / d) * sp * dt;
      y += (dy / d) * sp * dt;
      trail.push({ x, y });
      if (trail.length > 16) trail.shift();
      if (Math.random() < 0.8) g.fx.glowP(x + rand(-8, 8), y + rand(-8, 8), rand(-20, 20), rand(20, 70), 0.4, 7, "#6fffff", 1, 0, 0.8);
      if (!done && (d < 34 || t > 1.8)) {
        done = true;
        audio.sfx("boom_l", 0.1);
        g.shake(8, 0.4);
        g.flash("#6fffff", 0.3);
        const dm = g.dmgMult();
        if (lv >= 5) g.aoe(x, y, 120, 90 * dm, { pal: "cyan", burn: true });
        else g.fx.explosion(x, y, 30, PAL.cyan);
        const n = lv >= 3 ? 7 : 5;
        for (let i = 0; i < n; i++) {
          const off = (i - (n - 1) / 2) * 62;
          flameColumn(g, clamp(x + off, 20, W - 20), 70 * dm, 0.06 + Math.abs(i - (n - 1) / 2) * 0.1);
          if (lv >= 7) flameColumn(g, clamp(x + off + 31, 20, W - 20), 45 * dm, 0.7 + Math.abs(i - (n - 1) / 2) * 0.08);
        }
      }
      return !done;
    }, (ctx) => {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < trail.length; i++) {
        const u = i / trail.length;
        ctx.globalAlpha = u * 0.7;
        ctx.fillStyle = "#27e6ff";
        ctx.beginPath(); ctx.arc(trail[i].x, trail[i].y, 6 + u * 14, 0, TAU); ctx.fill();
      }
      ctx.restore();
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(t * 8);
      ctx.fillStyle = "#04060e";
      ctx.strokeStyle = "#6fffff";
      ctx.lineWidth = 2.5;
      ctx.shadowColor = "#27e6ff";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU; const r = i % 2 ? 14 : 26; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
  },

  castUlt(g) {
    const p = g.p;
    const k = kk(g);
    const lv = g.lvl("ult");
    const dur = 8.6 + (lv >= 3 ? 0.8 : 0) + (lv >= 5 ? 0.8 : 0);
    p.form = 1;
    p.formT = dur;
    p.inv = Math.max(p.inv, dur + 1);
    p.dmgMul = 1.2;
    const u: Ult = { t: 0, dur, dragon: null, boom: 0, gather: 0 };
    k.ult = u;
    audio.sfx("black");
    g.clearBullets(p.x, p.y, 3000, "coin");
    g.tint("#0a0a2a", 0.4, dur);
    // 背景層
    mkFx(g, 0, () => u.t < u.dur + 0.3, (ctx) => {
      const a = envelope(u.t, u.dur, 0.9, 0.9);
      veil(ctx, 0.66 * a, "#02050c");
      ultBg(ctx, g, 0.6 * a, 1.1 + Math.sin(u.t * 0.6) * 0.03);
      vignette(ctx, "rgba(10,40,120,.9)", 0.8 * a);
      letterbox(ctx, a * 0.5);
    });
    // 前景：聚火、封印環、龍
    mkFx(g, 1, () => u.t < u.dur + 0.3, (ctx) => {
      const t = u.t;
      if (t < 2.1) {
        const pr = clamp(t / 2.0, 0, 1);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < 38; i++) {
          const a = t * (3 + (i % 5) * 0.5) + (i / 38) * TAU * 3;
          const r = (280 - pr * 240) * (0.4 + ((i * 37) % 10) / 14) + 20;
          ctx.globalAlpha = 0.35 + pr * 0.5;
          ctx.fillStyle = i % 3 ? "#27e6ff" : "#1a1a50";
          ctx.beginPath(); ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.9, 3 + (i % 4), 0, TAU); ctx.fill();
        }
        // 符文環與繃帶
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = "#e8f0ff";
        ctx.lineWidth = 3;
        ctx.rotate(t * 1.8);
        for (let k2 = 0; k2 < 3; k2++) {
          ctx.beginPath();
          ctx.arc(0, 0, 70 + k2 * 16 + pr * 8, k2, k2 + 3.6 * (1 - pr * 0.6));
          ctx.stroke();
        }
        ctx.strokeStyle = "#27e6ff";
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); ctx.strokeRect(78, -4, 8, 8); }
        ctx.restore();
      }
      const d = u.dragon;
      if (d) {
        const a = clamp((u.t - 2.0) / 0.4, 0, 1);
        ctx.save();
        ctx.globalAlpha = a;
        drawDragonBody(ctx, d.trail, t);
        ctx.translate(d.x, d.y);
        ctx.rotate(d.ang);
        ctx.scale(1.25, 1.25);
        drawDragonHead(ctx, t, 0.28 + Math.sin(t * 8) * 0.14);
        ctx.restore();
      }
    });
  },

  onKill(g, e) {
    const k = kk(g);
    if (e.burn <= 0 || k.depth >= 4) return;
    const lv = g.lvl("passive");
    k.depth++;
    const R = 70 * (lv >= 3 ? 1.25 : 1);
    g.aoe(e.x, e.y, R, 60 * g.dmgMult(), { pal: "cyan", burn: true, skip: e.uid });
    g.fx.ring(e.x, e.y, 6, R, 0.3, "#27e6ff", 4);
    g.fx.glowP(e.x, e.y, 0, 0, 0.4, R * 0.6, "#04060e", R * 0.9, 0, 0.6);
    if (lv >= 5) for (let i = 0; i < 3; i++) g.spawnPB(e.x, e.y, rand(0, TAU), 340, S.bolt, 40, { homing: 2.6, life: 1.4, pierce: 1, r: 8, src: 2 });
    if (lv >= 7) { g.heal(2); g.addUlt(2.5); }
    k.depth--;
  },

  drawUnder(g, ctx) {
    const p = g.p;
    const k = kk(g);
    const ox = p.x, oy = p.y - 38;
    const t = g.time;
    const beam = (ang: number, w: number, a: number) => {
      const dx = Math.cos(ang), dy = Math.sin(ang);
      const nx = -dy, ny = dx;
      const N = 36;
      const L = 900;
      const pts: Pt[] = [];
      for (let i = 0; i <= N; i++) {
        const s = (i / N) * L;
        const wob = Math.sin(t * 22 - i * 0.7) * 2.2 * (1 + i / N);
        pts.push({ x: ox + dx * s + nx * wob, y: oy + dy * s + ny * wob });
      }
      const stroke = (width: number, col: string, ga: number, comp: GlobalCompositeOperation) => {
        ctx.globalCompositeOperation = comp;
        ctx.globalAlpha = ga * a;
        ctx.strokeStyle = col;
        ctx.lineWidth = width;
        ctx.beginPath();
        pts.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
        ctx.stroke();
      };
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      stroke(w * 3.2, "#2a3aff", 0.18, "lighter");
      stroke(w * 2.0, "#27e6ff", 0.45, "lighter");
      stroke(w * 1.15, "#04060e", 0.95, "source-over");
      stroke(w * 0.45, "#bffcff", 0.95, "lighter");
      ctx.restore();
    };
    ctx.save();
    beam(k.ang, 7 + k.ramp * 2.5, 1);
    if (k.fb) beam(k.ang2, 4, 0.8);
    // 槍口光
    ctx.globalCompositeOperation = "lighter";
    const gg = ctx.createRadialGradient(ox, oy, 0, ox, oy, 24);
    gg.addColorStop(0, "rgba(220,255,255,.95)");
    gg.addColorStop(1, "rgba(39,230,255,0)");
    ctx.fillStyle = gg;
    ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.arc(ox, oy, 24, 0, TAU); ctx.fill();
    ctx.restore();
  },

  drawOver(g, ctx) {
    const p = g.p;
    const k = kk(g);
    drawBars(ctx, p.x, p.y + 46, 40, k.ramp / 2, "#27e6ff", 3);
  },
};

function ultUpdate(g: Game, u: Ult, dt: number) {
  const p = g.p;
  const k = kk(g);
  const lv = g.lvl("ult");
  u.t += dt;
  // 階段一：封印解放（聚火）
  if (u.t < 2.0 && Math.random() < 0.8) {
    const a = rand(0, TAU);
    g.fx.glowP(p.x + Math.cos(a) * 160, p.y + Math.sin(a) * 160, -Math.cos(a) * 190, -Math.sin(a) * 190, 0.8, rand(3, 7), "#27e6ff", 1, 0, 0.9);
  }
  if (u.t >= 2.0 && !u.dragon) {
    u.dragon = { x: p.x, y: p.y - 30, ang: -Math.PI / 2, trail: [], tgt: null, retarget: 0, speed: 780, tick: 0, fire: 0 };
    audio.sfx("ultgo");
    g.flash("#6fffff", 0.8);
    g.shake(12, 0.6);
    g.fx.ring(p.x, p.y, 10, 380, 0.7, "#27e6ff", 12);
    for (let i = 0; i < 40; i++) u.dragon.trail.push({ x: p.x, y: p.y - 30 + i * 8 });
  }
  const d = u.dragon;
  if (d) {
    const attackEnd = u.dur - 1.6;
    const dm = g.dmgMult();
    if (u.t < attackEnd) {
      // 巡獵：定時重選目標
      d.retarget -= dt;
      if (d.retarget <= 0 || !d.tgt || d.tgt.dead) {
        d.retarget = 0.9;
        const alive = g.en.items.filter((e) => !e.dead && e.y > 10 && e.y < H - 80);
        d.tgt = alive.length ? alive.reduce((a, b) => ((a.x - d.x) ** 2 + (a.y - d.y) ** 2 < (b.x - d.x) ** 2 + (b.y - d.y) ** 2 ? (Math.random() < 0.35 ? b : a) : b)) : null;
      }
      const gx = d.tgt ? d.tgt.x : W / 2 + Math.sin(u.t * 1.7) * 200;
      const gy = d.tgt ? d.tgt.y : H * 0.35 + Math.cos(u.t * 1.3) * 150;
      const want = Math.atan2(gy - d.y, gx - d.x);
      d.ang += clamp(ndiff(want, d.ang), -3.4 * dt, 3.4 * dt);
      d.speed = 760 + (lv >= 3 ? 90 : 0);
    } else {
      // 階段三：俯衝至畫面中央
      const want = Math.atan2(H * 0.45 - d.y, W / 2 - d.x);
      d.ang += clamp(ndiff(want, d.ang), -5 * dt, 5 * dt);
      d.speed = 900;
      if (Math.hypot(W / 2 - d.x, H * 0.45 - d.y) < 60 && u.boom === 0) {
        u.boom = 1;
        boom(g, d.x, d.y, 1);
        if (lv >= 7) g.later(0.5, () => boom(g, W / 2, H * 0.45, 2));
      }
    }
    d.x += Math.cos(d.ang) * d.speed * dt;
    d.y += Math.sin(d.ang) * d.speed * dt;
    // 邊界反彈
    if (d.x < 30 || d.x > W - 30) d.ang = Math.PI - d.ang;
    if (d.y < 30 || d.y > H - 30) d.ang = -d.ang;
    d.x = clamp(d.x, 20, W - 20);
    d.y = clamp(d.y, 20, H - 20);
    const last = d.trail[0];
    if (!last || Math.hypot(d.x - last.x, d.y - last.y) > 9) {
      d.trail.unshift({ x: d.x, y: d.y });
      if (d.trail.length > 64) d.trail.pop();
    } else { last.x = d.x; last.y = d.y; }
    if (u.boom === 0 || u.t < u.dur) {
      d.tick -= dt;
      if (d.tick <= 0) {
        d.tick = 0.05;
        for (const e of g.en.items) {
          if (e.dead) continue;
          let hit = (e.x - d.x) ** 2 + (e.y - d.y) ** 2 < (100 + e.r) ** 2;
          if (!hit) for (let i = 6; i < d.trail.length; i += 6) if ((e.x - d.trail[i].x) ** 2 + (e.y - d.trail[i].y) ** 2 < (52 + e.r) ** 2) { hit = true; break; }
          if (hit) { g.damageEnemy(e, 17 * dm * (lv >= 3 ? 1.2 : 1), { crit: false, noText: Math.random() < 0.6 }); e.burn = Math.max(e.burn, 3); }
        }
        for (let i = g.eb.items.length - 1; i >= 0; i--) {
          const b = g.eb.items[i];
          let hit = (b.x - d.x) ** 2 + (b.y - d.y) ** 2 < 100 * 100;
          if (!hit) for (let j = 4; j < d.trail.length; j += 5) if ((b.x - d.trail[j].x) ** 2 + (b.y - d.trail[j].y) ** 2 < 56 * 56) { hit = true; break; }
          if (hit) { g.score += 10; g.dropPickup(b.x, b.y, 1, 1); g.eb.kill(i); }
        }
      }
      if (lv >= 5 && u.t < attackEnd) {
        d.fire -= dt;
        if (d.fire <= 0) { d.fire = 0.45; g.aoe(d.x, d.y, 80, 38 * dm, { pal: "cyan", burn: true }); }
      }
      if (Math.random() < 0.9) g.fx.glowP(d.x + rand(-26, 26), d.y + rand(-26, 26), rand(-60, 60), rand(-60, 60), 0.5, rand(5, 11), Math.random() < 0.6 ? "#27e6ff" : "#4a3aff", 1, 0, 0.8);
    }
  }
  if (u.t >= u.dur) {
    k.ult = null;
    p.form = 0;
    p.formT = 0;
    p.dmgMul = 1;
    u.t = u.dur + 1;
  }
}

function boom(g: Game, x: number, y: number, n: number) {
  audio.sfx("boom_l");
  audio.sfx("bossdie", 0.1);
  g.flash("#bffcff", 1);
  g.shake(18, 0.9);
  g.slowmo(0.35, 0.4);
  const dm = 260 * g.dmgMult() * (n === 2 ? 0.7 : 1);
  g.later(0.1, () => {
    for (const e of g.en.items) if (!e.dead) g.damageEnemy(e, dm, { crit: false });
    g.clearBullets(W / 2, H / 2, 3000, "coin");
    g.fx.explosion(x, y, 80, PAL.cyan);
    for (let i = 0; i < 9; i++) g.fx.ring(x, y, 20, 260 + i * 70, 0.6 + i * 0.06, i % 2 ? "#27e6ff" : "#4a3aff", 9);
    g.fx.burst(x, y, 70, "#6fffff", 200, 900, 0.9, 3);
    for (let i = 0; i < 7; i++) flameColumn(g, 40 + i * 76, 100 * g.dmgMult(), i * 0.05, 40);
  });
  timedFx(g, 1.0, (ctx, u) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const r = 60 + u * 520;
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${1 - u})`);
    gr.addColorStop(0.5, `rgba(39,230,255,${(1 - u) * 0.6})`);
    gr.addColorStop(1, "rgba(30,20,120,0)");
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.5 * (1 - u);
    ctx.fillStyle = "#02040a";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }, 2);
}
void segDist;
