"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Calendar, Clock, ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

// revalidate every minute and not on every request
const revalidate = 60;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
          next: { revalidate: revalidate },
        });
        const data = await res.json();
        // Sorting or filtering can be done here if needed
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const categories = [
    { name: "Success Stories", count: 12 },
    { name: "Zakat & Fiqh", count: 8 },
    { name: "Community Events", count: 5 },
    { name: "Project Updates", count: 24 },
  ];

  const popularArticles = [
    {
      title: "How to Calculate Zakat on Gold Jewelry",
      date: "Oct 05",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1589750678059-a9627a7a8f5d?q=80&w=200&auto=format&fit=crop",
    },
    {
      title: "Winter Relief: Preparing for the Cold",
      date: "Sep 22",
      readTime: "4 min read",
      image: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?q=80&w=200&auto=format&fit=crop",
    },
    {
      title: "The Impact of Educating One Girl Child",
      date: "Aug 15",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=200&auto=format&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-20 ">
      {/* 🟢 Hero Section */}
      <section className="pt-32 pb-12 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4 font-serif text-[#1F2937]"
        >
          Our Latest Stories
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base leading-relaxed"
        >
          Updates on our projects, success stories from the community, and insights into Islamic philanthropy.
        </motion.p>
      </section>

      {/* 🟢 Main Content Area */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* 📝 Left Column: Blog Posts */}
        <div className="lg:col-span-8">
          {loading ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="animate-pulse bg-gray-100 h-96 rounded-2xl"></div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <p className="text-center text-gray-500 py-20">No blogs found.</p>
          ) : (
            <>
              <div className="grid gap-8 sm:grid-cols-2">
                {blogs.slice(0, 4).map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div className="relative h-60 overflow-hidden">
                      <Image
                        src={blog.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop"}
                        alt={blog.title}
                        fill
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {blog.category && (
                        <div className="absolute top-4 left-4 bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {blog.category}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-gray-400 text-xs mb-3 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-300" />
                          {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-gray-300" />
                          5 min read
                        </span>
                      </div>

                      <h2 className="text-xl font-bold text-[#1F2937] font-serif mb-3 leading-tight group-hover:text-[#10B981] transition-colors">
                        <Link href={`/blogs/${blog._id}`}>{blog.title}</Link>
                      </h2>

                      <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {blog.excerpt || "Updates on our projects, success stories from the community, and insights into Islamic philanthropy."}
                      </p>

                      <div className="mt-auto">
                        <Link
                          href={`/blogs/${blog._id}`}
                          className="inline-flex items-center gap-1 text-[#10B981] text-xs font-bold uppercase tracking-widest hover:gap-2 transition-all"
                        >
                          Read More <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* 🏆 Featured / Wide Post (as seen in image) */}
              {blogs.length >= 5 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-12 group bg-white rounded-2xl overflow-hidden border border-gray-100 grid md:grid-cols-5 hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-64 md:h-auto md:col-span-2 overflow-hidden">
                    <Image
                      src={blogs[4].imageUrl || "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop"}
                      alt={blogs[4].title}
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {blogs[4].category || "Volunteering"}
                    </div>
                  </div>
                  <div className="p-8 md:col-span-3 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-gray-400 text-xs mb-3 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-300" />
                        {new Date(blogs[4].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} className="text-gray-300" />
                        8 min read
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-[#1F2937] font-serif mb-4 leading-tight group-hover:text-[#10B981] transition-colors">
                      <Link href={`/blogs/${blogs[4]._id}`}>{blogs[4].title}</Link>
                    </h2>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                      {blogs[4].excerpt || "Our community efforts have reached new heights. Learn how our dedicated volunteers are making a tangible difference every single day."}
                    </p>
                    <Link
                      href={`/blogs/${blogs[4]._id}`}
                      className="inline-flex items-center gap-1 text-[#10B981] text-xs font-bold uppercase tracking-widest hover:gap-2 transition-all"
                    >
                      Read More <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* 🔢 Pagination */}
              <div className="mt-16 flex items-center justify-center gap-2">
                <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  &lt;
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#10B981] text-white font-bold shadow-md shadow-emerald-100">
                  1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  3
                </button>
                <span className="px-2 text-gray-400">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  12
                </button>
                <button className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  &gt;
                </button>
              </div>
            </>
          )}
        </div>

        {/* 🔍 Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-12">

          {/* Search */}
          <div className="rounded-2xl border border-gray-100 p-5 shadow-md shadow-gray-100">
            <div className="relative group rounded-xl">
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#10B981]/10 focus:border-[#10B981] transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#10B981] transition-colors" size={18} />
            </div>
          </div>

          {/* Categories */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-[#10B981] rounded-full"></div>
              <h3 className="font-bold text-lg text-[#1F2937]">Categories</h3>
            </div>
            <div className="space-y-3">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href="#"
                  className="flex items-center justify-between py-2 text-sm text-gray-500 hover:text-[#10B981] transition-colors group"
                >
                  <span>{cat.name}</span>
                  <span className="bg-gray-50 text-gray-400 group-hover:bg-emerald-50 group-hover:text-[#10B981] px-2 py-0.5 rounded text-[10px] font-bold transition-colors">
                    {cat.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Popular Articles */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-6 w-1 bg-[#10B981] rounded-full"></div>
              <h3 className="font-bold text-lg text-[#1F2937]">Popular Articles</h3>
            </div>
            <div className="space-y-6">
              {popularArticles.map((article, idx) => (
                <div key={idx} className="flex gap-4 group cursor-pointer">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden shadow-sm">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-[#1F2937] line-clamp-2 leading-snug group-hover:text-[#10B981] transition-colors mb-2">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                      <span>{article.date}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>


        </aside>

      </section>
    </div>
  );
}
