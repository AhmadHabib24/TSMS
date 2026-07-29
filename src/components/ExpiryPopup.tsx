'use client';
import { useEffect, useState } from 'react';
import { AlertOctagon, Clock, X } from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';

export default function ExpiryPopup() {
  const { planDetails } = usePlanStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    if (!planDetails?.expires_at) return;

    const difference = +new Date(planDetails.expires_at) - +new Date();
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    setDaysLeft(days);
    
    if (difference <= 0) {
      setIsExpired(true);
      setIsOpen(true);
      return;
    }

    if (days < 7) {
      // Show warning if less than 7 days left, but only once per day
      const lastShown = localStorage.getItem('expiryWarningLastShown');
      const today = new Date().toDateString();
      
      if (lastShown !== today) {
        setIsOpen(true);
        localStorage.setItem('expiryWarningLastShown', today);
      }
    }
  }, [planDetails?.expires_at]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[var(--color-panel)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden m-4 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className={`p-6 ${isExpired ? 'bg-red-500/10' : 'bg-orange-500/10'} border-b border-[var(--color-border)] flex flex-col items-center justify-center text-center relative`}>
          <button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isExpired ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
            {isExpired ? <AlertOctagon size={32} /> : <Clock size={32} />}
          </div>
          
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">
            {isExpired ? 'Software Expired' : 'Renewal Reminder'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {isExpired 
              ? 'Your software plan has expired. Please renew your plan to continue using the features.'
              : `Your software plan is expiring in ${daysLeft} days. Please renew your plan to continue using all features without interruption.`
            }
          </p>

          <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border)] flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Expiry Date</span>
            <span className="text-lg font-bold text-[var(--color-gold)]">
              {new Date(planDetails.expires_at).toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-background)]">
          <button 
            onClick={() => setIsOpen(false)}
            className="w-full bg-[var(--color-gold)] text-black font-bold py-3 rounded-xl hover:bg-[var(--color-gold)]/90 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
