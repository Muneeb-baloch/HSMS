# Action Icons & Button Color Migration Guide

This guide helps migrate remaining pages to use the new action icon color system.

## Components Created

### 1. ActionIcon (`@/components/ui/ActionIcon`)
- Use for row-level action icons (Edit, Delete, View, etc.)
- Props: `actionType`, `size`, `className`, `onClick`, `disabled`, `title`, `variant` ('icon' | 'circular')

### 2. actionColors Utility (`@/lib/utils/actionColors`)
- `getActionColor(actionType)` - returns icon, iconHover, bg, bgHover, menuItem classes
- `getActionIconClasses(actionType)` - returns Tailwind classes for icons in dropdowns
- `addButtonClasses`, `exportButtonClasses`, `importButtonClasses` - for top-level buttons

### 3. ActionButton (`@/components/ui/ActionButton`)
- Use for top-level toolbar buttons (Add, Export, Import)
- Props: `actionType`, `children`, `icon`, `variant`, `size`, etc.

## DataTable customActions - Use actionType Instead of icon

**Before:**
```tsx
customActions: [
  { label: 'View Details', icon: <span>👁️</span>, onClick: ... },
]
```

**After:**
```tsx
customActions: [
  { label: 'View Details', actionType: 'view', onClick: ... },
]
```

### actionType Mapping
| Action | actionType |
|--------|------------|
| View / Details | `'view'` |
| Edit | (handled by onEdit) |
| Delete | (handled by onDelete) |
| Add | `'add'` |
| Transfer / Exchange | `'transfer'` |
| Possession / Handover | `'possession'` |
| Print / Export / Download | `'print'` / `'export'` / `'download'` |
| Import | `'import'` |
| Record Payment / Paid | `'paid'` |
| Toggle Active / Status | `'toggle'` |
| Approve / Confirm | `'approve'` |
| Complaints / Alert | `'complaint'` / `'alert'` |
| Cancel / Reject | `'cancel'` / `'reject'` |

## Add Button Styling (Top-level toolbar)

**Before:**
```tsx
<Button variant='primary' size='sm' onClick={handleCreate}>
  <Plus className='size-4' />
  Add Project
</Button>
```

**After:**
```tsx
<Button
  variant='default'
  size='sm'
  onClick={handleCreate}
  className='bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200'
>
  <Plus className='size-4' />
  Add Project
</Button>
```

## Export/Import Button Styling

```tsx
<Button
  variant='outline'
  size='sm'
  onClick={handleExport}
  className='border-sky-500/50 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-400/60 transition-all'
>
  <Download className='size-4' />
  Export
</Button>
```

## Pages to Update (remaining)

Run search for `icon: <span>` and replace with `actionType: 'X'` where X matches the action:
- plots/page.tsx - view, possession, approve
- installments/page.tsx - view, paid, approve
- members/page.tsx - view
- possessions/page.tsx - view, toggle
- And others listed in grep results
