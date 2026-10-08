import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import useFloatingPanel from '../hooks/useFloatingPanel';

export default function Popover({ label, display, icon: Icon, children, className = '', width = 340, active = false }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef(null), panel = useRef(null), id = useId();
  const reduced = useReducedMotion();
  const close = (restore = true) => { setOpen(false); if (restore) trigger.current?.focus(); };
  const position = useFloatingPanel(open, trigger, panel, close, width);
  useEffect(()=>{if(open&&position.visibility==='visible')panel.current?.querySelector('input,button')?.focus();},[open,position.visibility]);
  return <div className={`ui-popover ${className}`}><button ref={trigger} type="button" className={`ui-select-trigger ${active ? 'ui-select-trigger--filtered' : ''}`} aria-label={label} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{Icon && <Icon size={17}/>}<span>{display || label}</span><ChevronDown size={16}/></button>{createPortal(<AnimatePresence>{open && <motion.div id={id} ref={panel} data-overlay-panel role="dialog" aria-label={label} className="ui-popover-panel" style={position} initial={{ opacity: 0, y: reduced ? 0 : -6, scale: reduced ? 1 : .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : -4 }} transition={{ duration: .18 }} onKeyDown={e => { if(e.key==='Tab'){const items=[...panel.current.querySelectorAll('button:not([disabled]),input:not([disabled])')];const target=e.shiftKey?items.at(-1):items[0];if((e.shiftKey&&document.activeElement===items[0])||(!e.shiftKey&&document.activeElement===items.at(-1))){e.preventDefault();target?.focus();}} if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }}><div className="ui-popover-heading">{label}</div>{typeof children === 'function' ? children(close) : children}</motion.div>}</AnimatePresence>, document.body)}</div>;
}
