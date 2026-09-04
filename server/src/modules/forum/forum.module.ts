import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { CommentService } from './comment.service';
import { PostsController } from './post.controller';
import { CommentsController } from './comment.controller';

@Module({
  controllers: [PostsController, CommentsController],
  providers: [PostService, CommentService],
  exports: [PostService, CommentService],
})
export class ForumModule {}
