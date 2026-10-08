import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Brand from './Brand';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();
  const showStudent = !user || user.role === 'Student';
  const showListProperty = !user || user.role === 'Property Manager';
  const dashboard = user?.role === 'Admin' ? '/admin' : user?.role === 'Property Manager' ? '/manager' : user ? '/tenant' : '/login';

  return (
    <footer className="premium-footer" id="contact">
      <div className="page-width footer-content">
        <div className="footer-intro">
          <Brand />
          <p>Better places. Brighter futures.<br />Find the space that fits your life.</p>
          <span><MapPin size={14} /> Made for life in India</span>
        </div>
        <div>
          <h3>Find your place</h3>
          <Link to="/properties">Explore homes</Link>
          {showStudent && <Link to="/student-housing">Student living</Link>}
          <Link to="/properties?type=Apartment">Apartments</Link>
          <Link to="/properties/map">Map search</Link>
        </div>
        <div>
          <h3>Make your move</h3>
          <Link to="/wishlist">Saved homes</Link>
          <Link to="/compare">Compare properties</Link>
          {showListProperty && <Link to="/list-property">List your property</Link>}
          <Link to={dashboard}>{user ? 'Your dashboard' : 'Sign in'}</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link to="/#about">About WayHome</Link>
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/chat">Messages & support</Link>
          <span className="footer-demo">Interactive demo<br />Listings and availability are sample data.</span>
        </div>
      </div>
      <div className="page-width footer-bottom">
        <span>© {new Date().getFullYear()} WayHome</span>
        <Link to="/terms">Terms & Conditions</Link>
        <details className="project-resources">
          <summary>Project resources</summary>
          <Link to="/architecture">Architecture</Link>
          <Link to="/er-diagram">Data model</Link>
          <Link to="/roadmap">Roadmap</Link>
        </details>
      </div>
    </footer>
  );
}
