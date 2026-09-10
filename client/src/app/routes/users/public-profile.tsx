import { PublicProfile } from '@/features/profile/components/public-profile';
import { Navigate, useParams } from 'react-router';

export default function PublicProfilePage() {
  const { userId } = useParams();

  if (!userId) return <Navigate to='/forum' replace />;

  return <PublicProfile userId={userId} />;
}
