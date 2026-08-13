import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateScheduleDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(WEEK_DAYS, { each: true })
  days: string[];

  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format' })
  startTime: string;

  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format' })
  endTime: string;

  @IsOptional()
  @IsBoolean()
  blockPorn?: boolean;

  @IsOptional()
  @IsBoolean()
  blockApps?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(WEEK_DAYS, { each: true })
  days?: string[];

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'startTime must be in HH:MM format' })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(TIME_REGEX, { message: 'endTime must be in HH:MM format' })
  endTime?: string;

  @IsOptional()
  @IsBoolean()
  blockPorn?: boolean;

  @IsOptional()
  @IsBoolean()
  blockApps?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
