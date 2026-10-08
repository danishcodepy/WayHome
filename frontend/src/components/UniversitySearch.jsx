import { GraduationCap } from 'lucide-react';
import Select from './Select';
import { universityDirectory, universityOption } from '../services/universityDirectory';
export default function UniversitySearch({ value, onChange, options = universityDirectory, label, className = '', allowAll = false }) {
  return <Select label={label} aria-label={label || 'University'} icon={GraduationCap} value={value} onChange={onChange} options={[...(allowAll ? [{value:'',label:'All universities'}] : []), ...options.map(universityOption)]} placeholder="Search your university" searchable searchPlaceholder="Search university or campus city…" emptyText="No university found. Try a campus name or city." className={className}/>;
}
