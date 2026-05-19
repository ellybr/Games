/**
 * AudioSystem — synthesised sounds via Web Audio API.
 * No audio files needed; everything is generated in the browser.
 */

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, type, duration, gain = 0.3, delay = 0) {
  const c   = getCtx();
  const osc = c.createOscillator();
  const env = c.createGain();
  osc.type      = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + delay);
  env.gain.setValueAtTime(0, c.currentTime + delay);
  env.gain.linearRampToValueAtTime(gain, c.currentTime + delay + 0.01);
  env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.connect(env);
  env.connect(c.destination);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration + 0.05);
}

function noise(duration, gain = 0.15, delay = 0) {
  const c      = getCtx();
  const buf    = c.createBuffer(1, c.sampleRate * duration, c.sampleRate);
  const data   = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src    = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const env    = c.createGain();
  src.buffer       = buf;
  filter.type      = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value   = 0.5;
  env.gain.setValueAtTime(gain, c.currentTime + delay);
  env.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  src.connect(filter);
  filter.connect(env);
  env.connect(c.destination);
  src.start(c.currentTime + delay);
  src.stop(c.currentTime + delay + duration + 0.05);
}

const AudioSystem = {
  // Cash register "ching"
  register() {
    tone(1200, 'sine',   0.08, 0.25, 0);
    tone(1600, 'sine',   0.12, 0.20, 0.05);
    tone(2000, 'sine',   0.10, 0.15, 0.10);
  },

  // Door bell jingle (2 notes)
  doorbell() {
    tone(880,  'sine', 0.18, 0.18, 0);
    tone(1100, 'sine', 0.20, 0.15, 0.18);
  },

  // Positive chime (trust gain, task complete)
  chime() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 'sine', 0.25, 0.18, i * 0.08));
  },

  // Negative buzz (customer leaves angry, skip La San)
  buzz() {
    tone(180, 'sawtooth', 0.15, 0.2, 0);
    tone(160, 'sawtooth', 0.15, 0.15, 0.08);
  },

  // Coin drop (money earned)
  coin() {
    tone(1500, 'sine', 0.06, 0.25, 0);
    tone(1200, 'sine', 0.10, 0.20, 0.06);
    noise(0.05, 0.08, 0);
  },

  // Upgrade purchased
  upgrade() {
    [392, 494, 587, 784].forEach((f, i) => tone(f, 'triangle', 0.3, 0.22, i * 0.1));
  },

  // Soft ambient strum (bodega atmosphere) — plays once on scene open
  ambientStrum() {
    const chords = [261, 329, 392, 523];
    chords.forEach((f, i) => tone(f, 'sine', 1.2, 0.06, i * 0.04));
    setTimeout(() => {
      const chords2 = [293, 369, 440, 587];
      chords2.forEach((f, i) => tone(f, 'sine', 1.2, 0.05, i * 0.04));
    }, 2000);
  },

  // La San payment celebration
  laSanPay() {
    [523, 659, 784, 880, 1047].forEach((f, i) => tone(f, 'sine', 0.35, 0.18, i * 0.07));
  },
};

export default AudioSystem;
