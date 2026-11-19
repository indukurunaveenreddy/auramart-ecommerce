/**
 * Pure e-commerce product image fallbacks and resolver.
 * Every category and product keyword is mapped to authentic product photography:
 * Clean studio shots, flat-lays, and isolated merchandise with NO facial portraits.
 */

// Category default fallbacks (clean product studio shots)
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  clothing: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  accessories: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
  groceries: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  electronics: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  'home-kitchen': 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600&auto=format&fit=crop&q=80',
  'beauty-personal-care': 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop&q=80',
  'sports-fitness': 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
  'toys-baby': 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80',
};

// Keyword-specific pure product photos (flat lays, clean studio packshots)
const PRODUCT_TYPE_IMAGES: Array<{ keywords: string[]; url: string }> = [
  // T-Shirts
  {
    keywords: ['t-shirt', 't shirt', 'tshirt', 'tee', 'polo shirt'],
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
  },
  // Shirts
  {
    keywords: ['shirt', 'formal shirt', 'cotton shirt', 'linen shirt'],
    url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
  },
  // Jeans & Denim
  {
    keywords: ['jeans', 'denim', 'trousers', 'chino'],
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
  },
  // Hoodies & Sweatshirts
  {
    keywords: ['hoodie', 'sweatshirt', 'fleece', 'pullover'],
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
  },
  // Jackets
  {
    keywords: ['jacket', 'windcheater', 'bomber', 'blazer', 'coat'],
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
  },
  // Sarees & Ethnic
  {
    keywords: ['saree', 'sari', 'kurta', 'kurti', 'ethnic', 'lehenga', 'dupatta'],
    url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80',
  },
  // Dresses & Skirts
  {
    keywords: ['dress', 'skirt', 'midi', 'gown', 'frock'],
    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80',
  },
  // Shoes & Sneakers
  {
    keywords: ['sneaker', 'running shoe', 'formal shoe', 'loafers', 'sports shoe', 'shoes'],
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
  },
  // Sandals & Slippers
  {
    keywords: ['sandal', 'slipper', 'flip flop', 'clog'],
    url: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80',
  },
  // Watches
  {
    keywords: ['watch', 'chronograph', 'analog watch', 'wrist watch', 'smart watch', 'smartwatch'],
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80',
  },
  // Handbags & Purses
  {
    keywords: ['handbag', 'tote', 'purse', 'shoulder bag', 'clutch', 'crossbody'],
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
  },
  // Backpacks & Luggage
  {
    keywords: ['backpack', 'trolley', 'duffel', 'luggage', 'travel bag', 'suitcase'],
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
  },
  // Wallets & Belts
  {
    keywords: ['wallet', 'card holder', 'leather wallet'],
    url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['belt', 'leather belt'],
    url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&auto=format&fit=crop&q=80',
  },
  // Sunglasses
  {
    keywords: ['sunglass', 'sunglasses', 'eyewear', 'shades', 'spectacles', 'aviator'],
    url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
  },
  // Jewellery
  {
    keywords: ['jewel', 'necklace', 'earring', 'pendant', 'bracelet', 'ring', 'bangle', 'anklet'],
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  },
  // Smartphones & Mobiles
  {
    keywords: ['smartphone', 'phone', 'mobile', 'iphone', 'galaxy', 'android'],
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
  },
  // Laptops
  {
    keywords: ['laptop', 'notebook', 'macbook', 'ultrabook', 'thinkpad'],
    url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
  },
  // Tablets
  {
    keywords: ['tablet', 'ipad'],
    url: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=600&auto=format&fit=crop&q=80',
  },
  // Headphones & Earbuds
  {
    keywords: ['headphone', 'headset', 'audio'],
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['earbud', 'airpod', 'tws', 'earphone'],
    url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
  },
  // Bluetooth Speakers & Soundbars
  {
    keywords: ['speaker', 'soundbar', 'sound bar', 'home audio'],
    url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
  },
  // Smart TVs
  {
    keywords: ['tv', 'television', 'smart tv', 'screen'],
    url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&auto=format&fit=crop&q=80',
  },
  // PC Keyboards & Mice
  {
    keywords: ['keyboard', 'mechanical keyboard'],
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['mouse', 'optical mouse'],
    url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80',
  },
  // Cameras
  {
    keywords: ['camera', 'dslr', 'lens', 'tripod', 'cam'],
    url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
  },
  // Rice & Grains
  {
    keywords: ['rice', 'basmati', 'grain', 'wheat', 'atta', 'flour'],
    url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
  },
  // Dals & Pulses
  {
    keywords: ['dal', 'pulse', 'lentil', 'toor dal', 'moong dal', 'chana'],
    url: 'https://images.unsplash.com/photo-1585994192701-f1a505c817ea?w=600&auto=format&fit=crop&q=80',
  },
  // Cooking Oil & Ghee
  {
    keywords: ['oil', 'cooking oil', 'sunflower oil', 'ghee'],
    url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
  },
  // Tea & Coffee
  {
    keywords: ['tea', 'chai', 'green tea'],
    url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['coffee', 'espresso', 'cappuccino'],
    url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80',
  },
  // Chocolates & Biscuits
  {
    keywords: ['chocolate', 'candy', 'sweet'],
    url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
  },
  {
    keywords: ['biscuit', 'cookie', 'cookies', 'wafer'],
    url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
  },
  // Dry Fruits & Nuts
  {
    keywords: ['almond', 'cashew', 'dry fruit', 'nut', 'walnut', 'raisin'],
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
  },
  // Spices & Masala
  {
    keywords: ['spice', 'masala', 'pepper', 'turmeric', 'chilli'],
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
  },
  // Baby & Toys
  {
    keywords: ['toy', 'doll', 'car toy', 'blocks', 'puzzle', 'game', 'baby'],
    url: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80',
  },
];

/**
 * Returns an authentic, pure product photograph matching product title or category.
 */
export function getProductFallbackImage(categorySlug?: string, productName?: string): string {
  const nameLower = (productName || '').toLowerCase();

  for (const item of PRODUCT_TYPE_IMAGES) {
    if (item.keywords.some((kw) => nameLower.includes(kw))) {
      return item.url;
    }
  }

  if (categorySlug && CATEGORY_FALLBACK_IMAGES[categorySlug]) {
    return CATEGORY_FALLBACK_IMAGES[categorySlug];
  }

  return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80';
}
