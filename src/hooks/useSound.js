import { useCallback, useState, useEffect } from 'react';

// モジュールスコープのシングルトン変数（グローバルな音声状態を同期）
let globalAudioCtx = null;
let rainNode = null;
let padInterval = null;
let padNodes = [];
let globalBgmVolumeNode = null;
let globalBgmType = localStorage.getItem('logifit_bgm_type') || 'none';
let globalBgmVolume = parseFloat(localStorage.getItem('logifit_bgm_volume') ?? '0.3');
let globalKeyboardEnabled = localStorage.getItem('logifit_keyboard_enabled') !== 'false';

// AudioContextの初期化と自動レジューム
const ensureAudioContext = () => {
  if (!globalAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      globalAudioCtx = new AudioContextClass();
      globalBgmVolumeNode = globalAudioCtx.createGain();
      globalBgmVolumeNode.gain.value = globalBgmVolume;
      globalBgmVolumeNode.connect(globalAudioCtx.destination);
    }
  }
  if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
    globalAudioCtx.resume();
  }
  return globalAudioCtx;
};

// 1. 雨音シンセサイザー
const startRain = (ctx, targetNode) => {
  if (rainNode) return;
  
  // 2秒のホワイトノイズバッファを作成
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  // 雨音用のバンドパスフィルター（こもったサーという音）
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 550;
  filter.Q.value = 0.6;

  // 柔らかくするためのローパスフィルター
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 900;

  source.connect(filter);
  filter.connect(lp);
  lp.connect(targetNode);

  source.start(0);
  rainNode = { source, filter, lp };
};

const stopRain = () => {
  if (rainNode) {
    try {
      rainNode.source.stop();
      rainNode.source.disconnect();
      rainNode.filter.disconnect();
      rainNode.lp.disconnect();
    } catch (e) {}
    rainNode = null;
  }
};

// 2. 脳内チューニングパッド（Lofiアンビエント和音）
const playPadChord = (ctx, targetNode, chordIdx) => {
  // チルで美しいメジャー/マイナー9thコード進行
  const progressions = [
    [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9 (C3, G3, B3, D4, E4)
    [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9 (F3, A3, C4, E4, G4)
    [110.00, 164.81, 196.00, 261.63, 493.88], // Am9   (A2, E3, G3, C4, B4)
    [98.00, 146.83, 246.94, 329.63, 440.00]   // G6/9  (G2, D3, B3, E4, A4)
  ];
  
  const freqs = progressions[chordIdx % progressions.length];
  const chordGain = ctx.createGain();
  chordGain.connect(targetNode);
  
  const now = ctx.currentTime;
  chordGain.gain.setValueAtTime(0, now);
  chordGain.gain.linearRampToValueAtTime(0.035, now + 2.5); // ゆっくりアタック
  chordGain.gain.setValueAtTime(0.035, now + 4.5);
  chordGain.gain.exponentialRampToValueAtTime(0.0001, now + 8.5); // ゆっくりディザスタープ（減衰）
  
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
};

const startPad = (ctx, targetNode) => {
  if (padInterval) return;
  
  let chordIdx = 0;
  playPadChord(ctx, targetNode, chordIdx++);
  
  // 7.5秒ごとに新しいコードをゆっくり重ねる
  padInterval = setInterval(() => {
    playPadChord(ctx, targetNode, chordIdx++);
  }, 7500);
};

const stopPad = () => {
  if (padInterval) {
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
  const ctx = ensureAudioContext();
  if (!ctx || !globalBgmVolumeNode) return;

  stopRain();
  stopPad();

  if (type === 'rain') {
    startRain(ctx, globalBgmVolumeNode);
  } else if (type === 'cozy_pad') {
    startPad(ctx, globalBgmVolumeNode);
  }
};

export function useSound() {
  const [muted, setMuted] = useState(false);
  const [bgmType, setBgmTypeState] = useState(globalBgmType);
  const [bgmVolume, setBgmVolumeState] = useState(globalBgmVolume);
  const [keyboardEnabled, setKeyboardEnabledState] = useState(globalKeyboardEnabled);

  // マウント時に前回の設定を適用
  useEffect(() => {
    // ユーザーインタラクションの前に自動再生がブロックされるのを防ぐため、
    // 最初のクリックイベントなどで確実に起動するようにするが、初期設定だけ適用しておく
    if (globalBgmType !== 'none') {
      const handleFirstGesture = () => {
        applyBgmType(globalBgmType);
        window.removeEventListener('click', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
      };
      window.addEventListener('click', handleFirstGesture);
      window.addEventListener('keydown', handleFirstGesture);
      return () => {
        window.removeEventListener('click', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);
      };
    }
  }, []);

  const playSound = useCallback((type) => {
    if (muted) return;

    try {
      const ctx = ensureAudioContext();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } 
      else if (type === 'keyboard') {
        if (!keyboardEnabled) return;
        
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
        filter.frequency.value = 1300;

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
  }, [muted, keyboardEnabled]);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      if (next) {
        stopRain();
        stopPad();
      } else {
        applyBgmType(globalBgmType);
      }
      return next;
    });
  }, []);

  // BGMタイプの切り替え
  const changeBgmType = useCallback((type) => {
    globalBgmType = type;
    localStorage.setItem('logifit_bgm_type', type);
    setBgmTypeState(type);
    
    if (!muted) {
      applyBgmType(type);
    }
  }, [muted]);

  // BGM音量の変更
  const changeBgmVolume = useCallback((volume) => {
    globalBgmVolume = volume;
    localStorage.setItem('logifit_bgm_volume', volume.toString());
    setBgmVolumeState(volume);

    ensureAudioContext();
    if (globalBgmVolumeNode) {
      globalBgmVolumeNode.gain.value = volume;
    }
  }, []);

  // キーボードASMRの切り替え
  const changeKeyboardEnabled = useCallback((enabled) => {
    globalKeyboardEnabled = enabled;
    localStorage.setItem('logifit_keyboard_enabled', enabled ? 'true' : 'false');
    setKeyboardEnabledState(enabled);
  }, []);

  return { 
    playSound, 
    muted, 
    toggleMute, 
    bgmType, 
    setBgmType: changeBgmType,
    keyboardEnabled, 
    setKeyboardEnabled: changeKeyboardEnabled,
    bgmVolume,
    setBgmVolume: changeBgmVolume
  };
}
