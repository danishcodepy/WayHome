import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { LocateFixed, Star } from 'lucide-react';
import L from 'leaflet';
import { PriceDisplay } from './Pricing';
import { isDemo } from '../services/api.js';
import 'leaflet/dist/leaflet.css';

const homeIcon = (active, student = false) => L.divIcon({
  className: 'property-map-icon',
  html: `<div class="map-pin ${student ? 'map-pin--student' : ''} ${active ? 'map-pin--active' : ''}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/></svg></div>`,
  iconSize: [36,36], iconAnchor: [18,36], popupAnchor: [0,-32],
});
const campusIcon = L.divIcon({ className:'property-map-icon', html:'<div class="campus-map-pin">🎓</div>', iconSize:[36,36], iconAnchor:[18,18] });

function Viewport({ items, selected, campus, onBounds, onMove, fit }) {
  const map=useMap(), userMoved=useRef(false), reduced=useReducedMotion();
  const signature=items.map(p=>`${p.id}:${p.lat}:${p.lng}`).join(',');
  useEffect(()=>{
    if(!fit) return;
    userMoved.current=false;
    const points=items.map(p=>[p.lat,p.lng]);
    if(campus) points.push([campus.lat,campus.lng]);
    if(points.length===1) map.setView(points[0],14,{animate:false});
    else if(points.length) map.fitBounds(points,{padding:[50,50],maxZoom:14,animate:false});
  },[signature,campus?.lat,campus?.lng,fit,map]);
  useEffect(()=>{
    const item=items.find(p=>p.id===selected);
    if(item) { userMoved.current=false; map.flyTo([item.lat,item.lng],Math.max(13,map.getZoom()),{duration:reduced?0:.4}); }
  },[selected,map,reduced]);
  useMapEvents({ dragstart:()=>{userMoved.current=true;}, moveend:()=>{if(userMoved.current){onMove();userMoved.current=false;}} });
  useEffect(()=>{
    onBounds.current=()=>map.getBounds();
    const element=map.getContainer();
    const intent=event=>{
      if(event.type==='wheel'||event.type==='dblclick'||event.target.closest('.leaflet-control-zoom')||['+','-','=','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)) userMoved.current=true;
    };
    ['wheel','dblclick','pointerdown','keydown'].forEach(type=>element.addEventListener(type,intent));
    const observer=new ResizeObserver(()=>map.invalidateSize({pan:false})); observer.observe(element);
    return ()=>{observer.disconnect();['wheel','dblclick','pointerdown','keydown'].forEach(type=>element.removeEventListener(type,intent));};
  },[map,onBounds]);
  return null;
}
function HomeMarker({ property:p, selected, highlighted, onSelect }) {
  const ref=useRef(null);
  useEffect(()=>{if(selected)ref.current?.openPopup();},[selected]);
  return <Marker ref={ref} position={[p.lat,p.lng]} icon={homeIcon(selected||highlighted,String(p.id).startsWith('a'))} title={p.name} eventHandlers={{click:()=>onSelect?.(p.id)}}><Popup minWidth={240} maxWidth={260}><div className="map-popup"><img src={p.image} alt={p.name}/><h3>{p.name}</h3><p>{p.location||p.city}{p.distanceKm!=null?` · ${p.distanceKm} km to campus`:''}</p><PriceDisplay property={p} className="map-popup-price"/>{p.rating&&<span className="property-rating"><Star size={13} fill="currentColor"/>{p.rating.toFixed(1)}</span>}<br/><Link to={`/${String(p.id).startsWith('a')?'accommodation':'property'}/${p.id}`}>View details →</Link></div></Popup></Marker>;
}
export default function PropertyMap({ items=[], selected, highlighted, onSelect, onSearchArea, campus, small=false }) {
  const visible=items.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lng));
  const validCampus=campus&&Number.isFinite(campus.lat)&&Number.isFinite(campus.lng)?campus:null;
  const bounds=useRef(null), [moved,setMoved]=useState(false), [error,setError]=useState(false);
  const first=validCampus||visible[0];
  useEffect(()=>setMoved(false),[items.map(p=>p.id).join(',')]);
  return <div className="map-shell"><MapContainer center={first?[first.lat,first.lng]:[28.573,77.36]} zoom={13} zoomControl={!small} scrollWheelZoom={!small} dragging={!small} doubleClickZoom={!small} keyboard={!small}><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' eventHandlers={{tileerror:()=>setError(true),tileload:()=>setError(false)}}/><Viewport items={visible} selected={selected} campus={validCampus} fit={!small} onBounds={bounds} onMove={()=>setMoved(true)}/>{visible.map(p=><HomeMarker key={p.id} property={p} selected={p.id===selected} highlighted={p.id===highlighted} onSelect={onSelect}/>)}{validCampus&&<Marker position={[validCampus.lat,validCampus.lng]} icon={campusIcon} title={validCampus.name}><Popup><strong>{validCampus.name}</strong><p>Your campus · approximate location</p></Popup></Marker>}</MapContainer><AnimatePresence>{onSearchArea&&moved&&<motion.button initial={{opacity:0,x:'-50%',y:-8}} animate={{opacity:1,x:'-50%',y:0}} exit={{opacity:0,x:'-50%',y:-6}} className="outline-button map-search-area" onClick={()=>{onSearchArea(bounds.current?.());setMoved(false);}}><LocateFixed size={15}/>Search this area</motion.button>}</AnimatePresence><span className="map-attribution-note">Approximate locations · {isDemo ? 'Demo listings' : 'Live listings'}</span>{error&&<div className="map-error">Map tiles couldn’t load. Check your connection; you can still browse the listings.</div>}</div>;
}
