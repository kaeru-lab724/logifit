// LogiFit - Hiragana Spell Engine (ふっかつのじゅもん) - 12文字軽量版

// 厳選した64文字のひらがな（1文字あたり6ビットの情報を格納可能）
// 誤読や入力の間違いを減らすため、以下の文字を除外:
// 「い, へ, り, ぢ, づ, べ, を, に」
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

/**
 * ユーザーの進捗ステータスを12文字のひらがなの「じゅもん」にエンコードします。
 * データの総ビット数: 59ビット (データ) + 11ビット (チェックサム) = 70ビット (残り2ビットは未使用)
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

    // 8. Badges (8 bits for unlock state flags)
    let badgeBits = 0;
    if (state.badges && Array.isArray(state.badges)) {
      state.badges.forEach((b, i) => {
        if (b) badgeBits |= (1 << i);
      });
    }
    value |= BigInt(badgeBits & 0xFF) << offset;
    offset += 8n; // 合計 59 ビットのデータ

    // 9. Checksum (11 bits) - 誤入力検知用
    let checksum = 0n;
    let t = value;
    while (t > 0n) {
      checksum ^= (t & 0x7FFn); // 11ビット単位でXORを取る
      t >>= 11n;
    }
    checksum &= 0x7FFn;

    value |= checksum << offset;
    offset += 11n; // 合計 70 ビット (残り2ビットは未使用)

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

  // 各データをアンパック
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
  offset += 8n;

  const checksum = Number((value >> offset) & 0x7FFn);

  // チェックサム検証
  // 59ビット分のデータ値からチェックサムを計算
  const dataValue = value & ((1n << 59n) - 1n);
  let calculatedChecksum = 0n;
  let t = dataValue;
  while (t > 0n) {
    calculatedChecksum ^= (t & 0x7FFn);
    t >>= 11n;
  }
  calculatedChecksum &= 0x7FFn;

  if (calculatedChecksum !== BigInt(checksum)) {
    throw new Error("じゅもんが　ちがいます。もういちど　たしかめてください");
  }

  // バッジ配列の復元
  const badges = [];
  for (let i = 0; i < 5; i++) {
    badges.push((badgeBits & (1 << i)) !== 0);
  }

  // XPの復元: (level - 1) * 500 + savedXp
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
    calendar: Array(35).fill(false) // 互換性のためのダミー値
  };
}
