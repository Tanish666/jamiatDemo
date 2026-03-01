import Image from "next/image";

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
  const blog = await getBlog(params.id);
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
  const blog = await getBlog(params.id);

  if (!blog) {
    return <div className="p-8 text-center text-gray-900">Blog not found.</div>;
  }

  // ✅ YouTube Renderer
  const renderYoutube = () => {
    if (!blog.youtubeUrl) return null;

    if (blog.youtubeUrl.includes("<iframe")) {
      return (
        <div
          className="w-full mt-8"
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
      <iframe
        src={embedUrl}
        title="YouTube Video"
        className="w-full h-64 md:h-96 rounded-lg"
        loading="lazy" // ✅ defer loading
        referrerPolicy="no-referrer-when-downgrade"
        frameBorder="0"
        allowFullScreen
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {blog.imageUrl && (
        <div className="relative w-full h-80 md:h-[500px] overflow-hidden">
          <Image
            src={blog.imageUrl}
            alt={blog.imageAlt || blog.title}
            fill
            priority={false} // lazy-load by default
            sizes="100vw"
            className="object-cover"
          />
        </div>
      )}

      {blog.categories?.length > 0 && (
        <div className="flex flex-wrap gap-2 mx-auto mt-6 max-w-4xl px-4">
          {blog.categories.map((category) => (
            <span
              key={category}
              className="bg-emerald-100 text-emerald-800 text-sm font-semibold px-4 py-2 rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      {blog.targetKeywords?.length > 0 && (
        <div className="flex flex-wrap gap-2 mx-auto mt-4 max-w-4xl px-4">
          {blog.targetKeywords.map((keyword) => (
            <span
              key={keyword}
              className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center">
          {blog.title}
        </h1>
        <div className="text-sm text-gray-500 text-center mb-8">
          <p>
            Published on {new Date(blog.createdAt).toLocaleDateString()}
            {blog.authorName && ` by ${blog.authorName}`}
          </p>
        </div>

        {renderYoutube()}

        <div
          className="prose max-w-none mx-auto break-words overflow-hidden w-full"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </div>
  );
}
