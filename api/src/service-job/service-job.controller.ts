import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ServiceJobService } from './service-job.service';
import { CreateServiceJobDto, AssignTechnicianDto } from './dto/create-service-job.dto';
import { UpdateServiceJobStatusDto } from './dto/update-service-job-status.dto';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ModuleName, PermissionAction, ServiceJobStatus } from '@prisma/client';

@Controller('service-jobs')
export class ServiceJobController {
  constructor(private readonly serviceJobService: ServiceJobService) {}

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.READ })
  @Get()
  findAll(
    @Query('status') status?: ServiceJobStatus,
    @Query('branch') branch?: string,
    @Query('technicianId') technicianId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.serviceJobService.findAll({
      status,
      branch,
      technicianId,
      search,
      page,
      limit,
    });
  }

  @Get('my')
  findMy(@CurrentUser() user: JwtPayload) {
    return this.serviceJobService.findMy(user.sub);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.READ })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceJobService.findOne(id);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.CREATE })
  @Post()
  create(@Body() dto: CreateServiceJobDto) {
    return this.serviceJobService.create(dto);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.UPDATE })
  @Patch(':id/assign')
  assignTechnician(@Param('id') id: string, @Body() dto: AssignTechnicianDto) {
    return this.serviceJobService.assignTechnician(id, dto);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.UPDATE })
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateServiceJobStatusDto) {
    return this.serviceJobService.updateStatus(id, dto);
  }
}
