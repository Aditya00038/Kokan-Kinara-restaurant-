import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  X,
  Menu,
  ArrowRight,
  Calendar,
  Clock,
  Users,
  UtensilsCrossed,
  Truck,
  ChefHat,
  CreditCard,
  Crown,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Phone,
  MapPin,
  ChevronRight,
  ChevronDown,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { VegNonVegIcon } from '../Common/VegNonVegBadge';
import CursorImageTrail, { FOOD_TRAIL_IMAGES } from './CursorImageTrail';

export default function LandingPage({ onGetStarted, onOpenDineIn, onSelectRole }) {
  const { createReservation } = useRestaurant();

  // Drawers and Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Reservation Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [bookingDate, setBookingDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState('19:30');
  const [guestCount, setGuestCount] = useState(2);
  const [seatingPref, setSeatingPref] = useState('Main Coastal Dining Hall');
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingSuccessData, setBookingSuccessData] = useState(null);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;

    const res = createReservation({
      customerName: guestName.trim(),
      customerPhone: guestPhone.trim(),
      customerEmail: guestEmail.trim(),
      reservationDate: bookingDate,
      timeSlot: bookingTime,
      guestCount: Number(guestCount),
      seatingPreference: seatingPref,
      specialRequests: specialRequests.trim()
    });

    if (res.success) {
      setBookingSuccessData(res.reservation);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingSuccessData(null);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Featured Signature Dishes
  const signatureDishes = [
    {
      name: 'Surmai Tawa Rava Fry',
      marathi: 'सुरमई रवा फ्राय',
      desc: 'Fresh kingfish slice marinated in fiery coastal Malvani masala, coated in golden semolina and shallow fried to crisp perfection.',
      price: '₹380',
      category: 'Seafood Special',
      isVeg: false,
      image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=700&q=80',
      tag: 'Chef Choice'
    },
    {
      name: 'Traditional Tandul Bhakri Thali',
      marathi: 'तांदूळ भाकरी थाळी',
      desc: 'Clay-tava roasted warm rice flour bhakris served with steaming gram flour pithla, spicy green chilli thecha, and chilled Solkadhi.',
      price: '₹180',
      category: 'Konkan Heritage',
      isVeg: true,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80',
      tag: 'Pure Veg'
    },
    {
      name: 'Malvani Chicken Handi & Vade',
      marathi: 'चिकन हंडी आणि वडे',
      desc: 'Slow-simmered tender chicken in roasted coconut-onion gravy, accompanied by four piping-hot multi-grain crispy puris.',
      price: '₹360',
      category: 'Clay Handi',
      isVeg: false,
      image: '/chicken_handi.png',
      tag: 'Best Seller'
    },
    {
      name: 'Kolambi Masala Fry',
      marathi: 'कोळंबी मसाला फ्राय',
      desc: 'Fresh Arabian Sea jumbo prawns tossed with pungent coastal garlic, roasted red spices, and freshly ground kokum pulp.',
      price: '₹340',
      category: 'Prawns Delight',
      isVeg: false,
      image: 'https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=700&q=80',
      tag: 'Zanzanit'
    },
    {
      name: 'Authentic Pink Solkadhi',
      marathi: 'ताजी सोलकढी',
      desc: 'Refreshing traditional digestif made with fresh coconut milk, dried wild kokum extract, tempered with roasted cumin, green chillies and fresh cilantro.',
      price: '₹60',
      category: 'Coastal Elixir',
      isVeg: true,
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
      tag: 'Signature Drink'
    },
    {
      name: 'Steamed Ukadiche Modak',
      marathi: 'उकडीचे मोदक',
      desc: 'Delicate steamed rice flour dumplings filled with grated fresh coconut, organic jaggery, cardamom, and generously topped with pure desi ghee.',
      price: '₹80',
      category: 'Traditional Sweet',
      isVeg: true,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=700&q=80',
      tag: 'Divine Sweet'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f223d] font-sans text-[16px] selection:bg-[#0f223d] selection:text-white flex flex-col relative">

      {/* ============================================================ */}
      {/* TOP UNIFIED NAVBAR                                          */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-40 bg-[#0c1f38] text-white border-b-2 border-[#0f223d] shadow-md select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Coastal Wordmark */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {/* Seigaiha Wave Icon Emblem */}
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center p-1.5 overflow-hidden group-hover:border-white transition-colors">
              <svg viewBox="0 0 40 24" className="w-full h-full text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M0,24 a12,12 0 0,1 24,0 M3,24 a9,9 0 0,1 18,0 M6,24 a6,6 0 0,1 12,0" />
                <path d="M16,24 a12,12 0 0,1 24,0 M19,24 a9,9 0 0,1 18,0 M22,24 a6,6 0 0,1 12,0" />
              </svg>
            </div>
            <div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-white uppercase block leading-none">
                Kokan Kinara
              </span>
              <span className="text-[10px] tracking-[0.2em] text-[#dc2626] font-black uppercase block mt-0.5">
                Malvan Coastal Dining
              </span>
            </div>
          </div>

          {/* Center: Navigation Links (ABOUT, DISHES, GALLERY, RESERVATION) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-neutral-300">
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              ABOUT
            </button>
            <button
              onClick={() => scrollToSection('dishes')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              DISHES
            </button>
            <button
              onClick={() => scrollToSection('gallery')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              GALLERY
            </button>
            <button
              onClick={() => scrollToSection('reservation')}
              className="hover:text-[#dc2626] transition-colors cursor-pointer"
            >
              RESERVATION
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Table QR Dine-In */}
            <button
              type="button"
              onClick={onOpenDineIn}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all border border-white/15 cursor-pointer"
            >
              <UtensilsCrossed size={14} className="text-[#dc2626]" />
              <span>Table QR</span>
            </button>

            {/* Order Online */}
            <button
              type="button"
              onClick={onGetStarted}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#dc2626]/30 cursor-pointer"
            >
              <Truck size={14} />
              <span>Order Online</span>
            </button>

            {/* Book Table Button */}
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-[#0c1f38] hover:bg-neutral-100 text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              <Calendar size={14} className="text-[#0c1f38]" />
              <span>Book Table</span>
            </button>

            {/* Staff Workspaces Modal Trigger */}
            <button
              type="button"
              onClick={() => setIsStaffModalOpen(true)}
              className="w-9 h-9 rounded-full border border-white/20 hover:border-white flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
              title="Staff Workspaces"
            >
              <ChefHat size={16} />
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-white/20 flex items-center justify-center text-white cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0c1f38] border-t border-white/10 px-6 py-5 flex flex-col gap-4 text-xs font-bold uppercase tracking-[0.18em]">
            <button
              onClick={() => { scrollToSection('about'); setIsMobileMenuOpen(false); }}
              className="text-left text-neutral-300 hover:text-white py-1"
            >
              ABOUT
            </button>
            <button
              onClick={() => { scrollToSection('dishes'); setIsMobileMenuOpen(false); }}
              className="text-left text-neutral-300 hover:text-white py-1"
            >
              DISHES
            </button>
            <button
              onClick={() => { scrollToSection('gallery'); setIsMobileMenuOpen(false); }}
              className="text-left text-neutral-300 hover:text-white py-1"
            >
              GALLERY
            </button>
            <button
              onClick={() => { scrollToSection('reservation'); setIsMobileMenuOpen(false); }}
              className="text-left text-[#dc2626] py-1"
            >
              RESERVATION
            </button>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => { onOpenDineIn(); setIsMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-full bg-white/10 text-white flex items-center justify-center gap-2 text-xs font-bold tracking-wider"
              >
                <UtensilsCrossed size={14} className="text-[#dc2626]" />
                <span>Table QR Dine-In</span>
              </button>
              <button
                type="button"
                onClick={() => { onGetStarted(); setIsMobileMenuOpen(false); }}
                className="w-full py-2.5 rounded-full bg-[#dc2626] text-white flex items-center justify-center gap-2 text-xs font-bold tracking-wider"
              >
                <Truck size={14} />
                <span>Order Online</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================ */}
      {/* 1. HERO POSTER FRAME (FULL WIDTH) WITH CURSOR FOOD TRAIL     */}
      {/* ============================================================ */}
      <CursorImageTrail
        as="section"
        images={FOOD_TRAIL_IMAGES}
        imageWidth={135}
        imageHeight={145}
        radius={14}
        frequency={36}
        visibleFor={1.5}
        className="w-full min-h-[calc(100vh-70px)] bg-[#fbfcfd] flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b-2 border-[#0f223d] select-none"
      >

        {/* Subtle Repeating Seigaiha Waves Background Pattern */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="coastal-waves" width="56" height="28" patternUnits="userSpaceOnUse">
              <path d="M 0 28 A 28 28 0 0 1 56 28 M 4 28 A 24 24 0 0 1 52 28 M 8 28 A 20 20 0 0 1 48 28 M 12 28 A 16 16 0 0 1 44 28 M 16 28 A 12 12 0 0 1 40 28 M 20 28 A 8 8 0 0 1 36 28" fill="none" stroke="#0c1f38" strokeWidth="1.2" />
              <path d="M -28 14 A 28 28 0 0 1 28 14 M -24 14 A 24 24 0 0 1 24 14 M -20 14 A 20 20 0 0 1 20 14 M -16 14 A 16 16 0 0 1 16 14 M -12 14 A 12 12 0 0 1 12 14 M -8 14 A 8 8 0 0 1 8 14" fill="none" stroke="#0c1f38" strokeWidth="1.2" />
              <path d="M 28 14 A 28 28 0 0 1 84 14 M 32 14 A 24 24 0 0 1 80 14 M 36 14 A 20 20 0 0 1 76 14 M 40 14 A 16 16 0 0 1 72 14 M 44 14 A 12 12 0 0 1 68 14 M 48 14 A 8 8 0 0 1 64 14" fill="none" stroke="#0c1f38" strokeWidth="1.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#coastal-waves)" />
        </svg>

        {/* TOP THREE-COLUMN ROW (EXACT SAME AS ATTACHMENT) */}
        <div className="relative z-10 w-full flex items-start justify-between text-xs sm:text-sm font-black uppercase text-[#0c1f38]">

          {/* Top Left: A TASTE OF KONKAN */}
          <div className="tracking-[0.18em] leading-tight text-left">
            <span className="block text-neutral-400 font-bold text-[11px] sm:text-xs">A TASTE</span>
            <span className="block font-black text-xs sm:text-sm text-[#0c1f38]">OF KONKAN</span>
          </div>

          {/* Top Center: FISH FRY & BHAKRI (Red Accent requested by user) */}
          <div className="text-center px-3 py-1">
            <span className="font-black tracking-[0.25em] text-[#dc2626] text-xs sm:text-sm md:text-base uppercase inline-block drop-shadow-2xs">
              FISH FRY & BHAKRI
            </span>
          </div>

          {/* Spacer to maintain perfect center alignment */}
          <div className="w-20 hidden sm:block pointer-events-none" aria-hidden="true" />

        </div>

        {/* ======================================================== */}
        {/* CENTER MASSIVE HERO TITLE (SAME TO SAME TYPOGRAPHY)     */}
        {/* ======================================================== */}
        <div className="relative z-10 my-auto py-8 sm:py-12 lg:py-16 text-center select-none">
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[7.2rem] xl:text-[8.5rem] font-black text-[#0c1f38] uppercase tracking-[-0.04em] leading-[0.88] sm:leading-[0.88] drop-shadow-xs">
            <span className="block">AUTHENTIC</span>
            <span className="block my-1 sm:my-2 md:my-3">KONKAN COASTAL</span>
            <span className="block">DINING</span>
          </h1>

          {/* Peeking Tagline */}
          <p className="mt-7 sm:mt-10 text-sm md:text-base text-neutral-600 italic max-w-xl mx-auto tracking-wide">
            "Hand-ground roasted coconut masalas, wild kokum, and fresh Arabian Sea catch served with steaming Tandul Bhakris."
          </p>

          {/* Hero Interactive Action Buttons */}
          <div className="mt-8 flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="px-7 py-3.5 rounded-full bg-[#0c1f38] hover:bg-[#16335a] text-white text-xs sm:text-sm font-black uppercase tracking-[0.18em] transition-all duration-300 shadow-xl shadow-[#0c1f38]/20 cursor-pointer hover:scale-105"
            >
              Book Your Table
            </button>

            <button
              type="button"
              onClick={onGetStarted}
              className="px-7 py-3.5 rounded-full bg-white hover:bg-neutral-50 text-[#0c1f38] border-2 border-[#0c1f38] text-xs sm:text-sm font-black uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-xs hover:scale-105"
            >
              <Truck size={16} className="text-[#dc2626]" />
              <span>Order Online</span>
            </button>

            <button
              type="button"
              onClick={onOpenDineIn}
              className="px-6 py-3.5 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs sm:text-sm font-black uppercase tracking-[0.18em] transition-all duration-300 cursor-pointer flex items-center gap-2 shadow-lg shadow-[#dc2626]/25 hover:scale-105"
            >
              <UtensilsCrossed size={16} />
              <span>Table QR (Dine-In)</span>
            </button>
          </div>
        </div>

        {/* BOTTOM SUB-ROW: Timings & Location */}
        <div className="relative z-10 w-full pt-4 border-t border-[#0c1f38]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs font-mono text-neutral-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#dc2626] animate-pulse" />
            <span>TIMINGS: 11:30 AM – 03:30 PM & 07:00 PM – 11:30 PM DAILY</span>
          </div>

          <div className="text-center font-bold text-[#0c1f38]">
            HOTEL KOKAN KINARA • EST. MALVAN
          </div>

          <button
            onClick={() => scrollToSection('dishes')}
            className="text-[#0c1f38] hover:text-[#dc2626] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Explore Menu</span>
            <ChevronDown size={14} />
          </button>
        </div>

      </CursorImageTrail>

      {/* ============================================================ */}
      {/* 2. SIGNATURE DISHES & MENU SECTION (#dishes)                 */}
      {/* ============================================================ */}
      <section id="dishes" className="w-full bg-[#fbfcfd] px-6 sm:px-12 lg:px-20 py-20 border-b-2 border-[#0f223d] relative">
        <div className="max-w-7xl mx-auto">

          {/* Section Heading */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 pb-6 border-b border-[#0f223d]/15">
            <div>
              <span className="text-xs font-mono font-black text-[#dc2626] tracking-[0.25em] uppercase block mb-1">
                COASTAL CULINARY ART
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0c1f38] tracking-tight uppercase">
                Signature Dishes & Fish Thalis
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="px-5 py-2.5 rounded-full bg-[#0c1f38] hover:bg-[#16335a] text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Full Online Menu</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {signatureDishes.map((dish, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border-2 border-[#0f223d]/15 p-5 flex flex-col justify-between hover:border-[#0f223d] hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  {/* Image container */}
                  <div className="w-full h-52 rounded-xl overflow-hidden mb-4 bg-neutral-100 relative">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-[#0c1f38] uppercase shadow-sm flex items-center gap-1">
                      <VegNonVegIcon isVeg={dish.isVeg} size={11} />
                      <span>{dish.tag}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-[#0c1f38] text-white px-2.5 py-1 rounded-md text-xs font-black font-mono shadow-sm">
                      {dish.price}
                    </div>
                  </div>

                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <h3 className="font-black text-lg text-[#0c1f38] group-hover:text-[#dc2626] transition-colors">
                        {dish.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-neutral-400 font-mono">
                        {dish.marathi} • {dish.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed mt-2">
                    {dish.desc}
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-[#0c1f38]">
                    {dish.price}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onGetStarted}
                      className="px-4 py-1.5 rounded-lg bg-[#0c1f38] hover:bg-[#16335a] text-white text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer"
                    >
                      Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HERITAGE & THE KONKAN STORY (#about)                      */}
      {/* ============================================================ */}
      <section id="about" className="w-full bg-[#0c1f38] text-white px-6 sm:px-12 lg:px-20 py-20 sm:py-28 border-b-2 border-[#0f223d]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Atmospheric Photo */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80"
                alt="Cooking coastal dishes on cast iron"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c1f38]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 right-5 text-xs font-mono text-neutral-300">
                <span className="text-[#dc2626] font-bold block uppercase tracking-widest text-[10px]">Fresh Coastal Catch</span>
                <span>Cooked fresh daily on authentic iron tawas and clay handis</span>
              </div>
            </div>
          </div>

          {/* Right Column: Story Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#dc2626] tracking-[0.3em] uppercase block">
                PHILOSOPHY & TRADITION
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight">
                Authentic Flavors Straight From The Malvan Coast
              </h2>
            </div>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
              At Kokan Kinara, we celebrate the pure culinary traditions of the Konkan coastline. Our kitchen prepares every dish from scratch — freshly ground coconut masalas roasted over wood fires, hand-crushed wild kokum from the Konkan hills, and ocean catches delivered straight from the coast every morning.
            </p>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
              Whether you are craving a crispy Surmai tawa fry with piping hot Tandul Bhakris, an aromatic clay pot Chicken Handi, or a refreshing glass of chilled Solkadhi, we welcome you to experience an unhurried, royal feast.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="px-6 py-3 rounded-full bg-white hover:bg-neutral-100 text-[#0c1f38] font-black text-xs uppercase tracking-[0.18em] transition-all cursor-pointer shadow-lg"
              >
                Book Your Table
              </button>

              <button
                type="button"
                onClick={onOpenDineIn}
                className="px-6 py-3 rounded-full border border-white/30 hover:border-white text-white font-bold text-xs uppercase tracking-[0.18em] transition-all cursor-pointer"
              >
                Table QR Dine-In
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. VISUAL COASTAL GALLERY (#gallery)                         */}
      {/* ============================================================ */}
      <section id="gallery" className="w-full bg-[#fbfcfd] py-16 border-b-2 border-[#0f223d]">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 mb-8 flex justify-between items-end">
          <div>
            <span className="text-xs font-mono font-bold text-[#dc2626] tracking-[0.25em] uppercase block">
              COASTAL MOMENTS
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0c1f38] uppercase tracking-tight">
              A Taste of the Kokan Life
            </h3>
          </div>
          <button
            type="button"
            onClick={onGetStarted}
            className="text-xs font-bold uppercase tracking-wider text-[#0c1f38] hover:text-[#dc2626] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Order Dishes Online</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* 4-Column Image Grid */}
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl overflow-hidden aspect-square border border-[#0f223d]/20 relative group">
            <img
              src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80"
              alt="Surmai Thali"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-white text-xs font-bold font-mono">Special Surmai Thali</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden aspect-square border border-[#0f223d]/20 relative group">
            <img
              src="/chicken_handi.png"
              alt="Clay Handi Chicken"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-white text-xs font-bold font-mono">Clay Handi Chicken</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden aspect-square border border-[#0f223d]/20 relative group">
            <img
              src="https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=600&q=80"
              alt="Kolambi Rava Fry"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-white text-xs font-bold font-mono">Crispy Kolambi Fry</span>
            </div>
          </div>

          <div className="rounded-xl overflow-hidden aspect-square border border-[#0f223d]/20 relative group">
            <img
              src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80"
              alt="Steamed Ukadiche Modak"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <span className="text-white text-xs font-bold font-mono">Steamed Ukadiche Modak</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. TABLE RESERVATIONS (#reservation)                         */}
      {/* ============================================================ */}
      <section id="reservation" className="w-full bg-[#fbfcfd] px-6 sm:px-12 lg:px-20 py-20 border-b-2 border-[#0f223d]">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border-2 border-[#0f223d] p-6 sm:p-10 shadow-2xl">

          <div className="text-center space-y-2 mb-8">
            <span className="text-xs font-mono font-bold text-[#dc2626] tracking-[0.25em] uppercase block">
              DINE-IN RESERVATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0c1f38] uppercase tracking-tight">
              Reserve Your Table
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
              Plan your visit ahead. We reserve select tables for family dining, terrace breeze seating, and private groups.
            </p>
          </div>

          {bookingSuccessData ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-black text-[#0c1f38]">
                Table Reservation Confirmed!
              </h3>
              <p className="text-sm text-neutral-600 max-w-md mx-auto">
                Thank you, <strong>{bookingSuccessData.customerName}</strong>! Your table request <strong>#{bookingSuccessData.id}</strong> for <strong>{bookingSuccessData.guestCount} guests</strong> on <strong>{bookingSuccessData.reservationDate} at {bookingSuccessData.timeSlot}</strong> has been received.
              </p>
              <button
                type="button"
                onClick={() => setBookingSuccessData(null)}
                className="px-6 py-2.5 rounded-full bg-[#0c1f38] text-white font-bold text-xs uppercase tracking-widest cursor-pointer"
              >
                Book Another Table
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-neutral-700 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditya Suryawanshi"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] focus:ring-1 focus:ring-[#0c1f38] bg-neutral-50 text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] focus:ring-1 focus:ring-[#0c1f38] bg-neutral-50 text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
                <div>
                  <label className="block text-neutral-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 uppercase mb-1">Time Slot *</label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900 font-mono"
                  >
                    <option value="12:00">12:00 PM (Lunch)</option>
                    <option value="13:00">01:00 PM (Lunch)</option>
                    <option value="14:00">02:00 PM (Lunch)</option>
                    <option value="19:00">07:00 PM (Dinner)</option>
                    <option value="19:30">07:30 PM (Dinner)</option>
                    <option value="20:00">08:00 PM (Dinner)</option>
                    <option value="20:30">08:30 PM (Dinner)</option>
                    <option value="21:00">09:00 PM (Dinner)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-neutral-700 uppercase mb-1">Guests *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div className="text-xs font-bold">
                <label className="block text-neutral-700 uppercase mb-1">Seating Area</label>
                <select
                  value={seatingPref}
                  onChange={(e) => setSeatingPref(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900"
                >
                  <option value="Main Coastal Dining Hall">Main Coastal Dining Hall</option>
                  <option value="Sea Breeze Terrace">Sea Breeze Open Terrace</option>
                  <option value="Private Family Lounge">Private Family Lounge</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#0c1f38] hover:bg-[#16335a] text-white font-black text-xs sm:text-sm uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg"
                >
                  Confirm Table Booking
                </button>
              </div>
            </form>
          )}

        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SYSTEM STATIONS FOOTER                                    */}
      {/* ============================================================ */}
      <footer className="w-full bg-[#0c1f38] text-white border-t-2 border-[#0f223d] py-12 px-6 sm:px-12 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white font-bold">
              KK
            </div>
            <div>
              <span className="font-black tracking-widest uppercase block text-sm">
                HOTEL KOKAN KINARA
              </span>
              <span className="text-[10px] text-neutral-400 font-semibold tracking-wider block">
                AUTHENTIC COASTAL DINING & HOSPITALITY
              </span>
            </div>
          </div>

          {/* Quick links to departments */}
          <div className="flex items-center gap-6 text-neutral-300 flex-wrap justify-center">
            <button onClick={onGetStarted} className="hover:text-white transition-colors cursor-pointer">
              Online Ordering
            </button>
            <button onClick={onOpenDineIn} className="hover:text-white transition-colors cursor-pointer text-[#dc2626]">
              Table Dine-In (QR)
            </button>
            <button onClick={() => scrollToSection('reservation')} className="hover:text-white transition-colors cursor-pointer">
              Reservations
            </button>
            <button onClick={() => setIsStaffModalOpen(true)} className="text-[#38bdf8] hover:underline cursor-pointer">
              Staff Stations
            </button>
          </div>

          <div className="text-[11px] text-neutral-400">
            © {new Date().getFullYear()} Kokan Kinara. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 7. STAFF STATIONS QUICK MODAL                                */}
      {/* ============================================================ */}
      {isStaffModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsStaffModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0c1f38] text-white rounded-3xl p-6 sm:p-8 border-2 border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#dc2626] uppercase block">
                  Staff Control Center
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  Operational Stations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              {[
                { role: 'waiter', label: 'Floor Waiter Station', desc: 'Seat guests, view table QR codes, deliver ready food', icon: Sparkles, color: 'text-amber-400' },
                { role: 'kitchen', label: 'Chef KDS Rail', desc: 'Live kitchen orders queue & ticket cooking pass', icon: ChefHat, color: 'text-rose-400' },
                { role: 'cashier', label: 'Cashier POS Desk', desc: 'Consolidated bills, UPI/Cash, tax receipts', icon: CreditCard, color: 'text-blue-400' },
                { role: 'manager', label: 'General Manager', desc: 'Tables, sessions, menu stock, staff onboarding', icon: Crown, color: 'text-purple-400' },
                { role: 'admin', label: 'Admin Analytics', desc: 'Real business intelligence, revenue split, dish trends', icon: ShieldCheck, color: 'text-emerald-400' }
              ].map(st => {
                const Icon = st.icon;
                return (
                  <button
                    key={st.role}
                    type="button"
                    onClick={() => {
                      setIsStaffModalOpen(false);
                      onSelectRole(st.role);
                    }}
                    className="w-full p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-left flex items-center justify-between group transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                        <Icon size={20} className={st.color} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-[#dc2626] transition-colors">
                          {st.label}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {st.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-neutral-500 group-hover:text-white transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. INTERACTIVE TABLE BOOKING MODAL                           */}
      {/* ============================================================ */}
      {isBookingModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={handleCloseBookingModal}
        >
          <div
            className="w-full max-w-lg bg-white text-[#0c1f38] rounded-3xl p-6 sm:p-8 border-2 border-[#0c1f38] shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleCloseBookingModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>

            {bookingSuccessData ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black text-[#0c1f38]">
                  Table Reservation Confirmed
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{bookingSuccessData.customerName}</strong>! Your table request <strong>#{bookingSuccessData.id}</strong> for <strong>{bookingSuccessData.guestCount} guests</strong> on <strong>{bookingSuccessData.reservationDate} at {bookingSuccessData.timeSlot}</strong> has been received by Kokan Kinara.
                </p>
                <button
                  type="button"
                  onClick={handleCloseBookingModal}
                  className="px-6 py-2.5 rounded-full bg-[#0c1f38] text-white font-bold text-xs uppercase tracking-widest cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="border-b border-neutral-200 pb-3">
                  <span className="text-[10px] font-mono tracking-widest text-[#dc2626] uppercase block font-bold">
                    Kokan Kinara Dining Room
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0c1f38] uppercase">
                    Book Your Table
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Reserve a table in advance for lunch or dinner.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
                  <div>
                    <label className="block text-neutral-700 uppercase mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aditya Suryawanshi"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 uppercase mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
                  <div>
                    <label className="block text-neutral-700 uppercase mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-700 uppercase mb-1">Time Slot *</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900 font-mono"
                    >
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="19:00">07:00 PM</option>
                      <option value="19:30">07:30 PM</option>
                      <option value="20:00">08:00 PM</option>
                      <option value="20:30">08:30 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-700 uppercase mb-1">Guests *</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      required
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900 font-mono"
                    />
                  </div>
                </div>

                <div className="text-xs font-bold">
                  <label className="block text-neutral-700 uppercase mb-1">Seating Area</label>
                  <select
                    value={seatingPref}
                    onChange={(e) => setSeatingPref(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-[#0c1f38] bg-neutral-50 text-neutral-900"
                  >
                    <option value="Main Coastal Dining Hall">Main Coastal Dining Hall</option>
                    <option value="Sea Breeze Terrace">Sea Breeze Terrace</option>
                    <option value="Private Family Lounge">Private Family Lounge</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-[#0c1f38] hover:bg-[#16335a] text-white font-black text-xs uppercase tracking-[0.2em] transition-all cursor-pointer shadow-lg"
                  >
                    Confirm Table Booking
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
