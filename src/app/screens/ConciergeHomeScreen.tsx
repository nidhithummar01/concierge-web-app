import { useNavigate } from 'react-router-dom';
import { GlassCard, GoldButton } from '../components/GlassCard';
import { Car, Wallet, TrendingUp, History, User, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';

export const ConciergeHomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useApp();

  return (
    <div className="min-h-screen p-4 bg-black">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-2xl text-white font-bold">{user?.name}</h1>
            <p className="text-base text-gray-400 font-medium">{user?.hotelName || 'Luxury Concierge'}</p>
          </div>
          <motion.button 
            onClick={() => navigate('/profile')} 
            className="p-3 rounded-full bg-black/60 border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-200"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <User className="w-6 h-6 text-[#D4AF37]" />
          </motion.button>
        </motion.div>

        {/* Primary CTA - Streamlined for single action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard className="p-8 text-center border-[#D4AF37]/40 shadow-2xl shadow-[#D4AF37]/10">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Car className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl mb-4 text-white font-bold">Request Guest Transport</h2>
            <div className="space-y-3 w-full max-w-md mx-auto">
              <GoldButton 
                onClick={() => navigate('/guest-details', { state: { bookingMode: 'instant', pickupLocation: user?.hotelName || "The Grand Majestic Hotel" } })} 
                className="w-full text-xl py-5 rounded-2xl"
                icon={<Car className="w-5 h-5" />}
              >
                Call a Car
              </GoldButton>
              <GoldButton 
                onClick={() => navigate('/schedule-booking')} 
                className="w-full text-xl py-5 rounded-2xl"
                variant="secondary"
                icon={<Calendar className="w-5 h-5" />}
              >
                <div className="text-center">
                  <p className="text-xl font-bold">Reserve a Ride</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Schedule Reservation</p>
                </div>
              </GoldButton>
            </div>
            <p className="mt-4 text-sm text-gray-500 font-medium italic">
              Tracking link will be sent automatically to the guest
            </p>
          </GlassCard>
        </motion.div>

        {/* Stats Grid - Focused on Performance */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Wallet, label: "Today's Earnings", value: "$142.50", delay: 0.3 },
            { icon: Car, label: "Rides Today", value: "12", delay: 0.35 },
            { icon: TrendingUp, label: "Weekly Growth", value: "+15%", delay: 0.45 },
            { icon: History, label: "Recent Payout", value: "$856", delay: 0.4 },
          ].map(({ icon: Icon, label, value, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay }}
              whileHover={{ y: -5 }}
            >
              <GlassCard className="p-4 hover:border-[#D4AF37]/40 transition-colors duration-200">
                <Icon className="w-8 h-8 text-[#D4AF37] mb-3" />
                <p className="text-sm text-gray-400 font-medium">{label}</p>
                <p className="text-xl text-white font-bold mt-1">{value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Preserved Secondary Actions */}
        <motion.div 
          className="grid grid-cols-1 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <GoldButton 
            variant="ghost" 
            onClick={() => navigate('/history')} 
            className="p-4 justify-center text-lg border-[#D4AF37]/20"
            icon={<History className="w-6 h-6" />}
          >
            Ride History
          </GoldButton>
            <GoldButton 
            variant="ghost" 
            onClick={() => navigate('/wallet')} 
            className="p-4 justify-center text-lg border-[#D4AF37]/20"
            icon={<Wallet className="w-6 h-6" />}
          >
            Commission Wallet
          </GoldButton>
        </motion.div>
      </div>
    </div>
  );
};