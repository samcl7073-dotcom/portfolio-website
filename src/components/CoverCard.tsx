import { useCoverHeader } from '../hooks/useCoverHeader'

interface CoverCardProps {
  gradient?: 'sunset' | 'ocean' | 'dawn' | 'golden'
  title: string
  subtitle?: string
}

export default function CoverCard({ gradient, title, subtitle }: CoverCardProps) {
  const coverRef = useCoverHeader()

  return (
    <div
      ref={coverRef}
      className={`cover-card${gradient ? ` cover-${gradient}` : ''}`}
    >
      <div className="cover-card-content">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}
