// 音訊系統：以 WebAudio 即時合成音效與程序化 BGM（無外部音檔，低延遲）
type Wave = OscillatorType;

interface Theme {
  bpm: number;
  root: number; // MIDI
  scale: number[];
  prog: number[]; // 和弦根音（音階度數）
  bassPat: number[];
  arpPat: number[];
  kick: number[];
  hat: number;
  lead: boolean;
  /** port/008 移植曲：走來源的 `playStepCz`（bassPat／arpPat 語意與 SP 不同）。 */
  cz?: boolean;
  /** port/013（絕響天穹）移植曲：走 `playStep013`。
   *  bassPat：-1 休止／0 根音（低八度）／1 三度／2 五度；
   *  arpPat ：-1 休止／0~5 索引 `arpTones` 取「音階度數偏移」；
   *  旋律走 `MEL013`（'.' 休止、'-' 延音、0-9a-f 音階度數）。 */
  p013?: boolean;
  /** 「只換音色、不換音符」用的 013 音色開關（僅 THEMES[0] 主選單曲）。
   *
   *   第一版直接把 `p013: true` 打開，走 `playStep013` —— 但那支步進器把
   *   `prog`／`bassPat`／`arpPat` 當成 013 自己的語意解讀（bassPat 是 -1/0/1/2、
   *   arpPat 是 tones 索引、和弦鋪底用絕對度數），等於**連樂譜一起換掉**。
   *  本開關改走 `playStep013Tone`：音符／節奏／和聲的算法與 `playStep`
   *  一字不差（SP 原曲語意），只有 `tone()/noise()` 換成 013 的合成器設計。 */
  t013?: boolean;
  /** `playStep013` 的琶音音程表（度數）。預設 `[0,2,4,7,9,11]`＝來源 013 的和弦音；
   *  SP 原住曲（五聲音階）改傳 `[0,1,2,3,4]` 讓 arpPat 的值等於度數本身。 */
  arpTones?: number[];
  /** port/015（星詠序曲）移植曲：走 `playStep015`。
   *  bassPat：0 休止／1 根音／2 根音+7 度（長音）／3 根音+4 度；
   *  arpPat ：0 休止／1~4 索引 `[0,0,2,4,7]` 的度數偏移；
   *  kick   ：位元旗標 1＝大鼓、2＝小鼓（可同時）；
   *  旋律走 `MEL015`（來源的 `"度數:步數"` 記法，'.'／r 為休止）。 */
  t015?: boolean;
  /** 逐曲總線壓縮器覆寫 `[threshold, knee, ratio, attack, release]`。
   *
   *  ⚠ 2026-10-20 第四輪（「兩首都有爆音，和 015 不一樣；你之前移 013 很順，
   *  不是同樣方法移嗎?」）。答案：**不是**。三個來源專案的總線壓縮器全都是
   *  `threshold -14`／knee 30（DynamicsCompressorNode 預設）／ratio 4~6：
   *      port/008 → -14／4:1   port/013 → -14／6:1   port/015 → -14／4:1
   *  SP 這條是 `-10／knee 6／4:1`，**幾乎不壓**。knee 30 的意思是從 -29 dB 就開始
   *  輕壓、一路到 +1 dB，等於整首都在「抹圓」；knee 6 只從 -13 dB 才動。
   *  013 的曲子本身柔和（5ms 起音、帽子音量 0.06）所以聽不出來；
   *  015 的打擊是 2ms 起音的硬邊，少了那層就一顆顆原封不動地露出來 → 「喀」。
   *  所以移植 015 不能只搬音符，**總線壓縮器也要一起搬**。 */
  cmp?: [number, number, number, number, number];
  /** 逐曲響度正規化增益（線性倍率，預設 1）。
   *
   *  2026-10-19：「音量調到一致、統一」。
   *  作法是量測後寫死，不是執行期自動增益（自動增益會在曲目切換時亂跳）：
   *  用 `_bgm_loud.mjs` 以真實 WebAudio 離線渲染每首曲，算 ITU-R BS.1770 的
   *  K 加權整合響度（LUFS），再令 `g = 10^((目標 - 量測)/20)`。
   *  套用點＝`bgmT`（所有聲部與殘響的共用匯流排），因此鼓／貝斯／旋律／殘響一起縮放。 */
  g?: number;
}

/** `playStep013` 的整體音量正規化係數。
 *
 *  來源 013 的音樂匯流排是 `mus.gain = bgm * 0.5`，個別聲部 gain（kick 0.9／bass 0.3／
 *  arp 0.17／pad 0.07／lead 0.12+0.06）都是照那個匯流排調的；
 *  SP 的 BGM 匯流排是 `bgmG.gain = bgmVol * 0.32`，原生曲（`playStep`）的同位置聲部是
 *  kick 0.7／bass 0.3／arp 0.13／pad 0.05／lead 0.11，而 `playStepCz` 是
 *  kick 0.42／bass 0.2／arp 0.055／pad 0.05／lead 0.11。
 *
 *  2026-10-19 「build 有聽到主畫面音樂更新，但很小聲」：
 *  先只讓 013 曲落進 bgmG（×0.5 時的等效值 kick 0.45 只有原生曲的 64%）→ 明顯偏小。
 *  改乘 0.8 後的等效值（kick 0.72／bass 0.24／arp 0.136／pad 0.056／lead 0.096+0.048）
 *  與 SP 原生曲同量級（略低於 kick 0.7 但更接近，且 arp／bass 已對齊），不需逐首手調。
 *  註：cz 曲本身不動，仍是原來的量級。 */
const V013 = 0.8;

/** BGM 匯流排倍率（`bgmG = bgmVol × BGM_BUS`）。
 *
 *  2026-10-20 「主音樂雖有改善，但跟新移植的主音樂比還是太小聲，
 *  1~6 關關卡內的音樂也是太小聲；port/015 的音樂較大聲，也不會爆音」。
 *
 *  原因不是逐曲正規化（34 首確實都在同一個 LUFS 上），而是**整條 BGM 匯流排太小**：
 *  舊值 0.32 是 SP 原生合成器年代調的，而 port/015 的匯流排是 `bgm × 0.8`
 *  —— 兩者相差 8 dB。015 的曲子在它自己專案裡就是這個量級，搬過來後只要照原值
 *  發聲、再把 SP 的匯流排拉到同一個倍率，兩邊就自然同級（015 的聲部音量
 *  0.95／0.26+0.3／0.07／0.035／0.15 全是照 0.8 這條匯流排調的）。
 *
 *  為何不會爆音：所有 BGM 都先過 `bgmT`（逐曲正規化）→ `bgmG`（本倍率）→
 *  `master 0.9` → `comp(-10 dB／knee 6／4:1)` → `lim(-1 dBFS／20:1，純保險)`。
 *
 *  0.55 → 0.62（2026-10-20 第三輪）：限幅器從 -3/12 退回 -1/20 之後，Chrome 的
 *  自動補償增益跟著變小，全部曲目實測掉了 1.1 dB。這裡補回來，維持調好的聽感。 */
const BGM_BUS = 0.62;

/** SP 原生曲的總線壓縮器（沿用既有聽感，不要動）。 */
const CMP_SP: [number, number, number, number, number] = [-10, 6, 4, 0.005, 0.2];
/** 移植曲必須沿用的總線壓縮器＝008／013／015 三個來源的共同值
 *  （`threshold -14`／knee 30 預設／ratio 4／attack 3ms／release 250ms）。
 *  它的作用不是「變大聲」，而是**整首都在輕壓**：從 -29 dB 就開始抹圓，
 *  把 015 那 2ms 硬起音的打擊收成「tss」而不是「喀」。詳見 `Theme.cmp`。 */
const CMP_SRC: [number, number, number, number, number] = [-14, 30, 4, 0.003, 0.25];

export const THEMES: Theme[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // 0 主選單（2026-10-19：整段旋律不動，只把發聲方式換成 port/013 絕響天穹的合成器）
  //   · 樂理內容（bpm 112／root 45／五聲音階／和弦 [0,3,2,4]／bassPat／arpPat／kick／hat）
  //     與原本的 SP 主選單曲**逐字一致**（從 `SP - 複製/src/game/audio.ts` 逐欄位校對還原）。
  //   · `t013: true` → 走 `playStep013Tone`：音符算法＝SP 原版，音色＝013（滑音 kick、
  //     低通鋸齒貝斯、低通三角琶音＋delay、慢起音三角鋪底）。聲部音量沿用 SP 原值
  //     （已在 bgmG 匯流排上調好），因此與其餘 SP 曲量級一致、不需再乘 V013。
  //   · 同名隨機播放的另一首（013 原版主選單曲）見 THEMES[32]。
  // ══════════════════════════════════════════════════════════════════════════
  { bpm: 112, root: 45, scale: [0, 3, 5, 7, 10], prog: [0, 3, 2, 4], bassPat: [1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0], arpPat: [0, 2, 4, 2, 3, 2, 4, 1], kick: [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: false, t013: true, g: 1.58 },
  { bpm: 140, root: 43, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 4], bassPat: [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1], arpPat: [0, 2, 4, 6, 4, 2, 5, 3], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1], hat: 1, lead: true, g: 1.504 },
  { bpm: 148, root: 40, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 3, 5, 4], bassPat: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1], arpPat: [0, 3, 5, 3, 6, 3, 4, 2], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0], hat: 1, lead: true, g: 1.371 },
  { bpm: 156, root: 38, scale: [0, 1, 4, 5, 7, 8, 11], prog: [0, 5, 1, 4], bassPat: [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1], arpPat: [0, 4, 2, 6, 3, 5, 1, 4], kick: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1], hat: 1, lead: true, g: 1.18 }, // Boss
  // ⚠ 1/2/3 三首原 SP 關卡曲自 2026-10-19 起已無關卡使用（關卡曲、Boss 曲、
  //   每日／無限曲全部改掛 16~31 的 013 移植曲）→ 保留是為了不影響 4~15 的 cz 索引
  //   （`CZ_BOSS_MUSIC`／`ALL_STAGE_MUSIC` 全是寫死索引）。**新碼不要再引用 1~3。**
  // ══════════════════════════════════════════════════════════════════════════
  // port/008 移植曲（索引與來源 THEMES 完全對齊：4~9 關卡曲、10~15 Boss 曲）
  //   來源：port/008/src/game/audio.ts。`cz: true` → 走 `playStepCz`（來源的
  //   bassPat 0/1/2/3＝休止/根音/高八度/五度、arpPat 0/1~4＝休止/和弦音，語意與 SP 不同）。
  //   索引 7（焦獄火脈）與 13（焦獄鬼面）因第 4 關不移植而**保留未用**，
  //   以維持索引與來源一致（`BOSS_MUSIC` 對映才不會位移）。
  // ══════════════════════════════════════════════════════════════════════════
  /* 4 朱夜都心 */ { bpm: 148, root: 50, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 0, 5, 6, 0, 3], bassPat: [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 3, 0], arpPat: [1, 2, 3, 2, 1, 2, 3, 4, 1, 2, 3, 2, 1, 2, 3, 4], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 1, lead: true, cz: true, g: 1.313 },
  /* 5 潮鳴深海 */ { bpm: 132, root: 55, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 6, 4, 0, 5], bassPat: [1, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 3, 0], arpPat: [1, 0, 3, 0, 2, 0, 4, 0, 1, 0, 3, 0, 2, 0, 4, 0], kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], hat: 1, lead: true, cz: true, g: 1.424 },
  /* 6 霜翼凍嶺 */ { bpm: 138, root: 52, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6, 3, 4], bassPat: [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 2, 0], arpPat: [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4], kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0], hat: 1, lead: true, cz: true, g: 1.408 },
  /* 7 焦獄火脈（未使用） */ { bpm: 158, root: 45, scale: [0, 1, 3, 5, 7, 8, 10], prog: [0, 1, 0, 6, 0, 5], bassPat: [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 3, 0], arpPat: [1, 2, 3, 2, 1, 2, 3, 4, 1, 2, 3, 2, 1, 2, 3, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, cz: true, g: 1.293 },
  /* 8 機神迴廊 */ { bpm: 150, root: 47, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 3, 4, 0, 2], bassPat: [1, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 3, 0], arpPat: [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, cz: true, g: 1.304 },
  /* 9 絳月王座 */ { bpm: 160, root: 48, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 2, 4, 0, 3], bassPat: [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 3, 0], arpPat: [1, 2, 3, 2, 1, 2, 3, 4, 1, 2, 3, 2, 1, 2, 3, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, cz: true, g: 1.285 },
  /* 10 魔瞳 */ { bpm: 168, root: 40, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 0, 4], bassPat: [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 3, 0], arpPat: [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, cz: true, g: 1.108 },
  /* 11 鯨艦 */ { bpm: 160, root: 43, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 6, 4], bassPat: [1, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 3, 0], arpPat: [1, 0, 3, 0, 2, 0, 4, 0, 1, 0, 3, 0, 2, 0, 4, 0], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, cz: true, g: 1.122 },
  /* 12 龍王 */ { bpm: 164, root: 45, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 6, 5, 4], bassPat: [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 3, 0], arpPat: [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, cz: true, g: 1.172 },
  /* 13 鬼面（未使用） */ { bpm: 174, root: 38, scale: [0, 1, 3, 5, 7, 8, 10], prog: [0, 1, 0, 6], bassPat: [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 3, 0], arpPat: [1, 2, 3, 2, 1, 2, 3, 4, 1, 2, 3, 2, 1, 2, 3, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, cz: true, g: 1.059 },
  /* 14 機神 */ { bpm: 170, root: 41, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 3, 5, 4], bassPat: [1, 0, 0, 1, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 3, 0], arpPat: [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, cz: true, g: 1.168 },
  /* 15 魘王 */ { bpm: 176, root: 36, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 2, 4], bassPat: [1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0, 2, 0, 3, 0], arpPat: [1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4, 1, 3, 2, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, cz: true, g: 1.061 },
  // ══════════════════════════════════════════════════════════════════════════
  // port/013《絕響天穹》移植曲（2026-10-19 新併）
  //   全部逐字沿用來源 `port/013/src/game/audio.ts` 的 THEMES／MELODIES；
  //   只有兩處正規化：① 整體音量乘 V013（匯流排增益不同，見 V013 註解）；
  //                  ② 八度換算改成 `scale.length`（來源寫死 7，本專案主選單曲是五聲音階）。
  //   對照（來源 013 索引 → 本檔索引）：
  //     4→16（霓虹夜航→SP 第1關）   5→17（珊瑚海→SP 第2關）
  //     7→18（極光冰原→SP 第3關凍原）6→19（熔鐵峽谷→SP 第4關熔岩）
  //     8→20（零點迴路→SP 第5關）   11→21（靜默王庭→SP 第6關）
  //     12→22 / 13→23 / 15→24 / 14→25 / 16→26（SP 第 1~5 關 Boss）
  //     19→33（靜默王→SP 第6關 Boss；013 終樂章的 Boss）
  //     10→28（沉沒的聖堂→每日挑戰）18→29（管風琴→每日挑戰 Boss）
  //     9→30（星環迷航→無限模式）   17→31（星環守衛→無限模式每隻 Boss）
  //     0→32（來源主選單曲，與 THEMES[0] 隨機二選一）
  // ══════════════════════════════════════════════════════════════════════════
  /* 16 SP 第1關·霓虹迷城 ← 013 第1樂章 霓虹夜航 */ { bpm: 148, root: 50, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6, 3, 4], bassPat: [0, -1, 0, -1, -1, -1, 2, -1, 0, -1, 0, -1, 1, -1, 2, -1], arpPat: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 4, 3, 2, 1], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.307 },
  /* 17 SP 第2關·蒼海航線 ← 013 第2樂章 珊瑚海歌 */ { bpm: 128, root: 55, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 3, 6, 0, 5, 4], bassPat: [0, -1, 1, 0, -1, 2, 0, -1, 1, 0, -1, 2, 0, 1, 0, -1], arpPat: [0, -1, 2, -1, 3, -1, 2, -1, 0, -1, 2, -1, 4, -1, 3, -1], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], hat: 1, lead: true, p013: true, g: 1.534 },
  /* 18 SP 第3關·凍原極光 ← 013 第4樂章 極光冰原 */ { bpm: 120, root: 59, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 4, 5, 3, 0, 4], bassPat: [0, -1, -1, -1, -1, -1, 1, -1, 0, -1, -1, -1, 2, -1, 1, -1], arpPat: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], hat: 1, lead: true, p013: true, g: 1.544 },
  /* 19 SP 第4關·熔岩深淵 ← 013 第3樂章 熔鐵峽谷 */ { bpm: 156, root: 52, scale: [0, 1, 3, 5, 7, 8, 10], prog: [0, 1, 5, 6, 0, 4], bassPat: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 2, 1], arpPat: [0, 2, 4, 2, 3, 5, 3, 2, 0, 2, 4, 2, 3, 5, 4, 2], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.1 },
  /* 20 SP 第5關·緋紅要塞 ← 013 第5樂章 零點迴路 */ { bpm: 160, root: 54, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 6, 5, 6, 0, 3], bassPat: [0, -1, -1, 0, -1, -1, 0, -1, 0, -1, -1, 0, -1, 2, -1, 1], arpPat: [0, -1, 2, 3, -1, 2, -1, 4, 0, -1, 2, 3, -1, 5, -1, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, p013: true, g: 1.135 },
  /* 21 SP 第6關·天頂王座 ← 013 第8樂章 靜默王庭 */ { bpm: 168, root: 57, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 6, 4, 0, 3], bassPat: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 2, 1], arpPat: [0, 2, 4, 2, 3, 5, 3, 2, 0, 2, 4, 2, 3, 5, 4, 2], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.02 },
  /* 22 SP 第1關 Boss ← 013 哨兵 */ { bpm: 172, root: 57, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 3, 4], bassPat: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 2, 1], arpPat: [0, 2, 4, 2, 3, 5, 3, 2, 0, 2, 4, 2, 3, 5, 4, 2], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.019 },
  /* 23 SP 第2關 Boss ← 013 深淵燈魚 */ { bpm: 150, root: 52, scale: [0, 2, 3, 5, 7, 9, 10], prog: [0, 5, 6, 3], bassPat: [0, -1, 1, 0, -1, 2, 0, -1, 1, 0, -1, 2, 0, 1, 0, -1], arpPat: [0, -1, 2, 3, -1, 2, -1, 4, 0, -1, 2, 3, -1, 5, -1, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, p013: true, g: 1.145 },
  /* 24 SP 第3關 Boss ← 013 霜晶（013 冰原關的 Boss） */ { bpm: 160, root: 59, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 3, 6], bassPat: [0, -1, -1, 0, -1, -1, 0, -1, 0, -1, -1, 0, -1, 2, -1, 1], arpPat: [0, 1, 2, 3, 2, 1, 2, 3, 0, 1, 2, 3, 4, 3, 2, 1], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.23 },
  /* 25 SP 第4關 Boss ← 013 熔爐（013 熔岩關的 Boss） */ { bpm: 176, root: 52, scale: [0, 1, 3, 5, 7, 8, 10], prog: [0, 1, 6, 5], bassPat: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 2, 1], arpPat: [0, 2, 4, 2, 3, 5, 3, 2, 0, 2, 4, 2, 3, 5, 4, 2], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.039 },
  /* 26 SP 第5關 Boss ← 013 零式 */ { bpm: 180, root: 54, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 6, 5, 4], bassPat: [0, -1, -1, 0, -1, -1, 0, -1, 0, -1, -1, 0, -1, 2, -1, 1], arpPat: [0, -1, 2, 3, -1, 2, -1, 4, 0, -1, 2, 3, -1, 5, -1, 4], kick: [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], hat: 2, lead: true, p013: true, g: 1.079 },
  /* 27 SP 第6關 Boss ← 013 星環守衛 */ { bpm: 164, root: 53, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 4, 3, 5], bassPat: [0, -1, 1, 0, -1, 2, 0, -1, 1, 0, -1, 2, 0, 1, 0, -1], arpPat: [0, 2, 4, 2, 3, 5, 3, 2, 0, 2, 4, 2, 3, 5, 4, 2], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.196 },
  /* 28 每日挑戰 ← 013 第7樂章 沉沒的聖堂 */ { bpm: 116, root: 48, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 3, 4, 0, 5], bassPat: [0, -1, -1, -1, -1, -1, 1, -1, 0, -1, -1, -1, 2, -1, 1, -1], arpPat: [0, -1, 2, -1, 3, -1, 2, -1, 0, -1, 2, -1, 4, -1, 3, -1], kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0], hat: 1, lead: true, p013: true, g: 1.641 },
  /* 29 每日挑戰 Boss ← 013 管風琴 */ { bpm: 168, root: 50, scale: [0, 2, 3, 5, 7, 8, 11], prog: [0, 5, 3, 4], bassPat: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 2, 1], arpPat: [0, 2, 4, 2, 3, 5, 3, 2, 0, 2, 4, 2, 3, 5, 4, 2], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.041 },
  /* 30 無限模式 ← 013 第6樂章 星環迷航 */ { bpm: 132, root: 53, scale: [0, 2, 4, 5, 7, 9, 11], prog: [0, 4, 5, 3, 0, 4], bassPat: [0, -1, 1, 0, -1, 2, 0, -1, 1, 0, -1, 2, 0, 1, 0, -1], arpPat: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.355 },
  /* 31 無限模式 Boss ← 013 星環守衛 */ { bpm: 164, root: 53, scale: [0, 2, 4, 6, 7, 9, 11], prog: [0, 4, 3, 5], bassPat: [0, -1, 1, 0, -1, 2, 0, -1, 1, 0, -1, 2, 0, 1, 0, -1], arpPat: [0, 2, 4, 2, 3, 5, 3, 2, 0, 2, 4, 2, 3, 5, 4, 2], kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.196 },
  /* 32 絕響天穹 主選單（原版音色） */ { bpm: 108, root: 57, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6, 0, 5, 3, 4], bassPat: [0, -1, -1, 0, -1, -1, 1, -1, 0, -1, -1, 0, -1, 2, -1, 1], arpPat: [0, -1, 2, -1, 3, -1, 2, -1, 0, -1, 2, -1, 4, -1, 3, -1], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0], hat: 1, lead: true, p013: true, g: 1.632 },
  /* 33 SP 第6關 Boss ← 013 靜默王（013 終樂章《靜默王庭》的 Boss） */ { bpm: 176, root: 57, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 6, 5, 4], bassPat: [0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 1, 2, 1], arpPat: [0, -1, 2, 3, -1, 2, -1, 4, 0, -1, 2, 3, -1, 5, -1, 4], kick: [1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0], hat: 2, lead: true, p013: true, g: 1.034 },
  // ══════════════════════════════════════════════════════════════════════════
  // port/015《星詠序曲》移植曲（2026-10-20 新增）
  //   來源：`port/015/src/game/audio.ts` 的 THEMES／M；逐字沿用，走 `playStep015`。
  //   與 013／008 的差別：015 的旋律是 `"度數:步數"` 記法、kick 是位元旗標（大鼓＋小鼓可疊）、
  //   音色是「滑音 kick＋帶通小鼓＋高通帽＋低通鋸齒貝斯＋方波琶音＋失諧雙層 lead」。
  //   音量沿用 015 的原值（見 `BGM_BUS` 註解：兩邊匯流排倍率已對齊，不需再乘係數）。
  //     34 → 主選單第三首（與 0／32 隨機三選一）
  //     35 → SP 第 6 關《天頂王座》關卡曲（原 21＝013 靜默王庭，Boss 曲不變仍是 33）
  // ══════════════════════════════════════════════════════════════════════════
  /* 34 主選單 ← 015《星詠序曲》 */ { bpm: 92, root: 57, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 2, 6, 3, 5, 6, 4], bassPat: [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 1, 0, 0, 0], arpPat: [1, 0, 3, 0, 2, 0, 4, 0, 1, 0, 3, 0, 2, 0, 4, 0], kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0], hat: 1, lead: true, t015: true, g: 1.75, cmp: CMP_SRC },
  /* 35 SP 第6關·天頂王座 ← 015 第五關「迴路深淵」＝ 015 THEMES[8]《迴路》
     ⚠ 必須是 THEMES[8]（bpm 150／root 52／prog 0,5,6,4,0,2／BA／AR1／K2／hat 1），
       不是 THEMES[9]《靜寂星環》（126／55／0,5,2,6,3,4／BB／AR2／K1／hat 2）。
       旋律 `MEL015[35]` 抄的是 `M[8]`，伴奏若用 9 就會「旋律與伴奏來自兩首不同的歌」。 */
  { bpm: 150, root: 52, scale: [0, 2, 3, 5, 7, 8, 10], prog: [0, 5, 6, 4, 0, 2], bassPat: [1, 0, 1, 0, 1, 0, 2, 0, 1, 0, 1, 0, 3, 0, 2, 0], arpPat: [1, 2, 3, 4, 3, 2, 3, 4, 1, 2, 3, 4, 3, 2, 3, 4], kick: [1, 0, 0, 1, 2, 0, 0, 0, 1, 0, 1, 0, 2, 0, 0, 1], hat: 1, lead: true, t015: true, g: 1.07, cmp: CMP_SRC },
];

/** port/008 的旋律軌：每小節 16 字元。'.' 休止、'-' 延音、'1'-'7' 中音域度數、
 *  'a'-'g' 高八度、'A'-'G' 低八度。索引＝THEMES 索引（SP 既有 0~3 曲不使用旋律）。 */
export const MELODY: Record<number, string[]> = {
  4: ["a-5-a-c-a-5-3-5-", "a-5-a-c-e---c-a-", "f-e-c-e-f-c-a---", "g-e-b-e-g-e-b---", "a-5-a-c-a-5-3-5-", "d-f-a-f-d-6-4-6-"],
  5: ["5---a-g-e---5-6-", "a---d-c-a---6-5-", "g---e-d-b---7-g-", "e---b-a-g-e-d---", "5-6-a-b-a---g-e-", "d---c-a-f-a-d---"],
  6: ["e---c---a-c-e-g-", "a---f-e-c-f-a-c-", "g-e-c-e-g---e---", "f-d-b-d-f-g-f-d-", "e-g-b-g-e-c-a---", "f-e-d-c-b-a-g---"],
  7: ["a-b-a-g-a---e---", "b-c-b-a-b---f---", "a-b-a-g-a-e-g-a-", "g-f-e-d-e-f-e---", "a-b-d-c-b-a-g-e-", "f-g-a-b-a-g-f-e-"],
  8: ["a-e-a-c-b-g-e-g-", "c-a-f-a-c-e-c-a-", "d-b-g-b-d-f-d-b-", "e-b-g-b-e-g-b-e-", "a-c-e-a-g-e-c-e-", "c-e-g-c-b-g-e-g-"],
  9: ["a---c-e-g-e-c---", "f---a-c-e-c-a---", "e---g-b-d-b-g---", "b---d-f-g-f-d-b-", "a-c-e-g-a-g-e-c-", "g-e-c-e-g-c-e-g-"],
  10: ["a-5-a-c-e-c-a-5-", "f-e-c-e-f-g-f-e-", "a-c-e-c-a-5-3-5-", "g---e---b-g-e-b-"],
  11: ["5-a-g-e-5-a-d-c-", "a-g-e-d-c-d-e-g-", "g-b-d-b-g-e-d-b-", "e-d-b-d-e-g-b-d-"],
  12: ["a-c-e-g-e-c-a-c-", "g-b-d-f-d-b-g-b-", "f-a-c-e-c-a-f-a-", "e-g-b-d-b-g-e-g-"],
  13: ["a-a-b-a-c-b-a-b-", "b-b-c-b-d-c-b-c-", "a-a-g-a-e-g-a-e-", "g-g-a-g-f-e-f-g-"],
  14: ["a-e-b-e-a-g-e-g-", "d-a-f-a-d-c-a-c-", "f-c-g-c-f-e-c-e-", "e-b-g-b-e-g-b-d-"],
  15: ["a-c-e-g-a-g-e-c-", "f-a-c-e-f-e-c-a-", "e-g-b-d-e-d-b-g-", "g-b-d-f-g-f-d-b-"],
};

/** port/008 的 Boss 曲對映：SP 的 BOSSES 索引 → THEMES 索引（來源 `BOSS_MUSIC`，跳過焦獄鬼面）。 */
export const CZ_BOSS_MUSIC: Record<number, number> = { 6: 10, 7: 11, 8: 12, 9: 14, 10: 15 };

// ══════════════════════════════════════════════════════════════════════════
// port/013 血統的曲目索引常數
//   關卡曲／Boss 曲全部「對調」過：SP 的凍原是第 3 關、013 的冰原是第 4 關 → 對調；
//   SP 的熔岩是第 4 關、013 的熔鐵峽谷是第 3 關 → 對調（熔岩換熔岩）。
// ══════════════════════════════════════════════════════════════════════════
export const M013 = {
  /** SP 第 1~6 關關卡曲（前 5 首是 013；第 6 關自 2026-10-20 起改用 port/015 的 35）。 */
  stage: [16, 17, 18, 19, 20, 35] as const,
  /** SP 第 1~6 關 Boss 曲（對應 013 的哨兵／深淵燈魚／霜晶／熔爐／零式／星環守衛）。 */
  stageBoss: [22, 23, 24, 25, 26, 27] as const,
  /** 每日挑戰（＝013 第 7 樂章《沉沒的聖堂》）。 */
  daily: 28,
  dailyBoss: 29,
  /** 無限模式（＝013 第 6 樂章《星環迷航》）。 */
  endless: 30,
  endlessBoss: 31,
  /** 主選單（2026-10-20 起三選一）：0＝SP 原旋律換 013 音色、32＝013 原版、
   *  34＝port/015《星詠序曲》。 */
  main: [0, 32, 34] as const,
};

/** 主選單曲隨機三選一（**隨機**不是輪替：每次起播都獨立抽，重開網頁／退出關卡可能換一首）。
 *  ⚠ 抽籤時機由 `App.tsx` 控制：只在「開頁／重新整理／從關卡回來」抽，
 *    點機庫、選關等畫面互跳**不重抽**（否則會突然換首）。 */
export function pickMainTheme(): number {
  const m = M013.main;
  return m[(Math.random() * m.length) | 0];
}

/** SP 母專案 6 隻 Boss 的專屬曲（idx 0~5 → THEMES 索引）。
 *  對不上時落回 `CZ_BOSS_MUSIC`，再不行才用 3（舊的「母專案共用 Boss 曲」）。
 *
 *  ⚠ 索引 5（SP 第 6 關《天頂王座》）對的是 **013 終樂章《靜默王庭》的 Boss「靜默王」（33）**，
 *    不是「星環守衛」（27）。第一版把 5 指到 27，造成 SP 第 6 關 Boss 與無限模式 Boss
 *    播同一首（27 與 31 的資料完全相同）—— 這是對映錯誤，2026-10-19 修正。 */
export const SP_BOSS_MUSIC: Record<number, number> = { 0: 22, 1: 23, 2: 24, 3: 25, 4: 26, 5: 33 };

/** port/013 的旋律軌：每小節 16 字元。'.' 休止、'-' 延音、'0'-'9'/'a'-'f'＝音階度數（跨兩個八度）。
 *  索引＝THEMES 索引。來源 `port/013/src/game/audio.ts` 的 MELODIES 逐字照抄。
 *  ⚠ 索引 0（主選單曲）**沒有**旋律軌：那首走 `t013`（只換音色），旋律由 SP 原本的
 *    arpPat 算法生成，不存在「一首 013 的旋律譜」。 */
export const MEL013: Record<number, string[]> = {
  16: ["b-9-7-9-b-9-7-4-", "9-7-5-7-9-c-9-7-", "9-b-d-b-9-b-9-7-", "8-a-8-6-8-a-c-a-", "a-c-e-c-a-c-a-7-", "b-d-f-d-b---8---"],
  17: ["7---9-b---9-7---", "a---9-7---5-7---", "c---b-9---7-9---", "b---9-b---e-d---", "7-9-b-9-7---5---", "a-b-c-b-9---7---"],
  18: ["b---e---d---b---", "9---c---b---9---", "a---d---c---a---", "9-b-d-e---d-b-9-", "e---g---e---b---", "d-b-9-b-d---9---"],
  19: ["7-7-.-9-a-9-7-.-", "7-7-.-a-c-a-9-.-", "9-9-.-b-c-b-9-.-", "a-a-.-c-e-c-a-.-", "e-c-a-c-e-f-e-c-", "d-c-a-9-a---7---"],
  20: ["7.9.b.9.7.4.7.9.", "5.7.9.7.5.2.5.7.", "6.8.a.8.6.3.6.8.", "7.9.b.d.b.9.b.d.", "e.d.b.9.b.d.e.g.", "b.9.7.b.9.7.4---"],
  21: ["e-e-b-e-b-e-d-b-", "d-d-a-d-a-d-b-a-", "c-c-9-c-9-c-b-9-", "b-b-8-b-8-d-b-8-", "e-b-e-g-e-b-e-g-", "f-e-d-b-9-b-e---"],
  22: ["e-b-e-b-e-d-b-9-", "c-9-c-9-c-b-9-7-", "a-7-a-7-a-9-7-5-", "b-d-b-e-d---b---"],
  23: ["7--9--b-e--b--9-", "9--b--e-c--9--7-", "a--c--e-g--e--c-", "b--9--b-d--b--7-"],
  24: ["b-d-f-d-b-9-b-d-", "9-b-d-b-9-7-9-b-", "a-c-e-c-a-9-a-c-", "b-d-g-f-e-d-b---"],
  25: ["7-7-9-7-c-b-9-7-", "8-8-a-8-d-c-a-8-", "c-c-e-c-g-e-c-a-", "b-a-9-8-7-9-b---"],
  26: ["b.b.9.b.e.d.b.9.", "d.d.b.d.g.f.d.b.", "c.c.a.c.f.e.c.a.", "b.d.e.d.b.9.b---"],
  27: ["9-b-d-f-d-b-9-7-", "b-d-f-g-f-d-b-9-", "a-c-e-g-e-c-a-9-", "d-f-g-f-d-b-d---"],
  28: ["7---b---e---b---", "8---b---d---b---", "9---c---e---c---", "a---d---f---d---", "e---c---b---9---", "7---8---b-9-8-7-"],
  29: ["e-e-b-e-d-b-9-b-", "c-c-9-c-b-9-7-9-", "a-a-7-a-9-7-5-7-", "b-b-8-b-d-b-8---"],
  30: ["9-b-d-b-9-b-9---", "b-d-f-d-b-d-b---", "a-c-e-c-a-c-a---", "9-b-d-f-e-d-b-9-", "d-f-e-d-b-9-b-d-", "e-d-b-9-b---9---"],
  31: ["9-b-d-f-d-b-9-7-", "b-d-f-g-f-d-b-9-", "a-c-e-g-e-c-a-9-", "d-f-g-f-d-b-d---"],
  32: ["7---9-b-e---b-9-", "c---9-7-9---c-a-", "9---b-d-b---9-7-", "8---a-d-a---8-a-", "e---b-9-b---e-d-", "c-a-9---a-c-e---", "a---c-e-c---a-c-", "b---d-b-8---7---"],
  33: ["e---e-d-b---9-b-", "c---c-b-9---7-9-", "a---a-9-7---5-7-", "b-d-g-f-e-d-b---"],
};

/** 013 曲目的旋律長度（小節數 × 16 步；沒有旋律軌的曲子沿用 8 小節）。 */
const mel013Steps = (i: number) => (MEL013[i]?.length ?? 8) * 16;

/** port/015《星詠序曲》的旋律軌：**來源格式**，每小節一條字串、token 是 `"音階度數:步數"`，
 *  `r` 代表休止（例：`"4:6 2:2 4:4 7:4"` ＝ 度數 4 拉 6 步、度數 2 拉 2 步…）。
 *  與 013／008 的「一字元一步」記法不同，所以另外用 `mel015()` 展開成 16 格陣列。
 *  索引＝THEMES 索引。來源：`port/015/src/game/audio.ts` 的 `M`。 */
export const MEL015: Record<number, string[]> = {
  // 34 主選單 ← 015 THEMES[0]《星詠序曲》
  34: ["4:6 2:2 4:4 7:4", "5:4 7:4 9:6 7:2", "9:4 8:2 7:2 6:4 4:4", "6:4 8:4 7:6 4:2", "7:6 5:2 7:4 9:4", "10:4 9:2 7:2 9:8", "8:4 7:4 6:4 8:4", "8:6 7:2 8:4 11:4"],
  // 35 SP 第6關 ← 015 THEMES[8]《迴路》（015 第五關「迴路深淵」）
  35: ["7:2 4:2 7:2 9:2 11:2 9:2 7:2 4:2", "5:2 7:2 9:2 7:2 5:2 7:2 9:2 12:2", "6:2 8:2 10:2 8:2 6:2 8:2 10:2 13:2", "11:4 10:2 8:2 6:4 4:4", "7:2 4:2 7:2 9:2 11:2 9:2 7:2 4:2", "9:4 8:4 7:4 4:4"],
};

interface Ev015 { deg: number; len: number }
const mel015Cache = new Map<number, (Ev015 | null)[]>();
/** 把 015 的 `"度數:步數"` 記法展開成「每步一格」的陣列（同來源 `melody()`）。 */
function mel015(idx: number): (Ev015 | null)[] {
  const hit = mel015Cache.get(idx);
  if (hit) return hit;
  const out: (Ev015 | null)[] = [];
  for (const bar of MEL015[idx] || []) {
    let pos = 0;
    const slots: (Ev015 | null)[] = new Array(16).fill(null);
    for (const tok of bar.split(" ")) {
      const [d, l] = tok.split(":");
      const len = Math.max(1, parseInt(l, 10) || 1);
      if (pos >= 16) break;
      if (d !== "r") slots[pos] = { deg: parseInt(d, 10), len: Math.min(len, 16 - pos) };
      pos += len;
    }
    out.push(...slots);
  }
  mel015Cache.set(idx, out);
  return out;
}


// ══════════════════════════════════════════════════════════════════════════
// port/015 血統的「噪聲打擊」總開關（帽子＋小鼓的噪聲層）
//
// 2026-10-20 「像亂點滑鼠（微動開關）的聲音」，只有 34／35 兩首有。
// 當時判斷是 2ms 硬起音的寬頻噪聲，先把這兩層關掉測試。
//
// 2026-10-20 第四輪**真正原因找到**：不是這兩層本身有問題，是 SP 的總線壓縮器
// 被改成 `-10／knee 6`（幾乎不壓），而 015 是 `-14／knee 30`（整首都在壓）。
// 少了那層，015 所有硬邊都會原封不動地露出來。
// 修法：`Theme.cmp` 讓移植曲沿用來源的壓縮器（見 `CMP_SRC`）。
//
// ⚠ 但這兩層仍然維持**關閉**，理由（實測，不是猜）：
//   把帽子還原成 015 原值（highpass 7500／0.16×v／2ms）之後，
//   35 的最大樣本跳變從 0.055 衝到 **0.266（5 倍）**。總線壓縮器救不了它 ——
//   DynamicsCompressor 的 attack 是 3ms，只能壓「之後」的音量，
//   對單一樣本的邊緣（<0.02ms）完全沒作用。
//   而這兩層是 015 合成器裡唯一的乾硬噪聲（2ms 起音寬頻噪聲），
//   帽子在 35 是每個 16 分音符打一下（8.4 下/秒）→ 聽起來就是「亂點滑鼠微動開關」。
//   大鼓／貝斯／琶音／鋪底／主旋律全部保留，節奏感由大鼓＋貝斯撐住。
//   兩支函式都還在（且已是來源原值），要聽回來把這個常數改成 `true` 就好。
// ══════════════════════════════════════════════════════════════════════════
const P015_NOISE_PERC = false;

export class AudioSys {
  ctx: AudioContext | null = null;
  master!: GainNode;
  sfxG!: GainNode;
  bgmG!: GainNode;
  /** 逐曲正規化增益匯流排（`THEMES[i].g`）：所有 BGM 聲部與殘響都先過這裡再進 `bgmG`。 */
  bgmT!: GainNode;
  /** BGM 的 38 Hz 高通（去次低頻隆隆，保留峰值餘裕）。 */
  bgmHP!: BiquadFilterNode;
  /** 收尾淡出（結算時把關卡曲淡掉，見 `fadeOutBgm()`）。 */
  bgmFade!: GainNode;
  /** 總線壓縮（透明：只在峰值動作，見 `init()` 註解）。 */
  comp!: DynamicsCompressorNode;
  /** 安全限幅器（壓縮器之後、destination 之前）。 */
  lim!: DynamicsCompressorNode;
  noiseBuf: AudioBuffer | null = null;
  /** port/008 移植曲用的延遲殘響（只由 `playStepCz`／`leadNote` 送入）。 */
  delay: DelayNode | null = null;
  /** port/013 移植曲用的延遲殘響（0.28s；與 008 的 `delay` 分開，避免改到 cz 曲的音色）。 */
  delay013: DelayNode | null = null;
  /** port/015 的延遲送出級 —— **不要用，永遠是 null**。
   *
   *  ⚠ 2026-10-20 第五輪差點又踩一次：015 來源的殘響是「送出增益 0.35 → delay → 濕訊號 1.0」，
   *  而 SP 的 `delay013` 是「直接輸入 → delay → 濕訊號 0.35」—— 兩者**總量相同**。
   *  當初看到來源有那顆 0.35 就想補，補完等於 0.35×0.35，殘響直接小 9 dB。
   *  `_bgm_diff.mjs` 的差信比 33.3 → 26.7 dB 立刻抓到，已撤回。
   *  留這個欄位只是記錄教訓，`lead015`／`arp015` 一律接 `delay013`。 */
  dly015: GainNode | null = null;
  last: Record<string, number> = {};
  bgmVol = 0.55;
  sfxVol = 0.8;
  timer: number | null = null;
  /** `fadeOutBgm()` 的「淡完才停」計時器（`playBgm` 會取消它，見 `resetBgmFade`）。 */
  fadeTimer: number | null = null;
  step = 0;
  nextT = 0;
  theme = 0;
  playing = false;
  muted = false;

  init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") this.ctx.resume();
      return;
    }
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC({ latencyHint: "interactive" });
      // ── 主鏈：master → comp（透明總線壓縮）→ lim（安全限幅）→ destination ──
      // 2026-10-20 「關卡內音樂有 bo bo bo 的難聽聲音，不像原本的音效」：
      //   舊值是 threshold -14／ratio 6／knee 預設 30 dB —— knee 30 表示「-29 dBFS 就開始壓」，
      //   而 BGM 拉高後 RMS 約 -25 dBFS → **整首曲子一直被壓**，每一顆大鼓再把整條混音壓下去
      //   → 聽起來就是規律的「bo bo bo」（音效也被一起抽吸，所以連子彈聲都變調）。
      //   改成「只在峰值才動作」的透明設定（knee 6／threshold -10／ratio 4），
      //   並補一顆真正的限幅器當最後一道（任何瞬態都不得超過 -4 dBFS）。
      this.comp = this.ctx.createDynamicsCompressor();
      this.comp.threshold.value = -10;
      this.comp.knee.value = 6;
      this.comp.ratio.value = 4;
      this.comp.attack.value = 0.005;
      this.comp.release.value = 0.2;
      // 限幅器只當「保險」，不參與音色：門檻 -1 dBFS、比率 20、起音 1ms、釋放 80ms。
      //   ⚠ 2026-10-20 第三輪定位：「單獨清 bassPat／arpPat／kick 任何一個都沒用，
      //   三個全清才聽不到喀聲」＝典型的**總量型失真**。實測 35 的 LUFS -19.7，
      //   其餘 35 首全在 -23.7~-24.9（大 5 dB）→ 峰值 -1.6 每一下都超 -3 門檻 4.6 dB，
      //   ratio 12 就是壓掉 4.2 dB、再花 150ms 釋放 → 整條混音跟著每一下呼吸，
      //   聽起來正是「規律的 bo bo bo」。修法分兩層：
      //     ① 曲本身的 g 調回 -24.7 LUFS（真正的 bug，見 THEMES[35]）
      //     ② 限幅器退回「純保險」：門檻 -1、1ms 起音（真撞到就直接夾住，不會抽水）
      //   正常曲目峰值都在 -1.6 以下，改完等於完全透明。
      this.lim = this.ctx.createDynamicsCompressor();
      this.lim.threshold.value = -1;
      this.lim.knee.value = 0;
      this.lim.ratio.value = 20;
      this.lim.attack.value = 0.001;
      this.lim.release.value = 0.08;
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.sfxG = this.ctx.createGain();
      this.bgmG = this.ctx.createGain();
      // 逐曲正規化匯流排：聲部 → bgmT → bgmG → master
      this.bgmT = this.ctx.createGain();
      this.bgmT.gain.value = 1;
      // 38 Hz 高通：42 Hz 的大鼓尾巴人耳幾乎聽不到，卻會吃掉峰值餘裕、讓喇叭「bo」。
      this.bgmHP = this.ctx.createBiquadFilter();
      this.bgmHP.type = "highpass";
      this.bgmHP.frequency.value = 38;
      this.bgmHP.Q.value = 0.7;
      // 收尾淡出用的獨立節點（bgmHP → bgmFade → bgmG）：
      //   結算（通關／失敗）時要把關卡曲淡掉、讓 jingle 獨立發聲。刻意不併進 `bgmG`，
      //   因為 `applyGains()` 會直接寫 `bgmG.gain.value`，排程中的 ramp 會被蓋掉。
      this.bgmFade = this.ctx.createGain();
      this.bgmFade.gain.value = 1;
      this.bgmT.connect(this.bgmHP);
      this.bgmHP.connect(this.bgmFade);
      this.bgmFade.connect(this.bgmG);
      this.sfxG.connect(this.master);
      this.bgmG.connect(this.master);
      this.master.connect(this.comp);
      this.comp.connect(this.lim);
      this.lim.connect(this.ctx.destination);
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      // 延遲殘響（來源 port/008 的 delay：回授 0.32 → lowpass 2.6k → 濕訊號 0.3 併入 BGM）
      this.delay = this.ctx.createDelay(1);
      const fb = this.ctx.createGain();
      fb.gain.value = 0.32;
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2600;
      this.delay.connect(lp);
      lp.connect(fb);
      fb.connect(this.delay);
      const wet = this.ctx.createGain();
      wet.gain.value = 0.3;
      lp.connect(wet);
      wet.connect(this.bgmT);
      // 013 的延遲殘響（來源 port/013：delayTime 0.28 → 回授 0.28 → 濕訊號 0.35 併入 BGM）
      this.delay013 = this.ctx.createDelay(1);
      this.delay013.delayTime.value = 0.28;
      const fb13 = this.ctx.createGain();
      fb13.gain.value = 0.28;
      const lp13 = this.ctx.createBiquadFilter();
      lp13.type = "lowpass";
      lp13.frequency.value = 2600;
      this.delay013.connect(lp13);
      lp13.connect(fb13);
      fb13.connect(this.delay013);
      const wet13 = this.ctx.createGain();
      wet13.gain.value = 0.35;
      lp13.connect(wet13);
      wet13.connect(this.bgmT);
      this.setVolumes(this.bgmVol, this.sfxVol);
    } catch {
      this.ctx = null;
    }
  }

  setVolumes(bgm: number, sfx: number) {
    this.bgmVol = bgm;
    this.sfxVol = sfx;
    this.applyGains();
  }

  /** 靜音：**只把兩條匯流排的增益歸零**，不動 `bgmVol`／`sfxVol`（取消靜音即還原原音量）。
   *  BGM 序列器刻意**繼續排程**（`timer` 不停）——這樣取消靜音是從當下的樂句接回來，
   *  而不是整首從頭開始。 */
  setMuted(v: boolean) {
    this.muted = v;
    this.applyGains();
  }

  /** 把目前音量（含靜音狀態）寫進兩個 GainNode。ctx 還沒建立時什麼都不做。 */
  private applyGains() {
    if (!this.ctx) return;
    const m = this.muted ? 0 : 1;
    this.bgmG.gain.value = this.bgmVol * BGM_BUS * m;
    this.sfxG.gain.value = this.sfxVol * 0.7 * m;
  }

  private tone(f: number, d: number, type: Wave = "square", v = 0.2, slide = 0, delay = 0, dest?: AudioNode, send = false) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, f + slide), t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(dest || this.sfxG);
    if (send && this.delay) g.connect(this.delay);
    o.start(t);
    o.stop(t + d + 0.02);
  }

  private noise(d: number, v = 0.2, f0 = 2000, f1 = 400, type: BiquadFilterType = "lowpass", delay = 0, dest?: AudioNode) {
    const c = this.ctx;
    if (!c || !this.noiseBuf) return;
    const t = c.currentTime + delay;
    const s = c.createBufferSource();
    s.buffer = this.noiseBuf;
    s.loop = true;
    const f = c.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d);
    const g = c.createGain();
    g.gain.setValueAtTime(v, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f);
    f.connect(g);
    g.connect(dest || this.sfxG);
    s.start(t, Math.random());
    s.stop(t + d + 0.02);
  }

  /** 播放音效；throttle 秒內同名音效只播一次以避免爆音 */
  sfx(name: string, throttle = 0.04) {
    const c = this.ctx;
    if (!c || this.muted) return;
    const now = c.currentTime;
    if (this.last[name] && now - this.last[name] < throttle) return;
    this.last[name] = now;
    switch (name) {
      case "shoot0": this.tone(520 + Math.random() * 60, 0.06, "sawtooth", 0.05, -300); this.noise(0.05, 0.04, 6000, 1500, "highpass"); break;
      case "shoot1": this.tone(1500, 0.05, "sine", 0.06, -600); this.tone(2200, 0.03, "triangle", 0.03); break;
      case "shoot2": this.noise(0.09, 0.05, 900, 3000, "bandpass"); break;
      case "shoot3": this.tone(900 + Math.random() * 300, 0.04, "sawtooth", 0.045, -500); break;
      case "shoot4": this.tone(150, 0.12, "sine", 0.1, -70); this.tone(700, 0.05, "triangle", 0.03, 200); break;
      case "shoot5": this.tone(780, 0.05, "triangle", 0.06, 200); break;
      case "hit": this.tone(300 + Math.random() * 200, 0.03, "square", 0.03, -100); break;
      case "boom_s": this.noise(0.22, 0.16, 2600, 200); this.tone(120, 0.15, "sine", 0.12, -80); break;
      case "boom_m": this.noise(0.4, 0.28, 2200, 120); this.tone(90, 0.3, "sine", 0.22, -60); break;
      case "boom_l": this.noise(1.1, 0.5, 2600, 60); this.tone(70, 0.9, "sine", 0.4, -45); this.tone(40, 1.2, "sine", 0.3, -20, 0.1); break;
      case "pickup": this.tone(880, 0.06, "triangle", 0.08, 400); break;
      case "coin": this.tone(1320, 0.05, "square", 0.05, 500); this.tone(1980, 0.08, "square", 0.04, 0, 0.05); break;
      case "power": [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.09, "square", 0.08, 0, i * 0.05)); break;
      case "levelup": [392, 494, 587, 784, 988].forEach((f, i) => this.tone(f, 0.16, "triangle", 0.12, 0, i * 0.07)); break;
      case "evolve": [262, 330, 392, 523, 659, 784, 1047].forEach((f, i) => { this.tone(f, 0.3, "sawtooth", 0.07, 0, i * 0.06); this.tone(f * 2, 0.3, "sine", 0.06, 0, i * 0.06); }); this.noise(0.8, 0.1, 400, 8000, "highpass", 0.3); break;
      case "active": this.tone(220, 0.35, "sawtooth", 0.12, 660); this.noise(0.4, 0.14, 500, 5000, "bandpass"); break;
      case "ultcut": this.tone(110, 0.9, "sawtooth", 0.22, 440); this.tone(55, 1.2, "sine", 0.3, 20); this.noise(0.9, 0.2, 200, 9000, "highpass"); [0, 0.25, 0.5, 0.75].forEach((d) => this.tone(880 + d * 900, 0.1, "square", 0.08, 0, d)); break;
      case "ultgo": this.noise(1.2, 0.5, 6000, 100); this.tone(65, 1.2, "sine", 0.5, -30); this.tone(220, 0.8, "sawtooth", 0.16, 880); break;
      case "hurt": this.noise(0.35, 0.35, 1800, 90); this.tone(160, 0.3, "sawtooth", 0.24, -110); break;
      case "graze": this.tone(1800, 0.03, "sine", 0.04, 800); break;
      case "warning": [0, 0.5, 1, 1.5].forEach((d) => { this.tone(660, 0.3, "square", 0.12, -180, d); this.tone(330, 0.3, "sawtooth", 0.08, 0, d); }); break;
      case "bossdie": this.noise(2.2, 0.6, 3000, 50); this.tone(60, 2, "sine", 0.5, -30); [0, 0.3, 0.6, 0.9, 1.2].forEach((d) => this.noise(0.3, 0.3, 2400, 200, "lowpass", d)); break;
      case "lightning": this.noise(0.28, 0.35, 8000, 300, "highpass"); this.tone(90, 0.25, "sawtooth", 0.2, -50); break;
      case "laser": this.tone(1200, 0.35, "sawtooth", 0.09, -900); this.noise(0.35, 0.1, 5000, 800, "bandpass"); break;
      case "charge": this.tone(200, 0.6, "sawtooth", 0.1, 1200); break;
      case "lock": this.tone(1400, 0.05, "square", 0.08); this.tone(2100, 0.05, "square", 0.05, 0, 0.03); break;
      case "whoosh": this.noise(0.5, 0.25, 300, 6000, "bandpass"); break;
      case "gear": [1047, 1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.18, "sine", 0.09, 0, i * 0.06)); break;
      case "ui": this.tone(660, 0.05, "square", 0.06, 220); break;
      case "ui_hover": this.tone(440, 0.03, "triangle", 0.04); break;
      case "ui_ok": this.tone(523, 0.06, "square", 0.07); this.tone(784, 0.1, "square", 0.07, 0, 0.06); break;
      case "ui_back": this.tone(392, 0.07, "square", 0.06, -120); break;
      // 結算 jingle：BGM 已經淡出（`fadeOutBgm`），所以這裡可以放大到「主角級」。
      // 舊值 0.1 是 BGM 匯流排只有 0.32 的年代調的；BGM 拉高 9 dB 之後，0.1 的 jingle
      // 峰值比背景音樂還低（實測 jingle 約 -25 dBFS、BGM RMS -24 dBFS）→ 聽感「很小聲」。
      case "clear":
        [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => {
          this.tone(f, 0.26, "square", 0.26, 0, i * 0.12);
          this.tone(f * 2, 0.2, "triangle", 0.13, 0, i * 0.12);
        });
        this.tone(131, 0.9, "sine", 0.24, 0, 0.36);
        this.noise(0.5, 0.1, 6000, 2000, "highpass", 0.4);
        break;
      case "fail":
        [392, 349, 311, 262].forEach((f, i) => {
          this.tone(f, 0.4, "sawtooth", 0.26, -20, i * 0.22);
          this.tone(f / 2, 0.5, "sine", 0.2, 0, i * 0.22);
        });
        this.noise(1.2, 0.16, 900, 90, "lowpass", 0.1);
        break;
      case "morph": this.noise(0.6, 0.2, 800, 5000, "bandpass"); [220, 330, 440, 660].forEach((f, i) => this.tone(f, 0.2, "square", 0.08, 100, i * 0.08)); break;
      case "black": this.tone(50, 1.5, "sine", 0.35, -15); this.noise(1.2, 0.2, 3000, 100); break;
    }
  }

  // ------------- BGM 步進式排程器 -------------
  playBgm(themeIdx: number) {
    if (!this.ctx) return;
    this.theme = Math.max(0, Math.min(THEMES.length - 1, themeIdx));
    this.applyThemeGain();
    // 總線壓縮器也要跟著換：`GameScreen` 是走 `playBgm(stage.music)` 起播的，
    // 只寫 applyThemeGain 的話移植曲會用到 SP 的壓縮器（見 `Theme.cmp`）。
    this.applyThemeComp();
    // 上一輪可能停在結算的淡出狀態（`fadeOutBgm`）→ 重新播之前一定要把淡出節點拉回 1，
    // 否則新曲會以 0 音量播放（聽起來就是「沒音樂」）。
    this.resetBgmFade();
    if (this.playing) return;
    this.playing = true;
    this.step = 0;
    this.nextT = this.ctx.currentTime + 0.08;
    this.timer = window.setInterval(() => this.schedule(), 40);
  }

  /** 把淡出節點還原成 1（取消任何排程中的 ramp）。 */
  private resetBgmFade() {
    // 已經排定的「淡出後停排程器」也要一起取消：否則玩家在結算畫面立刻按「再挑戰」，
    // 新曲會剛開始播就被上一個計時器 stopBgm() 砍掉（聽起來就是「沒音樂」）。
    if (this.fadeTimer !== null) {
      window.clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (!this.ctx || !this.bgmFade) return;
    const p = this.bgmFade.gain as AudioParam & { cancelScheduledValues?: (t: number) => void };
    const now = this.ctx.currentTime;
    try {
      p.cancelScheduledValues?.(now);
      p.setValueAtTime(1, now);
    } catch {
      this.bgmFade.gain.value = 1;
    }
  }

  /** 淡出並停止 BGM（結算時用：通關／失敗的 jingle 要獨立發聲）。
   *  `sec` 秒內線性降到 0，之後才停排程器（避免還在佇列裡的音符突然斷掉）。
   *  注意：`setTheme(0)` 只換曲目、**不會**把音樂停掉——所以結算一定要呼叫這支。 */
  fadeOutBgm(sec = 0.6) {
    if (!this.ctx || !this.bgmFade) {
      this.stopBgm();
      return;
    }
    const now = this.ctx.currentTime;
    const g = this.bgmFade.gain as AudioParam & { cancelScheduledValues?: (t: number) => void };
    try {
      g.cancelScheduledValues?.(now);
      g.setValueAtTime(Math.max(0.0001, g.value), now);
      g.linearRampToValueAtTime(0.0001, now + Math.max(0.05, sec));
    } catch {
      this.bgmFade.gain.value = 0.0001;
    }
    if (this.fadeTimer !== null) window.clearTimeout(this.fadeTimer);
    this.fadeTimer = window.setTimeout(() => {
      this.fadeTimer = null;
      this.stopBgm();
    }, Math.max(50, sec * 1000));
  }
  setTheme(idx: number) {
    this.theme = Math.max(0, Math.min(THEMES.length - 1, idx));
    this.applyThemeGain();
    this.applyThemeComp();
  }

  /** 依曲目切換總線壓縮器（移植曲要用來源的那組，見 `Theme.cmp`）。
   *  壓縮器參數本身是平滑的 AudioParam，切換時不會有喀聲。 */
  private applyThemeComp() {
    if (!this.comp) return;
    const v = THEMES[this.theme]?.cmp ?? CMP_SP;
    this.comp.threshold.value = v[0];
    this.comp.knee.value = v[1];
    this.comp.ratio.value = v[2];
    this.comp.attack.value = v[3];
    this.comp.release.value = v[4];
  }

  /** 把目前曲目的正規化增益寫進 `bgmT`。曲目切換時用 60ms 線性過渡，避免音量突跳。
   *  （`setTheme` 會在 Boss 登場等時機被呼叫，硬切會有「咔」一聲。） */
  private applyThemeGain() {
    if (!this.ctx || !this.bgmT) return;
    const g = THEMES[this.theme]?.g ?? 1;
    const p = this.bgmT.gain as AudioParam & { cancelScheduledValues?: (t: number) => void };
    const now = this.ctx.currentTime;
    try {
      p.cancelScheduledValues?.(now);
      p.setValueAtTime(p.value, now);
      p.linearRampToValueAtTime(g, now + 0.06);
    } catch {
      this.bgmT.gain.value = g;
    }
  }

  stopBgm() {
    this.playing = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
  }

  private midi(n: number) {
    return 440 * Math.pow(2, (n - 69) / 12);
  }

  private schedule() {
    const c = this.ctx;
    if (!c || !this.playing) return;
    const th = THEMES[this.theme];
    const stepDur = 60 / th.bpm / 4;
    // ⚠ **只有 013 曲可以對 step 取模**（循環長度＝旋律小節數×16，每首不一）。
    //   其餘曲目（SP 原生／cz）**必須送原始遞增的 step**：那兩支步進器用
    //   `bar = floor(s / 16) % prog.length` 推和弦與旋律列，一旦先取模成 0~15，
    //   bar 就永遠是 0 —— 整首卡在第一小節的和弦上打轉（
    //   「主音樂不像同一首」的根因；`_bgm_probe.mjs` 可重現）。
    // ⚠ 追趕保護：主執行緒被畫面／GC 卡住超過 lookahead 時，
    //   `nextT` 會落到 `currentTime` 之後，而 `playStep015` 等步進器都寫
    //   `Math.max(0, delay)` —— 負延遲全部壓成 0，**好幾步的音會在同一瞬間爆出來**，
    //   聽起來就是「bo bo bo」的爆音（這也解釋了為什麼離線逐樣本比對是乾淨的：
    //   離線渲染沒有主執行緒卡頓，`delay` 永遠是正的）。
    //   寧可跳過漏掉的步（聽起來是短暫缺拍），也不要疊成一坨。
    //   015 血統每步要建 ~20 個節點（013 約一半），所以只有 015 那兩首踩得到。
    if (c.currentTime - this.nextT > 0.05) this.nextT = c.currentTime + 0.02;
    while (this.nextT < c.currentTime + 0.18) {
      const s = th.p013 ? this.step % mel013Steps(this.theme) : this.step;
      this.playStep(th, s, this.nextT - c.currentTime);
      this.nextT += stepDur;
      this.step++;
    }
  }

  private playStep(th: Theme, s: number, delay: number) {
    // port/015 移植曲走 `playStep015`（kick 是位元旗標、旋律是「度數:步數」記法）。
    if (th.t015) {
      this.playStep015(th, s, delay);
      return;
    }
    // port/013 移植曲走 `playStep013`（bassPat／arpPat 語意與 SP、008 都不同）。
    if (th.p013) {
      this.playStep013(th, s, delay);
      return;
    }
    // 「只換音色不換音符」：算法與下面 SP 原生那支一字不差，僅發聲方式換 013 合成器。
    if (th.t013) {
      this.playStep013Tone(th, s, delay);
      return;
    }
    // port/008 移植曲走來源的步進邏輯（bassPat／arpPat 語意與 SP 不同）。
    if (th.cz) {
      this.playStepCz(th, s, delay);
      return;
    }
    const i = s % 16;
    const bar = Math.floor(s / 16) % th.prog.length;
    const deg = th.prog[bar];
    const rootNote = th.root + th.scale[deg % th.scale.length];
    const d = Math.max(0, delay);
    const dest = this.bgmT;
    if (th.kick[i]) {
      this.tone(140, 0.14, "sine", 0.7, -110, d, dest);
    }
    if (i % 8 === 4) this.noise(0.14, 0.32, 3500, 1200, "bandpass", d, dest);
    if (i % (th.hat * 2) === 0 || (th.hat === 1 && i % 2 === 0)) this.noise(0.03, 0.1, 9000, 7000, "highpass", d, dest);
    if (th.bassPat[i]) this.tone(this.midi(rootNote - 12), 0.16, "sawtooth", 0.3, 0, d, dest);
    const a = th.arpPat[i % th.arpPat.length];
    if (i % 2 === 0 || th.lead) {
      const n = rootNote + 12 + th.scale[(deg + a) % th.scale.length] + (Math.floor((deg + a) / th.scale.length) * 12);
      this.tone(this.midi(n), 0.11, "square", th.lead ? 0.13 : 0.09, 0, d, dest);
    }
    if (i === 0) {
      // 和弦墊音
      [0, 2, 4].forEach((k) => {
        const n = rootNote + th.scale[(deg + k) % th.scale.length] + Math.floor((deg + k) / th.scale.length) * 12;
        this.tone(this.midi(n), (60 / th.bpm) * 3.6, "triangle", 0.1, 0, d, dest);
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // port/008 血統的步進器（來源：port/008/src/game/audio.ts 的 playStep／leadNote）
  //   bassPat：0 休止 / 1 根音 / 2 高八度 / 3 五度（SP 只分有無）
  //   arpPat ：0 休止 / 1~4 和弦音索引（SP 直接用數值當音階度數）
  //   音長／音量／濾波器皆沿用來源數值；`send=true` 走 delay 殘響。
  // ══════════════════════════════════════════════════════════════════════════
  private playStepCz(th: Theme, step: number, delay: number) {
    const dest = this.bgmT;
    const d = Math.max(0, delay);
    const sd = 60 / th.bpm / 4;
    const bar = Math.floor(step / 16) % th.prog.length;
    const i = step % 16;
    const rootDeg = th.prog[bar];
    const boss = this.theme >= 10; // 來源：cur >= 10（Boss 曲）
    // 鼓組
    if (th.kick[i]) {
      this.tone(160, 0.16, "sine", boss ? 0.5 : 0.42, -118, d, dest);
      this.noise(0.02, 0.08, 2000, 2000, "highpass", d, dest);
    }
    if (i === 4 || i === 12) {
      this.noise(0.14, 0.2, 1200, 1200, "highpass", d, dest);
      this.tone(200, 0.1, "triangle", 0.14, -80, d, dest);
    }
    if (th.hat && (i % 2 === 0 || (th.hat === 2 && i % 4 === 3))) this.noise(th.hat === 2 && i % 4 === 2 ? 0.1 : 0.03, 0.07, 7000, 7000, "highpass", d, dest);
    // 貝斯
    const bp = th.bassPat[i];
    if (bp) {
      const base = this.degMidi(th, rootDeg) - 12;
      const m = bp === 1 ? base : bp === 2 ? base + 12 : this.degMidi(th, rootDeg + 4) - 12;
      const f = this.midi(m);
      this.tone(f, sd * 1.7, "sawtooth", 0.2, 0, d, dest);
      this.tone(f / 2, sd * 1.7, "sine", 0.22, 0, d, dest);
    }
    // 琶音
    const ap = th.arpPat[i];
    if (ap) {
      const tones = [0, 2, 4, 7];
      const m = this.degMidi(th, rootDeg + tones[(ap - 1) % 4]) + 12;
      this.tone(this.midi(m), sd * 1.4, "square", 0.055, 0, d, dest, true);
    }
    // 和弦鋪底（小節首）
    if (i === 0) {
      for (const k of [0, 2, 4]) this.tone(this.midi(this.degMidi(th, rootDeg + k)), sd * 14, "triangle", 0.05, 0, d, dest);
    }
    // 旋律
    if (th.lead) {
      const mel = MELODY[this.theme];
      if (mel) {
        const row = (mel[bar % mel.length] || "").padEnd(16, ".");
        const c = row[i];
        if (c && c !== "." && c !== "-") {
          let n = 1;
          while (i + n < 16 && row[i + n] === "-") n++;
          const dur = n * sd * 0.96;
          let deg: number;
          let oct = 0;
          if (c >= "1" && c <= "7") deg = c.charCodeAt(0) - 49;
          else if (c >= "a" && c <= "g") { deg = c.charCodeAt(0) - 97; oct = 1; }
          else { deg = c.charCodeAt(0) - 65; oct = -1; }
          const f = this.midi(this.degMidi(th, deg) + 12 + oct * 12);
          this.leadNote(f, d, dur, dest, boss);
        }
      }
    }
  }

  /** 音階度數 → MIDI（可跨八度，負度數也支援） */
  private degMidi(th: Theme, deg: number) {
    const n = th.scale.length;
    const o = Math.floor(deg / n);
    return th.root + th.scale[((deg % n) + n) % n] + o * 12;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // port/013《絕響天穹》血統的步進器（來源：port/013/src/game/audio.ts 的 playStep）
  //
  // 與 008 的 `playStepCz` 差異：
  //   bassPat  -1 休止／0 根音（低八度）／1 三度／2 五度（008 是 0/1/2/3）
  //   arpPat   -1 休止／0~5 索引 `arpTones`（預設 [0,2,4,7,9,11]＝和弦音）
  //   八度    來源寫死 `±7`，這裡改成 `±scale.length`（五聲音階的主選單曲才不會跑掉）
  //   旋律    走 `MEL013`（度數 0~15 直接寫在譜上，不是 008 的 1-7/a-g 記法）
  //   音色    全部為 013 原版：滑音 kick、帶通拍手、低通鋸齒貝斯、低通三角琶音（送 delay）、
  //           長三角鋪底、方波＋微失諧鋸齒的雙層旋律（送 delay）。
  // ══════════════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  // 「只換音色、不換音符」步進器（2026-10-19 新增，僅 THEMES[0] 主選單曲）
  //
  //   與 `playStep`（SP 原生）的差異：**只有發聲方式**。下面每一個音符的
  //   pitch／時值／音量／觸發時機，全部抄自 `playStep` 原本那幾行（見對照）：
  //     · 鼓點時機 `th.kick[i]`（原版）
  //     · 拍手 `i % 8 === 4`（原版）
  //     · 閉帽 `i % (th.hat * 2) === 0 || (th.hat === 1 && i % 2 === 0)`（原版）
  //     · 貝斯音高 `rootNote - 12`（原版，非 013 的 `rootDeg - OCT + …`）
  //     · 琶音／旋律 `rootNote + 12 + scale[(deg + a) % len] + oct*12`（原版）
  //     · 和弦鋪底 `rootNote + scale[(deg + k) % len] + oct*12`（原版）
  //   換掉的只有波形／濾波／包絡：
  //     · kick  正弦 140→30 斜線 → 013 的 150→42 Hz 滑音（更黏）
  //     · 拍手  帶通噪聲 → 013 的 Q0.8 帶通拍手
  //     · 貝斯  裸鋸齒 → 低通 520 Hz 鋸齒（起音 4ms）
  //     · 琶音  方波 → 低通 3200 Hz 三角＋送 delay 殘響
  //     · 鋪底  長三角 → 慢起音（250ms）低通 1400 Hz 三角
  //   聲部音量沿用 SP 原值（0.7／0.3／0.09／0.1）—— 這些值本來就是對
  //   `bgmG = bgmVol * 0.32` 調的，因此與其餘 SP 曲天然同量級，不乘 V013。
  // ══════════════════════════════════════════════════════════════════════════
  private playStep013Tone(th: Theme, s: number, delay: number) {
    const i = s % 16;
    const bar = Math.floor(s / 16) % th.prog.length;
    const deg = th.prog[bar];
    const rootNote = th.root + th.scale[deg % th.scale.length];
    const d = Math.max(0, delay);
    const dest = this.bgmT;
    const sd = 60 / th.bpm / 4;
    // 鼓組：013 的 150→42 Hz 滑音正弦，音量用 SP 原版的 0.7
    if (th.kick[i]) {
      const c = this.ctx;
      if (c) {
        const t = c.currentTime + d;
        const o = c.createOscillator(), g = c.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        g.gain.setValueAtTime(0.7, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.22);
      }
    }
    // 拍手：SP 原版的時機（i % 8 === 4）＋ 013 的 Q0.8 帶通拍手設計
    if (i % 8 === 4) this.noise013(d, 0.14, 0.32, 4200, 1800, "bandpass", dest, 0.8);
    // 閉帽：SP 原版的時機與 hat 語意，013 的高速高通噪聲設計
    if (i % (th.hat * 2) === 0 || (th.hat === 1 && i % 2 === 0)) {
      this.noise013(d, 0.03, 0.1, 9000, 7000, "highpass", dest);
    }
    // 貝斯：SP 原版音高（rootNote - 12）＋ 013 的低通鋸齒設計（音量 0.3）
    if (th.bassPat[i]) {
      this.osc013("sawtooth", this.midi(rootNote - 12), sd * 1.6, 0.3, d, dest, 520);
    }
    // 主旋律：**013 的 lead 聲部**（方波＋微失諧鋸齒雙層、低通、送 delay），
    //   而不是 013 的「琶音」聲部（單層低通三角）。
    //     `_bgm_loud.mjs` 實測顯示新版整體 LUFS 反而比舊版**高 1.8 dB** —— 不是總量問題。
    //     舊版主旋律是方波（奇次泛音豐富、穿透力強），第一版改用低通三角後泛音幾乎為零，
    //     旋律被貝斯與和弦鋪底蓋掉 → 聽起來「很小聲」。
    //     來源 013 的旋律本來就走 `lead` 聲部（square 0.12 ＋ saw 0.06），這裡改回它；
    //     音量乘 V013 換算到 SP 的匯流排（013 mus 0.5 vs SP bgmG 0.32）。
    const a = th.arpPat[i % th.arpPat.length];
    if (i % 2 === 0 || th.lead) {
      const n = rootNote + 12 + th.scale[(deg + a) % th.scale.length] + (Math.floor((deg + a) / th.scale.length) * 12);
      const f = this.midi(n);
      this.osc013("square", f, sd * 0.95, 0.12 * V013, d, dest, 2600, 1);
      this.osc013("sawtooth", f * 1.004, sd * 0.95, 0.06 * V013, d, dest, 2200, 1);
    }
    // 和弦鋪底（小節首）：SP 原版音高算法＋013 的慢起音低通鋪底（音量 0.1）
    if (i === 0) {
      [0, 2, 4].forEach((k) => {
        const n = rootNote + th.scale[(deg + k) % th.scale.length] + Math.floor((deg + k) / th.scale.length) * 12;
        this.osc013("triangle", this.midi(n), (60 / th.bpm) * 3.6, 0.1, d, dest, 1400, 0, 0.25);
      });
    }
  }

  private playStep013(th: Theme, s: number, delay: number) {
    const dest = this.bgmT;
    const d = Math.max(0, delay);
    const sd = 60 / th.bpm / 4;
    const OCT = th.scale.length; // 一個八度＝幾個音階度數
    const st = s % 16;
    const bar = Math.floor(s / 16);
    const rootDeg = th.prog[bar % th.prog.length];
    const tones = th.arpTones ?? [0, 2, 4, 7, 9, 11];
    // 鼓組：150→42 Hz 滑音正弦（013 的 kick 比 SP／008 更「黏」
    if (th.kick[st]) {
      const c = this.ctx;
      if (c) {
        const t = c.currentTime + d;
        const o = c.createOscillator(), g = c.createGain();
        o.frequency.setValueAtTime(150, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        g.gain.setValueAtTime(0.9 * V013, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.22);
      }
    }
    if (th.hat > 0 && (st === 4 || st === 12)) this.noise013(d, 0.14, 0.3 * V013, 4200, 1800, "bandpass", dest, 0.8);
    if (th.hat > 0 && (st % 2 === 0 || th.hat === 2)) {
      this.noise013(d, st % 4 === 2 && th.hat === 2 ? 0.09 : 0.03, (st % 4 === 2 ? 0.1 : 0.06) * V013, 9000, 7000, "highpass", dest);
    }
    // 貝斯：低通鋸齒（來源音量 0.3 → 乘 V013）
    const bp = th.bassPat[st];
    if (bp >= 0) {
      const m = this.degMidi(th, rootDeg - OCT + (bp === 1 ? 4 : bp === 2 ? 7 : 0)) - 12;
      this.osc013("sawtooth", this.midi(m), sd * 1.6, 0.3 * V013, d, dest, 520);
    }
    // 琶音：低通三角＋delay 送出
    const ap = th.arpPat[st];
    if (ap >= 0) {
      const m = this.degMidi(th, rootDeg + (tones[ap % tones.length] ?? 0) + OCT);
      this.osc013("triangle", this.midi(m), sd * 1.3, 0.17 * V013, d, dest, 3200, 1);
    }
    // 和弦鋪底（小節首）
    if (st === 0) {
      for (const k of [0, 2, 4]) this.osc013("triangle", this.midi(this.degMidi(th, rootDeg + k)), sd * 15, 0.07 * V013, d, dest, 1400);
    }
    // 旋律（方波＋微失諧鋸齒雙層）
    if (th.lead) {
      const mel = MEL013[this.theme] ?? MEL013[16] ?? ["................"];
      const row = (mel[bar % mel.length] || "").padEnd(16, ".");
      const ch = row[st];
      if (ch && ch !== "." && ch !== "-") {
        let len = 1;
        while (st + len < 16 && row[st + len] === "-") len++;
        const deg = parseInt(ch, 36);
        if (!Number.isFinite(deg)) return;
        const f = this.midi(this.degMidi(th, deg) + 12);
        this.osc013("square", f, sd * len * 0.95, 0.12 * V013, d, dest, 2600, 1);
        this.osc013("sawtooth", f * 1.004, sd * len * 0.95, 0.06 * V013, d, dest, 2200, 1);
      }
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // port/015《星詠序曲》血統的步進器（來源：port/015/src/game/audio.ts 的 `play`）
  //
  // 與 013／008 的語意差異：
  //   kick   位元旗標：1＝大鼓、2＝小鼓、3＝兩者（SP／013／008 都只有「有／無」）
  //   bassPat 0 休止／1 根音／2 根音+7（拉長 1.6 倍）／3 根音+4
  //   arpPat  0 休止／1~4 索引 `[0,0,2,4,7]`（度數偏移）
  //   旋律    `MEL015` 的「度數:步數」記法，度數以 root+12 為 0
  //   音色    滑音 kick、帶通小鼓（噪＋三角）、高通帽、低通鋸齒＋正弦貝斯、
  //           方波＋高八度三角琶音（送 delay）、失諧雙層 lead（LFO 顫音、送 delay）
  //   音量    全部沿用 015 原值 —— 匯流排倍率已對齊（見 `BGM_BUS`），不再另乘係數。
  // ══════════════════════════════════════════════════════════════════════════
  private playStep015(th: Theme, s: number, delay: number) {
    if (!this.ctx) return;
    const dest = this.bgmT;
    const d = Math.max(0, delay);
    const sd = 60 / th.bpm / 4;
    const i = s % 16;
    const bar = Math.floor(s / 16) % th.prog.length;
    const rd = th.prog[bar];
    const k = th.kick[i] ?? 0;
    if (k & 1) this.kick015(d, 0.95);
    if ((k & 2) && P015_NOISE_PERC) this.snare015(d);
    if (th.hat && P015_NOISE_PERC) {
      if (i % 2 === 1) this.hat015(d, 0.5, false);
      else if (th.hat === 2 && i % 4 === 2) this.hat015(d, 0.8, true);
      else if (i % 4 === 0) this.hat015(d, 0.3, false);
    }
    const bp = th.bassPat[i] ?? 0;
    if (bp) {
      const deg = bp === 1 ? rd : bp === 2 ? rd + 7 : bp === 3 ? rd + 4 : rd + 2;
      this.bass015(this.midi(this.degMidi(th, deg) - 12), d, sd * (bp === 2 ? 1.6 : 1.9));
    }
    const ap = th.arpPat[i] ?? 0;
    if (ap) {
      const deg = rd + [0, 0, 2, 4, 7][ap];
      this.arp015(this.midi(this.degMidi(th, deg) + 12), d, sd * 1.6);
    }
    if (i === 0) for (const o of [0, 2, 4]) this.pad015(this.midi(this.degMidi(th, rd + o)), d, sd * 16);
    if (th.lead) {
      const mel = mel015(this.theme);
      const ev = mel.length ? mel[s % mel.length] : null;
      if (ev) this.lead015(this.midi(this.degMidi(th, ev.deg) + 12), d, sd * ev.len * 0.96);
    }
  }

  /** 015 的包絡（來源 `g()`）：線性起音 → 指數收音。 */
  private env015(vol: number, delay: number, at: number, dur: number, dest: AudioNode) {
    const c = this.ctx!;
    const t = c.currentTime + Math.max(0, delay);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + at);
    g.gain.exponentialRampToValueAtTime(0.0001, t + at + Math.max(0.02, dur));
    g.connect(dest);
    return g;
  }

  private kick015(delay: number, vol: number) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + Math.max(0, delay);
    const o = c.createOscillator();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    o.connect(this.env015(vol, delay, 0.002, 0.18, this.bgmT));
    o.start(t);
    o.stop(t + 0.22);
  }

  /** 015 的噪聲（來源 `noise()`）：單一濾波器＋可選掃頻。
   *  `lp`＝額外的低通（Hz），用來砍掉「高通之後一路延伸到 Nyquist」的極高頻。
   *  `at`＝起音秒數（來源固定 0.002；SP 端為「喀」聲問題可拉長，見 `hat015`）。 */
  private noise015(delay: number, dur: number, vol: number, type: BiquadFilterType, f: number, dest: AudioNode, f1?: number, lp?: number, at = 0.002) {
    const c = this.ctx;
    if (!c || !this.noiseBuf) return;
    const t = c.currentTime + Math.max(0, delay);
    const n = c.createBufferSource();
    n.buffer = this.noiseBuf;
    const fl = c.createBiquadFilter();
    fl.type = type;
    fl.frequency.setValueAtTime(f, t);
    if (f1) fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    n.connect(fl);
    let out: AudioNode = fl;
    if (lp) {
      // 兩顆串聯（4 階、24 dB/oct）：單顆 2 階在 12~20 kHz 只壓得下 10 dB，
      // 這首的帽子還是會透出「嗶」聲。串兩顆才追得上「關掉帽子」的水準。
      for (let k = 0; k < 2; k++) {
        const lpf = c.createBiquadFilter();
        lpf.type = "lowpass";
        lpf.frequency.value = lp;
        lpf.Q.value = 0.7;
        out.connect(lpf);
        out = lpf;
      }
    }
    out.connect(this.env015(vol, delay, at, dur, dest));
    n.start(t, Math.random() * 0.5);
    n.stop(t + dur + 0.05);
  }

  private snare015(delay: number) {
    // 來源原值：`noise(0.15, 0.4, bandpass 1800→900)` ＋ 三角波 220→120／0.35。
    // 第四輪起改回原值（起音也回 2ms）—— 靠 `CMP_SRC` 的總線壓縮器抹圓，不再人工柔化。
    this.noise015(delay, 0.15, 0.4, "bandpass", 1800, this.bgmT, 900, undefined, 0.002);
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + Math.max(0, delay);
    const o = c.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.1);
    o.connect(this.env015(0.35, delay, 0.002, 0.11, this.bgmT));
    o.start(t);
    o.stop(t + 0.15);
  }

  /** 015 的帽子（來源 `hat()`：`highpass 7500` 的寬頻噪聲、音量 0.16×v、2ms 起音）。
   *
   *  ⚠ 第二～三輪曾在這裡加 9 kHz 低通、改帶通、把起音拉到 10ms、音量降到 0.10，
   *  全都沒解決 —— 因為問題不在音色，在**總線壓縮器**（見 `Theme.cmp`／`CMP_SRC`）。
   *  第四輪起改回來源原值：移植就是照抄，不要在這裡加自己的猜測。 */
  private hat015(delay: number, v: number, open: boolean) {
    this.noise015(delay, open ? 0.2 : 0.045, 0.16 * v, "highpass", 7500, this.bgmT, undefined, undefined, 0.002);
  }

  /** 015 的單音（來源 `osc()`）：線性起音 → 指數收音，可帶低通與失諧。
   *  `at`＝起音秒數（來源 0.006；SP 端打擊類拉到 0.008~0.01 收掉硬邊）。 */
  private osc015(type: Wave, f: number, delay: number, dur: number, vol: number, dest: AudioNode, lp = 0, det = 0, at = 0.006) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + Math.max(0, delay);
    const o = c.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = det;
    const g = this.env015(vol, delay, at, dur, dest);
    if (lp) {
      const fl = c.createBiquadFilter();
      fl.type = "lowpass";
      fl.frequency.setValueAtTime(lp * 3, t);
      fl.frequency.exponentialRampToValueAtTime(lp, t + dur * 0.8);
      fl.connect(g);
      o.connect(fl);
    } else o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.06);
  }

  private bass015(f: number, delay: number, dur: number) {
    // 來源原值：sawtooth 0.26（低通 520）＋ sine 0.3，起音一律 0.006。
    this.osc015("sawtooth", f, delay, dur, 0.26, this.bgmT, 520);
    this.osc015("sine", f, delay, dur, 0.3, this.bgmT);
  }

  private arp015(f: number, delay: number, dur: number) {
    // 來源原值：square 0.07（低通 2600）＋ 高八度 triangle 0.05 送 delay（經 0.35 送出級）。
    this.osc015("square", f, delay, dur, 0.07, this.bgmT, 2600);
    if (this.delay013) this.osc015("triangle", f * 2, delay, dur * 0.6, 0.05, this.delay013);
  }

  private pad015(f: number, delay: number, dur: number) {
    const c = this.ctx;
    if (!c) return;
    for (const det of [-7, 7]) {
      const t = c.currentTime + Math.max(0, delay);
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = det;
      const fl = c.createBiquadFilter();
      fl.type = "lowpass";
      fl.frequency.value = 900;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.035, t + dur * 0.3);
      g.gain.linearRampToValueAtTime(0.0001, t + dur);
      o.connect(fl);
      fl.connect(g);
      g.connect(this.bgmT);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  /** 015 的旋律聲部：鋸齒(-6 cent)＋方波(+6 cent) 雙層、LFO 5.2Hz 顫音、低通 3200、送 delay 0.5。 */
  private lead015(f: number, delay: number, dur: number) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + Math.max(0, delay);
    const g = this.env015(0.15, delay, 0.012, Math.max(0.08, dur), this.bgmT);
    if (this.delay013) {
      const send = c.createGain();
      send.gain.value = 0.5;
      g.connect(send);
      send.connect(this.delay013);
    }
    const lfo = c.createOscillator();
    lfo.frequency.value = 5.2;
    const lg = c.createGain();
    lg.gain.value = 7;
    lfo.connect(lg);
    for (const [ty, det] of [["sawtooth", -6], ["square", 6]] as [OscillatorType, number][]) {
      const o = c.createOscillator();
      o.type = ty;
      o.frequency.value = f;
      o.detune.value = det;
      lg.connect(o.detune);
      const fl = c.createBiquadFilter();
      fl.type = "lowpass";
      fl.frequency.value = 3200;
      o.connect(fl);
      fl.connect(g);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
  }

  /** 013 血統的單音（對應來源 `osc`：線性起音＋指數收音，可帶低通與 delay 送出）。
   *  `at`＝起音秒數（來源鋪底用 0.25 的慢起音；其餘皆 0.005）。 */  private osc013(type: Wave, f: number, dur: number, vol: number, delay: number, dest: AudioNode, lp?: number, send?: number, at = 0.005) {
    const c = this.ctx;
    if (!c) return;
    const t = c.currentTime + Math.max(0, delay);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + at);
    g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, 0.03));
    let out: AudioNode = o;
    if (lp) { const fl = c.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; o.connect(fl); out = fl; }
    out.connect(g);
    g.connect(dest);
    if (send && this.delay013) g.connect(this.delay013);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  /** 013 血統的噪器（對應來源 `nz`，多一個 Q 值）。 */
  private noise013(delay: number, dur: number, vol: number, f0: number, f1: number, type: BiquadFilterType, dest: AudioNode, q = 1) {
    const c = this.ctx;
    if (!c || !this.noiseBuf) return;
    const t = c.currentTime + Math.max(0, delay);
    const s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter();
    s.buffer = this.noiseBuf;
    fl.type = type;
    fl.Q.value = q;
    fl.frequency.setValueAtTime(f0, t);
    fl.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl); fl.connect(g); g.connect(dest);
    s.start(t);
    s.stop(t + dur + 0.05);
  }

  /** 旋律聲部：雙 saw 失諧 ＋ 低通掃頻 ＋ 顫音 ＋ delay 送出（來源 port/008 的 leadNote） */
  private leadNote(f: number, delay: number, dur: number, dest: AudioNode, boss: boolean) {
    const a = this.ctx;
    if (!a) return;
    const t = a.currentTime + Math.max(0, delay);
    const g = a.createGain();
    const flt = a.createBiquadFilter();
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(boss ? 3600 : 2600, t);
    flt.frequency.exponentialRampToValueAtTime(900, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(boss ? 0.13 : 0.11, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.06, t + Math.min(dur, 0.2));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.05);
    flt.connect(g);
    g.connect(dest);
    if (this.delay) g.connect(this.delay);
    const lfo = a.createOscillator();
    const lg = a.createGain();
    lfo.frequency.value = 5.5;
    lg.gain.setValueAtTime(0, t);
    lg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.3, dur));
    lfo.connect(lg);
    for (const det of [-7, 7]) {
      const o = a.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, t);
      o.detune.value = det;
      lg.connect(o.frequency);
      o.connect(flt);
      o.start(t);
      o.stop(t + dur + 0.1);
    }
    lfo.start(t);
    lfo.stop(t + dur + 0.1);
  }
}

export const audio = new AudioSys();
