interface Props {
  size?: number
  color?: string
  strokeWidth?: number
  spinning?: boolean
}

/** Somnia spiral mark — locked brand asset, ~2.5 turns inward. */
export default function SpiralMark({ size = 26, color = 'currentColor', strokeWidth = 1.5, spinning = false }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={spinning ? { animation: 'spin-slow 32s linear infinite' } : undefined}
    >
      <path d="M16 22.5c-3.59 0-6.5-2.91-6.5-6.5s2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5-2.91 6.5-6.5 6.5" />
      <path d="M16 9.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5" />
      <path d="M16 14a2.5 2.5 0 1 0 2.5 2.5" />
    </svg>
  )
}
