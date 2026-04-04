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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const blogsPerPage = 5;

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`, {
          next: { revalidate: revalidate },
        });
        const data = await res.json();
        setBlogs(data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    }

    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }

    fetchBlogs();
    fetchCategories();
  }, []);

  // Filter blogs based on search and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const currentBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


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
      <section className="max-w-5xl mx-auto px-4 lg:px-8">
        {loading ? (
          <div className="grid gap-8 sm:grid-cols-2">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="animate-pulse bg-gray-100 h-96 rounded-2xl"></div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <p className="text-center text-gray-500 py-20">No blogs found.</p>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-8">
              {currentBlogs.slice(0, 4).map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 w-full sm:w-[calc(50%-1rem)] max-w-[450px]"
                >
                  {/* Image Container */}
                  <div className="relative h-60 overflow-hidden">
                    <Image
                      src={blog.imageUrl || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop"}
                      alt={blog.title}
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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

            {/* Featured Post */}
            {currentBlogs.length >= 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 group bg-white rounded-2xl overflow-hidden border border-gray-100 grid md:grid-cols-5 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-64 md:h-auto md:col-span-2 overflow-hidden">
                  <Image
                    src={currentBlogs[4].imageUrl || "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop"}
                    alt={currentBlogs[4].title}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-8 md:col-span-3 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-gray-400 text-xs mb-3 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} className="text-gray-300" />
                      {new Date(currentBlogs[4].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} className="text-gray-300" />
                      8 min read
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1F2937] font-serif mb-4 leading-tight group-hover:text-[#10B981] transition-colors">
                    <Link href={`/blogs/${currentBlogs[4]._id}`}>{currentBlogs[4].title}</Link>
                  </h2>
                  <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    {currentBlogs[4].excerpt || "Our community efforts have reached new heights. Learn how our dedicated volunteers are making a tangible difference every single day."}
                  </p>
                  <Link
                    href={`/blogs/${currentBlogs[4]._id}`}
                    className="inline-flex items-center gap-1 text-[#10B981] text-xs font-bold uppercase tracking-widest hover:gap-2 transition-all"
                  >
                    Read More <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            )}

            {/* 🔢 Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${currentPage === i + 1
                        ? "bg-[#10B981] text-white shadow-md shadow-emerald-100"
                        : "border border-gray-100 hover:bg-gray-50 text-gray-600"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
