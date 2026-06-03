/**
 * Fader — a soft, tinted level slider. Track / fill / thumb are drawn as divs
 * (so the fill + thumb can glow and stay identical across browsers), with a
 * transparent native <input type="range"> laid on top for real dragging +
 * keyboard a11y. Ported from the experience site's Slider, inline-styled to
 * match this repo. Shows a live % readout.
 */
interface Props {
  label: string
  value: number            // 0..1 (or min..max)
  onChange: (v: number) => void
  tint?: string
  min?: number
  max?: number
  step?: number
}

export default function Fader({
  label,
  value,
  onChange,
  tint = 'var(--color-accent-bright)',
  min = 0,
  max = 1,
  step = 0.01,
}: Props) {
  const pct = Math.round(((value - min) / (max - min)) * 100)

  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        width: 84, flexShrink: 0, whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'rgba(234,226,255,0.65)',
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {label}
      </span>

      <span style={{ position: 'relative', height: 20, flex: 1 }}>
        {/* track */}
        <span style={{
          pointerEvents: 'none', position: 'absolute', left: 0, right: 0, top: '50%',
          height: 3, transform: 'translateY(-50%)', borderRadius: 999,
          background: 'rgba(234,226,255,0.14)',
        }} />
        {/* fill */}
        <span style={{
          pointerEvents: 'none', position: 'absolute', left: 0, top: '50%',
          height: 3, transform: 'translateY(-50%)', borderRadius: 999,
          width: `${pct}%`, background: tint, boxShadow: `0 0 10px ${tint}66`,
        }} />
        {/* thumb */}
        <span style={{
          pointerEvents: 'none', position: 'absolute', top: '50%',
          width: 12, height: 12, transform: 'translate(-50%,-50%)', borderRadius: '50%',
          left: `${pct}%`, background: tint,
          boxShadow: `0 0 12px ${tint}, 0 1px 3px rgba(0,0,0,0.5)`,
        }} />
        {/* the real control — transparent, on top */}
        <input
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          aria-label={label}
          aria-valuetext={`${label} ${pct}%`}
          style={{ position: 'absolute', inset: 0, margin: 0, width: '100%', height: '100%', cursor: 'pointer', opacity: 0 }}
        />
      </span>

      <span style={{
        width: 26, flexShrink: 0, textAlign: 'right',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontVariantNumeric: 'tabular-nums',
        color: 'rgba(234,226,255,0.5)',
      }}>
        {pct}
      </span>
    </label>
  )
}
