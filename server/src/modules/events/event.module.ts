import { Module } from '@nestjs/common';
import { EventsService } from './event.service';
import { EventsController } from './event.controller';
import { VerificationEngineService } from './lib/verification-engine.service';
import { SheetsService } from './lib/sheets.service';
import { UserService } from '@/modules/user/user.service';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    VerificationEngineService,
    SheetsService,
    UserService,
  ],
  exports: [EventsService],
})
export class EventsModule {}
