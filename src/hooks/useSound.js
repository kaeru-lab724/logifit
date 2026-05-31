import { useCallback, useState, useEffect } from 'react';

// モジュールスコープのシングルトン変数（グローバルな音声状態を同期）
let globalAudioCtx = null;
let rainNode = null;
let rainPatterTimeout = null;
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

// 単一の雨粒（パチパチ音）をステレオ空間に動的合成
const playRaindrop = (ctx, targetNode) => {
  if (!globalAudioCtx || globalMuted || globalBgmType !== 'rain') return;
  
  try {
    const now = ctx.currentTime;
    const dropGain = ctx.createGain();
    dropGain.connect(targetNode);
    
    // 雨粒の特性をランダムに揺らして自然な響きに
    const duration = 0.012 + Math.random() * 0.022; // 12ms〜34msの極小バースト
    const volume = 0.005 + Math.random() * 0.015;   // 非常に微細な音量
    const frequency = 1200 + Math.random() * 1600;  // 1.2kHz〜2.8kHzのピチピチ音
    
    dropGain.gain.setValueAtTime(0, now);
    dropGain.gain.linearRampToValueAtTime(volume, now + 0.001);
    dropGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    
    // 雨粒のノイズバーストバッファを作成
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // バンドパスフィルターで共鳴させて水滴感を強調
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(frequency, now);
    filter.Q.setValueAtTime(4.0, now); // 高いQ値で音色を際立たせる
    
    // ステレオロケーションのランダム分散
    if (ctx.createStereoPanner) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.random() * 1.6 - 0.8, now); // 左右-0.8〜0.8にパン
      
      noise.connect(filter);
      filter.connect(panner);
      panner.connect(dropGain);
    } else {
      noise.connect(filter);
      filter.connect(dropGain);
    }
    
    noise.start(now);
    noise.stop(now + duration);
  } catch (e) {
    // 単発の雨粒の合成失敗は無視
  }
};

// 1. 自然で心地よい雨音シンセサイザー (ブラウンノイズの雨の音響 + パチパチ雨粒)
const startRain = (ctx, targetNode) => {
  if (rainNode) return;
  console.log("useSound: Starting soft rain synthesizer...");
  
  try {
    // 【レイヤー1】傘や屋根に当たる静かな雨音のベース（ブラウンノイズを生成）
    const bufferSize = ctx.sampleRate * 4; // 4秒のループバッファ
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 一次ローパスフィルタを通すことでホワイトノイズを深く心地よいブラウンノイズに変換
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.8; // 減衰した音量を補正
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // 低域を強調し、高域の耳障りなサー音を取り除くローパス
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(320, ctx.currentTime);

    source.connect(lp);
    lp.connect(targetNode);
    source.start(0);

    // 【レイヤー2】窓や地面にランダムに当たる雨粒（ピチピチ音）の自動生成ループ
    const triggerNextDrop = () => {
      if (globalBgmType !== 'rain' || globalMuted) return;
      playRaindrop(ctx, targetNode);
      
      // 次の雨粒が降るまでの間隔をランダム化（15ms〜85ms）
      const nextDelay = 15 + Math.random() * 70;
      rainPatterTimeout = setTimeout(triggerNextDrop, nextDelay);
    };
    
    triggerNextDrop();

    rainNode = { source, lp };
    console.log("useSound: Soft rain synthesizer is fully active.");
  } catch (err) {
    console.error("useSound: Failed to start rain sound:", err);
  }
};

const stopRain = () => {
  if (rainPatterTimeout) {
    clearTimeout(rainPatterTimeout);
    rainPatterTimeout = null;
  }
  if (rainNode) {
    console.log("useSound: Stopping rain synthesizer...");
    try {
      rainNode.source.stop();
      rainNode.source.disconnect();
      rainNode.lp.disconnect();
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
        clickGain.connect(ctx.destination);

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
