import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Truck, 
  Lock, 
  AlertCircle, 
  Copy, 
  Check, 
  QrCode, 
  Banknote, 
  Smartphone,
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Order, PaymentConfig } from '../types';
import { formatPrice } from '../utils/currency';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  onOrderFailure: (errorMessage: string, totalAmount: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  onOrderFailure,
}) => {
  const { items, subtotal, shippingFee, taxAmount, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    razorpay_key_id: 'rzp_test_placeholder',
    upi_id: '8639866865@ybl',
    merchant_name: 'AuraMart Modern Commerce'
  });

  const [formData, setFormData] = useState({
    customer_name: user?.name || 'Naveen Reddy',
    customer_email: user?.email || 'naveen@example.com',
    customer_phone: '+91 86398 66865',
    shipping_address: 'Plot 42, Hitech City Main Road, Madhapur',
    city: 'Hyderabad',
    postal_code: '500081',
    payment_method: 'razorpay', // 'razorpay' | 'direct_upi' | 'cod'
    notes: '',
  });

  const [upiReference, setUpiReference] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeUpiApp, setActiveUpiApp] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getPaymentConfig()
        .then(cfg => setPaymentConfig(cfg))
        .catch(err => console.warn('Could not load payment gateway config:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyUpiId = () => {
    navigator.clipboard.writeText(paymentConfig.upi_id);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    const basePayload = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      shipping_address: formData.shipping_address,
      city: formData.city,
      postal_code: formData.postal_code,
      notes: formData.notes,
      items: items.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
      })),
    };

    try {
      // 1. CASH ON DELIVERY
      if (formData.payment_method === 'cod') {
        const codOrder = await api.createCODOrder(basePayload);
        clearCart();
        onOrderSuccess(codOrder);
        return;
      }

      // 2. DIRECT UPI
      if (formData.payment_method === 'direct_upi') {
        if (!upiReference.trim()) {
          setErrorMsg('Please enter the 12-digit UPI transaction reference (UTR) after transferring funds.');
          setIsSubmitting(false);
          return;
        }

        const upiOrder = await api.createDirectUPIOrder(basePayload);
        const updatedOrder = await api.submitDirectUPI({
          order_id: upiOrder.id,
          upi_reference: upiReference.trim(),
        });
        clearCart();
        onOrderSuccess(updatedOrder);
        return;
      }

      // 3. RAZORPAY ONLINE GATEWAY (UPI, Cards, NetBanking, EMI, Wallets)
      const rzpOrderData = await api.createRazorpayOrder(basePayload);

      // Reject placeholder keys — user must configure real Razorpay keys
      if (paymentConfig.razorpay_key_id === 'rzp_test_placeholder' || paymentConfig.razorpay_key_id === '') {
        // Cancel the created order and restore inventory
        try {
          await api.cancelPayment({
            order_id: rzpOrderData.order_id,
            reason: 'Razorpay API keys not configured',
            status: 'CANCELLED',
          });
        } catch (_) { /* best effort */ }
        setErrorMsg(
          '⚠️ Razorpay API keys are not configured. Please add your Razorpay Key ID and Secret to the .env file on the server and restart the backend. ' +
          'You can get test keys from https://dashboard.razorpay.com/ → Settings → API Keys. ' +
          'Meanwhile, you can use Direct UPI or Cash on Delivery.'
        );
        setIsSubmitting(false);
        return;
      }

      // Load official Razorpay Checkout script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        try {
          await api.cancelPayment({
            order_id: rzpOrderData.order_id,
            reason: 'Razorpay checkout script failed to load',
            status: 'CANCELLED',
          });
        } catch (_) { /* best effort */ }
        throw new Error('Unable to reach Razorpay gateway. Please check your internet connection or use Direct UPI / Cash on Delivery.');
      }

      // Official Razorpay Standard Checkout Configuration
      const options: any = {
        key: rzpOrderData.key_id,
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency,
        name: 'AuraMart',
        description: `Order #${rzpOrderData.order_number}`,
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=120&q=80',
        handler: async function (response: any) {
          // Payment completed at gateway — now verify server-side
          try {
            const verifiedOrder = await api.verifyRazorpayPayment({
              order_id: rzpOrderData.order_id,
              razorpay_order_id: response.razorpay_order_id || rzpOrderData.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature || '',
            });
            clearCart();
            onOrderSuccess(verifiedOrder);
          } catch (verifyErr: any) {
            onClose();
            onOrderFailure(verifyErr.message || 'Payment verification failed. Please contact support.', totalAmount);
          }
        },
        prefill: {
          name: formData.customer_name,
          email: formData.customer_email,
          contact: formData.customer_phone.replace(/\s/g, ''),
          method: 'upi',
        },
        theme: {
          color: '#059669', // AuraMart Emerald Green
        },
        modal: {
          ondismiss: async function () {
            // User closed the Razorpay popup without paying
            setIsSubmitting(false);
            try {
              await api.cancelPayment({
                order_id: rzpOrderData.order_id,
                reason: 'Customer dismissed Razorpay checkout',
                status: 'CANCELLED',
              });
            } catch (_) { /* best effort */ }
            onClose();
            onOrderFailure('Payment was cancelled. Your shopping cart has been preserved — you can retry anytime.', totalAmount);
          },
        },
      };

      if (rzpOrderData.razorpay_order_id && !rzpOrderData.razorpay_order_id.startsWith('order_test_')) {
        options.order_id = rzpOrderData.razorpay_order_id;
      }

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', async function (resp: any) {
        setIsSubmitting(false);
        try {
          await api.cancelPayment({
            order_id: rzpOrderData.order_id,
            reason: resp.error?.description || 'Payment failed at gateway',
            status: 'FAILED',
          });
        } catch (_) { /* best effort */ }
        onClose();
        onOrderFailure(resp.error?.description || 'Payment failed at gateway. Please try again.', totalAmount);
      });
      rzp.open();

    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize payment. Please review delivery details.');
      setIsSubmitting(false);
    }
  };

  const handleOpenUpiApp = (app: 'gpay' | 'phonepe' | 'paytm' | 'generic') => {
    const upiId = paymentConfig.upi_id || '8639866865@ybl';
    const merchantName = encodeURIComponent('AuraMart Modern Commerce');
    const amount = totalAmount.toFixed(2);
    const orderNote = encodeURIComponent(`AuraMart Order ${Date.now().toString().slice(-6)}`);

    let targetUrl = `upi://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${orderNote}`;
    let appTitle = 'UPI App';

    if (app === 'gpay') {
      targetUrl = `tez://upi/pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${orderNote}`;
      appTitle = 'Google Pay';
    } else if (app === 'phonepe') {
      targetUrl = `phonepe://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${orderNote}`;
      appTitle = 'PhonePe';
    } else if (app === 'paytm') {
      targetUrl = `paytmmp://pay?pa=${upiId}&pn=${merchantName}&am=${amount}&cu=INR&tn=${orderNote}`;
      appTitle = 'Paytm';
    } else {
      appTitle = 'Default UPI App';
    }

    setActiveUpiApp(appTitle);

    // Trigger redirection to installed UPI app
    try {
      window.location.href = targetUrl;
    } catch (e) {
      console.warn('UPI app launch error:', e);
    }
  };

  const upiDeepLink = `upi://pay?pa=${paymentConfig.upi_id}&pn=AuraMart%20Commerce&am=${totalAmount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiDeepLink)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col md:flex-row max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Form Column */}
        <div className="flex-1 p-5 sm:p-7 overflow-y-auto">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AuraMart Checkout</h2>
              <p className="text-xs text-slate-500">256-Bit SSL Encrypted Indian Payment Gateway</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Shipping Address */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                1. Delivery & Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="e.g. Naveen Reddy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="naveen@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="+91 86398 66865"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="500081"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address & Landmarks
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shipping_address}
                    onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Flat / House No., Landmark, Area"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    placeholder="Hyderabad"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                2. Select Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                {/* Method 1: Razorpay Online */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: 'razorpay' })}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    formData.payment_method === 'razorpay'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded">Fast</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900">Razorpay Online</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">UPI, GPay, Cards, NetBanking</div>
                </button>

                {/* Method 2: UPI Apps & QR */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: 'direct_upi' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.payment_method === 'direct_upi'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Instant</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900">PhonePe / GPay / Paytm</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Click to Pay or Scan QR</div>
                </button>

                {/* Method 3: COD */}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, payment_method: 'cod' })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    formData.payment_method === 'cod'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-800 px-1.5 py-0.2 rounded">COD</span>
                  </div>
                  <div className="font-bold text-xs text-slate-900">Cash on Delivery</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Pay in cash upon arrival</div>
                </button>
              </div>

              {/* Detail Panels for Selected Method */}
              {formData.payment_method === 'razorpay' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-slate-800 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Official Razorpay Standard Checkout</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports Google Pay, PhonePe, Paytm, BHIM, all major Debit & Credit Cards (Visa, Mastercard, RuPay) and 50+ Net Banking partners.
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Google Pay', 'PhonePe', 'Paytm', 'Visa / MC', 'RuPay', 'NetBanking'].map(badge => (
                      <span key={badge} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-semibold">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.payment_method === 'direct_upi' && (
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-emerald-950 text-sm">UPI Instant App Redirection & QR</p>
                      <p className="text-[11px] text-emerald-700">Click your app below to pay directly to <strong>{paymentConfig.upi_id}</strong></p>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-xs">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>

                  {/* 1-Click Instant App Redirection Buttons */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Click to Pay & Open App Directly:</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* PhonePe */}
                      <button
                        type="button"
                        onClick={() => handleOpenUpiApp('phonepe')}
                        className="py-2.5 px-3 rounded-xl bg-[#5f259f] hover:bg-[#501e87] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all transform active:scale-95"
                      >
                        <span>PhonePe</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </button>

                      {/* Google Pay */}
                      <button
                        type="button"
                        onClick={() => handleOpenUpiApp('gpay')}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all transform active:scale-95"
                      >
                        <span className="text-blue-400">G</span>
                        <span className="text-red-400">P</span>
                        <span className="text-amber-400">a</span>
                        <span className="text-green-400">y</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </button>

                      {/* Paytm */}
                      <button
                        type="button"
                        onClick={() => handleOpenUpiApp('paytm')}
                        className="py-2.5 px-3 rounded-xl bg-[#002e6e] hover:bg-[#002252] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all transform active:scale-95"
                      >
                        <span className="text-[#00b9f5] font-black mr-0.5">Pay</span>tm
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </button>

                      {/* Any Other UPI App */}
                      <button
                        type="button"
                        onClick={() => handleOpenUpiApp('generic')}
                        className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all transform active:scale-95"
                      >
                        <span>Other UPI</span>
                        <ExternalLink className="w-3 h-3 opacity-80" />
                      </button>
                    </div>

                    {activeUpiApp && (
                      <div className="mt-2.5 p-2 rounded-xl bg-emerald-100/80 border border-emerald-300 text-[11px] text-emerald-900 flex items-center gap-1.5 animate-in fade-in">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Opening <strong>{activeUpiApp}</strong> for ₹{totalAmount.toFixed(2)}. Complete your payment and paste the 12-digit UTR below.</span>
                      </div>
                    )}
                  </div>

                  {/* QR Code & Copy UPI ID section */}
                  <div className="pt-2 border-t border-emerald-200/80">
                    <p className="text-[11px] font-bold text-slate-700 mb-2">Or Scan QR / Copy UPI ID (for Desktop):</p>
                    <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-emerald-200 mb-3">
                      <span className="font-mono font-bold text-slate-900 text-xs flex-1 truncate">
                        {paymentConfig.upi_id}
                      </span>
                      <button
                        type="button"
                        onClick={copyUpiId}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] flex items-center gap-1 transition-colors"
                      >
                        {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <div className="bg-white p-2 rounded-xl border border-emerald-200 shadow-sm flex-shrink-0">
                        <img
                          src={qrCodeUrl}
                          alt="UPI Payment QR"
                          className="w-24 h-24 object-contain"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1 w-full">
                        <label className="block text-[11px] font-bold text-slate-800">
                          Enter 12-Digit UPI Transaction Reference (UTR):
                        </label>
                        <input
                          type="text"
                          value={upiReference}
                          onChange={(e) => setUpiReference(e.target.value)}
                          placeholder="e.g. 432198765432"
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-[10px] text-slate-500">
                          * Enter the 12-digit transaction reference shown in your Google Pay, PhonePe, or Paytm receipt to confirm your order.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.payment_method === 'cod' && (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery Terms</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Your order will be confirmed immediately. Please have <strong>{formatPrice(totalAmount)}</strong> in exact cash ready at your doorstep for courier verification.
                  </p>
                </div>
              )}
            </div>

            {/* Authorize Button */}
            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full mt-3 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Connecting Payment Gateway...</span>
              ) : formData.payment_method === 'cod' ? (
                <>
                  <Banknote className="w-4 h-4" />
                  <span>Confirm Cash on Delivery ({formatPrice(totalAmount)})</span>
                </>
              ) : formData.payment_method === 'direct_upi' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Direct UPI Verification ({formatPrice(totalAmount)})</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Pay with Razorpay ({formatPrice(totalAmount)})</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Order Summary Column */}
        <div className="w-full md:w-80 bg-slate-50 p-5 sm:p-7 border-t md:border-t-0 md:border-l border-slate-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)})
            </h3>

            <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-11 h-11 rounded-lg object-cover bg-white flex-shrink-0 border border-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-[11px]">{product.name}</p>
                    <p className="text-slate-400 text-[10px]">Qty: {quantity}</p>
                  </div>
                  <span className="font-bold text-slate-900 text-xs">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 mt-4 pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-medium text-slate-900">{formatPrice(shippingFee)}</span>
                )}
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span className="font-medium text-slate-900">{formatPrice(taxAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-emerald-700">{formatPrice(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
            <p className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Express Indian delivery within 2-4 days.
            </p>
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Buyer Protection & Easy Returns.
            </p>
          </div>
        </div>
      </div>


    </div>
  );
};
