import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProperties } from './propertyFilters.js';
import { properties } from '../data/properties.js';
const search = query => filterProperties(properties, new URLSearchParams(query));

test('combined URL filters retain the exact result when switching between grid and map', () => {
  const query = 'location=Noida&type=Apartment&min=19000&max=21000&beds=2&furnishing=Furnished&distance=1&facilities=WiFi,Parking&sort=price-high';
  assert.deepEqual(search(query).map(property => property.id), ['p1']);
  assert.equal(search(query.replace('min=19000', 'min=21000')).length, 0);
  assert.equal(search(query.replace('distance=1', 'distance=0.2')).length, 0);
  assert.equal(search(query.replace('furnishing=Furnished', 'furnishing=Unfurnished')).length, 0);
});

test('buy budgets and sorting use sale price rather than monthly rent', () => {
  assert.deepEqual(search('mode=buy&max=15000000').map(property => property.id), ['p2']);
  assert.deepEqual(search('mode=buy&sort=price-high').map(property => property.id), ['p5', 'p2']);
});

test('pending listings stay out of all marketplace searches', () => {
  assert.ok(search('').length > 0);
  assert.ok(search('').every(property => property.status === 'Approved'));
  assert.equal(search('location=Lakeview Girls Hostel').length, 0);
});

test('four bedrooms includes larger homes and security includes gated/CCTV amenities', () => {
  const fixtures = [
    { id: 'large', status: 'Approved', bedrooms: 5, facilities: ['Gated community', 'WiFi'] },
    { id: 'small', status: 'Approved', bedrooms: 3, facilities: ['CCTV', 'WiFi'] },
    { id: 'missing', status: 'Approved', bedrooms: 4, facilities: ['WiFi'] },
  ];
  assert.deepEqual(filterProperties(fixtures, new URLSearchParams('beds=4&facilities=Security,WiFi')).map(p => p.id), ['large']);
});
