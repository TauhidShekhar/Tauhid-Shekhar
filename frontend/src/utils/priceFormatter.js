/**
 * Dual Currency and Pricing Formatting Utility
 * Handles USD ($) and INR (₹) transparently with clear breakdown.
 */

export const USD_TO_INR_RATE = 84;

export const parseNumericPrice = (priceStr) => {
  if (!priceStr) return 0;
  const match = priceStr.toString().replace(/,/g, '').match(/\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
};

export const formatDualPrice = (priceStr, preferredCurrency = 'both') => {
  if (!priceStr) {
    return {
      primary: 'Custom Quote',
      secondary: '',
      numericUSD: 0,
      numericINR: 0,
      isCustom: true
    };
  }

  const str = priceStr.toString().trim();
  const num = parseNumericPrice(str);
  if (!num) {
    return {
      primary: str,
      secondary: '',
      numericUSD: 0,
      numericINR: 0,
      isCustom: true
    };
  }

  let usd = 0;
  let inr = 0;

  if (str.startsWith('₹') || str.toLowerCase().includes('inr')) {
    inr = Math.round(num);
    usd = Math.round(inr / USD_TO_INR_RATE);
  } else {
    // Default USD
    usd = Math.round(num);
    inr = Math.round(usd * USD_TO_INR_RATE);
  }

  const inrFormatted = `₹${inr.toLocaleString('en-IN')}`;
  const usdFormatted = `$${usd.toLocaleString('en-US')}`;

  if (preferredCurrency === 'INR') {
    return {
      primary: inrFormatted,
      secondary: usdFormatted,
      numericUSD: usd,
      numericINR: inr,
      isCustom: false
    };
  }

  if (preferredCurrency === 'USD') {
    return {
      primary: usdFormatted,
      secondary: inrFormatted,
      numericUSD: usd,
      numericINR: inr,
      isCustom: false
    };
  }

  // Dual format: Main USD with clear INR equivalent
  return {
    primary: usdFormatted,
    secondary: `(${inrFormatted})`,
    numericUSD: usd,
    numericINR: inr,
    isCustom: false
  };
};
