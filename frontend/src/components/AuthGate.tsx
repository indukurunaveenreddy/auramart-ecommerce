import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AuthGateProps {
  onAdminLoginSuccess?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAdminLoginSuccess }) => {
  const { login } = useAuth();
  
  // 'customer' or 'admin'
  const [portal, setPortal] = useState<'customer' | 'admin'>('customer');
  // 'login' or 'register' (customer only)
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePortalSwitch = (newPortal: 'customer' | 'admin') => {
    setPortal(newPortal);
    setErrorMsg(null);
    setEmail('');
    setPassword('');
    setName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (portal === 'admin') {
        // Dedicated Admin Login
        const res = await api.login(email.trim(), password);
        if (res.user.role !== 'admin') {
          throw new Error('Access Denied: This account does not have administrator privileges. Please use the Customer Portal to shop.');
        }
        login(res.access_token, res.user);
        if (onAdminLoginSuccess) {
          onAdminLoginSuccess();
        }
      } else {
        // Customer Portal
        if (customerMode === 'login') {
          const res = await api.login(email.trim(), password);
          login(res.access_token, res.user);
        } else {
          if (!name.trim()) {
            throw new Error('Please enter your full name');
          }
          const res = await api.register(name.trim(), email.trim(), password, 'customer');
          login(res.access_token, res.user);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'admin' | 'customer') => {
    setErrorMsg(null);
    if (role === 'admin') {
      setPortal('admin');
      setEmail('admin@store.com');
      setPassword('Admin@123');
    } else {
      setPortal('customer');
      setCustomerMode('login');
      setEmail('alex@example.com');
      setPassword('Customer@123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <header className="relative z-10 max-w-7xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
              Aura<span className="text-emerald-400">Mart</span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 tracking-widest uppercase">
              Modern Commerce
            </span>
          </div>
        </div>

        {/* Portal Indicator */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
          <span className={`w-2 h-2 rounded-full ${portal === 'admin' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'}`} />
          <span className="font-medium">
            {portal === 'admin' ? 'Executive Admin Gateway' : 'Customer Storefront Portal'}
          </span>
        </div>
      </header>

      {/* Main Auth Container */}
      <main className="relative z-10 max-w-md w-full mx-auto my-8">
        {/* Top Portal Switcher (Customer vs Admin) */}
        <div className="flex bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl mb-4 border border-slate-800 shadow-xl">
          <button
            type="button"
            onClick={() => handlePortalSwitch('customer')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              portal === 'customer'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Login</span>
          </button>
          <button
            type="button"
            onClick={() => handlePortalSwitch('admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              portal === 'admin'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>

        <div className={`bg-slate-900/90 backdrop-blur-xl rounded-3xl border p-6 sm:p-8 shadow-2xl shadow-black/60 transition-all ${
          portal === 'admin' ? 'border-amber-500/30' : 'border-slate-800'
        }`}>
          {/* Card Header */}
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg ${
              portal === 'admin'
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-amber-500/20'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-emerald-500/20'
            }`}>
              {portal === 'admin' ? <Shield className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
            </div>

            {portal === 'admin' ? (
              <>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-400 tracking-wider uppercase mb-1.5">
                  Restricted Administrator Access
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Admin Management Login
                </h1>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto">
                  Sign in with authorized master credentials to manage catalog, orders, and settlements.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {customerMode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
                </h1>
                <p className="text-xs text-slate-400 mt-1.5">
                  {customerMode === 'login' 
                    ? 'Sign in to access 140+ genuine products, cart & checkout'
                    : 'Join AuraMart to enjoy middle-class savings & instant checkout'}
                </p>
              </>
            )}
          </div>

          {/* Sub-Tabs for Customer Mode: Login vs Register */}
          {portal === 'customer' && (
            <div className="flex bg-slate-950/60 p-1 rounded-xl mb-6 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('login');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  customerMode === 'login'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('register');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  customerMode === 'register'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {portal === 'customer' && customerMode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {portal === 'admin' ? 'Administrator Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={portal === 'admin' ? 'admin@store.com' : 'name@example.com'}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                    portal === 'admin'
                      ? 'border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {portal === 'admin' ? 'Master Password' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none transition-all ${
                    portal === 'admin'
                      ? 'border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                      : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                portal === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : portal === 'admin' ? (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>{customerMode === 'login' ? 'Sign In & Enter Store' : 'Create Account & Enter'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-slate-300">Quick Demo One-Click Fill:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                className={`p-2.5 rounded-xl border text-left transition-all group ${
                  portal === 'admin'
                    ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-800'
                }`}
              >
                <div className="text-[11px] font-bold text-amber-400 group-hover:text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Admin Login</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  admin@store.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('customer')}
                className={`p-2.5 rounded-xl border text-left transition-all group ${
                  portal === 'customer'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950 border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800'
                }`}
              >
                <div className="text-[11px] font-bold text-white group-hover:text-emerald-400 flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span>Customer Login</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                  alex@example.com
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Badges below Card */}
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[11px] font-semibold text-slate-300">140+ Products</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Middle class prices</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[11px] font-semibold text-slate-300">Razorpay & UPI</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Verified checkout</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xs">
            <ShoppingBag className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-[11px] font-semibold text-slate-300">Cash on Delivery</p>
            <p className="text-[9px] text-slate-500 mt-0.5">Pay on delivery</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full text-center py-2 text-xs text-slate-500 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} AuraMart Modern Commerce. All rights reserved.</p>
        <p className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SSL 256-Bit Secure Architecture</span>
        </p>
      </footer>
    </div>
  );
};
