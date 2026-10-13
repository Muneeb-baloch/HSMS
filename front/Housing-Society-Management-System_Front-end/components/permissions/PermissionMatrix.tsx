'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { customToast } from '@/lib/utils/customToast';
import { Shield, Save, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import { apiClient } from '@/lib/API/client';

interface ModulePermission {
  moduleCode: string;
  moduleName: string;
  moduleId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canImport: boolean;
  canApprove: boolean;
  canVerify: boolean;
}

interface Role {
  _id: string;
  roleName: string;
  roleCode: string;
  isSystem: boolean;
  priority: number;
}

interface SrModule {
  _id: string;
  moduleName: string;
  moduleCode: string;
  displayOrder: number;
  isActive: boolean;
}

const ACTIONS = [
  { key: 'canRead', label: 'Read', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
  { key: 'canCreate', label: 'Create', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
  { key: 'canUpdate', label: 'Update', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
  { key: 'canDelete', label: 'Delete', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
  { key: 'canExport', label: 'Export', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' },
  { key: 'canImport', label: 'Import', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' },
  { key: 'canApprove', label: 'Approve', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' },
  { key: 'canVerify', label: 'Verify', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300' },
] as const;

type ActionKey = typeof ACTIONS[number]['key'];

export default function PermissionMatrix() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<SrModule[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [permissions, setPermissions] = useState<ModulePermission[]>([]);
  const [originalPermissions, setOriginalPermissions] = useState<ModulePermission[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const response = await apiClient.get<Role[]>('/userrole/active');
        if (response.data?.data) {
          const rolesData = Array.isArray(response.data.data)
            ? response.data.data
            : (response.data.data as { items?: Role[] }).items || [];
          setRoles(rolesData);
        }
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        customToast.error('Failed to load roles');
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setIsLoadingModules(true);
        const response = await apiClient.get<SrModule[]>('/module');
        if (response.data?.data) {
          const modulesData = Array.isArray(response.data.data)
            ? response.data.data
            : (response.data.data as { items?: SrModule[] }).items || [];
          setModules(
            modulesData
              .filter((m: SrModule) => m.isActive)
              .sort((a: SrModule, b: SrModule) => a.displayOrder - b.displayOrder)
          );
        }
      } catch (error) {
        console.error('Failed to fetch modules:', error);
        customToast.error('Failed to load modules');
      } finally {
        setIsLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  // Fetch permissions for selected role
  const fetchPermissions = useCallback(async (roleId: string) => {
    if (!roleId || modules.length === 0) return;
    try {
      setIsLoadingPermissions(true);
      const response = await apiClient.get<{ permissionsMap?: Record<string, unknown> }>(
        `/permission/role/${roleId}/map`
      );
      const permMap = response.data?.data?.permissionsMap || response.data?.data || {};

      // Build permission rows for each module
      const perms: ModulePermission[] = modules.map((mod) => {
        const existing = (permMap as Record<string, Record<string, unknown>>)[mod.moduleCode];
        return {
          moduleCode: mod.moduleCode,
          moduleName: mod.moduleName,
          moduleId: mod._id,
          canRead: !!(existing?.canRead),
          canCreate: !!(existing?.canCreate),
          canUpdate: !!(existing?.canUpdate),
          canDelete: !!(existing?.canDelete),
          canExport: !!(existing?.canExport),
          canImport: !!(existing?.canImport),
          canApprove: !!(existing?.canApprove),
          canVerify: !!(existing?.canVerify),
        };
      });

      setPermissions(perms);
      setOriginalPermissions(JSON.parse(JSON.stringify(perms)));
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      customToast.error('Failed to load permissions for this role');
      // Initialize empty permissions for all modules
      const emptyPerms: ModulePermission[] = modules.map((mod) => ({
        moduleCode: mod.moduleCode,
        moduleName: mod.moduleName,
        moduleId: mod._id,
        canRead: false, canCreate: false, canUpdate: false, canDelete: false,
        canExport: false, canImport: false, canApprove: false, canVerify: false,
      }));
      setPermissions(emptyPerms);
      setOriginalPermissions(JSON.parse(JSON.stringify(emptyPerms)));
    } finally {
      setIsLoadingPermissions(false);
    }
  }, [modules]);

  useEffect(() => {
    if (selectedRoleId) {
      fetchPermissions(selectedRoleId);
    }
  }, [selectedRoleId, fetchPermissions]);

  // Toggle a single permission
  const togglePermission = (moduleIndex: number, action: ActionKey) => {
    setPermissions((prev) => {
      const updated = [...prev];
      updated[moduleIndex] = {
        ...updated[moduleIndex],
        [action]: !updated[moduleIndex][action],
      };
      return updated;
    });
  };

  // Toggle entire row (all actions for a module)
  const toggleRow = (moduleIndex: number) => {
    setPermissions((prev) => {
      const updated = [...prev];
      const row = updated[moduleIndex];
      const allChecked = ACTIONS.every((a) => row[a.key]);
      const newValue = !allChecked;
      updated[moduleIndex] = {
        ...row,
        canRead: newValue, canCreate: newValue, canUpdate: newValue, canDelete: newValue,
        canExport: newValue, canImport: newValue, canApprove: newValue, canVerify: newValue,
      };
      return updated;
    });
  };

  // Toggle entire column (one action for all modules)
  const toggleColumn = (action: ActionKey) => {
    setPermissions((prev) => {
      const allChecked = prev.every((p) => p[action]);
      const newValue = !allChecked;
      return prev.map((p) => ({ ...p, [action]: newValue }));
    });
  };

  // Check if a permission was changed
  const isChanged = (moduleIndex: number, action: ActionKey): boolean => {
    if (!originalPermissions[moduleIndex]) return false;
    return permissions[moduleIndex]?.[action] !== originalPermissions[moduleIndex]?.[action];
  };

  // Count changes
  const changeCount = permissions.reduce((count, perm, idx) => {
    return count + ACTIONS.filter((a) => isChanged(idx, a.key)).length;
  }, 0);

  // Save permissions
  const handleSave = async () => {
    if (!selectedRoleId) return;

    try {
      setIsSaving(true);

      // Build set-permissions calls for each module that has changes
      const promises = permissions
        .filter((perm, idx) => ACTIONS.some((a) => isChanged(idx, a.key)))
        .map((perm) =>
          apiClient.post('/permission/set', {
            srModuleId: perm.moduleId,
            roleId: selectedRoleId,
            permissions: {
              canRead: perm.canRead,
              canCreate: perm.canCreate,
              canUpdate: perm.canUpdate,
              canDelete: perm.canDelete,
              canExport: perm.canExport,
              canImport: perm.canImport,
              canApprove: perm.canApprove,
              canVerify: perm.canVerify,
            },
          })
        );

      await Promise.all(promises);
      customToast.success(`Permissions updated successfully (${promises.length} modules)`);
      setOriginalPermissions(JSON.parse(JSON.stringify(permissions)));
    } catch (error) {
      console.error('Failed to save permissions:', error);
      customToast.error('Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to original
  const handleReset = () => {
    setPermissions(JSON.parse(JSON.stringify(originalPermissions)));
  };

  // Get access level badge for a row
  const getAccessBadge = (perm: ModulePermission) => {
    const count = ACTIONS.filter((a) => perm[a.key]).length;
    if (count === 0) return <Badge variant="destructive">No Access</Badge>;
    if (count === 8) return <Badge className="bg-green-600 hover:bg-green-700 text-white">Full Access</Badge>;
    if (count >= 5) return <Badge className="bg-blue-600 hover:bg-blue-700 text-white">High Access</Badge>;
    if (count >= 2) return <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white">Limited</Badge>;
    return <Badge variant="secondary">View Only</Badge>;
  };

  const selectedRole = roles.find((r) => r._id === selectedRoleId);
  const isLoading = isLoadingRoles || isLoadingModules;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl">Permission Matrix</CardTitle>
              <CardDescription>
                Manage role-based access control for all modules
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a role..." />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    <span className="flex items-center gap-2">
                      {role.roleName}
                      {role.isSystem && (
                        <Badge variant="outline" className="text-xs ml-1">System</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedRoleId ? (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Select a role to manage permissions</p>
            <p className="text-sm mt-1">Choose a role from the dropdown above to view and edit its module permissions.</p>
          </div>
        ) : isLoadingPermissions ? (
          <div className="text-center py-12 text-muted-foreground">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin opacity-50" />
            <p>Loading permissions...</p>
          </div>
        ) : (
          <>
            {/* Role info banner */}
            {selectedRole && (
              <div className="mb-4 p-3 rounded-lg bg-muted/50 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{selectedRole.roleName}</span>
                  <Badge variant="outline">{selectedRole.roleCode}</Badge>
                  <Badge variant="secondary">Priority: {selectedRole.priority}</Badge>
                </div>
                {changeCount > 0 && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                    {changeCount} unsaved change{changeCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            )}

            {/* Permission table */}
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="text-left p-3 font-semibold min-w-[200px]">Module</th>
                    {ACTIONS.map((action) => (
                      <th key={action.key} className="p-3 text-center min-w-[80px]">
                        <button
                          onClick={() => toggleColumn(action.key)}
                          className="flex flex-col items-center gap-1 w-full hover:opacity-80 transition-opacity"
                          title={`Toggle all ${action.label}`}
                        >
                          <Badge className={`text-xs ${action.color} border-0`}>{action.label}</Badge>
                          {permissions.every((p) => p[action.key]) ? (
                            <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                      </th>
                    ))}
                    <th className="p-3 text-center min-w-[100px]">
                      <span className="text-xs font-semibold text-muted-foreground">Access Level</span>
                    </th>
                    <th className="p-3 text-center min-w-[60px]">
                      <span className="text-xs font-semibold text-muted-foreground">All</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((perm, moduleIndex) => (
                    <tr
                      key={perm.moduleCode}
                      className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{perm.moduleName}</span>
                          <span className="text-xs text-muted-foreground">({perm.moduleCode})</span>
                        </div>
                      </td>
                      {ACTIONS.map((action) => {
                        const changed = isChanged(moduleIndex, action.key);
                        return (
                          <td key={action.key} className="p-3 text-center">
                            <div className={`flex justify-center ${changed ? 'ring-2 ring-orange-400 rounded-sm' : ''}`}>
                              <Checkbox
                                checked={perm[action.key]}
                                onCheckedChange={() => togglePermission(moduleIndex, action.key)}
                                className="data-[state=checked]:bg-primary"
                              />
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-3 text-center">
                        {getAccessBadge(perm)}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRow(moduleIndex)}
                          className="h-7 w-7 p-0"
                          title={`Toggle all permissions for ${perm.moduleName}`}
                        >
                          {ACTIONS.every((a) => perm[a.key]) ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                {permissions.length} module{permissions.length !== 1 ? 's' : ''} configured
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={changeCount === 0 || isSaving}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={changeCount === 0 || isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : `Save Changes${changeCount > 0 ? ` (${changeCount})` : ''}`}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
