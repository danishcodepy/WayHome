import {Link} from 'react-router-dom';
import {Bell} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import {isDemo} from '../services/api';
export default function Workspace({children,links,tab,setTab,title,subtitle,actions,role}){
 return <><Navbar/><div className="dashboard-shell"><Sidebar title={role} links={links} activeTab={tab} onTabChange={setTab}/><main id="main-content" className="dashboard-main"><nav className="dashboard-mobile-tabs" aria-label="Workspace sections">{links.map(({label,icon:Icon,to})=>to&&to!=='#'?<Link className="outline-button" key={label} to={to}><Icon size={14}/>{label}</Link>:<button key={label} onClick={()=>setTab(label)} className={tab===label?'active':''}><Icon size={14}/>{label}</button>)}</nav><div className="dashboard-heading"><div><h1>{title||tab}</h1><p>{subtitle||'Everything you need for your next move, in one place.'}</p></div>{actions&&<div className="dashboard-heading-actions">{actions}</div>}</div>{children}{isDemo&&<p className="workspace-demo-note">Demo workspace · Sample records and changes saved on this device.</p>}</main></div></>;
}
