// 戰機資料骨架：欄位結構與接線保留，身份／技能描述血肉已清空，供照格式新增機體
import type { ShipId, SkillKey } from "../types";

export interface SkillInfo {
  name: string;
  en: string;
  icon: string;
  desc: string;
  /** 進化描述：對應技能等級 Lv3／Lv5／Lv7 */
  evo: [string, string, string];
}

export interface ShipDef {
  id: ShipId;
  name: string;
  en: string;
  sigil: string; // 星紋（超能力）名稱
  sigilEn: string;
  pilot: string;
  pilotEn: string;
  role: string;
  color: string;
  color2: string;
  dark: string;
  quote: string;
  lore: string;
  portrait: { sheet: "a" | "b"; col: number };
  base: { hp: number; spd: number; atk: number; rate: number };
  radar: { atk: number; spd: number; def: number; rng: number; ease: number };
  activeCd: number;
  ultTime: number; // 奧義自然充能所需秒數
  skills: Record<SkillKey, SkillInfo>;
  cut: { line1: string; line2: string };
}

export const SKILL_KEYS: SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = { weapon: "武裝", passive: "被動", active: "主動", ult: "奧義" };
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS = [3, 5, 7];

// 以下六筆為「佔位機體」：欄位結構即 ShipDef 契約範本，身份與技能描述皆清空。
// 新增機體時照此格式填一筆（或整筆替換佔位筆），並同步 types.ts / KITS / shipDraw / skills。
const PH: SkillInfo = {
  name: "佔位技能",
  en: "PLACEHOLDER",
  icon: "star",
  desc: "……（自創技能描述）……",
  evo: ["……（Lv3 進化）……", "……（Lv5 進化）……", "……（Lv7 進化）……"],
};

export const SHIPS: Record<ShipId, ShipDef> = {
  crow: {
    id: "crow",
    name: "佔位機體 A",
    en: "PLACEHOLDER A",
    sigil: "佔位",
    sigilEn: "PLACEHOLDER",
    pilot: "佔位",
    pilotEn: "PLACEHOLDER",
    role: "佔位定位",
    color: "#8899aa",
    color2: "#c8d2e0",
    dark: "#20262e",
    quote: "「……」",
    lore: "……（自創機體背景）……",
    portrait: { sheet: "a", col: 0 },
    base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
    radar: { atk: 3, spd: 3, def: 3, rng: 3, ease: 3 },
    activeCd: 13,
    ultTime: 44,
    skills: { weapon: PH, passive: PH, active: PH, ult: PH },
    cut: { line1: "", line2: "" },
  },
  lance: {
    id: "lance",
    name: "佔位機體 B",
    en: "PLACEHOLDER B",
    sigil: "佔位",
    sigilEn: "PLACEHOLDER",
    pilot: "佔位",
    pilotEn: "PLACEHOLDER",
    role: "佔位定位",
    color: "#8899aa",
    color2: "#c8d2e0",
    dark: "#20262e",
    quote: "「……」",
    lore: "……（自創機體背景）……",
    portrait: { sheet: "a", col: 1 },
    base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
    radar: { atk: 3, spd: 3, def: 3, rng: 3, ease: 3 },
    activeCd: 13,
    ultTime: 44,
    skills: { weapon: PH, passive: PH, active: PH, ult: PH },
    cut: { line1: "", line2: "" },
  },
  jade: {
    id: "jade",
    name: "佔位機體 C",
    en: "PLACEHOLDER C",
    sigil: "佔位",
    sigilEn: "PLACEHOLDER",
    pilot: "佔位",
    pilotEn: "PLACEHOLDER",
    role: "佔位定位",
    color: "#8899aa",
    color2: "#c8d2e0",
    dark: "#20262e",
    quote: "「……」",
    lore: "……（自創機體背景）……",
    portrait: { sheet: "a", col: 2 },
    base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
    radar: { atk: 3, spd: 3, def: 3, rng: 3, ease: 3 },
    activeCd: 13,
    ultTime: 44,
    skills: { weapon: PH, passive: PH, active: PH, ult: PH },
    cut: { line1: "", line2: "" },
  },
  volt: {
    id: "volt",
    name: "佔位機體 D",
    en: "PLACEHOLDER D",
    sigil: "佔位",
    sigilEn: "PLACEHOLDER",
    pilot: "佔位",
    pilotEn: "PLACEHOLDER",
    role: "佔位定位",
    color: "#8899aa",
    color2: "#c8d2e0",
    dark: "#20262e",
    quote: "「……」",
    lore: "……（自創機體背景）……",
    portrait: { sheet: "b", col: 0 },
    base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
    radar: { atk: 3, spd: 3, def: 3, rng: 3, ease: 3 },
    activeCd: 13,
    ultTime: 44,
    skills: { weapon: PH, passive: PH, active: PH, ult: PH },
    cut: { line1: "", line2: "" },
  },
  noir: {
    id: "noir",
    name: "佔位機體 E",
    en: "PLACEHOLDER E",
    sigil: "佔位",
    sigilEn: "PLACEHOLDER",
    pilot: "佔位",
    pilotEn: "PLACEHOLDER",
    role: "佔位定位",
    color: "#8899aa",
    color2: "#c8d2e0",
    dark: "#20262e",
    quote: "「……」",
    lore: "……（自創機體背景）……",
    portrait: { sheet: "b", col: 1 },
    base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
    radar: { atk: 3, spd: 3, def: 3, rng: 3, ease: 3 },
    activeCd: 13,
    ultTime: 44,
    skills: { weapon: PH, passive: PH, active: PH, ult: PH },
    cut: { line1: "", line2: "" },
  },
  prism: {
    id: "prism",
    name: "佔位機體 F",
    en: "PLACEHOLDER F",
    sigil: "佔位",
    sigilEn: "PLACEHOLDER",
    pilot: "佔位",
    pilotEn: "PLACEHOLDER",
    role: "佔位定位",
    color: "#8899aa",
    color2: "#c8d2e0",
    dark: "#20262e",
    quote: "「……」",
    lore: "……（自創機體背景）……",
    portrait: { sheet: "b", col: 2 },
    base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
    radar: { atk: 3, spd: 3, def: 3, rng: 3, ease: 3 },
    activeCd: 13,
    ultTime: 44,
    skills: { weapon: PH, passive: PH, active: PH, ult: PH },
    cut: { line1: "", line2: "" },
  },
};

/** 由技能等級推算進化階段：0（Lv1-2）、1（Lv3-4）、2（Lv5-6）、3（Lv7） */
export function evoTier(lv: number): number {
  return lv >= 7 ? 3 : lv >= 5 ? 2 : lv >= 3 ? 1 : 0;
}

/** 技能升級消耗（永久升級 Lv1→5） */
export function skillUpCost(lv: number): { coins: number; cores: number } {
  const t = [
    { coins: 400, cores: 0 },
    { coins: 1100, cores: 2 },
    { coins: 2600, cores: 4 },
    { coins: 5200, cores: 8 },
  ];
  return t[Math.min(3, Math.max(0, lv - 1))];
}

/** 機體改造消耗（HP／攻擊／機動 0→10） */
export function modUpCost(n: number): number {
  return Math.round(180 * Math.pow(n + 1, 1.55));
}

/** 機體外觀階級：依四項技能永久等級總和決定 0~3 */
export function shipTier(lv: { weapon: number; passive: number; active: number; ult: number }): number {
  const s = lv.weapon + lv.passive + lv.active + lv.ult;
  return s >= 19 ? 3 : s >= 13 ? 2 : s >= 7 ? 1 : 0;
}
export const TIER_NAME = ["初始型態", "改修型態", "進化型態", "覺醒型態"];
