import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto, SetPinDto, ToggleBiometricDto } from './dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser, CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto);
  }

  @Post('pin/set')
  @UseGuards(JwtAuthGuard)
  setPin(@CurrentUser() user: AuthUser, @Body() dto: SetPinDto) {
    return this.auth.setPin(user.id, dto);
  }

  @Post('pin/verify')
  @UseGuards(JwtAuthGuard)
  verifyPin(@CurrentUser() user: AuthUser, @Body() dto: SetPinDto) {
    return this.auth.verifyPin(user.id, dto);
  }

  @Post('biometric/toggle')
  @UseGuards(JwtAuthGuard)
  toggleBiometric(@CurrentUser() user: AuthUser, @Body() dto: ToggleBiometricDto) {
    return this.auth.toggleBiometric(user.id, dto);
  }
}
