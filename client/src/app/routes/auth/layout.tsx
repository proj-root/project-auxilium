import { selectAuthState } from "@/features/auth/state/auth-slice";
import { useAppSelector } from "@/hooks/redux-hooks";
import { useLayoutEffect } from "react";
import { Outlet, useNavigate } from "react-router";

export default function AuthLayout() {
  const authState = useAppSelector(selectAuthState);
  const navigate = useNavigate();
  
  useLayoutEffect(() => {
    (async () => {
      if (authState.accessToken) {
        navigate('/')
      }
    })()
  }, [authState])
  
  if (authState.loading) return <></>;

  return <Outlet />;
}