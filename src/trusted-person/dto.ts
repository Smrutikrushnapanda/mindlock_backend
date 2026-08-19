import { IsEmail, IsIn, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export const RELATIONSHIPS = ['parent', 'partner', 'friend', 'mentor', 'other'] as const;

export class InviteTrustedPersonDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsIn(RELATIONSHIPS)
  relationship: string;
}

export class UpdateTrustedPersonDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(RELATIONSHIPS)
  relationship?: string;
}

export class VerifyTrustedPersonOtpDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be a 6-digit number' })
  code: string;
}

export class InviteTokenPayload {
  @IsString()
  userId: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;
}
