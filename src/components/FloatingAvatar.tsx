import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const RecruitersEye2026 = () => {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation is now purely CSS-based with pulsing glow instead of movement
    return () => {};
  }, []);

  const handleClick = () => {
    toast({
      title: "The Recruiter's Eye 2026",
      description: "Coming soon",
    });
  };

  return (
    <div
      ref={containerRef}
      className="fixed right-3 sm:right-6 top-12 z-40 group"
      style={{ width: "100px", height: "110px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
    >
      {/* SVG with curved text */}
      <svg
        className="absolute w-20 sm:w-32 h-20 sm:h-32"
        viewBox="0 0 120 120"
        style={{ fill: "none", marginTop: "12px" }}
      >
        <defs>
          <path
            id="topCircle"
            d="M 20, 60 A 40, 40 0 0, 1 100, 60"
            fill="none"
          />
          <path
            id="bottomCircle"
            d="M 100, 60 A 40, 40 0 0, 1 20, 60"
            fill="none"
          />
        </defs>
        <text
          className="font-bold"
          style={{ fill: "#000000", fontSize: "9px", fontFamily: "Poppins, sans-serif", fontWeight: "700" }}
          letterSpacing="-0.1"
        >
          <textPath href="#topCircle" startOffset="50%" textAnchor="middle">
            the recruiter's eye
          </textPath>
        </text>
      </svg>

      {/* Center button */}
      <button
        onClick={handleClick}
        className="transition-all hover:scale-125 active:scale-95 focus:outline-none relative z-10 animate-pulse"
        aria-label="The Recruiter's Eye 2026"
      >
        {/* Outer glow ring - always visible */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-logo-blue to-logo-gold opacity-80 group-hover:opacity-100 transition-opacity blur-2xl w-8 sm:w-12 h-8 sm:h-12 animate-pulse" />

        {/* Second glow layer for more prominence */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-logo-gold/50 to-logo-blue/50 blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />

        {/* Main button background */}
        <div className="relative w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gradient-to-br from-logo-blue/40 to-logo-gold/40 border-2 sm:border-3 border-logo-gold shadow-2xl hover:shadow-3xl hover:border-logo-gold transition-all flex items-center justify-center group-hover:from-logo-blue/50 group-hover:to-logo-gold/50">
          {/* Icon */}
          <div className="relative flex items-center justify-center">
            <Eye className="w-3 sm:w-4 h-3 sm:h-4 text-logo-blue drop-shadow-lg" />

            {/* Animated pulse accent */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-logo-gold/40 to-logo-blue/40 animate-pulse opacity-30" />
          </div>

          {/* Corner accent dots */}
          <div className="absolute top-0.5 right-0.5 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-logo-gold" />
          <div className="absolute bottom-0.5 left-0.5 w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-logo-blue/60" />
        </div>
      </button>

      {/* Year label below eye */}
      <div className="absolute text-center" style={{ top: "70px" }}>
        <p className="text-[10px] sm:text-[13px] font-black text-logo-gold">2026</p>
      </div>
    </div>
  );
};

export default RecruitersEye2026;
