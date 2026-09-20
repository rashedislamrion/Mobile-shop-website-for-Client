export const mockBranches = [
  { id: 'b1', name: 'Dhaka Main Branch' },
  { id: 'b2', name: 'Chattogram Branch' },
  { id: 'b3', name: 'Sylhet Branch' },
  { id: 'b4', name: 'Rajshahi Branch' },
];

export const mockThirdPartyConfig = {
  payment: {
    bkash: {
      enabled: true,
      mode: 'sandbox',
      appKey: 'mock_bkash_app_key_123',
      appSecret: 'mock_bkash_secret_456',
      username: 'bkash_test_user',
      password: 'bkash_password',
      title: 'bKash'
    },
    sslcommerz: {
      enabled: false,
      mode: 'test',
      storeId: 'testbox',
      storePassword: 'testpassword@123',
      baseUrl: 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
      currency: 'BDT',
      title: 'SSLCommerz'
    },
    cod: {
      enabled: true,
      title: 'Cash on Delivery',
      availability: 'all', // 'all' or 'selected'
      branches: ['b1', 'b2'], // mock selected branches
      extraCharge: '0',
      maxOrderAmount: ''
    }
  },
  sms: {
    enabled: true,
    provider: 'BulkSMSBD', // 'BulkSMSBD', 'SSL Wireless', 'Custom API'
    apiKey: 'mock_sms_api_key_8899',
    senderId: 'MOBILEHUBBD',
    apiSecret: 'mock_sms_secret_abc',
    customUrl: '',
    templates: [
      { id: 1, event: 'Order Placed', template: 'Your order {{order_id}} has been placed.' },
      { id: 2, event: 'Order Confirmed', template: 'Your order {{order_id}} is confirmed.' },
      { id: 3, event: 'Order Delivered', template: 'Your order {{order_id}} is delivered.' },
      { id: 4, event: 'OTP Verification', template: 'Your OTP is {{otp}}.' }
    ]
  },
  mail: {
    enabled: true,
    driver: 'smtp', // 'smtp' or 'sendmail'
    host: 'smtp.mailtrap.io',
    port: '2525',
    username: 'mock_smtp_user',
    password: 'mock_smtp_password',
    encryption: 'tls', // 'tls', 'ssl', 'none'
    fromName: 'MobileHubBD ERP',
    fromEmail: 'noreply@mobilehubbd.com',
    templates: [
      { id: 1, event: 'Order Confirmation', template: '<h1>Order Confirmed</h1><p>...</p>' },
      { id: 2, event: 'Password Reset', template: '<h1>Reset Password</h1><p>...</p>' },
      { id: 3, event: 'Welcome Email', template: '<h1>Welcome</h1><p>...</p>' },
      { id: 4, event: 'Invoice', template: '<h1>Invoice</h1><p>...</p>' }
    ]
  },
  firebase: {
    enabled: true,
    projectId: 'mobilehubbd-erp-mock',
    serverKey: 'mock_firebase_server_key_778899',
    senderId: '9876543210',
    configFileName: ''
  },
  recaptcha: {
    enabled: true,
    version: 'v2', // 'v2' or 'v3'
    minScore: 0.5,
    siteKey: 'mock_recaptcha_site_key',
    secretKey: 'mock_recaptcha_secret_key',
    appliesTo: {
      login: true,
      registration: true,
      contact: false,
      ticket: true
    }
  }
};
