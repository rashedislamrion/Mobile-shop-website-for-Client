import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { PERMISSION_KEY, RequiredPermission } from '../decorators/require-permission.decorator';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<RequiredPermission>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true; // no @RequirePermission decorator = public within auth

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload; // set by JwtAuthGuard/JwtAccessStrategy

    // STEP 1: token already decoded by JwtAccessStrategy — user.roleId is the role
    if (!user || user.userType !== 'STAFF' || !user.roleId) {
      throw new ForbiddenException('Staff access required for this resource.');
    }

    // STEP 2: check RolePermission for this module+action
    const permission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_module_action: {
          roleId: user.roleId,
          module: required.module,
          action: required.action,
        },
      },
    });
    if (!permission?.allowed) {
      throw new ForbiddenException(
        `Your role does not have ${required.action} permission on ${required.module}.`,
      );
    }

    // STEP 3: if role scope is OWN_BRANCH, verify resource branch matches staff branch
    const role = await this.prisma.role.findUnique({ where: { id: user.roleId } });
    if (role?.scope === 'OWN_BRANCH' && required.branchParam) {
      const targetBranchId =
        request.params?.[required.branchParam] ??
        request.body?.[required.branchParam] ??
        request.query?.[required.branchParam];
      if (targetBranchId && targetBranchId !== user.branchId) {
        throw new ForbiddenException(
          'You can only access data belonging to your own branch.',
        );
      }
    }
    // OWN_DATA scope (e.g. Customer Service seeing only tickets assigned to them)
    // should be enforced at the SERVICE layer via a query filter, not here — note
    // this clearly in a code comment so future modules know the pattern:
    // Guard = "can they call this endpoint at all + branch check".
    // Service layer = "which specific ROWS do they see" for OWN_DATA scope.

    // STEP 4: all checks passed
    return true;
  }
}
