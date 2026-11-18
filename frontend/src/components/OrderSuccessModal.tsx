import React from 'react';
import { CheckCircle2, Clock, Package, ShoppingBag, ArrowRight, Home, MapPin, Receipt, ShieldCheck } from 'lucide-react';
import { Order } from '../types';
import { formatPrice } from '../utils/currency';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  const isPaid = order.payment_status === 'PAID';
  const isDirectUPI = order.payment_method === 'Direct UPI';
  const isCOD = order.payment_method === 'Cash on Delivery';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 p-6 sm:p-8 text-center relative my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner ${
          isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
        }`}>
          {isPaid ? <CheckCircle2 className="w-9 h-9" /> : <Clock className="w-9 h-9" />}
        </div>

        <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
          isPaid ? 'text-emerald-700 bg-emerald-50' : 'text-amber-800 bg-amber-50'
        }`}>
          {isPaid ? 'Payment Successful & Verified' : isCOD ? 'Cash on Delivery Confirmed' : 'Payment Verification Pending'}
        </span>

        <h2 className="text-2xl font-black text-slate-900 mt-2">
          {isPaid ? 'Thank you for your order!' : 'Order Placed Successfully!'}
        </h2>

        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          {isPaid
            ? `Your payment has been securely confirmed. Order receipt and tracking details dispatched to ${order.customer_email}.`
            : isDirectUPI
            ? `We've recorded your UPI transaction reference (${order.upi_reference || 'Pending'}). Funds will be verified against our bank statement before dispatch.`
            : `Please keep exact cash ready of ${formatPrice(order.total_amount)} upon delivery.`}
        </p>

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 my-5 text-left border border-slate-200/90 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">AuraMart Order ID</span>
              <span className="font-mono font-black text-slate-900 text-sm">{order.order_number}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Status</span>
              <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Payment Method</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Receipt className="w-3.5 h-3.5 text-slate-400" />
                {order.payment_method}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Transaction Ref / ID</span>
              <span className="font-mono text-slate-700 truncate block mt-0.5" title={order.razorpay_payment_id || order.upi_reference || 'COD-Authorized'}>
                {order.razorpay_payment_id || order.upi_reference || 'COD-Pending-Collection'}
              </span>
            </div>
          </div>

          {/* Purchased Products */}
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
              Purchased Items ({order.items?.length || 0})
            </span>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-9 h-9 rounded-lg object-cover bg-slate-50 flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-[11px]">{item.product_name}</p>
                      <p className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900 ml-2 text-xs">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Final Amount */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
            <div>
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Delivery Address</span>
              <p className="font-medium text-slate-700 text-[11px] flex items-start gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>{order.customer_name}, {order.shipping_address}, {order.city} - {order.postal_code}</span>
              </p>
            </div>
            <div className="text-right sm:flex-shrink-0">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Final Amount</span>
              <span className="font-black text-emerald-700 text-base">{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <Package className="w-4 h-4" />
            <span>View Order History</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-emerald-200"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
