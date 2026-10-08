export function filterAccommodations(items, params) {
  const university = params.get('university'), state = params.get('state'), city = params.get('city');
  const types = (params.get('type') || '').split(',').filter(Boolean);
  const min = Math.max(0, Number(params.get('min')) || 0), max = Math.max(0, Number(params.get('max')) || 0);
  const distance = Number(params.get('distance')) || 0;
  const furnishing = params.get('furnishing'), room = params.get('room');
  const facilities = (params.get('facilities') || '').split(',').filter(Boolean);
  const results = items.filter(item => (!university || item.university === university) && (!state || item.state === state) && (!city || item.city === city) && (!types.length || types.includes(item.type)) && (!min || item.rent >= min) && (!max || item.rent <= max) && (!distance || item.distanceKm <= distance) && (!furnishing || item.furnishing === furnishing) && (!room || item.roomType === room) && facilities.every(facility => item.facilities.includes(facility)));
  const sort = params.get('sort');
  if (sort === 'price-low') results.sort((a, b) => a.rent - b.rent);
  else if (sort === 'price-high') results.sort((a, b) => b.rent - a.rent);
  else if (sort === 'rating') results.sort((a, b) => b.rating - a.rating);
  else results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results;
}
