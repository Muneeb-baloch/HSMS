# File Management System - Implementation Guide

This document describes the complete file management system implemented for the HSMS frontend application.

## Overview

A production-ready file management system with the following features:
- **File Dashboard** - Browse, search, filter all uploaded files
- **Entity-specific Uploads** - Upload files when creating/editing Members, Projects, Plots, Documents
- **File Gallery** - Responsive grid view of files with thumbnails
- **File Preview** - Preview images and PDFs inline
- **File Download** - Download any uploaded file
- **Delete Files** - Soft delete with confirmation
- **Pagination** - Browse files with configurable page size
- **Search & Filter** - Filter by entity type, file type, search by name

## File Structure

```
components/FileManagement/
├── FileCard.tsx                 # Individual file card component
├── FileGallery.tsx              # Gallery grid with file cards
├── FilePreviewModal.tsx         # Modal for file preview
├── FileUploadModal.tsx          # Modal for uploading files
├── EntityFilesSection.tsx       # Reusable section for entity detail pages
└── index.ts                     # Barrel export

app/(protected)/files/
└── page.tsx                     # Main files dashboard page

app/(protected)/members/create/
└── page.tsx                     # Updated with file upload support

app/(protected)/projects/create/
└── page.tsx                     # Updated with file upload support

app/(protected)/plots/create/
└── page.tsx                     # Updated with file upload support

lib/hooks/entities/
├── useFiles.ts                  # Existing hooks (extended)
└── useFileManagement.ts         # New file management hooks

lib/utils/
└── file.utils.ts                # File utility functions

lib/types/
└── upload.types.ts              # Existing types (extended)
```

## Components

### FileCard
Individual file card component displayed in galleries.

**Props:**
```typescript
interface FileCardProps {
  file: UploadedFile;
  onPreview: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  showPreview?: boolean;
}
```

**Features:**
- Thumbnail preview for images
- File icon for other types
- Quick actions (preview, download, delete)
- File metadata display

### FileGallery
Responsive grid gallery component.

**Props:**
```typescript
interface FileGalleryProps {
  files: UploadedFile[];
  isLoading?: boolean;
  onRefresh?: () => void;
  showUploadButton?: boolean;
  onUploadClick?: () => void;
  showPreview?: boolean;
}
```

**Features:**
- Responsive 1-3 column grid
- Loading state
- Empty state with optional upload button
- Delete with confirmation
- Refresh capability

### FilePreviewModal
Modal for previewing files (images and PDFs).

**Props:**
```typescript
interface FilePreviewModalProps {
  file: UploadedFile | null;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features:**
- Image preview
- PDF preview
- File details (size, type, uploaded date)
- Download button

### FileUploadModal
Modal for uploading files with drag-drop support.

**Props:**
```typescript
interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  multiple?: boolean;
  maxSize?: number;
  accept?: Record<string, string[]>;
}
```

**Features:**
- Drag-and-drop file upload
- File size validation
- File type filtering
- Progress tracking
- Single or multiple file upload
- Success/error states

### EntityFilesSection
Reusable section component for entity detail pages.

**Props:**
```typescript
interface EntityFilesSectionProps {
  entityType: EntityType;
  entityId: string;
  title?: string;
  description?: string;
  allowUpload?: boolean;
  showUploadButton?: boolean;
  showPreview?: boolean;
  className?: string;
}
```

**Usage Example:**
```tsx
<EntityFilesSection
  entityType={EntityType.MEMBER}
  entityId={memberId}
  title="Member Documents"
  allowUpload={true}
/>
```

## Pages

### File Management Dashboard (`/files`)
Main dashboard for browsing all files.

**Features:**
- Search by file name
- Filter by entity type
- Filter by file type (image, PDF, document, other)
- Pagination with configurable page size
- File upload button
- File gallery with preview and delete

### Create Member with Files (`/members/create`)
Member creation page with integrated file upload.

**Flow:**
1. Fill member form
2. Submit to create member
3. If successful, show file upload section
4. Upload files related to the member
5. View uploaded files
6. Option to create another member or view all members

### Create Project with Files (`/projects/create`)
Project creation page with integrated file upload.

**Flow:**
Same as member creation but for projects.

### Create Plot with Files (`/plots/create`)
Plot creation page with integrated file upload.

**Flow:**
Same as member creation but for plots.

## Hooks

### useUploadConfig
Fetch upload configuration from API.

```typescript
const { data: config, isLoading, isError } = useUploadConfig();
```

### useUploadFile
Upload a single file.

```typescript
const mutation = useUploadFile();
await mutation.mutateAsync({
  file,
  entityType,
  entityId,
  uploadedBy: userId,
  metadata: {}
});
```

### useUploadMultipleFiles
Upload multiple files.

```typescript
const mutation = useUploadMultipleFiles();
await mutation.mutateAsync({
  files,
  entityType,
  entityId,
  uploadedBy: userId
});
```

### useFilesByEntity
Fetch files for a specific entity.

```typescript
const { data: files, isLoading, refetch } = useFilesByEntity(
  EntityType.MEMBER,
  memberId
);
```

### useFiles
Fetch files with pagination and filtering.

```typescript
const { data, isLoading } = useFiles({
  entityType: EntityType.PLOT,
  fileType: FileType.IMAGE,
  page: 1,
  limit: 12
});
```

### useDeleteFile
Delete a file (soft delete).

```typescript
const mutation = useDeleteFile();
await mutation.mutateAsync({
  id: fileId,
  deletedBy: userId
});
```

### useFileManagementModal
Manage upload modal state.

```typescript
const {
  isOpen,
  openModal,
  closeModal,
  uploadedFiles,
  handleUploadComplete
} = useFileManagementModal({ entityType, entityId });
```

## Utility Functions

### formatBytes
Format file size in human-readable format.

```typescript
formatBytes(1024) // "1 KB"
formatBytes(1048576) // "1 MB"
```

### getFileIcon
Get icon type for file based on extension.

```typescript
getFileIcon("document.pdf") // "pdf"
getFileIcon("image.png") // "image"
```

### isImageFile
Check if file is an image.

```typescript
isImageFile("image/jpeg") // true
```

### isPdfFile
Check if file is a PDF.

```typescript
isPdfFile("application/pdf") // true
```

### canPreviewFile
Check if file can be previewed inline.

```typescript
canPreviewFile("image/png") // true
canPreviewFile("application/pdf") // true
canPreviewFile("application/msword") // false
```

### downloadFile
Trigger file download.

```typescript
downloadFile(url, fileName);
```

## Types

All types are defined in `lib/types/upload.types.ts`:

```typescript
enum FileType {
  IMAGE = "image",
  DOCUMENT = "document",
  PDF = "pdf",
  OTHER = "other",
}

enum EntityType {
  USER = "user",
  PLOT = "plot",
  PROJECT = "project",
  MEMBER = "member",
  DOCUMENT = "document",
}

interface UploadedFile {
  _id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  fileName: string;
  originalName: string;
  fileType: FileType;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  pages?: number;
  entityType: EntityType;
  entityId: string;
  uploadedBy: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
```

## API Integration

The system integrates with your existing backend APIs:

**Endpoints Used:**
- `GET /uploads/config` - Fetch upload configuration
- `POST /uploads/upload/single` - Upload single file
- `POST /uploads/upload/multiple` - Upload multiple files
- `GET /uploads/files` - List files with pagination/filtering
- `GET /uploads/files/:id` - Get file by ID
- `GET /uploads/entities/:entityType/:entityId` - Get files by entity
- `PUT /uploads/files/:id` - Update file
- `DELETE /uploads/files/:id` - Delete file

## Usage Examples

### Example 1: Show file gallery on member detail page

```tsx
import { EntityFilesSection } from "@/components/FileManagement";
import { EntityType } from "@/lib/types/upload.types";

export function MemberDetailPage({ memberId }: { memberId: string }) {
  return (
    <div>
      {/* Member details here */}

      <EntityFilesSection
        entityType={EntityType.MEMBER}
        entityId={memberId}
        title="Member Documents"
        description="All documents related to this member"
        allowUpload={true}
        showPreview={true}
      />
    </div>
  );
}
```

### Example 2: Custom file gallery implementation

```tsx
import { FileGallery, FileUploadModal } from "@/components/FileManagement";
import { useFilesByEntity } from "@/lib/hooks/entities/useFiles";
import { EntityType } from "@/lib/types/upload.types";
import { useState } from "react";

export function CustomFilePage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { data: files, refetch } = useFilesByEntity(
    EntityType.PLOT,
    "plotId123"
  );

  return (
    <>
      <FileGallery
        files={files || []}
        onRefresh={() => refetch()}
        showUploadButton={true}
        onUploadClick={() => setIsUploadOpen(true)}
      />

      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        entityType={EntityType.PLOT}
        entityId="plotId123"
        onUploadComplete={() => {
          refetch();
          setIsUploadOpen(false);
        }}
      />
    </>
  );
}
```

### Example 3: Manually upload files

```tsx
import { useUploadFile } from "@/lib/hooks/entities/useFiles";
import { EntityType } from "@/lib/types/upload.types";
import { useAuth } from "@/lib/hooks/useAuth";

export function ManualUpload() {
  const { user } = useAuth();
  const uploadMutation = useUploadFile();

  const handleUpload = async (file: File) => {
    if (!user) return;

    try {
      const result = await uploadMutation.mutateAsync({
        file,
        entityType: EntityType.MEMBER,
        entityId: "memberId123",
        uploadedBy: user._id,
        metadata: {
          category: "identity",
          description: "Member ID proof"
        }
      });

      console.log("File uploaded:", result);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
    />
  );
}
```

## Styling

All components use shadcn/ui and Tailwind CSS for consistent styling. Components are fully responsive:
- Mobile: 1 column grid
- Tablet: 2 column grid
- Desktop: 3 column grid

## Performance

- **Query Caching**: TanStack Query caches file data with 2 minute stale time
- **Lazy Loading**: Images load lazily in galleries
- **Pagination**: Server-side pagination for efficient data loading
- **Optimistic Updates**: File deletions update UI immediately

## Error Handling

- **Upload Errors**: Display toast notifications
- **Network Errors**: Automatic retry with exponential backoff
- **Validation Errors**: File type and size validation before upload
- **API Errors**: Detailed error messages from backend

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile Browsers: Responsive, full support

## Future Enhancements

Potential improvements:
- Batch upload progress
- Drag-and-drop reordering
- Image cropping before upload
- Compression/optimization
- Integration with Cloudinary widgets
- Advanced search with OCR
- File sharing/permissions
- Archival/versions
