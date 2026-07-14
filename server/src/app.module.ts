import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { AppController } from './app.controller';
import { EventsModule } from './modules/events/event.module';
import { UserModule } from './modules/user/user.module';
import { TasksModule } from './modules/tasks/task.module';
import { MailModule } from './modules/mail/mail.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    AuthModule.forRoot({ auth }),
    EventsModule,
    UserModule,
    TasksModule,
    MailModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
