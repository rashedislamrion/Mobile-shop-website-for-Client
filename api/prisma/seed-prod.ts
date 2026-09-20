import {
  PrismaClient,
  PermissionScope,
  ModuleName,
  PermissionAction,
  StaffStatus,
  ProductStatus,
  PhoneUnitStatus,
  OrderStatus,
  PaymentStatus,
  OrderPaymentMethod,
  ServiceJobStatus,
  SaleType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting mobilehubbd Production Database Seeder ---');

  // ==========================================
  // 1. ROLES & PERMISSIONS
  // ==========================================
  console.log('1. Seeding System & Custom Roles...');
  const rolesData = [
    { name: 'Admin', scope: PermissionScope.GLOBAL, isSystem: true },
    { name: 'Branch Admin', scope: PermissionScope.OWN_BRANCH, isSystem: true },
    { name: 'Branch Manager', scope: PermissionScope.OWN_BRANCH, isSystem: true },
    { name: 'Salesperson', scope: PermissionScope.OWN_BRANCH, isSystem: true },
    { name: 'Purchase Manager', scope: PermissionScope.GLOBAL, isSystem: true },
    { name: 'Product Uploader', scope: PermissionScope.GLOBAL, isSystem: true },
    { name: 'Customer Service', scope: PermissionScope.GLOBAL, isSystem: true },
    { name: 'Technician', scope: PermissionScope.OWN_BRANCH, isSystem: true },
    { name: 'SEO', scope: PermissionScope.GLOBAL, isSystem: true },
    {
      name: 'Inventory Auditor',
      scope: PermissionScope.OWN_BRANCH,
      isSystem: false,
      description: 'Custom narrow role with read-only access to products, stock adjustments, and purchases',
    },
  ];

  const createdRoles: any[] = [];
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { isSystem: r.isSystem, scope: r.scope },
      create: { name: r.name, isSystem: r.isSystem, scope: r.scope, description: (r as any).description },
    });
    createdRoles.push(role);
  }

  const modules = Object.values(ModuleName);
  const actions = Object.values(PermissionAction);

  for (const role of createdRoles) {
    for (const module of modules) {
      for (const action of actions) {
        let allowed = false;

        if (role.name === 'Admin') {
          allowed = true;
        } else if (role.name === 'Salesperson') {
          if (['SALES', 'ORDERS', 'CUSTOMERS', 'POS'].includes(module)) allowed = true;
        } else if (role.name === 'Technician') {
          if (module === 'SALES') allowed = true;
        } else if (role.name === 'SEO') {
          if (['CMS', 'PROMOTIONAL_BANNER', 'ADS', 'PROMO_CODE', 'BLOGS'].includes(module)) allowed = true;
        } else if (role.name === 'Product Uploader') {
          if (['PRODUCTS', 'CATEGORY'].includes(module) && action !== 'DELETE') allowed = true;
        } else if (role.name === 'Branch Admin' || role.name === 'Branch Manager') {
          if (!['BUSINESS_SETTINGS', 'THIRD_PARTY_CONFIG'].includes(module)) allowed = true;
        } else if (role.name === 'Customer Service') {
          if (['HELP_REQUESTS', 'HELP_NOTES', 'ORDERS', 'CUSTOMERS'].includes(module)) allowed = true;
        } else if (role.name === 'Purchase Manager') {
          if (['PURCHASE', 'SUPPLIERS', 'PRODUCTS'].includes(module)) allowed = true;
        } else if (role.name === 'Inventory Auditor') {
          if (module === 'PRODUCTS' && ['READ', 'VIEW_DETAILS'].includes(action)) allowed = true;
          if (module === 'STOCK_ADJUSTMENTS' && action === 'READ') allowed = true;
          if (module === 'PURCHASE' && action === 'READ') allowed = true;
        }

        await prisma.rolePermission.upsert({
          where: { roleId_module_action: { roleId: role.id, module, action } },
          update: { allowed },
          create: { roleId: role.id, module, action, allowed },
        });
      }
    }
  }
  console.log(`✓ Seeded ${createdRoles.length} Roles and permissions matrix`);

  // ==========================================
  // 2. BRANCHES
  // ==========================================
  console.log('2. Seeding Branches...');
  const branches = [
    { name: 'Dhaka Main', code: 'BR-DHK', type: 'FLAGSHIP' as const, address: 'Plot 12, Gulshan Avenue', city: 'Dhaka', phone: '01711111111' },
    { name: 'Chittagong Outlet', code: 'BR-CTG', type: 'OUTLET' as const, address: 'CDA Avenue, GEC Circle', city: 'Chittagong', phone: '01722222222' },
    { name: 'Sylhet Warehouse', code: 'BR-SYL', type: 'WAREHOUSE' as const, address: 'Zindabazar Point', city: 'Sylhet', phone: '01733333333' },
  ];

  for (const b of branches) {
    // @ts-ignore
    await prisma.branch.upsert({
      where: { code: b.code },
      update: { name: b.name, address: b.address, city: b.city, phone: b.phone },
      create: b,
    });
  }

  const dhakaBranch = await prisma.branch.findFirst({ where: { code: 'BR-DHK' } });
  const adminRole = createdRoles.find((r) => r.name === 'Admin')!;
  const branchAdminRole = createdRoles.find((r) => r.name === 'Branch Admin')!;
  const technicianRole = createdRoles.find((r) => r.name === 'Technician')!;
  const auditorRole = createdRoles.find((r) => r.name === 'Inventory Auditor')!;

  // ==========================================
  // 3. DEMO ACCOUNTS (PASSWORD: Admin@12345)
  // ==========================================
  console.log('3. Seeding 4 Demo Accounts...');
  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  // Demo 1: Global Admin
  await prisma.staff.upsert({
    where: { email: 'demo.admin@mobilehubbd.test' },
    update: { passwordHash, roleId: adminRole.id, status: StaffStatus.ACTIVE },
    create: {
      employeeId: 'DEMO-ADM-01',
      name: 'Demo Global Admin',
      email: 'demo.admin@mobilehubbd.test',
      phone: '+8801799000001',
      passwordHash,
      roleId: adminRole.id,
      status: StaffStatus.ACTIVE,
      adminPanelAccess: true,
    },
  });

  // Main Admin Fallback
  await prisma.staff.upsert({
    where: { email: 'admin@mobilehubbd.test' },
    update: { passwordHash, roleId: adminRole.id, status: StaffStatus.ACTIVE },
    create: {
      employeeId: 'EMP-0001',
      name: 'Super Admin',
      email: 'admin@mobilehubbd.test',
      phone: '+8801700000000',
      passwordHash,
      roleId: adminRole.id,
      status: StaffStatus.ACTIVE,
      adminPanelAccess: true,
    },
  });

  // Demo 2: Branch Admin
  if (branchAdminRole && dhakaBranch) {
    await prisma.staff.upsert({
      where: { email: 'demo.branchadmin@mobilehubbd.test' },
      update: { passwordHash, roleId: branchAdminRole.id, branchId: dhakaBranch.id, status: StaffStatus.ACTIVE },
      create: {
        employeeId: 'DEMO-BADM-01',
        name: 'Demo Branch Admin (Dhaka)',
        email: 'demo.branchadmin@mobilehubbd.test',
        phone: '+8801799000002',
        passwordHash,
        roleId: branchAdminRole.id,
        branchId: dhakaBranch.id,
        status: StaffStatus.ACTIVE,
        adminPanelAccess: true,
      },
    });
  }

  // Demo 3: Technician (25% profit share)
  let techStaff: any = null;
  if (technicianRole && dhakaBranch) {
    techStaff = await prisma.staff.upsert({
      where: { email: 'demo.technician@mobilehubbd.test' },
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
        email: 'demo.technician@mobilehubbd.test',
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

  // Demo 4: Custom Inventory Auditor
  if (auditorRole && dhakaBranch) {
    await prisma.staff.upsert({
      where: { email: 'demo.auditor@mobilehubbd.test' },
      update: { passwordHash, roleId: auditorRole.id, branchId: dhakaBranch.id, status: StaffStatus.ACTIVE },
      create: {
        employeeId: 'DEMO-AUD-01',
        name: 'Demo Inventory Auditor',
        email: 'demo.auditor@mobilehubbd.test',
        phone: '+8801799000004',
        passwordHash,
        roleId: auditorRole.id,
        branchId: dhakaBranch.id,
        status: StaffStatus.ACTIVE,
        adminPanelAccess: true,
      },
    });
  }
  console.log('✓ Seeded all 4 Demo Accounts');

  // ==========================================
  // 4. DEVICE & SERVICE LOOKUPS
  // ==========================================
  console.log('4. Seeding Device & Problem Types...');
  const deviceTypes = ['Phone', 'Tablet', 'Laptop', 'Smart Watch', 'Desktop', 'Audio & Accessories'];
  const deviceTypeMap = new Map<string, any>();
  for (const name of deviceTypes) {
    const dt = await prisma.deviceType.upsert({
      where: { name },
      update: { status: StaffStatus.ACTIVE },
      create: { name, status: StaffStatus.ACTIVE },
    });
    deviceTypeMap.set(name, dt);
  }

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

  // ==========================================
  // 5. BUSINESS SETTINGS & SYSTEM CONFIGS
  // ==========================================
  console.log('5. Seeding Business Settings & Defaults...');
  const existingSettings = await prisma.businessSetting.findFirst();
  if (!existingSettings) {
    await prisma.businessSetting.create({
      data: {
        general: { storeName: 'mobilehubbd', email: 'contact@mobilehubbd.com', phone: '+8801700000000' },
        branding: { primaryColor: '#0f172a' },
        currencyTax: { currency: 'BDT', symbol: '৳' },
        orderSettings: { minOrder: 100 },
        notifications: { email: true },
      },
    });
  }

  const gateways = ['BKASH', 'SSLCOMMERZ', 'COD'] as const;
  for (const gw of gateways) {
    await prisma.paymentGatewayConfig.upsert({
      where: { gateway: gw },
      update: {},
      create: { gateway: gw, isActive: true, title: gw, credentials: {} },
    });
  }

  // ==========================================
  // 6. CATEGORIES & BRANDS
  // ==========================================
  console.log('6. Seeding Categories & Brands...');
  const categories = [
    { name: 'Smartphones & Devices', slug: 'phones', description: 'Flagship & budget smartphones with official warranty' },
    { name: 'Laptops & Computers', slug: 'laptops', description: 'MacBooks, gaming laptops and ultrabooks' },
    { name: 'Audio & Wearables', slug: 'audio', description: 'Wireless earbuds, headphones, and smart watches' },
    { name: 'Accessories', slug: 'accessories', description: 'Chargers, adapters, protective cases and cables' },
    { name: 'Spare Parts', slug: 'spare-parts', description: 'Original display panels, batteries and IC components' },
  ];

  const categoryMap = new Map<string, any>();
  for (const cat of categories) {
    let c = await prisma.category.findFirst({ where: { OR: [{ slug: cat.slug }, { name: cat.name }] } });
    if (!c) {
      c = await prisma.category.create({
        data: { name: cat.name, slug: cat.slug, description: cat.description, status: StaffStatus.ACTIVE },
      });
    }
    categoryMap.set(cat.slug, c);
  }

  const brands = [
    { name: 'Apple', slug: 'apple' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Xiaomi', slug: 'xiaomi' },
    { name: 'OnePlus', slug: 'oneplus' },
    { name: 'Google', slug: 'google' },
    { name: 'Anker', slug: 'anker' },
  ];

  const brandMap = new Map<string, any>();
  for (const b of brands) {
    let brand = await prisma.brand.findFirst({ where: { OR: [{ slug: b.slug }, { name: b.name }] } });
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: b.name, slug: b.slug, status: StaffStatus.ACTIVE },
      });
    }
    brandMap.set(b.slug, brand);
  }

  const unitPcs = await prisma.unit.upsert({
    where: { name: 'Piece' },
    update: {},
    create: { name: 'Piece', shortCode: 'PCS' },
  });

  // ==========================================
  // 7. REALISTIC PHONE PRODUCTS & SERIALIZED INVENTORY
  // ==========================================
  console.log('7. Seeding Phones & Serialized Stock...');
  if (dhakaBranch) {
    // iPhone 15 Pro Max
    let iphone = await prisma.product.findUnique({
      where: { slug: 'iphone-15-pro-max' },
      include: { variants: true },
    });

    if (!iphone) {
      iphone = await prisma.product.create({
        data: {
          name: 'Apple iPhone 15 Pro Max (256GB)',
          slug: 'iphone-15-pro-max',
          description: 'Aerospace-grade titanium design with A17 Pro chip, Action button, and 48MP main camera.',
          productType: 'PHONE',
          productCategory: 'PHONE',
          condition: 'NEW',
          status: ProductStatus.ACTIVE,
          regularPrice: 155000,
          salePrice: 148000,
          buyingPrice: 135000,
          categoryId: categoryMap.get('phones')!.id,
          brandId: brandMap.get('apple')!.id,
          unitId: unitPcs.id,
          warranty: '1 Year Apple Care Official',
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800', sortOrder: 0 },
            ],
          },
          variants: {
            create: [
              { sku: 'IP15PM-TI-256', color: 'Natural Titanium', quality: 'Original Official', price: 148000, stock: 2 },
            ],
          },
        },
        include: { variants: true },
      });
    }

    if (iphone.variants.length > 0) {
      const vId = iphone.variants[0].id;
      await prisma.phoneUnit.upsert({
        where: { imei1: '358912345678901' },
        update: { status: PhoneUnitStatus.IN_STOCK },
        create: {
          productVariantId: vId,
          branchId: dhakaBranch.id,
          imei1: '358912345678901',
          imei2: '358912345678902',
          status: PhoneUnitStatus.IN_STOCK,
          buyingPrice: 135000,
          sellingPrice: 148000,
          warrantyPeriod: '1 Year Apple Official',
        },
      });

      await prisma.phoneUnit.upsert({
        where: { imei1: '358912345678903' },
        update: { status: PhoneUnitStatus.IN_STOCK },
        create: {
          productVariantId: vId,
          branchId: dhakaBranch.id,
          imei1: '358912345678903',
          imei2: '358912345678904',
          status: PhoneUnitStatus.IN_STOCK,
          buyingPrice: 135000,
          sellingPrice: 148000,
          warrantyPeriod: '1 Year Apple Official',
        },
      });
    }

    // Samsung Galaxy S24 Ultra
    let s24 = await prisma.product.findUnique({
      where: { slug: 'samsung-galaxy-s24-ultra' },
      include: { variants: true },
    });

    if (!s24) {
      s24 = await prisma.product.create({
        data: {
          name: 'Samsung Galaxy S24 Ultra 5G',
          slug: 'samsung-galaxy-s24-ultra',
          description: 'Galaxy AI with built-in S Pen, Titanium frame, 200MP camera and Snapdragon 8 Gen 3.',
          productType: 'PHONE',
          productCategory: 'PHONE',
          condition: 'NEW',
          status: ProductStatus.ACTIVE,
          regularPrice: 142000,
          salePrice: 136000,
          buyingPrice: 124000,
          categoryId: categoryMap.get('phones')!.id,
          brandId: brandMap.get('samsung')!.id,
          unitId: unitPcs.id,
          warranty: '1 Year Official Warranty',
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800', sortOrder: 0 },
            ],
          },
          variants: {
            create: [
              { sku: 'S24U-GRAY-256', color: 'Titanium Gray', quality: 'Official BTRC', price: 136000, stock: 1 },
            ],
          },
        },
        include: { variants: true },
      });
    }

    if (s24.variants.length > 0) {
      await prisma.phoneUnit.upsert({
        where: { imei1: '354890123456781' },
        update: { status: PhoneUnitStatus.IN_STOCK },
        create: {
          productVariantId: s24.variants[0].id,
          branchId: dhakaBranch.id,
          imei1: '354890123456781',
          imei2: '354890123456782',
          status: PhoneUnitStatus.IN_STOCK,
          buyingPrice: 124000,
          sellingPrice: 136000,
          warrantyPeriod: '1 Year Samsung Bangladesh',
        },
      });
    }

    // Anker Charger
    let anker = await prisma.product.findUnique({
      where: { slug: 'anker-65w-gan-fast-charger' },
      include: { variants: true },
    });

    if (!anker) {
      anker = await prisma.product.create({
        data: {
          name: 'Anker 735 65W GaNPrime Charger',
          slug: 'anker-65w-gan-fast-charger',
          description: 'High-speed multi-device charging with 2 USB-C ports and 1 USB-A port.',
          productType: 'GENERAL',
          productCategory: 'ACCESSORY',
          status: ProductStatus.ACTIVE,
          regularPrice: 3800,
          salePrice: 3400,
          buyingPrice: 2600,
          categoryId: categoryMap.get('accessories')!.id,
          brandId: brandMap.get('anker')!.id,
          unitId: unitPcs.id,
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800', sortOrder: 0 },
            ],
          },
          variants: {
            create: [
              { sku: 'ANKER-65W-BLK', color: 'Black', price: 3400, stock: 45 },
            ],
          },
        },
        include: { variants: true },
      });
    }

    if (anker.variants.length > 0) {
      await prisma.branchInventory.upsert({
        where: { branchId_productVariantId: { branchId: dhakaBranch.id, productVariantId: anker.variants[0].id } },
        update: { quantity: 45 },
        create: { branchId: dhakaBranch.id, productVariantId: anker.variants[0].id, quantity: 45 },
      });
    }
  }

  // ==========================================
  // 8. DEMO CUSTOMER & COMPLETED TRANSACTIONS
  // ==========================================
  console.log('8. Seeding Demo Customer & Transactions...');
  const customer = await prisma.customer.upsert({
    where: { phone: '01712345678' },
    update: { name: 'Md. Tanvir Hossain' },
    create: {
      name: 'Md. Tanvir Hossain',
      phone: '01712345678',
      email: 'tanvir.demo@mobilehubbd.test',
      passwordHash,
      source: 'SERVICE_WALKIN',
    },
  });

  // Completed Storefront Order
  if (dhakaBranch) {
    const existingOrder = await prisma.order.findUnique({ where: { orderCode: 'ORD-DEMO-1001' } });
    const anker = await prisma.product.findUnique({ where: { slug: 'anker-65w-gan-fast-charger' }, include: { variants: true } });
    if (!existingOrder && anker && anker.variants.length > 0) {
      await prisma.order.create({
        data: {
          orderCode: 'ORD-DEMO-1001',
          customerId: customer.id,
          branchId: dhakaBranch.id,
          status: OrderStatus.DELIVERED,
          paymentStatus: PaymentStatus.PAID,
          paymentMethod: OrderPaymentMethod.BKASH,
          subtotal: 3400,
          deliveryCharge: 60,
          discountAmount: 0,
          totalAmount: 3460,
          paidAmount: 3460,
          dueAmount: 0,
          saleType: SaleType.WEBSITE,
          items: {
            create: [
              {
                productId: anker.id,
                variantId: anker.variants[0].id,
                productNameSnapshot: anker.name,
                quantity: 1,
                unitPrice: 3400,
                lineTotal: 3400,
              },
            ],
          },
          payments: {
            create: [
              {
                customerId: customer.id,
                amount: 3460,
                paymentMethod: 'BKASH',
                note: 'TRX-BKASH-89101',
              },
            ],
          },
        },
      });
      console.log('✓ Seeded completed storefront order: ORD-DEMO-1001');
    }
  }

  // Completed Service Job
  const existingJob = await prisma.serviceJob.findFirst({ where: { invoiceNo: 'INV-0001' } });
  if (!existingJob && techStaff && dhakaBranch) {
    await prisma.serviceJob.create({
      data: {
        invoiceNo: 'INV-0001',
        customerId: customer.id,
        device: 'Samsung Galaxy S23 Ultra',
        deviceTypeId: deviceTypeMap.get('Phone')?.id,
        brandId: brandMap.get('samsung')?.id,
        model: 'Samsung Galaxy S23 Ultra',
        issueDescription: 'Broken Touch / Glass Replacement',
        status: ServiceJobStatus.DELIVERED,
        laborCost: 1000,
        materialCost: 4500,
        totalBill: 5500,
        discount: 200,
        finalAmount: 5300,
        paidAmount: 5300,
        dueAmount: 0,
        technicianId: techStaff.id,
        technicianProfitShare: 200.0, // 25% of (5300 - 4500) = 200.00
      },
    });
    console.log('✓ Seeded completed repair service job: INV-0001');
  }

  // ==========================================
  // 9. CMS BANNERS
  // ==========================================
  console.log('9. Seeding CMS Content & Promotional Banners...');
  await prisma.banner.upsert({
    where: { id: 'promo-banner-hero-1' },
    update: {},
    create: {
      id: 'promo-banner-hero-1',
      title: 'Next-Gen Smartphones & Genuine Parts',
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1600',
      linkUrl: '/phones',
      status: StaffStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  console.log('----------------------------------------------------');
  console.log('✓ mobilehubbd Production Database Seeder finished successfully!');
  console.log('Client Demo Credentials:');
  console.log(' - Global Admin: demo.admin@mobilehubbd.test / Admin@12345');
  console.log(' - Branch Admin: demo.branchadmin@mobilehubbd.test / Admin@12345');
  console.log(' - Technician: demo.technician@mobilehubbd.test / Admin@12345 (25% share)');
  console.log(' - Auditor: demo.auditor@mobilehubbd.test / Admin@12345');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
