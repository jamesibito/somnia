import { useNavigate, useLocation } from 'react-router-dom'
import { useAudio } from '../context/AudioProvider'

/**
 * NowPlayingDot — a presence, not a player. A small breathing accent dot +
 * the current soundscape name, top-right, only while audio plays. Mounted in
 * PhoneFrame (outside <Routes>) so it survives navigation — that's the
 * continuity fix: start a soundscape, wander the app, it stays with you.
 */
export default function NowPlayingDot() {
  const { playing, current } = useAudio()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // Hide on the player itself and during the lights-out / morning moments.
  const hiddenHere =
    !playing || !current ||
    pathname.startsWith('/soundscape/') ||
    pathname === '/night' || pathname === '/morning' || pathname === '/'

  if (hiddenHere) return null

  return (
    <button
      className="pressable focusable"
      onClick={() => navigate('/soundscape/' + current.id)}
      aria-label={`Now playing: ${current.name}. Open player.`}
      style={{
        position: 'absolute',
        top: 60, right: 22, zIndex: 75,
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px 6px 8px',
        borderRadius: 999,
        background: 'rgba(20,14,44,0.55)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid var(--color-hair)',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 7, height: 7, borderRadius: 4,
          background: 'var(--color-accent)',
          transform: 'scale(calc(1 + var(--amp,0) * 0.9))',
          opacity: 'calc(0.55 + var(--amp,0) * 0.45)' as unknown as number,
          transition: 'transform 120ms linear',
          boxShadow: '0 0 6px rgba(181,168,232,0.6)',
        }}
      />
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.06em', color: 'var(--color-text-muted)',
        maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {current.name}
      </span>
    </button>
  )
}
