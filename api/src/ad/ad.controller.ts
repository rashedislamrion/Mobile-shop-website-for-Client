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
import { AdService } from './ad.service';
import { CreateAdDto, UpdateAdDto, TrackAdDto } from './dto/ad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { AdPlacement, ModuleName, PermissionAction, PromoAdStatus } from '@prisma/client';

@Controller('ads')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdController {
  constructor(private readonly adService: AdService) {}

  @Public()
  @Get('active')
  findActive(@Query('placement') placement?: AdPlacement) {
    return this.adService.findActive(placement);
  }

  @Get()
  @RequirePermission({ module: ModuleName.ADS, action: PermissionAction.READ })
  findAll(
    @Query('placement') placement?: AdPlacement,
    @Query('status') status?: PromoAdStatus,
    @Query('search') search?: string,
  ) {
    return this.adService.findAll({ placement, status, search });
  }

  @Get(':id')
  @RequirePermission({ module: ModuleName.ADS, action: PermissionAction.READ })
  findOne(@Param('id') id: string) {
    return this.adService.findOne(id);
  }

  @Post()
  @RequirePermission({ module: ModuleName.ADS, action: PermissionAction.CREATE })
  create(@Body() createAdDto: CreateAdDto) {
    return this.adService.create(createAdDto);
  }

  @Patch(':id')
  @RequirePermission({ module: ModuleName.ADS, action: PermissionAction.UPDATE })
  update(@Param('id') id: string, @Body() updateAdDto: UpdateAdDto) {
    return this.adService.update(id, updateAdDto);
  }

  @Public()
  @Patch(':id/track')
  track(@Param('id') id: string, @Body() trackAdDto: TrackAdDto) {
    return this.adService.track(id, trackAdDto);
  }

  @Delete(':id')
  @RequirePermission({ module: ModuleName.ADS, action: PermissionAction.DELETE })
  remove(@Param('id') id: string) {
    return this.adService.remove(id);
  }
}
