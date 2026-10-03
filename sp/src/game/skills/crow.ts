// 佔位機體 A：能力血肉已清空，僅保留 ShipKit 接線骨架。新增機體時照此填自創招式。
import type { ShipKit } from "./common";

export const crowKit: ShipKit = {
  init(g) {
    // 機體自訂狀態袋（只放本機自己的欄位）
    g.p.k = {};
  },

  // 武裝：dt 累積射擊間隔；子彈數、扇形張角、發射點、style、dmg 全自創
  fire(g, dt) {
    /* …自創主武裝… */
  },

  // 被動／持續效果：每幀；形態結束要回 p.form=0、p.dmgMul/speedMul=1
  update(g, dt) {
    /* …自訂被動／形態… */
  },

  // 擊墜回調（被動多在此觸發：g.aoe / g.addUlt）
  onKill(g, e) {
    /* …自訂… */
  },

  // 子彈命中回調（只自訂 kind 才需要）
  onHit(g, b, e) {
    /* …自訂… */
  },

  // 主動技：冷卻引擎已算；此處放招式與演出
  castActive(g) {
    /* …自訂… */
  },

  // 奧義：引擎已鎖 ultBusy＋無敵；此處放特效與範圍傷害
  castUlt(g) {
    /* …自訂… */
  },
};
