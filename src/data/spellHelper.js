// LogiFit - Hiragana Spell Engine (ふっかつのじゅもん) - 12文字軽量版

// 厳選した64文字のひらがな（1文字あたり6ビットの情報を格納可能）
const CHARS = [
  'あ', 'う', 'え', 'お', 
  'か', 'き', 'く', 'け', 'こ', 
  'さ', 'し', 'す', 'せ', 'そ', 
  'た', 'ち', 'つ', 'て', 'と', 
  'な', 'ぬ', 'ね', 'の', 
  'は', 'ひ', 'ふ', 'ほ', 
  'ま', 'み', 'む', 'め', 'も', 
  'や', 'ゆ', 'よ', 
  'ら', 'る', 'れ', 'ろ', 
  'わ', 'ん',
  'が', 'ぎ', 'ぐ', 'げ', 'ご',
  'ざ', 'じ', 'ず', 'ぜ', 'ぞ',
  'だ', 'で', 'ど',
  'ば', 'び', 'ぶ', 'ぼ',
  'ぱ', 'ぴ', 'ぷ', 'ぽ'
];

// Type ID to Numeric mapping for spell encoding (4 bits: 0 - 15)
const TYPE_TO_NUM = {
  frogAnalyst: 0,
  balancedThinker: 1,
  psycho: 2,
  nitpicker: 3,
  radicalOrigin: 4,
  runawayTrain: 5,
  monster: 6,
  philosopher: 7,
  judgmentBrain: 8,
  visionary: 9,
  sentimentalWatcher: 10,
  pureDreamer: 11
};

const NUM_TO_TYPE = [
  "frogAnalyst",
  "balancedThinker",
  "psycho",
  "nitpicker",
  "radicalOrigin",
  "runawayTrain",
  "monster",
  "philosopher",
  "judgmentBrain",
  "visionary",
  "sentimentalWatcher",
  "pureDreamer"
];

/**
 * ユーザーの進捗ステータスを12文字のひらがなの「じゅもん」にエンコードします。
 * 新データ総ビット数: 61ビット (データ) + 11ビット (チェックサム) = 72ビット
 * 72ビット / 6ビット = 12文字
 */
export function encodeState(state) {
  try {
    let value = 0n;
    let offset = 0n;

    // 1. Level (7 bits: 0 - 127)
    value |= BigInt(state.level & 0x7F) << offset;
    offset += 7n;

    // 2. XP (9 bits: level-internal XP 0 - 499)
    const savedXp = (state.xp !== undefined ? state.xp : 0) % 500;
    value |= BigInt(savedXp & 0x1FF) << offset;
    offset += 9n;

    // 3. Score: factsOpinions (7 bits: 0 - 127)
    value |= BigInt((state.scores.factsOpinions || 0) & 0x7F) << offset;
    offset += 7n;

    // 4. Score: logicalValidity (7 bits: 0 - 127)
    value |= BigInt((state.scores.logicalValidity || 0) & 0x7F) << offset;
    offset += 7n;

    // 5. Score: logicTree (7 bits: 0 - 127)
    value |= BigInt((state.scores.logicTree || 0) & 0x7F) << offset;
    offset += 7n;

    // 6. Score: fallacy (7 bits: 0 - 127)
    value |= BigInt((state.scores.fallacy || 0) & 0x7F) << offset;
    offset += 7n;

    // 7. Score: empathyDialogue (7 bits: 0 - 127)
    value |= BigInt((state.scores.empathyDialogue || 0) & 0x7F) << offset;
    offset += 7n;

    // 8. Badges (6 bits: supports up to 6 badges. Reduced from 8 bits to free up bits)
    let badgeBits = 0;
    if (state.badges && Array.isArray(state.badges)) {
      state.badges.slice(0, 6).forEach((b, i) => {
        if (b) badgeBits |= (1 << i);
      });
    }
    value |= BigInt(badgeBits & 0x3F) << offset;
    offset += 6n;

    // 9. Diagnostic Type ID (4 bits: 0 - 15) [NEW]
    const typeId = state.diagnosticTypeId !== undefined 
      ? (TYPE_TO_NUM[state.diagnosticTypeId] || 0) 
      : 0;
    value |= BigInt(typeId & 0x0F) << offset;
    offset += 4n; // 合計 61 ビットのデータ

    // 10. Checksum (11 bits) - 誤入力検知用
    let checksum = 0n;
    let t = value;
    while (t > 0n) {
      checksum ^= (t & 0x7FFn); // 11ビット単位でXORを取る
      t >>= 11n;
    }
    checksum &= 0x7FFn;

    value |= checksum << offset;
    offset += 11n; // 合計 72 ビット

    // 6ビットずつひらがなに変換 (12文字)
    let spell = "";
    let temp = value;
    for (let i = 0; i < 12; i++) {
      const idx = Number(temp & 63n);
      spell += CHARS[idx];
      temp >>= 6n;
    }

    return spell;
  } catch (error) {
    console.error("Failed to encode state:", error);
    return "";
  }
}

/**
 * ひらがなの「じゅもん」をデコードして、ユーザーの進捗ステータスを復元します。
 * 新形式 (61ビットデータ) と 旧形式 (59ビットデータ) の双方をチェックサムで自動判別します（後方互換性）。
 */
export function decodeState(spell) {
  const cleanSpell = spell.replace(/[\s　\-_]/g, "");

  if (cleanSpell.length !== 12) {
    throw new Error("じゅもんの　ながさが　ただしくありません");
  }

  // ひらがな文字列から72ビットの数値を復元
  let value = 0n;
  for (let i = 11; i >= 0; i--) {
    const char = cleanSpell[i];
    const idx = CHARS.indexOf(char);
    if (idx === -1) {
      throw new Error(`つかえない　もじ「${char}」が　まざっています`);
    }
    value = (value << 6n) | BigInt(idx);
  }

  // 1. 新形式 (61ビットデータ + 11ビットチェックサム = 72ビット) のチェックサム検証
  const newFormatDataValue = value & ((1n << 61n) - 1n);
  const newFormatChecksum = Number((value >> 61n) & 0x7FFn);
  
  let calculatedNewChecksum = 0n;
  let tNew = newFormatDataValue;
  while (tNew > 0n) {
    calculatedNewChecksum ^= (tNew & 0x7FFn);
    tNew >>= 11n;
  }
  calculatedNewChecksum &= 0x7FFn;

  if (calculatedNewChecksum === BigInt(newFormatChecksum)) {
    // 新形式としてアンパック
    let offset = 0n;

    const level = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const savedXp = Number((value >> offset) & 0x1FFn);
    offset += 9n;

    const factsOpinions = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const logicalValidity = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const logicTree = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const fallacy = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const empathyDialogue = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const badgeBits = Number((value >> offset) & 0x3Fn);
    offset += 6n;

    const typeNum = Number((value >> offset) & 0x0Fn);
    const diagnosticTypeId = NUM_TO_TYPE[typeNum] || "balancedThinker";

    const badges = [];
    for (let i = 0; i < 5; i++) {
      badges.push((badgeBits & (1 << i)) !== 0);
    }
    const xp = Math.max(0, (level - 1) * 500) + savedXp;

    return {
      level,
      xp,
      scores: {
        factsOpinions,
        logicalValidity,
        logicTree,
        fallacy,
        empathyDialogue
      },
      badges,
      diagnosticTypeId,
      calendar: Array(35).fill(false)
    };
  }

  // 2. 旧形式 (59ビットデータ + 11ビットチェックサム = 70ビット) のチェックサム検証 (後方互換用)
  const oldFormatDataValue = value & ((1n << 59n) - 1n);
  const oldFormatChecksum = Number((value >> 59n) & 0x7FFn);

  let calculatedOldChecksum = 0n;
  let tOld = oldFormatDataValue;
  while (tOld > 0n) {
    calculatedOldChecksum ^= (tOld & 0x7FFn);
    tOld >>= 11n;
  }
  calculatedOldChecksum &= 0x7FFn;

  if (calculatedOldChecksum === BigInt(oldFormatChecksum)) {
    // 旧形式としてアンパック
    let offset = 0n;

    const level = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const savedXp = Number((value >> offset) & 0x1FFn);
    offset += 9n;

    const factsOpinions = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const logicalValidity = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const logicTree = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const fallacy = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const empathyDialogue = Number((value >> offset) & 0x7Fn);
    offset += 7n;

    const badgeBits = Number((value >> offset) & 0xFFn);
    // 旧形式には diagnosticTypeId はないため、トレーニングスコアから推測決定
    let diagId = "balancedThinker";
    const L = logicalValidity, C = fallacy, R = logicTree, E = empathyDialogue;
    const maxVal = Math.max(L, C, R, E);
    const minVal = Math.min(L, C, R, E);
    if (maxVal - minVal <= 15) {
      diagId = (L+C+R+E)/4 >= 20 ? "frogAnalyst" : "balancedThinker";
    } else {
      if (maxVal === L) diagId = "psycho";
      else if (maxVal === C) diagId = "nitpicker";
      else if (maxVal === R) diagId = "radicalOrigin";
      else if (maxVal === E) diagId = "runawayTrain";
    }

    const badges = [];
    for (let i = 0; i < 5; i++) {
      badges.push((badgeBits & (1 << i)) !== 0);
    }
    const xp = Math.max(0, (level - 1) * 500) + savedXp;

    return {
      level,
      xp,
      scores: {
        factsOpinions,
        logicalValidity,
        logicTree,
        fallacy,
        empathyDialogue
      },
      badges,
      diagnosticTypeId: diagId,
      calendar: Array(35).fill(false)
    };
  }

  throw new Error("じゅもんが　ちがいます。もういちど　たしかめてください");
}

/**
 * 二人の進捗ステータスから「脳内摩擦係数 (0 - 100%)」と相性診断結果を算出します。
 */
export function calculateFriction(stateA, stateB) {
  try {
    const typeA = stateA.diagnosticTypeId || "balancedThinker";
    const typeB = stateB.diagnosticTypeId || "balancedThinker";

    const getLCRE = (state) => {
      const L = Math.round(((state.scores.logicalValidity || 0) + (state.scores.factsOpinions || 0) / 2) / 150 * 100);
      const C = Math.round((state.scores.fallacy || 0) / 100 * 100);
      const R = Math.round((state.scores.logicTree || 0) / 100 * 100);
      const E = Math.round((state.scores.empathyDialogue || 0) / 100 * 100);
      return { L, C, R, E };
    };

    const vA = getLCRE(stateA);
    const vB = getLCRE(stateB);

    const diffL = vA.L - vB.L;
    const diffC = vA.C - vB.C;
    const diffR = vA.R - vB.R;
    const diffE = vA.E - vB.E;
    
    const distance = Math.sqrt(diffL*diffL + diffC*diffC + diffR*diffR + diffE*diffE);
    const maxDistance = 200; 
    const scoreDiffPct = Math.min(100, Math.round((distance / maxDistance) * 100));

    const key = [typeA, typeB].sort().join("-");
    let baseFriction = 50; 
    let pairName = "未知の境界線ペア";
    let desc = "まだお互いの思考ギアがどう噛み合うか測りかねています。";
    let advice = "まずは『事実と意見』を分け合うような、シンプルな会話から始めてみましょう。";

    const PAIR_DATABASE = {
      "psycho-runawayTrain": {
        base: 92,
        name: "絶対零度と熱気球の衝突",
        desc: "ファクトで殴りたいデータ脳と、心で語りたいエモーショナル脳のペア。会話の第一声から『で、要するに結論は？』と『ねえ、私の話聞いてる？』が衝突し、火花が飛び散ります。",
        advice: "データ脳はまず『大変だったね』と共感ワードを3秒言い、感情脳は『相談なんだけど解決策がほしい』と目的を宣言すると摩擦が減ります。"
      },
      "nitpicker-runawayTrain": {
        base: 88,
        name: "防壁インスペクターと爆走機関車",
        desc: "リスクを見破りたい慎重派と、直感で飛び出したいパッション派。一方が楽しそうに提案するたびに、もう一方が冷静に粗を探してブレーキを踏むため、摩擦熱でエンストを起こします。",
        advice: "慎重派はダメ出しの前に『そのアイデアいいね』とまず肯定し、パッション派は行動前に『このリスクどう思う？』とあえて相手に頼ってみてください。"
      },
      "nitpicker-sentimentalWatcher": {
        base: 82,
        name: "疑惑の監視官ダブルス",
        desc: "粗探しセンサーと、他人の顔色センサーがぶつかるペア。『相手はどう思っているか』『何が裏にあるか』をお互いに深読みし合うため、腹の探り合いで空気圧が極限まで高まります。",
        advice: "言葉の裏を疑うのをやめ、『思ったことはストレートに言葉にする』という透明なルールを作ることがデバッグの鍵です。"
      },
      "pureDreamer-visionary": {
        base: 65,
        name: "成層圏の空中散歩ペア",
        desc: "未来を設計したいビジョナリーと、愛を歌いたいドリーマー。どちらも思考が『地球外（成層圏）』に浮いているため、会話は非常に高尚で美しいですが、現実の生活力・事務作業が地上一面で完全にフリーズします。",
        advice: "予定調整やゴミ出しなどの泥臭い実務は、アラームやリマインダーを徹底して使い、システムに管理してもらいましょう。"
      },
      "judgmentBrain-runawayTrain": {
        base: 85,
        name: "正論の刃と傷つきやすきハート",
        desc: "正しさで決断する裁判官と、感情のスポンジ。裁判官の繰り出す鋭い正論のナイフが、相手の柔らかなハートを悪気なく切り裂いてしまい、一言言うだけで大喧嘩に発展します。",
        advice: "裁判官は『正しいアドバイス』を言う前に、相手が求めているのは解決（L）か共感（E）かをまず確認しましょう。"
      },
      "frogAnalyst-frogAnalyst": {
        base: 15,
        name: "無風の並行世界",
        desc: "どちらもすべてが見えすぎている知恵の神官同士。摩擦がまったく起きない代わりに、お互いに相手の思考の最適解が分かりすぎてしまい、会話がテレパシーのように省略されます。",
        advice: "たまには無駄な雑談や、非合理的な直感だけでお互いを振り回してみるのが、関係に新しい風を吹き込むスパイスになります。"
      },
      "balancedThinker-balancedThinker": {
        base: 10,
        name: "摩擦ゼロの無重力ダンス",
        desc: "何も考えていない野生のトリックスター同士。摩擦はゼロ。その場のノリと空気だけでふわふわと進むため、最高に気楽ですが、大事な決定がいつまで経っても決まりません。",
        advice: "たまには第三者のデータ（L）や批判的視点（C）を外部から導入して、強制的に着地する仕組みを作りましょう。"
      },
      "balancedThinker-psycho": {
        base: 75,
        name: "ロボットと野生児",
        desc: "すべてを合理で整理したいロボットと、ノリだけで生き抜く野生児。野生児のいい加減さにロボットのプログラムがバグり、ロボットの四角四面さに野生児が飽きて逃げ出します。",
        advice: "ロボットは野生児の想定外のアクションを『バグの娯楽』として楽しみ、野生児はロボットのルールを『外付けの補助脳』として借りるとうまくいきます。"
      }
    };

    let details = PAIR_DATABASE[key];
    if (details) {
      baseFriction = details.base;
      pairName = details.name;
      desc = details.desc;
      advice = details.advice;
    } else {
      baseFriction = 40 + Math.round(scoreDiffPct * 0.5);
      if (baseFriction > 75) {
        pairName = "異次元のすれ違いペア";
        desc = "お互いの主要な思考ギアが大きく異なっており、良かれと思って放った一言がことごとくズレて噛み合いません。";
        advice = "言葉だけで理解しようとせず、相手の行動の『前提（何を優先しているか）』を観察してみましょう。";
      } else if (baseFriction < 35) {
        pairName = "シンクロ率高めの双子脳ペア";
        desc = "思考のパターンや葛藤の仕方が似ており、言いたいことが直感的に伝わりやすい安定したペアです。";
        advice = "居心地が良すぎて現状維持になりがち。たまには外からの客観的な意見を取り入れてみましょう。";
      } else {
        pairName = "噛み合う歯車シナジーペア";
        desc = "お互いの得意・お得意がちょうど良く補完し合えるバランス。摩擦は時々起きますが、それを糧に前に進めます。";
        advice = "衝突が起きたときは『脳の摩擦係数が上がった＝新しい発見のチャンス』と捉えて、お互いの視点を整理しましょう。";
      }
    }

    const avgLevel = (stateA.level + stateB.level) / 2;
    const levelMitigation = Math.min(20, Math.round(avgLevel * 1.5));
    const finalFriction = Math.max(5, Math.min(99, baseFriction - levelMitigation));

    return {
      friction: finalFriction,
      pairName,
      description: desc,
      advice,
      typeA,
      typeB
    };
  } catch (error) {
    console.error("Failed to calculate friction:", error);
    return {
      friction: 50,
      pairName: "エラーペア",
      description: "摩擦係数の読み込みに失敗しました。",
      advice: "呪文が正しいかもう一度確認してください。",
      typeA: "balancedThinker",
      typeB: "balancedThinker"
    };
  }
}
