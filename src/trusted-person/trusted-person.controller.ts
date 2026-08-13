import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { InviteTrustedPersonDto, UpdateTrustedPersonDto, VerifyTrustedPersonDto } from './dto';
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

  @Post('verify')
  verify(@Body() dto: VerifyTrustedPersonDto) {
    return this.persons.verify(dto);
  }
}
