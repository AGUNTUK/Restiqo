"use client";

import dynamic from "next/dynamic";
import React from "react";

export const DynamicHeroBg = dynamic(() => import("./InteractiveHeroBg"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#e8edf2] -z-10" />,
});

export const DynamicListingsMap = dynamic(() => import("./ListingsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#e8edf2] rounded-3xl flex items-center justify-center animate-pulse">
      <div className="text-center">
        <span className="text-3xl mb-2 block">🗺️</span>
        <p className="text-xs font-bold text-[#a0aec0]">Loading Interactive Map...</p>
      </div>
    </div>
  ),
});
