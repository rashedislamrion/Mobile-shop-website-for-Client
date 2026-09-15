import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  UpdateStatusDto,
  MakeTechnicianDto,
} from './dto/create-employee.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, StaffStatus } from '@prisma/client';

export const STAFF_SELECT_SAFE = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  phone: true,
  photo: true,
  address: true,
  birthCertificateUrl: true,
  bonusLimit: true,
  adminPanelAccess: true,
  isTechnician: true,
  commissionRate: true,
  emergencyContactName: true,
  emergencyContactPhone: true,
  emergencyContactRelationship: true,
  sendCredentialsEmailOnCreate: true,
  gender: true,
  dob: true,
  nidNumber: true,
  roleId: true,
  role: { select: { id: true, name: true, scope: true } },
  departmentId: true,
  department: { select: { id: true, name: true } },
  branchId: true,
  branch: { select: { id: true, name: true, code: true } },
  branchAccess: {
    select: {
      id: true,
      branchId: true,
      branch: { select: { id: true, name: true, code: true } },
    },
  },
  employmentType: true,
  joiningDate: true,
  reportingManagerId: true,
  reportingManager: { select: { id: true, name: true, employeeId: true } },
  status: true,
  basicSalary: true,
  allowances: true,
  paymentMethod: true,
  bankAccountNo: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  private async generateNextEmployeeId(): Promise<string> {
    const lastStaff = await this.prisma.staff.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { employeeId: true },
    });

    if (!lastStaff || !lastStaff.employeeId) {
      return 'EMP-0001';
    }

    const match = lastStaff.employeeId.match(/EMP-(\d+)/);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `EMP-${String(nextNum).padStart(4, '0')}`;
    }

    const count = await this.prisma.staff.count();
    return `EMP-${String(count + 1).padStart(4, '0')}`;
  }

  private mapStaffAccess(staff: any) {
    const access = staff.role?.scope === 'GLOBAL' ? 'Admin' : 'Branch Only';
    return {
      ...staff,
      access,
    };
  }

  async findAll(query?: {
    department?: string;
    role?: string;
    branch?: string;
    status?: StaffStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query?.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.StaffWhereInput = {};

    if (query?.department) where.departmentId = query.department;
    if (query?.role) {
      where.OR = [
        { roleId: query.role },
        { role: { name: { equals: query.role, mode: 'insensitive' } } },
      ];
    }
    if (query?.branch) {
      where.OR = [
        { branchId: query.branch },
        { branchAccess: { some: { branchId: query.branch } } },
      ];
    }
    if (query?.status) where.status = query.status;

    if (query?.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { employeeId: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [total, rawData] = await Promise.all([
      this.prisma.staff.count({ where }),
      this.prisma.staff.findMany({
        where,
        select: STAFF_SELECT_SAFE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const data = rawData.map((s) => this.mapStaffAccess(s));

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

  async findOne(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      select: {
        ...STAFF_SELECT_SAFE,
        managedBranches: { select: { id: true, name: true, code: true } },
        headOfDepartments: { select: { id: true, name: true } },
        reports: { select: { id: true, name: true, employeeId: true, status: true } },
      },
    });

    if (!staff) throw new NotFoundException(`Employee with ID "${id}" not found.`);
    return this.mapStaffAccess(staff);
  }

  async create(dto: CreateEmployeeDto) {
    const rawPassword = dto.password || 'Temp@123456';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const employeeId = await this.generateNextEmployeeId();

    const branchIds = dto.branchIds && dto.branchIds.length > 0
      ? dto.branchIds
      : dto.branchId
      ? [dto.branchId]
      : [];
    const primaryBranchId = branchIds.length > 0 ? branchIds[0] : dto.branchId || null;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const staff = await tx.staff.create({
          data: {
            employeeId,
            name: dto.name,
            email: dto.email.toLowerCase().trim(),
            phone: dto.phone.trim(),
            passwordHash,
            photo: dto.photo || null,
            address: dto.address || null,
            birthCertificateUrl: dto.birthCertificateUrl || null,
            bonusLimit: dto.bonusLimit !== undefined ? new Prisma.Decimal(dto.bonusLimit) : new Prisma.Decimal(0),
            adminPanelAccess: dto.adminPanelAccess ?? false,
            isTechnician: dto.isTechnician ?? false,
            commissionRate: dto.commissionRate !== undefined ? new Prisma.Decimal(dto.commissionRate) : new Prisma.Decimal(0),
            emergencyContactName: dto.emergencyContactName || null,
            emergencyContactPhone: dto.emergencyContactPhone || null,
            emergencyContactRelationship: dto.emergencyContactRelationship || null,
            sendCredentialsEmailOnCreate: dto.sendCredentialsEmail ?? false,
            gender: dto.gender || null,
            dob: dto.dob ? new Date(dto.dob) : null,
            nidNumber: dto.nidNumber || null,
            roleId: dto.roleId,
            departmentId: dto.departmentId || null,
            branchId: primaryBranchId,
            employmentType: dto.employmentType || 'FULL_TIME',
            joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
            reportingManagerId: dto.reportingManagerId || null,
            status: dto.status || StaffStatus.ACTIVE,
            basicSalary: dto.basicSalary ? new Prisma.Decimal(dto.basicSalary) : new Prisma.Decimal(0),
            allowances: dto.allowances ? (dto.allowances as any) : undefined,
            paymentMethod: dto.paymentMethod || null,
            bankAccountNo: dto.bankAccountNo || null,
          },
        });

        if (branchIds.length > 0) {
          await tx.staffBranchAccess.createMany({
            data: branchIds.map((bId) => ({
              staffId: staff.id,
              branchId: bId,
            })),
            skipDuplicates: true,
          });
        }

        const fullStaff = await tx.staff.findUnique({
          where: { id: staff.id },
          select: STAFF_SELECT_SAFE,
        });

        return this.mapStaffAccess(fullStaff);
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        const target = e.meta?.target || [];
        throw new ConflictException(
          `An employee with this ${Array.isArray(target) ? target.join('/') : 'email/phone'} already exists.`,
        );
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);

    const updateData: Prisma.StaffUpdateInput = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email.toLowerCase().trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone.trim();
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.photo !== undefined) updateData.photo = dto.photo || null;
    if (dto.address !== undefined) updateData.address = dto.address || null;
    if (dto.birthCertificateUrl !== undefined) updateData.birthCertificateUrl = dto.birthCertificateUrl || null;
    if (dto.bonusLimit !== undefined) updateData.bonusLimit = new Prisma.Decimal(dto.bonusLimit);
    if (dto.adminPanelAccess !== undefined) updateData.adminPanelAccess = dto.adminPanelAccess;
    if (dto.isTechnician !== undefined) updateData.isTechnician = dto.isTechnician;
    if (dto.commissionRate !== undefined) updateData.commissionRate = new Prisma.Decimal(dto.commissionRate);
    if (dto.emergencyContactName !== undefined) updateData.emergencyContactName = dto.emergencyContactName || null;
    if (dto.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = dto.emergencyContactPhone || null;
    if (dto.emergencyContactRelationship !== undefined) updateData.emergencyContactRelationship = dto.emergencyContactRelationship || null;
    if (dto.sendCredentialsEmail !== undefined) updateData.sendCredentialsEmailOnCreate = dto.sendCredentialsEmail;

    if (dto.gender !== undefined) updateData.gender = dto.gender || null;
    if (dto.dob !== undefined) updateData.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.nidNumber !== undefined) updateData.nidNumber = dto.nidNumber || null;
    if (dto.roleId !== undefined) updateData.role = { connect: { id: dto.roleId } };
    if (dto.departmentId !== undefined) {
      updateData.department = dto.departmentId
        ? { connect: { id: dto.departmentId } }
        : { disconnect: true };
    }

    if (dto.branchIds !== undefined) {
      const primaryId = dto.branchIds.length > 0 ? dto.branchIds[0] : null;
      updateData.branch = primaryId ? { connect: { id: primaryId } } : { disconnect: true };
    } else if (dto.branchId !== undefined) {
      updateData.branch = dto.branchId ? { connect: { id: dto.branchId } } : { disconnect: true };
    }

    if (dto.employmentType !== undefined) updateData.employmentType = dto.employmentType;
    if (dto.joiningDate !== undefined) {
      updateData.joiningDate = dto.joiningDate ? new Date(dto.joiningDate) : undefined;
    }
    if (dto.reportingManagerId !== undefined) {
      updateData.reportingManager = dto.reportingManagerId
        ? { connect: { id: dto.reportingManagerId } }
        : { disconnect: true };
    }
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.basicSalary !== undefined) updateData.basicSalary = new Prisma.Decimal(dto.basicSalary);
    if (dto.allowances !== undefined) updateData.allowances = dto.allowances as any;
    if (dto.paymentMethod !== undefined) updateData.paymentMethod = dto.paymentMethod || null;
    if (dto.bankAccountNo !== undefined) updateData.bankAccountNo = dto.bankAccountNo || null;

    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.staff.update({
          where: { id },
          data: updateData,
        });

        if (dto.branchIds !== undefined) {
          await tx.staffBranchAccess.deleteMany({
            where: { staffId: id },
          });

          if (dto.branchIds.length > 0) {
            await tx.staffBranchAccess.createMany({
              data: dto.branchIds.map((bId) => ({
                staffId: id,
                branchId: bId,
              })),
              skipDuplicates: true,
            });
          }
        }

        const fullStaff = await tx.staff.findUnique({
          where: { id },
          select: STAFF_SELECT_SAFE,
        });

        return this.mapStaffAccess(fullStaff);
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('An employee with this email or phone already exists.');
      }
      throw e;
    }
  }

  async resetPassword(id: string) {
    const staff = await this.findOne(id);
    const tempPassword = `Nova@${Math.floor(100000 + Math.random() * 900000)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await this.prisma.staff.update({
      where: { id },
      data: { passwordHash },
    });

    return {
      message: `Password reset successfully for ${staff.name}.`,
      tempPassword,
    };
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    await this.findOne(id);
    const updated = await this.prisma.staff.update({
      where: { id },
      data: { status: dto.status },
      select: STAFF_SELECT_SAFE,
    });
    return this.mapStaffAccess(updated);
  }

  async remove(id: string) {
    const staff = await this.prisma.staff.findUnique({
      where: { id },
      include: {
        managedBranches: { select: { id: true, name: true } },
        headOfDepartments: { select: { id: true, name: true } },
        Order: { select: { id: true }, take: 1 },
        ServiceJob: { select: { id: true }, take: 1 },
      },
    });

    if (!staff) throw new NotFoundException(`Employee with ID "${id}" not found.`);

    if (staff.managedBranches.length > 0) {
      throw new ConflictException(
        `Cannot delete ${staff.name} because they are assigned as Branch Manager for "${staff.managedBranches[0].name}". Please reassign the branch manager first.`,
      );
    }

    if (staff.headOfDepartments.length > 0) {
      throw new ConflictException(
        `Cannot delete ${staff.name} because they are Department Head of "${staff.headOfDepartments[0].name}". Please reassign the department head first.`,
      );
    }

    if (staff.Order.length > 0 || staff.ServiceJob.length > 0) {
      throw new ConflictException(
        `Cannot delete ${staff.name} because they have historical Orders or Service Jobs attributed to them. Please mark them as Inactive instead.`,
      );
    }

    return this.prisma.staff.delete({
      where: { id },
      select: { id: true, name: true, employeeId: true },
    });
  }

  // ============================= TECHNICIANS =============================

  async findTechnicians() {
    const techs = await this.prisma.staff.findMany({
      where: {
        OR: [
          { isTechnician: true },
          { role: { name: { contains: 'technician', mode: 'insensitive' } } },
        ],
      },
      select: {
        ...STAFF_SELECT_SAFE,
        ServiceJob: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return techs.map((t) => {
      const activeJobs = t.ServiceJob.filter(
        (j) => j.status === 'PENDING' || j.status === 'IN_PROGRESS',
      ).length;
      const completedJobs = t.ServiceJob.filter(
        (j) => j.status === 'READY_FOR_PICKUP' || j.status === 'DELIVERED',
      ).length;

      const { ServiceJob, ...rest } = t;
      const mapped = this.mapStaffAccess(rest);
      return {
        ...mapped,
        activeJobsCount: activeJobs,
        completedJobsCount: completedJobs,
        totalJobsCount: t.ServiceJob.length,
      };
    });
  }

  async findEligibleForTechnician() {
    return this.prisma.staff.findMany({
      where: {
        status: StaffStatus.ACTIVE,
        isTechnician: false,
      },
      select: {
        id: true,
        name: true,
        employeeId: true,
        phone: true,
        email: true,
        photo: true,
        department: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async makeTechnician(id: string, dto: MakeTechnicianDto) {
    await this.findOne(id);
    const updated = await this.prisma.staff.update({
      where: { id },
      data: {
        isTechnician: true,
        commissionRate: new Prisma.Decimal(dto.commissionRate || 0),
      },
      select: STAFF_SELECT_SAFE,
    });
    return this.mapStaffAccess(updated);
  }

  async updateTechnician(id: string, dto: MakeTechnicianDto) {
    await this.findOne(id);
    const updated = await this.prisma.staff.update({
      where: { id },
      data: {
        commissionRate: new Prisma.Decimal(dto.commissionRate || 0),
      },
      select: STAFF_SELECT_SAFE,
    });
    return this.mapStaffAccess(updated);
  }

  async removeTechnician(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.staff.update({
      where: { id },
      data: {
        isTechnician: false,
      },
      select: STAFF_SELECT_SAFE,
    });
    return this.mapStaffAccess(updated);
  }
}
