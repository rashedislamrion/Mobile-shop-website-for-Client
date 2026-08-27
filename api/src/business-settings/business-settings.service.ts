import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBusinessSettingsDto } from './dto/business-settings.dto';

const defaultSettings = {
  general: {
    companyName: 'NovaMobile Bangladesh',
    email: 'contact@novamobile.com',
    phone: '+880 1700-000000',
    address: 'Level 4, Bashundhara City Shopping Complex, Panthapath, Dhaka',
    timeZone: 'Asia/Dhaka',
    currency: 'BDT',
    currencySymbol: '৳',
  },
  branding: {
    primaryColor: '#10B981',
    logoUrl: '/images/logo.png',
    faviconUrl: '/favicon.ico',
  },
  currencyTax: {
    currencyCode: 'BDT',
    currencySymbol: '৳',
    symbolPosition: 'LEFT',
    taxPercentage: 0,
  },
  orderSettings: {
    allowGuestCheckout: true,
    freeDeliveryThreshold: 5000,
    standardDeliveryCharge: 60,
    expressDeliveryCharge: 120,
    minOrderAmount: 100,
  },
  notifications: {
    orderConfirmationEmail: true,
    orderStatusSms: true,
    promotionalPush: true,
  },
};

@Injectable()
export class BusinessSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.businessSetting.findFirst();
    if (!settings) {
      settings = await this.prisma.businessSetting.create({
        data: {
          general: defaultSettings.general,
          branding: defaultSettings.branding,
          currencyTax: defaultSettings.currencyTax,
          orderSettings: defaultSettings.orderSettings,
          notifications: defaultSettings.notifications,
        },
      });
    }
    return settings;
  }

  async updateSettings(dto: UpdateBusinessSettingsDto) {
    const existing = await this.getSettings();

    return this.prisma.businessSetting.update({
      where: { id: existing.id },
      data: {
        general: dto.general !== undefined ? (dto.general as any) : (existing.general as any),
        branding: dto.branding !== undefined ? (dto.branding as any) : (existing.branding as any),
        currencyTax: dto.currencyTax !== undefined ? (dto.currencyTax as any) : (existing.currencyTax as any),
        orderSettings: dto.orderSettings !== undefined ? (dto.orderSettings as any) : (existing.orderSettings as any),
        notifications: dto.notifications !== undefined ? (dto.notifications as any) : (existing.notifications as any),
      },
    });
  }
}
