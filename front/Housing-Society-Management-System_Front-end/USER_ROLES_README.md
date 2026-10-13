# User Role Management Frontend

A complete, production-ready frontend system for managing user roles in the HSMS application. Built with Next.js 14+, React, Redux Toolkit, and TypeScript.

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Components](#components)
- [Hooks](#hooks)
- [Redux Store](#redux-store)
- [Utilities](#utilities)
- [Pages](#pages)
- [Type Definitions](#type-definitions)

## ✨ Features

### Core Functionality

- ✅ **Complete CRUD Operations**: Create, read, update, and delete user roles
- ✅ **Advanced Filtering**: Search, filter by status, type, and sort options
- ✅ **Pagination**: Efficiently handle large datasets
- ✅ **Bulk Operations**: Update multiple roles at once
- ✅ **Role Hierarchy**: Visual representation of role levels and priority
- ✅ **Statistics & Analytics**: Comprehensive role distribution and usage insights
- ✅ **System Role Protection**: Prevent modifications to system roles
- ✅ **Status Management**: Activate/deactivate roles
- ✅ **User Assignment Tracking**: See how many users are assigned to each role

### User Interface

- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS
- 📊 **Data Visualization**: Charts and statistics cards
- 🔍 **Smart Search**: Real-time search across role properties
- 🏷️ **Badge System**: Visual status indicators (Active/Inactive, System/Custom)
- ⚠️ **Confirmation Dialogs**: Safe delete operations with warnings
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- ♿ **Accessible**: Proper ARIA labels and keyboard navigation

### Data Management

- 🔐 **Type-Safe**: Full TypeScript support with strict typing
- 📡 **API Integration**: Seamless backend communication with error handling
- 💾 **State Management**: Redux Toolkit for predictable state updates
- 🔄 **Real-time Updates**: Immediate UI updates after operations
- 🛡️ **Error Handling**: Comprehensive error messages and validation

## 📁 Project Structure

```
lib/
├── API/
│   └── userRole.ts                 # API client methods
├── types/
│   └── userRole.ts                 # TypeScript types and interfaces
├── utils/
│   └── userRoleUtils.ts            # Utility functions
├── hooks/
│   └── useUserRoles.ts             # Custom React hooks
└── store/
    └── slices/
        └── userRoleSlice.ts        # Redux slice

components/
└── user-roles/
    ├── UserRoleForm.tsx            # Form component for create/edit
    ├── UserRoleTable.tsx           # Data table component
    ├── UserRoleFilters.tsx         # Filter and search component
    ├── UserRoleStats.tsx           # Statistics cards
    ├── RoleDistribution.tsx        # Distribution visualization
    └── index.ts                    # Component exports

app/(protected)/user-roles/
├── page.tsx                         # List page
├── create/
│   └── page.tsx                     # Create role page
├── [id]/
│   ├── page.tsx                     # View role page
│   └── edit/
│       └── page.tsx                 # Edit role page
└── analytics/
    └── page.tsx                     # Analytics dashboard
```

## 🏗️ Architecture

### Three-Layer Architecture

#### 1. **Data Layer** (`lib/API/userRole.ts`)

- Handles all HTTP communication with backend
- Axios-based client with proper error handling
- Typed responses for type safety

#### 2. **State Layer** (`lib/store/slices/userRoleSlice.ts`)

- Redux Toolkit for centralized state management
- Reducers for all state mutations
- Actions for user interactions

#### 3. **Presentation Layer** (`components/user-roles/`)

- Reusable UI components
- Custom hooks for data fetching and mutations
- Pages for different views

### Data Flow

```
User Action → Component → Hook → Redux Action → API Call → Redux Reducer → UI Update
```

## 🚀 Installation

### Prerequisites

- Node.js 18+
- pnpm 8+
- React 18+
- Next.js 14+

### Setup Steps

1. **Install dependencies** (already included in workspace)

```bash
pnpm install
```

2. **Ensure store is configured** (already done in `lib/store/store.ts`)

- UserRoleSlice is registered in Redux store

3. **Verify API client** (already configured)

- Axios client with interceptors is ready

4. **Start development server**

```bash
pnpm run dev
```

Access the application at `http://localhost:3000`

## 📖 Usage

### Basic Usage Example

#### List Roles

```tsx
import { useUserRoles } from "@/lib/hooks/useUserRoles";

export function RolesList() {
  const { roles, fetchRoles, updateFilters } = useUserRoles();

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div>
      {roles.map((role) => (
        <div key={role._id}>{role.roleName}</div>
      ))}
    </div>
  );
}
```

#### Create Role

```tsx
import { useUserRoleForm } from "@/lib/hooks/useUserRoles";
import { UserRoleForm } from "@/components/user-roles";

export function CreateRole() {
  const { createRole, isCreating } = useUserRoleForm();

  const handleSubmit = async (data) => {
    await createRole(data);
  };

  return <UserRoleForm isLoading={isCreating} onSubmit={handleSubmit} />;
}
```

#### Update Role

```tsx
const { updateRole, isUpdating } = useUserRoleForm();

const handleUpdate = async (id, data) => {
  const result = await updateRole(id, data);
  if (result.success) {
    // Handle success
  }
};
```

## 🔌 API Reference

### Endpoints

All endpoints are mapped in `lib/API/userRole.ts`:

| Method | Endpoint                         | Purpose                       |
| ------ | -------------------------------- | ----------------------------- |
| GET    | `/user-role`                     | Get all roles with pagination |
| POST   | `/user-role`                     | Create new role               |
| GET    | `/user-role/:id`                 | Get role by ID                |
| PUT    | `/user-role/:id`                 | Update role                   |
| DELETE | `/user-role/:id`                 | Delete role (soft delete)     |
| PATCH  | `/user-role/:id/toggle-status`   | Toggle role status            |
| GET    | `/user-role/active`              | Get active roles only         |
| GET    | `/user-role/with-user-count`     | Get roles with user counts    |
| GET    | `/user-role/search`              | Search roles                  |
| GET    | `/user-role/hierarchy`           | Get role hierarchy            |
| GET    | `/user-role/statistics`          | Get statistics                |
| POST   | `/user-role/bulk-update`         | Bulk update roles             |
| POST   | `/user-role/initialize-defaults` | Initialize default roles      |

### Query Parameters

```typescript
interface UserRoleQueryParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10, Max: 100
  search?: string; // Search term
  isActive?: boolean; // Filter by active status
  isSystem?: boolean; // Filter by system status
  sortBy?: string; // Sort field
  sortOrder?: "asc" | "desc"; // Sort order
}
```

## 🧩 Components

### UserRoleForm

Form for creating and editing roles with validation.

**Props:**

```typescript
interface UserRoleFormProps {
  initialData?: Partial<UpdateUserRoleDto>;
  isLoading?: boolean;
  isEdit?: boolean;
  onSubmit: (data: CreateUserRoleDto) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}
```

**Usage:**

```tsx
<UserRoleForm
  initialData={role}
  isEdit={true}
  onSubmit={handleUpdate}
  onCancel={handleCancel}
/>
```

### UserRoleTable

Data table for displaying roles with actions.

**Props:**

```typescript
interface UserRoleTableProps {
  roles: UserRoleType[];
  isLoading?: boolean;
  onEdit?: (role: UserRoleType) => void;
  onDelete?: (role: UserRoleType) => void;
  onToggleStatus?: (role: UserRoleType) => void;
  onView?: (role: UserRoleType) => void;
  selectedRoles?: string[];
  onSelectRole?: (roleId: string) => void;
  onSelectAll?: (roleIds: string[]) => void;
}
```

### UserRoleFilters

Filter and search component.

**Props:**

```typescript
interface UserRoleFiltersProps {
  filters: UserRoleQueryParams;
  onFiltersChange: (filters: Partial<UserRoleQueryParams>) => void;
  onReset?: () => void;
}
```

### UserRoleStats

Statistics cards component.

**Props:**

```typescript
interface UserRoleStatsProps {
  statistics: UserRoleStatistics | null;
  isLoading?: boolean;
}
```

### RoleDistribution

Role distribution visualization.

**Props:**

```typescript
interface RoleDistributionProps {
  statistics: UserRoleStatistics | null;
  isLoading?: boolean;
}
```

## 🪝 Hooks

### useUserRoles

Main hook for fetching and managing roles list.

```typescript
const {
  roles, // Array of roles
  filters, // Current filters
  total, // Total count
  pages, // Total pages
  isLoading, // Loading state
  error, // Error message
  summary, // Summary stats
  fetchRoles, // Fetch function
  updateFilters, // Update filters
  changePage, // Change page
  changeSearch, // Change search
} = useUserRoles();
```

### useUserRole

Hook for fetching single role.

```typescript
const {
  data, // Role data
  isLoading, // Loading state
  error, // Error message
  fetchRole, // Fetch function
} = useUserRole(roleId);
```

### useUserRoleForm

Hook for CRUD operations.

```typescript
const {
  createRole, // Create function
  updateRole, // Update function
  isCreating, // Create loading
  isUpdating, // Update loading
  error, // Error message
} = useUserRoleForm();
```

### useDeleteUserRole

Hook for delete operations.

```typescript
const {
  deleteRole, // Delete function
  toggleStatus, // Toggle status function
  isDeleting, // Delete loading
} = useDeleteUserRole();
```

### useUserRoleStatistics

Hook for fetching statistics.

```typescript
const {
  statistics, // Statistics data
  isLoading, // Loading state
  error, // Error message
  fetchStatistics, // Fetch function
} = useUserRoleStatistics();
```

### useRoleHierarchy

Hook for fetching role hierarchy.

```typescript
const {
  hierarchy, // Hierarchy data
  isLoading, // Loading state
  error, // Error message
  fetchHierarchy, // Fetch function
} = useRoleHierarchy();
```

### useSearchUserRoles

Hook for searching roles.

```typescript
const {
  results, // Search results
  isLoading, // Loading state
  error, // Error message
  search, // Search function
} = useSearchUserRoles();
```

### useActiveUserRoles

Hook for fetching active roles.

```typescript
const {
  roles, // Active roles
  isLoading, // Loading state
  error, // Error message
  fetchActiveRoles, // Fetch function
} = useActiveUserRoles();
```

## 🔴 Redux Store

### State Structure

```typescript
interface UserRoleState {
  items: UserRoleType[];
  selectedItem: UserRoleType | null;
  filters: UserRoleQueryParams;
  total: number;
  pages: number;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  statistics: UserRoleStatistics | null;
  summary: {
    /* ... */
  };
}
```

### Actions

```typescript
// List operations
setRoles(items);
setSummary(summary);
setTotal(count);
setPages(pages);

// CRUD
addRole(role);
updateRole(role);
removeRole(id);

// Selection
setSelectedRole(role);

// Filters
setFilters(filters);
resetFilters();

// States
setLoading(bool);
setCreating(bool);
setUpdating(bool);
setDeleting(bool);

// Others
setError(message);
setStatistics(stats);
clearRoles();
```

## 🛠️ Utilities

Helper functions in `lib/utils/userRoleUtils.ts`:

```typescript
// Role level
getRoleLevel(priority); // Get role level from priority
getRoleLevelColor(level); // Get badge color
getStatusBadgeColor(isActive); // Get status color
getSystemBadgeColor(isSystem); // Get system badge color

// Formatting
formatRoleCode(code); // Format role code for display
formatDate(date); // Format date with time
formatDateOnly(date); // Format date only

// Grouping and Filtering
groupRolesByLevel(roles); // Group by level
filterRolesByStatus(roles, isActive); // Filter by status
filterRolesBySystem(roles, isSystem); // Filter by system status
sortRolesByPriority(roles, order); // Sort by priority
sortRolesByName(roles, order); // Sort by name
searchRoles(roles, term); // Search roles

// Statistics
calculateRoleStats(roles); // Calculate stats
getHighPriorityRoles(roles); // Get admin roles
getLowPriorityRoles(roles); // Get basic roles

// Validation
canEditRole(role, userRole); // Check if can edit
canDeleteRole(role, userRole, userCount); // Check if can delete
isValidRoleCode(code); // Validate role code
isValidPriority(priority); // Validate priority

// Misc
getRoleBadgeText(role); // Get badge text
```

## 📄 Pages

### List Page (`/user-roles`)

Main page displaying all roles with:

- Search and filter functionality
- Pagination
- Statistics cards
- Role distribution chart
- Bulk actions support

### Create Page (`/user-roles/create`)

Form to create new role with:

- Validation
- Help guidelines
- Success/error messages
- Cancel option

### View Page (`/user-roles/[id]`)

Detailed view of a role showing:

- All role information
- Statistics (users assigned, permissions)
- Metadata (created date, IDs)
- Edit button
- Type indicator

### Edit Page (`/user-roles/[id]/edit`)

Form to edit role with:

- Pre-filled data
- Current details sidebar
- Delete option (if allowed)
- System role protection

### Analytics Page (`/user-roles/analytics`)

Analytics dashboard with:

- Comprehensive statistics
- Role distribution visualization
- Role hierarchy view
- Summary metrics
- Priority range information

## 📝 Type Definitions

Located in `lib/types/userRole.ts`:

```typescript
// Domain Model
interface UserRoleType {
  _id: string;
  roleName: string;
  roleCode: string;
  roleDescription?: string;
  isActive: boolean;
  isSystem: boolean;
  priority: number;
  createdBy?: User;
  updatedBy?: User;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  userCount?: number;
  permissionCount?: number;
  roleBadgeColor?: string;
  roleLevel?: string;
}

// DTOs
interface CreateUserRoleDto {
  /* ... */
}
interface UpdateUserRoleDto {
  /* ... */
}
interface BulkUpdateRolesDto {
  /* ... */
}

// Query Parameters
interface UserRoleQueryParams {
  /* ... */
}

// Response Models
interface GetUserRolesResult {
  /* ... */
}
interface UserRoleStatistics {
  /* ... */
}
interface RoleHierarchy {
  /* ... */
}

// Enums
type RoleLevel =
  | "System"
  | "Administrative"
  | "Managerial"
  | "Operational"
  | "Staff"
  | "Basic";
```

## 🔐 Security

- ✅ **CSRF Protection**: Handled by Next.js
- ✅ **Authentication**: Route guards via middleware
- ✅ **Authorization**: Role-based access control
- ✅ **Input Validation**: Client-side and server-side
- ✅ **XSS Prevention**: React's built-in XSS protection
- ✅ **SQL Injection Prevention**: Parameterized queries on backend

## 📊 Performance

- ✅ **Pagination**: Reduces data load
- ✅ **Lazy Loading**: Components loaded on demand
- ✅ **Memoization**: Optimized re-renders
- ✅ **Caching**: API responses cached efficiently
- ✅ **Code Splitting**: Smaller initial bundle

## 🐛 Error Handling

The system includes comprehensive error handling:

```typescript
// In components
if (error) {
  return <ErrorAlert message={error} />;
}

// In hooks
try {
  // operation
} catch (err) {
  setError(err.message);
}

// In API calls
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle error
  }
);
```

## 🧪 Testing

To test the role management system:

1. **Navigate to List Page**: `/user-roles`
2. **Create a role**: Click "Create Role" button
3. **Search and Filter**: Use the filter panel
4. **Edit a role**: Click edit icon in table
5. **View Analytics**: Click "Analytics" button
6. **Test bulk operations**: Select multiple roles

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [React Hooks Documentation](https://react.dev/reference/react)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Follow the existing patterns when adding new features:

1. Create types in `lib/types/userRole.ts`
2. Add API methods in `lib/API/userRole.ts`
3. Create Redux actions if needed
4. Add hooks in `lib/hooks/useUserRoles.ts`
5. Create components in `components/user-roles/`
6. Add utility functions as needed

## 📄 License

This project is part of HSMS and follows the same license terms.

---

**Last Updated**: January 31, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
