import { Module } from '@nestjs/common';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';
import { AppController } from './app.controller';
import { EventsModule } from './modules/events/event.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [AuthModule.forRoot({ auth }), EventsModule, UserModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
