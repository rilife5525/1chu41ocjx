// 裝備系統：六格欄位、四階稀有度（R/SR/SSR/UR）、副詞條與固有定時技
import type { EquipItem, Rarity, SlotId, StatKey } from "../types";
import { SLOT_IDS } from "../types";
import { pick, rand, randi } from "../constants";

export interface SlotInfo {
  name: string;
  en: string;
  stat: StatKey;
  bases: string[];
  color: string;
}

export const SLOT_INFO: Record<SlotId, SlotInfo> = {
  weapon: { name: "主砲", en: "CANNON", stat: "atk", color: "#ff6a3d", bases: ["脈衝砲", "離子砲", "相位砲", "磁軌砲", "曜石砲", "星鋒砲"] },
  armor: { name: "裝甲", en: "ARMOR", stat: "hp", color: "#5fc8ff", bases: ["複合裝甲", "蜂巢護甲", "鏡面護甲", "晶纖護甲", "鱗片護甲", "天鎧"] },
  engine: { name: "引擎", en: "ENGINE", stat: "spd", color: "#7dffb2", bases: ["推進器", "渦輪核心", "離子噴口", "反重力環", "燃素引擎", "星流引擎"] },
  core: { name: "核心", en: "CORE", stat: "ult", color: "#c58bff", bases: ["共鳴核心", "星紋反應爐", "超導晶核", "覺醒核心", "熵減核心", "叛逆核心"] },
  chip: { name: "晶片", en: "CHIP", stat: "exp", color: "#ffe45c", bases: ["戰術晶片", "演算晶片", "預測晶片", "感知晶片", "量子晶片", "全知晶片"] },
  emblem: { name: "徽章", en: "EMBLEM", stat: "cd", color: "#ff8ad4", bases: ["學院徽章", "叛逆徽章", "星痕徽章", "流星徽章", "王牌徽章", "天頂徽章"] },
};

export interface StatInfo {
  label: string;
  base: number; // R 級 +0 時的基礎值（百分比）
  sub: number; // 作為副詞條時的基礎值
}

export const STAT_INFO: Record<StatKey, StatInfo> = {
  atk: { label: "攻擊力", base: 7, sub: 3.5 },
  hp: { label: "生命值", base: 9, sub: 4 },
  spd: { label: "機動性", base: 5, sub: 2.5 },
  cd: { label: "冷卻縮減", base: 4, sub: 2 },
  ult: { label: "奧義充能", base: 8, sub: 4 },
  crit: { label: "暴擊率", base: 4, sub: 2.5 },
  exp: { label: "經驗獲取", base: 8, sub: 4 },
  coin: { label: "星晶獲取", base: 8, sub: 5 },
  rate: { label: "射速", base: 4, sub: 3 },
  drop: { label: "掉落率", base: 6, sub: 3 },
};

export const RARITY_INFO: Record<Rarity, { mult: number; subs: number; name: string; weight: number; sell: number; index: number }> = {
  R: { mult: 1, subs: 0, name: "一般", weight: 60, sell: 60, index: 1 },
  SR: { mult: 1.7, subs: 1, name: "稀有", weight: 28, sell: 180, index: 2 },
  SSR: { mult: 2.6, subs: 2, name: "傳說", weight: 10.5, sell: 600, index: 3 },
  UR: { mult: 4, subs: 3, name: "神話", weight: 1.5, sell: 2200, index: 4 },
};

export interface ProcDef {
  id: string;
  name: string;
  desc: string;
  interval: number;
  color: string;
  rarity: "SSR" | "UR";
}

// 裝備固有技：於戰鬥中定時自動觸發（實作於 engine/equipProcs.ts）
export const PROCS: Record<string, ProcDef> = {
  orbital: { id: "orbital", name: "軌道審判", desc: "每 9 秒，衛星對 3 個敵機降下軌道雷射。", interval: 9, color: "#7cf3ff", rarity: "SSR" },
  mend: { id: "mend", name: "修復脈衝", desc: "每 12 秒，回復 7% 最大生命並清除附近彈幕。", interval: 12, color: "#7dffb2", rarity: "SSR" },
  quake: { id: "quake", name: "震盪波", desc: "每 8 秒，釋放震盪波擊退並重創周圍敵機。", interval: 8, color: "#ffb347", rarity: "SSR" },
  meteor: { id: "meteor", name: "流星群", desc: "每 10 秒，召喚 7 顆流星砸向敵群。", interval: 10, color: "#ff6a3d", rarity: "SSR" },
  aegis: { id: "aegis", name: "星塵護幕", desc: "每 15 秒，獲得一層可抵擋一次傷害的護盾。", interval: 15, color: "#c8e8ff", rarity: "SSR" },
  nova: { id: "nova", name: "電漿新星", desc: "每 7 秒，向四面八方發射 18 道貫穿電漿。", interval: 7, color: "#ff5ad0", rarity: "UR" },
  chrono: { id: "chrono", name: "時隙擾流", desc: "每 14 秒，使全場敵彈減速 55%，持續 3 秒。", interval: 14, color: "#7c9bff", rarity: "UR" },
  halo: { id: "halo", name: "天環", desc: "每 11 秒，展開環繞機體的刀刃天環 4 秒。", interval: 11, color: "#ffe45c", rarity: "UR" },
  reaper: { id: "reaper", name: "死線收割", desc: "每 16 秒，處決全場生命低於 25% 的敵機並重創 Boss。", interval: 16, color: "#ff3b52", rarity: "UR" },
};
const PROC_SSR = Object.values(PROCS).filter((p) => p.rarity === "SSR").map((p) => p.id);
const PROC_UR = Object.values(PROCS).filter((p) => p.rarity === "UR").map((p) => p.id);

const PREFIX: Record<Rarity, string[]> = {
  R: ["訓練用", "標準型", "改良型", "量產型"],
  SR: ["戰術", "精銳", "黎明", "疾風"],
  SSR: ["審判", "夜想", "熾天", "極光"],
  UR: ["叛逆・", "天頂・", "星痕・", "終焉・"],
};

const SUB_POOL: StatKey[] = ["atk", "hp", "spd", "cd", "ult", "crit", "exp", "coin", "rate", "drop"];

let uidCounter = 0;
export function newId(): string {
  uidCounter++;
  return Date.now().toString(36) + uidCounter.toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}

/** 強化後數值 */
export function statValue(item: EquipItem, v: number): number {
  return v * (1 + item.lv * 0.12);
}

export function rollRarity(luck = 0, bossBonus = 0): Rarity {
  const w = { ...Object.fromEntries(Object.entries(RARITY_INFO).map(([k, v]) => [k, v.weight])) } as Record<Rarity, number>;
  w.SR *= 1 + luck * 0.25 + bossBonus * 0.6;
  w.SSR *= 1 + luck * 0.45 + bossBonus * 1.3;
  w.UR *= 1 + luck * 0.6 + bossBonus * 2.2;
  const total = w.R + w.SR + w.SSR + w.UR;
  let r = Math.random() * total;
  for (const k of ["R", "SR", "SSR", "UR"] as Rarity[]) {
    r -= w[k];
    if (r <= 0) return k;
  }
  return "R";
}

export function genItem(rarity?: Rarity, slot?: SlotId, luck = 0, bossBonus = 0): EquipItem {
  const rar = rarity ?? rollRarity(luck, bossBonus);
  const sl = slot ?? pick(SLOT_IDS);
  const info = SLOT_INFO[sl];
  const ri = RARITY_INFO[rar];
  const icon = randi(0, info.bases.length - 1);
  const name = `${pick(PREFIX[rar])}${info.bases[icon]}`;
  const mainV = STAT_INFO[info.stat].base * ri.mult * rand(0.92, 1.08);
  const subs: { stat: StatKey; v: number }[] = [];
  const pool = SUB_POOL.filter((s) => s !== info.stat);
  for (let i = 0; i < ri.subs; i++) {
    const s = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    subs.push({ stat: s, v: +(STAT_INFO[s].sub * (0.6 + ri.mult * 0.35) * rand(0.85, 1.15)).toFixed(1) });
  }
  const item: EquipItem = {
    id: newId(),
    slot: sl,
    rarity: rar,
    lv: 0,
    name,
    icon,
    main: { stat: info.stat, v: +mainV.toFixed(1) },
    subs,
  };
  if (rar === "SSR") item.proc = pick(PROC_SSR);
  if (rar === "UR") item.proc = pick(PROC_UR);
  return item;
}

/** 強化消耗 */
export function enhanceCost(item: EquipItem): { coins: number; cores: number } {
  const m = RARITY_INFO[item.rarity].mult;
  return { coins: Math.round(140 * (item.lv + 1) * m), cores: item.lv >= 4 ? Math.ceil((item.lv - 3) * Math.max(1, m / 1.7)) : 0 };
}

export const MAX_ENHANCE = 10;
export const MAX_INV = 80;

export function sellPrice(item: EquipItem): number {
  return Math.round(RARITY_INFO[item.rarity].sell * (1 + item.lv * 0.5));
}

/** 彙總裝備提供的所有加成（回傳「比例」，例如 0.12 = +12%） */
export function gearStats(items: EquipItem[]): Record<StatKey, number> {
  const out: Record<StatKey, number> = { atk: 0, hp: 0, spd: 0, cd: 0, ult: 0, crit: 0, exp: 0, coin: 0, rate: 0, drop: 0 };
  for (const it of items) {
    out[it.main.stat] += statValue(it, it.main.v) / 100;
    for (const s of it.subs) out[s.stat] += statValue(it, s.v) / 100;
  }
  return out;
}

/** 依已裝備物品算出各欄位稀有度階（0 = 空，1~4 = R~UR），供機體繪製附加外觀 */
export function gearTiers(items: (EquipItem | null)[]): number[] {
  return SLOT_IDS.map((_, i) => (items[i] ? RARITY_INFO[items[i]!.rarity].index : 0));
}
