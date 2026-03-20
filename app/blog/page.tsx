import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type Blog } from "@/lib/types/database";

export const metadata: Metadata = {
  title: "Blog & Travel Guides | Restiqa",
  description: "Discover travel tips, top destinations, and local guides for your next trip to Bangladesh. Explore Cox's Bazar, Sylhet, and more.",
};

export default async function BlogListingPage() {
  let blogs: Blog[] = [];

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blogs")
      .select(`
        *,
        users ( name, avatar_url )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      blogs = data.map((b: any) => ({
        ...b,
        author_name: b.users?.name,
        author_avatar: b.users?.avatar_url,
      }));
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight" style={{ color: "#1a202c" }}>
          Travel <span className="text-[#6c63ff]">Insights</span>
        </h1>
        <p className="text-lg md:text-xl text-[#718096] font-medium leading-relaxed">
          Expert guides, local secrets, and the best places to stay across beautiful Bangladesh. 
          Your journey starts here.
        </p>
      </div>

      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="group no-underline block"
            >
              <div className="neo-card rounded-[32px] overflow-hidden p-3 h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_24px_#c4c9ce,-12px_-12px_24px_#ffffff]">
                <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden mb-5">
                  <Image
                    src={post.cover_image || "https://images.unsplash.com/photo-1544333323-537ffecaa8c3?w=800"}
                    alt={`${post.title} - Travel Guide | Restiqa`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <div className="px-3 flex flex-col flex-grow">
                  <h2 className="text-xl font-extrabold mb-3 line-clamp-2 transition-colors group-hover:text-[#6c63ff]" style={{ color: "#1a202c" }}>
                    {post.title}
                  </h2>
                  <p className="text-[#718096] text-sm font-medium line-clamp-3 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-[#e2e8f0] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden neo-shadow-sm border-2 border-white">
                        <Image
                          src={post.author_avatar || "https://i.pravatar.cc/100"}
                          alt={post.author_name || "Author"}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs font-bold text-[#4a5568]">{post.author_name || "Restiqa Team"}</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#a0aec0] uppercase tracking-widest">
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 neo-card rounded-[40px] max-w-xl mx-auto">
          <p className="text-xl font-bold text-[#a0aec0]">No blog posts found yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
}
