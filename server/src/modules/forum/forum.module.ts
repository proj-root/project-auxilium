import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { LikeService } from './like.service';
import { PostsController } from './post.controller';
import { CommentsController } from './comment.controller';

@Module({
  controllers: [PostsController, CommentsController],
  providers: [PostService, CommentService, LikeService],
  exports: [PostService, CommentService, LikeService],
})
export class ForumModule {}
