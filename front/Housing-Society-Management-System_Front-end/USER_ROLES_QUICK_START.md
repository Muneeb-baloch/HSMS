# User Role Management - Quick Start Guide

Complete frontend for user role management with Redux Toolkit, similar to the member management system.

## 🚀 Quick Start (5 minutes)

### 1. Access the Application

```bash
# Start the development server
pnpm run dev

# Navigate to user roles
http://localhost:3000/user-roles
```

### 2. File Structure

```
lib/
├── API/userRole.ts                    # API endpoints
├── types/userRole.ts                  # TypeScript types
├── utils/userRoleUtils.ts             # Helper functions
├── hooks/useUserRoles.ts              # Custom hooks
└── store/slices/userRoleSlice.ts      # Redux state

components/user-roles/
├── UserRoleForm.tsx                   # Create/Edit form
├── UserRoleTable.tsx                  # Data table
├── UserRoleFilters.tsx                # Search & filters
├── UserRoleStats.tsx                  # Statistics
└── RoleDistribution.tsx               # Distribution chart

app/(protected)/user-roles/
├── page.tsx                           # List page
├── create/page.tsx                    # Create page
├── [id]/page.tsx                      # View page
├── [id]/edit/page.tsx                 # Edit page
└── analytics/page.tsx                 # Analytics page
```

### 3. Core Components

#### List View (`/user-roles`)

- Table with search, filter, pagination
- Statistics cards
- Role distribution chart
- Bulk action support

#### Create Role (`/user-roles/create`)

- Form with validation
- Help guidelines
- Priority level guidance

#### Edit Role (`/user-roles/[id]/edit`)

- Pre-filled form
- Current details sidebar
- Delete option (if allowed)

#### View Role (`/user-roles/[id]`)

- Complete role details
- Statistics and metadata
- Edit button

#### Analytics (`/user-roles/analytics`)

- Comprehensive statistics
- Role hierarchy visualization
- Distribution by level

### 4. Key Features

✅ **CRUD Operations** - Create, read, update, delete roles
✅ **Search & Filter** - Search by name/code, filter by status/type
✅ **Pagination** - Efficient data loading (10, 20, 50 per page)
✅ **Bulk Operations** - Update multiple roles at once
✅ **Statistics** - View usage and distribution
✅ **Role Hierarchy** - Visual 6-level hierarchy (System → Basic)
✅ **System Role Protection** - Prevent system role deletion
✅ **User Tracking** - See how many users per role
✅ **Type Safety** - Full TypeScript support
✅ **Responsive Design** - Mobile, tablet, desktop

### 5. Using the Hooks

```typescript
// List roles
const { roles, filters, fetchRoles, updateFilters } = useUserRoles();

useEffect(() => {
  fetchRoles();
}, []);

// Create role
const { createRole, isCreating } = useUserRoleForm();
const result = await createRole({ roleName, roleCode, priority });

// Update role
const { updateRole, isUpdating } = useUserRoleForm();
const result = await updateRole(id, { roleName, priority });

// Delete role
const { deleteRole, isDeleting } = useDeleteUserRole();
const result = await deleteRole(id);

// Get statistics
const { statistics, fetchStatistics } = useUserRoleStatistics();
fetchStatistics();

// Search
const { results, search } = useSearchUserRoles();
search("Admin");
```

### 6. Redux State

```typescript
// Access state
const { items, filters, total, isLoading } = useAppSelector(
  (state) => state.userRoles,
);

// Dispatch actions
dispatch(setFilters({ search: "admin", page: 1 }));
dispatch(setSelectedRole(role));
```

### 7. API Integration

All endpoints are configured in `lib/API/userRole.ts`:

```typescript
// Get all roles
userRoleApi.getRoles(params);

// Create role
userRoleApi.createRole(data);

// Update role
userRoleApi.updateRole(id, data);

// Delete role
userRoleApi.deleteRole(id);

// Get statistics
userRoleApi.getRoleStatistics();

// Get hierarchy
userRoleApi.getRoleHierarchy();

// Bulk update
userRoleApi.bulkUpdateRoles(roleIds, isActive);

// Search
userRoleApi.searchRoles(term);
```

### 8. Role Priority Levels

```
Priority Range | Level          | Description
900-1000       | System         | Full system access
800-899        | Administrative | Management capabilities
600-799        | Managerial     | Team oversight
400-599        | Operational    | Daily operations
200-399        | Staff          | Regular employees
0-199          | Basic          | Minimal permissions
```

### 9. Filtering Options

```typescript
// Search by name/code/description
{ search: 'admin' }

// Filter by status
{ isActive: true }  // Active only
{ isActive: false } // Inactive only

// Filter by type
{ isSystem: true }  // System roles
{ isSystem: false } // Custom roles

// Sort
{ sortBy: 'priority', sortOrder: 'desc' }
{ sortBy: 'roleName', sortOrder: 'asc' }

// Pagination
{ page: 1, limit: 10 }
```

### 10. Component Props

```typescript
// UserRoleTable
<UserRoleTable
  roles={roles}
  isLoading={isLoading}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggleStatus={handleToggle}
  selectedRoles={selected}
  onSelectRole={handleSelect}
/>

// UserRoleFilters
<UserRoleFilters
  filters={filters}
  onFiltersChange={updateFilters}
  onReset={resetFilters}
/>

// UserRoleForm
<UserRoleForm
  initialData={role}
  isEdit={true}
  isLoading={isUpdating}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>

// UserRoleStats
<UserRoleStats
  statistics={statistics}
  isLoading={statsLoading}
/>
```

### 11. Utility Functions

```typescript
// Get role level
getRoleLevel(priority); // Returns: 'System' | 'Administrative' | ...

// Format role code
formatRoleCode("SYSTEM_MANAGER"); // Returns: 'System Manager'

// Filter and sort
groupRolesByLevel(roles);
sortRolesByPriority(roles, "desc");
filterRolesByStatus(roles, true);
searchRoles(roles, "admin");

// Validation
isValidRoleCode("ADMIN_ROLE"); // true
isValidPriority(500); // true

// Check permissions
canEditRole(role, userRole);
canDeleteRole(role, userRole, userCount);
```

### 12. Loading States

All components show appropriate loading indicators:

```typescript
{isLoading && <LoadingSpinner />}

{isCreating && 'Creating...'}

{isUpdating && 'Updating...'}

{isDeleting && 'Deleting...'}
```

### 13. Error Handling

Errors are automatically shown via toast notifications:

```typescript
// Errors automatically displayed
useEffect(() => {
  if (error) {
    showToast("error", error);
  }
}, [error]);
```

### 14. Type Safety

Full TypeScript support with proper types:

```typescript
interface UserRoleType {
  _id: string;
  roleName: string;
  roleCode: string;
  priority: number;
  isActive: boolean;
  isSystem: boolean;
  userCount?: number;
  // ... more fields
}

interface CreateUserRoleDto {
  roleName: string;
  roleCode: string;
  priority?: number;
  // ... more fields
}
```

### 15. Common Tasks

#### Create a new role

```typescript
router.push("/user-roles/create");
```

#### View role details

```typescript
router.push(`/user-roles/${roleId}`);
```

#### Edit a role

```typescript
router.push(`/user-roles/${roleId}/edit`);
```

#### Search roles

```typescript
updateFilters({ search: "admin" });
```

#### Filter by status

```typescript
updateFilters({ isActive: true });
```

#### Sort by priority

```typescript
updateFilters({ sortBy: "priority", sortOrder: "desc" });
```

#### Pagination

```typescript
changePage(2);
```

#### View analytics

```typescript
router.push("/user-roles/analytics");
```

## 🔗 Pages

| URL                     | Purpose             |
| ----------------------- | ------------------- |
| `/user-roles`           | List all roles      |
| `/user-roles/create`    | Create new role     |
| `/user-roles/:id`       | View role details   |
| `/user-roles/:id/edit`  | Edit role           |
| `/user-roles/analytics` | Analytics dashboard |

## 📊 Comparison with Member System

Similar to member management with:

- ✅ Shared DataTable component
- ✅ Advanced filtering
- ✅ Search functionality
- ✅ Redux Toolkit state
- ✅ Custom hooks pattern
- ✅ Pagination support
- ✅ Responsive UI
- ✅ Toast notifications

## 🎯 Next Steps

1. **View the system**: Open `/user-roles`
2. **Create a test role**: Click "Create Role"
3. **Test filtering**: Use search and filters
4. **Check analytics**: Click "Analytics"
5. **Read full docs**: See `USER_ROLES_README.md`

## 📖 Full Documentation

For detailed documentation, see:

- `USER_ROLES_README.md` - Complete reference
- `lib/API/userRole.ts` - API endpoints
- `lib/types/userRole.ts` - Type definitions
- `lib/hooks/useUserRoles.ts` - Hook documentation

## ✅ Checklist

- ✅ Types created
- ✅ API client configured
- ✅ Redux slice integrated
- ✅ Hooks implemented
- ✅ Components built
- ✅ Pages created
- ✅ Utils functions ready
- ✅ TypeScript errors: 0
- ✅ Full error handling
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Production ready

## 🎨 Features Included

- 📋 List view with table
- 🔍 Advanced search
- 🏷️ Multiple filters
- 📄 Pagination
- ✏️ Create/Edit forms
- 👁️ Detailed view
- 📊 Statistics & analytics
- 📈 Distribution charts
- 🗂️ Role hierarchy
- 🔐 System role protection
- ⚠️ Confirmation dialogs
- 🔄 Bulk operations
- 💾 Auto-save validation
- 🎯 Sort & filter
- 📱 Mobile responsive

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: January 31, 2026
