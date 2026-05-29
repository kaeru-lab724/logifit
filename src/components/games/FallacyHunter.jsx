import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  ShieldAlert, 
  Timer, 
  ChevronRight, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Zap, 
  Play,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';

// アリーナ専用：上級・高難度誤謬バトルデータ
const arenaQuestions = [
  {
    id: 'fh1',
    fallacyType: '大衆に訴える論証',
    scenario: '「このプロジェクト管理ツールを導入すべきです。業界の8割以上のベンチャーがこれを使って効率化に成功しているそうですよ！」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '大衆に訴える論証（多数派が支持していることを根拠に、内容の妥当性を保証する）', isCorrect: true },
      { text: '新しさに訴える論証（新しいツールだから優れていると決めつける）', isCorrect: false },
      { text: '単一原因の誤謬（ツールの導入だけで効率化が進むと決めつける）', isCorrect: false },
      { text: '権威に訴える論証（偉い人が言っているから正しいと信じ込ませる）', isCorrect: false }
    ],
    explanation: '多数の企業が導入しているからといって、自社の規模や業務プロセスに適合しているとは限りません。「みんながやっているから良い」とするのは大衆に訴える論証です。'
  },
  {
    id: 'fh2',
    fallacyType: '滑り坂論法',
    scenario: '「今日の進捗会議を1時間遅らせる？ダメだ！一回甘やかすとズルズル遅れ、プロジェクトが遅延し、クライアントの信頼を失い、最終的に契約破棄で倒産するぞ！」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '滑り坂論法（根拠のない最悪のドミノ倒しシナリオへ飛躍して反論する）', isCorrect: true },
      { text: '誤った二分法（極端な２択だけを提示して脅す）', isCorrect: false },
      { text: 'ストローマン論法（相手の主張を勝手に過激なものに歪める）', isCorrect: false },
      { text: '無知に訴える論証（失敗の証拠がないから大丈夫だとする）', isCorrect: false }
    ],
    explanation: '「1時間遅らせる」ことから「倒産」まで、途中の因果関係の証拠がないまま破滅的シナリオを滑り落ちるように繋ぎ合わせて反論する「滑り坂論法」の誤謬です。'
  },
  {
    id: 'fh3',
    fallacyType: '単一原因の誤謬',
    scenario: '「我が社の今季の売上が20%伸びたのは、間違いなく先月ロゴを刷新したからです！ロゴのデザイン変更こそがすべての勝因ですよ。」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '単一原因の誤謬（多数の要因が絡み合う結果を、特定の1つの原因だけに帰属させる）', isCorrect: true },
      { text: '循環論証（結論と前提が同じ意味の繰り返しになっている）', isCorrect: false },
      { text: '相関と因果の混同（単に時期が重なっただけなのに因果関係があると誤認する）', isCorrect: false },
      { text: '早まった一般化（極端な一例からすべてを決めつける）', isCorrect: false }
    ],
    explanation: '売上の向上には市場動向や営業努力など多くの要因が絡むはずですが、ロゴの変更という単一の要因だけを絶対的な勝因にするのは「単一原因の誤謬」です。'
  },
  {
    id: 'fh4',
    fallacyType: '二重基準 (特殊認可)',
    scenario: '「遅刻はチームの士気を下げるから厳禁だ。え？私が今日遅刻した？私はプロジェクトマネージャーとして夜遅くまで戦略を練っているんだから、例外的に許されるに決まっているよ。」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '二重基準・特殊認可（妥当な根拠なしに、自分にだけ例外的なルール適用を求める）', isCorrect: true },
      { text: '対人論証・人身攻撃（相手のキャリアの浅さを攻撃する）', isCorrect: false },
      { text: 'ストローマン論法（遅刻の定義を歪めて解釈する）', isCorrect: false },
      { text: '感情に訴える論証（自分の苦労を煽って同情を引く）', isCorrect: false }
    ],
    explanation: '「遅刻厳禁」という全体ルールに対して、特段の合理的理由（事前承認など）なしに、自分の立場や状況を理由に「自分だけは特別」とする「二重基準（特殊認可）」の罠です。'
  },
  {
    id: 'fh5',
    fallacyType: 'ストローマン論法',
    scenario: '「オフィスでの個人ゴミ箱を廃止し、ゴミを分別収集所にまとめる案はどうでしょう？」「えっ、社員の机の上をゴミだらけにして、最悪の不衛生な環境で働けと言うんですか！？」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: 'ストローマン論法（相手の主張を極端で非合理的なものに歪めて攻撃する）', isCorrect: true },
      { text: '対人論証・人身攻撃（提案者の性格や普段の清潔度を責める）', isCorrect: false },
      { text: '誤った二分法（ゴミを捨てるか、ゴミを机に放置するかの2択にする）', isCorrect: false },
      { text: '滑り坂論法（オフィスの不衛生から倒産へと繋げる）', isCorrect: false }
    ],
    explanation: '「個人ゴミ箱を廃止し集約する」という提案を、「机をゴミだらけにして不衛生にする」という極端に歪んだ形にすり替えて非難しています。これがストローマン論法です。'
  },
  {
    id: 'fh6',
    fallacyType: 'お前だって論法',
    scenario: '「スケジュール通りにタスクを完了させてください。生産性管理が甘いです。」「鈴木さんだって先週の資料作成を1日遅らせてたじゃないですか！あなたに言われる筋合いはありません！」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: 'お前だって論法（相手の言行不一致や過去のミスを指摘し、主張自体の正しさをはぐらかす）', isCorrect: true },
      { text: '人身攻撃（相手の人格を著しく傷つける）', isCorrect: false },
      { text: '循環論証（同じ内容をグルグル言い換えている）', isCorrect: false },
      { text: '滑り坂論法（1回の遅れから破滅を導く）', isCorrect: false }
    ],
    explanation: '「スケジュールを遵守すべき」という正当な指摘に対し、「指摘するあなたも過去に遅れた」という矛盾を突くことで、指摘の本質から議論をそらそうとする「お前だって論法（Tu Quoque）」です。'
  },
  {
    id: 'fh7',
    fallacyType: '循環論証',
    scenario: '「この業務自動化システムは我が社に絶対必要です。なぜなら、このシステムを導入することは、社内業務を自動化する上で極めて不可欠で必要だからです！」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '循環論証（証明すべき結論を、別の表現に変えて前提として用いる）', isCorrect: true },
      { text: '相関と因果の混同（自動化の導入と業務効率の相関を誤解する）', isCorrect: false },
      { text: '単一原因の誤謬（自動化だけが不可欠だと思い込む）', isCorrect: false },
      { text: '権威に訴える論証（偉い人の必要論を借用する）', isCorrect: false }
    ],
    explanation: '「なぜ必要か」という具体的なメリットを答えず、「不可欠で必要だから必要だ」と同じ意味をグルグル繰り返しているだけで、論証が成立していない「循環論証」です。'
  },
  {
    id: 'fh8',
    fallacyType: '誤った二分法',
    scenario: '「この新規事業にすぐ1億円を投資して実行するか、さもなければこのまま競合にシェアを奪われ、会社が倒産するのを座して待つか、どちらかだ！」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '誤った二分法（実際には存在する他の中間的な選択肢を無視し、両極端な2択だけを迫る）', isCorrect: true },
      { text: '滑り坂論法（1億円の投資から成功へのプロセスを省く）', isCorrect: false },
      { text: '大衆に訴える論証（競合がやっているから自社もやるべきだとする）', isCorrect: false },
      { text: '単一原因の誤謬（倒産の原因をシェア低下だけに絞る）', isCorrect: false }
    ],
    explanation: '「投資額を削って段階導入する」「他事業の拡大で補填する」などの多様な選択肢を排除し、「投資か倒産か」の極端な2択のみを突きつける「誤った二分法」です。'
  },
  {
    id: 'fh9',
    fallacyType: '新しさに訴える論証',
    scenario: '「最新のAI搭載システムですね！これが一番新しいバージョンなので、旧来のシステムより絶対に不具合が少なく、業務効率が格段に上がるはずです！」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '新しさに訴える論証（「新しいもの＝優れている、正しい」と無根拠に仮定する）', isCorrect: true },
      { text: '相関と因果の混同（新しさ自体が効率化の原因であるとする）', isCorrect: false },
      { text: '無知に訴える論証（誰も失敗したことがないから大丈夫だとする）', isCorrect: false },
      { text: '大衆に訴える論証（流行りのAIだから優れているとする）', isCorrect: false }
    ],
    explanation: '最新のシステムは未検証のバグや導入コストを含んでいる場合があり、「新しければ常に良い」とは限りません。これが新しさに訴える誤謬です。'
  },
  {
    id: 'fh10',
    fallacyType: '無知に訴える論証',
    scenario: '「この新しいマーケティング手法が失敗するという明確なデータや証拠はありません。したがって、この手法は100%成功し、我が社に大きな利益をもたらすでしょう！」',
    question: 'この主張に潜む論理エラー（誤謬）を特定せよ！',
    choices: [
      { text: '無知に訴える論証（「失敗が証明されていない」ことをもって、「成功する」ことの証明とする）', isCorrect: true },
      { text: '滑りやすい坂道（失敗がないから最高の成功へ進むとする）', isCorrect: false },
      { text: '循環論証（成功の証拠がないから成功とする）', isCorrect: false },
      { text: '感情に訴える論証（成功への熱望のみで論証する）', isCorrect: false }
    ],
    explanation: '失敗するという証拠がないことは、成功するという証拠にはなりません。証明されていないことを逆手に取って真実だと強弁する「無知に訴える論証」です。'
  }
];

// モンスターの定義
const monsters = [
  {
    name: 'へりくつコウモリ',
    emoji: '🦇',
    maxHp: 40,
    timeLimit: 20,
    dmgPerHit: 20,
    color: '#ec4899',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    desc: '対話の端々を歪め、ストローマンや二分法のコウモリ傘に隠れて奇襲する狡猾な魔獣。'
  },
  {
    name: 'キベンゴーレム',
    emoji: '🗿',
    maxHp: 60,
    timeLimit: 15,
    dmgPerHit: 20,
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    desc: '「昔からこうだ」「みんなそう言っている」という伝統と大衆の重厚な鎧を纏う、へりくつの石像兵。'
  },
  {
    name: 'ゴビュードラゴン',
    emoji: '🐉',
    maxHp: 80,
    timeLimit: 12,
    dmgPerHit: 20,
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    desc: '無知に訴え、滑りやすい急坂を激しい怒りと共に滑り落ちながら全てを焼き尽くす、誤謬の帝王。'
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

export default function FallacyHunter({ onFinish, playSound, muted, toggleMute, onBack }) {
  // ゲーム進行用ステート
  const [gameStatus, setGameStatus] = useState('tutorial'); // 'tutorial' | 'playing' | 'gameover' | 'clear'
  const [wave, setWave] = useState(1); // 1, 2, 3
  const [playerHp, setPlayerHp] = useState(100);
  const [monsterHp, setMonsterHp] = useState(monsters[0].maxHp);

  // 問題管理
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);

  // タイマー管理
  const [timeLeft, setTimeLeft] = useState(monsters[0].timeLimit);
  const timerRef = useRef(null);

  // アニメーション制御用フラグ
  const [screenEffect, setScreenEffect] = useState(null); // 'shake' | 'damage-flash' | null
  const [damageNumber, setDamageNumber] = useState(null); // { val: number, target: 'player' | 'monster' }
  const [atkEffect, setAtkEffect] = useState(false);

  // 1. クイズの初期化
  const initializeGame = () => {
    // 毎回ランダムにシャッフルした問題をセット
    const shuffled = shuffleArray(arenaQuestions);
    const finalized = shuffled.map(q => ({
      ...q,
      choices: shuffleArray(q.choices)
    }));
    setQuestions(finalized);
    setWave(1);
    setPlayerHp(100);
    setMonsterHp(monsters[0].maxHp);
    setCurrentQuestionIdx(0);
    setSelectedChoiceIdx(null);
    setIsAnswered(false);
    setCombo(0);
    setMaxCombo(0);
    setTotalCorrectAnswers(0);
    setTimeLeft(monsters[0].timeLimit);
    setScreenEffect(null);
    setDamageNumber(null);
    setAtkEffect(false);
  };

  useEffect(() => {
    initializeGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // 2. タイマー監視 (ゲーム進行中のみ稼働)
  useEffect(() => {
    if (gameStatus !== 'playing' || isAnswered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // タイマー開始
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // 時間切れ！
          clearInterval(timerRef.current);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus, currentQuestionIdx, isAnswered]);

  const currentMonster = monsters[wave - 1] || monsters[0];
  const currentQuestion = questions[currentQuestionIdx];

  // 3. 正解・不正解時のダメージ演出トリガー
  const triggerDamageNum = (val, target) => {
    setDamageNumber({ val, target });
    setTimeout(() => {
      setDamageNumber(null);
    }, 1200);
  };

  // 4. 時間切れの処理
  const handleTimeOut = () => {
    playSound('incorrect');
    setIsAnswered(true);
    setCombo(0);

    // 画面揺れ・赤フラッシュエフェクト
    setScreenEffect('shake');
    triggerDamageNum(20, 'player');
    setTimeout(() => setScreenEffect(null), 500);

    // プレイヤーが20ダメージ受ける
    setPlayerHp((prev) => {
      const nextHp = Math.max(0, prev - 20);
      if (nextHp <= 0) {
        setTimeout(() => setGameStatus('gameover'), 800);
      }
      return nextHp;
    });
  };

  // 5. 解答選択肢をクリック
  const handleAnswer = (choiceIdx) => {
    if (isAnswered || gameStatus !== 'playing') return;

    if (timerRef.current) clearInterval(timerRef.current);
    playSound('click');
    setSelectedChoiceIdx(choiceIdx);
    setIsAnswered(true);

    const isCorrect = currentQuestion.choices[choiceIdx].isCorrect;

    if (isCorrect) {
      // 正解：モンスターにダメージ
      playSound('correct');
      setCombo(prev => {
        const next = prev + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setTotalCorrectAnswers(prev => prev + 1);

      // 斬撃エフェクト
      setAtkEffect(true);
      setTimeout(() => setAtkEffect(false), 600);

      const hitDmg = currentMonster.dmgPerHit;
      triggerDamageNum(hitDmg, 'monster');

      // モンスターのHPを減らす
      setMonsterHp((prev) => {
        const nextHp = Math.max(0, prev - hitDmg);
        if (nextHp <= 0) {
          // モンスター討伐！ウェーブ進行
          setTimeout(() => handleMonsterDefeated(), 1000);
        }
        return nextHp;
      });

    } else {
      // 不正解：プレイヤーにダメージ
      playSound('incorrect');
      setCombo(0);

      // 画面激震・赤フラッシュ
      setScreenEffect('shake');
      triggerDamageNum(20, 'player');
      setTimeout(() => setScreenEffect(null), 500);

      setPlayerHp((prev) => {
        const nextHp = Math.max(0, prev - 20);
        if (nextHp <= 0) {
          setTimeout(() => setGameStatus('gameover'), 800);
        }
        return nextHp;
      });
    }
  };

  // 6. モンスターを倒した時の処理
  const handleMonsterDefeated = () => {
    if (wave < 3) {
      playSound('success');
      const nextWave = wave + 1;
      setWave(nextWave);
      setMonsterHp(monsters[nextWave - 1].maxHp);
      setTimeLeft(monsters[nextWave - 1].timeLimit);
      setIsAnswered(false);
      setSelectedChoiceIdx(null);
      
      // 問題インデックスを進める (問題が残っている場合)
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        // 万が一問題が尽きたら再シャッフル
        const reshuffled = shuffleArray(arenaQuestions);
        setQuestions(reshuffled.map(q => ({ ...q, choices: shuffleArray(q.choices) })));
        setCurrentQuestionIdx(0);
      }
    } else {
      // 全3ウェーブクリア！勝利画面へ
      playSound('success');
      setGameStatus('clear');
    }
  };

  // 7. 次の問題へ (モンスターがまだ生きている場合の移行ボタン)
  const handleNext = () => {
    if (!isAnswered) return;
    playSound('click');
    setSelectedChoiceIdx(null);
    setIsAnswered(false);
    setTimeLeft(currentMonster.timeLimit);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // 循環
      const reshuffled = shuffleArray(arenaQuestions);
      setQuestions(reshuffled.map(q => ({ ...q, choices: shuffleArray(q.choices) })));
      setCurrentQuestionIdx(0);
    }
  };

  // 8. リトライ処理
  const handleRetry = () => {
    initializeGame();
    setGameStatus('playing');
  };

  // 9. ゲームクリアスコア算出＆接続
  const handleFinishGame = () => {
    // プレイヤーの残りHP、コンボ数、正解率をもとにスコア (最大100%) を算出
    const accuracy = totalCorrectAnswers / Math.max(1, totalCorrectAnswers + (5 - playerHp / 20)); // 推定誤回答数から算出
    const hpBonus = playerHp * 0.4; // max 40pt
    const comboBonus = Math.min(20, maxCombo * 4); // max 20pt
    const accuracyBonus = Math.round(accuracy * 40); // max 40pt
    const finalScore = Math.min(100, Math.round(hpBonus + comboBonus + accuracyBonus));
    
    onFinish(finalScore);
  };

  const startBattle = () => {
    playSound('click');
    setGameStatus('playing');
    setTimeLeft(monsters[0].timeLimit);
  };

  if (questions.length === 0 || !currentQuestion) {
    return null;
  }

  // 残り時間のカラー判定
  const getTimerColor = () => {
    const ratio = timeLeft / currentMonster.timeLimit;
    if (ratio <= 0.25) return '#ef4444'; // 赤
    if (ratio <= 0.5) return '#f59e0b'; // 黄
    return 'var(--color-cyan)'; // シアン
  };

  return (
    <div className={`arena-wrapper ${screenEffect === 'shake' ? 'shake-active' : ''}`} style={{ maxWidth: '800px', margin: '0 auto', padding: '0 16px' }}>
      
      {/* 画面エフェクト・キーフレーム定義のスタイルタグ */}
      <style>{`
        .arena-wrapper {
          transition: transform 0.1s ease;
        }
        .shake-active {
          animation: arena-shake 0.4s ease-in-out;
          position: relative;
        }
        .shake-active::before {
          content: "";
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(239, 68, 68, 0.15);
          border: 4px solid #ef4444;
          z-index: 9999;
          pointer-events: none;
          animation: damage-flash-ani 0.4s ease;
        }
        @keyframes arena-shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 90% { transform: translate(-4px, 2px); }
          20%, 80% { transform: translate(4px, -2px); }
          30%, 50%, 70% { transform: translate(-6px, -4px); }
          40%, 60% { transform: translate(6px, 4px); }
        }
        @keyframes damage-flash-ani {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .monster-box {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 180px;
          border-radius: 16px;
          background: radial-gradient(circle, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.95) 100%);
          border: 1px solid var(--border-color);
          box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.6);
          overflow: hidden;
        }
        .grid-bg {
          position: absolute;
          width: 100%; height: 100%;
          background-size: 20px 20px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          top: 0; left: 0;
          z-index: 1;
        }
        .monster-sprite {
          z-index: 2;
          transition: all 0.3s ease;
        }
        .float-ani {
          animation: monster-float 2.5s ease-in-out infinite;
        }
        @keyframes monster-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.03); }
        }
        .atk-slash {
          position: absolute;
          width: 100%; height: 100%;
          top: 0; left: 0;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }
        .slash-line {
          width: 120%;
          height: 8px;
          background: linear-gradient(90deg, transparent, #fff, var(--color-rose), transparent);
          box-shadow: 0 0 20px var(--color-rose);
          transform: rotate(-35deg);
          animation: slash-animation 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        @keyframes slash-animation {
          0% { transform: rotate(-35deg) scaleX(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: rotate(-35deg) scaleX(1); opacity: 0; }
        }
        .dmg-number {
          position: absolute;
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 36px;
          text-shadow: 0 4px 10px rgba(0, 0, 0, 0.8);
          z-index: 10;
          animation: dmg-float 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
        @keyframes dmg-float {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          20% { transform: translateY(-10px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-40px) scale(1); opacity: 0; }
        }
        .hp-bar-outer {
          height: 10px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          overflow: hidden;
          width: 100%;
        }
        .hp-bar-inner {
          height: 100%;
          transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .timer-bar-outer {
          height: 6px;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.05);
          overflow: hidden;
          width: 100%;
        }
        .timer-bar-inner {
          height: 100%;
          transition: width 1s linear, background-color 0.3s ease;
        }
      `}</style>

      {/* 1. チュートリアル / 導入画面 */}
      {gameStatus === 'tutorial' && (
        <div className="glass-panel fade-in" style={{ padding: '32px', textAlign: 'left', borderLeft: '4px solid var(--color-rose)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-rose)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
            <Zap size={24} />
            Fallacy Hunter : 批判思考スピードバトル
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: '16px 0 24px 0' }}>
            アリーナの奥から、対話の論理を食い荒らす「へりくつモンスター」が襲いかかってきました！<br />
            彼らが放つ歪んだ主張（セリフ）を迅速にデバッグ（誤謬特定）し、デバッグコマンドを実行して討伐してください。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚔️ バトルの掟:
              </strong>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>制限時間内に見破れ</strong>: ウェーブが進むほど、タイマー（思考の許容時間）が短縮されます。</li>
                <li><strong>コンボで攻撃力を高めよ</strong>: 連続して正解すると、攻撃のテンポと精度が向上します。</li>
                <li><strong>誤回答と時間切れは致命傷</strong>: 不正解、またはタイマーが0（時間切れ）になると、強烈なカウンターダメージ（HP -20）を受けます。</li>
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {monsters.map((m, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '4px' }}>{m.emoji}</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{m.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>HP {m.maxHp} / {m.timeLimit}秒</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>アリーナに戻る</button>
            <button onClick={startBattle} className="btn btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, var(--color-rose) 0%, #e11d48 100%)', boxShadow: '0 4px 15px var(--color-rose-glow)' }}>
              <Play size={16} />
              バトルを開始する！
            </button>
          </div>
        </div>
      )}

      {/* 2. 戦闘中画面 */}
      {gameStatus === 'playing' && (
        <div className="glass-panel fade-in" style={{ padding: '24px', position: 'relative' }}>
          
          {/* 上部：バトルのヘッダー（ウェーブとHPバー） */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ color: 'var(--color-rose)', fontWeight: 'bold', fontSize: '11px', letterSpacing: '1px', fontFamily: 'var(--font-display)' }}>
                WAVE {wave} / 3
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '2px 0 0 0', color: currentMonster.color }}>
                VS {currentMonster.name}
              </h2>
            </div>
            
            {/* プレイヤーのHP */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '120px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold', color: playerHp <= 40 ? '#ef4444' : 'var(--text-primary)' }}>
                <Heart size={14} fill={playerHp <= 40 ? '#ef4444' : 'var(--color-rose)'} style={{ color: playerHp <= 40 ? '#ef4444' : 'var(--color-rose)' }} />
                HP {playerHp} / 100
              </div>
              <div className="hp-bar-outer">
                <div 
                  className="hp-bar-inner" 
                  style={{ 
                    width: `${playerHp}%`, 
                    background: playerHp <= 40 ? 'linear-gradient(90deg, #ef4444, #b91c1c)' : 'linear-gradient(90deg, var(--color-rose), #ec4899)' 
                  }} 
                />
              </div>
            </div>
          </div>

          {/* モンスターHPバー & バトルタイマー */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            {/* モンスターのHP */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>MONSTER HP</span>
                <span>{monsterHp} / {currentMonster.maxHp}</span>
              </div>
              <div className="hp-bar-outer">
                <div 
                  className="hp-bar-inner" 
                  style={{ 
                    width: `${(monsterHp / currentMonster.maxHp) * 100}%`, 
                    background: `linear-gradient(90deg, ${currentMonster.color}, #7f1d1d)` 
                  }} 
                />
              </div>
            </div>

            {/* バトルタイマー */}
            <div style={{ width: '120px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Timer size={10} /> TIME</span>
                <span style={{ color: getTimerColor(), fontWeight: 'bold' }}>{timeLeft}s</span>
              </div>
              <div className="timer-bar-outer">
                <div 
                  className="timer-bar-inner" 
                  style={{ 
                    width: `${(timeLeft / currentMonster.timeLimit) * 100}%`, 
                    backgroundColor: getTimerColor()
                  }} 
                />
              </div>
            </div>
          </div>

          {/* 中部：バトルスクリーン（モンスターと吹き出し） */}
          <div className="monster-box" style={{ marginBottom: '24px' }}>
            <div className="grid-bg" />
            
            {/* ダメージのポップアップ */}
            {damageNumber && damageNumber.target === 'monster' && (
              <span className="dmg-number" style={{ color: '#ffffff', textShadow: '0 0 10px #ef4444', left: '50%', top: '35%', transform: 'translateX(-50%)' }}>
                -{damageNumber.val}
              </span>
            )}
            {damageNumber && damageNumber.target === 'player' && (
              <span className="dmg-number" style={{ color: '#ef4444', textShadow: '0 0 10px #ffffff', left: '75%', top: '35%' }}>
                -{damageNumber.val}
              </span>
            )}

            {/* 斬撃エフェクト */}
            {atkEffect && (
              <div className="atk-slash">
                <div className="slash-line" />
              </div>
            )}

            {/* モンスターシンボル */}
            <div 
              className={`monster-sprite ${monsterHp > 0 ? 'float-ani' : ''}`}
              style={{
                fontSize: wave === 3 ? '84px' : '72px',
                filter: damageNumber && damageNumber.target === 'monster' ? 'brightness(2) drop-shadow(0 0 20px #ef4444)' : `drop-shadow(0 0 24px ${currentMonster.color})`,
                transition: 'transform 0.1s ease, opacity 0.5s ease',
                opacity: monsterHp <= 0 ? 0 : 1,
                transform: damageNumber && damageNumber.target === 'monster' ? 'scale(0.9) rotate(-5deg)' : 'scale(1)'
              }}
            >
              {currentMonster.emoji}
            </div>

            {/* コンボインジケーター */}
            {combo >= 2 && (
              <div style={{ position: 'absolute', left: '16px', top: '16px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ff8a8a', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10, animation: 'pulse 1s infinite' }}>
                <Flame size={12} fill="#ef4444" style={{ color: '#ef4444' }} />
                {combo} COMBO!
              </div>
            )}
          </div>

          {/* 吹き出し：モンスターが吐くへりくつ・詭弁のテキスト */}
          <div 
            style={{ 
              background: 'var(--bg-inner-box)', 
              borderRadius: '16px', 
              padding: '18px 24px', 
              marginBottom: '24px',
              border: `1px solid ${currentMonster.color}`,
              boxShadow: `0 0 15px ${currentMonster.glowColor}`,
              position: 'relative',
              textAlign: 'left'
            }}
          >
            <div style={{ position: 'absolute', top: '-10px', left: '30px', width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 10px 10px 10px', borderColor: `transparent transparent ${currentMonster.color} transparent` }} />
            <span style={{ fontSize: '10px', color: currentMonster.color, fontWeight: 'bold', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
              {currentMonster.name} の主張：
            </span>
            <p style={{ fontSize: '14.5px', lineHeight: '1.6', color: 'var(--text-primary)', margin: 0, fontWeight: '500' }}>
              {currentQuestion.scenario}
            </p>
          </div>

          {/* 下部：デバッグコマンド（解答選択肢） */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                {currentQuestion.question}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQuestion.choices.map((choice, idx) => {
                const isSelected = selectedChoiceIdx === idx;
                const showCorrect = isAnswered && choice.isCorrect;
                const showWrong = isAnswered && isSelected && !choice.isCorrect;

                let btnStyle = {
                  background: 'var(--bg-draggable-item)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                };

                if (isSelected && !isAnswered) {
                  btnStyle = {
                    background: 'rgba(244, 63, 94, 0.05)',
                    borderColor: 'var(--color-rose)',
                    color: 'var(--color-rose)'
                  };
                } else if (showCorrect) {
                  btnStyle = {
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'var(--color-emerald)',
                    color: 'var(--color-emerald)'
                  };
                } else if (showWrong) {
                  btnStyle = {
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                    color: '#ef4444'
                  };
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    className="btn"
                    style={{
                      ...btnStyle,
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      transition: 'all 0.2s',
                      fontSize: '13.5px',
                      lineHeight: '1.4',
                      cursor: isAnswered ? 'default' : 'pointer',
                      opacity: isAnswered && !isSelected && !choice.isCorrect ? 0.4 : 1
                    }}
                  >
                    <span style={{ marginRight: '8px', fontWeight: 'bold', opacity: 0.6 }}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {choice.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 解説表示エリア (解答後) */}
          {isAnswered && (
            <div 
              style={{ 
                padding: '16px 20px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                marginBottom: '20px',
                textAlign: 'left',
                animation: 'fadeIn 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: selectedChoiceIdx !== null && currentQuestion.choices[selectedChoiceIdx].isCorrect ? 'var(--color-emerald)' : '#ef4444' }}>
                  {selectedChoiceIdx === null 
                    ? '⚠️ 時間切れ！' 
                    : currentQuestion.choices[selectedChoiceIdx].isCorrect ? '🎯 デバッグ成功（モンスターにダメージ）' : '💥 反撃を受けた（プレイヤーにダメージ）'
                  }
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                  （正解のデバッグコマンド: {currentQuestion.fallacyType}）
                </span>
              </div>
              <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)', margin: 0 }}>
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          {/* 次へ進むアクション */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            {isAnswered && monsterHp > 0 && (
              <button onClick={handleNext} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--color-rose) 0%, #e11d48 100%)', boxShadow: '0 4px 15px var(--color-rose-glow)' }}>
                次の問題へ
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. ゲームオーバー画面 */}
      {gameStatus === 'gameover' && (
        <div className="glass-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
          <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: '20px', margin: '0 auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '16px 0 12px 0' }}>
            デバッグ失敗...（敗北）
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '32px' }}>
            へりくつモンスターの詭弁を見破れず、思考回路がオーバーヒート（HPが0）してしまいました。
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={onBack} className="btn btn-secondary">アリーナに戻る</button>
            <button onClick={handleRetry} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
              <RotateCcw size={16} style={{ marginRight: '6px' }} />
              もう一度挑戦
            </button>
          </div>
        </div>
      )}

      {/* 4. ゲームクリア画面 */}
      {gameStatus === 'clear' && (
        <div className="glass-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center', borderLeft: '4px solid var(--color-emerald)' }}>
          <Award size={64} style={{ color: 'var(--color-emerald)', marginBottom: '20px', margin: '0 auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', margin: '16px 0 12px 0' }}>
            アリーナクリア！
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '32px' }}>
            見事にすべてのへりくつモンスターを討伐し、プロフェッショナルな批判思考力を実証しました！
          </p>

          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>プレイヤー残りHP</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--color-rose)', marginTop: '4px' }}>
                {playerHp} / 100
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>最大コンボ数</div>
              <div style={{ fontSize: '28px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--color-cyan)', marginTop: '4px' }}>
                {maxCombo} Combos
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={handleRetry} className="btn btn-secondary">
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
