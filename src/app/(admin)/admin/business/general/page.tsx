'use client';

import React, { useState } from 'react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockBusinessSettings, BusinessSettings } from '@/lib/mock-data/business-settings';
import { UploadCloud } from 'lucide-react';

export default function BusinessSettingsPage() {
  const { setPageInfo } = useAdminPage();
  const [settings, setSettings] = useState<BusinessSettings>(mockBusinessSettings);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setPageInfo({
      title: 'Business Settings',
      breadcrumbs: [
        { label: 'Business Settings', href: '/admin/business/general' },
        { label: 'General', href: '/admin/business/general' }
      ]
    });
  }, [setPageInfo]);

  const handleChange = () => setHasChanges(true);

  // Simplified color swatches
  const colorSwatches = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Slate', value: '#64748b' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT COLUMN: Main Tabs */}
      <div className="flex-1 space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-lg w-full justify-start h-auto flex-wrap mb-6">
            <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2">General</TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2">Branding</TabsTrigger>
            <TabsTrigger value="currency-tax" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2">Currency & Tax</TabsTrigger>
            <TabsTrigger value="order" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2">Order Settings</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md px-4 py-2">Notifications</TabsTrigger>
          </TabsList>

          {/* GENERAL TAB */}
          <TabsContent value="general" className="mt-0">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">General Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    value={settings.general.businessName}
                    onChange={(e) => { setSettings({...settings, general: {...settings.general, businessName: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
                  <select
                    value={settings.general.businessType}
                    onChange={(e) => { setSettings({...settings, general: {...settings.general, businessType: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Mobile Phone & Accessories Retail">Mobile Phone & Accessories Retail</option>
                    <option value="Electronics Repair">Electronics Repair</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Trade License No.</label>
                  <input
                    type="text"
                    value={settings.general.tradeLicenseNo}
                    onChange={(e) => { setSettings({...settings, general: {...settings.general, tradeLicenseNo: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Phone</label>
                  <input
                    type="text"
                    value={settings.general.businessPhone}
                    onChange={(e) => { setSettings({...settings, general: {...settings.general, businessPhone: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Email</label>
                  <input
                    type="email"
                    value={settings.general.businessEmail}
                    onChange={(e) => { setSettings({...settings, general: {...settings.general, businessEmail: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                  <textarea
                    rows={3}
                    value={settings.general.businessAddress}
                    onChange={(e) => { setSettings({...settings, general: {...settings.general, businessAddress: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BRANDING TAB */}
          <TabsContent value="branding" className="mt-0">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Brand Assets & Identity</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Logo (Light Theme)</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 group hover:border-emerald-400 transition-colors cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.branding.logoLightUrl} alt="Light Logo" className="h-12 object-contain mb-4" />
                      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                        <UploadCloud className="w-4 h-4" /> Change Image
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Logo (Dark Theme)</label>
                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900 group hover:border-emerald-400 transition-colors cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.branding.logoDarkUrl} alt="Dark Logo" className="h-12 object-contain mb-4" />
                      <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                        <UploadCloud className="w-4 h-4" /> Change Image
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Favicon</label>
                    <div className="flex items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={settings.branding.faviconUrl} alt="Favicon" className="w-12 h-12 rounded border border-slate-200" />
                      <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        Upload New
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">Primary Brand Color</label>
                    <div className="flex flex-wrap gap-3">
                      {colorSwatches.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => { setSettings({...settings, branding: {...settings.branding, primaryBrandColor: color.value}}); handleChange(); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ${
                            settings.branding.primaryBrandColor === color.value ? 'ring-emerald-500 scale-110' : 'ring-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Site Tagline</label>
                  <input
                    type="text"
                    value={settings.branding.siteTagline}
                    onChange={(e) => { setSettings({...settings, branding: {...settings.branding, siteTagline: e.target.value}}); handleChange(); }}
                    className="w-full md:w-1/2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* CURRENCY & TAX TAB */}
          <TabsContent value="currency-tax" className="mt-0">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Currency & Tax Rules</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Default Currency</label>
                  <select
                    value={settings.currencyAndTax.defaultCurrency}
                    onChange={(e) => { setSettings({...settings, currencyAndTax: {...settings.currencyAndTax, defaultCurrency: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="BDT - ৳">Bangladeshi Taka (BDT - ৳)</option>
                    <option value="USD - $">US Dollar (USD - $)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Currency Symbol Position</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="currencyPosition" value="Before"
                        checked={settings.currencyAndTax.currencyPosition === 'Before'}
                        onChange={(e) => { setSettings({...settings, currencyAndTax: {...settings.currencyAndTax, currencyPosition: 'Before'}}); handleChange(); }}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700">Before Amount (e.g. ৳500)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="currencyPosition" value="After"
                        checked={settings.currencyAndTax.currencyPosition === 'After'}
                        onChange={(e) => { setSettings({...settings, currencyAndTax: {...settings.currencyAndTax, currencyPosition: 'After'}}); handleChange(); }}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700">After Amount (e.g. 500৳)</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tax/VAT Rate (%)</label>
                  <input
                    type="number"
                    value={settings.currencyAndTax.taxRatePercentage}
                    onChange={(e) => { setSettings({...settings, currencyAndTax: {...settings.currencyAndTax, taxRatePercentage: Number(e.target.value)}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer mt-5">
                    <input 
                      type="checkbox"
                      checked={settings.currencyAndTax.pricesIncludeTax}
                      onChange={(e) => { setSettings({...settings, currencyAndTax: {...settings.currencyAndTax, pricesIncludeTax: e.target.checked}}); handleChange(); }}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Store prices already include Tax/VAT</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ORDER SETTINGS TAB */}
          <TabsContent value="order" className="mt-0">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Checkout & Order Defaults</CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Order Amount</label>
                  <input
                    type="number"
                    value={settings.orderSettings.minimumOrderAmount}
                    onChange={(e) => { setSettings({...settings, orderSettings: {...settings.orderSettings, minimumOrderAmount: Number(e.target.value)}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Default Status For New Orders</label>
                  <select
                    value={settings.orderSettings.defaultOrderStatus}
                    onChange={(e) => { setSettings({...settings, orderSettings: {...settings.orderSettings, defaultOrderStatus: e.target.value}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Auto-cancel Unpaid Orders After (Hours)</label>
                  <input
                    type="number"
                    value={settings.orderSettings.autoCancelUnpaidHours}
                    onChange={(e) => { setSettings({...settings, orderSettings: {...settings.orderSettings, autoCancelUnpaidHours: Number(e.target.value)}}); handleChange(); }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between max-w-md">
                    <span className="text-sm font-medium text-slate-700">Allow Guest Checkout</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" className="sr-only peer" 
                        checked={settings.orderSettings.allowGuestCheckout}
                        onChange={(e) => { setSettings({...settings, orderSettings: {...settings.orderSettings, allowGuestCheckout: e.target.checked}}); handleChange(); }}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between max-w-md">
                    <span className="text-sm font-medium text-slate-700">Enable Cash on Delivery (COD)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" className="sr-only peer" 
                        checked={settings.orderSettings.enableCashOnDelivery}
                        onChange={(e) => { setSettings({...settings, orderSettings: {...settings.orderSettings, enableCashOnDelivery: e.target.checked}}); handleChange(); }}
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="mt-0">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Customer Notifications</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="min-w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Event</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Send Email</th>
                        <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Send SMS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { key: 'orderPlaced', label: 'Order Placed (Pending)' },
                        { key: 'orderConfirmed', label: 'Order Confirmed' },
                        { key: 'orderShipped', label: 'Order Shipped' },
                        { key: 'orderDelivered', label: 'Order Delivered' },
                        { key: 'orderCancelled', label: 'Order Cancelled' },
                      ].map((row) => (
                        <tr key={row.key} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-sm font-medium text-slate-900">{row.label}</td>
                          <td className="py-4 px-6">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" className="sr-only peer" 
                                checked={(settings.notifications as any)[row.key].email}
                                onChange={(e) => { 
                                  const key = row.key as keyof BusinessSettings['notifications'];
                                  setSettings({...settings, notifications: {...settings.notifications, [key]: {...settings.notifications[key], email: e.target.checked}}}); 
                                  handleChange(); 
                                }}
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </td>
                          <td className="py-4 px-6">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" className="sr-only peer" 
                                checked={(settings.notifications as any)[row.key].sms}
                                onChange={(e) => { 
                                  const key = row.key as keyof BusinessSettings['notifications'];
                                  setSettings({...settings, notifications: {...settings.notifications, [key]: {...settings.notifications[key], sms: e.target.checked}}}); 
                                  handleChange(); 
                                }}
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT COLUMN: Sticky Save */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-6">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                Save Changes
                {hasChanges && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-slate-600">
                {hasChanges 
                  ? "You have unsaved changes across your settings tabs." 
                  : "All business settings are up to date."}
              </p>
              <button
                onClick={() => {
                  alert('Business settings saved successfully!');
                  setHasChanges(false);
                }}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  hasChanges 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Save All Settings
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
