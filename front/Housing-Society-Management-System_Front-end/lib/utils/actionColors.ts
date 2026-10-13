/**
 * Action color mapping for HSMS - premium dark theme friendly
 * Use these classes for action icons and buttons across the app
 */
export type ActionType =
  | 'edit'
  | 'view'
  | 'delete'
  | 'add'
  | 'transfer'
  | 'possession'
  | 'print'
  | 'export'
  | 'download'
  | 'import'
  | 'complaint'
  | 'alert'
  | 'warning'
  | 'approve'
  | 'confirm'
  | 'paid'
  | 'cancel'
  | 'reject'
  | 'refresh'
  | 'toggle'
  | 'default'

export interface ActionColorClasses {
  /** Icon/text color - for icons inside buttons or inline */
  icon: string
  /** Hover icon color */
  iconHover: string
  /** Background for filled/circular buttons */
  bg?: string
  /** Hover background */
  bgHover?: string
  /** Dropdown menu item class */
  menuItem?: string
}

const actionColorMap: Record<ActionType, ActionColorClasses> = {
  edit: {
    icon: 'text-teal-400',
    iconHover: 'hover:text-teal-300 group-hover:text-teal-300',
    bg: 'bg-teal-500/20',
    bgHover: 'hover:bg-teal-500/30',
    menuItem: 'focus:bg-teal-500/20 focus:text-teal-300',
  },
  view: {
    icon: 'text-blue-400',
    iconHover: 'hover:text-blue-300 group-hover:text-blue-300',
    bg: 'bg-blue-500/20',
    bgHover: 'hover:bg-blue-500/30',
    menuItem: 'focus:bg-blue-500/20 focus:text-blue-300',
  },
  delete: {
    icon: 'text-red-400',
    iconHover: 'hover:text-red-300 group-hover:text-red-300',
    bg: 'bg-red-500/20',
    bgHover: 'hover:bg-red-500/30',
    menuItem: 'focus:bg-red-500/20 focus:text-red-400',
  },
  add: {
    icon: 'text-emerald-400',
    iconHover: 'hover:text-emerald-300 group-hover:text-emerald-300',
    bg: 'bg-emerald-500/20',
    bgHover: 'hover:bg-emerald-500/30',
    menuItem: 'focus:bg-emerald-500/20 focus:text-emerald-300',
  },
  transfer: {
    icon: 'text-purple-400',
    iconHover: 'hover:text-purple-300 group-hover:text-purple-300',
    bg: 'bg-purple-500/20',
    bgHover: 'hover:bg-purple-500/30',
    menuItem: 'focus:bg-purple-500/20 focus:text-purple-300',
  },
  possession: {
    icon: 'text-amber-400',
    iconHover: 'hover:text-amber-300 group-hover:text-amber-300',
    bg: 'bg-amber-500/20',
    bgHover: 'hover:bg-amber-500/30',
    menuItem: 'focus:bg-amber-500/20 focus:text-amber-300',
  },
  print: {
    icon: 'text-sky-400',
    iconHover: 'hover:text-sky-300 group-hover:text-sky-300',
    bg: 'bg-sky-500/20',
    bgHover: 'hover:bg-sky-500/30',
    menuItem: 'focus:bg-sky-500/20 focus:text-sky-300',
  },
  export: {
    icon: 'text-sky-400',
    iconHover: 'hover:text-sky-300 group-hover:text-sky-300',
    bg: 'bg-sky-500/20',
    bgHover: 'hover:bg-sky-500/30',
    menuItem: 'focus:bg-sky-500/20 focus:text-sky-300',
  },
  download: {
    icon: 'text-sky-400',
    iconHover: 'hover:text-sky-300 group-hover:text-sky-300',
    bg: 'bg-sky-500/20',
    bgHover: 'hover:bg-sky-500/30',
    menuItem: 'focus:bg-sky-500/20 focus:text-sky-300',
  },
  import: {
    icon: 'text-sky-400',
    iconHover: 'hover:text-sky-300 group-hover:text-sky-300',
    bg: 'bg-sky-500/20',
    bgHover: 'hover:bg-sky-500/30',
    menuItem: 'focus:bg-sky-500/20 focus:text-sky-300',
  },
  complaint: {
    icon: 'text-rose-400',
    iconHover: 'hover:text-rose-300 group-hover:text-rose-300',
    bg: 'bg-rose-500/20',
    bgHover: 'hover:bg-rose-500/30',
    menuItem: 'focus:bg-rose-500/20 focus:text-rose-300',
  },
  alert: {
    icon: 'text-rose-400',
    iconHover: 'hover:text-rose-300 group-hover:text-rose-300',
    bg: 'bg-rose-500/20',
    bgHover: 'hover:bg-rose-500/30',
    menuItem: 'focus:bg-rose-500/20 focus:text-rose-300',
  },
  warning: {
    icon: 'text-amber-400',
    iconHover: 'hover:text-amber-300 group-hover:text-amber-300',
    bg: 'bg-amber-500/20',
    bgHover: 'hover:bg-amber-500/30',
    menuItem: 'focus:bg-amber-500/20 focus:text-amber-300',
  },
  approve: {
    icon: 'text-lime-400',
    iconHover: 'hover:text-lime-300 group-hover:text-lime-300',
    bg: 'bg-lime-500/20',
    bgHover: 'hover:bg-lime-500/30',
    menuItem: 'focus:bg-lime-500/20 focus:text-lime-300',
  },
  confirm: {
    icon: 'text-lime-400',
    iconHover: 'hover:text-lime-300 group-hover:text-lime-300',
    bg: 'bg-lime-500/20',
    bgHover: 'hover:bg-lime-500/30',
    menuItem: 'focus:bg-lime-500/20 focus:text-lime-300',
  },
  paid: {
    icon: 'text-emerald-400',
    iconHover: 'hover:text-emerald-300 group-hover:text-emerald-300',
    bg: 'bg-emerald-500/20',
    bgHover: 'hover:bg-emerald-500/30',
    menuItem: 'focus:bg-emerald-500/20 focus:text-emerald-300',
  },
  cancel: {
    icon: 'text-slate-400',
    iconHover: 'hover:text-red-400 group-hover:text-red-400',
    bg: 'bg-slate-600/30',
    bgHover: 'hover:bg-red-500/20',
    menuItem: 'focus:bg-slate-600/30 focus:text-slate-300',
  },
  reject: {
    icon: 'text-red-400',
    iconHover: 'hover:text-red-300 group-hover:text-red-300',
    bg: 'bg-red-500/20',
    bgHover: 'hover:bg-red-500/30',
    menuItem: 'focus:bg-red-500/20 focus:text-red-400',
  },
  refresh: {
    icon: 'text-indigo-400',
    iconHover: 'hover:text-indigo-300 group-hover:text-indigo-300',
    bg: 'bg-indigo-500/20',
    bgHover: 'hover:bg-indigo-500/30',
    menuItem: 'focus:bg-indigo-500/20 focus:text-indigo-300',
  },
  toggle: {
    icon: 'text-violet-400',
    iconHover: 'hover:text-violet-300 group-hover:text-violet-300',
    bg: 'bg-violet-500/20',
    bgHover: 'hover:bg-violet-500/30',
    menuItem: 'focus:bg-violet-500/20 focus:text-violet-300',
  },
  default: {
    icon: 'text-muted-foreground',
    iconHover: 'hover:text-foreground group-hover:text-foreground',
    bg: 'bg-muted/30',
    bgHover: 'hover:bg-muted/50',
    menuItem: 'focus:bg-muted/50',
  },
}

export function getActionColor(actionType: ActionType): ActionColorClasses {
  return actionColorMap[actionType] ?? actionColorMap.default
}

/** Tailwind classes for icon in dropdown menu item */
export function getActionIconClasses(actionType: ActionType): string {
  const c = getActionColor(actionType)
  return `${c.icon} mr-2 h-4 w-4 transition-colors ${c.iconHover}`
}

/** Tailwind classes for top-level Add button (emerald gradient) */
export const addButtonClasses =
  'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200'

/** Tailwind classes for Export/Download button (sky) */
export const exportButtonClasses =
  'border-sky-500/50 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-400/60 transition-all'

/** Tailwind classes for Import button (sky) */
export const importButtonClasses =
  'border-sky-500/50 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300 hover:border-sky-400/60 transition-all'
