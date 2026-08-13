import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { CreateScheduleDto, UpdateScheduleDto } from './dto';
import { SchedulesService } from './schedules.service';

@Controller('schedules')
@UseGuards(JwtAuthGuard)
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.schedules.findAll(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateScheduleDto) {
    return this.schedules.create(user.id, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    return this.schedules.update(user.id, id, dto);
  }

  @Patch(':id/toggle')
  toggle(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.schedules.toggle(user.id, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.schedules.remove(user.id, id);
  }
}
