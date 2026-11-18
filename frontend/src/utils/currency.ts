/**
 * Formats a number into Indian Rupees (INR) format: e.g. ₹24,999
 */
export const formatPrice = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }
  return '₹' + Math.round(amount).toLocaleString('en-IN');
};

export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_FEE = 99;
export const GST_RATE = 0.18;
