import React from 'react';
import { 
  ChevronLeft, 
  Sword, 
  Sparkles, 
  Brain,
  Lock
} from 'lucide-react';

export default function ProfessionalArena({ playSound, onBack }) {
  const games = [
    {
      id: 'fallacyHunter',
      name: 'LogiFit: Fallacy Hunter',
      moduleNum: 'ADVANCED 01',
      desc: '対話に潜む誤謬（へりくつ）を制限時間内に討伐する、批判思考バトルアクションゲーム。',
      difficulty: 'プロフェッショナル',
      color: 'var(--color-rose)',
      bgColor: 'rgba(244, 63, 94, 0.1)',
      icon: <Sword size={24} style={{ color: 'var(--color-rose)' }} />
    },
    {
      id: 'treeQuest',
      name: 'LogiFit: Tree Quest',
      moduleNum: 'ADVANCED 02',
      desc: '複雑な課題のダンジョンを、ロジックツリーの枝を美しく伸ばして攻略する、構造化アドベンチャーゲーム。',
      difficulty: 'プロフェッショナル',
      color: 'var(--color-amber)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      icon: <Sword size={24} style={{ color: 'var(--color-amber)' }} />
    },
    {
      id: 'eqSimulator',
      name: 'EQ・共感対話シミュレーター',
      moduleNum: 'ADVANCED 03',
      desc: '正論だけでは動かない「人の心」に寄り添い、信頼関係を築く対話シミュレーションゲーム。',
      difficulty: 'プロフェッショナル',
      color: 'var(--color-primary)',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      icon: <Sword size={24} style={{ color: 'var(--color-primary)' }} />
    }
  ];

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
          background: 'linear-gradient(135deg, rgba(20, 22, 37, 0.6) 0%, rgba(10, 11, 16, 0.9) 100%)',
          borderLeft: '4px solid var(--color-primary)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '32px',
          borderRadius: '16px'
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <span className="game-badge" style={{ background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)", color: "var(--color-primary)", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold", letterSpacing: '1px' }}>
            ⚔️ PROFESSIONAL STAGE
          </span>
        </div>
        <h1 className="text-glow" style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '32px', letterSpacing: '-0.5px', marginBottom: '16px', marginTop: 0 }}>
          プロフェッショナル・アリーナ
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '14.5px', marginBottom: '0', maxWidth: '680px', margin: '0 auto' }}>
          日常・ビジネスの枠を超え、より高度で複雑な課題解決や対人スキルのデバッグに挑むプロフェッショナル用ステージです。
          実戦的なスピンオフゲームを通じて、極限の思考回路をアンロックしましょう。
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
        {games.map((game) => (
          <div 
            key={game.id}
            className="glass-panel"
            style={{
              padding: '28px',
              border: '1px solid var(--border-color)',
              borderTop: `4px solid ${game.color}`,
              background: 'rgba(255, 255, 255, 0.01)',
              borderRadius: '16px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '280px',
              transition: 'all 0.3s ease'
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

            {/* statusバッジ（Coming Soon） */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>難易度: {game.difficulty}</span>
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
                  border: `1px solid ${game.color}20`
                }}
              >
                <Lock size={10} />
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
