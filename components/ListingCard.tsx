import Link from "next/link";
import Image from "next/image";
import { type ListingWithStats } from "@/lib/types/database";
import { type dictionaries } from "@/lib/i18n/dictionaries";

interface ListingCardProps {
  listing: ListingWithStats;
  dict: typeof dictionaries["en"];
}

export default function ListingCard({ listing, dict }: ListingCardProps) {
  const isValidImage = (src: string) => {
    return src && (src.startsWith("/") || src.startsWith("http") || src.startsWith("https"));
  };

  const imageSrc = isValidImage(listing.images[0]) 
    ? listing.images[0] 
    : "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800";

  return (
    <Link href={`/listing/${listing.slug || listing.id}`} className="block group no-underline">
      <div className="neo-card rounded-[24px] p-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-[8px_8px_20px_#c4c9ce,-8px_-8px_20px_#ffffff]">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] rounded-[16px] overflow-hidden mb-4">
          <Image
            src={imageSrc}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badges */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
            <div className="neo-badge bg-[#f0fff4]/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 border border-[#68d391]/30" style={{ color: "#2f855a" }}>
              <span className="text-xs">🛡️</span> {dict.listing.verified || "Verified"}
            </div>
            <div className="neo-badge bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
              <span style={{ color: "#f6ad55" }}>★</span>{" "}
              <span style={{ color: "#2d3748" }}>{Number(listing.avg_rating).toFixed(1)}</span>
              <span style={{ color: "#a0aec0", fontWeight: 'normal' }}>({listing.review_count})</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-1">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3
              className="font-bold text-lg truncate"
              style={{ color: "#1a202c", letterSpacing: "-0.01em" }}
            >
              {listing.title}
            </h3>
          </div>
          <p className="text-sm font-medium truncate mb-3" style={{ color: "#718096" }}>
            {listing.city}, {listing.country}
          </p>

          <div className="flex items-center gap-4 text-xs font-semibold mb-4" style={{ color: "#a0aec0" }}>
            <span className="flex items-center gap-1.5">
              🛏️ {listing.beds} {listing.beds === 1 ? dict.listing.bed : dict.listing.beds}
            </span>
            <span className="flex items-center gap-1.5">
              🛁 {listing.baths} {listing.baths === 1 ? dict.listing.bath : dict.listing.baths}
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              🏠 {listing.type}
            </span>
          </div>

          {/* Footer (Price & CTA) */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#e2e8f0]">
            <div>
              <span className="font-extrabold text-xl" style={{ color: "#1a202c" }}>
                {dict.common.currency}{Math.round(listing.price)}
              </span>
              <span className="text-xs font-semibold" style={{ color: "#a0aec0" }}>
                {" "}
                {dict.common.pricePerNight}
              </span>
            </div>
            <div
              className="px-4 py-2 rounded-xl text-sm font-bold bg-[#e8edf2] transition-colors group-hover:bg-[#6c63ff] group-hover:text-white"
              style={{ color: "#6c63ff" }}
            >
              {dict.listing.view}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
