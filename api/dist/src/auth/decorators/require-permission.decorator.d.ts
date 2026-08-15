import { ModuleName, PermissionAction } from '@prisma/client';
export declare const PERMISSION_KEY = "permission";
export interface RequiredPermission {
    module: ModuleName;
    action: PermissionAction;
    branchParam?: string;
}
export declare const RequirePermission: (perm: RequiredPermission) => import("@nestjs/common").CustomDecorator<string>;
