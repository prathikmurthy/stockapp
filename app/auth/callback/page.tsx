"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser, isAuthenticated } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // PocketBase handles the OAuth callback automatically via the SDK
        // The authWithOAuth2 method opens a popup that handles the callback
        // This page is mainly for manual redirect flows or error handling
        
        // Give a moment for auth state to update
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        refreshUser();
        
        if (isAuthenticated) {
          setStatus("success");
          setMessage("Authentication successful! Redirecting...");
          setTimeout(() => router.push("/"), 1500);
        } else {
          // Check if we have auth data in the URL (for redirect flow)
          const params = new URLSearchParams(window.location.search);
          const code = params.get("code");
          
          if (code) {
            setStatus("success");
            setMessage("Authentication successful! Redirecting...");
            setTimeout(() => router.push("/"), 1500);
          } else {
            setStatus("error");
            setMessage("Authentication failed. Please try again.");
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("An error occurred during authentication.");
      }
    };

    handleCallback();
  }, [router, refreshUser, isAuthenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="rounded-xl border border-white/10 bg-black/60 p-8 backdrop-blur-sm">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-zinc-400" />
              <p className="mt-4 text-zinc-400">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-4 text-green-400">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-4 text-red-400">{message}</p>
              <button
                onClick={() => router.push("/login")}
                className="mt-6 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
