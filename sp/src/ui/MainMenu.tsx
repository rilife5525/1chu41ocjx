// 主選單：全幅主視覺 + 斜切紅黑構圖 + 傾斜選單列 + 跑馬燈
import { useEffect, useState } from "react";
import { IMG } from "../assets";
import { audio } from "../game/audio";
import { SHIPS, shipTier, TIER_NAME } from "../game/data/ships";
import { useSave } from "../game/save";
import { SHIP_IDS } from "../game/types";
import type { ShipId } from "../game/types";
import { Currency, FullscreenBtn, Portrait, ShipCanvas } from "./ui";
import { Icon } from "./icons";

const TICKER = "天頂反逆，由你改寫　★　覺醒星紋　★　突破彈幕　★　登上天頂王座　★　STAR-SIGIL CHRONICLE　★　";

export function MainMenu({ go, onEndless, onSettings }: { go: (s: "stages" | "hangar") => void; onEndless: () => void; onSettings: () => void }) {
  const save = useSave();
  // 右側立繪輪播：每 4.2 秒換一架，左側選單保持不動
  const [idx, setIdx] = useState(() => Math.max(0, SHIP_IDS.indexOf(save.sel as ShipId)));
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SHIP_IDS.length), 4200);
    return () => clearInterval(t);
  }, []);
  const showId: ShipId = SHIP_IDS[idx];
  const show = SHIPS[showId];
  const showTier = shipTier(save.ships[showId].lv);
  const items: { en: string; zh: string; icon: string; fn: () => void }[] = [
    { en: "SORTIE", zh: "出擊　任務", icon: "sortie", fn: () => go("stages") },
    { en: "HANGAR", zh: "機庫　養成", icon: "hangar", fn: () => go("hangar") },
    { en: "ENDLESS", zh: "無限模式", icon: "infinity", fn: onEndless },
    { en: "SETTINGS", zh: "系統設定", icon: "gear", fn: onSettings },
  ];
  return (
    <div className="screen">
      <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url(${IMG.menuKey})`, filter: "saturate(1.15) contrast(1.08)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/45 lg:to-transparent" />
      <div className="absolute inset-0 halftone opacity-30 pointer-events-none" />
      {/* 紅色斜切帶 */}
      <div className="absolute top-0 bottom-0 left-0 w-[70%] lg:w-[46%] opacity-90 pointer-events-none" style={{ background: "linear-gradient(120deg, rgba(232,17,45,0.92) 0%, rgba(140,8,24,0.8) 60%, rgba(0,0,0,0) 100%)", clipPath: "polygon(0 0, 100% 0, 62% 100%, 0 100%)" }} />
      <div className="absolute top-0 bottom-0 left-0 w-[70%] lg:w-[46%] pointer-events-none halftone-red opacity-40" style={{ clipPath: "polygon(0 0, 100% 0, 62% 100%, 0 100%)" }} />
      <div className="absolute inset-y-0 left-[50%] lg:left-[70%] w-1.5 bg-white/90 -skew-x-[12deg] hidden sm:block" style={{ boxShadow: "0 0 24px rgba(255,255,255,0.6)" }} />

      {/* 右側機師立繪（桌機，輪播） */}
      <div className="hidden lg:block absolute right-[1%] bottom-[10%] w-[30%] aspect-[1/2] pointer-events-none">
        <div className="absolute inset-0 bg-black/60 jag-torn translate-x-3 translate-y-3" />
        <div key={showId} className="absolute inset-0 anim-right" style={{ animationDuration: "0.45s" }}>
          <Portrait id={showId} focusY={0.12} zoom={1.15} className="absolute inset-0 jag-torn" style={{ filter: "drop-shadow(0 0 30px " + show.color + "88)", clipPath: "polygon(32% 0,100% 0,100% 100%,0 100%)", WebkitMaskImage: "linear-gradient(to bottom,#000 78%,transparent)", maskImage: "linear-gradient(to bottom,#000 78%,transparent)" }} />
        </div>
        <div className="absolute -left-24 bottom-6 bg-black/85 border-l-4 px-4 py-2 -skew-x-6">
          <div key={showId + "t"} className="anim-up">
            <div className="text-[11px] tracking-[0.35em] text-white/60">CURRENT UNIT · {TIER_NAME[showTier]}</div>
            <div className="disp text-4xl leading-none" style={{ color: show.color2 }}>{show.en}</div>
            <div className="font-black">{show.name}｜{show.pilot}</div>
          </div>
        </div>
        {/* 輪播進度條 */}
        <div className="absolute bottom-0 right-0 flex gap-1">
          {SHIP_IDS.map((s, i) => (
            <i key={s} className="h-1.5 w-8" style={{ background: i === idx ? SHIPS[s].color : "rgba(255,255,255,0.25)", transform: "skewX(-25deg)" }} />
          ))}
        </div>
        <div key={showId + "s"} className="absolute -left-56 top-1/2 w-56 h-56 pointer-events-none anim-right" style={{ animationDuration: "0.45s" }}>
          <ShipCanvas id={showId} tier={showTier} scale={1.5} />
        </div>
      </div>

      {/* 手機版：右下小立繪輪播（不遮擋左側選單） */}
      <div className="lg:hidden absolute right-2 bottom-14 w-[66%] max-w-[360px] aspect-[1/2] pointer-events-none opacity-90">
        <div key={showId + "m"} className="absolute inset-0 anim-right" style={{ animationDuration: "0.45s" }}>
          <Portrait id={showId} focusY={0.14} zoom={1.1} className="absolute inset-0 jag-torn" style={{ filter: "drop-shadow(0 0 18px " + show.color + "88)", clipPath: "polygon(40% 0,100% 0,100% 100%,0 100%)", WebkitMaskImage: "linear-gradient(to bottom,#000 82%,transparent)", maskImage: "linear-gradient(to bottom,#000 82%,transparent)" }} />
        </div>
        <div className="absolute -left-2 bottom-1 bg-black/80 border-l-2 px-2 py-1 -skew-x-6" style={{ borderColor: show.color }}>
          <div className="disp text-lg leading-none" style={{ color: show.color2 }}>{show.en.split(" ")[1] || show.en}</div>
          <div className="text-[10px] font-black">{show.name}</div>
        </div>
      </div>

      {/* 頂部工具列 */}
      <div className="absolute top-0 right-0 flex items-center gap-2 p-3 sm:p-4 z-10" style={{ paddingTop: "calc(var(--safe-t) + 12px)" }}>
        <Currency coins={save.coins} cores={save.cores} />
        <FullscreenBtn />
      </div>

      {/* 主要內容 */}
      <div className="relative flex flex-col justify-between px-5 sm:px-10 lg:px-16 pt-6 pb-6">
        <div className="pt-8 lg:pt-4">
          {/* <div className="text-[12px] sm:text-xs tracking-[0.5em] text-white/80 font-black anim-up">STAR-SIGIL SHOOTING CHRONICLE</div> */}
          <div className="title-jag text-[64px] sm:text-[104px] lg:text-[148px] anim-pop" style={{ animationDelay: "0.1s" }}>緋夜天翼</div>
          <div className="flex items-end gap-3 -mt-1 sm:-mt-3">
            <div className="disp bg-white text-[var(--ink)] px-3 sm:px-5 text-[42px] sm:text-[64px] lg:text-[82px] leading-[1.05] -skew-x-12 -rotate-3 anim-pop shadow-[6px_6px_0_var(--ink)]" style={{ animationDelay: "0.25s" }}>
              Zenith
            </div>
            <div className="pb-2 anim-up" style={{ animationDelay: "0.4s" }}>
              <div className="font-black tracking-[0.5em] text-xl sm:text-3xl lg:text-4xl text-white drop-shadow-[3px_3px_0_#000]">天頂反逆</div>
              <div className="text-[11px] sm:text-sm tracking-[0.3em] text-white/70">覺醒星紋・突破彈幕</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:gap-3 w-[48%] sm:w-[48%] lg:w-[32%] max-w-[420px] pb-2">
          {items.map((it, i) => (
            <button
              key={it.en}
              className="menu-item"
              style={{ animationDelay: `${0.35 + i * 0.09}s` }}
              onMouseEnter={() => audio.sfx("ui_hover", 0.05)}
              onClick={() => {
                audio.init();
                audio.sfx("ui_ok");
                it.fn();
              }}
            >
              <Icon name={it.icon} size={28} />
              <span className="flex flex-col leading-none">
                <span className="mi-en">{it.en}</span>
                <span className="mi-zh">{it.zh}</span>
              </span>
              <Icon name="back" size={18} className="ml-auto rotate-180 opacity-60" />
            </button>
          ))}
          <div className="hidden sm:flex gap-4 text-[11px] text-white/70 mt-2 tracking-wider">
            <span>累計擊墜 <b className="text-white">{save.stats.kills.toLocaleString()}</b></span>
            <span>最高連擊 <b className="text-white">{save.stats.maxCombo}</b></span>
            <span>無限紀錄 <b className="text-[var(--gold)]">{save.endless.hi.toLocaleString()}</b></span>
          </div>
        </div>
      </div>

      {/* 跑馬燈 */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden whitespace-nowrap bg-black/85 border-t-2 border-[var(--red)] py-1" style={{ paddingBottom: "calc(var(--safe-b) + 4px)" }}>
        <div className="inline-block disp text-lg tracking-[0.2em] text-white/85" style={{ animation: "ticker 38s linear infinite" }}>
          {TICKER.repeat(6)}
        </div>
      </div>
    </div>
  );
}
