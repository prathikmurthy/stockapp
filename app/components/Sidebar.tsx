"use client";

import {
  Atom,
  Home,
  FolderOpen,
  Database,
  Settings,
  CircleUserRound,
  LogOut,
  Cog,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import pb from "@/lib/pocketbase";
import Link from "next/link";

const navIcons = [
//   { icon: Home, label: "Home", uri: "/" },
  { icon: Cog, label: "Gears", uri: "/gears" },
//   { icon: FolderOpen, label: "Files", uri: "/files" },
//   { icon: Database, label: "Database", uri: "/database" },
];

export default function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      // Could open a profile menu or navigate to profile page
    } else {
      router.push("/login");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <aside className="sticky left-0 top-0 z-50 flex h-screen w-14 shrink-0 flex-col items-center justify-between border-r border-white/10 bg-black/80 py-4 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center text-zinc-400">
          <Atom size={20} strokeWidth={1.5} />
        </div>

        <div className="h-px w-6 bg-white/10" />

        {navIcons.map(({ icon: Icon, label, uri }) => (
            <Link href={uri} key={label}>
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
                    aria-label={label}
                >
                    <Icon size={20} strokeWidth={1.5} />
                </button>
            </Link>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Settings"
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>

        <div className="h-px w-6 bg-white/10" />

        {isAuthenticated ? (
          <>
            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleProfileClick}
              className="flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden transition-colors hover:ring-2 hover:ring-white/20"
              aria-label="Profile"
              title={user?.email || "Profile"}
            >
              {user?.avatar ? (
                <img
                  src={pb.files.getURL(user, user.avatar, { thumb: '100x100' })}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-xs font-medium text-white">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleProfileClick}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Login"
            title="Login"
          >
            <CircleUserRound size={20} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </aside>
  );
}
