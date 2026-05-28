import React from 'react';
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
  skillsData
}) {
  const [showToast, setShowToast] = React.useState(false);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="fade-in">
      {isNewUser ? (
        /* ========================================================
           ① 新規未受診フェーズ（診断プッシュのみ、他のUIは隠す）
           ======================================================== */
        <>
          {/* 新規向けHero（3分診断を最大プッシュ） */}
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
            <div style={{ marginBottom: "16px" }}>
              <span className="game-badge" style={{ background: "rgba(6, 182, 212, 0.1)", border: "1px solid rgba(6, 182, 212, 0.2)", color: "#06b6d4", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
                🧠 BRAIN SCANNER
              </span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '36px', letterSpacing: '-0.5px', marginBottom: '16px', marginTop: 0 }}>
              まず、アタマのレントゲンで思考の偏りをスキャン。
            </h1>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '15px', marginBottom: '32px', maxWidth: '640px', margin: '0 auto 32px auto' }}>
              LogiFit（ロジフィット）は、アタマのレントゲン（診断）であなたの思考のクセや弱点を見つけ、ゲーム感覚で脳内OSをデバッグする総合思考トレーニングジムです。まずは3分間の診断から始めましょう。
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
              background: 'rgba(255, 255, 255, 0.01)',
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
              <div style={{ flex: '1 1 250px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'linear-gradient(135deg, var(--color-cyan) 0%, #0891b2 100%)', color: '#0a0b10', fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '4px' }}>
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
              <div style={{ flex: '1 1 250px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
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
              <div style={{ flex: '1 1 250px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', position: 'relative' }}>
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
                ふっかつのじゅもんを唱えてデータを復元
              </h3>
              <form onSubmit={handleRestoreSpell} style={{ display: 'flex', gap: '8px' }}>
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
              </form>
              {spellError && <p style={{ color: 'var(--color-rose)', fontSize: '11px', marginTop: '6px', textAlign: 'center' }}>❌ {spellError}</p>}
            </div>
          </div>
        </>
      ) : (
        /* ========================================================
           ② 診断完了後フェーズ（シングルフォーカス / フルアンロック）
           ======================================================== */
        <>
          {/* Hero section */}
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
              borderLeft: `4px solid ${isFullUnlocked ? 'var(--color-primary)' : 'var(--color-cyan)'}`
            }}
          >
            <div style={{ flex: '1 1 450px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-badge-text)', fontWeight: 'bold', background: 'var(--color-badge-bg)', padding: '4px 8px', borderRadius: '6px', border: '1px solid var(--color-badge-border)' }}>
                  診断されたアタマのタイプ
                </span>
                <strong style={{ fontSize: '16px', color: 'var(--text-primary)', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
                  {gameState.diagnosticType ? `${gameState.diagnosticType.emoji} ${gameState.diagnosticType.name}` : charClass.title}
                </strong>
                {isFullUnlocked && (
                  <button
                    onClick={() => handleShareToX(`🧠 論理思考の筋トレ「LogiFit」で脳内OSをデバッグ中！\n私の脳内タイプ：【${gameState.diagnosticType ? gameState.diagnosticType.name : charClass.title}】 (Lv. ${gameState.level})\n\nあなたの脳の「摩擦係数」はどれくらい？測定してみよう！\n#LogiFit #ロジフィット #論理的思考`)}
                    className="btn btn-secondary"
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.02)'
                    }}
                    title="Xでシェア"
                  >
                    <span>𝕏 シェア</span>
                  </button>
                )}
              </div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', letterSpacing: '-0.5px', marginBottom: '8px', marginTop: 0 }}>
                {gameState.diagnosticType ? gameState.diagnosticType.tagline : '思考の基礎体力を、ここから。'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '13.5px', marginBottom: '16px' }}>
                {gameState.diagnosticType ? gameState.diagnosticType.description : charClass.desc}
              </p>
              
              {!isFullUnlocked && (
                <div 
                  style={{ 
                    background: 'rgba(6, 182, 212, 0.05)', 
                    border: '1px solid rgba(6, 182, 212, 0.15)', 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    fontSize: '13px', 
                    color: 'var(--color-cyan)',
                    lineHeight: '1.4',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} />
                  <span><strong>デバッグ開始：</strong>まずはあなたの診断で最もスコアが低かったカテゴリ（ハイライト表示中）のゲームをクリアして、すべての思考ルームを解放しましょう！</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={() => { 
                    playSound('click'); 
                    document.getElementById('training-menu')?.scrollIntoView({ behavior: 'smooth' }); 
                  }} 
                  className="btn btn-primary"
                  style={{
                    background: isFullUnlocked 
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)' 
                      : 'linear-gradient(135deg, var(--color-cyan) 0%, var(--color-primary) 100%)',
                    boxShadow: isFullUnlocked 
                      ? '0 4px 15px var(--color-primary-glow)' 
                      : '0 4px 15px rgba(6, 182, 212, 0.3)'
                  }}
                >
                  🎯 {isFullUnlocked ? 'トレーニングを再開する' : 'デバッグ（最初の練習）へ'}
                </button>
                <button 
                  onClick={() => { playSound('click'); setActiveGame('diagnostic'); }} 
                  className="btn btn-secondary"
                  style={{
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    background: 'rgba(6, 182, 212, 0.03)',
                    color: 'var(--color-cyan)'
                  }}
                >
                  🧠 思考診断を受け直す
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
                {isFullUnlocked ? '思考力パラメーター' : '診断結果スキャンマップ'}
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
              { id: 'training', label: '🎯 トレーニングルーム', count: null },
              { id: 'encyclopedia', label: '📖 思考スキル図鑑', count: Object.values(gameState.scores).filter(s => s >= 80).length },
              { id: 'achievements', label: '🏆 獲得実績', count: gameState.badges.filter(Boolean).length }
            ].map(tab => {
              const isTabLocked = !isFullUnlocked && tab.id !== 'training';
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
                    cursor: isTabLocked ? 'not-allowed' : 'pointer',
                    opacity: isTabLocked ? 0.5 : 1,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  title={isTabLocked ? "最初のゲームクリアで解放されます" : tab.label}
                >
                  <span>{isTabLocked ? `🔒 ${tab.label}` : tab.label}</span>
                  {!isTabLocked && tab.count !== null && (
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

          {activeTab === 'training' && (
            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', textAlign: 'left', marginTop: '16px' }} className="fade-in">
              
              {/* Rooms List */}
              <div style={{ flex: '2 1 600px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <h2 id="training-menu" style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
                  {isFullUnlocked 
                    ? (mode === 'daily' ? '思考トレーニングルーム（日常編・入門）' : '思考トレーニングルーム（ビジネス編）')
                    : 'シングルフォーカストレーニングルーム'
                  }
                </h2>

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
                          border: `1px solid ${isRoomUnlocked ? 'var(--border-color)' : 'rgba(255,255,255,0.03)'}`,
                          borderLeft: `5px solid ${room.borderColor}`,
                          background: isRoomUnlocked ? 'rgba(255, 255, 255, 0.01)' : 'rgba(255, 255, 255, 0.002)',
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
                                  background: 'rgba(255, 255, 255, 0.02)',
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
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>難易度: {game.difficulty}</span>
                                  <span style={{ fontSize: '12px', color: room.textColor, fontWeight: 'bold' }}>
                                    ベスト: {score}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}

                          {/* Spinoff Cards */}
                          {room.spinoffs && room.spinoffs.map((spinoff, idx) => (
                            <div 
                              key={idx}
                              style={{ 
                                background: 'rgba(255, 255, 255, 0.01)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '12px', 
                                padding: '20px', 
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                opacity: isRoomUnlocked ? 1 : 0.6
                              }}
                            >
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                  {spinoff.icon}
                                  <strong style={{ fontSize: '13px', color: spinoff.color }}>{spinoff.name}</strong>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: '0 0 16px 0' }}>
                                  {spinoff.desc}
                                </p>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '9px', color: spinoff.color, fontWeight: 'bold', background: `${room.badgeColor}`, padding: '2px 6px', borderRadius: '4px' }}>
                                  Coming Soon
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Hiragana Spell Backup Box */}
                <div className="glass-panel" style={{ padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <KeyRound size={18} style={{ color: 'var(--color-primary)' }} />
                    ふっかつのじゅもん
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.4', marginBottom: '16px' }}>
                    データをコピペ保存できます（短い12文字のひらがなコードです）。
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

                {/* Rakuten sponsored Link */}
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
        </>
      )}
      {showToast && (
        <div className="copy-toast">
          <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          <span>じゅもんをクリップボードにコピーしました！</span>
        </div>
      )}
    </div>
  );
}
