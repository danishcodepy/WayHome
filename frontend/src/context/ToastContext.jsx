import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
const ToastContext = createContext(() => {});
export const useToast = () => useContext(ToastContext);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());
  const reduced = useReducedMotion();
  const dismiss = useCallback(id => { clearTimeout(timers.current.get(id)); timers.current.delete(id); setItems(list => list.filter(item => item.id !== id)); }, []);
  const toast = useCallback((message, tone = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setItems(list => [...list.slice(-2), { id, message, tone }]);
    timers.current.set(id, setTimeout(() => dismiss(id), 4200));
  }, [dismiss]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return <ToastContext.Provider value={toast}>{children}<div className="toast-stack" aria-live="polite" aria-atomic="false"><AnimatePresence>{items.map(item => <motion.div key={item.id} className={`toast toast--${item.tone}`} initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ duration: .2 }}>{item.tone === 'error' ? <AlertCircle size={19}/> : <CheckCircle2 size={19}/>}<p>{item.message}</p><button type="button" aria-label="Dismiss notification" onClick={() => dismiss(item.id)}><X size={15}/></button></motion.div>)}</AnimatePresence></div></ToastContext.Provider>;
}
