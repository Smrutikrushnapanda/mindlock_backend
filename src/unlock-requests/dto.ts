import { IsInt, IsOptional, IsString, Length, Matches, Max, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUnlockRequestDto {
  @IsString()
  @MinLength(3)
  reason: string;

  @IsOptional()
  @IsString()
  customMessage?: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(5)
  @Max(240)
  durationMin: number;
}

export class VerifyOtpDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code: string;
}
