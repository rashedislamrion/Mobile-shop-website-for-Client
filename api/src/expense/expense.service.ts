import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateExpenseCategoryDto,
  UpdateExpenseCategoryDto,
  CreateExpenseDto,
  MarkExpensePaidDto,
} from './dto/expense.dto';
import { ExpenseStatus, Prisma, WalletTxnType } from '@prisma/client';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  // ============================= CATEGORIES =============================

  async findAllCategories() {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const categories = await this.prisma.expenseCategory.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { expenses: true } },
        expenses: {
          where: {
            createdAt: { gte: startOfMonth },
            status: ExpenseStatus.PAID,
          },
          select: { amount: true },
        },
      },
    });

    return categories.map((cat) => {
      const thisMonthSpend = cat.expenses.reduce(
        (acc, exp) => acc + Number(exp.amount),
        0,
      );
      const { expenses, ...rest } = cat;
      return {
        ...rest,
        thisMonthSpend,
      };
    });
  }

  async findOneCategory(id: string) {
    const cat = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: {
        _count: { select: { expenses: true } },
      },
    });
    if (!cat) throw new NotFoundException(`Expense category "${id}" not found.`);
    return cat;
  }

  async createCategory(dto: CreateExpenseCategoryDto) {
    try {
      return await this.prisma.expenseCategory.create({
        data: {
          name: dto.name,
          icon: dto.icon || null,
          monthlyBudget: dto.monthlyBudget !== undefined ? dto.monthlyBudget : null,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException(`Expense category "${dto.name}" already exists.`);
      }
      throw e;
    }
  }

  async updateCategory(id: string, dto: UpdateExpenseCategoryDto) {
    await this.findOneCategory(id);
    try {
      return await this.prisma.expenseCategory.update({
        where: { id },
        data: {
          name: dto.name,
          icon: dto.icon !== undefined ? dto.icon || null : undefined,
          monthlyBudget: dto.monthlyBudget !== undefined ? dto.monthlyBudget : undefined,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException(`Expense category "${dto.name}" already exists.`);
      }
      throw e;
    }
  }

  async removeCategory(id: string) {
    const cat = await this.findOneCategory(id);
    if (cat._count.expenses > 0) {
      throw new ConflictException(
        `Cannot delete category "${cat.name}" because it has ${cat._count.expenses} associated expense record(s).`,
      );
    }
    return this.prisma.expenseCategory.delete({ where: { id } });
  }

  // ============================= EXPENSES =============================

  async findAllExpenses(query?: {
    branch?: string;
    category?: string;
    status?: ExpenseStatus;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ExpenseWhereInput = {};

    if (query?.branch) where.branchId = query.branch;
    if (query?.category) where.categoryId = query.category;
    if (query?.status) where.status = query.status;

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
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [total, data, thisMonthExpenses] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        include: {
          branch: { select: { id: true, name: true, code: true } },
          category: { select: { id: true, name: true, icon: true } },
          walletType: { select: { id: true, name: true, kind: true } },
          recordedBy: { select: { id: true, name: true, employeeId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.expense.findMany({
        where: {
          createdAt: { gte: startOfMonth },
          ...(query?.branch ? { branchId: query.branch } : {}),
        },
        select: { amount: true, status: true },
      }),
    ]);

    let thisMonthTotal = 0;
    let thisMonthPaid = 0;
    let thisMonthPending = 0;

    for (const exp of thisMonthExpenses) {
      const amt = Number(exp.amount);
      thisMonthTotal += amt;
      if (exp.status === ExpenseStatus.PAID) {
        thisMonthPaid += amt;
      } else {
        thisMonthPending += amt;
      }
    }

    return {
      data,
      summary: {
        thisMonthTotal,
        thisMonthPaid,
        thisMonthPending,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOneExpense(id: string) {
    const exp = await this.prisma.expense.findUnique({
      where: { id },
      include: {
        branch: true,
        category: true,
        walletType: true,
        recordedBy: { select: { id: true, name: true, employeeId: true } },
      },
    });
    if (!exp) throw new NotFoundException(`Expense record "${id}" not found.`);
    return exp;
  }

  async createExpense(
    dto: CreateExpenseDto,
    recordedById: string,
    attachmentUrl?: string,
  ) {
    const amount = Number(dto.amount);
    const referenceNo = `EXP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    return this.prisma.$transaction(async (tx) => {
      let branchId = dto.branchId;
      if (!branchId) {
        const defaultBranch = await tx.branch.findFirst();
        if (!defaultBranch) throw new NotFoundException('No branch found to assign expense.');
        branchId = defaultBranch.id;
      }

      let walletTypeId = dto.walletTypeId;
      if (!walletTypeId) {
        const defaultWallet = await tx.walletType.findFirst();
        if (!defaultWallet) throw new NotFoundException('No wallet found.');
        walletTypeId = defaultWallet.id;
      }

      let walletTxn: any = null;

      if (dto.status === ExpenseStatus.PAID) {
        const wallet = await tx.walletType.findUnique({
          where: { id: walletTypeId },
        });
        if (!wallet) throw new NotFoundException('Selected wallet not found.');

        const currentBal = Number(wallet.currentBalance);
        if (currentBal < amount) {
          throw new BadRequestException(
            `Insufficient balance in wallet "${wallet.name}". Required: ৳${amount.toLocaleString()}, Current Balance: ৳${currentBal.toLocaleString()}.`,
          );
        }

        const newBal = currentBal - amount;
        await tx.walletType.update({
          where: { id: walletTypeId },
          data: { currentBalance: newBal },
        });

        walletTxn = await tx.walletTransaction.create({
          data: {
            walletTypeId: walletTypeId,
            type: WalletTxnType.WITHDRAWAL,
            amount,
            referenceNo: `TXN-${referenceNo}`,
            note: `Payment for expense: ${dto.description}`,
            recordedById,
            balanceAfter: newBal,
          },
        });
      }

      const expense = await tx.expense.create({
        data: {
          referenceNo,
          branchId,
          categoryId: dto.categoryId,
          description: dto.description,
          amount,
          walletTypeId,
          status: dto.status || ExpenseStatus.PENDING,
          attachmentUrl: attachmentUrl || (dto as any).attachmentUrl || null,
          recordedById,
        },
        include: {
          branch: true,
          category: true,
          walletType: true,
          recordedBy: { select: { id: true, name: true } },
        },
      });

      return { expense, walletTransaction: walletTxn };
    });
  }

  async markPaid(id: string, dto: MarkExpensePaidDto, recordedById: string) {
    const exp = await this.findOneExpense(id);
    if (exp.status === ExpenseStatus.PAID) {
      throw new BadRequestException('This expense has already been marked as PAID.');
    }

    const amount = Number(exp.amount);

    return this.prisma.$transaction(async (tx) => {
      const walletTypeId = dto.walletTypeId || exp.walletTypeId;
      if (!walletTypeId) {
        throw new BadRequestException('No wallet specified for paying this expense.');
      }

      const wallet = await tx.walletType.findUnique({
        where: { id: walletTypeId },
      });
      if (!wallet) throw new NotFoundException('Selected wallet not found.');

      const currentBal = Number(wallet.currentBalance);
      if (currentBal < amount) {
        throw new BadRequestException(
          `Insufficient balance in wallet "${wallet.name}". Required: ৳${amount.toLocaleString()}, Current Balance: ৳${currentBal.toLocaleString()}.`,
        );
      }

      const newBal = currentBal - amount;
      await tx.walletType.update({
        where: { id: walletTypeId },
        data: { currentBalance: newBal },
      });

      const walletTxn = await tx.walletTransaction.create({
        data: {
          walletTypeId,
          type: WalletTxnType.WITHDRAWAL,
          amount,
          referenceNo: `TXN-${exp.referenceNo}-${Date.now()}`,
          note: `Payment for expense: ${exp.description}`,
          recordedById,
          balanceAfter: newBal,
        },
      });

      const updatedExpense = await tx.expense.update({
        where: { id },
        data: {
          status: ExpenseStatus.PAID,
          walletTypeId,
        },
        include: {
          branch: true,
          category: true,
          walletType: true,
          recordedBy: { select: { id: true, name: true } },
        },
      });

      return { expense: updatedExpense, walletTransaction: walletTxn };
    });
  }

  async removeExpense(id: string) {
    await this.findOneExpense(id);
    return this.prisma.expense.delete({ where: { id } });
  }
}
