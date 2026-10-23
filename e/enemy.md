// ====== 來源: src/game/data/enemies.ts ======
// 敵機與 Boss 資料表（數值為「普通難度、第一關」基準，實戰時依關卡與難度倍率縮放）
import type { EnemyDef } from "../entities";

export const ENEMIES: Record<string, EnemyDef> = {
  scout: { id: "scout", name: "斥候機", hp: 22, r: 13, spd: 130, score: 100, exp: 2, ai: "straight", size: 36 },
  dart: { id: "dart", name: "飛鏢機", hp: 14, r: 11, spd: 250, score: 120, exp: 2, ai: "swoop", size: 32 },
  wing: { id: "wing", name: "編隊僚機", hp: 32, r: 14, spd: 150, score: 140, exp: 3, ai: "sine", size: 40 },
  sentry: { id: "sentry", name: "哨戒砲艇", hp: 120, r: 19, spd: 95, score: 300, exp: 6, ai: "hover", size: 50 },
  spinner: { id: "spinner", name: "旋刃戰機", hp: 170, r: 20, spd: 90, score: 380, exp: 8, ai: "spinner", size: 52 },
  heavy: { id: "heavy", name: "重裝砲艦", hp: 420, r: 27, spd: 62, score: 700, exp: 14, ai: "heavy", size: 72 },
  kami: { id: "kami", name: "自爆蟲", hp: 42, r: 14, spd: 300, score: 160, exp: 3, ai: "dive", size: 34 },
  turret: { id: "turret", name: "地面砲台", hp: 130, r: 18, spd: 0, score: 260, exp: 5, ai: "turret", size: 46, ground: true },
  minelayer: { id: "minelayer", name: "佈雷艦", hp: 260, r: 26, spd: 120, score: 520, exp: 10, ai: "mine", size: 68 },
  sniper: { id: "sniper", name: "狙擊艇", hp: 150, r: 18, spd: 80, score: 420, exp: 8, ai: "sniper", size: 48 },
  cruiser: { id: "cruiser", name: "雷射巡洋艦", hp: 680, r: 32, spd: 55, score: 1100, exp: 20, ai: "laser", size: 94 },
  ghost: { id: "ghost", name: "幻影機", hp: 110, r: 17, spd: 100, score: 400, exp: 8, ai: "ghost", size: 46 },
  carrier: { id: "carrier", name: "航空母艦", hp: 820, r: 36, spd: 45, score: 1400, exp: 24, ai: "carrier", size: 104 },
  aegis: { id: "aegis", name: "神盾護衛", hp: 210, r: 21, spd: 100, score: 480, exp: 9, ai: "aegis", size: 56 },
  orbiter: { id: "orbiter", name: "環繞衛星", hp: 60, r: 14, spd: 110, score: 200, exp: 4, ai: "orbit", size: 36 },
  // 中型 Boss
  mid_gunship: { id: "mid_gunship", name: "重武裝砲艇", hp: 7200, r: 46, spd: 70, score: 6000, exp: 90, ai: "mid", size: 132, mid: true },
  mid_walker: { id: "mid_walker", name: "多足步行砲台", hp: 8200, r: 48, spd: 60, score: 7000, exp: 100, ai: "mid", size: 140, mid: true },
  mid_cruiser: { id: "mid_cruiser", name: "戰列巡防艦", hp: 9000, r: 50, spd: 55, score: 8000, exp: 110, ai: "mid", size: 150, mid: true },

  // ═══════════ port/008 移植（絳月天穹 CRIMSON ZENITH）════════════
  // id 一律 `cz_` 前綴、ai 一律 `cz_*`：與母專案同名敵人並存，行為互不干擾。
  // （008 的基礎 AI 已被該專案重寫，故 15 個基礎詞彙也走 CUSTOM_AI，而非母專案的既有行為。）
  // ── 15 種基礎詞彙（008 版）──
  cz_scout: { id: "cz_scout", name: "魘影斥候", hp: 22, r: 13, spd: 130, score: 80, exp: 3, ai: "cz_straight", size: 40 },
  cz_dart: { id: "cz_dart", name: "絳羽飛鏢", hp: 16, r: 11, spd: 300, score: 100, exp: 3, ai: "cz_swoop", size: 34 },
  cz_wing: { id: "cz_wing", name: "夜翼擺盪者", hp: 34, r: 15, spd: 110, score: 140, exp: 4, ai: "cz_sine", size: 44 },
  cz_sentry: { id: "cz_sentry", name: "守望燈塔", hp: 80, r: 18, spd: 90, score: 240, exp: 8, ai: "cz_hover", size: 52 },
  cz_spinner: { id: "cz_spinner", name: "迴旋風輪", hp: 90, r: 19, spd: 80, score: 280, exp: 9, ai: "cz_spinner", size: 54 },
  cz_heavy: { id: "cz_heavy", name: "重甲魘騎", hp: 300, r: 28, spd: 50, score: 600, exp: 24, ai: "cz_heavy", size: 78 },
  cz_kami: { id: "cz_kami", name: "神風魘彈", hp: 24, r: 12, spd: 220, score: 110, exp: 3, ai: "cz_dive", size: 36 },
  cz_turret: { id: "cz_turret", name: "地表砲台", hp: 110, r: 18, spd: 0, score: 220, exp: 7, ai: "cz_turret", size: 50, ground: true },
  cz_minelayer: { id: "cz_minelayer", name: "佈雷魘機", hp: 120, r: 20, spd: 70, score: 300, exp: 10, ai: "cz_mine", size: 58 },
  cz_sniper: { id: "cz_sniper", name: "穿心狙擊手", hp: 70, r: 15, spd: 80, score: 260, exp: 8, ai: "cz_sniper", size: 44 },
  cz_cruiser: { id: "cz_cruiser", name: "裂光巡洋", hp: 420, r: 30, spd: 40, score: 800, exp: 30, ai: "cz_laser", size: 86 },
  cz_ghost: { id: "cz_ghost", name: "幽影潛行者", hp: 60, r: 15, spd: 100, score: 260, exp: 8, ai: "cz_ghost", size: 44 },
  cz_carrier: { id: "cz_carrier", name: "巢母運載艦", hp: 380, r: 30, spd: 45, score: 760, exp: 28, ai: "cz_carrier", size: 90 },
  cz_aegis: { id: "cz_aegis", name: "圓盾護衛", hp: 220, r: 24, spd: 60, score: 520, exp: 18, ai: "cz_aegis", size: 70 },
  cz_orbiter: { id: "cz_orbiter", name: "環軌魘珠", hp: 90, r: 17, spd: 100, score: 300, exp: 9, ai: "cz_orbit", size: 48 },
  // ── 008 自創 AI ──
  cz_weaver: { id: "cz_weaver", name: "織夜蝶機", hp: 60, r: 15, spd: 120, score: 220, exp: 7, ai: "cz_weave", size: 46 },
  cz_lantern: { id: "cz_lantern", name: "怨燈", hp: 50, r: 16, spd: 70, score: 200, exp: 6, ai: "cz_lantern", size: 44 },
  cz_pillar: { id: "cz_pillar", name: "鳴柱", hp: 150, r: 20, spd: 0, score: 300, exp: 10, ai: "cz_pillar", size: 56, ground: true },
  cz_mirror: { id: "cz_mirror", name: "鏡面刺客", hp: 100, r: 16, spd: 0, score: 340, exp: 11, ai: "cz_mirror", size: 48 },
  cz_swarm: { id: "cz_swarm", name: "螢火群", hp: 10, r: 9, spd: 200, score: 50, exp: 1, ai: "cz_swarm", size: 26 },
  cz_bomber: { id: "cz_bomber", name: "夜行轟炸機", hp: 160, r: 22, spd: 100, score: 420, exp: 14, ai: "cz_bomber", size: 62 },
  // ── 中型 Boss（跳過第 4 關專屬的 cz_mid_oni）──
  cz_mid_gunship: { id: "cz_mid_gunship", name: "絳月砲艇「斬夜」", hp: 3000, r: 40, spd: 60, score: 4000, exp: 90, ai: "mid", size: 120, mid: true },
  cz_mid_walker: { id: "cz_mid_walker", name: "潮岸步行砲「蟹將」", hp: 3600, r: 42, spd: 55, score: 5000, exp: 110, ai: "mid", size: 124, mid: true },
  cz_mid_cruiser: { id: "cz_mid_cruiser", name: "霜牙巡航艦「裂冰」", hp: 4200, r: 44, spd: 50, score: 6000, exp: 130, ai: "mid", size: 128, mid: true },
  cz_mid_sentinel: { id: "cz_mid_sentinel", name: "迴廊哨兵「天秤」", hp: 5600, r: 44, spd: 55, score: 8000, exp: 170, ai: "mid", size: 130, mid: true },
  cz_mid_saint: { id: "cz_mid_saint", name: "墮聖者「殘光」", hp: 6200, r: 46, spd: 55, score: 9000, exp: 190, ai: "mid", size: 134, mid: true },
};

/**
 * 基礎詞彙 → 本專案 id 的對照表（跨專案擴充點）。
 *
 * 宿主檔（`engine/enemyAI.ts`／`bossAI.ts`／`hazards.ts`）是**照抄母專案**的，裡面用「基礎詞彙」
 * 呼叫 `g.spawnEnemy("scout" | "dart" | "kami", …)`——那些檔案不能改。
 * 一旦你把基礎 18 種敵人的 id 加上前綴（`代號_scout` …；代號＝你專案的 2~4 字母代號），
 * 就要在這裡把詞彙對到你的 id：
 *
 * ```ts
 * export const ENEMY_ALIAS: Record<string, string> = {
 *   scout: "ek_scout", dart: "ek_dart", kami: "ek_kami",
 * };
 * ```
 *
 * 沒填的後果**不會報錯**：`carrier` 放不出護衛、Boss 的飛鏢彈幕空掉、
 * `torpedo` 事件放不出自爆機——只是空轉。
 *
 * 母專案自己的 id 就是基礎詞彙 → 這張表留空。**合併時不要把新專案的這張表搬回母專案。**
 */
export const ENEMY_ALIAS: Record<string, string> = {};

export interface BossDef {
  id: number;
  name: string;
  title: string;
  hp: number;
  r: number;
  art: number; // Boss 設定圖索引
  color: string;
  quote: string;
}

export const BOSSES: BossDef[] = [
  { id: 0, name: "晶冠機神", title: "CRYSTAL SOVEREIGN", hp: 17000, r: 62, art: 1, color: "#b26bff", quote: "霓虹之下，皆為我的領土。" },
  { id: 1, name: "深藍旗艦", title: "ABYSS FLAGSHIP", hp: 22000, r: 68, art: 2, color: "#4a8dff", quote: "艦隊，齊射準備。" },
  { id: 2, name: "冰霜巨蟲", title: "FROSTFANG WYRM", hp: 27000, r: 60, art: 3, color: "#7fe4ff", quote: "萬物終將凍結於寂靜之中。" },
  { id: 3, name: "熔核巨像", title: "MAGMA COLOSSUS", hp: 34000, r: 74, art: 4, color: "#ff7a2a", quote: "燒盡一切，只留下灰燼。" },
  { id: 4, name: "緋紅絕翼", title: "SCARLET ANNIHILATOR", hp: 40000, r: 64, art: 0, color: "#ff3b52", quote: "你的天空，到此為止。" },
  { id: 5, name: "天頂王座", title: "ZENITH THRONE", hp: 58000, r: 72, art: 5, color: "#ffd36b", quote: "叛逆者啊，來坐上這張王座吧。" },
  // ── port/008 五位 Boss（跳過第 4 關專屬的 art3「焦獄鬼面」）──
  // `art` 索引的是 `boss_sheet_cz`（來源圖集）；繪製端以 `id ≥ 6` 區分兩張圖集（見 bossDraw.ts）。
  // hp 為基準值，實戰＝hp × 關卡 hpMul 的 0.85 次方 × 難度；已接續母專案第 6 關（58000）之後遞增。
  { id: 6, name: "絳月魔瞳", title: "窺天之眼", hp: 66000, r: 58, art: 0, color: "#ff2d5a", quote: "我看見了……你們的終末。" },
  { id: 7, name: "潮喰鯨艦", title: "深淵吞海者", hp: 76000, r: 66, art: 1, color: "#2ff2d2", quote: "整片海，都是我的胃袋。" },
  { id: 8, name: "凍嶺龍王", title: "霜翼之主", hp: 88000, r: 64, art: 2, color: "#8fdcff", quote: "寒冬，由我而生。" },
  { id: 9, name: "幻象機神", title: "神諭演算體", hp: 102000, r: 60, art: 4, color: "#ff3df0", quote: "命運的演算，早已結束。" },
  { id: 10, name: "冠冕魘王", title: "絳月之主", hp: 120000, r: 66, art: 5, color: "#ffc94a", quote: "跪下吧——這片天空，是我的王座。" },
];

/** 母專案（SP 自家）的 Boss 數量。無限模式只會輪到這幾隻；
 *  port/008 的 5 隻（id ≥ 6）只在對應關卡中出現（避免無限模式被 12 萬血的魘王卡死）。 */
export const SP_BOSS_COUNT = 6;

/** 各關卡敵機配色 */
export const THEME_PAL = [
  { h1: "#8a90d8", h2: "#20224a", ac: "#ff3bd0", gl: "#ff8aea" },
  { h1: "#9ec0e0", h2: "#1c3550", ac: "#ffb347", gl: "#ffd99a" },
  { h1: "#f0fbff", h2: "#3a6a8a", ac: "#47e0ff", gl: "#b0f4ff" },
  { h1: "#9a7468", h2: "#2a1614", ac: "#ff7a2a", gl: "#ffc28a" },
  { h1: "#8a8a9e", h2: "#1e1e2c", ac: "#ff3b52", gl: "#ff9aa8" },
  { h1: "#b8a0e0", h2: "#241a40", ac: "#ffd36b", gl: "#fff0b0" },
  // ── port/008 六關配色（索引與來源一致；9「焦獄火脈」因第 4 關不移植而保留未用）──
  { h1: "#3a2f68", h2: "#16142e", ac: "#ff3b6b", gl: "#ff9ab5" }, // 6 朱夜都心
  { h1: "#1f5a68", h2: "#0c2430", ac: "#2ff2d2", gl: "#aaffee" }, // 7 潮鳴深海
  { h1: "#5d8fae", h2: "#1d3550", ac: "#9ae6ff", gl: "#e6fbff" }, // 8 霜翼凍嶺
  { h1: "#5a2418", h2: "#220e0c", ac: "#ff7a2a", gl: "#ffd09a" }, // 9 焦獄火脈（不移植，故未使用）
  { h1: "#32205e", h2: "#100b26", ac: "#ff3df0", gl: "#39ff8a" }, // 10 機神迴廊
  { h1: "#46204a", h2: "#140a22", ac: "#ffc94a", gl: "#ff6a86" }, // 11 絳月王座
];


// ====== 來源: src/game/engine/bossAI.ts ======
// Boss 與中型 Boss 的多階段彈幕腳本：每隻 Boss 三個階段，各有獨立的彈幕語彙
import { clamp, H, TAU, W, easeOut, lerp, rand } from "../constants";
import type { Enemy } from "../entities";
import { aim, aimedFan, aimedStream, beamFan, CZ_BEAM_COL, curtain, delayed, fan, lattice, mine, ring, ringGap, rndX, rose, spiral, stream, wavy } from "./patterns";
import { cbeamDmg, ctick } from "./enemyAI";
import { gateFreeze, tickFreezeCd } from "./freezeResist";
import type { Game } from "./Game";

function tk(e: Enemy, i: number, d: number, iv: number): boolean {
  e.tm[i] -= d;
  if (e.tm[i] <= 0) {
    e.tm[i] += iv;
    if (e.tm[i] < -iv) e.tm[i] = 0;
    return true;
  }
  return false;
}

// ── port/008 移植的 Boss／中王 helper（來源 engine/bossAI.ts）──
/** 平滑趨向目標點（008 的 mv） */
const mv = (e: Enemy, tx: number, ty: number, dt: number, k = 2.2) => {
  e.x += (tx - e.x) * Math.min(1, k * dt);
  e.y += (ty - e.y) * Math.min(1, k * dt);
};
/** 以實體為中心的隨機 x（008 的 rndX；與 patterns 的無參數 rndX 不同） */
const crndX = (e: Enemy) => clamp(e.x + (Math.random() - 0.5) * 360, 30, W - 30);

/**
 * 跨專案擴充點：自訂 Boss／中型 Boss 行為。
 * - 上方既有 case（母專案 6 隻）與 `updateMid` 的既有分支一律**不得修改**。
 * - `CUSTOM_BOSS[bossId]`：以 **bossId** 覆寫該隻 Boss 的攻擊；簽名同 updateBoss，
 *   在「進場／階段切換」之後被呼叫，你只要負責開火與移動（e.tm[] 可用）。
 *   ⚠ 母專案 Boss 佔 id 0~5；port/008 的 5 隻為 id 6~10（4 階段、自管移動）。
 * - `CUSTOM_MID[id]`：以 `EnemyDef.id` 覆寫該隻中型 Boss 的攻擊；簽名同 updateMid。
 * - 搬移＝把新條目整段複製回母專案（衝突只會落在這兩個物件內）。
 */
export const CUSTOM_BOSS: Record<number, (g: Game, e: Enemy, dt: number, ph: number) => void> = {
  // ═══ port/008 五位 Boss（key＝母專案 BOSSES 索引 6~10；來源 id 0/1/2/4/5）═══
  // 4 階段（ph 0~3）；`e.a` 為螺旋角累加器、`e.b` 為格狀相位 → updateBoss 對 id ≥ 6 不介入移動。
  // ── 6 絳月魔瞳：環形彈 → 三臂螺旋 → 凝視光束 → 雙螺旋＋缺口環 ──
  6: (g, e, dt, ph) => {
    const D = g.diff;
    mv(e, W / 2 + Math.sin(e.t * 0.5) * (ph >= 2 ? 170 : 120), 190 + Math.sin(e.t * 0.8) * 12, dt, 1.6);
    if (ph === 0) {
      if (ctick(e, 0, dt, 1.25)) aimedFan(g, e.x, e.y + 30, 5 + D, 1.0, 210, 0, 0);
      if (ctick(e, 1, dt, 3.0)) ring(g, e.x, e.y, 16 + D * 3, 150, 3, 1, e.t);
    } else if (ph === 1) {
      if (ctick(e, 0, dt, 0.11)) { e.a += 0.23; spiral(g, e.x, e.y, 3, 170, 1, 5, e.a); }
      if (ctick(e, 1, dt, 1.9)) { aimedFan(g, e.x - 70, e.y, 3, 0.4, 230, 4, 4); aimedFan(g, e.x + 70, e.y, 3, 0.4, 230, 4, 4); }
    } else if (ph === 2) {
      if (ctick(e, 0, dt, 3.4)) beamFan(g, e.x, e.y + 40, 3 + (D > 1 ? 2 : 0), 0.9, aim(g, e.x, e.y + 40), 26, 1.1, 0.7, 18, 0, e);
      if (ctick(e, 1, dt, 2.6)) curtain(g, e.y + 20, g.p.x, 175 - D * 10, 190, 1, 1);
      if (ctick(e, 2, dt, 0.9)) aimedFan(g, e.x, e.y, 5, 0.7, 240, 0, 0);
    } else {
      if (ctick(e, 0, dt, 0.09)) { e.a += 0.31; spiral(g, e.x, e.y, 4, 180, 1, 6, e.a); }
      if (ctick(e, 1, dt, 2.6)) ringGap(g, e.x, e.y, 30, 170, 0, 2, aim(g, e.x, e.y), 0.9);
      if (ctick(e, 2, dt, 3.8)) beamFan(g, e.x, e.y + 40, 5, 1.4, Math.PI / 2, 24, 1.0, 0.6, 18, 0, e);
    }
  },
  // ── 7 潮喰鯨艦：舷側砲擊、魚雷、聲納環、尾鰭掃射 ──
  7: (g, e, dt, ph) => {
    const D = g.diff;
    mv(e, W / 2 + Math.sin(e.t * 0.4) * 150, 180, dt, 1.4);
    if (ph === 0) {
      if (ctick(e, 0, dt, 1.1)) { aimedFan(g, e.x - 70, e.y + 40, 3, 0.3, 220, 1, 4); aimedFan(g, e.x + 70, e.y + 40, 3, 0.3, 220, 1, 4); }
      if (ctick(e, 1, dt, 5.0)) { g.spawnEnemy("cz_kami", -30, 200, { dir: 1 }); g.spawnEnemy("cz_kami", W + 30, 200, { dir: -1 }); }
    } else if (ph === 1) {
      if (ctick(e, 0, dt, 2.2)) for (let k = 0; k < 3; k++) g.later(k * 0.28, () => ring(g, e.x, e.y + 20, 20 + D * 2, 130 + k * 25, 0, 4, k * 0.2));
      if (ctick(e, 1, dt, 2.8)) curtain(g, e.y + 30, g.p.x, 165 - D * 10, 180, 1, 4);
    } else if (ph === 2) {
      e.a += dt * 1.6;
      if (ctick(e, 0, dt, 0.09)) stream(g, e.x, e.y + 60, Math.PI / 2 + Math.sin(e.a) * 0.9, 1, 220, 0, 1, 4);
      if (ctick(e, 1, dt, 1.6)) aimedFan(g, e.x, e.y + 20, 7, 1.1, 220, 4, 4);
      if (ctick(e, 2, dt, 4.2)) beamFan(g, e.x - 70, e.y + 30, 2, 0.3, Math.PI / 2, 22, 1.0, 0.7, 16, 0, e);
    } else {
      if (ctick(e, 0, dt, 0.8)) { aimedFan(g, e.x - 76, e.y + 40, 4, 0.5, 240, 1, 4); aimedFan(g, e.x + 76, e.y + 40, 4, 0.5, 240, 1, 4); }
      if (ctick(e, 1, dt, 2.4)) ring(g, e.x, e.y + 20, 26, 150, 0, 4, e.t);
      if (ctick(e, 2, dt, 3.0)) curtain(g, e.y + 30, g.p.x, 160 - D * 10, 190, 1, 4);
      if (ctick(e, 3, dt, 4.6)) beamFan(g, e.x, e.y + 40, 5, 1.2, Math.PI / 2, 24, 1.0, 0.7, 16, 0, e);
    }
  },
  // ── 8 凍嶺龍王：翼端扇形、冰息、冰錐雨、暴雪格 ──
  8: (g, e, dt, ph) => {
    const D = g.diff;
    mv(e, W / 2 + Math.sin(e.t * 0.55) * 120, (ph === 2 ? 240 : 190) + Math.sin(e.t * 1.1) * 14, dt, 1.8);
    if (ph === 0) {
      if (ctick(e, 0, dt, 1.3)) { aimedFan(g, e.x - 150, e.y + 20, 3, 0.4, 210, 4, 4); aimedFan(g, e.x + 150, e.y + 20, 3, 0.4, 210, 4, 4); }
      if (ctick(e, 1, dt, 2.4)) aimedFan(g, e.x, e.y - 20, 5 + D, 0.9, 200, 0, 4);
    } else if (ph === 1) {
      if (ctick(e, 0, dt, 0.07)) aimedStream(g, e.x, e.y - 30, 1, 260, 0, 2, 4, 0.35);
      if (ctick(e, 1, dt, 0.35)) g.spawnEB(Math.random() * W, -10, Math.PI / 2, 260, 2, 4);
      if (ctick(e, 2, dt, 3.0)) ring(g, e.x, e.y, 18, 140, 4, 4, e.t);
    } else if (ph === 2) {
      if (ctick(e, 0, dt, 2.2)) ringGap(g, e.x, e.y, 30, 170, 0, 4, aim(g, e.x, e.y), 0.85);
      if (ctick(e, 1, dt, 1.1)) { aimedFan(g, e.x - 160, e.y, 4, 0.7, 230, 4, 4); aimedFan(g, e.x + 160, e.y, 4, 0.7, 230, 4, 4); }
      if (ctick(e, 2, dt, 0.4)) g.spawnEB(Math.random() * W, -10, Math.PI / 2, 280, 2, 4);
    } else {
      if (ctick(e, 0, dt, 0.5)) { e.b += 0.5; lattice(g, -10, 9, 150, 4, 4, e.b % 1); }
      if (ctick(e, 1, dt, 3.2)) beamFan(g, e.x, e.y - 20, 5, 1.0, Math.PI / 2, 26, 1.0, 0.7, 18, 4, e);
      if (ctick(e, 2, dt, 1.0)) aimedFan(g, e.x, e.y, 7, 1.2, 230, 0, 4);
      if (ctick(e, 3, dt, 0.1)) { e.a += 0.28; spiral(g, e.x, e.y, 2, 160, 4, 4, e.a); }
    }
  },
  // ── 9 幻象機神：六面板射線、格狀矩陣、旋轉多臂、全面演算 ──
  9: (g, e, dt, ph) => {
    const D = g.diff;
    mv(e, W / 2 + Math.sin(e.t * 0.45) * 130, 190 + Math.sin(e.t * 0.9) * 14, dt, 1.6);
    if (ph === 0) {
      if (ctick(e, 0, dt, 1.2)) for (let i = 0; i < 6; i++) { const a = e.t + (i * Math.PI) / 3; aimedFan(g, e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 60, 1, 0, 240, 4, 5); }
      if (ctick(e, 1, dt, 2.8)) ring(g, e.x, e.y, 18 + D * 2, 150, 4, 6, e.t);
    } else if (ph === 1) {
      if (ctick(e, 0, dt, 0.55)) { e.b += 0.5; lattice(g, e.y + 30, 10, 160, 4, 5 + (e.b % 2 | 0), e.b % 1); }
      if (ctick(e, 1, dt, 3.6)) beamFan(g, e.x, e.y + 30, 7, 1.8, Math.PI / 2, 22, 1.1, 0.6, 16, 5, e);
    } else if (ph === 2) {
      if (ctick(e, 0, dt, 0.1)) { e.a += 0.19; spiral(g, e.x, e.y, 4, 170, 4, 5, e.a); spiral(g, e.x, e.y, 4, 170, 4, 6, -e.a); }
      if (ctick(e, 1, dt, 2.4)) curtain(g, e.y, g.p.x, 160 - D * 10, 190, 4, 5);
    } else {
      if (ctick(e, 0, dt, 0.09)) { e.a += 0.23; spiral(g, e.x, e.y, 5, 180, 4, 5, e.a); }
      if (ctick(e, 1, dt, 0.5)) { e.b += 0.5; lattice(g, -10, 9, 170, 4, 6, e.b % 1); }
      if (ctick(e, 2, dt, 3.2)) beamFan(g, e.x, e.y + 30, 5, 1.4, aim(g, e.x, e.y), 22, 1.0, 0.6, 16, 5, e);
      if (ctick(e, 3, dt, 1.4)) rose(g, e.x, e.y, 28, 170, 4, 4, 6, e.t);
    }
  },
  // ── 10 冠冕魘王：羽刃四向、王冠光柱、拳擊、終幕全開 ──
  10: (g, e, dt, ph) => {
    const D = g.diff;
    mv(e, W / 2 + Math.sin(e.t * 0.5) * (ph >= 2 ? 160 : 110), 185 + Math.sin(e.t * 0.9) * 14, dt, 1.6);
    if (ph === 0) {
      if (ctick(e, 0, dt, 1.3)) for (let k = 0; k < 4; k++) fan(g, e.x, e.y, 4, 0.5, Math.PI / 2 + (k - 1.5) * 0.7, 200, 1, k % 2 ? 0 : 6);
      if (ctick(e, 1, dt, 2.2)) aimedFan(g, e.x, e.y + 30, 5 + D, 0.9, 230, 0, 1);
    } else if (ph === 1) {
      if (ctick(e, 0, dt, 3.6)) for (let i = 0; i < 7; i++) g.later(i * 0.14, () => g.addBeam({ x: e.x + (i - 3) * 62, y: e.y + 30, ang: Math.PI / 2, warn: 0.9, life: 0.5, w: 22, dmg: cbeamDmg(16), color: CZ_BEAM_COL[2], follow: e }));
      if (ctick(e, 1, dt, 2.4)) ring(g, e.x, e.y, 24, 150, 3, 2, e.t);
      if (ctick(e, 2, dt, 0.8)) aimedFan(g, e.x, e.y, 3, 0.4, 250, 4, 0);
    } else if (ph === 2) {
      if (ctick(e, 0, dt, 1.4)) { aimedStream(g, e.x - 170, e.y + 60, 6, 220, 30, 0, 1, 0.1); aimedStream(g, e.x + 170, e.y + 60, 6, 220, 30, 0, 1, 0.1); }
      if (ctick(e, 1, dt, 2.4)) curtain(g, e.y + 20, g.p.x, 160 - D * 10, 190, 1, 6);
      if (ctick(e, 2, dt, 0.12)) { e.a += 0.26; spiral(g, e.x, e.y, 3, 170, 1, 2, e.a); }
    } else {
      if (ctick(e, 0, dt, 0.08)) { e.a += 0.29; spiral(g, e.x, e.y, 5, 180, 1, 6, e.a); }
      if (ctick(e, 1, dt, 2.4)) ringGap(g, e.x, e.y, 32, 175, 0, 1, aim(g, e.x, e.y), 0.8);
      if (ctick(e, 2, dt, 3.6)) beamFan(g, e.x, e.y + 30, 7, 1.8, Math.PI / 2, 22, 1.0, 0.6, 18, 2, e);
      if (ctick(e, 3, dt, 1.8)) rose(g, e.x, e.y, 30, 175, 5, 0, 0, e.t);
      if (ctick(e, 4, dt, 0.7)) wavy(g, e.x, e.y + 20, Math.PI / 2, 4, 180, 40, 4, 5, 5);
    }
  },
};

/* ═════════ 中王：port/008 五隻（跳過第 4 關專屬的 cz_mid_oni） ═════════
 * ⚠ 簽名的 `d` 在母專案是「時間」、在 008 是「難度」→ 這裡一律改用 `g.diff` 取難度。
 * ⚠ `cz_mid_sentinel` 用 `e.b`、`cz_mid_saint` 用 `e.a` 當累加器 → updateMid 對 cz_ 中王不介入移動。 */
export const CUSTOM_MID: Record<string, (g: Game, e: Enemy, d: number, dt: number) => void> = {
  cz_mid_gunship: (g, e, _d, dt) => {
    const D = g.diff;
    const rage = e.hp < e.maxHp * 0.5;
    if (ctick(e, 0, dt, rage ? 1.0 : 1.5)) aimedFan(g, e.x, e.y + 30, 7 + D, 1.3, 220, 1, 1);
    if (ctick(e, 1, dt, 3.2)) ring(g, e.x, e.y, 20, 150, 0, 0, e.t);
    if (rage && ctick(e, 2, dt, 0.12)) aimedStream(g, e.x, e.y, 1, 260, 0, 2, 4, 0.25);
  },
  cz_mid_walker: (g, e, _d, dt) => {
    const D = g.diff;
    const rage = e.hp < e.maxHp * 0.5;
    if (ctick(e, 0, dt, 1.0)) { aimedFan(g, e.x - 44, e.y + 30, 3, 0.4, 230, 1, 4); aimedFan(g, e.x + 44, e.y + 30, 3, 0.4, 230, 1, 4); }
    if (ctick(e, 1, dt, 3.4)) curtain(g, e.y + 30, g.p.x, 170 - D * 10, 180, 1, 4);
    if (rage && ctick(e, 2, dt, 2.6)) ring(g, e.x, e.y, 22, 140, 0, 4, e.t);
  },
  cz_mid_cruiser: (g, e, _d, dt) => {
    const D = g.diff;
    if (ctick(e, 0, dt, 3.8)) beamFan(g, e.x, e.y + 30, 3 + (D > 1 ? 2 : 0), 0.9, aim(g, e.x, e.y), 24, 1.0, 0.7, 16, 4, e);
    if (ctick(e, 1, dt, 1.4)) aimedFan(g, e.x, e.y, 5 + D, 0.9, 220, 4, 4);
    if (e.hp < e.maxHp * 0.5 && ctick(e, 2, dt, 2.4)) ring(g, e.x, e.y, 20, 150, 4, 4, e.t);
  },
  cz_mid_sentinel: (g, e, _d, dt) => {
    const D = g.diff;
    if (ctick(e, 0, dt, 0.6)) { e.b += 0.5; lattice(g, e.y + 20, 9, 150, 4, 5, e.b % 1); }
    if (ctick(e, 1, dt, 1.4)) aimedFan(g, e.x, e.y, 3 + D, 0.5, 250, 4, 6);
    if (e.hp < e.maxHp * 0.5 && ctick(e, 2, dt, 3.6)) beamFan(g, e.x, e.y + 30, 5, 1.4, Math.PI / 2, 22, 1.0, 0.6, 16, 5, e);
  },
  cz_mid_saint: (g, e, _d, dt) => {
    const D = g.diff;
    if (ctick(e, 0, dt, 2.0)) rose(g, e.x, e.y, 26, 160, 5, 0, 2, e.t);
    if (ctick(e, 1, dt, 1.2)) aimedFan(g, e.x, e.y, 5 + D, 1.0, 240, 1, 1);
    if (ctick(e, 2, dt, 0.14)) { e.a += 0.25; spiral(g, e.x, e.y, 2, 170, 0, 6, e.a); }
    if (e.hp < e.maxHp * 0.5 && ctick(e, 3, dt, 3.0)) delayed(g, e.x, e.y, aim(g, e.x, e.y), 0.6, 320, 3, 2);
  },
};

/**
 * Boss 階段血量門檻（**由高到低**）：血量比例跌破 `marks[i]` 就進到第 `i+1` 階段。
 * **N 個門檻 ⇒ N+1 個階段**（母專案 2 個門檻＝3 階段；port/008 的 3 個門檻＝4 階段）。
 * - 母專案 6 隻（id 0~5）：`[0.67, 0.34]` → 3 階段。
 * - port/008 的 5 隻（id ≥ 6）：`[0.7, 0.42, 0.18]` → 4 階段（來源 008 的值）。
 * ⚠ 回傳的是**共用常數**（勿修改）；`updateBoss` 的階段判定與 UI 的血條分割都吃這一份，
 *   改這裡兩邊同時生效（先前 UI 寫死三段，害 008 的 4 階段 Boss 顯示錯誤）。
 */
const MARKS_008: readonly number[] = [0.7, 0.42, 0.18];
const MARKS_SP: readonly number[] = [0.67, 0.34];
export const BOSS_PHASE_MARKS = (bossId: number): readonly number[] => (bossId >= 6 ? MARKS_008 : MARKS_SP);
/** 中型 Boss 的階段門檻：**只有 2 階段**（滿血／半血）——與 `updateMid` 的判定同源。
 *  ⚠ 中王的 `bossId` 是 0（`spawnMid` 不設），若直接餵 `BOSS_PHASE_MARKS(0)` 會拿到母專案
 *    Boss 的 3 階段 → 血條會多畫一格。中王一律吃這一份。 */
export const MID_PHASE_MARKS: readonly number[] = [0.5];
/** Boss 的階段總數（＝血條格數＝門檻數 + 1）。 */
export const bossPhaseCount = (bossId: number) => BOSS_PHASE_MARKS(bossId).length + 1;
/** 依門檻（**由高到低**）算出目前階段索引（0 起算）＝`updateBoss`／`updateMid`／UI 共用的判定。 */
export function phaseIndex(marks: readonly number[], frac: number): number {
  for (let i = 0; i < marks.length; i++) if (frac > marks[i]) return i;
  return marks.length;
}

export function updateBoss(g: Game, e: Enemy, dt: number) {
  // 血統蓋章（見 enemyAI.updateEnemy 的同名註解）：008 的 5 隻 Boss 是 id 6~10（來源 0/1/2/4/5）。
  g.czEB = e.bossId >= 6;
  e.t += dt;
  if (e.flash > 0) e.flash -= dt * 6;
  // 凍結抗性冷卻（見 engine/freezeResist.ts）：必須每幀跑，否則連續型光束永遠卡在第一個週期。
  tickFreezeCd(e, dt);
  const d = dt * (e.slow > 0 ? 0.8 : 1);
  if (e.slow > 0) e.slow -= dt;
  // port/008 的 Boss（id ≥ 6）採 4 階段、且以 e.a／e.b 當累加器 → 移動全交由 CUSTOM_BOSS 自管。
  const is008 = e.bossId >= 6;
  const ty = e.bossId === 3 ? 210 : 185;
  if (e.t < 2.6) {
    e.y = lerp(-160, ty, easeOut(e.t / 2.6));
    e.invuln = true;
    return;
  }
  if (e.tm[6] > 0) {
    e.tm[6] -= dt;
    e.invuln = true;
    e.y += Math.sin(e.t * 40) * 0.6;
    if (e.tm[6] <= 0) e.invuln = false;
    return;
  }
  e.invuln = false;
  // 凍結：Boss 開放（機率表見 engine/freezeResist.ts：50% 起、每成功凍一次 −5%、下限 1%）。
  // 進場期（t < 2.6）與階段轉換無敵期（tm[6]）已於上方 return → 這裡只處理正常期，
  // 所以不會出現「凍在場外進不來」或「凍住導致階段轉換卡死」。凍結中整隻不動、不開火。
  if (e.freeze > 0 && gateFreeze(e)) {
    e.freeze -= dt;
    return;
  }
  // 階段判定與 UI 的血條分割共用同一份門檻（見 BOSS_PHASE_MARKS／phaseIndex）
  const ph = phaseIndex(BOSS_PHASE_MARKS(e.bossId), e.hp / e.maxHp);
  if (ph > e.ph) {
    e.ph = ph;
    e.tm[6] = 1.7;
    for (let i = 0; i < 6; i++) e.tm[i] = 0.8;
    if (is008) e.a = 0; // 008 的螺旋角累加器歸零
    g.bossPhaseChange(e);
    return;
  }
  // 移動（008 的 Boss 由 CUSTOM_BOSS 的 mv 自行控制，且 e.a／e.b 是它的累加器 → 不介入）
  if (!is008) {
    e.b -= d;
    if (e.b <= 0) {
      e.b = rand(2.4, 4.2);
      e.a = rand(130, W - 130);
    }
    e.x += (e.a - e.x) * Math.min(1, d * 1.1);
    e.y = ty + Math.sin(e.t * 0.8) * 16;
  }
  const A = e.bossId;
  const arms = 2 + (g.diff > 1 ? 1 : 0);
  const x = e.x;
  const y = e.y + 24;
  const custom = CUSTOM_BOSS[A];
  if (custom) custom(g, e, dt, ph);
  else switch (A) {
    case 0: {
      // 晶冠機神：結晶針、慢速環、水晶雨、螺旋、晶格雷射
      if (tk(e, 0, d, ph === 0 ? 1.7 : 2.5)) aimedFan(g, x, y, 5 + ph * 2, 0.9, 330, 3, 4);
      if (tk(e, 1, d, 3.6)) ring(g, x, y, 16 + ph * 4, 130, 1, 3, rand(TAU));
      if (ph !== 1 && tk(e, 2, d, ph === 0 ? 0.26 : 0.3)) g.spawnEB(rndX(), -10, Math.PI / 2 + rand(-0.08, 0.08), 300, 4, 4);
      if (ph >= 1 && tk(e, 3, d, 0.075)) {
        e.c += 0.42;
        for (let k = 0; k < arms + (ph === 2 ? 1 : 0); k++) g.spawnEB(x, y, e.c + (k * TAU) / (arms + (ph === 2 ? 1 : 0)), 195 + ph * 15, 0, 4);
      }
      if (ph === 2 && tk(e, 4, d, 5.2)) {
        for (const s of [-1, 1]) g.addBeam({ x, y, ang: Math.PI / 2 + s * 0.7, rot: -s * 0.32, len: 1400, w: 30, warn: 1.1, life: 2.2, dmg: 24, color: "#c58bff", follow: e });
      }
      break;
    }
    case 1: {
      // 深藍旗艦：舷側齊射、水雷、魚雷、掃射雷射
      const tur: [number, number][] = [[-52, -10], [52, -10], [-46, 44], [46, 44], [0, 70]];
      const n = ph >= 1 ? 5 : 3;
      if (tk(e, 0, d, ph === 0 ? 1.5 : 1.25)) for (let i = 0; i < n; i++) aimedFan(g, x + tur[i][0], e.y + tur[i][1], 3, 0.5, 340, 4, 3);
      if (tk(e, 1, d, 4)) for (let i = -1; i <= 1; i++) mine(g, x + i * 70, y + 30, Math.PI / 2 + i * 0.25, 240, 1.5, 10, 3);
      if (ph >= 1 && tk(e, 2, d, 2)) g.spawnEB(x, y + 60, aim(g, x, y), 130, 2, 1, { mode: 1, acc: 320, b: 520, r: 11 });
      if (ph >= 1 && tk(e, 3, d, 0.11)) g.spawnEB(x + Math.sin(e.t * 2) * 90, y + 20, Math.PI / 2 + Math.sin(e.t * 3) * 0.4, 260, 1, 3);
      if (ph === 2 && tk(e, 4, d, 6)) {
        g.addBeam({ x, y: y + 30, ang: Math.PI / 2 - 0.8, rot: 0.55, len: 1400, w: 34, warn: 1.1, life: 2.6, dmg: 26, color: "#ff5a3a", follow: e });
        g.spawnEnemy("dart", x - 60, y, { dir: 0 });
        g.spawnEnemy("dart", x + 60, y, { dir: 0 });
      }
      break;
    }
    case 2: {
      // 霜牙冰龍：霜之螺旋、冰刺簾幕、暴雪
      const hx = x + Math.sin(e.t * 1.6) * 0;
      const hy = e.y + 66;
      if (tk(e, 0, d, 0.1 - ph * 0.01)) {
        e.c += 0.33 * (ph === 1 ? -1 : 1);
        g.spawnEB(hx, hy, e.c, 185, 6, 3);
        if (ph >= 1) g.spawnEB(hx, hy, e.c + Math.PI, 185, 6, 6);
      }
      if (tk(e, 1, d, ph === 0 ? 3 : 2.4)) aimedFan(g, hx, hy, 5 + ph * 2, 0.8, 300, 3, 3);
      if (ph >= 1 && tk(e, 2, d, 3.3)) curtain(g, 20, rand(80, W - 80), 62, 190, 3, 3);
      if (ph === 2) {
        if (tk(e, 3, d, 0.085)) g.spawnEB(rndX(), -10, Math.PI / 2, rand(200, 340), 1, 6, { mode: 5, a: rand(2, 4), b: rand(20, 45) });
        if (tk(e, 4, d, 2.4)) ring(g, hx, hy, 22, 160, 6, 3, rand(TAU));
      }
      break;
    }
    case 3: {
      // 熔核巨像：熔岩彈、拳擊震波、隕石雨、暴走螺旋
      if (tk(e, 0, d, ph === 0 ? 1.6 : 1.3)) {
        const n = ph === 0 ? 2 : 3;
        for (let i = 0; i < n; i++) mine(g, x + rand(-60, 60), y + 50, aim(g, x, y) + rand(-0.5, 0.5), rand(220, 300), 1.5, 10, 1);
      }
      if (tk(e, 1, d, 5)) ringGap(g, x, y + 30, 40, 210, 0, 2, aim(g, x, y), 0.36, rand(TAU));
      if (ph >= 1) {
        if (tk(e, 2, d, 0.24)) g.spawnEB(rndX(), -10, Math.PI / 2 + rand(-0.1, 0.1), rand(260, 340), 5, 1, { r: 13 });
        if (tk(e, 3, d, 2.2)) aimedFan(g, x, y, 5, 0.6, 340, 4, 2);
      }
      if (ph === 2) {
        if (tk(e, 4, d, 0.08)) {
          e.c += 0.31;
          for (let k = 0; k < 3; k++) g.spawnEB(x, y + 30, e.c + (k * TAU) / 3, 205, 0, k % 2 ? 1 : 2);
        }
        if (tk(e, 5, d, 6)) curtain(g, 20, rand(80, W - 80), 60, 200, 1, 1);
      }
      break;
    }
    case 4: {
      // 緋紅絕翼：翼尖密集扇形、追蹤飛彈、旋轉十字、花瓣環
      const wx = 100;
      if (tk(e, 0, d, ph === 0 ? 1.3 : 1.05)) {
        for (const s of [-1, 1]) aimedFan(g, x + s * wx, y + 10, 5 + ph * 2, 0.8, 340, 4, 0);
      }
      if (tk(e, 1, d, 3)) for (let i = 0; i < 2 + ph; i++) g.spawnEB(x + (i - 1) * 40, y, aim(g, x, y) + (i - 1) * 0.3, 210, 2, 0, { mode: 2, turn: (i - 1) * 0.5, r: 10 });
      if (ph >= 1 && tk(e, 2, d, 0.06)) {
        e.c += 0.27;
        for (let k = 0; k < 4; k++) g.spawnEB(x, y, e.c + (k * TAU) / 4, 260, 3, 0);
      }
      if (ph >= 1 && tk(e, 3, d, 2.4)) ring(g, x, y, 24, 150, 1, 2, rand(TAU));
      if (ph === 2) {
        if (tk(e, 4, d, 0.9)) {
          e.d += 0.1;
          ring(g, x, y, 30, 180, 0, 0, e.d);
        }
        if (tk(e, 5, d, 4.8)) g.addBeam({ x, y, ang: Math.PI / 2 - 1, rot: 0.6, len: 1400, w: 32, warn: 1.0, life: 2.4, dmg: 26, color: "#ff3b52", follow: e });
      }
      break;
    }
    default: {
      // 天頂王座：缺口天環、旋轉雙雷射、多臂螺旋、熾天花彈幕
      if (tk(e, 0, d, ph === 0 ? 1.25 : 1.8)) {
        ringGap(g, x, y, 30 + ph * 4, 170, 0, 2, aim(g, x, y), 0.32);
        aimedFan(g, x, y, 5, 0.6, 360, 3, 4);
      }
      if (ph >= 1) {
        if (tk(e, 1, d, 0.075)) {
          e.c += 0.36;
          for (let k = 0; k < 3; k++) g.spawnEB(x, y, e.c + (k * TAU) / 3, 200, 1, k % 2 ? 2 : 4);
        }
        if (tk(e, 2, d, 6)) {
          for (const s of [-1, 1]) g.addBeam({ x, y, ang: Math.PI / 2 + s * 0.9, rot: -s * 0.4, len: 1400, w: 32, warn: 1.1, life: 2.6, dmg: 26, color: "#ffd36b", follow: e });
        }
        if (tk(e, 3, d, 0.3)) g.spawnEB(rndX(), -10, Math.PI / 2, rand(240, 340), 4, 4);
      }
      if (ph === 2) {
        if (tk(e, 4, d, 0.07)) {
          e.d += 0.23;
          for (let k = 0; k < 5; k++) g.spawnEB(x, y, e.d + (k * TAU) / 5, 230, 3, 2);
        }
        if (tk(e, 5, d, 3.2)) {
          curtain(g, 20, rand(80, W - 80), 60, 210, 1, 2);
          stream(g, x, y, aim(g, x, y), 6, 300, 30, 3, 0);
        }
      }
    }
  }
  void H;
  void delayed;
  void fan;
}

/** 中型 Boss（每關一隻）：兩階段 */
export function updateMid(g: Game, e: Enemy, d: number, dt: number) {
  // 血統蓋章（見 enemyAI.updateEnemy 的同名註解）。目前唯一呼叫者是 `updateEnemy`（已蓋過章），
  // 這裡再蓋一次是為了「未來若改由別處直接呼叫」時仍然正確。
  g.czEB = e.def.id.startsWith("cz_");
  if (e.t < 2.2) {
    e.y = lerp(-140, 150, easeOut(e.t / 2.2));
    e.invuln = true;
    return;
  }
  e.invuln = false;
  // 中王固定 2 階段（滿血／半血）；門檻與 UI 共用 `MID_PHASE_MARKS`（**不可餵 bossId**——
  // 中王的 bossId 是 0，會拿到母專案 Boss 的 3 階段門檻）。
  const ph = phaseIndex(MID_PHASE_MARKS, e.hp / e.maxHp);
  if (ph > e.ph) {
    e.ph = ph;
    g.clearBullets(e.x, e.y, 9999, "none");
    g.fx.ring(e.x, e.y, 20, 200, 0.5, "#ffffff", 6);
    g.flash("#ffffff", 0.3);
    e.tm[6] = 1.0;
  }
  if (e.tm[6] > 0) {
    e.tm[6] -= dt;
    return;
  }
  // 移動（008 的中王用來源的 mv；其 e.a／e.b 是累加器 → 不介入）
  if (e.def.id.startsWith("cz_mid_")) {
    mv(e, W / 2 + Math.sin(e.t * 0.7) * 140, 165 + Math.sin(e.t * 1.2) * 12, dt, 1.8);
  } else {
    e.b -= d;
    if (e.b <= 0) {
      e.b = rand(2.2, 3.6);
      e.a = rand(110, W - 110);
    }
    e.x += (e.a - e.x) * Math.min(1, d * 1.0);
    e.y = 150 + Math.sin(e.t * 0.9) * 14;
  }
  const x = e.x;
  const y = e.y + 20;
  const id = e.def.id;
  const customMid = CUSTOM_MID[id];
  if (customMid) {
    customMid(g, e, d, dt);
    return;
  }
  const col = [0, 1, 3, 2, 0, 4][e.theme % 6];
  if (id === "mid_gunship") {
    if (tk(e, 0, d, ph ? 1.2 : 1.5)) aimedFan(g, x, y, 5 + ph * 2, 0.8, 310, 4, col);
    if (tk(e, 1, d, 3.2)) ring(g, x, y, 14, 140, 0, (col + 1) % 7, rand(TAU));
    if (ph && tk(e, 2, d, 0.1)) {
      e.c += 0.4;
      for (let k = 0; k < 2; k++) g.spawnEB(x, y, e.c + k * Math.PI, 200, 1, col);
    }
  } else if (id === "mid_walker") {
    if (tk(e, 0, d, ph ? 0.9 : 1.2)) mine(g, x + rand(-50, 50), y + 30, Math.PI / 2 + rand(-0.6, 0.6), rand(200, 280), 1.6, 8, col);
    if (tk(e, 1, d, 1.3)) aimedFan(g, x, y, 3 + ph * 2, 0.5, 300, 4, (col + 2) % 7);
    if (ph && tk(e, 2, d, 2.6)) stream(g, x, y, aim(g, x, y), 7, 260, 26, 3, col);
  } else {
    if (tk(e, 0, d, ph ? 4 : 5)) g.addBeam({ x, y, ang: aim(g, x, y) - 0.6, rot: 0.8, len: 1400, w: 32, warn: 1.0, life: 1.2, dmg: 24, color: "#ff3b6b", follow: e });
    if (tk(e, 1, d, 1.4)) aimedFan(g, x, y, 5, 0.9, 290, 4, col);
    if (ph && tk(e, 2, d, 1.8)) g.spawnEB(x, y + 20, aim(g, x, y), 130, 2, 1, { mode: 1, acc: 300, b: 500, r: 11 });
    if (ph && tk(e, 3, d, 3)) ring(g, x, y, 18, 150, 0, (col + 1) % 7, rand(TAU));
  }
}


// ====== 來源: src/game/engine/patterns.ts ======
// 敵方彈幕樣式庫：環形、扇形、瞄準、簾幕、地雷等基本單元，供敵機與 Boss 組合
import { TAU, rand, W } from "../constants";
import type { EBullet, Enemy } from "../entities";
import type { Game } from "./Game";

export const aim = (g: Game, x: number, y: number) => Math.atan2(g.p.y - y, g.p.x - x);

export function ring(g: Game, x: number, y: number, n: number, spd: number, type = 0, color = 0, off = 0, o?: Partial<EBullet>) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) g.spawnEB(x, y, off + (i * TAU) / n, spd, type, color, o);
}

/** 帶缺口的環形彈幕（缺口朝向 gapAng） */
export function ringGap(g: Game, x: number, y: number, n: number, spd: number, type: number, color: number, gapAng: number, gapW: number, off = 0) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) {
    const a = off + (i * TAU) / n;
    let d = Math.abs(((a - gapAng + Math.PI * 3) % TAU) - Math.PI);
    d = Math.PI - d;
    if (Math.abs(d) < gapW) continue;
    g.spawnEB(x, y, a, spd, type, color);
  }
}

export function fan(g: Game, x: number, y: number, n: number, spread: number, ang: number, spd: number, type = 0, color = 0, o?: Partial<EBullet>) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) {
    const a = n === 1 ? ang : ang + (i / (n - 1) - 0.5) * spread;
    g.spawnEB(x, y, a, spd, type, color, o);
  }
}

export function aimedFan(g: Game, x: number, y: number, n: number, spread: number, spd: number, type = 0, color = 0, o?: Partial<EBullet>) {
  fan(g, x, y, n, spread, aim(g, x, y), spd, type, color, o);
}

/** 連續數發同方向、速度遞增的彈流 */
export function stream(g: Game, x: number, y: number, ang: number, n: number, spd0: number, dSpd: number, type = 0, color = 0) {
  n = g.bn(n);
  for (let i = 0; i < n; i++) g.spawnEB(x, y, ang, spd0 + dSpd * i, type, color);
}

/** 橫向簾幕：整排彈幕向下，留出一個缺口 */
export function curtain(g: Game, y: number, gapX: number, gapW: number, spd: number, type = 1, color = 0) {
  const step = 30;
  for (let x = 14; x < W; x += step) {
    if (Math.abs(x - gapX) < gapW) continue;
    g.spawnEB(x, y, Math.PI / 2, spd, type, color);
  }
}

/** 地雷彈：減速停下後引爆成環形彈幕 */
export function mine(g: Game, x: number, y: number, ang: number, spd: number, fuse: number, n: number, color = 1) {
  g.spawnEB(x, y, ang, spd, 5, color, { mode: 3, b: fuse, a: n, r: 13 });
}

/** 延遲起動彈：先懸停再朝指定方向加速 */
export function delayed(g: Game, x: number, y: number, ang: number, delay: number, acc: number, type = 0, color = 0) {
  g.spawnEB(x, y, ang, 0, type, color, { mode: 4, a: delay, acc, b: 460 });
}

export function rndX() {
  return rand(24, W - 24);
}

// ---------------------------------------------------------------------------
// 追加區（跨專案擴充點）：自訂彈幕單元寫在這裡。
// 上方既有函式一律**不得修改**（它們是所有專案共用的彈幕詞彙）。
// 約定：簽名一律 `(g: Game, x, y, …)`，只透過 `g.spawnEB` / `g.addBeam` 發射，回傳 void。
// 新單元由你自己的 `CUSTOM_AI`（engine/enemyAI.ts）或 `CUSTOM_BOSS`／`CUSTOM_MID`
// （engine/bossAI.ts）呼叫；搬移＝把新增的 export function 整段複製回母專案。

// ── port/008 移植的彈幕單元（CRIMSON ZENITH）──────────────────────────────
// 來源：port/008/src/game/engine/patterns.ts。API 已翻成 SP：
//   ① `g.spawnEB` 介面相同，直接沿用（SP 端會自動套難度速度倍率 dm.spd）。
//   ② `g.addBeam` 的 `color` 由「數字索引」→「色字串」：用來源色表 CZ_BEAM_COL。
//   ③ `g.addBeam` 的 `dmg` 語意不同（SP 為相對值、基準 22；來源為絕對值、普通彈 =10）
//      → 依「來源倍率 × 22 ÷ 1.6」換算（見 beamFan，係數 1.375）。
//   ④ `wavy`：來源是「角度擺盪」（`b.ang += cos(t·freq)·amp`），SP 的 mode 5 是
//      「x 軸位置擺盪」（`x += cos(t·a)·b`）→ 參數對調（a=頻率、b=振幅），並保留來源的
//      `(i % 2 ? 1 : -1)` 交錯（負振幅＝相位相反）。數值（freq≈4、amp≈40）恰落在 SP
//      既有 mode 5 的使用範圍，蛇行觀感相近。
//   ⑤ 子彈數 `n` 不套 `g.bn()`：來源的 Boss AI 已自帶難度分支（`D > 1 ? …`），再乘會雙重加成。

/** 008 敵彈／光束色表（來源 sprites.ts 的 EB_COLORS；beam color 以數字索引取色） */
export const CZ_BEAM_COL = ["#ff3355", "#ffb02e", "#ffe66b", "#4dff9d", "#3de0ff", "#8a7bff", "#ff6bd6"];

/** 玫瑰線：速度沿角度調變，形成花瓣狀的擴散 */
export function rose(g: Game, x: number, y: number, n: number, spd: number, petals: number, type = 0, color = 0, off = 0) {
  for (let i = 0; i < n; i++) {
    const a = off + (i * TAU) / n;
    g.spawnEB(x, y, a, spd * (0.62 + 0.38 * Math.cos((petals * (i * TAU)) / n)), type, color);
  }
}

/** 格狀：一整列等距彈，帶相位偏移，連續幾列會形成菱形網格 */
export function lattice(g: Game, y: number, cols: number, spd: number, type: number, color: number, phase: number) {
  const gap = W / cols;
  for (let i = 0; i <= cols; i++) g.spawnEB(((i + phase) * gap) % (W + gap), y, Math.PI / 2, spd, type, color);
}

/** 預警光束扇：一次放出多道預警光束（color 數字 → SP 色字串；dmg 依來源換算，見檔頭 ③）
 *  `follow` 傳入發射者時，光束會**跟著它移動**（保留 spawn 當下的槍口偏移）——
 *  來源 008 沒有這條，Boss 邊移動邊放光束時光束會留在原地、看起來從空位射出來（大爺抓到的 bug）。 */
export function beamFan(g: Game, x: number, y: number, n: number, spread: number, ang: number, w: number, warn: number, life: number, dmg: number, color = 0, follow: Enemy | null = null) {
  for (let i = 0; i < n; i++) {
    const a = ang + (n === 1 ? 0 : (i / (n - 1) - 0.5) * spread);
    g.addBeam({ x, y, ang: a, w, warn, life, dmg: dmg * 1.375, color: CZ_BEAM_COL[color % 7], follow });
  }
}

/** 瞄準連射流：含散布 */
export function aimedStream(g: Game, x: number, y: number, n: number, spd0: number, dSpd: number, type: number, color: number, jit: number) {
  const a = aim(g, x, y);
  for (let i = 0; i < n; i++) g.spawnEB(x, y, a + rand(-jit, jit), spd0 + i * dSpd, type, color);
}

/** 波動串：沿方向前進並左右擺盪的子彈（來源為角度擺盪 → 對映 SP mode 5 位置擺盪，見檔頭 ④） */
export function wavy(g: Game, x: number, y: number, ang: number, n: number, spd: number, amp: number, freq: number, type = 0, color = 0) {
  for (let i = 0; i < n; i++) g.spawnEB(x, y, ang, spd, type, color, { mode: 5, a: freq, b: amp * (i % 2 ? 1 : -1) });
}

/** 螺旋臂：多臂螺旋（每次呼叫發一圈，呼叫端自行遞增 off） */
export function spiral(g: Game, x: number, y: number, arms: number, spd: number, type: number, color: number, off: number) {
  for (let i = 0; i < arms; i++) g.spawnEB(x, y, off + (i * TAU) / arms, spd, type, color);
}


// ====== 來源: src/game/engine/renderer.ts ======
// 遊戲渲染：依圖層順序繪製，所有子彈皆以預渲染精靈 drawImage 提升效能
import { H, RARITY_COLOR, TAU, W, clamp } from "../constants";
import { PK } from "../entities";
import type { Beam, Enemy, Pickup } from "../entities";
import { loadUltBg } from "../../assets";
import { drawBossBody } from "../render/bossDraw";
import { drawEnemySprite, enemySprite } from "../render/enemyDraw";
import { drawShip } from "../render/shipDraw";
import type { ShipDrawOpts } from "../render/shipDraw";
import { CZ_DIR_EB, CZ_EB_SIZE, czEbSprite, ebSprite, glow, makeCanvas, pbStyle } from "../render/sprites";
import { drawThunderBeam } from "../render/thunder";
import { drawCutin, CUTIN_DUR, CUTIN_DUR_FAST, FAST_CUTIN_SHIPS } from "../cutin";
import { FORM_TIER3 } from "../data/ships";
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

/** 奧義全螢幕背景（12 台 sp+cf 共有）：p.ultBusy>0 期間，cover 填 540×960 畫布。
 *  來源 1080×1920 與畫布同為 9:16，cover 正好全填無裁切，取代來源「方形旋轉貼片」。
 *  來源船體自帶的 drawUnder/drawOver 奧義特效仍會疊在這張背景上。 */
function drawUltBg(g: Game, ctx: CanvasRenderingContext2D) {
  if (g.p.ultBusy <= 0) return;
  const img = loadUltBg(g.ship.id);
  if (!img || !img.complete || !img.naturalWidth) return;
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.drawImage(img, 0, 0, W, H);
  ctx.restore();
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
  ctx.restore();
  // 奧義全螢幕背景：畫在鏡頭搖晃「之外」。跟著 shake 動的話，邊緣會露出底下的
  // 關卡背景（新移植 12 台與其它批次共有，使用者回報的「背景會跟著動」）。
  drawUltBg(g, ctx);
  ctx.save();
  drawFxLayer(g, ctx, 0);
  // 真身收起中（奧義演出）→ 跳過 kit.drawUnder：那裡畫的是「機體錨定」的底層特效
  // （緋燕的火軌與鳳凰形態 90px 橙紅光暈都掛在 p.x/p.y），不關掉就會在隱形位置看到一團紅光。
  if (!g.shipHidden) g.kit.drawUnder?.(g, ctx);
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
  // 奧義 Cut-in（canvas 層，不受震動影響；機體疾馳沿用玩家外觀）
  if (g.stateName === "ultcut") {
    const fast = FAST_CUTIN_SHIPS.includes(g.ship.id);
    const dur = fast ? CUTIN_DUR_FAST : CUTIN_DUR;
    const k = clamp(1 - g.cutT / dur, 0, 1);
    drawCutin(ctx, g.ship.id, k, g.p.tier, g.p.gear, fast ? dur : undefined);
  }
}

function drawEnemy(g: Game, ctx: CanvasRenderingContext2D, e: Enemy) {
  if (e.y < -80 || e.y > H + 80 || e.alpha < 0) return;
  const sp = enemySprite(e.def.id, e.theme);
  let rot = 0;
  // 用 def.ai（共用行為詞彙）判斷，不用 id——新專案的 id 會加前綴，用 id 判斷會靜默失效
  if (sp.spin) rot = e.t * (e.def.ai === "orbit" ? 4 : 2.4);
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
    // dispW/dispH：含光暈留白的邏輯顯示寬高；無 dispW（dst 既有 mk() 精靈）用 canvas 物理寬
    const w = (st.dispW ?? st.spr.width) * b.scale;
    const h = (st.dispH ?? st.spr.height) * b.scale;
    // 旋轉＝「對齊速度方向(dir)」＋「自轉(spin)」可疊加，對應來源引擎 cf5 的
    //   ang = kind>=20 ? rot : atan2(vy,vx)+π/2 + rot
    // dst 不用 kind 分流（dst spawnPB 預設 b.rot=rand(TAU)、b.spin=8，既有 kind>=20 子彈
    // 靠 st.dir 對齊方向），改用樣式旗標表達：dir=對齊、spin=自轉，兩者皆真＝對齊+自轉。
    const rot = (st.dir ? Math.atan2(b.vy, b.vx) + Math.PI / 2 : 0) + (st.spin ? b.rot : 0);
    if (rot !== 0) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(rot);
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
    // ── port/008 血統（`EBullet.cz`）走另一套精靈與定向規則 ──
    // 008 的精靈是「彈頭朝上」設計 → 定向彈轉 `ang + π/2`（母專案的精靈是「朝 +x」→ 轉 `ang`）；
    // 精靈固定 48×48、一律畫在 (x-24, y-24)。另外 008 的延遲起動彈（mode 4）在起動前是半透明。
    if (b.cz) {
      const spr = czEbSprite(b.type, b.color);
      const half = CZ_EB_SIZE / 2;
      if (b.mode === 4 && b.t < b.a) ctx.globalAlpha = 0.45;
      if (CZ_DIR_EB.has(b.type)) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.ang + Math.PI / 2);
        ctx.drawImage(spr, -half, -half);
        ctx.restore();
      } else {
        ctx.drawImage(spr, b.x - half, b.y - half);
      }
      if (b.mode === 4 && b.t < b.a) ctx.globalAlpha = 1;
      continue;
    }
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
  // 環境落雷（`addBeam({ thunder:true })`）走 014 式雷電視覺，其餘光束維持原樣
  if ((b as Beam & { thunder?: boolean }).thunder) {
    drawThunderBeam(ctx, { len: b.len, w: b.w, color: b.color }, b.t, b.warn, b.life, b.dmg > 0);
    ctx.restore();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    return;
  }
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
  // 奧義「真身收起」：少數機體（緋燕・燕返）的奧義會自行演出替身，若真身照畫就會同時看到
  // 兩架機體。判定與引擎尾焰共用 Game.shipHidden（單一真實來源）。
  if (g.shipHidden) return;
  const ship = g.ship;
  // mode/aux：來源移植機體（cf5/cft/zx）自訂外觀動態；dst 原生機體不讀，餵入無副作用
  // 奧義變身中強制最高階外觀：機體 id 由 data/ships.ts 的 FORM_TIER3 決定（不寫死遊戲名）
  // sx 批次（星燼曙約）的「曉星」以 p.k.formV 作為化身的平滑值（0→1）驅動外觀；
  // 其餘機體不設 formV → 回落 p.form（行為不變）。
  const formV = (p.k.formV as number) ?? p.form;
  const o: ShipDrawOpts = { t: g.t, tier: p.form === 1 && FORM_TIER3.includes(ship.id) ? 3 : p.tier, thrust: p.thrust, form: formV, morph: p.morph, gear: p.gear, bank: p.bank, color: ship.color, color2: ship.color2, mode: (p.k.mode as number) || 0, aux: (p.k.aux as number) || 0, pulse: (p.k.pulse as number) || 0, side: (p.k.side as number) || 1, focus: !!p.k.focus, pods: (p.k.podsView as { x: number; y: number }[]) || [], k: p.k };
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


// ====== 來源: src/game/render/bossDraw.ts ======
// Boss 繪製：六隻 Boss 各自獨立的外觀與動畫（每幀繪製，含階段變化）
import { TAU } from "../constants";
import { THEME_PAL } from "../data/enemies";
import { fillPoly, flame, lin, mirror, rad, ring } from "./shipUtil";
import type { Enemy } from "../entities";

const OUT = "rgba(8,4,12,0.92)";

function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 1) {
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = a;
  ctx.fillStyle = rad(ctx, x, y, r, [[0, "#fff"], [0.35, c], [1, "rgba(0,0,0,0)"]]);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

// ---------- 0 晶冠機神：水晶要塞步行機 ----------
function bossCrystal(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const P = THEME_PAL[0];
  // 步行腿
  mirror(ctx, (s) => {
    const sw = Math.sin(t * 2 + (s > 0 ? 0 : Math.PI)) * 6;
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 16;
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(30, -10);
    ctx.lineTo(70, 20 + sw);
    ctx.lineTo(74, 66 + sw);
    ctx.stroke();
    ctx.strokeStyle = "#5a5a86";
    ctx.lineWidth = 11;
    ctx.stroke();
    fillPoly(ctx, [[64, 60 + sw], [86, 62 + sw], [90, 82 + sw], [66, 84 + sw]], lin(ctx, 64, 60, 90, 84, [[0, "#8a8ab8"], [1, "#2a2a4a"]]), OUT, 1.5);
    // 水晶肩甲
    for (let i = 0; i < 3; i++) {
      fillPoly(ctx, [[42 + i * 12, -20], [48 + i * 12, -52 - i * 10 - (ph > 0 ? 8 : 0)], [54 + i * 12, -20]], lin(ctx, 48, -20, 48, -60, [[0, "#5b2aa8"], [1, "#e0c8ff"]]), OUT, 1.4);
    }
  });
  // 主體平台
  fillPoly(ctx, [[0, 58], [46, 34], [66, -8], [52, -40], [0, -50], [-52, -40], [-66, -8], [-46, 34]], lin(ctx, -66, 0, 66, 0, [[0, "#26264a"], [0.5, "#8a8ab8"], [1, "#26264a"]]), OUT, 2);
  // 塔尖水晶
  for (let i = -3; i <= 3; i++) {
    const h = 44 + (3 - Math.abs(i)) * 14 + Math.sin(t * 1.5 + i) * 3;
    fillPoly(ctx, [[i * 14 - 8, -40], [i * 14, -40 - h], [i * 14 + 8, -40]], lin(ctx, i * 14, -40, i * 14, -40 - h, [[0, "#4a1f9a"], [0.6, "#b26bff"], [1, "#f4e4ff"]]), OUT, 1.4);
  }
  // 核心水晶
  const pulse = 0.7 + 0.3 * Math.sin(t * 4);
  fillPoly(ctx, [[0, -22], [20, 4], [0, 36], [-20, 4]], lin(ctx, 0, -22, 0, 36, [[0, "#f4e4ff"], [0.5, "#b26bff"], [1, "#3a1a7a"]]), OUT, 2);
  glowDot(ctx, 0, 6, 46 + ph * 8, "#c58bff", 0.55 * pulse);
  // 霓虹燈帶
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = P.ac;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-58, -10);
  ctx.lineTo(-30, 30);
  ctx.moveTo(58, -10);
  ctx.lineTo(30, 30);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  // 漂浮碎晶
  for (let i = 0; i < 6 + ph * 3; i++) {
    const a = t * (0.8 + (i % 3) * 0.2) + (i * TAU) / (6 + ph * 3);
    const x = Math.cos(a) * (96 + (i % 2) * 14);
    const y = Math.sin(a) * 30 + 6;
    fillPoly(ctx, [[x, y - 9], [x + 4.5, y], [x, y + 9], [x - 4.5, y]], lin(ctx, x, y - 9, x, y + 9, [[0, "#f4e4ff"], [1, "#6a35c8"]]), OUT, 1);
  }
}

// ---------- 1 深藍旗艦：戰艦航母，砲塔追蹤玩家 ----------
function bossFlagship(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number, px: number, py: number) {
  const P = THEME_PAL[1];
  // 甲板側翼
  mirror(ctx, () => {
    fillPoly(ctx, [[28, -70], [82, -50], [92, 30], [30, 60]], lin(ctx, 28, -70, 92, 30, [[0, "#20364e"], [1, "#4e7090"]]), OUT, 2);
    ctx.strokeStyle = "rgba(255,179,71,0.8)";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath();
    ctx.moveTo(60, -50);
    ctx.lineTo(66, 30);
    ctx.stroke();
    ctx.setLineDash([]);
  });
  // 艦體（艦首朝下）
  fillPoly(ctx, [[0, 118], [22, 84], [34, 20], [36, -70], [22, -104], [-22, -104], [-36, -70], [-34, 20], [-22, 84]], lin(ctx, -36, 0, 36, 0, [[0, "#182a40"], [0.5, "#7fa0c0"], [1, "#182a40"]]), OUT, 2.4);
  ctx.strokeStyle = "rgba(10,20,30,0.8)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(-30, -80 + i * 22);
    ctx.lineTo(30, -80 + i * 22);
    ctx.stroke();
  }
  // 艦橋
  fillPoly(ctx, [[-16, -70], [16, -70], [12, -34], [-12, -34]], lin(ctx, 0, -70, 0, -34, [[0, "#c8dcf0"], [1, "#4e7090"]]), OUT, 1.6);
  glowDot(ctx, 0, -50, 14, P.ac, 0.5);
  // 追蹤砲塔
  const tur: [number, number][] = [[-52, -10], [52, -10], [-46, 44], [46, 44], [0, 70]];
  const nTur = ph >= 1 ? 5 : 3;
  for (let i = 0; i < nTur; i++) {
    const [tx, ty] = tur[i];
    const wx = e.x + tx * e.scale;
    const wy = e.y + ty * e.scale;
    const a = Math.atan2(py - wy, px - wx) - Math.PI / 2;
    ctx.save();
    ctx.translate(tx, ty);
    ctx.fillStyle = lin(ctx, -10, 0, 10, 0, [[0, "#20364e"], [0.5, "#b4ccdf"], [1, "#20364e"]]);
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.rotate(a);
    fillPoly(ctx, [[-4, 0], [4, 0], [3, 26], [-3, 26]], "#3a5878", OUT, 1.4);
    ctx.restore();
    glowDot(ctx, tx, ty, 8, P.ac, 0.5);
  }
  // 尾部推進
  for (const x of [-16, 0, 16]) flame(ctx, x, -104, 34 + Math.sin(t * 20 + x) * 5, 7, t, "#ffffff", "#7fbfff", "rgba(40,90,255,0)");
}

// ---------- 2 霜牙冰龍：蜷曲的機械冰龍 ----------
function bossWyrm(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const segs = 22;
  const pts: [number, number, number][] = [];
  for (let i = 0; i < segs; i++) {
    const k = i / (segs - 1);
    const y = 60 - k * 200;
    const x = Math.sin(t * 1.6 + k * 5.2) * (30 + k * 60) + (k > 0.5 ? Math.sin(k * 6) * 20 : 0);
    pts.push([x, y, 34 - k * 22]);
  }
  // 冰晶背刺 + 身體（由尾到頭）
  for (let i = segs - 1; i >= 0; i--) {
    const [x, y, r] = pts[i];
    const nx = i > 0 ? pts[i - 1] : pts[0];
    const ang = Math.atan2(nx[1] - y, nx[0] - x);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    // 背部冰刺
    fillPoly(ctx, [[-6, -r * 0.7], [0, -r * 1.7 - (i % 2) * 8], [8, -r * 0.7]], lin(ctx, 0, -r * 0.7, 0, -r * 1.8, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.2);
    fillPoly(ctx, [[-6, r * 0.7], [0, r * 1.5 + (i % 3) * 5], [8, r * 0.7]], lin(ctx, 0, r * 0.7, 0, r * 1.6, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r, 0, 0, TAU);
    ctx.fillStyle = lin(ctx, 0, -r, 0, r, [[0, "#f6feff"], [0.5, "#9bb6c8"], [1, "#3a5670"]]);
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(71,224,255,0.55)";
    ctx.fillRect(-r * 0.5, -1.5, r, 3);
    ctx.globalCompositeOperation = "source-over";
    ctx.restore();
  }
  // 龍首（朝下）
  const jaw = 8 + Math.sin(t * 4) * 5 + ph * 4;
  ctx.save();
  ctx.translate(pts[0][0], pts[0][1] + 6);
  fillPoly(ctx, [[0, 56], [20, 34], [34, 4], [26, -18], [0, -26], [-26, -18], [-34, 4], [-20, 34]], lin(ctx, -34, 0, 34, 0, [[0, "#4a6a88"], [0.5, "#f2fcff"], [1, "#4a6a88"]]), OUT, 2.2);
  // 下顎
  fillPoly(ctx, [[-16, 30], [-6, 56 + jaw], [0, 64 + jaw], [6, 56 + jaw], [16, 30]], "#2a4560", OUT, 1.6);
  for (let i = -2; i <= 2; i++) fillPoly(ctx, [[i * 6 - 2, 40], [i * 6, 52 + jaw * 0.6], [i * 6 + 2, 40]], "#ffffff", OUT, 0.8);
  // 犄角
  mirror(ctx, () => {
    fillPoly(ctx, [[18, -14], [44, -46], [30, -8]], lin(ctx, 18, -14, 44, -46, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.5);
    fillPoly(ctx, [[26, 0], [56, -10], [34, 14]], lin(ctx, 26, 0, 56, -10, [[0, "#3aa0e8"], [1, "#eaffff"]]), OUT, 1.5);
    glowDot(ctx, 15, 8, 9, "#47e0ff", 1);
  });
  ctx.restore();
  glowDot(ctx, pts[0][0], pts[0][1] + 44, 20 + jaw, "#7fe4ff", 0.5);
}

// ---------- 3 熔核巨像：熔岩傀儡 ----------
function bossGolem(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const slam = Math.max(0, Math.sin(t * 1.3));
  // 拳頭
  mirror(ctx, (s) => {
    const fy = 62 + slam * 26 * (s > 0 ? 1 : 0.6);
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 34;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(62, -22);
    ctx.lineTo(96, fy - 26);
    ctx.stroke();
    ctx.strokeStyle = "#3a2622";
    ctx.lineWidth = 26;
    ctx.stroke();
    fillPoly(ctx, [[74, fy - 20], [116, fy - 24], [124, fy + 22], [96, fy + 44], [70, fy + 26]], lin(ctx, 70, fy - 24, 124, fy + 44, [[0, "#5a3a32"], [1, "#1a0e0c"]]), OUT, 2.2);
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = "#ff7a2a";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(84, fy - 8);
    ctx.lineTo(96, fy + 6);
    ctx.lineTo(90, fy + 26);
    ctx.moveTo(104, fy - 10);
    ctx.lineTo(108, fy + 12);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    glowDot(ctx, 98, fy + 10, 26, "#ff5a1a", 0.35 + slam * 0.4);
  });
  // 軀幹
  fillPoly(ctx, [[0, 80], [38, 62], [72, 14], [80, -34], [50, -66], [0, -72], [-50, -66], [-80, -34], [-72, 14], [-38, 62]], lin(ctx, -80, 0, 80, 0, [[0, "#1a0e0c"], [0.5, "#5a3a32"], [1, "#1a0e0c"]]), OUT, 2.6);
  // 肩部火山口
  mirror(ctx, () => {
    fillPoly(ctx, [[34, -62], [58, -100], [76, -60]], lin(ctx, 34, -62, 76, -100, [[0, "#3a2622"], [1, "#7a5246"]]), OUT, 2);
    glowDot(ctx, 58, -96, 20, "#ff7a2a", 0.8);
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.9 + i / 3) % 1;
      glowDot(ctx, 58 + Math.sin(t * 3 + i) * 8, -96 - p * 50, 9 * (1 - p), "#ffb347", 0.9);
    }
  });
  // 熔岩裂紋
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,120,30,0.9)";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(-50, -40);
  ctx.lineTo(-28, -14);
  ctx.lineTo(-40, 14);
  ctx.lineTo(-22, 44);
  ctx.moveTo(50, -40);
  ctx.lineTo(26, -10);
  ctx.lineTo(40, 20);
  ctx.lineTo(18, 50);
  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
  // 胸口熔核
  const pl = 0.7 + 0.3 * Math.sin(t * 5);
  ctx.fillStyle = "#1a0806";
  ctx.beginPath();
  ctx.arc(0, 4, 26, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#ffb347";
  ctx.lineWidth = 3;
  ctx.stroke();
  glowDot(ctx, 0, 4, 40 + ph * 6, "#ff5a1a", pl);
  // 頭
  fillPoly(ctx, [[0, -54], [16, -66], [14, -84], [0, -90], [-14, -84], [-16, -66]], lin(ctx, 0, -54, 0, -90, [[0, "#2a1614"], [1, "#6a463c"]]), OUT, 2);
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "#ff9a3a";
  ctx.fillRect(-10, -76, 20, 4);
  ctx.globalCompositeOperation = "source-over";
}

// ---------- 4 緋紅絕翼：赤色炮艇（焰翼） ----------
function bossScarlet(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  // 焰羽翼
  mirror(ctx, (s) => {
    const n = 8;
    for (let i = n - 1; i >= 0; i--) {
      const k = i / (n - 1);
      const a = -0.5 + k * 1.6 + Math.sin(t * 2.4 + i * 0.7) * 0.05 + ph * 0.04;
      const L = 150 - k * 34;
      const rx = 18;
      const ry = -30 + k * 24;
      const tx = rx + Math.cos(a) * L;
      const ty = ry + Math.sin(a) * L * 0.9;
      const mx = (rx + tx) / 2;
      const my = (ry + ty) / 2;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      ctx.beginPath();
      ctx.moveTo(rx, ry - 8);
      ctx.quadraticCurveTo(mx - nx * 22, my - ny * 22, tx, ty);
      ctx.quadraticCurveTo(mx + nx * 10, my + ny * 10, rx, ry + 8);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, rx, ry, tx, ty, [[0, "#3a0510"], [0.5, "#c8142a"], [1, "#ff8a3a"]]);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      glowDot(ctx, tx, ty, 14, "#ff6a3a", 0.6);
    }
    // 側砲
    fillPoly(ctx, [[62, 20], [74, 20], [76, 84], [60, 84]], lin(ctx, 60, 0, 76, 0, [[0, "#2a0a10"], [0.5, "#9a4048"], [1, "#2a0a10"]]), OUT, 1.8);
    glowDot(ctx, 68, 86, 10, "#ff3b52", 0.7);
    void s;
  });
  // 船身
  fillPoly(ctx, [[0, 96], [22, 60], [34, 0], [30, -50], [0, -64], [-30, -50], [-34, 0], [-22, 60]], lin(ctx, -34, 0, 34, 0, [[0, "#3a0510"], [0.5, "#d81e34"], [1, "#3a0510"]]), OUT, 2.4);
  ctx.strokeStyle = "rgba(255,200,160,0.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(0, -56);
  ctx.lineTo(0, 88);
  ctx.stroke();
  // 核心之眼
  ctx.fillStyle = "#12030a";
  ctx.beginPath();
  ctx.ellipse(0, 10, 15, 24, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#ffd0a0";
  ctx.lineWidth = 2;
  ctx.stroke();
  glowDot(ctx, 0, 10, 32 + Math.sin(t * 5) * 4, "#ff3b52", 0.9);
  for (const x of [-16, 0, 16]) flame(ctx, x, -60, 40, 8, t + x, "#ffffff", "#ff8a3a", "rgba(255,30,10,0)");
}

// ---------- 5 天頂王座：黃金無畏艦與天環 ----------
function bossThrone(ctx: CanvasRenderingContext2D, e: Enemy, t: number, ph: number) {
  const G = ["#5a3608", "#ffe6a0", "#c8902a"];
  // 天環
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 2 + ph; i++) {
    ctx.globalAlpha = 0.9 - i * 0.15;
    ring(ctx, 0, -6, 130 + i * 26, 44 + i * 10, i % 2 ? "#fff0b0" : "#ffd36b", 3 - i * 0.5, 0, TAU, t * (0.4 + i * 0.15) * (i % 2 ? -1 : 1));
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // 尖刺翼
  mirror(ctx, () => {
    for (let i = 0; i < 5; i++) {
      const a = -0.9 + i * 0.5 + Math.sin(t * 1.5 + i) * 0.03;
      const L = 132 - i * 10;
      const tx = 24 + Math.cos(a) * L;
      const ty = -10 + Math.sin(a) * L;
      fillPoly(ctx, [[20, -24 + i * 14], [tx, ty], [24, -12 + i * 14]], lin(ctx, 20, -10, tx, ty, [[0, G[0]], [0.6, G[2]], [1, G[1]]]), "rgba(40,20,0,0.92)", 1.8);
    }
    fillPoly(ctx, [[26, 30], [70, 68], [64, 96], [24, 60]], lin(ctx, 26, 30, 70, 96, [[0, "#1a1030"], [1, "#7a5a20"]]), "rgba(40,20,0,0.92)", 1.8);
  });
  // 主艦體
  fillPoly(ctx, [[0, 104], [26, 70], [40, 6], [30, -54], [0, -70], [-30, -54], [-40, 6], [-26, 70]], lin(ctx, -40, 0, 40, 0, [[0, "#15102a"], [0.5, "#3a2c5c"], [1, "#15102a"]]), "rgba(40,20,0,0.95)", 2.4);
  // 金色鑲邊
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, 98);
  ctx.lineTo(22, 68);
  ctx.lineTo(35, 6);
  ctx.lineTo(26, -50);
  ctx.moveTo(0, 98);
  ctx.lineTo(-22, 68);
  ctx.lineTo(-35, 6);
  ctx.lineTo(-26, -50);
  ctx.stroke();
  // 王冠
  fillPoly(ctx, [[-22, -56], [-14, -90], [-6, -62], [0, -100], [6, -62], [14, -90], [22, -56]], lin(ctx, 0, -56, 0, -100, [[0, "#8a5a10"], [1, "#fff2b0"]]), "rgba(40,20,0,0.95)", 1.8);
  // 核心寶石
  const pl = 0.7 + 0.3 * Math.sin(t * 3);
  fillPoly(ctx, [[0, -16], [16, 10], [0, 40], [-16, 10]], lin(ctx, 0, -16, 0, 40, [[0, "#ffffff"], [0.5, "#ffd36b"], [1, "#a05a10"]]), "rgba(40,20,0,0.95)", 2);
  glowDot(ctx, 0, 12, 46 + ph * 10, "#ffd36b", 0.6 * pl);
  glowDot(ctx, 0, 12, 22, "#ffffff", 0.6 * pl);
  for (const x of [-18, 0, 18]) flame(ctx, x, -68, 38, 7, t + x, "#ffffff", "#ffd36b", "rgba(255,120,20,0)");
}

/** 繪製 Boss（原點為 Boss 中心；呼叫端負責 translate/scale） */
export function drawBossBody(ctx: CanvasRenderingContext2D, e: Enemy, t: number, px: number, py: number) {
  if (e.bossId >= 6) {
    // port/008 的 Boss（id 6~10）：來源的繪製函式以原點為中心（呼叫端已 translate/scale）
    switch (e.bossId) {
      case 6: return drawEye(ctx, t, e, px, py);
      case 7: return drawWhale(ctx, t, e);
      case 8: return drawDragon(ctx, t, e);
      case 9: return drawOracle(ctx, t, e);
      default: return drawKing(ctx, t, e); // 10 冠冕魘王
    }
  }
  const ph = e.ph;
  switch (e.bossId % 6) {
    case 0: return bossCrystal(ctx, e, t, ph);
    case 1: return bossFlagship(ctx, e, t, ph, px, py);
    case 2: return bossWyrm(ctx, e, t, ph);
    case 3: return bossGolem(ctx, e, t, ph);
    case 4: return bossScarlet(ctx, e, t, ph);
    case 5: return bossThrone(ctx, e, t, ph);
  }
}

// ═══════════ port/008 五位 Boss 的外觀（來源 render/bossDraw.ts）═══════════
// 來源以 Canvas 逐一描繪（非圖集）。原點為 Boss 中心、呼叫端負責 translate/scale；
// flash／invuln 由呼叫端（renderer.ts 的 drawBoss）處理，故這裡只負責機身。
type C = CanvasRenderingContext2D;

function rgba(color: string, a: number): string {
  if (color[0] === "#") {
    let h = color.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const m = color.match(/[\d.]+/g);
  if (m && m.length >= 3) return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
  return color;
}
function halo(c: C, color: string, rx: number, ry: number, a = 1) {
  c.save();
  c.scale(1, ry / rx);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, rx);
  g.addColorStop(0, rgba(color, 0.85 * a));
  g.addColorStop(0.45, rgba(color, 0.3 * a));
  g.addColorStop(1, rgba(color, 0));
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, rx, 0, TAU);
  c.fill();
  c.restore();
}
const lg = (c: C, x0: number, y0: number, x1: number, y1: number, st: [number, string][]) => {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const [o, col] of st) g.addColorStop(o, col);
  return g;
};
const rg = (c: C, x: number, y: number, r0: number, r1: number, st: [number, string][]) => {
  const g = c.createRadialGradient(x, y, r0, x, y, r1);
  for (const [o, col] of st) g.addColorStop(o, col);
  return g;
};
const glowAt = (c: C, x: number, y: number, r: number, col: string, a = 1) => {
  c.save();
  c.globalCompositeOperation = "lighter";
  c.translate(x, y);
  halo(c, col, r, r, a);
  c.restore();
};
// 左右對稱：第二次以 scale(-1,1) 翻轉繪製；回呼的 s 恆為 1（座標一律寫右半邊）
const sym = (c: C, fn: (s: number) => void) => {
  fn(1);
  c.save();
  c.scale(-1, 1);
  fn(1);
  c.restore();
};
const poly = (c: C, pts: number[][], fill: string | CanvasGradient, stroke?: string, lw = 1.5) => {
  c.beginPath();
  pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
};

/* ───────── 6 絳月魔瞳 ───────── */
function drawEye(c: C, t: number, e: Enemy, px: number, py: number) {
  const ph = e.ph;
  glowAt(c, 0, 0, 170, "#ff2d5a", 0.22 + ph * 0.07);
  // 外環
  c.strokeStyle = "#15111a"; c.lineWidth = 9; c.beginPath(); c.arc(0, 0, 130, 0, TAU); c.stroke();
  c.strokeStyle = "#4a3f4a"; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 124, 0, TAU); c.stroke();
  c.strokeStyle = "#2a222c"; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 136, 0, TAU); c.stroke();
  // 四根斜向尖塔（X 形）
  const rot = ph >= 3 ? t * 0.3 : Math.sin(t * 0.6) * 0.04;
  for (let i = 0; i < 4; i++) {
    c.save();
    c.rotate(Math.PI / 4 + (i * Math.PI) / 2 + rot - Math.PI / 2);
    c.fillStyle = lg(c, -9, 0, 9, 0, [[0, "#14101a"], [0.5, "#4a424c"], [1, "#16121a"]]);
    c.beginPath(); c.moveTo(-9, -52); c.lineTo(9, -52); c.lineTo(8, -126); c.lineTo(-8, -126); c.closePath(); c.fill();
    c.strokeStyle = "#7a6a58"; c.lineWidth = 1; for (const y of [-70, -92, -112]) { c.beginPath(); c.moveTo(-9, y); c.lineTo(9, y); c.stroke(); }
    c.fillStyle = "#ff3a58"; c.beginPath(); c.moveTo(-9, -126); c.lineTo(0, -156); c.lineTo(9, -126); c.closePath(); c.fill();
    c.restore();
    c.save(); c.rotate(Math.PI / 4 + (i * Math.PI) / 2 + rot - Math.PI / 2); glowAt(c, 0, -150, 26, "#ff2d5a", 0.8); c.restore();
  }
  const ring2 = (back: boolean) => {
    c.save();
    c.rotate(-0.5 + Math.sin(t * 0.4) * 0.14);
    const n = 64;
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU;
      const a1 = ((i + 1.2) / n) * TAU;
      const z = Math.sin(a0 + 0.05);
      if (back ? z >= 0 : z < 0) continue;
      c.strokeStyle = i % 4 === 0 ? "#ffe29a" : "#b8903a";
      c.lineWidth = 9;
      c.beginPath();
      c.ellipse(0, 0, 122, 36, 0, a0, a1);
      c.stroke();
      if (i % 3 === 0) { c.strokeStyle = "#5a4010"; c.lineWidth = 2; c.beginPath(); c.moveTo(Math.cos(a0) * 118, Math.sin(a0) * 32); c.lineTo(Math.cos(a0) * 126, Math.sin(a0) * 40); c.stroke(); }
    }
    c.restore();
  };
  ring2(true);
  // 球體
  c.fillStyle = rg(c, -18, -20, 6, 66, [[0, "#6a626e"], [0.6, "#2c262e"], [1, "#100d12"]]);
  c.beginPath(); c.arc(0, 0, 64, 0, TAU); c.fill();
  c.strokeStyle = "#0a080c"; c.lineWidth = 2;
  for (const r of [58, 46]) { c.beginPath(); c.arc(0, 0, r, 0.4, 2.6); c.stroke(); c.beginPath(); c.arc(0, 0, r, 3.5, 5.7); c.stroke(); }
  c.fillStyle = "#a08a58";
  for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.beginPath(); c.arc(Math.cos(a) * 56, Math.sin(a) * 56, 1.8, 0, TAU); c.fill(); }
  sym(c, (s) => { c.fillStyle = "#2a2428"; c.fillRect(60, -16, 24, 32); c.strokeStyle = "#6a5a4a"; c.lineWidth = 1.5; c.strokeRect(60, -16, 24, 32); c.fillStyle = "#c8a24a"; c.beginPath(); c.arc(72, 0, 4, 0, TAU); c.fill(); void s; });
  // 眼瞳
  const dx = px - e.x;
  const dy = py - e.y;
  const d = Math.hypot(dx, dy) || 1;
  const ox = (dx / d) * 7;
  const oy = (dy / d) * 7;
  c.fillStyle = rg(c, 0, 0, 4, 42, [[0, "#ff4a3a"], [0.55, "#c4162a"], [1, "#380610"]]);
  c.beginPath(); c.arc(0, 0, 42, 0, TAU); c.fill();
  c.strokeStyle = "rgba(60,4,12,0.5)"; c.lineWidth = 1;
  for (let i = 0; i < 28; i++) { const a = (i / 28) * TAU; c.beginPath(); c.moveTo(Math.cos(a) * 18, Math.sin(a) * 18); c.lineTo(Math.cos(a) * 40, Math.sin(a) * 40); c.stroke(); }
  c.strokeStyle = "#f2dede"; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 36, 2.3, 4.0); c.stroke();
  c.fillStyle = "#08030a"; c.beginPath(); c.arc(ox, oy, 17 + Math.sin(t * 2) * 1.2 + ph, 0, TAU); c.fill();
  c.fillStyle = "#ffcf5a"; c.beginPath(); c.arc(ox + 3, oy - 3, 4.5, 0, TAU); c.fill();
  glowAt(c, 0, 0, 62, "#ff2d5a", 0.45);
  ring2(false);
}

/* ───────── 7 潮喰鯨艦 ───────── */
function drawWhale(c: C, t: number, e: Enemy) {
  const ph = e.ph;
  glowAt(c, 0, 0, 170, "#2ff2d2", 0.12 + ph * 0.04);
  // 尾鰭
  sym(c, (s) => {
    c.beginPath(); c.moveTo(0, 96);
    c.bezierCurveTo(s * 22, 112, s * 62, 120, s * 70, 148); c.bezierCurveTo(s * 40, 142, s * 20, 136, 0, 120); c.closePath();
    c.fillStyle = lg(c, 0, 96, s * 60, 148, [[0, "#3a414c"], [1, "#14171c"]]); c.fill(); c.strokeStyle = "#6a727e"; c.lineWidth = 1.5; c.stroke();
  });
  // 船體
  const hull = (s: number) => { c.bezierCurveTo(s * 32, -102, s * 58, -64, s * 58, -20); c.bezierCurveTo(s * 60, 22, s * 46, 72, s * 16, 104); };
  c.beginPath(); c.moveTo(0, -114); hull(1); c.lineTo(0, 112); c.lineTo(-16, 104); c.bezierCurveTo(-46, 72, -60, 22, -58, -20); c.bezierCurveTo(-58, -64, -32, -102, 0, -114); c.closePath();
  c.fillStyle = lg(c, -58, 0, 58, 0, [[0, "#1a1d24"], [0.35, "#4a515c"], [0.5, "#5a626e"], [0.65, "#4a515c"], [1, "#1a1d24"]]); c.fill();
  c.strokeStyle = "#0a0c10"; c.lineWidth = 2.5; c.stroke();
  c.strokeStyle = "rgba(10,12,16,0.8)"; c.lineWidth = 1.6;
  for (let y = -84; y <= 80; y += 26) { const w = 54 - Math.abs(y + 10) * 0.16; c.beginPath(); c.moveTo(-w, y); c.quadraticCurveTo(0, y + 8, w, y); c.stroke(); }
  c.fillStyle = "rgba(10,12,16,0.55)"; c.fillRect(-8, -80, 16, 170);
  // 青綠能量條
  sym(c, () => { for (let i = 0; i < 9; i++) { const y = -48 + i * 11; c.fillStyle = `rgba(47,242,210,${0.65 + 0.3 * Math.sin(t * 4 + i)})`; c.fillRect(34, y, 7, 7); } glowAt(c, 38, 0, 70, "#2ff2d2", 0.25); });
  // 舷側砲塔（五對，砲管朝兩側）
  for (let i = 0; i < 5; i++) {
    const y = -62 + i * 27;
    sym(c, () => {
      c.fillStyle = "#2a2e36"; c.strokeStyle = "#0a0c10"; c.lineWidth = 1.5; c.fillRect(54, y - 9, 22, 18); c.strokeRect(54, y - 9, 22, 18);
      c.fillStyle = "#4a515c"; c.fillRect(56, y - 7, 18, 6);
      for (const dy of [-4, 4]) { c.fillStyle = "#1a1d24"; c.fillRect(76, y + dy - 2, 24, 4); c.fillStyle = "#2ff2d2"; c.fillRect(98, y + dy - 2, 4, 4); }
    });
  }
  // 頂部艦橋與燈眼
  c.fillStyle = lg(c, 0, -110, 0, -64, [[0, "#3a414c"], [1, "#1a1d24"]]);
  c.beginPath(); c.roundRect(-17, -104, 34, 40, 10); c.fill(); c.strokeStyle = "#0a0c10"; c.lineWidth = 2; c.stroke();
  glowAt(c, 0, -88, 26, "#2ff2d2", 0.9);
  c.fillStyle = "#c8fff4"; c.beginPath(); c.arc(0, -88, 7, 0, TAU); c.fill();
}

/* ───────── 8 凍嶺龍王（正統西方龍：雙翼、角、爪、脊刺） ───────── */
function drawDragon(c: C, t: number, e: Enemy) {
  const ph = e.ph;
  const fl = Math.sin(t * 1.8) * 0.08;
  glowAt(c, 0, 0, 200, "#8fdcff", 0.14 + ph * 0.04);
  // 長尾（錐形、帶脊刺）
  c.beginPath();
  c.moveTo(-16, 40);
  for (let i = 0; i <= 14; i++) c.lineTo(-(14 * (1 - i / 15) + 2), 40 + i * 10 + Math.sin(t * 2 - i * 0.5) * 3);
  for (let i = 14; i >= 0; i--) c.lineTo(14 * (1 - i / 15) + 2, 40 + i * 10 + Math.sin(t * 2 - i * 0.5) * 3);
  c.closePath();
  c.fillStyle = lg(c, -16, 0, 16, 0, [[0, "#5aa0d0"], [0.5, "#d4f0ff"], [1, "#5aa0d0"]]); c.fill(); c.strokeStyle = "#2a5a88"; c.lineWidth = 1.5; c.stroke();
  for (let i = 0; i < 14; i++) {
    const y = 44 + i * 10 + Math.sin(t * 2 - i * 0.5) * 3;
    const w = 14 * (1 - i / 15) + 2;
    c.fillStyle = "#e8fbff"; poly(c, [[-3, y], [0, y - 9], [3, y]], "#e8fbff");
    sym(c, () => poly(c, [[w, y + 2], [w + 7, y + 8], [w - 2, y + 9]], "#a8dcf4", "#3a78a8", 1));
  }
  // 後腿與爪
  sym(c, (s) => {
    poly(c, [[16, 38], [34, 58], [30, 74], [14, 62]], lg(c, 16, 38, 34, 74, [[0, "#9ad0f0"], [1, "#4a88b8"]]), "#2a5a88", 1.5);
    for (const [dx, dy] of [[30, 74], [38, 70], [24, 78]]) { c.fillStyle = "#f4fcff"; c.beginPath(); c.moveTo(dx - 3, dy - 2); c.lineTo(dx + (dx - 28) * 0.6, dy + 12); c.lineTo(dx + 3, dy - 2); c.fill(); }
    void s;
  });
  // 雙翼
  sym(c, (s) => {
    c.save();
    c.translate(18, -8);
    c.rotate(-fl);
    const tip = [150, -100], f1 = [166, -34], f2 = [134, 26], f3 = [86, 44], root = [10, 40];
    c.beginPath();
    c.moveTo(0, 0); c.lineTo(66, -56); c.lineTo(tip[0], tip[1]);
    c.quadraticCurveTo(tip[0] + 10, -66, f1[0], f1[1]);
    c.quadraticCurveTo(f1[0] - 12, -4, f2[0], f2[1]);
    c.quadraticCurveTo(f2[0] - 20, 40, f3[0], f3[1]);
    c.quadraticCurveTo(f3[0] - 36, 52, root[0], root[1]);
    c.closePath();
    c.fillStyle = lg(c, 0, 0, 160, -40, [[0, "rgba(120,200,235,0.95)"], [1, "rgba(180,235,255,0.7)"]]); c.fill();
    c.strokeStyle = "#e8fbff"; c.lineWidth = 3; c.lineCap = "round";
    c.beginPath(); c.moveTo(0, 0); c.lineTo(66, -56); c.lineTo(tip[0], tip[1]); c.stroke();
    c.lineWidth = 2;
    for (const f of [f1, f2, f3]) { c.beginPath(); c.moveTo(66, -56); c.lineTo(f[0], f[1]); c.stroke(); }
    c.strokeStyle = "rgba(255,255,255,0.35)"; c.lineWidth = 1;
    c.beginPath(); c.moveTo(66, -56); c.lineTo(100, -10); c.moveTo(66, -56); c.lineTo(76, 6); c.stroke();
    c.fillStyle = "#f4fcff"; c.beginPath(); c.moveTo(tip[0] - 4, tip[1] + 4); c.quadraticCurveTo(tip[0] + 18, tip[1] - 22, tip[0] + 30, tip[1] - 8); c.quadraticCurveTo(tip[0] + 14, tip[1] - 10, tip[0] + 2, tip[1] + 12); c.fill();
    c.restore();
    void s;
  });
  // 軀幹
  c.beginPath(); c.ellipse(0, 6, 24, 54, 0, 0, TAU);
  c.fillStyle = lg(c, -24, 0, 24, 0, [[0, "#4a88b8"], [0.5, "#d4f0ff"], [1, "#4a88b8"]]); c.fill(); c.strokeStyle = "#2a5a88"; c.lineWidth = 2; c.stroke();
  c.strokeStyle = "rgba(42,90,136,0.6)"; c.lineWidth = 1.4;
  for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(-18, -34 + i * 14); c.quadraticCurveTo(0, -28 + i * 14, 18, -34 + i * 14); c.stroke(); }
  for (let i = 0; i < 6; i++) poly(c, [[-4, -40 + i * 15], [0, -52 + i * 15], [4, -40 + i * 15]], "#f4fcff", "#3a78a8", 1);
  // 頸與頭
  poly(c, [[-11, -44], [-9, -72], [9, -72], [11, -44]], lg(c, -10, 0, 10, 0, [[0, "#5a98c8"], [0.5, "#d4f0ff"], [1, "#5a98c8"]]), "#2a5a88", 1.5);
  poly(c, [[0, -112], [-9, -98], [-17, -80], [-12, -66], [0, -62], [12, -66], [17, -80], [9, -98]], lg(c, 0, -112, 0, -62, [[0, "#e8fbff"], [1, "#7ab8e0"]]), "#2a5a88", 1.8);
  sym(c, (s) => {
    c.fillStyle = "#f4fcff"; c.strokeStyle = "#2a5a88"; c.lineWidth = 1.3;
    c.beginPath(); c.moveTo(9 * s, -76); c.quadraticCurveTo(34 * s, -86, 30 * s, -118); c.quadraticCurveTo(24 * s, -92, 8 * s, -88); c.closePath(); c.scale(s, 1); c.fill(); c.stroke();
    c.setTransform(c.getTransform());
  });
  sym(c, () => { glowAt(c, 8, -84, 12, "#7df6ff", 1); c.fillStyle = "#e8ffff"; c.beginPath(); c.ellipse(8, -84, 3.6, 2.2, 0.4, 0, TAU); c.fill(); });
  c.strokeStyle = "#2a5a88"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-6, -104); c.lineTo(0, -98); c.lineTo(6, -104); c.stroke();
  glowAt(c, 0, -62, 30 + ph * 4, "#bff4ff", 0.35 + Math.sin(t * 6) * 0.1);
}

/* ───────── 9 幻象機神 ───────── */
function hexPanel(c: C, x: number, y: number, r: number, col: string, t: number, k: number) {
  c.save(); c.translate(x, y + Math.sin(t * 1.6 + k) * 3); c.rotate(Math.sin(t * 0.5 + k) * 0.15);
  glowAt(c, 0, 0, r * 1.6, col, 0.5);
  c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3 + Math.PI / 6; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath();
  c.fillStyle = "rgba(18,10,40,0.82)"; c.fill(); c.strokeStyle = col; c.lineWidth = 2.5; c.stroke();
  c.strokeStyle = rgba(col, 0.8); c.lineWidth = 1.4;
  c.beginPath(); c.moveTo(-r * 0.5, -r * 0.2); c.lineTo(-r * 0.1, -r * 0.2); c.lineTo(0, r * 0.25); c.lineTo(r * 0.45, r * 0.25); c.moveTo(-r * 0.3, r * 0.4); c.lineTo(r * 0.1, r * 0.4); c.moveTo(r * 0.1, -r * 0.5); c.lineTo(r * 0.1, -r * 0.1); c.stroke();
  c.fillStyle = col; for (const [a, b] of [[-0.5, -0.2], [0.45, 0.25], [0.1, -0.5]]) { c.beginPath(); c.arc(a * r, b * r, 2.2, 0, TAU); c.fill(); }
  c.restore();
}
function drawOracle(c: C, t: number, e: Enemy) {
  const ph = e.ph;
  glowAt(c, 0, 0, 190, "#ff3df0", 0.14 + ph * 0.05);
  // 機械翼
  sym(c, (s) => {
    c.save(); c.scale(s, 1); c.rotate(Math.sin(t * 1.2) * 0.02);
    poly(c, [[44, -22], [124, -54], [152, -38], [122, -8], [156, 10], [124, 34], [70, 26]], lg(c, 44, -54, 156, 34, [[0, "#e4dcf6"], [1, "#7e72aa"]]), "#3a2f66", 2);
    for (let i = 0; i < 4; i++) poly(c, [[70 + i * 20, 26 - i * 4], [86 + i * 20, 30 - i * 6], [76 + i * 20, 58 + i * 4]], "#cfc6ec", "#3a2f66", 1);
    c.strokeStyle = "#ff3df0"; c.lineWidth = 2; c.beginPath(); c.moveTo(52, -16); c.lineTo(124, -40); c.moveTo(60, 8); c.lineTo(120, 16); c.stroke();
    glowAt(c, 100, -20, 26, "#ff3df0", 0.45);
    c.restore();
  });
  // 六面全息板
  const P: [number, number, number, string][] = [[-66, -84, 24, "#ff7aff"], [66, -84, 24, "#4de8ff"], [-104, -8, 30, "#ff7aff"], [104, -8, 30, "#4de8ff"], [-62, 88, 26, "#4de8ff"], [62, 88, 26, "#ff7aff"]];
  P.forEach(([x, y, r, col], i) => hexPanel(c, x, y, r, col, t, i));
  // 頂部頭冠與底鰭
  poly(c, [[0, -72], [-14, -48], [-8, -40], [8, -40], [14, -48]], lg(c, 0, -72, 0, -40, [[0, "#f0eaff"], [1, "#8a7eb4"]]), "#3a2f66", 2);
  poly(c, [[-12, 46], [12, 46], [6, 74], [-6, 74]], "#a89ccc", "#3a2f66", 2);
  // 光環
  c.strokeStyle = "#ffe066"; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 68, 0, TAU); c.stroke();
  c.strokeStyle = "rgba(255,224,102,0.35)"; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, 68, 0, TAU); c.stroke();
  // 球體核心
  c.fillStyle = rg(c, -12, -14, 4, 46, [[0, "#f4f0ff"], [0.5, "#a89ccc"], [1, "#3a2f66"]]);
  c.beginPath(); c.arc(0, 0, 46, 0, TAU); c.fill(); c.strokeStyle = "#241a48"; c.lineWidth = 2.5; c.stroke();
  c.strokeStyle = "rgba(36,26,72,0.8)"; c.lineWidth = 1.6; for (const r of [38, 30]) { c.beginPath(); c.arc(0, 0, r, 0.5, 2.7); c.stroke(); c.beginPath(); c.arc(0, 0, r, 3.6, 5.8); c.stroke(); }
  const pul = 1 + Math.sin(t * 4) * 0.12;
  c.fillStyle = rg(c, 0, 0, 2, 20 * pul, [[0, "#ffffff"], [0.4, "#ff7aff"], [1, "rgba(255,61,240,0)"]]);
  c.beginPath(); c.arc(0, 0, 22 * pul, 0, TAU); c.fill();
  glowAt(c, 0, 0, 56, "#ff3df0", 0.6);
}

/* ───────── 10 冠冕魘王 ───────── */
function feather(c: C, len: number, w: number, base: string, edge: string) {
  c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(len * 0.5, -w, len, 0); c.quadraticCurveTo(len * 0.5, w * 0.7, 0, 0); c.closePath();
  c.fillStyle = lg(c, 0, 0, len, 0, [[0, base], [0.55, "#2a0a14"], [1, edge]]); c.fill();
  c.strokeStyle = "rgba(0,0,0,0.5)"; c.lineWidth = 1; c.beginPath(); c.moveTo(4, 0); c.lineTo(len * 0.95, 0); c.stroke();
}
function drawKing(c: C, t: number, e: Enemy) {
  const ph = e.ph;
  glowAt(c, 0, -10, 220, "#ff2d5a", 0.16 + ph * 0.05);
  // 絳紅光環
  c.save(); c.globalCompositeOperation = "lighter"; c.strokeStyle = "rgba(255,70,90,0.8)"; c.lineWidth = 6; c.beginPath(); c.arc(0, -34, 100, 0, TAU); c.stroke(); c.strokeStyle = "rgba(255,70,90,0.25)"; c.lineWidth = 18; c.stroke(); c.restore();
  // 四片羽刃巨翼
  const flap = Math.sin(t * 1.4) * 0.06;
  sym(c, (s) => {
    c.save(); c.scale(s, 1);
    for (let i = 0; i < 9; i++) { c.save(); c.translate(26, -20); c.rotate(-1.15 + i * 0.1 + flap); feather(c, 150 - i * 5, 17, "#1a0a10", i % 2 ? "#e02a44" : "#7a1020"); c.restore(); }
    for (let i = 0; i < 8; i++) { c.save(); c.translate(26, -4); c.rotate(-0.2 + i * 0.11 - flap); feather(c, 156 - i * 6, 16, "#1a0a10", i % 2 ? "#c01a38" : "#2a0a14"); c.restore(); }
    for (let i = 0; i < 6; i++) { c.save(); c.translate(24, 6); c.rotate(0.62 + i * 0.1 + flap); feather(c, 110 - i * 8, 14, "#1a0a10", "#e02a44"); c.restore(); }
    c.restore();
  });
  // 浮空拳套（利爪）
  sym(c, (s) => {
    const x = 104 * s;
    const y = 124 + Math.sin(t * 2.2 + s) * 5;
    c.save(); c.translate(x, y); c.scale(s, 1);
    poly(c, [[-14, -16], [14, -16], [16, 10], [0, 20], [-16, 10]], lg(c, 0, -16, 0, 20, [[0, "#4a121e"], [1, "#16060a"]]), "#e02a44", 1.5);
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-12 + i * 8, 14); c.quadraticCurveTo(-14 + i * 8, 30, -8 + i * 8, 42); c.quadraticCurveTo(-6 + i * 8, 28, -4 + i * 8, 14); c.closePath(); c.fillStyle = "#220a10"; c.fill(); c.strokeStyle = "#ff4a5a"; c.lineWidth = 1.2; c.stroke(); }
    c.restore();
    glowAt(c, x, y + 10, 36, "#ff2d5a", 0.4);
  });
  // 白面具
  c.beginPath(); c.moveTo(0, -42); c.bezierCurveTo(30, -42, 34, -6, 22, 22); c.bezierCurveTo(14, 46, 6, 62, 0, 74); c.bezierCurveTo(-6, 62, -14, 46, -22, 22); c.bezierCurveTo(-34, -6, -30, -42, 0, -42); c.closePath();
  c.fillStyle = lg(c, -30, -40, 30, 70, [[0, "#ffffff"], [0.6, "#dfe3ec"], [1, "#a8afc0"]]); c.fill(); c.strokeStyle = "#8a90a4"; c.lineWidth = 2; c.stroke();
  c.strokeStyle = "#d4a84a"; c.lineWidth = 2.2; c.lineCap = "round";
  sym(c, (s) => { c.beginPath(); c.moveTo(4 * s, -36); c.bezierCurveTo(22 * s, -30, 26 * s, -6, 14 * s, 14); c.bezierCurveTo(10 * s, 26, 8 * s, 40, 2 * s, 54); c.stroke(); c.beginPath(); c.moveTo(10 * s, -22); c.quadraticCurveTo(22 * s, -12, 16 * s, 4); c.stroke(); });
  c.beginPath(); c.moveTo(0, -30); c.lineTo(0, 44); c.stroke();
  // 眼縫
  sym(c, (s) => { glowAt(c, 11 * s, -2, 16, "#ff2d5a", 0.9); poly(c, [[3 * s, 0], [20 * s, -8], [17 * s, 2], [4 * s, 6]], "#2a0610", "#ff4a5a", 1); });
  // 七尖金冠
  const L = [58, 74, 92, 116, 92, 74, 58];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.36;
    c.save(); c.translate(Math.cos(a) * 22, -44 + Math.sin(a) * 10); c.rotate(a + Math.PI / 2);
    c.beginPath(); c.moveTo(-6, 0); c.lineTo(0, -L[i]); c.lineTo(6, 0); c.closePath();
    c.fillStyle = lg(c, 0, 0, 0, -L[i], [[0, "#a87a1a"], [0.5, "#f0c850"], [1, "#fff4c0"]]); c.fill(); c.strokeStyle = "#7a5a10"; c.lineWidth = 1; c.stroke();
    c.restore();
  }
  c.strokeStyle = "#e8c050"; c.lineWidth = 6; c.beginPath(); c.arc(0, -34, 28, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
  c.fillStyle = "#ff2d5a"; c.beginPath(); c.arc(0, -60, 5, 0, TAU); c.fill(); glowAt(c, 0, -60, 16, "#ff2d5a", 0.9);
}


// ====== 來源: src/game/render/enemyDraw.ts ======
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

// ── port/008 移植的敵人外觀 helper（來源 render/shapes.ts 與 render/enemyDraw.ts）──
// 008 的敵人繪圖走 `poly`/`grad`/`eye`/`circ` 一組（與母專案的 hull/glowDot 不同）→ 一併搬入。
// 既有 SP 敵人繪圖不受影響（兩組 helper 各自獨立）。
function rgba(color: string, a: number): string {
  if (color[0] === "#") {
    let h = color.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const m = color.match(/[\d.]+/g);
  if (m && m.length >= 3) return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
  return color;
}
function halo(g: CanvasRenderingContext2D, color: string, rx: number, ry: number, a = 1) {
  g.save();
  g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  gr.addColorStop(0, rgba(color, 0.85 * a));
  gr.addColorStop(0.45, rgba(color, 0.3 * a));
  gr.addColorStop(1, rgba(color, 0));
  g.fillStyle = gr;
  g.beginPath();
  g.arc(0, 0, rx, 0, TAU);
  g.fill();
  g.restore();
}
const poly = (g: CanvasRenderingContext2D, pts: number[][], fill: string | CanvasGradient, stroke?: string, lw = 1) => {
  g.beginPath();
  pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
};
const grad = (g: CanvasRenderingContext2D, p: Pal, y0 = -20, y1 = 20) => {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, p.h1);
  gr.addColorStop(1, p.h2);
  return gr;
};
const eye = (g: CanvasRenderingContext2D, x: number, y: number, r: number, p: Pal) => {
  g.save();
  g.translate(x, y);
  halo(g, p.ac, r * 3, r * 3, 0.9);
  g.fillStyle = p.gl;
  g.beginPath();
  g.arc(0, 0, r, 0, TAU);
  g.fill();
  g.restore();
};
const circ = (g: CanvasRenderingContext2D, x: number, y: number, r: number, f: string | CanvasGradient) => { g.fillStyle = f; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };
function rgbaGrad(g: CanvasRenderingContext2D, p: Pal) {
  const gr = g.createLinearGradient(-12, -19, 12, 19);
  gr.addColorStop(0, rgba(p.gl, 0.9));
  gr.addColorStop(0.5, rgba(p.ac, 0.5));
  gr.addColorStop(1, rgba(p.h1, 0.9));
  return gr;
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

  // ═══ port/008 敵人外觀（cz_ 前綴；跳過第 4 關專屬的 cz_mid_oni）═══
  cz_scout: (c, p) => { poly(c, [[0, 18], [-14, -12], [-5, -6], [0, -14], [5, -6], [14, -12]], grad(c, p), p.ac, 1.4); eye(c, 0, 0, 2.6, p); },
  cz_dart: (c, p) => { poly(c, [[0, 20], [-5, -4], [-13, -17], [-3, -11], [0, -18], [3, -11], [13, -17], [5, -4]], grad(c, p), p.ac, 1.2); poly(c, [[0, 14], [-2, 0], [0, -6], [2, 0]], p.ac); },
  cz_wing: (c, p) => {
    sym(c, () => { c.beginPath(); c.moveTo(2, -4); c.quadraticCurveTo(22, -20, 19, 8); c.quadraticCurveTo(10, 0, 2, 10); c.closePath(); c.fillStyle = grad(c, p); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.3; c.stroke(); });
    c.beginPath(); c.ellipse(0, 0, 5, 13, 0, 0, 6.3); c.fillStyle = p.h2; c.fill(); c.strokeStyle = p.ac; c.stroke(); eye(c, 0, 6, 2.2, p);
  },
  cz_sentry: (c, p) => {
    c.beginPath(); for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3 + Math.PI / 6; c.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); } c.closePath(); c.fillStyle = grad(c, p); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.6; c.stroke();
    sym(c, () => poly(c, [[16, -4], [22, 4], [16, 10]], p.h2, p.ac, 1)); eye(c, 0, 0, 5, p); circ(c, 0, 0, 2, "#fff");
  },
  cz_spinner: (c, p) => {
    for (let i = 0; i < 4; i++) { c.save(); c.rotate((i * Math.PI) / 2); c.beginPath(); c.moveTo(3, -2); c.quadraticCurveTo(20, -4, 16, 8); c.quadraticCurveTo(10, 2, 3, 4); c.closePath(); c.fillStyle = grad(c, p, -20, 20); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.2; c.stroke(); c.restore(); }
    circ(c, 0, 0, 6, p.h2); c.strokeStyle = p.ac; c.lineWidth = 1.5; c.beginPath(); c.arc(0, 0, 6, 0, 6.3); c.stroke(); eye(c, 0, 0, 2.4, p);
  },
  cz_heavy: (c, p) => {
    poly(c, [[0, 19], [-10, 14], [-19, 4], [-17, -12], [-8, -17], [8, -17], [17, -12], [19, 4], [10, 14]], grad(c, p), p.ac, 1.6);
    sym(c, () => { c.fillStyle = "#14101c"; c.fillRect(9, 4, 4, 16); c.fillStyle = p.ac; c.fillRect(9, 17, 4, 3); });
    poly(c, [[-9, -8], [9, -8], [6, 2], [-6, 2]], p.h2, p.ac, 1); eye(c, 0, -3, 3, p);
  },
  cz_kami: (c, p) => {
    c.beginPath(); c.moveTo(0, 19); c.quadraticCurveTo(10, 4, 8, -10); c.lineTo(-8, -10); c.quadraticCurveTo(-10, 4, 0, 19); c.fillStyle = grad(c, p); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.3; c.stroke();
    sym(c, () => poly(c, [[7, -4], [15, -16], [8, -14]], p.h2, p.ac, 1)); eye(c, 0, 8, 3, { ...p, ac: "#ff3355", gl: "#fff" });
  },
  cz_turret: (c, p) => {
    c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 + Math.PI / 8; c.lineTo(Math.cos(a) * 17, Math.sin(a) * 17); } c.closePath(); c.fillStyle = grad(c, p); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = "#14101c"; c.fillRect(-3.5, 0, 7, 20); c.fillStyle = p.ac; c.fillRect(-2, 16, 4, 4); circ(c, 0, 0, 6, p.h2); eye(c, 0, 0, 2.4, p);
  },
  cz_minelayer: (c, p) => {
    poly(c, [[-18, -8], [18, -8], [20, 6], [8, 14], [-8, 14], [-20, 6]], grad(c, p), p.ac, 1.5);
    for (const x of [-10, 0, 10]) { circ(c, x, 6, 4, "#14101c"); circ(c, x, 6, 1.8, p.ac); }
    eye(c, 0, -3, 2.6, p);
  },
  cz_sniper: (c, p) => {
    poly(c, [[0, 20], [-3, 0], [-12, -10], [-4, -14], [0, -18], [4, -14], [12, -10], [3, 0]], grad(c, p), p.ac, 1.3);
    c.fillStyle = "#14101c"; c.fillRect(-1.6, 2, 3.2, 18); eye(c, 0, -6, 3.2, p); c.strokeStyle = p.gl; c.lineWidth = 1; c.beginPath(); c.arc(0, -6, 6, 0, 6.3); c.stroke();
  },
  cz_cruiser: (c, p) => {
    poly(c, [[0, 20], [-9, 12], [-12, -4], [-18, -10], [-8, -18], [8, -18], [18, -10], [12, -4], [9, 12]], grad(c, p), p.ac, 1.6);
    sym(c, () => { c.fillStyle = "#14101c"; c.fillRect(12, -2, 5, 14); c.fillStyle = p.ac; c.fillRect(12.5, 10, 4, 3); });
    c.beginPath(); c.ellipse(0, -2, 5, 9, 0, 0, 6.3); c.fillStyle = p.h2; c.fill(); eye(c, 0, -2, 3.6, p);
  },
  cz_ghost: (c, p) => {
    c.beginPath(); c.moveTo(-13, 14); c.quadraticCurveTo(-18, -16, 0, -17); c.quadraticCurveTo(18, -16, 13, 14); for (let i = 0; i < 4; i++) c.quadraticCurveTo(10 - i * 6.5 + 3, 8, 6.5 - i * 6.5 - 0.2, 14); c.closePath();
    const g2 = c.createLinearGradient(0, -17, 0, 14); g2.addColorStop(0, p.gl); g2.addColorStop(1, rgba(p.ac, 0.15)); c.fillStyle = g2; c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.2; c.stroke();
    circ(c, -5, -4, 2.6, "#10081c"); circ(c, 5, -4, 2.6, "#10081c"); circ(c, -5, -4, 1, p.ac); circ(c, 5, -4, 1, p.ac);
  },
  cz_carrier: (c, p) => {
    poly(c, [[-12, 19], [-19, 6], [-19, -14], [-8, -18], [8, -18], [19, -14], [19, 6], [12, 19]], grad(c, p), p.ac, 1.6);
    for (const x of [-10, 0, 10]) { c.fillStyle = "#10081c"; c.fillRect(x - 3, 2, 6, 12); c.fillStyle = rgba(p.ac, 0.7); c.fillRect(x - 3, 12, 6, 2); }
    eye(c, 0, -8, 3, p);
  },
  cz_aegis: (c, p) => {
    circ(c, 0, 0, 18, grad(c, p)); c.strokeStyle = p.ac; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, 18, 0, 6.3); c.stroke();
    c.strokeStyle = rgba(p.gl, 0.6); c.lineWidth = 1.2; c.beginPath(); c.arc(0, 0, 12, 0, 6.3); c.stroke();
    for (let i = 0; i < 4; i++) { c.save(); c.rotate((i * Math.PI) / 2 + 0.78); c.fillStyle = p.ac; c.fillRect(11, -1.5, 7, 3); c.restore(); }
    eye(c, 0, 0, 4, p);
  },
  cz_orbiter: (c, p) => {
    c.strokeStyle = rgba(p.ac, 0.8); c.lineWidth = 1.6; c.beginPath(); c.ellipse(0, 0, 18, 6, 0.5, 0, 6.3); c.stroke();
    circ(c, 0, 0, 10, grad(c, p)); c.strokeStyle = p.ac; c.lineWidth = 1.3; c.beginPath(); c.arc(0, 0, 10, 0, 6.3); c.stroke(); eye(c, 0, 0, 3.4, p);
  },
  cz_weaver: (c, p) => {
    sym(c, () => {
      c.beginPath(); c.moveTo(2, -4); c.bezierCurveTo(22, -24, 26, 2, 4, 6); c.closePath(); c.fillStyle = grad(c, p); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.2; c.stroke();
      c.beginPath(); c.moveTo(2, 4); c.bezierCurveTo(16, 6, 18, 20, 4, 16); c.closePath(); c.fillStyle = p.h2; c.fill(); c.stroke(); circ(c, 13, -6, 2.4, p.gl);
    });
    c.beginPath(); c.ellipse(0, 2, 2.8, 12, 0, 0, 6.3); c.fillStyle = p.h2; c.fill(); eye(c, 0, -6, 2, p);
  },
  cz_lantern: (c, p) => {
    c.fillStyle = "#14101c"; c.fillRect(-6, -18, 12, 3); c.fillRect(-6, 14, 12, 3);
    c.beginPath(); c.ellipse(0, 0, 13, 15, 0, 0, 6.3); const g2 = c.createRadialGradient(0, 0, 2, 0, 0, 15); g2.addColorStop(0, p.gl); g2.addColorStop(0.6, p.ac); g2.addColorStop(1, p.h2); c.fillStyle = g2; c.fill();
    c.strokeStyle = rgba(p.h2, 0.8); c.lineWidth = 1; for (const x of [-7, 0, 7]) { c.beginPath(); c.ellipse(0, 0, Math.abs(x) + 0.5, 15, 0, 0, 6.3); c.stroke(); }
    c.strokeStyle = p.ac; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 17); c.lineTo(0, 20); c.stroke();
  },
  cz_pillar: (c, p) => {
    poly(c, [[-9, 19], [-12, 10], [-8, -14], [0, -19], [8, -14], [12, 10], [9, 19]], grad(c, p), p.ac, 1.5);
    c.strokeStyle = p.gl; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-4, -8); c.lineTo(4, -2); c.lineTo(-3, 3); c.lineTo(4, 10); c.stroke(); eye(c, 0, -10, 2.4, p);
  },
  cz_mirror: (c, p) => {
    poly(c, [[0, -19], [13, -2], [0, 19], [-13, -2]], rgbaGrad(c, p), p.gl, 1.4);
    poly(c, [[0, -10], [6, -2], [0, 10], [-6, -2]], rgba(p.gl, 0.35)); eye(c, 0, -2, 2.4, p);
  },
  cz_swarm: (c, p) => { halo(c, p.ac, 16, 16, 0.9); circ(c, 0, 0, 5, p.gl); sym(c, () => poly(c, [[3, -1], [14, -8], [9, 4]], rgba(p.gl, 0.6))); },
  cz_bomber: (c, p) => {
    poly(c, [[0, 18], [-6, 8], [-20, 4], [-16, -8], [-6, -6], [-4, -16], [4, -16], [6, -6], [16, -8], [20, 4], [6, 8]], grad(c, p), p.ac, 1.5);
    c.fillStyle = "#10081c"; c.fillRect(-5, 4, 10, 8); c.fillStyle = p.ac; c.fillRect(-3, 10, 6, 2); eye(c, 0, -6, 2.4, p);
  },
  cz_mid_gunship: (c, p) => {
    poly(c, [[0, 20], [-8, 14], [-20, 8], [-18, -6], [-10, -12], [-8, -19], [8, -19], [10, -12], [18, -6], [20, 8], [8, 14]], grad(c, p), p.ac, 1.4);
    sym(c, () => { c.fillStyle = "#10081c"; c.fillRect(10, 4, 4, 15); c.fillStyle = p.ac; c.fillRect(10, 16, 4, 3); poly(c, [[16, -4], [20, -10], [20, 0]], p.h2, p.ac, 1); });
    c.beginPath(); c.ellipse(0, -2, 5, 11, 0, 0, 6.3); c.fillStyle = p.h2; c.fill(); eye(c, 0, -2, 4, p);
  },
  cz_mid_walker: (c, p) => {
    sym(c, () => { for (const [x, y, ex, ey] of [[8, -4, 18, -12], [10, 2, 20, 6], [8, 8, 17, 18]]) { c.strokeStyle = p.ac; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x, y); c.lineTo((x + ex) / 2 + 2, (y + ey) / 2 - 3); c.lineTo(ex, ey); c.stroke(); } poly(c, [[10, -14], [19, -10], [14, -6]], p.h2, p.ac, 1); });
    c.beginPath(); c.ellipse(0, 0, 13, 15, 0, 0, 6.3); c.fillStyle = grad(c, p); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.6; c.stroke();
    sym(c, () => { c.fillStyle = "#10081c"; c.fillRect(5, 4, 3.4, 12); }); eye(c, 0, -4, 4, p);
  },
  cz_mid_cruiser: (c, p) => {
    poly(c, [[0, 20], [-9, 13], [-11, -2], [-19, -9], [-10, -19], [10, -19], [19, -9], [11, -2], [9, 13]], grad(c, p), p.ac, 1.5);
    sym(c, () => { c.fillStyle = "#10081c"; c.fillRect(12, 0, 5, 14); c.fillStyle = p.ac; c.fillRect(12.5, 12, 4, 3); });
    c.beginPath(); c.ellipse(0, -2, 6, 11, 0, 0, 6.3); c.fillStyle = p.h2; c.fill(); eye(c, 0, -2, 4.5, p);
  },
  cz_mid_sentinel: (c, p) => {
    c.strokeStyle = p.ac; c.lineWidth = 2; c.beginPath(); c.moveTo(-18, -8); c.lineTo(18, -8); c.stroke();
    sym(c, () => { c.beginPath(); c.arc(14, 2, 7, 0, Math.PI); c.closePath(); c.fillStyle = p.h2; c.fill(); c.stroke(); c.beginPath(); c.moveTo(14, -8); c.lineTo(10, 2); c.moveTo(14, -8); c.lineTo(18, 2); c.stroke(); });
    poly(c, [[0, 20], [-7, 4], [-5, -16], [5, -16], [7, 4]], grad(c, p), p.ac, 1.5); eye(c, 0, -4, 4, p);
  },
  cz_mid_saint: (c, p) => {
    sym(c, () => { c.beginPath(); c.moveTo(3, -8); c.bezierCurveTo(24, -26, 28, 6, 8, 16); c.bezierCurveTo(14, 4, 10, -2, 3, 0); c.closePath(); c.fillStyle = grad(c, p); c.fill(); c.strokeStyle = p.ac; c.lineWidth = 1.2; c.stroke(); });
    c.beginPath(); c.moveTo(0, -17); c.quadraticCurveTo(9, -6, 6, 18); c.lineTo(-6, 18); c.quadraticCurveTo(-9, -6, 0, -17); c.fillStyle = p.gl; c.fill(); c.strokeStyle = p.ac; c.stroke();
    c.strokeStyle = p.ac; c.lineWidth = 1.4; c.beginPath(); c.arc(0, -20, 6, 0, 6.3); c.stroke(); eye(c, 0, -6, 2.4, p);
  },
};

// 旋轉／朝向玩家的判定一律用 **ai 詞彙**（不是 id）：cz_ 前綴的移植敵人才不會靜默失效。
const SPIN_AI = new Set(["spinner", "orbit", "cz_spinner", "cz_orbit"]);
const AIM_AI = new Set(["turret", "sniper", "cz_turret", "cz_sniper"]);

export function enemySprite(id: string, theme: number): ESprite {
  const key = id + "|" + theme;
  let s = cache.get(key);
  if (s) return s;
  const def = ENEMIES[id];
  // port/008 移植的敵人（cz_）：繪圖設計空間 ±26（52 單位）、最終世界尺寸＝size/40×52
  // （對應來源的 `scale = SPR/52` 與 `52 * scale`）；母專案既有敵人維持 ±22／size 不變。
  const cz = id.startsWith("cz_");
  const design = cz ? 52 : 44;
  const size = cz ? (def.size / 40) * 52 : def.size;
  const px = Math.ceil(size * SS);
  const pal = THEME_PAL[theme % THEME_PAL.length];
  const c = makeCanvas(px, px);
  const g = c.getContext("2d")!;
  g.translate(px / 2, px / 2);
  g.scale(px / design, px / design);
  (DRAW[id] || DRAW.scout)(g, pal);
  // 受擊閃白版本
  const f = makeCanvas(px, px);
  const fg = f.getContext("2d")!;
  fg.drawImage(c, 0, 0);
  fg.globalCompositeOperation = "source-atop";
  fg.fillStyle = "rgba(255,255,255,0.78)";
  fg.fillRect(0, 0, px, px);
  s = { n: c, f, s: size, spin: SPIN_AI.has(def.ai), aim: AIM_AI.has(def.ai) };
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


// ====== 來源: src/game/render/sprites.ts ======
// 預渲染精靈：光暈、敵彈、我方子彈。全部以離屏 Canvas 快取，drawImage 繪製以維持 60FPS
import { TAU } from "../constants";
import { EXT_BASE, EXT_STYLES } from "./pbStylesExt";

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w);
  c.height = Math.ceil(h);
  return c;
}

// ── 顏色工具（011 / port/011 移植家族用：把色票轉成帶透明度的 rgba 字串）──
const rgbCache = new Map<string, [number, number, number]>();
let rgbProbe: CanvasRenderingContext2D | null = null;
/** 任意 CSS 顏色 → [r,g,b]（用 1×1 canvas 正規化，可吃 #rgb／#rrggbb／rgb()／顏色名）
 *  ⚠ 無頭環境（Node 測試的 mock ctx）不會把 `fillStyle` 正規化回字串 → 直接解析傳入值。
 *   瀏覽器路徑不受影響（真 canvas 一定回字串）。 */
export function toRGB(color: string): [number, number, number] {
  const hit = rgbCache.get(color);
  if (hit) return hit;
  if (!rgbProbe) rgbProbe = makeCanvas(1, 1).getContext("2d")!;
  rgbProbe.fillStyle = "#000";
  rgbProbe.fillStyle = color;
  const raw = rgbProbe.fillStyle as unknown;
  const s = typeof raw === "string" ? raw : color;
  let out: [number, number, number] = [255, 255, 255];
  if (s[0] === "#") {
    out = s.length >= 7
      ? [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)]
      : [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16)];
  } else {
    const m = s.match(/[\d.]+/g);
    if (m) out = [+m[0], +m[1], +m[2]];
  }
  rgbCache.set(color, out);
  return out;
}
export function rgba(color: string, a: number) {
  const [r, g, b] = toRGB(color);
  return `rgba(${r},${g},${b},${a})`;
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

/** 敵彈外圈柔光留白（px，單邊）。
 *
 *  來源：2026-10-20 大爺指定「第 1~6 關（原生）的子彈特效要比照 port/013《絕響天穹》，
 *  像會發出淡淡柔光」。013 的敵彈精靈是 64×64 畫布、`glow()` 鋪滿整張、本體只佔中間一小塊
 *  → 光暈有足夠空間散開；SP 原本只留 8px，光暈被畫布邊界切掉，看起來是「硬邊亮點」。
 *
 *  ⚠ 只改**外觀**：碰撞半徑仍是 `EB_R`（未動），所以手感與難度不變，只有視覺變柔。
 *  ⚠ 精靈變大＝每顆子彈的 `drawImage` 面積變大，效能成本與 013 同級；不需要更柔就調小這裡。 */
const EB_GLOW = 12;

function buildEB(type: number, col: string): HTMLCanvasElement {
  const rad = EB_R[type];
  const body = type === 3 ? 22 : type === 6 ? 14 : rad + 8;
  const S = (body + EB_GLOW) * 2;
  const c = makeCanvas(S, S);
  const g = c.getContext("2d")!;
  g.translate(S / 2, S / 2);
  // 外光暈：柔邊徑向漸層（drawImage 同檔 glow() 精靈，對齊 port/010 A 的作法）。
  // 2026-10-14 前這裡是 `globalAlpha=0.28` 的硬邊實心圓，在針彈／米粒後面會形成
  // 一個與本體無關的「奇怪的圓」；不可改回。
  // 2026-10-20：畫布加了 EB_GLOW 留白 → 同一張 glow 鋪滿整張，光暈自然往外散開（013 式柔光）。
  g.drawImage(glow(col, 64), -S / 2, -S / 2, S, S);
  // 內層補一圈較集中的柔光：讓本體邊緣有一層「發光體」的過渡，不會只有外圈一層薄霧。
  g.save();
  g.globalCompositeOperation = "lighter";
  g.globalAlpha = 0.35;
  const inner = rad + 8 + EB_GLOW * 0.45;
  g.drawImage(glow(col, 64), -inner, -inner, inner * 2, inner * 2);
  g.restore();
  // 本體輪廓：一律用子彈本色細線（1.4px）描邊，取代舊的深色硬描邊 rgba(20,0,10,0.9)
  const outline = () => { g.strokeStyle = col; g.lineWidth = 1.4; g.stroke(); };
  if (type === 0 || type === 1 || type === 2 || type === 5) {
    const R = rad + 2.2;
    g.fillStyle = col;
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.fill();
    outline();
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
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(L, 0);
    g.lineTo(-L * 0.6, -2.8);
    g.lineTo(-L * 0.85, 0);
    g.lineTo(-L * 0.6, 2.8);
    g.closePath();
    g.fill();
    outline();
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
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(R, 0);
    g.lineTo(0, -R * 0.6);
    g.lineTo(-R * 0.8, 0);
    g.lineTo(0, R * 0.6);
    g.closePath();
    g.fill();
    outline();
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
    g.fillStyle = col;
    g.beginPath();
    g.ellipse(0, 0, 5.4, 3.2, 0, 0, TAU);
    g.fill();
    outline();
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

// ══════════════ port/008 血統的敵彈精靈（czEbSprite） ══════════════
// 008 的敵彈外觀與母專案**同名、不同實作**（來源：`port/008/src/game/render/sprites.ts` 的
// `ebSprite()` 與 `port/008/src/game/render/shapes.ts`）。三處硬差異，不可共用：
//   ① **type 語意相反**：008 的 `type 3` 是「球體（orb）」、母專案的 `type 3` 是「針彈」
//      → 這就是隕石雨（`cz_meteor` 發 type 3）在 SP 被畫成「一條線加一點」的根因
//      （2026-10-11 大爺回報「敵方子彈沒搬過來，子彈長得不一樣」）。
//   ② 七色表／七半徑表都不同（見下方常數；半徑同時是**碰撞半徑**）。
//   ③ 定向彈種不同：008 是 `{1,2,4,6}`、精靈設計為「彈頭朝上」→ 繪製時轉 `ang + π/2`；
//      母專案是 `{3,4,6}`、精靈設計為「朝 +x」→ 轉 `ang`。
// 精靈固定 48×48，繪製一律 `drawImage(spr, x-24, y-24)`。
// 由 `EBullet.cz` 旗標在生成與渲染時分流（見 `renderer.drawEnemyBullets`）。
export const CZ_EB_COLORS = ["#ff3355", "#ffb02e", "#ffe66b", "#4dff9d", "#3de0ff", "#8a7bff", "#ff6bd6"];
/** 008 的敵彈半徑（**碰撞用**；與母專案差很多，例如 type 5 是 7 vs 16、type 2 是 3 vs 10）。 */
export const CZ_EB_R = [5, 4, 3, 9, 5, 7, 5];
export const CZ_EB_SIZE = 48;
/** 008 的定向彈種（旋轉量為 `ang + π/2`）。 */
export const CZ_DIR_EB = new Set([1, 2, 4, 6]);

/** 008 `shapes.ts` 的 `rgba()`：接受 `#rgb`／`#rrggbb`／`rgb()`／`rgba()`。 */
function czRgba(color: string, a: number): string {
  if (color[0] === "#") {
    let h = color.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h.slice(0, 6), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  const m = color.match(/[\d.]+/g);
  if (m && m.length >= 3) return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
  return color;
}

type CzStops = [number, string][];

/** 008 `shapes.ts` 的 `halo()`：橢圓光暈（以中心為原點）。 */
function czHalo(g: CanvasRenderingContext2D, color: string, rx: number, ry: number, a = 1) {
  g.save();
  g.scale(1, ry / rx);
  const grd = g.createRadialGradient(0, 0, 0, 0, 0, rx);
  grd.addColorStop(0, czRgba(color, 0.85 * a));
  grd.addColorStop(0.45, czRgba(color, 0.3 * a));
  grd.addColorStop(1, czRgba(color, 0));
  g.fillStyle = grd;
  g.beginPath();
  g.arc(0, 0, rx, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

/** 008 `shapes.ts` 的 `needle()`：針形（彈頭朝上）。 */
function czNeedle(g: CanvasRenderingContext2D, w: number, h: number, stops: CzStops) {
  const grd = g.createLinearGradient(0, -h / 2, 0, h / 2);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(0, -h / 2);
  g.bezierCurveTo(w * 0.55, -h * 0.25, w * 0.5, h * 0.2, 0, h / 2);
  g.bezierCurveTo(-w * 0.5, h * 0.2, -w * 0.55, -h * 0.25, 0, -h / 2);
  g.fill();
}

/** 008 `shapes.ts` 的 `drop()`：火滴（圓頭朝上、尾朝下）。 */
function czDrop(g: CanvasRenderingContext2D, w: number, h: number, stops: CzStops) {
  const grd = g.createLinearGradient(0, -h / 2, 0, h / 2);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(0, h / 2);
  g.bezierCurveTo(-w * 0.62, h * 0.1, -w * 0.5, -h * 0.5, 0, -h / 2);
  g.bezierCurveTo(w * 0.5, -h * 0.5, w * 0.62, h * 0.1, 0, h / 2);
  g.fill();
}

/** 008 `shapes.ts` 的 `orb()`：徑向漸層球體。 */
function czOrb(g: CanvasRenderingContext2D, r: number, stops: CzStops) {
  const grd = g.createRadialGradient(-r * 0.25, -r * 0.25, 0, 0, 0, r);
  for (const [o, col] of stops) grd.addColorStop(o, col);
  g.fillStyle = grd;
  g.beginPath();
  g.arc(0, 0, r, 0, Math.PI * 2);
  g.fill();
}

const czEbCache = new Map<number, HTMLCanvasElement>();

/** port/008 血統的敵彈精靈（逐字對齊來源 `ebSprite()`；7 型 × 7 色）。 */
export function czEbSprite(type: number, color: number): HTMLCanvasElement {
  const key = type * 10 + color;
  let c = czEbCache.get(key);
  if (c) return c;
  c = makeCanvas(CZ_EB_SIZE, CZ_EB_SIZE);
  const g = c.getContext("2d")!;
  const col = CZ_EB_COLORS[color % 7];
  g.translate(CZ_EB_SIZE / 2, CZ_EB_SIZE / 2);
  czHalo(g, col, 17, 17, 0.75);
  const r = CZ_EB_R[type % 7];
  // 註：下面兩行在 008 來源即存在（case 0/3 會覆寫成白線）；雖不影響畫面，
  // 但 _cz_eb_test 以「繪圖指令序列逐字對帳」，不可刪。
  g.lineWidth = 2;
  g.strokeStyle = "#1a0a14";
  switch (type % 7) {
    case 0:
    case 3:
      czOrb(g, r + 1, [[0, "#ffffff"], [0.45, col], [1, czRgba(col, 0.95)]]);
      g.beginPath();
      g.arc(0, 0, r + 1, 0, 6.3);
      g.strokeStyle = czRgba("#ffffff", 0.9);
      g.lineWidth = 1.4;
      g.stroke();
      break;
    case 1:
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(0, 0, r - 0.5, r * 1.9, 0, 0, 6.3);
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.ellipse(0, -1, r * 0.4, r * 1.2, 0, 0, 6.3);
      g.fill();
      break;
    case 2:
      czNeedle(g, r * 2.2, r * 7, [[0, "#fff"], [0.5, col], [1, czRgba(col, 0.5)]]);
      break;
    case 4:
      g.fillStyle = col;
      g.beginPath();
      g.moveTo(0, -r * 1.5);
      g.lineTo(r, 0);
      g.lineTo(0, r * 1.5);
      g.lineTo(-r, 0);
      g.closePath();
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.moveTo(0, -r * 0.8);
      g.lineTo(r * 0.4, 0);
      g.lineTo(0, r * 0.8);
      g.lineTo(-r * 0.4, 0);
      g.closePath();
      g.fill();
      break;
    case 5:
      g.fillStyle = col;
      g.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 - Math.PI / 2;
        const rr = i % 2 ? r * 0.45 : r * 1.25;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(0, 0, r * 0.38, 0, 6.3);
      g.fill();
      break;
    default:
      czDrop(g, r * 1.6, r * 3.2, [[0, "#fff"], [0.45, col], [1, czRgba(col, 0.6)]]);
  }
  czEbCache.set(key, c);
  return c;
}

// ---------------- 我方子彈精靈（朝上；additive 疊加） ----------------
export interface PBStyle {
  spr: HTMLCanvasElement;
  dir: boolean; // 是否依速度方向旋轉
  spin: boolean;
  // 顯示邏輯寬高：精靈本體 + 光暈留白（pad=12），物理 canvas 為 2× 此值。
  // 來源 cf5 pbStyle 的 cw/ch 即此值；dst 既有 mk() 精靈無留白，dispW=canvas 物理寬。
  dispW?: number;
  dispH?: number;
}
const pbStyles: PBStyle[] = [];
const extCache = new Map<number, PBStyle>();

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

// ── port/015《星詠序曲》的子彈繪圖工具（逐行搬自 `port/015/src/game/render/sprites.ts`）──
//  與上面 SP 舊版的差別見 `buildPB()` 的註解。名稱加 015 後綴避免與舊 helper 撞名
//  （舊的 teardrop／needle／crescent／orb 仍保留：其它批次或日後微調還會用到）。
const lgv015 = (c: CanvasRenderingContext2D, y0: number, y1: number, stops: [number, string][]) => {
  const g = c.createLinearGradient(0, y0, 0, y1);
  for (const [o, s] of stops) g.addColorStop(o, s);
  return g;
};
/** 橢圓光暈：以子彈長寬比拉伸的徑向漸層（細長彈才有包覆感，不會變成一顆圓球）。 */
const halo015 = (c: CanvasRenderingContext2D, w: number, h: number, col: string, a = 0.5) => {
  c.save();
  c.scale(1, h / w);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, w / 2);
  g.addColorStop(0, rgba(col, a));
  g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.fillRect(-w / 2, -w / 2, w, w);
  c.restore();
};
/** 水滴彈體：三段漸層（白頭 → 主色 → 深尾），肩部比 SP 舊版更飽滿。 */
const drop015 = (c: CanvasRenderingContext2D, w: number, h: number, st: [number, string][]) => {
  c.beginPath();
  c.moveTo(0, -h / 2);
  c.bezierCurveTo(w * 0.75, -h * 0.1, w * 0.55, h * 0.5, 0, h / 2);
  c.bezierCurveTo(-w * 0.55, h * 0.5, -w * 0.75, -h * 0.1, 0, -h / 2);
  c.fillStyle = lgv015(c, -h / 2, h / 2, st);
  c.fill();
};
/** 光矛：尖端在 -h/2，尾端收在 h/2。 */
const needle015 = (c: CanvasRenderingContext2D, w: number, h: number, c0: string, c1: string) => {
  c.beginPath();
  c.moveTo(0, -h / 2);
  c.quadraticCurveTo(w * 0.62, -h * 0.05, w * 0.3, h / 2);
  c.lineTo(-w * 0.3, h / 2);
  c.quadraticCurveTo(-w * 0.62, -h * 0.05, 0, -h / 2);
  c.fillStyle = lgv015(c, -h / 2, h / 2, [[0, c0], [1, c1]]);
  c.fill();
};
/** 新月刃：上緣是弧、下緣是內凹弧。 */
const moon015 = (c: CanvasRenderingContext2D, w: number, h: number, c0: string, c1: string) => {
  c.beginPath();
  c.moveTo(-w / 2, h / 2);
  c.quadraticCurveTo(0, -h * 0.9, w / 2, h / 2);
  c.quadraticCurveTo(0, -h * 0.1, -w / 2, h / 2);
  c.fillStyle = lgv015(c, -h / 2, h / 2, [[0, c0], [1, c1]]);
  c.fill();
};
/** 實心球核心：`#fff → 主色`，**到半徑處仍是實色**（邊緣明確，才有「芯」）。 */
const orb015 = (c: CanvasRenderingContext2D, r: number, c0: string, c1: string) => {
  const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  c.fillStyle = g;
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fill();
};

function buildPB() {
  // ══════════════════════════════════════════════════════════════════════════
  // 我方子彈樣式 0~22 —— 2026-10-20 改為 **port/015《星詠序曲》的繪法**
  //
  // 大爺：「015 的子彈比較有質感，參考一下 015 的子彈修改 SP 的子彈輪廓」。
  // 對帳後確認 015 的 `BASE`（23 種）與 SP 的 `pbStyles`（0~22）**是同一套家族的
  // 後期修訂版**：寬高逐一相同、角色一一對應，只差在畫法。差別只有三點：
  //   ① 015 每一顆都先鋪一層 **橢圓光暈**（`halo`，隨子彈長寬比拉伸）——
  //      SP 原本用圓形 `orb`，細長彈（光矛／針）的光暈會變成一顆圓球掛在腰上。
  //   ② 015 的核心 `orb` **邊緣是實色**（`#fff → 色`，到半徑處才收），
  //      SP 的是 `色 → 透明`，整顆糊成一團、沒有「芯」。
  //   ③ 015 的彈體漸層是三段（白頭 → 主色 → 深尾），SP 是兩段。
  // 尺寸完全不變 → 顯示大小、命中感、效能都不受影響（純換皮）。
  // ══════════════════════════════════════════════════════════════════════════
  // 0 赤鴉：焰羽
  pbStyles[0] = mk(26, 46, (g) => {
    halo015(g, 26, 46, "#ff9a3a");
    drop015(g, 14, 40, [[0, "#ffffff"], [0.5, "#ffa53a"], [1, "#ff3a2a"]]);
  });
  // 1 鳳凰火球（大）
  pbStyles[1] = mk(56, 80, (g) => {
    halo015(g, 56, 80, "#ffd25a", 0.55);
    drop015(g, 34, 70, [[0, "#fff6c8"], [0.5, "#ffb13b"], [1, "#ff4a2a"]]);
  });
  // 2 餘燼火星
  pbStyles[2] = mk(18, 18, (g) => {
    halo015(g, 18, 18, "#ffb13b");
    orb015(g, 5, "#fff3b0", "#ff8a2a");
  }, false);
  // 3 蒼槍：光矛
  pbStyles[3] = mk(20, 80, (g) => {
    halo015(g, 20, 80, "#46b8ff", 0.45);
    needle015(g, 8, 76, "#ffffff", "#4aa8ff");
  });
  // 4 側翼細矛
  pbStyles[4] = mk(14, 52, (g) => needle015(g, 5, 50, "#ffffff", "#8fd0ff"));
  // 5 翠嵐：風刃
  pbStyles[5] = mk(56, 40, (g) => {
    halo015(g, 56, 40, "#3dff9a", 0.3);
    moon015(g, 52, 32, "#ffffff", "#2fd884");
  });
  // 6 氣旋
  pbStyles[6] = mk(26, 26, (g) => {
    orb015(g, 11, "#ffffff", "#8fffc8");
    g.strokeStyle = "#ffffff";
    g.lineWidth = 2;
    g.beginPath();
    g.arc(0, 0, 7, 0.3, 3);
    g.stroke();
  }, false, true);
  // 7 紫電：電弧彈
  pbStyles[7] = mk(18, 34, (g) => {
    halo015(g, 18, 34, "#a35cff");
    needle015(g, 8, 30, "#fff3a0", "#a35cff");
  });
  // 8 極性雷彈
  pbStyles[8] = mk(30, 30, (g) => {
    orb015(g, 13, "#ffffff", "#c9a8ff");
    g.strokeStyle = "#ffe14a";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-6, -8);
    g.lineTo(1, -1);
    g.lineTo(-2, 1);
    g.lineTo(6, 9);
    g.stroke();
  }, false, true);
  // 9 玄影：暗物質彈
  pbStyles[9] = mk(60, 60, (g) => {
    halo015(g, 60, 60, "#9a4aff", 0.6);
    orb015(g, 14, "#000000", "#1a0030");
    g.strokeStyle = "#c58bff";
    g.lineWidth = 3;
    g.beginPath();
    g.arc(0, 0, 20, 0.3, 2.3);
    g.stroke();
    g.beginPath();
    g.arc(0, 0, 20, 3.5, 5.5);
    g.stroke();
  }, false, true);
  // 10 暗影針
  pbStyles[10] = mk(14, 40, (g) => needle015(g, 6, 38, "#e0c8ff", "#8a3dff"));
  // 11 星輝：稜鏡脈衝
  pbStyles[11] = mk(18, 36, (g) => {
    g.fillStyle = "#4aa8ff";
    g.beginPath();
    g.moveTo(0, -17);
    g.lineTo(8, 0);
    g.lineTo(0, 17);
    g.lineTo(-8, 0);
    g.closePath();
    g.fill();
    g.fillStyle = "#cfeaff";
    g.beginPath();
    g.moveTo(0, -10);
    g.lineTo(4, 0);
    g.lineTo(0, 10);
    g.lineTo(-4, 0);
    g.closePath();
    g.fill();
  });
  // 12 追蹤微型飛彈（白彈身＋青彈頭＋橙色尾焰）
  pbStyles[12] = mk(18, 40, (g) => {
    halo015(g, 18, 40, "#ffb13b", 0.3);
    g.save();
    g.translate(0, 11);
    drop015(g, 9, 16, [[0, "#fff3b0"], [0.5, "#ffb13b"], [1, "#ff3a2a"]]);
    g.restore();
    g.fillStyle = "#ffffff";
    g.fillRect(-3, -14, 6, 22);
    g.fillStyle = "#46e6ff";
    g.beginPath();
    g.moveTo(0, -20);
    g.lineTo(4, -12);
    g.lineTo(-4, -12);
    g.closePath();
    g.fill();
  });
  // 13 機神加特林
  pbStyles[13] = mk(16, 46, (g) => {
    halo015(g, 16, 46, "#ffb13b", 0.4);
    needle015(g, 6, 44, "#fff3b0", "#ff9a2a");
  });
  // 14 肩砲火箭（白彈身＋橙彈頭＋尾焰）
  pbStyles[14] = mk(30, 60, (g) => {
    halo015(g, 30, 60, "#ffb13b", 0.35);
    g.save();
    g.translate(0, 17);
    drop015(g, 14, 24, [[0, "#fff3b0"], [0.5, "#ffb13b"], [1, "#ff3a2a"]]);
    g.restore();
    g.fillStyle = "#ffffff";
    g.beginPath();
    g.roundRect(-5, -20, 10, 30, 4);
    g.fill();
    g.fillStyle = "#ff8a2a";
    g.beginPath();
    g.moveTo(0, -28);
    g.lineTo(6, -18);
    g.lineTo(-6, -18);
    g.closePath();
    g.fill();
  });
  // 15 折射稜鏡彈
  pbStyles[15] = mk(18, 18, (g) => {
    halo015(g, 18, 18, "#7ae8ff", 0.45);
    orb015(g, 7, "#ffffff", "#7ae8ff");
  }, false, true);
  // 16 僚機彈
  pbStyles[16] = mk(12, 26, (g) => needle015(g, 5, 24, "#ffffff", "#a8d8ff"));
  // 17 方舟曳光彈
  pbStyles[17] = mk(14, 40, (g) => {
    halo015(g, 14, 40, "#ffd25a", 0.4);
    needle015(g, 5, 38, "#ffffff", "#ffc23a");
  });
  // 18 鳳翼弧焰
  pbStyles[18] = mk(70, 46, (g) => {
    halo015(g, 70, 46, "#ffb13b", 0.35);
    moon015(g, 66, 40, "#fff3b0", "#ff8a2a");
  });
  // 19 大型火球
  pbStyles[19] = mk(70, 70, (g) => {
    halo015(g, 70, 70, "#ffb13b", 0.5);
    orb015(g, 24, "#fff3b0", "#ff8a2a");
  }, false, true);
  // 20 藍色雷球（Volt 落雷小彈）
  pbStyles[20] = mk(22, 22, (g) => {
    halo015(g, 22, 22, "#fff3b0");
    orb015(g, 8, "#ffffff", "#ffe27a");
  }, false, true);
  // 21 翠龍風刃
  pbStyles[21] = mk(40, 28, (g) => moon015(g, 38, 24, "#ffffff", "#aaf5d0"));
  // 22 逆轉紫雷彈
  pbStyles[22] = mk(20, 32, (g) => {
    halo015(g, 20, 32, "#9a5cff");
    needle015(g, 9, 28, "#e8d6ff", "#8a3dff");
  });
}

// 擴充精靈預繪倍率：對齊來源 cf5 SPR_RES=2（2× canvas + shadowBlur 不裁切→柔邊）
// dst 原本 1×，glowOn(glowSet) 的 shadowBlur 只有幾 px、被 canvas 邊裁掉→方角硬邊。
const SPR_RES_EXT = 2;
const SPR_PAD = 12; // 光暈留白（對齊來源 cf5 pad=12）
export function pbStyle(i: number): PBStyle {
  if (!pbStyles.length) buildPB();
  if (i >= EXT_BASE) {
    const ext = extCache.get(i);
    if (ext) return ext;
    const e = EXT_STYLES.find((q) => q.id === i);
    if (!e) return pbStyle(0);
    // 照來源 cf5：cw = w + 2*pad，物理 canvas = cw*SPR_RES，scale(SPR_RES)、translate(cw/2, ch/2)
    const cw = e.w + SPR_PAD * 2;
    const ch = e.h + SPR_PAD * 2;
    const c = makeCanvas(cw * SPR_RES_EXT, ch * SPR_RES_EXT);
    const g = c.getContext("2d")!;
    g.scale(SPR_RES_EXT, SPR_RES_EXT);
    g.translate(cw / 2, ch / 2);
    e.draw(g);
    // dir/spin 由樣式自行宣告（未宣告＝dir:true/spin:false，與既有 23~26 一致）
    const s: PBStyle = { spr: c, dir: e.dir ?? true, spin: e.spin ?? false, dispW: cw, dispH: ch };
    extCache.set(i, s);
    return s;
  }
  return pbStyles[i] || pbStyles[0];
}

/** 在目前合成模式下畫一顆發光球（來源 port/011 sprites.ts 逐行搬運）。 */
export function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a = 1) {
  const pa = ctx.globalAlpha;
  ctx.globalAlpha = pa * Math.max(0, Math.min(1, a));
  ctx.drawImage(glow(color, 64), x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = pa;
}

/**
 * 星紋天域（port/011，TT 六台）自訂我方子彈樣式索引。
 * 實際樣式掛在 `pbStylesExt.ts` 的 `EXT_BASE_TT`（=231）+ n，見該檔尾端。
 * 來源自身的 base 為 170（`EXT_BASE_SZ`）；dst 另開 231 槽避開既有 +0~+41 與各批次。
 */
export const SX = { FEATHER: 0, LANCE: 1, WAVE: 2, EMBER: 3, SHELL: 4, MISSILE: 5, PALE: 6, CRESCENT: 7, SHARD: 8, MOONNEEDLE: 9, STROKE: 10, BLOB: 11, NEEDLE: 12, PETAL: 13, PINK: 14, GOLD: 15 };


// ====== 來源: src/game/render/background.ts ======
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
  t: number;
}

export type BgKind = "city" | "ocean" | "ice" | "volcano" | "cyber" | "space";

/** port/008 的三種飛掠。它們在來源是**獨立於背景捲動**的：位置由自己的 `t` 算、生命固定 14 秒
 *  （見 `port/008/src/game/render/background.ts` 的 `flyby()`）。
 *  SP 舊的 `fly` 機制（ship／whale／arc）是 `y += 60*speed*dt` —— 與背景同速，
 *  拿它畫 008 的彗星就會變成「貼著背景滑的一條線＋一個點」（大爺實機抓到的「流星變靜止」）。 */
const CZ_FLY = new Set(["silhouette", "comet", "lantern"]);

/** 隕石岩石輪廓：以固定 seed 產生不規則多邊形。
 *  ⚠ **不可用 `Math.random()`**：本函式每幀都會被呼叫，隨機會讓石頭每幀變形＝閃爍。
 *  seed 取 `flyby()` 當下抽到的 `f.x`（常數）→ 同一顆隕石整趟形狀固定。 */
function rockPts(seed: number): [number, number][] {
  let s = (Math.floor(Math.abs(seed) * 997) % 2147483647) + 1;
  const rnd = () => ((s = (s * 48271) % 2147483647) / 2147483647);
  const out: [number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    const r = 6.2 + rnd() * 5.4;
    out.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return out;
}

/** 火焰拖尾：自原點朝 `ang` 延伸 `len` 的錐形漸層（起點寬 `w0`、末端收成尖）。 */
function flameTail(ctx: CanvasRenderingContext2D, ang: number, len: number, w0: number, stops: [number, string][]) {
  const cx = Math.cos(ang);
  const cy = Math.sin(ang);
  const nx = -cy;
  const ny = cx;
  const grd = ctx.createLinearGradient(0, 0, cx * len, cy * len);
  for (const [o, c] of stops) grd.addColorStop(o, c);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.moveTo(nx * w0, ny * w0);
  // 兩側微微內凹（二次曲線）→ 比直線三角形更像火舌
  ctx.quadraticCurveTo(cx * len * 0.45 + nx * w0 * 0.42, cy * len * 0.45 + ny * w0 * 0.42, cx * len, cy * len);
  ctx.quadraticCurveTo(cx * len * 0.45 - nx * w0 * 0.42, cy * len * 0.45 - ny * w0 * 0.42, -nx * w0, -ny * w0);
  ctx.closePath();
  ctx.fill();
}

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
  /** 這一道閃電的「體型」參數：由 `strike()` 每次重擲（見該處註解）。
   *  全部是純量 → `Background` 的狀態形狀不變，`draw()` 仍是純函式。 */
  boltLen = 420;
  boltN = 12;
  boltAmp = 30;
  boltFork = 0;
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

  /** 打一道裝飾閃電。由落雷光柱機關（`Game` 的 `thunder` 光束啟動時）呼叫 → **時機不由背景自己決定**。
   *
   *  為什麼不只擲 `boltSeed`：舊寫法是「兩顆固定頻率正弦 + 固定 26px 步長 + 固定振幅」，
   *  `boltSeed` 只會**平移相位**，長度／節點密度／擺幅全都固定 → 每一道都像同一條閃電換個抖動
   *  （實測：橫向擺幅 70px、σ 僅 8；覆蓋高度 520px、σ 0；節點數 20、σ 0）。
   *  這裡把**體型**一起重擲，才會「每道都不一樣」。 */
  strike() {
    this.flash = 1;
    this.boltX = rand(60, W - 60);
    this.boltT = 0.22;
    this.boltSeed = Math.random() * 100;
    // 體型：覆蓋高度（不是每次都整條 520）、節點數（步長 26~62 → 越長越疏）、擺幅、分枝數。
    // 擺幅 ≤ 40 且 boltX ∈ [60, W-60] → 折線必落在畫面內（不會像舊版有 3% 機率畫出界）。
    this.boltLen = rand(0.42, 0.74) * H;
    this.boltN = Math.max(4, Math.round(this.boltLen / rand(26, 62)));
    this.boltAmp = rand(20, 40);
    this.boltFork = Math.random() < 0.5 ? (Math.random() < 0.5 ? 2 : 1) : 0;
  }

  flyby(kind: string) {
    const cz = CZ_FLY.has(kind);
    this.fly = {
      x: cz ? rand(100, W - 100) : rand(140, W - 140),
      y: cz ? 0 : -420,
      s: cz ? 1 : rand(1.3, 2),
      kind,
      v: cz ? 0 : 60,
      t: 0,
    };
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
      const f = this.fly;
      f.t += dt;
      f.y += f.v * speed * dt;
      // cz 的三種飛掠生命固定 14 秒（來源同）；舊的 ship／whale／arc 飄出畫面才結束（可達 30 秒）。
      if ((CZ_FLY.has(f.kind) && f.t > 14) || f.y > H + 500) this.fly = null;
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
        ctx.strokeStyle = `rgba(210,230,255,${Math.min(1, this.boltT * 6)})`;
        const seg = this.boltLen / this.boltN;
        const seed = this.boltSeed;
        const y0 = -10;
        // 每節點水平位移＝seed-hash（同 `port/aShipUtil.ts` 的 `bolt()` 慣例），
        // **以 boltX 為中心**擺動（不是累積漂移）→ 折線貼著落雷光柱、尾端不會漂走。
        const px = (i: number) => {
          const r = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
          return this.boltX + (r - Math.floor(r) - 0.5) * 2 * this.boltAmp;
        };
        ctx.beginPath();
        ctx.moveTo(this.boltX, y0);
        for (let i = 1; i <= this.boltN; i++) ctx.lineTo(px(i), y0 + seg * i);
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 9;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
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
    if (CZ_FLY.has(f.kind)) {
      this.drawFlyCz(ctx, f);
      return;
    }
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

  /** port/008 的三種飛掠（逐字對齊來源 `flyby()`）：位置由 `f.t` 決定、生命 14 秒。 */
  private drawFlyCz(ctx: CanvasRenderingContext2D, f: Flyby) {
    const k = f.t / 14;
    ctx.save();
    if (f.kind === "silhouette") {
      // 巨大艦影緩慢掠過（視差最遠層）
      ctx.translate(f.x, -200 + k * (H + 500));
      ctx.globalAlpha = Math.max(0, 0.5 * Math.sin(k * Math.PI));
      ctx.fillStyle = "#05030a";
      ctx.beginPath();
      ctx.moveTo(0, 220);
      ctx.lineTo(-70, 60);
      ctx.lineTo(-150, 10);
      ctx.lineTo(-60, -40);
      ctx.lineTo(-30, -180);
      ctx.lineTo(30, -180);
      ctx.lineTo(60, -40);
      ctx.lineTo(150, 10);
      ctx.lineTo(70, 60);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255,80,110,0.8)";
      for (const dx of [-110, -60, 60, 110]) ctx.fillRect(dx, 8, 4, 4);
    } else if (f.kind === "comet") {
      const t = k * 20;
      const seed = (f.x || 0) * 0.013;
      const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

      ctx.translate(f.x - 100 + k * 400, -80 + k * (H + 160));
      ctx.rotate(Math.atan2(H + 160, 400));          // 本地 +x = 前進方向，尾巴朝 -x

      // 淡入淡出，避免突然出現/消失
      const fade = Math.max(0, Math.min(1, k / 0.12, (1 - k) / 0.18));
      ctx.globalAlpha *= fade * fade * (3 - 2 * fade);
      ctx.globalCompositeOperation = "lighter";

      const L = 360;

      // 錐形尾巴（尖端會隨時間輕微擺動）
      const tail = (len: number, wid: number, bend: number, rgb: string, a: number) => {
        const sway = Math.sin(t * 1.7 + seed) * wid * 0.25;
        const cy = bend * 0.5 + sway;
        const ey = bend + sway * 1.8;
        const g = ctx.createLinearGradient(0, 0, -len, ey);
        g.addColorStop(0, `rgba(${rgb},${a})`);
        g.addColorStop(0.25, `rgba(${rgb},${a * 0.5})`);
        g.addColorStop(0.6, `rgba(${rgb},${a * 0.15})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, -wid * 0.12);
        ctx.quadraticCurveTo(-len * 0.45, cy - wid, -len, ey);
        ctx.quadraticCurveTo(-len * 0.45, cy + wid, 0, wid * 0.12);
        ctx.closePath();
        ctx.fill();
      };

      // 塵埃尾：暖色、寬、微彎
      tail(L,        46,  L * 0.10,  "255,150,90",  0.10);
      tail(L * 0.85, 26,  L * 0.08,  "255,200,140", 0.16);
      tail(L * 0.60, 12,  L * 0.05,  "255,235,200", 0.22);
      // 離子尾：冷色、細、近乎筆直
      tail(L * 1.15, 18, -L * 0.02,  "110,170,255", 0.14);
      tail(L * 0.90,  6, -L * 0.015, "190,225,255", 0.22);

      // 細絲，增加尾巴的纖維質感
      ctx.lineCap = "round";
      for (let i = 0; i < 7; i++) {
        const r1 = rnd(i + seed), r2 = rnd(i * 3.7 + seed);
        const len = L * (0.5 + r1 * 0.6);
        const off = (r2 - 0.5) * 22;
        const wob = Math.sin(t * 2.2 + i * 1.9 + seed) * 6;
        const g = ctx.createLinearGradient(0, 0, -len, 0);
        g.addColorStop(0, "rgba(255,230,200,0.28)");
        g.addColorStop(1, "rgba(255,150,100,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.6 + r1 * 0.8;
        ctx.beginPath();
        ctx.moveTo(0, off * 0.2);
        ctx.quadraticCurveTo(-len * 0.5, off + wob, -len, off * 2.2 + wob * 1.5 + L * 0.05);
        ctx.stroke();
      }

      // 飄散的塵粒 / 火花（由彗頭向後流動並閃爍）
      for (let i = 0; i < 40; i++) {
        const r1 = rnd(i + seed), r2 = rnd(i * 2.3 + 5 + seed), r3 = rnd(i * 5.1 + 9 + seed);
        const life = (t * (0.25 + r1 * 0.35) + r2) % 1;
        const px = -life * L * (0.55 + r3 * 0.55);
        const py = (r3 - 0.5) * (6 + life * 54) + life * life * L * 0.09 + Math.sin(t * 2 + i) * life * 5;
        const tw = 0.6 + 0.4 * Math.sin(t * 6 + i * 4.1);
        const pa = (1 - life) * (1 - life) * Math.min(1, life * 10) * tw * 0.9;
        ctx.fillStyle = r1 > 0.45 ? `rgba(255,215,160,${pa})` : `rgba(170,210,255,${pa})`;
        ctx.beginPath();
        ctx.arc(px, py, 0.6 + r3 * 1.3, 0, 6.3);
        ctx.fill();
      }

      // 彗髮（光暈，會輕微呼吸）
      const cr = 38 * (1 + 0.06 * Math.sin(t * 5 + seed));
      const coma = ctx.createRadialGradient(0, 0, 0, 0, 0, cr);
      coma.addColorStop(0, "rgba(255,250,235,0.85)");
      coma.addColorStop(0.15, "rgba(255,225,170,0.45)");
      coma.addColorStop(0.5, "rgba(255,150,90,0.12)");
      coma.addColorStop(1, "rgba(255,120,80,0)");
      ctx.fillStyle = coma;
      ctx.beginPath();
      ctx.arc(0, 0, cr, 0, 6.3);
      ctx.fill();

      // 亮核
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, 6.3);
      ctx.fill();
    } else {
      // 紅燈籠群緩緩升空
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 9; i++) {
        const x = f.x + Math.sin(f.t * 0.7 + i * 1.7) * 90 + (i - 4) * 28;
        const y = H + 60 - ((f.t * 62 + i * 70) % (H + 160));
        const gr = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gr.addColorStop(0, "rgba(255,200,120,0.95)");
        gr.addColorStop(1, "rgba(255,60,40,0)");
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 6.3);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}
