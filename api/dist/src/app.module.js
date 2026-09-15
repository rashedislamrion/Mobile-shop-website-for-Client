"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./auth/auth.module");
const category_module_1 = require("./category/category.module");
const brand_module_1 = require("./brand/brand.module");
const series_module_1 = require("./series/series.module");
const unit_module_1 = require("./unit/unit.module");
const attribute_module_1 = require("./attribute/attribute.module");
const product_module_1 = require("./product/product.module");
const branch_module_1 = require("./branch/branch.module");
const order_module_1 = require("./order/order.module");
const service_job_module_1 = require("./service-job/service-job.module");
const shipment_module_1 = require("./shipment/shipment.module");
const sales_return_module_1 = require("./sales-return/sales-return.module");
const exchange_module_1 = require("./exchange/exchange.module");
const department_module_1 = require("./department/department.module");
const employee_module_1 = require("./employee/employee.module");
const role_module_1 = require("./role/role.module");
const payroll_module_1 = require("./payroll/payroll.module");
const wallet_module_1 = require("./wallet/wallet.module");
const expense_module_1 = require("./expense/expense.module");
const supplier_module_1 = require("./supplier/supplier.module");
const purchase_order_module_1 = require("./purchase-order/purchase-order.module");
const report_module_1 = require("./report/report.module");
const banner_module_1 = require("./banner/banner.module");
const ad_module_1 = require("./ad/ad.module");
const promo_code_module_1 = require("./promo-code/promo-code.module");
const push_notification_module_1 = require("./push-notification/push-notification.module");
const blog_module_1 = require("./blog/blog.module");
const page_module_1 = require("./page/page.module");
const menu_module_1 = require("./menu/menu.module");
const footer_settings_module_1 = require("./footer-settings/footer-settings.module");
const country_module_1 = require("./country/country.module");
const social_link_module_1 = require("./social-link/social-link.module");
const contact_submission_module_1 = require("./contact-submission/contact-submission.module");
const ticket_issue_type_module_1 = require("./ticket-issue-type/ticket-issue-type.module");
const support_ticket_module_1 = require("./support-ticket/support-ticket.module");
const help_note_module_1 = require("./help-note/help-note.module");
const business_settings_module_1 = require("./business-settings/business-settings.module");
const currency_module_1 = require("./currency/currency.module");
const delivery_charge_module_1 = require("./delivery-charge/delivery-charge.module");
const third_party_config_module_1 = require("./third-party-config/third-party-config.module");
const payment_module_1 = require("./payment/payment.module");
const stock_adjustment_module_1 = require("./stock-adjustment/stock-adjustment.module");
const wasted_product_module_1 = require("./wasted-product/wasted-product.module");
const customer_module_1 = require("./customer/customer.module");
const pos_module_1 = require("./pos/pos.module");
const phone_unit_module_1 = require("./phone-unit/phone-unit.module");
const service_lookup_module_1 = require("./service-lookup/service-lookup.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const jwt_auth_guard_1 = require("./auth/guards/jwt-auth.guard");
const permissions_guard_1 = require("./auth/guards/permissions.guard");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            category_module_1.CategoryModule,
            brand_module_1.BrandModule,
            series_module_1.SeriesModule,
            unit_module_1.UnitModule,
            attribute_module_1.AttributeModule,
            product_module_1.ProductModule,
            branch_module_1.BranchModule,
            order_module_1.OrderModule,
            service_job_module_1.ServiceJobModule,
            shipment_module_1.ShipmentModule,
            sales_return_module_1.SalesReturnModule,
            exchange_module_1.ExchangeModule,
            department_module_1.DepartmentModule,
            employee_module_1.EmployeeModule,
            role_module_1.RoleModule,
            payroll_module_1.PayrollModule,
            wallet_module_1.WalletModule,
            expense_module_1.ExpenseModule,
            supplier_module_1.SupplierModule,
            purchase_order_module_1.PurchaseOrderModule,
            report_module_1.ReportModule,
            banner_module_1.BannerModule,
            ad_module_1.AdModule,
            promo_code_module_1.PromoCodeModule,
            push_notification_module_1.PushNotificationModule,
            blog_module_1.BlogModule,
            page_module_1.PageModule,
            menu_module_1.MenuModule,
            footer_settings_module_1.FooterSettingsModule,
            country_module_1.CountryModule,
            social_link_module_1.SocialLinkModule,
            contact_submission_module_1.ContactSubmissionModule,
            ticket_issue_type_module_1.TicketIssueTypeModule,
            support_ticket_module_1.SupportTicketModule,
            help_note_module_1.HelpNoteModule,
            business_settings_module_1.BusinessSettingsModule,
            currency_module_1.CurrencyModule,
            delivery_charge_module_1.DeliveryChargeModule,
            third_party_config_module_1.ThirdPartyConfigModule,
            payment_module_1.PaymentModule,
            stock_adjustment_module_1.StockAdjustmentModule,
            wasted_product_module_1.WastedProductModule,
            customer_module_1.CustomerModule,
            pos_module_1.PosModule,
            phone_unit_module_1.PhoneUnitModule,
            service_lookup_module_1.ServiceLookupModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: permissions_guard_1.PermissionsGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map