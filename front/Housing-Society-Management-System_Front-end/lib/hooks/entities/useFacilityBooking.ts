// lib/hooks/entities/useFacilityBooking.ts
import { apiClient } from "@/lib/API/client";
import { PaginatedResponse } from "@/lib/types/api";
import {
  BookingQueryParams,
  BookingStats,
  CreateBookingDto,
  FacilityBooking,
  TimeSlot,
} from "@/lib/types/facility";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customToast } from "@/lib/utils/customToast";

const QUERY_KEY = "facility-bookings";

export const useFacilityBookings = (params: BookingQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 10;

      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      if (params.facilityId) queryParams.facilityId = params.facilityId;
      if (params.memberId) queryParams.memberId = params.memberId;
      if (params.status) queryParams.status = params.status;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get<{
        bookings: FacilityBooking[];
        pagination: PaginatedResponse<FacilityBooking>["pagination"];
      }>("/facility-bookings", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.bookings,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(response.data.message || "Failed to fetch bookings");
    },
  });
};

export const useFacilityBooking = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<FacilityBooking>(
        `/facility-bookings/${id}`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch booking");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookingsData = queryClient.getQueryData<any>([QUERY_KEY, {}]);
      return bookingsData?.items?.find(
        (b: FacilityBooking) => b._id === id,
      );
    },
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingDto): Promise<FacilityBooking> => {
      const response = await apiClient.post<FacilityBooking>(
        "/facility-bookings",
        data,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to create booking");
    },
    onSuccess: () => {
      customToast.success("Booking created successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to create booking");
    },
  });
};

export const useMyBookings = (params: BookingQueryParams = {}) => {
  const queryKeyString = JSON.stringify(params);

  return useQuery({
    queryKey: [QUERY_KEY, "my-bookings", queryKeyString],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const queryParams: Record<string, any> = {};

      queryParams.page = params.page ?? 1;
      queryParams.limit = params.limit ?? 10;

      if (params.status) queryParams.status = params.status;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;

      const response = await apiClient.get<{
        bookings: FacilityBooking[];
        pagination: PaginatedResponse<FacilityBooking>["pagination"];
      }>("/facility-bookings/my-bookings", { params: queryParams });

      if (response.data.success) {
        return {
          items: response.data.data.bookings,
          pagination: response.data.data.pagination,
        };
      }
      throw new Error(
        response.data.message || "Failed to fetch your bookings",
      );
    },
  });
};

export const useCheckAvailability = (
  facilityId: string,
  date: string,
  startTime?: string,
  endTime?: string,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "availability", facilityId, date, startTime, endTime],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: Record<string, any> = { facilityId, date };
      if (startTime) params.startTime = startTime;
      if (endTime) params.endTime = endTime;

      const response = await apiClient.get<{
        available: boolean;
        slots?: TimeSlot[];
      }>("/facility-bookings/availability", { params });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to check availability",
      );
    },
    enabled: !!facilityId && !!date,
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useApproveBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<FacilityBooking> => {
      const response = await apiClient.post<FacilityBooking>(
        `/facility-bookings/${id}/approve`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to approve booking");
    },
    onSuccess: (_, id) => {
      customToast.success("Booking approved successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to approve booking");
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      reason,
    }: {
      id: string;
      reason?: string;
    }): Promise<FacilityBooking> => {
      const response = await apiClient.post<FacilityBooking>(
        `/facility-bookings/${id}/cancel`,
        { cancellationReason: reason },
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to cancel booking");
    },
    onSuccess: (_, variables) => {
      customToast.success("Booking cancelled successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to cancel booking");
    },
  });
};

export const useCompleteBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<FacilityBooking> => {
      const response = await apiClient.post<FacilityBooking>(
        `/facility-bookings/${id}/complete`,
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to complete booking");
    },
    onSuccess: (_, id) => {
      customToast.success("Booking completed successfully");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
    onError: (error: Error) => {
      customToast.error(error.message || "Failed to complete booking");
    },
  });
};

export const useBookingStats = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "stats"],
    queryFn: async () => {
      const response = await apiClient.get<BookingStats>(
        "/facility-bookings/stats/summary",
      );

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(
        response.data.message || "Failed to fetch booking statistics",
      );
    },
    staleTime: 5 * 60 * 1000,
  });
};
