import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFooterSettingsDto } from './dto/footer-settings.dto';

@Injectable()
export class FooterSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.footerSettings.findFirst();
    if (!settings) {
      settings = await this.prisma.footerSettings.create({
        data: {
          supportPhone: '+880 1700-000000',
          supportEmail: 'support@novamobile.com',
          liveChatLink: 'https://wa.me/8801700000000',
          faqLink: '/faq',
          copyrightText: '© 2026 NovaMobile Ltd. All rights reserved.',
        },
      });
    }
    return settings;
  }

  async updateSettings(dto: UpdateFooterSettingsDto) {
    const existing = await this.prisma.footerSettings.findFirst();
    if (existing) {
      return this.prisma.footerSettings.update({
        where: { id: existing.id },
        data: {
          supportPhone: dto.supportPhone,
          supportEmail: dto.supportEmail,
          liveChatLink: dto.liveChatLink || null,
          faqLink: dto.faqLink || null,
          copyrightText: dto.copyrightText,
        },
      });
    }

    return this.prisma.footerSettings.create({
      data: {
        supportPhone: dto.supportPhone,
        supportEmail: dto.supportEmail,
        liveChatLink: dto.liveChatLink || null,
        faqLink: dto.faqLink || null,
        copyrightText: dto.copyrightText,
      },
    });
  }
}
