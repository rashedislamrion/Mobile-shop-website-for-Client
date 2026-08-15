import Link from "next/link";
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { BlogWithMeta } from "@/lib/mock-data/blogs";

export function BlogCard({ blog }: { blog: BlogWithMeta }) {
  // Check if it's new (created in last 30 days) - for mock we'll just show it if view count < 1000 or randomly
  const isNew = blog.viewCount < 1000;

  return (
    <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <Link href={`/blog/${blog.slug}`} className="relative block aspect-[3/2] overflow-hidden bg-slate-100 w-full">
        {isNew && (
          <Badge className="absolute top-3 left-3 z-10 bg-info text-white border-none shadow-sm font-semibold">
            NEW
          </Badge>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={blog.coverImage || 'https://placehold.co/600x400/f1f5f9/94a3b8'} 
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-3">
          <span className="text-primary">{blog.author}</span>
          <span>•</span>
          <time dateTime={blog.createdAt}>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</time>
        </div>
        
        <Link href={`/blog/${blog.slug}`} className="block mb-2 flex-1">
          <h3 className="text-lg font-bold text-slate-800 leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {blog.excerpt}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <Link href={`/blog/${blog.slug}`} className="text-sm font-semibold text-primary hover:underline">
            Read More
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
            <Eye className="w-4 h-4" />
            <span>{blog.viewCount.toLocaleString()} Views</span>
          </div>
        </div>
      </div>
    </article>
  );
}
