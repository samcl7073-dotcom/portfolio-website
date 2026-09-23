import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/projects', label: 'PROJECTS' },
  { path: '/blogs', label: 'BLOGS' },
  { path: '/about', label: 'ABOUT' },
  { path: '/contact', label: 'CONTACT' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const headerRef = useRef<HTMLElement>(null)
  const [headerHeight, setHeaderHeight] = useState(56)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return
    const update = () => {
      const h = el.offsetHeight
      setHeaderHeight(h)
      document.documentElement.style.setProperty('--header-height', `${h}px`)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <>
      <header className="site-header" ref={headerRef}>
        <div className="header-inner">
          <Link to="/" className="site-logo">Samantha C. Lai</Link>
          <nav className="main-nav">
            <ul>
              {NAV_ITEMS.map(item => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'nav-active' : ''}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            className={`mobile-menu-btn${menuOpen ? ' active' : ''}`}
            aria-label="Menu"
            onClick={() => setMenuOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div
          className="mobile-nav-overlay"
          style={{
            position: 'fixed',
            top: `${headerHeight}px`,
            left: 0,
            right: 0,
            zIndex: 200,
            background: '#ffffff',
            borderBottom: '1px solid #e8e8e8',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
            padding: '0.5rem 0',
          }}
        >
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {NAV_ITEMS.map(item => {
              const active = location.pathname === item.path
              return (
                <li key={item.path} style={{ listStyle: 'none', width: '100%' }}>
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '1rem 1.5rem',
                      color: active ? '#000' : '#1a1a1a',
                      background: active ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textDecoration: 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </>
  )
}
