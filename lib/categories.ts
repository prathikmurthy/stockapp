import {
  Cog,
  Zap,
  Link as LinkIcon,
  Disc,
  RefreshCw,
} from "lucide-react";

export const PART_CATEGORIES = [
  { id: 'gears', title: 'Gears', icon: Cog, pattern: 'grid' as const, accentColor: 'blue', href: '/gears' },
  { id: 'belts', title: 'Belts', icon: LinkIcon, pattern: 'lines' as const, accentColor: 'purple', href: '/gears' },
  { id: 'sprockets', title: 'Sprockets', icon: Cog, pattern: 'dots' as const, accentColor: 'amber', href: '/gears' },
  { id: 'pulleys', title: 'Pulleys', icon: Disc, pattern: 'dots' as const, accentColor: 'emerald', href: '/gears' },
  { id: 'motors', title: 'Motors', icon: Zap, pattern: 'grid' as const, accentColor: 'rose', href: '/gears' },
  { id: 'bearings', title: 'Bearings', icon: RefreshCw, pattern: 'lines' as const, accentColor: 'cyan', href: '/gears' },
] as const;

export type CategoryType = typeof PART_CATEGORIES[number];
