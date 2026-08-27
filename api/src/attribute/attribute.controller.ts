import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ModuleName, PermissionAction } from '@prisma/client';

@Controller('attributes')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Public()
  @Get()
  findAll() {
    return this.attributeService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attributeService.findOne(id);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.CREATE })
  @Post()
  create(@Body() dto: CreateAttributeDto) {
    return this.attributeService.create(dto);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.UPDATE })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttributeDto) {
    return this.attributeService.update(id, dto);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.DELETE })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attributeService.remove(id);
  }
}
