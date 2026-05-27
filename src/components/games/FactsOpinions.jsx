import React, { useState } from 'react';
import { factsOpinionsDaily, factsOpinionsBusiness } from '../../data/questions';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import RakutenWidget from '../common/RakutenWidget';

export default function FactsOpinions({ onFinish, playSound, muted, toggleMute, mode }) {
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // true for Fact, false for Opinion
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentData = mode === 'business' ? factsOpinionsBusiness : factsOpinionsDaily;
  const currentQuestion = currentData[currentIdx];

  const handleAnswer = (answer) => {
    if (isAnswered) return;
    playSound('click');
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.isFact;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound('correct');
    } else {
      playSound('incorrect');
    }
  };

  const handleNext = () => {
    playSound('click');
    if (currentIdx < currentData.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setCompleted(true);
      const finalScore = Math.round((score / currentData.length) * 100);
      onFinish('factsOpinions', finalScore);
      playSound('success');
    }
  };

  const handleReset = () => {
    playSound('click');
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setCompleted(false);
    setShowTutorial(true);
  };

  const startTraining = () => {
    playSound('click');
    setShowTutorial(false);
  };

  return (
    <div className="game-container fade-in">
      <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ color: 'var(--color-cyan)', fontWeight: 'bold', fontSize: '14px', letterSpacing: '1px' }}>
              TRAINING MODULE 01
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', marginTop: '4px' }}>事実 vs 意見 (Fact or Opinion)</h2>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              onClick={toggleMute}
              className="btn btn-secondary" 
              style={{ padding: '8px', borderRadius: '50%' }}
              title={muted ? "消音解除" : "消音"}
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            {!showTutorial && !completed && (
              <div className="score-badge" style={{ borderColor: 'var(--color-cyan)' }}>
                進捗: {currentIdx + 1} / {currentData.length}
              </div>
            )}
          </div>
        </div>

        {showTutorial ? (
          <div style={{ textAlign: 'left' }} className="fade-in">
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-cyan)' }}>
              📖 30秒でわかる基本のき：事実と意見の違い
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)' }}>
                <strong style={{ color: 'var(--color-cyan)', fontSize: '15px' }}>📌 事実 (Fact) とは？</strong>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                  客観的な数値や証拠があり、<strong>「誰が見ても100%同じもの（検証可能なもの）」</strong>です。<br />
                  例：{mode === 'business' 
                    ? '「スマートフォンの普及率は85%を超えている」「抽出時間が30秒短縮された」'
                    : '「今日の東京の気温は28度だった」「牛乳1パックが税込250円で販売されている」'}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                <strong style={{ color: 'var(--text-primary)', fontSize: '15px' }}>📌 意見 (Opinion) とは？</strong>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                  人の感情、解釈、好み、仮説など、<strong>「人によって見方や判断が変わるもの（主観）」</strong>です。<br />
                  例：{mode === 'business'
                    ? '「新システムは使いやすい」「営業のモチベーションが低いから売上が下がった」'
                    : '「お母さんが作った特製カレーは美味しい」「最近のスマホは高すぎる」'}
                </p>
              </div>

              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)', borderLeft: '3px solid var(--color-cyan)' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  💡 多くの人は、誰かの主観的な「意見」を客観的な「事実」だと信じ込んでしまい、論理を間違えてしまいます。これらを瞬時に見分ける脳のフィルターを鍛えましょう！
                </p>
              </div>
            </div>

            <button onClick={startTraining} className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, var(--color-cyan) 0%, #0891b2 100%)', boxShadow: '0 4px 15px var(--color-cyan-glow)' }}>
              理解した！トレーニングを開始する
            </button>
          </div>
        ) : !completed ? (
          <div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '15px' }}>
              以下の記述文を読み、それが客観的に検証可能な「事実」か、主観的な解釈や感情を含む「意見」かを判断してください。
            </p>

            <div 
              className="glass-panel" 
              style={{ 
                padding: '32px 24px', 
                minHeight: '160px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderLeft: '4px solid var(--color-cyan)',
                marginBottom: '32px'
              }}
            >
              <p style={{ fontSize: '18px', fontWeight: '500', lineHeight: '1.6', textAlign: 'center' }}>
                「{currentQuestion.statement}」
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '32px' }}>
              <button 
                onClick={() => handleAnswer(true)}
                disabled={isAnswered}
                className="btn"
                style={{
                  flex: 1,
                  maxWidth: '200px',
                  height: '70px',
                  fontSize: '18px',
                  borderRadius: '16px',
                  background: selectedAnswer === true 
                    ? 'var(--color-cyan)' 
                    : 'rgba(6, 182, 212, 0.1)',
                  border: `1px solid ${selectedAnswer === true ? 'var(--color-cyan)' : 'rgba(6, 182, 212, 0.3)'}`,
                  color: selectedAnswer === true ? '#0a0b10' : 'var(--color-cyan)',
                  opacity: isAnswered && selectedAnswer !== true ? 0.5 : 1,
                  boxShadow: selectedAnswer === true ? '0 0 15px var(--color-cyan-glow)' : 'none'
                }}
              >
                事実 (Fact)
              </button>

              <button 
                onClick={() => handleAnswer(false)}
                disabled={isAnswered}
                className="btn"
                style={{
                  flex: 1,
                  maxWidth: '200px',
                  height: '70px',
                  fontSize: '18px',
                  borderRadius: '16px',
                  background: selectedAnswer === false 
                    ? 'var(--color-cyan)' 
                    : 'rgba(6, 182, 212, 0.1)',
                  border: `1px solid ${selectedAnswer === false ? 'var(--color-cyan)' : 'rgba(6, 182, 212, 0.3)'}`,
                  color: selectedAnswer === false ? '#0a0b10' : 'var(--color-cyan)',
                  opacity: isAnswered && selectedAnswer !== false ? 0.5 : 1,
                  boxShadow: selectedAnswer === false ? '0 0 15px var(--color-cyan-glow)' : 'none'
                }}
              >
                意見 (Opinion)
              </button>
            </div>

            {isAnswered && (
              <div 
                className="fade-in"
                style={{ 
                  padding: '20px', 
                  borderRadius: '12px', 
                  backgroundColor: selectedAnswer === currentQuestion.isFact ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                  border: `1px solid ${selectedAnswer === currentQuestion.isFact ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                  marginBottom: '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  {selectedAnswer === currentQuestion.isFact ? (
                    <CheckCircle2 style={{ color: 'var(--color-emerald)' }} />
                  ) : (
                    <XCircle style={{ color: 'var(--color-rose)' }} />
                  )}
                  <strong style={{ fontSize: '16px', color: selectedAnswer === currentQuestion.isFact ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
                    {selectedAnswer === currentQuestion.isFact ? '正解！' : '不正解'}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    （正解: {currentQuestion.isFact ? '事実' : '意見'}）
                  </span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {isAnswered && (
                <button onClick={handleNext} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-cyan) 0%, #0891b2 100%)', boxShadow: '0 4px 15px var(--color-cyan-glow)' }}>
                  {currentIdx < currentData.length - 1 ? '次の問題へ' : '結果を見る'}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 0' }} className="fade-in">
            <CheckCircle2 size={64} style={{ color: 'var(--color-cyan)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '24px', fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
              トレーニング完了！
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              客観的データに基づく事実と、主観的意見の区別について理解が深まりました。
            </p>
            
            <div style={{ display: 'inline-flex', gap: '32px', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>正解数</div>
                <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--color-cyan)' }}>
                  {score} / {currentData.length}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-color)' }}></div>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>スコア</div>
                <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {Math.round((score / currentData.length) * 100)}%
                </div>
              </div>
            </div>

            <RakutenWidget size="300x250" ts="1779836954537" />

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button onClick={handleReset} className="btn btn-secondary">
                <RotateCcw size={16} />
                もう一度挑戦
              </button>
              <button onClick={() => onFinish('factsOpinions', Math.round((score / currentData.length) * 100))} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-cyan) 0%, #0891b2 100%)', boxShadow: '0 4px 15px var(--color-cyan-glow)' }}>
                ダッシュボードへ戻る
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
