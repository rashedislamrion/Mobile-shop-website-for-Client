import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PhoneUnitService } from './phone-unit.service';
import { CreatePhoneUnitDto } from './dto/phone-unit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ModuleName, PermissionAction, PhoneUnitStatus } from '@prisma/client';

@Controller('phone-units')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PhoneUnitController {
  constructor(private readonly phoneUnitService: PhoneUnitService) {}

  @Get('check-imei')
  checkImei(@Query('imei') imei: string) {
    return this.phoneUnitService.checkImei(imei);
  }

  @Get('available')
  getAvailable(
    @Query('variantId') variantId: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.phoneUnitService.getAvailableUnits(variantId, branchId);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.READ })
  @Get()
  findAll(
    @Query('branchId') branchId?: string,
    @Query('status') status?: PhoneUnitStatus,
    @Query('variantId') variantId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.phoneUnitService.findAll({
      branchId,
      status,
      variantId,
      search,
      page,
      limit,
    });
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.READ })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phoneUnitService.findOne(id);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.CREATE })
  @Post()
  create(@Body() dto: CreatePhoneUnitDto) {
    return this.phoneUnitService.create(dto);
  }
}
