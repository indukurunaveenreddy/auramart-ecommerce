/**
 * Amazon.in Associates Program Integration
 * Associate ID: 8639866865-21
 */

export const AMAZON_ASSOCIATE_TAG = '8639866865-21';

/**
 * Generate a compliant Amazon.in affiliate tracking URL for a product.
 * Opens product search on Amazon.in tagged with your Associate ID.
 */
export function getAmazonAffiliateUrl(productName: string): string {
  const cleanName = productName
    .replace(/[^\w\s-]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 8)
    .join(' ');

  const encodedQuery = encodeURIComponent(cleanName);
  return `https://www.amazon.in/s?k=${encodedQuery}&tag=${AMAZON_ASSOCIATE_TAG}`;
}

/**
 * Standard Amazon Associates compliance statement required by Amazon Operating Agreement.
 */
export const AMAZON_DISCLOSURE =
  'As an Amazon Associate, AuraMart earns from qualifying purchases made via product links. Associate ID: 8639866865-21';
