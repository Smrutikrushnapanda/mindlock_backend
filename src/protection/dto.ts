import { IsBoolean } from 'class-validator';

export class PornBlockingDto {
  @IsBoolean()
  enabled: boolean;
}

export class AppBlockingDto {
  @IsBoolean()
  enabled: boolean;
}
