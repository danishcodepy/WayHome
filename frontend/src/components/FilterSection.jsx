import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
export default function FilterSection({ title, children, defaultOpen = true, count = 0 }) {
  const [open, setOpen] = useState(defaultOpen), id = useId(), reduced = useReducedMotion();
  return <section className="filter-accordion"><button className="filter-accordion-title" type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}><span>{title}{count > 0 && <small>{count}</small>}</span><ChevronDown size={16} className={open ? 'rotate-180' : ''}/></button><AnimatePresence initial={false}>{open && <motion.div id={id} initial={{ height: reduced ? 'auto' : 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: reduced ? 'auto' : 0, opacity: 0 }} transition={{ duration: .2 }} className="filter-accordion-body"><div>{children}</div></motion.div>}</AnimatePresence></section>;
}
