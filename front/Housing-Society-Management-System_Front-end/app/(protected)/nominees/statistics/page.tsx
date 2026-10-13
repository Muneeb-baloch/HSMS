// src/app/(dashboard)/nominees/statistics/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useMembersWithoutFullCoverage,
  useNomineeStatistics,
  useShareDistribution
} from '@/lib/hooks/entities/useNominee'
import { Download, PieChart, TrendingUp, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

export default function NomineeStatisticsPage () {
  const router = useRouter()
  const { data: statistics } = useNomineeStatistics()
  const { data: distribution } = useShareDistribution()
  const { data: membersWithoutCoverage } = useMembersWithoutFullCoverage()

  const handleExport = () => {
    const csvData = [
      ['Statistic', 'Value'],
      ['Total Nominees', statistics?.totalNominees || 0],
      ['Active Nominees', statistics?.activeNominees || 0],
      ['Inactive Nominees', statistics?.inactiveNominees || 0],
      ['Average Share %', statistics?.averageSharePercentage.toFixed(1) || 0],
      [
        'Members with Multiple Nominees',
        statistics?.membersWithMultipleNominees || 0
      ]
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nominee-statistics-${
      new Date().toISOString().split('T')[0]
    }.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884D8',
    '#82CA9D'
  ]

  const relationData =
    statistics?.topRelations.map(rel => ({
      name: rel.relation,
      value: rel.count,
      averageShare: rel.averageShare
    })) || []

  return (
    <div className='p-6 space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold'>Nominee Statistics</h1>
          <p className='text-muted-foreground'>
            Comprehensive statistics and insights about nominees
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline' onClick={handleExport}>
            <Download className='mr-2 h-4 w-4' />
            Export Report
          </Button>
          <Button onClick={() => router.push('/nominees')}>
            <Users className='mr-2 h-4 w-4' />
            Back to Nominees
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      {statistics && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Total Nominees</div>
                  <div className='text-2xl font-bold'>
                    {statistics.totalNominees}
                  </div>
                </div>
                <div className='p-3 bg-blue-100 rounded-full'>
                  <Users className='h-6 w-6 text-blue-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Active Nominees</div>
                  <div className='text-2xl font-bold text-green-600'>
                    {statistics.activeNominees}
                  </div>
                </div>
                <div className='p-3 bg-green-100 rounded-full'>
                  <TrendingUp className='h-6 w-6 text-green-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Average Share</div>
                  <div className='text-2xl font-bold text-purple-600'>
                    {statistics.averageSharePercentage.toFixed(1)}%
                  </div>
                </div>
                <div className='p-3 bg-purple-100 rounded-full'>
                  <PieChart className='h-6 w-6 text-purple-600' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-sm text-gray-500'>Multiple Nominees</div>
                  <div className='text-2xl font-bold text-orange-600'>
                    {statistics.membersWithMultipleNominees}
                  </div>
                </div>
                <div className='p-3 bg-orange-100 rounded-full'>
                  <Users className='h-6 w-6 text-orange-600' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Relation Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <PieChart className='h-5 w-5' />
              Relation Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <RechartsPieChart>
                  <Pie
                    data={relationData}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {relationData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value} nominees (${(
                        (props.payload.percent || 0) * 100
                      ).toFixed(1)}%)`,
                      'Count'
                    ]}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Members Without Full Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Members Without Full Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Member Name
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Total Share
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Nominees
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {membersWithoutCoverage?.slice(0, 10).map(member => (
                    <tr key={member.memberId}>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{member.memberName}</div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='text-xl font-bold text-red-600'>
                          {member.totalShare}%
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>
                          {member.nomineesCount}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <Button
                          size='sm'
                          onClick={() =>
                            router.push(`/nominees/member/${member.memberId}`)
                          }
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='mt-4 text-center'>
              <Button
                variant='outline'
                onClick={() =>
                  router.push(
                    '/nominees?sortBy=nomineeSharePercentage&sortOrder=asc'
                  )
                }
              >
                View All Members
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Share Distribution */}
      {distribution && distribution.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Members by Nominee Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Member Name
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Total Nominees
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Total Share
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Nominees
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-medium'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {distribution.map(item => (
                    <tr key={item.memberId}>
                      <td className='px-4 py-3'>
                        <div className='font-medium'>{item.memberName}</div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='text-xl font-bold'>
                          {item.totalNominees}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div
                          className={`text-xl font-bold ${
                            item.totalSharePercentage === 100
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {item.totalSharePercentage}%
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='text-sm'>
                          {item.nominees.map((nominee, index) => (
                            <div
                              key={index}
                              className='flex items-center gap-2 py-1'
                            >
                              <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                              <span>
                                {nominee.name} ({nominee.relation}) -{' '}
                                {nominee.share}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <Button
                          size='sm'
                          onClick={() =>
                            router.push(`/nominees/member/${item.memberId}`)
                          }
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
