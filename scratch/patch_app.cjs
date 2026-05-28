const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '        {/* Dashboard Home */}';
const endMarker = '        )}\n      </main>';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error('Start marker not found');
  process.exit(1);
}

const endIndex = content.indexOf(endMarker);
if (endIndex === -1) {
  console.error('End marker not found');
  process.exit(1);
}

// We want to keep `\n      </main>` but replace everything else from startMarker to the end of `        )}`
const targetLength = endIndex + '        )}'.length - startIndex;
const originalBlock = content.substr(startIndex, targetLength);

const replacementBlock = `        {/* Dashboard Home */}
        {activeGame === null && (
          <Dashboard
            isNewUser={isNewUser}
            isFullUnlocked={isFullUnlocked}
            gameState={gameState}
            charClass={charClass}
            playSound={playSound}
            setActiveGame={setActiveGame}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mode={mode}
            displayScores={displayScores}
            primaryDebugCategory={primaryDebugCategory}
            rooms={rooms}
            spellInput={spellInput}
            setSpellInput={setSpellInput}
            spellError={spellError}
            spellSuccess={spellSuccess}
            handleRestoreSpell={handleRestoreSpell}
            handleCopySpell={handleCopySpell}
            currentSpell={currentSpell}
            setShowGuideModal={setShowGuideModal}
            badgeDetails={badgeDetails}
            skillsData={skillsData}
          />
        )}`;

content = content.replace(originalBlock, replacementBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard block successfully replaced!');
