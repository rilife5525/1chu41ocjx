// 升級卡片：通用強化 + 機體專屬技能進化卡
// apply 內的 g 為 Game 實例（避免循環引用以 any 標示）
import type { SkillKey } from "../types";

export interface CardDef {
  id: string;
  name: string;
  desc: (n: number) => string; // n = 取得後的層數
  rarity: 0 | 1 | 2; // 0 普通 1 稀有 2 史詩
  max: number;
  icon: string;
  weight: number;
  apply: (g: any, n: number) => void;
  skill?: SkillKey;
}

export const RARITY_CARD = [
  { name: "普通", color: "#dfe6ee" },
  { name: "稀有", color: "#47c2ff" },
  { name: "史詩", color: "#ffc23d" },
];

export const CARDS: CardDef[] = [
  { id: "dmg", name: "火力提升", desc: (n) => `所有傷害 +10%（第 ${n} 層）`, rarity: 0, max: 8, icon: "atk", weight: 10, apply: (g) => { g.p.s.atk *= 1.1; } },
  { id: "rate", name: "射速強化", desc: (n) => `射擊速度 +8%（第 ${n} 層）`, rarity: 0, max: 6, icon: "rate", weight: 9, apply: (g) => { g.p.s.rate *= 1.08; } },
  { id: "multi", name: "多重射擊", desc: (n) => `主武器額外增加 1 條彈道（第 ${n} 層）`, rarity: 1, max: 3, icon: "multi", weight: 6, apply: (g) => { g.p.s.extra += 1; } },
  { id: "pierce", name: "穿透彈頭", desc: (n) => `子彈穿透 +1（第 ${n} 層）`, rarity: 1, max: 3, icon: "pierce", weight: 6, apply: (g) => { g.p.s.pierce += 1; } },
  { id: "speed", name: "推進強化", desc: (n) => `移動速度 +7%（第 ${n} 層）`, rarity: 0, max: 4, icon: "speed", weight: 7, apply: (g) => { g.p.s.spd *= 1.07; } },
  { id: "hp", name: "強化裝甲", desc: (n) => `最大生命 +18 並回復 18（第 ${n} 層）`, rarity: 0, max: 5, icon: "hp", weight: 8, apply: (g) => { g.p.maxHp += 18; g.p.hp += 18; } },
  { id: "repair", name: "應急修復", desc: () => "立刻回復 40% 最大生命", rarity: 0, max: 99, icon: "heal", weight: 6, apply: (g) => { g.heal(g.p.maxHp * 0.4); } },
  { id: "magnet", name: "磁力吸附", desc: (n) => `拾取範圍 +40%（第 ${n} 層）`, rarity: 0, max: 3, icon: "magnet", weight: 6, apply: (g) => { g.p.s.magnet *= 1.4; } },
  { id: "coin", name: "星晶收割", desc: (n) => `星晶獲取 +18%（第 ${n} 層）`, rarity: 0, max: 4, icon: "coin", weight: 5, apply: (g) => { g.p.s.coinMul += 0.18; } },
  { id: "cd", name: "戰術冷卻", desc: (n) => `主動技冷卻 -9%（第 ${n} 層）`, rarity: 0, max: 4, icon: "cd", weight: 7, apply: (g) => { g.p.s.cdMul *= 0.91; } },
  { id: "ult", name: "奧義共鳴", desc: (n) => `奧義充能速度 +16%（第 ${n} 層）`, rarity: 0, max: 4, icon: "ult", weight: 7, apply: (g) => { g.p.s.ultMul += 0.16; } },
  { id: "crit", name: "暴擊晶片", desc: (n) => `暴擊率 +7%、暴擊傷害 +15%（第 ${n} 層）`, rarity: 1, max: 4, icon: "crit", weight: 6, apply: (g) => { g.p.s.crit += 0.07; g.p.s.critDmg += 0.15; } },
  { id: "graze", name: "擦彈大師", desc: (n) => `擦彈回充與分數 +40%（第 ${n} 層）`, rarity: 0, max: 3, icon: "graze", weight: 5, apply: (g) => { g.p.s.grazeMul *= 1.4; } },
  { id: "combo", name: "連擊延展", desc: (n) => `連擊持續時間 +0.6 秒（第 ${n} 層）`, rarity: 0, max: 3, icon: "combo", weight: 4, apply: (g) => { g.p.s.comboWin += 0.6; } },
  { id: "shield", name: "護盾發生器", desc: (n) => `獲得護盾，並每 ${[24, 18, 13][Math.min(2, n - 1)]} 秒再生（第 ${n} 層）`, rarity: 1, max: 3, icon: "shield", weight: 5, apply: (g, n) => { g.p.maxShield += 1; g.p.shield += 1; g.p.s.shieldRegen = [24, 18, 13][Math.min(2, n - 1)]; } },
  { id: "explode", name: "榴彈彈頭", desc: (n) => `子彈命中時爆炸，附帶 ${28 + n * 8}% 範圍傷害`, rarity: 2, max: 3, icon: "explode", weight: 4, apply: (g) => { g.p.s.explode += 0.36; } },
  { id: "homing", name: "追蹤彈頭", desc: (n) => `子彈會微幅追蹤敵人（第 ${n} 層）`, rarity: 1, max: 3, icon: "homing", weight: 5, apply: (g) => { g.p.s.homing += 1; } },
  { id: "option", name: "僚機砲塔", desc: (n) => `增加 1 座隨行砲塔（第 ${n} 座）`, rarity: 2, max: 3, icon: "option", weight: 4, apply: (g) => { g.p.s.options += 1; } },
  { id: "leech", name: "擊殺修復", desc: (n) => `每擊墜 1 架敵機回復 ${(0.3 * n).toFixed(1)} 生命`, rarity: 1, max: 3, icon: "leech", weight: 4, apply: (g) => { g.p.s.killHeal += 0.3; } },
  { id: "luck", name: "幸運星", desc: (n) => `稀有掉落率提升，並有機率多出 1 張卡（第 ${n} 層）`, rarity: 1, max: 3, icon: "luck", weight: 4, apply: (g) => { g.p.s.luck += 1; } },
  { id: "burn", name: "灼熱彈頭", desc: (n) => `子彈使敵人燃燒，持續受到傷害（第 ${n} 層）`, rarity: 1, max: 3, icon: "burn", weight: 4, apply: (g) => { g.p.s.burn += 1; } },
  { id: "frost", name: "凍結彈頭", desc: (n) => `子彈使敵人減速（第 ${n} 層）`, rarity: 1, max: 3, icon: "frost", weight: 4, apply: (g) => { g.p.s.slowHit += 1; } },
  { id: "arc", name: "電弧彈頭", desc: (n) => `命中時電弧跳躍至附近敵人（第 ${n} 層）`, rarity: 1, max: 3, icon: "arc", weight: 4, apply: (g) => { g.p.s.chainHit += 1; } },
  { id: "overload", name: "過載脈衝", desc: (n) => `每次升級釋放震盪波並清除周圍彈幕（第 ${n} 層）`, rarity: 2, max: 2, icon: "overload", weight: 3, apply: (g) => { g.p.s.overload += 1; } },
  { id: "exp", name: "經驗加速", desc: (n) => `經驗獲取 +20%（第 ${n} 層）`, rarity: 0, max: 3, icon: "exp", weight: 5, apply: (g) => { g.p.s.expMul += 0.2; } },
  { id: "power", name: "火力核心", desc: () => "火力階立刻 +2", rarity: 1, max: 4, icon: "power", weight: 4, apply: (g) => { g.addPower(2); } },
  { id: "vigor", name: "背水一戰", desc: () => "生命低於 40% 時，傷害 +35%", rarity: 1, max: 1, icon: "vigor", weight: 3, apply: (g) => { g.p.s.vigor = 0.35; } },
  { id: "revive", name: "不滅意志", desc: () => "遭到致命傷害時，以 50% 生命復活一次", rarity: 2, max: 1, icon: "revive", weight: 2.5, apply: (g) => { g.p.s.revive += 1; } },
];

export const SKILL_CARD_ICON: Record<SkillKey, string> = { weapon: "sk_weapon", passive: "sk_passive", active: "sk_active", ult: "sk_ult" };
