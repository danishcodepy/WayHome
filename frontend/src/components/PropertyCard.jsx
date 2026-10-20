import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BedDouble, Bath, Heart, GitCompareArrows, Check, BadgeCheck, Ruler, Star, MapPin } from 'lucide-react';
import { isWishlisted, toggleWishlist, subscribeWishlist } from '../utils/wishlist.js';
import { isCompared, toggleCompare, subscribeCompare, COMPARE_MAX } from '../utils/compare.js';
import { useToast } from '../context/ToastContext';
import { PriceDisplay } from './Pricing';
import { reviews } from '../data/reviews';
export default function PropertyCard({ property, compact = false, preview = false }) {
  const toast=useToast();
  const reduced=useReducedMotion();
  const [saved,setSaved]=useState(()=>isWishlisted(property.id)); const [compared,setCompared]=useState(()=>isCompared(property.id));
  useEffect(()=>subscribeWishlist(ids=>setSaved(ids.includes(String(property.id)))),[property.id]);
  useEffect(()=>subscribeCompare(ids=>setCompared(ids.includes(String(property.id)))),[property.id]);
  const ratings=reviews.filter(r=>r.propertyId===property.id); const rating=ratings.length?(ratings.reduce((s,r)=>s+r.rating,0)/ratings.length).toFixed(1):null;
  const CardLink=preview?'span':Link;
  const cardLinkProps=preview?{}:{to:`/property/${property.id}`};
  const sale=property.listingFor==='buy';
  const save=()=>{try{const next=toggleWishlist(property.id).includes(String(property.id));setSaved(next);toast(next?'Property saved':'Property removed from saved homes');}catch{toast('Could not save on this device','error');}};
  const compare=()=>{try{const r=toggleCompare(property.id);setCompared(r.ids.includes(String(property.id)));toast(!r.added?`Compare up to ${COMPARE_MAX} homes. Remove one to add this home.`:compared?'Removed from comparison':'Added to comparison',!r.added?'error':'success');}catch{toast('Could not update comparison','error');}};
  return <motion.article
    className={`home-card ${compact?'compact-home':''}`}
    whileHover={reduced ? undefined : { y: -2 }}
    whileTap={reduced ? undefined : { scale: 0.998 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
  ><div className="home-card-photo"><CardLink {...cardLinkProps} aria-label={`View ${property.name}`} tabIndex={-1}><img src={property.image || '/assets/marketplace/studio.webp'} alt={property.name} loading="lazy" width="600" height="360"/></CardLink><span className={`photo-tag ${property.verified?'verified':'student-tag'}`}>{property.verified?<BadgeCheck size={12}/>:<MapPin size={12}/>} {property.verified?'Verified':property.type}</span>{!preview&&<motion.button
          type="button"
          className={`save-home ${saved?'is-saved':''}`}
          onClick={save}
          whileTap={reduced ? undefined : { scale: 0.88 }}
          transition={{ duration: 0.18, ease: 'easeOut' }} aria-label={`${saved?'Unsave':'Save'} ${property.name}`} aria-pressed={saved}><Heart size={17} fill={saved?'currentColor':'none'}/></motion.button>}</div><div className="home-card-body"><h3><CardLink {...cardLinkProps}>{property.name}</CardLink></h3><p className="home-card-location">{property.location}</p><PriceDisplay property={property}/><div className="home-card-details">{property.bedrooms ? <span><BedDouble size={13}/>{property.bedrooms} Beds</span> : null}{property.bathrooms ? <span><Bath size={13}/>{property.bathrooms} Baths</span> : null}{property.area ? <span><Ruler size={13}/>{Number(property.area).toLocaleString('en-IN')} sq.ft.</span> : null}{property.floor ? <span>{property.floor}</span> : null}</div><div className="home-card-bottom">{property.furnishing ? <span className="property-kind">{property.type} · {property.furnishing}</span> : rating ? <span className="property-rating"><Star size={13} fill="currentColor"/>{rating}<small>({ratings.length} reviews)</small></span> : <span className="property-kind">{property.type}</span>}{!preview&&<button type="button" className={`compare-home ${compared?'is-compared':''}`} onClick={compare} aria-label={`${compared?'Remove':'Add'} ${property.name} ${compared?'from':'to'} comparison`} aria-pressed={compared} title="Compare property">{compared?<Check size={15}/>:<GitCompareArrows size={15}/>}<span className="sr-only">Compare</span></button>}</div></div></motion.article>;
}
