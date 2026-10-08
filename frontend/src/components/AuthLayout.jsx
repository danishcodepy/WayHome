import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck,ArrowLeft } from 'lucide-react';
import Brand from './Brand';
export default function AuthLayout({children,registering=false}){
 return <main className={`auth-layout ${registering?'register':''}`} id="main-content"><div className="auth-visual"><img src="/assets/reference/living-room-hero.webp" alt="Comfortable living room with natural light"/><div className="auth-image-shade"/><div className="auth-brand"><Brand/></div><div className="auth-story"><span className="eyebrow">BETTER PLACES. BRIGHTER FUTURES.</span><h1>Find your perfect<br/>place to call home.</h1><p>Verified homes.<br/>Simple applications.<br/>Everything in one place.</p><span className="auth-footnote"><ShieldCheck size={17}/> Homes, studios & student accommodation</span></div></div><section className="auth-form-side"><div className="auth-top-link">{registering?'Already have an account?':'New to WayHome?'} <Link to={registering?'/login':'/register'}>{registering?'Sign in':'Create account'}</Link></div><motion.div className="auth-form-container" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.45}}>{children}</motion.div><Link className="auth-back-link" to="/"><ArrowLeft size={13}/> Back to home</Link></section></main>;
}
