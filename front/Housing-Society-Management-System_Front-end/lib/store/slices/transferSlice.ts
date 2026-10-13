import { Transfer } from "@/lib/types/transfer.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TransferState {
  items: Transfer[];
  selectedTransfer: Transfer | null;
  filters: {
    page: number;
    limit: number;
    search: string;
    fileId?: string;
    sellerMemId?: string;
    buyerMemId?: string;
    transferTypeId?: string;
    status?: string;
    transferFeePaid?: boolean;
    transfIsAtt?: boolean;
    isActive?: boolean;
    fromDate?: string;
    toDate?: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  isLoading: boolean;
  error: string | null;
  statistics: any | null;
  dashboardSummary: any | null;
  pendingTransfers: Transfer[];
  overdueTransfers: Transfer[];
}

const initialState: TransferState = {
  items: [],
  selectedTransfer: null,
  filters: {
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  isLoading: false,
  error: null,
  statistics: null,
  dashboardSummary: null,
  pendingTransfers: [],
  overdueTransfers: [],
};

const transferSlice = createSlice({
  name: "transfers",
  initialState,
  reducers: {
    setTransfers: (state, action: PayloadAction<Transfer[]>) => {
      state.items = action.payload;
    },

    setSelectedTransfer: (state, action: PayloadAction<Transfer | null>) => {
      state.selectedTransfer = action.payload;
    },

    setFilters: (
      state,
      action: PayloadAction<Partial<TransferState["filters"]>>,
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setStatistics: (state, action: PayloadAction<any>) => {
      state.statistics = action.payload;
    },

    setDashboardSummary: (state, action: PayloadAction<any>) => {
      state.dashboardSummary = action.payload;
    },

    setPendingTransfers: (state, action: PayloadAction<Transfer[]>) => {
      state.pendingTransfers = action.payload;
    },

    setOverdueTransfers: (state, action: PayloadAction<Transfer[]>) => {
      state.overdueTransfers = action.payload;
    },

    updateTransferInList: (state, action: PayloadAction<Transfer>) => {
      const index = state.items.findIndex(
        (item) => item._id === action.payload._id,
      );
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedTransfer?._id === action.payload._id) {
        state.selectedTransfer = action.payload;
      }
    },

    removeTransferFromList: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
      if (state.selectedTransfer?._id === action.payload) {
        state.selectedTransfer = null;
      }
    },

    addTransferToList: (state, action: PayloadAction<Transfer>) => {
      state.items.unshift(action.payload);
    },

    clearTransfers: (state) => {
      state.items = [];
      state.selectedTransfer = null;
      state.statistics = null;
      state.dashboardSummary = null;
      state.pendingTransfers = [];
      state.overdueTransfers = [];
    },
  },
});

export const {
  setTransfers,
  setSelectedTransfer,
  setFilters,
  resetFilters,
  setLoading,
  setError,
  setStatistics,
  setDashboardSummary,
  setPendingTransfers,
  setOverdueTransfers,
  updateTransferInList,
  removeTransferFromList,
  addTransferToList,
  clearTransfers,
} = transferSlice.actions;

export default transferSlice.reducer;
