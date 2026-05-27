import React, { useState, useEffect } from 'react';
import { useSound } from './hooks/useSound';
import { encodeState, decodeState } from './data/spellHelper';
import { skillsData } from './data/questions';
import FactsOpinions from './components/games/FactsOpinions';
import LogicalValidity from './components/games/LogicalValidity';
import LogicTreeAssembler from './components/games/LogicTreeAssembler';
import FallacyDetective from './components/games/FallacyDetective';
import RakutenWidget from './components/common/RakutenWidget';
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

  const handleCopySpell = (spellText) => {
    navigator.clipboard.writeText(spellText);
    playSound('click');
    alert('ふっかつのじゅもんをクリップボードにコピーしました！');
  };

  const charClass = getCharacterClass(gameState.scores, gameState.level);
  const recGameKey = getRecommendedGameKey(gameState.scores);
  const isAllCompleted = Object.values(gameState.scores).every(s => s >= 100);
  const currentSpell = encodeState(gameState);
  const [activeTab, setActiveTab] = useState('training');

  const badgeDetails = [
    { title: 'ファクト調査官', desc: '「事実 vs 意見」で80%以上', color: 'var(--color-cyan)' },
    { title: '冷徹なロジシャン', desc: '「論理の妥当性」で80%以上', color: 'var(--color-emerald)' },
    { title: 'ツリーの巨匠', desc: '「ロジックツリー」で100%', color: 'var(--color-amber)' },
    { title: '論破マスター', desc: '「論理的誤謬」で80%以上', color: 'var(--color-rose)' },
    { title: '論理の求道者', desc: 'すべてのトレーニングを体験', color: 'var(--color-primary)' }
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

        {/* Dashboard Home */}
        {activeGame === null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="fade-in">
            
            {/* Hero & Evolution Status */}
            <div 
              className="glass-panel"
              style={{
                padding: '40px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                background: 'var(--hero-bg)',
                borderLeft: '4px solid var(--color-primary)'
              }}
            >
              <div style={{ flex: '1 1 450px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-badge-text)', fontWeight: 'bold', background: 'var(--color-badge-bg)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-badge-border)' }}>
                    現在の進化クラス
                  </span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
                    {charClass.title}
                  </strong>
                </div>

                <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '32px', letterSpacing: '-0.5px', marginBottom: '8px', marginTop: 0 }}>
                  思考の基礎体力を、ここから。
                </h1>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14px', marginBottom: '12px' }}>
                  {charClass.desc}
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '24px', lineHeight: '1.5' }}>
                  LogiFit（ロジフィット）は、前提知識ゼロから考え、間違えながら基本を体得する「ロジカルシンキング入門総合ジム」です。まずは3分間の脳のストレッチを始めましょう。
                </p>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px' }}>
                  <button 
                    onClick={() => { playSound('click'); setActiveGame(recGameKey); }} 
                    className="btn btn-primary"
                    style={{
                      background: recGameKey === 'factsOpinions' ? 'linear-gradient(135deg, var(--color-cyan) 0%, #0891b2 100%)' :
                                  recGameKey === 'logicalValidity' ? 'linear-gradient(135deg, var(--color-emerald) 0%, #059669 100%)' :
                                  recGameKey === 'logicTree' ? 'linear-gradient(135deg, var(--color-amber) 0%, #d97706 100%)' :
                                  'linear-gradient(135deg, var(--color-rose) 0%, #e11d48 100%)'
                    }}
                  >
                    {getGameName(recGameKey)} を開始
                  </button>
                  <button 
                    onClick={() => { playSound('click'); setShowGuideModal(true); }}
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 20px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <HelpCircle size={16} />
                    はじめてガイド
                  </button>
                </div>
              </div>

              {/* Radar Chart Panel */}
              <div 
                className="glass-panel"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  minWidth: '320px'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  思考力パラメーター
                </div>
                <svg width="320" height="300" style={{ overflow: 'visible' }}>
                  <polygon points="160,70 240,150 160,230 80,150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <polygon points="160,102 208,150 160,198 112,150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <polygon points="160,126 184,150 160,174 136,150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

                  <line x1="160" y1="70" x2="160" y2="230" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
                  <line x1="80" y1="150" x2="240" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />

                  {/* Labels */}
                  <text x="160" y="44" textAnchor="middle" fill="var(--color-cyan)" fontSize="11" fontWeight="bold">
                    事実分析 <tspan fill="var(--text-muted)" fontSize="9" fontWeight="normal">(FACT)</tspan>
                  </text>
                  <text x="248" y="138" textAnchor="start" fill="var(--color-emerald)" fontSize="11" fontWeight="bold">
                    演繹・推論
                    <tspan x="248" dy="14" fill="var(--text-muted)" fontSize="9" fontWeight="normal">(LOGIC)</tspan>
                  </text>
                  <text x="160" y="252" textAnchor="middle" fill="var(--color-amber)" fontSize="11" fontWeight="bold">
                    構造化 <tspan fill="var(--text-muted)" fontSize="9" fontWeight="normal">(MECE)</tspan>
                  </text>
                  <text x="72" y="138" textAnchor="end" fill="var(--color-rose)" fontSize="11" fontWeight="bold">
                    批判思考
                    <tspan x="72" dy="14" fill="var(--text-muted)" fontSize="9" fontWeight="normal">(FALLACY)</tspan>
                  </text>

                  {/* Scores */}
                  <text x="160" y="58" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">{gameState.scores.factsOpinions}%</text>
                  <text x="248" y="168" textAnchor="start" fill="var(--text-secondary)" fontSize="10">{gameState.scores.logicalValidity}%</text>
                  <text x="160" y="266" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">{gameState.scores.logicTree}%</text>
                  <text x="72" y="168" textAnchor="end" fill="var(--text-secondary)" fontSize="10">{gameState.scores.fallacy}%</text>

                  <circle cx="160" cy="150" r="3" fill="var(--text-muted)" />

                  <polygon 
                    points={(() => {
                      const s1 = gameState.scores.factsOpinions || 10;
                      const s2 = gameState.scores.logicalValidity || 10;
                      const s3 = gameState.scores.logicTree || 10;
                      const s4 = gameState.scores.fallacy || 10;
                      return `160,${150 - 80 * (s1 / 100)} ${160 + 80 * (s2 / 100)},150 160,${150 + 80 * (s3 / 100)} ${160 - 80 * (s4 / 100)},150`;
                    })()} 
                    fill="rgba(139, 92, 246, 0.25)" 
                    stroke="var(--color-primary)" 
                    strokeWidth="2.5"
                    style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                  
                  {gameState.scores.factsOpinions > 0 && <circle cx="160" cy={150 - 80 * (gameState.scores.factsOpinions / 100)} r="4" fill="var(--color-cyan)" />}
                  {gameState.scores.logicalValidity > 0 && <circle cx={160 + 80 * (gameState.scores.logicalValidity / 100)} cy="150" r="4" fill="var(--color-emerald)" />}
                  {gameState.scores.logicTree > 0 && <circle cx="160" cy={150 + 80 * (gameState.scores.logicTree / 100)} r="4" fill="var(--color-amber)" />}
                  {gameState.scores.fallacy > 0 && <circle cx={160 - 80 * (gameState.scores.fallacy / 100)} cy="150" r="4" fill="var(--color-rose)" />}
                </svg>
              </div>
            </div>


            {/* Tab Navigation */}
            <div 
              style={{ 
                display: 'flex', 
                gap: '12px', 
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '12px',
                marginBottom: '8px',
                marginTop: '16px'
              }}
            >
              {[
                { id: 'training', label: '🎯 トレーニング', count: null },
                { id: 'encyclopedia', label: '📖 思考スキル図鑑', count: Object.values(gameState.scores).filter(s => s >= 80).length },
                { id: 'achievements', label: '🏆 獲得実績', count: gameState.badges.filter(Boolean).length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { playSound('click'); setActiveTab(tab.id); }}
                  className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    background: activeTab === tab.id 
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' 
                      : 'rgba(255, 255, 255, 0.02)',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                    border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
                    boxShadow: activeTab === tab.id ? '0 0 12px var(--color-primary-glow)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <span>{tab.label}</span>
                  {tab.count !== null && (
                    <span 
                      style={{ 
                        fontSize: '11px', 
                        background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                        padding: '2px 6px',
                        borderRadius: '6px',
                        marginLeft: '4px'
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'training' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="fade-in">
            {/* Features Section */}
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                textAlign: 'left'
              }}
            >
              <div 
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderTop: '3px solid var(--color-cyan)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', color: 'var(--color-cyan)' }}>
                    <Brain size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>1回3分の直感的な脳トレ</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  専門書のような難解な数式や専門用語は一切不要。日常の会話や仕事の身近なシーンをテーマにした直感的な問題で、脳の思考力をストレッチします。
                </p>
              </div>

              <div 
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderTop: '3px solid var(--color-primary)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', color: 'var(--color-primary)' }}>
                    <TrendingUp size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>4つの思考力を可視化</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  「事実の切り分け」「推論」「構造化」「批判思考」の4軸であなたの強み・弱みを分析。レーダーチャートで成長をリアルタイムに確認できます。
                </p>
              </div>

              <div 
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderTop: '3px solid var(--color-emerald)',
                  background: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px', display: 'flex', color: 'var(--color-emerald)' }}>
                    <Award size={20} />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>🌿選べる2モード 💾保存も完璧</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                  主婦や初心者向けの「日常編（シアン色）」と、実務に役立つ「ビジネス編（パープル色）」をトグルで簡単切替。「ふっかつのじゅもん」で端末を跨いでの記録復元も可能です。
                </p>
              </div>
            </div>

            {/* Middle Section: Modules & Sidebars */}
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', textAlign: 'left' }}>
              
              {/* Training Modules Grid */}
              <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
                  {mode === 'daily' ? 'トレーニングメニュー（日常編・入門）' : 'トレーニングメニュー（ビジネス編）'}
                </h2>

                <div 
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                    gap: '20px' 
                  }}
                >
                  {/* Module 1 */}
                  <div 
                    onClick={() => { playSound('click'); setActiveGame('factsOpinions'); }}
                    className="glass-panel"
                    style={{ padding: '24px', cursor: 'pointer', borderLeft: '4px solid var(--color-cyan)' }}
                  >
                    <div style={{ color: 'var(--color-cyan)', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>MODULE 01</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>事実 vs 意見</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                      {mode === 'daily' 
                        ? '身近な会話やニュースから主観的な「意見」と客観的な「事実」を切り分ける入門編。'
                        : '提案書やデータ分析で、個人の「解釈」と客観的な「事実」を正しく選別する実務編。'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>難易度: 初級</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>
                        ベスト: {gameState.scores.factsOpinions}%
                      </span>
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div 
                    onClick={() => { playSound('click'); setActiveGame('logicalValidity'); }}
                    className="glass-panel"
                    style={{ padding: '24px', cursor: 'pointer', borderLeft: '4px solid var(--color-emerald)' }}
                  >
                    <div style={{ color: 'var(--color-emerald)', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>MODULE 02</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>論理の妥当性</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                      {mode === 'daily'
                        ? '日常の会話や推論のつながりから、論理の飛躍（バグ）や勘違いを見分ける入門編。'
                        : 'ビジネス上の予測や三段論法を検証し、論理的なエラーのない結論を導く推論編。'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>難易度: 初級</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-emerald)', fontWeight: 'bold' }}>
                        ベスト: {gameState.scores.logicalValidity}%
                      </span>
                    </div>
                  </div>

                  {/* Module 3 */}
                  <div 
                    onClick={() => { playSound('click'); setActiveGame('logicTree'); }}
                    className="glass-panel"
                    style={{ padding: '24px', cursor: 'pointer', borderLeft: '4px solid var(--color-amber)' }}
                  >
                    <div style={{ color: 'var(--color-amber)', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>MODULE 03</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>ロジックツリー</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                      {mode === 'daily'
                        ? '身近な整理整頓や時間の使い方をモレなくダブりなく（MECE）整理する入門編。'
                        : '売上高やコスト削減の要因を、公式やプロセスに沿ってMECEに構造化する実践編。'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>難易度: 初級</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-amber)', fontWeight: 'bold' }}>
                        ベスト: {gameState.scores.logicTree}%
                      </span>
                    </div>
                  </div>

                  {/* Module 4 */}
                  <div 
                    onClick={() => { playSound('click'); setActiveGame('fallacy'); }}
                    className="glass-panel"
                    style={{ padding: '24px', cursor: 'pointer', borderLeft: '4px solid var(--color-rose)' }}
                  >
                    <div style={{ color: 'var(--color-rose)', fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>MODULE 04</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)' }}>論理的誤謬の特定</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '16px' }}>
                      {mode === 'daily'
                        ? '友達や家族との会話、SNSの意見に潜むおかしな屁理屈（詭弁）を見破る入門編。'
                        : '商談や会議の議論で、相手の極端なすり替えや誤った前提（誤謬）を検出する批判思考編。'}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>難易度: 初級</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-rose)', fontWeight: 'bold' }}>
                        ベスト: {gameState.scores.fallacy}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar: Specialized teaser & Spell */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Specialized Spinoff Apps Teaser */}
                <div className="glass-panel" style={{ padding: '20px', border: '1px solid rgba(139, 92, 246, 0.25)', boxShadow: '0 0 15px rgba(139, 92, 246, 0.05)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '14px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} />
                    次のステップ（専門特化アプリ）
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Spinoff 1 */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Sword size={14} style={{ color: 'var(--color-amber)' }} />
                        <strong style={{ fontSize: '13px', color: 'var(--color-amber)' }}>LogiFit: Tree Quest</strong>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        ロジックツリーを深く学ぶ、意思決定シミュレーターRPG。崩壊寸前のラーメン屋を論理的決断で救え！
                      </p>
                      <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px', color: 'var(--color-primary)', fontWeight: 'bold', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Coming Soon
                      </span>
                    </div>

                    {/* Spinoff 2 */}
                    <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Search size={14} style={{ color: 'var(--color-rose)' }} />
                        <strong style={{ fontSize: '13px', color: 'var(--color-rose)' }}>LogiFit: Fallacy Hunter</strong>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                        議論や会見に潜む詭弁を暴く論理的探偵ゲーム。ストローマンや二分法の嘘を見破れ！
                      </p>
                      <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px', color: 'var(--color-primary)', fontWeight: 'bold', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hiragana Spell Backup Box */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyRound size={18} style={{ color: 'var(--color-primary)' }} />
                    ふっかつのじゅもん
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4', marginBottom: '16px' }}>
                    データをコピペ保存できます（短い<strong>12文字</strong>のひらがなコードです）。
                  </p>

                  <div 
                    onClick={() => handleCopySpell(currentSpell)}
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.2)', 
                      border: '1px solid var(--border-color)', 
                      borderOffset: '8px', 
                      borderRadius: '8px', 
                      padding: '10px 14px', 
                      fontFamily: 'var(--font-display)', 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      userSelect: 'all',
                      transition: 'all 0.2s',
                      letterSpacing: '2px',
                      textShadow: '0 0 8px var(--color-primary-glow)'
                    }}
                    title="クリックしてコピー"
                  >
                    <span>{currentSpell}</span>
                    <Copy size={14} style={{ opacity: 0.6 }} />
                  </div>

                  <form onSubmit={handleRestoreSpell} style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                      じゅもんを唱えて復活する:
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={spellInput}
                        onChange={(e) => setSpellInput(e.target.value)}
                        placeholder="ひらがな12文字を入力"
                        style={{
                          flex: 1,
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#fff',
                          outline: 'none',
                          fontSize: '13px'
                        }}
                      />
                      <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}>
                        復活
                      </button>
                    </div>
                    {spellError && <p style={{ color: 'var(--color-rose)', fontSize: '11px', marginTop: '6px' }}>❌ {spellError}</p>}
                    {spellSuccess && <p style={{ color: 'var(--color-emerald)', fontSize: '11px', marginTop: '6px' }}>✨ じゅもんが　みごとに　きまった！</p>}
                  </form>
                </div>

                {/* 独立した広告カード */}
                <div 
                  className="glass-panel" 
                  style={{ 
                    padding: '16px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px'
                  }}
                >
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Sponsored Link
                  </div>
                  <RakutenWidget size="250x250" ts="1779836909524" />
                </div>
              </div>

            </div>
              </div>
            )}

            {activeTab === 'encyclopedia' && (
              <div className="fade-in">
            {/* Skills Encyclopedia */}
            <section style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} style={{ color: 'var(--color-primary)' }} />
                思考スキル図鑑
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
                {skillsData.map((skill) => {
                  const score = gameState.scores[skill.id] || 0;
                  const isUnlocked = score >= 80;

                  return (
                    <div 
                      key={skill.id}
                      className={`glass-panel skill-card ${isUnlocked ? 'unlocked' : ''}`}
                      style={{ 
                        borderLeftColor: isUnlocked ? 'var(--color-primary)' : 'var(--border-color)',
                        opacity: isUnlocked ? 1 : 0.6
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {isUnlocked ? (
                            <Unlock size={18} style={{ color: 'var(--color-primary)' }} />
                          ) : (
                            <Lock size={18} style={{ color: 'var(--text-muted)' }} />
                          )}
                          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                            {skill.name}
                          </h3>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '220px' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                width: `${score}%`, 
                                background: isUnlocked ? 'var(--color-primary)' : 'var(--text-muted)',
                                borderRadius: '3px'
                              }} 
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: isUnlocked ? 'var(--color-primary)' : 'var(--text-muted)', width: '80px', textAlign: 'right' }}>
                            {isUnlocked ? '習得完了' : `進捗 ${score}/80%`}
                          </span>
                        </div>
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>
                        {skill.desc}
                      </p>

                      {isUnlocked ? (
                        <div 
                          className="fade-in"
                          style={{ 
                            background: 'rgba(139, 92, 246, 0.03)', 
                            border: '1px solid rgba(139, 92, 246, 0.1)', 
                            borderRadius: '8px', 
                            padding: '12px 16px', 
                            fontSize: '13px',
                            lineHeight: '1.5'
                          }}
                        >
                          <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '6px' }}>
                            💡 現実社会での具体的な活かし方:
                          </strong>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                            <div>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '12px' }}>【仕事・学業】</span>
                              <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '12px' }}>{skill.lifeApplication.work}</p>
                            </div>
                            <div>
                              <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '12px' }}>【プライベート】</span>
                              <p style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '12px' }}>{skill.lifeApplication.private}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontStyle: 'italic' }}>
                          ※このスキルトレーニングで80%以上のベストスコアを獲得すると、解説書がアンロックされます。
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="fade-in">
            {/* Achievements Section */}
            <section style={{ textAlign: 'left' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} style={{ color: 'var(--color-primary)' }} />
                獲得バッジ・実績
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {badgeDetails.map((badge, idx) => {
                  const isUnlocked = gameState.badges[idx];
                  return (
                    <div 
                      key={idx}
                      className="glass-panel"
                      style={{
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        opacity: isUnlocked ? 1 : 0.4,
                        background: isUnlocked 
                          ? `linear-gradient(135deg, rgba(20, 22, 37, 0.6) 0%, rgba(30, 33, 56, 0.4) 100%)` 
                          : 'rgba(255, 255, 255, 0.01)',
                        border: isUnlocked ? `1px solid ${badge.color}` : '1px solid var(--border-color)',
                        boxShadow: isUnlocked ? `0 0 15px rgba(255, 255, 255, 0.03)` : 'none'
                      }}
                    >
                      <div 
                        style={{ 
                          color: isUnlocked ? badge.color : 'var(--text-muted)',
                          background: isUnlocked ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                          padding: '10px',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isUnlocked ? <Sparkles size={24} /> : <HelpCircle size={24} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {isUnlocked ? badge.title : '未アンロック'}
                        </h4>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                          {badge.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
              </div>
            )}
          </div>
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

            <button 
              onClick={() => setRewardModal(prev => ({ ...prev, show: false }))} 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '16px' }}
            >
              トレーニングに戻る
            </button>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {showGuideModal && (
        <GuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />
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
          © 2026 LogiFit Project. All rights reserved.
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
