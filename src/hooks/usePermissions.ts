import { useAuthStore } from '@/store/useAuthStore';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const can = (module: string, action: 'view' | 'add' | 'edit' | 'delete'): boolean => {
    // If not logged in, no permissions
    if (!user || !user.role) return false;

    // Admin can do everything
    if (user.role.name === 'Admin') return true;

    // Check specific permission
    const permissions = user.role.permissions || {};
    if (!permissions[module]) return false;

    return permissions[module].includes(action);
  };
  const hasFeature = (featureName: string): boolean => {
    const { planDetails } = require('@/store/usePlanStore').usePlanStore.getState();
    if (!planDetails || !planDetails.features) return true; // Default allow if no plan info
    return !!planDetails.features[featureName];
  };

  const isPlanExpired = (): boolean => {
    const { planDetails } = require('@/store/usePlanStore').usePlanStore.getState();
    if (!planDetails || !planDetails.expires_at) return false; // Default false if no expiry set
    return new Date(planDetails.expires_at) < new Date();
  };

  const hasAddon = (addonIdentifier: string): boolean => {
    const { planDetails } = require('@/store/usePlanStore').usePlanStore.getState();
    if (!planDetails || !planDetails.active_addons) return false;
    return planDetails.active_addons.includes(addonIdentifier);
  };

  return { can, user, hasFeature, hasAddon, isPlanExpired };
};
