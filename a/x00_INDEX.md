前言必讀

# 跨專案內容擴充契約
本專案產出的**機體／關卡／敵人／Boss／裝備／卡片／音樂**，必須能在**零改動**下搬進母專案。
## 1. 鐵則
1. **宿主介面凍結**：`Game`／`Player`／`Enemy`／`PBullet`／`EBullet`／`Beam`／`FxSys`／`PAL`／`audio`／
   `sprites`／`shipUtil`／`patterns`／`constants` 只能照 §3 的簽名呼叫，不得新增、刪除、改名、
   改參數順序或預設值。**自創＝搬移時必須寫一層轉接層，等於做白工。**
2. **禁止自創容器**：只有 `g.en.items`／`g.eb.items`／`g.pb.items`／`g.pk.items`／`g.beams.items`。
   **沒有** `g.enemies`／`g.pickups`／`g.player`／`g.zones`。宿主沒有的東西查 §3.9 用既有 API 組合。
3. **資料驅動**：新增內容＝資料＋既有 register/case，不為單一內容建平行系統。固定名稱（schema、欄位、
   key、index 語意、SFX／AI／事件名稱）皆為跨專案 API，不得改。
4. **宿主檔照抄、內容檔自創**（本條最容易做反）：
   - **宿主檔 → 逐字照抄骨架，不要重寫**：`Game.ts`／`renderer.ts`／`sprites.ts`／`shipUtil.ts`／
     `input.ts`／`entities.ts`／`assets.ts`／`save.ts`／`types.ts`／`index.css`／`ui/*.tsx`。
     骨架裡這些檔**就是母專案的實際檔案**——抄它才是可搬移的唯一做法。
   - **內容檔 → 只抄結構與接線，血肉一律自創**：`game/skills/<key>.ts`、`game/render/shipDraw<X>.ts`、
     `game/data/*.ts` 條目。骨架裡這些是**佔位**（`placeholderShip()`／`/* …自創… */`），
     不是範本。六台的招式結構讀起來一樣＝退回重做。
   - 本文件（`newship.md`）只給「介面與限制」，**刻意不附任何機體程式碼**。
5. **不要把內容寫死在引擎或 UI 裡**。註解與 UI 文案用繁體中文（台灣用語）；識別字用英文。
## 2. 專案骨架（路徑凍結）
```
src/
  main.tsx  App.tsx  index.css  assets.ts  vite-env.d.ts
  assets/                        ← 圖片素材（見 §10）
  game/
    constants.ts  audio.ts  entities.ts  types.ts  save.ts  input.ts  cutin.ts
    data/    ships.ts  enemies.ts  stages.ts  equipment.ts  cards.ts
    engine/  Game.ts  player.ts  enemyAI.ts  bossAI.ts  equipProcs.ts  hazards.ts  patterns.ts  renderer.ts
    render/  fx.ts  sprites.ts  shipUtil.ts  shipDraw.ts  shipDraw<X>.ts  enemyDraw.ts  bossDraw.ts  background.ts
    skills/  common.ts  <key>.ts
  ui/        照抄（母專案 UI 直接沿用；重寫會連帶把引擎帶歪，理由見下）   utils/  cn.ts
```
搬移只會動到：`game/skills/<key>.ts`、`game/render/shipDraw<X>.ts`、`game/data/*.ts` 條目、
`game/types.ts` 一行、`game/render/pbStylesExt.ts` 的追加條目、`ui/iconsExt.ts`。
**其餘檔案必須與母專案逐字相同**——尤其 `Game.ts`／`renderer.ts`／`sprites.ts`／`shipUtil.ts`／
`input.ts`／`entities.ts`／`assets.ts`／`save.ts`／`index.css`：**整份重寫＝搬不回去**（不報錯，
只是所有內容檔都會對不上宿主）。故所有相對 import 路徑都照上表推導。
## 3. 宿主介面（簽名凍結）
### 3.1 `Game`
```ts
```ts
g.p                                        // Player
g.ship: ShipDef                            // 本局機體資料（可讀 g.ship.id）
g.en.items: Enemy[]   g.eb.items: EBullet[]   g.pb.items: PBullet[]   g.pk.items: Pickup[]
g.beams.items: Beam[]  g.boss: Enemy | null
g.time: number        g.t: number          // 遊戲時間（受慢動作影響）
g.score: number
g.lvl(k: "weapon"|"passive"|"active"|"ult"): number          // 1..7
g.dmgMult(): number
g.spawnPB(x,y,ang,spd,style,dmg, o?: Partial<PBullet>): PBullet
g.spawnEB(x,y,ang,spd, type=0, color=0, o?: Partial<EBullet>): EBullet | null
g.spawnEnemy(id, x, y, o?: SpawnOpt): Enemy | null
g.addBeam(o: Partial<Beam> & {thunder?: boolean}): Beam
g.damageEnemy(e, dmg, o?: {noText?,noHitFx?,crit?,x?,y?}): boolean
g.aoe(x,y,r,dmg, o?: {pal?:string; burn?:boolean; slow?:number;
                      noFx?:boolean; noText?:boolean; small?:boolean; skip?:number}): number
g.nearest(x,y,maxD=9999, filter?:(e:Enemy)=>boolean): Enemy | null
g.clearBullets(x,y,r, mode:"none"|"score"|"coin"="none", colX?,colW?,bandY?,bandH?): number
g.dropPickup(x,y, kind:number, v:number, item?:EquipItem): void
g.heal(n)   g.addUlt(n)   g.addPower(n)
g.shake(a: number, t: number)               // ← (強度, 秒)
g.flash(color: string, a: number)           // ← (顏色, 強度)。順序與直覺相反，照抄
g.tint(color: string, a: number, dur: number)
g.slowmo(scale: number, dur: number)
g.later(sec: number, fn: ()=>void)
g.addFx(fx: Fx)                             // Fx = { alive, layer, update:(dt)=>void, draw }
g.toast(text: string, color?)
```
**射擊門控（語意）**：引擎每幀 `p.fireT -= dt`，`< -0.1` 時歸零，`<= 0` 時呼叫 `kit.fire`。
→ **射速＝你自己決定每次進入 `fire` 時把 `p.fireT` 加多少**（秒）。節奏設計完全由你決定。
### 3.2 特效
```ts
g.fx.glowP(x,y,vx,vy,life,size,color, size2?,drag?,a0?)
g.fx.spark(x,y,vx,vy,life,w,color, drag?)      g.fx.ring(x,y,r0,r1,life,color, width?)
g.fx.shard(x,y,vx,vy,life,size,color, grav?)   g.fx.smoke(x,y,vx,vy,life,size,size2, color?,a0?)
g.fx.burst(x,y,n,color,s0,s1,life, w?)         g.fx.cone(x,y,ang,spread,n,color,s0,s1,life, w?)
g.fx.explosion(x,y,size, pal?: Palette)        // ← 這裡收 Palette「物件」
g.fx.hit(x,y,color)                            g.fx.text(x,y,str,color?,size?,life?)
// 時序特效一律走 skills/common.ts：
mkFx(g, layer: 0|1|2, update: (dt)=>boolean, draw: (ctx)=>void): Fx
// update 回傳 false 即結束。layer 0 敵機下 / 1 敵機上 / 2 全螢幕最上
```
### 3.3 PAL
```ts
Palette = { core: string; mid: string; edge: string; smoke: string }
PAL 的鍵只有 9 個：fire ice elec void jade gold cyan red white
```
`g.aoe(...,{pal})` 收**字串鍵**（`"fire"`）；`g.fx.explosion(...,pal)` 收**物件**（`PAL.fire`）。
### 3.4 `audio`
```ts
audio.sfx(name: string, throttle = 0.04)    // ← 第二參數是「節流秒數」，不是音量
```
SFX 名稱只有這 36 個，新增即不可搬移：
```
shoot0 shoot1 shoot2 shoot3 shoot4 shoot5 | hit boom_s boom_m boom_l
pickup coin power levelup evolve | active ultcut ultgo hurt graze
warning bossdie lightning laser charge lock | whoosh gear ui ui_hover ui_ok ui_back
clear fail morph black
```
### 3.5 模組匯出契約（可用符號就是這些）
```
game/constants.ts
  W H TAU SAVE_KEY COLOR RARITY_COLOR DIFFS QUALITY QualityKey
  clamp lerp rand randi pick smooth easeOut easeInOut dist2 makeRng
  注意 rand 簽名是 rand(a=1, b?)：rand(5) → 0..5（不是 5..6）；rand(2,5) → 2..5

game/render/sprites.ts
  makeCanvas(w,h): HTMLCanvasElement
  glow(color: string, size=64): HTMLCanvasElement   ← 回傳 canvas，用 ctx.drawImage(glow(c,s),x,y,w,h)
  EB_COLORS: string[]   EB_R: number[]
  ebSprite(type,color): HTMLCanvasElement
  pbStyle(i): PBStyle                                ← 唯讀

game/render/shipUtil.ts
  Pt ShipDrawOpts   path fillPoly mirror lin rad flame bolt ring drawGear

game/render/shipDraw.ts
  ShipDrawOpts   makeOpts(id,t,tier,gear?): ShipDrawOpts   drawShip(ctx,id,o): void

game/skills/common.ts
  ShipKit  mkFx  boltFx  drawBars

game/data/ships.ts
  SHIPS  SKILL_KEYS  SKILL_LABEL  SKILL_MAX_PERM  SKILL_MAX_RUN  EVO_LEVELS
  ← 這 6 個匯出必須**原樣保留**（UI 直接引用）。少掉 SKILL_KEYS／EVO_LEVELS 不會報錯，
    但機庫與技能面板會空白。

ui/icons.tsx
  <Icon name="…"/> 的 name 是**自由字串**：找不到的鍵不報錯，只畫成預設星形（非致命、不擋編譯）。
  既有鍵沿用最省事（feather bolt phoenix orb prism web …）；自創更貼合招式也歡迎，
  但自創的**必須**集中在單一檔案 ui/iconsExt.ts：
      export const ICONS_EXT: Record<string, string> = { 鍵名: "24×24 的 SVG path d", … }
  搬移＝維護者把 ICONS_EXT 併進 icons.tsx 的 P（一個貼上的動作，可以事後再補）。
  ⚠ **icons.tsx 本體一個字都不得改**（它是母專案檔案，有 78 個既有圖示供 60 台機體共用）。
    把新圖示寫進 icons.tsx 會讓它們**不會被搬走**，合併後靜默變回預設星形。
```
### 3.6 實體欄位（完整 schema，禁止新增）
```
Player   x y hp maxHp shield maxShield inv fireT power s activeCd activeMax ult form
         formT morph bank thrust dmgMul speedMul drMul k:Record<string,any>
Enemy    alive dead uid def x y vx vy hp maxHp shield maxShield r t flash a b c d tm[] ph
         elite burn slow brand dir alpha invuln boss bossId theme scale freeze hpBar fireMul mark
PBullet  alive x y vx vy r dmg pierce life t style kind homing explode chain burn slow
         ramp rot spin a b c scale src hits[]
EBullet  alive x y vx vy r type color ang acc turn life t mode a b grazed dmg spd slow
         mode 0 直線 / 1 加速 / 2 轉向 / 3 地雷 / 4 延遲起動 / 5 波動
Beam     alive x y ang rot len w warn life t dmg color follow ox oy
Fx       { alive: boolean; layer: 0|1|2; update:(dt)=>void; draw:(ctx)=>void }
Pickup   alive x y vx vy kind v t mag item?        PK  EXP0 COIN1 POWER2 HEAL3 ULT4 SHIELD5 MAGNET6 GEAR7 CORE8
SpawnOpt { elite?; dir?; hpMul?; a?; b? }
```
機體私有狀態**只能**放 `g.p.k`（`init` 裡建）。
敵機私有狀態**禁止**直接掛 `e.xxx`（物件池會跨局洩漏）；需要時用 `WeakMap<Enemy, 你的狀態>`。

`Player.s`（`PStats`）＝**卡片與裝備唯一可改的數值表**。卡片的 `apply` 一律寫 `g.p.s.<欄位>`：
```
atk rate spd pierce extra crit critDmg homing explode chainHit burn slowHit
options magnet luck coinMul expMul grazeMul killHeal shieldRegen revive
overload comboWin cdMul ultMul vigor
```
**禁止**自創 `g.mods`／`g.stats` 之類的新容器——不會報錯，但卡片效果會全部失效。
### 3.7 敵彈彈幕（`engine/patterns.ts`，敵人與 Boss 開火一律走這裡）
```ts
aim(g,x,y): number
ring(g,x,y,n,spd, type=0,color=0, off=0, o?:Partial<EBullet>)
ringGap(g,x,y,n,spd,type,color, gapAng,gapW, off=0)
fan(g,x,y,n,spread,ang,spd, type=0,color=0, o?)
aimedFan(g,x,y,n,spread,spd, type=0,color=0, o?)
stream(g,x,y,ang,n, spd0,dSpd, type=0,color=0)
curtain(g,y,gapX,gapW,spd, type=1,color=0)
mine(g,x,y,ang,spd,fuse,n, color=1)
delayed(g,x,y,ang, delay,acc, type=0,color=0)
rndX()
```
### 3.8 內容型別契約
```
敵人繪製  render/enemyDraw.ts
          DRAW: Record<string, (ctx: CanvasRenderingContext2D, pal) => void>
          pal 欄位固定為 { h1, h2, ac, gl }（取自 THEME_PAL，見 §7）
          座標：設計空間 ±20（機身繪於此範圍內，會依 EnemyDef.size 縮放）
          enemySprite(id, theme): ESprite   drawEnemySprite(ctx, sp, x,y,scale,rot,flash,alpha?)
敵人 AI   engine/enemyAI.ts
          updateEnemy(g: Game, e: Enemy, dt: number): void   ← 單一函式內 switch(e.def.ai)
Boss      engine/bossAI.ts   updateBoss(g,e,dt)   updateMid(g,e,d,dt)
          render/bossDraw.ts drawBossBody(ctx, e, t, px, py)
固有技    data/equipment.ts  ProcDef = { id,name,desc, interval:number, color, rarity:"SSR"|"UR" }
          engine/equipProcs.ts  updateProcs(g: Game, dt: number): void   ← 內 switch(proc.id)
環境事件  engine/hazards.ts  HAZARD_INFO  startHazard(g,name,dur)  updateHazards(g,dt)
背景      render/background.ts  BgKind = "city"|"ocean"|"ice"|"volcano"|"cyber"|"space"
```
### 3.9 「宿主沒有」的正解對照表
| 想做的事 | 正解 | 禁止 |
|---|---|---|
| 掃描全部敵人 | `for (const e of g.en.items) if (!e.dead)` | `g.enemies` |
| 線段／光束傷害 | 自算「點到線段距離」再逐隻 `g.damageEnemy` | `g.segHit` |
| 單一縱向／橫向光束 | 逐隻 `g.damageEnemy`，或沿線取樣 `g.aoe` | `g.lineHit` |
| 敵彈全體減速 | `for (const b of g.eb.items) b.slow = 0.2` | `g.slowBullets` |
| 畫當前機體（殘影等） | `drawShip(ctx, g.ship.id, makeOpts(g.ship.id, t, tier))` | `g.shipOpts` |
| 奧義時長控制 | `p.form=1; p.formT=dur; p.inv=Math.max(p.inv,dur+1)` | `g.ultLeft`／`g.ultTotal` |
| 判斷奧義進行中 | `p.formT > 0` | `g.ultBusy` |
| 新子彈外觀 | `kind>=20` ＋ `updateBullet` 自繪（§5） | 改 `sprites.ts` 既有樣式 |
| 敵人／Boss 開火 | `engine/patterns.ts` 的既有函式 | 自寫彈幕生成器 |
### 3.10 型別落點與結構凍結（`types.ts` 禁改）
`types.ts` 是共用型別的唯一落點，但它的**結構完全凍結**：不得增刪任何 `interface` / `type` / `const`
的結構，**只允許修改下列純資料值**：
| 允許改 | 說明 |
|---|---|
| `ShipId` 的字串值 | 換成新機體 ID |
| `SHIP_IDS` 陣列元素 | 同步新 ID |
| 其他純資料值 | 如 `ShipDef` 的 `color`／`name`（`ShipDef` 的**定義**不在本檔，見下） |
**具體禁止（違反任一條＝結構破壞，需還原後重出）：**
- 不得在 `types.ts` 新增任何 `interface`。`ShipDef`／`SkillInfo`、`Player`、
  `Enemy` 等一律不放這裡，放母專案各檔案的位置：
  - `ShipDef`／`SkillInfo` → `data/ships.ts`（型別名**沿用 `SkillInfo`**，不得改名為 `SkillDef` 等）
  - `Enemy` 及實體（`PBullet`／`EBullet`／`Beam`／`Fx`／`Pickup` 等） → `entities.ts`
  - `Player` → `engine/player.ts`
- 不得把 `SkillLv` 改成 `Record<SkillKey, number>`，保持 `interface SkillLv` 原形狀。
- 不得刪 `SaveData`、`StageRecord`、`SkillLv`、`QualitySetting`。
- 不得在 `types.ts` 加 `import type { Game } from ...`（`Game` 是執行期類，不是型別來源）。
**同一條凍結延伸到其他內容型別**（定義位置見 §3.8；只准改值，不准改欄位名或型別）：
- `StageDef`／`TEvent`／`SpawnOpt`（`data/stages.ts`）：`boss` 必須是 **BOSSES 的數字索引**、
  `music` 是 **THEMES 的數字索引**、`theme` 是 **THEME_PAL 的數字索引**、`reward` 是**數字**、
  敵人 `size` 是**像素**（不是倍率）。也不得自創 `BgKind`／事件名（§3.8／§6）。
- `EnemyDef`／`BossDef`（`data/enemies.ts`）：`id` 是 `enemyDraw.enemySprite` 的繪製詞彙、
  `ai` 必須是 `enemyAI.ts` 既有的值；`art` 必須是自有 `boss_sheet` 的格位索引。
- `ProcDef`（`data/equipment.ts`）：新增固有技必須**同時**改三處——`PROCS`、
  `engine/equipProcs.ts` 的 `run()` switch、以及 `updateProcs()` 內的 `needTarget` 清單
  （攻擊型才需目標）。漏改**不會報錯**，只會靜默失效（招式不出現／沒目標也放）。
- `Theme`（`audio.ts`）：欄位與型別不得改，只改數值；`THEMES` 數量可增（索引自 §10 起算）。
## 4. 機體
### 4.1 生命週期（語意，**不給程式碼**）
| 成員 | 時機 | 職責與限制 |
|---|---|---|
| `init(g)` | 開局一次 | 建立 `g.p.k`；只准寫 `g.p.k` |
| `update(g,dt)` | 每幀 | 被動、持續效果、形態計時。形態結束必須復原 `p.form=0`、`p.formT=0`、`p.dmgMul=1`、`p.speedMul=1` |
| `fire(g,dt)` | 每幀（`p.fireT<=0`） | 主武裝；節奏自己用 `p.fireT` 累加控制 |
| `castActive(g)` | 引擎判定觸發後 | 主動技；冷卻與無敵由引擎處理，別自己做 |
| `castUlt(g)` | cut-in 演出結束後 | 奧義；引擎已鎖無敵，時長用 `p.formT` |
| `onKill(g,e)` | 擊墜時 | 被動多在這裡 |
| `onHit(g,b,e,dmg)` | 我方子彈命中 | 只處理自己的 `kind`。**四參數，第 4 個是 `dmg`** |
| `onGraze(g)` / `onPlayerHit(g)` | 擦彈／玩家受傷 | `onPlayerHit` **零參數** |
| `updateBullet(g,b,dt)` | 每幀，僅 `b.kind>=20` | 自訂子彈位移／引爆；只處理自己的 `kind` |
| `drawUnder` / `drawOver(g,ctx)` | 每幀繪製 | 機體下／上層；只准畫自己的東西 |
| `preview?(t)` | 機庫預覽（可選） | 回傳 `{mode,aux}` |
### 4.2 `ShipDef`（欄位凍結）
```ts
{
  id,name,en,sigil,sigilEn,pilot,pilotEn,role,
  color,color2,dark,quote,lore,
  portrait:{focus,focusX?},             // 單張立繪（見 §10）：focus 垂直 0=頂、focusX 水平（預設 0.5）
  base:{hp,spd,atk,rate},
  radar:{atk,spd,def,rng,ease},
  activeCd,ultTime,
  skills:{weapon,passive,active,ult},   // 元素型別名＝SkillInfo；每個都要 name,en,icon,desc,evo[3]
  cut:{line1,line2},
  cutin:{c1,c2,c3,angle}
}
```
`cutin.angle` 單位是**弧度**（不是度）。`skills.*.evo` 固定 3 條（Lv3/5/7）。
技能等級：`SKILL_KEYS = weapon, passive, active, ult`；永久上限 5、局內上限 7；進化 Lv3/5/7。
數值尺度錨（防差 10 倍）：`base = {hp ~100, spd ~330, atk ~1.0, rate ~1.0}`；`radar` 0..5；`activeCd` 9~14；
`ultTime` 40~50；每發子彈 dmg 8~40；`aoe` 依範圍 20~300。
### 4.3 繪製契約
- `render/shipDraw.ts` 的 `switch` 要接上你的 `draw<Key>`。
- 座標：**中心原點、機首朝上**；機身約佔 ±36 × ±44。
- 必須呼叫 `drawGear(ctx, o, false)`（機體之前）與 `drawGear(ctx, o, true)`（機體之後）。
- 進化外觀用 `o.tier`（0~3），**不是** weaponLv。
- `o.gear` 是六格稀有度 `number[]`（weapon,armor,engine,core,chip,emblem，值 0~4）。
### 4.4 接線（少一點就編譯失敗；`Record<ShipId,ShipDef>` 會強制必填）
1. `game/types.ts`：`ShipId` 聯合 ＋ `SHIP_IDS` 各加 1 個 id
2. `game/data/ships.ts`：`SHIPS[id]` 條目
3. `game/render/shipDraw<X>.ts`：`draw<Key>(ctx,o)`
4. `game/render/shipDraw.ts`：import ＋ `switch` 加 case
5. `game/skills/<key>.ts`：`export const <key>Kit: ShipKit = { … }`
6. `game/engine/Game.ts`：import ＋ `KITS` 表加 `<key>: <key>Kit`
### 4.5 多樣性要求（反同質化，強制）
**禁止**：以「扇形齊射＋追蹤＋貫穿＋全屏爆炸」為預設組合；沿用任何既有作品的招式名稱或機制（全部原創命名）；
讓同一批機體的 `init`／`fire`／`update`／`castUlt` 呈現同一種結構。
**要求**：先為每台機體寫下**一句話機制**（例：「以自身為軸的迴旋刀刃，去程與回程都吃傷害」），再照它實作。
同一批內，**任兩台不得在 3 個以上維度選到同一型**：
| 維度 | 可選型（可自創，但要說得出型名） |
|---|---|
| 彈道拓撲 | 單線／並列／扇形／螺旋／環繞／迴旋／拋物／分段／連鎖／牽引 |
| 命中行為 | 貫穿／彈跳／追蹤／濺射／殘留／延遲引爆／標記／吸血／轉化 |
| 節奏 | 定頻／蓄力／連發後長歇／雙軌交替／變頻 |
| 被動觸發源 | 擊墜／擦彈／受擊／時間／位置／彈幕量／連擊 |
| 主動技機制 | 位移／領域／召喚／投射／轉換／控制 |
| 奧義結構 | 單段／多段／領域／審判／變身／召喚 |
**驗收**：把六台的一句話機制排出來，若讀起來像同一台機體的六種數值微調，就退回重做。
## 5. 子彈與敵彈配額
```
我方子彈 style
  0~22   跨專案保留。禁止修改、禁止重定義、禁止改色改尺寸。**實際清單見下表，逐條照抄。**
  23+    新樣式一律集中在單一檔案 game/render/pbStylesExt.ts，**接在檔案既有條目之後**：
            export const EXT_BASE = 23;            // 母專案既有槽，禁止修改
            export const EXT_BASE_<代號> = 170;    // ← 你的批次槽（可用區間見 §10）
            export const EXT_STYLES: { id:number; w:number; h:number;
                                       draw:(ctx)=>void; dir?:boolean; spin?:boolean }[]
          機體引用一律寫 EXT_BASE_<代號> + n，禁止寫死數字、禁止沿用 EXT_BASE
          dir＝貼齊飛行方向、spin＝原地自轉（語意同 §5.1 的「旋轉」欄位）；兩者皆省略＝固定朝上
我方子彈行為   kind >= 20 = 保留給 kit 自訂位移（需實作 updateBullet）；src = 0 主武器 / 1 僚機 / 2 技能
敵彈           type 0~6、color 0~6 固定（EB_R / EB_COLORS 已定），禁止新增
```
### 5.1 子彈 style 0~22 的固定清單（**逐條照抄，不得自創**）
`w × h` 是精靈畫布尺寸；繪製原點在畫布中心、彈頭朝上（-y）。
`旋轉` 欄位＝該樣式在 dst 的旋轉方式，對應 `mk(w,h,draw,dir,spin)` 的後兩個引數：
`對齊`（＝預設，`dir:true, spin:false`，貼齊飛行方向）／`自轉`（`dir:false, spin:true`，原地自轉）／
`固定`（`dir:false, spin:false`，永遠朝上不轉）。
| id | w×h | 形狀與配色 | 旋轉 |
|---|---|---|---|
| 0 | 26×46 | 焰羽：橙色光暈＋火焰水滴（白→橙→紅漸層） | |
| 1 | 56×80 | 大型火球：金色光暈＋大火燄水滴 | |
| 2 | 18×18 | 餘燼火星：圓形，淡黃→橙 | 固定 |
| 3 | 20×80 | 光矛：藍色光暈＋長針（白→青藍） | |
| 4 | 14×52 | 側翼細矛：藍白細針 | |
| 5 | 56×40 | 風刃：綠色新月（白→翠綠） | |
| 6 | 26×26 | 氣旋：白綠圓＋白色弧線 | 自轉 |
| 7 | 18×34 | 電弧彈：紫光暈＋針（黃白→紫） | |
| 8 | 30×30 | 極性雷彈：紫白圓＋黃色閃電折線 | 自轉 |
| 9 | 60×60 | 暗物質彈：紫光暈＋黑色核心＋雙弧 | 自轉 |
| 10 | 14×40 | 暗影針：紫針（淡紫→紫） | |
| 11 | 18×36 | 稜鏡脈衝：藍色雙層菱形 | |
| 12 | 18×40 | 追蹤微型飛彈：白色彈體＋青色鼻錐＋尾焰 | |
| 13 | 16×46 | 加特林彈：金橙光暈＋針 | |
| 14 | 30×60 | 火箭：白色彈體＋橙色鼻錐＋尾焰 | |
| 15 | 18×18 | 折射稜鏡彈：白青圓 | 自轉 |
| 16 | 12×26 | 僚機彈：淡藍細針 | |
| 17 | 14×40 | 曳光彈：金黃光暈＋針 | |
| 18 | 70×46 | 弧焰：橙金新月 | |
| 19 | 70×70 | 大型火球：橙金大圓 | 自轉 |
| 20 | 22×22 | 雷球：白金圓 | 自轉 |
| 21 | 40×28 | 風刃：白綠新月 | |
| 22 | 20×32 | 紫雷彈：紫光暈＋針 | |
## 6. 關卡
```ts
StageDef = { id,name,en,sub,desc, bgs:[string,string], mix:[number,number],
             kind,kindB, grade:[string,string,string], cloudCol,
             theme,boss,mid,pool,heavy,events, hpMul,len,music,rec,reward,accent }
SpawnOpt = { elite?; dir?; hpMul?; a?; b? }
```
- `bgs` 的鍵只能取自 `BgKind` 六種；`kind`／`kindB` 也是。
- 事件只有 6 種，新增即不可搬移：`meteor lightning gale laserGrid torpedo rush`
  新增事件必須同步 `HAZARD_INFO` ＋ `updateHazards`。
- 關卡腳本事件型別 `TEvent` 只有這 7 種：
  `{t,k:"spawn",e,x,y,o?}`／`{t,k:"event",name,dur}`／`{t,k:"mid"}`／`{t,k:"boss"}`／
  `{t,k:"banner",text,sub?}`／`{t,k:"flyby",kind}`／`{t,k:"waitMid"}`，由 `buildTimeline` 產生。

## 7. 敵人／Boss
```ts
EnemyDef = { id,name,hp,r,spd,score,exp,ai,size, ground?,mid? }
BossDef  = { id,name,title,hp,r,art,color,quote }
THEME_PAL 每組欄位固定為 { h1, h2, ac, gl }。母專案 0~5 已佔用；
           你的專案要寫「0~5 佔位（照抄母專案數值即可）＋ 6~11 你自己的 6 組」共 **12 組**，
           合併時維護者只取 6~11。索引＝StageDef.theme（你的關卡用 6~11）。
```
新增敵人同步三處：`ENEMIES[key]`、`enemyDraw.DRAW[key]`、`enemyAI` 的 case。
新增 Boss 同步：`BOSSES`、`bossAI`、`bossDraw`。`art` 是設定圖索引（0~5 已佔用，見 §10）。
AI 名稱只有這些：
```
straight sine swoop hover spinner heavy dive turret mine
sniper laser ghost carrier aegis orbit mid
```
## 8. 裝備／卡片
```
SlotId  = weapon, armor, engine, core, chip, emblem
StatKey = atk, hp, spd, cd, ult, crit, exp, coin, rate, drop
Rarity  = R, SR, SSR, UR
EquipItem = { id,slot,rarity,lv,name,icon, main:{stat,v}, subs:{stat,v}[], proc?,locked? }
CardDef   = { id,name, desc:(n)=>string, rarity:0|1|2, max,icon,weight, apply:(g,n)=>void, skill?:SkillKey }
```
固定資料表：`SLOT_INFO`、`STAT_INFO`、`RARITY_INFO`、`PROCS`、`CARDS`。
固有技＝`PROCS` 資料（`ProcDef`，見 §3.8）＋ `equipProcs` 的 case。
## 9. 音樂／音效
```ts
Theme = {
  bpm:number; root:number;            // MIDI 根音
  scale:number[]; prog:number[];      // 音階（半音）／每小節和弦根音（音階度數）
  bassPat:number[]; arpPat:number[];  // 各 16 格
  kick:number[];                      // 16 格
  hat:number;                         // 0 無 / 1 閉 / 2 開   ← 是數字，不是陣列
  lead:boolean;                       // 有無旋律聲部        ← 是布林，不是陣列
}
```
`hat` 與 `lead` 的型別**最常被寫錯**（寫成陣列不會報錯，只是鼓與旋律整首消失）。
固定音樂索引：`0 選單 / 1 關卡 / 2 關卡變奏 / 3 Boss`。新專案要多一首從 **4** 起接續，不得插入或改動 0~3。
## 10. 資源與槽位配額（防撞）
以下每一項撞到**都不會報錯**，只會靜默顯示錯內容——這正是必須照抄的理由。
`<code>`＝你專案的 2~4 字母代號，須與母專案已佔用者不同（`a b c d e f 1 2`），並在交付說明標明。
```
立繪       自帶 assets/portraits/<shipId>.jpg（1080×1920 單張 9:16，**每台一張**，檔名＝機體 id），
           並在 assets.ts 的 PORTRAIT_SRC 註冊（鍵＝shipId）
           ← 缺鍵不報錯，只顯示空白框。**不是圖集**，沒有 portrait.sheet／col
奧義背景   自帶 assets/ult/<shipId>.jpg（**每台一張**，奧義全螢幕背景），註冊進 ULT_BG_SRC
           ← 缺鍵不報錯，奧義背景全黑
敵人 id    加前綴 <code>_                      ← 撞鍵＝其中一邊的 ENEMIES 條目被靜默吃掉
關卡 theme 從 6 起（母專案 0~5）               ← 合併時 THEME_PAL 要同步擴到 12 組（§7），
                                                 否則 theme % THEME_PAL.length 會把 6~11 繞回 0~5
音樂索引   從 4 起（母專案 0~3）               ← 撞到會被 clamp，播錯曲
Boss 設定圖 自帶 boss_sheet_<code>.jpg（母專案 3×2 的 art 0~5 已滿）
子彈樣式槽 從 170 起（見下方槽位表）           ← 撞號＝兩邊子彈外觀互蓋，不會報錯
背景／圖示配額見 §6／§3.5
```
素材一律經 `assets.ts` 註冊，不得在元件裡寫死路徑（`vite-plugin-singlefile` 會把 `import` 的圖轉 base64）。
### 10.1 禁用名單 ###
機體ID取名 不可使用
crow lance jade volt noir prism hizuki yagarasu tetsugaki gunsei souka
yumei hien soga tsukikage sumizome rinshin suiren aurora ember glacier
sakura umbra thunderbolt frost void aurum cinder gale rime surge hollow
homura hyakki shirayuki kokuyou kagari seiran yozora dealer hari fude
kaleido vesper zanshin tempus shirabe marionette tenbin pugna kiln lunate
oracle papilio tether
敵人ID取名 不可使用
scout dart wing sentry spinner heavy kami turret minelayer sniper
cruiser ghost carrier aegis orbiter mid_gunship mid_walker mid_cruiser
固有技取名 不可使用
orbital mend quake meteor aegis nova chrono halo reaper
除非你能做到非常頂級優秀，否則避免以下類型機種
鳳凰/不死鳥/赤鳥類型、坦克重裝類型、虛空黑洞等類型
主動或奧義不要做出根本無用的短距離衝刺瞬間結束型，避免作出無趣的位移技能
需要華麗連段或有趣的招式/奧義。
## 11. 可移植判定
內容必須能單獨搬移：不得依賴 UI 結構、頁面狀態、舊存檔格式的內部實作、其他內容的私有變數、
專案特有的座標或硬編碼流程。（各內容型別的組成見 §4／§6／§7／§8／§9。）
## 12. 交付前自檢
- [ ] 全檔沒有 §3.1 之外的 `g.` 成員（特別查 `g.enemies`／`g.segHit`／`g.lineHit`／`g.slowBullets`／`g.shipOpts`／`g.ultBusy`）
- [ ] `g.flash(color,a)` 順序對；`g.shake(a,t)` 兩參數；`aoe` 的 `pal` 是字串鍵、`fx.explosion` 的是 `PAL.*` 物件
- [ ] `audio.sfx` 第二參數沒被當音量；`mkFx` 四參數且 `update` 回傳 boolean
- [ ] `PAL` 只用 9 個鍵、欄位是 `core/mid/edge/smoke`；沒動到子彈 style 0~22
- [ ] **子彈 style 0~22 逐條照 §5.1 表實作**（沒有自創形狀、沒有改色、沒有改尺寸）
- [ ] `onHit(g,b,e,dmg)` 四參數、`onPlayerHit(g)` 零參數；`cutin.angle` 用弧度
- [ ] 敵人開火一律用 `patterns.ts`；背景只用 `BgKind` 六種；事件只用 6 種
- [ ] 立繪是 `assets/portraits/<shipId>.jpg` **單張**（不是圖集）且已註冊 `PORTRAIT_SRC`；
      奧義背景 `assets/ult/<shipId>.jpg` 已註冊 `ULT_BG_SRC`
- [ ] `EXT_STYLES` 的型別含 `dir?`/`spin?`；樣式 id 用 `EXT_BASE_<代號> + n`（從 170 起）、
      **沒有沿用 `EXT_BASE`**
- [ ] `Theme.hat` 是 `number`、`Theme.lead` 是 `boolean`（不是陣列）；`PROCS` 是 `Record<string, ProcDef>`（不是陣列）
- [ ] 卡片 `apply` 只改 `g.p.s.<欄位>`，沒有自創 `g.mods` 之類的容器
- [ ] `data/ships.ts` 的 `SKILL_KEYS`／`SKILL_LABEL`／`SKILL_MAX_PERM`／`SKILL_MAX_RUN`／`EVO_LEVELS` 都還在
- [ ] `ui/icons.tsx` 一個字都沒改（新圖示全在 `iconsExt.ts`）；字型名沿用 §3.5 的清單
- [ ] **`types.ts` 只動了 `ShipId`／`SHIP_IDS`／純資料值**：沒新增或刪除任何 interface、
      沒把 `SkillLv` 改成 `Record`、沒刪 `SaveData`／`StageRecord`／`QualitySetting`、
      沒有 `import type { Game }`（§3.10）
- [ ] `StageDef`／`EnemyDef`／`BossDef`／`ProcDef`／`Theme` 欄位名與型別一字未改
      （`boss`／`music`／`theme` 是數字索引、`reward` 是數字、`size` 是像素）
- [ ] 新增固有技時，`PROCS`＋`equipProcs.run()`＋`needTarget` 三處同步
- [ ] 六台的一句話機制排出來不像同一台的六種數值微調
- [ ] `tsc --noEmit` 乾淨、`vite build` 成功
- [ ] 交付說明列出「**實際讀過的骨架來源（卷號／檔名）**」；沒讀到的要明說，不得聲稱已依骨架實作

以下另附：
機體範本基礎數值參考
base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
hp:80~200
spd:240~440
atk:0.85~1.15
上下限不硬性限制，但不可讓平衡差距過大
rate:依能力設計浮動空間較大 0.8 ~ 2.0 但仍要注意機體間平衡
(評分標準滿分5分制：火力/機動/防禦/範圍/操作)
radar: { atk: 4, spd: 3, def: 3, rng: 4, ease: 4 },

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
