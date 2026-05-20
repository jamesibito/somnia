import { FIELD_CONCEPTS, useFieldConcept } from '../context/FieldConceptProvider'

/**
 * FieldConceptSwitcher — Pass C.1 ideation harness, DEV ONLY.
 *
 * Render is gated by `import.meta.env.DEV` so Vite tree-shakes the whole
 * control out of `npm run build` — it never appears in the deployed prototype
 * or the real UX. Lets us cycle particle concepts + nudge density live to
 * compare treatments before deciding integration.
 */
export default function FieldConceptSwitcher() {
  if (!import.meta.env.DEV) return null
  // Hide when embedded in the theme-compare iframe.
  if (new URLSearchParams(window.location.search).get('embed') === '1') return null
  return <Panel />
}

function Panel() {
  const { override, densityOverride, setOverride, setDensityOverride } = useFieldConcept()

  const wrap: React.CSSProperties = {
    position: 'fixed', left: 16, bottom: 16, zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: 8,
    padding: '10px 12px', borderRadius: 12,
    background: 'rgba(14,8,36,0.82)',
    border: '1px solid rgba(181,168,232,0.28)',
    backdropFilter: 'blur(10px)',
    color: '#EAE2FF',
    font: '11px/1.4 ui-monospace, "JetBrains Mono", monospace',
    pointerEvents: 'auto', userSelect: 'none',
    boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
  }
  const label: React.CSSProperties = {
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: '#9B92C4', fontSize: 9,
  }
  const row: React.CSSProperties = { display: 'flex', gap: 6, flexWrap: 'wrap' }
  const chip = (active: boolean): React.CSSProperties => ({
    padding: '4px 9px', borderRadius: 999, cursor: 'pointer',
    border: `1px solid ${active ? 'rgba(201,187,245,0.7)' : 'rgba(181,168,232,0.22)'}`,
    background: active ? 'rgba(181,168,232,0.22)' : 'transparent',
    color: active ? '#C9BBF5' : '#9B92C4',
  })
  const btn: React.CSSProperties = {
    padding: '3px 8px', borderRadius: 8, cursor: 'pointer',
    border: '1px solid rgba(181,168,232,0.22)',
    background: 'transparent', color: '#EAE2FF', font: 'inherit',
  }

  return (
    <div style={wrap} aria-label="Particle concept ideation (dev)">
      <span style={label}>field concept · dev override</span>
      <div style={row}>
        <button style={chip(override === null)} onClick={() => setOverride(null)}>
          auto
        </button>
        {FIELD_CONCEPTS.map(c => (
          <button key={c} style={chip(c === override)} onClick={() => setOverride(c)}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ ...row, alignItems: 'center' }}>
        <span style={label}>density</span>
        <button style={btn} onClick={() => setDensityOverride(Math.max(8, (densityOverride ?? 96) - 24))}>−</button>
        <span style={{ minWidth: 34, textAlign: 'center', color: '#C9BBF5' }}>
          {densityOverride ?? 'auto'}
        </span>
        <button style={btn} onClick={() => setDensityOverride((densityOverride ?? 96) + 24)}>+</button>
        <button style={btn} onClick={() => setDensityOverride(null)}>reset</button>
      </div>
    </div>
  )
}
