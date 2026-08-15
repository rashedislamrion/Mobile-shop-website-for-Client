"use client";

import { useEffect, useState } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { mockCategories, MockCategory } from "@/lib/mock-data/products/categories";
import { 
  ChevronRight, ChevronDown, GripVertical, Edit2, Plus, 
  Trash2, Smartphone, Monitor, Battery, Zap, Volume2, Camera, 
  Box, Layers, Headphones, Plug, Usb, BatteryCharging, Wrench, 
  PenTool, Thermometer, Microscope 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Simple icon map for rendering lucide icons by name string
const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-4 h-4" />,
  Monitor: <Monitor className="w-4 h-4" />,
  Battery: <Battery className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Volume2: <Volume2 className="w-4 h-4" />,
  Camera: <Camera className="w-4 h-4" />,
  Box: <Box className="w-4 h-4" />,
  Layers: <Layers className="w-4 h-4" />,
  Headphones: <Headphones className="w-4 h-4" />,
  Plug: <Plug className="w-4 h-4" />,
  Usb: <Usb className="w-4 h-4" />,
  BatteryCharging: <BatteryCharging className="w-4 h-4" />,
  Wrench: <Wrench className="w-4 h-4" />,
  PenTool: <PenTool className="w-4 h-4" />,
  Thermometer: <Thermometer className="w-4 h-4" />,
  Microscope: <Microscope className="w-4 h-4" />,
};

const iconNames = Object.keys(iconMap);

export default function CategoryPage() {
  const { setTitle, setBadge, setDateFilter } = useAdminPage();
  const [categories, setCategories] = useState<MockCategory[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<MockCategory | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["CAT-001"]));

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formStatus, setFormStatus] = useState<"Active"|"Inactive">("Active");
  const [formParentId, setFormParentId] = useState("");

  useEffect(() => {
    setTitle("Categories");
    setBadge("Website");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFormName(selectedCategory.name);
      setFormSlug(selectedCategory.slug);
      setFormIcon(selectedCategory.icon || "");
      setFormStatus(selectedCategory.status);
      setFormParentId(selectedCategory.parentId || "");
    }
  }, [selectedCategory]);

  const toggleNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    toast.success("Category saved successfully!");
  };

  const handleCreate = () => {
    setSelectedCategory({
      id: "NEW",
      name: "",
      slug: "",
      itemCount: 0,
      status: "Active",
      parentId: null,
    });
  };

  const flattenCategories = (cats: MockCategory[]): {id: string, name: string}[] => {
    let result: {id: string, name: string}[] = [];
    cats.forEach(c => {
      result.push({ id: c.id, name: c.name });
      if (c.children) {
        result = result.concat(flattenCategories(c.children));
      }
    });
    return result;
  };
  const flatCats = flattenCategories(categories);

  const renderTree = (nodes: MockCategory[], depth = 0) => {
    return (
      <div className="space-y-1">
        {nodes.map(node => {
          const isExpanded = expandedNodes.has(node.id);
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = selectedCategory?.id === node.id;

          return (
            <div key={node.id}>
              <div 
                onClick={() => setSelectedCategory(node)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50 border-emerald-200 border' : 'hover:bg-slate-50 border border-transparent'}`}
                style={{ paddingLeft: `${(depth * 1.5) + 0.5}rem` }}
              >
                <div className="flex items-center gap-2">
                  <div className="text-slate-400 cursor-move hover:text-slate-600">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  {hasChildren ? (
                    <button onClick={(e) => toggleNode(e, node.id)} className="w-5 h-5 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-5" /> // Spacer
                  )}

                  {node.icon && iconMap[node.icon] && (
                    <div className={`flex items-center justify-center w-6 h-6 rounded ${isSelected ? 'text-emerald-600 bg-emerald-100' : 'text-slate-500 bg-slate-100'}`}>
                      {iconMap[node.icon]}
                    </div>
                  )}

                  <span className={`font-medium text-sm ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {node.name}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">
                    {node.itemCount}
                  </span>
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedCategory(node); }} className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toast.error("Category deleted"); }} className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {hasChildren && isExpanded && (
                <div className="mt-1 relative">
                  {/* Tree line visual */}
                  <div className="absolute left-[1.375rem] top-0 bottom-0 w-px bg-slate-200" style={{ left: `${(depth * 1.5) + 1.875}rem` }} />
                  {renderTree(node.children!, depth + 1)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      
      {/* LEFT PANEL: Tree View */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">Category Structure</h3>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {renderTree(categories)}
        </div>
      </div>

      {/* RIGHT PANEL: Edit Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">
            {selectedCategory ? (selectedCategory.id === "NEW" ? "Create New Category" : `Edit Category: ${selectedCategory.name}`) : "Select a category to edit"}
          </h3>
        </div>
        
        {selectedCategory ? (
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Name *</label>
              <Input value={formName} onChange={e => {
                setFormName(e.target.value);
                if (selectedCategory.id === "NEW") {
                  setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                }
              }} placeholder="e.g. Mobile Parts" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
              <Input value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="mobile-parts" />
              <p className="text-xs text-slate-500 mt-1">URL friendly identifier.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
              <select 
                value={formParentId} 
                onChange={e => setFormParentId(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="">None (Top Level)</option>
                {flatCats.filter(c => c.id !== selectedCategory.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {iconNames.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormIcon(name)}
                    className={`w-10 h-10 rounded-md flex items-center justify-center transition-colors border ${formIcon === name ? 'bg-emerald-100 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                    title={name}
                  >
                    {iconMap[name]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formStatus === "Active"} onChange={() => setFormStatus("Active")} className="text-emerald-600 focus:ring-emerald-600" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formStatus === "Inactive"} onChange={() => setFormStatus("Inactive")} className="text-emerald-600 focus:ring-emerald-600" />
                  Inactive
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button onClick={handleSave} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm w-full">
                Save Category
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-slate-400">
            <Layers className="w-12 h-12 mb-3 opacity-20" />
            <p>Select a category from the tree to edit its details.</p>
          </div>
        )}
      </div>

    </div>
  );
}
