import { PostDetail } from '@/features/forum/components/post-detail';
import { Navigate, useParams } from 'react-router';

export default function SinglePostPage() {
  const { postId } = useParams();

  if (!postId) return <Navigate to='/forum' replace />;

  return <PostDetail postId={postId} />;
}
