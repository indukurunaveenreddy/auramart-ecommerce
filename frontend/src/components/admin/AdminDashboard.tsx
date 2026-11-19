import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  Users, 
  DollarSign, 
  ArrowUpRight,
  BarChart3,
  ListOrdered,
  Plus
} from 'lucide-react';
import { AdminStats, Product, Category, Order } from '../../types';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/currency';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { ProductFormModal } from './ProductFormModal';
import { AmazonImporter } from './AmazonImporter';
import { AmazonIcon } from '../AmazonLogo';

export const AdminDashboard: React.FC<{ onSwitchToShop: () => void }> = ({ onSwitchToShop }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'amazon'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, prodsResult, catsData, ordersData] = await Promise.all([
        api.getAdminStats(),
        api.getProducts({ limit: 200 }),
        api.getCategories(),
        api.getAllOrders(),
      ]);
      setStats(statsData);
      setProducts(prodsResult.products);
      setCategories(catsData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const maxDailySales = stats?.recent_sales.reduce((max, s) => Math.max(max, s.sales), 100) || 100;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Admin Sub-bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <span className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Store Management Hub
              </span>

              {/* Subtabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('products')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'products'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Inventory ({products.length})</span>
                  {stats && stats.low_stock_count > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                  <span>Orders ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('amazon')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'amazon'
                      ? 'bg-[#FF9900] text-slate-950 shadow-xs'
                      : 'text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80'
                  }`}
                >
                  <AmazonIcon className="w-3.5 h-3.5 text-slate-950" />
                  <span>Amazon Importer</span>
                </button>
              </div>
            </div>

            <button
              onClick={onSwitchToShop}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <span>Back to Storefront</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading store analytics...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* 4 KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Revenue */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-2xl font-black text-slate-900">
                        {formatPrice(stats.total_revenue)}
                      </h3>
                      <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> +14.8% from last cycle
                      </p>
                    </div>
                  </div>

                  {/* Orders */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-semibold uppercase tracking-wider">Completed Orders</span>
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-2xl font-black text-slate-900">
                        {stats.total_orders}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Average {formatPrice(stats.total_orders > 0 ? stats.total_revenue / stats.total_orders : 0)} / order
                      </p>
                    </div>
                  </div>

                  {/* Products & Low stock alert */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-semibold uppercase tracking-wider">Catalog Items</span>
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-2xl font-black text-slate-900">
                        {stats.total_products}
                      </h3>
                      {stats.low_stock_count > 0 ? (
                        <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {stats.low_stock_count} low stock warnings
                        </p>
                      ) : (
                        <p className="text-xs text-emerald-600 font-semibold mt-1">All items well-stocked</p>
                      )}
                    </div>
                  </div>

                  {/* Customers */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-2xl font-black text-slate-900">
                        {stats.total_customers}
                      </h3>
                      <p className="text-xs text-indigo-600 font-semibold mt-1">Active customer accounts</p>
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 7-Day Revenue Trend Bar Chart */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">Recent Revenue Trend</h4>
                        <p className="text-xs text-slate-400">Daily gross revenue over past 7 days</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        Real-time Data
                      </span>
                    </div>

                    <div className="h-56 flex items-end gap-3 sm:gap-6 pt-6 pb-2 border-b border-slate-100">
                      {stats.recent_sales.map((day, idx) => {
                        const heightPct = Math.max(12, Math.round((day.sales / maxDailySales) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <span className="text-[11px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                              {formatPrice(day.sales)}
                            </span>
                            <div
                              style={{ height: `${heightPct}%` }}
                              className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-xl group-hover:brightness-110 transition-all shadow-sm"
                            />
                            <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[48px]">
                              {day.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Category Breakdown */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                    <h4 className="text-base font-bold text-slate-900 mb-1">Sales by Category</h4>
                    <p className="text-xs text-slate-400 mb-4">Volume & revenue contribution</p>

                    <div className="space-y-4">
                      {stats.category_distribution.map((cat, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-800">{cat.category}</span>
                            <span className="font-bold text-slate-900">{formatPrice(cat.total_sales)}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (cat.total_sales / (stats.total_revenue || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular Products Mini Table */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-bold text-slate-900">Featured Catalog Performers</h4>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      View all products →
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.popular_products.map((p) => (
                      <div key={p.id} className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 border border-slate-100">
                        <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-white" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-500 font-semibold">{formatPrice(p.price)}</p>
                          <p className="text-[10px] text-emerald-600 font-semibold">Stock: {p.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <ProductManagement
                products={products}
                categories={categories}
                onRefresh={loadData}
                onOpenCreateModal={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
                onOpenEditModal={(p) => {
                  setEditingProduct(p);
                  setProductModalOpen(true);
                }}
              />
            )}

            {activeTab === 'orders' && (
              <OrderManagement orders={orders} onRefresh={loadData} />
            )}

            {activeTab === 'amazon' && (
              <AmazonImporter onProductImported={loadData} />
            )}
          </>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        productToEdit={editingProduct}
        categories={categories}
        onSaved={loadData}
      />
    </div>
  );
};
