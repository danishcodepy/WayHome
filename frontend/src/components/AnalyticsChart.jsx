import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import Select from './Select';

/** Accessible chart: each bar exposes its exact value on hover and keyboard focus. */
export default function AnalyticsChart({ title, subtitle, data, unit='', ranges=true }) {
  const [range,setRange]=useState('6'), [active,setActive]=useState(null), id=useId();
  const shown=ranges?data.slice(-Number(range)):data;
  const maximum=Math.max(1,...shown.map(point=>point.value));
  const total=shown.reduce((sum,point)=>sum+point.value,0);
  return <section className="analytics-card"><div className="analytics-heading"><h3>{title}</h3>{ranges&&<Select aria-label={`${title} date range`} value={range} onChange={value=>{setRange(value);setActive(null);}} options={[{value:'3',label:'3 months'},{value:'6',label:'6 months'},{value:'12',label:'12 months'}]}/>}</div><p>{subtitle}</p><strong className="analytics-total">{total.toLocaleString('en-IN')}<small>{unit||'total'}</small></strong><div className="analytics-chart" role="group" aria-label={title}>{shown.map((point,index)=><div className="analytics-column" key={point.label}><button type="button" className={`analytics-bar ${active===index?'analytics-bar--active':''}`} style={{height:`${Math.max(3,point.value/maximum*100)}%`}} aria-label={`${point.label}: ${point.value} ${unit}`} aria-describedby={active===index?`${id}-tip`:undefined} onMouseEnter={()=>setActive(index)} onMouseLeave={()=>setActive(null)} onFocus={()=>setActive(index)} onBlur={()=>setActive(null)}><motion.span initial={{scaleY:0}} animate={{scaleY:1}} transition={{duration:.35,delay:index*.025}}/>{active===index&&<span className="analytics-tooltip" id={`${id}-tip`} role="tooltip">{point.label}: {point.value.toLocaleString('en-IN')}</span>}</button><small>{point.label}</small></div>)}</div></section>;
}
