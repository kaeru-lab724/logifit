import { encodeState, decodeState, calculateFriction } from "../src/data/spellHelper.js";

console.log("=== STARTING BRAIN CODE SYSTEM VERIFICATION ===");

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

// 2. Encode to new alphanumeric Brain Code
const brainCode = encodeState(mockState);
console.log(`Generated Alphanumeric Brain Code: ${brainCode} (Length: ${brainCode.length})`);

// Validate that it consists of URL-safe Base64 alphanumeric characters
const isAlphanumericCode = /^[A-Za-z0-9\-_]+$/.test(brainCode);
if (isAlphanumericCode && brainCode.length === 12) {
  console.log("✅ Code format is URL-safe alphanumeric Base64!");
} else {
  console.error("❌ Code format is invalid!", brainCode);
  process.exit(1);
}

// 3. Decode back and verify
const decodedState = decodeState(brainCode);
console.log("Decoded new Brain Code state:", JSON.stringify(decodedState, null, 2));

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
  console.log("✅ Alphanumeric Encode/Decode verification SUCCESSFUL!");
} else {
  console.error("❌ Alphanumeric Encode/Decode verification FAILED!");
  process.exit(1);
}

// 4. Test backward compatibility (decode old Hiragana spell)
// Let's use a known valid old-format hiragana spell that we generated in the previous test: "せぷしぬごごぶふげゆはす"
const oldHiraganaSpell = "せぷしぬごごぶふげゆはす";
console.log(`Testing old Hiragana spell decoding: ${oldHiraganaSpell}`);

try {
  const decodedOld = decodeState(oldHiraganaSpell);
  console.log("Decoded old Hiragana spell state:", JSON.stringify(decodedOld, null, 2));
  
  if (decodedOld.level === 12 && decodedOld.scores.logicalValidity === 90) {
    console.log("✅ Backward compatibility verification SUCCESSFUL!");
  } else {
    console.error("❌ Decoded state properties did not match expected values!");
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Failed to decode old Hiragana spell:", error);
  process.exit(1);
}

// 5. Test friction calculation between a new Brain Code user and an old Hiragana spell user
const stateA = decodedState; // nitpicker (new code)
const stateB = decodeState(oldHiraganaSpell); // psycho (old spell)

const frictionResult = calculateFriction(stateA, stateB);
console.log("Friction calculation results (Nitpicker x Psycho):", JSON.stringify(frictionResult, null, 2));

if (frictionResult.friction > 0 && frictionResult.pairName !== "") {
  console.log("✅ Mixed-format friction calculation verification SUCCESSFUL!");
} else {
  console.error("❌ Friction calculation failed!");
  process.exit(1);
}

console.log("=== ALL BRAIN CODE SYSTEM TESTS PASSED ===");
