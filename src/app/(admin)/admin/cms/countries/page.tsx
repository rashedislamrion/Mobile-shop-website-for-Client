'use client';

import React, { useState } from 'react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { mockCountries, Country } from '@/lib/mock-data/cms/countries';

export default function CountriesManagementPage() {
  const { setPageInfo } = useAdminPage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  React.useEffect(() => {
    setPageInfo({
      title: 'Country List',
      breadcrumbs: [
        { label: 'CMS', href: '/admin/cms/pages' },
        { label: 'Countries', href: '/admin/cms/countries' }
      ]
    });
  }, [setPageInfo]);

  const filteredCountries = mockCountries.filter(country => 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: 'Country Name',
      accessor: (country: Country) => (
        <span className="font-medium text-slate-900">{country.name}</span>
      )
    },
    {
      header: 'Country Code',
      accessor: (country: Country) => (
        <span className="text-slate-500 font-mono text-sm">{country.code}</span>
      )
    },
    {
      header: 'Currency',
      accessor: (country: Country) => (
        <span className="text-slate-600">{country.currency}</span>
      )
    },
    {
      header: 'Status',
      accessor: (country: Country) => <StatusBadge status={country.status} />
    },
    {
      header: 'Action',
      accessor: (country: Country) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <FilterBar
          onSearch={setSearchQuery}
          onReset={() => setSearchQuery('')}
          searchPlaceholder="Search country..."
        />

        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Country</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filteredCountries}
        keyExtractor={(country) => country.id}
      />

      {/* Add/Edit Country Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Add Country</h3>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                  <option value="">Select a country...</option>
                  <option value="BD">Bangladesh</option>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="IN">India</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                <input
                  type="text"
                  placeholder="e.g. BDT - ৳"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
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
                Save Country
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
