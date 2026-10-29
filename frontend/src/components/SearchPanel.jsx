import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Select from './Select';
import { BudgetPopover } from './Pricing';
import { stateCityData } from '../data/universities.js';

const CITIES = [...new Set(stateCityData.flatMap(state => state.cities.map(city => city.name)))].sort();

export default function SearchPanel({ compact = false }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState({ min: 0, max: 0 });
  const [mode, setMode] = useState('rent');

  const submit = event => {
    event.preventDefault();
    const params = new URLSearchParams({ mode });
    if (location.trim()) params.set('location', location.trim());
    if (type) params.set('type', type);
    if (budget.min) params.set('min', budget.min);
    if (budget.max) params.set('max', budget.max);
    navigate(`/properties?${params}`);
  };

  const tabs = [
    { id: 'rent', label: 'Rent' },
    { id: 'buy', label: 'Buy' },
    { id: 'student', label: 'PG / Hostel', desktopOnly: true },
    { id: 'sell', label: 'Sell', mobileOnly: true }
  ];

  const handleTabClick = id => {
    if (id === 'student') {
      navigate('/student-housing');
      return;
    }
    if (id === 'sell') {
      navigate('/list-property');
      return;
    }
    setMode(id);
    setBudget({ min: 0, max: 0 });
    setType('');
  };

  return (
    <div className={`market-search ${compact ? 'compact' : ''}`}>
      <div className="search-tabs" aria-label="Listing purpose">
        {tabs.map(({ id, label, desktopOnly, mobileOnly }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            className={`${mode === id ? 'search-tab--active' : ''} ${desktopOnly ? 'tab-desktop-only' : ''} ${mobileOnly ? 'tab-mobile-only' : ''}`}
            onClick={() => handleTabClick(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <form className="search-panel" onSubmit={submit} aria-label="Search properties">
        <Select
          aria-label="Location"
          icon={MapPin}
          value={location}
          onChange={setLocation}
          options={CITIES}
          searchable
          allowCustom
          placeholder="City or Neighbourhood"
          searchPlaceholder="Search a city or neighbourhood…"
        />
        <Select
          aria-label="Property type"
          icon={Building2}
          value={type}
          onChange={setType}
          options={[{ value: '', label: 'Property type' }, 'Apartment', 'Studio', 'Flat', 'Villa']}
          placeholder="Property type"
        />
        <div className="search-panel-bottom-row">
          <BudgetPopover {...budget} onChange={setBudget} mode={mode} label="Budget" />
          <motion.button whileTap={{ scale: 0.98 }} className="primary-button search-action" aria-label="Search properties">
            <Search size={18} />
          </motion.button>
        </div>
      </form>
    </div>
  );
}
