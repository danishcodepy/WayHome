import { Link } from 'react-router-dom';
export default function Brand() {
  return <Link className="brand" to="/" aria-label="WayHome home"><svg className="brand-symbol" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m4 14 12-10 12 10v13H18v-8h-5v8H4V14Z" stroke="currentColor" strokeWidth="2.8" strokeLinejoin="round"/><path d="m9 14 7-6 7 6M9 18v4M23 18v4M21 5V2" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"/></svg><span>WayHome</span></Link>;
}
