import React, { useState, useEffect, useCallback } from 'react';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Sparkles, 
  Check, 
  Package, 
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Mail,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Flame,
  Zap
} from 'lucide-react';
import { AmazonIcon } from './components/AmazonLogo';
import { Product, Category, Order } from './types';
import { api } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { PaymentFailureModal } from './components/PaymentFailureModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';

const PRODUCTS_PER_PAGE = 40;

const MainContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<'shop' | 'admin'>('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating' | 'trending'>('newest');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [amazonOnly, setAmazonOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [pricePreset, setPricePreset] = useState<string>('all');

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [failureData, setFailureData] = useState<{ message: string; amount: number } | null>(null);

  const fetchCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setLoadError(null);
      const result = await api.getProducts({
        category_slug: selectedCategory || undefined,
        search: searchQuery || undefined,
        sort_by: sortBy,
        in_stock_only: inStockOnly || undefined,
        featured_only: featuredOnly || undefined,
        amazon_only: amazonOnly || undefined,
        min_price: minPrice,
        max_price: maxPrice,
        page,
        limit: PRODUCTS_PER_PAGE,
      });
      setProducts(result.products);
      setTotalProducts(result.total);
      setTotalPages(result.total_pages);
      setCurrentPage(result.page);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setLoadError(err?.message || 'Unable to connect to the backend server. Please make sure the API server is running.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortBy, inStockOnly, featuredOnly, amazonOnly, minPrice, maxPrice]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [selectedCategory, searchQuery, sortBy, inStockOnly, featuredOnly, amazonOnly, minPrice, maxPrice]);

  const handlePricePreset = (presetKey: string) => {
    setPricePreset(presetKey);
    switch (presetKey) {
      case 'under99':
        setMinPrice(0);
        setMaxPrice(99);
        break;
      case 'under299':
        setMinPrice(0);
        setMaxPrice(299);
        break;
      case 'under999':
        setMinPrice(0);
        setMaxPrice(999);
        break;
      case '1k-10k':
        setMinPrice(1000);
        setMaxPrice(10000);
        break;
      case 'above10k':
        setMinPrice(10000);
        setMaxPrice(undefined);
        break;
      default:
        setMinPrice(undefined);
        setMaxPrice(undefined);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchProducts(page);
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setCheckoutOpen(false);
    setRecentOrder(order);
    setFailureData(null);
    // Refresh products so stock counts stay up to date
    fetchProducts(currentPage);
  };

  const handleOrderFailure = (errorMessage: string, totalAmount: number) => {
    setCheckoutOpen(false);
    setFailureData({ message: errorMessage, amount: totalAmount });
  };

  // Generate visible page numbers
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const formatCount = (n: number) => n.toLocaleString('en-IN');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/25 mb-4 animate-pulse">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Aura<span className="text-emerald-400">Mart</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">Verifying secure session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Navigation */}
      <Navbar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        onChangeView={setCurrentView}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
        onOpenAdminLogin={() => setAdminLoginOpen(true)}
      />

      {currentView === 'admin' ? (
        <AdminDashboard onSwitchToShop={() => setCurrentView('shop')} />
      ) : (
        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {/* Amazon Best Sellers & Trending Showcase Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white border-b border-amber-500/20 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
                  <AmazonIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Official Amazon India Associates Collection</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Discover Best Sellers, Gadgets & Trending Finds
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                  Curated quality products with 1-click checkout on Amazon.in. Prime delivery, verified buyer reviews, and genuine brand guarantees.
                </p>
              </div>

              {/* Quick Action Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  onClick={() => {
                    setSortBy('trending');
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    sortBy === 'trending'
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trending Deals</span>
                </button>

                <button
                  onClick={() => {
                    setFeaturedOnly(!featuredOnly);
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    featuredOnly
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Featured Picks</span>
                </button>

                <button
                  onClick={() => {
                    setAmazonOnly(!amazonOnly);
                    const el = document.getElementById('catalog-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    amazonOnly
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                  }`}
                >
                  <AmazonIcon className="w-3.5 h-3.5 text-amber-300" />
                  <span>Amazon Verified</span>
                </button>
              </div>
            </div>
          </div>

          {/* Catalog & Filter Section */}
          <div id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
            {/* Quick Category Selection Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none w-full">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === null
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                All Products ({formatCount(totalProducts)})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat.slug
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Filter & Sorting Controls Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-8 space-y-3">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {selectedCategory
                      ? categories.find((c) => c.slug === selectedCategory)?.name || 'Category'
                      : 'Curated Products'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {formatCount(products.length)} of {formatCount(totalProducts)} products
                    {totalPages > 1 && <span className="ml-1">· Page {formatCount(currentPage)} of {formatCount(totalPages)}</span>}
                  </p>
                </div>

                {/* Toggles & Sort Options */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>In Stock Only</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Featured</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={amazonOnly}
                      onChange={(e) => setAmazonOnly(e.target.checked)}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <AmazonIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Amazon Verified</span>
                  </label>

                  <div className="h-4 w-px bg-slate-200 hidden sm:block" />

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:bg-white focus:outline-none"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="trending">🔥 Trending Deals</option>
                      <option value="rating">★ Highest Rated</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Price Range Filter Pills */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-semibold mr-1">Price Range:</span>
                {[
                  { key: 'all', label: 'All Deals' },
                  { key: 'under99', label: 'Under ₹99 (Super Saver)' },
                  { key: 'under299', label: 'Under ₹299 (Budget Deals)' },
                  { key: 'under999', label: 'Under ₹999 (Amazon Best Deals)' },
                  { key: '1k-10k', label: '₹1,000 – ₹10,000' },
                  { key: 'above10k', label: '₹10,000+ (Premium)' },
                ].map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePricePreset(preset.key)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                      pricePreset === preset.key
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Loading catalog items...</p>
              </div>
            ) : loadError ? (
              <div className="bg-red-50/80 rounded-3xl border border-red-200 p-8 text-center max-w-lg mx-auto space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto font-bold text-lg">
                  !
                </div>
                <div>
                  <h3 className="font-bold text-red-900 text-base">Backend Connection Issue</h3>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    {loadError}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Make sure the FastAPI backend is running on port 8000.
                  </p>
                </div>
                <button
                  onClick={() => fetchProducts(1)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">No products match your criteria</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search keywords, clear category filters, or enable out-of-stock items.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery('');
                    setInStockOnly(false);
                    setFeaturedOnly(false);
                    setAmazonOnly(false);
                    setSortBy('newest');
                    handlePricePreset('all');
                  }}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onOpenDetails={setSelectedProduct}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <p className="text-xs text-slate-500">
                      Showing {formatCount((currentPage - 1) * PRODUCTS_PER_PAGE + 1)} – {formatCount(Math.min(currentPage * PRODUCTS_PER_PAGE, totalProducts))} of {formatCount(totalProducts)} products
                    </p>

                    <div className="flex items-center gap-1">
                      {/* First */}
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="First page"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>
                      {/* Prev */}
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page Numbers */}
                      {getPageNumbers().map((pg, idx) =>
                        pg === '...' ? (
                          <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                            …
                          </span>
                        ) : (
                          <button
                            key={pg}
                            onClick={() => goToPage(pg)}
                            className={`min-w-[36px] h-9 rounded-lg text-xs font-semibold transition-colors ${
                              pg === currentPage
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {pg}
                          </button>
                        )
                      )}

                      {/* Next */}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      {/* Last */}
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Last page"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span className="text-lg font-black text-white">AuraMart</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-sm">
                Modern full-stack shopping platform designed by <strong className="text-white">Naveen Reddy</strong>, featuring Razorpay gateway and Amazon.in Associates.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Categories</h4>
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        setCurrentView('shop');
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Quick Navigation</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setCurrentView('shop')} className="hover:text-emerald-400">
                    Storefront
                  </button>
                </li>
                <li>
                  <button onClick={() => setOrdersOpen(true)} className="hover:text-emerald-400">
                    Track Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentView('admin')} className="hover:text-emerald-400">
                    Admin Management Portal
                  </button>
                </li>
                <li>
                  <button onClick={() => setAuthOpen(true)} className="hover:text-emerald-400">
                    Sign In / Register
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold uppercase tracking-wider text-xs mb-3">Store Guarantee</h4>
              <p className="text-slate-400 leading-relaxed mb-3">
                All purchases are backed by our 30-day money-back guarantee with complimentary express dispatch.
              </p>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified SSL Checkout</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs sm:text-sm">
            <p>© {new Date().getFullYear()} AuraMart E-Commerce Platform. All rights reserved.</p>
            <p className="text-slate-300 flex items-center gap-1.5 font-medium">
              Designed by <strong className="text-white font-bold tracking-wide">Naveen Reddy</strong> <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </p>
          </div>

          {/* Amazon Associates Compliance Disclosure */}
          <div className="mt-4 pt-3 border-t border-slate-800/50 text-center text-[11px] text-slate-400">
            <p>
              📦 <strong className="text-amber-400">Amazon Associates Program:</strong> AuraMart is a participant in the Amazon.in Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by linking to Amazon.in. Associate Tag: <span className="font-mono text-amber-300 font-semibold">8639866865-21</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        onProceedToCheckout={() => setCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        onOrderFailure={handleOrderFailure}
      />

      <PaymentFailureModal
        isOpen={!!failureData}
        errorMessage={failureData?.message || ''}
        totalAmount={failureData?.amount || 0}
        onRetry={() => {
          setFailureData(null);
          setCheckoutOpen(true);
        }}
        onClose={() => setFailureData(null)}
      />

      <OrderSuccessModal
        order={recentOrder}
        onClose={() => setRecentOrder(null)}
        onViewOrders={() => setOrdersOpen(true)}
      />

      <MyOrdersModal
        isOpen={ordersOpen}
        onClose={() => setOrdersOpen(false)}
      />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
      />

      <AdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onSuccess={() => setCurrentView('admin')}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <MainContent />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
