import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import useFloatingPanel from '../hooks/useFloatingPanel';
export default function NotificationBell() {
  const [open,setOpen]=useState(false), [items,setItems]=useState([]), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  const trigger=useRef(null),panel=useRef(null),{user}=useAuth(),toast=useToast(),reduced=useReducedMotion();
  const close=(restore=true)=>{setOpen(false);if(restore)trigger.current?.focus();};
  const position=useFloatingPanel(open,trigger,panel,close,350);
  useEffect(()=>{if(open&&position.visibility==='visible')panel.current?.querySelector('button:not([disabled]),a')?.focus();},[open,position.visibility]);
  useEffect(()=>{let live=true;const load=()=>api.getNotifications().then(data=>{if(live){setItems(data);setError('');}}).catch(()=>{if(live)setError('Notifications could not load.');});load();const update=event=>{if(event.detail?.key==='notifications')load();};window.addEventListener('reh:demo-update',update);return()=>{live=false;window.removeEventListener('reh:demo-update',update);};},[]);
  const unread=items.filter(item=>!item.read).length;
  const markAll=async()=>{setBusy(true);try{await api.markNotificationsRead();setItems(list=>list.map(item=>({...item,read:true})));toast('All notifications marked as read');}catch{toast('Could not update notifications','error');}finally{setBusy(false);}};
  const destination=user?.role==='Admin'?'/admin':user?.role==='Property Manager'?'/manager':'/tenant?tab=Notifications';
  return <><button ref={trigger} type="button" className="round-control notification-trigger" aria-label={`Notifications${unread?`, ${unread} unread`:''}`} aria-expanded={open} aria-haspopup="dialog" onClick={()=>setOpen(!open)}><Bell size={19}/>{unread>9?<span className="notification-count">9+</span>:unread>0?<span className="notification-dot"/>:null}</button>{createPortal(<AnimatePresence>{open&&<motion.div ref={panel} data-overlay-panel role="dialog" aria-label="Notifications" className="ui-popover-panel notification-popover" style={position} initial={{opacity:0,y:reduced?0:-5,scale:reduced?1:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:reduced?0:-5}} transition={{duration:.18}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){const items=[...panel.current.querySelectorAll('button:not([disabled]),a')];if(e.shiftKey&&document.activeElement===items[0]||!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();close();}}}}><header><strong>Notifications</strong><button disabled={busy||!unread} onClick={markAll}><CheckCheck size={13} className="inline mr-1"/>Mark all read</button></header><div className="notification-popover-list">{error?<p role="alert">{error}</p>:items.length?items.map(item=><article key={item.id} className={item.read?'':'is-unread'}><h3>{item.title}</h3><p>{item.message}</p><small>{item.time}</small></article>):<p className="py-6">You’re all caught up.</p>}</div><Link to={destination} onClick={()=>close(false)}>View your workspace →</Link></motion.div>}</AnimatePresence>,document.body)}</>;
}
