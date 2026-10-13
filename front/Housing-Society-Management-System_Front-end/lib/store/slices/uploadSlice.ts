// frontend/src/lib/upload/store/uploadSlice.ts

import { uploadApi } from "@/lib/API/upload-api";
import {
  EntityType,
  UploadedFile,
  UploadState,
} from "@/lib/types/upload.types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: UploadState = {
  files: [],
  loading: false,
  error: null,
  uploadProgress: {},
  uploadingFiles: [],
};

// Async thunks
export const fetchFilesByEntity = createAsyncThunk(
  "upload/fetchFilesByEntity",
  async ({
    entityType,
    entityId,
  }: {
    entityType: EntityType;
    entityId: string;
  }) => {
    const response = await uploadApi.getFilesByEntity(entityType, entityId);
    return response;
  },
);

export const uploadFile = createAsyncThunk(
  "upload/uploadFile",
  async (
    data: {
      file: File;
      entityType: EntityType;
      entityId: string;
      uploadedBy: string;
      metadata?: any;
    },
    { dispatch },
  ) => {
    const result = await uploadApi.uploadSingle({
      entityType: data.entityType,
      entityId: data.entityId,
      uploadedBy: data.uploadedBy,
      file: data.file,
      metadata: data.metadata,
    });

    dispatch(addFile(result));
    return result;
  },
  {
    condition: (data, { getState }) => {
      const state = getState() as { upload: UploadState };
      const isUploading = state.upload.uploadingFiles.includes(data.file.name);
      return !isUploading;
    },
  },
);

export const uploadMultipleFiles = createAsyncThunk(
  "upload/uploadMultipleFiles",
  async (
    data: {
      files: File[];
      entityType: EntityType;
      entityId: string;
      uploadedBy: string;
      metadata?: any;
    },
    { dispatch },
  ) => {
    const results = await uploadApi.uploadMultiple(data.files, {
      entityType: data.entityType,
      entityId: data.entityId,
      uploadedBy: data.uploadedBy,
      metadata: data.metadata,
    });

    dispatch(addFiles(results));
    return results;
  },
);

export const deleteFile = createAsyncThunk(
  "upload/deleteFile",
  async (
    { id, deletedBy }: { id: string; deletedBy: string },
    { dispatch },
  ) => {
    await uploadApi.deleteFile(id, deletedBy);
    dispatch(removeFile(id));
    return id;
  },
);

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    setFiles: (state, action: PayloadAction<UploadedFile[]>) => {
      state.files = action.payload;
    },
    addFile: (state, action: PayloadAction<UploadedFile>) => {
      state.files.unshift(action.payload);
    },
    addFiles: (state, action: PayloadAction<UploadedFile[]>) => {
      state.files = [...action.payload, ...state.files];
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter((file) => file._id !== action.payload);
    },
    updateFile: (state, action: PayloadAction<UploadedFile>) => {
      const index = state.files.findIndex(
        (file) => file._id === action.payload._id,
      );
      if (index !== -1) {
        state.files[index] = action.payload;
      }
    },
    setUploadProgress: (
      state,
      action: PayloadAction<{ fileName: string; progress: number }>,
    ) => {
      state.uploadProgress[action.payload.fileName] = action.payload.progress;
    },
    addUploadingFile: (state, action: PayloadAction<string>) => {
      if (!state.uploadingFiles.includes(action.payload)) {
        state.uploadingFiles.push(action.payload);
      }
    },
    removeUploadingFile: (state, action: PayloadAction<string>) => {
      state.uploadingFiles = state.uploadingFiles.filter(
        (name) => name !== action.payload,
      );
    },
    clearUploadProgress: (state, action: PayloadAction<string>) => {
      delete state.uploadProgress[action.payload];
    },
    resetUploadState: () => initialState,
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilesByEntity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilesByEntity.fulfilled, (state, action) => {
        state.loading = false;
        state.files = action.payload;
      })
      .addCase(fetchFilesByEntity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch files";
      })
      .addCase(uploadFile.pending, (state, action) => {
        const { file } = action.meta.arg;
        state.uploadingFiles.push(file.name);
        state.uploadProgress[file.name] = 0;
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        const { file } = action.meta.arg;
        state.uploadingFiles = state.uploadingFiles.filter(
          (name) => name !== file.name,
        );
        state.uploadProgress[file.name] = 100;

        // Clear progress after 2 seconds
        setTimeout(() => {
          delete state.uploadProgress[file.name];
        }, 2000);
      })
      .addCase(uploadFile.rejected, (state, action) => {
        const { file } = action.meta.arg;
        state.uploadingFiles = state.uploadingFiles.filter(
          (name) => name !== file.name,
        );
        state.error = action.error.message || "Upload failed";
      })
      .addCase(uploadMultipleFiles.pending, (state, action) => {
        const { files } = action.meta.arg;
        files.forEach((file) => {
          state.uploadingFiles.push(file.name);
          state.uploadProgress[file.name] = 0;
        });
      })
      .addCase(uploadMultipleFiles.fulfilled, (state, action) => {
        const { files } = action.meta.arg;
        files.forEach((file) => {
          state.uploadingFiles = state.uploadingFiles.filter(
            (name) => name !== file.name,
          );
          state.uploadProgress[file.name] = 100;

          // Clear progress after 2 seconds
          setTimeout(() => {
            delete state.uploadProgress[file.name];
          }, 2000);
        });
      })
      .addCase(uploadMultipleFiles.rejected, (state, action) => {
        const { files } = action.meta.arg;
        files.forEach((file) => {
          state.uploadingFiles = state.uploadingFiles.filter(
            (name) => name !== file.name,
          );
        });
        state.error = action.error.message || "Upload failed";
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.error.message || "Delete failed";
      });
  },
});

export const {
  setFiles,
  addFile,
  addFiles,
  removeFile,
  updateFile,
  setUploadProgress,
  addUploadingFile,
  removeUploadingFile,
  clearUploadProgress,
  resetUploadState,
  clearError,
} = uploadSlice.actions;

export default uploadSlice.reducer;
