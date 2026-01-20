"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropositaView from "@/components/PropositaView";
import { MessageSquare, Sparkles, LogOut } from "lucide-react";

export default function PropositaPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem("brobot_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoading(false);
    } else {
      // Redirect to home if not logged in
      router.push("/");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-orange-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-black">
      {/* Main Content */}
      <div className="relative flex flex-col h-screen flex-1 max-w-4xl mx-auto px-6 py-4 md:px-8 md:py-6 overflow-hidden">
        {/* Subtle warrior background */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{ backgroundImage: 'url(/logo_brobot.png)' }}
          />
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
          <header className="flex items-center justify-between py-6 mb-8 border-b border-zinc-800/50 backdrop-blur-sm relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-600/5 blur-xl -z-10" />
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-orange-500/30 ring-2 ring-orange-500/20 transform hover:scale-105 transition-transform">
                <img 
                  src="/logo_brobot.png" 
                  alt="Brobot" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <h1 className="text-2xl font-black bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight leading-none">PROPOSITA</h1>
                <p className="text-xs text-zinc-500 font-semibold tracking-wide">Your Commitments. Your Victory.</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Navigation Links */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="group px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-sm font-bold bg-zinc-900/95 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60 hover:border-orange-500/40 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  <span className="hidden sm:inline">Chat</span>
                </button>
                <button
                  onClick={() => router.push("/womanslator")}
                  className="group px-4 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2.5 text-sm font-bold bg-zinc-900/95 backdrop-blur-sm text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800/60 hover:border-orange-500/40 shadow-lg hover:shadow-xl hover:shadow-orange-500/20 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  <span className="hidden sm:inline">Womanslator</span>
                </button>
              </div>
              
              {/* Logout Button - Separated */}
              <div className="h-8 w-px bg-zinc-700/50"></div>
              <button
                onClick={() => {
                  localStorage.removeItem("brobot_user");
                  router.push("/");
                }}
                className="group px-4 py-2.5 bg-zinc-900/95 backdrop-blur-sm text-zinc-400 rounded-xl text-sm font-bold hover:bg-red-900/30 hover:text-red-400 hover:border-red-500/40 transition-all duration-300 border border-zinc-800/60 shadow-lg hover:shadow-xl hover:shadow-red-500/20 hover:scale-105 active:scale-95 flex items-center gap-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <PropositaView userId={user.id} />
          </main>
        </div>
      </div>
    </div>
  );
}


