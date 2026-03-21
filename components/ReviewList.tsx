import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    name: string;
    avatar_url: string;
  };
}

interface ReviewListProps {
  reviews: Review[];
  dict: any;
}

export default function ReviewList({ reviews, dict }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center neo-inset rounded-3xl">
        <span className="text-4xl mb-4 block">💬</span>
        <p className="text-[#a0aec0] font-medium">{dict.listing.noReviews}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {reviews.map((review) => (
        <div key={review.id} className="neo-card p-6 rounded-[28px] border border-white/40">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white neo-shadow-sm">
              <Image
                src={review.users.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.users.name}`}
                alt={review.users.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="font-bold text-[#1a202c] leading-tight">{review.users.name}</p>
              <p className="text-xs text-[#a0aec0] font-medium">
                {new Date(review.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
            <div className="ml-auto text-sm font-bold text-[#f6ad55]">
              ★ {review.rating.toFixed(1)}
            </div>
          </div>
          <p className="text-[#4a5568] text-sm leading-relaxed">
            {review.comment}
          </p>
        </div>
      ))}
    </div>
  );
}
