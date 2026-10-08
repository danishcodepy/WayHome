import { useId } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, Map } from 'lucide-react';
export default function ViewToggle({ value, onChange }) {
  const id = useId();
  return <div className="view-switch" aria-label="Results view">{[['grid', LayoutGrid, 'Grid'], ['map', Map, 'Map']].map(([key, Icon, label]) => <button key={key} type="button" aria-label={`${label} view`} aria-pressed={value === key} onClick={() => onChange(key)}>{value === key && <motion.span className="view-switch-active" layoutId={id} transition={{ type: 'spring', stiffness: 400, damping: 35 }}/>}<Icon size={16}/><span>{label}</span></button>)}</div>;
}
