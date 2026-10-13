import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  createUserStaff,
  deleteUserStaff,
  fetchUserStaff,
  fetchUserStaffs,
  fetchUserStaffStatistics,
  setFilters,
  updateUserStaff,
} from "@/lib/store/slices/userStaffSlice";
import type {
  CreateUserStaffDto,
  UpdateUserStaffDto,
  UserStaffQueryParams,
} from "@/lib/types/userStaff";
import { useEffect } from "react";

export function useUserStaffs() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => (s as any).userStaff);

  const fetch = (params?: UserStaffQueryParams) => {
    if (params) dispatch(setFilters(params));
    dispatch(fetchUserStaffs({ ...(state?.filters || {}), ...(params || {}) }));
  };

  const changePage = (page: number) => {
    dispatch(setFilters({ ...(state.filters || {}), page }));
    dispatch(fetchUserStaffs({ ...(state.filters || {}), page }));
  };

  const updateFilters = (filters: UserStaffQueryParams) => {
    dispatch(setFilters(filters));
    dispatch(fetchUserStaffs({ ...(state.filters || {}), ...filters }));
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    userStaffs: state.list || [],
    filters: state.filters,
    total: state.total,
    pages: state.pages,
    page: state.page,
    limit: state.limit,
    loading: state.loading,
    error: state.error,
    statistics: state.statistics,
    fetchUserStaffs: fetch,
    changePage,
    updateFilters,
  };
}

export function useUserStaff(id: string) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => (s as any).userStaff);

  useEffect(() => {
    if (id) dispatch(fetchUserStaff(id));
  }, [dispatch, id]);

  return {
    permission: state.selected,
    isLoading: state.loading,
    error: state.error,
  };
}

export function useUserStaffForm() {
  const dispatch = useAppDispatch();

  const create = async (payload: CreateUserStaffDto) => {
    const res = await dispatch(createUserStaff(payload));
    return res.payload || res;
  };

  const update = async (id: string, payload: UpdateUserStaffDto) => {
    const res = await dispatch(updateUserStaff({ id, payload }));
    return res.payload || res;
  };

  return {
    createUserStaff: create,
    updateUserStaff: update,
  };
}

export function useDeleteUserStaff() {
  const dispatch = useAppDispatch();

  const remove = async (id: string) => {
    const res = await dispatch(deleteUserStaff(id));
    return res.payload || res;
  };

  return { deleteUserStaff: remove };
}

export function useUserStaffStats() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector((s) => (s as any).userStaff.statistics);

  const fetch = () => dispatch(fetchUserStaffStatistics());

  return { statistics: stats, fetchStatistics: fetch };
}
