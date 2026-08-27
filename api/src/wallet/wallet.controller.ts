import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import {
  CreateWalletTypeDto,
  UpdateWalletTypeDto,
  CreatePurposeDto,
  UpdatePurposeDto,
  CreateWalletTransactionDto,
} from './dto/wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ModuleName, PermissionAction, WalletTxnType } from '@prisma/client';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  // ============================= WALLET TYPES =============================

  @Get('wallet-types/summary')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.READ })
  getWalletTypesSummary() {
    return this.walletService.getWalletTypesSummary();
  }

  @Get('wallet-types')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.READ })
  findAllWalletTypes() {
    return this.walletService.findAllWalletTypes();
  }

  @Get('wallet-types/:id')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.READ })
  findOneWalletType(@Param('id') id: string) {
    return this.walletService.findOneWalletType(id);
  }

  @Post('wallet-types')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.CREATE })
  createWalletType(@Body() dto: CreateWalletTypeDto) {
    return this.walletService.createWalletType(dto);
  }

  @Patch('wallet-types/:id')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.UPDATE })
  updateWalletType(@Param('id') id: string, @Body() dto: UpdateWalletTypeDto) {
    return this.walletService.updateWalletType(id, dto);
  }

  @Delete('wallet-types/:id')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.DELETE })
  removeWalletType(@Param('id') id: string) {
    return this.walletService.removeWalletType(id);
  }

  // ============================= PURPOSES =============================

  @Get('purposes')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.READ })
  findAllPurposes() {
    return this.walletService.findAllPurposes();
  }

  @Get('purposes/:id')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.READ })
  findOnePurpose(@Param('id') id: string) {
    return this.walletService.findOnePurpose(id);
  }

  @Post('purposes')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.CREATE })
  createPurpose(@Body() dto: CreatePurposeDto) {
    return this.walletService.createPurpose(dto);
  }

  @Patch('purposes/:id')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.UPDATE })
  updatePurpose(@Param('id') id: string, @Body() dto: UpdatePurposeDto) {
    return this.walletService.updatePurpose(id, dto);
  }

  @Delete('purposes/:id')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.DELETE })
  removePurpose(@Param('id') id: string) {
    return this.walletService.removePurpose(id);
  }

  // ============================= TRANSACTIONS =============================

  @Get('wallet-transactions')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.READ })
  findAllTransactions(
    @Query('walletType') walletType?: string,
    @Query('purpose') purpose?: string,
    @Query('type') type?: WalletTxnType,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.walletService.findAllTransactions({
      walletType,
      purpose,
      type,
      dateFrom,
      dateTo,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Post('wallet-transactions')
  @RequirePermission({ module: ModuleName.WALLET, action: PermissionAction.CREATE })
  createTransaction(
    @Body() dto: CreateWalletTransactionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.walletService.createTransaction(dto, user.sub);
  }
}
