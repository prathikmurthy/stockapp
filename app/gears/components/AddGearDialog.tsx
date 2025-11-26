"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import pb from "@/lib/pocketbase";
import { GearFormData, BORE_TYPES } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AddGearDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGearAdded: () => void;
}


const COMMON_BORE_SIZES = [
  '1/4', '3/8', '1/2', '5/8', '3/4', '7/8',
  '.500', '.625', '.750', '.875', '1.000', '1.125', '1.250'
];

const COMMON_MATERIALS = [
  'Aluminum', 'Steel', 'Brass', 'Delrin', 'Nylon', 'Titanium'
];

const COMMON_DIAMETRAL_PITCHES = [20, 24, 32, 48, 64, 72, 96];

export function AddGearDialog({ open, onOpenChange, onGearAdded }: AddGearDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GearFormData>({
    name:   '',
    bore_type: 'hex',
    bore_size: '1/2',
    diametral_pitch: 20,
    teeth: 48,
    material: 'Aluminum',
    quantity: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await pb.collection('gears').create({
        ...formData,
        owner: user.id,
      });

      onGearAdded();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        bore_type: 'hex',
        bore_size: '1/2',
        diametral_pitch: 20,
        teeth: 48,
        material: 'Aluminum',
        quantity: 1,
      });
    } catch (err: any) {
      const message = err?.data?.message || err?.message || 'Failed to create gear. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Gear</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., 48T Aluminum 1/2&quot; Hex Bore Spur Gear"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/40 border-white/10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bore_type">Bore Type</Label>
              <Select
                value={formData.bore_type}
                onValueChange={(value: GearFormData['bore_type']) => 
                  setFormData({ ...formData, bore_type: value })
                }
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {BORE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bore_size">Bore Size</Label>
              <Select
                value={formData.bore_size}
                onValueChange={(value) => setFormData({ ...formData, bore_size: value })}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {COMMON_BORE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}"
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diametral_pitch">Diametral Pitch</Label>
              <Select
                value={formData.diametral_pitch.toString()}
                onValueChange={(value) => 
                  setFormData({ ...formData, diametral_pitch: parseInt(value) })
                }
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {COMMON_DIAMETRAL_PITCHES.map((dp) => (
                    <SelectItem key={dp} value={dp.toString()}>
                      {dp} DP
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teeth">Number of Teeth</Label>
              <Input
                id="teeth"
                type="number"
                min={1}
                value={formData.teeth}
                onChange={(e) => setFormData({ ...formData, teeth: parseInt(e.target.value) || 0 })}
                className="bg-black/40 border-white/10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Select
                value={formData.material}
                onValueChange={(value) => setFormData({ ...formData, material: value })}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {COMMON_MATERIALS.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={0}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="bg-black/40 border-white/10"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Gear'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
