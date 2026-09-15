import { PrismaClient, PermissionScope, ModuleName, PermissionAction, StaffStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Fix Pass 21 Data ---');

  // 1. Device Types
  const deviceTypes = [
    'Phone',
    'Tablet',
    'Laptop',
    'Smart Watch',
    'Desktop',
    'Audio & Accessories',
  ];

  for (const name of deviceTypes) {
    await prisma.deviceType.upsert({
      where: { name },
      update: { status: StaffStatus.ACTIVE },
      create: { name, status: StaffStatus.ACTIVE },
    });
  }
  console.log(`✓ Seeded ${deviceTypes.length} Device Types`);

  // 2. Service Problem Types with suggested labor charges
  const problemTypes = [
    { name: 'BackPart Change', suggestedLaborPrice: 500 },
    { name: 'Flex Change', suggestedLaborPrice: 800 },
    { name: 'Broken Touch / Glass Replacement', suggestedLaborPrice: 1200 },
    { name: 'Body / Casing Change', suggestedLaborPrice: 700 },
    { name: 'Audio / Speaker Issue', suggestedLaborPrice: 400 },
    { name: 'Battery Replacement', suggestedLaborPrice: 350 },
    { name: 'Charging Port Repair', suggestedLaborPrice: 500 },
    { name: 'Display Replacement', suggestedLaborPrice: 1000 },
    { name: 'Camera Issue', suggestedLaborPrice: 600 },
    { name: 'Water Damage Diagnostic', suggestedLaborPrice: 1500 },
    { name: 'Motherboard IC Repair', suggestedLaborPrice: 2000 },
    { name: 'Software / Flashing', suggestedLaborPrice: 500 },
  ];

  for (const pt of problemTypes) {
    await prisma.serviceProblemType.upsert({
      where: { name: pt.name },
      update: { suggestedLaborPrice: pt.suggestedLaborPrice, status: StaffStatus.ACTIVE },
      create: { name: pt.name, suggestedLaborPrice: pt.suggestedLaborPrice, status: StaffStatus.ACTIVE },
    });
  }
  console.log(`✓ Seeded ${problemTypes.length} Service Problem Types`);

  // 3. Service Warranty Periods
  const warrantyPeriods = [
    { name: 'No Warranty', days: 0 },
    { name: '7 Days', days: 7 },
    { name: '15 Days', days: 15 },
    { name: '1 Month', days: 30 },
    { name: '3 Months', days: 90 },
    { name: '6 Months', days: 180 },
    { name: '1 Year', days: 365 },
  ];

  for (const wp of warrantyPeriods) {
    await prisma.serviceWarrantyPeriod.upsert({
      where: { name: wp.name },
      update: { days: wp.days, status: StaffStatus.ACTIVE },
      create: { name: wp.name, days: wp.days, status: StaffStatus.ACTIVE },
    });
  }
  console.log(`✓ Seeded ${warrantyPeriods.length} Warranty Periods`);

  // 4. Ensure Custom Role: Inventory Auditor
  const auditorRole = await prisma.role.upsert({
    where: { name: 'Inventory Auditor' },
    update: { isSystem: false, scope: PermissionScope.OWN_BRANCH },
    create: {
      name: 'Inventory Auditor',
      description: 'Custom narrow role created in Fix Pass 21 for testing role builder',
      isSystem: false,
      scope: PermissionScope.OWN_BRANCH,
    },
  });

  // Assign specific narrow permissions to Inventory Auditor
  const modules = Object.values(ModuleName);
  const actions = Object.values(PermissionAction);

  for (const module of modules) {
    for (const action of actions) {
      let allowed = false;
      if (module === 'PRODUCTS' && ['READ', 'VIEW_DETAILS'].includes(action)) {
        allowed = true;
      } else if (module === 'STOCK_ADJUSTMENTS' && action === 'READ') {
        allowed = true;
      } else if (module === 'PURCHASE' && action === 'READ') {
        allowed = true;
      }

      await prisma.rolePermission.upsert({
        where: { roleId_module_action: { roleId: auditorRole.id, module, action } },
        update: { allowed },
        create: { roleId: auditorRole.id, module, action, allowed },
      });
    }
  }
  console.log('✓ Seeded Inventory Auditor role permissions');

  // Ensure Technician role has permissions for service jobs and sales
  const technicianRole = await prisma.role.findUnique({ where: { name: 'Technician' } });
  if (technicianRole) {
    for (const action of actions) {
      await prisma.rolePermission.upsert({
        where: { roleId_module_action: { roleId: technicianRole.id, module: 'SALES', action } },
        update: { allowed: true },
        create: { roleId: technicianRole.id, module: 'SALES', action, allowed: true },
      });
    }
  }

  // 5. Get Dhaka Main branch
  const dhakaBranch = await prisma.branch.findFirst({ where: { code: 'BR-DHK' } });
  const adminRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  const branchAdminRole = await prisma.role.findUnique({ where: { name: 'Branch Admin' } });

  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  // Demo Account 1: Global Admin
  if (adminRole) {
    await prisma.staff.upsert({
      where: { email: 'demo.admin@novamobile.test' },
      update: { passwordHash, roleId: adminRole.id, status: StaffStatus.ACTIVE },
      create: {
        employeeId: 'DEMO-ADM-01',
        name: 'Demo Global Admin',
        email: 'demo.admin@novamobile.test',
        phone: '+8801799000001',
        passwordHash,
        roleId: adminRole.id,
        status: StaffStatus.ACTIVE,
        adminPanelAccess: true,
      },
    });
  }

  // Demo Account 2: Branch Admin
  if (branchAdminRole && dhakaBranch) {
    await prisma.staff.upsert({
      where: { email: 'demo.branchadmin@novamobile.test' },
      update: { passwordHash, roleId: branchAdminRole.id, branchId: dhakaBranch.id, status: StaffStatus.ACTIVE },
      create: {
        employeeId: 'DEMO-BADM-01',
        name: 'Demo Branch Admin (Dhaka)',
        email: 'demo.branchadmin@novamobile.test',
        phone: '+8801799000002',
        passwordHash,
        roleId: branchAdminRole.id,
        branchId: dhakaBranch.id,
        status: StaffStatus.ACTIVE,
        adminPanelAccess: true,
      },
    });
  }

  // Demo Account 3: Technician with 25% profit share
  if (technicianRole && dhakaBranch) {
    await prisma.staff.upsert({
      where: { email: 'demo.technician@novamobile.test' },
      update: {
        passwordHash,
        roleId: technicianRole.id,
        branchId: dhakaBranch.id,
        isTechnician: true,
        profitSharePercentage: 25,
        status: StaffStatus.ACTIVE,
      },
      create: {
        employeeId: 'DEMO-TECH-01',
        name: 'Demo Technician (Dhaka)',
        email: 'demo.technician@novamobile.test',
        phone: '+8801799000003',
        passwordHash,
        roleId: technicianRole.id,
        branchId: dhakaBranch.id,
        isTechnician: true,
        profitSharePercentage: 25,
        status: StaffStatus.ACTIVE,
        adminPanelAccess: true,
      },
    });
  }

  // Demo Account 4: Custom Role "Inventory Auditor"
  if (auditorRole && dhakaBranch) {
    await prisma.staff.upsert({
      where: { email: 'demo.auditor@novamobile.test' },
      update: { passwordHash, roleId: auditorRole.id, branchId: dhakaBranch.id, status: StaffStatus.ACTIVE },
      create: {
        employeeId: 'DEMO-AUD-01',
        name: 'Demo Inventory Auditor',
        email: 'demo.auditor@novamobile.test',
        phone: '+8801799000004',
        passwordHash,
        roleId: auditorRole.id,
        branchId: dhakaBranch.id,
        status: StaffStatus.ACTIVE,
        adminPanelAccess: true,
      },
    });
  }

  console.log('✓ Seeded all 4 Demo Accounts for Fix Pass 21 testing');
  console.log('--- Fix Pass 21 Seed Finished ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
