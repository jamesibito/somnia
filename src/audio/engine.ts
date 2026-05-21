/**
 * Hybrid soundscape engine — graceful sample-or-synth.
 *
 * Every textural layer prefers a recorded loop for realism, but falls back to
 * the original procedural synthesis if the clip is missing/unsupported. So:
 *   • with no audio files present → fully procedural (no regression, ever)
 *   • drop loops into /public/audio → those layers auto-upgrade to recordings
 * Tonal beds (`drone`) are always procedural. Sampled or synthesized, every
 * layer flows through the same dark convolution space and the analyser tap,
 * so the reactive atmosphere/breath visuals are unaffected by the source.
 *
 * Signal path:
 *   layer → [shaping] → layerGain ─┬─ dry ──────────────► busInput
 *                                  └─ send → reverbBus ──► busInput
 *   busInput → lowBoost → warmth → soft compressor → master → destination
 *
 * Samples are lazy: a layer's clip is only fetched the first time that layer
 * is turned up, and decoded buffers are cached for the session.
 */

export type LayerId =
  | 'rain' | 'thunder' | 'wind' | 'tide' | 'fire' | 'drone'
  | 'crickets' | 'harp' | 'bubbles' | 'water' | 'fairy' | 'seagulls'

type Builder = (c: AudioContext, out: GainNode, send: GainNode) => () => void

interface Layer {
  gain: GainNode
  send: GainNode
  stop: () => void
}

let ctx: AudioContext | null = null
let master: GainNode | null = null
let busInput: GainNode | null = null
let reverbBus: GainNode | null = null
let analyser: AnalyserNode | null = null
let ampData: Uint8Array | null = null
let noiseBuffer: AudioBuffer | null = null
// Bipolar Tone control: one low-pass + one high-pass in series, each
// effectively bypassed at neutral. setTone(-1..+1) scales them.
let toneLP: BiquadFilterNode | null = null
let toneHP: BiquadFilterNode | null = null
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

  // ── Tone control (user-adjustable) ──
  // High-pass and low-pass in series, both essentially flat at neutral.
  // setTone(-1..+1) scales them: negative = lowpass cuts highs (warmer),
  // positive = highpass cuts lows (lighter). Inserted between busInput and
  // the master shaping chain so both dry + reverb-return are filtered.
  toneHP = ctx.createBiquadFilter()
  toneHP.type = 'highpass'
  toneHP.frequency.value = 20      // essentially bypass
  toneHP.Q.value = 0.7
  toneLP = ctx.createBiquadFilter()
  toneLP.type = 'lowpass'
  toneLP.frequency.value = 20000   // essentially bypass
  toneLP.Q.value = 0.7

  // ── Analyser tap (sink only — never routed onward, cannot alter audio) ──
  analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  analyser.smoothingTimeConstant = 0.85
  ampData = new Uint8Array(analyser.frequencyBinCount)
  busInput.connect(analyser)

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

  // Signal: busInput → toneHP → toneLP → lowBoost → warmth → glue → master → out
  busInput.connect(toneHP)
  toneHP.connect(toneLP)
  toneLP.connect(lowBoost)
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

// ─── Procedural layer builders (fallbacks + beds) ──────────────────────────
// Each returns a teardown and connects into (dry → out, wet → send).

function buildRain(c: AudioContext, out: GainNode, send: GainNode) {
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
      g.gain.linearRampToValueAtTime(1.0, now + 0.08)
      g.gain.exponentialRampToValueAtTime(0.45, now + 0.4)
      g.gain.exponentialRampToValueAtTime(0.001, now + dur)
    } else {
      g.gain.linearRampToValueAtTime(0.8, now + 0.6 + Math.random() * 0.8)
      g.gain.exponentialRampToValueAtTime(0.001, now + dur)
    }
    src.connect(lp).connect(g).connect(pn)
    pn.connect(out)
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
  const lfo = c.createOscillator(); const lfoG = c.createGain()
  lfo.frequency.value = 0.05; lfoG.gain.value = 220
  lfo.connect(lfoG).connect(lp.frequency)
  lfo.start()
  stops.push(() => lfo.stop())
  return () => stops.forEach(s => s())
}

/** Night crickets — pulsed bandpassed noise + a slow chorus swell. */
function buildCrickets(c: AudioContext, out: GainNode, send: GainNode) {
  const src = noiseSource(c)
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 4600; bp.Q.value = 14
  const trem = c.createGain(); trem.gain.value = 0.0001
  const pn = panner(c, 0.1)
  // chirp pulse ~ 16 Hz, gated by a slow on/off swell
  const pulse = c.createOscillator(); pulse.type = 'square'; pulse.frequency.value = 16
  const pulseG = c.createGain(); pulseG.gain.value = 0.22
  const swell = c.createOscillator(); swell.type = 'sine'; swell.frequency.value = 0.06
  const swellG = c.createGain(); swellG.gain.value = 0.18
  const bias = c.createConstantSource(); bias.offset.value = 0.2
  pulse.connect(pulseG).connect(trem.gain)
  swell.connect(swellG).connect(trem.gain)
  bias.connect(trem.gain)
  src.connect(bp).connect(trem).connect(pn)
  pn.connect(out); pn.connect(send)
  src.start(); pulse.start(); swell.start(); bias.start()
  const stopPan = autoPan(c, pn, 0.05, 0.3)
  return () => { src.stop(); pulse.stop(); swell.stop(); bias.stop(); stopPan() }
}

/** Sparse harp — occasional plucked pentatonic notes, heavy on the room. */
function buildHarp(c: AudioContext, out: GainNode, send: GainNode) {
  const scale = [220, 247.5, 293.7, 330, 392, 440, 587.3] // A pentatonic-ish
  let timer: number, cancelled = false
  const pluck = () => {
    if (cancelled) return
    const f = scale[Math.floor(Math.random() * scale.length)]
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = f
    const o2 = c.createOscillator(); o2.type = 'sine'; o2.frequency.value = f * 2
    const o2g = c.createGain(); o2g.gain.value = 0.18
    const g = c.createGain()
    const pn = panner(c, Math.random() * 1.0 - 0.5)
    const now = c.currentTime
    const peak = 0.16 + Math.random() * 0.12
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(peak, now + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4 + Math.random() * 1.6)
    o.connect(g); o2.connect(o2g).connect(g)
    g.connect(pn)
    pn.connect(out)
    const wet = c.createGain(); wet.gain.value = 1.5
    pn.connect(wet).connect(send) // harp lives mostly in the reverb
    o.start(now); o2.start(now); o.stop(now + 4.2); o2.stop(now + 4.2)
    timer = window.setTimeout(pluck, 1800 + Math.random() * 4200)
  }
  timer = window.setTimeout(pluck, 600 + Math.random() * 1800)
  return () => { cancelled = true; clearTimeout(timer) }
}

/** Rising bubbles — short upward pitch blips at random intervals. */
function buildBubbles(c: AudioContext, out: GainNode, send: GainNode) {
  let timer: number, cancelled = false
  const blip = () => {
    if (cancelled) return
    const o = c.createOscillator(); o.type = 'sine'
    const g = c.createGain()
    const pn = panner(c, Math.random() * 1.4 - 0.7)
    const now = c.currentTime
    const f0 = 320 + Math.random() * 360
    o.frequency.setValueAtTime(f0, now)
    o.frequency.exponentialRampToValueAtTime(f0 * 2.4, now + 0.08 + Math.random() * 0.06)
    const peak = 0.06 + Math.random() * 0.1
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(peak, now + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12 + Math.random() * 0.1)
    o.connect(g).connect(pn)
    pn.connect(out); pn.connect(send)
    o.start(now); o.stop(now + 0.35)
    timer = window.setTimeout(blip, 120 + Math.random() * 520)
  }
  blip()
  return () => { cancelled = true; clearTimeout(timer) }
}

/** Submerged water bed — heavily lowpassed noise with a slow swell. */
function buildWater(c: AudioContext, out: GainNode, send: GainNode) {
  const src = noiseSource(c)
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420; lp.Q.value = 0.7
  const body = c.createGain(); body.gain.value = 0.55
  const pn = panner(c)
  const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.07
  const lfoG = c.createGain(); lfoG.gain.value = 160
  lfo.connect(lfoG).connect(lp.frequency)
  const amp = c.createOscillator(); amp.frequency.value = 0.05
  const ampG = c.createGain(); ampG.gain.value = 0.16
  amp.connect(ampG).connect(body.gain)
  src.connect(lp).connect(body).connect(pn)
  pn.connect(out); pn.connect(send)
  src.start(); lfo.start(); amp.start()
  const stopPan = autoPan(c, pn, 0.03, 0.3)
  return () => { src.stop(); lfo.stop(); amp.stop(); stopPan() }
}

/**
 * Distant seagulls — sparse high-pitched cries with downward glides.
 * Procedural fallback; the recorded seagulls.ogg takes precedence when present.
 */
function buildSeagulls(c: AudioContext, out: GainNode, send: GainNode) {
  let timer: number, cancelled = false
  const cry = () => {
    if (cancelled) return
    const o = c.createOscillator(); o.type = 'triangle'
    const g = c.createGain()
    const pn = panner(c, Math.random() * 1.8 - 0.9)
    const now = c.currentTime
    const f0 = 1200 + Math.random() * 700
    o.frequency.setValueAtTime(f0, now)
    o.frequency.exponentialRampToValueAtTime(f0 * 0.55, now + 0.6 + Math.random() * 0.4)
    const peak = 0.018 + Math.random() * 0.022
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(peak, now + 0.08)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9 + Math.random() * 0.5)
    o.connect(g).connect(pn)
    pn.connect(out)
    const wet = c.createGain(); wet.gain.value = 1.8
    pn.connect(wet).connect(send) // lots of space — they're far away
    o.start(now); o.stop(now + 1.8)
    timer = window.setTimeout(cry, 4000 + Math.random() * 9000)
  }
  timer = window.setTimeout(cry, 1500 + Math.random() * 4000)
  return () => { cancelled = true; clearTimeout(timer) }
}

/**
 * Fairy shimmer — soft high-frequency glitter pad with gentle ring-mod shimmer.
 * Procedural fallback; the recorded fairy.ogg takes precedence when present.
 */
function buildFairy(c: AudioContext, out: GainNode, send: GainNode) {
  const freqs = [660, 880, 990, 1320, 1760] // high overtone shimmer
  let timer: number, cancelled = false
  const glitter = () => {
    if (cancelled) return
    const f = freqs[Math.floor(Math.random() * freqs.length)]
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f
    const g = c.createGain()
    const pn = panner(c, Math.random() * 1.6 - 0.8)
    const now = c.currentTime
    const peak = 0.04 + Math.random() * 0.06
    g.gain.setValueAtTime(0.0001, now)
    g.gain.linearRampToValueAtTime(peak, now + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + Math.random() * 1.2)
    o.connect(g).connect(pn)
    pn.connect(out)
    const wet = c.createGain(); wet.gain.value = 2.2
    pn.connect(wet).connect(send) // very wet — lives in the reverb tail
    o.start(now); o.stop(now + 2.4)
    timer = window.setTimeout(glitter, 200 + Math.random() * 1400)
  }
  glitter()
  return () => { cancelled = true; clearTimeout(timer) }
}

// ─── Sampled layers (recorded loops, lazy, with synth fallback) ─────────────

const bufferCache = new Map<string, AudioBuffer>()
const inflight = new Map<string, Promise<AudioBuffer | null>>()

function decodeFromUrl(c: AudioContext, url: string): Promise<AudioBuffer | null> {
  const cached = bufferCache.get(url)
  if (cached) return Promise.resolve(cached)
  let p = inflight.get(url)
  if (!p) {
    p = fetch(url)
      .then(r => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status)))))
      .then(ab => c.decodeAudioData(ab))
      .then(buf => { bufferCache.set(url, buf); return buf })
      .catch(() => null)
    inflight.set(url, p)
  }
  return p
}

async function loadFirst(c: AudioContext, urls: string[]): Promise<AudioBuffer | null> {
  for (const url of urls) {
    const buf = await decodeFromUrl(c, url)
    if (buf) return buf
  }
  return null
}

interface SampleOpts {
  gain?: number
  /** submerged / muffled character — biquad lowpass cutoff in Hz */
  lowpass?: number
  rate?: number
  pan?: number
}

/**
 * A layer that prefers a recorded loop and falls back to a procedural
 * builder if the clip is absent/undecodable. Plugs into the same (out, send)
 * graph either way, so reverb + the analyser tap are unaffected.
 */
function sampleLayer(name: string, opts: SampleOpts, fallback: Builder): Builder {
  return (c, out, send) => {
    let cancelled = false
    let srcNode: AudioBufferSourceNode | null = null
    let fbStop: (() => void) | null = null
    const base = import.meta.env.BASE_URL || '/'
    const urls = [`${base}audio/${name}.ogg`, `${base}audio/${name}.m4a`]

    loadFirst(c, urls).then(buf => {
      if (cancelled) return
      if (!buf) { fbStop = fallback(c, out, send); return } // graceful synth
      const s = c.createBufferSource()
      s.buffer = buf
      s.loop = true
      s.playbackRate.value = opts.rate ?? 1
      let node: AudioNode = s
      if (opts.lowpass) {
        const lp = c.createBiquadFilter()
        lp.type = 'lowpass'
        lp.frequency.value = opts.lowpass
        node.connect(lp)
        node = lp
      }
      const g = c.createGain(); g.gain.value = opts.gain ?? 1
      const pn = panner(c, opts.pan ?? 0)
      node.connect(g).connect(pn)
      pn.connect(out); pn.connect(send)
      s.start()
      srcNode = s
    })

    return () => {
      cancelled = true
      try { srcNode?.stop() } catch { /* not started */ }
      fbStop?.()
    }
  }
}

const BUILDERS: Record<LayerId, Builder> = {
  rain:     sampleLayer('rain',     { gain: 0.95 }, buildRain),
  thunder:  sampleLayer('thunder',  { gain: 0.85 }, buildThunder),
  wind:     sampleLayer('wind',     { gain: 0.85 }, buildWind),
  tide:     sampleLayer('tide',     { gain: 0.95 }, buildTide),
  fire:     sampleLayer('fire',     { gain: 0.95 }, buildFire),
  crickets: sampleLayer('crickets', { gain: 0.85 }, buildCrickets),
  harp:     sampleLayer('harp',     { gain: 0.7 },  buildHarp),
  bubbles:  sampleLayer('bubbles',  { gain: 0.75, lowpass: 1400 }, buildBubbles),
  water:    sampleLayer('water',    { gain: 0.9,  lowpass: 820 },  buildWater),
  fairy:    sampleLayer('fairy',    { gain: 0.72 },                buildFairy),
  seagulls: sampleLayer('seagulls', { gain: 0.55 },                buildSeagulls),
  drone:    sampleLayer('drone',    { gain: 0.55 },                buildDrone),
}

// Per-layer reverb send amounts — how much "space" each lives in.
const SEND: Record<LayerId, number> = {
  rain: 0.16, thunder: 0.5, wind: 0.22, tide: 0.34, fire: 0.12, drone: 0.4,
  crickets: 0.2, harp: 0.52, bubbles: 0.3, water: 0.3, fairy: 0.6, seagulls: 0.55,
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

/**
 * Bipolar tone control. value ∈ [-1, +1].
 *   value < 0 → low-pass cuts highs progressively (warmer, less shrill)
 *               at -1: cutoff ~700Hz (heavily warmed)
 *   value > 0 → high-pass cuts lows progressively (lighter, less rumble)
 *               at +1: cutoff ~350Hz (cleared of bass)
 *   value = 0 → both filters effectively bypass (~flat)
 */
export function setTone(value: number) {
  if (!toneHP || !toneLP || !ctx) return
  const v = Math.max(-1, Math.min(1, value))
  const t = ctx.currentTime
  // Exponential curves feel more linear to the ear than literal frequency Hz.
  if (v <= 0) {
    // Active low-pass; high-pass parked at floor
    toneHP.frequency.setTargetAtTime(20, t, 0.05)
    const cutoff = 20000 * Math.pow(700 / 20000, -v)
    toneLP.frequency.setTargetAtTime(cutoff, t, 0.05)
  } else {
    // Active high-pass; low-pass parked at ceiling
    toneLP.frequency.setTargetAtTime(20000, t, 0.05)
    const cutoff = 20 * Math.pow(350 / 20, v)
    toneHP.frequency.setTargetAtTime(cutoff, t, 0.05)
  }
}

/** Current normalized loudness 0..1 for visuals. Cheap; safe to poll per frame. */
export function getAmplitude(): number {
  if (!analyser || !ampData || !started) return 0
  // The TS DOM lib types this as Uint8Array<ArrayBuffer>; our buffer matches.
  analyser.getByteFrequencyData(ampData as Uint8Array<ArrayBuffer>)
  let sum = 0
  for (let i = 0; i < ampData.length; i++) sum += ampData[i]
  return sum / ampData.length / 255
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
  // NB: the analyser is a persistent tap on the persistent busInput (like
  // master/busInput, audioCtx() is created once and never torn down). We
  // deliberately do NOT disconnect it here — doing so would permanently kill
  // amplitude on the next play since audioCtx() early-returns and never
  // recreates it. getAmplitude() already gates on `started`, so it reads 0
  // while stopped without any disconnect.
}

export function fadeOutAndStop(seconds: number) {
  if (!ctx || !master) return
  master.gain.setTargetAtTime(0, ctx.currentTime, seconds / 4)
  window.setTimeout(stopAll, seconds * 1000 + 200)
}
