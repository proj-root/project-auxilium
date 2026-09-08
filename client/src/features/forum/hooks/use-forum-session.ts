import { authClient } from '@/lib/auth-client';
import { RolesConfig } from '@auxilium/configs/roles';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

// The session's `role` is attached by a better-auth after-hook, so it is not
// part of the client's session type.
type SessionUserWithRole = { id: string; role?: { roleId?: number | string } };

/**
 * Who is reading, and what they may do. The forum is public, so every one of
 * these can be absent — `requireAuth` sends a signed-out reader to login and
 * brings them back to the page they were on.
 */
export function useForumSession() {
  const { data, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const user = data?.user as SessionUserWithRole | undefined;
  const userId = user?.id;
  const roleId = Number(user?.role?.roleId ?? 0);

  const requireAuth = useCallback(() => {
    if (userId) return true;

    const returnTo = encodeURIComponent(location.pathname + location.search);
    navigate(`/auth/login?redirectTo=${returnTo}`);

    return false;
  }, [userId, navigate, location.pathname, location.search]);

  return {
    userId,
    roleId,
    isPending,
    isSignedIn: Boolean(userId),
    // Admins may remove other people's posts and comments, but never edit them.
    canModerate:
      roleId === RolesConfig.ADMIN || roleId === RolesConfig.SUPERADMIN,
    requireAuth,
  };
}
