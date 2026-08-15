"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAdminPage } from "@/contexts/AdminPageContext";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft, Image as ImageIcon, Eye, Bold, Italic, Link2, List, ImagePlus } from "lucide-react";
import { mockBlogs } from "@/lib/mock-data/blogs";
import { toast } from "sonner";
import Image from "next/image";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { setTitle, setBadge, setDateFilter } = useAdminPage();

  const blog = mockBlogs.find(b => b.id === params.id) || mockBlogs[0];

  const [formData, setFormData] = useState({
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    excerpt: blog.excerpt,
    metaTitle: blog.title,
    metaDescription: blog.excerpt,
    metaKeywords: "tips, guide, mobile",
    tags: "Tips, Repair",
    status: blog.status,
    scheduleDate: ""
  });

  const [imagePreview, setImagePreview] = useState(blog.coverImage);

  useEffect(() => {
    setTitle(`Edit: ${blog.title}`);
    setBadge("Marketing");
    setDateFilter(""); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blog]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    setFormData({ ...formData, title, slug });
  };

  const handleSave = () => {
    toast.success("Blog post updated successfully!");
    router.push("/admin/marketing/blogs");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-6xl mx-auto">
      
      {/* LEFT CONTENT */}
      <div className="flex-1 space-y-6">
        
        {/* Content Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Content</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Title *</label>
            <Input 
              placeholder="e.g. How to replace an iPhone battery" 
              value={formData.title}
              onChange={handleTitleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Slug *</label>
            <Input 
              placeholder="how-to-replace-iphone-battery" 
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Body Content *</label>
            <div className="border border-slate-200 rounded-lg overflow-hidden flex flex-col">
              {/* Dummy Rich Text Toolbar */}
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1">
                <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"><Bold className="w-4 h-4" /></button>
                <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"><Italic className="w-4 h-4" /></button>
                <div className="w-px h-5 bg-slate-300 mx-1" />
                <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"><Link2 className="w-4 h-4" /></button>
                <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"><ImagePlus className="w-4 h-4" /></button>
                <button className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"><List className="w-4 h-4" /></button>
              </div>
              <textarea 
                className="w-full min-h-[300px] p-4 text-sm bg-white outline-none resize-y"
                placeholder="Write your blog content here..."
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Excerpt Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Excerpt</h2>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex justify-between">
              Short Description
              <span className="text-xs font-normal text-slate-400">Used in blog cards</span>
            </label>
            <textarea 
              className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-shadow resize-y"
              placeholder="Brief summary of the post..."
              value={formData.excerpt}
              onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
            />
          </div>
        </div>

        {/* SEO & Tags Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">SEO & Discovery</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Meta Title</label>
            <Input 
              placeholder="SEO Title (defaults to blog title)" 
              value={formData.metaTitle}
              onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Meta Description</label>
            <textarea 
              className="w-full min-h-[80px] p-3 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-shadow resize-y"
              placeholder="SEO description..."
              value={formData.metaDescription}
              onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Related Category Tags (Comma separated)</label>
            <Input 
              placeholder="e.g. Repairs, Tips, Hardware" 
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>
        </div>

      </div>

      {/* RIGHT STICKY SIDEBAR */}
      <div className="w-full md:w-80 shrink-0 space-y-6">
        <div className="sticky top-24 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          
          <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Publish Settings</h2>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Status</label>
            <select 
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-md text-sm outline-none focus:border-emerald-500"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Draft">Draft</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          {formData.status === "Scheduled" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Publish Date</label>
              <Input 
                type="datetime-local"
                value={formData.scheduleDate}
                onChange={e => setFormData({ ...formData, scheduleDate: e.target.value })}
              />
            </div>
          )}

          <div className="space-y-2 pt-2">
            <label className="text-sm font-semibold text-slate-700">Featured Image</label>
            {imagePreview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 group">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => setImagePreview("")}
                    className="px-3 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-medium hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 font-medium">Upload Image</span>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Post
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-emerald-600 text-emerald-600 font-medium rounded-lg transition-colors text-sm hover:bg-emerald-50">
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button 
                onClick={() => router.back()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
