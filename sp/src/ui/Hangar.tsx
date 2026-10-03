// 機庫：機體選擇、技能進化、六格裝備（R/SR/SSR/UR）、機體改造
import { useState } from "react";
import { audio } from "../game/audio";
import { EVO_LEVELS, SHIPS, SKILL_KEYS, SKILL_LABEL, SKILL_MAX_PERM, TIER_NAME, modUpCost, shipTier, skillUpCost } from "../game/data/ships";
import { MAX_ENHANCE, MAX_INV, PROCS, RARITY_INFO, SLOT_INFO, STAT_INFO, enhanceCost, gearStats, gearTiers, sellPrice, statValue } from "../game/data/equipment";
import { canUpgradeSkill, enhanceItem, equipItem, equippedBy, itemById, mutate, sellItems, toggleLock, unequipSlot, upgradeMod, upgradeSkill, useSave } from "../game/save";
import { SHIP_IDS, SLOT_IDS } from "../game/types";
import type { EquipItem, SlotId } from "../game/types";
import { Btn, Currency, FullscreenBtn, Portrait, Radar, RarityTag, ShipCanvas } from "./ui";
import { Icon } from "./icons";

function ItemCard({ item, onClick, active, equipped }: { item: EquipItem; onClick: () => void; active?: boolean; equipped?: boolean }) {
  return (
    <button onClick={onClick} className={`rar-${item.rarity} rar-frame aspect-square relative grid place-items-center transition-transform hover:scale-105 ${active ? "ring-2 ring-white" : ""}`}>
      <Icon name={item.slot} size={26} style={{ color: "var(--rc)" }} />
      <span className="absolute top-0.5 left-0.5">
        <RarityTag r={item.rarity} />
      </span>
      {item.lv > 0 && <span className="absolute bottom-0 right-1 disp text-sm text-white">+{item.lv}</span>}
      {equipped && <span className="absolute bottom-0 left-1 text-[10px] font-black text-[var(--gold)]">E</span>}
      {item.locked && <Icon name="lockicon" size={11} className="absolute top-0.5 right-0.5 text-white/80" />}
    </button>
  );
}

function ItemDetail({ item, shipId, onClose }: { item: EquipItem; shipId: (typeof SHIP_IDS)[number]; onClose: () => void }) {
  const save = useSave();
  const cur = itemById(item.id);
  if (!cur) return null;
  const it = cur;
  const by = equippedBy(it.id);
  const slotIdx = SLOT_IDS.indexOf(it.slot);
  const cost = enhanceCost(it);
  const can = save.coins >= cost.coins && save.cores >= cost.cores && it.lv < MAX_ENHANCE;
  const proc = it.proc ? PROCS[it.proc] : null;
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/75 p-3 anim-up" onClick={onClose}>
      <div className={`panel jag rar-${it.rarity} w-full max-w-sm p-4 border-l-4`} style={{ borderColor: "var(--rc)" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className={`rar-${it.rarity} rar-frame w-16 h-16 grid place-items-center shrink-0`}>
            <Icon name={it.slot} size={38} style={{ color: "var(--rc)" }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <RarityTag r={it.rarity} />
              <span className="text-[11px] text-white/60">{RARITY_INFO[it.rarity].name}・{SLOT_INFO[it.slot].name}</span>
            </div>
            <div className="font-black text-lg leading-tight">{it.name} {it.lv > 0 && <span className="disp text-[var(--gold)]">+{it.lv}</span>}</div>
            {by && <div className="text-[11px] text-[var(--gold)]">裝備中：{SHIPS[by].name}</div>}
          </div>
        </div>
        <div className="mt-3 text-sm space-y-1">
          <div className="flex justify-between bg-white/10 px-2 py-1">
            <span>主屬性・{STAT_INFO[it.main.stat].label}</span>
            <b className="text-[var(--gold)]">+{statValue(it, it.main.v).toFixed(1)}%</b>
          </div>
          {it.subs.map((s, i) => (
            <div key={i} className="flex justify-between px-2 text-white/85">
              <span>{STAT_INFO[s.stat].label}</span>
              <b>+{statValue(it, s.v).toFixed(1)}%</b>
            </div>
          ))}
          {proc && (
            <div className="mt-2 p-2 border border-dashed" style={{ borderColor: proc.color, background: proc.color + "18" }}>
              <div className="font-black" style={{ color: proc.color }}>★ 固有技・{proc.name}</div>
              <div className="text-[12px] text-white/80">{proc.desc}</div>
            </div>
          )}
          {it.rarity === "UR" && <div className="text-[11px] text-[var(--r-UR)]">UR 裝備會為機體加裝專屬外觀部件</div>}
          {it.rarity === "SSR" && <div className="text-[11px] text-[var(--r-SSR)]">SSR 裝備會為機體加裝可見的外觀部件</div>}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {by === shipId ? (
            <Btn onClick={() => unequipSlot(shipId, slotIdx)}>卸下</Btn>
          ) : (
            <Btn variant="solid" onClick={() => { equipItem(shipId, it); onClose(); }}>裝備到 {SHIPS[shipId].name}</Btn>
          )}
          <Btn disabled={!can} onClick={() => { if (enhanceItem(it.id)) audio.sfx("gear"); }}>
            {it.lv >= MAX_ENHANCE ? "已滿級" : `強化 ${cost.coins}${cost.cores ? `＋${cost.cores}核` : ""}`}
          </Btn>
          <Btn onClick={() => toggleLock(it.id)}>{it.locked ? "解除鎖定" : "鎖定"}</Btn>
          <Btn disabled={!!by || !!it.locked} onClick={() => { sellItems([it.id]); onClose(); }}>
            分解 +{sellPrice(it)}
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function Hangar({ onBack, onSortie }: { onBack: () => void; onSortie: () => void }) {
  const save = useSave();
  const id = save.sel;
  const ship = SHIPS[id];
  const ss = save.ships[id];
  const tier = shipTier(ss.lv);
  const [tab, setTab] = useState<"skills" | "gear" | "mods">("skills");
  const [slot, setSlot] = useState<SlotId>("weapon");
  const [detail, setDetail] = useState<EquipItem | null>(null);
  const [prev, setPrev] = useState(false);
  const gearItems = ss.equip.map((e) => itemById(e));
  const gt = gearTiers(gearItems);
  const gs = gearStats(gearItems.filter(Boolean) as EquipItem[]);
  const inv = save.inv.filter((i) => i.slot === slot).sort((a, b) => RARITY_INFO[b.rarity].index - RARITY_INFO[a.rarity].index || b.lv - a.lv);
  const sumLv = ss.lv.weapon + ss.lv.passive + ss.lv.active + ss.lv.ult;
  const nextTier = [7, 13, 19][tier];
  const canPrev = id === "crow" || id === "prism";

  return (
    <div className="screen bg-[var(--ink)]">
      <div className="absolute inset-0 halftone opacity-30" />
      <div className="absolute -left-20 top-0 bottom-0 w-[50%] -skew-x-12 opacity-25" style={{ background: ship.color }} />
      <div className="relative h-full flex flex-col p-2 sm:p-4 gap-2">
        {/* 標題列 */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 grid place-items-center bg-black border-2 border-white -skew-x-6 hover:bg-[var(--red)]">
            <Icon name="back" />
          </button>
          <div className="title-jag !text-[38px] sm:!text-[52px]" style={{ transform: "rotate(-2deg)" }}>HANGAR</div>
          <div className="hidden sm:block text-sm tracking-[0.4em] text-white/60 font-black">機庫・養成</div>
          <div className="ml-auto flex items-center gap-2">
            <Currency coins={save.coins} cores={save.cores} />
            <FullscreenBtn />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2 sm:gap-3">
          {/* 機體列表 */}
          <div className="flex lg:flex-col gap-1.5 lg:w-44 shrink-0 overflow-x-auto lg:overflow-visible noscroll">
            {SHIP_IDS.map((sid, i) => {
              const d = SHIPS[sid];
              const on = sid === id;
              return (
                <button
                  key={sid}
                  onClick={() => { audio.sfx("ui"); mutate((x) => { x.sel = sid; }); setPrev(false); }}
                  className={`relative shrink-0 w-[92px] lg:w-full h-14 lg:h-[62px] overflow-hidden border-2 -skew-x-6 transition-all ${on ? "border-white scale-[1.03]" : "border-white/25 opacity-80 hover:opacity-100"}`}
                  style={{ animation: `slideInL .35s ${i * 0.05}s both`, background: `linear-gradient(120deg, ${d.dark}, ${d.color}55)` }}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-[38%] skew-x-6">
                    <Portrait id={sid} focusY={0.22} className="w-full h-full" />
                  </div>
                  <div className="relative skew-x-6 h-full flex flex-col justify-center pl-2 text-left leading-none">
                    <span className="disp text-lg lg:text-xl" style={{ color: d.color2 }}>{d.en.split(" ")[1] || d.en}</span>
                    <span className="text-[11px] font-black">{d.name}</span>
                    <span className="text-[9px] text-white/60 hidden lg:block">{d.role}</span>
                  </div>
                  {on && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--red)]" />}
                </button>
              );
            })}
          </div>

          {/* 展示區 */}
          <div className="relative h-[30%] lg:h-auto lg:flex-1 min-h-[180px] overflow-hidden border border-white/15 bg-black/40">
            <div className="absolute right-0 top-0 bottom-0 w-[52%] lg:w-[46%] opacity-90">
              <Portrait id={id} focusY={0.15} className="w-full h-full" style={{ maskImage: "linear-gradient(to left, #000 70%, transparent)", WebkitMaskImage: "linear-gradient(to left, #000 70%, transparent)" }} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-[62%] lg:w-[58%]">
              <ShipCanvas id={id} tier={tier} gear={gt} form={prev ? 1 : 0} morph={prev ? 1 : 0} scale={1.45} />
            </div>
            <div className="absolute left-3 top-2">
              <div className="text-[10px] sm:text-xs tracking-[0.35em] text-white/70">{ship.role}・{TIER_NAME[tier]}</div>
              <div className="disp text-4xl sm:text-6xl leading-none" style={{ color: ship.color2, textShadow: `3px 3px 0 ${ship.color}` }}>{ship.en}</div>
              <div className="font-black text-sm sm:text-lg">{ship.name}<span className="text-white/60 font-normal text-xs sm:text-sm ml-2">星紋「{ship.sigil}」</span></div>
            </div>
            <div className="absolute left-3 bottom-2 right-3 lg:right-[48%]">
              <div className="text-[11px] sm:text-xs italic text-white/85 bg-black/50 px-2 py-1 border-l-2 hidden sm:block" style={{ borderColor: ship.color }}>{ship.quote}</div>
              <div className="text-[10px] text-white/60 mt-1 hidden lg:block leading-snug">{ship.pilot}（{ship.pilotEn}）— {ship.lore}</div>
            </div>
            <div className="absolute right-2 bottom-1 hidden sm:block">
              <Radar v={[ship.radar.atk, ship.radar.spd, ship.radar.def, ship.radar.rng, ship.radar.ease]} color={ship.color} size={104} />
            </div>
            {canPrev && (
              <button onClick={() => setPrev(!prev)} className="absolute right-2 top-2 text-[11px] font-black px-2 py-1 bg-black/70 border border-white/50 -skew-x-6 hover:bg-[var(--red)]">
                {prev ? "一般形態" : id === "crow" ? "預覽・不死鳥" : "預覽・機神"}
              </button>
            )}
          </div>

          {/* 右側面板 */}
          <div className="flex-1 lg:flex-none lg:w-[440px] min-h-0 flex flex-col panel border-t-4 border-[var(--red)]">
            <div className="flex">
              {([["skills", "技能進化", "star"], ["gear", "裝備", "armor"], ["mods", "改造", "gear"]] as const).map(([k, n, ic]) => (
                <button key={k} onClick={() => { audio.sfx("ui"); setTab(k); }} className={`flex-1 py-2 font-black tracking-wider flex items-center justify-center gap-1.5 border-b-2 transition-colors ${tab === k ? "bg-[var(--red)] border-white" : "bg-black/40 border-transparent hover:bg-white/10"}`}>
                  <Icon name={ic} size={16} /> {n}
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto noscroll p-2.5 space-y-2">
              {tab === "skills" &&
                SKILL_KEYS.map((k) => {
                  const sk = ship.skills[k];
                  const lv = ss.lv[k];
                  const c = canUpgradeSkill(id, k);
                  const cost = skillUpCost(lv);
                  return (
                    <div key={k} className="bg-black/50 border border-white/15 p-2.5">
                      <div className="flex gap-2.5">
                        <div className="w-11 h-11 grid place-items-center border shrink-0" style={{ borderColor: ship.color, background: ship.color + "22", color: ship.color2 }}>
                          <Icon name={sk.icon} size={26} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-[10px] bg-white text-black px-1 font-black -skew-x-12">{SKILL_LABEL[k]}</span>
                            <b className="text-[15px]">{sk.name}</b>
                            <span className="disp text-xs text-white/50">{sk.en}</span>
                          </div>
                          <div className="text-[12px] text-white/75 leading-snug">{sk.desc}</div>
                          {k === "active" && <div className="text-[11px] text-[var(--cyan)]">冷卻 {ship.activeCd} 秒</div>}
                          {k === "ult" && <div className="text-[11px] text-[#c58bff]">自然充能約 {ship.ultTime} 秒（擊殺／擦彈可加速）</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} className={`h-2 flex-1 -skew-x-12 ${n <= lv ? "bg-[var(--red)]" : "bg-white/15"} ${EVO_LEVELS.includes(n) ? "outline outline-1 outline-[var(--gold)]" : ""}`} />
                        ))}
                        <span className="disp text-lg ml-1 w-12 text-right">Lv{lv}</span>
                      </div>
                      <div className="mt-1.5 space-y-0.5">
                        {sk.evo.map((t, i) => {
                          const need = EVO_LEVELS[i];
                          const on = lv >= need;
                          return (
                            <div key={i} className={`text-[11px] leading-snug flex gap-1.5 ${on ? "text-[var(--gold)]" : "text-white/40"}`}>
                              <span className="disp shrink-0">Lv{need}</span>
                              <span>{need === 7 ? "極限進化（戰鬥中升級卡可達）：" : "進化："}{t}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end mt-2">
                        <Btn variant={c.ok ? "solid" : ""} disabled={!c.ok} className="!py-1.5 !px-4 text-sm" onClick={() => { if (upgradeSkill(id, k)) audio.sfx("evolve"); }}>
                          {c.maxed ? "永久等級已滿" : <><Icon name="coin" size={14} />{cost.coins.toLocaleString()}{cost.cores > 0 && <><Icon name="core" size={14} />{cost.cores}</>} 升級</>}
                        </Btn>
                      </div>
                    </div>
                  );
                })}

              {tab === "gear" && (
                <>
                  <div className="grid grid-cols-6 gap-1.5">
                    {SLOT_IDS.map((s, i) => {
                      const it = gearItems[i];
                      return (
                        <button key={s} onClick={() => { audio.sfx("ui"); setSlot(s); if (it) setDetail(it); }} className={`relative aspect-square border-2 grid place-items-center transition-colors ${it ? `rar-${it.rarity} rar-frame` : "border-white/25 bg-black/50"} ${slot === s ? "ring-2 ring-[var(--red)]" : ""}`}>
                          <Icon name={s} size={26} style={{ color: it ? "var(--rc)" : "rgba(255,255,255,0.35)" }} />
                          {it && <span className="absolute top-0 left-0"><RarityTag r={it.rarity} /></span>}
                          <span className="absolute bottom-0 inset-x-0 text-[9px] font-black bg-black/70 text-center">{SLOT_INFO[s].name}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="text-[11px] text-white/60 flex flex-wrap gap-x-3">
                    {Object.entries(gs).filter(([, v]) => v > 0).map(([k, v]) => (
                      <span key={k}>{STAT_INFO[k as keyof typeof STAT_INFO].label} <b className="text-[var(--gold)]">+{(v * 100).toFixed(0)}%</b></span>
                    ))}
                    {gearItems.every((x) => !x) && <span>尚未裝備任何物品。於戰鬥中擊敗菁英／Boss 可獲得裝備。</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="font-black text-sm">{SLOT_INFO[slot].name}倉庫 <span className="text-white/50 font-normal text-xs">({inv.length}/{save.inv.length}・上限 {MAX_INV})</span></div>
                    <button
                      className="text-[11px] font-black px-2 py-1 bg-black/60 border border-white/30 -skew-x-6 hover:bg-[var(--red)] flex items-center gap-1"
                      onClick={() => { const ids = save.inv.filter((i) => (i.rarity === "R") && !i.locked && !equippedBy(i.id)).map((i) => i.id); const g = sellItems(ids); if (g) audio.sfx("coin"); }}
                    >
                      <Icon name="sell" size={12} /> 一鍵分解 R
                    </button>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {inv.map((it) => (
                      <ItemCard key={it.id} item={it} equipped={!!equippedBy(it.id)} onClick={() => { audio.sfx("ui"); setDetail(it); }} />
                    ))}
                  </div>
                  {inv.length === 0 && <div className="text-center text-white/40 text-sm py-6">這個欄位還沒有裝備</div>}
                </>
              )}

              {tab === "mods" && (
                <>
                  <div className="bg-black/50 border border-white/15 p-3 text-sm">
                    <div className="flex justify-between font-black">
                      <span>機體外觀階級</span>
                      <span style={{ color: ship.color2 }}>{TIER_NAME[tier]}</span>
                    </div>
                    <div className="text-[11px] text-white/60 mt-1">技能永久等級總和 {sumLv}／20{nextTier ? `，達 ${nextTier} 進化至下一外觀階級` : "，已達最終覺醒型態"}。UR/SSR 裝備會追加外觀部件。</div>
                    <div className="h-2 bg-white/15 mt-2 -skew-x-12 overflow-hidden"><div className="h-full" style={{ width: `${(sumLv / 20) * 100}%`, background: ship.color }} /></div>
                  </div>
                  {(["hp", "atk", "spd"] as const).map((k) => {
                    const n = ss.mods[k];
                    const cost = modUpCost(n);
                    const label = { hp: "裝甲強化（生命 +8%/級）", atk: "火力調校（攻擊 +6%/級）", spd: "推進改良（機動 +3%/級）" }[k];
                    const ic = { hp: "hp", atk: "atk", spd: "speed" }[k];
                    return (
                      <div key={k} className="bg-black/50 border border-white/15 p-2.5 flex items-center gap-3">
                        <div className="w-10 h-10 grid place-items-center border border-white/30"><Icon name={ic} size={22} /></div>
                        <div className="flex-1">
                          <div className="font-black text-sm">{label}</div>
                          <div className="flex gap-0.5 mt-1">
                            {Array.from({ length: 10 }, (_, i) => <span key={i} className={`h-2 flex-1 -skew-x-12 ${i < n ? "bg-[var(--red)]" : "bg-white/15"}`} />)}
                          </div>
                        </div>
                        <Btn disabled={n >= 10 || save.coins < cost} className="!py-1.5 !px-3 text-sm" onClick={() => { if (upgradeMod(id, k)) audio.sfx("power"); }}>
                          {n >= 10 ? "MAX" : <><Icon name="coin" size={14} />{cost.toLocaleString()}</>}
                        </Btn>
                      </div>
                    );
                  })}
                  <div className="bg-black/50 border border-white/15 p-3 text-[12px] leading-relaxed text-white/80">
                    基礎生命 {ship.base.hp}｜基礎機動 {ship.base.spd}｜攻擊倍率 ×{ship.base.atk}｜射速倍率 ×{ship.base.rate}
                    <br />
                    歷史最高分：<b className="text-[var(--gold)]">{ss.best.toLocaleString()}</b>
                  </div>
                </>
              )}
            </div>
            <div className="p-2 border-t border-white/10">
              <Btn variant="solid" className="w-full !text-lg" onClick={onSortie}>
                <Icon name="sortie" size={20} /> 以 {ship.name} 出擊
              </Btn>
            </div>
          </div>
        </div>
      </div>
      {detail && <ItemDetail item={detail} shipId={id} onClose={() => setDetail(null)} />}
    </div>
  );
}
