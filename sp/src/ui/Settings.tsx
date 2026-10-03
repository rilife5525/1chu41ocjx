// 系統設定面板（Modal）
import { audio } from "../game/audio";
import { mutate, resetSave, useSave } from "../game/save";
import type { Settings } from "../game/types";
import { Btn } from "./ui";
import { Icon } from "./icons";
import { useState } from "react";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => {
        audio.sfx("ui");
        onChange(!on);
      }}
      className={`relative w-14 h-7 -skew-x-12 border-2 transition-colors ${on ? "bg-[var(--red)] border-white" : "bg-black border-white/40"}`}
    >
      <span className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${on ? "left-[calc(100%-1.65rem)]" : "left-0.5"}`} />
    </button>
  );
}

function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-white/10">
      <div>
        <div className="font-black tracking-wider">{label}</div>
        {sub && <div className="text-[11px] text-white/55 leading-tight">{sub}</div>}
      </div>
      {children}
    </div>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const save = useSave();
  const s = save.settings;
  const [confirm, setConfirm] = useState(false);
  const set = (p: Partial<Settings>) => {
    mutate((d) => {
      Object.assign(d.settings, p);
    });
    const n = { ...s, ...p };
    audio.setVolumes(n.bgm, n.sfx);
  };
  const Q: [Settings["quality"], string][] = [["auto", "自動"], ["high", "高"], ["mid", "中"], ["low", "省電"]];
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-black/80 p-3 anim-up" onClick={onClose}>
      <div className="panel jag w-full max-w-xl max-h-[92dvh] overflow-y-auto noscroll p-5 border-l-4 border-[var(--red)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="disp text-5xl leading-none text-white">SETTINGS</div>
            <div className="text-xs tracking-[0.4em] text-white/60">系統設定</div>
          </div>
          <button onClick={onClose} className="w-10 h-10 grid place-items-center bg-[var(--red)] -skew-x-6">
            <Icon name="close" />
          </button>
        </div>
        <Row label="升級卡片自動選擇" sub="開啟後升級不會彈出選項，由系統挑選（優先技能進化）">
          <Toggle on={s.autoCard} onChange={(v) => set({ autoCard: v })} />
        </Row>
        <Row label="畫面特效品質" sub="自動：依 FPS 動態降級，確保 60 FPS">
          <div className="flex gap-1">
            {Q.map(([k, n]) => (
              <button key={k} onClick={() => set({ quality: k })} className={`px-2.5 py-1 text-sm font-black -skew-x-12 border ${s.quality === k ? "bg-[var(--red)] border-white" : "bg-black/60 border-white/30"}`}>
                {n}
              </button>
            ))}
          </div>
        </Row>
        <Row label="音樂音量">
          <input type="range" min={0} max={1} step={0.05} value={s.bgm} onChange={(e) => set({ bgm: +e.target.value })} className="w-40 accent-[var(--red)]" />
        </Row>
        <Row label="音效音量">
          <input type="range" min={0} max={1} step={0.05} value={s.sfx} onChange={(e) => set({ sfx: +e.target.value })} className="w-40 accent-[var(--red)]" />
        </Row>
        <Row label="觸控靈敏度" sub="手指拖曳與機體移動的比例">
          <input type="range" min={0.7} max={2} step={0.05} value={s.sens} onChange={(e) => set({ sens: +e.target.value })} className="w-40 accent-[var(--red)]" />
        </Row>
        <Row label="畫面震動">
          <Toggle on={s.shake} onChange={(v) => set({ shake: v })} />
        </Row>
        <Row label="傷害數字">
          <Toggle on={s.showDmg} onChange={(v) => set({ showDmg: v })} />
        </Row>
        <Row label="常駐顯示判定點">
          <Toggle on={s.hitbox} onChange={(v) => set({ hitbox: v })} />
        </Row>
        <div className="mt-3 text-[12px] leading-relaxed text-white/70 bg-black/40 p-3 border border-white/10">
          <b className="text-white">操作說明</b>
          <br />
          PC：滑鼠移動 / WASD·方向鍵移動｜左鍵·Space·J 主動技｜右鍵·K·E 奧義｜Shift 低速精準｜Esc·P 暫停
          <br />
          手機：手指在畫面任意處拖曳移動（自動射擊）｜右下角按鈕施放技能與奧義
        </div>
        <div className="flex justify-between mt-4">
          {confirm ? (
            <Btn
              variant="solid"
              onClick={() => {
                resetSave();
                setConfirm(false);
                onClose();
              }}
            >
              確認清除全部存檔？
            </Btn>
          ) : (
            <Btn onClick={() => setConfirm(true)}>重置存檔</Btn>
          )}
          <Btn variant="solid" onClick={onClose}>
            完成
          </Btn>
        </div>
      </div>
    </div>
  );
}
