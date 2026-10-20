const prefix = 'reh_market_demo_v2_';
export function readDemo(key, fallback) { try {const raw=localStorage.getItem(prefix+key); return raw ? JSON.parse(raw) : fallback;} catch {return fallback;} }
export function writeDemo(key, value) {try {localStorage.setItem(prefix+key,JSON.stringify(value));window.dispatchEvent(new CustomEvent('reh:demo-update',{detail:{key}}));return value;}catch {throw new Error('Device storage is full or unavailable. Please try again.');}}
