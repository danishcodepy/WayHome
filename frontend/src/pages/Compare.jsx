import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GitCompareArrows, Check, X, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Select from '../components/Select.jsx';
import { PriceDisplay } from '../components/Pricing';
import { formatPrice, listingPrice } from '../utils/price';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api.js';
import { getCompareList, subscribeCompare, toggleCompare } from '../utils/compare.js';

const FACILITY_ROWS = ['WiFi', 'Parking', 'Security', 'Food', 'Laundry'];

function facilityTick(property, wanted) {
  const list = (property.facilities || []).map((f) => f.toLowerCase());
  const w = wanted.toLowerCase();
  if (w === 'security') return list.some((f) => f.includes('secur') || f.includes('cctv') || f.includes('gated'));
  return list.some((f) => f.includes(w));
}

/** Side-by-side property comparison (frontend only). */
export default function Compare() {
  const toast=useToast();
  const [error,setError]=useState('');
  const [ids, setIds] = useState(getCompareList);
  const [all, setAll] = useState([]);
  const [props, setProps] = useState([]);

  useEffect(() => subscribeCompare(setIds), []);
  useEffect(() => { Promise.all([api.getProperties(), api.getAccommodations()]).then(([items, rooms]) => setAll([...items.filter(p=>p.status === 'Approved'), ...rooms])).catch(() => setError('Could not load comparison data. Please reload to try again.')); }, []);
  useEffect(() => {
    const set = new Set(ids.map(String));
    setProps(all.filter((p) => set.has(String(p.id))));
  }, [all, ids]);

  const addById = id => { if(!id)return;try{const result=toggleCompare(id);if(!result.added)toast('Compare up to 3 homes at a time.','error');}catch{toast('Could not update your comparison.','error');} };
  const uncompared = all.filter((p) => !ids.includes(String(p.id)));

  const rows = [
    { label: 'Price', render: p => <PriceDisplay property={p}/> },
    { label: 'Type', render: (p) => p.type },
    { label: 'Bedrooms', render: (p) => p.bedrooms?`${p.bedrooms} BHK`:p.roomType||'—' },
    { label: 'Bathrooms', render: (p) => p.bathrooms||'—' },
    { label: 'Area', render: (p) => p.area?`${p.area} sq.ft`:'—' },
    { label: 'Location', render: (p) => p.location||`${p.university}, ${p.city}` },
    { label: 'Verified', render: (p) => (p.verified
      ? <span className="inline-flex items-center gap-1 text-green-700 font-semibold text-sm"><Check className="w-4 h-4" /> Yes</span>
      : <span className="inline-flex items-center gap-1 text-slate-400 text-sm"><X className="w-4 h-4" /> No</span>) },
    ...FACILITY_ROWS.map((f) => ({
      label: f,
      render: (p) => (facilityTick(p, f)
        ? <Check className="w-5 h-5 text-green-600 mx-auto" />
        : <X className="w-5 h-5 text-slate-300 mx-auto" />),
    })),
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl font-bold text-slate-900 flex items-center gap-3">
            <GitCompareArrows className="w-8 h-8 text-brand" /> Compare Properties
          </h1>
          <p className="text-slate-500 mt-2">Pick up to 3 properties and compare them side by side.</p>
        </motion.div>

        {error&&<p role="alert" className="form-error mt-6">{error}</p>}{props.length < 2 ? (
          <div className="mt-8">
            <EmptyState
              icon={GitCompareArrows}
              title={props.length === 0 ? 'Nothing to compare yet' : 'Add one more property'}
              subtitle="Use the compare icon on any property card, or pick from the list below."
              actionLabel="Browse properties"
              actionTo="/properties"
            />
            {uncompared.length > 0 && (
              <div className="mt-6 max-w-md mx-auto">
                <label className="text-sm font-semibold text-slate-700">Add a property to compare</label>
                <Select
                  value=""
                  placeholder="Select property…"
                  options={uncompared.map((p) => ({ value: p.id, label: `${p.name} · ${formatPrice(listingPrice(p),{mode:p.listingFor})}` }))}
                  onChange={addById}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 overflow-x-auto rounded-xl border border-slate-200"
          >
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-4 w-40" />
                  {props.map((p) => (
                    <th key={p.id} className="p-4 align-top min-w-[200px]">
                      <div className="relative rounded-lg overflow-hidden h-36">
                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                        <button
                          onClick={() => addById(p.id)}
                          aria-label={`Remove ${p.name} from comparison`}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 shadow flex items-center justify-center text-slate-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-display font-bold text-navy mt-3 text-left">{p.name}</p>
                      <Link to={`/${p.university?'accommodation':'property'}/${p.id}`} className="inline-flex items-center gap-1 text-brand text-xs font-bold mt-1">
                        View details
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="p-4 font-semibold text-slate-500 text-[13px]">{row.label}</td>
                    {props.map((p) => (
                      <td key={p.id} className="p-4 text-center text-slate-800 font-medium">{row.render(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}
