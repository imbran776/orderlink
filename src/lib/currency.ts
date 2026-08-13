export const EXCHANGE_RATE = 15000; // 1 USD = 15,000 IDR

export const formatCurrency = (amount: any, currency: 'USD' | 'IDR'): string => {
  const num = typeof amount === 'string' ? Number(amount) : amount;
  if (isNaN(num)) return amount;
  if (currency === 'IDR') {
    // Backend already returns IDR values, no conversion needed
    return 'Rp ' + num.toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return '$' + num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatCurrencyCompact = (amount: number, currency: 'USD' | 'IDR'): string => {
  if (currency === 'IDR') {
    // Backend already returns IDR values, no conversion needed
    if (amount >= 1_000_000_000) {
      return 'Rp ' + (amount / 1_000_000_000).toFixed(1) + 'M';
    }
    if (amount >= 1_000_000) {
      return 'Rp ' + (amount / 1_000_000).toFixed(1) + 'Jt';
    }
    return 'Rp ' + amount.toLocaleString('id-ID');
  }
  
  if (amount >= 1_000_000) {
    return '$' + (amount / 1_000_000).toFixed(1) + 'M';
  }
  if (amount >= 1_000) {
    return '$' + (amount / 1_000).toFixed(1) + 'K';
  }
  return '$' + amount.toLocaleString('en-US');
};
