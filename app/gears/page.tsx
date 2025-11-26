"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import { Gear, GearStatus, getGearStatus } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Settings2, Filter, MoreHorizontal, Plus, Loader2, ChevronRight } from "lucide-react";
import { AddGearDialog } from "./components/AddGearDialog";
import { EditGearDialog } from "./components/EditGearDialog";
import Link from "next/link";

export default function GearsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [gears, setGears] = useState<Gear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingGear, setEditingGear] = useState<Gear | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [materialFilter, setMaterialFilter] = useState<string | null>(null);

  // Fetch gears for the current user
  const fetchGears = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const records = await pb.collection('gears').getFullList<Gear>({
        filter: `owner = "${user.id}"`,
        sort: 'bore_size,diametral_pitch,name',
      });
      setGears(records);
    } catch (error) {
      console.error('Failed to fetch gears:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/gears');
      return;
    }
    
    if (user) {
      fetchGears();
    }
  }, [user, authLoading, isAuthenticated, router]);

  // Filter and search gears
  const filteredGears = useMemo(() => {
    return gears.filter((gear) => {
      const matchesSearch = searchQuery === "" || 
        gear.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gear.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gear.material.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = !statusFilter || getGearStatus(gear.quantity) === statusFilter;
      const matchesMaterial = !materialFilter || gear.material.toLowerCase() === materialFilter.toLowerCase();
      
      return matchesSearch && matchesStatus && matchesMaterial;
    });
  }, [gears, searchQuery, statusFilter, materialFilter]);

  // Group gears by bore type and size
  const groupedGears = useMemo(() => {
    const groups: Record<string, Gear[]> = {};
    
    filteredGears.forEach((gear) => {
      const key = `${gear.bore_size}_${gear.bore_type}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(gear);
    });
    
    return groups;
  }, [filteredGears]);

  // Get unique materials for filter
  const uniqueMaterials = useMemo(() => {
    return [...new Set(gears.map(g => g.material))];
  }, [gears]);

  const formatBoreLabel = (boreSize: string, boreType: string): string => {
    const typeLabel = boreType.charAt(0).toUpperCase() + boreType.slice(1);
    return `${boreSize}" ${typeLabel}`;
  };

  const getStatusBadge = (quantity: number) => {
    const status = getGearStatus(quantity);
    switch (status) {
      case 'in_stock':
        return <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">In Stock</Badge>;
      case 'few_remaining':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 bg-yellow-500/10">Few Remaining</Badge>;
      case 'out_of_stock':
        return <Badge variant="outline" className="border-red-500/50 text-red-500 bg-red-500/10">Out of Stock</Badge>;
    }
  };

  const handleDeleteGear = async (gearId: string) => {
    try {
      await pb.collection('gears').delete(gearId);
      setGears(gears.filter(g => g.id !== gearId));
    } catch (error) {
      console.error('Failed to delete gear:', error);
    }
  };

  const clearFilters = () => {
    setStatusFilter(null);
    setMaterialFilter(null);
    setSearchQuery("");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">Inventory</Link>
        <ChevronRight size={14} />
        <span className="text-zinc-300">Gears</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Gears</h1>
        <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Gear
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search gear inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-zinc-500"
          />
        </div>
        
        <div className="flex items-center gap-2 ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="gap-2">
                <Settings2 size={16} />
                View Options
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
              <DropdownMenuItem onClick={() => setStatusFilter(null)} className="text-zinc-300">
                Show All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('in_stock')} className="text-green-500">
                In Stock Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('few_remaining')} className="text-yellow-500">
                Few Remaining Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('out_of_stock')} className="text-red-500">
                Out of Stock Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" className="gap-2 ">
                <Filter size={16} />
                Filter
                {(statusFilter || materialFilter) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {(statusFilter ? 1 : 0) + (materialFilter ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 w-48">
              <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500">Material</div>
              <DropdownMenuItem onClick={() => setMaterialFilter(null)} className="text-zinc-300">
                All Materials
              </DropdownMenuItem>
              {uniqueMaterials.map((material) => (
                <DropdownMenuItem 
                  key={material} 
                  onClick={() => setMaterialFilter(material)}
                  className="text-zinc-300"
                >
                  {material}
                </DropdownMenuItem>
              ))}
              {(statusFilter || materialFilter) && (
                <>
                  <div className="my-1 h-px bg-white/10" />
                  <DropdownMenuItem onClick={clearFilters} className="text-red-400">
                    Clear All Filters
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Gear Groups */}
      {Object.keys(groupedGears).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-zinc-800 p-4">
            <Settings2 className="h-8 w-8 text-zinc-500" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-white">No gears found</h3>
          <p className="mb-4 text-sm text-zinc-500">
            {searchQuery || statusFilter || materialFilter 
              ? "Try adjusting your search or filters" 
              : "Get started by adding your first gear"}
          </p>
          {!searchQuery && !statusFilter && !materialFilter && (
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus size={16} />
              Add Your First Gear
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedGears).map(([key, groupGears]) => {
            const [boreSize, boreType] = key.split('_');
            return (
              <div key={key}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <h2 className="text-lg font-medium text-white">
                    {formatBoreLabel(boreSize, boreType)}
                  </h2>
                </div>
                
                <div className="rounded-lg border border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-transparent">
                        <TableHead className="text-zinc-500 w-24">ID</TableHead>
                        <TableHead className="text-zinc-500">Name</TableHead>
                        <TableHead className="text-zinc-500 w-20">Teeth</TableHead>
                        <TableHead className="text-zinc-500 w-28">Material</TableHead>
                        <TableHead className="text-zinc-500 w-32">Status</TableHead>
                        <TableHead className="text-zinc-500 w-16 text-right">Qty</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupGears.map((gear) => (
                        <TableRow key={gear.id} className="border-white/10 hover:bg-white/5">
                          <TableCell className="font-mono text-sm text-zinc-500">
                            G-{gear.id.slice(-4).toUpperCase()}
                          </TableCell>
                          <TableCell className="text-zinc-300">{gear.name}</TableCell>
                          <TableCell className="text-zinc-400">{gear.teeth}</TableCell>
                          <TableCell className="text-zinc-400">{gear.material}</TableCell>
                          <TableCell>{getStatusBadge(gear.quantity)}</TableCell>
                          <TableCell className="text-right text-zinc-300">{gear.quantity}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-white">
                                  <MoreHorizontal size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10">
                                <DropdownMenuItem 
                                  onClick={() => setEditingGear(gear)}
                                  className="text-zinc-300"
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteGear(gear.id)}
                                  className="text-red-400"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Gear Dialog */}
      <AddGearDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onGearAdded={fetchGears}
      />

      {/* Edit Gear Dialog */}
      <EditGearDialog
        gear={editingGear}
        open={!!editingGear}
        onOpenChange={(open: boolean) => !open && setEditingGear(null)}
        onGearUpdated={fetchGears}
      />
    </div>
  );
}
