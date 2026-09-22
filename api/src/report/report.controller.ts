import { Controller, Get, Post, Body, Param, Query, UseGuards, ForbiddenException } from '@nestjs/common';
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

  @Get('website-sales')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getWebsiteSalesReport(
    @Query('branch') branch?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.reportService.getWebsiteSalesReport({
      branch,
      status,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('pos-sales')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getPosSalesReport(
    @Query('branch') branch?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('staffId') staffId?: string,
  ) {
    return this.reportService.getPosSalesReport({
      branch,
      status,
      dateFrom,
      dateTo,
      search,
      staffId,
    });
  }

  @Get('service-sales')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getServiceSalesReport(
    @CurrentUser() user: JwtPayload,
    @Query('branch') branch?: string,
    @Query('status') status?: string,
    @Query('technicianId') technicianId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    const isTech = user.roleName?.toLowerCase().includes('technician');
    if (isTech) {
      throw new ForbiddenException('Access denied: Technicians can only view their own individual servicing reports');
    }
    return this.reportService.getServiceSalesReport({
      branch,
      status,
      technicianId,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('service-global')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getGlobalServiceReport(
    @CurrentUser() user: JwtPayload,
    @Query('branch') branch?: string,
    @Query('technicianId') technicianId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    const isTech = user.roleName?.toLowerCase().includes('technician');
    if (isTech) {
      throw new ForbiddenException('Access denied: Technicians can only view their own individual servicing reports');
    }
    return this.reportService.getGlobalServiceReport({
      branch,
      technicianId,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('servicing-technician')
  getServicingTechnicianReport(
    @CurrentUser() user: JwtPayload,
    @Query('technicianId') technicianId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    const isTech = user.roleName?.toLowerCase().includes('technician');
    // If caller is a technician, strictly bind to their own user.sub, ignoring client-supplied technicianId
    const effectiveTechId = isTech ? user.sub : (technicianId || user.sub);
    return this.reportService.getServicingTechnicianReport(effectiveTechId, {
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('technician-performance')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getTechnicianPerformanceReport(
    @CurrentUser() user: JwtPayload,
    @Query('branch') branch?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const isTech = user.roleName?.toLowerCase().includes('technician');
    if (isTech) {
      throw new ForbiddenException('Access denied: Technicians can only view their own individual servicing reports');
    }
    return this.reportService.getTechnicianPerformanceReport({
      branch,
      dateFrom,
      dateTo,
    });
  }

  @Get('technician-profit')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getTechnicianProfitReport(
    @CurrentUser() user: JwtPayload,
    @Query('branch') branch?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const isTech = user.roleName?.toLowerCase().includes('technician');
    if (isTech) {
      throw new ForbiddenException('Access denied: Technicians can only view their own individual servicing reports');
    }
    return this.reportService.getTechnicianProfitReport({
      branch,
      dateFrom,
      dateTo,
    });
  }

  @Get('shopwise')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getShopwiseReport(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getShopwiseReport({
      dateFrom,
      dateTo,
    });
  }

  @Get('marketing-fee')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getMarketingFeeReport(
    @Query('branch') branch?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.reportService.getMarketingFeeReport({
      branch,
      dateFrom,
      dateTo,
    });
  }

  @Get('expense')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getExpenseReport(
    @Query('categoryId') categoryId?: string,
    @Query('branch') branch?: string,
    @Query('walletTypeId') walletTypeId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.reportService.getExpenseReport({
      categoryId,
      branch,
      walletTypeId,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('purchase')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getPurchaseReport(
    @Query('supplierId') supplierId?: string,
    @Query('branch') branch?: string,
    @Query('paymentStatus') paymentStatus?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.reportService.getPurchaseReport({
      supplierId,
      branch,
      paymentStatus,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('transactions')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getTransactionsReport(
    @Query('walletTypeId') walletTypeId?: string,
    @Query('branch') branch?: string,
    @Query('type') type?: string,
    @Query('payType') payType?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.reportService.getTransactionsReport({
      walletTypeId,
      branch,
      type,
      payType,
      dateFrom,
      dateTo,
      search,
    });
  }

  @Get('product-stock')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getProductStockReport(
    @Query('inStockOnly') inStockOnly?: string,
    @Query('branch') branch?: string,
    @Query('brand') brand?: string,
    @Query('category') category?: string,
    @Query('quality') quality?: string,
    @Query('color') color?: string,
    @Query('search') search?: string,
  ) {
    return this.reportService.getProductStockReport({
      inStockOnly,
      branch,
      brand,
      category,
      quality,
      color,
      search,
    });
  }

  @Get('courier')
  @RequirePermission({ module: ModuleName.REPORT, action: PermissionAction.READ })
  getCourierReport(
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
  ) {
    return this.reportService.getCourierReport({
      status,
      dateFrom,
      dateTo,
      search,
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
