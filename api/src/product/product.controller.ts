import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ModuleName, PermissionAction, ProductStatus } from '@prisma/client';
import { createMulterConfig } from '../common/upload/multer.config';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get()
  findAllPublic(
    @Query('category') category?: string,
    @Query('brand') brand?: string,
    @Query('color') color?: string,
    @Query('quality') quality?: string,
    @Query('guarantee') guarantee?: string,
    @Query('frame') frame?: string,
    @Query('type') type?: string,
    @Query('service') service?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.productService.findAllPublic({
      category,
      brand,
      color,
      quality,
      guarantee,
      frame,
      type,
      service,
      sort,
      page,
      limit,
      search,
    });
  }

  @RequirePermission({ module: ModuleName.SALES, action: PermissionAction.CREATE })
  @Get('pos-search')
  posSearch(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('branch') branch?: string,
    @Query('limit') limit?: number,
  ) {
    return this.productService.posSearch({ search, category, branch, limit });
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.READ })
  @Get('admin')
  findAllAdmin(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('status') status?: ProductStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.productService.findAllAdmin({
      search,
      categoryId,
      brandId,
      status,
      page,
      limit,
    });
  }

  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.CREATE })
  @Post()
  @UseInterceptors(FilesInterceptor('images', 10, createMulterConfig('products')))
  create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productService.create(dto, files);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.UPDATE })
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 10, createMulterConfig('products')))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productService.update(id, dto, files);
  }

  @RequirePermission({ module: ModuleName.PRODUCTS, action: PermissionAction.DELETE })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
