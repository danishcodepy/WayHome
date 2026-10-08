import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GitCompareArrows, X } from 'lucide-react';
import { getCompareList, subscribeCompare, clearCompare, COMPARE_MAX } from '../utils/compare';
import { useToast } from '../context/ToastContext';
export default function CompareTray() {
  const [ids,setIds]=useState(getCompareList), reduced=useReducedMotion(), toast=useToast();
  useEffect(()=>subscribeCompare(setIds),[]);
  return <div className="compare-tray fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-40"><AnimatePresence>{!!ids.length && <motion.div initial={{opacity:0,y:reduced?0:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:20}} transition={{duration:.22}} className="flex items-center gap-3 bg-navy text-white rounded-xl shadow-xl pl-5 pr-3 py-3"><GitCompareArrows size={19}/><p className="text-sm font-semibold whitespace-nowrap">{ids.length} selected <span className="text-white/60 font-normal">· max {COMPARE_MAX}</span></p><Link className="primary-button" to="/compare">Compare</Link><button className="p-2 text-white/70" aria-label="Clear comparison" onClick={()=>{try{clearCompare();toast('Comparison cleared');}catch{toast('Could not update device storage','error');}}}><X size={17}/></button></motion.div>}</AnimatePresence></div>;
}
