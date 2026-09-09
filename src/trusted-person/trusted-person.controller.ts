import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import {
  InviteTrustedPersonDto,
  UpdateTrustedPersonDto,
  VerifyTrustedPersonOtpDto,
  CompleteReplacementDto,
} from './dto';
import { TrustedPersonService } from './trusted-person.service';

@Controller('trusted-person')
export class TrustedPersonController {
  constructor(private readonly persons: TrustedPersonService) {}

  @Post('invite')
  @UseGuards(JwtAuthGuard)
  invite(@CurrentUser() user: AuthUser, @Body() dto: InviteTrustedPersonDto) {
    return this.persons.invite(user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findForUser(@CurrentUser() user: AuthUser) {
    return this.persons.findForUser(user.id);
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateTrustedPersonDto) {
    return this.persons.update(user.id, dto);
  }

  @Post('verify-otp')
  @UseGuards(JwtAuthGuard)
  verifyOtp(@CurrentUser() user: AuthUser, @Body() dto: VerifyTrustedPersonOtpDto) {
    return this.persons.verifyOtp(user.id, dto);
  }

  @Post('replacement/request')
  @UseGuards(JwtAuthGuard)
  requestReplacement(@CurrentUser() user: AuthUser) {
    return this.persons.requestReplacement(user.id);
  }

  @Post('replacement/verify')
  @UseGuards(JwtAuthGuard)
  verifyReplacement(@CurrentUser() user: AuthUser, @Body() dto: VerifyTrustedPersonOtpDto) {
    return this.persons.verifyReplacement(user.id, dto);
  }

  @Post('replacement/complete')
  @UseGuards(JwtAuthGuard)
  completeReplacement(@CurrentUser() user: AuthUser, @Body() dto: CompleteReplacementDto) {
    return this.persons.completeReplacement(user.id, dto);
  }

  @Post('verify')
  verify(@Body() dto: { token: string }) {
    return this.persons.verify(dto);
  }
}
