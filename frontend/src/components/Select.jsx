import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, Search, SearchX } from 'lucide-react';
import useFloatingPanel from '../hooks/useFloatingPanel';

export default function Select({ value, onChange, options = [], placeholder = 'Select an option', label, 'aria-label': ariaLabel, disabled = false, searchable = false, searchPlaceholder, allowCustom = false, className = '', icon: Icon, description, emptyText = 'No matches. Try another search.', width }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const typeahead = useRef({ text: '', time: 0 });
  const trigger = useRef(null), panel = useRef(null), search = useRef(null);
  const reduced = useReducedMotion();
  const normalized = options.map(o => typeof o === 'object' ? o : { value: o, label: String(o) });
  const selected = normalized.find(o => String(o.value) === String(value));
  const visible = normalized.filter(o => `${o.label} ${o.description || ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  if (allowCustom && query.trim() && !visible.some(o => o.label.toLowerCase() === query.trim().toLowerCase())) visible.push({ value: query.trim(), label: query.trim(), description: 'Search this location' });
  const enabled = visible.map((option, index) => option.disabled ? -1 : index).filter(index => index >= 0);
  const initialIndex = () => {
    const chosen = visible.findIndex(option => String(option.value) === String(value) && !option.disabled);
    return chosen >= 0 ? chosen : enabled[0] ?? -1;
  };
  const close = (restore = true) => { setOpen(false); setQuery(''); if (restore) trigger.current?.focus(); };
  const position = useFloatingPanel(open, trigger, panel, close, width);
  const pick = option => { if (!option || option.disabled) return; onChange(option.value); close(); };
  useEffect(() => { if (open && searchable && position.visibility==='visible') search.current?.focus(); }, [open, searchable, position.visibility]);
  useEffect(() => {
    if (open && (!visible[active] || visible[active].disabled)) setActive(enabled[0] ?? -1);
  }, [open, active, visible.map(option => `${option.value}:${!!option.disabled}`).join('|')]);
  useEffect(() => { if (open) panel.current?.querySelector(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' }); }, [active, open]);
  const keyboard = event => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key === 'Tab' && open) { trigger.current?.focus(); close(false); return; }
    // Preserve text-editing shortcuts in the search field.
    if (event.target === search.current && ['Home', 'End'].includes(event.key)) return;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (!open) { setOpen(true); setActive(initialIndex()); return; }
      setActive(index => {
        if (event.key === 'Home') return enabled[0] ?? -1;
        if (event.key === 'End') return enabled.at(-1) ?? -1;
        const offset = event.key === 'ArrowDown' ? 1 : -1;
        const next = Math.max(0, Math.min(enabled.length - 1, enabled.indexOf(index) + offset));
        return enabled[next] ?? -1;
      });
      return;
    }
    if (event.key === 'Enter' && open) { event.preventDefault(); pick(visible[active]); }
    if (event.key === ' ' && !searchable && open) { event.preventDefault(); pick(visible[active]); }
    if (!searchable && event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      const text = now - typeahead.current.time < 700 ? typeahead.current.text + event.key : event.key;
      typeahead.current = { text, time: now };
      const match = enabled.find(index => String(visible[index].label).toLowerCase().startsWith(text.toLowerCase()));
      if (match != null) { setOpen(true); setActive(match); }
    }
  };
  const name = ariaLabel || label || placeholder;
  return <div className={`ui-select ${className}`}>
    {label && <label className="ui-field-label" htmlFor={`${id}-trigger`}>{label}</label>}
    <button ref={trigger} id={`${id}-trigger`} type="button" role={searchable ? undefined : 'combobox'} aria-label={name} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={!searchable && open && visible[active] ? `${id}-option-${active}` : undefined} disabled={disabled} className={`ui-select-trigger ${open ? 'ui-select-trigger--open' : ''}`} onKeyDown={keyboard} onClick={() => { setOpen(!open); setQuery(''); setActive(initialIndex()); }}>
      {Icon && <Icon size={18}/>}<span className={value === '' || value == null ? 'ui-placeholder' : ''}>{selected?.label || (allowCustom && value ? value : placeholder)}</span><ChevronDown size={16} className="ui-select-chevron"/>
    </button>
    {description && <small className="ui-field-hint">{description}</small>}
    {createPortal(<AnimatePresence>{open && !disabled && <motion.div ref={panel} data-overlay-panel className="ui-select-panel" style={position} initial={{ opacity: 0, y: reduced ? 0 : -6, scale: reduced ? 1 : .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -4 }} transition={{ duration: .17 }} onKeyDown={keyboard}>
      {searchable && <div className="ui-select-search"><Search size={17}/><input ref={search} role="combobox" aria-label={`Search ${name.toLowerCase()}`} aria-expanded="true" aria-autocomplete="list" aria-controls={`${id}-list`} aria-activedescendant={visible[active] ? `${id}-option-${active}` : undefined} value={query} placeholder={searchPlaceholder || `Search ${name.toLowerCase()}…`} onChange={event => { setQuery(event.target.value); setActive(0); }}/></div>}
      <ul id={`${id}-list`} role="listbox" aria-label={name} className="ui-select-options">
        {visible.map((option, index) => <li key={String(option.value)} id={`${id}-option-${index}`} data-option-index={index} role="option" aria-selected={String(value) === String(option.value)} aria-disabled={option.disabled || undefined} className={`ui-select-option ${index === active ? 'ui-select-option--focused' : ''} ${String(value) === String(option.value) ? 'ui-select-option--chosen' : ''}`} onPointerMove={() => { if (!option.disabled) setActive(index); }} onMouseDown={event => event.preventDefault()} onClick={() => pick(option)}>
          <span><strong>{option.label}</strong>{option.description && <small>{option.description}</small>}</span>{String(value) === String(option.value) && <Check size={16}/>}
        </li>)}
      </ul>{!visible.length && <div className="ui-select-empty"><SearchX size={22}/><p>{emptyText}</p></div>}
    </motion.div>}</AnimatePresence>, document.body)}
  </div>;
}
