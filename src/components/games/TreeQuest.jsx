import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  HelpCircle, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap, 
  Lock,
  GitFork,
  Activity,
  Play
} from 'lucide-react';

// 上級ロジックツリー課題（ダンジョンステージ）
const dungeonStages = [
  {
    id: 'stage1',
    name: '売上低迷の森',
    theme: 'カフェの年間売上高の分解',
    goal: 'カフェの売上をMECEに分解して、売上向上の足がかりとせよ！',
    options: [
      { id: 'op1', text: '客数 × 客単価' },
      { id: 'op2', text: '新規顧客 ＋ リピート顧客' },
      { id: 'op3', text: '注文数 × 平均注文単価' },
      { id: 'op4', text: '午前中の売上 ＋ 午後の売上' }, // 誤り（ダブりはないが、ビジネス課題特定には不十分）
      { id: 'op5', text: 'ドリンクの売上 ＋ フードの売上' } // 誤り
    ],
    correctStructure: {
      slots: [
        { id: 'root', label: '第1階層：売上の基本公式', expectedText: '客数 × 客単価', hint: 'お店全体の売上を最もシンプルかつ網羅的に計算する「掛け算」の組み合わせは何か？' },
        { id: 'sub1', label: '「客数」のMECE分解', expectedText: '新規顧客 ＋ リピート顧客', hint: '「お店に来た顧客の人数」を、漏れも重複もなく２つのグループに分けるには？' },
        { id: 'sub2', label: '「客単価」のMECE分解', expectedText: '注文数 × 平均注文単価', hint: '「1人あたりが使った平均金額」を分解します。購入した「商品の個数」と「その平均価格」の掛け算は？' }
      ]
    },
    explanation: '売上の公式は「客数 × 客単価」にMECE分解できます。さらに、客数は「新規 ＋ リピート」、客単価は「注文数 × 平均単価」に細分化することで、顧客獲得コストの削減やクロスセルの提案といった、具体的なアクションプランに繋がるツリーが完成します。'
  },
  {
    id: 'stage2',
    name: '無駄コストの火山',
    theme: 'スマートフォン年間通信費の削減案',
    goal: 'スマホの通信コストをMECEに分解し、削減余地をデバッグせよ！',
    options: [
      { id: 'op6', text: '基本料金の引き下げ ＋ 通話・通信オプションの見直し' },
      { id: 'op7', text: '格安SIMへの乗り換え ＋ 契約プランの容量ダウン' },
      { id: 'op8', text: '不要な有料アプリの解約 ＋ 通話割引サービスの適用' },
      { id: 'op9', text: 'スマホの画面の明るさを下げる' }, // 誤り（インフラ削減に直結しない、MECEではない）
      { id: 'op10', text: '携帯ショップに相談しに行く' } // 誤り
    ],
    correctStructure: {
      slots: [
        { id: 'root', label: '第1階層：通信費用の二大要素', expectedText: '基本料金の引き下げ ＋ 通話・通信オプションの見直し', hint: '毎月固定でかかる「基本料金」と、使い方によって変動・追加される「通話・通信オプション」の２つに大別しましょう。' },
        { id: 'sub1', label: '「基本料金」の削減手段', expectedText: '格安SIMへの乗り換え ＋ 契約プランの容量ダウン', hint: '基本のプラン代そのものを安くする方法です。通信事業者の変更や、契約ギガ数を下げるアプローチは？' },
        { id: 'sub2', label: '「オプション・アプリ」の削減手段', expectedText: '不要な有料アプリの解約 ＋ 通話割引サービスの適用', hint: '付加サービスを削減する方法です。月額アプリの整理や、かけ放題などの通話サービス適用は？' }
      ]
    },
    explanation: 'スマートフォンの通信コストは、毎月一定の「基本料金」と、使い方による「通話・通信オプション（アプリ含む）」にMECE分解できます。それぞれ「回線変更や容量ダウン」「不要なサブスク解約や割引適用」に細分化して削減案を具体化します。'
  }
];

const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function TreeQuest({ onFinish, playSound, muted, toggleMute, onBack }) {
  // ゲーム進行用ステート
  const [gameStatus, setGameStatus] = useState('tutorial'); // 'tutorial' | 'playing' | 'gameover' | 'clear'
  const [stageIdx, setStageIdx] = useState(0); // 0, 1
  const [mana, setMana] = useState(100);

  // パズル配置状態
  const [currentStage, setCurrentStage] = useState(null);
  const [placedItems, setPlacedItems] = useState({}); // slotId -> optionId
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  // 判定エフェクト
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); // 'success' | 'fail' | null
  const [activeHintSlot, setActiveHintSlot] = useState(null);
  const [scoreTracker, setScoreTracker] = useState([]); // 各ステージのクリア時残りMana

  // 1. ステージの初期化
  const initializeStage = (idx) => {
    if (idx >= dungeonStages.length) return;
    const stage = dungeonStages[idx];
    setCurrentStage({
      ...stage,
      options: shuffleArray(stage.options)
    });
    setPlacedItems({});
    setSelectedOptionId(null);
    setIsScanning(false);
    setScanResult(null);
    setActiveHintSlot(null);
  };

  useEffect(() => {
    initializeStage(stageIdx);
  }, [stageIdx]);

  if (!currentStage) return null;

  // 2. ドラッグ＆ドロップおよび選択肢配置ハンドラー
  const handleDragStart = (e, optionId) => {
    e.dataTransfer.setData('text/plain', optionId);
    playSound('click');
  };

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    const optionId = e.dataTransfer.getData('text/plain');
    placeOption(optionId, slotId);
  };

  const placeOption = (optionId, slotId) => {
    playSound('click');
    setPlacedItems(prev => {
      const next = { ...prev };
      // 他のスロットから既存配置を除去
      Object.keys(next).forEach(k => {
        if (next[k] === optionId) delete next[k];
      });
      next[slotId] = optionId;
      return next;
    });
    setSelectedOptionId(null);
  };

  const handleSlotClick = (slotId) => {
    if (isScanning || scanResult === 'success') return;
    if (selectedOptionId) {
      placeOption(selectedOptionId, slotId);
    } else {
      if (placedItems[slotId]) {
        playSound('click');
        setPlacedItems(prev => {
          const next = { ...prev };
          delete next[slotId];
          return next;
        });
      }
    }
  };

  const handleOptionClick = (optionId) => {
    if (isScanning || scanResult === 'success') return;
    playSound('click');
    setSelectedOptionId(prev => prev === optionId ? null : optionId);
  };

  // 3. MECE開通チェックの実行（レーザースキャナー演出）
  const handleCheck = () => {
    playSound('click');
    setIsScanning(true);

    // 2秒間のスキャン演出のあとに合否判定
    setTimeout(() => {
      setIsScanning(false);
      
      let correctCount = 0;
      const totalSlots = currentStage.correctStructure.slots.length;

      currentStage.options.forEach(option => {
        const placedSlotId = Object.keys(placedItems).find(k => placedItems[k] === option.id);
        if (placedSlotId) {
          const slot = currentStage.correctStructure.slots.find(s => s.id === placedSlotId);
          if (slot && slot.expectedText === option.text) {
            correctCount++;
          }
        }
      });

      const isAllCorrect = correctCount === totalSlots;

      if (isAllCorrect) {
        playSound('correct');
        setScanResult('success');
      } else {
        playSound('incorrect');
        setScanResult('fail');
        
        // マナ減少（MP -25）
        setMana(prev => {
          const nextMana = Math.max(0, prev - 25);
          if (nextMana <= 0) {
            setTimeout(() => setGameStatus('gameover'), 1500);
          }
          return nextMana;
        });
      }
    }, 2000);
  };

  // 4. 次のステージへ
  const handleNext = () => {
    playSound('click');
    setScoreTracker(prev => [...prev, mana]);

    if (stageIdx < dungeonStages.length - 1) {
      setStageIdx(prev => prev + 1);
    } else {
      // 全ステージクリア！
      playSound('success');
      setGameStatus('clear');
    }
  };

  // 5. ゲームリセット
  const handleReset = () => {
    setStageIdx(0);
    setMana(100);
    setScoreTracker([]);
    initializeStage(0);
    setGameStatus('playing');
  };

  // 6. 結果のセーブ＆アリーナに戻る
  const handleFinishGame = () => {
    // 残りManaに基づいてスコア (0〜100%) を算出
    const finalScore = Math.min(100, mana);
    onFinish(finalScore);
  };

  const startQuest = () => {
    playSound('click');
    setMana(100);
    setStageIdx(0);
    setScoreTracker([]);
    setGameStatus('playing');
  };

  return (
    <div className="dungeon-wrapper" style={{ maxWidth: '850px', margin: '0 auto', padding: '0 16px' }}>
      
      {/* ネオンパルスやレーザースキャナーのローカルスタイル定義 */}
      <style>{`
        .dungeon-wrapper {
          position: relative;
        }
        .tree-arena {
          position: relative;
          background: radial-gradient(circle, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.95) 100%);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8);
          padding: 24px;
          min-height: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .grid-overlay {
          position: absolute;
          width: 100%; height: 100%;
          background-size: 30px 30px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          top: 0; left: 0;
          z-index: 1;
        }
        
        /* レーザースキャナーアニメーション */
        .scanner-beam {
          position: absolute;
          left: 0;
          width: 100%;
          height: 12px;
          background: linear-gradient(180deg, transparent, rgba(6, 182, 212, 0.5), rgba(6, 182, 212, 0.8), transparent);
          box-shadow: 0 0 15px var(--color-cyan-glow);
          z-index: 10;
          pointer-events: none;
          animation: scan-move 2s ease-in-out infinite;
        }
        @keyframes scan-move {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* ネオンラインの結合パルス */
        .neon-line {
          stroke: var(--border-color);
          stroke-width: 2.5;
          fill: none;
          transition: stroke 0.5s ease;
        }
        .neon-line.connected {
          stroke: var(--color-amber);
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.8));
          stroke-dasharray: 8, 4;
          animation: pulse-flow 25s linear infinite;
        }
        .neon-line.failed {
          stroke: #ef4444;
          filter: drop-shadow(0 0 4px rgba(239, 68, 68, 0.8));
          animation: short-circuit 0.3s ease infinite;
        }
        @keyframes pulse-flow {
          to {
            stroke-dashoffset: -1000;
          }
        }
        @keyframes short-circuit {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        /* マナ進捗バー */
        .mana-bar-outer {
          height: 12px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          overflow: hidden;
          width: 100%;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
        }
        .mana-bar-inner {
          height: 100%;
          transition: width 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
          background: linear-gradient(90deg, #f59e0b, #d97706);
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
        }
        .slot-box {
          border: 2px dashed var(--border-item-slot);
          background: var(--bg-item-slot);
          border-radius: 12px;
          min-height: 52px;
          width: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          padding: 8px;
          text-align: center;
          z-index: 5;
        }
        .slot-box.placed {
          border: 2px solid var(--color-amber);
          background: rgba(245, 158, 11, 0.06);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
        }
        .slot-box.success {
          border: 2px solid var(--color-emerald) !important;
          background: rgba(16, 185, 129, 0.08) !important;
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2) !important;
        }
        .slot-box.fail {
          border: 2px solid #ef4444 !important;
          background: rgba(239, 68, 68, 0.08) !important;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.2) !important;
        }
      `}</style>

      {/* 1. チュートリアル */}
      {gameStatus === 'tutorial' && (
        <div className="glass-panel fade-in" style={{ padding: '32px', textAlign: 'left', borderLeft: '4px solid var(--color-amber)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-amber)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
            <Compass size={24} />
            Tree Quest : 構造化アドベンチャー
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: '16px 0 24px 0' }}>
            複雑な課題が絡み合う思考のダンジョン「売上低迷の森」および「無駄コストの火山」が立ちはだかりました！<br />
            ゲートを開通するために、テーマを最もMECE（モレなくダブりなく）に分解するルートを組み上げ、マナ（魔力）を維持してクリアを目指してください。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🌳 クエストの掟:
              </strong>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>ツリーを開通させよ</strong>: ゲートスロットに手持ちのパーツを配置し、MECE開通チェックを実行。</li>
                <li><strong>マナ (Mana) のペナルティ</strong>: 誤ったルートを組んで開通チェックに失敗すると、罠が発動してマナが `-25` 減少します。</li>
                <li><strong>思考フリーズに注意</strong>: マナが0になると思考回路がフリーズし、ダンジョンの闇へ飲み込まれます（ゲームオーバー）。</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>アリーナに戻る</button>
            <button onClick={startQuest} className="btn btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, var(--color-amber) 0%, #d97706 100%)', boxShadow: '0 4px 15px var(--color-amber-glow)' }}>
              <Play size={16} style={{ marginRight: '6px' }} />
              クエストを開始する！
            </button>
          </div>
        </div>
      )}

      {/* 2. ゲームプレイ画面 */}
      {gameStatus === 'playing' && (
        <div className="glass-panel fade-in" style={{ padding: '24px', position: 'relative' }}>
          
          {/* 上部ヘッダー（マナゲージ） */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ color: 'var(--color-amber)', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1.5px', fontFamily: 'var(--font-display)' }}>
                STAGE {stageIdx + 1} / 2
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '2px 0 0 0', color: 'var(--text-primary)' }}>
                Dungeon: {currentStage.name}
              </h2>
            </div>

            {/* プレイヤーのMana */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '150px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: mana <= 40 ? '#ef4444' : 'var(--color-amber)' }}>
                <Zap size={13} fill={mana <= 40 ? '#ef4444' : 'var(--color-amber)'} style={{ color: mana <= 40 ? '#ef4444' : 'var(--color-amber)' }} />
                MANA {mana} / 100
              </div>
              <div className="mana-bar-outer">
                <div 
                  className="mana-bar-inner" 
                  style={{ 
                    width: `${mana}%`,
                    background: mana <= 40 ? 'linear-gradient(90deg, #ef4444, #b91c1c)' : 'linear-gradient(90deg, #f59e0b, #d97706)'
                  }} 
                />
              </div>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', marginBottom: '20px', textAlign: 'left', lineHeight: '1.5' }}>
            <strong>大テーマ:</strong> {currentStage.goal}<br />
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>※パーツを各スロットにドラッグ、またはクリックで配置してください。</span>
          </p>

          {/* 3. ツリーアリーナ（バトルスクリーン） */}
          <div className="tree-arena">
            <div className="grid-overlay" />
            
            {/* スキャンビーム */}
            {isScanning && <div className="scanner-beam" />}

            {/* SVG 接続用ネオンライン */}
            <svg 
              style={{ 
                position: 'absolute', 
                top: 0, left: 0, 
                width: '100%', height: '100%', 
                pointerEvents: 'none', 
                zIndex: 2 
              }}
            >
              {/* Root から Sub1 への接続線 */}
              <path 
                d="M 270 190 Q 340 190, 340 115 T 410 115"
                className={`neon-line ${scanResult === 'success' ? 'connected' : scanResult === 'fail' ? 'failed' : ''}`}
              />
              {/* Root から Sub2 への接続線 */}
              <path 
                d="M 270 190 Q 340 190, 340 265 T 410 265"
                className={`neon-line ${scanResult === 'success' ? 'connected' : scanResult === 'fail' ? 'failed' : ''}`}
              />
              {/* Theme から Root への接続線 */}
              <path 
                d="M 120 190 H 150"
                className={`neon-line ${scanResult === 'success' ? 'connected' : scanResult === 'fail' ? 'failed' : ''}`}
              />
            </svg>

            {/* ノードの配置 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', width: '100%', justifyContent: 'space-between', zIndex: 5, padding: '0 20px' }}>
              
              {/* 大テーマ (固定ノード) */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)', 
                  border: '1px solid var(--color-amber)',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  color: 'var(--color-amber)',
                  fontSize: '13px',
                  boxShadow: '0 0 12px rgba(245, 158, 11, 0.15)',
                  width: '140px',
                  textAlign: 'center'
                }}
              >
                {currentStage.theme}
              </div>

              {/* 第1階層スロット (Root) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    {currentStage.correctStructure.slots[0].label}
                  </span>
                  <button 
                    onClick={() => setActiveHintSlot(activeHintSlot === 'root' ? null : 'root')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-amber)', cursor: 'pointer', display: 'flex', padding: 0 }}
                  >
                    <HelpCircle size={12} />
                  </button>
                </div>

                {activeHintSlot === 'root' && (
                  <div className="fade-in" style={{ position: 'absolute', bottom: '75px', background: '#0f172a', border: '1px solid var(--color-amber)', borderRadius: '8px', padding: '10px 14px', fontSize: '11.5px', color: 'var(--text-primary)', width: '220px', zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.7)', lineHeight: '1.4' }}>
                    💡 {currentStage.correctStructure.slots[0].hint}
                  </div>
                )}

                <div 
                  onClick={() => handleSlotClick('root')}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, 'root')}
                  className={`slot-box ${placedItems['root'] ? 'placed' : ''} ${scanResult === 'success' ? 'success' : scanResult === 'fail' ? 'fail' : ''}`}
                >
                  {placedItems['root'] ? (
                    <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      {currentStage.options.find(o => o.id === placedItems['root'])?.text}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>[配置してください]</span>
                  )}
                </div>
              </div>

              {/* 第2階層スロット (Sub1 / Sub2) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {currentStage.correctStructure.slots.slice(1).map((slot, idx) => (
                  <div key={slot.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        {slot.label}
                      </span>
                      <button 
                        onClick={() => setActiveHintSlot(activeHintSlot === slot.id ? null : slot.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-amber)', cursor: 'pointer', display: 'flex', padding: 0 }}
                      >
                        <HelpCircle size={12} />
                      </button>
                    </div>

                    {activeHintSlot === slot.id && (
                      <div className="fade-in" style={{ position: 'absolute', bottom: '75px', background: '#0f172a', border: '1px solid var(--color-amber)', borderRadius: '8px', padding: '10px 14px', fontSize: '11.5px', color: 'var(--text-primary)', width: '220px', zIndex: 200, boxShadow: '0 4px 20px rgba(0,0,0,0.7)', lineHeight: '1.4' }}>
                        💡 {slot.hint}
                      </div>
                    )}

                    <div 
                      onClick={() => handleSlotClick(slot.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, slot.id)}
                      className={`slot-box ${placedItems[slot.id] ? 'placed' : ''} ${scanResult === 'success' ? 'success' : scanResult === 'fail' ? 'fail' : ''}`}
                    >
                      {placedItems[slot.id] ? (
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          {currentStage.options.find(o => o.id === placedItems[slot.id])?.text}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>[配置してください]</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* 4. 選択肢パーツ */}
          {scanResult !== 'success' && !isScanning && (
            <div style={{ marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px', textAlign: 'left', fontWeight: 'bold' }}>
                開通ルートパーツ選択肢（クリックまたはドラッグでスロットへ配置）：
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {currentStage.options.map((option) => {
                  const isPlaced = Object.values(placedItems).includes(option.id);
                  const isSelected = selectedOptionId === option.id;

                  return (
                    <div
                      key={option.id}
                      draggable={!isPlaced}
                      onDragStart={(e) => handleDragStart(e, option.id)}
                      onClick={() => !isPlaced && handleOptionClick(option.id)}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: isSelected ? 'var(--color-amber)' : 'var(--bg-draggable-item)',
                        border: `1px solid ${isSelected ? 'var(--color-amber)' : 'var(--border-color)'}`,
                        color: isSelected ? '#000000' : isPlaced ? 'var(--text-draggable-placed)' : 'var(--text-primary)',
                        cursor: isPlaced ? 'not-allowed' : 'grab',
                        opacity: isPlaced ? 0.35 : 1,
                        fontSize: '13px',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 10px var(--color-amber-glow)' : 'none',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)'
                      }}
                    >
                      {option.text}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 解答フィードバック解説 (合格/不合格) */}
          {scanResult && !isScanning && (
            <div 
              style={{ 
                padding: '16px 20px', 
                borderRadius: '12px', 
                backgroundColor: scanResult === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: `1px solid ${scanResult === 'success' ? 'var(--color-emerald)' : '#ef4444'}`,
                marginBottom: '24px',
                textAlign: 'left',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                {scanResult === 'success' ? (
                  <>
                    <CheckCircle2 style={{ color: 'var(--color-emerald)' }} />
                    <strong style={{ color: 'var(--color-emerald)', fontSize: '14.5px' }}>MECEチェック合格！開通しました</strong>
                  </>
                ) : (
                  <>
                    <XCircle style={{ color: '#ef4444' }} />
                    <strong style={{ color: '#ef4444', fontSize: '14.5px' }}>不開通：モレや重複、誤配置があります（マナ -25）</strong>
                  </>
                )}
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', margin: 0 }}>
                {currentStage.explanation}
              </p>
            </div>
          )}

          {/* 下部アクションバー */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {scanResult !== 'success' && !isScanning && (
                <button 
                  onClick={() => setPlacedItems({})} 
                  className="btn btn-secondary"
                  disabled={Object.keys(placedItems).length === 0}
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  リセット
                </button>
              )}
            </div>

            <div>
              {isScanning ? (
                <button className="btn btn-primary" disabled style={{ padding: '10px 24px', fontSize: '13.5px', background: 'var(--bg-draggable-item)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <Activity size={14} className="pulse" style={{ marginRight: '6px' }} />
                  MECEスキャンを実行中...
                </button>
              ) : scanResult !== 'success' ? (
                <button 
                  onClick={handleCheck} 
                  className="btn btn-primary"
                  style={{ 
                    padding: '10px 24px', 
                    fontSize: '13.5px',
                    background: 'linear-gradient(135deg, var(--color-amber) 0%, #d97706 100%)', 
                    boxShadow: '0 4px 15px var(--color-amber-glow)' 
                  }}
                  disabled={Object.keys(placedItems).length < currentStage.correctStructure.slots.length}
                >
                  <Activity size={14} style={{ marginRight: '6px' }} />
                  MECEチェック（開通）
                </button>
              ) : (
                <button 
                  onClick={handleNext} 
                  className="btn btn-primary" 
                  style={{ 
                    padding: '10px 24px', 
                    fontSize: '13.5px',
                    background: 'linear-gradient(135deg, var(--color-emerald) 0%, #059669 100%)', 
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' 
                  }}
                >
                  {stageIdx < dungeonStages.length - 1 ? '次のダンジョンへ' : '結果を見る'}
                  <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3. ゲームオーバー画面 */}
      {gameStatus === 'gameover' && (
        <div className="glass-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
          <XCircle size={64} style={{ color: '#ef4444', marginBottom: '20px', margin: '0 auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '16px 0 12px 0' }}>
            マナが枯渇した...
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '32px' }}>
            思考の迷宮の中でマナ（MP）が完全に枯渇し、構造化の道筋を見失ってしまいました。
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={onBack} className="btn btn-secondary">アリーナに戻る</button>
            <button onClick={handleReset} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
              <RotateCcw size={16} style={{ marginRight: '6px' }} />
              ダンジョンに再挑戦
            </button>
          </div>
        </div>
      )}

      {/* 4. クエストクリア画面 */}
      {gameStatus === 'clear' && (
        <div className="glass-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center', borderLeft: '4px solid var(--color-emerald)' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--color-emerald)', marginBottom: '20px', margin: '0 auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', margin: '16px 0 12px 0' }}>
            ダンジョン完全開通！
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '32px' }}>
            すべてのスロットへMECEな階層ルートを通し、複雑な事業課題のダンジョンを見事に踏破しました！
          </p>

          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>最終残りマナ (MP)</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--color-amber)', marginTop: '4px' }}>
                {mana} / 100
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>踏破ステージ</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--color-emerald)', marginTop: '4px' }}>
                2 / 2 Stages
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              <RotateCcw size={16} style={{ marginRight: '6px' }} />
              もう一度挑戦
            </button>
            <button 
              onClick={handleFinishGame} 
              className="btn btn-primary" 
              style={{ 
                padding: '12px 32px',
                background: 'linear-gradient(135deg, var(--color-emerald) 0%, #059669 100%)', 
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' 
              }}
            >
              結果を記録して戻る
              <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
