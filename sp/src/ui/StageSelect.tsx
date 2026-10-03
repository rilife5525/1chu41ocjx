// 關卡選擇：Boss 設定圖卡片、難度、解鎖、最高紀錄、無限模式
import { useState } from "react";
import { bossArtStyle } from "../assets";
import { DIFFS } from "../game/constants";
import { BOSSES, ENEMIES } from "../game/data/enemies";
import { STAGES } from "../game/data/stages";
import { SHIPS, shipTier } from "../game/data/ships";
import { useSave } from "../game/save";
import { Btn, Currency, FullscreenBtn, ShipCanvas } from "./ui";
import { Icon } from "./icons";

export function StageSelect({ onBack, onHangar, onStart, initial = 1 }: { onBack: () => void; onHangar: () => void; onStart: (stageId: number, diff: number) => void; initial?: number }) {
  const save = useSave();
  const [sel, setSel] = useState(initial);
  const [diff, setDiff] = useState(0);
  const ship = SHIPS[save.sel];
  const tier = shipTier(save.ships[save.sel].lv);
  const cleared = (n: number, d = 0) => !!save.stages[String(n)]?.clear?.[d];
  const stageOpen = (n: number) => n === 1 || cleared(n - 1);
  const diffOpen = (n: number, d: number) => (n === 0 ? d === 0 || (d === 1 && cleared(3)) || (d === 2 && cleared(6)) : d === 0 || cleared(n, d - 1));
  const st = sel > 0 ? STAGES[sel - 1] : null;
  const boss = st ? BOSSES[st.boss] : null;
  const hi = sel === 0 ? save.endless.hi : save.stages[String(sel)]?.hi?.[diff] || 0;
  const open = sel === 0 || stageOpen(sel);
  const dOk = diffOpen(sel, diff);
  const pick = (n: number) => {
    setSel(n);
    if (!diffOpen(n, diff)) setDiff(0);
  };

  return (
    <div className="screen bg-[var(--ink)]">
      <div className="absolute inset-0 halftone opacity-40" />
      <div className="absolute -right-32 top-0 bottom-0 w-[55%] bg-[var(--red)]/20 -skew-x-12" />
      <div className="relative h-full flex flex-col p-3 sm:p-5 gap-3">
        {/* 標題列 */}
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-10 h-10 grid place-items-center bg-black border-2 border-white -skew-x-6 hover:bg-[var(--red)]">
            <Icon name="back" />
          </button>
          <div>
            <div className="disp text-4xl sm:text-5xl leading-none title-jag !text-[40px] sm:!text-[52px]" style={{ transform: "rotate(-2deg)" }}>SORTIE</div>
          </div>
          <div className="text-sm tracking-[0.4em] text-white/60 font-black hidden sm:block">出擊・選擇任務</div>
          <div className="ml-auto flex items-center gap-2">
            <Currency coins={save.coins} cores={save.cores} className="hidden sm:flex" />
            <FullscreenBtn />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3">
          {/* 卡片區 */}
          <div className="shrink-0 lg:shrink lg:flex-1 min-h-0 grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 content-start auto-rows-fr">
            {STAGES.map((s, i) => {
              const ok = stageOpen(s.id);
              const on = sel === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => pick(s.id)}
                  className={`relative overflow-hidden text-left aspect-[5/4] lg:aspect-[4/3] border-2 transition-transform ${on ? "border-[var(--red)] scale-[1.03] z-10" : "border-white/30 hover:border-white"}`}
                  style={{ animation: `slideInU .4s ${i * 0.06}s both`, clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)" }}
                >
                  <div className="absolute inset-0 bg-cover" style={{ ...bossArtStyle(BOSSES[s.boss].art), filter: ok ? "none" : "grayscale(1) brightness(0.4)" }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                  {on && <div className="absolute inset-0 border-4 border-[var(--red)]/70 pointer-events-none" />}
                  <div className="absolute top-1 left-2 disp text-3xl sm:text-4xl leading-none text-white drop-shadow-[2px_2px_0_var(--red)]">{String(s.id).padStart(2, "0")}</div>
                  <div className="absolute top-1.5 right-2 flex gap-0.5">
                    {[0, 1, 2].map((d) => (
                      <span key={d} className="w-2 h-2 rotate-45 border border-white/70" style={{ background: cleared(s.id, d) ? DIFFS[d].color : "transparent" }} />
                    ))}
                  </div>
                  <div className="absolute bottom-1 left-2 right-2">
                    <div className="font-black text-sm sm:text-base leading-tight">{s.name}</div>
                    <div className="text-[9px] sm:text-[10px] tracking-widest text-white/70 truncate">{s.en}</div>
                  </div>
                  {!ok && (
                    <div className="absolute inset-0 grid place-items-center bg-black/50">
                      <Icon name="lockicon" size={30} />
                    </div>
                  )}
                </button>
              );
            })}
            {/* 無限模式 */}
            <button
              onClick={() => pick(0)}
              className={`relative overflow-hidden text-left h-[72px] lg:h-auto border-2 col-span-3 lg:col-span-2 ${sel === 0 ? "border-[var(--red)] scale-[1.01]" : "border-white/30 hover:border-white"}`}
              style={{ background: "linear-gradient(120deg,#1a0a20,#2b0b16 60%,#0a0a12)", minHeight: 64 }}
            >
              <div className="absolute inset-0 halftone-red opacity-40" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-30">
                <Icon name="infinity" size={90} />
              </div>
              <div className="relative h-full flex flex-col justify-center px-4 py-2">
                <div className="disp text-3xl sm:text-4xl leading-none text-white drop-shadow-[2px_2px_0_var(--red)]">ENDLESS</div>
                <div className="font-black text-sm">無限模式・難度逐步攀升</div>
                <div className="text-[11px] text-white/70">最高 {save.endless.hi.toLocaleString()} 分｜最長 {Math.floor(save.endless.time / 60)}:{String(save.endless.time % 60).padStart(2, "0")}｜波次 {save.endless.wave}</div>
              </div>
            </button>
          </div>

          {/* 詳情 */}
          <div className="lg:w-[380px] flex-1 lg:flex-none min-h-0 overflow-y-auto noscroll panel jag p-3 sm:p-4 flex flex-col gap-2 border-l-4 border-[var(--red)]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] tracking-[0.4em] text-white/60">{sel === 0 ? "ENDLESS" : `STAGE ${String(sel).padStart(2, "0")}`}</div>
                <div className="disp text-3xl sm:text-4xl leading-none" style={{ color: st ? st.accent : "#ffffff" }}>{st ? st.en : "ENDLESS MODE"}</div>
                <div className="font-black text-lg leading-tight">{st ? `${st.name}｜${st.sub}` : "無限模式"}</div>
              </div>
              <button onClick={onHangar} className="flex items-center gap-2 bg-black/70 border border-white/30 pl-1 pr-2 -skew-x-6 hover:border-[var(--red)] shrink-0">
                <div className="w-12 h-12">
                  <ShipCanvas id={save.sel} tier={tier} scale={1.5} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-[10px] text-white/60">出擊機體</div>
                  <div className="font-black text-sm">{ship.name}</div>
                  <div className="text-[10px] text-[var(--red2)]">更換 ▸</div>
                </div>
              </button>
            </div>
            <p className="text-[12px] sm:text-[13px] text-white/80 leading-relaxed">{st ? st.desc : "無盡的敵潮與 Boss 輪番來襲，環境不斷變換。每 3 個區塊更換場景，Boss 血量與彈幕持續進化。撐得越久，獎勵越豐厚。"}</p>
            {boss && (
              <div className="flex items-center gap-3 bg-black/50 p-2 border border-white/10">
                <div className="w-14 h-14 bg-cover shrink-0 border border-white/30" style={bossArtStyle(boss.art)} />
                <div className="min-w-0">
                  <div className="text-[10px] tracking-widest text-white/50">BOSS</div>
                  <div className="font-black leading-tight">{boss.name}</div>
                  <div className="text-[10px] text-white/60 truncate">{boss.title}</div>
                </div>
                <div className="ml-auto text-right text-[10px] text-white/60 leading-tight shrink-0">
                  建議戰力<br />
                  <b className="text-base text-white">{st!.rec.toLocaleString()}</b>
                </div>
              </div>
            )}
            {st && (
              <div className="flex flex-wrap gap-1">
                {st.pool.slice(0, 8).map((e) => (
                  <span key={e} className="text-[10px] px-1.5 py-0.5 bg-white/10 border border-white/15">{ENEMIES[e].name}</span>
                ))}
              </div>
            )}
            {/* 難度 */}
            <div className="flex gap-1.5 mt-1">
              {DIFFS.map((d, i) => {
                const o = diffOpen(sel, i);
                return (
                  <button
                    key={d.en}
                    disabled={!o}
                    onClick={() => setDiff(i)}
                    className={`flex-1 py-1.5 -skew-x-12 border-2 text-center transition-colors ${diff === i ? "text-black" : "bg-black/60 text-white"} ${o ? "" : "opacity-40"}`}
                    style={{ borderColor: d.color, background: diff === i ? d.color : undefined }}
                  >
                    <div className="disp text-lg leading-none">{d.en}</div>
                    <div className="text-[10px] font-black">{o ? `${d.name}｜獎勵 ×${d.reward}` : "未解鎖"}</div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>最高分 <b className="text-[var(--gold)] text-base">{hi.toLocaleString()}</b></span>
              {!open && <span className="text-[var(--red2)] font-black">需先通關前一關</span>}
            </div>
            <Btn variant="solid" className="!text-xl !py-3 mt-auto sticky bottom-0 z-10" disabled={!open || !dOk} onClick={() => onStart(sel, diff)}>
              <Icon name="sortie" size={22} /> 出擊 SORTIE
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
