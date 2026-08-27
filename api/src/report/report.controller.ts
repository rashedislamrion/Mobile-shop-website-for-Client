import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ModuleName, PermissionAction } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('dashboard')
  getDashboard(
    @Query('branch') branch?: string,
    @Query('period') period?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getDashboardData({
      branch,
      period,
      dateFrom,
      dateTo,
    });
  }

  @Get('product-analytics')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getProductAnalytics(
    @Query('branch') branch?: string,
    @Query('category') category?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getProductAnalytics({
      branch,
      category,
      dateFrom,
      dateTo,
    });
  }

  @Get('customer-due')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getCustomerDue(
    @Query('branch') branch?: string,
    @Query('dueRange') dueRange?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getCustomerDue({
      branch,
      dueRange,
      dateFrom,
      dateTo,
    });
  }

  @Get('customer-due/:customerId/unpaid-orders')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getCustomerUnpaidOrders(@Param('customerId') customerId: string) {
    return this.reportService.getUnpaidOrdersForCustomer(customerId);
  }

  @Post('customer-due/payment')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.UPDATE })
  recordCustomerDuePayment(
    @Body() dto: {
      customerId: string;
      amount: number;
      extraDiscount?: number;
      walletTypeId: string;
      paymentMethod?: string;
      paymentDate?: string;
      notes?: string;
      orderIds?: string[];
    },
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.reportService.recordCustomerDuePayment(dto, user?.sub);
  }

  @Get('supplier-due')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getSupplierDue(
    @Query('supplier') supplier?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getSupplierDue({
      supplier,
      dateFrom,
      dateTo,
    });
  }

  @Get('summary')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getSummary(
    @Query('branch') branch?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getSummary({
      branch,
      dateFrom,
      dateTo,
    });
  }

  @Get('discount')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getDiscountReport(
    @Query('branch') branch?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getDiscountReport({
      branch,
      dateFrom,
      dateTo,
    });
  }
}
