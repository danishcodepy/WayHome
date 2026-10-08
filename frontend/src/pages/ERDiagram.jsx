import { motion } from 'framer-motion';
import { Key, Link as LinkIcon } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const entities = [
  {
    name: 'USER',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'name', type: '' },
      { name: 'email', type: '' },
      { name: 'phone', type: '' },
      { name: 'password', type: '' },
      { name: 'role', type: '' },
      { name: 'status', type: '' },
    ],
  },
  {
    name: 'PROPERTY',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'title', type: '' },
      { name: 'type', type: '' },
      { name: 'city', type: '' },
      { name: 'rent', type: '' },
      { name: 'owner_id → USER', type: 'FK' },
    ],
  },
  {
    name: 'PROPERTY_IMAGE',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'property_id → PROPERTY', type: 'FK' },
      { name: 'url', type: '' },
    ],
  },
  {
    name: 'UNIVERSITY',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'name', type: '' },
      { name: 'city', type: '' },
      { name: 'state', type: '' },
    ],
  },
  {
    name: 'STUDENT_ACCOMMODATION',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'name', type: '' },
      { name: 'type', type: '' },
      { name: 'university_id → UNIVERSITY', type: 'FK' },
      { name: 'distance', type: '' },
      { name: 'rent', type: '' },
      { name: 'owner', type: '' },
    ],
  },
  {
    name: 'APPLICATION',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'property_id → PROPERTY', type: 'FK' },
      { name: 'tenant_id → USER', type: 'FK' },
      { name: 'status', type: '' },
    ],
  },
  {
    name: 'AGREEMENT',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'application_id → APPLICATION', type: 'FK' },
      { name: 'property_id → PROPERTY', type: 'FK' },
      { name: 'tenant_id → USER', type: 'FK' },
      { name: 'dates', type: '' },
      { name: 'rent', type: '' },
    ],
  },
  {
    name: 'MESSAGE',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'sender_id → USER', type: 'FK' },
      { name: 'receiver_id → USER', type: 'FK' },
      { name: 'property_id → PROPERTY', type: 'FK' },
      { name: 'content', type: '' },
    ],
  },
  {
    name: 'NOTIFICATION',
    fields: [
      { name: 'id', type: 'PK' },
      { name: 'user_id → USER', type: 'FK' },
      { name: 'title', type: '' },
      { name: 'read', type: '' },
    ],
  },
];

const relationships = [
  'USER 1—N PROPERTY (a manager owns many properties)',
  'PROPERTY 1—N PROPERTY_IMAGE',
  'UNIVERSITY 1—N STUDENT_ACCOMMODATION',
  'USER 1—N APPLICATION (as tenant)',
  'PROPERTY 1—N APPLICATION',
  'APPLICATION 1—1 AGREEMENT',
  'USER N—N USER via MESSAGE (sender ↔ receiver)',
  'USER 1—N NOTIFICATION',
];

export default function ERDiagram() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-slate-900">Database ER Diagram</h1>
          <p className="text-slate-500 mt-2">Entities, keys and relationships in the WayHome MySQL schema.</p>
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Key className="w-4 h-4 text-slate-800" /> Primary key (bold)</span>
            <span className="flex items-center gap-1.5"><LinkIcon className="w-4 h-4 text-blue-600" /> Foreign key (orange)</span>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {entities.map((e, i) => (
            <motion.div
              key={e.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-white rounded-3xl border-2 border-blue-100 shadow-sm overflow-hidden"
            >
              <div className="bg-blue-700 px-5 py-3">
                <h3 className="font-display text-lg font-bold text-white tracking-wide">{e.name}</h3>
              </div>
              <ul className="p-5 space-y-2">
                {e.fields.map((f) => (
                  <li
                    key={f.name}
                    className={`flex items-center gap-2 text-sm font-mono px-3 py-1.5 rounded-lg ${
                      f.type === 'PK' ? 'bg-slate-100 font-bold text-slate-900' :
                      f.type === 'FK' ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                    }`}
                  >
                    {f.type === 'PK' && <Key className="w-4 h-4 shrink-0" />}
                    {f.type === 'FK' && <LinkIcon className="w-4 h-4 shrink-0" />}
                    {f.name}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 bg-slate-50 border border-slate-200 rounded-3xl p-6 lg:p-8"
        >
          <h2 className="font-display text-2xl font-bold text-slate-900">Relationships</h2>
          <ul className="mt-4 grid sm:grid-cols-2 gap-2.5">
            {relationships.map((r) => (
              <li key={r} className="text-sm text-slate-700 bg-white border border-slate-200 rounded-xl px-4 py-2.5 font-mono">
                {r}
              </li>
            ))}
          </ul>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
