import { stateCityData } from '../data/universities.js';
export const PROPERTY_TYPES = ['Apartment', 'PG', 'Hostel', 'Villa', 'Studio', 'Flat'];
export const PROPERTY_FACILITIES = ['WiFi', 'Parking', 'Security', 'Food', 'Laundry', 'Power Backup'];

const nonNegative = value => Math.max(0, Number(value) || 0);
const hasFacility = (property, facility) => (property.facilities || []).some(value =>
  facility === 'Security' ? /secur|cctv|gated/i.test(value) : value.toLowerCase().includes(facility.toLowerCase())
);

const CITY_TO_STATE = new Map(stateCityData.flatMap(item => item.cities.map(city => [city.name, item.state])));

// Grid and map share the same URL filters so changing views preserves the search.
export function filterProperties(properties, params) {
  const mode = params.get('mode') === 'buy' ? 'buy' : 'rent';
  const query = (params.get('location') || '').trim().toLowerCase();
  const selectedState = params.get('state') || '';
  const selectedCity = params.get('city') || '';
  const types = (params.get('type') || '').split(',').filter(type => PROPERTY_TYPES.includes(type));
  const facilities = (params.get('facilities') || '').split(',').filter(value => PROPERTY_FACILITIES.includes(value));
  const min = nonNegative(params.get('min'));
  const max = nonNegative(params.get('max'));
  const beds = nonNegative(params.get('beds'));
  const distance = nonNegative(params.get('distance'));
  const furnishing = params.get('furnishing') || '';
  const price = property => mode === 'buy' ? property.salePrice : property.rent;
  const results = properties.filter(property =>
    property.status === 'Approved' &&
    (property.listingFor || 'rent') === mode &&
    (!selectedState || CITY_TO_STATE.get(property.city) === selectedState) &&
    (!selectedCity || property.city === selectedCity) &&
    (!query || [property.name, property.city, property.location].some(value => value?.toLowerCase().includes(query))) &&
    (!types.length || types.includes(property.type)) &&
    (!min || price(property) >= min) &&
    (!max || price(property) <= max) &&
    (!beds || (beds === 4 ? property.bedrooms >= 4 : property.bedrooms === beds)) &&
    (!furnishing || property.furnishing === furnishing) &&
    (!distance || (property.metroKm != null && property.metroKm <= distance)) &&
    facilities.every(facility => hasFacility(property, facility))
  );
  if (params.get('sort') === 'price-low') results.sort((a, b) => price(a) - price(b));
  if (params.get('sort') === 'price-high') results.sort((a, b) => price(b) - price(a));
  return results;
}
