import { PrismaClient, PermissionScope, ModuleName, PermissionAction, StaffStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Roles
  const rolesData = [
    { name: 'Admin', scope: PermissionScope.GLOBAL },
    { name: 'Branch Admin', scope: PermissionScope.OWN_BRANCH },
    { name: 'Branch Manager', scope: PermissionScope.OWN_BRANCH },
    { name: 'Salesperson', scope: PermissionScope.OWN_BRANCH },
    { name: 'Purchase Manager', scope: PermissionScope.GLOBAL },
    { name: 'Product Uploader', scope: PermissionScope.GLOBAL },
    { name: 'Customer Service', scope: PermissionScope.GLOBAL },
    { name: 'Technician', scope: PermissionScope.OWN_BRANCH },
    { name: 'SEO', scope: PermissionScope.GLOBAL },
  ];

  const createdRoles: Role[] = [];
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { isSystem: true, scope: r.scope },
      create: { name: r.name, isSystem: true, scope: r.scope },
    });
    createdRoles.push(role);
  }
  
  // Permissions Logic
  // Provide basic CRUD matrix
  const modules = Object.values(ModuleName);
  const actions = Object.values(PermissionAction);

  let permissionsCount = 0;
  for (const role of createdRoles) {
    for (const module of modules) {
      for (const action of actions) {
        let allowed = false;
        
        if (role.name === 'Admin') {
          allowed = true;
        } else if (role.name === 'Salesperson') {
          if (['SALES', 'ORDERS', 'CUSTOMERS'].includes(module)) allowed = true;
        } else if (role.name === 'Technician') {
          if (module === 'SALES' && (action === 'READ' || action === 'UPDATE')) allowed = true;
        } else if (role.name === 'SEO') {
          if (['CMS', 'PROMOTIONAL_BANNER', 'ADS', 'PROMO_CODE', 'BLOGS'].includes(module)) allowed = true;
        } else if (role.name === 'Product Uploader') {
          if (['PRODUCTS', 'CATEGORY'].includes(module) && action !== 'DELETE') allowed = true;
        } else if (role.name === 'Branch Admin' || role.name === 'Branch Manager') {
           // allow most except business settings
           if (!['BUSINESS_SETTINGS', 'THIRD_PARTY_CONFIG'].includes(module)) allowed = true;
        } else if (role.name === 'Customer Service') {
           if (['HELP_REQUESTS', 'HELP_NOTES', 'ORDERS', 'CUSTOMERS'].includes(module)) allowed = true;
        } else if (role.name === 'Purchase Manager') {
           if (['PURCHASE', 'SUPPLIERS', 'PRODUCTS'].includes(module)) allowed = true;
        }

        await prisma.rolePermission.upsert({
          where: { roleId_module_action: { roleId: role.id, module, action } },
          update: { allowed },
          create: { roleId: role.id, module, action, allowed },
        });
        permissionsCount++;
      }
    }
  }

  // 2. Super Admin Staff
  const adminRole = createdRoles.find(r => r.name === 'Admin')!;
  const passwordHash = await bcrypt.hash('Admin@12345', 10);
  await prisma.staff.upsert({
    where: { email: 'admin@mobilehubbd.test' },
    update: { passwordHash, roleId: adminRole.id },
    create: {
      employeeId: 'EMP-0001',
      name: 'Super Admin',
      email: 'admin@mobilehubbd.test',
      phone: '+8801700000000',
      passwordHash,
      roleId: adminRole.id,
      status: StaffStatus.ACTIVE,
    }
  });

  // 3. Branches
  const branches = [
    { name: 'Dhaka Main', code: 'BR-DHK', type: 'FLAGSHIP' as const, address: 'Gulshan', city: 'Dhaka', phone: '01711111111' },
    { name: 'Chittagong Outlet', code: 'BR-CTG', type: 'OUTLET' as const, address: 'GEC', city: 'Chittagong', phone: '01722222222' },
    { name: 'Sylhet Warehouse', code: 'BR-SYL', type: 'WAREHOUSE' as const, address: 'Zindabazar', city: 'Sylhet', phone: '01733333333' },
  ];
  let branchCount = 0;
  for (const b of branches) {
    // @ts-ignore
    await prisma.branch.upsert({
      where: { code: b.code },
      update: {},
      create: b,
    });
    branchCount++;
  }

  // 4. Misc defaults
  await prisma.country.upsert({
    where: { name: 'Bangladesh' },
    update: {},
    create: { name: 'Bangladesh', code: 'BD', currency: 'BDT' }
  });

  // BusinessSettings
  const existingSettings = await prisma.businessSetting.findFirst();
  if (!existingSettings) {
    await prisma.businessSetting.create({
      data: {
        general: { storeName: 'mobilehubbd', email: 'contact@mobilehubbd.com' },
        branding: { primaryColor: '#000000' },
        currencyTax: { currency: 'BDT' },
        orderSettings: { minOrder: 100 },
        notifications: { email: true }
      }
    });
  }

  // Payment gateways
  const gateways = ['BKASH', 'SSLCOMMERZ', 'COD'] as const;
  for (const gw of gateways) {
    await prisma.paymentGatewayConfig.upsert({
      where: { gateway: gw },
      update: {},
      create: { gateway: gw, isActive: false, title: gw, credentials: {} }
    });
  }
  
  const existingSms = await prisma.smsConfig.findFirst();
  if (!existingSms) await prisma.smsConfig.create({ data: { provider: 'BulkSMSBD' } });
  
  const existingMail = await prisma.mailConfig.findFirst();
  if (!existingMail) await prisma.mailConfig.create({ data: {} });
  
  const existingFirebase = await prisma.firebaseConfig.findFirst();
  if (!existingFirebase) await prisma.firebaseConfig.create({ data: {} });

  const existingRecaptcha = await prisma.recaptchaConfig.findFirst();
  if (!existingRecaptcha) await prisma.recaptchaConfig.create({ data: {} });

  console.log(`Seed complete!`);
  console.log(`- Created/Updated ${createdRoles.length} roles`);
  console.log(`- Created/Updated ${permissionsCount} role permissions`);
  console.log(`- Created/Updated 1 Super Admin staff`);
  console.log(`- Created/Updated ${branchCount} branches`);
  console.log(`- Created basic configs (Payment, Mail, SMS, Firebase, Recaptcha, Settings)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
