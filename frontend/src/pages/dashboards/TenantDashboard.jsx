import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Heart, FileText, MessageSquare, LayoutDashboard, Search, Bell, Settings, ScrollText, CheckCheck, Download, ArrowRight, Save, Star, GraduationCap, History, Building2, Home } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { formatPrice } from '../../utils/price';
import Workspace from '../../components/Workspace';
import StatCard from '../../components/StatCard';
import PropertyCard from '../../components/PropertyCard';
import AccommodationCard from '../../components/AccommodationCard';
import ApplicationTable from '../../components/ApplicationTable';
import { useAuth } from '../../context/AuthContext';
import { api, isDemo } from '../../services/api';
import { getWishlist, subscribeWishlist } from '../../utils/wishlist';
import { getSavedAcc, subscribeSavedAcc } from '../../utils/storage';
import { accommodations } from '../../data/universities';

const STUDENT_LINKS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Student Housing', icon: GraduationCap, to: '/student-housing' },
  { label: 'Saved Accommodations', icon: Heart },
  { label: 'My Applications', icon: FileText },
  { label: 'Agreements', icon: ScrollText },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Notifications', icon: Bell },
  { label: 'Settings', icon: Settings }
];

const TENANT_LINKS = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Property Search', icon: Search, to: '/properties' },
  { label: 'Saved Properties', icon: Heart },
  { label: 'My Applications', icon: FileText },
  { label: 'Agreements', icon: ScrollText },
  { label: 'Rental History', icon: History },
  { label: 'Messages', icon: MessageSquare },
  { label: 'Notifications', icon: Bell },
  { label: 'Settings', icon: Settings }
];

export default function TenantDashboard() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const isStudent = user?.role === 'Student';
  const links = isStudent ? STUDENT_LINKS : TENANT_LINKS;

  const tab = links.some(l => l.label === params.get('tab')) ? params.get('tab') : 'Dashboard';
  const setTab = t => setParams(t === 'Dashboard' ? {} : { tab: t }, { replace: true });
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [applications, setApplications] = useState([]);
  const [agreements, setAgreements] = useState([]);
  const [threads, setThreads] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState(null);
  const [saved, setSaved] = useState(getWishlist);
  const [accIds, setAccIds] = useState(getSavedAcc);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [profile, setProfile] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let live = true;
    Promise.all([
      api.getProperties(),
      api.getApplications(),
      api.getAgreements(),
      api.getThreads(),
      api.getNotifications(),
      api.getRentalHistory()
    ]).then(([p, a, g, t, n, h]) => {
      if (!live) return;
      setProperties(p.filter(x => x.status === 'Approved'));
      setApplications(a.filter(x => !isDemo || !x.applicantEmail || x.applicantEmail === user.email));
      setAgreements(g);
      setThreads(t);
      setNotifications(n);
      setHistory(h);
    }).catch(() => {
      if (live) setError('Some workspace data couldn’t load. Please refresh to try again.');
    }).finally(() => {
      if (live) setLoading(false);
    });
    return () => { live = false; };
  }, [user.email]);

  useEffect(() => subscribeWishlist(setSaved), []);
  useEffect(() => subscribeSavedAcc(setAccIds), []);

  const savedProps = properties.filter(p => saved.includes(p.id));
  const savedAcc = accommodations.filter(a => accIds.includes(a.id));
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const sync = event => {
      if (event.detail?.key === 'notifications') api.getNotifications().then(setNotifications).catch(() => {});
    };
    window.addEventListener('reh:demo-update', sync);
    return () => window.removeEventListener('reh:demo-update', sync);
  }, []);

  const markRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(n => n.map(x => ({ ...x, read: true })));
    } catch {
      setError('Could not update notifications. Please try again.');
    }
  };

  const saveProfile = async e => {
    e.preventDefault();
    setNotice('');
    try {
      await api.updateUser(user.id, profile);
      updateProfile(profile);
      toast('Profile updated');
    } catch {
      setError('Could not save your profile. Please try again.');
    }
  };

  const download = a => {
    const content = `WayHome — DEMO AGREEMENT SUMMARY\nNot a signed legal agreement.\n\nProperty: ${a.propertyName}\nTenant: ${a.tenantName}\nOwner: ${a.ownerName}\nMonthly rent: INR ${a.monthlyRent}\nTerm: ${a.startDate} to ${a.endDate}\nStatus: ${a.status}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const el = document.createElement('a');
    el.href = url;
    el.download = `demo-agreement-${a.id}.txt`;
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const heading = tab === 'Dashboard' ? (isStudent ? 'Student Dashboard' : 'Tenant Dashboard') : tab;

  return (
    <Workspace
      links={links}
      tab={tab}
      setTab={setTab}
      title={heading}
      role={isStudent ? 'Student' : 'Tenant'}
      subtitle={tab === 'Dashboard' ? `Welcome back, ${user.name.split(' ')[0]}!` : undefined}
      actions={
        <>
          <form className="browse-search" onSubmit={e => {
            e.preventDefault();
            navigate(isStudent ? `/student-housing?university=${encodeURIComponent(q)}` : `/properties?location=${encodeURIComponent(q)}`);
          }}>
            <Search size={14} />
            <input
              aria-label="Search dashboard properties"
              placeholder={isStudent ? "Search universities, student housing…" : "Search properties, locations…"}
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </form>
          <button className="round-control" aria-label="View notifications" onClick={() => setTab('Notifications')}>
            <Bell size={17} />
          </button>
        </>
      }
    >
      {error && <p className="form-error mb-6" role="alert">{error}</p>}
      {loading ? (
        <div className="skeleton" aria-label="Loading workspace" />
      ) : (
        <>
          {tab === 'Dashboard' && (
            <>
              <div className="dashboard-metrics">
                <StatCard
                  icon={Heart}
                  label={isStudent ? "Saved Accommodations" : "Saved Properties"}
                  value={isStudent ? savedAcc.length : savedProps.length}
                  accent="red"
                />
                <StatCard icon={FileText} label="Applications" value={applications.length} accent="green" />
                <StatCard
                  icon={isStudent ? GraduationCap : Star}
                  label={isStudent ? "Student Housing" : "Available Homes"}
                  value={isStudent ? accommodations.length : properties.length}
                  accent="orange"
                />
                <StatCard icon={MessageSquare} label="Messages" value={threads.length} />
              </div>

              <div className="dashboard-section-heading">
                <h2>{isStudent ? 'Recommended Student Living & Campus Spaces' : 'Recommended Residential Properties'}</h2>
                <Link to={isStudent ? '/student-housing' : '/properties'}>View all</Link>
              </div>
              <div className="dashboard-property-row">
                {isStudent
                  ? accommodations.filter(a => a.referenceImage).slice(0, 4).map(a => (
                      <AccommodationCard key={a.id} acc={a} />
                    ))
                  : properties.filter(p => p.listingFor !== 'buy').slice(0, 4).map(p => (
                      <PropertyCard key={p.id} property={p} />
                    ))}
              </div>

              <div className="dashboard-section-heading">
                <h2>Recent Applications</h2>
                <button onClick={() => setTab('My Applications')}>View All</button>
              </div>
              <ApplicationTable applications={applications.slice(0, 4)} />
            </>
          )}

          {(tab === 'Saved Properties' || tab === 'Saved Accommodations') && (
            (isStudent ? savedAcc.length : savedProps.length) ? (
              <div className="premium-property-grid">
                {isStudent
                  ? savedAcc.map(a => <AccommodationCard acc={a} key={a.id} />)
                  : savedProps.map(p => <PropertyCard property={p} key={p.id} />)}
              </div>
            ) : (
              <div className="empty-panel">
                <Heart size={32} />
                <h2>Your shortlist starts here</h2>
                <p>Tap the heart on any {isStudent ? 'student accommodation' : 'home'} to save it for later.</p>
                <Link to={isStudent ? "/student-housing" : "/properties"} className="primary-button">
                  {isStudent ? "Explore student housing" : "Explore properties"}
                </Link>
              </div>
            )
          )}

          {tab === 'My Applications' && <ApplicationTable applications={applications} />}

          {tab === 'Messages' && (
            <div className="notifications-list">
              {threads.map(t => (
                <Link className="notification-item" to={`/chat?thread=${t.id}`} key={t.id}>
                  <span className="avatar">{(t.with || t.name)?.slice(0, 1)}</span>
                  <div>
                    <h3>{t.with || t.name}</h3>
                    <p>{t.messages.at(-1)?.text || 'Start your conversation'}</p>
                    <small>{t.messages.at(-1)?.time}</small>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {tab === 'Notifications' && (
            <>
              <div className="dashboard-section-heading">
                <h2>{unread} unread notifications</h2>
                <button onClick={markRead}>
                  <CheckCheck size={14} className="inline mr-1" /> Mark all read
                </button>
              </div>
              <div className="notifications-list">
                {notifications.map(n => (
                  <article key={n.id} className={`notification-item ${n.read ? 'read' : ''}`}>
                    <Bell size={19} />
                    <div>
                      <h3>{n.title}</h3>
                      <p>{n.message}</p>
                      <small>{n.time}</small>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === 'Rental History' && (
            <section>
              <div className="dashboard-section-heading">
                <div>
                  <h2>Rental History</h2>
                  <p>Your persisted applications and agreements from the database.</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-white border rounded-xl p-5">
                  <h3 className="font-semibold">Active agreements</h3>
                  {(history?.activeAgreements || []).map(a => (
                    <div className="border-b py-3" key={a.id}>
                      <strong>{a.property?.title || a.property?.name || 'Property'}</strong>
                      <p>{a.startDate} — {a.endDate} · {formatPrice(a.monthlyRent)}/month</p>
                    </div>
                  ))}
                  {!(history?.activeAgreements || []).length && (
                    <p className="text-sm text-slate-500 mt-3">No active agreement.</p>
                  )}
                </div>
                <div className="bg-white border rounded-xl p-5">
                  <h3 className="font-semibold">Past agreements</h3>
                  {(history?.pastAgreements || []).map(a => (
                    <div className="border-b py-3" key={a.id}>
                      <strong>{a.property?.title || a.property?.name || 'Property'}</strong>
                      <p>{a.startDate} — {a.endDate} · {a.status}</p>
                    </div>
                  ))}
                  {!(history?.pastAgreements || []).length && (
                    <p className="text-sm text-slate-500 mt-3">No past agreement.</p>
                  )}
                </div>
              </div>
              <div className="bg-white border rounded-xl p-5 mt-5">
                <h3 className="font-semibold">Application history</h3>
                {(history?.applicationHistory || []).map(a => (
                  <div className="border-b py-3" key={a.id}>
                    <strong>{a.property?.title || a.property?.name || 'Property'}</strong>
                    <p>{a.appliedAt ? new Date(a.appliedAt).toLocaleString('en-IN') : ''} · {a.status}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === 'Agreements' && (
            <div className="notifications-list">
              {agreements.map(a => (
                <article className="notification-item" key={a.id}>
                  <ScrollText size={23} />
                  <div>
                    <h3>{a.propertyName}</h3>
                    <p>{a.startDate} — {a.endDate} · {formatPrice(a.monthlyRent)}/month</p>
                    <small>{a.tenantName} · {a.ownerName}</small>
                    <span className={`status-pill ${a.status} mt-3`}>{a.status}</span>
                  </div>
                  <button className="outline-button ml-auto self-start" onClick={() => download(a)}>
                    <Download size={14} />
                    <span className="hidden sm:inline">Demo summary</span>
                  </button>
                </article>
              ))}
            </div>
          )}

          {tab === 'Settings' && (
            <section className="settings-panel">
              <h2>Your profile</h2>
              {notice && <p className="form-notice mb-5" role="status">{notice}</p>}
              <form className="premium-form" onSubmit={saveProfile}>
                {[
                  ['name', 'Full name', 'text'],
                  ['email', 'Email address', 'email'],
                  ['phone', 'Phone number', 'tel']
                ].map(([k, label, type]) => (
                  <label key={k}>
                    {label}
                    <input
                      type={type}
                      required={k !== 'phone'}
                      value={profile[k]}
                      onChange={e => setProfile({ ...profile, [k]: e.target.value })}
                    />
                  </label>
                ))}
                <button className="primary-button">
                  <Save size={15} /> Save changes
                </button>
              </form>
            </section>
          )}
        </>
      )}
    </Workspace>
  );
}
