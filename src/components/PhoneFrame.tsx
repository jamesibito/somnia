import type { ReactNode } from 'react'
import { useClock } from '../context/ClockProvider'

/** Status bar + home indicator + device shell. Screens render inside. */
export default function PhoneFrame({ children }: { children: ReactNode }) {
  const { clockLabel } = useClock()
  // Status bar shows hour:minute only (no AM/PM) to read like a phone clock.
  const hm = clockLabel.replace(/\s?(AM|PM)$/i, '')
  return (
    <div className="phone-shell">
      <div className="status-bar">
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
          {hm}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor" aria-hidden>
            <rect x="0" y="7" width="2.6" height="4" rx="0.5" opacity="0.9" />
            <rect x="4.6" y="5" width="2.6" height="6" rx="0.5" opacity="0.9" />
            <rect x="9.2" y="2.5" width="2.6" height="8.5" rx="0.5" opacity="0.9" />
            <rect x="13.8" y="0" width="2.6" height="11" rx="0.5" opacity="0.45" />
          </svg>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none" aria-hidden>
            <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="currentColor" opacity="0.5" />
            <rect x="2" y="2" width="15" height="8" rx="1.5" fill="currentColor" />
            <rect x="21.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
        </div>
      </div>
      {children}
      <div className="home-indicator" />
    </div>
  )
}
