from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.models import User, Category, Product, Order, OrderItem
from app.auth import get_password_hash

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).filter(User.email == "admin@store.com").first():
        print("Database already seeded.")
        return

    print("Seeding database with initial data in Indian Rupees (₹)...")

    # 1. Users
    admin = User(
        name="System Administrator",
        email="admin@store.com",
        hashed_password=get_password_hash("Admin@123"),
        role="admin"
    )
    customer1 = User(
        name="Alex Morgan",
        email="alex@example.com",
        hashed_password=get_password_hash("Customer@123"),
        role="customer"
    )
    customer2 = User(
        name="Sophia Chen",
        email="sophia@example.com",
        hashed_password=get_password_hash("Customer@123"),
        role="customer"
    )
    db.add_all([admin, customer1, customer2])
    db.flush()

    # 2. Categories
    categories_data = [
        {"name": "Electronics & Gadgets", "slug": "electronics", "description": "Cutting edge tech, smart devices and accessories", "icon": "Cpu"},
        {"name": "Fashion & Apparel", "slug": "fashion", "description": "Trendy clothes, footwear and accessories", "icon": "Shirt"},
        {"name": "Home & Living", "slug": "home-living", "description": "Modern furniture, decor and kitchen essentials", "icon": "Home"},
        {"name": "Fitness & Outdoors", "slug": "fitness", "description": "Workout gear, sports equipment and outdoor apparel", "icon": "Activity"},
        {"name": "Audio & Acoustics", "slug": "audio", "description": "Studio-grade headphones, earbuds and speakers", "icon": "Headphones"}
    ]

    cat_map = {}
    for c_data in categories_data:
        cat = Category(**c_data)
        db.add(cat)
        db.flush()
        cat_map[c_data["slug"]] = cat.id

    # 3. Products — Full Catalog in INR (₹)
    products_data = [
        # ═══════════════════════════════════════════════════════════════
        #  AUDIO & ACOUSTICS (10 products)
        # ═══════════════════════════════════════════════════════════════
        {
            "name": "Aura Pro Wireless Noise-Cancelling Headphones",
            "slug": "aura-pro-wireless-headphones",
            "description": "High-fidelity spatial audio with active noise cancellation, transparency mode, and up to 40 hours of battery life on a single charge.",
            "price": 24999.0,
            "compare_at_price": 29999.0,
            "cost_price": 11500.0,
            "stock": 28,
            "sku": "AUD-AURA-01",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.9,
            "reviews_count": 86
        },
        {
            "name": "Omni Sound Portable Bluetooth 360 Speaker",
            "slug": "omni-sound-portable-speaker",
            "description": "IP67 waterproof outdoor speaker delivering punchy 360-degree acoustics, 24-hour battery, and built-in power bank functionality.",
            "price": 9999.0,
            "compare_at_price": 11999.0,
            "cost_price": 4200.0,
            "stock": 42,
            "sku": "AUD-OMNI-02",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 78
        },
        {
            "name": "Studio Monitor Reference Headphones SM-90",
            "slug": "studio-monitor-headphones-sm90",
            "description": "Open-back circumaural design with 50mm beryllium drivers, detachable balanced cable, and flat frequency response for mixing and mastering.",
            "price": 19999.0,
            "compare_at_price": 24999.0,
            "cost_price": 8900.0,
            "stock": 15,
            "sku": "AUD-SM90-03",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 53
        },
        {
            "name": "NovaBuds Pro True Wireless Earbuds",
            "slug": "novabuds-pro-wireless-earbuds",
            "description": "Ultra-compact ANC earbuds with adaptive EQ, 6-mic call clarity, wireless charging case, and 32 hours total playtime. IPX5 sweat-proof.",
            "price": 14999.0,
            "compare_at_price": 17999.0,
            "cost_price": 5800.0,
            "stock": 60,
            "sku": "AUD-NOVA-04",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 124
        },
        {
            "name": "SoundPillar Home Theater Soundbar 5.1",
            "slug": "soundpillar-home-theater-soundbar",
            "description": "Dolby Atmos-enabled soundbar with wireless subwoofer and rear satellite speakers. HDMI eARC, Bluetooth 5.3, and voice assistant built-in.",
            "price": 34999.0,
            "compare_at_price": 42999.0,
            "cost_price": 16500.0,
            "stock": 8,
            "sku": "AUD-SPIL-05",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1558089687-f282d8956eb7?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 41
        },
        {
            "name": "Vinyl Revival Bluetooth Turntable",
            "slug": "vinyl-revival-bluetooth-turntable",
            "description": "Belt-driven turntable with AT95E cartridge, built-in phono preamp, Bluetooth 5.0 streaming, and walnut-veneer plinth. Plays 33⅓ and 45 RPM.",
            "price": 18999.0,
            "compare_at_price": 22999.0,
            "cost_price": 7500.0,
            "stock": 12,
            "sku": "AUD-VNYL-06",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 67
        },
        {
            "name": "PocketAmp Mini Guitar Amplifier",
            "slug": "pocketamp-mini-guitar-amplifier",
            "description": "3W rechargeable practice amp with overdrive, delay, and reverb effects. Bluetooth jam-along, headphone out, and clip-on belt mount.",
            "price": 4999.0,
            "compare_at_price": 5999.0,
            "cost_price": 1900.0,
            "stock": 50,
            "sku": "AUD-PAMP-07",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 89
        },
        {
            "name": "AcoustiWall Felt Sound-Absorbing Panels (6-Pack)",
            "slug": "acoustiwall-felt-sound-panels",
            "description": "Premium 12×12-inch PET felt acoustic tiles in hexagonal shapes. NRC 0.85, self-adhesive backing. Available in Slate, Sage, and Charcoal.",
            "price": 6999.0,
            "compare_at_price": 8999.0,
            "cost_price": 2600.0,
            "stock": 34,
            "sku": "AUD-ACST-08",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.4,
            "reviews_count": 37
        },
        {
            "name": "WaveLink USB-C Studio Condenser Microphone",
            "slug": "wavelink-usb-c-condenser-mic",
            "description": "Cardioid condenser with 24-bit/96kHz capture, real-time monitor mix, mute button, and zero-latency headphone output. Plug-and-play for Mac/PC.",
            "price": 9999.0,
            "compare_at_price": 12999.0,
            "cost_price": 3800.0,
            "stock": 26,
            "sku": "AUD-WLNK-09",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 95
        },
        {
            "name": "BassCore Subwoofer 10-inch Powered",
            "slug": "basscore-subwoofer-10inch",
            "description": "200W RMS down-firing subwoofer with auto-sensing power, adjustable crossover (40-150 Hz), and phase switch. Sealed MDF cabinet.",
            "price": 28999.0,
            "compare_at_price": 34999.0,
            "cost_price": 12500.0,
            "stock": 6,
            "sku": "AUD-BASS-10",
            "category_id": cat_map["audio"],
            "image_url": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 29
        },

        # ═══════════════════════════════════════════════════════════════
        #  ELECTRONICS & GADGETS (10 products)
        # ═══════════════════════════════════════════════════════════════
        {
            "name": "Chronos Minimalist Smartwatch Series 6",
            "slug": "chronos-minimalist-smartwatch",
            "description": "Sleek aerospace aluminum casing with continuous heart-rate tracking, GPS route tracking, sleep analytics, and AMOLED retina display.",
            "price": 17999.0,
            "compare_at_price": 21999.0,
            "cost_price": 7800.0,
            "stock": 14,
            "sku": "ELE-CHRN-06",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 112
        },
        {
            "name": "Apex Ergonomic Mechanical Keyboard",
            "slug": "apex-ergonomic-mechanical-keyboard",
            "description": "Hot-swappable tactile switches, sound-dampening gasket mount, customizable RGB backlighting, and solid aluminum chassis.",
            "price": 11999.0,
            "compare_at_price": 14999.0,
            "cost_price": 5200.0,
            "stock": 4,
            "sku": "ELE-KBD-99",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 64
        },
        {
            "name": "PixelLens 4K Action Camera",
            "slug": "pixellens-4k-action-camera",
            "description": "4K60 waterproof action camera with 6-axis HyperSmooth stabilization, 10m waterproofing without a housing, front-facing selfie screen, and live streaming.",
            "price": 26999.0,
            "compare_at_price": 32999.0,
            "cost_price": 11800.0,
            "stock": 18,
            "sku": "ELE-PXLC-11",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 73
        },
        {
            "name": "NanoCharge 140W GaN USB-C Charger",
            "slug": "nanocharge-140w-gan-usb-c-charger",
            "description": "Ultra-compact 4-port GaN charger: 1×USB-C 140W PD3.1, 1×USB-C 100W, 2×USB-A 22.5W. Charges a laptop in 30 minutes. Foldable prongs.",
            "price": 6499.0,
            "compare_at_price": 7999.0,
            "cost_price": 2300.0,
            "stock": 75,
            "sku": "ELE-GNCH-12",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.9,
            "reviews_count": 210
        },
        {
            "name": "OrbitTrack AirTag Leather Keychain Holder",
            "slug": "orbittrack-airtag-leather-keychain",
            "description": "Hand-stitched full-grain Italian leather holder with solid brass swivel clip. Precision-cut window for speaker output.",
            "price": 2499.0,
            "compare_at_price": 3299.0,
            "cost_price": 650.0,
            "stock": 120,
            "sku": "ELE-ORBT-13",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 156
        },
        {
            "name": "LumiDesk LED Monitor Light Bar",
            "slug": "lumidesk-led-monitor-light-bar",
            "description": "Asymmetric LED desk lamp that clamps to any monitor bezel. Adjustable color temperature (2700-6500K), stepless dimming, and USB-C powered.",
            "price": 4499.0,
            "compare_at_price": 5999.0,
            "cost_price": 1400.0,
            "stock": 65,
            "sku": "ELE-LUMI-14",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 188
        },
        {
            "name": "ProDock Thunderbolt 4 Docking Station",
            "slug": "prodock-thunderbolt4-dock",
            "description": "16-in-1 hub with dual 4K60 HDMI, 2×TB4 downstream, 2.5GbE ethernet, SD/microSD, 3×USB-A 10Gbps, and 98W upstream charging.",
            "price": 22999.0,
            "compare_at_price": 28999.0,
            "cost_price": 9500.0,
            "stock": 10,
            "sku": "ELE-DOCK-15",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 47
        },
        {
            "name": "SkyView Mini Drone with 4K Camera",
            "slug": "skyview-mini-drone-4k",
            "description": "249g foldable drone with 3-axis gimbal, 4K HDR video, 31-min flight time, ActiveTrack 5.0, and return-to-home.",
            "price": 49999.0,
            "compare_at_price": 59999.0,
            "cost_price": 22500.0,
            "stock": 7,
            "sku": "ELE-DRON-16",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 58
        },
        {
            "name": "VoltCell 20000mAh Magnetic Power Bank",
            "slug": "voltcell-20000mah-magsafe-powerbank",
            "description": "MagSafe-compatible 20000mAh power bank with 15W wireless charging, 65W USB-C PD output, built-in kickstand, and LED battery display.",
            "price": 5499.0,
            "compare_at_price": 6999.0,
            "cost_price": 1900.0,
            "stock": 90,
            "sku": "ELE-VOLT-17",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 132
        },
        {
            "name": "InkScribe E-Paper Digital Notepad 10.3\"",
            "slug": "inkscribe-epaper-digital-notepad",
            "description": "Glare-free e-ink writing tablet with stylus, handwriting-to-text OCR, cloud sync, 2-week battery, and a paper-like textured surface.",
            "price": 31999.0,
            "compare_at_price": 37999.0,
            "cost_price": 13500.0,
            "stock": 11,
            "sku": "ELE-INK-18",
            "category_id": cat_map["electronics"],
            "image_url": "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 44
        },

        # ═══════════════════════════════════════════════════════════════
        #  FASHION & APPAREL (10 products)
        # ═══════════════════════════════════════════════════════════════
        {
            "name": "Heritage Raw Selvedge Denim Jacket",
            "slug": "heritage-raw-selvedge-denim-jacket",
            "description": "Crafted from 14oz Japanese shuttle-loomed selvedge denim. Tailored fit with antique brass buttons and internal utility pockets.",
            "price": 7999.0,
            "compare_at_price": 9999.0,
            "cost_price": 3100.0,
            "stock": 22,
            "sku": "FAS-DNM-04",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 39
        },
        {
            "name": "Nomad All-Weather Roll-Top Backpack 28L",
            "slug": "nomad-all-weather-rolltop-backpack",
            "description": "Constructed with recycled X-Pac waterproof fabric, dedicated 16-inch padded laptop sleeve, and ergonomic magnetic Fidlock buckles.",
            "price": 6999.0,
            "compare_at_price": 8999.0,
            "cost_price": 2700.0,
            "stock": 19,
            "sku": "FAS-BAG-28",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 46
        },
        {
            "name": "Alpine Merino Wool Crew Sweater",
            "slug": "alpine-merino-wool-crew-sweater",
            "description": "17.5-micron superfine merino wool knit. Temperature-regulating, odor-resistant, and machine-washable. Ribbed hem and cuffs.",
            "price": 4999.0,
            "compare_at_price": 6499.0,
            "cost_price": 1800.0,
            "stock": 30,
            "sku": "FAS-MERN-19",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 61
        },
        {
            "name": "UrbanStride Retro Running Sneakers",
            "slug": "urbanstride-retro-running-sneakers",
            "description": "Heritage-inspired suede and nylon uppers with EVA cushioned midsole, gum rubber outsole, and reflective heel tab. Unisex sizing.",
            "price": 8999.0,
            "compare_at_price": 11999.0,
            "cost_price": 3400.0,
            "stock": 45,
            "sku": "FAS-SNKR-20",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 97
        },
        {
            "name": "Cloudform Ultralight Puffer Jacket",
            "slug": "cloudform-ultralight-puffer-jacket",
            "description": "700-fill responsibly sourced down, packable into its own pocket, water-resistant shell, and weighs just 280g. Wind-blocking baffled construction.",
            "price": 15999.0,
            "compare_at_price": 19999.0,
            "cost_price": 5900.0,
            "stock": 16,
            "sku": "FAS-PUFF-21",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 55
        },
        {
            "name": "Aviator Polarized Titanium Sunglasses",
            "slug": "aviator-polarized-titanium-sunglasses",
            "description": "Ultra-lightweight β-titanium frame with TAC polarized lenses, UV400 protection, silicone nose pads, and spring hinges. Includes hard case.",
            "price": 11499.0,
            "compare_at_price": 14999.0,
            "cost_price": 2800.0,
            "stock": 38,
            "sku": "FAS-SUNG-22",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 82
        },
        {
            "name": "Canvas & Leather Weekender Duffel Bag",
            "slug": "canvas-leather-weekender-duffel",
            "description": "Waxed cotton canvas body with vegetable-tanned leather handles and shoulder strap. Brass hardware, shoe compartment, and interior zip pocket.",
            "price": 13999.0,
            "compare_at_price": 17499.0,
            "cost_price": 4900.0,
            "stock": 13,
            "sku": "FAS-DUFF-23",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 34
        },
        {
            "name": "Slim Minimalist RFID Bifold Wallet",
            "slug": "slim-minimalist-rfid-bifold-wallet",
            "description": "Full-grain Nappa leather, RFID blocking lining, 8 card slots, 2 note compartments, and pull-tab ID window. Fits front pockets.",
            "price": 3999.0,
            "compare_at_price": 4999.0,
            "cost_price": 1100.0,
            "stock": 80,
            "sku": "FAS-WLLT-24",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 143
        },
        {
            "name": "Linen Blend Relaxed-Fit Camp Collar Shirt",
            "slug": "linen-blend-camp-collar-shirt",
            "description": "55% linen 45% cotton blend with a breezy camp collar, chest pocket, and coconut shell buttons. Pre-washed for softness.",
            "price": 2999.0,
            "compare_at_price": 3999.0,
            "cost_price": 850.0,
            "stock": 55,
            "sku": "FAS-LNEN-25",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.4,
            "reviews_count": 71
        },
        {
            "name": "Heritage Automatic Dress Watch 40mm",
            "slug": "heritage-automatic-dress-watch",
            "description": "Automatic movement, sapphire crystal, exhibition caseback, genuine Italian leather strap, and 50m water resistance.",
            "price": 24999.0,
            "compare_at_price": 31999.0,
            "cost_price": 9500.0,
            "stock": 9,
            "sku": "FAS-WTCH-26",
            "category_id": cat_map["fashion"],
            "image_url": "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.9,
            "reviews_count": 38
        },

        # ═══════════════════════════════════════════════════════════════
        #  HOME & LIVING (10 products)
        # ═══════════════════════════════════════════════════════════════
        {
            "name": "Nordic Ceramic Pour-Over Coffee Set",
            "slug": "nordic-ceramic-pour-over-set",
            "description": "Matte stoneware dripper and insulated carafe designed for optimal extraction temperature. Includes reusable stainless steel filter.",
            "price": 4999.0,
            "compare_at_price": 6499.0,
            "cost_price": 1900.0,
            "stock": 35,
            "sku": "HOM-COF-12",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.9,
            "reviews_count": 52
        },
        {
            "name": "AeroPress Clear Coffee Maker",
            "slug": "aeropress-clear-coffee-maker",
            "description": "Transparent Tritan copolyester body, makes espresso-style or American coffee in 60 seconds. Includes 350 micro-filters and stirrer.",
            "price": 3499.0,
            "compare_at_price": 3999.0,
            "cost_price": 1250.0,
            "stock": 48,
            "sku": "HOM-AERO-27",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 198
        },
        {
            "name": "Japanese Cast Iron Tetsubin Teapot 800ml",
            "slug": "japanese-cast-iron-tetsubin-teapot",
            "description": "Handcrafted Nambu Tekki cast iron with hobnail pattern. Enameled interior, stainless steel infuser, heat-resistant handle wrap.",
            "price": 6499.0,
            "compare_at_price": 7999.0,
            "cost_price": 2400.0,
            "stock": 20,
            "sku": "HOM-TPOT-28",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1556679343-c1917e48fa81?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 41
        },
        {
            "name": "Botanica Glass Propagation Station (Set of 5)",
            "slug": "botanica-glass-propagation-station",
            "description": "Minimalist walnut wood stand with 5 borosilicate glass vials for plant cuttings. Wall-mountable or freestanding design.",
            "price": 2799.0,
            "compare_at_price": 3499.0,
            "cost_price": 800.0,
            "stock": 60,
            "sku": "HOM-PROP-29",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 88
        },
        {
            "name": "Artisan Olive Wood Cutting Board",
            "slug": "artisan-olive-wood-cutting-board",
            "description": "Sustainably harvested Mediterranean olive wood with live edge. Each board is unique with natural grain patterns. 18×10 inches.",
            "price": 5499.0,
            "compare_at_price": 6999.0,
            "cost_price": 1950.0,
            "stock": 24,
            "sku": "HOM-CUBD-30",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 56
        },
        {
            "name": "Hygge Soy Wax Candle Trio Gift Set",
            "slug": "hygge-soy-wax-candle-trio",
            "description": "Three hand-poured soy candles in amber glass jars: Cedar & Moss, Lavender Fields, and Vanilla Bean. Cotton wicks, 45h burn each.",
            "price": 3299.0,
            "compare_at_price": 4299.0,
            "cost_price": 950.0,
            "stock": 70,
            "sku": "HOM-CNDL-31",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.9,
            "reviews_count": 127
        },
        {
            "name": "Loft Industrial Pendant Lamp — Matte Black",
            "slug": "loft-industrial-pendant-lamp-black",
            "description": "Spun steel shade with exposed Edison bulb socket, 4ft adjustable cord, and ceiling canopy. E26 base, dimmable. UL certified.",
            "price": 4699.0,
            "compare_at_price": 6299.0,
            "cost_price": 1450.0,
            "stock": 32,
            "sku": "HOM-LAMP-32",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 63
        },
        {
            "name": "Moroccan Hand-Woven Cotton Throw Blanket",
            "slug": "moroccan-hand-woven-throw-blanket",
            "description": "Artisan-loomed 100% organic cotton with diamond pattern and hand-tied fringe. 50×70 inches. OEKO-TEX certified.",
            "price": 4299.0,
            "compare_at_price": 5799.0,
            "cost_price": 1400.0,
            "stock": 40,
            "sku": "HOM-THRW-33",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 74
        },
        {
            "name": "Bamboo Desktop Organizer & Charging Dock",
            "slug": "bamboo-desktop-organizer-charging-dock",
            "description": "Moso bamboo desk caddy with phone/tablet slot, pen cups, mail sorter, and hidden cable management. Dimensions: 11×6×5 inches.",
            "price": 3199.0,
            "compare_at_price": 3999.0,
            "cost_price": 950.0,
            "stock": 55,
            "sku": "HOM-DESK-34",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.4,
            "reviews_count": 105
        },
        {
            "name": "Ceramic Pour-Over Dripper & Server Set",
            "slug": "ceramic-pour-over-dripper-server",
            "description": "Handmade speckled stoneware dripper with borosilicate glass server (600ml), walnut collar, and leather tie. Cone-style for full immersion.",
            "price": 4199.0,
            "compare_at_price": 5299.0,
            "cost_price": 1350.0,
            "stock": 28,
            "sku": "HOM-DRIP-35",
            "category_id": cat_map["home-living"],
            "image_url": "https://images.unsplash.com/photo-1517256673644-36ad11246d21?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 47
        },

        # ═══════════════════════════════════════════════════════════════
        #  FITNESS & OUTDOORS (10 products)
        # ═══════════════════════════════════════════════════════════════
        {
            "name": "Titan Precision Dumbbell Set (5-50 lbs)",
            "slug": "titan-precision-dumbbell-set",
            "description": "Quick-select dial mechanism replaces 15 sets of weights. Compact, knurled alloy steel grip with durable molded casing.",
            "price": 16999.0,
            "compare_at_price": 19999.0,
            "cost_price": 7900.0,
            "stock": 3,
            "sku": "FIT-DBL-50",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1638805313888-c1f2f3353430?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.9,
            "reviews_count": 94
        },
        {
            "name": "FlexCore Pro Resistance Band Kit (5 Bands)",
            "slug": "flexcore-pro-resistance-band-kit",
            "description": "Latex-free TPE bands (15-75 lbs) with padded handles, door anchor, ankle straps, and carry bag. Full-body workout anywhere.",
            "price": 2999.0,
            "compare_at_price": 4299.0,
            "cost_price": 800.0,
            "stock": 100,
            "sku": "FIT-BAND-36",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 215
        },
        {
            "name": "ZenMat Cork & Natural Rubber Yoga Mat",
            "slug": "zenmat-cork-natural-rubber-yoga-mat",
            "description": "Antimicrobial cork surface bonded to natural tree rubber base. Non-slip when wet, 5mm thickness, alignment lines etched. 72×26 inches.",
            "price": 6299.0,
            "compare_at_price": 7999.0,
            "cost_price": 2200.0,
            "stock": 35,
            "sku": "FIT-YOGA-37",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 132
        },
        {
            "name": "HydroFlask Trail Series Insulated Bottle 32oz",
            "slug": "hydroflask-trail-insulated-bottle-32oz",
            "description": "Double-wall vacuum insulation keeps drinks cold 24h or hot 12h. TempShield cap, powder-coated grip, and flex strap. BPA-free stainless steel.",
            "price": 3499.0,
            "compare_at_price": 4299.0,
            "cost_price": 1100.0,
            "stock": 85,
            "sku": "FIT-HYDR-38",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.9,
            "reviews_count": 278
        },
        {
            "name": "TrailBlazer Carbon Trekking Poles (Pair)",
            "slug": "trailblazer-carbon-trekking-poles",
            "description": "100% 3K carbon fiber with cork-and-EVA grips, quick-lock adjustment (105-135cm), tungsten carbide tips, and mud/snow baskets.",
            "price": 9499.0,
            "compare_at_price": 11999.0,
            "cost_price": 3300.0,
            "stock": 20,
            "sku": "FIT-TREK-39",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.7,
            "reviews_count": 63
        },
        {
            "name": "IronGrip Gym Chalk Ball (8-Pack Refill)",
            "slug": "irongrip-gym-chalk-ball-8pack",
            "description": "Pure magnesium carbonate in mesh refillable balls. Low-dust formula for deadlifts, pull-ups, bouldering, and gymnastics.",
            "price": 1499.0,
            "compare_at_price": 1999.0,
            "cost_price": 350.0,
            "stock": 150,
            "sku": "FIT-CHLK-40",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 89
        },
        {
            "name": "SpeedRope Pro Bearing Jump Rope",
            "slug": "speedrope-pro-bearing-jump-rope",
            "description": "360° dual ball-bearing swivel, 3mm steel cable with PVC coating, aluminum handles, and adjustable length up to 10ft.",
            "price": 1999.0,
            "compare_at_price": 2799.0,
            "cost_price": 490.0,
            "stock": 110,
            "sku": "FIT-ROPE-41",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.6,
            "reviews_count": 176
        },
        {
            "name": "SummitPack Ultralight 45L Hiking Backpack",
            "slug": "summitpack-ultralight-45l-hiking-backpack",
            "description": "Dyneema composite body, removable aluminum frame stay, roll-top closure, hipbelt pockets, and ice-axe loops. Weighs just 680g.",
            "price": 17499.0,
            "compare_at_price": 22499.0,
            "cost_price": 6800.0,
            "stock": 12,
            "sku": "FIT-HIKE-42",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=800&q=80",
            "is_featured": True,
            "is_active": True,
            "rating": 4.8,
            "reviews_count": 51
        },
        {
            "name": "ProFoam High-Density Massage Roller 18\"",
            "slug": "profoam-high-density-massage-roller",
            "description": "EVA foam with a textured 3-zone surface for trigger-point therapy. Hollow core for durability. Includes stretch guide poster.",
            "price": 2399.0,
            "compare_at_price": 3199.0,
            "cost_price": 600.0,
            "stock": 72,
            "sku": "FIT-FOAM-43",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.5,
            "reviews_count": 162
        },
        {
            "name": "NightTrail LED Reflective Running Vest",
            "slug": "nighttrail-led-reflective-running-vest",
            "description": "USB-rechargeable LED fiber-optic vest with 3 light modes, 360° visibility, adjustable straps (fits S-XXL), and 8h runtime.",
            "price": 2799.0,
            "compare_at_price": 3599.0,
            "cost_price": 750.0,
            "stock": 45,
            "sku": "FIT-VEST-44",
            "category_id": cat_map["fitness"],
            "image_url": "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80",
            "is_featured": False,
            "is_active": True,
            "rating": 4.4,
            "reviews_count": 94
        },
    ]

    created_products = []
    for p_data in products_data:
        prod = Product(**p_data)
        db.add(prod)
        created_products.append(prod)

    db.flush()

    # 4. Realistic orders in INR
    now = datetime.utcnow()

    orders_sample = [
        {
            "customer_name": "Rohan Verma",
            "customer_email": "rohan.v@example.com",
            "customer_phone": "+91 98765 43210",
            "shipping_address": "Flat 402, Green View Apartments",
            "city": "Bengaluru",
            "postal_code": "560001",
            "days_ago": 6,
            "items": [(created_products[0], 1), (created_products[20], 1)],
            "status": "delivered"
        },
        {
            "customer_name": "Marcus Vance",
            "customer_email": "marcus.v@example.com",
            "customer_phone": "+91 98123 45678",
            "shipping_address": "Plot 12, Hitec City",
            "city": "Hyderabad",
            "postal_code": "500081",
            "days_ago": 5,
            "items": [(created_products[10], 1)],
            "status": "delivered"
        },
        {
            "customer_name": "Ananya Sen",
            "customer_email": "ananya.s@example.com",
            "customer_phone": "+91 99001 22334",
            "shipping_address": "88 Marine Drive",
            "city": "Mumbai",
            "postal_code": "400020",
            "days_ago": 3,
            "items": [(created_products[30], 1), (created_products[21], 1)],
            "status": "delivered"
        },
        {
            "customer_name": "David Kim",
            "customer_email": "david.k@example.com",
            "customer_phone": "+91 98450 11223",
            "shipping_address": "45 Park Street",
            "city": "Kolkata",
            "postal_code": "700016",
            "days_ago": 2,
            "items": [(created_products[11], 1), (created_products[3], 1)],
            "status": "shipped"
        },
        {
            "customer_name": "Pooja Patel",
            "customer_email": "pooja.p@example.com",
            "customer_phone": "+91 97234 56789",
            "shipping_address": "15 Lakeview Road",
            "city": "Ahmedabad",
            "postal_code": "380015",
            "days_ago": 1,
            "items": [(created_products[0], 1), (created_products[6], 1), (created_products[25], 1)],
            "status": "processing"
        },
        {
            "customer_name": "Alex Morgan",
            "customer_email": "alex@example.com",
            "customer_phone": "+91 98877 66554",
            "shipping_address": "300 Cyber Hub",
            "city": "Gurugram",
            "postal_code": "122002",
            "days_ago": 0,
            "items": [(created_products[10], 1), (created_products[20], 1)],
            "status": "processing",
            "user_id": customer1.id
        },
        {
            "customer_name": "Priya Sharma",
            "customer_email": "priya.s@example.com",
            "customer_phone": "+91 98111 22334",
            "shipping_address": "22 Magnolia Court, Indiranagar",
            "city": "Bengaluru",
            "postal_code": "560038",
            "days_ago": 4,
            "items": [(created_products[23], 2), (created_products[35], 1)],
            "status": "delivered"
        },
        {
            "customer_name": "Karan Malhotra",
            "customer_email": "karan.m@example.com",
            "customer_phone": "+91 98222 33445",
            "shipping_address": "900 Civil Lines",
            "city": "Delhi",
            "postal_code": "110054",
            "days_ago": 1,
            "items": [(created_products[12], 1), (created_products[13], 1), (created_products[15], 1)],
            "status": "shipped"
        },
    ]

    for idx, osample in enumerate(orders_sample):
        order_date = now - timedelta(days=osample["days_ago"], hours=random.randint(1, 10))
        date_str = order_date.strftime("%Y%m%d")
        ord_num = f"ORD-{date_str}-{1000 + idx}"

        subtotal = 0.0
        order_items = []
        for prod, qty in osample["items"]:
            total = round(prod.price * qty, 2)
            subtotal += total
            order_items.append(
                OrderItem(
                    product_id=prod.id,
                    product_name=prod.name,
                    product_image=prod.image_url,
                    quantity=qty,
                    unit_price=prod.price,
                    total_price=total
                )
            )

        shipping_fee = 0.0 if subtotal >= 999.0 else 99.0
        tax_amount = round(subtotal * 0.18, 2)
        total_amount = round(subtotal + shipping_fee + tax_amount, 2)

        order = Order(
            order_number=ord_num,
            user_id=osample.get("user_id"),
            customer_name=osample["customer_name"],
            customer_email=osample["customer_email"],
            customer_phone=osample["customer_phone"],
            shipping_address=osample["shipping_address"],
            city=osample["city"],
            postal_code=osample["postal_code"],
            subtotal=round(subtotal, 2),
            shipping_fee=shipping_fee,
            tax_amount=tax_amount,
            total_amount=total_amount,
            status=osample["status"],
            payment_status="paid",
            payment_method="UPI / Card",
            created_at=order_date,
            updated_at=order_date
        )
        db.add(order)
        db.flush()

        for oi in order_items:
            oi.order_id = order.id
            db.add(oi)

    db.commit()
    print(f"Database seeding completed! {len(products_data)} products added across 5 categories in Indian Rupees (₹).")
