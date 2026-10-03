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
};

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
  { id: 2, name: "霜牙冰龍", title: "FROSTFANG WYRM", hp: 27000, r: 60, art: 3, color: "#7fe4ff", quote: "萬物終將凍結於寂靜之中。" },
  { id: 3, name: "熔核巨像", title: "MAGMA COLOSSUS", hp: 34000, r: 74, art: 4, color: "#ff7a2a", quote: "燒盡一切，只留下灰燼。" },
  { id: 4, name: "緋紅絕翼", title: "SCARLET ANNIHILATOR", hp: 40000, r: 64, art: 0, color: "#ff3b52", quote: "你的天空，到此為止。" },
  { id: 5, name: "天頂王座", title: "ZENITH THRONE", hp: 58000, r: 72, art: 5, color: "#ffd36b", quote: "叛逆者啊，來坐上這張王座吧。" },
];

/** 各關卡敵機配色 */
export const THEME_PAL = [
  { h1: "#8a90d8", h2: "#20224a", ac: "#ff3bd0", gl: "#ff8aea" },
  { h1: "#9ec0e0", h2: "#1c3550", ac: "#ffb347", gl: "#ffd99a" },
  { h1: "#f0fbff", h2: "#3a6a8a", ac: "#47e0ff", gl: "#b0f4ff" },
  { h1: "#9a7468", h2: "#2a1614", ac: "#ff7a2a", gl: "#ffc28a" },
  { h1: "#8a8a9e", h2: "#1e1e2c", ac: "#ff3b52", gl: "#ff9aa8" },
  { h1: "#b8a0e0", h2: "#241a40", ac: "#ffd36b", gl: "#fff0b0" },
];
