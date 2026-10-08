import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Select from './Select';
import { BudgetPopover } from './Pricing';
import { stateCityData } from '../data/universities.js';
const CITIES = [...new Set(stateCityData.flatMap(state => state.cities.map(city => city.name)))].sort();
export default function SearchPanel({ compact = false }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState(''), [type, setType] = useState(''), [budget, setBudget] = useState({ min: 0, max: 0 }), [mode, setMode] = useState('rent');
  const submit = event => {
    event.preventDefault();
    const params = new URLSearchParams({ mode });
    if (location.trim()) params.set('location', location.trim());
    if (type) params.set('type', type);
    if (budget.min) params.set('min', budget.min);
    if (budget.max) params.set('max', budget.max);
    navigate(`/properties?${params}`);
  };
  return <div className={`market-search ${compact ? 'compact' : ''}`}><div className="search-tabs" aria-label="Listing purpose">{[['rent','Rent'],['buy','Buy'],['student','PG / Hostel']].map(([id,label]) => <button key={id} type="button" aria-pressed={mode === id} className={mode === id ? 'search-tab--active' : ''} onClick={() => { if (id === 'student') { navigate('/student-housing'); return; } setMode(id); setBudget({ min: 0, max: 0 }); setType(''); }}>{label}</button>)}</div><form className="search-panel" onSubmit={submit} aria-label="Search properties"><Select aria-label="Location" icon={MapPin} value={location} onChange={setLocation} options={CITIES} searchable allowCustom placeholder="City or neighbourhood" searchPlaceholder="Search a city or neighbourhood…"/><Select aria-label="Property type" value={type} onChange={setType} options={[{ value: '', label: 'All property types' },'Apartment','Studio','Flat','Villa']} placeholder="Property type"/><BudgetPopover {...budget} onChange={setBudget} mode={mode}/><motion.button whileTap={{ scale: .98 }} className="primary-button search-action" aria-label="Search properties"><Search size={21}/></motion.button></form></div>;
}
