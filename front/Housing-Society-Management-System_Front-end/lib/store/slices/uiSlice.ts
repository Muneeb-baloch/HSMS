// src/store/slices/uiSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ModalState {
  isOpen: boolean;
  type: "create" | "edit" | "delete" | "info" | null;
  data: unknown;
  title: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

interface UIState {
  modal: ModalState;
  toasts: Toast[];
  isLoading: boolean;
  sidebarOpen: boolean;
}

const initialState: UIState = {
  modal: {
    isOpen: false,
    type: null,
    data: null,
    title: "",
  },
  toasts: [],
  isLoading: false,
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModal: (state, action: PayloadAction<Omit<ModalState, "isOpen">>) => {
      state.modal = {
        isOpen: true,
        ...action.payload,
      };
    },
    closeModal: (state) => {
      state.modal = initialState.modal;
    },
    addToast: (state, action: PayloadAction<Omit<Toast, "id">>) => {
      const id = Date.now().toString();
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(
        (toast) => toast.id !== action.payload
      );
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const {
  openModal,
  closeModal,
  addToast,
  removeToast,
  setLoading,
  toggleSidebar,
} = uiSlice.actions;
export default uiSlice.reducer;
