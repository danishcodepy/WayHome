import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
export default function MobileNav() {
  const {user}=useAuth(),{pathname,search}=useLocation();
  if(/^\/(login|register|forgot-password|list-property|chat|property\/|accommodation\/)/.test(pathname))return null;
  const profile=user?.role==='Admin'?'/admin':user?.role==='Property Manager'?'/manager':user?'/tenant':'/login';
  const tabs=[{to:'/',label:'Home',icon:Home},{to:user?.role==='Student'?'/student-housing':'/properties',label:'Explore',icon:Search},{to:'/wishlist',label:'Saved',icon:Heart},...(user?.role==='Student'?[{to:'/tenant?tab=My%20Applications',label:'Applications',icon:FileText}]:[]),{to:profile,label:user?'Profile':'Login',icon:User}];
  return <nav className="mobile-bottom-nav" aria-label="Mobile shortcuts"><div>{tabs.map(({to,label,icon:Icon})=>{const active=to.includes('?')?pathname+search===to:pathname===to&&!(label==='Profile'&&search.includes('Applications'));return <Link key={label} to={to} aria-current={active?'page':undefined}>{active&&<motion.span layoutId="mobile-nav-active" className="mobile-tab-indicator" transition={{type:'spring',stiffness:400,damping:32}}/>}<Icon/><span>{label}</span></Link>;})}</div></nav>;
}
