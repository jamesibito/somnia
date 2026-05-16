/**
 * Procedural soundscape engine — high-fidelity real-time Web Audio synthesis.
 *
 * No audio files. Every layer is synthesized from noise + filters + modulation
 * + granular transients, then placed in a stereo field and a procedurally
 * generated convolution-reverb space. The mixer faders drive real GainNodes.
 *
 * Signal path:
 *   layer → [shaping] → layerGain ─┬─ dry ──────────────► busInput
 *                                  └─ send → reverbBus ──► busInput
 *   busInput → warmth low-shelf → soft compressor → master → destination
 *
 * The convolution space is what moves this from "white-noise generator" to
 * "rain in a room": every layer shares one dark, ~3s impulse response.
 */

export type LayerId = 'rain' | 'thunder' | 'wind' | 'tide' | 'fire' | 'drone'

interface Layer {
  gain: GainNode
  send: GainNode
  stop: () => void
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let busInput: GainNode | null = null
let reverbBus: GainNode | null = null
let noiseBuffer: AudioBuffer | null = null
const layers = new Map<LayerId, Layer>()
let started = false

function audioCtx(): AudioContext {
  if (ctx) return ctx
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  ctx = new AC()

  // ── Master chain: warmth → gentle glue compressor → out ──
  master = ctx.createGain()
  master.gain.value = 0.82

  const warmth = ctx.createBiquadFilter()
  warmth.type = 'highshelf'
  warmth.frequency.value = 5200
  warmth.gain.value = -5.5 // roll the top gently — easier on the ears at night

  const lowBoost = ctx.createBiquadFilter()
  lowBoost.type = 'lowshelf'
  lowBoost.frequency.value = 180
  lowBoost.gain.value = 2.5

  const glue = ctx.createDynamicsCompressor()
  glue.threshold.value = -22
  glue.knee.value = 18
  glue.ratio.value = 2.6
  glue.attack.value = 0.02
  glue.release.value = 0.32

  busInput = ctx.createGain()

  // ── Convolution space ──
  const convolver = ctx.createConvolver()
  convolver.buffer = makeImpulseResponse(ctx, 3.0, 2.6)
  reverbBus = ctx.createGain()
  reverbBus.gain.value = 1
  const reverbReturn = ctx.createGain()
  reverbReturn.gain.value = 0.9

  reverbBus.connect(convolver)
  convolver.connect(reverbReturn)
  reverbReturn.connect(busInput)

  busInput.connect(lowBoost)
  lowBoost.connect(warmth)
  warmth.connect(glue)
  glue.connect(master)
  master.connect(ctx.destination)

  return ctx
}

/** Stereo pink-ish noise (decorrelated L/R for natural width). */
function getNoise(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer
  const len = c.sampleRate * 5
  const buf = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    let b0 = 0, b1 = 0, b2 = 0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99765 * b0 + w * 0.0990460
      b1 = 0.96300 * b1 + w * 0.2965164
      b2 = 0.57000 * b2 + w * 1.0526913
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.17
    }
  }
  noiseBuffer = buf
  return buf
}

function noiseSource(c: AudioContext): AudioBufferSourceNode {
  const s = c.createBufferSource()
  s.buffer = getNoise(c)
  s.loop = true
  s.playbackRate.value = 0.9 + Math.random() * 0.2
  return s
}

/** Procedural impulse response: stereo, exponential decay, darkened. */
function makeImpulseResponse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds)
  const ir = c.createBuffer(2, len, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch)
    let lp = 0
    for (let i = 0; i < len; i++) {
      const t = i / len
      const env = Math.pow(1 - t, decay)
      const w = (Math.random() * 2 - 1) * env
      // one-pole lowpass → darker, more "room" than "metal"
      lp += 0.16 * (w - lp)
      d[i] = lp * 2.4
    }
  }
  return ir
}

function panner(c: AudioContext, pan = 0): StereoPannerNode {
  const p = c.createStereoPanner()
  p.pan.value = pan
  return p
}

/** Slow auto-pan for gentle stereo movement. */
function autoPan(c: AudioContext, node: StereoPannerNode, rate: number, depth: number) {
  const lfo = c.createOscillator()
  const g = c.createGain()
  lfo.frequency.value = rate
  g.gain.value = depth
  lfo.connect(g).connect(node.pan)
  lfo.start()
  return () => lfo.stop()
}

// ─── Layer builders ────────────────────────────────────────────────────────
// Each returns a teardown and connects into (dry → out, wet → send).

function buildRain(c: AudioContext, out: GainNode, send: GainNode) {
  // Bed: bright filtered noise with a slow brightness shimmer.
  const src = noiseSource(c)
  const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8500
  const bedGain = c.createGain(); bedGain.gain.value = 0.62
  const bedPan = panner(c)
  const lfo = c.createOscillator(); const lfoG = c.createGain()
  lfo.frequency.value = 0.11; lfoG.gain.value = 1600
  lfo.connect(lfoG).connect(lp.frequency)
  src.connect(hp).connect(lp).connect(bedGain).connect(bedPan)
  bedPan.connect(out); bedPan.connect(send)
  src.start(); lfo.start()
  const stopPan = autoPan(c, bedPan, 0.05, 0.25)

  // Granular droplets: short bandpassed transients, random pitch + pan.
  let timer: number, cancelled = false
  const drop = () => {
    if (cancelled) return
    const s = noiseSource(c)
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1800 + Math.random() * 4200
    bp.Q.value = 4 + Math.random() * 6
    const g = c.createGain()
    const pn = panner(c, Math.random() * 1.6 - 0.8)
    const now = c.currentTime
    const amp = 0.05 + Math.random() * 0.12
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(amp, now + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03 + Math.random() * 0.06)
    s.connect(bp).connect(g).connect(pn)
    pn.connect(out); pn.connect(send)
    s.start(now); s.stop(now + 0.2)
    timer = window.setTimeout(drop, 28 + Math.random() * 90)
  }
  drop()

  return () => { cancelled = true; clearTimeout(timer); src.stop(); lfo.stop(); stopPan() }
}

function buildThunder(c: AudioContext, out: GainNode, send: GainNode) {
  let timer: number, cancelled = false
  const peal = () => {
    if (cancelled) return
    const close = Math.random() < 0.4
    const src = noiseSource(c)
    const lp = c.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = close ? 320 : 170
    const g = c.createGain()
    const pn = panner(c, Math.random() * 1.0 - 0.5)
    const now = c.currentTime
    const dur = close ? 3.2 + Math.random() * 2 : 4.5 + Math.random() * 3
    g.gain.setValueAtTime(0, now)
    if (close) {
      // a crack, then the rolling body
      g.gain.linearRampToValueAtTime(1.0, now + 0.08)
      g.gain.exponentialRampToValueAtTime(0.45, now + 0.4)
      g.gain.exponentialRampToValueAtTime(0.001, now + dur)
    } else {
      g.gain.linearRampToValueAtTime(0.8, now + 0.6 + Math.random() * 0.8)
      g.gain.exponentialRampToValueAtTime(0.001, now + dur)
    }
    src.connect(lp).connect(g).connect(pn)
    pn.connect(out)
    // thunder leans heavily on the room
    const wet = c.createGain(); wet.gain.value = close ? 1.4 : 1.0
    pn.connect(wet).connect(send)
    src.start(now); src.stop(now + dur + 0.3)
    timer = window.setTimeout(peal, 6000 + Math.random() * 16000)
  }
  timer = window.setTimeout(peal, 2500 + Math.random() * 4000)
  return () => { cancelled = true; clearTimeout(timer) }
}

function buildWind(c: AudioContext, out: GainNode, send: GainNode) {
  const src = noiseSource(c)
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 480; bp.Q.value = 1.1
  const amp = c.createGain(); amp.gain.value = 0.5
  const pn = panner(c)
  // two LFOs → organic gusting on cutoff + amplitude
  const f1 = c.createOscillator(); const f1g = c.createGain()
  f1.frequency.value = 0.07; f1g.gain.value = 340
  f1.connect(f1g).connect(bp.frequency)
  const f2 = c.createOscillator(); const f2g = c.createGain()
  f2.frequency.value = 0.13; f2g.gain.value = 0.32
  f2.connect(f2g).connect(amp.gain)
  src.connect(bp).connect(amp).connect(pn)
  pn.connect(out); pn.connect(send)
  src.start(); f1.start(); f2.start()
  const stopPan = autoPan(c, pn, 0.06, 0.5)
  return () => { src.stop(); f1.stop(); f2.stop(); stopPan() }
}

function buildTide(c: AudioContext, out: GainNode, send: GainNode) {
  const src = noiseSource(c)
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520
  const swell = c.createGain(); swell.gain.value = 0.0001
  const pn = panner(c)
  const lfo = c.createOscillator(); const lfoG = c.createGain(); const bias = c.createConstantSource()
  lfo.type = 'sine'; lfo.frequency.value = 0.085
  lfoG.gain.value = 0.42; bias.offset.value = 0.46
  lfo.connect(lfoG).connect(swell.gain); bias.connect(swell.gain)
  // crest hiss: brighten the filter at the top of each swell
  const crest = c.createGain(); crest.gain.value = 900
  lfo.connect(crest).connect(lp.frequency)
  const lpBias = c.createConstantSource(); lpBias.offset.value = 700
  lpBias.connect(lp.frequency)
  src.connect(lp).connect(swell).connect(pn)
  pn.connect(out); pn.connect(send)
  src.start(); lfo.start(); bias.start(); lpBias.start()
  const stopPan = autoPan(c, pn, 0.04, 0.35)
  return () => { src.stop(); lfo.stop(); bias.stop(); lpBias.stop(); stopPan() }
}

function buildFire(c: AudioContext, out: GainNode, send: GainNode) {
  const src = noiseSource(c)
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1000
  const body = c.createGain(); body.gain.value = 0.42
  const pn = panner(c, -0.1)
  src.connect(lp).connect(body).connect(pn)
  pn.connect(out); pn.connect(send)
  src.start()
  let timer: number, cancelled = false
  const crackle = () => {
    if (cancelled) return
    const s = noiseSource(c)
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1900
    const g = c.createGain()
    const cp = panner(c, Math.random() * 1.2 - 0.6)
    const now = c.currentTime
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(0.4 + Math.random() * 0.5, now + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.04 + Math.random() * 0.07)
    s.connect(hp).connect(g).connect(cp)
    cp.connect(out); cp.connect(send)
    s.start(now); s.stop(now + 0.2)
    timer = window.setTimeout(crackle, 90 + Math.random() * 520)
  }
  crackle()
  return () => { cancelled = true; clearTimeout(timer); src.stop() }
}

function buildDrone(c: AudioContext, out: GainNode, send: GainNode) {
  const freqs = [55, 82.4, 110, 164.8, 220]
  const stops: Array<() => void> = []
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600
  const bus = c.createGain(); bus.gain.value = 0.9
  lp.connect(bus)
  bus.connect(out); bus.connect(send)
  freqs.forEach((f, i) => {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f
    o.detune.value = (i - 2) * 5
    const g = c.createGain()
    g.gain.value = 0.13 / (i + 1)
    const pn = panner(c, (i - 2) * 0.22)
    o.connect(g).connect(pn).connect(lp)
    o.start()
    stops.push(() => o.stop())
  })
  // slow filter breathing for depth
  const lfo = c.createOscillator(); const lfoG = c.createGain()
  lfo.frequency.value = 0.05; lfoG.gain.value = 220
  lfo.connect(lfoG).connect(lp.frequency)
  lfo.start()
  stops.push(() => lfo.stop())
  return () => stops.forEach(s => s())
}

const BUILDERS: Record<LayerId, (c: AudioContext, out: GainNode, send: GainNode) => () => void> = {
  rain: buildRain,
  thunder: buildThunder,
  wind: buildWind,
  tide: buildTide,
  fire: buildFire,
  drone: buildDrone,
}

// Per-layer reverb send amounts — how much "space" each lives in.
const SEND: Record<LayerId, number> = {
  rain: 0.16, thunder: 0.5, wind: 0.22, tide: 0.34, fire: 0.12, drone: 0.4,
}

// ─── Public API (unchanged) ────────────────────────────────────────────────

export function isStarted() { return started }

export async function ensureRunning() {
  const c = audioCtx()
  if (c.state === 'suspended') await c.resume()
  started = true
}

export function setMaster(v: number) {
  if (master && ctx) master.gain.setTargetAtTime(v, ctx.currentTime, 0.05)
}

export function setLayer(id: LayerId, volume: number) {
  const c = audioCtx()
  let layer = layers.get(id)
  if (!layer) {
    if (volume <= 0) return
    const gain = c.createGain(); gain.gain.value = 0
    const send = c.createGain(); send.gain.value = SEND[id]
    gain.connect(busInput!)
    send.connect(reverbBus!)
    const stop = BUILDERS[id](c, gain, send)
    layer = { gain, send, stop }
    layers.set(id, layer)
  }
  const v = Math.max(0, Math.min(1, volume))
  layer.gain.gain.setTargetAtTime(v * 0.9, c.currentTime, 0.08)
}

export function stopAll() {
  layers.forEach(l => {
    try { l.stop() } catch { /* already stopped */ }
    l.gain.disconnect()
    l.send.disconnect()
  })
  layers.clear()
  started = false
}

export function fadeOutAndStop(seconds: number) {
  if (!ctx || !master) return
  master.gain.setTargetAtTime(0, ctx.currentTime, seconds / 4)
  window.setTimeout(stopAll, seconds * 1000 + 200)
}
