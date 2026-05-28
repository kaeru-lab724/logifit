import { encodeState, decodeState, calculateFriction } from "../src/data/spellHelper.js";

console.log("=== STARTING SPELL ENGINE VERIFICATION ===");

// 1. Mock user state
const mockState = {
  level: 12,
  xp: 350,
  scores: {
    factsOpinions: 80,
    logicalValidity: 90,
    logicTree: 45,
    fallacy: 60,
    empathyDialogue: 70
  },
  badges: [true, false, true, true, false, false],
  diagnosticTypeId: "nitpicker"
};

// 2. Encode to spell
const spell = encodeState(mockState);
console.log(`Generated spell: ${spell} (Length: ${spell.length})`);

// 3. Decode back
const decodedState = decodeState(spell);
console.log("Decoded state:", JSON.stringify(decodedState, null, 2));

// Verify fields
const checks = [
  decodedState.level === mockState.level,
  decodedState.scores.factsOpinions === mockState.scores.factsOpinions,
  decodedState.scores.logicalValidity === mockState.scores.logicalValidity,
  decodedState.scores.logicTree === mockState.scores.logicTree,
  decodedState.scores.fallacy === mockState.scores.fallacy,
  decodedState.scores.empathyDialogue === mockState.scores.empathyDialogue,
  decodedState.badges[0] === true && decodedState.badges[1] === false && decodedState.badges[2] === true,
  decodedState.diagnosticTypeId === mockState.diagnosticTypeId
];

if (checks.every(Boolean)) {
  console.log("✅ Encode/Decode verification SUCCESSFUL!");
} else {
  console.error("❌ Encode/Decode verification FAILED!");
  process.exit(1);
}

// 4. Test Compatibility with Old Spells
// Let's create an old format mock value manually and encode it using old rules to test back-compatibility
// An old format spell is 59 bits data + 11 bits checksum = 70 bits.
// Old data structure: level(7), savedXp(9), facts(7), logic(7), tree(7), fallacy(7), empathy(7), badges(8) = 59 bits.
function encodeOldSpell(state) {
  let value = 0n;
  let offset = 0n;
  value |= BigInt(state.level & 0x7F) << offset; offset += 7n;
  value |= BigInt((state.xp % 500) & 0x1FF) << offset; offset += 9n;
  value |= BigInt(state.scores.factsOpinions & 0x7F) << offset; offset += 7n;
  value |= BigInt(state.scores.logicalValidity & 0x7F) << offset; offset += 7n;
  value |= BigInt(state.scores.logicTree & 0x7F) << offset; offset += 7n;
  value |= BigInt(state.scores.fallacy & 0x7F) << offset; offset += 7n;
  value |= BigInt(state.scores.empathyDialogue & 0x7F) << offset; offset += 7n;
  let badgeBits = 0;
  state.badges.forEach((b, i) => { if (b) badgeBits |= (1 << i); });
  value |= BigInt(badgeBits & 0xFF) << offset; offset += 8n;

  let checksum = 0n;
  let t = value;
  while (t > 0n) {
    checksum ^= (t & 0x7FFn);
    t >>= 11n;
  }
  checksum &= 0x7FFn;
  value |= checksum << offset;

  // Convert to 12 hiragana characters
  const CHARS = [
    'あ', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 
    'な', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'る', 'れ', 'ろ', 
    'わ', 'ん', 'が', 'ぎ', 'ぐ', 'げ', 'ご', 'ざ', 'じ', 'ず', 'ぜ', 'ぞ', 'だ', 'で', 'ど', 'ば', 'び', 'ぶ', 'ぼ', 
    'ぱ', 'ぴ', 'ぷ', 'ぽ'
  ];
  let spellStr = "";
  let temp = value;
  for (let i = 0; i < 12; i++) {
    spellStr += CHARS[Number(temp & 63n)];
    temp >>= 6n;
  }
  return spellStr;
}

const oldSpell = encodeOldSpell(mockState);
console.log(`Generated old spell: ${oldSpell}`);

const decodedOld = decodeState(oldSpell);
console.log("Decoded old format state:", JSON.stringify(decodedOld, null, 2));

if (decodedOld.level === mockState.level && decodedOld.scores.factsOpinions === mockState.scores.factsOpinions) {
  console.log("✅ Back-compatibility verification SUCCESSFUL!");
} else {
  console.error("❌ Back-compatibility verification FAILED!");
  process.exit(1);
}

// 5. Test Friction Calculation
const stateA = decodedState; // nitpicker
const stateB = {
  level: 10,
  xp: 120,
  scores: {
    factsOpinions: 20,
    logicalValidity: 30,
    logicTree: 40,
    fallacy: 20,
    empathyDialogue: 95
  },
  badges: [true, false, false, false, false, false],
  diagnosticTypeId: "runawayTrain"
};

const frictionResult = calculateFriction(stateA, stateB);
console.log("Friction result between Nitpicker and RunawayTrain:", JSON.stringify(frictionResult, null, 2));

if (frictionResult.friction > 0 && frictionResult.pairName === "防壁インスペクターと爆走機関車") {
  console.log("✅ Friction calculation verification SUCCESSFUL!");
} else {
  console.error("❌ Friction calculation verification FAILED!");
  process.exit(1);
}

console.log("=== ALL SPELL ENGINE TESTS PASSED ===");
