import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Car, Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { GlassCard, GoldButton } from '../components/GlassCard';

const GOLD = '#D4AF37';

/**
 * This page lives at /ride?token=xxx&pickup=yyy
 * When the passenger taps the link from SMS:
 *  - If the app is installed → Universal Link / App Link opens the app directly (OS handles it)
 *  - If the OS doesn't intercept (browser opens this page) → we try the custom scheme,
 *    then fall back to App Store / Play Store after 2s
 */
export const RideDeepLinkScreen = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const pickup = searchParams.get('pickup') || '';

  const [status, setStatus] = useState<'trying' | 'fallback'>('trying');

  // Build the custom scheme deep link
  const customSchemeUrl = `tuxedopassenger://track-ride?token=${encodeURIComponent(token)}&pickup=${encodeURIComponent(pickup)}`;

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  const appStoreUrl = 'https://apps.apple.com/app/id000000000'; // replace with real App Store ID
  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.tuxedo.passenger';

  useEffect(() => {
    if (!token) return;

    // Try to open the app via custom scheme
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = customSchemeUrl;
    document.body.appendChild(iframe);

    // If app didn't open after 2.5s, show fallback UI
    const timer = setTimeout(() => {
      setStatus('fallback');
      document.body.removeChild(iframe);
    }, 2500);

    // If user comes back to the tab, app didn't open
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        setStatus('fallback');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    };
  }, [token, customSchemeUrl]);

  const handleOpenApp = () => {
    window.location.href = customSchemeUrl;
    setTimeout(() => {
      if (isIOS) window.location.href = appStoreUrl;
      else if (isAndroid) window.location.href = playStoreUrl;
    }, 2000);
  };

  const handleDownload = () => {
    if (isIOS) window.location.href = appStoreUrl;
    else if (isAndroid) window.location.href = playStoreUrl;
    else window.open(appStoreUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo / Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-4">
            <Car className="w-10 h-10 text-[#D4AF37]" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">
            Tuxedo Concierge
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Your chauffeur is ready</p>
        </motion.div>

        {/* Pickup info if available */}
        {pickup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-4 border-[#D4AF37]/20">
              <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-widest mb-1">
                Pickup Location
              </p>
              <p className="text-white font-bold">{decodeURIComponent(pickup)}</p>
              <p className="text-gray-500 text-[10px] uppercase mt-1">Set by Concierge</p>
            </GlassCard>
          </motion.div>
        )}

        {/* Main action card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 border-[#D4AF37]/20">
            {status === 'trying' ? (
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto"
                />
                <p className="text-white font-bold">Opening Tuxedo Passenger app...</p>
                <p className="text-gray-500 text-sm">If the app doesn't open, tap below</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-2">
                  <Smartphone className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
                  <h2 className="text-lg font-black text-white uppercase italic">
                    Open in App
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Get the full experience with the Tuxedo Passenger app
                  </p>
                </div>

                <GoldButton
                  onClick={handleOpenApp}
                  className="w-full py-4 font-black uppercase text-sm"
                >
                  Open Tuxedo Passenger App
                </GoldButton>

                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-gray-600 text-xs font-bold uppercase">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-white/10 text-gray-400 hover:border-[#D4AF37]/30 hover:text-white transition-all text-sm font-bold uppercase"
                >
                  <Download className="w-4 h-4" />
                  Download the App
                </button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <p className="text-center text-gray-600 text-[10px] uppercase font-bold tracking-widest">
          Powered by Tuxedo Concierge
        </p>
      </div>
    </div>
  );
};
