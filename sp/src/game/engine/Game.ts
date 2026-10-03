// 遊戲核心：主迴圈、玩家、碰撞、掉落、升級卡片、關卡時間軸與結算
import { H, QUALITY, TAU, W, clamp, dist2, lerp, rand, smooth } from "../constants";
import type { QualityKey } from "../constants";
import { DIFFS } from "../constants";
import type { EquipItem, RunResult, SaveData, ShipId, SkillKey } from "../types";
import { SHIPS, EVO_LEVELS, SKILL_KEYS, SKILL_LABEL, SKILL_MAX_RUN } from "../data/ships";
import type { ShipDef } from "../data/ships";
import { ENEMIES, BOSSES } from "../data/enemies";
import type { BossDef } from "../data/enemies";
import { STAGES, buildTimeline, genEndlessChunk, ENDLESS_BGS, ENDLESS_KINDS } from "../data/stages";
import type { StageDef, TEvent, SpawnOpt } from "../data/stages";
import { CARDS, RARITY_CARD } from "../data/cards";
import { genItem, RARITY_INFO } from "../data/equipment";
import { Pool, makeBeam, makeEB, makeEnemy, makePB, makePickup, PK } from "../entities";
import type { Beam, EBullet, Enemy, EnemyDef, Fx, PBullet, Pickup } from "../entities";
import { FxSys, PAL } from "../render/fx";
import { Background } from "../render/background";
import { EB_R } from "../render/sprites";
import { InputSys } from "../input";
import { audio } from "../audio";
import { addItems, mutate } from "../save";
import { buildPlayer } from "./player";
import type { Player } from "./player";
import { updateEnemy } from "./enemyAI";
import { updateBoss } from "./bossAI";
import { ring } from "./patterns";
import { HAZARD_INFO, startHazard, updateHazards } from "./hazards";
import type { Hazard } from "./hazards";
import { updateProcs } from "./equipProcs";
import { renderGame } from "./renderer";
import type { ShipKit } from "../skills/common";
import { boltFx } from "../skills/common";
import { crowKit } from "../skills/crow";
import { lanceKit } from "../skills/lance";
import { jadeKit } from "../skills/jade";
import { voltKit } from "../skills/volt";
import { noirKit } from "../skills/noir";
import { prismKit } from "../skills/prism";

const KITS: Record<ShipId, ShipKit> = { crow: crowKit, lance: lanceKit, jade: jadeKit, volt: voltKit, noir: noirKit, prism: prismKit };

export type GameState = "playing" | "paused" | "card" | "ultcut" | "over" | "clear";

export interface CardChoice {
  id: string;
  name: string;
  desc: string;
  rarity: number;
  icon: string;
  lvText?: string;
  evo?: string;
  skill?: SkillKey;
}

export interface GameCallbacks {
  onUltCut?: (ship: ShipId) => void;
  onCards?: (choices: CardChoice[]) => void;
  onOver?: (r: RunResult) => void;
  onClear?: (r: RunResult) => void;
  onBossIntro?: (b: BossDef, stage: number) => void;
  onBanner?: (title: string, sub: string, color?: string) => void;
  onEvolve?: (info: { name: string; tier: number; skill: string }) => void;
  onState?: (s: GameState) => void;
  onGear?: (item: EquipItem) => void;
}

export interface GameOpts {
  ship: ShipId;
  stageId: number; // 0 = 無限模式
  diff: number;
  save: SaveData;
  canvas: HTMLCanvasElement;
  cb: GameCallbacks;
}

export interface HudData {
  hp: number;
  maxHp: number;
  shield: number;
  exp: number;
  expNeed: number;
  level: number;
  score: number;
  combo: number;
  comboT: number;
  activeCd: number;
  ult: number;
  power: number;
  boss: { name: string; hp: number; ph: number } | null;
  progress: number;
  time: number;
  form: number;
  ultReady: boolean;
  callout: string;
  calloutColor: string;
  hi: number;
  fps: number;
}

export class Game {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  cb: GameCallbacks;
  W = W;
  H = H;
  ship: ShipDef;
  kit: ShipKit;
  save: SaveData;
  stage: StageDef | null;
  endless: boolean;
  diff: number;
  dm = DIFFS[0];
  endlessTheme = 0;
  stateName: GameState = "playing";
  t = 0;
  rdt = 0.016;
  timeScale = 1;
  slowT = 0;
  slowScale = 1;
  hitstopT = 0;
  stageT = 0;
  p: Player;
  pb = new Pool<PBullet>(makePB);
  eb = new Pool<EBullet>(makeEB);
  en = new Pool<Enemy>(makeEnemy);
  pk = new Pool<Pickup>(makePickup);
  beams = new Pool<Beam>(makeBeam);
  fx = new FxSys();
  fxs: Fx[] = [];
  hazards: Hazard[] = [];
  bg = new Background();
  input = new InputSys();
  timeline: TEvent[] = [];
  tlIdx = 0;
  blocked: "mid" | "boss" | null = null;
  boss: Enemy | null = null;
  mid: Enemy | null = null;
  bossIdx = 0;
  chunk = 0;
  chunkStart = 0;
  bossCycle = 0;
  score = 0;
  combo = 0;
  comboT = 0;
  maxCombo = 0;
  kills = 0;
  coins = 0;
  cores = 0;
  items: EquipItem[] = [];
  level = 1;
  exp = 0;
  expNeed = 32;
  runLv: Record<SkillKey, number> = { weapon: 0, passive: 0, active: 0, ult: 0 };
  cards: Record<string, number> = {};
  pendingLevels = 0;
  wind = 0;
  bgSpeed = 1;
  bulletSlow = 1;
  bulletSlowT = 0;
  shakeAmt = 0;
  shakeT = 0;
  shakeX = 0;
  shakeY = 0;
  flashA = 0;
  flashColor = "#fff";
  tintA = 0;
  tintColor = "#000";
  tintT = 0;
  tintMax = 0;
  timers: { t: number; fn: () => void }[] = [];
  uidC = 1;
  quality: QualityKey = "high";
  qualitySetting = "auto";
  pxScale = 1;
  lensOK = true;
  cutT = 0;
  bossDieT = 0;
  endT = 0;
  finished = false;
  beamHitCd = 0;
  grazeCount = 0;
  ultWasReady = false;
  calloutT = 0;
  callout = "";
  calloutColor = "#fff";
  time = 0;
  hud: HudData;
  raf = 0;
  lastNow = 0;
  running = false;
  fpsAcc = 0;
  fpsN = 0;
  fps = 60;
  slowFrames = 0;
  lowHpPulse = 0;
  hazardDone = false;
  reviveFx = 0;
  optAng = 0;
  optFireT = 0;

  constructor(o: GameOpts) {
    this.canvas = o.canvas;
    this.ctx = o.canvas.getContext("2d", { alpha: false })!;
    this.cb = o.cb;
    this.save = o.save;
    this.ship = SHIPS[o.ship];
    this.kit = KITS[o.ship];
    this.endless = o.stageId === 0;
    this.stage = this.endless ? null : STAGES[o.stageId - 1];
    this.diff = o.diff;
    this.dm = DIFFS[o.diff];
    this.p = buildPlayer(o.ship, o.save);
    this.p.power = 2; // 開局即有一定火力，前 10 秒就有爽快感
    this.qualitySetting = o.save.settings.quality;
    this.setQuality(this.qualitySetting === "auto" ? (matchMedia("(pointer:coarse)").matches ? "mid" : "high") : (this.qualitySetting as QualityKey));
    this.fx.showText = o.save.settings.showDmg;
    this.input.sens = o.save.settings.sens;
    this.kit.init(this);
    this.timeline = this.endless ? genEndlessChunk(0, 1, this.diff) : buildTimeline(this.stage!, this.diff);
    this.chunk = 0;
    this.chunkStart = 0;
    this.hud = { hp: 0, maxHp: 0, shield: 0, exp: 0, expNeed: 1, level: 1, score: 0, combo: 0, comboT: 0, activeCd: 0, ult: 0, power: 0, boss: null, progress: 0, time: 0, form: 0, ultReady: false, callout: "", calloutColor: "#fff", hi: 0, fps: 60 };
    const rec = this.endless ? o.save.endless.hi : o.save.stages[String(o.stageId)]?.hi?.[o.diff] || 0;
    this.hud.hi = rec;
    this.input.attach(o.canvas);
    audio.setTheme(this.stage ? this.stage.music : 1);
  }

  // ------------------------------------------------------------------
  setQuality(q: QualityKey) {
    this.quality = q;
    const Q = QUALITY[q];
    this.fx.max = Q.particles;
    this.fx.pMul = Q.pMul;
    this.bg.layers = Q.bgLayers;
    this.lensOK = Q.lens;
  }

  resize(cssW: number, cssH: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, QUALITY[this.quality].dpr);
    const w = Math.max(2, Math.round(cssW * dpr));
    const h = Math.max(2, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
    this.pxScale = w / W;
  }

  start() {
    this.running = true;
    this.lastNow = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastNow) / 1000));
      this.lastNow = now;
      try {
        this.frame(dt);
      } catch (err) {
        // 單幀錯誤不應使整個遊戲凍結
        console.error(err);
      }
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
  }

  // ------------------------------------------------------------------
  setState(s: GameState) {
    this.stateName = s;
    this.cb.onState?.(s);
  }

  pause() {
    if (this.stateName === "playing") this.setState("paused");
  }
  resume() {
    if (this.stateName === "paused") this.setState("playing");
  }

  frame(rdt: number) {
    this.rdt = rdt;
    // 效能自動分級
    this.fpsAcc += rdt;
    this.fpsN++;
    if (this.fpsAcc >= 1) {
      this.fps = this.fpsN / this.fpsAcc;
      this.fpsAcc = 0;
      this.fpsN = 0;
      if (this.qualitySetting === "auto" && this.stateName === "playing") {
        if (this.fps < 46) this.slowFrames++;
        else this.slowFrames = Math.max(0, this.slowFrames - 1);
        if (this.slowFrames >= 3 && this.quality !== "low") {
          this.setQuality(this.quality === "high" ? "mid" : "low");
          this.resize(this.canvas.clientWidth || 540, this.canvas.clientHeight || 960);
          this.slowFrames = 0;
        }
      }
    }
    const inp = this.input;
    if (inp.pressPause) {
      inp.pressPause = false;
      if (this.stateName === "playing") this.pause();
      else if (this.stateName === "paused") this.resume();
    }
    if (this.stateName === "playing") {
      if (inp.pressActive) {
        inp.pressActive = false;
        this.tryActive();
      }
      if (inp.pressUlt) {
        inp.pressUlt = false;
        this.tryUlt();
      }
    } else {
      inp.pressActive = false;
      inp.pressUlt = false;
    }
    if (this.stateName === "ultcut") {
      this.cutT -= rdt;
      if (this.cutT <= 0) {
        this.setState("playing");
        this.kit.castUlt(this);
      }
    } else if (this.stateName === "playing" || this.stateName === "over" || this.stateName === "clear") {
      // 時間縮放（慢動作／頓幀）
      let ts = 1;
      if (this.slowT > 0) {
        this.slowT -= rdt;
        ts = this.slowScale;
      }
      if (this.hitstopT > 0) {
        this.hitstopT -= rdt;
        ts = Math.min(ts, 0.08);
      }
      this.timeScale = ts;
      this.step(rdt * ts);
    }
    this.updateHud();
    renderGame(this);
  }

  // ------------------------------------------------------------------
  tryActive() {
    const p = this.p;
    if (p.activeCd > 0 || this.stateName !== "playing") return;
    p.activeCd = p.activeMax = this.ship.activeCd * p.s.cdMul;
    p.castT = 0.5;
    audio.sfx("active");
    this.kit.castActive(this);
  }

  tryUlt() {
    const p = this.p;
    if (p.ult < 100 || this.stateName !== "playing" || p.ultBusy > 0) return;
    p.ult = 0;
    p.inv = Math.max(p.inv, 3);
    this.cutT = 1.45;
    this.setState("ultcut");
    audio.sfx("ultcut");
    this.cb.onUltCut?.(this.ship.id);
  }

  triggerActive() {
    this.input.pressActive = true;
  }
  triggerUlt() {
    this.input.pressUlt = true;
  }

  // ------------------------------------------------------------------
  lvl(key: SkillKey): number {
    return Math.min(SKILL_MAX_RUN, this.save.ships[this.ship.id].lv[key] + this.runLv[key]);
  }

  dmgMult(): number {
    const p = this.p;
    const vig = p.s.vigor > 0 && p.hp / p.maxHp < 0.4 ? 1 + p.s.vigor : 1;
    return p.s.atk * p.dmgMul * (1 + (p.k.bonus || 0)) * vig;
  }

  ebDmg(): number {
    const si = this.stage ? this.stage.id : 3 + Math.min(4, this.chunk * 0.15);
    return (9 + si * 1.6) * (1 + this.diff * 0.16);
  }

  bn(n: number) {
    return Math.max(1, Math.round(n * this.dm.bul));
  }

  get enemies(): Enemy[] {
    return this.en.items;
  }

  addFx(fx: Fx) {
    this.fxs.push(fx);
  }

  later(sec: number, fn: () => void) {
    this.timers.push({ t: sec, fn });
  }

  shake(a: number, t: number) {
    if (!this.save.settings.shake) return;
    if (a >= this.shakeAmt || this.shakeT <= 0) {
      this.shakeAmt = a;
      this.shakeT = t;
    }
  }
  flash(color: string, a: number) {
    this.flashColor = color;
    this.flashA = Math.max(this.flashA, a);
  }
  tint(color: string, a: number, dur: number) {
    this.tintColor = color;
    this.tintA = a;
    this.tintMax = a;
    this.tintT = dur;
  }
  slowmo(scale: number, dur: number) {
    this.slowScale = scale;
    this.slowT = dur;
  }
  say(text: string, color = "#fff") {
    this.callout = text;
    this.calloutColor = color;
    this.calloutT = 1.3;
  }
  toast(text: string, color = "#fff") {
    this.fx.text(W / 2, 320, text, color, 22, 1.4);
  }

  heal(n: number) {
    const p = this.p;
    const h = Math.min(p.maxHp - p.hp, n);
    if (h <= 0) return;
    p.hp += h;
    this.fx.text(p.x, p.y - 40, "+" + Math.round(h), "#7dffb2", 16);
    this.fx.ring(p.x, p.y, 8, 40, 0.35, "#7dffb2", 3);
  }
  addUlt(n: number) {
    const p = this.p;
    if (p.ultBusy > 0) return;
    p.ult = Math.min(100, p.ult + n * p.s.ultMul);
  }
  addPower(n: number) {
    const p = this.p;
    const old = p.power;
    p.power = Math.min(8, p.power + n);
    if (p.power > old) {
      this.fx.text(p.x, p.y - 50, "POWER UP", "#ffb347", 18, 0.9);
      audio.sfx("power");
    }
  }

  // ------------------------------------------------------------------
  // 生成
  spawnPB(x: number, y: number, ang: number, spd: number, style: number, dmg: number, o?: Partial<PBullet>): PBullet {
    const b = this.pb.spawn();
    const s = this.p.s;
    b.x = x; b.y = y; b.vx = Math.cos(ang) * spd; b.vy = Math.sin(ang) * spd;
    b.style = style; b.dmg = dmg * this.dmgMult(); b.r = 5; b.pierce = 0; b.life = 1.2; b.t = 0; b.kind = 0; b.homing = 0; b.explode = 0; b.chain = 0; b.burn = 0; b.slow = 0; b.ramp = 0;
    b.rot = rand(TAU); b.spin = 8; b.a = 0; b.b = 0; b.c = 0; b.scale = 1; b.src = 0; b.hits.length = 0;
    if (o) Object.assign(b, o);
    if (o && o.dmg !== undefined) b.dmg = o.dmg;
    if (b.src < 2) {
      b.pierce += s.pierce;
      b.homing += s.homing;
      b.chain += s.chainHit;
      b.burn += s.burn;
      b.slow += s.slowHit;
    }
    return b;
  }

  spawnEB(x: number, y: number, ang: number, spd: number, type = 0, color = 0, o?: Partial<EBullet>): EBullet | null {
    if (this.eb.items.length > 1100) return null;
    const b = this.eb.spawn();
    b.x = x; b.y = y; b.type = type; b.color = color; b.r = EB_R[type] ?? 5; b.spd = spd * this.dm.spd; b.ang = ang; b.acc = 0; b.turn = 0; b.life = 10; b.t = 0; b.mode = 0; b.a = 0; b.b = 0; b.grazed = false; b.dmg = this.ebDmg(); b.slow = 1;
    if (o) Object.assign(b, o);
    return b;
  }

  addBeam(o: Partial<Beam> & { thunder?: boolean }): Beam {
    const b = this.beams.spawn();
    b.x = o.x ?? 0; b.y = o.y ?? 0; b.ang = o.ang ?? Math.PI / 2; b.rot = o.rot ?? 0; b.len = o.len ?? 1400; b.w = o.w ?? 30; b.warn = o.warn ?? 0.8; b.life = o.life ?? 1; b.t = 0;
    b.dmg = (o.dmg ?? 20) > 0 ? this.ebDmg() * ((o.dmg ?? 20) / 22) * 1.6 : 0;
    b.color = o.color ?? "#ff3b6b"; b.follow = o.follow ?? null;
    b.ox = b.follow ? b.x - b.follow.x : 0;
    b.oy = b.follow ? b.y - b.follow.y : 0;
    (b as any).thunder = !!o.thunder;
    (b as any).fired = false;
    return b;
  }

  spawnEnemy(id: string, x: number, y: number, o: SpawnOpt & { dir?: number } = {}): Enemy | null {
    const def = ENEMIES[id];
    if (!def) return null;
    if (this.en.items.length > 90) return null;
    const e = this.en.spawn();
    const elite = !!o.elite;
    const hs = this.hpScale() * (o.hpMul || 1) * (elite ? 4 : 1);
    e.uid = this.uidC++;
    e.def = def; e.dead = false; e.x = x; e.y = y; e.vx = 0; e.vy = 0;
    e.maxHp = e.hp = Math.max(1, def.hp * hs);
    e.shield = e.maxShield = id === "aegis" || elite ? e.maxHp * (id === "aegis" ? 0.9 : 0.4) : 0;
    e.scale = elite ? 1.3 : 1;
    e.r = def.r * e.scale;
    e.t = 0; e.flash = 0; e.a = o.a || 0; e.b = o.b || 0; e.c = x; e.d = rand(TAU);
    e.tm[0] = e.tm[1] = e.tm[2] = e.tm[3] = e.tm[4] = e.tm[5] = e.tm[6] = e.tm[7] = 0;
    e.ph = 0; e.elite = elite; e.burn = 0; e.slow = 0; e.brand = 0; e.dir = o.dir ?? 0; e.alpha = id === "ghost" ? 0.2 : 1; e.invuln = false;
    e.boss = false; e.bossId = 0; e.theme = this.stage ? this.stage.theme : this.endlessTheme; e.freeze = 0; e.hpBar = 0; e.fireMul = 1 / (1 + this.diff * 0.12); e.mark = 0;
    if (id === "ghost") e.a = 1;
    if (id === "dive") e.a = 0;
    return e;
  }

  hpScale(): number {
    if (this.stage) return this.stage.hpMul * this.dm.hp;
    return (1 + this.chunk * 0.13 + this.bossCycle * 0.5) * this.dm.hp * 1.2;
  }

  spawnMid() {
    const id = this.stage ? this.stage.mid : ["mid_gunship", "mid_walker", "mid_cruiser"][this.chunk % 3];
    const e = this.spawnEnemy(id, W / 2, -140, {});
    if (!e) return;
    e.c = W / 2;
    e.a = W / 2;
    e.b = 1;
    this.mid = e;
    this.blocked = "mid";
    audio.sfx("warning", 1);
  }

  spawnBoss() {
    const idx = this.stage ? this.stage.boss : this.bossIdx % 6;
    const bd = BOSSES[idx];
    const def: EnemyDef = { id: "boss" + idx, name: bd.name, hp: bd.hp, r: bd.r, spd: 0, score: 50000, exp: 400, ai: "boss", size: 220 };
    const e = this.en.spawn();
    e.uid = this.uidC++;
    e.def = def; e.dead = false; e.x = W / 2; e.y = -160; e.vx = e.vy = 0;
    const hs = this.stage ? Math.pow(this.stage.hpMul, 0.85) * this.dm.hp * 0.78 : (1 + this.bossCycle * 0.7) * this.dm.hp * 1.1;
    e.maxHp = e.hp = bd.hp * hs;
    e.shield = e.maxShield = 0; e.scale = 1; e.r = bd.r * 1.25; e.t = 0; e.flash = 0; e.a = W / 2; e.b = 2; e.c = 0; e.d = 0;
    e.tm.fill(0);
    e.ph = 0; e.elite = false; e.burn = 0; e.slow = 0; e.brand = 0; e.dir = 0; e.alpha = 1; e.invuln = true; e.boss = true; e.bossId = idx;
    e.theme = this.stage ? this.stage.theme : this.endlessTheme; e.freeze = 0; e.hpBar = 0; e.fireMul = 1; e.mark = 0;
    this.boss = e;
    this.blocked = "boss";
    this.bossIdx++;
    audio.sfx("warning", 1);
    audio.setTheme(3);
    this.cb.onBossIntro?.(bd, this.stage ? this.stage.id : 0);
  }

  // ------------------------------------------------------------------
  // 傷害與擊殺
  damageEnemy(e: Enemy, dmg: number, o: { noText?: boolean; noHitFx?: boolean; crit?: boolean; x?: number; y?: number } = {}): boolean {
    if (e.dead || dmg <= 0) return false;
    if (e.invuln) {
      if (!o.noHitFx) this.fx.hit(o.x ?? e.x, o.y ?? e.y, "#9aa6b6");
      return false;
    }
    if (e.mark > 0) dmg *= 1.25;
    let real = dmg;
    if (e.shield > 0) {
      e.shield -= dmg;
      if (e.shield < 0) {
        e.hp += e.shield;
        e.shield = 0;
        this.fx.ring(e.x, e.y, 10, e.r * 2, 0.3, "#9be6ff", 3);
      }
    } else e.hp -= dmg;
    if (!o.noHitFx) e.flash = 1;
    e.hpBar = 2;
    if (!o.noText && this.fx.showText) this.fx.text(o.x ?? e.x + rand(-8, 8), (o.y ?? e.y) - e.r * 0.6, String(Math.round(real)), o.crit ? "#ffd36b" : "#ffffff", o.crit ? 19 : 13, 0.6);
    if (e.hp <= 0) {
      this.killEnemy(e);
      return true;
    }
    return false;
  }

  aoe(x: number, y: number, r: number, dmg: number, o: { pal?: string; burn?: boolean; noFx?: boolean; noText?: boolean; small?: boolean; skip?: number; slow?: number } = {}): number {
    let n = 0;
    const list = this.en.items;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.dead || e.uid === o.skip || e.alpha < 0) continue;
      const d = Math.hypot(e.x - x, e.y - y) - e.r;
      if (d < r) {
        n++;
        if (o.burn) e.burn = Math.max(e.burn, 3);
        if (o.slow) e.slow = Math.max(e.slow, o.slow);
        this.damageEnemy(e, dmg, { noText: o.noText ?? true, noHitFx: o.small });
      }
    }
    if (!o.noFx && r < 2000) {
      const pal = PAL[o.pal || "fire"] || PAL.fire;
      if (o.small) this.fx.explosion(x, y, Math.max(8, r * 0.28), pal);
      else this.fx.explosion(x, y, Math.max(12, r * 0.4), pal);
      if (r > 50) audio.sfx("boom_s", 0.08);
    }
    return n;
  }

  chain(x: number, y: number, n: number, dmg: number, skip: number, range = 170) {
    let cx = x;
    let cy = y;
    const used = new Set<number>([skip]);
    for (let i = 0; i < n; i++) {
      let best: Enemy | null = null;
      let bd = range * range;
      for (const e of this.en.items) {
        if (e.dead || used.has(e.uid) || e.alpha < 0 || e.y < -10) continue;
        const d = dist2(e.x, e.y, cx, cy);
        if (d < bd) {
          bd = d;
          best = e;
        }
      }
      if (!best) break;
      used.add(best.uid);
      boltFx(this, cx, cy, best.x, best.y, "#c58bff", 0.14, 2.2);
      this.damageEnemy(best, dmg, { noText: true });
      this.fx.hit(best.x, best.y, "#ffe45c");
      cx = best.x;
      cy = best.y;
    }
  }

  nearest(x: number, y: number, maxD = 9999, filter?: (e: Enemy) => boolean): Enemy | null {
    let best: Enemy | null = null;
    let bd = maxD * maxD;
    const list = this.en.items;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.dead || e.alpha < 0 || e.y < -20 || (e.def.ai === "ghost" && e.invuln)) continue;
      if (filter && !filter(e)) continue;
      const d = dist2(e.x, e.y, x, y);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  }

  clearBullets(x: number, y: number, r: number, mode: "none" | "score" | "coin" = "none", colX?: number, colW?: number, bandY?: number, bandH?: number): number {
    let n = 0;
    const list = this.eb.items;
    const r2 = r * r;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      if (!b.alive) continue;
      let ok: boolean;
      if (colX !== undefined) ok = Math.abs(b.x - colX) < (colW ?? 40);
      else if (bandY !== undefined) ok = Math.abs(b.y - bandY) < (bandH ?? 60);
      else ok = r >= 9000 || dist2(b.x, b.y, x, y) < r2;
      if (!ok) continue;
      b.alive = false;
      n++;
      if (mode !== "none") {
        this.score += 12;
        if (n < 12) this.fx.glowP(b.x, b.y, 0, -40, 0.3, 8, "#ffe45c", 2, 0, 0.8);
        if (mode === "coin" && Math.random() < 0.1 && this.pk.items.length < 200) this.dropPickup(b.x, b.y, PK.COIN, 2);
      }
    }
    if (mode !== "none" && n) this.addUlt(Math.min(6, n * 0.08));
    return n;
  }

  killEnemy(e: Enemy) {
    if (e.dead) return;
    e.dead = true;
    const def = e.def;
    if (e.alpha < 0) return;
    const p = this.p;
    if (e.boss) {
      this.bossDefeated(e);
      return;
    }
    this.kills++;
    this.combo++;
    this.comboT = 2.4 + p.s.comboWin;
    if (this.combo > this.maxCombo) this.maxCombo = this.combo;
    const mult = 1 + Math.min(this.combo, 200) / 40;
    const sc = Math.round(def.score * mult * (e.elite ? 2 : 1));
    this.score += sc;
    if ([10, 25, 50, 100, 150, 200, 300, 500].includes(this.combo)) {
      this.say(`${this.combo} COMBO!`, this.combo >= 100 ? "#ffd36b" : this.combo >= 50 ? "#ff5a6e" : "#7cf3ff");
    }
    const size = Math.min(70, 8 + e.r * 1.1);
    const pal = e.theme === 2 ? PAL.ice : e.theme === 3 ? PAL.fire : e.theme === 0 ? PAL.elec : e.theme === 5 ? PAL.gold : PAL.fire;
    this.fx.explosion(e.x, e.y, size, pal);
    audio.sfx(e.r > 30 ? "boom_m" : "boom_s", 0.04);
    if (e.r > 24) {
      this.shake(e.r > 40 ? 6 : 3, 0.15);
      this.hitstopT = Math.max(this.hitstopT, e.r > 40 ? 0.06 : 0.03);
    }
    // 掉落
    const s = p.s;
    const orbs = def.mid ? 10 : e.r > 28 ? 4 : e.r > 18 ? 2 : 1;
    const expEach = (def.exp * this.hpExpMul()) / orbs;
    for (let i = 0; i < orbs; i++) this.dropPickup(e.x + rand(-12, 12), e.y + rand(-12, 12), PK.EXP, expEach);
    const luck = 1 + s.luck * 0.25;
    if (Math.random() < 0.35 * s.dropMul) this.dropPickup(e.x, e.y, PK.COIN, Math.round((def.mid ? 30 : e.elite ? 12 : 3) * (1 + (this.stage ? this.stage.id * 0.2 : 1))));
    if (Math.random() < (e.elite ? 0.7 : 0.045) * luck * s.dropMul) this.dropPickup(e.x, e.y, PK.POWER, 1);
    if (Math.random() < (p.hp / p.maxHp < 0.5 ? 0.03 : 0.012) * luck) this.dropPickup(e.x, e.y, PK.HEAL, 1);
    if (Math.random() < 0.03 * luck) this.dropPickup(e.x, e.y, PK.ULT, 1);
    if (Math.random() < 0.008 * luck) this.dropPickup(e.x, e.y, PK.SHIELD, 1);
    if (Math.random() < 0.006) this.dropPickup(e.x, e.y, PK.MAGNET, 1);
    if (e.elite && Math.random() < 0.06) this.dropPickup(e.x, e.y, PK.CORE, 1);
    if (e.elite && Math.random() < 0.55 * s.dropMul) this.dropItem(e.x, e.y, 0);
    else if (!def.mid && Math.random() < 0.006 * luck * s.dropMul) this.dropItem(e.x, e.y, 0);
    if (s.killHeal > 0) {
      p.hp = Math.min(p.maxHp, p.hp + s.killHeal);
    }
    this.addUlt(0.7 + e.r * 0.03);
    if (e.burn > 0 && e.def.ai !== "boss") this.fx.burst(e.x, e.y, 6, "#ffb347", 60, 180, 0.5, 2);
    this.kit.onKill?.(this, e);
    if (e === this.mid) this.midDefeated(e);
  }

  hpExpMul() {
    return (this.stage ? 1 + this.stage.id * 0.12 : 1 + this.chunk * 0.05) * 1.35;
  }

  midDefeated(e: Enemy) {
    this.mid = null;
    this.blocked = null;
    this.clearBullets(0, 0, 9999, "coin");
    this.fx.ring(e.x, e.y, 20, 400, 0.6, "#ffffff", 8);
    this.flash("#ffffff", 0.5);
    this.shake(10, 0.4);
    audio.sfx("boom_l");
    this.slowmo(0.4, 0.8);
    for (let i = 0; i < 3; i++) this.later(i * 0.14, () => this.fx.explosion(e.x + rand(-40, 40), e.y + rand(-30, 30), 40, PAL.fire));
    const n = this.stage && this.stage.id >= 3 ? 2 : 1;
    for (let i = 0; i < n; i++) this.dropItem(e.x + (i - 0.5) * 30, e.y, 0.3);
    this.dropPickup(e.x, e.y, PK.CORE, 1);
    this.dropPickup(e.x, e.y, PK.POWER, 1);
    for (let i = 0; i < 8; i++) this.dropPickup(e.x + rand(-40, 40), e.y + rand(-30, 30), PK.COIN, 15);
    this.say("MID-BOSS DOWN!", "#ffd36b");
  }

  bossPhaseChange(e: Enemy) {
    audio.sfx("boom_l");
    this.clearBullets(0, 0, 9999, "coin");
    this.fx.ring(e.x, e.y, 20, 600, 0.7, "#ffffff", 10);
    this.fx.explosion(e.x, e.y, 60, PAL.white);
    this.flash("#ffffff", 0.6);
    this.shake(12, 0.5);
    this.say(e.ph === 2 ? "FINAL PHASE!" : "PHASE " + (e.ph + 1), "#ff5a6e");
    for (let i = 0; i < 6; i++) this.dropPickup(e.x + rand(-60, 60), e.y + rand(-40, 40), PK.COIN, 20);
    this.dropPickup(e.x, e.y, PK.POWER, 1);
  }

  bossDefeated(e: Enemy) {
    this.boss = null;
    this.bossDieT = 3.4;
    this.score += 30000 * (1 + this.diff * 0.5);
    this.kills++;
    this.clearBullets(0, 0, 9999, "coin");
    this.beams.clear();
    this.hazards.length = 0;
    this.wind = 0;
    audio.sfx("bossdie");
    this.slowmo(0.3, 1.8);
    this.flash("#ffffff", 0.9);
    this.shake(18, 1.2);
    // 連鎖爆炸
    for (let i = 0; i < 14; i++) {
      this.later(i * 0.12, () => {
        this.fx.explosion(e.x + rand(-80, 80), e.y + rand(-60, 60), rand(30, 70), i % 2 ? PAL.fire : PAL.gold);
        audio.sfx("boom_m", 0.03);
        this.shake(8, 0.15);
      });
    }
    this.later(1.5, () => {
      this.fx.explosion(e.x, e.y, 120, PAL.white);
      this.fx.ring(e.x, e.y, 30, 900, 1, "#ffffff", 14);
      this.flash("#ffffff", 1);
      audio.sfx("boom_l");
    });
    // 全場敵機殲滅
    for (const o of this.en.items) if (o !== e && !o.dead) this.damageEnemy(o, 1e9, { noText: true });
    // 大量獎勵
    for (let i = 0; i < 30; i++) this.dropPickup(e.x + rand(-100, 100), e.y + rand(-70, 70), PK.COIN, 25);
    for (let i = 0; i < 16; i++) this.dropPickup(e.x + rand(-90, 90), e.y + rand(-60, 60), PK.EXP, 30);
    const nItems = 2 + (this.stage && this.stage.id >= 4 ? 1 : 0) + (this.diff >= 1 ? 1 : 0);
    for (let i = 0; i < nItems; i++) this.later(0.3 + i * 0.25, () => this.dropItem(e.x + (i - 1) * 40, e.y, 1));
    for (let i = 0; i < 2 + this.diff; i++) this.dropPickup(e.x + rand(-40, 40), e.y, PK.CORE, 1);
    if (this.endless) {
      this.bossCycle++;
      this.later(3.5, () => {
        this.blocked = null;
        audio.setTheme(1);
      });
    }
  }

  // ------------------------------------------------------------------
  dropPickup(x: number, y: number, kind: number, v: number, item?: EquipItem) {
    if (this.pk.items.length > 260 && kind === PK.EXP) {
      this.addExp(v);
      return;
    }
    const k = this.pk.spawn();
    k.x = x; k.y = y; k.kind = kind; k.v = v; k.t = 0; k.mag = false; k.item = item;
    const a = rand(TAU);
    const s = rand(40, 150);
    k.vx = Math.cos(a) * s;
    k.vy = Math.sin(a) * s - 40;
  }

  dropItem(x: number, y: number, boss: number) {
    const item = genItem(undefined, undefined, this.p.s.luck, boss + (this.stage ? this.stage.id * 0.05 : 0.1));
    this.dropPickup(x, y, PK.GEAR, 1, item);
  }

  collect(k: Pickup) {
    const p = this.p;
    switch (k.kind) {
      case PK.EXP:
        this.addExp(k.v);
        audio.sfx("pickup", 0.05);
        break;
      case PK.COIN: {
        const v = Math.max(1, Math.round(k.v * p.s.coinMul));
        this.coins += v;
        this.score += v * 5;
        audio.sfx("coin", 0.05);
        break;
      }
      case PK.POWER:
        this.addPower(1);
        break;
      case PK.HEAL:
        this.heal(p.maxHp * 0.2);
        audio.sfx("pickup");
        break;
      case PK.ULT:
        this.addUlt(14);
        this.fx.text(p.x, p.y - 40, "ULT +", "#c58bff", 15);
        audio.sfx("pickup");
        break;
      case PK.SHIELD:
        p.shield = Math.min(3, p.shield + 1);
        p.maxShield = Math.max(p.maxShield, p.shield);
        this.fx.text(p.x, p.y - 40, "SHIELD", "#9be6ff", 15);
        audio.sfx("power");
        break;
      case PK.MAGNET:
        for (const o of this.pk.items) o.mag = true;
        this.fx.text(p.x, p.y - 40, "MAGNET", "#ff8ad4", 15);
        audio.sfx("power");
        break;
      case PK.CORE:
        this.cores++;
        this.fx.text(p.x, p.y - 40, "星核 +1", "#ff8ad4", 16);
        audio.sfx("gear");
        break;
      case PK.GEAR:
        if (k.item) {
          this.items.push(k.item);
          const ri = RARITY_INFO[k.item.rarity];
          this.fx.text(p.x, p.y - 44, `${k.item.rarity}｜${k.item.name}`, k.item.rarity === "UR" ? "#ff3b6b" : k.item.rarity === "SSR" ? "#ffc23d" : k.item.rarity === "SR" ? "#47c2ff" : "#dfe6ee", 15, 1.2);
          audio.sfx("gear");
          if (ri.index >= 3) {
            this.flash(k.item.rarity === "UR" ? "#ff3b6b" : "#ffc23d", 0.35);
            this.say(k.item.rarity === "UR" ? "UR 神話裝備!" : "SSR 傳說裝備!", k.item.rarity === "UR" ? "#ff3b6b" : "#ffc23d");
          }
          this.cb.onGear?.(k.item);
        }
        break;
    }
  }

  // ------------------------------------------------------------------
  // 經驗與升級
  addExp(v: number) {
    this.exp += v * this.p.s.expMul;
    while (this.exp >= this.expNeed) {
      this.exp -= this.expNeed;
      this.level++;
      this.expNeed = Math.round(32 + this.level * 15 + Math.pow(this.level, 1.35) * 3);
      this.pendingLevels++;
    }
  }

  checkLevelUp() {
    if (this.pendingLevels <= 0 || this.stateName !== "playing") return;
    if (this.bossDieT > 0) return;
    this.pendingLevels--;
    const p = this.p;
    audio.sfx("levelup");
    this.fx.ring(p.x, p.y, 10, 120, 0.5, "#7cf3ff", 5);
    this.fx.text(p.x, p.y - 60, "LEVEL UP!", "#7cf3ff", 20, 1);
    if (p.s.overload > 0) {
      this.clearBullets(p.x, p.y, 240 + p.s.overload * 90, "score");
      this.aoe(p.x, p.y, 240 + p.s.overload * 90, 80 + this.level * 8, { pal: "cyan", noText: true });
    }
    const choices = this.rollCards();
    if (!choices.length) return;
    if (this.save.settings.autoCard) {
      const pickC = choices.slice().sort((a, b) => (b.skill ? 3 : 0) + b.rarity - ((a.skill ? 3 : 0) + a.rarity))[0];
      this.applyCard(pickC.id);
      this.fx.text(W / 2, 380, "自動強化：" + pickC.name, "#dfe6ee", 17, 1.3);
      return;
    }
    this.setState("card");
    this.cb.onCards?.(choices);
  }

  rollCards(): CardChoice[] {
    const pool: { c: CardChoice; w: number }[] = [];
    const ship = this.ship;
    for (const key of SKILL_KEYS) {
      const cur = this.lvl(key);
      if (cur >= SKILL_MAX_RUN) continue;
      const nl = cur + 1;
      const evoIdx = EVO_LEVELS.indexOf(nl);
      const sk = ship.skills[key];
      pool.push({
        w: evoIdx >= 0 ? 16 : 9,
        c: { id: "sk_" + key, name: `${sk.name}`, desc: evoIdx >= 0 ? `進化：${sk.evo[evoIdx]}` : `${SKILL_LABEL[key]}強化：效果與傷害提升`, rarity: evoIdx >= 0 ? 2 : 1, icon: "sk_" + key, lvText: `${SKILL_LABEL[key]} Lv${cur} → Lv${nl}`, evo: evoIdx >= 0 ? "進化！" : undefined, skill: key },
      });
    }
    for (const c of CARDS) {
      const n = this.cards[c.id] || 0;
      if (n >= c.max) continue;
      if (c.id === "repair" && this.p.hp > this.p.maxHp * 0.85) continue;
      if (c.id === "option" && this.p.s.options >= 3) continue;
      pool.push({ w: c.weight * (c.rarity === 2 ? 1 + this.p.s.luck * 0.3 : 1), c: { id: c.id, name: c.name, desc: c.desc(n + 1), rarity: c.rarity, icon: c.icon, lvText: n > 0 ? `Lv${n} → Lv${n + 1}` : "NEW" } });
    }
    const count = 3 + (this.p.s.luck >= 2 && Math.random() < 0.4 ? 1 : 0);
    const out: CardChoice[] = [];
    for (let i = 0; i < count && pool.length; i++) {
      const tot = pool.reduce((s, x) => s + x.w, 0);
      let r = Math.random() * tot;
      let idx = 0;
      for (let k = 0; k < pool.length; k++) {
        r -= pool[k].w;
        if (r <= 0) {
          idx = k;
          break;
        }
      }
      out.push(pool[idx].c);
      pool.splice(idx, 1);
    }
    return out;
  }

  applyCard(id: string) {
    if (id.startsWith("sk_")) {
      const key = id.slice(3) as SkillKey;
      this.runLv[key]++;
      const nl = this.lvl(key);
      const evoIdx = EVO_LEVELS.indexOf(nl);
      const sk = this.ship.skills[key];
      if (evoIdx >= 0) {
        audio.sfx("evolve");
        this.flash("#ffffff", 0.5);
        this.say(`${sk.name} 進化！`, "#ffd36b");
        this.fx.ring(this.p.x, this.p.y, 10, 200, 0.7, "#ffd36b", 8);
        this.cb.onEvolve?.({ name: sk.name, tier: evoIdx + 1, skill: SKILL_LABEL[key] });
        if (key === "weapon" || key === "ult") this.p.tier = Math.min(3, this.p.tier + (evoIdx >= 1 ? 1 : 0));
      }
    } else {
      const c = CARDS.find((x) => x.id === id);
      if (c) {
        this.cards[id] = (this.cards[id] || 0) + 1;
        c.apply(this, this.cards[id]);
      }
    }
    if (this.stateName === "card") this.setState("playing");
  }

  pickCard(id: string) {
    this.applyCard(id);
    audio.sfx("ui_ok");
  }

  // ------------------------------------------------------------------
  // 玩家受傷
  hurt(dmg: number) {
    const p = this.p;
    if (p.inv > 0 || this.stateName !== "playing") return;
    if (p.shield > 0) {
      p.shield--;
      p.inv = 1.2;
      this.fx.ring(p.x, p.y, 10, 70, 0.4, "#9be6ff", 5);
      this.fx.burst(p.x, p.y, 16, "#9be6ff", 100, 300, 0.5, 2.5);
      audio.sfx("hurt");
      this.clearBullets(p.x, p.y, 110, "none");
      return;
    }
    dmg *= p.drMul;
    p.hp -= dmg;
    p.inv = 1.15;
    p.hitFlash = 1;
    this.combo = 0;
    this.comboT = 0;
    this.shake(8, 0.3);
    this.flash("#ff1a3a", 0.35);
    this.hitstopT = 0.09;
    audio.sfx("hurt");
    this.fx.explosion(p.x, p.y, 16, PAL.red);
    this.clearBullets(p.x, p.y, 90, "none");
    this.kit.onPlayerHit?.(this);
    if (p.hp <= 0) {
      if (p.s.revive > 0) {
        p.s.revive--;
        p.hp = p.maxHp * 0.5;
        p.inv = 3;
        this.clearBullets(0, 0, 9999, "none");
        this.aoe(p.x, p.y, 9999, 200, { pal: "gold" });
        this.fx.ring(p.x, p.y, 20, 800, 0.8, "#ffd36b", 12);
        this.say("不滅意志!", "#ffd36b");
        audio.sfx("evolve");
        this.flash("#ffd36b", 0.8);
        return;
      }
      p.hp = 0;
      this.playerDied();
    }
  }

  playerDied() {
    const p = this.p;
    this.fx.explosion(p.x, p.y, 60, PAL.fire);
    this.fx.ring(p.x, p.y, 20, 500, 0.8, "#ffffff", 10);
    this.slowmo(0.3, 1.4);
    this.shake(14, 0.6);
    audio.sfx("boom_l");
    this.endT = 1.8;
    this.setState("over");
  }

  // ------------------------------------------------------------------
  // 主更新
  step(dt: number) {
    const p = this.p;
    this.t += dt;
    this.time += dt;
    // 計時器
    for (let i = this.timers.length - 1; i >= 0; i--) {
      const tm = this.timers[i];
      tm.t -= dt;
      if (tm.t <= 0) {
        this.timers.splice(i, 1);
        tm.fn();
      }
    }
    // 震動與濾鏡
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const a = this.shakeAmt * Math.max(0, this.shakeT * 3);
      this.shakeX = rand(-a, a);
      this.shakeY = rand(-a, a);
    } else {
      this.shakeX = this.shakeY = 0;
    }
    this.flashA = Math.max(0, this.flashA - dt * 2.2);
    if (this.tintT > 0) {
      this.tintT -= dt;
      this.tintA = this.tintMax * clamp(this.tintT / 0.6, 0, 1);
    } else this.tintA = 0;
    if (this.calloutT > 0) this.calloutT -= dt;
    if (this.bulletSlowT > 0) {
      this.bulletSlowT -= dt;
      if (this.bulletSlowT <= 0) this.bulletSlow = 1;
    }

    const alive = this.stateName === "playing";
    // 關卡時間軸
    if (alive && this.bossDieT <= 0) this.runTimeline(dt);
    this.updateBackground(dt);
    if (alive) this.updatePlayer(dt);
    else if (this.stateName === "over") {
      this.endT -= dt / Math.max(0.3, this.timeScale);
      if (this.endT <= 0 && !this.finished) this.finish(false);
    }
    // Boss 擊破演出後結算
    if (this.bossDieT > 0) {
      this.bossDieT -= dt / Math.max(0.3, this.timeScale);
      if (this.bossDieT <= 0 && !this.endless && !this.finished) {
        this.setState("clear");
        this.finish(true);
      }
    }
    updateHazards(this, dt);
    // 敵機
    const en = this.en.items;
    for (let i = en.length - 1; i >= 0; i--) {
      const e = en[i];
      if (e.dead) {
        this.en.kill(i);
        continue;
      }
      if (e.def.ai === "boss") updateBoss(this, e, dt);
      else updateEnemy(this, e, dt);
      if (e.burn > 0) {
        e.burn -= dt;
        this.damageEnemy(e, (10 + this.level * 1.2) * this.p.s.atk * dt * 4, { noText: true, noHitFx: true });
        if (Math.random() < 0.2) this.fx.glowP(e.x + rand(-e.r, e.r), e.y + rand(-e.r, e.r), 0, -40, 0.4, 6, "#ff8a2a", 2, 0, 0.8);
      }
      if (e.mark > 0) e.mark -= dt;
      if (e.hpBar > 0) e.hpBar -= dt;
    }
    this.updatePBullets(dt);
    this.updateEBullets(dt);
    this.updateBeams(dt);
    this.updatePickups(dt);
    // 特效
    for (let i = this.fxs.length - 1; i >= 0; i--) {
      const f = this.fxs[i];
      try {
        f.update(dt);
      } catch (err) {
        console.error(err);
        f.alive = false;
      }
      if (!f.alive) this.fxs.splice(i, 1);
    }
    this.fx.update(dt);
    if (this.stateName === "playing") {
      if (this.comboT > 0) {
        this.comboT -= dt;
        if (this.comboT <= 0) this.combo = 0;
      }
      this.checkLevelUp();
    }
  }

  runTimeline(dt: number) {
    if (this.blocked === "mid") {
      if (!this.mid || this.mid.dead) this.blocked = null;
    }
    if (this.blocked) return;
    this.stageT += dt;
    if (this.endless && this.tlIdx >= this.timeline.length) {
      this.chunk++;
      this.chunkStart = this.stageT;
      this.endlessTheme = Math.floor(this.chunk / 3) % 6;
      this.timeline = genEndlessChunk(this.chunk, this.stageT + 0.5, this.diff);
      this.tlIdx = 0;
    }
    while (this.tlIdx < this.timeline.length && this.timeline[this.tlIdx].t <= this.stageT) {
      const ev = this.timeline[this.tlIdx++];
      switch (ev.k) {
        case "spawn":
          this.spawnEnemy(ev.e, ev.x * W, ev.y, ev.o || {});
          break;
        case "event":
          startHazard(this, ev.name, ev.dur);
          break;
        case "banner":
          this.cb.onBanner?.(ev.text, ev.sub || "", ev.text === "WARNING" ? "#ff3b52" : "#ffffff");
          if (ev.text === "WARNING") audio.sfx("warning", 1);
          break;
        case "flyby":
          this.bg.flyby(ev.kind);
          break;
        case "mid":
          this.spawnMid();
          break;
        case "boss":
          this.spawnBoss();
          break;
        case "waitMid":
          break;
      }
      if (this.blocked) break;
    }
  }

  updateBackground(dt: number) {
    let a: string;
    let b: string;
    let mix: number;
    let tint: string;
    let cloud: number;
    let col: string;
    let kind = this.stage ? this.stage.kind : ENDLESS_KINDS[this.endlessTheme];
    if (this.stage) {
      const s = this.stage;
      const pr = clamp(this.stageT / s.len, 0, 1);
      a = s.bgs[0];
      b = s.bgs[1];
      mix = smooth(s.mix[0], s.mix[1], pr);
      if (mix > 0.5) kind = s.kindB;
      tint = gradeAt(s.grade, pr);
      const tr = clamp((pr - s.mix[0]) / (s.mix[1] - s.mix[0]), 0, 1);
      cloud = 0.14 + Math.sin(tr * Math.PI) * 0.95;
      col = s.cloudCol;
      this.bgSpeed = 1 + Math.sin(tr * Math.PI) * 0.7;
    } else {
      const th = this.endlessTheme;
      a = ENDLESS_BGS[th];
      b = ENDLESS_BGS[(th + 1) % 6];
      const cp = (this.chunk % 3) + clamp((this.stageT - this.chunkStart) / 18, 0, 1);
      mix = smooth(2.1, 2.95, cp);
      if (mix > 0.5) kind = ENDLESS_KINDS[(th + 1) % 6];
      const g3: [string, string, string] = ["rgba(255,80,160,0.14)", "rgba(80,140,255,0.14)", "rgba(255,190,80,0.14)"];
      tint = gradeAt(g3, (this.chunk % 6) / 6);
      cloud = 0.14 + Math.sin(clamp((cp - 1.9) / 1.1, 0, 1) * Math.PI) * 0.9;
      col = "#e8eeff";
      this.bgSpeed = 1 + Math.sin(clamp((cp - 1.9) / 1.1, 0, 1) * Math.PI) * 0.6;
    }
    this.bg.set(a, b, mix, kind, tint, cloud, col);
    this.bg.update(dt, this.bgSpeed * (this.stateName === "over" ? 0.3 : 1));
  }

  updatePlayer(dt: number) {
    const p = this.p;
    const inp = this.input;
    const prevX = p.x;
    const baseSpd = this.ship.base.spd * 1.15 * p.s.spd * p.speedMul * (inp.focus ? 0.45 : 1);
    if (inp.isTouch || inp.touchId !== -1) {
      const d = inp.consumeDrag();
      p.x += d.x;
      p.y += d.y;
    } else if (inp.mouseActive) {
      const dx = inp.tx - p.x;
      const dy = inp.ty - 34 - p.y;
      const k = Math.min(1, dt * 26);
      const mx = dx * k;
      const my = dy * k;
      const dist = Math.hypot(mx, my);
      const cap = 1500 * dt * (inp.focus ? 0.4 : 1) * p.speedMul;
      const s = dist > cap ? cap / dist : 1;
      p.x += mx * s;
      p.y += my * s;
    } else {
      let ax = inp.axisX;
      let ay = inp.axisY;
      const l = Math.hypot(ax, ay);
      if (l > 1) {
        ax /= l;
        ay /= l;
      }
      p.x += ax * baseSpd * dt;
      p.y += ay * baseSpd * dt;
    }
    p.x += this.wind * dt;
    p.x = clamp(p.x, 22, W - 22);
    p.y = clamp(p.y, 60, H - 34);
    const vx = (p.x - prevX) / Math.max(dt, 0.001);
    p.bank += (clamp(vx / 420, -1, 1) - p.bank) * Math.min(1, dt * 10);
    p.thrust = 1 + Math.abs(p.bank) * 0.2 + (p.y < prevX ? 0 : 0);
    if (p.inv > 0) p.inv -= dt;
    if (p.hitFlash > 0) p.hitFlash -= dt * 4;
    if (p.castT > 0) p.castT -= dt;
    if (p.ultBusy > 0) p.ultBusy -= dt;
    if (p.activeCd > 0) p.activeCd -= dt;
    // 奧義自然充能
    if (p.ultBusy <= 0) p.ult = Math.min(100, p.ult + (100 / this.ship.ultTime) * p.s.ultMul * dt);
    if (p.ult >= 100 && !this.ultWasReady) {
      this.ultWasReady = true;
      this.say("ULT READY", "#c58bff");
      audio.sfx("power");
    } else if (p.ult < 100) this.ultWasReady = false;
    // 護盾再生
    if (p.s.shieldRegen > 0 && p.shield < p.maxShield) {
      p.shieldT += dt;
      if (p.shieldT >= p.s.shieldRegen) {
        p.shieldT = 0;
        p.shield++;
        this.fx.ring(p.x, p.y, 10, 60, 0.4, "#9be6ff", 4);
      }
    }
    // 形態預設值（技能模組會覆寫）
    if (p.form === 0) {
      p.dmgMul = 1;
      p.speedMul = 1;
      p.drMul = 1;
    }
    this.kit.update(this, dt);
    // 射擊
    p.fireT -= dt;
    if (p.fireT < -0.1) p.fireT = 0;
    if (p.fireT <= 0) this.kit.fire(this, dt);
    this.updateOptions(dt);
    updateProcs(this, dt);
    // 引擎尾焰粒子
    if (Math.random() < 0.6) this.fx.glowP(p.x + rand(-4, 4), p.y + 26, rand(-15, 15), rand(120, 220), 0.25, rand(5, 9), this.ship.color2, 1, 0, 0.7);
    if (p.hp / p.maxHp < 0.3) this.lowHpPulse += dt * 6;
    // 進化外觀 UR 光環
    void lerp;
  }

  updateOptions(dt: number) {
    const p = this.p;
    const n = p.s.options;
    if (n <= 0) return;
    this.optAng += dt * 2.2;
    this.optFireT -= dt;
    if (this.optFireT <= 0) {
      this.optFireT = 0.28 / p.s.rate;
      for (let i = 0; i < n; i++) {
        const a = this.optAng + (i * TAU) / n;
        const ox = p.x + Math.cos(a) * 44;
        const oy = p.y + Math.sin(a) * 18 - 4;
        this.spawnPB(ox, oy, -Math.PI / 2, 1000, 16, 3.5 + this.level * 0.35, { r: 4, life: 0.9, src: 1, homing: 1 });
      }
    }
  }

  updatePBullets(dt: number) {
    const arr = this.pb.items;
    const en = this.en.items;
    const p = this.p;
    for (let i = arr.length - 1; i >= 0; i--) {
      const b = arr[i];
      if (!b.alive) {
        this.pb.kill(i);
        continue;
      }
      b.t += dt;
      b.life -= dt;
      if (b.life <= 0) {
        this.pb.kill(i);
        continue;
      }
      if (b.homing > 0) {
        const e = this.nearest(b.x, b.y, 460);
        if (e) {
          const desired = Math.atan2(e.y - b.y, e.x - b.x);
          let cur = Math.atan2(b.vy, b.vx);
          const diff = ((desired - cur + Math.PI * 3) % TAU) - Math.PI;
          const turn = (2.4 + b.homing * 1.7) * dt;
          cur += clamp(diff, -turn, turn);
          const sp = Math.hypot(b.vx, b.vy);
          b.vx = Math.cos(cur) * sp;
          b.vy = Math.sin(cur) * sp;
        }
      }
      if (b.kind >= 20) this.kit.updateBullet?.(this, b, dt);
      if (!b.alive) continue;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.kind === 1) b.x += Math.cos(b.t * b.c) * b.b * b.a * dt;
      b.rot += b.spin * dt;
      if (b.x < -60 || b.x > W + 60 || b.y < -80 || b.y > H + 80) {
        this.pb.kill(i);
        continue;
      }
      // 命中敵機
      for (let j = 0; j < en.length; j++) {
        const e = en[j];
        if (e.dead || e.alpha < 0 || e.y < -30) continue;
        if (e.def.ai === "ghost" && e.invuln) continue;
        const rr = e.r + b.r * b.scale * 0.8;
        const dx = e.x - b.x;
        const dy = e.y - b.y;
        if (dx * dx + dy * dy > rr * rr) continue;
        if (b.hits.length && b.hits.indexOf(e.uid) >= 0) continue;
        this.hitEnemy(b, e);
        if (!b.alive) break;
        if (b.pierce > 0) {
          b.pierce--;
          b.hits.push(e.uid);
          if (b.ramp > 0 && b.a < b.b) {
            b.a++;
            b.dmg *= 1 + b.ramp;
          }
        } else {
          b.alive = false;
          break;
        }
      }
      if (!b.alive) {
        this.pb.kill(i);
      }
    }
    void p;
  }

  hitEnemy(b: PBullet, e: Enemy) {
    const p = this.p;
    if (e.invuln) {
      this.fx.hit(b.x, b.y, "#9aa6b6");
      if (b.pierce <= 0) b.alive = false;
      return;
    }
    let d = b.dmg;
    const crit = Math.random() < p.s.crit;
    if (crit) d *= p.s.critDmg;
    this.fx.hit(b.x, b.y, crit ? "#ffd36b" : this.ship.color2);
    audio.sfx("hit", 0.05);
    this.damageEnemy(e, d, { crit, x: b.x, y: b.y });
    if (b.src < 2) {
      this.addUlt(0.05);
    }
    this.kit.onHit?.(this, b, e, d);
    if (!b.alive && b.pierce <= 0) return;
    if (b.burn > 0) e.burn = Math.max(e.burn, 2 + b.burn);
    if (b.slow > 0) e.slow = Math.max(e.slow, 0.8 + b.slow * 0.5);
    if (b.chain > 0) this.chain(e.x, e.y, b.chain, d * 0.5, e.uid);
    if (p.s.explode > 0 && b.src < 2 && (b.kind === 0 || b.kind === 1)) this.aoe(b.x, b.y, 44, d * p.s.explode, { noText: true, small: true, skip: e.uid, pal: "gold" });
  }

  updateEBullets(dt: number) {
    const arr = this.eb.items;
    const p = this.p;
    const hitR = 4.6;
    const grazeR = 20;
    const gs = this.bulletSlow;
    for (let i = arr.length - 1; i >= 0; i--) {
      const b = arr[i];
      if (!b.alive) {
        this.eb.kill(i);
        continue;
      }
      b.t += dt;
      let spd = b.spd;
      switch (b.mode) {
        case 1:
          b.spd += b.acc * dt;
          if (b.b > 0 && b.spd > b.b) b.spd = b.b;
          spd = b.spd;
          break;
        case 2:
          b.ang += b.turn * dt;
          break;
        case 3:
          b.spd *= Math.max(0, 1 - 1.9 * dt);
          spd = b.spd;
          if (b.t >= b.b) {
            ring(this, b.x, b.y, b.a, 135, 0, b.color);
            audio.sfx("hit", 0.08);
            b.alive = false;
            continue;
          }
          break;
        case 4:
          if (b.t < b.a) spd = 0;
          else {
            b.mode = 1;
            b.spd = 20;
          }
          break;
      }
      const s = spd * b.slow * gs;
      b.slow = 1;
      b.x += Math.cos(b.ang) * s * dt + (b.mode === 5 ? Math.cos(b.t * b.a) * b.b * dt : 0);
      b.y += Math.sin(b.ang) * s * dt;
      if (b.x < -50 || b.x > W + 50 || b.y < -70 || b.y > H + 70) {
        b.alive = false;
        continue;
      }
      if (this.stateName !== "playing") continue;
      const dx = b.x - p.x;
      const dy = b.y - p.y;
      const d2 = dx * dx + dy * dy;
      const hr = b.r + hitR;
      if (d2 < hr * hr) {
        b.alive = false;
        this.hurt(b.dmg);
      } else if (!b.grazed) {
        const gr = b.r + grazeR;
        if (d2 < gr * gr) {
          b.grazed = true;
          this.grazeCount++;
          this.score += Math.round(20 * p.s.grazeMul);
          this.addUlt(0.35 * p.s.grazeMul);
          this.fx.glowP(b.x, b.y, 0, 0, 0.15, 6, "#ffffff", 12, 0, 0.9);
          audio.sfx("graze", 0.06);
          this.kit.onGraze?.(this);
        }
      }
    }
    // 敵機碰撞
    if (this.stateName === "playing") {
      for (const e of this.en.items) {
        if (e.dead || e.alpha < 0.3 || e.invuln) continue;
        const rr = e.r * 0.8 + 5;
        if (dist2(e.x, e.y, p.x, p.y) < rr * rr) {
          if (e.def.ai === "dive") {
            this.fx.explosion(e.x, e.y, 20, PAL.fire);
            e.dead = true;
            e.alpha = -1;
            this.hurt(this.ebDmg() * 1.4);
          } else if (!e.boss) {
            this.hurt(this.ebDmg() * 1.2);
          } else this.hurt(this.ebDmg() * 1.5);
        }
      }
    }
  }

  updateBeams(dt: number) {
    const arr = this.beams.items;
    const p = this.p;
    this.beamHitCd -= dt;
    for (let i = arr.length - 1; i >= 0; i--) {
      const b = arr[i];
      if (!b.alive) {
        this.beams.kill(i);
        continue;
      }
      b.t += dt;
      if (b.follow) {
        if (b.follow.dead || !b.follow.alive) {
          b.alive = false;
          continue;
        }
        b.x = b.follow.x + b.ox;
        b.y = b.follow.y + b.oy;
      }
      b.ang += b.rot * dt;
      if (b.t >= b.warn + b.life) {
        b.alive = false;
        continue;
      }
      const active = b.t >= b.warn;
      if (active && !(b as any).fired) {
        (b as any).fired = true;
        if (b.dmg > 0) {
          audio.sfx((b as any).thunder ? "lightning" : "laser", 0.1);
          if ((b as any).thunder) {
            this.bg.strike();
            this.shake(5, 0.2);
          }
        }
      }
      if (active && b.dmg > 0 && this.stateName === "playing" && this.beamHitCd <= 0) {
        const ex = b.x + Math.cos(b.ang) * b.len;
        const ey = b.y + Math.sin(b.ang) * b.len;
        const d = distSeg(p.x, p.y, b.x, b.y, ex, ey);
        if (d < b.w / 2 + 3) {
          this.beamHitCd = 0.3;
          this.hurt(b.dmg);
        }
      }
    }
  }

  updatePickups(dt: number) {
    const arr = this.pk.items;
    const p = this.p;
    for (let i = arr.length - 1; i >= 0; i--) {
      const k = arr[i];
      k.t += dt;
      const dx = p.x - k.x;
      const dy = p.y - k.y;
      const d = Math.hypot(dx, dy) || 1;
      const magR = (k.kind === PK.EXP ? 150 : k.kind === PK.COIN ? 120 : 100) * p.s.magnet;
      if (k.mag || d < magR || k.t > 6) {
        k.mag = true;
        const sp = 520 + k.t * 60;
        k.vx += ((dx / d) * sp - k.vx) * Math.min(1, dt * 8);
        k.vy += ((dy / d) * sp - k.vy) * Math.min(1, dt * 8);
      } else {
        k.vx *= 1 - Math.min(1, dt * 2.2);
        k.vy += (60 - k.vy) * Math.min(1, dt * 1.2);
      }
      k.x += k.vx * dt;
      k.y += k.vy * dt;
      if (this.stateName === "playing" && d < 24) {
        this.collect(k);
        this.pk.kill(i);
        continue;
      }
      if (k.y > H + 40 || k.x < -40 || k.x > W + 40) {
        if (k.kind === PK.GEAR && k.item) {
          // 稀有裝備不會掉出畫面：直接拾取
          this.collect(k);
        }
        this.pk.kill(i);
      }
    }
  }

  updateHud() {
    const h = this.hud;
    const p = this.p;
    h.hp = Math.max(0, p.hp);
    h.maxHp = p.maxHp;
    h.shield = p.shield;
    h.exp = this.exp;
    h.expNeed = this.expNeed;
    h.level = this.level;
    h.score = Math.round(this.score);
    h.combo = this.combo;
    h.comboT = this.comboT > 0 ? clamp(this.comboT / (2.4 + p.s.comboWin), 0, 1) : 0;
    h.activeCd = p.activeCd > 0 ? 1 - p.activeCd / Math.max(0.1, p.activeMax) : 1;
    h.ult = p.ult / 100;
    h.ultReady = p.ult >= 100;
    h.power = p.power;
    h.form = p.form;
    h.time = this.time;
    h.fps = this.fps;
    h.progress = this.stage ? clamp(this.stageT / this.stage.len, 0, 1) : (this.chunk % 9) / 9;
    const b = this.boss && !this.boss.dead ? this.boss : this.mid && !this.mid.dead ? this.mid : null;
    h.boss = b ? { name: b.def.name, hp: clamp(b.hp / b.maxHp, 0, 1), ph: b.ph } : null;
    h.callout = this.calloutT > 0 ? this.callout : "";
    h.calloutColor = this.calloutColor;
  }

  // ------------------------------------------------------------------
  // 結算
  finish(win: boolean) {
    if (this.finished) return;
    this.finished = true;
    const stage = this.stage;
    const diffM = this.dm.reward;
    const st = this.save.stages;
    let coins = Math.round(this.coins * (win ? 1 : 0.7));
    let cores = this.cores;
    if (win && stage) {
      coins += Math.round(900 * stage.reward * diffM);
      cores += 2 + Math.floor(stage.id / 2) + this.diff;
    }
    if (!win && this.endless) coins += Math.round(this.time * 2 * (1 + this.chunk * 0.1));
    if (this.endless) cores += Math.floor(this.chunk / 3);
    const base = this.stage ? 30000 * Math.pow(this.stage.hpMul, 0.9) * (1 + this.diff * 0.6) : 40000;
    let rank: RunResult["rank"] = "C";
    if (this.endless) rank = this.time > 900 ? "S" : this.time > 540 ? "A" : this.time > 240 ? "B" : "C";
    else if (this.score >= base * 1.2 && win) rank = "S";
    else if (this.score >= base * 0.8 && win) rank = "A";
    else if (this.score >= base * 0.4 || win) rank = "B";
    const key = String(this.stage ? this.stage.id : 0);
    const prev = this.endless ? this.save.endless.hi : st[key]?.hi?.[this.diff] || 0;
    const newHi = this.score > prev;
    const res: RunResult = {
      mode: this.endless ? "endless" : "stage", stageId: this.stage ? this.stage.id : 0, diff: this.diff, ship: this.ship.id, win, score: Math.round(this.score), kills: this.kills, maxCombo: this.maxCombo,
      time: this.time, coins, cores, items: this.items, level: this.level, wave: this.chunk + 1, rank, newHi,
    };
    mutate((d) => {
      d.coins += coins;
      d.cores += cores;
      d.stats.kills += this.kills;
      d.stats.runs += 1;
      d.stats.playSec += Math.round(this.time);
      d.stats.maxCombo = Math.max(d.stats.maxCombo, this.maxCombo);
      if (this.endless) {
        d.endless.hi = Math.max(d.endless.hi, Math.round(this.score));
        d.endless.time = Math.max(d.endless.time, Math.round(this.time));
        d.endless.wave = Math.max(d.endless.wave, this.chunk + 1);
      } else {
        const r = d.stages[key] || { clear: [false, false, false], hi: [0, 0, 0] };
        if (win) r.clear[this.diff] = true;
        r.hi[this.diff] = Math.max(r.hi[this.diff] || 0, Math.round(this.score));
        d.stages[key] = r;
      }
      d.ships[this.ship.id].best = Math.max(d.ships[this.ship.id].best, Math.round(this.score));
    });
    addItems(this.items);
    audio.sfx(win ? "clear" : "fail");
    if (win) this.cb.onClear?.(res);
    else this.cb.onOver?.(res);
  }

  /** 玩家主動放棄／離開 */
  abort() {
    if (!this.finished) {
      this.finished = true;
    }
    this.stop();
  }
}

function distSeg(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy || 1;
  const t = clamp(((px - x1) * dx + (py - y1) * dy) / l2, 0, 1);
  return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
}

function parseRgba(s: string): [number, number, number, number] {
  const m = s.match(/[\d.]+/g) || ["0", "0", "0", "0"];
  return [+m[0], +m[1], +m[2], +m[3]];
}

function gradeAt(g: [string, string, string], pr: number): string {
  const a = parseRgba(g[0]);
  const b = parseRgba(g[1]);
  const c = parseRgba(g[2]);
  const [from, to, k] = pr < 0.5 ? [a, b, pr * 2] : [b, c, (pr - 0.5) * 2];
  const r = from.map((v, i) => v + (to[i] - v) * k);
  return `rgba(${Math.round(r[0])},${Math.round(r[1])},${Math.round(r[2])},${r[3].toFixed(3)})`;
}

void HAZARD_INFO;
