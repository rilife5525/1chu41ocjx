// 玩家資料與數值建構：整合機體基礎、改造、裝備、卡片
import type { EquipItem, SaveData, ShipId } from "../types";
import { SHIPS, shipTier } from "../data/ships";
import { gearStats, gearTiers } from "../data/equipment";
import { W, H } from "../constants";

export interface PStats {
  atk: number;
  rate: number;
  spd: number;
  crit: number;
  critDmg: number;
  pierce: number;
  extra: number;
  homing: number;
  explode: number;
  burn: number;
  slowHit: number;
  chainHit: number;
  magnet: number;
  expMul: number;
  coinMul: number;
  dropMul: number;
  cdMul: number;
  ultMul: number;
  grazeMul: number;
  comboWin: number;
  shieldRegen: number;
  killHeal: number;
  options: number;
  luck: number;
  overload: number;
  vigor: number;
  revive: number;
}

export interface Player {
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  inv: number;
  fireT: number;
  power: number;
  s: PStats;
  activeCd: number;
  activeMax: number;
  ult: number;
  form: number;
  formT: number;
  morph: number;
  bank: number;
  thrust: number;
  dmgMul: number;
  speedMul: number;
  drMul: number;
  k: Record<string, any>;
  optT: number;
  shieldT: number;
  castT: number;
  tier: number;
  gear: number[];
  hitFlash: number;
  ultBusy: number;
  procs: { id: string; t: number }[];
  auraColor: string;
  lastMoveT: number;
  vx: number;
  vy: number;
}

export function defaultStats(): PStats {
  return {
    atk: 1, rate: 1, spd: 1, crit: 0.05, critDmg: 1.6, pierce: 0, extra: 0, homing: 0, explode: 0, burn: 0, slowHit: 0, chainHit: 0, magnet: 1,
    expMul: 1, coinMul: 1, dropMul: 1, cdMul: 1, ultMul: 1, grazeMul: 1, comboWin: 0, shieldRegen: 0, killHeal: 0, options: 0, luck: 0, overload: 0, vigor: 0, revive: 0,
  };
}

export function buildPlayer(ship: ShipId, save: SaveData): Player {
  const def = SHIPS[ship];
  const ss = save.ships[ship];
  const items = ss.equip.map((id) => (id ? save.inv.find((i) => i.id === id) || null : null)) as (EquipItem | null)[];
  const gs = gearStats(items.filter(Boolean) as EquipItem[]);
  const s = defaultStats();
  s.atk = def.base.atk * (1 + 0.06 * ss.mods.atk) * (1 + gs.atk);
  s.rate = def.base.rate * (1 + gs.rate);
  s.spd = (1 + 0.03 * ss.mods.spd) * (1 + gs.spd);
  s.crit += gs.crit;
  s.cdMul = Math.max(0.5, 1 - gs.cd);
  s.ultMul = 1 + gs.ult;
  s.expMul = 1 + gs.exp;
  s.coinMul = 1 + gs.coin;
  s.dropMul = 1 + gs.drop;
  const maxHp = Math.round(def.base.hp * (1 + 0.08 * ss.mods.hp) * (1 + gs.hp));
  const procs = (items.filter((i) => i && i.proc) as EquipItem[]).map((i) => ({ id: i.proc!, t: Math.random() * 3 }));
  const gear = gearTiers(items);
  const urCount = gear.filter((g) => g >= 4).length;
  return {
    x: W / 2, y: H * 0.82, hp: maxHp, maxHp, shield: 0, maxShield: 0, inv: 2, fireT: 0, power: 0, s,
    activeCd: 4, activeMax: def.activeCd, ult: 20, form: 0, formT: 0, morph: 0, bank: 0, thrust: 1, dmgMul: 1, speedMul: 1, drMul: 1, k: {},
    optT: 0, shieldT: 0, castT: 0, tier: shipTier(ss.lv), gear, hitFlash: 0, ultBusy: 0, procs, auraColor: urCount >= 2 ? def.color : "", lastMoveT: 0, vx: 0, vy: 0,
  };
}
