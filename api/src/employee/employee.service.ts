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
  UpdateSpecializationsDto,
} from './dto/create-employee.dto';
import * as bcrypt from 'bcrypt';
import { Prisma, StaffStatus } from '@prisma/client';

const STAFF_SELECT_SAFE = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  phone: true,
  photo: true,
  gender: true,
  dob: true,
  nidNumber: true,
  roleId: true,
  role: { select: { id: true, name: true, scope: true } },
  departmentId: true,
  department: { select: { id: true, name: true } },
  branchId: true,
  branch: { select: { id: true, name: true, code: true } },
  employmentType: true,
  joiningDate: true,
  reportingManagerId: true,
  reportingManager: { select: { id: true, name: true, employeeId: true } },
  status: true,
  basicSalary: true,
  allowances: true,
  paymentMethod: true,
  bankAccountNo: true,
  specializations: true,
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
    if (query?.branch) where.branchId = query.branch;
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

    const [total, data] = await Promise.all([
      this.prisma.staff.count({ where }),
      this.prisma.staff.findMany({
        where,
        select: STAFF_SELECT_SAFE,
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
    return staff;
  }

  async create(dto: CreateEmployeeDto) {
    const rawPassword = dto.password || 'Temp@123456';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const employeeId = await this.generateNextEmployeeId();

    try {
      return await this.prisma.staff.create({
        data: {
          employeeId,
          name: dto.name,
          email: dto.email.toLowerCase().trim(),
          phone: dto.phone.trim(),
          passwordHash,
          photo: dto.photo || null,
          gender: dto.gender || null,
          dob: dto.dob ? new Date(dto.dob) : null,
          nidNumber: dto.nidNumber || null,
          roleId: dto.roleId,
          departmentId: dto.departmentId || null,
          branchId: dto.branchId || null,
          employmentType: dto.employmentType || 'FULL_TIME',
          joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : new Date(),
          reportingManagerId: dto.reportingManagerId || null,
          status: dto.status || StaffStatus.ACTIVE,
          basicSalary: dto.basicSalary || 0,
          allowances: dto.allowances ? (dto.allowances as any) : undefined,
          paymentMethod: dto.paymentMethod || null,
          bankAccountNo: dto.bankAccountNo || null,
          specializations: dto.specializations || [],
        },
        select: STAFF_SELECT_SAFE,
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
    if (dto.gender !== undefined) updateData.gender = dto.gender || null;
    if (dto.dob !== undefined) updateData.dob = dto.dob ? new Date(dto.dob) : null;
    if (dto.nidNumber !== undefined) updateData.nidNumber = dto.nidNumber || null;
    if (dto.roleId !== undefined) updateData.role = { connect: { id: dto.roleId } };
    if (dto.departmentId !== undefined) {
      updateData.department = dto.departmentId
        ? { connect: { id: dto.departmentId } }
        : { disconnect: true };
    }
    if (dto.branchId !== undefined) {
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
    if (dto.basicSalary !== undefined) updateData.basicSalary = dto.basicSalary;
    if (dto.allowances !== undefined) updateData.allowances = dto.allowances as any;
    if (dto.paymentMethod !== undefined) updateData.paymentMethod = dto.paymentMethod || null;
    if (dto.bankAccountNo !== undefined) updateData.bankAccountNo = dto.bankAccountNo || null;
    if (dto.specializations !== undefined) updateData.specializations = dto.specializations;

    try {
      return await this.prisma.staff.update({
        where: { id },
        data: updateData,
        select: STAFF_SELECT_SAFE,
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
    return this.prisma.staff.update({
      where: { id },
      data: { status: dto.status },
      select: STAFF_SELECT_SAFE,
    });
  }

  async updateSpecializations(id: string, dto: UpdateSpecializationsDto) {
    await this.findOne(id);
    return this.prisma.staff.update({
      where: { id },
      data: { specializations: dto.specializations },
      select: STAFF_SELECT_SAFE,
    });
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

  async findTechnicians() {
    const techs = await this.prisma.staff.findMany({
      where: {
        role: { name: { equals: 'Technician', mode: 'insensitive' } },
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
      return {
        ...rest,
        activeJobsCount: activeJobs,
        completedJobsCount: completedJobs,
        totalJobsCount: t.ServiceJob.length,
      };
    });
  }
}
