import React from 'react';
import { Zap, BookOpen, Eye, ShoppingCart } from 'lucide-react';

// ==========================================
// 💡 【アフィリエイト設定】
// 楽天側の仕様変更やデバイス判定エラーを防ぐため、リンクの手動組み立てロジックを廃止しました。
// 楽天アフィリエイト公式サイトから発行された正規の「商品リンク」または「短縮URL」を
// 以下のクォート（''）の中にそのまま貼り付けてください。
// これにより、100%確実に商品詳細ページへ直接ジャンプし、成果が計上されます。
// ==========================================
const RAKUTEN_LINKS = {
  // ① 森永製菓 大粒ラムネ
  ramune: 'https://hb.afl.rakuten.co.jp/ichiba/13d7e480.d3ca8031.13d7e481.fbbf2c18/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frakuten24%2F4902888232374%2F', 

  // ② 考える技術・書く技術 (書籍)
  book: 'https://hb.afl.rakuten.co.jp/ichiba/13d7e480.d3ca8031.13d7e481.fbbf2c18/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbook%2F1133379%2F',

  // ③ 蒸気でホットアイマスク (めぐりズム)
  eyemask: 'https://hb.afl.rakuten.co.jp/ichiba/13d7e480.d3ca8031.13d7e481.fbbf2c18/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsoukaidrug%2F4901301348029%2F'
};

export default function RecoveryGearSection() {
  const gears = [
    {
      id: 'ramune',
      name: '大粒ラムネ (森永製菓)',
      tag: 'ENERGY CHARGE',
      desc: '脳の唯一のエネルギー源である「ブドウ糖」を90%配合。激しい思考デバッグ戦の合間の急速な糖分チャージに。',
      icon: <Zap size={22} style={{ color: 'var(--color-amber)' }} />,
      color: 'var(--color-amber)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      link: RAKUTEN_LINKS.ramune
    },
    {
      id: 'book',
      name: '考える技術・書く技術',
      tag: 'LOGIC MANUAL',
      desc: '論理構成の世界的ベストセラー（バーバラ・ミント著）。思考をMECEに分解し、美しいロジックツリーを組むための究極の指南書。',
      icon: <BookOpen size={22} style={{ color: 'var(--color-primary)' }} />,
      color: 'var(--color-primary)',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      link: RAKUTEN_LINKS.book
    },
    {
      id: 'eyemask',
      name: '蒸気でホットアイマスク',
      tag: 'EYE RECOVERY',
      desc: '約40℃の心地よい蒸気が10〜20分間続き、目と目元を温かく包み込みます。画面を凝視し続けるデバッガーの目を癒す休息ギア。',
      icon: <Eye size={22} style={{ color: 'var(--color-rose)' }} />,
      color: 'var(--color-rose)',
      bgColor: 'rgba(244, 63, 94, 0.1)',
      link: RAKUTEN_LINKS.eyemask
    }
  ];

  return (
    <div className="recovery-gear-container" style={{ marginTop: '48px', borderTop: '1px dashed var(--border-color)', paddingTop: '32px', width: '100%', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '10px', color: 'var(--color-primary)', fontWeight: 'bold', letterSpacing: '2px', fontFamily: 'var(--font-display)' }}>
            RECOVERY & SUPPORT SUPPLIES
          </span>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '4px 0 0 0', fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            推奨デバッガー装備（回復・支援）
          </h3>
        </div>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          ※本アリーナ推奨装備のリンクは楽天アフィリエイト広告を含みます。
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {gears.map((gear) => (
          <a
            key={gear.id}
            href={gear.link}
            target="_blank"
            rel="noopener noreferrer"
            className="gear-card"
            style={{
              textDecoration: 'none',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '220px',
              cursor: 'pointer'
            }}
          >
            {/* 上部ヘッダー */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ padding: '6px', background: gear.bgColor, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {gear.icon}
                </div>
                <span 
                  style={{ 
                    fontSize: '9px', 
                    fontWeight: 'bold', 
                    color: gear.color, 
                    border: `1px solid ${gear.color}50`, 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {gear.tag}
                </span>
              </div>

              {/* タイトルと説明 */}
              <h4 style={{ fontSize: '14.5px', fontWeight: 'bold', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
                {gear.name}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.45', margin: 0 }}>
                {gear.desc}
              </p>
            </div>

            {/* 下部アクション */}
            <div 
              className="gear-card-action"
              style={{ 
                marginTop: '16px', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                fontSize: '11.5px',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
                transition: 'color 0.2s'
              }}
            >
              <span>装備品を入手する</span>
              <ShoppingCart size={12} style={{ opacity: 0.7 }} />
            </div>
            
            {/* グローオーバーレイ */}
            <div 
              className="gear-glow-overlay" 
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                border: `1px solid ${gear.color}`,
                boxShadow: `inset 0 0 10px ${gear.color}15`,
                opacity: 0,
                borderRadius: '16px',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
              }} 
            />
          </a>
        ))}
      </div>

      <style>{`
        .gear-card:hover {
          transform: translateY(-4px);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.02) 100%) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3) !important;
        }
        .gear-card:hover .gear-glow-overlay {
          opacity: 1 !important;
        }
        .gear-card:hover .gear-card-action {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
