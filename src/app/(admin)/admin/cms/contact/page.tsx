'use client';

import React, { useState } from 'react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { mockContactSubmissions, ContactSubmission } from '@/lib/mock-data/cms/contact-submissions';
import { Eye, Check, Trash2, X, Plus } from 'lucide-react';

export default function ContactManagementPage() {
  const { setPageInfo } = useAdminPage();
  const [hasChanges, setHasChanges] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  React.useEffect(() => {
    setPageInfo({
      title: 'Contact Us',
      breadcrumbs: [
        { label: 'CMS', href: '/admin/cms/pages' },
        { label: 'Contact Us', href: '/admin/cms/contact' }
      ]
    });
  }, [setPageInfo]);

  const handleChange = () => setHasChanges(true);

  const columns = [
    {
      header: 'Name & Email',
      accessor: (sub: ContactSubmission) => (
        <div>
          <div className="font-medium text-slate-900">{sub.name}</div>
          <div className="text-sm text-slate-500">{sub.email}</div>
        </div>
      )
    },
    {
      header: 'Subject',
      accessor: (sub: ContactSubmission) => (
        <span className="font-medium text-slate-700">{sub.subject}</span>
      )
    },
    {
      header: 'Message',
      accessor: (sub: ContactSubmission) => (
        <span className="text-slate-500 text-sm truncate max-w-xs block" title={sub.message}>
          {sub.message.length > 50 ? sub.message.substring(0, 50) + '...' : sub.message}
        </span>
      )
    },
    {
      header: 'Date',
      accessor: (sub: ContactSubmission) => (
        <span className="text-slate-500 text-sm">
          {new Date(sub.submittedAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (sub: ContactSubmission) => (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
          sub.status === 'New' ? 'bg-blue-100 text-blue-700' :
          sub.status === 'Replied' ? 'bg-emerald-100 text-emerald-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {sub.status}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: (sub: ContactSubmission) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedSubmission(sub)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Mark as Read"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* SETTINGS SECTION (Sticky Sidebar Pattern) */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-semibold text-slate-800">Contact Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Support Phone</label>
                  <input
                    type="text"
                    defaultValue="+880 1234 567890"
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                  <input
                    type="email"
                    defaultValue="support@novamobile.com"
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Office Address</label>
                <textarea
                  rows={2}
                  defaultValue="123 Tech Avenue, Dhaka, Bangladesh"
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Google Map Embed URL</label>
                <input
                  type="text"
                  defaultValue="https://www.google.com/maps/embed?pb=..."
                  onChange={handleChange}
                  placeholder="Paste the embed src URL here"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-sm"
                />
                <p className="text-xs text-slate-500 mt-1">Paste the `src` attribute from the Google Maps iframe embed code.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Office Hours</label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input type="text" defaultValue="Monday - Friday" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
                    <input type="text" defaultValue="10:00 AM - 8:00 PM" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
                    <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg border border-slate-200"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="text" defaultValue="Saturday - Sunday" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
                    <input type="text" defaultValue="Closed" className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none" />
                    <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg border border-slate-200"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <button className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-700">
                    <Plus className="w-4 h-4" /> Add Row
                  </button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Sticky Save */}
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
                    ? "You have unsaved changes to your contact page settings." 
                    : "All settings are up to date."}
                </p>
                <button
                  onClick={() => {
                    alert('Settings saved successfully!');
                    setHasChanges(false);
                  }}
                  className={`w-full py-2 rounded-lg font-medium transition-colors ${
                    hasChanges 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  Save Settings
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* SUBMISSIONS SECTION */}
      <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-semibold text-slate-800">Contact Form Submissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={mockContactSubmissions}
            keyExtractor={(sub) => sub.id}
          />
        </CardContent>
      </Card>

      {/* Details/Reply Dialog */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Message Details</h3>
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500 block mb-1">From</span>
                  <div className="font-medium text-slate-900">{selectedSubmission.name}</div>
                  <div className="text-slate-600">{selectedSubmission.email}</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Phone</span>
                  <div className="text-slate-900">{selectedSubmission.phone}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block mb-1">Date</span>
                  <div className="text-slate-900">{new Date(selectedSubmission.submittedAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">{selectedSubmission.subject}</h4>
                <p className="text-slate-700 whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Reply to Customer</label>
                <textarea
                  rows={4}
                  placeholder="Write your response here..."
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-y"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <button 
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  alert('Reply sent!');
                  setSelectedSubmission(null);
                }}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors font-medium"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
