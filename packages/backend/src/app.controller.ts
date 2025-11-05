import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  @Get('vi/health')
  @Public()
  getHello() {
    return '251025';
  }
}
