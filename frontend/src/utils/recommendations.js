import { properties } from '../data/properties.js';
import { accommodations } from '../data/universities.js';
import { api, isDemo } from '../services/api.js';

const normalise = value => String(value || '').toLowerCase().replace(/[^a-z0-9₹]+/g, ' ').trim();

function parseBudget(text) {
  const source = normalise(text).replace(/,/g, '');
  const matches = [...source.matchAll(/(?:₹|rs\.?|inr\s*)?(\d+(?:\.\d+)?)\s*(k|thousand|l|lakh|lakhs|cr|crore|crores)?/gi)];
  const values = matches.map(match => {
    const n = Number(match[1]);
    const unit = String(match[2] || '').toLowerCase();
    if (unit === 'k' || unit === 'thousand') return n * 1000;
    if (unit === 'l' || unit === 'lakh' || unit === 'lakhs') return n * 100000;
    if (unit === 'cr' || unit === 'crore' || unit === 'crores') return n * 10000000;
    return n >= 100 ? n : n * 1000;
  }).filter(Boolean);
  return values.length ? Math.max(...values) : null;
}

function requestedBhk(text) {
  const match = normalise(text).match(/\b([1-4])\s*bhk\b/);
  return match ? Number(match[1]) : null;
}

function requestedType(text) {
  const source = normalise(text);
  if (/\bpg\b|paying guest/.test(source)) return 'PG';
  if (/\bhostel\b/.test(source)) return 'Hostel';
  if (/\bstudio\b/.test(source)) return 'Studio';
  if (/\bflat\b/.test(source)) return 'Flat';
  if (/\bapartment\b/.test(source)) return 'Apartment';
  return null;
}

function findLocation(text, collection) {
  const source = normalise(text);
  const values = [...new Set(collection.flatMap(item => [item.city, item.state, item.location, item.university]))].filter(Boolean);
  return values.sort((a, b) => b.length - a.length).find(value => source.includes(normalise(value)));
}

function score(item, query, budget, location, kind) {
  const source = normalise(query);
  let points = 0;
  const haystack = normalise([item.name, item.city, item.state, item.location, item.university, item.type, item.roomType, item.furnishing, ...(item.facilities || [])].join(' '));
  if (location && haystack.includes(normalise(location))) points += 8;
  if (budget) {
    if (Number(item.rent) <= budget) points += 5;
    else points -= Math.min(5, (Number(item.rent) - budget) / Math.max(budget, 1) * 6);
  }
  if (source.includes('student') || source.includes('pg') || source.includes('hostel') || source.includes('campus') || source.includes('university')) {
    if (kind === 'accommodation') points += 7;
  }
  if (source.includes('buy') || source.includes('purchase')) {
    points += kind === 'property' && item.listingFor === 'buy' ? 8 : -3;
  }
  if (source.includes('rent') || source.includes('rental')) {
    points += kind === 'property' && item.listingFor !== 'buy' ? 3 : 0;
  }
  if (source.includes('furnished') && normalise(item.furnishing).includes('furnished')) points += 3;
  if (source.includes('1 bhk') || source.includes('1bhk')) points += item.bedrooms === 1 || item.roomType === '1BHK' ? 4 : 0;
  if (source.includes('2 bhk') || source.includes('2bhk')) points += item.bedrooms === 2 || item.roomType === '2BHK Shared' ? 4 : 0;
  if (source.includes('3 bhk') || source.includes('3bhk')) points += item.bedrooms === 3 ? 4 : 0;
  if (source.includes('single')) points += normalise(item.roomType).includes('single') ? 3 : 0;
  if (source.includes('double')) points += normalise(item.roomType).includes('double') ? 3 : 0;
  if (source.includes('wifi') && (item.facilities || []).some(x => normalise(x) === 'wifi')) points += 2;
  if (source.includes('food') && (item.facilities || []).some(x => normalise(x) === 'food')) points += 2;
  points += Number(item.rating || 0) * 0.6;
  if (kind === 'accommodation') points += Math.max(0, 4 - Number(item.distanceKm || item.distance || 4));
  return points;
}

export function recommendHomes(query = '', sourceData = {}) {
  const source = normalise(query);
  const bhk = requestedBhk(query);
  const requested = requestedType(query);
  const studentIntent = !bhk && /student|pg|hostel|campus|university|college|room|shared/.test(source);
  const buyIntent = /buy|purchase|sale|selling/.test(source);
  const budget = parseBudget(query);
  const propertyData = sourceData.properties || properties;
  const accommodationData = sourceData.accommodations || accommodations;
  const pool = studentIntent ? accommodationData.map(item => ({ ...item, _kind: 'accommodation' })) : propertyData.map(item => ({ ...item, _kind: 'property' }));
  const location = findLocation(query, pool);
  const ranked = pool
    .filter(item => !budget || Number(item.rent || item.salePrice || 0) <= budget * 1.15)
    .filter(item => !buyIntent || item.listingFor === 'buy')
    .filter(item => !requested || item.type === requested)
    .filter(item => !bhk || Number(item.bedrooms) === bhk || normalise(item.roomType).includes(`${bhk}bhk`))
    .map(item => ({ ...item, _score: score(item, query, budget, location, item._kind) }))
    .sort((a, b) => b._score - a._score || Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 3);

  if (ranked.length) {
    return {
      items: ranked,
      location,
      budget,
      kind: studentIntent ? 'student' : buyIntent ? 'buy' : 'property',
      message: location
        ? `I found a few ${studentIntent ? 'student homes' : 'homes'} around ${location}.`
        : budget
          ? `Here are options that fit around your ${formatBudget(budget)} budget.`
          : 'Here are a few strong matches from the current listings.',
    };
  }

  // If strict filters return nothing, provide a useful nearby/general fallback.
  const fallbackPool = studentIntent ? accommodationData : propertyData;
  const fallback = fallbackPool
    .slice()
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
    .slice(0, 3)
    .map(item => ({ ...item, _kind: studentIntent ? 'accommodation' : 'property' }));
  return {
    items: fallback,
    location,
    budget,
    kind: studentIntent ? 'student' : buyIntent ? 'buy' : 'property',
    message: 'I could not find an exact match, so I picked the closest options from the current listings.',
  };
}

export function formatBudget(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1).replace('.0', '')} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1).replace('.0', '')} Lakh`;
  return `₹${Math.round(value / 1000)}k`;
}

export async function assistantReply(query) {
  const source = normalise(query);
  if (!source) return { text: 'Tell me what you are looking for — for example, “PG near Amity University under ₹10k” or “2 BHK in Noida under ₹25k”.' };
  if (/what can you do|help|how does this work|features/.test(source)) {
    return { text: 'I can help narrow down homes using your budget, city, property type, furnishing, room type, and student/university needs. I can also explain which option looks like the better fit.' };
  }
  if (/hello|hi|hey|namaste/.test(source)) {
    return { text: 'Hi! Tell me your city, budget and what kind of place you need. I will shortlist a few matches from the current listings.' };
  }
  const sourceData = isDemo ? {} : await Promise.all([api.getProperties(), api.getAccommodations()]).then(([propertyData, accommodationData]) => ({ properties: propertyData, accommodations: accommodationData }));
  const result = recommendHomes(query, sourceData);
  return { text: result.message, recommendations: result.items, meta: result };
}
