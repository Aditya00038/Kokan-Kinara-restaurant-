import React, { useState, useEffect } from 'react';
import { useAuth, validateRoleDomain } from '../../context/AuthContext';
import {
    Mail,
    Lock,
    User,
    ArrowRight,
    ArrowLeft,
    ChefHat,
    ShieldCheck,
    UtensilsCrossed,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Sparkles,
    BarChart3,
    Coffee
} from 'lucide-react';

export default function AuthPage({ initialRole = 'customer', onBackToHome, onAuthSuccess }) {
    const { loginWithEmail, signupWithEmail, loginWithGoogle, loginAsDemoRole } = useAuth();

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

    // Role definitions: Customer, Waiter, Kitchen Chef, Manager, Admin
    const roles = [
        {
            id: 'customer',
            label: 'Customer',
            domain: '@gmail.com',
            icon: UtensilsCrossed,
            hint: 'Doorstep Delivery & Reservations'
        },
        {
            id: 'waiter',
            label: 'Waiter',
            domain: '@waiter.com',
            icon: Coffee,
            hint: 'Floor & Dine-In Service'
        },
        {
            id: 'kitchen',
            label: 'Chef',
            domain: '@staff.com',
            icon: ChefHat,
            hint: 'Kitchen Live Production Rail'
        },
        {
            id: 'manager',
            label: 'Manager',
            domain: '@admin.com',
            icon: ShieldCheck,
            hint: 'Operations & Dispatch'
        },
        {
            id: 'admin',
            label: 'Admin',
            domain: '@admin.com',
            icon: BarChart3,
            hint: 'Executive Business Analytics'
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

    // Quick 1-Click Demo Login
    const handleDemoQuickLogin = (roleId) => {
        const user = loginAsDemoRole(roleId);
        if (user && onAuthSuccess) {
            onAuthSuccess(user);
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

    // Google Sign-In (For Customers)
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
        <div className="min-h-screen w-full bg-neutral-50 text-neutral-800 flex flex-col font-sans">
            {/* Header */}
            <header className="w-full bg-white border-b border-neutral-200 px-6 sm:px-10 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                <button
                    onClick={onBackToHome}
                    className="flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors px-3 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 bg-white shadow-2xs cursor-pointer"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Home</span>
                </button>

                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-xs font-bold text-sm">
                        KK
                    </div>
                    <span className="text-sm font-bold text-neutral-900 tracking-tight">
                        Kokan Kinara
                    </span>
                </div>
            </header>

            {/* Main Auth Container */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
                <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
                    {/* Card Title */}
                    <div className="text-center">
                        <h1 className="text-2xl font-black text-neutral-900">
                            {isRegister ? 'Create an Account' : 'Welcome to Kokan Kinara'}
                        </h1>
                        <p className="text-xs text-neutral-500 mt-1">
                            {isRegister
                                ? 'Register for doorstep food delivery & table bookings'
                                : 'Select your workspace role or use 1-click demo access below'}
                        </p>
                    </div>

                    {/* 1-Click Instant Demo Role Switcher Bar */}
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-amber-900">
                            <span className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> 1-Click Instant Demo Login:
                            </span>
                            <span className="text-[10px] text-amber-700">No password required</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5">
                            {[
                                { id: 'customer', label: 'Customer', color: 'hover:bg-red-600 hover:text-white' },
                                { id: 'waiter', label: 'Waiter', color: 'hover:bg-amber-600 hover:text-white' },
                                { id: 'kitchen', label: 'Chef', color: 'hover:bg-rose-600 hover:text-white' },
                                { id: 'manager', label: 'Manager', color: 'hover:bg-blue-600 hover:text-white' },
                                { id: 'admin', label: 'Admin', color: 'hover:bg-neutral-900 hover:text-white' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleDemoQuickLogin(item.id)}
                                    className={`py-1.5 px-1 bg-white border border-amber-200 rounded-xl text-[11px] font-bold text-neutral-800 transition-all shadow-2xs text-center cursor-pointer ${item.color}`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role Segmented Tabs */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                                Or Sign in as:
                            </span>
                            <span className="text-[11px] text-red-600 font-semibold">
                                {currentRole.hint}
                            </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 p-1 bg-neutral-100 rounded-2xl">
                            {roles.map(role => {
                                const Icon = role.icon;
                                const isSelected = selectedRole === role.id;
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => handleRoleChange(role.id)}
                                        className={`py-2 px-1 text-[11px] font-bold rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                                            isSelected
                                                ? 'bg-white text-neutral-900 shadow-xs'
                                                : 'text-neutral-500 hover:text-neutral-900'
                                        }`}
                                    >
                                        <Icon size={14} className={isSelected ? 'text-red-600' : 'text-neutral-400'} />
                                        <span className="truncate">{role.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Sign In / Register Tabs */}
                    <div className="flex border-b border-neutral-200">
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(false);
                                setErrorMsg('');
                                setSuccessMsg('');
                            }}
                            className={`flex-1 pb-2.5 text-xs font-bold text-center transition-all cursor-pointer ${
                                !isRegister
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-neutral-400 hover:text-neutral-600'
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
                            className={`flex-1 pb-2.5 text-xs font-bold text-center transition-all cursor-pointer ${
                                isRegister
                                    ? 'border-b-2 border-red-600 text-red-600'
                                    : 'text-neutral-400 hover:text-neutral-600'
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Error & Success Alerts */}
                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0 text-rose-500" />
                            <span>{errorMsg}</span>
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                            <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    {/* Main Auth Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isRegister && (
                            <div>
                                <label className="text-xs font-bold text-neutral-700 mb-1 block">Full Name</label>
                                <div className="relative">
                                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Anand Kadam"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-xs font-bold text-neutral-700">Email Address</label>
                                <button
                                    type="button"
                                    onClick={handleApplyDomain}
                                    className="text-[11px] text-red-600 hover:underline font-semibold"
                                >
                                    + {currentRole.domain}
                                </button>
                            </div>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder={`name${currentRole.domain}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-700 mb-1 block">Password</label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {isRegister && (
                            <div>
                                <label className="text-xs font-bold text-neutral-700 mb-1 block">Confirm Password</label>
                                <div className="relative">
                                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Re-enter password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {isLoading ? (
                                <span>Please wait...</span>
                            ) : (
                                <>
                                    <span>{isRegister ? 'Create Account' : 'Sign In to Kokan Kinara'}</span>
                                    <ArrowRight size={15} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Google Sign In option (Customers only) */}
                    {selectedRole === 'customer' && (
                        <div className="pt-2 border-t border-neutral-100">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={isLoading}
                                className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
