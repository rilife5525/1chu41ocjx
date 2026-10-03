// 輸入系統：鍵盤／滑鼠（絕對跟隨）／觸控（相對拖曳）
import { W, H } from "./constants";

export class InputSys {
  keys: Record<string, boolean> = {};
  // 指標
  mouseActive = false;
  tx = W / 2; // 滑鼠目標位置（邏輯座標）
  ty = H * 0.8;
  dragX = 0; // 觸控累積位移（邏輯座標）
  dragY = 0;
  touchId = -1;
  lastX = 0;
  lastY = 0;
  isTouch = false;
  // 觸發旗標
  pressActive = false;
  pressUlt = false;
  pressPause = false;
  sens = 1.15;
  el: HTMLElement | null = null;
  lastKeyMove = 0;

  private onKeyDown = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
    if (e.repeat) return;
    this.keys[k] = true;
    if (k === " " || k === "j" || k === "z") this.pressActive = true;
    if (k === "k" || k === "x" || k === "e") this.pressUlt = true;
    if (k === "escape" || k === "p") this.pressPause = true;
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
      this.mouseActive = false;
      this.lastKeyMove = performance.now();
    }
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };
  private onBlur = () => {
    this.keys = {};
    this.touchId = -1;
  };

  private toLogical(e: PointerEvent) {
    const r = this.el!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H, sx: W / r.width, sy: H / r.height };
  }

  private onDown = (e: PointerEvent) => {
    if (!this.el) return;
    const p = this.toLogical(e);
    if (e.pointerType === "mouse") {
      this.isTouch = false;
      this.mouseActive = true;
      this.tx = p.x;
      this.ty = p.y;
      if (e.button === 0) this.pressActive = true;
      if (e.button === 2) this.pressUlt = true;
    } else {
      this.isTouch = true;
      if (this.touchId === -1) {
        this.touchId = e.pointerId;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        try {
          this.el.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    }
  };
  private onMove = (e: PointerEvent) => {
    if (!this.el) return;
    if (e.pointerType === "mouse") {
      const p = this.toLogical(e);
      this.isTouch = false;
      this.mouseActive = true;
      this.tx = p.x;
      this.ty = p.y;
    } else if (e.pointerId === this.touchId) {
      const p = this.toLogical(e);
      this.dragX += (e.clientX - this.lastX) * p.sx * this.sens;
      this.dragY += (e.clientY - this.lastY) * p.sy * this.sens;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    }
  };
  private onUp = (e: PointerEvent) => {
    if (e.pointerId === this.touchId) this.touchId = -1;
  };
  private onCtx = (e: Event) => e.preventDefault();

  attach(el: HTMLElement) {
    this.el = el;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("blur", this.onBlur);
    el.addEventListener("pointerdown", this.onDown);
    el.addEventListener("pointermove", this.onMove);
    el.addEventListener("pointerup", this.onUp);
    el.addEventListener("pointercancel", this.onUp);
    el.addEventListener("contextmenu", this.onCtx);
  }

  detach() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("blur", this.onBlur);
    if (this.el) {
      this.el.removeEventListener("pointerdown", this.onDown);
      this.el.removeEventListener("pointermove", this.onMove);
      this.el.removeEventListener("pointerup", this.onUp);
      this.el.removeEventListener("pointercancel", this.onUp);
      this.el.removeEventListener("contextmenu", this.onCtx);
    }
    this.el = null;
  }

  get axisX() {
    return (this.keys["d"] || this.keys["arrowright"] ? 1 : 0) - (this.keys["a"] || this.keys["arrowleft"] ? 1 : 0);
  }
  get axisY() {
    return (this.keys["s"] || this.keys["arrowdown"] ? 1 : 0) - (this.keys["w"] || this.keys["arrowup"] ? 1 : 0);
  }
  get focus() {
    return !!this.keys["shift"];
  }

  consumeDrag() {
    const d = { x: this.dragX, y: this.dragY };
    this.dragX = 0;
    this.dragY = 0;
    return d;
  }
}
