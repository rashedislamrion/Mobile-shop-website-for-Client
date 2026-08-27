import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus, PayrollStatus, ExpenseStatus, Prisma, PaymentStatus, WalletTxnType } from '@prisma/client';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  private async resolveBranchId(branchParam?: string): Promise<string | undefined> {
    if (!branchParam || branchParam === 'ALL' || branchParam === 'GLOBAL' || branchParam === 'All Outlets' || branchParam === 'All Branches') {
      return undefined;
    }
    const branch = await this.prisma.branch.findFirst({
      where: {
        OR: [
          { id: branchParam },
          { name: { equals: branchParam, mode: 'insensitive' } },
        ],
      },
    });
    return branch ? branch.id : branchParam;
  }

  // ============================= PRODUCT ANALYTICS =============================

  async getProductAnalytics(query?: {
    branch?: string;
    category?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const branchId = await this.resolveBranchId(query?.branch);
    const orderWhere: Prisma.OrderWhereInput = {
      status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.CONFIRMED, OrderStatus.PARCEL_BOOKED] },
    };

    if (branchId) orderWhere.branchId = branchId;
    if (query?.dateFrom || query?.dateTo) {
      orderWhere.createdAt = {};
      if (query.dateFrom) orderWhere.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        orderWhere.createdAt.lte = to;
      }
    }

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: orderWhere,
        ...(query?.category ? { product: { categoryId: query.category } } : {}),
      },
      include: {
        product: {
          include: {
            category: { select: { id: true, name: true } },
            brand: { select: { id: true, name: true } },
            images: { take: 1 },
            variants: { select: { stock: true } },
          },
        },
        order: { select: { createdAt: true } },
      },
    });

    const productMap = new Map<string, {
      id: string;
      productId: string;
      name: string;
      category: string;
      brand: string;
      rating: number;
      image: string | null;
      unitsSold: number;
      totalSold: number;
      revenue: number;
      totalRevenue: number;
      totalProfit: number;
      currentStock: number;
      revenueContributionPct: number;
    }>();

    for (const item of orderItems) {
      const pId = item.productId;
      const units = item.quantity;
      const rev = Number(item.lineTotal);

      if (!productMap.has(pId)) {
        const stock = item.product?.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
        productMap.set(pId, {
          id: pId,
          productId: pId,
          name: item.productNameSnapshot || item.product?.name || 'Product',
          category: item.product?.category?.name || 'Uncategorized',
          brand: item.product?.brand?.name || 'Brand',
          rating: 4.8,
          image: item.product?.images?.[0]?.url || null,
          unitsSold: 0,
          totalSold: 0,
          revenue: 0,
          totalRevenue: 0,
          totalProfit: 0,
          currentStock: stock,
          revenueContributionPct: 0,
        });
      }

      const p = productMap.get(pId)!;
      p.unitsSold += units;
      p.totalSold += units;
      p.revenue += rev;
      p.totalRevenue += rev;
      p.totalProfit += Math.round(rev * 0.25);
    }

    const products = Array.from(productMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
    const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
    const totalUnitsSold = products.reduce((sum, p) => sum + p.totalSold, 0);

    products.forEach((p) => {
      p.revenueContributionPct = totalRevenue > 0 ? Math.round((p.totalRevenue / totalRevenue) * 100 * 10) / 10 : 0;
    });

    // 6-month Category Trend
    const now = new Date();
    const monthlyCategoryTrend: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const nextD = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i + 1, 1));
      const label = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      const monthItems = orderItems.filter((item) => {
        const itemDate = new Date(item.order.createdAt);
        return itemDate >= d && itemDate < nextD;
      });

      const catAgg: Record<string, number> = {};
      for (const item of monthItems) {
        const cat = item.product?.category?.name || 'Other';
        catAgg[cat] = (catAgg[cat] || 0) + Number(item.lineTotal);
      }

      monthlyCategoryTrend.push({
        month: label,
        Smartphones: catAgg['Smartphones'] || 0,
        Accessories: catAgg['Accessories'] || 0,
        Audio: catAgg['Audio'] || 0,
        Laptops: catAgg['Laptops'] || 0,
        ...catAgg,
      });
    }

    return {
      summary: {
        totalUnitsSold,
        totalRevenue,
        totalProductsSold: products.length,
      },
      topProducts: products.slice(0, 10),
      allProducts: products,
      salesTrendByCategory: monthlyCategoryTrend,
      categoryTrends: monthlyCategoryTrend,
    };
  }

  // ============================= CUSTOMER DUE =============================

  async getCustomerDue(query?: {
    branch?: string;
    dueRange?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const branchId = await this.resolveBranchId(query?.branch);
    const orderWhere: Prisma.OrderWhereInput = {
      dueAmount: { gt: 0 },
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
    };

    if (branchId) orderWhere.branchId = branchId;
    if (query?.dateFrom || query?.dateTo) {
      orderWhere.createdAt = {};
      if (query.dateFrom) orderWhere.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        orderWhere.createdAt.lte = to;
      }
    }

    const orders = await this.prisma.order.findMany({
      where: orderWhere,
      include: {
        customer: { select: { id: true, name: true, phone: true, email: true } },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customerMap = new Map<string, {
      id: string;
      customerId: string;
      customerName: string;
      phone: string;
      email: string;
      branch: string;
      totalOrders: number;
      totalSpent: number;
      totalDue: number;
      lastOrderDate: Date;
    }>();

    for (const ord of orders) {
      const cId = ord.customerId || `customer-${ord.id}`;
      if (!customerMap.has(cId)) {
        customerMap.set(cId, {
          id: cId,
          customerId: cId,
          customerName: ord.customer?.name || 'Walk-in Customer',
          phone: ord.customer?.phone || 'N/A',
          email: ord.customer?.email || 'N/A',
          branch: ord.branch?.name || 'Global',
          totalOrders: 0,
          totalSpent: 0,
          totalDue: 0,
          lastOrderDate: ord.createdAt,
        });
      }

      const c = customerMap.get(cId)!;
      c.totalOrders += 1;
      c.totalSpent += Number(ord.totalAmount);
      c.totalDue += Number(ord.dueAmount);
      if (new Date(ord.createdAt) > new Date(c.lastOrderDate)) {
        c.lastOrderDate = ord.createdAt;
      }
    }

    let records = Array.from(customerMap.values()).sort((a, b) => b.totalDue - a.totalDue);

    if (query?.dueRange) {
      if (query.dueRange === '0-1000' || query.dueRange === '0-5000') records = records.filter((r) => r.totalDue <= 5000);
      else if (query.dueRange === '1000-5000' || query.dueRange === '5000-20000') records = records.filter((r) => r.totalDue > 1000 && r.totalDue <= 20000);
      else if (query.dueRange === '5000+' || query.dueRange === '20000+') records = records.filter((r) => r.totalDue > 5000);
    }

    if (query?.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      records = records.filter((r) => r.customerName.toLowerCase().includes(q) || r.phone.toLowerCase().includes(q));
    }

    const totalCustomersWithDue = records.length;
    const totalDueAmount = records.reduce((sum, r) => sum + r.totalDue, 0);

    return {
      summary: {
        totalCustomersWithDue,
        totalDueAmount,
        totalDue: totalDueAmount,
        customersWithDueCount: totalCustomersWithDue,
        highDueCount: records.filter((r) => r.totalDue > 5000).length,
      },
      data: records,
      customerDues: records,
    };
  }

  async getUnpaidOrdersForCustomer(customerId: string) {
    const rawId = customerId.startsWith('customer-') ? customerId.replace('customer-', '') : customerId;
    const orders = await this.prisma.order.findMany({
      where: {
        dueAmount: { gt: 0 },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
        OR: [
          { customerId },
          { id: rawId },
        ],
      },
      include: {
        branch: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.id.slice(-8).toUpperCase(),
      createdAt: o.createdAt,
      totalAmount: Number(o.totalAmount),
      paidAmount: Number(o.paidAmount),
      dueAmount: Number(o.dueAmount),
      status: o.status,
      branch: o.branch?.name || 'Global',
    }));
  }

  async recordCustomerDuePayment(dto: {
    customerId: string;
    amount: number;
    extraDiscount?: number;
    walletTypeId: string;
    paymentMethod?: string;
    paymentDate?: string;
    notes?: string;
    orderIds?: string[];
  }, staffId?: string) {
    const amount = Number(dto.amount) || 0;
    const extraDiscount = Number(dto.extraDiscount) || 0;
    const effectiveReduction = amount + extraDiscount;

    if (effectiveReduction <= 0) {
      throw new BadRequestException('Payment amount or discount must be greater than 0.');
    }

    const wallet = await this.prisma.walletType.findUnique({
      where: { id: dto.walletTypeId },
    });
    if (!wallet) throw new NotFoundException('Selected deposit wallet not found.');

    const rawId = dto.customerId.startsWith('customer-') ? dto.customerId.replace('customer-', '') : dto.customerId;
    const orderWhere: Prisma.OrderWhereInput = {
      dueAmount: { gt: 0 },
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
      OR: [
        { customerId: dto.customerId },
        { id: rawId },
      ],
    };

    if (dto.orderIds && dto.orderIds.length > 0) {
      orderWhere.id = { in: dto.orderIds };
    }

    const unpaidOrders = await this.prisma.order.findMany({
      where: orderWhere,
      orderBy: { createdAt: 'asc' },
    });

    if (unpaidOrders.length === 0) {
      throw new BadRequestException('No unpaid orders found for this customer.');
    }

    const totalDue = unpaidOrders.reduce((sum, o) => sum + Number(o.dueAmount), 0);
    if (effectiveReduction > totalDue) {
      throw new BadRequestException(
        `Total settlement amount (৳${effectiveReduction.toLocaleString()}) exceeds the customer's total due balance of ৳${totalDue.toLocaleString()}.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      let recordedById = staffId;
      if (!recordedById) {
        const firstStaff = await tx.staff.findFirst({ select: { id: true } });
        recordedById = firstStaff?.id || 'admin';
      }

      // 1. Credit wallet if amount > 0
      let newWalletBal = Number(wallet.currentBalance);
      if (amount > 0) {
        newWalletBal += amount;
        await tx.walletType.update({
          where: { id: dto.walletTypeId },
          data: { currentBalance: newWalletBal },
        });

        const referenceNo = `TXN-CDUE-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        const noteText = dto.notes ? `: ${dto.notes}` : '';
        await tx.walletTransaction.create({
          data: {
            walletTypeId: dto.walletTypeId,
            type: WalletTxnType.DEPOSIT,
            amount,
            referenceNo,
            note: `Customer due payment from ${dto.customerId}${extraDiscount > 0 ? ` (Discount: ৳${extraDiscount})` : ''}${noteText}`,
            recordedById,
            balanceAfter: newWalletBal,
          },
        });
      }

      // 2. Allocate payment & discount across target orders
      let remainingToAllocate = effectiveReduction;
      const updatedOrders: any[] = [];

      for (const ord of unpaidOrders) {
        if (remainingToAllocate <= 0) break;
        const currentDue = Number(ord.dueAmount);
        if (currentDue <= 0) continue;

        const alloc = Math.min(currentDue, remainingToAllocate);
        const newDue = currentDue - alloc;
        const newPaid = Number(ord.paidAmount) + alloc;
        const newPaymentStatus = newDue === 0 ? PaymentStatus.PAID : PaymentStatus.DUE;

        const updated = await tx.order.update({
          where: { id: ord.id },
          data: {
            dueAmount: newDue,
            paidAmount: newPaid,
            paymentStatus: newPaymentStatus,
          },
        });

        updatedOrders.push(updated);
        remainingToAllocate -= alloc;
      }

      return {
        success: true,
        amountPaid: amount,
        extraDiscount,
        totalSettled: effectiveReduction,
        updatedOrderCount: updatedOrders.length,
        remainingDue: Math.max(0, totalDue - effectiveReduction),
      };
    });
  }

  // ============================= SUPPLIER DUE =============================

  async getSupplierDue(query?: {
    supplier?: string;
    dateFrom?: string;
    dateTo?: string;
    dueRange?: string;
    search?: string;
  }) {
    const where: Prisma.SupplierWhereInput = {};
    if (query?.supplier) where.id = query.supplier;

    const suppliers = await this.prisma.supplier.findMany({
      where,
      include: {
        purchaseOrders: {
          select: {
            grandTotal: true,
            amountPaid: true,
            dueAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    let data = suppliers.map((s) => {
      const totalOrders = s.purchaseOrders.length;
      const totalPurchased = s.purchaseOrders.reduce(
        (sum, po) => sum + Number(po.grandTotal),
        0,
      );
      const totalPaid = s.purchaseOrders.reduce(
        (sum, po) => sum + Number(po.amountPaid),
        0,
      );
      const totalDue = Number(s.totalDue);
      const lastOrder = s.purchaseOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      return {
        id: s.id,
        supplierId: s.id,
        supplierName: s.name,
        name: s.name,
        contactPerson: s.contactPerson,
        phone: s.phone,
        email: s.email,
        totalOrders,
        totalPurchases: totalPurchased,
        totalPurchased,
        totalPaid,
        totalDue,
        lastPurchaseDate: lastOrder ? lastOrder.createdAt : null,
      };
    });

    if (query?.dueRange) {
      if (query.dueRange === '0-50000') data = data.filter((s) => s.totalDue <= 50000);
      else if (query.dueRange === '50000-200000') data = data.filter((s) => s.totalDue > 50000 && s.totalDue <= 200000);
      else if (query.dueRange === '200000+') data = data.filter((s) => s.totalDue > 200000);
    }

    if (query?.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      data = data.filter((s) => s.name.toLowerCase().includes(q) || s.phone.toLowerCase().includes(q));
    }

    const totalSuppliersWithDue = data.filter((s) => s.totalDue > 0).length;
    const totalDueAmount = data.reduce((sum, s) => sum + s.totalDue, 0);

    return {
      summary: {
        totalSuppliers: data.length,
        totalSuppliersWithDue,
        totalDueAmount,
        totalDue: totalDueAmount,
        suppliersWithDueCount: totalSuppliersWithDue,
        highDueCount: data.filter((s) => s.totalDue > 200000).length,
      },
      data,
      supplierDues: data,
    };
  }

  // ============================= SUMMARY =============================

  async getSummary(query?: {
    branch?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const branchId = await this.resolveBranchId(query?.branch);
    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (query?.dateFrom) dateFilter.gte = new Date(query.dateFrom);
    if (query?.dateTo) {
      const to = new Date(query.dateTo);
      to.setHours(23, 59, 59, 999);
      dateFilter.lte = to;
    }
    const hasDateFilter = Boolean(query?.dateFrom || query?.dateTo);

    const [orders, serviceJobs, expenses, payrolls, purchaseOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          ...(branchId ? { branchId } : {}),
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        select: {
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          discountAmount: true,
          status: true,
        },
      }),
      this.prisma.serviceJob.findMany({
        where: {
          ...(branchId ? { order: { branchId } } : {}),
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        select: {
          serviceCharge: true,
          status: true,
        },
      }),
      this.prisma.expense.findMany({
        where: {
          ...(branchId ? { branchId } : {}),
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        select: {
          amount: true,
          status: true,
        },
      }),
      this.prisma.payroll.findMany({
        where: {
          ...(branchId ? { staff: { branchId } } : {}),
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        select: {
          netSalary: true,
          status: true,
        },
      }),
      this.prisma.purchaseOrder.findMany({
        where: {
          ...(branchId ? { branchId } : {}),
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        select: {
          grandTotal: true,
          amountPaid: true,
          dueAmount: true,
          status: true,
        },
      }),
    ]);

    // Sales calculations
    const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) =>
      [OrderStatus.DELIVERED, OrderStatus.COMPLETED].includes(o.status as any),
    ).length;
    const pendingOrders = orders.filter((o) =>
      [OrderStatus.CONFIRMED, OrderStatus.PENDING, OrderStatus.PARCEL_BOOKED].includes(o.status as any),
    ).length;
    const totalDue = orders.reduce((sum, o) => sum + Number(o.dueAmount), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discountAmount), 0);

    // Service calculations
    const totalServiceRevenue = serviceJobs.reduce((sum, j) => sum + Number(j.serviceCharge), 0);
    const totalJobs = serviceJobs.length;
    const completedJobs = serviceJobs.filter((j) => (j.status as string) === 'DELIVERED').length;
    const pendingJobs = serviceJobs.filter((j) => ['PENDING', 'IN_PROGRESS'].includes(j.status as string)).length;
    const readyJobs = serviceJobs.filter((j) => (j.status as string) === 'READY_FOR_PICKUP').length;

    // Expense calculations
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const paidExpenses = expenses.filter((e) => e.status === ExpenseStatus.PAID).reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingExpenses = totalExpenses - paidExpenses;

    // Payroll calculations
    const totalPayroll = payrolls.reduce((sum, p) => sum + Number(p.netSalary), 0);
    const paidPayroll = payrolls.filter((p) => p.status === PayrollStatus.PAID).reduce((sum, p) => sum + Number(p.netSalary), 0);
    const pendingPayroll = totalPayroll - paidPayroll;

    // Purchase calculations
    const totalPurchases = purchaseOrders.reduce((sum, po) => sum + Number(po.grandTotal), 0);
    const totalPOs = purchaseOrders.length;
    const receivedPOs = purchaseOrders.filter((po) => po.status === 'RECEIVED').length;
    const dueAmount = purchaseOrders.reduce((sum, po) => sum + Number(po.dueAmount), 0);

    return {
      salesSummary: {
        totalSales,
        totalOrders,
        completedOrders,
        pendingOrders,
        totalDue,
        totalDiscount,
      },
      serviceSummary: {
        totalServiceRevenue,
        totalJobs,
        completedJobs,
        pendingJobs,
        readyJobs,
      },
      expenseSummary: {
        totalExpenses,
        totalCount: expenses.length,
        paidExpenses,
        pendingExpenses,
      },
      payrollSummary: {
        totalPayroll,
        paidPayroll,
        pendingPayroll,
        totalSheets: payrolls.length,
      },
      purchaseSummary: {
        totalPurchases,
        totalPOs,
        receivedPOs,
        dueAmount,
      },
    };
  }

  // ============================= DISCOUNT REPORT =============================

  async getDiscountReport(query?: {
    branch?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }) {
    const branchId = await this.resolveBranchId(query?.branch);
    const where: Prisma.OrderWhereInput = {
      discountAmount: { gt: 0 },
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.RETURNED] },
    };

    if (branchId) where.branchId = branchId;
    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        branch: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalDiscountGiven = orders.reduce((acc, o) => acc + Number(o.discountAmount), 0);
    const totalOrderValueBeforeDiscount = orders.reduce(
      (acc, o) => acc + Number(o.totalAmount) + Number(o.discountAmount),
      0,
    );

    const avgDiscountPercentage =
      totalOrderValueBeforeDiscount > 0
        ? Math.round((totalDiscountGiven / totalOrderValueBeforeDiscount) * 100 * 10) / 10
        : 0;

    const mappedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderCode,
      orderCode: o.orderCode,
      createdAt: o.createdAt,
      date: o.createdAt,
      customerName: o.customer?.name || 'Walk-in',
      customerPhone: o.customer?.phone || 'N/A',
      branch: o.branch?.name || 'Global',
      orderTotal: Number(o.totalAmount),
      totalAmount: Number(o.totalAmount),
      discount: Number(o.discountAmount),
      discountAmount: Number(o.discountAmount),
      discountPercentage:
        Number(o.totalAmount) + Number(o.discountAmount) > 0
          ? Math.round(
              (Number(o.discountAmount) /
                (Number(o.totalAmount) + Number(o.discountAmount))) *
                100,
            )
          : 0,
      promoCode: 'DIRECT_DISCOUNT',
      status: o.status,
    }));

    return {
      summary: {
        totalDiscountGiven,
        discountedOrdersCount: orders.length,
        ordersWithDiscountCount: orders.length,
        avgDiscountPercentage,
      },
      orders: mappedOrders,
      ordersWithDiscount: mappedOrders,
    };
  }

  // ============================= DASHBOARD DATA =============================

  async getDashboardData(query?: {
    branch?: string;
    period?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const branchId = await this.resolveBranchId(query?.branch);

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (query?.dateFrom) dateFilter.gte = new Date(query.dateFrom);
    if (query?.dateTo) {
      const to = new Date(query.dateTo);
      to.setHours(23, 59, 59, 999);
      dateFilter.lte = to;
    }
    const hasDateFilter = Boolean(query?.dateFrom || query?.dateTo);

    const orderWhere: Prisma.OrderWhereInput = {
      ...(branchId ? { branchId } : {}),
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    };

    const serviceJobWhere: Prisma.ServiceJobWhereInput = {
      ...(branchId ? { order: { branchId } } : {}),
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    };

    const expenseWhere: Prisma.ExpenseWhereInput = {
      ...(branchId ? { branchId } : {}),
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    };

    const purchaseWhere: Prisma.PurchaseOrderWhereInput = {
      ...(branchId ? { branchId } : {}),
      ...(hasDateFilter ? { createdAt: dateFilter } : {}),
    };

    const [
      allOrders,
      serviceJobs,
      expenses,
      payrolls,
      purchaseOrders,
      recentOrders,
      topOrderItems,
      allCustomers,
    ] = await Promise.all([
      this.prisma.order.findMany({
        where: orderWhere,
        select: {
          id: true,
          totalAmount: true,
          paidAmount: true,
          dueAmount: true,
          discountAmount: true,
          status: true,
          createdAt: true,
          branchId: true,
        },
      }),
      this.prisma.serviceJob.findMany({
        where: serviceJobWhere,
        select: {
          id: true,
          serviceCharge: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.expense.findMany({
        where: expenseWhere,
        select: {
          id: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.payroll.findMany({
        where: {
          ...(branchId ? { staff: { branchId } } : {}),
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        select: {
          id: true,
          netSalary: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.purchaseOrder.findMany({
        where: purchaseWhere,
        select: {
          id: true,
          grandTotal: true,
          amountPaid: true,
          dueAmount: true,
          status: true,
          createdAt: true,
        },
      }),
      this.prisma.order.findMany({
        where: orderWhere,
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { id: true, name: true, phone: true, email: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      this.prisma.orderItem.findMany({
        where: {
          order: orderWhere,
        },
        include: {
          product: {
            include: {
              category: { select: { name: true } },
              images: { take: 1 },
              variants: { select: { stock: true } },
            },
          },
        },
      }),
      this.prisma.customer.findMany({
        where: branchId ? { orders: { some: { branchId } } } : {},
        take: 10,
        include: {
          orders: {
            where: orderWhere,
            select: { totalAmount: true },
          },
        },
      }),
    ]);

    // Financial KPI calculations
    const netProductSales = allOrders
      .filter((o) => o.status !== OrderStatus.CANCELLED && o.status !== OrderStatus.RETURNED)
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    const netServiceRevenue = serviceJobs
      .reduce((sum, j) => sum + Number(j.serviceCharge), 0);

    const totalRevenue = netProductSales + netServiceRevenue;

    const liquidSales = allOrders.reduce((sum, o) => sum + Number(o.paidAmount || 0), 0) + netServiceRevenue;

    const totalPaidExpense = expenses
      .filter((e) => e.status === ExpenseStatus.PAID)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalPaidPayroll = payrolls
      .filter((p) => p.status === PayrollStatus.PAID)
      .reduce((sum, p) => sum + Number(p.netSalary), 0);

    const totalExpensePayroll = totalPaidExpense + totalPaidPayroll;

    const totalPurchase = purchaseOrders.reduce((sum, po) => sum + Number(po.grandTotal), 0);

    const totalSupplierPayment = purchaseOrders.reduce((sum, po) => sum + Number(po.amountPaid), 0);

    const totalSupplierDue = purchaseOrders.reduce((sum, po) => sum + Number(po.dueAmount), 0);

    // Order status breakdown
    const orderStatusCounts = {
      pending: allOrders.filter((o) => o.status === OrderStatus.PENDING).length,
      confirmed: allOrders.filter((o) => o.status === OrderStatus.CONFIRMED).length,
      parcelBooked: allOrders.filter((o) => o.status === OrderStatus.PARCEL_BOOKED).length,
      delivered: allOrders.filter((o) => o.status === OrderStatus.DELIVERED).length,
      returned: allOrders.filter((o) => o.status === OrderStatus.RETURNED).length,
      cancelled: allOrders.filter((o) => o.status === OrderStatus.CANCELLED).length,
      diagnosing: serviceJobs.filter((j) => ['PENDING', 'IN_PROGRESS', 'DIAGNOSING'].includes(j.status as string)).length,
      completed: allOrders.filter((o) => o.status === OrderStatus.COMPLETED).length + serviceJobs.filter((j) => (j.status as string) === 'DELIVERED').length,
    };

    // Chart Data (Last 7 Days)
    const chartDays = 7;
    const chartData: any[] = [];
    const now = new Date();
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayOrders = allOrders.filter((o) => {
        const oDate = new Date(o.createdAt);
        return oDate >= dayStart && oDate <= dayEnd;
      });

      const dayExpenses = expenses.filter((e) => {
        const eDate = new Date(e.createdAt);
        return eDate >= dayStart && eDate <= dayEnd;
      });

      const dayIncome = dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const dayExpenseTotal = dayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

      chartData.push({
        name: dayName,
        income: dayIncome,
        expense: dayExpenseTotal,
        order: dayOrders.length,
      });
    }

    // Top Products
    const prodMap = new Map<string, { id: string; name: string; category: string; price: number; unitsSold: number; image: string | null }>();
    for (const item of topOrderItems) {
      const pid = item.productId;
      if (!prodMap.has(pid)) {
        prodMap.set(pid, {
          id: pid,
          name: item.productNameSnapshot || item.product?.name || 'Product',
          category: item.product?.category?.name || 'Category',
          price: Number(item.unitPrice),
          unitsSold: 0,
          image: item.product?.images?.[0]?.url || null,
        });
      }
      prodMap.get(pid)!.unitsSold += item.quantity;
    }
    const topSellingProducts = Array.from(prodMap.values())
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Top Customers
    const topCustomersList = allCustomers
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone || 'N/A',
        ordersCount: c.orders.length,
        totalSpend: c.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 5);

    return {
      kpi: {
        totalRevenue,
        netProductSales,
        netServiceRevenue,
        liquidSales,
        totalExpensePayroll,
        totalPurchase,
        totalSupplierPayment,
        totalSupplierDue,
      },
      orderStatuses: orderStatusCounts,
      chartData,
      topProducts: topSellingProducts,
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        customerName: o.customer?.name || 'Customer',
        branchName: o.branch?.name || 'Global',
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
      })),
      topCustomers: topCustomersList,
    };
  }
}
