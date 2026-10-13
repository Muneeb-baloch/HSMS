// src/app/(dashboard)/permissions/statistics/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { useUserPermissionStatistics } from '@/lib/hooks/entities/useUserPermission'
import { AccessType } from '@/lib/types/userpermission'
import {
  ArrowLeft,
  BarChart3,
  PieChart as PieChartIcon,
  Shield
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { StatsPageSkeleton } from '@/components/shared/PageSkeleton'

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D'
]

export default function PermissionsStatisticsPage () {
  const router = useRouter()
  const { data: stats, isLoading } = useUserPermissionStatistics()

  if (isLoading) {
    return <StatsPageSkeleton />
  }

  // Prepare data for charts
  const accessTypeData = stats
    ? Object.entries(stats.byAccessType).map(([name, value]) => ({
        name,
        value
      }))
    : []

  const permissionDistributionData = stats
    ? [
        { name: 'Read', value: stats.permissionDistribution.read },
        { name: 'Create', value: stats.permissionDistribution.create },
        { name: 'Update', value: stats.permissionDistribution.update },
        { name: 'Delete', value: stats.permissionDistribution.delete },
        { name: 'Export', value: stats.permissionDistribution.export },
        { name: 'Import', value: stats.permissionDistribution.import },
        { name: 'Approve', value: stats.permissionDistribution.approve },
        { name: 'Verify', value: stats.permissionDistribution.verify }
      ]
    : []

  const moduleData = stats
    ? Object.entries(stats.byModule)
        .slice(0, 10)
        .map(([name, value]) => ({
          name: name.length > 15 ? name.substring(0, 15) + '...' : name,
          value
        }))
    : []

  return (
    <div className='space-y-1'>
      <Button variant='ghost' onClick={() => router.back()} className='mb-6'>
        <ArrowLeft className='mr-2 h-4 w-4' />
        Back
      </Button>

      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Permission Statistics</h1>
        <p className='text-gray-600'>
          Comprehensive overview of permission distribution and access patterns
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Total Permissions</div>
                <div className='text-3xl font-bold'>
                  {stats?.totalPermissions || 0}
                </div>
              </div>
              <div className='p-3 bg-blue-100 rounded-full'>
                <Shield className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>Active Permissions</div>
                <div className='text-3xl font-bold'>
                  {stats?.activePermissions || 0}
                </div>
              </div>
              <div className='p-3 bg-green-100 rounded-full'>
                <BarChart3 className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>
                  Modules with Permissions
                </div>
                <div className='text-3xl font-bold'>
                  {stats?.modulesWithPermissions || 0}
                </div>
              </div>
              <div className='p-3 bg-purple-100 rounded-full'>
                <PieChartIcon className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <div className='text-sm text-gray-500'>
                  Roles with Permissions
                </div>
                <div className='text-3xl font-bold'>
                  {stats?.rolesWithPermissions || 0}
                </div>
              </div>
              <div className='p-3 bg-orange-100 rounded-full'>
                <Shield className='h-6 w-6 text-orange-600' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Access Type Distribution */}
        <Card className='col-span-2'>
          <CardHeader>
            <CardTitle>Access Type Distribution</CardTitle>
            <CardDescription>
              Breakdown of permissions by access level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={accessTypeData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey='value' fill='#8884d8' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Permission Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Permission Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Pie
                      data={permissionDistributionData}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={entry => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill='#8884d8'
                      dataKey='value'
                    >
                      {permissionDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Modules */}
          <Card>
            <CardHeader>
              <CardTitle>Top Modules by Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='h-64'>
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart data={moduleData} layout='vertical'>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis type='number' />
                    <YAxis type='category' dataKey='name' width={80} />
                    <Tooltip />
                    <Bar dataKey='value' fill='#82ca9d' />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Stats */}
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {permissionDistributionData.map(item => (
              <div
                key={item.name}
                className='text-center p-4 bg-gray-50 rounded-lg'
              >
                <div className='text-2xl font-bold'>{item.value}</div>
                <div className='text-sm text-gray-600'>
                  {item.name} Permissions
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
