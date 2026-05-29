import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Heart,
  Smile,
  ShieldAlert,
  Zap,
  ChevronLeft,
  Play
} from 'lucide-react';

// シナリオの対話分岐ツリー定義
const scenarios = [
  {
    id: 'haruto',
    name: 'ハルト（燃え尽き寸前の後輩）',
    avatar: '👨‍💻',
    initialEmotion: '不安・焦燥',
    initialEmotionColor: '#06b6d4', // シアン
    initialDesc: 'タスクの山と目標のプレッシャーに潰され、仕事の意義を見失っている若手社員。',
    tree: {
      // ターン 1
      t1: {
        text: '「最近、どんなにタスクをこなしても成果が出ている実感がなくて…。自分が何のために毎日残業して頑張っているのか見失いそうなんです。」',
        choices: [
          {
            text: '「自分の頑張りが形にならないと、無力感に襲われるし、モチベーションを見失いそうになるのも当然だよ。」',
            type: 'empathy',
            trustChange: 20,
            nextEmotion: '安心・共感',
            nextEmotionColor: '#10b981', // エメラルド
            nextStep: 't2_empathy'
          },
          {
            text: '「業務目標の設定（KPI）に問題があるんじゃない？まずは自分の進捗をスプレッドシートに書き出してタスクの優先度を可視化してみて。」',
            type: 'logic',
            trustChange: -20,
            nextEmotion: '防衛・落胆',
            nextEmotionColor: '#ef4444', // 赤
            nextStep: 't2_logic'
          },
          {
            text: '「僕も入社3年目の時は同じように悩んだよ！でもとにかくがむしゃらにやれば、後から結果がついてくるから心配しないで！」',
            type: 'self',
            trustChange: -10,
            nextEmotion: '孤独・疎外感',
            nextEmotionColor: '#f59e0b', // オレンジ
            nextStep: 't2_self'
          }
        ]
      },
      // ターン 2: 共感ルート
      t2_empathy: {
        text: '「そうなんです…ただタスクを消化するだけのマシーンになっているようで辛かったです。でも先輩が私のこの無力感を理解してくれて、少し息ができる気がします。」',
        choices: [
          {
            text: '「よく一人でそこまで耐えたね。今は可視化や分析は後回しにして、まずは辛かった気持ちを整理することから始めよう。」',
            type: 'empathy',
            trustChange: 25,
            nextEmotion: '信頼・心を開く',
            nextEmotionColor: '#10b981',
            nextStep: 't3_success'
          },
          {
            text: '「気持ちが落ち着いたなら、早速仕事のやり方を見直そう。明日から優先順位を毎日僕に朝会で報告してもらえるかな？」',
            type: 'logic',
            trustChange: -15,
            nextEmotion: '圧迫感・防衛',
            nextEmotionColor: '#ef4444',
            nextStep: 't3_normal'
          }
        ]
      },
      // ターン 2: 正論ルート
      t2_logic: {
        text: '「可視化ですか…。理屈ではそうすべきなのは分かりますが、今はその作業手順を考える気力すら沸かないんです。」',
        choices: [
          {
            text: '「そうだよね。タスク整理を考えること自体が、今のハルトくんにとっては大きな負担だよね。まずは手を止めて休もう。」',
            type: 'empathy',
            trustChange: 20,
            nextEmotion: '安堵',
            nextEmotionColor: '#06b6d4',
            nextStep: 't3_normal'
          },
          {
            text: '「でもそれを避けていたら根本的な解決にならないよ。一時的な感情でタスク整理をサボれば、来週もっと苦しくなるぞ。」',
            type: 'logic',
            trustChange: -25,
            nextEmotion: '拒絶・フリーズ',
            nextEmotionColor: '#ef4444',
            nextStep: 't3_fail'
          }
        ]
      },
      // ターン 2: 自分語りルート
      t2_self: {
        text: '「先輩の時代と違って、今はタスクの量もスピードも倍以上なんです…。がむしゃらにやるだけでは乗り越えられない気がして…。」',
        choices: [
          {
            text: '「そうだよね、時代も環境も変わっているのに、過去の経験を押し付けるような言い方をして悪かった。今のハルトくんの負担は本当に大きいね。」',
            type: 'empathy',
            trustChange: 25,
            nextEmotion: '安心・心を開く',
            nextEmotionColor: '#10b981',
            nextStep: 't3_normal'
          },
          {
            text: '「時代が違っても、ビジネスの基本は同じだよ。自分のキャパシティを超える前に周りにヘルプを出すスキルを磨かないと。」',
            type: 'logic',
            trustChange: -20,
            nextEmotion: 'フリーズ',
            nextEmotionColor: '#ef4444',
            nextStep: 't3_fail'
          }
        ]
      },
      // ターン 3: 最終会話 (成功・標準・失敗)
      t3_success: {
        text: '「ありがとうございます。少し先が見えてきました。タスクの調整について、これからどう動けばいいでしょうか…？」',
        choices: [
          {
            text: '「焦らずゆっくりで大丈夫だよ。まずは今のタスクの中で他人に振れるものがないか、私と一緒に精査していこう。」',
            type: 'empathy',
            trustChange: 15,
            nextEmotion: '超信頼・安堵',
            nextEmotionColor: '#10b981',
            nextStep: 'finish'
          },
          {
            text: '「よし、じゃあ来週のタスク計画のミーティングを早速30分入れようか。自分でタスクリストを更新しておいてね。」',
            type: 'logic',
            trustChange: -10,
            nextEmotion: '疲弊・義務感',
            nextEmotionColor: '#f59e0b',
            nextStep: 'finish'
          }
        ]
      },
      t3_normal: {
        text: '「分かりました。なんとかできる範囲で、少しずつやってみます…。」',
        choices: [
          {
            text: '「無理はしなくていいからね。何かあったらタスクの途中でも、いつでも声をかけて。私たちがサポートするからね。」',
            type: 'empathy',
            trustChange: 15,
            nextEmotion: '信頼',
            nextEmotionColor: '#10b981',
            nextStep: 'finish'
          },
          {
            text: '「うん、それがいいね。来週の月曜日に進捗を一度見せるようにしてください。」',
            type: 'logic',
            trustChange: -15,
            nextEmotion: '緊張・防衛',
            nextEmotionColor: '#f59e0b',
            nextStep: 'finish'
          }
        ]
      },
      t3_fail: {
        text: '「……すみません、これ以上は頭が回りません。少し一人にさせてください。」（相手の心が完全にフリーズしました）',
        choices: []
      }
    }
  },
  {
    id: 'satsuki',
    name: 'サツキ（仕事と育児の板挟みの同僚）',
    avatar: '👩‍⚕️',
    initialEmotion: '葛藤・罪悪感',
    initialEmotionColor: '#f59e0b', // オレンジ
    initialDesc: '子供の発熱による急な欠勤が重なり、職場への申し訳なさと母親としてのキャパシティ限界に悩むナース。',
    tree: {
      t1: {
        text: '「子供が熱を出してしまい、今週二度目の突発的な休みをいただくことになってしまって…。他のスタッフに本当に申し訳なくて、看護師としても母親としても中途半端な自分が嫌になります…。」',
        choices: [
          {
            text: '「お休みが重なると、周りへの申し訳なさで胸が張り裂けそうになるよね。子供も心配だし、どちらも中途半端だと自分を責めてしまうのは当然だよ。」',
            type: 'empathy',
            trustChange: 25,
            nextEmotion: '安心・落涙',
            nextEmotionColor: '#10b981',
            nextStep: 't2_empathy'
          },
          {
            text: '「病児保育サービスに事前登録しておくといいよ。そういう緊急時の預け先をいくつか確保すれば、急な欠勤を減らせて自己嫌悪も防げるはず。」',
            type: 'logic',
            trustChange: -20,
            nextEmotion: '不信・防衛',
            nextEmotionColor: '#ef4444',
            nextStep: 't2_logic'
          },
          {
            text: '「大丈夫だよ！誰も怒ってないし、子供が小さいうちは熱を出すのが仕事みたいなものだから、気にしすぎだって！」',
            type: 'self',
            trustChange: -10,
            nextEmotion: '孤独・あきらめ',
            nextEmotionColor: '#f59e0b',
            nextStep: 't2_self'
          }
        ]
      },
      t2_empathy: {
        text: '「本当にその通りなんです…。看病しながらも、職場のグループチャットの通知音に怯えてしまって、母親としてもナースとしても失格な気がして涙が止まらなくて…。」',
        choices: [
          {
            text: '「子供の看病をしながら仕事のことも気にしなきゃいけないなんて、どれほど心身ともに張り詰めた状態だったか。自分を責めないで、今は看病に専念してね。」',
            type: 'empathy',
            trustChange: 25,
            nextEmotion: '信頼・安堵',
            nextEmotionColor: '#10b981',
            nextStep: 't3_success'
          },
          {
            text: '「それなら、看病している間はグループチャットの通知をオフにしたらいいよ。見なければ余計な罪悪感を抱えずに済むから合理的だよ。」',
            type: 'logic',
            trustChange: -15,
            nextEmotion: '防衛・距離感',
            nextEmotionColor: '#ef4444',
            nextStep: 't3_normal'
          }
        ]
      },
      t2_logic: {
        text: '「病児保育ですか…。もちろん登録は考えていますが、熱を出したばかりの子供を無理やり預けてまでシフトに入るべきなのか、その葛藤自体が苦しくて…。」',
        choices: [
          {
            text: '「そうだよね、システムの問題じゃないんだよね。熱で苦しむ我が子の側にいてあげたいという母親としての葛藤そのものが、辛くて苦しいんだよね。」',
            type: 'empathy',
            trustChange: 25,
            nextEmotion: '安堵',
            nextEmotionColor: '#10b981',
            nextStep: 't3_normal'
          },
          {
            text: '「でも、私たちがプロの看護師として働く以上、個人の感情論とシフト管理は切り離して考えないと、他のナースが燃え尽きてしまいますよ。」',
            type: 'logic',
            trustChange: -25,
            nextEmotion: '拒絶・フリーズ',
            nextEmotionColor: '#ef4444',
            nextStep: 't3_fail'
          }
        ]
      },
      t2_self: {
        text: '「気にしすぎと言われても、実際に私のシフトの穴埋めを他の誰かが夜勤明けでやっていると思うと、いたたまれなくて…。」',
        choices: [
          {
            text: '「そうだよね。お互い様と分かっていても、誰かに負担がいっている事実がある以上、辛いよね。あなたのその責任感の強さこそ、素晴らしいものだよ。」',
            type: 'empathy',
            trustChange: 20,
            nextEmotion: '安心・心を開く',
            nextEmotionColor: '#10b981',
            nextStep: 't3_normal'
          },
          {
            text: '「それなら、復帰した後にその人に直接お礼のギフトでも渡したら？お互いに形として精算すれば、精神的にもスッキリするよ。」',
            type: 'logic',
            trustChange: -15,
            nextEmotion: '防衛',
            nextEmotionColor: '#ef4444',
            nextStep: 't3_fail'
          }
        ]
      },
      t3_success: {
        text: '「心がすーっと軽くなりました。そう言っていただけて、本当に救われます…。戻ったら、精一杯周りをカバーしますね。」',
        choices: [
          {
            text: '「カバーなんて気にしなくていいよ。サツキさんが休んだ分は私たちがチームで進めておくから、安心して子供の側にいてあげてね。」',
            type: 'empathy',
            trustChange: 15,
            nextEmotion: '超信頼・安堵',
            nextEmotionColor: '#10b981',
            nextStep: 'finish'
          },
          {
            text: '「ありがとう、戻ってきたら夜勤のシフトを少し調整して手伝ってもらえると助かるよ。頼りにしてるね！」',
            type: 'logic',
            trustChange: -10,
            nextEmotion: '緊張',
            nextEmotionColor: '#f59e0b',
            nextStep: 'finish'
          }
        ]
      },
      t3_normal: {
        text: '「分かりました。職場に戻った時に、また皆さんに謝罪して、できる範囲で頑張ります…。」',
        choices: [
          {
            text: '「謝罪なんていらないよ。子供の熱は誰のせいでもないんだから。サツキさんの復帰を心から歓迎するよ。」',
            type: 'empathy',
            trustChange: 15,
            nextEmotion: '信頼',
            nextEmotionColor: '#10b981',
            nextStep: 'finish'
          },
          {
            text: '「うん、お詫びはちゃんとしておいた方が波風立たなくていいね。頑張ってね。」',
            type: 'logic',
            trustChange: -15,
            nextEmotion: '防衛',
            nextEmotionColor: '#f59e0b',
            nextStep: 'finish'
          }
        ]
      },
      t3_fail: {
        text: '「……すみません、今は仕事の話をする余裕がありません。失礼します。」（相手の心が完全にフリーズしました）',
        choices: []
      }
    }
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

export default function EqSimulator({ onFinish, playSound, muted, toggleMute, onBack }) {
  // ゲーム進行用ステート
  const [gameStatus, setGameStatus] = useState('tutorial'); // 'tutorial' | 'select' | 'playing' | 'gameover' | 'clear'
  const [selectedScenario, setSelectedScenario] = useState(null);
  
  // バトル状態
  const [trust, setTrust] = useState(50); // 初期信頼度 50%
  const [currentStepKey, setCurrentStepKey] = useState('t1'); // 't1', 't2_empathy' ...
  const [emotion, setEmotion] = useState('');
  const [emotionColor, setEmotionColor] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(null);
  const [shuffledChoices, setShuffledChoices] = useState([]);

  // 画面エフェクト（正論ダメージ時のフリッカーノイズ）
  const [flickerActive, setFlickerActive] = useState(false);
  const [trustChangeNotify, setTrustChangeNotify] = useState(null); // { val: number, isUp: boolean }

  const chatEndRef = useRef(null);

  // チャットスクロール
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatLog, isTyping]);

  // シナリオ開始
  const handleSelectScenario = (sc) => {
    playSound('click');
    setSelectedScenario(sc);
    setTrust(50);
    setCurrentStepKey('t1');
    setEmotion(sc.initialEmotion);
    setEmotionColor(sc.initialEmotionColor);
    setGameStatus('playing');
    setIsAnswered(false);
    setSelectedChoiceIdx(null);

    // 最初のメッセージを受信
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatLog([
        {
          sender: 'them',
          speaker: sc.name.split('（')[0],
          text: sc.tree.t1.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const currentStep = selectedScenario?.tree[currentStepKey];

  useEffect(() => {
    if (currentStep && currentStep.choices) {
      setShuffledChoices(shuffleArray(currentStep.choices));
    } else {
      setShuffledChoices([]);
    }
  }, [currentStepKey, selectedScenario]);

  // 回答決定
  const handleAnswer = (choiceIdx, choice) => {
    if (isAnswered || isTyping) return;
    playSound('click');
    setSelectedChoiceIdx(choiceIdx);
    setIsAnswered(true);

    // 自分の発言をチャットログに追加
    setChatLog(prev => [
      ...prev,
      {
        sender: 'me',
        speaker: 'あなた',
        text: choice.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // 信頼度の更新
    const val = choice.trustChange;
    const isUp = val > 0;
    
    if (isUp) {
      setTimeout(() => playSound('correct'), 300);
    } else {
      setTimeout(() => playSound('incorrect'), 300);
      // 被正論ダメージのフリッカーノイズ演出発動
      setFlickerActive(true);
      setTimeout(() => setFlickerActive(false), 400);
    }

    setTrustChangeNotify({ val: Math.abs(val), isUp });
    setTimeout(() => setTrustChangeNotify(null), 1500);

    setTrust(prev => {
      const nextTrust = Math.min(100, Math.max(0, prev + val));
      if (nextTrust <= 30) {
        // 信頼度30%以下で即時フリーズ（ゲームオーバー）
        setTimeout(() => setGameStatus('gameover'), 2200);
      }
      return nextTrust;
    });

    // 感情ステートの更新
    setEmotion(choice.nextEmotion);
    setEmotionColor(choice.nextEmotionColor);

    // 相手の反応をタイピング表示
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      const nextStepKey = choice.nextStep;

      // 次のステップが finish の場合は、ここで対話終了処理（結果画面へ）
      if (nextStepKey === 'finish') {
        setTimeout(() => {
          setTrust(finalTrust => {
            if (finalTrust >= 75) {
              setGameStatus('clear');
            } else {
              setGameStatus('gameover');
            }
            return finalTrust;
          });
        }, 1000);
        return;
      }

      setCurrentStepKey(nextStepKey);
      const nextStep = selectedScenario.tree[nextStepKey];

      if (!nextStep) {
        // セーフティ
        setGameStatus('gameover');
        return;
      }

      setChatLog(prev => [
        ...prev,
        {
          sender: 'them',
          speaker: selectedScenario.name.split('（')[0],
          text: nextStep.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      // 対話終了判定（次の選択肢がない ＝ fail など）
      if (!nextStep.choices || nextStep.choices.length === 0) {
        setTimeout(() => {
          if (nextStepKey === 't3_fail') {
            setGameStatus('gameover');
          } else {
            // 最終チェック
            setTrust(finalTrust => {
              if (finalTrust >= 75) {
                setGameStatus('clear');
              } else {
                setGameStatus('gameover');
              }
              return finalTrust;
            });
          }
        }, 1200);
      } else {
        setIsAnswered(false);
        setSelectedChoiceIdx(null);
      }

    }, 2000);
  };

  const handleFinishGame = () => {
    onFinish(trust);
  };

  const startTraining = () => {
    playSound('click');
    setGameStatus('select');
  };

  return (
    <div className={`eq-wrapper ${flickerActive ? 'flicker-active' : ''}`} style={{ maxWidth: '750px', margin: '0 auto', padding: '0 16px' }}>
      
      {/* 画面ノイズ、信頼度通知のCSSスタイル */}
      <style>{`
        .eq-wrapper {
          transition: filter 0.1s ease;
        }
        .flicker-active {
          animation: noise-flicker 0.3s ease infinite;
        }
        .flicker-active::before {
          content: "";
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(239, 68, 68, 0.1);
          border: 4px solid #ef4444;
          z-index: 9999;
          pointer-events: none;
        }
        @keyframes noise-flicker {
          0%, 100% { filter: contrast(1.1) brightness(1); }
          50% { filter: contrast(1.4) brightness(0.9) blur(0.5px); }
        }
        .trust-bar-outer {
          height: 12px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color);
          overflow: hidden;
          width: 100%;
          position: relative;
        }
        .trust-bar-inner {
          height: 100%;
          transition: width 0.6s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .avatar-neon-ring {
          position: relative;
          width: 60px; height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
          border: 2px solid var(--border-color);
          transition: border-color 0.5s ease, box-shadow 0.5s ease;
          font-size: 28px;
        }
        .dot-blink {
          width: 6px; height: 6px;
          background: var(--text-muted);
          border-radius: 50%;
          display: inline-block;
          animation: dot-jump 1.4s infinite ease-in-out both;
        }
        .dot-blink:nth-child(2) { animation-delay: 0.2s; }
        .dot-blink:nth-child(3) { animation-delay: 0.4s; }
        @keyframes dot-jump {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1.2); opacity: 1; }
        }
        .notify-trust {
          position: absolute;
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 14px;
          animation: trust-notify-float 1.5s ease forwards;
          z-index: 100;
          top: -20px;
          right: 0;
        }
        @keyframes trust-notify-float {
          0% { transform: translateY(0); opacity: 0; }
          20% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(-20px); opacity: 0; }
        }
      `}</style>

      {/* 1. チュートリアル */}
      {gameStatus === 'tutorial' && (
        <div className="glass-panel fade-in" style={{ padding: '32px', textAlign: 'left', borderLeft: '4px solid var(--color-primary)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '24px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: 0 }}>
            <MessageSquare size={24} />
            EQ・共感対話シミュレーター
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', margin: '16px 0 24px 0' }}>
            ビジネスや日常の対人関係において、最も高度とされる「共感力（EQ）」をデバッグする実戦シミュレーターです。<br />
            深い悩みや葛藤を抱え、心を閉ざしかけている相手と向き合い、対話を通じて信頼の架け橋を構築してください。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <strong style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💬 シミュレーションの掟:
              </strong>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '8px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><strong>正論は時に相手を傷つける</strong>: 「論破」「アドバイスの押し付け」は不快感を与え、信頼度（Trust）が激減します。</li>
                <li><strong>相手の感情を肯定せよ</strong>: 相手の辛さや葛藤に寄り添う受容的な回答が、信頼度を高めます。</li>
                <li><strong>マルチステップ分岐</strong>: あなたの選択によって相手の次のセリフや感情状態、そして選択肢が3ターンにわたり変化します。</li>
                <li><strong>信頼度 80% 以上でクリア</strong>: 最終信頼度が80%以上で対話を終えればデバッグ成功。30%以下、または対話失敗で即フリーズ（敗北）となります。</li>
              </ul>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>アリーナに戻る</button>
            <button onClick={startTraining} className="btn btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)', boxShadow: '0 4px 15px var(--color-primary-glow)' }}>
              <Play size={16} style={{ marginRight: '6px' }} />
              対話を始める
            </button>
          </div>
        </div>
      )}

      {/* 2. シナリオ選択画面 */}
      {gameStatus === 'select' && (
        <div className="glass-panel fade-in" style={{ padding: '32px', textAlign: 'left' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginTop: 0, marginBottom: '20px' }}>
            対話する相手を選択してください
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
            {scenarios.map((sc) => (
              <div 
                key={sc.id}
                onClick={() => handleSelectScenario(sc)}
                className="glass-panel hover-lift"
                style={{
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  background: 'var(--glass-bg)'
                }}
              >
                <div style={{ fontSize: '40px', background: 'rgba(255,255,255,0.03)', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                  {sc.avatar}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0 }}>{sc.name}</h4>
                    <span style={{ fontSize: '11px', color: sc.initialEmotionColor, border: `1px solid ${sc.initialEmotionColor}`, padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                      初期感情: {sc.initialEmotion}
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px', margin: 0, lineHeight: '1.4' }}>
                    {sc.initialDesc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={() => setGameStatus('tutorial')} className="btn btn-secondary" style={{ width: '100%' }}>戻る</button>
        </div>
      )}

      {/* 3. シミュレーションチャット画面 */}
      {gameStatus === 'playing' && selectedScenario && (
        <div className="glass-panel fade-in" style={{ padding: '20px', position: 'relative' }}>
          
          {/* チャットヘッダー（相手のアバター、感情ステート、信頼度バー） */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div 
                className="avatar-neon-ring" 
                style={{ 
                  borderColor: emotionColor,
                  boxShadow: `0 0 15px ${emotionColor}60`
                }}
              >
                {selectedScenario.avatar}
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>
                  {selectedScenario.name.split('（')[0]}
                </h3>
                <span style={{ fontSize: '11px', color: emotionColor, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  感情ステート: 【{emotion}】
                </span>
              </div>
            </div>

            {/* 信頼度ゲージ */}
            <div style={{ width: '180px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative' }}>
              
              {/* 信頼度通知ポップアップ */}
              {trustChangeNotify && (
                <span className="notify-trust" style={{ color: trustChangeNotify.isUp ? 'var(--color-emerald)' : '#ef4444' }}>
                  {trustChangeNotify.isUp ? `+${trustChangeNotify.val}% Trust` : `-${trustChangeNotify.val}% Trust`}
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', fontWeight: 'bold', color: trust >= 75 ? 'var(--color-emerald)' : trust <= 40 ? '#ef4444' : 'var(--text-primary)', marginBottom: '4px' }}>
                <Smile size={13} style={{ color: trust >= 75 ? 'var(--color-emerald)' : trust <= 40 ? '#ef4444' : 'var(--text-muted)' }} />
                現在の信頼関係: {trust}%
              </div>
              <div className="trust-bar-outer">
                <div 
                  className="trust-bar-inner" 
                  style={{ 
                    width: `${trust}%`,
                    background: trust >= 75 
                      ? 'linear-gradient(90deg, var(--color-emerald), #059669)' 
                      : trust <= 40 
                        ? 'linear-gradient(90deg, #ef4444, #b91c1c)' 
                        : 'linear-gradient(90deg, var(--color-primary), #7c3aed)'
                  }} 
                />
              </div>
            </div>
          </div>

          {/* メッセンジャーチャットログ */}
          <div 
            style={{
              height: '300px',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginBottom: '20px'
            }}
          >
            {chatLog.map((msg, index) => {
              const isMe = msg.sender === 'me';
              return (
                <div 
                  key={index}
                  className="fade-in"
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    width: '100%'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '80%', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px', padding: '0 4px' }}>
                      {msg.speaker}
                    </span>
                    <div 
                      style={{
                        padding: '10px 14px',
                        borderRadius: '14px',
                        borderTopLeftRadius: isMe ? '14px' : '2px',
                        borderTopRightRadius: isMe ? '2px' : '14px',
                        background: isMe 
                          ? 'linear-gradient(135deg, var(--color-primary) 0%, #6d28d9 100%)' 
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isMe ? 'none' : '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '13.5px',
                        lineHeight: '1.45',
                        textAlign: 'left',
                        boxShadow: isMe ? '0 4px 10px rgba(139, 92, 246, 0.15)' : 'none'
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 入力中... */}
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }} className="fade-in">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    入力中...
                  </span>
                  <div style={{ padding: '10px 16px', borderRadius: '12px', borderTopLeftRadius: '2px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', display: 'flex', gap: '3px', alignItems: 'center' }}>
                    <span className="dot-blink" />
                    <span className="dot-blink" />
                    <span className="dot-blink" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 下部：選択肢（会話の返答コマンド） */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!isAnswered && !isTyping && shuffledChoices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx, choice)}
                className="btn btn-secondary"
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  textAlign: 'left',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s',
                  display: 'flex',
                  gap: '8px'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{choice.text}</span>
              </button>
            ))}
          </div>

        </div>
      )}

      {/* 4. ゲームオーバー（心のフリーズ） */}
      {gameStatus === 'gameover' && (
        <div className="glass-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center', borderLeft: '4px solid #ef4444' }}>
          <ShieldAlert size={64} style={{ color: '#ef4444', marginBottom: '20px', margin: '0 auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '16px 0 12px 0' }}>
            心のデバッグ失敗...
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '16px', lineHeight: '1.5' }}>
            相手の心のバグ（防衛システム）が限界を超えて発動しました。<br />
            正論のアドバイスや解決策の押し付けによって相手が心を完全に閉ざしてしまい、信頼関係（Trust {trust}%）が崩壊しました。
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => setGameStatus('select')} className="btn btn-secondary">シナリオ選択に戻る</button>
            <button onClick={() => handleSelectScenario(selectedScenario)} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)' }}>
              <RotateCcw size={16} style={{ marginRight: '6px' }} />
              同じ相手と再対話
            </button>
          </div>
        </div>
      )}

      {/* 5. クリア画面（デバッグ大成功） */}
      {gameStatus === 'clear' && selectedScenario && (
        <div className="glass-panel fade-in" style={{ padding: '40px 32px', textAlign: 'center', borderLeft: '4px solid var(--color-emerald)' }}>
          <CheckCircle2 size={64} style={{ color: 'var(--color-emerald)', marginBottom: '20px', margin: '0 auto' }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', margin: '16px 0 12px 0' }}>
            対話デバッグ成功！
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', marginBottom: '32px', lineHeight: '1.5' }}>
            相手の悩みを肯定・受容する美しい傾聴により、深い信頼関係（Trust {trust}%）を構築することに成功しました！
          </p>

          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>最終信頼関係</div>
              <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 'bold', color: 'var(--color-emerald)', marginTop: '4px' }}>
                {trust}%
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)' }}></div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>クリア評価</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '12px' }}>
                {trust >= 90 ? '🏆 EQマスター' : '🎯 寄り添いスペシャリスト'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => setGameStatus('select')} className="btn btn-secondary">別のシナリオへ</button>
            <button 
              onClick={handleFinishGame} 
              className="btn btn-primary" 
              style={{ 
                padding: '12px 32px',
                background: 'linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%)', 
                boxShadow: '0 4px 15px var(--color-primary-glow)' 
              }}
            >
              結果を記録してアリーナへ戻る
              <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
