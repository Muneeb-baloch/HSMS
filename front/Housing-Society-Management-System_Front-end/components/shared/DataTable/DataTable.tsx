// 'use client'

// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
// import { Button } from '@/components/ui/button'
// import { Checkbox } from '@/components/ui/checkbox'
// import { ConfirmDialog } from '@/components/ui/confirm-dialog'
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select'
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from '@/components/ui/table'
// import {
//   IconChevronDown,
//   IconChevronLeft,
//   IconChevronRight,
//   IconChevronsLeft,
//   IconChevronsRight,
//   IconDotsVertical,
//   IconGripVertical,
//   IconLayoutColumns,
//   IconPlus,
//   IconSearch
// } from '@tabler/icons-react'
// import {
//   ColumnDef,
//   ColumnFiltersState,
//   Row,
//   SortingState,
//   VisibilityState,
//   flexRender,
//   getCoreRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable
// } from '@tanstack/react-table'
// import { Edit, Trash2 } from 'lucide-react'
// import { useState } from 'react'

// // Types
// export interface TableColumn<TData> {
//   id: string
//   header: string
//   accessorKey?: keyof TData
//   cell?: (row: TData) => React.ReactNode
//   sortable?: boolean
//   filterable?: boolean
//   width?: string
//   isImage?: boolean // Whether this column contains an image
//   imageAltKey?: keyof TData // Key for image alt text
// }

// export interface TableFilter {
//   id: string
//   label: string
//   type: 'select' | 'date' | 'boolean' | 'text'
//   options?: Array<{ label: string; value: string }>
//   placeholder?: string
// }

// export interface TableConfig<TData> {
//   columns: TableColumn<TData>[]
//   filters?: TableFilter[]
//   enableActions?: boolean
//   enableDragDrop?: boolean
//   enableSelection?: boolean
//   actions?: {
//     onEdit?: (id: string) => void
//     onDelete?: (id: string) => Promise<void>
//     customActions?: Array<{
//       label: string
//       icon: React.ReactNode
//       onClick: (row: TData) => void
//       variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
//     }>
//   }
//   pagination?: {
//     currentPage: number
//     totalPages: number
//     onPageChange: (page: number) => void
//     pageSize: number
//     onPageSizeChange: (size: number) => void
//     totalItems: number
//   }
// }

// interface EnhancedDataTableProps<TData extends { _id: string }> {
//   data: TData[]
//   config: TableConfig<TData>
//   isLoading?: boolean
//   onSearch?: (search: string) => void
//   onFilterChange?: (filters: Record<string, unknown>) => void
// }

// // Drag Handle Component
// function DragHandle ({ id }: { id: string }) {
//   return (
//     <Button
//       variant='ghost'
//       size='icon'
//       className='text-muted-foreground size-7 hover:bg-transparent cursor-grab'
//     >
//       <IconGripVertical className='text-muted-foreground size-3' />
//       <span className='sr-only'>Drag to reorder</span>
//     </Button>
//   )
// }

// // Image Cell Component
// function ImageCell<TData> ({
//   row,
//   column
// }: {
//   row: TData
//   column: TableColumn<TData>
// }) {
//   const imageUrl = (row as any)[column.id as string] as string
//   const altKey = column.imageAltKey || 'name'
//   const altText = ((row as any)[altKey as string] as string) || 'Image'

//   const initials =
//     altText
//       ?.split(' ')
//       .map((n: string) => n[0])
//       .join('')
//       .toUpperCase()
//       .slice(0, 2) || '??'

//   if (!imageUrl) {
//     return (
//       <Avatar className='size-8'>
//         <AvatarFallback>{initials}</AvatarFallback>
//       </Avatar>
//     )
//   }

//   return (
//     <Avatar className='size-8'>
//       <AvatarImage src={imageUrl} alt={altText} />
//       <AvatarFallback>{initials}</AvatarFallback>
//     </Avatar>
//   )
// }

// export function EnhancedDataTable<TData extends { _id: string }> ({
//   data,
//   config,
//   isLoading = false,
//   onSearch,
//   onFilterChange
// }: EnhancedDataTableProps<TData>) {
//   const [sorting, setSorting] = useState<SortingState>([])
//   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
//   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
//   const [rowSelection, setRowSelection] = useState({})
//   const [search, setSearch] = useState('')
//   const [filters, setFilters] = useState<Record<string, unknown>>({})
//   const [deleteId, setDeleteId] = useState<string | null>(null)

//   // Transform columns for TanStack Table
//   const columns: ColumnDef<TData>[] = [
//     // Drag handle column
//     ...(config.enableDragDrop
//       ? [
//           {
//             id: 'drag',
//             header: () => null,
//             cell: ({ row }) => <DragHandle id={row.original._id} />,
//             size: 40
//           } as ColumnDef<TData>
//         ]
//       : []),

//     // Selection checkbox column
//     ...(config.enableSelection
//       ? [
//           {
//             id: 'select',
//             header: ({ table }) => (
//               <div className='flex items-center justify-center'>
//                 <Checkbox
//                   checked={
//                     table.getIsAllPageRowsSelected() ||
//                     (table.getIsSomePageRowsSelected() && 'indeterminate')
//                   }
//                   onCheckedChange={value =>
//                     table.toggleAllPageRowsSelected(!!value)
//                   }
//                   aria-label='Select all'
//                 />
//               </div>
//             ),
//             cell: ({ row }) => (
//               <div className='flex items-center justify-center'>
//                 <Checkbox
//                   checked={row.getIsSelected()}
//                   onCheckedChange={value => row.toggleSelected(!!value)}
//                   aria-label='Select row'
//                 />
//               </div>
//             ),
//             size: 40
//           } as ColumnDef<TData>
//         ]
//       : []),

//     // Data columns
//     ...config.columns.map(col => ({
//       id: col.id,
//       accessorKey: (col.accessorKey as string) || col.id,
//       header: col.header,
//       cell: col.cell
//         ? ({ row }: { row: Row<TData> }) => col.cell!(row.original)
//         : col.isImage
//         ? ({ row }: { row: Row<TData> }) => (
//             <ImageCell row={row.original} column={col} />
//           )
//         : ({ getValue }: { getValue: () => unknown }) => {
//             const value = getValue()
//             return value ? (value as React.ReactNode) : 'N/A'
//           },
//       enableSorting: col.sortable,
//       enableColumnFilter: col.filterable,
//       size: col.width ? parseInt(col.width) : undefined
//     })),

//     // Actions column
//     ...(config.enableActions
//       ? [
//           {
//             id: 'actions',
//             header: 'Actions',
//             cell: ({ row }) => (
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant='ghost' className='h-8 w-8 p-0'>
//                     <IconDotsVertical className='h-4 w-4' />
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align='end'>
//                   <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   {config.actions?.onEdit && (
//                     <DropdownMenuItem
//                       onClick={() => config.actions!.onEdit!(row.original._id)}
//                     >
//                       <IconEdit className='mr-2 h-4 w-4' />
//                       Edit
//                     </DropdownMenuItem>
//                   )}
//                   {config.actions?.onDelete && (
//                     <DropdownMenuItem
//                       className='text-red-600'
//                       onClick={() => setDeleteId(row.original._id)}
//                     >
//                       <IconTrash className='mr-2 h-4 w-4' />
//                       Delete
//                     </DropdownMenuItem>
//                   )}
//                   {config.actions?.customActions?.map(action => (
//                     <DropdownMenuItem
//                       key={action.label}
//                       onClick={() => action.onClick(row.original)}
//                     >
//                       {action.icon}
//                       {action.label}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             ),
//             size: 80
//           } as ColumnDef<TData>
//         ]
//       : [])
//   ]

//   const table = useReactTable({
//     data,
//     columns,
//     state: {
//       sorting,
//       columnVisibility,
//       rowSelection,
//       columnFilters
//     },
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     getCoreRowModel: getCoreRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     getFacetedRowModel: getFacetedRowModel(),
//     getFacetedUniqueValues: getFacetedUniqueValues(),
//     getPaginationRowModel: getPaginationRowModel()
//   })

//   const handleSearch = (value: string) => {
//     setSearch(value)
//     onSearch?.(value)
//   }

//   const handleFilterChange = (id: string, value: unknown) => {
//     const newFilters = { ...filters, [id]: value }
//     setFilters(newFilters)
//     onFilterChange?.(newFilters)
//   }

//   return (
//     <div className='space-y-4'>
//       {/* Search and Filters */}
//       <div className='flex flex-col md:flex-row gap-4 items-center'>
//         {/* Search Input */}
//         <div className='relative flex-1'>
//           <IconSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
//           <Input
//             placeholder='Search...'
//             value={search}
//             onChange={e => handleSearch(e.target.value)}
//             className='pl-10'
//           />
//         </div>

//         {/* Customize Columns Button */}
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button variant='outline' size='sm'>
//               <IconLayoutColumns />
//               <span className='hidden lg:inline'>Customize Columns</span>
//               <IconChevronDown />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align='end' className='w-56'>
//             {table
//               .getAllColumns()
//               .filter(
//                 column =>
//                   typeof column.accessorFn !== 'undefined' &&
//                   column.getCanHide()
//               )
//               .map(column => (
//                 <DropdownMenuCheckboxItem
//                   key={column.id}
//                   className='capitalize'
//                   checked={column.getIsVisible()}
//                   onCheckedChange={value => column.toggleVisibility(!!value)}
//                 >
//                   {column.id}
//                 </DropdownMenuCheckboxItem>
//               ))}
//           </DropdownMenuContent>
//         </DropdownMenu>

//         {/* Add Button */}
//         <Button variant='outline' size='sm'>
//           <IconPlus />
//           <span className='hidden lg:inline'>Add</span>
//         </Button>

//         {/* Filters */}
//         {config.filters && config.filters.length > 0 && (
//           <div className='flex gap-2 flex-wrap'>
//             {config.filters.map(filter => (
//               <div key={filter.id} className='w-40'>
//                 {filter.type === 'select' ? (
//                   <Select
//                     value={(filters[filter.id] as string) || ''}
//                     onValueChange={value =>
//                       handleFilterChange(filter.id, value)
//                     }
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder={filter.label} />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value='all'>All</SelectItem>
//                       {filter.options?.map(option => (
//                         <SelectItem key={option.value} value={option.value}>
//                           {option.label}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 ) : (
//                   <Input
//                     placeholder={filter.placeholder || filter.label}
//                     value={(filters[filter.id] as string) || ''}
//                     onChange={e =>
//                       handleFilterChange(filter.id, e.target.value)
//                     }
//                   />
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Table */}
//       <div
//         className='rounded-md border overflow-hidden scrollbar-hide
//  '
//       >
//         <Table>
//           <TableHeader className='bg-muted'>
//             {table.getHeaderGroups().map(headerGroup => (
//               <TableRow key={headerGroup.id}>
//                 {headerGroup.headers.map(header => (
//                   <TableHead
//                     key={header.id}
//                     style={{ width: header.getSize() }}
//                   >
//                     {flexRender(
//                       header.column.columnDef.header,
//                       header.getContext()
//                     )}
//                   </TableHead>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHeader>
//           <TableBody>
//             {isLoading ? (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className='h-24 text-center'
//                 >
//                   Loading...
//                 </TableCell>
//               </TableRow>
//             ) : table.getRowModel().rows.length ? (
//               table.getRowModel().rows.map(row => (
//                 <TableRow key={row.id}>
//                   {row.getVisibleCells().map(cell => (
//                     <TableCell
//                       key={cell.id}
//                       style={{ width: cell.column.getSize() }}
//                     >
//                       {flexRender(
//                         cell.column.columnDef.cell,
//                         cell.getContext()
//                       )}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={columns.length}
//                   className='h-24 text-center'
//                 >
//                   No results.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* Pagination */}
//       {config.pagination && (
//         <div className='flex items-center justify-between px-4'>
//           <div className='text-muted-foreground hidden text-sm lg:flex'>
//             {table.getFilteredSelectedRowModel().rows.length} of{' '}
//             {table.getFilteredRowModel().rows.length} row(s) selected.
//           </div>
//           <div className='flex w-full items-center gap-8 '>
//             <div className='hidden items-center gap-2 lg:flex'>
//               <Label htmlFor='rows-per-page' className='text-sm font-medium'>
//                 Rows per page
//               </Label>
//               <Select
//                 value={`${config.pagination.pageSize}`}
//                 onValueChange={value => {
//                   config.pagination?.onPageSizeChange(Number(value))
//                 }}
//               >
//                 <SelectTrigger size='sm' className='w-20' id='rows-per-page'>
//                   <SelectValue placeholder={config.pagination.pageSize} />
//                 </SelectTrigger>
//                 <SelectContent side='top'>
//                   {[10, 20, 30, 40, 50].map(pageSize => (
//                     <SelectItem key={pageSize} value={`${pageSize}`}>
//                       {pageSize}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//             <div className='flex w-fit items-center justify-center text-sm font-medium'>
//               Page {config.pagination.currentPage} of{' '}
//               {config.pagination.totalPages}
//             </div>
//             <div className='ml-auto flex items-center gap-2 lg:ml-0'>
//               <Button
//                 variant='outline'
//                 className='hidden h-8 w-8 p-0 lg:flex'
//                 onClick={() => config.pagination?.onPageChange(1)}
//                 disabled={config.pagination.currentPage === 1}
//               >
//                 <span className='sr-only'>Go to first page</span>
//                 <IconChevronsLeft />
//               </Button>
//               <Button
//                 variant='outline'
//                 className='size-8'
//                 size='icon'
//                 onClick={() =>
//                   config.pagination?.onPageChange(
//                     config.pagination.currentPage - 1
//                   )
//                 }
//                 disabled={config.pagination.currentPage === 1}
//               >
//                 <span className='sr-only'>Go to previous page</span>
//                 <IconChevronLeft />
//               </Button>
//               <Button
//                 variant='outline'
//                 className='size-8'
//                 size='icon'
//                 onClick={() =>
//                   config.pagination?.onPageChange(
//                     config.pagination.currentPage + 1
//                   )
//                 }
//                 disabled={
//                   config.pagination.currentPage === config.pagination.totalPages
//                 }
//               >
//                 <span className='sr-only'>Go to next page</span>
//                 <IconChevronRight />
//               </Button>
//               <Button
//                 variant='outline'
//                 className='hidden size-8 lg:flex'
//                 size='icon'
//                 onClick={() =>
//                   config.pagination?.onPageChange(config.pagination.totalPages)
//                 }
//                 disabled={
//                   config.pagination.currentPage === config.pagination.totalPages
//                 }
//               >
//                 <span className='sr-only'>Go to last page</span>
//                 <IconChevronsRight />
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirmation */}
//       <ConfirmDialog
//         open={!!deleteId}
//         onOpenChange={open => !open && setDeleteId(null)}
//         title='Delete Confirmation'
//         description='Are you sure you want to delete this item? This action cannot be undone.'
//         onConfirm={async () => {
//           if (deleteId && config.actions?.onDelete) {
//             await config.actions.onDelete(deleteId)
//             setDeleteId(null)
//           }
//         }}
//       />
//     </div>
//   )
// }

// src/components/shared/DataTable/DataTable.tsx
'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ConfirmModal } from '@/components/ui/confirm'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconDotsVertical,
  IconFilter,
  IconGripVertical,
  IconLayoutColumns,
  IconSearch,
  IconX
} from '@tabler/icons-react'
import { ActionIcon } from '@/components/ui/ActionIcon'
import { getActionColor } from '@/lib/utils/actionColors'
import { hasPermission, type UserRole } from '@/lib/constants/roles'
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'
import { useEffect, useMemo, useRef, useState } from 'react'

// Types
export interface TableColumn<TData> {
  id: string
  header: string
  accessorKey?: keyof TData
  cell?: (row: TData) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: string
  isImage?: boolean
  imageAltKey?: keyof TData
  priority?: number // 1 = highest (always visible), 3 = lowest (hidden on mobile)
  hideOnMobile?: boolean
  hideOnTablet?: boolean
}

export interface TableFilter {
  id: string
  label: string
  type: 'text' | 'select' | 'boolean' | 'date' | 'relationship' | 'number'

  options?: Array<{ label: string; value: string }>
  placeholder?: string
  /** Controlled filter value (used by list pages) */
  value?: string
  /** Filter change handler (signatures vary by filter UI) */
  onChange?: (value: any) => void
  relationship?: {
    endpoint: string
    labelField: string
    valueField: string
    searchable?: boolean
  }
}

export interface TableConfig<TData> {
  columns: TableColumn<TData>[]
  filters?: TableFilter[]
  enableActions?: boolean
  enableDragDrop?: boolean
  enableSelection?: boolean | null
  userRole?: UserRole
  requiredRoleForEdit?: UserRole | UserRole[]
  requiredRoleForDelete?: UserRole | UserRole[]
  actions?: {
    onEdit?: (id: string) => void
    onDelete?: (id: string) => Promise<void>
    customActions?: Array<{
      label: string | ((row: TData) => string)
      icon?: React.ReactNode | ((row: TData) => React.ReactNode)
      /** Prefer ActionType; string allowed for table configs that infer literals as string */
      actionType?: import('@/lib/utils/actionColors').ActionType | string
      onClick: (row: TData) => void | Promise<void>
      variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
    }>
  }
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    pageSize: number
    onPageSizeChange: (size: number) => void
    totalItems: number
  }
  responsive?: {
    breakpoints?: {
      mobile: number
      tablet: number
      desktop: number
    }
    showMobileView?: boolean // Show card view on mobile
    stickyHeader?: boolean
  }
}

interface EnhancedDataTableProps<TData extends { _id: string }> {
  data: TData[]
  config: TableConfig<TData>
  isLoading?: boolean
  onSearch?: (search: string) => void
  onFilterChange?: (filters: Record<string, unknown>) => void
  className?: string
  onSelectionChange?: (selectedIds: string[]) => void
}

// Responsive Hook
function useResponsive () {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return { isMobile, isTablet }
}

// Image Cell Component
function ImageCell<TData> ({
  row,
  column
}: {
  row: TData
  column: TableColumn<TData>
}) {
  const imageUrl = (row as any)[column.id as string] as string
  const altKey = column.imageAltKey || 'name'
  const altText = ((row as any)[altKey as string] as string) || 'Image'

  const initials =
    altText
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??'

  if (!imageUrl) {
    return (
      <Avatar className='size-8'>
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    )
  }

  return (
    <Avatar className='size-8'>
      <AvatarImage src={imageUrl} alt={altText} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  )
}

// Mobile Card View Component
function MobileCardView<TData extends { _id: string }> ({
  item,
  columns,
  config
}: {
  item: TData
  columns: TableColumn<TData>[]
  config: TableConfig<TData>
}) {
  const canEdit = config.actions?.onEdit && (!config.requiredRoleForEdit || (config.userRole != null && hasPermission(config.userRole, config.requiredRoleForEdit)))
  const canDelete = config.actions?.onDelete && (!config.requiredRoleForDelete || (config.userRole != null && hasPermission(config.userRole, config.requiredRoleForDelete)))
  const visibleColumns = columns.filter(col => !col.hideOnMobile)
  const imageColumn = visibleColumns.find(col => col.isImage)
  const mainColumns = visibleColumns.filter(col => !col.isImage).slice(0, 2)
  const otherColumns = visibleColumns.filter(col => !col.isImage).slice(2)

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg border mb-3 p-4 shadow-sm'>
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-3'>
          {imageColumn && <ImageCell row={item} column={imageColumn} />}
          <div className='space-y-1'>
            {mainColumns.map(col => (
              <div key={col.id} className='text-sm font-medium'>
                {col.cell ? col.cell(item) : (item as any)[col.id] || 'N/A'}
              </div>
            ))}
          </div>
        </div>

        {(canEdit || canDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <IconDotsVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => config.actions!.onEdit!(item._id)}
                  className={getActionColor('edit').menuItem}
                >
                  <ActionIcon actionType='edit' size={16} className='mr-2' />
                  Edit
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => config.actions!.onDelete!(item._id)}
                  className={getActionColor('delete').menuItem}
                >
                  <ActionIcon actionType='delete' size={16} className='mr-2' />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className='grid grid-cols-2 gap-2 text-sm'>
        {otherColumns.map(col => (
          <div key={col.id} className='space-y-1'>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              {col.header}
            </div>
            <div className='font-medium truncate'>
              {col.cell ? col.cell(item) : (item as any)[col.id] || 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Drag Handle Component
function DragHandle ({ id }: { id: string }) {
  return (
    <Button
      variant='ghost'
      size='icon'
      className='text-muted-foreground size-7 hover:bg-transparent cursor-grab'
    >
      <IconGripVertical className='text-muted-foreground size-3' />
      <span className='sr-only'>Drag to reorder</span>
    </Button>
  )
}

export function EnhancedDataTable<TData extends { _id: string }> ({
  data,
  config,
  isLoading = false,
  onSearch,
  onFilterChange,
  className = '',
  onSelectionChange
}: EnhancedDataTableProps<TData>) {
  const { isMobile, isTablet } = useResponsive()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Record<string, unknown>>({})
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const lastSelectionRef = useRef<string>('')

  const canEdit =
    config.actions?.onEdit &&
    (!config.requiredRoleForEdit ||
      (config.userRole != null &&
        hasPermission(config.userRole, config.requiredRoleForEdit)))
  const canDelete =
    config.actions?.onDelete &&
    (!config.requiredRoleForDelete ||
      (config.userRole != null &&
        hasPermission(config.userRole, config.requiredRoleForDelete)))

  const columnsKey = useMemo(
    () =>
      config.columns
        .map(
          col =>
            `${col.id}:${col.hideOnMobile ? 1 : 0}:${col.hideOnTablet ? 1 : 0}`
        )
        .join('|'),
    [config.columns]
  )

  const isVisibilityEqual = (
    a: VisibilityState,
    b: VisibilityState
  ): boolean => {
    const aKeys = Object.keys(a)
    const bKeys = Object.keys(b)
    if (aKeys.length !== bKeys.length) return false
    return aKeys.every(key => a[key] === b[key])
  }

  // Auto-hide columns based on screen size
  useEffect(() => {
    const newVisibility: VisibilityState = {}
    config.columns.forEach(col => {
      if (isMobile && col.hideOnMobile) {
        newVisibility[col.id] = false
      } else if (isTablet && col.hideOnTablet) {
        newVisibility[col.id] = false
      } else {
        newVisibility[col.id] = true
      }
    })
    setColumnVisibility(prev =>
      isVisibilityEqual(prev, newVisibility) ? prev : newVisibility
    )
  }, [isMobile, isTablet, columnsKey])
  useEffect(() => {
    if (onSelectionChange && config.enableSelection) {
      const selectedIds = Object.keys(rowSelection)
        .filter(key => rowSelection[key as keyof typeof rowSelection])
        .map(key => {
          const index = parseInt(key)
          return data[index]?._id
        })
        .filter((id): id is string => !!id)

      const selectionKey = selectedIds.join('|')
      if (selectionKey !== lastSelectionRef.current) {
        lastSelectionRef.current = selectionKey
        onSelectionChange(selectedIds)
      }
    }
  }, [rowSelection, data, onSelectionChange, config.enableSelection])
  // Filter visible columns for current screen size
  const visibleColumns = config.columns.filter(col => {
    if (isMobile && col.hideOnMobile) return false
    if (isTablet && col.hideOnTablet) return false
    return true
  })

  // Transform columns for TanStack Table
  const columns: ColumnDef<TData>[] = [
    // Drag handle column (hidden on mobile)
    ...(!isMobile && config.enableDragDrop
      ? [
          {
            id: 'drag',
            header: () => null,
            cell: ({ row }) => <DragHandle id={row.original._id} />,
            size: 40
          } as ColumnDef<TData>
        ]
      : []),

    // Selection checkbox column (hidden on mobile)
    ...(!isMobile && config.enableSelection
      ? [
          {
            id: 'select',
            header: ({ table }) => (
              <div className='flex items-center justify-center'>
                <Checkbox
                  checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                  }
                  onCheckedChange={value =>
                    table.toggleAllPageRowsSelected(!!value)
                  }
                  aria-label='Select all'
                />
              </div>
            ),
            cell: ({ row }) => (
              <div className='flex items-center justify-center'>
                <Checkbox
                  checked={row.getIsSelected()}
                  onCheckedChange={value => row.toggleSelected(!!value)}
                  aria-label='Select row'
                />
              </div>
            ),
            size: 40
          } as ColumnDef<TData>
        ]
      : []),

    // Data columns
    ...visibleColumns.map(col => ({
      id: col.id,
      accessorKey: (col.accessorKey as string) || col.id,
      header: ({ column }: { column: any }) => (
        <div className='flex items-center gap-1'>
          <span>{col.header}</span>
          {col.sortable && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => {
                // Toggle sorting: asc -> desc -> none
                if (column.getIsSorted() === false) {
                  column.toggleSorting(false) // asc
                } else if (column.getIsSorted() === 'asc') {
                  column.toggleSorting(true) // desc
                } else {
                  column.clearSorting() // none
                }
              }}
              //   onClick={() =>
              //     column.toggleSorting(
              //       column.getIsSorted() === 'asc' ? 'desc' : 'asc'
              //     )
              //   }
              className='h-6 w-6 p-0'
            >
              {column.getIsSorted() === 'asc'
                ? '↑'
                : column.getIsSorted() === 'desc'
                ? '↓'
                : '↕'}
            </Button>
          )}
        </div>
      ),
      cell: col.cell
        ? ({ row }: { row: Row<TData> }) => col.cell!(row.original)
        : col.isImage
        ? ({ row }: { row: Row<TData> }) => (
            <ImageCell row={row.original} column={col} />
          )
        : ({ getValue }: { getValue: () => unknown }) => {
            const value = getValue()
            return (
              <div className='truncate max-w-full'>
                {value ? (value as React.ReactNode) : 'N/A'}
              </div>
            )
          },
      enableSorting: col.sortable && !isMobile,
      enableColumnFilter: col.filterable,
      size: col.width ? parseInt(col.width) : undefined,
      minSize: isMobile ? 100 : undefined
    })),

    // Actions column (only when user has at least one action)
    ...(config.enableActions &&
    (canEdit ||
      canDelete ||
      (config.actions?.customActions?.length ?? 0) > 0)
      ? [
          {
            id: 'actions',
            header: () => (
              <div className='sticky right-0 bg-gray-100 z-20 px-2'>
                Actions
              </div>
            ),
            cell: ({ row }) => (
              <div className='sticky right-0 z-20'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='ghost' size={isMobile ? 'sm' : 'icon'}>
                      {isMobile ? (
                        'Actions'
                      ) : (
                        <IconDotsVertical className='h-4 w-4' />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {canEdit && (
                      <DropdownMenuItem
                        onClick={() =>
                          config.actions!.onEdit!(row.original._id)
                        }
                        className={getActionColor('edit').menuItem}
                      >
                        <ActionIcon actionType='edit' size={16} className='mr-2' />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => setDeleteId(row.original._id)}
                        className={getActionColor('delete').menuItem}
                      >
                        <ActionIcon actionType='delete' size={16} className='mr-2' />
                        Delete
                      </DropdownMenuItem>
                    )}
                    {config.actions?.customActions?.map((action, idx) => {
                      const label =
                        typeof action.label === 'function'
                          ? action.label(row.original)
                          : action.label
                      const icon =
                        action.actionType != null ? (
                          <ActionIcon actionType={action.actionType} size={16} className='mr-2' />
                        ) : typeof action.icon === 'function'
                          ? action.icon(row.original)
                          : action.icon

                      return (
                        <DropdownMenuItem
                          key={String(label) + idx}
                          onClick={() => void action.onClick(row.original)}
                          className={action.actionType ? getActionColor(action.actionType).menuItem : undefined}
                        >
                          {icon}
                          {label}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
            size: isMobile ? 100 : 80
          } as ColumnDef<TData>
        ]
      : [])
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getPaginationRowModel: getPaginationRowModel()
  })

  const handleSearch = (value: string) => {
    console.log('🔍 DataTable Search Triggered:', value)
    // const cleaned = value
    //   .trim() // start/end spaces remove
    //   .replace(/\s+/g, ' ')

    setSearch(value)
    console.log('📤 Calling onSearch prop with:', value)
    onSearch?.(value)
  }

  const handleFilterChange = (id: string, value: unknown) => {
    const newFilters = { ...filters, [id]: value }
    const normalizedFilters = {
      ...newFilters,
      [id]: value === 'all' ? '' : value
    }
    setFilters(newFilters)
    onFilterChange?.(normalizedFilters)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
    setSearch('')
    if (onSearch) onSearch('')
    if (onFilterChange) onFilterChange({})
  }

  // Mobile View
  if (isMobile && config.responsive?.showMobileView) {
    return (
      <div className='space-y-4'>
        {/* Mobile Search and Actions */}
        <div className='space-y-3'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search...'
                value={search}
                onChange={e => handleSearch(e.target.value)}
                className='pl-10 h-11 enhanced-input'
              />
            </div>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setShowFilters(!showFilters)}
              className='h-10 w-10'
            >
              <IconFilter className='h-4 w-4' />
            </Button>
          </div>

          {/* Mobile Filters */}
          {showFilters && config.filters && (
            <div className='p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm font-medium'>Filters</span>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearFilters}
                  className='text-xs h-7'
                >
                  <IconX className='h-3 w-3 mr-1' /> Clear
                </Button>
              </div>
              <div className='space-y-2'>
                {config.filters.map(filter => (
                  <div key={filter.id}>
                    <Label className='text-xs mb-1 block'>{filter.label}</Label>
                    {filter.type === 'select' ? (
                      <Select
                        value={(filters[filter.id] as string) || 'all'}
                        onValueChange={value =>
                          handleFilterChange(filter.id, value)
                        }
                      >
                        <SelectTrigger
                          className='w-full h-9 enhanced-input'
                        >
                          <SelectValue placeholder={`Select ${filter.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>All</SelectItem>
                          {filter.options?.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder={filter.placeholder}
                        value={(filters[filter.id] as string) || ''}
                        onChange={e =>
                          handleFilterChange(filter.id, e.target.value)
                        }
                        className='enhanced-input h-11'
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Card View */}
        {isLoading ? (
          <div className='h-24 flex items-center justify-center'>
            <div className='flex flex-col items-center gap-3'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent'></div>
              <p className='text-sm text-muted-foreground'>Loading data...</p>
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className='space-y-2'>
            {data.map(item => (
              <MobileCardView
                key={item._id}
                item={item}
                columns={config.columns}
                config={config}
              />
            ))}
          </div>
        ) : (
          <div className='h-24 flex items-center justify-center text-gray-500 dark:text-gray-400'>
            No results found
          </div>
        )}

        {/* Mobile Pagination */}
        {config.pagination && (
          <div className='flex items-center justify-between pt-4'>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                config.pagination?.onPageChange(
                  config.pagination.currentPage - 1
                )
              }
              disabled={config.pagination.currentPage === 1}
              className='h-9'
            >
              <IconChevronLeft className='h-4 w-4' />
            </Button>
            <span className='text-sm font-medium'>
              Page {config.pagination.currentPage} of{' '}
              {config.pagination.totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                config.pagination?.onPageChange(
                  config.pagination.currentPage + 1
                )
              }
              disabled={
                config.pagination.currentPage === config.pagination.totalPages
              }
              className='h-9'
            >
              <IconChevronRight className='h-4 w-4' />
            </Button>
          </div>
        )}

        {/* Delete Confirmation */}
        <ConfirmModal
          open={!!deleteId}
          onOpenChange={open => !open && setDeleteId(null)}
          title='Delete Confirmation'
          description='Are you sure you want to delete this item? This action cannot be undone.'
          onConfirm={async () => {
            if (deleteId && config.actions?.onDelete) {
              await config.actions.onDelete(deleteId)
              setDeleteId(null)
            }
          }}
        />
      </div>
    )
  }

  // Desktop/Tablet View
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters - Responsive */}
      <div className='flex flex-col sm:flex-row gap-3 items-stretch'>
        {/* Search Input */}
        <div className='relative flex-1'>
          <IconSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500' />
          <Input
            placeholder='Search...'
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className='pl-10 h-11 enhanced-input'
          />
        </div>

        {/* Responsive Buttons Group */}
        <div className='flex gap-2 flex-wrap'>
          {/* Filters Toggle (Mobile/Tablet) */}
          {(isMobile || isTablet) && config.filters && (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
              className='flex items-center gap-1 h-10'
            >
              <IconFilter className='h-4 w-4' />
              {filters && Object.keys(filters).length > 0 && (
                <span className='bg-primary text-primary-foreground rounded-full size-5 text-xs flex items-center justify-center'>
                  {Object.keys(filters).length}
                </span>
              )}
            </Button>
          )}

          {/* Customize Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='h-10'>
                <IconLayoutColumns className='h-4 w-4' />
                {!isMobile && <span className='ml-2'>Columns</span>}
                <IconChevronDown className='ml-2 h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-56 max-h-80 overflow-y-auto scrollbar-hide'
            >
              <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  column =>
                    typeof column.accessorFn !== 'undefined' &&
                    column.getCanHide()
                )
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                    className='text-sm capitalize'
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Button */}
          {/* <Button variant='outline' size='sm' className='h-10'>
            <IconPlus className='h-4 w-4' />
            {!isMobile && <span className='ml-2'>Add</span>}
          </Button> */}

          {/* Clear Filters */}
          {(Object.keys(filters).length > 0 || search) && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='h-10'
            >
              <IconX className='h-4 w-4 mr-1' />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel (Mobile/Tablet) */}
      {showFilters && (isMobile || isTablet) && config.filters && (
        <div className='p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-sm font-medium'>Filters</span>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowFilters(false)}
              className='h-7'
            >
              <IconX className='h-3 w-3' />
            </Button>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            {config.filters.map(filter => (
              <div key={filter.id}>
                <Label className='text-sm mb-1.5 block'>{filter.label}</Label>
                {filter.type === 'select' ? (
                  <Select
                    value={(filters[filter.id] as string) || 'all'}
                    onValueChange={value =>
                      handleFilterChange(filter.id, value)
                    }
                  >
                    <SelectTrigger
                      className='w-full h-9 enhanced-input'
                    >
                      <SelectValue placeholder={`Select ${filter.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All</SelectItem>
                      {filter.options?.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder={filter.placeholder}
                    value={(filters[filter.id] as string) || ''}
                    onChange={e =>
                      handleFilterChange(filter.id, e.target.value)
                    }
                    className='enhanced-input h-11'
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters (Desktop) */}
      {!isMobile && !isTablet && config.filters && config.filters.length > 0 && (
        <div className='flex gap-2 flex-wrap'>
          {config.filters.map(filter => (
            <div key={filter.id} className={`${isTablet ? 'w-full' : 'w-40'}`}>
              {filter.type === 'select' ? (
                <Select
                  value={(filters[filter.id] as string) || 'all'}
                  onValueChange={value => handleFilterChange(filter.id, value)}
                >
                  <SelectTrigger
                    className='h-9 enhanced-input'
                  >
                    <SelectValue placeholder={filter.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All</SelectItem>
                    {filter.options
                      ?.filter(
                        option =>
                          option.value !== '' && option.value !== undefined
                      )
                      .map(option => (
                        <SelectItem
                          key={option.value}
                          value={String(option.value)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder={filter.placeholder || filter.label}
                  value={(filters[filter.id] as string) || ''}
                  onChange={e => handleFilterChange(filter.id, e.target.value)}
                  className='enhanced-input h-11'
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Table Container with Responsive Scroll */}
      <div className='rounded-md w-full border overflow-hidden'>
        <div className='overflow-x-auto scrollbar-hide'>
          <Table className='w-full min-w-[600px]'>
            <TableHeader className='bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border'>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow
                  key={headerGroup.id}
                  className='enhanced-table-row border-b border-border/50 hover:bg-primary/3'
                >
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      style={{
                        width: header.getSize(),
                        minWidth: isMobile ? '100px' : 'auto'
                      }}
                      className={`
                      ${
                        header.id === 'actions'
                          ? 'sticky right-0 bg-gray-100 z-30'
                          : ''
                      }
                      ${isMobile ? 'px-2' : 'px-4'}
                      ${
                        config.columns.find(c => c.id === header.id)
                          ?.hideOnMobile
                          ? 'hidden sm:table-cell'
                          : ''
                      }
                      ${
                        config.columns.find(c => c.id === header.id)
                          ?.hideOnTablet
                          ? 'hidden md:table-cell'
                          : ''
                      }
                    `}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    <div className='h-24 flex items-center justify-center'>
                      <div className='flex flex-col items-center gap-3'>
                        <div className='animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent'></div>
                        <p className='text-sm text-muted-foreground'>
                          Loading data...
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    key={row.id}
                    className='enhanced-table-row border-b border-border/50 hover:bg-primary/3'
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        style={{ width: cell.column.getSize() }}
                        className={`
                        ${
                          cell.column.id === 'actions'
                            ? 'sticky right-0 bg-background z-20'
                            : ''
                        }
                        ${isMobile ? 'px-2 py-3' : 'px-4 py-3'}
                        ${
                          config.columns.find(c => c.id === cell.column.id)
                            ?.hideOnMobile
                            ? 'hidden sm:table-cell'
                            : ''
                        }
                        ${
                          config.columns.find(c => c.id === cell.column.id)
                            ?.hideOnTablet
                            ? 'hidden md:table-cell'
                            : ''
                        }
                      `}
                      >
                        <div className='truncate max-w-full'>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center text-gray-500 dark:text-gray-400'
                  >
                    <div className='flex flex-col items-center justify-center gap-2'>
                      <div className='text-lg'>No results found</div>
                      {(Object.keys(filters).length > 0 || search) && (
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={clearFilters}
                          className='mt-2'
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* <ScrollBar orientation='horizontal' /> */}

      {/* Pagination - Responsive */}
      {config.pagination && (
        <div className='flex flex-col sm:flex-row gap-4 items-center justify-between px-2 sm:px-4'>
          <div className='text-muted-foreground text-sm order-2 sm:order-1'>
            {!isMobile && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </>
            )}
          </div>

          <div className='flex items-center gap-4 order-1 sm:order-2 w-full sm:w-auto'>
            {/* Rows per page (Desktop only) */}
            {!isMobile && (
              <div className='hidden sm:flex items-center gap-2'>
                <Label
                  htmlFor='rows-per-page'
                  className='text-sm font-medium whitespace-nowrap'
                >
                  Rows per page
                </Label>
                <Select
                  value={`${config.pagination.pageSize}`}
                  onValueChange={value => {
                    config.pagination?.onPageSizeChange(Number(value))
                  }}
                >
                  <SelectTrigger
                    size='sm'
                    className='w-20 enhanced-input'
                    id='rows-per-page'
                  >
                    <SelectValue placeholder={config.pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side='top'>
                    {[10, 20, 30, 40, 50].map(pageSize => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Page info */}
            <div className='flex-1 sm:flex-none text-center text-sm font-medium whitespace-nowrap'>
              Page {config.pagination.currentPage} of{' '}
              {config.pagination.totalPages}
            </div>

            {/* Pagination buttons */}
            <div className='flex items-center gap-1'>
              <Button
                variant='outline'
                className='hidden sm:flex size-8 p-0'
                onClick={() => config.pagination?.onPageChange(1)}
                disabled={config.pagination.currentPage === 1}
              >
                <span className='sr-only'>First page</span>
                <IconChevronsLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() =>
                  config.pagination?.onPageChange(
                    config.pagination.currentPage - 1
                  )
                }
                disabled={config.pagination.currentPage === 1}
              >
                <span className='sr-only'>Previous page</span>
                <IconChevronLeft className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                size='icon'
                className='size-8'
                onClick={() =>
                  config.pagination?.onPageChange(
                    config.pagination.currentPage + 1
                  )
                }
                disabled={
                  config.pagination.currentPage === config.pagination.totalPages
                }
              >
                <span className='sr-only'>Next page</span>
                <IconChevronRight className='h-4 w-4' />
              </Button>
              <Button
                variant='outline'
                className='hidden sm:flex size-8 p-0'
                size='icon'
                onClick={() =>
                  config.pagination?.onPageChange(config.pagination.totalPages)
                }
                disabled={
                  config.pagination.currentPage === config.pagination.totalPages
                }
              >
                <span className='sr-only'>Last page</span>
                <IconChevronsRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title='Delete Confirmation'
        description='Are you sure you want to delete this item? This action cannot be undone.'
        onConfirm={async () => {
          if (deleteId && config.actions?.onDelete) {
            await config.actions.onDelete(deleteId)
            setDeleteId(null)
          }
        }}
      />
    </div>
  )
}
