"use client";

import React, { useState, useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api-client";

export default function BusinessSettingsPage() {
  const { setTitle, setBadge } = useAdminPage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<any>({
    general: {
      businessName: "NovaMobile",
      businessType: "Mobile Phone & Accessories Retail",
      tradeLicenseNo: "TR-2026-DH-09182",
      businessPhone: "+880 1700-000000",
      businessEmail: "contact@novamobile.com",
      address: "Bashundhara City Complex, Dhaka",
    },
    branding: {
      primaryColor: "#10b981",
      logoUrl: "",
      faviconUrl: "",
    },
    currencyTax: {
      currency: "BDT",
      currencySymbol: "৳",
      taxRate: 0,
    },
    orderSettings: {
      minOrderAmount: 100,
      freeShippingThreshold: 5000,
      defaultDeliveryCharge: 60,
      expressDeliveryCharge: 120,
    },
    notifications: {
      emailOnNewOrder: true,
      smsOnDispatch: true,
    },
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<any>("/business-settings");
      if (data) {
        setSettings({
          general: { ...settings.general, ...(data.general || {}) },
          branding: { ...settings.branding, ...(data.branding || {}) },
          currencyTax: { ...settings.currencyTax, ...(data.currencyTax || {}) },
          orderSettings: { ...settings.orderSettings, ...(data.orderSettings || {}) },
          notifications: { ...settings.notifications, ...(data.notifications || {}) },
        });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load business settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Business Settings");
    setBadge("General");
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiPatch("/business-settings", settings);
      toast.success("Business settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update business settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading business configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Global Business Configuration</h2>
          <p className="text-xs text-slate-500">Store identity, legal info, currencies, and default fees</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Save All Settings</span>}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg w-full justify-start h-auto flex-wrap mb-4">
          <TabsTrigger value="general" className="rounded-md px-4 py-2 text-xs font-bold">General Info</TabsTrigger>
          <TabsTrigger value="branding" className="rounded-md px-4 py-2 text-xs font-bold">Branding</TabsTrigger>
          <TabsTrigger value="currency" className="rounded-md px-4 py-2 text-xs font-bold">Currency & Tax</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-md px-4 py-2 text-xs font-bold">Order & Shipping Rates</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-md px-4 py-2 text-xs font-bold">Alert Preferences</TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="mt-0">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Business Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Business / Store Name</Label>
                <Input
                  value={settings.general.businessName || ""}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, businessName: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Business Type</Label>
                <Input
                  value={settings.general.businessType || ""}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, businessType: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Trade License / Reg No.</Label>
                <Input
                  value={settings.general.tradeLicenseNo || ""}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, tradeLicenseNo: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Official Phone</Label>
                <Input
                  value={settings.general.businessPhone || ""}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, businessPhone: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Official Email</Label>
                <Input
                  value={settings.general.businessEmail || ""}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, businessEmail: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Registered Address</Label>
                <Input
                  value={settings.general.address || ""}
                  onChange={(e) => setSettings({ ...settings, general: { ...settings.general, address: e.target.value } })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRANDING TAB */}
        <TabsContent value="branding" className="mt-0">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Visual Identity</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1.5 max-w-sm">
                <Label className="text-xs font-bold text-slate-700">Primary Theme Color</Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={settings.branding.primaryColor || "#10b981"}
                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                    className="w-10 h-10 rounded border cursor-pointer p-0.5"
                  />
                  <Input
                    value={settings.branding.primaryColor || "#10b981"}
                    onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Logo Image URL</Label>
                <Input
                  value={settings.branding.logoUrl || ""}
                  onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, logoUrl: e.target.value } })}
                  placeholder="/uploads/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CURRENCY TAB */}
        <TabsContent value="currency" className="mt-0">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Currency & Taxation</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Currency Code</Label>
                <Input
                  value={settings.currencyTax.currency || "BDT"}
                  onChange={(e) => setSettings({ ...settings, currencyTax: { ...settings.currencyTax, currency: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Currency Symbol</Label>
                <Input
                  value={settings.currencyTax.currencySymbol || "৳"}
                  onChange={(e) => setSettings({ ...settings, currencyTax: { ...settings.currencyTax, currencySymbol: e.target.value } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">VAT / Tax Rate (%)</Label>
                <Input
                  type="number"
                  value={settings.currencyTax.taxRate || 0}
                  onChange={(e) => setSettings({ ...settings, currencyTax: { ...settings.currencyTax, taxRate: Number(e.target.value) } })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDER & SHIPPING TAB */}
        <TabsContent value="orders" className="mt-0">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Delivery Charges & Minimums</CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Minimum Order Value (৳)</Label>
                <Input
                  type="number"
                  value={settings.orderSettings.minOrderAmount || 100}
                  onChange={(e) => setSettings({ ...settings, orderSettings: { ...settings.orderSettings, minOrderAmount: Number(e.target.value) } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Free Shipping Threshold (৳)</Label>
                <Input
                  type="number"
                  value={settings.orderSettings.freeShippingThreshold || 5000}
                  onChange={(e) => setSettings({ ...settings, orderSettings: { ...settings.orderSettings, freeShippingThreshold: Number(e.target.value) } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Standard Delivery Charge (৳)</Label>
                <Input
                  type="number"
                  value={settings.orderSettings.defaultDeliveryCharge || 60}
                  onChange={(e) => setSettings({ ...settings, orderSettings: { ...settings.orderSettings, defaultDeliveryCharge: Number(e.target.value) } })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Express Delivery Charge (৳)</Label>
                <Input
                  type="number"
                  value={settings.orderSettings.expressDeliveryCharge || 120}
                  onChange={(e) => setSettings({ ...settings, orderSettings: { ...settings.orderSettings, expressDeliveryCharge: Number(e.target.value) } })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications" className="mt-0">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">Automated Alerts</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">Email Notification on New Orders</h4>
                  <p className="text-xs text-slate-500">Send an instant alert to admin email when a customer places an order</p>
                </div>
                <Switch
                  checked={settings.notifications.emailOnNewOrder || false}
                  onCheckedChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, emailOnNewOrder: val } })}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                <div>
                  <h4 className="font-bold text-sm text-slate-800">SMS Notification to Customer on Courier Dispatch</h4>
                  <p className="text-xs text-slate-500">Send parcel tracking number via SMS once booked with courier</p>
                </div>
                <Switch
                  checked={settings.notifications.smsOnDispatch || false}
                  onCheckedChange={(val) => setSettings({ ...settings, notifications: { ...settings.notifications, smsOnDispatch: val } })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
