import { IsBoolean, IsEmail, IsOptional, IsString, Length, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}

export class SetPinDto {
  @IsString()
  @Length(4, 6, { message: 'PIN must be 4-6 digits' })
  @Matches(/^\d+$/, { message: 'PIN must contain only digits' })
  pin: string;
}

export class ToggleBiometricDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/)
  pin?: string;
}
