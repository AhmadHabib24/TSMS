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

  return { can, user };
};
