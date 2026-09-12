export const currency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

export const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

export const CLEANING_FEE = 60;
export const SERVICE_FEE_RATE = 0.12;
export const TAX_RATE = 0.08;

export const priceBreakdown = (nightlyRate, nights) => {
  const stay = nightlyRate * nights;
  // Long stays get a 10% weekly discount, matching the badge shown on the card.
  const discount = nights >= 7 ? Math.round(stay * 0.1) : 0;
  const cleaning = nights > 0 ? CLEANING_FEE : 0;
  const service = Math.round((stay - discount) * SERVICE_FEE_RATE);
  const taxes = Math.round((stay - discount) * TAX_RATE);
  return {
    nights,
    stay,
    discount,
    cleaning,
    service,
    taxes,
    total: stay - discount + cleaning + service + taxes,
  };
};
