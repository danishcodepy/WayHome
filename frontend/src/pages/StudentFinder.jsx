import { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { MapPin, GraduationCap, ShieldCheck, Search, SearchX, SlidersHorizontal, X, Landmark, Building2, Trees, Home } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AccommodationCard, { formatDist } from '../components/AccommodationCard';
import CompareTray from '../components/CompareTray';
import PropertyMap from '../components/PropertyMap';
import Select from '../components/Select';
import UniversitySearch from '../components/UniversitySearch';
import FilterSection from '../components/FilterSection';
import Modal from '../components/Modal';
import ViewToggle from '../components/ViewToggle';
import { PriceDisplay, PriceRange } from '../components/Pricing';
import ScrollReveal, { ResultsGrid } from '../components/ScrollReveal';
import { accommodations, stateCityData } from '../data/universities';
import { universityDirectory } from '../services/universityDirectory';
import { filterAccommodations } from '../utils/studentFilters';
import { priceRangeLabel } from '../utils/price';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext';

const POPULAR = [['Amity University', ShieldCheck, 'amity'], ['Delhi University', GraduationCap, 'delhi'], ['IIT Delhi', Landmark, 'iit'], ['VIT', Building2, 'vit'], ['Manipal University', Trees, 'manipal']];
const ALL_CITIES = [...new Map(stateCityData.flatMap(item => item.cities.map(city => [city.name, city.name]))).values()].sort((a, b) => a.localeCompare(b));

function StudentFilters({ params, update, pick, reset, showLocation = false }) {
  const distanceGroup = useId();
  const state = params.get('state') || '', city = params.get('city') || '';
  const cities = (state ? (stateCityData.find(item => item.state === state)?.cities || []) : ALL_CITIES.map(name => ({ name }))).slice().sort((a, b) => a.name.localeCompare(b.name));
  const campusOptions = universityDirectory.filter(item => (!state || item.state === state) && (!city || item.city === city));
  const types = (params.get('type') || '').split(',').filter(Boolean), facilities = (params.get('facilities') || '').split(',').filter(Boolean);
  const toggle = (key, values, value) => update({ [key]: (values.includes(value) ? values.filter(item => item !== value) : [...values, value]).join(',') });
  return <>
    <div className="filters-title"><h2>Filters</h2><button type="button" onClick={reset}>Reset</button></div>
    <FilterSection title="University & location" defaultOpen={showLocation || !params.get('university')}>
      <div className="campus-filter-location">
        <Select label="State" value={state} onChange={value => update({ state: value, city: '', university: '' })} options={[{ value: '', label: 'All India' }, ...stateCityData.map(item => item.state).sort((a, b) => a.localeCompare(b))]} searchable searchPlaceholder="Search a state…"/>
        <Select label="City" value={city} onChange={value => update({ city: value, university: '' })} options={[{ value: '', label: 'All cities' }, ...cities.map(item => item.name)]} searchable searchPlaceholder="Search a city…"/>
        <UniversitySearch label="University" value={params.get('university') || ''} onChange={pick} options={campusOptions} allowAll/>
      </div>
    </FilterSection>
    <FilterSection title="Property Type" count={types.length}>{['PG', 'Hostel', 'Flat', 'Apartment', 'Studio'].map(type => <label key={type}><input type="checkbox" checked={types.includes(type)} onChange={() => toggle('type', types, type)}/>{type}</label>)}</FilterSection>
    <FilterSection title="Budget (₹/month)"><PriceRange min={Number(params.get('min')) || 0} max={Number(params.get('max')) || 0} onChange={update} student/></FilterSection>
    <FilterSection title="Distance from University">{[['', 'Any distance'], ['1', 'Within 1 km'], ['3', 'Within 3 km'], ['5', 'Within 5 km']].map(([value, label]) => <label key={label}><input type="radio" name={distanceGroup} value={value} checked={(params.get('distance') || '') === value} onChange={() => update({ distance: value })}/>{label}</label>)}</FilterSection>
    <FilterSection title="Facilities" count={facilities.length}>{['WiFi', 'Food', 'Security', 'Laundry'].map(facility => <label key={facility}><input type="checkbox" checked={facilities.includes(facility)} onChange={() => toggle('facilities', facilities, facility)}/>{facility}</label>)}</FilterSection>
    <FilterSection title="Room & furnishing" defaultOpen={false}><div className="campus-filter-location"><Select label="Room type" value={params.get('room') || ''} onChange={room => update({ room })} options={[{ value: '', label: 'All room types' }, ...new Set(accommodations.map(item => item.roomType))]}/><Select label="Furnishing" value={params.get('furnishing') || ''} onChange={furnishing => update({ furnishing })} options={[{ value: '', label: 'Any furnishing' }, 'Fully Furnished', 'Semi Furnished']}/></div></FilterSection>
  </>;
}

export default function StudentFinder() {
  const { user } = useAuth();
  if (user?.role === 'Tenant') {
    return <Navigate to="/properties" replace />;
  }
  const [params, setParams] = useSearchParams();
  const university = params.get('university') || '', view = params.get('view') || 'grid';
  const [draftCampus, setDraftCampus] = useState(university), [selected, setSelected] = useState(''), [highlighted, setHighlighted] = useState(''), [filtersOpen, setFiltersOpen] = useState(false);
  const [accommodationData, setAccommodationData] = useState(accommodations);
  const [dataError, setDataError] = useState('');
  const reduced = useReducedMotion();
  useEffect(() => { let live = true; api.getAccommodations().then(data => { if (live) { setAccommodationData(data); setDataError(''); } }).catch(() => { if (live) setDataError('Could not load live accommodation data. Showing the available project dataset.'); }); return () => { live = false; }; }, []);
  const resultStart = useRef(null);
  const update = changes => setParams(previous => {
    const next = new URLSearchParams(previous);
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, String(value)) : next.delete(key));
    return next;
  }, { replace: true });
  const pick = name => {
    const found = universityDirectory.find(item => item.name === name);
    update(found ? { university: name, state: found.state, city: found.city } : { university: '' });
    setDraftCampus(name); setSelected('');
  };
  useEffect(() => { setDraftCampus(university); if (university) window.scrollTo({ top: 0, behavior: 'auto' }); }, [university]);
  const campus = universityDirectory.find(item => item.name === university);
  const results = filterAccommodations(accommodationData, params);
  const reset = () => update({ state: '', city: '', university: '', type: '', min: '', max: '', distance: '', facilities: '', furnishing: '', room: '', sort: '' });
  const selectCard = id => { setSelected(id); document.getElementById(`student-result-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); };
  const chips = [];
  for (const key of ['type', 'facilities', 'room', 'furnishing']) for (const value of (params.get(key) || '').split(',').filter(Boolean)) chips.push({ key: `${key}-${value}`, label: value, remove: () => update({ [key]: params.get(key).split(',').filter(item => item !== value).join(',') }) });
  if (params.get('min') || params.get('max')) chips.push({ key: 'budget', label: priceRangeLabel(Number(params.get('min')), Number(params.get('max'))), remove: () => update({ min: '', max: '' }) });
  if (params.get('distance')) chips.push({ key: 'distance', label: `Within ${params.get('distance')} km`, remove: () => update({ distance: '' }) });
  const filterProps = { params, update, pick, reset };
  return <div className="reference-student-site"><Navbar/><main id="main-content">{dataError && <div className="page-width"><p className="form-notice" role="status">{dataError}</p></div>}
    {!university && view !== 'map' && <section className="student-hero reference-student-hero">
      <div className="hero-photo"><img src="/assets/reference/campus-hero.webp" alt="Students walking through a sunlit university campus" width="1800" height="1200" fetchPriority="high"/></div><div className="hero-photo-blend"/>
      <div className="page-width hero-inner">
        <ScrollReveal className="hero-copy"><span className="eyebrow">FOR A BRIGHTER TOMORROW</span><h1>Student Accommodation<br/>Made Simple</h1><p>Find the best PGs, hostels, flats and apartments near<br className="desktop-break"/> your university. Safe, affordable and student friendly.</p></ScrollReveal>
        <form className="reference-campus-search" onSubmit={event => { event.preventDefault(); if (draftCampus) pick(draftCampus); else resultStart.current?.scrollIntoView({ behavior: 'smooth' }); }}><UniversitySearch value={draftCampus} onChange={setDraftCampus}/><button className="navy-button" aria-label="Search student accommodation"><Search size={21}/></button></form>
        <div className="campus-journey campus-journey--hero" aria-label="How student housing search works">
          {[
            ['01', 'Choose a campus', 'Search your university'],
            ['02', 'Set your budget', 'Filter by what fits'],
            ['03', 'Explore nearby', 'Compare places to stay']
          ].map(([number, title, text], index) => (
            <motion.div key={number} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .35, delay: reduced ? 0 : .42 + index * .06 }}>
              <span>{number}</span><div><strong>{title}</strong><small>{text}</small></div>
            </motion.div>
          ))}
        </div>
        <div className="campus-floating">{[[ShieldCheck, 'Verified'], [GraduationCap, 'Student Friendly'], [MapPin, 'Near Campus']].map(([Icon, text]) => <span key={text}><Icon size={17}/>{text}</span>)}</div>
        <div className="reference-popular"><h2>Popular Universities</h2><div className="uni-grid">{POPULAR.map(([name, Icon, theme]) => { const item = universityDirectory.find(option => option.name === name); return <motion.button type="button" key={name} className="university-card" onClick={() => pick(name)} whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: .99 }} transition={{ duration: .2, ease: 'easeOut' }}><span className={`university-emblem ${theme}`}><Icon size={24} strokeWidth={1.6}/></span><span><strong>{name}</strong><small>{item?.city}</small></span></motion.button>; })}</div></div>
      </div>
    </section>}
    <section ref={resultStart} id="student-results" className={`page-width student-marketplace ${view === 'map' ? 'student-marketplace--map' : ''}`}>
      {university && <div className="student-campus-bar"><button type="button" className="text-link" onClick={() => { setParams({}); setSelected(''); }}>Student Housing</button><span>/</span><strong>{university}</strong><button type="button" className="text-link" onClick={() => setFiltersOpen(true)}>Change university</button></div>}
      {view === 'map' ? <>
        <div className="campus-map-toolbar"><button className="text-link" onClick={() => update({ view: 'grid' })}>Back to search</button><Select aria-label="Distance from university" value={params.get('distance') || ''} onChange={distance => update({ distance })} options={[{ value: '', label: 'Any distance' }, ...[1, 3, 5].map(value => ({ value: String(value), label: `Within ${value} km` }))]}/></div>
        <div className="student-map-results">
          <div className="student-map-list"><h1>Nearby Places</h1><div className="pill-filters">{['', 'PG', 'Hostel', 'Flat'].map(type => <button key={type} type="button" className={(params.get('type') || '') === type ? 'filter-option--active' : ''} onClick={() => update({ type })}>{type || 'All'}</button>)}</div><p className="map-result-count" aria-live="polite">{results.length} places to stay</p>{results.map(item => <motion.article id={`student-result-${item.id}`} key={item.id} className={`map-result ${selected === item.id ? 'map-result--selected' : ''}`} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .3 }} onMouseEnter={() => setHighlighted(item.id)} onMouseLeave={() => setHighlighted('')} onFocus={() => setHighlighted(item.id)} onBlur={() => setHighlighted('')}><Link to={`/accommodation/${item.id}`}><img src={item.image} alt={item.name}/></Link><div><h2><Link to={`/accommodation/${item.id}`}>{item.name}</Link></h2><p>{item.type} · {formatDist(item)}</p><PriceDisplay property={item}/></div><button type="button" aria-label={`Show ${item.name} on map`} onClick={() => selectCard(item.id)}><MapPin size={16}/></button></motion.article>)}{!results.length && <div className="empty-panel"><SearchX/><h2>No homes in this search</h2><button className="outline-button" onClick={reset}>Reset filters</button></div>}</div>
          <div className="student-map-canvas"><PropertyMap items={results} selected={selected} highlighted={highlighted} onSelect={selectCard} campus={campus?.coordinates ? { ...campus.coordinates, name: campus.name } : null}/><div className="campus-map-legend"><span><Home size={16}/>PG / Hostel</span><span><GraduationCap size={16}/>University</span></div></div>
        </div>
      </> : <div className="student-browse-layout">
        <aside className="filters-panel student-filters" aria-label="Student accommodation filters"><StudentFilters {...filterProps}/></aside>
        <div className="student-listing-content">
          <div className="student-results-heading"><div><h1 aria-live="polite">{results.length} Student Accommodations</h1>{university && <p>Near {university}, {campus?.city || 'your campus'}</p>}</div><div className="student-results-actions"><Select aria-label="Sort student accommodation" value={params.get('sort') || 'nearest'} onChange={sort => update({ sort })} options={[{ value: 'nearest', label: 'Nearest' }, { value: 'price-low', label: 'Price: Low to high' }, { value: 'price-high', label: 'Price: High to low' }, { value: 'rating', label: 'Top rated' }]}/><ViewToggle value="grid" onChange={value => update({ view: value })}/></div></div>
          {!!chips.length && <div className="active-filter-row">{chips.map(chip => <button key={chip.key} type="button" onClick={chip.remove} aria-label={`Remove ${chip.label} filter`}>{chip.label}<X size={13}/></button>)}</div>}
          {results.length ? <ResultsGrid className="student-accommodation-grid">{results.map(item => <AccommodationCard key={item.id} acc={item}/>)}</ResultsGrid> : <div className="empty-panel"><SearchX size={34}/><h2>No rooms match just yet</h2><p>Try a wider budget or adjust your filters.</p><button className="primary-button" onClick={reset}>Reset filters</button></div>}
        </div>
      </div>}
      {view !== 'map' && <button className="primary-button student-filter-fab" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={17}/>Filters{chips.length ? ` · ${chips.length}` : ''}</button>}
    </section>
  </main><Footer/><CompareTray/><Modal open={filtersOpen} label="Student housing filters" onClose={() => setFiltersOpen(false)} className="filter-sheet"><StudentFilters {...filterProps} showLocation/><div className="filter-sheet-footer"><button className="text-link" onClick={reset}>Reset filters</button><button className="primary-button" onClick={() => setFiltersOpen(false)}>Show {results.length} homes</button></div></Modal></div>;
}
