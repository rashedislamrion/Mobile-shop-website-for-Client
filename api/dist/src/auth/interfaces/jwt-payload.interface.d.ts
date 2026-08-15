export interface JwtPayload {
    sub: string;
    userType: 'STAFF' | 'CUSTOMER';
    roleId?: string;
    roleName?: string;
    branchId?: string | null;
}
