"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Plus, X, UploadCloud, ChevronDown, GripVertical, Check 
} from "lucide-react";
import Image from "next/image";

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

const formSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one image is required"),
  variants: z.array(z.object({
    color: z.string().min(1, "Color is required"),
    quality: z.string().min(1, "Quality is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().min(0, "Stock must be positive"),
    sku: z.string().min(1, "SKU is required"),
  })),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().optional(),
  costPrice: z.coerce.number().optional(),
  specifications: z.array(z.object({
    label: z.string().min(1, "Label is required"),
    value: z.string().min(1, "Value is required"),
  })),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  status: z.enum(["Draft", "Active"]),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  initialData?: ProductFormValues | null;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      images: [],
      variants: [],
      price: 0,
      salePrice: undefined,
      costPrice: undefined,
      specifications: [],
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      status: "Draft",
      category: "",
      brand: "",
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

  // Auto-generate slug from name if empty
  useEffect(() => {
    if (!isEdit && watchName) {
      const generatedSlug = watchName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: false });
    }
  }, [watchName, isEdit, form]);

  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      form.setValue("images", updatedImages, { shouldValidate: true });
    }
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
    form.setValue("images", updated, { shouldValidate: true });
  };

  const onSubmit = (data: ProductFormValues) => {
    console.log("Saving product...", data);
    toast.success(`Product ${isEdit ? "updated" : "created"} successfully!`);
    router.push("/admin/products");
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
            <h3 className="font-semibold text-slate-800 text-lg mb-4">Media</h3>
            
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative cursor-pointer">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700">Click or drag images here</p>
                  <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 5MB)</p>
                </div>
              </div>
            </div>
            
            {form.formState.errors.images && (
              <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.images.message}</p>
            )}

            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-slate-700 mb-3 text-left">Uploaded Images</p>
                <div className="flex flex-wrap gap-4">
                  {images.map((src, idx) => (
                    <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 cursor-move">
                      <Image src={src} alt="Uploaded" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <GripVertical className="text-white w-5 h-5 absolute left-1 top-1/2 -translate-y-1/2" />
                        <button type="button" onClick={() => removeImage(idx)} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-3 text-left italic">Hint: You would drag images to reorder them.</p>
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-lg">Variants</h3>
              <button type="button" onClick={() => appendVariant({ color: "", quality: "", price: 0, stock: 0, sku: "" })} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-md transition-colors">
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>

            {variantFields.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                <p className="text-slate-500 text-sm">No variants added. This product has no selectable options.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                    <button type="button" onClick={() => removeVariant(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shadow-sm">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
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
                            <FormLabel className="text-xs">Quality</FormLabel>
                            <FormControl><Input placeholder="e.g. OEM" {...field} /></FormControl>
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
                            <FormControl><Input placeholder="SKU" {...field} /></FormControl>
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
                    <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
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
                    <FormControl><Input type="number" {...field} value={field.value || ""} /></FormControl>
                    <FormDescription className="text-xs text-slate-400">Internal use only</FormDescription>
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
              <button type="button" onClick={() => appendSpec({ label: "", value: "" })} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-md transition-colors">
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
                  <button type="button" onClick={() => removeSpec(index)} className="w-10 h-10 shrink-0 bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg flex items-center justify-center transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO (Accordion Style) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <details className="group">
              <summary className="font-semibold text-slate-800 text-lg p-6 flex justify-between items-center cursor-pointer list-none">
                SEO Data (Optional)
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

        {/* RIGHT COLUMN: Sticky Publish sidebar */}
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
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Active">Active / Published</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-2">
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                <Check className="w-4 h-4" /> {isEdit ? "Update Product" : "Save Product"}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  form.setValue("status", "Draft");
                  form.handleSubmit(onSubmit)();
                }}
                className="w-full flex items-center justify-center px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Save as Draft
              </button>
            </div>
          </div>

          {/* Category Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 border-b border-slate-100 pb-3">Organization</h3>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    >
                      <option value="">Select Category</option>
                      <option value="Display">Display</option>
                      <option value="Battery">Battery</option>
                      <option value="Charging Logic">Charging Logic</option>
                      <option value="Speaker">Speaker</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center mb-1">
                    <FormLabel>Brand *</FormLabel>
                    <button type="button" onClick={() => toast.info("Add brand dialog opens")} className="text-emerald-600 hover:underline text-[10px] font-semibold uppercase tracking-wider">
                      + Add New
                    </button>
                  </div>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full h-10 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    >
                      <option value="">Select Brand</option>
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Realme">Realme</option>
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
