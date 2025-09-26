import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'NCS B2B E-Commerce API v0.1 - Hello World! 🚀';
  }
}
