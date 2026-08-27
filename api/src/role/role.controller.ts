import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto, UpdateRolePermissionsDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ModuleName, PermissionAction } from '@prisma/client';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.READ })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.READ })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Get(':id/permissions')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.READ })
  getRolePermissions(@Param('id') id: string) {
    return this.roleService.getRolePermissions(id);
  }

  @Post()
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.CREATE })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Patch(':id/permissions')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.UPDATE })
  updateRolePermissions(
    @Param('id') id: string,
    @Body() updateRolePermissionsDto: UpdateRolePermissionsDto,
  ) {
    return this.roleService.updateRolePermissions(id, updateRolePermissionsDto);
  }

  @Delete(':id')
  @RequirePermission({ module: ModuleName.HRM, action: PermissionAction.DELETE })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
