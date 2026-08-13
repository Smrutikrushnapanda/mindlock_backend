import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterPushTokenDto {
  @IsString()
  @MinLength(8)
  pushToken: string;

  @IsOptional()
  @IsIn(['android', 'ios'])
  platform?: string;

  @IsOptional()
  @IsBoolean()
  isManaged?: boolean;
}
