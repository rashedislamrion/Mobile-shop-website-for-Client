import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { BusinessSettingsService } from './business-settings.service';
import { UpdateBusinessSettingsDto } from './dto/business-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ModuleName, PermissionAction } from '@prisma/client';

@Controller('business-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BusinessSettingsController {
  constructor(private readonly businessSettingsService: BusinessSettingsService) {}

  @Public()
  @Get()
  getSettings() {
    return this.businessSettingsService.getSettings();
  }

  @Patch()
  @RequirePermission({ module: ModuleName.BUSINESS_SETTINGS, action: PermissionAction.UPDATE })
  updateSettings(@Body() updateDto: UpdateBusinessSettingsDto) {
    return this.businessSettingsService.updateSettings(updateDto);
  }
}
