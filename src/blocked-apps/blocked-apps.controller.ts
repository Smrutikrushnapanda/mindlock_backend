import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { BlockedAppsService } from './blocked-apps.service';
import { BulkUpdateAppsDto } from './dto';

@Controller('blocked-apps')
@UseGuards(JwtAuthGuard)
export class BlockedAppsController {
  constructor(private readonly apps: BlockedAppsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.apps.findAll(user.id);
  }

  @Get('catalog')
  catalog() {
    return this.apps.catalog();
  }

  @Post('bulk-update')
  bulkUpdate(@CurrentUser() user: AuthUser, @Body() dto: BulkUpdateAppsDto) {
    return this.apps.bulkUpdate(user.id, dto);
  }

  @Patch(':id/toggle')
  toggle(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.apps.toggle(user.id, id);
  }
}
