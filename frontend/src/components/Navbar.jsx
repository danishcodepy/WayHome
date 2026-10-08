import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, LogOut, Heart, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';
import { AnimatePresence, motion } from 'framer-motion';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const accountRef = useRef(null);
  const [scrolled, setScrolled] = useState(window.scrollY > 24);
  const [open, setOpen] = useState(false);
  const [account, setAccount] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);

  useEffect(() => { setOpen(false); setAccount(false); }, [location]);

  useEffect(() => {
    const close = e => {
      if (e.key === 'Escape') { setOpen(false); setAccount(false); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  useEffect(() => {
    if (!account) return undefined;
    const outside = e => { if (!accountRef.current?.contains(e.target)) setAccount(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [account]);

  const dashboard = user?.role === 'Admin' ? '/admin' : user?.role === 'Property Manager' ? '/manager' : '/tenant';

  const navLink = (to, label, end = false) => (
    <NavLink to={to} end={end} className={({ isActive }) => isActive ? 'active' : undefined}>
      {({ isActive }) => <><span>{label}</span>{isActive && <motion.span layoutId="desktop-nav-indicator" className="desktop-nav-indicator" transition={{ duration: 0.22, ease: 'easeOut' }} />}</>}
    </NavLink>
  );

  const sectionLink = (hash, label) => {
    const active = location.pathname === '/' && location.hash === hash;
    return <Link to={`/${hash}`} className={active ? 'active' : undefined}>
      <span>{label}</span>
      {active && <motion.span layoutId="desktop-nav-indicator" className="desktop-nav-indicator" transition={{ duration: 0.22, ease: 'easeOut' }} />}
    </Link>;
  };

  const showStudentHousing = !user || user.role === 'Student';
  const showListProperty = user?.role === 'Property Manager';

  const links = (
    <>
      {navLink('/', 'Home', true)}
      {navLink('/properties', 'Properties')}
      {showStudentHousing && navLink('/student-housing', 'Student Housing')}
      {showListProperty && navLink('/list-property', 'List Property')}
      {sectionLink('#about', 'About')}
      {sectionLink('#contact', 'Contact')}
    </>
  );
  const heroPage = location.pathname === '/' || (location.pathname === '/student-housing' && !new URLSearchParams(location.search).get('university') && new URLSearchParams(location.search).get('view') !== 'map');

  return (
    <motion.header initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: 'easeOut' }} className={`premium-header ${heroPage && !scrolled ? 'hero-header' : ''}`}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="page-width nav-content">
        <Brand />
        <nav className="desktop-navigation" aria-label="Main navigation">{links}</nav>
        <div className="header-actions">
          <Link to="/properties" className="round-control header-search" aria-label="Search properties"><Search size={18} /></Link>
          {user && <NotificationBell />}
          {user ? <div ref={accountRef} className="account-menu">
            <button aria-label="Account menu" className="account-control" aria-expanded={account} aria-controls="account-dropdown" onClick={() => setAccount(!account)}><span className="avatar">{user.name?.slice(0, 1) || 'U'}</span><ChevronDown size={14} /></button>
            <AnimatePresence>{account && <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.17 }} id="account-dropdown" className="account-dropdown"><p>{user.name}<small>{user.role}</small></p><Link to={dashboard}><LayoutDashboard size={16} /> My dashboard</Link><Link to="/wishlist"><Heart size={16} /> Saved properties</Link><button onClick={() => { logout(); navigate('/'); }}><LogOut size={16} /> Log out</button></motion.div>}</AnimatePresence>
          </div> : <><Link to="/login" className="login-link">Sign In</Link><Link to="/register" className="navy-button header-cta">Get Started</Link></>}
          <button className="round-control mobile-menu-button" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {open && <nav id="mobile-navigation" className="mobile-navigation page-width" aria-label="Mobile navigation">{links}<Link to="/properties/map">Map search</Link><Link to="/wishlist">Saved properties</Link><Link to={user ? dashboard : '/login'}>{user ? 'My dashboard' : 'Sign in'}</Link>{showListProperty && <Link to="/list-property">List a property</Link>}</nav>}
    </motion.header>
  );
}
