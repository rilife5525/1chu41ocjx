// 共用 UI 元件：機體展示畫布、機師立繪、按鈕、貨幣、全螢幕切換、機體雷達圖
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { IMG } from "../assets";
import { audio } from "../game/audio";
import { SHIPS } from "../game/data/ships";
import type { ShipId } from "../game/types";
import { drawShip, makeOpts } from "../game/render/shipDraw";
import { Icon } from "./icons";

/** 播放 UI 音效並執行回呼的按鈕 */
export function Btn({ children, onClick, className = "", variant = "", disabled, title, sfx = "ui_ok" }: { children: ReactNode; onClick?: () => void; className?: string; variant?: "" | "solid" | "gold"; disabled?: boolean; title?: string; sfx?: string }) {
  return (
    <button
      title={title}
      disabled={disabled}
      className={`p5-btn ${variant} ${className}`}
      onMouseEnter={() => audio.sfx("ui_hover", 0.05)}
      onClick={() => {
        audio.init();
        audio.sfx(sfx);
        onClick?.();
      }}
    >
      <span className="flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

/** 機師立繪（等比 cover，永不壓扁變形）
 *  T 版立繪集為 1536x1024（3 欄 x 1 列，每格 512x1024，寬高比 0.5）。
 *  背景圖整張寬高比 1.5；舊寫法 backgroundSize "300% 100%" 會把整張圖
 *  水平拉寬 3 倍後塞進容器（相當於壓扁單格），在任何 aspect 容器都會變形。
 *  这里改用 <img> + object-fit: cover：瀏覽器自動等比裁切填滿，人物永不變形。
 *  focusY：垂直焦點 0~1（0=頂/臉部，1=底），透過 object-position 調整。
 */
export function Portrait({ id, className = "", style, focusY = 0.18, zoom = 1 }: { id: ShipId; className?: string; style?: React.CSSProperties; focusY?: number; zoom?: number }) {
  const d = SHIPS[id];
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // 單格寬高比 512/1024 = 0.5
  const CELL_AR = 0.5;
  const boxAr = box.h > 0 ? box.w / box.h : CELL_AR;
  // cover 縮放：渲染尺寸先等比放大到蓋滿容器
  let rw = box.w * zoom;
  let rh = box.h * zoom;
  if (box.w > 0 && box.h > 0) {
    if (boxAr > CELL_AR) rh = rw / CELL_AR;
    else rw = rh * CELL_AR;
  }
  // 單格在整張圖中的水平偏移（0 / 512 / 1024 px → 相對渲染寬度）
  const colPx = d.portrait.col * 512;
  const sheetScale = rw > 0 ? rw / 512 : 0; // 渲染像素 / 單格原始像素
  const left = -(colPx * sheetScale);
  // 垂直焦點：把焦點對齊容器中心
  const fy = Math.min(1, Math.max(0, focusY));
  const top = box.h > 0 && rh > 0 ? box.h / 2 - rh * fy : 0;
  const isAbs = className.includes("absolute");
  const outer: CSSProperties = { overflow: "hidden", ...(isAbs ? {} : { position: "relative" as const }), ...style };
  return (
    <div ref={wrapRef} className={className} style={outer}>
      {box.w > 0 && (
        <img
          src={d.portrait.sheet === "a" ? IMG.pilotsA : IMG.pilotsB}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            left,
            top,
            width: 1536 * sheetScale,
            height: 1024 * sheetScale,
            maxWidth: "none",
            maxHeight: "none",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

/** 機體展示畫布：持續動畫的 Canvas 戰機 */
export function ShipCanvas({ id, tier = 0, gear = [0, 0, 0, 0, 0, 0], form = 0, morph = 0, scale = 1.55, className = "" }: { id: ShipId; tier?: number; gear?: number[]; form?: number; morph?: number; scale?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const props = useRef({ id, tier, gear, form, morph, scale });
  props.current = { id, tier, gear, form, morph, scale };
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const t0 = performance.now();
    const loop = (now: number) => {
      const t = (now - t0) / 1000;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (w > 0 && (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr))) {
        c.width = Math.round(w * dpr);
        c.height = Math.round(h * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const pr = props.current;
      const d = SHIPS[pr.id];
      ctx.save();
      ctx.translate(w / 2, h / 2 + Math.sin(t * 1.8) * h * 0.012);
      const s = (Math.min(w, h) / 150) * pr.scale;
      // 背景光暈與旋轉六角環
      ctx.globalCompositeOperation = "lighter";
      const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.min(w, h) * 0.5);
      gr.addColorStop(0, d.color + "66");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = d.color + "88";
      ctx.lineWidth = 1.5;
      for (let k = 0; k < 2; k++) {
        ctx.save();
        ctx.rotate(t * (0.25 + k * 0.15) * (k ? -1 : 1));
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          const r = Math.min(w, h) * (0.36 + k * 0.08);
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.scale(s, s);
      const o = makeOpts(pr.id, t, pr.tier, pr.gear);
      o.form = pr.form;
      o.morph = pr.morph;
      o.thrust = 1.15 + Math.sin(t * 3) * 0.1;
      drawShip(ctx, pr.id, o);
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className={`block w-full h-full ${className}`} />;
}

/** 貨幣顯示 */
export function Currency({ coins, cores, className = "" }: { coins: number; cores: number; className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 bg-black/70 px-3 py-1 jag-r border border-white/10">
        <Icon name="coin" size={16} className="text-[var(--gold)]" />
        <span className="disp text-xl leading-none tracking-wider tabular-nums">{coins.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-1.5 bg-black/70 px-3 py-1 jag-r border border-white/10">
        <Icon name="core" size={16} className="text-[#ff8ad4]" />
        <span className="disp text-xl leading-none tracking-wider tabular-nums">{cores}</span>
      </div>
    </div>
  );
}

/** 全螢幕狀態 Hook */
export function useFullscreen() {
  const [on, setOn] = useState(!!document.fullscreenElement);
  useEffect(() => {
    const h = () => setOn(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);
  const toggle = () => {
    audio.init();
    audio.sfx("ui");
    const el: any = document.documentElement;
    if (!document.fullscreenElement) (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {});
    else document.exitFullscreen?.();
  };
  return { on, toggle };
}

export function FullscreenBtn({ className = "" }: { className?: string }) {
  const { on, toggle } = useFullscreen();
  return (
    <button aria-label="全螢幕" title="全螢幕" onClick={toggle} className={`w-10 h-10 grid place-items-center bg-black/75 border-2 border-white/80 hover:bg-[var(--red)] transition-colors -skew-x-6 ${className}`}>
      <Icon name={on ? "exitfs" : "fullscreen"} size={20} />
    </button>
  );
}

/** 五角雷達圖 */
export function Radar({ v, color, size = 120 }: { v: number[]; color: string; size?: number }) {
  const labels = ["火力", "機動", "防禦", "範圍", "操作"];
  const c = size / 2;
  const R = size * 0.34;
  const pt = (i: number, k: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return [c + Math.cos(a) * R * k, c + Math.sin(a) * R * k];
  };
  const poly = (k: number) => Array.from({ length: 5 }, (_, i) => pt(i, k).join(",")).join(" ");
  const data = v.map((x, i) => pt(i, x / 5).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.4, 0.7, 1].map((k) => (
        <polygon key={k} points={poly(k)} fill="none" stroke="rgba(255,255,255,0.18)" />
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <line key={i} x1={c} y1={c} x2={pt(i, 1)[0]} y2={pt(i, 1)[1]} stroke="rgba(255,255,255,0.12)" />
      ))}
      <polygon points={data} fill={color + "55"} stroke={color} strokeWidth={2} />
      {labels.map((l, i) => {
        const [x, y] = pt(i, 1.32);
        return (
          <text key={l} x={x} y={y + 4} textAnchor="middle" fontSize={size * 0.09} fill="#f6f1e7" fontWeight={900}>
            {l}
          </text>
        );
      })}
    </svg>
  );
}

/** 稀有度徽記 */
export function RarityTag({ r }: { r: string }) {
  const c: Record<string, string> = { R: "#9aa6b6", SR: "#47c2ff", SSR: "#ffc23d", UR: "#ff3b6b" };
  return (
    <span className="disp px-1.5 leading-none text-[15px] text-black -skew-x-12 inline-block" style={{ background: c[r] }}>
      {r}
    </span>
  );
}
