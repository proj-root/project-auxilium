import { Controller, Get } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('api/health')
export class AppController {
  @AllowAnonymous()
  @Get()
  getHealthcheck() {
    return {
      status: 'success',
      message: 'All systems operational.',
    };
  }
}
