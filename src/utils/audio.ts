// Interface Sounds using Web Audio API
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // @ts-ignore
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

// Helper to check if sounds are enabled in settings
function isSoundsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('ecu_crm_interface_sounds') === 'true';
}

export function playClickSound() {
  if (!isSoundsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Resume context if suspended (browser security)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.02, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

export function playSuccessSound() {
  if (!isSoundsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.04, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    // Ascending notes: C5 (523.25 Hz) then E5 (659.25 Hz)
    playTone(523.25, now, 0.12);
    playTone(659.25, now + 0.08, 0.18);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}

export function playErrorSound() {
  if (!isSoundsEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle'; // rougher texture for errors
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.06, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.start(start);
      osc.stop(start + duration);
    };

    const now = ctx.currentTime;
    // Descending notes: G3 (196.00 Hz) then Eb3 (155.56 Hz)
    playTone(196.00, now, 0.15);
    playTone(155.56, now + 0.10, 0.25);
  } catch (e) {
    console.warn('Audio play failed:', e);
  }
}
