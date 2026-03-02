import { useState } from 'react'
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

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link to="/" className="site-logo">Samantha C. Lai</Link>
        <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
          <ul>
            {NAV_ITEMS.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'nav-active' : ''}
                  onClick={() => setMenuOpen(false)}
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
  )
}
