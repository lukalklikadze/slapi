// utils/helpers.ts

export const generateAPIKey = (): string => {
  return `sk_test_${Math.random().toString(36).substr(2, 32)}`;
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateAccountNumber = (): string => {
  return Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join(
    ''
  );
};

export const generateWalletAddress = (): string => {
  return (
    '0x' +
    Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  );
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'GEL' ? 'USD' : currency,
  })
    .format(amount)
    .replace('$', currency === 'GEL' ? '₾' : '$');
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
