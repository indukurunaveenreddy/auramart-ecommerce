/**
 * Amazon.in Associates Program Integration
 * Associate ID: 8639866865-21
 */

export const AMAZON_ASSOCIATE_TAG = '8639866865-21';

/**
 * Generate a compliant Amazon.in affiliate tracking URL for a product.
 * If ASIN is provided, routes directly to product detail page (/dp/ASIN).
 * Otherwise opens targeted product search on Amazon.in.
 */
export function getAmazonAffiliateUrl(
  productName: string,
  asin?: string | null,
  customUrl?: string | null
): string {
  if (customUrl && customUrl.startsWith('http')) {
    if (!customUrl.includes('tag=')) {
      const sep = customUrl.includes('?') ? '&' : '?';
      return `${customUrl}${sep}tag=${AMAZON_ASSOCIATE_TAG}`;
    }
    return customUrl;
  }

  // If valid 10-character ASIN (standard Amazon ASIN format)
  if (asin && /^[A-Z0-9]{10}$/i.test(asin.trim()) && !asin.startsWith('AURA')) {
    return `https://www.amazon.in/dp/${asin.trim()}?tag=${AMAZON_ASSOCIATE_TAG}`;
  }

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
