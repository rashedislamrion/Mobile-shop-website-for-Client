export interface BusinessSettings {
  general: {
    businessName: string;
    businessType: string;
    tradeLicenseNo: string;
    businessPhone: string;
    businessEmail: string;
    businessAddress: string;
  };
  branding: {
    logoLightUrl: string;
    logoDarkUrl: string;
    faviconUrl: string;
    primaryBrandColor: string;
    siteTagline: string;
  };
  currencyAndTax: {
    defaultCurrency: string;
    currencyPosition: 'Before' | 'After';
    taxRatePercentage: number;
    pricesIncludeTax: boolean;
  };
  orderSettings: {
    minimumOrderAmount: number;
    defaultOrderStatus: string;
    autoCancelUnpaidHours: number;
    allowGuestCheckout: boolean;
    enableCashOnDelivery: boolean;
  };
  notifications: {
    orderPlaced: { email: boolean; sms: boolean };
    orderConfirmed: { email: boolean; sms: boolean };
    orderShipped: { email: boolean; sms: boolean };
    orderDelivered: { email: boolean; sms: boolean };
    orderCancelled: { email: boolean; sms: boolean };
  };
}

export const mockBusinessSettings: BusinessSettings = {
  general: {
    businessName: 'NovaMobile',
    businessType: 'Mobile Phone & Accessories Retail',
    tradeLicenseNo: 'TRAD-12345678',
    businessPhone: '+880 1234 567890',
    businessEmail: 'contact@novamobile.com',
    businessAddress: '123 Tech Avenue, Dhaka, Bangladesh',
  },
  branding: {
    logoLightUrl: 'https://placehold.co/200x60/f1f5f9/94a3b8?text=Logo+Light',
    logoDarkUrl: 'https://placehold.co/200x60/1e293b/94a3b8?text=Logo+Dark',
    faviconUrl: 'https://placehold.co/32x32/10b981/ffffff?text=N',
    primaryBrandColor: '#10b981', // emerald-500
    siteTagline: 'Your Trusted Mobile Partner',
  },
  currencyAndTax: {
    defaultCurrency: 'BDT - ৳',
    currencyPosition: 'After',
    taxRatePercentage: 15,
    pricesIncludeTax: false,
  },
  orderSettings: {
    minimumOrderAmount: 500,
    defaultOrderStatus: 'Pending',
    autoCancelUnpaidHours: 24,
    allowGuestCheckout: true,
    enableCashOnDelivery: true,
  },
  notifications: {
    orderPlaced: { email: true, sms: false },
    orderConfirmed: { email: true, sms: true },
    orderShipped: { email: true, sms: true },
    orderDelivered: { email: true, sms: true },
    orderCancelled: { email: true, sms: true },
  },
};
