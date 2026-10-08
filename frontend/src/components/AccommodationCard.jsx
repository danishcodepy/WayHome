import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Heart, MapPin, Star, Wifi, ShieldCheck, Utensils, ArrowUpRight, GitCompareArrows, Check } from 'lucide-react';
import { isSavedAcc, toggleSavedAcc, subscribeSavedAcc } from '../utils/storage';
import { useToast } from '../context/ToastContext';
import { PriceDisplay } from './Pricing';
import { isCompared,toggleCompare,subscribeCompare } from '../utils/compare';
export function formatDist(a){ return a.distanceKm<1?`${Math.round(a.distanceKm*1000)}m from campus`:`${a.distanceKm} km from campus`; }
export default function AccommodationCard({acc}){
 const toast=useToast();const [compared,setCompared]=useState(()=>isCompared(acc.id));useEffect(()=>subscribeCompare(ids=>setCompared(ids.map(String).includes(String(acc.id)))),[acc.id]);
 const [saved,setSaved]=useState(()=>isSavedAcc(acc.id));useEffect(()=>subscribeSavedAcc(ids=>setSaved(ids.map(String).includes(String(acc.id)))),[acc.id]);
 const save=()=>{try{const next=toggleSavedAcc(acc.id);setSaved(next);toast(next?'Student home saved':'Student home removed');}catch{toast('Could not save on this device','error');}};
 const compare=()=>{try{const result=toggleCompare(acc.id);toast(!result.added?'Compare up to 3 homes. Remove one to add this room.':compared?'Removed from comparison':'Added to comparison',!result.added?'error':'success');}catch{toast('Could not update comparison','error');}};
 return <article className="home-card student-home-card"><div className="home-card-photo"><Link to={`/accommodation/${acc.id}`} aria-label={`View ${acc.name}`} tabIndex={-1}><img src={acc.image} alt={acc.name} loading="lazy" width="600" height="360"/></Link><button className={`save-home ${saved?'is-saved':''}`} aria-label={`${saved?'Unsave':'Save'} ${acc.name}`} aria-pressed={saved} onClick={save}><Heart size={17} fill={saved?'currentColor':'none'}/></button></div><div className="home-card-body"><h3><Link to={`/accommodation/${acc.id}`}>{acc.name}</Link></h3><p className="home-card-location">{formatDist(acc).replace('campus', acc.university)}</p><PriceDisplay property={acc}/><div className="home-card-bottom"><span className="property-rating"><Star size={13} fill="currentColor"/>{acc.rating?.toFixed(1)}<small>{acc.reviewCount ? `(${acc.reviewCount})` : acc.roomType}</small></span><button type="button" className="compare-home" aria-label={`${compared?'Remove':'Add'} ${acc.name} ${compared?'from':'to'} comparison`} aria-pressed={compared} onClick={compare}>{compared?<Check size={16}/>:<GitCompareArrows size={16}/>}</button></div></div></article>;
}
