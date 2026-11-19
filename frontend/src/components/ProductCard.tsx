import React from 'react';
import { Star, ShoppingCart, Eye, AlertCircle, Check, ExternalLink } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/currency';
import { getAmazonAffiliateUrl } from '../utils/amazon';
import { AmazonIcon } from './AmazonLogo';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { addToCart, items } = useCart();
  const [addedAnim, setAddedAnim] = React.useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const discountPercent = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  return (
    <div 
      onClick={() => onOpenDetails(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-xs border border-white/10">
            <AmazonIcon className="w-3 h-3 text-amber-400" />
            <span>Amazon</span>
          </span>
          {discountPercent > 0 && (
            <span className="bg-rose-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wide">
              Featured
            </span>
          )}
        </div>

        {/* Quick View Button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDetails(product);
          }}
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:text-emerald-600 shadow-md transform translate-y-2 group-hover:translate-y-0"
          title="Quick preview"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold uppercase tracking-wider text-[11px]">
              {product.category?.name || 'General'}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-[10px]">({product.reviews_count})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 text-sm sm:text-base">
            {product.name}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Stock status indicator */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">
                {formatPrice(product.price)}
              </span>
              {product.compare_at_price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Inventory indicator */}
            <div className="mt-0.5">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                  <AlertCircle className="w-3 h-3" /> Out of stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Only {product.stock} left!
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">
                  In stock ({product.stock})
                </span>
              )}
            </div>
          </div>

          {/* Actions: Direct Amazon Affiliate & Add to Cart */}
          <div className="flex items-center gap-1.5">
            <a
              href={getAmazonAffiliateUrl(product.name)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-[#FF9900]/15 hover:bg-[#FF9900] text-slate-900 border border-amber-300/80 transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md group/amz"
              title="Buy directly on Amazon.in (Prime delivery)"
            >
              <AmazonIcon className="w-4 h-4 text-amber-600 group-hover/amz:text-slate-950 transition-colors" />
              <span className="hidden sm:inline text-[11px] font-extrabold tracking-tight">Amazon</span>
              <ExternalLink className="w-3 h-3 text-slate-500 group-hover/amz:text-slate-950" />
            </a>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`p-2.5 rounded-xl font-semibold text-xs flex items-center justify-center transition-all ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : addedAnim
                  ? 'bg-emerald-600 text-white scale-95 shadow-md shadow-emerald-500/30'
                  : 'bg-slate-900 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md'
              }`}
              title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
            >
              {addedAnim ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <div className="flex items-center gap-1">
                  <ShoppingCart className="w-4 h-4" />
                  {cartQty > 0 && (
                    <span className="text-[10px] bg-white/20 px-1 rounded">
                      {cartQty}
                    </span>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
