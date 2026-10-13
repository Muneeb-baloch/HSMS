'use client';

import { useAppSelector } from '@/lib/store/hooks';
import { PermissionAction } from '@/lib/types/auth';

/**
 * Hook to check if the current user has a specific module permission.
 * Uses the permissions map stored in Redux (loaded from backend on login).
 * SUPER_ADMIN always returns true.
 *
 * @param moduleCode - The module code (e.g., 'MEM', 'INV', 'ACC')
 * @param action - The permission action (e.g., 'canRead', 'canCreate')
 * @returns boolean - Whether the user has the permission
 *
 * @example
 * const canCreateMember = useModulePermission('MEM', 'canCreate');
 * if (canCreateMember) { showCreateButton(); }
 */
export function useModulePermission(moduleCode: string, action: PermissionAction): boolean {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = useAppSelector((state) => state.auth.permissions);

  // Super admin bypass
  if (user?.role === 'super_admin') return true;

  // Admin fallback if no permissions loaded
  if (user?.role === 'admin' && !permissions) return true;

  if (!permissions || !permissions[moduleCode]) return false;
  return permissions[moduleCode]?.[action] ?? false;
}

/**
 * Hook to get all permissions for a module
 */
export function useModulePermissions(moduleCode: string) {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = useAppSelector((state) => state.auth.permissions);

  if (user?.role === 'super_admin') {
    return {
      canRead: true, canCreate: true, canUpdate: true, canDelete: true,
      canExport: true, canImport: true, canApprove: true, canVerify: true,
    };
  }

  if (!permissions || !permissions[moduleCode]) {
    return {
      canRead: false, canCreate: false, canUpdate: false, canDelete: false,
      canExport: false, canImport: false, canApprove: false, canVerify: false,
    };
  }

  return permissions[moduleCode];
}
