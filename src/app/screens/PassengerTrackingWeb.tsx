import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { GlassCard, GoldButton } from '../components/GlassCard';
import { 
  MapPin, Clock, Calendar, Car, Navigation, 
  CreditCard, Apple, DollarSign, CheckCircle2, Gift, UserCheck, Lock, Sparkles, 
  User, Crown, Wallet, ArrowRight, ChevronRight, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarUI } from '../components/ui/calendar';
import { format } from 'date-fns';
import type { User as AppUser } from '../types';
import type { Driver } from '../components/DriverCard';

import { calculateFare, calculateCommission } from '../utils/pricing';

type TrackingDriverDisplay = {
  name: string;
  rating: string;
  vehicle: string;
  amenities: string[];
};

function driverToTrackingDisplay(driver: Driver): TrackingDriverDisplay {
  const parts = driver.name.split(' ').filter(Boolean);
  const shortName =
    parts.length >= 2 ? `${parts[0]} ${parts[1].charAt(0)}.` : driver.name;
  const tags: string[] = [];
  if (driver.amenities.wifi) tags.push('WiFi');
  if (driver.amenities.water) tags.push('Refreshments');
  if (driver.amenities.music) tags.push('Premium Audio');
  tags.push(driver.vehicle.interior);
  return {
    name: shortName,
    rating: driver.rating.toFixed(1),
    vehicle: `${driver.vehicle.color} ${driver.vehicle.model}`,
    amenities: tags.slice(0, 4),
  };
}

const DEFAULT_ASSIGNED: TrackingDriverDisplay = {
  name: 'Michael S.',
  rating: '4.9',
  vehicle: 'Black S-Class',
  amenities: ['WiFi', 'Refreshments', 'Leather Interior'],
};

export const PassengerTrackingWeb = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, setActiveRide } = useApp();

  // Read deep link params: pickup pre-filled from concierge link
  const deepLinkPickup = searchParams.get('pickup') || '';
  const deepLinkToken = searchParams.get('token') || '';
  
  const [step, setStep] = useState<'config' | 'schedule' | 'payment' | 'tracking'>('config');
  const [dropOffLocation, setDropOffLocation] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [time, setTime] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [showAppPopup, setShowAppPopup] = useState(false);

  const isMemberFlag = localStorage.getItem('isMember') === 'true';
  const [hasPremiumAmenities, setHasPremiumAmenities] = useState<boolean>(
    isMemberFlag || user?.isMember === true
  );
  const [assignedDriver, setAssignedDriver] = useState<TrackingDriverDisplay>(DEFAULT_ASSIGNED);

  // Requirement: App Download Popup (Non-blocking)
  useEffect(() => {
    const timer = setTimeout(() => setShowAppPopup(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const state = location.state as {
      fromMembershipPurchase?: boolean;
      fromMembershipSkip?: boolean;
      paymentMethod?: string;
      selectedDriver?: Driver;
    } | null;
    if (!state?.fromMembershipPurchase && !state?.fromMembershipSkip) return;

    const selectedPaymentMethod = state.paymentMethod || 'Payment Method';
    const membershipPurchased = Boolean(state.fromMembershipPurchase);
    setPaymentMethod(selectedPaymentMethod);
    setStep('tracking');
    setHasPremiumAmenities(membershipPurchased);
    setShowPromo(membershipPurchased);

    if (membershipPurchased && state.selectedDriver) {
      setAssignedDriver(driverToTrackingDisplay(state.selectedDriver));
    } else {
      setAssignedDriver(DEFAULT_ASSIGNED);
    }

    setActiveRide(prev => ({
      ...(prev || {} as any),
      dropOffLocation,
      paymentMethod: selectedPaymentMethod,
      status: 'tracking',
    }));

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, setActiveRide, dropOffLocation]);

  // Requirement 4.3 & 6.3: Detect Membership Status
  const isMember = isMemberFlag || user?.isMember === true;
  const pickupLocation = deepLinkPickup || user?.hotelName || "The Grand Majestic Hotel";

  const handleBackNavigation = () => {
    if (step === 'tracking') {
      setStep('payment');
      return;
    }

    if (step === 'payment' || step === 'schedule') {
      setStep('config');
      return;
    }

    navigate(-1);
  };
  


  const handleRequestChauffeur = () => {
    // Requirement: Driver movement starts immediately after dropOffLocation is set
    setActiveRide(prev => ({
      ...(prev || {} as any),
      dropOffLocation,
      status: 'tracking',
      driverMoving: true
    }));

    setStep('payment');
  };

  const handlePaymentSelection = (method: string) => {
    setPaymentMethod(method);
    setShowPromo(false);
    
    // Update global state for data flow
    setActiveRide(prev => ({
      ...(prev || {} as any),
      dropOffLocation,
      paymentMethod: method,
      status: 'tracking',
    }));

    navigate('/membership', { state: { fromTrackRide: true, paymentMethod: method } });
  };

  const proceedToTracking = () => {
    // Requirement 8: If payment NOT selected: set paymentMethod = null (explicit)
    setActiveRide(prev => ({
      ...(prev || {} as any),
      dropOffLocation,
      paymentMethod: null,
      status: 'tracking',
    }));
    setShowPromo(false);
    setStep('tracking');
  };

  return (
    <div className="min-h-screen bg-black p-4 font-sans text-white flex flex-col">
      <div className="max-w-md mx-auto w-full space-y-6 pt-8 flex-grow">
        <div className="mb-8">
          <button
            onClick={handleBackNavigation}
            className="mb-4 text-base text-[#D4AF37] hover:text-[#B8962A] flex items-center gap-2 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tight mb-2 uppercase italic">Tuxedo Concierge</h1>
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-bold">
              <Navigation className="w-4 h-4 animate-pulse" />
              {step === 'tracking' ? 'CHAUFFEUR EN ROUTE' : 'RIDE CONFIGURATION'}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: CONFIGURATION */}
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <GlassCard className="p-6 border-[#D4AF37]/20">
                <h2 className="text-xl font-bold mb-4 uppercase italic">Finalize Your Journey</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-[#D4AF37]/10 rounded-xl border-2 border-[#D4AF37]/40">
                    <p className="text-[10px] text-[#D4AF37] uppercase font-black mb-1">Pickup Location</p>
                    <p className="text-base text-white font-bold">{pickupLocation}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase">Set by Concierge</p>
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter Drop-off Location"
                      value={dropOffLocation}
                      onChange={(e) => setDropOffLocation(e.target.value)}
                      className="w-full bg-black/50 border-2 border-[#D4AF37]/30 rounded-xl py-4 pl-12 pr-4 focus:border-[#D4AF37] outline-none font-bold text-white"
                    />
                  </div>

                  <GoldButton onClick={handleRequestChauffeur} className="w-full py-5 text-xl uppercase font-black" disabled={!dropOffLocation}>
                    Request Chauffeur
                  </GoldButton>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 2: SCHEDULING (GATED) */}
          {step === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold mb-2 uppercase italic text-white">Schedule a Ride</h2>
                <p className="text-sm text-gray-400 font-medium mb-8 italic">
                  Choose the date and time for the guest's ride.
                </p>
                <div className="space-y-5 mb-8">
                  {/* Date Picker */}
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-black/60 border-2 border-[#D4AF37]/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] text-white text-base font-medium transition-all duration-200 [color-scheme:dark]"
                    />
                  </div>

                  {/* Time Picker */}
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37] w-5 h-5" />
                    <input 
                      type="time" 
                      value={time}
                      className="w-full bg-black/50 border-2 border-[#D4AF37]/30 rounded-xl py-4 pl-12 pr-4 focus:border-[#D4AF37] outline-none font-bold text-white [color-scheme:dark]" 
                      onChange={(e) => setTime(e.target.value)} 
                    />
                  </div>

                  {/* Schedule summary if filled */}
                  {selectedDate && time && (
                    <motion.div
                      className="p-4 bg-[#D4AF37]/10 rounded-xl border-2 border-[#D4AF37]/40"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-xs text-[#D4AF37] font-black uppercase tracking-widest mb-1">Scheduled Date & Day</p>
                      <p className="text-lg text-white font-bold">
                        {new Date(selectedDate + 'T' + time).toLocaleString('en-US', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </p>
                      <p className="text-sm text-gray-400 font-medium">Time: {new Date(selectedDate + 'T' + time).toLocaleString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}</p>
                    </motion.div>
                  )}
                </div>

                <GoldButton 
                  onClick={() => isMember ? navigate('/driver-list') : navigate('/membership')} 
                  className="w-full py-5 text-xl uppercase font-black" 
                  disabled={!selectedDate || !time}
                  icon={isMember ? <UserCheck className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                >
                  {isMember ? "Select Manual Driver" : "Continue"}
                </GoldButton>
                
                {!isMember && (
                  <p className="text-[10px] text-gray-500 text-center uppercase font-bold tracking-widest mt-4">
                    Manual selection is a <span className="text-[#D4AF37]">Gold Member</span> exclusive
                  </p>
                )}
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 'payment' && (
            <motion.div key="payment" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <GlassCard className="p-6">
                <div className="text-center mb-8">
                  <h2 className="text-xl font-bold uppercase italic tracking-tight">Select Payment Method</h2>
                  <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-widest">Secure Payment Processing</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { name: 'Apple Pay', icon: Apple },
                    { name: 'PayPal', icon: Wallet },
                    { name: 'Credit Card', icon: CreditCard },
                    { name: 'Cash Payment', icon: DollarSign },
                  ].map((method) => {
                    const MethodIcon = method.icon;
                    return (
                      <button 
                        key={method.name} 
                        onClick={() => handlePaymentSelection(method.name)} 
                        className={`flex items-center gap-4 p-4 bg-white/5 border-2 rounded-xl transition-all ${paymentMethod === method.name ? 'border-[#D4AF37] bg-[#D4AF37]/5' : 'border-white/10 hover:border-[#D4AF37]/30'}`}
                      >
                        <MethodIcon className="text-[#D4AF37] w-5 h-5" />
                        <span className="font-bold text-base text-white">{method.name}</span>
                        {paymentMethod === method.name && <CheckCircle2 className="w-5 h-5 text-[#D4AF37] ml-auto" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8">
                  <GoldButton onClick={proceedToTracking} className="w-full py-4 text-base uppercase font-black">
                    Proceed to Tracking
                  </GoldButton>
                  <p className="text-[10px] text-gray-500 text-center mt-4 font-bold uppercase tracking-widest">
                    You can also pay inside the vehicle
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* STEP 4: TRACKING (GATED AMENITIES) */}
          {step === 'tracking' && (
            <motion.div key="tracking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <GlassCard className="p-8 text-center border-green-500/20">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                
                <div className="flex justify-center items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] overflow-hidden bg-gray-900">
                    <User className="w-12 h-12 m-auto mt-4 text-gray-700" />
                  </div>
                  <div className="w-28 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                    <Car className="text-[#D4AF37] opacity-40 w-10 h-10" />
                  </div>
                </div>

                <h2 className="text-2xl font-black mb-1 uppercase italic">{assignedDriver.name}</h2>
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-3 h-3 text-[#D4AF37]" />
                  ))}
                  <span className="text-[10px] text-[#D4AF37] font-black ml-1 uppercase">{assignedDriver.rating} Rating</span>
                </div>

                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/10">
                  <motion.div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#D4AF37]/50 to-[#D4AF37]"
                    initial={{ width: "10%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div 
                    className="absolute top-1/2 -translate-y-1/2 left-[85%]"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Car className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
                  </motion.div>
                </div>

                <p className="text-gray-400 font-medium mb-6 uppercase text-[10px] tracking-widest">
                   Live: Driver is {Math.floor(Math.random() * 2) + 2} mins away in a {assignedDriver.vehicle}
                </p>

                <div className="mb-6 p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-tighter">Premium Amenities</span>
                  </div>
                  
                  {hasPremiumAmenities ? (
                    <div className="flex flex-wrap justify-center gap-2">
                      {assignedDriver.amenities.map(a => (
                        <span key={a} className="text-[10px] font-bold bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1 rounded border border-[#D4AF37]/20">{a}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[9px] font-black text-gray-600 uppercase">Premium amenities locked</p>
                      <button
                        onClick={() =>
                          navigate('/membership', {
                            state: { fromTrackRide: true, paymentMethod },
                          })
                        }
                        className="flex items-center justify-center gap-2 w-full py-2 bg-white/5 rounded-lg border border-dashed border-white/20 group hover:border-[#D4AF37]/40 transition-colors"
                      >
                      <Lock className="w-3 h-3 text-gray-600 group-hover:text-[#D4AF37]" />
                      <span className="text-[9px] font-black text-gray-600 uppercase group-hover:text-[#D4AF37]">Buy Membership</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {showPromo && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 p-4 bg-[#D4AF37]/10 border-2 border-dashed border-[#D4AF37]/40 rounded-xl">
                    <Gift className="w-5 h-5 inline mr-2 text-[#D4AF37]" />
                    <span className="text-[#D4AF37] font-black uppercase text-xs">20% Off Your Next Journey!</span>
                  </motion.div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Requirement: App Download Popup Trigger */}
        <AnimatePresence>
          {showAppPopup && (
            <AppDownloadPopup user={user} onClose={() => setShowAppPopup(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER: MEMBERSHIP GATE & CREDIT DISPLAY */}
      <div className="pb-6 mt-4">
        <div 
          onClick={() => !isMember && navigate('/membership')}
          className="cursor-pointer"
        >
          <GlassCard 
            className={`p-4 flex items-center justify-between transition-all border-2 ${
              isMember ? 'border-[#D4AF37]/40 bg-[#D4AF37]/5' : 'border-white/10 hover:border-[#D4AF37]/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isMember ? 'bg-[#D4AF37]' : 'bg-white/5'}`}>
                <Crown className={`w-5 h-5 ${isMember ? 'text-black' : 'text-gray-500'}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-white uppercase italic tracking-tight">
                  {isMember ? 'Tuxedo Gold Member' : 'Tuxedo Basic Status'}
                </p>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                  {isMember ? (
                    <span className="flex items-center gap-1">
                      <Wallet className="w-2.5 h-2.5" /> ${user?.rideCredit?.toFixed(2)} Ride Credit
                    </span>
                  ) : 'Join for $100 & Get $100 Credit'}
                </p>
              </div>
            </div>
            {!isMember ? (
              <div className="bg-[#D4AF37] text-black p-2 rounded-lg">
                <ArrowRight className="w-4 h-4" />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[8px] font-black text-[#D4AF37] uppercase">
                <CheckCircle2 className="w-3 h-3" /> Active
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

// Requirement: App Download Popup (Real Modal Overlay)
const AppDownloadPopup = ({ user, onClose }: { user: AppUser | null; onClose: () => void }) => {
  const generateCouponCode = () => {
    const token = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TUX100-${token}`;
  };

  const handleDownloadApp = () => {
    const couponData = {
      code: generateCouponCode(),
      amount: 100,
      campaign: 'track-ride-download-popup',
      linkedIdentity: {
        phone: user?.phone || null,
        email: user?.email || null,
      },
      status: 'pending_app_login',
      issuedAt: new Date().toISOString(),
    };

    localStorage.setItem('pendingAppDownloadCoupon', JSON.stringify(couponData));
    window.open('https://apps.apple.com', '_blank');
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm"
      >
        <GlassCard className="p-8 text-center border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/30">
          <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#D4AF37]/30">
            <Sparkles className="w-8 h-8 text-[#D4AF37]" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-6 leading-tight">
            Download our app and get <span className="text-[#D4AF37]">$100 coupon free</span> on your next ride.
          </h3>
          
          <div className="space-y-3">
            <GoldButton 
              onClick={handleDownloadApp} 
              className="w-full py-4 text-base font-black uppercase"
            >
              Download App
            </GoldButton>
            
            <button 
              onClick={onClose}
              className="w-full py-3 text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              Skip for Now
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};