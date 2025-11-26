"use client";

import { useState, useEffect } from "react";
import pb from "@/lib/pocketbase";
import { Gear, GearFormData, BORE_TYPES } from "@/lib/types";
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

interface EditGearDialogProps {
  gear: Gear | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGearUpdated: () => void;
}


const COMMON_BORE_SIZES = [
  '1/4', '3/8', '1/2', '5/8', '3/4', '7/8',
  '.500', '.625', '.750', '.875', '1.000', '1.125', '1.250'
];

const COMMON_MATERIALS = [
  'Aluminum', 'Steel', 'Brass', 'Delrin', 'Nylon', 'Titanium'
];

const COMMON_DIAMETRAL_PITCHES = [20, 24, 32, 48, 64, 72, 96];

export function EditGearDialog({ gear, open, onOpenChange, onGearUpdated }: EditGearDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<GearFormData>({
    name: '',
    bore_type: 'hex',
    bore_size: '1/2',
    diametral_pitch: 20,
    teeth: 48,
    material: 'Aluminum',
    quantity: 1,
  });

  // Update form when gear changes
  useEffect(() => {
    if (gear) {
      setFormData({
        name: gear.name,
        bore_type: gear.bore_type,
        bore_size: gear.bore_size,
        diametral_pitch: gear.diametral_pitch,
        teeth: gear.teeth,
        material: gear.material,
        quantity: gear.quantity,
      });
    }
  }, [gear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gear) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await pb.collection('gears').update(gear.id, formData);

      onGearUpdated();
      onOpenChange(false);
    } catch (err) {
      console.error('Failed to update gear:', err);
      setError('Failed to update gear. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Gear</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              placeholder="e.g., 48T Aluminum 1/2&quot; Hex Bore Spur Gear"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/40 border-white/10"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-bore_type">Bore Type</Label>
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
              <Label htmlFor="edit-bore_size">Bore Size</Label>
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
              <Label htmlFor="edit-diametral_pitch">Diametral Pitch</Label>
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
              <Label htmlFor="edit-teeth">Number of Teeth</Label>
              <Input
                id="edit-teeth"
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
              <Label htmlFor="edit-material">Material</Label>
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
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
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
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
