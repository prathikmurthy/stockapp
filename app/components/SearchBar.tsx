"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { Gear, getGearStatus } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import {
  Search,
  Command,
  ArrowRight,
  X,
  Cog,
} from "lucide-react";
import { PART_CATEGORIES, CategoryType } from "@/lib/categories";


interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className = "" }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [gears, setGears] = useState<Gear[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchGears = async () => {
      if (!user) return;
      
      try {
        const records = await pb.collection('gears').getFullList<Gear>({
          filter: `owner = "${user.id}"`,
          sort: '-updated',
        });
        setGears(records);
      } catch (error) {
        console.error('Failed to fetch gears:', error);
      }
    };

    fetchGears();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredParts = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchLower = query.toLowerCase();
    return gears
      .filter(gear => gear.name.toLowerCase().includes(searchLower))
      .slice(0, 5);
  }, [query, gears]);

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return [];
    
    const searchLower = query.toLowerCase();
    return PART_CATEGORIES.filter(cat => 
      cat.title.toLowerCase().includes(searchLower) ||
      cat.id.toLowerCase().includes(searchLower)
    );
  }, [query]);

  const allResults = useMemo(() => {
    const results: Array<{ type: 'category'; data: CategoryType } | { type: 'part'; data: Gear }> = [];
    filteredCategories.forEach(cat => results.push({ type: 'category', data: cat }));
    filteredParts.forEach(part => results.push({ type: 'part', data: part }));
    return results;
  }, [filteredCategories, filteredParts]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (gear: Gear) => {
    setQuery("");
    setIsFocused(false);
    router.push(`/gears?search=${encodeURIComponent(gear.name)}`);
  };

  const handleSelectCategory = (category: CategoryType) => {
    setQuery("");
    setIsFocused(false);
    router.push(category.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery("");
      setIsFocused(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults.length > 0 && selectedIndex < allResults.length) {
        const selected = allResults[selectedIndex];
        if (selected.type === 'category') {
          handleSelectCategory(selected.data);
        } else {
          handleSelect(selected.data);
        }
      } else if (query.trim()) {
        router.push(`/gears?search=${encodeURIComponent(query)}`);
        setIsFocused(false);
      }
      return;
    }
  };

  const getStatusColor = (quantity: number) => {
    const status = getGearStatus(quantity);
    if (status === 'in_stock') return 'bg-emerald-500';
    if (status === 'few_remaining') return 'bg-amber-500';
    return 'bg-red-500';
  };

  const hasResults = filteredCategories.length > 0 || filteredParts.length > 0;
  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <div className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input */}
      <div className={`relative flex items-center rounded-2xl border bg-black/40 backdrop-blur-xl transition-all duration-300 ${
        isFocused 
          ? 'border-white/20 shadow-lg shadow-black/20' 
          : 'border-white/10 hover:border-white/15'
      }`}>
        <div className="flex items-center pl-4">
          <Search className={`h-5 w-5 transition-colors duration-200 ${isFocused ? 'text-white' : 'text-zinc-500'}`} />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search parts, categories..."
          className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none"
        />

        {query && (
          <button 
            onClick={() => setQuery("")}
            className="mr-2 rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <div className="mr-4 flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
          <Command className="h-3 w-3 text-zinc-500" />
          <span className="text-xs text-zinc-500">K</span>
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-black/40">
          {hasResults ? (
            <>
              {/* Categories Section */}
              {filteredCategories.length > 0 && (
                <>
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Categories</p>
                  </div>
                  <div className="py-2">
                    {filteredCategories.map((category, index) => {
                      const CategoryIcon = category.icon;
                      const colorMap: Record<string, { bg: string; text: string }> = {
                        blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
                        purple: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
                        amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
                        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
                        rose: { bg: 'bg-rose-500/10', text: 'text-rose-400' },
                        cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
                      };
                      const colors = colorMap[category.accentColor] || colorMap.blue;
                      const isSelected = selectedIndex === index;
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleSelectCategory(category)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors ${
                            isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.bg}`}>
                            <CategoryIcon className={`h-5 w-5 ${colors.text}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white">{category.title}</p>
                            <p className="text-sm text-zinc-500">Browse {category.title.toLowerCase()} inventory</p>
                          </div>
                          <ArrowRight className={`h-4 w-4 transition-colors ${isSelected ? 'text-white' : 'text-zinc-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Parts Section */}
              {filteredParts.length > 0 && (
                <>
                  <div className={`px-4 py-3 border-b border-white/5 ${filteredCategories.length > 0 ? 'border-t' : ''}`}>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Parts</p>
                  </div>
                  <div className="py-2">
                    {filteredParts.map((gear, index) => {
                      const resultIndex = filteredCategories.length + index;
                      const isSelected = selectedIndex === resultIndex;
                      return (
                        <button
                          key={gear.id}
                          onClick={() => handleSelect(gear)}
                          onMouseEnter={() => setSelectedIndex(resultIndex)}
                          className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors ${
                            isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                          }`}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                            <Cog className="h-5 w-5 text-zinc-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{gear.name}</p>
                            <p className="text-sm text-zinc-500 truncate">
                              {gear.material} · {gear.bore_size}" {gear.bore_type}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <div className={`h-2 w-2 rounded-full ${getStatusColor(gear.quantity)}`} />
                              <span className="text-sm text-zinc-400">{gear.quantity} in stock</span>
                            </div>
                            <ArrowRight className={`h-4 w-4 transition-colors ${isSelected ? 'text-white' : 'text-zinc-600'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Search className="h-6 w-6 text-zinc-500" />
              </div>
              <p className="text-sm text-zinc-400">No results found for "<span className="text-white">{query}</span>"</p>
              <p className="mt-1 text-xs text-zinc-600">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
