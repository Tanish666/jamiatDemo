import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import ShareButton from "../../../components/ShareButton";

// Revalidate once every 60 seconds (adjust based on how often blogs change)
const REVALIDATE_TIME = 60;

async function getBlog(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
    next: { revalidate: REVALIDATE_TIME },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);
  if (!blog) return { title: "Blog not found" };

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || "Read this blog post on our site.",
    openGraph: {
      title: blog.ogTitle || blog.metaTitle || blog.title,
      description: blog.ogDescription || blog.metaDescription,
      images: blog.ogImage ? [blog.ogImage] : [],
    },
  };
}

export default async function BlogDetail({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Blog Post Not Found</h2>
        <p className="text-gray-500 mb-8">The post you're looking for might have been moved or deleted.</p>
        <Link 
          href="/blogs" 
          className="bg-emerald-600 text-white px-6 py-2 rounded-full font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blogs
        </Link>
      </div>
    );
  }

  // ✅ YouTube Renderer
  const renderYoutube = () => {
    if (!blog.youtubeUrl) return null;

    if (blog.youtubeUrl.includes("<iframe")) {
      return (
        <div
          className="w-full mt-12 mb-8 rounded-2xl overflow-hidden shadow-2xl"
          dangerouslySetInnerHTML={{ __html: blog.youtubeUrl }}
        />
      );
    }

    let embedUrl = blog.youtubeUrl;
    if (embedUrl.includes("watch?v=")) {
      embedUrl = embedUrl.replace("watch?v=", "embed/");
    } else if (embedUrl.includes("youtu.be/")) {
      embedUrl = embedUrl.replace("youtu.be/", "www.youtube.com/embed/");
    }

    try {
      new URL(embedUrl);
    } catch {
      return null;
    }

    return (
      <div className="w-full mt-12 mb-8 rounded-2xl overflow-hidden shadow-2xl bg-black aspect-video">
        <iframe
          src={embedUrl}
          title="YouTube Video"
          className="w-full h-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    );
  };

  return (
    <article className="min-h-screen bg-white text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Hero Section */}
      <div className="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        {blog.imageUrl ? (
          <>
            <Image
              src={blog.imageUrl}
              alt={blog.imageAlt || blog.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-emerald-50" />
        )}
        
        {/* Floating Back Button */}
        <div className="absolute top-8 left-0 right-0 z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <Link 
              href="/blogs" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white border border-white/20 transition-all hover:bg-white/20 hover:scale-105 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Blogs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 md:-mt-32 relative z-20">
        <div className="bg-white rounded-3xl p-6 md:p-12 shadow-xl border border-gray-100">
          <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-[1.1] text-gray-900">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 py-6 border-y border-gray-100 mb-10 text-gray-500">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              <span className="text-sm">
                {new Date(blog.createdAt).toLocaleDateString("en-US", { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            {blog.authorName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium">{blog.authorName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="text-sm">5 min read</span>
            </div>
          </div>

          {renderYoutube()}

          {/* Table of Contents / Keywords if any? */}
          {blog.targetKeywords?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {blog.targetKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="bg-gray-50 text-gray-600 text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-gray-100"
                >
                  #{keyword.replace(/\s+/g, '')}
                </span>
              ))}
            </div>
          )}

          {/* Main Content */}
          <div
            className="prose prose-lg md:prose-xl max-w-full w-full break-words overflow-hidden prose-emerald prose-headings:font-serif prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-2xl prose-a:text-emerald-600 prose-a:font-semibold hover:prose-a:text-emerald-700"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Call to action or Footer */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none pl-1">Share</p>
              <ShareButton slug={id} title={blog.title} type="blogs" align="left" />
            </div>
            <Link 
              href="/blogs" 
              className="text-emerald-600 font-bold text-sm flex items-center gap-2 group transition-all shrink-0"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              More <span className="hidden sm:inline">Blogs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="h-20" /> {/* Bottom spacing */}
    </article>
  );
}
