import http from 'http';

const API_BASE = 'http://localhost:4000/api/v1';

async function request(path, options = {}) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${API_BASE}${cleanPath}`);
  return new Promise((resolve, reject) => {
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try {
          json = data ? JSON.parse(data) : null;
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('================================================================');
  console.log('PHASE 8: MARKETING, CMS, SETTINGS & CHECKOUT/PAYMENT VERIFICATION');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.log(`  ❌ FAIL: ${name} ${details ? `-> ${details}` : ''}`);
      failed++;
    }
  }

  // --- Step 0: Auth Logins ---
  console.log('--- Step 0: Pre-Flight & Authentications ---');
  let adminToken = '';
  let customerToken = '';

  try {
    const adminRes = await request('/auth/staff/login', {
      method: 'POST',
      body: { email: 'admin@novamobile.test', password: 'Admin@12345' }
    });
    const token = adminRes.data?.accessToken || adminRes.data?.access_token;
    if ((adminRes.status === 200 || adminRes.status === 201) && token) {
      adminToken = token;
      assert(true, 'Admin authentication successful');
    } else {
      assert(false, 'Admin authentication failed', JSON.stringify(adminRes.data));
    }
  } catch (err) {
    assert(false, 'Admin authentication error', err.message);
  }

  try {
    const regRes = await request('/auth/customer/register', {
      method: 'POST',
      body: {
        name: 'Test Customer P8',
        phone: `017${Date.now().toString().slice(-8)}`,
        email: `cust${Date.now()}@test.com`,
        password: 'Password123!',
        confirmPassword: 'Password123!'
      }
    });
    const token = regRes.data?.accessToken || regRes.data?.access_token;
    if (regRes.status === 201 && token) {
      customerToken = token;
      assert(true, 'Customer registered & authenticated');
    } else {
      assert(false, 'Customer registration/auth failed', JSON.stringify(regRes.data));
    }
  } catch (err) {
    assert(false, 'Customer login error', err.message);
  }

  // Regression check
  try {
    const prodRes = await request('/products?limit=1');
    assert(prodRes.status === 200, 'Pre-flight: GET /products is healthy');
    const orderRes = await request('/orders?limit=1', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(orderRes.status === 200, 'Pre-flight: GET /orders is healthy');
  } catch (err) {
    assert(false, 'Pre-flight regression check failed', err.message);
  }

  // --- Step 1: Marketing Endpoints ---
  console.log('\n--- Step 1: Marketing Module (Banners, Ads, Promo, Push, Blogs) ---');
  let bannerId = '';
  let promoId = '';
  let blogId = '';

  // Banners
  const activeBanners = await request('/banners/active');
  assert(activeBanners.status === 200 && Array.isArray(activeBanners.data), 'GET /banners/active is public and returns array');

  const createBanner = await request('/banners', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Summer Tech Fest 2026',
      imageUrl: 'https://images.unsplash.com/photo-1616469829941-c7200edec809',
      linkUrl: '/category/displays',
      status: 'ACTIVE',
      sortOrder: 1
    }
  });
  assert(createBanner.status === 201 && createBanner.data?.id, 'POST /banners creates banner record', JSON.stringify(createBanner.data));
  bannerId = createBanner.data?.id;

  const getBannersUnauth = await request('/banners');
  assert(getBannersUnauth.status === 401, 'RBAC 401: GET /banners without token is rejected');

  // Ads
  const createAd = await request('/ads', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Flash Sale Sidebar',
      placement: 'HOMEPAGE_SIDEBAR',
      imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd',
      linkUrl: '/sale',
      status: 'ACTIVE'
    }
  });
  assert(createAd.status === 201 && createAd.data?.id, 'POST /ads creates ad placement', JSON.stringify(createAd.data));

  // Promo Codes & Validation
  const createPromo = await request('/promo-codes', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      code: `DISCOUNT${Date.now().toString().slice(-4)}`,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 500,
      maxDiscountCap: 500,
      usageLimit: 100,
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString(),
      status: 'ACTIVE'
    }
  });
  assert(createPromo.status === 201 && createPromo.data?.code, 'POST /promo-codes creates coupon code', JSON.stringify(createPromo.data));
  const promoCode = createPromo.data?.code;
  promoId = createPromo.data?.id;

  const validatePromo = await request('/promo-codes/validate', {
    method: 'POST',
    body: { code: promoCode, orderSubtotal: 1000 }
  });
  assert(validatePromo.status === 201 && validatePromo.data?.discountAmount === 100, 'POST /promo-codes/validate computes 10% discount correctly (৳100 on ৳1000)', JSON.stringify(validatePromo.data));

  // Push Notifications
  const broadcastPush = await request('/push-notifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Mega Deals Today!',
      message: 'Grab premium AMOLED replacement screens at 15% off.',
      targetAudience: 'ALL_CUSTOMERS',
      sendOption: 'now'
    }
  });
  assert(broadcastPush.status === 201 && broadcastPush.data?.status === 'SENT', 'POST /push-notifications broadcasts notification', JSON.stringify(broadcastPush.data));

  // Blogs
  const createBlog = await request('/blogs', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: `How to replace an OLED screen ${Date.now()}`,
      slug: `oled-replacement-guide-${Date.now()}`,
      content: '<p>Carefully heat the screen edges with a heatgun...</p>',
      excerpt: 'Essential DIY screen repair guidelines',
      status: 'PUBLISHED'
    }
  });
  assert(createBlog.status === 201 && createBlog.data?.slug, 'POST /blogs creates published blog', JSON.stringify(createBlog.data));
  const blogSlug = createBlog.data?.slug;
  blogId = createBlog.data?.id;

  const publicBlog = await request(`/blogs/${blogSlug}`);
  assert(publicBlog.status === 200 && publicBlog.data?.title, 'GET /blogs/:slug fetches published blog publicly', JSON.stringify(publicBlog.data));

  // --- Step 2: CMS Module ---
  console.log('\n--- Step 2: CMS Module (Pages, Menus, Footer, Countries, Social, Contact, Issues) ---');
  
  // Pages
  const createPage = await request('/pages', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      title: 'Warranty Policy 2026',
      slug: `warranty-policy-${Date.now()}`,
      content: '<p>All genuine displays come with 30 days replacement warranty.</p>',
      status: 'PUBLISHED'
    }
  });
  assert(createPage.status === 201 && createPage.data?.slug, 'POST /pages creates static CMS page', JSON.stringify(createPage.data));
  const pageSlug = createPage.data?.slug;

  const publicPage = await request(`/pages/${pageSlug}`);
  assert(publicPage.status === 200 && publicPage.data?.content, 'GET /pages/:slug fetches page publicly', JSON.stringify(publicPage.data));

  // Menus
  const createMenu = await request('/menus', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      menuType: 'HEADER',
      label: 'Special Deals',
      linkType: 'CUSTOM',
      linkValue: '/deals',
      openInNewTab: false,
      sortOrder: 1
    }
  });
  assert(createMenu.status === 201 && createMenu.data?.id, 'POST /menus creates header menu link', JSON.stringify(createMenu.data));

  const getPublicMenus = await request('/menus?type=HEADER');
  assert(getPublicMenus.status === 200 && Array.isArray(getPublicMenus.data), 'GET /menus?type=HEADER returns public menu items', JSON.stringify(getPublicMenus.data));

  // Footer Settings
  const patchFooter = await request('/footer-settings', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      supportPhone: '+880 1700-112233',
      supportEmail: 'care@novamobile.com',
      copyrightText: '© 2026 NovaMobile Enterprise.'
    }
  });
  assert(patchFooter.status === 200 && patchFooter.data?.supportPhone === '+880 1700-112233', 'PATCH /footer-settings updates store footer', JSON.stringify(patchFooter.data));

  const publicFooter = await request('/footer-settings');
  assert(publicFooter.status === 200 && publicFooter.data?.copyrightText, 'GET /footer-settings is accessible publicly');

  // Countries
  const createCountry = await request('/countries', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: `Country-${Date.now().toString().slice(-4)}`,
      code: `C${Date.now().toString().slice(-1)}`,
      currency: 'BDT'
    }
  });
  assert(createCountry.status === 201 && createCountry.data?.code, 'POST /countries creates operational region', JSON.stringify(createCountry.data));

  // Social Links
  const patchSocial = await request('/social-links/FACEBOOK', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { url: 'https://facebook.com/novamobilebd', status: 'ACTIVE' }
  });
  assert(patchSocial.status === 200 && patchSocial.data?.url === 'https://facebook.com/novamobilebd', 'PATCH /social-links/FACEBOOK updates platform URL');

  // Public Contact Form Submission
  const contactMsg = await request('/contact-submissions', {
    method: 'POST',
    body: {
      name: 'Rahim Ahmed',
      email: 'rahim@gmail.com',
      phone: '01811223344',
      subject: 'Inquiry about bulk AMOLED screens',
      message: 'Do you offer wholesale discount for 50pcs iPhone 13 displays?'
    }
  });
  assert(contactMsg.status === 201 && contactMsg.data?.id, 'POST /contact-submissions submits public inquiry');

  const adminContacts = await request('/contact-submissions', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  assert(adminContacts.status === 200 && Array.isArray(adminContacts.data?.data || adminContacts.data), 'GET /contact-submissions lists inquiries for admin', JSON.stringify(adminContacts.data));

  // Ticket Issue Types
  const createIssue = await request('/ticket-issue-types', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      name: `Issue ${Date.now().toString().slice(-4)}`,
      category: 'PRODUCT_ISSUE'
    }
  });
  assert(createIssue.status === 201 && createIssue.data?.id, 'POST /ticket-issue-types creates issue classification', JSON.stringify(createIssue.data));

  // --- Step 3: Business Settings & 3rd Party Module ---
  console.log('\n--- Step 3: Business Settings & 3rd Party Gateway Configurations ---');

  const patchBusiness = await request('/business-settings', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      general: { businessName: 'NovaMobile Official Store' },
      orderSettings: { defaultDeliveryCharge: 70, freeShippingThreshold: 5000 }
    }
  });
  assert(patchBusiness.status === 200 && patchBusiness.data?.orderSettings?.defaultDeliveryCharge === 70, 'PATCH /business-settings updates global store policies');

  const publicGateways = await request('/payment-gateways/public');
  assert(publicGateways.status === 200 && Array.isArray(publicGateways.data), 'GET /payment-gateways/public lists available payment channels');

  const patchCodGateway = await request('/payment-gateways/COD', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { isActive: true, title: 'Cash on Delivery (COD)' }
  });
  assert(patchCodGateway.status === 200 && patchCodGateway.data?.isActive === true, 'PATCH /payment-gateways/COD activates Cash on Delivery');

  // --- Step 4: Storefront Cart & Checkout Flow + Gateway Routing ---
  console.log('\n--- Step 4: Storefront Cart & Checkout Flow with Gateways & Stock ---');

  // Find a product with stock
  const allProds = await request('/products?limit=5');
  const testProduct = allProds.data?.data?.[0];

  if (testProduct) {
    // 1. Checkout with COD (Guest checkout + Promo code)
    const guestCheckout = await request('/orders/checkout', {
      method: 'POST',
      body: {
        items: [
          { productId: testProduct.id, quantity: 1 }
        ],
        deliveryType: 'STANDARD',
        paymentMethod: 'COD',
        promoCode: promoCode,
        guestInfo: {
          name: 'Guest Shopper P8',
          phone: `019${Date.now().toString().slice(-8)}`,
          email: `guest${Date.now()}@test.com`,
          address: 'House 12, Road 4, Dhanmondi, Dhaka'
        },
        orderNotes: 'Please call before delivery'
      }
    });

    assert(
      guestCheckout.status === 201 && guestCheckout.data?.orderId && guestCheckout.data?.paymentMethod === 'COD',
      'POST /orders/checkout completes COD guest order with automatic address and stock validation',
      JSON.stringify(guestCheckout.data)
    );

    const createdOrderId = guestCheckout.data?.orderId;

    // 2. bKash Gateway test (Should reject 400 cleanly when inactive or missing credentials as designed)
    const bkashInitiate = await request('/payments/bkash/initiate', {
      method: 'POST',
      body: { orderId: createdOrderId }
    });
    assert(
      bkashInitiate.status === 400 || bkashInitiate.status === 201,
      `POST /payments/bkash/initiate handled correctly (Status: ${bkashInitiate.status} - ${bkashInitiate.data?.message || 'Token grant flow'})`
    );

    // 3. SSLCommerz Gateway test (Should reject 400 cleanly when inactive or missing credentials as designed)
    const sslInitiate = await request('/payments/sslcommerz/initiate', {
      method: 'POST',
      body: { orderId: createdOrderId }
    });
    assert(
      sslInitiate.status === 400 || sslInitiate.status === 201,
      `POST /payments/sslcommerz/initiate handled correctly (Status: ${sslInitiate.status} - ${sslInitiate.data?.message || 'Session init flow'})`
    );
  } else {
    assert(false, 'Checkout flow test: No product found to test checkout with');
  }

  // --- Step 5: RBAC & Permission Boundaries ---
  console.log('\n--- Step 5: RBAC & Permission Boundaries ---');
  const custForbiddenAccess = await request('/business-settings', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: { general: { businessName: 'Hacked Store Name' } }
  });
  assert(custForbiddenAccess.status === 403, 'RBAC 403: Customer forbidden from mutating business settings');

  const custForbiddenPush = await request('/push-notifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${customerToken}` },
    body: { title: 'Spam', message: 'Spam message' }
  });
  assert(custForbiddenPush.status === 403, 'RBAC 403: Customer forbidden from broadcasting push notifications');

  console.log('\n================================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
