'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAnnouncementCategory } from '@/lib/hooks/entities/useAnnouncementCategory'
import { formatDate } from '@/lib/utils/format'
import { ArrowLeft, Edit, FileText } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { DetailPageSkeleton } from '@/components/shared/PageSkeleton'

export default function ViewAnnouncementCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: category, isLoading } = useAnnouncementCategory(id)

  if (isLoading) {
    return <DetailPageSkeleton />
  }

  if (!category) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Category Not Found</CardTitle>
            <CardDescription>The requested category does not exist or was deleted.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/announcementcategory')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Button onClick={() => router.push(`/announcementcategory/edit/${id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Category
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{category.categoryName}</CardTitle>
                  <CardDescription className="mt-2">
                    {category.description || 'No description provided'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={category.isActive ? 'success' : 'secondary'}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {category.isSystem && <Badge variant="outline">System</Badge>}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Display Properties</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">Color:</div>
                        {category.color && (
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                        )}
                        <span>{category.color || 'Not set'}</span>
                      </div>
                      <div>
                        <div className="font-medium">Icon:</div>
                        <div className="text-xl mt-1">{category.icon || '-'}</div>
                      </div>
                      <div>
                        <div className="font-medium">Priority:</div>
                        <div>{category.priority}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Usage & Status</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="font-medium">Announcements:</div>
                        <div>{category.announcementCount ?? 0}</div>
                      </div>
                      <div>
                        <div className="font-medium">System Category:</div>
                        <div>{category.isSystem ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-3">Audit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500">Created</div>
                    <div>{formatDate(category.createdAt)}</div>
                    {category.createdBy && (
                      <div className="text-gray-500 mt-1">
                        by {category.createdBy.fullName || category.createdBy.userName}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-500">Last Updated</div>
                    <div>{formatDate(category.updatedAt)}</div>
                    {category.updatedBy && (
                      <div className="text-gray-500 mt-1">
                        by {category.updatedBy.fullName || category.updatedBy.userName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/announcementcategory/edit/${id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Category
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/announcementcategory')}
              >
                <FileText className="mr-2 h-4 w-4" />
                View All Categories
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name</span>
                <span className="font-medium">{category.categoryName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant={category.isActive ? 'success' : 'secondary'}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Announcements</span>
                <span>{category.announcementCount ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Priority</span>
                <span>{category.priority}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
