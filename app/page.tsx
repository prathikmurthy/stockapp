"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { Gear, getGearStatus } from "@/lib/types";
import Link from "next/link";
import {
  Loader2,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { PART_CATEGORIES } from "@/lib/categories";
import SearchBar from "./components/SearchBar";

function useAnimatedCounter(target: number, duration: number = 1000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * easeOut);
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [target, duration]);
  
  return count;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color,
  delay = 0 
}: { 
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: string;
  color: string;
  delay?: number;
}) {
  const animatedValue = useAnimatedCounter(value, 1200);
  
  const colorClasses: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    blue: { 
      bg: "bg-blue-500/10", 
      text: "text-blue-400", 
      border: "border-blue-500/20",
      glow: "shadow-blue-500/20"
    },
    green: { 
      bg: "bg-emerald-500/10", 
      text: "text-emerald-400", 
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/20"
    },
    yellow: { 
      bg: "bg-amber-500/10", 
      text: "text-amber-400", 
      border: "border-amber-500/20",
      glow: "shadow-amber-500/20"
    },
    red: { 
      bg: "bg-red-500/10", 
      text: "text-red-400", 
      border: "border-red-500/20",
      glow: "shadow-red-500/20"
    },
  };
  
  const colors = colorClasses[color] || colorClasses.blue;
  
  return (
    <div 
      className={`group relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} p-6 backdrop-blur-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-lg ${colors.glow}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xl font-medium text-zinc-400">{label}</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white">
            {animatedValue}
          </p>
          {trend && (
            <p className={`mt-1 text-lg ${colors.text}`}>{trend}</p>
          )}
        </div>
        <div className={`rounded-xl ${colors.bg} p-3`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ 
  icon: Icon, 
  title, 
  itemCount,
  href,
  pattern,
  accentColor,
}: { 
  icon: React.ElementType;
  title: string;
  itemCount: number;
  href: string;
  pattern: 'grid' | 'dots' | 'lines';
  accentColor: string;
}) {
  const patternStyles: Record<string, React.ReactNode> = {
    grid: (
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
        backgroundSize: '72px 72px',
      }} />
    ),
    dots: (
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `radial-gradient(circle at center, white 1.5px, transparent 1.5px)`,
        backgroundSize: '20px 20px',
      }} />
    ),
    lines: (
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)`,
        backgroundSize: '20px 20px',
      }} />
    )
  };

  const accentClasses: Record<string, { border: string; bg: string; text: string; glow: string }> = {
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500', text: 'text-blue-400', glow: 'group-hover:shadow-blue-500/20' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500', text: 'text-purple-400', glow: 'group-hover:shadow-purple-500/20' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500', text: 'text-amber-400', glow: 'group-hover:shadow-amber-500/20' },
    emerald: { border: 'border-emerald-500/30', bg: 'bg-emerald-500', text: 'text-emerald-400', glow: 'group-hover:shadow-emerald-500/20' },
    rose: { border: 'border-rose-500/30', bg: 'bg-rose-500', text: 'text-rose-400', glow: 'group-hover:shadow-rose-500/20' },
    cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500', text: 'text-cyan-400', glow: 'group-hover:shadow-cyan-500/20' },
  };

  const accent = accentClasses[accentColor] || accentClasses.blue;

  return (
    <Link href={href}>
      <div className={`group relative h-44 overflow-hidden rounded-2xl border ${accent.border} bg-black/40 backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-xl ${accent.glow}`}>
        {/* Background pattern */}
        {patternStyles[pattern]}
        
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-linear-to-br from-${accentColor}-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
        
        {/* Floating icon background */}
        <div className="absolute -right-6 -top-6 z-10 transition-all duration-500 group-hover:scale-110">
          <Icon className={`h-40 w-40 ${accent.text} opacity-[0.08] transition-opacity duration-500 group-hover:opacity-[0.3]`} strokeWidth={0.5} />
        </div>

        {/* Content */}
        <div className="relative z-20 flex h-full flex-col justify-between p-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${accent.bg}/10 transition-colors duration-300 group-hover:${accent.bg}/20`}>
            <Icon className={`h-6 w-6 ${accent.text}`} />
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className={`mt-1 text-xl ${accent.text}`}>{itemCount} items</p>
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition-all duration-300 group-hover:bg-white/10 group-hover:translate-x-1`}>
              <ChevronRight className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}


export default function Home() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [gears, setGears] = useState<Gear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGears = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const records = await pb.collection('gears').getFullList<Gear>({
          filter: `owner = "${user.id}"`,
          sort: '-updated',
        });
        setGears(records);
      } catch (error) {
        console.error('Failed to fetch gears:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchGears();
    }
  }, [user, authLoading]);

  const stats = useMemo(() => {
    const total = gears.length;
    const totalQuantity = gears.reduce((sum, g) => sum + g.quantity, 0);
    const inStock = gears.filter(g => getGearStatus(g.quantity) === 'in_stock').length;
    const lowStock = gears.filter(g => getGearStatus(g.quantity) === 'few_remaining').length;
    const outOfStock = gears.filter(g => getGearStatus(g.quantity) === 'out_of_stock').length;
    
    return { total, totalQuantity, inStock, lowStock, outOfStock };
  }, [gears]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
          <p className="text-xl text-zinc-500">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-xl text-zinc-400">
            Here's an overview of your inventory
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <SearchBar />
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={Package} 
          label="Total Items" 
          value={stats.totalQuantity}
          trend={`${stats.total} unique parts`}
          color="blue"
          delay={0}
        />
        <StatCard 
          icon={CheckCircle2} 
          label="In Stock" 
          value={stats.inStock}
          trend="Ready to use"
          color="green"
          delay={100}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Low Stock" 
          value={stats.lowStock}
          trend="Needs attention"
          color="yellow"
          delay={200}
        />
        <StatCard 
          icon={XCircle} 
          label="Out of Stock" 
          value={stats.outOfStock}
          trend="Reorder soon"
          color="red"
          delay={300}
        />
      </div>

      {/* Categories */}
      <div>
        <h2 className="mb-6 text-lg font-semibold text-white">Categories</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PART_CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              icon={category.icon}
              title={category.title}
              itemCount={category.id === 'gears' ? gears.length : 0}
              href={category.href}
              pattern={category.pattern}
              accentColor={category.accentColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
