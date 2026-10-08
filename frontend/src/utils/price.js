const indian = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });
export function formatPrice(amount, { mode = 'rent', compact = false } = {}) {
  const number = Number(amount);
  if (amount == null || amount === '' || !Number.isFinite(number) || number < 0) return 'Price on request';
  if (mode === 'buy' && number >= 10000000) return `₹${indian.format(number / 10000000)} Cr`;
  if (mode === 'buy' && number >= 100000) return `₹${indian.format(number / 100000)} Lakh`;
  if (compact && number >= 1000) return `₹${indian.format(number / 1000)}k`;
  return `₹${indian.format(number)}`;
}
export const listingPrice = property => property?.listingFor === 'buy' ? property?.salePrice : property?.rent;
export function priceRangeLabel(min, max, mode = 'rent') {
  if (!min && !max) return 'Any budget';
  if (!min) return `Up to ${formatPrice(max, { mode, compact: true })}`;
  if (!max) return `${formatPrice(min, { mode, compact: true })}+`;
  return `${formatPrice(min, { mode, compact: true })} – ${formatPrice(max, { mode, compact: true })}`;
}
