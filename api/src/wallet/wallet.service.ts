import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWalletTypeDto,
  UpdateWalletTypeDto,
  CreatePurposeDto,
  UpdatePurposeDto,
  CreateWalletTransactionDto,
  CreateStaffPaymentDto,
  CreateTransferDto,
} from './dto/wallet.dto';
import { PayrollLineType, Prisma, WalletTxnType, StaffStatus } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // ============================= WALLET TYPES =============================

  async findAllWalletTypes() {
    return this.prisma.walletType.findMany({
      orderBy: { name: 'asc' },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        _count: {
          select: { transactions: true, expenses: true, supplierPayments: true },
        },
      },
    });
  }

  async findOneWalletType(id: string) {
    const wallet = await this.prisma.walletType.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, code: true } },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            purpose: true,
            branch: { select: { id: true, name: true } },
            recordedBy: { select: { id: true, name: true } },
          },
        },
        _count: {
          select: { transactions: true, expenses: true, supplierPayments: true },
        },
      },
    });
    if (!wallet) throw new NotFoundException(`Wallet type with ID "${id}" not found.`);
    return wallet;
  }

  async createWalletType(dto: CreateWalletTypeDto) {
    return this.prisma.walletType.create({
      data: {
        name: dto.name,
        kind: dto.kind,
        accountNumber: dto.accountNumber || null,
        icon: dto.icon || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        branchId: dto.branchId || null,
        currentBalance: dto.initialBalance || 0,
        status: dto.status || StaffStatus.ACTIVE,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async updateWalletType(id: string, dto: UpdateWalletTypeDto) {
    await this.findOneWalletType(id);
    return this.prisma.walletType.update({
      where: { id },
      data: {
        name: dto.name,
        kind: dto.kind,
        accountNumber: dto.accountNumber !== undefined ? dto.accountNumber : undefined,
        icon: dto.icon !== undefined ? dto.icon : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
        branchId: dto.branchId !== undefined ? dto.branchId : undefined,
        status: dto.status,
      },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async toggleActiveWalletType(id: string) {
    const wallet = await this.findOneWalletType(id);
    return this.prisma.walletType.update({
      where: { id },
      data: { isActive: !wallet.isActive },
      include: {
        branch: { select: { id: true, name: true, code: true } },
      },
    });
  }

  async removeWalletType(id: string) {
    const wallet = await this.findOneWalletType(id);
    if (Number(wallet.currentBalance) !== 0) {
      throw new ConflictException(
        `Cannot delete wallet "${wallet.name}" because it has a non-zero balance of ৳${Number(wallet.currentBalance).toLocaleString()}. Please withdraw or transfer funds first.`,
      );
    }

    if (
      wallet._count.transactions > 0 ||
      wallet._count.expenses > 0 ||
      wallet._count.supplierPayments > 0
    ) {
      throw new ConflictException(
        `Cannot delete wallet "${wallet.name}" because it has associated transaction history. Please mark it as Inactive instead.`,
      );
    }

    return this.prisma.walletType.delete({ where: { id } });
  }

  async getWalletTypesSummary() {
    const wallets = await this.prisma.walletType.findMany({
      where: { status: 'ACTIVE' },
      select: { currentBalance: true, isActive: true },
    });

    const totalBalance = wallets.reduce(
      (acc, w) => acc + Number(w.currentBalance),
      0,
    );

    const highestBalance = wallets.length > 0
      ? Math.max(...wallets.map((w) => Number(w.currentBalance)))
      : 0;

    return {
      totalWallets: wallets.length,
      totalLiquidity: totalBalance,
      highestBalance,
      totalBalance,
      walletCount: wallets.length,
    };
  }

  // ============================= PURPOSES =============================

  async findAllPurposes() {
    return this.prisma.purpose.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { transactions: true } },
      },
    });
  }

  async findOnePurpose(id: string) {
    const purpose = await this.prisma.purpose.findUnique({
      where: { id },
      include: { _count: { select: { transactions: true } } },
    });
    if (!purpose) throw new NotFoundException(`Purpose with ID "${id}" not found.`);
    return purpose;
  }

  async createPurpose(dto: CreatePurposeDto) {
    try {
      return await this.prisma.purpose.create({
        data: {
          name: dto.name,
          category: dto.category,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException(`Purpose with name "${dto.name}" already exists.`);
      }
      throw e;
    }
  }

  async updatePurpose(id: string, dto: UpdatePurposeDto) {
    await this.findOnePurpose(id);
    try {
      return await this.prisma.purpose.update({
        where: { id },
        data: {
          name: dto.name,
          category: dto.category,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException(`Purpose with name "${dto.name}" already exists.`);
      }
      throw e;
    }
  }

  async removePurpose(id: string) {
    const purpose = await this.findOnePurpose(id);
    if (purpose._count.transactions > 0) {
      throw new ConflictException(
        `Cannot delete purpose "${purpose.name}" because it is linked to ${purpose._count.transactions} historical transaction(s).`,
      );
    }
    return this.prisma.purpose.delete({ where: { id } });
  }

  // ============================= TRANSACTIONS =============================

  async findAllTransactions(query?: {
    walletType?: string;
    purpose?: string;
    type?: WalletTxnType;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {};

    if (query?.walletType) where.walletTypeId = query.walletType;
    if (query?.purpose) where.purposeId = query.purpose;
    if (query?.type) where.type = query.type;

    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { referenceNo: { contains: term, mode: 'insensitive' } },
        { note: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.walletTransaction.count({ where }),
      this.prisma.walletTransaction.findMany({
        where,
        include: {
          walletType: { select: { id: true, name: true, kind: true, accountNumber: true } },
          purpose: { select: { id: true, name: true, category: true } },
          branch: { select: { id: true, name: true, code: true } },
          recordedBy: { select: { id: true, name: true, employeeId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createTransaction(dto: CreateWalletTransactionDto, recordedById: string) {
    const wallet = await this.findOneWalletType(dto.walletTypeId);

    if (dto.purposeId) {
      await this.findOnePurpose(dto.purposeId);
    }

    const amount = Number(dto.amount);
    const currentBalance = Number(wallet.currentBalance);

    if (dto.type === WalletTxnType.WITHDRAWAL && currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance in wallet "${wallet.name}". Required: ৳${amount.toLocaleString()}, Current Balance: ৳${currentBalance.toLocaleString()}.`,
      );
    }

    const balanceAfter =
      dto.type === WalletTxnType.DEPOSIT
        ? currentBalance + amount
        : currentBalance - amount;

    return this.prisma.$transaction(async (tx) => {
      await tx.walletType.update({
        where: { id: dto.walletTypeId },
        data: { currentBalance: balanceAfter },
      });

      const referenceNo = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

      return tx.walletTransaction.create({
        data: {
          walletTypeId: dto.walletTypeId,
          type: dto.type,
          amount,
          purposeId: dto.purposeId || null,
          branchId: dto.branchId || null,
          referenceNo,
          note: dto.note || null,
          recordedById,
          balanceAfter,
        },
        include: {
          walletType: true,
          purpose: true,
          branch: { select: { id: true, name: true, code: true } },
          recordedBy: { select: { id: true, name: true } },
        },
      });
    });
  }

  async transferFunds(dto: CreateTransferDto, recordedById: string) {
    if (dto.sourceWalletId === dto.targetWalletId) {
      throw new BadRequestException('Source and target wallets must be different.');
    }

    const [sourceWallet, targetWallet] = await Promise.all([
      this.findOneWalletType(dto.sourceWalletId),
      this.findOneWalletType(dto.targetWalletId),
    ]);

    const amount = Number(dto.amount);
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be greater than zero.');
    }

    const sourceCurrent = Number(sourceWallet.currentBalance);
    if (sourceCurrent < amount) {
      throw new BadRequestException(
        `Insufficient balance in source wallet "${sourceWallet.name}". Required: ৳${amount.toLocaleString()}, Available: ৳${sourceCurrent.toLocaleString()}.`,
      );
    }

    const targetCurrent = Number(targetWallet.currentBalance);
    const newSourceBalance = sourceCurrent - amount;
    const newTargetBalance = targetCurrent + amount;

    const transferGroupId = `TRF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const refWithdraw = `TRF-OUT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const refDeposit = `TRF-IN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Update source wallet balance
      await tx.walletType.update({
        where: { id: dto.sourceWalletId },
        data: { currentBalance: newSourceBalance },
      });

      // 2. Update target wallet balance
      await tx.walletType.update({
        where: { id: dto.targetWalletId },
        data: { currentBalance: newTargetBalance },
      });

      // 3. Create WITHDRAWAL transaction on source wallet
      const withdrawTxn = await tx.walletTransaction.create({
        data: {
          walletTypeId: dto.sourceWalletId,
          type: WalletTxnType.WITHDRAWAL,
          amount,
          transferGroupId,
          branchId: dto.targetBranchId || null,
          referenceNo: refWithdraw,
          note: dto.note || `Internal Transfer to ${targetWallet.name}`,
          recordedById,
          balanceAfter: newSourceBalance,
        },
      });

      // 4. Create DEPOSIT transaction on target wallet
      const depositTxn = await tx.walletTransaction.create({
        data: {
          walletTypeId: dto.targetWalletId,
          type: WalletTxnType.DEPOSIT,
          amount,
          transferGroupId,
          branchId: dto.targetBranchId || null,
          referenceNo: refDeposit,
          note: dto.note || `Internal Transfer from ${sourceWallet.name}`,
          recordedById,
          balanceAfter: newTargetBalance,
        },
      });

      return {
        success: true,
        transferGroupId,
        amount,
        sourceWallet: {
          id: sourceWallet.id,
          name: sourceWallet.name,
          balanceBefore: sourceCurrent,
          balanceAfter: newSourceBalance,
        },
        targetWallet: {
          id: targetWallet.id,
          name: targetWallet.name,
          balanceBefore: targetCurrent,
          balanceAfter: newTargetBalance,
        },
        withdrawTxn,
        depositTxn,
        message: `Successfully transferred ৳${amount.toLocaleString()} from ${sourceWallet.name} to ${targetWallet.name}.`,
      };
    });
  }

  async findAllTransfers(query?: {
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {
      transferGroupId: { not: null },
      type: WalletTxnType.WITHDRAWAL, // Query source withdrawal records as representatives
    };

    if (query?.dateFrom || query?.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) {
        const to = new Date(query.dateTo);
        to.setHours(23, 59, 59, 999);
        where.createdAt.lte = to;
      }
    }

    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { transferGroupId: { contains: term, mode: 'insensitive' } },
        { note: { contains: term, mode: 'insensitive' } },
        { walletType: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [total, withdrawalTxns] = await Promise.all([
      this.prisma.walletTransaction.count({ where }),
      this.prisma.walletTransaction.findMany({
        where,
        include: {
          walletType: { select: { id: true, name: true, kind: true, accountNumber: true } },
          branch: { select: { id: true, name: true, code: true } },
          recordedBy: { select: { id: true, name: true, employeeId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    // Find corresponding DEPOSIT partner transactions
    const transferGroupIds = withdrawalTxns
      .map((t) => t.transferGroupId)
      .filter(Boolean) as string[];

    const depositTxns = await this.prisma.walletTransaction.findMany({
      where: {
        transferGroupId: { in: transferGroupIds },
        type: WalletTxnType.DEPOSIT,
      },
      include: {
        walletType: { select: { id: true, name: true, kind: true, accountNumber: true } },
        branch: { select: { id: true, name: true, code: true } },
      },
    });

    const depositMap = new Map<string, any>();
    for (const d of depositTxns) {
      if (d.transferGroupId) {
        depositMap.set(d.transferGroupId, d);
      }
    }

    const data = withdrawalTxns.map((w) => {
      const dep = w.transferGroupId ? depositMap.get(w.transferGroupId) : null;
      return {
        id: w.id,
        transferGroupId: w.transferGroupId,
        createdAt: w.createdAt,
        amount: Number(w.amount),
        note: w.note,
        sourceWallet: w.walletType,
        targetWallet: dep?.walletType || { name: 'Unknown Wallet', kind: 'CASH' },
        branch: w.branch || dep?.branch || null,
        isBranchTransfer: Boolean(w.branchId || dep?.branchId),
        recordedBy: w.recordedBy,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createStaffPayment(dto: CreateStaffPaymentDto, recordedById: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: dto.staffId },
      select: { id: true, name: true, employeeId: true },
    });
    if (!staff) throw new NotFoundException(`Staff with ID "${dto.staffId}" not found.`);

    const wallet = await this.findOneWalletType(dto.walletTypeId);
    const amount = Number(dto.amount);
    const currentBalance = Number(wallet.currentBalance);

    if (currentBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance in wallet "${wallet.name}". Required: ৳${amount.toLocaleString()}, Current Balance: ৳${currentBalance.toLocaleString()}.`,
      );
    }

    const payType = dto.payType.toUpperCase() as PayrollLineType;
    const newBalance = currentBalance - amount;

    return this.prisma.$transaction(async (tx) => {
      await tx.walletType.update({
        where: { id: dto.walletTypeId },
        data: { currentBalance: newBalance },
      });

      const refNo = `PAY-${payType.slice(0, 3)}-${Date.now()}`;
      return tx.walletTransaction.create({
        data: {
          walletTypeId: dto.walletTypeId,
          type: WalletTxnType.WITHDRAWAL,
          amount,
          payType,
          staffId: dto.staffId,
          referenceNo: refNo,
          note: dto.note || `${payType} payment for ${staff.name} (${staff.employeeId})`,
          recordedById,
          balanceAfter: newBalance,
        },
        include: {
          walletType: { select: { id: true, name: true, kind: true } },
          staff: { select: { id: true, name: true, employeeId: true, phone: true } },
          recordedBy: { select: { id: true, name: true, employeeId: true } },
        },
      });
    });
  }

  async findAllStaffPayments(query?: {
    search?: string;
    walletTypeId?: string;
    month?: string;
    payType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.WalletTransactionWhereInput = {
      OR: [
        { staffId: { not: null } },
        { payType: { not: null } },
      ],
    };

    if (query?.walletTypeId && query.walletTypeId !== 'all') {
      where.walletTypeId = query.walletTypeId;
    }

    if (query?.payType && query.payType !== 'all') {
      where.payType = query.payType.toUpperCase() as PayrollLineType;
    }

    if (query?.month) {
      const [y, m] = query.month.split('-').map(Number);
      const startOfMonth = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
      where.createdAt = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.AND = [
        {
          OR: [
            { staff: { name: { contains: term, mode: 'insensitive' } } },
            { staff: { phone: { contains: term, mode: 'insensitive' } } },
            { staff: { employeeId: { contains: term, mode: 'insensitive' } } },
            { note: { contains: term, mode: 'insensitive' } },
            { referenceNo: { contains: term, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const [total, rawData] = await Promise.all([
      this.prisma.walletTransaction.count({ where }),
      this.prisma.walletTransaction.findMany({
        where,
        include: {
          walletType: {
            select: {
              id: true,
              name: true,
              kind: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
              employeeId: true,
              phone: true,
              photo: true,
              department: { select: { id: true, name: true } },
              role: { select: { id: true, name: true } },
              branch: { select: { id: true, name: true } },
            },
          },
          recordedBy: {
            select: { id: true, name: true, employeeId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const data = rawData.map((txn) => {
      let salaryMonth = txn.createdAt.toISOString().slice(0, 7);
      const noteMatch = txn.note?.match(/(\d{4}-\d{2})/);
      if (noteMatch) {
        salaryMonth = noteMatch[1];
      }

      return {
        ...txn,
        salaryMonth,
      };
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

