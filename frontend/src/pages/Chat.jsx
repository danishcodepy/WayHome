import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { api, isDemo } from '../services/api';

export default function Chat() {
  const [params, setParams] = useSearchParams();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(params.get('thread'));
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showList, setShowList] = useState(!params.get('thread'));
  const end = useRef(null);

  useEffect(() => {
    api.getThreads().then(list => {
      let next = Array.isArray(list) ? [...list] : [];
      const requested = params.get('thread');

      if (requested && !next.some(t => t.id === requested)) {
        const receiverId = params.get('receiver') || '2';
        const contactName = params.get('name') || 'Property Owner';
        const propertyId = params.get('property') || null;
        next = [
          {
            id: requested,
            name: contactName,
            with: contactName,
            role: 'Property Owner',
            receiverId,
            propertyId,
            propertyName: params.get('name') || 'Property Enquiry',
            messages: []
          },
          ...next
        ];
      }

      if (!requested && next.length === 0) {
        next = [
          {
            id: 'thread-support',
            name: 'WayHome Support',
            with: 'WayHome Support',
            role: 'Support & Property Manager',
            receiverId: '2',
            propertyId: null,
            propertyName: 'General Enquiry',
            messages: []
          }
        ];
      }

      setThreads(next);
      if (requested) {
        setActiveId(requested);
      } else if (!activeId && next[0]) {
        setActiveId(next[0].id);
      }
    }).catch(() => {
      // Fallback thread if network/auth fails
      const fallbackThread = {
        id: params.get('thread') || 'thread-default',
        name: params.get('name') || 'WayHome Support',
        with: params.get('name') || 'WayHome Support',
        role: 'Property Owner',
        receiverId: params.get('receiver') || '2',
        propertyId: params.get('property') || null,
        propertyName: 'Enquiry',
        messages: []
      };
      setThreads([fallbackThread]);
      setActiveId(fallbackThread.id);
    });
  }, [params]);

  const active = threads.find(t => t.id === activeId) || threads[0];

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeId, active?.messages?.length]);

  const send = async e => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !active || busy) return;
    setBusy(true);
    setError('');
    try {
      const res = await api.sendMessage(active, text);
      const newMsg = res?.message || { id: `m-${Date.now()}`, from: 'me', text, time: 'just now' };
      setThreads(list =>
        list.map(t =>
          t.id === active.id ? { ...t, messages: [...(t.messages || []), newMsg] } : t
        )
      );
      setDraft('');
    } catch (err) {
      setError(err?.message || 'Message could not be sent. Your draft is still here.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="chat-page">
        <div className={`chat-shell ${showList ? 'show-list' : ''}`}>
          <aside className="chat-list">
            <h1>Messages</h1>
            {threads.map(t => (
              <button
                key={t.id}
                className={(active?.id === t.id) ? 'active' : ''}
                onClick={() => {
                  setActiveId(t.id);
                  setParams({ thread: t.id }, { replace: true });
                  setShowList(false);
                }}
              >
                <span className="avatar">{(t.with || t.name || 'Owner')[0]}</span>
                <span>
                  <strong>{t.with || t.name}</strong>
                  <p>{t.messages?.at(-1)?.text || 'Start a conversation'}</p>
                </span>
              </button>
            ))}
            {!threads.length && <p className="p-5 text-sm text-slate-400">No conversations yet.</p>}
          </aside>

          <section className="chat-conversation">
            {active ? (
              <>
                <header className="chat-person">
                  <button
                    className="chat-back"
                    onClick={() => setShowList(true)}
                    aria-label="Back to conversations"
                  >
                    <ArrowLeft size={19} />
                  </button>
                  <span className="avatar">{(active.with || active.name || 'Owner')[0]}</span>
                  <div>
                    <h2>{active.with || active.name}</h2>
                    <p>
                      {active.propertyName || active.role || 'Property owner'}
                      {isDemo ? ' · Demo conversation' : ''}
                    </p>
                  </div>
                </header>

                <div className="chat-history" role="log" aria-label="Message history">
                  {(active.messages || []).map((m, i) => (
                    <div
                      className={`chat-bubble ${m.from === 'me' || m.from === 'You' ? 'mine' : ''}`}
                      key={m.id || i}
                    >
                      <p>{m.text}</p>
                      <small>{m.time}</small>
                    </div>
                  ))}
                  {(!active.messages || active.messages.length === 0) && (
                    <p className="text-center text-xs text-slate-400 my-auto">
                      Say hello and ask about the property.
                    </p>
                  )}
                  <div ref={end} />
                </div>

                {error && (
                  <p className="form-error mx-4 mt-2" role="alert">
                    {error}
                  </p>
                )}

                <form className="chat-compose" onSubmit={send}>
                  <input
                    aria-label="Message"
                    placeholder="Write a message…"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    autoFocus
                  />
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={busy || !draft.trim()}
                    aria-label="Send message"
                  >
                    <Send size={16} />
                    <span className="hidden sm:inline">{busy ? 'Sending…' : 'Send'}</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="empty-panel m-auto border-0">
                <MessageSquare size={35} />
                <h2>Your conversations</h2>
                <p>Select a conversation or contact an owner from a property page.</p>
                {error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
