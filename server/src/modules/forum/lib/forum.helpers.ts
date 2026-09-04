import { ForbiddenException } from '@nestjs/common';
import { RolesConfig } from '@auxilium/configs/roles';
import { StatusConfig } from '@auxilium/configs/status';
import type { CommentDTO, CommentTreeNode } from '../forum.dto';

// The placeholder shown in place of a soft-deleted comment's body. Deleted
// comments are kept in the tree so replies underneath them are not orphaned.
export const DELETED_COMMENT_TEXT = '[deleted]';

type CommentRow = CommentDTO & {
  creator?: { id: string; name: string; image: string | null } | null;
};

/**
 * Throws unless the requester authored the row, or is an admin acting on a
 * route where moderation is permitted.
 */
export function assertCanMutate({
  row,
  userId,
  userRoleId,
  allowAdmin,
  subject,
}: {
  row: { createdBy: string };
  userId: string;
  userRoleId?: number;
  allowAdmin: boolean;
  subject: string;
}) {
  const isAuthor = row.createdBy === userId;
  const isAdmin =
    userRoleId === RolesConfig.ADMIN || userRoleId === RolesConfig.SUPERADMIN;

  if (!isAuthor && !(allowAdmin && isAdmin)) {
    throw new ForbiddenException(`You can only modify your own ${subject}.`);
  }
}

/**
 * Blanks out the body and author of a soft-deleted comment, leaving the node
 * itself in place so its replies stay reachable.
 */
function tombstone(comment: CommentRow): CommentRow {
  if (comment.statusId !== StatusConfig.DELETED) return comment;

  return {
    ...comment,
    text: DELETED_COMMENT_TEXT,
    createdBy: '',
    creator: null,
  };
}

/**
 * Assembles a flat list of comments into a reply tree of arbitrary depth.
 * Rows are expected to be ordered oldest-first; replies inherit that order.
 * A row whose parent is absent from the list is treated as a root.
 */
export function buildCommentTree<T extends CommentRow>(
  rows: T[],
): CommentTreeNode[] {
  const nodes = rows.map((row) => {
    const visible = tombstone(row);

    return {
      ...visible,
      creator: visible.creator ?? null,
      replies: [] as CommentTreeNode[],
    } as CommentTreeNode;
  });

  const byId = new Map(nodes.map((node) => [node.commentId, node]));
  const roots: CommentTreeNode[] = [];

  for (const node of nodes) {
    const parent = node.parentCommentId
      ? byId.get(node.parentCommentId)
      : undefined;

    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Depth-first search for one node in an assembled comment tree. */
export function findCommentNode(
  nodes: CommentTreeNode[],
  commentId: string,
): CommentTreeNode | undefined {
  for (const node of nodes) {
    if (node.commentId === commentId) return node;

    const found = findCommentNode(node.replies, commentId);
    if (found) return found;
  }

  return undefined;
}
