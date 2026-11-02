import React, { useState, useEffect } from 'react';
import { useAuth, validateRoleDomain } from '../../context/AuthContext';
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  ChefHat, 
  CreditCard, 
  ShieldCheck, 
  UtensilsCrossed, 
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AuthPage({ initialRole = 'customer', onBackToHome, onAuthSuccess }) {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();

  const [selectedRole, setSelectedRole] = useState(initialRole || 'customer');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync initialRole when changed
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Role metadata
  const roles = [
    {
      id: 'customer',
      label: 'Customer',
      domain: '@gmail.com',
      icon: UtensilsCrossed,
      hint: 'Requires @gmail.com'
    },
    {
      id: 'kitchen',
      label: 'Kitchen',
      domain: '@staff.com',
      icon: ChefHat,
      hint: 'Requires @staff.com'
    },
    {
      id: 'cashier',
      label: 'Cashier',
      domain: '@staff.com',
      icon: CreditCard,
      hint: 'Requires @staff.com'
    },
    {
      id: 'system',
      label: 'Admin',
      domain: '@admin.com',
      icon: ShieldCheck,
      hint: 'Requires @admin.com'
    }
  ];

  const currentRole = roles.find(r => r.id === selectedRole) || roles[0];

  // Helper to append the domain to the email input
  const handleApplyDomain = () => {
    const username = email.split('@')[0] || 'user';
    setEmail(`${username}${currentRole.domain}`);
  };

  // Switch role tab
  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
    setErrorMsg('');
    setSuccessMsg('');
    const target = roles.find(r => r.id === roleId);
    if (email && target) {
      const username = email.split('@')[0];
      setEmail(`${username}${target.domain}`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    // Domain validation
    const domainError = validateRoleDomain(email, selectedRole);
    if (domainError) {
      setErrorMsg(domainError);
      return;
    }

    if (isRegister) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }
    }

    setIsLoading(true);

    try {
      let result;
      if (isRegister) {
        result = await signupWithEmail(email, password, fullName, selectedRole);
      } else {
        result = await loginWithEmail(email, password, selectedRole);
      }

      setIsLoading(false);

      if (result.success) {
        setSuccessMsg(
          isRegister
            ? `Account created successfully! Logging you in...`
            : `Welcome back! Signing you in...`
        );
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(result.user);
        }, 500);
      } else {
        setErrorMsg(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setIsLoading(false);
      setErrorMsg('An unexpected error occurred. Please try again.');
    }
  };

  // Google Sign-In (For Customers with @gmail.com)
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const result = await loginWithGoogle();
    setIsLoading(false);
    if (result.success) {
      if (onAuthSuccess) onAuthSuccess(result.user);
    } else {
      setErrorMsg(result.error || 'Google sign-in was cancelled or failed.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Clean White Header */}
      <header className="w-full bg-white border-b border-slate-200/80 px-6 sm:px-10 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <UtensilsCrossed size={16} />
          </div>
          <span className="text-sm font-bold text-slate-900 tracking-tight">
            Kokan Kinara
          </span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          
          {/* Card Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isRegister 
                ? 'Register your account to access Kokan Kinara' 
                : 'Enter your credentials to access your account'}
            </p>
          </div>

          {/* Role Segmented Tabs */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Select Role
              </span>
              <span className="text-[11px] text-amber-600 font-medium">
                {currentRole.hint}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`py-2 px-1 text-xs font-semibold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-amber-500' : 'text-slate-400'} />
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Switcher Tabs: Sign In / Create Account */}
          <div className="flex border-b border-slate-200 mb-5">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-all cursor-pointer ${
                !isRegister
                  ? 'border-b-2 border-amber-500 text-amber-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 pb-2.5 text-xs font-semibold text-center transition-all cursor-pointer ${
                isRegister
                  ? 'border-b-2 border-amber-500 text-amber-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error & Success Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2 mb-4">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 mb-4">
              <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field (Register only) */}
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Omkar Shinde"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <button
                  type="button"
                  onClick={handleApplyDomain}
                  className="text-[11px] text-amber-600 hover:text-amber-700 hover:underline cursor-pointer font-medium"
                >
                  + {currentRole.domain}
                </button>
              </div>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder={`name${currentRole.domain}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Please wait...</span>
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Google Sign In option (For Customers only) */}
          {selectedRole === 'customer' && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}

          {/* Bottom Switch Link */}
          <div className="text-center mt-5 text-xs text-slate-500">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-amber-600 font-semibold hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-amber-600 font-semibold hover:underline cursor-pointer"
                >
                  Create one
                </button>
              </span>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
