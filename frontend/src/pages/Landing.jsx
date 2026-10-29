import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, GraduationCap, MapPin, BriefcaseBusiness, Search, FileCheck2, KeyRound, House, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import SearchPanel from '../components/SearchPanel';
import CompareTray from '../components/CompareTray';
import { properties as demoProperties } from '../data/properties';
import { api, isDemo } from '../services/api.js';
import Reveal, { ResultsGrid } from '../components/ScrollReveal';
import { useAuth } from '../context/AuthContext';



const TRUST = [
  [ShieldCheck, 'Verified Listings', 'Trusted properties'],
  [MapPin, 'Prime Locations', 'Top neighbourhoods'],
  [House, 'Multiple Options', 'Apartments, houses, villas'],
  [GraduationCap, 'Student Housing', 'Near universities', '/student-housing']
];

const heroCopyVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const heroImageVariants = {
  hidden: { opacity: 0, scale: 1.035 },
  visible: { opacity: 1, scale: 1 }
};

export default function Landing() {
  const { user } = useAuth();
  const [type, setType] = useState('All properties');
  const [properties, setProperties] = useState(demoProperties);
  const reduced = useReducedMotion();
  useEffect(() => { let live = true; api.getProperties().then(data => { if (live && data?.length) setProperties(data); }).catch(() => {}); return () => { live = false; }; }, []);
  const approved = properties.filter(p => p.status === 'Approved' && p.listingFor !== 'buy');
  const targetFeaturedNames = [
    'Modern 2 BHK Apartment',
    'Premium 3 BHK Residence',
    'Contemporary Family Villa',
    'Spacious 3 BHK Family Home',
    'Modern 2 BHK City Apartment',
    'Prime Commercial Space',
  ];
  const matchedFeatured = targetFeaturedNames.map(name => properties.find(p => (p.name || p.title) === name)).filter(Boolean);
  const featured = (type === 'All properties'
    ? (matchedFeatured.length === 6 ? matchedFeatured : demoProperties.slice(0, 6))
    : approved.filter(p => type === 'Student housing' ? ['PG', 'Hostel'].includes(p.type) : p.type === type)
  ).slice(0, 6);

  return (
    <div className="marketplace-site">
      <Navbar />
      <main id="main-content">
        <section className="market-hero">
          <motion.div
            className="hero-photo"
            initial={reduced ? false : 'hidden'}
            animate="visible"
            variants={heroImageVariants}
            transition={{ duration: reduced ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.img
              src="/assets/reference/living-room-hero.webp"
              alt="Light-filled apartment with comfortable seating and large windows"
              fetchPriority="high"
              width="1800"
              height="1200"
              animate={reduced ? undefined : { scale: [1, 1.008, 1] }}
              transition={reduced ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
          <div className="hero-photo-blend" />

          <div className="page-width hero-inner">
            <motion.div
              className="hero-copy"
              initial={reduced ? false : 'hidden'}
              animate="visible"
              variants={heroCopyVariants}
              transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.12, ease: 'easeOut' }}
            >
              <span className="eyebrow">BETTER PLACES. BRIGHTER FUTURES.</span>
              <h1>Find Your<br />Perfect <span>Space.</span></h1>
              <p>
                Explore verified properties, student accommodations
                <br className="desktop-break" /> and rental homes in the best locations.
              </p>
            </motion.div>

            <motion.div
              className="hero-search"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : 0.32, ease: 'easeOut' }}
            >
              <SearchPanel />
            </motion.div>

            <motion.div
              className="hero-image-caption"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.45 }}
            >
              <p>Modern Living<br />in Prime Locations</p>
            </motion.div>
          </div>

          <div className="trust-strip page-width" aria-label="Why WayHome">
            {TRUST.map(([Icon, title, text, link], index) => {
              const content = (
                <>
                  <span className="trust-icon"><Icon size={20} strokeWidth={1.8} /></span>
                  <p><strong>{title}</strong><span>{text}</span></p>
                </>
              );
              return (
                <motion.div
                  key={title}
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.42 + index * 0.06 }}
                >
                  {link ? (
                    <Link to={link} className="trust-strip-link" aria-label={`${title} - ${text}`}>
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="market-section soft-section">
          <div className="page-width">
            <Reveal>
              <div className="section-top">
                <div>
                  <span className="eyebrow">FIND YOUR NEXT HOME</span>
                  <h2>Spaces you’ll love coming home to.</h2>
                  <p>Thoughtful details. Transparent prices. Your kind of place.</p>
                </div>
                <Link className="text-link" to="/properties">View all properties</Link>
              </div>
            </Reveal>

            <div className="listing-category-row">
              {['All properties', 'Apartment', 'Studio', 'Student housing', 'Villa'].map(t => (
                <motion.button
                  key={t}
                  type="button"
                  className={type === t ? 'category-tab--active' : ''}
                  aria-pressed={type === t}
                  onClick={() => setType(t)}
                  whileTap={reduced ? undefined : { scale: 0.98 }}
                >
                  {t === 'Apartment' ? 'Apartments' : t === 'Studio' ? 'Studios' : t === 'Villa' ? 'Villas' : t}
                </motion.button>
              ))}
              <Link to="/properties/map"><MapPin size={15} /> Explore map</Link>
            </div>

            <ResultsGrid>
              {featured.map(p => <PropertyCard key={p.id} property={p} />)}
            </ResultsGrid>
          </div>
        </section>

        <section className="market-section page-width">
          <Reveal>
            <div className="student-promo">
              <div>
                <span className="eyebrow">BIG DREAMS. A PLACE OF YOUR OWN.</span>
                <h2>A home near<br />your university.</h2>
                <p>Find PGs, hostels and shared apartments close to campus. More time for the things that matter.</p>
                <div className="inline-benefits">
                  <span><ShieldCheck size={16} /> Clear room details</span>
                  <span><MapPin size={16} /> Campus nearby</span>
                </div>
                <Link className="primary-button" to="/student-housing">Explore student housing</Link>
              </div>
              <div className="student-promo-image">
                <img src="/assets/reference/campus-hero.webp" alt="University campus and student life" loading="lazy" width="1500" height="1000" />
                <span><GraduationCap size={25} /><p>A little closer to campus.<strong>A lot closer to home.</strong></p></span>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="market-section page-width neighbourhood-section">
          <Reveal>
            <div className="section-top">
              <div>
                <span className="eyebrow">EXPLORE THE NEIGHBOURHOOD</span>
                <h2>Where would you like to live?</h2>
              </div>
              <Link className="text-link" to="/properties/map">Find it on the map</Link>
            </div>
          </Reveal>
          <div className="city-rail" aria-label="Explore property markets">
            <div className="city-rail-track">
              {[0, 1].map(group => (
                <div className="city-rail-group" key={group} aria-hidden={group === 1 ? 'true' : undefined}>
                  {[
                    ['Noida', 'Uttar Pradesh', 'apartment-1.jpg'],
                    ['Delhi', 'Delhi', 'apartment-3.jpg'],
                    ['Greater Noida', 'Uttar Pradesh', 'villa-3.jpg'],
                    ['Gurugram', 'Haryana', 'villa-1.jpg'],
                    ['Bengaluru', 'Karnataka', 'apartment-2.jpg'],
                    ['Mumbai', 'Maharashtra', 'studio-2.jpg'],
                    ['Pune', 'Maharashtra', 'villa-2.jpg'],
                    ['Lucknow', 'Uttar Pradesh', 'apartment-3.jpg'],
                    ['Hyderabad', 'Telangana', 'studio-3.jpg']
                  ].map(([city, state, photo]) => {
                    const count = approved.filter(p => p.city === city).length;
                    return (
                      <Link className="city-card city-rail-card" to={`/properties?location=${encodeURIComponent(city)}`} key={`${group}-${city}`} tabIndex={group === 1 ? -1 : 0}>
                        <img src={`/assets/properties/${photo}`} alt={`Residence in ${city}`} loading="lazy" />
                        <div><h3>{city}</h3><p>{count ? `${count} ${count === 1 ? 'home' : 'homes'} to explore` : `Explore ${state}`}</p></div>
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-section market-section" id="about">
          <div className="page-width">
            <Reveal>
              <div className="section-top centered">
                <div>
                  <span className="eyebrow">LESS SEARCHING. MORE LIVING.</span>
                  <h2>Your next move, made simple.</h2>
                  <p>One place to find a home, connect with an owner and take the next step.</p>
                </div>
              </div>
            </Reveal>
            <div className="steps-row" id="how-it-works">
              {[
                [Search, 'Search your way', 'Start with a city, a campus or a budget. We’ll help you narrow it down.'],
                [FileCheck2, 'Compare the details', 'Save your favourites and compare the spaces that feel right.'],
                [KeyRound, 'Make yourself at home', 'Connect with the owner, arrange a visit and send an application.']
              ].map(([Icon, title, text], i) => (
                <Reveal key={title} delay={i * 0.05} className="process-card">
                  <span><Icon size={25} /></span><small>0{i + 1}</small><h3>{title}</h3><p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {(!user || user.role === 'Property Manager') && (
          <section className="page-width owner-banner">
            <Reveal className="owner-banner-inner">
              <div className="owner-banner-icon"><House size={34} /></div>
              <div><h2>Have a property to list?</h2><p>Find your next tenant. Manage everything in one place.</p></div>
              <Link className="navy-button" to="/list-property">List your property</Link>
            </Reveal>
          </section>
        )}
      </main>
      <Footer />
      <CompareTray />
    </div>
  );
}
