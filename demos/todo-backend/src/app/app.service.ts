import { ClassProvider, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}

export const APP_SERVICE_TOKEN = 'app_service_token';

export function provideAppService(): ClassProvider<AppService> {
  return {
    provide: APP_SERVICE_TOKEN,
    useClass: AppService,
  };
}
