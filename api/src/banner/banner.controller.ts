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
import { BannerService } from './banner.service';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto } from './dto/banner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ModuleName, PermissionAction, StaffStatus } from '@prisma/client';

@Controller('banners')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Public()
  @Get('active')
  findActive() {
    return this.bannerService.findActive();
  }

  @Get()
  @RequirePermission({ module: ModuleName.PROMOTIONAL_BANNER, action: PermissionAction.READ })
  findAll(@Query('status') status?: StaffStatus, @Query('search') search?: string) {
    return this.bannerService.findAll({ status, search });
  }

  @Get(':id')
  @RequirePermission({ module: ModuleName.PROMOTIONAL_BANNER, action: PermissionAction.READ })
  findOne(@Param('id') id: string) {
    return this.bannerService.findOne(id);
  }

  @Post()
  @RequirePermission({ module: ModuleName.PROMOTIONAL_BANNER, action: PermissionAction.CREATE })
  create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannerService.create(createBannerDto);
  }

  @Patch('reorder')
  @RequirePermission({ module: ModuleName.PROMOTIONAL_BANNER, action: PermissionAction.UPDATE })
  reorder(@Body() reorderDto: ReorderBannersDto) {
    return this.bannerService.reorder(reorderDto);
  }

  @Patch(':id')
  @RequirePermission({ module: ModuleName.PROMOTIONAL_BANNER, action: PermissionAction.UPDATE })
  update(@Param('id') id: string, @Body() updateBannerDto: UpdateBannerDto) {
    return this.bannerService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @RequirePermission({ module: ModuleName.PROMOTIONAL_BANNER, action: PermissionAction.DELETE })
  remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
}
