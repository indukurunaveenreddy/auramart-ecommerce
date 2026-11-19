import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  Trash2, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Key, 
  ShieldCheck, 
  Cpu, 
  Smartphone, 
  Shirt, 
  Home, 
  Activity, 
  Watch, 
  Gamepad2, 
  LayoutGrid
} from 'lucide-react';
import { api } from '../../services/api';
import { AmazonProductItem, AmazonConfig, AmazonImportLog } from '../../types';
import { formatPrice } from '../../utils/currency';
import { AmazonIcon } from '../AmazonLogo';

interface AmazonImporterProps {
  onProductImported?: () => void;
}

export const AmazonImporter: React.FC<AmazonImporterProps> = ({ onProductImported }) => {
  // Tabs: 'discover' | 'asin' | 'manage' | 'settings'
  const [activeTab, setActiveTab] = useState<'discover' | 'asin' | 'manage' | 'settings'>('discover');

  // Config & API status
  const [config, setConfig] = useState<AmazonConfig | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Search & Discover
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AmazonProductItem[]>([]);
  const [searchSource, setSearchSource] = useState<'live_api' | 'discovery_catalog'>('discovery_catalog');
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedAsins, setSelectedAsins] = useState<string[]>([]);

  // ASIN Lookup
  const [asinInput, setAsinInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Import Action State
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [importSummary, setImportSummary] = useState<{
    imported: number;
    skipped: number;
    failed: number;
    message: string;
  } | null>(null);

  // Manage Imported Products
  const [importedProducts, setImportedProducts] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<AmazonImportLog[]>([]);
  const [totalImported, setTotalImported] = useState(0);
  const [managePage, setManagePage] = useState(1);
  const [manageSearch, setManageSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingManage, setIsLoadingManage] = useState(false);

  // Load Initial Configuration
  const loadConfig = async () => {
    try {
      const data = await api.getAmazonConfig();
      setConfig(data);
    } catch (err) {
      console.error('Failed to load Amazon config:', err);
    }
  };

  // Load Imported Products
  const loadImports = async (page = 1, search = '') => {
    try {
      setIsLoadingManage(true);
      const data = await api.getAmazonImports({ page, limit: 15, search });
      setImportedProducts(data.products);
      setRecentLogs(data.recent_logs);
      setTotalImported(data.total);
      setManagePage(data.page);
    } catch (err) {
      console.error('Failed to load imported products:', err);
    } finally {
      setIsLoadingManage(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadImports();
    handleSearch('bestseller', 'All');
  }, []);

  // Search Amazon Products
  const handleSearch = async (kw = keyword, cat = category) => {
    try {
      setIsSearching(true);
      setApiError(null);
      setImportSummary(null);
      const res = await api.searchAmazon({
        keyword: kw,
        category: cat,
        page: 1,
        item_count: 12
      });
      setSearchResults(res.items);
      setSearchSource(res.source as any);
      if (res.api_error) setApiError(res.api_error);
      setSelectedAsins([]);
    } catch (err: any) {
      console.error('Search error:', err);
      setApiError(err.message || 'Error communicating with Amazon API');
    } finally {
      setIsSearching(false);
    }
  };

  // ASIN Lookup
  const handleASINLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asinInput.trim()) return;
    try {
      setIsLookingUp(true);
      setImportSummary(null);
      const asins = asinInput
        .split(/[,\s]+/)
        .map(a => a.trim().toUpperCase())
        .filter(Boolean);

      const res = await api.lookupAmazonASINs(asins);
      setSearchResults(res.items);
      setSelectedAsins(res.items.filter(i => !i.is_already_imported).map(i => i.asin));
      setActiveTab('discover');
    } catch (err: any) {
      alert(err.message || 'Failed to lookup ASIN');
    } finally {
      setIsLookingUp(false);
    }
  };

  // Selection toggle
  const toggleSelect = (asin: string) => {
    setSelectedAsins(prev => 
      prev.includes(asin) ? prev.filter(a => a !== asin) : [...prev, asin]
    );
  };

  const selectAllUnimported = () => {
    const unimported = searchResults.filter(i => !i.is_already_imported).map(i => i.asin);
    setSelectedAsins(unimported);
  };

  // Import Action
  const handleImport = async (itemsToImport: AmazonProductItem[]) => {
    if (itemsToImport.length === 0) return;
    try {
      setIsImporting(true);
      setImportSummary(null);
      setImportProgress({ current: 0, total: itemsToImport.length });

      const res = await api.importAmazonProducts(itemsToImport);
      setImportProgress({ current: itemsToImport.length, total: itemsToImport.length });
      setImportSummary({
        imported: res.imported_count,
        skipped: res.skipped_count,
        failed: res.failed_count,
        message: `Successfully imported ${res.imported_count} products into AuraMart.`
      });

      // Update state
      setSearchResults(prev =>
        prev.map(p => {
          if (itemsToImport.some(imp => imp.asin === p.asin)) {
            return { ...p, is_already_imported: true };
          }
          return p;
        })
      );
      setSelectedAsins([]);
      loadConfig();
      loadImports();
      if (onProductImported) onProductImported();
    } catch (err: any) {
      alert(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  // Toggle Visibility
  const handleToggleProduct = async (id: number) => {
    try {
      const res = await api.toggleAmazonProduct(id);
      setImportedProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, is_active: res.is_active } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle product');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to remove this imported product from AuraMart?')) return;
    try {
      await api.deleteAmazonProduct(id);
      setImportedProducts(prev => prev.filter(p => p.id !== id));
      loadConfig();
    } catch (err: any) {
      alert(err.message || 'Failed to delete product');
    }
  };

  // Sync Pricing & Availability
  const handleSyncAll = async () => {
    try {
      setIsSyncing(true);
      const res = await api.syncAmazonProducts();
      alert(`Successfully synchronized ${res.synced_count} Amazon products with current pricing and Associate links.`);
      loadImports(managePage, manageSearch);
    } catch (err: any) {
      alert(err.message || 'Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // Test Credentials
  const handleTestCredentials = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);
      const res = await api.testAmazonCredentials();
      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to test credentials'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#FF9900] text-slate-950 rounded-xl font-bold shadow-md">
                <AmazonIcon className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                Amazon Product Importer
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Creators API v5.0
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated product discovery and batch importer for Amazon.in. All imported products automatically generate verified affiliate tracking links with your Associate Tag.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Associate Tag</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {config?.partner_tag || '8639866865-21'}
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10 text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Imported Catalog</span>
              <span className="text-sm font-extrabold text-emerald-400">
                {config?.total_imported_products || totalImported} Products
              </span>
            </div>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-slate-700/60 mt-6 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('discover')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'discover'
                ? 'bg-[#FF9900] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Product Discovery</span>
          </button>

          <button
            onClick={() => setActiveTab('asin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'asin'
                ? 'bg-[#FF9900] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Import by ASIN</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('manage');
              loadImports();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'manage'
                ? 'bg-[#FF9900] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Catalog ({totalImported})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-[#FF9900] text-slate-950 shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>API & Credentials</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 1: PRODUCT DISCOVERY & SEARCH                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search Controls Toolbar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search Amazon products by keyword, brand or title (e.g. Echo Dot, boAt earbuds, OnePlus, shoes)..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="w-full md:w-56">
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    handleSearch(keyword, e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-medium text-slate-700"
                >
                  <option value="All">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mobiles">Mobiles & Telephony</option>
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Sports">Sports & Fitness</option>
                  <option value="Beauty">Beauty & Personal Care</option>
                  <option value="Accessories">Accessories & Bags</option>
                  <option value="Gaming">Video Games & Gaming</option>
                </select>
              </div>

              <button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Discover</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Keyword Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-600 scrollbar-none">
              <span className="font-semibold text-slate-400 shrink-0">Popular:</span>
              {['Smart Speaker', 'Wireless Earbuds', 'Smartwatch', 'OnePlus 5G', 'Air Fryer', 'Resistance Bands', 'Serum', 'Gaming Mouse'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setKeyword(term);
                    handleSearch(term, category);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-800 font-medium whitespace-nowrap transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Import Status Alert / Summary */}
          {importSummary && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <span className="font-bold">{importSummary.message}</span>
                <span className="block text-emerald-700 mt-0.5">
                  Imported: <strong>{importSummary.imported}</strong> · Skipped (Duplicates): <strong>{importSummary.skipped}</strong> · Failed: <strong>{importSummary.failed}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Batch Action Bar */}
          {searchResults.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <button
                  onClick={selectAllUnimported}
                  className="text-amber-700 hover:underline"
                >
                  Select All Unimported ({searchResults.filter(i => !i.is_already_imported).length})
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => setSelectedAsins([])}
                  className="text-slate-500 hover:underline"
                >
                  Clear Selection
                </button>
                <span className="text-slate-400">
                  ({selectedAsins.length} selected)
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    const toImport = searchResults.filter(i => selectedAsins.includes(i.asin));
                    handleImport(toImport);
                  }}
                  disabled={selectedAsins.length === 0 || isImporting}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-[#FF9900] hover:bg-[#F28B00] text-slate-950 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Import Selected ({selectedAsins.length})</span>
                </button>

                <button
                  onClick={() => {
                    const unimported = searchResults.filter(i => !i.is_already_imported);
                    handleImport(unimported);
                  }}
                  disabled={searchResults.filter(i => !i.is_already_imported).length === 0 || isImporting}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Import All ({searchResults.filter(i => !i.is_already_imported).length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {isSearching ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Connecting to Amazon and fetching catalog...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
              <AmazonIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Amazon products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching with a broader keyword like "phone", "audio", "shirt", or select another category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {searchResults.map((item) => {
                const isSelected = selectedAsins.includes(item.asin);
                return (
                  <div
                    key={item.asin}
                    className={`bg-white rounded-2xl border overflow-hidden transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                      item.is_already_imported
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isSelected
                        ? 'border-amber-500 ring-2 ring-amber-400/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Image & Badges */}
                    <div className="relative aspect-square bg-slate-50 overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {/* Selection Checkbox */}
                      {!item.is_already_imported && (
                        <div className="absolute top-2.5 left-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.asin)}
                            className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300 shadow-sm cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                        {item.is_already_imported ? (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                            <Check className="w-3 h-3" /> In Catalog
                          </span>
                        ) : (
                          <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            ASIN: {item.asin}
                          </span>
                        )}
                        {item.discount_percent && item.discount_percent > 0 ? (
                          <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                            -{item.discount_percent}%
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold text-amber-700 uppercase tracking-wide">
                            {item.category || 'General'}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{item.brand}</span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug" title={item.name}>
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                          <span>★ {item.rating?.toFixed(1) || '4.5'}</span>
                          <span className="text-slate-400 text-[10px]">({item.reviews_count || 100})</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base font-extrabold text-slate-900">
                              {formatPrice(item.price)}
                            </span>
                            {item.compare_at_price && item.compare_at_price > item.price && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatPrice(item.compare_at_price)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-600 font-medium block">
                            Prime Delivery Eligible
                          </span>
                        </div>

                        {/* Import Button */}
                        {item.is_already_imported ? (
                          <span className="text-[11px] text-emerald-600 font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                            Imported
                          </span>
                        ) : (
                          <button
                            onClick={() => handleImport([item])}
                            disabled={isImporting}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#FF9900] hover:bg-[#F28B00] text-slate-950 flex items-center gap-1 shadow-xs transition-all disabled:opacity-50"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Import</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 2: IMPORT BY ASIN                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'asin' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" />
              Import Amazon Products by ASIN
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enter one or multiple Amazon Standard Identification Numbers (ASINs). You can copy the 10-character ASIN from any Amazon.in product URL (e.g. <code>B08N5WRWNW</code>).
            </p>
          </div>

          <form onSubmit={handleASINLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Amazon ASINs (Comma or Space Separated)
              </label>
              <textarea
                rows={3}
                value={asinInput}
                onChange={(e) => setAsinInput(e.target.value)}
                placeholder="e.g. B08N5WRWNW, B086KKT3RX, B0BR3VFB8P, B0BDHX8Z63"
                className="w-full p-3 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Tip: Multiple ASINs will be fetched and queued for batch import.
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isLookingUp || !asinInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLookingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Fetching Products...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-amber-400" />
                    <span>Fetch & Preview Products</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 3: MANAGE IMPORTED CATALOG                               */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'manage' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={manageSearch}
                onChange={(e) => {
                  setManageSearch(e.target.value);
                  loadImports(1, e.target.value);
                }}
                placeholder="Filter imported products..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSyncAll}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-2 shadow-sm transition-all"
                title="Updates prices and availability in accordance with Amazon policy"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Prices & Availability'}</span>
              </button>
            </div>
          </div>

          {/* Table of Imported Products */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">ASIN / SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Visibility</th>
                    <th className="py-3 px-4">Amazon Link</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingManage ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                        Loading imported Amazon products...
                      </td>
                    </tr>
                  ) : importedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No Amazon products match your filter. Use the <strong>Product Discovery</strong> tab to import items.
                      </td>
                    </tr>
                  ) : (
                    importedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                            />
                            <div className="min-w-0 max-w-xs">
                              <span className="font-bold text-slate-900 block truncate" title={p.name}>
                                {p.name}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Brand: {p.brand || 'Amazon'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {p.asin || p.sku}
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                            {p.category?.name || 'General'}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatPrice(p.price)}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleProduct(p.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${
                              p.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            {p.is_active ? 'Live on Store' : 'Hidden'}
                          </button>
                        </td>

                        <td className="py-3 px-4">
                          <a
                            href={p.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-[#FF9900] hover:text-[#d47f00] font-bold flex items-center gap-1 text-[11px]"
                            title="Verify tracking tag 8639866865-21"
                          >
                            <span>Amazon.in</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TAB 4: API & CREDENTIALS SETTINGS                            */}
      {/* ───────────────────────────────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 max-w-3xl mx-auto">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" />
              Amazon India Creators / PA-API v5.0 Setup
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The Amazon Product Advertising API / Creators API allows automated product queries and pricing synchronisation directly from Amazon India.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Marketplace Endpoint:</span>
              <span className="font-mono text-slate-900 font-bold">webservices.amazon.in (India)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">AWS SigV4 Region:</span>
              <span className="font-mono text-slate-900 font-bold">eu-west-1 / ProductAdvertisingAPI</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Associate Tracking Tag:</span>
              <span className="font-mono text-amber-600 font-bold">8639866865-21</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Credential Status:</span>
              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                config?.is_configured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {config?.is_configured ? 'CONFIGURED ON SERVER' : 'AWAITING PA-API ACTIVATION'}
              </span>
            </div>
          </div>

          {/* Test Credentials Action */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <button
              onClick={handleTestCredentials}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Test API Connection</span>
                </>
              )}
            </button>

            {testResult && (
              <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <span className="font-bold block mb-1">
                  {testResult.success ? '✅ Success' : 'ℹ️ Status Notice'}
                </span>
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* Amazon 3-Sale Qualification Notice */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
            <h4 className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              How Amazon Associates PA-API Activation Works:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 leading-relaxed">
              <li>Amazon creates your Associate account with Tag <strong>8639866865-21</strong>.</li>
              <li>Amazon requires your store to generate <strong>3 qualifying referral sales</strong> within the first 180 days.</li>
              <li>Once 3 sales are referred through your AuraMart Amazon links, Amazon unlocks the <strong>Product Advertising API Key & Secret Key</strong> inside Associates Central (Tools → Product Advertising API).</li>
              <li>In the meantime, the <strong>AuraMart Amazon Product Importer</strong> operates using our built-in curated Amazon product discovery catalog and ASIN importer so your store runs seamlessly with full Amazon tracking!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
