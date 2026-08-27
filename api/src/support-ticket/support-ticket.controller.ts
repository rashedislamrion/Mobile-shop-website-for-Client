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
  Req,
} from '@nestjs/common';
import { SupportTicketService } from './support-ticket.service';
import {
  CreateSupportTicketDto,
  CreateTicketMessageDto,
  UpdateTicketStatusDto,
} from './dto/support-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ModuleName, PermissionAction, TicketStatus } from '@prisma/client';

@Controller('support-tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SupportTicketController {
  constructor(private readonly supportTicketService: SupportTicketService) {}

  @Post()
  create(@Body() createDto: CreateSupportTicketDto, @Req() req: any) {
    return this.supportTicketService.create(createDto, req.user.sub);
  }

  @Get('my')
  findMyTickets(@Req() req: any, @Query('status') status?: TicketStatus) {
    return this.supportTicketService.findMyTickets(req.user.sub, status);
  }

  @Get()
  @RequirePermission({ module: ModuleName.HELP_REQUESTS, action: PermissionAction.READ })
  findAll(
    @Query('status') status?: TicketStatus,
    @Query('issueTypeId') issueTypeId?: string,
    @Query('assignedToId') assignedToId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.supportTicketService.findAll({
      status,
      issueTypeId,
      assignedToId,
      search,
      page,
      limit,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.supportTicketService.findOne(id, req.user);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body() messageDto: CreateTicketMessageDto,
    @Req() req: any,
  ) {
    return this.supportTicketService.addMessage(id, messageDto, req.user);
  }

  @Patch(':id/status')
  @RequirePermission({ module: ModuleName.HELP_REQUESTS, action: PermissionAction.UPDATE })
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateTicketStatusDto) {
    return this.supportTicketService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @RequirePermission({ module: ModuleName.HELP_REQUESTS, action: PermissionAction.DELETE })
  remove(@Param('id') id: string) {
    return this.supportTicketService.remove(id);
  }
}
