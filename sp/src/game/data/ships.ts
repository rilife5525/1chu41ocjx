// 六架戰機的完整設定：外觀色系、基礎數值、四大技能（武裝／被動／主動／奧義）與進化描述
import type { ShipId, SkillKey } from "../types";

export interface SkillInfo {
  name: string;
  en: string;
  icon: string;
  desc: string;
  /** 進化描述：對應技能等級 Lv3／Lv5／Lv7 */
  evo: [string, string, string];
}

export interface ShipDef {
  id: ShipId;
  name: string;
  en: string;
  sigil: string; // 星紋（超能力）名稱
  sigilEn: string;
  pilot: string;
  pilotEn: string;
  role: string;
  color: string;
  color2: string;
  dark: string;
  quote: string;
  lore: string;
  portrait: { sheet: "a" | "b"; col: number };
  base: { hp: number; spd: number; atk: number; rate: number };
  radar: { atk: number; spd: number; def: number; rng: number; ease: number };
  activeCd: number;
  ultTime: number; // 奧義自然充能所需秒數
  skills: Record<SkillKey, SkillInfo>;
  cut: { line1: string; line2: string };
}

export const SKILL_KEYS: SkillKey[] = ["weapon", "passive", "active", "ult"];
export const SKILL_LABEL: Record<SkillKey, string> = { weapon: "武裝", passive: "被動", active: "主動", ult: "奧義" };
export const SKILL_MAX_PERM = 5;
export const SKILL_MAX_RUN = 7;
export const EVO_LEVELS = [3, 5, 7];

export const SHIPS: Record<ShipId, ShipDef> = {
  crow: {
    id: "crow",
    name: "緋鴉",
    en: "CRIMSON CROW",
    sigil: "爆燃",
    sigilEn: "IGNITION",
    pilot: "赤羽 茜",
    pilotEn: "AKABANE AKANE",
    role: "爆破輸出",
    color: "#ff4a2b",
    color2: "#ffb347",
    dark: "#3a0a08",
    quote: "「把天空燒成我的舞台吧！」",
    lore: "天頂學院首席問題兒童。星紋「爆燃」讓她的每一發子彈都帶著燎原的意志，戰場越亂，她笑得越開心。",
    portrait: { sheet: "a", col: 0 },
    base: { hp: 100, spd: 330, atk: 1.0, rate: 1.0 },
    radar: { atk: 4, spd: 3, def: 3, rng: 4, ease: 4 },
    activeCd: 13,
    ultTime: 44,
    skills: {
      weapon: {
        name: "焰羽扇擊",
        en: "FEATHER VOLLEY",
        icon: "feather",
        desc: "射出扇形焰羽彈，命中時爆裂並灼燒周圍敵機。火力階越高，羽數越多。",
        evo: ["羽爆半徑 +40%，殘火灼燒敵機", "每第 4 輪齊射追加貫穿的「凰羽火球」", "焰羽命中時分裂為 3 枚追蹤火星"],
      },
      passive: {
        name: "餘燼連鎖",
        en: "EMBER CHAIN",
        icon: "ember",
        desc: "擊墜的敵機會引發餘燼爆炸，波及周遭敵機並提高奧義充能。",
        evo: ["爆炸範圍 +30%，附加燃燒", "爆炸有機率留下持續傷害的餘燼火場", "連鎖爆炸會再次引爆，最多連鎖 3 次"],
      },
      active: {
        name: "烙羽連爆",
        en: "BRAND CASCADE",
        icon: "brand",
        desc: "射出烙印焰羽，自動釘住畫面中多名敵人；蓄能後依序連鎖引爆，烙印還會傳染給附近敵機。",
        evo: ["焰羽數量 +4，烙印傳染範圍擴大", "引爆時噴出焰羽雨追擊倖存者", "Boss 身上每枚烙印獨立引爆並附加易傷"],
      },
      ult: {
        name: "涅槃・不死鳥",
        en: "PHOENIX NIRVANA",
        icon: "phoenix",
        desc: "機體轉生為不死鳥形態：火力翻倍、烈焰羽翼灼燒並焚毀近身彈幕，登場瞬間掀起焰浪清場。",
        evo: ["持續 +2 秒，翼焰範圍擴大", "涅槃期間每 2 秒噴發貫穿火柱", "結束時引發全螢幕涅槃爆炎並回復 25% 生命"],
      },
    },
    cut: { line1: "PHOENIX NIRVANA", line2: "涅槃・不死鳥" },
  },
  lance: {
    id: "lance",
    name: "蒼槍",
    en: "AZURE LANCE",
    sigil: "貫穿",
    sigilEn: "PIERCE",
    pilot: "白鷺 凜",
    pilotEn: "SHIRASAGI RIN",
    role: "貫穿狙擊",
    color: "#47c2ff",
    color2: "#d9f4ff",
    dark: "#06263a",
    quote: "「射線之上，沒有『擋得住』這回事。」",
    lore: "冷靜到近乎冷酷的天才狙擊手。星紋「貫穿」讓他的光矛能無視距離與阻礙，沿著他看見的軌道直抵終點。",
    portrait: { sheet: "a", col: 1 },
    base: { hp: 88, spd: 340, atk: 1.12, rate: 1.0 },
    radar: { atk: 5, spd: 3, def: 2, rng: 5, ease: 3 },
    activeCd: 12,
    ultTime: 46,
    skills: {
      weapon: {
        name: "貫穿光矛",
        en: "PIERCING LANCE",
        icon: "lance",
        desc: "連射高速光矛，可貫穿所有敵機；光矛每穿透一名敵人，傷害便會疊加。",
        evo: ["側翼追加斜射光矛，射線更密", "光矛穿透時放出共振餘波", "光矛核心分裂為三重矛陣"],
      },
      passive: {
        name: "共振穿刺",
        en: "RESONANT PIERCE",
        icon: "resonance",
        desc: "穿透疊加增傷的上限提高；機體靜止凝神後，進入傷害強化狀態。",
        evo: ["疊加上限提高，穿透 +1", "靜止 0.6 秒進入「凝神」，傷害 +25%", "凝神狀態下光矛附帶共振爆裂"],
      },
      active: {
        name: "次元斷層",
        en: "DIMENSION FAULT",
        icon: "rift",
        desc: "鎖定敵機最密集的縱列，於天際撕開數道次元裂縫，吞噬裂縫內的敵機與敵彈。",
        evo: ["裂縫數量 +1，寬度擴大", "裂縫閉合時產生空間震盪波", "裂縫持續期間會牽引附近敵機"],
      },
      ult: {
        name: "天啟・鎖定審判",
        en: "APOCALYPSE LOCK",
        icon: "lock",
        desc: "時間緩流，機體充能並鎖定全螢幕敵機，隨後降下貫穿天地的審判光柱，連 Boss 也無法閃避。",
        evo: ["鎖定上限 +12，光柱寬度擴大", "審判之後降下餘暉光矛雨", "審判對 Boss 追加最大生命 8% 傷害"],
      },
    },
    cut: { line1: "APOCALYPSE LOCK", line2: "天啟・鎖定審判" },
  },
  jade: {
    id: "jade",
    name: "翠嵐",
    en: "JADE TEMPEST",
    sigil: "風馭",
    sigilEn: "WINDCALL",
    pilot: "碧野 千風",
    pilotEn: "MIDORINO CHIKAZE",
    role: "高速機動",
    color: "#3dffb0",
    color2: "#eafff6",
    dark: "#04281e",
    quote: "「風在哪，我就在哪！追得上再說吧！」",
    lore: "學院最快的新生。星紋「風馭」讓她能讀懂氣流與彈幕的縫隙，越貼近危險，風越站在她這一邊。",
    portrait: { sheet: "a", col: 2 },
    base: { hp: 92, spd: 400, atk: 0.92, rate: 1.05 },
    radar: { atk: 3, spd: 5, def: 2, rng: 4, ease: 3 },
    activeCd: 11,
    ultTime: 42,
    skills: {
      weapon: {
        name: "螺旋風刃",
        en: "SPIRAL BLADE",
        icon: "wind",
        desc: "發射沿正弦軌跡迴旋的風刃，貫穿並擊退敵機，覆蓋範圍極廣。",
        evo: ["風刃數量 +2，波幅擴大", "風刃殘留氣旋，持續切割", "風刃命中時釋放追蹤氣旋"],
      },
      passive: {
        name: "順風擦彈",
        en: "SLIPSTREAM",
        icon: "slip",
        desc: "擦過敵彈會積累「風勢」，每層提升射速與傷害，並加快機動；停止擦彈後緩慢消退。",
        evo: ["風勢上限 +4，消退更慢", "風勢滿層時移動速度大幅提升", "風勢滿層時風刃變為穿透追蹤"],
      },
      active: {
        name: "旋風輪舞",
        en: "CYCLONE RONDO",
        icon: "cyclone",
        desc: "放出數枚巨大旋風輪，在畫面邊界間反彈，切割沿途敵機並斬斷敵彈，最後盤旋歸位並爆散。",
        evo: ["風輪 +1，持續 +1 秒", "風輪會自動朝敵機密集處反彈", "歸位爆散時釋放環形風刃"],
      },
      ult: {
        name: "翠龍降臨",
        en: "JADE DRAGON",
        icon: "dragon",
        desc: "召喚翠色風龍橫貫戰場，龍身所及之處撕碎敵機、吞噬彈幕，並捲起漫天風暴。",
        evo: ["龍行三趟改為四趟", "龍吟引發雷風，追加落雷", "龍身留下持續 3 秒的風暴軌跡"],
      },
    },
    cut: { line1: "JADE DRAGON", line2: "翠龍降臨" },
  },
  volt: {
    id: "volt",
    name: "紫電",
    en: "VIOLET VOLT",
    sigil: "雷霆",
    sigilEn: "THUNDER",
    pilot: "雷堂 迅",
    pilotEn: "RAIDOU JIN",
    role: "連鎖清場",
    color: "#b26bff",
    color2: "#ffe45c",
    dark: "#1c0a38",
    quote: "「全都連起來吧，一次電個痛快！」",
    lore: "永遠停不下來的雷之少年。星紋「雷霆」讓他把戰場變成一張巨大的電路，敵人越多，他越興奮。",
    portrait: { sheet: "b", col: 0 },
    base: { hp: 96, spd: 335, atk: 0.86, rate: 1.25 },
    radar: { atk: 3, spd: 4, def: 3, rng: 3, ease: 5 },
    activeCd: 15,
    ultTime: 43,
    skills: {
      weapon: {
        name: "電弧彈",
        en: "ARC SHOT",
        icon: "bolt",
        desc: "極速連射的電弧彈，命中後電弧會跳躍至鄰近敵機，越擠的敵群越致命。",
        evo: ["電弧跳躍 +1 次", "電弧附帶麻痺，敵機減速", "電弧彈間會形成電網，持續放電"],
      },
      passive: {
        name: "靜電累積",
        en: "STATIC CHARGE",
        icon: "static",
        desc: "命中會累積靜電，滿載時自動降下落雷轟擊多名敵人。",
        evo: ["落雷數量 +2，充能更快", "落雷附帶範圍雷爆", "落雷會連鎖至鄰近敵機"],
      },
      active: {
        name: "逆極性",
        en: "POLARITY FLIP",
        icon: "polarity",
        desc: "釋放極性脈衝，將全場敵彈反轉為我方追蹤雷彈；反轉力場會持續一段時間，繼續翻轉逼近的彈幕。",
        evo: ["反轉力場持續 +1.5 秒", "反轉的雷彈傷害 +60%，並附帶連鎖", "反轉時同時清空範圍內的敵人護盾"],
      },
      ult: {
        name: "雷網天羅",
        en: "THUNDER WEB",
        icon: "web",
        desc: "以雷電將全場敵機串連成網，連線越多傷害越高，最終降下貫穿全螢幕的天雷審判。",
        evo: ["持續 +1.5 秒，連線傷害提升", "落雷風暴：額外隨機劈落 12 道雷", "天雷審判追加全螢幕麻痺"],
      },
    },
    cut: { line1: "THUNDER WEB", line2: "雷網天羅" },
  },
  noir: {
    id: "noir",
    name: "玄影",
    en: "NOIR SINGULARITY",
    sigil: "重力",
    sigilEn: "GRAVITY",
    pilot: "夜霧 零",
    pilotEn: "YAGIRI REI",
    role: "重力控場",
    color: "#c58bff",
    color2: "#ffd36b",
    dark: "#12081f",
    quote: "「別動——這片空域，現在歸我。」",
    lore: "身分成謎的怪盜型機師。星紋「重力」讓他能折彎光與彈道，把整個戰場收進自己的陰影。",
    portrait: { sheet: "b", col: 1 },
    base: { hp: 118, spd: 305, atk: 1.04, rate: 0.92 },
    radar: { atk: 4, spd: 2, def: 5, rng: 3, ease: 2 },
    activeCd: 13,
    ultTime: 48,
    skills: {
      weapon: {
        name: "暗物質榴彈",
        en: "DARK MATTER",
        icon: "orb",
        desc: "發射緩速重力彈，牽引敵機聚集後爆裂，同時射出暗影追蹤針補足火力。",
        evo: ["重力牽引範圍 +35%", "重力彈爆裂後分裂為小型奇點", "追蹤針數量 +2，並附帶拖慢"],
      },
      passive: {
        name: "重力偏折",
        en: "GRAVITY LENS",
        icon: "lens",
        desc: "靠近機體的敵彈會被重力拖慢並偏折；擦彈時回充奧義。",
        evo: ["偏折半徑擴大，減速 +15%", "被減速的敵彈會緩慢被機體吸附成「暗能」", "暗能累積滿後，下一發重力彈威力翻倍"],
      },
      active: {
        name: "奇點種子",
        en: "SINGULARITY SEED",
        icon: "seed",
        desc: "投射奇點種子至敵群中心，展開微型黑洞吞噬敵彈並牽引敵機；坍縮時依吞噬量爆發。",
        evo: ["黑洞持續 +1 秒，範圍擴大", "坍縮時散射吞噬過的子彈", "同時投出第二枚種子"],
      },
      ult: {
        name: "終焉視界",
        en: "EVENT HORIZON",
        icon: "horizon",
        desc: "於戰場中央生成巨型黑洞，空間扭曲、吞噬全場彈幕與敵機，最終超新星坍縮橫掃一切。",
        evo: ["黑洞持續 +1.5 秒，吸力增強", "黑洞噴發相對論噴流，貫穿上下", "坍縮後留下 4 秒的餘燼力場"],
      },
    },
    cut: { line1: "EVENT HORIZON", line2: "終焉視界" },
  },
  prism: {
    id: "prism",
    name: "星輝",
    en: "PRISM ARK",
    sigil: "變形",
    sigilEn: "MORPH",
    pilot: "稜見 澪",
    pilotEn: "RYOUMI MIO",
    role: "變形全能",
    color: "#7cf3ff",
    color2: "#ffffff",
    dark: "#08252c",
    quote: "「形態不是選擇，是——進化的答案。」",
    lore: "沉靜溫柔的天才技師。星紋「變形」讓她的機體能依戰況重組結構，也能召喚同盟的旗艦支援。",
    portrait: { sheet: "b", col: 2 },
    base: { hp: 106, spd: 322, atk: 0.96, rate: 1.05 },
    radar: { atk: 4, spd: 3, def: 4, rng: 4, ease: 3 },
    activeCd: 16,
    ultTime: 45,
    skills: {
      weapon: {
        name: "稜鏡脈衝",
        en: "PRISM PULSE",
        icon: "prism",
        desc: "飛行形態連射脈衝彈並搭配追蹤微型飛彈；機神形態則換成雙臂加特林與肩砲齊射。",
        evo: ["微型飛彈數量 +1", "脈衝彈命中時折射出散射光", "機神形態追加胸口聚能砲"],
      },
      passive: {
        name: "折射",
        en: "REFRACTION",
        icon: "refract",
        desc: "彈藥命中時有機率折射出兩枚追蹤稜鏡彈。",
        evo: ["折射機率 +12%", "折射彈可再次折射一次", "折射彈附帶範圍爆裂"],
      },
      active: {
        name: "機神變形",
        en: "MECHA MORPH",
        icon: "morph",
        desc: "變形為人型機神：外觀與武裝全面改變，火力大幅提升並減免傷害，解除時衝擊波震盪全場。",
        evo: ["持續 +2 秒，減傷提高", "機神形態獲得前方彈幕偏折力場", "解除時追加全螢幕光子爆裂"],
      },
      ult: {
        name: "天穹方舟",
        en: "SKY ARK",
        icon: "ark",
        desc: "召喚同盟旗艦「方舟」自下方浮現：全炮塔齊射、導彈洗地，並持續修復機體。",
        evo: ["方舟持續 +2 秒，炮塔 +2", "方舟追加艦艏主砲齊射一次", "方舟期間奧義充能大幅回復"],
      },
    },
    cut: { line1: "SKY ARK", line2: "天穹方舟" },
  },
};

/** 由技能等級推算進化階段：0（Lv1-2）、1（Lv3-4）、2（Lv5-6）、3（Lv7） */
export function evoTier(lv: number): number {
  return lv >= 7 ? 3 : lv >= 5 ? 2 : lv >= 3 ? 1 : 0;
}

/** 技能升級消耗（永久升級 Lv1→5） */
export function skillUpCost(lv: number): { coins: number; cores: number } {
  const t = [
    { coins: 400, cores: 0 },
    { coins: 1100, cores: 2 },
    { coins: 2600, cores: 4 },
    { coins: 5200, cores: 8 },
  ];
  return t[Math.min(3, Math.max(0, lv - 1))];
}

/** 機體改造消耗（HP／攻擊／機動 0→10） */
export function modUpCost(n: number): number {
  return Math.round(180 * Math.pow(n + 1, 1.55));
}

/** 機體外觀階級：依四項技能永久等級總和決定 0~3 */
export function shipTier(lv: { weapon: number; passive: number; active: number; ult: number }): number {
  const s = lv.weapon + lv.passive + lv.active + lv.ult;
  return s >= 19 ? 3 : s >= 13 ? 2 : s >= 7 ? 1 : 0;
}
export const TIER_NAME = ["初始型態", "改修型態", "進化型態", "覺醒型態"];
