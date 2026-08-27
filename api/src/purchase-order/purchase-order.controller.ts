import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchaseOrderService } from './purchase-order.service';
import {
  CreatePurchaseOrderDto,
  ReceivePurchaseOrderDto,
} from './dto/purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ModuleName, PermissionAction, PurchaseOrderStatus } from '@prisma/client';

@Controller('purchase-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Get()
  @RequirePermission({ module: ModuleName.PURCHASE, action: PermissionAction.READ })
  findAll(
    @Query('branch') branch?: string,
    @Query('supplier') supplier?: string,
    @Query('status') status?: PurchaseOrderStatus,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.purchaseOrderService.findAll({
      branch,
      supplier,
      status,
      dateFrom,
      dateTo,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission({ module: ModuleName.PURCHASE, action: PermissionAction.READ })
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findOne(id);
  }

  @Post()
  @RequirePermission({ module: ModuleName.PURCHASE, action: PermissionAction.CREATE })
  create(
    @Body() dto: CreatePurchaseOrderDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.purchaseOrderService.create(dto, user.sub);
  }

  @Patch(':id/receive')
  @RequirePermission({ module: ModuleName.PURCHASE, action: PermissionAction.UPDATE })
  receiveItems(
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.receiveItems(id, dto);
  }

  @Patch(':id/cancel')
  @RequirePermission({ module: ModuleName.PURCHASE, action: PermissionAction.UPDATE })
  cancel(@Param('id') id: string) {
    return this.purchaseOrderService.cancel(id);
  }
}
