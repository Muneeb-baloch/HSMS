# Permission Management Frontend - Quick Start Guide

## ⚡ 5-Minute Setup

### 1. File Structure Confirmation ✓

All files are already created in the correct locations:

- API client: `lib/API/permissions.ts`
- Types: `lib/types/permissions.ts`
- Hooks: `hooks/usePermissions.ts`
- Components: `components/permissions/`
- Pages: `app/(protected)/permissions/`

### 2. Start the Development Server

```bash
cd f:\Projectes\HSMS\hsms_front-end
pnpm run dev
```

### 3. Access the Application

Navigate to: `http://localhost:3000/permissions`

## 🎯 Main Features Available

### Pages

- 📋 **List Page**: `/permissions` - View all permissions
- ➕ **Create Page**: `/permissions/create` - Create new permission
- ✏️ **Edit Page**: `/permissions/[id]` - Edit permission
- 📊 **Analytics**: `/permissions/analytics` - View statistics

### Components

- `PermissionForm` - Create/Edit permissions
- `PermissionsTable` - Display permissions list
- `PermissionStatistics` - Show analytics
- `RolePermissionsSummary` - Role insights
- `PermissionStatsCards` - Quick stats

### Hooks

- `usePermission()` - Single permission
- `usePermissionForm()` - Form operations
- `usePermissionsList()` - List management
- `useBulkPermissions()` - Bulk operations
- `usePermissionStatistics()` - Analytics
- `useCheckPermission()` - Permission checks

## 🔧 Quick Integration

### Add to Navigation

```tsx
// In your navigation component
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

<Link href="/permissions" className="flex items-center gap-2">
  <ShieldCheck className="w-5 h-5" />
  Permissions
</Link>;
```

### Use in Your Pages

```tsx
import { usePermissionsList } from "@/hooks/usePermissions";
import { PermissionsTable } from "@/components/permissions";

export default function MyPage() {
  const { permissions, loading, fetchPermissions } = usePermissionsList();

  useEffect(() => {
    fetchPermissions();
  }, []);

  return <PermissionsTable permissions={permissions} loading={loading} />;
}
```

### Check User Permissions

```tsx
import { useCheckPermission } from "@/hooks/usePermissions";

export default function ProtectedFeature() {
  const { hasPermission } = useCheckPermission(roleId, moduleId, "read");

  if (!hasPermission) return <div>Access Denied</div>;

  return <div>Protected Content</div>;
}
```

## 📝 API Usage Examples

### Fetch Permissions

```typescript
import { usePermissionsList } from "@/hooks/usePermissions";

const { permissions, fetchPermissions } = usePermissionsList();

// Fetch with filters
await fetchPermissions({
  page: 1,
  limit: 20,
  search: "Users",
  roleId: "role123",
  sortBy: "createdAt",
  sortOrder: "desc",
});
```

### Create Permission

```typescript
import { usePermissionForm } from "@/hooks/usePermissions";

const { createPermission } = usePermissionForm();

await createPermission({
  srModuleId: "module123",
  roleId: "role123",
  canRead: true,
  canCreate: true,
  canUpdate: false,
  canDelete: false,
  isActive: true,
});
```

### Bulk Update

```typescript
import { useBulkPermissions } from "@/hooks/usePermissions";

const { bulkUpdate } = useBulkPermissions();

await bulkUpdate({
  permissionIds: ["perm1", "perm2", "perm3"],
  canRead: true,
  isActive: true,
});
```

## 🎨 Component Props Reference

### PermissionForm

```tsx
<PermissionForm
  initialData={permission} // For edit mode
  modules={modules}
  roles={roles}
  isUpdate={false}
  onSuccess={(msg) => console.log(msg)}
  onError={(msg) => console.error(msg)}
/>
```

### PermissionsTable

```tsx
<PermissionsTable
  permissions={permissions}
  loading={false}
  onEdit={(perm) => console.log(perm)}
  onRefresh={() => refetch()}
/>
```

### PermissionStatistics

```tsx
<PermissionStatistics statistics={stats} loading={false} />
```

## ⚙️ Environment Setup

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🚨 Troubleshooting

### Pages not showing

- [ ] Check if path is `/permissions`
- [ ] Verify authentication is working
- [ ] Check browser console for errors

### API errors

- [ ] Verify backend is running on port 5000
- [ ] Check `NEXT_PUBLIC_API_URL` in `.env.local`
- [ ] Verify authentication token

### Components not rendering

- [ ] Check imports are correct
- [ ] Verify all required props are passed
- [ ] Check TypeScript errors in console

## 📊 Data Flow

```
User Action
    ↓
Hook (usePermissionsList, etc.)
    ↓
API Client (permissionApi)
    ↓
Backend Endpoint
    ↓
Response Handling
    ↓
Component Re-render
    ↓
User Sees Result
```

## 🔐 Security

- ✓ All pages protected by authentication
- ✓ Admin role required for modifications
- ✓ Frontend validation before submission
- ✓ Backend validation of all requests
- ✓ Automatic token refresh

## 📈 Performance

- ✓ Pagination (20 items per page)
- ✓ Lazy loading of statistics
- ✓ Optimized re-renders
- ✓ Automatic error recovery

## 🎯 Next Steps

1. **Test the main page**: Visit `/permissions`
2. **Create a permission**: Click "Create Permission"
3. **Edit a permission**: Click edit button in table
4. **View analytics**: Click "Analytics" link
5. **Check permissions**: Use `useCheckPermission` hook

## 📚 Documentation Files

- `PERMISSION_FRONTEND_README.md` - Complete documentation
- `PERMISSION_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- This file - Quick start guide

## 💡 Tips & Tricks

### Quick Permission Check

```tsx
const { hasPermission } = useCheckPermission(roleId, moduleId, "read");
if (hasPermission) {
  /* show feature */
}
```

### Get All Stats

```tsx
const { statistics } = usePermissionStatistics();
console.log(statistics.totalPermissions); // Total count
```

### Format Permissions

```tsx
import { getAccessType, getPermissionLevel } from "@/lib/utils/permissionUtils";

const accessType = getAccessType(permission); // 'Full Access'
const level = getPermissionLevel(permission); // 'Read, Create, Update'
```

### Group Permissions

```tsx
import { groupPermissionsByRole } from "@/lib/utils/permissionUtils";

const grouped = groupPermissionsByRole(permissions);
// { 'Admin': [...], 'User': [...] }
```

## ✨ What's Included

- ✅ Complete API client with all endpoints
- ✅ TypeScript types for all data structures
- ✅ 6 custom React hooks for all operations
- ✅ 5 reusable UI components
- ✅ 4 complete pages (list, create, edit, analytics)
- ✅ 20+ utility functions
- ✅ Full error handling
- ✅ Loading states
- ✅ Success/error notifications
- ✅ Responsive design
- ✅ Comprehensive documentation

## 🚀 Ready to Go!

Everything is set up and ready to use. Start by running:

```bash
pnpm run dev
```

Then navigate to `http://localhost:3000/permissions`

---

**Status**: ✅ Production Ready
**Last Updated**: 2026-01-31
**Version**: 1.0.0
