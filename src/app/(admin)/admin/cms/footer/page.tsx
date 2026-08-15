'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { mockFooterSettings } from '@/lib/mock-data/cms/footer-settings';
import { mockBranches } from '@/lib/mock-data/branches';
import { ExternalLink } from 'lucide-react';

export default function FooterManagementPage() {
  const { setPageInfo } = useAdminPage();
  const [settings, setSettings] = useState(mockFooterSettings);
  const [hasChanges, setHasChanges] = useState(false);

  React.useEffect(() => {
    setPageInfo({
      title: 'Footer Settings',
      breadcrumbs: [
        { label: 'CMS', href: '/admin/cms/pages' },
        { label: 'Footer', href: '/admin/cms/footer' }
      ]
    });
  }, [setPageInfo]);

  const handleChange = () => setHasChanges(true);

  const handleBranchVisibilityToggle = (branchId: string) => {
    setSettings(prev => {
      const isVisible = prev.visibleBranches.includes(branchId);
      const newVisible = isVisible 
        ? prev.visibleBranches.filter(id => id !== branchId)
        : [...prev.visibleBranches, branchId];
      return { ...prev, visibleBranches: newVisible };
    });
    handleChange();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT COLUMN */}
      <div className="flex-1 space-y-6">
        {/* Support Column Card */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Support Column Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.support.phoneNumber}
                onChange={(e) => {
                  setSettings({...settings, support: {...settings.support, phoneNumber: e.target.value}});
                  handleChange();
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={settings.support.email}
                onChange={(e) => {
                  setSettings({...settings, support: {...settings.support, email: e.target.value}});
                  handleChange();
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Live Chat Link</label>
              <input
                type="text"
                value={settings.support.liveChatLink}
                onChange={(e) => {
                  setSettings({...settings, support: {...settings.support, liveChatLink: e.target.value}});
                  handleChange();
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">FAQ Link</label>
              <input
                type="text"
                value={settings.support.faqLink}
                onChange={(e) => {
                  setSettings({...settings, support: {...settings.support, faqLink: e.target.value}});
                  handleChange();
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Link Columns Notice */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Footer Navigation Links</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-slate-600">
              The <strong>About Us</strong> and <strong>Quick Links</strong> columns in the footer are synced with the Menus module. 
              To edit the links that appear in these columns, please use the Menus management page.
            </p>
            <Link 
              href="/admin/cms/menus"
              className="inline-flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 hover:underline"
            >
              Go to Menus Management <ExternalLink className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>

        {/* Branches Column */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Branches Column</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-slate-600 mb-4">Select which active branches should appear in the storefront footer.</p>
            <div className="space-y-3">
              {mockBranches.filter(b => b.status === 'Active').map(branch => (
                <label key={branch.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:border-emerald-200 transition-colors">
                  <input 
                    type="checkbox"
                    checked={settings.visibleBranches.includes(branch.id)}
                    onChange={() => handleBranchVisibilityToggle(branch.id)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <h5 className="font-medium text-slate-900">{branch.name}</h5>
                    <p className="text-sm text-slate-500">{branch.address}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Copyright */}
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Copyright Text</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <input
              type="text"
              value={settings.copyrightText}
              onChange={(e) => {
                setSettings({...settings, copyrightText: e.target.value});
                handleChange();
              }}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <p className="text-sm text-slate-500 mt-2">Note: The <code>{'{year}'}</code> variable will automatically be replaced with the current year.</p>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-6">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                Save Settings
                {hasChanges && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <p className="text-sm text-slate-600">
                {hasChanges 
                  ? "You have unsaved changes. Remember to save before leaving this page." 
                  : "All footer settings are up to date."}
              </p>
              <button
                onClick={() => {
                  alert('Footer settings saved successfully!');
                  setHasChanges(false);
                }}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  hasChanges 
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                Save Footer Settings
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
