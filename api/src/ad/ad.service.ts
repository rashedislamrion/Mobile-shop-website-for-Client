import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdDto, UpdateAdDto, TrackAdDto } from './dto/ad.dto';
import { AdPlacement, Prisma, PromoAdStatus } from '@prisma/client';

@Injectable()
export class AdService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { placement?: AdPlacement; status?: PromoAdStatus; search?: string }) {
    const where: Prisma.AdWhereInput = {};
    if (query?.placement) where.placement = query.placement;
    if (query?.status) where.status = query.status;
    if (query?.search?.trim()) {
      where.title = { contains: query.search.trim(), mode: 'insensitive' };
    }

    return this.prisma.ad.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  async findActive(placement?: AdPlacement) {
    const now = new Date();
    const where: Prisma.AdWhereInput = {
      status: PromoAdStatus.ACTIVE,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    };

    if (placement) {
      where.placement = placement;
    }

    return this.prisma.ad.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const ad = await this.prisma.ad.findUnique({ where: { id } });
    if (!ad) throw new NotFoundException(`Ad with ID "${id}" not found.`);
    return ad;
  }

  async create(dto: CreateAdDto) {
    return this.prisma.ad.create({
      data: {
        imageUrl: dto.imageUrl,
        title: dto.title,
        description: dto.description || null,
        placement: dto.placement,
        linkUrl: dto.linkUrl,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status || PromoAdStatus.ACTIVE,
      },
    });
  }

  async update(id: string, dto: UpdateAdDto) {
    await this.findOne(id);
    return this.prisma.ad.update({
      where: { id },
      data: {
        imageUrl: dto.imageUrl,
        title: dto.title,
        description: dto.description !== undefined ? dto.description || null : undefined,
        placement: dto.placement,
        linkUrl: dto.linkUrl,
        startDate: dto.startDate !== undefined ? (dto.startDate ? new Date(dto.startDate) : null) : undefined,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
        status: dto.status,
      },
    });
  }

  async track(id: string, dto: TrackAdDto) {
    const ad = await this.findOne(id);
    return this.prisma.ad.update({
      where: { id },
      data: {
        impressions: dto.type === 'impression' ? ad.impressions + 1 : undefined,
        clicks: dto.type === 'click' ? ad.clicks + 1 : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.ad.delete({ where: { id } });
  }
}
