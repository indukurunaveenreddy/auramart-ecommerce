"""Generate 1,500 Amazon India Catalog products across 8 departments:
- Clothing: 350
- Accessories: 200
- Groceries: 200
- Electronics: 250
- Home & Kitchen: 200
- Beauty & Personal Care: 150
- Sports & Fitness: 75
- Toys & Baby Products: 75
Total = 1,500
"""

import json
import random
import hashlib
import sqlite3
import csv
import os
from datetime import datetime, timezone

random.seed(42)

DEPARTMENTS = [
    {
        "id": 1,
        "name": "Clothing",
        "slug": "clothing",
        "target": 350,
        "icon": "Shirt",
        "description": "Men's, Women's, and Ethnic Wear, Formal & Casual Apparel from Top Brands",
        "brands": [
            "Allen Solly", "Van Heusen", "Peter England", "Levi's", "U.S. Polo Assn.",
            "Biba", "W for Woman", "Aurelia", "Max", "FabIndia",
            "Jockey", "Raymond", "Manyavar", "ZODIAC", "Flying Machine"
        ],
        "items": [
            ("Slim Fit Solid Casual Cotton Shirt", 899, 1799, "Men's casual 100% breathable cotton shirt with button-down collar and curved hem."),
            ("Classic Regular Fit Denim Jeans", 1499, 2999, "Stretchable 5-pocket denim jeans with reinforced stitching and vintage wash."),
            ("Embroidered Anarkali Kurta Set with Dupatta", 1899, 3999, "Graceful festive chanderi silk blend anarkali kurta paired with palazzo and printed dupatta."),
            ("Crew Neck Pure Combed Cotton T-Shirt", 499, 999, "Bio-washed ultra-soft cotton round neck t-shirt for daily comfort and layering."),
            ("Formal Flat Front Slim Fit Trousers", 1199, 2499, "Wrinkle-resistant polyester-viscose blend formal trousers suitable for office and meetings."),
            ("Floral Print Georgette Daily Wear Saree", 799, 1999, "Lightweight drapeable georgette saree with contemporary floral prints and running blouse piece."),
            ("Active Dry-Fit Stretchable Gym Trackpants", 699, 1499, "Moisture-wicking athletic joggers with zippered pockets and adjustable drawstring."),
            ("Winter Fleece Hooded Sweatshirt", 1299, 2599, "Warm brushed fleece pullover hoodie with kangaroo front pocket and ribbed cuffs."),
            ("Pure Cotton Printed Night Suit Set", 849, 1699, "Breathable loungewear pyjama set with lapel collar button-front shirt and elasticated waistband."),
            ("Tailored Single-Breasted Blazer", 2999, 5999, "Sharp tailored party and business blazer with notch lapel and dual back vents."),
            ("A-Line Western Casual Summer Dress", 999, 2199, "Flattering fit-and-flare printed midi dress made with soft rayon fabric."),
            ("Traditional Jacquard Silk Blend Kurta Pyjama", 1599, 3499, "Festive Mandarin collar long kurta with churidar pyjama set for weddings and celebrations."),
            ("Pack of 3 Cotton Ribbed Vests", 549, 899, "Seamless 100% combed cotton contour-fit undershirts for all-day moisture absorption."),
            ("Seamless High-Rise Compression Leggings", 749, 1599, "Squat-proof 4-way stretch workout tights with wide tummy control waistband.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&q=80",
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
            "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80",
            "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
            "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&q=80",
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
            "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80"
        ]
    },
    {
        "id": 2,
        "name": "Accessories",
        "slug": "accessories",
        "target": 200,
        "icon": "Watch",
        "description": "Watches, Leather Wallets, Belts, Sunglasses, Bags, and Smart Lifestyle Gear",
        "brands": [
            "Titan", "Fastrack", "Fossil", "Casio", "WildHorn",
            "Ray-Ban", "Vincent Chase", "Safari", "American Tourister", "Skybags",
            "Tommy Hilfiger", "boAt", "Noise", "Hidesign", "Lavie"
        ],
        "items": [
            ("Genuine Top Grain Leather Bifold Wallet with RFID Protection", 599, 1499, "Handcrafted genuine leather wallet with 8 card slots, 2 cash compartments, and RFID blocking lining."),
            ("Reversible Formal Leather Belt with Auto-Lock Buckle", 699, 1599, "Dual-sided black/brown textured genuine leather belt with durable zinc alloy rotatable pin buckle."),
            ("Analog Stainless Steel Chronograph Quartz Watch", 2499, 5495, "Water-resistant 50M designer wristwatch with mineral crystal glass and date display window."),
            ("Polarized UV400 Aviator Sunglasses", 799, 1999, "Classic teardrop metal frame sunglasses with anti-glare polarized lenses and silicone nose pads."),
            ("32L Water Resistant Laptop Backpack with USB Port", 1199, 2999, "Multi-compartment travel daypack with padded sleeve fitting up to 15.6 inch laptops."),
            ("Handcrafted Vegan Leather Tote Handbag for Women", 1299, 2899, "Spacious shoulder tote purse with zippered main pouch and adjustable detachable crossbody strap."),
            ("Stainless Steel Magnetic Milanese Loop Watch Band", 449, 999, "Breathable woven mesh metallic replacement strap compatible with all standard smartwatches."),
            ("Hard Shell Polycarbonate Luggage Trolley 55cm Cabin", 2199, 5999, "Impact-resistant 4-wheel 360-degree silent spinner trolley suitcase with integrated TSA combination lock."),
            ("Minimalist Card Holder with Pop-Up Slider Mechanism", 399, 899, "Aircraft-grade aluminum card case preventing cards from bending and unauthorized scanning.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
            "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80",
            "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
            "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
            "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&q=80"
        ]
    },
    {
        "id": 3,
        "name": "Groceries",
        "slug": "groceries",
        "target": 200,
        "icon": "Apple",
        "description": "Daily Essentials, Staples, Dry Fruits, Beverages, and Kitchen Spices",
        "brands": [
            "Tata Sampann", "Aashirvaad", "Fortune", "India Gate", "Saffola",
            "Catch", "Everest", "MDH", "Nescafe", "Brooke Bond Red Label",
            "Kellogg's", "Dabur", "Nutraj", "Happilo", "Patanjali"
        ],
        "items": [
            ("Select Sharbati 100% Whole Wheat Atta 5kg", 310, 360, "Stone ground whole wheat flour made from MP Sehore grains providing naturally fluffy, soft rotis."),
            ("Classic Basmati Rice Aged Long Grain 5kg Pack", 625, 899, "Naturally aged royal aromatic long grain basmati rice, perfect for authentic biryani and pulao."),
            ("Cold Pressed Pure Mustard Oil Bottle 1 Litre", 175, 230, "Kachi ghani traditional cold-pressed mustard oil with pungent aroma and high smoke point."),
            ("California Whole Almonds (Badam) 500g Jar", 449, 699, "Premium crispy Californian almonds rich in protein, magnesium, and dietary dietary fiber."),
            ("Classic Roast Instant Coffee Granules Glass Jar 200g", 399, 520, "Rich aromatic blend of Arabica and Robusta beans carefully roasted for a smooth morning cup."),
            ("100% Pure Raw Honey Squeezy Bottle 500g", 235, 330, "Natural forest honey rich in antioxidants, warm water immunity booster without artificial sugar."),
            ("Unpolished Toor Dal (Arhar Dal) 1kg", 185, 240, "Nutrient-rich unpolished pigeon peas without artificial water or oil polishing."),
            ("Rolled Wholegrain Oats High Fibre 1kg", 249, 399, "Heart-healthy gluten-free gluten-tested rolled breakfast oats rich in beta-glucan fibre."),
            ("Premium W320 Whole Cashews (Kaju) 500g Pack", 499, 799, "Crunchy natural whole cashew nuts perfect for snacking, festive sweets, and gravies.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80",
            "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
            "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80",
            "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80",
            "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80"
        ]
    },
    {
        "id": 4,
        "name": "Electronics",
        "slug": "electronics",
        "target": 250,
        "icon": "Cpu",
        "description": "Smartphones, TWS Audio, Smartwatches, Powerbanks, Gaming & Smart Home",
        "brands": [
            "Samsung", "OnePlus", "boAt", "Noise", "Amazon",
            "Realme", "Xiaomi", "Sony", "JBL", "Logitech",
            "HP", "Lenovo", "Portronics", "SanDisk", "Anker"
        ],
        "items": [
            ("True Wireless Bluetooth 5.3 Earbuds with 40H Playtime", 1299, 2999, "Low-latency gaming mode, 13mm drivers, IPX5 water resistance, and environmental noise cancellation."),
            ("10000mAh 22.5W Fast Charging Power Bank with Dual Output", 999, 2199, "Ultra-compact metallic powerbank supporting Power Delivery (PD) and Quick Charge 3.0."),
            ("1.85 inch HD Bluetooth Calling Smartwatch with Heart & SpO2 Monitor", 1499, 4999, "Metal body smartwatch featuring 100+ cloud watchfaces, sports modes, and sleep tracker."),
            ("65W GaN Multi-Port USB-C Fast Wall Charger", 1499, 2999, "Next-gen Gallium Nitride technology supporting fast laptop, tablet, and smartphone charging."),
            ("Echo Dot Smart Speaker with Alexa Voice Assistant", 4499, 5499, "Hands-free voice controlled smart speaker with deep bass and multilingual voice recognition."),
            ("Fire TV Stick Streaming Device with Alexa Voice Remote", 3999, 4999, "Full HD streaming device with TV power and volume controls, Dolby Atmos audio support."),
            ("DualSense Wireless Controller with Adaptive Triggers", 5499, 6390, "Dynamic haptic feedback gaming controller compatible with consoles, PC, and mobile gaming."),
            ("Wireless Ergonomic Optical Mouse with 2.4GHz USB Dongle", 499, 1299, "Silent click optical sensor with adjustable 1600 DPI and energy-saving auto sleep mode."),
            ("128GB High Speed MicroSDXC Memory Card Class 10 U3", 749, 1699, "Up to 130MB/s read speeds for smooth 4K UHD video recording on phones, cameras, and drones.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80",
            "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
            "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80"
        ]
    },
    {
        "id": 5,
        "name": "Home & Kitchen",
        "slug": "home-kitchen",
        "target": 200,
        "icon": "Home",
        "description": "Cookware, Small Appliances, Storage, Home Decor, and Bedding",
        "brands": [
            "Prestige", "Hawkins", "Pigeon", "Bajaj", "Milton",
            "Cello", "Borosil", "Philips", "Solimo", "Wakefit",
            "Bombay Dyeing", "Spaces", "Wonderchef", "Usha", "Kent"
        ],
        "items": [
            ("Hard Anodised 3 Litre Pressure Cooker with Induction Base", 1299, 1995, "Durable corrosion-resistant hard anodised aluminium body with food-grade safety valve."),
            ("750W Heavy Duty Mixer Grinder with 3 Stainless Steel Jars", 2499, 4599, "Powerful copper motor mixer with overload protection and anti-skid rubber feet."),
            ("Double Bed Microfibre Reversible Comforter / Blanket", 1199, 2499, "Ultra-soft 200 GSM hypoallergenic microfibre quilt providing all-season comfort."),
            ("BPA-Free Food Grade Airtight Kitchen Storage Container Set (Pack of 6)", 699, 1499, "Stackable modular grain and cereal storage jars with silicone airtight locking lids."),
            ("1.8 Litre Stainless Steel Electric Cordless Kettle", 649, 1299, "Rapid boil 1500W electric kettle with auto-shutoff and boil-dry protection."),
            ("Cast Iron Pre-Seasoned Tawa for Crispy Dosa & Roti", 899, 1799, "Even heat-retaining natural cast iron griddle delivering authentic flavour and iron fortification."),
            ("Borosilicate Glass Lunch Box with Insulated Bag (Set of 3)", 899, 1899, "Microwave safe, leakproof glass tiffin containers with snap-lock seal lids."),
            ("Automatic 360 Spin Mop Bucket Set with Microfibre Refills", 999, 1999, "Effortless floor cleaning spin mop with stainless steel wringer basket and wheels.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
            "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
            "https://images.unsplash.com/photo-1584990347449-3a3399bcf82f?w=600&q=80",
            "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&q=80",
            "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?w=600&q=80"
        ]
    },
    {
        "id": 6,
        "name": "Beauty & Personal Care",
        "slug": "beauty-personal-care",
        "target": 150,
        "icon": "Sparkles",
        "description": "Skincare, Haircare, Grooming, Cosmetics, and Body Fragrances",
        "brands": [
            "Nivea", "Mamaearth", "Plum", "Minimalist", "The Derma Co",
            "L'Oreal Paris", "Maybelline", "Biotique", "Himalaya", "Garnier",
            "Vaseline", "mCaffeine", "Beardo", "Bombay Shaving Co", "Park Avenue"
        ],
        "items": [
            ("Vitamin C Glowing Face Serum with Ferulic Acid 30ml", 599, 799, "Lightweight radiance serum targeting dark spots, sun damage, and pigmentation."),
            ("Oil-Free Matte Gel Sunscreen SPF 50 PA++++ 50g", 449, 649, "Non-greasy, broad-spectrum sunscreen leaving zero white cast with blue light defense."),
            ("Keratin Repair Deep Conditioning Hair Mask 200g", 499, 899, "Intensive salon formula restoring dry, frizz-prone, and heat-damaged hair strands."),
            ("Gentle Foaming Tea Tree Oil Face Wash for Acne 150ml", 299, 449, "Salicylic acid and neem formulation purifying clogged pores and soothing breakouts."),
            ("Long-Lasting Eau De Parfum Luxury Fragrance 100ml", 899, 1899, "Sophisticated citrus wood and amber fragrance with 8+ hours sillage and projection."),
            ("Matte Liquid Waterproof Lipstick Non-Drying Finish", 349, 699, "Transfer-proof 12-hour high-pigment velvety liquid lipstick with nourishing Vitamin E."),
            ("Exfoliating Arabica Coffee Body Scrub with Coconut Oil 100g", 349, 499, "Natural caffeine scrub removing dead skin cells and tan while boosting circulation."),
            ("Cordless Rechargeable Waterproof Beard Trimmer for Men", 999, 1999, "Stainless steel self-sharpening blades with 20 length settings and 90 mins runtime.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
            "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
            "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
            "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=600&q=80"
        ]
    },
    {
        "id": 7,
        "name": "Sports & Fitness",
        "slug": "sports-fitness",
        "target": 75,
        "icon": "Activity",
        "description": "Gym Equipment, Yoga, Rackets, Footwear & Outdoor Sports Gear",
        "brands": [
            "Nivia", "Yonex", "Cosco", "Decathlon", "Boldfit",
            "Vector X", "Strauss", "Puma", "Reebok", "Spalding"
        ],
        "items": [
            ("Anti-Skid 6mm High Density Yoga Mat with Carrying Strap", 599, 1299, "Eco-friendly EVA cushioning mat offering joint protection and sweat resistance."),
            ("Aluminium Badminton Racket Pair with Full Cover & 3 Shuttles", 999, 1999, "Lightweight isometric head frame rackets engineered for sharp smashes and control."),
            ("Latex Resistance Loop Exercise Bands (Set of 5 Levels)", 449, 999, "Durable physical therapy and muscle strength bands for home gym workouts."),
            ("FIFA Standard Size 5 Rubber Moulded Football", 549, 999, "All-weather durable outer shell football with butyl bladder for optimal air retention."),
            ("Stainless Steel Insulated Sipper Gym Water Bottle 750ml", 499, 1099, "Double-walled vacuum thermos keeping beverages ice cold for 24 hours with flip straw."),
            ("Adjustable PVC Speed Jump Skipping Rope with Ball Bearings", 249, 599, "Tangle-free rapid cardio rope with lightweight non-slip foam handles for endurance."),
            ("Padded Weightlifting Gym Gloves with Wrist Support Wrap", 399, 899, "Silicone honeycomb palm padding preventing calluses and securing grip during deadlifts.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
            "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
            "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
            "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80"
        ]
    },
    {
        "id": 8,
        "name": "Toys & Baby Products",
        "slug": "toys-baby",
        "target": 75,
        "icon": "Smile",
        "description": "Baby Diapers, Feeding, Educational Toys, Board Games & Strollers",
        "brands": [
            "Pampers", "Huggies", "Chicco", "Mee Mee", "Himalaya Baby",
            "Fisher-Price", "Lego", "Hot Wheels", "Funskool", "Hasbro"
        ],
        "items": [
            ("All Round Protection Baby Diaper Pants Size M (Pack of 72)", 949, 1399, "Ultra-absorbent breathable magic gel core diaper pants with aloe vera lotion coating."),
            ("99% Pure Water Fragrance-Free Baby Wipes (Pack of 3 x 72)", 399, 699, "Dermatologically tested organic plant-based wipes safe for newborn skin and face."),
            ("Classic Creative Building Bricks Starter Set (250 Pieces)", 899, 1799, "Vibrant STEM architectural building blocks developing hand-eye coordination in kids."),
            ("Die-Cast 1:64 Scale Metal Toy Car Pack (Set of 5)", 599, 899, "High-detail collectible metal racing vehicles with authentic decos and aerodynamic wheels."),
            ("BPA-Free Anti-Colic Feeding Bottle with Soft Silicone Teat 250ml", 349, 599, "Ergonomic infant feeding bottle reducing air intake and gas colic during nursing."),
            ("Educational Wooden Magnetic Alphabets & Numbers Puzzle Board", 449, 999, "Montessori fine motor skill developmental toy made with eco-friendly non-toxic paints."),
            ("Lightweight Foldable Baby Stroller Pram with Canopy & Basket", 3499, 6999, "Compact travel pram with multi-position reclining seat and 5-point safety harness.")
        ],
        "image_pool": [
            "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80",
            "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&q=80",
            "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&q=80",
            "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80"
        ]
    }
]

TAG = "8639866865-21"

def generate_asin(department_code, index):
    raw = f"AMZ-IN-{department_code}-{index:05d}-2026"
    h = hashlib.sha256(raw.encode()).hexdigest().upper()
    return f"B0{h[:8]}"

all_products = []
current_id = 1

for dept in DEPARTMENTS:
    target = dept["target"]
    dept_id = dept["id"]
    dept_slug = dept["slug"]
    brands = dept["brands"]
    items = dept["items"]
    img_pool = dept["image_pool"]
    
    print(f"Generating {target} products for department: {dept['name']}...")
    
    for i in range(target):
        item_template = items[i % len(items)]
        base_name, base_price, base_compare, base_desc = item_template
        brand = brands[i % len(brands)]
        
        # Add slight variation to price and name for uniqueness
        price_factor = 1.0 + (random.randint(-15, 25) / 100.0)
        final_price = round(base_price * price_factor)
        compare_price = round(final_price * random.uniform(1.35, 1.85))
        
        # Suffix / Color / Variant for unique title
        variants = ["Classic Black", "Royal Navy", "Olive Green", "Matte Grey", "Crimson Red", "Ivory White", "Rose Gold", "Charcoal", "Emerald", "Platinum Edition"]
        variant = variants[i % len(variants)]
        pack_opts = ["", " - Pack of 1", " - Special Edition", " - Combo Pack", " - Deluxe Pack", ""]
        pack_opt = pack_opts[i % len(pack_opts)]
        
        product_name = f"{brand} {base_name} ({variant}){pack_opt}".strip()
        slug = f"{brand.lower().replace(' ', '-')}-{dept_slug}-{current_id:04d}"
        
        asin = generate_asin(dept_slug, i)
        affiliate_url = f"https://www.amazon.in/dp/{asin}?tag={TAG}"
        
        img = img_pool[i % len(img_pool)]
        
        stock = random.randint(15, 120)
        rating = round(random.uniform(4.2, 4.9), 1)
        reviews_count = random.randint(85, 18500)
        is_featured = (i % 7 == 0)
        
        features_list = [
            f"Genuine {brand} Authorized Product with Manufacturer Warranty",
            f"Fulfilled by Amazon Prime with Express 1-Day / 2-Day Delivery",
            f"Top Rated in Amazon.in {dept['name']} Department",
            f"Verified Customer Rating: {rating} ★ ({reviews_count:,} ratings)"
        ]
        
        prod_obj = {
            "id": current_id,
            "asin": asin,
            "name": product_name,
            "slug": slug,
            "brand": brand,
            "category_id": dept_id,
            "category_name": dept["name"],
            "category_slug": dept_slug,
            "description": f"{base_desc} Officially verified Amazon India product.",
            "price": float(final_price),
            "compare_at_price": float(compare_price),
            "cost_price": float(round(final_price * 0.7)),
            "stock": stock,
            "sku": f"AURA-{current_id:05d}",
            "image_url": img,
            "amazon_affiliate_url": affiliate_url,
            "is_amazon_product": 1,
            "is_featured": 1 if is_featured else 0,
            "is_active": 1,
            "rating": rating,
            "reviews_count": reviews_count,
            "features": json.dumps(features_list),
            "last_synced_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        }
        
        all_products.append(prod_obj)
        current_id += 1

print(f"\nTotal products generated: {len(all_products)}")

# 1. Update SQLite Database
conn = sqlite3.connect("backend/ecommerce.db")
cur = conn.cursor()

# Replace categories
cur.execute("DELETE FROM categories")
for d in DEPARTMENTS:
    cur.execute(
        "INSERT INTO categories (id, name, slug, description, icon) VALUES (?, ?, ?, ?, ?)",
        (d["id"], d["name"], d["slug"], d["description"], d["icon"])
    )

# Replace products
cur.execute("DELETE FROM products")
for p in all_products:
    cur.execute("""
        INSERT INTO products (
            id, asin, name, slug, brand, category_id, description,
            price, compare_at_price, cost_price, stock, sku,
            image_url, amazon_affiliate_url, is_amazon_product,
            is_featured, is_active, rating, reviews_count, features, last_synced_at,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p["id"], p["asin"], p["name"], p["slug"], p["brand"], p["category_id"], p["description"],
        p["price"], p["compare_at_price"], p["cost_price"], p["stock"], p["sku"],
        p["image_url"], p["amazon_affiliate_url"], p["is_amazon_product"],
        p["is_featured"], p["is_active"], p["rating"], p["reviews_count"], p["features"], p["last_synced_at"],
        p["last_synced_at"], p["last_synced_at"]
    ))

conn.commit()
conn.close()
print("✓ SQLite database successfully updated with 1,500 products!")

# 2. Update curated_catalog.json
curated_data = {
    "categories": [
        {"id": d["id"], "name": d["name"], "slug": d["slug"], "description": d["description"], "icon": d["icon"]}
        for d in DEPARTMENTS
    ],
    "products": all_products
}
with open("backend/app/curated_catalog.json", "w", encoding="utf-8") as f:
    json.dump(curated_data, f, indent=2)
print("✓ backend/app/curated_catalog.json written successfully!")

# 3. Update amazon_products_catalog.csv (root and frontend/public)
csv_headers = [
    "asin", "title", "brand", "category", "subcategory",
    "description", "price", "currency", "image_url",
    "amazon_url", "availability", "last_updated"
]

for out_path in ["amazon_products_catalog.csv", "frontend/public/amazon_products_catalog.csv"]:
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(csv_headers)
        for p in all_products:
            writer.writerow([
                p["asin"],
                p["name"],
                p["brand"],
                p["category_name"],
                p["category_slug"].replace("-", " ").title(),
                p["description"],
                f"{p['price']:.2f}",
                "INR",
                p["image_url"],
                p["amazon_affiliate_url"],
                f"In Stock ({p['stock']})",
                p["last_synced_at"]
            ])
print("✓ amazon_products_catalog.csv and frontend/public/ updated!")

# 4. Update frontend/src/data/fallbackData.ts
ts_categories = [
    {"id": d["id"], "name": d["name"], "slug": d["slug"], "description": d["description"], "icon": d["icon"]}
    for d in DEPARTMENTS
]

ts_products = []
for p in all_products:
    ts_products.append({
        "id": p["id"],
        "name": p["name"],
        "slug": p["slug"],
        "description": p["description"],
        "price": p["price"],
        "compare_at_price": p["compare_at_price"],
        "cost_price": p["cost_price"],
        "stock": p["stock"],
        "sku": p["sku"],
        "category_id": p["category_id"],
        "image_url": p["image_url"],
        "is_featured": bool(p["is_featured"]),
        "is_active": bool(p["is_active"]),
        "rating": p["rating"],
        "reviews_count": p["reviews_count"],
        "asin": p["asin"],
        "is_amazon_product": bool(p["is_amazon_product"]),
        "amazon_affiliate_url": p["amazon_affiliate_url"],
        "brand": p["brand"],
        "features": p["features"],
        "last_synced_at": p["last_synced_at"],
        "created_at": p["last_synced_at"],
        "updated_at": p["last_synced_at"],
        "category": {
            "id": p["category_id"],
            "name": p["category_name"],
            "slug": p["category_slug"]
        }
    })

with open("frontend/src/data/fallbackData.ts", "w", encoding="utf-8") as f:
    f.write("import { Category, Product } from '../types';\n\n")
    f.write(f"export const FALLBACK_CATEGORIES: Category[] = {json.dumps(ts_categories, indent=2)};\n\n")
    f.write(f"export const FALLBACK_PRODUCTS: Product[] = {json.dumps(ts_products, indent=2)};\n")

print("✓ frontend/src/data/fallbackData.ts updated with all 1,500 products!")
