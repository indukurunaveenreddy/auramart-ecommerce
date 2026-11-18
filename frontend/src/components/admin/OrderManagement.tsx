import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Package, 
  MapPin, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Banknote, 
  QrCode, 
  CreditCard,
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/currency';

interface OrderManagementProps {
  orders: Order[];
  onRefresh: () => void;
}

export const OrderManagement: React.FC<OrderManagementProps> = ({ orders, onRefresh }) => {
  const [filterType, setFilterType] = useState<'all' | 'razorpay' | 'direct_upi' | 'cod' | 'pending_payment' | 'paid'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const filteredOrders = orders.filter((o) => {
    // Type Filter
    let matchesType = true;
    if (filterType === 'razorpay') matchesType = o.payment_method?.toLowerCase().includes('razorpay') || o.payment_method?.toLowerCase().includes('card');
    else if (filterType === 'direct_upi') matchesType = o.payment_method?.toLowerCase().includes('direct upi');
    else if (filterType === 'cod') matchesType = o.payment_method?.toLowerCase().includes('cash on delivery') || o.payment_method?.toLowerCase().includes('cod');
    else if (filterType === 'pending_payment') matchesType = o.payment_status?.toUpperCase() === 'PENDING';
    else if (filterType === 'paid') matchesType = o.payment_status?.toUpperCase() === 'PAID';

    // Status Filter
    const matchesStatus = statusFilter === 'all' || o.status?.toUpperCase() === statusFilter.toUpperCase();

    // Search
    const searchLower = search.toLowerCase();
    const matchesSearch =
      o.order_number?.toLowerCase().includes(searchLower) ||
      o.customer_name?.toLowerCase().includes(searchLower) ||
      o.customer_email?.toLowerCase().includes(searchLower) ||
      o.razorpay_payment_id?.toLowerCase().includes(searchLower) ||
      o.upi_reference?.toLowerCase().includes(searchLower);

    return matchesType && matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setActionLoadingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setActionMsg({ text: `Order #${orderId} status set to ${newStatus}`, type: 'success' });
      onRefresh();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to update order status', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleVerifyUPI = async (orderId: number) => {
    if (!window.confirm('Confirm that funds for this UPI transaction were received in your Union Bank of India account?')) return;
    setActionLoadingId(orderId);
    try {
      await api.verifyUPIPayment(orderId);
      setActionMsg({ text: `Direct UPI payment for Order #${orderId} marked as PAID.`, type: 'success' });
      onRefresh();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to verify UPI payment', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirmCODCash = async (orderId: number) => {
    if (!window.confirm('Confirm that cash was successfully collected from the customer upon delivery?')) return;
    setActionLoadingId(orderId);
    try {
      await api.confirmCODCash(orderId);
      setActionMsg({ text: `COD cash collected for Order #${orderId}. Payment marked as PAID and DELIVERED.`, type: 'success' });
      onRefresh();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to confirm COD cash', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRefund = async (orderId: number) => {
    const reason = window.prompt('Enter reason for issuing refund:', 'Customer cancellation / return');
    if (!reason) return;
    setActionLoadingId(orderId);
    try {
      await api.refundPayment(orderId, undefined, reason);
      setActionMsg({ text: `Refund successfully recorded and order cancelled for #${orderId}`, type: 'success' });
      onRefresh();
    } catch (err: any) {
      setActionMsg({ text: err.message || 'Failed to process refund', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getOrderStatusBadge = (st: string) => {
    const s = st?.toUpperCase();
    switch (s) {
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPaymentStatusBadge = (ps: string) => {
    const s = ps?.toUpperCase();
    switch (s) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-bold';
      case 'REFUNDED':
        return 'bg-purple-50 text-purple-700 border-purple-300 font-bold';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300 font-semibold';
    }
  };

  return (
    <div className="space-y-4">
      {actionMsg && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
          actionMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* Payment & Channel Quick Filter Tabs */}
      <div className="flex flex-wrap gap-2 items-center pb-1">
        {[
          { key: 'all', label: 'All Orders' },
          { key: 'razorpay', label: 'Razorpay Online' },
          { key: 'direct_upi', label: 'Direct UPI' },
          { key: 'cod', label: 'Cash on Delivery' },
          { key: 'pending_payment', label: 'Pending Verification' },
          { key: 'paid', label: 'Paid & Settled' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === tab.key
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Secondary Status Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['all', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                statusFilter.toUpperCase() === st.toUpperCase()
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order #, customer, UTR, payment ID..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            onClick={onRefresh}
            title="Refresh Orders"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Payable</th>
                <th className="py-3 px-4">Payment Info</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Payment Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isExpanded = expandedOrderId === ord.id;
                  const isPending = ord.payment_status?.toUpperCase() === 'PENDING';
                  const isPaid = ord.payment_status?.toUpperCase() === 'PAID';
                  const isDirectUPI = ord.payment_method?.toLowerCase().includes('direct upi');
                  const isCOD = ord.payment_method?.toLowerCase().includes('cash on delivery') || ord.payment_method?.toLowerCase().includes('cod');

                  return (
                    <React.Fragment key={ord.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block">
                            {ord.order_number}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ord.created_at ? new Date(ord.created_at).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : 'Just now'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">{ord.customer_name}</p>
                          <p className="text-[10px] text-slate-500">{ord.customer_phone}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{ord.customer_email}</p>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {formatPrice(ord.total_amount)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Subtotal: {formatPrice(ord.subtotal)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span className={`inline-block text-[10px] uppercase px-2 py-0.5 rounded-full border ${getPaymentStatusBadge(ord.payment_status)}`}>
                              {ord.payment_status}
                            </span>
                            <p className="text-[11px] font-semibold text-slate-700">
                              {ord.payment_method}
                            </p>
                            {ord.razorpay_payment_id && (
                              <p className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate max-w-[150px]" title={ord.razorpay_payment_id}>
                                RZP: {ord.razorpay_payment_id}
                              </p>
                            )}
                            {ord.upi_reference && (
                              <p className="text-[10px] font-mono text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 truncate max-w-[150px]" title={ord.upi_reference}>
                                UTR: {ord.upi_reference}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            disabled={actionLoadingId === ord.id}
                            value={ord.status?.toUpperCase()}
                            onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                            className={`font-bold text-[11px] px-2 py-1 rounded-lg border capitalize focus:outline-none transition-colors ${getOrderStatusBadge(
                              ord.status
                            )}`}
                          >
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex flex-col items-end gap-1.5">
                            {/* Verification action buttons */}
                            {isPending && isDirectUPI && (
                              <button
                                onClick={() => handleVerifyUPI(ord.id)}
                                disabled={actionLoadingId === ord.id}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verify UPI Payment</span>
                              </button>
                            )}

                            {isPending && isCOD && (
                              <button
                                onClick={() => handleConfirmCODCash(ord.id)}
                                disabled={actionLoadingId === ord.id}
                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors"
                              >
                                <Banknote className="w-3 h-3" />
                                <span>Confirm Cash Collected</span>
                              </button>
                            )}

                            {isPaid && (
                              <button
                                onClick={() => handleRefund(ord.id)}
                                disabled={actionLoadingId === ord.id}
                                className="px-2 py-0.5 text-purple-700 hover:bg-purple-50 rounded border border-purple-200 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <RotateCcw className="w-2.5 h-2.5" />
                                <span>Issue Refund</span>
                              </button>
                            )}

                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium transition-colors"
                            >
                              <span>{ord.items?.length || 0} items</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Order Items Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-slate-200">
                          <td colSpan={6} className="py-4 px-6 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                <h5 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  Shipping & Delivery Address
                                </h5>
                                <p className="text-slate-700 font-medium">{ord.customer_name}</p>
                                <p className="text-slate-600">{ord.shipping_address}</p>
                                <p className="text-slate-600">{ord.city} - {ord.postal_code}</p>
                                <p className="text-slate-500 text-[11px] pt-1">Contact: {ord.customer_phone}</p>
                                {ord.notes && (
                                  <p className="text-slate-500 text-[11px] italic">Notes: {ord.notes}</p>
                                )}
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                                <h5 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                  <Package className="w-3.5 h-3.5 text-slate-500" />
                                  Ordered Products
                                </h5>
                                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                                  {ord.items?.map((item) => (
                                    <div
                                      key={item.id}
                                      className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-[11px]"
                                    >
                                      <span className="font-medium text-slate-700 truncate max-w-[200px]">
                                        {item.quantity}x {item.product_name}
                                      </span>
                                      <span className="font-bold text-slate-900 ml-2">
                                        {formatPrice(item.total_price)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
