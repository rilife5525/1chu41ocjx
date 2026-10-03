// 戰機繪製分派入口
import type { ShipId } from "../types";
import { SHIPS } from "../data/ships";
import { drawCrow, drawJade, drawLance } from "./shipDrawA";
import { drawNoir, drawPrism, drawVolt } from "./shipDrawB";
import type { ShipDrawOpts } from "./shipUtil";

export type { ShipDrawOpts } from "./shipUtil";

export function makeOpts(id: ShipId, t: number, tier: number, gear: number[] = [0, 0, 0, 0, 0, 0]): ShipDrawOpts {
  const d = SHIPS[id];
  return { t, tier, thrust: 1, form: 0, morph: 0, gear, bank: 0, color: d.color, color2: d.color2 };
}

/** 於目前座標原點繪製戰機（機首朝上） */
export function drawShip(ctx: CanvasRenderingContext2D, id: ShipId, o: ShipDrawOpts) {
  switch (id) {
    case "crow": return drawCrow(ctx, o);
    case "lance": return drawLance(ctx, o);
    case "jade": return drawJade(ctx, o);
    case "volt": return drawVolt(ctx, o);
    case "noir": return drawNoir(ctx, o);
    case "prism": return drawPrism(ctx, o);
  }
}
