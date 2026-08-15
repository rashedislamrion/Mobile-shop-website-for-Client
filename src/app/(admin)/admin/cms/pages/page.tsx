'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, Lock } from 'lucide-react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { DataTable, StatusBadge } from '@/components/admin/DataTable';
import { FilterBar } from '@/components/admin/FilterBar';
import { mockPages, CmsPage } from '@/lib/mock-data/cms/pages';

export default function PagesManagementPage() {
  const { setPageInfo } = useAdminPage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  React.useEffect(() => {
    setPageInfo({
      title: 'Pages',
      breadcrumbs: [
        { label: 'CMS', href: '/admin/cms/pages' },
        { label: 'Pages', href: '/admin/cms/pages' }
      ]
    });
  }, [setPageInfo]);

  const filteredPages = mockPages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? page.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Page Title',
      accessor: (page: CmsPage) => (
        <span className="font-medium text-slate-900">{page.title}</span>
      )
    },
    {
      header: 'Slug',
      accessor: (page: CmsPage) => (
        <span className="text-slate-500 font-mono text-sm">{page.slug}</span>
      )
    },
    {
      header: 'Last Updated',
      accessor: (page: CmsPage) => (
        <span className="text-slate-500">
          {new Date(page.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (page: CmsPage) => <StatusBadge status={page.status} />
    },
    {
      header: 'Action',
      accessor: (page: CmsPage) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/cms/pages/${page.id}/edit`}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Link>
          <a
            href={page.slug}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View on Website"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          {page.isSystem ? (
            <button
              disabled
              className="p-1.5 text-slate-300 cursor-not-allowed rounded-lg"
              title="System page, cannot be deleted"
            >
              <Lock className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
              onClick={() => alert('Delete clicked for ' + page.title)}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
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
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Published', value: 'Published' },
                { label: 'Draft', value: 'Draft' }
              ],
              value: statusFilter,
              onChange: setStatusFilter
            }
          ]}
          onReset={() => {
            setSearchQuery('');
            setStatusFilter('');
          }}
          searchPlaceholder="Search page title..."
        />

        <Link
          href="/admin/cms/pages/create"
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Page</span>
        </Link>
      </div>

      <DataTable
        columns={columns}
        data={filteredPages}
        keyExtractor={(page) => page.id}
      />
    </div>
  );
}
