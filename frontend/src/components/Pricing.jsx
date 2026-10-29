import { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import Popover from './Popover';
import { formatPrice, listingPrice, priceRangeLabel } from '../utils/price';
export function PriceDisplay({ property, amount, mode, className = 'home-price', suffix = true }) {
  const purpose = mode || property?.listingFor || 'rent';
  return <p className={`${className} price-display price-display--${purpose}`} data-price-kind={purpose}><strong>{formatPrice(amount ?? listingPrice(property), { mode: purpose })}</strong>{suffix && <span>{purpose === 'buy' ? ' asking price' : ' / month'}</span>}</p>;
}
export function PriceInput({ label, value, onChange, min = 0, max, required = false, disabled = false, placeholder = '0' }) {
  return <label className="ui-price-input"><span>{label}</span><div><IndianRupee size={16}/><input aria-label={label} type="number" inputMode="numeric" min={min} max={max} value={value} onChange={e => onChange(e.target.value)} required={required} disabled={disabled} placeholder={placeholder}/></div></label>;
}
export function PriceRange({ min = 0, max = 0, onChange, mode = 'rent', student = false }) {
  const step = mode === 'buy' ? 100000 : 500;
  const defaultCeiling = mode === 'buy' ? 30000000 : student ? 30000 : 100000;
  // Keep the slider consistent with larger budgets entered in the numeric fields.
  const ceiling = Math.ceil(Math.max(defaultCeiling, Number(min) || 0, Number(max) || 0) / step) * step;
  const lower = Math.max(0, Number(min) || 0), upper = Number(max) || ceiling;
  const lowerPct = Math.min(100, lower / ceiling * 100), upperPct = Math.min(100, upper / ceiling * 100);
  const setLower = raw => { const value = Math.max(0, Number(raw) || 0); onChange({ min: value, max: max && value > max ? value : max }); };
  const setUpper = raw => { const value = Math.max(0, Number(raw) || 0); onChange({ min: value && min > value ? value : min, max: value }); };
  return <div className="ui-price-range"><p className="ui-budget-summary">{priceRangeLabel(min, max, mode)}<small>{mode === 'buy' ? 'Purchase price' : 'Monthly rent'}</small></p><div className="dual-range"><div className="dual-range-track"><span style={{ left: `${lowerPct}%`, right: `${100 - upperPct}%` }}/></div><input type="range" aria-label="Minimum budget slider" aria-valuetext={formatPrice(lower, { mode })} min="0" max={ceiling} step={step} value={Math.min(lower, ceiling)} onChange={e => setLower(Math.min(Number(e.target.value), upper))}/><input type="range" aria-label="Maximum budget slider" aria-valuetext={max ? formatPrice(max, { mode }) : 'No maximum budget'} min="0" max={ceiling} step={step} value={Math.min(upper, ceiling)} onChange={e => setUpper(Math.max(Number(e.target.value), lower))}/></div><div className="range-endpoints"><span>₹0</span><span>{formatPrice(ceiling, { mode, compact: true })}</span></div><div className="budget-inputs"><PriceInput label="Minimum budget" value={min || ''} onChange={setLower}/><PriceInput label="Maximum budget" value={max || ''} onChange={setUpper} placeholder="Any"/></div><span className="ui-field-hint">Quick select</span><div className="budget-presets">{(mode === 'buy' ? [5000000,10000000,20000000] : student ? [8000,10000,15000,20000] : [10000,20000,30000,50000]).map(value => <button key={value} type="button" aria-pressed={!min && max === value} onClick={() => onChange({ min: 0, max: value })}>{formatPrice(value, { mode, compact: true })}</button>)}</div></div>;
}
function BudgetContents({ min, max, onChange, close, mode, student }) {
  const [draft, setDraft] = useState({ min, max });
  return <><PriceRange {...draft} onChange={setDraft} mode={mode} student={student}/><div className="popover-actions"><button type="button" className="text-link" onClick={() => setDraft({ min: 0, max: 0 })}>Reset</button><button type="button" className="primary-button" onClick={() => { onChange(draft); close(); }}>Apply budget</button></div></>;
}
export function BudgetPopover({ min = 0, max = 0, onChange, mode = 'rent', student = false, label = 'Budget', className = '' }) {
  return <Popover label={label} display={(!min && !max) ? label : priceRangeLabel(min, max, mode)} icon={IndianRupee} active={!!min || !!max} className={className}>{close => <BudgetContents min={min} max={max} onChange={onChange} close={close} mode={mode} student={student}/>}</Popover>;
}
