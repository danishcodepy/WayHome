import { motion } from 'framer-motion';
import { Sparkles, Bot, Map, CreditCard, BadgeCheck } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

const items = [
  {
    icon: Sparkles,
    title: 'AI Property Recommendations',
    desc: 'Smart suggestions by budget, location & search history',
    quarter: 'Q1',
    color: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-600',
  },
  {
    icon: Bot,
    title: 'AI Chatbot Assistant',
    desc: '24×7 help for tenants & managers',
    quarter: 'Q1',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-600',
  },
  {
    icon: Map,
    title: 'Map Integration',
    desc: 'Interactive maps with commute times',
    quarter: 'Q2',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-600',
  },
  {
    icon: CreditCard,
    title: 'Online Rent Payments',
    desc: 'UPI/cards with receipts & reminders',
    quarter: 'Q2',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Properties',
    desc: 'Document-verified listings',
    quarter: 'Q3',
    color: 'bg-teal-100 text-teal-700',
    dot: 'bg-teal-600',
  },
];

export default function Roadmap() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
          <h1 className="font-display text-4xl font-bold text-slate-900">Future Roadmap</h1>
          <p className="text-slate-500 mt-2">Where WayHome goes next — quarter by quarter.</p>
        </motion.div>

        <div className="mt-12 relative">
          <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 bg-slate-200 sm:-translate-x-1/2" />
          <div className="space-y-8">
            {items.map(({ icon: Icon, title, desc, quarter, color, dot }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className={`relative flex ${i % 2 === 0 ? 'sm:justify-start' : 'sm:justify-end'}`}
              >
                <div className={`absolute left-6 sm:left-1/2 top-6 w-4 h-4 rounded-full ${dot} ring-4 ring-white sm:-translate-x-1/2 -translate-x-1/2`} />
                <div className="ml-14 sm:ml-0 sm:w-[calc(50%-2.5rem)] bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">{quarter}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
