import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { AppBlockingDto, PornBlockingDto, VpnStatusDto } from './dto';
import { ProtectionService } from './protection.service';

@Controller('protection')
@UseGuards(JwtAuthGuard)
export class ProtectionController {
  constructor(private readonly protection: ProtectionService) {}

  @Get('status')
  status(@CurrentUser() user: AuthUser) {
    return this.protection.status(user.id);
  }

  @Patch('porn-blocking')
  setPornBlocking(@CurrentUser() user: AuthUser, @Body() dto: PornBlockingDto) {
    return this.protection.setPornBlocking(user.id, dto.enabled);
  }

  @Patch('app-blocking')
  setAppBlocking(@CurrentUser() user: AuthUser, @Body() dto: AppBlockingDto) {
    return this.protection.setAppBlocking(user.id, dto.enabled);
  }

  @Patch('vpn-status')
  setVpnConnected(@CurrentUser() user: AuthUser, @Body() dto: VpnStatusDto) {
    return this.protection.setVpnConnected(user.id, dto.connected);
  }

  @Get('coverage')
  coverage(@CurrentUser() user: AuthUser) {
    return this.protection.coverage(user.id);
  }

  @Get('domains')
  domains() {
    return this.protection.domains();
  }
}