# Permission Management Frontend

Complete Next.js frontend for managing user permissions across roles and modules.

## 📋 Features

- **Permission CRUD Operations**: Create, read, update, and delete permissions
- **Role-Based Access Control**: Manage permissions per role and module combination
- **Advanced Filtering**: Search, filter, and paginate through permissions
- **Bulk Operations**: Update multiple permissions at once, copy permissions between roles
- **Analytics Dashboard**: View statistics and insights about permissions
- **Permission Validation**: Ensure at least one permission is always granted
- **Real-time Status**: Toggle permission active/inactive status
- **Comprehensive UI**: Fully responsive design with proper error handling

## 🏗️ Project Structure

```
lib/
├── API/
│   └── permissions.ts          # API client for all endpoints
├── types/
│   └── permissions.ts          # TypeScript interfaces and types
└── utils/
    └── permissionUtils.ts      # Utility functions for permission handling

hooks/
└── usePermissions.ts           # Custom React hooks for permission management

components/
├── permissions/
│   ├── PermissionForm.tsx      # Form for creating/updating permissions
│   ├── PermissionsTable.tsx    # Table displaying permissions
│   ├── PermissionStatistics.tsx # Analytics charts and statistics
│   ├── RolePermissionsSummary.tsx # Role-specific permission summary
│   ├── PermissionStatsCards.tsx # Quick stats cards
│   └── index.ts                # Component exports

app/(protected)/permissions/
├── page.tsx                    # Main permissions list page
├── create/
│   └── page.tsx               # Create permission page
├── [id]/
│   └── page.tsx               # Edit permission page
└── analytics/
    └── page.tsx               # Analytics dashboard page
```

## 🚀 Getting Started

### Installation

1. All files are already created and integrated with your Next.js project
2. Ensure dependencies are installed:

```bash
pnpm install
```

### Running the Application

```bash
pnpm run dev
```

Navigate to `http://localhost:3000/permissions` to access the permission management interface.

## 📚 API Integration

### Available API Methods

The `permissionApi` object provides the following methods:

```typescript
// CRUD Operations
await permissionApi.createPermission(data);
await permissionApi.getPermissions(params);
await permissionApi.getPermissionById(id);
await permissionApi.updatePermission(id, data);
await permissionApi.deletePermission(id);

// Permission Management
await permissionApi.setPermissions(data);
await permissionApi.checkPermission(data);
await permissionApi.togglePermissionStatus(id);

// Bulk Operations
await permissionApi.bulkUpdatePermissions(data);
await permissionApi.copyPermissions(data);
await permissionApi.initializeDefaultPermissions();

// Analytics
await permissionApi.getStatistics();
await permissionApi.getPermissionsByRole(roleId);
await permissionApi.getPermissionsByModule(moduleId);
await permissionApi.getRolePermissionsSummary(roleId);
await permissionApi.getModulePermissionsSummary(moduleId);
await permissionApi.getRolePermissionsMap(roleId);
```

## 🎣 Custom Hooks

### usePermission

Fetch a single permission by ID:

```typescript
const { permissions, loading, error, refetch } = usePermission(permissionId);
```

### usePermissionForm

Handle permission form operations:

```typescript
const {
  loading,
  error,
  success,
  createPermission,
  updatePermission,
  deletePermission,
  setPermissions,
  toggleStatus,
} = usePermissionForm();

// Create
const result = await createPermission(data);

// Update
const result = await updatePermission(id, data);

// Delete
const success = await deletePermission(id);

// Toggle Status
const result = await toggleStatus(id);
```

### usePermissionsList

Manage permissions list with pagination:

```typescript
const {
  permissions,
  total,
  page,
  limit,
  pages,
  loading,
  error,
  fetchPermissions,
  nextPage,
  prevPage,
  setPage,
  setLimit,
} = usePermissionsList();

// Fetch with filters
await fetchPermissions({
  page: 1,
  limit: 20,
  search: 'module',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
```

### useBulkPermissions

Handle bulk operations:

```typescript
const { loading, error, success, bulkUpdate, copyPermissions } = useBulkPermissions();

// Bulk update
await bulkUpdate({
  permissionIds: ['id1', 'id2'],
  canRead: true,
  isActive: true,
});

// Copy permissions
await copyPermissions({
  sourceRoleId: 'role1',
  targetRoleId: 'role2',
  overrideExisting: false,
});
```

### usePermissionStatistics

Fetch permission statistics:

```typescript
const { statistics, loading, fetchStatistics } = usePermissionStatistics();

useEffect(() => {
  fetchStatistics();
}, []);
```

### useCheckPermission

Check if a role has specific permission:

```typescript
const { hasPermission, loading, checkPermission } = useCheckPermission(
  roleId,
  moduleId,
  'read'
);
```

## 🔧 Utility Functions

Located in `lib/utils/permissionUtils.ts`:

```typescript
// Get access type
getAccessType(permission); // Returns: 'Full Access' | 'Limited Access' | 'View Only' | 'No Access'

// Get badge color
getAccessTypeBadgeColor(accessType);

// Get permission level text
getPermissionLevel(permission);

// Calculate permission score
getPermissionScore(permission);

// Check specific permission
hasPermission(permission, 'read');

// Get granted permissions list
getGrantedPermissions(permission);

// Format utilities
formatDate(date);
formatModuleName(name);
formatRoleName(name);

// Permission type checks
isFullAccess(permission);
isReadOnly(permission);
isLimitedAccess(permission);

// Filtering and sorting
filterPermissionsByAccessType(permissions, type);
sortPermissionsByAccessLevel(permissions);

// Grouping
groupPermissionsByRole(permissions);
groupPermissionsByModule(permissions);

// Merging
mergePermissions(...permissions);
```

## 🎨 Components

### PermissionForm

Create or update permission:

```tsx
<PermissionForm
  initialData={permission}
  modules={modules}
  roles={roles}
  isUpdate={false}
  onSuccess={(message) => console.log(message)}
  onError={(message) => console.error(message)}
/>
```

### PermissionsTable

Display permissions in a table:

```tsx
<PermissionsTable
  permissions={permissions}
  loading={loading}
  onEdit={(permission) => console.log(permission)}
  onRefresh={() => refetch()}
/>
```

### PermissionStatistics

Show analytics and charts:

```tsx
<PermissionStatistics
  statistics={statistics}
  loading={loading}
/>
```

### RolePermissionsSummaryCard

Display role-specific summary:

```tsx
<RolePermissionsSummaryCard
  summary={summary}
  loading={loading}
/>
```

### PermissionStatsCards

Quick stats overview:

```tsx
<PermissionStatsCards statistics={statistics} />
```

## 📝 Type Definitions

All TypeScript types are defined in `lib/types/permissions.ts`:

- `UserPermission` - Main permission interface
- `CreateUserPermissionDto` - Data for creating permissions
- `UpdateUserPermissionDto` - Data for updating permissions
- `BulkPermissionUpdateDto` - Data for bulk operations
- `SetPermissionsDto` - Data for setting permissions
- `PermissionCheckDto` - Data for permission checks
- `UserPermissionStatistics` - Statistics interface
- And many more...

## 🔒 Error Handling

All hooks and components include error handling:

```typescript
const { loading, error, success, createPermission } = usePermissionForm();

try {
  const result = await createPermission(data);
  if (result) {
    // Success
  }
} catch (err) {
  // Error handled automatically
  console.log(error);
}
```

## 📖 Page Routes

- `/permissions` - Main permissions list
- `/permissions/create` - Create new permission
- `/permissions/[id]` - Edit permission
- `/permissions/analytics` - Analytics dashboard

## 🧪 Example Usage

### Creating a Permission

```tsx
import { PermissionForm } from '@/components/permissions';
import { useToast } from '@/components/context/ToastContext';

export default function CreatePage() {
  const { addToast } = useToast();

  return (
    <PermissionForm
      modules={modules}
      roles={roles}
      onSuccess={(msg) => addToast(msg, 'success')}
      onError={(msg) => addToast(msg, 'error')}
    />
  );
}
```

### Fetching Permissions

```tsx
import { usePermissionsList } from '@/hooks/usePermissions';

export default function ListPage() {
  const {
    permissions,
    loading,
    fetchPermissions,
  } = usePermissionsList();

  useEffect(() => {
    fetchPermissions({ page: 1, limit: 20 });
  }, []);

  return (
    <PermissionsTable
      permissions={permissions}
      loading={loading}
    />
  );
}
```

### Checking Permissions

```tsx
import { useCheckPermission } from '@/hooks/usePermissions';

export default function RoleCheck() {
  const { hasPermission, loading } = useCheckPermission(
    'roleId',
    'moduleId',
    'read'
  );

  if (loading) return <div>Checking...</div>;
  if (!hasPermission) return <div>No access</div>;

  return <div>You have access</div>;
}
```

## ⚠️ Important Notes

1. **Authentication Required**: All permission management pages are protected routes under `(protected)`
2. **API Base URL**: Ensure `NEXT_PUBLIC_API_URL` is set in your `.env.local`
3. **Admin Only**: Most permission operations require ADMIN or SUPER_ADMIN role
4. **Real-time Updates**: Statistics auto-refresh every 30 seconds on analytics page
5. **Validation**: Form validates that at least one permission is always granted

## 🐛 Troubleshooting

### API Connection Issues

```bash
# Check environment variables
echo $NEXT_PUBLIC_API_URL

# Verify backend is running
curl http://localhost:5000/api/permission
```

### Module/Role Loading

Ensure endpoints for fetching modules and roles are configured in the respective API files.

### Permission Errors

Check that:
- User is authenticated
- User has admin role
- Backend is running and accessible
- Network requests are not blocked

## 📦 Dependencies

- Next.js 14+
- React 18+
- TypeScript
- Axios (for API calls)
- Recharts (for analytics)
- Lucide Icons (for UI icons)

## 📄 License

This frontend is part of the HSMS system and follows the same license terms.

## 🤝 Contributing

When adding new features:

1. Add types to `lib/types/permissions.ts`
2. Add API methods to `lib/API/permissions.ts`
3. Create hooks in `hooks/usePermissions.ts` if needed
4. Create components in `components/permissions/`
5. Add pages in `app/(protected)/permissions/`

## 📞 Support

For issues or questions, contact the development team.
