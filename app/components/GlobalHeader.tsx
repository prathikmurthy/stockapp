"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import SearchBar from "./SearchBar";

export default function GlobalHeader() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  if (pathname === "/" || !isAuthenticated || isLoading) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="flex items-center justify-center px-8 py-4">
        <SearchBar />
      </div>
    </header>
  );
}
