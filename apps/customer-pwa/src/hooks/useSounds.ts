/**
 * useSounds — Web Audio API sound effects for ScanGo
 * Zero dependencies, zero external files. All sounds are synthesized in real-time.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Play a crisp supermarket scanner beep */
function playScanBeep() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Primary tone (classic scanner beep at 1800Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(1800, now);
    osc1.frequency.exponentialRampToValueAtTime(2200, now + 0.06);
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Confirmation chirp (higher harmonic)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2600, now + 0.08);
    gain2.gain.setValueAtTime(0.12, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.2);

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(50);
  } catch (e) {
    // Silently fail if audio isn't available
  }
}

/** Play a satisfying payment success "ka-ching" */
function playPaymentSuccess() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    // Rising musical chord (C5 → E5 → G5)
    const notes = [
      { freq: 523.25, start: 0, dur: 0.2 },      // C5
      { freq: 659.25, start: 0.1, dur: 0.2 },     // E5
      { freq: 783.99, start: 0.18, dur: 0.35 },    // G5
      { freq: 1046.5, start: 0.25, dur: 0.45 },    // C6 (resolve)
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, now + start);
      gain.gain.setValueAtTime(0.15, now + start + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.01);
    });

    // "Sparkle" — High-pitched shimmer
    const shimmer = ctx.createOscillator();
    const shimGain = ctx.createGain();
    shimmer.type = 'triangle';
    shimmer.frequency.setValueAtTime(4000, now + 0.3);
    shimmer.frequency.exponentialRampToValueAtTime(6000, now + 0.5);
    shimGain.gain.setValueAtTime(0.06, now + 0.3);
    shimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    shimmer.connect(shimGain).connect(ctx.destination);
    shimmer.start(now + 0.3);
    shimmer.stop(now + 0.6);

    // Haptic: two short taps
    if (navigator.vibrate) navigator.vibrate([60, 80, 60]);
  } catch (e) {
    // Silently fail
  }
}

/** Play a subtle tap sound for button interactions */
function playTap() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  } catch (e) {}
}

/** Play an error buzz */
function playError() {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(150, now + 0.25);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  } catch (e) {}
}

export const SFX = {
  scan: playScanBeep,
  payment: playPaymentSuccess,
  tap: playTap,
  error: playError,
};
