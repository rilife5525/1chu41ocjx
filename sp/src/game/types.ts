// 共用型別定義
export type ShipId = "crow" | "lance" | "jade" | "volt" | "noir" | "prism";
export const SHIP_IDS: ShipId[] = ["crow", "lance", "jade", "volt", "noir", "prism"];

export type SlotId = "weapon" | "armor" | "engine" | "core" | "chip" | "emblem";
export const SLOT_IDS: SlotId[] = ["weapon", "armor", "engine", "core", "chip", "emblem"];
export type Rarity = "R" | "SR" | "SSR" | "UR";
export type StatKey = "atk" | "hp" | "spd" | "cd" | "ult" | "crit" | "exp" | "coin" | "rate" | "drop";
export type SkillKey = "weapon" | "passive" | "active" | "ult";

export interface SkillLv {
  weapon: number;
  passive: number;
  active: number;
  ult: number;
}

export interface EquipItem {
  id: string;
  slot: SlotId;
  rarity: Rarity;
  lv: number; // 強化等級 0~10
  name: string;
  icon: number; // 圖示變體
  main: { stat: StatKey; v: number };
  subs: { stat: StatKey; v: number }[];
  proc?: string; // 固有技 id（SSR/UR）
  locked?: boolean;
}

export interface ShipSave {
  lv: SkillLv;
  mods: { hp: number; atk: number; spd: number };
  equip: (string | null)[]; // 六格裝備 id
  best: number;
}

export type QualitySetting = "auto" | "high" | "mid" | "low";

export interface Settings {
  autoCard: boolean; // 升級卡片自動選擇
  quality: QualitySetting;
  bgm: number;
  sfx: number;
  shake: boolean;
  showDmg: boolean;
  sens: number; // 觸控靈敏度
  hitbox: boolean; // 顯示判定點
}

export interface StageRecord {
  clear: boolean[]; // 各難度是否通關
  hi: number[]; // 各難度最高分
}

export interface SaveData {
  v: number;
  coins: number;
  cores: number;
  sel: ShipId;
  ships: Record<ShipId, ShipSave>;
  inv: EquipItem[];
  stages: Record<string, StageRecord>;
  endless: { hi: number; time: number; wave: number };
  settings: Settings;
  stats: { kills: number; runs: number; playSec: number; maxCombo: number };
  tutorialSeen: boolean;
}

export interface RunResult {
  mode: "stage" | "endless";
  stageId: number;
  diff: number;
  ship: ShipId;
  win: boolean;
  score: number;
  kills: number;
  maxCombo: number;
  time: number;
  coins: number;
  cores: number;
  items: EquipItem[];
  level: number;
  wave: number;
  rank: "S" | "A" | "B" | "C";
  newHi: boolean;
}
