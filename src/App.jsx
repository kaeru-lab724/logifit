import React, { useState, useEffect } from 'react';
import { useSound } from './hooks/useSound';
import { encodeState, decodeState } from './data/spellHelper';
import { skillsData } from './data/questions';
import FactsOpinions from './components/games/FactsOpinions';
import LogicalValidity from './components/games/LogicalValidity';
import LogicTreeAssembler from './components/games/LogicTreeAssembler';
import FallacyDetective from './components/games/FallacyDetective';
import DiagnosticContainer from './components/DiagnosticContainer';
import RakutenWidget from './components/common/RakutenWidget';
import Dashboard from './components/Dashboard';
import { 
  Award, 
  Brain, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Copy,
  Lock,
  Unlock,
  KeyRound,
  Sword,
  Search,
  Sun,
  Moon
} from 'lucide-react';

const DEFAULT_STATE = {
  level: 1,
  xp: 0,
  scores: {
    factsOpinions: 0,
    logicalValidity: 0,
    logicTree: 0,
    fallacy: 0
  },
  badges: [false, false, false, false, false]
};

// クラス進化（肩書き）の判定
const getCharacterClass = (scores, level) => {
  const { factsOpinions: fo, logicalValidity: lv, logicTree: lt, fallacy: fa } = scores;
  const avg = (fo + lv + lt + fa) / 4;
  
  if (avg === 0) return { title: '思考の初心者', desc: 'まだ思考の筋トレを始めていません。いずれかのトレーニングに挑戦しましょう！' };
  if (avg >= 95) return { title: '超越した論理知性 (超人類)', desc: 'すべての論理領域で極限に達した、未来の思考者。隙のない完璧なロジックを展開します。' };
  if (fo >= 80 && lv >= 80 && lt >= 80 && fa >= 80) return { title: '万能 of ロジシャン', desc: '分析・推論・構造化・批判思考のすべてを高い水準で兼ね備えた、論理のオールラウンダー。' };
  
  // 特定分野が突出している場合
  const maxScore = Math.max(fo, lv, lt, fa);
  if (maxScore >= 75) {
    if (maxScore === fo && fo >= maxScore - 5) return { title: 'データ主義の科学的探偵', desc: '主観や推測を排除し、冷徹な客観的「事実」のみを証拠として積み上げる分析のスペシャリスト。' };
    if (maxScore === lv && lv >= maxScore - 5) return { title: '論理の絶対守護者 (司法官)', desc: '寸の狂いもない三段論法と推論規則を駆使し、議論に正しい道筋を示すロジックの使い手。' };
    if (maxScore === lt && lt >= maxScore - 5) return { title: '思考の構造化アーキテクト', desc: '複雑に絡み合った課題をMECEに分解し、一目で全体像と原因を整理してしまう構造化の達人。' };
    if (maxScore === fa && fa >= maxScore - 5) return { title: '詭弁を暴くサイバーハンター', desc: '対話や文章の小さなほころび、ストローマン等の論理的誤謬を決して見逃さない批判思考の探偵。' };
  }
  
  if (level >= 5) return { title: '鍛え上げられた思考の兵士', desc: '日々の筋トレを継続し、思考の体力を身につけた実戦的な論理のプレイヤー。' };
  return { title: '論理思考の挑戦者', desc: '論理的思考力を鍛え始めたばかりの開拓者。日々のトレーニングが脳の回路を活性化させます。' };
};

// 自動推奨ゲームのキー選定
const getRecommendedGameKey = (scores) => {
  const keys = ['factsOpinions', 'logicalValidity', 'logicTree', 'fallacy'];
  
  // 1. 未プレイ（0%）を優先
  for (const key of keys) {
    if ((scores[key] || 0) === 0) {
      return key;
    }
  }
  
  // 2. 100%未満で最もスコアが低いもの
  let minScore = 101;
  let recommendedKey = keys[0];
  let hasIncomplete = false;
  
  for (const key of keys) {
    const score = scores[key] || 0;
    if (score < 100) {
      hasIncomplete = true;
      if (score < minScore) {
        minScore = score;
        recommendedKey = key;
      }
    }
  }
  
  // 3. 全て100%の場合は最初のゲーム
  if (!hasIncomplete) {
    return 'factsOpinions';
  }
  
  return recommendedKey;
};

// ゲームキーから表示名へのマッピング
const getGameName = (key) => {
  const names = {
    factsOpinions: '事実 vs 意見',
    logicalValidity: '論理の妥当性',
    logicTree: 'ロジックツリー',
    fallacy: '論理的誤謬の特定'
  };
  return names[key] || '';
};

export default function App() {
  const { playSound, muted, toggleMute } = useSound();
  const [activeGame, setActiveGame] = useState(null);
  const [mode, setMode] = useState('daily');
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('logifit_color_theme') || 'dark';
  });

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'mode_change', {
        event_category: 'Settings',
        event_label: mode
      });
    }
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'theme_change', {
        event_category: 'Settings',
        event_label: theme
      });
    }
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('logifit_color_theme', theme);
  }, [theme]);
  
  // アプリ全体のステータス管理
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('logifit_save_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      // カレンダーが残っている場合はクリーンアップして返す
      if (parsed.calendar) {
        delete parsed.calendar;
        delete parsed.lastLogin;
      }
      return parsed;
    }
    
    // 古い形式のスコアデータがある場合のマイグレーション
    const oldScores = localStorage.getItem('logifit_scores');
    if (oldScores) {
      const parsedScores = JSON.parse(oldScores);
      return {
        ...DEFAULT_STATE,
        scores: parsedScores,
        xp: Object.values(parsedScores).reduce((acc, curr) => acc + curr * 10, 0),
        level: Math.max(1, Math.floor(Object.values(parsedScores).reduce((acc, curr) => acc + curr * 10, 0) / 500) + 1)
      };
    }
    return DEFAULT_STATE;
  });

  // 呪文入力とエラー状態
  const [spellInput, setSpellInput] = useState('');
  const [spellError, setSpellError] = useState('');
  const [spellSuccess, setSpellSuccess] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('logifit_seen_guide');
    if (gameState.xp === 0 && !seen) {
      setShowGuideModal(true);
      localStorage.setItem('logifit_seen_guide', 'true');
    }
  }, [gameState.xp]);

  // Google Analytics ゲーム開始の計測
  useEffect(() => {
    if (activeGame && window.gtag) {
      window.gtag('event', 'game_start', {
        event_category: 'Game',
        event_label: activeGame,
        mode: mode
      });
    }
  }, [activeGame]);

  // Google Analytics ガイド表示の計測
  useEffect(() => {
    if (showGuideModal && window.gtag) {
      window.gtag('event', 'show_guide', {
        event_category: 'Engagement'
      });
    }
  }, [showGuideModal]);

  // 報酬ポップアップモーダル状態
  const [rewardModal, setRewardModal] = useState({
    show: false,
    type: 'level', // 'level' or 'badge'
    title: '',
    value: '',
    spell: ''
  });

  // ゲーム終了時のスコア・XP更新、レベルアップ・バッジ判定
  const handleGameFinish = (gameKey, score, shouldExit = true) => {
    playSound('click');
    
    setGameState(prev => {
      const prevScores = prev.scores;
      const prevBest = prevScores[gameKey] || 0;
      
      const newBest = Math.max(prevBest, score);
      const updatedScores = {
        ...prevScores,
        [gameKey]: newBest
      };

      const scoreDiff = Math.max(0, score - prevBest);
      const earnedXp = scoreDiff * 10;
      const newXp = prev.xp + earnedXp;
      
      const newLevel = Math.floor(newXp / 500) + 1;
      const isLevelUp = newLevel > prev.level;

      const newBadges = [
        updatedScores.factsOpinions >= 80,
        updatedScores.logicalValidity >= 80,
        updatedScores.logicTree >= 100,
        updatedScores.fallacy >= 80,
        Object.values(updatedScores).every(s => s > 0)
      ];

      const newlyUnlockedBadgeIdx = newBadges.findIndex((unlocked, idx) => unlocked && !prev.badges[idx]);
      const isBadgeUnlocked = newlyUnlockedBadgeIdx !== -1;

      const updatedState = {
        ...prev,
        scores: updatedScores,
        xp: newXp,
        level: newLevel,
        badges: newBadges
      };

      localStorage.setItem('logifit_save_data', JSON.stringify(updatedState));

      // レベルアップまたはバッジ獲得時の報酬ポップアップ表示
      if (isLevelUp) {
        setTimeout(() => {
          playSound('success');
          const currentSpell = encodeState(updatedState);
          setRewardModal({
            show: true,
            type: 'level',
            title: 'レベルアップ！',
            value: `LEVEL ${newLevel}`,
            spell: currentSpell
          });
        }, 800);
      } else if (isBadgeUnlocked) {
        setTimeout(() => {
          playSound('success');
          const badgeNames = ['ファクト調査官', '冷徹なロジシャン', 'ツリーの巨匠', '論破マスター', '論理の求道者'];
          const currentSpell = encodeState(updatedState);
          setRewardModal({
            show: true,
            type: 'badge',
            title: '実績アンロック！',
            value: badgeNames[newlyUnlockedBadgeIdx],
            spell: currentSpell
          });
        }, 800);
      }

      return updatedState;
    });

    if (window.gtag && !shouldExit) {
      window.gtag('event', 'game_clear', {
        event_category: 'Game',
        event_label: gameKey,
        score: score,
        mode: mode
      });
    }

    if (shouldExit) {
      setActiveGame(null);
    }
  };

  // ふっかつのじゅもん復元処理
  const handleRestoreSpell = (e) => {
    e.preventDefault();
    setSpellError('');
    setSpellSuccess(false);

    try {
      playSound('click');
      const restoredState = decodeState(spellInput);

      setGameState(restoredState);
      localStorage.setItem('logifit_save_data', JSON.stringify(restoredState));
      
      setSpellSuccess(true);
      setSpellInput('');
      playSound('correct');
    } catch (err) {
      playSound('incorrect');
      setSpellError(err.message || 'じゅもんの解析に失敗しました。');
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('これまでの学習データをすべてリセットしますか？')) {
      playSound('click');
      setGameState(DEFAULT_STATE);
      localStorage.setItem('logifit_save_data', JSON.stringify(DEFAULT_STATE));
    }
  };

  const handleShareToX = (text) => {
    playSound('click');
    const appUrl = 'https://www.logifit.site/';
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopySpell = (spellText) => {
    navigator.clipboard.writeText(spellText);
    playSound('click');
    alert('ふっかつのじゅもんをクリップボードにコピーしました！');
  };

  const charClass = getCharacterClass(gameState.scores, gameState.level);
  const recGameKey = getRecommendedGameKey(gameState.scores);
  const isAllCompleted = Object.values(gameState.scores).every(s => s >= 100);
  const isNewUser = Object.values(gameState.scores).every(s => s === 0) && gameState.xp === 0;
  const currentSpell = encodeState(gameState);
  const [activeTab, setActiveTab] = useState('training');

  const badgeDetails = [
    { title: 'ファクト調査官', desc: '「事実 vs 意見」で80%以上', color: 'var(--color-cyan)', colorRgb: '6, 182, 212' },
    { title: '冷徹なロジシャン', desc: '「論理の妥当性」で80%以上', color: 'var(--color-emerald)', colorRgb: '16, 185, 129' },
    { title: 'ツリーの巨匠', desc: '「ロジックツリー」で100%', color: 'var(--color-amber)', colorRgb: '245, 158, 11' },
    { title: '論破マスター', desc: '「論理的誤謬」で80%以上', color: 'var(--color-rose)', colorRgb: '244, 63, 94' },
    { title: '論理の求道者', desc: 'すべてのトレーニングを体験', color: 'var(--color-primary)', colorRgb: '139, 92, 246' }
  ];

  return (
    <div className="app-container">
      {/* Header Navigation */}
      <header 
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          marginTop: '24px',
          borderRadius: '16px',
          borderWidth: '1px'
        }}
      >
        <div 
          onClick={() => { playSound('click'); setActiveGame(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div 
            style={{ 
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-cyan) 100%)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Brain size={20} color="#fff" />
          </div>
          <span 
            style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: '800', 
              fontSize: '22px', 
              letterSpacing: '1px',
              background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            LogiFit
          </span>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* Mode Switcher */}
          <div 
            className="glass-panel" 
            style={{ 
              display: 'inline-flex', 
              padding: '2px', 
              borderRadius: '20px', 
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--border-color)',
              opacity: activeGame !== null ? 0.5 : 1,
              transition: 'opacity 0.3s'
            }}
          >
            <button
              onClick={() => { playSound('click'); setMode('daily'); }}
              disabled={activeGame !== null}
              className="btn"
              style={{
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: mode === 'daily' ? 'linear-gradient(135deg, var(--color-cyan) 0%, #0891b2 100%)' : 'transparent',
                border: 'none',
                color: mode === 'daily' ? '#0a0b10' : 'var(--text-secondary)',
                boxShadow: mode === 'daily' ? '0 0 10px var(--color-cyan-glow)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: activeGame !== null ? 'not-allowed' : 'pointer'
              }}
              title={activeGame !== null ? "ゲーム中は切り替えられません" : "日常モード (入門)"}
            >
              🌿 入門
            </button>
            <button
              onClick={() => { playSound('click'); setMode('business'); }}
              disabled={activeGame !== null}
              className="btn"
              style={{
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 'bold',
                background: mode === 'business' ? 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' : 'transparent',
                border: 'none',
                color: mode === 'business' ? '#fff' : 'var(--text-secondary)',
                boxShadow: mode === 'business' ? '0 0 10px var(--color-primary-glow)' : 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: activeGame !== null ? 'not-allowed' : 'pointer'
              }}
              title={activeGame !== null ? "ゲーム中は切り替えられません" : "ビジネスモード (中級)"}
            >
              💼 中級
            </button>
          </div>

          {/* XP & Level */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Level</span>
            <div 
              style={{ 
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: 'var(--color-primary)',
                fontWeight: 'bold',
                padding: '4px 10px',
                borderRadius: '8px',
                fontFamily: 'var(--font-display)'
              }}
            >
              {gameState.level}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              ({gameState.xp} XP)
            </span>
          </div>

          {/* Theme Toggle (Light/Dark) */}
          <button 
            onClick={() => { playSound('click'); setTheme(prev => prev === 'dark' ? 'light' : 'dark'); }}
            className="btn btn-secondary" 
            style={{ padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            onClick={toggleMute}
            className="btn btn-secondary" 
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        {activeGame === 'factsOpinions' && (
          <FactsOpinions 
            onFinish={handleGameFinish} 
            playSound={playSound} 
            muted={muted} 
            toggleMute={toggleMute} 
            mode={mode}
          />
        )}
        {activeGame === 'logicalValidity' && (
          <LogicalValidity 
            onFinish={handleGameFinish} 
            playSound={playSound} 
            muted={muted} 
            toggleMute={toggleMute} 
            mode={mode}
          />
        )}
        {activeGame === 'logicTree' && (
          <LogicTreeAssembler 
            onFinish={handleGameFinish} 
            playSound={playSound} 
            muted={muted} 
            toggleMute={toggleMute} 
            mode={mode}
          />
        )}
        {activeGame === 'fallacy' && (
          <FallacyDetective 
            onFinish={handleGameFinish} 
            playSound={playSound} 
            muted={muted} 
            toggleMute={toggleMute} 
            mode={mode}
          />
        )}
        {activeGame === 'diagnostic' && (
          <DiagnosticContainer 
            onSelectGame={(gameKey) => {
              playSound('click');
              setActiveGame(gameKey);
            }} 
          />
        )}

        {/* Dashboard Home */}
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
        )}
      </main>

      {/* Rewards Popup Modal */}
      {rewardModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div 
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-cyan) 100%)',
                width: '60px',
                height: '60px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 20px var(--color-primary-glow)'
              }}
            >
              <Sparkles size={32} color="#fff" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>
              {rewardModal.title}
            </h2>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-primary)', margin: '8px 0 24px', textShadow: '0 0 10px var(--color-primary-glow)' }}>
              {rewardModal.value}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', marginBottom: '16px' }}>
              データが「ふっかつのじゅもん」に保存されました！コピーしてメモ帳などに大切に保管してください。
            </p>

            <div className="spell-box">
              <span>{rewardModal.spell}</span>
              <button 
                onClick={() => handleCopySpell(rewardModal.spell)}
                className="btn btn-secondary"
                style={{ padding: '6px', borderRadius: '8px', minWidth: 'auto', background: 'rgba(255,255,255,0.05)' }}
                title="コピー"
              >
                <Copy size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => handleShareToX(
                  rewardModal.type === 'level'
                    ? `✨ 思考の筋トレ「LogiFit」でレベルアップ！\n【${rewardModal.value}】に到達しました！脳の回路が活性化中。\n\n#LogiFit #ロジフィット #論理的思考`
                    : `🏆 思考の筋トレ「LogiFit」で実績アンロック！\n称号【${rewardModal.value}】を獲得しました！\n\n#LogiFit #ロジフィット #論理的思考`
                )}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '14px' }}
              >
                𝕏 でシェア
              </button>
              <button 
                onClick={() => setRewardModal(prev => ({ ...prev, show: false }))} 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '12px', fontSize: '14px' }}
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <GuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
      )}

      {/* Unlock Modal (🎉 すべての部屋が解放されました！ ) */}
      {showUnlockModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '480px', padding: '36px' }}>
            <div 
              style={{ 
                background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-primary) 100%)',
                width: '64px',
                height: '64px',
                borderRadius: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)',
                animation: 'pulse 2s infinite'
              }}
            >
              <Sparkles size={34} color="#fff" />
            </div>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', marginBottom: '12px', color: 'var(--text-primary)' }}>
              🎉 思考ルーム全解放！
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              おめでとうございます！最初のトレーニングミッションをクリアし、脳内OSのデバッグ能力が証明されました。<br/>
              これで<strong>すべての思考ルーム（ロジカル、クリティカル、ラディカル、エモーショナル）</strong>と、図鑑・実績機能が完全に解放されました！
            </p>

            <button 
              onClick={() => {
                playSound('correct');
                setShowUnlockModal(false);
              }} 
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '14px', 
                fontSize: '15px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-primary) 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
              }}
            >
              思考ジムへ入室する
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer 
        style={{ 
          borderTop: '1px solid var(--border-color)', 
          padding: '24px 0', 
          color: 'var(--text-muted)', 
          fontSize: '13px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          © 2026 kaeru-lab. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>思考のフィットネスで、揺るぎないロジックを。</span>
        </div>
      </footer>
    </div>
  );
}

function GuideModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const stepsContent = [
    {
      title: "🌿 1. 難易度モードを選ぼう",
      description: "LogiFitには『日常編（入門）』と『ビジネス編（中級）』の2つの難易度モードがあります。ヘッダー右上のトグルボタンでいつでも切り替えられます。初心者の方は、まず優しい『日常編』から始めるのがおすすめです！",
      icon: <Sparkles size={48} style={{ color: 'var(--color-cyan)' }} />
    },
    {
      title: "🎯 2. クイズで論理脳を鍛えよう",
      description: "『事実 vs 意見』『論理の妥当性』『ロジックツリー』『論理的誤謬の特定』の4つのトレーニングがあります。どれも1プレイ3分程度。問題の背景や日常会話から『論理 of バグ』を探し出すゲーム形式です。",
      icon: <Brain size={48} style={{ color: 'var(--color-primary)' }} />
    },
    {
      title: "📊 3. 思考力パラメータで強みを知ろう",
      description: "クイズを終えると、あなたの能力が『思考力パラメーター（レーダーチャート）』にリアルタイムで反映されます。弱い部分を繰り返しトレーニングして、バランスの良い『万能ロジシャン』を目指しましょう！",
      icon: <TrendingUp size={48} style={{ color: 'var(--color-emerald)' }} />
    },
    {
      title: "💾 4. ふっかつのじゅもんで保存",
      description: "獲得したレベルやXP、バッジ実績はブラウザに自動保存されます。他のPCやスマホでも同じレベルからプレイしたい時は、『ふっかつのじゅもん（パスワード）』をコピーして入力すれば、いつでも続きから再開可能です。",
      icon: <KeyRound size={48} style={{ color: 'var(--color-amber)' }} />
    }
  ];

  const current = stepsContent[step - 1];

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(10, 11, 16, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          background: 'var(--modal-bg)',
          border: '1px solid var(--modal-border)',
          borderRadius: '24px',
          padding: '32px',
          textAlign: 'center',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.55), 0 0 30px rgba(139, 92, 246, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            color: 'var(--text-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s'
          }}
        >
          &times;
        </button>

        {/* Icon Frame */}
        <div 
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 0 15px rgba(255,255,255,0.01)',
            marginBottom: '8px'
          }}
        >
          {current.icon}
        </div>

        {/* Text Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            {current.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: 0, textAlign: 'left', minHeight: '110px' }}>
            {current.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div style={{ display: 'flex', gap: '8px', margin: '8px 0' }}>
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx}
              style={{
                width: idx + 1 === step ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx + 1 === step ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.15)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
          {step > 1 && (
            <button 
              onClick={handlePrev}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '12px' }}
            >
              戻る
            </button>
          )}
          <button 
            onClick={handleNext}
            className="btn btn-primary"
            style={{
              flex: 2,
              padding: '12px',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
            }}
          >
            {step === totalSteps ? 'はじめる！' : '次へ'}
          </button>
        </div>

      </div>
    </div>
  );
}
