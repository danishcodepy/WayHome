import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
function Dialog({ children, onClose, label, className }) {
  const ref=useRef(null), close=useRef(onClose), reduced=useReducedMotion();
  close.current=onClose;
  useEffect(() => {
    const prior=document.activeElement, overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    ref.current?.querySelector('button,input,textarea,a[href]')?.focus();
    const key=event => {
      if(event.defaultPrevented || document.querySelector('[data-overlay-panel]')) return;
      if(event.key==='Escape') { event.preventDefault(); close.current(); }
      if(event.key==='Tab') {
        const items=[...ref.current.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]')].filter(element => element.getClientRects().length);
        const first=items[0],last=items.at(-1);
        if(!first) return;
        if(event.shiftKey && document.activeElement===first) { event.preventDefault(); last.focus(); }
        else if(!event.shiftKey && document.activeElement===last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown',key);
    return () => { document.body.style.overflow=overflow; document.removeEventListener('keydown',key); if(prior?.isConnected) prior.focus(); };
  },[]);
  return <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:.18}} onMouseDown={event => { if(event.target===event.currentTarget) onClose(); }}><motion.section ref={ref} role="dialog" aria-modal="true" aria-label={label} className={`modal-dialog ${className}`} initial={{opacity:0,y:reduced?0:12,scale:reduced?1:.97}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:reduced?0:10,scale:reduced?1:.98}} transition={{duration:.2}}><button type="button" className="modal-close" onClick={onClose} aria-label="Close dialog"><X size={20}/></button>{children}</motion.section></motion.div>;
}
export default function Modal({ open=true, children, onClose, label, className='' }) {
  return createPortal(<AnimatePresence>{open && <Dialog key="dialog" onClose={onClose} label={label} className={className}>{children}</Dialog>}</AnimatePresence>,document.body);
}
