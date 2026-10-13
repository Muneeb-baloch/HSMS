// src/lib/store/slices/installmentSlice.ts
import { InstallmentStatus, InstallmentType, PaymentMode } from '@/lib/types/installment'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface InstallmentState {
  filters: {
    page: number
    limit: number
    search: string
    sortBy: string
    sortOrder: 'asc' | 'desc'
    fileId?: string
    memId?: string
    plotId?: string
    installmentCategoryId?: string
    status?: InstallmentStatus
    installmentType?: InstallmentType
    paymentMode?: PaymentMode
    fromDate?: string
    toDate?: string
    overdue?: boolean
  }
}

const initialState: InstallmentState = {
  filters: {
    page: 1,
    limit: 20,
    search: '',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  },
}

const installmentSlice = createSlice({
  name: 'installments',
  initialState,
  reducers: {
    setFilters: (
      state,
      action: PayloadAction<Partial<InstallmentState['filters']>>
    ) => {
      // Merge filters
      state.filters = { ...state.filters, ...action.payload }

      // Remove undefined values
      Object.keys(state.filters).forEach(key => {
        if ((state.filters as any)[key] === undefined) {
          delete (state.filters as any)[key]
        }
      })
    },
    resetFilters: state => {
      state.filters = { ...initialState.filters }
    },
  },
})

export const { setFilters, resetFilters } = installmentSlice.actions
export default installmentSlice.reducer
