// hooks/useAuthRole.ts (Minimal Fix)
import { hasPermission, UserRole } from "@/lib/constants/roles";
import { useEffect, useState } from "react";
import { getUserRole } from "../API/client";

export const useAuthRole = () => {
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);

  useEffect(() => {
    // Use setTimeout to defer the state update
    const timeoutId = setTimeout(() => {
      const role = getUserRole();
      setUserRoleState(role);
    }, 0);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userRole") {
        const newRole = getUserRole();
        setUserRoleState(newRole);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    userRole,
    hasPermission: (requiredRole: UserRole | UserRole[]) => {
      if (!userRole) return false;
      return hasPermission(userRole, requiredRole);
    },
    isAdmin: userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN,
    isModerator: userRole === UserRole.MODERATOR,
    isUser: userRole === UserRole.USER,
    isGuest: userRole === UserRole.GUEST,
  };
};
