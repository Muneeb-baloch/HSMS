'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { hasPermission, UserRole } from '@/lib/constants/roles'
import {
  useCreateLookupValue,
  useDeleteLookupValue,
  useLookupByCategory,
  useUpdateLookupValue,
} from '@/lib/hooks/entities/useLookup'
import { useAuth } from '@/lib/hooks/useAuth'
import {
  CATEGORY_LABELS,
  LookupCategory,
  LookupValue,
} from '@/lib/types/lookup'
import { customToast } from '@/lib/utils/customToast'
import {
  Edit2,
  GripVertical,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { InlineSkeleton } from '@/components/shared/PageSkeleton'
import { useConfirm } from "@/components/shared/ConfirmDialog";

export default function LookupsPage() {
  const { user } = useAuth()
  const { confirm } = useConfirm();
  const [selectedCategory, setSelectedCategory] = useState<LookupCategory>(
    LookupCategory.PROJECT_STATUS
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{
    label: string
    code: string
    colorCode: string
    description: string
  }>({ label: '', code: '', colorCode: '#6B7280', description: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    label: '',
    code: '',
    colorCode: '#6B7280',
    description: '',
  })

  const { data: values, isLoading } = useLookupByCategory(selectedCategory)
  const createMutation = useCreateLookupValue()
  const updateMutation = useUpdateLookupValue()
  const deleteMutation = useDeleteLookupValue()

  const canManage =
    user &&
    hasPermission(user.role as UserRole, [
      UserRole.ADMIN,
      UserRole.SUPER_ADMIN,
    ])

  const canDelete =
    user &&
    hasPermission(user.role as UserRole, [UserRole.SUPER_ADMIN])

  const handleEdit = (item: LookupValue) => {
    setEditingId(item._id)
    setEditForm({
      label: item.label,
      code: item.code,
      colorCode: item.colorCode || '#6B7280',
      description: item.description || '',
    })
  }

  const handleSave = async () => {
    if (!editingId) return
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: editForm,
      })
      setEditingId(null)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCreate = async () => {
    if (!newItem.label || !newItem.code) {
      customToast.error('Label and Code are required')
      return
    }
    try {
      await createMutation.mutateAsync({
        ...newItem,
        category: selectedCategory,
        sequence: (values?.length || 0) + 1,
      })
      setIsAdding(false)
      setNewItem({ label: '', code: '', colorCode: '#6B7280', description: '' })
    } catch {
      // Error handled by mutation
    }
  }

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      customToast.error('System values cannot be deleted')
      return
    }
    if (await confirm({ title: "Delete", description: 'Are you sure you want to delete this lookup value?', variant: "destructive" })) {
      try {
        await deleteMutation.mutateAsync(id)
      } catch {
        // Error handled by mutation
      }
    }
  }

  const categories = Object.values(LookupCategory)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Lookup Tables Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage configurable lookup values used across the system (statuses,
          types, categories)
        </p>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1 max-w-sm">
          <label className="text-sm font-medium mb-1 block">Category</label>
          <Select
            value={selectedCategory}
            onValueChange={(v) => setSelectedCategory(v as LookupCategory)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {canManage && (
          <Button onClick={() => setIsAdding(true)} disabled={isAdding}>
            <Plus className="h-4 w-4 mr-2" />
            Add Value
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{CATEGORY_LABELS[selectedCategory]}</CardTitle>
          <CardDescription>
            {values?.length || 0} values configured. System values cannot be
            deleted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <InlineSkeleton />
          ) : (
            <div className="space-y-2">
              {/* Add new item row */}
              {isAdding && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Input
                    placeholder="Code (e.g., NEW_STATUS)"
                    value={newItem.code}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        code: e.target.value.toUpperCase().replace(/\s+/g, '_'),
                      })
                    }
                    className="w-40"
                  />
                  <Input
                    placeholder="Label (e.g., New Status)"
                    value={newItem.label}
                    onChange={(e) =>
                      setNewItem({ ...newItem, label: e.target.value })
                    }
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={newItem.colorCode}
                    onChange={(e) =>
                      setNewItem({ ...newItem, colorCode: e.target.value })
                    }
                    className="w-10 h-9 rounded border cursor-pointer"
                  />
                  <Input
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    onClick={handleCreate}
                    disabled={createMutation.isPending}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsAdding(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Existing values */}
              {values && values.length > 0 ? (
                values.map((item: LookupValue) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

                    {editingId === item._id ? (
                      <>
                        <Input
                          value={editForm.code}
                          onChange={(e) =>
                            setEditForm({ ...editForm, code: e.target.value })
                          }
                          className="w-40"
                        />
                        <Input
                          value={editForm.label}
                          onChange={(e) =>
                            setEditForm({ ...editForm, label: e.target.value })
                          }
                          className="flex-1"
                        />
                        <input
                          type="color"
                          value={editForm.colorCode}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              colorCode: e.target.value,
                            })
                          }
                          className="w-10 h-9 rounded border cursor-pointer"
                        />
                        <Input
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={updateMutation.isPending}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="w-40">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {item.code}
                          </code>
                        </div>

                        <div className="flex-1 flex items-center gap-2">
                          {item.colorCode && (
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: item.colorCode }}
                            />
                          )}
                          <span className="font-medium">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                          {item.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              System
                            </Badge>
                          )}
                          {!item.isActive && (
                            <Badge
                              variant="destructive"
                              className="text-xs"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>

                        <span className="text-sm text-muted-foreground w-8 text-center">
                          #{item.sequence}
                        </span>

                        {canManage && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(item)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            {canDelete && !item.isSystem && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleDelete(item._id, item.isSystem)
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No lookup values found for this category. Click "Add Value"
                  to create one.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
