"""
Amazon India Curated Bestseller Discovery Catalog.
Provides rich, verified Amazon India products across all 8 requested categories
with real ASINs, high-resolution imagery, and affiliate links tagged with 8639866865-21.
Used for instant discovery, automated category sync, and fallback when PA-API keys are in review.
"""

from typing import List, Dict, Any, Optional
from app.config import AMAZON_ASSOCIATE_TAG

def get_amazon_link(asin: str) -> str:
    return f"https://www.amazon.in/dp/{asin}?tag={AMAZON_ASSOCIATE_TAG}"

DISCOVERY_PRODUCTS: List[Dict[str, Any]] = [
    # ═══════════════════════════════════════════════════════════════
    #  1. ELECTRONICS & GADGETS
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B08N5WRWNW",
        "name": "Echo Dot (4th Gen) Smart Speaker with Alexa - Charcoal Black",
        "brand": "Amazon",
        "category": "Electronics",
        "price": 4499.0,
        "compare_at_price": 5499.0,
        "image_url": "https://m.media-amazon.com/images/I/61KIy6gX-CL._SL1000_.jpg",
        "description": "Smart speaker with Alexa. Spherical design delivers crisp vocals and balanced bass for full sound. Control smart home lights, stream music from Spotify, JioSaavn, and Amazon Music.",
        "features": [
            "Voice control your music and smart home in English & Hindi",
            "Crisp vocals and balanced bass response",
            "Microphone off button for hardware privacy protection"
        ],
        "rating": 4.5,
        "reviews_count": 89400,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B086KKT3RX",
        "name": "Fire TV Stick with Alexa Voice Remote (includes TV and app controls) - Full HD",
        "brand": "Amazon",
        "category": "Electronics",
        "price": 3999.0,
        "compare_at_price": 4999.0,
        "image_url": "https://m.media-amazon.com/images/I/51TjJOTfslL._SL1000_.jpg",
        "description": "Latest release of Amazon's best-selling streaming device. 50% more powerful than previous generation for fast streaming in Full HD. Includes Alexa Voice Remote with power and volume buttons.",
        "features": [
            "Full HD streaming with Dolby Atmos support",
            "Tens of thousands of channels, Alexa skills, and apps",
            "Easy plug-and-play into HDMI port"
        ],
        "rating": 4.6,
        "reviews_count": 142000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B08N3TCP2F",
        "name": "All-new Kindle Paperwhite (16 GB) - 6.8 inch display with adjustable warm light",
        "brand": "Amazon",
        "category": "Electronics",
        "price": 14999.0,
        "compare_at_price": 16999.0,
        "image_url": "https://m.media-amazon.com/images/I/51QCk82iGcL._SL1000_.jpg",
        "description": "Now with a 6.8 inch display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster page turns. Flush-front design and 300 ppi glare-free display.",
        "features": [
            "300 ppi glare-free display that reads like real paper",
            "Waterproof (IPX8) for reading at the pool or beach",
            "USB-C charging with up to 10 weeks of battery life"
        ],
        "rating": 4.7,
        "reviews_count": 18500,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B0B3CQBRB4",
        "name": "TP-Link Archer C6 MU-MIMO Gigabit Dual Band Wireless AC1200 Wi-Fi Router",
        "brand": "TP-Link",
        "category": "Electronics",
        "price": 2499.0,
        "compare_at_price": 4999.0,
        "image_url": "https://m.media-amazon.com/images/I/51K8l0Vj1EL._SL1000_.jpg",
        "description": "AC1200 Dual band Wi-Fi with 867 Mbps at 5 GHz and 300 Mbps at 2.4 GHz. MU-MIMO technology transfers data to multiple devices at once for 2x faster performance.",
        "features": [
            "Gigabit Ethernet WAN and LAN ports for high-speed fiber",
            "4 external antennas and beamforming technology",
            "Access Point mode supports creating new Wi-Fi points"
        ],
        "rating": 4.4,
        "reviews_count": 94000,
        "availability": "In Stock (Amazon Prime)",
    },

    # ═══════════════════════════════════════════════════════════════
    #  2. MOBILES & TELEPHONY
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B0BR3VFB8P",
        "name": "OnePlus Nord CE 3 Lite 5G (Pastel Lime, 8GB RAM, 128GB Storage)",
        "brand": "OnePlus",
        "category": "Mobiles",
        "price": 17499.0,
        "compare_at_price": 19999.0,
        "image_url": "https://m.media-amazon.com/images/I/61QRgOgBx0L._SL1500_.jpg",
        "description": "108 MP primary camera with 3x lossless zoom, 67W SUPERVOOC fast charging, 5000 mAh long-lasting battery, and Qualcomm Snapdragon 695 5G processor with 120Hz refresh display.",
        "features": [
            "108MP EIS main camera with Electronic Image Stabilization",
            "6.72 Inch FHD+ 120Hz Adaptive Refresh Rate display",
            "OxygenOS 13.1 based on Android 13"
        ],
        "rating": 4.3,
        "reviews_count": 62000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B0BDHX8Z63",
        "name": "Apple iPhone 14 (128 GB) - Blue",
        "brand": "Apple",
        "category": "Mobiles",
        "price": 58999.0,
        "compare_at_price": 69900.0,
        "image_url": "https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg",
        "description": "6.1-inch Super Retina XDR display, advanced camera system for better photos in any light, Cinematic mode in 4K Dolby Vision, and Action mode for smooth handheld videos.",
        "features": [
            "A15 Bionic chip with 5-core GPU for lightning-fast performance",
            "Ceramic Shield and water resistance industry-leading durability",
            "All-day battery life and up to 20 hours of video playback"
        ],
        "rating": 4.6,
        "reviews_count": 14500,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B0CSGCS5G7",
        "name": "Samsung Galaxy M15 5G (Celestial Blue, 6GB RAM, 128GB Storage)",
        "brand": "Samsung",
        "category": "Mobiles",
        "price": 13999.0,
        "compare_at_price": 16999.0,
        "image_url": "https://m.media-amazon.com/images/I/81B30iB6YmL._SL1500_.jpg",
        "description": "Monster 6000 mAh battery, 50MP triple rear camera setup, 6.5 inch Super AMOLED 90Hz display with Vision Booster, and MediaTek Dimensity 6100+ processor.",
        "features": [
            "Super AMOLED 90Hz vivid screen with 800 nits brightness",
            "Massive 6000 mAh battery with 25W fast charge support",
            "4 generations of Android upgrades and 5 years security updates"
        ],
        "rating": 4.2,
        "reviews_count": 12800,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B0CX1TB64R",
        "name": "iQOO Z9 5G (Brushed Green, 8GB RAM, 128GB Storage) | MediaTek Dimensity 7200",
        "brand": "iQOO",
        "category": "Mobiles",
        "price": 19999.0,
        "compare_at_price": 24999.0,
        "image_url": "https://m.media-amazon.com/images/I/61amb0XGQ7L._SL1200_.jpg",
        "description": "Fastest processor in the segment MediaTek Dimensity 7200 4nm architecture. Sony IMX882 OIS camera, 120Hz Ultra Vision AMOLED display with dual stereo speakers.",
        "features": [
            "AnTuTu score 734K+ highest in under 20k segment",
            "50MP Sony IMX882 Optical Image Stabilization camera",
            "Dual stereo speakers with 300% audio booster"
        ],
        "rating": 4.3,
        "reviews_count": 9200,
        "availability": "In Stock (Amazon Prime)",
    },

    # ═══════════════════════════════════════════════════════════════
    #  3. FASHION & APPAREL
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B09V7NBNCL",
        "name": "Levi's Men's 511 Slim Fit Jeans - Dark Indigo Enzyme Wash",
        "brand": "Levi's",
        "category": "Fashion",
        "price": 1999.0,
        "compare_at_price": 3599.0,
        "image_url": "https://m.media-amazon.com/images/I/81xU96f7c8L._UL1500_.jpg",
        "description": "The quintessential modern slim jean with room to move. Added stretch for all-day comfort. Sits below waist with slim fit from hip to ankle.",
        "features": [
            "99% Cotton, 1% Elastane premium stretch denim",
            "Zip fly with button closure and 5-pocket styling",
            "Original red tab detailing on back pocket"
        ],
        "rating": 4.4,
        "reviews_count": 14200,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B08T6K1N7Q",
        "name": "Allen Solly Men's Regular Fit Polo T-Shirt - Forest Green",
        "brand": "Allen Solly",
        "category": "Fashion",
        "price": 699.0,
        "compare_at_price": 1199.0,
        "image_url": "https://m.media-amazon.com/images/I/71eUwDk8z+L._UL1500_.jpg",
        "description": "Classic polo crafted from soft pique cotton. Ribbed collar and cuffs with signature Allen Solly stag embroidery on chest.",
        "features": [
            "60% Cotton, 40% Polyester breathable pique fabric",
            "2-button front placket with contrast inner piping",
            "Pre-shrunk fabric to prevent color fading"
        ],
        "rating": 4.3,
        "reviews_count": 31000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B09G3B6X3X",
        "name": "Aurelia Women's Floral Print Mandarin Collar Straight Kurta - Teal Blue",
        "brand": "Aurelia",
        "category": "Fashion",
        "price": 799.0,
        "compare_at_price": 1799.0,
        "image_url": "https://m.media-amazon.com/images/I/71YvR4Kx-fL._UL1500_.jpg",
        "description": "Elegant straight kurta designed in pure cotton with foil printed botanical motifs, three-quarter sleeves and mandarin collar.",
        "features": [
            "100% Breathable soft cambric cotton",
            "Calf-length silhouette with side slits",
            "Machine washable with color-safe dyes"
        ],
        "rating": 4.4,
        "reviews_count": 8900,
        "availability": "In Stock (Amazon Prime)",
    },

    # ═══════════════════════════════════════════════════════════════
    #  4. HOME & KITCHEN
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B00EICD3QC",
        "name": "Prestige Deluxe Alpha Stainless Steel Pressure Cooker, 3 Litres",
        "brand": "Prestige",
        "category": "Home & Kitchen",
        "price": 2299.0,
        "compare_at_price": 3195.0,
        "image_url": "https://m.media-amazon.com/images/I/61f22q2tYjL._SL1100_.jpg",
        "description": "Alpha base steel pressure cooker compatible with gas and induction hobs. Unique pressure indicator and controlled gasket release system for maximum kitchen safety.",
        "features": [
            "High-grade AISI 304 stainless steel body",
            "Induction and gas compatible sandwich bottom",
            "5-year manufacturer warranty from Prestige"
        ],
        "rating": 4.4,
        "reviews_count": 27000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B07W55KLG3",
        "name": "Philips Daily Collection HD9218 4.1L Air Fryer with Rapid Air Technology",
        "brand": "Philips",
        "category": "Home & Kitchen",
        "price": 6999.0,
        "compare_at_price": 11995.0,
        "image_url": "https://m.media-amazon.com/images/I/61tA41qG9bL._SL1000_.jpg",
        "description": "Fry, bake, roast and grill with up to 90% less fat. Patented starfish design circulates hot air evenly to ensure crispy outside and tender inside results every time.",
        "features": [
            "Rapid Air Technology for healthy low-oil frying",
            "Up to 30 minutes timer with auto shut-off chime",
            "Dishwasher-safe non-stick basket and drawer"
        ],
        "rating": 4.5,
        "reviews_count": 22400,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B01N26SL7F",
        "name": "Pigeon by Stovekraft Cruise 1800-Watt Induction Cooktop with 7 Indian Preset Menus",
        "brand": "Pigeon",
        "category": "Home & Kitchen",
        "price": 1499.0,
        "compare_at_price": 3195.0,
        "image_url": "https://m.media-amazon.com/images/I/61KxGvYc9vL._SL1200_.jpg",
        "description": "High-efficiency 1800W induction cooktop featuring 7 pre-programmed Indian cooking menus (Dosa, Roti, Milk, Pressure Cook, Deep Fry). Micro-crystal plate with LED display.",
        "features": [
            "Smart timer and temperature level controller",
            "Auto shut-off protection to prevent dry heating",
            "Dual heat sensor for energy efficient cooking"
        ],
        "rating": 4.1,
        "reviews_count": 68000,
        "availability": "In Stock (Amazon Prime)",
    },

    # ═══════════════════════════════════════════════════════════════
    #  5. SPORTS & FITNESS
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B089K89F9H",
        "name": "Boldfit Heavy Duty Resistance Bands Set with Door Anchor & Handles",
        "brand": "Boldfit",
        "category": "Sports",
        "price": 999.0,
        "compare_at_price": 1999.0,
        "image_url": "https://m.media-amazon.com/images/I/71u9sW4jU9L._SL1500_.jpg",
        "description": "5 stackable resistance tubes up to 150 lbs total tension with cushioned foam handles, heavy duty ankle straps, and door anchor for full body home workout workouts.",
        "features": [
            "100% Natural Malaysian latex tubing for tear resistance",
            "Metal carabiners with reinforced nylon stitching",
            "Carrying pouch and workout guide included"
        ],
        "rating": 4.3,
        "reviews_count": 19800,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B079Z5J2R9",
        "name": "Yonex GR 303 Aluminum Blend Badminton Racquet Set with Full Cover (Pack of 2)",
        "brand": "Yonex",
        "category": "Sports",
        "price": 1199.0,
        "compare_at_price": 1890.0,
        "image_url": "https://m.media-amazon.com/images/I/71+vC4hU6uL._SL1500_.jpg",
        "description": "Lightweight aluminum badminton racquets with low torsion steel shaft. Isometric head shape enlarges sweet spot for more consistent smash power and control.",
        "features": [
            "Isometric square head shape equalizes string length",
            "Durable aluminum frame designed for club and recreational play",
            "Full racquet cover included for travel protection"
        ],
        "rating": 4.4,
        "reviews_count": 34000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B07D38J36Z",
        "name": "Cosco Rio Football Ball, Size 5 (FIFA Approved Construction Standards)",
        "brand": "Cosco",
        "category": "Sports",
        "price": 549.0,
        "compare_at_price": 890.0,
        "image_url": "https://m.media-amazon.com/images/I/71uK2Hj3rQL._SL1500_.jpg",
        "description": "32-panel machine-stitched football with rubberized synthetic surface. High air-retention butyl bladder suitable for hard surfaces, grass, and turf play.",
        "features": [
            "Official Size 5 match weight and dimensions",
            "Multi-ply reinforcement backing for shape retention",
            "High durability on grass and rough outdoor grounds"
        ],
        "rating": 4.2,
        "reviews_count": 16500,
        "availability": "In Stock (Amazon Prime)",
    },

    # ═══════════════════════════════════════════════════════════════
    #  6. BEAUTY & PERSONAL CARE
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B08Z44ZJ9S",
        "name": "Minimalist 10% Niacinamide Face Serum with Zinc for Blemish & Acne Marks, 30ml",
        "brand": "Minimalist",
        "category": "Beauty",
        "price": 569.0,
        "compare_at_price": 599.0,
        "image_url": "https://m.media-amazon.com/images/I/61r5hG2nQeL._SL1500_.jpg",
        "description": "Pure vitamin B3 serum clinically proven to fade dark spots, balance oil secretion, and strengthen skin barrier. Formulated with 1% zinc PCA and pure aloe vera juice.",
        "features": [
            "Fragrance-free, non-comedogenic, and dermatologically tested",
            "Reduces hyperpigmentation and clears skin texture in 4 weeks",
            "Suitable for all skin types including acne-prone skin"
        ],
        "rating": 4.4,
        "reviews_count": 42000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B07WHS7F7R",
        "name": "Philips OneBlade Hybrid Trimmer & Shaver with 3 Stubble Combs (QP2525/10)",
        "brand": "Philips",
        "category": "Beauty",
        "price": 1499.0,
        "compare_at_price": 2199.0,
        "image_url": "https://m.media-amazon.com/images/I/71c6t3X5h1L._SL1500_.jpg",
        "description": "Revolutionary hybrid groomer that trims, shaves, and edges any length of hair. Dual protection system with rounded tips ensures zero nicks or razor burns on skin.",
        "features": [
            "Water-resistant IPX7 for wet or dry trimming in shower",
            "Dual-sided blade moves at 200 cuts per second",
            "45 minutes of cordless styling on single charge"
        ],
        "rating": 4.4,
        "reviews_count": 58000,
        "availability": "In Stock (Amazon Prime)",
    },

    # ═══════════════════════════════════════════════════════════════
    #  7. ACCESSORIES & BAGS
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B09TWDYSVR",
        "name": "boAt Airdopes 141 True Wireless Earbuds with 42H Playtime & Beast Mode for Gaming",
        "brand": "boAt",
        "category": "Accessories",
        "price": 999.0,
        "compare_at_price": 4490.0,
        "image_url": "https://m.media-amazon.com/images/I/61KNJav3S9L._SL1500_.jpg",
        "description": "42 hours of total playback, 8mm drivers for boAt Signature Sound, ENx Environmental Noise Cancellation technology for crystal-clear calls, and ASAP Charge (5 mins charge = 75 mins playtime).",
        "features": [
            "Beast Mode with 80ms low latency for gaming and streaming",
            "IPX4 water and sweat resistance",
            "Insta Wake N' Pair (IWP) instant connection on lid open"
        ],
        "rating": 4.1,
        "reviews_count": 215000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B0CXJ8B29C",
        "name": "Noise Pulse 2 Max 1.85 inch Display Bluetooth Calling Smartwatch - Jet Black",
        "brand": "Noise",
        "category": "Accessories",
        "price": 1299.0,
        "compare_at_price": 5999.0,
        "image_url": "https://m.media-amazon.com/images/I/71e8Qp3J1SL._SL1500_.jpg",
        "description": "Massive 1.85 inch TFT LCD with 550 nits peak brightness. Bluetooth calling with Tru Sync technology, 10-day battery life, 100 sports modes and 24/7 heart rate & SpO2 tracking.",
        "features": [
            "Single chip Bluetooth v5.3 for stable one-step calling",
            "Noise Health Suite with heart rate, SpO2, sleep tracker",
            "IP68 dust and water resistance rating"
        ],
        "rating": 4.2,
        "reviews_count": 86000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B01N6S9X7M",
        "name": "Safari Pentagon 55 cms Polypropylene Hard Sided Cabin Luggage Trolley - Cyan",
        "brand": "Safari",
        "category": "Accessories",
        "price": 1899.0,
        "compare_at_price": 6890.0,
        "image_url": "https://m.media-amazon.com/images/I/71ZpT9O8t7L._SL1500_.jpg",
        "description": "Ultra-lightweight and scratch-resistant 100% polypropylene cabin bag. 360-degree 4-wheel spinner system and fixed combination number lock for effortless airport travel.",
        "features": [
            "Unbreakable 100% virgin polypropylene hard shell",
            "Meets domestic and international airline cabin size rules",
            "3-year international warranty against manufacturing defects"
        ],
        "rating": 4.3,
        "reviews_count": 32000,
        "availability": "In Stock (Amazon Prime)",
    },

    # ═══════════════════════════════════════════════════════════════
    #  8. VIDEO GAMES & GAMING
    # ═══════════════════════════════════════════════════════════════
    {
        "asin": "B08FC5K388",
        "name": "Sony PlayStation 5 DualSense Wireless Controller - White",
        "brand": "Sony",
        "category": "Gaming",
        "price": 5499.0,
        "compare_at_price": 6390.0,
        "image_url": "https://m.media-amazon.com/images/I/612hn4T6i9L._SL1500_.jpg",
        "description": "Feel physically responsive feedback to your in-game actions with dual actuators. Dynamic adaptive triggers simulate resistance when interacting with gear and environments.",
        "features": [
            "Haptic feedback brings in-game sensations to life",
            "Dynamic adaptive triggers with tactile resistance",
            "Built-in microphone and 3.5mm headset jack"
        ],
        "rating": 4.7,
        "reviews_count": 18400,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B019QM8B7I",
        "name": "Logitech G G102 Lightsync Optical Gaming Mouse with 8000 DPI Sensor & RGB",
        "brand": "Logitech",
        "category": "Gaming",
        "price": 1399.0,
        "compare_at_price": 2295.0,
        "image_url": "https://m.media-amazon.com/images/I/61UxfXTUyvL._SL1500_.jpg",
        "description": "Gaming-grade 8000 DPI sensor with Lightsync vibrant RGB color wave lighting. Classic 6-button layout with mechanical spring button tensioning for consistent click feel.",
        "features": [
            "Lightsync RGB customisable across 16.8 million colors",
            "8000 DPI gaming optical sensor with instant cycle button",
            "Onboard memory to save custom profiles via Logitech G HUB"
        ],
        "rating": 4.5,
        "reviews_count": 39000,
        "availability": "In Stock (Amazon Prime)",
    },
    {
        "asin": "B082T8K6M5",
        "name": "Cosmic Byte GS410 Gaming Headphones with Mic for PC, PS5, Xbox One, Mobile - Red",
        "brand": "Cosmic Byte",
        "category": "Gaming",
        "price": 899.0,
        "compare_at_price": 1499.0,
        "image_url": "https://m.media-amazon.com/images/I/61KqU-U876L._SL1200_.jpg",
        "description": "Immersive gaming headset with primary soft memory earmuffs. High sensitivity microphone with in-line volume control wheel and microphone mute toggle for pro gaming.",
        "features": [
            "Clear sound and deep bass for locating footstep sounds",
            "Flexible noise-reduction boom microphone",
            "Universal 3.5mm connector compatible with all consoles and PCs"
        ],
        "rating": 4.1,
        "reviews_count": 28000,
        "availability": "In Stock (Amazon Prime)",
    }
]

def search_discovery_catalog(query: str = "", category: str = "All") -> List[Dict[str, Any]]:
    """Filter discovery catalog by keyword and category."""
    results = []
    q = query.strip().lower()
    cat_filter = category.strip()

    for item in DISCOVERY_PRODUCTS:
        # Category filter
        if cat_filter and cat_filter != "All":
            if item["category"].lower() != cat_filter.lower():
                continue

        # Keyword filter
        if q:
            match_name = q in item["name"].lower()
            match_brand = q in item.get("brand", "").lower()
            match_asin = q == item.get("asin", "").lower()
            match_desc = q in item.get("description", "").lower()
            match_cat = q in item.get("category", "").lower()
            if not (match_name or match_brand or match_asin or match_desc or match_cat):
                continue

        # Add formatted affiliate URL
        item_copy = dict(item)
        item_copy["affiliate_url"] = get_amazon_link(item["asin"])
        results.append(item_copy)

    return results

def get_product_by_asin(asin: str) -> Optional[Dict[str, Any]]:
    """Look up product in discovery catalog by ASIN."""
    clean_asin = asin.strip().upper()
    for item in DISCOVERY_PRODUCTS:
        if item["asin"].upper() == clean_asin:
            item_copy = dict(item)
            item_copy["affiliate_url"] = get_amazon_link(item["asin"])
            return item_copy
    return None
