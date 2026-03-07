// utils/format.ts

/**
 * Format amount from smallest unit (wei) to display unit with proper decimals
 * @param amount - Amount in smallest unit (string or number)
 * @param decimals - Number of decimals (default 18 for EGLD)
 * @returns Formatted string with 4 decimal places
 */
export const formatAmount = (amount: string | number | bigint, decimals: number = 18): string => {
  try {
    if (amount === undefined || amount === null || amount === '') {
      return '0.0000';
    }

    // Handle BigInt
    if (typeof amount === 'bigint') {
      return (Number(amount) / 10 ** decimals).toFixed(4);
    }

    // Handle string or number
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(num)) {
      return '0.0000';
    }

    // Prevent scientific notation for small numbers
    const result = num / 10 ** decimals;
    return result.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  } catch (error) {
    console.error('Error formatting amount:', error);
    return '0.0000';
  }
};

/**
 * Format timestamp to human readable date string
 * @param timestamp - Unix timestamp (seconds)
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number, options?: Intl.DateTimeFormatOptions): string => {
  try {
    if (!timestamp || timestamp <= 0) {
      return 'Invalid date';
    }

    const date = new Date(timestamp * 1000);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options,
    };

    return date.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param timestamp - Unix timestamp (seconds)
 * @returns Relative time string
 */
export const formatRelativeTime = (timestamp: number): string => {
  try {
    const now = Math.floor(Date.now() / 1000);
    const diff = timestamp - now;

    if (diff < 0) {
      const absDiff = Math.abs(diff);
      if (absDiff < 60) return 'Just now';
      if (absDiff < 3600) return `${Math.floor(absDiff / 60)}m ago`;
      if (absDiff < 86400) return `${Math.floor(absDiff / 3600)}h ago`;
      return `${Math.floor(absDiff / 86400)}d ago`;
    } else {
      if (diff < 60) return 'in seconds';
      if (diff < 3600) return `in ${Math.floor(diff / 60)}m`;
      if (diff < 86400) return `in ${Math.floor(diff / 3600)}h`;
      return `in ${Math.floor(diff / 86400)}d`;
    }
  } catch (error) {
    return 'Unknown';
  }
};

/**
 * Format address (truncate middle)
 * @param address - Full address string
 * @param startChars - Characters to show at start (default 6)
 * @param endChars - Characters to show at end (default 4)
 * @returns Truncated address (e.g., "erd1qq...qqqq")
 */
export const formatAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length < startChars + endChars + 3) {
    return address || '';
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format token ticker/name
 * @param ticker - Token ticker string
 * @returns Uppercase ticker
 */
export const formatTicker = (ticker: string): string => {
  return ticker?.toUpperCase() || '';
};

/**
 * Format price with currency symbol
 * @param amount - Amount value
 * @param currency - Currency symbol (default 'EGLD')
 * @param decimals - Token decimals
 * @returns Formatted price string
 */
export const formatPrice = (
  amount: string | number,
  currency: string = 'EGLD',
  decimals: number = 18
): string => {
  const formatted = formatAmount(amount, decimals);
  return `${formatted} ${currency}`;
};

/**
 * Format number with commas for thousands
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | string): string => {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-US');
};

/**
 * Shorten large numbers (K, M, B)
 * @param num - Number to shorten
 * @returns Shortened string (e.g., "1.5K", "2M")
 */
export const shortenNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Format percentage
 * @param value - Value (e.g., 0.05 for 5%)
 * @param decimals - Decimal places
 * @returns Percentage string (e.g., "5.00%")
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return (value * 100).toFixed(decimals) + '%';
};

/**
 * Parse input amount to blockchain format (multiply by 10^decimals)
 * @param amount - User input amount (e.g., "1.5")
 * @param decimals - Token decimals
 * @returns BigInt string representation for blockchain
 */
export const parseAmount = (amount: string, decimals: number = 18): string => {
  try {
    if (!amount || isNaN(parseFloat(amount))) {
      return '0';
    }
    // Handle decimal input
    const [whole, fraction = ''] = amount.split('.');
    const fractionPadded = fraction.padEnd(decimals, '0').slice(0, decimals);
    const result = whole + fractionPadded;
    return BigInt(result).toString();
  } catch (error) {
    console.error('Error parsing amount:', error);
    return '0';
  }
};

// Default export for compatibility
export default {
  formatAmount,
  formatDate,
  formatRelativeTime,
  formatAddress,
  formatTicker,
  formatPrice,
  formatNumber,
  shortenNumber,
  formatPercent,
  parseAmount,
};
