// lib/hooks/entities/useAttendance.ts
import { attendanceApi } from "@/lib/API/attendanceApi";
import {
  AttendanceRecord,
  CheckInDto,
  CheckOutDto,
  AttendanceQueryParams,
  CreateGeofenceDto,
  UpdateGeofenceDto,
} from "@/lib/types/attendance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const ATTENDANCE_KEY = "attendance";
const GEOFENCE_KEY = "geofences";

// ── Attendance ────────────────────────────────────────────────

export const useCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CheckInDto): Promise<AttendanceRecord> => {
      const response = await attendanceApi.checkIn(data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to check in");
    },
    onSuccess: () => {
      customToast.success("Checked in successfully");
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to check in");
    },
  });
};

export const useCheckOut = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CheckOutDto;
    }): Promise<AttendanceRecord> => {
      const response = await attendanceApi.checkOut(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(response.data.message || "Failed to check out");
    },
    onSuccess: (data) => {
      customToast.success("Checked out successfully");
      queryClient.invalidateQueries({ queryKey: [ATTENDANCE_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ATTENDANCE_KEY, data._id],
      });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to check out");
    },
  });
};

export const useAttendanceRecords = (
  params: AttendanceQueryParams = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [ATTENDANCE_KEY, queryKeyString],
    queryFn: async () => {
      const response = await attendanceApi.getAll(params);
      if (response.data.success) {
        return {
          items: response.data.data.records,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch attendance records"
      );
    },
  });
};

export const useAttendanceRecord = (id: string) => {
  return useQuery({
    queryKey: [ATTENDANCE_KEY, id],
    queryFn: async () => {
      const response = await attendanceApi.getById(id);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch attendance record"
      );
    },
    enabled: !!id,
  });
};

export const useAttendanceSummary = (
  staffId: string,
  params: { fromDate?: string; toDate?: string } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [ATTENDANCE_KEY, "summary", "staff", staffId, queryKeyString],
    queryFn: async () => {
      const response = await attendanceApi.getSummary(staffId, params);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch attendance summary"
      );
    },
    enabled: !!staffId,
  });
};

export const useSocietyAttendanceSummary = (
  societyId: string,
  params: { fromDate?: string; toDate?: string } = {}
) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [
      ATTENDANCE_KEY,
      "summary",
      "society",
      societyId,
      queryKeyString,
    ],
    queryFn: async () => {
      const response = await attendanceApi.getSocietySummary(
        societyId,
        params
      );
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch society attendance summary"
      );
    },
    enabled: !!societyId,
  });
};

// ── Geofences ─────────────────────────────────────────────────

export const useGeofences = (societyId: string) => {
  return useQuery({
    queryKey: [GEOFENCE_KEY, societyId],
    queryFn: async () => {
      const response = await attendanceApi.getGeofences(societyId);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to fetch geofences"
      );
    },
    enabled: !!societyId,
  });
};

export const useCreateGeofence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGeofenceDto) => {
      const response = await attendanceApi.createGeofence(data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to create geofence"
      );
    },
    onSuccess: () => {
      customToast.success("Geofence created successfully");
      queryClient.invalidateQueries({ queryKey: [GEOFENCE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create geofence");
    },
  });
};

export const useUpdateGeofence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGeofenceDto;
    }) => {
      const response = await attendanceApi.updateGeofence(id, data);
      if (response.data.success) return response.data.data;
      throw new Error(
        response.data.message || "Failed to update geofence"
      );
    },
    onSuccess: () => {
      customToast.success("Geofence updated successfully");
      queryClient.invalidateQueries({ queryKey: [GEOFENCE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to update geofence");
    },
  });
};

export const useDeleteGeofence = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await attendanceApi.deleteGeofence(id);
      if (!response.data.success) {
        throw new Error(
          response.data.message || "Failed to delete geofence"
        );
      }
    },
    onSuccess: () => {
      customToast.success("Geofence deleted successfully");
      queryClient.invalidateQueries({ queryKey: [GEOFENCE_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to delete geofence");
    },
  });
};
