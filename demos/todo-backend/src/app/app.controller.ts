import { Controller, Get, Inject } from '@nestjs/common';
import { APP_SERVICE_TOKEN, AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @Inject(APP_SERVICE_TOKEN) private readonly appService: AppService
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }
}
