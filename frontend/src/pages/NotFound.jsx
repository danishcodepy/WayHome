import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

/** 404 — friendly "something went wrong / not found" page. */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <p className="font-display text-8xl font-extrabold text-slate-100 select-none">404</p>
          <h1 className="font-display text-3xl font-bold text-navy -mt-6">Something went wrong</h1>
          <p className="text-slate-500 mt-3">
            The page you are looking for doesn't exist or was moved. Let's get you back home.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand hover:bg-blue-600 text-white font-semibold rounded-xl px-6 py-3 transition-colors"
            >
              <Home className="w-4 h-4" /> Go Home
            </Link>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 border border-slate-300 hover:border-brand hover:text-brand text-slate-700 font-semibold rounded-xl px-6 py-3 transition-colors"
            >
              <Search className="w-4 h-4" /> Browse Properties
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
