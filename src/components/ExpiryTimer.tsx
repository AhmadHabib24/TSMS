'use client';
import { useEffect, useState } from 'react';
import { Clock, AlertOctagon } from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';

export default function ExpiryTimer() {
  const { planDetails } = usePlanStore();
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!planDetails?.expires_at) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(planDetails.expires_at) - +new Date();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [planDetails?.expires_at]);

  if (!planDetails?.expires_at) return null;

  if (isExpired) {
    return (
      <div className="flex items-center gap-1 sm:gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-[0_0_10px_rgba(239,68,68,0.2)]">
        <AlertOctagon size={16} className="animate-pulse" />
        <span className="hidden sm:inline">Plan Expired</span>
      </div>
    );
  }

  if (!timeLeft) return null;

  const isExpiringSoon = timeLeft.days < 7;

  return (
    <div className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold border transition-colors ${
      isExpiringSoon 
        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]' 
        : 'bg-[var(--color-panel)] border-[var(--color-border)] text-gray-400'
    }`}>
      <Clock size={16} className={isExpiringSoon ? 'animate-pulse text-orange-500' : 'text-[var(--color-gold)]'} />
      <span className="hidden sm:inline font-medium">Expires in: </span>
      <span className="tabular-nums">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </span>
    </div>
  );
}
