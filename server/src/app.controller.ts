import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class AppController {
  @Get()
  getHealthcheck() {
    return {
      status: 'success',
      message: 'All systems operational.',
    };
  }
}
