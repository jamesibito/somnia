/**
 * Procedural soundscape engine — real-time Web Audio synthesis.
 *
 * No audio files. Every layer (rain, thunder, wind, tide, fire, drone) is
 * synthesized from noise + filters + modulation, so the prototype is fully
 * self-contained, deployable, and licence-free. The mixer faders drive real
 * GainNodes, so dragging a fader genuinely changes what you hear.
 */

export type LayerId = 'rain' | 'thunder' | 'wind' | 'tide' | 'fire' | 'drone'

interface Layer {
  id: LayerId
  gain: GainNode
  nodes: AudioNode[]
  stop?: () => void
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
const layers = new Map<LayerId, Layer>()
let started = false

function audioCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = 0.85
    master.connect(ctx.destination)
  }
  return ctx
}

/** Shared pink-ish noise buffer (filtered white noise, gentle on the ears). */
function makeNoiseBuffer(c: AudioContext, seconds = 4): AudioBuffer {
  const len = c.sampleRate * seconds
  const buf = c.createBuffer(1, len, c.sampleRate)
  const data = buf.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    // Simple pinking filter
    b0 = 0.99765 * b0 + white * 0.0990460
    b1 = 0.96300 * b1 + white * 0.2965164
    b2 = 0.57000 * b2 + white * 1.0526913
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.18
  }
  return buf
}

let noiseBuffer: AudioBuffer | null = null
function noiseSource(c: AudioContext): AudioBufferSourceNode {
  if (!noiseBuffer) noiseBuffer = makeNoiseBuffer(c)
  const src = c.createBufferSource()
  src.buffer = noiseBuffer
  src.loop = true
  return src
}

// ─── Layer builders ────────────────────────────────────────────────────────

function buildRain(c: AudioContext, out: GainNode): Layer['stop'] {
  const src = noiseSource(c)
  const hp = c.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 800
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 9000
  // Slow shimmer on the brightness
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 0.12
  lfoGain.gain.value = 1400
  lfo.connect(lfoGain).connect(lp.frequency)
  src.connect(hp).connect(lp).connect(out)
  src.start()
  lfo.start()
  return () => { src.stop(); lfo.stop() }
}

function buildThunder(c: AudioContext, out: GainNode): Layer['stop'] {
  let timer: number
  let cancelled = false
  const rumble = () => {
    if (cancelled) return
    const src = noiseSource(c)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 240
    const g = c.createGain()
    g.gain.value = 0
    const now = c.currentTime
    const dur = 2.4 + Math.random() * 2.5
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.9, now + 0.25 + Math.random() * 0.6)
    g.gain.exponentialRampToValueAtTime(0.001, now + dur)
    src.connect(lp).connect(g).connect(out)
    src.start(now)
    src.stop(now + dur + 0.2)
    timer = window.setTimeout(rumble, 7000 + Math.random() * 13000)
  }
  timer = window.setTimeout(rumble, 2500 + Math.random() * 4000)
  return () => { cancelled = true; clearTimeout(timer) }
}

function buildWind(c: AudioContext, out: GainNode): Layer['stop'] {
  const src = noiseSource(c)
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 500
  bp.Q.value = 1.2
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 0.08
  lfoGain.gain.value = 320
  lfo.connect(lfoGain).connect(bp.frequency)
  const amp = c.createGain()
  amp.gain.value = 0.6
  const lfo2 = c.createOscillator()
  const lfo2g = c.createGain()
  lfo2.frequency.value = 0.05
  lfo2g.gain.value = 0.35
  lfo2.connect(lfo2g).connect(amp.gain)
  src.connect(bp).connect(amp).connect(out)
  src.start(); lfo.start(); lfo2.start()
  return () => { src.stop(); lfo.stop(); lfo2.stop() }
}

function buildTide(c: AudioContext, out: GainNode): Layer['stop'] {
  const src = noiseSource(c)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 600
  const amp = c.createGain()
  amp.gain.value = 0.0001
  // Wave swell ~ every 9s
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.type = 'sine'
  lfo.frequency.value = 0.11
  lfoGain.gain.value = 0.5
  const bias = c.createConstantSource()
  bias.offset.value = 0.5
  lfo.connect(lfoGain).connect(amp.gain)
  bias.connect(amp.gain)
  src.connect(lp).connect(amp).connect(out)
  src.start(); lfo.start(); bias.start()
  return () => { src.stop(); lfo.stop(); bias.stop() }
}

function buildFire(c: AudioContext, out: GainNode): Layer['stop'] {
  const src = noiseSource(c)
  const lp = c.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 1100
  const base = c.createGain()
  base.gain.value = 0.5
  src.connect(lp).connect(base).connect(out)
  src.start()
  // Random crackle pops
  let timer: number
  let cancelled = false
  const crackle = () => {
    if (cancelled) return
    const s = noiseSource(c)
    const hp = c.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 1800
    const g = c.createGain()
    const now = c.currentTime
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.4, now + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05 + Math.random() * 0.08)
    s.connect(hp).connect(g).connect(out)
    s.start(now); s.stop(now + 0.2)
    timer = window.setTimeout(crackle, 120 + Math.random() * 600)
  }
  crackle()
  return () => { cancelled = true; clearTimeout(timer); src.stop() }
}

function buildDrone(c: AudioContext, out: GainNode): Layer['stop'] {
  // Soft detuned sine cluster — a low, calm pad
  const freqs = [55, 82.4, 110, 164.8]
  const oscs = freqs.map((f, i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.detune.value = (i - 1.5) * 4
    const g = c.createGain()
    g.gain.value = 0.12 / (i + 1)
    o.connect(g).connect(out)
    o.start()
    return o
  })
  const lfo = c.createOscillator()
  const lfoGain = c.createGain()
  lfo.frequency.value = 0.06
  lfoGain.gain.value = 0.05
  lfo.connect(lfoGain).connect(out.gain)
  lfo.start()
  return () => { oscs.forEach(o => o.stop()); lfo.stop() }
}

const BUILDERS: Record<LayerId, (c: AudioContext, out: GainNode) => Layer['stop']> = {
  rain: buildRain,
  thunder: buildThunder,
  wind: buildWind,
  tide: buildTide,
  fire: buildFire,
  drone: buildDrone,
}

// ─── Public API ────────────────────────────────────────────────────────────

export function isStarted() { return started }

/** Must be called from a user gesture (autoplay policy). */
export async function ensureRunning() {
  const c = audioCtx()
  if (c.state === 'suspended') await c.resume()
  started = true
}

export function setMaster(v: number) {
  if (master && ctx) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05)
}

/** Set a layer's volume 0..1. Lazily builds the layer on first non-zero. */
export function setLayer(id: LayerId, volume: number) {
  const c = audioCtx()
  let layer = layers.get(id)
  if (!layer) {
    if (volume <= 0) return
    const gain = c.createGain()
    gain.gain.value = 0
    gain.connect(master!)
    const stop = BUILDERS[id](c, gain)
    layer = { id, gain, nodes: [], stop }
    layers.set(id, layer)
  }
  layer.gain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume)) * 0.9, c.currentTime, 0.08)
}

/** Stop everything and tear down (used when leaving a session). */
export function stopAll() {
  layers.forEach(l => {
    try { l.stop?.() } catch { /* already stopped */ }
    l.gain.disconnect()
  })
  layers.clear()
  started = false
}

/** Fade master to 0 over `seconds` then stop — for sleep timer. */
export function fadeOutAndStop(seconds: number) {
  if (!ctx || !master) return
  master.gain.setTargetAtTime(0, ctx.currentTime, seconds / 4)
  window.setTimeout(stopAll, seconds * 1000 + 200)
}
