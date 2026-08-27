import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttributeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.attribute.findMany({
      include: {
        values: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const attribute = await this.prisma.attribute.findUnique({
      where: { id },
      include: {
        values: true,
      },
    });

    if (!attribute) {
      throw new NotFoundException(`Attribute with ID "${id}" not found`);
    }

    return attribute;
  }

  async create(dto: CreateAttributeDto) {
    try {
      return await this.prisma.attribute.create({
        data: {
          name: dto.name,
          values: {
            create: (dto.values || []).map((val) => ({ value: val })),
          },
        },
        include: {
          values: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Attribute with name "${dto.name}" already exists.`);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdateAttributeDto) {
    await this.findOne(id);

    return this.prisma.$transaction(async (tx) => {
      if (dto.values !== undefined) {
        await tx.attributeValue.deleteMany({
          where: { attributeId: id },
        });

        await tx.attributeValue.createMany({
          data: dto.values.map((val) => ({ attributeId: id, value: val })),
        });
      }

      return tx.attribute.update({
        where: { id },
        data: dto.name ? { name: dto.name } : {},
        include: {
          values: true,
        },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.attribute.delete({
      where: { id },
    });
  }
}
