// 戰鬥畫面：Canvas 遊戲 + DOM HUD（以 540x960 邏輯座標縮放）+ 各種演出覆蓋層
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { bossArtStyle } from "../assets";
import { audio } from "../game/audio";
import { Game } from "../game/engine/Game";
import type { CardChoice, GameState, HudData } from "../game/engine/Game";
import { BOSSES } from "../game/data/enemies";
import type { BossDef } from "../game/data/enemies";
import { STAGES } from "../game/data/stages";
import { DIFFS, RARITY_COLOR } from "../game/constants";
import { EVO_LEVELS, SHIPS, SKILL_KEYS, SKILL_LABEL } from "../game/data/ships";
import { getData, mutate, useSave } from "../game/save";
import type { RunResult, ShipId } from "../game/types";
import { RARITY_CARD } from "../game/data/cards";
import { Btn, FullscreenBtn, Portrait, RarityTag } from "./ui";
import { Icon } from "./icons";
import { SettingsModal } from "./Settings";

interface Props {
  shipId: ShipId;
  stageId: number;
  diff: number;
  onExit: () => void;
  onRetry: () => void;
  onNext?: () => void;
}

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;

function SkillBtn({ size, icon, color, pct, ready, label, hint, onPress, charge }: { size: number; icon: string; color: string; pct: number; ready: boolean; label: string; hint: string; onPress: () => void; charge?: boolean }) {
  // TT 式外觀：深色圓底 + 斜切標籤 + 外圈進度弧（Canvas HUD 的 DOM 版）
  return (
    <div className="pointer-events-auto flex flex-col items-center" style={{ width: size + 14 }}>
      <button
        className={`skill-btn ${ready ? "ready" : ""}`}
        style={{ width: size, height: size, borderColor: ready ? color : "rgba(255,255,255,0.45)", borderWidth: 3, boxShadow: ready ? `0 0 26px ${color}, inset 0 0 18px ${color}44` : "none" }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onPress();
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: charge ? `conic-gradient(${color}66 ${pct * 360}deg, rgba(0,0,0,0.65) 0)` : `conic-gradient(transparent ${pct * 360}deg, rgba(0,0,0,0.72) 0)` }} />
        {/* 外圈進度環（TT hud.ts 的 DOM 版） */}
        <div className="absolute inset-[3px] rounded-full" style={{ background: `conic-gradient(${color} 0deg, ${color} ${pct * 360}deg, rgba(255,255,255,0.14) ${pct * 360}deg)`, WebkitMaskImage: "radial-gradient(circle, transparent 62%, #000 63%)", maskImage: "radial-gradient(circle, transparent 62%, #000 63%)", opacity: ready ? 1 : 0.85 }} />
        <div className="absolute inset-0 grid place-items-center" style={{ color: ready ? color : "#aab" }}>
          <Icon name={icon} size={size * 0.42} stroke={2.2} />
        </div>
        <div className="absolute bottom-1 inset-x-0 text-center text-[11px] font-black text-white drop-shadow-[0_1px_2px_#000]">{ready ? label : `${Math.round(pct * 100)}%`}</div>
        <div className="absolute top-0.5 inset-x-0 text-center text-[9px] font-black text-white/60 hidden lg:block">{hint}</div>
      </button>
      {/* TT 式斜切文字標籤 */}
      <div className="mt-1 px-2 py-px text-[10px] font-black italic tracking-[0.2em] text-white" style={{ background: ready ? color : "rgba(10,10,16,0.8)", clipPath: "polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%)", textShadow: "1px 1px 0 #000" }}>
        {ready ? (label === "奧義" ? "ULT READY" : "READY") : label.toUpperCase()}
      </div>
    </div>
  );
}

function UltCutIn({ id }: { id: ShipId }) {
  const s = SHIPS[id];
  // TT 式 cutin（對應 TT cutin.ts）：暗化 → 放射線 → 斜切三色帶 → 立繪斜窗滑入 →
  // 標題逐字落下 + 台詞框；進場只有 0.12s 極短白閃，退場由外層淡出，無全白閃屏。
  return (
    <div className="absolute inset-0 z-30 overflow-hidden pointer-events-none" style={{ background: "rgba(4,2,10,0.78)" }}>
      {/* 放射線 */}
      <div className="absolute left-[62%] top-[46%] -translate-x-1/2 -translate-y-1/2 w-[130%] aspect-square opacity-50" style={{ background: `repeating-conic-gradient(from 0deg, ${s.color}33 0deg 4deg, transparent 4deg 11deg)`, WebkitMaskImage: "radial-gradient(circle, #000 18%, transparent 62%)", maskImage: "radial-gradient(circle, #000 18%, transparent 62%)", animation: "spinSlow 6s linear infinite" }} />
      {/* 斜切三色帶 */}
      <div className="absolute -left-[10%] -right-[10%] top-[30%] h-[42%] overflow-hidden" style={{ background: `linear-gradient(100deg, #0a0a10 0%, ${s.color} 45%, ${s.color2} 100%)`, animation: "cutSlide 1.45s cubic-bezier(.2,.8,.2,1) both", boxShadow: `0 0 60px ${s.color}` }}>
        <div className="absolute inset-0 halftone opacity-60" />
        <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 2px, transparent 2px 46px)", animation: "speedLines 0.35s linear infinite" }} />
      </div>
      <div className="absolute -left-[10%] -right-[10%] top-[28%] h-[6px] bg-white -skew-x-12" style={{ animation: "cutSlide 1.45s both" }} />
      <div className="absolute -left-[10%] -right-[10%] top-[72%] h-[6px] bg-white -skew-x-12" style={{ animation: "cutSlide 1.45s both" }} />
      {/* 立繪（斜切視窗，等比 cover 不變形） */}
      <div className="absolute right-[2%] top-[16%] h-[62%] aspect-[330/520]" style={{ animation: "cutPortrait 1.45s cubic-bezier(.2,.8,.2,1) both" }}>
        <div className="absolute inset-0 bg-black translate-x-3 translate-y-3" style={{ clipPath: "polygon(18% 0,100% 0,82% 100%,0 100%)" }} />
        <div className="absolute inset-0 overflow-hidden border-[5px] border-white" style={{ clipPath: "polygon(18% 0,100% 0,82% 100%,0 100%)", background: s.color2 }}>
          <Portrait id={id} focusY={0.22} zoom={1.15} className="absolute inset-0" />
        </div>
      </div>
      {/* 標題逐字落下 */}
      <div className="absolute left-[5%] top-[38%] -rotate-[7deg]">
        <div className="flex">
          {s.cut.line1.split("").map((ch, i) => (
            <span key={i} className="disp italic font-black text-white leading-none" style={{ fontSize: s.cut.line1.length > 12 ? 44 : 58, WebkitTextStroke: "2px #08060f", paintOrder: "stroke fill", textShadow: "4px 4px 0 #08060f, 7px 7px 0 #ff1a3c", animation: `cutChar .32s ${0.12 + i * 0.05}s cubic-bezier(.2,1.6,.4,1) both`, display: "inline-block" }}>
              {ch === " " ? " " : ch}
            </span>
          ))}
        </div>
        <div className="disp italic font-black mt-1" style={{ fontSize: 20, color: s.color2, textShadow: "2px 2px 0 #08060f", animation: "cutText 0.5s 0.55s both" }}>
          {s.cut.line2} · {s.skills.ult.en}
        </div>
        {/* 台詞框 */}
        <div className="mt-3 max-w-[290px] bg-black/90 px-3 py-2 -skew-x-6 border-l-4" style={{ borderColor: s.color, animation: "cutText 0.5s 0.7s both" }}>
          <div className="skew-x-6">
            <div className="text-[11px] font-black tracking-[0.2em]" style={{ color: s.color }}>{s.pilot}　{s.pilotEn}</div>
            <div className="text-[19px] font-black text-white leading-snug">「{s.cut.line2}」</div>
            <div className="text-[12px] font-bold text-white/75">{s.quote}</div>
          </div>
        </div>
      </div>
      {/* 進場極短白閃（TT 同款 0.12s），退場不閃白 */}
      <div className="absolute inset-0 bg-white pointer-events-none" style={{ animation: "cutFlashIn 0.12s ease-out both" }} />
    </div>
  );
}

export function GameScreen({ shipId, stageId, diff, onExit, onRetry, onNext }: Props) {
  const save = useSave();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [dim, setDim] = useState({ w: 360, h: 640, wide: false });
  const [hud, setHud] = useState<HudData | null>(null);
  const [cards, setCards] = useState<CardChoice[] | null>(null);
  const [cut, setCut] = useState<ShipId | null>(null);
  const [boss, setBoss] = useState<{ b: BossDef; stage: number; k: number } | null>(null);
  const [banner, setBanner] = useState<{ title: string; sub: string; color: string; k: number } | null>(null);
  const [evo, setEvo] = useState<{ name: string; skill: string; tier: number; k: number } | null>(null);
  const [state, setState] = useState<GameState>("playing");
  const [result, setResult] = useState<RunResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [hint, setHint] = useState(!save.tutorialSeen);
  const ship = SHIPS[shipId];
  const stage = stageId > 0 ? STAGES[stageId - 1] : null;

  // 版面：9:16 戰鬥區自動置中，寬螢幕顯示左右資訊欄
  useLayoutEffect(() => {
    const el = wrapRef.current!;
    const calc = () => {
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      let h = vh;
      let w = (h * 540) / 960;
      if (w > vw) {
        w = vw;
        h = (w * 960) / 540;
      }
      setDim({ w: Math.floor(w), h: Math.floor(h), wide: vw - w >= 460 });
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    window.addEventListener("orientationchange", calc);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", calc);
    };
  }, []);

  useEffect(() => {
    gameRef.current?.resize(dim.w, dim.h);
  }, [dim]);

  // 建立遊戲
  useEffect(() => {
    audio.init();
    const canvas = canvasRef.current!;
    const g = new Game({
      ship: shipId,
      stageId,
      diff,
      save: getData(),
      canvas,
      cb: {
        onUltCut: (id) => {
          setCut(id);
          setTimeout(() => setCut(null), 1450);
        },
        onCards: (c) => setCards(c),
        onState: (s) => setState(s),
        onOver: (r) => setTimeout(() => setResult(r), 500),
        onClear: (r) => setTimeout(() => setResult(r), 300),
        onBossIntro: (b, st) => {
          const k = Date.now();
          setBoss({ b, stage: st, k });
          setTimeout(() => setBoss((cur) => (cur && cur.k === k ? null : cur)), 3400);
        },
        onBanner: (title, sub, color = "#fff") => {
          const k = Date.now() + Math.random();
          setBanner({ title, sub, color, k });
          setTimeout(() => setBanner((cur) => (cur && cur.k === k ? null : cur)), 2300);
        },
        onEvolve: (i) => {
          const k = Date.now();
          setEvo({ ...i, k });
          setTimeout(() => setEvo((cur) => (cur && cur.k === k ? null : cur)), 2200);
        },
      },
    });
    gameRef.current = g;
    g.resize(dim.w, dim.h);
    g.start();
    audio.playBgm(stage ? stage.music : 1);
    const iv = window.setInterval(() => setHud({ ...g.hud }), 85);
    const vis = () => {
      if (document.hidden) g.pause();
    };
    document.addEventListener("visibilitychange", vis);
    if (!save.tutorialSeen) {
      mutate((d) => {
        d.tutorialSeen = true;
      });
      setTimeout(() => setHint(false), 6500);
    }
    return () => {
      window.clearInterval(iv);
      document.removeEventListener("visibilitychange", vis);
      g.stop();
      audio.setTheme(0);
      gameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipId, stageId, diff]);

  // 卡片鍵盤選擇
  useEffect(() => {
    if (!cards) return;
    const h = (e: KeyboardEvent) => {
      const n = parseInt(e.key);
      if (n >= 1 && n <= cards.length) pick(cards[n - 1].id);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  const pick = (id: string) => {
    gameRef.current?.pickCard(id);
    setCards(null);
  };
  const g = gameRef.current;
  const k = dim.w / 540;
  const playing = state === "playing" && !cards;

  return (
    <div ref={wrapRef} className="screen bg-black flex items-center justify-center">
      {/* 背景氛圍 */}
      <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 50% 50%, ${ship.color}22, #000 70%)` }} />
      <div className="absolute inset-0 halftone opacity-20" />

      {dim.wide && (
        <div className="relative flex-1 min-w-0 h-full flex items-center justify-center pointer-events-none">
          <div className="relative h-[86%] aspect-[1/2] anim-up">
            <div className="absolute inset-0 bg-black/60 jag-torn translate-x-3 translate-y-3" />
            <Portrait id={shipId} focusY={0.12} zoom={1.15} className="absolute inset-0 jag-torn" style={{ filter: `drop-shadow(0 0 26px ${ship.color}77)` }} />
            <div className="absolute left-2 right-2 bottom-3 bg-black/85 px-3 py-2 border-l-4" style={{ borderColor: ship.color }}>
              <div className="disp text-3xl leading-none" style={{ color: ship.color2 }}>{ship.en}</div>
              <div className="text-xs text-white/70">{ship.pilot}</div>
            </div>
          </div>
        </div>
      )}

      {/* 戰鬥區 */}
      <div className="game-field shrink-0" style={{ width: dim.w, height: dim.h, cursor: playing ? "none" : "default" }}>
        <canvas ref={canvasRef} />
        <div className="absolute left-0 top-0 origin-top-left pointer-events-none" style={{ width: 540, height: 960, transform: `scale(${k})` }}>
          {hud && (
            <>
              {/* 進度條 */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-black/60">
                <div className="h-full bg-[var(--red)]" style={{ width: `${hud.progress * 100}%`, transition: "width .2s" }} />
              </div>
              {/* HP / EXP */}
              <div className="absolute left-3 top-4 w-[250px]">
                <div className="flex items-center gap-2">
                  <span className="disp text-[26px] leading-none text-[var(--red2)] drop-shadow-[2px_2px_0_#000]">HP</span>
                  <div className="bar flex-1 !h-[16px]">
                    <i className="bg-gradient-to-r from-[#ff1a3a] to-[#ff8a5a]" style={{ width: `${(hud.hp / hud.maxHp) * 100}%` }} />
                    {hud.hp / hud.maxHp < 0.3 && <div className="absolute inset-0 bg-white/30 animate-pulse" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[13px] font-black tabular-nums drop-shadow-[1px_1px_0_#000]">{Math.ceil(hud.hp)} / {hud.maxHp}</span>
                  {Array.from({ length: hud.shield }, (_, i) => (
                    <span key={i} className="w-3 h-3 rotate-45 bg-[#9be6ff] border border-white" />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="disp text-[20px] leading-none text-[var(--cyan)] drop-shadow-[2px_2px_0_#000]">LV{hud.level}</span>
                  <div className="bar flex-1 !h-[8px]">
                    <i className="bg-gradient-to-r from-[#2ab8ff] to-[#9cf3ff]" style={{ width: `${Math.min(100, (hud.exp / hud.expNeed) * 100)}%` }} />
                  </div>
                </div>
              </div>
              {/* 分數 */}
              <div className="absolute right-14 top-3 text-right">
                <div className="disp text-[40px] leading-none tabular-nums text-white drop-shadow-[3px_3px_0_var(--red)]">{hud.score.toLocaleString()}</div>
                <div className="text-[11px] font-black text-white/70 tracking-wider drop-shadow-[1px_1px_0_#000]">HI {Math.max(hud.hi, hud.score).toLocaleString()}｜{mmss(hud.time)}</div>
              </div>
              {/* 連擊 */}
              {hud.combo >= 3 && (
                <div className="absolute right-3 top-[92px] text-right" key={Math.floor(hud.combo / 5)}>
                  <div className="disp text-[54px] leading-none text-[var(--gold)] drop-shadow-[3px_3px_0_#000]" style={{ animation: "popIn .25s both", WebkitTextStroke: "1px #000" }}>
                    {hud.combo}
                    <span className="text-[22px] ml-1">COMBO</span>
                  </div>
                  <div className="h-1.5 w-32 ml-auto bg-black/60 -skew-x-12">
                    <div className="h-full bg-[var(--gold)]" style={{ width: `${hud.comboT * 100}%` }} />
                  </div>
                </div>
              )}
              {/* Boss 血條 */}
              {hud.boss && (
                <div className="absolute left-4 right-4 top-[92px]">
                  <div className="flex items-end justify-between">
                    <div className="font-black text-[18px] drop-shadow-[2px_2px_0_#000] flex items-center gap-2">
                      <span className="bg-[var(--red)] px-1.5 text-[12px] -skew-x-12">BOSS</span>
                      {hud.boss.name}
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className={`w-2.5 h-2.5 rotate-45 border border-white ${i >= hud.boss!.ph ? "bg-[var(--red)]" : "bg-transparent"}`} />
                      ))}
                    </div>
                  </div>
                  <div className="bar !h-[14px] mt-1">
                    <i className="bg-gradient-to-r from-[#ff1a3a] via-[#ff5a6e] to-[#ffd36b]" style={{ width: `${hud.boss.hp * 100}%` }} />
                    <div className="absolute inset-y-0 left-[33%] w-px bg-white/60" />
                    <div className="absolute inset-y-0 left-[66%] w-px bg-white/60" />
                  </div>
                </div>
              )}
              {/* 呼喊字幕 */}
              {hud.callout && (
                <div className="absolute inset-x-0 top-[250px] text-center" key={hud.callout + Math.floor(hud.time * 2)}>
                  <span className="disp text-[58px] inline-block -skew-x-12 px-5 text-white bg-black/70" style={{ animation: "popIn .3s both", color: hud.calloutColor, WebkitTextStroke: "1px #000", borderLeft: `8px solid ${hud.calloutColor}` }}>
                    {hud.callout}
                  </span>
                </div>
              )}
              {/* 火力階 */}
              <div className="absolute left-3 bottom-4 flex flex-col gap-1">
                {hud.form === 1 && <div className="disp text-[22px] text-[var(--gold)] drop-shadow-[2px_2px_0_#000] animate-pulse">— {shipId === "crow" ? "PHOENIX FORM" : shipId === "prism" ? "MECHA FORM" : "FORM"} —</div>}
                <div className="flex items-center gap-1.5">
                  <span className="disp text-[18px] text-[#ffb347] drop-shadow-[1px_1px_0_#000]">POWER</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 8 }, (_, i) => (
                      <span key={i} className={`w-3.5 h-3.5 -skew-x-12 border border-white/70 ${i < hud.power ? "bg-[#ffb347]" : "bg-black/50"}`} />
                    ))}
                  </div>
                </div>
              </div>
              {/* 技能按鈕（TT 式：小主動 + 大奧義，右下錯位疊放） */}
              <div className="absolute right-2 bottom-3 flex items-end gap-2 pointer-events-none">
                <div className="translate-y-[-34px]">
                  <SkillBtn size={76} icon={ship.skills.active.icon} color={ship.color} pct={hud.activeCd} ready={hud.activeCd >= 1} label="主動" hint="SPACE" onPress={() => g?.triggerActive()} />
                </div>
                <SkillBtn size={104} icon={ship.skills.ult.icon} color={ship.color2} pct={hud.ult} ready={hud.ultReady} label="奧義!" hint="K" charge onPress={() => g?.triggerUlt()} />
              </div>
              {/* 頂部按鈕 */}
              <div className="absolute right-2 top-2 flex flex-col gap-1.5 pointer-events-auto">
                <button aria-label="暫停" onClick={() => g?.pause()} className="w-9 h-9 grid place-items-center bg-black/75 border-2 border-white/80 -skew-x-6 hover:bg-[var(--red)]">
                  <Icon name="pause" size={18} />
                </button>
                <FullscreenBtn className="!w-9 !h-9" />
              </div>
            </>
          )}

          {/* 新手提示 */}
          {hint && state === "playing" && (
            <div className="absolute inset-x-6 bottom-[190px] text-center anim-up">
              <div className="inline-block bg-black/80 border-l-4 border-[var(--red)] px-4 py-2 text-[15px] font-black leading-relaxed">
                拖曳／滑鼠移動機體，戰機會自動射擊<br />
                <span className="text-[var(--cyan)]">主動技</span>與<span className="text-[#c58bff]">奧義</span>使用右下角按鈕（PC：Space／K）
              </div>
            </div>
          )}

          {/* 橫幅 */}
          {banner && (
            <div className="absolute inset-x-0 top-[330px] flex justify-center" key={banner.k}>
              <div className="relative" style={{ animation: "popIn .35s both, flashWhite .5s 1.8s forwards" }}>
                <div className="absolute inset-0 bg-black/80 -skew-x-12 scale-x-110" style={{ borderLeft: `10px solid ${banner.color}`, borderRight: `10px solid ${banner.color}` }} />
                <div className="relative px-10 py-2 text-center -skew-x-6">
                  <div className="disp text-[70px] leading-none" style={{ color: banner.color, WebkitTextStroke: "1px #000" }}>{banner.title}</div>
                  {banner.sub && <div className="font-black text-[22px] tracking-widest">{banner.sub}</div>}
                </div>
              </div>
            </div>
          )}

          {/* 進化演出 */}
          {evo && (
            <div className="absolute inset-x-0 top-[280px] flex justify-center" key={evo.k}>
              <div className="relative text-center" style={{ animation: "popIn .35s both, flashWhite .5s 1.7s forwards" }}>
                <div className="absolute -inset-x-24 -inset-y-4 bg-gradient-to-r from-transparent via-[var(--gold)]/70 to-transparent" style={{ clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 70%)" }} />
                <div className="relative disp text-[64px] leading-none text-white" style={{ WebkitTextStroke: "2px #7a4a08", textShadow: "4px 4px 0 #7a4a08" }}>EVOLVE!</div>
                <div className="relative font-black text-[24px] text-white drop-shadow-[2px_2px_0_#000]">{evo.skill}・{evo.name}</div>
              </div>
            </div>
          )}

          {/* Boss 登場 */}
          {boss && (
            <div className="absolute inset-x-0 top-[150px] z-20" key={boss.k}>
              <div style={{ animation: "slideInR .45s both, flashWhite .5s 2.8s forwards" }}>
                <div className="h-8 overflow-hidden flex items-center justify-center bg-[var(--red)]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, #000 0 14px, transparent 14px 28px)" }}>
                  <span className="disp text-[28px] tracking-[0.6em] text-white bg-[var(--red)] px-4" style={{ animation: "bossWarn .5s infinite" }}>WARNING</span>
                </div>
                <div className="relative flex items-center gap-4 bg-black/85 px-4 py-3 border-y-4 border-[var(--red)]">
                  <div className="w-[170px] h-[170px] bg-cover shrink-0 border-4 border-white -skew-x-3" style={{ ...bossArtStyle(boss.b.art), boxShadow: `0 0 30px ${boss.b.color}` }} />
                  <div className="min-w-0">
                    <div className="text-[12px] tracking-[0.4em] text-white/60">{boss.stage > 0 ? `STAGE ${boss.stage} BOSS` : "ENDLESS BOSS"}</div>
                    <div className="font-black text-[44px] leading-none drop-shadow-[3px_3px_0_var(--red)]">{boss.b.name}</div>
                    <div className="disp text-[26px] tracking-widest" style={{ color: boss.b.color }}>{boss.b.title}</div>
                    <div className="text-[14px] italic text-white/80 mt-1">「{boss.b.quote}」</div>
                  </div>
                </div>
                <div className="h-4 bg-[var(--red)]" style={{ backgroundImage: "repeating-linear-gradient(-45deg, #000 0 14px, transparent 14px 28px)" }} />
              </div>
            </div>
          )}

          {/* 奧義 Cut-in */}
          {cut && <UltCutIn id={cut} />}

          {/* 升級卡片 */}
          {cards && (
            <div className="absolute inset-0 z-30 bg-black/80 pointer-events-auto flex flex-col items-center justify-center px-4" style={{ animation: "slideInU .25s both" }}>
              <div className="absolute inset-0 halftone opacity-30" />
              <div className="relative text-center mb-3">
                <div className="disp text-[70px] leading-none text-white -skew-x-6" style={{ textShadow: "4px 4px 0 var(--red)" }}>LEVEL UP!</div>
                <div className="font-black tracking-[0.4em] text-[16px] text-white/80">選擇一項強化</div>
              </div>
              <div className={`relative w-full grid gap-3 ${cards.length > 3 ? "grid-cols-2" : "grid-cols-1"}`}>
                {cards.map((c, i) => {
                  const col = c.skill ? ship.color : RARITY_CARD[c.rarity].color;
                  return (
                    <button
                      key={c.id}
                      onClick={() => pick(c.id)}
                      className="relative text-left bg-[#0d0d14] border-2 p-3 flex items-center gap-3 hover:scale-[1.03] transition-transform"
                      style={{ borderColor: col, boxShadow: `0 0 18px ${col}66, 5px 5px 0 ${col}55`, animation: `popIn .35s ${i * 0.08}s both`, clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)" }}
                    >
                      <div className="w-[58px] h-[58px] grid place-items-center shrink-0 -skew-x-6" style={{ background: col + "26", border: `2px solid ${col}`, color: col }}>
                        <Icon name={c.icon} size={34} stroke={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <b className="text-[18px] leading-tight">{c.name}</b>
                          {c.evo && <span className="disp text-[16px] px-1.5 bg-[var(--gold)] text-black -skew-x-12 animate-pulse">EVOLVE</span>}
                        </div>
                        <div className="text-[12px] text-white/55">{c.lvText}</div>
                        <div className="text-[13.5px] text-white/85 leading-snug">{c.desc}</div>
                      </div>
                      <div className="disp text-[30px] text-white/25 absolute right-3 top-1">{i + 1}</div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => mutate((d) => { d.settings.autoCard = !d.settings.autoCard; })}
                className="relative mt-4 text-[13px] font-black px-3 py-1.5 bg-black border border-white/40 -skew-x-6 hover:border-[var(--red)]"
              >
                升級卡片自動選擇：{save.settings.autoCard ? "開（下次起不再彈出）" : "關"}
              </button>
            </div>
          )}

          {/* 暫停 */}
          {state === "paused" && !result && (
            <div className="absolute inset-0 z-30 bg-black/80 pointer-events-auto grid place-items-center" style={{ animation: "slideInU .2s both" }}>
              <div className="w-[400px] panel jag p-5 border-l-4 border-[var(--red)]">
                <div className="disp text-[64px] leading-none">PAUSE</div>
                <div className="text-[13px] tracking-[0.4em] text-white/60 mb-3">暫停中</div>
                <div className="grid grid-cols-2 gap-1.5 mb-3 text-[13px]">
                  {SKILL_KEYS.map((key) => (
                    <div key={key} className="bg-black/50 border border-white/10 px-2 py-1">
                      <span className="text-white/50">{SKILL_LABEL[key]}</span> {ship.skills[key].name}
                      <b className="text-[var(--gold)] ml-1">Lv{g ? g.lvl(key) : 1}</b>
                    </div>
                  ))}
                </div>
                <div className="text-[12px] text-white/60 mb-3">
                  {stage ? `STAGE ${stage.id}・${stage.name}` : "無限模式"}｜{DIFFS[diff].name}｜Lv{hud?.level}
                </div>
                <div className="flex flex-col gap-3">
                  <Btn variant="solid" onClick={() => g?.resume()}>
                    <Icon name="play" size={18} /> 繼續戰鬥
                  </Btn>
                  <Btn onClick={() => setShowSettings(true)}>
                    <Icon name="gear" size={18} /> 設定
                  </Btn>
                  <Btn onClick={() => g?.finish(false)}>放棄任務・結算</Btn>
                </div>
              </div>
            </div>
          )}

          {/* 結算 */}
          {result && <ResultPanel r={result} onExit={onExit} onRetry={onRetry} onNext={onNext} />}
        </div>
        {showSettings && (
          <div className="absolute inset-0 z-50">
            <SettingsModal onClose={() => setShowSettings(false)} />
          </div>
        )}
        {/* 手機小型全螢幕鍵 */}
        {!dim.wide && state !== "playing" && (
          <div className="absolute left-2 top-10 z-40">
            <FullscreenBtn />
          </div>
        )}
      </div>

      {dim.wide && (
        <div className="relative flex-1 min-w-0 h-full flex flex-col justify-center items-center gap-3 pointer-events-none px-4">
          <div className="w-full max-w-[300px] panel jag p-4 border-l-4 border-[var(--red)] pointer-events-auto">
            <div className="disp text-3xl leading-none">{stage ? `STAGE ${stage.id}` : "ENDLESS"}</div>
            <div className="font-black">{stage ? stage.name : "無限模式"}</div>
            <div className="text-[11px] text-white/60 mb-2">{DIFFS[diff].name}難度</div>
            <div className="space-y-1 text-[12px] text-white/80">
              <div><b className="text-white">移動</b> 滑鼠 / WASD / 方向鍵</div>
              <div><b className="text-[var(--cyan)]">主動技</b> 左鍵 / Space / J</div>
              <div><b className="text-[#c58bff]">奧義</b> 右鍵 / K / E</div>
              <div><b>低速精準</b> Shift（顯示判定點）</div>
              <div><b>暫停</b> Esc / P</div>
            </div>
            <div className="mt-3 flex items-center gap-2 pointer-events-auto">
              <FullscreenBtn />
              <button onClick={() => g?.pause()} className="px-3 h-10 bg-black/75 border-2 border-white/80 -skew-x-6 hover:bg-[var(--red)] font-black text-sm">暫停</button>
            </div>
          </div>
          <div className="text-[11px] text-white/45 tracking-widest">FPS {hud ? Math.round(hud.fps) : "--"}</div>
        </div>
      )}
    </div>
  );
}

function ResultPanel({ r, onExit, onRetry, onNext }: { r: RunResult; onExit: () => void; onRetry: () => void; onNext?: () => void }) {
  const rc: Record<string, string> = { S: "#ffd36b", A: "#ff3b52", B: "#45d6ff", C: "#9aa6b6" };
  return (
    <div className="absolute inset-0 z-40 bg-black/85 pointer-events-auto flex flex-col items-center justify-center px-5 overflow-hidden" style={{ animation: "slideInU .3s both" }}>
      <div className="absolute inset-0 halftone opacity-25" />
      <div className="absolute -left-10 -right-10 top-[8%] h-[24%] -skew-y-3" style={{ background: r.win ? "var(--red)" : "#222" }} />
      <div className="relative w-full">
        <div className="disp text-[74px] leading-none text-white -skew-x-6" style={{ textShadow: "5px 5px 0 #000" }}>{r.win ? "STAGE CLEAR" : r.mode === "endless" ? "RESULT" : "MISSION OVER"}</div>
        <div className="font-black tracking-[0.3em] text-[15px] text-white/90 ml-1">{r.win ? "任務完成" : r.mode === "endless" ? "無限模式結算" : "任務中止"}{r.newHi && <span className="ml-3 bg-[var(--gold)] text-black px-2 -skew-x-12 inline-block">NEW RECORD!</span>}</div>
      </div>
      <div className="relative w-full mt-5 grid grid-cols-[1fr_auto] gap-4 items-center">
        <div className="space-y-1.5 text-[16px]">
          {[["SCORE 分數", r.score.toLocaleString()], ["KILLS 擊墜", String(r.kills)], ["MAX COMBO", String(r.maxCombo)], ["TIME 時間", mmss(r.time)], r.mode === "endless" ? ["WAVE 波次", String(r.wave)] : ["LEVEL", "Lv" + r.level]].map(([k, v]) => (
            <div key={k} className="flex justify-between bg-black/70 border-l-4 border-[var(--red)] px-3 py-1 -skew-x-6">
              <span className="font-black text-white/80">{k}</span>
              <b className="disp text-[24px] leading-none">{v}</b>
            </div>
          ))}
        </div>
        <div className="disp text-[150px] leading-none" style={{ color: rc[r.rank], WebkitTextStroke: "3px #000", textShadow: "7px 7px 0 rgba(0,0,0,.7)", animation: "rankStamp .6s .3s both" }}>{r.rank}</div>
      </div>
      <div className="relative w-full mt-4 bg-black/70 border border-white/15 p-3">
        <div className="flex items-center gap-5 text-[18px] font-black">
          <span className="flex items-center gap-2"><Icon name="coin" size={22} className="text-[var(--gold)]" /> +{r.coins.toLocaleString()}</span>
          <span className="flex items-center gap-2"><Icon name="core" size={22} className="text-[#ff8ad4]" /> +{r.cores}</span>
          <span className="text-[13px] text-white/60 ml-auto">獲得裝備 {r.items.length}</span>
        </div>
        {r.items.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 max-h-[96px] overflow-hidden">
            {r.items.slice(0, 18).map((it) => (
              <div key={it.id} title={it.name} className={`rar-${it.rarity} rar-frame w-10 h-10 grid place-items-center relative`}>
                <Icon name={it.slot} size={22} style={{ color: RARITY_COLOR[it.rarity] }} />
                <span className="absolute -top-1 -left-1"><RarityTag r={it.rarity} /></span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative w-full mt-5 grid gap-3" style={{ gridTemplateColumns: r.win && onNext ? "1fr 1fr 1fr" : "1fr 1fr" }}>
        <Btn onClick={onExit}>返回</Btn>
        <Btn onClick={onRetry} variant={r.win && onNext ? "" : "solid"}>再挑戰</Btn>
        {r.win && onNext && <Btn variant="solid" onClick={onNext}>下一關</Btn>}
      </div>
    </div>
  );
}
