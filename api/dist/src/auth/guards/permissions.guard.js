"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const prisma_service_1 = require("../../prisma/prisma.service");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
let PermissionsGuard = class PermissionsGuard {
    reflector;
    prisma;
    constructor(reflector, prisma) {
        this.reflector = reflector;
        this.prisma = prisma;
    }
    async canActivate(context) {
        const required = this.reflector.get(require_permission_decorator_1.PERMISSION_KEY, context.getHandler());
        if (!required)
            return true;
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.userType !== 'STAFF' || !user.roleId) {
            throw new common_1.ForbiddenException('Staff access required for this resource.');
        }
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
            throw new common_1.ForbiddenException(`Your role does not have ${required.action} permission on ${required.module}.`);
        }
        const role = await this.prisma.role.findUnique({ where: { id: user.roleId } });
        if (role?.scope === 'OWN_BRANCH' && required.branchParam) {
            const targetBranchId = request.params?.[required.branchParam] ??
                request.body?.[required.branchParam] ??
                request.query?.[required.branchParam];
            if (targetBranchId && targetBranchId !== user.branchId) {
                throw new common_1.ForbiddenException('You can only access data belonging to your own branch.');
            }
        }
        return true;
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map