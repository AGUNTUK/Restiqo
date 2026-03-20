"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentSearch {
  location: string;
  checkin: string;
  checkout: string;
  guests: { adults: number; children: number; infants: number };
  timestamp: number;
}

const STORAGE_KEY = "restiqa_recent_searches";
const MAX_ITEMS = 8;

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  const addSearch = useCallback((newSearch: Omit<RecentSearch, "timestamp">) => {
    setSearches((prev) => {
      // Create full search object
      const fullSearch: RecentSearch = { ...newSearch, timestamp: Date.now() };

      // Deduplicate: remove if same location, dates, and guests already exist
      const filtered = prev.filter((s) => 
        !(s.location === newSearch.location && 
          s.checkin === newSearch.checkin && 
          s.checkout === newSearch.checkout &&
          s.guests.adults === newSearch.guests.adults &&
          s.guests.children === newSearch.guests.children)
      );

      // Add to start and limit
      const updated = [fullSearch, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { searches, addSearch, clearSearches };
}
