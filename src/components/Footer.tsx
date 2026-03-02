import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Samantha C. Lai</span>
        </div>
        <nav className="footer-nav">
          <ul>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
        <div className="footer-social">
          <a href="https://www.instagram.com/occasions.places" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href="https://500px.com/p/occasionsplaces?view=photos" target="_blank" rel="noopener noreferrer">500px</a>
        </div>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}
