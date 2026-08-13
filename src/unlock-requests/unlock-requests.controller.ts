import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { CreateUnlockRequestDto, VerifyOtpDto } from './dto';
import { UnlockRequestsService } from './unlock-requests.service';

@Controller('unlock-requests')
@UseGuards(JwtAuthGuard)
export class UnlockRequestsController {
  constructor(private readonly requests: UnlockRequestsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateUnlockRequestDto) {
    return this.requests.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.requests.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.requests.findOne(user.id, id);
  }

  @Post(':id/verify-otp')
  verifyOtp(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: VerifyOtpDto,
  ) {
    return this.requests.verifyOtp(user.id, id, dto);
  }

  @Post(':id/resend-otp')
  resendOtp(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.requests.resendOtp(user.id, id);
  }

  @Post(':id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.requests.cancel(user.id, id);
  }
}
