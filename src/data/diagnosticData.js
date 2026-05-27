// Diagnostic Tool Questions and Determination Logic
// L = Logical, C = Critical, R = Radical, E = Emotional

export const diagnosticQuestions = [
  {
    id: 1,
    category: "business",
    scenario: "会議中、同僚が「この新しい企画、絶対に大ヒットします！」と熱弁しています。あなたの脳内での最初のリアクションは？",
    choices: [
      {
        text: "「大ヒットする」と言うための客観的なデータや市場の裏付けはあるのかな？",
        scores: { L: 15, C: 0, R: 0, E: 0 }
      },
      {
        text: "「絶対に」なんてあり得ない。もし競合が先に動くなどのリスクはどう考えている？",
        scores: { L: 0, C: 15, R: 0, E: 0 }
      },
      {
        text: "そもそもこの企画って、私たちが今一番解決すべき「根本の課題」と合ってるんだっけ？",
        scores: { L: 0, C: 0, R: 15, E: 0 }
      },
      {
        text: "彼のその熱意がすごい！このパッションがあればチームも動くし、成功しそうだから応援したい！",
        scores: { L: 0, C: 0, R: 0, E: 15 }
      }
    ]
  },
  {
    id: 2,
    category: "private",
    scenario: "大切な友人から「仕事が本当に辛くて、もう会社を辞めたい」と深刻そうに相談されました。あなたの対応は？",
    choices: [
      {
        text: "辞めた後の転職市場の状況や生活費のリスクなど、冷静なネクストアクションを一緒に分析・整理する。",
        scores: { L: 15, C: 0, R: 0, E: 0 }
      },
      {
        text: "「本当に原因は会社だけ？ 自分の考え方に『こうあるべき』っていう認知の歪みがない？」と前提を問いかけてみる。",
        scores: { L: 0, C: 15, R: 0, E: 0 }
      },
      {
        text: "「人生において、自分にとって何が一番の幸せなのか？」という人生の目的や価値観の根っこを一緒に語り合う。",
        scores: { L: 0, C: 0, R: 15, E: 0 }
      },
      {
        text: "「そっか、それは本当に辛かったね。今まで本当によく頑張ったよ」と、一切の正論を抜きにしてまず抱きしめる勢いで共感する。",
        scores: { L: 0, C: 0, R: 0, E: 15 }
      }
    ]
  },
  {
    id: 3,
    category: "private",
    scenario: "友人との待ち合わせ。約束の時間を30分過ぎてから「今起きた！本当にごめん！」とLINEが来ました。あなたの脳内は？",
    choices: [
      {
        text: "「ここから準備して移動すると何分かかるから、合流は◯時◯分だな」と、瞬時に今後のスケジュールを再計算する。",
        scores: { L: 15, C: 0, R: 0, E: 0 }
      },
      {
        text: "「本当に寝坊？ 実は私との約束を軽く見てる？ 最近も遅れることあったな…」と相手の誠実さや普段の行動パターンを査定し始める。",
        scores: { L: 0, C: 15, R: 0, E: 0 }
      },
      {
        text: "「まあ起きたもんはしょうがない。そもそも今日やりたかった『美味しいランチを食べる』を達成する別の方法を考えよう」と切り替える。",
        scores: { L: 0, C: 0, R: 15, E: 0 }
      },
      {
        text: "「事故や病気じゃなくてよかったー！眠れなかったのかな？怒ってないから気をつけてきてね！」と相手の心配と安堵が最優先になる。",
        scores: { L: 0, C: 0, R: 0, E: 15 }
      }
    ]
  },
  {
    id: 4,
    category: "business",
    scenario: "会社のプロジェクトで意見が真っ二つに対立し、議論が膠着状態に陥りました。あなたならどう議論を進める？",
    choices: [
      {
        text: "両案のメリット・デメリット、実現可能性をスプレッドシート等に整理し、客観的に点数化して決めることを提案する。",
        scores: { L: 15, C: 0, R: 0, E: 0 }
      },
      {
        text: "それぞれの案が「都合の良い前提」で話していないか、欠陥や矛盾点を1つずつ突いて、崩れにくい方を残す。",
        scores: { L: 0, C: 15, R: 0, E: 0 }
      },
      {
        text: "「そもそも、このプロジェクトで私たちが顧客に届けたい『一番の価値』って何だっけ？」と目的を再定義して話を戻す。",
        scores: { L: 0, C: 0, R: 15, E: 0 }
      },
      {
        text: "メンバーの表情を見て、これ以上対立すると関係が壊れると感じ、「まずはお互いの言い分を全部吐き出させて、スッキリしよう」と場を和ませる。",
        scores: { L: 0, C: 0, R: 0, E: 15 }
      }
    ]
  },
  {
    id: 5,
    category: "decision",
    scenario: "「あなたの人生を劇的に変える！」と謳う、自己投資のための20万円の高額セミナーを勧められました。あなたの行動は？",
    choices: [
      {
        text: "受講後の回収シミュレーション（ROI）や、自分が得られる知識のロードマップを論理的に組み立てて投資価値があるか判断する。",
        scores: { L: 15, C: 0, R: 0, E: 0 }
      },
      {
        text: "「劇的に変える」という言葉を疑い、過去の受講生の実績、講師の経歴、悪い口コミやサクラの有無を徹底的にネットで調査する。",
        scores: { L: 0, C: 15, R: 0, E: 0 }
      },
      {
        text: "そもそも「自分は今、人生で何を目指しているのか？ このセミナーは本当にその目的に不可欠なのか？」と人生のロードマップを見直す。",
        scores: { L: 0, C: 0, R: 15, E: 0 }
      },
      {
        text: "「直感でビビッときた！ここで迷ったら一生変われない！」と、ワクワクする気持ちと自分の熱量を信じて申し込む。",
        scores: { L: 0, C: 0, R: 0, E: 15 }
      }
    ]
  },
  {
    id: 6,
    category: "information",
    scenario: "SNSで「この朝のルーティンを取り入れたら、集中力が劇的に上がった！」という健康法が大バズりしています。あなたの反応は？",
    choices: [
      {
        text: "その健康法が脳や体に与える影響の科学的エビデンス（医学論文やメカニズムの合理性）を検索して調べる。",
        scores: { L: 15, C: 0, R: 0, E: 0 }
      },
      {
        text: "「これってインフルエンサーのステマ（広告）やPRじゃない？何かのビジネスに誘導しようとしてない？」と発信者の意図を疑う。",
        scores: { L: 0, C: 15, R: 0, E: 0 }
      },
      {
        text: "そもそも「自分は今、集中力に困っているのか？ 朝のルーティンをわざわざ増やす必要があるのか？」と自分の日常の必要性を考える。",
        scores: { L: 0, C: 0, R: 15, E: 0 }
      },
      {
        text: "「へえ、面白そう！みんなやってるし、オシャレだから明日からさっそく試してみよう！」と直感的に取り入れる。",
        scores: { L: 0, C: 0, R: 0, E: 15 }
      }
    ]
  },
  {
    id: 7,
    category: "trouble",
    scenario: "買ったばかりのちょっと高価なスマート家電が、セットアップ直後にフリーズして動かなくなりました。どうする？",
    choices: [
      {
        text: "取扱説明書の「困ったときは」のページを上から順に読み、エラーランプの点滅パターンを照合して論理的に原因を特定する。",
        scores: { L: 15, C: 0, R: 0, E: 0 }
      },
      {
        text: "「製品自体の初期不良か？それともこのメーカーのファームウェアのバグか？」と、ネットで同じ不具合が多発していないか検索する。",
        scores: { L: 0, C: 15, R: 0, E: 0 }
      },
      {
        text: "「まあ精密機械だからフリーズもする。そもそも、今やりたかった操作はスマホの別アプリや別の手段で代替できないか？」と考える。",
        scores: { L: 0, C: 0, R: 15, E: 0 }
      },
      {
        text: "「何これ！買ったばっかりなのに最悪！」とイライラを爆発させ、家族や友人に「聞いてよ！」と不満の愚痴LINEを送る。",
        scores: { L: 0, C: 0, R: 0, E: 15 }
      }
    ]
  }
];

export const diagnosticTypes = {
  psycho: {
    id: "psycho",
    name: "感情を忘れた正論サイコパス",
    emoji: "🤖",
    tagline: "すべての出来事をデータで殴る論理学の申し子",
    description: "あなたの頭の中はバグのないプログラムのようです。何事も客観的な事実（ファクト）とデータの整合性で判断し、完璧な筋道を立てる天才です。しかし、論理的すぎて感情の機微を完全にスルーするため、友人やパートナーの愚痴に「それって何が目的の会話？」と問いかけて凍りつかせることがあります。人間はたまに感情だけでバグりたくなる生き物だという事実を認識しましょう。",
    strengths: ["抜群の客観性", "破綻のないロジック構築力", "冷静沈着な問題解決"],
    weaknesses: ["人の心の揺れを『無駄なデータ』と切り捨てる", "共感能力の電池切れ", "正論ハラスメント"],
    recommendedGame: "factsOpinions",
    recommendedReason: "『事実と意見』の切り分けはあなたの得意分野のはず。完璧な全問正解を目指して、自慢の論理力を存分に発揮してください！"
  },
  nitpicker: {
    id: "nitpicker",
    name: "アラ探し専門の粗大ゴミチェッカー",
    emoji: "🔍",
    tagline: "甘い前提と他人のへりくつを許さない防壁の番人",
    description: "あなたは「それって本当？」と疑うクリティカルシンキングの極振りタイプです。世の中の甘い売り文句や、他人の適当な発言に潜む「バグや矛盾」を瞬時に見抜く優れた防衛能力を持っています。しかし、疑いすぎて「あら探し」ばかりにエネルギーを消費し、自分では新しいアイデアや行動を起こさないままブレーキを踏み続けるクレーマー化の危機も。たまには前提を信じてみる勇気を。",
    strengths: ["詐欺やへりくつに絶対に騙されない", "リスク検知能力の高さ", "物事の裏を見抜く観察眼"],
    weaknesses: ["何でも否定から入る", "自分発信のアクションが少ない", "疑いすぎて人間不信になりがち"],
    recommendedGame: "fallacy",
    recommendedReason: "『誤謬（へりくつ）探偵』がぴったりです。相手の屁理屈や論理の歪みを暴くあなたの鋭いツッコミ力を、ゲームの中で解放してみましょう！"
  },
  radicalOrigin: {
    id: "radicalOrigin",
    name: "宇宙へ飛び立つ『そもそも星人』",
    emoji: "🪐",
    tagline: "目の前の枝葉をすべて無視して『根っこ』にダイブする哲学者",
    description: "あなたは物事の本質を追究するラディカル（根本的）思考の天才です。「そもそも何のためにやるんだっけ？」と常に目的の根っこを問い直すため、おかしな方向に進むプロジェクトを軌道修正するヒーローになれます。しかし、あまりにも「そもそも」を連発しすぎるため、今日の会議で決めるべき「小さなスケジュール」などが1ミリも前に進まず、周囲を「それはいいから今週の作業の話をしてくれ！」と頭を抱えさせます。",
    strengths: ["ブレない目的意識", "本質を見抜く力", "ゼロベースでのブレイクスルー発想"],
    weaknesses: ["思考が抽象的すぎて着地しない", "目の前の細かいタスクを軽視する", "『そもそも』で全体の進行を止める"],
    recommendedGame: "logicTree",
    recommendedReason: "思考の枠組みを構造的に分解する『ロジックツリー』がおすすめです。本質（根っこ）から綺麗なロジックの枝葉を伸ばす訓練になります。"
  },
  runawayTrain: {
    id: "runawayTrain",
    name: "直感とノリだけで生きる暴走機関車",
    emoji: "💖",
    tagline: "アタマより先にココロが動く、共感とパッションの化身",
    description: "あなたはとにかく直感と熱意、そして豊かなエモーショナル（感情）で動く情熱家です。他人の喜怒哀楽に秒でシンクロし、「面白そう！」と思ったことには寝食を忘れて飛び込める最高に人間味あふれる人です。論理なんて堅苦しいものは知らん！しかし、すべての意思決定をノリと感情で行うため、後になって「なんであの高額商品を買ったんだっけ…」と激しく後悔したり、感情の波に自分自身が振り回されがちです。",
    strengths: ["圧倒的な共感力と人徳", "行動を起こすパッション", "人の心を動かす魅力"],
    weaknesses: ["行き当たりばったりで後悔が多い", "客観的な数字やリスクを無視する", "気分によってパフォーマンスのムラが激しい"],
    recommendedGame: "factsOpinions",
    recommendedReason: "直感で生きるあなたにこそ『事実と意見』の切り分けトレーニングがおすすめ。「思ったこと」と「起きたこと」を一度分離するだけで、人生のバグが半分減ります！"
  },
  monster: {
    id: "monster",
    name: "感情豊かなロジカルモンスター",
    emoji: "🦁",
    tagline: "鬼のロジックと圧倒的パッションを併せ持つ熱血軍師",
    description: "あなたは「ロジカル（L）」と「エモーショナル（E）」がどちらも限界突破しているハイブリッドタイプです。データに裏付けられた冷徹なロジックを組み立てながらも、それを伝える時は圧倒的な熱量と共感で周囲を巻き込んでいく、最強の推進力を持っています。ただし、両極端なエンジンを積んでいるため、心の中で「論理的に正しい結論」と「感情的に許せない気持ち」が激しくケンカし、自分自身が一番疲弊しやすい二重人格の悩みを抱えています。",
    strengths: ["説得力と巻き込み力の融合", "ロジックも感情も完璧に理解できる", "情熱的なリーダーシップ"],
    weaknesses: ["脳内ロジックと本音の葛藤でフリーズする", "時に『データ付きで激怒する』ので超怖い", "情緒不安定に見えることがある"],
    recommendedGame: "logicTree",
    recommendedReason: "頭の中の『葛藤』を整理するために『ロジックツリー』を使いましょう。感情と論理を綺麗に切り分けることで、脳のフリーズを解消できます。"
  },
  philosopher: {
    id: "philosopher",
    name: "社会のバグと戦う孤高の哲学者",
    emoji: "🦉",
    tagline: "常識の嘘（クリティカル）を暴き、本質（ラディカル）に光を当てる求道者",
    description: "あなたは「クリティカル（C）」と「ラディカル（R）」の双方が高い、極めて深い洞察力を持つ知性派です。世間の「みんなが言っている常識」や「形骸化したルール」に対し、「それ本当？」「そもそも何のために存在しているの？」と鋭く切り込み、本質的な課題を浮き彫りにします。一方で、世の中のほとんどのことが「おかしな前提のへりくつ」に見えてしまうため、常にイラ立ちを感じやすく、冷笑的な引きこもり哲学者になってしまう傾向も。",
    strengths: ["極めて高い問題発見能力", "常識に惑わされない真の独立心", "物事の前提を覆す思考力"],
    weaknesses: ["現状に対する不満や批判が多くなりがち", "他人の知的怠慢にイライラする", "行動に移す前に考えすぎて冷める"],
    recommendedGame: "fallacy",
    recommendedReason: "『誤謬（へりくつ）探偵』で、世に蔓延るへりくつのパターンを分析的に整理しましょう。あなたの持っている批判的視点をゲーム感覚でスマートに昇華できます。"
  },
  frogAnalyst: {
    id: "frogAnalyst",
    name: "脳内デバッグ完了！カエル分析官",
    emoji: "🐸",
    tagline: "すべての思考ギアを最適に切り替える LogiFit の理想体",
    description: "おめでとうございます！あなたはL・C・R・Eのすべてのバランスが極めて整っている、思考のマスターです。事実に基いて論理（L）を立て、前提のバグ（C）を検証し、そもそも（R）の目的に立ち返りつつ、最後は人や自分の心（E）を大切にして意思決定ができます。まさに『カエル分析官』そのもの。これ以上鍛える必要はないかもしれませんが、ぜひ現状維持と脳のストレッチとしてLogiFitをご愛用ください。",
    strengths: ["圧倒的にバランスの取れた意思決定", "どんな相手・状況にも柔軟に対応可能", "思考に死角がない"],
    weaknesses: ["完璧すぎて人間味が薄いと思われることも", "優等生的な解決に落ち着きやすい", "たまには暴走したくなる（隠れた衝動）"],
    recommendedGame: "fallacy",
    recommendedReason: "基本ができているあなたには、応用編である『誤謬（へりくつ）探偵』の中級問題がおすすめ。複雑なへりくつを見抜く楽しさを味わってください。"
  },
  balancedThinker: {
    id: "balancedThinker",
    name: "波風を立てないフラット・バランサー",
    emoji: "⚖️",
    tagline: "何事も平均的にこなし、安定した脳内バランスを保つ人",
    description: "あなたはどの思考パラメータも均等で、かつ過剰な偏りがない、極めて安定したバランス感覚を持つ人です。極端に偏った意見に流されることなく、物事を多角的に見渡すことができます。しかし、尖った特徴がないため、時に「自分の意見がない」「何でも周りに合わせるだけ」といった優柔不断さに陥ることも。たまには自分の「エモーショナル（パッション）」を信じて極端に動いてみるのも刺激になりますよ。",
    strengths: ["高い安定感と協調性", "極端なバイアスに囚われない", "誰とでも波風を立てずに会話できる"],
    weaknesses: ["自己主張が弱くなりがち", "強い突破力や瞬発力に欠ける", "無難な選択に落ち着いてしまう"],
    recommendedGame: "logicTree",
    recommendedReason: "自分の考えを明確に構造化し、主張をシャープにするために『ロジックツリー』で思考を分解・組み立てる練習をするのがおすすめです。"
  }
};

// Determine type based on L, C, R, E scores
export function determineDiagnosticType(scores) {
  const { L, C, R, E } = scores;
  
  // 1. Calculate standard values
  const maxVal = Math.max(L, C, R, E);
  const minVal = Math.min(L, C, R, E);
  const diffMaxMin = maxVal - minVal;
  
  // 2. Check Balanced type (Frog Analyst or Flat Balancer)
  // Total is always 105 (7 questions * 15).
  // If the difference between max and min is small, it's balanced.
  if (diffMaxMin <= 15) {
    // If scores are generally high (since total is 105, uniform distribution is around 25-30 each)
    // If they are all close to the average (26.25), it's highly balanced.
    if (maxVal <= 35) {
      // If L, C, R, E are all extremely close (e.g. L:30, C:30, R:30, E:15, or combinations)
      // We check if Emotional is also reasonably high. If it's a perfect flat balancer:
      return diagnosticTypes.balancedThinker;
    }
    return diagnosticTypes.frogAnalyst;
  }
  
  // 3. Check Hybrid types
  // Logical (L) and Emotional (E) are both high (>= 30) and close to each other
  if (L >= 30 && E >= 30 && Math.abs(L - E) <= 15 && L + E > C + R) {
    return diagnosticTypes.monster;
  }
  
  // Critical (C) and Radical (R) are both high (>= 30) and close to each other
  if (C >= 30 && R >= 30 && Math.abs(C - R) <= 15 && C + R > L + E) {
    return diagnosticTypes.philosopher;
  }
  
  // 4. Single Maximum Dominance
  if (maxVal === L) return diagnosticTypes.psycho;
  if (maxVal === C) return diagnosticTypes.nitpicker;
  if (maxVal === R) return diagnosticTypes.radicalOrigin;
  if (maxVal === E) return diagnosticTypes.runawayTrain;
  
  // Fallback
  return diagnosticTypes.balancedThinker;
}
