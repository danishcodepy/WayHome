import { stateCityData, universityCoords } from '../data/universities';
// Local directory provider. No Google Places request or exposed API key is used.
export const universityDirectory = Array.from(new Map(stateCityData.flatMap(state => state.cities.flatMap(city => city.universities.map(name => [name, { name, state: state.state, city: city.name, coordinates: universityCoords[name] || null }])))).values());
export const universityOption = university => ({ value: university.name, label: university.name, description: `${university.city}, ${university.state}` });
