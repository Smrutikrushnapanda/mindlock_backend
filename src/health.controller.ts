import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('/')
  root() {
    return {
      service: 'MindLock API',
      status: 'ok',
      version: '0.1.0',
      docs: '/api/v1',
      endpoints: [
        'POST /api/v1/auth/register',
        'POST /api/v1/auth/login',
        'POST /api/v1/auth/refresh',
        'GET /api/v1/protection/status',
      ],
    };
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
