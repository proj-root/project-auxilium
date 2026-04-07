import { LoadingComponent } from "@/components/misc/loading";
import { authClient } from "@/lib/auth-client";
import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function AuthLayout() {
  const navigate = useNavigate();
  const { data, isPending, error } = authClient.useSession();

  useLayoutEffect(() => {
    if (data?.session && data?.user) {
      navigate("/", { replace: true });
    }
  }, [data, isPending, navigate]);

  if (isPending) return <LoadingComponent />;

  // User not authenticated, show login and register pages
  if (!isPending && (!data?.session || !data?.user)) return <Outlet />;

  // While redirecting, render nothing
  return null;
}