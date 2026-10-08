import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmptyState from '../components/EmptyState';
import ListingDetails from '../components/ListingDetails';
import { accommodations } from '../data/universities.js';
import { api } from '../services/api.js';

export default function AccommodationDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(() => accommodations.find(a => String(a.id) === String(id)) || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let live = true;
    setLoading(true);
    api.getAccommodation(id).then(item => { if (live && item) setProperty(item); }).catch(() => {}).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [id]);

  if (loading && !property) return <><Navbar/><main id="main-content" className="page-width py-16"><div className="skeleton" aria-label="Loading accommodation"/></main></>;
  if (!property) return <><Navbar/><main id="main-content" className="page-width py-16"><EmptyState title="This room is no longer available" subtitle="Find more rooms close to your campus." actionLabel="Explore student housing" actionTo="/student-housing"/></main></>;
  return <ListingDetails key={id} property={property} student />;
}
