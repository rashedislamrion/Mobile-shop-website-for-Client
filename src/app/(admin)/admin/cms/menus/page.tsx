'use client';

import React, { useState, useEffect } from 'react';
import { useAdminPage } from '@/contexts/AdminPageContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, GripVertical, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { mockMenus, Menu, MenuItem } from '@/lib/mock-data/cms/menus';

export default function MenusManagementPage() {
  const { setPageInfo } = useAdminPage();
  const [selectedMenuId, setSelectedMenuId] = useState<string>(mockMenus[0].id);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    setPageInfo({
      title: 'Menus',
      breadcrumbs: [
        { label: 'CMS', href: '/admin/cms/pages' },
        { label: 'Menus', href: '/admin/cms/menus' }
      ]
    });
  }, [setPageInfo]);

  useEffect(() => {
    const menu = mockMenus.find(m => m.id === selectedMenuId);
    if (menu) {
      setMenuItems([...menu.items].sort((a, b) => a.position - b.position));
      setEditingItem(null);
    }
  }, [selectedMenuId]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...menuItems];
    if (direction === 'up' && index > 0) {
      // Swap positions
      const tempPos = newItems[index].position;
      newItems[index].position = newItems[index - 1].position;
      newItems[index - 1].position = tempPos;
      
      // Swap array elements
      const temp = newItems[index];
      newItems[index] = newItems[index - 1];
      newItems[index - 1] = temp;
    } else if (direction === 'down' && index < newItems.length - 1) {
      // Swap positions
      const tempPos = newItems[index].position;
      newItems[index].position = newItems[index + 1].position;
      newItems[index + 1].position = tempPos;
      
      // Swap array elements
      const temp = newItems[index];
      newItems[index] = newItems[index + 1];
      newItems[index + 1] = temp;
    }
    setMenuItems([...newItems].sort((a, b) => a.position - b.position));
  };

  const handleAddNew = () => {
    setEditingItem({
      id: 'new',
      label: '',
      linkType: 'Custom URL',
      linkTarget: '',
      openInNewTab: false,
      status: 'Active',
      position: menuItems.length + 1
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT PANEL: Menu Selector and List */}
      <div className="flex-1 space-y-6">
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Select Menu</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Menu to Edit</label>
              <select 
                value={selectedMenuId}
                onChange={(e) => setSelectedMenuId(e.target.value)}
                className="w-full md:w-1/2 px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {mockMenus.map(menu => (
                  <option key={menu.id} value={menu.id}>{menu.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm group hover:border-emerald-200 transition-colors">
                  <div className="flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === menuItems.length - 1}
                      className="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="cursor-grab text-slate-400">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{item.label}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 truncate max-w-sm">
                      {item.linkType}: {item.linkTarget}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      item.status === 'Active' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.status}
                    </span>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditingItem({...item})}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleAddNew}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Menu Item
            </button>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL: Editor Form */}
      {editingItem && (
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="sticky top-6">
            <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">
                  {editingItem.id === 'new' ? 'Add Item' : 'Edit Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Label</label>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({...editingItem, label: e.target.value})}
                    placeholder="e.g. Smart Watches"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Link Type</label>
                  <div className="space-y-2">
                    {['Category', 'Product', 'Custom Page', 'Custom URL'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="linkType" 
                          value={type}
                          checked={editingItem.linkType === type}
                          onChange={(e) => setEditingItem({...editingItem, linkType: e.target.value as any, linkTarget: ''})}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-slate-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link Target</label>
                  {editingItem.linkType === 'Custom URL' ? (
                    <input
                      type="text"
                      value={editingItem.linkTarget}
                      onChange={(e) => setEditingItem({...editingItem, linkTarget: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  ) : (
                    <select 
                      value={editingItem.linkTarget}
                      onChange={(e) => setEditingItem({...editingItem, linkTarget: e.target.value})}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="">Select {editingItem.linkType}...</option>
                      <option value="/demo-target-1">Demo Target 1</option>
                      <option value="/demo-target-2">Demo Target 2</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="openInNewTab"
                    checked={editingItem.openInNewTab}
                    onChange={(e) => setEditingItem({...editingItem, openInNewTab: e.target.checked})}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="openInNewTab" className="text-sm text-slate-700 cursor-pointer">Open in new tab</label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium text-slate-700">Status</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={editingItem.status === 'Active'}
                      onChange={(e) => setEditingItem({...editingItem, status: e.target.checked ? 'Active' : 'Inactive'})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      alert('Saved item: ' + editingItem.label);
                      setEditingItem(null);
                    }}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Save Item
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
