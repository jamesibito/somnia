import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SpiralMark from '../components/SpiralMark'
import Wordmark from '../components/Wordmark'
import AtmosphereLayer from '../components/AtmosphereLayer'

export default function Splash() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => navigate('/onboarding'), 2600)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <div className="screen" onClick={() => navigate('/onboarding')}>
      <AtmosphereLayer variant="deep" grain={0.07} />
      <div style={{
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
      }}>
        <div className="fade-in">
          <SpiralMark size={64} color="var(--color-accent)" strokeWidth={1.2} spinning />
        </div>
        <div className="rise" style={{ textAlign: 'center', animationDelay: '300ms' }}>
          <Wordmark height={30} color="var(--color-text)" />
          <div style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--color-text-muted)',
            marginTop: 14,
          }}>
            Rest, deliberately.
          </div>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0,
        textAlign: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: 'var(--color-text-faint)',
      }} className="shimmer">
        Tap to begin
      </div>
    </div>
  )
}
