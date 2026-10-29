import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, ChevronRight, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { assistantReply, formatBudget } from '../utils/recommendations';
import { formatPrice } from '../utils/price';

const QUICK_PROMPTS = [
  'Find a PG near Amity University under ₹10k',
  'Show 2 BHK homes in Noida under ₹25k',
  'Best student accommodation under ₹12k',
];

function Recommendation({ item }) {
  const navigate = useNavigate();
  const isAcc = item._kind === 'accommodation' || item.university || item.roomType;
  const path = isAcc ? `/accommodation/${item.id}` : `/property/${item.id}`;
  const price = isAcc ? item.rent : (item.listingFor === 'buy' ? item.salePrice : item.rent);
  const subtitle = isAcc
    ? `${item.city} · ${item.distanceKm ?? item.distance ?? '—'} km from campus`
    : item.location || item.city;
  return (
    <motion.button type="button" className="assistant-recommendation" whileHover={{ y: -1 }} whileTap={{ scale: 0.995 }} onClick={() => navigate(path)}>
      <img src={item.image || '/assets/marketplace/studio.webp'} alt="" />
      <span className="assistant-recommendation-copy">
        <strong>{item.name}</strong>
        <small>{subtitle}</small>
        <em>{formatPrice(price, { mode: item.listingFor === 'buy' ? 'buy' : 'rent' })}{item.listingFor === 'buy' ? '' : ' /month'}</em>
      </span>
      <ChevronRight size={16} aria-hidden="true" />
    </motion.button>
  );
}

function TypingIndicator() {
  return (
    <motion.div className="assistant-typing" initial={{ opacity: 0, y: 5, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 3 }} transition={{ duration: 0.18, ease: 'easeOut' }} aria-label="WayHome is typing">
      <span className="assistant-typing-dots" aria-hidden="true"><i /><i /><i /></span>
      <span>WayHome is typing</span>
    </motion.div>
  );
}

export default function SmartAssistant() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', from: 'assistant', text: 'Hi! I’m your home-finding assistant. Tell me your city, budget or university and I’ll shortlist a few options.' },
  ]);
  const endRef = useRef(null);
  const replyTimer = useRef(null);

  const hidden = ['/login', '/register', '/forgot-password', '/chat', '/architecture', '/er-diagram', '/roadmap', '/terms'].some(path => location.pathname === path || location.pathname.startsWith(`${path}/`));

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' });
  }, [messages.length, typing, reduced]);

  useEffect(() => {
    if (!hidden) setOpen(false);
  }, [location.pathname]);

  useEffect(() => () => {
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
  }, []);

  if (hidden) return null;

  const send = text => {
    const value = String(text || draft).trim();
    if (!value || typing) return;

    const resultPromise = Promise.resolve(assistantReply(value));
    const now = Date.now();
    setMessages(list => [...list, { id: `u-${now}`, from: 'user', text: value }]);
    setDraft('');
    setTyping(true);

    replyTimer.current = window.setTimeout(async () => {
      try {
        const result = await resultPromise;
        setMessages(list => [...list, { id: `a-${now + 1}`, from: 'assistant', ...result }]);
      } catch {
        setMessages(list => [...list, { id: `a-${now + 1}`, from: 'assistant', text: 'I could not reach the live listings right now. Please try again in a moment.' }]);
      } finally {
        setTyping(false);
        replyTimer.current = null;
      }
    }, reduced ? 100 : 1000);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside className="smart-assistant" initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.97 }} transition={{ duration: reduced ? 0.01 : 0.2, ease: 'easeOut' }} aria-label="Home finding assistant">
            <header className="assistant-header">
              <div className="assistant-brand-icon"><Bot size={18} /></div>
              <div><strong>WayHome Assistant</strong><small>Smart recommendations from your listings</small></div>
              <button type="button" className="assistant-close" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={17} /></button>
            </header>

            <div className="assistant-messages" role="log" aria-live="polite">
              <AnimatePresence initial={false}>
                {messages.map(message => (
                  <motion.div key={message.id} className={`assistant-message assistant-message--${message.from}`} initial={reduced ? false : { opacity: 0, y: message.from === 'user' ? 7 : 9, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduced ? 0.01 : 0.24, ease: 'easeOut' }}>
                    <div className="assistant-bubble">{message.text}</div>
                    {message.recommendations?.length > 0 && (
                      <motion.div className="assistant-recommendations" initial={reduced ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.08, duration: 0.2 }}>
                        {message.recommendations.map(item => <Recommendation key={`${item._kind}-${item.id}`} item={item} />)}
                      </motion.div>
                    )}
                    {message.meta?.budget && <small className="assistant-context">Budget considered: {formatBudget(message.meta.budget)}</small>}
                  </motion.div>
                ))}
              </AnimatePresence>
              <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>
              <div ref={endRef} />
            </div>

            {messages.length === 1 && !typing && (
              <motion.div className="assistant-quick-actions" initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0.01 : 0.2 }}>
                {QUICK_PROMPTS.map(prompt => <button key={prompt} type="button" onClick={() => send(prompt)}><Sparkles size={13} />{prompt}</button>)}
              </motion.div>
            )}

            <form className={`assistant-compose ${typing ? 'is-typing' : ''}`} onSubmit={event => { event.preventDefault(); send(); }}>
              <input value={draft} onChange={event => setDraft(event.target.value)} placeholder="Ask about homes, PGs, budget…" aria-label="Ask the home finding assistant" disabled={typing} />
              <motion.button type="submit" disabled={!draft.trim() || typing} aria-label={typing ? 'Waiting for assistant' : 'Send'} whileTap={reduced || typing ? undefined : { scale: 0.9 }} animate={typing ? { opacity: 0.55 } : { opacity: 1 }}>
                {typing ? <span className="assistant-send-pulse" aria-hidden="true"><i /><i /><i /></span> : <Send size={16} />}
              </motion.button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button type="button" className={`assistant-launcher ${open ? 'is-open' : ''}`} onClick={() => setOpen(value => !value)} whileHover={reduced ? undefined : { y: -2 }} whileTap={reduced ? undefined : { scale: 0.96 }} aria-expanded={open} aria-label={open ? 'Close WayHome Assistant' : 'Open WayHome Assistant'}>
        {open ? <X size={22} /> : <><MessageCircle size={22} className="assistant-launcher-icon" /><span className="assistant-launcher-text">Ask WayHome</span></>}
      </motion.button>
    </>
  );
}
