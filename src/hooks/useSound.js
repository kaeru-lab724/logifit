import { useCallback, useState, useEffect } from 'react';

// モジュールスコープのシングルトン変数（グローバルな音声状態を同期）
let globalAudioCtx = null;
let rainNode = null;
let padInterval = null;
let padNodes = [];
let globalBgmVolumeNode = null;

// ローカルストレージおよびグローバル状態の初期化
let globalBgmType = localStorage.getItem('logifit_bgm_type') || 'none';
let globalBgmVolume = parseFloat(localStorage.getItem('logifit_bgm_volume') ?? '0.3');
let globalKeyboardEnabled = localStorage.getItem('logifit_keyboard_enabled') !== 'false';
let globalMuted = localStorage.getItem('logifit_muted') === 'true';

// 複数インスタンスのuseSound間で状態を同期するためのオブザーバー機構
let listeners = [];
const notifyAll = () => {
  const state = {
    muted: globalMuted,
    bgmType: globalBgmType,
    bgmVolume: globalBgmVolume,
    keyboardEnabled: globalKeyboardEnabled
  };
  listeners.forEach(listener => listener(state));
};

// AudioContextの初期化と自動レジューム
const ensureAudioContext = () => {
  try {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        console.log("useSound: Creating new AudioContext...");
        globalAudioCtx = new AudioContextClass();
        globalBgmVolumeNode = globalAudioCtx.createGain();
        globalBgmVolumeNode.gain.setValueAtTime(globalBgmVolume, globalAudioCtx.currentTime);
        globalBgmVolumeNode.connect(globalAudioCtx.destination);
        console.log("useSound: AudioContext and BGM Gain node successfully created.");
      } else {
        console.warn("useSound: Web Audio API is not supported in this browser.");
      }
    }
    if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
      console.log("useSound: AudioContext is suspended. Attempting to resume...");
      globalAudioCtx.resume().then(() => {
        console.log("useSound: AudioContext successfully resumed. State:", globalAudioCtx.state);
      }).catch(err => {
        console.error("useSound: Failed to resume AudioContext:", err);
      });
    }
  } catch (e) {
    console.error("useSound: Error inside ensureAudioContext:", e);
  }
  return globalAudioCtx;
};

// 自然で本格的な雨音シンセサイザー (こもった重低音ノイズを除去したすっきり版)
const startRain = (ctx, targetNode) => {
  if (rainNode) return;
  console.log("useSound: Starting clean rumble-free rain synthesizer...");
  
  try {
    // 高音質ピンクノイズバッファの作成（4秒ループ）
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // KelletのRefined法によるピンクノイズ生成
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // 音量レベルのノーマライズ
      b6 = white * 0.115926;
    }

    // 【層1】メインの雨音（低域の「ゴー」というこもり音をハイパスでカット、高域の「シャー」をローパスでカット）
    const source1 = ctx.createBufferSource();
    source1.buffer = buffer;
    source1.loop = true;
    
    const hp1 = ctx.createBiquadFilter();
    hp1.type = 'highpass';
    hp1.frequency.setValueAtTime(360, ctx.currentTime); // 360Hz以下をカット（これで「ゴー」というエンジン音が消えます）
    
    const lp1 = ctx.createBiquadFilter();
    lp1.type = 'lowpass';
    lp1.frequency.setValueAtTime(1400, ctx.currentTime); // 1400Hz以上をカット（これで耳障りなヒス音が消え、優しくなります）
    
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.45, ctx.currentTime);

    source1.connect(hp1);
    hp1.connect(lp1);
    lp1.connect(gain1);
    gain1.connect(targetNode);

    // 【層2】木の葉や窓を濡らす、サラサラとした軽やかな雨の音（広域の雨だれ表現）
    const source2 = ctx.createBufferSource();
    source2.buffer = buffer;
    source2.loop = true;

    const bp2 = ctx.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.setValueAtTime(1150, ctx.currentTime);
    bp2.Q.setValueAtTime(0.3, ctx.currentTime); // Q値を極端に小さくして、耳障りな共振を徹底排除

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.12, ctx.currentTime);

    source2.connect(bp2);
    bp2.connect(gain2);
    gain2.connect(targetNode);

    source1.start(0);
    source2.start(0);

    // 【風・強弱の再現】800msごとに中高域の音量をゆっくり波打たせる
    let lfoStep = 0;
    const lfoInterval = setInterval(() => {
      if (globalBgmType !== 'rain' || globalMuted) {
        clearInterval(lfoInterval);
        return;
      }
      try {
        const now = ctx.currentTime;
        const modVolume = 0.12 + Math.sin(lfoStep) * 0.03;
        gain2.gain.linearRampToValueAtTime(modVolume, now + 0.7);

        const modFreq = 1150 + Math.cos(lfoStep * 0.8) * 90;
        bp2.frequency.linearRampToValueAtTime(modFreq, now + 0.7);

        lfoStep += 0.3;
      } catch (e) {}
    }, 800);

    rainNode = { source1, source2, hp1, lp1, bp2, gain1, gain2, lfoInterval };
    console.log("useSound: Cozy rumble-free pink-noise rain active.");
  } catch (err) {
    console.error("useSound: Failed to start rain sound:", err);
  }
};

const stopRain = () => {
  if (rainNode) {
    console.log("useSound: Stopping rain synthesizer...");
    try {
      if (rainNode.lfoInterval) {
        clearInterval(rainNode.lfoInterval);
      }
      rainNode.source1.stop();
      rainNode.source1.disconnect();
      rainNode.source2.stop();
      rainNode.source2.disconnect();
      rainNode.hp1.disconnect();
      rainNode.lp1.disconnect();
      rainNode.bp2.disconnect();
      rainNode.gain1.disconnect();
      rainNode.gain2.disconnect();
    } catch (e) {}
    rainNode = null;
  }
};

// 2. 脳内チューニングパッド（Lofiアンビエント和音）
const playPadChord = (ctx, targetNode, chordIdx) => {
  try {
    // チルで美しいメジャー/マイナー9thコード進行
    const progressions = [
      [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9 (C3, G3, B3, D4, E4)
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9 (F3, A3, C4, E4, G4)
      [110.00, 164.81, 196.00, 261.63, 493.88], // Am9   (A2, E3, G3, C4, B4)
      [98.00, 146.83, 246.94, 329.63, 440.00]   // G6/9  (G2, D3, B3, E4, A4)
    ];
    
    const freqs = progressions[chordIdx % progressions.length];
    console.log(`useSound: Synthesizing pad chord #${chordIdx % progressions.length} (${freqs.join(', ')} Hz)`);
    
    const chordGain = ctx.createGain();
    chordGain.connect(targetNode);
    
    const now = ctx.currentTime;
    chordGain.gain.setValueAtTime(0, now);
    chordGain.gain.linearRampToValueAtTime(0.035, now + 2.5); // ゆっくりアタック
    chordGain.gain.setValueAtTime(0.035, now + 4.5);
    chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.5); // ゆっくり減衰
    
    const oscs = freqs.map(freq => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // コーラスのような温もりを与えるデチューン
      osc.detune.setValueAtTime(Math.random() * 10 - 5, now);
      osc.connect(chordGain);
      osc.start(now);
      osc.stop(now + 9);
      return osc;
    });
    
    const padObj = { oscs, gain: chordGain };
    padNodes.push(padObj);
    
    setTimeout(() => {
      padNodes = padNodes.filter(p => p !== padObj);
    }, 9500);
  } catch (err) {
    console.error("useSound: Error playing pad chord:", err);
  }
};

const startPad = (ctx, targetNode) => {
  if (padInterval) return;
  console.log("useSound: Starting pad BGM...");
  
  let chordIdx = 0;
  playPadChord(ctx, targetNode, chordIdx++);
  
  // 7.5秒ごとに新しいコードをゆっくり重ねる
  padInterval = setInterval(() => {
    playPadChord(ctx, targetNode, chordIdx++);
  }, 7500);
};

const stopPad = () => {
  if (padInterval) {
    console.log("useSound: Stopping pad BGM...");
    clearInterval(padInterval);
    padInterval = null;
  }
  padNodes.forEach(p => {
    try {
      p.oscs.forEach(osc => {
        osc.stop();
        osc.disconnect();
      });
      p.gain.disconnect();
    } catch (e) {}
  });
  padNodes = [];
};

// バックグラウンドエンジンの再生切り替え
const applyBgmType = (type) => {
  console.log(`useSound: applyBgmType("${type}")`);
  const ctx = ensureAudioContext();
  if (!ctx || !globalBgmVolumeNode) return;

  stopRain();
  stopPad();

  if (globalMuted) {
    console.log("useSound: Audio is muted, skipping BGM execution.");
    return;
  }

  if (type === 'rain') {
    startRain(ctx, globalBgmVolumeNode);
  } else if (type === 'cozy_pad') {
    startPad(ctx, globalBgmVolumeNode);
  }
};

export function useSound() {
  const [localState, setLocalState] = useState({
    muted: globalMuted,
    bgmType: globalBgmType,
    bgmVolume: globalBgmVolume,
    keyboardEnabled: globalKeyboardEnabled
  });

  // 他のコンポーネントでの状態変化に追従して同期する
  useEffect(() => {
    listeners.push(setLocalState);
    return () => {
      listeners = listeners.filter(l => l !== setLocalState);
    };
  }, []);

  // マウント時にブラウザの音声制限を解除するためのジェスチャー検知を自動バインド
  useEffect(() => {
    const handleFirstGesture = () => {
      console.log("useSound: User gesture detected on window. Unlocking AudioContext...");
      const ctx = ensureAudioContext();
      if (ctx && globalBgmType !== 'none' && !globalMuted) {
        applyBgmType(globalBgmType);
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
    };
  }, []);

  const playSound = useCallback((type) => {
    if (globalMuted) return;

    try {
      const ctx = ensureAudioContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      console.log(`useSound: playSound("${type}") triggered at ${now.toFixed(2)}`);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } 
      else if (type === 'keyboard') {
        if (!globalKeyboardEnabled) return;
        
        // メカニカルキーボードのタイピングクリック音の合成
        const clickOsc = ctx.createOscillator();
        const noise = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const clickGain = ctx.createGain();

        // 35msの短いノイズバーストを作成して、キースイッチの接触音にする
        const bufferSize = ctx.sampleRate * 0.035;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1300, now);

        clickOsc.type = 'triangle';
        const pitch = 260 + Math.random() * 120; // 毎回微妙にピッチを揺らしてリアルに
        clickOsc.frequency.setValueAtTime(pitch, now);
        clickOsc.frequency.exponentialRampToValueAtTime(70, now + 0.025);

        noise.connect(filter);
        filter.connect(clickGain);
        clickOsc.connect(clickGain);
        gain.connect(ctx.destination); // 修正: clickGainがctx.destinationに接続されるよう統一

        clickGain.gain.setValueAtTime(0.03, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        noise.start(now);
        clickOsc.start(now);
        noise.stop(now + 0.03);
        clickOsc.stop(now + 0.03);
      }
      else if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.12, now + 0.24);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.4);
      } 
      else if (type === 'incorrect') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(145, now + 0.1);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.3);
        
        osc.start(now);
        osc.stop(now + 0.3);
      } 
      else if (type === 'success') {
        osc.type = 'sine';
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        });
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.setValueAtTime(0.15, now + 0.32);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn('Web Audio API play error:', e);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !globalMuted;
    globalMuted = nextMuted;
    localStorage.setItem('logifit_muted', nextMuted ? 'true' : 'false');
    console.log(`useSound: Global mute toggled to: ${nextMuted}`);
    
    if (nextMuted) {
      stopRain();
      stopPad();
    } else {
      applyBgmType(globalBgmType);
    }
    notifyAll();
  }, []);

  // BGMタイプの切り替え
  const changeBgmType = useCallback((type) => {
    globalBgmType = type;
    localStorage.setItem('logifit_bgm_type', type);
    console.log(`useSound: Global BGM type changed to: ${type}`);
    
    if (!globalMuted) {
      applyBgmType(type);
    }
    notifyAll();
  }, []);

  // BGM音量の変更
  const changeBgmVolume = useCallback((volume) => {
    globalBgmVolume = volume;
    localStorage.setItem('logifit_bgm_volume', volume.toString());
    console.log(`useSound: Global BGM volume changed to: ${volume}`);

    ensureAudioContext();
    if (globalBgmVolumeNode && globalAudioCtx) {
      globalBgmVolumeNode.gain.setValueAtTime(volume, globalAudioCtx.currentTime);
    }
    notifyAll();
  }, []);

  // キーボードASMRの切り替え
  const changeKeyboardEnabled = useCallback((enabled) => {
    globalKeyboardEnabled = enabled;
    localStorage.setItem('logifit_keyboard_enabled', enabled ? 'true' : 'false');
    console.log(`useSound: Global Keyboard ASMR toggled to: ${enabled}`);
    notifyAll();
  }, []);

  return { 
    playSound, 
    muted: localState.muted, 
    toggleMute, 
    bgmType: localState.bgmType, 
    setBgmType: changeBgmType,
    keyboardEnabled: localState.keyboardEnabled, 
    setKeyboardEnabled: changeKeyboardEnabled,
    bgmVolume: localState.bgmVolume,
    setBgmVolume: changeBgmVolume
  };
}
