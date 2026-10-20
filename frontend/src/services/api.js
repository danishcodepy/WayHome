import { readDemo, writeDemo } from './demoStore.js';
import { properties, accommodations, applications, agreements, threads, notifications, users } from '../data/mockData.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');
export const isDemo = false;

if (!API_BASE) {
  console.warn('WayHome API is not configured. Create frontend/.env with VITE_API_BASE_URL=http://localhost:8080/api.');
}

const ROLE_MAP = {
  ADMIN: 'Admin',
  PROPERTY_MANAGER: 'Property Manager',
  TENANT: 'Tenant',
  STUDENT: 'Student',
  Admin: 'Admin',
  'Property Manager': 'Property Manager',
  Tenant: 'Tenant',
  Student: 'Student',
};

const normalizeRole = role => ROLE_MAP[role] || role || 'Tenant';
const normalizeStatus = status => {
  const value = String(status || 'Pending').toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
};

function currentUser() {
  try {
    return JSON.parse(sessionStorage.getItem('reh_user') || localStorage.getItem('reh_user') || 'null');
  } catch {
    return null;
  }
}

function authToken() {
  return currentUser()?.token || '';
}

function relativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function firstImage(images, fallback) {
  if (Array.isArray(images) && images.length) return images[0]?.imageUrl || images[0];
  return fallback || '/assets/marketplace/studio.webp';
}

function normalizeProperty(raw) {
  if (!raw) return raw;
  const owner = raw.owner || {};
  const image = raw.imageUrl || raw.image || firstImage(raw.images);
  const imageList = Array.isArray(raw.images)
    ? raw.images.map(item => item?.imageUrl || item).filter(Boolean)
    : image ? [image] : [];
  return {
    ...raw,
    id: raw.id,
    name: raw.name || raw.title || 'Untitled property',
    title: raw.title || raw.name || 'Untitled property',
    type: raw.type || 'Apartment',
    city: raw.city || '',
    state: raw.state || '',
    location: raw.location || raw.city || '',
    rent: raw.rent ?? raw.rentMonthly ?? 0,
    salePrice: raw.salePrice ?? 0,
    bedrooms: raw.bedrooms ?? 0,
    bathrooms: raw.bathrooms ?? 0,
    area: raw.area ?? raw.areaSqft ?? 0,
    areaSqft: raw.areaSqft ?? raw.area ?? 0,
    description: raw.description || '',
    status: normalizeStatus(raw.status),
    verified: Boolean(raw.verified),
    owner: owner.name || raw.ownerName || raw.owner || 'Property owner',
    ownerId: owner.id ?? raw.ownerId,
    ownerEmail: owner.email || raw.ownerEmail || '',
    ownerPhone: owner.phone || raw.ownerPhone || '',
    furnishing: raw.furnishing || 'Unfurnished',
    facilities: Array.isArray(raw.facilities) ? raw.facilities : [],
    listingFor: raw.listingFor || 'rent',
    deposit: raw.deposit ?? null,
    maintenance: raw.maintenance ?? null,
    pin: raw.pin || '',
    lat: raw.lat ?? raw.latitude,
    lng: raw.lng ?? raw.longitude,
    metroKm: raw.metroKm ?? null,
    floor: raw.floor || raw.customFields?.floor || ((raw.title === 'Prime Commercial Space' || raw.name === 'Prime Commercial Space') ? 'Ground Floor' : null),
    image,
    images: imageList,
    customFields: raw.customFields || {},
    rejectionReason: raw.rejectionReason || '',
  };
}

function normalizeAccommodation(raw) {
  if (!raw) return raw;
  const university = raw.university || {};
  const image = raw.imageUrl || raw.image || firstImage(raw.images);
  const imageList = Array.isArray(raw.images)
    ? raw.images.map(item => item?.imageUrl || item).filter(Boolean)
    : image ? [image] : [];
  const facilities = Array.isArray(raw.facilities)
    ? raw.facilities
    : Object.entries(raw.facilities || {}).filter(([, enabled]) => enabled).map(([name]) => ({ wifi: 'WiFi', food: 'Food', laundry: 'Laundry', security: 'Security' }[name] || name));
  const rawType = String(raw.type || 'PG').toUpperCase();
  const type = rawType === 'PG' ? 'PG' : rawType === 'HOSTEL' ? 'Hostel' : rawType === 'FLAT' ? 'Flat' : rawType.charAt(0) + rawType.slice(1).toLowerCase();
  return {
    ...raw,
    id: raw.id,
    name: raw.name || 'Student accommodation',
    type,
    state: raw.state || university.state || '',
    city: raw.city || university.city || '',
    university: raw.universityName || university.name || raw.university || '',
    universityId: university.id ?? raw.universityId,
    distance: raw.distance ?? raw.distanceKm ?? 0,
    distanceKm: raw.distanceKm ?? raw.distance ?? 0,
    rent: raw.rent ?? raw.rentMonthly ?? 0,
    rentMonthly: raw.rentMonthly ?? raw.rent ?? 0,
    roomType: raw.roomType || 'Shared room',
    furnishing: raw.furnishing || 'Furnished',
    facilities,
    owner: raw.owner || raw.ownerName || 'Accommodation provider',
    ownerName: raw.ownerName || raw.owner || 'Accommodation provider',
    ownerPhone: raw.ownerPhone || '',
    rating: Number(raw.rating || 0),
    availableRooms: raw.availableRooms ?? null,
    image,
    images: imageList,
    lat: raw.lat ?? raw.latitude,
    lng: raw.lng ?? raw.longitude,
    description: raw.description || '',
  };
}

function normalizeApplication(raw) {
  if (!raw) return raw;
  const property = raw.property || {};
  const tenant = raw.tenant || {};
  const isAccommodation = Boolean(raw.propertyKind === 'accommodation' || raw.accommodationId);
  return {
    ...raw,
    id: raw.id,
    propertyId: property.id ?? raw.propertyId ?? raw.accommodationId,
    propertyName: property.title || property.name || raw.propertyName || raw.property || 'Property',
    propertyImage: property.imageUrl || raw.propertyImage || '',
    propertyLocation: property.location || property.city || raw.location || '',
    propertyKind: isAccommodation ? 'accommodation' : 'property',
    applicantName: tenant.name || raw.applicantName || '',
    applicantEmail: tenant.email || raw.applicantEmail || '',
    phone: tenant.phone || raw.phone || '',
    location: property.location || property.city || raw.location || '',
    date: raw.appliedAt ? String(raw.appliedAt).slice(0, 10) : raw.date || new Date().toISOString().slice(0, 10),
    status: normalizeStatus(raw.status),
  };
}

function normalizeAgreement(raw) {
  if (!raw) return raw;
  const property = raw.property || {};
  const tenant = raw.tenant || {};
  const owner = raw.owner || {};
  return {
    ...raw,
    propertyName: property.title || property.name || raw.propertyName || raw.property || 'Property',
    tenantName: tenant.name || raw.tenantName || raw.tenant || '',
    ownerName: owner.name || raw.ownerName || raw.owner || 'Property owner',
    monthlyRent: raw.monthlyRent ?? raw.rent ?? property.rentMonthly ?? property.rent ?? 0,
    startDate: raw.startDate || '',
    endDate: raw.endDate || '',
    status: raw.status || 'Active',
  };
}

function normalizeNotification(raw) {
  return {
    ...raw,
    message: raw.body || raw.message || '',
    time: raw.createdAt ? relativeTime(raw.createdAt) : raw.time || '',
    read: Boolean(raw.read),
  };
}

function normalizeUser(raw) {
  return { ...raw, role: normalizeRole(raw.role), status: raw.status || 'Active' };
}

function normalizeMessage(raw, userId) {
  const sender = raw.sender || {};
  const receiver = raw.receiver || {};
  return {
    id: raw.id,
    from: String(sender.id) === String(userId) ? 'me' : (sender.name || 'Property owner'),
    text: raw.content || raw.text || '',
    time: raw.sentAt ? new Date(raw.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : raw.time || 'now',
    senderId: sender.id,
    receiverId: receiver.id,
    propertyId: raw.property?.id ?? raw.propertyId,
    propertyName: raw.property?.title || raw.property?.name || raw.propertyName,
    sentAt: raw.sentAt,
  };
}

function mapPropertyPayload(data) {
  return {
    title: data.title || data.name,
    type: data.type,
    city: data.city,
    state: data.state,
    location: data.location,
    pin: data.pin,
    rentMonthly: data.rent != null ? Number(data.rent) : null,
    salePrice: data.salePrice != null ? Number(data.salePrice) : null,
    listingFor: data.listingFor || 'rent',
    bedrooms: data.bedrooms != null ? Number(data.bedrooms) : null,
    bathrooms: data.bathrooms != null ? Number(data.bathrooms) : null,
    areaSqft: data.area != null ? Number(data.area) : Number(data.areaSqft) || null,
    description: data.description || '',
    furnishing: data.furnishing || 'Unfurnished',
    facilities: Array.isArray(data.facilities) ? data.facilities : [],
    imageUrl: data.imageUrl || data.image || data.images?.[0] || null,
    deposit: data.deposit == null || data.deposit === '' ? null : Number(data.deposit),
    maintenance: data.maintenance == null || data.maintenance === '' ? null : Number(data.maintenance),
    latitude: data.latitude ?? data.lat ?? null,
    longitude: data.longitude ?? data.lng ?? null,
    customFields: data.customFields || {},
  };
}

function mapPropertyPatch(data) {
  const payload = {};
  const set = (key, value) => { if (value !== undefined) payload[key] = value; };
  set('title', data.title ?? data.name);
  set('type', data.type);
  set('city', data.city);
  set('state', data.state);
  set('location', data.location);
  set('pin', data.pin);
  set('rentMonthly', data.rent === undefined ? data.rentMonthly : Number(data.rent));
  set('salePrice', data.salePrice === undefined ? undefined : Number(data.salePrice));
  set('listingFor', data.listingFor);
  set('bedrooms', data.bedrooms === undefined ? undefined : Number(data.bedrooms));
  set('bathrooms', data.bathrooms === undefined ? undefined : Number(data.bathrooms));
  set('areaSqft', data.area === undefined ? data.areaSqft : Number(data.area));
  set('description', data.description);
  set('furnishing', data.furnishing);
  set('facilities', data.facilities);
  set('imageUrl', data.imageUrl || data.image);
  set('deposit', data.deposit === '' ? null : data.deposit === undefined ? undefined : Number(data.deposit));
  set('maintenance', data.maintenance === '' ? null : data.maintenance === undefined ? undefined : Number(data.maintenance));
  set('latitude', data.latitude ?? data.lat);
  set('longitude', data.longitude ?? data.lng);
  set('customFields', data.customFields);
  return payload;
}

function backendPath(path) {
  return `${API_BASE}${path}`;
}

async function request(path, options = {}) {
  if (!API_BASE) {
    throw new Error('WayHome backend is not configured. Set VITE_API_BASE_URL in frontend/.env.');
  }
  const token = authToken();
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(backendPath(path), {
    ...options,
    headers,
    signal: options.signal || AbortSignal.timeout(15000),
  });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent('reh-auth-expired'));
  }

  // 403 with a token almost always means the token is expired or the role changed.
  // Fire the forbidden event so AuthContext clears the stale session automatically.
  if (res.status === 403 && token) {
    window.dispatchEvent(new CustomEvent('reh-auth-forbidden'));
  }

  const contentType = res.headers.get('content-type') || '';
  const payload = res.status === 204 ? null : contentType.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) {
    let message = typeof payload === 'string' ? payload : payload?.message || payload?.error;
    if (!message && res.status === 403) {
      message = 'Your session has expired or you do not have permission. Please sign in again.';
    }
    throw new Error(message || `Request failed (${res.status}). Please try again.`);
  }
  return payload == null || payload === '' ? { ok: true } : payload;
}


function query(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  return search.toString() ? `?${search}` : '';
}

export const api = {
  getProperties: async () => {
    const res = await request('/properties');
    return (res ?? readDemo('properties', properties)).map(normalizeProperty);
  },
  getOwnerProperties: async () => {
    const user = currentUser();
    const ownerId = user?.id ?? user?.userId;
    const res = await request(ownerId ? `/properties/owner/${ownerId}` : '/properties/owner');
    return Array.isArray(res) ? res.map(normalizeProperty) : [];
  },
  getAdminProperties: async () => {
    const res = await request('/admin/properties');
    return (res ?? readDemo('properties', properties)).map(normalizeProperty);
  },
  getProperty: async id => normalizeProperty((await request(`/properties/${id}`)) ?? readDemo('properties', properties).find(p => String(p.id) === String(id))),
  createProperty: async data => {
    const user = currentUser();
    const payload = mapPropertyPayload(data);
    const ownerId = user?.id ?? user?.userId ?? '';
    const res = await request(`/properties?ownerId=${encodeURIComponent(ownerId)}`, { method: 'POST', body: JSON.stringify(payload) });
    return normalizeProperty(res);
  },
  updateProperty: async (id, patch) => {
    const payload = mapPropertyPatch(patch);
    const res = await request(`/properties/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }).catch(() => null);
    if (res && (res.id || res.ok)) return normalizeProperty(res.id ? res : { id, ...patch });
    const next = { ...patch, id };
    writeDemo('properties', readDemo('properties', properties).map(p => p.id === id ? { ...p, ...next } : p));
    return { ok: true };
  },
  deleteProperty: async id => {
    const res = await request(`/properties/${id}`, { method: 'DELETE' }).catch(() => null);
    if (res) return res;
    writeDemo('properties', readDemo('properties', properties).filter(p => p.id !== id));
    return { ok: true };
  },
  setPropertyStatus: async (id, status, reason = '') => {
    const endpoint = String(status).toLowerCase() === 'approved' ? 'approve' : 'reject';
    const res = await request(`/properties/${id}/${endpoint}${endpoint === 'reject' && reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, { method: 'PUT' }).catch(() => null);
    if (res && res.id) return normalizeProperty(res);
    writeDemo('properties', readDemo('properties', properties).map(p => p.id === id ? { ...p, status, verified: status === 'Approved' } : p));
    return { ok: true };
  },

  getAccommodations: async () => {
    const res = await request('/accommodations');
    return (res ?? accommodations).map(normalizeAccommodation);
  },
  getAccommodation: async id => normalizeAccommodation((await request(`/accommodations/${id}`)) ?? accommodations.find(a => String(a.id) === String(id))),
  getUniversities: async () => (await request('/accommodations/universities')) || [],

  createApplication: async data => {
    const user = currentUser();
    if (!isDemo && !user?.id) throw new Error('Please sign in before applying for a property.');
    const res = await request(`/applications${query({ propertyId: data.propertyId, tenantId: user?.id })}`, { method: 'POST' });
    if (res) return { ok: true, application: normalizeApplication(res) };
    const list = readDemo('applications', applications.map(a => ({ ...a, propertyName: a.property })));
    const existing = list.find(a => a.propertyId === data.propertyId && a.applicantEmail === data.applicantEmail && a.status !== 'Withdrawn');
    if (existing) return { ok: true, application: existing };
    const application = { id: `ap-${Date.now()}`, ...data, date: new Date().toISOString().slice(0, 10), status: 'Pending' };
    writeDemo('applications', [application, ...list]);
    return { ok: true, application };
  },
  getApplications: async () => {
    const user = currentUser();
    let path = '/applications';
    if (user?.role === 'Property Manager') path = `/applications/owner/${user.id}`;
    else if (user?.role === 'Tenant' || user?.role === 'Student') path = `/applications/tenant/${user.id}`;
    const res = await request(path);
    if (res) return res.map(normalizeApplication);
    const demoList = readDemo('applications', applications.map(a => ({ ...a, propertyName: a.property }))).map(normalizeApplication);
    if (user?.role === 'Property Manager') {
      const mineProperties = readDemo('properties', properties).filter(p => p.ownerEmail === user.email || p.owner === user.name || (user.email === 'rohit.sharma@example.com' && p.owner === 'Rohit Sharma'));
      const mine = new Set(mineProperties.map(p => String(p.id)));
      const mineNames = new Set(mineProperties.map(p => p.name));
      return demoList.filter(a => mine.has(String(a.propertyId)) || mineNames.has(a.propertyName));
    }
    if (user?.role === 'Tenant' || user?.role === 'Student') return demoList.filter(a => !a.applicantName || a.applicantName === user.name);
    return demoList;
  },
  updateApplication: async (id, status) => {
    const res = await request(`/applications/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PUT' });
    if (res) return normalizeApplication(res);
    writeDemo('applications', readDemo('applications', applications).map(a => a.id === id ? { ...a, status } : a));
    return { ok: true };
  },

  getAgreements: async () => {
    const user = currentUser();
    let path = '/agreements';
    if (user?.role === 'Property Manager') path = `/agreements/owner/${user.id}`;
    else if (user?.role === 'Tenant' || user?.role === 'Student') path = `/agreements/tenant/${user.id}`;
    const res = await request(path);
    if (res) return res.map(normalizeAgreement);
    const demoList = agreements.map(a => ({ ...a, propertyName: a.property, tenantName: a.tenant, monthlyRent: a.rent, ownerName: properties.find(p => p.name === a.property)?.owner || 'Property manager' })).map(normalizeAgreement);
    if (user?.role === 'Property Manager') return demoList.filter(a => a.ownerName === user.name);
    if (user?.role === 'Tenant' || user?.role === 'Student') return demoList.filter(a => a.tenantName === user.name);
    return demoList;
  },


  createAgreement: async applicationId => {
    const res = await request(`/agreements?applicationId=${encodeURIComponent(applicationId)}`, { method: 'POST' });
    return normalizeAgreement(res);
  },
  getRentalHistory: async () => {
    const user=currentUser();
    return request(`/agreements/history/${user?.id}`);
  },
  getAdminAnalytics: async () => request('/analytics/admin'),
  getManagerAnalytics: async () => request('/analytics/manager'),
  getAuditLogs: async () => request('/audit-logs'),
  getSettings: async () => request('/admin/settings'),
  saveSetting: async (key, value, description='') => request(`/admin/settings/${encodeURIComponent(key)}`, { method:'PUT', body:JSON.stringify({value,description}) }),
  deleteSetting: async key => request(`/admin/settings/${encodeURIComponent(key)}`, { method:'DELETE' }),
  changeUserRole: async (id, role) => normalizeUser(await request(`/admin/users/${id}/role?role=${encodeURIComponent(role)}`, { method:'PUT' })),
  getTenantProfile: async () => request('/tenant/profile'),

  getThreads: async () => {
    const user = currentUser();
    const res = await request(`/messages/user/${user?.id || ''}`);
    if (res) {
      const groups = new Map();
      res.forEach(raw => {
        const message = normalizeMessage(raw, user.id);
        const otherId = String(message.senderId) === String(user.id) ? message.receiverId : message.senderId;
        const key = `${otherId}:${message.propertyId || 'general'}`;
        const other = String(message.senderId) === String(user.id) ? raw.receiver : raw.sender;
        if (!groups.has(key)) groups.set(key, { id: `thread-${key}`, name: other?.name || 'Property owner', with: other?.name || 'Property owner', role: 'Property owner', receiverId: otherId, propertyId: message.propertyId, propertyName: message.propertyName, messages: [] });
        groups.get(key).messages.push(message);
      });
      return [...groups.values()];
    }
    return readDemo('threads', threads.map(t => ({ ...t, with: t.name, role: 'Property owner', messages: t.messages.map((m, i) => ({ ...m, id: `${t.id}-${i}`, from: m.from === 'You' ? 'me' : m.from })) })));
  },
  startConversation: async property => {
    const user = currentUser();
    if (!user?.id) throw new Error('Please sign in to message the owner.');
    const list = await api.getThreads();
    const receiverId = property.ownerId || property.owner?.id || 2;
    const existing = list.find(t => String(t.propertyId) === String(property.id) && String(t.receiverId) === String(receiverId));
    if (existing) return existing;
    const ownerName = property.owner || property.ownerName || 'Property owner';
    const thread = { id: `thread-${property.id}-${receiverId}`, name: ownerName, with: ownerName, role: 'Property owner', receiverId, propertyId: property.id, propertyName: property.name || property.title, messages: [] };
    if (isDemo) writeDemo('threads', [thread, ...list]);
    return thread;
  },
  sendMessage: async (thread, text) => {
    const user = currentUser();
    const rawReceiverId = typeof thread === 'object' ? thread.receiverId : null;
    const receiverId = rawReceiverId && !Number.isNaN(Number(rawReceiverId)) ? Number(rawReceiverId) : 2;
    const rawPropertyId = typeof thread === 'object' ? thread.propertyId : null;
    const propertyId = rawPropertyId && !Number.isNaN(Number(rawPropertyId)) ? Number(rawPropertyId) : null;
    const threadId = typeof thread === 'object' ? thread.id : thread;
    if (!isDemo) {
      if (!user?.id) throw new Error('Please sign in to send messages.');
      const res = await request('/messages/send', { method: 'POST', body: JSON.stringify({ senderId: user.id, receiverId, propertyId, content: text }) });
      return { ok: true, message: normalizeMessage(res, user.id) };
    }
    const message = { id: `m-${Date.now()}`, from: 'me', text, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    writeDemo('threads', (await api.getThreads()).map(t => t.id === threadId ? { ...t, messages: [...t.messages, message] } : t));
    return { ok: true, message };
  },

  getUsers: async () => (await request('/users'))?.map(normalizeUser) ?? readDemo('users', users),
  createUser: async data => {
    const res = await request('/admin/users', { method: 'POST', body: JSON.stringify(data) });
    if (res) return normalizeUser(res);
    const id = `u-${Date.now()}`;
    const user = { id, name: data.name, email: data.email, phone: data.phone, role: data.role || 'Tenant', status: data.status || 'Active' };
    writeDemo('users', [user, ...readDemo('users', users)]);
    return normalizeUser(user);
  },
  updateUser: async (id, patch) => {
    const user = currentUser();
    const path = String(user?.id) === String(id) && user?.role !== 'Admin' ? '/users/me' : `/users/${id}`;
    const res = await request(path, { method: 'PUT', body: JSON.stringify({ name: patch.name, email: patch.email, phone: patch.phone }) });
    if (res) return normalizeUser(res);
    writeDemo('users', readDemo('users', users).map(u => u.id === id ? { ...u, ...patch } : u));
    return { ok: true };
  },
  blockUser: async id => {
    const res = await request(`/users/${id}/block`, { method: 'PUT' });
    if (res) return normalizeUser(res);
    const list = readDemo('users', users); const user = list.find(u => u.id === id); const status = user?.status === 'Blocked' ? 'Active' : 'Blocked';
    writeDemo('users', list.map(u => u.id === id ? { ...u, status } : u));
    return { ok: true, status };
  },
  deleteUser: async id => {
    const res = await request(`/users/${id}`, { method: 'DELETE' });
    if (res) return res;
    writeDemo('users', readDemo('users', users).filter(u => u.id !== id));
    return { ok: true };
  },

  getNotifications: async () => {
    const user = currentUser();
    const res = await request(`/notifications/user/${user?.id || ''}`);
    return (res ?? readDemo('notifications', notifications)).map(normalizeNotification);
  },
  markNotificationsRead: async () => {
    const user = currentUser();
    if (!isDemo) { await request(`/notifications/read-all/${user?.id}`, { method:'PUT' }); return { ok:true }; }
    const list = await api.getNotifications();
    writeDemo('notifications', readDemo('notifications', notifications).map(n => ({ ...n, read: true })));
    return { ok: true };
  },

  requestPasswordReset: email => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyResetCode: (email, code) => request('/auth/verify-reset', { method: 'POST', body: JSON.stringify({ email, code }) }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),

  login: async ({ email, password, role }) => {
    const res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role }) });
    if (res) return { id: res.userId, name: res.name, email: res.email, role: normalizeRole(res.role), status: 'Active', token: res.token };
    const found = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    if (found) return { ...found, role: role || found.role };
    const name = String(email).split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return { id: `u-${Date.now()}`, name, email, role: role || 'Tenant', status: 'Active' };
  },

  /** Send an email verification OTP for registration. */
  sendRegisterOtp: async (email) => {
    return request('/auth/register/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
  },

  register: async data => {
    const res = await request('/auth/register', { method: 'POST', body: JSON.stringify(data) });
    return res ? { ...res, id: res.userId, role: normalizeRole(res.role) } : { ok: true };
  },

  /** Send a login OTP to the given email. */
  sendOtp: async (email) => {
    return request('/auth/otp/send', { method: 'POST', body: JSON.stringify({ email }) });
  },

  /** Verify a login OTP; returns the same shape as api.login on success. */
  verifyOtp: async (email, otp) => {
    const res = await request('/auth/otp/verify', { method: 'POST', body: JSON.stringify({ email, otp }) });
    if (res) return { id: res.userId, name: res.name, email: res.email, role: normalizeRole(res.role), status: 'Active', token: res.token };
    return null;
  },
};
