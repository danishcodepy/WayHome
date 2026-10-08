import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice,priceRangeLabel,listingPrice } from './price.js';
import { filterAccommodations } from './studentFilters.js';
import { accommodations } from '../data/universities.js';

test('Indian purchase prices retain lakh/crore precision without monthly suffixes',()=>{
  assert.equal(formatPrice(7500000,{mode:'buy'}),'₹75 Lakh');
  assert.equal(formatPrice(12500000,{mode:'buy'}),'₹1.25 Cr');
  assert.equal(formatPrice(8500),'₹8,500');
  assert.equal(formatPrice(0),'₹0');
  assert.equal(formatPrice(undefined),'Price on request');
  assert.equal(formatPrice(null),'Price on request');
  assert.equal(listingPrice({listingFor:'buy',salePrice:7500000,rent:0}),7500000);
});
test('open-ended budgets and student presets have unambiguous labels',()=>{
  assert.equal(priceRangeLabel(0,0),'Any budget');
  assert.equal(priceRangeLabel(8000,12000),'₹8k – ₹12k');
  assert.equal(priceRangeLabel(8000,0),'₹8k+');
  assert.equal(priceRangeLabel(0,7500000,'buy'),'Up to ₹75 Lakh');
});
test('campus, budget, distance and room filters combine and include exact boundaries',()=>{
  const params=new URLSearchParams({state:'Uttar Pradesh',city:'Noida',university:'Amity University',type:'Hostel',min:'8000',max:'8000',distance:'0.8',room:'Double Sharing',furnishing:'Fully Furnished'});
  assert.deepEqual(filterAccommodations(accommodations,params).map(a=>a.id),['a1']);
  params.set('distance','0.5');
  assert.equal(filterAccommodations(accommodations,params).length,0);
  params.set('distance','1');params.set('max','7500');
  assert.equal(filterAccommodations(accommodations,params).length,0);
});
test('grid and campus map share filters and do not show homes in another state',()=>{
  const params=new URLSearchParams('state=Karnataka&type=PG,Flat&max=15000');
  const expected=filterAccommodations(accommodations,params).map(a=>a.id);
  assert.deepEqual(expected,['a5','a6']);
  params.set('view','map');
  assert.deepEqual(filterAccommodations(accommodations,params).map(a=>a.id),expected);
  params.set('university','Amity University');
  assert.equal(filterAccommodations(accommodations,params).length,0);
  assert.equal(filterAccommodations(accommodations,new URLSearchParams()).length,accommodations.length);
});
test('facility combinations and price ordering stay consistent in campus grid and map',()=>{
  const originalOrder=accommodations.map(item=>item.id);
  const params=new URLSearchParams({university:'Amity University',facilities:'Food,Laundry',distance:'1',max:'10000',sort:'price-low'});
  const expected=['a11','a14','a1','a10'];
  assert.deepEqual(filterAccommodations(accommodations,params).map(item=>item.id),expected);
  params.set('view','map');
  assert.deepEqual(filterAccommodations(accommodations,params).map(item=>item.id),expected);
  params.set('sort','price-high');
  assert.deepEqual(filterAccommodations(accommodations,params).map(item=>item.id),[...expected].reverse());
  assert.deepEqual(accommodations.map(item=>item.id),originalOrder);
});
