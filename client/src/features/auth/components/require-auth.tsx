import { LoadingComponent } from "@/components/misc/loading";
import type { RoleDTO } from "@/features/user/user.dto";
import { authClient } from "@/lib/auth-client";
import { useLayoutEffect } from "react";
import { useNavigate } from "react-router";

type RequireAuthProps = {
  children: React.ReactNode;
  allowedRoles?: number[]; // Array of allowed role IDs
};

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const navigate = useNavigate();
  const { data, isPending, error } = authClient.useSession();

  // Helper: check if user has at least one allowed role
  const isAuthorized = () => {
    if (!allowedRoles || allowedRoles.length === 0) return true; // No restriction

    // @ts-ignore
    const userRole: RoleDTO = data?.user?.role || null;
    return allowedRoles.includes(parseInt(userRole.roleId));
  };

  useLayoutEffect(() => {
    if (!isPending && (!data?.session || !data?.user)) {
      navigate("/auth/login", { replace: true });
    } else if (!isPending && data?.session && data?.user && !isAuthorized()) {
      navigate("/auth/unauthorized", { replace: true });
    }
  }, [data, isPending, navigate, allowedRoles]);

  if (isPending) return <LoadingComponent />;

  // If authenticated and authorized, render the content
  if (!isPending && data?.session && data?.user && isAuthorized()) {
    return <>{children}</>;
  }

  // While redirecting, render nothing
  return null;
}