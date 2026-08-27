import { PrismaClient, PermissionScope, ModuleName, PermissionAction, StaffStatus, SaleType, OrderStatus, ReturnStatus } from '../api/node_modules/@prisma/client/index.js';
import bcrypt from '../api/node_modules/bcrypt/bcrypt.js';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api/v1';

const results = {
  preflight: false,
  check1_stock_deduction: { pass: false, before: 0, after: 0, qty: 0 },
  check2_transition_timeline: { pass: false, validShown: false, illegalRejected400: false },
  check3_stock_restore_cancel: { pass: false, before: 0, after: 0 },
  check4_sales_return_stock: { pass: false, before: 0, after: 0, qty: 0 },
  check5_rbac_403: { pass: false, role: '', action: '', statusCode: 0, adminStatusCode: 0 },
  check6_branch_scope_403: { pass: false, staffBranch: '', targetBranch: '', statusCode: 0, ownBranchStatusCode: 0 },
  check7_frontend_rendering: { pass: false, pages: {} },
  check8_no_mock_imports: { pass: false, matches: [] },
  issues: [],
};

async function apiFetch(endpoint, options = {}, token = null) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

async function main() {
  console.log('=====================================================================');
  console.log('STARTING PHASE 6 — SALES & ORDERS VERIFICATION SUITE');
  console.log('=====================================================================\n');

  // 1. PRE-FLIGHT
  console.log('--> 1. Pre-flight Check...');
  const loginRes = await apiFetch('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@novamobile.test', password: 'Admin@12345' }),
  });

  if (!loginRes.ok || !loginRes.data?.accessToken) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginRes.data)}`);
  }
  const adminToken = loginRes.data.accessToken;
  console.log('  ✔ Admin Staff Login (201 Created)');

  const [catRes, prodRes, branchRes] = await Promise.all([
    apiFetch('/categories/tree'),
    apiFetch('/products'),
    apiFetch('/branches/public'),
  ]);

  if (catRes.status !== 200 || prodRes.status !== 200 || branchRes.status !== 200) {
    throw new Error('Phase 5 Regression failure');
  }
  console.log('  ✔ Phase 5 Regression endpoints live (200 OK)');

  // Verify OrderNote table
  const noteCount = await prisma.orderNote.count();
  console.log(`  ✔ OrderNote schema table verified (count: ${noteCount})`);
  results.preflight = true;

  // Setup sample branches and product for tests
  const branchDhk = await prisma.branch.findFirst({ where: { code: 'BR-DHK' } });
  const branchCtg = await prisma.branch.findFirst({ where: { code: 'BR-CTG' } });
  if (!branchDhk || !branchCtg) throw new Error('Branches not found in DB');

  let testProduct = await prisma.product.findFirst({
    where: { slug: 'phase6-test-phone' },
    include: { variants: true },
  });

  if (!testProduct || testProduct.variants.length === 0) {
    const brand = await prisma.brand.findFirst();
    const category = await prisma.category.findFirst();
    testProduct = await prisma.product.create({
      data: {
        name: 'Phase 6 Test Phone Ultra',
        slug: 'phase6-test-phone',
        regularPrice: 25000,
        brandId: brand.id,
        categoryId: category.id,
        variants: {
          create: [
            {
              sku: `P6-TEST-${Date.now()}`,
              color: 'Phantom Black',
              quality: 'Original OLED',
              price: 25000,
              stock: 50,
            },
          ],
        },
      },
      include: { variants: true },
    });
  }

  const testVariant = testProduct.variants[0];

  // 2. CHECK 1 — Stock Deduction on POS Order
  console.log('\n--> 2. Check 1 — Stock Deduction on Order...');
  const vBefore = await prisma.productVariant.findUnique({ where: { id: testVariant.id } });
  const stockBefore = vBefore.stock;
  const orderQty = 3;

  const posOrderRes = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchDhk.id,
        saleType: 'POS',
        paidAmount: 75000,
        items: [
          {
            productId: testProduct.id,
            variantId: testVariant.id,
            quantity: orderQty,
            unitPrice: 25000,
          },
        ],
      }),
    },
    adminToken,
  );

  if (posOrderRes.status !== 201) {
    throw new Error(`POS Order creation failed: ${JSON.stringify(posOrderRes.data)}`);
  }

  const vAfter = await prisma.productVariant.findUnique({ where: { id: testVariant.id } });
  const stockAfter = vAfter.stock;

  console.log(`  Stock before: ${stockBefore}, Stock after: ${stockAfter}, Ordered qty: ${orderQty}`);
  if (stockAfter === stockBefore - orderQty) {
    results.check1_stock_deduction = {
      pass: true,
      before: stockBefore,
      after: stockAfter,
      qty: orderQty,
    };
    console.log('  ✔ PASS: Stock correctly deducted by exact order quantity');
  } else {
    results.issues.push('Stock deduction count mismatch');
  }

  // 3. CHECK 2 — Status Transition + Timeline + Illegal transition rejection
  console.log('\n--> 3. Check 2 — Status Transition + Timeline & Illogical Rejection...');
  const webOrderRes = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchDhk.id,
        saleType: 'WEBSITE',
        items: [
          {
            productId: testProduct.id,
            variantId: testVariant.id,
            quantity: 1,
            unitPrice: 25000,
          },
        ],
      }),
    },
    adminToken,
  );

  const webOrderId = webOrderRes.data.id;

  // Transition: PENDING -> CONFIRMED
  const t1 = await apiFetch(`/orders/${webOrderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'CONFIRMED', note: 'Customer called and confirmed' }) }, adminToken);
  // Transition: CONFIRMED -> PARCEL_BOOKED
  const t2 = await apiFetch(`/orders/${webOrderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'PARCEL_BOOKED', note: 'Steadfast consignment booked' }) }, adminToken);
  // Transition: PARCEL_BOOKED -> DELIVERED
  const t3 = await apiFetch(`/orders/${webOrderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'DELIVERED', note: 'Delivered and signed by customer' }) }, adminToken);

  console.log(`  Valid transitions: PENDING -> CONFIRMED (${t1.status}), -> PARCEL_BOOKED (${t2.status}), -> DELIVERED (${t3.status})`);

  // Attempt Illegal transition: DELIVERED -> PENDING
  const illegalRes = await apiFetch(`/orders/${webOrderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'PENDING' }) }, adminToken);
  console.log(`  Illegal transition (DELIVERED -> PENDING) response: ${illegalRes.status} (Expected 400)`);

  const orderDetail = await apiFetch(`/orders/${webOrderId}`, {}, adminToken);
  const history = orderDetail.data.statusHistory || [];
  console.log(`  Timeline rows created: ${history.length}`);

  if (t1.status === 200 && t2.status === 200 && t3.status === 200 && illegalRes.status === 400 && history.length >= 4) {
    results.check2_transition_timeline = {
      pass: true,
      validShown: true,
      illegalRejected400: true,
    };
    console.log('  ✔ PASS: Valid transitions recorded in history; illegal transition rejected with 400');
  }

  // 4. CHECK 3 — Stock Restoration on Cancel
  console.log('\n--> 4. Check 3 — Stock Restoration on Cancel...');
  const cancelOrderRes = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchDhk.id,
        saleType: 'WEBSITE',
        items: [
          {
            productId: testProduct.id,
            variantId: testVariant.id,
            quantity: 2,
            unitPrice: 25000,
          },
        ],
      }),
    },
    adminToken,
  );
  const cancelOrderId = cancelOrderRes.data.id;

  // Confirm it to deduct stock
  await apiFetch(`/orders/${cancelOrderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'CONFIRMED' }) }, adminToken);
  const stockBeforeCancel = (await prisma.productVariant.findUnique({ where: { id: testVariant.id } })).stock;

  // Cancel the order
  await apiFetch(`/orders/${cancelOrderId}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'CANCELLED', note: 'Customer cancelled before dispatch' }) }, adminToken);
  const stockAfterCancel = (await prisma.productVariant.findUnique({ where: { id: testVariant.id } })).stock;

  console.log(`  Stock before cancel: ${stockBeforeCancel}, Stock after cancel: ${stockAfterCancel} (restored +2)`);
  if (stockAfterCancel === stockBeforeCancel + 2) {
    results.check3_stock_restore_cancel = {
      pass: true,
      before: stockBeforeCancel,
      after: stockAfterCancel,
    };
    console.log('  ✔ PASS: Stock correctly restored upon order cancellation');
  }

  // 5. CHECK 4 — Sales Return Stock Restoration
  console.log('\n--> 5. Check 4 — Sales Return Stock Restoration...');
  // Create delivered order with 2 items
  const deliveredOrderRes = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchDhk.id,
        saleType: 'POS',
        paidAmount: 50000,
        items: [
          {
            productId: testProduct.id,
            variantId: testVariant.id,
            quantity: 2,
            unitPrice: 25000,
          },
        ],
      }),
    },
    adminToken,
  );
  const delOrder = deliveredOrderRes.data;
  const orderItemId = delOrder.items[0].id;

  // Create Sales Return
  const returnRes = await apiFetch(
    '/sales-returns',
    {
      method: 'POST',
      body: JSON.stringify({
        orderId: delOrder.id,
        reason: 'Defective screen touch response',
        items: [
          {
            orderItemId: orderItemId,
            quantity: 1,
          },
        ],
      }),
    },
    adminToken,
  );

  const returnId = returnRes.data.id;
  const stockBeforeReturnApprove = (await prisma.productVariant.findUnique({ where: { id: testVariant.id } })).stock;

  // Approve the return
  const approveReturnRes = await apiFetch(`/sales-returns/${returnId}/approve`, { method: 'PATCH' }, adminToken);
  const stockAfterReturnApprove = (await prisma.productVariant.findUnique({ where: { id: testVariant.id } })).stock;

  console.log(`  Stock before return approval: ${stockBeforeReturnApprove}, Stock after approval: ${stockAfterReturnApprove} (restored +1)`);
  if (approveReturnRes.status === 200 && stockAfterReturnApprove === stockBeforeReturnApprove + 1) {
    results.check4_sales_return_stock = {
      pass: true,
      before: stockBeforeReturnApprove,
      after: stockAfterReturnApprove,
      qty: 1,
    };
    console.log('  ✔ PASS: Sales return approval restored returned quantity to stock');
  }

  // 6. CHECK 5 — 403 Permission Enforcement (Not Just 401)
  console.log('\n--> 6. Check 5 — 403 Permission Enforcement...');
  // Find or create SEO staff (SEO role has no ORDERS permissions)
  const seoRole = await prisma.role.findUnique({ where: { name: 'SEO' } });
  const passwordHash = await bcrypt.hash('Seo@12345', 10);
  const seoStaff = await prisma.staff.upsert({
    where: { email: 'seo@novamobile.test' },
    update: { roleId: seoRole.id },
    create: {
      employeeId: 'EMP-SEO-01',
      name: 'SEO Specialist',
      email: 'seo@novamobile.test',
      phone: '+8801799999991',
      passwordHash,
      roleId: seoRole.id,
      status: StaffStatus.ACTIVE,
    },
  });

  const seoLogin = await apiFetch('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'seo@novamobile.test', password: 'Seo@12345' }),
  });
  const seoToken = seoLogin.data.accessToken;

  // SEO attempts POST /orders (Requires ORDERS CREATE) -> Expect 403
  const forbiddenAttempt = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchDhk.id,
        items: [{ productId: testProduct.id, variantId: testVariant.id, quantity: 1, unitPrice: 25000 }],
      }),
    },
    seoToken,
  );

  // Admin attempts SAME request -> Expect 201
  const adminAllowedAttempt = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchDhk.id,
        items: [{ productId: testProduct.id, variantId: testVariant.id, quantity: 1, unitPrice: 25000 }],
      }),
    },
    adminToken,
  );

  console.log(`  SEO Role attempted POST /orders -> Status: ${forbiddenAttempt.status} (Forbidden)`);
  console.log(`  Admin Role attempted same POST /orders -> Status: ${adminAllowedAttempt.status} (Created)`);

  if (forbiddenAttempt.status === 403 && adminAllowedAttempt.status === 201) {
    results.check5_rbac_403 = {
      pass: true,
      role: 'SEO',
      action: 'POST /orders (CREATE ORDERS)',
      statusCode: forbiddenAttempt.status,
      adminStatusCode: adminAllowedAttempt.status,
    };
    console.log('  ✔ PASS: 403 Forbidden correctly returned for insufficient permission, 201 for Admin');
  }

  // 7. CHECK 6 — 403 Branch Scope Enforcement
  console.log('\n--> 7. Check 6 — 403 Branch Scope Enforcement...');
  // Create Branch Admin for Branch Dhaka (scope: OWN_BRANCH)
  const branchAdminRole = await prisma.role.findUnique({ where: { name: 'Branch Admin' } });
  const brStaff = await prisma.staff.upsert({
    where: { email: 'bradmin.dhaka@novamobile.test' },
    update: { roleId: branchAdminRole.id, branchId: branchDhk.id },
    create: {
      employeeId: 'EMP-BR-DHK',
      name: 'Dhaka Branch Admin',
      email: 'bradmin.dhaka@novamobile.test',
      phone: '+8801799999992',
      passwordHash,
      roleId: branchAdminRole.id,
      branchId: branchDhk.id,
      status: StaffStatus.ACTIVE,
    },
  });

  const brLogin = await apiFetch('/auth/staff/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'bradmin.dhaka@novamobile.test', password: 'Seo@12345' }),
  });
  const brAdminToken = brLogin.data.accessToken;

  // Order in Branch Chittagong (Branch B)
  const ctgOrderRes = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchCtg.id,
        items: [{ productId: testProduct.id, variantId: testVariant.id, quantity: 1, unitPrice: 25000 }],
      }),
    },
    adminToken,
  );
  const ctgOrderId = ctgOrderRes.data.id;

  // Order in Branch Dhaka (Branch A)
  const dhkOrderRes = await apiFetch(
    '/orders',
    {
      method: 'POST',
      body: JSON.stringify({
        branchId: branchDhk.id,
        items: [{ productId: testProduct.id, variantId: testVariant.id, quantity: 1, unitPrice: 25000 }],
      }),
    },
    adminToken,
  );
  const dhkOrderId = dhkOrderRes.data.id;

  // Dhaka Branch Admin attempts to update Chittagong order -> Expect 403
  const crossBranchAttempt = await apiFetch(
    `/orders/${ctgOrderId}/status`,
    { method: 'PATCH', body: JSON.stringify({ status: 'CONFIRMED' }) },
    brAdminToken,
  );

  // Dhaka Branch Admin attempts to update Dhaka order -> Expect 200
  const ownBranchAttempt = await apiFetch(
    `/orders/${dhkOrderId}/status`,
    { method: 'PATCH', body: JSON.stringify({ status: 'CONFIRMED' }) },
    brAdminToken,
  );

  console.log(`  Dhaka Branch Admin updating Chittagong Order -> Status: ${crossBranchAttempt.status} (Forbidden)`);
  console.log(`  Dhaka Branch Admin updating Dhaka (Own) Order -> Status: ${ownBranchAttempt.status} (OK)`);

  if (crossBranchAttempt.status === 403 && ownBranchAttempt.status === 200) {
    results.check6_branch_scope_403 = {
      pass: true,
      staffBranch: 'BR-DHK (Dhaka Main)',
      targetBranch: 'BR-CTG (Chittagong Outlet)',
      statusCode: crossBranchAttempt.status,
      ownBranchStatusCode: ownBranchAttempt.status,
    };
    console.log('  ✔ PASS: 403 returned on cross-branch update, 200 on own-branch update');
  }

  // 8. CHECK 7 — Frontend Real-Data Rendering
  console.log('\n--> 8. Check 7 — Frontend Real-Data Rendering...');
  const frontendPages = [
    '/admin/sales/diagnosing',
    '/admin/sales/courier',
    '/admin/sales/all',
    '/admin/sales/service',
    '/admin/sales/courier-list',
    '/admin/orders',
    `/admin/orders/${dhkOrderId}`,
    '/admin/sales-returns',
    '/admin/exchanges',
    '/account/orders',
  ];

  let frontendAllPass = true;
  for (const page of frontendPages) {
    const url = `http://localhost:3000${page}`;
    try {
      const res = await fetch(url);
      console.log(`  GET ${page} -> ${res.status}`);
      results.check7_frontend_rendering.pages[page] = res.status;
      if (res.status !== 200) frontendAllPass = false;
    } catch (e) {
      console.log(`  GET ${page} -> ERROR: ${e.message}`);
      results.check7_frontend_rendering.pages[page] = 'ERR';
      frontendAllPass = false;
    }
  }
  results.check7_frontend_rendering.pass = frontendAllPass;

  // 9. CHECK 8 — No Mock Imports in Part B pages
  console.log('\n--> 9. Check 8 — No Mock Imports Remain...');
  const filesToCheck = [
    'src/app/(admin)/admin/sales/diagnosing/page.tsx',
    'src/app/(admin)/admin/sales/courier/page.tsx',
    'src/app/(admin)/admin/sales/all/page.tsx',
    'src/app/(admin)/admin/sales/service/page.tsx',
    'src/app/(admin)/admin/sales/courier-list/page.tsx',
    'src/app/(admin)/admin/orders/page.tsx',
    'src/app/(admin)/admin/orders/[id]/page.tsx',
    'src/app/(admin)/admin/sales-returns/page.tsx',
    'src/app/(admin)/admin/sales-returns/[id]/page.tsx',
    'src/app/(admin)/admin/exchanges/page.tsx',
    'src/app/(admin)/admin/exchanges/[id]/page.tsx',
    'src/app/(storefront)/account/orders/page.tsx',
  ];

  const fs = await import('fs');
  let mockCount = 0;
  for (const file of filesToCheck) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('mock-data') || content.includes('mockOrders') || content.includes('mockSales')) {
      console.log(`  ❌ Mock reference in ${file}`);
      mockCount++;
    }
  }

  if (mockCount === 0) {
    results.check8_no_mock_imports = { pass: true, matches: [] };
    console.log('  ✔ PASS: 0 mock imports found across all Part B target pages');
  }

  console.log('\n=====================================================================');
  console.log('ALL VERIFICATION CHECKS COMPLETE');
  console.log('=====================================================================');
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch((e) => {
    console.error('Test execution error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
