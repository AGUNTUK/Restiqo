import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { type Blog } from "@/lib/types/database";
import { getDictionary } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase.from("blogs").select("slug");

  return (data || []).map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  if (!isSupabaseConfigured()) return { title: "Blog - Restiqa" };

  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select("title, excerpt, cover_image")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Blog Not Found" };

  return {
    title: `${data.title} | Restiqa Blog`,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      images: data.cover_image ? [{ url: data.cover_image, width: 1200, height: 630 }] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.excerpt,
      images: data.cover_image ? [data.cover_image] : [],
    },
    alternates: {
      canonical: `/blog/${slug}`,
    }
  };
}

export default async function BlogDetailsPage({ params }: PageProps) {
  const { slug } = await params;

  if (!isSupabaseConfigured()) {
    return notFound();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(`
      *,
      users ( name, avatar_url, bio )
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    notFound();
  }

  const post = {
    ...data,
    author_name: data.users?.name,
    author_avatar: data.users?.avatar_url,
    author_bio: data.users?.bio,
  };

  // Simple Markdown-ish to HTML converter for the demo
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl md:text-5xl font-extrabold mb-8 mt-12 text-[#1a202c]">{line.substring(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl md:text-3xl font-bold mb-6 mt-10 text-[#2d3748]">{line.substring(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold mb-4 mt-8 text-[#2d3748]">{line.substring(4)}</h3>;
      if (line.startsWith('* ')) return <li key={i} className="ml-6 mb-2 list-disc text-[#4a5568]">{line.substring(2)}</li>;
      if (line.startsWith('[View All')) {
        const match = line.match(/\[(.*?)\]\((.*?)\)/);
        if (match) return <div key={i} className="my-8"><Link href={match[2]} className="neo-btn-primary px-8 py-3 rounded-xl font-bold inline-block no-underline text-white scale-105 active:scale-95 transition-all shadow-lg">{match[1]}</Link></div>;
      }
      if (line.includes('[') && line.includes('](')) {
        // Handle inline links
        const parts = line.split(/(\[.*?\]\(.*?\))/);
        return (
          <p key={i} className="text-lg text-[#4a5568] leading-relaxed mb-6">
            {parts.map((p, j) => {
              const m = p.match(/\[(.*?)\]\((.*?)\)/);
              if (m) return <Link key={j} href={m[2]} className="text-[#6c63ff] font-bold hover:underline">{m[1]}</Link>;
              return p;
            })}
          </p>
        );
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-lg text-[#4a5568] leading-relaxed mb-6">{line}</p>;
    });
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      {/* Back button */}
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-2 mb-10 text-[#6c63ff] font-extrabold text-sm no-underline hover:underline group"
      >
        <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Blog
      </Link>

      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter leading-tight text-[#1a202c]">
          {post.title}
        </h1>
        
        <div className="flex flex-wrap items-center gap-6 py-8 border-y border-[#e2e8f0]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden neo-shadow-sm border-2 border-white">
              <Image
                src={post.author_avatar || "https://i.pravatar.cc/100"}
                alt={post.author_name || "Author"}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-extrabold text-sm text-[#1a202c]">{post.author_name || "Restiqa Editor"}</p>
              <p className="text-xs font-bold text-[#a0aec0]">Published on {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-3">
             <span className="bg-[#f0fff4] text-[#2f855a] px-3 py-1 rounded-full text-[10px] font-bold border border-[#68d391]/30">Verified Guide</span>
             <span className="bg-[#ebf8ff] text-[#3182ce] px-3 py-1 rounded-full text-[10px] font-bold border border-[#90cdf4]/30">Travel Tips</span>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative aspect-[16/9] mb-12 rounded-[40px] overflow-hidden neo-shadow-lg p-3 bg-white">
        <div className="relative w-full h-full rounded-[32px] overflow-hidden">
          <Image
            src={post.cover_image || "https://images.unsplash.com/photo-1544333323-537ffecaa8c3?w=1200"}
            alt={`${post.title} - Travel Guide | Restiqa`}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto mb-20 bg-white/40 backdrop-blur-sm p-4 md:p-8 rounded-[32px] border border-white/50">
        {renderContent(post.content)}
      </div>

      {/* Author Bio */}
      <div className="max-w-3xl mx-auto neo-inset rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-white">
        <div className="w-24 h-24 rounded-[32px] overflow-hidden neo-shadow-sm flex-shrink-0 rotate-3">
          <Image
            src={post.author_avatar || "https://i.pravatar.cc/150"}
            alt={`Author ${post.author_name || "at Restiqa"}`}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center md:text-left">
          <h3 className="font-extrabold text-xl mb-2 text-[#2d3748]">About {post.author_name || "the Author"}</h3>
          <p className="text-[#718096] leading-relaxed text-sm font-medium">
            {post.author_bio || "Restiqa is Bangladesh's premier travel marketplace. We bring you handpicked rentals and expert travel guides to make your journey extraordinary."}
          </p>
        </div>
      </div>
      
      {/* Featured Stays for this Post */}
      <FeaturedStays blogTitle={post.title} />
      
      {/* Newsletter / CTA */}
      <div className="max-w-3xl mx-auto mt-20 text-center">
        <div className="neo-card p-10 md:p-16 rounded-[48px] bg-gradient-to-br from-[#6c63ff] to-[#ff6584] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Never miss an adventure</h2>
            <p className="text-white/80 font-medium mb-8 max-w-md mx-auto">Join our nomad newsletter to receive exclusive travel guides and early-bird booking discounts.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="bg-white text-[#6c63ff] px-8 py-4 rounded-2xl font-extrabold hover:bg-[#f7fafc] transition-all active:scale-95 shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

async function FeaturedStays({ blogTitle }: { blogTitle: string }) {
  let listings: any[] = [];
  
  // Extract potential city from title
  const cities = ["Cox's Bazar", "Dhaka", "Sylhet", "Sajek"];
  const city = cities.find(c => blogTitle.includes(c)) || "Cox's Bazar";

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("listings_with_stats")
      .select("*")
      .ilike("city", `%${city}%`)
      .eq("status", "approved")
      .limit(3);
    
    listings = data || [];
  }

  if (listings.length === 0) return null;

  const dict = await getDictionary();

  return (
    <section className="max-w-4xl mx-auto mt-20 pt-16 border-t border-[#e2e8f0]">
      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a202c] mb-8 text-center tracking-tight">
        Plan your trip to {city}
      </h2>
      <p className="text-[#718096] text-center mb-10 font-medium">Verified stays recommended for this guide</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {listings.map((item) => (
          <ListingCard key={item.id} listing={item} dict={dict} />
        ))}
      </div>
      <div className="text-center">
        <Link href={`/${city.toLowerCase().replace(/\s+/g, '-')}`} className="neo-btn px-8 py-3 rounded-xl font-extrabold inline-block no-underline" style={{ background: "#e8edf2", color: "#6c63ff", boxShadow: "4px 4px 10px #c4c9ce, -4px -4px 10px #ffffff" }}>
          View all stays in {city} →
        </Link>
      </div>
    </section>
  );
}

import ListingCard from "@/components/ListingCard";
