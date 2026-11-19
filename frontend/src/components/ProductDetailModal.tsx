import React, { useState } from 'react';
import { X, Star, ShoppingBag, Shield, Truck, RefreshCw, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';
import { getAmazonAffiliateUrl } from '../utils/amazon';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200/80 relative flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 backdrop-blur-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Column */}
        <div className="md:w-1/2 bg-slate-100 relative min-h-[280px] md:min-h-full">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {discountPercent > 0 && (
            <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* Product Info Column */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {product.category?.name || 'Category'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  SKU: {product.sku}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 fill-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-800">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">
                ({product.reviews_count} verified reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Stock status */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Availability:</span>
              {isOutOfStock ? (
                <span className="font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Out of stock
                </span>
              ) : isLowStock ? (
                <span className="font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} items remaining
                </span>
              ) : (
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> {product.stock} units ready to ship
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-sm font-semibold text-slate-900 min-w-[36px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action & Trust badges */}
          <div className="space-y-4 pt-6 border-t border-slate-100 mt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" /> Added to your Bag!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" /> Add {quantity > 1 ? `${quantity} items` : 'to Bag'} — {formatPrice(product.price * quantity)}
                </>
              )}
            </button>

            {/* Amazon Associate Link */}
            <a
              href={getAmazonAffiliateUrl(product.name)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="w-full py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#FF9900] hover:bg-[#e68a00] text-slate-950 flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10 group"
              title="Buy directly on Amazon.in"
            >
              <ExternalLink className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Buy on Amazon.in (Prime / Fast Delivery)</span>
            </a>

            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-500 pt-1">
              <div className="flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Fast Dispatch</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                <span>Free Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
