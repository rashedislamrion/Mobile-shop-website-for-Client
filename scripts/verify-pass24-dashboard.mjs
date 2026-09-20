import { PrismaClient } from "../api/node_modules/@prisma/client/index.js";

const API_BASE = "http://localhost:4000/api/v1";
const prisma = new PrismaClient();

async function login(email, password = "Admin@12345") {
  const res = await fetch(`${API_BASE}/auth/staff/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Login failed for ${email} (${res.status}): ${err}`);
  }
  const data = await res.json();
  return { token: data.accessToken, user: data.user };
}

async function runPass24Audit() {
  console.log("================================================================================");
  console.log("      FIX PASS 24: REVENUE, PROFIT & ORDER-STATUS DASHBOARD AUDIT");
  console.log("================================================================================");

  const { token: adminToken } = await login("admin@novamobile.test");
  const headers = {
    Authorization: `Bearer ${adminToken}`,
    "Content-Type": "application/json",
  };

  const results = { passed: 0, failed: 0, tests: [] };

  function assert(condition, message, details = null) {
    if (condition) {
      results.passed++;
      console.log(`  ✅ [PASS] ${message}`);
      results.tests.push({ status: "PASS", message, details });
    } else {
      results.failed++;
      console.error(`  ❌ [FAIL] ${message}`);
      if (details) console.error(`     Details:`, details);
      results.tests.push({ status: "FAIL", message, details });
    }
  }

  // 1. Fetch available branches
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true, code: true },
  });
  console.log(`\nFound ${branches.length} branches in database.`);
  assert(branches.length > 0, "Branches exist in database");

  // 2. GLOBAL DASHBOARD VERIFICATION
  console.log("\n--- [TEST 1] Global Dashboard Audit (No Branch Filter) ---");
  const globalRes = await fetch(`${API_BASE}/reports/dashboard`, { headers });
  assert(globalRes.ok, `GET /reports/dashboard returned 200 OK (${globalRes.status})`);
  const globalData = await globalRes.json();

  const gk = globalData.kpi;
  assert(gk !== undefined, "Global KPI object returned");
  assert(typeof gk.totalSales === "number", `Total Sales is a number: ৳${gk?.totalSales}`);
  assert(typeof gk.totalPhoneSales === "number", `Total Phone Sales is a number: ৳${gk?.totalPhoneSales}`);
  assert(typeof gk.totalDisplaySales === "number", `Total Display Sales is a number: ৳${gk?.totalDisplaySales}`);
  assert(typeof gk.totalGadgetSales === "number", `Total Gadget Sales is a number: ৳${gk?.totalGadgetSales}`);
  assert(typeof gk.totalServices === "number", `Total Services is a number: ৳${gk?.totalServices}`);
  assert(typeof gk.totalProfit === "number", `Total Profit is a number: ৳${gk?.totalProfit}`);
  assert(typeof gk.totalPurchase === "number", `Total Purchase is a number: ৳${gk?.totalPurchase}`);
  assert(typeof gk.totalSupplierDue === "number" && gk.totalSupplierDue >= 0, `Total Supplier Due is a non-negative number: ৳${gk?.totalSupplierDue}`);

  // Strict Formula: Total Sales = Total Phone Sales + Total Display Sales + Total Gadget Sales + Total Services
  const computedGlobalSales = Math.round((gk.totalPhoneSales + gk.totalDisplaySales + gk.totalGadgetSales + gk.totalServices) * 100) / 100;
  assert(
    Math.abs(gk.totalSales - computedGlobalSales) < 0.05,
    `Strict Formula: Total Sales (৳${gk.totalSales}) === Phone (৳${gk.totalPhoneSales}) + Display (৳${gk.totalDisplaySales}) + Gadget (৳${gk.totalGadgetSales}) + Services (৳${gk.totalServices})`,
    { returned: gk.totalSales, computed: computedGlobalSales }
  );

  // Operational metrics presence
  assert(typeof gk.totalRevenue === "number", `Preserved totalRevenue: ৳${gk.totalRevenue}`);
  assert(typeof gk.netProductSales === "number", `Preserved netProductSales: ৳${gk.netProductSales}`);
  assert(typeof gk.netServiceRevenue === "number", `Preserved netServiceRevenue: ৳${gk.netServiceRevenue}`);
  assert(typeof gk.liquidSales === "number", `Preserved liquidSales: ৳${gk.liquidSales}`);
  assert(typeof gk.totalExpensePayroll === "number", `Preserved totalExpensePayroll: ৳${gk.totalExpensePayroll}`);
  assert(typeof gk.totalSupplierPayment === "number", `Preserved totalSupplierPayment: ৳${gk.totalSupplierPayment}`);
  assert(typeof gk.totalDueSales === "number", `Preserved totalDueSales: ৳${gk.totalDueSales}`);

  // Global Order Status Overview
  const gos = globalData.orderStatuses;
  assert(gos !== undefined, "Global orderStatuses object returned");
  console.log("Global Order Statuses:", gos);
  const requiredStatuses = ["pending", "confirmed", "parcelBooked", "delivered", "returned", "cancelled", "diagnosing", "completed"];
  for (const status of requiredStatuses) {
    assert(typeof gos[status] === "number" && gos[status] >= 0, `Global Order Status '${status}' is valid count: ${gos[status]}`);
  }

  // 3. PERIOD FILTERS AUDIT (This Month, Today, This Week, This Year, All-Time)
  console.log("\n--- [TEST 2] Period Filter Consistency Audit ---");
  const periods = ["Today", "This Week", "This Month", "This Year", "All"];
  for (const p of periods) {
    const periodRes = await fetch(`${API_BASE}/reports/dashboard?period=${encodeURIComponent(p)}`, { headers });
    assert(periodRes.ok, `GET /reports/dashboard?period=${p} returned 200 OK`);
    const pData = await periodRes.json();
    const pk = pData.kpi;
    const computedSales = Math.round((pk.totalPhoneSales + pk.totalDisplaySales + pk.totalGadgetSales + pk.totalServices) * 100) / 100;
    assert(
      Math.abs(pk.totalSales - computedSales) < 0.05,
      `Period '${p}' formula holds: Total Sales (৳${pk.totalSales}) === Sum of Streams (৳${computedSales})`,
      { totalSales: pk.totalSales, computedSales }
    );
    // Running balance check: Supplier Due should remain steady as of now
    assert(pk.totalSupplierDue >= 0, `Period '${p}' Supplier Due is non-negative: ৳${pk.totalSupplierDue}`);
  }

  // 4. BRANCH-SCOPED DASHBOARD AUDIT
  console.log("\n--- [TEST 3] Branch-Scoped Dashboard Audit ---");
  for (const branch of branches) {
    console.log(`\nTesting Branch: ${branch.name} (${branch.id})...`);
    const branchRes = await fetch(`${API_BASE}/reports/dashboard?branch=${encodeURIComponent(branch.id)}&period=This%20Month`, { headers });
    assert(branchRes.ok, `GET /reports/dashboard?branch=${branch.id}&period=This Month returned 200 OK`);
    const bData = await branchRes.json();
    const bk = bData.kpi;

    // Strict formula verification
    const computedBranchSales = Math.round((bk.totalPhoneSales + bk.totalDisplaySales + bk.totalGadgetSales + bk.totalServices) * 100) / 100;
    assert(
      Math.abs(bk.totalSales - computedBranchSales) < 0.05,
      `[${branch.code}] Total Sales (৳${bk.totalSales}) === Phone (৳${bk.totalPhoneSales}) + Display (৳${bk.totalDisplaySales}) + Gadget (৳${bk.totalGadgetSales}) + Services (৳${bk.totalServices})`,
      { totalSales: bk.totalSales, computedBranchSales }
    );

    // Branch scoping isolation check: Branch sales cannot exceed Global sales
    assert(
      bk.totalSales <= gk.totalSales + 0.01,
      `[${branch.code}] Branch Total Sales (৳${bk.totalSales}) <= Global Total Sales (৳${gk.totalSales})`
    );
    assert(
      bk.totalPurchase <= gk.totalPurchase + 0.01,
      `[${branch.code}] Branch Purchase (৳${bk.totalPurchase}) <= Global Purchase (৳${gk.totalPurchase})`
    );

    // Order status check
    const bos = bData.orderStatuses;
    for (const status of requiredStatuses) {
      assert(typeof bos[status] === "number" && bos[status] >= 0, `[${branch.code}] Status '${status}' count is valid: ${bos[status]}`);
      assert(bos[status] <= gos[status], `[${branch.code}] Branch '${status}' (${bos[status]}) <= Global (${gos[status]})`);
    }

    // Direct DB Verification for this branch
    const dbDeliveredOrders = await prisma.order.count({
      where: {
        branchId: branch.id,
        status: "DELIVERED",
      },
    });
    console.log(`  [DB Verify] DB Delivered orders for ${branch.code}: ${dbDeliveredOrders} | API Delivered count: ${bos.delivered}`);
  }

  // 5. CLIENT BUG SIGNAL RESOLUTION VERIFICATION
  console.log("\n--- [TEST 4] Client Screenshot Bug Signal Verification ---");
  // The client reported: Total Sales was identical to Total Phone Sales (৳4,969,200), Total Gadget was ৳150,000,
  // causing Total Sales to fail the sum rule.
  // We verify that Total Sales is NEVER artificially equated to Total Phone Sales when Gadget/Display/Service sales exist.
  for (const b of branches) {
    const res = await fetch(`${API_BASE}/reports/dashboard?branch=${encodeURIComponent(b.id)}`, { headers });
    const d = await res.json();
    const k = d.kpi;
    if (k.totalGadgetSales > 0 || k.totalDisplaySales > 0 || k.totalServices > 0) {
      assert(
        k.totalSales > k.totalPhoneSales,
        `Branch [${b.code}] Bug Signal Resolved: Total Sales (৳${k.totalSales}) > Total Phone Sales (৳${k.totalPhoneSales}) because other categories exist`
      );
    }
  }

  // 6. DB DIRECT COGS & PROFIT ACCURACY CHECK
  console.log("\n--- [TEST 5] COGS & Profit Integrity Check ---");
  // Check that profit is <= sales (or strictly sales - COGS)
  assert(
    gk.totalProfit <= gk.totalSales,
    `Global Profit (৳${gk.totalProfit}) <= Global Total Sales (৳${gk.totalSales})`
  );

  console.log("\n================================================================================");
  console.log(`   FIX PASS 24 AUDIT RESULTS: ${results.passed} PASSED | ${results.failed} FAILED`);
  console.log("================================================================================");

  if (results.failed > 0) {
    process.exit(1);
  }
}

runPass24Audit()
  .catch((err) => {
    console.error("Audit threw unhandled exception:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
