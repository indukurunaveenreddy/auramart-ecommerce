import os
import json
import time
import hmac
import hashlib
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import requests
from app.config import (
    AMAZON_ASSOCIATE_TAG,
    BASE_DIR
)

logger = logging.getLogger("amazon_service")

# Amazon India Marketplace Configuration
DEFAULT_HOST = os.getenv("AMAZON_HOST", "webservices.amazon.in")
DEFAULT_REGION = os.getenv("AMAZON_REGION", "eu-west-1")
DEFAULT_MARKETPLACE = "www.amazon.in"

# Supported Amazon Categories (Browse Nodes & Search Indexes)
AMAZON_CATEGORIES = [
    {"name": "All Categories", "value": "All", "icon": "LayoutGrid"},
    {"name": "Electronics", "value": "Electronics", "icon": "Cpu"},
    {"name": "Mobiles & Telephony", "value": "Electronics", "icon": "Smartphone"},
    {"name": "Fashion & Apparel", "value": "Apparel", "icon": "Shirt"},
    {"name": "Home & Kitchen", "value": "Kitchen", "icon": "Home"},
    {"name": "Sports & Fitness", "value": "SportingGoods", "icon": "Activity"},
    {"name": "Beauty & Personal Care", "value": "Beauty", "icon": "Sparkles"},
    {"name": "Accessories & Bags", "value": "Shoes", "icon": "Watch"},
    {"name": "Video Games & Gaming", "value": "VideoGames", "icon": "Gamepad2"},
    {"name": "Books & Audio", "value": "Books", "icon": "BookOpen"},
]

def sign(key: bytes, msg: str) -> bytes:
    return hmac.new(key, msg.encode("utf-8"), hashlib.sha256).digest()

def get_signature_key(key: str, date_stamp: str, region_name: str, service_name: str) -> bytes:
    k_date = sign(("AWS4" + key).encode("utf-8"), date_stamp)
    k_region = sign(k_date, region_name)
    k_service = sign(k_region, service_name)
    k_signing = sign(k_service, "aws4_request")
    return k_signing


class AmazonCreatorsAPI:
    """
    Official Amazon India Creators API / Product Advertising API v5 (PA-API 5.0) Client.
    Implements AWS Signature Version 4 (SigV4) request signing.
    Strictly server-side; credentials are never exposed to the client.
    """

    def __init__(self):
        self.access_key = os.getenv("AMAZON_ACCESS_KEY", "").strip()
        self.secret_key = os.getenv("AMAZON_SECRET_KEY", "").strip()
        self.partner_tag = os.getenv("AMAZON_ASSOCIATE_TAG", AMAZON_ASSOCIATE_TAG).strip()
        self.host = DEFAULT_HOST
        self.region = DEFAULT_REGION
        self.service = "ProductAdvertisingAPI"
        self._last_request_time = 0.0

    @property
    def is_configured(self) -> bool:
        return bool(self.access_key and self.secret_key and not self.access_key.startswith("placeholder"))

    def _rate_limit(self):
        """Enforce 1 TPS rate limit for PA-API v5 compliance."""
        elapsed = time.time() - self._last_request_time
        if elapsed < 1.0:
            time.sleep(1.0 - elapsed)
        self._last_request_time = time.time()

    def _send_signed_request(self, target: str, payload: dict) -> dict:
        """
        Signs the payload with AWS SigV4 and POSTs to webservices.amazon.in.
        """
        if not self.is_configured:
            raise ValueError(
                "Amazon Creators API credentials (AMAZON_ACCESS_KEY / AMAZON_SECRET_KEY) are not configured."
            )

        self._rate_limit()

        endpoint = f"https://{self.host}/paapi5/{target.lower()}"
        amz_target = f"com.amazon.paapi5.v1.ProductAdvertisingAPIv1.{target}"

        t = datetime.now(timezone.utc)
        amz_date = t.strftime("%Y%m%dT%H%M%SZ")
        date_stamp = t.strftime("%Y%m%d")

        request_parameters = json.dumps(payload, separators=(",", ":"))
        content_hash = hashlib.sha256(request_parameters.encode("utf-8")).hexdigest()

        canonical_uri = f"/paapi5/{target.lower()}"
        canonical_querystring = ""
        canonical_headers = (
            f"content-encoding:amz-1.0\n"
            f"content-type:application/json; charset=utf-8\n"
            f"host:{self.host}\n"
            f"x-amz-date:{amz_date}\n"
            f"x-amz-target:{amz_target}\n"
        )
        signed_headers = "content-encoding;content-type;host;x-amz-date;x-amz-target"

        canonical_request = (
            f"POST\n"
            f"{canonical_uri}\n"
            f"{canonical_querystring}\n"
            f"{canonical_headers}\n"
            f"{signed_headers}\n"
            f"{content_hash}"
        )

        algorithm = "AWS4-HMAC-SHA256"
        credential_scope = f"{date_stamp}/{self.region}/{self.service}/aws4_request"
        string_to_sign = (
            f"{algorithm}\n"
            f"{amz_date}\n"
            f"{credential_scope}\n"
            f"{hashlib.sha256(canonical_request.encode('utf-8')).hexdigest()}"
        )

        signing_key = get_signature_key(self.secret_key, date_stamp, self.region, self.service)
        signature = hmac.new(signing_key, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()

        authorization_header = (
            f"{algorithm} Credential={self.access_key}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, Signature={signature}"
        )

        headers = {
            "content-type": "application/json; charset=utf-8",
            "content-encoding": "amz-1.0",
            "x-amz-date": amz_date,
            "x-amz-target": amz_target,
            "Authorization": authorization_header,
            "Host": self.host
        }

        # Attempt with retry for transient 429 / 503 throttling
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.post(endpoint, headers=headers, data=request_parameters, timeout=12)
                if response.status_code == 200:
                    return response.json()
                elif response.status_code in (429, 503) and attempt < max_retries - 1:
                    time.sleep(1.5 * (attempt + 1))
                    continue
                else:
                    try:
                        err_json = response.json()
                        error_type = err_json.get("Errors", [{}])[0].get("Code", "AmazonAPIError")
                        error_msg = err_json.get("Errors", [{}])[0].get("Message", response.text)
                        raise RuntimeError(f"[{error_type}] {error_msg}")
                    except Exception as parse_err:
                        if isinstance(parse_err, RuntimeError):
                            raise parse_err
                        response.raise_for_status()
            except requests.RequestException as e:
                if attempt == max_retries - 1:
                    raise RuntimeError(f"Network error connecting to Amazon API: {e}")
                time.sleep(1.5)

        return {}

    def search_items(self, keywords: str, search_index: str = "All", item_page: int = 1, item_count: int = 10) -> List[Dict[str, Any]]:
        """Search items on Amazon.in via SearchItems API."""
        payload = {
            "Keywords": keywords,
            "SearchIndex": search_index if search_index in [c["value"] for c in AMAZON_CATEGORIES] else "All",
            "ItemCount": min(max(item_count, 1), 10),
            "ItemPage": min(max(item_page, 1), 10),
            "PartnerTag": self.partner_tag,
            "PartnerType": "Associates",
            "Marketplace": DEFAULT_MARKETPLACE,
            "Resources": [
                "Images.Primary.Large",
                "ItemInfo.Title",
                "ItemInfo.Features",
                "ItemInfo.ProductInfo",
                "ItemInfo.Classifications",
                "ItemInfo.ByLineInfo",
                "Offers.Listings.Price",
                "Offers.Listings.SavingBasis",
                "Offers.Listings.Availability.Message",
                "CustomerReviews.Count",
                "CustomerReviews.StarRating"
            ]
        }
        res = self._send_signed_request("SearchItems", payload)
        items_raw = res.get("SearchResult", {}).get("Items", [])
        return [self._format_item(item) for item in items_raw]

    def get_items(self, asins: List[str]) -> List[Dict[str, Any]]:
        """Look up up to 10 ASINs simultaneously via GetItems API."""
        if not asins:
            return []
        payload = {
            "ItemIds": asins[:10],
            "PartnerTag": self.partner_tag,
            "PartnerType": "Associates",
            "Marketplace": DEFAULT_MARKETPLACE,
            "Resources": [
                "Images.Primary.Large",
                "ItemInfo.Title",
                "ItemInfo.Features",
                "ItemInfo.ProductInfo",
                "ItemInfo.Classifications",
                "ItemInfo.ByLineInfo",
                "Offers.Listings.Price",
                "Offers.Listings.SavingBasis",
                "Offers.Listings.Availability.Message",
                "CustomerReviews.Count",
                "CustomerReviews.StarRating"
            ]
        }
        res = self._send_signed_request("GetItems", payload)
        items_raw = res.get("ItemsResult", {}).get("Items", [])
        return [self._format_item(item) for item in items_raw]

    def _format_item(self, item: dict) -> Dict[str, Any]:
        """Normalize Amazon API response into clean AuraMart product format."""
        asin = item.get("ASIN", "")
        item_info = item.get("ItemInfo", {})
        title = item_info.get("Title", {}).get("DisplayValue", f"Amazon Product {asin}")

        # Image
        image_url = item.get("Images", {}).get("Primary", {}).get("Large", {}).get("URL", "")
        if not image_url:
            image_url = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80"

        # Pricing from listings
        listing = item.get("Offers", {}).get("Listings", [{}])[0]
        price_data = listing.get("Price", {})
        saving_data = listing.get("SavingBasis", {})

        price = price_data.get("Amount", 0.0)
        compare_at = saving_data.get("Amount")
        if not compare_at or compare_at <= price:
            compare_at = round(price * 1.25, 2) if price > 0 else 0.0

        # Features & Description
        features = item_info.get("Features", {}).get("DisplayValues", [])
        description = " • ".join(features) if features else f"Genuine Amazon India product with Prime delivery. ASIN: {asin}."

        # Brand & Category
        brand = item_info.get("ByLineInfo", {}).get("Brand", {}).get("DisplayValue", "Amazon")
        category_name = item_info.get("Classifications", {}).get("Binding", {}).get("DisplayValue", "Electronics")

        # Ratings
        rating_obj = item.get("CustomerReviews", {})
        rating = float(rating_obj.get("StarRating", {}).get("Value", 4.5))
        reviews_count = int(rating_obj.get("Count", 120))

        # Availability
        availability = listing.get("Availability", {}).get("Message", "In Stock")

        # Affiliate Link tagged with partner tag
        affiliate_url = f"https://www.amazon.in/dp/{asin}?tag={self.partner_tag}"

        return {
            "asin": asin,
            "name": title,
            "brand": brand,
            "category": category_name,
            "price": float(price),
            "compare_at_price": float(compare_at) if compare_at else None,
            "discount_percent": round(((compare_at - price) / compare_at) * 100, 1) if compare_at and compare_at > price else 0,
            "image_url": image_url,
            "description": description,
            "features": features,
            "rating": rating,
            "reviews_count": reviews_count,
            "availability": availability,
            "affiliate_url": affiliate_url,
            "is_amazon_product": True
        }


# Global instance
amazon_api = AmazonCreatorsAPI()
