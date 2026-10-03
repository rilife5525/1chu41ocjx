// ZENITH RIOT｜天頂叛逆 —— 應用程式入口與畫面路由
import { useEffect, useState } from "react";
import { BG_SRC, loadBg } from "./assets";
import { audio } from "./game/audio";
import { useSave } from "./game/save";
import { GameScreen } from "./ui/GameScreen";
import { Hangar } from "./ui/Hangar";
import { MainMenu } from "./ui/MainMenu";
import { SettingsModal } from "./ui/Settings";
import { StageSelect } from "./ui/StageSelect";

type Screen = "menu" | "hangar" | "stages" | "game";

// 預載所有關卡背景
Object.keys(BG_SRC).forEach(loadBg);

export default function App() {
  const save = useSave();
  const [screen, setScreen] = useState<Screen>("menu");
  const [run, setRun] = useState<{ stageId: number; diff: number; key: number } | null>(null);
  const [wipe, setWipe] = useState(0);
  const [settings, setSettings] = useState(false);
  const [stageInit, setStageInit] = useState(1);
  const [from, setFrom] = useState<"stages" | "hangar">("stages");

  const go = (s: Screen) => {
    setWipe((w) => w + 1);
    window.setTimeout(() => {
      setScreen(s);
      // 切換畫面後強制整頁重新合成，清掉 GPU 合成層殘影
      // （關卡圖卡等被提升的圖層偶爾會卡在舊畫面、散不掉，直到重整才消失）
      requestAnimationFrame(() => {
        const root = document.getElementById("root");
        if (!root) return;
        root.style.willChange = "transform";
        root.style.transform = "translateZ(0)";
        requestAnimationFrame(() => {
          root.style.transform = "";
          root.style.willChange = "";
        });
      });
    }, 260);
  };

  // 音量同步
  useEffect(() => {
    audio.setVolumes(save.settings.bgm, save.settings.sfx);
  }, [save.settings.bgm, save.settings.sfx]);

  // 第一次互動後啟動音訊與選單 BGM
  useEffect(() => {
    const start = () => {
      audio.init();
      audio.playBgm(0);
    };
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, []);

  useEffect(() => {
    if (screen !== "game") audio.setTheme(0);
  }, [screen]);

  const startRun = (stageId: number, diff: number) => {
    setRun({ stageId, diff, key: Date.now() });
    go("game");
  };

  return (
    <div className="fixed inset-0 bg-[var(--ink)] overflow-hidden">
      {screen === "menu" && (
        <MainMenu
          go={(s) => {
            setStageInit(1);
            setFrom(s);
            go(s);
          }}
          onEndless={() => {
            setStageInit(0);
            setFrom("stages");
            go("stages");
          }}
          onSettings={() => setSettings(true)}
        />
      )}
      {screen === "hangar" && <Hangar onBack={() => go(from === "hangar" ? "menu" : "stages")} onSortie={() => go("stages")} />}
      {screen === "stages" && <StageSelect key={stageInit} initial={stageInit} onBack={() => go("menu")} onHangar={() => { setFrom("stages"); go("hangar"); }} onStart={startRun} />}
      {screen === "game" && run && (
        <GameScreen
          key={run.key}
          shipId={save.sel}
          stageId={run.stageId}
          diff={run.diff}
          onExit={() => {
            setStageInit(run.stageId);
            go("stages");
          }}
          onRetry={() => setRun({ ...run, key: Date.now() })}
          onNext={run.stageId > 0 && run.stageId < 6 ? () => { setStageInit(run.stageId + 1); startRun(run.stageId + 1, run.diff); } : undefined}
        />
      )}
      {settings && <SettingsModal onClose={() => setSettings(false)} />}
      {/* P5 風格轉場 */}
      {wipe > 0 && (
        <div key={wipe} className="absolute inset-0 z-[70] pointer-events-none">
          <div className="absolute inset-0 bg-[var(--red)]" style={{ animation: "wipeIn .62s cubic-bezier(.6,0,.3,1) both" }} />
          <div className="absolute inset-0 bg-black" style={{ animation: "wipeIn .62s .07s cubic-bezier(.6,0,.3,1) both" }} />
          <div className="absolute inset-0 grid place-items-center" style={{ animation: "wipeIn .62s .14s cubic-bezier(.6,0,.3,1) both" }}>
            <div className="disp text-6xl text-white -skew-x-12 tracking-[0.3em]">ZENITH RIOT</div>
          </div>
        </div>
      )}
    </div>
  );
}
