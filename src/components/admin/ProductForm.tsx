"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Plus, X, UploadCloud, ChevronDown, Check, Loader2, Image as ImageIcon 
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPost, apiPatch, getImageUrl } from "@/lib/api-client";

const formSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  variants: z.array(z.object({
    id: z.string().optional(),
    color: z.string().optional(),
    quality: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().min(0, "Stock must be positive"),
    sku: z.string().optional(),
  })),
  price: z.coerce.number().min(0, "Regular price must be non-negative"),
  salePrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().optional().nullable(),
  specifications: z.array(z.object({
    id: z.string().optional(),
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required"),
  })),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK"]),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export interface ExistingProductData {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  regularPrice: number | string;
  salePrice?: number | string | null;
  costPrice?: number | string | null;
  status: "DRAFT" | "ACTIVE" | "OUT_OF_STOCK";
  categoryId: string;
  brandId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  images?: Array<{ id: string; url: string; sortOrder?: number }>;
  variants?: Array<{ id?: string; color?: string | null; quality?: string | null; price: number | string; stock: number; sku?: string }>;
  specifications?: Array<{ id?: string; label: string; value: string }>;
}

interface ProductFormProps {
  initialData?: ExistingProductData | null;
  isEdit?: boolean;
  productId?: string;
}

export function ProductForm({ initialData, isEdit, productId }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Images state
  const [existingImages, setExistingImages] = useState<Array<{ id: string; url: string }>>(
    initialData?.images || []
  );
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);

  useEffect(() => {
    // Fetch categories and brands for dropdowns
    (async () => {
      try {
        const [cats, brs] = await Promise.all([
          apiGet<any[]>("/categories"),
          apiGet<any[]>("/brands"),
        ]);
        setCategories(cats || []);
        setBrands(brs || []);
      } catch (err) {
        console.error("Failed to load categories/brands", err);
      }
    })();
  }, []);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      shortDescription: initialData?.shortDescription || "",
      fullDescription: initialData?.description || "",
      variants: initialData?.variants?.map(v => ({
        id: v.id,
        color: v.color || "",
        quality: v.quality || "",
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        sku: v.sku || "",
      })) || [],
      price: Number(initialData?.regularPrice) || 0,
      salePrice: initialData?.salePrice ? Number(initialData.salePrice) : null,
      costPrice: initialData?.costPrice ? Number(initialData.costPrice) : null,
      specifications: initialData?.specifications?.map(s => ({
        id: s.id,
        label: s.label,
        value: s.value,
      })) || [],
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      metaKeywords: initialData?.metaKeywords || "",
      status: (initialData?.status as any) || "DRAFT",
      categoryId: initialData?.categoryId || "",
      brandId: initialData?.brandId || "",
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    name: "variants",
    control: form.control,
  });

  const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
    name: "specifications",
    control: form.control,
  });

  const watchPrice = form.watch("price");
  const watchSalePrice = form.watch("salePrice");
  const watchName = form.watch("name");

  // Auto-generate slug on typing name for new products
  useEffect(() => {
    if (!isEdit && watchName) {
      const generatedSlug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: false });
    }
  }, [watchName, isEdit, form]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeExistingImage = (id: string) => {
    setExistingImages(prev => prev.filter(img => img.id !== id));
    setRemovedImageIds(prev => [...prev, id]);
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", values.slug);
      if (values.shortDescription) formData.append("shortDescription", values.shortDescription);
      if (values.fullDescription) formData.append("description", values.fullDescription);
      formData.append("categoryId", values.categoryId);
      if (values.brandId) formData.append("brandId", values.brandId);
      formData.append("regularPrice", String(values.price));
      if (values.salePrice) formData.append("salePrice", String(values.salePrice));
      if (values.costPrice) formData.append("costPrice", String(values.costPrice));
      formData.append("status", values.status);
      if (values.metaTitle) formData.append("metaTitle", values.metaTitle);
      if (values.metaDescription) formData.append("metaDescription", values.metaDescription);
      if (values.metaKeywords) formData.append("metaKeywords", values.metaKeywords);

      // JSON fields
      if (values.variants && values.variants.length > 0) {
        formData.append("variants", JSON.stringify(values.variants));
      }
      if (values.specifications && values.specifications.length > 0) {
        formData.append("specifications", JSON.stringify(values.specifications));
      }

      if (removedImageIds.length > 0) {
        formData.append("removedImageIds", JSON.stringify(removedImageIds));
      }

      // Append image files
      newImageFiles.forEach((file) => {
        formData.append("images", file);
      });

      if (isEdit && productId) {
        await apiPatch(`/products/${productId}`, formData);
        toast.success(`Product "${values.name}" updated successfully!`);
      } else {
        await apiPost("/products", formData);
        toast.success(`Product "${values.name}" created successfully!`);
      }

      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row gap-6 relative items-start">
        
        {/* LEFT COLUMN: Main Form Sections */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Basic Information</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. iPhone 13 Pro Max Display" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="iphone-13-pro-max-display" {...field} />
                  </FormControl>
                  <FormDescription>The URL friendly identifier for this product.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="A brief summary of the product..." className="resize-none h-20" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fullDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Detailed product specifications, features, and info..." className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Media */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Product Images</h3>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Click or drag images here</p>
                  <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 5MB per file)</p>
                </div>
              </div>
            </div>

            {/* Display Existing & New Images */}
            {(existingImages.length > 0 || newImageFiles.length > 0) && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium text-slate-700">Image Gallery</p>
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={getImageUrl(img.url)} alt="Product" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => removeExistingImage(img.id)} 
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                        title="Delete image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {newImageFiles.map((file, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-emerald-300 bg-emerald-50">
                      <img src={URL.createObjectURL(file)} alt="New upload" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-emerald-600 text-white text-[9px] px-1 rounded font-medium">New</span>
                      <button 
                        type="button" 
                        onClick={() => removeNewImage(idx)} 
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800 text-lg">Variants & Options</h3>
                <p className="text-xs text-slate-500">Color, Quality, SKU, Price & Stock per variant</p>
              </div>
              <button 
                type="button" 
                onClick={() => appendVariant({ color: "", quality: "", price: watchPrice || 0, stock: 10, sku: "" })} 
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>

            {variantFields.length === 0 ? (
              <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <p className="text-slate-500 text-sm">No specific variants added. A default variant will be automatically assigned.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeVariant(index)} 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
                      <FormField
                        control={form.control}
                        name={`variants.${index}.color`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Color</FormLabel>
                            <FormControl><Input placeholder="e.g. Black" {...field} /></FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.quality`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Quality / Type</FormLabel>
                            <FormControl><Input placeholder="e.g. Original / OLED" {...field} /></FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.sku`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">SKU</FormLabel>
                            <FormControl><Input placeholder="Auto-generated if blank" {...field} /></FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Price (৳)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`variants.${index}.stock`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Stock</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage className="text-[10px]" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Regular Price (৳) *</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale Price (৳)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    <FormDescription>
                      {watchPrice && watchSalePrice && watchPrice > watchSalePrice && (
                        <span className="text-emerald-600 font-medium text-xs">
                          Saves ৳{(watchPrice - watchSalePrice).toLocaleString()} ({Math.round(((watchPrice - watchSalePrice) / watchPrice) * 100)}%)
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price (৳)</FormLabel>
                    <FormControl><Input type="number" {...field} value={field.value ?? ""} /></FormControl>
                    <FormDescription className="text-xs text-slate-400">Internal procurement cost</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-lg">Specifications</h3>
              <button 
                type="button" 
                onClick={() => appendSpec({ label: "", value: "" })} 
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Spec
              </button>
            </div>
            
            <div className="space-y-3">
              {specFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <FormField
                      control={form.control}
                      name={`specifications.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input placeholder="Label (e.g. Warranty)" {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`specifications.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl><Input placeholder="Value (e.g. 6 Months)" {...field} /></FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeSpec(index)} 
                    className="w-10 h-10 shrink-0 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <details className="group">
              <summary className="font-semibold text-slate-800 text-lg p-6 flex justify-between items-center cursor-pointer list-none">
                SEO Metadata (Optional)
                <span className="transition group-open:rotate-180">
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                </span>
              </summary>
              <div className="p-6 pt-0 border-t border-slate-100 space-y-4">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Title</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Description</FormLabel>
                      <FormControl><Textarea className="resize-none h-20" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaKeywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meta Keywords</FormLabel>
                      <FormControl><Input placeholder="iphone, display, screen..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </details>
          </div>

        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <div className="w-full lg:w-1/3 space-y-6 lg:sticky lg:top-6">
          
          {/* Publish Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Publish</h3>
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility Status</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active / Published</option>
                      <option value="OUT_OF_STOCK">Out of Stock</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {isEdit ? "Update Product" : "Save & Publish"}
              </button>
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={() => {
                  form.setValue("status", "DRAFT");
                  form.handleSubmit(onSubmit)();
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Organization</h3>
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
                    >
                      <option value="">None / Generic Brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        </div>

      </form>
    </Form>
  );
}
