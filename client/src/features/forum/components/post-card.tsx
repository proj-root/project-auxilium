import { Link } from 'react-router';
import type { Post } from '../forum.dto';
import { AuthorLine } from './author-line';
import { PostActions } from './post-actions';
import { PostBody } from './post-body';

/**
 * One row of the feed. Rows are borderless and separated by a hairline — a
 * stack of bordered cards reads as a dashboard, not as something to read.
 */
export function PostCard({ post }: { post: Post }) {
  return (
    <article className='hover:bg-accent/40 -mx-3 rounded-md px-3 py-3 transition-colors'>
      <AuthorLine
        creator={post.creator}
        createdAt={post.createdAt}
        updatedAt={post.updatedAt}
      />
      <Link to={`/forum/${post.postId}`} className='mt-2 block'>
        <h2 className='text-lg leading-snug font-semibold'>{post.title}</h2>
      </Link>
      {/*
        Blank lines are collapsed in the preview only: the clamp counts
        rendered lines, so a paragraph break would spend one of the three on
        nothing. The full post keeps its spacing.
      */}
      <PostBody
        text={post.content.replace(/\n{2,}/g, '\n')}
        className='text-muted-foreground mt-1 line-clamp-3'
      />
      <PostActions
        post={post}
        commentsHref={`/forum/${post.postId}`}
        className='-ms-2 mt-2'
      />
    </article>
  );
}
