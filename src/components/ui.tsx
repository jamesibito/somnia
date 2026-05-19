import type { ReactNode, CSSProperties } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AtmosphereLayer from './AtmosphereLayer'
import GenerativeField from './GenerativeField'

/** Scrollable screen with atmosphere + entrance animation. */
export function Screen({
  children,
  variant = 'default',
  grain = 0.06,
  pad = true,
  tabSafe = false,
  field = false,
  reactive = false,
}: {
  children: ReactNode
  variant?: 'default' | 'deep' | 'dawn' | 'calm'
  grain?: number
  pad?: boolean
  tabSafe?: boolean
  /** opt-in hand-rolled particle field (hero screens only) */
  field?: boolean
  /** opt-in audio-reactive atmosphere */
  reactive?: boolean
}) {
  return (
    <div className="screen">
      <AtmosphereLayer variant={variant} grain={grain} reactive={reactive} />
      {field && <GenerativeField />}
      <div
        className="screen-enter"
        style={{
          position: 'relative',
          minHeight: '100%',
          padding: pad ? '64px 26px 0' : 0,
          paddingBottom: tabSafe ? 112 : 40,
        }}
      >
        {children}
      </div>
    </div>
  )
}

export function TopBar({
  title,
  onBack,
  right,
}: { title?: string; onBack?: boolean; right?: ReactNode }) {
  const navigate = useNavigate()
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      minHeight: 28, marginBottom: 26,
    }}>
      <div style={{ width: 40 }}>
        {onBack && (
          <button
            className="pressable focusable"
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <ChevronLeft size={24} strokeWidth={1.6} color="var(--color-text)" />
          </button>
        )}
      </div>
      {title && (
        <span style={{
          fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 600,
          letterSpacing: '-0.01em', color: 'var(--color-text)',
        }}>
          {title}
        </span>
      )}
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
    </header>
  )
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      lineHeight: 1,
      letterSpacing: '0.22em',
      textTransform: 'uppercase',
      color: 'var(--color-text-muted)',
      ...style,
    }}>
      {children}
    </span>
  )
}

export function Display({ children, size = 34, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <h1 style={{
      fontFamily: 'var(--font-serif)',
      fontSize: size,
      fontWeight: 400,
      lineHeight: 1.1,
      letterSpacing: '-0.025em',
      color: 'var(--color-text)',
      fontVariationSettings: '"opsz" 144',
      ...style,
    }}>
      {children}
    </h1>
  )
}

export function Hairline({ mt = 0, mb = 0 }: { mt?: number; mb?: number }) {
  return <div style={{ height: 1, background: 'var(--color-hair)', marginTop: mt, marginBottom: mb }} />
}

export function Card({ children, style, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: () => void }) {
  return (
    <div
      className={onClick ? 'pressable' : undefined}
      onClick={onClick}
      style={{
        background: 'var(--color-surface)',
        borderRadius: 22,
        padding: 20,
        border: '1px solid var(--color-hair)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

export function PrimaryButton({
  children, onClick, style, variant = 'solid',
}: {
  children: ReactNode
  onClick?: () => void
  style?: CSSProperties
  variant?: 'solid' | 'ghost'
}) {
  const solid = variant === 'solid'
  return (
    <button
      className="pressable focusable"
      onClick={onClick}
      style={{
        width: '100%',
        padding: '17px 22px',
        borderRadius: 16,
        fontSize: 15,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: solid ? 'var(--color-accent)' : 'transparent',
        color: solid ? 'var(--color-accent-ink)' : 'var(--color-text)',
        border: solid ? 'none' : '1px solid var(--color-hair)',
        boxShadow: solid ? '0 12px 36px rgba(181,168,232,0.22), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/** Big serif score number with tabular figures. */
export function BigNumber({ value, size = 96 }: { value: number | string; size?: number }) {
  return (
    <span style={{
      fontFamily: 'var(--font-serif)',
      fontSize: size,
      fontWeight: 300,
      lineHeight: 0.92,
      letterSpacing: '-0.045em',
      color: 'var(--color-text)',
      fontVariantNumeric: 'tabular-nums',
      fontVariationSettings: '"opsz" 144',
      display: 'inline-block',
    }}>
      {value}
    </span>
  )
}

/** Horizontal sleep-stage proportion bar. */
export function StageBar({ deep, rem, light, awake }: { deep: number; rem: number; light: number; awake: number }) {
  return (
    <div style={{ display: 'flex', height: 5, borderRadius: 3, overflow: 'hidden', background: 'var(--color-hair)' }}>
      <div style={{ width: `${deep}%`, background: 'var(--color-accent)' }} />
      <div style={{ width: `${rem}%`, background: 'var(--color-accent-dim)' }} />
      <div style={{ width: `${light}%`, background: 'rgba(155,124,232,0.4)' }} />
      <div style={{ width: `${awake}%`, background: 'rgba(155,146,196,0.25)' }} />
    </div>
  )
}
