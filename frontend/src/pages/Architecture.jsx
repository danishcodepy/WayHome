import { motion } from 'framer-motion';
import {
  Monitor, Server, Layers, Database, ShieldCheck, Bell, Sparkles, ArrowDown,
} from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function LayerBox({ icon: Icon, title, bullets, color }) {
  return (
    <div className={`bg-white rounded-3xl border-2 ${color} shadow-sm p-6 w-full max-w-xl mx-auto`}>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-slate-700" />
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900">{title}</h3>
      </div>
      <ul className="mt-4 space-y-1.5">
        {bullets.map((b) => (
          <li key={b} className="text-sm text-slate-600 flex items-start gap-2">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DownArrow() {
  return (
    <div className="flex justify-center py-3">
      <ArrowDown className="w-6 h-6 text-slate-400" />
    </div>
  );
}

export default function Architecture() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-slate-900">System Architecture</h1>
          <p className="text-slate-500 mt-2 max-w-2xl mx-auto">
            How WayHome is put together — from the screens you see to the services that power them.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-10">
          <LayerBox
            icon={Monitor}
            title="Frontend — React / HTML / CSS / JS"
            color="border-blue-200"
            bullets={[
              'Responsive single-page app built with React and Tailwind CSS',
              'Role-based dashboards for Admins, Property Managers and Tenants',
              'Student Accommodation Finder with step-based search wizard',
            ]}
          />
          <DownArrow />
          <LayerBox
            icon={Server}
            title="API Gateway / Controllers (Spring Boot)"
            color="border-green-200"
            bullets={[
              'REST endpoints for properties, applications, agreements and chat',
              'Request routing, validation and role-based access control',
              'Versioned APIs consumed by the React frontend',
            ]}
          />
          <DownArrow />
          <LayerBox
            icon={Layers}
            title="Service Layer"
            color="border-blue-200"
            bullets={[
              'Business logic: applications, approvals, rent agreements',
              'Listing verification and notification orchestration',
              'Reusable services shared across controllers',
            ]}
          />
          <DownArrow />
          <LayerBox
            icon={Database}
            title="MySQL Database"
            color="border-purple-200"
            bullets={[
              'Relational schema: users, properties, accommodations, applications',
              'Agreements, messages and notifications tables',
              'Indexed queries for fast city and university search',
            ]}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 grid sm:grid-cols-3 gap-5"
        >
          {[
            { icon: ShieldCheck, title: 'Security (JWT)', desc: 'Token-based authentication; every request carries a signed JWT checked by the API gateway.' },
            { icon: Bell, title: 'Notification Service', desc: 'Sends application updates, rent reminders and chat alerts to users in real time.' },
            { icon: Sparkles, title: 'AI Module', desc: 'Powers smart property recommendations and the 24×7 chatbot assistant.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-6">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </motion.div>

        <p className="mt-10 text-center text-sm text-slate-500 max-w-3xl mx-auto">
          The frontend talks only to the API gateway; the service layer owns all business rules and the
          MySQL database is the single source of truth. Cross-cutting concerns — security, notifications
          and AI — plug in alongside the main flow as dashed supporting services.
        </p>
      </main>
      <Footer />
    </div>
  );
}
