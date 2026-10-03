// 所有美術素材集中匯入（singlefile 建置時會自動內嵌成 base64）
import type { CSSProperties } from "react";
import menuKey from "./assets/menu_key.jpg";
import pilotsA from "./assets/pilots_a.jpg";
import pilotsB from "./assets/pilots_b.jpg";
import bgCity from "./assets/bg_city.jpg";
import bgOcean from "./assets/bg_ocean.jpg";
import bgIce from "./assets/bg_ice.jpg";
import bgVolcano from "./assets/bg_volcano.jpg";
import bgCyber from "./assets/bg_cyber.jpg";
import bgSpace from "./assets/bg_space.jpg";
import bossSheet from "./assets/boss_sheet.jpg";

export const IMG = {
  menuKey,
  pilotsA,
  pilotsB,
  bossSheet,
};

// 關卡背景圖（鍵值供背景系統與關卡資料引用）
export const BG_SRC: Record<string, string> = {
  city: bgCity,
  ocean: bgOcean,
  ice: bgIce,
  volcano: bgVolcano,
  cyber: bgCyber,
  space: bgSpace,
};

/** 機師立繪：每張圖三格等寬（約 512x1024），回傳 CSS 背景定位 */
export function pilotStyle(sheet: "a" | "b", col: number): CSSProperties {
  return {
    backgroundImage: `url(${sheet === "a" ? pilotsA : pilotsB})`,
    backgroundSize: "300% 100%",
    backgroundPosition: `${col * 50}% 0%`,
    backgroundRepeat: "no-repeat",
  };
}

/** Boss 設定圖：3 欄 x 2 列，每格約 512x512 */
export function bossArtStyle(idx: number): CSSProperties {
  const col = idx % 3;
  const row = Math.floor(idx / 3);
  return {
    backgroundImage: `url(${bossSheet})`,
    backgroundSize: "300% 200%",
    backgroundPosition: `${col * 50}% ${row * 100}%`,
    backgroundRepeat: "no-repeat",
  };
}

/** 預載圖片並回傳 HTMLImageElement（供 Canvas 背景使用） */
const imgCache: Record<string, HTMLImageElement> = {};
export function loadBg(key: string): HTMLImageElement {
  if (imgCache[key]) return imgCache[key];
  const im = new Image();
  im.src = BG_SRC[key];
  imgCache[key] = im;
  return im;
}
