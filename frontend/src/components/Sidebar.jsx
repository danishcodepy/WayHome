import {Link,useNavigate} from 'react-router-dom';
import {LogOut,ArrowUpRight} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
export default function Sidebar({title,links,activeTab,onTabChange}){
 const {user,logout}=useAuth();const navigate=useNavigate();
 return <aside className="dashboard-sidebar"><div className="sidebar-user"><span className="avatar">{user?.name?.slice(0,1)||'U'}</span><div><strong>{user?.name||'My account'}</strong><small>{title||user?.role}</small></div></div><nav className="dashboard-nav" aria-label="Workspace navigation">{links.map(({label,icon:Icon,to})=>to&&to!=='#'?<Link key={label} to={to}><Icon/>{label}</Link>:<button key={label} onClick={()=>onTabChange?.(label)} className={activeTab===label?'active':''} aria-current={activeTab===label?'page':undefined}><Icon/>{label}</button>)}</nav><div className="sidebar-help"><strong>A place for your next chapter.</strong><p>Explore homes, save favourites and find your fit.</p><Link to="/properties">Explore properties </Link></div><button className="sidebar-logout" onClick={()=>{logout();navigate('/login');}}><LogOut size={16}/> Log out</button></aside>;
}
