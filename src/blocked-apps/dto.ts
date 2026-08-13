import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BlockedAppItem {
  @IsString()
  @MinLength(1)
  packageName: string;

  @IsString()
  @MinLength(1)
  appName: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean;
}

export class BulkUpdateAppsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BlockedAppItem)
  apps: BlockedAppItem[];
}
