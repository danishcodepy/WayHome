import {motion} from 'framer-motion';
export default function StatCard({icon:Icon,label,value,accent='blue'}){return <motion.div className="stat-card" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:.3}}><span className={`stat-icon ${accent}`}><Icon size={22} strokeWidth={1.7}/></span><div><p>{label}</p><strong>{value}</strong></div></motion.div>;}
