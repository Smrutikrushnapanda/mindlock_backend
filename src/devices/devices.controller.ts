import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { DevicesService } from './devices.service';
import { RegisterPushTokenDto } from './dto';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devices: DevicesService) {}

  @Post('register-push-token')
  registerPushToken(@CurrentUser() user: AuthUser, @Body() dto: RegisterPushTokenDto) {
    return this.devices.registerPushToken(user.id, dto);
  }
}
