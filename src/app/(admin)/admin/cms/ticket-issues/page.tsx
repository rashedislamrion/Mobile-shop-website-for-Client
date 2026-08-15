'use client';

import React, { useState } from 'react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { mockTicketIssueTypes, TicketIssueType } from '@/lib/mock-data/cms/ticket-issue-types';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function TicketIssuesManagementPage() {
  const { setPageInfo } = useAdminPage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  React.useEffect(() => {
    setPageInfo({
      title: 'Ticket Issue Types',
      breadcrumbs: [
        { label: 'CMS', href: '/admin/cms/pages' },
        { label: 'Ticket Issue Types', href: '/admin/cms/ticket-issues' }
      ]
    });
  }, [setPageInfo]);

  const filteredIssues = mockTicketIssueTypes.filter(issue => {
    const matchesSearch = issue.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? issue.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      header: 'Issue Type Name',
      accessor: (issue: TicketIssueType) => (
        <span className="font-medium text-slate-900">{issue.name}</span>
      )
    },
    {
      header: 'Category',
      accessor: (issue: TicketIssueType) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
          {issue.category}
        </span>
      )
    },
    {
      header: 'Auto-Assign To',
      accessor: (issue: TicketIssueType) => (
        <span className="text-slate-600">{issue.autoAssignTo}</span>
      )
    },
    {
      header: 'Ticket Count',
      accessor: (issue: TicketIssueType) => (
        <span className="text-slate-400 font-medium">{issue.ticketCount}</span>
      )
    },
    {
      header: 'Status',
      accessor: (issue: TicketIssueType) => <StatusBadge status={issue.status} />
    },
    {
      header: 'Action',
      accessor: (issue: TicketIssueType) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            disabled={issue.ticketCount > 0}
            className={`p-1.5 rounded-lg transition-colors ${
              issue.ticketCount > 0 
                ? 'text-slate-300 cursor-not-allowed' 
                : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
            }`}
            title={issue.ticketCount > 0 ? "Cannot delete: Tickets exist for this issue type" : "Delete"}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <FilterBar
          onSearch={setSearchQuery}
          filters={[
            {
              key: 'category',
              label: 'Category',
              options: [
                { label: 'Product Issue', value: 'Product Issue' },
                { label: 'Order Issue', value: 'Order Issue' },
                { label: 'Payment Issue', value: 'Payment Issue' },
                { label: 'Other', value: 'Other' },
              ],
              value: categoryFilter,
              onChange: setCategoryFilter
            }
          ]}
          onReset={() => {
            setSearchQuery('');
            setCategoryFilter('');
          }}
          searchPlaceholder="Search issue types..."
        />

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Issue Type</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredIssues}
        keyExtractor={(issue) => issue.id}
      />

      {/* Add/Edit Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Add Issue Type</h3>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Broken Display"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">Select category...</option>
                  <option value="Product Issue">Product Issue</option>
                  <option value="Order Issue">Order Issue</option>
                  <option value="Payment Issue">Payment Issue</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Auto-Assign To</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">Select department/role...</option>
                  <option value="Technician">Technician</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Accounts">Accounts</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Tickets of this type will automatically be assigned here.</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors font-medium"
              >
                Save Issue Type
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
