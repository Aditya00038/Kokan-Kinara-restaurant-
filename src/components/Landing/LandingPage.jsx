import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  UtensilsCrossed, 
  ChefHat, 
  CreditCard, 
  Crown, 
  ArrowRight, 
  Sparkles, 
  GitFork,
  Coffee,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Star,
  Zap,
  Globe
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onSelectRole }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'seafood-range',
      taglineOutline: 'Fresh, Crispy & Authentic Malvani.',
      headline: 'Hotel Kokan Kinara Seafood Special',
      subText: 'Fresh Surmai, Pomfret, Prawns and Bombil rava fry from the Arabian Sea. Prepared with authentic coastal spices, flavorful Malvani curry and chilled Solkadhi.',
      categoryBadge: 'SEAFOOD SPECIAL',
      categoryBadgeClass: 'badge-amber',
      ribbonItems: ['Surmai Thali', 'Pomfret Rava Fry', 'Kolambi Masala', 'Authentic Solkadhi'],
      brandSub: 'COASTAL SPECIALTY',
      brandTitle: 'MALVANI SEAFOOD FEAST',
      leftGradient: 'from-amber-500/15 via-slate-900 to-slate-950',
      rightGradient: 'from-sky-950/60 via-slate-900 to-amber-950/30',
      heroAccent: '#f59e0b',
      items: [
        {
          name: 'Surmai Thali',
          desc: 'Crispy Surmai fry, traditional Malvani fish curry, Solkadhi, 2 Tandul Bhakris, and Indrayani rice.',
          price: '₹440',
          image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80',
          badge: 'Chef Choice',
          badgeClass: 'badge-emerald'
        },
        {
          name: 'Pomfret Tawa Rava Fry',
          desc: 'Fresh whole Pomfret marinated in coastal spices, coated with crunchy rava and pan-fried.',
          price: '₹350',
          image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80',
          badge: 'Crispy Rava',
          badgeClass: 'badge-amber'
        },
        {
          name: 'Kolambi Tawa Rava Fry',
          desc: 'Jumbo prawns tossed in fragrant house masala and fried with golden crispy rava coating.',
          price: '₹320',
          image: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=400&q=80',
          badge: 'Prawns Special',
          badgeClass: 'badge-purple'
        }
      ]
    },
    {
      id: 'mutton-range',
      taglineOutline: 'Spicy, Flavorful Tambda & Pandhra Rassa.',
      headline: 'Mutton Sukka & Chicken Malvani Handi',
      subText: 'Slow-cooked in clay pots with roasted coconut masala, served with piping hot bhakri, seasoned broth, and fresh salad.',
      categoryBadge: 'MUTTON & CHICKEN',
      categoryBadgeClass: 'badge-rose',
      ribbonItems: ['Special Mutton Thali', 'Mutton Sukka Fry', 'Chicken Malvani Handi', 'Tandul Bhakri'],
      brandSub: 'HOT & SPICY TASTE',
      brandTitle: 'ROYAL MUTTON SPECIAL',
      leftGradient: 'from-rose-500/15 via-slate-900 to-slate-950',
      rightGradient: 'from-rose-950/60 via-slate-900 to-amber-950/40',
      heroAccent: '#f43f5e',
      items: [
        {
          name: 'Special Mutton Thali',
          desc: 'Tender mutton sukka, signature Tambda rassa, refreshing Solkadhi, hot Bhakris and Indrayani rice.',
          price: '₹450',
          image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=400&q=80',
          badge: 'Top Seller',
          badgeClass: 'badge-rose'
        },
        {
          name: 'Mutton Sukka Fry',
          desc: 'Succulent goat meat slow-roasted in roasted coconut dry masala and coastal aromatic spices.',
          price: '₹320',
          image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80',
          badge: 'Zanzanit',
          badgeClass: 'badge-amber'
        },
        {
          name: 'Chicken Malvani Handi',
          desc: 'Tender chicken simmered in clay handi with rich Malvani coconut-onion gravy.',
          price: '₹350',
          image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
          badge: 'Handi Special',
          badgeClass: 'badge-purple'
        }
      ]
    },
    {
      id: 'veg-range',
      taglineOutline: 'Pure Veg, Authentic Traditional Flavors.',
      headline: 'Paneer Peshwai, Kaju Masala & Pithla Bhakri',
      subText: 'Rich royal dishes for vegetarian lovers: royal Paneer Peshwai, fresh Cashew curry, rustic Pithla Bhakri, and steamed Ukadiche Modak.',
      categoryBadge: 'PURE VEG DELIGHT',
      categoryBadgeClass: 'badge-emerald',
      ribbonItems: ['Paneer Peshwai', 'Kaju Masala', 'Pithla Bhakri Thali', 'Ukadiche Modak'],
      brandSub: 'VEG HERITAGE',
      brandTitle: 'PURE VEG SPECIALTIES',
      leftGradient: 'from-emerald-500/15 via-slate-900 to-slate-950',
      rightGradient: 'from-emerald-950/60 via-slate-900 to-amber-950/30',
      heroAccent: '#10b981',
      items: [
        {
          name: 'Paneer Peshwai',
          desc: 'Fresh cottage cheese cubes simmered in a royal aromatic gravy garnished with dry fruits and ghee.',
          price: '₹280',
          image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=400&q=80',
          badge: 'Royal Veg',
          badgeClass: 'badge-emerald'
        },
        {
          name: 'Pithla Bhakri Thali',
          desc: 'Steaming gram flour pithla with spicy green chilli thecha, 2 hot Bhakris and spiced buttermilk.',
          price: '₹160',
          image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
          badge: 'Desi Flavors',
          badgeClass: 'badge-rose'
        },
        {
          name: 'Ukadiche Modak',
          desc: 'Traditional steamed rice flour dumplings stuffed with grated fresh coconut, jaggery and cardamom, topped with pure desi ghee.',
          price: '₹40',
          image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
          badge: 'Sweet Delight',
          badgeClass: 'badge-purple'
        }
      ]
    }
  ];

  const current = slides[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION: LUXURY COLORFUL SPLIT-SCREEN SHOWCASE */}
      {/* ============================================================ */}
      <section className="relative w-full min-h-[660px] lg:min-h-[720px] flex flex-col lg:flex-row overflow-hidden border-b border-white/10">
        
        {/* LEFT PANEL (~40% width): WARM LUXURY GRADIENT WITH BOLD HEADLINES */}
        <div className={`w-full lg:w-[40%] p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative bg-gradient-to-br ${current.leftGradient} z-20 border-r border-white/10 transition-all duration-500`}>
          
          {/* Top Brand Logo */}
          <div className="flex items-center gap-3.5">
            <div 
              onClick={onGetStarted}
              className="w-12 h-12 bg-gradient-to-br from-amber-500 to-rose-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 cursor-pointer hover:scale-105 transition-transform"
            >
              <UtensilsCrossed size={24} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-black tracking-wider text-xl text-white block leading-tight">
                KOKAN KINARA
              </span>
              <span className="text-[10px] font-mono font-bold text-amber-400 tracking-widest uppercase block">
                Restaurant Operating System
              </span>
            </div>
          </div>

          {/* Center Main Headline */}
          <div className="my-10 lg:my-0">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className={`badge ${current.categoryBadgeClass}`}>
                <Sparkles size={11} /> {current.categoryBadge}
              </span>
            </div>

            {/* Outlined text */}
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 text-slate-300 leading-tight">
              {current.taglineOutline}
            </h2>

            {/* Vibrant Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.08] mb-4">
              {current.headline}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mb-8">
              {current.subText}
            </p>

            {/* Vibrant Action Buttons */}
            <div className="flex items-center gap-3.5 flex-wrap">
              <button
                type="button"
                onClick={onGetStarted}
                className="btn-primary text-xs sm:text-sm py-3.5 px-7 cursor-pointer"
              >
                <span>Sign In / Enter Auth Page</span>
                <ArrowRight size={15} />
              </button>
              
              <button
                type="button"
                onClick={() => onSelectRole('customer')}
                className="btn-secondary text-xs sm:text-sm py-3.5 px-5 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={14} className="text-amber-400" />
                <span>Register / Sign In</span>
              </button>
            </div>
          </div>

          {/* Bottom Left Carousel Controls (< and >) */}
          <div className="flex items-center gap-3 pt-6">
            <button
              type="button"
              onClick={handlePrev}
              className="w-11 h-11 rounded-full border border-white/15 text-white hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer bg-slate-900/80 shadow"
              aria-label="Previous Slide"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="w-11 h-11 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 flex items-center justify-center transition-all cursor-pointer font-bold shadow-lg shadow-amber-500/25"
              aria-label="Next Slide"
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>

            <span className="text-xs font-bold text-amber-400 ml-2 font-mono">
              0{currentSlide + 1} / 0{slides.length}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL (~60% width): RICH ATMOSPHERIC GRADIENTS WITH GOURMET CARDS */}
        <div className={`w-full lg:w-[60%] relative flex flex-col justify-between bg-gradient-to-b ${current.rightGradient} p-6 sm:p-10 lg:p-12 overflow-hidden transition-all duration-500`}>
          
          {/* Top Right Navigation Bar with Role Destinations */}
          <div className="flex items-center justify-between gap-4 z-20 flex-wrap pb-4">
            <nav className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm font-bold text-slate-300 tracking-tight flex-wrap">
              <button 
                type="button"
                onClick={() => onSelectRole('customer')} 
                className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Customer (@gmail.com)</span>
              </button>
              <button 
                type="button"
                onClick={() => onSelectRole('kitchen')} 
                className="hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Kitchen (@staff.com)</span>
              </button>
              <button 
                type="button"
                onClick={() => onSelectRole('cashier')} 
                className="hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Cashier (@staff.com)</span>
              </button>
              <button 
                type="button"
                onClick={() => onSelectRole('system')} 
                className="hover:text-purple-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Manager (@admin.com)</span>
              </button>
            </nav>

            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black tracking-tight shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <span>Sign In Portal</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Center Graphic Showcase: Banner Ribbon & Trio Culinary Cards */}
          <div className="relative z-10 my-8 sm:my-10 flex flex-col items-center text-center">
            
            {/* Top Ribbon */}
            <div className="flex items-center gap-3 mb-4 flex-wrap justify-center">
              <div className="glass-panel px-6 py-2 rounded-full shadow-md border border-white/15 text-slate-200 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-3">
                {current.ribbonItems.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <span>{item}</span>
                    {idx < current.ribbonItems.length - 1 && <span className="text-amber-400 font-bold">•</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Luxury Brand Title */}
            <div className="mb-6">
              <div className="font-serif italic text-3xl sm:text-5xl text-amber-200/90 font-black drop-shadow-sm tracking-wide">
                Kokan Kinara
              </div>
              <div className="text-xs sm:text-sm font-mono uppercase tracking-widest mt-1 text-amber-400 font-bold">
                {current.brandSub}
              </div>
              <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight drop-shadow-md">
                {current.brandTitle}
              </div>
            </div>

            {/* The 3 Delicacy Cards (Colorful & Appetizing) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-4xl mx-auto w-full items-stretch pt-2">
              {current.items.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => onSelectRole('customer')}
                  className="glass-panel p-4 sm:p-5 rounded-3xl shadow-xl border border-white/10 hover:border-amber-400/50 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 cursor-pointer group text-left bg-slate-900/85 backdrop-blur-xl"
                >
                  <div>
                    {/* Badge */}
                    <div className="flex justify-between items-center mb-3">
                      <span className={`badge ${item.badgeClass} text-[10px]`}>
                        {item.badge}
                      </span>
                      <span className="font-mono font-extrabold text-amber-400 text-sm">
                        {item.price}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="w-full h-44 sm:h-48 overflow-hidden rounded-2xl mb-3 shadow-inner bg-slate-950 relative">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h4 className="font-extrabold text-white text-sm mb-1 line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-bold text-amber-400 group-hover:underline">
                    <span>Order Online</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Legal Fine Print */}
          <div className="z-10 flex items-center justify-between text-[11px] text-slate-400 pt-4 border-t border-white/10 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block" />
              <span>Artisanal ingredients prepared fresh to order. Firebase Auth & Firestore live data synchronisation.</span>
            </div>
            <div className="font-mono font-bold text-amber-400">
              Kokan Kinara Hospitality Co.
            </div>
          </div>

        </div>

      </section>

      {/* ============================================================ */}
      {/* 2. DEPARTMENT WORKSPACES (With user domain mapping) */}
      {/* ============================================================ */}
      <section className="bg-slate-950 px-6 sm:px-12 lg:px-16 py-20 text-white relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Sparkles size={14} /> Connected Role Workspaces
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Launch Department Workspaces
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                Choose any role below. Each portal is secured with real Firebase Auth and mapped to standard domain prefixes:
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectRole('customer')}
              className="btn-secondary text-xs py-2.5 px-4 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Sparkles size={15} className="text-amber-400" />
              <span>Sign In / Register Portal</span>
            </button>
          </div>

          {/* 4 Colorful Workspace Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Customer (@gmail.com) */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-emerald-500/10 via-slate-900 to-slate-950 border border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col justify-between group shadow-lg">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform font-bold border border-emerald-500/30">
                  <UtensilsCrossed size={24} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                    Diners
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    @gmail.com
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Online Menu & Ordering
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  Browse authentic coastal dishes & artisanal mains, configure cart, select dining tables or delivery, and order online with instant confirmation.
                </p>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-mono mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Domain required: <strong className="text-emerald-400">@gmail.com</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectRole('customer')}
                  className="btn-success w-full py-3 text-xs font-black shadow-md cursor-pointer"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card 2: Kitchen (@staff.com) */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-rose-500/10 via-slate-900 to-slate-950 border border-rose-500/30 hover:border-rose-400 transition-all flex flex-col justify-between group shadow-lg">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform font-bold border border-rose-500/30">
                  <ChefHat size={24} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-rose-400 tracking-wider">
                    Kitchen Staff
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold">
                    @staff.com
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Kitchen Display (KDS)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  Incoming tickets board for kitchen staff. Track preparation countdowns, cooking stages, and click "Mark Ready" to notify the system and generate bills.
                </p>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-mono mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span>Domain required: <strong className="text-rose-400">@staff.com</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectRole('kitchen')}
                  className="btn-danger w-full py-3 text-xs font-black shadow-md cursor-pointer"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card 3: Cashier (@staff.com) */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-blue-500/10 via-slate-900 to-slate-950 border border-blue-500/30 hover:border-blue-400 transition-all flex flex-col justify-between group shadow-lg">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform font-bold border border-blue-500/30">
                  <CreditCard size={24} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400 tracking-wider">
                    Cashier POS
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                    @staff.com
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Cashier & POS Desk
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  Billing register: Cash calculator with change due, Card swipe, dynamic UPI QR codes, and instant tax invoice generation upon payment.
                </p>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-mono mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Domain required: <strong className="text-blue-400">@staff.com</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectRole('cashier')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 cursor-pointer"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Card 4: Manager & Admin (@admin.com) */}
            <div className="p-7 rounded-3xl bg-gradient-to-b from-purple-500/10 via-slate-900 to-slate-950 border border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between group shadow-lg">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform font-bold border border-purple-500/30">
                  <Crown size={24} />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-purple-400 tracking-wider">
                    Manager & Admin
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                    @admin.com
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  System State Engine
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  Autonomous validation logic: checks table occupancy, decrements stock count, calculates 5% GST, and streams system audit logs.
                </p>
              </div>

              <div>
                <div className="text-[10px] text-slate-400 font-mono mb-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Domain required: <strong className="text-purple-400">@admin.com</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectRole('system')}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 cursor-pointer"
                >
                  <span>Sign In / Register</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 px-6 sm:px-12 py-8 text-xs text-slate-400 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 font-black text-white text-sm">
            <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-rose-600 rounded flex items-center justify-center text-slate-950">
              <UtensilsCrossed size={14} />
            </div>
            <span>KOKAN KINARA RESTAURANT MANAGEMENT SYSTEM</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Real Firebase Firestore & Auth (auth-3ea33) • Multi-Swimlane Live Architecture
          </div>
        </div>
      </footer>

    </div>
  );
}
