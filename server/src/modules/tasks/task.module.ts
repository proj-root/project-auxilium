import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TasksController } from './task.controller';
import { EventsModule } from '../events/event.module';

@Module({
  imports: [EventsModule],
  controllers: [TasksController],
  providers: [TaskService],
})
export class TasksModule {}
