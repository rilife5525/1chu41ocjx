// 存檔與養成邏輯：localStorage 持久化 + React 訂閱
import { useSyncExternalStore } from "react";
import { SAVE_KEY } from "./constants";
import type { EquipItem, SaveData, ShipId, ShipSave, SkillKey } from "./types";
import { SHIP_IDS } from "./types";
import { MAX_ENHANCE, MAX_INV, enhanceCost, sellPrice, RARITY_INFO } from "./data/equipment";
import { SKILL_MAX_PERM, modUpCost, skillUpCost } from "./data/ships";

function defaultShip(): ShipSave {
  return { lv: { weapon: 1, passive: 1, active: 1, ult: 1 }, mods: { hp: 0, atk: 0, spd: 0 }, equip: [null, null, null, null, null, null], best: 0 };
}

export function defaultSave(): SaveData {
  const ships = {} as Record<ShipId, ShipSave>;
  for (const id of SHIP_IDS) ships[id] = defaultShip();
  return {
    v: 1,
    coins: 1200,
    cores: 3,
    sel: "crow",
    ships,
    inv: [],
    stages: {},
    endless: { hi: 0, time: 0, wave: 0 },
    settings: { autoCard: false, quality: "auto", bgm: 0.55, sfx: 0.8, shake: true, showDmg: true, sens: 1.15, hitbox: true },
    stats: { kills: 0, runs: 0, playSec: 0, maxCombo: 0 },
    tutorialSeen: false,
  };
}

function load(): SaveData {
  const def = defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return def;
    const d = JSON.parse(raw);
    const out: SaveData = { ...def, ...d };
    out.settings = { ...def.settings, ...(d.settings || {}) };
    out.stats = { ...def.stats, ...(d.stats || {}) };
    out.endless = { ...def.endless, ...(d.endless || {}) };
    out.ships = { ...def.ships };
    for (const id of SHIP_IDS) {
      const s = d.ships?.[id];
      if (s) out.ships[id] = { ...defaultShip(), ...s, lv: { ...defaultShip().lv, ...s.lv }, mods: { ...defaultShip().mods, ...s.mods }, equip: [...defaultShip().equip].map((_, i) => s.equip?.[i] ?? null) };
    }
    return out;
  } catch {
    return def;
  }
}

let data: SaveData = load();
let version = 0;
const subs = new Set<() => void>();

export function getData(): SaveData {
  return data;
}

export function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    /* 儲存空間不足時忽略 */
  }
}

/** 修改存檔並通知所有訂閱者 */
export function mutate(fn: (d: SaveData) => void) {
  fn(data);
  persist();
  version++;
  subs.forEach((s) => s());
}

export function resetSave() {
  data = defaultSave();
  persist();
  version++;
  subs.forEach((s) => s());
}

export function useSave(): SaveData {
  useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => version
  );
  return data;
}

// ---------------- 養成操作 ----------------
export function itemById(id: string | null): EquipItem | null {
  if (!id) return null;
  return data.inv.find((i) => i.id === id) || null;
}

export function shipGear(id: ShipId): (EquipItem | null)[] {
  return data.ships[id].equip.map((e) => itemById(e));
}

export function equippedBy(itemId: string): ShipId | null {
  for (const id of SHIP_IDS) if (data.ships[id].equip.includes(itemId)) return id;
  return null;
}

export function equipItem(ship: ShipId, item: EquipItem) {
  mutate((d) => {
    const slotIdx = ["weapon", "armor", "engine", "core", "chip", "emblem"].indexOf(item.slot);
    for (const sid of SHIP_IDS) {
      const arr = d.ships[sid].equip;
      const k = arr.indexOf(item.id);
      if (k >= 0) arr[k] = null;
    }
    d.ships[ship].equip[slotIdx] = item.id;
  });
}

export function unequipSlot(ship: ShipId, slotIdx: number) {
  mutate((d) => {
    d.ships[ship].equip[slotIdx] = null;
  });
}

export function canUpgradeSkill(ship: ShipId, key: SkillKey): { ok: boolean; coins: number; cores: number; maxed: boolean } {
  const lv = data.ships[ship].lv[key];
  if (lv >= SKILL_MAX_PERM) return { ok: false, coins: 0, cores: 0, maxed: true };
  const c = skillUpCost(lv);
  return { ok: data.coins >= c.coins && data.cores >= c.cores, ...c, maxed: false };
}

export function upgradeSkill(ship: ShipId, key: SkillKey): boolean {
  const c = canUpgradeSkill(ship, key);
  if (!c.ok) return false;
  mutate((d) => {
    d.coins -= c.coins;
    d.cores -= c.cores;
    d.ships[ship].lv[key] += 1;
  });
  return true;
}

export function upgradeMod(ship: ShipId, key: "hp" | "atk" | "spd"): boolean {
  const n = data.ships[ship].mods[key];
  if (n >= 10) return false;
  const c = modUpCost(n);
  if (data.coins < c) return false;
  mutate((d) => {
    d.coins -= c;
    d.ships[ship].mods[key] += 1;
  });
  return true;
}

export function enhanceItem(itemId: string): boolean {
  const it = itemById(itemId);
  if (!it || it.lv >= MAX_ENHANCE) return false;
  const c = enhanceCost(it);
  if (data.coins < c.coins || data.cores < c.cores) return false;
  mutate((d) => {
    d.coins -= c.coins;
    d.cores -= c.cores;
    const t = d.inv.find((i) => i.id === itemId);
    if (t) t.lv += 1;
  });
  return true;
}

export function sellItems(ids: string[]): number {
  let total = 0;
  mutate((d) => {
    for (const id of ids) {
      const it = d.inv.find((i) => i.id === id);
      if (!it || it.locked || equippedBy(id)) continue;
      total += sellPrice(it);
    }
    const remove = new Set(ids.filter((id) => {
      const it = d.inv.find((i) => i.id === id);
      return it && !it.locked && !equippedBy(id);
    }));
    d.inv = d.inv.filter((i) => !remove.has(i.id));
    d.coins += total;
  });
  return total;
}

export function toggleLock(itemId: string) {
  mutate((d) => {
    const it = d.inv.find((i) => i.id === itemId);
    if (it) it.locked = !it.locked;
  });
}

/** 將戰利品加入倉庫；倉庫已滿時自動分解最低階未鎖定裝備 */
export function addItems(items: EquipItem[]): number {
  let refund = 0;
  mutate((d) => {
    for (const it of items) {
      if (d.inv.length >= MAX_INV) {
        const equipped = new Set(SHIP_IDS.flatMap((s) => d.ships[s].equip));
        const cand = d.inv.filter((i) => !i.locked && !equipped.has(i.id)).sort((a, b) => RARITY_INFO[a.rarity].index - RARITY_INFO[b.rarity].index || a.lv - b.lv);
        if (cand.length && RARITY_INFO[cand[0].rarity].index <= RARITY_INFO[it.rarity].index) {
          refund += sellPrice(cand[0]);
          d.inv = d.inv.filter((i) => i.id !== cand[0].id);
        } else {
          refund += sellPrice(it);
          continue;
        }
      }
      d.inv.push(it);
    }
    d.coins += refund;
  });
  return refund;
}
