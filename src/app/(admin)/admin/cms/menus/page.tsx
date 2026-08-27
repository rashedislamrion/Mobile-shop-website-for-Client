"use client";

import React, { useState, useEffect } from "react";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";

export interface MenuItemRecord {
  id: string;
  menuType: "HEADER" | "FOOTER_QUICK_LINKS" | "FOOTER_CATEGORIES" | "FOOTER_SUPPORT";
  label: string;
  linkType: "CUSTOM" | "CATEGORY" | "PAGE";
  linkValue: string;
  openInNewTab: boolean;
  position: number;
  status: "ACTIVE" | "INACTIVE";
}

export default function MenusManagementPage() {
  const { setTitle, setBadge } = useAdminPage();
  const [menuType, setMenuType] = useState<string>("HEADER");
  const [items, setItems] = useState<MenuItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formItem, setFormItem] = useState({
    id: "",
    label: "",
    linkType: "CUSTOM" as "CUSTOM" | "CATEGORY" | "PAGE",
    linkValue: "",
    openInNewTab: false,
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<MenuItemRecord[]>(`/menus?type=${menuType}`);
      setItems(data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load menus");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTitle("Menus");
    setBadge("CMS");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuType]);

  const handleMove = async (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;
    setItems(newItems);

    try {
      await apiPatch("/menus/reorder", { itemIds: newItems.map((i) => i.id) });
      toast.success("Menu order updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu order");
      fetchMenuItems();
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formItem.label.trim() || !formItem.linkValue.trim()) {
      toast.error("Label and link target are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (formItem.id) {
        await apiPatch(`/menus/${formItem.id}`, {
          label: formItem.label.trim(),
          linkType: formItem.linkType,
          linkValue: formItem.linkValue.trim(),
          openInNewTab: formItem.openInNewTab,
          status: formItem.status,
        });
        toast.success("Menu item updated");
      } else {
        await apiPost("/menus", {
          menuType,
          label: formItem.label.trim(),
          linkType: formItem.linkType,
          linkValue: formItem.linkValue.trim(),
          openInNewTab: formItem.openInNewTab,
          status: formItem.status,
        });
        toast.success("Menu item added");
      }

      setFormItem({
        id: "",
        label: "",
        linkType: "CUSTOM",
        linkValue: "",
        openInNewTab: false,
        status: "ACTIVE",
      });
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await apiDelete(`/menus/${id}`);
      toast.success("Menu item deleted");
      fetchMenuItems();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* LEFT PANEL: Menu List */}
      <div className="flex-1 space-y-4">
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-800">Menu Navigation Items</CardTitle>
            <div className="w-48">
              <Select value={menuType} onValueChange={setMenuType}>
                <SelectTrigger className="h-9 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HEADER">Header Main Nav</SelectItem>
                  <SelectItem value="FOOTER_QUICK_LINKS">Footer Quick Links</SelectItem>
                  <SelectItem value="FOOTER_CATEGORIES">Footer Categories</SelectItem>
                  <SelectItem value="FOOTER_SUPPORT">Footer Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-xl p-6">
                <p className="text-sm font-semibold text-slate-600">No items configured in this menu</p>
                <p className="text-xs text-slate-400 mt-1">Use the panel on the right to add links.</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-white border rounded-xl shadow-sm hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMove(index, "down")}
                        disabled={index === items.length - 1}
                        className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.label}</span>
                        {item.openInNewTab && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                            New Tab
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{item.linkValue}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormItem({
                        id: item.id,
                        label: item.label,
                        linkType: item.linkType,
                        linkValue: item.linkValue,
                        openInNewTab: item.openInNewTab,
                        status: item.status,
                      })}
                      className="text-xs text-emerald-600"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-400 hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT PANEL: Add/Edit Item */}
      <div className="w-full lg:w-96">
        <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b pb-4">
            <CardTitle className="text-base font-bold text-slate-800">
              {formItem.id ? "Edit Menu Link" : "Add Menu Link"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Display Label *</Label>
                <Input
                  placeholder="e.g. AMOLED Displays"
                  value={formItem.label}
                  onChange={(e) => setFormItem({ ...formItem, label: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Link Destination URL *</Label>
                <Input
                  placeholder="e.g. /category/displays or https://..."
                  value={formItem.linkValue}
                  onChange={(e) => setFormItem({ ...formItem, linkValue: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="text-xs font-semibold text-slate-700">Open in New Tab</Label>
                <Switch
                  checked={formItem.openInNewTab}
                  onCheckedChange={(val) => setFormItem({ ...formItem, openInNewTab: val })}
                />
              </div>

              <div className="pt-3 flex gap-2">
                {formItem.id && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormItem({
                      id: "",
                      label: "",
                      linkType: "CUSTOM",
                      linkValue: "",
                      openInNewTab: false,
                      status: "ACTIVE",
                    })}
                    className="flex-1 text-xs"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : formItem.id ? "Update Item" : "Add Link"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
