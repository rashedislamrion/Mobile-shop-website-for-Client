"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { apiGet, apiPost, apiPatch, apiDelete, getImageUrl } from "@/lib/api-client";
import { 
  ChevronRight, ChevronDown, GripVertical, Edit2, Plus, 
  Trash2, Smartphone, Monitor, Battery, Zap, Volume2, Camera, 
  Box, Layers, Headphones, Plug, Usb, BatteryCharging, Wrench, 
  PenTool, Thermometer, Microscope, Upload, Loader2, Image as ImageIcon
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon?: string | null;
  image?: string | null;
  status: "ACTIVE" | "INACTIVE";
  _count?: { products: number; children?: number };
  children?: CategoryNode[];
}

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
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [allCategoriesFlat, setAllCategoriesFlat] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formStatus, setFormStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");
  const [formParentId, setFormParentId] = useState("");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [treeData, flatData] = await Promise.all([
        apiGet<CategoryNode[]>("/categories/tree"),
        apiGet<CategoryNode[]>("/categories"),
      ]);
      setCategories(treeData || []);
      setAllCategoriesFlat(flatData || []);
      
      // Auto expand root level nodes
      if (treeData && treeData.length > 0) {
        setExpandedNodes(new Set(treeData.map(n => n.id)));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTitle("Categories");
    setBadge("Website");
    setDateFilter("");
    fetchCategories();
  }, [setTitle, setBadge, setDateFilter, fetchCategories]);

  useEffect(() => {
    if (selectedCategory) {
      setFormName(selectedCategory.name);
      setFormSlug(selectedCategory.slug);
      setFormIcon(selectedCategory.icon || "");
      setFormStatus(selectedCategory.status || "ACTIVE");
      setFormParentId(selectedCategory.parentId || "");
      setExistingImageUrl(selectedCategory.image || null);
      setFormImageFile(null);
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

  const handleCreate = () => {
    setSelectedCategory({
      id: "NEW",
      name: "",
      slug: "",
      status: "ACTIVE",
      parentId: null,
      children: [],
    });
    setFormName("");
    setFormSlug("");
    setFormIcon("");
    setFormStatus("ACTIVE");
    setFormParentId("");
    setExistingImageUrl(null);
    setFormImageFile(null);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", formName.trim());
      if (formSlug.trim()) formData.append("slug", formSlug.trim());
      if (formParentId) formData.append("parentId", formParentId);
      if (formIcon) formData.append("icon", formIcon);
      formData.append("status", formStatus);
      if (formImageFile) {
        formData.append("image", formImageFile);
      }

      if (selectedCategory?.id === "NEW") {
        const created = await apiPost<CategoryNode>("/categories", formData);
        toast.success(`Category "${created.name}" created successfully!`);
      } else if (selectedCategory) {
        const updated = await apiPatch<CategoryNode>(`/categories/${selectedCategory.id}`, formData);
        toast.success(`Category "${updated.name}" updated successfully!`);
      }

      await fetchCategories();
      setSelectedCategory(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: CategoryNode) => {
    if (!confirm(`Are you sure you want to delete category "${category.name}"?`)) return;

    try {
      await apiDelete(`/categories/${category.id}`);
      toast.success(`Category "${category.name}" deleted`);
      if (selectedCategory?.id === category.id) {
        setSelectedCategory(null);
      }
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  const renderTree = (nodes: CategoryNode[], depth = 0) => {
    return (
      <div className="space-y-1">
        {nodes.map(node => {
          const isExpanded = expandedNodes.has(node.id);
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = selectedCategory?.id === node.id;
          const count = node._count?.products ?? 0;

          return (
            <div key={node.id}>
              <div 
                onClick={() => setSelectedCategory(node)}
                className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50 border-emerald-200 border' : 'hover:bg-slate-50 border border-transparent'}`}
                style={{ paddingLeft: `${(depth * 1.5) + 0.5}rem` }}
              >
                <div className="flex items-center gap-2">
                  <div className="text-slate-400">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  
                  {hasChildren ? (
                    <button onClick={(e) => toggleNode(e, node.id)} className="w-5 h-5 flex items-center justify-center text-slate-500 hover:bg-slate-200 rounded">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}

                  {node.image ? (
                    <img 
                      src={getImageUrl(node.image)} 
                      alt={node.name} 
                      className="w-6 h-6 object-cover rounded" 
                    />
                  ) : node.icon && iconMap[node.icon] ? (
                    <div className={`flex items-center justify-center w-6 h-6 rounded ${isSelected ? 'text-emerald-600 bg-emerald-100' : 'text-slate-500 bg-slate-100'}`}>
                      {iconMap[node.icon]}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <span className={`font-medium text-sm ${isSelected ? 'text-emerald-800' : 'text-slate-700'}`}>
                    {node.name}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium ml-1">
                    {count} items
                  </span>
                  {node.status === "INACTIVE" && (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium ml-1">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedCategory(node); }} 
                    className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(node); }} 
                    className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {hasChildren && isExpanded && (
                <div className="mt-1 relative">
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
          <div>
            <h3 className="font-semibold text-slate-800">Category Structure</h3>
            <p className="text-xs text-slate-500">Live database catalog hierarchy</p>
          </div>
          <button onClick={handleCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition-colors text-xs">
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="space-y-3 p-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-[90%] ml-6" />
              <Skeleton className="h-9 w-[80%] ml-6" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-[85%] ml-6" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
              <Layers className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No categories found. Click Add Category to create one.</p>
            </div>
          ) : (
            renderTree(categories)
          )}
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
              <Input 
                value={formName} 
                onChange={e => {
                  setFormName(e.target.value);
                  if (selectedCategory.id === "NEW") {
                    setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                  }
                }} 
                placeholder="e.g. Mobile Displays" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
              <Input value={formSlug} onChange={e => setFormSlug(e.target.value)} placeholder="mobile-displays" />
              <p className="text-xs text-slate-500 mt-1">Unique URL identifier.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
              <select 
                value={formParentId} 
                onChange={e => setFormParentId(e.target.value)}
                className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              >
                <option value="">None (Top Level Category)</option>
                {allCategoriesFlat
                  .filter(c => c.id !== selectedCategory.id)
                  .map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category Image / Banner</label>
              <div className="flex items-center gap-4">
                {existingImageUrl && !formImageFile && (
                  <img
                    src={getImageUrl(existingImageUrl)}
                    alt="Category"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                  />
                )}
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 text-sm text-slate-600">
                  <Upload className="w-4 h-4 text-slate-400" />
                  <span>{formImageFile ? formImageFile.name : "Upload Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormImageFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                {formImageFile && (
                  <button
                    type="button"
                    onClick={() => setFormImageFile(null)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category Icon</label>
              <div className="grid grid-cols-8 gap-2">
                {iconNames.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormIcon(formIcon === name ? "" : name)}
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
                  <input type="radio" checked={formStatus === "ACTIVE"} onChange={() => setFormStatus("ACTIVE")} className="text-emerald-600 focus:ring-emerald-600" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={formStatus === "INACTIVE"} onChange={() => setFormStatus("INACTIVE")} className="text-emerald-600 focus:ring-emerald-600" />
                  Inactive
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button 
                type="button"
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {selectedCategory.id === "NEW" ? "Create Category" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-slate-400">
            <Layers className="w-12 h-12 mb-3 opacity-20" />
            <p>Select a category from the tree to view or edit details.</p>
          </div>
        )}
      </div>

    </div>
  );
}
