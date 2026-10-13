# Permission Backend - Production Architecture & Implementation

## 📋 Executive Summary

This document specifies the complete backend architecture and implementation for the Permission Management system, designed to serve the React frontend with TanStack Query and Redux Toolkit.

**Frontend Source of Truth**: All specifications derived from frontend API expectations in `lib/API/permissions.ts`

---

## 🎯 API Contract Verification

### Frontend Expected Endpoints

```
POST   /api/permission                      → Create permission
GET    /api/permission                      → List with filters & pagination
GET    /api/permission/:id                  → Get single permission
PUT    /api/permission/:id                  → Update permission
DELETE /api/permission/:id                  → Delete (soft)
PATCH  /api/permission/:id/toggle-status    → Toggle active status

POST   /api/permission/set                  → Set permissions (create/update)
POST   /api/permission/check                → Check if role has permission
POST   /api/permission/bulk-update          → Bulk update
POST   /api/permission/copy                 → Copy from role to role
POST   /api/permission/initialize-defaults  → Initialize default permissions

GET    /api/permission/statistics           → Get statistics
GET    /api/permission/role/:roleId         → Get by role
GET    /api/permission/module/:moduleId     → Get by module
GET    /api/permission/role/:roleId/summary         → Role summary
GET    /api/permission/module/:moduleId/summary     → Module summary
GET    /api/permission/role/:roleId/map             → Permissions map
GET    /api/permission/by-role-module?roleId=x&srModuleId=y → By both
```

---

## 📊 Response Format Specification

### Success Response Template

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

### Pagination Response

```typescript
interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface GetUserPermissionsResult {
  userPermissions: UserPermission[];
  summary: {
    totalPermissions: number;
    activePermissions: number;
    byAccessType: Record<string, number>;
    byModule: Record<string, number>;
    byRole: Record<string, number>;
  };
  pagination: PaginationResult;
}
```

### UserPermission Response

```typescript
interface UserPermission {
  _id: string;
  srModuleId: ModuleData | string;
  roleId: RoleData | string;
  moduleName: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canApprove?: boolean;
  canVerify?: boolean;
  isActive: boolean;
  createdBy: UserData | string;
  updatedBy?: UserData | string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🏗️ Clean Architecture Layers

### Layer 1: Controllers

- HTTP request/response handling
- Parameter extraction
- Response formatting
- Status code management

### Layer 2: Services

- Business logic
- Validation
- Orchestration
- Error handling

### Layer 3: Repositories

- Database queries
- Document operations
- Aggregation pipelines

### Layer 4: Models/Schemas

- Mongoose schemas
- Virtual fields
- Indexes
- Pre/post hooks

---

## 🔐 Authentication & Authorization

### Authentication Middleware

```typescript
// All endpoints EXCEPT read-only GET require authentication
export const authenticate = (req: AuthRequest, res, next) => {
  const token = extractToken(req);
  if (!token) throw new AppError(401, "Authentication required");

  const decoded = verifyToken(token);
  req.user = decoded;
  next();
};
```

### Authorization Requirements

- **CRUD Operations**: Require ADMIN or SUPER_ADMIN role
- **Read Operations**: Any authenticated user
- **Admin Operations**: SUPER_ADMIN only

---

## 📝 DTO Specifications

### CreateUserPermissionDto

```typescript
{
  srModuleId: string;           // MongoDB ObjectId
  roleId: string;               // MongoDB ObjectId
  moduleName?: string;          // Auto-filled from SrModule
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canApprove?: boolean;
  canVerify?: boolean;
  isActive?: boolean;           // Default: true
}

// Validation:
// - srModuleId: required, must be valid MongoDB ObjectId
// - roleId: required, must be valid MongoDB ObjectId
// - At least one permission must be true
```

### UpdateUserPermissionDto

```typescript
{
  canRead?: boolean;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  canExport?: boolean;
  canImport?: boolean;
  canApprove?: boolean;
  canVerify?: boolean;
  isActive?: boolean;
}

// Validation:
// - At least one field required
// - If updating permissions: at least one permission must be true
```

### UserPermissionQueryParams

```typescript
{
  page?: number;                // Default: 1, Min: 1
  limit?: number;               // Default: 20, Max: 100
  search?: string;              // Search by moduleName
  srModuleId?: string;          // Filter by module
  roleId?: string;              // Filter by role
  isActive?: boolean;           // Filter by status
  hasAccess?: boolean;          // Filter by access (any permission)
  sortBy?: string;              // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc';   // Default: 'desc'
}
```

---

## 🔄 TanStack Query Integration

### Query Keys Pattern

```typescript
// Frontend uses these patterns
const permissionKeys = {
  all: ["permissions"],
  lists: () => [...permissionKeys.all, "list"],
  list: (filters) => [...permissionKeys.lists(), filters],
  details: () => [...permissionKeys.all, "detail"],
  detail: (id) => [...permissionKeys.details(), id],
  statistics: () => [...permissionKeys.all, "statistics"],
};
```

### Pagination Support

```typescript
// Backend must support:
// - offset/limit calculation
// - total count
// - pages calculation
// Frontend expects:
response.data.data.pagination = {
  page: 1,
  limit: 20,
  total: 100,
  pages: 5,
};
```

### Refetch Invalidation

```typescript
// Frontend will invalidate on mutations:
queryClient.invalidateQueries(["permissions", "list"]);
queryClient.invalidateQueries(["permissions", "statistics"]);
```

---

## 🧪 Endpoint Implementation Details

### 1. CREATE - POST /api/permission

**Request**:

```typescript
POST /api/permission
Authorization: Bearer <token>
Content-Type: application/json

{
  srModuleId: "507f1f77bcf86cd799439011",
  roleId: "507f1f77bcf86cd799439012",
  canRead: true,
  canCreate: true,
  canUpdate: false,
  canDelete: false,
  isActive: true
}
```

**Response (201)**:

```typescript
{
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439013",
    srModuleId: { _id: "507f1f77bcf86cd799439011", moduleName: "Users" },
    roleId: { _id: "507f1f77bcf86cd799439012", roleName: "Admin" },
    moduleName: "Users",
    canRead: true,
    canCreate: true,
    canUpdate: false,
    canDelete: false,
    canExport: false,
    canImport: false,
    canApprove: false,
    canVerify: false,
    isActive: true,
    createdBy: "...",
    updatedBy: "...",
    isDeleted: false,
    createdAt: "2026-01-31T10:00:00Z",
    updatedAt: "2026-01-31T10:00:00Z"
  },
  message: "Permission created successfully"
}
```

**Validations**:

- ✅ Both IDs valid MongoDB ObjectId
- ✅ Module exists
- ✅ Role exists
- ✅ Permission doesn't already exist for this module+role combination (return 400)
- ✅ At least one permission granted (return 400)
- ✅ Authentication required (return 401)
- ✅ Admin role required (return 403)

---

### 2. LIST - GET /api/permission

**Request**:

```typescript
GET /api/permission?page=1&limit=20&search=Users&roleId=xxx&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    userPermissions: [
      {
        _id: "...",
        srModuleId: { _id: "...", moduleName: "Users" },
        roleId: { _id: "...", roleName: "Admin" },
        ...
      }
    ],
    summary: {
      totalPermissions: 5,
      activePermissions: 4,
      byAccessType: {
        "Full Access": 2,
        "Limited Access": 2,
        "View Only": 1,
        "No Access": 0
      },
      byModule: {
        "Users": 2,
        "Posts": 3
      },
      byRole: {
        "Admin": 3,
        "Editor": 2
      }
    },
    pagination: {
      page: 1,
      limit: 20,
      total: 5,
      pages: 1
    }
  }
}
```

**Query Processing**:

- Parse page/limit, default to 1/20
- Build MongoDB query from filters
- Apply text search on moduleName
- Calculate offset: (page - 1) \* limit
- Populate related fields (srModuleId, roleId, createdBy, updatedBy)
- Sort results
- Count total documents
- Calculate pages: Math.ceil(total / limit)

---

### 3. GET SINGLE - GET /api/permission/:id

**Request**:

```typescript
GET /api/permission/507f1f77bcf86cd799439013
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439013",
    srModuleId: { /* populated */ },
    roleId: { /* populated */ },
    ...
  }
}
```

**Error (404)**:

```typescript
{
  success: false,
  message: "Permission not found"
}
```

---

### 4. UPDATE - PUT /api/permission/:id

**Request**:

```typescript
PUT /api/permission/507f1f77bcf86cd799439013
Authorization: Bearer <token>
Content-Type: application/json

{
  canRead: true,
  canCreate: false,
  canUpdate: true,
  canDelete: false,
  isActive: true
}
```

**Response (200)**:

```typescript
{
  success: true,
  data: { /* updated permission */ },
  message: "Permission updated successfully"
}
```

**Validations**:

- ✅ At least one permission must remain true
- ✅ Cannot change srModuleId/roleId
- ✅ Only provided fields updated

---

### 5. DELETE - DELETE /api/permission/:id

**Request**:

```typescript
DELETE /api/permission/507f1f77bcf86cd799439013
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  message: "Permission deleted successfully"
}
```

**Implementation**:

- Soft delete: Set isDeleted=true, deletedAt=now(), isActive=false
- Don't actually remove from database

---

### 6. TOGGLE STATUS - PATCH /api/permission/:id/toggle-status

**Request**:

```typescript
PATCH /api/permission/507f1f77bcf86cd799439013/toggle-status
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: { /* permission with toggled isActive */ },
  message: "Permission deactivated successfully"
}
```

---

### 7. SET PERMISSIONS - POST /api/permission/set

**Request**:

```typescript
POST /api/permission/set
Authorization: Bearer <token>
Content-Type: application/json

{
  srModuleId: "507f1f77bcf86cd799439011",
  roleId: "507f1f77bcf86cd799439012",
  permissions: {
    canRead: true,
    canCreate: true,
    canUpdate: false,
    canDelete: false
  }
}
```

**Response (200)**:

```typescript
{
  success: true,
  data: { /* created or updated permission */ },
  message: "Permissions set successfully"
}
```

**Implementation**:

- Find existing permission by (srModuleId, roleId)
- If exists: update it
- If not: create new
- This is idempotent

---

### 8. CHECK PERMISSION - POST /api/permission/check

**Request**:

```typescript
POST /api/permission/check
Authorization: Bearer <token>
Content-Type: application/json

{
  roleId: "507f1f77bcf86cd799439012",
  srModuleId: "507f1f77bcf86cd799439011",
  permissionType: "read"
}
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    hasPermission: true
  },
  message: "Permission granted"
}
```

**Permission Types**: read, create, update, delete, export, import, approve, verify

---

### 9. BULK UPDATE - POST /api/permission/bulk-update

**Request**:

```typescript
POST /api/permission/bulk-update
Authorization: Bearer <token>
Content-Type: application/json

{
  permissionIds: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"],
  canRead: true,
  isActive: false
}
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    matched: 2,
    modified: 2
  },
  message: "Successfully updated 2 of 2 permissions"
}
```

---

### 10. COPY PERMISSIONS - POST /api/permission/copy

**Request**:

```typescript
POST /api/permission/copy
Authorization: Bearer <token>
Content-Type: application/json

{
  sourceRoleId: "507f1f77bcf86cd799439011",
  targetRoleId: "507f1f77bcf86cd799439012",
  overrideExisting: false
}
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    copied: 10,
    skipped: 2,
    errors: []
  },
  message: "Permissions copied: 10 copied, 2 skipped"
}
```

---

### 11. STATISTICS - GET /api/permission/statistics

**Request**:

```typescript
GET / api / permission / statistics;
Authorization: Bearer<token>;
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    totalPermissions: 50,
    activePermissions: 45,
    inactivePermissions: 5,
    modulesWithPermissions: 10,
    rolesWithPermissions: 5,
    byAccessType: {
      "Full Access": 20,
      "Limited Access": 15,
      "View Only": 10,
      "No Access": 5
    },
    byModule: {
      "Users": 15,
      "Posts": 10,
      ...
    },
    byRole: {
      "Admin": 20,
      "Editor": 15,
      ...
    },
    permissionDistribution: {
      read: 45,
      create: 30,
      update: 25,
      delete: 15,
      export: 10,
      import: 8,
      approve: 5,
      verify: 3
    }
  }
}
```

---

### 12. GET BY ROLE - GET /api/permission/role/:roleId

**Request**:

```typescript
GET /api/permission/role/507f1f77bcf86cd799439012
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: [
    { /* permissions for this role */ }
  ]
}
```

---

### 13. GET BY MODULE - GET /api/permission/module/:moduleId

**Request**:

```typescript
GET /api/permission/module/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: [
    { /* permissions for this module */ }
  ]
}
```

---

### 14. ROLE SUMMARY - GET /api/permission/role/:roleId/summary

**Request**:

```typescript
GET /api/permission/role/507f1f77bcf86cd799439012/summary
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    roleId: "507f1f77bcf86cd799439012",
    roleName: "Admin",
    totalModules: 10,
    accessibleModules: 9,
    fullAccessModules: 5,
    readOnlyModules: 2,
    noAccessModules: 1,
    permissionsByModule: [
      {
        moduleId: "507f1f77bcf86cd799439011",
        moduleName: "Users",
        moduleCode: "USERS",
        accessType: "Full Access",
        permissions: ["Read", "Create", "Update", "Delete"]
      }
    ]
  }
}
```

---

### 15. MODULE SUMMARY - GET /api/permission/module/:moduleId/summary

**Request**:

```typescript
GET /api/permission/module/507f1f77bcf86cd799439011/summary
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    moduleId: "507f1f77bcf86cd799439011",
    moduleName: "Users",
    moduleCode: "USERS",
    totalRoles: 5,
    accessibleRoles: 4,
    rolesWithAccess: [
      {
        roleId: "507f1f77bcf86cd799439012",
        roleName: "Admin",
        accessType: "Full Access",
        canRead: true,
        canCreate: true,
        canUpdate: true,
        canDelete: true
      }
    ]
  }
}
```

---

### 16. PERMISSIONS MAP - GET /api/permission/role/:roleId/map

**Request**:

```typescript
GET /api/permission/role/507f1f77bcf86cd799439012/map
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    "USERS": {
      moduleId: "507f1f77bcf86cd799439011",
      moduleName: "Users",
      moduleCode: "USERS",
      routePath: "/users",
      canRead: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canExport: false,
      canImport: false,
      canApprove: false,
      canVerify: false
    },
    "POSTS": { /* ... */ }
  }
}
```

---

### 17. BY ROLE AND MODULE - GET /api/permission/by-role-module?roleId=x&srModuleId=y

**Request**:

```typescript
GET /api/permission/by-role-module?roleId=507f1f77bcf86cd799439012&srModuleId=507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439013",
    srModuleId: { /* populated */ },
    roleId: { /* populated */ },
    ...
  }
}
```

**Error (404)**:

```typescript
{
  success: false,
  message: "Permission not found"
}
```

---

### 18. INITIALIZE DEFAULTS - POST /api/permission/initialize-defaults

**Request**:

```typescript
POST / api / permission / initialize - defaults;
Authorization: Bearer<token>;
```

**Response (200)**:

```typescript
{
  success: true,
  data: {
    created: 50,
    updated: 10,
    errors: []
  },
  message: "Default permissions initialized: 50 created, 10 updated"
}
```

**Implementation**:

- For each role, for each module:
  - If permission exists: update
  - If not: create
  - Use predefined role templates:
    - SUPER_ADMIN: All permissions true
    - ADMIN: All except verify
    - MANAGER: Read, Create, Update, Approve (no delete, import)
    - STAFF: Read, Create, Update
    - MEMBER: Read only
    - GUEST: No permissions

---

## 🛡️ Error Handling

### Standard Error Response

```typescript
{
  success: false,
  message: "Error description",
  error?: "error_code"
}
```

### Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation, duplicate, etc.)
- **401**: Unauthorized (no token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Server Error

### Common Validations

```
- MongoDB ObjectId validation
- Required field validation
- At least one permission validation
- Permission already exists validation
- Module/Role existence validation
- Active status validation
```

---

## 📊 Database Indexes

```typescript
// Compound index for unique constraint
userPermissionSchema.index(
  { srModuleId: 1, roleId: 1, isDeleted: 1 },
  { unique: true },
);

// For role queries
userPermissionSchema.index({ roleId: 1, isActive: 1 });

// For module queries
userPermissionSchema.index({ srModuleId: 1, isActive: 1 });

// For search
userPermissionSchema.index({ moduleName: "text" });

// For sorting and filtering
userPermissionSchema.index({
  canRead: 1,
  canCreate: 1,
  canUpdate: 1,
  canDelete: 1,
});
```

---

## 🎯 Performance Optimizations

1. **Pagination**: Always paginate lists (max 100 items per page)
2. **Population**: Selectively populate only needed fields
3. **Aggregation**: Use MongoDB aggregation for statistics
4. **Caching**: Consider Redis for frequently accessed data
5. **Indexes**: Create indexes for common queries
6. **Queries**: Use `.select()` to limit fields returned

---

## 🔄 Consistency Guarantees

- **Transactions**: Use MongoDB sessions for multi-document operations
- **Idempotent**: POST /set is idempotent
- **Atomicity**: All or nothing for bulk operations
- **Validation**: Validate at both controller and service layers

---

## 📋 Quality Checklist

- ✅ All endpoints return proper status codes
- ✅ All responses match frontend contract
- ✅ Authentication on all write operations
- ✅ Authorization checked for admin operations
- ✅ Input validation on all DTOs
- ✅ Error messages meaningful
- ✅ Pagination working correctly
- ✅ Filters applied correctly
- ✅ Search working with text index
- ✅ Sorting working correctly
- ✅ Soft deletes working
- ✅ Populate working for relations
- ✅ Statistics calculated correctly
- ✅ Bulk operations atomic
- ✅ Copy operations idempotent

---

## 🚀 Deployment Considerations

1. Environment variables for API_BASE_URL
2. Database connection pooling
3. Error logging
4. Request logging
5. Rate limiting
6. CORS configuration
7. Security headers
8. Input sanitization
9. SQL injection prevention (if SQL used)
10. XSS protection

---

**Status**: Production-Ready Specification
**Version**: 1.0.0
**Alignment**: 100% Match to Frontend API Contract
