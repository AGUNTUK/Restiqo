"use client";

import { useState } from "react";
import { submitReview } from "@/app/actions/listing";

interface ReviewFormProps {
  listingId: string;
  slug: string;
  dict: any;
}

export default function ReviewForm({ listingId, slug, dict }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("listingId", listingId);
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    formData.append("slug", slug);

    const result = await submitReview(formData);
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setComment("");
    }
  };

  if (success) {
    return (
      <div className="p-8 neo-inset rounded-3xl text-center animate-in fade-in zoom-in duration-500">
        <span className="text-4xl mb-4 block">🎉</span>
        <h4 className="text-xl font-bold text-[#1a202c] mb-2">Thank you!</h4>
        <p className="text-[#718096]">Your review has been submitted successfully.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm font-bold text-[#6c63ff] hover:underline"
        >
          Write another review
        </button>
      </div>
    );
  }

  return (
    <div className="neo-card p-8 rounded-[32px] border border-white/40">
      <h3 className="text-xl font-bold text-[#1a202c] mb-6">Leave a review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-bold text-[#4a5568] mb-3 block">Rating</label>
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setRating(num)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all ${
                  rating >= num 
                    ? "bg-[#f6ad55] text-white shadow-lg neo-shadow-sm" 
                    : "bg-[#edf2f7] text-[#cbd5e0] neo-shadow-inset"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-[#4a5568] mb-3 block">Your experience</label>
          <textarea
            required
            minLength={5}
            rows={4}
            className="w-full neo-shadow-inset bg-[#f7fafc] border-none rounded-2xl p-4 text-[#2d3748] focus:ring-2 focus:ring-[#6c63ff]/20 placeholder-[#a0aec0] transition-all resize-none"
            placeholder="Tell us what you liked about your stay..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="neo-btn neo-btn-primary w-full py-4 rounded-2xl text-lg font-extrabold shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}
