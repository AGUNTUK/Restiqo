"use client";

import { useState, useEffect } from "react";
import { createListing } from "@/app/actions/host";

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "tv", label: "TV", icon: "📺" },
  { id: "ac", label: "Air Conditioning", icon: "❄️" },
  { id: "parking", label: "Free Parking", icon: "🚗" },
  { id: "workspace", label: "Workspace", icon: "💻" },
  { id: "gym", label: "Gym", icon: "🏋️" },
];

const PROPERTY_TYPES = [
  { id: "apartment", label: "Apartment", icon: "🏢", desc: "A rented place within a multi-unit building" },
  { id: "hotel", label: "Hotel", icon: "🏨", desc: "A business offering private rooms" },
  { id: "resort", label: "Resort", icon: "🌴", desc: "A luxury facility perfect for vacations" },
  { id: "tour", label: "Tour", icon: "🗺️", desc: "An experience or guided trip" },
];

interface DraftData {
  type: string;
  city: string;
  country: string;
  title: string;
  description: string;
  maxGuests: string;
  beds: string;
  baths: string;
  price: string;
  amenities: string[];
}

const DEFAULT_DATA: DraftData = {
  type: "apartment",
  city: "",
  country: "",
  title: "",
  description: "",
  maxGuests: "2",
  beds: "1",
  baths: "1",
  price: "",
  amenities: [],
};

const DRAFT_KEY = "restiqa_host_draft";

export default function AddListingForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  
  const [data, setData] = useState<DraftData>(DEFAULT_DATA);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Load draft on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // Save to draft when data changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    }
  }, [data, isMounted]);

  const updateData = (field: keyof DraftData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step > 1) setStep(step - 1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setImages((prev) => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    setErrorMsg("");
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "amenities") {
        (value as string[]).forEach((item) => formData.append("amenities", item));
      } else {
        formData.append(key, value as string);
      }
    });

    if (images.length === 0) {
      setErrorMsg("Please upload at least one image.");
      setIsSubmitting(false);
      return;
    }

    images.forEach((file) => formData.append("images", file));

    const result = await createListing(formData);
    if (result?.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  // Validation logic before allowing NEXT step
  const canProceed = () => {
    if (step === 1) return !!data.type;
    if (step === 2) return !!data.city && !!data.country;
    if (step === 3) return !!data.title && !!data.description && !!data.maxGuests;
    if (step === 4) return images.length > 0;
    if (step === 5) return !!data.price && Number(data.price) > 0;
    return true;
  };

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <div className="neo-card p-6 md:p-10 rounded-[40px] max-w-4xl mx-auto min-h-[600px] flex flex-col relative">
      
      {/* Progress Bar & Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4 text-sm font-bold text-[#a0aec0] uppercase tracking-widest">
          <span>Step {step} of {totalSteps}</span>
          <span className="text-[#6c63ff]">
            {step === 1 && "Property Type"}
            {step === 2 && "Location"}
            {step === 3 && "Property Details"}
            {step === 4 && "Images"}
            {step === 5 && "Pricing"}
            {step === 6 && "Review & Publish"}
          </span>
        </div>
        <div className="w-full h-3 bg-[#e2e8f0] rounded-full overflow-hidden shadow-inner flex">
          {[...Array(totalSteps)].map((_, i) => (
            <div key={i} className="flex-1 h-full px-[1px]">
              <div 
                className={`w-full h-full transition-all duration-500 rounded-full ${i + 1 <= step ? "bg-gradient-to-r from-[#6c63ff] to-[#ff6584]" : "bg-transparent"}`}
              />
            </div>
          ))}
        </div>
        <div className="text-right mt-2 text-xs font-semibold text-[#a0aec0]">
          Auto-saved as draft 💾
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 mb-6 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold shadow-sm animate-pulse">
          {errorMsg}
        </div>
      )}

      {/* Step Content Area */}
      <div className="flex-1 flex flex-col justify-center animate-in slide-in-from-right duration-500">
        
        {/* Step 1: Property Type */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">What kind of place will you host?</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {PROPERTY_TYPES.map((pt) => {
                const isSelected = data.type === pt.id;
                return (
                  <div
                    key={pt.id}
                    onClick={() => updateData("type", pt.id)}
                    className={`cursor-pointer neo-card p-6 rounded-3xl transition-all duration-300 transform active:scale-95 ${
                      isSelected 
                        ? "shadow-[inset_4px_4px_10px_rgba(163,177,198,0.5),inset_-4px_-4px_10px_rgba(255,255,255,0.8)] border-2 border-[#6c63ff]" 
                        : "hover:-translate-y-1 hover:border-[#cbd5e0] border-2 border-transparent"
                    }`}
                  >
                    <div className="text-4xl mb-4">{pt.icon}</div>
                    <h3 className={`text-xl font-bold mb-1 ${isSelected ? "text-[#6c63ff]" : "text-[#1a202c]"}`}>{pt.label}</h3>
                    <p className="text-sm text-[#718096] font-medium">{pt.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-6 max-w-2xl mx-auto w-full">
            <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Where's your place located?</h2>
            <p className="text-[#718096] font-medium mb-6">Guests only get your exact address once they’ve booked.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-3">Country / District</label>
                <input
                  type="text"
                  value={data.country}
                  onChange={(e) => updateData("country", e.target.value)}
                  placeholder="e.g. Bangladesh"
                  className="neo-inset w-full p-5 rounded-2xl text-lg font-bold text-[#2d3748] placeholder-[#cbd5e0] focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-3">City / Area</label>
                <input
                  type="text"
                  value={data.city}
                  onChange={(e) => updateData("city", e.target.value)}
                  placeholder="e.g. Gulshan, Dhaka"
                  className="neo-inset w-full p-5 rounded-2xl text-lg font-bold text-[#2d3748] placeholder-[#cbd5e0] focus:outline-none focus:ring-2 focus:ring-[#6c63ff]/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Property Details */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Share some basics about your place</h2>
              <p className="text-[#718096] font-medium mb-6">You'll add more details later, like bed types.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-3">Listing Title</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateData("title", e.target.value)}
                  placeholder="e.g. Cozy City View Apartment"
                  className="neo-inset w-full p-4 rounded-2xl text-md font-bold text-[#2d3748] placeholder-[#cbd5e0] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-3">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => updateData("description", e.target.value)}
                  placeholder="Describe your property..."
                  rows={3}
                  className="neo-inset w-full p-4 rounded-2xl text-md font-medium text-[#2d3748] placeholder-[#cbd5e0] focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="neo-card p-4 rounded-2xl text-center">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-2">Guests</label>
                <input
                  type="number"
                  min="1"
                  value={data.maxGuests}
                  onChange={(e) => updateData("maxGuests", e.target.value)}
                  className="neo-inset w-full p-3 rounded-xl text-lg font-bold text-[#6c63ff] text-center focus:outline-none"
                />
              </div>
              <div className="neo-card p-4 rounded-2xl text-center">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-2">Beds</label>
                <input
                  type="number"
                  min="1"
                  value={data.beds}
                  onChange={(e) => updateData("beds", e.target.value)}
                  className="neo-inset w-full p-3 rounded-xl text-lg font-bold text-[#6c63ff] text-center focus:outline-none"
                />
              </div>
              <div className="neo-card p-4 rounded-2xl text-center">
                <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-2">Baths</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={data.baths}
                  onChange={(e) => updateData("baths", e.target.value)}
                  className="neo-inset w-full p-3 rounded-xl text-lg font-bold text-[#6c63ff] text-center focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#a0aec0] mb-4">Select Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AMENITIES.map((item) => {
                  const isChecked = data.amenities.includes(item.label);
                  return (
                    <label key={item.id} className="cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) updateData("amenities", [...data.amenities, item.label]);
                          else updateData("amenities", data.amenities.filter((a) => a !== item.label));
                        }}
                        className="sr-only"
                      />
                      <div className={`p-4 rounded-2xl text-center transition-all ${
                        isChecked 
                          ? "neo-inset bg-[#e8edf2] border border-[#6c63ff]/20" 
                          : "neo-card hover:shadow-inner bg-transparent"
                      }`}>
                        <div className={`text-2xl mb-1 transition-transform ${isChecked ? "scale-110" : "opacity-70 group-hover:scale-105"}`}>{item.icon}</div>
                        <div className={`text-xs font-bold ${isChecked ? "text-[#6c63ff]" : "text-[#718096]"}`}>{item.label}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Images */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Add some photos of your space</h2>
            <p className="text-[#718096] font-medium mb-6">You'll need at least one photo to get started. Note: Images are not saved in drafts.</p>
            
            <div className="neo-inset rounded-[32px] p-8 md:p-12 text-center border-2 border-dashed border-[#cbd5e0] hover:border-[#6c63ff] transition-colors relative">
              <span className="text-6xl mb-4 block">📸</span>
              <h3 className="text-xl font-extrabold text-[#2d3748] mb-2">Drag your photos here</h3>
              <p className="text-[#718096] mb-6 font-medium">Choose at least 1 photo related to your property.</p>
              
              <label className="cursor-pointer neo-btn px-6 py-3 rounded-full text-sm font-extrabold inline-block shadow-sm">
                <span>Browse from device</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square neo-card rounded-2xl overflow-hidden group">
                    <img src={src} alt={`preview ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Price */}
        {step === 5 && (
          <div className="space-y-6 max-w-md mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Now, set your price</h2>
            <p className="text-[#718096] font-medium mb-12">You can change it anytime.</p>
            
            <div className="relative flex justify-center items-baseline mx-auto w-full max-w-xs">
              <span className="text-5xl font-extrabold text-[#2d3748] mr-2">৳</span>
              <input
                type="number"
                min="1"
                value={data.price}
                onChange={(e) => updateData("price", e.target.value)}
                placeholder="0"
                className="neo-inset w-full py-6 pr-4 pl-0 bg-transparent text-6xl font-extrabold text-[#6c63ff] placeholder-[#cbd5e0] focus:outline-none text-center rounded-[32px]"
                style={{ appearance: 'none' }}
              />
            </div>
            <div className="text-[#a0aec0] font-bold text-sm mt-4 uppercase tracking-widest">Per Night</div>
          </div>
        )}

        {/* Step 6: Review & Publish */}
        {step === 6 && (
          <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-[#1a202c] mb-2 tracking-tight">Review your listing</h2>
            <p className="text-[#718096] font-medium mb-6">Here's what we'll show to guests. Make sure everything looks right.</p>

            <div className="neo-card p-6 md:p-8 rounded-[32px] flex flex-col md:flex-row gap-8 items-start">
              {/* Thumbnail Preview */}
              <div className="w-full md:w-1/3 aspect-[4/3] rounded-[24px] overflow-hidden bg-gray-100 flex-shrink-0 relative shadow-inner">
                {imagePreviews[0] ? (
                  <img src={imagePreviews[0]} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🏜️</div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold shadow-sm uppercase text-[#6c63ff]">
                  {data.type}
                </div>
              </div>

              {/* Details Preview */}
              <div className="flex-1 w-full space-y-4">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#2d3748] mb-1 leading-tight">{data.title || "Untitled Property"}</h3>
                  <p className="text-[#718096] font-semibold flex items-center gap-1">
                    <span className="text-lg">📍</span> {data.city || "City"}, {data.country || "Country"}
                  </p>
                </div>
                
                <p className="text-[#4a5568] line-clamp-2 md:line-clamp-3 leading-relaxed">{data.description || "No description provided."}</p>
                
                <div className="flex flex-wrap gap-4 text-sm font-bold text-[#a0aec0]">
                  <span>{data.maxGuests} Guests</span> • <span>{data.beds} Beds</span> • <span>{data.baths} Baths</span>
                </div>

                <div className="pt-4 border-t border-[#e2e8f0]/40 flex justify-between items-center">
                  <span className="font-extrabold text-2xl text-[#6c63ff]">৳{data.price || "0"}<span className="text-sm text-[#a0aec0]"> / night</span></span>
                </div>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-[#4a5568] text-sm font-semibold flex items-start gap-3">
              <span className="text-xl">💡</span>
              <p>Everything looks good? By clicking publish, your property will immediately be live for travelers to book securely on Restiqa.</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="mt-12 pt-6 border-t border-[#e2e8f0]/50 flex justify-between items-center">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || isSubmitting}
          className="neo-btn px-6 py-3 rounded-full text-sm font-extrabold text-[#718096] disabled:opacity-30 transition-all"
        >
          ← Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="neo-btn px-10 py-3 rounded-full text-sm font-extrabold text-white disabled:opacity-50 transition-all shadow-[0_5px_15px_rgba(108,99,255,0.4)]"
            style={{ background: "linear-gradient(135deg, #6c63ff, #ff6584)" }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting || !canProceed()}
            className="neo-btn px-10 py-3 rounded-full text-sm font-extrabold text-white disabled:opacity-50 transition-all shadow-[0_5px_15px_rgba(67,233,123,0.5)] flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #43e97b, #38f9d7)" }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </>
            ) : "🚀 Publish Listing"}
          </button>
        )}
      </div>

    </div>
  );
}
