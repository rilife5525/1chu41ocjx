# SP 骨架包（分卷版）—— 索引

- 卷數：**22**（含本索引）
- 內容總位元組：**506,132**
- x01~x19 最大單卷：**29,059 bytes**（上限參數 28,500）

## 怎麼讀（先看這段）

1. **依序**抓：`x00_INDEX`（本檔）→ `s01`…（規範本體）→ `x01`…`xNN`（骨架）。一次一個檔，不要跳。
2. **本包把每個小於符號都寫成 `&lt;`** —— 抓取工具會把泛型與 JSX 標籤當成 HTML 標籤吃掉
   （實測：JSX 檔會被解析成破碎 HTML、**整份文件的開頭消失**）。
   **照抄時請還原：`&lt;` → 小於符號。** 大於符號與 `=>` 維持原樣。
3. 骨架檔以 `### FILE: 相對路徑` 開頭，內容為該檔原文。
4. 單檔太大會切成數段（標頭寫「第 N/M 段，自第 X 行起」），照順序接回去即可。
5. **單卷刻意壓在約 29 KB 以下**：實測讀取端在 38 KB 左右會截斷。
   某卷抓不完整就**回報該卷檔名**，不要自己猜內容。

## 卷別對照

| 卷 | 內容 | 涵蓋檔案 | bytes |
|---|---|---|---|
| `s01.md` | 規範本體 1/5 | `important.md` | 9,646 |
| `s02.md` | 規範本體 2/5 | `important.md` | 10,021 |
| `s03.md` | 規範本體 3/5 | `important.md` | 10,191 |
| `s04.md` | 規範本體 4/5 | `important.md` | 11,151 |
| `s05.md` | 規範本體 5/5 | `important.md` | 20,474 |
| `x01.md` | 契約與型別 | `src/game/types.ts` `src/game/constants.ts` `src/game/entities.ts` `src/game/save.ts` `src/assets.ts` `src/vite-env.d.ts` `src/utils/cn.ts` `src/main.tsx` | 22,481 |
| `x02.md` | 引擎 | `src/game/engine/Game.ts` | 21,734 |
| `x03.md` | 引擎 | `src/game/engine/Game.ts` | 21,940 |
| `x04.md` | 引擎 | `src/game/engine/Game.ts` `src/game/engine/player.ts` | 24,336 |
| `x05.md` | 引擎 | `src/game/engine/enemyAI.ts` `src/game/engine/bossAI.ts` `src/game/engine/patterns.ts` `src/game/engine/hazards.ts` | 29,059 |
| `x06.md` | 引擎 + 渲染 | `src/game/engine/equipProcs.ts` `src/game/input.ts` `src/game/engine/renderer.ts` | 27,636 |
| `x07.md` | 渲染 | `src/game/cutin.ts` `src/game/render/fx.ts` | 22,585 |
| `x08.md` | 渲染 | `src/game/render/bossDraw.ts` `src/game/render/enemyDraw.ts` | 25,744 |
| `x09.md` | 渲染 | `src/game/render/background.ts` `src/game/render/sprites.ts` | 24,570 |
| `x10.md` | 渲染 + 樣式 | `src/game/render/shipUtil.ts` `src/game/render/pbStylesExt.ts` `src/game/render/shipDraw.ts` `src/game/render/shipDrawA.ts` `src/game/render/shipDrawB.ts` `src/index.css` | 27,966 |
| `x11.md` | 技能（機體 kit） + 資料層 | `src/game/skills/common.ts` `src/game/skills/crow.ts` `src/game/skills/lance.ts` `src/game/skills/jade.ts` `src/game/skills/volt.ts` `src/game/skills/noir.ts` `src/game/skills/prism.ts` `src/game/data/stages.ts` `src/game/data/brand.ts` | 25,558 |
| `x12.md` | 資料層 | `src/game/data/enemies.ts` `src/game/data/ships.ts` `src/game/data/equipment.ts` `src/game/data/cards.ts` | 27,098 |
| `x13.md` | 資料層 + UI | `src/game/audio.ts` `src/App.tsx` | 16,724 |
| `x14.md` | UI | `src/ui/ui.tsx` `src/ui/MainMenu.tsx` | 24,206 |
| `x15.md` | UI | `src/ui/StageSelect.tsx` | 11,590 |
| `x16.md` | UI | `src/ui/GameScreen.tsx` | 26,909 |
| `x17.md` | UI | `src/ui/GameScreen.tsx` | 25,294 |
| `x18.md` | UI | `src/ui/Hangar.tsx` `src/ui/Settings.tsx` | 27,983 |
| `x19.md` | UI | `src/ui/icons.tsx` `src/ui/iconsExt.ts` | 7,331 |

## 跨卷被切段的檔案

- `src/game/engine/Game.ts` 切成 **3** 段（單檔超過上限），散在對應卷中
- `src/ui/GameScreen.tsx` 切成 **2** 段（單檔超過上限），散在對應卷中

## 注意

- 本包是**骨架**：六台基礎機體的外觀為 `placeholderShip()`、技能為 40 行骨架；
  關卡／敵人／音樂／裝備／固有技只留**契約與詞彙表**，實際數值已抽掉。
- 規範本體＝`s01`…（即 `important.md`），是唯一的規格來源。
