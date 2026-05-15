import { useLocation, useNavigate } from 'react-router-dom'
import { Moon, Waves, Sparkles, BookOpen, User } from 'lucide-react'

const TABS = [
  { to: '/tonight', label: 'Tonight', Icon: Moon },
  { to: '/soundscape', label: 'Sounds', Icon: Waves },
  { to: '/meditate', label: 'Meditate', Icon: Sparkles },
  { to: '/journal', label: 'Journal', Icon: BookOpen },
  { to: '/profile', label: 'Profile', Icon: User },
]

export default function TabBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      aria-label="Primary"
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        zIndex: 70,
        paddingBottom: 26,
        paddingTop: 12,
        background: 'linear-gradient(to top, var(--color-bg) 55%, transparent)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
      }}
    >
      {TABS.map(({ to, label, Icon }) => {
        const active = pathname === to || pathname.startsWith(to + '/')
        return (
          <button
            key={to}
            className="pressable focusable"
            onClick={() => navigate(to)}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              width: 60,
              color: active ? 'var(--color-accent-bright)' : 'var(--color-text-faint)',
              transition: 'color 220ms ease',
            }}
          >
            <Icon size={21} strokeWidth={active ? 2 : 1.6} />
            <span style={{ fontSize: 10, letterSpacing: '0.02em', fontWeight: active ? 600 : 500 }}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
