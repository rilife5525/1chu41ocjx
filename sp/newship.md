### 擴充遷移的代碼規範
## 核心規則
1. **資料驅動**：新增內容 = 資料 + 對應 register/case，不為單一內容建立平行系統。
3. **固定名稱不可改**：schema、欄位、key、index 語意、SFX 名稱均視為跨專案 API。
4. 程式註解與 UI 文案使用繁體中文（台灣用語）；程式名稱使用英文。
## 機體
每機體必有：
skills/<key>.ts
ShipDef
draw<Key>()
KITS[ShipId]

`ShipKit` 固定生命週期：
```ts
init(g)
update(g,dt)
fire(g,dt)
castActive(g)
castUlt(g)
onKill?
onHit?
onGraze?
onPlayerHit?
updateBullet?
drawUnder?
drawOver?
```
`ShipDef` 固定：
```ts
{
  id,name,en,sigil,sigilEn,pilot,pilotEn,role,
  color,color2,dark,quote,lore,
  portrait:{sheet,col,focus,cropR?,focusX?,zoom?},
  base:{hp,spd,atk,rate},
  radar:{atk,spd,def,rng,ease},
  activeCd,ultTime,
  skills:{weapon,passive,active,ult},
  cut:{line1,line2},
  cutin:{c1,c2,c3,angle}
}
```
固定技能：
```text
SKILL_KEYS = weapon, passive, active, ult
永久上限 5；局內上限 7；進化 Lv3/5/7
```
技能等級／機體自訂狀態遵守：
```text
p.s.* = 共用數值，由裝備／卡片修改
p.k   = 機體自訂狀態
```
繪製：
`drawShip` 必須接上 `draw<Key>`；使用中心原點、機首朝上；必須呼叫 `drawGear(ctx,o,false)` 與 `drawGear(ctx,o,true)`。
## 機體：骨架（只保留接線結構；招式／數值／特效／立繪／音效全刪成 `…`）
**以下骨架為空範本，刻意不含任何具體招式與數值**——所有 `…` 處只是佔位值，要自創。
### 必要 import（照抄；路徑以此為準）
```ts
import { H, TAU, W, clamp, easeOut, rand } from "../constants";
import { audio } from "../audio";
import { evoTier } from "../data/ships";
import { PAL } from "../render/fx";
import { makeOpts, drawShip } from "../render/shipDraw";
import { glow } from "../render/sprites";
import { drawGear } from "../render/shipUtil";
import { boltFx, mkFx } from "./common";
import type { ShipKit } from "./common";
import type { Game } from "../engine/Game";
import type { Enemy, PBullet } from "../entities";
```
### Kit 骨架（引擎 API 雛形；`…` 處全自創）
```ts
export const <key>Kit: ShipKit = {
  init(g) {
    // g.p.k = 機體自訂狀態袋（只放本機自己的欄位）
    g.p.k = { /* …本機自訂欄位… */ };
  },

  // 主武裝：dt 累積射擊間隔
  fire(g, dt) {
    const p = g.p;
    const wl = g.lvl("weapon");   // 火力 1..7
    const tier = evoTier(wl);     // 進化階 0/1/2/3（對應 Lv3/5/7）
    p.fireT += 0.15 / p.s.rate;    // 間隔 = 秒 / 射速倍率
    // 子彈數、扇形張角、發射點、精靈 style、dmg 全自創
    for (let i = 0; i < n; i++) {
      g.spawnPB(x, y, ang, spd, style, dmg, { r, kind, pierce, homing, life, src });
    }
  },

  // 被動／持續效果：每幀；形態結束要回複 p.form=0、p.dmgMul/speedMul=1
  update(g, dt) { /* …自訂範圍、狀態、形態… */ },

  // 擊墜回調（被動多在此觸發）
  onKill(g, e) { /* g.aoe(e.x,e.y,r,dmg,{pal,burn,noText}); g.addUlt(n); */ },

  // 子彈命中回調（只自訂 kind 才需要）
  onHit(g, b, e) { /* if (b.kind === …) { … } */ },

  // 主動技：冷卻引擎已算；此處放招式
  castActive(g) {
    const al = g.lvl("active"); const tier = evoTier(al);
    audio.sfx("active");
    // 自訂時序演出：mkFx 自累 t；加亮走 g.fx.*、特效色走 PAL.*
    mkFx(g, 1, (dt) => { t += dt; /* …傷害／清彈… */; return t < dur; },
         (ctx) => { /* …自創特效畫法… */ });
  },

  // 奧義：引擎已鎖 ultBusy＋無敵；此處放特效與範圍傷害
  castUlt(g) {
    const ul = g.lvl("ult"); const tier = evoTier(ul);
    const p = g.p;
    p.form = 1; p.formT = …; p.inv = Math.max(p.inv, 3.5);
    audio.sfx("ultgo"); g.flash(…); g.tint(…); g.shake(…);
    /* …自訂演出；範圍傷害 g.aoe / g.damageEnemy… */
  },

  // 機體上／下自繪層（可選）
  drawUnder(g, ctx) { /* …自創… */ },
  drawOver(g, ctx) { /* …自創… */ },
};
```
### 進階簽名（當需要自訂子彈／敵彈操控時。沒有則免）
```ts
// 自訂子彈：spawnPB 帶 kind>=20，再實作 updateBullet 自己推進
updateBullet(g, b, dt) { if (b.kind === 20) { /* …位移／吸引／爆炸… */; b.alive = false; } }
// 擦彈回調：onGraze(g) { g.addUlt(n); }
// 直接操敵彈池（慢速／偏折）：for (const b of g.eb.items) if (b.alive) b.slow = …;
```
### 真實 API（只列現有能編譯的寫法）
```text
g.spawnPB(x,y,ang,spd,style,dmg,o?)       // o.dmg 會寫死、不乘 dmgMult；預設 dmg 才乘
g.damageEnemy(e,dmg,{noText?,noHitFx?,crit?})   // 自動走 combo/掉落/kill
g.aoe(x,y,r,dmg,{pal?,burn?,slow?,noFx?,noText?,skip?})
g.nearest(x,y,maxD?,filter?)
g.clearBullets(x,y,r,"none"|"score"|"coin",colX?,colW?,bandY?,bandH?)
特效：mkFx(g,layer 0|1|2,update,draw)；加亮 g.fx.glowP/spark/burst/explosion/ring/hit + PAL.*（不在 g 上）
音效：audio.sfx("shoot0|boom_m|active|ultgo|…", vol?)（不在 g 上）
排程：g.later(sec,fn)；定時演出用 mkFx 自累 t；禁用 beginUlt / g.parts.emit（那些不存在）
g.lvl("weapon|passive|active|ult")；進化階 evoTier(lv)
玩家：g.p.{x, y, fireT, power, ult, inv, form, formT, dmgMul, speedMul, k}
```
### 接線 7 點（少一點就編譯失敗；Record<ShipId,ShipDef> 會強制必填）
1. `types.ts`：`ShipId` 聯合 + `SHIP_IDS` 各加 1 個 id
2. `data/ships.ts`：`SHIPS[id]` 條目；`portrait.sheet` 只用 "a".."d"，每 skill 要 `icon`+`evo[3]`
3. `render/shipDrawX.ts`：`draw<Key>(ctx,o)` 外殼（中心原點、機首朝上；開 `drawGear(ctx,o,false)`、結 `drawGear(ctx,o,true)`；進化用 `o.tier`，不是 weaponLv）
4. `render/shipDraw.ts`：import + `switch` 加 case
5. `skills/<key>.ts`：kit（上面骨架）
6. `engine/Game.ts`：import + `KITS` 表加 `<key>: <key>Kit`
### 數值尺度錨（防差 10 倍）
```text
base = { hp ~100, spd ~330, atk ~1.0, rate ~1.0 }；radar 0..5；activeCd ~9-14；ultTime ~40-50
每發子彈 dmg 8~40；aoe 依範圍 20~300
```
## Engine 公開面
Kit 只能使用宿主公開 API，不自行重造引擎功能。
核心 API：
```ts
g.spawnPB(...)
g.damageEnemy(...)
g.aoe(...)
g.nearest(...)
g.clearBullets(...)
g.dropPickup(...)
g.heal(...)
g.addUlt(...)
g.addPower(...)
g.dmgMult()
g.lvl(...)
g.shake(...)
g.flash(...)
g.tint(...)
g.slowmo(...)
g.later(...)
g.addFx(...)
g.toast(...)
```
`src` 固定：
```text
0 主武器
1 子機體
2 技能
```
`kind >= 20` 保留給 `updateBullet`。
## 子彈
`PBullet` 欄位語意固定；`style` 對應 `pbStyles`。
```text
style 0~22 = 跨專案保留，禁止修改
新 style 一律從 23 開始
kind >= 20 = Kit 自訂位移
```
## 關卡
`StageDef` 固定欄位：
```ts
{
  id,name,en,sub,desc,
  bgs,mix,kind,kindB,grade,cloudCol,
  theme,boss,mid,pool,heavy,events,
  hpMul,len,music,rec,reward,accent
}
```
事件：
```text
meteor lightning gale laserGrid torpedo rush
```
新增事件必須同步 `HAZARD_INFO` + `updateHazards`。

## 敵人／Boss
`EnemyDef`：
```ts
{id,name,hp,r,spd,score,exp,ai,size,ground?,mid?}
```
新增敵人必須同步：
```text
ENEMIES[key]
enemyDraw.DRAW[key]
enemyAI case
```
AI：
```text
straight sine swoop hover spinner heavy dive turret mine
sniper laser ghost carrier aegis orbit mid
```
`BossDef`：
```ts
{id,name,title,hp,r,art,color,quote}
```
新增 Boss 必須同步 `BOSSES`、`bossAI`、`bossDraw`。
## 裝備
以下名稱永久固定：
```text
SlotId = weapon, armor, engine, core, chip, emblem
StatKey = atk, hp, spd, cd, ult, crit, exp, coin, rate, drop
Rarity = R, SR, SSR, UR
```
`EquipItem`：
```ts
{
  id,slot,rarity,lv,name,icon,
  main:{stat,v},
  subs:{stat,v}[],
  proc?,locked?
}
```
固定資料：
```text
SLOT_INFO
STAT_INFO
RARITY_INFO
PROCS
```
固有技 = `PROCS` 資料 + `equipProcs` 對應邏輯。
## 卡片
```ts
{
  id,name,
  desc:(n)=>string,
  rarity:0|1|2,
  max,icon,weight,
  apply:(g,n)=>void,
  skill?:SkillKey
}
```
## 音樂／音效
```ts
Theme = {
  bpm,root,scale,prog,
  bassPat,arpPat,kick,hat,lead
}
```
`bassPat`、`kick` 固定 16 格。
固定音樂索引：
```text
0 選單
1 關卡
2 關卡變奏
3 Boss
```
固定 SFX：
```text
shoot0~shoot5
hit boom_s boom_m boom_l
pickup coin power levelup evolve
active ultcut ultgo hurt graze
warning bossdie lightning laser charge lock
whoosh gear ui ui_hover ui_ok ui_back
clear fail morph black
```
## 可移植判定
內容必須能單獨搬移，不得依賴：
```text
UI 結構
頁面狀態
舊存檔格式的內部實作
其他內容的私有變數
專案特有的座標或硬編碼流程
```

```text
機體 = SkillKit + ShipDef + Draw
關卡 = StageDef + 背景 + Enemy/Boss/事件引用
敵人 = EnemyDef + Draw + AI
Boss = BossDef + BossDraw + BossAI
裝備 = EquipItem/資料 + Proc
卡片 = CardDef
音樂 = Theme + SFX
資源 = assets + register
```
**不要把內容寫死在引擎或 UI 裡。**