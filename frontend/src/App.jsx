import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import MobileNav from './components/MobileNav';
import { ToastProvider } from './context/ToastContext';
import SmartAssistant from './components/SmartAssistant';

// Public pages
import Landing from './pages/Landing';
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetails = lazy(() => import('./pages/PropertyDetails'));
const AccommodationDetails = lazy(() => import('./pages/AccommodationDetails'));
const StudentFinder = lazy(() => import('./pages/StudentFinder'));
const Chat = lazy(() => import('./pages/Chat'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Compare = lazy(() => import('./pages/Compare'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Architecture = lazy(() => import('./pages/Architecture'));
const ERDiagram = lazy(() => import('./pages/ERDiagram'));
const Roadmap = lazy(() => import('./pages/Roadmap'));

// Role dashboards
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const ManagerDashboard = lazy(() => import('./pages/dashboards/ManagerDashboard'));
const TenantDashboard = lazy(() => import('./pages/dashboards/TenantDashboard'));

const MapSearch=lazy(()=>import('./pages/MapSearch'));
const ListProperty=lazy(()=>import('./pages/ListProperty'));
const ForgotPassword=lazy(()=>import('./pages/ForgotPassword'));
const Terms=lazy(()=>import('./pages/Terms'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo(0, 0); return; }
    const timer = window.setTimeout(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [pathname, hash]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
      >
        <Suspense fallback={<div className="page-width py-16" role="status"><div className="skeleton"/><span className="sr-only">Loading page…</span></div>}><Routes location={location}>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/map" element={<MapSearch />} />
          <Route
            path="/list-property"
            element={
              <ProtectedRoute roles={['Property Manager', 'Admin']}>
                <ListProperty />
              </ProtectedRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/accommodation/:id" element={<AccommodationDetails />} />
          <Route path="/student-housing" element={<StudentFinder />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/er-diagram" element={<ERDiagram />} />
          <Route path="/roadmap" element={<Roadmap />} />

          {/* Authenticated routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />

          {/* Role-gated dashboards */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={['Property Manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenant"
            element={
              <ProtectedRoute roles={['Tenant', 'Student']}>
                <TenantDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>
      </motion.div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user"><ToastProvider>
      <ScrollToTop />
      <AnimatedRoutes />
      <MobileNav />
      <SmartAssistant />
    </ToastProvider></MotionConfig>
  );
}
