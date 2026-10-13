// src/app/(dashboard)/installments/report/page.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGenerateReport } from '@/lib/hooks/entities/useInstallment'
import { formatCurrency } from '@/lib/utils/format'
import { Calendar, Download, Loader2, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function InstallmentReportPage () {
  const router = useRouter()
  const [params, setParams] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const { data: report, isLoading } = useGenerateReport({
    startDate: new Date(params.startDate),
    endDate: new Date(params.endDate)
  })

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    setParams(prev => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: value
    }))
  }

  const handleExport = () => {
    const csvData = [
      [
        'Date',
        'Category',
        'Installment',
        'Member',
        'Amount Due',
        'Amount Paid',
        'Balance',
        'Status'
      ],
      ...(report?.data || []).map(item => [
        new Date(item.dueDate).toLocaleDateString(),
        typeof item.installmentCategory === 'object'
          ? item.installmentCategory.instCatName
          : '',
        item.installmentTitle,
        typeof item.memId === 'object' ? item.memId.memName : '',
        item.amountDue.toString(),
        item.amountPaid.toString(),
        item.balanceAmount.toString(),
        item.status
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `installment-report-${params.startDate}-to-${params.endDate}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Installment Report</h1>
        <p className='text-muted-foreground'>
          Generate detailed reports for installments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Start Date
              </label>
              <input
                type='date'
                value={params.startDate}
                onChange={e => handleDateChange('start', e.target.value)}
                className='w-full px-3 py-2 border rounded-md'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-2'>End Date</label>
              <input
                type='date'
                value={params.endDate}
                onChange={e => handleDateChange('end', e.target.value)}
                className='w-full px-3 py-2 border rounded-md'
              />
            </div>
            <div className='flex items-end'>
              <Button
                onClick={() => window.location.reload()}
                className='w-full'
              >
                <Calendar className='mr-2 h-4 w-4' />
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </div>
      ) : report ? (
        <>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>
                      Total Installments
                    </div>
                    <div className='text-2xl font-bold'>
                      {report.summary.totalRecords}
                    </div>
                  </div>
                  <div className='p-3 bg-blue-100 rounded-full'>
                    <TrendingUp className='h-6 w-6 text-blue-600' />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm text-gray-500'>
                      Total Amount Due
                    </div>
                    <div className='text-2xl font-bold'>
                      {formatCurrency(report.summary.totalAmountDue)}
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
                    <div className='text-sm text-gray-500'>
                      Total Amount Paid
                    </div>
                    <div className='text-2xl font-bold text-green-600'>
                      {formatCurrency(report.summary.totalAmountPaid)}
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
                    <div className='text-sm text-gray-500'>Total Balance</div>
                    <div className='text-2xl font-bold text-red-600'>
                      {formatCurrency(report.summary.totalBalance)}
                    </div>
                  </div>
                  <div className='p-3 bg-red-100 rounded-full'>
                    <TrendingUp className='h-6 w-6 text-red-600' />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Export Button */}
          <div className='flex justify-end'>
            <Button onClick={handleExport}>
              <Download className='mr-2 h-4 w-4' />
              Export Report
            </Button>
          </div>

          {/* Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Installment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='px-4 py-3 text-left text-sm font-medium'>
                        Installment
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium'>
                        Member
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium'>
                        Due Date
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium'>
                        Amount Due
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium'>
                        Amount Paid
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium'>
                        Balance
                      </th>
                      <th className='px-4 py-3 text-left text-sm font-medium'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {report.data.map(item => (
                      <tr key={item._id}>
                        <td className='px-4 py-3'>
                          <div className='font-medium'>
                            {item.installmentTitle}
                          </div>
                          <div className='text-sm text-gray-500'>
                            #{item.installmentNo} - {item.installmentType}
                          </div>
                        </td>
                        <td className='px-4 py-3'>
                          {typeof item.memId === 'object'
                            ? item.memId.memName
                            : 'Member'}
                        </td>
                        <td className='px-4 py-3'>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </td>
                        <td className='px-4 py-3 font-medium'>
                          {formatCurrency(item.amountDue)}
                        </td>
                        <td className='px-4 py-3 text-green-600'>
                          {formatCurrency(item.amountPaid)}
                        </td>
                        <td className='px-4 py-3 text-red-600'>
                          {formatCurrency(item.balanceAmount)}
                        </td>
                        <td className='px-4 py-3'>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.status === 'Paid'
                                ? 'bg-green-100 text-green-800'
                                : item.status === 'Overdue'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className='py-12 text-center'>
            <div className='text-gray-500'>
              No data available. Generate a report to see details.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
