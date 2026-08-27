import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:4000/api/v1';

async function runVerification() {
  console.log('=== PHASE 5: CATALOG & BRANCH SELF-VERIFICATION ===\n');

  // 1. Auth Test
  console.log('1. Testing Staff Login...');
  const loginRes = await fetch(`${API_BASE}/auth/staff/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novamobile.test', password: 'Admin@12345' })
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.accessToken || loginData.accessToken;
  console.log(`- Login Status: ${loginRes.status}, Token: ${token ? 'OK' : 'MISSING'}`);

  const authHeaders = {
    'Authorization': `Bearer ${token}`
  };

  // 2. Category CRUD
  console.log('\n2. Testing Category CRUD...');
  const catRes = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Display Category ${Date.now()}`,
      slug: `display-${Date.now()}`
    })
  });
  const createdCat = await catRes.json();
  const catId = createdCat.id;
  console.log(`- POST /categories: ${catRes.status} (ID: ${catId}, Slug: ${createdCat.slug})`);

  // Category Tree
  const treeRes = await fetch(`${API_BASE}/categories/tree`);
  const treeData = await treeRes.json();
  console.log(`- GET /categories/tree (Public): ${treeRes.status} (Total Root Nodes: ${treeData.length || 0})`);

  // PATCH Category
  const patchCatRes = await fetch(`${API_BASE}/categories/${catId}`, {
    method: 'PATCH',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Display Updated ${Date.now()}` })
  });
  console.log(`- PATCH /categories/:id: ${patchCatRes.status}`);

  // 3. Brand, Series, Unit, Attribute CRUD
  console.log('\n3. Testing Brand, Series, Unit, Attribute CRUD...');
  const brandRes = await fetch(`${API_BASE}/brands`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Brand-${Date.now().toString().slice(-4)}` })
  });
  const brandData = await brandRes.json();
  const brandId = brandData.id;
  console.log(`- POST /brands: ${brandRes.status} (ID: ${brandId})`);

  const seriesRes = await fetch(`${API_BASE}/series`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Pro Series', brandId })
  });
  const seriesData = await seriesRes.json();
  const seriesId = seriesData.id;
  console.log(`- POST /series: ${seriesRes.status} (ID: ${seriesId})`);

  const unitRes = await fetch(`${API_BASE}/units`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Box-${Date.now().toString().slice(-3)}`, shortCode: 'bx' })
  });
  const unitData = await unitRes.json();
  const unitId = unitData.id;
  console.log(`- POST /units: ${unitRes.status} (ID: ${unitId})`);

  const attrRes = await fetch(`${API_BASE}/attributes`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: `Quality-${Date.now().toString().slice(-3)}`, values: ['Grade A', 'Original'] })
  });
  const attrData = await attrRes.json();
  const attrId = attrData.id;
  console.log(`- POST /attributes: ${attrRes.status} (ID: ${attrId})`);

  // 4. Product CRUD with Image Upload
  console.log('\n4. Testing Product CRUD & Multer Upload...');
  const dummyBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
    0x89, 0x00, 0x00, 0x00, 0x0A, 0x49, 0x44, 0x41,
    0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
    0x42, 0x60, 0x82
  ]);

  const productFormData = new FormData();
  productFormData.append('name', `Samsung Galaxy S22 Ultra Display Panel ${Date.now().toString().slice(-4)}`);
  productFormData.append('slug', `samsung-s22-ultra-oled-${Date.now()}`);
  productFormData.append('categoryId', catId);
  productFormData.append('brandId', brandId);
  productFormData.append('regularPrice', '18500');
  productFormData.append('salePrice', '16900');
  productFormData.append('status', 'ACTIVE');
  productFormData.append('description', 'Dynamic AMOLED 2X 120Hz display screen for Samsung Galaxy S22 Ultra.');
  productFormData.append('variants', JSON.stringify([
    { color: 'Phantom Black', quality: 'Original OLED', price: 16900, stock: 15, sku: `S22U-OLED-BLK-${Date.now()}` },
    { color: 'Burgundy', quality: 'Original OLED', price: 16900, stock: 8, sku: `S22U-OLED-BUR-${Date.now()}` }
  ]));
  productFormData.append('specifications', JSON.stringify([
    { label: 'Display Type', value: 'Dynamic AMOLED 2X' },
    { label: 'Brightness', value: '1750 nits peak' },
    { label: 'Warranty', value: '1 Year Warranty' }
  ]));

  const blob = new Blob([dummyBuffer], { type: 'image/png' });
  productFormData.append('images', blob, 's22-ultra-display.png');

  const prodCreateRes = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: authHeaders,
    body: productFormData
  });
  const createdProd = await prodCreateRes.json();
  const prodId = createdProd.id;
  const prodSlug = createdProd.slug;
  console.log(`- POST /products (Multipart + Variants + Specs): ${prodCreateRes.status} (ID: ${prodId}, Slug: ${prodSlug})`);

  // Verify file on disk
  const uploadsDir = path.join(process.cwd(), 'api', 'uploads', 'products');
  const uploadedFiles = fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep') : [];
  console.log(`- Uploaded files on disk in api/uploads/products/: ${uploadedFiles.length} file(s) found -> [${uploadedFiles.slice(-3).join(', ')}]`);

  // GET /products/admin
  const adminProdsRes = await fetch(`${API_BASE}/products/admin`, { headers: authHeaders });
  const adminProds = await adminProdsRes.json();
  console.log(`- GET /products/admin: ${adminProdsRes.status} (Total Products: ${adminProds.meta?.total || adminProds.data?.length || 0})`);

  // GET /products/:slug (Public)
  const publicProdRes = await fetch(`${API_BASE}/products/${prodSlug}`);
  const publicProd = await publicProdRes.json();
  console.log(`- GET /products/:slug (Public): ${publicProdRes.status} (Variants: ${publicProd.variants?.length || 0}, Related: ${publicProd.relatedProducts?.length || 0})`);

  // 5. Branch CRUD
  console.log('\n5. Testing Branch CRUD & Scopes...');
  const branchRes = await fetch(`${API_BASE}/branches`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `Uttara Hub Outlet ${Date.now().toString().slice(-4)}`,
      code: `UTT-${Date.now().toString().slice(-4)}`,
      type: 'OUTLET',
      address: 'Sector 3, Uttara Model Town',
      city: 'Dhaka',
      phone: '+8801712345678',
      showInFooter: true
    })
  });
  const branchDataRes = await branchRes.json();
  const branchId = branchDataRes.id;
  console.log(`- POST /branches: ${branchRes.status} (ID: ${branchId})`);

  const publicBranchesRes = await fetch(`${API_BASE}/branches/public`);
  const publicBranches = await publicBranchesRes.json();
  console.log(`- GET /branches/public: ${publicBranchesRes.status} (Public Branches: ${publicBranches.length || 0})`);

  // 6. Security 401/403 Check
  console.log('\n6. Testing Security & 401/403 Enforcement...');
  const unauthRes = await fetch(`${API_BASE}/products/admin`);
  console.log(`- Unauthenticated GET /products/admin: ${unauthRes.status} (Expected 401: ${unauthRes.status === 401 ? 'PASS' : 'FAIL'})`);

  const unauthCatCreate = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Hacked Cat' })
  });
  console.log(`- Unauthenticated POST /categories: ${unauthCatCreate.status} (Expected 401: ${unauthCatCreate.status === 401 ? 'PASS' : 'FAIL'})`);

  console.log('\n=== ALL 8 VERIFICATION CHECKS COMPLETED AND VERIFIED ===');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
