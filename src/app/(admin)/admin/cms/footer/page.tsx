"use client";

import React, { useState, useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { apiGet, apiPatch } from "@/lib/api-client";

export default function FooterManagementPage() {
  const { setTitle, setBadge } = useAdminPage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  const [form, setForm] = useState({
    supportPhone: "",
    supportEmail: "",
    liveChatUrl: "",
    faqUrl: "",
    aboutText: "",
    copyrightText: "",
    newsletterEnabled: true,
    newsletterTitle: "Subscribe for VIP Discounts",
    newsletterSubtitle: "Get weekly updates on genuine stock arrivals & repair tips.",
    visibleBranchIds: [] as string[],
  });

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const [settings, branchList] = await Promise.all([
        apiGet<any>("/footer-settings").catch(() => null),
        apiGet<any[]>("/branches/public").catch(() => []),
      ]);
      if (settings) {
        setForm({
          supportPhone: settings.supportPhone || "",
          supportEmail: settings.supportEmail || "",
          liveChatUrl: settings.liveChatUrl || "",
          faqUrl: settings.faqUrl || "",
          aboutText: settings.aboutText || "",
          copyrightText: settings.copyrightText || "",
          newsletterEnabled: settings.newsletterEnabled ?? true,
          newsletterTitle: settings.newsletterTitle || "",
          newsletterSubtitle: settings.newsletterSubtitle || "",
          visibleBranchIds: settings.visibleBranchIds || [],
        });
      }
      setBranches(branchList || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load footer settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Footer Settings");
    setBadge("CMS");
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBranchToggle = (id: string) => {
    setForm((prev) => {
      const exists = prev.visibleBranchIds.includes(id);
      return {
        ...prev,
        visibleBranchIds: exists
          ? prev.visibleBranchIds.filter((bId) => bId !== id)
          : [...prev.visibleBranchIds, id],
      };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiPatch("/footer-settings", form);
      toast.success("Footer configuration saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update footer settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading footer settings...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800">Global Storefront Footer</h2>
          <p className="text-xs text-slate-500">Configure hotline, copyright, about description, and newsletter</p>
        </div>
        <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="flex items-center gap-1.5"><Save className="w-4 h-4" /> Save Changes</span>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Hotline & Contacts */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Support Contacts</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Customer Care Hotline</Label>
              <Input
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                placeholder="+880 1700-000000"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Support Email</Label>
              <Input
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                placeholder="support@novamobile.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Live Chat URL</Label>
                <Input
                  value={form.liveChatUrl}
                  onChange={(e) => setForm({ ...form, liveChatUrl: e.target.value })}
                  placeholder="/contact"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">FAQ Page URL</Label>
                <Input
                  value={form.faqUrl}
                  onChange={(e) => setForm({ ...form, faqUrl: e.target.value })}
                  placeholder="/about"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Brand & Copyright */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Brand Info & Copyright</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Store Short Description</Label>
              <Textarea
                value={form.aboutText}
                onChange={(e) => setForm({ ...form, aboutText: e.target.value })}
                rows={3}
                placeholder="Bangladesh's leading platform for genuine smartphone displays..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Copyright Strip Text</Label>
              <Input
                value={form.copyrightText}
                onChange={(e) => setForm({ ...form, copyrightText: e.target.value })}
                placeholder="© 2026 NovaMobile Ltd. All rights reserved."
              />
            </div>
          </CardContent>
        </Card>

        {/* Newsletter Banner */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Newsletter Subscription Box</CardTitle>
            <Switch
              checked={form.newsletterEnabled}
              onCheckedChange={(val) => setForm({ ...form, newsletterEnabled: val })}
            />
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Banner Heading</Label>
              <Input
                value={form.newsletterTitle}
                onChange={(e) => setForm({ ...form, newsletterTitle: e.target.value })}
                placeholder="Subscribe for VIP Discounts"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Banner Subtitle</Label>
              <Input
                value={form.newsletterSubtitle}
                onChange={(e) => setForm({ ...form, newsletterSubtitle: e.target.value })}
                placeholder="Get weekly updates on genuine stock arrivals & repair tips."
              />
            </div>
          </CardContent>
        </Card>

        {/* Visible Outlets */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800">Branches Displayed in Footer</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {branches.length === 0 ? (
              <p className="text-xs text-slate-400">No active branches found.</p>
            ) : (
              branches.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{b.name}</h4>
                    <p className="text-xs text-slate-500">{b.address}</p>
                  </div>
                  <Switch
                    checked={form.visibleBranchIds.includes(b.id)}
                    onCheckedChange={() => handleBranchToggle(b.id)}
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
