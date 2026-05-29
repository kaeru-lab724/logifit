import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Sword, 
  Sparkles, 
  Brain,
  Lock
} from 'lucide-react';
import FallacyHunter from './games/FallacyHunter';

export default function ProfessionalArena({ gameState, onFinish, playSound, onBack, muted, toggleMute }) {
  const [activeArenaGame, setActiveArenaGame] = useState(null);

  const games = [
    {
      id: 'fallacyHunter',
      name: 'LogiFit: Fallacy Hunter',
      moduleNum: 'ADVANCED 01',
      desc: '対話に潜む誤謬（へりくつ）を制限時間内に討伐する、批判思考バトルアクションゲーム。',
      difficulty: 'プロフェッショナル',
      color: 'var(--color-rose)',
      bgColor: 'var(--color-rose-soft)',
      icon: <Sword size={24} style={{ color: 'var(--color-rose)' }} />,
      isLocked: false
    },
    {
      id: 'treeQuest',
      name: 'LogiFit: Tree Quest',
      moduleNum: 'ADVANCED 02',
      desc: '複雑な課題のダンジョンを、ロジックツリーの枝を美しく伸ばして攻略する、構造化アドベンチャーゲーム。',
      difficulty: 'プロフェッショナル',
      color: 'var(--color-amber)',
      bgColor: 'var(--color-amber-soft)',
      icon: <Sword size={24} style={{ color: 'var(--color-amber)' }} />,
      isLocked: true
    },
    {
      id: 'eqSimulator',
      name: 'EQ・共感対話シミュレーター',
      moduleNum: 'ADVANCED 03',
      desc: '正論だけでは動かない「人の心」に寄り添い、信頼関係を築く対話シミュレーションゲーム。',
      difficulty: 'プロフェッショナル',
      color: 'var(--color-primary)',
      bgColor: 'var(--color-primary-soft)',
      icon: <Sword size={24} style={{ color: 'var(--color-primary)' }} />,
      isLocked: true
    }
  ];

  if (activeArenaGame === 'fallacyHunter') {
    return (
      <FallacyHunter 
        onFinish={(score) => {
          onFinish('fallacyHunter', score, false);
          setActiveArenaGame(null);
        }}
        playSound={playSound}
        muted={muted}
        toggleMute={toggleMute}
        onBack={() => {
          playSound('click');
          setActiveArenaGame(null);
        }}
      />
    );
  }

  return (
    <div className="game-container fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
      
      {/* 戻るナビゲーション */}
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '24px' }}>
        <button 
          onClick={() => { playSound('click'); onBack(); }}
          className="btn btn-secondary"
          style={{
            padding: '8px 16px',
            fontSize: '13.5px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ChevronLeft size={16} />
          ダッシュボードへ戻る
        </button>
      </div>

      {/* ヘッダーエリア */}
      <div 
        className="glass-panel"
        style={{
          padding: '40px 32px',
          textAlign: 'center',
          background: 'var(--hero-bg)',
          borderLeft: '4px solid var(--color-primary)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
          borderRadius: '16px'
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <span className="game-badge" style={{ background: "var(--color-badge-bg)", border: "1px solid var(--color-badge-border)", color: "var(--color-badge-text)", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold", letterSpacing: '1px' }}>
            ⚔️ PROFESSIONAL STAGE
          </span>
        </div>
        <h1 className="text-glow" style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '32px', letterSpacing: '-0.5px', marginBottom: '16px', marginTop: 0 }}>
          プロフェッショナル・アリーナ
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14.5px', marginBottom: '0', maxWidth: '680px', margin: '0 auto' }}>
          日常・ビジネスの枠を超え、より高度で複雑な課題解決や対人スキルのデバッグに挑むプロフェッショナル用ステージです。
          実戦的なスピンオフゲームを通じて、極限 of 思考回路をアンロックしましょう。
        </p>
      </div>

      {/* ゲームリストグリッド */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '24px',
          marginBottom: '48px'
        }}
      >
        {games.map((game) => {
          const score = gameState?.scores?.[game.id] || 0;
          const isLocked = game.isLocked;

          return (
            <div 
              key={game.id}
              className={`glass-panel ${!isLocked ? 'hover-lift' : ''}`}
              onClick={() => {
                if (isLocked) {
                  playSound('incorrect');
                  return;
                }
                playSound('click');
                setActiveArenaGame(game.id);
              }}
              style={{
                padding: '28px',
                background: 'var(--glass-bg)',
                border: '1px solid var(--border-color)',
                borderTop: `4px solid ${game.color}`,
                borderRadius: '16px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '280px',
                transition: 'all 0.3s ease',
                opacity: isLocked ? 0.75 : 1,
                cursor: isLocked ? 'not-allowed' : 'pointer'
              }}
            >
              <div>
                {/* アイコン & モジュール番号 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ padding: '8px', background: game.bgColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {game.icon}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                    {game.moduleNum}
                  </span>
                </div>

                {/* ゲームタイトル */}
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 10px 0', fontFamily: 'var(--font-display)' }}>
                  {game.name}
                </h3>

                {/* 紹介文 */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: '0 0 20px 0' }}>
                  {game.desc}
                </p>
              </div>

              {/* statusバッジ（Coming Soon / ベストスコア） */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>難易度: {game.difficulty}</span>
                {isLocked ? (
                  <span 
                    style={{ 
                      fontSize: '10px', 
                      color: game.color, 
                      fontWeight: 'bold', 
                      background: game.bgColor, 
                      padding: '4px 10px', 
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <Lock size={10} />
                    Coming Soon
                  </span>
                ) : (
                  <span 
                    style={{ 
                      fontSize: '11.5px', 
                      color: game.color, 
                      fontWeight: 'bold', 
                      background: game.bgColor, 
                      padding: '4px 10px', 
                      borderRadius: '6px',
                      border: `1px solid ${game.color}`
                    }}
                  >
                    ベスト: {score}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

