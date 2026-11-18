import React, { useState, useEffect } from 'react';
import { X, Package, Clock, CheckCircle, Search, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order } from '../types';
import { formatPrice } from '../utils/currency';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (user) {
        const data = await api.getMyOrders();
        setOrders(data);
      } else {
        // Fallback: load recent orders via general endpoint for guest
        const data = await api.getAllOrders();
        setOrders(data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNumber.trim()) return;

    setLoading(true);
    setLookupError(null);
    try {
      const order = await api.getOrder(searchOrderNumber.trim());
      setOrders([order]);
    } catch (err: any) {
      setLookupError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'shipped':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'processing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 p-6 relative flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {user ? 'My Order History' : 'Order Tracking'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lookup bar for guest or order search */}
        <div className="pt-4">
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Track by Order # (e.g. ORD-20261116-1000)"
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Search
            </button>
            {searchOrderNumber && (
              <button
                type="button"
                onClick={() => {
                  setSearchOrderNumber('');
                  setLookupError(null);
                  fetchOrders();
                }}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Reset
              </button>
            )}
          </form>

          {lookupError && (
            <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{lookupError}</span>
            </div>
          )}
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No orders found</p>
              <p className="text-xs text-slate-400">When you place orders, they will show up here.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {ord.order_number}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Placed on {new Date(ord.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${getStatusBadge(
                      ord.status
                    )}`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="border-t border-slate-200/70 pt-2.5 space-y-2">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 truncate max-w-[280px]">
                        {item.quantity}x {item.product_name}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200/70 pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Shipping to: {ord.city}</span>
                  <div className="text-right">
                    <span className="text-slate-500 mr-2">Total:</span>
                    <span className="font-extrabold text-emerald-700 text-sm">
                      {formatPrice(ord.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
