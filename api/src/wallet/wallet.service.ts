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
} from './dto/wallet.dto';
import { Prisma, WalletTxnType } from '@prisma/client';

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  // ============================= WALLET TYPES =============================

  async findAllWalletTypes() {
    return this.prisma.walletType.findMany({
      orderBy: { name: 'asc' },
      include: {
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
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            purpose: true,
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
        currentBalance: dto.initialBalance || 0,
        status: dto.status,
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
        status: dto.status,
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
      select: { currentBalance: true },
    });

    const totalBalance = wallets.reduce(
      (acc, w) => acc + Number(w.currentBalance),
      0,
    );

    return {
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
          walletType: { select: { id: true, name: true, kind: true } },
          purpose: { select: { id: true, name: true, category: true } },
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
          referenceNo,
          note: dto.note || null,
          recordedById,
          balanceAfter,
        },
        include: {
          walletType: true,
          purpose: true,
          recordedBy: { select: { id: true, name: true } },
        },
      });
    });
  }
}
