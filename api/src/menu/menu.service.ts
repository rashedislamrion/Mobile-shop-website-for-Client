import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto, UpdateMenuItemDto, ReorderMenuItemsDto } from './dto/menu.dto';
import { MenuType, Prisma, StaffStatus } from '@prisma/client';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { menuType?: MenuType; status?: StaffStatus; search?: string }) {
    const where: Prisma.MenuItemWhereInput = {};
    if (query?.menuType) where.menuType = query.menuType;
    if (query?.status) where.status = query.status;
    if (query?.search?.trim()) {
      where.label = { contains: query.search.trim(), mode: 'insensitive' };
    }

    return this.prisma.menuItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findActiveByType(menuType?: MenuType) {
    const where: Prisma.MenuItemWhereInput = {
      status: StaffStatus.ACTIVE,
    };
    if (menuType) where.menuType = menuType;

    return this.prisma.menuItem.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Menu item with ID "${id}" not found.`);
    return item;
  }

  async create(dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data: {
        menuType: dto.menuType,
        label: dto.label,
        linkType: dto.linkType || 'CUSTOM',
        linkValue: dto.linkValue,
        openInNewTab: dto.openInNewTab || false,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : 0,
        status: dto.status || StaffStatus.ACTIVE,
      },
    });
  }

  async update(id: string, dto: UpdateMenuItemDto) {
    await this.findOne(id);
    return this.prisma.menuItem.update({
      where: { id },
      data: {
        menuType: dto.menuType,
        label: dto.label,
        linkType: dto.linkType,
        linkValue: dto.linkValue,
        openInNewTab: dto.openInNewTab,
        sortOrder: dto.sortOrder,
        status: dto.status,
      },
    });
  }

  async reorder(dto: ReorderMenuItemsDto) {
    return this.prisma.$transaction(
      dto.menuItemIds.map((id, index) =>
        this.prisma.menuItem.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menuItem.delete({ where: { id } });
  }
}
