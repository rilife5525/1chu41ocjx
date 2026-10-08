# SP 骨架包（x.txt 分卷版・Markdown）—— 索引

> 由 `SP/_xsplit.mjs --md` 從 `SP/x.txt` 切出。
> 每個檔案包在 ``` 圍籬內 → 就算抓取工具跑 Readability，原始碼也會被當成 `<pre><code>` 保留，不會被吃掉。

- 卷數：**15**（含本索引）
- 內容總位元組：**467,195**
- 最大單卷：**39,577 bytes**（上限參數 39,250）

## 怎麼讀

1. **依序**抓 `x01` → `xNN`，一次一個檔，不要跳。
2. 每個檔開頭有 `上一卷 / 下一卷`，照著走就不會漏。
3. 每個檔內的 `### FILE: <相對路徑>` 是檔案邊界，內容為該檔原文。
4. 若某卷抓不完整（被截斷），**回報該卷檔名**，不要自己猜內容。

## 卷別對照

| 卷 | 內容 | 涵蓋檔案 | bytes |
|---|---|---|---|
| `x01.md` | 契約與型別 | `src/game/types.ts` `src/game/constants.ts` `src/game/entities.ts` `src/game/save.ts` `src/assets.ts` `src/vite-env.d.ts` `src/utils/cn.ts` `src/main.tsx` | 21,277 |
| `x02.md` | 引擎 | `src/game/engine/Game.ts` | 31,140 |
| `x03.md` | 引擎 | `src/game/engine/Game.ts` `src/game/engine/player.ts` | 35,054 |
| `x04.md` | 引擎 | `src/game/engine/enemyAI.ts` `src/game/engine/bossAI.ts` `src/game/engine/patterns.ts` `src/game/engine/hazards.ts` `src/game/engine/equipProcs.ts` `src/game/input.ts` | 34,117 |
| `x05.md` | 渲染 | `src/game/engine/renderer.ts` `src/game/cutin.ts` | 30,898 |
| `x06.md` | 渲染 | `src/game/render/fx.ts` `src/game/render/bossDraw.ts` `src/game/render/enemyDraw.ts` | 35,257 |
| `x07.md` | 渲染 | `src/game/render/background.ts` `src/game/render/sprites.ts` `src/game/render/shipUtil.ts` | 32,105 |
| `x08.md` | 渲染 | `src/game/render/pbStylesExt.ts` | 39,409 |
| `x09.md` | 渲染 + 樣式 + 技能（機體 kit） | `src/game/render/shipDraw.ts` `src/game/render/shipDrawA.ts` `src/game/render/shipDrawB.ts` `src/index.css` `src/game/skills/common.ts` `src/game/skills/crow.ts` `src/game/skills/lance.ts` `src/game/skills/jade.ts` `src/game/skills/volt.ts` `src/game/skills/noir.ts` `src/game/skills/prism.ts` | 32,364 |
| `x10.md` | 資料層 | `src/game/data/stages.ts` `src/game/data/enemies.ts` `src/game/data/ships.ts` `src/game/data/equipment.ts` | 34,529 |
| `x11.md` | 資料層 + UI | `src/game/data/cards.ts` `src/game/audio.ts` `src/App.tsx` `src/ui/ui.tsx` | 36,176 |
| `x12.md` | UI | `src/ui/MainMenu.tsx` `src/ui/StageSelect.tsx` `src/ui/GameScreen.tsx` | 39,577 |
| `x13.md` | UI | `src/ui/GameScreen.tsx` | 31,616 |
| `x14.md` | UI | `src/ui/Hangar.tsx` `src/ui/Settings.tsx` `src/ui/icons.tsx` `src/ui/iconsExt.ts` | 33,676 |

## 跨卷被切段的檔案

- `src/game/engine/Game.ts` 切成 **2** 段（單檔超過上限），散在對應卷中
- `src/ui/GameScreen.tsx` 切成 **2** 段（單檔超過上限），散在對應卷中

## 注意

- 本包是**骨架**：六台基礎機體的外觀為 `placeholderShip()`、技能為 40 行骨架；
  關卡／敵人／音樂／裝備／固有技只留**契約與詞彙表**，實際數值已抽掉。
- 搭配 `newship.md` 使用（規範本體）。
