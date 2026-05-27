import React, { useState, useEffect } from "react";
import { diagnosticQuestions, determineDiagnosticType } from "../data/diagnosticData";

export default function DiagnosticContainer({ onSelectGame }) {
  const [step, setStep] = useState("start"); // start, quiz, analyzing, result
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState({ L: 0, C: 0, R: 0, E: 0 });
  const [resultType, setResultType] = useState(null);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);

  const scanMessages = [
    "🧠 脳内ログをスキャン中...",
    "🔍 前提バイアスのバグをチェック中...",
    "🌱 ロジックツリーの重複を検証中...",
    "⚡ 感情パルスのゆらぎを受信中...",
    "📄 思考パターンの診断書を書き出し中..."
  ];

  // Effect for analyzing phase animation
  useEffect(() => {
    let interval;
    if (step === "analyzing") {
      interval = setInterval(() => {
        setScanMessageIndex((prev) => {
          if (prev >= scanMessages.length - 1) {
            clearInterval(interval);
            // Complete analysis
            const finalScores = calculateFinalScores();
            setScores(finalScores);
            setResultType(determineDiagnosticType(finalScores));
            setStep("result");
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleStart = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setScores({ L: 0, C: 0, R: 0, E: 0 });
    setStep("quiz");
  };

  const handleAnswer = (choice) => {
    const newAnswers = [...answers, choice.scores];
    setAnswers(newAnswers);

    if (currentQuestionIndex < diagnosticQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Move to analyzing
      setScanMessageIndex(0);
      setStep("analyzing");
    }
  };

  const calculateFinalScores = () => {
    const total = { L: 0, C: 0, R: 0, E: 0 };
    answers.forEach((ans) => {
      total.L += ans.L;
      total.C += ans.C;
      total.R += ans.R;
      total.E += ans.E;
    });
    return total;
  };

  const getPercentage = (score) => {
    // Max possible score for any parameter is 105 (7 questions * 15 points)
    return Math.round((score / 105) * 100);
  };

  const handleShare = () => {
    if (!resultType) return;

    const pL = getPercentage(scores.L);
    const pC = getPercentage(scores.C);
    const pR = getPercentage(scores.R);
    const pE = getPercentage(scores.E);

    const bar = (pct) => {
      const filled = Math.round(pct / 10);
      return "█".repeat(filled) + "░".repeat(10 - filled);
    };

    const shareText = `【LogiFit 思考バランス診断結果】
アタマのレントゲンを撮ってみました！

脳内タイプ：${resultType.name} ${resultType.emoji}
～ ${resultType.tagline} ～

📊 思考バランス：
・ロジカル　　：${bar(pL)} ${pL}%
・クリティカル：${bar(pC)} ${pC}%
・ラディカル　：${bar(pR)} ${pR}%
・エモーショナル：${bar(pE)} ${pE}%

#LogiFit思考診断 #アタマのレントゲン
https://www.logifit.site/`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, "_blank");
  };

  // SVG Radar Chart Data calculation
  // Radar graph center is (160, 160) inside a 320x320 SVG viewport
  const center = 160;
  const maxRadius = 110;
  
  // Points based on score percentages (0-100)
  const getCoordinates = () => {
    const pL = getPercentage(scores.L);
    const pC = getPercentage(scores.C);
    const pR = getPercentage(scores.R);
    const pE = getPercentage(scores.E);

    // L: Up, C: Right, R: Down, E: Left
    return {
      logical: { x: center, y: center - (pL / 100) * maxRadius },
      critical: { x: center + (pC / 100) * maxRadius, y: center },
      radical: { x: center, y: center + (pR / 100) * maxRadius },
      emotional: { x: center - (pE / 100) * maxRadius, y: center }
    };
  };

  const coords = resultType ? getCoordinates() : null;
  const polygonPoints = coords 
    ? `${coords.logical.x},${coords.logical.y} ${coords.critical.x},${coords.critical.y} ${coords.radical.x},${coords.radical.y} ${coords.emotional.x},${coords.emotional.y}`
    : "";

  return (
    <div className="game-container fade-in">
      {/* START SCREEN */}
      {step === "start" && (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          {/* Neon scan decorative effect */}
          <div className="scan-bg-glow"></div>
          
          <div style={{ marginBottom: "24px" }}>
            <span className="game-badge" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "#10b981", padding: "6px 16px", borderRadius: "20px", fontSize: "14px", fontWeight: "bold" }}>
              NEW FEATURE
            </span>
          </div>

          <h1 className="text-glow" style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
            アタマのレントゲン
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px", lineHeight: "1.6", maxWidth: "540px", margin: "0 auto 32px auto" }}>
            日常の判断や行動から、あなたの思考の「偏り（クセ）」をスキャンします。<br />
            ロジカル、クリティカル、ラディカル、エモーショナルのバランスをグラフ化し、あなたの脳内キャラクターを診断！
          </p>

          {/* Brain SVG graphic with scan line effect */}
          <div style={{ position: "relative", width: "160px", height: "160px", margin: "0 auto 40px auto" }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
              <path 
                d="M 50 15 C 38 15, 30 23, 30 35 C 22 37, 18 45, 23 53 C 18 63, 23 73, 33 73 C 38 83, 48 85, 50 85 C 52 85, 62 83, 67 73 C 77 73, 82 63, 77 53 C 82 45, 78 37, 70 35 C 70 23, 62 15, 50 15 Z" 
                fill="none" 
                stroke="var(--color-cyan)" 
                strokeWidth="2" 
                strokeDasharray="4, 4"
                opacity="0.6"
              />
              <path 
                d="M 50 20 C 42 20, 35 25, 35 35 C 35 38, 32 40, 30 42 C 26 44, 25 50, 29 54 C 27 58, 28 64, 33 66 C 36 67, 38 70, 38 73 C 41 80, 48 80, 50 80 C 52 80, 59 80, 62 73 C 62 70, 64 67, 67 66 C 72 64, 73 58, 71 54 C 75 50, 74 44, 70 42 C 68 40, 65 38, 65 35 C 65 25, 58 20, 50 20 Z" 
                fill="rgba(6, 182, 212, 0.05)" 
                stroke="var(--color-primary)" 
                strokeWidth="2.5" 
              />
            </svg>
            <div className="scan-laser-line"></div>
          </div>

          <button className="btn btn-primary" onClick={handleStart} style={{ fontSize: "16px", padding: "14px 36px" }}>
            レントゲン検査をはじめる（全7問）
          </button>
        </div>
      )}

      {/* QUIZ STEP */}
      {step === "quiz" && (
        <div className="glass-panel" style={{ padding: "32px" }}>
          {/* Progress bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "bold" }}>
              QUESTION {currentQuestionIndex + 1} OF 7
            </span>
            <span style={{ fontSize: "14px", color: "var(--color-primary)", fontWeight: "bold" }}>
              {Math.round(((currentQuestionIndex) / 7) * 100)}% Complete
            </span>
          </div>
          <div style={{ height: "6px", width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: "3px", marginBottom: "32px", overflow: "hidden" }}>
            <div 
              style={{ 
                height: "100%", 
                width: `${((currentQuestionIndex + 1) / 7) * 100}%`, 
                background: "linear-gradient(90deg, var(--color-cyan) 0%, var(--color-primary) 100%)", 
                borderRadius: "3px",
                transition: "width 0.3s ease" 
              }}
            />
          </div>

          {/* Scenario text */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", padding: "24px", borderRadius: "12px", marginBottom: "28px" }}>
            <p style={{ fontSize: "18px", color: "var(--text-primary)", lineHeight: "1.6", fontWeight: "500" }}>
              {diagnosticQuestions[currentQuestionIndex].scenario}
            </p>
          </div>

          {/* Choices list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {diagnosticQuestions[currentQuestionIndex].choices.map((choice, idx) => (
              <button 
                key={idx} 
                className="btn btn-secondary" 
                onClick={() => handleAnswer(choice)}
                style={{ 
                  textAlign: "left", 
                  justifyContent: "flex-start", 
                  padding: "16px 20px", 
                  fontSize: "15px", 
                  lineHeight: "1.5",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "12px",
                  fontWeight: "normal"
                }}
              >
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span style={{ color: "var(--text-primary)" }}>{choice.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ANALYZING STEP */}
      {step === "analyzing" && (
        <div className="glass-panel" style={{ padding: "60px 40px", textAlign: "center" }}>
          <div className="scanning-container" style={{ margin: "0 auto 32px auto", width: "80px", height: "80px", position: "relative" }}>
            <div className="scanning-spinner"></div>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)", fontSize: "20px", fontWeight: "bold" }}>
            {scanMessages[scanMessageIndex]}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "12px" }}>
            あなたの回答から思考バランスを組み立てています...
          </p>
        </div>
      )}

      {/* RESULT SCREEN */}
      {step === "result" && resultType && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Main Card */}
          <div className="glass-panel" style={{ padding: "40px" }}>
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>{resultType.emoji}</div>
              <span style={{ fontSize: "13px", color: "var(--color-cyan)", border: "1px solid var(--color-cyan-glow)", background: "rgba(6, 182, 212, 0.05)", padding: "4px 12px", borderRadius: "12px", textTransform: "uppercase", fontWeight: "bold", letterSpacing: "1px" }}>
                診断結果
              </span>
              <h2 className="text-glow" style={{ fontFamily: "var(--font-display)", fontSize: "32px", fontWeight: "800", marginTop: "12px", color: "var(--text-primary)" }}>
                {resultType.name}
              </h2>
              <p style={{ color: "var(--color-primary)", fontWeight: "bold", fontSize: "15px", marginTop: "4px" }}>
                {resultType.tagline}
              </p>
            </div>

            {/* Layout: Chart Left, Explanation Right (Flex container for larger screens) */}
            <div style={{ display: "flex", flexDirection: "column", mdDirection: "row", gap: "40px", alignItems: "center" }} className="diagnostic-result-layout">
              {/* Radar Chart SVG */}
              <div style={{ flexShrink: 0, position: "relative", width: "320px", height: "320px" }}>
                <svg viewBox="0 0 320 320" style={{ width: "100%", height: "100%" }}>
                  {/* Outer boundaries (hishigata) */}
                  {[25, 50, 75, 100].map((val) => {
                    const r = (val / 100) * maxRadius;
                    return (
                      <polygon 
                        key={val}
                        points={`${center},${center - r} ${center + r},${center} ${center},${center + r} ${center - r},${center}`}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.06)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Cross Axes */}
                  <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="rgba(255, 255, 255, 0.12)" strokeDasharray="3,3" />
                  <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="rgba(255, 255, 255, 0.12)" strokeDasharray="3,3" />

                  {/* Axis labels */}
                  <text x={center} y={center - maxRadius - 12} textAnchor="middle" fill="#8b5cf6" fontSize="12" fontWeight="bold" fontFamily="var(--font-display)">ロジカル</text>
                  <text x={center + maxRadius + 10} y={center + 4} textAnchor="start" fill="#f43f5e" fontSize="12" fontWeight="bold" fontFamily="var(--font-display)">クリティカル</text>
                  <text x={center} y={center + maxRadius + 22} textAnchor="middle" fill="#f59e0b" fontSize="12" fontWeight="bold" fontFamily="var(--font-display)">ラディカル</text>
                  <text x={center - maxRadius - 10} y={center + 4} textAnchor="end" fill="#06b6d4" fontSize="12" fontWeight="bold" fontFamily="var(--font-display)">エモーショナル</text>

                  {/* Inner grid percentage text */}
                  <text x={center + 4} y={center - maxRadius * 0.5 + 4} fill="rgba(255,255,255,0.2)" fontSize="9">50%</text>
                  <text x={center + 4} y={center - maxRadius + 4} fill="rgba(255,255,255,0.2)" fontSize="9">100%</text>

                  {/* The actual data shape */}
                  {coords && (
                    <>
                      <defs>
                        <radialGradient id="chartGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.1" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.4" />
                        </radialGradient>
                      </defs>
                      <polygon 
                        points={polygonPoints} 
                        fill="url(#chartGrad)" 
                        stroke="#10b981" 
                        strokeWidth="3" 
                        strokeLinejoin="round"
                        className="radar-poly-anim"
                      />
                      {/* Vertex circles */}
                      <circle cx={coords.logical.x} cy={coords.logical.y} r="5" fill="#8b5cf6" stroke="white" strokeWidth="1.5" />
                      <circle cx={coords.critical.x} cy={coords.critical.y} r="5" fill="#f43f5e" stroke="white" strokeWidth="1.5" />
                      <circle cx={coords.radical.x} cy={coords.radical.y} r="5" fill="#f59e0b" stroke="white" strokeWidth="1.5" />
                      <circle cx={coords.emotional.x} cy={coords.emotional.y} r="5" fill="#06b6d4" stroke="white" strokeWidth="1.5" />
                    </>
                  )}
                </svg>
              </div>

              {/* Character Details & Strengths/Weaknesses */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-secondary)", marginBottom: "24px" }}>
                  {resultType.description}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", smTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }} className="diagnostic-traits-grid">
                  {/* Strengths */}
                  <div style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.1)", padding: "16px", borderRadius: "12px" }}>
                    <h4 style={{ color: "#10b981", fontSize: "14px", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      ✨ あなたの強み
                    </h4>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                      {resultType.strengths.map((str, index) => (
                        <li key={index} style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ color: "#10b981" }}>✔</span> {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div style={{ background: "rgba(244, 63, 94, 0.03)", border: "1px solid rgba(244, 63, 94, 0.1)", padding: "16px", borderRadius: "12px" }}>
                    <h4 style={{ color: "#f43f5e", fontSize: "14px", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                      ⚠️ 思考のバグ（弱点）
                    </h4>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                      {resultType.weaknesses.map((weak, index) => (
                        <li key={index} style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "6px", display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ color: "#f43f5e" }}>⚡</span> {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Post on X Button */}
                <button 
                  className="btn btn-primary" 
                  onClick={handleShare}
                  style={{ width: "100%", background: "white", color: "black", border: "1px solid transparent", boxShadow: "0 4px 15px rgba(255,255,255,0.1)", fontSize: "15px", gap: "8px" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  X（旧Twitter）にレントゲン写真をポストする
                </button>
              </div>
            </div>
          </div>

          {/* 脳内デバッグロードマップ（学習ロードマップ） */}
          <div className="glass-panel" style={{ padding: "32px", border: "1px solid var(--color-cyan-glow)", background: "rgba(6, 182, 212, 0.01)" }}>
            <h3 style={{ fontSize: "18px", color: "var(--color-cyan)", fontWeight: "bold", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              🧠 脳内デバッグ・学習ロードマップ
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: "1.5", marginBottom: "24px" }}>
              あなたの診断結果に基づいた推奨学習ルートです。まずはLogiFitで基礎を鍛え、さらに深めたい場合は専門特化アプリへ進みましょう。
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
              {/* 1. ロジカル思考 */}
              <div style={{ borderLeft: "4px solid var(--color-cyan)", paddingLeft: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>1. ロジカル思考（事実と論理の整理）</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px" }}>
                    スコア: {getPercentage(scores.L)}% {getPercentage(scores.L) < 40 && <span style={{ color: "#06b6d4", fontWeight: "bold" }}>⚠️ 要デバッグ</span>}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button className="btn btn-secondary" onClick={() => onSelectGame('factsOpinions')} style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "8px" }}>
                    🎯 基礎：事実 vs 意見
                  </button>
                  <button className="btn btn-secondary" onClick={() => onSelectGame('logicalValidity')} style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "8px" }}>
                    🎯 基礎：論理の妥当性
                  </button>
                </div>
              </div>

              {/* 2. クリティカル思考 */}
              <div style={{ borderLeft: "4px solid var(--color-rose)", paddingLeft: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>2. クリティカル思考（前提とバイアスの検証）</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px" }}>
                    スコア: {getPercentage(scores.C)}% {getPercentage(scores.C) < 40 && <span style={{ color: "var(--color-rose)", fontWeight: "bold" }}>⚠️ 要デバッグ</span>}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-secondary" onClick={() => onSelectGame('fallacy')} style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "8px" }}>
                    🎯 基礎：論理的誤謬の特定
                  </button>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "rgba(244, 63, 94, 0.05)", border: "1px solid rgba(244, 63, 94, 0.1)", padding: "6px 12px", borderRadius: "8px" }}>
                    ⚔️ 応用：LogiFit: Fallacy Hunter (Coming Soon)
                  </span>
                </div>
              </div>

              {/* 3. ラディカル思考 */}
              <div style={{ borderLeft: "4px solid var(--color-amber)", paddingLeft: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>3. ラディカル思考（本質と目的の深掘り）</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px" }}>
                    スコア: {getPercentage(scores.R)}% {getPercentage(scores.R) < 40 && <span style={{ color: "var(--color-amber)", fontWeight: "bold" }}>⚠️ 要デバッグ</span>}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <button className="btn btn-secondary" onClick={() => onSelectGame('logicTree')} style={{ padding: "8px 16px", fontSize: "12px", borderRadius: "8px" }}>
                    🎯 基礎：ロジックツリー
                  </button>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.1)", padding: "6px 12px", borderRadius: "8px" }}>
                    🛡️ 応用：LogiFit: Tree Quest (Coming Soon)
                  </span>
                </div>
              </div>

              {/* 4. エモーショナル */}
              <div style={{ borderLeft: "4px solid var(--color-primary)", paddingLeft: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                  <strong style={{ fontSize: "15px", color: "var(--text-primary)" }}>4. エモーショナル（直感と感情の調和）</strong>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "10px" }}>
                    スコア: {getPercentage(scores.E)}% {getPercentage(scores.E) < 40 && <span style={{ color: "var(--color-primary)", fontWeight: "bold" }}>⚠️ 要デバッグ</span>}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", background: "rgba(139, 92, 246, 0.05)", border: "1px solid rgba(139, 92, 246, 0.1)", padding: "6px 12px", borderRadius: "8px" }}>
                    🤝 応用：EQ・共感対話シミュレーター (Coming Soon)
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "32px" }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  const gameNames = {
                    factsOpinions: '事実 vs 意見',
                    logicalValidity: '論理の妥当性',
                    logicTree: 'ロジックツリー',
                    fallacy: '論理的誤謬の特定'
                  };
                  onSelectGame(resultType.recommendedGame);
                }}
                style={{ flex: 1, minWidth: "220px" }}
              >
                おすすめトレーニングを開始する
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleStart}
                style={{ flex: 0.5, minWidth: "120px" }}
              >
                もう一度診断する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
