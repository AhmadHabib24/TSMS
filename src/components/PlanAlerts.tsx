'use client';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePlanStore } from '@/store/usePlanStore';

export default function PlanAlerts() {
  const { planDetails } = usePlanStore();

  useEffect(() => {
    if (!planDetails || !planDetails.expires_at) return;

    const expiresAt = new Date(planDetails.expires_at).getTime();
    const now = new Date().getTime();
    const daysRemaining = (expiresAt - now) / (1000 * 3600 * 24);

    if (daysRemaining <= 0) return; // Handled by backend/sidebar lock

    const lastAlertKey = 'tsms_last_plan_alert';
    const lastAlertStr = localStorage.getItem(lastAlertKey);
    const lastAlertTime = lastAlertStr ? parseInt(lastAlertStr) : 0;
    const hoursSinceLastAlert = (now - lastAlertTime) / (1000 * 3600);

    const showAlert = (msg: string) => {
      toast(msg, {
        icon: '⚠️',
        duration: 8000,
        style: {
          border: '1px solid #eab308',
          padding: '16px',
          color: '#ca8a04',
          background: '#fefce8'
        }
      });
      localStorage.setItem(lastAlertKey, now.toString());
    };

    if (daysRemaining <= 7 && daysRemaining > 2) {
      // Daily alert (24 hours)
      if (hoursSinceLastAlert >= 24) {
        showAlert(`Your plan will expire in ${Math.ceil(daysRemaining)} days. Please renew soon!`);
      }
    } else if (daysRemaining <= 30 && daysRemaining > 7) {
      // Every 5 days alert (120 hours)
      if (hoursSinceLastAlert >= 120) {
        showAlert(`Notice: Your plan expires in ${Math.ceil(daysRemaining)} days.`);
      }
    }

  }, [planDetails]);

  return null;
}
