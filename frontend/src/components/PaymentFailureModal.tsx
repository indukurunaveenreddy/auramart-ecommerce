import React from 'react';
import { AlertTriangle, RotateCcw, ArrowLeft, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/currency';

interface PaymentFailureModalProps {
  isOpen: boolean;
  errorMessage: string;
  totalAmount: number;
  onRetry: () => void;
  onClose: () => void;
}

export const PaymentFailureModal: React.FC<PaymentFailureModalProps> = ({
  isOpen,
  errorMessage,
  totalAmount,
  onRetry,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-rose-200 p-6 sm:p-8 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <AlertTriangle className="w-9 h-9" />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
          Payment Incomplete
        </span>

        <h2 className="text-2xl font-black text-slate-900 mt-2">
          Payment Failed
        </h2>

        <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
          {errorMessage || 'Your payment could not be processed. No funds have been deducted from your account.'}
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 my-5 text-left border border-slate-200 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Payable Amount</span>
            <span className="font-bold text-slate-900">{formatPrice(totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-medium">Cart Status</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" /> Items Preserved
            </span>
          </div>
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
            You can retry using Razorpay, switch to Direct UPI, or choose Cash on Delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Payment</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
