import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { StockAdjustmentService } from './stock-adjustment.service';
import { CreateStockAdjustmentDto } from './dto/create-stock-adjustment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { StockAdjustmentType } from '@prisma/client';

@Controller('stock-adjustments')
export class StockAdjustmentController {
  constructor(private readonly stockAdjustmentService: StockAdjustmentService) {}

  @Get()
  findAll(
    @Query('branch') branch?: string,
    @Query('branchId') branchId?: string,
    @Query('type') type?: StockAdjustmentType,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.stockAdjustmentService.findAll(
      {
        branch,
        branchId,
        type,
        search,
        dateFrom,
        dateTo,
        page,
        limit,
      },
      user,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.stockAdjustmentService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateStockAdjustmentDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.stockAdjustmentService.create(dto, user);
  }
}
