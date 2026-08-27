import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateStatusDto,
  UpdateSpecializationsDto,
} from './dto/create-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ModuleName, PermissionAction, StaffStatus } from '@prisma/client';

@Controller('employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.READ })
  findAll(
    @Query('department') department?: string,
    @Query('role') role?: string,
    @Query('branch') branch?: string,
    @Query('status') status?: StaffStatus,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.employeeService.findAll({
      department,
      role,
      branch,
      status,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('technicians')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.READ })
  findTechnicians() {
    return this.employeeService.findTechnicians();
  }

  @Get(':id')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.READ })
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Post()
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.CREATE })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Patch(':id')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.UPDATE })
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(id, updateEmployeeDto);
  }

  @Patch(':id/reset-password')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.UPDATE })
  resetPassword(@Param('id') id: string) {
    return this.employeeService.resetPassword(id);
  }

  @Patch(':id/status')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.UPDATE })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.employeeService.updateStatus(id, updateStatusDto);
  }

  @Patch(':id/specializations')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.UPDATE })
  updateSpecializations(
    @Param('id') id: string,
    @Body() updateSpecializationsDto: UpdateSpecializationsDto,
  ) {
    return this.employeeService.updateSpecializations(id, updateSpecializationsDto);
  }

  @Delete(':id')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.DELETE })
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }
}
