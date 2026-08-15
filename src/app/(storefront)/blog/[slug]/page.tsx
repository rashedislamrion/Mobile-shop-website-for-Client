import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, User, Eye, ArrowLeft } from "lucide-react";
import { mockBlogs } from "@/lib/mock-data/blogs";
import { BlogCard } from "@/components/storefront/BlogCard";
import { Button } from "@/components/ui/button";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = mockBlogs.find((b) => b.slug === params.slug);

  if (!blog) {
    notFound();
  }

  // Get 3 random related blogs (excluding current)
  const relatedBlogs = mockBlogs.filter(b => b.id !== blog.id).slice(0, 3);

  // Generate extended mock content for the post body since mock data just has "Full content goes here..."
  const extendedContent = `
    <p>Replacing a mobile component is often seen as a challenging task, but with the right guidance, it becomes much simpler. In this guide, we will break down exactly what you need to know.</p>
    
    <h2>The Importance of Quality Parts</h2>
    <p>Using genuine or high-quality OEM parts ensures that your device retains its original performance and longevity. When you compromise on quality, you might face issues like:</p>
    <ul>
      <li>Reduced battery efficiency or dangerous overheating.</li>
      <li>Touchscreen unresponsiveness or color washing out.</li>
      <li>Loss of water resistance (IP rating) due to poor adhesives.</li>
    </ul>

    <h2>Step-by-Step Approach</h2>
    <p>Always start by turning off the device and removing the SIM tray. Use proper heating tools to soften the adhesive before prying open the back cover or display. It is critical to use plastic pry tools to avoid damaging the internal ribbon cables.</p>

    <blockquote>"A successful repair is 80% preparation and 20% execution." - NovaMobile Expert Technician</blockquote>

    <h2>Conclusion</h2>
    <p>Remember that patience is key. If you ever feel stuck, it is better to consult a professional rather than forcing a component and causing permanent damage to the motherboard.</p>
  `;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button asChild variant="ghost" className="mb-6 -ml-4 text-slate-500 hover:text-slate-900">
        <Link href="/blog">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Blogs
        </Link>
      </Button>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>By {blog.author}</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <time dateTime={blog.createdAt}>{format(new Date(blog.createdAt), 'MMM dd, yyyy')}</time>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{blog.viewCount.toLocaleString()} views</span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-sm border border-slate-100 bg-slate-50">
          <Image 
            src={blog.coverImage || "https://placehold.co/600x400/f1f5f9/94a3b8?text=Blog+Image"} 
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg prose-slate max-w-3xl mx-auto prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: extendedContent }}
        />
      </article>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <div className="max-w-5xl mx-auto mt-24 pt-12 border-t border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Related Articles</h2>
            <Link href="/blog" className="text-primary font-semibold text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBlogs.map(rb => (
              <BlogCard key={rb.id} blog={rb} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
