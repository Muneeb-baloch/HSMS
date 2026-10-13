// src/hooks/entities/useMember.ts

import { apiClient } from "@/lib/API/client";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addMember,
  removeMember,
  setMembers,
  setTotal,
  updateMember,
} from "@/lib/store/slices/memberSlice";
import { PaginatedResponse } from "@/lib/types/api";
import {
  CreateMemberDto,
  Member,
  MemberQueryParams,
  UpdateMemberDto,
} from "@/lib/types/entity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/hooks/useAuth";

// export const useMembers = (params: MemberQueryParams = {}) => {
//   const dispatch = useAppDispatch();
//   const clientMembers = useAppSelector((state) => state.members.items);

//   const query = useQuery({
//     queryKey: ["members", params],
//     queryFn: async () => {
//       const response = await apiClient.get<{
//         members: Member[];
//         pagination: PaginatedResponse<Member>["pagination"];
//       }>("/members", { params });

//       if (response.data.success) {
//         const { members, pagination } = response.data.data;
//         dispatch(setMembers(members));
//         dispatch(setTotal(pagination.total));
//         return { items: members, pagination } as PaginatedResponse<Member>;
//       }

//       throw new Error(response.data.message || "Failed to fetch members");
//     },
//     placeholderData: (previousData) => previousData,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });

//   // Merge server data with client state
//   const data = query.data
//     ? { ...query.data, items: clientMembers }
//     : query.data;

//   return {
//     ...query,
//     data,
//   };
// };

// Update useMember.ts - fix the useMembers hook
export const useMembers = (params: MemberQueryParams = {}) => {
  const dispatch = useAppDispatch();
  const clientMembers = useAppSelector((state) => state.members.items);
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["members", params, user?.societyId],
    queryFn: async () => {
      console.log('🎣 useMembers hook - queryFn called with params:', params)
      const queryParams = { ...params };
      if (user?.societyId) {
        queryParams.societyId = user.societyId;
      }
      console.log('🎣 useMembers hook - Final query params being sent to API:', queryParams)
      const response = await apiClient.get<{
        members: Member[];
        pagination: PaginatedResponse<Member>["pagination"];
      }>("/members", { params: queryParams });

      if (response.data.success) {
        const data = response.data.data as {
          members?: Member[];
          pagination?: { total?: number; page?: number; limit?: number; pages?: number };
        };
        const members = data.members ?? [];
        const pagination = data.pagination ?? {};
        const total = pagination.total ?? members.length;

        dispatch(setMembers(members));
        dispatch(setTotal(total));

        return {
          items: members,
          pagination: {
            page: pagination.page ?? 1,
            limit: pagination.limit ?? members.length,
            total,
            pages: pagination.pages ?? 1,
          },
        } as PaginatedResponse<Member>;
      }

      throw new Error(response.data.message || "Failed to fetch members");
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Return the query directly, don't merge with client state
  return query;
};
// Add this hook at the end of the file, before the closing bracket
// Add to src/lib/hooks/entities/useMember.ts (append to existing file)

export const useMember = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const response = await apiClient.get<Member>(`/members/${id}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || "Failed to fetch member");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    initialData: () => {
      // Try to get from cache first
      const membersData = queryClient.getQueryData<PaginatedResponse<Member>>([
        "members",
        {},
      ]);
      return membersData?.items.find((m) => m._id === id);
    },
  });
};
export const useMemberById = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["member", id],
    queryFn: async () => {
      const response = await apiClient.get<Member>(`/members/${id}`);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to fetch member");
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: () => {
      // Try to get from cache first
      const membersData = queryClient.getQueryData<PaginatedResponse<Member>>([
        "members",
      ]);
      return membersData?.items.find((m) => m._id === id);
    },
  });
};
export const useCreateMember = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMemberDto): Promise<Member> => {
      const response = await apiClient.post<Member>("/members", data);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to create member");
    },
    onMutate: async (newMember) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

      // Optimistic update
      const optimisticMember: Member = {
        _id: `temp-${Date.now()}`,
        ...newMember,
        dateOfBirth: newMember.dateOfBirth
          ? new Date(newMember.dateOfBirth)
          : undefined,
        memIsOverseas: newMember.memIsOverseas ?? false,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "current-user",
        isDeleted: false,
      };

      dispatch(addMember(optimisticMember));

      return { optimisticMember };
    },
    onSuccess: (createdMember, variables, context) => {
      // Replace optimistic member with actual one
      if (context?.optimisticMember) {
        dispatch(removeMember(context.optimisticMember._id));
      }
      dispatch(addMember(createdMember));

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.optimisticMember) {
        dispatch(removeMember(context.optimisticMember._id));
      }
    },
  });
};

export const useUpdateMember = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMemberDto;
    }): Promise<Member> => {
      const response = await apiClient.put<Member>(`/members/${id}`, data);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || "Failed to update member");
    },
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });

      const previousMembers = queryClient.getQueryData<Member[]>(["members"]);

      // Optimistic update
      dispatch(updateMember({ _id: id, ...data } as Member));

      return { previousMembers };
    },
    onSuccess: (updatedMember) => {
      dispatch(updateMember(updatedMember));
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousMembers) {
        queryClient.setQueryData(["members"], context.previousMembers);
      }
    },
  });
};

interface DeleteMemberContext {
  previousMembers?: Member[];
}

export const useDeleteMember = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const mutation = useMutation<void, Error, string, DeleteMemberContext>({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/members/${id}`);
      if (!response.data.success) throw new Error(response.data.message);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["members"] });
      const previousMembers = queryClient.getQueryData<Member[]>(["members"]);
      dispatch(removeMember(id));
      return { previousMembers };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
    onError: (error, variables, context) => {
      if (context?.previousMembers) {
        queryClient.setQueryData(["members"], context.previousMembers);
      }
    },
  });

  return mutation; // now isLoading is directly accessible
};
