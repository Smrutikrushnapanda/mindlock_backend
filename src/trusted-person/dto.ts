import { IsEmail, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

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

export class VerifyTrustedPersonDto {
  @IsString()
  token: string;
}

export class InviteTokenPayload {
  @IsUUID()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  name: string;
}
