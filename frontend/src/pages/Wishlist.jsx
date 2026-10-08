import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CompareTray from '../components/CompareTray.jsx';
import { api } from '../services/api.js';
import { getWishlist, subscribeWishlist } from '../utils/wishlist.js';
import { getSavedAcc, subscribeSavedAcc } from '../utils/storage.js';
import AccommodationCard from '../components/AccommodationCard.jsx';

/** Saved Properties — wishlist persisted in localStorage. */
export default function Wishlist() {
  const [ids, setIds] = useState(getWishlist);
  const [accIds, setAccIds] = useState(getSavedAcc);
  const [savedProps, setSavedProps] = useState([]);
  const [savedAcc, setSavedAcc] = useState([]);

  useEffect(() => subscribeWishlist(setIds), []);
  useEffect(() => subscribeSavedAcc(setAccIds), []);

  useEffect(() => {
    const propertyIds = new Set(ids.map(String));
    const accommodationIds = new Set(accIds.map(String));
    Promise.all([api.getProperties(), api.getAccommodations()]).then(([all, rooms]) => {
      setSavedProps(all.filter(p => propertyIds.has(String(p.id))));
      setSavedAcc(rooms.filter(a => accommodationIds.has(String(a.id))));
    });
  }, [ids, accIds]);

  const total = savedProps.length + savedAcc.length;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Heart className="w-8 h-8 fill-red-500 text-red-500" /> My Wishlist
          </h1>
          <p className="text-slate-500 mt-2">
            {total} saved item{total !== 1 ? 's' : ''} · stored on this device
          </p>
        </motion.div>

        {total === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Heart}
              title="Your wishlist is empty"
              subtitle="Tap the heart on any property or student accommodation to save it here for later."
              actionLabel="Browse properties"
              actionTo="/properties"
            />
          </div>
        ) : (
          <>
            {savedProps.length > 0 && (
              <>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-8">Saved properties</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedProps.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 28 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{ duration: 0.45, delay: (i % 3) * 0.07 }}
                    >
                      <PropertyCard property={p} />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
            {savedAcc.length > 0 && (
              <>
                <h2 className="font-display text-xl font-bold text-slate-900 mt-8">Saved student homes</h2>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedAcc.map((a) => (
                    <AccommodationCard key={a.id} acc={a} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {savedProps.length >= 2 && (
          <p className="mt-8 text-sm text-slate-500 text-center">
            Tip: tap the <span className="font-semibold text-slate-700">compare icon</span> on any two cards to compare them side by side.
          </p>
        )}
      </main>
      <Footer />
      <CompareTray />
    </div>
  );
}
