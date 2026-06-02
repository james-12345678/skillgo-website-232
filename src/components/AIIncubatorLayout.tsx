import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

interface AIIncubatorLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const AIIncubatorLayout = ({ children, activeTab = "home", onTabChange }: AIIncubatorLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({ title: "Logged out successfully" });
    navigate("/signin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white font-poppins text-slate-900 overflow-x-hidden">
      {/* Minimal Header */}
      <header className="border-b-2 border-slate-100 sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-logo-gold/20 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 h-12 sm:h-16 flex items-center justify-between relative">
          <Link to="/home" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img
              src="/skillgo-logo.svg"
              alt="SkillGo"
              className="h-10 sm:h-14 object-contain"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-8">
            <button
              onClick={() => onTabChange?.("home")}
              className={`pb-2 px-2 font-semibold transition-colors text-xs sm:text-sm ${
                activeTab === "home"
                  ? "text-logo-gold border-b-2 border-logo-gold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onTabChange?.("curriculum")}
              className={`pb-2 px-2 font-semibold transition-colors text-xs sm:text-sm ${
                activeTab === "curriculum"
                  ? "text-logo-gold border-b-2 border-logo-gold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => onTabChange?.("incubation")}
              className={`pb-2 px-2 font-semibold transition-colors text-xs sm:text-sm ${
                activeTab === "incubation"
                  ? "text-logo-gold border-b-2 border-logo-gold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Incubation
            </button>
          </div>

          <div className="flex items-center gap-4 sm:gap-12">
            <div className="hidden sm:flex flex-col items-center gap-2 -mt-2 group relative">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-logo-gold flex items-center justify-center font-bold text-sm text-white shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-105 group-focus-within:scale-105"
                aria-label={user?.name || "User"}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              <div className="absolute top-full right-0 mt-2 opacity-0 pointer-events-none translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 z-50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 rounded-full border-logo-gold/30 px-4 text-xs font-semibold !bg-logo-gold !text-white shadow-md hover:!bg-logo-blue hover:shadow-logo-gold/20 whitespace-nowrap"
                >
                  Logout
                </Button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
        {children}
      </main>

      <Toaster />
    </div>
  );
};

export default AIIncubatorLayout;
