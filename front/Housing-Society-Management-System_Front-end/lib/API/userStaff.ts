// lib/API/userStaff.ts
import {
  CreateUserStaffDto,
  GetUserStaffsResult,
  UpdateUserStaffDto,
  UserStaffQueryParams,
  UserStaffType,
} from "@/lib/types/userStaff";
import axios from "axios";

const api = axios.create({
  baseURL: "/api/userstaff",
});

// Helper to transform API responses for SearchableSelect
const transformArrayResponse = (response: any): any[] => {
  // Handle different response structures
  if (Array.isArray(response)) {
    return response;
  }

  if (response?.data && Array.isArray(response.data)) {
    return response.data;
  }

  if (response?.data?.data && Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (response?.data?.states && Array.isArray(response.data.states)) {
    return response.data.states;
  }

  if (response?.data?.cities && Array.isArray(response.data.cities)) {
    return response.data.cities;
  }

  if (response?.data?.roles && Array.isArray(response.data.roles)) {
    return response.data.roles;
  }

  if (response?.data?.userStaffs && Array.isArray(response.data.userStaffs)) {
    return response.data.userStaffs;
  }

  // Try to find any array in the response
  const arrays = Object.values(response?.data || response || {}).filter((val) =>
    Array.isArray(val),
  );

  return arrays.length > 0 ? arrays[0] : [];
};

export const userStaffApi = {
  async getUserStaffs(
    params?: UserStaffQueryParams,
  ): Promise<GetUserStaffsResult> {
    const res = await api.get("/", { params });
    return res.data.data;
  },

  async getUserStaff(id: string): Promise<UserStaffType> {
    const res = await api.get(`/${id}`);
    return res.data.data;
  },

  async createUserStaff(payload: CreateUserStaffDto) {
    const res = await api.post("/", payload);
    return res.data;
  },

  async updateUserStaff(id: string, payload: UpdateUserStaffDto) {
    const res = await api.put(`/${id}`, payload);
    return res.data;
  },

  async deleteUserStaff(id: string) {
    const res = await api.delete(`/${id}`);
    return res.data;
  },

  async getStatistics() {
    const res = await api.get("/statistics");
    return res.data.data;
  },

  async search(query: string, limit = 10) {
    const res = await api.get("/search", { params: { search: query, limit } });
    return res.data.data;
  },

  // For SearchableSelect component
  async getOptions(endpoint: string, search?: string) {
    const res = await api.get(endpoint, {
      params: {
        search,
        limit: 50,
        page: 1,
      },
    });
    return transformArrayResponse(res.data);
  },

  // For creating new options via SearchableSelect
  async createOption(endpoint: string, payload: any) {
    const res = await api.post(endpoint, payload);
    return res.data.data;
  },
};

export default userStaffApi;
