import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { CreateExchangeDto, RejectExchangeDto } from './dto/create-exchange.dto';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ExchangeStatus, ModuleName, PermissionAction } from '@prisma/client';

@Controller('exchanges')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.READ })
  @Get()
  findAll(
    @Query('status') status?: ExchangeStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.exchangeService.findAll({
      status,
      search,
      page,
      limit,
    });
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.READ })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exchangeService.findOne(id);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.CREATE })
  @Post()
  create(@Body() dto: CreateExchangeDto) {
    return this.exchangeService.create(dto);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.UPDATE })
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.exchangeService.approve(id);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.UPDATE })
  @Patch(':id/item-received')
  itemReceived(@Param('id') id: string) {
    return this.exchangeService.itemReceived(id);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.UPDATE })
  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.exchangeService.complete(id);
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.UPDATE })
  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectExchangeDto) {
    return this.exchangeService.reject(id, dto);
  }
}
