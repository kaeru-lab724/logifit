import React, { useState } from 'react';
import { 
  Award, 
  Brain, 
  BookOpen, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  Copy,
  Lock,
  Unlock,
  KeyRound,
  Search,
  Sword
} from 'lucide-react';
import RakutenWidget from './common/RakutenWidget';
import { decodeState, calculateFriction } from '../data/spellHelper';
import { diagnosticTypes } from '../data/diagnosticData';

export default function Dashboard({
  isNewUser,
  isFullUnlocked,
  gameState,
  charClass,
  playSound,
  setActiveGame,
  activeTab,
  setActiveTab,
  mode,
  displayScores,
  primaryDebugCategory,
  rooms,
  spellInput,
  setSpellInput,
  spellError,
  spellSuccess,
  handleRestoreSpell,
  handleCopySpell,
  currentSpell,
  setShowGuideModal,
  badgeDetails,
  skillsData,
  onUnlockType
}) {
  const [showToast, setShowToast] = useState(false);
  const [opponentSpell, setOpponentSpell] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [matchError, setMatchError] = useState('');
  const [showBugDetails, setShowBugDetails] = useState(false);
  const [selectedBugId, setSelectedBugId] = useState(null);

  const onCopyClick = () => {
    handleCopySpell(currentSpell);
    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 2500);
    return () => clearTimeout(timer);
  };

  const handleShareToX = (text) => {
    playSound('click');
    const appUrl = 'https://www.logifit.site/';
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCheckFriction = (e) => {
    e.preventDefault();
    setMatchError('');
    setMatchResult(null);

    if (!currentSpell) {
      setMatchError('まずあなた自身の診断を完了するか、ブレインコードを入力してください。');
      return;
    }

    try {
      const stateA = decodeState(currentSpell);
      const stateB = decodeState(opponentSpell);
      const result = calculateFriction(stateA, stateB);
      setMatchResult(result);
      playSound('success');

      // 相手のバグタイプをアンロック
      if (onUnlockType && result && result.typeB) {
        onUnlockType(result.typeB);
      }
    } catch (err) {
      playSound('incorrect');
      setMatchError(err.message || '相手のブレインコードの解析に失敗しました。');
    }
  };

  // Find detailed type data
  const currentType = gameState.diagnosticTypeId 
    ? diagnosticTypes[gameState.diagnosticTypeId] 
    : (gameState.diagnosticType || null);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="fade-in">
      {isNewUser ? (
        /* ========================================================
           ① 新規未受診フェーズ（診断ファースト誘導）
           ======================================================== */
        <>
          {/* 新規向けHero（自分・他者スキャンを最大プッシュ） */}
          <div 
            className="glass-panel"
            style={{
              padding: '48px 32px',
              textAlign: 'center',
              background: 'var(--hero-bg)',
              borderLeft: '4px solid var(--color-cyan)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="scan-bg-glow"></div>
            <div style={{ marginBottom: "16px" }}>
              <span className="game-badge" style={{ background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", color: "#06b6d4", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
                🧠 BRAIN SCANNER
              </span>
            </div>
            <h1 className="text-glow" style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '34px', letterSpacing: '-0.5px', marginBottom: '16px', marginTop: 0 }}>
              アタマのレントゲンで思考の「偏り」をスキャン。
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px', marginBottom: '32px', maxWidth: '640px', margin: '0 auto 32px auto' }}>
              LogiFit（ロジフィット）は、アタマのレントゲン（診断）であなたの思考のクセ（愛すべきバグ）を暴き、ゲーム感覚で脳内OSをデバッグする総合思考ジムです。まずは3分間の診断から始めましょう。
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                onClick={() => { playSound('click'); setActiveGame('diagnostic'); }} 
                className="btn btn-primary"
                style={{
                  background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-primary) 100%)',
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)',
                  fontSize: '16px',
                  padding: '14px 36px'
                }}
              >
                🧠 レントゲン（思考診断）をはじめる
              </button>
            </div>
          </div>

          {/* 3 STEP PLAY GUIDE CONTAINER */}
          <div 
            className="glass-panel"
            style={{
              padding: '32px 24px',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
              marginTop: '8px'
            }}
          >
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Sparkles size={18} style={{ color: 'var(--color-cyan)' }} />
              脳内OSをアップデートする 3 STEP
            </h2>
            <div 
              style={{ 
                display: 'flex', 
                gap: '24px', 
                flexWrap: 'wrap',
                justifyContent: 'center',
                textAlign: 'left'
              }}
            >
              {/* Step 1 */}
              <div style={{ flex: '1 1 250px', background: 'var(--bg-inner-box)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, #0891b2 100%)', color: 'var(--bg-dark)', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                  STEP 01
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px', marginBottom: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🧠 アタマをスキャンする
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                  「アタマのレントゲン（診断）」を受け、あなたの思考の偏り（ロジカル、クリティカル、ラディカル、エモーショナル）を暴きます。
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ flex: '1 1 250px', background: 'var(--bg-inner-box)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                  STEP 02
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px', marginBottom: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🎯 弱点をデバッグする
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                  診断で見つかった「思考のバグ（弱点）」を克服するトレーニングゲーム（事実vs意見、誤謬特定など）に挑戦します。
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ flex: '1 1 250px', background: 'var(--bg-inner-box)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'linear-gradient(135deg, var(--color-emerald) 0%, #059669 100%)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
                  STEP 03
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px', marginBottom: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🚀 脳内OSをアップデート
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                  トレーニングのベストスコアが蓄積され、パラメータ（レーダーチャート）とあなたの「進化クラス（肩書き）」が成長します。
                </p>
              </div>
            </div>
          </div>

          {/* Spell entry for returning users */}
          <div style={{ maxWidth: '400px', margin: '32px auto 0 auto', width: '100%' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <KeyRound size={16} style={{ color: 'var(--color-primary)' }} />
                ブレインコードをインポートしてデータを復元
              </h3>
              <form onSubmit={handleRestoreSpell} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={spellInput}
                  onChange={(e) => setSpellInput(e.target.value)}
                  placeholder="英数字12文字を入力"
                  style={{
                    flex: 1,
                    background: 'var(--bg-inner-box)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}>
                  インポート
                </button>
              </form>
              {spellError && <p style={{ color: 'var(--color-rose)', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>❌ {spellError}</p>}
            </div>
          </div>
        </>
      ) : (
        /* ========================================================
           ② 診断完了後フェーズ（PC2カラム・ダッシュボードレイアウト）
           ======================================================== */
        <div className="dashboard-grid-layout">
          
          {/* 左メインカラム（マイプロファイル ＆ タブナビゲーション・コンテンツ） */}
          <div className="dashboard-main-column">
            
            {/* Column 1: Your Brain Bug Card */}
            <div 
              className="glass-panel"
              style={{
                padding: '32px 24px',
                borderLeft: `4px solid ${isFullUnlocked ? 'var(--color-primary)' : 'var(--color-cyan)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: 'var(--hero-bg)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-badge-text)', fontWeight: 'bold', background: 'var(--color-badge-bg)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-badge-border)' }}>
                    あなたの愛すべき脳内バグ
                  </span>
                  {currentType && (
                    <span style={{ fontSize: '11px', color: 'var(--color-cyan)', fontWeight: 'bold', background: 'rgba(6, 182, 212, 0.05)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-cyan-glow)' }}>
                      レベル {gameState.level}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '48px' }}>{currentType?.emoji || "🐸"}</span>
                  <div>
                    <h2 className="text-glow" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                      {currentType?.name || charClass.title}
                    </h2>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '13px', margin: '2px 0 0 0' }}>
                      {currentType?.tagline || '思考のデバッグジムへようこそ'}
                    </p>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '13.5px', marginBottom: '24px' }}>
                  {currentType?.description || charClass.desc}
                </p>

                {/* アコーディオン: 取扱説明書 (トリセツ) & 3大バグ */}
                {currentType && (
                  <div style={{ marginBottom: '24px' }}>
                    <button
                      onClick={() => { playSound('click'); setShowBugDetails(!showBugDetails); }}
                      className="btn btn-secondary"
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: showBugDetails ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.06)'
                      }}
                    >
                      <span>{showBugDetails ? '▼ 取扱説明書と脳内バグを閉じる' : '▶ あなたの取扱説明書と脳内バグを見る'}</span>
                      <Sparkles size={14} style={{ color: 'var(--color-cyan)' }} />
                    </button>

                    {showBugDetails && (
                      <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>💼 仕事でのバグ</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{currentType.workBug}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#f43f5e', fontWeight: 'bold' }}>🏡 私生活でのバグ</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{currentType.privateBug}</p>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '14px', borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 'bold' }}>⚡ ふとした瞬間のクセ</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{currentType.dailyHabit}</p>
                        </div>
                        <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '14px', borderRadius: '8px' }}>
                          <span style={{ display: 'block', fontSize: '12px', color: '#10b981', fontWeight: 'bold', marginBottom: '8px' }}>📋 取扱説明書</span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#f43f5e', fontWeight: 'bold' }}>● 地雷ポイント</span>
                          <p style={{ margin: '2px 0 8px 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{currentType.torisetsu.jealousPoint}</p>
                          <span style={{ display: 'block', fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>● デバッグコマンド</span>
                          <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{currentType.torisetsu.debugSpell}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => { 
                      playSound('click'); 
                      document.getElementById('training-menu')?.scrollIntoView({ behavior: 'smooth' }); 
                    }} 
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      background: isFullUnlocked 
                        ? 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' 
                        : 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-primary) 100%)',
                      boxShadow: isFullUnlocked 
                        ? '0 4px 15px var(--color-primary-glow)' 
                        : '0 4px 15px rgba(6, 182, 212, 0.3)',
                      fontSize: '13.5px',
                      padding: '10px 18px'
                    }}
                  >
                    🎯 {isFullUnlocked ? 'デバッグを再開する' : '最初の練習（デバッグ）へ'}
                  </button>
                  <button 
                    onClick={() => { playSound('click'); setActiveGame('diagnostic'); }} 
                    className="btn btn-secondary"
                    style={{ flex: 0.8, fontSize: '13px', padding: '10px 14px' }}
                  >
                    再スキャン/他者スキャン
                  </button>
                </div>
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
                marginTop: '16px',
                flexWrap: 'wrap'
              }}
            >
              {[
                { id: 'training', label: '🎯 トレーニングルーム', count: null },
                { id: 'encyclopedia', label: '📖 思考スキル図鑑', count: Object.values(gameState.scores).filter(s => s >= 80).length },
                { id: 'bugEncyclopedia', label: '👾 脳内バグ図鑑', count: `${(gameState.unlockedTypes || ["balancedThinker"]).length}/12` },
                { id: 'achievements', label: '🏆 獲得実績', count: gameState.badges.filter(Boolean).length }
              ].map(tab => {
                const isTabLocked = !isFullUnlocked && tab.id !== 'training' && tab.id !== 'bugEncyclopedia';
                return (
                  <button
                    key={tab.id}
                    onClick={() => { 
                      if (isTabLocked) {
                        playSound('incorrect');
                        return;
                      }
                      playSound('click'); 
                      setActiveTab(tab.id); 
                    }}
                    className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '12px',
                      fontSize: '13.5px',
                      fontWeight: 'bold',
                      background: activeTab === tab.id 
                        ? 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' 
                        : 'var(--bg-inner-box)',
                      color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                      border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
                      boxShadow: activeTab === tab.id ? '0 0 12px var(--color-primary-glow)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: isTabLocked ? 'not-allowed' : 'pointer',
                      opacity: isTabLocked ? 0.5 : 1,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    title={isTabLocked ? "最初のゲームクリアで解放されます" : tab.label}
                  >
                    <span>{isTabLocked ? `🔒 ${tab.label}` : tab.label}</span>
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
                );
              })}
            </div>

            {/* Tab Contents */}
            {activeTab === 'training' && (
              <div className="fade-in" style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <h2 id="training-menu" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
                    {isFullUnlocked 
                      ? (mode === 'daily' ? '思考トレーニングルーム（日常編・入門）' : '思考トレーニングルーム（ビジネス編）')
                      : 'シングルフォーカストレーニングルーム'
                    }
                  </h2>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: '0' }}>
                    思考のクセ（弱点）を克服し、脳内OSをデバッグするためのトレーニングゲームです。
                    出題されるシチュエーションを元に、事実と意見の選別や論理の歪みを特定し、ベストスコア100%を目指して各部屋のクイズに挑戦しましょう。
                  </p>

                  {/* Unified Rooms View */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {rooms.map(room => {
                      const isRoomUnlocked = isFullUnlocked || (primaryDebugCategory === room.id);
                      return (
                        <div 
                          key={room.id}
                          className="glass-panel"
                          style={{
                            padding: '24px',
                            border: `1px solid var(--border-color)`,
                            borderLeft: `5px solid ${room.borderColor}`,
                            background: isRoomUnlocked ? 'var(--glass-bg)' : 'var(--bg-badge-locked)',
                            borderRadius: '16px',
                            opacity: isRoomUnlocked ? 1 : 0.45,
                            transition: 'all 0.3s ease',
                            position: 'relative'
                          }}
                        >
                          {/* Lock banner overlay for locked rooms */}
                          {!isRoomUnlocked && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '16px',
                              background: 'rgba(10, 11, 16, 0.6)',
                              border: '1px solid var(--border-color)',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              zIndex: 2
                            }}>
                              <Lock size={12} />
                              <span>初回プレイクリアでアンロック</span>
                            </div>
                          )}

                          {/* Room Header */}
                          <div style={{ marginBottom: '20px' }}>
                            <h3 style={{ 
                              fontSize: '18px', 
                              fontWeight: 'bold', 
                              color: isRoomUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              margin: 0
                            }}>
                              {room.title}
                            </h3>
                            <p style={{ 
                              color: 'var(--text-muted)', 
                              fontSize: '12px', 
                              margin: '6px 0 0 0',
                              lineHeight: '1.4'
                            }}>
                              {room.description}
                            </p>
                          </div>

                          {/* Room Content (Games & Spinoffs) */}
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                            gap: '20px' 
                          }}>
                            {/* Active Games */}
                            {room.games.map(game => {
                              const score = gameState.scores[game.scoreKey] || 0;
                              return (
                                <div 
                                  key={game.id}
                                  onClick={() => {
                                    if (!isRoomUnlocked) {
                                      playSound('incorrect');
                                      return;
                                    }
                                    playSound('click');
                                    setActiveGame(game.id);
                                  }}
                                  className={`glass-panel ${isRoomUnlocked ? 'hover-lift' : ''}`}
                                  style={{ 
                                    padding: '20px', 
                                    cursor: isRoomUnlocked ? 'pointer' : 'not-allowed',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                  }}
                                >
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ color: room.textColor, fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                                      {game.moduleNum}
                                    </div>
                                    {!isRoomUnlocked && (
                                      <Lock size={12} style={{ color: 'var(--text-muted)' }} />
                                    )}
                                  </div>
                                  <h4 style={{ 
                                    fontSize: '16px', 
                                    fontWeight: 'bold', 
                                    marginBottom: '8px', 
                                    color: isRoomUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    margin: '0 0 8px 0'
                                  }}>
                                    {game.name}
                                  </h4>
                                  <p style={{ 
                                    color: 'var(--text-secondary)', 
                                    fontSize: '12px', 
                                    lineHeight: '1.5', 
                                    marginBottom: '16px',
                                    minHeight: '36px' 
                                  }}>
                                    {game.desc}
                                  </p>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>難易度: {game.difficulty}</span>
                                    <span style={{ fontSize: '12px', color: room.textColor, fontWeight: 'bold' }}>
                                      ベスト: {score}%
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                            {/* Spinoff Cards (Moved to Professional Arena) */}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* プロフェッショナル（上級）ステージへの扉バナー */}
                  <div style={{ marginTop: '32px' }}>
                    {gameState.level >= 5 ? (
                      /* アンロック状態 */
                      <div 
                        onClick={() => { playSound('success'); setActiveGame('professionalArena'); }}
                        className="glass-panel hover-lift"
                        style={{
                          padding: '24px 32px',
                          background: 'linear-gradient(135deg, var(--color-primary-soft) 0%, var(--glass-bg) 100%)',
                          border: '1px solid var(--color-primary)',
                          borderLeft: '5px solid var(--color-primary)',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '20px',
                          boxShadow: 'var(--glass-shadow)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '32px' }}>⚔️</span>
                          <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '1px' }}>
                              UNLOCKED SPECIAL GATE
                            </span>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>
                              プロフェッショナル・アリーナへ挑戦
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px', margin: 0 }}>
                              応用実践ゲーム『Fallacy Hunter』等の上級者向けコンテンツが解放されました。
                            </p>
                          </div>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '13px', background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)', boxShadow: '0 4px 12px var(--color-primary-glow)' }}>
                          アリーナに入る
                        </button>
                      </div>
                    ) : (
                      /* ロック状態 */
                      <div 
                        onClick={() => playSound('incorrect')}
                        className="glass-panel"
                        style={{
                          padding: '24px 32px',
                          background: 'var(--bg-badge-locked)',
                          border: '1px solid var(--border-color)',
                          borderLeft: '5px solid var(--border-color)',
                          borderRadius: '16px',
                          opacity: 0.5,
                          cursor: 'not-allowed',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '20px'
                        }}
                        title="レベル5に到達すると解放されます"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '32px', filter: 'grayscale(100%)' }}>🔒</span>
                          <div style={{ textAlign: 'left' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', letterSpacing: '1px' }}>
                              LOCKED GATE
                            </span>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>
                              プロフェッショナル・アリーナ
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px', margin: 0 }}>
                              アンロック条件：レベル5に到達する（現在のレベル: {gameState.level}）
                            </p>
                          </div>
                        </div>
                        <div 
                          style={{ 
                            padding: '10px 20px', 
                            fontSize: '13px', 
                            background: 'var(--bg-inner-box)', 
                            border: '1px solid var(--border-color)', 
                            color: 'var(--text-muted)', 
                            borderRadius: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          ロック中
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'encyclopedia' && (
              <div className="fade-in" style={{ marginTop: '16px' }}>
                {/* Skills Encyclopedia */}
                <section style={{ textAlign: 'left' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: '0' }}>
                    <BookOpen size={20} style={{ color: 'var(--color-primary)' }} />
                    思考スキル図鑑
                  </h2>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: '12px 0 20px 0' }}>
                    習得した思考スキルの概念と、それを日常生活や仕事でどう活用すべきかの実践的なアプローチを学べる解説書です。
                    各スキルのトレーニングでベストスコア80%以上を獲得すると、解説ページがアンロックされます。
                  </p>

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
                              <div style={{ flex: 1, height: '6px', background: 'var(--bg-inner-box)', borderRadius: '3px', overflow: 'hidden' }}>
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

            {activeTab === 'bugEncyclopedia' && (
              <div className="fade-in" style={{ marginTop: '16px' }}>
                <section style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <Brain size={20} style={{ color: 'var(--color-primary)' }} />
                      脳内バグ図鑑
                    </h2>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-inner-box)', border: '1px solid var(--border-color)', padding: '4px 12px', borderRadius: '12px', fontWeight: 'bold' }}>
                      アンロック進捗: {(gameState.unlockedTypes || ["balancedThinker"]).length} / 12
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px' }}>
                    診断や他人のスキャン、相性チェック（コード共有）によって見つかった思考バグのタイプがここに記録されます。
                    他人のブレインコードを入力するか、他者スキャンを行うことで図鑑が埋まっていきます。
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {Object.values(diagnosticTypes).map((type) => {
                      const isUnlocked = (gameState.unlockedTypes || ["balancedThinker"]).includes(type.id);
                      const isSelected = selectedBugId === type.id;

                      return (
                        <div 
                          key={type.id}
                          className="glass-panel"
                          style={{
                            padding: '20px',
                            background: isUnlocked 
                              ? (isSelected ? 'rgba(139, 92, 246, 0.08)' : 'var(--glass-bg)')
                              : 'var(--bg-badge-locked)',
                            border: `1px solid ${isUnlocked ? (isSelected ? 'var(--color-primary)' : 'var(--border-color)') : 'var(--border-color)'}`,
                            borderLeft: isUnlocked ? `4px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-cyan)'}` : '4px solid var(--border-color)',
                            opacity: isUnlocked ? 1 : 0.45,
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            cursor: isUnlocked ? 'pointer' : 'default'
                          }}
                          onClick={() => {
                            if (isUnlocked) {
                              playSound('click');
                              setSelectedBugId(isSelected ? null : type.id);
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <span style={{ fontSize: '32px', filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.3)' }}>
                              {isUnlocked ? type.emoji : '🔒'}
                            </span>
                            <div>
                              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: isUnlocked ? 'var(--text-primary)' : 'var(--text-muted)', margin: 0 }}>
                                {isUnlocked ? type.name : '未確認の脳内バグ (???)'}
                              </h3>
                              {isUnlocked && (
                                <p style={{ fontSize: '11px', color: 'var(--color-cyan)', fontWeight: 'bold', margin: '2px 0 0 0' }}>
                                  {type.tagline}
                                </p>
                              )}
                            </div>
                          </div>

                          <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: '1.6', margin: 0 }}>
                            {isUnlocked 
                              ? (type.description.length > 80 && !isSelected ? `${type.description.slice(0, 80)}...` : type.description)
                              : '他人のスキャンやコード入力（相性チェック）を行うとアンロックされます。'
                            }
                          </p>

                          {/* アコーディオン詳細情報 */}
                          {isUnlocked && isSelected && (
                            <div 
                              className="fade-in"
                              style={{ 
                                marginTop: '16px', 
                                paddingTop: '16px', 
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px' 
                              }}
                              onClick={(e) => e.stopPropagation()} // 親のクリックイベントを防ぐ
                            >
                              <div style={{ background: 'var(--bg-inner-box)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>💼 仕事でのバグ</span>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{type.workBug}</p>
                              </div>
                              <div style={{ background: 'var(--bg-inner-box)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 'bold' }}>🏡 私生活でのバグ</span>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{type.privateBug}</p>
                              </div>
                              <div style={{ background: 'var(--bg-inner-box)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>⚡ ふとした瞬間のクセ</span>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{type.dailyHabit}</p>
                              </div>
                              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '8px' }}>
                                <span style={{ display: 'block', fontSize: '11px', color: '#10b981', fontWeight: 'bold', marginBottom: '4px' }}>📋 取扱説明書</span>
                                <span style={{ display: 'block', fontSize: '10px', color: '#f43f5e', fontWeight: 'bold' }}>● 地雷ポイント</span>
                                <p style={{ margin: '2px 0 6px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{type.torisetsu.jealousPoint}</p>
                                <span style={{ display: 'block', fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>● デバッグコマンド</span>
                                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{type.torisetsu.debugSpell}</p>
                              </div>
                              {type.recommendedGame && (
                                <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '8px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 'bold' }}>🎯 推奨デバッグトレーニング</span>
                                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{type.recommendedReason}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="fade-in" style={{ marginTop: '16px' }}>
                {/* Achievements Section */}
                <section style={{ textAlign: 'left' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: '0' }}>
                    <Award size={20} style={{ color: 'var(--color-primary)' }} />
                    獲得バッジ・実績
                  </h2>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: '12px 0 20px 0' }}>
                    日々の思考トレーニングの成果やレベルアップ、特定条件の達成に応じて授与される誇るべき実績称号（バッジ）の一覧です。
                    さらに高いスコアや多様なトレーニングの全制覇を目指して、すべてのバッジをアンロックしましょう！
                  </p>

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
                              ? 'var(--bg-badge-unlocked)' 
                              : 'var(--bg-badge-locked)',
                            border: isUnlocked ? `1px solid ${badge.color}` : '1px solid var(--border-badge-locked)',
                            boxShadow: isUnlocked 
                              ? `0 8px 24px rgba(0, 0, 0, 0.08), 0 0 15px rgba(${badge.colorRgb}, 0.08)` 
                              : 'none'
                          }}
                        >
                          <div 
                            style={{ 
                              color: isUnlocked ? badge.color : 'var(--text-badge-locked)',
                              background: isUnlocked ? `rgba(${badge.colorRgb}, 0.08)` : 'transparent',
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

          {/* 右サイドカラム（レーダーチャート ＆ 摩擦チェッカー ＆ 同期・復元 ＆ 広告） */}
          <div className="dashboard-side-column">
            
            {/* ① 思考力パラメーター (Radar Chart Panel) */}
            <div 
              className="glass-panel"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                minWidth: '320px'
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {isFullUnlocked ? '思考力パラメーター' : '診断結果スキャンマップ'}
              </div>
              <svg width="320" height="300" style={{ overflow: 'visible' }}>
                <polygon points="160,70 240,150 160,230 80,150" fill="none" stroke="var(--border-color)" strokeWidth="1" />
                <polygon points="160,102 208,150 160,198 112,150" fill="none" stroke="var(--border-color)" strokeWidth="1" />
                <polygon points="160,126 184,150 160,174 136,150" fill="none" stroke="var(--border-color)" strokeWidth="1" />

                <line x1="160" y1="70" x2="160" y2="230" stroke="var(--border-color)" strokeDasharray="3,3" />
                <line x1="80" y1="150" x2="240" y2="150" stroke="var(--border-color)" strokeDasharray="3,3" />

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
                <text x="160" y="58" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">{displayScores.factsOpinions}%</text>
                <text x="248" y="168" textAnchor="start" fill="var(--text-secondary)" fontSize="10">{displayScores.logicalValidity}%</text>
                <text x="160" y="266" textAnchor="middle" fill="var(--text-secondary)" fontSize="10">{displayScores.logicTree}%</text>
                <text x="72" y="168" textAnchor="end" fill="var(--text-secondary)" fontSize="10">{displayScores.fallacy}%</text>

                <circle cx="160" cy="150" r="3" fill="var(--text-muted)" />

                <polygon 
                  points={(() => {
                    const s1 = displayScores.factsOpinions || 10;
                    const s2 = displayScores.logicalValidity || 10;
                    const s3 = displayScores.logicTree || 10;
                    const s4 = displayScores.fallacy || 10;
                    return `160,${150 - 80 * (s1 / 100)} ${160 + 80 * (s2 / 100)},150 160,${150 + 80 * (s3 / 100)} ${160 - 80 * (s4 / 100)},150`;
                  })()} 
                  fill="rgba(139, 92, 246, 0.25)" 
                  stroke="var(--color-primary)" 
                  strokeWidth="2.5"
                  style={{ transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
                
                {displayScores.factsOpinions > 0 && <circle cx="160" cy={150 - 80 * (displayScores.factsOpinions / 100)} r="4" fill="var(--color-cyan)" />}
                {displayScores.logicalValidity > 0 && <circle cx={160 + 80 * (displayScores.logicalValidity / 100)} cy="150" r="4" fill="var(--color-emerald)" />}
                {displayScores.logicTree > 0 && <circle cx="160" cy={150 + 80 * (displayScores.logicTree / 100)} r="4" fill="var(--color-amber)" />}
                {displayScores.fallacy > 0 && <circle cx={160 - 80 * (displayScores.fallacy / 100)} cy="150" r="4" fill="var(--color-rose)" />}
              </svg>
              <div 
                style={{ 
                  width: '100%', 
                  marginTop: '20px', 
                  paddingTop: '16px', 
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} />
                    EQ共感対話力
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    {displayScores.empathyDialogue || 0}%
                  </span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${displayScores.empathyDialogue || 0}%`, 
                      background: 'linear-gradient(90deg, var(--color-primary) 0%, #a78bfa 100%)',
                      borderRadius: '4px',
                      boxShadow: '0 0 8px var(--color-primary-glow)',
                      transition: 'all 0.5s ease'
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* ② 脳内摩擦係数（相性）チェック (Friction Coefficient Matcher) */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '32px 24px', 
                borderLeft: '4px solid var(--color-cyan)',
                background: 'rgba(6, 182, 212, 0.01)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <span className="game-badge" style={{ background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", color: "#06b6d4", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold" }}>
                    ⚡ BI-DIRECTIONAL FRICTION CHECKER
                  </span>
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                  脳内摩擦係数（相性）チェック
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: '1.5', marginBottom: '24px' }}>
                  あなたと相手の「ブレインコード」を噛み合わせ、思考ギアの摩擦係数（0〜100%）と取扱説明書を算出します。
                </p>

                <form onSubmit={handleCheckFriction} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {/* Your Spell Box */}
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>▼ あなたのブレインコード（コピーして相手に共有）</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        readOnly 
                        value={currentSpell} 
                        style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-secondary)', fontSize: '12px', outline: 'none' }}
                      />
                      <button 
                        type="button" 
                        onClick={onCopyClick}
                        className="btn btn-secondary" 
                        style={{ padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="ブレインコードをコピー"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Opponent Spell Box */}
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>▼ 相手のブレインコードを入力</span>
                    <input 
                      type="text" 
                      value={opponentSpell} 
                      onChange={(e) => setOpponentSpell(e.target.value)}
                      placeholder="相手の英数字12文字を入力"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '12px', outline: 'none' }}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-primary) 100%)', padding: '10px 0', fontSize: '13.5px', borderRadius: '8px' }}>
                    ⚡ 摩擦係数を測定する
                  </button>
                </form>

                {matchError && <p style={{ color: 'var(--color-rose)', fontSize: '12px', textAlign: 'center', margin: '0 0 16px 0' }}>❌ {matchError}</p>}
              </div>

              {/* Match Result Display */}
              {matchResult && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(6, 182, 212, 0.15)', padding: '20px', borderRadius: '12px', animation: 'fadeIn 0.3s ease', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-cyan)', fontWeight: 'bold' }}>計測結果：{matchResult.pairName}</span>
                    <span style={{ fontSize: '20px', color: '#ff4d4d', fontWeight: 'bold', textShadow: '0 0 8px rgba(255, 77, 77, 0.4)' }}>
                      摩擦係数 {matchResult.friction}%
                    </span>
                  </div>
                  
                  {/* Friction meter bar */}
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${matchResult.friction}%`, 
                        background: 'linear-gradient(90deg, #10b981 0%, #ff9f0a 50%, #ff4d4d 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                    {matchResult.description}
                  </p>

                  <div style={{ background: 'rgba(16, 185, 129, 0.03)', border: '1px solid rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>💡 二人のデバッグアドバイス</span>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{matchResult.advice}</p>
                  </div>

                  <button 
                    onClick={() => handleShareToX(`⚡ 二人の「脳内摩擦係数」をスキャンしました！\n結果：【${matchResult.pairName}】\n激突度：【${matchResult.friction}%】\n\n診断＆相性チェックはこちら👇\n#脳内摩擦係数 #アたまのレントゲン #ブレインコード #LogiFit`)}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '12px', gap: '6px', background: 'white', color: 'black', fontWeight: 'bold' }}
                  >
                    𝕏 に同期結果をシェアする
                  </button>
                </div>
              )}
            </div>

            {/* ③ ブレインコード（同期・復元）(Alphanumeric Brain Code Backup Box) */}
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} style={{ color: 'var(--color-primary)' }} />
                ブレインコード（同期・復元）
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4', marginBottom: '16px' }}>
                データを他の端末と同期・復元できます（英数字12文字のコードです）。
              </p>
              <div 
                onClick={onCopyClick}
                style={{ 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  border: '1px solid var(--border-color)', 
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
                  コードを入力して復元・同期する:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={spellInput}
                    onChange={(e) => setSpellInput(e.target.value)}
                    placeholder="英数字12文字を入力"
                    style={{
                      flex: 1,
                      background: 'var(--bg-inner-box)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '13px'
                    }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px' }}>
                    同期
                  </button>
                </div>
                {spellError && <p style={{ color: 'var(--color-rose)', fontSize: '11px', marginTop: '6px' }}>❌ {spellError}</p>}
                {spellSuccess && <p style={{ color: 'var(--color-emerald)', fontSize: '11px', marginTop: '6px' }}>✨ コードが正常に同期されました！</p>}
              </form>
            </div>

            {/* ⑤ カエル分析官 公式連携ウィジェット (Kaeru Analyst Official Widget) */}
            <div 
              className="glass-panel"
              style={{
                padding: '0',
                borderLeft: '4px solid var(--color-emerald)',
                background: 'rgba(16, 185, 129, 0.01)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {/* アイキャッチ画像 */}
              <div style={{ width: '100%', height: '140px', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src="/kaeru_analyst_eyecatch.jpg" 
                  alt="カエル分析官" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  className="kaeru-widget-img"
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(10, 11, 16, 0.75)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'var(--color-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(4px)'
                }}>
                  <span>🐸 公式関連メディア</span>
                </div>
              </div>

              {/* コンテンツ部分 */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  カエル分析官
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', margin: '0 0 12px 0' }}>
                  @michellle_sato | note.com/kaeru_lab
                </p>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                  「人は育てられるのに、自分の重要タスクで固まる。」<br />
                  27年のキャリアを持つ育成プロが、A4バインダー and 太ペンで『先送り』を徹底解剖。50歳からの自己育成ログを配信中。
                </p>

                {/* アクションボタン */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <a 
                    href="https://note.com/kaeru_lab" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => playSound('click')}
                    className="btn btn-secondary kaeru-btn-note"
                    style={{ 
                      fontSize: '12px', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    📝 noteを読む
                  </a>
                  <a 
                    href="https://x.com/michellle_sato" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => playSound('click')}
                    className="btn btn-secondary kaeru-btn-x"
                    style={{ 
                      fontSize: '12px', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                  >
                    𝕏 をフォロー
                  </a>
                </div>
              </div>
            </div>

            {/* ④ スポンサー枠 (Sponsored Link) */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: '16px', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'var(--glass-bg)',
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
      )}
      {showToast && (
        <div className="copy-toast">
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <span>ブレインコードをクリップボードにコピーしました！</span>
        </div>
      )}
    </div>
  );
}
